"""Odile, the Clerk of Oakhaven and the player's mentor: an older woman, steel-grey hair in a hard bun pinned with a quill,
stern mouth, fine lines, ink-stained fingers, ink-blue high-collared dress with a pale linen collar and cuffs, a pen case at the belt."""
import ctx
from rebase import hx, mix, eye_pal
from cast2 import Painter, place_face, hair_front, hair_back_detail, INK
from cast3 import base_body, belly_mask, body_pal, over

def H(*c): return tuple(hx(x) for x in c)
PAL = {**eye_pal("#26303c", "#46566a", "#6a7c92", "#9aaabe", "#c8d4e0", "#161c24"), "skin": hx("#eac6ae"), "skinD": hx("#b48c7a"),
       **body_pal("#3a4258", "#232a3c", "#2e3650", "#1c2232", "#7a6a4a", "#4e4430", "#1e1a1e")}
HR = H("#a8a6b0", "#86848f", "#504e5a", "#d0ced8")
LINEN, LINEND, INKSTAIN, QUILL, QUILLD = hx("#ddd5c0"), hx("#aaa290"), hx("#232a3c"), hx("#e8e2d0"), hx("#9a927e")
LOOK = dict(hair=("#a8a6b0", "#86848f", "#504e5a"), body=("#3a4258", "#232a3c"))

def odile():
    P = Painter(); pal = dict(PAL)
    hb = P.layer(); P.hair.add(hb)
    P.fill([(12, 26), (12, 16), (16, 10), (23, 7), (31, 8), (37, 12), (39, 18), (39, 26)], HR[1], hb)   # hair drawn hard back
    P.fill([(18, 1), (30, 1), (33, 5), (31, 10), (17, 10), (15, 5)], HR[1], hb)                       # tight bun on the crown
    hair_back_detail(P, hb, HR, strands=[[(19, 3), (29, 3)], [(17, 6), (31, 7)], [(18, 9), (30, 9)]], lit=[[(18, 1), (24, 1), (21, 4), (16, 5)]])
    lb, body = base_body(P, pal); bel = belly_mask(P)
    lc = over(P, [(17, 41), (31, 41), (33, 45), (27, 48), (24, 46), (21, 48), (15, 45)], LINEN, body)   # linen collar, two points
    P.line([(17, 41), (21, 47)], LINEND, lc); P.line([(31, 41), (27, 47)], LINEND, lc)
    lbt = P.layer()
    for y in (52, 58, 64): P.px(24, y, hx("#7a6a4a"))   # a row of small buttons
    lbelt = over(P, [(12, 62), (36, 62), (36, 64), (12, 64)], hx("#2a2220"), body)
    lpc = over(P, [(30, 63), (35, 63), (35, 71), (30, 71)], hx("#5a4632"), body); P.line([(31, 64), (34, 64)], hx("#8a6e4e"), lpc)   # pen case
    P.off = ctx.HOFF
    place_face(P, pal)
    P.line([(22, 39), (28, 39)], mix(pal["skinD"], hx("#000000"), 0.35))     # thin, stern mouth
    for x in (16, 33): P.line([(x, 35), (x + 1, 37)], pal["skinD"])          # lines at the cheeks
    P.line([(19, 25), (23, 26)], pal["skinD"]); P.line([(27, 26), (31, 25)], pal["skinD"])   # set brows
    hair_front(P, HR, [[(12, 23), (14, 14), (20, 10), (28, 10), (35, 13), (38, 19), (38, 23), (35, 18), (29, 15), (24, 16), (19, 15), (15, 18), (13, 23)],
                       [(11, 22), (14, 23), (14, 30), (12, 31)], [(39, 22), (36, 23), (36, 30), (38, 31)]],
               strands=[[(24, 11), (17, 16)], [(25, 11), (33, 15)], [(20, 11), (14, 19)], [(29, 11), (36, 18)]], shine=[[(17, 12), (23, 10)]], lit=[[(12, 23), (14, 14), (20, 10), (17, 16)]])
    # a quill pushed through the bun: dark shaft, pale feather sticking up and out to the right
    P.line([(18, 8), (29, 3)], hx("#3a3028")); P.line([(29, 3), (36, 0)], QUILL); P.line([(30, 4), (37, 1)], QUILL); P.line([(31, 5), (37, 2)], QUILLD)
    return P.finish()

def odile_s():
    P = Painter(); pal = dict(PAL)
    hb = P.layer(); P.hair.add(hb)
    P.fill([(14, 30), (12, 22), (14, 13), (20, 8), (28, 6), (36, 7), (41, 11), (44, 18), (43, 24), (30, 26), (27, 30), (18, 32)], HR[1], hb)
    P.fill([(14, 6), (18, 1), (25, 1), (29, 5), (27, 10), (15, 10)], HR[1], hb)   # bun at the back of the crown
    hair_back_detail(P, hb, HR, strands=[[(16, 4), (26, 4)], [(15, 7), (27, 7)], [(22, 9), (16, 18), (15, 27)]], lit=[[(14, 6), (18, 1), (21, 2), (16, 6)], [(20, 8), (28, 6), (24, 11)]])
    lb, body = base_body(P, pal); bel = belly_mask(P)
    lc = over(P, [(28, 40), (40, 40), (42, 45), (34, 47)], LINEN, body); P.line([(30, 41), (36, 46)], LINEND, lc)
    lbelt = over(P, [(18, 62), (44, 62), (44, 64), (18, 64)], hx("#2a2220"), body)
    over(P, [(20, 63), (25, 63), (25, 71), (20, 71)], hx("#5a4632"), body)
    face = P.off = ctx.HOFF; place_face(P, pal)
    hair_front(P, HR, [[(28, 12), (36, 9), (42, 13), (44, 19), (40, 18), (34, 16), (28, 17)], [(25, 18), (29, 19), (29, 29), (26, 30)]],
               strands=[[(36, 10), (32, 15)]], shine=[[(31, 11), (36, 10)]])
    P.line([(14, 3), (24, 7)], hx("#3a3028")); P.line([(7, 1), (14, 3)], QUILL); P.line([(7, 2), (14, 4)], QUILL); P.line([(8, 3), (14, 5)], QUILLD)
    return P.finish()

