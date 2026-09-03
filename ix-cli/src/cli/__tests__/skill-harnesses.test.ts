import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { probePresent, readHarnesses } from "../../../scripts/skill-harnesses.mjs";

const scratch: string[] = [];

afterEach(() => {
  for (const dir of scratch.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function tempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "ix-skill-harnesses-"));
  scratch.push(dir);
  return dir;
}

const row = (overrides: Partial<{ bin: string; cfg: string }> = {}) => ({
  id: "claude",
  label: "Claude Code",
  bin: "claude",
  cfg: "~/.claude",
  skill: "~/.claude/skills",
  ...overrides,
});

describe("probePresent", () => {
  it("counts a harness present when toolscan found its CLI, even off PATH", () => {
    const present = probePresent(row(), {
      toolscanNames: new Set(["claude"]),
      binOnPath: () => false,
      exists: () => false,
    });

    expect(present).toEqual({ present: true, via: "toolscan" });
  });

  it("counts a harness present when its config dir exists, even with no CLI", () => {
    // The GUI-only case: no bin anywhere, but ~/.gemini exists.
    const present = probePresent(row({ bin: "gemini", cfg: "~/.gemini" }), {
      toolscanNames: new Set(["claude"]),
      binOnPath: () => false,
      exists: (path) => path.endsWith(".gemini"),
    });

    expect(present).toEqual({ present: true, via: "config-dir" });
  });

  it("counts a harness absent when neither toolscan, PATH, nor the config dir has it", () => {
    const present = probePresent(row({ bin: "openclaw", cfg: "~/.openclaw" }), {
      toolscanNames: new Set(["claude"]),
      binOnPath: () => false,
      exists: () => false,
    });

    expect(present).toEqual({ present: false, via: "none" });
  });

  it("falls back to the embedded PATH probe when toolscan is unavailable", () => {
    const present = probePresent(row(), {
      toolscanNames: null,
      binOnPath: () => true,
      exists: () => false,
    });

    expect(present).toEqual({ present: true, via: "path" });
  });

  it("matches toolscan names against the lowercased bin", () => {
    // runToolscanOnce lowercases at ingestion; the probe receives that shape.
    const present = probePresent(row(), {
      toolscanNames: new Set(["claude"]),
      binOnPath: () => false,
      exists: () => false,
    });

    expect(present).toEqual({ present: true, via: "toolscan" });
  });
});

describe("readHarnesses", () => {
  it("reads the checked-in hosts.ts table", () => {
    const { rows, warnings } = readHarnesses();

    expect(rows.map((r) => r.id)).toEqual(
      expect.arrayContaining(["claude", "codex", "gemini", "openclaw", "vscode", "cursor", "opencode", "agents"]),
    );
    expect(warnings).toEqual([]);
  });

  it("derives the skill dir from a config-file target", () => {
    const codex = readHarnesses().rows.find((r) => r.id === "codex");

    // ~/.codex/config.toml -> cfg ~/.codex, skill ~/.codex/skills.
    expect(codex).toMatchObject({ cfg: "~/.codex", skill: "~/.codex/skills" });
  });

  it("appends the agents.md surface as a documented supplement", () => {
    const agents = readHarnesses().rows.find((r) => r.id === "agents");

    expect(agents).toMatchObject({ bin: "", cfg: "~/.agents", skill: "~/.agents/skills" });
  });

  it("reads an explicit hosts file (HARNESS_HOSTS_FILE)", () => {
    const fixture = join(tempDir(), "hosts.ts");
    writeFileSync(
      fixture,
      [
        "const hosts = [",
        "  {",
        '    id: "claude",',
        '    label: "Claude Code",',
        '    bin: "claude",',
        '    target: "user scope",',
        "  },",
        "  {",
        '    id: "codex",',
        '    label: "Codex CLI",',
        '    bin: "codex",',
        '    target: "~/.codex/config.toml",',
        "  },",
        "];",
      ].join("\n"),
    );

    const { rows, warnings } = readHarnesses(fixture);

    expect(rows.map((r) => r.id)).toEqual(["claude", "codex", "agents"]);
    expect(rows.find((r) => r.id === "codex")).toMatchObject({ cfg: "~/.codex", skill: "~/.codex/skills" });
    expect(warnings).toEqual([]);
  });

  it("warns loudly about a host with no derivable skill dir", () => {
    const fixture = join(tempDir(), "hosts.ts");
    writeFileSync(
      fixture,
      [
        "const hosts = [",
        "  {",
        '    id: "exotic",',
        '    label: "Exotic Host",',
        '    bin: "exotic",',
        '    target: "(computed at runtime)",',
        "  },",
        "];",
      ].join("\n"),
    );

    const { rows, warnings } = readHarnesses(fixture);

    expect(rows.map((r) => r.id)).toEqual(["agents"]);
    expect(warnings.some((w) => w.includes("exotic"))).toBe(true);
  });
});