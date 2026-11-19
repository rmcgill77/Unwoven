"""Bake the cursed-land art for southern Etharis (Act 3) from three craftpix packs, grimmed and palette-packed.
   Cursed Land top-down tileset (objects), Cursed Land objects, Top-down Undead Land objects.
-> src/parts/02t_curse_data.js   (decoded in the grim bake and drawn at 1x, the chibis' pixel density)

Groups, each with its own palette:
  trees   : cursed trees standing in for "T" where the curse is deep
  big     : large growths and remains, one per solid "k" cell
  small   : bones, stalks, graves and pustules strewn over cursed ground (not solid)
  decal   : veins and roots that lie flat on the ground (painted into the ground layer)"""
import json, colorsys, sys
from PIL import Image

P1 = "/home/claude/packs3/cursedtiles/PNG/Objects_separetely/"
P2 = "/home/claude/packs3/cursedobj/PNG/Objects_separately/"
P3 = "/home/claude/packs3/undeadobj/PNG/Objects_separately/"
GROUPS = {
    "trees": [(P3, "monster_tree1_shadow1"), (P3, "monster_tree2_shadow1"), (P3, "monster_tree3_shadow1"),
              (P3, "web_tree1_shadow1"), (P3, "web_tree2_shadow1"), (P3, "web_tree3_shadow1")],
    "big": [(P1, "Jaws_plant_shadow1_2"), (P1, "Tentacle_plant_shadow1_2"), (P1, "Rock_eyes_shadow1_1"), (P1, "Rock3_shadow1_2"),
            (P1, "Spike_plant_shadow1_2"), (P1, "Meat_flower_shadow1_1"), (P2, "Claw_eggs_shadow1_2"), (P2, "Claw_monster_shadow1_3"),
            (P2, "Tooth_monster_shadow1_2"), (P2, "Eyes_shadow1_1"), (P3, "skull_pile_shadow1"), (P3, "web_rock1_shadow1"),
            (P1, "Rock1_shadow1_1"), (P2, "Rune_stone_shadow1_1")],
    "small": [(P1, "Bones_shadow1_2"), (P1, "Bones_shadow1_3"), (P1, "Bones_shadow1_5"), (P1, "Bones_shadow1_6"), (P1, "Bones_shadow1_8"),
              (P1, "Eye_plant_shadow1_2"), (P1, "Eye_plant_shadow1_3"), (P1, "Many_eyes_plant_shadow1_2"), (P1, "Pustules_shadow1_2"),
              (P1, "Pustules_shadow1_3"), (P1, "Tubular_plant_shadow1_2"), (P1, "Rock1_shadow1_4"), (P1, "Rock_eyes_shadow1_3"),
              (P2, "Mushrooms_shadow1_2"), (P2, "Eggs_shadow1_3"), (P2, "Webbed_shadow1_1"), (P2, "Rune_stone_shadow1_4"),
              (P3, "grave1_shadow1"), (P3, "grave2_shadow1"), (P3, "grave3_shadow1"), (P3, "grave5_shadow1"), (P3, "grave6_shadow1"),
              (P3, "undead_plant1_shadow1"), (P3, "undead_plant3_shadow1"), (P3, "mushroom1_2_shadow1"), (P3, "mushroom2_3_shadow1"),
              (P3, "bone_pelvis_shadow1"), (P3, "bone_arm_sword_shadow1"), (P3, "web_rock3_shadow1")],
    "decal": [(P1, "Veins_shadow1_1"), (P1, "Veins_shadow1_2"), (P1, "Veins_shadow1_3"), (P1, "Veins_shadow1_4")],
}
# what each solid cursed growth is called when looked at, keyed by name (the engine picks a line by the sprite)
TINT = (54, 40, 62)


def grim(im, sat=0.66, val=0.8, tk=0.14):
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
js = ["/* Cursed land art for southern Etharis: craftpix.net Cursed Land top-down tileset, Cursed Land objects and Top-down",
      "   Undead Land objects, grimmed. Each group has one palette; each row is a string of palette characters, a space is empty.",
      "   Built by concept/curse_bake.py. */"]
ART = {}
total = 0
for gname, items in GROUPS.items():
    ims = {n: grim(Image.open(d + n + ".png")) for d, n in items}
    W = sum(i.width for i in ims.values()); H = max(i.height for i in ims.values())
    sheet = Image.new("RGBA", (W, H)); x = 0
    for n, i in ims.items(): sheet.paste(i, (x, 0)); x += i.width
    q = sheet.convert("RGB").quantize(NPAL, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    pal = (q.getpalette() + [0] * NPAL * 3)[:NPAL * 3]
    out = {}
    for n, im in ims.items():
        qi = im.convert("RGB").quantize(palette=q, dither=Image.Dither.NONE); a = im.split()[3].load(); p = qi.load()
        rows = ["".join(CH[p[x, y]] if a[x, y] else " " for x in range(im.width)).rstrip() for y in range(im.height)]
        key = n.replace("_shadow1", "").lower()
        out[key] = {"w": im.width, "h": im.height, "rows": rows}
        total += sum(len(r) for r in rows)
    ART[gname] = {"pal": ['#%02x%02x%02x' % tuple(pal[i * 3:i * 3 + 3]) for i in range(NPAL)], "art": out}
js.append(f"const CURSE_CH = {json.dumps(''.join(CH))};")
js.append(f"const CURSE_ART = {json.dumps(ART, separators=(',', ':'))};")
src = "\n".join(js) + "\n"
open("/home/claude/durinn/src/parts/02t_curse_data.js", "w").write(src)
print("bytes", len(src), "chars", total)
for g, d in ART.items(): print(g, {k: (v["w"], v["h"]) for k, v in d["art"].items()})

# review sheet: every sprite at 2x on a mid curse-ground colour
S = "/tmp/claude-0/-home-claude/81f7a483-afca-5415-8c60-809b5595b3f8/scratchpad/curse_review.png"
from PIL import ImageDraw
cells = [(g, k, v) for g, d in ART.items() for k, v in d["art"].items()]
cw = 270; cols = 8; rows_n = (len(cells) + cols - 1) // cols
rv = Image.new("RGB", (cols * cw, rows_n * cw), (92, 78, 70)); dr = ImageDraw.Draw(rv)
for i, (g, k, v) in enumerate(cells):
    pal = [tuple(int(h[j:j + 2], 16) for j in (1, 3, 5)) for h in ART[g]["pal"]]
    im = Image.new("RGBA", (v["w"], v["h"]))
    for y, r in enumerate(v["rows"]):
        for x, ch in enumerate(r):
            if ch != " ": im.putpixel((x, y), pal[CH.index(ch)] + (255,))
    im = im.resize((min(v["w"] * 2, 260), min(v["h"] * 2, 250)), Image.NEAREST)
    X, Y = (i % cols) * cw, (i // cols) * cw
    rv.paste(im, (X + 4, Y + 4), im); dr.text((X + 4, Y + cw - 14), f"{g}:{k}"[:40], fill=(255, 255, 0))
rv.save(S)
