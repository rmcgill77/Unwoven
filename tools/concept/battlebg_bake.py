"""Bakes battle backdrops from the supplied background packs (assets8) into src/parts/02o_bg_data.js.
Each is brought down to its native pixel size, then grimmed to sit with the rest of the game: colour drained by about
half, pushed cool and grey, darkened, contrast pulled in, and quantized to a small palette."""
import base64, colorsys, glob, io, sys
from PIL import Image
A = "/home/claude/durinn/assets8/"
W8 = A + "0ee97ae9-craftpix-net-882062-free-winter-backgrounds-pixel-art/"


def layers(d):   # the pack's composite, at five times its native size
    return Image.open(d + "/hd.png").convert("RGB").resize((576, 324), Image.NEAREST)


def grim(im, sat=0.5, val=0.7, tint=(104, 110, 124), tk=0.18, colors=40):
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b = [c / 255 for c in px[x, y]]
            h, s, v = colorsys.rgb_to_hsv(r, g, b)
            s *= sat; v = 0.08 + (v * val) * 0.92
            r, g, b = colorsys.hsv_to_rgb(h, s, v)
            r, g, b = [int(c * 255 * (1 - tk) + t * tk) for c, t in zip((r, g, b), tint)]
            px[x, y] = (r, g, b)
    return im.quantize(colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGB")


SRC = {
    "snowwood": lambda: layers(W8 + "winter 1"),
    "birch": lambda: layers(W8 + "winter 5"),
    "frostlake": lambda: layers(W8 + "winter 7"),
    "snowfield": lambda: layers(W8 + "winter 3"),
    "rocks": lambda: layers(W8 + "winter 4"),
    "cave": lambda: Image.open("/home/claude/durinn/assets9/cavebg/empty.png").convert("RGB").crop((0, 0, 960, 330)).resize((480, 165), Image.LANCZOS).resize((576, 198), Image.NEAREST),   # the cave band only: the painted floor below is empty
    "crystalcave": lambda: Image.open("/home/claude/durinn/assets9/cavebg/crystal.png").convert("RGB").crop((0, 0, 960, 330)).resize((480, 165), Image.LANCZOS).resize((576, 198), Image.NEAREST),   # the cave band only: the painted floor below is empty
    "spidercave": lambda: Image.open("/home/claude/durinn/assets9/cavebg/spider.png").convert("RGB").crop((0, 0, 960, 330)).resize((480, 165), Image.LANCZOS).resize((576, 198), Image.NEAREST),   # the cave band only: the painted floor below is empty
    "lavacave": lambda: Image.open("/home/claude/durinn/assets9/cavebg/lava.png").convert("RGB").crop((0, 0, 960, 330)).resize((480, 165), Image.LANCZOS).resize((576, 198), Image.NEAREST),   # the cave band only: the painted floor below is empty
    "summerwood": lambda: Image.open("/home/claude/durinn/assets9/fieldbg/summer.png").convert("RGB").resize((480, 166), Image.LANCZOS).resize((576, 199), Image.NEAREST),
    "autumnfield": lambda: Image.open("/home/claude/durinn/assets9/fieldbg/autumn.png").convert("RGB").resize((480, 166), Image.LANCZOS).resize((576, 199), Image.NEAREST),
    "cursed": lambda: Image.open("/home/claude/durinn/assets9/fieldbg/dry.png").convert("RGB").resize((480, 238), Image.LANCZOS).resize((576, 286), Image.NEAREST),
    "canyon": lambda: Image.open("/home/claude/durinn/assets9/fieldbg/dry.png").convert("RGB").resize((480, 238), Image.LANCZOS).resize((576, 286), Image.NEAREST),
    "castle": lambda: Image.open(A + "craftpix-net-807934-fantasy-horizontal-battle-backgrounds/Castle land/PNG/Horizontal Battle Backgrounds 3.png").convert("RGB").resize((480, 270), Image.LANCZOS).resize((576, 324), Image.NEAREST),

}
TUNE = {"summerwood": dict(sat=0.42, val=0.6, tint=(70, 84, 72), tk=0.2, colors=36), "autumnfield": dict(sat=0.38, val=0.62, tint=(96, 86, 80), tk=0.2, colors=36), "cursed": dict(sat=0.3, val=0.5, tint=(82, 52, 92), tk=0.34, colors=32), "canyon": dict(sat=0.32, val=0.6, tint=(100, 96, 104), tk=0.22, colors=32), "cave": dict(sat=0.35, val=0.6, tint=(92, 88, 96), tk=0.2, colors=32), "crystalcave": dict(sat=0.45, val=0.62, tint=(80, 96, 120), tk=0.18, colors=36), "spidercave": dict(sat=0.32, val=0.55, tint=(80, 90, 80), tk=0.24, colors=32), "lavacave": dict(sat=0.42, val=0.6, tint=(100, 70, 60), tk=0.2, colors=32), "rocks": dict(sat=0.35, val=0.62), "castle": dict(sat=0.35, val=0.6, tint=(96, 92, 120), tk=0.22, colors=32), "snowfield": dict(val=0.66), "birch": dict(sat=0.45)}
out = {}
for k, f in SRC.items():
    im = f()
    if im.width != 576: im = im.resize((576, 324), Image.NEAREST)   # (the cave strips are wide on purpose)
    g = grim(im, **TUNE.get(k, {}))
    g.save(f"/tmp/claude-0/-home-claude/81f7a483-afca-5415-8c60-809b5595b3f8/scratchpad/bg_{k}.png")
    buf = io.BytesIO(); g.save(buf, "PNG", optimize=True)
    out[k] = "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()
    print(k, len(out[k]))
js = "/* Battle backdrops, baked by concept/battlebg_bake.py from the supplied packs and grimmed */\nconst BATTLE_BG_SRC = " + \
     "{" + ",".join(f'{k}:"{v}"' for k, v in out.items()) + "};\n"
open("/home/claude/durinn/src/parts/02o_bg_data.js", "w").write(js)
