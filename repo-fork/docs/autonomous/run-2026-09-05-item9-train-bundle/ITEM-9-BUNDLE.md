# ITEM 9 — TRAIN-RELEASE BUNDLE (prepared locally · execution awaits your go)

> **2026-09-05 supersede note (read first):** the logo draft is now **PR #605** — #604 was closed and recreated **draft-from-open** after GitHub's ready-open auto code-owner review request proved unremovable on a draft (community #69208; removal 422 ×3). #605: same branch/head (`0869a137`) and body, **requested reviewers: NONE**, CI 29/30 (sole red = the same CodeQL infra race). Drafts now open `draft: true` from the start and never carry review requests — **universal rule KB #6646**, dispatch RULE 0 §5.9 updated. Body reframed to welcome feedback. Current state: `state.md`; visual: `pr-605-illustrated-showcase.html`. The sequence below is unchanged except it targets **#605**, and mark-ready still waits on your go.

**Prepared 2026-09-05 · this bundle is a local draft. Executing it (mark-ready, opening PRs, posting notes) happens ONLY at item 9 with the owner's explicit go — nothing below has run.**

---

## 1 · Train pieces and their green state (re-verified this session, live probes)

| Piece | State | Evidence |
|---|---|---|
| **#605 logo banner (draft)** | DRAFT at `0869a137`, 29/30 CI green (sole red = CodeQL race), mergeable, welcome-feedback train-framed body, **zero requested reviewers** | live probe: 11 files, check-runs 29 success / 1 failure; `mergeable_state: blocked` (draft blocks — expected) |
| **toolscan hermetic + CI** | main `2f88671b`, CI run `33971010614` all 5 jobs green | ubuntu 56/56 ×2, windows 53+3 ×2, dist-sync gate |
| **Installer README-fix draft** | `installer-docs-fix.draft.md` (README-only: gemini example → `claude agents`, `~/.cursor/skills-cursor`, 4-id registry wording) | held local, nothing submitted |
| **C1/C3 proposals** | plan-only docs (manifest registry, lifecycle verbs) | held local, not promised |
| **KB close-out** | rows #6638–#6645 TRUSTED | agent-knowledge-base |
| **Wave #547/#559** | **MERGED 2026-09-05** onto main `e8ab1926` (maintainer's own sequencing — after the 14:21Z snapshot); was NOT a train dependency; consequence: #605's branch sits behind main → rebase before mark-ready | compare probe (2 commits) |
| **CodeQL residual on #605** | known infra race (ref-moved SARIF), byte-identical renderer already passed a genuine analysis | documented §0; clears maintainer-side |

**Release-blocking? None.** The only red check on the train (CodeQL race) is a documented infra artifact with a positive prior analysis on byte-identical content; it clears on a maintainer re-run or the next branch update.

## 2 · The exact mark-ready sequence (runs only on your go)

1. **Pre-flight (read-only):** re-probe §0 rows — #605 still draft at `0869a137` with zero requested reviewers, toolscan HEAD `a3e33771` (moved 15:56Z by the owner NUL-byte hardening push; pin refreshed 2026-09-05 per KB #6644), wave MERGED — main head `e8ab1926` (re-probe it), so #605's branch sits behind main; run `dispatch-check.mjs` fast + `--live` (must be ALL GREEN).
2. **Draft-body standard check (checklist added 2026-09-05):** every prepared train body (#605 live, the installer kit, any new kit) passes the four checks — `Status: DRAFT — part of a larger train` header naming the set · verbatim feedback line (“Feedback and suggestions are welcome at any stage. Each point is addressed on this branch — folded in or answered — and merged without conflict.”) · accuracy line scoped to the PR's own change · explicit scope section promising nothing beyond the PR. Grep the run-dirs for “please do not review” / “ignore this” framing — zero hits allowed; any hit is a defect fixed before anything opens (RULE 0 §5.9; KB #6646, #6653). Proof artifact: `draft-body-comparison.html`.
3. **Rebase, then mark #605 ready** — first rebase head `0869a137` onto current main (`e8ab1926`, post-wave) via the gated push path + range re-scan, re-verify CI (the CodeQL race clears on the branch update), then GraphQL `markPullRequestReadyForReview` on `ix-infrastructure/Ix#605` (REST `PATCH` silently ignores draft; verified §5.9 live). Note: marking ready WILL auto-request the code owner (GitHub behavior at mark-ready) — that is expected and correct at release time.
4. **Open the installer README-fix PR** (fork branch → `ix-infrastructure/Ix`, **as a DRAFT**, train-framed body, README-only content from `installer-docs-fix.draft.md`) — Tier A permits the draft open; your go decides whether it also marks ready here or waits.
5. **Coordinated note** on the released PR(s): names the train set (logo banner · installer docs fix · toolscan hardening), states what each ships.
6. **Re-verify** CI to completion on the released heads (probe check-runs, zero new failures), then **item 10** final report.
7. **Close-out:** dispatch-check fast + `--live` ALL GREEN, §0/§1 stamped with dates and URLs.

## 3 · Explicitly out of scope at item 9 (needs separate authorization, recorded as BLOCKED(b/c) until then)

- **4(c) validator tightening** (`..` segment rejection) — changes the `validateToolEntry` accepted-input contract; not folded into the train.
- **B4(a) Ix-consumer parity filing** (`discovery.ts:81` producer-contract enforcement) — waits for train release, separate filing.
- **#547 rebase** — ARMED only when all three plugin gates land **and** you authorize the push (the wave branch lives on Hiro's fork; identity routing: train runs as Alot1z).
- **Any gemini support / registry changes** — the audit's finding-e risk is assess-don't-fix; docs-only correction only.

## 4 · What the user asked to see (state of this bundle)

Everything in this run-dir is a **local draft in your Ix-remap fork checkout** — no upstream writes were made to produce it. The only live artifacts of the whole campaign remain: the #605 draft PR (zero requested reviewers) and the two toolscan commits on main.