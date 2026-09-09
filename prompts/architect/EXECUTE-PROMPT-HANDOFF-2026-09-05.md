# EXECUTE PROMPT — IX TRAIN · CONTINUATION HANDOFF (2026-09-05)

You are the Ix train builder, continuing from a previous agent session. This prompt hands you the state; the contract file tells you how to work. Do not re-derive policy from this prose — the contract wins.

## 0. CONTRACT — READ FIRST (in this order)
1. `prompts/architect/BUILDER-PROMPT-MASTER-2026-09-05.md` — **the binding contract**: authorization tiers, hard policy, self-executing queue (items 1–10, each = precondition probe → command → stop-point), staged mark-ready mechanics, KageBinary PLAYBOOK, session-open probes. Execute from it.
2. `prompts/architect/MASTER-SPEC-IX-TRAIN-2026-09-05.md` — **sole owner of the execution-round state record** (dated addenda) + decisions/scope. Never copy its values into your own notes as live truth.
3. Path root: `E:/E-github-repos/Ix-remap`. Live-state precedence: **fresh probe > master-spec addenda > canonical dispatch §0 (stale) > everything else.** Probes beat claims — including every claim in §1 below.
4. **Tooling:** the contract's **SKILLS — LOAD & ROUTE** block is probe-verified for this machine (section agents, 9 skills, principles tools, rg/es/sqlite3/uv paths, conduit, thinking servers) — use those exact paths; never rediscover tooling or trust path claims from any other source. One approval = the whole ticked roadmap; never stop when the objective is broader.

## 1. WHERE THE PREVIOUS AGENT LEFT OFF (handoff state, 2026-09-05)
Last completed action: a **fidelity check round with zero writes** —
- **ix-infrastructure/Ix#612**: remote body verified to contain all four option families the owner's go named (Ix banner opening; `[x] Ix skill` row; `[ ] MCP server` row; `[ ] Editor plugins` row) — no drift, no PATCH made.
- **Alot1z/toolscan#1** (draft): remote title + body diffed **byte-verbatim** against the local `.pr-title.txt` / `.pr-body-agent-skill-package.md` (both in the toolscan checkout `E:/E-github-repos/toolscan/repo-upstream`); remote footer scan `co-authored|generated with|codebuff|freebuff` → **0 hits**.
Expected state at handoff: **per the master spec's dated addenda — the sole state owner; this file carries no live-state values.** Re-probe anyway (session open does exactly this): the probes to run are named in the builder's SESSION OPEN; if anything disagrees with the addenda baseline, the probe wins — apply the drift re-anchor protocol and note the drift in the report. Non-value facts that remain true: issues #611/#612 and toolscan PR#1 were opened by earlier rounds; the three formal contract gaps were closed 2026-09-05 in the master spec — checklist in the VERIFIED tick-box below, nothing to redo. **`chore/installer-ux-polish` @ `44fbb54`: UNRECOVERABLE** — ground-truthed absent on both remotes and all local clones (builder item 6 = BLOCKED(b/recovery), owner-gated re-derivation path). Never reference that branch.

## 2. FIRST ACTION
Run the builder file's **SESSION OPEN** probes verbatim; compare against the master addenda's baseline (§1). Any disagreement → the probe wins — apply the **drift re-anchor protocol** and note the drift in your report.

## 3. THEN — THE QUEUE (builder items in order; Tier A executes, Tier B stops for the owner's ticked go)
The previous session's open offers were reconciled into the tick-boxes below (mark-ready → item 8; toolscan ready-state → item 3; TUI sketch → item 9; the formal contract gaps were already closed — do not redo). Two standing rules survive the compression: **review replies come only from the contract's PLAYBOOK** — never improvised, never re-litigating a closed finding, never a new watch plan — and **any TUI prototype must NOT use `chore/installer-ux-polish`** (that branch is unrecoverable, ground-truthed): sketch on a fresh local branch or stay plan-only, always a UI over the same engine (`--json`/`--dry-run` parity), never pushed, never opened as PR/issue. **Never re-push the #605 fix stack.**

## 4. NON-NEGOTIABLES (quick restatement; full list in the contract)
- Tier A executes; Tier B = one explicit go per item, named in the report; gate missing → BLOCKED(b/c), continue read-only/own-repo — never ungated.
- Gated surface only (`gh-commit.mjs` / `gh-pr.mjs` / gh-api path). No attribution footers, ever.
- **Draft-only PR surface:** create PRs as DRAFT, update DRAFT bodies — never ready-open; draft→ready only via the ticked GOs below (item 8 / item 3); merges never (owner's).
- Playbook drafts: **fill every placeholder with reproduced evidence before posting** — a draft still containing `<sha>`/`[...]` is never posted.
- #605 ships exactly as reviewed (no scope additions); #609 is merged and closed — zero README edits.
- Windows hazards: junctions (KB #6274), Git Bash `/tmp` ≠ `C:\tmp`.

## 5. REPORT
Final report ladder: **STATUS / READINESS / IMPLEMENTED / EVIDENCE / TESTS / RUNTIME / LIMITATIONS / NEXT** — every claim tagged VERIFIED/OBSERVED/DERIVED/INFERRED, every gate and stop-point named. Record convention: local record commit, no pushes. `dispatch-check.mjs --live` ALL GREEN at close-out.

---
**Owner tick-boxes — appended 2026-09-05 (a ticked line IS the explicit go in the receiving agent's session):**
- [X] GO: mark-ready on #605 — execute item 8 in full this session (Tier B): fresh precondition probes → `markPullRequestReadyForReview` → mandatory post-ready `requested_reviewers` probe (KB #6646: a code-owner request may fire at ready — report it, never attempt removal) → release-note refresh + post.
- [X] GO: toolscan PR#1 ready-state — body reviewed and approved (item 3). Ready only; merge is the owner's.
- [X] GO: interactive TUI prototype sketch (item 9) — **local only, never pushed, never opened as PR/issue**.
- [X] VERIFIED: the three formal contract gaps (§5 Class column / §6 evidence labels / §7 Scope+Status columns, item-3 line, CI dedup) were **closed 2026-09-05** — confirm they are present in the master spec during session open; **do not redo them**.
