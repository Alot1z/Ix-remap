// Copyright 2026 Ix Infrastructure Inc.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

// This suite is about what a miss says, not about scoping.
vi.mock("../bootstrap.js", async (orig) => ({
  ...(await orig<typeof import("../bootstrap.js")>()),
  resolveWorkspaceId: () => "ws-test",
}));

import { editDistance, nearestNames, resetReadScope, resolveFileOrEntityFull, resolveFileOrReport } from "../resolve.js";
import { resetGraphHealthMemo } from "../graph-health.js";

function node(id: string, name: string, kind: string, sourceUri: string) {
  return { id, name, kind, attrs: {}, provenance: { sourceUri } };
}

/** A client whose search answers from a fixed list by case-insensitive substring, like the backend. */
function graph(nodes: ReturnType<typeof node>[]) {
  const search = vi.fn(async (term: string, opts?: { kind?: string }) =>
    nodes.filter((n) => n.name.toLowerCase().includes(term.toLowerCase()) && (!opts?.kind || n.kind === opts.kind)));
  return { search, workspaceSystem: async () => ({ systemId: null }) } as never as Parameters<typeof resolveFileOrEntityFull>[0] & { search: typeof search };
}

const NODES = [
  node("f-opts", "options.ts", "file", "ix-cli/src/cli/options.ts"),
  node("f-pkg-cli", "package.json", "file", "ix-cli/package.json"),
  node("f-pkg-root", "package.json", "file", "package.json"),
  node("fn-parse", "parseBudgetOption", "function", "ix-cli/src/cli/options.ts"),
  node("ch-parse", "parseBudgetOption", "chunk", "ix-cli/src/cli/options.ts"),
  node("fn-root", "resolveWorkspaceRoot", "function", "ix-cli/src/cli/config.ts"),
];

let dir: string;
let savedCwd: string;

beforeEach(() => {
  dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "ix-miss-")));
  process.env.IX_HOME = path.join(dir, ".ix");
  savedCwd = process.cwd();
  process.chdir(dir);
  resetReadScope();
});

afterEach(() => {
  process.chdir(savedCwd);
  delete process.env.IX_HOME;
  resetReadScope();
  fs.rmSync(dir, { recursive: true, force: true });
});

describe("editDistance", () => {
  it("counts single-character edits, ignoring case", () => {
    expect(editDistance("parseBudgetOptoin", "parseBudgetOption")).toBe(2);
    expect(editDistance("resolveWorkspaceRooot", "resolveWorkspaceRoot")).toBe(1);
    expect(editDistance("ABC", "abc")).toBe(0);
    expect(editDistance("", "abc")).toBe(3);
  });
});

describe("a symbol the substring search cannot match", () => {
  it("is offered the nearest names, definitions only, without chunk copies", async () => {
    const client = graph(NODES);
    const result = await resolveFileOrEntityFull(client, "parseBudgetOptoin", { format: "json" });
    expect(result).toMatchObject({ resolved: false, ambiguous: false });
    expect((result as { suggestions?: unknown[] }).suggestions).toEqual([
      { id: "fn-parse", name: "parseBudgetOption", kind: "function", path: "ix-cli/src/cli/options.ts" },
    ]);
  });

  it("is offered nothing when nothing is close", async () => {
    const near = await nearestNames(graph(NODES), "completelyUnrelatedName", {});
    expect(near).toEqual([]);
  });
});

describe("a file target that misses", () => {
  it("says the file is on disk but not in the graph, and what to run", async () => {
    fs.mkdirSync(path.join(dir, "src"));
    fs.writeFileSync(path.join(dir, "src", "fresh.ts"), "export const x = 1;\n");
    const result = await resolveFileOrEntityFull(graph(NODES), "src/fresh.ts", { format: "json" });
    expect(result).toMatchObject({ resolved: false, reason: "file_not_in_graph" });
    expect((result as { message?: string }).message).toContain("exists on disk but is not in the graph");
    expect((result as { message?: string }).message).toContain("ix map");
  });

  it("says it exists nowhere, and suggests the graph's nearest file", async () => {
    const result = await resolveFileOrEntityFull(graph(NODES), "ix-cli/src/cli/optons.ts", { format: "json" });
    expect(result).toMatchObject({
      resolved: false,
      reason: "file_not_found",
      message: 'No file "ix-cli/src/cli/optons.ts" in the graph, and none at that path on disk.',
    });
    expect((result as { suggestions?: Array<{ name: string }> }).suggestions?.map((s) => s.name)).toEqual(["options.ts"]);
  });

  it("does not answer a path with a same-named file somewhere else", async () => {
    // `docs-site/package.json` resolved to the repo-root `package.json`.
    const result = await resolveFileOrEntityFull(graph(NODES), "docs-site/package.json", { format: "json" });
    expect(result.resolved).toBe(false);
    expect((result as { reason?: string }).reason).toBe("file_not_found");
  });

  it("still resolves a path that names the file, from a subdirectory or with ./", async () => {
    for (const target of ["ix-cli/src/cli/options.ts", "src/cli/options.ts", "./src/cli/options.ts", "options.ts"]) {
      const result = await resolveFileOrEntityFull(graph(NODES), target, { format: "json" });
      expect(result.resolved, target).toBe(true);
      if (result.resolved) expect(result.entity.id).toBe("f-opts");
    }
  });
});

describe("a miss on a graph that is empty", () => {
  it("says the graph is empty rather than that the name does not exist", async () => {
    resetGraphHealthMemo();
    const client = {
      endpoint: "http://backend.test",
      search: vi.fn(async () => []),
      workspaceSystem: async () => ({ systemId: null }),
      currentRevision: async () => 7,
      stats: async () => ({ nodes: { total: 0, byKind: [] }, edges: { total: 0, byPredicate: [] } }),
    };
    const out: string[] = [];
    const log = vi.spyOn(console, "log").mockImplementation((...a) => void out.push(a.join(" ")));
    const saved = process.exitCode;
    try {
      expect(await resolveFileOrReport(client as never, "zzhpAlphaOne", undefined, "json")).toBeNull();
    } finally {
      log.mockRestore();
      process.exitCode = saved;
    }
    expect(JSON.parse(out.join("\n"))).toMatchObject({
      error: "unresolved_target",
      graph: { status: "empty", reason: "no_nodes", fix: "ix map" },
    });
  });
});
