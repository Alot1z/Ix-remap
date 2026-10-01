// Copyright 2026 Ix Infrastructure Inc.

import { afterEach, describe, expect, it, vi } from "vitest";

import { withheldOnDegraded } from "../commands/impact.js";
import { formatEdgeResults, renderEdgeResultsLlm, sliceEdgeResults, type Diagnostic } from "../format.js";
import { assessGraphStats, graphHealthJson, graphHealthProse } from "../graph-health.js";
import { inferRiskSemantics } from "../impact/risk-semantics.js";

/**
 * `ix callers`, `ix callees` and `ix impact` on a hollowed graph: an empty
 * edge list there is lost edges, not "no callers", and "low risk" is "no
 * edges left", not "safe to change". Each says so instead.
 */

const DEGRADED = assessGraphStats({
  nodes: { total: 9243, byKind: [{ kind: "file", count: 333 }, { kind: "function", count: 8910 }] },
  edges: { total: 387, byPredicate: [{ predicate: "CONTAINS", count: 38 }, { predicate: "CALLS", count: 222 }] },
});
const DIAG: Diagnostic[] = [{ code: "graph_degraded", message: graphHealthProse(DEGRADED) }];

afterEach(() => vi.restoreAllMocks());

describe("edge results on a degraded graph", () => {
  it("llm: the degraded diagnostic replaces a bare no_edges", () => {
    const lines = renderEdgeResultsLlm(sliceEdgeResults([], 50), "callers", "parseBudgetOption", "graph", DIAG);
    expect(lines.some((l) => l.startsWith("diagnostic code=graph_degraded"))).toBe(true);
    expect(lines.some((l) => l.includes("code=no_edges"))).toBe(false);
  });

  it("json: carries the diagnostic, not no_edges", () => {
    const out: string[] = [];
    vi.spyOn(console, "log").mockImplementation((s: string) => { out.push(s); });
    formatEdgeResults(sliceEdgeResults([], 50), "callees", "budgetParser", "json", undefined, "graph", DIAG);
    const parsed = JSON.parse(out.join("\n"));
    expect(parsed.diagnostics.map((d: Diagnostic) => d.code)).toEqual(["graph_degraded"]);
  });

  it("text: an empty result gives the degraded reason, once", () => {
    const out: string[] = [];
    vi.spyOn(console, "log").mockImplementation((s: string) => { out.push(s); });
    formatEdgeResults(sliceEdgeResults([], 50), "callees", "budgetParser", "text", undefined, "graph", DIAG);
    expect(out).toEqual([graphHealthProse(DEGRADED)]);
  });
});

describe("impact risk on a degraded graph", () => {
  const risk = inferRiskSemantics({
    name: "parseBudgetOption", kind: "function", path: "ix-cli/src/cli/options.ts",
    members: 0, callers: 0, callees: 0, directImporters: 0, directDependents: 0, memberLevelCallers: 0,
    propagationBuckets: [], topCallerNames: [],
  });

  it("is withheld as unknown", () => {
    const withheld = withheldOnDegraded(risk, graphHealthJson(DEGRADED));
    expect(withheld.riskLevel as string).toBe("unknown");
    expect(withheld.riskSummary).toMatch(/^Unknown: this workspace's graph is missing/);
  });

  it("is unchanged on a healthy graph", () => {
    expect(withheldOnDegraded(risk, undefined)).toBe(risk);
  });
});
