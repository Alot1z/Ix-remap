#!/usr/bin/env node
/**
 * API-reference parity gate for docs/api.
 *
 * docs/api/README.md claims the reference is generated from the client source.
 * This check makes that claim machine-enforced: every endpoint the client
 * actually calls (ix-cli/src/client/api.ts) must be documented in
 * docs/api/openapi.yaml, and every documented endpoint must be called by the
 * client — otherwise the reference has drifted and the two directions are
 * reported separately, each item named:
 *
 *   - a client call with no openapi path/method      -> fail, named
 *   - a documented endpoint the client never calls   -> fail, named (stale)
 *
 * The visualizer proxy (ix-cli/src/cli/commands/view.ts) forwards every
 * /v1/* request to the backend and defines no endpoints of its own, so the
 * client surface is the complete source of truth for the reference.
 *
 * Paths are normalized on both sides before comparing: query strings are
 * dropped and `{name}` / `${name}` parameter slots are collapsed to `{p}`, so
 * `/v1/entity/${id}` matches the reference's `/v1/entity/{id}` regardless of
 * the parameter name.
 *
 *   node scripts/check-api-parity.mjs          # default paths, from ix-cli/
 *   node scripts/check-api-parity.mjs --api P  # explicit api.ts path (testing)
 *   node scripts/check-api-parity.mjs --doc P  # explicit openapi.yaml path
 *
 * Exit 0 = parity; 1 = gaps listed on stdout.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..", "..");
const apiDefault = join(here, "..", "src", "client", "api.ts");
const docDefault = join(repoRoot, "docs", "api", "openapi.yaml");

const flagIndex = (name) => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const apiPath = flagIndex("--api") ?? apiDefault;
const docPath = flagIndex("--doc") ?? docDefault;

for (const [label, p] of [["api.ts", apiPath], ["openapi.yaml", docPath]]) {
  if (!existsSync(p)) {
    process.stderr.write(`check-api-parity: ${label} not found at ${p}\n`);
    process.exit(1);
  }
}

const apiSrc = readFileSync(apiPath, "utf8");
const docSrc = readFileSync(docPath, "utf8");

// Normalize a raw path token to a comparable key. A `${...}` slot is a real
// path parameter only when it sits directly after a `/` (`/v1/entity/${id}`);
// interpolations appended to a segment name (`/v1/patches${qs ? ...}`) build
// query text and the token is cut at the slot. `{name}` braces (the doc side)
// and real parameter slots collapse to `{p}`, and any remaining `?...` query
// is dropped.
const normalize = (raw) =>
  raw
    .replace(/(?<!\/)\$\{[^}]*.*$/, "") // query-builder interpolation: cut the token
    .replace(/(\/)\$\{[^}]*\}/g, "$1{p}") // real path parameter: collapse to {p}
    .replace(/\{[^}]*\}/g, "{p}") // doc-side braces: collapse to {p}
    .split("?")[0];

// --- Documented surface (openapi.yaml) -------------------------------------
// Paths are two-space-indented (`  /v1/health:`); methods are four-space
// (`    get:`). Both are line-shaped in this reference, so a scan is exact.
const documented = new Set();
{
  let current = null;
  for (const line of docSrc.split(/\r?\n/)) {
    const path = line.match(/^  (\/[^: ]+):\s*$/);
    if (path) {
      current = normalize(path[1]);
      continue;
    }
    const method = line.match(/^    (get|post|put|delete|patch|head|options):\s*$/);
    if (method && current) documented.add(`${method[1].toUpperCase()} ${current}`);
  }
}

// --- Client surface (api.ts) ------------------------------------------------
const calls = new Set();
const add = (method, raw) => calls.add(`${method} ${normalize(raw)}`);

// `this.get("...")` / `this.post(`/v1/...`)` — the path argument is always on
// the same line as the call (including ternary forms like
// `this.post(qs ? \`/v1/smells?${qs}\` : "/v1/smells", {})`, which yield two
// tokens that normalize to the same key). Tokens are taken from the raw line:
// normalize() tells a real path parameter (`/v1/entity/${id}`) from a
// query-builder interpolation appended to a segment (`/v1/patches${qs ? ...}`).
// The generic form `this.get<CapabilitiesResponse>("...")` is handled too.
// One call (`resolve-prefix`) puts the path on the line after the call, so
// when a call line carries no path, the next few lines are scanned.
const apiLinesForCalls = apiSrc.split(/\r?\n/);
for (let i = 0; i < apiLinesForCalls.length; i++) {
  const call = apiLinesForCalls[i].match(/this\.(get|post|put|delete|patch)(?:<[^>]*>)?\(/);
  if (!call) continue;
  const method = call[1].toUpperCase();
  let tokens = [...apiLinesForCalls[i].matchAll(/\/v1[^\s"'`]*/g)].map((t) => t[0]);
  for (let k = 1; tokens.length === 0 && i + k < apiLinesForCalls.length && k <= 2; k++) {
    tokens = [...apiLinesForCalls[i + k].matchAll(/\/v1[^\s"'`]*/g)].map((t) => t[0]);
  }
  for (const token of tokens) add(method, token);
}

// Direct `fetch(\`${this.endpoint}/v1/...\`, { method: "POST", ... })` calls —
// the method option may sit on the line after the fetch (ingest, patch, map,
// patches/bulk), or on the same line (reset/status, savings DELETE). Look a
// bounded window ahead for it; default GET.
const apiLines = apiSrc.split(/\r?\n/);
for (let i = 0; i < apiLines.length; i++) {
  const fetch = apiLines[i].match(/fetch\(\s*[`'"]\$\{this\.endpoint\}(\/v1[^`'"]*)[`'"]/);
  if (!fetch) continue;
  let method = "GET";
  for (let j = i; j < Math.min(i + 5, apiLines.length); j++) {
    const m = apiLines[j].match(/method:\s*["'](\w+)["']/);
    if (m) {
      method = m[1].toUpperCase();
      break;
    }
  }
  add(method, fetch[1]);
}

// `runReset(asyncPath, syncPath, ...)` posts to both paths; the sync leg goes
// through a `fetch(\`${this.endpoint}${syncPath}\`)` whose path is a variable,
// so the two literal arguments here are the only statically visible form.
for (const m of apiSrc.matchAll(/this\.runReset\(\s*"([^"]+)",\s*"([^"]+)"/g)) {
  add("POST", m[1]);
  add("POST", m[2]);
}

// --- Compare both directions -------------------------------------------------
const missing = []; // client calls the endpoint, the reference does not list it
const stale = []; // reference lists the endpoint, the client never calls it
for (const key of [...calls].sort()) {
  if (!documented.has(key)) missing.push(key);
}
for (const key of [...documented].sort()) {
  if (!calls.has(key)) stale.push(key);
}

if (missing.length === 0 && stale.length === 0) {
  console.log(
    `check-api-parity: ${documented.size} documented, ${calls.size} called — ` +
      `parity with docs/api/openapi.yaml`,
  );
  process.exit(0);
}

for (const key of missing) console.log(`undocumented endpoint: ${key}`);
for (const key of stale) console.log(`stale doc entry: ${key}`);
console.log(
  `check-api-parity: ${missing.length} undocumented, ${stale.length} stale — ` +
    `fix ${docPath}`,
);
process.exit(1);