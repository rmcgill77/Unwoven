"""Concept plan for Stonebridge (Act 3), the farming village at the foot of the Western Crags. Planning art only.
56 x 68 tiles like Ashford and Greywick. Writes concept/stonebridge_concept.png."""
import random
from PIL import Image, ImageDraw, ImageFont
W, H, S, PW = 56, 68, 13, 470
rnd = random.Random(9)
F = lambda sz, b=False: ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif%s.ttf" % ("-Bold" if b else ""), sz)
im = Image.new("RGB", (W * S + PW, H * S), (22, 20, 26)); d = ImageDraw.Draw(im, "RGBA")
P = lambda x, y: (x * S, y * S)
def rect(x0, y0, x1, y1, fill, outline=None, w=1): d.rectangle([P(x0, y0), P(x1 + 1, y1 + 1)], fill=fill, outline=outline, width=w)
for y in range(H):
    for x in range(W):
        n = rnd.randint(-6, 6); d.rectangle([P(x, y), P(x + 1, y + 1)], fill=(80 + n, 96 + n, 60 + n))
# the Crags rise behind the west wall
for y in range(H):
    for x in range(W):
        if min(x, y, W - 1 - x, H - 1 - y) < 2: d.ellipse([P(x, y), P(x + 1, y + 1)], fill=(36, 54, 38))
for y in range(H):
    for x in range(0, 6 + int(3 * ((y * 7) % 5) / 5)):
        if x < 2 or y < 2 or y > H - 3: continue
        d.rectangle([P(x - 2, y), P(x - 1, y + 1)], fill=(104, 100, 96))
WALL = (120, 112, 100)
rect(2, 2, W - 3, 3, WALL); rect(2, H - 4, W - 3, H - 3, WALL); rect(2, 2, 3, H - 3, WALL); rect(W - 4, 2, W - 3, H - 3, WALL)
rect(26, 2, 29, 3, (200, 150, 60))            # north gate, open
rect(2, 30, 3, 32, (140, 90, 50))             # west gate to the Crags path, shut
# the millstream, west to east, and the old stone bridge
for x in range(4, W - 4):
    y = 36 + int(2 * ((x * 3) % 7) / 7)
    rect(x, y, x, y + 2, (60, 92, 120))
rect(25, 34, 30, 40, (150, 146, 136), outline=(80, 76, 70), w=2)
ROAD = (156, 132, 98)
rect(27, 4, 28, 33, ROAD); rect(27, 41, 28, 63, ROAD); rect(6, 20, 50, 21, ROAD); rect(4, 31, 25, 31, ROAD); rect(30, 50, 50, 51, ROAD)
d.ellipse([P(20, 14), P(36, 26)], fill=ROAD)
def bld(x0, y0, x1, y1, col): rect(x0, y0, x1, y1, col, outline=(30, 22, 20), w=2)
H1, STONE = (140, 104, 78), (130, 126, 120)
bld(31, 7, 40, 12, STONE)     # 1 bailiff's hall
bld(42, 7, 48, 12, H1)
bld(8, 8, 15, 13, H1)         # 2 smithy
bld(8, 23, 15, 28, H1)        # 5 inn
bld(18, 8, 24, 12, H1)        # 6 store
bld(40, 23, 47, 28, STONE)    # 7 chapel
bld(6, 40, 13, 46, H1)        # 3 the mill
d.ellipse([P(11.5, 38.5), P(15.5, 42.5)], outline=(90, 70, 50), width=4)   # its wheel
bld(33, 42, 39, 47, H1); bld(42, 42, 48, 47, H1); bld(16, 44, 22, 48, H1)
for gx in range(8, 25, 2): rect(gx, 54, gx, 61, (110, 96, 60))        # 8 fields
for (x, y) in [(36, 55), (40, 57), (44, 54), (38, 59)]: d.ellipse([P(x, y), P(x + 1, y + 0.8)], fill=(230, 226, 214))   # sheep
rect(33, 53, 48, 61, None, outline=(110, 84, 54), w=2)
rect(49, 13, 52, 17, (100, 96, 92), outline=(40, 36, 34))           # 9 lookout tower
d.ellipse([P(27.3, 18.3), P(29.7, 20.7)], fill=(70, 100, 110), outline=(40, 40, 40), width=2)   # well
def label(x, y, t, sz=18, col=(255, 230, 120)): d.text(P(x, y), t, font=F(sz, True), fill=col, anchor="mm", stroke_width=3, stroke_fill=(0, 0, 0))
for (x, y, t) in [(35.5, 9.5, "1"), (11.5, 10.5, "2"), (9.5, 43, "3"), (27.5, 37, "4"), (11.5, 25.5, "5"), (21, 10, "6"), (43.5, 25.5, "7"), (16, 57, "8"), (50.5, 15, "9"), (28, 17, "10")]:
    label(x, y, t)
label(27.5, 1, "NORTH GATE (the road from the plains)", 12, (250, 244, 226)); label(4, 33.5, "W", 12, (250, 244, 226))
o = ImageDraw.Draw(im); X0 = W * S + 20; yy = [22]
def T(s, sz=15, col=(232, 226, 214), b=False): o.text((X0, yy[0]), s, font=F(sz, b), fill=col); yy[0] += sz + 7
T("STONEBRIDGE", 26, (240, 214, 150), True); T("Act 3 concept, inside the walls (56 x 68)", 13, (170, 164, 156)); yy[0] += 8
T("A quiet farming village at the foot of the", 14); T("Crags. The first town south of the barricade.", 14); yy[0] += 8
for n, a, b in [("1", "Bailiff's hall", "Bailiff Corwen writes the papers for Verrin."), ("2", "The smithy", "tools and blades; mends what the Crags break."),
                ("3", "The mill", "on the millstream, wheel turning; flour for the south."), ("4", "The stone bridge", "Weaver-age stone the village is named for."),
                ("5", "The Shepherd's Rest", "the inn; cheap rooms, mutton stew."), ("6", "General store", "rope, rations, lamp oil."),
                ("7", "Chapel", "small Covenant chapel; a notice board outside."), ("8", "Fields and sheep pens", "the farms run to the south wall."),
                ("9", "The lookout", "an old miner who remembers the pass before it was sealed."), ("10", "The green and the well", "where the village meets.")]:
    o.text((X0, yy[0]), n, font=F(16, True), fill=(255, 230, 120)); o.text((X0 + 30, yy[0]), a, font=F(15, True), fill=(240, 236, 226)); yy[0] += 21
    o.text((X0 + 30, yy[0]), b, font=F(12), fill=(170, 164, 156)); yy[0] += 24
yy[0] += 6; T("W: a west gate toward the Crags path, kept shut.", 13, (200, 194, 184))
im.save("concept/stonebridge_concept.png"); print(im.size)
