// Copyright 2026 Ix Infrastructure Inc.

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { Readable } from "node:stream";

import { afterEach, describe, expect, it } from "vitest";

import {
  bm25Rank,
  bm25Tokens,
  extractCandidates,
  isSourcePath,
  pickStartingPoints,
  planIssue,
  rankIssueFiles,
  readIssueText,
  type SymbolHit,
} from "../explain/issue.js";
import { gitRepoAccess, type RepoAccess } from "../explain/text-references.js";

/**
 * `ix context --from-issue`: from an issue's text to where the fix starts.
 *
 * The cases are the ones the SWE-PolyBench pilot got wrong before its picker
 * was fixed: a CSS output file, a changelog and test fixtures chosen as
 * starting points, an import chosen over the definition it imports, and a
 * prose word resolved as if it were a code name.
 */

function memoryRepo(files: Record<string, string>): RepoAccess {
  return {
    files: () => Object.keys(files),
    read: (path) => files[path],
    grep: () => [],
  };
}

/** A search that answers from a fixed table, and records what it was asked. */
function fakeSearch(table: Record<string, SymbolHit[]>) {
  const asked: string[] = [];
  const search = async (name: string) => {
    asked.push(name);
    return table[name] ?? [];
  };
  return { search, asked };
}

const hit = (name: string, kind: string, path: string, lines?: [number, number]): SymbolHit => ({
  id: `${kind}:${path}:${name}`, name, kind, path,
  ...(lines ? { lineStart: lines[0], lineEnd: lines[1] } : {}),
});

describe("extractCandidates", () => {
  it("takes paths first, then multi-part names, then backticked words, and never prose", () => {
    const text = [
      "Calling `save` on a model fails in keras/src/saving/saving_api.py.",
      "The `saveModel` helper and GsonBuilder both call new_json_writer,",
      "but `flex` and `code` are fine. The Widget renders the page.",
    ].join("\n");
    const { paths, identifiers } = extractCandidates(text);
    expect(paths).toEqual(["keras/src/saving/saving_api.py"]);
    expect(identifiers.slice(0, 3)).toEqual(["saveModel", "GsonBuilder", "new_json_writer"]);
    // Single words only from backticks, four letters or more, after every
    // multi-part name.
    expect(identifiers.slice(-3)).toEqual(["save", "flex", "code"]);
    for (const prose of ["Calling", "model", "fails", "Widget", "renders", "page", "The"]) {
      expect(identifiers).not.toContain(prose);
    }
  });

  it("tries a specific single word before a common one the issue mentions first", () => {
    // Three names become starts. `repeat` came first in the issue and took a
    // slot `Stylesheet` needed.
    const { identifiers } = extractCandidates("`repeat` then `ignore` breaks `Stylesheet` and `Selector`");
    expect(identifiers).toEqual(["Stylesheet", "Selector", "repeat", "ignore"]);
  });

  it("drops short backticked words and keeps a name once", () => {
    const { identifiers } = extractCandidates("`id` and `run` then `listByKind` and listByKind again");
    expect(identifiers).toEqual(["listByKind"]);
  });
});

describe("isSourcePath", () => {
  it("accepts code and refuses tests, fixtures, docs, build output, vendored and non-code files", () => {
    expect(isSourcePath("src/cli/commands/rank.ts")).toBe(true);
    expect(isSourcePath("keras/src/saving/saving_api.py")).toBe(true);
    // Only the directory: a file named for one is code.
    for (const code of ["src/website.ts", "lib/playground.js", "src/sites/a.ts", "src/benchmark/timer.ts"]) {
      expect(isSourcePath(code), code).toBe(true);
    }
    for (const noise of [
      "src/css/preflight.css", "CHANGELOG.md", "docs/api.ts", "package.json",
      "src/__tests__/rank.test.ts", "tests/test_saving.py", "src/saving_test.py",
      "test-fixtures/typescript/sample.ts", "__fixtures__/a.js", "examples/demo.js",
      "vendor/lib.js", "dist/index.js", "build/out.js", "lib/jquery.min.js",
      // A project's website, playground, test config, benchmarks, stories, e2e.
      "site/src/routes/index.svelte", "website/static/worker.js", "packages/docs-site/a.ts",
      "website/playground/markdown.js", "tests_config/run_spec.js", "test-config/setup.js",
      "benchmarks/run.py", ".storybook/main.js", "packages/app/e2e/login.ts", "cypress/support/a.js",
    ]) {
      expect(isSourcePath(noise), noise).toBe(false);
    }
  });
});

describe("pickStartingPoints", () => {
  it("does not start from a CSS output file for `flex`", async () => {
    const { search } = fakeSearch({ flex: [hit("flex", "rule", "src/css/output.css")] });
    const out = await pickStartingPoints("Setting `flex` breaks the layout", { files: [], search });
    expect(out.starts).toEqual([]);
    expect(out.unresolved).toEqual(["flex"]);
  });

  it("chooses the definition, not the module entity of the file that imports it", async () => {
    const { search } = fakeSearch({
      borderStylesReset: [
        hit("borderStylesReset", "module", "src/util/generateUtilities.js"),
        hit("borderStylesReset", "function", "src/util/borderStylesReset.js", [3, 20]),
      ],
    });
    const out = await pickStartingPoints("borderStylesReset is applied twice", { files: [], search });
    expect(out.starts).toHaveLength(1);
    expect(out.starts[0]).toMatchObject({
      token: "borderStylesReset", path: "src/util/borderStylesReset.js", kind: "function",
      lineStart: 3, lineEnd: 20, via: "identifier in issue",
    });
  });

  it("leaves a name unresolved when its only hit is an import", async () => {
    const { search } = fakeSearch({ borderStylesReset: [hit("borderStylesReset", "module", "src/a.js")] });
    const out = await pickStartingPoints("`borderStylesReset`", { files: [], search });
    expect(out.starts).toEqual([]);
    expect(out.unresolved).toEqual(["borderStylesReset"]);
  });

  it("ignores changelog, markdown and test hits, and inexact names", async () => {
    const { search } = fakeSearch({
      newJsonWriter: [
        hit("newJsonWriter", "section", "CHANGELOG.md"),
        hit("newJsonWriter", "heading", "docs/guide.md"),
        hit("newJsonWriter", "method", "gson/src/test/java/com/google/gson/GsonTest.java"),
        hit("newJsonWriterAsync", "method", "gson/src/main/java/com/google/gson/Other.java"),
      ],
    });
    const out = await pickStartingPoints("newJsonWriter drops the lenient flag", { files: [], search });
    expect(out.starts).toEqual([]);
    expect(out.unresolved).toEqual(["newJsonWriter"]);
  });

  it("puts a multi-part name ahead of a single backticked word", async () => {
    const { search } = fakeSearch({
      save: [hit("save", "function", "keras/src/models/model.py", [10, 40])],
      saveModel: [hit("saveModel", "function", "keras/src/saving/saving_api.py", [5, 60])],
    });
    const out = await pickStartingPoints("`save` fails, and so does `saveModel`", { files: [], search });
    expect(out.starts.map((s) => s.token)).toEqual(["saveModel", "save"]);
    expect(out.starts[0].path).toBe("keras/src/saving/saving_api.py");
  });

  it("keeps at most three starting points, one per file", async () => {
    const { search } = fakeSearch({
      alphaOne: [hit("alphaOne", "function", "src/a.ts")],
      alphaTwo: [hit("alphaTwo", "function", "src/a.ts")],
      betaOne: [hit("betaOne", "function", "src/b.ts")],
      gammaOne: [hit("gammaOne", "function", "src/c.ts")],
      deltaOne: [hit("deltaOne", "function", "src/d.ts")],
    });
    const out = await pickStartingPoints("alphaOne alphaTwo betaOne gammaOne deltaOne", { files: [], search });
    expect(out.starts.map((s) => s.path)).toEqual(["src/a.ts", "src/b.ts", "src/c.ts"]);
    expect(out.unresolved).toEqual([]);
  });

  it("breaks a tie between two definitions of one name by the issue's text", async () => {
    const { search } = fakeSearch({
      renderRow: [hit("renderRow", "function", "src/table.ts"), hit("renderRow", "function", "src/grid.ts")],
    });
    const out = await pickStartingPoints("renderRow in the grid", {
      files: [], search, fileScore: (p) => (p === "src/grid.ts" ? 2 : 1),
    });
    expect(out.starts[0].path).toBe("src/grid.ts");
  });
});

describe("path candidates resolve against the tracked files", () => {
  let dir: string | undefined;
  afterEach(() => {
    if (dir) rmSync(dir, { recursive: true, force: true });
    dir = undefined;
  });

  it("resolves a unique basename and a unique suffix via git ls-files, and refuses an ambiguous one", async () => {
    dir = mkdtempSync(join(tmpdir(), "ix-from-issue-"));
    const write = (path: string, text: string) => {
      mkdirSync(dirname(join(dir!, path)), { recursive: true });
      writeFileSync(join(dir!, path), text);
    };
    execFileSync("git", ["init", "-q"], { cwd: dir });
    write("keras/src/saving/saving_api.py", "def save_model():\n  pass\n");
    write("src/a/index.ts", "export {};\n");
    write("src/b/index.ts", "export {};\n");
    write("src/untracked.ts", "export {};\n");
    execFileSync("git", ["add", "keras", "src/a", "src/b"], { cwd: dir });
    const repo = gitRepoAccess(dir)!;

    const { search, asked } = fakeSearch({});
    const out = await pickStartingPoints(
      "See saving_api.py, then a/index.ts; index.ts and untracked.ts are unrelated.",
      { files: repo.files(), search },
    );
    expect(out.starts.map((s) => [s.path, s.via])).toEqual([
      ["keras/src/saving/saving_api.py", "path in issue"],
      ["src/a/index.ts", "path in issue"],
    ]);
    expect(out.unresolved).toEqual(expect.arrayContaining(["index.ts", "untracked.ts"]));
    // A path is resolved against the file list, not the symbol index.
    expect(asked).not.toContain("saving_api.py");
  });
});

describe("readIssueText", () => {
  it("reads stdin for `-`", async () => {
    const text = await readIssueText("-", Readable.from(["The `listByKind` ", "call is slow\n"]));
    expect(text).toBe("The `listByKind` call is slow\n");
  });

  it("reads a file path", async () => {
    const dir = mkdtempSync(join(tmpdir(), "ix-issue-text-"));
    try {
      writeFileSync(join(dir, "issue.md"), "rank is wrong\n");
      expect(await readIssueText(join(dir, "issue.md"))).toBe("rank is wrong\n");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("BM25", () => {
  it("splits camelCase and snake_case, keeps a multi-part name whole too, and drops short parts", () => {
    expect(bm25Tokens("listByKind save_model_v2 a IO HTTPServer plain"))
      .toEqual(["list", "kind", "listbykind", "save", "model", "savemodelv2", "http", "server", "httpserver", "plain"]);
  });

  it("spells a whole name the same in camelCase and snake_case", () => {
    expect(bm25Tokens("saveModel")).toContain("savemodel");
    expect(bm25Tokens("save_model")).toContain("savemodel");
    expect(bm25Tokens("__init__ _private")).toEqual(["init", "private"]);
  });

  it("ranks the file that defines a name the issue gives above files that only share its parts", () => {
    // Split into parts alone, `borderStylesReset` is "border styles reset",
    // which borders.js says more often: the old tokenizer ranked it first.
    const repo = memoryRepo({
      "src/preflight.js": "export function borderStylesReset() { return {}; }\nexport const other = 1;",
      "src/borders.js": "// border styles reset\nexport function reset(border, styles) { return border; }",
      "src/theme.js": "export const theme = { border: 1, styles: 2, reset: 3 };",
      "src/a.js": "export const a = 1;",
      "src/b.js": "export const b = 1;",
    });
    const ranked = bm25Rank(repo, repo.files(), "`borderStylesReset` drops the border styles on reset");
    expect(ranked[0].path).toBe("src/preflight.js");
  });

  it("ignores the prose words an issue is written in", () => {
    // Without stopwords the chatty file wins on "should", "would", "expected"
    // and "behavior", which say nothing about where the fix is.
    const chatty = "// This should work. It would be expected behavior when we should do this.\n";
    const repo = memoryRepo({
      "src/comments.ts": chatty.repeat(5),
      "src/tooltip.ts": "export function placeTooltip() {}",
      "src/a.ts": "export const a = 1;",
      "src/b.ts": "export const b = 1;",
    });
    const ranked = bm25Rank(repo, repo.files(),
      "The tooltip should open where I would have expected; the behavior should be the same as before.");
    expect(ranked[0].path).toBe("src/tooltip.ts");
    expect(ranked.map((r) => r.path)).not.toContain("src/comments.ts");
  });

  it("weights the words of a code name the issue mentions above the same words in prose", () => {
    // "store" and "cache" each match one file once, and the files are alike:
    // unweighted, the tie goes to the path, cache.ts.
    const repo = memoryRepo({
      "src/cache.ts": "export const cache = 1;",
      "src/store.ts": "export const store = 1;",
      "src/a.ts": "export const a = 1;",
      "src/b.ts": "export const b = 1;",
    });
    const ranked = bm25Rank(repo, repo.files(), "Calling `store_state` fails: the cache is wrong.");
    expect(ranked.map((r) => r.path)).toEqual(["src/store.ts", "src/cache.ts"]);
    expect(ranked[0].score).toBeCloseTo(2 * ranked[1].score, 5);
  });
});

describe("planIssue", () => {
  it("falls back to BM25 when nothing in the issue resolves, and says so", async () => {
    const repo = memoryRepo({
      "src/auth/login.ts": "export function checkPassword(password: string) { return password.length > 0; }",
      "src/util/strings.ts": "export function trim(s: string) { return s.trim(); }",
      "src/auth/login.test.ts": "password password password login login",
      "CHANGELOG.md": "login password login password",
    });
    const { search } = fakeSearch({});
    const plan = await planIssue("The login page crashes when the password is empty. `flex`", { repo, search });
    expect(plan.fallback).toBe(true);
    expect(plan.starts).toHaveLength(1);
    expect(plan.starts[0]).toMatchObject({ path: "src/auth/login.ts", via: "bm25 fallback" });
    expect(plan.unresolved).toEqual(["flex"]);
    // BM25 ranks source files only.
    expect(plan.bm25.map((r) => r.path)).not.toContain("src/auth/login.test.ts");
    expect(plan.bm25.map((r) => r.path)).not.toContain("CHANGELOG.md");
  });

  it("does not fall back when a name resolves", async () => {
    const repo = memoryRepo({ "src/client/api.ts": "listByKind", "src/other.ts": "other" });
    const { search } = fakeSearch({ listByKind: [hit("listByKind", "method", "src/client/api.ts", [141, 152])] });
    const plan = await planIssue("`listByKind` returns nothing", { repo, search });
    expect(plan.fallback).toBe(false);
    expect(plan.starts.map((s) => s.path)).toEqual(["src/client/api.ts"]);
  });
});

describe("rankIssueFiles", () => {
  const starts = [
    { token: "listByKind", name: "listByKind", kind: "method", path: "src/client/api.ts", via: "identifier in issue" as const },
  ];

  it("puts starting points first, then BM25 order", () => {
    const ranked = rankIssueFiles({
      starts,
      bm25: [
        { path: "src/cli/commands/inventory.ts", score: 9 },
        { path: "src/client/api.ts", score: 5 },
        { path: "src/cli/commands/rank.ts", score: 4 },
      ],
      near: new Map(),
    });
    expect(ranked.map((r) => r.path)).toEqual([
      "src/client/api.ts", "src/cli/commands/inventory.ts", "src/cli/commands/rank.ts",
    ]);
    expect(ranked[0].reason).toContain("starting point");
    expect(ranked[1].reason).toContain("bm25");
  });

  it("uses graph closeness to break ties and nudge, never to overturn a clear lexical lead", () => {
    const ranked = rankIssueFiles({
      starts,
      bm25: [
        { path: "src/far-strong.ts", score: 10 },
        { path: "src/far-tie.ts", score: 4 },
        { path: "src/near-tie.ts", score: 4 },
        { path: "src/near-weak.ts", score: 1 },
      ],
      near: new Map([
        ["src/near-tie.ts", { weight: 1, reason: "one hop from listByKind" }],
        ["src/near-weak.ts", { weight: 1, reason: "one hop from listByKind" }],
        ["src/near-only.ts", { weight: 0.5, reason: "related to listByKind" }],
        ["src/near-test.test.ts", { weight: 1, reason: "one hop from listByKind" }],
      ]),
    });
    expect(ranked.map((r) => r.path)).toEqual([
      "src/client/api.ts", "src/far-strong.ts", "src/near-tie.ts", "src/far-tie.ts",
      "src/near-weak.ts", "src/near-only.ts",
    ]);
    expect(ranked.find((r) => r.path === "src/near-tie.ts")?.reason).toContain("one hop from listByKind");
  });
});
