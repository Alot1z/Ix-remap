// Copyright 2026 Ix Infrastructure Inc.

// Dev-only preload that logs every backend request a CLI run makes, for
// measuring request counts and time spent waiting on the backend:
//
//   IX_FETCH_LOG=/tmp/run.jsonl node --import ./scripts/fetch-log.mjs dist/cli/main.js context Foo
//
// Appends one JSON line per request -- method, path, ms, response bytes, and
// the ms since process start it was sent at -- plus a `first` line when the
// first request goes out (time to first request = start-up cost) and an
// `exit` line. IX_FETCH_BODY=1 adds each request body, which is what telling
// a repeated request from a merely similar one needs.

import { appendFileSync } from "node:fs";
import { performance } from "node:perf_hooks";

const out = process.env.IX_FETCH_LOG;
const withBody = process.env.IX_FETCH_BODY === "1";
const log = (record) => { if (out) appendFileSync(out, `${JSON.stringify(record)}\n`); };
const original = globalThis.fetch;
let first = true;

globalThis.fetch = async function loggedFetch(input, init) {
  const url = new URL(typeof input === "string" ? input : input.url ?? String(input));
  const start = performance.now();
  if (first) { first = false; log({ ev: "first", t: +start.toFixed(1) }); }
  const response = await original(input, init);
  // Measured to the end of the body, off a clone so the caller still reads it.
  const bytes = (await response.clone().arrayBuffer()).byteLength;
  log({
    ev: "req",
    method: init?.method ?? "GET",
    path: url.pathname + url.search,
    start: +start.toFixed(1),
    ms: +(performance.now() - start).toFixed(1),
    bytes,
    ...(withBody && typeof init?.body === "string" ? { body: init.body } : {}),
  });
  return response;
};

process.on("exit", () => log({ ev: "exit", t: +performance.now().toFixed(1) }));
