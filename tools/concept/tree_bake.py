"""Bake the overworld trees from the craftpix Free Top-Down Trees pack (assets15), grimmed, palette-packed.
-> src/parts/02r_tree_data.js  (decoded synchronously in the grim bake; drawn at 2x so they sit at the tiles' pixel density)"""
import json, colorsys
from PIL import Image

D = "/home/claude/durinn/assets15/PNG/Assets_separately/Trees/"
KINDS = {
    "pine": ["Christmas_tree2", "Christmas_tree2", "Christmas_tree3"],
    "snowpine": ["Snow_christmass_tree2", "Snow_christmass_tree3"],
    "leafy": ["Tree2", "Tree3", "Moss_tree2", "Moss_tree3", "Tree2", "Autumn_tree3"],
    "dead": ["Burned_tree2", "Burned_tree3", "Broken_tree3"],
    "snowdead": ["Snow_tree2", "Snow_tree3"],
}
TINT = (70, 78, 70)


def grim(im, sat=0.52, val=0.74, tk=0.12, snow=False):
    im = im.convert("RGBA"); px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a < 110: px[x, y] = (0, 0, 0, 0); continue
            h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            white = snow and s < 0.18 and v > 0.7          # keep snow a cold grey-white, not tinted green
            s *= 0.35 if white else sat; v = 0.03 + v * (0.86 if white else val) * 0.97
            r, g, b = colorsys.hsv_to_rgb(h, s, v)
            t = (150, 156, 170) if white else TINT
            r, g, b = [int(c * 255 * (1 - tk) + q * tk) for c, q in zip((r, g, b), t)]
            px[x, y] = (r, g, b, 255)
    return im.crop(im.getbbox())


names = sorted({n for v in KINDS.values() for n in v})
ims = {n: grim(Image.open(D + n + ".png"), snow=n.startswith("Snow")) for n in names}
# one shared palette across every tree
W = sum(i.width for i in ims.values()); H = max(i.height for i in ims.values())
sheet = Image.new("RGBA", (W, H)); x = 0
for n in names: sheet.paste(ims[n], (x, 0)); x += ims[n].width
q = sheet.convert("RGB").quantize(88, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
pal = q.getpalette()[:88 * 3]
CH = [chr(c) for c in range(35, 127) if chr(c) not in "\\'\"`$"]   # index -> char; " " is empty
assert len(CH) >= 88
out = {}
for n in names:
    im = ims[n]; qi = im.convert("RGB").quantize(palette=q, dither=Image.Dither.NONE); a = im.split()[3].load(); p = qi.load()
    rows = ["".join(CH[p[x, y]] if a[x, y] else " " for x in range(im.width)).rstrip() for y in range(im.height)]
    out[n] = {"w": im.width, "h": im.height, "rows": rows}
js = ["/* Overworld trees: craftpix.net Free Top-Down Trees pixel-art pack, grimmed. One palette; each row is a string of",
      "   palette characters, a space is empty. Built by concept/tree_bake.py. */",
      f"const TREE_PAL = {json.dumps(['#%02x%02x%02x' % tuple(pal[i*3:i*3+3]) for i in range(88)])};",
      f"const TREE_CH = {json.dumps(''.join(CH[:88]))};",
      f"const TREE_ART = {json.dumps(out, separators=(',', ':'))};",
      f"const TREE_KINDS = {json.dumps(KINDS)};"]
open("/home/claude/durinn/src/parts/02r_tree_data.js", "w").write("\n".join(js) + "\n")
print(len("\n".join(js)), {n: (ims[n].width, ims[n].height) for n in names})
# review: every tree at 2x on the game's ground colours
rv = Image.new("RGBA", (x * 2 + 40, H * 2 + 20), (64, 66, 50, 255)); xx = 10
for n in names: im = ims[n].resize((ims[n].width * 2, ims[n].height * 2), Image.NEAREST); rv.alpha_composite(im, (xx, 10 + H * 2 - im.height)); xx += im.width + 2
rv.save("/tmp/claude-0/-home-claude/81f7a483-afca-5415-8c60-809b5595b3f8/scratchpad/trees_review.png")
