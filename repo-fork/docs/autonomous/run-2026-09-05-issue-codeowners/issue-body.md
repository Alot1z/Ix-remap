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