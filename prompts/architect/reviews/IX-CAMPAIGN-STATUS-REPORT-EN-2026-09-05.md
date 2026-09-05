# IX CAMPAIGN — COMPLETE STATUS REPORT (English edition)
**Owner: GitHub Alot1z · Campaign: ix-infrastructure/Ix PR train + toolscan seam · Date: 2026-09-05 (probes 07:37–07:55Z)**

This is the full English summary the owner asked for — and it answers the owner's standing
challenge directly: *are we actually reading the things?* This edition was produced by
re-reading the real sources, not by re-summarizing prior dispatches: the three principles
documents, the merged installer code (line-by-line), the toolscan repository (cloned, code
read, test suite **executed**), the live PR states, and the CI jobs. Every claim below
carries an evidence class. Two dispatch corrections came out of this reading, one of them
major (toolscan B2/B3 are already shipped) — see §6.

---

## 1. Merged vs. not merged — the live state (re-probed this session)

| Item | Real state | Evidence |
|---|---|---|
| **New installer — PR #591** (your toolscan seam) | ✅ **MERGED** 2026-09-05T05:32:14Z, merge commit `39d07342a7`, 24 checks green. KageBinary personally carried it: opened #603 to supersede it, resolved the near-revert conflict (a carried copy of #587's parity gate that predated its own fix `f37fd49`), pushed his merge commits `b652008`+`538c249` **directly into your fork branch** to preserve your authorship, closed #603, merged #591 25 minutes later. | VERIFIED — API probe this session (state, head, comment count unchanged since the 07:25Z probe); #603 archaeology from the prior session's thread read |
| **Main has not moved since** | Ix `main` HEAD is still `39d07342a` (#591's merge). Everything cached at 07:15Z is byte-identical to a fresh clone (diffed: `install-skill.sh`, `skill-harnesses.mjs`, `README.md`, `ci.yml`). | VERIFIED — clone diff, this session |
| **#547 — exit-code PR** (Hiro-Chiba) | ⏳ **OPEN, gated by design** — 9 commits, head `5280ec648`, MERGEABLE, 12 comments, last activity 05:34:22Z = KageBinary's state-of-record comment `5549703398`: *"ready on the merits, waiting on those three PRs… I do not have any open findings against it."* The gates are his own plugin PRs. Not ours to move. | VERIFIED — API this session (state/head/comments); comment text verified prior session, page-2 re-fetch deferred (rate limit) |
| **#559 — locate fix** (KageBinary DRAFT) | ⏳ Open draft, `c60812e05`, 3 comments, untouched since 2026-09-01T18:45:34Z. Deliberate step-2. Zero action from our side. | VERIFIED — API this session |
| **Plugin gates** | `ix-infrastructure/ix-openclaw-plugin` **#33** open (updated 08-30), `ix-infrastructure/ix-claude-plugin` **#38** open (updated 09-01) — **note: they live in the `ix-infrastructure` org, not a personal KageBinary org as v5 phrased it.** **#37 returned 404 on `pulls/37`** — re-verify at session start (plausible: #37 is an *issue* number, not a PR). No gate movement. | OBSERVED — API this session; #37 = UNKNOWN |
| **TUI logo** | 🔒 Never submitted upstream — by design. Fork branch `feat/tui-logo-banner` @ `d2876f5`, 1285 tests green, lib≡CLI byte-identity pinned. Opening the PR needs your explicit "authorize". Main moved ~20 PRs under the branch → rebase is mandatory first. | VERIFIED — carried from v5 (no branch writes since) |
| **C1/C3** (skills.sh-inspired installer evolution) | 🗂️ Plan-only, parked. Unrelated to what merged. | VERIFIED — campaign doc + no upstream artifacts |
| **toolscan license (B1)** | ✅ Done — commit `2800f82`, MIT at root. | VERIFIED — API + clone |

**Awaiting external:** the exit-code wave gates only. Everything else is executable now,
gated solely by the authorization matrix (§5.6 of the dispatch).

---

## 2. The toolscan upgrades — what actually exists right now

The owner asked specifically whether we were *reading* the toolscan upgrades. We now have —
full clone, code read, suite executed. **The dispatch's B-queue was stale: B2 and B3 are
already shipped.**

**Repository reality (Alot1z/toolscan, default branch `main`, v2.0.0):**

| Queue item (old plan) | Actual state | Evidence |
|---|---|---|
| **B2 — `toolscan doctor` invariant oracle** | ✅ **SHIPPED** — commit `031c6f1` "feat: add doctor oracle and fail-closed output contracts" (2026-09-05 01:04:41Z, author Alot1z). `doctor` runs a real bounded scan, audits it (schema · every reported path exists · truncation honesty), exits 0 green / 1 violation / 2 truncated. `auditReport` is exported pure so tests throw hostile payloads at it. **Executed live in this session: ALL GREEN.** | VERIFIED — clone + `git log` + live run |
| **B3 — fail-closed output contract** | ✅ **SHIPPED** (same commit). `check`/`missing` refuse to answer from a truncated scan (exit 2, reason on stderr — never a silent "not found"); `scan` audits its own output against the documented JSON shape **before emission** ("internal contract violation" → exit 1); `drift` never rewrites a baseline from a truncated scan; `list`/`snapshot` exit 2 on truncation. | VERIFIED — `src/cli.ts` read line-by-line |
| **B4 — hostile-input sweep of `parseToolscanOutput`** | 🔄 **Rescoped, still real — but the target moved.** `parseToolscanOutput` is **Ix-side** code (`ix-cli/src/mcp/discovery.ts:81`), not toolscan-side. Toolscan itself now ships a hostile-payload battery (`validateToolEntry`: rejects path separators in names, `.`/`..` names, absurd field sizes, empty fields, unknown `source`, duplicate names, non-absolute paths; plus a producer pin that a launcher named `..cmd` can never degrade to a bare traversal name). **Genuine residuals:** (a) the **Ix consumer parser does not enforce the producer's contract** — it accepts relative/traversal/absurd paths, and the first reported path per name flows into `host.inspect(execBin)`, i.e. **gets executed** during `ix mcp install`; (b) toolscan's own validator does not reject `..` *segments inside* an absolute path (`/a/../../b` passes `isAbsolute`). | VERIFIED — both files read this session |
| **B5 — stays generic core** | ✅ Holds — `src/` (scan/doctor/snapshot/cli) contains no Ix logic, no KB content, no machine-specific paths. `dist/toolscan.mjs` is committed and in sync (contract validator present in the bundle; `--version` 2.0.0; doctor green). | VERIFIED — code read + bundle check |

**New finding — the test suite is Windows-green / Linux-red, and toolscan has no CI:**
running the committed suite on this Linux machine: **42/53 pass, 11 fail — every failure is a
Windows-assumption artifact, not a product defect**: fixtures create `.cmd` launchers
without `chmod +x` (Linux executability = X_OK bit, so the scan correctly finds nothing),
assertions hardcode Windows path strings through `node:path`, and the producer-pin test
expects Windows `basename` semantics (`path.basename("C:\x\..cmd")` = `..cmd` on Windows,
= the whole string on Linux). Empirically proven: the same fixture **is found after
`chmod +x`**. Meanwhile **`.github/workflows/` does not exist** — the suite runs only on
the author's Windows machine, so nothing catches this. This is now real queue work: make
the fixtures cross-platform hermetic and add CI (ubuntu + windows matrix), pinning the
dist-sync rule ("rebuild `dist/` in the same commit as any `src/` change") in the gate.

**v5's own substrate was drifting too:** its toolscan row listed the command set
*without* `doctor` — proof it hadn't re-read the current README/command table. Corrected
in v6 by construction: every queue item names the exact files to read and the evidence
class required before acting.

---

## 3. The installer audit — what the actual code reading already confirms

The owner directed a real audit of the new installer surface that landed in main. The
dispatch's two candidate findings are now **code-verified**, and the reading produced a
**third and a fourth**. All four are README-claims-vs-code drifts of exactly the class
#603 proved can silently survive merges:

| # | Finding | Code evidence (read this session) | Class |
|---|---|---|---|
| a | README line 250 documents `bash scripts/install-skill.sh claude gemini` — **but `gemini` is not a registry id**. As written, the documented example exits 1 with `error: unknown harness id 'gemini'`. The CI **itself** asserts the negative: `! grep -Fq 'gemini'` (ci.yml:372, "Harnesses without a skills convention must not be install targets"). | `install-skill.sh:89–97`; `skill-harnesses.mjs:55–60` (registry = claude/agents/codex/cursor); `ci.yml:372` | VERIFIED |
| b | README lines 237–238 claim **"Gemini's `~/.gemini/skills`"** as a deploy target — while the registry's own header says `~/.gemini` "has extensions/commands only" and gemini is deliberately excluded. | `skill-harnesses.mjs:48–53` | VERIFIED |
| c | **NEW:** README line 238 documents **"Cursor's `~/.cursor/skills`"** — the registry installs to `~/.cursor/skills-cursor`, and the CI pins the correct path (`grep … ~/.cursor/skills-cursor`, ci.yml:369). The README names the wrong directory. | `skill-harnesses.mjs:59`; `ci.yml:369` | VERIFIED — new vs v5 |
| d | README lines 230–232 say the skill tree loads "natively" from "Claude Code, Agents, Codex CLI, **Gemini CLI**, Cursor, **and more**" — overclaim vs a 4-id registry. | README read; registry read | VERIFIED |
| e | Risk-class note (assess, don't fix): the refuse-to-destroy guard `grep -qs '^name: ix$'` can be satisfied by a foreign skill that happens to carry `name: ix` — then `rm -rf` proceeds. Guard order itself is correct (guard → mkdir → rm -rf → cp), and dry-run predicts the real refusal + exit 1 parity (verified at `install-skill.sh:133–191`). | `install-skill.sh:133–160` | VERIFIED |

Also verified as **sound** during the reading (the audit's positive side): unknown-id
erroring (never a silent no-op); `--json` shape `{dryRun, hosts:[{id, action, dest,
detectedVia}]}` with human output silenced via `say()`; `TOOLSCAN_PATH` opt-in only —
never a bare-name PATH execution (both `skill-harnesses.mjs:82–93` and `discovery.ts:60–78`,
with the attack rationale written in the code comments); the `quoteForCmd` mirror guarded
by its drift test; the 8-job `ci-success` gate including two harness smokes (one on a real
windows-2022 runner). Minor observation for the audit: the CI's fake `toolscan.mjs` fixture
emits a shape-minimal `{tools, truncated}` — fine for seam testing, but it would not catch
a toolscan output-contract drift (it is not contract-complete).

The audit itself remains queue item 2 — read-only, hermetic, zero upstream writes; drafted
fix files are held locally and posting anything upstream needs explicit authorization.

---

## 4. The exit-code wave — tracked, gated, not ours to land

- **#547** (Hiro-Chiba): open, MERGEABLE, "no open findings" per KageBinary's comment
  `5549703398` (05:34:22Z, two minutes after merging #591). The gates are **his own plugin
  PRs**: `ix-openclaw-plugin#33` (note: per #547's body, it does not yet cover the
  `hooks/ix-read` path that discards stdout after a non-zero run) and `ix-claude-plugin#38`
  (+ #37 to re-verify — see §1). Already-merged consumers: opencode #20/#21, cursor #26,
  gemini #29.
- **#559** (KageBinary draft): step-2 of his own sequencing; zero action for us.
- **The `resolve.ts:692` residual, corrected:** v5 pinned "resolveFileOrEntity
  (resolve.ts:692) calls `reportAmbiguousTarget`" — in **merged main** there is no
  function named `reportAmbiguousTarget` anywhere, and `resolveFileOrEntity` begins at
  `resolve.ts:575`; those details belong to the **#547 branch's** code, quoted from
  KageBinary's comment. What *is* verifiable in main: `locate.ts:55–63` — on an ambiguous
  target, `ix locate` prints the ambiguity and **returns without setting an exit code →
  exits 0**. The residual is real; the pin was pointing at the wrong tree.
- **Our own footprint on #547 is on record:** Alot1z's coordination comment `5533228304`
  (09-03T23:01Z) — "this overlaps #559 on the same surface, and the two should be
  sequenced deliberately" — which KageBinary agreed with the next day.
- **Standing orders (unchanged):** monitor-only on the gates; the ARMED #547 rebase fires
  only when the gates land **and** you authorize the push (identity routing answered
  first — the train ran as Alot1z, the wave branch lives on Hiro-Chiba's fork); every
  write needs authorization; never "help" uninvited — the sequencing is the maintainer's
  own design and it is working.

---

## 5. What the principles require — and why this report complies

The HOW-CONTRACT's ground-truth rule (§3) says *"plans, docs, and prior reports are
evidence, not truth"* — and the campaign's execution mandate requires every file read
line-by-line with "docs must match code." The owner's question ("are you actually reading
the things such as the toolscan upgrades") is that rule pointed back at our own dispatch,
and the honest answer is: **v5 read the Ix side well (thread probes, raw files) but did
not re-read the toolscan repo itself** — it missed that B2/B3 had landed six hours before
it was written, and carried a toolscan command list that no longer matched the README.
v6 fixes this structurally:

- every queue item now names the **exact files/commits/lines to read** and the evidence
  class required before any claim is acted on;
- the session-start probe now includes **toolscan's HEAD commit** (a dispatch that doesn't
  watch its own target repos goes stale within hours — this becomes a KB row);
- the validation ladder rule "BUILD ≠ RUNTIME SUCCESS" is applied literally: the toolscan
  suite was **executed**, and its 11 Linux failures are runtime evidence, not guesses;
- the evidence classes in this report follow the KB taxonomy (VERIFIED / OBSERVED /
  INFERRED / UNKNOWN), with INFERRED never silently upgraded.

---

## 6. Corrections applied to the plan (v5 → v6, nothing dropped silently)

1. **B2/B3 already shipped** (toolscan `031c6f1`) — reclassified from "future work" to
   "verify and record." Cause: v5 never read toolscan's git log or current README.
2. **B4 rescoped** to the real residuals: Ix-side consumer contract alignment (drafted
   proposal only — Ix writes need authorization) + toolscan-side `..`-segment rejection
   (own repo, pre-authorized).
3. **NEW queue item: toolscan cross-platform test hermeticity + first CI** (fixtures
   `chmod +x` on non-Windows, platform-aware assertions, ubuntu+windows matrix, dist-sync
   pin in the gate).
4. **Third + fourth audit candidates** added (Cursor path drift; "and more" overclaim).
5. **Plugin-gate org corrected** to `ix-infrastructure`; #37 flagged UNKNOWN for re-probe.
6. **`resolve.ts:692` pin re-anchored** to what main actually contains (`locate.ts:55–63`).
7. **Toolscan commit-convention note** (repo's two newest commits carry the owner's
   personal address — the builder's future commits there follow the repo's own log
   convention per KB #6314, defaulting to the noreply form unless you direct otherwise).
8. Everything else carried per the frozen sections: hard policy, section gates, D-LOG
   (D1 rev 9, D2 rev 5 incl. comment-thread-only credit placement), the logo contract and
   its 10 pins, the wave tracker, the reporting contract, and the §13 rules.

---

## 7. What remains — the queue, in order, with its authorization gates

1. **Session-start probe** (light, corrected endpoints — incl. #547 comment page 2, gate
   #37, toolscan HEAD).
2. **Installer audit** (owner-directed; read-only; output `installer-audit.md` with the
   per-merged-PR record table; drafted fixes held locally).
3. **toolscan continuation** (own repo, pre-authorized): record B2/B3 shipped →
   cross-platform test hermeticity → add CI → tighten the validator (`..` segments) →
   B5 pin. The Ix-side consumer alignment is a **drafted proposal awaiting your
   authorization** to file.
4. **Mention sweep — residual surfaces** (read-only; drafted replies only).
5. **Logo follow-ups** (fork work pre-authorized; the upstream PR itself needs your
   "authorize" — after the mandatory rebase onto the moved main).
6. **Wave monitor** + the ARMED #547 rebase (fires only on gates-landed + your push
   authorization).
7. **KB extraction** (incl. the new dispatch-drift lesson).
8. **Final report** per the standing contract.

**Immediate next step:** hand `BUILDER-PROMPT-COMPLETE-v6.md` (this rewrite) to the
builder. Its first actions are the low-cost re-probe and the installer audit — exactly as
you directed. Say "authorize" when you want the logo PR opened, the Ix-side consumer
proposal filed, or the #547 rebase pushed once the gates land.
