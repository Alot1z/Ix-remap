# Ix TUI Logo — FULL-HD SHARP pixel-art renderer

The Ix terminal banner, rebuilt to read as crisp pixel art (the skills.sh effect) instead of
mushy averaged color. One zero-dependency Node script decodes the repo's own
`assets/logo.png` (5400×5440) and emits a flat 5-tone, hard-edged, half-block banner in
truecolor, ANSI-256, or ASCII — plus this package's ready-made outputs and a visual preview
page with a before/after comparison.

Verified quality: the sharp method scores 9/10 crispness vs 4/10 for the old averaged
method (independent vision-model judgment on the rendered output); exit codes, all
mode×width combinations, and the JSON contract are all exercised and green.

---

## 1. Quick start

Requirements: Node ≥ 18 (uses `node:fs`, `node:zlib`, `node:process` only — no npm install,
no image library, nothing else).

```bash
# 1 — open the preview page (any browser)
open ix-tui-logo-preview.html          # macOS   (xdg-open on Linux, start on Windows)

# 2 — paste a ready-made banner straight into a real terminal
cat output-samples/banner-80-truecolor.ans

# 3 — render it yourself from the source asset
node scripts/render-logo.mjs --file assets/logo.png --width 80
```

If your terminal shows the logo in 3 quick pulses of color instead of the art, your font
or terminal doesn't map `▀`/`▄` half-blocks 1:2 — try `--color 256` or a monospace font
like Cascadia Mono / Fira Code / Iosevka.

## 2. CLI reference

```
node scripts/render-logo.mjs [--width N] [--color MODE] [--file PATH] [--bg MODE] [--json]
```

| Flag | Values | Default | Notes |
|---|---|---|---|
| `--width` | 8 … 400 (columns) | 80 | 56 = safe everywhere · 80 = classic full width · 112 = max detail |
| `--color` | `true` \| `256` \| `ascii` | `true` | `ascii` is the NO_COLOR / dumb-terminal / CI-safe ladder |
| `--file` | any PNG path | `assets/logo.png` | relative to CWD |
| `--bg` | `paint` \| `none` | `paint` | `none` = empty cells emit no SGR (terminal bg shows through) |
| `--json` | flag | off | machine metadata to stdout instead of the banner |

**Exit codes (a contract):** `0` ok · `1` usage error (bad flag/value) · `2` decode or
processing failure (missing file, not a PNG, truncated IDAT, unsupported bit depth).

**`--json` output** (stable shape, safe to parse in CI):

```json
{
  "ok": true, "mode": "true", "width": 80,
  "pixelRows": 64, "charRows": 32,
  "inkCells": 704, "totalCells": 5120, "coverage": 0.1375,
  "bg": [0, 0, 27],
  "palette": ["#00265e", "#0b4a9e", "#2478d8", "#58b4ff", "#d8f0ff"],
  "palette256": [17, 25, 32, 75, 195], "bg256": 232,
  "source": { "width": 5400, "height": 5440, "colorType": 2, "bitDepth": 8 },
  "crop": { "x0": 0, "y0": 1125, "x1": 5399, "y1": 5439 }
}
```

## 3. The palette (single source of brand truth, in code)

Five flat tones derived from the asset's own gradient anchors
(`#002056 → #3470D7 → #53B3FF → #D4F0FF`), hand-tuned to even perceptual-luminance steps:

| Tone | Name | Truecolor | xterm-256 | ASCII |
|---|---|---|---|---|
| T1 | deep royal | `#00265E` | 17 | `.` |
| T2 | royal | `#0B4A9E` | 25 | `-` |
| T3 | azure | `#2478D8` | 32 | `=` |
| T4 | sky | `#58B4FF` | 75 | `*` |
| T5 | ice | `#D8F0FF` | 195 | `#` |
| bg | painted navy | `#00001B` | 232 | (space) |

Snap boundaries sit at luminance 49 / 85.5 / 133.5 / 198 — so every inked cell lands on
exactly one tone, and the gradient reads as deliberate pixel-art bands.

## 4. Why it looks sharp (the six steps that buy it)

1. **Hand-rolled PNG decode, zero deps.** Chunks → `zlib.inflateSync` → unfilter
   (filter types 0–4, Paeth included; color types 0/2/4/6). The 5400×5440 asset decodes
   in about a second; no image library enters the dependency tree.
2. **Tight-crop to the ink bounding box.** The full canvas spends ~21% of its rows on
   empty navy; cropping spends every grid cell on actual art — free resolution.
3. **Coverage-thresholded supersampling.** Per target cell, `ink_frac` = the fraction of
   its source pixels that are ink; the cell is ink iff `ink_frac ≥ 0.5`. The shape
   boundary lands exactly on the true 50%-coverage contour: hard edges, no halo, and
   area-averaging now *helps* (sub-pixel-accurate edge placement) instead of hurting.
4. **Ink-only color mean.** An edge cell averages only its ink pixels — background navy
   never bleeds into the tone. This kills the dark mud halo that made the old render
   look out of focus.
5. **Flat 5-tone snap.** Cell luminance is normalized to the asset's ink range and
   quantized to the palette above. No in-between colors are ever emitted.
6. **Half-block emit with run-length SGR.** Two pixel rows per character cell
   (`▀` / `▄` / space), SGR changes only when color actually changes (352 escapes for the
   whole 80-col banner), every line ends in `\x1b[0m`. The 256 mode pre-snaps the same
   five tones into the xterm cube; ASCII maps them to `. - = * #`.

The one-sentence version: **the old pipeline averaged color (mush); this one thresholds
coverage and snaps to flat tones (sharp).** That's the entire difference between 4/10 and
9/10.

## 5. Wiring it into the Ix CLI banner

The script exports a pure function for embedding (CLI flags are optional):

```js
import fs from 'node:fs';
import { renderLogo } from './scripts/render-logo.mjs';

const png = fs.readFileSync(new URL('../assets/logo.png', import.meta.url));

function banner() {
  const noColor = process.env.NO_COLOR || !process.stdout.isTTY;
  return renderLogo(png, {
    width: 80,                       // clamp to measured terminal width if narrower
    color: noColor ? 'ascii' : 'true',
  }).text;
}

process.stdout.write('\n' + banner() + '\n');
```

Ladder rules that match the CLI contract (machine output stays clean):

- `--json` / machine mode and piping to files: use `color: 'ascii'` (or skip the banner).
- Width should never exceed the live terminal width; fall back to 56, then 32.
- The banner is static text — cache it once per process, not per redraw.

## 6. Repo placement (for the eventual Ix PR)

Matches the staged fork layout from the campaign backlog:

```
Ix/
├── assets/logo.png              ← unchanged source of truth (sha256 6c40a9b8…)
└── scripts/render-logo.mjs      ← this script, verbatim
```

- The PNG stays the only art ever maintained — every mode and width is derived from it
  at run time.
- `render-logo.mjs` is self-contained: no imports outside `node:*`, no build step.
- Suggested tests to add alongside it in the PR: (a) golden-file test on
  `output-samples/banner-80-truecolor.ans`, (b) exit-code ladder (0/1/2 paths),
  (c) `--json` shape assertion, (d) mutation check — flip `COV_THRESHOLD` to 0.4/0.6 and
  assert the ink-cell count changes; snap boundaries shift and the golden file fails.

## 7. Package manifest

```
ix-tui-logo-sharp/
├── README.md                                  ← this file
├── ix-tui-logo-preview.html                   ← open in a browser: hero, A/B, all modes/widths, raw escapes
├── scripts/render-logo.mjs                    ← the renderer (zero-dep, Node ≥ 18)
├── assets/logo.png                            ← source asset, byte-identical to the repo
│                                                 sha256 6c40a9b846301242047d9cc81fd762d8fb20e4182d2df83fd30bd21cf21f6e26
└── output-samples/
    ├── banner-56-truecolor.ans                ← safe-width truecolor
    ├── banner-80-truecolor.ans                ← the hero banner
    ├── banner-80-truecolor-transparent.ans    ← --bg none (no SGR on empty cells)
    ├── banner-80-256.ans                      ← ANSI-256 fallback
    ├── banner-80-ascii.txt                    ← NO_COLOR / dumb-terminal ladder
    └── banner-112-truecolor.ans               ← max-detail width
```

`.ans` files are plain UTF-8 text containing truecolor/256 SGR escape sequences — `cat`
them in a real terminal, or paste the textarea contents from the preview page.

## 8. What was verified

- **Modes × widths:** all 9 combinations of {true, 256, ascii} × {56, 80, 112} run clean,
  plus `--bg none`.
- **Exit ladder:** bad flag → 1; missing file / not-a-PNG / truncated IDAT → 2; happy
  path → 0.
- **JSON contract:** parses, shape asserted (charRows 32, inkCells 704, palette256
  [17,25,32,75,195], bg 232).
- **Cross-implementation:** an independent Python prototype produced the identical grid
  (704 ink cells, same palette mapping); rendered images differ in 0.078% of pixels
  (one tone edge at a float boundary) — visually irrelevant.
- **Visual:** independent vision-model judging of the browser-rendered page scores the
  sharp banner 9/10 crispness, "A+ tier — ship it", with no defects found (no orphan
  dots, no broken lines, no halo, no washed-out tones); the old averaged method on the
  same grid scores 3–4/10.

## 9. Tuning knobs (if you want to iterate)

All constants live at the top of `render-logo.mjs`:

- `PALETTE` / `PAL_L` / `SNAP_BOUNDS` — the tone ramp and its boundaries.
- `INK_DIST = 60` — how far a pixel must be from the background color to count as ink
  (raise it if a future asset has noisy near-bg pixels).
- `COV_THRESHOLD = 0.5` — edge hardness; 0.5 is the honest contour, lower = fatter art.
- `LUM_LO` / `LUM_HI` — the source ink-luminance normalization range.
- `CROP_MARGIN = 40` — breathing room around the ink bbox.
