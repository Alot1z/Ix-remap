#!/usr/bin/env node

// The smoke job installs the fake claude at $HOME/.local/bin/claude and keeps
// it OFF PATH; only this scan names it. The path must match the job's HOME
// (/tmp/ix-harness-home) so the CLI can exec the discovered absolute path.
process.stdout.write(JSON.stringify({
  tools: [{ name: "claude", path: "/tmp/ix-harness-home/.local/bin/claude", source: "root" }],
  truncated: false,
}));