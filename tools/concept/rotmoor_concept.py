"""Concept plan for Rotmoor (Act 3), the village on the edge of the curse. Planning art only; nothing in the game reads it.
56 x 68 tiles like Ashford and Greywick. Writes concept/rotmoor_concept.png."""
import math, random
from PIL import Image, ImageDraw, ImageFont

W, H, S = 56, 68, 13
PW = 470
rnd = random.Random(7)
F = lambda sz, b=False: ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif%s.ttf" % ("-Bold" if b else ""), sz)
im = Image.new("RGB", (W * S + PW, H * S), (22, 20, 26))
d = ImageDraw.Draw(im, "RGBA")
P = lambda x, y: (x * S, y * S)

def curse(x, y):   # the curse leans in from the east and south-east
    return max(0, min(1, (x - 26) / 30 + (y - 30) / 70))

for y in range(H):
    for x in range(W):
        c = curse(x, y) + (rnd.random() - 0.5) * 0.15
        g = (74, 84, 58); dust = (104, 88, 66); rot = (66, 44, 58)
        t1 = max(0, min(1, c * 1.8)); t2 = max(0, min(1, c * 1.8 - 0.9))
        col = [g[i] + (dust[i] - g[i]) * t1 for i in range(3)]
        col = [col[i] + (rot[i] - col[i]) * t2 for i in range(3)]
        n = rnd.randint(-5, 5)
        d.rectangle([P(x, y), P(x + 1, y + 1)], fill=tuple(int(v + n) for v in col))

def rect(x0, y0, x1, y1, fill, outline=None, w=1):
    d.rectangle([P(x0, y0), P(x1 + 1, y1 + 1)], fill=fill, outline=outline, width=w)

# woods outside, wall
for y in range(H):
    for x in range(W):
        if min(x, y, W - 1 - x, H - 1 - y) < 2:
            dark = curse(x, y) > 0.45
            d.ellipse([P(x, y), P(x + 1, y + 1)], fill=(44, 30, 46) if dark else (34, 52, 36))
rect(2, 2, W - 3, 3, (82, 76, 74)); rect(2, H - 4, W - 3, H - 3, (82, 76, 74))
rect(2, 2, 3, H - 3, (82, 76, 74)); rect(W - 4, 2, W - 3, H - 3, (82, 76, 74))
# the east wall has fallen where the curse broke through
rect(W - 4, 38, W - 3, 50, (70, 40, 60))
for k in range(26):
    x = rnd.uniform(44, 55); y = rnd.uniform(34, 56)
    d.line([P(x, y), P(x - rnd.uniform(3, 7), y + rnd.uniform(-3, 3))], fill=(120, 30, 40, 200), width=3)
# north gate, barred from inside with carts
rect(26, 2, 29, 3, (200, 150, 60))
for x in (24, 27, 30):
    rect(x, 5, x + 2, 6, (110, 76, 46), outline=(40, 26, 18))

# streets
ROAD = (150, 124, 92)
rect(27, 4, 28, 63, ROAD)          # high street
rect(4, 28, 51, 29, ROAD)          # cross street
rect(4, 46, 40, 47, ROAD)          # lower lane
d.ellipse([P(22, 23), P(34, 34)], fill=ROAD)    # the square

# the quarantine line: stakes and rope, splitting the sick east from the well west
for y in range(8, 64, 2):
    d.line([P(37, y), P(37, y + 1.2)], fill=(220, 200, 120), width=3)
    d.ellipse([P(36.8, y - 0.2), P(37.2, y + 0.2)], fill=(90, 60, 30))
rect(36, 28, 38, 29, (220, 200, 120, 120))       # the one checkpoint where the cross street crosses it

def bld(x0, y0, x1, y1, col, mark=None, burned=False):
    rect(x0, y0, x1, y1, (56, 40, 34) if burned else col, outline=(30, 22, 20), w=2)
    if burned:
        for k in range(6):
            d.line([P(x0 + rnd.uniform(0, x1 - x0), y0), P(x0 + rnd.uniform(0, x1 - x0), y1 + 1)], fill=(24, 18, 16), width=2)
    if mark == "X":   # sealed: a red X painted on the door
        cx, cy = (x0 + x1 + 1) / 2, y1 + 0.4
        d.line([P(cx - 0.6, cy - 0.6), P(cx + 0.6, cy + 0.6)], fill=(230, 40, 40), width=3)
        d.line([P(cx + 0.6, cy - 0.6), P(cx - 0.6, cy + 0.6)], fill=(230, 40, 40), width=3)

HOUSE = (126, 96, 78); OPEN = (150, 118, 82); CHAPEL = (120, 118, 128)
# west, the well quarter: the people who are still well, and the few places still open
bld(6, 8, 12, 13, OPEN)               # 1 reeve's house
bld(15, 8, 21, 13, HOUSE)
bld(6, 17, 12, 22, OPEN)              # 2 herbalist
bld(15, 17, 21, 21, HOUSE)
bld(6, 33, 13, 39, OPEN)              # 3 the Hollow Lantern (inn, half shut)
bld(16, 33, 21, 38, HOUSE)
bld(30, 8, 35, 13, HOUSE, burned=True)
bld(6, 50, 11, 55, HOUSE)
# the graveyard, south-west: full, and fresh mounds past the old rows
for gy in range(51, 62, 2):
    for gx in range(15, 33, 2):
        fresh = gy > 56 or gx > 27
        d.rectangle([P(gx, gy), P(gx + 1, gy + 0.7)], fill=(96, 74, 54) if fresh else (110, 108, 112), outline=(40, 36, 34))
# east, the sick quarter
bld(41, 8, 48, 14, CHAPEL)            # 4 the chapel, now the sick-house
for k in range(4):                    # cots under awnings outside it
    rect(40 + k * 2, 16, 41 + k * 2, 17, (196, 184, 160), outline=(60, 50, 40))
bld(41, 20, 46, 25, HOUSE, "X")
bld(48, 20, 52, 25, HOUSE, "X")
bld(41, 32, 46, 37, HOUSE, "X")
bld(48, 31, 52, 35, HOUSE, burned=True)
bld(30, 38, 35, 43, HOUSE, "X")
bld(41, 50, 46, 55, HOUSE, burned=True)
# the burning ground by the broken wall
d.ellipse([P(44, 40), P(51, 46)], fill=(40, 30, 28), outline=(220, 110, 40), width=3)
d.ellipse([P(46, 42), P(49, 44)], fill=(230, 120, 40))
# the fouled well in the square, roped off
d.ellipse([P(26.6, 26.4), P(28.4, 28.2)], fill=(60, 80, 70), outline=(30, 30, 30), width=2)
d.ellipse([P(25.3, 25.2), P(29.7, 29.4)], outline=(220, 200, 120), width=2)
# a cart of the dead by the square; the soup line under the inn's eaves
rect(23, 31, 24, 32, (80, 60, 40), outline=(20, 14, 10))
for k in range(5):
    d.ellipse([P(14 + k * 1.3, 40.5), P(14.8 + k * 1.3, 41.3)], fill=(200, 180, 150))
# Hakon's clue
d.ellipse([P(8.2, 13.6), P(10.2, 15.6)], fill=(240, 140, 90), outline=(0, 0, 0), width=2)
d.text(P(8.55, 13.75), "H", font=F(15, True), fill=(0, 0, 0))
# a sick mist over the east half
mist = Image.new("RGBA", (W * S, H * S), (0, 0, 0, 0)); md = ImageDraw.Draw(mist)
for k in range(60):
    x = rnd.uniform(36, 56); y = rnd.uniform(4, 64); r = rnd.uniform(2, 5)
    md.ellipse([P(x - r, y - r * 0.6), P(x + r, y + r * 0.6)], fill=(150, 170, 120, 26))
im.paste(Image.alpha_composite(im.crop((0, 0, W * S, H * S)).convert("RGBA"), mist).convert("RGB"), (0, 0))
d = ImageDraw.Draw(im, "RGBA")

def label(x, y, t, sz=14, col=(250, 244, 226)):
    d.text(P(x, y), t, font=F(sz, True), fill=col, anchor="mm", stroke_width=3, stroke_fill=(0, 0, 0))
for (x, y, t) in [(9.5, 10.5, "1"), (9.5, 19.5, "2"), (10, 36, "3"), (44.5, 11, "4"), (28, 25, "5"), (47.5, 43, "6"), (24, 57, "7"), (37, 7, "8"), (54, 44, "9")]:
    label(x, y, t, 18, (255, 230, 120))
label(27.5, 1, "NORTH GATE (barred from inside)", 12)
label(18, 66, "WELL QUARTER", 13, (190, 230, 190))
label(46, 66, "SICK QUARTER", 13, (230, 180, 200))

# legend
o = ImageDraw.Draw(im)
X0 = W * S + 20; y = 22
def T(s, sz=15, col=(232, 226, 214), b=False):
    global y
    o.text((X0, y), s, font=F(sz, b), fill=col); y += sz + 7
T("ROTMOOR", 26, (240, 214, 150), True); y += 4
T("Act 3 concept, inside the walls (56 x 68)", 13, (170, 164, 156)); y += 10
T("A village dying of a sickness that came", 14); T("with the curse. The east half is quarantined.", 14); y += 10
for n, a, b in [
    ("1", "Reeve's house", "the reeve keeps the dead-list. Hakon's clue (H)."),
    ("2", "Herbalist", "the one shop open; few herbs, high prices."),
    ("3", "The Hollow Lantern", "inn, half shut; soup line under its eaves."),
    ("4", "Chapel, now the sick-house", "cots inside and out; a healer in a mask."),
    ("5", "The square", "fouled well roped off; a cart of the dead."),
    ("6", "Burning ground", "where the dead are burned, by the breach."),
    ("7", "Graveyard", "full; fresh mounds past the old rows."),
    ("8", "Quarantine line", "stakes and rope; one guarded crossing."),
    ("9", "The breach", "the east wall fallen; curse roots creep in."),
]:
    o.text((X0, y), n, font=F(16, True), fill=(255, 230, 120)); o.text((X0 + 24, y), a, font=F(15, True), fill=(240, 236, 226)); y += 21
    o.text((X0 + 24, y), b, font=F(12), fill=(170, 164, 156)); y += 24
y += 8
T("MARKS", 16, (240, 214, 150), True)
for col, t in [((230, 40, 40), "red X: house sealed with the sick inside"), ((56, 40, 34), "burned shell"), ((220, 200, 120), "rope and stakes"), ((150, 170, 120), "sick mist over the east half")]:
    o.rectangle([X0, y + 2, X0 + 18, y + 16], fill=col, outline=(200, 200, 200)); o.text((X0 + 28, y), t, font=F(13), fill=(220, 214, 204)); y += 24
im.save("/home/claude/durinn/concept/rotmoor_concept.png")
print(im.size)
