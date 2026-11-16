"""Bakes the craftpix path tileset into palette-indexed cobble strips for town paving (02l_pave_data.js).
Each style keeps the pack's own stones; the game recolours them grim and dirties them per stone.
Strips are runs of fully paved 16 px tiles cut from the pack's frames and bars, so the pattern has no seams inside a strip."""
import sys, json
from PIL import Image
PK = "/home/claude/durinn/assets6/paths/PNG_Tiled/"

def strips(png, runs):
    im = Image.open(PK + png).convert("RGBA")
    pal = []
    out = []
    for (ty, c0, c1) in runs:
        w = (c1 - c0 + 1) * 16
        rows = []
        for y in range(16):
            s = ""
            for x in range(w):
                p = im.getpixel((c0 * 16 + x, ty * 16 + y))
                assert p[3] == 255, (png, ty, c0, x, y)
                if p[:3] not in pal: pal.append(p[:3])
                s += str(pal.index(p[:3]))
            rows.append(s)
        out.append(rows)
    return pal, out

def lum(c): return 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2]
STYLES = {
    "ash": ("Road5.png", [(10, 4, 7), (13, 4, 7), (15, 1, 4), (15, 6, 10), (18, 1, 4), (24, 2, 6)]),
    "grey": ("Road1.png", [(10, 4, 7), (13, 4, 7), (15, 1, 4), (15, 6, 10), (18, 1, 4), (24, 2, 6)]),
}
res = {}
for k, (png, runs) in STYLES.items():
    pal, ss = strips(png, runs)
    order = sorted(range(len(pal)), key=lambda i: lum(pal[i]))   # rank 0 darkest
    rank = {i: order.index(i) for i in range(len(pal))}
    ss = [["".join(str(rank[int(ch)]) for ch in r) for r in s] for s in ss]
    res[k] = {"n": len(pal), "strips": ss}
    print(k, "palette (dark to light):", [pal[i] for i in order], "strips", [len(s[0]) for s in ss])
js = "/* town paving: stones from the craftpix path pack, as brightness ranks per pixel (0 darkest); recoloured grim in the bake */\nconst PAVE = " + json.dumps(res, separators=(",", ":")) + ";\n"
open("/home/claude/durinn/src/parts/02l_pave_data.js", "w").write(js)
