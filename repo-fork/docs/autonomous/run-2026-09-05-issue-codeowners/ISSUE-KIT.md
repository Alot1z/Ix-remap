# Issue kit — code-owner auto-request on ready-opened PRs + GitHub bug #69208

**Status: OPENED → tightened → fix PR opened → BOTH CLOSED (2026-09-05, owner's call).** Issue **#608** was opened 2026-09-05 and its body **rewritten 16:36Z** to the tight action-oriented text in `issue-body.md` (1,512 chars). The paired fix opened as draft PR **#610** (branch `docs/contributing-draft-first` @ `4caaf508`, one CONTRIBUTING.md line at step 4, Refs #608). **Same day the owner judged the pair filler — it documents GitHub behavior but changes none** (no repo setting/CODEOWNERS edit can disable code-owner requests at ready-open; the removal-block is platform bug #69208; draft-from-open is already structural — KB #6646/#6658). **Closed with notes: #610 (PR, branch deleted) + #608 (issue)** — consistent with KB #6653. This kit stays as the complete record of the episode.

## The issue (title + body)
- **Title:** `Ready-opened PRs auto-request the root code owner, and the request cannot be removed once the PR is a draft (GitHub bug)`
- **Body (verbatim):** `issue-body.md` — The problem (root CODEOWNERS rule + GitHub bug #69208 + the #604→#605 observation) · What fixes it (draft-from-open / one-line CONTRIBUTING note / track the platform bug) · References.

## Open/close record
- **#608** opened 2026-09-05, body tightened + verified (`issue-number.json` + `issue-608-rewrite.json`).
- **#610** opened as a draft 2026-09-05 (owner's go), then **closed same day** with a note (owner's call — superseded-by-process); fork branch `docs/contributing-draft-first` deleted.
- **#608 closed** 2026-09-05 with a note (owner's call — superseded-by-process; platform bug tracked at community #69208).

## The concrete fix (drafted 2026-09-05, opened as #610, then closed unmerged)
Assessment at the time: **a minimal docs change was warranted** — CONTRIBUTING.md Development Workflow step 4 is the canonical "open a PR" instruction; one added line completes draft guidance there. The PR template has **no** review-flow section → no change there. **Later that day the owner judged the pair non-load-bearing and had both closed** (see Status) — the change text below stays as the drafted record.

- **Title (was #610):** `docs: note draft-first PRs in CONTRIBUTING — code owners are requested at mark-ready`
- **Change:** one line added to CONTRIBUTING.md step 4 (exact old → new text in `fix-pr-body.md`), Refs #608; scope = one file, docs-only.
- **Body (was #610):** `fix-pr-body.md` — tightened to match the issue's tone, verbatim on the universal welcome-feedback standard, opened as a draft (zero reviewers).

## Files
- `ISSUE-KIT.md` (this index) · `issue-body.md` (verbatim issue body, tightened) · `issue-number.json` + `issue-608-rewrite.json` (open + rewrite records) · `fix-pr-title.txt` + `fix-pr-body.md` (the #610 draft-PR kit — concrete CONTRIBUTING one-liner, Refs #608)
