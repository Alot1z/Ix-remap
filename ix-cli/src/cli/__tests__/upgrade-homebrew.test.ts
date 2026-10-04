// Copyright 2026 Ix Infrastructure Inc.

import { describe, expect, it } from "vitest";

import { homebrewInstall } from "../commands/upgrade.js";

describe("homebrewInstall", () => {
  it("recognises an entry point inside a Homebrew Cellar", () => {
    expect(homebrewInstall("/opt/homebrew/Cellar/ix/0.12.0/libexec/dist/cli/main.js")).toBe(true);
    expect(homebrewInstall("/usr/local/Cellar/ix/0.11.1/libexec/dist/cli/main.js")).toBe(true);
    expect(homebrewInstall("/home/linuxbrew/.linuxbrew/Cellar/ix/0.12.0/libexec/dist/cli/main.js")).toBe(true);
  });

  it("does not take an installer or source checkout for one", () => {
    expect(homebrewInstall("/home/u/.ix/cli/cli/dist/cli/main.js")).toBe(false);
    expect(homebrewInstall("/home/u/src/Ix/ix-cli/dist/cli/main.js")).toBe(false);
    expect(homebrewInstall("/opt/homebrew/Cellar/other/1.0/bin/main.js")).toBe(false);
  });
});
