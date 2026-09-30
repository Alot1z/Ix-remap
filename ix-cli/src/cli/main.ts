#!/usr/bin/env node
// Copyright 2026 Ix Infrastructure Inc.

// The entry point, kept to what must happen before the CLI's own modules load.
// Static imports are evaluated before a module's body runs, so the two steps
// below could not live in `run-cli.ts`: by the time its first line ran, the
// ~200 modules behind the command registry would already be loaded.

import * as nodeModule from "node:module";

// Runtime Node version guard. Runs before any command work so users on an
// unsupported Node get an actionable message instead of a cryptic "fetch
// failed" deep inside undici.
const MIN_NODE_MAJOR = 22;
{
  const current = process.versions.node;
  const major = parseInt(current.split(".")[0] ?? "0", 10);
  if (!Number.isFinite(major) || major < MIN_NODE_MAJOR) {
    process.stderr.write(
      `Ix requires Node.js ${MIN_NODE_MAJOR} or newer. You are running v${current}.\n` +
      `Install a supported version from https://nodejs.org/ and re-run.\n`
    );
    process.exit(1);
  }
}

// V8's code cache for every module loaded from here on. Compiling the CLI's
// modules is most of its start-up: measured at ~40 ms of ~180 ms before the
// first request on a warm machine. Node >= 22.1 keeps the cache under the OS
// temp directory, keyed by file content and Node version, so an upgrade can
// never run stale code; NODE_COMPILE_CACHE moves it and
// NODE_DISABLE_COMPILE_CACHE=1 turns it off. Absent on 22.0: then a no-op.
try {
  (nodeModule as { enableCompileCache?: () => unknown }).enableCompileCache?.();
} catch {
  // A cache that cannot be opened only costs speed.
}

await import("./run-cli.js");
