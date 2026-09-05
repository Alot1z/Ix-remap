# Opening kit — installer README-fix train part (DRAFT ONLY · opens only at item 9 with the owner's go)

**Status:** DRAFT ONLY, held locally in this run-dir. **Zero upstream writes** — no branch, no PR, nothing opens until dispatch **item 9 (train release)** executes with the owner's explicit go. The fix content is unchanged from the item-2 audit; this kit only makes it open-ready on the campaign's standard.

**Body standard (universal, RULE 0 §5.9 + KB #6646):** DRAFT + train framing; feedback/suggestions/inspiration explicitly welcomed at any stage; any issue found is addressed on-branch and merged without upstream conflict; nothing promised beyond what the PR ships. No review requests on drafts — open `draft: true` from the start and verify `requested_reviewers` is empty after open.

## Files

| File | Purpose |
|---|---|
| `installer-pr-title.txt` | Verbatim PR title (conventional `docs(install): …`) |
| `installer-pr-body.md` | Verbatim PR body — new-standard welcome-feedback framing, train-framed, README-only scope stated, evidence inline (no local-path references) |
| `installer-docs-fix.draft.md` | **The fix content** — three README corrections with before/after text (findings a–d). **Unchanged.** |
| `installer-audit.md` | The evidence behind each change (line-level against main `39d0734`) |

## What the PR would carry (when opened, at item 9, with your go)

1. **Branch:** new fork branch off upstream main (re-base to the current head at open time) carrying **only** `README.md` with the three corrections from `installer-docs-fix.draft.md` (native-loading overclaim trimmed · deploy targets corrected to `~/.cursor/skills-cursor` · `claude gemini` → `claude agents`).
2. **Open:** against `ix-infrastructure/Ix` `main`, **as a draft** (`draft: true` at create) with title/body verbatim from the two files above, via the gated `gh-pr.mjs`-equivalent path (verbatim, watermark-free).
3. **Post-open verify:** `GET /pulls/{n}/requested_reviewers` empty (draft-from-open gets no code-owner request — KB #6646); if anything is present, remove or recreate per RULE 0.
4. **CI:** the harness-install smoke jobs run on the branch (docs-only change — expected green; the corrected example is also the registry's own negative pin).

## Not in this train part (deliberately)

- No registry/product change; gemini/opencode/openclaw/vscode stay non-targets.
- No edit to the refuse-to-destroy guard or any code behavior (finding e = risk-class note for the maintainer).
- No edit to the merged toolscan seam text.
- Nothing promised in the body beyond what the PR ships.
