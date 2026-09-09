# Item-9 rebase runbook — #605 onto current main (`e8ab1926`)

**Preflighted 2026-09-05 (third pass, real rebase executed, preview commit
included). Result: rebase is CLEAN — 4/4 commits replay with ZERO conflicts**,
and the rebased head tree is **byte-identical to the merge-tree prediction**
(`git merge-tree --write-tree e8ab1926 c05c3a77` → `95b0ad37…`; actual rebase
head tree → `95b0ad37…`). The PR diff after rebase stays **banner-only: 13
files** (banner.ts, bootstrap.ts, bootstrap-notice.test.ts,
render-logo.{mjs,d.mts}, 2 preview PNGs, 7 golden `.ans` fixtures) — the
non-banner file check is empty. Runs only at item 9 with the owner's go,
through the gated push path (pre-push scan → lease-armed push → post-push
remote re-scan).

History of this preflight (kept honest): pass 1's "byte-identical tree" claim
was an artifact of sub-clone object gaps; pass 2 corrected the expectation via
merge-tree; **pass 3 (this one) executed the actual rebase in a fresh clone
with both refs present and matched the prediction**.

## Why

Upstream main advanced past the branch's merge-base: `39d0734` → `e8ab1926`
when the #547/#559 exit-code wave merged (2026-09-05 15:47/15:57Z). #605's
branch (fork `feat/tui-logo-banner`, head `c05c3a77`) sits on the old base.
The preview commit (`c05c3a7`, rendered banner PNGs) touches only
`output-samples/` — verified no `ix-cli/` overlap with the wave — and the
conflict-free result already includes it.

## Topology (verified 2026-09-05, third pass)

- Merge-base of branch with current main: **`39d0734`**.
- Branch = 4 commits over the base: `204028f` (banner) → `ae4b987` (`--bg
  none` + goldens) → `0869a13` (hermeticity) → `c05c3a7` (rendered banner
  preview PNGs).
- Main head: `e8ab1926`. Wave files are disjoint from the branch's files.
- Expected post-rebase head (informational; release-time sha differs by
  committer timestamp): **`40209c5…`** in the scratch run; tree
  **`95b0ad37…`** is the stable identity to check against.

## Exact steps (item 9 execution)

1. **Scratch clone (both refs present):** clone the fork, then
   `git fetch https://github.com/ix-infrastructure/Ix.git main` so `e8ab1926`
   AND the branch head exist in the same repo (a bare `git fetch origin main`
   into a fork clone does NOT bring the upstream head — pass 3 proved this;
   fetch the upstream URL explicitly and re-check `git rev-parse FETCH_HEAD`
   = `e8ab1926…`).
2. **Rebase locally:**
   ```
   git checkout -B _p c05c3a7764020a68ba2616709484ed1379161a92
   git rebase --onto FETCH_HEAD 39d0734 _p
   ```
   Preflight says no conflicts (4/4 clean, three passes); if any appear
   despite the disjoint-file proof, resolve and note (expected: none).
3. **Verify the new head:** `git rev-parse _p^{tree}` must equal
   **`95b0ad3739102840568289d00bfc2cf341476c97`** (the merge-tree identity —
   if main moved since, re-derive with `merge-tree` instead of failing). Then
   full `ix-cli` suite + `tsc --noEmit` + lint on Windows (runners re-run
   ubuntu/macos at push); golden byte-identity + `--bg none` pins must stay
   green; `git diff --name-status FETCH_HEAD _p` = the 13 banner files only.

   **UPDATE 2026-09-05 (post-review fix round):** #609 MERGED → main is now
   `8c0e6b00`; KageBinary's #605 review (3 findings + design note) is
   addressed on the fix head **`17d2da4`** (branch `feat/tui-logo-banner`,
   local; 5 commits over `8c0e6b00`, diff = 13 files, +797/−7): renderer+asset
   moved INTO `ix-cli/` and imported in-process (dynamic import behind a
   package-relative probe — static import crashed the watch child runtime
   cache, found by running the suite), npm-pack + release-staging deliverability
   pins (staging gate refuses to publish without the inputs), TOCTOU fixed via
   open-once/fstat-handle read, preview PNGs dropped from the branch (preserved
   on `meta/logo-previews` + run-dir copies for the PR body). Verified on the
   fix head: **full suite 1755 passed / 21 skipped, typecheck clean, compiled
   `dist/cli/banner.js` renders (25 lines) in the installed layout, `npm pack`
   carries all three inputs, banner pins green.** Release-day tree identity is
   now `36add793…` (fix head), superseding `95b0ad37…` above; the rebase onto
   a future main repeats the same merge-tree/identity check.

   **PROVEN GREEN 2026-09-05 on exactly this tree:** `tsc --noEmit` clean;
   full suite **1752 passed / 21 skipped (1773), 95/95 files** — including
   the Windows `parse-pool` timing test, which passed this run; banner pins
   **21/21**. Gotcha for release-day execution: in a bare scratch clone,
   `npm test` fails inside `build-core-ingestion.mjs` (`npm ci` needs network
   / the scratch has no deps) and `tsc` is absent. Workaround proven: copy
   `ix-cli/node_modules` AND `core-ingestion/node_modules` from a working
   tree, run `node scripts/build-core-ingestion.mjs` once, then
   `npx vitest run` + `npx tsc --noEmit`. (10 of 11 initial failures were the
   missing `core-ingestion/dist`, not the code; the 11th was parse-pool,
   green on the real pass.)

   **UPDATE 2026-09-05 (PUSHED — fix head is live):** `feat/tui-logo-banner`
   = **`17d2da44`** on the fork (lease-armed push, post-push re-scan CLEAN;
   the compare-scan false positive from main's own pre-guard history is
   documented below). PR body edited: Rendered-preview → `meta/logo-previews`
   (branch created on the fork @ `7bd67132`, raw URLs verified HTTP 200),
   pack/release pins described in "What this ships", head line = `17d2da44`.
   Review reply posted (comment `5554982515`) addressing all 3 findings +
   design note. Upstream issue **#611** opened (installer output labels +
   per-host summary) from the held U1/U2 draft. Preview PNGs regenerated
   from the goldens WITHOUT the unset-background bar (previous conversion
   painted pre-SGR cells black; terminal shows the user's default bg).
   Remaining to mark-ready: wait for CI green on `17d2da44` (incl. CodeQL),
   then flip draft→ready — #609 already merged, so this is now the last
   train component.
4. **Pre-push range scan** (rewritten history gate):
   `git log --format='%B' 8c0e6b00..HEAD | node <agent-principles>/tools/scan-stdin.mjs`
   — must exit 0 (messages preserved verbatim from the original commits;
   no watermark lines).
   **Lessons from the 2026-09-05 execution:** (a) scan the range from the
   BASE MAIN commit (`8c0e6b00..HEAD`), not `oldRemoteHead...HEAD` — a
   rewritten-history compare vs the old fork point drags in main's own
   pre-guard commits (`e8ab1926`, `5f352b69` carry legacy Claude footers
   from before KB #6590's guard) and false-refuses a clean push. (b) The
   scratch clone needs the real fork remote: `git remote add fork
   https://github.com/Alot1z/Ix-remap.git` (the snapshot-era clones chain
   from local dirs). (c) A git-binary push (`--force-with-lease`) is the
   documented path for locally rewritten history — API ref-update alone
   cannot upload new objects. (d) `gh api -f title=@file` reads the LITERAL
   string as the value — read the file into a shell var first (cost: issue
   #611 opened with a wrong title for ~30 s, fixed by PATCH).
5. **Lease-armed push** to the fork:
   `gh-commit.mjs push Alot1z/Ix-remap feat/tui-logo-banner <full 40-char new sha> --force-expect c05c3a7764020a68ba2616709484ed1379161a92`
   (API-side lease: only succeeds if the remote head is still the old sha).
6. **Post-push remote re-scan:** re-fetch the remote head;
   `gh api compare c05c3a77...<new>` → pipe commit messages through
   `scan-stdin.mjs`; verify the remote tree equals the dry-run rebased tree.
7. **PR #605 head updates automatically.** Verify: `draft` still `true`,
   `requested_reviewers` still empty, CI re-runs on the new head, the body's
   Rendered-preview image URLs still resolve (they point at
   `meta/logo-previews`, a refs-only branch that force-pushes to the feature
   branch never touch — this is exactly why the previews were moved off the
   PR branch).
   **MARK-READY SEQUENCE (final, 2026-09-05):**
   1. CI green on `17d2da44` (all required checks + CodeQL run completes).
   2. `gh pr ready 605` (or API equivalent) — the ONLY train component left;
      #609 merged standalone at `8c0e6b00`, so the original "mark together"
      pairing is obsolete: mark ready when CI is green, no coordination left.
   3. Post-release: follow upstream issue #611 for the U1/U2 output polish;
      the local `chore/installer-ux-polish` branch (`44fbb54`) holds the
      partial implementation and can be offered as a PR on owner go.

## Guards

- No `git commit`/`git rebase` outside the scratch/gated flow; author identity
  and messages stay exactly as the four original commits (never rewritten).
- The push is the only live write in this runbook and happens only inside
  item-9 execution with the owner's go.

## MARK-READY — ALL CONDITIONS MET (2026-09-06 session)

- Fix head **`2f96047`** pushed (adds the CI-budget commit on top of `17d2da44`).
- **CI: ALL 27 checks pass** on `2f96047`, including `CI Passed`, `Test (ubuntu-latest · node 22)`
  (the 3 banner pins had timed out at the 5s default under coverage; now budgeted like the
  byte-identity pins), all CodeQL jobs, all Test/Package matrix jobs.
- **The ONLY remaining step: `gh pr ready 605`** (or API: PATCH pulls/605 draft=false) — owner go.
- Post-ready: watch KageBinary's re-review; #611/#612 are the follow-up discussion surfaces.
