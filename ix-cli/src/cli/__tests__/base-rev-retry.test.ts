// Copyright 2026 Ix Infrastructure Inc.

import { describe, expect, it } from "vitest";

import { retryOnBaseRevRace } from "../commands/ingest.js";

/** Answers `BaseRevMismatch` `losses` times, then `Ok`. */
function racingCommit(losses: number) {
  let calls = 0;
  const fn = async () => {
    calls++;
    return { rev: calls, status: calls <= losses ? "BaseRevMismatch" : "Ok" };
  };
  return { fn, calls: () => calls };
}

describe("retryOnBaseRevRace", () => {
  it("re-sends until the race is won and returns that result", async () => {
    const commit = racingCommit(2);
    const retries: number[] = [];
    const result = await retryOnBaseRevRace(commit.fn, 5, (n) => retries.push(n));
    expect(result.status).toBe("Ok");
    expect(commit.calls()).toBe(3);
    expect(retries).toEqual([1, 2]);
  });

  it("gives up after maxRetries and returns the lost race for the caller to count", async () => {
    const commit = racingCommit(100);
    const result = await retryOnBaseRevRace(commit.fn, 2);
    expect(result.status).toBe("BaseRevMismatch");
    expect(commit.calls()).toBe(3);
  });

  it("does not retry any other status", async () => {
    for (const status of ["Ok", "Idempotent"]) {
      let calls = 0;
      const result = await retryOnBaseRevRace(async () => { calls++; return { status }; }, 5);
      expect(result.status).toBe(status);
      expect(calls).toBe(1);
    }
  });
});
