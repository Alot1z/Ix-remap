#!/usr/bin/env node

process.stdout.write(JSON.stringify({
  tools: [{ name: "claude", path: "/usr/local/bin/claude", source: "PATH" }],
  truncated: false,
}));
