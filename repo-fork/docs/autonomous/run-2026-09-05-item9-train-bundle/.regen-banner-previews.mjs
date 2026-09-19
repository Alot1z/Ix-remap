// Regenerate banner-NN-truecolor.png from output-samples/width-NN-truecolor.ans
// Fix for the black-bar artifact: the previous converter painted cells with an
// unset background black. In a terminal those cells show the user's default
// background; for the brand preview we normalize them to the brand navy
// (5,10,30) and crop the colorless padding rows above/below the art.
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const OUT = process.argv[2];
const NAVY = [5, 10, 30];
const CELL = 4; // px per terminal cell (matches the original 192px width)

function parseAns(text) {
  const lines = text.split("\n");
  let fg = null, bg = null;
  const rows = lines.map((line) => {
    const cells = [];
    const re = /\x1b\[([0-9;]*)m|([\s\S])/g;
    let m;
    while ((m = re.exec(line)) !== null) {
      if (m[1] !== undefined) {
        const p = m[1] === "" ? ["0"] : m[1].split(";");
        for (let i = 0; i < p.length; i++) {
          if (p[i] === "0") { fg = null; bg = null; }
          else if (p[i] === "38" && p[i + 1] === "2") { fg = [+p[i + 2], +p[i + 3], +p[i + 4]]; i += 4; }
          else if (p[i] === "48" && p[i + 1] === "2") { bg = [+p[i + 2], +p[i + 3], +p[i + 4]]; i += 4; }
        }
      } else {
        cells.push({ ch: m[2], fg, bg, art: bg !== null });
      }
    }
    return cells;
  });
  return rows;
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

function render(ansPath, pngPath) {
  const rows = parseAns(fs.readFileSync(ansPath, "utf8"));
  const hasArt = (r) => r.some((c) => c.art);
  const first = rows.findIndex(hasArt);
  const last = rows.length - 1 - [...rows].reverse().findIndex(hasArt);
  const art = rows.slice(first, last + 1);
  const cols = Math.max(...art.map((r) => r.length));
  const W = cols * CELL, H = art.length * 2 * CELL;
  const img = Buffer.alloc(W * H * 3);
  const setPx = (x, y, [r, g, b]) => {
    const i = (y * W + x) * 3; img[i] = r; img[i + 1] = g; img[i + 2] = b;
  };
  art.forEach((row, ry) => {
    for (let cx = 0; cx < cols; cx++) {
      const c = row[cx] ?? { ch: " " };
      const bgc = c.bg ?? NAVY;
      const top = c.ch === "▀" ? (c.fg ?? NAVY) : bgc;
      for (let dy = 0; dy < CELL * 2; dy++) {
        const col = dy < CELL ? top : bgc;
        for (let dx = 0; dx < CELL; dx++) {
          setPx(cx * CELL + dx, ry * CELL * 2 + dy, col);
        }
      }
    }
  });
  const stride = W * 3;
  const raw = Buffer.alloc((stride + 1) * H);
  for (let y = 0; y < H; y++) {
    raw[y * (stride + 1)] = 0;
    img.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  fs.mkdirSync(path.dirname(pngPath), { recursive: true });
  fs.writeFileSync(pngPath, png);
  console.log(`${path.basename(pngPath)}: ${W}x${H}, art rows ${first + 1}..${last + 1} of ${rows.length}`);
}

const base = process.argv[3];
render(path.join(base, "width-48-truecolor.ans"), path.join(OUT, "banner-48-truecolor.png"));
render(path.join(base, "width-56-truecolor.ans"), path.join(OUT, "banner-80-truecolor.png"));
