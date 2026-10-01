// Copyright 2026 Ix Infrastructure Inc.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

/**
 * What the post-edit hook knows without the graph: the working tree's diff
 * against HEAD, and what it already told this session.
 *
 * Agents do not only edit with Edit and Write. In benchmark runs they rewrote
 * files with `python3 - <<EOF` through Bash just as often, and a hook keyed on
 * the edit tools never fired. The diff sees every editing path. It also says
 * where each edit is in the base commit -- the hunk's old side -- which is the
 * text the graph indexed.
 *
 * Builtins only: this runs on every hooked tool call, and the common answer is
 * "nothing new", which must cost a git call, not the CLI's module graph.
 */

/** 1-based inclusive range on the old side of a hunk; `insertion` marks a pure insertion point. */
export interface OldRange {
  start: number;
  end: number;
  insertion?: boolean;
}

export interface FileDiff {
  /** Repository-relative path in the base commit; undefined for a new file. */
  oldPath?: string;
  /** Repository-relative path in the working tree; undefined for a deleted file. */
  newPath?: string;
  /** Where the edits are, in the base commit's file. */
  oldRanges: OldRange[];
}

const GIT_TIMEOUT_MS = 2000;

function git(cwd: string, args: string[]): string {
  return execFileSync("git", ["-C", cwd, ...args], {
    encoding: "utf-8",
    stdio: ["ignore", "pipe", "ignore"],
    timeout: GIT_TIMEOUT_MS,
    maxBuffer: 32 * 1024 * 1024,
  });
}

/** The repository's top level, or undefined outside one. */
export function gitTopLevel(dir: string): string | undefined {
  try {
    const out = git(dir, ["rev-parse", "--show-toplevel"]).trim();
    return out ? path.resolve(out) : undefined;
  } catch {
    return undefined;
  }
}

/**
 * The tracked changes against HEAD, with no context lines. Untracked files are
 * not in it, and need not be: a file that is new has no graph facts.
 */
export function gitDiffHead(repoRoot: string): string {
  return git(repoRoot, ["diff", "-U0", "--no-color", "--no-ext-diff", "--no-renames", "HEAD", "--"]);
}

/** A file's content in HEAD, or undefined when HEAD has no such file. */
export function gitShowHead(repoRoot: string, repoPath: string): string | undefined {
  try {
    return git(repoRoot, ["show", `HEAD:${repoPath}`]);
  } catch {
    return undefined;
  }
}

function unquote(p: string): string {
  // git quotes paths with unusual characters: "a/sp\303\251cial.ts"
  if (!p.startsWith("\"")) return p;
  try { return JSON.parse(p) as string; } catch { return p.slice(1, -1); }
}

function diffPath(raw: string, prefix: "a/" | "b/"): string | undefined {
  const p = unquote(raw.trim());
  if (p === "/dev/null") return undefined;
  return p.startsWith(prefix) ? p.slice(prefix.length) : p;
}

/**
 * The files of a `git diff -U0` and, for each, where its hunks sit on the old
 * side. A hunk `-a,b +c,d` with `b > 0` replaced or removed old lines
 * `a..a+b-1`; with `b == 0` it inserted after old line `a`, between `a` and
 * `a+1`.
 */
export function parseUnifiedDiff(text: string): FileDiff[] {
  const files: FileDiff[] = [];
  let cur: FileDiff | undefined;
  for (const line of text.split("\n")) {
    if (line.startsWith("diff --git ")) {
      cur = { oldRanges: [] };
      files.push(cur);
    } else if (!cur) {
      continue;
    } else if (line.startsWith("--- ")) {
      cur.oldPath = diffPath(line.slice(4), "a/");
    } else if (line.startsWith("+++ ")) {
      cur.newPath = diffPath(line.slice(4), "b/");
    } else if (line.startsWith("@@")) {
      const m = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/.exec(line);
      if (!m) continue;
      const start = Number(m[1]);
      const count = m[2] === undefined ? 1 : Number(m[2]);
      if (count > 0) cur.oldRanges.push({ start, end: start + count - 1 });
      else cur.oldRanges.push({ start: Math.max(1, start), end: start + 1, insertion: true });
    }
  }
  return files.filter((f) => f.oldRanges.length > 0);
}

export function fingerprint(text: string): string {
  return createHash("sha256").update(text).digest("hex").slice(0, 32);
}

// ── Per-session state ───────────────────────────────────────────────────────

export interface HookState {
  /** The diff last fully reported on. The same diff again has nothing new in it. */
  fingerprint?: string;
  /** `path#id` of every symbol this session was already told about. */
  reported: string[];
}

/** One file per (session, worktree), under IX_HOOK_STATE_DIR or the OS temp dir. */
export function statePath(sessionId: string | undefined, worktree: string, env: NodeJS.ProcessEnv = process.env): string {
  const dir = env.IX_HOOK_STATE_DIR || path.join(os.tmpdir(), "ix-hook");
  const key = fingerprint(`${sessionId ?? "no-session"}\0${path.resolve(worktree)}`).slice(0, 24);
  return path.join(dir, `${key}.json`);
}

export function loadState(file: string): HookState {
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf-8")) as Partial<HookState>;
    return {
      fingerprint: typeof parsed.fingerprint === "string" ? parsed.fingerprint : undefined,
      reported: Array.isArray(parsed.reported) ? parsed.reported.filter((r): r is string => typeof r === "string") : [],
    };
  } catch {
    return { reported: [] };
  }
}

/** Written whole and renamed into place, so a concurrent reader never sees half a file. */
export function saveState(file: string, state: HookState): void {
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const tmp = `${file}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(state));
    fs.renameSync(tmp, file);
  } catch { /* a hook that cannot remember only repeats itself */ }
}

export function symbolKey(relPath: string, id: string): string {
  return `${relPath}#${id}`;
}
