// Copyright 2026 Ix Infrastructure Inc.

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { loadFileAtTimestamp, loadFileFromDisk } from "../commands/diff.js";

// `ix diff --content` resolved a workspace-relative source_uri against the
// current directory and ran git there. From anywhere but the workspace root it
// found nothing, and `git show <hash>:<uri>` reads the path from the repository
// top level, so a workspace inside a larger repo missed even from its root.
describe("ix diff file loading", () => {
  let repo: string;
  let workspace: string;

  beforeEach(() => {
    repo = realpathSync(mkdtempSync(join(tmpdir(), "ix-diff-files-")));
    workspace = join(repo, "packages", "web");
    mkdirSync(join(workspace, "src"), { recursive: true });
    const git = (...args: string[]) => execFileSync("git", args, { cwd: repo, stdio: "ignore" });
    git("init", "-q");
    git("config", "user.email", "t@example.com");
    git("config", "user.name", "t");
    writeFileSync(join(workspace, "src", "a.ts"), "export const v = 1;\n");
    git("add", ".");
    git("commit", "-q", "-m", "one");
    writeFileSync(join(workspace, "src", "a.ts"), "export const v = 2;\n");
  });

  afterEach(() => {
    rmSync(repo, { recursive: true, force: true });
  });

  it("reads the current file relative to the workspace root, not the cwd", () => {
    expect(loadFileFromDisk("src/a.ts", workspace)).toBe("export const v = 2;\n");
  });

  it("reads the committed file for a workspace inside a larger repo", async () => {
    const future = new Date(Date.now() + 86_400_000).toISOString();
    expect(await loadFileAtTimestamp("src/a.ts", future, workspace)).toBe("export const v = 1;\n");
  });
});
