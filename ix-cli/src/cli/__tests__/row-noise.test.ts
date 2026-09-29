// Copyright 2026 Ix Infrastructure Inc.

import { afterEach, describe, expect, it } from "vitest";

import { dropNonNameMatches, emptySearchHint, renderSearchLlm } from "../commands/search.js";
import { setOutputShape } from "../output-shape.js";

afterEach(() => setOutputShape({}));

function row(name: string, tier: number, matchSource = "name_exact") {
  return { node: { name, kind: "function" }, rank: { tier, score: -tier, matchSource } };
}

describe("search rows", () => {
  it("carry the span, so the row is a place to read and not a name to grep for", () => {
    const lines = renderSearchLlm(
      [{ name: "resolveWorkspaceRoot", kind: "function", id: "fd53308b-67fb", path: "ix-cli/src/cli/config.ts", lines: "320-340", score: 0.83 }],
      30, [],
    );
    expect(lines[1]).toBe("node name=resolveWorkspaceRoot kind=function path=ix-cli/src/cli/config.ts lines=320-340 score=0.83");
  });

  it("keep an id only where name, kind and path collide", () => {
    const lines = renderSearchLlm([
      { name: "dup", kind: "function", id: "aaaaaaaa11112222", path: "a.ts", lines: "1-2" },
      { name: "dup", kind: "function", id: "bbbbbbbb11112222", path: "a.ts", lines: "5-6" },
      { name: "solo", kind: "function", id: "cccccccc11112222", path: "a.ts", lines: "9" },
    ], 3, []);
    expect(lines.slice(1)).toEqual([
      "node name=dup kind=function id=aaaaaaaa path=a.ts lines=1-2",
      "node name=dup kind=function id=bbbbbbbb path=a.ts lines=5-6",
      "node name=solo kind=function path=a.ts lines=9",
    ]);
  });

  it("print every id when the caller asks for them with --fields", () => {
    setOutputShape({ fields: "name,id" });
    const lines = renderSearchLlm([{ name: "solo", kind: "function", id: "cccccccc11112222", path: "a.ts" }], 1, []);
    expect(lines[1]).toBe("node name=solo id=cccccccc");
  });

  it("mark a row that matched on something other than its name", () => {
    const lines = renderSearchLlm([{ name: "other", kind: "function", path: "a.ts", score: 0.33, match: "claim_or_decision" }], 1, []);
    expect(lines[1]).toBe("node name=other kind=function path=a.ts score=0.33 match=claim_or_decision");
  });
});

describe("dropNonNameMatches", () => {
  it("drops claim and provenance rows once a name matched exactly", () => {
    const kept = dropNonNameMatches([
      row("resolveWorkspaceRoot", 1),
      row("resolveWorkspaceRootCache", 3, "name_partial"),
      row("absoluteFromSourceUri", 4, "claim_or_decision"),
    ]);
    expect(kept.map((s) => s.node.name)).toEqual(["resolveWorkspaceRoot", "resolveWorkspaceRootCache"]);
  });

  it("keeps them when only partial names matched: they may be the only lead", () => {
    const rows = [row("WorkspaceRootish", 3, "name_partial"), row("absoluteFromSourceUri", 4, "claim_or_decision")];
    expect(dropNonNameMatches(rows)).toHaveLength(2);
  });
});

describe("an empty search", () => {
  it("says a phrase is the problem when it was given one", () => {
    const hint = emptySearchHint("workspace resolve read");
    expect(hint).toContain("one identifier");
    expect(hint).toContain("e.g. workspace");
    expect(hint).toContain("ix text");
  });

  it("names the filters it could drop", () => {
    expect(emptySearchHint("zzq", { kind: "class", path: "src" })).toContain("drop --kind/--path");
    expect(emptySearchHint("zzq")).not.toContain("drop");
  });

  it("follows count=0 with a hint record, and --quiet drops it", () => {
    expect(renderSearchLlm([], 0, [], "try x")).toEqual(["search count=0 candidates=0", "hint text=\"try x\""]);
    setOutputShape({ quiet: true });
    expect(renderSearchLlm([], 0, [], "try x")).toEqual(["search count=0 candidates=0"]);
  });

  it("never adds the hint to a search that found something", () => {
    const lines = renderSearchLlm([{ name: "a", kind: "function", path: "a.ts" }], 1, [], "try x");
    expect(lines.some((l) => l.startsWith("hint"))).toBe(false);
  });
});
