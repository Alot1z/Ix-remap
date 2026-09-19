# Live snapshot — every open draft across the campaign (probed 2026-09-05, after the close-out round)

**One screen, all of it:** exactly **two draft PRs are open from us** (the coordinated train — #605 logo banner with its rendered picture, #609 installer README-fix), cross-linked to each other. **Zero review requests.** #610 (CONTRIBUTING note) and #608 (issue) were closed the same day at the owner's call as superseded-by-process.

## Pull requests

| Repo | PR | State | Head (branch) | Requested reviewers | CI |
|---|---|---|---|---|---|
| ix-infrastructure/Ix | **#605** (logo banner + rendered preview PNGs) | **DRAFT** | `c05c3a77` on `Alot1z/Ix-remap:feat/tui-logo-banner` (0869a137 + preview commit) | **0** (verified empty) | re-running on the new head (the pre-update CodeQL ref-moved infra race clears on a branch update) |
| ix-infrastructure/Ix | **#609** (installer README-fix) | **DRAFT** | `b77c4f52` on `Alot1z/Ix:feat/installer-readme-fix` (base `e8ab1926`) | **0** (verified empty) | docs-only — green (24 success) |
| ix-infrastructure/Ix | #610 (CONTRIBUTING draft-first note) | **closed 2026-09-05** (superseded-by-process; branch deleted) | — | — | — |
| ix-infrastructure/Ix | #607 (fix(ingest)) | open — **NOT ours**, NOT a draft | `d7bf76f` | — | — |
| Alot1z/Ix (fork) | — | **0 other open PRs** | — | — | — |
| Alot1z/toolscan | — | **0 open PRs** (repo convention: direct commits on main) | main `4c0b2d11` | — | — |

## Issues

| Repo | Issue | State |
|---|---|---|
| ix-infrastructure/Ix | **#608** code-owner auto-request tracker | **closed 2026-09-05** with its PR #610 (superseded-by-process; platform bug tracked at community #69208) |
| ix-infrastructure/Ix | #606 harness-detector proposal | **closed** (parked-not-resolved note, comment `5553161411`; reopens with its implementation PR) |
| ix-infrastructure/Ix | #568, #527 | pre-campaign open issues, not ours |

## The summary in one line

**Two coordinated drafts — #605 (logo, with a rendered banner picture in the body) and #609 (installer README-fix)** — each `draft: true` with **zero requested reviewers**, bodies byte-verbatim and cross-linked. #610 and #608 were opened then **closed** the same day at the owner's call (they document GitHub behavior but change none; the real prevention is structural). The only other open PR in the three repos is **#607, the code owner's own** (not ours, not a draft). No open issues remain from us. Nothing is marked ready — mark-ready of the pair is gated on the owner's go at item 9.
