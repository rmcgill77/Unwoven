"""Environment concept in the chibi style: 32px tiles, black outlines on objects, flat 2-3 tone fills."""
import math
import numpy as np
from PIL import Image, ImageDraw
T = 32
INK = (12, 8, 14, 255)
def hx(c, a=255): return (int(c[1:3], 16), int(c[3:5], 16), int(c[5:7], 16), a)
def h2(x, y, s=0): v = (x * 374761393 + y * 668265263 + s * 2246822519) & 0xffffffff; v = (v ^ (v >> 13)) * 1274126177 & 0xffffffff; return v ^ (v >> 16)
class Spr:
    """An RGBA sprite drawn with flat shapes, then given a black outline round its silhouette."""
    def __init__(self, w, h): self.im = Image.new("RGBA", (w, h)); self.d = ImageDraw.Draw(self.im)
    def poly(self, pts, c): self.d.polygon(pts, fill=hx(c))
    def rect(self, x0, y0, x1, y1, c): self.d.rectangle([x0, y0, x1, y1], fill=hx(c))
    def ell(self, x0, y0, x1, y1, c): self.d.ellipse([x0, y0, x1, y1], fill=hx(c))
    def line(self, pts, c, w=1): self.d.line(pts, fill=hx(c), width=w)
    def px(self, x, y, c):
        if 0 <= x < self.im.width and 0 <= y < self.im.height: self.im.putpixel((x, y), hx(c))
    def outline(self):
        a = np.array(self.im); m = a[:, :, 3] > 0; out = a.copy()
        H, W = m.shape
        for y in range(H):
            for x in range(W):
                if not m[y, x] and any(0 <= y + dy < H and 0 <= x + dx < W and m[y + dy, x + dx] for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1))): out[y, x] = INK
        self.im = Image.fromarray(out); self.d = ImageDraw.Draw(self.im); return self

# ---------------- palette ----------------
G = dict(g0="#3f6a34", g1="#4e7c3c", g2="#629148", g3="#7aa856", gd="#2f5228")
PATH = dict(p0="#a88a5c", p1="#bd9e6c", p2="#d0b37e", pd="#86693f", pe="#6e5634")
WATER = dict(w0="#2f5a86", w1="#3d6e9c", w2="#6a9ac0", foam="#cfe4ee")

def grass(tx, ty):
    s = Spr(T, T); s.rect(0, 0, T - 1, T - 1, G["g1"])
    r = h2(tx, ty)
    # broad flat patches of a lighter and darker green, hand-placed clusters
    for k in range(2):
        cx, cy = (h2(tx, ty, k) % 24) + 4, (h2(ty, tx, k + 3) % 24) + 4
        c = G["g2"] if k == 0 else G["g0"]
        s.ell(cx - 5, cy - 3, cx + 5, cy + 3, c)
    for k in range(3):   # little V tufts
        x, y = (h2(tx, ty, 10 + k) % 26) + 3, (h2(tx, ty, 20 + k) % 24) + 5
        s.line([(x - 2, y - 3), (x, y)], G["gd"]); s.line([(x, y), (x + 2, y - 3)], G["gd"]); s.px(x - 1, y - 3, G["g3"]); s.px(x + 1, y - 3, G["g3"])
    if r % 7 == 0:       # a flower
        x, y = r % 24 + 4, (r >> 5) % 22 + 6; c = ["#e8c84a", "#d86a6a", "#d8d0e8", "#8ab0e0"][r % 4]
        for dx, dy in ((0, -1), (-1, 0), (1, 0), (0, 1)): s.px(x + dx, y + dy, c)
        s.px(x, y, "#f6eccc")
    return s.im

def path_tile(tx, ty, n, e, so, w):
    """n/e/s/w = neighbour is path. Grass edges are drawn as an irregular lip over the path."""
    s = Spr(T, T); s.rect(0, 0, T - 1, T - 1, PATH["p1"])
    for k in range(3):
        cx, cy = h2(tx, ty, k) % 26 + 3, h2(ty, tx, k) % 26 + 3
        s.ell(cx - 4, cy - 2, cx + 4, cy + 2, PATH["p0"] if k % 2 else PATH["p2"])
    for k in range(3):   # pebbles with a dark underside
        x, y = h2(tx, ty, 30 + k) % 26 + 3, h2(tx, ty, 40 + k) % 26 + 3
        s.rect(x, y, x + 2, y + 1, PATH["p2"]); s.rect(x, y + 2, x + 2, y + 2, PATH["pd"])
    g = grass(tx, ty)
    msk = Image.new("L", (T, T), 0); md = ImageDraw.Draw(msk)
    lip = lambda i: 3 + (h2(tx * 7 + i, ty * 13) % 3)
    if not n: md.polygon([(0, 0), (T, 0)] + [(T - 1 - i * 4, lip(i)) for i in range(9)], fill=255)
    if not so: md.polygon([(0, T), (T, T)] + [(T - 1 - i * 4, T - 1 - lip(i + 20)) for i in range(9)], fill=255)
    if not w: md.polygon([(0, 0), (0, T)] + [(lip(i + 40), T - 1 - i * 4) for i in range(9)], fill=255)
    if not e: md.polygon([(T, 0), (T, T)] + [(T - 1 - lip(i + 60), T - 1 - i * 4) for i in range(9)], fill=255)
    im = s.im.copy(); im.paste(g, (0, 0), msk)
    # dark rim where the grass lip meets the path
    a = np.array(im); mk = np.array(msk) > 0
    for y in range(T):
        for x in range(T):
            if not mk[y, x] and any(0 <= y + dy < T and 0 <= x + dx < T and mk[y + dy, x + dx] for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1))): a[y, x] = hx(PATH["pe"])
    return Image.fromarray(a)

def water_tile(tx, ty, n, t=0):
    s = Spr(T, T); s.rect(0, 0, T - 1, T - 1, WATER["w1"])
    for k in range(2):
        x, y = (h2(tx, ty, k) + t * 3) % 24 + 2, h2(ty, tx, k) % 26 + 3
        s.line([(x, y), (x + 5, y)], WATER["w2"]); s.line([(x + 1, y + 1), (x + 4, y + 1)], WATER["w0"])
    if not n:   # bank: a grass lip with a dark edge and a foam line
        s.rect(0, 0, T - 1, 5, G["g1"]); s.line([(0, 6), (T, 6)], "#1e3a28"); s.line([(0, 7), (T, 7)], WATER["foam"])
        for i in range(0, T, 6): s.px(i + 2, 8, WATER["foam"])
    return s.im

def tree():
    s = Spr(76, 96)
    s.rect(32, 60, 43, 90, "#5a3a24"); s.rect(32, 60, 35, 90, "#7a5232"); s.rect(41, 60, 43, 90, "#3e2616")
    s.poly([(28, 92), (32, 84), (43, 84), (48, 92)], "#5a3a24")
    clumps = [(38, 26, 24), (22, 40, 18), (54, 40, 18), (30, 54, 16), (48, 54, 16), (38, 46, 20)]
    for cx, cy, r in clumps: s.ell(cx - r, cy - r, cx + r, cy + r, "#3d6a32")
    for cx, cy, r in clumps:   # lit upper-left of each clump
        s.ell(cx - r + 2, cy - r + 1, cx + r - 8, cy + r - 9, "#4f8240")
    for cx, cy, r in clumps[:3]: s.ell(cx - r + 5, cy - r + 3, cx - 2, cy - 4, "#66a050")
    for cx, cy, r in clumps:   # leaf-edge marks
        for k in range(4):
            a = math.radians(200 + k * 40); x, y = int(cx + math.cos(a) * (r - 5)), int(cy + math.sin(a) * (r - 5))
            s.line([(x, y), (x + 2, y + 2)], "#2c5026")
    s.outline()
    # inner clump separation lines
    d = ImageDraw.Draw(s.im)
    for cx, cy, r in clumps[3:]: d.arc([cx - r, cy - r, cx + r, cy + r], 200, 330, fill=INK)
    return s.im

def bush():
    s = Spr(34, 24)
    for cx, cy, r in ((10, 14, 9), (22, 12, 10), (16, 9, 8)): s.ell(cx - r, cy - r, cx + r, cy + r, "#3d6a32")
    for cx, cy, r in ((10, 14, 9), (22, 12, 10), (16, 9, 8)): s.ell(cx - r + 2, cy - r + 1, cx + r - 5, cy + r - 6, "#5a8e46")
    s.px(12, 8, "#d86a6a"); s.px(24, 7, "#d86a6a"); s.px(19, 13, "#d86a6a")
    return s.outline().im

def house(w_tiles=5):
    W = w_tiles * T; s = Spr(W + 8, 150)
    # roof: big slab with shingle rows and a ridge
    s.poly([(4, 58), (W // 2 + 4, 4), (W + 4, 58)], "#7a3a34")
    s.poly([(4, 58), (W // 2 + 4, 4), (W // 2 + 4, 58)], "#94483e")
    s.rect(0, 56, W + 7, 66, "#6a302c"); s.rect(0, 56, W + 7, 58, "#94483e")
    # wall: plaster with timber frame
    s.rect(6, 66, W + 1, 146, "#e6d6b0"); s.rect(6, 66, 12, 146, "#f2e6c6"); s.rect(W - 8, 66, W + 1, 146, "#cbb88e")
    for x in (6, W // 2 - 2, W - 4): s.rect(x, 66, x + 5, 146, "#5a3a24")
    s.rect(6, 66, W + 1, 71, "#5a3a24"); s.rect(6, 104, W + 1, 108, "#5a3a24")
    s.rect(6, 138, W + 1, 146, "#8a8478"); s.rect(6, 138, W + 1, 139, "#a8a294")   # stone footing
    for i in range(6, W, 12): s.line([(i, 140), (i, 146)], "#6a645a")
    # windows (one lit) and door
    def window(x, y, lit):
        s.rect(x, y, x + 22, y + 22, "#4a2e1c"); s.rect(x + 3, y + 3, x + 19, y + 19, "#f6c860" if lit else "#2e3e58")
        if not lit: s.rect(x + 4, y + 4, x + 9, y + 9, "#5a7aa0")
        s.rect(x + 10, y + 3, x + 12, y + 19, "#4a2e1c"); s.rect(x + 3, y + 10, x + 19, y + 12, "#4a2e1c")
        s.rect(x - 2, y + 22, x + 24, y + 25, "#6a4630")
    window(22, 76, False); window(W - 46, 76, True)
    dx = W // 2 - 12
    s.rect(dx - 3, 110, dx + 27, 146, "#4a2e1c"); s.rect(dx, 113, dx + 24, 146, "#7a5232")
    for i in range(dx + 6, dx + 24, 6): s.line([(i, 113), (i, 146)], "#5a3a24")
    s.rect(dx + 18, 128, dx + 20, 130, "#d4a840")
    s.outline()
    d = ImageDraw.Draw(s.im)
    for y in range(14, 58, 8):   # shingle rows
        xa = 4 + (58 - y) * (W // 2) // 54; xb = W + 4 - (58 - y) * (W // 2) // 54
        d.line([(xa, y), (xb, y)], fill=hx("#5a2622"))
        for x in range(xa + (y % 16), xb, 12): d.line([(x, y), (x, y + 7)], fill=hx("#5a2622"))
    d.line([(4, 58), (W // 2 + 4, 4), (W + 4, 58)], fill=INK)
    d.line([(6, 66), (W + 1, 66)], fill=INK)
    return s.im

def fence(n=4):
    s = Spr(n * T + 4, 30)
    for i in range(n + 1):
        x = i * T; s.rect(x, 4, x + 5, 28, "#8a6440"); s.rect(x, 4, x + 1, 28, "#a8805a"); s.poly([(x, 4), (x + 3, 0), (x + 5, 4)], "#8a6440")
    s.rect(0, 9, n * T + 3, 12, "#7a5636"); s.rect(0, 19, n * T + 3, 22, "#7a5636"); s.rect(0, 9, n * T + 3, 9, "#a8805a"); s.rect(0, 19, n * T + 3, 19, "#a8805a")
    return s.outline().im

def well():
    s = Spr(56, 64)
    s.rect(6, 6, 9, 40, "#6a4630"); s.rect(46, 6, 49, 40, "#6a4630")
    s.poly([(0, 12), (28, 0), (56, 12), (52, 16), (4, 16)], "#7a3a34"); s.poly([(0, 12), (28, 0), (28, 16), (4, 16)], "#94483e")
    s.rect(4, 36, 51, 62, "#8a8478"); s.rect(4, 36, 51, 40, "#a8a294"); s.ell(10, 34, 45, 44, "#3a5a80")
    for y in (48, 55): s.line([(4, y), (51, y)], "#6a645a")
    for x, y in ((14, 41), (30, 48), (22, 55), (40, 41), (44, 55)): s.line([(x, y), (x, y + 6)], "#6a645a")
    s.rect(26, 16, 29, 30, "#d6c8a0"); s.rect(24, 28, 31, 33, "#7a5232")
    return s.outline().im

def lamp(lit=True):
    s = Spr(18, 64)
    s.rect(7, 18, 10, 60, "#2e2a36"); s.rect(7, 18, 7, 60, "#4a4658"); s.rect(4, 58, 13, 63, "#2e2a36")
    s.rect(3, 4, 14, 18, "#2e2a36"); s.rect(5, 6, 12, 16, "#f6c860" if lit else "#4a5a70"); s.poly([(2, 4), (8, 0), (15, 4)], "#2e2a36")
    return s.outline().im

def rock():
    s = Spr(24, 18); s.poly([(2, 16), (4, 6), (11, 1), (20, 4), (23, 16)], "#7a7884"); s.poly([(4, 6), (11, 1), (12, 8), (6, 12)], "#9a98a4")
    s.line([(12, 8), (18, 14)], "#5a5866"); return s.outline().im

def sign():
    s = Spr(28, 32); s.rect(12, 14, 15, 31, "#6a4630"); s.rect(1, 2, 26, 16, "#a8805a"); s.rect(1, 2, 26, 4, "#c8a070")
    for y in (8, 11): s.line([(5, y), (22, y)], "#6a4630")
    return s.outline().im

# ---------------- interior ----------------
def floor_tile(tx, ty):
    s = Spr(T, T); s.rect(0, 0, T - 1, T - 1, "#8a6440")
    for i in range(4):
        y = i * 8; s.rect(0, y, T - 1, y, "#5e4028"); s.rect(0, y + 1, T - 1, y + 1, "#a07850")
        off = (h2(tx, ty + i) % 3) * 10 + (i % 2) * 5
        s.line([(off, y + 1), (off, y + 7)], "#5e4028")
        if h2(tx * 5, ty + i) % 4 == 0: s.px((off + 14) % T, y + 4, "#5e4028")
    return s.im

def wall_tile(tx, top=True):
    s = Spr(T, T)
    s.rect(0, 0, T - 1, T - 1, "#e6d6b0") if top else s.rect(0, 0, T - 1, T - 1, "#7a5232")
    if top:
        s.rect(0, 0, T - 1, 3, "#5a3a24"); s.rect(0, 0, T - 1, 0, INK[:3] and "#0c080e")
        if tx % 3 == 0: s.rect(0, 0, 4, T - 1, "#5a3a24")
    else:
        for x in range(0, T, 8): s.line([(x, 0), (x, T)], "#5a3a24")
        s.rect(0, 0, T - 1, 3, "#5a3a24"); s.rect(0, 1, T - 1, 1, "#a07850"); s.rect(0, T - 2, T - 1, T - 1, "#3e2616")
    return s.im

def bed():
    s = Spr(36, 62)
    s.rect(2, 2, 33, 60, "#6a4630"); s.rect(4, 4, 31, 14, "#e8e2d0"); s.rect(4, 4, 31, 5, "#ffffff")
    s.rect(4, 18, 31, 58, "#7a3a44"); s.rect(4, 18, 10, 58, "#94505a"); s.line([(4, 18), (31, 18)], "#e8e2d0"); s.line([(4, 20), (31, 20)], "#e8e2d0")
    for y in (32, 46): s.line([(6, y), (29, y)], "#5a2a34")
    return s.outline().im

def table():
    s = Spr(64, 40); s.rect(2, 4, 61, 24, "#8a5a36"); s.rect(2, 4, 61, 7, "#a87048"); s.rect(2, 24, 61, 27, "#5a3a24")
    for x in (5, 55): s.rect(x, 27, x + 4, 38, "#5a3a24")
    s.rect(20, 10, 34, 16, "#e8e2d0"); s.line([(22, 12), (32, 12)], "#a8a294"); s.ell(42, 9, 50, 15, "#c8c0b0"); s.ell(44, 10, 48, 13, "#7a3a2a")
    return s.outline().im

def fireplace():
    s = Spr(64, 72)
    s.rect(4, 0, 59, 70, "#8a8478"); s.rect(4, 0, 59, 4, "#a8a294")
    for y in range(10, 70, 10):
        s.line([(4, y), (59, y)], "#6a645a")
        for x in range(4 + (y // 10 % 2) * 8, 60, 16): s.line([(x, y - 10), (x, y)], "#6a645a")
    s.rect(14, 34, 49, 70, "#2a1a14"); s.poly([(14, 34), (31, 26), (49, 34)], "#8a8478")
    s.poly([(20, 70), (26, 50), (31, 60), (36, 44), (42, 70)], "#e8762a"); s.poly([(25, 70), (30, 56), (34, 64), (38, 70)], "#f6c860")
    s.rect(18, 66, 45, 70, "#5a3a24"); s.rect(0, 28, 63, 32, "#5a3a24")
    return s.outline().im

def barrel():
    s = Spr(24, 30); s.ell(1, 1, 22, 8, "#8a5a36"); s.rect(1, 4, 22, 26, "#7a4e2e"); s.ell(1, 22, 22, 29, "#7a4e2e")
    s.rect(1, 4, 5, 26, "#a06a40"); s.ell(4, 2, 19, 7, "#5a3a24")
    for y in (9, 20): s.rect(1, y, 22, y + 1, "#4a4658")
    return s.outline().im

def rug():
    s = Spr(96, 64); s.rect(0, 0, 95, 63, "#7a3a44"); s.rect(4, 4, 91, 59, "#94505a"); s.rect(8, 8, 87, 55, "#7a3a44")
    for x in (30, 48, 66): s.poly([(x, 24), (x + 8, 32), (x, 40), (x - 8, 32)], "#d4a840")
    return s.im

# ---------------- characters ----------------
ATL = "/home/claude/durinn/concept/"
def chibi(key, anim="idle_down", i=0, flip=False):
    import json
    d = json.load(open(ATL + "chibi_atlas.json"))["chars"][key]
    sheet = Image.open(ATL + f"atlas_{key}.png"); idx = d["anims"][anim][i]
    fr = sheet.crop((idx * d["fw"], 0, (idx + 1) * d["fw"], d["fh"]))
    a = d["anchor"]["side" if "side" in anim else ("up" if "up" in anim else "down")]
    if flip: fr = fr.transpose(Image.FLIP_LEFT_RIGHT); a = [d["fw"] - 1 - a[0], a[1]]
    return fr, a
def shadow(c, x, y, w=22):
    sh = Image.new("RGBA", (w * 2, 10)); ImageDraw.Draw(sh).ellipse([0, 0, w * 2 - 1, 9], fill=(10, 6, 20, 90)); c.alpha_composite(sh, (x - w, y - 5))

def outdoor():
    TW, TH = 22, 13
    c = Image.new("RGBA", (TW * T, TH * T))
    pathset = set()
    for x in range(TW): pathset |= {(x, 8), (x, 9)}
    for y in range(4, 13): pathset |= {(12, y), (13, y)}
    for ty in range(TH):
        for tx in range(TW):
            if ty >= 11 and tx < 8: continue
            if (tx, ty) in pathset:
                c.paste(path_tile(tx, ty, (tx, ty - 1) in pathset, (tx + 1, ty) in pathset, (tx, ty + 1) in pathset, (tx - 1, ty) in pathset), (tx * T, ty * T))
            else: c.paste(grass(tx, ty), (tx * T, ty * T))
    for ty in (11, 12):
        for tx in range(8): c.paste(water_tile(tx, ty, ty != 11), (tx * T, ty * T))
    items = []
    items.append((house(5), 1 * T - 4, 0 * T - 10, 4 * T))
    items.append((house(4), 15 * T, 0 * T - 10, 4 * T))
    items.append((tree(), 9 * T - 10, 1 * T - 16, 3 * T))
    items.append((tree(), 19 * T, 9 * T - 40, 12 * T))
    items.append((bush(), 7 * T, 3 * T + 10, 4 * T))
    items.append((bush(), 10 * T + 6, 10 * T + 8, 11 * T))
    items.append((well(), 15 * T + 4, 10 * T - 20, 12 * T))
    items.append((lamp(), 11 * T + 6, 6 * T - 2, 8 * T))
    items.append((lamp(False), 14 * T + 8, 6 * T - 2, 8 * T))
    items.append((fence(4), 1 * T, 6 * T + 4, 7 * T))
    items.append((rock(), 9 * T, 11 * T + 10, 12 * T))
    items.append((sign(), 16 * T + 4, 6 * T - 6, 7 * T))
    chars = [("wren", "walk_side", 2, False, 9 * T, 9 * T + 6), ("tessa", "idle_down", 0, False, 12 * T + 12, 8 * T + 14),
             ("bram", "idle_side", 0, True, 15 * T, 9 * T + 4), ("mentor", "idle_down", 0, False, 6 * T, 8 * T + 20), ("lenna", "walk_up", 3, False, 13 * T + 14, 11 * T + 8)]
    for k, an, i, fl, x, y in chars:
        fr, a = chibi(k, an, i, fl); items.append((("chr", fr, a), x, y, y))
    items.sort(key=lambda t: t[3])
    for it, x, y, _ in items:
        if isinstance(it, tuple):
            _, fr, a = it; shadow(c, x, y); c.alpha_composite(fr, (x - a[0], y - a[1]))
        else: c.alpha_composite(it, (x, y))
    return c

def indoor():
    TW, TH = 12, 9
    c = Image.new("RGBA", (TW * T, TH * T), hx("#0c080e"))
    for ty in range(TH):
        for tx in range(TW):
            if ty == 0: c.paste(wall_tile(tx, True), (tx * T, 0))
            elif ty == 1: c.paste(wall_tile(tx, False), (tx * T, T))
            else: c.paste(floor_tile(tx, ty), (tx * T, ty * T))
    c.alpha_composite(rug(), (6 * T, 4 * T + 8))
    items = [(fireplace(), 1 * T, 0, 2 * T), (bed(), 10 * T + 6, 1 * T + 14, 3 * T), (table(), 6 * T + 16, 4 * T + 20, 6 * T),
             (barrel(), 4 * T, 2 * T + 6, 3 * T), (barrel(), 4 * T + 20, 2 * T + 10, 3 * T + 2)]
    chars = [("mentor", "idle_side", 0, False, 3 * T + 16, 5 * T + 10), ("wren", "idle_down", 0, False, 9 * T + 4, 7 * T + 10)]
    for k, an, i, fl, x, y in chars:
        fr, a = chibi(k, an, i, fl); items.append((("chr", fr, a), x, y, y))
    items.sort(key=lambda t: t[3])
    for it, x, y, _ in items:
        if isinstance(it, tuple):
            _, fr, a = it; shadow(c, x, y); c.alpha_composite(fr, (x - a[0], y - a[1]))
        else: c.alpha_composite(it, (x, y))
    return c

if __name__ == "__main__":
    o = outdoor(); o.resize((o.width * 2, o.height * 2), Image.NEAREST).save("concept_town.png")
    i = indoor(); i.resize((i.width * 2, i.height * 2), Image.NEAREST).save("concept_interior.png")
    print(o.size, i.size)
