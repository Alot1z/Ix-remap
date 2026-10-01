// Copyright 2026 Ix Infrastructure Inc.

import { describe, expect, it, vi } from "vitest";
import { bucketByHierarchy, getEffectiveSystemPath, hasMapData } from "../hierarchy.js";

describe("getEffectiveSystemPath", () => {
  it("uses the direct system path when it already has map data", async () => {
    const expand = vi.fn().mockResolvedValue({
      nodes: [
        { id: "sys", kind: "system", name: "CLI" },
        { id: "sub", kind: "subsystem", name: "Client" },
      ],
      edges: [],
    });

    const client = { expand } as any;

    const path = await getEffectiveSystemPath(client, "node-1");

    expect(hasMapData(path)).toBe(true);
    expect(path.map((n) => n.kind)).toEqual(["system", "subsystem"]);
    expect(expand).toHaveBeenCalledTimes(1);
  });

  it("inherits map data from an ancestor file for nested config entries", async () => {
    const expand = vi.fn(async (id: string, opts?: { predicates?: string[] }) => {
      if (id === "common" && opts?.predicates?.[0] === "IN_REGION") {
        return { nodes: [], edges: [] };
      }
      if (id === "common" && opts?.predicates?.[0] === "CONTAINS") {
        return {
          nodes: [
            { id: "lang", kind: "config_entry", name: "nob" },
            { id: "name", kind: "config_entry", name: "name" },
            { id: "file-1", kind: "file", name: "countries.json" },
          ],
          edges: [],
        };
      }
      if (id === "file-1" && opts?.predicates?.[0] === "IN_REGION") {
        return {
          nodes: [
            { id: "sys", kind: "system", name: "Countries" },
            { id: "sub", kind: "subsystem", name: "JSON corpus" },
            { id: "file-1", kind: "file", name: "countries.json" },
          ],
          edges: [],
        };
      }
      return { nodes: [], edges: [] };
    });

    const client = { expand } as any;

    const path = await getEffectiveSystemPath(client, "common");

    expect(hasMapData(path)).toBe(true);
    expect(path.map((n) => n.name)).toEqual(["Countries", "JSON corpus", "countries.json"]);
  });

  it("returns the direct path when no mapped ancestor exists", async () => {
    const expand = vi.fn(async (id: string, opts?: { predicates?: string[] }) => {
      if (id === "leaf" && opts?.predicates?.[0] === "IN_REGION") {
        return { nodes: [], edges: [] };
      }
      if (id === "leaf" && opts?.predicates?.[0] === "CONTAINS") {
        return { nodes: [{ id: "parent", kind: "config_entry", name: "parent" }], edges: [] };
      }
      if (id === "parent" && opts?.predicates?.[0] === "IN_REGION") {
        return { nodes: [], edges: [] };
      }
      return { nodes: [], edges: [] };
    });

    const client = { expand } as any;

    const path = await getEffectiveSystemPath(client, "leaf");

    expect(path).toEqual([]);
    expect(hasMapData(path)).toBe(false);
  });
});

describe("bucketByHierarchy", () => {
  // Regions answer in reverse input order, so a result built in completion
  // order -- as it once was -- comes out reversed.
  function regionClient() {
    const regionOf: Record<string, string> = { a: "r1", b: "r2", c: "r1", d: "r3" };
    const delay: Record<string, number> = { a: 30, b: 20, c: 10, d: 0 };
    const entity = vi.fn(async (id: string) => ({ node: { id, name: `entity-${id}`, kind: "function" }, claims: [], edges: [] }));
    const expand = vi.fn(async (id: string) => {
      await new Promise((resolve) => setTimeout(resolve, delay[id]));
      const region = regionOf[id];
      return { nodes: [{ id: "sys", kind: "system", name: "System" }, { id: region, kind: "region", name: region.toUpperCase() }], edges: [] };
    });
    return { client: { entity, expand } as any, entity, expand };
  }

  it("orders buckets and their members by input, not by which lookup finished first", async () => {
    const { client } = regionClient();
    const nodes = ["a", "b", "c", "d"].map((id) => ({ id, name: id, kind: "function" }));

    const buckets = await bucketByHierarchy(client, nodes);

    expect(buckets).toEqual([
      { region: { name: "R1", kind: "region" }, members: [{ name: "a", kind: "function" }, { name: "c", kind: "function" }] },
      { region: { name: "R2", kind: "region" }, members: [{ name: "b", kind: "function" }] },
      { region: { name: "R3", kind: "region" }, members: [{ name: "d", kind: "function" }] },
    ]);
  });

  it("reads no entity for a node the caller already holds, and one for a bare id", async () => {
    const { client, entity, expand } = regionClient();

    const buckets = await bucketByHierarchy(client, [{ id: "a", name: "a", kind: "function" }, "b"]);

    expect(entity.mock.calls.map((c) => c[0])).toEqual(["b"]);
    expect(expand).toHaveBeenCalledTimes(2);
    expect(buckets.flatMap((b) => b.members.map((m) => m.name))).toEqual(["a", "entity-b"]);
  });
});
