# State — run-2026-09-05-item9-train-bundle

**Date:** 2026-09-05 (state written ~16:10Z; PR recreated 15:45Z)
**Scope:** train bundle + illustrated TUI-logo showcase + item 9 (prepared, awaiting owner go) + item 10 (drafted).
**Live state:** PR **#605** — DRAFT (opened draft-from-open), head `0869a137`, **requested reviewers: NONE**, CI 29/30 (sole red = the documented CodeQL infra-race run `101317167251`). PR **#604** — **CLOSED** 15:45Z with a verbatim note linking #605. Toolscan main unchanged at `2f88671b`. Nothing else opened or marked ready.

## Why #604 closed and #605 opened (owner correction, 2026-09-05)
#604 was opened as *ready* and later converted to draft. GitHub auto-requested the `* @josephismikhail` code-owner review 1 s after that ready-open — and removing a pending review request once a PR is a draft is blocked by a GitHub-side bug (community #69208, open since 2023; reproduced 3/3 DELETEs → 422, re-add → 404). GitHub docs: code-owner requests fire at **mark-ready**, never at draft-open. So #604 was closed and **recreated as #605 draft-from-open** on the same branch/head/body — which carries zero requested reviewers, verified live. Universal rule recorded as agent-knowledge **#6646** (VERIFIED/TRUSTED): drafts get no review requests; never request reviewers on a draft; if a request is stuck, recreate draft-from-open.

## Artifacts
- `pr-605-illustrated-showcase.html` — **the full TUI-logo showcase** (preview222-style): 15 pixel-art variants (truecolor/256/ascii × 48/80/112 × brand/none) rendered **live from the PR-head renderer**, raw-ANSI textareas, the art, live #605 state. Replaces the icon-copy report (`pr-604-illustrated-report.html` kept as the earlier record).
- `.logo-pr-body-v2.md` — #605's body: DRAFT + train framing, **welcome-feedback** wording (comments/suggestions appreciated; issues addressed on-branch, merged without conflict).
- `TRAIN-REPORT.md` / `ITEM-9-BUNDLE.md` / `ITEM-10-FINAL-REPORT.md` — earlier-session record; item 9 NOT executed (owner re-confirmed drafts-only), item 10 drafted.
- `pr-data.json`, `pr2-data.json`, `pr-recreated.json`, `logo.png`, preview outputs — probe payloads + art.
- Scratch (`.`-prefixed): `.probe2.mjs`, `.fix-reviewer*.mjs`, `.diag-reviewers.mjs`, `.recreate-pr.mjs`, `.post-close-comment.mjs`, `.check-probe.mjs`, `.build-showcase.mjs`, `.logo-pr-title.txt`, `.logo-pr-body-v2.md`, `.close-comment.md`.

## Verification (this session)
- #604 closed (API state=closed, closed_at 15:45:07Z); closing comment posted verbatim, by Alot1z.
- #605: draft=true, head `0869a13761`, requested_reviewers `[]`, body byte-equal to `.logo-pr-body-v2.md` (all live-verified).
- Showcase: 15 variants rendered from `render-logo.mjs` at the PR head; DOM-verified (7 sections, 14 pixel grids, 489-tone hero).
- KB #6646 added → verify-gate PASS → promoted TRUSTED (VERIFIED).
- Local fork record commit `37741ff` (earlier-phase dirs, 15 files, NO push).
- `dispatch-check.mjs`: fast + `--live` **ALL GREEN** (live pins now #604 closed + #605 draft@0869a137 + zero reviewers).

## Pending
- Owner go on item 9 (the only mark-ready moment). Until then: nothing ready, nothing else opens, zero upstream writes. Installer README-fix stays a held-local draft file.
