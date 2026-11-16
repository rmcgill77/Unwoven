import math
import numpy as np
from PIL import Image, ImageDraw
import ctx, cast3, anim2, walkgen, frontwalk
from rebase import hx, mix
from cast2 import PX, PY
INK = (0, 0, 0)
NECK = 41
LOOK = {   # hair (A light, B base, D dark), body (outL, out), extras
  "Wren (you)": dict(hair=("#5a3540", "#3b2027", "#24161c"), body=("#283540", "#122020")),
  "Tessa": dict(hair=("#c4643a", "#a64a2a", "#6a2a18"), body=("#6a7a44", "#3e4a28"), pony=True, bow="#e8dcbe"),
  "Bram": dict(hair=("#7e5434", "#5e3e24", "#3a2416"), body=("#8a4238", "#5a2624"), ties="#d6ceba"),
  "Kellan Vex": dict(hair=("#34344c", "#20202e", "#0c0c14"), body=("#4a3a68", "#261c38"), hem="#d4a840", vent=True, sleek=True),
  "Hooded companion": dict(hood=("#6a707c", "#4c5058", "#30333c"), body=("#5c606c", "#30333c"), belt="#2a1c12"),
  "Old mentor": dict(hair=("#eceaf0", "#cfcbd6", "#8a8494"), body=("#3e4a6e", "#222a44"), bald=("#f2c4a2", "#c08870"), hem="#d4a840"),
}
def back_from_front(front, L):
    f = front[:, ::-1].copy()                       # mirror the dressed front view
    H, W = f.shape[:2]
    m = f[:, :, 3] > 0
    out = np.zeros_like(f)
    nk, lt = NECK + PY, walkgen.LEG_TOP + PY
    cx, cy = 24 + PX, 6 + PY
    rows = [np.where(m[y])[0] for y in range(H)]
    for y in range(H):
        xs = rows[y]
        if not len(xs): continue
        x0, x1 = xs.min(), xs.max()
        for x in xs:
            if y >= lt: out[y, x] = f[y, x]; continue          # boots stay as drawn
            if y < nk:   # head from behind
                if "hood" in L:
                    A, B, D = map(hx, L["hood"]); col = A if x < cx - 6 else B
                    if y > 18 + PY and (x - cx) % 7 == 0: col = D
                elif "bald" in L and y < 22 + PY:
                    col = hx(L["bald"][0]) if x < cx + 6 else hx(L["bald"][1])
                    if y == 8 + PY and cx - 8 < x < cx - 3: col = mix(hx(L["bald"][0]), (255, 255, 255), 0.5)
                else:
                    A, B, D = map(hx, L["hair"])
                    dist = math.hypot(x - cx, y - cy)
                    col = A if (x < cx - 2 and dist < 16 and y < 24 + PY) else B
                out[y, x] = (*col, 255)
            else:        # cloak back
                oL, o = map(hx, L["body"])
                t = (x - x0) / max(1, x1 - x0)
                col = oL if t < 0.32 else o
                if y < nk + 8: col = oL if t < 0.7 else o                 # hood bunched on the shoulders
                if y == nk + 8 and 0.15 < t < 0.85: col = INK
                if y > nk + 10 and abs(x - (x0 + x1) / 2) < 0.6: col = mix(o, (0, 0, 0), 0.35)   # centre seam
                if y == lt - 2: col = hx(L["hem"]) if "hem" in L else oL
                out[y, x] = (*col, 255)
    # outer outline = the mirrored silhouette edge; plus a line where hair meets the cloak
    for y in range(H):
        for x in range(W):
            if not m[y, x]: continue
            edge = any(not (0 <= y + dy < H and 0 <= x + dx < W and m[y + dy, x + dx]) for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)))
            if edge and y < lt: out[y, x] = (*INK, 255)
            if y == nk and m[y - 1, x]: out[y, x] = (*INK, 255)
    if "hair" in L and "bald" not in L:
        A, B, D = map(hx, L["hair"])
        hairmask = m.copy(); hairmask[nk:] = False
        rnd = np.random.RandomState(7)
        angs = [12, 30, 47, 61, 78, 92, 104, 121, 138, 152, 168] if not L.get("sleek") else [20, 50, 80, 100, 130, 160]
        for k, a0 in enumerate(angs):
            a = math.radians(a0 + rnd.uniform(-5, 5)); r0 = 4 + (k % 3)
            bend = rnd.uniform(-0.25, 0.25)
            rmax = 60 if k % 3 == 0 else rnd.uniform(12, 22)
            for r in np.arange(r0, rmax, 0.5):
                aa = a + bend * (r / 30.0)
                x, y = int(round(cx + math.cos(aa) * r)), int(round(cy + math.sin(aa) * r * 0.95))
                if not (0 <= y < H and 0 <= x < W) or not hairmask[y, x]: break
                if tuple(out[y, x, :3]) != INK: out[y, x] = (*D, 255)
        for (a0, r0, r1) in ((200, 4, 11), (215, 5, 13), (235, 3, 8)):
            a = math.radians(a0)
            for r in np.arange(r0, r1, 0.5):
                x, y = int(round(cx + math.cos(a) * r)), int(round(cy - math.sin(a) * r * -0.6 + 4))
                if 0 <= y < H and 0 <= x < W and hairmask[y, x] and tuple(out[y, x, :3]) not in (INK, D): out[y, x] = (*mix(A, (255, 255, 255), 0.25), 255)
    im = Image.fromarray(out); d = ImageDraw.Draw(im)
    if "hood" not in L:   # hair hangs over the hood in jagged ends
        A, B, D = map(hx, L["hair"])
        hx_cols = [x for x in range(W) if m[nk - 1, x]]
        if hx_cols:
            xa, xb = min(hx_cols) + 2, max(hx_cols) - 2
            lens = [4, 2, 5, 3, 1, 4, 2, 5, 3]
            arr = np.array(im)
            for i, x0 in enumerate(range(xa, xb, 4)):
                ln = lens[i % len(lens)]
                for dy in range(ln + 1):
                    hw = max(0, round((ln - dy) * 1.6 / max(1, ln)))
                    xs_ = range(x0 - hw, x0 + hw + 1)
                    for x in xs_:
                        y = nk + dy
                        if not (0 <= y < H and 0 <= x < W): continue
                        arr[y, x] = (*(INK if (x in (x0 - hw, x0 + hw) or dy == ln) else B), 255)
            im = Image.fromarray(arr); d = ImageDraw.Draw(im)
    P = lambda pts: [(x + PX, y + PY) for x, y in pts]
    if L.get("pony"):
        A, B, D = map(hx, L["hair"])
        d.polygon(P([(20, 8), (28, 8), (30, 24), (29, 40), (27, 52), (24, 56), (21, 52), (19, 40), (18, 24)]), fill=(*B, 255), outline=(*INK, 255))
        for xx in (22, 25, 27): d.line(P([(xx, 12), (xx, 50)]), fill=(*D, 255))
        d.line(P([(20, 14), (21, 40)]), fill=(*A, 255))
        d.rectangle(P([(20, 8), (28, 11)]), fill=(*hx("#3e6a3a"), 255), outline=(*INK, 255))
    if L.get("bow"):
        c = (*hx(L["bow"]), 255)
        d.polygon(P([(19, 56), (24, 58), (19, 61)]), fill=c, outline=(*INK, 255)); d.polygon(P([(29, 56), (24, 58), (29, 61)]), fill=c, outline=(*INK, 255))
        d.line(P([(23, 59), (21, 66)]), fill=c); d.line(P([(25, 59), (27, 66)]), fill=c)
    if L.get("ties"):
        c = (*hx(L["ties"]), 255)
        d.line(P([(14, 52), (34, 62)]), fill=c); d.line(P([(34, 52), (14, 62)]), fill=c); d.line(P([(13, 57), (35, 57)]), fill=c)
    if L.get("vent"): d.line(P([(24, 60), (24, 69)]), fill=(*INK, 255))
    if L.get("belt"): d.rectangle(P([(13, 60), (35, 62)]), fill=(*hx(L["belt"]), 255))
    if "bald" in L:   # white hair from ear height down to the nape, jagged top edge, vertical strands
        A, B, D = map(hx, L["hair"])
        arr = np.array(im)
        for x in range(W):
            edge = abs(x - cx) > 9
            top = (24 if edge else 29) + PY + (2 if x % 5 in (1, 2) else 0) - (1 if x % 7 == 3 else 0)
            for y in range(top, nk):
                if m[y, x] and arr[y, x, 3] and tuple(arr[y, x, :3]) != INK:
                    arr[y, x] = (*(D if x % 4 == 0 else (A if x < cx - 3 else B)), 255)
            if m[top - 1, x] and tuple(arr[top - 1, x, :3]) != INK and arr[top - 1, x, 3] and top - 1 < nk: arr[top - 1, x] = (*D, 255)
        im = Image.fromarray(arr)
    return np.array(im)
if __name__ == "__main__":
    ctx.MODE = "front"
    fronts = frontwalk.dress_all([frontwalk.ref])[0]
    names = [n for n, _ in cast3.CAST4]
    backs = [back_from_front(fr, LOOK[n]) for fr, n in zip(fronts, names)]
    walks = [walkgen.walk_frames8(b) for b in backs]
    rows = [[walks[ci][fi] for ci in range(len(names))] for fi in range(len(walks[0]))]
    frontwalk.save(rows, "walk_up", dur=100)
    S = 6; h, w = backs[0].shape[:2]
    g = Image.new("RGB", (w * S * len(names) * 2, h * S), "#1c1730")
    for ci, (fr, bk) in enumerate(zip(fronts, backs)):
        for k, a in enumerate((fr, bk)):
            im = Image.fromarray(a).resize((w * S, h * S), Image.NEAREST); g.paste(im, ((ci * 2 + k) * w * S, 0), im)
    g.save("front_back.png")
