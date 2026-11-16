"""Gritty concept v3: structures grounded in the scene and much more ground detail."""
import math
import numpy as np
from PIL import Image, ImageDraw
from env import Spr, hx, h2, INK, T, chibi, shadow
from noise import vnoise
import env2
from env2 import ground, road, bog, hovel, stonehouse, smoke, deadtree, thintree, brokenfence, pillory, laundry, refuse, barrel, crate, crow, lamp, bones, wreck, cairn, grade, GR, MUD

def cast(c, spr, x, y, dx=10, dy=5, a=0.42):
    """Drop shadow: the sprite's silhouette pushed down-right, drawn under it."""
    m = np.array(spr)[:, :, 3] > 0
    sh = np.zeros((m.shape[0], m.shape[1], 4), np.uint8); sh[m] = (8, 6, 14, int(255 * a))
    c.alpha_composite(Image.fromarray(sh), (x + dx, y + dy))
def contact(c, x0, x1, y, depth=8, a=0.45):
    """Dark band where a wall or trunk meets the ground."""
    band = Image.new("RGBA", (x1 - x0, depth)); d = ImageDraw.Draw(band)
    for k in range(depth): d.line([(0, k), (x1 - x0, k)], fill=(8, 6, 14, int(255 * a * (1 - k / depth))))
    c.alpha_composite(band, (x0, y))
def mud_patch(c, cx, cy, rx, ry, seed=0):
    """Trampled mud spreading out from a doorway or a wall foot, ragged edge."""
    pts = []
    for k in range(18):
        a = k / 18 * 2 * math.pi; r = 0.75 + (h2(k, seed) % 100) / 400
        pts.append((cx + math.cos(a) * rx * r, cy + math.sin(a) * ry * r))
    im = Image.new("RGBA", c.size); d = ImageDraw.Draw(im); d.polygon(pts, fill=hx(MUD["m1"]))
    inner = [(cx + (px - cx) * 0.6, cy + (py - cy) * 0.6) for px, py in pts]; d.polygon(inner, fill=hx(MUD["m0"]))
    for k in range(5):
        x, y = cx + (h2(k, seed + 3) % (2 * rx)) - rx, cy + (h2(k, seed + 5) % (2 * ry)) - ry
        d.ellipse([x - 2, y - 1, x + 3, y + 1], fill=hx(MUD["wet"]))
    c.alpha_composite(im)
def track(c, pts, w=10, seed=0):
    """A worn footpath: a continuous ragged strip of trampled mud, lighter in the middle where feet go."""
    im = Image.new("RGBA", c.size); d = ImageDraw.Draw(im)
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        n = int(math.hypot(x1 - x0, y1 - y0) / 2) + 1
        for i in range(n + 1):
            t = i / n; x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
            r = w * (0.8 + (h2(i, seed) % 100) / 400)
            d.ellipse([x - r, y - r * 0.5, x + r, y + r * 0.5], fill=hx(MUD["m0"]))
        for i in range(n + 1):
            t = i / n; x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
            r = w * 0.55
            d.ellipse([x - r, y - r * 0.45, x + r, y + r * 0.45], fill=hx(MUD["m1"]))
        for i in range(0, n, 5):
            t = i / n; x, y = x0 + (x1 - x0) * t + (h2(i, seed + 3) % 6) - 3, y0 + (y1 - y0) * t
            d.ellipse([x, y, x + 2, y + 4], fill=hx(MUD["wet"]))
    c.alpha_composite(im)

def weeds(kind=0):
    s = Spr(14, 14)
    if kind == 0:   # grass clump
        for k, (x, h) in enumerate(((2, 9), (4, 12), (6, 8), (8, 11), (10, 7))):
            s.line([(x, 13), (x + (k % 3) - 1, 13 - h)], ["#445036", "#55603e", "#3a4630"][k % 3])
    elif kind == 1:   # nettles / broad weed
        s.poly([(6, 13), (2, 6), (6, 8)], "#3e4a30"); s.poly([(7, 13), (12, 5), (8, 9)], "#4c5838"); s.poly([(6, 13), (6, 2), (8, 8)], "#55603e")
    else:   # dead straw tuft
        for k, (x, h) in enumerate(((3, 8), (5, 11), (7, 9), (9, 10))): s.line([(x, 13), (x + 1, 13 - h)], ["#7a7452", "#5e5c40"][k % 2])
    return s.outline().im if kind == 1 else s.im
def stone(sz=0):
    s = Spr(10, 8)
    if sz: s.poly([(1, 7), (2, 3), (6, 1), (9, 4), (8, 7)], "#5e5c60"); s.poly([(2, 3), (6, 1), (6, 4)], "#767478")
    else: s.poly([(1, 5), (3, 2), (6, 3), (5, 5)], "#5e5c60"); s.px(3, 2, "#767478")
    return s.outline().im
def root():
    s = Spr(26, 10); s.line([(0, 8), (8, 6), (16, 7), (25, 4)], "#3a3026", 2); s.line([(10, 6), (14, 2)], "#3a3026"); return s.outline().im
def firewood():
    s = Spr(40, 26)
    for r in range(3):
        for k in range(5 - r):
            x, y = 2 + k * 7 + r * 3, 18 - r * 7
            s.ell(x, y, x + 8, y + 7, "#6a5236"); s.ell(x + 2, y + 2, x + 6, y + 5, "#a8885a"); s.px(x + 4, y + 3, "#6a5236")
    return s.outline().im
def raindrum():
    s = Spr(24, 30); s.ell(1, 1, 22, 8, "#4e3826"); s.rect(1, 4, 22, 26, "#4e3826"); s.ell(1, 22, 22, 29, "#4e3826")
    s.ell(4, 2, 19, 7, "#2c343c"); s.line([(7, 4), (12, 4)], "#5a6a74"); s.rect(1, 4, 4, 26, "#5e4430")
    for y in (9, 20): s.rect(1, y, 22, y + 1, "#3a383e")
    return s.outline().im
def leanto():
    s = Spr(60, 70)
    s.poly([(0, 18), (58, 6), (58, 12), (0, 24)], "#4a3e2a"); s.poly([(0, 18), (58, 6), (58, 9), (0, 21)], "#5e5032")
    for x in (2, 54): s.rect(x, 18, x + 3, 69, "#3a2a1e")
    s.rect(6, 40, 50, 68, "#2a2420"); s.rect(8, 52, 26, 68, "#5a4630"); s.rect(28, 56, 48, 68, "#4e3e2c")
    s.line([(8, 56), (26, 56)], "#3e3022"); s.line([(28, 60), (48, 60)], "#3a2c20")
    return s.outline().im
def footprints(c, x, y, n=5, seed=0):
    d = ImageDraw.Draw(c)
    for k in range(n):
        px, py = x + k * 9, y + (4 if k % 2 else 0) + (h2(k, seed) % 3)
        d.ellipse([px, py, px + 3, py + 5], fill=hx(MUD["wet"]))
def leaves(c, x0, y0, w, h, n=12, seed=0):
    d = ImageDraw.Draw(c)
    for k in range(n):
        x, y = x0 + h2(k, seed) % w, y0 + h2(k, seed + 9) % h
        col = ["#6a5236", "#7a6440", "#5a4a30"][k % 3]; d.rectangle([x, y, x + 1, y], fill=hx(col)); d.point((x + 2, y + 1), fill=hx(col))

def moss_line(c, x0, x1, y, seed=0):
    d = ImageDraw.Draw(c)
    for x in range(x0, x1):
        if vnoise(x, 0, 6, seed) > 0.45:
            h = 1 + int(vnoise(x, 3, 3, seed + 1) * 3); d.line([(x, y - h), (x, y)], fill=hx("#4e5a38"))

def building(c, items, spr, x, y, door=None, wall=None, seed=0, foot_mud=True):
    """Place a structure so it belongs to the ground: shadow, contact darkening, mud and weeds at its foot."""
    W, H = spr.size; base = y + H - 1
    cast(c, spr, x, y)
    if foot_mud:
        for k in range(0, W, 18): mud_patch(c, x + k + 8, base + 2, 12, 4, seed + k)
    contact(c, x + 4, x + W - 2, base - 1, 9)
    items.append((spr, x, y, base))
    # weeds and stones along the foot, drawn in front of the wall
    for k in range(int(W / 11)):
        wx = x + 4 + k * 11 + h2(k, seed) % 6
        kind = h2(k, seed + 1) % 3
        if h2(k, seed + 2) % 4: items.append((weeds(kind), wx, base - 11 + h2(k, seed + 4) % 4, base + 1))
        if h2(k, seed + 5) % 3 == 0: items.append((stone(h2(k, seed + 6) % 2), wx + 4, base - 3, base + 2))
    if door: track(c, door, 7, seed + 40)

def scatter(c, items, region, n, seed, near=None):
    x0, y0, x1, y1 = region
    for k in range(n):
        x, y = x0 + h2(k, seed) % (x1 - x0), y0 + h2(k, seed + 1) % (y1 - y0)
        r = h2(k, seed + 2) % 10
        if r < 4: items.append((weeds(r % 3), x, y, y + 13))
        elif r < 6: items.append((stone(r % 2), x, y, y + 7))
        elif r == 6: items.append((root(), x, y, y + 8))
        else: leaves(c, x, y, 20, 10, 6, seed + k)

def street():
    TW, TH = 22, 13
    c = Image.new("RGBA", (TW * T, TH * T))
    road_set = set()
    for x in range(TW): road_set |= {(x, 8), (x, 9)}
    for y in range(4, 13): road_set |= {(11, y), (12, y)}
    for ty in range(TH):
        for tx in range(TW):
            c.paste(road(tx, ty, (tx, ty - 1) in road_set, (tx + 1, ty) in road_set, (tx, ty + 1) in road_set, (tx - 1, ty) in road_set, horiz=ty in (8, 9)) if (tx, ty) in road_set else ground(tx, ty), (tx * T, ty * T))
    items = []
    h1, h2_, sh = hovel(4), hovel(3), stonehouse(5)
    building(c, items, h1, 0, -6, door=[(4 * T // 2 + 28, 136 - 6), (4 * T // 2 + 34, 8 * T + 4)], seed=11)
    lt = leanto(); building(c, items, lt, 4 * T + 2, 66, seed=17, foot_mud=False)
    building(c, items, h2_, 5 * T + 26, 12, door=[(5 * T + 26 + 3 * T // 2 + 28, 148), (6 * T + 60, 8 * T + 4)], seed=23)
    building(c, items, sh, 14 * T + 4, -36, door=[(14 * T + 4 + 5 * T // 2 + 6, 132), (15 * T + 70, 8 * T + 4)], seed=31)
    items.append((smoke(), 14 * T + 5 * T - 40, -50, 0))
    # soot above the stonehouse chimney, moss creeping along hovel roof edges
    moss_line(c, 2, 4 * T + 10, 60 - 6 + 2, 3)
    # lived-in things against the walls
    for spr, x, y in ((firewood(), 3 * T + 10, 112), (raindrum(), 14 * T + 10, 104), (barrel(), 18 * T + 6, 104), (crate(True), 9 * T - 2, 6 * T + 10),
                      (barrel(), 10 * T + 6, 6 * T + 2), (refuse(), 4 * T, 10 * T + 18), (crate(), 16 * T, 10 * T + 6)):
        cast(c, spr, x, y, 4, 3, 0.35); items.append((spr, x, y, y + spr.size[1]))
    for spr, x, y in ((laundry(), 1 * T, 5 * T - 4), (brokenfence(4), 1 * T, 6 * T + 6), (pillory(), 8 * T + 6, 9 * T + 32), (lamp(), 13 * T + 8, 6 * T - 2)):
        cast(c, spr, x, y, 6, 3, 0.35); items.append((spr, x, y, y + spr.size[1]))
    tr = thintree(); cast(c, tr, 19 * T, 9 * T - 40, 12, 4); contact(c, 19 * T + 28, 19 * T + 44, 9 * T + 56, 6)
    items.append((tr, 19 * T, 9 * T - 40, 12 * T)); items.append((root(), 19 * T + 38, 9 * T + 52, 12 * T + 1)); items.append((root(), 19 * T + 6, 9 * T + 54, 12 * T + 1))
    # mud thrown up along the road verges, footprints and leaves
    for k in range(0, TW * T, 20): mud_patch(c, k + 6, 8 * T + 2, 9, 3, 100 + k); mud_patch(c, k + 10, 10 * T - 2, 9, 3, 300 + k)
    footprints(c, 3 * T, 9 * T + 8, 8, 2); footprints(c, 12 * T - 6, 10 * T + 12, 3, 5)
    scatter(c, items, (0, 5 * T, TW * T, 8 * T), 40, 501)
    scatter(c, items, (0, 10 * T + 4, TW * T, TH * T - 14), 46, 601)
    scatter(c, items, (8 * T, 2 * T, 14 * T, 5 * T), 18, 701)
    for spr, x, y in ((crow(), 8 * T + 14, 9 * T + 24), (crow(), 2 * T + 6, 6 * T), (crow(), 16 * T + 20, 4 * T - 6)): items.append((spr, x, y, y + 20))
    for k, an, i, fl, x, y in [("wren", "walk_side", 2, False, 7 * T, 9 * T + 6), ("tessa", "idle_down", 0, False, 11 * T + 16, 8 * T + 10),
                               ("tomas", "idle_side", 0, True, 15 * T + 8, 9 * T + 6), ("maud", "idle_down", 0, False, 3 * T, 9 * T + 14), ("joss", "walk_up", 3, False, 12 * T + 6, 11 * T + 10)]:
        fr, a = chibi(k, an, i, fl); items.append((("c", fr, a), x, y, y))
    env2.place(c, items)
    return grade(c)

def wilds():
    TW, TH = 22, 11
    c = Image.new("RGBA", (TW * T, TH * T))
    trail = {(x, 6) for x in range(TW)} | {(x, 7) for x in range(4, 15)}
    for ty in range(TH):
        for tx in range(TW):
            if ty >= 8 and tx >= 13: c.paste(bog(tx, ty, ty > 8), (tx * T, ty * T)); continue
            c.paste(road(tx, ty, (tx, ty - 1) in trail, (tx + 1, ty) in trail, (tx, ty + 1) in trail, (tx - 1, ty) in trail, horiz=True) if (tx, ty) in trail else ground(tx, ty), (tx * T, ty * T))
    items = []
    # ragged bank: ground creeps over the bog's straight tile edge, with a dark waterline and reeds
    gl = Image.new("RGBA", c.size)
    for ty in range(6, TH):
        for tx in range(11, TW): gl.paste(ground(tx, ty), (tx * T, ty * T))
    m = Image.new("L", c.size, 0); md = ImageDraw.Draw(m)
    bx, by = 13 * T, 8 * T
    top = [(TW * T, by - 4)] + [(TW * T - i * 6, by + 3 + (h2(i, 7) % 9)) for i in range((TW * T - bx) // 6 + 1)] + [(bx + 6 + (h2(99, 1) % 6), by + 10)]
    left = [(bx + 4 + (h2(i, 13) % 10), by + 10 + i * 6) for i in range((TH * T - by) // 6 + 1)]
    md.polygon(top + left + [(bx - 4, TH * T), (bx - 4, by - 4)], fill=255)
    a = np.array(c); g = np.array(gl); mk = np.array(m) > 0
    edge = np.zeros_like(mk)
    edge[1:, :] |= mk[1:, :] & ~mk[:-1, :]; edge[:-1, :] |= mk[:-1, :] & ~mk[1:, :]; edge[:, 1:] |= mk[:, 1:] & ~mk[:, :-1]; edge[:, :-1] |= mk[:, :-1] & ~mk[:, 1:]
    region = np.zeros_like(mk); region[by - 4:, bx - 4:] = True
    a[mk & region] = g[mk & region]
    ring = edge & region & ~mk
    a[np.roll(ring, 0, 0)] = (14, 18, 18, 255)
    c = Image.fromarray(a)
    for k in range(16):
        x = bx + 8 + h2(k, 51) % (TW * T - bx - 16); y = by + 6 + h2(k, 52) % 10
        if h2(k, 53) % 2: items.append((weeds(0), x, y, y + 14))
    for spr, x, y, sy in ((deadtree(), 1 * T, 0, 3 * T), (deadtree(), 15 * T, -10, 3 * T - 6), (thintree(), 8 * T, 1 * T - 20, 3 * T + 8), (deadtree(), 19 * T + 6, 4 * T - 30, 7 * T - 20)):
        cast(c, spr, x, y, 14, 5, 0.38); W, H = spr.size; contact(c, x + W // 2 - 10, x + W // 2 + 12, y + H - 4, 6)
        items.append((spr, x, y, sy)); items.append((root(), x + W // 2 - 20, y + H - 6, sy + 1)); items.append((root(), x + W // 2 + 2, y + H - 4, sy + 1))
    for spr, x, y in ((wreck(), 5 * T, 7 * T + 18), (bones(), 9 * T + 10, 9 * T + 6), (cairn(), 12 * T, 3 * T + 10), (bones(), 2 * T, 9 * T + 8)):
        cast(c, spr, x, y, 6, 3, 0.35); items.append((spr, x, y, y + spr.size[1]))
    mud_patch(c, 5 * T + 36, 8 * T + 10, 34, 8, 9)
    scatter(c, items, (0, 1 * T, TW * T, 6 * T - 4), 70, 801)
    scatter(c, items, (0, 8 * T, 13 * T, TH * T - 14), 40, 901)
    for k in range(0, TW * T, 20): mud_patch(c, k + 6, 6 * T + 2, 9, 3, 140 + k)
    footprints(c, 1 * T, 6 * T + 18, 14, 3)
    items.append((crow(), 6 * T + 4, 7 * T + 16, 9 * T + 1)); items.append((crow(), 16 * T + 20, 1 * T + 10, 3 * T))
    for k, an, i, fl, x, y in [("wren", "walk_side", 4, False, 10 * T, 6 * T + 26), ("tessa", "walk_side", 1, False, 8 * T, 6 * T + 22), ("companion", "idle_side", 0, True, 13 * T + 4, 6 * T + 24)]:
        fr, a = chibi(k, an, i, fl); items.append((("c", fr, a), x, y, y))
    env2.place(c, items)
    return grade(c, cool=(0.82, 0.88, 0.96), vignette=0.6, fog=(TH * T * 0.62, 40))

if __name__ == "__main__":
    for name, fn in (("street", street), ("wilds", wilds)):
        im = fn(); im.resize((im.width * 2, im.height * 2), Image.NEAREST).save(f"concept3_{name}.png"); print(name)
