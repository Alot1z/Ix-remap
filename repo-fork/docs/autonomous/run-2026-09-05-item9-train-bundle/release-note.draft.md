# Release note — copy-paste ready (item 8, posted at mark-ready on the owner's ticked go)

Posted as a comment on **#605** at the mark-ready moment. Refreshed 2026-09-05 at execution time per the drift protocol: names the final head SHA at posting time and the fresh probe-time CI state — never a stale or merely-originating anchor. #609 has no note: it is already merged (`8c0e6b00`), so there is no mark-ready moment for it.

## Note for #605 (terminal logo banner)

> Releasing this PR — it ships the first-run terminal logo banner.
>
> Head at mark-ready: `2f9604772c19575ab9207138f6363523634dd44b`. CI on this head at posting time (fresh probe): 28 checks succeeded, 3 skipped, 0 failed. Base = current main (`8c0e6b00`).
>
> What this PR ships: the first-run logo banner — `ix-cli/scripts/render-logo.mjs` renders the package-resident `ix-cli/assets/logo.png` at print time (zero dependencies: PNG decode → inflate → unfilter → supersample → flat 5-tone snap → half-block), truecolor with ANSI-256 and ASCII fallbacks, `--bg brand`/`--bg none`, honest `--json`, and an absent-safe fallback to the plain text heading in every delivery layout — npm pack carries the renderer, types, and asset (pinned by test) and release staging refuses without them. Asset reads are race-free (open-once → fstat → isFile → read the same fd). Rendered preview PNGs live on the `meta/logo-previews` branch, embedded in this PR's description; the branch itself carries only referenced assets. Golden fixtures + hermetic pins throughout.
>
> The docs-only companion (#609, installer README claims) is already merged on main. Feedback landed in the draft period has been folded in; nothing else changes in this PR.

## Posting rules
- Posted via the gated path (verbatim file, watermark-free) at the mark-ready moment only, on #605.
- If the head advanced after this refresh: re-run the drift protocol — update this note to the new head + fresh CI before posting. Never post a stale anchor.
