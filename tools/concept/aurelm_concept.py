"""Concept plan for Aurelm (Act 3), the Covenant's vault city at the south of Etharis, on the Mere. Planning art only.
170 x 120 tiles like Verrin, in two halves joined at the inner wall (the Outer City 170 x 64 north, the Vault Ward
170 x 56 south), so each half bakes inside a phone's canvas limit. Writes concept/aurelm_concept.png."""
import random
from PIL import Image, ImageDraw, ImageFont

W, H, S, PW, CUT = 170, 120, 6, 520, 63
rnd = random.Random(31)
F = lambda sz, b=False: ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif%s.ttf" % ("-Bold" if b else ""), sz)
im = Image.new("RGB", (W * S + PW, H * S + 40), (22, 20, 26)); d = ImageDraw.Draw(im, "RGBA")
P = lambda x, y: (x * S, y * S)
def rect(x0, y0, x1, y1, fill, outline=None, w=1): d.rectangle([P(x0, y0), P(x1 + 1, y1 + 1)], fill=fill, outline=outline, width=w)
def bld(x0, y0, x1, y1, col): rect(x0, y0, x1, y1, col, outline=(26, 20, 20), w=2)
def label(x, y, t, sz=15, col=(255, 230, 120)): d.text(P(x, y), t, font=F(sz, True), fill=col, anchor="mm", stroke_width=3, stroke_fill=(0, 0, 0))

# ground: grey paving inside, scrub outside; the east edge greying where the curse presses on the wall
for y in range(H):
    for x in range(W):
        n = rnd.randint(-6, 6)
        c = (96 + n, 96 + n, 98 + n) if 3 <= x <= W - 4 and 3 <= y <= H - 4 else (70 + n, 84 + n, 56 + n)
        if x > W - 22: k = (x - (W - 22)) / 22; c = tuple(int(a * (1 - k * 0.5) + b * k * 0.5) for a, b in zip(c, (70, 52, 78)))
        d.rectangle([P(x, y), P(x + 1, y + 1)], fill=c)
# the Mere fills the west, a harbour cut into the city behind a water-gate
MERE = (50, 78, 104)
d.ellipse([P(-60, 6), P(20, 114)], fill=MERE)
rect(18, 31, 34, 45, MERE)
for k in range(3): rect(25 + k * 3, 33, 25 + k * 3, 40, (120, 92, 60))                    # jetties in the harbour
WALL, INNER = (128, 120, 112), (150, 138, 120)
rect(22, 2, W - 3, 3, WALL); rect(2, H - 4, W - 3, H - 3, WALL); rect(W - 4, 2, W - 3, H - 3, WALL)
rect(22, 2, 23, 29, WALL); rect(22, 47, 23, H - 3, WALL); rect(22, 29, 35, 30, WALL); rect(22, 46, 35, 47, WALL)
rect(21, 33, 22, 43, (90, 70, 50))                                                          # the water-gate
rect(22, CUT, W - 3, CUT + 1, INNER)
rect(83, 1, 86, 3, (200, 150, 60))                                                          # north gate
rect(83, CUT, 86, CUT + 1, (150, 60, 60))                                                   # the Warden's Gate (barred)
rect(W - 4, 30, W - 3, 33, (140, 90, 50))                                                   # east postern, shut
# the burn line outside the east wall: Purifier fires against the curse
for y in range(6, H - 6, 5): d.ellipse([P(W - 2, y), P(W, y + 2)], fill=(220, 110, 40))
ROAD = (160, 150, 132)
rect(84, 4, 85, CUT - 1, ROAD); rect(24, 22, W - 5, 23, ROAD); rect(24, 50, W - 5, 51, ROAD); rect(35, 24, 37, 49, ROAD)
d.ellipse([P(70, 26), P(100, 44)], fill=ROAD)                                               # the Exchange square
rect(84, CUT + 2, 85, 100, ROAD); rect(30, 82, W - 8, 83, ROAD)
# Outer City
GREY, DARK, STONE, PALE, H1 = (118, 112, 120), (70, 58, 66), (134, 128, 120), (170, 160, 140), (140, 108, 82)
bld(28, 6, 52, 18, STONE)                                    # 1 barracks and watch
bld(122, 6, 152, 18, DARK); rect(140, 19, 152, 21, (120, 60, 40))   # 2 Purifier chapterhouse and burn-yard
rect(78, 8, 91, 14, (110, 104, 100), outline=(30, 24, 24), w=2)      # 3 gate square inspection post
bld(102, 26, 120, 40, PALE)                                  # 4 the Archive House
bld(40, 25, 52, 32, H1)                                      # 5 the Drowned Bell (harbour inn)
rect(24, 48, 30, 52, (60, 60, 64), outline=(0, 0, 0))        # 6 the sluice (the thief's road)
bld(56, 26, 66, 36, (150, 140, 170))                         # 7 chapel of the Weave
for k in range(8): rect(73 + (k % 4) * 6, 30 + (k // 4) * 8, 76 + (k % 4) * 6, 31 + (k // 4) * 8, [(170, 60, 50), (60, 110, 60), (200, 170, 70)][k % 3])   # 8 stalls
for (x0, y0) in [(42, 52), (54, 52), (66, 52), (96, 52), (108, 52), (120, 52), (40, 38), (124, 26), (136, 26), (148, 26), (130, 38), (144, 40)]:
    bld(x0, y0, x0 + 8, y0 + 6, H1)                          # 9 houses; the east ones by the wall shuttered
for (x0, y0) in [(146, 50), (154, 44), (156, 54)]: bld(x0, y0, x0 + 6, y0 + 5, (96, 84, 80))    # 10 the Ashen Row, poor quarter by the east wall
bld(58, 6, 72, 16, (120, 116, 108))                          # 11 the Traders' Exchange (shops)
# Vault Ward
bld(66, 70, 103, 80, (160, 150, 130))                        # 12 the Warden's Hall
d.polygon([P(40, 116), P(60, 92), P(110, 90), P(132, 116)], fill=(80, 74, 70), outline=(20, 16, 16))   # the rock the Vault is cut into
rect(80, 100, 89, 106, (30, 26, 30), outline=(200, 60, 60), w=3)   # 13 the Vault doors, broken and chained
bld(30, 68, 50, 80, (126, 120, 130))                         # 14 seal-keepers' cloister
bld(118, 68, 150, 78, (150, 130, 110))                       # 15 officers' houses and the Garden of Names
for k in range(6): d.ellipse([P(122 + k * 4, 80), P(124 + k * 4, 82)], fill=(50, 90, 50))
rect(26, 52, 27, 98, (40, 64, 90)); rect(26, 97, 70, 98, (40, 64, 90))                     # 16 the old culvert under the inner wall
for (x, y, t) in [(40, 12, "1"), (137, 12, "2"), (84.5, 11, "3"), (111, 33, "4"), (46, 28.5, "5"), (27, 50, "6"), (61, 31, "7"), (85, 35, "8"),
                  (46, 55, "9"), (154, 52, "10"), (65, 11, "11"), (84.5, 75, "12"), (84.5, 103, "13"), (40, 74, "14"), (134, 73, "15"), (30, 90, "16")]:
    label(x, y, t)
label(85, 0.5, "NORTH GATE (from the Mere road)", 11, (250, 244, 226)); label(8, 70, "THE MERE", 14, (200, 220, 240))
label(110, CUT + 3, "THE WARDEN'S GATE (inner wall, barred)", 10, (250, 200, 200)); label(W - 12, 2, "burn line", 10, (255, 170, 90))
d.ellipse([P(118, 40), P(121, 43)], fill=(120, 200, 255), outline=(0, 0, 0), width=2); d.text(P(118.6, 40.1), "C", font=F(13, True), fill=(0, 0, 0))
d.ellipse([P(78, 18), P(81, 21)], fill=(255, 120, 60), outline=(0, 0, 0), width=2); d.text(P(78.7, 18.1), "!", font=F(13, True), fill=(0, 0, 0))
d.text(P(2, H + 1), "OUTER CITY above the inner wall (170 x 64)  ·  VAULT WARD below (170 x 56)", font=F(14), fill=(200, 196, 186))

o = ImageDraw.Draw(im); X0 = W * S + 20; yy = [18]
def T(s, sz=14, col=(232, 226, 214), b=False): o.text((X0, yy[0]), s, font=F(sz, b), fill=col); yy[0] += sz + 6
T("AURELM", 26, (240, 214, 150), True); T("Act 3 concept, the Vault city (170 x 120)", 13, (170, 164, 156)); yy[0] += 4
for s in ["The Covenant's oldest southern city, on the Mere.", "The Vault has been robbed. The gates are locked", "down, the Purifiers say the Covenant failed, and", "the curse is at the east wall."]: T(s)
yy[0] += 4
for n, a, b in [("1", "Barracks and watch", "Covenant soldiers; the lockdown runs from here."),
                ("2", "Purifier chapterhouse", "black roofs, a burn-yard; they want the city."),
                ("3", "Gate square", "every traveller searched; skirmish site (!)."),
                ("4", "The Archive House", "copies of all Verrin locks away (C)."),
                ("5", "The Drowned Bell", "harbour inn; fishers, rumours, cheap rooms."),
                ("6", "The sluice", "the cut grate: how the thief got in."),
                ("7", "Chapel of the Weave", "healing; a priest who doubts the lockdown."),
                ("8", "The Exchange square", "the market, half shut by the lockdown."),
                ("9", "Houses", "the city's folk, under curfew."),
                ("10", "The Ashen Row", "poor quarter by the east wall; greying."),
                ("11", "Traders' Exchange", "shops: arms, armour, supplies."),
                ("12", "The Warden's Hall", "Vaultwarden; the letter of passage."),
                ("13", "The Vault", "cut into the rock; doors broken, chained."),
                ("14", "Seal-keepers' cloister", "the wardens who keep the seal whole."),
                ("15", "Officers' houses", "and the Garden of Names."),
                ("16", "The old culvert", "the thief's road under the inner wall.")]:
    o.text((X0, yy[0]), n, font=F(14, True), fill=(255, 230, 120)); o.text((X0 + 28, yy[0]), a, font=F(13, True), fill=(240, 236, 226)); yy[0] += 17
    o.text((X0 + 28, yy[0]), b, font=F(12), fill=(196, 190, 180)); yy[0] += 19
im.save("/home/claude/durinn/concept/aurelm_concept.png"); print(im.size)
