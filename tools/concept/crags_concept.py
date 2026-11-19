"""Concept plan for the Western Crags (Act 3): the mountains behind the sealed pass. Planning art only.
180 x 160 tiles, to be built as four joined 90 x 80 sections like southern Etharis, plus the tunnel, the mine and the
shrine as their own maps. Writes concept/crags_concept.png."""
import random, math
from PIL import Image, ImageDraw, ImageFont

W, H, S, PW = 180, 160, 5, 560
rnd = random.Random(44)
F = lambda sz, b=False: ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif%s.ttf" % ("-Bold" if b else ""), sz)
im = Image.new("RGB", (W * S + PW, H * S + 30), (22, 20, 26)); d = ImageDraw.Draw(im, "RGBA")
P = lambda x, y: (x * S, y * S)
def label(x, y, t, sz=15, col=(255, 230, 120)): d.text(P(x, y), t, font=F(sz, True), fill=col, anchor="mm", stroke_width=3, stroke_fill=(0, 0, 0))

# height: peaks to the north-west, falling away to the south and east
def height(x, y):
    h = 1.0 - (x / W) * 0.45 - (y / H) * 0.55
    h += 0.12 * math.sin(x / 9.0) * math.cos(y / 11.0) + 0.06 * math.sin((x + y) / 5.0)
    return h
for y in range(H):
    for x in range(W):
        h = height(x, y); n = rnd.randint(-5, 5)
        if h > 0.78: c = (196 + n, 200 + n, 206 + n)                 # snow and ice
        elif h > 0.58: c = (104 + n, 100 + n, 98 + n)                # bare rock
        elif h > 0.40: c = (88 + n, 90 + n, 80 + n)                  # scree and heather
        else: c = (70 + n, 82 + n, 58 + n)                           # high pasture
        d.rectangle([P(x, y), P(x + 1, y + 1)], fill=c)
# cliffs: dark bands along the contour lines
for y in range(H):
    for x in range(W):
        h = height(x, y)
        if any(abs(h - k) < 0.012 for k in (0.5, 0.65, 0.8)): d.rectangle([P(x, y), P(x + 1, y + 1)], fill=(52, 48, 50))
# pine woods on the middle slopes, east and north-east
for _ in range(900):
    x, y = rnd.uniform(95, 172), rnd.uniform(20, 95)
    if 0.38 < height(x, y) < 0.62: d.ellipse([P(x - 0.9, y - 0.9), P(x + 0.9, y + 0.9)], fill=(36, 58, 40))
# the river: from the high tarn, down the Cleft, out east toward the pass
TARN = (70, 104, 130)
d.ellipse([P(78, 30), P(104, 46)], fill=TARN)
river = [(96, 45), (104, 60), (112, 78), (118, 96), (134, 104), (150, 110), (170, 116), (180, 118)]
d.line([P(*p) for p in river], fill=TARN, width=S * 2)
ROAD = (168, 146, 110)
def road(pts, w=2): d.line([P(*p) for p in pts], fill=ROAD, width=S * w)
road([(176, 112), (162, 112), (148, 116), (128, 118), (108, 122), (90, 126), (74, 128)])                   # the Cleft road, pass to the mine
road([(150, 112), (146, 98), (138, 92), (144, 82), (134, 74), (140, 64), (128, 56), (118, 50), (104, 48)])  # the switchbacks up to the tarn
road([(100, 40), (86, 34), (72, 30), (58, 24), (44, 20), (34, 16)], 1)                                     # the old pilgrim path to the shrine
road([(138, 66), (152, 54), (162, 40), (166, 30)], 1)                                                      # the goat track to the Unbound fire
road([(112, 78), (102, 74)], 1); road([(61, 112), (61, 106)], 2)                                                                            # to the old observatory
# the rope bridge over the chasm on the pilgrim path
d.line([P(62, 21), P(66, 32)], fill=(20, 16, 18), width=S * 3); d.line([P(58, 24), P(70, 28)], fill=(150, 110, 70), width=S)
# places
def blob(x0, y0, x1, y1, col, out=(24, 18, 18)): d.rectangle([P(x0, y0), P(x1, y1)], fill=col, outline=out, width=2)
blob(172, 108, 179, 118, (40, 36, 40))                                       # 1 the pass tunnel
blob(150, 100, 170, 112, (130, 110, 84))                                     # 2 masons' camp
d.ellipse([P(158, 113), P(161, 116)], fill=(120, 200, 255), outline=(0, 0, 0))   # Pillar
blob(38, 112, 92, 150, (110, 94, 76))                                        # 3 Cinder Hollow, the mining camp
for (x, y) in [(44, 118), (54, 118), (64, 118), (44, 136), (54, 140), (74, 140), (82, 120)]: blob(x, y, x + 7, y + 5, (140, 108, 80))
for k in range(5): d.rectangle([P(58 + k * 4, 130), P(60 + k * 4, 133)], outline=(30, 30, 34), width=2)       # cages
d.line([P(38, 112), P(92, 112), P(92, 150), P(38, 150), P(38, 112)], fill=(80, 60, 40), width=S)              # the stockade
blob(56, 100, 66, 106, (20, 16, 20))                                         # 4 Grimscar Mine mouth
blob(98, 68, 108, 76, (150, 140, 160))                                       # 5 the old observatory
d.ellipse([P(162, 26), P(170, 32)], fill=(200, 60, 50), outline=(0, 0, 0))  # 6 the Unbound fire
blob(28, 10, 40, 18, (20, 16, 20))                                           # 7 the Shrine of the First Word
d.ellipse([P(124, 48), P(132, 56)], outline=(255, 150, 60), width=3)        # 8 skirmish on the switchbacks
for (x, y) in [(110, 30), (125, 70), (80, 90), (30, 60), (140, 20)]: d.ellipse([P(x - 2, y - 2), P(x + 2, y + 2)], outline=(230, 230, 230), width=2)   # foes
for (x, y, t) in [(176, 105, "1"), (160, 98, "2"), (65, 125, "3"), (61, 97, "4"), (103, 64, "5"), (166, 22, "6"), (34, 7, "7"), (128, 44, "8"),
                  (91, 38, "9"), (64, 18, "10"), (135, 30, "11"), (24, 140, "12")]:
    label(x, y, t)
label(160, 125, "from the sealed pass (Etharis)", 11, (250, 244, 226))
d.text(P(2, H + 1), "about 180 x 160 tiles: four joined 90 x 80 sections, plus the tunnel, the mine and the shrine as their own maps", font=F(13), fill=(200, 196, 186))

o = ImageDraw.Draw(im); X0 = W * S + 20; yy = [16]
def T(s, sz=14, col=(232, 226, 214), b=False): o.text((X0, yy[0]), s, font=F(sz, b), fill=col); yy[0] += sz + 6
T("THE WESTERN CRAGS", 24, (240, 214, 150), True); T("Act 3 concept, behind the sealed pass", 13, (170, 164, 156)); yy[0] += 4
for s in ["Old mining country the Covenant walled off. The", "Cleft road runs west to the mines where Arthur", "was taken in chains; the switchbacks climb past", "pines and the tarn to the shrine at the top."]: T(s)
yy[0] += 4
for n, a, b in [("1", "The pass tunnel", "through the mountain from the walled mouth."),
                ("2", "Masons' camp", "Covenant masons, a quartermaster, a Pillar."),
                ("3", "Cinder Hollow", "the mining camp: stockade, cages, overseer."),
                ("4", "Grimscar Mine", "three levels down; Hakon's mini boss at the bottom."),
                ("5", "The old observatory", "a College ruin: a piece of the companion's past."),
                ("6", "The Unbound fire", "a hidden camp; the red thread earns a warning."),
                ("7", "Shrine of the First Word", "the Sealstone, its warden, and the thief's trail."),
                ("8", "The switchbacks", "Purifiers ambush a Covenant supply party."),
                ("9", "The high tarn", "cold water, a fisher's hut, the climb's halfway."),
                ("10", "The rope bridge", "over the chasm on the old pilgrim path."),
                ("11", "The Old Pines", "ents in the timber; wolves on the rocks."),
                ("12", "The spoil heaps", "slag and old workings; skeleton miners at night.")]:
    o.text((X0, yy[0]), n, font=F(14, True), fill=(255, 230, 120)); o.text((X0 + 30, yy[0]), a, font=F(13, True), fill=(240, 236, 226)); yy[0] += 17
    o.text((X0 + 30, yy[0]), b, font=F(12), fill=(196, 190, 180)); yy[0] += 20
yy[0] += 6; T("o  = foe ground", 12, (230, 230, 230)); T("blue ring = Pillar", 12, (120, 200, 255))
im.save("/home/claude/durinn/concept/crags_concept.png"); print(im.size)
