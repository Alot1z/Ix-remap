# ITEM 9 — TRAIN-RELEASE BUNDLE (prepared locally · execution awaits your go)

**Prepared 2026-09-05 · this bundle is a local draft. Executing it (mark-ready, opening PRs, posting notes) happens ONLY at item 9 with the owner's explicit go — nothing below has run.**

---

## 1 · Train pieces and their green state (re-verified this session, live probes)

| Piece | State | Evidence |
|---|---|---|
| **#604 logo banner (draft)** | DRAFT at `0869a137`, 23/24 CI green, mergeable, train-framed body | live probe: 3 commits, 11 files, 24 checks; `mergeable_state: blocked` (draft blocks — expected) |
| **toolscan hermetic + CI** | main `2f88671b`, CI run `33971010614` all 5 jobs green | ubuntu 56/56 ×2, windows 53+3 ×2, dist-sync gate |
| **Installer README-fix draft** | `installer-docs-fix.draft.md` (README-only: gemini example → `claude agents`, `~/.cursor/skills-cursor`, 4-id registry wording) | held local, nothing submitted |
| **C1/C3 proposals** | plan-only docs (manifest registry, lifecycle verbs) | held local, not promised |
| **KB close-out** | rows #6638–#6645 TRUSTED | agent-knowledge-base |
| **Wave gates (#547, #33/#37/#38)** | no movement; maintainer's own sequencing; NOT a train dependency | wave snapshot 14:21Z |
| **CodeQL residual on #604** | known infra race (ref-moved SARIF), byte-identical renderer already passed a genuine analysis | documented §0; clears maintainer-side |

**Release-blocking? None.** The only red check on the train (CodeQL race) is a documented infra artifact with a positive prior analysis on byte-identical content; it clears on a maintainer re-run or the next branch update.

## 2 · The exact mark-ready sequence (runs only on your go)

1. **Pre-flight (read-only):** re-probe §0 rows — #604 still draft at `0869a137`, toolscan HEAD `2f88671b`, wave gates unchanged; run `dispatch-check.mjs` fast + `--live` (must be ALL GREEN).
2. **Mark #604 ready** — GraphQL `markPullRequestReadyForReview` on `ix-infrastructure/Ix#604` (REST `PATCH` silently ignores draft; verified §5.9 live).
3. **Open the installer README-fix PR** (fork branch → `ix-infrastructure/Ix`, **as a DRAFT**, train-framed body, README-only content from `installer-docs-fix.draft.md`) — Tier A permits the draft open; your go decides whether it also marks ready here or waits.
4. **Coordinated note** on the released PR(s): names the train set (logo banner · installer docs fix · toolscan hardening), states what each ships.
5. **Re-verify** CI to completion on the released heads (probe check-runs, zero new failures), then **item 10** final report.
6. **Close-out:** dispatch-check fast + `--live` ALL GREEN, §0/§1 stamped with dates and URLs.

## 3 · Explicitly out of scope at item 9 (needs separate authorization, recorded as BLOCKED(b/c) until then)

- **4(c) validator tightening** (`..` segment rejection) — changes the `validateToolEntry` accepted-input contract; not folded into the train.
- **B4(a) Ix-consumer parity filing** (`discovery.ts:81` producer-contract enforcement) — waits for train release, separate filing.
- **#547 rebase** — ARMED only when all three plugin gates land **and** you authorize the push (the wave branch lives on Hiro's fork; identity routing: train runs as Alot1z).
- **Any gemini support / registry changes** — the audit's finding-e risk is assess-don't-fix; docs-only correction only.

## 4 · What the user asked to see (state of this bundle)

Everything in this run-dir is a **local draft in your Ix-remap fork checkout** — no upstream writes were made to produce it. The only live artifacts of the whole campaign remain: the #604 draft PR and the two toolscan commits on main.