"""Bake every in-game character into an atlas: idle/walk for down, up and side (left = mirrored)."""
import base64, io, json
import numpy as np
from PIL import Image
import ctx, cast3, side, anim2, walkgen, backview
from anim import centroid, EYE
from rebase import hx, mix, ROLE, recolor, hair_pal, eye_pal
from cast2 import PX, PY

FRONT_FN = {n.split()[0].lower(): f for n, f in cast3.CAST4}
SIDE_FN = {n.split()[0].lower(): f for n, f in side.SIDE}
LOOK = {"wren": backview.LOOK["Wren (you)"], "tessa": backview.LOOK["Tessa"], "bram": backview.LOOK["Bram"], "kellan": backview.LOOK["Kellan Vex"],
        "hooded": backview.LOOK["Hooded companion"], "old": backview.LOOK["Old mentor"]}
import folk, folk_side, headfix
SMOOTH = [False]
BACK_HOOK = {}
BACK_BASE = {}
FOLK_FRONT = {"wenna": folk.wenna, "mayor_m": lambda: folk.mayor(False), "mayor_f": lambda: folk.mayor(True), "tomas": folk.tomas, "edda": folk.edda,
              "maud": folk.maud, "pip": folk.pip, "joss": folk.joss, "lenna": folk.lenna, "garrick": folk.garrick, "ansel": folk.ansel, "hester": folk.hester}
FRONT_FN.update(FOLK_FRONT); SIDE_FN.update(folk_side.SIDE_FN); LOOK.update(folk_side.LOOK)

def dress(sheet, mode, x0, fn):
    ctx.MODE = mode
    M = anim2.MODES[mode]
    ref = anim2.frames(M["ref"][0], M["x0"], M["y0"])[0]
    E0, B0 = centroid(ref, EYE, 0, 42 + PY), centroid(ref, {"in", "inD"}, 50 + PY)
    out = []
    for fr in anim2.frames(sheet, x0, M["y0"]):
        ctx.SRC = fr
        e, b = centroid(fr, EYE, 0, 42 + PY), centroid(fr, {"in", "inD"}, 50 + PY)
        ctx.HOFF = (round(e[0] - E0[0]), round(e[1] - E0[1])) if e else (0, 0)
        ctx.BOFF = (round(b[0] - B0[0]), round(b[1] - B0[1])) if b else ctx.HOFF
        o = fr.copy() if fn is None else fn()
        out.append(headfix.smooth(o, ctx.HOFF) if mode == "front" and SMOOTH[0] else o)
    return out

def wren_recolor(frames, pal):
    return [recolor(f, pal) for f in frames]

def build(base, ovr=None, wpal=None):
    """base: approved design key; ovr: palette override for the builders; wpal: recolour map for Wren-based variants."""
    ctx.OVR = ovr or {}
    ffn, sfn = (None, None) if base == "wren" else (FRONT_FN[base], SIDE_FN[base])
    SMOOTH[0] = base not in folk_side.HATS and not base.startswith("wren_") and base != "thorne"   # round the cheek notch on the cast; hats and painted designs are already clean
    idle = dress("Idle", "front", 41, ffn)
    walk_s = dress("Walk", "side", 30, sfn)
    look = dict(LOOK[base])
    if ovr:
        if "HR" in ovr: look["hair"] = tuple("#%02x%02x%02x" % c for c in ovr["HR"][:3])
        p = ovr.get("pal", {})
        if "outL" in p: look["body"] = ("#%02x%02x%02x" % p["outL"], "#%02x%02x%02x" % p["out"])
        if "hood" in ovr: look["hood"] = tuple("#%02x%02x%02x" % c for c in backview_T(ovr["hood"]))
    if wpal:
        idle, walk_s = wren_recolor(idle, wpal), wren_recolor(walk_s, wpal)
        look["hair"] = ("#%02x%02x%02x" % wpal["hairHi"], "#%02x%02x%02x" % wpal["hairA"], "#%02x%02x%02x" % wpal["hairD"])
        look["body"] = ("#%02x%02x%02x" % wpal["outL"], "#%02x%02x%02x" % wpal["out"])
    bsrc = idle[0]
    if base in BACK_BASE:
        ctx.OVR = ovr or {}; bsrc = dress("Idle", "front", 41, FRONT_FN[BACK_BASE[base]])[0]
    back = backview.back_from_front(bsrc, look)
    if base in folk_side.HATS or base in ("lenna", "hester"): back = folk_side.back_fx(base, back)
    if base in BACK_HOOK: back = BACK_HOOK[base](back)
    ctx.OVR = {}
    return {"idle_down": idle, "walk_down": walkgen.walk_frames8(idle[0]), "idle_up": [back], "walk_up": walkgen.walk_frames8(back),
            "idle_side": [walk_s[0]], "walk_side": walk_s}
def backview_T(c):
    b = hx(c); return (mix(b, (255, 255, 255), 0.22), b, mix(b, (0, 0, 0), 0.32))

H = lambda *cs: tuple(hx(c) for c in cs)
def P(**kw): return {k: hx(v) for k, v in kw.items()}
VARIANTS = {k: (k, None, None) for k in ["wren", "tessa", "bram", "kellan", "wenna", "mayor_m", "mayor_f", "tomas", "edda", "maud", "joss", "lenna", "garrick", "hester", "pip", "ansel"]}
VARIANTS["mentor"] = ("old", None, None); VARIANTS["companion"] = ("hooded", None, None)
ORDER = ["idle_down", "walk_down", "idle_up", "walk_up", "idle_side", "walk_side"]
def pack(anims):
    frames, idx = [], {}
    for a in ORDER + [k for k in anims if k not in ORDER]:
        idx[a] = list(range(len(frames), len(frames) + len(anims[a]))); frames += anims[a]
    h, w = frames[0].shape[:2]
    sheet = Image.new("RGBA", (w * len(frames), h))
    for i, f in enumerate(frames): sheet.paste(Image.fromarray(f), (i * w, 0))
    buf = io.BytesIO(); sheet.save(buf, "PNG", optimize=True)
    return sheet, base64.b64encode(buf.getvalue()).decode(), idx, (w, h)

# role ids for runtime recolouring of the player (Wren base)
ROLE_IDS = ["skin", "skinD", "hairA", "hairB", "hairD", "hairHi", "outL", "out", "backA", "backHL"]
def role_map(anims):
    wl = LOOK["wren"]; A, B, D = map(hx, wl["hair"]); oL, o = map(hx, wl["body"]); HL = mix(A, (255, 255, 255), 0.25)
    extra = {A: "backA", B: "hairA", D: "hairD", HL: "backHL", oL: "outL", o: "out"}
    maps = []
    for a in ORDER:
        for f in anims[a]:
            m = np.zeros(f.shape[:2], np.uint8)
            for y in range(f.shape[0]):
                for x in range(f.shape[1]):
                    if not f[y, x, 3]: continue
                    c = tuple(int(v) for v in f[y, x, :3]); r = ROLE.get("#%02x%02x%02x" % c) or extra.get(c)
                    if r in ROLE_IDS: m[y, x] = ROLE_IDS.index(r) + 1
            maps.append(m)
    h, w = maps[0].shape
    im = Image.new("L", (w * len(maps), h))
    for i, m in enumerate(maps): im.paste(Image.fromarray(m * 20), (i * w, 0))
    buf = io.BytesIO(); im.save(buf, "PNG", optimize=True)
    return base64.b64encode(buf.getvalue()).decode()

def anchors(anims):
    """Feet anchor per view, measured on the first frame (bottom row centre)."""
    out = {}
    for view, a in (("down", "idle_down"), ("up", "idle_up"), ("side", "idle_side")):
        f = anims[a][0]; ys = np.where(f[:, :, 3].any(1))[0]; yb = ys.max()
        xs = np.where(f[yb - 6:yb + 1, :, 3].any(0))[0]
        out[view] = [int(round((xs.min() + xs.max()) / 2)), int(yb)]
    return out

if __name__ == "__main__":
    import sys
    data = {"roles": ROLE_IDS, "chars": {}}
    keys = sys.argv[1:] or list(VARIANTS)
    preview = []
    for k in keys:
        base, ovr, wpal = VARIANTS[k]
        anims = build(base, ovr, wpal)
        sheet, b64, idx, (w, h) = pack(anims)
        data["chars"][k] = {"png": b64, "fw": w, "fh": h, "anims": idx, "anchor": anchors(anims)}
        if k == "wren": data["wrenRoles"] = role_map(anims)
        sheet.save(f"atlas_{k}.png"); preview.append(sheet)
        print(k, len(b64) // 1024, "KB")
    json.dump(data, open("chibi_atlas.json", "w"))
    pw = max(p.width for p in preview)
    pv = Image.new("RGBA", (pw, sum(p.height for p in preview)), "#1c1730")
    y = 0
    for p in preview: pv.paste(p, (0, y), p); y += p.height
    pv.save("atlas_preview.png")
