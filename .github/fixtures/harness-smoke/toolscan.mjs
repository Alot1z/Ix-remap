#!/usr/bin/env node

// The smoke job installs the fake claude at $HOME/.local/bin/claude and keeps
// it OFF PATH; only this scan names it. The path must match the job's HOME so
// the CLI can exec the discovered absolute path — resolve it from the
// environment rather than hardcoding the job's temp HOME.
const home = process.env.HOME || "/tmp/ix-harness-home";
process.stdout.write(JSON.stringify({
  tools: [{ name: "claude", path: `${home}/.local/bin/claude`, source: "root" }],
  truncated: false,
}));
