# Ix skill installer — live demo (hermetic) + GIF

Shows the real `scripts/install-skill.sh` (from the repo clone) doing a full
install — detection of every harness home, per-host copy, verify — **without
touching any real home directory**.

## Re-run

```bash
bash install-demo/run-install-demo.sh
```

That regenerates `install-demo/tmp-home/` (the hermetic target), appends to
`install-demo/transcript.txt`, and rebuilds `install-demo/install-demo.gif`
(75 frames, 872×550 — watchable end to end: dry-run JSON → host detection →
real copy → final tree).

## Why it is hermetic

`scripts/install-skill.sh` honors `$HOME`; the runner points `HOME` +
`USERPROFILE` at `tmp-home/`, so the four harness installs land at:

```
tmp-home/.claude/skills/ix
tmp-home/.agents/skills/ix
tmp-home/.codex/skills/ix
tmp-home/.cursor/skills-cursor/ix
```

No other environment override exists (no `--prefix` / `--root` flag in the
installer), so `HOME`-redirection is the correct hermetic seam. The script
prints `HARNESS_HOME=...` on line one so a capture can never be mistaken for
a real install.

## Disclosure (2026-09-05, corrected mid-round)

One early run of this demo ignored `HOME` (the inherited env was not cleared)
and performed the installer's designed action on the **real** harness dirs —
byte-identical `skills/ix` copies to `~/.claude`, `~/.agents`, `~/.codex`,
`~/.cursor`. It was rolled back the same round: the copies were moved to
`rollback-realhome/` (kept as reversible evidence) and all four real homes
verified clean afterward. The runner now clears `HOME`/`USERPROFILE` into
`tmp-home` up front so this cannot recur.

## What the GIF shows (install-demo.gif)

1. `--dry-run --json` — the probe battery reporting per host: `would-install`,
   destination, and `detectedVia` (path vs config-dir).
2. Real run — copies `skills/ix` (SKILL.md + scripts + references) into the
   four hermetic homes.
3. Verification — the installed tree's `SKILL.md` present at each destination.

## Public install (for context, 2026-09-05)

This demo exercises the repo's own bootstrap. For a user who does **not** have
the repo, the upstream-published paths (all owned by the Ix team, none of them
ours to ship):

| Path | Command | Status |
|---|---|---|
| Standalone installer (Node/Docker/backend/CLI) | `curl -fsSL https://ix-infra.com/install.sh \| sh` | upstream infra (their host) |
| Skill-harness bootstrap (what this demo runs) | `bash scripts/install-skill.sh` (from a clone) | works today |
| Homebrew | `Formula/ix.rb` + GitHub release tarball via `scripts/release.sh` | upstream release process |
| npm / npx | package `@ix/cli` (v0.10.5 on the branch) | **needs the team's npm publish** — after that, `npx @ix/cli …` becomes the zero-clone path |
