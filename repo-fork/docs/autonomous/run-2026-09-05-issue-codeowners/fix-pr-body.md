## Status: DRAFT — part of a larger train

This pull request is intentionally a **draft** and one component of a coordinated set the author is landing together (terminal logo banner · installer polish from the merged-surface audit · toolscan output-contract hardening). It will be marked ready only when every part of the train is green and the whole set is released at once.

Feedback and suggestions are welcome at any stage. Each point is addressed on this branch — folded in or answered — and merged without conflict. The change below is accurate and complete; the branch may still move.

---

Refs #608 — the issue records the behavior behind this note; the platform root fix lives upstream (community #69208), so this PR references rather than closes it.

Companion drafts in the same train: #605 (terminal logo banner) and #609 (installer README-claims fix) — all three open as drafts and are marked ready together.

## What this ships

One line added to **CONTRIBUTING.md** (Development Workflow, step 4 — the canonical "open a PR" instruction), grounded at current main `e8ab1926`:

```
4. Open a PR using the pull request template — work-in-progress opens as a draft;
   GitHub requests code owners at mark-ready, not at draft-open, and a ready-open
   auto-request cannot be removed once a PR is a draft (see #608)
```

That is the whole change. CONTRIBUTING's workflow list is where contributors read the PR step, and its exit-code section already teaches draft-until-dependency — this completes the draft guidance in one place. The PR template has no review-flow section, so no change there.

## Scope

- CONTRIBUTING.md only — one file, one line; docs-only, no tests affected.
- No CODEOWNERS, workflow, template, or product-code change.
- The removal-block is a GitHub platform bug (community #69208), tracked in #608 — not fixable from this repo.
- Nothing is promised beyond what this PR ships.

## Validation

- Consistent with GitHub's documented behavior (verified live 2026-09-05: #605 draft-from-open carried zero requested reviewers; ready-opened #604 auto-requested the code owner and the request could not be removed).
- Exact diff re-verified against CONTRIBUTING.md at main `e8ab1926` (main advanced past `39d0734` on 2026-09-05 when the #547/#559 wave merged; step 4 is unchanged there).
