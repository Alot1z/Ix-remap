# Issue kit — code-owner auto-request on ready-opened PRs + GitHub bug #69208

**Status: OPENED.** Live upstream issue **#608** (https://github.com/ix-infrastructure/Ix/issues/608), opened 2026-09-05, title + body verbatim from this kit (verified API round-trip). The paired fix stays a **held draft PR kit** (PR drafts exist; issues don't) — it opens only at train release with the owner's go, referencing this issue via **Refs #608**.

## Verbatim issue

**Title:** `Ready-opened PRs auto-request the root code owner, and the request cannot be removed once the PR is a draft (GitHub bug)`

**Body:**

### Summary
Opening a pull request as **ready** makes GitHub immediately request the root code owner (`* @josephismikhail` in this repo's CODEOWNERS) — for any files, because the root rule matches everything. If the PR is then converted to a **draft**, that pending review request cannot be removed: `DELETE /pulls/{n}/requested_reviewers` fails with `422 Validation Failed — Could not add requested reviewers to pull request`, a GitHub-side bug open since 2023 (community discussion #69208). Re-adding also fails (404). Observed 2026-09-05 on #604: opened ready (auto-request fired 1 s later), converted to draft, removal blocked 3/3 attempts → closed and recreated as #605 opened **as a draft**, which per GitHub docs ("marking a pull request as ready for review will request reviews from any code owners") requests nobody until mark-ready.

### Why it matters
- A co-founder lands on a contributor's review-requested queue for the whole draft lifetime with nothing actionable to review.
- The contributor cannot clean it up through any API — the only escapes are close+recreate (loses the thread) or a maintainer's manual UI action.

### Suggested handling (assess, not a demand)
- Prefer **draft-from-open** for work-in-progress PRs (the repo's own CONTRIBUTING/PR template can say so).
- Track the GitHub-side bug: https://github.com/orgs/community/discussions/69208 — removal should work; it is a platform defect, not repo policy.

### References
- #604 (closed, recreated) → #605 (draft-from-open, zero requested reviewers)
- ix-infrastructure/Ix CODEOWNERS: `* @josephismikhail`

## Open record
- **#608** opened 2026-09-05, `state: open`, title/body match verified true (recorded in `issue-number.json`).

## The concrete fix (grounded 2026-09-05, held as a draft-PR kit)

Assessment of whether the repo warrants a docs change: **yes — minimal and honest.** CONTRIBUTING.md's Development Workflow step 4 is the canonical "open a PR" instruction and currently says only `4. Open a PR using the pull request template`. Its exit-code section already teaches draft-until-dependency, so a general draft-first note completes the guidance in the one place contributors read it. The PR template has **no** review-flow section, so nothing is warranted there; CODEOWNERS/workflows are correctly untouched.

- **Title (held):** `docs: note draft-first PRs in CONTRIBUTING — code owners are requested at mark-ready`
- **Change:** one line added to CONTRIBUTING.md step 4 (exact old → new text in `fix-pr-body.md`), Refs #608; scope = one file, docs-only.
- **Body (held):** `fix-pr-body.md`, verbatim-ready on the universal welcome-feedback standard, train-framed, opens as a draft at train release with the owner's go, Refs #608.

## Files
- `ISSUE-KIT.md` (this index) · `issue-body.md` (verbatim body as opened) · `issue-number.json` (open record) · `fix-pr-title.txt` + `fix-pr-body.md` (held draft-PR kit — concrete CONTRIBUTING one-liner, Refs #608)
