"""Concept map for Southern Etharis (Act 3). Planning art only: nothing in the game reads this.
Global tiles: x east 0-359, y south 0-239 (the plains are 190 x 110). Writes concept/south_etharis_map.png."""
import math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, S = 360, 240, 4            # tiles, px per tile
rnd = random.Random(33)
np.random.seed(33)

def vnoise(w, h, cell, seed):
    r = np.random.RandomState(seed)
    gw, gh = w // cell + 3, h // cell + 3
    g = r.rand(gh, gw)
    im = Image.fromarray((g * 255).astype("uint8")).resize((gw * cell, gh * cell), Image.BICUBIC)
    a = np.asarray(im, dtype=float) / 255
    return a[:h, :w]

def fbm(w, h, seed):
    return 0.5 * vnoise(w, h, 40, seed) + 0.3 * vnoise(w, h, 17, seed + 1) + 0.2 * vnoise(w, h, 7, seed + 2)

MW, MH = W * S, H * S
n1 = fbm(MW, MH, 1)
n2 = fbm(MW, MH, 9)
yy, xx = np.mgrid[0:MH, 0:MW]
tx, ty = xx / S, yy / S

# curse: grows from the far south-east corner, ragged edge
dist = np.hypot((tx - 350) * 0.8, (ty - 232) * 1.0)
curse = np.clip(1 - (dist - 40) / 150 + (n1 - 0.5) * 0.5, 0, 1)

# mountains: a short range down the west edge
ridge = np.exp(-(((tx - (22 + 14 * np.sin(ty / 23.0))) / 24.0) ** 2)) * np.clip(1 - np.abs(ty - 130) / 78.0, 0, 1)
mount = np.clip(ridge * 2.6 + (n2 - 0.5) * 0.5, 0, 1)

img = np.zeros((MH, MW, 3), dtype=float)
clean = np.array([88, 104, 66]); clean2 = np.array([70, 88, 56])
wrong = np.array([96, 90, 62]); rot = np.array([62, 46, 66]); rot2 = np.array([38, 28, 46])
base = clean[None, None, :] * (1 - n2[..., None]) + clean2[None, None, :] * n2[..., None]
c1 = np.clip(curse * 2, 0, 1)[..., None]
c2 = np.clip(curse * 2 - 1, 0, 1)[..., None]
img = base * (1 - c1) + wrong * c1
img = img * (1 - c2) + (rot * (1 - n2[..., None]) + rot2 * n2[..., None]) * c2
rock = np.array([112, 108, 104]) * (0.7 + 0.5 * n1[..., None])
img = img * (1 - np.clip(mount * 2.4, 0, 1)[..., None]) + rock * np.clip(mount * 2.4, 0, 1)[..., None]
shade = (vnoise(MW, MH, 4, 5) - 0.5) * 14
img += shade[..., None]
im = Image.fromarray(np.clip(img, 0, 255).astype("uint8"))
d = ImageDraw.Draw(im, "RGBA")

def P(x, y): return (x * S, y * S)

# forests (stipple blobs) -------------------------------------------------
def forest(cx, cy, rx, ry, col, n):
    for _ in range(n):
        a = rnd.random() * 6.283; r = math.sqrt(rnd.random())
        x = cx + math.cos(a) * rx * r; y = cy + math.sin(a) * ry * r
        if mount[int(min(MH - 1, max(0, y * S))), int(min(MW - 1, max(0, x * S)))] > 0.45: continue
        s = rnd.choice([3, 4, 5])
        d.ellipse([x * S - s, y * S - s, x * S + s, y * S + s], fill=col)
for fx, fy, rx, ry in [(110, 28, 38, 18), (250, 40, 34, 20), (140, 130, 26, 22), (270, 110, 24, 30), (90, 190, 30, 20), (210, 160, 22, 16)]:
    cl = curse[int(fy * S), int(fx * S)]
    col = (46, 70, 44, 200) if cl < 0.3 else ((70, 62, 46, 200) if cl < 0.6 else (44, 30, 52, 220))
    forest(fx, fy, rx, ry, col, 520)
# dead trees in the curse
for _ in range(500):
    x = rnd.uniform(190, 358); y = rnd.uniform(120, 238)
    if curse[int(y * S), int(x * S)] > 0.55:
        d.line([x * S, y * S, x * S, y * S - 7], fill=(24, 16, 30, 255), width=2)

# lake + river ------------------------------------------------------------
def water(pts, w, col=(54, 78, 96, 255)):
    for i in range(len(pts) - 1):
        d.line([P(*pts[i]), P(*pts[i + 1])], fill=col, width=w * S, joint="curve")
    for p in pts:
        d.ellipse([p[0] * S - w * S / 2, p[1] * S - w * S / 2, p[0] * S + w * S / 2, p[1] * S + w * S / 2], fill=col)
river = [(46, 96), (70, 104), (96, 112), (122, 118), (150, 128), (176, 140), (196, 146), (216, 156)]
water(river, 3)
d.ellipse([P(212, 148), P(244, 174)], fill=(54, 78, 96, 255))
d.ellipse([P(212, 148), P(244, 174)], outline=(120, 150, 160, 255), width=2)
# a sickly stain where the river meets the curse
d.ellipse([P(230, 162), P(256, 182)], fill=(80, 60, 100, 120))

# roads -------------------------------------------------------------------
ROAD = (190, 160, 110, 255)
def road(pts, w=2, col=ROAD):
    for i in range(len(pts) - 1):
        d.line([P(*pts[i]), P(*pts[i + 1])], fill=col, width=w * S, joint="curve")
    for p in pts:
        r = w * S / 2
        d.ellipse([p[0] * S - r, p[1] * S - r, p[0] * S + r, p[1] * S + r], fill=col)
barr = (36, 0)
xroad = (62, 44)
verrin = (190, 74); aurelm = (196, 206)
stone = (66, 104); mill = (150, 146); rotm = (310, 170)
capgate = (338, 6)
road([barr, (36, 20), xroad], 3)
road([xroad, (110, 52), (150, 64), (verrin[0] - 26, verrin[1] - 6)], 3)            # entry road to Verrin
road([verrin, (240, 60), (290, 38), (capgate[0] - 2, capgate[1] + 6)], 3)          # Capital road
road([xroad, (60, 74), (stone[0], stone[1] - 12)], 2)                              # to Stonebridge
road([stone, (100, 122), (mill[0] - 20, mill[1] - 6)], 2)                          # Stonebridge to Millhaven
road([verrin, (176, 108), (mill[0] + 6, mill[1] - 14)], 3)                         # Verrin south
road([mill, (170, 176), (aurelm[0] - 4, aurelm[1] - 18)], 3)                       # Millhaven to Aurelm
road([mill, (210, 140), (260, 150), (rotm[0] - 20, rotm[1] - 4)], 2)               # east, to Rotmoor
road([aurelm, (250, 196), (290, 184), (rotm[0] - 8, rotm[1] + 10)], 2)             # Aurelm to Rotmoor
road([(60, 150), (80, 168), (100, 190), (aurelm[0] - 36, aurelm[1] - 6)], 1, (150, 130, 96, 255))  # old mountain track
# the Covenant's patrolled road gets a thin red edge
for i in range(0, 1):
    pass

# towns, drawn to the size of their outside facades (villages ~34x20, cities ~54x32) -------
def town(c, w, h, name, sub, kind):
    x0, y0 = c[0] - w / 2, c[1] - h / 2
    wall = (60, 54, 50, 255) if kind == "city" else (92, 70, 48, 255)
    d.rectangle([P(x0, y0), P(x0 + w, y0 + h)], fill=(120, 108, 92, 255), outline=wall, width=3 if kind == "city" else 2)
    rr = random.Random(int(c[0] * 7 + c[1]))
    cols = [(150, 82, 66, 255), (122, 90, 74, 255), (160, 120, 80, 255), (100, 100, 116, 255)]
    nx = int(w // 5); ny = int(h // 5)
    for iy in range(ny):
        for ix in range(nx):
            if rr.random() < 0.72:
                bx = x0 + 1.5 + ix * (w - 3) / nx; by = y0 + 1.5 + iy * (h - 3) / ny
                d.rectangle([P(bx, by), P(bx + 3.2, by + 2.6)], fill=rr.choice(cols), outline=(40, 30, 26, 255))
    if kind == "city":
        for (tx_, ty_) in [(x0, y0), (x0 + w, y0), (x0, y0 + h), (x0 + w, y0 + h)]:
            d.rectangle([P(tx_ - 1.5, ty_ - 1.5), P(tx_ + 1.5, ty_ + 1.5)], fill=(84, 78, 74, 255), outline=(30, 26, 24, 255), width=2)
        d.rectangle([P(c[0] - 3, y0 + h - 1), P(c[0] + 3, y0 + h + 1)], fill=(210, 180, 70, 255))   # the gate
        d.polygon([P(c[0] - 2, y0 - 6), P(c[0] + 2, y0 - 6), P(c[0], y0 - 1)], fill=(180, 40, 40, 255))
    else:
        d.rectangle([P(c[0] - 1.5, y0 + h - 1), P(c[0] + 1.5, y0 + h + 1)], fill=(210, 180, 70, 255))

town(verrin, 54, 32, "", "", "city")
town(aurelm, 54, 32, "", "", "city")
town(stone, 34, 20, "", "", "village")
town(mill, 34, 20, "", "", "village")
town(rotm, 34, 20, "", "", "village")

# capital gate and barricade ---------------------------------------------
d.rectangle([P(capgate[0] - 10, capgate[1] - 6), P(capgate[0] + 10, capgate[1] + 6)], fill=(80, 78, 86, 255), outline=(20, 20, 24, 255), width=3)
d.rectangle([P(capgate[0] - 3, capgate[1] - 1), P(capgate[0] + 3, capgate[1] + 6)], fill=(40, 30, 24, 255))
d.rectangle([P(barr[0] - 8, 0), P(barr[0] + 8, 5)], fill=(110, 80, 50, 255), outline=(30, 20, 14, 255), width=2)

# section grid (6 map tiles of 120 x 120) --------------------------------
for gx in (120, 240):
    d.line([P(gx, 0), P(gx, H)], fill=(255, 255, 255, 70), width=1)
d.line([P(0, 120), P(W, 120)], fill=(255, 255, 255, 70), width=1)

# purifier patrols (red dashed) and unbound ground (violet rings) ---------------
def dashed(pts, col, w=3, on=14, off=9):
    for i in range(len(pts) - 1):
        (x0, y0), (x1, y1) = P(*pts[i]), P(*pts[i + 1])
        L = math.hypot(x1 - x0, y1 - y0); n = int(L // (on + off))
        for k in range(n + 1):
            a = k * (on + off) / L; b = min(1, a + on / L)
            d.line([x0 + (x1 - x0) * a, y0 + (y1 - y0) * a, x0 + (x1 - x0) * b, y0 + (y1 - y0) * b], fill=col, width=w)
RED = (200, 50, 46, 255)
dashed([(xroad[0] + 8, xroad[1] + 8), (110, 56), (150, 68), (verrin[0] - 30, verrin[1] - 2)], RED)
dashed([(verrin[0] + 30, verrin[1] - 4), (240, 64), (290, 42), (capgate[0] - 8, capgate[1] + 8)], RED)
dashed([(verrin[0] - 4, verrin[1] + 20), (176, 112), (mill[0] + 8, mill[1] - 12)], RED)
dashed([(mill[0] + 4, mill[1] + 14), (170, 180), (aurelm[0] - 4, aurelm[1] - 20)], RED)
dashed([(mill[0] + 22, mill[1] - 2), (260, 154), (rotm[0] - 22, rotm[1] - 6)], RED)
for (ux, uy, ur) in [(86, 170, 18), (226, 124, 20), (268, 206, 20), (150, 214, 16), (300, 100, 18), (120, 82, 14)]:
    d.ellipse([P(ux - ur, uy - ur * 0.8), P(ux + ur, uy + ur * 0.8)], outline=(170, 110, 220, 255), width=3)
    d.ellipse([P(ux - ur * 0.55, uy - ur * 0.45), P(ux + ur * 0.55, uy + ur * 0.45)], outline=(170, 110, 220, 160), width=2)

# pillars -----------------------------------------------------------------
def pillar(x, y):
    d.polygon([P(x, y - 2.2), P(x + 1.5, y), P(x, y + 2.2), P(x - 1.5, y)], fill=(90, 220, 220, 255), outline=(10, 60, 66, 255))
for p in [(40, 12), (70, 108), (188, 90), (146, 160), (196, 186), (308, 162), (324, 40)]:
    pillar(*p)

# markers: vault, clue, companion, mountain caves ---------------------------
def mark(x, y, txt, col):
    r = 3.0
    d.ellipse([P(x - r, y - r), P(x + r, y + r)], fill=col, outline=(0, 0, 0, 255), width=2)
    f = font(17, True)
    tw = d.textlength(txt, font=f)
    d.text((x * S - tw / 2, y * S - 10), txt, font=f, fill=(0, 0, 0, 255))
def font(sz, bold=False):
    return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif%s.ttf" % ("-Bold" if bold else ""), sz)
mark(aurelm[0] + 26, aurelm[1] + 22, "V", (236, 200, 70, 255))
mark(rotm[0] + 20, rotm[1] + 16, "H", (240, 140, 90, 255))
mark(verrin[0] - 22, verrin[1] + 20, "C", (120, 220, 150, 255))
for cx, cy in [(24, 96), (18, 150), (36, 176)]:
    d.polygon([P(cx - 3, cy + 2), P(cx, cy - 3), P(cx + 3, cy + 2)], fill=(30, 26, 28, 255))

# sealed mountain pass (opens on an event)
d.rectangle([P(40, 134), P(47, 142)], fill=(70, 66, 72, 255), outline=(10, 10, 12, 255), width=3)
d.line([P(41, 135), P(46, 141)], fill=(200, 60, 50, 255), width=3); d.line([P(46, 135), P(41, 141)], fill=(200, 60, 50, 255), width=3)
road([(60, 150), (47, 140)], 1, (150, 130, 96, 255))
# labels ------------------------------------------------------------------
def label(x, y, txt, sz=22, col=(250, 244, 226, 255), bold=True, anchor="mm"):
    f = font(sz, bold)
    d.text((x * S, y * S), txt, font=f, fill=(0, 0, 0, 255), anchor=anchor, stroke_width=4, stroke_fill=(0, 0, 0, 255))
    d.text((x * S, y * S), txt, font=f, fill=col, anchor=anchor)
label(verrin[0], verrin[1] - 26, "VERRIN", 28); label(verrin[0], verrin[1] - 20, "Covenant city (mid-map)", 15, bold=False)
label(aurelm[0], aurelm[1] - 26, "AURELM", 28); label(aurelm[0], aurelm[1] - 20, "Covenant city, the vault (far south)", 15, bold=False)
label(stone[0], stone[1] - 16, "Stonebridge", 20); label(mill[0], mill[1] - 16, "Millhaven", 20); label(rotm[0], rotm[1] - 16, "Rotmoor", 20)
label(capgate[0] - 2, capgate[1] + 15, "CAPITAL GATE", 18); label(capgate[0] - 2, capgate[1] + 21, "sealed in Act 3", 14, bold=False)
label(barr[0] + 22, 4, "South Road barricade (opens)", 16, anchor="lm")
label(22, 130, "THE", 20); label(22, 136, "WESTERN", 20); label(22, 142, "CRAGS", 20)
label(300, 218, "THE CURSED REACH", 24, (220, 170, 240, 255))
label(240, 196, "(first cursed monsters)", 14, (220, 190, 235, 255), bold=False)
label(228, 161, "Mere", 15, (200, 225, 240, 255), bold=False)
label(44, 147, "SEALED PASS", 15); label(44, 152, "opens on an event", 13, bold=False)
label(78, 168, "old track", 13, (230, 210, 170, 255), bold=False)
# band names
label(70, 22, "Pale road: Covenant order", 14, bold=False)
label(270, 130, "the land turns wrong", 14, (230, 220, 170, 255), bold=False)

# scale ruler and north ---------------------------------------------------
d.line([P(8, 232), P(48, 232)], fill=(255, 255, 255, 255), width=3)
label(28, 227, "40 tiles", 14, bold=False)
label(350, 233, "N", 20); d.line([P(354, 229), P(354, 217)], fill=(255, 255, 255, 255), width=3)

# right-hand legend panel ---------------------------------------------------
PW = 440
out = Image.new("RGB", (MW + PW, MH), (22, 20, 26))
out.paste(im.convert("RGB"), (0, 0))
o = ImageDraw.Draw(out)
def txt(x, y, s, sz=17, col=(232, 226, 214), bold=False):
    o.text((MW + x, y), s, font=font(sz, bold), fill=col)
y = 24
txt(22, y, "SOUTHERN ETHARIS", 26, (240, 214, 150), True); y += 36
txt(22, y, "Act 3 concept map, working names", 15, (170, 164, 156)); y += 34
rows = [
    ("360 x 240 tiles", "(plains 190 x 110, Fort 150 x 96)"),
    ("6 map sections, 120 x 120 each", "joined by walk-through seams"),
    ("2 Covenant cities", "interiors bigger than the Fort"),
    ("3 villages", "same size as Ashford / Greywick"),
]
for a, b in rows:
    txt(22, y, a, 17, (240, 236, 226), True); y += 22
    txt(22, y, b, 14, (170, 164, 156)); y += 26
y += 10
txt(22, y, "KEY", 18, (240, 214, 150), True); y += 30
def key(draw_fn, text, sub=None):
    global y
    draw_fn(MW + 22, y)
    txt(76, y - 2, text, 15)
    if sub: txt(76, y + 16, sub, 13, (170, 164, 156))
    y += 44 if sub else 32
key(lambda x, yy: o.line([x, yy + 8, x + 40, yy + 8], fill=ROAD, width=6), "Road")
key(lambda x, yy: [o.line([x + i * 16, yy + 8, x + i * 16 + 10, yy + 8], fill=RED, width=3) for i in range(3)], "Purifier patrol route", "ruthless, lethal magic, fight to kill")
key(lambda x, yy: o.ellipse([x + 4, yy, x + 36, yy + 20], outline=(170, 110, 220), width=3), "Unbound ground", "careful, precise, would rather survive")
key(lambda x, yy: o.polygon([(x + 20, yy - 2), (x + 30, yy + 10), (x + 20, yy + 22), (x + 10, yy + 10)], fill=(90, 220, 220)), "Pillar", "party swap points (7)")
key(lambda x, yy: o.ellipse([x + 8, yy - 2, x + 32, yy + 22], fill=(236, 200, 70), outline=(0, 0, 0), width=2), "V  The vault", "where the tome was stolen")
key(lambda x, yy: o.ellipse([x + 8, yy - 2, x + 32, yy + 22], fill=(240, 140, 90), outline=(0, 0, 0), width=2), "H  Hakon's next clue", "found in Rotmoor")
key(lambda x, yy: o.ellipse([x + 8, yy - 2, x + 32, yy + 22], fill=(120, 220, 150), outline=(0, 0, 0), width=2), "C  New companion", "Corin or Elowyn, met in Verrin")
key(lambda x, yy: [o.rectangle([x + 8, yy, x + 32, yy + 20], fill=(70, 66, 72), outline=(0, 0, 0), width=2), o.line([x + 10, yy + 2, x + 30, yy + 18], fill=(200, 60, 50), width=3)], "Sealed pass", "mountain entrance, opens on an event")
y += 6
txt(22, y, "CURSE BANDS", 18, (240, 214, 150), True); y += 30
for col, t, s in [((88, 104, 66), "Clean", "north and west, Covenant order"), ((96, 90, 62), "Wrong", "dead trees, odd light, first cursed foes"), ((62, 46, 66), "Corrupted", "the far south-east corner")]:
    o.rectangle([MW + 22, y, MW + 60, y + 20], fill=col, outline=(200, 200, 200))
    txt(76, y - 2, t, 15); txt(76, y + 16, s, 13, (170, 164, 156)); y += 44
y += 4
txt(22, y, "Town sizes on this map are the outside", 13, (150, 144, 136)); y += 18
txt(22, y, "facades; each opens to its own interior map.", 13, (150, 144, 136))

out.save("concept/south_etharis_map.png")
print(out.size)
