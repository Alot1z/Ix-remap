// Copyright 2026 Ix Infrastructure Inc.

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { declaredPackageDirs } from "../package-dirs.js";

let root: string;

function write(rel: string, content: string): string {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  return file;
}

beforeEach(() => {
  root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "ix-package-dirs-")));
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe("declaredPackageDirs", () => {
  it("maps each declared package to its directory, the root as ''", () => {
    write("package.json", JSON.stringify({ name: "mylib" }));
    write("packages/tools/package.json", JSON.stringify({ name: "@acme/tools" }));
    const files = [write("src/a.ts", ""), write("packages/tools/src/deep/b.ts", "")];

    const dirOf = declaredPackageDirs(root, files);
    expect(dirOf("mylib")).toBe("");
    expect(dirOf("@acme/tools")).toBe("packages/tools");
    expect(dirOf("lodash")).toBeUndefined();
  });

  it("leaves out a name two package.json files declare", () => {
    write("a/package.json", JSON.stringify({ name: "dup" }));
    write("b/package.json", JSON.stringify({ name: "dup" }));
    const dirOf = declaredPackageDirs(root, [write("a/x.js", ""), write("b/y.js", "")]);
    expect(dirOf("dup")).toBeUndefined();
  });

  it("reads only directories holding JS/TS files, and nothing above the root", () => {
    write("py/package.json", JSON.stringify({ name: "py-only" }));
    const inner = path.join(root, "inner");
    write("inner/broken/package.json", "{ not json");
    write("inner/package.json", JSON.stringify({ name: "inner" }));
    const dirOf = declaredPackageDirs(inner, [write("py/main.py", ""), write("inner/broken/c.mts", ""), write("inner/d.tsx", "")]);
    expect(dirOf("py-only")).toBeUndefined();
    expect(dirOf("inner")).toBe("");
    expect(dirOf("{ not json")).toBeUndefined();
  });
});
