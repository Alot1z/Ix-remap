// Copyright 2026 Ix Infrastructure Inc.

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { ingestMtimeCachePath, ingestRebuildPath, mapBaselinePath, mapResultCachePath } from "../config.js";

/**
 * `ix ingest <path>` canonicalises its root, so it writes its baseline under
 * the real path's key. A caller that spelled the same root another way -- a
 * symlink here; macOS's /tmp or a Windows 8.3 name like RUNNER~1 in the wild
 * -- looked under its own spelling, found nothing, and re-ingested everything.
 */

let dir: string;
let link: string;

beforeEach(() => {
  dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "ix-rootkey-")));
  fs.mkdirSync(path.join(dir, "repo"));
  link = path.join(dir, "via-link");
  fs.symlinkSync(path.join(dir, "repo"), link, "dir");
});

afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

describe("per-root state paths", () => {
  it("are the same for every spelling of one root", () => {
    for (const at of [ingestMtimeCachePath, ingestRebuildPath, mapBaselinePath, mapResultCachePath]) {
      expect(at(link), at.name).toBe(at(path.join(dir, "repo")));
      expect(at(path.join(dir, "repo", ".")), at.name).toBe(at(path.join(dir, "repo")));
    }
  });

  it("still differ between roots", () => {
    fs.mkdirSync(path.join(dir, "other"));
    expect(ingestMtimeCachePath(path.join(dir, "other"))).not.toBe(ingestMtimeCachePath(path.join(dir, "repo")));
  });

  it("key a root that does not exist yet by its resolved path", () => {
    expect(ingestMtimeCachePath(path.join(dir, "missing"))).toBe(ingestMtimeCachePath(path.join(dir, "missing", ".")));
  });
});
