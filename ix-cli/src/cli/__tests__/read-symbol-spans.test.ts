// Copyright 2026 Ix Infrastructure Inc.

import { describe, it, expect } from "vitest";

/**
 * Verify that read command logic correctly extracts symbol line ranges
 * from entity attrs containing line_start / line_end.
 */

describe("read symbol span extraction", () => {
  it("extracts lines using line_start and line_end from attrs", () => {
    const node: { name: string; kind: string; attrs: Record<string, any>; provenance: Record<string, any> } = {
      name: "MyClass",
      kind: "class",
      attrs: { line_start: 5, line_end: 10 },
      provenance: { source_uri: "/tmp/test.ts" },
    };

    const lineStart = node.attrs?.line_start ?? 1;
    const lineEnd = node.attrs?.line_end;

    expect(lineStart).toBe(5);
    expect(lineEnd).toBe(10);

    // Simulate extracting lines from a file
    const fileLines = [
      "// line 1",
      "// line 2",
      "// line 3",
      "// line 4",
      "export class MyClass {",    // line 5
      "  private x: number;",      // line 6
      "  constructor() {}",        // line 7
      "  getX() { return this.x }", // line 8
      "  setX(v: number) {}",      // line 9
      "}",                          // line 10
      "// line 11",
      "// line 12",
    ];

    const content = fileLines.slice(lineStart - 1, lineEnd).join("\n");
    expect(content).toContain("export class MyClass");
    expect(content).toContain("}");
    expect(content).not.toContain("// line 1");
    expect(content).not.toContain("// line 11");
    // Should be exactly 6 lines (5 through 10)
    expect(content.split("\n")).toHaveLength(6);
  });

  it("falls back to whole file when line_start and line_end are missing", () => {
    const node: { name: string; kind: string; attrs: Record<string, any>; provenance: Record<string, any> } = {
      name: "OldEntity",
      kind: "class",
      attrs: {},
      provenance: { source_uri: "/tmp/old.ts" },
    };

    const lineStart = node.attrs?.line_start ?? 1;
    const lineEnd = node.attrs?.line_end;

    expect(lineStart).toBe(1);
    expect(lineEnd).toBeUndefined();

    // When lineEnd is undefined, read.ts uses allLines.length as effectiveEnd
    const fileLines = ["a", "b", "c"];
    const effectiveEnd = lineEnd ?? fileLines.length;
    const content = fileLines.slice(lineStart - 1, effectiveEnd).join("\n");
    expect(content).toBe("a\nb\nc");
  });

  it("handles camelCase attr names as fallback", () => {
    const node: { name: string; kind: string; attrs: Record<string, any> } = {
      name: "LegacyEntity",
      kind: "function",
      attrs: { lineStart: 3, lineEnd: 7 },
    };

    // read.ts checks both: node.attrs?.lineStart ?? node.attrs?.line_start
    const lineStart = node.attrs?.lineStart ?? node.attrs?.line_start ?? 1;
    const lineEnd = node.attrs?.lineEnd ?? node.attrs?.line_end;

    expect(lineStart).toBe(3);
    expect(lineEnd).toBe(7);
  });
});

describe("symbolRange", () => {
  // resolveMapRoot, recorded at 36-46; two lines were added above it since.
  const file = [
    ...Array.from({ length: 37 }, (_, i) => `// line ${i + 1}`),
    "export function resolveMapRoot(explicit?: string): string {", // 38
    ...Array.from({ length: 9 }, (_, i) => `  step${i};`),          // 39-47
    "}",                                                            // 48
    "// after",
  ];

  it("re-anchors a stale file's span to the declaration on disk", async () => {
    const { symbolRange } = await import("../commands/read.js");
    const r = symbolRange(file, "resolveMapRoot", 36, 46, true);
    expect(r).toEqual({ lineStart: 38, lineEnd: 48, movedFrom: 36 });
    expect(file[r.lineEnd - 1]).toBe("}");
  });

  it("uses a fresh file's span as recorded", async () => {
    const { symbolRange } = await import("../commands/read.js");
    expect(symbolRange(file, "resolveMapRoot", 36, 46, false)).toEqual({ lineStart: 36, lineEnd: 46 });
  });

  it("keeps a stale span that still starts at the declaration", async () => {
    const { symbolRange } = await import("../commands/read.js");
    expect(symbolRange(file, "resolveMapRoot", 38, 48, true)).toEqual({ lineStart: 38, lineEnd: 48 });
  });

  it("keeps the recorded span when the name is no longer declared", async () => {
    const { symbolRange } = await import("../commands/read.js");
    expect(symbolRange(file, "renamedAway", 36, 46, true)).toEqual({ lineStart: 36, lineEnd: 46 });
  });

  it("never runs past the end of the file", async () => {
    const { symbolRange } = await import("../commands/read.js");
    const short = ["// a", "// b", "function f() {", "}"];
    expect(symbolRange(short, "f", 1, 10, true).lineEnd).toBe(4);
  });
});
