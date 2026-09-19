"""Render the install-demo transcript as a terminal-style animated GIF."""
import sys, os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
lines = [l.rstrip("\n") for l in open(os.path.join(HERE, "transcript.txt"), encoding="utf-8")]

COLS, ROWS = 104, 26
FONT = "C:/Windows/Fonts/consola.ttf"
fs = ImageFont.truetype(FONT, 15)
adv = fs.getlength("M")
lh = 20
W = int(adv * COLS) + 40
H = lh * ROWS + 30
BG = (5, 10, 30)
FG = (215, 227, 255)
CMD = (122, 167, 255)
OK = (126, 231, 135)
ERR = (255, 123, 114)
HDR = (88, 180, 255)

def color_of(line):
    if line.startswith("$ "): return CMD
    if line.startswith("error:") or "exit 1" in line: return ERR
    if line.startswith("Installed:") or line.startswith("Ix skill installed"): return OK
    if line.startswith("Ix installer"): return HDR
    return FG

def wrap(l):
    out, cur = [], ""
    for w in l.split(" "):
        if len(cur) + len(w) + 1 > COLS - 2:
            out.append(cur); cur = w
        else:
            cur = (cur + " " + w).strip()
    if cur: out.append(cur)
    return out

wrapped = []
for l in lines:
    wrapped.extend(wrap(l))

frames = []
def frame(view):
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    for i, l in enumerate(view):
        y = 15 + i * lh
        if y + lh > H - 10: break
        d.text((20, y), l, font=fs, fill=color_of(l))
    return img

view = []
for i, l in enumerate(wrapped):
    view.append(l)
    if len(view) > ROWS: view.pop(0)
    frames.append(frame(list(view)))
    # hold command prompts a touch longer so the action reads
for _ in range(4):
    frames.append(frame(list(view)))

frames[0].save(
    os.path.join(HERE, "install-demo.gif"),
    save_all=True, append_images=frames[1:], duration=260, loop=0, disposal=2, optimize=False,
)
print(f"install-demo.gif: {len(frames)} frames, {W}x{H}px")
