# Campaign board — how many new PRs / issues are getting done (2026-09-05)

## Queue progress (dispatch §1): 7/10 done, 2 prepared, 1 executable-now
| # | Item | State |
|---|---|---|
| 2 | Installer audit + drafted fix | DONE (opening kit prepared, opens at item 9) |
| 3 | Logo PR CI hermeticity | DONE (`0869a137`, 29/30 CI) |
| 4 | toolscan hermetic + CI | DONE (`2f88671b`, CI all green) |
| 5 | Mention-sweep residuals | DONE (zero replies warranted) |
| 6 | C1/C3 proposals | DONE (plan-only, local) |
| 7 | Wave monitor | DONE (no movement) |
| 8 | KB close-out | DONE (rows #6638–#6650) |
| 1 | Session-start probe | per-session |
| 9 | Train release | PREPARED — NOT executed (owner's go only) |
| 10 | Final report | DRAFTED |

## Live drafts (the whole live surface — 1 PR, zero issues, zero review requests)
| Artifact | Repo | State |
|---|---|---|
| #605 logo banner (draft-from-open) | ix-infrastructure/Ix | DRAFT @ `0869a137` · reviewers none · 29/30 CI |
| #604 (superseded original) | ix-infrastructure/Ix | closed 15:45Z → #605 |
| toolscan work | Alot1z/toolscan | 0 PRs — direct commits on main (repo convention); head `a3e33771e3` since 15:56Z (owner NUL-byte hardening push, superseding `2f88671b`) |
| New issues | — | **0 open** (issue drafts are impossible on GitHub — see below) |

## Prepared-as-drafts (local kits, open only at item 9 with the owner's go)
| Kit | Location | State |
|---|---|---|
| Installer README-fix PR | item-2 run-dir (`installer-pr-title.txt`, `installer-pr-body.md`, `OPENING-KIT.md`) | verbatim-ready, train-framed, README-only |
| C1 manifest-registry / C3 lifecycle-verbs proposals | item-6 run-dir | plan-only, not promised |

## Proposed (need a decision — GitHub issues have no draft state)
| Proposal | Would reference | Blocked by |
|---|---|---|
| Issue: code-owner auto-request on ready-opened PRs + GitHub bug #69208 (removal 422 on drafts) | #604/#605, KB #6646, community #69208 | Issues can't be draft ⇒ a live open; drafts-only rule + owner go needed |
| Repo: GitHub repo-template / settings blueprint (user-friendly + expert) | — | New repo creation is authorization-gated (Tier B) |
| `ix skill add`-style CLI install verb | C3 proposal, merged #591 seam | Install surface is upstream's (D8); wiring into the CLI is a new proposal |

## Counts
- Campaign queue: **7 executed + 2 prepared (9/10)** of items 2–10.
- New PRs opened by us this campaign: **1** (#605 draft; #604 closed). Zero merged yet — train releases together.
- New issues filed by us upstream: **0** (and none can be a draft).
- KB rows added from this session: **#6646, #6649, #6650** (all TRUSTED).
- Live review requests outstanding: **0**.
