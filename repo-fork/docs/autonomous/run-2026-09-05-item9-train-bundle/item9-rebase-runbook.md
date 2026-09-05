# Item-9 rebase runbook — #605 onto current main (`e8ab1926`)

**Preflighted 2026-09-05 in a scratch verify tree (`.logo-verify`, read-only). Result: rebase is CLEAN — zero conflicts, and the rebased tree is byte-identical to the branch (`git diff <newhead> 0869a137` empty).** Runs only at item 9 with the owner's go, through the gated push path (agent-principles: pre-push scan → lease-armed push → post-push remote re-scan).

## Why

Upstream main advanced past the branch's merge-base: `39d0734` → `e8ab1926` when the #547/#559 exit-code wave merged (2026-09-05 15:47/15:57Z). #605's branch (fork `feat/tui-logo-banner`, head `0869a137`) sits on the old base.

## Topology (verified)

- Merge-base of branch with current main: **`39d0734`**.
- Branch = 3 commits over the base: `204028f` (banner) → `ae4b987` (`--bg none` + goldens) → `0869a13` (hermeticity).
- Main head: `e8ab1926`.
- **Zero file overlap** between the wave's 25 files (all `ix-cli/src/cli/{commands,…}`, `resolve.ts`, `ui.ts`, `mcp/server.ts`, their tests, `docs/llm-format.md`) and the branch's 11 files (`ix-cli/src/cli/{bootstrap,banner,bootstrap-notice.test}.ts`, `scripts/render-logo.{mjs,d.mts}`, `output-samples/*`).

## Exact steps (item 9 execution)

1. **Scratch fetch:** in a verify clone, `git fetch upstream main` (→ `e8ab1926`) and fetch the fork branch (`Alot1z/Ix-remap` `feat/tui-logo-banner` @ `0869a137`). Confirm `merge-base = 39d0734`.
2. **Rebase locally:**
   ```
   git checkout -B feat/tui-logo-banner-rebase <fork>/feat/tui-logo-banner
   git rebase --onto e8ab1926 39d0734
   ```
   Preflight says no conflicts; if any appear despite the zero-overlap proof, resolve and note (expected: none).
3. **Verify the new head:** full `ix-cli` suite + `tsc --noEmit` + lint on Windows (runners re-run ubuntu/macos at push); golden byte-identity + `--bg none` pins must stay green; confirm `git diff <newhead> 0869a137` is empty (content drift = zero).
4. **Pre-push range scan** (rewritten history gate): `git log --format='%B' e8ab1926..HEAD | node <agent-principles>/tools/scan-stdin.mjs` — must exit 0 (messages preserved verbatim from the three original commits; no watermark lines).
5. **Lease-armed push** to the fork: `gh-commit.mjs push Alot1z/Ix-remap feat/tui-logo-banner <full 40-char new sha> --force-expect 0869a137618152f907aea3d92cc0f2f0020cd8a9` (API-side lease: only succeeds if the remote head is still the old sha).
6. **Post-push remote re-scan:** re-fetch the remote head; `gh api compare 0869a137...<new>` → pipe commit messages through `scan-stdin.mjs`; verify the remote tree equals the preflight-rebased tree.
7. **PR #605 head updates automatically** to the new sha. Verify: `draft` still `true`, `requested_reviewers` still empty, CI re-runs on the new head (the CodeQL infra race clears on the branch update). Then the mark-ready step runs.

## Guards

- No `git commit`/`git rebase` outside the scratch/gated flow; author identity and messages stay exactly as the original three commits (never rewritten).
- The push is the only live write in this runbook and happens only inside item-9 execution with the owner's go.
