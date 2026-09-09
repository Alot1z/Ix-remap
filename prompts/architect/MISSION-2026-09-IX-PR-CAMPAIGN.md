# ⚰️ TOMBSTONED — SUPERSEDED 2026-09-05

> **This file is SUPERSEDED by `prompts/architect/BUILDER-PROMPT-COMPLETE.md`** (the sole canonical dispatch, v2). All living state (D-LOG through rev 7, executed Q1 evidence, playbook incl. MERGED branch, queue with restored items) lives there now; this file's D-LOG below stops at an INTERMEDIATE state.
> **Known self-contradiction, neutralized:** the D1 header below says "rev 4 · EXECUTED" while its body carries revs 5–7 — the header is STALE; the true final state is D1 **rev 7, EXECUTED** (comment live on #591, `5547541291`), as recorded in the canonical dispatch §0/§7.
> The body below is retained **as historical record only — DO NOT EXECUTE from this file.**

---

# CAMPAIGN — IX PR TRAIN · SEPTEMBER 2026 (companion to MISSION-UNIVERSAL-HOW-CONTRACT.md)

This file is the mutable per-mission layer. The HOW-CONTRACT holds the stable doctrine (routing, evidence, hard policy, section gates, validation/report ladders) — read it first; it governs everything here. This file owns WHAT: the decision log, the campaign, the queue, the drafted artifacts. When a decision here is executed, mark it EXECUTED with the evidence inline; keep rev history, never delete it.

Canon: the HOW-CONTRACT is the only stable mission file. The two v1 mission prompts are archived at `archive/IX-REMAP-MISSION-PROMPT.v1.md` and `archive/orignal-missions-prompt.v1.md` — historical record, never execute from them. If a builder receives only the HOW-CONTRACT + this campaign file, it has everything: it can route, plan, execute, and report without any chat context.

## SUBSTRATE — verified directly 2026-09-05 (re-probe only if acting on stale data)

| Fact | Evidence class | Source |
|---|---|---|
| toolscan is MIT-licensed, described, documented, zero-dep committed bundle, JSON contract stable since v1.0.0 | VERIFIED — repo read | github.com/Alot1z/toolscan README, fetched 2026-09-05 |
| toolscan commands: scan (0/2-truncated) · list · check · snapshot · diff · missing · drift | VERIFIED — repo read | same |
| toolscan is already wired as Ix's seam: "TOOLSCAN_PATH=… (or toolscan on PATH) is how Ix's `ix mcp install` / `install-skill.sh` power their harness detection; the seam is purely additive" | VERIFIED — repo read | same |
| skills.sh mechanism: source formats (shorthand/URL/path/git/local), private-repo credential discipline (git helper → gh clone → SSH; **never executes/copies the gh token into the process**), symlink-to-canonical with `--copy`, download caps (10 MiB / 25 MiB / 1000 files, env-overridable), `-y` CI mode, verbs add/use/list/find/update/remove/init | VERIFIED — repo read | github.com/vercel-labs/skills README, fetched 2026-09-05 |
| BMAD installs per-project via `npx bmad-method install` into `_bmad/` + per-tool skill dirs; `--list-tools`; headless `--yes --modules bmm --tools claude-code`; missing-uv warns but completes | VERIFIED — docs read | docs.bmad-method.org/start/install-bmad, fetched 2026-09-05 |
| PR #591 state: head `608c986`, three review rounds, verdict "No open findings from me — this is good to land" | OBSERVED — earlier read-only pull this campaign | PR thread ground truth |
| v1 mission prompts archived (not deleted); prompts/ untracked (no git baseline) | OBSERVED — local | local file moves this session |

Substrate supersession: the earlier "license: null, no description" report is **SUPERSEDED** by the direct repo read above. B1 as "license fix" is DONE; what remains of B1 is only README hardening if the maintainer asks for it (see D1 actions).

## D-LOG — decisions (rev-tracked; supersede, never delete)

### D1 · toolscan seam in PR #591 — rev 4 · STATUS: EXECUTED 2026-09-05 — preference: PORT-NATIVE (self-insulated Ix); maintainer chooses; response playbook armed
**Decision (rev 4, owner-clarified):** the owner never intended a separate external dependency — the goal is a **SELF-INSULATED Ix**: the discovery capability living natively in core, zero external references, nothing personal in the README. Preference order: (1) **port-native** = the intended end state; (2) **keep the seam** = acceptable ONLY as the maintainer's explicit choice with the disclosure on record (the owner is publicly fine with the listing if they choose keep); (3) **split** = fallback. The comment states this real preference — "equally happy with any of the three" (rev 3) is removed as false. **Framing rule (owner-locked, rev 5):** the mistake is precisely *"I kept my own repo tied to Ix's docs and never put that decision in front of you"* — NOT the seam's code, NOT an accident (the record — branch name, PR title, +247 CI lines, three mutation-checked rounds — disproves both, and an accident claim disrespects a reviewer who read the tree carefully). The vision line is mandatory in the comment: toolscan exists as a step toward this capability living self-contained inside Ix; the port completes it. Standing rule for ALL review-thread replies: state the real position with evidence — performative agreement is banned (never appeasement, KB #6470). Rev 6 addition — option-list neutrality: options at equal depth; never re-sell an alternative by listing properties the reviewer already verified himself (repeating his own findings back as selling points reads as steering toward keep); preference stated once with its one-line reason; tolerance stated once, without advocacy. Rev 1 (strip via D1-as-accident) is VOID.
- **Rev 1** (2026-09-05 am): strip as accident — VOID by ground truth (see rev 2 log below).
- **Rev 2** (2026-09-05 mid): keep + sign-off; accident framing banned; deviation log recorded (ASSUMPTION: accidental inclusion — EVIDENCE: branch/title/CI/rounds — PROBLEM: false premise — NEW DESIGN: decision gate — REASON: honest close — CONSEQUENCE: no head move without maintainer objection + authorization).
- **Rev 3** (2026-09-05): owner-locked framing added ("mistake to have left it in without flagging"); port-native option ("a ported custom of it") made an explicit choice in the comment; toolscan MIT verified → B1 superseded; oracles added (below).
- **Rev 4** (2026-09-05): owner clarified intent — self-insulation, not external dependency; preference order disclosed (port > keep-with-explicit-choice > split); "equally happy with any" removed as false; skills.sh credit rescoped (D2 rev 3); README rule: no personal-repo listing unless maintainers explicitly choose keep.
- **Rev 5** (2026-09-05): mistake precision — "kept my repo in the docs without flagging" (not the code, not an accident); vision line mandatory in the comment; review-reply genuineness rule added; C2 killed from mainline (D2 rev 4); README draft + maintainer-response playbook added; TUI logo parked in BACKLOG.
- **Rev 6** (2026-09-05): comment de-sold — the keep option's feature pitch removed (the reviewer verified those properties himself; repeating them back read as advocacy for keep); option-list neutrality rule added; D5 created — skills.sh publish split out as a separate future proposal, never in #591.
- **Rev 7** (2026-09-05): render-logo staged for real in the fork (`repo-fork/scripts/render-logo.mjs`, exercised all modes + `--json`; sharpening = coverage-thresholded supersampling; bg-honesty fix for no-alpha PNGs); dispatch set completed with `BUILDER-PROTOCOL.md` (skill gates + reporting contract + stop conditions).

**Actions in order:**
1. ~~B1 license fix~~ — SUPERSEDED: toolscan is MIT (see SUBSTRATE). Remaining: only if maintainer requests README hardening.
2. ✅ EXECUTED 2026-09-05: governance comment posted via gated surface — https://github.com/ix-infrastructure/Ix/pull/591#issuecomment-5547541291 · verbatim EXACT MATCH on fetch-back · watermark-free · PR head unchanged `608c986` (posted via gh-api.mjs client, body read from file, watermark reflex check).
3. ✅ EXECUTED 2026-09-05: parity-trio scope check — **CONCLUSION: LOAD-BEARING, keep in #591.** The ci.yml diff ADDS the `api-parity` job that runs `node scripts/check-api-parity.mjs`, and the PR's summary job gates on it (`needs: [static, test, e2e, api-parity, harness-install-smoke, harness-install-smoke-windows]`). The trio (+319 lines) is not riding scope — it IS the implementation of a gate this PR adds; splitting it would break the PR's own CI story. Recorded here per the oracle ("conclusion posted in-thread or KB'd"); not posted in-thread because the reviewer said "good to land" and raising a non-issue would spend his attention for nothing.
4. ✅ EXECUTED 2026-09-05: KB rows added + verify-gate PASS + promoted to TRUSTED: **#6634** (external-dep governance lesson, cites the posted comment URL) · **#6635** (.mjs/.ts accepted duplication, byte-identity tests + 20k-arg fuzz, do-not-unify-blindly). Both OBSERVED, provenance source-pr 591.
5. Split path — ARMED, executes ONLY if the maintainer chooses split (preference 3): strip seam (~10–12 of 20 files, smoke job splits in two, head moves) via gated surface with explicit authorization + the §4.4 gated push sequence.

**Oracle:** comment visible on PR #591 via `gh api` = the drafted file verbatim, zero watermark lines; scope-check conclusion posted in-thread or KB'd; two KB row ids recorded back here; split count = 0 unless the maintainer chooses split; port-native choice → Q2 design doc becomes the implementation plan.

**Response playbook (each branch pre-wired):**
- **Port chosen** → Q2 design doc becomes the implementation plan; port PR removes the seam and adds the built-in discovery (README variant A in DRAFT-2); nothing personal remains upstream.
- **Keep chosen** → the comment is the disclosure record; README ships unchanged and toolscan is named only if maintainers explicitly add it (rev 4 rule); docs PR only on request.
- **Split chosen** → armed rework executes via gated surface with explicit authorization: strip seam (~10–12 of 20 files, smoke job splits in two), then a separate `feat(mcp): optional TOOLSCAN_PATH discovery seam` PR.
- Every branch closes with: `gh-commit.mjs verify` + `gh-pr.mjs get` clean, CI green on the touched head, KB row updated with the decision.

### D2 · skills.sh — rev 3 · CREDIT RESCOPED (owner correction)
**Correction (owner-locked):** the earlier "taken to a new level and made specific for Ix" clause OVERCLAIMED — nothing in the current tree implements a new level, and #591 is not derived from skills.sh at all. Claiming it there is the KB #62 anti-pattern (titling for promises, not what it does).
**Credit scope:** (a) PR #591 — NO skills.sh mention anywhere. (b) Q2 design doc + C1–C3 PRs — these artifacts ARE the new level (manifest registry, native `ix skills add`, lifecycle verbs); their bodies say "Inspired by skills.sh (vercel-labs/skills)", and the fuller clause ("…rebuilt for Ix: registry-driven detection, structural probes, self-contained discovery port") may appear only in an artifact that actually contains the capability. Never claim the clause on a surface that does not yet have it.
Mechanism analysis VERIFIED (see SUBSTRATE): maintained per-harness registry + structural detection + a credential discipline that never copies the gh token into the process — the same property as gh-token single-ownership. Take the pattern, take nothing verbatim; Ix's `hosts.ts` is the registry of truth.
**Rev 4 — C2 KILLED from the mainline:** `ix skills add <owner/repo>` would reimplement skills.sh's source-format resolution, credential chains, and download caps to save users one `npx` invocation — cost with no owner. The Ix repo already hosts its skills and skills.sh installs them today. Ix-native value stays in C1 (detection quality) + C3 (lifecycle); `skills/ix` becomes ecosystem-consumable by publication, not by code.

### D3 · BMAD-METHOD — VERIFIED orthogonal
Zero coupling to the Ix installer/MCP surface (project scaffolder vs user-level deployer — different axes). Local bmad-build(-auto) stay uv-gated local skills. Only transferable idea: module sets (`--set ix-core|ix-review|…`).

### D4 · installer quality bar — RESOLVED by D1+D2
Registry-driven (hosts.ts descriptors), structurally verified (a bare `~/.vscode`-style always-true probe must not list as detected — #6455), structural parsing of host listings (#6525), refuse-to-destroy-what-you-don't-own, truthful `--dry-run`, hermetic on clean machine and CI. External discovery = opt-in evidence, never the decider.

### D5 · two upstream questions, two surfaces — never blur them
- **Seam governance — NOW, in #591:** the disclosure comment (DRAFT above). Personal-repo involvement in upstream = maintainer decision; framing per the owner-locked rule.
- **Ecosystem distribution of `skills/ix` — LATER, its own proposal:** publishing the already-repo-hosted skill so `npx skills add ix-infrastructure/Ix` works is convenience tooling, not governance — Ix hosts its own skills and nothing personal is embedded. It rides NO #591 thread (one clean story): it becomes its own issue/PR proposal only after the seam decision lands. Framing there is "proposal," never "disclosure"; the D2 credit rules apply to its body.

## CAMPAIGN (WHAT — re-scope against the live repo before executing)

1. Resolve the five open PRs **#584 · #587 · #589 · #590 · #591** to model-correct against live upstream (execution mandate below), then rebase onto current main **with authorization**, preserving each branch's response commits; re-verify CI on new heads.
2. Execute D1 rev 3 (the queue's Q1).
3. Fix issue **#599**: add `release_version` to the `/v1/health` HealthResponse in `docs/api/openapi.yaml`; note whether the commit-time parity gate would have caught it.
4. Sweep: query every issue/PR comment in ix-infrastructure/Ix mentioning Alot1z; answer every open thread (read-only; writes need authorization).
5. Doctrine: distill the `/v1/health` spec-gap finding + the A/B tree-proof method into an ix-reference-parity KB row.
6. Ix-native harness-detector design doc (plan-only; with the skills.sh credit line from D2).
7. toolscan hardening (own repo): B2 `toolscan doctor` invariant oracle → B3 fail-closed output (empty/truncated = error, never silent "nothing found") → B4 hostile-input sweep of `parseToolscanOutput` (empty · truncated JSON · duplicate names · path traversal `../../` · real-bin collision) → B5 stays generic core (no ix logic, no KB content, no machine-specific paths).
8. Installer evolution — TWO separate clean-room Ix PRs (C2 `ix skills add` KILLED — see D2 rev 4): C1 manifest-driven harness registry (data row per harness: id/bin/probe type/registration; probe-verified rows only) → C3 `list/update/remove` lifecycle for skills Ix installed. Ecosystem consumption of `skills/ix` needs zero Ix code — skills.sh already installs repo-hosted skills (`npx skills add ix-infrastructure/Ix` works today): publish there, don't reimplement. BMAD's module-set idea folds into C1 as `--set`.

## EXECUTION QUEUE — oracles included (audit gap closed)

- **Q1 — D1 rev 3:** ~~post governance comment (text below) → parity-trio scope check → two KB rows.~~ **✅ EXECUTED 2026-09-05** — comment live (#issuecomment-5547541291, verbatim, watermark-free, head `608c986` unmoved) · scope check: parity trio LOAD-BEARING (ci.yml adds the api-parity job; summary gates on it) · KB #6634 + #6635 TRUSTED. Remaining: poll the maintainer's choice and run the playbook branch. The comment draft below is the historical record of what was posted.
  *Done when (met):* comment verbatim on #591 (api check) · scope conclusion recorded · 2 KB row ids logged here · no head move.
- **Q2 — Detector design doc (plan-only):** descriptor table (id/bin/probe/registration/parse mode) · structural probe battery · hermetic closed-port cases · mutation tests · Windows copy-default rationale · module sets · the D2 credit line.
  *Done when:* doc exists in the Ix fork `docs/` with all seven sections and cites #6455/#6525/#6274 + the credit; no code merged.
- **Q3 — Five-PR audit (read-only):** §7-item-1 + execution mandate; per-PR head SHAs, force-push history, open review threads.
  *Done when:* per-PR table (head SHA · CI status · force-push list · open threads · disposition) delivered; zero writes; zero pushes.
- VOID: any "strip the accidental toolscan seam" instruction — false premise (rev 1), do not execute.

## DRAFT — PR #591 governance comment (Q1 ready; post verbatim through the gated surface)

> One governance flag, then I'll leave you alone. toolscan — the discovery seam in this PR — is my own project (Alot1z/toolscan). The seam is deliberate and fully tested — the mistake was mine: I tied Ix's docs to my own repo and let it ride without putting that decision in front of you. For context on where I stand: I never meant Ix to carry an external dependency for this — toolscan was my step toward this capability living self-contained inside Ix, and a native port finishes that. So:
>
> 1. **Port it natively — my preference.** I donate a self-contained port of the discovery into Ix core: a bounded scan of the common install roots with the same contract (bounded, `truncated`-truthful, opt-in env gate, zero external dependencies, MIT). Ix depends on nothing outside this repo and nothing of mine is listed anywhere.
> 2. **Keep the seam as-is.** Entirely your call, and I'll leave it in place if you make it — the disclosure stands either way.
> 3. **Split it out.** I rework this PR back to the embedded-probe installer and open a separate `feat(mcp): optional TOOLSCAN_PATH discovery seam` PR so the decision gets its own review. (~10–12 of the 20 files; the smoke job splits in two.)
>
> Whichever you pick, I'll execute it as-is. (No other changes in this comment; the PR itself is untouched.)

## DRAFT-2 — README Installation section (base variant: no personal names, no toolscan mention, claims bounded to what ships)

> ### Install the agent skill
> `scripts/install-skill.sh` probes which agent harnesses are installed on this machine and deploys `skills/ix` to each one — Claude Code's `~/.claude/skills`, Agents' `~/.agents/skills`, Codex's `~/.codex/skills`, Gemini's `~/.gemini/skills`, and more. A harness is listed only when its skills directory exists and carries the expected shape — nothing is detected from an unrelated folder's presence. `--dry-run` previews the targets; pass harness ids to install only those.
>
> ### Register the MCP server
> `ix mcp install` registers the Ix MCP tools with your harness. It never overwrites a registration it did not write (`--force` replaces, `--host` narrows), keeps a `.bak`, and refuses a config file that does not parse. `--dry-run` writes nothing.
>
> ### Verify
> `ix doctor` reports install and backend state; `ix --version` prints to stdout.

Variant rules: **PORT outcome** → append one line: "Discovery of harness CLIs installed outside PATH is built in — a bounded, truncated-truthful scan of the common install roots." **KEEP outcome** → ships unchanged; toolscan named only if maintainers add it after the disclosure comment (D1 rev 4). **SPLIT outcome** → ships unchanged.

## BACKLOG

- **render-logo `--bg none` (salvaged from the superseded parallel zip):** transparent-banner mode for themed terminals — the committed renderer lacks it; the zip's 0.5 coverage contour is a comparison point against our tuned 0.12 (adopt only if it visibly improves the owner-approved look). Adopt as a follow-up commit on `feat/tui-logo-banner` WITH the same test discipline (zip itself had no in-tree tests). Zip archived at `E:/E-downloads/ix-tui-logo-sharp.zip`; single ownership: the committed fork copy is canonical.
- **Pixel TUI logo (owner-selected, parked, PIPELINE PROVEN 2026-09-05):** source of truth = the repo's own asset `assets/logo.png` (https://github.com/ix-infrastructure/Ix/raw/main/assets/logo.png). `scripts/render-logo.mjs` decodes the PNG at build/CLI-run time (zero-dep decoder: chunks → inflate → unfilter → downsample to a char grid — proven on the real 5400×5440 file; swirl mark + "ix" wordmark both resolve at 56×28) and emits: truecolor ANSI with the brand blue gradient → ANSI-256 → ASCII luminance ramp under `NO_COLOR`/dumb terminals; width variants 8/16/32/56 cols. The PNG is the only art ever maintained. **STAGED 2026-09-05: `repo-fork/scripts/render-logo.mjs`** — sharpening via coverage-thresholded supersampling, bg-honesty ink test for no-alpha PNGs, `--width/--color/--file/--json`, exit codes 0/1/2; exercised on the byte-identical fork asset (sha256 6c40a9b8…). **COMMITTED 2026-09-05: fork branch `feat/tui-logo-banner` @ `d2876f5`** (gated surface: snapshot --paths of 5 files, lease-checked push from fork-main `6af4cd9`, verify + post-push re-scan footer-free; 10/10 pins incl. byte-identity lib≡CLI, NO_COLOR zero-escapes mutation-checked red→green; full ix-cli suite 74 files / 1285 tests green; typecheck + lint clean; scratch HTML preview regenerated FROM the module at 120-col hero). Remaining: open the fork PR on request; CLI-banner wiring was delivered via `emitSetupNotice` (stderr-only, absent-safe).

## Execution mandate (per-PR, from the v1 mission — preserved)

1. **Every branch:** full commit history; every force-push (old head → new head, dates); what each rewrite added/removed/clobbered; head matches rebuilt intent.
2. **Every commit:** every diff line vs live code, tests, reviewer comments; flag branding, carried drift, lost fixes.
3. **Every file:** line-by-line; docs must match code.
4. **Every review thread:** each note → the commit addressing it or the gap; reply where the reviewer's last word has no answer, naming the new head SHA.
5. **Head + CI:** exact head SHA on GitHub + CI status on that head; re-poll after any push.
6. **Resolve:** no carried diffs, no branding, response commits in order, tests green, docs aligned.
