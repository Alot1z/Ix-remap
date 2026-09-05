# ITEM 10 — FINAL REPORT (drafted 2026-09-05 · per §9 contract)

**STATUS · READINESS · IMPLEMENTED · EVIDENCE · TESTS · RUNTIME · LIMITATIONS · NEXT**

> **2026-09-05 supersede note (read first):** the live draft is now **#605** (draft-from-open, zero requested reviewers — #604 closed after its ready-open auto code-owner request proved unremovable on a draft, KB #6646). All #604 references below read #605; head/body/CI state unchanged except the reviewer count (none) and CI 29/30 on the re-run suite. Final issue lands after item 9 executes. Until then: `#605` stays a draft, zero upstream writes beyond the already-live draft + toolscan main.

## STATUS
The campaign's external dependency closed (KageBinary merged the whole open PR train including #591, KEEP-by-merge). The v7 queue is **items 2–8 DONE**; **item 9 (train release) PREPARED and awaiting owner go**; **item 10 is this report**. The train is one draft PR (#604) plus two toolscan main commits live; everything else is held local.

## READINESS
- **#605 (logo banner):** DRAFT (draft-from-open, zero requested reviewers), mergeable, head `0869a137`, **29/30 CI green** (all six originally-failing jobs fixed); one documented CodeQL infra-race residual, not a finding. **Ready to release on your go.**
- **toolscan:** hermetic suite + first CI live on main (`2f88671b`), CI run `33971010614` all green on both platforms.
- **Installer fix / C1/C3 / sweep / wave / KB:** drafted or closed locally; nothing submitted; nothing opens until item 9.
- **Release-blockers: none.** (The #547 wave is the maintainer's sequencing, not ours, and not a train dependency.)

## IMPLEMENTED
- **Merge train (external):** #591 (toolscan seam) + the rest merged by KageBinary; main `39d0734`.
- **v5→v7 items:** logo PR rebased (`204028f6`) → `--bg none` + goldens (`ae4b987`) → opened, draft-flipped by owner directive (RULE 0) → hermeticity fix (`0869a137`).
- **toolscan item 4:** `e47f42b` (declared-platform path.win32/posix + native fixtures + POSIX X_OK pins, dist rebuilt) + `2f88671b` (ubuntu+windows matrix × node 20/22 + dist-sync content-compare gate).
- **Installer audit (item 2):** findings a–e re-derived at line level from live main; README-only drafted fix held local.
- **Sweep residuals (item 5):** 45-thread union probed; #547 page-2 closed (12 comments verbatim); discussions probed (zero mentions); zero replies warranted; zero writes.
- **C1/C3 (item 6):** plan-only proposals (manifest harness registry; list/update/remove lifecycle verbs), CI costs stated.
- **Wave monitor (item 7):** no movement; #37 UNKNOWN → verified real PR (probe-artifact 404).
- **KB close-out (item 8):** rows #6638–#6645 added, verify-gate PASS, promoted TRUSTED.
- **This bundle (item 9 prep):** `TRAIN-REPORT.md`, `pr-604-illustrated-report.html` (logo embedded), `ITEM-9-BUNDLE.md`.

## EVIDENCE
- Live probes this session: PR #604 (commits/files/checks/body), toolscan refs, wave surfaces. `pr-data.json` in this run-dir.
- CI runs: `33971010614` (toolscan, all green), #604 checks 23/24 green (check-run list captured).
- Prior sessions: gated pushes byte-verified + post-push re-scans footer-free; KB rows with provenance (source-repository/source-pr/session).

## TESTS
- **#604:** 21 pins + 6 goldens — 21/21 under coverage; full ix-cli suite 1704 passed / 21 skipped (Windows); `tsc --noEmit` clean; mutation-checked NO_COLOR and `--bg none` pins.
- **toolscan:** 53 pass + 3 posix-skip (win32 local), **ubuntu 56/56** in CI (the authoritative Linux proof), dist-sync gate green; `tsc` clean.
- **Checker:** `dispatch-check.mjs` fast + `--live` ALL GREEN at each close-out.

## RUNTIME (what was actually exercised)
- Renderer: real PNG decode of `assets/logo.png` (531,550 bytes) → banners at widths 48/56/80, brand/none, ascii/256/truecolor; previews in this run-dir.
- CI: ubuntu/macos/windows × node 22/24 on #604; ubuntu+windows × node 20/22 + dist-sync on toolscan.
- Coverage pathology measured: v8 ~10× hot-loop slowdown (0.7s → 6.8s) reproduced on Windows with `--coverage`.
- CodeQL race reproduced ×3 (~2s runs, identical annotation); renderer blob byte-identical (`20694454b`) across heads.

## LIMITATIONS
- **CodeQL red on #604** — infra race, documented with the byte-identity disproof; clears maintainer-side (rerun needs admin rights; contributor token can't).
- **No Linux runner on this host** — toolscan's Linux proof is the CI ubuntu leg (green), not local.
- **4(c) validator tightening and B4(a) consumer-parity filing deferred** (contract/authorization-gated) — recorded, never dropped.
- **Wave gates (#33/#37/#38) still open** — maintainer's sequencing; ARMED #547 rebase BLOCKED until all land + owner go.
- Nothing speculative promoted in KB: 3 VERIFIED + 5 OBSERVED rows, all TRUSTED with provenance.

## NEXT (each with its authorization)
1. **Train release (item 9)** — *your explicit go*: mark #605 ready (GraphQL — note this auto-requests the code owner, expected at release), optionally open the installer README-fix draft, post the coordinated note, re-verify CI. Tier A covers the mechanics; the go is yours.
2. **4(c) proposal** — *your authorization* (changes the validator's accepted-input contract): open as its own proposal, not folded into the train.
3. **B4(a) Ix-consumer parity filing** — *train release first, then your go*: separate consumer-parity filing.
4. **#547 rebase (ARMED)** — *all three plugin gates land + your go*; identity routing answered first (train = Alot1z, wave branch = Hiro's fork).
5. **Close-out** — after 1: final §0/§1 stamps, dispatch-check fast + `--live` ALL GREEN, this report finalized.