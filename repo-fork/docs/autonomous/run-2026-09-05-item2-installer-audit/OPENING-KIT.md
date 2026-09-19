# Opening kit — installer README-fix train part (**OPENED — draft PR #609**, 2026-09-05)

**Status:** **OPENED live as draft PR #609** (2026-09-05, owner's go — Tier A.3). Branch `feat/installer-readme-fix` @ `b77c4f52` off upstream main `e8ab1926`, README.md only (the 3 corrections applied from the live text), title/body verbatim below, **requested reviewers: none** (post-open verified). Mark-ready of the trio (#605/#609/#610) remains gated at item 9. The fix content is unchanged from the item-2 audit.

**Body standard (universal, RULE 0 §5.9 + KB #6646):** DRAFT + train framing; feedback/suggestions/inspiration explicitly welcomed at any stage; any issue found is addressed on-branch and merged without upstream conflict; nothing promised beyond what the PR ships. No review requests on drafts — open `draft: true` from the start and verify `requested_reviewers` is empty after open.

## Opening checklist (universal standard — every prepared draft body must pass, added 2026-09-05)

1. **Status header** — `Status: DRAFT — part of a larger train`, naming the same coordinated set as the other train bodies.
2. **Feedback line verbatim** — “Feedback and suggestions are welcome at any stage. Each point is addressed on this branch — folded in or answered — and merged without conflict.”
3. **Accuracy line** scoped to this PR's own change (installer: “The change below is accurate and complete; the branch may still move.”).
4. **Scope section** — explicit, promising nothing beyond what the PR ships.
5. **No do-not-review / ignore-this framing anywhere** — grep the body before open; any hit is a defect (RULE 0 §5.9, KB #6646, #6653).
6. **Post-open verify** — `requested_reviewers` empty (draft-from-open; KB #6646).

Side-by-side proof that the train speaks with one voice: `draft-body-comparison.html` in the item-9 bundle (this body vs the live #605 body).

## Files

| File | Purpose |
|---|---|
| `installer-pr-title.txt` | Verbatim PR title (conventional `docs(install): …`) |
| `installer-pr-body.md` | Verbatim PR body — new-standard welcome-feedback framing, train-framed, README-only scope stated, evidence inline (no local-path references) |
| `installer-docs-fix.draft.md` | **The fix content** — three README corrections with before/after text (findings a–d). **Unchanged.** |
| `installer-audit.md` | The evidence behind each change (line-level against main `39d0734`) |

## What the PR carries (opened 2026-09-05)

1. **Branch:** new fork branch off upstream main (re-base to the current head at open time — now `e8ab1926`) carrying **only** `README.md` with the three corrections from `installer-docs-fix.draft.md` (native-loading overclaim trimmed · deploy targets corrected to `~/.cursor/skills-cursor` · `claude gemini` → `claude agents`). **Build the README diff from the live text at open time**: the draft quotes pre-wrap line breaks, and the live file wraps differently — all three corrections are content-verified present once each at `e8ab1926` (preflight 2026-09-05, `kit-and-suite-preflight.md`), so a whitespace-flexible replace is unambiguous.
2. **Open:** against `ix-infrastructure/Ix` `main`, **as a draft** (`draft: true` at create) with title/body verbatim from the two files above, via the gated `gh-pr.mjs`-equivalent path (verbatim, watermark-free).
3. **Post-open verify:** `GET /pulls/{n}/requested_reviewers` empty (draft-from-open gets no code-owner request — KB #6646); if anything is present, remove or recreate per RULE 0.
4. **CI:** the harness-install smoke jobs run on the branch (docs-only change — expected green; the corrected example is also the registry's own negative pin).

## Not in this train part (deliberately)

- No registry/product change; gemini/opencode/openclaw/vscode stay non-targets.
- No edit to the refuse-to-destroy guard or any code behavior (finding e = risk-class note for the maintainer).
- No edit to the merged toolscan seam text.
- Nothing promised in the body beyond what the PR ships.
