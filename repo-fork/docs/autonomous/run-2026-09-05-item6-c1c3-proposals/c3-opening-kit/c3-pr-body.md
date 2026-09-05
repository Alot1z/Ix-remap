## Status: DRAFT — prepared for feedback (not part of the current release set)

This draft is prepared so the direction is reviewable. It is **not** in the current coordinated release set (logo banner · installer docs fix · toolscan hardening) and will not be opened or marked ready without the owner's explicit go.

Feedback and suggestions are welcome at any stage. Each point is addressed on this branch — folded in or answered — and merged without conflict. The text below is a design proposal; nothing is promised beyond what this PR would ship.

---

## What this proposes

Lifecycle verbs on the merged installer script (`scripts/install-skill.sh`, #591). Today it installs, previews (`--dry-run`), overwrites (`--force`), and reports (`--json`) — but cannot answer what it installed, when, or how to remove it. This adds three registry-driven verbs, all keyed to the same `name: ix` ownership marker the refuse-to-destroy guard already relies on:

- `list` — report what Ix installed, per harness (`id | version-sha | path | updated-at`). Copies that exist but lack the marker are reported as `foreign` — present, not ours, left alone. Exit 0.
- `update` — diff each owned copy against the current `skills/ix` (file count + content hash) and re-deploy only stale ones; a no-op reports nothing changed; `--dry-run` previews the stale set.
- `remove` — delete only Ix-owned directories (the marker is required, reusing the existing guard exactly); a foreign directory is never removable — there is no correct case for deleting a non-Ix skill.

Nothing is executed to detect a harness; every verb is registry-driven and structurally verified, matching the merged installer's quality bar.

## Scope

- `scripts/install-skill.sh` + smoke coverage on the existing harness jobs (windows + ubuntu legs); the 8-job success gate is unchanged — the smoke jobs grow, no new jobs.
- **No `ix` CLI subcommand** (`ix skill …`) — that is a separate, upstream-owned surface (D8), not this change. No registry-id change, no new dependencies.
- Nothing is promised beyond what this PR ships.

## Validation (planned)

- Hermetic-homed smoke (`HARNESS_HOME`), both CI legs: list-after-install, update-after-stale-write, remove-restores-pre-state.
- All verbs refuse foreign dirs; `remove` requires the `name: ix` marker in every path.

## Note on provenance

The `list/update/remove` verb family takes inspiration from vercel-labs/skills (`skills.sh`). Full design detail lives in the author's proposal doc and can be ported into repo docs if this direction is wanted.
