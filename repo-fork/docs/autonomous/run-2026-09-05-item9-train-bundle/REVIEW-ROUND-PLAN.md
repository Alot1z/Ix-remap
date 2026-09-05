# Review-response round — complete plan (2026-09-05, plan-first per owner)

Ground-truthed live state (probe `.review-state-probe.mjs` / `.review-detail-probe.mjs`):
- **#609 MERGED** (merge commit `8c0e6b00`) — maintainer verified all four claims and merged standalone. Upstream main README now carries the corrected install section. Train context: the installer part of the train has already landed.
- **#605 open draft** @ `c05c3a77`, one KageBinary review (comment 5554048209) with **3 findings, #1 blocking**:
  1. **BLOCKING — banner unreachable in installed layouts**: `renderBanner()` resolves repo-root paths (`scripts/render-logo.mjs`, `assets/logo.png`) that neither npm pack nor the release tarball ships. Absent-safe fallback silently degrades. Fix direction (reviewer's own): move the two inputs under `ix-cli/` (or stage in `release.yml`) + CI pin like `compass/.version`.
  2. **CodeQL alert is real** — `js/file-system-race` (high) at `scripts/render-logo.mjs:45`: statSync/readFileSync TOCTOU + no `isFile()` + FIFO-hang on user-supplied `--file`. House pattern: open once, fstat the handle, then read from the same handle.
  3. **Two preview PNGs** committed for PR-body benefit only, unpinned — reviewer says drop before leaving draft. (Owner wanted them embedded; resolution below.)
  - Design note (non-finding): renderer is zero-dep ESM — import in-process instead of spawning Node.
- Upstream main head: `8c0e6b00` (the #609 merge). Toolscan head: `4c0b2d11`.

## Track A — #605 findings fix (the blocking PR; highest value)

Local branch prep on fork, no push until owner reviews (Tier: local commits first, per owner's plan-first instruction):

- A1. **Deliverability fix** (finding 1): move `scripts/render-logo.mjs` + `assets/logo.png` under `ix-cli/` (renderer consumes them relative to its own module — update `renderBanner()` root resolution to package-relative, e.g. `dirname(import.meta.url)/../../assets`), keep repo-root copies as source-of-truth with the package build copying them (or move outright — decide during implementation; reviewer accepts either as long as CI pins it). Add CI pin: pack/tarball assertions that the two inputs exist in the shipped layout (pattern: `compass/.version` pin).
- A2. **CodeQL fix** (finding 2): rewrite the file-load path to open-once/fstat-handle/read-handle (house pattern; clears the required check). Also handle non-regular files with a clean error, not a hang.
- A3. **PNG finding** (finding 3): remove the two PNGs from the branch (they were for the PR body). The PR body image URLs point at the fork branch — dropping them breaks the body embed, so the body's Rendered-preview section is rewritten to reference the local showcase (`tui-banner-picture.html` lives in run-dir, not upstream) or the images are re-hosted via the PR comment asset path. Owner decision embedded in branch: drop PNGs + reword body to "preview GIF/PNG available on request" OR keep PNGs and answer the finding with the pin argument. **Default: comply — drop from branch, keep body text description + local showcase.**
- A4. **In-process import** (design note): switch `renderBanner()` from spawn to direct ESM import of the renderer with the 10s-bounded behavior preserved where meaningful — removes the spawn + the existsSync probe finding 1 turns on.
- A5. Re-run full suite + golden pins on the new head (the runbook step-3 discipline, now proven automatable: 1752/1752 + 21/21 achieved on `95b0ad37` this session).
- A6. Update PR body via gated verbatim path: respond to each finding (planned commits), fix the wrong CodeQL-interpretation sentence (reviewer caught it — own the error plainly, no defensiveness), note the PNG removal.
- A7. Reply comment on #605 (only after owner reviews the local branch + says push): point-per-point response, E1–E8 clean, no overclaim.

## Track B — records already proven this session

- B1. Suite proof on rebased head `95b0ad37`: **1752/1752 pass (95 files), typecheck clean, banner pins 21/21, even the parse-pool flake passed** — runbook step 3 is green ahead of release day. Scratch cleaned. Record in runbook + state.
- B2. Note: `npm test` in a bare scratch fails at `build-core-ingestion.mjs` `npm ci` without network/deps — document the workaround (copy `node_modules` for both packages, or run `npm ci` first) in the runbook so release-day execution doesn't trip on it.

## Track C — installer UX kit → upstream issue text (owner-carded)

- C1. Convert U1/U2 (id-labeled install lines + per-host summary table) into an upstream-friendly issue proposal: problem → evidence (from the hermetic demo transcript) → minimal fix → non-goals (no color/spinners/prefix flag). Held in run-dir, opened only after the train releases and with owner's go (no orphan issues; and #609 just merged so the README surface is fresh).
- C2. Keep the CI-compat note (ci.yml greps `would install:` twice — the issue text mentions the exact two-line assertion update so the team can't break CI blind).

## Track D — UX-kit draft-PR branch (green-lit by owner card: "prepare it as a train-style draft-PR branch built from live main, opening only with my explicit go")

- D1. Create fork branch `chore/installer-ux-polish` at upstream main `8c0e6b00` (API ref create).
- D2. Implement U1 (`Installed [$id]:` / `would install [$id]:`) + U3 (`--help`) + U4 (dry-run footer names `--json`) — **U2 table optional-second**; keep diff byte-minimal; update the two CI grep assertions in the same branch (exact lines verified: `ci.yml` grep hits at the two `install_out` blocks).
- D3. Run installer-relevant tests hermetically (HOME → tmp-home; the hermetic demo rig proves the seam works).
- D4. Commit via gh-commit.mjs (verbatim msgfile, watermark-free), push lease-armed. **PR does NOT open** — branch sits ready; title/body files prepared in kit dir; opens as draft only on owner's explicit go.

## Track E — attribution-text wipe (owner: "wiped from any history… not something like that")

Ground-truth result: the exact quoted sentence exists in exactly two places:
1. `Ix-remap/.ts4-verify/agents.md` (line 44–45) — **untracked scratch** (never committed; `git log -S` across all history: zero hits for the sentence; the `#400` hit is an unrelated "strips them" comment about JSON comments).
2. `github-workspace/drafts/repo-blueprint.md` line 41 ("no AI-attribution trailers in committed files (repo guard strips them anyway)") — **committed in github-workspace `cb4dd5d`, local-only repo (no remote)**.
- E1. Ix-remap `.ts4-verify/agents.md`: rewrite the commit-conventions line to plain text with no mention of guards/footers/attribution (or drop the sentence entirely — it's an agent brief, the convention line can just say "conventional commits, author Alot1z"). Since untracked, no history rewrite needed at all.
- E2. github-workspace `repo-blueprint.md`: amend/reword line 41 in a new local commit (repo has no remote, so no live rewrite required; history retains the old blob only locally — owner accepted this by calling for a wipe, and the repo is private-local; if the owner wants history clean too, a filter-repo pass is available on request).
- E3. Repo-wide sweep result (recorded): zero other hits in tracked files of Ix-remap (matches are only in `prompts/architect` policy docs + tool backups, which are the owner's own local policy records defining the rule — not leaks). Toolscan workspace + toolscan remote: zero hits. The quoted sentence as such never reached any public repo.

## Track F — toolscan upgrade (owner: extract/enhance from Ix experience, agents/skill, examples, real integration ref, full HD radar+logo, its own installer, `toolscan install` UX)

Research + plan first (owner's explicit ask), local implementation second:

- F1. **Research pass (done via probes this session):** toolscan remote tree: `src/{cli,doctor,scan,snapshot}.ts`, `docs/{architecture,compatibility,usage}.md`, `agents.md`, `assets/`, `scripts/build.mjs`, `dist/`. Zero attribution text. Brand pass already landed (`4c0b2d11` radar mark + README/CONTRIBUTING). The Ix integration contract (`docs/compatibility.md` + Ix's `TOOLSCAN_PATH` seam + the README section the #609-merged main now carries) is the **live production reference** — that's the "how it's used in a legit real way" story, already true upstream.
- F2. **`skills/toolscan` package** (the Ix-pattern skill): SKILL.md (scan semantics, bounded/truthful contract, JSON shape, `TOOLSCAN_PATH` consumer recipe, doctor) + references/ (output contract, integration guide with the Ix repo as the worked example) + scripts/ (post-install probe). Mirrors `skills/ix` structure 1:1.
- F3. **`toolscan install`-style installer** (Ix `install-skill.sh` pattern adapted): probes harnesses via toolscan itself (dogfooding — the tool discovers its own consumers), same 4-id registry semantics, `--dry-run --json`, hermetic HOME seam. Full user-steps UX (logo → options → install) per owner's ask.
- F4. **Full-HD logo/radar pair** (owner: "radar + toolscan, design-wise smooth"): render the existing radar mark (`assets/`) as a high-res pair (radar + wordmark lockup) using the Ix render-logo pipeline pattern (zero-dep, flat tones, hard edges — the FULL-HD SHARP mode from the #605 showcase work). TUI banner for toolscan in the same style so the installer prints a brand banner like Ix's.
- F5. **`toolscan install` / npx path** (owner question "ix install or npx ix install?"): for toolscan the honest answer is the repo's own zero-dep bundle — `npx github:Alot1z/toolscan` or a published package later; the installer script ships in-repo (no infra host needed — that's the difference from Ix, whose curl path needs the team's host). Grounded in `dist/toolscan.mjs` being directly spawnable.
- F6. All of F2–F5 built locally in the toolscan workspace (`.ts4-verify`), committed to `Alot1z/toolscan` via gh-commit.mjs only after owner reviews (toolscan is the owner's own repo — the no-reviewer/draft discipline still applies to any PR, but direct-to-main commits are the repo's convention).

## Track G — ix install / npx ix install answer (owner question)

Already grounded (install-demo/README.md table + #605 review finding 1): `ix install` as a CLI verb requires the CLI to already be installed — it can't be the bootstrap. The real zero-clone ladder for Ix is: (1) `curl ix-infra.com/install.sh | sh` (team's host, installs Node/backend/CLI), (2) Homebrew formula, (3) `npx @ix/cli` once npmjs-published. What WE can contribute upstream: an `ix install` **subcommand** (post-CLI: installs skills via the harness registry, MCP server config, plugin registration — the "user steps options" UX the owner describes, reusing the #591 registry + the toolscan seam). That's the C3 lifecycle-verbs proposal's natural evolution and belongs as a proposal after the train, not in the current PRs.

## Execution order this round

1. Track B (records — done artifacts, quick).
2. Track E (wipe — 2 file edits + local commit).
3. Track A (findings fix on the fork branch locally; A5 suite rerun; body/comment drafts held).
4. Track D (UX branch on new main; tests; push branch; no PR).
5. Track C (issue text file).
6. Track F (toolscan skill + installer + logo pair; local commits, push after owner review).
7. Records + dispatch §0/§1 + dispatch-check fast + --live.

**Nothing pushes upstream without owner review of this plan's outputs.** The only exception the owner already granted: Track D's branch push ("prepare it as a train-style draft-PR branch" — branch yes, PR no).
