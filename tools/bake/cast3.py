"""Cast v4: the base sprite's own body (cloak, hood bunch, belly, feet) for everyone - no arms.
Identity comes from hair, face, palette, and details drawn inside the base silhouette."""
from PIL import Image, ImageDraw, ImageFont
import numpy as np
import ctx
from rebase import hx, mix, ROLE, recolor, hair_pal, eye_pal
from cast2 import Painter, place_face, hair_front, hair_back_detail, T, BASE, PX, PY, W, H, INK, FACE_REGION, wren

SRC0 = np.pad(BASE, ((PY, 6), (PX, PX), (0, 0)))
def cur(): return ctx.SRC if ctx.SRC is not None else SRC0
HAIR_ROLES = {"hairA", "hairB", "hairD", "hairHi"}
def base_body(P, pal):
    """Recoloured base body. Hair that overlapped the shoulders becomes hood cloth."""
    lab = P.layer()
    SRC = cur(); rc = recolor(SRC, pal); H, W = SRC.shape[:2]
    P.off = ctx.HOFF; face = P.mask(ctx.R()["face"])
    hx0, hy0 = ctx.HOFF; NK = ctx.R()["neck"]; c0, c1 = ctx.R()["cols"]
    m = np.zeros((H, W), bool)
    for y in range(H):
        for x in range(W):
            if not SRC[y, x, 3] or face[y, x] or y - PY - hy0 < NK: continue
            role = ROLE.get("#%02x%02x%02x" % tuple(SRC[y, x, :3]))
            if role in HAIR_ROLES:
                if c0 <= x - PX - hx0 <= c1 and y - PY - hy0 >= NK + 1: P.c[y, x] = (*pal["outL"], 255)
                else: continue
            elif tuple(SRC[y, x, :3]) == (0, 0, 0) and y - PY - hy0 < NK + 5 and not (c0 <= x - PX - hx0 <= c1): continue
            elif role in ("eye0", "eye1", "eye2", "eye3", "eye4") or tuple(SRC[y, x, :3]) in ((255, 255, 255), (185, 191, 251)): P.c[y, x] = SRC[y, x]   # spell glow keeps its colour
            else: P.c[y, x] = rc[y, x]
            P.lab[y, x] = lab; m[y, x] = True
    return lab, m
def belly_mask(P):
    """Pixels of the base's round belly (hoodie front)."""
    SRC = cur(); H, W = SRC.shape[:2]; m = np.zeros((H, W), bool)
    for y in range(H):
        for x in range(W):
            if SRC[y, x, 3] and ROLE.get("#%02x%02x%02x" % tuple(SRC[y, x, :3])) in ("in", "inD") and y - PY - ctx.BOFF[1] >= 50: m[y, x] = True
    P.off = ctx.BOFF
    return m
def body_pal(outL, out, inn, innD, trim, trimD, boot):
    return {"outL": hx(outL), "out": hx(out), "in": hx(inn), "inD": hx(innD), "trim": hx(trim), "trimD": hx(trimD), "boot": hx(boot)}
def over(P, pts, col, within, lab=None):
    lab = lab or P.layer(); P.fill(pts, col, lab, within=within); return lab

def tessa():
    P = Painter()
    pal = {**eye_pal("#123a26", "#2f7a46", "#5aa85a", "#a8d86a", "#d6f264", "#0e2a1c"), "skin": hx("#ffcfae"), "skinD": hx("#d98a78"),
           **body_pal("#6a7a44", "#3e4a28", "#e8dcbe", "#bca888", "#6a4026", "#4a2a18", "#4a2a1a")}
    pal = {**pal, **ctx.OVR.get('pal', {})}
    HR = (hx("#c4643a"), hx("#a64a2a"), hx("#6a2a18"), hx("#ee9a5e"))
    HR = ctx.OVR.get('HR', HR)
    hb = P.layer(); P.hair.add(hb)
    P.fill([(30, 4), (38, 1), (45, 5), (47, 16), (46, 30), (44, 42), (41, 52), (37, 46), (39, 32), (40, 18), (35, 10)], HR[1], hb)
    P.fill([(7, 26), (8, 14), (14, 7), (23, 4), (32, 4), (40, 9), (43, 17), (43, 27), (41, 33), (13, 35)], HR[1], hb)
    hair_back_detail(P, hb, HR, strands=[[(38, 4), (44, 14), (44, 30), (41, 46)], [(41, 8), (42, 24), (40, 40)], [(36, 12), (39, 24)]], lit=[[(30, 4), (38, 1), (42, 3), (40, 12), (35, 10)]])
    lb, body = base_body(P, pal)
    bel = belly_mask(P)
    # laced leather bodice band across the top of the apron-belly, with criss-cross lacing
    lbo = over(P, [(14, 50), (34, 50), (35, 57), (13, 57)], hx("#6a4026"), bel)
    for y in (52, 55): P.line([(22, y), (26, y)], hx("#e8dcbe"), lbo)
    P.line([(24, 51), (24, 56)], hx("#3a2010"), lbo)
    P.tone([(29, 50), (35, 50), (35, 57), (29, 57)], hx("#4a2a18"), lbo)
    P.off = ctx.HOFF
    place_face(P, pal)
    for x, y in ((21, 34), (23, 35), (33, 34), (35, 33)): P.px(x, y, mix(pal["skin"], pal["skinD"], 0.75))
    for x in (19, 20, 34, 35): P.px(x, 33, mix(pal["skin"], hx("#ff6a70"), 0.4))
    hair_front(P, HR, [
        [(12, 23), (14, 13), (20, 8), (28, 7), (35, 10), (39, 16), (40, 24), (37, 20), (33, 17), (28, 16), (24, 18), (21, 22), (19, 27), (17, 23), (15, 28), (13, 26)],
        [(11, 22), (15, 24), (15, 34), (13, 41), (10, 36)], [(38, 21), (41, 26), (41, 36), (39, 42), (37, 31)]],
        strands=[[(30, 8), (22, 13), (18, 22)], [(34, 11), (26, 15), (20, 25)], [(14, 26), (13, 38)], [(39, 27), (39, 38)], [(37, 14), (39, 21)]],
        shine=[[(20, 10), (26, 9)], [(17, 13), (21, 11)]], lit=[[(12, 22), (14, 13), (22, 8), (20, 14), (15, 22)]])
    lt = P.layer(); P.fill([(33, 4), (37, 3), (38, 7), (34, 8)], hx("#3e6a3a"), lt)
    return P.finish()

def bram():
    P = Painter()
    pal = {**eye_pal("#2a160c", "#6a3e1e", "#9a6430", "#c89048", "#e0b860", "#1a0e08"), "skin": hx("#f2b890"), "skinD": hx("#c07a62"),
           **body_pal("#8a4238", "#5a2624", "#d6ceba", "#a8a08c", "#d6ceba", "#a8a08c", "#2e1e14")}
    pal = {**pal, **ctx.OVR.get('pal', {})}
    HR = (hx("#7e5434"), hx("#5e3e24"), hx("#3a2416"), hx("#a8784c"))
    HR = ctx.OVR.get('HR', HR)
    hb = P.layer(); P.hair.add(hb); P.fill([(6, 31), (4, 22), (6, 14), (4, 10), (10, 10), (12, 5), (18, 6), (21, 2), (26, 5), (32, 2), (34, 7), (40, 6), (40, 11), (45, 14), (43, 19), (45, 26), (42, 32)], HR[1], hb)
    hair_back_detail(P, hb, HR, strands=[[(14, 8), (7, 16), (6, 26)], [(36, 8), (42, 16), (43, 26)], [(22, 4), (19, 8)], [(30, 4), (33, 8)]], lit=[[(4, 10), (10, 10), (12, 5), (18, 6), (15, 11), (7, 15)]])
    lb, body = base_body(P, pal)
    bel = belly_mask(P)
    # apron pocket + bar towel draped on the shoulder
    lpk = over(P, [(19, 62), (29, 62), (29, 67), (19, 67)], hx("#a8a08c"), bel); P.line([(19, 62), (29, 62)], hx("#e8e2d0"), lpk)
    ltw = over(P, [(30, 41), (36, 42), (36, 52), (32, 52)], hx("#eae6dc"), body)
    P.line([(32, 43), (33, 51)], hx("#4a6a9a"), ltw); P.line([(34, 43), (35, 51)], hx("#4a6a9a"), ltw)
    P.off = ctx.HOFF
    place_face(P, pal)
    hf = hair_front(P, HR, [
        [(11, 24), (13, 15), (18, 10), (26, 8), (33, 10), (38, 14), (41, 20), (41, 27), (38, 23), (36, 26), (33, 21), (30, 25), (27, 21), (24, 25), (21, 21), (18, 25), (16, 21), (13, 27)],
        [(10, 24), (14, 26), (16, 35), (12, 36)], [(41, 24), (37, 26), (36, 34), (40, 35)],
        [(15, 33), (20, 36), (25, 37), (31, 37), (36, 35), (38, 32), (39, 37), (36, 42), (32, 45), (27, 46), (20, 45), (15, 42), (14, 37)]],
        strands=[[(26, 9), (21, 16), (19, 23)], [(32, 11), (31, 19), (31, 23)], [(38, 15), (39, 24)], [(15, 16), (14, 24)], [(18, 37), (19, 42)], [(26, 41), (26, 45)], [(31, 40), (31, 44)], [(36, 37), (35, 41)], [(22, 38), (22, 44)]],
        shine=[[(18, 13), (24, 11)], [(18, 36), (22, 38)]], lit=[[(11, 24), (13, 15), (20, 10), (17, 17), (13, 24)]])
    P.line([(22, 39), (26, 40), (30, 40), (32, 39)], INK); P.line([(21, 38), (26, 38)], HR[0], hf); P.line([(30, 38), (33, 38)], HR[0], hf)
    return P.finish()

def kellan():
    P = Painter()
    pal = {**eye_pal("#1a2a4a", "#3a6aa8", "#7aa8d8", "#c0dcf4", "#eaf6ff", "#10182a"), "skin": hx("#f6dccc"), "skinD": hx("#c09aa0"),
           **body_pal("#4a3a68", "#261c38", "#2e2838", "#16121c", "#d4a840", "#8a6a20", "#141018")}
    pal = {**pal, **ctx.OVR.get('pal', {})}
    HR = (hx("#34344c"), hx("#20202e"), hx("#0c0c14"), hx("#6a6a90"))
    HR = ctx.OVR.get('HR', HR)
    hb = P.layer(); P.hair.add(hb); P.fill([(9, 30), (8, 18), (12, 9), (20, 4), (30, 3), (39, 7), (45, 14), (46, 24), (45, 34), (41, 44), (38, 38), (38, 28), (13, 32)], HR[1], hb)
    hair_back_detail(P, hb, HR, strands=[[(14, 12), (11, 22), (11, 30)], [(40, 14), (42, 26), (41, 38)]])
    lb, body = base_body(P, pal)
    bel = belly_mask(P)
    # gold buttons down the coat front, a white cravat at the throat
    lbt = P.layer()
    for y in (55, 60, 65): P.fill([(23, y), (25, y), (25, y + 2), (23, y + 2)], hx("#d4a840"), lbt, within=bel); P.px(24, y + 1, hx("#8a6a20"))
    lcr = over(P, [(21, 42), (27, 42), (26, 47), (24, 49), (22, 47)], hx("#e6e2ee"), body)
    P.line([(24, 44), (24, 48)], hx("#a8a2b8"), lcr)
    P.off = ctx.HOFF
    place_face(P, pal)
    hair_front(P, HR, [[(11, 28), (12, 15), (18, 9), (26, 6), (35, 8), (41, 14), (43, 26), (42, 36), (40, 43), (37, 38), (38, 30), (35, 25), (29, 23), (24, 23), (19, 25), (14, 29)]],
        strands=[[(15, 22), (20, 13), (30, 9), (39, 15)], [(20, 20), (28, 14), (37, 18), (40, 30)], [(28, 19), (35, 22), (38, 34)]],
        shine=[[(18, 11), (27, 7)], [(20, 13), (28, 10)]], lit=[[(12, 24), (13, 15), (20, 9), (17, 16)]])
    P.line([(31, 23), (34, 33)], pal["skinD"])
    return P.finish()

def companion():
    P = Painter()
    pal = {**eye_pal("#3a2410", "#7a5420", "#b08038", "#d8a850", "#f0d070", "#24160a"), "skin": hx("#c88e68"), "skinD": hx("#8e5a40"),
           **body_pal("#5c606c", "#30333c", "#6a4a30", "#4a3220", "#3a2818", "#241810", "#2a1e18")}
    pal = {**pal, **ctx.OVR.get('pal', {})}
    hood = T(ctx.OVR.get("hood", "#4c5058")); sc = T(ctx.OVR.get("scarf", "#3c4a44"))
    lh = P.layer(); P.fill([(5, 42), (2, 28), (5, 15), (11, 7), (20, 3), (28, 3), (37, 7), (43, 15), (46, 28), (43, 42)], hood[1], lh)
    P.tone([(26, 3), (36, 7), (42, 15), (45, 28), (42, 42), (36, 42), (38, 20)], hood[2], lh); P.tone([(6, 42), (3, 28), (6, 15), (12, 7), (14, 10), (9, 24), (10, 42)], hood[0], lh)
    lb, body = base_body(P, pal)
    bel = belly_mask(P)
    # stitched leather chest + a belt with a buckle
    lst = P.layer()
    for y in range(55, 72, 4): P.line([(16, y), (32, y)], hx("#4a3220"), lst)
    P.lab[P.lab == lst] = lb
    lbelt = over(P, [(12, 62), (36, 62), (36, 64), (12, 64)], hx("#2a1c12"), body)
    P.fill([(22, 61), (26, 61), (26, 65), (22, 65)], hx("#9a8a62"), lbelt, within=body)
    P.off = ctx.HOFF
    place_face(P, pal)
    lsc = P.layer(); P.fill([(14, 33), (39, 31), (40, 38), (36, 45), (28, 47), (18, 46), (13, 40)], sc[1], lsc)
    P.tone([(30, 32), (39, 31), (40, 38), (36, 45), (30, 46)], sc[2], lsc); P.line([(16, 37), (37, 35)], sc[0], lsc); P.line([(18, 42), (34, 40)], sc[2], lsc)
    lr = P.layer(); P.fill([(11, 29), (13, 21), (20, 17), (28, 17), (35, 19), (40, 25), (41, 31), (36, 25), (28, 22), (20, 22), (14, 26)], hood[0], lr)
    P.tone([(28, 13), (34, 15), (38, 21), (39, 27), (35, 21), (28, 18)], hood[1], lr)
    for x in range(16, 37):
        for y in range(20, 27):
            yy, xx = y + PY + ctx.HOFF[1], x + PX + ctx.HOFF[0]
            if P.lab[yy, xx] and P.lab[yy, xx] < lr and P.lab[yy - 1, xx] == lr: P.c[yy, xx] = (*pal["skinD"], 255)
    return P.finish()

def mentor():
    P = Painter()
    pal = {**eye_pal("#2a3a4a", "#4a6a8a", "#8ab0d0", "#c0dcf0", "#e0f0ff", "#1a2430"), "skin": hx("#f2c4a2"), "skinD": hx("#c08870"),
           **body_pal("#3e4a6e", "#222a44", "#7a3434", "#4e2020", "#d4a840", "#8a6a20", "#2a2018")}
    pal = {**pal, **ctx.OVR.get('pal', {})}
    HR = (hx("#eceaf0"), hx("#cfcbd6"), hx("#8a8494"), hx("#ffffff"))
    HR = ctx.OVR.get('HR', HR)
    hb = P.layer(); P.hair.add(hb)
    P.fill([(6, 44), (7, 26), (10, 18), (15, 16), (16, 30), (14, 40), (10, 46)], HR[1], hb); P.fill([(42, 44), (41, 26), (38, 18), (33, 16), (33, 30), (35, 40), (38, 46)], HR[1], hb)
    hair_back_detail(P, hb, HR, strands=[[(9, 24), (8, 36), (8, 48)], [(12, 22), (13, 40)], [(39, 24), (40, 36), (40, 48)], [(36, 22), (35, 40)]])
    lb, body = base_body(P, pal)
    bel = belly_mask(P)
    P.off = ctx.HOFF
    place_face(P, pal, closed=True)
    lsc = P.layer(); P.fill([(9, 25), (10, 17), (15, 11), (24, 8), (33, 9), (39, 12), (42, 18), (42, 25)], pal["skin"], lsc)
    P.tone([(32, 9), (39, 12), (42, 18), (42, 25), (36, 25), (36, 15)], pal["skinD"], lsc); P.line([(16, 13), (21, 10)], mix(pal["skin"], (255, 255, 255), 0.5), lsc)
    hf = hair_front(P, HR, [
        [(18, 26), (24, 25), (24, 26), (18, 27)], [(31, 26), (37, 25), (37, 26), (31, 27)],
        [(12, 22), (16, 21), (16, 32), (13, 36)], [(37, 21), (40, 22), (40, 34), (37, 32)],
        [(14, 32), (20, 35), (28, 36), (34, 35), (39, 31), (39, 40), (36, 47), (32, 52), (27, 55), (21, 51), (16, 45), (13, 39)]],
        strands=[[(19, 38), (21, 48)], [(27, 40), (27, 53)], [(33, 38), (31, 49)], [(36, 36), (36, 44)], [(15, 37), (16, 43)]],
        shine=[[(19, 36), (25, 38)], [(31, 38), (35, 36)]], lit=[[(14, 32), (20, 35), (26, 36), (23, 44), (16, 44)]])
    P.line([(22, 39), (27, 40), (31, 39)], HR[2], hf)
    return P.finish()

CAST4 = [("Wren (you)", wren), ("Tessa", tessa), ("Bram", bram), ("Kellan Vex", kellan), ("Hooded companion", companion), ("Old mentor", mentor)]
if __name__ == "__main__":
    S = 6
    ims = [(n, Image.fromarray(f())) for n, f in CAST4]
    cw = max(i.width for _, i in ims) * S + 40; ch = max(i.height for _, i in ims) * S + 70
    sheet = Image.new("RGBA", (cw * len(ims), ch), "#1c1730"); d = ImageDraw.Draw(sheet); f = ImageFont.load_default(size=26)
    for k, (n, im) in enumerate(ims):
        im.save(f"c4_{n.split()[0].lower()}.png")
        big = im.resize((im.width * S, im.height * S), Image.NEAREST); sheet.paste(big, (k * cw + 20, 50), big)
        d.text((k * cw + cw // 2, 24), n, fill="#e9d9b4", font=f, anchor="mm")
    sheet.save("cast_v4.png")
