// Copyright 2026 Ix Infrastructure Inc.

import { describe, expect, it, vi } from "vitest";
import {
  locateEdit, locateText, patchRanges, postToolUseOutput, runClaudePostEdit, withDeadline,
  type HookDeps, type PostToolUseInput,
} from "../hook/claude-post-edit.js";
import { estimateTokens, type AroundRequest, type AroundResult } from "../around.js";
import { WorkspaceNotMappedError } from "../errors.js";

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

// ── The whole hook, with the graph read injected ─────────────────────────────

function result(over: Partial<AroundResult> = {}): AroundResult {
  return {
    path: "src/math.ts",
    symbols: [{
      id: "1", name: "add", kind: "function", path: "src/math.ts", lineStart: 1, lineEnd: 4,
      callers: { total: 1, rows: [{ path: "src/calc.ts", line: 9, snippet: "return add(x, y);", name: "calc" }] },
      users: { total: 0, rows: [] },
      tests: { total: 1, rows: [{ path: "src/__tests__/calc.test.ts", line: 4, snippet: "expect(calc(1, 2)).toBe(3);", via: "calc" }] },
      sameName: [],
    }],
    importers: { total: 2, tests: 1, rows: [] },
    ...over,
  };
}

function deps(over: Partial<HookDeps> = {}): HookDeps & { gather: ReturnType<typeof vi.fn> } {
  const gather = vi.fn(async (_req: AroundRequest) => result());
  return {
    gather,
    readFile: () => UPDATED,
    chdir: () => {},
    workspaceRoot: () => "/ws",
    ...over,
  } as HookDeps & { gather: ReturnType<typeof vi.fn> };
}

describe("runClaudePostEdit", () => {
  it("prints exactly the PostToolUse JSON, naming the symbol, its callers and tests", async () => {
    const out = await runClaudePostEdit(JSON.stringify(editInput()), {}, deps());
    const parsed = JSON.parse(out!);
    expect(Object.keys(parsed)).toEqual(["hookSpecificOutput"]);
    expect(Object.keys(parsed.hookSpecificOutput)).toEqual(["hookEventName", "additionalContext"]);
    expect(parsed.hookSpecificOutput.hookEventName).toBe("PostToolUse");
    expect(parsed.hookSpecificOutput.additionalContext).toBe([
      "Ix: you changed `add` (src/math.ts:1-4).",
      "callers (1):",
      "  src/calc.ts:9 return add(x, y);",
      "tests (1):",
      "  src/__tests__/calc.test.ts:4 (via calc) expect(calc(1, 2)).toBe(3);",
      "math.ts is imported by 2 files (1 test).",
      "These may need updating to match your edit.",
    ].join("\n"));
    expect(out).toBe(postToolUseOutput(parsed.hookSpecificOutput.additionalContext));
  });

  it("asks about the old-side lines in the original text, and reports in the file now", async () => {
    const d = deps();
    await runClaudePostEdit(JSON.stringify(editInput()), {}, d);
    const req = d.gather.mock.calls[0][0] as AroundRequest;
    expect(req.relPath).toBe("src/math.ts");
    expect(req.ranges).toEqual([{ start: 2, end: 2 }]);
    expect(req.anchorLines).toEqual(ORIGINAL.split("\n"));
    expect(req.currentLines).toEqual(UPDATED.split("\n"));
  });

  it("maps a file in --worktree onto the same path under --graph-root", async () => {
    const d = deps({ workspaceRoot: () => "/graph" });
    const input = editInput({ tool_input: { file_path: "/run/wt/src/math.ts" } });
    const chdir = vi.fn();
    await runClaudePostEdit(JSON.stringify(input), { graphRoot: "/graph", worktree: "/run/wt" }, { ...d, chdir });
    expect(chdir).toHaveBeenCalledWith("/graph");
    expect((d.gather.mock.calls[0][0] as AroundRequest).relPath).toBe("src/math.ts");
  });

  it("stays under the token budget on a large answer", async () => {
    const many = (n: number, p: string) => Array.from({ length: n }, (_, i) => ({
      path: `src/some/deeply/nested/${p}${i}.ts`, line: 10 + i, snippet: `return await computeSomethingLong(${i}, alpha, beta, gamma, delta);`,
    }));
    const big = result();
    big.symbols = ["a", "b", "c"].map((name) => ({
      ...big.symbols[0], name,
      callers: { total: 30, rows: many(8, `${name}c`) },
      users: { total: 6, rows: many(5, `${name}u`) },
      tests: { total: 9, rows: many(5, `${name}t`) },
    }));
    const out = await runClaudePostEdit(JSON.stringify(editInput()), {}, deps({ gather: vi.fn(async () => big) }));
    const text = JSON.parse(out!).hookSpecificOutput.additionalContext as string;
    expect(estimateTokens(text)).toBeLessThanOrEqual(300);
    expect(text.split("\n")[0]).toMatch(/^Ix: you changed `a`/);
  });

  describe("prints nothing", () => {
    const silent: Array<[string, () => Promise<string | undefined>]> = [
      ["for input that is not JSON", () => runClaudePostEdit("not json", {}, deps())],
      ["for a tool that is not an edit", () => runClaudePostEdit(JSON.stringify(editInput({ tool_name: "Read" })), {}, deps())],
      ["for a non-code file", () => runClaudePostEdit(JSON.stringify(editInput({ tool_input: { file_path: "/ws/README.md", new_string: "x" } })), {}, deps())],
      ["for a lockfile", () => runClaudePostEdit(JSON.stringify(editInput({ tool_input: { file_path: "/ws/package-lock.json", new_string: "x" } })), {}, deps())],
      ["for a file outside the workspace", () => runClaudePostEdit(JSON.stringify(editInput({ tool_input: { file_path: "/elsewhere/a.ts" } })), {}, deps())],
      ["for a file outside --worktree", () => runClaudePostEdit(JSON.stringify(editInput()), { graphRoot: "/graph", worktree: "/run/wt" }, deps())],
      ["for a new file", () => runClaudePostEdit(JSON.stringify(editInput({ tool_name: "Write", tool_response: { type: "create", originalFile: null, structuredPatch: [] } })), {}, deps())],
      ["when the backend is down", () => runClaudePostEdit(JSON.stringify(editInput()), {}, deps({ gather: vi.fn(async () => { throw new TypeError("fetch failed"); }) }))],
      ["when the workspace is not mapped", () => runClaudePostEdit(JSON.stringify(editInput()), {}, deps({ gather: vi.fn(async () => { throw new WorkspaceNotMappedError("/ws"); }) }))],
      ["when the file is not in the graph", () => runClaudePostEdit(JSON.stringify(editInput()), {}, deps({ gather: vi.fn(async () => { throw Object.assign(new Error("not in graph"), { code: "file_not_in_graph" }); }) }))],
      ["when no definition covers the edit", () => runClaudePostEdit(JSON.stringify(editInput()), {}, deps({ gather: vi.fn(async () => result({ symbols: [] })) }))],
      ["when nothing depends on it", () => runClaudePostEdit(JSON.stringify(editInput()), {}, deps({
        gather: vi.fn(async () => result({ symbols: [{ ...result().symbols[0], callers: { total: 0, rows: [] }, tests: { total: 0, rows: [] } }] })),
      }))],
      ["when the file cannot be read", () => runClaudePostEdit(JSON.stringify(editInput()), {}, deps({ readFile: () => undefined }))],
      ["when chdir throws", () => runClaudePostEdit(JSON.stringify(editInput()), {}, deps({ chdir: () => { throw new Error("ENOENT"); } }))],
    ];
    for (const [name, run] of silent) {
      it(name, async () => {
        expect(await run()).toBeUndefined();
      });
    }

    it("when the answer misses the deadline", async () => {
      const slow = new Promise<string>((resolve) => setTimeout(() => resolve("late"), 200));
      expect(await withDeadline(slow, 10)).toBeUndefined();
      expect(await withDeadline(Promise.reject(new Error("x")), 50)).toBeUndefined();
      expect(await withDeadline(Promise.resolve("ok"), 50)).toBe("ok");
    });
  });
});
