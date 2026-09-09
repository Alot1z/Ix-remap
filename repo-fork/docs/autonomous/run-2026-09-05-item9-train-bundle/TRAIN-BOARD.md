# Campaign board — how many new PRs / issues are getting done (2026-09-05)

## Queue progress (dispatch §1): 7/10 done, 2 prepared, 1 executable-now
| # | Item | State |
|---|---|---|
| 2 | Installer audit + drafted fix | DONE (**OPENED live as draft PR #609** 2026-09-05, owner's go) |
| 3 | Logo PR CI hermeticity | DONE (`0869a137`, 29/30 CI) |
| 4 | toolscan hermetic + CI | DONE (`2f88671b`, CI all green) |
| 5 | Mention-sweep residuals | DONE (zero replies warranted) |
| 6 | C1/C3 proposals | DONE (plan-only, local) |
| 7 | Wave monitor | DONE — wave MOVED 2026-09-05: **#547 + #559 merged** onto main (head now `e8ab1926`) — the last "awaiting external" cleared; #605 needs a rebase onto the new head before mark-ready |
| 8 | KB close-out | DONE (rows #6638–#6650) |
| 1 | Session-start probe | per-session |
| 9 | Train release | PREPARED — NOT executed (mark-ready gated on owner's go; #609 draft open ahead of release; #610/#608 closed as superseded-by-process 2026-09-05) |
| 10 | Final report | DRAFTED |

## Live surface (2 draft PRs from us, zero review requests; #610/#608 closed same day)
| Artifact | Repo | State |
|---|---|---|
| #605 logo banner (draft-from-open) | ix-infrastructure/Ix | DRAFT @ `c05c3a77` (0869a137 + preview commit adding `output-samples/banner-48/80-truecolor.png`) · reviewers none · body includes a Rendered-preview picture · cross-linked to #609 |
| #609 installer README-fix (draft-from-open) | ix-infrastructure/Ix | DRAFT @ `b77c4f52` (branch `feat/installer-readme-fix`, base `e8ab1926`) · README.md only · reviewers none · cross-linked to #605 |
| #610 CONTRIBUTING draft-first note (opened then closed) | ix-infrastructure/Ix | **CLOSED 2026-09-05** (owner's call — superseded-by-process; the unremovable-request defect is platform #69208); branch `docs/contributing-draft-first` deleted |
| #604 (superseded original) | ix-infrastructure/Ix | closed 15:45Z → #605 |
| toolscan work | Alot1z/toolscan | 0 PRs — direct commits on main (repo convention); head `4c0b2d11b9` since 16:43Z (owner brand pass — radar mark + README/CONTRIBUTING; prior `a3e33771e3` was the 15:56Z NUL-hardening push) |
| Issue #608 code-owner auto-request (owned by the drafts episode) | ix-infrastructure/Ix | **CLOSED 2026-09-05** with its PR #610 (owner's call — superseded-by-process, KB #6653/#6658) |
| Issue #606 harness-detector proposal (from the concurrent dispatch session's §8) | ix-infrastructure/Ix | **closed-with-note 2026-09-05** (owner: no issues before PRs) — parked, not resolved; reopens with its implementation PR (comment 5553161411) |

## Prepared-as-drafts
| Kit | Location | State |
|---|---|---|
| Installer README-fix PR | item-2 run-dir (`installer-pr-title.txt`, `installer-pr-body.md`, `OPENING-KIT.md`) | **OPENED live as draft #609** (2026-09-05, owner's go) — verified draft, zero reviewers |
| CONTRIBUTING draft-first note (paired to #608) | issue-codeowners run-dir (`fix-pr-title.txt`, `fix-pr-body.md`) | **opened as #610 then CLOSED** (2026-09-05, owner's call — superseded-by-process); kit stays as the record |
| C1 manifest-registry / C3 lifecycle-verbs proposals | item-6 run-dir | plan-only, not promised — C3 stays held per its own "after the train releases" gate |

## Local deliverables (2026-09-05)
| Deliverable | Where | Notes |
|---|---|---|
| TUI logo banner pictures | `tui-banner-48/80-truecolor.png` + `tui-banner-picture.html` (item-9 run-dir); PNGs also on the #605 branch at `output-samples/banner-48/80-truecolor.png` | rendered from the real PR-head renderer |
| **Hermetic install demo** (tmp path, watchable) | `install-demo/run-install-demo.sh` → `install-demo/tmp-home/` + `transcript.txt` | runs the real `scripts/install-skill.sh` with `HOME` redirected; re-runnable; early non-hermetic run disclosed + rolled back (`rollback-realhome/`), homes verified clean |
| **Install GIF** | `install-demo/install-demo.gif` (75 frames, 872×550) | whole install process: dry-run JSON → host detection → copy → verify |
| Public-install answer | `install-demo/README.md` | clone bootstrap works today; curl standalone + Homebrew + `npx @ix/cli` are upstream publish paths |

## Proposed (need a decision — GitHub issues have no draft state)
| Proposal | Would reference | Blocked by |
|---|---|---|
| Repo: GitHub repo-template / settings blueprint (user-friendly + expert) | — | New repo creation is authorization-gated (Tier B) |
| `ix skill add`-style CLI install verb | C3 proposal, merged #591 seam | Install surface is upstream's (D8); wiring into the CLI is a new proposal |

## Counts
- Campaign queue: **7 executed + 2 prepared (9/10)** of items 2–10.
- Wave closed out (2026-09-05): **#547 + #559 merged upstream** (`df30296` → `e8ab1926`) after the three plugin gates — all maintainer-sequenced, zero involvement from us.
- New PRs opened by us this campaign: **3 drafts** — #605 (logo banner, live), #609 (installer README-fix, live), #610 (CONTRIBUTING draft-first note, **closed same day as superseded-by-process**) — all draft-from-open with zero requested reviewers; #605 body now includes a rendered banner picture. #604 closed (recreated as #605). Zero merged yet — the train (#605 + #609) releases together.
- New issues filed by us upstream: **2, both closed** — #608 (code-owner auto-request tracker, closed with its PR #610) + #606 (harness-detector proposal, parked-not-resolved; reopens with its PR).
- KB rows added from this session: **#6646, #6649, #6650, #6653, #6654** (all TRUSTED).
- Full historical sweep of the closed campaign PR/issue threads (agentception-extract over a 12-PR + issue digest, 2026-09-05): **zero new rows** — every candidate already owned by TRUSTED rows (dead-link CI #6333/#6454, four-surface parity #6316/#6499/#6647/#6578, command/flag doc gate #6500/#6501/#6503); nothing stacked (rule 8).
- Upstream main advanced to `e8ab1926` 2026-09-05 (wave #547/#559 merged) — the last "awaiting external"; every prepared kit was E1–E8 re-verified at the new head (`e1-e8-kit-compliance.md`).
- Live review requests outstanding: **0**.
- 2026-09-05 draft-opens round: #609 (+ #610 briefly) opened live as drafts (owner's go, Tier A.3); fork branch `feat/installer-readme-fix` (`b77c4f52`) off main `e8ab1926`; contents built from live `e8ab1926` text (byte-minimal diffs); C3 stays held.
- 2026-09-05 close-out round: **#610 + #608 closed** as superseded-by-process (notes posted, branch deleted — D16); **#605 gained the TUI logo picture** (PNGs at `output-samples/banner-48/80-truecolor.png`, head `c05c3a77`, Rendered-preview section in the body + `tui-banner-picture.html` in this run-dir); **KB #6658 implemented** (`gh-pr.mjs create --draft` + e2e pin + doctor 6f); **agent-principles source versioned** in agent-knowledge-base (commit `460a3dc`, deploy `scripts/sync-agent-principles.sh`, doctor 6c2 mirror check).
