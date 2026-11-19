"""Bake the cave dressing (crystals, glowing mushrooms, bones, webs, rocks) from two craftpix packs, grimmed and
palette-packed like the curse art: craftpix Top-down Cave Objects and Glowing Cave tileset.
-> src/parts/02v_cave_data.js   (decoded in the grim bake; strewn along cave walls, never blocking)

Groups, each with its own palette:
  glow : the glowing cave's crystals, mushrooms and plants (they keep some of their light)
  mine : pale and blue-green crystals, rocks, old bones, skeletons, mushrooms, webs
The glowing ring (Totem_animation) is kept in assets9/portal for the portals of a later act; it is not baked here."""
import json, colorsys, shutil, os
from PIL import Image

G = "/home/claude/packs4/glowcave/PNG/Objects_separately/"
C = "/home/claude/packs4/caveobj/PNG/Objects_separately/"
GROUPS = {
    "glow": [(G, n) for n in ["Crystal1_1", "Crystal2_1", "Crystal3_1", "Crystal4_1", "Crystal1_3", "Crystal2_3", "Crystal3_3", "Crystal4_3", "Rock_crystal_1",
                              "Mushroom1_1", "Mushroom2_1", "Mushroom4_1", "Mushroom5_1", "Mushroom1_3", "Mushroom5_3",
                              "Plant1_1", "Plant2_1", "Plant3_1", "Plant4_1", "Plant5_1"]],
    "mine": [(C + "64/", n) for n in ["Beige_rpck_dark_shadow2", "Beige_rpck_dark_shadow3", "white_crystal_dark_shadow1", "white_crystal_dark_shadow2", "white_crystal_vertical1",
                                      "Blue-green_crystal_dark_shadow1", "Blue-green_crystal_dark_shadow2", "crystal_blue-green_vertical1", "Dinosaur_skeleton__head_dark_shadow",
                                      "mushroom1_dark_shadow1", "mushroom2_dark_shadow2", "mushroom4_dark_shadow1"]]
            + [(C + "32/", n) for n in ["Human_skeleton_dark_shadow", "mushroom1_dark_shadow3", "white_crystal_dark_shadow3", "Blue-green_crystal_dark_shadow3"]]
            + [(C + "128/", "cocoon_web")],
}
HALF = {"cocoon_web", "Rock_crystal_1"}           # drawn at half size: they come from the big sheet
TINT = (60, 56, 70)


def grim(im, sat, val, tk=0.16):
    im = im.convert("RGBA"); px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a < 110: px[x, y] = (0, 0, 0, 0); continue
            h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            s *= sat; v = 0.02 + v * val * 0.98
            r, g, b = colorsys.hsv_to_rgb(h, s, v)
            r, g, b = [int(c * 255 * (1 - tk) + q * tk) for c, q in zip((r, g, b), TINT)]
            px[x, y] = (r, g, b, 255)
    return im.crop(im.getbbox())


CH = [chr(c) for c in range(35, 127) if chr(c) not in "\\'\"`$"]
NPAL = len(CH)
TUNE = {"glow": (0.62, 0.88), "mine": (0.5, 0.74)}
ART = {}
for gname, items in GROUPS.items():
    ims = {}
    for d, n in items:
        im = Image.open(d + n + ".png").convert("RGBA")
        if n in HALF: im = im.resize((im.width // 2, im.height // 2), Image.NEAREST)
        ims[n] = grim(im, *TUNE[gname])
    W = sum(i.width for i in ims.values()); H = max(i.height for i in ims.values())
    sheet = Image.new("RGBA", (W, H)); x = 0
    for n, i in ims.items(): sheet.paste(i, (x, 0)); x += i.width
    q = sheet.convert("RGB").quantize(NPAL, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    pal = (q.getpalette() + [0] * NPAL * 3)[:NPAL * 3]
    out = {}
    for n, im in ims.items():
        qi = im.convert("RGB").quantize(palette=q, dither=Image.Dither.NONE); a = im.split()[3].load(); p = qi.load()
        rows = ["".join(CH[p[x, y]] if a[x, y] else " " for x in range(im.width)).rstrip() for y in range(im.height)]
        key = n.replace("_dark_shadow", "").replace("-", "_").lower()
        out[key] = {"w": im.width, "h": im.height, "rows": rows}
    ART[gname] = {"pal": ['#%02x%02x%02x' % tuple(pal[i * 3:i * 3 + 3]) for i in range(NPAL)], "art": out}
js = ["/* Cave dressing: craftpix.net Top-down Cave Objects and Glowing Cave tileset, grimmed and palette-packed like the curse art",
      "   (same character set, CURSE_CH). Built by concept/cave_bake.py. */",
      f"const CAVE_ART = {json.dumps(ART, separators=(',', ':'))};"]
src = "\n".join(js) + "\n"
open("/home/claude/durinn/src/parts/02v_cave_data.js", "w").write(src)
print("bytes", len(src))
for g, d in ART.items(): print(g, {k: (v["w"], v["h"]) for k, v in d["art"].items()})
# keep the portal's art for later
os.makedirs("/home/claude/durinn/assets9/portal", exist_ok=True)
shutil.copy("/home/claude/packs4/glowcave/PNG/Totem_animation.png", "/home/claude/durinn/assets9/portal/glowing_ring.png")
# review sheet
from PIL import ImageDraw
S = "/tmp/claude-0/-home-claude/81f7a483-afca-5415-8c60-809b5595b3f8/scratchpad/cave_review.png"
cells = [(g, k, v) for g, d in ART.items() for k, v in d["art"].items()]
cw = 140; cols = 10; rn = (len(cells) + cols - 1) // cols
rv = Image.new("RGB", (cols * cw, rn * cw), (40, 38, 44)); dr = ImageDraw.Draw(rv)
for i, (g, k, v) in enumerate(cells):
    pal = [tuple(int(h[j:j + 2], 16) for j in (1, 3, 5)) for h in ART[g]["pal"]]
    im = Image.new("RGBA", (v["w"], v["h"]))
    for y, r in enumerate(v["rows"]):
        for x, ch in enumerate(r):
            if ch != " ": im.putpixel((x, y), pal[CH.index(ch)] + (255,))
    im = im.resize((min(v["w"] * 2, 130), min(v["h"] * 2, 120)), Image.NEAREST)
    X, Y = (i % cols) * cw, (i // cols) * cw
    rv.paste(im, (X + 4, Y + 4), im); dr.text((X + 4, Y + cw - 14), k[:22], fill=(255, 255, 0))
rv.save(S)
