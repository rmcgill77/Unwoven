"""Concept plan for Millhaven (Act 3), the mill-and-market village at the crossroads. Planning art only.
56 x 68 tiles like Ashford and Greywick. Writes concept/millhaven_concept.png."""
import random
from PIL import Image, ImageDraw, ImageFont
W, H, S, PW = 56, 68, 13, 500
rnd = random.Random(12)
F = lambda sz, b=False: ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif%s.ttf" % ("-Bold" if b else ""), sz)
im = Image.new("RGB", (W * S + PW, H * S + 20), (22, 20, 26)); d = ImageDraw.Draw(im, "RGBA")
P = lambda x, y: (x * S, y * S)
def rect(x0, y0, x1, y1, fill, outline=None, w=1): d.rectangle([P(x0, y0), P(x1 + 1, y1 + 1)], fill=fill, outline=outline, width=w)
for y in range(H):
    for x in range(W):
        n = rnd.randint(-6, 6); d.rectangle([P(x, y), P(x + 1, y + 1)], fill=(84 + n, 98 + n, 62 + n))
for y in range(H):
    for x in range(W):
        if min(x, y, W - 1 - x, H - 1 - y) < 2: d.ellipse([P(x, y), P(x + 1, y + 1)], fill=(36, 54, 38))
WALL = (124, 112, 96)
rect(2, 2, W - 3, 3, WALL); rect(2, H - 4, W - 3, H - 3, WALL); rect(2, 2, 3, H - 3, WALL); rect(W - 4, 2, W - 3, H - 3, WALL)
rect(26, 2, 29, 3, (200, 150, 60)); rect(26, H - 4, 29, H - 3, (140, 90, 50))
# the mill-race: in under the north-east wall, through the millpond, out under the south-east
WATER = (60, 92, 120)
for y in range(4, 46): rect(46, y, 48, y, WATER)
d.ellipse([P(40, 44), P(53, 54)], fill=WATER)
for y in range(54, H - 4): rect(47, y, 49, y, WATER)
ROAD = (156, 132, 98)
rect(27, 4, 28, 63, ROAD); rect(5, 33, 44, 34, ROAD); rect(5, 49, 38, 50, ROAD); rect(29, 14, 44, 15, ROAD)
d.ellipse([P(15, 21), P(40, 38)], fill=ROAD)
rect(44, 14, 50, 15, (120, 90, 56))  # footbridge
def bld(x0, y0, x1, y1, col): rect(x0, y0, x1, y1, col, outline=(30, 22, 20), w=2)
H1, STONE, MILL = (140, 104, 78), (130, 126, 120), (150, 120, 84)
bld(38, 30, 45, 39, MILL)                                    # 1 the great mill
d.ellipse([P(44.5, 32.5), P(49.5, 37.5)], outline=(90, 70, 50), width=4)
bld(31, 41, 38, 46, MILL)                                    # 2 granary
bld(5, 7, 14, 13, H1)                                        # 3 the inn
bld(31, 6, 42, 12, STONE)                                    # 4 traders' hall
for (x, y) in [(33, 17), (38, 17)]: rect(x, y, x + 3, y + 1, (190, 170, 130), outline=(80, 60, 40))   # wagons in the caravan yard
bld(16, 7, 23, 12, STONE)                                    # 5 Covenant tithe-house
bld(6, 23, 12, 28, H1)                                       # 6 bakery
rect(23, 25, 24, 26, (160, 120, 70))                         # 7 rumour board
bld(6, 38, 13, 44, (120, 96, 72))                            # 8 the tinker's
for (x0, y0) in [(16, 40), (6, 52), (14, 52), (22, 52), (31, 55)]: bld(x0, y0, x0 + 6, y0 + 5, H1)
for k in range(5):
    for j in range(3): d.ellipse([P(8 + k * 5, 59 + j * 2), P(9.5 + k * 5, 60.5 + j * 2)], fill=(50, 90, 50))   # 9 orchard
for k in range(6): rect(17 + k * 4, 28, 19 + k * 4, 29, [(170, 60, 50), (60, 110, 60), (200, 170, 70)][k % 3])   # 10 market stalls
def label(x, y, t, sz=18, col=(255, 230, 120)): d.text(P(x, y), t, font=F(sz, True), fill=col, anchor="mm", stroke_width=3, stroke_fill=(0, 0, 0))
for (x, y, t) in [(41.5, 34.5, "1"), (34.5, 43.5, "2"), (9.5, 10, "3"), (36.5, 9, "4"), (19.5, 9.5, "5"), (9, 25.5, "6"), (23.5, 23.5, "7"), (9.5, 41, "8"), (18, 61, "9"), (27.5, 31, "10"), (46.5, 49, "11")]:
    label(x, y, t)
label(27.5, 1, "NORTH GATE (from the bridge)", 12, (250, 244, 226)); label(27.5, H - 1, "SOUTH GATE (to Aurelm road, shut)", 12, (250, 244, 226))
d.ellipse([P(8.5, 45), P(11.5, 48)], fill=(170, 110, 220), outline=(0, 0, 0), width=2); d.text(P(9.15, 45.15), "U", font=F(14, True), fill=(0, 0, 0))
o = ImageDraw.Draw(im); X0 = W * S + 20; yy = [22]
def T(s, sz=15, col=(232, 226, 214), b=False): o.text((X0, yy[0]), s, font=F(sz, b), fill=col); yy[0] += sz + 7
T("MILLHAVEN", 26, (240, 214, 150), True); T("Act 3 concept, inside the walls (56 x 68)", 13, (170, 164, 156)); yy[0] += 6
T("A busy mill-and-market village where the roads", 14); T("meet. Traders, rumours, flour dust, and the first", 14); T("signs of the curse on the wind from the east.", 14); yy[0] += 6
for n, a, b in [("1", "The great mill", "wheel on the mill-race; grinds for half the south."), ("2", "The granary", "tithe grain for Verrin, under guard."),
                ("3", "The Wheel and Sheaf", "the inn; every traveller's gossip ends up here."), ("4", "Traders' hall and caravan yard", "wagons from Verrin, Stonebridge, Aurelm."),
                ("5", "The tithe-house", "a Covenant clerk counts what goes north."), ("6", "The bakery", "fresh bread, and the miller's wife's opinions."),
                ("7", "The rumour board", "notices, warnings, and what people say about Rotmoor."), ("8", "The tinker's shed", "mends anything; quietly Unbound."),
                ("9", "Homes and the orchard", "south of the lane; the apples are spotting."), ("10", "Market square", "stalls round the green; the busiest place south of Verrin."),
                ("11", "The millpond", "the race pools here before it turns the wheel.")]:
    o.text((X0, yy[0]), n, font=F(15, True), fill=(255, 230, 120)); o.text((X0 + 30, yy[0]), a, font=F(14, True), fill=(240, 236, 226)); yy[0] += 19
    o.text((X0 + 30, yy[0]), b, font=F(12), fill=(170, 164, 156)); yy[0] += 22
yy[0] += 6
o.ellipse([X0, yy[0], X0 + 18, yy[0] + 18], fill=(170, 110, 220), outline=(0, 0, 0)); o.text((X0 + 28, yy[0]), "U  the Unbound contact (the tinker's daughter)", font=F(13), fill=(220, 214, 204)); yy[0] += 22
o.text((X0 + 28, yy[0]), "a farm girl who can weave, and was never told she couldn't:", font=F(12), fill=(170, 164, 156)); yy[0] += 18
o.text((X0 + 28, yy[0]), "the first crack in 'magic is blood'; she leads to the parley.", font=F(12), fill=(170, 164, 156))
im.save("concept/millhaven_concept.png"); print(im.size)
