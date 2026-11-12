import numpy as np
from PIL import Image
import ctx, cast3, anim2, walkgen
from anim import centroid, EYE
from cast2 import PX, PY
ctx.MODE = "front"
ref = anim2.frames("Idle", 41, 52)[0]
E0, B0 = centroid(ref, EYE, 0, 42 + PY), centroid(ref, {"in", "inD"}, 50 + PY)
def dress_all(frs):
    rows = []
    for fr in frs:
        ctx.SRC = fr
        e, b = centroid(fr, EYE, 0, 42 + PY), centroid(fr, {"in", "inD"}, 50 + PY)
        ctx.HOFF = (round(e[0] - E0[0]), round(e[1] - E0[1])); ctx.BOFF = (round(b[0] - B0[0]), round(b[1] - B0[1]))
        rows.append([fr.copy() if n.startswith("Wren") else fn() for n, fn in cast3.CAST4])
    return rows
def save(rows, tag, dur=150):
    S = 4; h, w = rows[0][0].shape[:2]; cw, ch = w * S, h * S; n = len(rows[0])
    out = []
    for r in rows:
        c = Image.new("RGB", (cw * n, ch), "#1c1730")
        for ci, a in enumerate(r):
            im = Image.fromarray(a).resize((cw, ch), Image.NEAREST); c.paste(im, (ci * cw, 0), im)
        out.append(c.convert("P", palette=Image.ADAPTIVE))
    out[0].save(f"out/{tag}_all.gif", save_all=True, append_images=out[1:], duration=dur, loop=0)
    g = Image.new("RGB", (cw * len(rows), ch * n), "#1c1730")
    for fi, r in enumerate(rows):
        for ci, a in enumerate(r):
            im = Image.fromarray(a).resize((cw, ch), Image.NEAREST); g.paste(im, (fi * cw, ci * ch), im)
    g.save(f"anim_{tag}.png")
if __name__ == "__main__":
    dressed = dress_all([ref])[0]
    walks = [walkgen.walk_frames8(d) for d in dressed]
    rows = [[walks[ci][fi] for ci in range(len(dressed))] for fi in range(len(walks[0]))]
    save(rows, "walk_down", dur=100)
