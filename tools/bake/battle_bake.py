"""Side-view battle atlases: idle, attack (slash), cast (beam), hurt, dead for the party."""
import base64, io, json
import numpy as np
from PIL import Image
import ctx, bake, side
from bake import ROLE_IDS, LOOK
from rebase import hx, mix, ROLE
CW = 96
KEYS = {"wren": "wren", "tessa": "tessa", "companion": "hooded"}
def pad(f):
    h, w = f.shape[:2]; o = np.zeros((h, CW, 4), np.uint8); x = (CW - w) // 2; o[:, x:x + w] = f; return o
def place(img, h, angle=0):
    im = Image.fromarray(img); bb = im.getbbox(); im = im.crop(bb)
    if angle: im = im.rotate(angle, expand=True, resample=Image.NEAREST)
    c = Image.new("RGBA", (CW, h)); c.paste(im, ((CW - im.width) // 2, h - 2 - im.height), im); return np.array(c)
def build(base):
    sfn = None if base == "wren" else bake.SIDE_FN[base]
    A = {}
    walk = bake.dress("Walk", "side", 30, sfn)
    def shift(f, dy):
        o = np.zeros_like(f)
        if dy < 0: o[:dy] = f[-dy:]
        else: o = f.copy()
        # keep the feet planted: only the upper body bobs
        o[-8:] = f[-8:]; return o
    A["idle"] = [shift(walk[0], d) for d in (0, 0, -1, -1, -1, 0)]
    A["attack"] = bake.dress("Attack_1", "side", 30, sfn)
    A["cast"] = bake.dress("Attack_3", "side", 30, sfn)
    A["hurt"] = bake.dress("Hurt", "side", 30, sfn)
    walk0 = walk[0]
    h = A["idle"][0].shape[0]
    A["dead"] = [place(f, h) for f in A["hurt"][-2:]] + [place(walk0, h, 40), place(walk0, h, 90)]
    for k in ("idle", "attack", "cast", "hurt"): A[k] = [pad(f) for f in A[k]]
    return A
ORDER = ["idle", "attack", "cast", "hurt", "dead"]
data = {"chars": {}}
prev = []
for key, base in KEYS.items():
    A = build(base)
    frames, idx = [], {}
    for a in ORDER: idx[a] = list(range(len(frames), len(frames) + len(A[a]))); frames += A[a]
    h = frames[0].shape[0]
    sheet = Image.new("RGBA", (CW * len(frames), h))
    for i, f in enumerate(frames): sheet.paste(Image.fromarray(f), (i * CW, 0))
    buf = io.BytesIO(); sheet.save(buf, "PNG", optimize=True)
    f0 = A["idle"][0]; ys = np.where(f0[:, :, 3].any(1))[0]; yb = ys.max(); xs = np.where(f0[yb - 6:yb + 1, :, 3].any(0))[0]
    data["chars"][key] = {"png": base64.b64encode(buf.getvalue()).decode(), "fw": CW, "fh": h, "anims": idx, "anchor": [int(round((xs.min() + xs.max()) / 2)), int(yb)]}
    if key == "wren":   # role map for recolouring the player
        wl = LOOK["wren"]; Ah, Bh, Dh = map(hx, wl["hair"]); oL, o = map(hx, wl["body"]); HL = mix(Ah, (255, 255, 255), 0.25)
        extra = {Ah: "backA", Bh: "hairA", Dh: "hairD", HL: "backHL", oL: "outL", o: "out"}
        im = Image.new("L", sheet.size)
        for i, f in enumerate(frames):
            m = np.zeros(f.shape[:2], np.uint8)
            for y in range(f.shape[0]):
                for x in range(f.shape[1]):
                    if not f[y, x, 3]: continue
                    c = tuple(int(v) for v in f[y, x, :3]); r = ROLE.get("#%02x%02x%02x" % c) or extra.get(c)
                    if r in ROLE_IDS: m[y, x] = ROLE_IDS.index(r) + 1
            im.paste(Image.fromarray(m * 20), (i * CW, 0))
        b2 = io.BytesIO(); im.save(b2, "PNG", optimize=True); data["wrenRoles"] = base64.b64encode(b2.getvalue()).decode()
    sheet.save(f"battle_{key}.png"); prev.append(sheet); print(key, len(frames), "frames", len(data["chars"][key]["png"]) // 1024, "KB")
json.dump(data, open("battle_atlas.json", "w"))
pw = max(p.width for p in prev); pv = Image.new("RGBA", (pw, sum(p.height for p in prev)), "#1c1730"); y = 0
for p in prev: pv.paste(p, (0, y), p); y += p.height
pv.save("battle_preview.png")
