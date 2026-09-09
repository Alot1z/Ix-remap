### The problem
This repo's CODEOWNERS root rule (`* @josephismikhail`) auto-requests the code owner whenever a PR opens **ready** — for any files, because the root rule matches everything. Turning that PR into a **draft** does not retract the request, and removing it then fails: `DELETE /pulls/{n}/requested_reviewers` returns `422 Could not add requested reviewers` (GitHub bug, community #69208, open since 2023; re-adding → 404).

Observed on #604: opened ready (auto-request fired 1 s later), converted to draft, removal blocked ×3 → closed and reopened as #605 **draft-from-open**, which requests nobody until mark-ready (GitHub's documented behavior).

Effect: a co-founder sits on the contributor's review-requested queue for the whole draft lifetime with nothing actionable — and the contributor has no API to clean it up (only close+recreate, or a maintainer's manual action).

### What fixes it
1. **Contributors:** open work-in-progress PRs as drafts (`draft: true` at create). Code owners are requested at **mark-ready**, never at draft-open — so drafts request nobody.
2. **Repo docs:** state the draft-first rule where contributors read it — proposed in the paired draft PR (CONTRIBUTING, one line).
3. **Platform:** track https://github.com/orgs/community/discussions/69208 — removing a pending request on a draft should work; it is a GitHub defect, not repo policy.

### References
- #604 (closed, recreated) → #605 (draft-from-open, zero requested reviewers)
- CODEOWNERS: `* @josephismikhail`
