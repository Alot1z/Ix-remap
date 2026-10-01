// Copyright 2026 Ix Infrastructure Inc.

import { afterEach, describe, expect, it } from "vitest";
import { canAutoStartBackend, ensureBackendAvailable } from "../bootstrap.js";

// An unreachable backend used to trigger `ix docker start` whatever the
// endpoint was. That command only ever starts the local compose on :8090, so
// for a remote or a second local backend it started unrelated containers and
// reported success while the configured endpoint stayed down.
describe("canAutoStartBackend", () => {
  it("allows the local default backend", () => {
    expect(canAutoStartBackend("http://localhost:8090")).toBe(true);
    expect(canAutoStartBackend("http://127.0.0.1:8090/")).toBe(true);
  });

  it("refuses a remote endpoint", () => {
    expect(canAutoStartBackend("https://ix.example.com")).toBe(false);
    expect(canAutoStartBackend("http://staging:8090")).toBe(false);
  });

  it("refuses a local backend on another port", () => {
    expect(canAutoStartBackend("http://localhost:9090")).toBe(false);
  });
});

describe("ensureBackendAvailable", () => {
  const saved = process.env.IX_ENDPOINT;
  afterEach(() => {
    if (saved === undefined) delete process.env.IX_ENDPOINT;
    else process.env.IX_ENDPOINT = saved;
  });

  it("names the unreachable endpoint instead of starting local containers", async () => {
    // Port 9 (discard) on loopback: nothing listens, the connection is refused.
    process.env.IX_ENDPOINT = "http://127.0.0.1:9";
    await expect(ensureBackendAvailable()).rejects.toThrow("Ix backend at http://127.0.0.1:9 is not reachable.");
  });
});
