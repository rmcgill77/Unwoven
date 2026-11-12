"""Arbitrator Isaura Thorne (approved design A, head-shape fixed) plus the player customisation previews."""
from PIL import Image, ImageDraw, ImageFont
import numpy as np
import ctx
from rebase import hx, mix, eye_pal
from cast2 import Painter, place_face, hair_front, hair_back_detail, INK
from cast3 import base_body, belly_mask, body_pal, over
def H(*c): return tuple(hx(x) for x in c)

def chain(P, col=("#d8d8e0", "#8a8a98"), medal=("#c8c8d4", "#3a4a6a")):
    lch = P.layer()
    for (x, y) in [(14, 47), (16, 50), (19, 53), (22, 55), (26, 55), (29, 53), (32, 50), (34, 47)]: P.px(x, y, hx(col[0])); P.px(x + 1, y, hx(col[1]))
    P.fill([(21, 55), (27, 55), (28, 59), (24, 62), (20, 59)], hx(medal[0]), lch); P.px(24, 58, hx(medal[1])); P.px(23, 57, hx(medal[1])); P.px(25, 57, hx(medal[1]))

def thorne_a():   # Covenant Grey: steel hair in a severe low knot, pale grey eyes, slate high-collared coat, silver chain of office, a white streak
    P = Painter()
    pal = {**eye_pal("#2a3038", "#4a5664", "#7a8898", "#a8b8c8", "#d8e4f0", "#1a1e24"), "skin": hx("#f0d0bc"), "skinD": hx("#c09486"),
           **body_pal("#4a5262", "#2a303c", "#2a2630", "#1a161e", "#c8c8d4", "#7a7a88", "#16141a")}
    HR = H("#8a8c96", "#6a6c78", "#3e4048", "#b8bac4")
    hb = P.layer(); P.hair.add(hb)
    P.fill([(19, 41), (15, 38), (13, 33), (12, 30), (12, 15), (16, 9), (24, 6), (32, 8), (37, 13), (39, 20), (39, 30), (38, 35), (36, 38)], HR[1], hb)
    P.fill([(36, 24), (43, 23), (46, 29), (43, 35), (37, 34)], HR[1], hb)   # low knot at the nape
    hair_back_detail(P, hb, HR, strands=[[(36, 25), (42, 27)], [(16, 11), (13, 20)]])
    lb, body = base_body(P, pal); bel = belly_mask(P)
    lc = over(P, [(11, 40), (18, 40), (16, 48), (12, 46)], hx("#5a6474"), body); over(P, [(30, 40), (37, 40), (36, 46), (32, 48)], hx("#5a6474"), body, lc)   # high collar
    lcoat = over(P, [(22, 48), (26, 48), (27, 74), (21, 74)], hx("#1e2430"), body)   # coat opening
    for y in (56, 62, 68): P.px(24, y, hx("#c8c8d4"))
    chain(P)
    P.off = ctx.HOFF
    place_face(P, pal)
    P.line([(21, 39), (27, 39)], mix(pal["skinD"], hx("#000000"), 0.35))   # straight, unreadable mouth
    hair_front(P, HR, [[(12, 22), (14, 13), (20, 9), (28, 9), (35, 12), (39, 19), (39, 23), (33, 15), (24, 13), (18, 15), (14, 22)],
                       [(12, 22), (14, 23), (15, 30), (13, 32)], [(39, 22), (37, 23), (36, 30), (38, 32)]],
               strands=[[(16, 18), (24, 11)], [(26, 11), (36, 16)]], shine=[[(18, 11), (24, 9)]])
    lw = P.layer()
    P.line([(29, 10), (33, 14), (36, 19)], hx("#f0f0f4"), lw); P.line([(30, 10), (34, 14)], hx("#d8d8e0"), lw)   # the white streak
    return P.finish()

def thorne_b():   # Ink and Iron: black hair cropped close, dark eyes, black coat with a crimson Covenant sash, quill behind the ear
    P = Painter()
    pal = {**eye_pal("#1a1010", "#3a2420", "#5a3a2e", "#8a5a40", "#b88a5a", "#100808"), "skin": hx("#d8a888"), "skinD": hx("#a87660"),
           **body_pal("#2a262c", "#141216", "#3a3036", "#221c20", "#a8283a", "#6a1424", "#100e10")}
    HR = H("#3a3438", "#24202a", "#100c12", "#5a5260")
    hb = P.layer(); P.hair.add(hb)
    P.fill([(12, 24), (12, 15), (16, 9), (24, 6), (32, 8), (37, 13), (39, 20), (39, 24)], HR[1], hb)
    hair_back_detail(P, hb, HR, strands=[[(16, 10), (14, 20)], [(34, 10), (37, 20)]])
    lb, body = base_body(P, pal); bel = belly_mask(P)
    ls = over(P, [(12, 44), (16, 42), (36, 64), (32, 68)], hx("#a8283a"), body)   # sash, shoulder to hip
    P.line([(14, 43), (34, 66)], hx("#d84a5a"), ls)
    P.fill([(22, 52), (27, 52), (27, 57), (22, 57)], hx("#c8a850"), ls); P.px(24, 54, hx("#6a1424"))   # covenant seal on the sash
    lq = P.layer(); P.line([(39, 14), (44, 4)], hx("#e8e4dc"), lq); P.line([(40, 13), (45, 5)], hx("#b8b4ac"), lq)   # quill
    P.off = ctx.HOFF
    place_face(P, pal)
    P.line([(21, 39), (26, 38), (28, 39)], mix(pal["skinD"], hx("#000000"), 0.35))
    P.line([(16, 26), (21, 27)], hx("#100c12")); P.line([(29, 27), (34, 26)], hx("#100c12"))   # level, heavy brows
    hair_front(P, HR, [[(12, 22), (14, 13), (20, 9), (28, 9), (35, 12), (39, 19), (39, 23), (35, 17), (28, 15), (22, 16), (16, 18), (13, 22)]],
               strands=[[(15, 18), (22, 12)], [(26, 11), (35, 15)]], shine=[[(18, 11), (25, 9)]])
    return P.finish()

def thorne_c():   # Pale Mantle: ash-blonde braid crowned round the head, amber eyes, deep blue mantle trimmed silver, scar on one cheek
    P = Painter()
    pal = {**eye_pal("#3a2410", "#7a4a1a", "#b8782a", "#e0a84a", "#f8d888", "#24160a"), "skin": hx("#f4d8c4"), "skinD": hx("#c8a090"),
           **body_pal("#2a3a6a", "#16203e", "#3a4a7a", "#24305a", "#c8ccd8", "#7a7e8a", "#14182a")}
    HR = H("#d8ccaa", "#b8a882", "#7a6c50", "#f0e8cc")
    hb = P.layer(); P.hair.add(hb)
    P.fill([(10, 26), (10, 16), (15, 9), (23, 6), (31, 7), (37, 11), (40, 18), (40, 26)], HR[1], hb)
    hair_back_detail(P, hb, HR, strands=[[(14, 12), (12, 22)], [(36, 12), (39, 22)]])
    lb, body = base_body(P, pal); bel = belly_mask(P)
    lm = over(P, [(10, 41), (38, 41), (40, 50), (8, 50)], hx("#2a3a6a"), body); P.line([(9, 49), (39, 49)], hx("#c8ccd8"), lm); P.line([(10, 41), (38, 41)], hx("#3e5288"), lm)   # mantle
    lpin = P.layer(); P.fill([(22, 42), (26, 42), (27, 46), (24, 48), (21, 46)], hx("#c8ccd8"), lpin); P.px(24, 44, hx("#2a3a6a"))
    P.off = ctx.HOFF
    place_face(P, pal)
    P.line([(22, 39), (27, 39)], mix(pal["skinD"], hx("#000000"), 0.3))
    P.line([(31, 33), (33, 36)], mix(pal["skin"], hx("#a04040"), 0.55))   # old scar
    hair_front(P, HR, [[(12, 18), (16, 11), (24, 8), (32, 9), (38, 14), (39, 19), (33, 15), (24, 13), (17, 15), (13, 19)]],
               strands=[[(18, 12), (30, 11)]], shine=[[(19, 10), (26, 9)]])
    lbr = P.layer()   # braid laid across the crown
    for i in range(7):
        x = 13 + i * 4; y = 10 - (3 if 1 < i < 5 else 1)
        P.fill([(x, y), (x + 4, y - 1), (x + 5, y + 2), (x + 1, y + 3)], HR[0] if i % 2 else HR[1], lbr); P.line([(x + 1, y), (x + 4, y + 2)], HR[2], lbr)
    return P.finish()

# ---------------- player customisation: hairstyles on the player palette ----------------
PPAL = {**eye_pal("#2a1a10", "#5a3a20", "#8a5a30", "#b8884a", "#e0b878", "#1a100a"), "skin": hx("#ffcfae"), "skinD": hx("#d98a78"),
        **body_pal("#3e4a5e", "#22293a", "#2c354d", "#14182e", "#c8a050", "#7d5833", "#1a1418")}
PHR = H("#8a5a3a", "#6a4028", "#3e2418", "#b07a50")

def ph(style, pal=None, HR=None, mark=None):
    P = Painter(); pal = pal or PPAL; HR = HR or PHR
    hb = P.layer(); P.hair.add(hb)
    if style == "crop":
        P.fill([(12, 24), (12, 15), (16, 9), (24, 6), (32, 8), (37, 13), (39, 20), (39, 24)], HR[1], hb)
    elif style == "long":
        P.fill([(8, 44), (8, 16), (14, 8), (23, 5), (32, 6), (40, 10), (43, 18), (43, 44), (38, 48), (36, 36), (14, 36), (12, 48)], HR[1], hb)
    elif style == "tail":
        P.fill([(11, 26), (11, 16), (15, 10), (23, 7), (31, 8), (37, 12), (40, 18), (40, 26)], HR[1], hb)
        P.fill([(36, 18), (42, 14), (46, 20), (46, 36), (43, 44), (40, 36), (41, 24)], HR[1], hb)
    elif style == "braid":
        P.fill([(10, 30), (10, 16), (15, 9), (23, 6), (31, 7), (37, 11), (40, 18), (40, 30)], HR[1], hb)
        for i in range(7):
            y = 32 + i * 5; x = 36 + (i // 4)
            P.fill([(x - 2, y), (x + 3, y), (x + 4, y + 4), (x - 1, y + 5)], HR[1], hb); P.line([(x - 1, y + 1), (x + 3, y + 3)], HR[2], hb)
    elif style == "bun":
        P.fill([(11, 26), (11, 16), (15, 10), (23, 7), (31, 8), (37, 12), (40, 18), (40, 26)], HR[1], hb)
        P.fill([(19, 0), (29, 0), (32, 5), (30, 10), (18, 10), (16, 5)], HR[1], hb)
    elif style == "mop":
        P.fill([(9, 30), (8, 18), (12, 11), (18, 6), (24, 8), (30, 4), (36, 8), (41, 14), (42, 24), (40, 30)], HR[1], hb)
    elif style == "shorn":
        P.fill([(14, 20), (16, 12), (24, 9), (32, 10), (36, 14), (37, 20)], HR[2], hb)
    hair_back_detail(P, hb, HR, strands=[[(16, 10), (13, 22)], [(34, 10), (38, 22)]])
    lb, body = base_body(P, pal); bel = belly_mask(P)
    P.off = ctx.HOFF
    place_face(P, pal)
    P.line([(22, 39), (26, 39)], mix(pal["skinD"], hx("#000000"), 0.3))
    if mark == "freckles":
        for x, y in ((17, 33), (19, 34), (21, 33), (29, 33), (31, 34), (33, 33)): P.px(x, y, mix(pal["skin"], hx("#b8703a"), 0.55))
    elif mark == "scar":
        P.line([(30, 31), (33, 36)], mix(pal["skin"], hx("#a04040"), 0.6))
    elif mark == "mole":
        P.px(31, 37, hx("#5a3020"))
    elif mark == "paint":
        P.line([(15, 33), (19, 33)], hx("#2e6a8a")); P.line([(30, 33), (34, 33)], hx("#2e6a8a"))
    fronts = {
        "spiky": [[(10, 26), (12, 14), (16, 8), (20, 11), (23, 4), (27, 10), (31, 5), (34, 11), (39, 9), (39, 18), (41, 26), (36, 20), (32, 24), (29, 15), (24, 22), (20, 15), (15, 24)]],
        "crop": [[(12, 22), (14, 13), (20, 9), (28, 9), (35, 12), (39, 19), (39, 23), (35, 17), (28, 15), (22, 16), (16, 18), (13, 22)]],
        "long": [[(12, 22), (14, 14), (20, 10), (28, 10), (35, 13), (39, 20), (39, 24), (34, 17), (27, 14), (21, 15), (16, 19), (13, 24)], [(9, 22), (14, 23), (14, 40), (11, 44), (9, 36)], [(42, 22), (37, 23), (37, 40), (40, 44), (42, 36)]],
        "tail": [[(12, 22), (14, 14), (20, 10), (28, 10), (35, 13), (39, 20), (39, 24), (36, 19), (30, 16), (24, 15), (18, 17), (14, 22)]],
        "braid": [[(12, 23), (14, 14), (20, 10), (28, 10), (35, 13), (39, 20), (39, 24), (34, 17), (27, 14), (21, 15), (16, 19), (13, 24)], [(10, 22), (14, 23), (14, 36), (12, 40), (10, 33)]],
        "bun": [[(12, 22), (14, 14), (20, 10), (28, 10), (35, 13), (39, 20), (39, 24), (36, 19), (30, 16), (24, 15), (18, 17), (14, 22)]],
        "mop": [[(11, 24), (13, 14), (19, 9), (27, 8), (34, 10), (39, 16), (41, 25), (37, 20), (34, 24), (30, 16), (25, 22), (20, 15), (16, 23), (13, 19)]],
        "shorn": [[(14, 19), (16, 13), (24, 10), (32, 11), (36, 15), (36, 19), (30, 16), (22, 16), (16, 18)]],
    }
    hair_front(P, HR, fronts[style], strands=[[(24, 11), (17, 17)], [(28, 11), (35, 17)]], shine=[[(17, 12), (23, 10)]])
    return P.finish()

if __name__ == "__main__":
    ctx.MODE = "front"; ctx.SRC = None; ctx.HOFF = (0, 0); ctx.BOFF = (0, 0); ctx.OVR = {}
    S = 5
    BG, INKC, PARCH, MUT = "#1c1730", "#e9d9b4", "#e9d9b4", "#9a90b4"
    f1 = ImageFont.load_default(size=30); f2 = ImageFont.load_default(size=20); f3 = ImageFont.load_default(size=16)
    th = [("A · Covenant Grey", "Steel hair in a severe knot, a white streak,\\nslate high-collared coat, silver chain of office.", thorne_a),
          ("B · Ink and Iron", "Close-cropped black hair, heavy brows,\\nblack coat, crimson sash with the Covenant seal, quill.", thorne_b),
          ("C · Pale Mantle", "Ash-blonde braid worn as a crown, amber eyes,\\ndeep blue mantle trimmed in silver, an old scar.", thorne_c)]
    ims = [(n, d, Image.fromarray(f())) for n, d, f in th]
    pw, phh = ims[0][2].width * S, ims[0][2].height * S
    styles = ["spiky", "crop", "long", "tail", "braid", "bun", "mop", "shorn"]
    names = {"spiky": "Spiky (now)", "crop": "Short crop", "long": "Long", "tail": "Ponytail", "braid": "Side braid", "bun": "Top knot", "mop": "Messy mop", "shorn": "Shorn"}
    hs = [(names[s], Image.fromarray(ph(s))) for s in styles]
    S2 = 4; hw = hs[0][1].width * S2; hh = hs[0][1].height * S2
    eyes = [("Brown", eye_pal("#2a1a10", "#5a3a20", "#8a5a30", "#b8884a", "#e0b878", "#1a100a")), ("Green", eye_pal("#123a26", "#2f7a46", "#5aa85a", "#a8d86a", "#d6f264", "#0e2a1c")),
            ("Blue", eye_pal("#122a4a", "#2a5a9a", "#4a8ad0", "#8ac0f0", "#d0ecff", "#0a1a30")), ("Grey", eye_pal("#2a3038", "#4a5664", "#7a8898", "#a8b8c8", "#d8e4f0", "#1a1e24")),
            ("Amber", eye_pal("#3a2410", "#7a4a1a", "#b8782a", "#e0a84a", "#f8d888", "#24160a")), ("Violet", eye_pal("#2a1a3a", "#5a3a7a", "#8a5ab0", "#b88ad8", "#e8c8f8", "#1a1026"))]
    marks = [("None", None), ("Freckles", "freckles"), ("Scar", "scar"), ("Beauty mark", "mole"), ("Woad stripes", "paint")]
    cloaks = [("Slate", "#3e4a5e", "#22293a"), ("Moss", "#4a5a34", "#2a3420"), ("Rust", "#7a3a24", "#4a2014"), ("Plum", "#5a3058", "#341a34"), ("Ash", "#6a6a6e", "#3e3e44"), ("Ochre", "#8a6a2a", "#5a4416")]
    W_ = 1700; Hs = 2300
    sheet = Image.new("RGBA", (W_, Hs), BG); d = ImageDraw.Draw(sheet)
    d.text((40, 30), "Concepts for approval", fill=PARCH, font=f1)
    d.text((40, 72), "Built on the same craftpix base as the cast. Pick one Arbitrator, and tick the customisation options you want.", fill=MUT, font=f3)
    y0 = 120; d.text((40, y0), "1 · Arbitrator Isaura Thorne (pick one)", fill=PARCH, font=f2)
    for k, (n, desc, im) in enumerate(ims):
        x = 40 + k * 550
        big = im.resize((pw, phh), Image.NEAREST); sheet.paste(big, (x + 100, y0 + 40), big)
        d.text((x + 10, y0 + 50 + phh), n, fill=PARCH, font=f2)
        d.multiline_text((x + 10, y0 + 80 + phh), desc.replace("\\n", "\n"), fill=MUT, font=f3, spacing=4)
    y1 = y0 + 60 + phh + 110
    d.text((40, y1), "2 · Hairstyles (any hair colour)", fill=PARCH, font=f2)
    for k, (n, im) in enumerate(hs):
        x = 40 + k * 205
        big = im.resize((hw, hh), Image.NEAREST); sheet.paste(big, (x, y1 + 36), big)
        d.text((x + 10, y1 + 44 + hh), n, fill=PARCH, font=f3)
    y2 = y1 + hh + 90
    d.text((40, y2), "3 · Eye colour", fill=PARCH, font=f2)
    for k, (n, ep) in enumerate(eyes):
        im = Image.fromarray(ph("crop", {**PPAL, **ep})); face = im.crop((8, 12, 44, 46)).resize((36 * 5, 34 * 5), Image.NEAREST)
        x = 40 + k * 200; sheet.paste(face, (x, y2 + 36), face); d.text((x + 10, y2 + 44 + 170), n, fill=PARCH, font=f3)
    y3 = y2 + 250
    d.text((40, y3), "4 · Face marks", fill=PARCH, font=f2)
    for k, (n, m) in enumerate(marks):
        im = Image.fromarray(ph("crop", None, None, m)); face = im.crop((8, 12, 44, 46)).resize((36 * 5, 34 * 5), Image.NEAREST)
        x = 40 + k * 200; sheet.paste(face, (x, y3 + 36), face); d.text((x + 10, y3 + 44 + 170), n, fill=PARCH, font=f3)
    y4 = y3 + 250
    d.text((40, y4), "5 · Cloak colour (separate from the tunic colour you already pick)", fill=PARCH, font=f2)
    for k, (n, a, b) in enumerate(cloaks):
        im = Image.fromarray(ph("spiky", {**PPAL, "outL": hx(a), "out": hx(b)}))
        big = im.resize((im.width * 3, im.height * 3), Image.NEAREST); x = 40 + k * 200
        sheet.paste(big, (x, y4 + 36), big); d.text((x + 10, y4 + 44 + big.height), n, fill=PARCH, font=f3)
    y5 = y4 + 36 + Image.fromarray(ph("spiky")).height * 3 + 50
    d.text((40, y5), "6 · Also proposed: pronouns (he / she / they) so townsfolk address you correctly, and more hair, skin and tunic colours.", fill=PARCH, font=f3)
    sheet = sheet.crop((0, 0, W_, y5 + 50))
    sheet.save("concepts_thorne_custom.png"); print(sheet.size)
