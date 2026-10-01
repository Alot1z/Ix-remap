#!/usr/bin/env node
// Copyright 2026 Ix Infrastructure Inc.

/**
 * The `ix` executable.
 *
 * Everything but one invocation goes straight to the CLI (`cli.ts`). The
 * exception is `ix hook claude-post-edit`, which an agent harness runs after
 * every hooked tool call -- every Bash command included -- and which almost
 * always has nothing to say. Loading the CLI's command tree costs ~140 ms
 * before a single line of it runs; the hook's "nothing changed" answer costs a
 * git call. So the hook is dispatched here, before that tree is loaded, and
 * loads the graph code itself only when there is an edit to report.
 * `--help` still goes through the CLI, where the command is documented.
 */
const args = process.argv.slice(2);
if (args[0] === "hook" && args[1] === "claude-post-edit" && !args.some((a) => a === "-h" || a === "--help")) {
  const { parseHookArgs, runHookProcess } = await import("./hook/entry.js");
  await runHookProcess(parseHookArgs(args.slice(2)));
} else {
  await import("./cli.js");
}
