# KB #6658 — implemented: `gh-pr.mjs create --draft` (record copy, 2026-09-05)

**What:** `gh-pr.mjs create` now accepts `--draft` (draft:true at create) so
draft-from-open is a first-class gated surface. Ready-open stays the default
when the flag is absent (additive, asserted). This removes the recurrence risk
that forced the #609/#610 opens through a hand-rolled `gh-api.mjs` driver and
would otherwise re-trigger the #604 ready-open code-owner disaster (KB #6646,
community #69208).

**Live change location (canonical):**
`C:/Users/Mose/.agents/skills/agent-principles/tools/gh-pr.mjs` +
`C:/Users/Mose/.agents/skills/agent-principles/tools/e2e-scratch.mjs`
(installed skill root — the only copy; **no enclosing git repo**, so no local
commit — this dir is the record).

**Files here:**
- `gh-pr.mjs` / `e2e-scratch.mjs` — updated copies (byte-identical to live)
- `gh-pr.mjs.diff` / `e2e-scratch.mjs.diff` — unified diff vs the pre-change
  originals (backups also at `../.backup-tools/*.bak`)

**Verification (all live, 2026-09-05):**
- `node --check` both files — clean
- `doctor.mjs` — **ALL GREEN** (incl. pack freshness/idempotency after the
  durable pack regen)
- `e2e-scratch.mjs` — **ALL PASS (28 API calls)** — the new pins: ready-open
  default (no `--draft`) is NOT a draft; `create --draft` opens draft:true
  with verbatim title/body, zero requested reviewers, open then closed
- Scratch proof repos auto-archived in cleanup (delete_repo scope absent on
  the token — the tool's documented fallback)

**KB row:** #6658 updated to implemented (title/content/notes). Regen of the
durable agent-principles pack ran after the KB write so doctor stays green.
