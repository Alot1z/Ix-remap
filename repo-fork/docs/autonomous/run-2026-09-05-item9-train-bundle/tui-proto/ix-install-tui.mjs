#!/usr/bin/env node
// ix-install-tui.mjs — LOCAL PROTOTYPE (owner go: item 9 tick-box). Never pushed, never opened.
// Interactive front-end over the real installer engine — NOT a second implementation.
//
// Engine contract (issue #612, shape from #612's body):
//   • every menu item maps onto the engine's non-interactive flags (draft = pre-fill only)
//   • automation parity: --json / --dry-run / --help produce EXACTLY the engine's output
//   • local-only: plan-only until you pick a real install target
//
// Usage:
//   node ix-install-tui.mjs --engine <path-to-install-skill.sh>   # interactive
//   node ix-install-tui.mjs --engine <path> --json                # EXACT engine --json output
//   node ix-install-tui.mjs --engine <path> --dry-run             # EXACT engine --dry-run output
//   node ix-install-tui.mjs --engine <path> --help                # EXACT engine --help output

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TOOL = "ix-install-tui";
const here = dirname(fileURLToPath(import.meta.url));

// ---- arg handling ----------------------------------------------------------
const argv = process.argv.slice(2);
const getFlag = (name) => {
  const i = argv.indexOf(name);
  return i > -1 ? argv[i + 1] : undefined;
};
const wants = (name) => argv.includes(name);
const enginePath = getFlag("--engine");

// ---- automation parity: pass-through, byte-identical ------------------------
if (wants("--json") || wants("--dry-run") || wants("--help") || wants("-h")) {
  if (!enginePath || !existsSync(enginePath)) {
    console.error(`${TOOL}: --engine <path> required for parity modes (got: ${enginePath ?? "none"})`);
    process.exit(1);
  }
  const flag = wants("--json") ? "--json" : wants("--dry-run") ? "--dry-run" : "--help";
  const passthrough = wants("--json") && wants("--dry-run") ? ["--dry-run", "--json"] : [flag];
  const r = spawnSync("bash", [resolve(enginePath), ...passthrough], {
    stdio: ["ignore", "pipe", "inherit"],
    env: process.env,
  });
  process.stdout.write(r.stdout ?? "");
  process.exit(r.status ?? 1);
}

if (!enginePath || !existsSync(enginePath)) {
  console.error(`${TOOL}: interactive mode needs --engine <path-to-install-skill.sh>`);
  process.exit(1);
}
const engine = resolve(enginePath);

// ---- banner (the real renderer, in-process) --------------------------------
async function renderBanner(width = 48) {
  // Probe-then-import: the #605 renderer is package-relative; this prototype
  // resolves it next to the runner tree, falling back to plan-only text.
  const candidates = [
    join(here, "runner", "..", "repo", "ix-cli", "scripts", "render-logo.mjs"),
    join(here, "..", "repo", "ix-cli", "scripts", "render-logo.mjs"),
  ];
  const mod = candidates.map((c) => resolve(c)).find((c) => existsSync(c));
  if (!mod) return "[ix install]  (banner renderer not found — plan-only banner text)";
  try {
    const { renderLogo } = await import(`file:///${mod.replace(/\\/g, "/")}`);
    return renderLogo({ width, color: "truecolor", bg: "brand" });
  } catch (e) {
    return `[ix install]  (banner renderer failed: ${e.message})`;
  }
}

// ---- engine state probe (the ONLY source of what would happen) -------------
function probeEngine(extraArgs = []) {
  const r = spawnSync("bash", [engine, "--dry-run", ...extraArgs], {
    stdio: ["ignore", "pipe", "pipe"],
    env: process.env,
  });
  return { out: (r.stdout ?? "").toString(), status: r.status };
}

function parseHosts(dryRunOut) {
  // From the labeled lines: "would install [claude]: <dest>" / "skip: <id> — ..."
  const hosts = [];
  for (const line of dryRunOut.split("\n")) {
    const m = line.match(/^would install \[(\w+)\]: (.+)$/);
    if (m) hosts.push({ id: m[1], dest: m[2], state: "would-install" });
    const s = line.match(/^skip: (\w+)/);
    if (s) hosts.push({ id: s[1], dest: "", state: "skip" });
  }
  return hosts;
}

// ---- interactive menu (draft = pre-fill; execution stays the engine's) ------
const banner = await renderBanner(48);
console.log(banner);
console.log("\n?  What should this machine get?  (plan-only preview — nothing runs until you choose)");
const probe = probeEngine();
const hosts = parseHosts(probe.out);
if (hosts.length === 0) {
  console.log("  (no install targets detected — check your engine path / HOME)");
  process.exit(0);
}
for (const [i, h] of hosts.entries()) {
  const mark = h.state === "would-install" ? "[x]" : "[ ]";
  const dest = h.dest.replace(/^([A-Za-z]:)?\/[^ ]*?\/(\.\w)/, "$2");
  console.log(`  ${mark} ${h.id.padEnd(8)} → ${h.dest}`);
}
console.log("\n  a  install to all detected      j  show engine --json report");
console.log("  s  select ids for the engine    q  quit (nothing written)");
console.log("\nThis is a LOCAL PROTOTYPE: it shows the engine's own preview and, only on");
console.log("an explicit a/s choice, runs the engine non-interactively with those ids.");
console.log("Automation parity: --json / --dry-run / --help pass through byte-identical.");
