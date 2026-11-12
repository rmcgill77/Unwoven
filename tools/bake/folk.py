"""Townsfolk of Oakhaven, each on the craftpix base body: own hair, face details, palette and outfit marks.
Front views only here; side views live in folk_side.py."""
from PIL import Image, ImageDraw, ImageFont
import ctx
from rebase import hx, mix, eye_pal
from cast2 import Painter, place_face, hair_front, hair_back_detail, T, INK
from cast3 import base_body, belly_mask, body_pal, over

def H(*c): return tuple(hx(x) for x in c)
def ovr_pal(pal): return {**pal, **ctx.OVR.get("pal", {})}

def wenna():   # shopkeeper: sharp, tidy, tight bun, spectacles on a cord, grey-green shawl, ledger pencil
    P = Painter()
    pal = ovr_pal({**eye_pal("#2a3a1a", "#5a6a2a", "#8a9a3a", "#b8c060", "#d8e080", "#1a240e"), "skin": hx("#f4d2bc"), "skinD": hx("#c8988a"),
           **body_pal("#5e6a5a", "#38423a", "#8a7a5e", "#5e5240", "#c8b88a", "#8a7a5a", "#2a2018")})
    HR = H("#6a4e3c", "#4a3226", "#2a1a12", "#8e6a50")
    hb = P.layer(); P.hair.add(hb)
    P.fill([(11, 26), (11, 16), (15, 10), (23, 7), (31, 8), (37, 12), (40, 18), (40, 26)], HR[1], hb)
    P.fill([(19, 0), (29, 0), (32, 5), (30, 10), (18, 10), (16, 5)], HR[1], hb)   # bun
    hair_back_detail(P, hb, HR, strands=[[(20, 3), (28, 3)], [(18, 6), (30, 7)]], lit=[[(19, 0), (25, 0), (22, 4), (17, 5)]])
    lb, body = base_body(P, pal); bel = belly_mask(P)
    lsh = over(P, [(12, 42), (36, 42), (38, 52), (24, 58), (10, 52)], hx("#5a6658"), body)   # knitted shawl over the shoulders
    P.tone([(24, 42), (36, 42), (38, 52), (24, 58)], hx("#46504a"), lsh)
    for x in range(14, 36, 4): P.line([(x, 44), (x + 1, 50)], hx("#3a443c"), lsh)
    P.line([(10, 52), (24, 58), (38, 52)], hx("#2a322c"), lsh)
    lap = over(P, [(17, 60), (31, 60), (33, 72), (15, 72)], hx("#6a6252"), bel)   # pocketed work apron
    P.line([(17, 60), (31, 60)], hx("#8a8270"), lap); P.line([(24, 61), (24, 71)], hx("#4e4838"), lap)
    P.line([(28, 60), (30, 52)], hx("#c8b070"))   # pencil
    P.off = ctx.HOFF
    place_face(P, pal)
    hair_front(P, HR, [[(12, 22), (14, 14), (20, 10), (28, 10), (35, 13), (39, 20), (39, 24), (36, 19), (30, 16), (24, 15), (18, 17), (14, 22)],
                       [(11, 22), (14, 23), (14, 31), (12, 32)], [(40, 22), (37, 23), (37, 31), (39, 32)]],
               strands=[[(24, 11), (17, 18)], [(26, 11), (34, 17)], [(19, 12), (14, 20)]], shine=[[(17, 12), (22, 10)]], lit=[[(12, 22), (14, 14), (20, 10), (17, 17)]])
    lg = P.layer()   # spectacles pushed low on the nose: thin wire rims
    for x0 in (16, 30): P.line([(x0, 33), (x0 + 6, 33), (x0 + 6, 35), (x0, 35), (x0, 33)], hx("#8a8270"), lg)
    P.line([(22, 34), (30, 34)], hx("#8a8270"), lg)
    P.line([(16, 35), (13, 44)], hx("#6a6252"), lg); P.line([(36, 35), (38, 44)], hx("#6a6252"), lg)   # cord
    return P.finish()

def mayor(female=False):   # comfortable, vain: oiled grey hair, pinkish well-fed skin, red velvet coat, gold chain of office
    P = Painter()
    pal = ovr_pal({**eye_pal("#3a2a1a", "#6a4a2a", "#9a6a3a", "#c8985a", "#e0c080", "#24180e"), "skin": hx("#f4c8b0"), "skinD": hx("#c89088"),
           **body_pal("#8a3438", "#5a1e24", "#2e2228", "#1a1418", "#d4a840", "#8a6a20", "#1a1418")})
    HR = H("#b8b4bc", "#9894a0", "#605c68", "#e0dce4")
    hb = P.layer(); P.hair.add(hb)
    if female:
        P.fill([(10, 30), (10, 16), (15, 9), (23, 6), (31, 7), (37, 11), (40, 18), (40, 30)], HR[1], hb)
        P.fill([(12, 4), (20, 0), (30, 0), (37, 4), (36, 10), (13, 10)], HR[1], hb)   # piled curls
        for cx in (16, 22, 28, 34): P.fill([(cx - 3, 4), (cx, 1), (cx + 3, 4), (cx, 7)], HR[0], hb)
    else:
        P.fill([(12, 24), (12, 15), (16, 9), (24, 6), (32, 8), (37, 13), (39, 20), (39, 24)], HR[1], hb)
    hair_back_detail(P, hb, HR, strands=[[(16, 10), (14, 20)], [(34, 10), (37, 20)]])
    lb, body = base_body(P, pal); bel = belly_mask(P)
    lfur = over(P, [(11, 41), (37, 41), (37, 46), (11, 46)], hx("#d8d0c4"), body)   # fur collar
    for x in range(12, 37, 3): P.px(x, 46, hx("#a8a094"))
    lch = P.layer()   # chain of office
    for i, (x, y) in enumerate([(14, 47), (16, 50), (19, 53), (22, 55), (26, 55), (29, 53), (32, 50), (34, 47)]): P.px(x, y, hx("#e8c860")); P.px(x + 1, y, hx("#a8802a"))
    P.fill([(22, 55), (26, 55), (27, 59), (24, 61), (21, 59)], hx("#d4a840"), lch); P.px(24, 57, hx("#6a3434"))
    for y in (62, 66, 70): P.px(24, y, hx("#d4a840"))
    P.off = ctx.HOFF
    place_face(P, pal)
    for x in (18, 19, 33, 34): P.px(x, 34, mix(pal["skin"], hx("#e06060"), 0.4))   # ruddy cheeks
    if female:
        hair_front(P, HR, [[(12, 22), (14, 13), (20, 9), (28, 9), (35, 12), (39, 19), (39, 23), (34, 17), (28, 14), (22, 14), (16, 17), (13, 22)],
                           [(10, 22), (14, 23), (14, 34), (12, 38), (10, 32)], [(40, 22), (36, 23), (36, 34), (38, 38), (40, 32)]],
                   strands=[[(24, 10), (16, 16)], [(26, 10), (35, 15)], [(12, 26), (12, 35)], [(38, 26), (38, 35)]], shine=[[(17, 11), (24, 9)]])
    else:
        hair_front(P, HR, [[(12, 22), (14, 13), (20, 9), (28, 9), (35, 12), (39, 19), (39, 23), (33, 16), (24, 14), (18, 16), (14, 22)],
                           [(12, 22), (15, 23), (15, 33), (13, 33)], [(39, 22), (36, 23), (36, 33), (38, 33)]],
                   strands=[[(14, 18), (24, 11), (34, 12)], [(17, 20), (26, 14), (37, 18)]], shine=[[(18, 11), (27, 9)], [(20, 13), (28, 11)]])
        lm = P.layer()   # neat moustache
        P.fill([(20, 37), (25, 36), (27, 38), (28, 36), (31, 37), (31, 39), (27, 39), (22, 39)], HR[1], lm); P.line([(22, 37), (25, 37)], HR[0], lm)
    return P.finish()

def tomas():   # town watch: dented kettle helm, padded gambeson, tabard with the covenant mark
    P = Painter()
    pal = ovr_pal({**eye_pal("#2a1a0e", "#5a3a1e", "#8a5a2e", "#b88040", "#d8a860", "#1a0e08"), "skin": hx("#c08a64"), "skinD": hx("#8e5c40"),
           **body_pal("#6a6e72", "#44484e", "#7a3434", "#4e2222", "#d6c8a0", "#9a8a62", "#24201c")})
    HR = H("#3a2e26", "#2a2018", "#16100c", "#5a4a3a")
    hb = P.layer(); P.hair.add(hb)
    P.fill([(11, 30), (11, 20), (37, 20), (39, 30)], HR[1], hb)
    lb, body = base_body(P, pal); bel = belly_mask(P)
    lt = over(P, [(17, 44), (31, 44), (33, 74), (15, 74)], hx("#7a3434"), body)   # tabard
    P.tone([(26, 44), (31, 44), (33, 74), (27, 74)], hx("#5a2626"), lt)
    P.fill([(21, 54), (27, 54), (27, 62), (24, 65), (21, 62)], hx("#d6c8a0"), lt); P.line([(24, 55), (24, 63)], hx("#7a3434"), lt); P.line([(22, 58), (26, 58)], hx("#7a3434"), lt)
    lbelt = over(P, [(11, 66), (37, 66), (37, 68), (11, 68)], hx("#2a2018"), body); P.fill([(22, 65), (26, 65), (26, 69), (22, 69)], hx("#8a8478"), lbelt)
    P.off = ctx.HOFF
    place_face(P, pal)
    P.line([(15, 37), (17, 39)], pal["skinD"])   # stubble line along the jaw
    for x in range(18, 32, 2): P.px(x, 40, mix(pal["skin"], HR[1], 0.45))
    lh = P.layer()   # kettle helm with a wide brim
    P.fill([(13, 22), (14, 12), (20, 6), (28, 6), (34, 12), (35, 22)], hx("#6a6e72"), lh)
    P.tone([(26, 6), (34, 12), (35, 22), (28, 22)], hx("#4e5258"), lh); P.line([(17, 10), (22, 7)], hx("#9a9ea2"), lh)
    P.fill([(7, 22), (41, 22), (43, 26), (5, 26)], hx("#5a5e64"), lh); P.line([(7, 22), (41, 22)], hx("#8a8e92"), lh)
    P.px(29, 13, hx("#3a3e44")); P.px(30, 14, hx("#3a3e44"))   # dent
    P.line([(24, 6), (24, 21)], hx("#4e5258"), lh)
    return P.finish()

def edda():   # farmer: weathered, straw hair under a kerchief, sleeves rolled, mud on the hem, a smear on the cheek
    P = Painter()
    pal = ovr_pal({**eye_pal("#2a3a2a", "#4a6a4a", "#7a9a6a", "#a8c890", "#d0e8b0", "#1a241a"), "skin": hx("#d4a07a"), "skinD": hx("#a06e50"),
           **body_pal("#7a6a44", "#4a3e26", "#8a8070", "#5e5648", "#5a4a30", "#3a2e1e", "#2e2418")})
    HR = H("#d0b060", "#b09040", "#7a5a20", "#e8d090")
    hb = P.layer(); P.hair.add(hb)
    P.fill([(10, 34), (10, 18), (38, 18), (40, 34), (38, 42), (34, 36), (14, 36), (11, 42)], HR[1], hb)
    hair_back_detail(P, hb, HR, strands=[[(12, 26), (12, 40)], [(38, 26), (38, 40)]])
    lb, body = base_body(P, pal); bel = belly_mask(P)
    lap = over(P, [(16, 54), (32, 54), (34, 74), (14, 74)], hx("#8a8070"), bel); P.tone([(27, 54), (32, 54), (34, 74), (28, 74)], hx("#6e6658"), lap)
    for x in range(15, 34, 3): P.px(x, 72 - (x % 2), hx("#4c3e2e")); P.px(x + 1, 73, hx("#4c3e2e"))   # mud on the hem
    lstraw = P.layer(); P.line([(33, 50), (38, 44)], hx("#c8b070"), lstraw); P.line([(34, 51), (39, 47)], hx("#a89050"), lstraw)   # straw tucked in
    P.off = ctx.HOFF
    place_face(P, pal)
    for x, y in ((18, 31), (19, 32), (20, 31)): P.px(x, y, hx("#6a5236"))   # dirt smear on the cheek
    for x in (17, 33): P.px(x, 36, pal["skinD"])   # weather lines
    hair_front(P, HR, [[(11, 22), (14, 18), (18, 20), (16, 26), (13, 30)], [(38, 22), (35, 18), (31, 20), (33, 26), (36, 30)]],
               strands=[[(13, 22), (13, 28)], [(36, 22), (36, 28)]])
    lk = P.layer()   # kerchief tied over the hair
    P.fill([(11, 22), (13, 12), (19, 6), (29, 6), (35, 12), (38, 22), (34, 18), (24, 16), (15, 18)], hx("#6a4a3a"), lk)
    P.tone([(26, 6), (35, 12), (38, 22), (32, 17)], hx("#523628"), lk)
    for x, y in ((18, 11), (24, 9), (30, 11), (21, 14), (28, 14)): P.px(x, y, hx("#a88a6a"))
    P.fill([(36, 18), (42, 22), (40, 26), (37, 23)], hx("#6a4a3a"), lk)   # knot
    return P.finish()

def maud():   # old woman: deep shawl hood, white wisps, cloudy pale eyes, sly mouth, a bundle of herbs
    P = Painter()
    pal = ovr_pal({**eye_pal("#4a5a4a", "#7a8a7a", "#a8b8a8", "#c8d8c8", "#e8f0e8", "#2a342a"), "skin": hx("#e8c8b4"), "skinD": hx("#b89888"),
           **body_pal("#5a4a62", "#36283e", "#4e4232", "#2e2618", "#7a6a8a", "#4a3a5a", "#1e181e")})
    hood = (hx("#6a5872"), hx("#4e3e58"), hx("#33283c"))
    lh = P.layer()
    P.fill([(4, 44), (2, 28), (5, 15), (12, 6), (22, 2), (30, 2), (38, 6), (44, 15), (46, 28), (44, 44)], hood[1], lh)
    P.tone([(28, 2), (38, 6), (44, 15), (46, 28), (44, 44), (36, 44), (38, 20)], hood[2], lh); P.tone([(4, 44), (2, 28), (5, 15), (12, 6), (14, 10), (9, 24), (10, 44)], hood[0], lh)
    lb, body = base_body(P, pal); bel = belly_mask(P)
    lherb = over(P, [(28, 52), (36, 50), (38, 60), (30, 62)], hx("#4e5a38"), body)   # bundle of herbs at the hip
    for x in (30, 33, 36): P.line([(x, 51), (x - 1, 45)], hx("#6a7a48"), None)
    P.line([(29, 56), (37, 54)], hx("#8a6a44"), lherb)
    P.off = ctx.HOFF
    place_face(P, pal)
    for x in (16, 33): P.line([(x, 35), (x + 1, 37)], pal["skinD"])
    P.line([(20, 25), (24, 24)], pal["skinD"]); P.line([(28, 24), (32, 25)], pal["skinD"])   # brow lines
    P.line([(23, 39), (26, 38), (28, 37)], mix(pal["skinD"], hx("#000000"), 0.3))   # crooked smile
    lw = P.layer(); P.hair.add(lw)   # white wisps escaping the hood
    for pts in ([(13, 22), (16, 20), (15, 30), (12, 34)], [(37, 22), (34, 20), (35, 30), (38, 34)], [(20, 18), (24, 16), (22, 22)]):
        P.fill(pts, hx("#d8d4dc"), lw)
    P.line([(14, 24), (13, 32)], hx("#a8a4b0"), lw); P.line([(36, 24), (37, 32)], hx("#a8a4b0"), lw)
    lr = P.layer()
    P.fill([(10, 26), (12, 16), (19, 10), (29, 10), (36, 16), (39, 26), (35, 20), (28, 15), (20, 15), (14, 20)], hood[0], lr)
    for x in range(14, 36):
        for y in range(18, 26):
            yy, xx = y + 2 + ctx.HOFF[1], x + 6 + ctx.HOFF[0]
            if P.lab[yy, xx] and P.lab[yy, xx] < lr and P.lab[yy, xx] not in P.hair and P.lab[yy - 1, xx] == lr: P.c[yy, xx] = (*pal["skinD"], 255)
    return P.finish()

def pip():   # wandering bard: messy blond hair, feathered cap, patched motley cloak, lute strap
    P = Painter()
    pal = ovr_pal({**eye_pal("#3a2a10", "#7a5a20", "#b08a3a", "#d8b060", "#f0d890", "#24180a"), "skin": hx("#b07a58"), "skinD": hx("#7e5038"),
           **body_pal("#7a2a3a", "#4a1424", "#5a6a3a", "#3a4626", "#d4a840", "#8a6a20", "#2a1a14")})
    HR = H("#d8a850", "#b0843a", "#6a4a1a", "#f0d080")
    hb = P.layer(); P.hair.add(hb)
    P.fill([(8, 32), (6, 24), (9, 18), (6, 12), (13, 12), (14, 6), (21, 8), (26, 4), (31, 8), (38, 7), (38, 13), (43, 15), (40, 21), (43, 28), (39, 34), (12, 34)], HR[1], hb)
    hair_back_detail(P, hb, HR, strands=[[(14, 8), (9, 16), (8, 28)], [(36, 9), (40, 18), (40, 30)], [(26, 5), (24, 10)]], lit=[[(6, 12), (13, 12), (14, 6), (21, 8), (15, 13), (9, 17)]])
    lb, body = base_body(P, pal); bel = belly_mask(P)
    lp = over(P, [(13, 50), (20, 49), (20, 57), (13, 58)], hx("#3a5a6a"), body)   # patches on the cloak
    for x, y in ((14, 51), (16, 51), (18, 51), (14, 56), (18, 56)): P.px(x, y, hx("#d8ccaa"))
    over(P, [(31, 60), (36, 60), (36, 66), (31, 66)], hx("#8a6a3a"), body)
    lstrap = P.layer()
    for i in range(30): P.px(13 + i * 0.8, 42 + i, hx("#6a4a2a")); P.px(14 + i * 0.8, 42 + i, hx("#4a3220"))
    P.off = ctx.HOFF
    place_face(P, pal)
    P.line([(22, 39), (25, 40), (28, 38)], mix(pal["skinD"], hx("#000000"), 0.3))   # easy grin
    hair_front(P, HR, [[(10, 24), (12, 15), (18, 11), (26, 10), (34, 12), (40, 18), (41, 26), (37, 22), (34, 27), (31, 21), (28, 26), (25, 20), (22, 27), (19, 21), (16, 27), (13, 22)],
                       [(9, 22), (13, 24), (13, 33), (10, 36)], [(41, 22), (37, 24), (37, 33), (40, 36)]],
               strands=[[(26, 11), (20, 18), (17, 25)], [(30, 12), (31, 20), (32, 25)], [(37, 15), (39, 23)], [(14, 16), (13, 24)]], shine=[[(17, 13), (24, 11)]], lit=[[(10, 24), (12, 15), (20, 11), (16, 18)]])
    lc = P.layer()   # floppy cap with a long feather
    P.fill([(12, 14), (16, 6), (26, 2), (36, 6), (40, 14), (30, 12), (20, 12)], hx("#4a1424"), lc)
    P.tone([(26, 2), (36, 6), (40, 14), (32, 12)], hx("#320c18"), lc); P.line([(16, 8), (24, 4)], hx("#7a2a3a"), lc)
    P.fill([(34, 6), (44, -1 + 2), (46, 2), (37, 9)], hx("#c8b890"), lc); P.line([(35, 7), (45, 1)], hx("#8a7a5a"), lc)
    return P.finish()

def joss():   # carter: dark curls, thick beard, broad hat, leather jerkin, a whip coiled at the belt
    P = Painter()
    pal = ovr_pal({**eye_pal("#2a1a0e", "#5a3a1e", "#8a5a2e", "#b88040", "#d8a860", "#1a0e08"), "skin": hx("#a87050"), "skinD": hx("#7a4a34"),
           **body_pal("#5a4632", "#3a2c1e", "#6a5a42", "#46382a", "#2a1e14", "#1a120c", "#241a12")})
    HR = H("#3a3036", "#24202a", "#121014", "#5a5060")
    hb = P.layer(); P.hair.add(hb)
    P.fill([(10, 32), (9, 22), (40, 22), (40, 32)], HR[1], hb)
    for cx, cy in ((11, 26), (11, 31), (39, 26), (39, 31)): P.fill([(cx - 3, cy), (cx, cy - 3), (cx + 3, cy), (cx, cy + 3)], HR[0], hb)
    lb, body = base_body(P, pal); bel = belly_mask(P)
    lj = over(P, [(15, 46), (33, 46), (34, 70), (14, 70)], hx("#6a5236"), body)   # leather jerkin
    P.tone([(27, 46), (33, 46), (34, 70), (28, 70)], hx("#4e3c28"), lj)
    for y in (50, 56, 62): P.px(16, y, hx("#2a1e14")); P.px(32, y, hx("#2a1e14"))
    lw = over(P, [(30, 62), (38, 62), (38, 70), (30, 70)], hx("#2a1e14"), body); P.line([(31, 64), (37, 64)], hx("#4a3a28"), lw); P.line([(31, 67), (37, 67)], hx("#4a3a28"), lw)
    P.off = ctx.HOFF
    place_face(P, pal)
    hf = hair_front(P, HR, [[(14, 34), (19, 37), (23, 38), (31, 38), (35, 37), (37, 34), (38, 40), (36, 46), (31, 49), (26, 50), (19, 49), (14, 46), (13, 40)]],
                    strands=[[(16, 39), (19, 46)], [(26, 42), (26, 49)], [(33, 39), (31, 46)], [(21, 40), (22, 47)], [(30, 40), (30, 47)]], shine=[[(18, 37), (22, 39)]])
    P.line([(22, 40), (26, 41), (30, 41), (32, 40)], INK)
    lhat = P.layer()   # broad-brimmed carter's hat
    P.fill([(14, 20), (16, 8), (24, 4), (32, 8), (34, 20)], hx("#3e3226"), lhat)
    P.tone([(26, 4), (32, 8), (34, 20), (28, 20)], hx("#2a2018"), lhat)
    P.fill([(4, 20), (44, 20), (46, 25), (2, 25)], hx("#4a3c2e"), lhat); P.line([(4, 20), (44, 20)], hx("#6a5a46"), lhat)
    P.line([(14, 17), (34, 17)], hx("#6a2a2a"), lhat)   # hat band
    return P.finish()

def lenna():   # a girl of nine: twin braids, gap-tooth, freckles, too-big cardigan, patched knees
    P = Painter()
    pal = ovr_pal({**eye_pal("#2a4a6a", "#4a7aa8", "#7aa8d8", "#b0d0f0", "#e0f0ff", "#1a2a3a"), "skin": hx("#f0c8a8"), "skinD": hx("#c89888"),
           **body_pal("#9a5a6a", "#6a3444", "#7a8a9a", "#4e5a68", "#d8ccaa", "#a89a7c", "#3a2418")})
    HR = H("#e8c878", "#c8a050", "#8a6a2a", "#f8e8b0")
    hb = P.layer(); P.hair.add(hb)
    P.fill([(11, 28), (11, 16), (15, 9), (23, 6), (31, 7), (37, 11), (40, 18), (40, 28)], HR[1], hb)
    for sx, d in ((8, -1), (40, 1)):   # twin braids
        for i in range(6):
            y = 30 + i * 5; x = sx + d * (i // 3)
            P.fill([(x - 2, y), (x + 3, y), (x + 4, y + 4), (x - 1, y + 5)], HR[1], hb); P.line([(x - 1, y + 1), (x + 3, y + 3)], HR[2], hb)
        P.fill([(sx - 2 + d, 60), (sx + 3 + d, 60), (sx + 2 + d, 63), (sx - 1 + d, 63)], hx("#9a5a6a"), hb)
    P.fill([(7, 22), (14, 22), (13, 31), (6, 32)], HR[1], hb); P.fill([(36, 22), (43, 22), (44, 32), (37, 31)], HR[1], hb)   # hair gathering into the braids
    P.line([(9, 24), (8, 31)], HR[2], hb); P.line([(40, 24), (41, 31)], HR[2], hb)
    lb, body = base_body(P, pal); bel = belly_mask(P)
    lbt = P.layer()
    for y in (52, 58, 64): P.fill([(23, y), (25, y), (25, y + 1), (23, y + 1)], hx("#d8ccaa"), lbt, within=bel)
    P.off = ctx.HOFF
    place_face(P, pal)
    for x, y in ((18, 33), (20, 34), (30, 34), (32, 33), (19, 35), (31, 35)): P.px(x, y, mix(pal["skin"], pal["skinD"], 0.8))
    P.line([(22, 38), (27, 38)], mix(pal["skinD"], hx("#000000"), 0.35)); P.px(24, 39, hx("#ffffff")); P.px(26, 39, hx("#ffffff"))   # gap-toothed grin
    hair_front(P, HR, [[(12, 23), (14, 14), (20, 10), (28, 10), (35, 13), (39, 20), (39, 25), (36, 20), (32, 23), (29, 18), (25, 22), (22, 17), (18, 22), (15, 18), (13, 24)]],
               strands=[[(24, 10), (24, 16)], [(18, 12), (15, 18)], [(31, 12), (35, 18)]], shine=[[(17, 12), (23, 10)]], lit=[[(12, 23), (14, 14), (20, 10), (17, 17)]])
    return P.finish()

def garrick():   # retired watchman: bald with grey sides, eyepatch, bristling moustache, old faded watch coat with a medal
    P = Painter()
    pal = ovr_pal({**eye_pal("#3a3a2a", "#6a6a4a", "#9a9a6a", "#c8c898", "#e8e8c8", "#24241a"), "skin": hx("#e0b494"), "skinD": hx("#b08068"),
           **body_pal("#5a5e4a", "#3a3e30", "#6a5a44", "#463a2c", "#b8a070", "#7a6a48", "#24201a")})
    HR = H("#b0acb4", "#908c98", "#605c68", "#d8d4dc")
    lsk = P.layer(); P.skin.add(lsk)
    P.fill([(9, 26), (10, 16), (15, 10), (24, 7), (33, 9), (39, 13), (42, 19), (42, 26)], pal["skin"], lsk)
    P.tone([(32, 9), (39, 13), (42, 19), (42, 26), (36, 26), (36, 15)], pal["skinD"], lsk); P.line([(16, 13), (21, 10)], mix(pal["skin"], hx("#ffffff"), 0.45), lsk)
    hb = P.layer(); P.hair.add(hb)
    P.fill([(9, 32), (7, 27), (9, 22), (13, 20), (14, 26), (12, 30), (14, 34)], HR[1], hb); P.fill([(41, 32), (43, 27), (41, 22), (37, 20), (36, 26), (38, 30), (36, 34)], HR[1], hb)
    hair_back_detail(P, hb, HR, strands=[[(10, 23), (9, 31)], [(40, 23), (41, 31)]], lit=[[(9, 22), (13, 20), (11, 25)]])
    lb, body = base_body(P, pal); bel = belly_mask(P)
    lmed = P.layer(); P.fill([(16, 48), (20, 48), (20, 50), (16, 50)], hx("#6a2a2a"), lmed); P.fill([(16, 51), (20, 51), (19, 55), (17, 55)], hx("#c8a040"), lmed)
    lbt = P.layer()
    for y in (54, 60, 66): P.px(28, y, hx("#b8a070"))
    P.off = ctx.HOFF
    place_face(P, pal)
    lep = P.layer()   # eyepatch over the left eye, strap across the crown
    P.fill([(15, 26), (24, 26), (24, 33), (19, 34), (15, 31)], hx("#1a1614"), lep)
    P.line([(15, 27), (10, 22)], hx("#1a1614"), lep); P.line([(24, 27), (34, 12)], hx("#1a1614"), lep)
    for x in (32, 35): P.line([(x, 35), (x + 1, 37)], pal["skinD"])
    lm = P.layer()   # bristling moustache
    P.fill([(17, 38), (24, 36), (27, 38), (29, 36), (34, 38), (35, 41), (31, 40), (27, 41), (22, 40), (14, 41)], HR[1], lm)
    for x in (18, 22, 26, 30): P.line([(x, 38), (x, 40)], HR[2], lm)
    P.line([(18, 38), (24, 37)], HR[0], lm)
    return P.finish()

def ansel():   # cooper's apprentice: ginger mop, freckled, a smudge of pitch, leather apron, cocky
    P = Painter()
    pal = ovr_pal({**eye_pal("#2a3a1a", "#4a6a2a", "#7a9a4a", "#a8c870", "#d0e8a0", "#1a240e"), "skin": hx("#f6d6c0"), "skinD": hx("#c8a090"),
           **body_pal("#5a4a32", "#33281a", "#6a5a42", "#46382a", "#2a1e14", "#1a120c", "#241a12")})
    HR = H("#b85a30", "#984422", "#5e2814", "#d87a48")
    hb = P.layer(); P.hair.add(hb)
    P.fill([(9, 30), (8, 18), (12, 11), (18, 6), (24, 8), (30, 4), (36, 8), (41, 14), (42, 24), (40, 30)], HR[1], hb)
    hair_back_detail(P, hb, HR, strands=[[(18, 7), (12, 16), (10, 26)], [(30, 5), (38, 12), (40, 22)]], lit=[[(8, 18), (12, 11), (18, 6), (14, 14)]])
    lb, body = base_body(P, pal); bel = belly_mask(P)
    lap = over(P, [(16, 52), (32, 52), (34, 74), (14, 74)], hx("#6a5236"), bel); P.tone([(27, 52), (32, 52), (34, 74), (28, 74)], hx("#4e3c28"), lap)
    for x, y in ((19, 60), (21, 64), (29, 58), (26, 68)): P.px(x, y, hx("#1a120c"))   # pitch stains
    lhoop = over(P, [(31, 64), (38, 62), (39, 70), (32, 72)], hx("#5a5a62"), body); P.line([(32, 65), (38, 63)], hx("#8a8a92"), lhoop)
    P.off = ctx.HOFF
    place_face(P, pal)
    for x, y in ((17, 33), (19, 34), (21, 33), (29, 33), (31, 34), (33, 33)): P.px(x, y, mix(pal["skin"], hx("#b8703a"), 0.6))
    for x, y in ((31, 36), (32, 37), (33, 36)): P.px(x, y, hx("#3a2a1e"))   # pitch smudge
    P.line([(23, 39), (26, 39), (28, 38)], mix(pal["skinD"], hx("#000000"), 0.3))   # smirk
    hair_front(P, HR, [[(11, 24), (13, 14), (19, 9), (27, 8), (34, 10), (39, 16), (41, 25), (37, 20), (34, 24), (30, 16), (25, 22), (20, 15), (16, 23), (13, 19)],
                       [(10, 22), (13, 23), (13, 31), (11, 32)], [(41, 22), (38, 23), (38, 31), (40, 32)]],
               strands=[[(27, 9), (22, 15)], [(30, 10), (32, 18)], [(17, 12), (15, 20)], [(37, 14), (39, 22)]], shine=[[(16, 12), (23, 9)]], lit=[[(11, 24), (13, 14), (19, 9), (16, 16)]])
    return P.finish()

def hester():   # dyer: plum-dyed hair in a long loose braid, stained purple-blue hands, teal wrap, kind
    P = Painter()
    pal = ovr_pal({**eye_pal("#4a2a5a", "#7a4a8a", "#a87ab8", "#d0a8e0", "#f0d8f8", "#2a1a34"), "skin": hx("#f8dcc8"), "skinD": hx("#c8a098"),
           **body_pal("#2a6a6a", "#164242", "#7a5a7a", "#4e3a4e", "#c8b088", "#8a7a5a", "#24181c")})
    HR = H("#7a5a8a", "#5a3a70", "#2e1e40", "#a888c0")
    hb = P.layer(); P.hair.add(hb)
    P.fill([(10, 30), (10, 16), (15, 9), (23, 6), (31, 7), (37, 11), (40, 18), (40, 30)], HR[1], hb)
    for i in range(8):   # long braid over the shoulder
        y = 32 + i * 5; x = 36 + (i // 4)
        P.fill([(x - 2, y), (x + 3, y), (x + 4, y + 4), (x - 1, y + 5)], HR[1], hb); P.line([(x - 1, y + 1), (x + 3, y + 3)], HR[2], hb)
    P.fill([(33, 22), (41, 22), (41, 33), (34, 33)], HR[1], hb); P.line([(37, 24), (37, 32)], HR[2], hb)   # hair gathering into the braid
    lb, body = base_body(P, pal); bel = belly_mask(P)
    lw = over(P, [(11, 44), (37, 44), (35, 56), (13, 56)], hx("#3a8a86"), body); P.tone([(26, 44), (37, 44), (35, 56), (27, 56)], hx("#2a6a66"), lw)
    for x in range(13, 36, 4): P.px(x, 50, hx("#c8b088"))
    lhand = P.layer()   # stained hands clasped at the front
    P.fill([(20, 60), (28, 60), (28, 64), (20, 64)], hx("#6a5a8a"), lhand); P.line([(20, 60), (28, 60)], hx("#8a7aa8"), lhand); P.line([(24, 60), (24, 64)], hx("#4a3a6a"), lhand)
    P.off = ctx.HOFF
    place_face(P, pal)
    P.line([(22, 38), (25, 39), (28, 38)], mix(pal["skinD"], hx("#000000"), 0.3))   # warm smile
    for x in (19, 32): P.px(x, 34, mix(pal["skin"], hx("#d070a0"), 0.35))
    hair_front(P, HR, [[(12, 23), (14, 14), (20, 10), (28, 10), (35, 13), (39, 20), (39, 24), (34, 17), (27, 14), (21, 15), (16, 19), (13, 24)],
                       [(10, 22), (14, 23), (14, 36), (12, 40), (10, 33)]],
               strands=[[(24, 11), (17, 17)], [(28, 11), (36, 18)], [(12, 26), (12, 36)]], shine=[[(17, 12), (24, 10)]], lit=[[(12, 23), (14, 14), (20, 10), (17, 17)]])
    return P.finish()

FOLK = [("Wenna Pike", "Shopkeeper", wenna), ("Mayor (m)", "Mayor", lambda: mayor(False)), ("Mayor (f)", "Mayor", lambda: mayor(True)),
        ("Tomas Reed", "Town watch", tomas), ("Edda Crop-foot", "Farmer", edda), ("Old Maud", "", maud), ("Pip", "Wandering bard", pip),
        ("Joss Carter", "Carter", joss), ("Lenna", "Edda's granddaughter", lenna), ("Old Garrick", "Retired watchman", garrick),
        ("Ansel Tarn", "Cooper's apprentice", ansel), ("Hester Vane", "Dyer", hester)]

if __name__ == "__main__":
    ctx.MODE = "front"; ctx.SRC = None; ctx.HOFF = (0, 0); ctx.BOFF = (0, 0); ctx.OVR = {}
    S = 5
    ims = [(n, r, Image.fromarray(f())) for n, r, f in FOLK]
    cw = ims[0][2].width * S + 30; chh = ims[0][2].height * S + 70
    cols = 6; rows = (len(ims) + cols - 1) // cols
    sheet = Image.new("RGBA", (cw * cols, chh * rows), "#1c1730"); d = ImageDraw.Draw(sheet)
    f1 = ImageFont.load_default(size=22); f2 = ImageFont.load_default(size=16)
    for k, (n, r, im) in enumerate(ims):
        x0, y0 = (k % cols) * cw, (k // cols) * chh
        big = im.resize((im.width * S, im.height * S), Image.NEAREST); sheet.paste(big, (x0 + 15, y0 + 58), big)
        d.text((x0 + cw // 2, y0 + 20), n, fill="#e9d9b4", font=f1, anchor="mm"); d.text((x0 + cw // 2, y0 + 42), r, fill="#9a90a8", font=f2, anchor="mm")
        im.save(f"folk_{n.split()[0].lower().replace('(', '').replace(')', '')}{'_f' if '(f)' in n else ''}.png")
    sheet.save("folk_front.png")
