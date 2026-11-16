"""Mock-ups of the book screens (tome, map, bestiary, quests) and the Pack screen, over real game frames.
Every word and picture is laid inside a measured page box and checked to fit; tabs are paper tabs stuck
to the right-hand edge of the pages, drawn under the book so they are attached to it."""
import base64, io, json, re
from PIL import Image, ImageDraw, ImageEnhance, ImageFont

A = "/home/claude/durinn/assets11/"
UI = "/home/claude/durinn/assets13/"
OUT = "/tmp/claude-0/-home-claude/81f7a483-afca-5415-8c60-809b5595b3f8/scratchpad/"
FONT = "/mnt/skills/examples/canvas-design/canvas-fonts/PixelifySans-Medium.ttf"
F = lambda n: ImageFont.truetype(FONT, n)
INK, INK2, RED, FADE = (52, 36, 24), (98, 78, 58), (124, 38, 30), (150, 132, 108)
S = 6                                    # the book is drawn at six times its pixel size
SW, SH = 1830, 824                       # the game frame (915 x 412 at 2x)
LEFT = (18 * S, 14 * S, 112 * S, 150 * S)            # page boxes inside the open book, measured from the art
RIGHT = (131 * S, 14 * S, 228 * S, 150 * S)


def grim(im, sat=0.7, val=0.9, tint=(120, 110, 100), tk=0.08):
    a = im.split()[3]; rgb = ImageEnhance.Color(im.convert("RGB")).enhance(sat); rgb = ImageEnhance.Brightness(rgb).enhance(val)
    rgb = Image.blend(rgb, Image.new("RGB", rgb.size, tint), tk); o = rgb.convert("RGBA"); o.putalpha(a); return o


def open_book(path):
    sh = Image.open(A + path).convert("RGBA")
    fr = sh.crop((3 * 272, 2 * 272, 4 * 272, 3 * 272)); fr = fr.crop(fr.getbbox())
    return grim(fr).resize((fr.width * S, fr.height * S), Image.NEAREST)


class Page:
    """a page box; everything drawn through it is checked to stay inside"""
    def __init__(self, img, box, ox, oy):
        self.img, self.d = img, ImageDraw.Draw(img)
        self.x0, self.y0, self.x1, self.y1 = box[0] + ox, box[1] + oy, box[2] + ox, box[3] + oy
        self.y = self.y0
    def fits(self, x0, y0, x1, y1, what):
        assert self.x0 - 1 <= x0 and x1 <= self.x1 + 1 and self.y0 - 1 <= y0 and y1 <= self.y1 + 1, f"off the page: {what} {(x0, y0, x1, y1)} not in {(self.x0, self.y0, self.x1, self.y1)}"
    def text(self, x, y, s, size, col=INK, anchor="la"):
        f = F(size); bb = self.d.textbbox((x, y), s, font=f, anchor=anchor); self.fits(*bb, s)
        self.d.text((x, y), s, font=f, fill=col, anchor=anchor); return bb
    def wrap(self, x, y, s, size, col=INK2, width=None, gap=1.35):
        f = F(size); width = width or (self.x1 - x); words, line, lines = s.split(), "", []
        for w in words:
            t = (line + " " + w).strip()
            if self.d.textlength(t, font=f) <= width: line = t
            else: lines.append(line); line = w
        lines.append(line)
        for i, l in enumerate(lines): self.text(x, y + int(i * size * gap), l, size, col)
        return y + int(len(lines) * size * gap)
    def paste(self, im, x, y, what="picture"):
        self.fits(x, y, x + im.width, y + im.height, what); self.img.alpha_composite(im, (x, y))


TAB_COLS = [(118, 40, 32), (44, 74, 56), (54, 62, 104), (112, 88, 36)]
TABS = ["Words", "Map", "Beasts", "Quests"]


def spread(book_path, active):
    """the open book with paper tabs stuck to its right edge, on a transparent canvas"""
    bk = open_book(book_path)
    tab_w, tab_h, out = 150, 120, 132                # how far a tab stands proud of the page edge
    cv = Image.new("RGBA", (bk.width + out + 40, bk.height + 40), (0, 0, 0, 0))
    d = ImageDraw.Draw(cv)
    edge = bk.width - 10                             # the book's outer edge: the tabs come out from under it
    for i, lab in enumerate(TABS):
        y = 60 + i * (tab_h + 26); c = TAB_COLS[i]; proud = out + (18 if i == active else 0)
        x0, x1 = edge - 70, edge + proud
        d.rounded_rectangle([x0, y, x1, y + tab_h], radius=18, fill=c, outline=(26, 18, 14), width=4)
        d.rectangle([x0, y + 8, x0 + 30, y + tab_h - 8], fill=tuple(int(v * 0.8) for v in c))
        f = F(30 if i == active else 27)
        tx = edge + proud // 2 + 4
        d.text((tx, y + tab_h // 2), lab, font=f, fill=(238, 226, 196) if i == active else (214, 200, 170), anchor="mm")
    cv.alpha_composite(bk, (0, 20))                  # the book over the tabs' roots: they are stuck under the page
    return cv, 0, 20


def finish(cv, shot, note, out):
    frame = ImageEnhance.Brightness(Image.open(shot).convert("RGB").resize((SW, SH))).enhance(0.35).convert("RGBA")
    k = min(SW * 0.96 / cv.width, SH * 0.9 / cv.height)
    sp = cv.resize((int(cv.width * k), int(cv.height * k)), Image.LANCZOS)
    frame.alpha_composite(sp, ((SW - sp.width) // 2, (SH - sp.height) // 2 - 8))
    ImageDraw.Draw(frame).text((SW // 2, SH - 14), note, font=F(18), fill=(220, 200, 150), anchor="mm")
    frame.save(out)


icons = Image.open(A + "free-animated-magic-book-pixel-art-asset-pack/PNG/Icons.png").convert("RGBA")
ic = lambda col, row, n=72: grim(icons.crop((col * 32, row * 32, col * 32 + 32, row * 32 + 32)), 0.8, 0.95).resize((n, n), Image.NEAREST)

# ---------------------------------------------------------------- the tome
cv, ox, oy = spread("free-animated-magic-book-pixel-art-asset-pack/PNG/Open_book.png", 0)
L, R = Page(cv, LEFT, ox, oy), Page(cv, RIGHT, ox, oy)
L.text(L.x0, L.y0, "The Tome", 56); L.text(L.x0, L.y0 + 76, "Roots you know", 30, INK2)
roots = [("Pyr", "flame", ic(0, 0)), ("Nix", "frost", ic(0, 6)), ("Petr", "stone", ic(4, 0)), ("Phaos", "light", ic(0, 2)), ("Ver", "truth", ic(4, 7)),
         ("Cogn", "thought", ic(4, 8)), ("Sens", "the senses", ic(4, 6)), ("Bary", "weight", ic(4, 1)), ("Mem", "memory", ic(4, 9)), ("San", "mending", ic(4, 3))]
colw = (L.x1 - L.x0) // 2
for i, (r, m, im) in enumerate(roots):
    cx, cy = L.x0 + (i % 2) * colw, L.y0 + 140 + (i // 2) * 136
    if i == 0: L.d.rectangle([cx - 6, cy - 6, cx + colw - 14, cy + 110], outline=RED, width=4)
    L.paste(im, cx, cy + 14); L.text(cx + 88, cy + 10, r, 38); L.text(cx + 88, cy + 62, m, 26, INK2)
big = ic(0, 0, 150); R.paste(big, R.x0, R.y0)
R.text(R.x0 + 176, R.y0 + 6, "Pyr", 64); R.text(R.x0 + 176, R.y0 + 86, "flame and heat", 30, INK2)
y = R.y0 + 196; R.text(R.x0, y, "Mastery: 3 of 5", 30, RED); y += 64
R.text(R.x0, y, "Endings you can add", 30, INK2); y += 56
for e, t in [("Pyr-is", "a small, quick flame"), ("Pyr-or", "a bolt, thrown"), ("Pyr-am", "fire on every foe"), ("Pyr-el", "a beam through two"), ("Pyr-en", "fire in a blade")]:
    R.text(R.x0, y, e, 36); R.text(R.x0 + 190, y + 6, t, 28, INK2); y += 64
R.wrap(R.x0, y + 10, "Study a root at a Pillar, out of the Covenant's sight.", 26)
finish(cv, "/home/claude/durinn/shots2/fort_square.png", "MOCK-UP: the tome. Tabs on the page edge turn to the map, the bestiary and the quests", OUT + "mock_tome.png")

# ---------------------------------------------------------------- the map: the real plains, inked on parchment
cv, ox, oy = spread("adventure-fantasy-book-pixel-art/PNG/Open_book.png", 1)
L, R = Page(cv, LEFT, ox, oy), Page(cv, RIGHT, ox, oy)
src = open("/home/claude/durinn/src/parts/04e_plains.js").read()
Q = {}
for k in ("plainsNW", "plainsNE", "plainsSW", "plainsSE"):
    i = src.index("MAP_DEFS." + k + " = "); Q[k] = json.JSONDecoder().raw_decode(src[src.index("{", i):])[0]
GW, GH = 190, 100
grid = [["." for _ in range(GW)] for _ in range(GH)]
for k, (x0, y0) in {"plainsNW": (0, 0), "plainsNE": (100, 0), "plainsSW": (0, 50), "plainsSE": (100, 50)}.items():
    for y, row in enumerate(Q[k]["rows"]):
        for x, ch in enumerate(row):
            if 0 <= x0 + x < GW and 0 <= y0 + y < GH: grid[y0 + y][x0 + x] = ch
# the map fills both pages, title on top; one tile is 'cell' pixels
mx0, my0 = L.x0, L.y0 + 84; mw, mh = R.x1 - L.x0, L.y1 - my0
cell = min(mw / GW, mh / GH); mx0 += int((mw - cell * GW) / 2)
mp = Image.new("RGBA", (int(cell * GW), int(cell * GH)), (0, 0, 0, 0)); md = ImageDraw.Draw(mp)
import random
rnd = random.Random(3)
for y in range(GH):
    snow = max(0, min(1, (46 - y) / 40))       # the north whitens: wash the parchment pale
    for x in range(GW):
        ch = grid[y][x]; X, Y = x * cell, y * cell
        if snow > 0: md.rectangle([X, Y, X + cell, Y + cell], fill=(248, 244, 232, int(110 * snow)))
        if ch == "~": md.rectangle([X, Y, X + cell, Y + cell], fill=(118, 140, 150, 200 if y > 30 else 120))
        elif ch == "T" and rnd.random() < 0.8:
            r = cell * 0.55; md.ellipse([X + cell / 2 - r, Y + cell / 2 - r, X + cell / 2 + r, Y + cell / 2 + r], fill=(74, 88, 58, 210))
        elif ch == "b": md.ellipse([X + 1, Y + 1, X + cell - 1, Y + cell - 1], fill=(104, 116, 76, 170))
        elif ch == "r": md.ellipse([X + 1, Y + 1, X + cell - 1, Y + cell - 1], fill=(112, 104, 96, 200))
        elif ch in "=B": md.rectangle([X, Y, X + cell, Y + cell], fill=(140, 104, 64, 230))
        elif ch in "RWwD": md.rectangle([X, Y, X + cell, Y + cell], fill=(120, 60, 44, 230))
        elif ch == "c": md.rectangle([X, Y, X + cell, Y + cell], fill=(170, 150, 90, 160))
        elif ch in "fZ#": md.rectangle([X, Y, X + cell, Y + cell], fill=(92, 72, 52, 200))
book = Page(cv, (LEFT[0], LEFT[1], RIGHT[2], RIGHT[3]), ox, oy)
mx0 = int(mx0); book.paste(mp, mx0, int(my0), "plains map")
L.text(L.x0, L.y0, "The Frostcrown Plains", 46)
d = cv; dd = ImageDraw.Draw(cv)
M1 = "fantasy-adventure-book-pixel-ui-asset-pack/PNG/Map1.png"; MP = "adventure-fantasy-book-pixel-art/PNG/map_pictures.png"
M2 = "fantasy-adventure-book-pixel-ui-asset-pack/PNG/Map2.png"; M4 = "fantasy-adventure-book-pixel-ui-asset-pack/PNG/Map4.png"
def medal(path, i):
    im = Image.open(A + path).convert("RGBA"); a = im.split()[3].load(); w, h = im.size
    cols = set(x for x in range(w) if any(a[x, y] for y in range(0, 60))); runs, st = [], None
    for x in range(w + 1):
        on = x in cols
        if on and st is None: st = x
        if not on and st is not None: runs.append((st, x)); st = None
    x0, x1 = [r for r in runs if r[1] - r[0] > 30][i]; ys = [y for y in range(0, 70) if any(a[x, y] for x in range(x0, x1))]
    return grim(im.crop((x0, ys[0], x1, ys[0] + (x1 - x0))), 0.75, 0.95).resize((84, 84), Image.NEAREST)
P = lambda tx, ty: (int(mx0 + tx * cell), int(my0 + ty * cell))
places = [("Oakhaven", medal(MP, 2), 2, 78, (0, -1)), ("Ashford", medal(M2, 0), 58, 88, (0, -1)), ("Greywick", medal(M2, 3), 96, 24, (0, 1)),
          ("Traders' camp", medal(M4, 0), 84, 58, (0, 1)), ("West Forest", medal(MP, 4), 14, 93, (1, 0)), ("East Forest", medal(M1, 3), 186, 70, (-1, 0)),
          ("Overlook", medal(MP, 4), 117, 40, (1, 0)), ("To the Outskirts", medal(M4, 4), 150, 5, (-1, 0))]
for name, im, tx, ty, (lx, ly) in places:
    x, y = P(tx, ty); x = max(book.x0, min(book.x1 - 84, x - 42)); y = max(my0, min(book.y1 - 84, y - 42))
    book.paste(im, x, y, name)
    f = F(26); tw = dd.textlength(name, font=f)
    if lx > 0: tx_, ty_, an = x + 92, y + 42, "lm"
    elif lx < 0: tx_, ty_, an = x - 8, y + 42, "rm"
    elif ly > 0: tx_, ty_, an = x + 42, y + 96, "mt"
    else: tx_, ty_, an = x + 42, y - 8, "mb"
    bb = dd.textbbox((tx_, ty_), name, font=f, anchor=an)
    sx = max(0, book.x0 + 6 - bb[0]) - max(0, bb[2] - (book.x1 - 6)); sy = max(0, book.y0 + 6 - bb[1]) - max(0, bb[3] - (book.y1 - 6))
    tx_ += sx; ty_ += sy; bb = (bb[0] + sx, bb[1] + sy, bb[2] + sx, bb[3] + sy)
    dd.rectangle([bb[0] - 6, bb[1] - 4, bb[2] + 6, bb[3] + 4], fill=(226, 212, 176, 220))
    book.text(tx_, ty_, name, 26, INK, an)
# region names in the old style, and the player's mark
for (tx, ty, s) in [(40, 14, "the Greywick road"), (120, 18, "the Frost Road"), (60, 60, "the Ashford road"), (150, 45, "the downs")]:
    x, y = P(tx, ty); book.text(x, y, s, 24, FADE, "mm")
x, y = P(140, 20); dd.polygon([(x, y), (x - 14, y - 26), (x + 14, y - 26)], fill=RED); book.text(x, y - 34, "You", 24, RED, "mb")
# a key under the map, and how much of it you have found
ky = int(my0 + mp.height + 40)
for i, (lab, col) in enumerate([("road", (140, 104, 64)), ("river", (118, 140, 150)), ("wood", (74, 88, 58)), ("snow", (236, 232, 220))]):
    kx = L.x0 + i * 150; L.d.rectangle([kx, ky + 6, kx + 30, ky + 30], fill=col, outline=INK2, width=2); L.text(kx + 40, ky, lab, 26, INK2)
R.text(R.x0, ky, "Places found: 7 of 8", 28, INK2)
# a compass rose in the bottom-right corner of the map
cx, cy = R.x1 - 70, int(my0 + mp.height - 80)
dd.polygon([(cx, cy - 56), (cx + 12, cy), (cx, cy + 56), (cx - 12, cy)], fill=INK2); dd.polygon([(cx - 56, cy), (cx, cy - 12), (cx + 56, cy), (cx, cy + 12)], fill=INK2)
R.text(cx, cy - 62, "N", 26, INK, "mb")
finish(cv, "/home/claude/durinn/shots2/os_road.png", "MOCK-UP: the map is drawn from the real plains; places you have not found stay grey", OUT + "mock_map.png")

# ---------------------------------------------------------------- the bestiary
cv, ox, oy = spread("bestiary-book-pixel-art-asset-pack/PNG/Open_book.png", 2)
L, R = Page(cv, LEFT, ox, oy), Page(cv, RIGHT, ox, oy)
js = open("/home/claude/durinn/src/parts/02h_foes_data.js").read()
m = re.search(r'"wolfW":\{"cw":(\d+),"ch":(\d+).*?"src":"data:image/png;base64,([^"]+)"', js)
sh = Image.open(io.BytesIO(base64.b64decode(m.group(3)))).convert("RGBA"); fr = sh.crop((0, 0, int(m.group(1)), int(m.group(2)))); fr = fr.crop(fr.getbbox())
L.text(L.x0, L.y0, "Frost Wolf", 56); L.text(L.x0, L.y0 + 74, "Level 13 · beast", 30, INK2)
sc = min((L.x1 - L.x0 - 40) // fr.width, 360 // fr.height); fr = fr.resize((fr.width * sc, fr.height * sc), Image.NEAREST)
gx = L.x0 + (L.x1 - L.x0) // 2; gy = L.y0 + 520
L.d.ellipse([gx - 220, gy - 24, gx + 220, gy + 26], fill=(176, 156, 122)); L.paste(fr, gx - fr.width // 2, gy - fr.height + 10, "wolf")
y = L.wrap(L.x0, gy + 60, "Found on the rocky tor north-west of the Fort, and only at night.", 28)
L.text(L.x0, y + 16, "Beaten: 6", 30)
R.text(R.x0, R.y0, "What you know", 44); y = R.y0 + 86
for k, v in [("Health", "144"), ("Attack", "24"), ("Defence", "8"), ("Speed", "11"), ("Weak to", "fire"), ("Resists", "cold")]:
    R.text(R.x0, y, k, 30, INK2); R.text(R.x0 + 230, y, v, 30); y += 54
R.text(R.x0, y, "Drops", 30, INK2); y = R.wrap(R.x0 + 230, y, "wolf pelt, wolf fang", 30, INK)
y = R.wrap(R.x0, y + 26, "Read with Sens. Until a foe has been read, its numbers show as ???.", 26, RED)
ico = grim(Image.open(A + "bestiary-book-pixel-art-asset-pack/PNG/Icons.png").convert("RGBA"), 0.8, 0.95)
n = 5; size = (R.x1 - R.x0 - (n - 1) * 16) // n
for i in range(n):
    t = ico.crop((5 + (i % 3) * 31, 5 + (i // 3) * 31, 5 + (i % 3) * 31 + 26, 5 + (i // 3) * 31 + 26)).resize((size, size), Image.NEAREST)
    R.paste(t, R.x0 + i * (size + 16), R.y1 - size, "bestiary icon")
finish(cv, "/home/claude/durinn/shots2/os_tor.png", "MOCK-UP: a page for every foe, filled in as you fight. Sens reveals the numbers", OUT + "mock_bestiary.png")

# ---------------------------------------------------------------- the quests
cv, ox, oy = spread("adventure-fantasy-book-pixel-art/PNG/Open_book.png", 3)
L, R = Page(cv, LEFT, ox, oy), Page(cv, RIGHT, ox, oy)
L.text(L.x0, L.y0, "Quests", 56); y = L.y0 + 96
for name, state in [("The Road South", "now"), ("A Letter for Maud", "now"), ("A Keystone for Greywick", "now"), ("The Flicker", "done"), ("Hakon's Work", "done"), ("Lost Casks", "done"), ("Iron for Ida", "done")]:
    col = INK if state == "now" else FADE
    if name == "The Road South": L.d.rectangle([L.x0 - 6, y - 8, L.x1, y + 50], outline=RED, width=4)
    L.text(L.x0 + 10, y, ("✓ " if state == "done" else "") + name, 32, col); y += 74
R.text(R.x0, R.y0, "The Road South", 48); y = R.y0 + 80
R.text(R.x0, y, "Given by Arbitrator Ulric Icetoe", 26, INK2); y += 64
y = R.wrap(R.x0, y, "Carry the Arbitrator's dispatch to the Covenant's southern seat in Etharis. A vault there was broken open this autumn, and an old tome was taken.", 30, INK)
y += 30; R.text(R.x0, y, "Next", 30, RED); y += 50
y = R.wrap(R.x0, y, "Leave by Ashford's south gate, for southern Etharis.", 30, INK)
y += 30; R.text(R.x0, y, "Reward", 30, RED); y += 50
R.wrap(R.x0, y, "The Arbitrator's word, and the Covenant's knot.", 30, INK)
finish(cv, "/home/claude/durinn/shots2/fort_square.png", "MOCK-UP: the quest log moves into the book", OUT + "mock_quests.png")

# ---------------------------------------------------------------- the Pack, built from the game-interface pack
frame = ImageEnhance.Brightness(Image.open("/home/claude/durinn/shots2/fort_square.png").convert("RGB").resize((SW, SH))).enhance(0.35).convert("RGBA")
back = Image.open(UI + "1 Frames/Back1.png").convert("RGBA")
def panel(w, h):
    """the interface pack's look: its blotched plum backing, tiled, inside a grey-to-amber double border"""
    out = Image.new("RGBA", (w, h)); tile = back.resize((back.width * 4, back.height * 4), Image.NEAREST)
    for y in range(0, h, tile.height):
        for x in range(0, w, tile.width): out.paste(tile, (x, y))
    d = ImageDraw.Draw(out)
    for i in range(w):                                   # the border runs grey into amber, like the pack's frames
        t = i / w; c = (int(150 + (212 - 150) * t), int(138 + (137 - 138) * t), int(116 + (30 - 116) * t))
        for y0 in (0, 4, h - 12, h - 8): d.line([(i, y0), (i, y0 + 3)], fill=c)
    for y in range(h):
        for x0 in (0, 4, w - 12, w - 8): d.line([(x0, y), (x0 + 3, y)], fill=(150, 138, 116) if x0 < 10 else (212, 137, 30))
    d.rectangle([12, 12, w - 13, h - 13], outline=(36, 22, 30), width=6)
    return out
pw, ph = 1500, 700; px0, py0 = (SW - pw) // 2, (SH - ph) // 2 - 10
frame.alpha_composite(panel(pw, ph), (px0, py0))
pg = Page(frame, (px0 + 70, py0 + 60, px0 + pw - 70, py0 + ph - 50), 0, 0)
LT = (232, 210, 160)
pg.text(pg.x0, pg.y0, "Pack", 48, LT); pg.text(pg.x0 + 180, pg.y0 + 14, "Supplies   Gear   Materials   Quest items", 28, (170, 150, 120))
slot = Image.open(UI + "1 Frames/Frame1.png").convert("RGBA").resize((22 * 5, 23 * 5), Image.NEAREST)
glyph = lambda i: Image.open(UI + f"3 Icons/Icon with back/Icon_{i:02d}.png").convert("RGBA").resize((72, 72), Image.NEAREST)
items = [("Bandage", 4, 45), ("Poultice", 2, 30), ("Strong poultice", 1, 50), ("Breath tonic", 3, 57), ("Torch oil", 2, 60), ("Trail ration", 5, 116)]
for i, (name, n, g) in enumerate(items):
    cx, cy = pg.x0 + (i % 3) * 440, pg.y0 + 90 + (i // 3) * 150
    pg.paste(slot, cx, cy, "slot"); pg.paste(glyph(g), cx + 19, cy + 21, "icon")
    pg.text(cx + 128, cy + 26, name, 26, LT); pg.text(cx + 128, cy + 66, f"x{n}", 24, (170, 150, 120))
pg.d.rectangle([pg.x0 - 10, pg.y1 - 160, pg.x1, pg.y1], fill=(52, 30, 40)); pg.d.rectangle([pg.x0 - 10, pg.y0 + 84, pg.x0 + 420, pg.y0 + 84 + 140], outline=(212, 137, 30), width=4)
pg.text(pg.x0, pg.y1 - 140, "Bandage", 32, LT)
pg.wrap(pg.x0, pg.y1 - 92, "Clean linen. Mends a little of one fighter's wounds, in battle or out of it.", 24, (200, 186, 156))
frame_note = "MOCK-UP: the Pack, framed with the game-interface pack (the glyph icons stand in for item art)"
ImageDraw.Draw(frame).text((SW // 2, SH - 14), frame_note, font=F(18), fill=(220, 200, 150), anchor="mm")
frame.save(OUT + "mock_pack.png")
print("ok")
