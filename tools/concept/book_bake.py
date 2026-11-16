"""Bake the book art: three open books (and their page-turn strips), the root icons for the tome,
the place medallions for the map, and the interface-pack pieces for the Pack. -> src/parts/02q_book_data.js"""
import base64, io, json
from PIL import Image, ImageEnhance

A = "/home/claude/durinn/assets11/"
UI = "/home/claude/durinn/assets13/"
BOX = (13, 84, 259, 267)          # the open book inside each 272px cell: 246 x 183


def grim(im, sat=0.7, val=0.9, tint=(120, 110, 100), tk=0.08):
    im = im.convert("RGBA"); a = im.split()[3]
    rgb = ImageEnhance.Color(im.convert("RGB")).enhance(sat); rgb = ImageEnhance.Brightness(rgb).enhance(val)
    rgb = Image.blend(rgb, Image.new("RGB", rgb.size, tint), tk); o = rgb.convert("RGBA"); o.putalpha(a.point(lambda v: 255 if v > 90 else 0)); return o


def url(im, colors=None):
    if colors:
        a = im.split()[3]; q = im.convert("RGB").quantize(colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGBA"); q.putalpha(a); im = q
    b = io.BytesIO(); im.save(b, "PNG", optimize=True); return "data:image/png;base64," + base64.b64encode(b.getvalue()).decode()


def cell(sheet, i):
    return sheet.crop(((i % 4) * 272, (i // 4) * 272, (i % 4) * 272 + 272, (i // 4) * 272 + 272)).crop(BOX)


BOOKS = {"magic": "free-animated-magic-book-pixel-art-asset-pack/PNG/", "adv": "adventure-fantasy-book-pixel-art/PNG/", "beast": "bestiary-book-pixel-art-asset-pack/PNG/"}
out = {}
for k, p in BOOKS.items():
    ob = Image.open(A + p + "Open_book.png").convert("RGBA")
    opened = grim(cell(ob, 11))
    tl = Image.open(A + p + "Turning_pages_left.png").convert("RGBA")
    strip = Image.new("RGBA", (246 * 15, 183))
    for i in range(15): strip.paste(grim(cell(tl, i)), (i * 246, 0))
    out[k] = {"open": url(opened, 48), "turn": url(strip, 48)}

# root icons: the magic book's twenty, and twenty more from the spellbook pack
mb = lambda n: Image.open(A + f"free-animated-magic-book-pixel-art-asset-pack/PNG/Icons/Icon{n}_big.png").convert("RGBA")
spi = Image.open(A + "rpg-magic-icons-spellbook-pixel-ui-pack/PNG/Icons.png").convert("RGBA")
sp = lambda c, r: spi.crop((c * 32, r * 32, c * 32 + 32, r * 32 + 32))
ROOTS = {"Pyr": mb(1), "Nix": sp(0, 3), "Vent": mb(19), "Petr": mb(11), "Ferr": sp(0, 0), "Fulg": mb(18), "Bary": sp(9, 7),
         "Nebul": mb(16), "Vitr": sp(0, 2), "Plast": sp(9, 1), "Fract": sp(0, 6), "Stas": sp(0, 1), "Tach": mb(17), "Solen": mb(3),
         "Phaos": sp(0, 7), "Tenebr": sp(0, 8), "Vis": sp(9, 8), "Vinc": mb(12), "Ton": mb(7), "Eid": sp(0, 4), "Chron": sp(9, 9),
         "Cogn": sp(9, 6), "Sens": mb(2), "Mut": mb(20), "Ver": sp(0, 9), "Somn": mb(6), "Mem": mb(9), "San": mb(14),
         "Carn": sp(9, 3), "Flor": mb(15), "Ven": sp(9, 0), "_": sp(9, 4)}
for k, im in ROOTS.items():
    if im.size != (32, 32): im = im.resize((32, 32), Image.NEAREST)
    ROOTS[k] = grim(im, 0.8, 0.95)
rsheet = Image.new("RGBA", (32 * len(ROOTS), 32))
ridx = {}
for i, (k, im) in enumerate(ROOTS.items()): rsheet.paste(im, (i * 32, 0)); ridx[k] = i


# place medallions, as picked in the approved mock-up
def medal(path, i):
    im = Image.open(A + path).convert("RGBA"); a = im.split()[3].load(); w, h = im.size
    cols = set(x for x in range(w) if any(a[x, y] for y in range(0, 60))); runs, st = [], None
    for x in range(w + 1):
        on = x in cols
        if on and st is None: st = x
        if not on and st is not None: runs.append((st, x)); st = None
    x0, x1 = [r for r in runs if r[1] - r[0] > 30][i]; ys = [y for y in range(0, 70) if any(a[x, y] for x in range(x0, x1))]
    return grim(im.crop((x0, ys[0], x1, ys[0] + (x1 - x0))), 0.75, 0.95).resize((28, 28), Image.NEAREST)
M1 = "fantasy-adventure-book-pixel-ui-asset-pack/PNG/Map1.png"; MP = "adventure-fantasy-book-pixel-art/PNG/map_pictures.png"
M2 = "fantasy-adventure-book-pixel-ui-asset-pack/PNG/Map2.png"; M4 = "fantasy-adventure-book-pixel-ui-asset-pack/PNG/Map4.png"
MEDALS = {"oak": medal(MP, 2), "ash": medal(M2, 0), "gw": medal(M2, 3), "camp": medal(M4, 0), "wforest": medal(MP, 4),
          "eforest": medal(M1, 3), "overlook": medal(MP, 4), "os": medal(M4, 4)}
msheet = Image.new("RGBA", (28 * len(MEDALS), 28)); midx = {}
for i, (k, im) in enumerate(MEDALS.items()): msheet.paste(im, (i * 28, 0)); midx[k] = i

# the interface pack: its plum backing, the slot frame, and the glyphs used for headings and buttons
GLYPHS = {"all": 17, "supply": 123, "gear": 28, "mat": 71, "quest": 16, "coin": 60, "close": 13, "book": 129, "map": 78, "beast": 128, "check": 14, "use": 26}
gs = Image.new("RGBA", (18 * len(GLYPHS), 18)); gidx = {}
for i, (k, n) in enumerate(GLYPHS.items()):
    gs.paste(Image.open(UI + f"3 Icons/Icon with back/Icon_{n:02d}.png").convert("RGBA"), (i * 18, 0)); gidx[k] = i
back = Image.open(UI + "1 Frames/Back1.png").convert("RGBA")
frame = Image.open(UI + "1 Frames/Frame1.png").convert("RGBA")

js = ["/* The book (tome, map, bestiary, quests) and the Pack.",
      "   Books: Free Animated Magic Book, Adventure Fantasy Book, Bestiary Book pixel-art packs. Spell icons: Free Animated Magic Book",
      "   and RPG Magic Icons Spellbook packs. Map medallions: Fantasy Adventure Book UI pack. Pack frame and glyphs: Game User",
      "   Interface pixel pack (assets13). All grimmed. */",
      f"const BOOK_ART = {json.dumps(out)};",
      "const BOOK_W = 246, BOOK_H = 183, BOOK_TURN_N = 15;",
      "const BOOK_PAGES = { L: [18, 14, 112, 150], R: [131, 14, 228, 150] };",
      f"const ROOT_ICON_SRC = \"{url(rsheet)}\";", f"const ROOT_ICON_IDX = {json.dumps(ridx)};",
      f"const MEDAL_SRC = \"{url(msheet)}\";", f"const MEDAL_IDX = {json.dumps(midx)};",
      f"const GLYPH_SRC = \"{url(gs)}\";", f"const GLYPH_IDX = {json.dumps(gidx)};",
      f"const PACK_BACK_SRC = \"{url(back)}\";", f"const PACK_SLOT_SRC = \"{url(frame)}\";", f"const PACK_SLOT_WH = [{frame.width}, {frame.height}];"]
open("/home/claude/durinn/src/parts/02q_book_data.js", "w").write("\n".join(js) + "\n")
print({k: (len(v["open"]), len(v["turn"])) for k, v in out.items()}, frame.size, back.size)
