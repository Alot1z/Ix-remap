// Copyright 2026 Ix Infrastructure Inc.

import { describe, expect, it } from "vitest";

import { CENTRE_FALLBACK_TRIES, chooseCentre, type StartingPoint } from "../explain/issue.js";

/**
 * Which starting point a `--from-issue` bundle is centred on.
 *
 * On SWE-PolyBench two svelte issues named no code; BM25's top file was a
 * `.svelte` component the graph has no node for, and the command failed with
 * no bundle while a lower-ranked `.js` module was indexed.
 */

const bm25 = (...paths: string[]) => paths.map((path, i) => ({ path, score: 10 - i }));
const graph = (...indexed: string[]) => async (path: string) =>
  indexed.includes(path) ? `node:${path}` : undefined;
const fallbackStart = (path: string): StartingPoint =>
  ({ token: path, name: path.split("/").pop()!, kind: "file", path, via: "bm25 fallback" });

describe("chooseCentre", () => {
  it("walks BM25 past files the graph has no node for", async () => {
    const hits = bm25("site/src/routes/index.svelte", "src/Component.svelte", "src/compiler/render.js");
    const { centre, starts, walked } = await chooseCentre(
      [fallbackStart(hits[0].path)], hits, graph("src/compiler/render.js"));
    expect(centre?.path).toBe("src/compiler/render.js");
    expect(centre?.id).toBe("node:src/compiler/render.js");
    expect(centre?.via).toBe("bm25 fallback");
    expect(walked).toBe(true);
    expect(starts.map((s) => s.path)).toEqual(["site/src/routes/index.svelte", "src/compiler/render.js"]);
  });

  it("keeps a named start that has a node, without walking", async () => {
    const named: StartingPoint = { token: "listByKind", id: "n1", name: "listByKind", kind: "method",
      path: "src/api.ts", via: "identifier in issue" };
    const { centre, walked } = await chooseCentre([named], bm25("src/other.ts"), graph("src/other.ts"));
    expect(centre).toEqual(named);
    expect(walked).toBe(false);
  });

  it("resolves a path start to its file node before falling back", async () => {
    const path: StartingPoint = { token: "src/a.ts", name: "a.ts", kind: "file", path: "src/a.ts", via: "path in issue" };
    const { centre, walked } = await chooseCentre([path], bm25("src/b.ts"), graph("src/a.ts", "src/b.ts"));
    expect(centre?.path).toBe("src/a.ts");
    expect(walked).toBe(false);
  });

  it("gives up after a bounded number of BM25 files, and says there is no centre", async () => {
    const hits = bm25(...Array.from({ length: CENTRE_FALLBACK_TRIES + 1 }, (_, i) => `src/f${i}.svelte`));
    const indexed = graph(hits.at(-1)!.path); // indexed, but past the limit
    const { centre, walked } = await chooseCentre([], hits, indexed);
    expect(centre).toBeUndefined();
    expect(walked).toBe(false);
  });

  it("does not try the same file twice", async () => {
    const tried: string[] = [];
    const find = async (path: string) => { tried.push(path); return undefined; };
    await chooseCentre([fallbackStart("src/x.svelte")], bm25("src/x.svelte", "src/y.svelte"), find);
    expect(tried).toEqual(["src/x.svelte", "src/y.svelte"]);
  });
});
