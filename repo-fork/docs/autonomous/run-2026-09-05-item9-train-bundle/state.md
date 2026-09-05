# State — run-2026-09-05-item9-train-bundle

**Date:** 2026-09-05 (state written ~16:10Z; PR recreated 15:45Z)
**Scope:** train bundle + illustrated TUI-logo showcase + item 9 (prepared, awaiting owner go) + item 10 (drafted).
**Live state:** PR **#605** — DRAFT (opened draft-from-open), head `0869a137`, **requested reviewers: NONE**, CI 29/30 (sole red = the documented CodeQL infra-race run `101317167251`). PR **#604** — **CLOSED** 15:45Z with a verbatim note linking #605. Toolscan main `4c0b2d11` (owner brand pass 16:43Z — radar mark + README/CONTRIBUTING; pin refreshed; prior `a3e33771` was the 15:56Z NUL-hardening push). Issues: **#608 open** (code-owner tracker, paired), **#606 closed-with-note**. The repo's only other open PR is #607 (josephismikhail's own, not ours). Nothing else opened or marked ready.

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

## Session update (2026-09-05, drafts-only round — zero live changes)
- **`draft-body-comparison.html`** — installer kit body vs the **live** #605 body, side by side as reviewers see them; verdict: one voice (identical status header + verbatim feedback line; one intentional per-PR accuracy-line variance).
- **`live-drafts-snapshot.md`** — one-screen live probe: #605 draft @ `0869a13` · 0 reviewers · CI 29/1 (CodeQL race) · fork `Alot1z/Ix-remap` 0 PRs · toolscan 0 PRs (direct-commit convention) · issues #608 open / #606 closed. The only other open PR anywhere: #607 (owner's own, not ours).
- **Draft-body standard checklist** added to dispatch §1 item 9 + the installer `OPENING-KIT.md` + ITEM-9-BUNDLE §2 (header · verbatim feedback line · accuracy line · scope · no do-not-review framing · post-open reviewer verify) — dated 2026-09-05.
- **#608 fix kit grounded:** CONTRIBUTING.md Development Workflow step 4 is the single honest home (one added line, docs-only; PR template has no review-flow section → no change there). Kit title/body updated to the concrete change, Refs #608, held for train release.
- KB **#6653** (no orphan issues — issues open only alongside their PR; close-with-note is the hold) added, gate PASS, promoted TRUSTED. Full historical thread sweep: zero new rows (campaign fully mined).
- Workspace renamed `ix-workspace` → `github-workspace` (plain descriptive name; commits `b22f7c9`+`82b2bdf`, no remote).
- **E1–E8 compliance pass (2026-09-05, `e1-e8-kit-compliance.md`):** upstream main advanced to `e8ab1926` — the #547/#559 exit-code wave merged (awaiting-external NONE). All four upstream-facing bodies re-grounded at the new head: installer + C3 kits PASS unchanged; #608 fix kit re-grounded (`39d0734`→`e8ab1926`, CONTRIBUTING step 4 verified unchanged); **#605 live body fixed for genuine E1 violations** — stale CI count and the now-false "current main (`39d0734`)" claim — via the gated verbatim edit (draft kept, reviewers zero, live-verified). #605 now carries a rebase-onto-`e8ab1926` before mark-ready (recorded in ITEM-9-BUNDLE §2 step 3).
- **Wave closed out + rebase preflighted (2026-09-05):** all three plugin gates merged (15:35–15:44Z), then #547 → `df30296` (15:47Z) and #559 → `e8ab1926` (15:57Z, main head); ARMED #547 rebase resolved as MOOT — no record reads "no movement" (item-7 run-dir `state.md`/`wave-state.md` updated). #605 rebase dry-run in the scratch verify tree: **clean, zero conflicts, byte-identical tree, zero file overlap** — exact release-time steps at `item9-rebase-runbook.md` (referenced from ITEM-9-BUNDLE §2 step 3).

## Pending
- Owner go on item 9 (the only mark-ready moment). Until then: nothing ready, nothing else opens, zero upstream writes. Installer README-fix + the #608 fix kit stay held-local draft files.
