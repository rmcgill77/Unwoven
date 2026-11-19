"""Bake the overworld's small nature from the craftpix Grassland top-down tileset (assets12): bushes, stones half
sunk in grass, rocks in a fringe of turf, grass tufts and pebbles. Unlike the old drawn rocks and bushes these come
with the ground grown up around their feet, so they sit in the earth instead of on it.

Colour is remapped onto the game's own ramps rather than just darkened: leaf and grass greens onto the grim grass
ramp, sandy stone onto the cool grey stone ramp, packed dirt onto the mud ramp, bright flowers into dull leaf (red
berries kept, darkened). Two variants of every stone: _g sits in grass, _d on bare earth (the pack's ground shadow).
-> src/parts/02w_nature_data.js   NATURE_ART { pal, art{ name: {w,h,rows} } }  (CURSE_CH packing)"""
import json, colorsys, sys
from PIL import Image

P = "/home/claude/packs6/grass/PNG/Objects_separated/"
ITEMS = {
    # bushes (b tiles, wood edges)
    "bush1": "Bush1", "bush2": "Bush2", "bush3": "Bush3", "bush4": "Bush4", "bush5": "Bush5", "bush6": "Bush6", "bush7": "Bush7",
    "bush8": "Bush8", "bush10": "Bush10", "bush11": "Bush11", "bush13": "Bush13", "bush14": "Bush14", "bush15": "Bush15", "bush17": "Bush17", "bush18": "Bush18",
    # small scrub, tufts, flowers gone to seed
    "scrub1": "Bush9", "scrub2": "Bush12", "scrub3": "Bush16", "scrub4": "Bush19",
    "tuft1": "grass_element1", "tuft2": "grass_element2", "tuft3": "grass_element3",
    "rtuft1": "Rock_grass_element11", "rtuft2": "Rock_grass_element12", "rtuft3": "Rock_grass_element13", "rtuft4": "Rock_grass_element14",
    "peb1": "ground_element20", "peb2": "ground_element21", "peb3": "ground_element22", "peb4": "ground_element23",
    # stones
    "stone1_g": "Stone1_grass_shadow", "stone2_g": "Stone2_grass_shadow", "stone3_g": "Stone3_grass_shadow", "stone4_g": "Stone4_grass_shadow", "stone5_g": "Stone5_grass_shadow",
    "stone1_d": "Stone1_ground_shadow", "stone2_d": "Stone2_ground_shadow", "stone3_d": "Stone3_ground_shadow", "stone4_d": "Stone4_ground_shadow", "stone5_d": "Stone5_ground_shadow",
    "turf1": "Rpck_grass1", "turf2": "Rpck_grass2", "turf3": "Rpck_grass3", "turf4": "Rpck_grass4", "turf5": "Rpck_grass5",
    "stump1": "Broken_tree1", "stump2": "Broken_tree2", "stump4": "Broken_tree4", "stump5": "Broken_tree5",
}
HEX = lambda h: tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
GRASS = [HEX(h) for h in ["#1e2618", "#27321f", "#303d26", "#3b4830", "#475538", "#536143", "#62704e", "#747e5c"]]
STONE = [HEX(h) for h in ["#26242a", "#333137", "#403e44", "#4e4c52", "#5c5a60", "#6a686c", "#7a787a", "#8a8884"]]
MUD = [HEX(h) for h in ["#2a2219", "#352a1e", "#3e3226", "#4c3e2e", "#5c4c38", "#6e5c44"]]
BARK = [HEX(h) for h in ["#241a12", "#30241a", "#3e3022", "#4e3e2c", "#5e4c36", "#6e5a40"]]
BERRY = HEX("#6a2a2a")
RUST = [HEX(h) for h in ["#2e2219", "#3c2c20", "#4c3826", "#5c4630", "#6a5238"]]


def ramp(R, v, lift=0.0):
    k = max(0, min(len(R) - 1, int(round((v + lift) * (len(R) - 1)))))
    return R[k]


def remap(im, name):
    im = im.convert("RGBA"); px = im.load()
    stump = name.startswith("stump")
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a < 110: px[x, y] = (0, 0, 0, 0); continue
            h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            hd = h * 360
            if 55 <= hd <= 170 and s > 0.18:                         # leaf and grass
                out = ramp(GRASS, v ** 1.15 * 0.95)
            elif stump:
                out = ramp(BARK, v * 0.95)
            elif s > 0.45 and 9 <= hd <= 42:                         # packed dirt and the ground shadow
                out = ramp(MUD, v * 1.1)
            elif s > 0.45 and (hd < 9 or hd > 300):                  # red: berries on the berry bush, dead rust leaves elsewhere
                out = (BERRY if v > 0.6 else tuple(int(c * 0.75) for c in BERRY)) if name == "bush2" else ramp(RUST, v)
            elif s > 0.4 and 170 < hd <= 300:                        # blue and violet flowers: dulled into the leaves
                out = ramp(GRASS, v * 0.7, 0.05)
            elif s > 0.45:                                            # yellow flowers
                out = ramp(GRASS, v * 0.75, 0.08)
            else:                                                     # stone: sandy in the pack, cool grey here
                out = ramp(STONE, v ** 1.1 * 0.98)
            px[x, y] = out + (255,)
    return im.crop(im.getbbox())


CH = [chr(c) for c in range(35, 127) if chr(c) not in "\\'\"`$"]
ims = {k: remap(Image.open(P + f + ".png"), k) for k, f in ITEMS.items()}
pal = sorted({im.getpixel((x, y))[:3] for im in ims.values() for y in range(im.height) for x in range(im.width) if im.getpixel((x, y))[3]})
assert len(pal) <= len(CH), len(pal)
idx = {c: i for i, c in enumerate(pal)}
art = {}
for k, im in ims.items():
    p = im.load()
    rows = ["".join(CH[idx[p[x, y][:3]]] if p[x, y][3] else " " for x in range(im.width)).rstrip() for y in range(im.height)]
    art[k] = {"w": im.width, "h": im.height, "rows": rows}
data = {"pal": ['#%02x%02x%02x' % c for c in pal], "art": art}
src = ("/* Small nature for the overworld: bushes, stones in turf, tufts and pebbles from the craftpix Grassland top-down tileset,\n"
       "   recoloured onto the game's grass, stone and mud ramps and packed like the curse art (CURSE_CH). Built by concept/nature_bake.py. */\n"
       f"const NATURE_ART = {json.dumps(data, separators=(',', ':'))};\n")
open("/home/claude/durinn/src/parts/02w_nature_data.js", "w").write(src)
print("palette", len(pal), "bytes", len(src))
# review sheet on the game's grass
from PIL import ImageDraw
W = 1200; x = y = 0; rh = 0; pos = []
for k, im in ims.items():
    if x + im.width * 2 + 8 > W: x = 0; y += rh + 18; rh = 0
    pos.append((k, im, x, y)); x += im.width * 2 + 10; rh = max(rh, im.height * 2)
sh = Image.new("RGB", (W, y + rh + 18), HEX("#3b4830")); d = ImageDraw.Draw(sh)
for k, im, x, y in pos:
    big = im.resize((im.width * 2, im.height * 2), Image.NEAREST); sh.paste(big, (x, y + 12), big); d.text((x, y), k, fill=(240, 230, 190))
sh.save(sys.argv[1] if len(sys.argv) > 1 else "/tmp/nature.png")
