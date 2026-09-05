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
4. **Pre-push range scan** (rewritten history gate):
   `git log --format='%B' e8ab1926..HEAD | node <agent-principles>/tools/scan-stdin.mjs`
   — must exit 0 (messages preserved verbatim from the four original commits;
   no watermark lines).
5. **Lease-armed push** to the fork:
   `gh-commit.mjs push Alot1z/Ix-remap feat/tui-logo-banner <full 40-char new sha> --force-expect c05c3a7764020a68ba2616709484ed1379161a92`
   (API-side lease: only succeeds if the remote head is still the old sha).
6. **Post-push remote re-scan:** re-fetch the remote head;
   `gh api compare c05c3a77...<new>` → pipe commit messages through
   `scan-stdin.mjs`; verify the remote tree equals the dry-run rebased tree.
7. **PR #605 head updates automatically.** Verify: `draft` still `true`,
   `requested_reviewers` still empty, CI re-runs on the new head, the body's
   Rendered-preview image URLs still resolve (they point at
   `output-samples/banner-48/80-truecolor.png` on the branch — the rebase
   preserves both blobs byte-for-byte, so the raw URLs survive the force-push).
   Then the mark-ready step runs (#605 + #609 together).

## Guards

- No `git commit`/`git rebase` outside the scratch/gated flow; author identity
  and messages stay exactly as the four original commits (never rewritten).
- The push is the only live write in this runbook and happens only inside
  item-9 execution with the owner's go.
