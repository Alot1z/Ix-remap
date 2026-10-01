// Copyright 2026 Ix Infrastructure Inc.

import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// A failed background update check wrote no cache, so every later command
// fetched again: three requests per command against GitHub's 60/hour
// unauthenticated limit, which kept a rate-limited user rate-limited.
describe("checkForUpdate when GitHub does not answer", () => {
  let home: string;

  beforeEach(() => {
    // upgrade.ts binds IX_HOME at load time, so load it fresh under a temp home.
    vi.resetModules();
    home = mkdtempSync(join(tmpdir(), "ix-update-check-"));
    process.env.IX_HOME = home;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.IX_HOME;
    rmSync(home, { recursive: true, force: true });
  });

  it("records the attempt, so the next command does not ask again within the hour", async () => {
    const fetch = vi.fn(async () => new Response("rate limited", { status: 403 }));
    vi.stubGlobal("fetch", fetch);
    const { checkForUpdate } = await import("../commands/upgrade.js");

    await checkForUpdate();
    expect(fetch).toHaveBeenCalledTimes(3);
    const cache = JSON.parse(readFileSync(join(home, ".version-check.json"), "utf8")) as { checkedAt: number };
    expect(Date.now() - cache.checkedAt).toBeLessThan(60_000);

    await checkForUpdate();
    expect(fetch, "answered from the cache").toHaveBeenCalledTimes(3);
  });
});
