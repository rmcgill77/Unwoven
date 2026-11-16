"""Interior concepts: a poor home and the Hollow Oak, lit only by fire and candle so the cast shares the room's light."""
import math
import numpy as np
from PIL import Image, ImageDraw
from env import Spr, hx, h2, INK, T, chibi
from noise import vnoise
import env2
from env3 import cast, contact, weeds, stone, firewood, leaves

def planks(tx, ty, worn=True):
    """Long floor boards 8px wide running left-right; joints fall at random points along each board, not per tile."""
    s = Spr(T, T); px = s.im.load()
    for y in range(T):
        for x in range(T):
            wx, wy = tx * T + x, ty * T + y
            row = wy // 8
            seg = (wx + (h2(row, 5) % 70)) // (96 + h2(row, 6) % 64)   # which board along this row
            shade = h2(row * 31 + seg, 9) % 3
            base = ["#4e3a28", "#5a4430", "#644c34"][shade]
            v = vnoise(wx * 0.25, wy, 6, row + 3)
            c = base if v < 0.75 else "#6e5438"
            if worn and vnoise(wx, wy, 18, 41) > 0.8: c = "#3e2e20"
            if wy % 8 == 0: c = "#2a1e14"
            if (wx + (h2(row, 5) % 70)) % (96 + h2(row, 6) % 64) == 0: c = "#2a1e14"
            px[x, y] = hx(c)
    return s.im
def dirtfloor(tx, ty):
    s = Spr(T, T); px = s.im.load()
    for y in range(T):
        for x in range(T):
            wx, wy = tx * T + x, ty * T + y
            v = vnoise(wx, wy, 12, 7) * 0.7 + vnoise(wx, wy, 4, 8) * 0.3
            px[x, y] = hx("#3a3026" if v < 0.35 else "#4a3c2e" if v < 0.72 else "#56483a")
    for k in range(3):
        x, y = h2(tx, ty, k) % 28 + 2, h2(ty, tx, k) % 28 + 2
        s.line([(x, y), (x + 4, y - 1)], "#7a6a44")
    return s.im
def wall_upper(tx, damp=True, timber=3):
    s = Spr(T, T * 2); px = s.im.load()
    for y in range(T * 2):
        for x in range(T):
            wx = tx * T + x; v = vnoise(wx * 0.5, y * 0.2, 7, 61)
            c = "#7e735e" if v < 0.3 else "#8e8268" if v < 0.75 else "#9a8e74"
            if damp and vnoise(wx, y * 0.35, 10, 71) > 0.72 and y > 10: c = "#5e5848"   # damp stains creeping up
            px[x, y] = hx(c)
    s.rect(0, 0, T - 1, 5, "#2e2218"); s.rect(0, 0, T - 1, 1, "#0c080e")
    if tx % timber == 0: s.rect(0, 0, 5, T * 2 - 1, "#3a2a1e"); s.rect(5, 0, 5, T * 2 - 1, "#241810")
    if h2(tx, 9) % 3 == 0: s.line([(12, 20), (16, 30), (14, 40)], "#5a5040")   # crack
    return s.im
def wall_lower(tx):
    s = Spr(T, T); s.rect(0, 0, T - 1, T - 1, "#3e2e20")
    for x in range(0, T, 8): s.line([(x, 0), (x, T)], "#2a1e14")
    s.rect(0, 0, T - 1, 3, "#2e2218"); s.rect(0, 1, T - 1, 1, "#5a4430"); s.rect(0, T - 3, T - 1, T - 1, "#1a120c")
    for k in range(3):
        x = h2(tx, k) % 28; s.line([(x, 6), (x + 1, 20)], "#4a3828")
    return s.im

def hearth(big=False):
    W = 76 if big else 56; s = Spr(W, 84)
    s.rect(2, 0, W - 3, 82, "#56524e"); s.rect(2, 0, W - 3, 4, "#6a6662")
    for y in range(9, 82, 9):
        s.line([(2, y), (W - 3, y)], "#3e3a38")
        for x in range(2 + (y // 9 % 2) * 7, W - 2, 14): s.line([(x, y - 9), (x, y)], "#3e3a38")
    s.rect(W // 2 - 4, 4, W // 2 + 4, 30, "#2a2624")   # soot stain up the chimney breast
    for k in range(6): s.rect(W // 2 - 6 + h2(k, 3) % 12, 6 + k * 4, W // 2 - 4 + h2(k, 3) % 12, 8 + k * 4, "#3a3634")
    s.rect(10, 40, W - 11, 82, "#140c0a"); s.poly([(10, 40), (W // 2, 32), (W - 11, 40)], "#56524e")
    s.poly([(16, 82), (24, 58), (30, 68), (W // 2, 50), (W // 2 + 8, 66), (W - 18, 82)], "#c8602a")
    s.poly([(22, 82), (28, 66), (W // 2, 60), (W // 2 + 6, 70), (W - 24, 82)], "#e8a040"); s.poly([(W // 2 - 4, 82), (W // 2, 70), (W // 2 + 4, 82)], "#f6d880")
    s.rect(14, 78, W - 15, 82, "#3a2a1e"); s.rect(0, 34, W - 1, 38, "#3a2a1e")
    s.rect(W - 22, 52, W - 20, 78, "#2a2a30"); s.ell(W - 30, 62, W - 12, 76, "#2a2a30")   # pot on a hook
    return s.outline().im
def pallet():
    s = Spr(56, 34)
    s.poly([(2, 10), (50, 4), (54, 24), (6, 32)], "#7a6a44"); s.poly([(2, 10), (50, 4), (52, 12), (4, 18)], "#8e7c50")
    for k in range(8): x = 6 + k * 6; s.line([(x, 9 - k // 2), (x + 3, 28 - k // 2)], "#5e5032")
    s.poly([(18, 10), (50, 6), (52, 20), (20, 26)], "#4e4a44"); s.poly([(18, 10), (50, 6), (50, 9), (19, 13)], "#625e56")   # thin grey blanket
    s.line([(28, 12), (30, 24)], "#3a3632")
    return s.outline().im
def stool():
    s = Spr(20, 22); s.ell(1, 1, 18, 7, "#5e4630"); s.ell(3, 2, 16, 6, "#6a5036")
    for x in (3, 9, 15): s.line([(x, 6), (x - 1 + (x // 6), 21)], "#3e2e20", 2)
    return s.outline().im
def candle(lit=True):
    s = Spr(10, 18); s.ell(0, 13, 9, 17, "#5a5a5e"); s.rect(3, 6, 6, 14, "#d8ccaa"); s.rect(3, 6, 3, 14, "#ece2c4")
    if lit: s.poly([(4, 5), (5, 0), (6, 5)], "#f6c860"); s.px(5, 4, "#ffffff")
    return s.outline().im
def bucket():
    s = Spr(20, 20); s.ell(1, 1, 18, 7, "#4e3e2c"); s.poly([(1, 4), (18, 4), (16, 19), (3, 19)], "#5e4a34"); s.ell(3, 2, 16, 6, "#2c343c")
    s.rect(1, 9, 18, 10, "#3a383e"); return s.outline().im
def rags():
    s = Spr(30, 14); s.poly([(0, 12), (6, 4), (14, 6), (22, 2), (29, 10), (24, 13)], "#5e5a54"); s.poly([(6, 4), (14, 6), (12, 10)], "#706a62")
    return s.outline().im
def rat():
    s = Spr(18, 9); s.ell(4, 2, 14, 8, "#3e3a3c"); s.ell(12, 3, 17, 7, "#4a4648"); s.px(15, 4, "#d84a4a"); s.line([(4, 6), (0, 4)], "#5a4e4c")
    return s.outline().im
def longtable(w=4):
    W = w * T; s = Spr(W, 46)
    s.rect(1, 6, W - 2, 26, "#5e4630"); s.rect(1, 6, W - 2, 9, "#6e5438"); s.rect(1, 26, W - 2, 30, "#3e2e20")
    for x in (4, W - 9): s.rect(x, 30, x + 5, 45, "#3e2e20")
    for k in range(3): x = 12 + k * (W // 3); s.line([(x, 12), (x + 18, 13)], "#4a3828")   # knife scars
    for x, kind in ((18, 0), (52, 1), (W - 40, 0)):
        if kind == 0: s.rect(x, 4, x + 8, 14, "#7a6a50"); s.rect(x + 1, 5, x + 7, 7, "#c8b070")   # tankard
        else: s.ell(x, 8, x + 14, 16, "#8a8478"); s.ell(x + 3, 9, x + 11, 14, "#5a4a2a")       # bowl of stew
    return s.outline().im
def bench(w=4):
    W = w * T; s = Spr(W, 18); s.rect(1, 1, W - 2, 8, "#4e3a28"); s.rect(1, 1, W - 2, 2, "#5e4630")
    for x in (6, W - 10): s.rect(x, 8, x + 4, 17, "#3a2a1e")
    return s.outline().im
def bar(w=5):
    W = w * T; s = Spr(W, 52)
    s.rect(1, 10, W - 2, 50, "#4a3626"); s.rect(1, 4, W - 2, 12, "#6a5036"); s.rect(1, 4, W - 2, 5, "#7e6040")
    for x in range(10, W - 4, 22): s.rect(x, 16, x + 14, 46, "#3e2e20"); s.rect(x + 1, 17, x + 13, 18, "#5a4430")
    s.rect(1, 48, W - 2, 50, "#2a1e14")
    for x in (24, 70, 120): s.rect(x, 0, x + 7, 8, "#7a6a50")
    return s.outline().im
def keg():
    s = Spr(30, 28); s.ell(0, 2, 29, 26, "#5e4430"); s.ell(4, 6, 25, 22, "#6e5238")
    for x in (8, 21): s.rect(x, 3, x + 1, 25, "#3a383e")
    s.ell(11, 10, 18, 17, "#3e2e20"); s.rect(13, 14, 16, 20, "#8a8478"); return s.outline().im
def lantern_hang():
    s = Spr(16, 30); s.line([(8, 0), (8, 8)], "#2a2a30"); s.rect(3, 8, 12, 24, "#2a2a30"); s.rect(5, 10, 10, 22, "#e8a840"); s.rect(5, 10, 10, 12, "#f6d880")
    s.poly([(2, 8), (8, 4), (14, 8)], "#2a2a30"); return s.outline().im
def shelf():
    s = Spr(56, 46); s.rect(1, 1, 54, 44, "#3a2a1e")
    for y in (14, 28, 42): s.rect(1, y, 54, y + 2, "#5e4630")
    for k, x in enumerate(range(5, 50, 9)):
        h = 8 + h2(k, 4) % 4; c = ["#5a6a4a", "#7a5a3a", "#4e5a6a", "#8a7a5a"][k % 4]
        s.rect(x, 14 - h, x + 5, 13, c); s.rect(x + 1, 28 - h + 2, x + 5, 27, ["#8a8478", "#6a5a4a"][k % 2])
    return s.outline().im

def light(c, lights, ambient=0.32):
    """Darken the whole room, then add warm pools around fire and candles. Applied to the cast as well."""
    a = np.array(c).astype(np.float32); H, W = a.shape[:2]; yy, xx = np.mgrid[0:H, 0:W]
    L = np.full((H, W), ambient, np.float32); warm = np.zeros((H, W, 3), np.float32)
    for (lx, ly, r, s, col) in lights:
        d = np.sqrt((xx - lx) ** 2 + ((yy - ly) * 1.25) ** 2); f = np.clip(1 - d / r, 0, 1) ** 1.6 * s
        L += f; warm += f[:, :, None] * np.array(col, np.float32)[None, None, :]
    L = np.clip(L, 0, 1.15)
    a[:, :, :3] = a[:, :, :3] * L[:, :, None] * np.array([0.94, 0.9, 0.98]) + warm * 0.18
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))

def ch(items, key, anim, i, fl, x, y):
    fr, an = chibi(key, anim, i, fl); items.append((("c", fr, an), x, y, y))

def poor_home():
    TW, TH = 12, 9; c = Image.new("RGBA", (TW * T, TH * T), hx("#0c080e"))
    for tx in range(TW):
        c.paste(wall_upper(tx), (tx * T, 0)); c.paste(wall_lower(tx), (tx * T, 2 * T))
    for ty in range(3, TH):
        for tx in range(TW): c.paste(dirtfloor(tx, ty), (tx * T, ty * T))
    items = []
    hh = hearth(); cast(c, hh, 1 * T, 1 * T - 4, 6, 4); items.append((hh, 1 * T, 1 * T - 4, 3 * T + 2))
    for spr, x, y in ((pallet(), 8 * T + 10, 3 * T + 18), (stool(), 4 * T + 6, 4 * T + 22), (bucket(), 3 * T + 4, 3 * T + 4), (rags(), 9 * T, 6 * T + 12),
                      (firewood(), 4 * T - 6, 2 * T + 30), (candle(), 7 * T + 4, 3 * T + 6), (rat(), 10 * T + 18, 7 * T + 22)):
        cast(c, spr, x, y, 4, 3, 0.35); contact(c, x + 2, x + spr.size[0] - 2, y + spr.size[1] - 3, 4, 0.3); items.append((spr, x, y, y + spr.size[1]))
    for (bx, by, bw) in ((5 * T, 5 * T + 4, 70), (6 * T + 10, 6 * T + 2, 54)):
        bd = Spr(bw, 8); bd.rect(0, 0, bw - 1, 7, "#5a4430"); bd.rect(0, 0, bw - 1, 1, "#6e5438"); bd.line([(bw // 2, 0), (bw // 2, 7)], "#3a2a1e"); bd.outline()
        cast(c, bd.im, bx, by, 2, 2, 0.3); c.alpha_composite(bd.im, (bx, by))
    leaves(c, 6 * T, 7 * T, 3 * T, T, 14, 3)
    ch(items, "maud", "idle_side", 0, False, 3 * T + 20, 5 * T + 16)
    ch(items, "wren", "idle_down", 0, False, 7 * T + 4, 7 * T + 14)
    env2.place(c, items)
    return light(c, [(2 * T + 12, 2 * T + 30, 150, 0.95, (255, 150, 70)), (7 * T + 9, 3 * T + 8, 60, 0.5, (255, 200, 120))], ambient=0.4)

def tavern():
    TW, TH = 16, 10; c = Image.new("RGBA", (TW * T, TH * T), hx("#0c080e"))
    for tx in range(TW):
        c.paste(wall_upper(tx, damp=tx > 10, timber=4), (tx * T, 0)); c.paste(wall_lower(tx), (tx * T, 2 * T))
    for ty in range(3, TH):
        for tx in range(TW): c.paste(planks(tx, ty), (tx * T, ty * T))
    items = []
    hh = hearth(True); cast(c, hh, 12 * T, 1 * T - 10, 6, 4); items.append((hh, 12 * T, 1 * T - 10, 3 * T + 2))
    sh = shelf(); items.append((sh, 2 * T, 18, 2 * T + 30)); sh2 = shelf(); items.append((sh2, 4 * T, 18, 2 * T + 30))
    br = bar(5); cast(c, br, 1 * T, 3 * T + 6, 6, 4); items.append((br, 1 * T, 3 * T + 6, 4 * T + 26))
    for spr, x, y in ((keg(), 6 * T + 8, 2 * T + 24), (keg(), 7 * T + 10, 2 * T + 30), (lantern_hang(), 8 * T, 2), (lantern_hang(), 3 * T + 10, 34)):
        items.append((spr, x, y, y + spr.size[1]))
    for (x, y) in ((8 * T, 5 * T + 10), (8 * T, 7 * T + 26)):
        tb = longtable(4); bn1, bn2 = bench(4), bench(4)
        for spr, sx, sy in ((bn1, x, y - 6), (tb, x, y), (bn2, x, y + 40)):
            cast(c, spr, sx, sy, 5, 3, 0.35); contact(c, sx + 2, sx + spr.size[0] - 2, sy + spr.size[1] - 3, 4, 0.3); items.append((spr, sx, sy, sy + spr.size[1]))
    for spr, x, y in ((stool(), 3 * T, 5 * T + 10), (stool(), 5 * T, 5 * T + 14), (bucket(), 1 * T + 6, 6 * T + 20), (rags(), 14 * T, 8 * T + 18), (candle(), 9 * T + 20, 5 * T + 6)):
        cast(c, spr, x, y, 4, 3, 0.35); items.append((spr, x, y, y + spr.size[1]))
    leaves(c, 4 * T, 8 * T, 4 * T, T, 10, 8)
    ch(items, "bram", "idle_down", 0, False, 3 * T + 4, 4 * T + 2)
    ch(items, "tessa", "idle_side", 0, False, 6 * T + 10, 6 * T + 26)
    ch(items, "joss", "idle_side", 0, True, 10 * T + 20, 6 * T + 4)
    ch(items, "garrick", "idle_down", 0, False, 14 * T, 6 * T + 10)
    ch(items, "wren", "walk_up", 2, False, 9 * T + 10, 9 * T + 20)
    env2.place(c, items)
    return light(c, [(13 * T + 6, 2 * T + 30, 210, 1.0, (255, 140, 60)), (8 * T + 8, 22, 130, 0.6, (255, 190, 110)), (3 * T + 18, 52, 110, 0.55, (255, 190, 110)),
                     (9 * T + 25, 5 * T + 8, 60, 0.4, (255, 200, 120))], ambient=0.42)

if __name__ == "__main__":
    for name, fn in (("home", poor_home), ("tavern", tavern)):
        im = fn(); im.resize((im.width * 2, im.height * 2), Image.NEAREST).save(f"concept4_{name}.png"); print(name)
