"""Bakes the approved Ashford characters (recoloured by newchars.py) into the game's chibi and battle atlas formats.
World sets are side-on only (noBack), at the party's height; Hakon also gets a battle set with his own sword swing.
Writes src/parts/02m_ash_chibi_data.js."""
import base64, io, json
from PIL import Image

OUT = "/home/claude/durinn/assets7/out/"
WORLD_H, FOOT = 76, 78            # Tessa's world chibi: 76 px tall, feet on row 78 of an 84 px frame
BATTLE_H = 75


def frames(k, anim):
    im = Image.open(f"{OUT}{k}/{anim}.png").convert("RGBA"); h = im.height
    return [im.crop((i * h, 0, i * h + h, h)) for i in range(im.width // h)]


def resample(fs, n):
    return [fs[min(len(fs) - 1, int(i * len(fs) / n))] for i in range(n)]


def union(fs):
    bbs = [f.getbbox() for f in fs if f.getbbox()]
    return min(b[0] for b in bbs), min(b[1] for b in bbs), max(b[2] for b in bbs), max(b[3] for b in bbs)


def strip(groups, target_h, fh=84, foot=FOOT, margin=3, post=None):
    """groups: {anim: [frames]}. One scale for every frame; each animation is lined up on the standing body,
    because some of the pack's strips (the swing) are drawn a step back from the idle pose."""
    idle0 = groups[list(groups)[0]][0].getbbox()
    sc = target_h / (idle0[3] - idle0[1])
    cx = (idle0[0] + idle0[2]) / 2                               # the body's centre, standing
    shift = {}
    for name, fs in groups.items():
        b0 = fs[0].getbbox(); shift[name] = 0 if name in ("dead",) else cx - (b0[0] + b0[2]) / 2
    left = max((cx - (union(fs)[0] + shift[n])) * sc for n, fs in groups.items())
    right = max(((union(fs)[2] + shift[n]) - cx) * sc for n, fs in groups.items())
    fw = int(max(left, right) * 2 + margin * 2) + 30 + 1
    ax = fw // 2
    order, anims = [], {}
    for name, fs in groups.items():
        anims[name] = []
        for i, f in enumerate(fs):
            g = f.resize((max(1, round(f.width * sc)), max(1, round(f.height * sc))), Image.NEAREST)
            c = Image.new("RGBA", (fw, fh))
            ox = round(ax - (cx - shift[name]) * sc); oy = round(foot - idle0[3] * sc)
            if post: c = post(name, i, c, g, (ox, oy), lambda x, y, ox=ox, oy=oy: (round(ox + x * sc), round(oy + y * sc))) or c
            else: c.paste(g, (ox, oy), g)
            anims[name].append(len(order)); order.append(c)
    sheet = Image.new("RGBA", (fw * len(order), fh))
    for i, c in enumerate(order): sheet.alpha_composite(c, (i * fw, 0))
    buf = io.BytesIO(); sheet.save(buf, "PNG", optimize=True)
    head = order[anims[list(groups)[0]][0]].getbbox()
    return {"png": base64.b64encode(buf.getvalue()).decode(), "fw": fw, "fh": fh, "anims": anims, "ax": ax, "head": head, "sheet": sheet}


world, battle, sheets = {}, {}, {}
for k in ("voidsong", "hakon", "covknight", "covxbow", "ulric", "ysolt"):
    idle, walk = frames(k, "Idle"), frames(k, "Walk")
    s = strip({"idle_down": idle, "walk_down": walk, "idle_up": idle, "walk_up": walk, "idle_side": idle, "walk_side": walk}, WORLD_H)
    hx = (s["head"][0] + s["head"][2]) // 2
    world["a2_" + k] = {"png": s["png"], "fw": s["fw"], "fh": s["fh"], "anims": s["anims"], "noBack": True,
                        "anchor": {"down": [s["ax"], 77], "up": [s["ax"], 77], "side": [s["ax"], 77]}, "portrait": [max(0, hx - 24), max(0, s["head"][1] - 2), 48, 48]}
    sheets[k] = s["sheet"]
# Hakon in battle: his own swing (no blade drawn over it), a swig from the flask for items and the odd word
hk = {"idle": frames("hakon", "Idle"), "attack": resample(frames("hakon", "Attack_1"), 10), "cast": resample(frames("hakon", "Elixir"), 7),
      "hurt": resample(frames("hakon", "Hurt"), 4), "dead": resample(frames("hakon", "Dead"), 4)}
def no_knife(f):
    """the pack's swordsman swings a little knife; Hakon swings a cleaver, so the knife comes out first"""
    f = f.copy(); px = f.load(); w, h = f.size
    K = {(198, 199, 204), (224, 224, 224)}
    knife = {(x, y) for y in range(h) for x in range(w) if px[x, y][3] and px[x, y][:3] in K and y > 70}
    for (x, y) in knife: px[x, y] = (0, 0, 0, 0)
    for y in range(1, h - 1):
        for x in range(1, w - 1):
            if px[x, y][3] and px[x, y][:3] == (6, 6, 7):
                nb = [px[x + dx, y + dy] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))]
                if not any(q[3] and q[:3] != (6, 6, 7) for q in nb) and any((x + dx, y + dy) in knife for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                    px[x, y] = (0, 0, 0, 0)
    return f


ATK_SRC = [1, 1, 1, 2, 3, 3, 4, 4, 5, 5]
_a1 = frames("hakon", "Attack_1")
hk["attack"] = [no_knife(_a1[k]) for k in ATK_SRC]                       # which of the pack's six swing frames each of ours shows
HAND = [(47, 93), (38, 98), (45, 93), (73, 93), (79, 100), (70, 100)]   # where his fist is in the pack's frames (128 px)
ANG = [-135, -140, -145, -160, -62, -30, 0, 16, 30, 40]        # the cleaver: up and back, over, then down through
BEHIND = [True, True, True, True, False, False, False, False, False, False]


def cleaver():
    c = Image.new("RGBA", (34, 13)); px = c.load()
    for x in range(0, 8):
        for y in range(5, 8): px[x, y] = (58, 42, 28, 255) if y != 5 else (90, 66, 42, 255)       # wrapped grip
    for y in range(3, 10): px[8, y] = (60, 60, 66, 255); px[9, y] = (40, 40, 44, 255)             # the guard
    for x in range(10, 33):
        top = 1 if x > 13 else 3
        for y in range(top, 11):
            col = (138, 138, 146, 255)
            if y == 10: col = (196, 196, 204, 255)                                                # the edge
            elif y == top: col = (96, 96, 104, 255)                                               # the spine
            elif (x * 7 + y * 3) % 11 == 0: col = (104, 104, 112, 255)                            # pitting
            px[x, y] = col
    for (x, y) in [(20, 10), (21, 10), (27, 10)]: px[x, y] = (0, 0, 0, 0)                         # notches in the edge
    for x in range(10, 33): px[x, 0 if x > 13 else 2] = (24, 22, 26, 255)
    for y in range(1, 11): px[33 if y < 11 else 32, y] = (24, 22, 26, 255)
    return c


CLV = cleaver()


def post_hakon(name, i, c, g, at, to):
    if name != "attack":
        c.paste(g, at, g); return c
    k = ATK_SRC[i]; hx, hy = to(*HAND[k])
    r = CLV.rotate(-ANG[i], expand=True, resample=Image.NEAREST)
    # the grip end of the blade sits in the fist: find where (3, 6) of the unrotated blade went
    import math
    a = math.radians(ANG[i]); gx, gy = 3 - 17, 6 - 6.5
    rx = gx * math.cos(a) - gy * math.sin(a) + r.width / 2; ry = gx * math.sin(a) + gy * math.cos(a) + r.height / 2
    pos = (round(hx - rx), round(hy - ry))
    if BEHIND[i]: c.alpha_composite(r, pos) if pos[0] >= 0 and pos[1] >= 0 else c.paste(r, pos, r); c.paste(g, at, g)
    else: c.paste(g, at, g); c.alpha_composite(r, pos) if pos[0] >= 0 and pos[1] >= 0 else c.paste(r, pos, r)
    return c


b = strip(hk, BATTLE_H, post=post_hakon)
an = dict(b["anims"]); an["attack_sword"] = an["attack"]
battle["hakon"] = {"png": b["png"], "fw": b["fw"], "fh": b["fh"], "anims": an, "anchor": [b["ax"], 77]}
sheets["hakon_battle"] = b["sheet"]

js = ("/* Ashford's people from the supplied chibi and RPG-hero packs, recoloured and grimmed (concept/newchars.py, baked by concept/ashchibi_bake.py) */\n"
      "Object.assign(CHIBI_DATA.chars, " + json.dumps(world, separators=(",", ":")) + ");\n"
      "Object.assign(BATTLE_DATA.chars, " + json.dumps(battle, separators=(",", ":")) + ");\n")
open("/home/claude/durinn/src/parts/02m_ash_chibi_data.js", "w").write(js)
for k, sh in sheets.items():
    sh.save(f"/tmp/claude-0/-home-claude/81f7a483-afca-5415-8c60-809b5595b3f8/scratchpad/newpacks2/bake_{k}.png")
    print(k, sh.size)
print("bytes", len(js))
