# TRAIN REPORT — the open PR, everything about it, and what lives where

> **2026-09-05 supersede note (read first):** the draft is now **PR #605** — #604 was closed and recreated **draft-from-open** (same branch/head `0869a137`, same body) because GitHub's ready-open auto code-owner review request cannot be removed once a PR is a draft (community #69208, 422 ×3) while a draft-from-open gets **no review request at all**. #605: requested reviewers NONE, CI 29/30 (sole red = the CodeQL infra race), body reframed to welcome feedback. Universal rule: KB #6646; dispatch §0/RULE 0 updated. Current state + the full 15-variant TUI-logo showcase: `state.md` + `pr-605-illustrated-showcase.html`. The numbered facts below about the branch/head/files/tests remain accurate; where they say #604, read #605.

**Generated 2026-09-05 · run-dir `repo-fork/docs/autonomous/run-2026-09-05-item9-train-bundle/` · local-only (zero upstream writes this session)**

Companion visual: `pr-605-illustrated-showcase.html` (self-contained — every banner rendered live from the PR-head renderer; open in any browser or the Preview tab).

---

## 1 · The open PR: #604 (the TUI logo banner)

| Field | Value |
|---|---|
| PR | [ix-infrastructure/Ix#604](https://github.com/ix-infrastructure/Ix/pull/604) |
| Title | `feat(cli): render the repo logo as the setup-notice banner` |
| Status | **DRAFT** · open · not merged · mergeable (`mergeable_state: blocked` = draft blocks merge) |
| Head | `Alot1z:feat/tui-logo-banner` @ **`0869a137`** |
| Base | `main` @ `39d0734` (current merged main) |
| Size | **+702 / −5 · 11 files · 3 commits · zero new assets** |
| Opened / updated | 2026-09-05 13:21Z / 13:57Z (live probe 15:15Z) |
| Body | Train-framed welcome-feedback standard: "DRAFT — part of a larger train", feedback welcomed at any stage, issues addressed on-branch and merged without conflict, nothing promised beyond the PR — verbatim-verified |

### The 3 commits on the branch

| SHA | Message | Note |
|---|---|---|
| `204028f6` | feat(cli): render the repo logo as the setup-notice banner | the renderer + wiring + pins (rebased onto merged main) |
| `ae4b9876` | feat(cli): add `--bg none` transparent mode and golden output fixtures | +6 goldens in `output-samples/` |
| `0869a137` | test(cli): make banner pins hermetic across CI runners | the fix that turned the 6 Linux/macOS failures green |

All three carry **zero attribution in committed files** (§13) — the only credit is the one aesthetic line in the PR body (skills.sh inspiration, implementation original).

### Files the PR changes

- `scripts/render-logo.mjs` (+259) — the zero-dep renderer: PNG chunk decode → inflate → unfilter → coverage-thresholded supersampling → flat 5-tone snap → half-block RLE
- `scripts/render-logo.d.mts` (+27) — CLI/module types
- `ix-cli/src/cli/banner.ts` (+60) — spawns the renderer (`--width 48`), stderr-only via `emitSetupNotice`, absent-safe
- `ix-cli/src/cli/bootstrap.ts` (+7/−1) — first-run wiring (preserves main's workspace-canonicalization change)
- `ix-cli/src/cli/__tests__/bootstrap-notice.test.ts` (+195/−4) — **21 pins** (stderr-not-stdout, absent-safe, NO_COLOR zero-escapes, exit codes, `--bg none` invariants, lib≡CLI byte-identity, JSON honesty, golden byte-identity)
- `output-samples/` ×6 (+154) — truecolor/256/ascii × brand/none goldens (byte-identity pinned)

**The art:** `assets/logo.png` (531,550 bytes, full HD) — **already on upstream main**, so the PR adds no binary; the PNG is the only maintained source, the terminal render is derived at print time.

### CI on the head

**23/24 checks green.** All six originally-failing jobs (Test × ubuntu/macos × node 22/24, CI Passed) are fixed by `0869a137`. The single red check is **CodeQL**, red ×3 via the documented ref-moved SARIF race — every run ~2s, identical "The file may have changed" annotation at `scripts/render-logo.mjs:45`; the renderer blob is byte-identical (`20694454b`) across both heads and a genuine full analysis already **passed** on that exact content. Not a finding; clears maintainer-side (rerun = admin rights, token is contributor-only) or on the next branch update.

### How to see the banner

- **In this run-dir:** `preview-ascii-48.txt`, `preview-ascii-80.txt`, `preview-256-48.ansi`, and `logo.png` (copied for your local viewing).
- **Live, from the PR head:** `node scripts/render-logo.mjs --width 48 --color truecolor --bg none` in a checkout of `feat/tui-logo-banner`.
- **In the Preview tab:** open `pr-604-illustrated-report.html`.

---

## 2 · How many PRs are open? Exactly one — and it's a draft

| Repo | What exists | Live/open? |
|---|---|---|
| ix-infrastructure/Ix | **#604** (logo banner) | **1 open PR — DRAFT** (yours) |
| ix-infrastructure/Ix | #591 (toolscan seam), #602 | **merged** by KageBinary — closed |
| Alot1z/toolscan | hermeticity + CI on main (`e47f42b`, `2f88671b`) | **0 PRs** — direct commits, repo convention |
| anything else | — | **nothing opens until item 9 with your go** |

That's the whole answer: **one open PR, a draft, train-framed, awaiting the item-9 release moment.**

---

## 3 · Live vs. local — what actually exists where (as of this report)

| Artifact | State | Where it lives |
|---|---|---|
| PR #604 (logo) | DRAFT, 23/24 CI green | **LIVE** — ix-infrastructure/Ix |
| toolscan hermetic + CI | 2 commits on main, CI all green (ubuntu 56/56, windows 53+3) | **LIVE** — Alot1z/toolscan |
| Installer audit (findings a–e) + README-fix draft | drafted, held local, **nothing submitted** | LOCAL — `run-2026-09-05-item2-installer-audit/` |
| C1 manifest-registry proposal | plan-only, not promised, not scheduled | LOCAL — `run-2026-09-05-item6-c1c3-proposals/` |
| C3 lifecycle-verbs proposal | plan-only, same framing | LOCAL — same run-dir |
| Mention-sweep residual report | zero replies warranted (maintainer's last word) | LOCAL — `run-2026-09-05-item5-sweep-residual/` |
| Wave-monitor snapshot | no movement; #37 UNKNOWN → verified real PR | LOCAL — `run-2026-09-05-item7-wave-monitor/` |
| KB close-out rows #6638–#6645 | TRUSTED, with provenance | LOCAL — agent-knowledge-base |
| This report + item 9 bundle + item 10 draft | local draft | LOCAL — this run-dir |

**Nothing else will go live without an explicit go from you.** The drafted installer fix, the C1/C3 proposals, and this bundle are all local files in your Ix-remap checkout — visible now, submit-ready never-by-default.

---

## 4 · Items 9 and 10 — local things?

- **Item 9 (train release)** — the *preparation* is a local thing (this bundle: the exact mark-ready sequence below). The *execution* (marking #604 ready, opening the installer README-fix PR, posting the coordinated note) is **live and only happens with your go**. Nothing is marked ready before then, ever (RULE 0).
- **Item 10 (final report)** — a local document (drafted now in `ITEM-10-FINAL-REPORT.md`; its final issue lands after item 9 executes).

### The item-9 mark-ready sequence (the bundle, awaiting your go)

1. Re-verify every train piece green via dispatch §0 probes (#604 draft at `0869a137` with 23/24 CI; toolscan HEAD `2f88671b` + CI; installer draft present on disk; wave gates unchanged).
2. Mark #604 ready — GraphQL `markPullRequestReadyForReview` (REST `PATCH` cannot change draft state; verified §5.9).
3. With your authorization, open the installer README-fix PR (drafted locally, README-only, zero registry changes) — Tier A allows the *draft open*, your go decides *ready*.
4. Post the coordinated train note on the released PRs.
5. Run item 10: final report, then close-out (dispatch-check fast + `--live` ALL GREEN).

Blockers if you say go today: none known — the only external open surface is the #547 wave (maintainer's own sequencing, not ours to move; the train doesn't depend on it).

---

## 5 · Answers to your questions, plainly

1. **"A complete report file that illustrates what actually happens for the open PR"** → this file + the HTML visual; everything is live-probed, nothing guessed.
2. **"How many PRs will be open / only report-plan-design drafts, nothing to the live right?"** → exactly **one** open PR (#604, draft). All report/plan/design material is **local-only**; the only live things are that draft and the two toolscan commits (pre-authorized item 4).
3. **"Builder-prompt-complete is done, everything as draft only to my local fork Ix-remap so I can see all changes and commits?"** → items 2–8 are done; item 9 is deliberately awaiting your go (the only mark-ready moment); item 10 is drafted here. Everything lands in your Ix-remap checkout as local files. **Commits:** nothing is committed locally yet — everything is in your working tree; ask and I'll make a local commit (no push) so you can see it all in `git log`.
4. **"Apply feedback from the merged PRs to the logo?"** → already applied where real: the rebase onto merged main (preserving main's `bootstrap.ts` change, verified on a fresh clone) and the hermeticity fix driven by the real CI failures. The installer-side feedback is captured as the drafted README-fix (held local) — the registry code is correct, the drift is docs.
5. **"The full HD sharp logo in the preview and the PRs?"** → yes: `logo.png` is on main, renders at print time via the PR's renderer; previews and the embedded logo are in this run-dir and the HTML report.
6. **"Installer thing planned, created as full drafts local in my Ix-remap fork?"** → yes — audit + drafted fix (item 2) and the C1/C3 evolution proposals (item 6), all local, all marked as drafts/proposals.