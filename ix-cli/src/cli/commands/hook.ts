// Copyright 2026 Ix Infrastructure Inc.

import type { Command } from "commander";
import { parseBudgetOption } from "../options.js";
import { DEFAULT_TOKEN_BUDGET } from "../around.js";
import { hookTimeoutMs, readStdin, runClaudePostEdit, withDeadline } from "../hook/claude-post-edit.js";

/**
 * `ix hook <agent-event>`: entry points an agent harness runs on its own
 * events. One subcommand per (harness, event), because each harness has its
 * own stdin and stdout contract; `claude-post-edit` is Claude Code's
 * PostToolUse for Edit / MultiEdit / Write.
 */
export function registerHookCommand(program: Command): void {
  const hook = program
    .command("hook")
    .description("Entry points for agent hooks (Claude Code PostToolUse: claude-post-edit)");

  hook
    .command("claude-post-edit")
    .description("Claude Code PostToolUse hook: after an edit, tell the agent who depends on what it changed")
    .option("--graph-root <dir>", "Mapped workspace to query (default: the one containing the edited file)")
    .option("--worktree <dir>", "Root the edited file_path is under; mapped to the same relative path in --graph-root")
    .option("--budget <tokens>", "Token budget for the context it adds (~4 chars a token)", (v: string) => parseBudgetOption(v, String(DEFAULT_TOKEN_BUDGET)), DEFAULT_TOKEN_BUDGET)
    .addHelpText("after", `
Reads Claude Code's PostToolUse JSON on stdin. Prints one JSON object,
{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":"..."}},
naming the changed symbols' callers, importers that use them, and tests that
reach them -- or prints nothing. Always exits 0: a backend that is down, an
unmapped workspace, a file not in the graph or a non-code file all print
nothing. Gives up after IX_HOOK_TIMEOUT_MS (default 3000). IX_HOOK_DEBUG=1
says why on stderr.

.claude/settings.json:
  {"hooks":{"PostToolUse":[{"matcher":"Edit|MultiEdit|Write",
    "hooks":[{"type":"command","command":"ix hook claude-post-edit"}]}]}}`)
    .action(async (opts: { graphRoot?: string; worktree?: string; budget: number }) => {
      const started = Date.now();
      const timeout = hookTimeoutMs();
      const debugOn = process.env.IX_HOOK_DEBUG === "1";
      const debug = (msg: string) => { if (debugOn) process.stderr.write(`[ix hook] ${msg}\n`); };
      let out: string | undefined;
      try {
        const raw = await readStdin(timeout);
        const left = Math.max(0, timeout - (Date.now() - started));
        out = await withDeadline(runClaudePostEdit(raw, opts, { debug }), left);
        if (out === undefined) debug("no output");
      } catch (err) {
        debug(`failed: ${err instanceof Error ? err.message : String(err)}`);
        out = undefined;
      }
      debug(`${Date.now() - started} ms`);
      // Exit at once: a request still in flight past the deadline must not
      // keep the agent waiting, or surface later as an unhandled rejection.
      if (out) process.stdout.write(`${out}\n`, () => process.exit(0));
      else process.exit(0);
    });
}
