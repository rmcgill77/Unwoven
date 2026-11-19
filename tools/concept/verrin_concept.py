"""Concept plan for Verrin (Act 3), the Covenant's city in the south. Planning art only; nothing in the game reads it.
170 x 120 tiles in two halves joined at the inner wall (Lower Town 170 x 62 south, High Town 170 x 58 north), so each
half bakes inside a phone's canvas limit; together larger than Fort Frostcrown (150 x 96). Writes concept/verrin_concept.png."""
import random
from PIL import Image, ImageDraw, ImageFont

W, H, S, PW = 170, 120, 6, 500
rnd = random.Random(21)
F = lambda sz, b=False: ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif%s.ttf" % ("-Bold" if b else ""), sz)
im = Image.new("RGB", (W * S + PW, H * S + 40), (22, 20, 26)); d = ImageDraw.Draw(im, "RGBA")
P = lambda x, y: (x * S, y * S)
def rect(x0, y0, x1, y1, fill, outline=None, w=1): d.rectangle([P(x0, y0), P(x1 + 1, y1 + 1)], fill=fill, outline=outline, width=w)
for y in range(H):
    for x in range(W):
        n = rnd.randint(-5, 5); hi = y < 58
        base = (84, 98, 66) if hi else (88, 92, 66)
        d.rectangle([P(x, y), P(x + 1, y + 1)], fill=tuple(v + n for v in base))
WALL, PAVE, PAVE2 = (176, 170, 158), (150, 144, 132), (170, 164, 150)
# outer walls, towers, the south gate; the inner wall and the Lantern Gate
rect(0, 0, W - 1, 3, WALL); rect(0, H - 4, W - 1, H - 1, WALL); rect(0, 0, 3, H - 1, WALL); rect(W - 4, 0, W - 1, H - 1, WALL)
for (x, y) in [(0, 0), (W - 7, 0), (0, H - 7), (W - 7, H - 7), (80, 0), (0, 58), (W - 7, 58)]: rect(x, y, x + 6, y + 6, (150, 144, 134), outline=(60, 56, 52), w=2)
rect(82, H - 4, 87, H - 1, (200, 160, 60))
rect(0, 57, W - 1, 60, WALL); rect(82, 57, 87, 60, (230, 200, 90))
# Lower Town streets: the Gate Road north, market, the canal lanes
rect(83, 61, 86, H - 5, PAVE)
d.ellipse([P(64, 78), P(106, 102)], fill=PAVE2)
rect(4, 88, W - 5, 90, PAVE); rect(4, 70, W - 5, 71, PAVE); rect(40, 61, 41, H - 5, PAVE); rect(128, 61, 129, H - 5, PAVE)
# High Town: the Processional, the Pillar Court, the avenues
rect(83, 4, 86, 56, PAVE2)
d.ellipse([P(66, 22), P(104, 42)], fill=PAVE2)
rect(4, 30, W - 5, 32, PAVE2); rect(36, 4, 37, 56, PAVE2); rect(132, 4, 133, 56, PAVE2)
def bld(x0, y0, x1, y1, col, ol=(30, 24, 22)): rect(x0, y0, x1, y1, col, outline=ol, w=2)
COT, STONE, WHITE, PURP = (140, 106, 80), (126, 122, 118), (206, 200, 186), (106, 84, 140)
# High Town
bld(70, 5, 99, 18, WHITE, (60, 50, 90))              # 1 the Grand Chapel of the Archon
d.polygon([P(84.5, 1), P(80, 6), P(89, 6)], fill=(230, 200, 90))
bld(42, 8, 64, 22, WHITE)                            # 2 the Registry of the Weave
bld(105, 8, 128, 22, PURP)                           # 3 the Arbiter's Hall
bld(42, 36, 64, 52, STONE)                           # 4 the Initiates' College
for k in range(3): rect(46 + k * 6, 44, 49 + k * 6, 50, (110, 140, 90))
bld(108, 36, 126, 52, STONE)                         # 5 the Archive / library
for (x0, y0) in [(8, 8), (8, 22), (8, 38), (140, 8), (140, 22), (140, 38), (154, 8), (154, 38), (20, 46)]: bld(x0, y0, x0 + 10, y0 + 9, WHITE)
d.ellipse([P(82, 29), P(87, 34)], fill=(110, 230, 220), outline=(10, 60, 66), width=2)    # 6 Pillar Court
for (x, y) in [(70, 26), (99, 26), (70, 38), (99, 38)]: d.ellipse([P(x - 1.5, y - 1.5), P(x + 1.5, y + 1.5)], fill=(60, 110, 60))
# Lower Town
bld(88, 108, 100, 114, STONE)                        # 7 gate-house (writ check)
bld(68, 104, 80, 113, COT)                           # 8 the Gilded Lamp
for k in range(6): rect(70 + k * 5, 84, 72 + k * 5, 86, [(170, 60, 50), (60, 110, 60), (200, 170, 70)][k % 3])   # 9 market stalls
bld(108, 74, 124, 86, COT)                           # 10 the shops row
bld(108, 92, 124, 102, COT)
bld(12, 92, 36, 112, STONE)                          # 11 barracks
rect(14, 74, 34, 86, (130, 116, 86), outline=(80, 70, 50), w=2)   # training yard
for (x0, y0) in [(136, 64), (150, 64), (136, 76), (150, 76), (136, 94), (150, 94), (136, 106), (150, 106), (46, 64), (58, 64), (46, 76), (46, 94), (58, 94), (46, 106), (58, 106), (108, 106)]:
    bld(x0, y0, x0 + 9, y0 + 8, (118, 92, 72) if x0 > 130 else COT)
d.ellipse([P(83, 92), P(86, 95)], fill=(90, 140, 170), outline=(50, 50, 60), width=2)    # fountain
# the companion
d.ellipse([P(52, 22.5), P(56, 26.5)], fill=(120, 220, 150), outline=(0, 0, 0), width=2); d.text(P(52.9, 22.8), "C", font=F(15, True), fill=(0, 0, 0))
def label(x, y, t, sz=17, col=(255, 230, 120)): d.text(P(x, y), t, font=F(sz, True), fill=col, anchor="mm", stroke_width=3, stroke_fill=(0, 0, 0))
for (x, y, t) in [(84.5, 12, "1"), (53, 15, "2"), (116.5, 15, "3"), (53, 40, "4"), (117, 44, "5"), (84.5, 26, "6"), (94, 111, "7"), (74, 108.5, "8"), (85, 82, "9"), (116, 80, "10"),
                  (24, 102, "11"), (155, 70, "12"), (84.5, 94, "13")]:
    label(x, y, t)
label(85, 116, "SOUTH GATE (writ checked)", 12, (250, 244, 226)); label(85, 62, "THE LANTERN GATE", 12, (250, 244, 226))
label(10, 55, "HIGH TOWN", 15, (220, 210, 255)); label(10, 64, "LOWER TOWN", 15, (240, 220, 190))
o = ImageDraw.Draw(im); X0 = W * S + 20; yy = [20]
def T(s, sz=15, col=(232, 226, 214), b=False): o.text((X0, yy[0]), s, font=F(sz, b), fill=col); yy[0] += sz + 7
T("VERRIN", 26, (240, 214, 150), True); T("Act 3 concept: 170 x 120, in two halves", 13, (170, 164, 156)); yy[0] += 4
T("The Covenant at its most orderly and its most", 14); T("convincing: white stone, banners, patrols, order.", 14); yy[0] += 8
T("HIGH TOWN (north, past the Lantern Gate)", 14, (220, 210, 255), True)
for n, a, b in [("1", "Grand Chapel of the Archon", "the seat of the faith in the south."), ("2", "Registry of the Weave", "where the gifted are registered and marked."),
                ("3", "Arbiter's Hall", "the city's leader; sends you on to Aurelm."), ("4", "Initiates' College", "where the Covenant trains its weavers."),
                ("5", "The Archive", "ledgers and old books, closely kept."), ("6", "Pillar Court", "the city's Pillar; party swaps start here.")]:
    o.text((X0, yy[0]), n, font=F(15, True), fill=(255, 230, 120)); o.text((X0 + 28, yy[0]), a, font=F(14, True), fill=(240, 236, 226)); yy[0] += 19
    o.text((X0 + 28, yy[0]), b, font=F(12), fill=(170, 164, 156)); yy[0] += 21
yy[0] += 4; T("LOWER TOWN (south, from the gate)", 14, (240, 220, 190), True)
for n, a, b in [("7", "Gate-house", "the writ is checked; the captain of the gate."), ("8", "The Gilded Lamp", "an inn too fine for travellers like you."),
                ("9", "Market square", "stalls, criers, a Covenant herald."), ("10", "The shops row", "armourer, apothecary, trader, bookseller."),
                ("11", "Barracks and training yard", "Covenant soldiers drilling."), ("12", "The east tenements", "poorer streets; quiet talk of the Unbound."),
                ("13", "The fountain", "the Archon's fountain at the crossing.")]:
    o.text((X0, yy[0]), n, font=F(15, True), fill=(255, 230, 120)); o.text((X0 + 28, yy[0]), a, font=F(14, True), fill=(240, 236, 226)); yy[0] += 19
    o.text((X0 + 28, yy[0]), b, font=F(12), fill=(170, 164, 156)); yy[0] += 21
yy[0] += 4
o.ellipse([X0, yy[0], X0 + 18, yy[0] + 18], fill=(120, 220, 150), outline=(0, 0, 0)); o.text((X0 + 28, yy[0]), "C  where the unchosen hero is met", font=F(13), fill=(220, 214, 204)); yy[0] += 22
o.text((X0 + 28, yy[0]), "at the Registry, turned away from its archive", font=F(12), fill=(170, 164, 156))
im.save("/home/claude/durinn/concept/verrin_concept.png"); print(im.size)
