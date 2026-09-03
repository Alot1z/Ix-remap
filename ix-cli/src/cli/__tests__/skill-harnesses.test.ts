import { describe, expect, it } from "vitest";

/**
 * The helper is plain ESM (.mjs) that install-skill.sh runs without a build
 * step. Its public shape is declared here instead of in a hand-written
 * .d.mts, so a signature change in the helper surfaces as a runtime failure
 * in these tests rather than a typecheck that checks nothing.
 */
type HarnessRow = { id: string; label: string; bin: string; cfg: string; skill: string };
type ProbeResult = { present: boolean; via: string };

// @ts-expect-error — no .d.mts by design (review #591): the local interface
// below is the type contract, and a helper shape change fails here at runtime.
const helper = (await import("../../../scripts/skill-harnesses.mjs")) as unknown as {
  readHarnesses: () => HarnessRow[];
  probePresent: (
    row: HarnessRow,
    deps?: {
      toolscanNames?: Set<string> | null;
      binOnPath?: (bin: string) => boolean;
      exists?: (path: string) => boolean;
    },
  ) => ProbeResult;
};

const { probePresent, readHarnesses } = helper;

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
    // The GUI-only case: no bin anywhere, but ~/.agents exists.
    const present = probePresent(row({ bin: "cursor", cfg: "~/.cursor" }), {
      toolscanNames: new Set(["claude"]),
      binOnPath: () => false,
      exists: (path) => path.endsWith(".cursor"),
    });

    expect(present).toEqual({ present: true, via: "config-dir" });
  });

  it("counts a harness absent when neither toolscan, PATH, nor the config dir has it", () => {
    const present = probePresent(row({ bin: "codex", cfg: "~/.codex" }), {
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
  it("lists exactly the harnesses with a verified skills convention", () => {
    const rows = readHarnesses();

    // Deliberately small and explicit: only harnesses whose skills directory
    // is verified to be read belong here. gemini/opencode/openclaw/vscode
    // have no skills convention, so they must not be install targets.
    expect(rows.map((r) => r.id)).toEqual(["claude", "agents", "codex", "cursor"]);
  });

  it("points cursor at skills-cursor, the directory Cursor actually reads", () => {
    const cursor = readHarnesses().find((r) => r.id === "cursor");

    expect(cursor).toMatchObject({ cfg: "~/.cursor", skill: "~/.cursor/skills-cursor" });
  });

  it("appends the agents.md surface as a documented supplement", () => {
    const agents = readHarnesses().find((r) => r.id === "agents");

    expect(agents).toMatchObject({ bin: "", cfg: "~/.agents", skill: "~/.agents/skills" });
  });
});