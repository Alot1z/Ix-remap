// Copyright 2026 Ix Infrastructure Inc.

import * as path from "node:path";
import { hookTimeoutMs, readStdin, withDeadline } from "./io.js";
import {
  fingerprint, gitDiffHead, gitTopLevel, loadState, parseUnifiedDiff, saveState, statePath,
} from "./session.js";
import type { HookDeps, HookOptions, PostToolUseInput } from "./claude-post-edit.js";

/**
 * The post-edit hook's front door, loaded before -- and instead of -- the
 * CLI: `main.ts` dispatches `ix hook claude-post-edit` here directly.
 *
 * It runs after every hooked tool call, Bash included, because agents edit
 * through Bash scripts as often as through Edit. Most of those calls change
 * nothing new, so the order is cheapest-first:
 *
 * 1. `git diff -U0 HEAD`. Empty: nothing tracked has changed; print nothing.
 * 2. Its fingerprint against the one this session last reported on. Same
 *    diff: nothing new; print nothing.
 * 3. Only now load the graph code (`claude-post-edit.ts`) and ask about the
 *    edited symbols this session has not been told about yet.
 *
 * Steps 1-2 need node's builtins and one git process. Outside a git
 * repository the Edit / Write tool's own patch is the fallback.
 */

export interface EntryDeps extends HookDeps {
  gitTopLevel?: (dir: string) => string | undefined;
  gitDiffHead?: (repoRoot: string) => string;
}

/** Never throws; undefined means print nothing. */
export async function runPostEditHook(raw: string, opts: HookOptions = {}, deps: EntryDeps = {}): Promise<string | undefined> {
  const debug = deps.debug ?? (() => {});
  const env = opts.env ?? process.env;
  try {
    let input: PostToolUseInput;
    try { input = JSON.parse(raw) as PostToolUseInput; } catch { debug("stdin is not JSON"); return undefined; }
    if (!input || typeof input !== "object") return undefined;
    const base = input.cwd && path.isAbsolute(input.cwd) ? input.cwd : process.cwd();
    const worktree = path.resolve(opts.worktree ?? base);
    const repoRoot = (deps.gitTopLevel ?? gitTopLevel)(worktree);

    if (!repoRoot) {
      const file = statePath(input.session_id, worktree, env);
      const state = loadState(file);
      const heavy = await import("./claude-post-edit.js");
      const outcome = await heavy.reportToolEdit(input, new Set(state.reported), opts, deps);
      if (outcome.reported.length > 0) saveState(file, { ...state, reported: [...state.reported, ...outcome.reported] });
      return outcome.output;
    }

    const diff = (deps.gitDiffHead ?? gitDiffHead)(repoRoot);
    if (!diff.trim()) { debug("no tracked changes"); return undefined; }
    const fp = fingerprint(diff);
    const file = statePath(input.session_id, repoRoot, env);
    const state = loadState(file);
    if (state.fingerprint === fp) { debug("diff unchanged since last report"); return undefined; }

    const files = parseUnifiedDiff(diff);
    const heavy = await import("./claude-post-edit.js");
    const outcome = await heavy.reportChangedFiles({ repoRoot, files, already: new Set(state.reported) }, opts, deps);
    saveState(file, {
      // Keep the old fingerprint while edited symbols wait behind the cap, so
      // the next call -- even one that edits nothing -- reports them.
      fingerprint: outcome.complete ? fp : state.fingerprint,
      reported: [...new Set([...state.reported, ...outcome.reported])],
    });
    return outcome.output;
  } catch (err) {
    debug(`failed: ${err instanceof Error ? err.message : String(err)}`);
    return undefined;
  }
}

/** `--graph-root <dir>`, `--worktree=<dir>`, `--budget <n>`; anything else is ignored. */
export function parseHookArgs(argv: string[]): HookOptions {
  const opts: HookOptions = {};
  for (let i = 0; i < argv.length; i++) {
    const [flag, inline] = argv[i].split(/=(.*)/s, 2);
    const value = () => inline ?? argv[++i];
    if (flag === "--graph-root") opts.graphRoot = value();
    else if (flag === "--worktree") opts.worktree = value();
    else if (flag === "--budget") {
      const n = Number(value());
      if (Number.isSafeInteger(n) && n > 0) opts.budget = n;
    }
  }
  return opts;
}

/**
 * The whole process: read stdin, answer within the deadline, print, exit 0.
 * Exits at once so a request still in flight past the deadline can neither
 * hold the agent nor surface later as an unhandled rejection.
 */
export async function runHookProcess(opts: HookOptions): Promise<void> {
  const started = Date.now();
  const timeout = hookTimeoutMs();
  const debugOn = process.env.IX_HOOK_DEBUG === "1";
  const debug = (msg: string) => { if (debugOn) process.stderr.write(`[ix hook] ${msg}\n`); };
  let out: string | undefined;
  try {
    const raw = await readStdin(timeout);
    const left = Math.max(0, timeout - (Date.now() - started));
    out = await withDeadline(runPostEditHook(raw, opts, { debug }), left);
  } catch (err) {
    debug(`failed: ${err instanceof Error ? err.message : String(err)}`);
    out = undefined;
  }
  debug(`${out ? "reported" : "nothing"} in ${Date.now() - started} ms`);
  if (out) process.stdout.write(`${out}\n`, () => process.exit(0));
  else process.exit(0);
}
