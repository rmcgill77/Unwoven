import sys, glob
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import ctx, cast3, side
from cast2 import PX, PY
from anim import centroid, EYE, ATT
MODES = {"front": dict(x0=41, y0=52, ref=("Idle", 0), cast=cast3.CAST4), "side": dict(x0=30, y0=52, ref=("Walk", 0), cast=side.SIDE)}
def frames(sheet, x0, y0, w=47, flipx=False):
    im = np.array(Image.open(ATT + sheet + ".png").convert("RGBA"))
    n = im.shape[1] // 128
    return [np.pad(im[y0:y0 + 76, i * 128 + x0:i * 128 + x0 + w], ((PY, 6), (PX, PX), (0, 0))) for i in range(n)]
def run(sheet, mode, tag, x0=None, dur=120, w=47):
    M = MODES[mode]; ctx.MODE = mode
    ref = frames(M["ref"][0], M["x0"], M["y0"])[M["ref"][1]]
    E0, B0 = centroid(ref, EYE, 0, 42 + PY), centroid(ref, {"in", "inD"}, 50 + PY)
    frs = frames(sheet, x0 if x0 is not None else M["x0"], M["y0"], w)
    rows = []
    for fr in frs:
        ctx.SRC = fr
        e, b = centroid(fr, EYE, 0, 42 + PY), centroid(fr, {"in", "inD"}, 50 + PY)
        ctx.HOFF = (round(e[0] - E0[0]), round(e[1] - E0[1])) if e else (0, 0)
        ctx.BOFF = (round(b[0] - B0[0]), round(b[1] - B0[1])) if b else ctx.HOFF
        rows.append([fr.copy() if fn is None or n.startswith("Wren") else fn() for n, fn in M["cast"]])
    S = 4; cw, chh = rows[0][0].shape[1] * S, rows[0][0].shape[0] * S
    names = [n for n, _ in M["cast"]]
    grid = Image.new("RGBA", (cw * len(frs) + 160, chh * len(names)), "#1c1730"); d = ImageDraw.Draw(grid); f = ImageFont.load_default(size=20)
    for ci, n in enumerate(names):
        d.text((8, ci * chh + chh // 2), n.split()[0], fill="#e9d9b4", font=f)
        for fi in range(len(frs)):
            im = Image.fromarray(rows[fi][ci]).resize((cw, chh), Image.NEAREST); grid.paste(im, (160 + fi * cw, ci * chh), im)
    grid.save(f"anim_{tag}.png")
    out = []
    for fi in range(len(frs)):
        c = Image.new("RGB", (cw * len(names), chh), "#1c1730")
        for ci in range(len(names)):
            im = Image.fromarray(rows[fi][ci]).resize((cw, chh), Image.NEAREST); c.paste(im, (ci * cw, 0), im)
        out.append(c.convert("P", palette=Image.ADAPTIVE))
    out[0].save(f"{tag}_all.gif", save_all=True, append_images=out[1:], duration=dur, loop=0)
    return rows
if __name__ == "__main__":
    run(sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4]) if len(sys.argv) > 4 else None, w=int(sys.argv[5]) if len(sys.argv) > 5 else 47)
