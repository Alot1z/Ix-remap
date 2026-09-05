# C3 — Skill lifecycle verbs: `list` / `update` / `remove` (PLAN ONLY)

Status: **PROPOSAL ONLY — not promised, not scheduled for submission, no
upstream writes.** Upstream's install surface is done (merged #591) and is
the maintainer's now (D8). Held in the fork's docs as a design reference;
only the maintainer could initiate an Ix-side change, and Alot1z makes no
commitment to file it. Not a PR, not a draft, not an issue.

## What it proposes

`scripts/install-skill.sh` today installs (to every present harness, or to
explicit ids) and previews (`--dry-run`), overwrites (`--force`), reports
(`--json`) — but cannot answer *what it installed, when, or how to remove
it*. C3 proposes three lifecycle verbs on the same script, each meeting the
frozen quality bar (D4): registry-driven, structurally verified probes,
refuse-to-destroy, truthful dry-run, hermetic.

Concrete shapes (no implementation has begun):

```
bash scripts/install-skill.sh list                 # what Ix installed, per harness
bash scripts/install-skill.sh update               # re-deploy current skills/ix over stale copies
bash scripts/install-skill.sh remove               # uninstall only what Ix installed
bash scripts/install-skill.sh remove claude codex  # explicit harnesses
```

### `list`
Reads each destination in the registry (the C1 manifest's `skillDir` rows)
and reports `id | installed-version-sha | path | updated-at` for copies whose
`SKILL.md` carries `name: ix` — the same ownership marker the refuse-to-destroy
guard already relies on. Copies that exist but do not carry the marker are
reported as `foreign` (present, not ours, left alone). Exit 0.

### `update`
For each owned copy (`name: ix` marker present): diff the installed tree
against the current `skills/ix` (file count + a content hash), and re-deploy
only stale copies — a no-op reports nothing changed. `--dry-run` previews the
stale set. Exit 0 when current, 0 (not 1) after a successful update; foreign
destinations are reported and skipped, never touched.

### `remove`
For each owned copy: refuse unless the `name: ix` marker is present
(reuses the existing guard exactly — the marker is the only thing Ix may
delete); `--dry-run` predicts; `--force` is NOT accepted on remove of a
foreign dir (there is no case where deleting a non-Ix skill is correct).
Removal deletes only the Ix-owned directory, never the harness config or
`~/.cursor` etc.

## Ownership marker — the load-bearing invariant

All three verbs key off the **same `name: ix` marker** the merged installer
uses to refuse destroying a foreign skill (install-skill.sh:140). That is the
whole discipline: Ix may create, update, and remove exactly what carries its
marker, and nothing else. The audit's risk note (finding e) applies equally
here — a foreign skill that happens to carry `name: ix` would be treated as
owned; that pre-existing guard limitation is recorded, not silently widened.

## CI cost (explicit)

The lifecycle verbs are the most expensive proposal on the board because the
**harness-smoke jobs are load-bearing post-merge** (ci.yml:369–372): every new
verb needs smoke coverage on the windows-2022 leg (where the real `.cmd`
registration happens) and the ubuntu leg — list after install, update after a
stale write, remove restores the pre-state. Estimated shape: the existing two
smoke jobs grow rather than new jobs being added, keeping the 8-job success
gate unchanged; a hermetically-homed smoke (like the current `HARNESS_HOME`
probe) keeps it off real user profiles. The alternative — shipping lifecycle
verbs with no smoke — is not an option under the standing quality bar.

## Credit

The `list/update/remove` verb family and the update-stale-copies semantics are
inspired by vercel-labs/skills (skills.sh) `add/list/update/remove`. Per
D2/D8 this credit lives **in this design doc only** — never in any committed
file or future PR body beyond what a shipped artifact actually contains.
