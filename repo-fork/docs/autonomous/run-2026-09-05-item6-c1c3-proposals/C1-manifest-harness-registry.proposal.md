# C1 — Manifest-driven harness registry (PLAN ONLY)

Status: **PROPOSAL ONLY — not promised, not scheduled for submission, no
upstream writes.** Upstream's install surface is done (merged #591) and is
the maintainer's now (D8). This doc is held as a design reference in the
fork's docs for a future Ix-side change only the maintainer could initiate —
or as the shape for Alot1z's own fork-side tooling. It is intentionally
*not* a pull request, not a draft, not an issue.

## What it proposes

The merged installer keeps its harness table as `SKILL_DIRS` inside
`ix-cli/scripts/skill-harnesses.mjs` — a small, deliberate, one-line-per-
harness registry (claude/agents/codex/cursor), consumed by both the bash
installer and the MCP discovery path. C1 proposes the **next shape of that
registry**: a single manifest each harness row fully describes, so every
consumer (bash installer, `ix mcp install`, future lifecycle verbs — see
C3) reads the same row and cannot drift from it.

One data row per harness:

| field | example | meaning |
|---|---|---|
| `id` | `cursor` | stable id; the only value accepted on the CLI |
| `bin` | `cursor` | probe binary (empty when config-only, e.g. agents) |
| `probeType` | `bin-or-config` | how presence is decided (`bin` / `config` / `bin-or-config`) |
| `configDir` | `~/.cursor` | presence/config probe target |
| `skillDir` | `~/.cursor/skills-cursor` | real skill destination (verified per harness) |
| `registerMethod` | `none` | how the harness loads the skill (`none` = drops into the convention dir) |
| `registrationDate` | `2026-09-03` | when the row's paths were probe-VERIFIED on a real machine |
| `verifiedBy` | `live probe` | KB #6455: rows are probe-VERIFIED only, never guessed |

## Rules the manifest inherits (frozen quality bar, D4)

- **Probe-VERIFIED rows only** (KB #6455): a harness enters the manifest only
  when its paths were verified against the real tool on a real machine — the
  same discipline that caught `~/.cursor/skills` vs `skills-cursor`.
- **Deliberate absence is data**: gemini/opencode/openclaw/vscode stay absent
  with the reason recorded in the manifest header ("no skills convention"),
  exactly as the current header comment does — absence must never read as an
  oversight.
- **One writer**: adding a harness remains a deliberate one-line-class edit in
  the manifest, reviewed like a contract change — because it is one.
- **No behavior change without a consumer**: the manifest is a refactor of the
  *shape* of the registry; every consumer change ships with its own pins and
  its own CI leg (see below).

## Why it exists as an idea

The installer audit (queue item 2) re-confirmed the current registry is
correct and its docs drifted instead — the failure mode was *documentation
claiming* harnesses the registry excludes. A manifest that both code and docs
generate from removes that whole class: one row is the single source for the
README table, the CLI's `valid ids` error, and every consumer. Whether that
generation happens is a scope call only the maintainer can make.

## CI cost (explicit)

The manifest change alone adds no new jobs; but shipping it means the
existing **harness-smoke jobs become the manifest's contract test** — the two
harness smoke jobs (one on a real windows-2022 runner, ci.yml:369–372) already
pin every row's paths and the negative set (non-target harnesses never
install). Cost today: zero new jobs, but the smokes are **load-bearing**: any
future harness addition must extend the smoke pins in the same commit, and the
smokes can never be removed while the manifest exists. If doc generation from
the manifest is added later, it rides the existing docs jobs.

## Credit

Install-surface concepts (registry-as-manifest, per-harness metadata rows)
draw on the shape of vercel-labs/skills (skills.sh). Per D2/D8 this credit
lives **in this design doc only** — it never appears in any committed file,
code, or future PR body beyond what a shipped artifact actually contains.
