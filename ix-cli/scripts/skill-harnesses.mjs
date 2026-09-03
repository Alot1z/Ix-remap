#!/usr/bin/env node
/**
 * Harness registry reader for scripts/install-skill.sh.
 *
 * The single source of truth for "which agent harnesses exist" is
 * ix-cli/src/mcp/hosts.ts — the same host table `ix mcp install` drives.
 * install-skill.sh calls this helper instead of keeping its own copy, so a
 * harness added to hosts.ts becomes installable with zero edits to the shell
 * script.
 *
 * hosts.ts is read as checked-in source (no build, no installed CLI). Each
 * host block's id/label/bin/target are extracted; the skill destination is
 * derived from the target's config directory (`~/.codex/config.toml` ->
 * `~/.codex/skills/ix`). Overrides exist only where hosts.ts cannot express
 * the convention:
 *
 *   claude   — target is "user scope", not a path
 *   vscode   — its MCP config path is platform-dependent, not ~/.vscode
 *   cursor   — config path comes from a helper (cursorConfigPath())
 *   opencode — config path comes from a helper (opencodeConfigPath())
 *   agents   — ~/.agents is the agents.md surface; it is not an MCP host and
 *             hosts.ts cannot know it, so it is appended as a supplement
 *
 * Output: one line per harness, `id|label|bin|config-dir|skill-dir`, with
 * `~` unexpanded (the shell expands it). A host whose target carries no
 * literal config path (and has no override) is reported to stderr and skipped
 * — loudly, so an exotic new host cannot vanish silently.
 *
 *   node scripts/skill-harnesses.mjs                  # default: the repo's hosts.ts
 *   HARNESS_HOSTS_FILE=P node scripts/skill-harnesses.mjs  # explicit file (tests)
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const hostsPath =
  process.env.HARNESS_HOSTS_FILE ?? join(here, "..", "src", "mcp", "hosts.ts");

const OVERRIDES = {
  claude: { cfg: "~/.claude", skill: "~/.claude/skills" },
  vscode: { cfg: "~/.vscode", skill: "~/.vscode/skills" },
  cursor: { cfg: "~/.cursor", skill: "~/.cursor/skills" },
  opencode: { cfg: "~/.config/opencode", skill: "~/.config/opencode/skills" },
  agents: { cfg: "~/.agents", skill: "~/.agents/skills" },
};

let src;
try {
  src = readFileSync(hostsPath, "utf8");
} catch (err) {
  process.stderr.write(`skill-harnesses: cannot read ${hostsPath}: ${err.message}\n`);
  process.exit(1);
}

// Split hosts.ts into host blocks. A block starts at a line carrying
// `id: "..."`; its extent is tracked by brace depth (the opening `{` of the
// host object sits on the line above the id, so the block closes on the first
// line whose net depth goes negative — `}),` for cliHost, `},` for the plain
// host objects — without tripping on method bodies like `async register() {`).
const blocks = [];
{
  let block = null;
  let depth = 0;
  for (const line of src.split(/\r?\n/)) {
    if (block === null) {
      const id = line.match(/id:\s*"([^"]+)"/);
      if (id) {
        block = [id[1]];
        depth = 0;
      }
      continue;
    }
    depth += (line.match(/\{/g) ?? []).length;
    depth -= (line.match(/\}/g) ?? []).length;
    block.push(line);
    if (depth < 0) {
      blocks.push(block);
      block = null;
    }
  }
}

const unquote = (s) => (s ? s.replace(/^"|"$/g, "") : s);

const field = (block, key) => {
  for (const line of block) {
    const m = line.match(new RegExp(`^\\s*${key}:\\s*(.*?),?$`));
    if (m) return m[1].trim();
  }
  return null;
};

const out = [];
for (const block of blocks) {
  const id = block[0];
  const label = unquote(field(block, "label")) ?? id;
  const bin = unquote(field(block, "bin")) ?? "";
  let cfg = null;
  let skill = null;
  if (OVERRIDES[id]) {
    cfg = OVERRIDES[id].cfg;
    skill = OVERRIDES[id].skill;
  } else {
    const target = field(block, "target");
    if (target && /^"\$HOME\/|^"~\//.test(target)) {
      const t = unquote(target).replace(/^\$HOME/, "~");
      cfg = t.slice(0, t.lastIndexOf("/")); // ~/.codex/config.toml -> ~/.codex
      skill = `${cfg}/skills`;
    } else {
      process.stderr.write(
        `skill-harnesses: ${id} has no skill-dir convention derivable from hosts.ts ` +
          `(target: ${target ?? "none"}) — add an OVERRIDES entry\n`,
      );
      continue;
    }
  }
  out.push([id, label, bin, cfg, skill].join("|"));
}

// ~/.agents is the agents.md surface, not an MCP host — always in the table.
if (!blocks.some((b) => b[0] === "agents")) {
  out.push("agents|Agents (agents.md)||~/.agents|~/.agents/skills");
}

process.stdout.write(`${out.join("\n")}\n`);