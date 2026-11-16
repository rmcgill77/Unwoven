"""Bake item icons: pick one icon per item from the assets14 packs, grim it, pack an atlas.
Outputs src/parts/02p_icon_data.js and a review sheet."""
import json, colorsys, base64, io, sys
from PIL import Image, ImageDraw, ImageFont

SP = "/tmp/claude-0/-home-claude/81f7a483-afca-5415-8c60-809b5595b3f8/scratchpad/"
IDX = json.load(open(SP + "idx/index.json"))
ITEMS = json.load(open(SP + "items.json"))

# one pack per kind: weapons k (1000 RPG icons), armour e (equipment sets), charms a (rings/amulets),
# draughts p (potions), papers/books i (RPG items), sacks/barrels t (things), cloth c, materials/herbs k
PICK = {
    # food
    "bread": "k24", "haunch": "t19", "ration": "k27", "alekeg": "t43",
    # supplies
    "tonic": "p135", "gtonic": "p142", "btonic": "p110", "antidote": "p120", "potion": "p13",
    "poultice": "k1020", "spoultice": "k1021", "gpoultice": "k1023", "bandage": "@bandage",
    "firepot": "k0", "torchoil": "t54", "oil": "t56",
    # odds and ends
    "candle": "@candle", "firewax": "@firewax", "rope": "r24", "ink": "k6", "pebble": "k848",
    "token": "k372", "cuttoken": "a32",
    # papers and parcels
    "delivery": "t13", "parcel": "i21", "tome": "i28", "primer": "i20",
    "letter": "i39", "maudletter": "i30", "covletter": "i31", "covnote": "i39", "dispatch": "i37",
    "billofsale": "i33", "leaflet": "i22", "ledgerscrap": "i33", "gwledgers": "i35",
    "huntreply": "i37", "valeorders": "i22",
    "debtpurse": "t12", "maudbundle": "t10", "casks": "t44",
    "constructkey": "k22", "keystone": "k294",
    # beasts
    "pelt": "k843", "hide": "k859", "fang": "k847", "tusk": "k863", "gel": "k887",
    "rattail": "k959", "batwing": "k1074", "bone": "k861",
    # herbs
    "mooncap": "k960", "redcap": "k1040", "mroot": "k981", "yarrow": "k1014", "snapvine": "k1012",
    "sap": "k897", "emberdust": "k913", "silk": "c40", "frostsilk": "c33",
    # curios and dark things
    "gravecoin": "t0", "ring": "a5", "signet": "a16", "bonecharm": "a43", "cutgem": "k870",
    "stoneheart": "k832", "scrap": "k860",
    # charms
    "charm": "a58", "medal": "a41", "fangcharm": "a72", "ashcharm": "a48", "thistlepin": "a87",
    "leycharm": "a75", "scholarseal": "a51", "harecharm": "a42",
    # weapons (all from the one pack so they read as a set)
    "oldsword": "k320", "tessablade": "k321", "wayblade": "k352", "ironblade": "k353", "greyedge": "k354",
    "fortblade": "k546", "leyblade": "k514", "frostcrown": "k386", "thornwake": "k418",
    "valecleaver": "k547", "hakoncleaver": "k357",
    "dagger": "k346", "shortsword": "k545", "club": "k369", "axe": "k356", "cleaver": "k355",
    "shortbow": "k342", "arrows": "t70", "shield": "k373",
    # armour
    "jerkin": "e122", "paddedcoat": "e260", "ringmail": "e308", "brigandine": "e31", "fortplate": "e76",
    "weaverplate": "e69", "tunic": "e172", "boots": "e283",
    "ironcap": "e1", "leathercap": "e255", "kettlehat": "e156", "sallet": "e8", "greathelm": "e60",
    "helm": "k579", "rimefang": "c78",
}

def candle(red=False):
    im = Image.new("RGBA", (32, 32)); d = ImageDraw.Draw(im)
    body, shade, edge = ((178, 64, 52), (130, 40, 36), (60, 20, 20)) if red else ((226, 214, 178), (178, 160, 122), (60, 50, 40))
    d.rectangle([12, 13, 20, 28], fill=body, outline=edge)
    d.rectangle([17, 14, 19, 27], fill=shade)
    d.rectangle([13, 13, 15, 17], fill=body); d.point((14, 18), fill=body)  # a drip
    d.rectangle([9, 28, 23, 30], fill=(92, 78, 64), outline=edge)  # dish
    d.line([16, 10, 16, 13], fill=(40, 30, 24))
    flame = [(16, 3), (14, 6), (13, 8), (14, 10), (16, 11), (18, 10), (19, 8), (18, 6)]
    d.polygon(flame, fill=(240, 150, 50), outline=(150, 70, 20))
    d.polygon([(16, 6), (15, 8), (16, 10), (17, 8)], fill=(255, 230, 140))
    return im

def bandage():
    im = Image.new("RGBA", (32, 32)); d = ImageDraw.Draw(im)
    edge, cloth, shade = (70, 58, 46), (222, 212, 188), (176, 162, 136)
    d.polygon([(18, 18), (28, 22), (27, 27), (16, 24)], fill=cloth, outline=edge)   # loose end
    d.line([(19, 21), (26, 24)], fill=shade)
    d.ellipse([4, 8, 22, 26], fill=cloth, outline=edge)
    d.ellipse([9, 13, 17, 21], fill=shade, outline=edge)
    d.ellipse([11, 15, 15, 19], fill=(90, 76, 60))
    d.arc([6, 10, 20, 24], 200, 320, fill=shade)
    return im

HARD = {"gravecoin": 0.25}   # extra-dull: a grave coin is not bright gold
def grim(im, sat=0.72, val=0.9, tint=(104, 110, 124), tk=0.08):
    im = im.convert("RGBA"); px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if not a: continue
            h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            s *= sat; v = 0.04 + v * val * 0.96
            r, g, b = colorsys.hsv_to_rgb(h, s, v)
            r, g, b = [int(c * 255 * (1 - tk) + t * tk) for c, t in zip((r, g, b), tint)]
            px[x, y] = (r, g, b, 255 if a > 100 else 0)
    return im

def load(code):
    if code == "@candle": return candle()
    if code == "@firewax": return candle(True)
    if code == "@bandage": return bandage()
    im = Image.open(IDX[code]).convert("RGBA")
    bb = im.getbbox()
    if bb and max(bb[2] - bb[0], bb[3] - bb[1]) <= 15:   # the equipment pack draws small: double it
        im = im.crop(bb).resize(((bb[2] - bb[0]) * 2, (bb[3] - bb[1]) * 2), Image.NEAREST)
        c = Image.new("RGBA", (32, 32)); c.paste(im, ((32 - im.width) // 2, (32 - im.height) // 2)); im = c
    if im.size != (32, 32):
        bb = im.getbbox(); im = im.crop(bb); im.thumbnail((32, 32), Image.NEAREST)
        c = Image.new("RGBA", (32, 32)); c.paste(im, ((32 - im.width) // 2, (32 - im.height) // 2)); im = c
    return im

ids = [i for i, _, _ in ITEMS]
miss = [i for i in ids if i not in PICK]
assert not miss, miss
COLS = 16
atlas = Image.new("RGBA", (COLS * 32, ((len(ids) + COLS - 1) // COLS) * 32))
cells = {}
for n, iid in enumerate(ids):
    atlas.paste(grim(load(PICK[iid]), sat=HARD.get(iid, 0.72)), ((n % COLS) * 32, (n // COLS) * 32))
    cells[iid] = n
buf = io.BytesIO(); atlas.save(buf, "PNG", optimize=True)
b64 = base64.b64encode(buf.getvalue()).decode()
open("/home/claude/durinn/src/parts/02p_icon_data.js", "w").write(
    "/* Item icons: 1000 RPG Icons, RPG Equipment Sets, RPG Potions, RPG Items, Things for RPG, Resource Icons,\n"
    "   Rings and Amulets, Cloaks and Belts pixel-art packs (assets14), grimmed. 32px cells, 16 to a row. */\n"
    f"const ITEM_ICON_SRC = \"data:image/png;base64,{b64}\";\n"
    f"const ITEM_ICON_CELL = {json.dumps(cells)};\n")
print("atlas", atlas.size, len(buf.getvalue()), "bytes")

# review sheet: every item, its icon at 2x, its name and pack code, grouped by kind
order = ["food", "supply", "", "quest", "hide", "herb", "silk", "dark", "curio", "salvage", "gear:charm", "gear:weapon", "arms", "gear:body", "gear:head"]
kname = {"": "odds and ends", "food": "food", "supply": "supplies", "quest": "quest items", "hide": "beast parts", "herb": "herbs",
         "silk": "silk", "dark": "dark things", "curio": "curios", "salvage": "salvage", "gear:charm": "charms",
         "gear:weapon": "weapons (gear)", "arms": "arms (loot)", "gear:body": "body armour", "gear:head": "head"}
groups = {}
for iid, name, kind in ITEMS: groups.setdefault(kind, []).append((iid, name))
try: F = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 13); FB = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 15)
except Exception: F = FB = ImageFont.load_default()
CW, CH, PC = 250, 76, 5
rows = []
for k in order + [k for k in groups if k not in order]:
    if k not in groups: continue
    rows.append(("h", k)); its = groups[k]
    for j in range(0, len(its), PC): rows.append(("r", its[j:j + PC]))
H = sum(30 if t == "h" else CH for t, _ in rows) + 20
sheet = Image.new("RGB", (CW * PC + 20, H), (34, 30, 28)); d = ImageDraw.Draw(sheet); y = 10
for t, v in rows:
    if t == "h": d.text((12, y + 8), kname.get(v, v).upper(), font=FB, fill=(220, 190, 120)); y += 30; continue
    for j, (iid, name) in enumerate(v):
        x = 10 + j * CW
        d.rectangle([x, y + 4, x + 70, y + 70], fill=(58, 50, 44), outline=(96, 82, 66))
        ic = grim(load(PICK[iid]), sat=HARD.get(iid, 0.72)).resize((64, 64), Image.NEAREST); sheet.paste(ic, (x + 4, y + 6), ic)
        d.text((x + 80, y + 20), name, font=F, fill=(236, 228, 214))
        d.text((x + 80, y + 40), PICK[iid].lstrip("@"), font=F, fill=(140, 130, 116))
    y += CH
sheet.save(SP + "icon_review.png"); print("sheet", sheet.size)
