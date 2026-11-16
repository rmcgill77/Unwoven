"""Gritty environment concept: muted, worn, overcast. Same pixel language as the cast (black outlines, flat tones)."""
import math, json
import numpy as np
from PIL import Image, ImageDraw
from env import Spr, hx, h2, INK, T, chibi, shadow
from noise import fbm, vnoise

# ---------------- ground ----------------
GR = dict(g0="#334028", g1="#3b4830", g2="#445036", dead="#5e5c40", deadL="#7a7452", mud="#463c2e")
MUD = dict(m0="#3e3226", m1="#4c3e2e", m2="#5c4c38", m3="#6e5c44", wet="#2a2622", pud="#2c343c", pudL="#5a6a74", straw="#8a7a4e")

def ground(tx, ty):
    s = Spr(T, T); px = s.im.load()
    for y in range(T):
        for x in range(T):
            wx, wy = tx * T + x, ty * T + y
            n = vnoise(wx, wy, 22, 1) * 0.75 + vnoise(wx, wy, 7, 2) * 0.25; m = vnoise(wx, wy, 30, 5)
            if m > 0.8 and n > 0.45: c = GR["dead"]
            elif m < 0.12 and n < 0.4: c = GR["mud"]
            elif n < 0.3: c = GR["g0"]
            elif n > 0.7: c = GR["g2"]
            else: c = GR["g1"]
            px[x, y] = hx(c)
    for k in range(6):   # grass blades, a few dead and pale
        x, y = h2(tx, ty, 20 + k) % 28 + 2, h2(tx, ty, 30 + k) % 26 + 5
        c = GR["deadL"] if (h2(tx, ty, 40 + k) % 4 == 0) else GR["g2"]
        s.line([(x, y - 3), (x, y)], c); s.px(x + 1, y, GR["g0"])
    return s.im

def road(tx, ty, n, e, so, w, horiz=True):
    s = Spr(T, T); px = s.im.load()
    for y in range(T):
        for x in range(T):
            wx, wy = tx * T + x, ty * T + y
            v = vnoise(wx, wy, 16, 3) * 0.75 + vnoise(wx, wy, 5, 4) * 0.25
            c = MUD["m0"] if v < 0.28 else MUD["m2"] if v > 0.74 else MUD["m1"]
            if vnoise(wx, wy, 13, 11) > 0.85: c = MUD["wet"]
            px[x, y] = hx(c)
    for k0 in (9, 22):   # two cart ruts with a lighter ridge, wobbling with the noise
        for t in range(T):
            wob = int(round((vnoise((tx * T + t) if horiz else (ty * T + t), k0, 12, 21) - 0.5) * 3))
            p = (t, k0 + wob) if horiz else (k0 + wob, t)
            q = (t, k0 + wob - 1) if horiz else (k0 + wob - 1, t)
            r = (t, k0 + wob + 1) if horiz else (k0 + wob + 1, t)
            s.px(*p, MUD["wet"]); s.px(*q, MUD["m3"]); s.px(*r, MUD["m0"])
    if h2(tx, ty, 7) % 4 == 0:
        cx, cy = h2(tx, ty, 8) % 16 + 8, h2(tx, ty, 9) % 14 + 9
        s.poly([(cx - 7, cy), (cx - 4, cy - 3), (cx + 3, cy - 3), (cx + 7, cy + 1), (cx + 2, cy + 3), (cx - 5, cy + 3)], MUD["wet"])
        s.poly([(cx - 5, cy), (cx - 3, cy - 2), (cx + 3, cy - 2), (cx + 5, cy + 1), (cx - 4, cy + 2)], MUD["pud"]); s.line([(cx - 3, cy - 1), (cx + 1, cy - 1)], MUD["pudL"])
    for k in range(3):
        x, y = h2(tx, ty, 50 + k) % 26 + 3, h2(tx, ty, 60 + k) % 26 + 3
        if k == 0: s.line([(x, y), (x + 4, y - 1)], MUD["straw"])
        else: s.rect(x, y, x + 1, y, "#6e6660"); s.px(x, y + 1, MUD["m0"])
    g = ground(tx, ty)
    msk = Image.new("L", (T, T), 0); md = ImageDraw.Draw(msk)
    lip = lambda i: 2 + (h2(tx * 7 + i, ty * 13) % 4)
    if not n: md.polygon([(0, 0), (T, 0)] + [(T - 1 - i * 4, lip(i)) for i in range(9)], fill=255)
    if not so: md.polygon([(0, T), (T, T)] + [(T - 1 - i * 4, T - 1 - lip(i + 20)) for i in range(9)], fill=255)
    if not w: md.polygon([(0, 0), (0, T)] + [(lip(i + 40), T - 1 - i * 4) for i in range(9)], fill=255)
    if not e: md.polygon([(T, 0), (T, T)] + [(T - 1 - lip(i + 60), T - 1 - i * 4) for i in range(9)], fill=255)
    im = s.im.copy(); im.paste(g, (0, 0), msk)
    return im

def bog(tx, ty, n):
    s = Spr(T, T); s.rect(0, 0, T - 1, T - 1, "#2a3230")
    for k in range(3):
        x, y = h2(tx, ty, k) % 24 + 2, h2(ty, tx, k) % 26 + 3
        s.line([(x, y), (x + 6, y)], "#3e4a46")
    if h2(tx, ty) % 3 == 0:   # reeds
        x = h2(tx, ty, 5) % 22 + 4
        for d in (0, 2, 4): s.line([(x + d, 30), (x + d - 1, 18 + d)], "#5a5a3a")
    if not n: s.rect(0, 0, T - 1, 4, GR["g0"]); s.line([(0, 5), (T, 5)], "#121614"); s.line([(0, 6), (T, 6)], "#4e5a54")
    return s.im

# ---------------- buildings ----------------
def hovel(w=4):
    """Low-status house: sagging patched thatch, stained cracked plaster, boarded window, crooked door."""
    W = w * T; s = Spr(W + 12, 140)
    sag = lambda x: int(4 * math.sin(math.pi * (x - 4) / W))
    s.poly([(2, 60), (W // 2 + 6, 10 + 4), (W + 10, 62)], "#5e5032")
    s.poly([(2, 60), (W // 2 + 6, 14), (W // 2 + 6, 60)], "#6e5e3c")
    s.poly([(W // 2 + 10, 30), (W // 2 + 34, 40), (W // 2 + 30, 56), (W // 2 + 8, 50)], "#4a4028")   # patch
    s.rect(0, 58, W + 11, 68, "#4a4028")
    s.rect(6, 66, W + 5, 136, "#8e8268"); s.rect(6, 66, 12, 136, "#9c907a"); s.rect(W - 6, 66, W + 5, 136, "#766c56")
    pxl = s.im.load()
    for y in range(70, 128):
        for x in range(8, W + 4):
            v = vnoise(x * 0.6, y * 0.25, 6, 31 + W)
            if v > 0.68: pxl[x, y] = hx("#766c56")
            elif v < 0.2: pxl[x, y] = hx("#a09478")
    for x in range(8, W + 4):
        top = 118 + int(vnoise(x, 0, 5, 77) * 8)
        for y in range(top, 128): pxl[x, y] = hx("#5e5240")
    for x in (6, W // 2 + 2, W + 1): s.rect(x, 66, x + 4, 136, "#3a2a1e")
    s.rect(6, 66, W + 5, 70, "#3a2a1e"); s.rect(6, 100, W // 2 + 2, 103, "#3a2a1e")
    for k in range(5):   # grime streaks running down from the eaves
        x = 16 + k * (W // 5) + h2(k, 3) % 6; ln = 10 + h2(k, 9) % 18
        s.rect(x, 71, x + 1, 71 + ln, "#8a7c60"); s.rect(x + 1, 71, x + 2, 71 + ln // 2, "#7a6e56")
    s.poly([(W - 30, 108), (W - 22, 104), (W - 14, 112), (W - 20, 120), (W - 28, 118)], "#6a4a34")   # plaster fallen off: wattle beneath
    for y in (108, 112, 116): s.line([(W - 28, y), (W - 16, y + 1)], "#4a3222")
    s.rect(6, 128, W + 5, 136, "#4e4a44")
    # boarded window
    s.rect(20, 78, 42, 98, "#1a1614"); s.line([(18, 80), (44, 94)], "#6a5236", 3); s.line([(18, 94), (44, 82)], "#5a4430", 3)
    # crooked door
    dx = W // 2 + 16
    s.poly([(dx, 104), (dx + 22, 106), (dx + 22, 136), (dx, 136)], "#3e2c1e")
    for i in (6, 12, 18): s.line([(dx + i, 105), (dx + i, 136)], "#2a1e14")
    s.px(dx + 18, 122, "#8a8270")
    s.outline()
    d = ImageDraw.Draw(s.im)
    for y in range(20, 60, 6):   # thatch strands
        xa = 2 + (60 - y) * (W // 2) // 46; xb = W + 10 - (62 - y) * (W // 2) // 48
        for x in range(xa, xb, 5): d.line([(x, y), (x - 2, y + 5)], fill=hx("#4a4028"))
    d.line([(2, 60), (W // 2 + 6, 14), (W + 10, 62)], fill=INK)
    return s.im

def stonehouse(w=5):
    """Better-off house: slate roof with moss, ashlar walls, barred lit window, chimney with smoke."""
    W = w * T; s = Spr(W + 12, 170)
    s.rect(W - 40, 4, W - 22, 46, "#4e4c4e"); s.rect(W - 40, 4, W - 36, 46, "#625f62"); s.rect(W - 42, 2, W - 20, 6, "#3a383a")
    s.poly([(2, 70), (W // 2 + 6, 20), (W + 10, 70)], "#3c4046"); s.poly([(2, 70), (W // 2 + 6, 20), (W // 2 + 6, 70)], "#4a4e56")
    for k in range(4):
        x = 20 + k * (W // 4) + h2(k, 5) % 10; y = 52 + h2(k, 7) % 12
        s.ell(x, y, x + 12, y + 5, "#4e5a38")
    s.rect(0, 68, W + 11, 76, "#2e3036")
    s.rect(6, 76, W + 5, 166, "#6a6662"); s.rect(6, 76, 12, 166, "#7a7672"); s.rect(W - 4, 76, W + 5, 166, "#565250")
    for y in range(84, 166, 9):
        off = (y // 9 % 2) * 9
        s.line([(6, y), (W + 5, y)], "#4a4644")
        for x in range(6 + off, W + 5, 18): s.line([(x, y - 9), (x, y)], "#4a4644")
    for k in range(4): x = 30 + k * 34; s.rect(x, 77, x + 1, 77 + 8 + h2(k, 2) % 14, "#5a5652")
    def win(x, y):
        s.rect(x, y, x + 24, y + 26, "#2a2624"); s.rect(x + 3, y + 3, x + 21, y + 23, "#c89a48"); s.rect(x + 3, y + 3, x + 21, y + 8, "#e0b860")
        for bx in (x + 8, x + 15): s.rect(bx, y + 3, bx + 1, y + 23, "#1a1614")
        s.rect(x - 3, y + 26, x + 27, y + 29, "#4e4a46")
    win(24, 92); win(W - 50, 92)
    dx = W // 2 - 12
    s.rect(dx - 4, 120, dx + 28, 166, "#3a3634"); s.rect(dx, 124, dx + 24, 166, "#4a3424")
    for y in (134, 152): s.rect(dx, y, dx + 24, y + 2, "#2a2624")
    s.rect(dx + 19, 142, dx + 21, 145, "#8a8270")
    s.outline()
    d = ImageDraw.Draw(s.im)
    for y in range(28, 70, 7):
        xa = 2 + (70 - y) * (W // 2) // 50; xb = W + 10 - (70 - y) * (W // 2) // 50
        d.line([(xa, y), (xb, y)], fill=hx("#2a2c32"))
        for x in range(xa + (y % 14), xb, 10): d.line([(x, y), (x, y + 6)], fill=hx("#2a2c32"))
    d.line([(2, 70), (W // 2 + 6, 20), (W + 10, 70)], fill=INK)
    return s.im

def smoke(n=3):
    s = Image.new("RGBA", (40, 70)); d = ImageDraw.Draw(s)
    for k in range(n):
        y = 60 - k * 22; x = 12 + k * 6
        d.ellipse([x, y, x + 14 + k * 4, y + 10 + k * 2], fill=(120, 118, 124, 110 - k * 30))
    return s

# ---------------- props ----------------
def deadtree():
    s = Spr(84, 110)
    s.poly([(36, 108), (38, 60), (34, 40), (40, 38), (44, 58), (48, 108)], "#3a3026")
    s.poly([(38, 60), (40, 38), (42, 60)], "#4e4234")
    for pts in ([(38, 50), (20, 30), (8, 26), (10, 22), (22, 26), (38, 44)], [(42, 46), (60, 28), (74, 22), (76, 26), (62, 32), (44, 52)],
                [(40, 40), (36, 16), (30, 4), (34, 2), (40, 14), (42, 38)], [(22, 28), (16, 12), (20, 12), (26, 26)], [(60, 30), (66, 12), (70, 14), (64, 30)]):
        s.poly(pts, "#3a3026")
    s.poly([(28, 108), (36, 98), (48, 98), (58, 108)], "#3a3026")
    s.line([(39, 64), (40, 100)], "#4e4234"); s.line([(44, 70), (45, 96)], "#2a221a")
    return s.outline().im

def thintree():
    s = Spr(70, 100)
    s.rect(32, 54, 39, 96, "#3a3026"); s.rect(32, 54, 34, 96, "#4e4234")
    s.poly([(26, 98), (32, 90), (39, 90), (46, 98)], "#3a3026")
    for cx, cy, r in ((34, 30, 18), (20, 42, 13), (50, 40, 13), (36, 50, 12)): s.ell(cx - r, cy - r, cx + r, cy + r, "#2e3a28")
    for cx, cy, r in ((34, 30, 18), (20, 42, 13), (50, 40, 13)): s.ell(cx - r + 2, cy - r + 1, cx + r - 7, cy + r - 8, "#3c4a32")
    for k in range(10):   # gaps where leaves have fallen
        x, y = 16 + h2(k, 1) % 40, 16 + h2(k, 2) % 36; s.rect(x, y, x + 2, y + 1, "#1c2418")
    s.line([(34, 54), (24, 44)], "#3a3026", 2); s.line([(37, 54), (48, 44)], "#3a3026", 2)
    return s.outline().im

def brokenfence(n=4):
    s = Spr(n * T + 6, 34)
    for i in range(n + 1):
        x = i * T + (h2(i, 1) % 3); lean = (h2(i, 2) % 5) - 2
        if i == 2: s.poly([(x, 30), (x + 5, 30), (x + 5 + lean, 16), (x + lean, 18)], "#4e3e2c"); continue   # snapped post
        s.poly([(x, 33), (x + 5, 33), (x + 5 + lean, 3), (x + lean, 3)], "#4e3e2c"); s.line([(x + lean, 4), (x, 32)], "#62503a")
    s.poly([(0, 11), (2 * T, 13), (2 * T, 16), (0, 14)], "#463828")
    s.poly([(3 * T, 12), (n * T + 5, 10), (n * T + 5, 13), (3 * T, 15)], "#463828")
    s.poly([(0, 22), (T + 6, 23), (T + 4, 26), (0, 25)], "#463828")
    s.poly([(2 * T + 10, 30), (3 * T + 6, 20), (3 * T + 9, 22), (2 * T + 13, 32)], "#463828")   # fallen rail
    return s.outline().im

def pillory():
    s = Spr(60, 80)
    s.rect(27, 24, 32, 78, "#3a2c20"); s.rect(27, 24, 28, 78, "#4e3e2c")
    s.rect(4, 20, 55, 30, "#4e3e2c"); s.rect(4, 20, 55, 22, "#62503a"); s.line([(4, 25), (55, 25)], "#2a2018")
    for x in (12, 30, 46): s.ell(x - 3, 22, x + 3, 28, "#1a1410")
    s.rect(18, 74, 41, 79, "#3a2c20"); s.line([(30, 30), (30, 44)], "#5a5a5e")   # chain
    return s.outline().im

def laundry():
    s = Image.new("RGBA", (4 * T, 40)); d = ImageDraw.Draw(s)
    d.line([(0, 4), (2 * T, 9), (4 * T, 4)], fill=hx("#2a2420"))
    for k, (x, c, h) in enumerate(((10, "#8a8478", 16), (34, "#6e6a62", 20), (62, "#7a6a5a", 14), (88, "#5e5a54", 18), (108, "#8a8070", 12))):
        y = 4 + int(5 * math.sin(math.pi * x / (4 * T)))
        d.polygon([(x, y), (x + 14, y + 1), (x + 13, y + h), (x + 7, y + h - 3), (x + 1, y + h)], fill=hx(c), outline=INK)
        d.line([(x + 4, y + 3), (x + 4, y + h - 4)], fill=hx("#4e4a44"))
    return s

def refuse():
    s = Spr(40, 22)
    s.ell(0, 8, 39, 21, "#3e3428"); s.ell(4, 6, 24, 16, "#5a4c38"); s.rect(20, 4, 30, 12, "#6a5236"); s.line([(20, 4), (30, 12)], "#4a3a28")
    s.ell(28, 12, 36, 18, "#7a6e5a"); s.rect(8, 12, 12, 15, "#8a8478")
    return s.outline().im

def barrel():
    s = Spr(24, 30); s.ell(1, 1, 22, 8, "#5e4430"); s.rect(1, 4, 22, 26, "#4e3826"); s.ell(1, 22, 22, 29, "#4e3826")
    s.rect(1, 4, 5, 26, "#62483a"); s.ell(4, 2, 19, 7, "#3a2a1e")
    for y in (9, 20): s.rect(1, y, 22, y + 1, "#3a383e")
    return s.outline().im

def crate(broken=False):
    s = Spr(28, 26); s.rect(1, 1, 26, 24, "#5a4630"); s.rect(1, 1, 26, 3, "#6e5a3e")
    for y in (8, 16): s.line([(1, y), (26, y)], "#3e3022")
    s.line([(2, 2), (25, 23)], "#4a3a28", 2)
    if broken: s.poly([(18, 1), (26, 1), (26, 10), (21, 6)], "#1a1410")
    return s.outline().im

def crow(f=0):
    s = Spr(14, 10)
    s.poly([(2, 6), (6, 3), (10, 4), (13, 3), (11, 6), (7, 8)], "#1c1a20"); s.px(10, 4, "#5a5a66"); s.px(12, 5, "#8a7a3a")
    s.line([(6, 8), (5, 9)], "#2a2a30"); s.line([(8, 8), (8, 9)], "#2a2a30")
    return s.outline().im

def lamp(lit=True):
    s = Spr(18, 64)
    s.rect(7, 18, 10, 60, "#24222a"); s.rect(4, 58, 13, 63, "#24222a")
    s.rect(3, 4, 14, 18, "#24222a"); s.rect(5, 6, 12, 16, "#c89040" if lit else "#3a3e48"); s.poly([(2, 4), (8, 0), (15, 4)], "#24222a")
    if lit: s.rect(5, 6, 12, 8, "#e0b058")
    return s.outline().im

def bones():
    s = Spr(30, 16)
    s.ell(2, 4, 12, 13, "#b8ae94"); s.px(5, 8, "#1a1410"); s.px(8, 8, "#1a1410"); s.rect(4, 11, 10, 13, "#9a9078")
    s.line([(14, 12), (28, 8)], "#b8ae94", 2); s.ell(26, 6, 29, 10, "#b8ae94"); s.line([(16, 6), (24, 13)], "#a89e84", 2)
    return s.outline().im

def wreck():
    s = Spr(70, 44)
    s.poly([(4, 30), (54, 22), (60, 30), (10, 40)], "#4a3a28"); s.poly([(4, 30), (54, 22), (54, 26), (6, 34)], "#5e4a34")
    for x in (14, 26, 38): s.line([(x, 28 - (x // 6)), (x + 4, 38 - (x // 6))], "#2e2418")
    s.ell(44, 18, 68, 42, "#3a2c20"); s.ell(48, 22, 64, 38, "#000000"); s.ell(50, 24, 62, 36, "#3a2c20")
    for a in range(0, 360, 60):
        r = math.radians(a); s.line([(56, 30), (56 + int(math.cos(r) * 10), 30 + int(math.sin(r) * 10))], "#4e3e2c")
    s.ell(54, 28, 58, 32, "#2a2018")
    return s.outline().im

def cairn():
    s = Spr(34, 36)
    for (x0, y0, x1, y1, c) in ((2, 22, 32, 35, "#5a5a5e"), (6, 12, 28, 26, "#6a6a6e"), (10, 4, 24, 15, "#5e5e62"), (13, 0, 21, 6, "#727276")):
        s.ell(x0, y0, x1, y1, c)
    s.ell(4, 22, 14, 28, "#4e5a38")
    return s.outline().im

def grade(img, cool=(0.88, 0.9, 0.98), vignette=0.45, fog=None):
    a = np.array(img).astype(np.float32)
    a[:, :, :3] *= np.array(cool)
    lum = a[:, :, :3].mean(2, keepdims=True); a[:, :, :3] = a[:, :, :3] * 0.78 + lum * 0.22   # desaturate
    H, W = a.shape[:2]; yy, xx = np.mgrid[0:H, 0:W]
    v = 1 - vignette * (((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2) * 0.5
    a[:, :, :3] *= v[:, :, None]
    if fog is not None:
        f = np.clip((yy - fog[0]) / fog[1], 0, 1)[:, :, None] * 0
        band = np.exp(-((yy - fog[0]) / fog[1]) ** 2)[:, :, None] * 0.35
        a[:, :, :3] = a[:, :, :3] * (1 - band) + np.array([110, 116, 122]) * band
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))

def place(c, items):
    items.sort(key=lambda t: t[3])
    for it, x, y, _ in items:
        if isinstance(it, tuple):
            _, fr, a = it; shadow(c, x, y); c.alpha_composite(fr, (x - a[0], y - a[1]))
        else: c.alpha_composite(it, (x, y))

def street():
    TW, TH = 22, 13
    c = Image.new("RGBA", (TW * T, TH * T))
    road_set = set()
    for x in range(TW): road_set |= {(x, 8), (x, 9)}
    for y in range(4, 13): road_set |= {(11, y), (12, y)}
    for ty in range(TH):
        for tx in range(TW):
            c.paste(road(tx, ty, (tx, ty - 1) in road_set, (tx + 1, ty) in road_set, (tx, ty + 1) in road_set, (tx - 1, ty) in road_set, horiz=ty in (8, 9)) if (tx, ty) in road_set else ground(tx, ty), (tx * T, ty * T))
    items = [(hovel(4), 0, -6, 4 * T), (hovel(3), 5 * T - 6, 12, 4 * T + 4), (stonehouse(5), 14 * T + 4, -36, 4 * T),
             (smoke(), 14 * T + 5 * T - 40, -50, 0), (laundry(), 1 * T, 5 * T - 4, 5 * T), (brokenfence(4), 1 * T, 6 * T + 6, 7 * T),
             (pillory(), 8 * T + 6, 9 * T + 32, 12 * T), (thintree(), 19 * T, 9 * T - 40, 12 * T), (refuse(), 4 * T, 10 * T + 18, 11 * T),
             (barrel(), 10 * T + 4, 6 * T + 2, 7 * T), (crate(True), 9 * T + 6, 6 * T + 10, 7 * T + 2), (lamp(), 13 * T + 8, 6 * T - 2, 8 * T),
             (crow(), 8 * T + 14, 9 * T + 24, 12 * T + 1), (crow(), 2 * T + 6, 6 * T, 7 * T + 1), (crate(), 16 * T, 10 * T + 6, 11 * T)]
    for k, an, i, fl, x, y in [("wren", "walk_side", 2, False, 7 * T, 9 * T + 6), ("tessa", "idle_down", 0, False, 11 * T + 16, 8 * T + 10),
                               ("tomas", "idle_side", 0, True, 15 * T + 8, 9 * T + 6), ("maud", "idle_down", 0, False, 3 * T, 9 * T + 14), ("joss", "walk_up", 3, False, 12 * T + 6, 11 * T + 10)]:
        fr, a = chibi(k, an, i, fl); items.append((("c", fr, a), x, y, y))
    place(c, items)
    return grade(c)

def wilds():
    TW, TH = 22, 11
    c = Image.new("RGBA", (TW * T, TH * T))
    trail = {(x, 6) for x in range(TW)} | {(x, 7) for x in range(4, 15)}
    for ty in range(TH):
        for tx in range(TW):
            if ty >= 8 and tx >= 13: c.paste(bog(tx, ty, ty != 8 and True if ty > 8 else False), (tx * T, ty * T)); continue
            c.paste(road(tx, ty, (tx, ty - 1) in trail, (tx + 1, ty) in trail, (tx, ty + 1) in trail, (tx - 1, ty) in trail, horiz=True) if (tx, ty) in trail else ground(tx, ty), (tx * T, ty * T))
    items = [(deadtree(), 1 * T, 0, 3 * T), (deadtree(), 15 * T, -10, 3 * T - 6), (thintree(), 8 * T, 1 * T - 20, 3 * T + 8), (deadtree(), 19 * T + 6, 4 * T - 30, 7 * T - 20),
             (wreck(), 5 * T, 7 * T + 18, 9 * T), (bones(), 9 * T + 10, 9 * T + 6, 9 * T + 20), (cairn(), 12 * T, 3 * T + 10, 4 * T + 10), (crow(), 6 * T + 4, 7 * T + 16, 9 * T + 1),
             (bones(), 2 * T, 9 * T + 8, 9 * T + 22)]
    for k, an, i, fl, x, y in [("wren", "walk_side", 4, False, 10 * T, 6 * T + 26), ("tessa", "walk_side", 1, False, 8 * T, 6 * T + 22), ("companion", "idle_side", 0, True, 13 * T + 4, 6 * T + 24)]:
        fr, a = chibi(k, an, i, fl); items.append((("c", fr, a), x, y, y))
    place(c, items)
    return grade(c, cool=(0.82, 0.88, 0.96), vignette=0.6, fog=(TH * T * 0.62, 40))

if __name__ == "__main__":
    for name, fn in (("street", street), ("wilds", wilds)):
        im = fn(); im.resize((im.width * 2, im.height * 2), Image.NEAREST).save(f"concept2_{name}.png"); print(name, im.size)
