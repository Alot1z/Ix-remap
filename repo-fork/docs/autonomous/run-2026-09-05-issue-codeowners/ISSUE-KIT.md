# Issue kit — code-owner auto-request on ready-opened PRs + GitHub bug #69208

**Status: OPENED + tightened.** Live upstream issue **#608**, opened 2026-09-05, body **rewritten 2026-09-05 16:36Z** to the tight, action-oriented text in `issue-body.md` (1,512 chars, verbatim-verified API round-trip) — same facts, straight "what fixes it" steps, no padding. The paired fix stays a **held draft PR kit** — it opens only at train release with the owner's go, referencing this issue via **Refs #608**.

## The issue (title + body)
- **Title:** `Ready-opened PRs auto-request the root code owner, and the request cannot be removed once the PR is a draft (GitHub bug)`
- **Body (verbatim):** `issue-body.md` — The problem (root CODEOWNERS rule + GitHub bug #69208 + the #604→#605 observation) · What fixes it (draft-from-open / one-line CONTRIBUTING note / track the platform bug) · References.

## Open record
- **#608** opened 2026-09-05, `state: open`, body tightened + verified (recorded in `issue-number.json` + `issue-608-rewrite.json`).

## The concrete fix (grounded 2026-09-05, held as a draft-PR kit)
Assessment: **yes — a minimal docs change is warranted.** CONTRIBUTING.md Development Workflow step 4 is the canonical "open a PR" instruction and its exit-code section already teaches draft-until-dependency; one added line completes the draft guidance where contributors read it. The PR template has **no** review-flow section → no change there.

- **Title (held):** `docs: note draft-first PRs in CONTRIBUTING — code owners are requested at mark-ready`
- **Change:** one line added to CONTRIBUTING.md step 4 (exact old → new text in `fix-pr-body.md`), Refs #608; scope = one file, docs-only.
- **Body (held):** `fix-pr-body.md` — tightened to match the issue's tone, verbatim-ready on the universal welcome-feedback standard, opens as a draft at train release with the owner's go.

## Files
- `ISSUE-KIT.md` (this index) · `issue-body.md` (verbatim live body, tightened) · `issue-number.json` + `issue-608-rewrite.json` (open + rewrite records) · `fix-pr-title.txt` + `fix-pr-body.md` (held draft-PR kit — concrete CONTRIBUTING one-liner, Refs #608)
