# Campaign board — how many new PRs / issues are getting done (2026-09-05)

## Queue progress (dispatch §1): 7/10 done, 2 prepared, 1 executable-now
| # | Item | State |
|---|---|---|
| 2 | Installer audit + drafted fix | DONE (opening kit prepared, opens at item 9) |
| 3 | Logo PR CI hermeticity | DONE (`0869a137`, 29/30 CI) |
| 4 | toolscan hermetic + CI | DONE (`2f88671b`, CI all green) |
| 5 | Mention-sweep residuals | DONE (zero replies warranted) |
| 6 | C1/C3 proposals | DONE (plan-only, local) |
| 7 | Wave monitor | DONE — wave MOVED 2026-09-05: **#547 + #559 merged** onto main (head now `e8ab1926`) — the last "awaiting external" cleared; #605 needs a rebase onto the new head before mark-ready |
| 8 | KB close-out | DONE (rows #6638–#6650) |
| 1 | Session-start probe | per-session |
| 9 | Train release | PREPARED — NOT executed (owner's go only) |
| 10 | Final report | DRAFTED |

## Live surface (1 draft PR + 1 open issue, zero review requests)
| Artifact | Repo | State |
|---|---|---|
| #605 logo banner (draft-from-open) | ix-infrastructure/Ix | DRAFT @ `0869a137` · reviewers none · 29/30 CI |
| #604 (superseded original) | ix-infrastructure/Ix | closed 15:45Z → #605 |
| toolscan work | Alot1z/toolscan | 0 PRs — direct commits on main (repo convention); head `4c0b2d11b9` since 16:43Z (owner brand pass — radar mark + README/CONTRIBUTING; prior `a3e33771e3` was the 15:56Z NUL-hardening push) |
| Issue #608 code-owner auto-request (owned by the drafts episode) | ix-infrastructure/Ix | open 2026-09-05, verbatim-verified; paired fix held as a draft PR kit (Refs #608, opens at train release) — kept open because its PR is paired (KB #6653) |
| Issue #606 harness-detector proposal (from the concurrent dispatch session's §8) | ix-infrastructure/Ix | **closed-with-note 2026-09-05** (owner: no issues before PRs) — parked, not resolved; reopens with its implementation PR (comment 5553161411) |

## Prepared-as-drafts (local kits, open only at item 9 with the owner's go)
| Kit | Location | State |
|---|---|---|
| Installer README-fix PR | item-2 run-dir (`installer-pr-title.txt`, `installer-pr-body.md`, `OPENING-KIT.md`) | verbatim-ready, train-framed, README-only |
| C1 manifest-registry / C3 lifecycle-verbs proposals | item-6 run-dir | plan-only, not promised |

## Proposed (need a decision — GitHub issues have no draft state)
| Proposal | Would reference | Blocked by |
|---|---|---|
| Repo: GitHub repo-template / settings blueprint (user-friendly + expert) | — | New repo creation is authorization-gated (Tier B) |
| `ix skill add`-style CLI install verb | C3 proposal, merged #591 seam | Install surface is upstream's (D8); wiring into the CLI is a new proposal |

## Counts
- Campaign queue: **7 executed + 2 prepared (9/10)** of items 2–10.
- New PRs opened by us this campaign: **1** (#605 draft; #604 closed). Zero merged yet — train releases together.
- New issues filed by us upstream: **2** — #608 open (code-owner auto-request, paired with its held fix-PR kit, Refs #608) + #606 closed-with-note (harness-detector proposal parked per the no-orphan-issues rule; reopens with its PR).
- KB rows added from this session: **#6646, #6649, #6650, #6653, #6654** (all TRUSTED).
- Full historical sweep of the closed campaign PR/issue threads (agentception-extract over a 12-PR + issue digest, 2026-09-05): **zero new rows** — every candidate already owned by TRUSTED rows (dead-link CI #6333/#6454, four-surface parity #6316/#6499/#6647/#6578, command/flag doc gate #6500/#6501/#6503); nothing stacked (rule 8).
- Upstream main advanced to `e8ab1926` 2026-09-05 (wave #547/#559 merged) — the last "awaiting external"; every prepared kit was E1–E8 re-verified at the new head (`e1-e8-kit-compliance.md`).
- Live review requests outstanding: **0**.
