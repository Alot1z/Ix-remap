#!/usr/bin/env node
// check-links.mjs — probe every external URL in the repo's markdown and fail on
// dead links (HTTP 404/410), so a link that no longer resolves cannot merge.
// Zero dependencies (Node 22+ global fetch). Mirror of the api-parity gate:
// same shape, same exit discipline — `ok` is not assumed, it is measured.
//
// Classification:
//   2xx/3xx          OK
//   404/410          ERROR (dead link — fails the gate)
//   other 4xx/5xx    warning (usually bot-blocking, e.g. desktop.docker.com
//                    answers 403 to anything without a browser)
//   network failure  warning (flaky CI network; not a dead-link fact)
//
// Skipped: localhost/127.0.0.1/0.0.0.0 (dev servers), mailto:, #anchors.
//
// Allowlist: only for links that are known-dead with a tracked replacement.
// An allow entry that no longer appears in any scanned file is itself an
// ERROR — a stale allowlist must not rot silently.
import { execFileSync } from 'node:child_process';

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

function trackedMarkdown() {
  const out = execFileSync('git', ['ls-files', '*.md'], { encoding: 'utf8' });
  return out.split(/\r?\n/).filter((f) =>
    f && !f.includes('node_modules') && !f.includes('__tests__')
  );
}

// Extract URLs from markdown text. Handles `[text](url)`, bare URLs and
// <>-wrapped URLs; strips trailing punctuation that is not part of the URL.
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

async function probe(url) {
  // HEAD first; some servers reject HEAD (405/403) but answer GET.
  const attempt = async (method) => {
    try {
      const r = await fetch(url, { method, redirect: 'follow', signal: AbortSignal.timeout(TIMEOUT_MS) });
      return { status: r.status, network: false };
    } catch (e) {
      return { status: 0, network: true, error: String(e.cause?.code || e.message) };
    }
  };
  let res = await attempt('HEAD');
  if (res.status === 405 || res.status === 403) res = await attempt('GET');
  return res;
}

const files = trackedMarkdown();
const errors = [];
const warnings = [];
let checked = 0;
let allContent = '';

for (const file of files) {
  let text;
  try {
    text = await import('node:fs/promises').then((fs) => fs.readFile(file, 'utf8'));
  } catch { warnings.push(`cannot read ${file}`); continue; }
  allContent += text + '\n';
  const urls = extractUrls(text);
  for (const url of urls) {
    checked++;
    const res = await probe(url);
    if ((res.status === 404 || res.status === 410) && !ALLOW.has(url)) {
      errors.push(`${url} (in ${file})`);
    } else if (res.network || (res.status >= 400 && !ALLOW.has(url))) {
      warnings.push(`${url} — ${res.network ? `network: ${res.error}` : `HTTP ${res.status}`} (in ${file})`);
    }
  }
}

// Allowlist must justify itself: an entry that matches nothing is stale.
for (const [url] of ALLOW) {
  if (!allContent.includes(url)) {
    errors.push(`stale allowlist entry ${url} no longer appears in any scanned file — remove it (${ALLOW.get(url)})`);
  }
}

const out = { ok: errors.length === 0, checked, errors, warnings };
if (process.argv.includes('--json')) {
  console.log(JSON.stringify(out, null, 2));
} else {
  for (const e of errors) console.log(`ERROR  ${e}`);
  for (const w of warnings) console.log(`warn   ${w}`);
  console.log(`checked ${checked} URLs — ${errors.length} dead, ${warnings.length} warnings`);
}
process.exit(out.ok ? 0 : 1);