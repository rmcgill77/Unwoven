"""Build the cast on the purchased craftpix base sprite: palette roles + per-character overlays."""
from PIL import Image, ImageDraw
import numpy as np
BASE = Image.open("base_front.png").convert("RGBA")
PAD_X, PAD_Y = 6, 2
def hx(c): return tuple(int(c[i:i+2], 16) for i in (1, 3, 5))
def mix(a, b, t): return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))
INK = (0, 0, 0)
ROLE = {  # base colour -> role
    "#3b2027": "hairA", "#3d2936": "hairB", "#291d2b": "hairD", "#8f4d57": "hairHi",
    "#ffc2a1": "skin", "#bd6a62": "skinD",
    "#73172d": "eye0", "#fa6a0a": "eye1", "#f9a31b": "eye2", "#ffd541": "eye3", "#d6f264": "eye4",
    "#283540": "outL", "#122020": "out", "#2c354d": "in", "#14182e": "inD", "#ff8933": "trim", "#7d3833": "trimD",
}
def load():
    a = np.array(BASE)
    H, W = a.shape[:2]
    big = np.zeros((H + PAD_Y + 6, W + PAD_X * 2, 4), np.uint8)
    big[PAD_Y:PAD_Y + H, PAD_X:PAD_X + W] = a
    return big
def recolor(a, pal):
    out = a.copy()
    for y in range(a.shape[0]):
        for x in range(a.shape[1]):
            if a[y, x, 3] == 0: continue
            c = "#%02x%02x%02x" % tuple(a[y, x, :3])
            role = ROLE.get(c)
            if c == "#3b1725": role = "boot" if y > 60 else "eyeK"
            if role and role in pal: out[y, x, :3] = pal[role]
    return out
def roles_mask(a, names):
    m = np.zeros(a.shape[:2], bool)
    for y in range(a.shape[0]):
        for x in range(a.shape[1]):
            if a[y, x, 3] == 0: continue
            c = "#%02x%02x%02x" % tuple(a[y, x, :3]); r = ROLE.get(c)
            if r in names: m[y, x] = True
    return m
def outline(a):
    H, W = a.shape[:2]
    op = a[:, :, 3] > 0
    blk = op & np.all(a[:, :, :3] == 0, axis=2)
    solid = op & ~blk
    # drop stray black pixels no longer touching anything solid
    for y in range(H):
        for x in range(W):
            if blk[y, x] and not any(0 <= y + dy < H and 0 <= x + dx < W and solid[y + dy, x + dx] for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                a[y, x, 3] = 0
    op = a[:, :, 3] > 0
    add = []
    for y in range(H):
        for x in range(W):
            if not op[y, x] and any(0 <= y + dy < H and 0 <= x + dx < W and op[y + dy, x + dx] and a[y + dy, x + dx, :3].tolist() != [0, 0, 0] for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                add.append((y, x))
    for y, x in add: a[y, x] = (0, 0, 0, 255)
    return a
def poly(a, pts, color, only_empty=False, only=None):
    im = Image.new("L", (a.shape[1], a.shape[0]), 0)
    ImageDraw.Draw(im).polygon([(x + PAD_X, y + PAD_Y) for x, y in pts], fill=1)
    m = np.array(im).astype(bool)
    if only_empty: m &= a[:, :, 3] == 0
    if only is not None: m &= only
    a[m] = (*color, 255)
    return m
def line(a, pts, color, only=None):
    im = Image.new("L", (a.shape[1], a.shape[0]), 0)
    ImageDraw.Draw(im).line([(x + PAD_X, y + PAD_Y) for x, y in pts], fill=1, width=1)
    m = np.array(im).astype(bool)
    if only is not None: m &= only
    a[m] = (*color, 255)

def hair_pal(A, B, D, Hi): return {"hairA": hx(A), "hairB": hx(B), "hairD": hx(D), "hairHi": hx(Hi)}
def eye_pal(e0, e1, e2, e3, e4, k): return {"eye0": hx(e0), "eye1": hx(e1), "eye2": hx(e2), "eye3": hx(e3), "eye4": hx(e4), "eyeK": hx(k)}

CAST = []
# Wren: the base as purchased
CAST.append(("Wren (you)", {}, []))
# Tessa: auburn, long hair with a braid, green work cloak over a cream apron
CAST.append(("Tessa", {**hair_pal("#9a4426", "#b4552e", "#6a2a18", "#e08a50"), **eye_pal("#123a26", "#2f7a46", "#5aa85a", "#a8d86a", "#d6f264", "#0e2a1c"),
    "skin": hx("#ffcfae"), "skinD": hx("#d98a78"), "outL": hx("#5e6e3c"), "out": hx("#3a4626"), "in": hx("#e6d6b4"), "inD": hx("#b8a482"), "trim": hx("#7a4428"), "trimD": hx("#4a2616"), "boot": hx("#4a2a1a")}, ["long", "braid", "blush"]))
# Bram: brown crop, short beard, red tunic, cream apron
CAST.append(("Bram", {**hair_pal("#5a3a22", "#6e4a2c", "#3a2416", "#a07048"), **eye_pal("#2a160c", "#6a3e1e", "#9a6430", "#c89048", "#e0b860", "#1a0e08"),
    "skin": hx("#f2b890"), "skinD": hx("#c07a62"), "outL": hx("#7c3a36"), "out": hx("#4e2224"), "in": hx("#e2d2b0"), "inD": hx("#b09c7c"), "trim": hx("#5a3a22"), "trimD": hx("#3a2416"), "boot": hx("#3a2418")}, ["beard"]))
# Kellan Vex: blue-black hair, ice eyes, violet coat with gold
CAST.append(("Kellan Vex", {**hair_pal("#1c1c2a", "#24243a", "#0c0c14", "#4c4c70"), **eye_pal("#1a2a4a", "#3a6aa8", "#7aa8d8", "#c0dcf4", "#eaf6ff", "#10182a"),
    "skin": hx("#f6dccc"), "skinD": hx("#c09aa0"), "outL": hx("#4a3a68"), "out": hx("#241a36"), "in": hx("#3a3446"), "inD": hx("#1a1622"), "trim": hx("#d4a840"), "trimD": hx("#8a6a20"), "boot": hx("#18121e")}, ["scar"]))
# Hooded companion: grey hood up, short dark beard
CAST.append(("Hooded companion", {**hair_pal("#2c2422", "#3a302c", "#1a1412", "#5a4a44"), **eye_pal("#3a2410", "#7a5420", "#b08038", "#d8a850", "#f0d070", "#24160a"),
    "skin": hx("#c88e68"), "skinD": hx("#8e5a40"), "outL": hx("#5c606c"), "out": hx("#30333c"), "in": hx("#4a3e30"), "inD": hx("#2a221a"), "trim": hx("#9a8a62"), "trimD": hx("#6a5a3a"), "boot": hx("#2a1e18")}, ["hood", "beard"]))
# Old mentor: white mane and beard, eyes closed, navy robe with a red underlayer
CAST.append(("Old mentor", {**hair_pal("#c4c0ca", "#d6d2dc", "#8a8494", "#ffffff"), **eye_pal("#2a3a4a", "#4a6a8a", "#8ab0d0", "#c0dcf0", "#e0f0ff", "#1a2430"),
    "skin": hx("#f2c4a2"), "skinD": hx("#c08870"), "outL": hx("#4a5a7e"), "out": hx("#26304a"), "in": hx("#7a3434"), "inD": hx("#4e2020"), "trim": hx("#d4a840"), "trimD": hx("#8a6a20"), "boot": hx("#2a2018")}, ["mane", "beard_long", "closed"]))

def build(pal, extras):
    base = load()
    HAIRM = roles_mask(base, {"hairA", "hairB", "hairD", "hairHi"})
    a = recolor(base, pal)
    g = lambda k, d: pal.get(k, hx(d))
    hA, hB, hD, hHi = g("hairA", "#3b2027"), g("hairB", "#3d2936"), g("hairD", "#291d2b"), g("hairHi", "#8f4d57")
    sk, skD = g("skin", "#ffc2a1"), g("skinD", "#bd6a62")
    out, outL = g("out", "#122020"), g("outL", "#283540")
    if "long" in extras or "mane" in extras:
        behind = a[:, :, 3] == 0
        L = [(3, 34), (8, 36), (11, 46), (10, 58), (7, 63), (3, 58), (1, 46)]
        R = [(43, 34), (38, 36), (36, 46), (37, 58), (40, 63), (45, 58), (46, 46)]
        if "mane" in extras: L = [(3, 34), (8, 36), (11, 44), (9, 52), (4, 50), (1, 42)]; R = [(43, 34), (38, 36), (36, 44), (38, 52), (43, 50), (46, 42)]
        for P in (L, R):
            poly(a, P, hB, only=behind)
            xs = [p[0] for p in P]; cx = sum(xs) / len(xs)
            line(a, [(cx - 1, 37), (cx - 2, 47), (cx - 1, 58)], hD, only=behind)
            line(a, [(cx + 2, 38), (cx + 2, 50)], hA, only=behind)
    if "braid" in extras:
        for i in range(6):
            y = 42 + i * 4
            poly(a, [(39, y), (43, y), (44, y + 3), (40, y + 4), (38, y + 2)], hB)
            line(a, [(39, y + 1), (43, y + 3)], hD)
            line(a, [(39, y), (41, y)], hA)
        poly(a, [(39, 66), (43, 66), (42, 68), (40, 68)], g("trim", "#ff8933"))
    if "hood" in extras:
        hair = roles_mask(a, set())  # placeholder
        # everything that was hair becomes hood cloth; trim the spikes to a smooth cowl
        H, W = a.shape[:2]
        cx, cy, rx, ry = 23.5 + PAD_X, 23 + PAD_Y, 22.5, 22.5
        for y in range(H):
            for x in range(W):
                c = tuple(a[y, x, :3]); inside = ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1
                if HAIRM[y, x]:
                    a[y, x] = (*(outL if c in (hA, hHi) else out if c == hD else mix(outL, out, 0.5)), 255) if inside else (0, 0, 0, 0)
                elif a[y, x, 3] and c == (0, 0, 0) and not inside and y < 42 + PAD_Y: a[y, x, 3] = 0
                elif not a[y, x, 3] and inside and y < 44 + PAD_Y: a[y, x] = (*mix(outL, out, 0.5), 255)
        line(a, [(9, 30), (11, 20), (17, 13), (23, 11), (30, 13), (36, 20), (38, 30)], out)
        line(a, [(6, 12), (3, 22), (2, 32)], outL)
    if "beard" in extras or "beard_long" in extras:
        ln = 1.0 if "beard_long" in extras else -0.45
        ydn = lambda v: round(v + ln * (v - 36) * 0.9)
        pts = [(13, 33), (17, 36), (22, 37), (26, 37), (31, 36), (35, 33), (36, ydn(40)), (33, ydn(45)), (28, ydn(49)), (24, ydn(50)), (19, ydn(49)), (15, ydn(45)), (12, ydn(40))]
        m = poly(a, pts, hB)
        for s in [[(15, 37), (17, ydn(45))], [(33, 37), (31, ydn(45))], [(24, 41), (24, ydn(49))], [(20, 39), (20, ydn(47))], [(28, 39), (28, ydn(47))]]: line(a, s, hD, only=m)
        line(a, [(17, 36), (21, 38)], hA, only=m); line(a, [(27, 38), (31, 36)], hA, only=m)
        line(a, [(21, 39), (24, 40), (27, 39)], hD)
        # outline the beard edge against the body
        H, W = a.shape[:2]
        edge = [(y, x) for y in range(H) for x in range(W) if m[y, x] and any(0 <= y + dy < H and 0 <= x + dx < W and not m[y + dy, x + dx] and tuple(a[y + dy, x + dx, :3]) not in (sk, skD) for dy, dx in ((1, 0), (0, 1), (0, -1)))]
        for y, x in edge: a[y, x] = (0, 0, 0, 255)
    if "closed" in extras:
        eye_cols = {pal[k] for k in ("eye0", "eye1", "eye2", "eye3", "eye4", "eyeK")} | {(255, 255, 255), (185, 191, 251)}
        H, W = a.shape[:2]
        for y in range(H):
            for x in range(W):
                if a[y, x, 3] and tuple(a[y, x, :3]) in eye_cols: a[y, x] = (*sk, 255)
        for x0 in (16, 30):
            line(a, [(x0 - 1, 29), (x0 + 1, 31), (x0 + 4, 31), (x0 + 6, 29)], INK)
    if "blush" in extras:
        for x in (16, 17, 33, 34): a[34 + PAD_Y, x + PAD_X] = (*mix(sk, hx("#ff6a70"), 0.45), 255)
    if "scar" in extras:
        line(a, [(32, 22), (35, 34)], skD)
    return outline(a)

if __name__ == "__main__":
    S = 6
    tiles = []
    for name, pal, ex in CAST:
        im = Image.fromarray(build(pal, ex))
        tiles.append((name, im))
        im.save(f"cb_{name.split()[0].lower()}.png")
    W = max(t.width for _, t in tiles) * S + 40; H = max(t.height for _, t in tiles) * S + 60
    sheet = Image.new("RGBA", (W * len(tiles), H), "#1c1730")
    d = ImageDraw.Draw(sheet)
    for i, (name, im) in enumerate(tiles):
        big = im.resize((im.width * S, im.height * S), Image.NEAREST)
        sheet.paste(big, (i * W + 20, 46), big)
        from PIL import ImageFont
        f = ImageFont.load_default(size=26)
        d.text((i * W + W // 2, 22), name, fill="#e9d9b4", font=f, anchor="mm")
    sheet.save("cast_base.png")
