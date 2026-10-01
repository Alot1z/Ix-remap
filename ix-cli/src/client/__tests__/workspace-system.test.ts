// Copyright 2026 Ix Infrastructure Inc.

import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import { IxClient } from "../api.js";

const servers: Server[] = [];

async function backend(status: number, body: string): Promise<string> {
  const server = createServer((_req, res) => {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(body);
  });
  servers.push(server);
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
}

afterEach(async () => {
  await Promise.all(servers.splice(0).map(s => new Promise<void>(r => s.close(() => r()))));
});

// ensureReadScope caches whatever this returns with no TTL, so a failure that
// came back as `{ systemId: null }` was recorded as "not stitched" and scoped
// every later read in a stitched workspace to one repo.
describe("IxClient.workspaceSystem", () => {
  it("returns the backend's answer", async () => {
    const client = new IxClient(await backend(200, JSON.stringify({ systemId: "sys-1" })));
    await expect(client.workspaceSystem("ws")).resolves.toEqual({ systemId: "sys-1" });
  });

  it("treats a 404 (older backend without the endpoint) as not stitched", async () => {
    const client = new IxClient(await backend(404, "not found"));
    await expect(client.workspaceSystem("ws")).resolves.toEqual({ systemId: null });
  });

  it("reports a server error instead of answering 'not stitched'", async () => {
    const client = new IxClient(await backend(500, "boom"));
    await expect(client.workspaceSystem("ws")).rejects.toThrow(/^500:/);
  });

  it("reports an unreachable backend instead of answering 'not stitched'", async () => {
    const endpoint = await backend(200, "{}");
    await new Promise<void>(r => servers.pop()!.close(() => r()));
    await expect(new IxClient(endpoint).workspaceSystem("ws")).rejects.toThrow();
  });
});
