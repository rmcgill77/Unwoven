import numpy as np
from PIL import Image
import anim2, cast3, side
hurt = anim2.run("Hurt", "side", "hurt", 30)
walk = anim2.run("Walk", "side", "walk", 30)
names = [n for n, _ in side.SIDE]
CW, CH = 96, 84
def place(img, angle=0, flip=False):
    im = Image.fromarray(img)
    bb = im.getbbox(); im = im.crop(bb)
    if angle: im = im.rotate(angle, expand=True, resample=Image.NEAREST)
    if flip: im = im.transpose(Image.FLIP_TOP_BOTTOM)
    c = Image.new("RGBA", (CW, CH)); c.paste(im, ((CW - im.width) // 2, CH - 2 - im.height), im); return c
seqs = []
for ci in range(len(names)):
    fr = [place(h[ci]) for h in hurt] + [place(walk[0][ci], 40), place(walk[0][ci], 90), place(walk[0][ci], 90)]
    seqs.append(fr)
S = 4
out = []
for fi in range(len(seqs[0])):
    c = Image.new("RGB", (CW * S * len(names), CH * S), "#1c1730")
    for ci in range(len(names)):
        im = seqs[ci][fi].resize((CW * S, CH * S), Image.NEAREST); c.paste(im, (ci * CW * S, 0), im)
    out.append(c.convert("P", palette=Image.ADAPTIVE))
out[0].save("dead_all.gif", save_all=True, append_images=out[1:], duration=[120, 120, 120, 160, 110, 900, 900], loop=0)
grid = Image.new("RGB", (CW * 3 * len(seqs[0]), CH * 3 * len(names)), "#1c1730")
for ci in range(len(names)):
    for fi in range(len(seqs[0])):
        im = seqs[ci][fi].resize((CW * 3, CH * 3), Image.NEAREST); grid.paste(im, (fi * CW * 3, ci * CH * 3), im)
grid.save("anim_dead.png")
