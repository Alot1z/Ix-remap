## Status: DRAFT — part of a larger train

This pull request is intentionally a **draft** and one component of a coordinated set the author is landing together (terminal logo banner · installer polish from the merged-surface audit · toolscan output-contract hardening). It will be marked ready only when every part of the train is green and the whole set is released at once.

Feedback and suggestions are welcome at any stage. Each point is addressed on this branch — folded in or answered — and merged without conflict. The change below is accurate and complete; the branch may still move.

---

Refs [the issue this PR documents — number filled at open] — the issue records the platform behavior behind this note; it is not fully resolved by docs alone (the root fix lives upstream at github/community#69208), so this PR references rather than closes it.

## What this ships

A short contributor-facing note that work-in-progress PRs open as **drafts**: GitHub requests code-owner reviews at **mark-ready**, not at draft-open, so a draft-from-open requests nobody and avoids pinging the root code owner (`* @josephismikhail`) with nothing actionable. Where exactly: the CONTRIBUTING section / PR template that describes the review flow — precise insertion point scoped against current main at open time.

## Scope (explicit)

- Docs only — CONTRIBUTING and/or the PR template, one file.
- No CODEOWNERS change, no workflow change, no product code.
- The underlying removal-block is a GitHub platform bug (community #69208), tracked in the referenced issue — not fixable from this repo.
- Nothing is promised beyond what this PR ships.

## Validation

- Consistent with GitHub's documented behavior: code-owner requests fire when a PR is marked ready for review (verified live 2026-09-05: #605 opened as a draft carried zero requested reviewers; its ready-opened predecessor #604 auto-requested the code owner and the request could not be removed).