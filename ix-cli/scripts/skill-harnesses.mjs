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
 * `--probe` appends a sixth field per line, `1` when the harness is present
 * and `0` when not. Presence mirrors what install-skill.sh used to compute
 * inline: the bin is found (via toolscan when available, PATH otherwise) or
 * the config directory exists. The toolscan seam is optional and additive —
 * when TOOLSCAN_PATH is set (or `toolscan` is on PATH) its discovery output
 * scans the common install roots beyond PATH (~/.local/bin, %LOCALAPPDATA%,
 * ...); when it is unavailable the embedded PATH probe decides, so a clean
 * machine behaves exactly as before and CI never needs toolscan.
 *
 *   node scripts/skill-harnesses.mjs                  # default: the repo's hosts.ts
 *   node scripts/skill-harnesses.mjs --probe          # with a presence flag per row
 *   HARNESS_HOSTS_FILE=P node scripts/skill-harnesses.mjs  # explicit file (tests)
 *   HARNESS_HOME=P node scripts/skill-harnesses.mjs --probe  # where ~ resolves (hermetic tests)
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const defaultHostsPath = join(here, "..", "src", "mcp", "hosts.ts");

const OVERRIDES = {
  claude: { cfg: "~/.claude", skill: "~/.claude/skills" },
  vscode: { cfg: "~/.vscode", skill: "~/.vscode/skills" },
  cursor: { cfg: "~/.cursor", skill: "~/.cursor/skills" },
  opencode: { cfg: "~/.config/opencode", skill: "~/.config/opencode/skills" },
  agents: { cfg: "~/.agents", skill: "~/.agents/skills" },
};

/** A harness row as read from hosts.ts (cfg/skill still `~`-unexpanded). */
const unquote = (s) => (s ? s.replace(/^\"|\"$/g, "") : s);

/**
 * Read the harness table from hosts.ts.
 *
 * Splits hosts.ts into host blocks. A block starts at a line carrying
 * `id: "..."`; its extent is tracked by brace depth (the opening `{` of the
 * host object sits on the line above the id, so the block closes on the first
 * line whose net depth goes negative — `}),` for cliHost, `},` for the plain
 * host objects — without tripping on method bodies like `async register() {`).
 */
export function readHarnesses(hostsPath = process.env.HARNESS_HOSTS_FILE ?? defaultHostsPath) {
  let src;
  try {
    src = readFileSync(hostsPath, "utf8");
  } catch (err) {
    throw new Error(`cannot read ${hostsPath}: ${err.message}`);
  }

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

  const field = (block, key) => {
    for (const line of block) {
      const m = line.match(new RegExp(`^\\s*${key}:\\s*(.*?),?$`));
      if (m) return m[1].trim();
    }
    return null;
  };

  const warnings = [];
  const rows = [];
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
        warnings.push(
          `skill-harnesses: ${id} has no skill-dir convention derivable from hosts.ts ` +
            `(target: ${target ?? "none"}) — add an OVERRIDES entry`,
        );
        continue;
      }
    }
    rows.push({ id, label, bin, cfg, skill });
  }

  // ~/.agents is the agents.md surface, not an MCP host — always in the table.
  if (!blocks.some((b) => b[0] === "agents")) {
    rows.push({ id: "agents", label: "Agents (agents.md)", bin: "", cfg: "~/.agents", skill: "~/.agents/skills" });
  }

  return { rows, warnings };
}

/** Whether a bare command resolves on PATH (the embedded fallback probe). */
export function binOnPath(bin) {
  if (!bin) return false;
  try {
    execFileSync(process.platform === "win32" ? "where" : "which", [bin], {
      stdio: "ignore",
      windowsHide: true,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Resolve the toolscan command: TOOLSCAN_PATH first, then `toolscan` on PATH.
 * Returns null when toolscan is unavailable — the seam degrades, it never
 * fails the install.
 */
export function resolveToolscan() {
  const explicit = process.env.TOOLSCAN_PATH?.trim();
  if (explicit) {
    return /\.m?js$/i.test(explicit)
      ? { cmd: process.execPath, args: [explicit] }
      : { cmd: explicit, args: [] };
  }
  try {
    const out = execFileSync(process.platform === "win32" ? "where" : "which", ["toolscan"], {
      encoding: "utf8",
      windowsHide: true,
      stdio: ["ignore", "pipe", "ignore"],
    });
    const first = out
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find(Boolean);
    if (!first) return null;
    return /\.m?js$/i.test(first) ? { cmd: process.execPath, args: [first] } : { cmd: first, args: [] };
  } catch {
    return null;
  }
}

/**
 * Run toolscan once and return the set of tool names it found (lowercased),
 * or null when toolscan is unavailable or misbehaves.
 */
export function runToolscanOnce(resolve = resolveToolscan) {
  const target = resolve();
  if (!target) return null;
  try {
    const useShell = process.platform === "win32" && /\.(cmd|bat)$/i.test(target.cmd);
    const out = execFileSync(target.cmd, target.args, {
      encoding: "utf8",
      timeout: 20_000,
      windowsHide: true,
      stdio: ["ignore", "pipe", "ignore"],
      ...(useShell ? { shell: true } : {}),
    });
    const parsed = JSON.parse(out);
    const tools = Array.isArray(parsed?.tools) ? parsed.tools : [];
    const names = new Set();
    for (const tool of tools) {
      if (typeof tool?.name === "string" && tool.name !== "") names.add(tool.name.toLowerCase());
    }
    return names;
  } catch {
    return null;
  }
}

/**
 * Whether one harness is present: the bin is found (via toolscan when
 * available, PATH otherwise) or the config directory exists — so a GUI-only
 * install is still found, and toolscan only ever adds evidence.
 *
 * `deps` injects the probe functions so tests stay hermetic; the defaults are
 * the real implementations (toolscan output when present, `where`/`which`,
 * and the filesystem).
 */
export function probePresent(row, deps = {}) {
  const { toolscanNames = null, binOnPath: which = binOnPath, exists = existsSync } = deps;
  const binFound = toolscanNames ? toolscanNames.has(row.bin.toLowerCase()) : false;
  const binPresent = binFound || which(row.bin);
  // `~` resolves to the user's home — overridable through HARNESS_HOME so a
  // hermetic run can point it at an empty temp dir (install-skill.sh expands
  // `~` itself with $HOME for the destination paths; this override exists so
  // the presence decision agrees with that view on Windows, where node's
  // os.homedir() does not follow $HOME).
  const cfgExpanded = row.cfg.replace(/^~/, process.env.HARNESS_HOME || homedir());
  return binPresent || exists(cfgExpanded);
}

export function main(argv = process.argv.slice(2)) {
  const probe = argv.includes("--probe");
  let rows;
  let warnings;
  try {
    ({ rows, warnings } = readHarnesses());
  } catch (err) {
    process.stderr.write(`skill-harnesses: ${err.message}\n`);
    process.exit(1);
  }
  for (const warning of warnings) process.stderr.write(`${warning}\n`);

  const toolscanNames = probe ? runToolscanOnce() : null;
  const out = rows.map((row) => {
    const base = [row.id, row.label, row.bin, row.cfg, row.skill];
    if (!probe) return base.join("|");
    return [...base, probePresent(row, { toolscanNames }) ? "1" : "0"].join("|");
  });
  process.stdout.write(`${out.join("\n")}\n`);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main();
}