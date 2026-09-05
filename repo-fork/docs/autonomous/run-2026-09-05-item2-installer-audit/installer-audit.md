# Installer audit — merged `scripts/install-skill.sh` + harness registry surface

Date: 2026-09-05 · Target: `ix-infrastructure/Ix` main @ `39d0734` (#591 merge, unchanged since — live probes this session)
Files read (line-by-line): `README.md`, `scripts/install-skill.sh`, `ix-cli/scripts/skill-harnesses.mjs`, `.github/workflows/ci.yml`
Scope: README-claims-vs-code drifts of the class #603 proved can silently survive merges, plus a positive-side verification of the installed surface.
Status: **CAPTURE ONLY — zero upstream writes. Nothing in this doc or the accompanying draft has been submitted, committed, or posted.** The drafted fix (`installer-docs-fix.draft.md`, same dir) is held locally and would ride the train as a draft PR at dispatch item 9, with authorization — never piecemeal, never ready before the whole train.

## Findings (all VERIFIED — re-derived from live main this session)

| # | Location (main@39d0734) | Documented claim | Reality | Evidence |
|---|---|---|---|---|
| a | README.md:250 | `bash scripts/install-skill.sh claude gemini` | gemini is not a registry id — as written the command exits 1 with `error: unknown harness id 'gemini'` + `valid ids: claude agents codex cursor`. The CI itself asserts the negative (`! grep -Fq 'gemini'`). | install-skill.sh:89–97 (unknown-id error + exit 1); skill-harnesses.mjs:44–63 (registry = claude/agents/codex/cursor); ci.yml:372 |
| b | README.md:237–238 | "Gemini's `~/.gemini/skills`" listed as a deploy target | gemini is deliberately excluded: its dir has "extensions/commands only", no skills convention; the registry header documents the exclusion. | skill-harnesses.mjs:48–58 (header comment + absent id); ci.yml:371–372 |
| c | README.md:238 | "Cursor's `~/.cursor/skills`" | the registry installs to `~/.cursor/skills-cursor` (verified against Cursor's actual convention, "NOT `~/.cursor/skills`"); the CI pins the correct path. The README names the wrong directory. | skill-harnesses.mjs:59 + 51–52; ci.yml:369 |
| d | README.md:231–232 | skill tree loads "natively" from "Claude Code, Agents, Codex CLI, Gemini CLI, Cursor, and more" | overclaim vs the 4-id registry; gemini is excluded by design and "and more" names no registry member. | skill-harnesses.mjs:44–63 |
| e | install-skill.sh:140 (risk note — assess, do not fix) | refuse-to-destroy guard `grep -qs '^name: ix$' "$dest/SKILL.md"` | a foreign skill that happens to carry `name: ix` in its frontmatter satisfies the guard, and `rm -rf "$dest"` (line 180) proceeds. Guard ORDER is sound (guard → mkdir → rm → cp) and dry-run predicts the real refusal + exit-1 parity (lines 142–150, 187–191). Not a README drift; recorded for the maintainer's risk assessment only. | install-skill.sh:133–191 |

## Positive side (verified sound)

- Unknown harness id → hard error + exit 1, never a silent no-op, valid ids printed (install-skill.sh:89–97).
- `--json` report shape `{dryRun, hosts:[{id, action, dest, detectedVia}]}`; human output routed through `say()` so stdout stays parseable (install-skill.sh:96–104, 148–170).
- `TOOLSCAN_PATH` is opt-in only; `resolveToolscan` never executes a bare `toolscan` name from PATH — a `.mjs` path runs under `process.execPath`, and a foreign executable requires an explicit opt-in (skill-harnesses.mjs:82–93; the attack rationale is written in the code comments).
- `quoteForCmd` mirror guarded byte-identical against the TS original by a drift test (skill-harnesses.mjs:104–119).
- 8-job `ci-success` gate including two harness smokes (one on a real windows-2022 runner), with negative pins asserting non-target harnesses never become install targets (ci.yml:369–372).
- Minor observation (not a defect): the CI's fake toolscan fixture emits a shape-minimal `{tools, truncated}` — fine for seam testing, but not contract-complete, so it would not catch a toolscan output-contract drift.

## The drafted fix — what it is and is not

`installer-docs-fix.draft.md` (same dir) proposes a **README-only correction** (drops the gemini example/claims and the wrong Cursor path, tightens the overclaim to the four real registry ids). It changes **no product code and no registry entry**: the registry is correct and the gemini exclusion is deliberate — the drift is entirely in the docs, and only the docs are drafted.

What rides the train at item 9: the README correction, as a draft PR, clearly framed as part of the coordinated train (same rule as every other piece — nothing opens ready). What does not: no gemini support addition, no registry change, no change to the merged toolscan seam text — that link remains upstream's own accepted text and is never re-litigated unprompted.

## Standing context

- These findings were first verified in the v6 status report and are re-derived here from live main for the record; nothing in them has moved upstream.
- The drafted fix joins dispatch item 9 (train release) and opens only when the owner gives the go — matching RULE 0 / D9 (nothing opens ready; drafts only, train-framed).
