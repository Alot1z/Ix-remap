# Drafted fix — README installer-surface correction (HELD LOCALLY, NOT SUBMITTED)

Status: DRAFT ONLY. Zero upstream writes. This file is held in the run-dir
(`run-2026-09-05-item2-installer-audit/`) and would ride the train as a draft
PR at dispatch item 9 with the owner's authorization — never piecemeal, never
opened ready. See `installer-audit.md` (same dir) for the evidence behind each
change. Target: `ix-infrastructure/Ix` README.md on main @ `39d0734`.

This is a docs-only correction of the merged README's install surface. It
changes no product code and no registry entry: the harness registry
(`ix-cli/scripts/skill-harnesses.mjs`) is correct, the gemini exclusion is
deliberate, and the toolscan seam text is upstream's own accepted text —
untouched.

## Proposed changes

### 1. README.md:231–232 — native-loading overclaim (finding d)

From:

    the same `skills/ix/` tree natively from its own skills directory — Claude Code
    (`~/.claude/skills`), Agents (`~/.agents/skills`), Codex CLI, Gemini CLI,
    Cursor, and more.

To:

    the same `skills/ix/` tree natively from its own skills directory — Claude Code
    (`~/.claude/skills`), Agents (`~/.agents/skills`), Codex CLI (`~/.codex/skills`),
    and Cursor (`~/.cursor/skills-cursor`).

(Gemini CLI and "and more" removed: the registry is exactly claude, agents,
codex, cursor — gemini has no skills convention and is deliberately absent.)

### 2. README.md:237–238 — wrong deploy targets (findings b + c)

From:

    Codex's `~/.codex/skills`, Gemini's
    `~/.gemini/skills`, Cursor's `~/.cursor/skills`, and more — the same detection

To:

    Codex's `~/.codex/skills`, and
    Cursor's `~/.cursor/skills-cursor` — the same detection

(Gemini's `~/.gemini/skills` removed — not a deploy target; Cursor corrected
to the real destination `~/.cursor/skills-cursor`, which the registry and the
CI both pin.)

### 3. README.md:250 — documented example exits 1 (finding a)

From:

    bash scripts/install-skill.sh claude gemini

To:

    bash scripts/install-skill.sh claude agents

(`claude gemini` as documented exits 1 with `error: unknown harness id
'gemini'`; the corrected example uses two valid registry ids.)

## Not in this draft (deliberately)

- No registry/product change; gemini/opencode/openclaw/vscode stay non-targets.
- No change to the refuse-to-destroy guard or any code behavior (finding e is
  a risk-class note for the maintainer's assessment, not a docs fix).
- No edit to the merged toolscan seam paragraph or its link.
