"""Player hairstyle variants on the purchased Wren base, painted in the base's own palette so runtime recolouring (roles) still works."""
import ctx
from rebase import hx, mix, eye_pal
from cast2 import Painter, place_face, hair_front, hair_back_detail
from cast3 import base_body, belly_mask, body_pal

BASE_EYE = eye_pal("#73172d", "#fa6a0a", "#f9a31b", "#ffd541", "#d6f264", "#3b1725")
PAL = {**BASE_EYE, "skin": hx("#ffc2a1"), "skinD": hx("#bd6a62"), **body_pal("#283540", "#122020", "#2c354d", "#14182e", "#ff8933", "#7d3833", "#3b1725")}
HR = tuple(hx(c) for c in ("#3d2936", "#3b2027", "#291d2b", "#8f4d57"))
STYLES = ["crop", "long", "tail", "braid", "bun", "mop", "shorn"]

def front(style):
    P = Painter(); pal = PAL
    hb = P.layer(); P.hair.add(hb)
    if style == "crop": P.fill([(18, 40), (14, 36), (12, 31), (12, 16), (16, 9), (24, 6), (32, 8), (37, 13), (39, 20), (39, 31), (38, 36), (36, 39)], HR[1], hb)
    elif style == "long": P.fill([(8, 44), (8, 16), (14, 8), (23, 5), (32, 6), (40, 10), (43, 18), (43, 44), (38, 48), (36, 36), (14, 36), (12, 48)], HR[1], hb)
    elif style == "tail":
        P.fill([(18, 40), (14, 36), (12, 31), (12, 16), (16, 9), (24, 6), (32, 8), (37, 13), (39, 20), (39, 31), (38, 36), (36, 39)], HR[1], hb)
        P.fill([(36, 18), (42, 14), (46, 20), (46, 36), (43, 44), (40, 36), (41, 24)], HR[1], hb)
    elif style == "braid":
        P.fill([(18, 40), (14, 36), (12, 31), (12, 16), (16, 9), (24, 6), (32, 8), (37, 13), (39, 20), (39, 31), (38, 36), (36, 39)], HR[1], hb)
        for i in range(7):
            y = 32 + i * 5; x = 36 + (i // 4)
            P.fill([(x - 2, y), (x + 3, y), (x + 4, y + 4), (x - 1, y + 5)], HR[1], hb); P.line([(x - 1, y + 1), (x + 3, y + 3)], HR[2], hb)
    elif style == "bun":
        P.fill([(18, 40), (14, 36), (12, 31), (12, 16), (16, 9), (24, 6), (32, 8), (37, 13), (39, 20), (39, 31), (38, 36), (36, 39)], HR[1], hb)
        P.fill([(19, 1), (29, 1), (32, 5), (30, 10), (18, 10), (16, 5)], HR[1], hb)
    elif style == "mop": P.fill([(18, 40), (13, 36), (9, 31), (8, 18), (12, 11), (18, 6), (24, 8), (30, 4), (36, 8), (41, 14), (42, 24), (40, 33), (37, 38)], HR[1], hb)
    elif style == "shorn": P.fill([(17, 32), (14, 26), (14, 16), (17, 11), (24, 9), (32, 10), (36, 14), (38, 22), (36, 32)], HR[2], hb)
    hair_back_detail(P, hb, HR, strands=[[(16, 10), (13, 22)], [(34, 10), (38, 22)]])
    lb, body = base_body(P, pal); bel = belly_mask(P)
    P.off = ctx.HOFF
    place_face(P, pal)
    P.line([(22, 39), (26, 39)], mix(pal["skinD"], hx("#000000"), 0.3))
    fronts = {
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

SIDE_BACK = {
    "crop": [(15, 32), (10, 24), (11, 14), (17, 6), (25, 2), (34, 3), (41, 8), (45, 15), (45, 24), (30, 29)],
    "long": [(14, 52), (6, 46), (6, 24), (10, 12), (17, 5), (25, 1), (34, 2), (41, 7), (45, 15), (45, 24), (30, 30), (24, 40), (22, 52)],
    "tail": [(15, 32), (10, 24), (11, 14), (17, 6), (25, 2), (34, 3), (41, 8), (45, 15), (45, 24), (30, 29)],
    "braid": [(15, 32), (10, 24), (11, 14), (17, 6), (25, 2), (34, 3), (41, 8), (45, 15), (45, 24), (30, 29)],
    "bun": [(15, 32), (10, 24), (11, 14), (17, 6), (25, 2), (34, 3), (41, 8), (45, 15), (45, 24), (30, 29)],
    "mop": [(14, 36), (8, 26), (8, 14), (15, 6), (24, 1), (34, 2), (42, 7), (46, 15), (46, 25), (30, 30)],
    "shorn": [(17, 30), (13, 22), (14, 13), (20, 7), (27, 4), (35, 5), (41, 9), (44, 15), (44, 22), (30, 27)],
}
SIDE_EXTRA = {
    "tail": [[(10, 18), (3, 22), (1, 36), (5, 46), (9, 38), (12, 26)]],
    "bun": [[(14, 7), (15, 1), (22, 0), (26, 3), (25, 8)]],
}
def side(style, braid=True):
    old = ctx.REGIONS["side"]["lash"]; ctx.REGIONS["side"]["lash"] = ((33, 37), (33, 37), (25, 32))
    try: return _side(style, braid)
    finally: ctx.REGIONS["side"]["lash"] = old
def _side(style, braid=True):
    P = Painter(); pal = PAL
    hb = P.layer(); P.hair.add(hb)
    P.fill(SIDE_BACK[style], HR[2] if style == "shorn" else HR[1], hb)
    for poly in SIDE_EXTRA.get(style, []): P.fill(poly, HR[1], hb)
    hair_back_detail(P, hb, HR, strands=[[(36, 4), (24, 6), (15, 14), (11, 24)], [(40, 9), (28, 10), (18, 20), (14, 28)]], lit=[[(16, 5), (25, 1), (30, 3), (20, 8)]])
    lb, body = base_body(P, pal); bel = belly_mask(P)
    P.off = ctx.HOFF
    place_face(P, pal)
    fr = {"shorn": [[(29, 14), (36, 10), (42, 13), (44, 19), (41, 17), (36, 15), (30, 17)]],
          "mop": [[(26, 14), (33, 8), (40, 10), (45, 17), (47, 25), (43, 20), (40, 24), (37, 18), (32, 22), (28, 18)], [(24, 17), (30, 18), (30, 25), (26, 26)]]}.get(style,
         [[(28, 12), (36, 8), (43, 12), (46, 19), (45, 24), (41, 19), (35, 16), (29, 18)], [(24, 17), (30, 18), (31, 26), (27, 29)]])
    hair_front(P, HR, fr, strands=[[(30, 13), (38, 11), (44, 18)]], shine=[[(31, 10), (38, 9)]], lit=[[(28, 12), (36, 8), (34, 12), (29, 15)]])
    if style == "braid" and braid:
        lb = P.layer(); P.hair.add(lb)
        for i in range(10):
            y = 26 + i * 3; x = 28 + min(i, 5)
            P.fill([(x - 2, y), (x + 2, y), (x + 3, y + 2), (x + 2, y + 4), (x - 2, y + 4), (x - 3, y + 2)], HR[1] if i % 2 else HR[0], lb)
            P.line([(x - 1, y + 3), (x + 1, y + 3)], HR[2], lb)
        P.fill([(31, 56), (36, 56), (36, 58), (31, 58)], HR[3], lb)
    return P.finish()

# ---- back views: what each style adds behind the head and down the back (sprite coordinates, centre column 30) ----
import numpy as np
from PIL import Image, ImageDraw
BA, BB, BD, BT = (0x5a, 0x35, 0x40), (0x3b, 0x20, 0x27), (0x24, 0x16, 0x1c), (0x8f, 0x4d, 0x57)
BACK_BASE = {"tail": "crop", "braid": "crop"}   # clean dome to start from
def _put(a, pts, fill=BB, lines=(), dome=None):
    m = Image.new("L", (a.shape[1], a.shape[0]), 0); ImageDraw.Draw(m).polygon(pts, fill=1); m = np.array(m).astype(bool)
    im = Image.fromarray(a); d = ImageDraw.Draw(im)
    out = np.array(im); out[m] = fill + (255,)
    im = Image.fromarray(out); d = ImageDraw.Draw(im)
    for ln in lines: d.line(ln, fill=BD + (255,))
    out = np.array(im)
    hairc = np.zeros(m.shape, bool)
    for c in (BA, BB, BD, BT): hairc |= np.all(out[:, :, :3] == c, axis=2) & (out[:, :, 3] > 0)
    ring = np.zeros_like(m)
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)): ring |= np.roll(np.roll(m, dy, 0), dx, 1)
    ring &= ~m; ring &= ~hairc
    ring &= ~(np.all(out[:, :, :3] == 0, axis=2) & (out[:, :, 3] > 0))
    out[ring] = (0, 0, 0, 255)
    return out
def back_extra(style):
    def f(a):
        if False:
            a = _put(a, [(16, 34), (44, 34), (46, 44), (46, 54), (42, 59), (30, 61), (18, 59), (14, 54), (14, 44)], lines=[[(21, 38), (20, 57)], [(26, 38), (26, 59)], [(31, 38), (31, 60)], [(36, 38), (36, 59)], [(40, 40), (41, 57)]])
        elif style == "tail":
            a = _put(a, [(26, 16), (34, 16), (37, 26), (38, 40), (35, 52), (31, 57), (28, 52), (24, 40), (23, 26)], lines=[[(28, 19), (27, 52)], [(32, 19), (33, 52)]])
            a = _put(a, [(26, 15), (34, 15), (34, 18), (26, 18)], fill=BT)
        elif style == "braid":
            for i in range(9):
                y = 30 + i * 3; x = 38
                a = _put(a, [(x - 2, y), (x + 2, y), (x + 3, y + 2), (x + 2, y + 4), (x - 2, y + 4), (x - 3, y + 2)], fill=BA if i % 2 else BB, lines=[[(x - 1, y + 3), (x + 1, y + 3)]])
            a = _put(a, [(36, 57), (40, 57), (40, 59), (36, 59)], fill=BT)
        elif False:
            a = _put(a, [(17, 36), (43, 36), (45, 44), (41, 42), (38, 47), (34, 42), (30, 48), (26, 42), (22, 47), (19, 42), (15, 44)], lines=[[(22, 38), (22, 42)], [(30, 38), (30, 44)], [(37, 38), (37, 42)]])
        return a
    return f
