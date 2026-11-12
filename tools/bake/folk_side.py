"""Townsfolk: side views (facing right, on the craftpix side frames) and back-view looks."""
import numpy as np
from PIL import Image, ImageDraw
import ctx
from rebase import hx, mix, eye_pal
from cast2 import Painter, place_face, hair_front, hair_back_detail, T, PX, PY, INK
from cast3 import base_body, belly_mask, body_pal, over

def H(*c): return tuple(hx(x) for x in c)
PAL = {
  "wenna": ({**eye_pal("#2a3a1a", "#5a6a2a", "#8a9a3a", "#b8c060", "#d8e080", "#1a240e"), "skin": hx("#f4d2bc"), "skinD": hx("#c8988a"), **body_pal("#5e6a5a", "#38423a", "#8a7a5e", "#5e5240", "#c8b88a", "#8a7a5a", "#2a2018")}, H("#6a4e3c", "#4a3226", "#2a1a12", "#8e6a50")),
  "mayor": ({**eye_pal("#3a2a1a", "#6a4a2a", "#9a6a3a", "#c8985a", "#e0c080", "#24180e"), "skin": hx("#f4c8b0"), "skinD": hx("#c89088"), **body_pal("#8a3438", "#5a1e24", "#2e2228", "#1a1418", "#d4a840", "#8a6a20", "#1a1418")}, H("#b8b4bc", "#9894a0", "#605c68", "#e0dce4")),
  "tomas": ({**eye_pal("#2a1a0e", "#5a3a1e", "#8a5a2e", "#b88040", "#d8a860", "#1a0e08"), "skin": hx("#c08a64"), "skinD": hx("#8e5c40"), **body_pal("#6a6e72", "#44484e", "#7a3434", "#4e2222", "#d6c8a0", "#9a8a62", "#24201c")}, H("#3a2e26", "#2a2018", "#16100c", "#5a4a3a")),
  "edda": ({**eye_pal("#2a3a2a", "#4a6a4a", "#7a9a6a", "#a8c890", "#d0e8b0", "#1a241a"), "skin": hx("#d4a07a"), "skinD": hx("#a06e50"), **body_pal("#7a6a44", "#4a3e26", "#8a8070", "#5e5648", "#5a4a30", "#3a2e1e", "#2e2418")}, H("#d0b060", "#b09040", "#7a5a20", "#e8d090")),
  "maud": ({**eye_pal("#4a5a4a", "#7a8a7a", "#a8b8a8", "#c8d8c8", "#e8f0e8", "#2a342a"), "skin": hx("#e8c8b4"), "skinD": hx("#b89888"), **body_pal("#5a4a62", "#36283e", "#4e4232", "#2e2618", "#7a6a8a", "#4a3a5a", "#1e181e")}, H("#d8d4dc", "#c8c4cc", "#a8a4b0", "#ffffff")),
  "pip": ({**eye_pal("#3a2a10", "#7a5a20", "#b08a3a", "#d8b060", "#f0d890", "#24180a"), "skin": hx("#b07a58"), "skinD": hx("#7e5038"), **body_pal("#7a2a3a", "#4a1424", "#5a6a3a", "#3a4626", "#d4a840", "#8a6a20", "#2a1a14")}, H("#d8a850", "#b0843a", "#6a4a1a", "#f0d080")),
  "joss": ({**eye_pal("#2a1a0e", "#5a3a1e", "#8a5a2e", "#b88040", "#d8a860", "#1a0e08"), "skin": hx("#a87050"), "skinD": hx("#7a4a34"), **body_pal("#5a4632", "#3a2c1e", "#6a5a42", "#46382a", "#2a1e14", "#1a120c", "#241a12")}, H("#3a3036", "#24202a", "#121014", "#5a5060")),
  "lenna": ({**eye_pal("#2a4a6a", "#4a7aa8", "#7aa8d8", "#b0d0f0", "#e0f0ff", "#1a2a3a"), "skin": hx("#f0c8a8"), "skinD": hx("#c89888"), **body_pal("#9a5a6a", "#6a3444", "#7a8a9a", "#4e5a68", "#d8ccaa", "#a89a7c", "#3a2418")}, H("#e8c878", "#c8a050", "#8a6a2a", "#f8e8b0")),
  "garrick": ({**eye_pal("#3a3a2a", "#6a6a4a", "#9a9a6a", "#c8c898", "#e8e8c8", "#24241a"), "skin": hx("#e0b494"), "skinD": hx("#b08068"), **body_pal("#5a5e4a", "#3a3e30", "#6a5a44", "#463a2c", "#b8a070", "#7a6a48", "#24201a")}, H("#b0acb4", "#908c98", "#605c68", "#d8d4dc")),
  "ansel": ({**eye_pal("#2a3a1a", "#4a6a2a", "#7a9a4a", "#a8c870", "#d0e8a0", "#1a240e"), "skin": hx("#f6d6c0"), "skinD": hx("#c8a090"), **body_pal("#5a4a32", "#33281a", "#6a5a42", "#46382a", "#2a1e14", "#1a120c", "#241a12")}, H("#b85a30", "#984422", "#5e2814", "#d87a48")),
  "hester": ({**eye_pal("#4a2a5a", "#7a4a8a", "#a87ab8", "#d0a8e0", "#f0d8f8", "#2a1a34"), "skin": hx("#f8dcc8"), "skinD": hx("#c8a098"), **body_pal("#2a6a6a", "#164242", "#7a5a7a", "#4e3a4e", "#c8b088", "#8a7a5a", "#24181c")}, H("#7a5a8a", "#5a3a70", "#2e1e40", "#a888c0")),
}
def start(key):
    pal, HR = PAL[key]
    return Painter(), dict(pal), HR
def face(P, pal, **kw):
    P.off = ctx.HOFF; place_face(P, pal, **kw)
def braid(P, HR, lab, x0, y0, n, dx=0):
    for i in range(n):
        y = y0 + i * 5; x = x0 + dx * (i // 3)
        P.fill([(x - 2, y), (x + 3, y), (x + 4, y + 4), (x - 1, y + 5)], HR[1], lab); P.line([(x - 1, y + 1), (x + 3, y + 3)], HR[2], lab)
SMILE = lambda pal: mix(pal["skinD"], hx("#000000"), 0.3)

def wenna_s():
    P, pal, HR = start("wenna")
    hb = P.layer(); P.hair.add(hb)
    P.fill([(14, 32), (12, 22), (14, 13), (20, 8), (28, 6), (36, 7), (41, 11), (44, 18), (43, 24), (30, 26), (27, 32), (18, 34)], HR[1], hb)
    P.fill([(15, 5), (19, 0), (26, 0), (30, 4), (28, 10), (16, 10)], HR[1], hb)   # bun on the crown
    hair_back_detail(P, hb, HR, strands=[[(17, 3), (27, 3)], [(16, 7), (28, 7)], [(22, 9), (16, 18), (15, 28)]], lit=[[(15, 5), (19, 0), (22, 1), (17, 5)], [(20, 8), (28, 6), (24, 11)]])
    lb, body = base_body(P, pal); bel = belly_mask(P)
    lsh = over(P, [(18, 40), (42, 40), (44, 50), (30, 56), (18, 50)], hx("#5a6658"), body)
    for x in range(20, 42, 4): P.line([(x, 42), (x + 1, 48)], hx("#3a443c"), lsh)
    P.line([(18, 50), (30, 56), (44, 50)], hx("#2a322c"), lsh)
    over(P, [(34, 60), (44, 60), (44, 72), (34, 72)], hx("#6a6252"), bel)
    face(P, pal)
    hair_front(P, HR, [[(28, 12), (36, 9), (42, 13), (44, 19), (40, 18), (34, 16), (28, 17)], [(25, 18), (29, 19), (29, 30), (26, 31)]],
               strands=[[(36, 10), (32, 15)]], shine=[[(31, 11), (36, 10)]])
    lg = P.layer()
    P.line([(34, 33), (40, 33), (40, 35), (34, 35), (34, 33)], hx("#8a8270"), lg); P.line([(34, 34), (29, 42)], hx("#6a6252"), lg)
    return P.finish()

def mayor_s(female=False):
    P, pal, HR = start("mayor")
    hb = P.layer(); P.hair.add(hb)
    P.fill([(15, 32), (13, 22), (15, 13), (21, 7), (29, 5), (37, 7), (42, 11), (44, 18), (36, 18), (30, 21), (27, 28), (26, 33), (20, 35)], HR[1], hb)
    if female:
        P.fill([(10, 8), (18, 1), (30, 0), (38, 4), (36, 11), (12, 12)], HR[1], hb)
        for cx in (14, 20, 26, 32): P.fill([(cx - 3, 5), (cx, 2), (cx + 3, 5), (cx, 8)], HR[0], hb)
        P.fill([(12, 30), (22, 30), (24, 40), (14, 42)], HR[1], hb)
    hair_back_detail(P, hb, HR, strands=[[(22, 8), (16, 15), (15, 28)], [(31, 6), (24, 14), (22, 28)]], lit=[[(15, 13), (21, 7), (27, 6), (18, 13)]])
    lb, body = base_body(P, pal)
    over(P, [(20, 38), (42, 38), (42, 43), (20, 43)], hx("#d8d0c4"), body)
    lch = P.layer()
    for x, y in ((32, 44), (35, 46), (38, 48), (40, 50)): P.px(x, y, hx("#e8c860"))
    P.fill([(39, 51), (43, 51), (43, 55), (41, 56), (39, 55)], hx("#d4a840"), lch)
    face(P, pal)
    P.px(37, 34, mix(pal["skin"], hx("#e06060"), 0.4)); P.px(38, 34, mix(pal["skin"], hx("#e06060"), 0.4))
    hair_front(P, HR, [[(29, 12), (37, 9), (43, 13), (44, 20), (40, 18), (34, 16), (29, 18)], [(26, 20), (29, 21), (29, 30), (27, 31)]],
               strands=[[(30, 14), (38, 11), (43, 17)]], shine=[[(31, 11), (37, 10)]])
    if not female:
        lm = P.layer(); P.fill([(37, 36), (42, 35), (43, 37), (38, 38)], HR[1], lm); P.line([(38, 36), (41, 36)], HR[0], lm)
    return P.finish()

def tomas_s():
    P, pal, HR = start("tomas")
    hb = P.layer(); P.hair.add(hb)
    P.fill([(10, 24), (28, 24), (27, 34), (20, 38), (12, 36)], HR[1], hb)
    lb, body = base_body(P, pal)
    lt = over(P, [(32, 44), (42, 44), (43, 74), (34, 74)], hx("#7a3434"), body)
    P.fill([(36, 54), (41, 54), (41, 61), (38, 63), (36, 61)], hx("#d6c8a0"), lt)
    lbelt = over(P, [(19, 66), (42, 66), (42, 68), (19, 68)], hx("#2a2018"), body)
    face(P, pal)
    for x in range(34, 41, 2): P.px(x, 39, mix(pal["skin"], HR[1], 0.45))
    lh = P.layer()
    P.fill([(22, 22), (24, 10), (31, 5), (39, 6), (44, 13), (45, 22)], hx("#6a6e72"), lh)
    P.tone([(34, 5), (39, 6), (44, 13), (45, 22), (38, 22)], hx("#4e5258"), lh); P.line([(26, 10), (31, 6)], hx("#9a9ea2"), lh)
    P.fill([(14, 22), (50, 22), (51, 26), (13, 26)], hx("#5a5e64"), lh); P.line([(14, 22), (50, 22)], hx("#8a8e92"), lh)
    return P.finish()

def edda_s():
    P, pal, HR = start("edda")
    hb = P.layer(); P.hair.add(hb)
    P.fill([(10, 24), (27, 24), (27, 36), (20, 42), (11, 38)], HR[1], hb)
    hair_back_detail(P, hb, HR, strands=[[(14, 26), (13, 38)], [(20, 26), (20, 40)]])
    lb, body = base_body(P, pal); bel = belly_mask(P)
    lap = over(P, [(32, 54), (44, 54), (44, 74), (32, 74)], hx("#8a8070"), bel)
    for x in range(32, 44, 3): P.px(x, 72 - (x % 2), hx("#4c3e2e"))
    face(P, pal)
    P.px(36, 33, hx("#6a5236")); P.px(37, 34, hx("#6a5236"))
    hair_front(P, HR, [[(40, 18), (45, 21), (44, 26), (40, 23)]], strands=[[(42, 20), (42, 25)]])
    lk = P.layer()
    P.fill([(9, 24), (10, 12), (18, 5), (30, 3), (40, 7), (45, 15), (44, 21), (36, 18), (28, 18), (26, 24), (20, 26)], hx("#6a4a3a"), lk)
    P.tone([(9, 24), (10, 12), (18, 5), (14, 14), (12, 24)], hx("#523628"), lk)
    for x, y in ((18, 10), (26, 8), (34, 9), (22, 15), (30, 14)): P.px(x, y, hx("#a88a6a"))
    P.fill([(10, 22), (4, 26), (7, 31), (12, 27)], hx("#6a4a3a"), lk)
    return P.finish()

def maud_s():
    P, pal, HR = start("maud")
    hood = (hx("#6a5872"), hx("#4e3e58"), hx("#33283c"))
    lh = P.layer()
    P.fill([(14, 48), (6, 44), (2, 30), (5, 16), (12, 6), (22, 1), (32, 2), (40, 7), (45, 14), (47, 24), (46, 34), (42, 40), (26, 44)], hood[1], lh)
    P.tone([(6, 44), (2, 30), (5, 16), (12, 6), (16, 9), (8, 22), (9, 44)], hood[0], lh); P.tone([(22, 1), (32, 2), (40, 7), (45, 14), (30, 8)], hood[0], lh)
    lb, body = base_body(P, pal)
    over(P, [(38, 52), (45, 50), (46, 60), (40, 62)], hx("#4e5a38"), body)
    for x in (40, 43): P.line([(x, 51), (x - 1, 45)], hx("#6a7a48"))
    face(P, pal)
    P.line([(37, 36), (40, 37)], SMILE(pal))
    lw = P.layer(); P.hair.add(lw)
    P.fill([(36, 18), (42, 20), (41, 27), (38, 24)], hx("#d8d4dc"), lw); P.line([(39, 21), (40, 26)], hx("#a8a4b0"), lw)
    lr = P.layer(); P.fill([(29, 14), (37, 11), (44, 14), (47, 22), (46, 30), (43, 24), (40, 19), (34, 17), (28, 19)], hood[0], lr)
    return P.finish()

def pip_s():
    P, pal, HR = start("pip")
    hb = P.layer(); P.hair.add(hb)
    P.fill([(15, 34), (11, 28), (12, 21), (10, 15), (15, 13), (17, 8), (24, 7), (32, 6), (40, 9), (45, 16), (43, 22), (30, 22), (27, 28), (26, 34), (20, 36)], HR[1], hb)
    hair_back_detail(P, hb, HR, strands=[[(17, 10), (13, 19), (14, 30)], [(24, 9), (19, 18), (19, 32)]], lit=[[(10, 15), (15, 13), (17, 8), (19, 13), (13, 19)]])
    lb, body = base_body(P, pal)
    over(P, [(20, 50), (27, 49), (27, 57), (20, 58)], hx("#3a5a6a"), body)
    for i in range(24): P.px(22 + i * 0.8, 42 + i, hx("#6a4a2a"))
    face(P, pal)
    P.line([(37, 37), (40, 38)], SMILE(pal))
    hair_front(P, HR, [[(29, 13), (37, 10), (43, 14), (46, 22), (42, 21), (40, 26), (37, 20), (33, 24), (30, 18)]],
               strands=[[(37, 11), (35, 18)], [(42, 15), (42, 21)]], shine=[[(31, 12), (36, 11)]])
    lc = P.layer()
    P.fill([(16, 14), (22, 5), (32, 1), (42, 4), (46, 12), (36, 12), (22, 14)], hx("#4a1424"), lc)
    P.tone([(16, 14), (22, 5), (26, 4), (22, 13)], hx("#320c18"), lc); P.line([(28, 3), (38, 3)], hx("#7a2a3a"), lc)
    P.fill([(16, 8), (4, 2), (6, 0), (18, 6)], hx("#c8b890"), lc); P.line([(6, 2), (16, 7)], hx("#8a7a5a"), lc)
    return P.finish()

def joss_s():
    P, pal, HR = start("joss")
    hb = P.layer(); P.hair.add(hb)
    P.fill([(10, 25), (28, 25), (28, 36), (18, 38), (11, 34)], HR[1], hb)
    for cx, cy in ((13, 28), (13, 33), (19, 30), (24, 34)): P.fill([(cx - 3, cy), (cx, cy - 3), (cx + 3, cy), (cx, cy + 3)], HR[0], hb)
    lb, body = base_body(P, pal)
    lj = over(P, [(30, 46), (42, 46), (43, 70), (32, 70)], hx("#6a5236"), body)
    over(P, [(20, 62), (28, 62), (28, 70), (20, 70)], hx("#2a1e14"), body)
    face(P, pal)
    hair_front(P, HR, [[(26, 22), (29, 23), (29, 32), (27, 33)],
                       [(27, 31), (30, 33), (34, 35), (41, 35), (43, 36), (43, 42), (39, 46), (33, 47), (29, 43), (27, 37)]],
               strands=[[(31, 36), (32, 44)], [(36, 37), (36, 45)], [(40, 37), (39, 43)]], shine=[[(29, 34), (33, 35)]])
    P.line([(37, 38), (40, 38), (43, 37)], INK)
    lhat = P.layer()
    P.fill([(18, 20), (22, 7), (32, 4), (40, 7), (42, 20)], hx("#3e3226"), lhat)
    P.tone([(18, 20), (22, 7), (26, 6), (24, 20)], hx("#2a2018"), lhat)
    P.fill([(8, 20), (50, 20), (52, 25), (6, 25)], hx("#4a3c2e"), lhat); P.line([(8, 20), (50, 20)], hx("#6a5a46"), lhat)
    P.line([(19, 17), (41, 17)], hx("#6a2a2a"), lhat)
    return P.finish()

def lenna_s():
    P, pal, HR = start("lenna")
    hb = P.layer(); P.hair.add(hb)
    P.fill([(10, 30), (8, 20), (11, 12), (18, 6), (28, 4), (36, 6), (42, 11), (45, 18), (44, 24), (30, 26), (16, 34)], HR[1], hb)
    hair_back_detail(P, hb, HR, strands=[[(20, 7), (14, 14), (12, 26)], [(30, 5), (22, 12), (18, 24)]], lit=[[(18, 6), (28, 4), (24, 9)]])
    lb, body = base_body(P, pal); bel = belly_mask(P)
    lbt = P.layer()
    for y in (54, 60, 66): P.fill([(40, y), (42, y), (42, y + 1), (40, y + 1)], hx("#d8ccaa"), lbt, within=bel)
    face(P, pal)
    lbr = P.layer(); P.hair.add(lbr)   # the near braid hangs beside the neck, in front of the shoulder
    P.fill([(22, 24), (31, 24), (30, 32), (24, 32)], HR[1], lbr); P.line([(26, 25), (27, 31)], HR[2], lbr)
    braid(P, HR, lbr, 26, 30, 6, dx=0)
    P.fill([(24, 60), (29, 60), (28, 63), (25, 63)], hx("#9a5a6a"), lbr)
    for x, y in ((36, 33), (38, 34)): P.px(x, y, mix(pal["skin"], pal["skinD"], 0.8))
    P.line([(37, 37), (40, 37)], SMILE(pal)); P.px(38, 38, hx("#ffffff"))
    hair_front(P, HR, [[(28, 10), (36, 8), (42, 12), (45, 19), (45, 25), (42, 21), (40, 26), (37, 20), (34, 24), (31, 18), (27, 21)]],
               strands=[[(36, 9), (33, 16)], [(42, 13), (41, 22)]], shine=[[(31, 10), (37, 9)]])
    return P.finish()

def garrick_s():
    P, pal, HR = start("garrick")
    lsk = P.layer(); P.skin.add(lsk)
    P.fill([(10, 30), (9, 18), (13, 10), (21, 5), (30, 4), (38, 7), (43, 13), (44, 22), (40, 30), (26, 32)], pal["skin"], lsk)
    P.tone([(9, 18), (13, 10), (21, 5), (16, 14), (12, 26), (10, 30)], pal["skinD"], lsk); P.line([(26, 7), (32, 6)], mix(pal["skin"], hx("#ffffff"), 0.45), lsk)
    hb = P.layer(); P.hair.add(hb)
    P.fill([(8, 32), (6, 24), (10, 18), (18, 22), (22, 30), (20, 38), (12, 40)], HR[1], hb)
    hair_back_detail(P, hb, HR, strands=[[(9, 22), (10, 36)], [(15, 24), (16, 38)]])
    lb, body = base_body(P, pal)
    lmed = P.layer(); P.fill([(38, 46), (42, 46), (42, 48), (38, 48)], hx("#6a2a2a"), lmed); P.fill([(38, 49), (42, 49), (41, 53), (39, 53)], hx("#c8a040"), lmed)
    face(P, pal)
    P.line([(24, 28), (31, 14), (40, 9)], hx("#1a1614"))   # eyepatch strap across the temple
    lm = P.layer(); P.fill([(35, 36), (43, 35), (44, 38), (37, 39)], HR[1], lm)
    for x in (37, 40): P.line([(x, 36), (x, 38)], HR[2], lm)
    return P.finish()

def ansel_s():
    P, pal, HR = start("ansel")
    hb = P.layer(); P.hair.add(hb)
    P.fill([(15, 32), (11, 26), (12, 18), (10, 13), (15, 11), (17, 6), (23, 7), (28, 3), (33, 6), (39, 7), (44, 14), (44, 22), (30, 22), (27, 28), (26, 32), (20, 34)], HR[1], hb)
    hair_back_detail(P, hb, HR, strands=[[(17, 9), (13, 18), (14, 29)], [(26, 6), (19, 14), (19, 30)], [(34, 8), (28, 14), (26, 22)]], lit=[[(10, 13), (15, 11), (17, 6), (19, 11), (13, 17)]])
    lb, body = base_body(P, pal); bel = belly_mask(P)
    lap = over(P, [(32, 52), (44, 52), (44, 74), (32, 74)], hx("#6a5236"), bel)
    for x, y in ((35, 60), (40, 64), (38, 70)): P.px(x, y, hx("#1a120c"))
    over(P, [(18, 62), (24, 60), (25, 70), (19, 72)], hx("#5a5a62"), body)
    face(P, pal)
    for x, y in ((35, 33), (37, 34), (39, 33)): P.px(x, y, mix(pal["skin"], hx("#b8703a"), 0.6))
    P.px(39, 36, hx("#3a2a1e")); P.px(40, 36, hx("#3a2a1e"))
    hair_front(P, HR, [[(29, 12), (37, 9), (43, 13), (46, 21), (42, 20), (40, 25), (37, 19), (33, 23), (30, 17)]],
               strands=[[(37, 10), (35, 17)], [(42, 14), (42, 20)]], shine=[[(31, 11), (36, 10)]])
    return P.finish()

def hester_s():
    P, pal, HR = start("hester")
    hb = P.layer(); P.hair.add(hb)
    P.fill([(10, 30), (8, 20), (11, 12), (18, 6), (28, 4), (36, 6), (42, 11), (45, 18), (44, 24), (30, 26), (16, 34)], HR[1], hb)
    hair_back_detail(P, hb, HR, strands=[[(20, 7), (14, 14), (12, 26)], [(30, 5), (22, 12), (18, 24)]], lit=[[(18, 6), (28, 4), (24, 9)]])
    lb, body = base_body(P, pal)
    lw = over(P, [(20, 42), (42, 42), (43, 54), (22, 56)], hx("#3a8a86"), body)
    for x in range(22, 42, 4): P.px(x, 48, hx("#c8b088"))
    over(P, [(40, 58), (45, 58), (45, 63), (40, 63)], hx("#6a5a8a"), body)
    face(P, pal)
    P.line([(37, 37), (40, 37)], SMILE(pal)); P.px(37, 34, mix(pal["skin"], hx("#d070a0"), 0.35))
    hair_front(P, HR, [[(28, 12), (36, 9), (42, 13), (44, 19), (40, 18), (34, 16), (28, 17)], [(25, 18), (29, 19), (30, 32), (27, 36), (24, 30)]],
               strands=[[(36, 10), (32, 15)], [(27, 22), (27, 32)]], shine=[[(31, 11), (36, 10)]])
    lbr = P.layer(); P.hair.add(lbr)   # braid over the shoulder, falling down the chest
    P.fill([(23, 28), (30, 28), (30, 40), (24, 40)], HR[1], lbr); P.line([(26, 30), (27, 39)], HR[2], lbr)
    braid(P, HR, lbr, 26, 38, 7, dx=4)
    return P.finish()

SIDE_FN = {"wenna": wenna_s, "mayor_m": lambda: mayor_s(False), "mayor_f": lambda: mayor_s(True), "tomas": tomas_s, "edda": edda_s, "maud": maud_s,
           "pip": pip_s, "joss": joss_s, "lenna": lenna_s, "garrick": garrick_s, "ansel": ansel_s, "hester": hester_s}

# ---------- back views ----------
LOOK = {
  "wenna": dict(hair=("#6a4e3c", "#4a3226", "#2a1a12"), body=("#5e6a5a", "#38423a")),
  "mayor_m": dict(hair=("#b8b4bc", "#9894a0", "#605c68"), body=("#8a3438", "#5a1e24"), hem="#d4a840"),
  "mayor_f": dict(hair=("#b8b4bc", "#9894a0", "#605c68"), body=("#8a3438", "#5a1e24"), hem="#d4a840"),
  "tomas": dict(hair=("#3a2e26", "#2a2018", "#16100c"), body=("#6a6e72", "#44484e"), belt="#2a2018"),
  "edda": dict(hair=("#d0b060", "#b09040", "#7a5a20"), body=("#7a6a44", "#4a3e26"), bow="#8a8070"),
  "maud": dict(hood=("#6a5872", "#4e3e58", "#33283c"), body=("#5a4a62", "#36283e")),
  "pip": dict(hair=("#d8a850", "#b0843a", "#6a4a1a"), body=("#7a2a3a", "#4a1424")),
  "joss": dict(hair=("#3a3036", "#24202a", "#121014"), body=("#5a4632", "#3a2c1e"), belt="#2a1e14"),
  "lenna": dict(hair=("#e8c878", "#c8a050", "#8a6a2a"), body=("#9a5a6a", "#6a3444")),
  "garrick": dict(hair=("#d8d4dc", "#b0acb4", "#605c68"), body=("#5a5e4a", "#3a3e30"), bald=("#e0b494", "#b08068")),
  "ansel": dict(hair=("#b85a30", "#984422", "#5e2814"), body=("#5a4a32", "#33281a"), ties="#6a5236"),
  "hester": dict(hair=("#7a5a8a", "#5a3a70", "#2e1e40"), body=("#2a6a6a", "#164242")),
}
# a hat or helm seen from behind: everything above `bot` on the head becomes the hat
HATS = {"tomas": (("#8a8e92", "#6a6e72", "#4e5258"), 26), "joss": (("#5a4a3a", "#3e3226", "#2a2018"), 25), "pip": (("#6a1e30", "#4a1424", "#320c18"), 14),
        "edda": (("#7a5a46", "#6a4a3a", "#523628"), 22)}
def back_fx(key, img):
    a = img.copy(); Hh, W = a.shape[:2]
    m = a[:, :, 3] > 0
    if key in HATS:
        (A, B, D), bot = HATS[key]; A, B, D = hx(A), hx(B), hx(D); yb = bot + PY
        for y in range(0, yb + 1):
            xs = np.where(m[y])[0]
            if not len(xs): continue
            x0, x1 = xs.min(), xs.max()
            for x in xs:
                if tuple(a[y, x, :3]) == (0, 0, 0) and (x in (x0, x1) or not m[y - 1, x]): continue
                t = (x - x0) / max(1, x1 - x0)
                a[y, x] = (*(A if t < 0.3 else D if t > 0.8 else B), 255)
            for x in range(x0 + 1, x1):
                if y == yb: a[y, x] = (0, 0, 0, 255)
        if key == "joss":
            for x in range(W):
                if m[17 + PY, x] and tuple(a[17 + PY, x, :3]) != (0, 0, 0): a[17 + PY, x] = (*hx("#6a2a2a"), 255)
    im = Image.fromarray(a); d = ImageDraw.Draw(im)
    P2 = lambda pts: [(W - 1 - (x + PX), y + PY) for x, y in pts]
    def braid_b(x0, y0, n, HR, dx=0, tip=None, cut=None):
        """The front view's plait, mirrored: overlapping segments, diagonal lines, one outline round the whole braid."""
        bm = Image.new("L", (W, Hh), 0); bd = ImageDraw.Draw(bm); col = Image.new("RGBA", (W, Hh)); cd = ImageDraw.Draw(col)
        for i in range(n):
            y = y0 + i * 5; x = x0 + dx * (i // 3)
            pts = P2([(x - 2, y), (x + 3, y), (x + 4, y + 4), (x - 1, y + 5)])
            bd.polygon(pts, fill=255); cd.polygon(pts, fill=(*HR[1], 255)); cd.line(P2([(x - 1, y + 1), (x + 3, y + 3)]), fill=(*HR[2], 255))
        if tip:
            pts = P2(tip[0]); bd.polygon(pts, fill=255); cd.polygon(pts, fill=(*hx(tip[1]), 255))
        mk = np.array(bm) > 0
        if cut is not None: mk[cut + PY:] = False
        arr = np.array(im); cc = np.array(col)
        arr[mk] = cc[mk]
        ring = np.zeros_like(mk); ring[1:] |= mk[:-1]; ring[:-1] |= mk[1:]; ring[:, 1:] |= mk[:, :-1]; ring[:, :-1] |= mk[:, 1:]
        hairset = {tuple(c) for c in HR} | {tuple(hx(c)) for c in LOOK[key]["hair"]}
        hairpix = np.array([[tuple(arr[y, x, :3]) in hairset for x in range(W)] for y in range(Hh)])
        arr[ring & ~mk & ~hairpix] = (0, 0, 0, 255)
        return Image.fromarray(arr)
    if key == "lenna":
        HR = H("#e8c878", "#c8a050", "#8a6a2a")
        im = braid_b(8, 24, 7, HR, dx=-1, tip=([(5, 60), (10, 60), (9, 63), (6, 63)], "#9a5a6a"))
        im = braid_b(40, 24, 7, HR, dx=1, tip=([(39, 60), (44, 60), (43, 63), (40, 63)], "#9a5a6a"))
        d = ImageDraw.Draw(im)
    if key == "hester":   # only the start of the braid shows, leaving the nape and going over the shoulder
        HR = H("#7a5a8a", "#5a3a70", "#2e1e40")
        im = braid_b(36, 24, 10, HR, dx=1)
        d = ImageDraw.Draw(im)
    if key == "tomas":   # tabard centred down the back, between shoulders and hem
        xs = np.where(m[60 + PY])[0]; cxm = (xs.min() + xs.max()) // 2
        d.rectangle([cxm - 6, 46 + PY, cxm + 6, 70 + PY], fill=(*hx("#7a3434"), 255)); d.line([(cxm + 6, 46 + PY), (cxm + 6, 70 + PY)], fill=(*hx("#5a2626"), 255))
        d.line([(cxm - 6, 66 + PY), (cxm + 6, 66 + PY)], fill=(*hx("#2a2018"), 255))
    return np.array(im)
