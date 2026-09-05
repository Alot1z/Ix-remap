# BUILDER PROMPT — IX CAMPAIGN · COMPLETE DISPATCH v7 (draft-first train, 2026-09-05)

You are the builder. The owner (GitHub **Alot1z**) set the WHAT; this file is the complete HOW + WHAT + protocol. **This file alone is the dispatch** — it assumes zero chat context. It supersedes `BUILDER-PROMPT-COMPLETE.md` v5 (and the v3/v4 lineage, all archived at `prompts/architect/archive/`; bodies kept as history — do not execute from them). Every difference vs v5 is on record in §0.5.

**RULE 0 (owner directive, 2026-09-05): nothing opens ready.** Every upstream PR opens as a **DRAFT**, its body explicitly marked as part of a larger train. No PR is marked ready, and no piecemeal PR/issue/commit is opened as if standalone, until the train release step (§1 item 9) with the owner's go. A PR opened without the draft flag is a defect to be corrected immediately (conversion = GraphQL, §5.9).

---

## 0. DISPATCH STATUS — THE TRAIN IS MERGED; ONE DRAFT IS OPEN (probed live 2026-09-05)

**KageBinary merged the entire open PR train — including #591 with the toolscan seam — without replying to the governance comment (KEEP-by-merge).** Main has not moved since #591's merge. One upstream-facing deliverable now exists as a **draft**: PR #604 (logo banner). Awaiting external: the #547 wave gates only (other contributor's PRs, not ours to move).

| Item | State | Evidence (2026-09-05) |
|---|---|---|
| PR #591 (toolscan seam installer) | **MERGED** 05:32:14Z, merge `39d0734` — KEEP-by-merge; merged README line 240 carries the toolscan link as upstream's own text | VERIFIED — API probe + raw-file probe |
| Main head | `39d07342` — unchanged since #591's merge | VERIFIED — ref probe this session |
| **PR #604 (TUI logo banner) — DRAFT** | Opened 2026-09-05 then **converted to draft** via GraphQL (REST PATCH ignores `draft` on open PRs); head **`0869a137`** (rebase `204028f6` + bg/goldens `ae4b987` + hermeticity fix `0869a137` on merged main); body rewritten as a marked train part and re-edited when CI moved | VERIFIED — GraphQL + REST re-probes + `gh-pr.mjs get` (body verbatim) |
| #604 CI on head `0869a137` | **22/23 green — all six originally failing jobs fixed** (`Test` × ubuntu/macos × node 22/24, `CI Passed`). Item 3 fix (`0869a137`, 2026-09-05): half-block pin stubs TERM/NO_COLOR/COLORTERM; lib≡CLI pins get a 30s budget — root cause was the in-process full-PNG decode (~16M byte-samples) ~10× inflated by v8 coverage (measured ~0.7s → ~6.8s), reproduced on Windows with `--coverage`. Assertions unchanged. **Residual: CodeQL red ×3 via the same infra race — every run ~2s (no real analysis possible), identical annotation "file may have changed" at `scripts/render-logo.mjs:45` (a plain PNG chunk parser); the renderer blob is byte-identical (`20694454b`) across `ae4b987`→`0869a13` and a genuine full analysis already PASSED on that exact content earlier — clears via maintainer-side re-run (rerun = admin rights; token is contributor-only) or on the next branch update** | VERIFIED — check-runs + annotations + job logs this session |
| Installer audit (owner-directed) | **DONE as analysis + captured 2026-09-05** (v6 status report + audit doc in `repo-fork/docs/autonomous/run-2026-09-05-item2-installer-audit/installer-audit.md`, re-derived from live main `39d0734` this session): findings a–e VERIFIED — (a) README:250 documents `claude gemini` but gemini is not a registry id (example exits 1); (b) README:237 claims `~/.gemini/skills` deploy target the registry deliberately excludes; (c) README:238 says `~/.cursor/skills`, registry installs `~/.cursor/skills-cursor`; (d) README:231 "…and more" overclaim vs a 4-id registry; (e) refuse-to-destroy guard satisfiable by a foreign `name: ix` skill (risk, assess — not a docs fix). Positive side verified sound: unknown-id errors, `--json` shape, TOOLSCAN_PATH opt-in only, quoteForCmd drift guard, 8-job `ci-success` gate. **Drafted fix held locally, zero upstream writes** (`installer-docs-fix.draft.md`, README-only) | VERIFIED — live files read line-by-line this session |
| toolscan (Alot1z/toolscan) | B1 license `2800f82`; B2 doctor oracle + B3 fail-closed contract shipped in `031c6f1` (23→53 tests); B5 generic core holds; **hermetic cross-platform suite + first CI landed 2026-09-05** — `e47f42b` (platform-faithful naming/delimiter + native fixtures + POSIX X_OK pins, dist rebuilt) + `2f88671b` (ubuntu+windows matrix × node 20/22 + dist-sync gate); head `2f88671b`; **B4 residuals**: (a) Ix consumer parser `discovery.ts:81` does not enforce the producer contract — train-gated filing; (b) validator does not reject `..` segments inside absolute paths — DEFERRED (changes the validateToolEntry accepted-input contract; authorization-gated, do not fold into test hermeticity) | VERIFIED — clone + suite runs + CI run `33971010614` (all 5 jobs green) |
| toolscan suite | **RESOLVED 2026-09-05 — hermetic + CI-green on both platforms**: was Windows-green / Linux-red (11 Linux failures, every one a host-dependence artifact: `.cmd` fixtures without +x, host `path.delimiter`, host `path.basename` on win32-mode names); now `toolName`/PATH-split follow the DECLARED platform (native runs unchanged), CLI fixtures are native per runner, and scan tests add a POSIX X_OK block. CI run `33971010614` on head `2f88671b`: **ubuntu 56/56 ×2 (node 20+22), windows 53 pass + 3 posix-skip ×2, dist-sync gate green** | VERIFIED — CI job logs (job 101319401467 ubuntu: 56 passed; 101319401704 windows: 53 + 3 skipped) |
| #547 (Hiro-Chiba exit-code PR) | OPEN, held by design — maintainer merged everything else; **gates = `ix-openclaw-plugin#33` + `ix-claude-plugin#37` + `ix-claude-plugin#38`, all open (no movement since 08-30/09-01); #37 RESOLVED from UNKNOWN — verified a real PR** (v6's 404 was a probe artifact); `ci-success` = 6 jobs; residual `ix locate` exit-0 ambiguity named for #559. **Wave snapshot 2026-09-05 14:21Z: no movement on any surface** (run-dir `run-2026-09-05-item7-wave-monitor/`) | VERIFIED — wave probe 2026-09-05 + thread |
| TUI logo branch | fork `feat/tui-logo-banner` @ `0869a137` (was `d2876f5` → `ae4b987`); 8 files (renderer, d.mts, banner.ts, bootstrap.ts, test suite 21 pins, 6 goldens); `assets/logo.png` already upstream — PR adds no asset | VERIFIED — tree + byte-identity checks |
| Campaign bookkeeping | sweep lineage: `run-2026-09-05-item2-sweep/` → **residual closed `run-2026-09-05-item5-sweep-residual/`**; installer audit `run-2026-09-05-item2-installer-audit/`; **C1/C3 proposals `run-2026-09-05-item6-c1c3-proposals/`; wave monitor `run-2026-09-05-item7-wave-monitor/`; KB close-out `run-2026-09-05-item8-kb-closeout/`; item-9 train bundle `run-2026-09-05-item9-train-bundle/` (TRAIN-REPORT.md + pr-604-illustrated-report.html + ITEM-9-BUNDLE.md + ITEM-10-FINAL-REPORT.md, live-probed 15:15Z)** (all 2026-09-05; KB rows #6638–#6645 TRUSTED in agent-knowledge-base); v6 status report at `prompts/architect/reviews/IX-CAMPAIGN-COMPLETE-2026-09-05/` | OBSERVED — local |

## 0.5 RECONCILIATION LEDGER — v5 → v7 (nothing dropped silently)

Retired / resolved (probed 2026-09-05):

- **v5 item 1 (logo PR: rebase → goldens → `--bg none` → open → CI)** → **EXECUTED, then draft-flipped by owner directive.** Rebase `204028f6` (parent = upstream main `39d0734`), `--bg none` + goldens `ae4b987`, PR #604 opened — and immediately **converted to draft** because RULE 0 (new) forbids ready PRs before the whole train. **New residual created by real CI**: 6 Linux/macOS failures on the head (diagnosed, §0) → queue item 3. The v5-era "10 pins" contract is now 21 pins + goldens (§12.1).
- **v5 item 2 (C1/C3 proposals)** → queue item 6, unchanged in kind.
- **v5 item 3 (close-out KB rows)** → queue item 8, unchanged in kind.
- **v5 item 4 (final report)** → queue item 10.
- **Installer audit as "candidate findings"** → the v6 report (owner's own files, `prompts/architect/reviews/…`) already DONE the analysis with findings a–e VERIFIED and the positive side verified. v7 makes the remaining work **capture + drafted-fix holding** (queue item 2) — zero upstream writes until train release.
- **toolscan B-queue** → reconciled to reality: B2/B3 already shipped (not re-queued); the real remaining work is B4 residuals + cross-platform CI (queue item 4). The v6 report's "new finding" (no CI, Windows-green/Linux-red) is a load-bearing queue item, not decoration.
- **Mention sweep residual** → RE-ADDED as queue item 5 (v5 retired it; the v6 report keeps issues/discussions alive as an unprobed surface).
- **Wave monitor + ARMED #547 rebase** → RE-ADDED as queue item 7 (from v6 report §7 — monitor-only, authorization-gated).
- **Draft-first policy (RULE 0)** → NEW, owner directive 2026-09-05: recorded as D9 (D-LOG). Supersedes any earlier "open when ready" wording in archived files.
- **Draft conversion mechanics** → NEW: GraphQL `convertPullRequestToDraft` is the only route for open→draft (REST PATCH ignores `draft` on open PRs, verified 2026-09-05). Recorded in §5.9 and D10.

Kept alive (updated):

- **Logo contract** → §12.1 updated to head `0869a137`, 21 pins, goldens, `--bg none`; PR #604 DRAFT; CI hermeticity work = queue item 3 (DONE `0869a137`, 2026-09-05).
- **C1/C3 scope rules (D8)** → unchanged: install-method inspiration feeds proposals only, never upstream code/docs.
- **Close-out rows** → queue item 8; now includes the new session lessons (dispatch-drift, GraphQL draft conversion, Windows-green/Linux-red class ×2 repos).

## 1. YOUR JOB — the remaining queue, in order

**Queue discipline:** authorization-gated item → record **BLOCKED(b/c)** with the exact authorization needed and continue; never stall. **RULE 0 (binding): no upstream PR opens as ready — drafts only, bodies marked as train parts; the ONLY moment anything is marked ready is item 9 (train release), and only with the owner's go.**

**queue-length: 10**

1. **Session-start probe (light):** gated tools live (`doctor.mjs` ALL GREEN), re-probe the §0 rows cheaply (main head unmoved, #604 still draft at head `0869a137`, toolscan HEAD, #547 gates), then post the session-start report per §9.
2. **Installer audit — capture + drafted fixes (read-only; held locally):** **DONE 2026-09-05** — `installer-audit.md` (findings a–e re-derived from live main `39d0734` with line-level evidence + positive-side verification + explicit held-local/no-submission statement) and `installer-docs-fix.draft.md` (README-only correction: gemini rows removed/corrected, `~/.cursor/skills-cursor`, overclaim tightened) both in run-dir `repo-fork/docs/autonomous/run-2026-09-05-item2-installer-audit/`. **Zero upstream writes** — the fix file joins the train and opens as a draft only at item 9 with authorization.
3. **Logo PR — CI hermeticity on the draft branch (fork work, pre-authorized):** **DONE 2026-09-05** — commit `0869a137` (gated snapshot + lease push `--force-expect ae4b987`, byte-verified, post-push re-scan footer-free). Fixes: the half-block pin stubs `TERM`/`NO_COLOR`/`COLORTERM` (runners resolve ascii otherwise); the two lib≡CLI byte-identity pins got a 30s budget — root cause measured: in-process full-PNG decode is ~0.7s and v8 coverage inflates it ~10× (~6.8s, reproduced locally with `--coverage`), blowing the 5s default. **Assertions unchanged.** Evidence: `bootstrap-notice.test.ts` 21/21 under `vitest run --coverage`; full suite green (1703 passed / 21 skipped; one unrelated `ingest-files` timing flake passes in isolation); `tsc --noEmit` clean. CI on the new head: **22/23 green** — all six originally failing jobs fixed; **CodeQL residual is the ref-moved infra race** (red ×3, each ~2s, identical annotation at `scripts/render-logo.mjs:45`; renderer blob byte-identical `20694454b` across heads and a genuine analysis already passed on that content — rerun needs admin rights, maintainer-side re-run or clears on the next branch update). #604 remains a DRAFT (body re-edited to the resolved CI state, verbatim-verified).
4. **toolscan continuation (own repo, pre-authorized):** (a) cross-platform test hermeticity + (b) first CI — **DONE 2026-09-05** — `e47f42b` (platform-faithful `toolName`/PATH delimiter + native fixtures + POSIX X_OK pins + dist rebuilt in the same commit) then `2f88671b` (`.github/workflows/ci.yml`: ubuntu+windows matrix × node 20/22 + dist-sync gate as a content-compare against the committed bundle). Gated surface: scan/lease/byte-verify (all 5 files byte-identical at head)/post-push re-scan footer-free. Evidence: local win32 53 pass + 3 posix-skip; **CI run `33971010614` ALL GREEN — ubuntu 56/56 (node 20+22), windows 53+3skip (node 20+22), dist-sync green**; `tsc --noEmit` clean. Posix-semantics proof recorded (path.win32/path.posix pure modules) since no Linux runner exists locally — the ubuntu CI leg is the Linux proof. (c) validator rejects `..` segments inside absolute paths (B4 residual b) — **DEFERRED, not dropped**: it changes the `validateToolEntry` accepted-input contract (a product behavior change), which the owner constrained out of scope for this item; it joins the train as its own authorization-gated proposal. The Ix-side consumer alignment (`discovery.ts:81` enforcing the producer contract) remains a **drafted proposal only** — train-gated at item 9.
5. **Mention sweep — residual surfaces (read-only):** **DONE 2026-09-05** — report at `repo-fork/docs/autonomous/run-2026-09-05-item5-sweep-residual/residual-report.md` (+ `verbatim-capture.json`). Union re-probed: 45 threads (43 prior + #603/#604). Dispositions: #547 wave-gated monitor-only (full 12-comment list now captured incl. the page-2 v6 deferred — our coordination note + maintainer's state-of-record, zero reply warranted); #603 resolved-by-merge (verbatim captured, no reply); #604's only comment is the CodeQL-bot infra-race artifact (not a thread); **Discussions surface probed via GraphQL — enabled, 2 threads, both months-old by TannerTorrey3, zero Alot1z mentions**. Result: zero replies warranted → zero drafted replies; any posting BLOCKED(b/a) under RULE 0. Zero upstream writes this session.
6. **C1/C3 plan-only proposals (fork docs; no upstream writes):** **DONE 2026-09-05** — `repo-fork/docs/autonomous/run-2026-09-05-item6-c1c3-proposals/`: `C1-manifest-harness-registry.proposal.md` (manifest row shape: id/bin/probeType/configDir/skillDir/registerMethod/registrationDate/verifiedBy — probe-VERIFIED only per KB #6455; deliberate absence is data; CI = harness smokes become the manifest contract, zero new jobs) and `C3-skill-lifecycle-verbs.proposal.md` (`list`/`update`/`remove` keyed on the same `name: ix` ownership marker the refuse-guard uses; CI = the two smoke legs grow, 8-job gate unchanged). Both framed PROPOSAL ONLY — not promised, not scheduled, upstream's install surface is the maintainer's (D8); skills.sh credit in doc bodies only (D2/§13.2); zero upstream writes.
7. **Wave monitor + ARMED #547 rebase (authorization-gated):** **monitored 2026-09-05 14:21Z — snapshot at `repo-fork/docs/autonomous/run-2026-09-05-item7-wave-monitor/wave-state.md`; NO movement anywhere.** #547 open/`5280ec648`/MERGEABLE/no new comments; gates all open: `ix-openclaw-plugin#33` (08-30), `ix-claude-plugin#37` (09-01 — **resolved from UNKNOWN, is a real PR**) and `#38` (09-01); #559 draft `c60812e05` unchanged; consumers opencode#20/#21 + cursor#26 + gemini#29 merged. **ARMED #547 rebase: BLOCKED(b/a)** — fires only when the three gates land AND the owner authorizes the push (identity routing answered first: the train ran as Alot1z; the wave branch lives on Hiro-Chiba's fork). Every write needs authorization; never "help" uninvited.
8. **Close-out — KB extraction with provenance (per §9):** **DONE 2026-09-05** — 8 rows added to `agent-knowledge-base` (`data/knowledge.db`), all verify-gate PASS + promoted TRUSTED: **#6638** GraphQL-only open→draft conversion; **#6639** Windows-green/Linux-red hermeticity class + declared-platform path module; **#6640** v8 coverage ~10x hot-loop slowdown → honest budget fix; **#6641** CodeQL "file may have changed" ref-moved SARIF race signature; **#6642** pulls/{n} 404 probe-artifact discipline (#37 resolution); **#6643** KEEP-by-merge governance; **#6644** dispatch self-refresh (stale-plan) lesson; **#6645** committed-bundle dist-sync content-compare gate. **Superseded-not-stacked**: installer doc-vs-registry drift class already owned by #6227/#6226 family; A/B tree-proof already owned by #6575/#6578; parity-trio + sweep summary kept as dispatch §0/run-dir bookkeeping (not padded into KB). Run state: `repo-fork/docs/autonomous/run-2026-09-05-item8-kb-closeout/state.md`.
9. **Train release (the ONLY mark-ready moment):** when items 2–6 are complete and their PRs (logo #604, installer fixes, toolscan-adjacent) are green drafts with train-framed bodies, and the owner gives the go — mark the drafts ready (GraphQL `markPullRequestReadyForReview`), post the coordinated note, then item 10. Nothing is marked ready before this point, ever. **PREPARED 2026-09-05 (bundle at `repo-fork/docs/autonomous/run-2026-09-05-item9-train-bundle/ITEM-9-BUNDLE.md`): green-state checklist re-verified by live probe (#604 draft @ `0869a137`, 23/24 CI; toolscan `2f88671b` + run `33971010614`; installer draft on disk; wave gates unchanged) + exact mark-ready sequence. NOT EXECUTED — execution is only the owner's go.**
10. **Final report** per §9: STATUS · READINESS · IMPLEMENTED · EVIDENCE · TESTS · RUNTIME · LIMITATIONS · NEXT (each NEXT with its authorization). **DRAFTED 2026-09-05 at `repo-fork/docs/autonomous/run-2026-09-05-item9-train-bundle/ITEM-10-FINAL-REPORT.md`** (full §9 contract, live-state grounded); final issue lands after item 9 executes.

**Never silently stop, weaken requirements, hide failures, or treat unknowns as facts.**

## 2. OPERATING RULES (FROZEN from v3 — binding)

- **AUTONOMY.** One approval = the whole queue. Execute, verify, continue. Stop only on §9's verified stops.
- **LOOP.** UNDERSTAND → GROUND-TRUTH → RESEARCH → CRITIQUE → REDESIGN → PLAN → VERIFY PLAN → IMPLEMENT → TEST → DEBUG → SECURITY → RUNTIME → REVIEW → AUDIT → NEXT.
- **BASELINE ≠ FINAL.** Audit the plan against the live repo first. Reorder/split/merge phases freely; never change intent. Every deviation: ASSUMPTION → EVIDENCE → PROBLEM → NEW DESIGN → REASON → CONSEQUENCE.
- **PLAN FIRST.** No code before archaeology + risks + verification design. Stale plan → STOP → REPLAN.
- **GROUND TRUTH.** Inspect live before claiming: files · git · API · tests · CI. Tag every claim FACT / INFERENCE / UNKNOWN; never silently upgrade INFERRED → VERIFIED; BUILD ≠ RUNTIME SUCCESS. **A dispatch that does not re-read its own target repos goes stale within hours (toolscan B2/B3 lesson, 2026-09-05).**
- **ARCHITECTURE.** GENERIC CORE → CONTRACT → ADAPTER → EXTERNAL SYSTEM. Adapters are probed, absent-safe, never load-bearing.
- **FAILURE.** FAILURE → CAPTURE → CLASSIFY → ROOT-CAUSE → SMALLEST-FIX → VERIFY → HARDEN. Never weaken a gate to pass it.
- **STATE.** Persist to disk, never chat: run dir `repo-fork/docs/autonomous/<run-id>/` (all relative paths resolve from workspace root `E:/E-github-repos/Ix-remap`). Run dir = lossless handoff.
- **SEARCH BEFORE CREATE.** KB before any new row; supersede near-duplicates, never stack.

## 3. SKILLS TO APPLY (FROZEN — enforce, not decorate)

- **/agent-principles — the hard gate** (`C:/Users/Mose/.agents/skills/agent-principles/tools/`): EVERY upstream-facing artifact through the gated surface. `doctor.mjs` at session start; digest for the policy pack. **GATE-MISSING STOP:** gated surface unreachable → upstream writes IMPOSSIBLE → BLOCKED (b/c), continue read-only/own-repo. "The gate is missing" NEVER becomes "writes proceed ungated." Known client limitation: fetch file contents via the JSON envelope + base64-decode, never raw-accept.
- **/agent-knowledge**: `l4 auto` before each item; cite [KB #NNNN — class]; capture lessons after each item.
- **/agent-yoke + conduit**: route multi-surface items first; absent CLI → degrade silently (routing only).
- **Ix section agents**: `ix-agent-triage.mjs` → load matched `SKILL.md` from its installed root, never memory. Stances decide pass/fail (§4).
- **/autonomous-implementation-pattern**: state on disk; continue past blockers.
- **/thinking-review-expert**: score reasoning before anything durable ships (<50 extract nothing).
- **/ix + /architect**: structural questions via `ix map`/`ix search`, never memory.
- MCP thinking servers (sequential/tractatus/debug) live; verify availability before relying. bmad-build/-auto are NOT part of this campaign (D3).

## 4. IX SECTION GATES (FROZEN — the one line that decides each)

- **ix-contribution / lifecycle**: canonical gated commit+PR sequence; the 16-step discovery→PR gate; red/green + mutation mandatory; fork-as-evidence, never competing fix; **one clean story per PR**; **draft-first (RULE 0)**.
- **ix-cli-contract**: output a parser cannot parse, or an exit code a caller cannot trust, is a defect. Warnings never corrupt machine output; truncation visible and counted; exit codes are contracts. **CI hermeticity is part of the contract: a test that only passes on the author's platform is a defect.**
- **ix-ci-release**: measured case table or it does not ship; releases run the ACTUAL install path; `::error::` unreachable without pipefail; guard-then-act.
- **ix-mcp-harness**: capability metadata is a security boundary; host listings parsed structurally; an installer never `rm -rf` what it does not own; presence probes must be verifiable (#6455); pin BOTH halves of a registration change. **The Ix consumer parser must enforce the toolscan producer contract (B4 residual) before any path reaches `host.inspect`.**
- **ix-platform-paths**: binary + path-form are matched pairs, decided by TRYING; platform by `uname`/`process.platform`, never env vars; Windows junctions are KB #6274 hazards — copy, don't symlink.
- **ix-reference-parity**: every registered command/flag has a doc row; a doc change that cannot point at the rule it satisfies does not pass. Post-merge: the parity gate is LIVE in main's CI — `docs/` PRs fail on drift and dead links; run the checkers locally before pushing.
- **ix-review-upstream**: mutation-first both directions; assert the full decision; run the FULL test file; branch ancestry ≠ PR scope; self-review posted in-thread; pre-existing defects filed separately with measurement.
- **ix-ingest-graph / ix-context-query**: untrusted input confined + validated at the owning layer.

## 5. HARD POLICY — COMMIT / PR / IDENTITY (FROZEN, non-negotiable)

1. **API-only commits and PRs.** Commits: `gh-commit.mjs snapshot <owner/repo> <branch> <localdir> <msgfile> --paths <filelist>` → `push … --force-expect <oldSha>` (new branches: POST `/git/refs` at base head first). PRs: `gh-pr.mjs create/edit/close/reopen/get` with title+body read verbatim from files. NEVER `git commit` from the harness, `gh pr create`, or any built-in agent PR flow (KB #6590). Read-only git/gh fine.
2. **Token discipline.** `gh-token.mjs --print` is THE single owner (`IX_GH_TOKEN_FILE` first). The user never sees a credential popup. GraphQL calls (draft conversion) take the token ONLY from `gh-token.mjs --print`, never a restated resolution path.
3. **No attribution footers, ever.** No Co-Authored-By, no "Generated with", no harness/session/tooling mentions in commits, PR bodies, comments, or handoffs. Owner identity is the git AUTHOR env: `Alot1z <alot1z@users.noreply.github.com>`. First commit in a repo: match its `git log` conventions (KB #6314).
4. **Gated push sequence.** Pre-push range scan (`scan-stdin.mjs`, exit 1 = PUSH REFUSED) → lease-armed push pinned to the expected old sha → post-push remote re-scan via compare API. A footer that reached a remote is an incident: force-push the corrected range immediately and record it.
5. **Verify before done.** Remote text = file contents, zero watermark lines (`gh-commit.mjs verify`, `gh-pr.mjs get`).
6. **Auth boundary — D6 rev 2 tiers (CANONICAL).** Both tiers use the gated surface only; tiers change WHO authorizes, never HOW.
   - **TIER A — pre-authorized, never ask:** (1) all writes to `Alot1z/*` repos; (2) pushes to any branch backing the owner's own upstream PRs (incl. lease-checked rebase pushes); (3) **opening PRs from fork branches → `ix-infrastructure/Ix` — as DRAFTS (RULE 0)**; (4) comments/replies on the owner's OWN PR threads; (5) opening new issues on `ix-infrastructure/Ix` when a playbook branch or filed-defect rule calls for it; (6) closing/reopening the owner's OWN PRs; (7) draft-state changes on the owner's OWN PRs (convert to draft / mark ready at train release).
   - **TIER B — one explicit authorization each; name it in the report and stop that thread:** merging ANY PR; comments on other people's PRs/issues (draft, post on approval); publishing/distribution acts (npm publish, skills-ecosystem publish, GitHub releases); creating/deleting repos or changing visibility; anything touching branches/artifacts owned by other contributors; marking ANY PR ready outside the item-9 train release.
   - **NEVER, in either tier:** watermark lines (structural refusal); lease-less force-pushes; secrets in artifacts; any write while the gated surface is missing (§3).
7. **No secrets** in any artifact — token values never enter KB rows, docs, skills, or PR text; only env names and file paths.
8. **Windows hazards.** `git worktree remove --force` walks junctions and deletes the TARGET (KB #6274) — prefer plain copies. Git Bash `/tmp` ≠ `C:\tmp`. PowerShell 5.1: `curl.exe` not `curl`, `$ProcessId` not `$Pid`.
9. **Draft-first mechanics (RULE 0, verified 2026-09-05).** Every upstream PR opens as a draft (create with `draft: true` when supported). Converting an ALREADY-OPEN PR to draft: REST `PATCH /pulls` **silently ignores** `draft` — use GraphQL `convertPullRequestToDraft` (verified live on #604). Marking ready at train release: GraphQL `markPullRequestReadyForReview`. Draft bodies must state "part of a larger train" and name the coordinated set. An open (non-draft) PR where RULE 0 applies is a defect: fix it immediately and record it.

## 6. SUBSTRATE — re-probed live 2026-09-05 (re-probe cheaply before relying on any live-state row in a LATER session)

| Fact | Class |
|---|---|
| Merge train: #584/587/589/590/591/601/602 all merged 2026-09-05 04:51–05:32Z (SHAs in archived v5 §0); #600 closed as duplicate; main head `39d07342` unchanged since | VERIFIED — pulls/ref probes |
| Merged main README line 240 links `Alot1z/toolscan` (TOOLSCAN_PATH contract) — upstream's own accepted text; never re-litigate unprompted | VERIFIED — raw-file probe |
| Merged main carries parity gate (`check-api-parity.mjs`), `release_version` in spec (#602), dead-link gate (#590), committed flag reference | VERIFIED — raw probes |
| **PR #604 (logo) — DRAFT**, head `0869a137`, body train-framed verbatim, **CI 22/23 green** (CodeQL residual = ref-moved infra race, §0) | VERIFIED — GraphQL + REST + annotations + job logs |
| Fork logo branch `feat/tui-logo-banner` @ `0869a137`; 8 files; 21 test pins + 6 goldens; lib≡CLI byte-identity pinned; `assets/logo.png` already upstream | VERIFIED — tree + byte checks |
| Installer audit: findings a–e VERIFIED + positive side verified; **captured 2026-09-05 to `run-2026-09-05-item2-installer-audit/` (audit doc + held-local README-only draft fix); zero upstream writes** | VERIFIED — live main read line-by-line |
| toolscan: B1 `2800f82`; B2/B3 `031c6f1`; **head `2f88671b` — hermetic suite + CI green (ubuntu 56/56, windows 53+3skip, dist-sync gate)**; B4 residuals: consumer parser (train-gated filing) + `..` segments (DEFERRED — contract change) | VERIFIED — clone + CI run `33971010614` job logs |
| #547 open on plugin gates (#33 open 08-30; #37/#38 open 09-01 — #37 confirmed a real PR); no wave movement at 14:21Z snapshot; `ci-success` = 6 jobs; `ix locate` exit-0 residual named for #559 | VERIFIED — wave probe |
| skills.sh (vercel-labs/skills) — pattern reference for C1/C3 only; `npx skills add ix-infrastructure/Ix` works with zero Ix code | VERIFIED — repo read |
| Run-dir `run-2026-09-05-item2-sweep/` holds sweep-report.md + Q3-audit.json; v6 status report at `prompts/architect/reviews/IX-CAMPAIGN-COMPLETE-2026-09-05/`; prompts/ untracked | OBSERVED — local |

## 7. D-LOG — decisions (rev-tracked; supersede, never delete)

- **D1 · toolscan seam — rev 9 · RESOLVED (KEEP-BY-MERGE).** Lineage: rev 7 disclosed the self-insulated-Ix goal with preference order port > keep > split; the maintainer merged the seam without replying ~6h after disclosure. Consequences: (a) merged README toolscan link is upstream's text — leave it; (b) the port is DEAD as an active plan — revives only as a maintainer-initiated proposal; (c) toolscan B2–B5 executed before the outcome — the seam is publicly load-bearing and hardened; (d) performative-agreement ban (KB #6470). Governance comment verbatim preserved in archived files.
- **D2 · skills.sh — rev 4.** Credit by surface: only on artifacts that actually contain the capability; zero mention elsewhere.
- **D3 · BMAD-METHOD.** Orthogonal; only transferable idea: module sets.
- **D4 · installer quality bar.** Registry-driven, structurally verified probes, refuse-to-destroy, truthful dry-run, hermetic.
- **D5 · two questions, two surfaces.** Seam governance RESOLVED (merged). Ecosystem distribution of `skills/ix` = LATER, its own proposal, D2 credit.
- **D6 · Authorization model — rev 2 is CANONICAL** (see §5.6; v7 adds tier A.7 for own-PR draft-state changes).
- **D7 · Merge-train re-baseline (v5).** Retired everything the merge made moot; queue to four items. v7 re-opens the queue with the v6 report's real remaining work + RULE 0.
- **D8 · Install-method ideas — CREDIT-AND-SCOPE rule.** skills.sh-inspired concepts (first-run banner, doctor-verify, pinned download caps, add/list/update/remove verbs) feed C1/C3 proposals ONLY; never committed into Ix code/docs as attribution; never promised in a PR body beyond what that PR ships; the merged #591 requires no follow-up — the install surface upstream is done and is the maintainer's now.
- **D9 · RULE 0 — draft-first train (NEW, owner directive 2026-09-05).** Nothing opens ready; PRs open as drafts marked as train parts; the only mark-ready moment is the train release (§1 item 9) with the owner's go. Triggered by the owner's correction of #604 (opened ready, converted to draft same session). Supersedes any earlier "open when ready" wording.
- **D10 · Draft conversion is GraphQL-only (NEW, verified 2026-09-05).** REST `PATCH /pulls {draft:true}` silently ignores the field on open PRs; `convertPullRequestToDraft` (GraphQL) is the working route, token from `gh-token.mjs` only (§5.2/§5.9).
- **D11 · CI hermeticity class (NEW, 2026-09-05).** A suite that is Windows-green/Linux-red is a defect, not a quirk — hit twice in one day (toolscan, #604 banner tests). Platform-dependent test assumptions (exec bit, path strings, basename semantics, TERM/COLORTERM defaults, spawn timeouts) must be pinned hermetically and exercised on the full CI matrix.

### 7.1 The posted governance comment (FROZEN historical record — `#issuecomment-5547541291`, outcome: merged in silence)

> One governance flag, then I'll leave you alone. toolscan — the discovery seam in this PR — is my own project (Alot1z/toolscan). The seam is deliberate and fully tested — the mistake was mine: I tied Ix's docs to my own repo and let it ride without putting that decision in front of you. For context on where I stand: I never meant Ix to carry an external dependency for this — toolscan was my step toward this capability living self-contained inside Ix, and a native port finishes that. So:
>
> 1. **Port it natively — my preference.** I donate a self-contained port of the discovery into Ix core: a bounded scan of the common install roots with the same contract (bounded, `truncated`-truthful, opt-in env gate, zero external dependencies, MIT). Ix depends on nothing outside this repo and nothing of mine is listed anywhere.
> 2. **Keep the seam as-is.** Entirely your call, and I'll leave it in place if you make it — the disclosure stands either way.
> 3. **Split it out.** I rework this PR back to the embedded-probe installer and open a separate `feat(mcp): optional TOOLSCAN_PATH discovery seam` PR so the decision gets its own review. (~10–12 of the 20 files; the smoke job splits in two.)
>
> Whichever you pick, I'll execute it as-is. (No other changes in this comment; the PR itself is untouched.)

## 8. STANDING RULES

### 8.1 New maintainer mention/comment anywhere (merged threads, new issues, other people's PRs) — probe 2026-09-05 onward: reply on the owner's OWN threads (Tier A), draft on other surfaces (Tier B), reply with facts and evidence, no performative agreement (KB #6470). No dedicated sweep item — handle on encounter; the dedicated residual sweep is §1 item 5.
### 8.2 Fresh defects found in main (standing rule, recorded 2026-09-05) file with measurement (Tier A issue when a rule calls for it), never fix silently via unrelated PR. `ix locate` exit-0 ambiguity (named on #547 for #559) is the standing example. The installer README drifts (audit findings a–d) are held as drafted fixes (queue item 2), not filed piecemeal.
### 8.3 Fork-main drift rebase own PR branches when main moves materially (six-job `ci-success` gate + docs checkers make stale branches fail late and noisily).
### 8.4 Draft hygiene (RULE 0) every draft PR's body carries "part of a larger train" + the coordinated set; a draft whose head CI regresses is fixed on the branch, never marked ready.

## 9. REPORTING CONTRACT + STOPS (FROZEN)

1. **Session-start report:** tooling probe (gated tools live, conduit live, doctor verdict), routing decision, plan + oracle for the first item. Post, then proceed.
2. **Phase report after EVERY item:** `ITEM <id> — DONE|PARTIAL|BLOCKED · oracle: <quoted acceptance oracle + result> · evidence: <commands + outputs, KB ids> · deviations: <six-step log> · next: <next item>`.
3. **Decision journal:** every choice the plan didn't make gets a D-LOG row (rev-tracked). A decision that lives only in chat is a lost decision.
4. **Final report:** STATUS · READINESS · IMPLEMENTED · EVIDENCE · TESTS (red/green where applicable) · RUNTIME (what was actually exercised) · LIMITATIONS · NEXT (each with the authorization it needs).
5. **Honesty bar:** unexercised claims stay INFERRED; blocked reports blocked; never fabricated done.
6. **Verified stops only:** (a) queue done + oracles green · (b) blocked — capability missing (say which) · (c) auth boundary — a **Tier B** act is needed; name it exactly and stop that thread · (d) safety · (e) uncertainty — ask once in the report, continue with reachable work.

## 10. POST-MERGE RECORD (historical, closed)

The per-merged-PR record is §0 of this file (state + merge SHAs) plus `Q3-audit.json` and `sweep-report.md` in run-dir `run-2026-09-05-item2-sweep`. The open-PR audit machinery (force-push forensics, reply-drafting, rebase dispositions) is retired — its subjects merged. Method lessons survive in the close-out rows (queue item 8).

## 11. (RETIRED — README installation draft)

Retired with the merge: upstream main's README governs itself (including the toolscan text the maintainer accepted). The audit's README-claims findings are captured and drafted locally (queue item 2); they are NOT filed as an upstream docs draft outside the train.

## 12. TUI LOGO — state + contract

### 12.1. Canonical renderer + wiring (current state @ `0869a137`; PR #604 DRAFT)

- **Renderer:** `scripts/render-logo.mjs` (zero-dep: PNG chunks → inflate → unfilter → coverage-thresholded supersampling → flat 5-tone snap → half-block RLE). CLI surface, verbatim from the module: `node scripts/render-logo.mjs [--width N] [--color auto|truecolor|256|ascii] [--bg brand|none] [--file path] [--json]` · `--width` integer 8..120 (rows = clamp(round(cols·h/w/2), 2, 60)) · exit 0 ok · 1 usage/file · 2 unsupported/truncated · `auto` = NO_COLOR or TERM=dumb or FORCE_COLOR=0 → ascii; COLORTERM truecolor or FORCE_COLOR=3 → truecolor; TERM set → 256; else ascii · `--bg none` paints only the logo's own pixels (unbacked ▀/▄ half-blocks) · errors → stderr (JSON on `--json`), payload → stdout only.
- **Banner wiring:** `ix-cli/src/cli/banner.ts` spawns the renderer (`--width 48`), stderr-only via `emitSetupNotice`, absent-safe (renderer/asset missing → plain-text heading, never an error). The PNG (`assets/logo.png`, already upstream) is the only art ever maintained — the PR adds NO asset.
- **Test discipline (the pin list IS the contract; never weaken a pin to pass — fix the change):** 21 pins in `bootstrap-notice.test.ts` — stderr-not-stdout · absent-safe renderer/asset · NO_COLOR zero-escapes (mutation-checked) · exit-code contracts · `--bg none` invariants (backdrop constant never a background; library ≡ CLI byte-for-byte; JSON honesty) · byte-identity against the 6 goldens in `output-samples/` (truecolor/256/ascii × brand/none) · usage-error path. Goldens update only in a dedicated, stated commit.
- **Open work (queue item 3):** make the suite hermetic across runners — explicit env in color-mode pins, deterministic spawns — so the six Linux/macOS CI failures are gone before train release.

### 12.2. Install-method inspiration — scope rules (D8)

The skills.sh-inspired concepts (first-run TUI banner, `doctor` verify step, pinned download caps, add/list/update/remove verbs, credential discipline) feed the **C1/C3 proposals only** — never upstream code/docs, never PR-body promises beyond what the PR ships. The logo PR body may carry one aesthetic-credit line (§13.1) and nothing more. Upstream's install surface is DONE (merged #591) and is not re-opened.

## 13. CREDIT & ATTRIBUTION PLACEMENT RULES (FROZEN — the owner's standing question, answered)

1. **GitHub comments / PR bodies / issue threads:** the sanctioned surface. skills.sh credit appears ONLY in the body of an artifact that actually contains the capability (D2). The logo PR body MAY carry one aesthetic line; it is optional (the renderer is original zero-dep code).
2. **Design docs / proposals:** fuller credit clause allowed where the capability exists in that artifact.
3. **Actual committed FILES: ZERO attribution.** No inspiration comments in source, no "inspired by" headers, no tool mentions in file comments, no footers — nothing. (Exception: LICENSE files.)
4. **READMEs:** no personal-repo links added by us, ever. The toolscan link in upstream main's README exists because the maintainer merged it — that's their text, untouched. Fork READMEs follow the same rule.
5. **Governing principle:** *chat threads and docs explain provenance; files carry behavior.*

## FINAL RULE

Spec = starting point, not literal command. AUDIT → IMPROVE → REPLAN → BUILD → VERIFY → REVIEW → GATE → RECORD → CONTINUE. The merge train closed the campaign's external dependency; the remaining work is the draft-first train (logo CI hermeticity, installer drafted fixes, toolscan cross-platform CI, mention residuals, C1/C3, wave monitor, close-out) released together at §1 item 9 — never piecemeal, never ready before the whole set is green and the owner says go. Close the loop on every item; report per §9.