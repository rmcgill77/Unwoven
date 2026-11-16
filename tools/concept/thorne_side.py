"""Side view (facing right) of Isaura Thorne, on the craftpix side frames."""
import ctx
from rebase import hx, mix, eye_pal
from cast2 import Painter, place_face, hair_front, hair_back_detail, INK
from cast3 import base_body, belly_mask, body_pal, over

def thorne():
    old = ctx.REGIONS["side"]["lash"]; ctx.REGIONS["side"]["lash"] = ((33, 37), (33, 37), (25, 32))
    try: return _t()
    finally: ctx.REGIONS["side"]["lash"] = old
def _t():
    P = Painter()
    pal = {**eye_pal("#2a3038", "#4a5664", "#7a8898", "#a8b8c8", "#d8e4f0", "#1a1e24"), "skin": hx("#f0d0bc"), "skinD": hx("#c09486"),
           **body_pal("#4a5262", "#2a303c", "#2a2630", "#1a161e", "#c8c8d4", "#7a7a88", "#16141a")}
    HR = tuple(hx(c) for c in ("#8a8c96", "#6a6c78", "#3e4048", "#b8bac4"))
    hb = P.layer(); P.hair.add(hb)
    P.fill([(15, 32), (10, 24), (11, 14), (17, 6), (25, 2), (34, 3), (41, 8), (45, 15), (45, 24), (30, 29)], HR[1], hb)
    P.fill([(6, 23), (13, 22), (16, 30), (12, 35), (6, 31)], HR[1], hb)   # the low knot at the nape
    hair_back_detail(P, hb, HR, strands=[[(36, 4), (24, 6), (15, 14), (11, 24)], [(40, 9), (28, 10), (18, 20), (14, 28)]], lit=[[(16, 5), (25, 1), (30, 3), (20, 8)]])
    lb, body = base_body(P, pal); bel = belly_mask(P)
    lcr = over(P, [(35, 37), (41, 37), (41, 44), (38, 47)], hx("#5a6474"), body)   # high collar
    lch = P.layer()
    for (x, y) in [(36, 47), (38, 50), (40, 53), (41, 56)]: P.px(x, y, hx("#d8d8e0"))
    P.fill([(39, 56), (43, 56), (43, 60), (41, 62), (39, 60)], hx("#c8c8d4"), lch); P.px(41, 58, hx("#3a4a6a"))
    P.off = ctx.HOFF
    place_face(P, pal)
    hair_front(P, HR, [[(28, 12), (36, 8), (43, 12), (46, 20), (46, 27), (44, 31), (42, 26), (42, 22), (38, 18), (32, 17), (27, 19)],
                       [(24, 17), (30, 18), (31, 28), (28, 33), (25, 30)]],
               strands=[[(30, 13), (38, 11), (44, 18)]], shine=[[(31, 10), (38, 9)]], lit=[[(28, 12), (36, 8), (34, 12), (29, 15)]])
    lw = P.layer(); P.line([(32, 9), (36, 12), (40, 16)], hx("#f0f0f4"), lw)   # the white streak
    return P.finish()
