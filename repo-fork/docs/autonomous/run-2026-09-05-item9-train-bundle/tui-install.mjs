#!/usr/bin/env node
// Interactive `ix install` TUI — LOCAL PROTOTYPE (item 9, never pushed, never a PR/issue).
// Iron rule: a UI over the SAME engine automation uses. This script pre-fills
// argv for scripts/install-skill.sh and spawns it — it never reimplements install.
//
// Usage:
//   node tui-install.mjs --engine <repo-root>                       interactive (TTY)
//   node tui-install.mjs --engine <repo-root> --ids claude,codex --mode dry-run
//   modes: apply | dry-run | json
//
// Non-TTY or --mode given → no prompts; the exact argv the TUI would pass is
// printed/spawned, so scripts and CI keep deterministic behavior.

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import readline from "node:readline";

const args = process.argv.slice(2);
function flag(name) {
  const i = args.indexOf(`--${name}`);
  return i > -1 ? args[i + 1] : undefined;
}
function hasFlag(name) {
  return args.includes(`--${name}`);
}

const engineRoot = flag("engine");
if (!engineRoot || !existsSync(join(engineRoot, "scripts", "install-skill.sh"))) {
  console.error("error: --engine <repo-root> must point at a checkout with scripts/install-skill.sh");
  process.exit(2);
}
const engine = join(engineRoot, "scripts", "install-skill.sh");

// Registry ids come from the repo's own harness registry — never hardcoded.
const helper = join(engineRoot, "ix-cli", "scripts", "skill-harnesses.mjs");
const probe = spawnSync("node", [helper, "--probe"], { encoding: "utf8" });
if (probe.status !== 0) {
  console.error("error: harness registry probe failed:", probe.stderr.trim().split("\n")[0]);
  process.exit(2);
}
const allIds = probe.stdout.trim().split("\n").map((l) => l.split("|")[0]).filter(Boolean);

let ids = flag("ids") ? flag("ids").split(",").filter(Boolean) : null;
let mode = flag("mode") || null;
const interactive = process.stdout.isTTY && !mode && !ids;

if (interactive) {
  console.log("  ██ Ix\n  agent skill installer\n");
  console.log(`Detected harnesses: ${allIds.join(", ")}`);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => new Promise((res) => rl.question(q, res));
  const picked = (await ask("? Harnesses to install (comma-separated, empty = all): ")).trim();
  ids = picked ? picked.split(",").map((s) => s.trim()).filter(Boolean) : allIds;
  const invalid = ids.filter((id) => !allIds.includes(id));
  if (invalid.length) {
    console.error(`error: unknown harness id(s) ${invalid.join(", ")} — valid: ${allIds.join(" ")}`);
    rl.close();
    process.exit(1);
  }
  const m = (await ask("? Mode [1] apply  [2] dry-run  [3] json: ")).trim();
  mode = m === "2" ? "dry-run" : m === "3" ? "json" : "apply";
  rl.close();
}

// The ONLY state the TUI owns is argv. Everything below is the engine.
const engineArgs = [];
if (mode === "dry-run") engineArgs.push("--dry-run");
if (mode === "json") engineArgs.push("--dry-run", "--json");
if (ids && ids.length) engineArgs.push(...ids);

if (!interactive) {
  // Machine path: print the plan, then run it — same surface automation sees.
  console.error(`engine argv: bash ${engine} ${engineArgs.join(" ")}`);
}
const run = spawnSync("bash", [engine, ...engineArgs], { stdio: "inherit" });
process.exit(run.status ?? 1);
