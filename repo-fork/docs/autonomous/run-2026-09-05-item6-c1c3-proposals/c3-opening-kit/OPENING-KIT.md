# Opening kit — C3 skill lifecycle verbs (DRAFT ONLY · opens only with the owner's go)

**Status:** DRAFT ONLY, held locally. **Zero upstream writes.** Nothing opens until the owner gives an explicit go — and per D8 this install surface is upstream-owned after #591, so even at a go this opens as a **draft for feedback**, expecting upstream steering (accept, reshape, or decline are all fine outcomes).

**Body standard (universal, RULE 0 §5.9 + KB #6646):** DRAFT framing; feedback/suggestions explicitly welcomed at any stage; issues addressed on-branch and merged without conflict; nothing promised beyond what the PR ships. Open `draft: true` from the start; verify `requested_reviewers` empty after open (KB #6646).

## Files

| File | Purpose |
|---|---|
| `c3-pr-title.txt` | Verbatim PR title (conventional `feat(install): …`) |
| `c3-pr-body.md` | Verbatim PR body — welcome-feedback standard; proposes `list`/`update`/`remove`; scope excludes an `ix` CLI subcommand (D8) |
| `../C3-skill-lifecycle-verbs.proposal.md` | The design source (full detail: verb semantics, marker discipline, CI cost, credit note) — unchanged |

## What the PR would carry (when opened, with your go)

1. **Branch:** new fork branch off upstream main carrying `scripts/install-skill.sh` + smoke-job coverage from the proposal.
2. **Open:** against `ix-infrastructure/Ix` `main`, **as a draft**, title/body verbatim from the two files above, via the gated path (verbatim, watermark-free).
3. **Post-open verify:** `requested_reviewers` empty; if anything is present, remove or recreate draft-from-open per RULE 0 (KB #6646).
4. **CI:** the existing harness-smoke jobs grow (list/update/remove legs, hermetic homes) — 8-job gate unchanged.

## Explicit caveats (kept honest)

- **Not in the current release set** — this kit opens only after the banner/docs/toolscan train releases, at the owner's go.
- **D8:** the merged install surface is the maintainer's; this is a contribution proposal, not a commitment — upstream may reshape or decline.
- **No `ix skill add` CLI subcommand here** — that is a separate proposal against the CLI (C3-adjacent), recorded as such, not folded into this PR.
- Nothing in the body promises behavior beyond what ships.
