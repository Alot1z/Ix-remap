// Copyright 2026 Ix Infrastructure Inc.

import * as fs from "node:fs";
import * as nodePath from "node:path";

const JS_TS_FILE = /\.[cm]?[jt]sx?$/i;

/**
 * JS/TS package name -> the workspace-relative POSIX directory ('' for the
 * root) whose package.json declares it, for core-ingestion's `packageDirOf`.
 *
 * Call resolution only follows a bare import (`from "mylib"`) into files that
 * belong to that package. Without this it can only guess from directory names,
 * and a library's own tests importing it by name from a folder called anything
 * else lost every edge.
 *
 * Reads the package.json of each directory holding an ingested JS/TS file and
 * of its ancestors up to the workspace root, each directory once. A name that
 * two package.json files declare (a fixture copy, a vendored duplicate) is left
 * out, and the resolver falls back to its directory-name guess for it.
 */
export function declaredPackageDirs(
  workspaceRoot: string,
  absoluteFilePaths: string[],
): (packageName: string) => string | undefined {
  const root = nodePath.resolve(workspaceRoot);
  const visited = new Set<string>();
  const dirs = new Map<string, string | null>();
  for (const file of absoluteFilePaths) {
    if (!JS_TS_FILE.test(file)) continue;
    let dir = nodePath.dirname(nodePath.resolve(file));
    while (!visited.has(dir)) {
      visited.add(dir);
      const rel = nodePath.relative(root, dir);
      if (rel === ".." || rel.startsWith(`..${nodePath.sep}`) || nodePath.isAbsolute(rel)) break;
      const name = readPackageName(dir);
      if (name !== undefined) dirs.set(name, dirs.has(name) ? null : rel.split(nodePath.sep).join("/"));
      if (dir === root) break;
      dir = nodePath.dirname(dir);
    }
  }
  return (packageName) => dirs.get(packageName) ?? undefined;
}

function readPackageName(dir: string): string | undefined {
  try {
    const name = (JSON.parse(fs.readFileSync(nodePath.join(dir, "package.json"), "utf8")) as { name?: unknown }).name;
    return typeof name === "string" && name.trim() ? name.trim() : undefined;
  } catch {
    return undefined;
  }
}
