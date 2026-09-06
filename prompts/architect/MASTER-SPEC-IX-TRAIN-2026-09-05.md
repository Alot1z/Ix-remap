# IX MASTER SPECIFICATION — PR Train, Installer Architecture, Toolscan, TUI Banner

**Prepared 2026-09-05 · Analysis-phase output · Companion to `BUILDER-PROMPT-COMPLETE.md` (which remains the canonical process/auth/dispatch file). Live-state precedence, highest first: (1) a fresh live probe run now, (2) this spec's dated addenda below — **the sole owner of the execution-round record** (the builder prompt carries no state narrative since the 2026-09-05 late round), (3) the dispatch's §0 rows — currently STALE (they still pin `17d2da44`), (4) this spec's body. Where ranks disagree on live state, the higher rank wins — never act on a lower-ranked stale pin.**

**Scope filter (owner directive):** everything not serving the Ix PR train is classified OUT and excluded from actionable scope (surviving only as named "independent work" rows). Excluded: KB/skill housekeeping, junction-hazard KB entries, ix-contribution skill rewrites, single npx skill-package install, docs-scan workflows, Discord/identity work.

**All relative paths in this file resolve from the workspace root `E:/E-github-repos/Ix-remap`.**

> **LIVE DRIFT ADDENDUM (probed 2026-09-05, after this spec was written — supersedes the pre-push state below where they disagree):**
> The fix head was **pushed** through the gated surface (Tier A) and extended. Live-verified via public API: `feat/tui-logo-banner` and PR #605 head = **`2f9604772c`** (draft, open, unmerged). Commit stack beyond the spec's `17d2da44`:
> - `bbf2212a7` fix(cli): ship the banner renderer and asset inside the package (F1)
> - `927e2e50a` test(cli): make banner pins hermetic across CI runners
> - `f4b6d986a` feat(cli): add `--bg none` transparent mode and golden output fixtures — **the §8 "backlog, does not belong" item landed on the branch by owner action; treat §3/§8/§15's `--bg none` exclusion as superseded on this point**
> - `69015df42` feat(cli): render the repo logo as the setup-notice banner
> - `2f9604772` test(cli): give the banner render pins CI-sized budgets
> CI on the head: **RESOLVED GREEN** (re-probe 2026-09-05T22:18Z, superseding the earlier in-flight snapshot): **28 success · 3 skipped (`compass`, `verify-install`, `release` — expected skip-class jobs) · 0 failures · 0 in flight.** The documented CodeQL infra-race residual **did not recur — CodeQL passed** on this head. Additional resolved facts from the same probe: (a) **the point-per-point review response is already posted** — Alot1z issue comment `5554982515` @ 2026-09-05T21:43:23Z, covering all three findings + the design note (⚠️ it names head `17d2da44`; the branch head has since advanced to `2f9604772c` — **the head-name precision item is SUPERSEDED by the owner's ticked mark-ready go (2026-09-05): folding the final head name into the release note is mandated by builder item 8; no separate owner call remains**); (b) KageBinary's 18:54Z comment is the **already-known** 3-finding review (made at `c05c3a77`, predates the fix stack) — **no new human reviewer activity since**; (c) PR base = main `8c0e6b00` and the branch is based on it (the response itself states "rebased on main `8c0e6b00`") — the rebase-before-mark-ready precondition is **satisfied**. **Net: every gate for mark-ready except the owner's explicit Tier B go is now closed.** **Canonical-dispatch pins are stale** (`BUILDER-PROMPT-COMPLETE.md` §0 still pins `17d2da44`), so `dispatch-check.mjs --live` is red by design until its owner refreshes those pins; fast mode is ALL GREEN. A builder must verify-then-continue from the live head, never re-push the fix stack.

> **EXECUTION ROUND ADDENDUM (2026-09-05 late round — the four owner-authorized follow-ups were EXECUTED; re-probed read-only via public API + local repos the same day; supersedes the body where they disagree):**
> 1. **Toolscan skill-package pushed + draft PR opened.** Three git-binary pushes failed on transport (`sideband disconnect`; range tiny — 5 files, top blob 239 KB), so the push went through the **API surface** (blob→tree→commit, verbatim messages, true author identity): remote head **`47fe7aa8`**, **tree `905abdb3` byte-identical to local `bdc5775^{tree}`** — verified live. Shas differ because GitHub's commits API normalizes dates/offsets (KB #6668); tree+message+identity is the honest equivalence contract. **Alot1z/toolscan#1** open as draft, base main, footer-free remote range.
> 2. **#605 CI: one real failure found and fixed in the same round.** Post-push, `Test (ubuntu · node 22)` failed — 3 banner pins timed out at the 5s default (in-process full-PNG decode under v8 coverage; all other matrix jobs passed — same class as the earlier hermeticity fix). Fixed with the byte-identity-pin pattern: 15s budgets + WHY comments, 23/23 local, typecheck clean, committed `2f9604772`, gated lease-push, re-scan clean. Final: **28 success · 3 expected skips · 0 failures · CodeQL passed** (re-verified live). **#605 remains draft — mark-ready NOT executed** (`draft=true`, `requested_reviewers=none` — no auto-request recurrence).
> 3. **Upstream issues opened with the owner's go:** **#611** (`install-skill.sh` harness-id output labels — the U1/U2 polish) and **#612** (interactive `ix install` proposal — one menu over the verified engine, interactive = pre-fill over the same non-interactive flags, JSON parity, refusal guard unchanged, non-goals listed; cross-referenced to #611 as prerequisite polish). Both open.
> 4. **KB extraction landed:** **#6666–#6670**, all OBSERVED/CANDIDATE with provenance anchors (source-repo/PR/session): re-scan compare-base = main; `gh api -f title=@file` literal-string trap; commits-API date normalization → tree+message identity; absent-safe probe-then-import; SGR-background normalization in ANSI→PNG converters.
> Records: local record commits `d2b34db` + `3c77e77` (NO push); scratch `.fix605/repo` at `2f96047`; toolscan local branch == `bdc5775`. **Remaining owner-gated queue:** mark-ready (`gh pr ready 605`, Tier B go — every precondition live-verified), toolscan PR#1 ready-state after owner body review, KageBinary re-review watch with the prepared response playbook, optional interactive TUI prototype on `chore/installer-ux-polish`, installer-ux branch push.

---

## 1. EXECUTIVE UNDERSTANDING

The owner is not building "a logo PR" or "a README fix." The real product is a **contribution campaign on ix-infrastructure/Ix** whose currency is **credibility with the maintainer (KageBinary)** and a **portable, verifiable install surface**. Live state (probed 2026-09-05, main head `8c0e6b00`):

- The September PR train (#584–#591) **merged**, including the toolscan seam — merged **without reply** to the governance comment (KEEP-by-merge, D1 rev 9). The port-native plan is therefore **dead as an active task**; it revives only if the maintainer initiates it.
- **#609 (installer README corrections) is MERGED** — KageBinary verified all four corrections against the registry and merged it standalone, explicitly decoupling it from #605. **This thread is closed. No further README change is justified.**
- **#605 (TUI logo banner) is the one open draft** — reviewed by KageBinary with 3 findings (1 blocking packaging, 1 real CodeQL TOCTOU/FIFO, 1 unreferenced PNGs) plus an in-process-import design note. A complete fix head `17d2da44` (13 files: renderer+asset moved into `ix-cli/`, in-process dynamic import, npm-pack + release-staging deliverability pins, open-once/fstat read, PNGs dropped) is **verified locally (1755 passed / 21 skipped, typecheck clean, compiled banner renders in the installed layout, npm pack carries all 3 inputs) — superseded by the LIVE DRIFT ADDENDUM below: pushed as a stack ending at `2f9604772c`, CI resolved green, review response posted.**
- Parallel independent branches held locally: installer UX polish (`chore/installer-ux-polish` @ `44fbb54`), toolscan skill-package work (`feat/agent-skill-package` @ `c1a9a16`), toolscan B-queue residuals, C1/C3 plan-only proposals, an installer UX upstream-issue draft — all gated on the owner's explicit go, all draft-first (RULE 0). *(Branch/issue states here as of the original authoring — the EXECUTION ROUND ADDENDUM above supersedes: toolscan branch now `bdc5775`, pushed via API surface as draft PR Alot1z/toolscan#1; the UX issue is opened as #611; #605 pushed to `2f9604772c` with CI green.)*

The larger vision — a **generic installation core with per-ecosystem adapters** — is real and preserved as architecture doctrine, but it is a **design doctrine for future work** (C1/C3, toolscan's own installer), not something to force into the closing PRs of this train.

## 2. USER VISION (formalized)

> Ix's install/registration surface should become a **universal, portable, production-grade tooling ecosystem**: one installation engine implementing common behavior (probe → decide → install → report, idempotent, dry-run, machine-readable, refuse-to-destroy, platform-correct), with **ecosystem-specific behavior isolated in adapters** (Claude, Codex, Cursor, Gemini, OpenCode, OpenClaw, MCP, skills, plugins). Discovery is bounded and truthful (truncated-honest), paths are never developer-machine-specific, and interactive mode is a UI over the same engine automation uses.

Layered correctly:

| Layer | Content |
|---|---|
| **A. Vision** | Self-insulated Ix — capability lives in Ix core; no external/personal repo listed; adapters per ecosystem (D1 rev 4's "self-insulated Ix" is the governing formulation) |
| **B. Architecture** | GENERIC CORE → CONTRACT → ADAPTER → EXTERNAL ECOSYSTEM; probes verifiable (KB #6455); registry-driven; refuse-to-destroy; truncated-truthful output |
| **C. Current implementation** | #605 fix head; installer UX branch; toolscan residuals; hermetic demo rig — all already built, awaiting release/push decisions |
| **D. Follow-up roadmap** | C1 manifest registry, C3 lifecycle verbs, toolscan skill+installer, MCP/skills installer contract, interactive installer — plan-only, maintainer- or owner-gated |

## 3. CURRENT OBJECTIVES (immediate ≠ vision)

**Immediate (this train) — decisions and state only; execution steps, probes, and mechanics live in `BUILDER-PROMPT-MASTER-2026-09-05.md`:**
1. **#605 fix stack: pushed and green** (state: head `2f9604772c`; CI/CodeQL result held once in the LIVE DRIFT ADDENDUM above — resolved green, zero failures; review response posted as `5554982515`) — decision: mark-ready only at train release on owner go; it stays draft until then.
2. **Installer-UX branch: UNRECOVERABLE** (ground-truthed 2026-09-05 — `chore/installer-ux-polish` @ `44fbb54` on neither remote nor any local clone/worktree; object unreachable). Decision: recovery = re-derive the diff from the kit + issue #611's promise onto current main, owner-gated before any push (builder item 6).
3. **Train release: READY on owner go** (Tier B) — preconditions were satisfied at authoring (CI green, base = main `8c0e6b00`, `requested_reviewers=none`); they must be re-probed fresh at execution (builder item 8 owns the staged mechanics).
4. **Toolscan: own-repo work executed** (state: skill-package pushed via API surface → draft PR Alot1z/toolscan#1, tree-identical per KB #6668; ready-state on owner go after body review). B4(b) stays BLOCKED(b/owner) pending the contract-delta doc (§16 item 5); B4(a) parity filing stays post-train-release.

**Explicitly deferred (do not fold into #605):** C1/C3, interactive installer *(proposal now OPEN as upstream issue #612 — implementation still deferred, plan-only until its PR)*, MCP-plugin installer unification, toolscan skill-package release *(superseded in part — pushed as draft PR Alot1z/toolscan#1; release/merge is the owner's)*, UX upstream issue *(superseded — opened as #611 with owner go; nothing further without go)*, logo `--bg none` backlog *(superseded — shipped on the fix stack as `f4b6d986a`, see the addendum)*.

**Execution surface pointer:** the self-executable work queue (probe → command → stop-point per item), the staged mark-ready mechanics, the drift re-anchor protocol, and the KageBinary re-review playbook live in **`BUILDER-PROMPT-MASTER-2026-09-05.md`** — §3 above records decisions and state; the builder file is the execution surface. Do not duplicate queue steps here.

**Out of scope by owner filter (recorded, not specced):** KB/skill housekeeping, junction-hazard entries, ix-contribution skill rewrite, single npx skill-package install, docs-scan workflows, Discord identity work — all independent work.

## 4. SOURCE OF TRUTH MAP

| Source | Type | Authority | Current? | What it proves |
|---|---|---|---|---|
| `ix-infrastructure/Ix` live API (main `8c0e6b00`) | Ground truth | **Absolute** | Yes (2026-09-05) | #609 merged standalone; #605 reviewed; wave merged |
| `prompts/architect/BUILDER-PROMPT-COMPLETE.md` v7 | Dispatch ledger | High (self-refreshing) | Yes — canonical dispatch | Executed-state, §0.5 reconciliation, playbook, auth tiers |
| `repo-fork/docs/autonomous/run-2026-09-05-item9-train-bundle/state.md` + `REVIEW-ROUND-PLAN.md` | Run record | High | Yes — last round recorded same day | KageBinary's 3 findings verbatim; Track A–F plan; 1755/21-skip proof |
| `repo-fork/docs/autonomous/run-2026-09-05-item2-installer-audit/installer-audit.md` + `installer-ux-polish-kit.md` | Evidence docs | High for findings a–e | Yes (verified against main `39d0734`→`e8ab1926`) | README drift was real and is now merged-fixed; UX kit CI-compat lines |
| `prompts/architect/reviews/IX-CAMPAIGN-COMPLETE-2026-09-05/` package | **Archive of the pre-#605-review state** | Historical only | **Superseded** — it predates the KageBinary review and the fix head | Renderer pipeline, goldens, zip deliverable, v6 status report |
| `prompts/architect/MISSION-*.md` (tombstoned) | History | None — do not execute | Tombstoned with headers | Decision lineage D1 rev 1→9 |
| Chat transcript (`prompts/THE CHAST FOR THE WHOLE CONVERSATION FOR.md`) | Requirements evidence | Low — claims need re-probe | Mixed (some pre-merge) | Owner intent: framing rules, self-insulated Ix, C2 kill |
| Fork working tree (`feat/context-mode-conflict-v2`) | Local record | Low for upstream truth | Contains local record commits (NO push) | Provenance of architect corpus; ⚠️ personal paths inside |

**Contradiction found and resolved:** the campaign-complete package README says "TUI logo never submitted upstream by design" — **stale**; #605 is a live draft. The package is a pre-review snapshot; the dispatch v7 wins.

## 5. REQUIREMENT NORMALIZATION (train-relevant only)

| Raw requirement | Normalized requirement | Scope | Class (9-way) | Priority |
|---|---|---|---|---|
| "Answer KageBinary's review on #605" | Respond point-per-point in-thread; own the CodeQL misinterpretation plainly; ship fix head | #605 | PR requirement | **P0 — blocks release** |
| "Banner inputs unreachable in installed layouts" | Renderer+asset live under `ix-cli/`; package-relative resolution; npm-pack + release-staging pins refuse without inputs | #605 fix head | PR requirement | **P0 (built, needs push → superseded: pushed, see addendum)** |
| "CodeQL file-system-race is real" | open-once → fstat handle → isFile → read same fd; non-regular file → clean error, never FIFO hang | #605 fix head | PR requirement | **P0 (built)** |
| "Preview PNGs unreferenced" | PNGs off the branch; kept at run-dir + `meta/logo-previews` branch for body URLs | #605 fix head | PR requirement | **P0 (built)** |
| "In-process import instead of spawn" | Dynamic import behind package-relative probe; watch-child cache crash caught by suite, fixed | #605 fix head | PR requirement | **P1 (built)** |
| "Installer UX polish" | U1 id-labeled lines + U3 `--help` + U4 dry-run footer + 2 CI grep updates (verified `ci.yml:374/479`) | Track D branch | current task (recovery owner-gated — branch unrecoverable, builder item 6) | **P1 (built, needs push)** |
| "Live working examples" | Hermetic install demo exists (HOME→tmp-home, GIF, transcript); README examples must be re-verified by a docs-vs-registry parity test, not prose | Validation infra | validation | **P1** |
| "Portability / no dev-machine paths" | Invariant = no developer-specific hardcoding in shipped code/CI/tests; `$HOME`-derived + system paths legitimate | All train PRs | architectural | **P0 standing** |
| "Hermetic tests" | Every installer test pins HOME/USERPROFILE to fixtures; CI matrix green ubuntu+windows | Train + toolscan | validation | **P0 standing** |
| "Toolscan direction = Ix-native port of useful behavior, no runtime dependency" | Satisfied by KEEP-by-merge + B2–B5 hardening; consumer-parity filing tracks the Ix-side contract enforcement | toolscan | research | **P1** |
| "C2 `ix skills add`" | **KILLED** (D2 rev 4) — skills.sh already installs repo-hosted skills; publishing `skills/ix` there is distribution, not dependency | Roadmap | future vision (closed) | Closed |
| "Interactive installer / global install / plugins+MCP in one architecture" | Roadmap design (§11); never forced into the closing train | Vision layer | future vision | P2–P3 |
| KB/skill housekeeping (junctions, skill rewrites, npx bundle, Discord) | **OUT — independent work**, not in this spec | — | independent work | — |

## 6. PREVIOUS AGENT CRITIQUE (each claim labeled per the live-verified evidence classes)

**Got right:** the ground-truth discipline — catching its own stale B1 "license: null" claim **[FACT]**; the rev-1 "accident" framing invalidated by the PR record (branch name, PR title, +247 CI lines, three mutation-checked rounds) **[FACT — PR record observed]**; C2 kill with a real reason **[FACT — D2 rev 4 decision log]**; the framing precision ("the mistake was leaving it in without flagging," never "accident") **[FACT — framing survives review]**; option-list neutrality (de-selling the keep option after the owner caught the steering smell) **[FACT — in-thread]**; evidence-class discipline throughout **[INFERENCE — quality judgment from cross-session behavior]**.

**Got wrong / corrected by events:**
1. v5 never re-read toolscan's repo — missed shipped B2/B3 (fixed structurally in v6+) **[FACT — v5 text has no repo reads; the shipped commits exist]**.
2. Predicted "maintainer will reply" — instead he merged in silence **[SPECULATION at the time; FALSIFIED — the merge-without-reply is observed]**; the playbook lacked a MERGED branch until audit F2 forced it **[FACT]**.
3. The CodeQL race on #605 was recorded as "infra race, not a finding" **[ASSUMPTION — asserted without reproduction; UNVERIFIED then, FALSIFIED later: KageBinary reproduced it as a real TOCTOU+FIFO finding]**; the earlier byte-identity disproof concerned the *earlier* infra race and got conflated **[FACT]**. Lesson: an agent's own prior "not a finding" classification is evidence, not truth — the reviewer's re-classification wins **[INFERENCE — recommendation, validated by the re-review round]**.

**Failed to verify before asserting:** "B1 already done" **[UNVERIFIED at assert; FALSIFIED — license detection needs the LICENSE *file*, not README prose; B1 later landed as `2800f82`]**; the #604→#605 reviewer-removal mechanics **[UNVERIFIED at assert; reproduced 3× → FACT]**.

**Preserve:** RULE 0 draft-first, the auth tiers, the reconciliation-ledger pattern, dispatch-check.mjs, the six-step deviation log, the E1–E8 body standard, and the honest-reporting bar (unexercised stays INFERRED) **[INFERENCE — recommendations; every round since has validated them]**.

## 7. REVIEWER FEEDBACK MATRIX (KageBinary + maintainer actions, train-relevant)

| Finding | Evidence | Root cause | Category | Scope | Fix | Test that prevents | Status | PR |
|---|---|---|---|---|---|---|---|---|
| #605-F1 banner inputs unreachable in shipped layouts (blocking) | `renderBanner()` resolved `scripts/` + `assets/` from repo root; npm pack & tarball ship neither | Feature verified in-checkout only; no package-layout test (the exact "source green ≠ shippable" gap) | Packaging failure | #605 fix stack | Move inputs under `ix-cli/`; package-relative probe-then-import; npm-pack + release-staging assertions that refuse without inputs | Pack-layout smoke: run *compiled* banner from an `npm pack`-produced layout; pack gate refuses without the 3 inputs | **CLOSED** — implemented + verified, CI green on shipped stack | #605 fix stack — originating head `17d2da44` (HISTORY — shipped stack ends at `2f9604772c`, see addendum) |
| #605-F2 CodeQL `js/file-system-race` high — statSync/readFileSync TOCTOU + FIFO hang on user `--file` | CodeQL annotation `render-logo.mjs:45`; reviewer confirmed real (correcting our earlier "infra race" claim) | Renderer read files open-twice; hostile path unhandled | Security issue | #605 fix head | `readPngFile()`: open once → `fstat` on handle → `isFile()`+size → read same fd | Hostile-input test: FIFO/non-regular file → clean error exit, never hang | **CLOSED** — open-once/fstat read on the shipped stack | #605 fix head |
| #605-F3 two preview PNGs referenced nowhere | `output-samples/*.png` committed for PR-body benefit only | Convenience asset leaked into product branch | Dead asset | #605 fix head | PNGs dropped from branch; copies at run-dir + `meta/logo-previews` | Diff review: assets referenced by code or CI only | **CLOSED** — PNGs off the shipped stack | #605 fix head |
| #605 design note: spawn → in-process import | Renderer is zero-dep ESM; static import crashed watch-child runtime cache (caught by suite) | Two consumers, two mechanisms | Architecture | #605 fix head | Dynamic import behind package-relative probe, absent-safe kept | Byte-identity lib≡CLI pins retained; suite catches cache-layout regression | **CLOSED** — adopted on the shipped stack | #605 fix head |
| #609 findings a–d (README says gemini example/target, wrong `~/.cursor/skills`, "and more" overclaim) | `installer-audit.md` a–d with line evidence; CI itself asserted the gemini negative | Docs written aspirationally, never diffed against the registry | **Documentation contract failure** | #609 | README-only correction — **MERGED** (`8c0e6b00`) | Reference-parity gate: every documented example executed in CI against the registry (the missing test) | **CLOSED** — merged standalone | #609 ✅ closed |
| #609 finding e (refuse-guard satisfiable by foreign `name: ix`) | `install-skill.sh:133–160` | Ownership marker too weak for a hostile-intent case | Risk note (assess, don't fix) | #609 (maintainer assessment) | Recorded for maintainer assessment only | If ever fixed: guard on stronger marker + hostile fixture test | **IN-FLIGHT** — awaiting maintainer assessment | N/A — maintainer's |
| #591 `.mjs/.ts` duplication | Byte-identity tests + 20k-arg fuzz, reviewer-accepted | Two-copy mirror for bash consumption | Accepted debt | #591 | Keep; KB'd, do-not-unify-blindly | Byte-identity pins | **CLOSED** — reviewer-accepted, merged | #591 ✅ merged |

**How much of the feedback was caused by inadequate testing?** No single percentage — the honest classification: **packaging gap (F1)** — no test exercised the *installed* layout (ix-ci-release rule: "releases run the ACTUAL install path"); **hostile-input gap (F2)** — no FIFO/non-regular-file case; **docs-vs-code parity gap (#609 a–d)** — no test executed the README's documented commands; **process gap (F3)** — no diff-hygiene check for unreferenced assets. Each has a named preventive test in the matrix. The two security pins from #591 (bare-PATH, TOOLSCAN_PATH-only) were properly mutation-checked and never regressed — the testing discipline worked where it existed.

## 8. #605 EXACT SCOPE

**Belongs (all implemented on the fix stack — originating head `17d2da44`, shipped head `2f9604772c` per the addendum):**
1. Renderer + asset relocated into `ix-cli/` (`ix-cli/scripts/render-logo.mjs` + `.d.mts`, `ix-cli/assets/logo.png`) — REQUIRED BY REVIEW (F1).
2. `banner.ts` rewritten: in-process dynamic import behind a package-relative probe; absent-safe contract preserved — design note adopted.
3. Deliverability pins both sides: npm-pack assertion in `bootstrap-notice.test.ts` + `release.yml` staging copies with a hard `banner inputs missing` publish gate — REQUIRED FOR PACKAGING.
4. open-once/fstat-handle read — REQUIRED BY REVIEW (F2) / SECURITY.
5. Preview PNGs dropped from branch — REQUIRED BY REVIEW (F3).
6. Point-per-point PR-body response, correcting the CodeQL misinterpretation sentence plainly — REVIEW PROCESS.

**Explicitly does NOT belong:** `--bg none` (originally excluded as backlog — SUPERSEDED: shipped as `f4b6d986a`, see the addendum); installer UX (Track D branch); toolscan anything; C1/C3; any registry change; README edits (#609 closed that surface); gemini support; interactive installer; any new harness row. #605's story is exactly: *the banner ships, renders in every installed layout, and is race-free.*

## 9. #609 EXACT STATUS

**Fully addressed.** Four corrections verified by the reviewer against the registry and merged standalone (main → `8c0e6b00`); the maintainer explicitly decoupled it from #605. **No further README change is justified.** The README now equals current shipped behavior; future installer architecture belongs in design docs/proposals, never README churn. Remaining README-adjacent item is *not* a README change: the reference-parity *test* (executing documented examples in CI) is a CI/test-surface proposal — held as an optional follow-up, owner-gated.

## 10. TOOLSCAN ANALYSIS

- **Architecture/port model — verified correct:** research → understand → Ix-native rewrite is realized as the KEEP-by-merge seam (Ix-native contract: `TOOLSCAN_PATH`-only, no bare-name PATH exec — pin-tested; purely additive; name-without-path degrades at the consumer). No runtime dependency beyond the opt-in env var; the merged README link is upstream's own text — never re-litigated.
- **Provenance/licensing — clean:** MIT (`2800f82` LICENSE + description; API detects MIT). Distinction preserved: no copied code/text; only the *contract and behavior* are shared, credit lives in threads only (D2/D5). Separation maintained: copied code = none; observed behavior = the contract; conceptual inspiration = the doctor/fail-closed patterns; independently implemented behavior = everything in `src/`.
- **What's done:** B1 ✅, B2 doctor oracle ✅ (`031c6f1`), B3 fail-closed ✅, B4 partial (NUL hardening `a3e33771`; 8/20 poisoned fixtures), cross-platform hermetic suite + first CI ✅ (`e47f42b` + `2f88671b`; ubuntu 56/56, windows 53+3 skip, dist-sync gate), B5 generic-core holds. **Skill-package round (executed with owner go):** `feat/agent-skill-package` (`c1a9a16` + `bdc5775`: skill package + Ix-pattern installer + HD 2048 logo + pin test) pushed via the **API surface** after three transport-failed git pushes → **draft PR Alot1z/toolscan#1**, remote head `47fe7aa8`, **tree `905abdb3` == local `bdc5775^{tree}`** (byte-identical tree, verbatim messages, true author identity; sha divergence = GitHub commits-API date normalization, KB #6668).
- **Residuals (real, enumerated):** (a) Ix consumer `discovery.ts:81` does not enforce the producer contract (accepts relative/traversal/absurd paths; first reported path flows into `host.inspect` → gets executed during `ix mcp install`) — **filing gated to post-train-release**; (b) toolscan validator doesn't reject `..` segments inside absolute paths — changes accepted-input contract, its own proposal.
- **Paths audit:** toolscan core B5-verified clean (no machine-specific paths). In the wider workspace, personal paths (`C:\Users\…`, `E:\E-github-repos\…`) exist in campaign records, skills, and dispatches — owner-local by design, and local record commits were never pushed. **Invariant for all train artifacts: no developer-specific hardcoding in shipped code, CI, or tests; `$HOME`/`%USERPROFILE%`-derived, fixture-temp, system, and script-relative resolved paths are legitimate. No naive "reject every absolute path" test — validate the invariant, not the shape.**
- **Integration boundaries:** toolscan stays generic core; the Ix adapter lives at the seam; toolscan's own skill package + installer (`feat/agent-skill-package`) is its own repo's work — same draft-first discipline if a PR ever opens. What may be discussed back in the toolscan repo as a live use case: the Ix `TOOLSCAN_PATH` seam is the production reference integration (already documented in its `docs/compatibility.md`) — that story is factual and safe to cite there.

## 11. INSTALLER ARCHITECTURE (current vs future)

**Current (shipped, merged):** a registry (`skill-harnesses.mjs`, 4 verified ids) + bash installer + `ix mcp install` host adapters in `hosts.ts` (probe types bin/config/bin-or-config; refuse-to-destroy; `--dry-run --json`; structural config parsing; `quoteForCmd` mirror byte-pinned). Toolscan = optional additive discovery. This is *already* core→registry→per-host-adapter in miniature — the architecture is sound; what's missing is lifecycle and scale.

**Future (roadmap, one axis per PR, never bundled):**

| Capability | Classification |
|---|---|
| Generic installation engine + contract | **Foundational** (C1's manifest is its first concrete step) |
| `ix install` umbrella command | **Future** — only after skills/plugins/MCP share the engine |
| Idempotent install / uninstall / update | **Foundational** (C3) |
| Global/user-scoped install | **Foundational** (already the model) |
| Interactive mode | **Future** — must be a UI *over* the same engine (one engine, N frontends: CLI flags / `--json` / interactive / dry-run are output modes, never code paths) |
| Dry-run + machine-readable output | **Foundational** (exists; U4 polish) |
| Conflict handling / versioning / trust | **Foundational**, trust model must precede plugin/MCP install |
| Platform-aware destinations | **Foundational** (probe-verified rows only, KB #6455) |
| Skill installation | **Current** (shipped) |
| Plugin installation | **Future/adapter** — each plugin repo already has its own installer; Ix adapters only if maintainers want unification |
| MCP installation | **Current** (`ix mcp install`) — shares the *contract shape* (probe/inspect/register/refuse) but is **not** the same operation as skill drop-in; a shared *installer contract* is realistic, a shared *implementation* is not (registration mutates config files; skills copy trees — different verbs, same lifecycle) |
| Live installation verification | **Foundational** — the hermetic demo + pack-layout smoke are its first instances |

**Never leaks into core:** ecosystem dir conventions (adapters), personal paths, discovery heuristics beyond the bounded scan, interactive-only code paths, hardcoded harness lists outside the registry.

## 12. TUI PREVIEW ANALYSIS (black/blank top bar in `banner-48-truecolor.png`)

- **Verified:** the renderer's output begins with a **leading blank line** (intentional vertical spacing — the test suite pins this; an early assertion `startsWith(" ")` was corrected because of it). The PNG generator (`.logo-banner-png.mjs`) trims only *trailing* whitespace-newlines and keeps full banner geometry, so the leading empty row becomes a full-width empty row.
- **Likely:** that leading row is painted with the backdrop/parse default (null fg/bg → backdrop navy `rgb(5,10,30)` or viewer-transparent → black), producing the black/blank bar. Secondary candidate: unpainted rows where the row's cells are all spaces in a viewer that renders transparency as black.
- **Unknown:** exact compositing choice in the specific viewer used.
- **Correct layer to fix:** the **PNG preview generator** — skip leading/trailing blank rows (or paint them as the intended backdrop), never the runtime TUI. The blank line at runtime is deliberate terminal spacing and matches `emitSetupNotice`'s layout contract. Principle applied: *fix the layer that creates the defect* — do not touch `banner.ts`/renderer to compensate for a capture artifact.

## 13. TESTING ARCHITECTURE

Pyramid, mapped to what exists vs what's missing:

| Layer | Exists | Gap |
|---|---|---|
| Unit | 95 files / ~1755 tests + 21 skips; banner pins incl. byte-identity lib≡CLI, NO_COLOR zero-escapes, `--bg none`, goldens; mutation-checked | — |
| Integration | MCP install tests; harness smokes (ubuntu + windows-2022); `quoteForCmd` fuzz | — |
| **Package** | **New on fix head:** npm-pack assertion carrying all 3 inputs | Keep; add the same pin for the release tarball staging (release.yml gate already refuses without inputs) |
| **Installed smoke** | **New:** compiled `dist/cli/banner.js` renders a 25-line banner in the installed layout | Make it a permanent CI leg (pattern: `compass/.version` pin) |
| Platform | ubuntu/macos/windows × node 22/24; toolscan ubuntu+windows × 20/22 + dist-sync | Coverage-inflation budget documented (v8 ~10× hot-loop) |
| Runtime | Hermetic install demo (HOME→tmp-home, transcript, GIF); `ix doctor` | Demo is manual — wire the transcript assertions into CI as the **docs-parity test**: execute every README-documented installer example against the registry hermetically |
| Release | `ci-success` 8-job gate; release staging gate (new) | — |

This closes exactly the reviewer-finding classes from §7: F1 (package+installed-smoke), F2 (hostile-input), #609 (docs-parity), and formalizes "BUILD ≠ RUNTIME SUCCESS" for packaging.

## 14. OTHER CODE REVIEW FINDINGS (evidence-backed, beyond named files)

1. `ix-cli/src/mcp/discovery.ts:81` — consumer doesn't enforce the producer contract (§10a). **Real, pending filing.**
2. `release.yml` — banner-input staging gate exists only on fix head; main lacks it. Covered by #605.
3. CI fixture honesty — the fake `toolscan.mjs` smoke fixture is shape-minimal (`{tools, truncated}`), not contract-complete; a producer-contract drift would pass the smoke. Low severity, fold into the consumer-parity filing.
4. `scripts/install-skill.sh` guard strength (finding e) — recorded, maintainer's call.
5. Workspace hygiene — local record commits on `feat/context-mode-conflict-v2` embed personal paths (`prompts/architect`, run-dirs); unpushed today, but a branch-protection habit (never push that branch; keep records in the fork's dedicated record paths) should be stated in the runbook.
6. Stale archives within arm's reach (`IX-CAMPAIGN-COMPLETE…` README claiming "never submitted upstream") — already superseded; keep labeled as record-only to prevent a future agent acting on it.

No invented findings; everything else audited (`hosts.ts`, `install-skill.sh`, `ci.yml`, renderer, toolscan core) verified sound in the positive-side audits.

## 15. PR/TRAIN DEPENDENCY GRAPH

```text
#609 README fixes ............ MERGED (independent) ✅
#605 logo banner
   └─ fix stack PUSHED: head 2f9604772c · CI green (counts held once in the LIVE DRIFT ADDENDUM) · response posted (5554982515) ──▶ [train release] mark-ready (owner go)
      [supersedes the old row: "fix head 17d2da44 (LOCAL) ──push──▶ CI green"]
chore/installer-ux-polish 44fbb54 (LOCAL) ── independent of #605 ──▶ push on go ──▶ draft PR (after release per green-light terms)
toolscan B4(b) `..`-segments ── independent (own repo, own proposal PR)
toolscan consumer-parity filing (discovery.ts) ── AFTER train release (one clean story)
toolscan skill-package ── PUSHED via API surface → draft PR Alot1z/toolscan#1 (head 47fe7aa8, tree 905abdb3 == local bdc5775^{tree}) ── independent, own repo ──▶ ready-state on owner go   [supersedes the old "(LOCAL)" row]
installer UX upstream issue ── OPENED as #611 with owner go (tracks U1/U2) ── no further issue actions without go   [supersedes the old "AFTER train release, owner go" row]
C1 manifest registry / C3 lifecycle ── plan-only; maintainer-initiated or fork-side tooling
--bg none ── SHIPPED on the fix stack (f4b6d986a)   [supersedes the old backlog row]
interactive ix install ── proposal OPENED as issue #612 with owner go (plan-only; implementation deferred until its PR)   [supersedes the old unopened draft row]
port-native toolscan ── DEAD (KEEP-by-merge); revives maintainer-initiated only
```

Independent-mergeability preserved: nothing above blocks #605's release except its own green CI.

## 16. DESIGN GAPS (implementation agent must answer, not hide)

1. Does the release tarball (not just npm pack) get its own banner-input pin, or does release.yml staging make it structurally impossible to miss? (Verify on the fix head.)
2. Where does the docs-parity test live (ci.yml new job vs extending the existing smoke legs) and what's its runtime cost?
3. U2 (summary table) is deliberately off Track D and riding the upstream issue — **now open as #611**; confirm #611's promised UX surface stays consistent with whatever UX PR merges.
4. Interactive installer: which contract surface (flags vs prompts) does C3's lifecycle assume? Unresolved by design — needs a design doc before any code.
5. Toolscan validator `..` change: exact accepted-input contract delta (what breaks, who consumes it) — must be written before the proposal PR.
6. PR-body image hosting after PNG removal — confirm `meta/logo-previews` raw URLs render in the body on GitHub (verified once; re-verify at release).

## 17. FINAL OPTIMIZED MASTER PROMPT

Maintained as its own file: **`prompts/architect/BUILDER-PROMPT-MASTER-2026-09-05.md`** (the standalone implementation prompt; identical binding content, self-contained).

---

## QUALITY GATE (all answered yes)

1. Vision preserved (§2) · 2. vision vs immediate separated (§3) · 3. prior reasoning preserved where correct (§6) · 4. unsupported assumptions corrected (CodeQL reclassification, B1 arc) · 5. KageBinary feedback classified per-finding (§7) · 6. #605 not a dumping ground (§8) · 7. #609 independence honored and closed (§9) · 8. package/install/runtime verification defined (§13) · 9. toolscan Ix-native direction preserved (§10) · 10. no personal-path assumptions (§10, §14.5) · 11. interactive installer positioned vs core (§11) · 12. MCP ≠ plugin ≠ skill (§11) · 13. README truth vs future architecture (§9, §17) · 14. live examples = tested examples (§13 runtime layer) · 15. prompt parseable by another agent (§17 file).
