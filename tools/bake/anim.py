import sys, glob
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import ctx, cast3
from cast2 import PX, PY, BASE
from rebase import ROLE
ATT = "pack/Wizard/"
EYE = {"eye1", "eye2", "eye3"}
def centroid(a, roles, ymin=0, ymax=10**6):
    ys, xs = [], []
    near_skin = None
    if roles is EYE or roles == EYE:
        sk = np.all(a[:, :, :3] == (255, 194, 161), axis=2) & (a[:, :, 3] > 0)
        from scipy.ndimage import binary_dilation
        near_skin = binary_dilation(sk, iterations=3)
    for y in range(a.shape[0]):
        for x in range(a.shape[1]):
            if a[y, x, 3] and ROLE.get("#%02x%02x%02x" % tuple(a[y, x, :3])) in roles and ymin <= y < ymax and (near_skin is None or near_skin[y, x]): ys.append(y); xs.append(x)
    return (np.mean(xs), np.mean(ys)) if xs else None
B0 = np.pad(BASE, ((PY, 6), (PX, PX), (0, 0)))
E0, BL0 = centroid(B0, EYE), centroid(B0, {"in", "inD"}, 50 + PY)
def frames(sheet, x0=41, y0=52, w=47):
    im = np.array(Image.open(ATT + sheet + ".png").convert("RGBA"))
    n = im.shape[1] // 128
    return [np.pad(im[y0:y0 + 76, i * 128 + x0:i * 128 + x0 + w], ((PY, 6), (PX, PX), (0, 0))) for i in range(n)]
def dress(fr):
    ctx.SRC = fr
    e, b = centroid(fr, EYE), centroid(fr, {"in", "inD"}, 50 + PY)
    ctx.HOFF = (round(e[0] - E0[0]), round(e[1] - E0[1])) if e else (0, 0)
    ctx.BOFF = (round(b[0] - BL0[0]), round(b[1] - BL0[1])) if b else ctx.HOFF
    out = []
    for name, fn in cast3.CAST4:
        out.append(fr.copy() if name.startswith("Wren") else fn())
    return out
if __name__ == "__main__":
    sheet, tag = sys.argv[1], sys.argv[2]
    frs = frames(sheet)
    rows = [dress(f) for f in frs]            # rows[frame][char]
    S = 4; cw, chh = rows[0][0].shape[1] * S, rows[0][0].shape[0] * S
    names = [n for n, _ in cast3.CAST4]
    grid = Image.new("RGBA", (cw * len(frs) + 160, chh * len(names)), "#1c1730")
    d = ImageDraw.Draw(grid); f = ImageFont.load_default(size=20)
    for ci, n in enumerate(names):
        d.text((8, ci * chh + chh // 2), n.split()[0], fill="#e9d9b4", font=f)
        gif = []
        for fi in range(len(frs)):
            im = Image.fromarray(rows[fi][ci]).resize((cw, chh), Image.NEAREST)
            grid.paste(im, (160 + fi * cw, ci * chh), im)
            g = Image.new("RGBA", (cw, chh), "#1c1730"); g.paste(im, (0, 0), im); gif.append(g.convert("P", palette=Image.ADAPTIVE))
        gif[0].save(f"anim_{tag}_{n.split()[0].lower()}.gif", save_all=True, append_images=gif[1:], duration=140, loop=0, disposal=2)
    grid.save(f"anim_{tag}.png")
    print("offsets", [(round(centroid(f, EYE)[0] - E0[0]), round(centroid(f, EYE)[1] - E0[1])) if centroid(f, EYE) else None for f in frs])
