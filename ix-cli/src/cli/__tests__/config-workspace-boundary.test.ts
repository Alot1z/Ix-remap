// Copyright 2026 Ix Infrastructure Inc.

import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { loadConfig, selectWorkspaceForCwd, type WorkspaceConfig } from "../config.js";

function workspace(rootPath: string, name = rootPath): WorkspaceConfig {
  return {
    workspace_id: name,
    workspace_name: name,
    root_path: rootPath,
    default: false,
  };
}

describe("workspace path matching", () => {
  it("matches a workspace root and its descendants", () => {
    const candidate = workspace("/work/app", "app");

    expect(selectWorkspaceForCwd([candidate], "/work/app")).toBe(candidate);
    expect(selectWorkspaceForCwd([candidate], "/work/app/src/features")).toBe(candidate);
  });

  it("does not match a sibling whose name only shares the root prefix", () => {
    const candidate = workspace("/work/app", "app");

    expect(selectWorkspaceForCwd([candidate], "/work/app-copy")).toBeUndefined();
    expect(selectWorkspaceForCwd([candidate], "/work/application")).toBeUndefined();
  });

  it("selects the nearest workspace when roots are nested", () => {
    const parent = workspace("/work/app", "parent");
    const child = workspace("/work/app/packages/api", "child");

    expect(selectWorkspaceForCwd([parent, child], "/work/app/packages/api/src")).toBe(child);
  });
});

describe("loadConfig with no config file", () => {
  const saved = process.env.IX_HOME;
  afterEach(() => {
    if (saved === undefined) delete process.env.IX_HOME;
    else process.env.IX_HOME = saved;
  });

  // Callers edit what they get back and save it; `getOrCreateWorkspace` adds
  // its new workspace to it. Handing out the shared default made that
  // workspace appear in every later load in the process that found no file.
  it("hands out a fresh copy each time", () => {
    const dir = mkdtempSync(join(tmpdir(), "ix-config-default-"));
    try {
      process.env.IX_HOME = join(dir, "absent");
      loadConfig().workspaces = [workspace("/work/app", "app")];
      expect(loadConfig().workspaces).toBeUndefined();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
