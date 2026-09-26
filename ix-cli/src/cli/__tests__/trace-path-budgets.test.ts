// Copyright 2026 Ix Infrastructure Inc.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Command } from "commander";
import { registerTraceCommand } from "../commands/trace.js";

const expand = vi.hoisted(() => vi.fn());
vi.mock("../../client/api.js", () => ({
  IxClient: class { async expand(...args: unknown[]) { return expand(...args); } },
}));
vi.mock("../resolve.js", async (importOriginal) => ({
  ...await importOriginal<typeof import("../resolve.js")>(),
  resolveFileOrEntityFull: async (_client: unknown, name: string) => ({
    resolved: true, entity: { id: name, name, kind: "function" },
  }),
  resolveFileOrReport: async (_client: unknown, name: string) => ({ id: name, name, kind: "function" }),
}));

async function runTrace(args: string[]) {
  const program = new Command().name("ix").exitOverride();
  registerTraceCommand(program);
  const output: string[] = [];
  vi.spyOn(console, "log").mockImplementation((...parts) => { output.push(parts.join(" ")); });
  await program.parseAsync(["trace", "A", "--kind", "calls", ...args], { from: "user" });
  return output.join("\n");
}

async function run(args: string[], format = "json", to = "C") {
  const program = new Command().name("ix").exitOverride();
  registerTraceCommand(program);
  const output: string[] = [];
  vi.spyOn(console, "log").mockImplementation((...parts) => { output.push(parts.join(" ")); });
  await program.parseAsync(["trace", "A", "--to", to, "--kind", "calls", ...args, "--format", format], { from: "user" });
  return output.join("\n");
}

describe("trace --to search budgets", () => {
  beforeEach(() => {
    expand.mockReset().mockImplementation(async (id: string, opts: { direction: string }) => {
      const adjacent: Record<string, string[]> = opts.direction === "out"
        ? { A: ["B"], B: ["C"] } : { B: ["A"], C: ["B"] };
      return { nodes: (adjacent[id] ?? []).map(name => ({ id: name, name, kind: "function" })), edges: [] };
    });
  });
  afterEach(() => vi.restoreAllMocks());

  it("does not return a two-edge path at depth one", async () => {
    const output = JSON.parse(await run(["--depth", "1"]));
    expect(output.path).toBeNull();
    expect(expand.mock.calls.map(([id]) => id)).toEqual(["A", "A"]);
  });

  it("finds a path exactly at the depth boundary", async () => {
    const output = JSON.parse(await run(["--depth", "2"]));
    expect(output.path.map((n: { name: string }) => n.name)).toEqual(["A", "B", "C"]);
  });

  it("does not expand the source at depth zero", async () => {
    expect(JSON.parse(await run(["--depth", "0"])).path).toBeNull();
    expect(expand).not.toHaveBeenCalled();
  });

  it("enforces the node cap before visiting the target", async () => {
    expect(JSON.parse(await run(["--cap", "2"])).path).toBeNull();
  });

  it("finds the route when the cap includes all three nodes", async () => {
    expect(JSON.parse(await run(["--cap", "3"])).path).toHaveLength(3);
  });

  it("does no graph expansion at cap zero", async () => {
    expect(JSON.parse(await run(["--cap", "0"])).path).toBeNull();
    expect(expand).not.toHaveBeenCalled();
  });

  it("returns a zero-edge self path without expansion", async () => {
    expect(JSON.parse(await run(["--depth", "0", "--cap", "1"], "json", "A")).path).toHaveLength(1);
    expect(expand).not.toHaveBeenCalled();
  });

  it.each(["json", "llm", "text"])("qualifies a bounded miss in %s output", async (format) => {
    const output = await run(["--depth", "1", "--cap", "2"], format);
    expect(output).toContain("within the requested search limits");
  });

  it("preserves an unrestricted successful route", async () => {
    expect(JSON.parse(await run([])).path).toHaveLength(3);
  });
});

describe("trace completeness in command output", () => {
  beforeEach(() => {
    expand.mockReset().mockImplementation(async (id: string, opts: { direction: string }) => {
      const adjacent: Record<string, string[]> = opts.direction === "out"
        ? { A: ["B"], B: ["C"] } : { B: ["A"], C: ["B"] };
      return { nodes: (adjacent[id] ?? []).map(name => ({ id: name, name, kind: "function" })), edges: [] };
    });
  });
  afterEach(() => vi.restoreAllMocks());

  const codes = (out: { diagnostics?: Array<{ code: string }> }) => (out.diagnostics ?? []).map(d => d.code);

  it("adds search_cut naming the cap when the node budget stopped a --to search", async () => {
    const out = JSON.parse(await run(["--cap", "2"]));
    expect(codes(out)).toEqual(["no_path", "search_cut"]);
    expect(out.diagnostics[1].message).toContain("Node cap of 2 reached");
  });

  it("adds search_cut naming the depth when the depth bound stopped a --to search", async () => {
    const out = JSON.parse(await run(["--depth", "1"]));
    expect(codes(out)).toEqual(["no_path", "search_cut"]);
    expect(out.diagnostics[1].message).toContain("Stopped descending at depth 1");
  });

  it("treats cap zero as a cut, not as proof that no route exists", async () => {
    const out = JSON.parse(await run(["--cap", "0"]));
    expect(codes(out)).toEqual(["no_path", "search_cut"]);
    expect(out.diagnostics[1].message).toContain("Node cap of 0 reached");
  });

  it("emits only no_path when the search exhausted the graph", async () => {
    const out = JSON.parse(await run(["--depth", "10"], "json", "Z"));
    expect(codes(out)).toEqual(["no_path"]);
  });

  it("prints the raise-the-bound hint under a cut miss in text output", async () => {
    expect(await run(["--cap", "2"], "text")).toContain("Raise --cap");
    expect(await run(["--depth", "10"], "text", "Z")).not.toContain("Raise --");
  });

  it("carries depth_limited in single-direction json", async () => {
    const out = JSON.parse(await runTrace(["--downstream", "--depth", "1", "--format", "json"]));
    expect(out.summary.depth_limited).toBe(true);
    expect(codes(out)).toEqual(["depth_limited"]);
  });

  it("carries the traversal bounds in both-direction json only when one was hit", async () => {
    const limited = JSON.parse(await runTrace(["--depth", "1", "--format", "json"]));
    expect(limited.traversal).toEqual({ truncated: false, depth_limited: true, node_cap: 100 });
    expect(limited.downstream.summary.depth_limited).toBe(true);
    expect(codes(limited)).toEqual(["depth_limited"]);

    const clean = JSON.parse(await runTrace(["--depth", "5", "--format", "json"]));
    expect(clean.traversal.depth_limited).toBeUndefined();
    expect(clean.diagnostics).toBeUndefined();
  });
});
