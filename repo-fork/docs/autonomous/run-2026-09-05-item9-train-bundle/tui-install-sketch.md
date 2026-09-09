# Interactive `ix install` TUI — prototype sketch (item 9, LOCAL ONLY)

Status: **local sketch — never pushed, never opened as PR/issue** (owner tick-box 2026-09-05). Not on `chore/installer-ux-polish` (ground-truthed unrecoverable; handoff §3 forbids it). Companion to upstream issue #612 — this is the UI mock for the proposal, strictly a UI over the same engine.

## Iron rule (contract ARCHITECTURE)

Interactive mode = a UI over the same engine automation uses. The engine is
`scripts/install-skill.sh` (and its future `--json` surface). The TUI **pre-fills
the same flags** the automation passes; it never becomes a second implementation.

## Flow

```
$ bash scripts/install-skill.sh --tui        (or: ix install, once upstreamed)

  ██ Ix                                       ← render-logo banner (--bg brand, --bg none env-respected)
  agent skill installer

  ? What should this machine get?
  ❯● Ix skill        → .claude/.agents/.codex/.cursor   (4 found)   [x]
   ○ MCP server      → harness config wiring (stdio)                [ ]
   ○ Editor plugins  → where a plugin marketplace exists            [ ]

  ? Harnesses
  ❯● claude   ~/.claude/skills/ix                (exists → upgrade)
   ○ agents   ~/.agents/skills/ix
   ○ codex    ~/.codex/skills/ix                 (config dir only — no bin)
   ○ cursor   ~/.cursor/skills-cursor

  ? Mode
  ❯● apply now
   ○ dry-run (print commands, write nothing)
   ○ emit --json (machine-readable plan)

  Summary before apply — the exact lines the CI pins:
    would install: /home/<user>/.claude/skills/ix
    would install: /home/<user>/.agents/skills/ix
  Refusal guard unchanged: existing non-ix skill dir → refuse, exit 1, both modes.
```

## Engine mapping (no second engine)

| TUI state | Engine surface today |
|---|---|
| Harness list | the harness registry (`ix-cli/scripts/skill-harnesses.mjs`: claude, agents, codex, cursor) — never a hardcoded list |
| "4 found" detection | same config-dir probes the installer already runs |
| apply / dry-run | `--dry-run` flag passthrough — identical output lines |
| emit plan | `--json` (honest machine output; the TUI is one consumer of it) |
| refusal guard | untouched — same check, same exit codes |
| banner | `renderBanner()` — same absent-safe probe; TUI degrades to the plain heading |

## CI-safe output contracts (non-negotiable)

- Non-TTY → the TUI never activates; falls through to current flag parsing (scripts must stay scriptable).
- `--dry-run` output lines byte-identical with and without TUI (the posix/windows CI greps stay valid).
- `--json` shape unchanged; TUI renders from it, never from a side channel.
- No new exit codes: 0 success, 1 refusal/unknown id — same contract as #611's U1/U2 line.

## Deliberately out of this sketch

- MCP/plugin wiring details (issue #612 rows are proposals; engine hooks land per maintainer direction).
- Any persistent state — the TUI is stateless per invocation.
- Colors beyond the banner's existing 5-tone palette.

## Prototype status (2026-09-06)

`tui-install.mjs` (this dir) implements the sketch: registry-sourced ids,
argv-only state, engine passthrough. Exercised end-to-end against the
re-derived UX branch (chore/installer-ux-output): dry-run parity (U1-labeled
lines identical), --json honesty, apply mode (engine performed the install),
unknown-id fail-closed. Interactive prompts need a real TTY — untested here
by construction, documented as the limitation.
