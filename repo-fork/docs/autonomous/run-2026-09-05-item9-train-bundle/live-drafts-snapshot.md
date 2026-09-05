# Live snapshot — every open draft across the campaign (probed 2026-09-05, read-only)

**One screen, all of it:** exactly **one draft PR is open from us**, paired with one open issue (its tracker). Nothing else in the campaign is open anywhere.

## Pull requests

| Repo | PR | State | Head | Requested reviewers | CI |
|---|---|---|---|---|---|
| ix-infrastructure/Ix | **#605** (logo banner) | **DRAFT** | `0869a13` (full `0869a137618…`) | **0** (verified empty) | **29 success / 1 failure** — sole red = the documented CodeQL ref-moved infra race (run `101317167251`, pre-recreation; byte-identical renderer already passed a genuine analysis) |
| ix-infrastructure/Ix | #607 (fix(ingest)) | open — **NOT ours**, NOT a draft | `d7bf76f` | — | — |
| Alot1z/Ix-remap (fork) | — | **0 open PRs** | — | — | — |
| Alot1z/toolscan | — | **0 open PRs** (repo convention: direct commits on main) | main `a3e33771` (owner NUL-byte hardening push, 15:56Z) | — | prior head `2f88671b` run `33971010614` all 5 green |

## Issues

| Repo | Issue | State |
|---|---|---|
| ix-infrastructure/Ix | **#608** code-owner auto-request tracker | **open** — paired to the held fix-PR kit (Refs #608); kept open because its PR is paired (KB #6653) |
| ix-infrastructure/Ix | #606 harness-detector proposal | **closed** (parked-not-resolved note, comment `5553161411`; reopens with its implementation PR) |
| ix-infrastructure/Ix | #568, #527 | pre-campaign open issues, not ours |

## The summary in one line

**#605** draft @ `0869a13` · 0 reviewers · CI green except the documented CodeQL race — and the *only* other open PR in the three repos is **#607, the code owner's own** (not ours, not a draft). Zero fork PRs, zero toolscan PRs, one open issue (#608, ours + paired), one parked-closed issue (#606). #604 stays closed. Nothing else is open.

**Update (same date):** upstream main advanced to `e8ab1926` when the #547/#559 wave merged — #605 now sits behind main and carries a rebase-onto-new-head before mark-ready (body updated accordingly; live draft state unchanged: draft @ `0869a13`, reviewers 0).
