## Status: DRAFT — part of a larger train

This pull request is intentionally a **draft** and one component of a coordinated set the author is landing together (terminal logo banner · installer polish from the merged-surface audit · toolscan output-contract hardening). It will be marked ready only when every part of the train is green and the whole set is released at once.

Feedback and suggestions are welcome at any stage. Each point is addressed on this branch — folded in or answered — and merged without conflict. The change below is accurate and complete; the branch may still move.

---

Refs #608 — the issue records the platform behavior behind this note; it is not fully resolved by docs alone (the root fix lives upstream at github/community#69208), so this PR references rather than closes it.

## What this ships

A one-line, contributor-facing addition to **CONTRIBUTING.md** (Development Workflow, step 4), grounded against current main (`39d0734`): work-in-progress PRs open as drafts, because GitHub requests code owners at **mark-ready**, not at draft-open — and a ready-open auto-request cannot be removed once a PR is a draft.

The workflow step currently reads:

```
4. Open a PR using the pull request template
```

and becomes:

```
4. Open a PR using the pull request template — work-in-progress opens as a draft;
   GitHub requests code owners at mark-ready, not at draft-open, and a ready-open
   auto-request cannot be removed once a PR is a draft (see #608)
```

Why CONTRIBUTING and nowhere else (grounded at `39d0734`): its Development Workflow step 4 is the canonical "open a PR" instruction, and its exit-code section already teaches draft-until-dependency — this completes the draft guidance in the one place contributors read it. The PR template has no review-flow section, so nothing belongs there. CODEOWNERS, workflows, and product code are untouched.

## Scope (explicit)

- CONTRIBUTING.md only — one file, one added line.
- No CODEOWNERS change, no workflow change, no product code, no template change.
- The underlying removal-block is a GitHub platform bug (community #69208), tracked in #608 — not fixable from this repo.
- Nothing is promised beyond what this PR ships.

## Validation

- Docs-only: no tests affected; the harness-install smoke jobs are untouched but still run on this branch and must stay green.
- Consistent with GitHub's documented behavior: code-owner requests fire at **mark-ready** (verified live 2026-09-05 — #605 opened as a draft carried zero requested reviewers; its ready-opened predecessor #604 auto-requested the code owner and the request could not be removed).
- Grounding diff is exact against CONTRIBUTING.md at main `39d0734`.
