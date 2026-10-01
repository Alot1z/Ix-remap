// Copyright 2026 Ix Infrastructure Inc.

import { describe, expect, it } from "vitest";

import type { IxClient } from "../../client/api.js";
import { collectFacts } from "../explain/facts.js";

/**
 * `collectFacts` runs its second round of reads -- the container, the target's
 * members, the neighbouring files' members -- together, and the neighbouring
 * files together with each other. What it returns must not depend on which
 * read finished first. The fake graph below answers the FIRST file slowest, so
 * a result assembled in completion order would come out reversed.
 */
const TARGET = "t";
const FILES = ["f1", "f2", "f3"];

function node(id: string, kind: string, line = 1) {
  return { id, name: id, kind, attrs: { line_start: line, line_end: line + 9 }, provenance: { sourceUri: `src/${id}.ts` } };
}

function slowFirstClient(): { client: IxClient; inFlightPeak: () => number } {
  let inFlight = 0;
  let peak = 0;
  const delay = (id: string) => (id.startsWith("f1") ? 30 : id.startsWith("f2") ? 15 : 1);
  const answer = async <T>(id: string, value: T): Promise<T> => {
    inFlight++;
    peak = Math.max(peak, inFlight);
    await new Promise((resolve) => setTimeout(resolve, delay(id)));
    inFlight--;
    return value;
  };
  const client = {
    async entity(id: string) {
      return answer(id, {
        node: node(id, "function"),
        claims: [],
        edges: id === TARGET ? [{ src: "container", dst: TARGET, predicate: "CONTAINS" }] : [],
      });
    },
    async expand(id: string, opts?: { direction?: string; predicates?: string[] }) {
      const preds = opts?.predicates ?? [];
      if (id === TARGET && opts?.direction === "out" && preds[0] === "IMPORTS") {
        return answer(id, { nodes: FILES.map((f) => node(f, "file")), edges: [] });
      }
      if (FILES.includes(id) && opts?.direction === "out" && preds[0] === "CONTAINS") {
        // Two functions per file; the second one is longer, so it leads the
        // structural order and the ranking has something to reorder.
        return answer(id, { nodes: [node(`${id}.a`, "function", 1), node(`${id}.b`, "function", 20)], edges: [] });
      }
      if (opts?.direction === "in" && preds.includes("CALLS") && preds.includes("IMPORTS") && id.includes(".")) {
        // Use counts: `.a` is used from two files, `.b` from one.
        const users = id.endsWith(".a")
          ? [node(`u1-${id}`, "function"), { ...node(`u2-${id}`, "function"), provenance: { sourceUri: "src/elsewhere.ts" } }]
          : [node(`u1-${id}`, "function")];
        return answer(id, { nodes: users, edges: [] });
      }
      return answer(id, { nodes: [], edges: [] });
    },
    async provenance(id: string) {
      return answer(id, { entityId: id, chain: [] });
    },
  } as unknown as IxClient;
  return { client, inFlightPeak: () => peak };
}

describe("collectFacts with concurrent second-round reads", () => {
  it("returns neighbour members in file order, whichever file answers first", async () => {
    const { client, inFlightPeak } = slowFirstClient();

    const facts = await collectFacts(client, TARGET, "t", "function", "context");

    // One member from each file before a second from any, files in import
    // order, each file's members by measured use (`.a` has more users).
    expect(facts.neighbourRefs?.map((r) => r.id)).toEqual([
      "f1.a", "f2.a", "f3.a", "f1.b", "f2.b", "f3.b",
    ]);
    expect(facts.container?.id).toBe("container");
    // The neighbour files really were read together.
    expect(inFlightPeak()).toBeGreaterThan(1);
  });

  it("gives the same facts on every run", async () => {
    const runs = await Promise.all([0, 1, 2].map(() => collectFacts(slowFirstClient().client, TARGET, "t", "function", "context")));
    const [first, ...rest] = runs.map((f) => JSON.stringify(f));
    for (const r of rest) expect(r).toBe(first);
  });
});
