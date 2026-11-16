"""The top-left HUD from the Game User Interface pack (assets13): the two-section frame from Frame_tiles/Tileset.png
(beige rail on the left, lines that run from beige into orange), Back1's speckled plum, the segmented loading bar,
and icons from the yellow icon set. -> src/parts/02s_hud_data.js"""
import base64, io, json
from PIL import Image

UI = "/home/claude/durinn/assets13/"
T = Image.open(UI + "1 Frames/Frame_tiles/Tileset.png").convert("RGBA")
W = 320  # strips are cut at this width; a narrower panel clips the orange end (the frame is open on the right)


def url(im):
    b = io.BytesIO(); im.save(b, "PNG", optimize=True); return "data:image/png;base64," + base64.b64encode(b.getvalue()).decode()


def strip(y0, y1, orange=104):
    """rebuild a horizontal line at width W: corner/rail columns, a beige run, the beige-to-orange dither, then orange"""
    h = y1 - y0; o = Image.new("RGBA", (W, h)); t0 = int(W * 0.46)
    for x in range(W):
        sx = x if x < 6 else 10 if x < t0 else 38 + (x - t0) if x < t0 + 55 else orange
        o.paste(T.crop((sx, y0, sx + 1, y1)), (x, 0))
    return o


top = strip(0, 6)
div = strip(33, 45, 92)          # shadow, line, shadow, and the rail's brass junction below it
for y in range(5, 12):       # the divider's lower rows: only the rail continues past the line's shadow
    for x in range(6, W): div.putpixel((x, y), (0, 0, 0, 0))
bot = strip(58, 64)
rail = T.crop((0, 10, 6, 11))
back = Image.open(UI + "1 Frames/Back1.png").convert("RGBA")
bar_on = Image.open(UI + "2 Bars/Loading_bar1.png").convert("RGBA")
bar_off = Image.open(UI + "2 Bars/Loading_bar2.png").convert("RGBA")
# one segment of each bar, so a meter of any width tiles them
def seg(im):
    a = im.split()[3].load(); w, h = im.size
    cols = [x for x in range(w) if any(a[x, y] for y in range(h))]
    return im.crop((0, 0, 11, h)), None, None   # one period: the joint (2 px) and a segment (9 px)
on_s, on_l, on_r = seg(bar_on); off_s, off_l, off_r = seg(bar_off)
ICONS = {"day": 110, "night": 89, "coin": 38, "ley": 59, "task": 104, "place": 117}
ish = Image.new("RGBA", (18 * len(ICONS), 18)); iidx = {}
for i, (k, n) in enumerate(ICONS.items()):
    ish.paste(Image.open(UI + f"3 Icons/Icons yellow/Icon_{n:02d}.png").convert("RGBA"), (i * 18, 0)); iidx[k] = i
js = ["/* Top-left HUD: Game User Interface pixel pack (craftpix.net, assets13): frame tileset, Back1, loading bar, yellow icons. */",
      f"const HUD_ART = {json.dumps({'top': url(top), 'div': url(div), 'bot': url(bot), 'rail': url(rail), 'back': url(back), 'on': url(on_s), 'off': url(off_s), 'icons': url(ish)})};",
      f"const HUD_ICON = {json.dumps(iidx)};", f"const HUD_W = {W};"]
open("/home/claude/durinn/src/parts/02s_hud_data.js", "w").write("\n".join(js) + "\n")
print(top.size, div.size, bot.size, on_s.size, off_s.size)
