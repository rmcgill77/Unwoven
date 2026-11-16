"""Recolours the supplied chibi and RPG-hero sheets into Ashford's people, grimmed, and makes a concept sheet.
Voidsong <- chibi Enchantress; Hakon <- chibi Swordsman; Covenant soldier <- RPG Knight; Covenant crossbowman <- RPG Crossbowman."""
import colorsys, glob, os
from PIL import Image, ImageDraw, ImageFont
A = "/home/claude/durinn/assets7/"
OUT = A + "out/"
H = lambda s: tuple(int(s[i:i + 2], 16) for i in (1, 3, 5))
MAPS = {
    "voidsong": ("free-fantasy-chibi-female-sprites-pixel-art/Enchantress", {
        "#781d4f": "#3a2048", "#ad2f45": "#5e3a72", "#73172d": "#2e1a3a", "#b4202a": "#6e4a86", "#3b1725": "#24142e",
        "#bb7547": "#8a6a2a", "#dba463": "#c8a24a", "#7d3833": "#5a4418",
        "#c8d45d": "#4a4058", "#2f5753": "#1c1822", "#f5ffe8": "#8a7e9a",
        "#fa6a0a": "#7a3aa0", "#f9a31b": "#a86ad0", "#ffd541": "#e0c8ff", "#ff8933": "#b07ad0",
        "#285cc4": "#5a2a8a", "#249fde": "#8a4ac0", "#a6fcdb": "#d8b0ff", "#143464": "#2e1448"}),
    "hakon": ("free-fantasy-chibi-male-sprites-pixel-art/Swordsman", {
        "#b05b2c": "#4a1e14", "#e88a36": "#7a2e1c", "#f9a31b": "#9a3e22", "#f8c53a": "#b04a28", "#ffd541": "#c86038",
        "#9cdb43": "#d0eef4", "#59c135": "#9ac8d8", "#14a02e": "#5a90a8", "#1a7a3e": "#3a6a80", "#24523b": "#2a4a5a",
        "#143464": "#3a3028", "#14182e": "#1e1a16",
        "#422433": "#2e261e", "#3b1725": "#221c16", "#5b3138": "#4a3a2c", "#8f4d57": "#6a5440", "#291d2b": "#1a1612"}),
    "covknight": ("rpg-heroes-pixel-art-asset-pack/Knight", {
        "#73172d": "#4a2a5c", "#b4202a": "#6e4a86", "#422433": "#2e1a3a", "#3b1725": "#24142e",
        "#fa6a0a": "#8a6a2a", "#f9a31b": "#c8a24a", "#ffd541": "#e8d080"}),
    "covxbow": ("rpg-heroes-pixel-art-asset-pack/Crossbowmen", {
        "#781d4f": "#4a2a5c", "#ad2f45": "#6e4a86", "#73172d": "#3a2048", "#b4202a": "#c8a24a", "#4f1d4c": "#2e1a3a",
        "#293f21": "#3a3a40", "#181c19": "#222226"}),
    "ulric": ("free-fantasy-chibi-male-sprites-pixel-art/Wizard", {
        "#3d2936": "#76767e", "#3b2027": "#5e5e66", "#291d2b": "#46464e", "#3b1725": "#3a3a42", "#73172d": "#2a2a30",
        "#283540": "#3e3a4a", "#2c354d": "#5a2a26", "#122020": "#221e2a", "#14182e": "#1a1622", "#8f4d57": "#8a8a92"}),
    "ysolt": ("free-fantasy-chibi-female-sprites-pixel-art/Knight", {
        "#e4a672": "#5e3e2c", "#b86f50": "#44281c", "#743f39": "#2a1812", "#dba463": "#6a4a34",
        "#781d4f": "#4a2a5c", "#ad2f45": "#6e4a86", "#3f2832": "#2e1a3a", "#422433": "#24142e", "#5b3138": "#3a2048",
        "#bb7547": "#c8a24a"}),
}


def grim(c):
    h, s, v = colorsys.rgb_to_hsv(*[x / 255 for x in c])
    s *= 0.78; v = v * 0.88
    return tuple(int(round(x * 255)) for x in colorsys.hsv_to_rgb(h, s, v))


def recolour(im, cmap):
    im = im.convert("RGBA"); px = im.load()
    m = {H(k): H(v) for k, v in cmap.items()}
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a == 0: continue
            c = m.get((r, g, b), (r, g, b))
            px[x, y] = (*grim(c), a)
    return im


def beard(im):
    """Hakon is older than the base: a short copper beard over the jaw, below the eyes, in every frame"""
    px = im.load(); h = im.height; fw = h
    SKIN = {H("#ffc2a1"), H("#bd6a62")}; EYE = {H(c) for c in ("#9cdb43", "#59c135", "#14a02e", "#1a7a3e", "#24523b", "#ffffff")}
    for f in range(im.width // fw):
        x0 = f * fw
        eyes = [y for y in range(h) for x in range(x0, x0 + fw) if px[x, y][3] and px[x, y][:3] in EYE]
        if not eyes: continue
        ey = max(eyes)
        for y in range(ey + 3, h):
            for x in range(x0, x0 + fw):
                if px[x, y][3] and px[x, y][:3] in SKIN:
                    edge = any(not px[x + dx, y + dy][3] or px[x + dx, y + dy][:3] in ((6, 6, 8), (0, 0, 0)) for dx, dy in ((0, 1), (-1, 0), (1, 0)) if x0 <= x + dx < x0 + fw and y + dy < h)
                    px[x, y] = (*(H("#5a2416") if edge or (x + y) % 3 == 0 else H("#8a3a22")), 255)
    return im


def grey_beard(im):
    """Ulric is Maud's son and past fifty: a close iron-grey beard, in every frame"""
    px = im.load(); h = im.height; fw = h
    SKIN = {H("#ffc2a1"), H("#bd6a62")}; EYE = {H(c) for c in ("#ff8933", "#fa6a0a", "#f9a31b", "#ffd541", "#ffffff")}
    for f in range(im.width // fw):
        x0 = f * fw
        eyes = [y for y in range(h) for x in range(x0, x0 + fw) if px[x, y][3] and px[x, y][:3] in EYE and y < h - 30]
        if not eyes: continue
        ey = max(eyes)
        for y in range(ey + 3, h):
            for x in range(x0, x0 + fw):
                if px[x, y][3] and px[x, y][:3] in SKIN:
                    edge = any(not px[x + dx, y + dy][3] or px[x + dx, y + dy][:3] in ((6, 6, 8), (0, 0, 0)) for dx, dy in ((0, 1), (-1, 0), (1, 0)) if x0 <= x + dx < x0 + fw and y + dy < h)
                    px[x, y] = (*(H("#4e4e56") if edge or (x + y) % 3 == 0 else H("#7a7a84")), 255)
    return im


def run():
    os.makedirs(OUT, exist_ok=True)
    for k, (src, cmap) in MAPS.items():
        os.makedirs(OUT + k, exist_ok=True)
        extra = {"hakon": "fantasy-chibi-male-sprites-pixel-art/Swordsman", "voidsong": "fantasy-chibi-female-sprite-sheets-pixel-art/Enchantress"}.get(k)
        for f in glob.glob(A + src + "/*.png") + (glob.glob(A + extra + "/*.png") if extra else []):
            im = Image.open(f).convert("RGBA")
            if k == "hakon": im = beard(im)
            if k == "ulric": im = grey_beard(im)
            recolour(im, cmap).save(OUT + k + "/" + os.path.basename(f))


def frames(p):
    im = Image.open(p).convert("RGBA"); h = im.height
    return [im.crop((i * h, 0, i * h + h, h)) for i in range(im.width // h)]


def sheet():
    F = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 15)
    party = Image.open("/home/claude/durinn/concept/battle_tessa.png").convert("RGBA")
    tess = party.crop((0, 0, 96, 84)); tb = tess.getbbox(); tess = tess.crop(tb)
    target = tess.height                                   # the party's height in battle art
    rows = [("Tessa (party, for scale)", [tess], None)]
    names = {"voidsong": "Curate Voidsong", "hakon": "Hakon Redfell", "covknight": "Covenant soldier", "covxbow": "Covenant crossbowman", "ulric": "Arbitrator Ulric Icetoe", "ysolt": "Captain Ysolt Rennick"}
    for k in MAPS:
        d = OUT + k + "/"
        pick = []
        for anim in ("Idle", "Walk", "Attack_1"):
            fs = frames(d + anim + ".png"); pick += fs[::max(1, len(fs) // 3)][:3]
        bbs = [f.getbbox() for f in pick]
        x0 = min(b[0] for b in bbs); y0 = min(b[1] for b in bbs); x1 = max(b[2] for b in bbs); y1 = max(b[3] for b in bbs)
        body = frames(d + "Idle.png")[0].getbbox(); sc = target / (body[3] - body[1])
        pick = [f.crop((x0, y0, x1, y1)) for f in pick]
        pick = [f.resize((max(1, round(f.width * sc)), max(1, round(f.height * sc))), Image.NEAREST) for f in pick]
        rows.append((names[k] + f"  (idle, walk, attack; x{sc:.2f})", pick, sc))
    Z = 3
    W = max(sum(f.width * Z + 16 for f in fs) for _, fs, _ in rows) + 20
    Ht = sum(max(f.height for f in fs) * Z + 40 for _, fs, _ in rows)
    out = Image.new("RGB", (W, Ht), (46, 42, 40)); dr = ImageDraw.Draw(out); y = 0
    for t, fs, _ in rows:
        dr.text((10, y + 6), t, font=F, fill=(235, 228, 210)); y += 28
        x = 10; hmax = max(f.height for f in fs) * Z
        for f in fs:
            g = f.resize((f.width * Z, f.height * Z), Image.NEAREST); out.paste(g, (x, y + hmax - g.height), g); x += g.width + 16
        y += hmax + 12
    out.save("/tmp/claude-0/-home-claude/81f7a483-afca-5415-8c60-809b5595b3f8/scratchpad/fort_people.png"); print(out.size)


if __name__ == "__main__":
    run(); sheet()
