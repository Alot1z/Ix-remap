// Copyright 2026 Ix Infrastructure Inc.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { execFileSync } from "node:child_process";

import { requireReadWorkspaceId, resolveWorkspaceId } from "../bootstrap.js";
import { resolveWorkspaceRoot, saveConfig, type WorkspaceConfig } from "../config.js";
import { renderCliError, setErrorFormat, WorkspaceNotMappedError } from "../errors.js";
import { ensureReadScope, resetReadScope, resolveReadSystemId } from "../resolve.js";

/**
 * A graph read from a directory no workspace covers used to be answered: from
 * the `default: true` workspace (an unrelated repo), or, with none, unscoped
 * across every workspace on the backend -- `ix search resolveWorkspaceRoot`
 * came back as four rows, one per checkout of Ix mapped into the backend.
 */

let home: string;
let other: string;
let unmapped: string;
let savedCwd: string;

function register(workspaces: Array<Partial<WorkspaceConfig> & { root_path: string }>, extra: Record<string, unknown> = {}) {
  saveConfig({
    endpoint: "http://localhost:8090",
    format: "text",
    ...extra,
    workspaces: workspaces.map((w, i) => ({
      workspace_id: w.workspace_id ?? `ws00000${i}`,
      workspace_name: w.workspace_name ?? path.basename(w.root_path),
      root_path: w.root_path,
      default: w.default ?? false,
    })),
  } as never);
}

beforeEach(() => {
  // `.native`: on Windows the temp dir is an 8.3 short path (RUNNER~1) and
  // git reports the long one, so the comparisons below need the long form.
  home = fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), "ix-unmapped-")));
  process.env.IX_HOME = path.join(home, ".ix");
  other = path.join(home, "other-repo");
  unmapped = path.join(home, "somewhere-else");
  fs.mkdirSync(other, { recursive: true });
  fs.mkdirSync(unmapped, { recursive: true });
  savedCwd = process.cwd();
  resetReadScope();
});

afterEach(() => {
  process.chdir(savedCwd);
  delete process.env.IX_HOME;
  resetReadScope();
  fs.rmSync(home, { recursive: true, force: true });
});

describe("resolveWorkspaceId", () => {
  it("does not substitute the default workspace for a directory outside it", () => {
    register([{ root_path: other, workspace_id: "0ther001", default: true }]);
    expect(resolveWorkspaceId(unmapped)).toBeUndefined();
    expect(resolveWorkspaceId(path.join(other))).toBe("0ther001");
  });

  it("still honours a workspace pinned by name (`ix config set workspace <name>`)", () => {
    register([{ root_path: other, workspace_id: "0ther001", workspace_name: "other" }], { workspace: "other" });
    expect(resolveWorkspaceId(unmapped)).toBe("0ther001");
  });
});

describe("requireReadWorkspaceId", () => {
  it("names the directory and how to map it", () => {
    register([{ root_path: other, default: true }]);
    let error: unknown;
    try { requireReadWorkspaceId(unmapped); } catch (e) { error = e; }
    expect(error).toBeInstanceOf(WorkspaceNotMappedError);
    const e = error as WorkspaceNotMappedError;
    expect(e.code).toBe("workspace_not_mapped");
    expect(e.dir).toBe(unmapped);
    // Not in a git repository, so a bare `ix map` would fall back to the
    // default workspace: the path is spelled out.
    expect(e.hint).toContain(`ix map ${unmapped}`);
    // Stands alone: `ix mcp` relays the message as-is.
    expect(e.message).toMatch(/^workspace_not_mapped: .* is not inside a mapped Ix workspace/);
    expect(e.message).toContain(e.hint);
  });

  it("points a directory inside an unmapped git checkout at that checkout", () => {
    execFileSync("git", ["init", "-q", unmapped]);
    const sub = path.join(unmapped, "src");
    fs.mkdirSync(sub);
    register([]);
    let error: WorkspaceNotMappedError | undefined;
    try { requireReadWorkspaceId(sub); } catch (e) { error = e as WorkspaceNotMappedError; }
    expect(error?.hint).toContain(`Run \`ix map\` here to map ${unmapped}`);
  });
});

describe("read scope", () => {
  const client = { workspaceSystem: vi.fn(async () => ({ systemId: null })) };

  it("refuses an unscoped read instead of searching every workspace", async () => {
    register([{ root_path: other, default: true }]);
    process.chdir(unmapped);
    await expect(ensureReadScope(client)).rejects.toBeInstanceOf(WorkspaceNotMappedError);
  });

  it("lets `ix doctor` look at the state it exists to report", async () => {
    register([{ root_path: other, default: true }]);
    process.chdir(unmapped);
    await expect(resolveReadSystemId(client, { allowUnmapped: true })).resolves.toBeUndefined();
  });

  it("scopes a read from inside a mapped workspace as before", async () => {
    register([{ root_path: other, workspace_id: "0ther001" }]);
    process.chdir(other);
    await expect(ensureReadScope(client)).resolves.toBeUndefined();
  });
});

describe("resolveWorkspaceRoot", () => {
  it("ranks the git checkout the caller stands in above the default workspace", () => {
    // `ix text` from an unmapped checkout searched the default workspace's
    // files: an answer from an unrelated repository.
    execFileSync("git", ["init", "-q", unmapped]);
    register([{ root_path: other, default: true }]);
    expect(fs.realpathSync.native(resolveWorkspaceRoot(undefined, unmapped))).toBe(unmapped);
  });

  it("keeps the default workspace for a directory with no local context", () => {
    register([{ root_path: other, default: true }]);
    const bare = fs.mkdtempSync(path.join(os.tmpdir(), "ix-bare-"));
    try {
      // Only meaningful where the temp dir is not itself inside a checkout.
      let inGit = true;
      try { execFileSync("git", ["-C", bare, "rev-parse"], { stdio: "ignore" }); } catch { inGit = false; }
      if (!inGit) expect(resolveWorkspaceRoot(undefined, bare)).toBe(other);
    } finally {
      fs.rmSync(bare, { recursive: true, force: true });
    }
  });
});

describe("the error, rendered", () => {
  let out: string[];
  let err: string[];

  beforeEach(() => {
    out = [];
    err = [];
    vi.spyOn(console, "log").mockImplementation((...a) => void out.push(a.join(" ")));
    vi.spyOn(console, "error").mockImplementation((...a) => void err.push(a.join(" ")));
    vi.spyOn(process, "exit").mockImplementation((() => { throw new Error("exit"); }) as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    setErrorFormat(undefined);
  });

  const failure = () => new WorkspaceNotMappedError("/work/unmapped", "Run `ix map /work/unmapped` to map this directory.");

  it("is one structured record in json", () => {
    setErrorFormat("json");
    expect(() => renderCliError(failure())).toThrow("exit");
    expect(JSON.parse(out.join("\n"))).toEqual({
      error: "workspace_not_mapped",
      message: "/work/unmapped is not inside a mapped Ix workspace, so there is no graph to answer from.",
      dir: "/work/unmapped",
      next: "Run `ix map /work/unmapped` to map this directory.",
    });
  });

  it("is one error record in llm", () => {
    setErrorFormat("llm");
    expect(() => renderCliError(failure())).toThrow("exit");
    expect(out).toEqual([
      'error code=workspace_not_mapped message="/work/unmapped is not inside a mapped Ix workspace, so there is no graph to answer from." ' +
        'dir=/work/unmapped hint="Run `ix map /work/unmapped` to map this directory."',
    ]);
  });

  it("is prose on stderr for a person, with nothing on stdout", () => {
    expect(() => renderCliError(failure())).toThrow("exit");
    expect(out).toEqual([]);
    expect(err.join("\n")).toContain("is not inside a mapped Ix workspace");
    expect(err.join("\n")).toContain("Run `ix map /work/unmapped`");
  });
});
