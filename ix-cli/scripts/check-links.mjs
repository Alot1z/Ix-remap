#!/usr/bin/env node
// check-links.mjs — verify every reference in the repo's markdown:
//   * absolute URLs resolve (fail on 404/410),
//   * relative links point at a tracked file (fail when the file is renamed
//     or removed — same breakage class as a dead URL).
// Zero dependencies (Node 22+ global fetch). Mirror of the api-parity gate:
// same shape, same exit discipline — `ok` is not assumed, it is measured.
//
// Classification:
//   2xx/3xx                      OK
//   404/410 (or missing file)    ERROR — fails the gate
//   other 4xx/5xx                warning (usually bot-blocking, e.g.
//                                desktop.docker.com answers 403 to anything
//                                without a browser)
//   network failure              warning (flaky CI network; not a fact)
//
// Skipped: fenced code blocks (illustrative URLs are not references),
// localhost/127.0.0.1/0.0.0.0 (dev servers), mailto:, #anchors.
//
// Allowlist: only links known-dead with a tracked replacement. Keys are
// normalized through the same URL normalization the extractor uses, so a
// trailing-slash variant of an allowed URL cannot false-fail. An allow entry
// that no longer appears in any scanned file is itself an ERROR — a stale
// allowlist must not rot silently.
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const ALLOW = new Map([
  // Dead repo link in CONTRIBUTING.md; open PR #582 removes it. Drop this
  // entry when #582 merges — the gate will fail on the unused entry if not.
  ['https://github.com/ix-infrastructure/ix-memory-layer', '#582 replaces this URL'],
  // Dead Docs nav link in README.md; open PR #589 points it at the in-repo
  // docs. Drop this entry when #589 merges — same self-cleaning rule.
  ['https://www.ix-infra.com/docs', '#589 points it at the in-repo docs'],
]);

const SKIP_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1']);
const TIMEOUT_MS = 10000;

// One normalization owner: both the allowlist keys and the extracted URLs go
// through this, so `…/docs` and `…/docs/` are the same reference (GitHub
// treats them as one page). A single trailing slash is stripped; the root
// keeps its slash.
const normUrl = (u) => {
  const h = new URL(u).href;
  return h.endsWith('/') && new URL(h).pathname !== '/' ? h.slice(0, -1) : h;
};
const ALLOW_NORM = new Map([...ALLOW].map(([k, reason]) => [normUrl(k), reason]));

function trackedFiles() {
  return execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split(/\r?\n/).filter(Boolean);
}

// Prose only: drop fenced code blocks (``` and ~~~), whose URLs are
// illustrations, not references.
function proseOf(text) {
  const out = [];
  let fence = null;
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*(```|~~~)/);
    if (m) { fence = fence === m[1] ? null : m[1]; continue; }
    if (!fence) out.push(line);
  }
  return out.join('\n');
}

function extractUrls(text) {
  const re = /https?:\/\/[^\s)<>"'\]]+/g;
  const out = new Set();
  for (const m of text.matchAll(re)) {
    let u = m[0].replace(/[.,;:!?]+$/, '');
    try { u = new URL(u).href; } catch { continue; }
    if (SKIP_HOSTS.has(new URL(u).hostname)) continue;
    out.add(u);
  }
  return [...out];
}

// Relative markdown link targets: `[text](path)` and `[ref]: path`.
function extractRelativeTargets(text) {
  const targets = [];
  for (const m of text.matchAll(/\]\(([^)]+)\)/g)) {
    const t = m[1].trim();
    if (isExternal(t) || t.startsWith('#')) continue;
    targets.push(t);
  }
  for (const m of text.matchAll(/^\[[^\]]*\]:\s*(\S+)/gm)) {
    const t = m[1].replace(/^<|>$/g, '').trim();
    if (isExternal(t) || t.startsWith('#')) continue;
    targets.push(t);
  }
  return targets;
}
function isExternal(t) {
  return !t || t.startsWith('//') || t.startsWith('/') || /^[a-z][a-z0-9+.-]*:/i.test(t);
}

async function probe(url) {
  // HEAD first; a 405 means the server rejects HEAD, so retry GET once.
  const attempt = async (method) => {
    try {
      const r = await fetch(url, { method, redirect: 'follow', signal: AbortSignal.timeout(TIMEOUT_MS) });
      return { status: r.status, network: false };
    } catch (e) {
      return { status: 0, network: true, error: String(e.cause?.code || e.message) };
    }
  };
  let res = await attempt('HEAD');
  if (res.status === 405) res = await attempt('GET');
  return res;
}

const allFiles = trackedFiles();
const mdFiles = allFiles.filter((f) => f.endsWith('.md'));
const allSet = new Set(allFiles);
const allLower = new Set(allFiles.map((f) => f.toLowerCase()));

function targetExists(target, file) {
  let t = target.split('#')[0].split('?')[0];
  if (!t) return true; // pure anchor
  let resolved;
  try {
    resolved = path.posix.normalize(path.posix.join(path.posix.dirname(file), decodeURIComponent(t)));
  } catch { return true; } // malformed escape — leave to a link checker that parses
  if (allSet.has(resolved) || allLower.has(resolved.toLowerCase())) return true;
  // A directory target is fine if any tracked file lives under it.
  const prefix = resolved.endsWith('/') ? resolved : resolved + '/';
  return [...allLower].some((f) => f.startsWith(prefix.toLowerCase()));
}

const errors = [];
const warnings = [];
let checked = 0;
let allContent = '';

for (const file of mdFiles) {
  let text;
  try { text = await readFile(file, 'utf8'); } catch { warnings.push(`cannot read ${file}`); continue; }
  allContent += text + '\n';
  const prose = proseOf(text);

  for (const url of extractUrls(prose)) {
    checked++;
    const res = await probe(url);
    const allowed = ALLOW_NORM.has(normUrl(url));
    if ((res.status === 404 || res.status === 410) && !allowed) {
      errors.push(`${url} (in ${file})`);
    } else if (res.network || (res.status >= 400 && !allowed)) {
      warnings.push(`${url} — ${res.network ? `network: ${res.error}` : `HTTP ${res.status}`} (in ${file})`);
    }
  }

  for (const target of extractRelativeTargets(prose)) {
    checked++;
    if (!targetExists(target, file)) {
      errors.push(`${target} (relative, in ${file})`);
    }
  }
}

// Allowlist must justify itself: an entry that matches nothing is stale.
for (const [url] of ALLOW) {
  if (!allContent.includes(url)) {
    errors.push(`stale allowlist entry ${url} no longer appears in any scanned file — remove it (${ALLOW.get(url)})`);
  }
}

for (const e of errors) console.log(`ERROR  ${e}`);
for (const w of warnings) console.log(`warn   ${w}`);
console.log(`checked ${checked} references — ${errors.length} broken, ${warnings.length} warnings`);
process.exit(errors.length === 0 ? 0 : 1);