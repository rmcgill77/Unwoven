"""Bake the player's hairstyle atlases (world + battle) with an extended role map for runtime recolouring."""
import base64, io, json, sys
import numpy as np
from PIL import Image
import ctx, bake, side
from anim import centroid, EYE
from cast2 import PX, PY
from rebase import hx, mix, ROLE
import wrenstyles as W
ROLES = ["skin", "skinD", "hairA", "hairB", "hairD", "hairHi", "outL", "out", "backA", "backHL", "eye0", "eye1", "eye2", "eye3", "eye4", "in", "inD"]
FAC = 14
for s in W.STYLES:
    k = "wren_" + s
    bake.BACK_HOOK[k] = W.back_extra(s)
    if s == "braid":
        bake.FRONT_FN[k + "_nb"] = (lambda: W.front("braid")); bake.SIDE_FN[k + "_nb"] = (lambda: W.side("braid", False)); bake.LOOK[k + "_nb"] = bake.LOOK["wren"]
    if s in W.BACK_BASE: bake.BACK_BASE[k] = "wren_" + W.BACK_BASE[s]
    bake.FRONT_FN[k] = (lambda s=s: W.front(s)); bake.SIDE_FN[k] = (lambda s=s: W.side(s)); bake.LOOK[k] = bake.LOOK["wren"]; bake.VARIANTS[k] = (k, None, None)

def role_img(frames):
    wl = bake.LOOK["wren"]; A, B, D = map(hx, wl["hair"]); HL = mix(A, (255, 255, 255), 0.25)
    extra = {A: "backA", B: "hairA", D: "hairD", HL: "backHL"}
    cw, ch = frames[0].shape[1], frames[0].shape[0]
    im = Image.new("L", (cw * len(frames), ch))
    for i, f in enumerate(frames):
        m = np.zeros(f.shape[:2], np.uint8)
        for y in range(f.shape[0]):
            for x in range(f.shape[1]):
                if not f[y, x, 3]: continue
                c = tuple(int(v) for v in f[y, x, :3]); r = ROLE.get("#%02x%02x%02x" % c) or extra.get(c)
                if r in ROLES and not (c == (0x3b, 0x17, 0x25)): m[y, x] = ROLES.index(r) + 1
        im.paste(Image.fromarray(m * FAC), (i * cw, 0))
    b = io.BytesIO(); im.save(b, "PNG", optimize=True); return base64.b64encode(b.getvalue()).decode()

def world(key):
    base, ovr, wpal = bake.VARIANTS[key]
    an = bake.build(base, ovr, wpal)
    if key == "wren_braid":      # the braid hangs on one shoulder: left-facing frames are drawn without it
        nb = bake.build("wren_braid_nb"); an["idle_side_nb"] = nb["idle_side"]; an["walk_side_nb"] = nb["walk_side"]
    sheet, b64, idx, (w, h) = bake.pack(an)
    frames = []
    for a in sorted(idx, key=lambda n: idx[n][0]): frames += an[a]
    ec = []
    for f in frames:
        c = centroid(f, EYE); ec.append([int(round(c[0])), int(round(c[1]))] if c else None)
    return {"png": b64, "fw": w, "fh": h, "anims": idx, "anchor": bake.anchors(an), "ec": ec, "roles": role_img(frames)}

CW = 96
def pad(f):
    h, w = f.shape[:2]; o = np.zeros((h, CW, 4), np.uint8); x = (CW - w) // 2; o[:, x:x + w] = f; return o
def place(img, h, angle=0):
    im = Image.fromarray(img); bb = im.getbbox(); im = im.crop(bb)
    if angle: im = im.rotate(angle, expand=True, resample=Image.NEAREST)
    c = Image.new("RGBA", (CW, h)); c.paste(im, ((CW - im.width) // 2, h - 2 - im.height), im); return np.array(c)
def battle(key):
    sfn = None if key == "wren" else bake.SIDE_FN[key]
    A = {}
    walk = bake.dress("Walk", "side", 30, sfn)
    def shift(f, dy):
        o = np.zeros_like(f)
        if dy < 0: o[:dy] = f[-dy:]
        else: o = f.copy()
        o[-8:] = f[-8:]; return o
    A["idle"] = [shift(walk[0], d) for d in (0, 0, -1, -1, -1, 0)]
    A["attack"] = bake.dress("Attack_1", "side", 30, sfn); A["cast"] = bake.dress("Attack_3", "side", 30, sfn); A["hurt"] = bake.dress("Hurt", "side", 30, sfn)
    h = A["idle"][0].shape[0]
    A["dead"] = [place(f, h) for f in A["hurt"][-2:]] + [place(walk[0], h, 40), place(walk[0], h, 90)]
    for k in ("idle", "attack", "cast", "hurt"): A[k] = [pad(f) for f in A[k]]
    frames, idx = [], {}
    for a in ["idle", "attack", "cast", "hurt", "dead"]: idx[a] = list(range(len(frames), len(frames) + len(A[a]))); frames += A[a]
    sheet = Image.new("RGBA", (CW * len(frames), h))
    for i, f in enumerate(frames): sheet.paste(Image.fromarray(f), (i * CW, 0))
    b = io.BytesIO(); sheet.save(b, "PNG", optimize=True)
    f0 = A["idle"][0]; ys = np.where(f0[:, :, 3].any(1))[0]; yb = ys.max(); xs = np.where(f0[yb - 6:yb + 1, :, 3].any(0))[0]
    return {"png": base64.b64encode(b.getvalue()).decode(), "fw": CW, "fh": h, "anims": idx, "anchor": [int(round((xs.min() + xs.max()) / 2)), int(yb)], "roles": role_img(frames)}

if __name__ == "__main__":
    keys = ["wren"] + ["wren_" + s for s in W.STYLES]
    wd = {k: world(k) for k in keys}; bd = {k: battle(k) for k in keys}
    ref = bake.dress("Idle", "front", 41, None)[0]; e0 = centroid(ref, EYE)
    json.dump({"world": wd, "battle": bd, "roles": ROLES, "fac": FAC, "px": PX, "py": PY, "e0": [round(float(e0[0])), round(float(e0[1]))]}, open("styles_atlas.json", "w"))
    print({k: (len(v["png"]) + len(v["roles"])) // 1024 for k, v in wd.items()}, {k: (len(v["png"]) + len(v["roles"])) // 1024 for k, v in bd.items()}, e0, PX, PY)
