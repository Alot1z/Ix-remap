// Copyright 2026 Ix Infrastructure Inc.

import * as fs from "node:fs";
import * as path from "node:path";
import { IxClient } from "../../client/api.js";
import { getEndpoint, resolveWorkspaceRoot } from "../config.js";
import { SourceFiles } from "../edge-sites.js";
import { isSourcePath } from "../explain/issue.js";
import {
  DEFAULT_TOKEN_BUDGET, fitToBudget, gatherAround, hasDependents, type AroundRequest, type AroundResult, type LineRange,
} from "../around.js";
import { renderAroundText } from "../around-render.js";

/**
 * `ix hook claude-post-edit`: Claude Code's PostToolUse hook for Edit,
 * MultiEdit and Write.
 *
 * Agents never call Ix on their own, and context handed to them up front did
 * not change whether they solved an issue. This pushes one fact into the loop
 * at the moment it matters: right after an edit, who calls or imports what was
 * just changed, and which tests reach it -- the other places the fix may have
 * to touch.
 *
 * It must never get in the agent's way. Any failure -- no backend, an unmapped
 * workspace, a file the graph does not hold, a non-code file, a slow answer --
 * prints nothing and exits 0. `IX_HOOK_DEBUG=1` says why on stderr.
 */

export interface PatchHunk {
  oldStart: number;
  oldLines?: number;
  newStart: number;
  newLines?: number;
  lines: string[];
}

/** The fields of Claude Code's PostToolUse input this hook reads. */
export interface PostToolUseInput {
  hook_event_name?: string;
  cwd?: string;
  tool_name?: string;
  tool_input?: {
    file_path?: string;
    old_string?: string;
    new_string?: string;
    replace_all?: boolean;
    edits?: Array<{ old_string?: string; new_string?: string; replace_all?: boolean }>;
    content?: string;
  };
  tool_response?: {
    filePath?: string;
    type?: string;
    originalFile?: string | null;
    structuredPatch?: PatchHunk[];
  } | null;
}

export interface HookOptions {
  /** The mapped workspace to query, when the agent edits a different checkout of it. */
  graphRoot?: string;
  /** The root the agent's `file_path` is under; mapped onto `graphRoot`. */
  worktree?: string;
  budget?: number;
  env?: NodeJS.ProcessEnv;
}

export const EDIT_TOOLS = new Set(["Edit", "MultiEdit", "Write"]);
/** Where a `new_string` occurs more often than this, it says nothing about where the edit was. */
const MAX_OCCURRENCES = 3;
export const DEFAULT_HOOK_TIMEOUT_MS = 3000;

/**
 * The one place the hook's stdout contract lives: Claude Code reads
 * `hookSpecificOutput.additionalContext` off a PostToolUse hook's JSON and
 * hands it to the model after the tool result.
 */
export function postToolUseOutput(additionalContext: string): string {
  return JSON.stringify({
    hookSpecificOutput: { hookEventName: "PostToolUse", additionalContext },
  });
}

export function hookTimeoutMs(env: NodeJS.ProcessEnv = process.env): number {
  const raw = Number(env.IX_HOOK_TIMEOUT_MS);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_HOOK_TIMEOUT_MS;
}

/** Runs of consecutive line numbers as ranges. */
function toRanges(lines: number[]): LineRange[] {
  const sorted = [...new Set(lines)].sort((a, b) => a - b);
  const out: LineRange[] = [];
  for (const l of sorted) {
    const last = out[out.length - 1];
    if (last && l === last.end + 1) last.end = l;
    else out.push({ start: l, end: l });
  }
  return out;
}

/**
 * The lines a patch changed, on one side of it.
 *
 * `old`: the removed lines, in the file before the edit, plus each pure
 * insertion as the pair of old lines it went between. `new`: the added lines
 * in the file after it, plus each pure deletion as the pair it closed up.
 */
export function patchRanges(hunks: PatchHunk[], side: "old" | "new"): LineRange[] {
  const changed: number[] = [];
  const gaps: LineRange[] = [];
  for (const h of hunks) {
    let o = h.oldStart;
    let n = h.newStart;
    let removedInRun = false;
    let addedInRun = false;
    for (const line of h.lines ?? []) {
      const c = line[0];
      if (c === "-") {
        if (side === "old") changed.push(o);
        removedInRun = true;
        o++;
      } else if (c === "+") {
        if (side === "new") changed.push(n);
        else if (!removedInRun && !addedInRun) gaps.push({ start: Math.max(1, o - 1), end: Math.max(1, o), insertion: true });
        addedInRun = true;
        n++;
      } else if (c === "\\") {
        continue;
      } else {
        if (side === "new" && removedInRun && !addedInRun) gaps.push({ start: Math.max(1, n - 1), end: Math.max(1, n), insertion: true });
        removedInRun = false;
        addedInRun = false;
        o++;
        n++;
      }
    }
    if (side === "new" && removedInRun && !addedInRun) gaps.push({ start: Math.max(1, n - 1), end: Math.max(1, n), insertion: true });
  }
  return [...toRanges(changed), ...gaps];
}

/** The line ranges `text` occupies in `content`, at most {@link MAX_OCCURRENCES} of them. */
export function locateText(content: string, text: string): LineRange[] {
  if (!text) return [];
  const variants = content.includes("\r\n") && !text.includes("\r\n") ? [text, text.replace(/\n/g, "\r\n")] : [text];
  for (const t of variants) {
    const out: LineRange[] = [];
    let from = 0;
    for (;;) {
      const at = content.indexOf(t, from);
      if (at < 0) break;
      const start = lineOf(content, at);
      const trimmed = t.replace(/\r?\n$/, "");
      out.push({ start, end: start + (trimmed.match(/\n/g)?.length ?? 0) });
      if (out.length > MAX_OCCURRENCES) return [];
      from = at + Math.max(1, t.length);
    }
    if (out.length > 0) return out;
  }
  return [];
}

function lineOf(content: string, offset: number): number {
  let line = 1;
  for (let i = 0; i < offset; i++) if (content.charCodeAt(i) === 10) line++;
  return line;
}

export interface EditLocation {
  /** None: the whole file. */
  ranges?: LineRange[];
  /** The text `ranges` index into. */
  anchorLines: string[];
}

/**
 * Where the edit is, and in which text.
 *
 * The graph's spans were recorded before the edit, and the edit itself can
 * move or rename the declaration it changed. So the pre-edit side of the
 * patch is the anchor whenever the pre-edit text is there (`originalFile`):
 * the declaration the graph recorded is still in it, by its recorded name,
 * and the spans are re-anchored to that text for whatever earlier edits moved
 * it. When the edit runs in a different checkout from the graph's, this is
 * the only side that matches the graph at all. Without the pre-edit text the
 * new side is used, re-anchored to the file as it is now -- the same step
 * `ix around` takes for a line typed by hand.
 *
 * Undefined means there is nothing to report on: a new file, a no-op write,
 * an edit whose text cannot be found.
 */
export function locateEdit(input: PostToolUseInput, current: string): EditLocation | undefined {
  const tool = input.tool_name ?? "";
  const resp = input.tool_response ?? undefined;
  const currentLines = current.split("\n");
  if (tool === "Write" && resp?.type === "create") return undefined;

  const hunks = Array.isArray(resp?.structuredPatch) ? resp!.structuredPatch! : undefined;
  if (hunks && hunks.length > 0) {
    if (typeof resp?.originalFile === "string") {
      const ranges = patchRanges(hunks, "old");
      return ranges.length > 0 ? { ranges, anchorLines: resp.originalFile.split("\n") } : undefined;
    }
    const ranges = patchRanges(hunks, "new");
    return ranges.length > 0 ? { ranges, anchorLines: currentLines } : undefined;
  }

  if (tool === "Write") {
    // An empty patch on an update is a write that changed nothing; with no
    // response at all, all that is known is that the whole file was written.
    if (resp && hunks) return undefined;
    return { anchorLines: currentLines };
  }

  const ti = input.tool_input ?? {};
  const news = tool === "MultiEdit" ? (ti.edits ?? []).map((e) => e?.new_string ?? "") : [ti.new_string ?? ""];
  const ranges = news.flatMap((t) => locateText(current, t));
  return ranges.length > 0 ? { ranges, anchorLines: currentLines } : undefined;
}

export interface HookDeps {
  gather?: (req: AroundRequest) => Promise<AroundResult>;
  readFile?: (abs: string) => string | undefined;
  /** Moves the read scope to a directory; the default is `process.chdir`. */
  chdir?: (dir: string) => void;
  workspaceRoot?: () => string;
  debug?: (msg: string) => void;
}

function defaultReadFile(abs: string): string | undefined {
  try {
    const stat = fs.statSync(abs);
    if (!stat.isFile() || stat.size > 2 * 1024 * 1024) return undefined;
    return fs.readFileSync(abs, "utf-8");
  } catch {
    return undefined;
  }
}

const isInside = (rel: string) => rel !== "" && !rel.startsWith("..") && !path.isAbsolute(rel);

/**
 * The hook, minus stdin and the process: the stdout it should print, or
 * undefined to print nothing. Never throws.
 */
export async function runClaudePostEdit(raw: string, opts: HookOptions = {}, deps: HookDeps = {}): Promise<string | undefined> {
  const debug = deps.debug ?? (() => {});
  try {
    let input: PostToolUseInput;
    try { input = JSON.parse(raw) as PostToolUseInput; } catch { debug("stdin is not JSON"); return undefined; }
    if (!input || typeof input !== "object") return undefined;
    if (!EDIT_TOOLS.has(input.tool_name ?? "")) { debug(`tool ${input.tool_name} is not an edit`); return undefined; }

    const filePathRaw = input.tool_input?.file_path ?? input.tool_response?.filePath;
    if (!filePathRaw) { debug("no file_path"); return undefined; }
    const base = input.cwd && path.isAbsolute(input.cwd) ? input.cwd : process.cwd();
    const filePath = path.resolve(base, filePathRaw);

    // The edited file, mapped into the checkout the graph was built from.
    let graphFile = filePath;
    if (opts.worktree) {
      const rel = path.relative(path.resolve(opts.worktree), filePath);
      if (!isInside(rel)) { debug(`${filePath} is not under --worktree`); return undefined; }
      graphFile = path.join(path.resolve(opts.graphRoot ?? opts.worktree), rel);
    }
    (deps.chdir ?? process.chdir)(opts.graphRoot ? path.resolve(opts.graphRoot) : path.dirname(graphFile));
    const workspaceRoot = path.resolve((deps.workspaceRoot ?? resolveWorkspaceRoot)());
    const relPath = path.relative(workspaceRoot, graphFile).split(path.sep).join("/");
    if (!isInside(relPath)) { debug(`${graphFile} is outside workspace ${workspaceRoot}`); return undefined; }
    if (!isSourcePath(relPath)) { debug(`${relPath} is not a source file`); return undefined; }

    const read = deps.readFile ?? defaultReadFile;
    const current = read(filePath) ?? (typeof input.tool_input?.content === "string" ? input.tool_input.content : undefined);
    if (current === undefined) { debug(`cannot read ${filePath}`); return undefined; }
    const where = locateEdit(input, current);
    if (!where) { debug("edit not located"); return undefined; }
    debug(`${relPath} ranges=${JSON.stringify(where.ranges ?? "file")}`);

    // Dependents' files are read where the agent sees them.
    const sourceRoot = opts.worktree
      ? path.join(path.resolve(opts.worktree), path.relative(path.resolve(opts.graphRoot ?? opts.worktree), workspaceRoot))
      : workspaceRoot;
    const timeoutMs = hookTimeoutMs(opts.env);
    const gather = deps.gather ?? ((req: AroundRequest) =>
      gatherAround(new IxClient(getEndpoint(), AbortSignal.timeout(timeoutMs)), req));
    const result = await gather({
      relPath,
      ranges: where.ranges,
      anchorLines: where.anchorLines,
      currentLines: current.split("\n"),
      files: new SourceFiles(sourceRoot),
    });
    if (result.symbols.length === 0) { debug("no graph definition covers the edit"); return undefined; }
    if (!hasDependents(result)) { debug("no dependents"); return undefined; }

    const textOpts = { lead: "Ix: you changed", footer: "These may need updating to match your edit." };
    const budget = opts.budget ?? DEFAULT_TOKEN_BUDGET;
    const fitted = fitToBudget(result, (r) => renderAroundText(r, textOpts), budget);
    return postToolUseOutput(renderAroundText(fitted, textOpts));
  } catch (err) {
    debug(`failed: ${err instanceof Error ? err.message : String(err)}`);
    return undefined;
  }
}

/** All of stdin, or "" when there is none or it does not arrive in time. */
export function readStdin(timeoutMs: number, stdin: NodeJS.ReadStream = process.stdin): Promise<string> {
  if (stdin.isTTY) return Promise.resolve("");
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    const done = (value: string) => { clearTimeout(timer); resolve(value); };
    const timer = setTimeout(() => done(""), timeoutMs);
    stdin.on("data", (c: Buffer) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    stdin.on("end", () => done(Buffer.concat(chunks).toString("utf-8")));
    stdin.on("error", () => done(""));
  });
}

/**
 * Race the hook against its deadline. A late answer is dropped, not waited
 * for: an agent's next turn is worth more than the dependents of its last one.
 */
export async function withDeadline<T>(work: Promise<T>, ms: number): Promise<T | undefined> {
  let timer: NodeJS.Timeout | undefined;
  const late = new Promise<undefined>((resolve) => { timer = setTimeout(() => resolve(undefined), ms); });
  try {
    return await Promise.race([work.catch(() => undefined), late]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
