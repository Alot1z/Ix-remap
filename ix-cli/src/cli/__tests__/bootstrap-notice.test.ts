import { describe, it, expect, vi, afterEach } from "vitest";
import { execFileSync } from "node:child_process";
import { renameSync } from "node:fs";
import { join } from "node:path";
import { emitSetupNotice } from "../bootstrap.js";
import { renderBanner, resetBannerCacheForTests } from "../banner.js";
import { renderLogo, resolveColorMode, LogoError } from "../../../../scripts/render-logo.mjs";
import { fileURLToPath } from "node:url";

const SCRIPTS = join(fileURLToPath(import.meta.url), "..", "..", "..", "..", "..", "scripts");
const RENDERER = join(SCRIPTS, "render-logo.mjs");

afterEach(() => {
  vi.restoreAllMocks();
  resetBannerCacheForTests();
});

describe("emitSetupNotice", () => {
  it("writes setup notices to stderr, never stdout (keeps machine output clean)", () => {
    const out = vi.spyOn(console, "log").mockImplementation(() => {});
    const err = vi.spyOn(console, "error").mockImplementation(() => {});

    emitSetupNotice(true, true, "my-workspace");

    // The bug this guards: the banner leaked to stdout and corrupted --format json|llm.
    expect(out).not.toHaveBeenCalled();
    expect(err).toHaveBeenCalled();
    const stderrText = err.mock.calls.map((c) => String(c[0])).join("\n");
    expect(stderrText).toContain("Registered workspace");
    expect(stderrText).toContain("my-workspace");
  });

  it("shows the logo banner when the renderer + asset are present", () => {
    const out = vi.spyOn(console, "log").mockImplementation(() => {});
    const err = vi.spyOn(console, "error").mockImplementation(() => {});

    emitSetupNotice(true, false, "ws");

    expect(out).not.toHaveBeenCalled();
    const banner = renderBanner();
    expect(banner).not.toBeNull();
    const stderrText = err.mock.calls.map((c) => String(c[0])).join("\n");
    // The banner IS the heading: stderr shows exactly the rendered banner
    // (whatever color mode this environment resolves), not the text fallback.
    expect(stderrText).toContain(banner!);
    expect(stderrText).not.toContain("Ix");
  });

  it("falls back to the plain text heading when the renderer is absent (absent-safe)", () => {
    // A layout without scripts/render-logo.mjs must degrade to the old heading —
    // never throw, never leave the notice block empty. Within-file tests run
    // sequentially, so the temporary rename is invisible to the other pins.
    const out = vi.spyOn(console, "log").mockImplementation(() => {});
    const err = vi.spyOn(console, "error").mockImplementation(() => {});

    const rendererBackup = RENDERER + ".bak";
    renameSync(RENDERER, rendererBackup);
    try {
      emitSetupNotice(true, false, "ws");
      const stderrText = err.mock.calls.map((c) => String(c[0])).join("\n");
      expect(stderrText).toContain("Ix");
      expect(stderrText).not.toContain("▀");
    } finally {
      renameSync(rendererBackup, RENDERER);
    }
    expect(out).not.toHaveBeenCalled();
  });
});

describe("renderBanner", () => {
  it("returns a non-empty banner containing half-block cells", () => {
    const banner = renderBanner();
    expect(banner).not.toBeNull();
    expect(banner!.includes("▀")).toBe(true);
    // every non-empty line indented two spaces for the notice block
    // (a leading blank line is intentional spacing)
    for (const line of banner!.split("\n")) {
      if (line.trim()) expect(line.startsWith("  ")).toBe(true);
    }
  });

  it("renders ASCII under NO_COLOR and never writes stdout", () => {
    const out = vi.spyOn(console, "log").mockImplementation(() => {});
    const raw = execFileSync(
      process.execPath,
      [RENDERER, "--width", "16"],
      { encoding: "utf8", env: { ...process.env, NO_COLOR: "1" } },
    );
    expect(raw).not.toMatch(/\x1b\[/); // no escapes in no-color mode
    expect(out).not.toHaveBeenCalled();
  });
});

describe("render-logo CLI contract", () => {
  const run = (args: string[], env: NodeJS.ProcessEnv = {}) =>
    execFileSync(process.execPath, [RENDERER, ...args], {
      encoding: "utf8",
      env: { ...process.env, ...env },
    });

  it("exit 0 + JSON honesty block on --json (cells/ink/truncated)", () => {
    const meta = JSON.parse(run(["--width", "16", "--json"]));
    expect(meta.ok).toBe(true);
    expect(meta.tool).toBe("render-logo");
    expect(meta.truncated).toBe(false);
    expect(meta.cells.ink).toBeGreaterThan(0);
    expect(meta.cells.ink).toBeLessThan(meta.cells.total);
  });

  it("usage error exits 1 and reports to stderr, payload-free stdout", () => {
    let code = 0, stderrText = "", stdoutText = "";
    try {
      execFileSync(process.execPath, [RENDERER, "--width", "4"], { encoding: "utf8", stdio: "pipe" });
    } catch (e: any) {
      code = e.status;
      stderrText = e.stderr?.toString() ?? "";
      stdoutText = e.stdout?.toString() ?? "";
    }
    expect(code).toBe(1);
    expect(stderrText).toContain("--width");
    expect(stdoutText).toBe("");
  });

  it("library renderLogo() matches the CLI byte-for-byte (single algorithm)", () => {
    const viaCli = run(["--width", "24", "--color", "ascii"]);
    const viaLib = renderLogo({ width: 24, color: "ascii" });
    expect(viaLib).toBe(viaCli);
  });

  it("resolveColorMode honors NO_COLOR / COLORTERM / TERM", () => {
    expect(resolveColorMode("auto", { NO_COLOR: "1" } as NodeJS.ProcessEnv)).toBe("ascii");
    expect(resolveColorMode("auto", { COLORTERM: "truecolor", TERM: "xterm" } as NodeJS.ProcessEnv)).toBe("truecolor");
    expect(resolveColorMode("auto", { TERM: "xterm-256color" } as NodeJS.ProcessEnv)).toBe("256");
    expect(resolveColorMode("ascii")).toBe("ascii");
  });

  it("LogoError carries the toolscan-aligned exit code", () => {
    try {
      renderLogo({ width: 4 });
      expect.unreachable("width below minimum must throw");
    } catch (e) {
      expect(e).toBeInstanceOf(LogoError);
      expect((e as LogoError).code).toBe(1);
    }
  });
});
