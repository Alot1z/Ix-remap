# Ix Campaign — Complete Package (2026-09-05)

Everything current from the 2026-09-05 session, in one zip: the status report, the v6
builder dispatch (single source of truth), the sharp TUI logo deliverable, the full
supersession chain, and the session worklog. Nothing here is new content — this package
bundles and verifies what already exists.

## Read-first map (60 seconds)

| You want… | Open |
|---|---|
| The state of the campaign (what merged, what's gated, why — evidence-classed) | `latest/IX-CAMPAIGN-STATUS-REPORT-EN-2026-09-05.md` |
| The dispatch to hand the builder (queue, pin map, wave tracker) | `latest/BUILDER-PROMPT-COMPLETE-v6.md` |
| The sharp TUI logo package (renderer + asset + golden samples + preview page) | `latest/ix-tui-logo-sharp/` — start at its `README.md` |
| What v5/v4 got wrong (ledgered corrections — nothing dropped silently) | `archive/` + §0.5 of each doc |
| The audit trail behind every claim in this zip | `worklog.md` (Tasks 1–7) |

## State of the world in one breath (as of build time)

- **#591 new installer** — MERGED upstream 2026-09-05T05:32Z (carried via #603 with your
  authorship preserved; the parity conflict was resolved on your fork branch for you).
- **#547 exit codes** — ready on the merits, intentionally gated on the maintainer's own
  plugin PRs (ix-openclaw-plugin#33, ix-claude-plugin#37/#38). Do not push.
- **#559 (locate)** — maintainer's personal draft, same gate. No action needed.
- **TUI logo** — never submitted upstream, by design. Fork branch `feat/tui-logo-banner`
  @ `d2876f5`; master has moved (~20 PRs) so a rebase is mandatory before any PR.
  Opening that PR needs your explicit "authorize".
- **C1/C3 (skills.sh-inspired installer evolution)** — planned only, shelved.
- **Attribution rule in force:** skills.sh credit lives in PR/issue comment threads ONLY,
  never in any committed file (including design docs).

## Verify this package (30 seconds, needs Node >= 18)

```bash
cd IX-CAMPAIGN-COMPLETE-2026-09-05/latest/ix-tui-logo-sharp
node scripts/render-logo.mjs --file assets/logo.png --width 80 --color 256 --json  # exit 0
node scripts/render-logo.mjs --file assets/logo.png --width 80 --color 256 \
  | cmp - output-samples/banner-80-256.ans && echo "golden sample: byte-identical"
sha256sum assets/logo.png
# -> 6c40a9b846301242047d9cc81fd762d8fb20e4182d2df83fd30bd21cf21f6e26
```

Everything else in this zip is plain Markdown — no install, no dependencies.

## Layout

```
IX-CAMPAIGN-COMPLETE-2026-09-05/
├── README.md                <- this file
├── MANIFEST.md              <- every file, byte size, sha256, status
├── worklog.md               <- session log, Tasks 1-7 (the audit trail)
├── latest/                  <- CURRENT — read/execute from here
│   ├── BUILDER-PROMPT-COMPLETE-v6.md
│   ├── IX-CAMPAIGN-STATUS-REPORT-EN-2026-09-05.md
│   └── ix-tui-logo-sharp/   (renderer, asset, 6 golden samples, preview page, README)
└── archive/                 <- SUPERSEDED — for the record only, do not execute
    ├── BUILDER-PROMPT-COMPLETE-v5.md
    ├── BUILDER-PROMPT-COMPLETE-v4.md
    └── planner-v3-revision-brief.md
```

Note: the logo package also ships standalone as `ix-tui-logo-sharp.zip` in the same
download location; it is not nested inside this zip (no zip-in-zip). The root-level
`ix-tui-logo-preview.html` from the session is byte-identical to the copy already inside
`latest/ix-tui-logo-sharp/`.
