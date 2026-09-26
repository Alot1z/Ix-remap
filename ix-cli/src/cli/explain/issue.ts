// Copyright 2026 Ix Infrastructure Inc.

import { readFileSync } from "node:fs";
import { posix } from "node:path";

import { isTestPath } from "./related-files.js";
import { resolveToken, type RepoAccess } from "./text-references.js";

/**
 * From an issue's text to the files its fix starts in, for
 * `ix context --from-issue`.
 *
 * Measured on SWE-PolyBench (28 fresh instances, not used while building
 * this): resolving the code names an issue mentions to their definitions put
 * a changed file in the top five 0.600 of the time, against 0.485 for BM25
 * over the repository. But a graph-expanded bundle, ranked by graph distance,
 * lost to BM25 at equal size (0.57 against 0.67). So the ranking here is
 * lexical first: the resolved starting files lead, BM25 against the issue
 * orders the rest, and graph closeness to a starting point only breaks ties
 * and nudges.
 *
 * Starting points, most specific first:
 *
 *  1. file paths the issue names, resolved against the tracked files;
 *  2. multi-part identifiers -- `newJsonWriter`, `save_model`, `GsonBuilder`
 *     -- from backticks or running text. A multi-part name is almost always a
 *     code name;
 *  3. single backticked words of four letters or more. `save` was the right
 *     start for a keras fix; `flex`, `code` and `version` were not, which is
 *     why a single word counts only in backticks, and only after the rest.
 *
 * A name resolves only to an exact-name definition in source code. The first
 * pilot run started from a CSS output file, a changelog, test fixtures, and an
 * import: `borderStylesReset` resolved to the file that imported it, because
 * the graph's `module` entity for an import is located in the importing file.
 */

/** Starting points a bundle is built from. */
export const MAX_STARTS = 3;
/** Candidate names looked up, in order. */
export const MAX_CANDIDATES = 25;
/** Files larger than this are not scored: generated, bundled or data. */
export const MAX_BM25_BYTES = 200 * 1024;
/** Ranked files carried in the JSON bundle. */
export const MAX_RANKED_FILES = 20;
/**
 * How much being next to a starting point is worth, as a fraction of a file's
 * BM25 score. Small on purpose: on the benchmark, graph order lost to BM25 at
 * equal size, so closeness may reorder files the text scores alike and may
 * not overturn a clear lexical lead.
 */
export const CLOSENESS_BOOST = 0.1;

/** Extensions of files a fix edits. */
const CODE_EXTENSIONS = [
  "ts", "tsx", "mts", "cts", "js", "jsx", "mjs", "cjs", "py", "java", "svelte", "vue", "go", "rs",
  "kt", "kts", "scala", "rb", "php", "cs", "c", "h", "cc", "cpp", "hpp", "swift",
];
const CODE_FILE = new RegExp(`\\.(?:${CODE_EXTENSIONS.join("|")})$`);

/**
 * Not code a fix edits: tests, test data, samples, docs, vendored or built
 * output. The pilot's list, plus what `isTestPath` already knows.
 */
const NOISE = new RegExp(
  "(^|/)(__tests__|tests?|spec|specs|fixtures?|__fixtures__|test-fixtures|samples|examples?|vendor|"
  + "third_party|node_modules|dist|build|coverage|docs?|changelog_unreleased)/"
  + "|\\.(test|spec)\\.[^/]+$|\\.min\\.js$|(^|/)test_[^/]+\\.py$|_test\\.(py|go)$",
);

/** Source code a fix would edit: a code file that is not a test, fixture, doc or build output. */
export function isSourcePath(path: string): boolean {
  return CODE_FILE.test(path) && !NOISE.test(path) && !isTestPath(path);
}

// A path-like token with a code extension: `saving_api.py`, `src/a/index.ts`.
const PATH = new RegExp(
  `(?<![\\w/])((?:[\\w.-]+/)*[\\w.-]+\\.(?:${CODE_EXTENSIONS.join("|")}))\\b`, "g");
const BACKTICK = /`([^`\n]{2,80})`/g;
const WORD = /[A-Za-z_][A-Za-z0-9_]{2,}/g;
// camelCase, PascalCase with two or more parts, snake_case, SCREAMING_SNAKE.
const IDENT_SOURCE =
  "(?:[A-Z][a-z0-9]+(?:[A-Z][a-z0-9]*)+|[a-z]+(?:[A-Z][a-z0-9]*)+|[a-z0-9]+(?:_[a-z0-9]+)+|[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+)";
const IDENT = new RegExp(`\\b${IDENT_SOURCE}\\b`, "g");
const IDENT_FULL = new RegExp(`^${IDENT_SOURCE}$`);

export interface IssueCandidates {
  /** Path-like tokens, in the order the issue names them. */
  paths: string[];
  /** Code names: multi-part first, then single backticked words. */
  identifiers: string[];
}

/** The paths and code names an issue mentions, most specific first. */
export function extractCandidates(text: string): IssueCandidates {
  const paths = unique([...text.matchAll(PATH)].map((m) => m[1]));
  // A path's own parts are not names in the issue: `saving_api` in
  // `saving/saving_api.py` is the path again, not a function.
  const prose = text.replace(PATH, " ");
  const inTicks = [...prose.matchAll(BACKTICK)].flatMap((m) => [...m[1].matchAll(WORD)].map((w) => w[0]));
  const multi = [...inTicks, ...[...prose.matchAll(IDENT)].map((m) => m[0])].filter((t) => IDENT_FULL.test(t));
  const single = inTicks.filter((t) => !IDENT_FULL.test(t) && t.length >= 4);
  const seen = new Set(paths);
  const identifiers: string[] = [];
  for (const token of [...multi, ...single]) {
    if (seen.has(token)) continue;
    seen.add(token);
    identifiers.push(token);
  }
  return { paths, identifiers: identifiers.slice(0, MAX_CANDIDATES) };
}

/** One search hit, as the starting-point picker needs it. */
export interface SymbolHit {
  id: string;
  name: string;
  kind: string;
  path?: string;
  lineStart?: number;
  lineEnd?: number;
}

export type StartVia = "path in issue" | "identifier in issue" | "bm25 fallback";

export interface StartingPoint {
  /** What the issue said: the path or name as written. */
  token: string;
  /** The graph node, when known. A path start may have none. */
  id?: string;
  name: string;
  kind: string;
  path: string;
  lineStart?: number;
  lineEnd?: number;
  via: StartVia;
}

/** Kinds a definition has, most navigable first. Anything else ranks after. */
const DEFINITION_KINDS = [
  "class", "interface", "trait", "struct", "enum", "type", "object", "function", "method",
  "constant", "variable", "property", "field",
];
/** Never a definition: an import (located in the importer), a chunk, a file. */
const NOT_DEFINITIONS = new Set(["module", "chunk", "file"]);

function kindRank(kind: string): number {
  const i = DEFINITION_KINDS.indexOf(kind.toLowerCase());
  return i === -1 ? DEFINITION_KINDS.length : i;
}

export interface PickDeps {
  /** Tracked files, repository-relative. Empty outside a git checkout. */
  files: string[];
  /** The symbol index: the search `ix search` runs. */
  search: (name: string) => Promise<SymbolHit[]>;
  /**
   * How well a file matches the issue's text. Breaks a tie between two
   * definitions of one name -- `renderRow` in `table.ts` and in `grid.ts` --
   * in favour of the one the issue reads like.
   */
  fileScore?: (path: string) => number;
}

/**
 * Up to `max` starting points, first found wins, one per file; and the
 * candidates that resolved to nothing. Candidates after the last start are
 * not looked up, and not reported as unresolved.
 */
export async function pickStartingPoints(
  text: string,
  deps: PickDeps,
  max = MAX_STARTS,
): Promise<{ starts: StartingPoint[]; unresolved: string[] }> {
  const { paths, identifiers } = extractCandidates(text);
  const starts: StartingPoint[] = [];
  const unresolved: string[] = [];
  const taken = (path: string) => starts.some((s) => s.path === path);

  const tracked = new Set(deps.files);
  const byBasename = new Map<string, string[]>();
  for (const file of deps.files) {
    const base = posix.basename(file);
    byBasename.set(base, [...(byBasename.get(base) ?? []), file]);
  }
  for (const token of paths) {
    if (starts.length >= max) return { starts, unresolved };
    const path = resolveToken(token, "", tracked, byBasename);
    if (!path || !isSourcePath(path)) {
      unresolved.push(token);
      continue;
    }
    if (!taken(path)) starts.push({ token, name: posix.basename(path), kind: "file", path, via: "path in issue" });
  }

  const score = deps.fileScore ?? (() => 0);
  for (const token of identifiers) {
    if (starts.length >= max) break;
    // Not caught: a backend that cannot answer is an error to report, not an
    // issue that names nothing.
    const hits = (await deps.search(token))
      .filter((h): h is SymbolHit & { path: string } =>
        h.name === token && !!h.path && !NOT_DEFINITIONS.has(h.kind.toLowerCase()) && isSourcePath(h.path))
      .sort((a, b) =>
        kindRank(a.kind) - kindRank(b.kind) || score(b.path) - score(a.path) || cmp(a.path, b.path));
    if (hits.length === 0) {
      unresolved.push(token);
      continue;
    }
    const best = hits[0];
    if (taken(best.path)) continue;
    starts.push({
      token, id: best.id, name: best.name, kind: best.kind, path: best.path,
      ...(best.lineStart !== undefined ? { lineStart: best.lineStart } : {}),
      ...(best.lineEnd !== undefined ? { lineEnd: best.lineEnd } : {}),
      via: "identifier in issue",
    });
  }
  return { starts, unresolved };
}

/**
 * Words for BM25: identifiers split at camelCase and underscores, lowercased,
 * parts of two letters or fewer dropped. `listByKind` is `list kind`, so an
 * issue that says "list by kind" matches the code that spells it as one word.
 */
export function bm25Tokens(text: string): string[] {
  const out: string[] = [];
  for (const word of text.match(/[A-Za-z][A-Za-z0-9]*/g) ?? []) {
    const parts = word.match(/[A-Z]?[a-z0-9]+|[A-Z]+(?![a-z])/g) ?? [word];
    for (const part of parts) if (part.length > 2) out.push(part.toLowerCase());
  }
  return out;
}

export interface Bm25Hit {
  path: string;
  score: number;
}

/**
 * Okapi BM25 (k1 1.2, b 0.75) of each file against `query`, best first, files
 * that share no word with it left out. A file's path is part of its text, so
 * `auth/login.ts` matches an issue about logging in before it is opened.
 */
export function bm25Rank(
  repo: Pick<RepoAccess, "read">,
  files: string[],
  query: string,
  k1 = 1.2,
  b = 0.75,
): Bm25Hit[] {
  const docs = new Map<string, { tf: Map<string, number>; length: number }>();
  for (const path of files) {
    const text = repo.read(path);
    if (text === undefined || Buffer.byteLength(text, "utf8") > MAX_BM25_BYTES) continue;
    const tf = new Map<string, number>();
    const tokens = bm25Tokens(`${path.replace(/\//g, " ")} ${text}`);
    for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
    docs.set(path, { tf, length: tokens.length });
  }
  if (docs.size === 0) return [];
  const n = docs.size;
  let total = 0;
  const df = new Map<string, number>();
  for (const doc of docs.values()) {
    total += doc.length;
    for (const t of doc.tf.keys()) df.set(t, (df.get(t) ?? 0) + 1);
  }
  const avg = total / n || 1;
  const terms = [...new Set(bm25Tokens(query))];
  const out: Bm25Hit[] = [];
  for (const [path, doc] of docs) {
    let score = 0;
    for (const t of terms) {
      const f = doc.tf.get(t);
      if (!f) continue;
      const d = df.get(t)!;
      const idf = Math.log(1 + (n - d + 0.5) / (d + 0.5));
      score += idf * (f * (k1 + 1)) / (f + k1 * (1 - b + b * doc.length / avg));
    }
    if (score > 0) out.push({ path, score });
  }
  return out.sort((a, c) => c.score - a.score || cmp(a.path, c.path));
}

export interface IssuePlan {
  starts: StartingPoint[];
  unresolved: string[];
  /** True when nothing in the issue resolved and the start is BM25's best file. */
  fallback: boolean;
  /** BM25 over the tracked source files, best first. */
  bm25: Bm25Hit[];
}

/**
 * Starting points and the lexical ranking for one issue. Without a git
 * checkout there is no file list: paths do not resolve, BM25 is empty, and
 * only names can start the bundle.
 */
export async function planIssue(
  text: string,
  deps: { repo?: RepoAccess; search: PickDeps["search"] },
): Promise<IssuePlan> {
  const files = deps.repo?.files() ?? [];
  const bm25 = deps.repo ? bm25Rank(deps.repo, files.filter(isSourcePath), text) : [];
  const scores = new Map(bm25.map((h) => [h.path, h.score]));
  const { starts, unresolved } = await pickStartingPoints(text, {
    files, search: deps.search, fileScore: (p) => scores.get(p) ?? 0,
  });
  if (starts.length > 0 || bm25.length === 0) return { starts, unresolved, fallback: false, bm25 };
  const top = bm25[0].path;
  return {
    starts: [{ token: top, name: posix.basename(top), kind: "file", path: top, via: "bm25 fallback" }],
    unresolved,
    fallback: true,
    bm25,
  };
}

export interface RankedFile {
  path: string;
  /** BM25 against the issue, boosted by closeness to a starting point. */
  score: number;
  reason: string;
}

/** Why a file is near a starting point, and how near: 1 one hop, 0.5 two. */
export interface Closeness {
  weight: number;
  reason: string;
}

/**
 * The files to read, best first: the starting files in the order they were
 * found, then every other source file by
 *
 *     bm25(file, issue) * (1 + CLOSENESS_BOOST * closeness(file))
 *
 * where closeness is 1 for a file one hop from a starting point, 0.5 for one
 * of its ranked related files, 0 otherwise. Ties go to the closer file, then
 * the path. A graph neighbour the issue's text does not match at all still
 * ranks, after every file it does match.
 */
export function rankIssueFiles(
  input: { starts: StartingPoint[]; bm25: Bm25Hit[]; near: ReadonlyMap<string, Closeness> },
  limit = MAX_RANKED_FILES,
): RankedFile[] {
  const lexical = new Map(input.bm25.map((h) => [h.path, h.score]));
  const out: RankedFile[] = [];
  const startPaths = new Set<string>();
  for (const s of input.starts) {
    if (startPaths.has(s.path)) continue;
    startPaths.add(s.path);
    out.push({
      path: s.path,
      score: round(lexical.get(s.path) ?? 0),
      reason: `starting point (${s.via}: ${s.token})`,
    });
  }
  const pool = new Set([...lexical.keys(), ...input.near.keys()]);
  const rest = [...pool]
    .filter((path) => !startPaths.has(path) && isSourcePath(path))
    .map((path) => {
      const bm25 = lexical.get(path) ?? 0;
      const near = input.near.get(path);
      const closeness = near?.weight ?? 0;
      const reason = [bm25 > 0 ? `bm25 ${bm25.toFixed(2)}` : "no bm25 match", near?.reason]
        .filter(Boolean).join("; ");
      return { path, score: bm25 * (1 + CLOSENESS_BOOST * closeness), closeness, reason };
    })
    .sort((a, b) => b.score - a.score || b.closeness - a.closeness || cmp(a.path, b.path));
  for (const r of rest) out.push({ path: r.path, score: round(r.score), reason: r.reason });
  return out.slice(0, limit);
}

/**
 * The issue's text: a file, or stdin for `-`. `stdin` is a parameter so the
 * stream can be replaced under test.
 */
export async function readIssueText(
  arg: string,
  stdin: AsyncIterable<unknown> = process.stdin,
): Promise<string> {
  if (arg !== "-") return readFileSync(arg, "utf8");
  const chunks: Buffer[] = [];
  for await (const chunk of stdin) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk, "utf8") : Buffer.from(chunk as Uint8Array));
  }
  return Buffer.concat(chunks).toString("utf8");
}

function unique(items: string[]): string[] {
  return [...new Set(items)];
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}

function cmp(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
