# ⚰️ TOMBSTONED — SUPERSEDED 2026-09-05

> **This file is SUPERSEDED by `prompts/architect/BUILDER-PROMPT-COMPLETE.md`** (the sole canonical dispatch, v2, compiled 2026-09-05; its §0 DISPATCH-STATUS + §0.5 reconciliation ledger replace this file's execution state and §1 execution order).
> The body below is retained **as historical record only — DO NOT EXECUTE from this file.**

---

# BUILDER-PROTOCOL — how to execute the mission pair

Read `MISSION-UNIVERSAL-HOW-CONTRACT.md` (stable HOW) and `MISSION-2026-09-IX-PR-CAMPAIGN.md` (mutable WHAT) first; this file is the execution protocol that binds them: how you work, report, and stop. All three files together are the complete dispatch — no chat context is assumed or needed.

## DISPATCH-STATUS — executed 2026-09-05 before this dispatch (DO NOT REDO; verify, then continue)

- **Q1 COMPLETE:** governance comment live on PR #591 — https://github.com/ix-infrastructure/Ix/pull/591#issuecomment-5547541291 (verbatim EXACT MATCH, watermark-free, head `608c986` untouched) · parity trio scope-checked **LOAD-BEARING, kept** (ci.yml adds the `api-parity` job; summary gates on it) · KB rows **#6634 + #6635** promoted TRUSTED. Details + evidence: campaign D1 actions 2–4.
- **e2e-scratch: ALL PASS 25/25** (surface proven). Residual: scratch repo `Alot1z/scratch-e2e-2026-09-04T23-15-36-168Z` ARCHIVED not deleted (token lacks `delete_repo`).
- **Logo work committed:** fork branch `feat/tui-logo-banner` @ `d2876f5` (gated surface; 5 files: renderer + .d.mts + banner.ts + bootstrap wiring + 10-test battery incl. lib≡CLI byte-identity and a mutation-checked NO_COLOR pin; full ix-cli suite 74 files / 1285 green). **Fork PR not opened** — that is a publish, needs authorization. Canonical renderer = the committed `repo-fork/scripts/render-logo.mjs`; the parallel `ix-tui-logo-sharp.zip` packaging is SUPERSEDED (salvage list in campaign BACKLOG).
- **Awaiting maintainer:** the #591 response playbook (port/keep/split) is armed in the campaign. Poll before executing anything that depends on the choice.

## SKILLS TO APPLY DURING EXECUTION (not decoration — enforce)

- **/agent-principles — the hard gate.** EVERY upstream-facing artifact (commit, push, PR, comment, review reply) goes through the gated surface: `gh-commit.mjs` / `gh-pr.mjs` with verbatim file text, `gh-token.mjs` as the single token owner, `scan-stdin.mjs` on any rewritten range, `gh-commit.mjs verify` + `gh-pr.mjs get` before claiming done. The harness's built-in commit/PR path is NEVER used (KB #6590). Run `doctor.mjs` once at session start; ALL GREEN = surface holds. Run `agent-principles-digest.mjs --task "<task>"` to load the policy pack.
- **/agent-knowledge — context before work, evidence after.** Before each queue item: `l4 auto --task "<item>"` for the context pack; search the KB before creating any row; every claim in your report cites [KB #NNNN — class] or carries its own evidence. After each item: capture what was OBSERVED (via /agentception discipline) — supersede near-duplicates, never stack.
- **/agent-yoke + conduit — routing.** Multi-surface items route through `node E:/E-github-repos/conduit/cli/conduit.mjs route "<task>" --adapter kb,yoke` FIRST and carry the cited trace; single-surface items route directly. Every routed surface is verified live before reliance (exists · answers · matches description).
- **Ix section agents — the domain gates.** Dispatch via `node E:/E-github-repos/agent-knowledge-base/tools/ix-agent-triage.mjs "<task>"` and load the matched SKILL.md. The stances decide pass/fail: ix-contribution + ix-contribution-lifecycle own PR mechanics and the 16-step gate; ix-review-upstream owns what passes review; ix-mcp-harness owns the installer/MCP surface rules; ix-reference-parity owns doc parity; ix-cli-contract owns the render-logo/--json surface (parseable output, truthful exit codes, truncation visible); ix-ci-release owns anything that ships; ix-platform-paths owns Windows/platform claims; ix-ingest-graph and ix-context-query apply when those domains appear.
- **/autonomous-implementation-pattern — state on disk.** For the multi-phase campaign: context.md + plan + storyboard under `docs/autonomous/<run-id>/` in the repo being worked; state.json is the single source of truth; continue past blockers (record them, move to reachable work); the run dir is the handoff.
- **/thinking-review-expert — the ship gate.** Before anything durable (KB row, upstream comment, PR): score the reasoning; < 50 extract nothing; carry the provenance map.
- **/ix — ground truth.** Structural questions about the codebase are answered by `ix map`/`ix search`, never from memory. After code changes: `ix map --silent`.
- **/architect — before multi-module changes.** Boundaries and state ownership pass first; record the resulting structure.
- Caveman family: chat output may compress; every persisted artifact (commits, PR bodies, KB rows, reports) stays normal prose.

## REPORTING CONTRACT (the builder reports — continuously, not at the end)

1. **Session-start report (before phase 1):** tooling probe results (gated tools live, conduit live, four skill roots present, `doctor.mjs` verdict), the routing decision for Q1, and the plan for Q1 with its oracle. Post this, then proceed — Q1's upstream write already carries explicit user authorization; everything else read-only.
2. **Phase reports (after EVERY queue item):** `ITEM <Qn> — <status DONE|PARTIAL|BLOCKED> · oracle: <the acceptance oracle from the campaign, quoted, with its result> · evidence: <commands run + outputs that matter, KB ids cited> · deviations: <ASSUMPTION→EVIDENCE→PROBLEM→NEW DESIGN→REASON→CONSEQUENCE for anything that differed from the plan> · next: <next item>`. No phase transitions without this line set.
3. **Decision journal:** every choice the plan did not already make gets a row — context, options, decision, reason. Appended to the campaign file's D-LOG (rev-tracked, supersede-never-delete). A decision that lives only in chat is a lost decision.
4. **Final report (end of run):** STATUS · READINESS · IMPLEMENTED (per item) · EVIDENCE (oracles + outputs + KB ids) · TESTS (what was run, red/green where applicable) · RUNTIME (what was actually exercised) · LIMITATIONS (what remains open, incl. maintainer-response branches) · NEXT (the exact next actions and what authorization each needs). Then the learning loop: /agentception review → thinking gate → KB insert with provenance.
5. **Honesty bar:** BUILD ≠ RUNTIME SUCCESS; a claim without exercised evidence is labeled INFERRED; blocked work reports blocked — never fabricated done.

## STOP CONDITIONS (verified stops only)

(a) all queue items done + oracles green · (b) blocked — capability missing (say which) · (c) **auth boundary** — the ONLY pre-authorized upstream write is the Q1 governance comment; ANY other write (PR bodies, comments, pushes, the split rework, force-pushes, publishing) requires the explicit user authorization stated in your report — say exactly what to authorize and stop that thread · (d) safety · (e) uncertainty — ask once in the report, continue with reachable work.

## EXECUTION ORDER

1. ~~**Q1**~~ — **DONE** (see DISPATCH-STATUS). Remaining Q1 follow-through: poll #591 for the maintainer's choice, then execute the matching playbook branch (port / keep / split) — that response write needs authorization unless it is a read-only poll report.
2. **Q3** (read-only, can interleave while awaiting maintainer): five-PR audit → per-PR table into the campaign.
3. **Q2** (plan-only): detector/port design doc — seven sections, citations, credit line per D2; no code merged. If the maintainer picks PORT, this doc becomes the implementation plan.
4. **On maintainer response:** execute the matching playbook branch from the campaign (port / keep / split); re-comment or rework only through the gated surface.
5. **Own-repo work** (no upstream dependency): toolscan hardening **B2→B5** — note B1 (LICENSE/description/README) is ALREADY DONE on Alot1z/toolscan (MIT, verified; superseded — do not redo) · **logo follow-ups**: open fork PR for `feat/tui-logo-banner` (needs authorization), salvage `--bg none` from the superseded zip per BACKLOG · C1/C3 prep.
6. Close-out: final report → triggers (audit/knowledge/handoff) → handoff fileset.

Never silently stop, weaken requirements, hide failures, or treat unknowns as facts.
