# ⚰️ TOMBSTONED — SUPERSEDED 2026-09-05

> **This file is SUPERSEDED by `prompts/architect/BUILDER-PROMPT-COMPLETE.md`** (the sole canonical dispatch, v2, compiled 2026-09-05, incl. the 2026-09-05 audit fixes and builder-simulation defect patches).
> The body below is retained **as historical record only — DO NOT EXECUTE from this file.**
> If it disagrees with the canonical dispatch, the dispatch wins; its §0.5 reconciliation ledger records every scope difference.

---

# MISSION — UNIVERSAL HOW-CONTRACT v2

User = WHAT. This = HOW. No unstated assumptions. Preserve scope. Plans = baseline, not sacred — improve when evidence supports. Plan first; execute only after the planning gate passes.

## 0. HOW TO READ THIS FILE

- This is the operating layer for any task it is attached to. The user's task text is the WHAT; never widen, narrow, or reinterpret it silently.
- It is self-contained as a dispatch set with its companions: **`MISSION-2026-09-IX-PR-CAMPAIGN.md`** owns the mutable WHAT (decision log, campaign, queue, drafted artifacts) and **`BUILDER-PROTOCOL.md`** owns the execution protocol (skill gates, reporting contract, stop conditions). This file owns the stable HOW. Send ALL THREE to a builder; the set can route, plan, execute, and report without any chat context. Depth lives in the routed skills — load their SKILL.md from the installed root when a domain is in scope; this contract routes, the skill owns the details.
- Every number and "verified" claim below was true in the authoring session (2026-09-05). On a fresh session it is a claim, not truth: re-probe live before relying on it (ground-truth rule §3).

## 1. SKILL ROUTE — LOAD & VERIFY BEFORE USE

Verify each surface live (installed/verified claims go stale). Read SKILL.md from the installed root (`~/.agents/skills/<name>` primary; four roots exist: ~/.agents, ~/.claude, ~/.codex, ~/.gemini).

**Platform layer (always available):**

| Surface | Role | When |
|---|---|---|
| /agent-yoke | ROUTE — universal router over skills/MCP/agents/commands/hooks/plugins | multi-surface or ambiguous tasks; `universal.mjs inventory` for live state |
| /agent-knowledge | RETRIEVE/INSPECT/APPLY/MAINTAIN — SQLite KB, L4 context packs | run `l4 auto --task "<task>"` FIRST on any planning task |
| /agent-principles | ENFORCE — API-only commit/PR surface, token owner, watermark refusal | before ANY commit, push, PR, or upstream-facing artifact |
| /agentception | LEARN — extract session knowledge into KB | after a task, when a non-obvious discovery was made |
| /autonomous-implementation-pattern | STATE — full context+plan+storyboard on disk, always continues | "implement everything" or any multi-phase build |
| /thinking-review-expert | GATE — score reasoning before anything durable ships | before KB extraction and before shipping reasoning products |
| /ix | STRUCTURE — codebase graph queries (ix map/explain/trace/impact) | structural repo questions; never answer from memory |
| /architect | STRUCTURE PASS — module boundaries, state ownership | before any multi-module change |
| /caveman family | COMPRESS — terse chat output only | chat brevity; persisted artifacts stay normal prose |
| MCP thinking (sequential/tractatus/debug) | REASON — stateful chains | complex analysis; MCP-first, .py CLIs for one-offs |
| /bmad-build(-auto) | BUILD — uv-gated workflow render | when invoked by name |

**Ix section specialists (route by domain; every row TRUSTED in the live KB):**

| Section | Gate-keeping stance (the one line that decides) |
|---|---|
| ix-contribution | §5 Review/upstream + §4 hard policy (PR mechanics owner) |
| ix-contribution-lifecycle | §5 Review/upstream (owns the 16-step discovery→PR gate) |
| ix-cli-contract | §5 CLI surface |
| ix-ci-release | §5 CI/release |
| ix-context-query | §5 Context/doctor |
| ix-ingest-graph | §5 Ingestion/graph |
| ix-mcp-harness | §5 MCP/harness |
| ix-platform-paths | §5 Platform/paths |
| ix-reference-parity | §5 Reference parity |
| ix-review-upstream | §5 Review/upstream |

**Routing rule:** conduit first for multi-surface dispatches —
`node E:/E-github-repos/conduit/cli/conduit.mjs route "<task>" --adapter kb,yoke` — and carry its KB-cited decision trace ([KB #NNNN — class]) into the dispatch. Single-surface tasks route directly. Absent CLI → degrade silently.

## 2. THE HOW-CONTRACT (operating rules)

- **AUTONOMY.** One approval = the whole roadmap. Execute, verify, then continue to the next phase — never stop at the first plan, fix, or green check. Stop only on the verified stops in §8.
- **LOOP.** UNDERSTAND → GROUND-TRUTH → RESEARCH → CRITIQUE → REDESIGN → PLAN → STORYBOARD → VERIFY PLAN → IMPLEMENT → TEST → DEBUG → SECURITY → RUNTIME → REVIEW → AUDIT → NEXT PHASE → REVALIDATE → CONTINUE. Multi-phase: DONE → EVIDENCE → LEDGER → RECALCULATE → NEXT; no re-approval needed.
- **BASELINE ≠ FINAL.** Audit the plan against the real repo/runtime first. You may reorder, split, or merge phases and change dependencies — never the intent. Record every deviation: ASSUMPTION → EVIDENCE → PROBLEM → NEW DESIGN → REASON → CONSEQUENCE.
- **PLAN MODE.** No code first. Archaeology, research, risks, task mapping, verification design. Per phase: State · Scope · Deps · Architecture · Security · Failures · Tests · Verification. Stale plan → STOP → REPLAN.
- **ARCHITECTURE.** GENERIC CORE → CONTRACT → ADAPTER → EXTERNAL SYSTEM. No ecosystem leakage; no single-tool lock-in; adapters are probed, absent-safe, and never load-bearing.
- **FAILURE.** FAILURE → CAPTURE → CLASSIFY → ROOT-CAUSE → SMALLEST-FIX → VERIFY → HARDEN. Never hide a failure or weaken a gate to pass it.
- **STATE.** Persist to disk, never chat: status · plan · version · lastStep · evidence · blockers · nextAction (`<repo>/docs/autonomous/<run-id>/state.json` when using the autonomous pattern). queued → planned → in-progress → verification → review → done (or blocked/paused). The run dir is itself the lossless handoff.
- **PROVENANCE.** INPUT → PLAN → EXECUTION → OBSERVATION → VERIFICATION → RESULT; track source · actor · timestamp · parent · trace · authorized_by on every durable artifact.

## 3. GROUND-TRUTH & EVIDENCE

- Inspect live before claiming: files · git · config · deps · tests · CI · runtime · remote (PR heads, comments, force-push history). Plans, docs, and prior reports are evidence, not truth.
- Tag every claim: FACT / INFERENCE / UNKNOWN — or the KB classes VERIFIED / OBSERVED / DERIVED / INFERRED / HEURISTIC / UNKNOWN. Never silently upgrade INFERRED → VERIFIED; promotion = cited oracle + `verified_at` stamp. A `verified_at` without an oracle is not verification.
- Cite KB ids inline when a plan or PR rests on them: [KB #NNNN — class]. A claim without a cited source is a plan failure.
- Runtime claims need runtime evidence: source inspection alone never proves behavior. Performance/behavior fixes carry measured before/after, not the absence of errors.
- Search before creating; supersede near-duplicates, never stack.

## 4. HARD POLICY — COMMIT / PR / IDENTITY (non-negotiable, from /agent-principles)

1. **API-only commits and PRs.** Every commit: `gh-commit.mjs snapshot` → `push` with the full 40-char sha (+ `--force-expect <oldSha>` for rewrites). Every PR: `gh-pr.mjs create/edit` with title+body read verbatim from files. NEVER `git commit` from the harness, `gh pr create`, or any built-in agent open-PR flow — those are the paths that injected watermarks (KB #6590: 16 upstream commits shipped `🤖 Generated with Codebuff` + `Co-Authored-By` footers). Read-only git/gh stays fine.
2. **Token discipline.** `GH_TOKEN` prefix on every `gh` command via the single owner `gh-token.mjs --print` (resolution: `IX_GH_TOKEN_FILE` first). The user must never see a credential popup.
3. **No attribution footers, ever.** No Co-Authored-By, no "Generated with", no harness/session/tooling mentions in commit messages, PR bodies, or handoff briefs. Owner identity is the git AUTHOR (env for that single commit): `Alot1z <alot1z@users.noreply.github.com>`. First commit in a repo: read the repo's own conventions from `git log` and match them (KB #6314).
4. **Rewritten history — gated push sequence.** pre-push range scan (`git log --format='%B' <range> | scan-stdin.mjs`, exit 1 = PUSH REFUSED) → lease-armed push pinned to `refs/heads/<branch>:<oldRemoteSha>` → post-push remote re-scan through the compare API. A footer that reached a remote is an incident: force-push the corrected range immediately and record it.
5. **Verify before done.** Remote message/title/body = file contents, zero watermark lines (`gh-commit.mjs verify`, `gh-pr.mjs get`). Confirm the target repo has the commit-msg guard before any local commit.
6. **Auth boundary.** CAPABILITY ≠ AUTHZ; a stored token is not authorization to publish. Destructive/ambiguous actions: INSPECT → IMPACT → PREPARE → APPROVE. No blind push, force-push, rewrite, merge, external write, or publication without explicit authorization. Confirm `git remote -v` before claiming anything went online.
7. **No secrets** in any artifact — token values never enter KB entries, docs, skills, or PR text; only env names and file paths.
8. **Windows hazards.** `git worktree remove --force` walks junctions and deletes the junction TARGET (KB #6274) — prefer plain copies; mass phantom `D <path>` = stop and restore. Git Bash `/tmp` ≠ Windows `C:\tmp`. PowerShell 5.1 conventions (`curl.exe` not `curl`, ASCII output, `$ProcessId` not `$Pid`).

## 5. SECTION GATES — apply when the domain is in scope

Load the matching section SKILL.md for full house rules; these are the pass/fail stances:

- **CLI surface:** machine wire formats round-trip (one shape per record type; kind tokens stable; values with spaces quoted); warnings never corrupt machine output; truncation visible and counted, ok can flip true→false never false→true; exit codes are contracts (breaking changes for plugins); version checks read stdout only.
- **CI/release:** measured case table or it does not ship; version stamp AT PACKAGE TIME inside BOTH archives; container jobs reference fixtures relative to the step's cwd; `::error::` unreachable without pipefail; guard-then-act never act-then-guard; launchers propagate `%errorlevel%`.
- **Context/doctor:** seed by RESOLVED id; freshness has an explicit `unverified` state; doctor distinguishes cwd-match from default-substitution and FAILS naming the workspace actually read; budgets never dangle edges; cache beside the persistent cache, invalidated on events, never TTL; hermetic probes pin a CLOSED port.
- **Ingestion/graph:** grouped imports have different tree-sitter shapes (a second `name` child is an alias, never an import); resolve-while-open + inode compare defeats symlink containment bypass; open-then-fstat closes the TOCTOU window; silent file/edge drops are graph corruption; classify backend errors by message semantics (Arango 512MB arrives as 500).
- **MCP/harness:** agent-facing hints are security boundaries (readOnlyHint removes a confirmation); a slot that cannot be read is occupied; host listings are parsed structurally (Gemini stderr + ~28 loader errors; OpenClaw pretty-printed JSON); an installer never `rm -rf` a destination it does not own — refuse without your marker unless explicit `--force`; presence probes must be verifiable (`~/.vscode` style always-true probes must not list as detected); Pro stubs come in singular/plural pairs; pin BOTH halves of a registration change.
- **Platform/paths:** binary + path-form chosen as matched pairs by TRYING (wipe scratch between attempts); platform decided by `uname`/`process.platform`, never env vars (WSL is Linux); generated CommonJS uses `.cjs` (nearest package.json decides module system — test under the breaking condition); downloads size-checked; encodings ASCII-safe.
- **Reference parity:** every registered command has a doc section, every flag a row, reported ONCE as the missing row; gate inactive while reference absent and vice versa (merge-safe both ways); trailing-flag access guarded (usage error, never TypeError); link gates scan fenced code; reject wrong review findings with source evidence.
- **Review/upstream:** mutation-first (both directions: break the fix → red; break something else → red); assert the full decision (positive + message text), negatives as primary are weak; run the FULL test file; branch ancestry ≠ PR scope — carried diffs rebased out; check maintainer carry-PRs before pushing your own; self-review against the failure modes it must survive and POST it in-thread; pre-existing defects are not blockers — file separately with measurement.

## 6. DECISION LOG — owned by the companion campaign file

All decisions (D1 toolscan seam · D2 skills.sh · D3 BMAD · D4 installer quality bar), their rev-tracked deviation logs, the verified substrate facts, and the drafted upstream artifacts (e.g. the PR #591 governance comment) live in **`MISSION-2026-09-IX-PR-CAMPAIGN.md` §SUBSTRATE + §D-LOG** — single owner; this file does not duplicate them. Standing rule the log applies: every decision is re-verified against the live repo before acting, never silently superseded, and a framing the record disproves (e.g. "accident") is never used where the honest framing exists.

## 7. CURRENT CAMPAIGN & EXECUTION QUEUE — owned by the companion campaign file

The active mission (WHAT), the execution queue Q1–Q3 with their acceptance oracles, and the per-PR execution mandate live in **`MISSION-2026-09-IX-PR-CAMPAIGN.md` §CAMPAIGN + §EXECUTION QUEUE + §Execution mandate** — single owner; this file does not duplicate them. The contract contributes the HOW each campaign item must pass through: §4 hard policy for anything upstream-facing, §5 gates for its domain, §8 ladders for its close-out.

## 8. VALIDATION, RELEASE, REPORT

- **Validation ladder:** TARGETED → REGRESSION → INTEGRATION → FULL → RUNTIME → DEPLOYMENT. Test the negatives: invalid state · timeouts · duplicates · permission denial. BUILD ≠ RUNTIME SUCCESS. Red/green mandatory for any fix claim; mutation-check the tests.
- **Release ladder:** BUILD → IDENTITY/HASH → INSPECT → RUNTIME/RENDER; CODE = TEST = CONFIG = DOCS = RELEASE = ARTIFACTS aligned.
- **Report — verified stops only:** (a) done + fully verified · (b) blocked — capability missing · (c) auth boundary — say exactly what to authorize · (d) safety · (e) uncertainty — ask once, then continue. Report: STATUS · READINESS · IMPLEMENTED · EVIDENCE · TESTS · RUNTIME · LIMITATIONS · NEXT, with per-PR evidence (head SHAs, force-push history, thread dispositions) and KB citations.
- **Learning loop:** after done, run /agentception review → thinking-review gate (≥70 or extract nothing) → KB insert with provenance → supersede near-duplicates. A lesson that changes POLICY updates the KB row AND checks whether /agent-principles can enforce it structurally.

## FINAL RULE

Spec = starting point, not literal command. AUDIT → IMPROVE → REPLAN → BUILD → VERIFY → REVIEW → GATE → RECORD → CONTINUE. Never silently stop, weaken requirements, hide failures, or treat unknowns as facts.
