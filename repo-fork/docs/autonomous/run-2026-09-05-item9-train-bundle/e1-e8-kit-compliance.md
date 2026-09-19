# E1–E8 compliance pass — every upstream-facing draft body (2026-09-05)

Source of the expectations: `joseph-review-expectations.md` + KB #6654 (josephismikhail's review patterns). Grounding: every claim re-probed at **current main `e8ab1926`** — note upstream main advanced past `39d0734` on 2026-09-05 when the **#547/#559 exit-code wave merged** (the campaign's long-pending "awaiting external" item). All kit substance was re-verified at the new head; genuine violations were fixed.

| Kit | E's checked | Verdict | Fixes applied |
|---|---|---|---|
| **#605 logo draft (LIVE + `.logo-pr-body-v2.md`)** | E1 claim accuracy, E3 (no links), E4 (no wire claims), E6 (validation cited), E7 (no Closes), E8 scope | **VIOLATION → fixed live** | (a) CI count was stale ("22/23 checks green") vs the head's re-run state → rephrased to "all checks green except the single documented CodeQL infra-race run" (run `101317167251`); (b) "Rebased onto current main (`39d0734`)" no longer true → corrected to "main at the last branch update … has since advanced to `e8ab1926` (wave merged); a final rebase runs before mark-ready". Edited via the gated verbatim path; **draft stays draft, reviewers still 0 (live-verified)**. |
| **Installer README-fix kit (`installer-pr-body.md`)** | E1 (examples runnable), E2 (edition/registry claims), E3 (no links), E7, E8 (README-only scope) | **PASS — no change** | Registry still exactly `claude/agents/codex/cursor` at `e8ab1926`; README at the new head still carries the wrong `claude gemini` example and lacks `~/.cursor/skills-cursor` → the three corrections remain warranted on current main; `name: ix` guard present. |
| **C3 install-ease kit (`c3-pr-body.md`)** | E5 (8-job gate exists), E6 (smoke claims framed planned), E8 (proposal scope + not-in-set caveat) | **PASS — no change** | `ci.yml` at `e8ab1926` still has the harness-smoke legs + `ci-success`; `install-skill.sh` still carries the `name: ix` marker; body promises nothing beyond the proposal. |
| **#608 fix-PR kit (`fix-pr-body.md`)** | E1 (diff exactness), E3, E7 (Refs #608), E8 (one-file scope) | **VIOLATION (grounding) → fixed locally** | Step-4 line of CONTRIBUTING.md re-verified **unchanged at `e8ab1926`**; the kit's "grounded at main `39d0734`" references refreshed to `e8ab1926` with a note that main advanced (wave merge). Held as a draft kit — opens only at train release. |

## Shared notes
- The wave merge (#547/#559) is not part of our train; it changes the release picture only in that **#605 must rebase onto `e8ab1926` before mark-ready** (recorded in §0 and ITEM-9-BUNDLE §2).
- No kit carries "do not review" framing, a `Closes`, a fabricated example, or a claim outside the PR's scope.
