// Copyright 2026 Ix Infrastructure Inc.

import { afterEach, describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { checkNestedWorkspaces, findStrayNestedWorkspaces, isGitTopLevel } from "../commands/doctor.js";
import type { WorkspaceConfig } from "../config.js";

function workspace(rootPath: string, name: string): WorkspaceConfig {
  return { workspace_id: `${name}-id`, workspace_name: name, root_path: rootPath, default: false };
}

describe("stray nested workspaces", () => {
  const repo = workspace("/work/repo", "repo");
  // What `ix ingest src/a.ts` left behind before it looked for the workspace
  // a path belongs to.
  const stray = workspace("/work/repo/src", "src");
  // Resolved, as the roots handed to `isGitRoot` are: on Windows `/work/repo`
  // is `C:\work\repo` by then.
  const gitRoots = new Set(["/work/repo", "/work/system/alpha", "/work/system/beta"].map(p => resolve(p)));
  const isGitRoot = (root: string): boolean => gitRoots.has(root);

  it("flags a workspace inside another that is not a git root", () => {
    expect(findStrayNestedWorkspaces([repo, stray], isGitRoot)).toEqual([{ nested: stray, parent: repo }]);
  });

  it("names the nearest enclosing workspace as the parent", () => {
    const deeper = workspace("/work/repo/src/util", "util");
    expect(findStrayNestedWorkspaces([repo, stray, deeper], isGitRoot)).toEqual([
      { nested: stray, parent: repo },
      { nested: deeper, parent: stray },
    ]);
  });

  it("leaves member repos of a system alone: they are git roots", () => {
    const system = workspace("/work/system", "system");
    const alpha = workspace("/work/system/alpha", "alpha");
    const beta = workspace("/work/system/beta", "beta");
    expect(findStrayNestedWorkspaces([system, alpha, beta], isGitRoot)).toEqual([]);
  });

  it("leaves siblings and unrelated workspaces alone", () => {
    const sibling = workspace("/work/repo-copy", "repo-copy");
    const elsewhere = workspace("/elsewhere/app", "app");
    expect(findStrayNestedWorkspaces([repo, sibling, elsewhere], () => false)).toEqual([]);
  });

  it("does not count a duplicate entry for the same root as nesting", () => {
    expect(findStrayNestedWorkspaces([repo, workspace("/work/repo", "again")], () => false)).toEqual([]);
  });

  it("reports as a warning with the repair, and passes when there is nothing to report", () => {
    const flagged = checkNestedWorkspaces([repo, stray], isGitRoot, "/home/u/.ix/config.yaml");
    expect(flagged.ok).toBe(false);
    expect(flagged.warn, "a warning: doctor reports, the user decides").toBe(true);
    expect(flagged.detail).toContain("'src' (/work/repo/src) is inside 'repo' (/work/repo)");
    expect(flagged.detail).toContain('cd "/work/repo/src" && ix reset --workspace --yes');
    expect(flagged.detail).toContain("/home/u/.ix/config.yaml");

    expect(checkNestedWorkspaces([repo], isGitRoot, "/c")).toEqual({
      ok: true,
      detail: "no stray workspace registered inside another",
    });
  });
});

describe("isGitTopLevel", () => {
  const dirs: string[] = [];
  afterEach(() => {
    for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true });
  });

  it("is true for a repository's top level only", () => {
    const repo = realpathSync.native(mkdtempSync(join(tmpdir(), "ix-doctor-nested-")));
    dirs.push(repo);
    mkdirSync(join(repo, "src"));
    mkdirSync(join(repo, "member"));
    execFileSync("git", ["init", "-q"], { cwd: repo, stdio: "ignore" });
    execFileSync("git", ["init", "-q"], { cwd: join(repo, "member"), stdio: "ignore" });

    expect(isGitTopLevel(repo)).toBe(true);
    expect(isGitTopLevel(join(repo, "src"))).toBe(false);
    expect(isGitTopLevel(join(repo, "member")), "a nested repository is its own top level").toBe(true);
    expect(isGitTopLevel(join(repo, "missing"))).toBe(false);
  });
});
