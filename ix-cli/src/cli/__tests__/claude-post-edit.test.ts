// Copyright 2026 Ix Infrastructure Inc.

import { describe, expect, it } from "vitest";
import { locateEdit, locateText, patchRanges, type PostToolUseInput } from "../hook/claude-post-edit.js";

const ORIGINAL = [
  "export function add(a, b) {", //  1
  "  return a + b;", //              2
  "}", //                            3
  "", //                             4
  "export function sub(a, b) {", //  5
  "  return a - b;", //              6
  "}", //                            7
].join("\n");
const UPDATED = ORIGINAL.replace("  return a + b;", "  const s = a + b;\n  return s;");

const EDIT_PATCH = [{
  oldStart: 1, oldLines: 3, newStart: 1, newLines: 4,
  lines: [" export function add(a, b) {", "-  return a + b;", "+  const s = a + b;", "+  return s;", " }"],
}];

function editInput(over: Partial<PostToolUseInput> = {}): PostToolUseInput {
  return {
    hook_event_name: "PostToolUse",
    cwd: "/ws",
    tool_name: "Edit",
    tool_input: { file_path: "/ws/src/math.ts", old_string: "  return a + b;", new_string: "  const s = a + b;\n  return s;" },
    tool_response: { filePath: "/ws/src/math.ts", originalFile: ORIGINAL, structuredPatch: EDIT_PATCH },
    ...over,
  };
}

describe("patchRanges", () => {
  it("locates a replacement on both sides of the patch", () => {
    expect(patchRanges(EDIT_PATCH, "old")).toEqual([{ start: 2, end: 2 }]);
    expect(patchRanges(EDIT_PATCH, "new")).toEqual([{ start: 2, end: 3 }]);
  });

  it("locates a pure insertion on the old side as the two lines it went between", () => {
    const hunk = [{ oldStart: 1, newStart: 1, lines: [" a", "+b", " c"] }];
    expect(patchRanges(hunk, "old")).toEqual([{ start: 1, end: 2, insertion: true }]);
    expect(patchRanges(hunk, "new")).toEqual([{ start: 2, end: 2 }]);
  });

  it("locates a pure deletion on the new side as the two lines it closed up", () => {
    const hunk = [{ oldStart: 4, newStart: 4, lines: [" a", "-b", " c"] }];
    expect(patchRanges(hunk, "old")).toEqual([{ start: 5, end: 5 }]);
    expect(patchRanges(hunk, "new")).toEqual([{ start: 4, end: 5, insertion: true }]);
  });
});

describe("locateText", () => {
  it("finds the lines a new_string occupies", () => {
    expect(locateText(UPDATED, "  const s = a + b;\n  return s;")).toEqual([{ start: 2, end: 3 }]);
  });

  it("matches across CRLF line endings", () => {
    expect(locateText(UPDATED.replace(/\n/g, "\r\n"), "  const s = a + b;\n  return s;")).toEqual([{ start: 2, end: 3 }]);
  });

  it("gives up on an empty or ubiquitous string", () => {
    expect(locateText(UPDATED, "")).toEqual([]);
    expect(locateText("x\nx\nx\nx\nx", "x")).toEqual([]);
  });
});

describe("locateEdit", () => {
  it("Edit with a patch and the original file: old-side lines, anchored in the original", () => {
    const at = locateEdit(editInput(), UPDATED)!;
    expect(at.ranges).toEqual([{ start: 2, end: 2 }]);
    expect(at.anchorLines).toEqual(ORIGINAL.split("\n"));
  });

  it("Edit with a patch but no original: new-side lines in the file now", () => {
    const at = locateEdit(editInput({ tool_response: { structuredPatch: EDIT_PATCH } }), UPDATED)!;
    expect(at.ranges).toEqual([{ start: 2, end: 3 }]);
    expect(at.anchorLines).toEqual(UPDATED.split("\n"));
  });

  it("Edit with no tool_response: finds new_string in the file now", () => {
    const at = locateEdit(editInput({ tool_response: undefined }), UPDATED)!;
    expect(at.ranges).toEqual([{ start: 2, end: 3 }]);
  });

  it("MultiEdit: every edit's new_string", () => {
    const input = editInput({
      tool_name: "MultiEdit",
      tool_input: { file_path: "/ws/src/math.ts", edits: [{ old_string: "x", new_string: "  return s;" }, { old_string: "y", new_string: "  return a - b;" }] },
      tool_response: undefined,
    });
    expect(locateEdit(input, UPDATED)!.ranges).toEqual([{ start: 3, end: 3 }, { start: 7, end: 7 }]);
  });

  it("Write: nothing for a new file or a no-op, the whole file without a response", () => {
    const write = (resp: PostToolUseInput["tool_response"]) => editInput({
      tool_name: "Write", tool_input: { file_path: "/ws/src/math.ts", content: UPDATED }, tool_response: resp,
    });
    expect(locateEdit(write({ type: "create", originalFile: null, structuredPatch: [] }), UPDATED)).toBeUndefined();
    expect(locateEdit(write({ type: "update", originalFile: ORIGINAL, structuredPatch: [] }), UPDATED)).toBeUndefined();
    expect(locateEdit(write({ type: "update", originalFile: ORIGINAL, structuredPatch: EDIT_PATCH }), UPDATED)!.ranges)
      .toEqual([{ start: 2, end: 2 }]);
    expect(locateEdit(write(undefined), UPDATED)).toEqual({ anchorLines: UPDATED.split("\n") });
  });
});

