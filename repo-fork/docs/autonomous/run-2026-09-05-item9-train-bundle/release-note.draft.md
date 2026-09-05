# Release note — copy-paste ready (item 9, posted at mark-ready on the owner's go)

Posted as a comment on **#605** and on **#609** at the moment each is marked ready. One voice, no filler, nothing beyond what ships.

## Note for #605 (logo banner)

> Releasing this with the coordinated set (terminal logo banner · installer README-claims fix · toolscan output-contract hardening).
>
> What this PR ships: the first-run logo banner — `scripts/render-logo.mjs` renders `assets/logo.png` at print time (zero dependencies: PNG decode → inflate → unfilter → supersample → flat 5-tone snap → half-block), truecolor with ANSI-256 and ASCII fallbacks, `--bg brand`/`--bg none`, honest `--json`, absent-safe fallback to the plain text heading, golden fixtures + 21 hermetic pins, and rendered preview PNGs in `output-samples/`. Rebased onto current main (`e8ab1926`).
>
> The docs-only companion (installer README claims, #609) ships with it. Feedback landed in the draft period has been folded in; nothing else changes in this PR.

## Note for #609 (installer README-fix)

> Releasing this with the coordinated set (terminal logo banner · installer README-claims fix · toolscan output-contract hardening).
>
> What this PR ships: a docs-only correction of the README's install surface — the native-loading overclaim trimmed to the registry's real ids, deploy targets corrected to `~/.cursor/skills-cursor`, and the documented example changed from `claude gemini` (exits 1) to `claude agents`. One file; the registry and installer behavior are unchanged and were correct as merged (#591). Companion to #605 (terminal logo banner), released together.

## Posting rules
- Posted via the gated path (verbatim file, watermark-free) at the mark-ready moment only.
- Both notes name the same set; neither promises anything beyond the PRs.
