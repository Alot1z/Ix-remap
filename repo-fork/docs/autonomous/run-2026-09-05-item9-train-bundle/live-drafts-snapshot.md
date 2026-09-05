# Live snapshot — every open draft across the campaign (probed 2026-09-05, after the draft-opens round)

**One screen, all of it:** exactly **three draft PRs are open from us** (the coordinated train, all cross-linked), paired with one open issue (their tracker). Nothing else from the campaign is open anywhere. Zero review requests on all three.

## Pull requests

| Repo | PR | State | Head (branch) | Requested reviewers | CI |
|---|---|---|---|---|---|
| ix-infrastructure/Ix | **#605** (logo banner) | **DRAFT** | `0869a13` on `Alot1z/Ix-remap:feat/tui-logo-banner` | **0** (verified empty) | **green except the single documented CodeQL ref-moved infra race** (run `101317167251`, pre-recreation; byte-identical renderer already passed a genuine analysis) |
| ix-infrastructure/Ix | **#609** (installer README-fix) | **DRAFT** | `b77c4f52` on `Alot1z/Ix:feat/installer-readme-fix` (base `e8ab1926`) | **0** (verified empty) | docs-only — in progress (harness-install smokes run; expected green) |
| ix-infrastructure/Ix | **#610** (CONTRIBUTING draft-first note, **Refs #608**) | **DRAFT** | `4caaf508` on `Alot1z/Ix:docs/contributing-draft-first` (base `e8ab1926`) | **0** (verified empty) | docs-only — in progress |
| ix-infrastructure/Ix | #607 (fix(ingest)) | open — **NOT ours**, NOT a draft | `d7bf76f` | — | — |
| Alot1z/Ix (fork) | — | **0 other open PRs** (the two above are the only ones) | — | — | — |
| Alot1z/toolscan | — | **0 open PRs** (repo convention: direct commits on main) | main `4c0b2d11` | — | — |

## Issues

| Repo | Issue | State |
|---|---|---|
| ix-infrastructure/Ix | **#608** code-owner auto-request tracker | **open** — its paired fix PR **#610** is live (Refs #608); kept open because its PR is paired (KB #6653) |
| ix-infrastructure/Ix | #606 harness-detector proposal | **closed** (parked-not-resolved note, comment `5553161411`; reopens with its implementation PR) |
| ix-infrastructure/Ix | #568, #527 | pre-campaign open issues, not ours |

## The summary in one line

**Three coordinated drafts — #605 (logo), #609 (installer README-fix), #610 (CONTRIBUTING draft-first, Refs #608)** — each `draft: true` with **zero requested reviewers** (post-open verified), bodies byte-verbatim and cross-linked so the train reads as one set. The *only* other open PR in the three repos is **#607, the code owner's own** (not ours, not a draft). Issues: #608 open (ours, paired to #610), #606 parked-closed. #604 stays closed. Nothing is marked ready — mark-ready of the trio is gated on the owner's go at item 9.
