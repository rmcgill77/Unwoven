"""Cast v3: each character keeps the craftpix base face + eyes, with their own hair and clothes
drawn in the sprite's conventions: black lines where shapes meet, 2-3 flat tones per material,
dark strand lines inside hair, black outer outline."""
from PIL import Image, ImageDraw, ImageFont
import numpy as np
import ctx
from rebase import hx, mix, ROLE, recolor, hair_pal, eye_pal, build as build_v2, CAST as CAST_V2
BASE = np.array(Image.open("base_front.png").convert("RGBA"))
PX, PY = 6, 2
W, H = BASE.shape[1] + PX * 2, BASE.shape[0] + PY + 6
INK = (0, 0, 0)
NB = ((1, 0), (-1, 0), (0, 1), (0, -1))

class Painter:
    def __init__(self):
        self.H, self.W = (ctx.SRC.shape[:2] if ctx.SRC is not None else (H, W)); H_, W_ = self.H, self.W
        self.c = np.zeros((H_, W_, 4), np.uint8); self.lab = np.zeros((H_, W_), np.int32); self.n = 0; self.hair = set(); self.skin = set(); self.off = ctx.HOFF
    def layer(self):
        self.n += 1; return self.n
    def mask(self, pts):
        im = Image.new("L", (self.W, self.H), 0); ox, oy = self.off; ImageDraw.Draw(im).polygon([(x + PX + ox, y + PY + oy) for x, y in pts], fill=1); return np.array(im).astype(bool)
    def fill(self, pts, col, lab, within=None):
        m = self.mask(pts)
        if within is not None: m &= within
        self.c[m] = (*col, 255); self.lab[m] = lab; return m
    def tone(self, pts, col, lab):   # recolour only pixels already in this layer (shading inside a shape)
        m = self.mask(pts) & (self.lab == lab); self.c[m] = (*col, 255); return m
    def line(self, pts, col, lab=None, width=1):
        im = Image.new("L", (self.W, self.H), 0); ox, oy = self.off; ImageDraw.Draw(im).line([(x + PX + ox, y + PY + oy) for x, y in pts], fill=1, width=width); m = np.array(im).astype(bool)
        if lab is not None: m &= self.lab == lab
        self.c[m] = (*col, 255)
        if lab is None: self.lab[m] = max(self.lab.max(), 1)
    def px(self, x, y, col):
        yy, xx = int(round(y)) + PY + self.off[1], int(round(x)) + PX + self.off[0]
        if 0 <= yy < self.H and 0 <= xx < self.W: self.c[yy, xx] = (*col, 255)
    def finish(self, noline=()):
        c, lab = self.c, self.lab
        H, W = self.H, self.W
        isblack = lambda y, x: c[y, x, 3] > 0 and c[y, x, 0] == 0 and c[y, x, 1] == 0 and c[y, x, 2] == 0
        ink = []
        for y in range(H):
            for x in range(W):
                if not lab[y, x] or isblack(y, x): continue
                for dy, dx in NB:
                    yy, xx = y + dy, x + dx
                    if 0 <= yy < H and 0 <= xx < W and lab[yy, xx] and lab[yy, xx] > lab[y, x] and not isblack(yy, xx) and not (lab[y, x] in self.hair and lab[yy, xx] in self.hair) and not (lab[y, x] in self.skin and lab[yy, xx] in self.skin) and (lab[y, x], lab[yy, xx]) not in noline and (lab[yy, xx], lab[y, x]) not in noline:
                        ink.append((y, x)); break
        for y, x in ink: c[y, x] = (*INK, 255)
        # one-pixel lines only: drop ink that doubles up behind another ink pixel
        for y in range(1, H - 1):
            for x in range(1, W - 1):
                if isblack(y, x) and (y, x) in set() : pass
        op = c[:, :, 3] > 0
        add = [(y, x) for y in range(H) for x in range(W) if not op[y, x] and any(0 <= y + dy < H and 0 <= x + dx < W and op[y + dy, x + dx] and not isblack(y + dy, x + dx) for dy, dx in NB)]
        for y, x in add: c[y, x] = (*INK, 255)
        # thin any 2-px black runs on the silhouette: a black pixel with no solid colour neighbour is redundant
        H_, W_ = self.H, self.W
        drop = [(y, x) for y in range(H_) for x in range(W_) if isblack(y, x) and not any(0 <= y + dy < H_ and 0 <= x + dx < W_ and c[y + dy, x + dx, 3] and not isblack(y + dy, x + dx) for dy, dx in NB)]
        for y, x in drop: c[y, x, 3] = 0
        return c

FACE_REGION = [(14, 24), (18, 19), (30, 17), (37, 21), (39, 30), (38, 37), (33, 40), (31, 41), (21, 41), (17, 38), (14, 34)]
SKIN_COLS = {hx("#ffc2a1"), hx("#bd6a62")}
def place_face(P, pal, closed=False):
    FACE_REGION = ctx.R()["face"]; (lx0, lx1), (lx2, lx3), (ly0, ly1) = ctx.R()["lash"]
    """Base face pixels (skin, eyes, lashes) recoloured to the character; forehead filled with skin."""
    lab = P.layer(); P.skin.add(lab)
    P.off = ctx.HOFF
    reg = P.mask(FACE_REGION)
    src = ctx.SRC if ctx.SRC is not None else np.pad(BASE, ((PY, 6), (PX, PX), (0, 0)))
    rc = recolor(src, pal)
    hx0, hy0 = ctx.HOFF
    H, W = src.shape[:2]
    sk, skD = pal["skin"], pal["skinD"]
    for y in range(H):
        for x in range(W):
            if not reg[y, x]: continue
            col = tuple(src[y, x, :3]); a = src[y, x, 3]
            role = ROLE.get("#%02x%02x%02x" % col)
            is_eye = a and (role in ("eye0", "eye1", "eye2", "eye3", "eye4") or col in ((255, 255, 255), (185, 191, 251)) or (col == hx("#3b1725") and y - PY - hy0 < 40))
            is_skin = a and col in SKIN_COLS
            is_lash = a and col == (0, 0, 0) and ly0 <= y - PY - hy0 <= ly1 and (lx0 <= x - PX - hx0 <= lx1 or lx2 <= x - PX - hx0 <= lx3)
            yb = y - PY - hy0
            if closed and (is_eye or is_lash): P.c[y, x] = (*sk, 255)
            elif is_eye or is_skin or is_lash: P.c[y, x] = rc[y, x]
            elif a and col == (0, 0, 0) and yb >= ctx.R()["jaw"]: P.c[y, x] = (0, 0, 0, 255)   # keep the sprite's own jaw/chin line
            elif yb < ctx.R()["fore"]: P.c[y, x] = (*sk, 255)                                   # forehead under the hair
            else: continue
            P.lab[y, x] = lab
    if closed:
        for x0, y0 in ctx.R()["closed"]: P.line([(x0, y0), (x0 + 1, y0 + 1), (x0 + 4, y0 + 1), (x0 + 5, y0)], INK, lab)
    return lab

def hair_set(P, H_, back, front, strands=(), shine=(), locks=()):
    """H_ = (light, base, dark, highlight)."""
    A, B, D, Hi = H_
    lb = P.layer() if back else None
    if back:
        for pts in back: P.fill(pts, B, lb, within=P.lab == 0)
    return lb
def hair_front(P, H_, front, strands=(), shine=(), lit=()):
    A, B, D, Hi = H_
    lf = P.layer(); P.hair.add(lf)
    for pts in front: P.fill(pts, B, lf)
    for pts in lit: P.tone(pts, A, lf)
    for s in strands: P.line(s, D, lf)
    for s in shine: P.line(s, Hi, lf)
    return lf
def hair_back_detail(P, lab, H_, strands=(), lit=()):
    A, B, D, Hi = H_
    P.hair.add(lab)
    for pts in lit: P.tone(pts, A, lab)
    for s in strands: P.line(s, D, lab)

def T(c):  # three tones from a mid colour
    b = hx(c); return (mix(b, (255, 255, 255), 0.22), b, mix(b, (0, 0, 0), 0.32))

def tessa():
    P = Painter()
    pal = {**hair_pal("#9a4426", "#b4552e", "#6a2a18", "#e08a50"), **eye_pal("#123a26", "#2f7a46", "#5aa85a", "#a8d86a", "#d6f264", "#0e2a1c"), "skin": hx("#ffcfae"), "skinD": hx("#d98a78")}
    HR = (hx("#c4643a"), hx("#a64a2a"), hx("#6a2a18"), hx("#ee9a5e"))
    # ponytail + skull behind
    hb = P.layer()
    P.fill([(30, 4), (38, 1), (45, 5), (47, 16), (46, 30), (44, 42), (41, 52), (37, 46), (39, 32), (40, 18), (35, 10)], HR[1], hb)
    P.fill([(9, 26), (10, 14), (15, 7), (23, 4), (31, 4), (38, 9), (41, 17), (41, 27), (39, 33), (14, 35)], HR[1], hb)
    hair_back_detail(P, hb, HR, strands=[[(38, 4), (44, 14), (44, 30), (41, 46)], [(41, 8), (42, 24), (40, 40)], [(36, 12), (39, 24)]], lit=[[(30, 4), (38, 1), (42, 3), (40, 12), (35, 10)]])
    # skirt, bodice, blouse, arms, boots
    sk = T("#4f6a3a"); bd = T("#6a4026"); bl = T("#e8dcc0"); bt = T("#4a2c1c"); skin = pal["skin"], pal["skinD"]
    lb = P.layer()
    for pts, c in [([(15, 70), (21, 70), (21, 76), (14, 76)], bt[1]), ([(27, 70), (33, 70), (34, 76), (27, 76)], bt[1])]: P.fill(pts, c, lb)
    P.tone([(14, 70), (21, 70), (21, 72), (14, 72)], bt[0], lb); P.tone([(27, 70), (34, 70), (34, 72), (27, 72)], bt[0], lb)
    la = P.layer()
    P.fill([(8, 48), (13, 48), (13, 58), (9, 58)], skin[0], la); P.fill([(35, 48), (40, 48), (39, 58), (35, 58)], skin[1], la)
    ls = P.layer()
    P.fill([(14, 55), (34, 55), (39, 71), (9, 71)], sk[1], ls)
    P.tone([(26, 55), (34, 55), (39, 71), (28, 71)], sk[2], ls); P.tone([(14, 55), (18, 55), (13, 71), (9, 71)], sk[0], ls)
    for x0, x1 in ((19, 17), (24, 24), (29, 31)): P.line([(x0, 58), (x1, 70)], sk[2], ls)
    lbo = P.layer()
    P.fill([(16, 44), (32, 44), (33, 57), (15, 57)], bd[1], lbo); P.tone([(27, 44), (32, 44), (33, 57), (28, 57)], bd[2], lbo)
    for i in range(4): y = 46 + i * 3; P.line([(22, y), (26, y + 2)], bl[0], lbo); P.line([(26, y), (22, y + 2)], bl[0], lbo)
    lbl = P.layer()
    P.fill([(14, 39), (34, 39), (36, 46), (31, 46), (17, 46), (12, 46)], bl[1], lbl)
    P.fill([(8, 42), (15, 40), (16, 48), (11, 50), (7, 47)], bl[1], lbl); P.fill([(33, 40), (40, 42), (41, 47), (37, 50), (32, 48)], bl[2], lbl)
    P.tone([(30, 39), (34, 39), (36, 46), (31, 46)], bl[2], lbl); P.line([(10, 45), (14, 43)], bl[0], lbl)
    lp = P.layer(); P.fill([(31, 56), (36, 56), (36, 61), (31, 61)], bd[1], lp); P.line([(31, 57), (36, 57)], bd[0], lp)
    place_face(P, pal)
    # freckles + blush
    for x, y in ((21, 34), (23, 35), (33, 34), (35, 33)): P.px(x, y, mix(pal["skin"], pal["skinD"], 0.75))
    for x in (19, 20, 34, 35): P.px(x, 33, mix(pal["skin"], hx("#ff6a70"), 0.4))
    # bangs + face framing locks + hair tie
    hair_front(P, HR, [
        [(12, 23), (14, 13), (20, 8), (28, 7), (35, 10), (39, 16), (40, 24), (37, 20), (33, 17), (28, 16), (24, 18), (21, 22), (19, 27), (17, 23), (15, 28), (13, 26)],
        [(11, 22), (15, 24), (15, 34), (13, 41), (10, 36)], [(38, 21), (41, 26), (41, 36), (39, 42), (37, 31)]],
        strands=[[(30, 8), (22, 13), (18, 22)], [(34, 11), (26, 15), (20, 25)], [(14, 26), (13, 38)], [(39, 27), (39, 38)], [(37, 14), (39, 21)]],
        shine=[[(20, 10), (26, 9)], [(17, 13), (21, 11)]], lit=[[(12, 22), (14, 13), (22, 8), (20, 14), (15, 22)]])
    lt = P.layer(); P.fill([(33, 4), (37, 3), (38, 7), (34, 8)], hx("#3e6a3a"), lt)
    return P.finish()

def bram():
    P = Painter()
    pal = {**eye_pal("#2a160c", "#6a3e1e", "#9a6430", "#c89048", "#e0b860", "#1a0e08"), "skin": hx("#f2b890"), "skinD": hx("#c07a62")}
    HR = (hx("#7e5434"), hx("#5e3e24"), hx("#3a2416"), hx("#a8784c"))
    hb = P.layer(); P.fill([(12, 24), (10, 15), (14, 12), (14, 6), (20, 7), (23, 2), (28, 6), (34, 3), (35, 9), (40, 10), (40, 18), (42, 27), (14, 27)], HR[1], hb)
    hair_back_detail(P, hb, HR, strands=[[(16, 9), (13, 14)], [(24, 4), (24, 8)], [(34, 6), (37, 12)]], lit=[[(10, 15), (14, 12), (14, 6), (20, 7), (18, 12)]])
    sh = T("#e6dcc4"); vest = T("#5a3a26"); ap = T("#c8c0ae"); tr = T("#4a3428"); bt = T("#2e1e14"); skin = pal["skin"], pal["skinD"]
    lb = P.layer(); P.fill([(14, 73), (22, 73), (22, 77), (13, 77)], bt[1], lb); P.fill([(26, 73), (34, 73), (35, 77), (26, 77)], bt[1], lb)
    lt = P.layer(); P.fill([(14, 66), (22, 66), (22, 74), (14, 74)], tr[1], lt); P.fill([(26, 66), (34, 66), (34, 74), (26, 74)], tr[2], lt)
    la = P.layer()
    P.fill([(4, 50), (10, 50), (10, 59), (5, 59)], skin[0], la); P.fill([(38, 50), (44, 50), (43, 59), (38, 59)], skin[1], la)
    for x, y in ((6, 53), (8, 55), (40, 53), (42, 56)): P.px(x, y, mix(skin[0], HR[1], 0.5))
    lsh = P.layer()
    P.fill([(11, 39), (37, 39), (40, 50), (39, 68), (9, 68), (8, 50)], sh[1], lsh)
    P.fill([(4, 44), (11, 40), (12, 51), (4, 51)], sh[1], lsh); P.fill([(44, 44), (37, 40), (36, 51), (44, 51)], sh[2], lsh)
    P.tone([(4, 49), (12, 49), (12, 51), (4, 51)], sh[0], lsh); P.tone([(36, 49), (44, 49), (44, 51), (36, 51)], sh[0], lsh)
    lv = P.layer()
    P.fill([(11, 41), (19, 43), (19, 67), (9, 67), (8, 50)], vest[1], lv); P.fill([(37, 41), (29, 43), (29, 67), (39, 67), (40, 50)], vest[2], lv)
    for y in (50, 56, 62): P.px(17, y, hx("#c8a040"))
    lap = P.layer()
    P.fill([(17, 50), (31, 50), (33, 72), (15, 72)], ap[1], lap); P.tone([(27, 50), (31, 50), (33, 72), (28, 72)], ap[2], lap)
    P.line([(17, 50), (31, 50)], ap[0], lap); P.line([(21, 54), (20, 70)], ap[2], lap); P.line([(26, 55), (27, 70)], ap[2], lap)
    P.line([(18, 50), (20, 41)], ap[1]); P.line([(30, 50), (28, 41)], ap[1])
    ltw = P.layer(); P.fill([(31, 38), (38, 40), (38, 52), (34, 53), (33, 43)], hx("#eae6dc"), ltw)
    P.line([(34, 41), (36, 52)], hx("#4a6a9a"), ltw); P.line([(36, 41), (37, 51)], hx("#4a6a9a"), ltw)
    place_face(P, pal)
    # sideburns and beard over the jaw
    hf = hair_front(P, HR, [
        [(13, 23), (15, 14), (21, 10), (29, 10), (35, 13), (38, 19), (38, 24), (35, 20), (31, 22), (28, 18), (25, 22), (22, 18), (19, 23), (16, 20), (14, 24)],
        [(13, 22), (16, 22), (16, 31), (14, 33)], [(37, 22), (39, 24), (39, 33), (37, 31)],
        [(14, 31), (18, 35), (22, 37), (30, 37), (35, 34), (39, 31), (40, 39), (37, 46), (31, 50), (25, 51), (19, 49), (15, 45), (13, 39)]],
        strands=[[(25, 11), (21, 17)], [(30, 12), (31, 19)], [(17, 37), (19, 46)], [(24, 41), (24, 49)], [(30, 40), (30, 48)], [(36, 37), (34, 45)], [(21, 38), (22, 47)]],
        shine=[[(18, 13), (24, 11)], [(17, 36), (21, 38)]], lit=[[(13, 22), (15, 14), (22, 10), (19, 17), (15, 22)]])
    P.line([(21, 39), (24, 40), (28, 40), (31, 39)], INK); P.line([(20, 38), (24, 38)], HR[0], hf); P.line([(28, 38), (32, 38)], HR[0], hf)
    return P.finish()

def kellan():
    P = Painter()
    pal = {**eye_pal("#1a2a4a", "#3a6aa8", "#7aa8d8", "#c0dcf4", "#eaf6ff", "#10182a"), "skin": hx("#f6dccc"), "skinD": hx("#c09aa0")}
    HR = (hx("#34344c"), hx("#20202e"), hx("#0c0c14"), hx("#6a6a90"))
    hb = P.layer(); P.fill([(10, 30), (9, 18), (13, 9), (20, 4), (30, 3), (38, 7), (43, 14), (44, 24), (43, 34), (40, 44), (37, 38), (37, 28), (14, 32)], HR[1], hb)
    hair_back_detail(P, hb, HR, strands=[[(14, 12), (11, 22), (11, 30)], [(40, 14), (42, 26), (41, 38)]])
    ct = T("#3a2c52"); g = (hx("#e8c060"), hx("#c8a040"), hx("#8a6a20")); bt = T("#1a141e")
    lb = P.layer(); P.fill([(15, 72), (21, 72), (21, 77), (14, 77)], bt[1], lb); P.fill([(27, 72), (33, 72), (34, 77), (27, 77)], bt[1], lb)
    lc = P.layer()
    P.fill([(12, 42), (36, 42), (38, 56), (41, 74), (7, 74), (10, 56)], ct[1], lc)
    P.tone([(26, 42), (36, 42), (38, 56), (41, 74), (27, 74)], ct[2], lc); P.tone([(12, 42), (15, 42), (11, 60), (8, 74), (7, 74), (10, 56)], ct[0], lc)
    P.line([(24, 50), (24, 74)], ct[2], lc); P.line([(24, 64), (22, 74)], INK, lc)
    for y in (53, 58, 63): P.px(22, y, g[0]); P.px(22, y + 1, g[2])
    lbelt = P.layer(); P.fill([(10, 56), (38, 56), (38, 58), (10, 58)], hx("#141018"), lbelt); P.fill([(22, 55), (26, 55), (26, 59), (22, 59)], g[1], lbelt)
    lsh = P.layer(); P.fill([(21, 42), (27, 42), (24, 50)], hx("#e6e2ee"), lsh)
    lgl = P.layer(); P.fill([(7, 54), (11, 54), (11, 59), (8, 59)], hx("#16121c"), lgl); P.fill([(37, 54), (41, 54), (40, 59), (37, 59)], hx("#16121c"), lgl)
    lm = P.layer()
    P.fill([(8, 41), (16, 39), (18, 46), (12, 53), (7, 50)], ct[1], lm); P.fill([(40, 41), (32, 39), (30, 46), (36, 53), (41, 50)], ct[2], lm)
    P.line([(7, 50), (12, 53), (18, 46)], g[1], lm); P.line([(41, 50), (36, 53), (30, 46)], g[1], lm)
    lco = P.layer()
    P.fill([(14, 37), (20, 35), (24, 42), (28, 35), (34, 37), (35, 44), (28, 46), (24, 50), (20, 46), (13, 44)], ct[0], lco)
    P.tone([(24, 42), (28, 35), (34, 37), (35, 44), (28, 46), (24, 50)], ct[1], lco); P.line([(13, 44), (20, 46), (24, 50)], g[1], lco)
    place_face(P, pal)
    hair_front(P, HR, [[(12, 24), (13, 15), (18, 9), (26, 6), (34, 8), (40, 14), (42, 22), (41, 32), (39, 39), (36, 34), (37, 26), (34, 21), (29, 19), (24, 19), (19, 21), (15, 25)]],
        strands=[[(15, 22), (20, 13), (30, 9), (39, 15)], [(20, 20), (28, 14), (37, 18), (40, 30)], [(28, 19), (35, 22), (38, 34)]],
        shine=[[(18, 11), (27, 7)], [(20, 13), (28, 10)]], lit=[[(12, 24), (13, 15), (20, 9), (17, 16)]])
    P.line([(31, 23), (34, 33)], pal["skinD"])   # scar
    return P.finish()

def companion():
    P = Painter()
    pal = {**eye_pal("#3a2410", "#7a5420", "#b08038", "#d8a850", "#f0d070", "#24160a"), "skin": hx("#c88e68"), "skinD": hx("#8e5a40")}
    hood = T("#4c5058"); lea = T("#6a4a30"); sc = T("#3c4a44"); bt = T("#2a1e18")
    lh = P.layer(); P.fill([(6, 42), (3, 28), (6, 15), (12, 7), (20, 3), (28, 3), (36, 7), (42, 15), (45, 28), (42, 42)], hood[1], lh)
    P.tone([(26, 3), (36, 7), (42, 15), (45, 28), (42, 42), (36, 42), (38, 20)], hood[2], lh); P.tone([(6, 42), (3, 28), (6, 15), (12, 7), (14, 10), (9, 24), (10, 42)], hood[0], lh)
    lb = P.layer(); P.fill([(15, 72), (21, 72), (21, 77), (14, 77)], bt[1], lb); P.fill([(27, 72), (33, 72), (34, 77), (27, 77)], bt[1], lb)
    lc = P.layer()
    P.fill([(9, 40), (39, 40), (42, 58), (43, 74), (5, 74), (7, 58)], hood[1], lc)
    P.tone([(28, 40), (39, 40), (42, 58), (43, 74), (31, 74)], hood[2], lc)
    for x in (10, 36, 39): P.line([(x, 56), (x - 1, 73)], hood[2], lc)
    la = P.layer(); P.fill([(18, 44), (30, 44), (31, 70), (17, 70)], lea[1], la); P.tone([(26, 44), (30, 44), (31, 70), (27, 70)], lea[2], la)
    for y in range(47, 68, 4): P.line([(19, y), (29, y)], lea[2], la)
    lbelt = P.layer(); P.fill([(15, 58), (33, 58), (33, 61), (15, 61)], hx("#3a2818"), lbelt); P.fill([(22, 57), (26, 57), (26, 62), (22, 62)], hx("#9a8a62"), lbelt)
    lk = P.layer(); P.fill([(30, 60), (33, 60), (34, 68), (31, 68)], hx("#2a2018"), lk); P.px(31, 59, hx("#b0a890")); P.px(32, 59, hx("#b0a890"))
    lp = P.layer(); P.fill([(7, 42), (17, 40), (18, 48), (10, 51), (6, 48)], lea[1], lp); P.line([(8, 47), (17, 44)], lea[0], lp); P.line([(7, 49), (12, 47)], lea[2], lp)
    place_face(P, pal)
    lsc = P.layer(); P.fill([(14, 33), (39, 31), (40, 38), (36, 45), (28, 47), (18, 46), (13, 40)], sc[1], lsc)
    P.tone([(30, 32), (39, 31), (40, 38), (36, 45), (30, 46)], sc[2], lsc); P.line([(16, 37), (37, 35)], sc[0], lsc); P.line([(18, 42), (34, 40)], sc[2], lsc)
    lr = P.layer(); P.fill([(12, 25), (14, 17), (20, 13), (28, 13), (34, 15), (38, 21), (39, 27), (35, 21), (28, 18), (20, 18), (15, 22)], hood[0], lr)
    P.tone([(28, 13), (34, 15), (38, 21), (39, 27), (35, 21), (28, 18)], hood[1], lr)
    for x in range(16, 37):   # shadow under the brim
        for y in range(20, 27):
            yy, xx = y + PY, x + PX
            if P.lab[yy, xx] and P.lab[yy, xx] < lr and P.lab[yy - 1, xx] == lr: P.c[yy, xx] = (*pal["skinD"], 255)
    return P.finish()

def mentor():
    P = Painter()
    pal = {**eye_pal("#2a3a4a", "#4a6a8a", "#8ab0d0", "#c0dcf0", "#e0f0ff", "#1a2430"), "skin": hx("#f2c4a2"), "skinD": hx("#c08870")}
    HR = (hx("#eceaf0"), hx("#cfcbd6"), hx("#8a8494"), hx("#ffffff"))
    hb = P.layer()
    P.fill([(5, 50), (7, 26), (10, 18), (15, 16), (16, 30), (15, 42), (11, 52)], HR[1], hb); P.fill([(43, 50), (41, 26), (38, 18), (33, 16), (33, 30), (34, 42), (38, 52)], HR[1], hb)
    hair_back_detail(P, hb, HR, strands=[[(9, 24), (8, 36), (8, 48)], [(12, 22), (13, 40)], [(39, 24), (40, 36), (40, 48)], [(36, 22), (35, 40)]])
    rb = T("#2e3a5a"); st = T("#8a3434"); g = (hx("#eac870"), hx("#c8a040"), hx("#8a6a20"))
    lf = P.layer(); P.fill([(15, 74), (21, 74), (21, 77), (14, 77)], hx("#3a2a1c"), lf); P.fill([(27, 74), (33, 74), (34, 77), (27, 77)], hx("#3a2a1c"), lf)
    lr = P.layer()
    P.fill([(11, 40), (37, 40), (41, 58), (43, 75), (5, 75), (7, 58)], rb[1], lr)
    P.tone([(28, 40), (37, 40), (41, 58), (43, 75), (31, 75)], rb[2], lr); P.line([(5, 72), (43, 72)], g[1], lr); P.line([(5, 74), (43, 74)], g[2], lr)
    for x in (12, 36): P.line([(x, 60), (x - 2, 71)], rb[2], lr)
    lst = P.layer()
    P.fill([(15, 42), (21, 44), (20, 71), (15, 71)], st[1], lst); P.fill([(33, 42), (27, 44), (28, 71), (33, 71)], st[2], lst)
    for x0, x1 in ((15, 20), (28, 33)): P.line([(x0, 68), (x1, 68)], g[1], lst); P.line([(x0, 70), (x1, 70)], g[0], lst)
    lrope = P.layer(); P.fill([(14, 57), (34, 57), (34, 59), (14, 59)], hx("#b89a60"), lrope); P.fill([(22, 59), (24, 59), (24, 66), (22, 66)], hx("#b89a60"), lrope)
    ls = P.layer()
    P.fill([(3, 48), (12, 42), (15, 58), (7, 63), (2, 58)], rb[1], ls); P.fill([(45, 48), (36, 42), (33, 58), (41, 63), (46, 58)], rb[2], ls)
    P.line([(2, 58), (7, 63), (15, 58)], g[1], ls); P.line([(46, 58), (41, 63), (33, 58)], g[1], ls)
    lhd = P.layer(); P.fill([(7, 60), (12, 59), (12, 63), (8, 63)], pal["skin"], lhd); P.fill([(36, 59), (41, 60), (40, 63), (36, 63)], pal["skinD"], lhd)
    lface = place_face(P, pal, closed=True)
    # bald crown in skin, with a shine
    lsc = P.layer(); P.fill([(11, 25), (12, 15), (16, 9), (24, 5), (32, 6), (37, 10), (40, 17), (40, 25)], pal["skin"], lsc)
    P.tone([(31, 6), (37, 10), (40, 17), (40, 25), (35, 25), (35, 14)], pal["skinD"], lsc); P.line([(17, 11), (22, 8)], mix(pal["skin"], (255, 255, 255), 0.5), lsc)
    hf = hair_front(P, HR, [
        [(16, 25), (24, 23), (25, 26), (17, 27)], [(30, 25), (37, 23), (38, 26), (31, 27)],
        [(12, 22), (16, 21), (16, 32), (13, 36)], [(37, 21), (40, 22), (40, 34), (37, 32)],
        [(14, 32), (19, 35), (26, 36), (33, 35), (39, 31), (40, 40), (37, 50), (31, 58), (25, 62), (20, 57), (15, 48), (13, 40)]],
        strands=[[(18, 38), (21, 52)], [(25, 40), (25, 60)], [(32, 38), (30, 54)], [(36, 36), (35, 46)], [(15, 38), (17, 46)]],
        shine=[[(18, 36), (23, 38)], [(29, 38), (34, 36)]], lit=[[(14, 32), (19, 35), (24, 36), (22, 44), (16, 44)]])
    P.line([(21, 39), (25, 40), (29, 39)], HR[2], hf)
    return P.finish()

def wren():
    pal, ex = CAST_V2[0][1], CAST_V2[0][2]
    return build_v2(pal, ex)

CAST3 = [("Wren (you)", wren), ("Tessa", tessa), ("Bram", bram), ("Kellan Vex", kellan), ("Hooded companion", companion), ("Old mentor", mentor)]
if __name__ == "__main__":
    S = 6
    ims = [(n, Image.fromarray(f())) for n, f in CAST3]
    cw = max(i.width for _, i in ims) * S + 40; ch = max(i.height for _, i in ims) * S + 70
    sheet = Image.new("RGBA", (cw * len(ims), ch), "#1c1730"); d = ImageDraw.Draw(sheet); f = ImageFont.load_default(size=26)
    for k, (n, im) in enumerate(ims):
        im.save(f"c3_{n.split()[0].lower()}.png")
        big = im.resize((im.width * S, im.height * S), Image.NEAREST); sheet.paste(big, (k * cw + 20, 50), big)
        d.text((k * cw + cw // 2, 24), n, fill="#e9d9b4", font=f, anchor="mm")
    sheet.save("cast_v3.png")
