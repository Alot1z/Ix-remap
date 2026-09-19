#!/usr/bin/env node
/**
 * render-logo.mjs — Ix TUI banner renderer (FULL-HD-SHARP pixel-art mode)
 *
 * Pipeline (zero dependencies — node:fs / node:zlib only):
 *   1. decode PNG by hand: chunks → IDAT → inflate → unfilter (types 0-4)
 *   2. bg = modal color (bg-honesty for no-alpha PNGs); ink = color-distance from bg
 *   3. tight-crop to the ink bounding box (+margin) — no resolution wasted on empty navy
 *   4. coverage-thresholded supersampling: per target cell,
 *        ink_frac = fraction of source pixels that are ink
 *        ink_rgb  = mean color of those ink pixels ONLY (never blended with bg)
 *      cell is ink iff ink_frac >= 0.5  → the boundary sits on the true 50% coverage contour
 *   5. flat-palette quantization: normalized luminance snaps to a 5-tone Ix ramp
 *      (the skills.sh trick: flat tones + hard edges = perceived sharpness)
 *   6. half-block emit: 2 pixel rows per char cell (▀/▄/space), run-length SGR
 *
 * Modes  : truecolor | 256 | ascii      (ascii = NO_COLOR / dumb-terminal safe)
 * Surface: --width N  --color MODE  --file PATH  --json  --bg paint|none
 * Exits  : 0 ok · 1 usage error · 2 decode/processing failure
 */

import fs from 'node:fs';
import zlib from 'node:zlib';
import process from 'node:process';

// ---------- brand constants ----------
// flat ramp hand-tuned from the asset's own gradient anchors (#002056 → #3470D7 → #53B3FF → #D4F0FF)
const PALETTE = [
  [0x00, 0x26, 0x5e], // T1 deep royal
  [0x0b, 0x4a, 0x9e], // T2 royal
  [0x24, 0x78, 0xd8], // T3 azure
  [0x58, 0xb4, 0xff], // T4 sky
  [0xd8, 0xf0, 0xff], // T5 ice
];
const PAL_L = PALETTE.map(([r, g, b]) => 0.299 * r + 0.587 * g + 0.114 * b); // 33,65,106,161,235
const SNAP_BOUNDS = [0, 1, 2, 3].map((i) => (PAL_L[i] + PAL_L[i + 1]) / 2); // 49,85.5,133.5,198
const ASCII_MAP = ['.', '-', '=', '*', '#']; // T1..T5 (dark → dense on dark terminals)

const INK_DIST = 60; // squared-dist threshold: ink iff |rgb-bg|² > 60²
const COV_THRESHOLD = 0.5; // cell inked iff ≥50% of its source pixels are ink
const LUM_LO = 26.0, LUM_HI = 233.5; // source ink luminance range → normalize into [33..235]
const CROP_MARGIN = 40;

// ---------- PNG decode ----------
function decodePng(buf) {
  const SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buf.length < 8 || !buf.subarray(0, 8).equals(SIG)) throw new Error('not a PNG (bad signature)');
  let off = 8;
  let ihdr = null;
  const idat = [];
  while (off + 8 <= buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('ascii', off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (data.length !== len) throw new Error(`truncated chunk ${type}`);
    if (type === 'IHDR') {
      ihdr = {
        width: data.readUInt32BE(0),
        height: data.readUInt32BE(4),
        bitDepth: data[8],
        colorType: data[9],
        compression: data[10],
        filter: data[11],
        interlace: data[12],
      };
    } else if (type === 'IDAT') {
      idat.push(data);
    } else if (type === 'IEND') break;
    off += 12 + len;
  }
  if (!ihdr) throw new Error('missing IHDR');
  if (ihdr.interlace !== 0) throw new Error('interlaced PNG unsupported');
  if (ihdr.bitDepth !== 8) throw new Error(`bit depth ${ihdr.bitDepth} unsupported (need 8)`);
  const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[ihdr.colorType];
  if (!channels) throw new Error(`color type ${ihdr.colorType} unsupported`);
  if (idat.length === 0) throw new Error('missing IDAT');

  const raw = zlib.inflateSync(Buffer.concat(idat));
  const { width, height } = ihdr;
  const bpp = channels;
  const stride = width * bpp;
  if (raw.length < height * (stride + 1)) throw new Error('IDAT too short after inflate');
  const px = Buffer.allocUnsafe(width * height * 3); // normalized to RGB
  let prev = Buffer.alloc(stride); // zero line above row 0
  let cur = Buffer.alloc(stride);
  let rp = 0;
  for (let y = 0; y < height; y++) {
    const ftype = raw[rp++];
    raw.copy(cur, 0, rp, rp + stride);
    rp += stride;
    switch (ftype) {
      case 0: break;
      case 1: // Sub
        for (let i = bpp; i < stride; i++) cur[i] = (cur[i] + cur[i - bpp]) & 0xff;
        break;
      case 2: // Up
        for (let i = 0; i < stride; i++) cur[i] = (cur[i] + prev[i]) & 0xff;
        break;
      case 3: // Average
        for (let i = 0; i < stride; i++) {
          const left = i >= bpp ? cur[i - bpp] : 0;
          cur[i] = (cur[i] + ((left + prev[i]) >> 1)) & 0xff;
        }
        break;
      case 4: // Paeth
        for (let i = 0; i < stride; i++) {
          const a = i >= bpp ? cur[i - bpp] : 0;
          const b = prev[i];
          const c = i >= bpp ? prev[i - bpp] : 0;
          const p = a + b - c;
          const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
          const pred = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
          cur[i] = (cur[i] + pred) & 0xff;
        }
        break;
      default:
        throw new Error(`bad filter type ${ftype} at row ${y}`);
    }
    // normalize into RGB target
    let wq = y * width * 3;
    if (channels === 3) cur.copy(px, wq, 0, stride);
    else if (channels === 1) for (let x = 0; x < width; x++) { const v = cur[x]; px[wq++] = v; px[wq++] = v; px[wq++] = v; }
    else if (channels === 4) for (let x = 0; x < width; x++) { px[wq++] = cur[x * 4]; px[wq++] = cur[x * 4 + 1]; px[wq++] = cur[x * 4 + 2]; }
    else { // gray+alpha
      for (let x = 0; x < width; x++) { const v = cur[x * 2]; px[wq++] = v; px[wq++] = v; px[wq++] = v; }
    }
    const t = prev; prev = cur; cur = t;
  }
  return { width, height, colorType: ihdr.colorType, bitDepth: ihdr.bitDepth, px };
}

// ---------- bg detection (bg-honesty: modal color, sampled) ----------
function detectBg(img) {
  const { px, width, height } = img;
  const counts = new Map();
  const step = 7; // sample every 7th pixel row+col — bg is a huge flat region
  for (let y = 0; y < height; y += step) {
    let i = y * width * 3;
    for (let x = 0; x < width; x += step, i += 3 * step) {
      const key = (px[i] << 16) | (px[i + 1] << 8) | px[i + 2];
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  let bestKey = 0, bestN = -1;
  for (const [k, n] of counts) if (n > bestN) { bestN = n; bestKey = k; }
  return [(bestKey >> 16) & 0xff, (bestKey >> 8) & 0xff, bestKey & 0xff];
}

// ---------- grid build ----------
function buildGrid(img, bg, cols) {
  const { px, width, height } = img;
  const bgR = bg[0], bgG = bg[1], bgB = bg[2];
  // ink bbox
  let x0 = width, x1 = -1, y0 = height, y1 = -1;
  for (let y = 0; y < height; y++) {
    let i = y * width * 3;
    for (let x = 0; x < width; x++, i += 3) {
      const dr = px[i] - bgR, dg = px[i + 1] - bgG, db = px[i + 2] - bgB;
      if (dr * dr + dg * dg + db * db > INK_DIST * INK_DIST) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) throw new Error('no ink found (blank image?)');
  x0 = Math.max(0, x0 - CROP_MARGIN); y0 = Math.max(0, y0 - CROP_MARGIN);
  x1 = Math.min(width - 1, x1 + CROP_MARGIN); y1 = Math.min(height - 1, y1 + CROP_MARGIN);
  const cw = x1 - x0 + 1, chh = y1 - y0 + 1;

  let rows = Math.round(cols * (chh / cw));
  if (rows % 2) rows += 1; // even pixel rows → clean half-block pairs

  const xr = new Int32Array(cols + 1);
  for (let i = 0; i <= cols; i++) xr[i] = Math.min(cw, Math.floor((i * cw) / cols));
  const yr = new Int32Array(rows + 1);
  for (let j = 0; j <= rows; j++) yr[j] = Math.min(chh, Math.floor((j * chh) / rows));

  const grid = new Int8Array(cols * rows).fill(-1);
  const cellRgb = new Float64Array(cols * rows * 3);
  const cov = new Float64Array(cols * rows);

  for (let j = 0; j < rows; j++) {
    const ya = y0 + yr[j], yb = y0 + yr[j + 1] > ya ? y0 + yr[j + 1] : ya + 1;
    for (let i = 0; i < cols; i++) {
      const xa = x0 + xr[i], xb = x0 + xr[i + 1] > xa ? x0 + xr[i + 1] : xa + 1;
      let n = 0, inkn = 0, sr = 0, sg = 0, sb = 0;
      for (let y = ya; y < yb; y++) {
        let k = (y * width + xa) * 3;
        for (let x = xa; x < xb; x++, k += 3) {
          n++;
          const dr = px[k] - bgR, dg = px[k + 1] - bgG, db = px[k + 2] - bgB;
          if (dr * dr + dg * dg + db * db > INK_DIST * INK_DIST) {
            inkn++; sr += px[k]; sg += px[k + 1]; sb += px[k + 2];
          }
        }
      }
      const cell = j * cols + i;
      cov[cell] = n ? inkn / n : 0;
      if (inkn) { cellRgb[cell * 3] = sr / inkn; cellRgb[cell * 3 + 1] = sg / inkn; cellRgb[cell * 3 + 2] = sb / inkn; }
      if (cov[cell] >= COV_THRESHOLD) {
        const lum = 0.299 * cellRgb[cell * 3] + 0.587 * cellRgb[cell * 3 + 1] + 0.114 * cellRgb[cell * 3 + 2];
        const ln = Math.min(1, Math.max(0, (lum - LUM_LO) / (LUM_HI - LUM_LO))) * (PAL_L[4] - PAL_L[0]) + PAL_L[0];
        let tone = 0;
        while (tone < 4 && ln >= SNAP_BOUNDS[tone]) tone++;
        grid[cell] = tone;
      }
    }
  }
  return { grid, cov, cols, rows, crop: { x0, y0, x1, y1 }, source: { width, height } };
}

// ---------- xterm-256 ----------
function xtermTable() {
  const lv = [0, 95, 135, 175, 215, 255];
  const t = [];
  for (let r = 0; r < 6; r++) for (let g = 0; g < 6; g++) for (let b = 0; b < 6; b++)
    t.push([16 + 36 * r + 6 * g + b, lv[r], lv[g], lv[b]]);
  for (let k = 0; k < 24; k++) { const v = 8 + k * 10; t.push([232 + k, v, v, v]); }
  return t;
}
const XTERM = xtermTable();
function nearest256([r, g, b]) {
  let best = 16, bd = Infinity;
  for (const [idx, rr, gg, bb] of XTERM) {
    const d = (r - rr) ** 2 + (g - gg) ** 2 + (b - bb) ** 2;
    if (d < bd) { bd = d; best = idx; }
  }
  return best;
}
const PAL256 = PALETTE.map(nearest256);
const BG256 = nearest256;

// ---------- emitters ----------
function cellStates(g, j, i) {
  const t = j < g.rows ? g.grid[j * g.cols + i] : -1;
  const b = j + 1 < g.rows ? g.grid[(j + 1) * g.cols + i] : -1;
  return [t, b];
}

function emitTruecolor(g, bg, painted) {
  const lines = [];
  for (let j = 0; j < g.rows; j += 2) {
    let line = '';
    let run = null; // {ch, fg(-1..4 or 'bg'), bgk, n}
    for (let i = 0; i < g.cols; i++) {
      const [t, b] = cellStates(g, j, i);
      let cell;
      if (t < 0 && b < 0) cell = [' ', -1, -2];        // -2 = painted bg
      else if (t >= 0 && b < 0) cell = ['\u2580', t, -2];
      else if (t < 0 && b >= 0) cell = ['\u2584', b, -2];
      else cell = ['\u2580', t, b];
      if (run && run.ch === cell[0] && run.fg === cell[1] && run.bgk === cell[2]) run.n++;
      else { if (run) line += sgrRun(run); run = { ch: cell[0], fg: cell[1], bgk: cell[2], n: 1 }; }
    }
    if (run) line += sgrRun(run);
    lines.push(line + '\x1b[0m');
  }
  return lines.join('\n');

  function sgrRun(r) {
    const parts = [];
    if (r.fg >= 0) { const [cr, cg, cb] = PALETTE[r.fg]; parts.push(`38;2;${cr};${cg};${cb}`); }
    if (r.bgk === -2) { if (painted) parts.push(`48;2;${bg[0]};${bg[1]};${bg[2]}`); }
    else { const [cr, cg, cb] = PALETTE[r.bgk]; parts.push(`48;2;${cr};${cg};${cb}`); }
    return (parts.length ? `\x1b[${parts.join(';')}m` : '') + r.ch.repeat(r.n);
  }
}

function emit256(g, bg, painted) {
  const lines = [];
  const bgIdx = BG256(bg);
  for (let j = 0; j < g.rows; j += 2) {
    let line = '';
    let run = null;
    for (let i = 0; i < g.cols; i++) {
      const [t, b] = cellStates(g, j, i);
      let cell;
      if (t < 0 && b < 0) cell = [' ', -1, -2];
      else if (t >= 0 && b < 0) cell = ['\u2580', t, -2];
      else if (t < 0 && b >= 0) cell = ['\u2584', b, -2];
      else cell = ['\u2580', t, b];
      if (run && run.ch === cell[0] && run.fg === cell[1] && run.bgk === cell[2]) run.n++;
      else { if (run) line += sgrRun(run); run = { ch: cell[0], fg: cell[1], bgk: cell[2], n: 1 }; }
    }
    if (run) line += sgrRun(run);
    lines.push(line + '\x1b[0m');
  }
  return lines.join('\n');

  function sgrRun(r) {
    const parts = [];
    if (r.fg >= 0) parts.push(`38;5;${PAL256[r.fg]}`);
    if (r.bgk === -2) { if (painted) parts.push(`48;5;${bgIdx}`); }
    else parts.push(`48;5;${PAL256[r.bgk]}`);
    return (parts.length ? `\x1b[${parts.join(';')}m` : '') + r.ch.repeat(r.n);
  }
}

function emitAscii(g) {
  const lines = [];
  for (let j = 0; j < g.rows; j += 2) {
    let line = '';
    for (let i = 0; i < g.cols; i++) {
      const [t, b] = cellStates(g, j, i);
      const v = t >= 0 ? t : b;
      line += v < 0 ? ' ' : ASCII_MAP[v];
    }
    lines.push(line.replace(/\s+$/, ''));
  }
  return lines.join('\n');
}

// ---------- CLI ----------
function usage(msg) {
  if (msg) process.stderr.write(`render-logo: ${msg}\n`);
  process.stderr.write('usage: render-logo.mjs [--width N] [--color true|256|ascii] [--file PATH] [--bg paint|none] [--json]\n');
  process.exit(1);
}

export function renderLogo(pngBuffer, opts = {}) {
  const cols = opts.width ?? 80;
  if (!Number.isInteger(cols) || cols < 8 || cols > 400) usage(`--width must be an integer in [8,400], got ${cols}`);
  const img = decodePng(pngBuffer);
  const bg = detectBg(img);
  const g = buildGrid(img, bg, cols);
  const mode = opts.color ?? 'true';
  const painted = (opts.bg ?? 'paint') === 'paint';
  let text;
  if (mode === 'true') text = emitTruecolor(g, bg, painted);
  else if (mode === '256') text = emit256(g, bg, painted);
  else if (mode === 'ascii') text = emitAscii(g);
  else usage(`--color must be true|256|ascii, got ${mode}`);
  const ink = [...g.grid].filter((v) => v >= 0).length;
  return {
    text,
    meta: {
      ok: true,
      mode,
      width: cols,
      pixelRows: g.rows,
      charRows: g.rows / 2,
      inkCells: ink,
      totalCells: g.grid.length,
      coverage: +(ink / g.grid.length).toFixed(4),
      bg,
      palette: PALETTE.map(([r, gg, b]) => `#${[r, gg, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`),
      palette256: PAL256,
      bg256: BG256(bg),
      source: { width: img.width, height: img.height, colorType: img.colorType, bitDepth: img.bitDepth },
      crop: g.crop,
    },
  };
}

// ---- main (when run directly) ----
const isMain = process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href;
if (isMain) {
  const args = process.argv.slice(2);
  const opts = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    const next = () => (i + 1 < args.length ? args[++i] : usage(`${a} needs a value`));
    if (a === '--width') opts.width = parseInt(next(), 10);
    else if (a === '--color') opts.color = next();
    else if (a === '--file') opts.file = next();
    else if (a === '--bg') opts.bg = next();
    else if (a === '--json') opts.json = true;
    else usage(`unknown argument ${a}`);
  }
  const file = opts.file ?? 'assets/logo.png';
  let buf;
  try {
    buf = fs.readFileSync(file);
  } catch (e) {
    process.stderr.write(`render-logo: cannot read ${file}: ${e.message}\n`);
    process.exit(2);
  }
  let out;
  try {
    out = renderLogo(buf, opts);
  } catch (e) {
    process.stderr.write(`render-logo: ${e.message}\n`);
    process.exit(2);
  }
  if (opts.json) process.stdout.write(JSON.stringify(out.meta, null, 2) + '\n');
  else process.stdout.write(out.text + '\n');
}
