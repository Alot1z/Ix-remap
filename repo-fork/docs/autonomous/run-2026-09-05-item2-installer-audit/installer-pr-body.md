## Status: DRAFT — part of a larger train

This pull request is intentionally a **draft** and one component of a coordinated set the author is landing together (terminal logo banner · installer polish from the merged-surface audit · toolscan output-contract hardening). It will be marked ready only when every part of the train is green and the whole set is released at once.

Feedback and suggestions are welcome at any stage. Each point is addressed on this branch — folded in or answered — and merged without conflict. The change below is accurate and complete; the branch may still move.

---

## What this ships

A **docs-only correction** of the README's install surface, from an audit of the merged surface against what the registry actually does (findings re-derived line-by-line from current main). It changes no product code and no registry entry — the harness registry (`ix-cli/scripts/skill-harnesses.mjs`) is correct as merged:

- **Native-loading overclaim trimmed** — the README's "Gemini CLI … and more" listing is removed. The registry is exactly four harness ids (`claude`, `agents`, `codex`, `cursor`); Gemini has no skills convention and is deliberately absent, so it cannot load natively.
- **Deploy targets corrected** — Gemini's `~/.gemini/skills` is removed (not a deploy target of this installer), and Cursor is corrected to its real destination `~/.cursor/skills-cursor` (the path the registry and the CI both pin).
- **Documented example fixed** — `bash scripts/install-skill.sh claude gemini` exits 1 (`error: unknown harness id 'gemini'`); the example now uses two valid registry ids: `bash scripts/install-skill.sh claude agents`.

## Scope (explicit)

- README.md only — one file, no registry change, no product code, no CI surface.
- The gemini exclusion stays deliberate (deliberate absence is data, not an omission to fill).
- The refuse-to-destroy guard is untouched; its satisfiability-by-a-foreign-`name: ix`-skill point is a risk-class note for the maintainer's assessment, not a docs fix.
- The merged toolscan seam paragraph and link are upstream's own accepted text — untouched.
- Nothing is promised beyond what this PR ships.

## Companion

This draft is part of the same coordinated set as #605 (terminal logo banner); both open as drafts, reference each other, and are marked ready together at the train release.

## Validation

- The `claude gemini` example was run against the merged registry: exits 1 with `error: unknown harness id 'gemini'`; the CI's own negative pin asserts the same.
- The corrected example and target paths match the registry's real ids and destinations (`~/.cursor/skills-cursor` pinned by the harness-install smoke jobs).
- Diff is exactly README.md; no tests are affected (docs-only), but the harness-install smoke jobs still run on this branch and must stay green.
