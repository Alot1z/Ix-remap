# Kit + suite preflight (2026-09-05, scratch + local only — zero live writes)

Companion to `item9-rebase-runbook.md` (the #605 rebase dry run) and `e1-e8-kit-compliance.md`.

## 1 · Held-kit edits vs current main (`e8ab1926`) — line-for-line check

Probed raw `README.md` / `CONTRIBUTING.md` at main `e8ab1926` (probe script `.kit-apply-preflight.mjs`, output `.kit-apply-preflight.txt`).

| Kit edit | Exact match | Normalized match | Verdict |
|---|---|---|---|
| Installer-1: native-loading overclaim block | 0 (live line-wrap differs from the draft's quoted block) | **1** (unambiguous) | Applies — but the diff at open time must be built from **live text** (whitespace-flexible), not the draft's quoted `from` block |
| Installer-2: deploy-targets block (`~/.gemini/skills` → remove, Cursor → `~/.cursor/skills-cursor`) | 0 (same wrap reason) | **1** (unambiguous) | Same — apply to live text |
| Installer-3: `claude gemini` → `claude agents` | **1 (exact)** | 1 | Applies verbatim |
| #608 fix: CONTRIBUTING step-4 one-liner | **1 (exact)** | 1 | Applies verbatim (replacement intentionally re-embeds the old sentence as its prefix) |

**Action recorded:** the installer `OPENING-KIT.md` step 1 should say "build the branch diff from the live README text at open time" rather than trusting the draft's quoted line-breaks. The three corrections are content-verified present once each — no ambiguity, no double-match.

## 2 · #605 rebased head — local suite spot-verification

The rebase onto `e8ab1926` is **clean and byte-identical** to branch head `0869a137` (dry run in the scratch verify tree; zero file overlap with the 25 wave files). Because the wave did not touch `package.json`/lockfiles, the local dependency set is identical across the base — so a suite run on the branch content transfers to the rebased head.

Run in the scratch `ix-cli` tree (branch content == rebased content):
- `tsc --noEmit` → **clean (0 errors)**.
- `vitest run src/cli/__tests__/bootstrap-notice.test.ts` → **21/21 pass** (16.5 s), covering golden byte-identity (6 fixtures), library ≡ CLI byte-for-byte, `--bg none` invariants, NO_COLOR zero-escapes, `--json` honesty.
- Full 1704-test suite + ubuntu/macos runners: previously green on identical content (recorded in the #605 body and §0); re-runs at the release push are the authoritative full gate.
