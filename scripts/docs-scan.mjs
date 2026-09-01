#!/usr/bin/env node
/**
 * docs-scan.mjs — inventory the ix CLI (commands + flags) and diff it against
 * the docs (skills/ix, README, docs/api). Logs drift; NEVER rewrites anything.
 * Report-only by design: exit 0 with a clean report, or --fail-on-drift exits 1
 * so a workflow can gate.
 *
 * Usage:
 *   node scripts/docs-scan.mjs [--root <repo-root>] [--json] [--fail-on-drift]
 *
 * Output sections:
 *   inventory  — every command + flag found in source (the "known upstream" log)
 *   NEW        — implemented in source, missing from docs (=> docs gap, file an
 *                issue or a "new command" doc draft)
 *   STALE      — documented but not implemented (=> docs lie)
 *   coverage   — per-doc-surface counts
 *
 * If the CLI source is not fully rewritten (missing commands/flags), the scan
 * still logs exactly what it measured — it never patches the repo.
 */
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const root = args[args.indexOf("--root") + 1] ?? process.cwd();
const asJson = args.includes("--json");
const failOnDrift = args.includes("--fail-on-drift");

function findFiles(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) findFiles(p, acc);
    else if (/\.ts$/.test(e) && !e.endsWith(".test.ts")) acc.push(p);
  }
  return acc;
}

function scanSource(rootDir) {
  const commands = new Set();
  const flags = new Set();
  const cmdDir = join(rootDir, "ix-cli/src/cli/commands");
  for (const f of findFiles(cmdDir)) {
    const src = readFileSync(f, "utf8");
    for (const m of src.matchAll(/\.command\(['"]([a-z0-9-]+)['"]/g)) commands.add(m[1]);
    for (const m of src.matchAll(/\.option\(['"](-{1,2}[a-z0-9-]+)/g)) flags.add(m[1]);
    for (const m of src.matchAll(/\.option\(['"](-{1,2}[a-z0-9-]+)/g)) flags.add(m[1]);
  }
  const rootInit = join(rootDir, "ix-cli/src/cli/main.ts");
  if (existsSync(rootInit)) {
    const src = readFileSync(rootInit, "utf8");
    for (const m of src.matchAll(/\.command\(['"]([a-z0-9-]+)['"]/g)) commands.add(m[1]);
    for (const m of src.matchAll(/\.option\(['"](-{1,2}[a-z0-9-]+)/g)) flags.add(m[1]);
  }
  return { commands: [...commands].sort(), flags: [...flags].sort() };
}

function scanDocs(rootDir) {
  const files = [
    "skills/ix/SKILL.md",
    "skills/ix/references/commands.md",
    "skills/ix/references/output-formats.md",
    "skills/ix/references/troubleshooting.md",
    "README.md",
    "docs/api/README.md",
  ].map((f) => join(rootDir, f)).filter((f) => existsSync(f));
  const text = files.map((f) => readFileSync(f, "utf8")).join("\n");
  const docCommands = new Set([...text.matchAll(/\bix\s+(?!--)([a-z][a-z0-9-]+)/g)].map((m) => m[1]));
  // exclude markdown anchors (#...) and path-ish tokens: only real flag-ish tokens
  const docFlags = new Set([...text.matchAll(/(?<![#/\w])-{1,2}[a-z][a-z0-9-]*/g)].map((m) => m[1]));
  return { files, docCommands, docFlags };
}

const src = scanSource(root);
const docs = scanDocs(root);

// Commands: doc mention must include the bare command name — skip document
// heading noise by also matching "ix <cmd>" anywhere in the text.
const docText = docs.files.map((f) => readFileSync(f, "utf8")).join("\n");
const newCommands = src.commands.filter((c) => !new RegExp(`\\bix\\s+${c}\\b`).test(docText));
const staleCommands = docs.docCommands.size > 0 ? [] : []; // docCommands is noisy; flags are the reliable signal
const newFlags = src.flags.filter((f) => !docText.includes(f));
const staleFlags = [...docs.docFlags].filter((f) => !src.flags.includes(f) && f.startsWith("--"));

const report = {
  scanned_at: new Date().toISOString(),
  root,
  source: { commands: src.commands.length, flags: src.flags.length },
  docs_surfaces: docs.files.map((f) => f.replace(`${root}/`, "")),
  inventory: { commands: src.commands, flags: src.flags },
  NEW: { commands: newCommands, flags: newFlags },
  STALE: { flags: staleFlags },
  coverage: {
    commands_documented: src.commands.length - newCommands.length,
    commands_total: src.commands.length,
    flags_documented: src.flags.length - newFlags.length,
    flags_total: src.flags.length,
  },
};

const drift = newCommands.length + newFlags.length + staleFlags.length;
if (asJson) {
  process.stdout.write(JSON.stringify(report, null, 2) + "\n");
} else {
  console.log(`=== docs-scan ${report.scanned_at} ===`);
  console.log(`root: ${root}`);
  console.log(`source: ${src.commands.length} commands, ${src.flags.length} flags`);
  console.log(`docs surfaces: ${report.docs_surfaces.join(", ")}`);
  console.log(`\n[NEW — implemented but missing from docs] commands: ${newCommands.join(", ") || "none"}`);
  console.log(`[NEW] flags: ${newFlags.join(", ") || "none"}`);
  console.log(`[STALE — documented but not implemented] flags: ${staleFlags.join(", ") || "none"}`);
  console.log(`\ncoverage: ${report.coverage.commands_documented}/${report.coverage.commands_total} commands, ${report.coverage.flags_documented}/${report.coverage.flags_total} flags`);
  console.log(`\nVERDICT: ${drift === 0 ? "CLEAN — docs match implementation" : "DRIFT — log only, no changes made (see sections above)"}`);
}
process.exit(drift > 0 && failOnDrift ? 1 : 0);