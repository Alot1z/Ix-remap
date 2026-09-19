# BUILDER PROMPT — IX CAMPAIGN · COMPLETE DISPATCH v5 (full-picture re-baseline: post-merge + exit-code wave, 2026-09-05)

You are the builder. The owner (GitHub **Alot1z**) set the WHAT; this file is the complete HOW + WHAT + protocol. **This file alone is the dispatch** — it assumes zero chat context. It supersedes `BUILDER-PROMPT-COMPLETE-v4.md` (kept as history, alongside v3 and the original three-file set). Every difference vs v4 is on record in §0.5. Frozen sections are marked; frozen means verbatim carry-over, not re-editing.

**What changed vs v4, in one paragraph:** v4 re-baselined after the toolscan train merged but wrote "Awaiting external: NOTHING" — true for the toolscan train, incomplete for the campaign as a whole. The exit-code wave (**#547** / #559) is still open and merge-gated on the maintainer's OWN plugin PRs; the maintainer also rebase-carried our #591 branch himself through a heavily-moved main (the #603 event, unknown to v4); and the owner directed a real audit of the NEW INSTALLER surface that landed in main. v5 corrects all three and adds the pinpoint map (§0.3) the owner asked for: every PR, branch, commit, comment, and file:line this run touches — e.g. https://github.com/ix-infrastructure/Ix/pull/547#issuecomment-5549703398 is the wave's state-of-record.

---

## 0. DISPATCH STATUS — THE FULL PICTURE (verified live 2026-09-05, ~05:35–07:30Z)

Two waves, two states. The **toolscan/installer wave is fully merged** — KageBinary merged the entire PR train with the toolscan seam in it, without replying to the governance comment (the MERGED-without-reply branch of the playbook fired — he answered in actions instead, see the #603 row). The **exit-code wave (#547 / #559) is open and merge-gated on the maintainer's own plugin PRs** — ready on the merits, waiting on consumers, exactly as sequenced.

| Event | State | Evidence |
|---|---|---|
| **PR #591 MERGED** (toolscan seam — the new installer) | merged `2026-09-05T05:32:14Z`, merge commit `39d07342a7`, 24 checks passed | API probe this session. Head at merge: `538c2498cc` on fork branch `feat/skill-install-toolscan` (fork = `Alot1z/Ix-remap`), 17 files, 10 comments. Governance comment `5547541291` (2026-09-04 23:17) never got a word-reply. |
| **The #603 event (v4 did not know this)** | OPENED then CLOSED by KageBinary; branch deleted | #603 "feat(install): drive harness presence from toolscan discovery (supersedes #591)" carried ALL of Alot1z's commits plus one merge commit — opened only because a push to the fork "would not accept" (he had used the wrong ref; the fork branch does accept maintainer pushes). He resolved a **consequential** conflict: the branch carried a synced copy of #587's parity gate that predated #587's own fix `f37fd49` — a naive merge would have silently reverted the regex hardening. He then pushed his merge commits **directly into our fork branch** (`b652008`, then `538c249` "Merge origin/main: all six gates required in ci-success"), closed #603 — "so it keeps its own history and authorship. Continuing there." — and merged #591 25 minutes later. |
| **10th comment on #591 (Alot1z, 2026-09-05 01:42, parity heads-up) — full text now captured** | posted; its open offer is MOOTED | Verbatim (record; re-verify at session start): "One measured heads-up for this PR's CI job, filed here because it's your review that adds it: I ran check-api-parity.mjs against current main (main's own api.ts, types.ts, docs/api/*) and it exits 1 with two pre-existing gaps: undocumented endpoint: POST /v1/decisions; stale doc entry: GET /v1/decisions. So once this PR's api-parity job lands, it will go red on main immediately — not because of anything in this PR… Happy to send the small follow-up docs fix so the gate lands green — say the word. (Related: #602 closes #599 and documents why property-level drift still passes this gate.)" — The drift is now FIXED in merged main: `openapi.yaml:524` documents `POST /v1/decisions`, the stale GET entry is gone, and #603's own verification ran the gate at exit 0 (42 documented / 42 called). The offer needs no follow-up. |
| **PR #547 OPEN — gated (exit-code wave; NOT ours to land)** | open; Hiro-Chiba; "wants to merge 9 commits"; MERGEABLE | "fix(cli): fail unresolved graph commands" — fixes #546. Branch `Hiro-Chiba:fix/structured-resolution-failures`; latest commit `5280ec6` "fix(cli): fail ambiguous graph operations" (both arms of `reportResolutionFailure` now set exit 1). KageBinary's final word — comment `5549703398`, `2026-09-05T05:34:22Z`, two minutes after merging #591: "**ready on the merits and waiting on those three PRs… I do not have any open findings against it.**" Residual on record: `resolveFileOrEntity` (`resolve.ts:692`) still calls `reportAmbiguousTarget` with a hardcoded "text" and sets no exit code, so `ix locate` keeps exiting 0 on an ambiguous target — "#559's surface… worth folding into it there." |
| **PR #559 OPEN — DRAFT (the maintainer's own PR)** | open; draft; KageBinary | "fix(locate): exit non-zero for an unresolved target", commit `c60812e`, +41 / 2 files, closes #539. Deliberately step-2 after the plugin gates. Keeps the result body (shipped plugins read diagnostics off it); keeps ambiguity on its own path ("an answer, not a miss"). **NOT ours — zero action.** |
| **The merge gates — KageBinary's own plugin PRs, all "Review required"** | open in his org | `ix-openclaw-plugin` **#33** ("keep ix stdout when the command exits non-zero") — NOTE: per #547's body, #33 does **not** yet cover the `hooks/ix-read` path that discards stdout after a non-zero overview/impact run; that path still needs coverage before #547 is safe to merge. `ix-claude-plugin` **#38** ("a non-zero exit with a body is an answer, not a failure") · `ix-claude-plugin` **#37** ("a locate miss is an answer, not a locate failure"). Already merged consumers: `ix-opencode-plugin` #20/#21, `ix-cursor-plugin` #26, `ix-gemini-plugin` #29. (KageBinary, 09-01: several were stuck on ruleset permissions — "PUT /pulls/N/merge still 405s because bypass_actors is empty" — an org-admin fix, not a code problem.) |
| #584 · #587 · #589 · #590 · #601 · #602 | all MERGED; #600 closed (superseded by own #602) | #602 merged `05:05Z` via `36c80e54`; `release_version` at `openapi.yaml:981`; `/v1/decisions` drift fixed (above). |
| toolscan license (B1) | DONE, commit `2800f82` | API probe: MIT, LICENSE at root. |
| TUI logo | fork branch `feat/tui-logo-banner` @ `d2876f5`; PR still NOT opened — authorization-gated by design | 5 files, 1285 tests green, lib≡CLI byte-identity pinned. `assets/logo.png` already lives in upstream main — the future PR adds renderer + wiring + tests + goldens only, never a new asset. |
| KB rows | #6634 + #6635 TRUSTED; merge-outcome + parity + #599 + #603-lesson + wave rows NOT yet written | close-out work, §1 item 7. |

**Awaiting external:** the toolscan train — nothing. The exit-code wave — KageBinary's own plugin PRs (`ix-openclaw-plugin#33`, `ix-claude-plugin#37/#38`); not ours to land; monitor-only (§1 item 6). Everything below is executable now, gated only by the authorization matrix (§5.6).

---

## 0.3 PIN MAP — every PR, branch, commit, comment, and file:line this run touches (owner directive: pinpoint, never hand-wave)

**The merged toolscan train (ours):**
- **#591** — branch `Alot1z/Ix-remap:feat/skill-install-toolscan`; heads `608c986` (reviewed) → `b652008` (KageBinary merge-carry) → `538c2498cc` (final head, "all six gates required in ci-success"); merged via `39d07342a7` at `2026-09-05T05:32:14Z`; 24 checks passed. Thread: KageBinary's three review rounds = issue-comments 1/4/8; governance comment `#issuecomment-5547541291` (2026-09-04 23:17); Alot1z parity heads-up = 10th comment (2026-09-05 01:42).
- **#584** `ci(parity): gate registered flags against the flag reference` · **#587** `docs: API-reference parity gate (four surfaces)` (own follow-up fix `f37fd49` — the regex the #603 carry almost reverted) · **#590** `ci: fail on dead markdown links` · **#589** `docs(readme): point the Docs link at the in-repo docs` — all merged.
- **#602** (release_version on `/v1/health`; merge `36c80e54`) supersedes **#600** (closed). **#601** multi-repo detection fix, merged ~05:00Z.
- **#603** (KageBinary's superseder, closed, branch deleted): its body is the merge-conflict archaeology record for the whole train — read it before any rebase work on our branches.

**The exit-code wave (tracked, gated):**
- **#547** — `Hiro-Chiba:fix/structured-resolution-failures`; 9 commits (`d112b78` … `5280ec6`); KageBinary's state-of-record comment `#issuecomment-5549703398` (05:34:22Z); fixes issue #546; reviewers KageBinary + josephismikhail (≥1 approving review required); shared file with #559: `ix-cli/src/cli/__tests__/unresolved-machine-output.test.ts` (whoever merges second rebases it).
- **#559** — KageBinary draft, `c60812e`, closes #539; step-2 of the sequenced merge order (plugins first, then this, then #547 goes in).
- **Rules already merged into main:** #565 (CONTRIBUTING → CLI Standards → "a non-zero exit is a breaking change for plugins") · #551 (invalid option values exit non-zero — the contract `--pick` out-of-range now aligns with) · #566 (diff `unresolved_target` slug, merged `a2cab21`).
- **Plugin gates:** `ix-openclaw-plugin#33` (with the uncovered `hooks/ix-read` caveat above) · `ix-claude-plugin#37` · `ix-claude-plugin#38` — all KageBinary, all "Review required". Merged consumers: `ix-opencode-plugin#20/#21`, `ix-cursor-plugin#26`, `ix-gemini-plugin#29`.

**Main's landed installer surface (the audit targets, §1 item 2):**
- `scripts/install-skill.sh` — 208 lines: registry-driven; `--dry-run` / `--force` / `--json` / explicit harness ids (unknown id = error, exit 1); refuse-to-destroy a same-name foreign skill (`grep -qs '^name: ix$'` marker check); TOOLSCAN_PATH opt-in only (never a bare-name PATH lookup).
- `ix-cli/scripts/skill-harnesses.mjs` — 216 lines; registry = **claude, agents, codex, cursor** (gemini/opencode/openclaw/vscode deliberately absent — "no skills convention"; Cursor reads `~/.cursor/skills-cursor`); `HARNESS_HOME` override for hermetic tests; the .mjs/.ts duplication is guarded by `skill-harnesses.test.ts` + a 20k-argument `quoteForCmd` fuzz (0 divergences, per KageBinary's verification on #603).
- `.github/workflows/ci.yml` — `ci-success` now requires **8 jobs**: `static`, `test`, `e2e`, `api-parity`, `doc-parity`, `links`, `harness-install-smoke`, `harness-install-smoke-windows` (the smoke jobs exercise the skills table, the shell installer, and `ix mcp install --dry-run` against an off-PATH fixture — including a real windows-2022 runner).
- `README.md` — install section ≈ lines 233–254; the toolscan link sits at line 240 (upstream's own accepted text — leave untouched).
- `docs/api/openapi.yaml` — `release_version` at :981; `POST /v1/decisions` at :524 (the 10th-comment drift, fixed).

---

## 0.5 RECONCILIATION LEDGER — v4 → v5 (nothing dropped silently)

Retired / corrected, with cause:

- **v4's "Awaiting external: NOTHING"** → CORRECTED. True for the toolscan train; false for the campaign: the exit-code wave (#547/#559) waits on KageBinary's own plugin PRs. §0, §0.3 and §14 now track it; §1 item 6 gives the monitor + armed-rebase plan.
- **v4's invisibility of #603** → FIXED. The #603 event (maintainer rebase-carry into our fork branch; the near-revert of #587's gate fix) is recorded in §0 and D1 rev 9 (§7), with its operational consequence: fork branches are possibly-foreign-writable — re-fetch the remote head before any gated push.
- **v4 item 1's "re-fetch the full 10th comment"** → DONE at dispatch time (verbatim text in §0). The builder now VERIFIES the match and checks for comments newer than 05:34:22Z instead of re-deriving.
- **v4 item 3 (light post-merge record)** → UPGRADED to the owner-directed **installer audit** (§1 item 2): deep, read-only, rubric = D4 + the section gates; the per-merged-PR record table (v4 §10 spec) survives inside its output. Cause: the owner's directive — "this whole new installer… we need to audit that too" — plus the #603 archaeology proving the drift class is real.
- **v4 §13 point 2 ("design docs / proposals may carry the fuller credit clause")** → RETIRED by owner directive (D2 rev 5): skills.sh acknowledgment lives ONLY in PR/issue comment threads (and capability-scoped PR bodies); NEVER in any committed repository file — including design docs and markdown artifacts. See §13.

Kept alive (verified still-relevant, carried from v4):

- **Alot1z mention sweep — residual**: probes covered PRs 584–602; remaining surfaces = issues/discussions mentioning Alot1z, plus mentions created by the merge events themselves (including #603's body, which @-mentions Alot1z). Read-only; drafted replies only; posting = authorization.
- **toolscan B2→B5** — unchanged, pre-authorized, and now higher value: the seam is live upstream, so toolscan's output contract quality serves a real integration.
- **TUI logo follow-ups** — fully alive; runway cleaner than ever (#591 merged and closed; the logo PR is its own single-purpose story against main, never riding any other PR). CI expectations updated (8-job gate).
- **C1/C3 plan-only proposals** — alive as future fork artifacts. Port (old Q2 doc) parked per D1 rev 8/9.
- **Close-out KB extraction** — expanded: merge outcome, parity-trio conclusion, #599 lesson, sweep summary, the #603 near-revert lesson, the maintainer-carry pattern, wave state at handoff.

---

## 1. YOUR JOB — the re-baselined queue, in order

**Queue discipline:** authorization-gated item → record **BLOCKED(b/c)** with the exact authorization needed and continue; never stall. Only capability gaps and safety stop a thread.

1. **Session-start probe (light):** gated tools live (`doctor.mjs` ALL GREEN); re-verify §0's states cheaply via the pulls API — #591 merged / #547 open with head + MERGEABLE / #559 draft / the three plugin gates' states; verify the 10th comment on #591 matches §0's verbatim record; check for comments newer than `2026-09-05T05:34:22Z` on #547/#559/#591 (post-merge mentions feed item 3). Post the session-start report, then proceed.
2. **Post-merge verification: INSTALLER AUDIT (read-only, owner-directed; this is the deep version of v4's light post-merge record):**
   - **Scope — the whole install surface that landed in main:** `scripts/install-skill.sh` · `ix-cli/scripts/skill-harnesses.mjs` (+ its TS twin behind the registry, and the drift-guard test) · the `ix mcp install` command surface · README install claims (≈ lines 233–254) · the two `harness-install-smoke` CI jobs.
   - **Rubric:** D4 (§7) plus the §4 gates that own this surface — ix-mcp-harness (structural probes, refuse-to-destroy, pin both halves of a registration change), ix-platform-paths (Windows junctions = KB #6274; copy, don't symlink), ix-ci-release (measured case table; guard-then-act), ix-cli-contract (parseable `--json`, truthful exit codes), ix-reference-parity (README claims vs registry).
   - **Method (hermetic, zero upstream writes):** run the installer in a scratch environment (`HARNESS_HOME` + `HOME` overrides; plant a fake `toolscan` on PATH to prove it is never executed bare-name). Assert: dry-run/real agreement including exit codes; unknown harness id → error exit 1 (never a silent no-op); refuse-to-destroy on a foreign same-name skill (with and without `--force`, in dry-run and real); `--json` parses and matches the documented shape (`id`/`action`/`dest`/`detectedVia`, `dryRun`); human output silent in `--json` mode; the marker-check guard order (dry-run predicts the real `rm -rf`).
   - **Candidate findings to verify or refute with evidence (from this dispatch's raw-file probes):** (a) README line ≈250 documents `bash scripts/install-skill.sh claude gemini` — but `gemini` is NOT a registry id (`skill-harnesses.mjs`: claude/agents/codex/cursor; gemini deliberately absent) → the documented example exits 1 with "unknown harness id 'gemini'" as written; (b) the README install paragraph claims "Gemini's `~/.gemini/skills`" as a deploy target while the registry's own header says `~/.gemini` has no skills convention — a claims-vs-code drift; (c) the `grep -qs '^name: ix$'` marker can be satisfied by a foreign skill that happens to carry `name: ix` — assess and record the risk class, do not fix; (d) `rm -rf "$dest"` runs on the real path after the guard — confirm the ordering and that the preview agrees.
   - **Output:** `<run-dir>/installer-audit.md` — findings, each tagged with evidence + class (VERIFIED/OBSERVED/INFERRED); the per-merged-PR record table (v4 §10 spec: #584 · #587 · #589 · #590 · #591 · #601 · #602, plus #600/#603 closed); DRAFTED fix files held locally (e.g. a docs-only README correction) — **posting/filing anything upstream = explicit authorization**. Zero writes.
   - **Why deep, not light:** #603's archaeology proved a carried copy came within one naive merge of silently reverting #587's gate fix — the same drift class (docs claiming more than code ships) is exactly what this audit checks. The seam is now upstream's public contract.
3. **Mention sweep — residual surfaces (read-only):** issues/discussions in ix-infrastructure/Ix mentioning Alot1z beyond the already-probed PRs; #603's body (mentions @Alot1z); any post-merge mentions created by the merge events. Table of open threads with a DRAFTED reply each (never posted — posting is an upstream write needing authorization).
4. **toolscan FULL ENHANCEMENT B2→B5** (Alot1z/toolscan; pre-authorized per §5.6; each step its own gated commit + `verify`):
   - **B2 `toolscan doctor`:** one-shot invariant oracle — output schema validates against the documented shape; every reported path exists and is absolute; opt-in-only execution pin (a fake `toolscan` planted on PATH is never executed); no-bare-PATH-fallback pin; `truncated` honesty (exit 2 ⇔ truncated true).
   - **B3 fail-closed output contract:** empty stdout / truncated JSON / schema-violating output = error with reason on stderr + non-zero exit; NEVER silent "nothing found". The parser stops trusting shape.
   - **B4 hostile-input sweep of `parseToolscanOutput`:** poisoned fixtures — empty input, truncated JSON, duplicate names, path traversal (`"path": "../../somewhere"`), name colliding with a real harness bin, absurd field sizes; reject-or-sanitize with an explicit contract; pin every decisive case as a test.
   - **B5 stays generic core:** no ix logic, no KB content, no machine-specific paths. The Ix adapter stays in the Ix repo seam. (Structure: GENERIC CORE → CONTRACT → ADAPTER.)
   - **Post-merge emphasis:** the upstream seam documents the TOOLSCAN_PATH contract to the world now — B3/B4 hardening is no longer private hygiene, it's the contract's public load test.
5. **Logo follow-ups** (fork = pre-authorized; PR open = upstream-facing, authorization each):
   - (a) **Open the fork PR** `feat/tui-logo-banner` → upstream `main` — but FIRST: re-fetch the remote branch (D1 rev 9: foreign pushes are possible), rebase onto current fork-main (main moved ~20 PRs under the branch — rebase is mandatory, not cosmetic), re-run the FULL suite + typecheck + lint on the rebased head, golden fixtures + output-stability pin committed, `--bg none` decided (include or defer — one clean story), gated push with lease pinned to the CURRENT remote sha; THEN request authorization for `gh-pr.mjs create`. PR body rules per §13. The PR will run the NEW 8-job `ci-success` — it adds no URLs (links gate trivial), touches no `docs/api` (api/doc-parity trivial), touches no install surface (smokes unaffected) — verify, don't assume, after the rebase.
   - (b) Optionally implement `--bg none` transparent mode on the committed renderer with the same test discipline, as its own fork commit BEFORE the PR opens (a second PR for it is also acceptable — prefer one).
   - (c) **Golden fixtures:** commit the `output-samples/*.ans` renders as golden files in the fork, add ONE output-stability pin (current render ≡ golden at fixed width/mode; update goldens only in a dedicated, stated commit).
6. **Exit-code wave — monitor + ARMED #547 rebase plan (NEW):**
   - **Monitor (read-only):** the three plugin gates (`ix-openclaw-plugin#33`, `ix-claude-plugin#37/#38`). Per the maintainer's own words, once they land, #547 "should go straight in". Track new comments on #547/#559 after 05:34:22Z. No action on the gates — they are KageBinary's own PRs in his org's review queue.
   - **ARMED — #547 rebase (executes ONLY when BOTH: (a) the plugin gates land, AND (b) the owner explicitly authorizes the branch push):** identity routing first — #547's branch lives on Hiro-Chiba's fork; confirm with the owner which identity the builder operates for this push (the toolscan train ran as Alot1z; the exit-code wave ran as Hiro-Chiba; do not assume the builder holds both). Steps: re-fetch the remote branch (expect possible foreign commits — KageBinary demonstrated maintainers can push into PR-fork branches); rebase onto current main — expect the shared test file vs #559 (`unresolved-machine-output.test.ts`), the 8-job CI, and the docs dead-link gate checking any URL the docs commits add; full suite + typecheck + lint on the new head; gated push with lease pinned to the CURRENT remote sha; re-poll CI; report per §9. NO other #547 action — the maintainer has zero open findings and the sequencing is his call.
   - **#559: ZERO action.** KageBinary's own draft; the `resolve.ts:692` residual is his own recorded follow-up ("worth folding into it there"). We do not comment, push, or "help" unless the owner explicitly directs a comment (authorization each time).
7. **Close-out / KB extraction** (per §9 learning loop): KB rows with provenance — (i) **governance outcome**: full-disclosure + maintainer-merged-silently → link stays as their text (source: #591 thread + merged README line 240); (ii) **parity-trio conclusion** — historical fact: the merged `api-parity` job IS the gate's implementation; (iii) **#599 spec-gap lesson**: gap existed on main, commit-time parity gate + #602 closed it — the A/B tree-proof method row; (iv) **sweep summary**; (v) **NEW — the #603 near-revert lesson**: a carried copy of a gate can silently revert its upstream fix during a big merge — after any conflict-resolution merge, byte-verify carried gate copies against their upstream source (cite the `f37fd49` regex case); (vi) **NEW — the maintainer-carry pattern**: maintainers may push merge commits into PR-fork branches ("allow edits") — always re-fetch the remote head before a gated push, and pin the lease to the actual sha; (vii) the v3-sim defect lessons if not already captured (empty-reviews semantics, INFERENCE labels). Supersede near-duplicates, never stack.
8. **Final report** per §9: STATUS · READINESS · IMPLEMENTED · EVIDENCE · TESTS · RUNTIME · LIMITATIONS · NEXT (each NEXT with its authorization).

**Never silently stop, weaken requirements, hide failures, or treat unknowns as facts.**

---

## 2. OPERATING RULES (FROZEN from v3/v4 — binding)

- **AUTONOMY.** One approval = the whole queue. Execute, verify, continue. Stop only on §9's verified stops.
- **LOOP.** UNDERSTAND → GROUND-TRUTH → RESEARCH → CRITIQUE → REDESIGN → PLAN → VERIFY PLAN → IMPLEMENT → TEST → DEBUG → SECURITY → RUNTIME → REVIEW → AUDIT → NEXT. Multi-phase: DONE → EVIDENCE → LEDGER → RECALCULATE → NEXT, no re-approval.
- **BASELINE ≠ FINAL.** Audit the plan against the live repo first. Reorder/split/merge phases freely; never change intent. Every deviation: ASSUMPTION → EVIDENCE → PROBLEM → NEW DESIGN → REASON → CONSEQUENCE.
- **PLAN FIRST.** No code before archaeology + risks + verification design. Stale plan → STOP → REPLAN.
- **GROUND TRUTH.** Inspect live before claiming: files · git · API · tests · CI · remote. Plans/docs/prior reports are evidence, not truth. Tag every claim FACT / INFERENCE / UNKNOWN (KB classes: VERIFIED / OBSERVED / DERIVED / INFERRED / HEURISTIC / UNKNOWN). Never silently upgrade INFERRED → VERIFIED. Runtime claims need runtime evidence; BUILD ≠ RUNTIME SUCCESS.
- **ARCHITECTURE.** GENERIC CORE → CONTRACT → ADAPTER → EXTERNAL SYSTEM. Adapters are probed, absent-safe, never load-bearing.
- **FAILURE.** FAILURE → CAPTURE → CLASSIFY → ROOT-CAUSE → SMALLEST-FIX → VERIFY → HARDEN. Never weaken a gate to pass it.
- **STATE.** Persist to disk, never chat: run dir `E:/E-github-repos/Ix-remap/repo-fork/docs/autonomous/<run-id>/` (state.json + plan + evidence). **All relative paths in this file resolve from the workspace root `E:/E-github-repos/Ix-remap`.** The run dir is the lossless handoff.
- **SEARCH BEFORE CREATE.** KB before any new row; supersede near-duplicates, never stack.

## 3. SKILLS TO APPLY (FROZEN from v3/v4 — enforce, not decorate)

- **/agent-principles — the hard gate** (`C:/Users/Mose/.agents/skills/agent-principles/tools/`): EVERY upstream-facing artifact through the gated surface. `doctor.mjs` at session start; `agent-principles-digest.mjs --task "<task>"` for the policy pack. **GATE-MISSING STOP:** if the gated surface is unreachable (tools absent, token unresolvable, doctor failing), upstream writes are IMPOSSIBLE — report BLOCKED (b/c), continue read-only and own-repo items only; "the gate is missing" NEVER becomes "writes proceed ungated." Known client limitation: raw-accept requests crash in `res.json()` — fetch file contents via the JSON envelope and base64-decode.
- **/agent-knowledge**: `l4 auto --task "<item>"` before each item; cite [KB #NNNN — class]; capture OBSERVED lessons after each item.
- **/agent-yoke + conduit**: multi-surface items route through `node E:/E-github-repos/conduit/cli/conduit.mjs route "<task>" --adapter kb,yoke` FIRST. Absent CLI → degrade silently (routing only — never the gate).
- **Ix section agents**: `node E:/E-github-repos/agent-knowledge-base/tools/ix-agent-triage.mjs "<task>"` → load the matched `skills/ix-sections/<id>/SKILL.md`. Stances decide pass/fail (§4).
- **/autonomous-implementation-pattern**: state on disk; continue past blockers.
- **/thinking-review-expert**: score reasoning before anything durable ships (<50 extract nothing).
- **/ix + /architect**: structural questions via `ix map`/`ix search`, never memory; boundaries before multi-module changes.
- Caveman family: chat may compress; every persisted artifact stays normal prose.

## 4. IX SECTION GATES (FROZEN from v3/v4)

- **ix-contribution / lifecycle**: canonical gated commit+PR sequence; the 16-step discovery→PR gate; red/green + mutation mandatory; fork-as-evidence, never competing fix.
- **ix-cli-contract**: output a parser cannot parse, or an exit code a caller cannot trust, is a defect. Warnings never corrupt machine output; truncation visible and counted; exit codes are contracts.
- **ix-ci-release**: measured case table or it does not ship; releases run the ACTUAL install path; `::error::` unreachable without pipefail; guard-then-act.
- **ix-mcp-harness**: capability metadata is a security boundary; host listings parsed structurally; an installer never `rm -rf` what it does not own; presence probes must be verifiable (#6455); pin BOTH halves of a registration change.
- **ix-platform-paths**: binary + path-form are matched pairs, decided by TRYING; platform by `uname`/`process.platform`, never env vars; Windows junctions are KB #6274 hazards — copy, don't symlink.
- **ix-reference-parity**: every registered command/flag has a doc row; a doc change that cannot point at the rule it satisfies does not pass.
- **ix-review-upstream**: mutation-first both directions; assert the full decision; run the FULL test file; branch ancestry ≠ PR scope; one clean story per PR; self-review posted in-thread; pre-existing defects filed separately with measurement.
- **ix-ingest-graph / ix-context-query**: untrusted input confined + validated at the owning layer; an answer about the wrong workspace is worse than no answer.

## 5. HARD POLICY — COMMIT / PR / IDENTITY (FROZEN, non-negotiable)

1. **API-only commits and PRs.** Commits: `gh-commit.mjs snapshot <owner/repo> <branch> <localdir> <msgfile> --paths <filelist>` → `push <owner/repo> <branch> <full-40-char-sha> --force-expect <oldSha>` (new branches: POST `/git/refs` at the base head first). PRs: `gh-pr.mjs create/edit/close/reopen/get` with title+body read verbatim from files. NEVER `git commit` from the harness, `gh pr create`, or any built-in agent PR flow (KB #6590). Read-only git/gh fine.
2. **Token discipline.** `gh-token.mjs --print` is THE single token owner (`IX_GH_TOKEN_FILE` first). The user never sees a credential popup.
3. **No attribution footers, ever.** No Co-Authored-By, no "Generated with", no harness/session/tooling mentions in commits, PR bodies, comments, or handoffs. Owner identity is the git AUTHOR env: `Alot1z <alot1z@users.noreply.github.com>`. First commit in a repo: match its `git log` conventions (KB #6314).
4. **Gated push sequence.** Pre-push range scan (`git log --format='%B' <range> | scan-stdin.mjs`, exit 1 = PUSH REFUSED) → lease-armed push pinned to the expected old sha → post-push remote re-scan via compare API. **v5 note (D1 rev 9): the "expected old sha" must be re-fetched immediately before the push — upstream maintainers have demonstrated they push merge commits into our PR-fork branches (#603: b652008, 538c249 into `feat/skill-install-toolscan`); a stale expectation will refuse a legitimate push or, worse, mask a foreign head.** A footer that reached a remote is an incident: force-push the corrected range immediately and record it.
5. **Verify before done.** Remote text = file contents, zero watermark lines (`gh-commit.mjs verify`, `gh-pr.mjs get`).
6. **Auth boundary — one rule.** **Owner-repo writes are pre-authorized**: anything under `Alot1z/*` (toolscan commits, Ix-remap fork pushes incl. `--bg none`) goes through the gated surface without asking. **Everything touching `ix-infrastructure/Ix` (and any other-owned repo, incl. Hiro-Chiba's fork branches and the plugin repos) needs explicit user authorization each time**: PR opens (incl. the logo PR), upstream comments, pushes to PR branches, merges. Say exactly what to authorize and stop that thread. CAPABILITY ≠ AUTHZ.
7. **No secrets** in any artifact — token values never enter KB rows, docs, skills, or PR text; only env names and file paths.
8. **Windows hazards.** `git worktree remove --force` walks junctions and deletes the TARGET (KB #6274) — prefer plain copies. Git Bash `/tmp` ≠ `C:\tmp`. PowerShell 5.1: `curl.exe` not `curl`, `$ProcessId` not `$Pid`.

---

## 6. SUBSTRATE — re-probed / re-confirmed 2026-09-05 (re-probe before relying on any row older than your session)

| Fact | Class |
|---|---|
| #591 merged `2026-09-05T05:32:14Z` via `39d07342a7`; head at merge `538c2498cc` on `feat/skill-install-toolscan`; KageBinary merge-carried our branch through moved main (`b652008`, `538c249` pushed into the fork) | VERIFIED — API + thread probes |
| Comment `5549703398` (2026-09-05T05:34:22Z, KageBinary) = #547's state of record: ready on merits, gated on `ix-openclaw-plugin#33` + `ix-claude-plugin#37/#38`, zero open findings; residual `resolve.ts:692` → fold into #559 | VERIFIED — API |
| #547 open (Hiro-Chiba, 9 commits, head `5280ec6`, MERGEABLE, 7/14 tasks, fixes #546); #559 open DRAFT (KageBinary, `c60812e`, closes #539) | OBSERVED — browser probe |
| Plugin gates open ("Review required"): `ix-openclaw-plugin#33` (uncovered `hooks/ix-read` path caveat) · `ix-claude-plugin#37` · `ix-claude-plugin#38`. Merged consumers: `ix-opencode-plugin#20/#21`, `ix-cursor-plugin#26`, `ix-gemini-plugin#29` | OBSERVED — PR-list probes |
| Installer in main: `scripts/install-skill.sh` (208 lines: registry-driven, dry-run/force/json, refuse-to-destroy, TOOLSCAN_PATH opt-in); `ix-cli/scripts/skill-harnesses.mjs` (216 lines; registry = claude/agents/codex/cursor; HARNESS_HOME override); `ci-success` = 8 jobs incl. two harness smokes (one on a real windows-2022 runner) | VERIFIED — raw-file probes |
| README: toolscan link at line 240 (upstream's accepted text); install section ≈233–254 documents `install-skill.sh claude gemini` + claims Gemini `~/.gemini/skills` as a target — vs a registry that deliberately excludes gemini → CANDIDATE drift for the audit | VERIFIED — raw-file probes (drift itself = candidate until the audit runs behavior) |
| `openapi.yaml`: `POST /v1/decisions` at :524 (the 10th-comment drift — fixed); `release_version` at :981 (#602) | VERIFIED — raw-file probes |
| Rules merged in main: #565 (non-zero exit = breaking change for plugins) · #551 (invalid option values exit non-zero) · #566 (diff `unresolved_target` slug, `a2cab21`) | OBSERVED — thread cross-refs |
| KageBinary's #603 body carries a Claude Code watermark + session URL — observed read-only, NOT ours to mention, mirror, or fix upstream; our zero-footer policy stays strictly stricter | OBSERVED — read-only |
| The 10th #591 comment (parity heads-up) — verbatim captured in §0; its open offer mooted (drift fixed in main) | VERIFIED — thread probe |
| toolscan: commands scan(0/2-truncated) · list · check · snapshot · diff · missing · drift; .mjs/.ts duplication guarded by byte-identity tests + 20k-arg fuzz; LICENSE real (B1 done, `2800f82`) | VERIFIED — repo reads + API probe |
| skills.sh (vercel-labs/skills): source formats, credential discipline, download caps — pattern reference for C1/C3 only; Ix hosts its own skills; `npx skills add ix-infrastructure/Ix` already works | VERIFIED — repo read |
| prompts/ untracked; Q3-audit.json from run `run-2026-09-05-item2-sweep` exists as historical evidence | OBSERVED — local |

## 7. D-LOG — decisions (rev-tracked; supersede, never delete)

- **D1 · toolscan seam in #591 — rev 9 · RESOLVED (KEEP-BY-MERGE), now with the maintainer-carry event.** Full lineage: rev 7 disclosed the self-insulated-Ix goal with preference order port > keep > split; rev 8 recorded the merge-without-reply outcome. Rev 9 adds what v4 could not know: the maintainer personally rebase-carried our branch through a heavily-moved main — resolving a consequential conflict (the carried parity-gate copy predating #587's `f37fd49` fix) — and pushed his merge commits (`b652008`, `538c249`) INTO our fork branch expressly to preserve our authorship, then merged 25 minutes later. Consequences: (a) the merged README's toolscan link (line 240) is upstream's text — leave it, never re-litigate unprompted; (b) the port (old option 1) stays parked — nothing in the #603 event requests it, and the maintainer's invested effort is a strong want-signal for the seam AS SHIPPED; (c) toolscan B2–B5 hardening stays high priority — the contract is publicly load-bearing; (d) OPERATIONAL: fork branches carrying open upstream PRs are possibly-foreign-writable — every gated push re-fetches the remote head first and pins its lease to the CURRENT sha (§5.4); (e) the near-revert lesson → KB row (item 7(v)); (f) performative-agreement ban (KB #6470) applies to any future reply on the merged thread: state facts, no gratitude-performance. Rev 1 (strip-as-accident) VOID; revs 2–8: history (v4 §7).
- **D2 · skills.sh — rev 5 · OWNER-TIGHTENED credit placement (binding).** The acknowledgment "Inspired by skills.sh (vercel-labs/skills)" appears ONLY in PR/issue COMMENT THREADS — and, capability-scoped per rev 4, in PR bodies of artifacts that actually contain the capability. It is NEVER written into any committed repository file. This supersedes v4 §13's design-doc allowance: a design doc committed to a repo (including the fork's `docs/`) is a committed file — zero credit; the covering PR/issue comment carries it. C2 remains KILLED (rev 4). Rationale: files travel (forks, mirrors, vendored copies) and speak behavior; provenance belongs where the discussion lives.
- **D3 · BMAD-METHOD (unchanged).** Orthogonal; only transferable idea: module sets.
- **D4 · installer quality bar — now the AUDIT RUBRIC for the landed installer.** Registry-driven (hosts.ts descriptors), structurally verified probes (an always-true `~/.vscode`-style probe must not list as detected — #6455), structural parsing of host listings (#6525), refuse-to-destroy-what-you-don't-own, truthful `--dry-run`, hermetic on clean machine and CI, external discovery = opt-in evidence, never the decider. Same bar as when it was our build standard — now applied to verify what actually landed (§1 item 2).
- **D5 · two questions, two surfaces (unchanged).** Seam governance = RESOLVED (merged). Ecosystem distribution of `skills/ix` = LATER, its own proposal, framed as "proposal" never "disclosure", D2 rev 5 credit rules apply (comment-thread only).

### 7.1 The posted governance comment (FROZEN — historical record of what `#issuecomment-5547541291` contains, verbatim)

> One governance flag, then I'll leave you alone. toolscan — the discovery seam in this PR — is my own project (Alot1z/toolscan). The seam is deliberate and fully tested — the mistake was mine: I tied Ix's docs to my own repo and let it ride without putting that decision in front of you. For context on where I stand: I never meant Ix to carry an external dependency for this — toolscan was my step toward this capability living self-contained inside Ix, and a native port finishes that. So:
>
> 1. **Port it natively — my preference.** I donate a self-contained port of the discovery into Ix core: a bounded scan of the common install roots with the same contract (bounded, `truncated`-truthful, opt-in env gate, zero external dependencies, MIT). Ix depends on nothing outside this repo and nothing of mine is listed anywhere.
> 2. **Keep the seam as-is.** Entirely your call, and I'll leave it in place if you make it — the disclosure stands either way.
> 3. **Split it out.** I rework this PR back to the embedded-probe installer and open a separate `feat(mcp): optional TOOLSCAN_PATH discovery seam` PR so the decision gets its own review. (~10–12 of the 20 files; the smoke job splits in two.)
>
> Whichever you pick, I'll execute it as-is. (No other changes in this comment; the PR itself is untouched.)

## 8. RESPONSE PLAYBOOK — ARCHIVED (RESOLVED)

**Outcome: MERGED-without-reply (and merge-carried by the maintainer himself, per the #603 event) → the disclosure stands on record; the merged README keeps the toolscan link as upstream's own accepted text.** No branch is armed. Historical branch semantics (kept for the record):

- PORT (if ever chosen later) → fresh proposal/issue, never a comment on the merged thread; nothing personal remains upstream after the port.
- KEEP (effectively chosen) → done; toolscan named only where upstream already named it.
- SPLIT (moot post-merge) → future seams: one capability per PR from the start.
- Any future maintainer message on the topic → reply with facts, no performative agreement (KB #6470), through the gated surface, with authorization.

(The #547/#559 exit-code wave is a DIFFERENT surface — tracked in §14, not governed by this playbook.)

## 9. REPORTING CONTRACT + STOPS (FROZEN)

1. **Session-start report:** tooling probe (gated tools live, conduit live, skill roots, doctor verdict), routing decision, plan + oracle for the first item. Post, then proceed.
2. **Phase report after EVERY item:** `ITEM <id> — DONE|PARTIAL|BLOCKED · oracle: <quoted acceptance oracle + result> · evidence: <commands + outputs, KB ids> · deviations: <six-step log> · next: <next item>`.
3. **Decision journal:** every choice the plan didn't make gets a D-LOG row (rev-tracked). A decision that lives only in chat is a lost decision.
4. **Final report:** STATUS · READINESS · IMPLEMENTED · EVIDENCE · TESTS (red/green where applicable) · RUNTIME (what was actually exercised) · LIMITATIONS · NEXT (each with the authorization it needs).
5. **Honesty bar:** unexercised claims stay INFERRED; blocked reports blocked; never fabricated done.
6. **Verified stops only:** (a) queue done + oracles green · (b) blocked — capability missing (say which) · (c) auth boundary — name the exact write to authorize · (d) safety · (e) uncertainty — ask once in the report, continue with reachable work.

## 10. POST-MERGE RECORD SPEC (folded into §1 item 2's audit output)

Read-only; persists at `<run-dir>/installer-audit.md` + `<run-dir>/post-merge-record.json`; human tables land in the final report. Per merged PR (#584 · #587 · #589 · #590 · #591 · #601 · #602, plus #600/#603 closed):

1. **State:** merged_at · merge commit SHA · squash vs merge-commit · base.
2. **What landed:** one line each (title-level; merged content is upstream's reality now).
3. **Threads:** any comment arriving AFTER merge (feeds the sweep); unresolved reviewer asks, if any.
4. **Evidence-class discipline:** every row tagged with its probe endpoint (pulls API / raw file / issue-comments). No INFERENCE row reported as fact.
5. **Zero writes upstream.**

## 11. (RETIRED — README draft)

The v3 README installation draft and its PORT/KEEP/SPLIT variant rules are retired: merged main's README is the shipped reality (including the seam text the maintainer accepted — and its own `claude gemini` drift, which is now an AUDIT finding candidate, not our edit; we draft nothing unless asked).

## 12. TUI LOGO — state + contract (own-repo surface; its own clean PR; NEVER rides any other story)

- **Canonical renderer:** `repo-fork/scripts/render-logo.mjs` @ `d2876f5` (zero-dep: PNG chunks → inflate → unfilter → coverage-thresholded supersampling → flat 5-tone snap → half-block RLE). CLI surface, verbatim from the module: `node scripts/render-logo.mjs [--width N] [--color auto|truecolor|256|ascii] [--file path] [--json]` · `--width` integer 8..120 (rows = clamp(round(cols·h/w/2), 2, 60)) · exit 0 ok · 1 usage/file · 2 unsupported/truncated · `auto` = NO_COLOR or TERM=dumb or FORCE_COLOR=0 → ascii; COLORTERM contains truecolor or FORCE_COLOR=3 → truecolor; TERM set → 256; else ascii · errors → stderr (JSON on `--json`), payload → stdout only.
- **Banner wiring:** `ix-cli/src/cli/banner.ts` spawns the renderer (`--width 48`), stderr-only via `emitSetupNotice`, absent-safe (renderer/asset missing → plain-text heading, never an error). The PNG (already in upstream main, sha256-identical) is the only art ever maintained — the PR adds NO asset, only renderer + wiring + tests + goldens.
- **Test discipline to preserve (the pin list IS the contract):** 10 pins in `bootstrap-notice.test.ts` — (1) banner renders on stderr not stdout; (2) absent-safe renderer → plain-text heading; (3) absent-safe asset → plain-text heading; (4) NO_COLOR → zero escape bytes (mutation-checked: flip the guard, test goes red); (5) renderer exit 2 → plain-text heading, never a crash; (6) renderer exit 1 → plain-text heading; (7) lib≡CLI byte-identity (renderLogo() output === CLI stdout, byte-for-byte); (8) JSON mode honesty block (ok/width/charRows present); (9) width clamp honors the 8..120 bound; (10) empty/stdout-never-corrupted when banner is suppressed. Full suite green before any push. **Do not weaken a pin to pass a change — fix the change.**
- **PR readiness (item 5):** re-fetch `feat/tui-logo-banner`'s remote head FIRST (D1 rev 9); rebase onto current fork-main (main moved ~20 PRs — the branch predates the entire merge wave); full suite + typecheck + lint on the new head; golden fixtures committed (`output-samples/*.ans` + one output-stability pin); `--bg none` decided; THEN request authorization to open the PR upstream. Expect the 8-job `ci-success` (§0.3) on the PR head.
- **Credit placement:** §13 — the PR body MAY carry one aesthetic-inspiration line (optional; the renderer is original zero-dep code); the code files carry ZERO attribution.

## 13. CREDIT & ATTRIBUTION PLACEMENT RULES (rev 5 — owner-tightened; answers the owner's standing question)

**Where inspiration, credit, and personal mentions live — and where they never live:**

1. **PR / issue comment threads: the sanctioned surface.** skills.sh acknowledgment ("Inspired by skills.sh (vercel-labs/skills)") appears ONLY here — and only in threads covering artifacts that actually contain the capability being credited (D2 rev 4 capability-scoping, unchanged).
2. **PR bodies:** allowed as thread-surface (not committed files), same capability-scoping. Prefer the comment when in doubt.
3. **Actual committed FILES — including design docs and markdown artifacts: ZERO attribution. No exceptions.** No inspiration comments in source code, no "inspired by" headers, no credit lines in `docs/`, no tool mentions in file comments, no Co-Authored-By, no footers. This RETIRES v4's design-doc allowance (D2 rev 5): a design doc committed to any repo — the fork's `docs/` included — is a committed file; its covering PR/issue comment carries the credit instead. (Legal exception: LICENSE files.)
4. **READMEs:** no personal-repo links added by us, ever. The ONE toolscan link in upstream main's README (line 240) is there because the maintainer merged it with disclosure on record — that's their text, untouched.
5. **The governing principle:** *threads and PR bodies explain provenance; files carry behavior.* If a future reader needs to know why a design exists, the answer lives in the PR thread and the covering comment — never in a code comment or a committed doc.

## 14. EXIT-CODE WAVE TRACKER (NEW — the surface v4 missed; the owner's pinpoint directive made structural)

State at dispatch time (re-verify at session start):

| Piece | Author | State | Gate / note |
|---|---|---|---|
| #547 `fix(cli): fail unresolved graph commands` (fixes #546) | Hiro-Chiba | open · MERGEABLE · 9 commits · head `5280ec6` · "no open findings" (comment `5549703398`) | `ix-openclaw-plugin#33` (incl. its uncovered `hooks/ix-read` path) + `ix-claude-plugin#37/#38`; ≥1 approving review required (KageBinary + josephismikhail) |
| #559 `fix(locate): exit non-zero for an unresolved target` (closes #539) | KageBinary | DRAFT · step-2 · `c60812e` | same gates; folds the `resolve.ts:692` ambiguity residual |
| Plugin consumer PRs | KageBinary | #33/#37/#38 open ("Review required") · #20/#21 (opencode), #26 (cursor), #29 (gemini) merged | his org's review queue / ruleset permissions — NOT ours |
| `resolve.ts:692` residual (`reportAmbiguousTarget` hardcoded "text", no exit code → `ix locate` exits 0 on ambiguous) | — | recorded by KageBinary in `5549703398` | his follow-up, into #559 |
| Rules in main | KageBinary | #565 (exit flip = breaking change) · #551 (invalid option values exit non-zero) · #566 (diff slug) merged | the contract context any future exit-code work must cite |

Standing orders: **monitor-only** on the gates; the **ARMED #547 rebase** fires only on gates-landed AND owner-authorized push (§1 item 6, with the identity-routing question answered first); **#559 = zero action**; whoever merges second rebases `unresolved-machine-output.test.ts`; every write needs authorization (§5.6); never "help" uninvited — the sequencing is the maintainer's own design, and it is working.

## FINAL RULE

Spec = starting point, not literal command. AUDIT → IMPROVE → REPLAN → BUILD → VERIFY → REVIEW → GATE → RECORD → CONTINUE. The toolscan train is merged and closed — what remains is the installer audit, the wave watch, own-repo execution (toolscan B2–B5, logo readiness), residual sweeps, and knowledge capture. Close the loop on every item; report per §9.
