"""Generates the Act 1 wilds (north woods, southern rocks, caves) into src/parts/04b_wilds.js.
Deterministic: re-running gives the same maps. Every key spot is checked for a walkable route."""
import json, math, random
from collections import deque

SOLID = set("T~RWwfSPbr#ZXUYLKC")


class Grid:
    def __init__(s, w, h, fill="."):
        s.w, s.h = w, h
        s.g = [[fill] * w for _ in range(h)]

    def get(s, x, y):
        return s.g[y][x] if 0 <= x < s.w and 0 <= y < s.h else None

    def set(s, x, y, c):
        if 0 <= x < s.w and 0 <= y < s.h:
            s.g[y][x] = c

    def rows(s):
        return ["".join(r) for r in s.g]

    def disc(s, cx, cy, rx, ry, c, only=None, jag=0.0, rnd=None):
        for y in range(int(cy - ry - 1), int(cy + ry + 2)):
            for x in range(int(cx - rx - 1), int(cx + rx + 2)):
                k = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2
                lim = 1 + (rnd.uniform(-jag, jag) if rnd else 0)
                if k <= lim and (only is None or s.get(x, y) in only):
                    s.set(x, y, c)

    def line(s, pts, c, width=2, clear=0, clear_to=".", only_clear=None):
        """walk a polyline; paint c across `width` tiles and clear `clear` tiles each side"""
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
            n = int(max(abs(x1 - x0), abs(y1 - y0)) * 2) + 1
            for i in range(n + 1):
                t = i / n
                x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
                for dy in range(-clear, width + clear):
                    for dx in range(-clear, width + clear):
                        tx, ty = int(round(x)) + dx, int(round(y)) + dy
                        inner = 0 <= dx < width and 0 <= dy < width
                        if inner:
                            if s.get(tx, ty) not in ("B",):
                                s.set(tx, ty, c)
                        elif s.get(tx, ty) is not None and s.get(tx, ty) in (only_clear or SOLID) and s.get(tx, ty) not in "=BOC":
                            s.set(tx, ty, clear_to)


def reach(rows, start, solid_extra=()):
    h, w = len(rows), len(rows[0])
    seen = {start}
    q = deque([start])
    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in seen and rows[ny][nx] not in SOLID and (nx, ny) not in solid_extra:
                seen.add((nx, ny)); q.append((nx, ny))
    return seen


def check(name, rows, start, goals, props=()):
    blocked = set()
    for p in props:
        if p.get("solid", True):
            fw = {"rubble": 2}.get(p["p"], 1)
            for i in range(fw):
                blocked.add((p["x"] + i, p["y"]))
    r = reach(rows, start, blocked)
    for gname, g in goals.items():
        assert g in r, f"{name}: {gname} {g} not reachable"


def grass(rnd):
    v = rnd.random()
    return "." if v < 0.55 else ("," if v < 0.85 else "*")


# ------------------------------------------------------------------ north woods
def woods():
    rnd = random.Random(1107)
    W, H = 110, 60
    G = Grid(W, H)
    for y in range(H):
        for x in range(W):
            G.g[y][x] = grass(rnd)
    # dense tree cover with noise; thick border
    for y in range(H):
        for x in range(W):
            d = min(x, y, W - 1 - x, H - 1 - y)
            n = (math.sin(x * 0.21 + y * 0.13) + math.sin(x * 0.07 - y * 0.29) + math.sin((x + y) * 0.11)) / 3
            if d < 2 or (d < 4 and rnd.random() < 0.6) or n > 0.12 or rnd.random() < 0.22:
                G.g[y][x] = "T"
    feats = {}
    # clearings
    def clearing(name, cx, cy, rx, ry):
        G.disc(cx, cy, rx, ry, None or ".", only=set("T.,*"), jag=0.25, rnd=rnd)
        for y in range(cy - ry - 1, cy + ry + 2):
            for x in range(cx - rx - 1, cx + rx + 2):
                if G.get(x, y) == ".":
                    G.set(x, y, grass(rnd))
        feats[name] = (cx, cy)

    clearing("cottage", 94, 10, 9, 6)
    clearing("den", 38, 12, 6, 4)
    clearing("stones", 58, 19, 6, 4)
    clearing("bog", 36, 49, 9, 6)
    clearing("camp", 82, 47, 7, 5)
    clearing("blind", 12, 28, 5, 4)
    clearing("glade", 24, 39, 6, 4)
    clearing("gate", 11, 55, 5, 4)
    # trails
    main = [(10, 59), (10, 53), (15, 47), (23, 41), (32, 36), (44, 33), (55, 29), (66, 24), (78, 19), (87, 14), (93, 11)]
    G.line(main, "=", 2, clear=1)
    side = [
        [(44, 33), (41, 24), (39, 16)],                 # wolf den
        [(55, 29), (57, 23)],                           # standing stones
        [(23, 41), (27, 46), (31, 49)],                 # black bog
        [(66, 24), (71, 34), (79, 44)],                 # charcoal camp
        [(15, 47), (12, 38), (12, 31)],                 # hunter's blind
    ]
    for s in side:
        G.line(s, "=", 1, clear=1)
    # the bog: dark water with a ragged edge and reeds
    G.disc(37, 50, 6, 3.4, "~", only=set(".,*="), jag=0.18, rnd=rnd)
    # standing stones: a ring of boulders
    for k in range(8):
        a = k / 8 * math.tau
        G.set(int(round(58 + 4 * math.cos(a))), int(round(19 + 2.6 * math.sin(a))), "r")
    # wolf den: rocks round a hollow
    for (x, y) in [(34, 10), (35, 9), (41, 9), (42, 10), (33, 12), (43, 12)]:
        G.set(x, y, "r")
    # the witch's cottage: 5 wide, door at (94, 9); garden fence below-left
    for y in range(6, 9):
        for x in range(92, 97):
            G.set(x, y, "R")
    for i, c in enumerate("WwDwW"):
        G.set(92 + i, 9, c)
    G.set(94, 10, "="); G.set(95, 10, "=")
    for x in range(86, 91):
        G.set(x, 12, "f")
    for y in range(9, 12):
        G.set(86, y, "f")
    G.set(97, 11, "S")
    # hunter's blind: a tiny shuttered hut
    for x in range(11, 14):
        G.set(x, 25, "R")
    for i, c in enumerate("WDW"):
        G.set(11 + i, 26, c)
    # bushes and rocks scattered in the open
    for _ in range(140):
        x, y = rnd.randrange(3, W - 3), rnd.randrange(3, H - 3)
        if G.get(x, y) in ".,*" and all(G.get(x + dx, y + dy) != "=" for dx in (-1, 0, 1) for dy in (-1, 0, 1)):
            G.set(x, y, rnd.choice("bbbr"))
    # entrance
    for y in range(55, 60):
        G.set(10, y, "="); G.set(11, y, "=")
    rows = G.rows()
    props = [
        {"p": "cauldron", "x": 98, "y": 9}, {"p": "firewood", "x": 91, "y": 10}, {"p": "barrel", "x": 97, "y": 9},
        {"p": "herbpatch", "x": 88, "y": 10, "id": "w_cot1"}, {"p": "herbpatch", "x": 89, "y": 11, "id": "w_cot2"},
        {"p": "herbpatch", "x": 22, "y": 38, "id": "w_gl1"}, {"p": "herbpatch", "x": 27, "y": 40, "id": "w_gl2"}, {"p": "herbpatch", "x": 21, "y": 41, "id": "w_gl3"},
        {"p": "herbpatch", "x": 31, "y": 46, "id": "w_bog1"}, {"p": "herbpatch", "x": 43, "y": 48, "id": "w_bog2"},
        {"p": "herbpatch", "x": 61, "y": 21, "id": "w_st1"}, {"p": "herbpatch", "x": 14, "y": 30, "id": "w_bl1"},
        {"p": "firewood", "x": 80, "y": 45}, {"p": "firewood", "x": 81, "y": 45}, {"p": "crate", "x": 85, "y": 47}, {"p": "sack", "x": 86, "y": 47}, {"p": "barrel", "x": 78, "y": 48},
        {"p": "chest", "x": 84, "y": 50, "id": "c_camp"}, {"p": "chest", "x": 14, "y": 27, "id": "c_blind"}, {"p": "chest", "x": 38, "y": 9, "id": "c_den"},
        {"p": "lantern", "x": 93, "y": 10},
    ]
    for p in props:
        if rows[p["y"]][p["x"]] in SOLID and p["p"] != "lantern":
            G.set(p["x"], p["y"], ".")
    rows = G.rows()
    goals = {"door": (94, 10), "den": (38, 12), "stones": (58, 21), "bog": (31, 48), "camp": (82, 47), "blind": (12, 28), "glade": (24, 39)}
    check("wood", rows, (10, 59), goals, props)
    d = {
        "name": "The North Woods", "outside": True, "wild_zone": True,
        "rows": rows, "props": props,
        "warps": [
            {"x": 10, "y": 59, "to": "oak", "tx": 23, "ty": 1, "dir": "down"}, {"x": 11, "y": 59, "to": "oak", "tx": 24, "ty": 1, "dir": "down"},
            {"x": 94, "y": 9, "to": "hut", "tx": 4, "ty": 6, "dir": "up"},
        ],
        "doorKinds": {"94,9": "cottage"},
        "signs": {"97,11": ["Nothing is written here. A bundle of rowan twigs, tied with red thread, hangs where a sign ought to be."]},
        "wild": [
            {"x": 18, "y": 45, "group": ["hound", "hound"]}, {"x": 30, "y": 37, "group": ["wolf"]},
            {"x": 47, "y": 31, "group": ["hound", "hound"]}, {"x": 64, "y": 26, "group": ["wolf"]},
            {"x": 80, "y": 17, "group": ["wolf", "hound"]}, {"x": 38, "y": 12, "group": ["alpha"]},
            {"x": 58, "y": 19, "group": ["leywolf", "thornhound"]}, {"x": 40, "y": 46, "group": ["thornhound", "thornhound"]},
            {"x": 78, "y": 42, "group": ["wolf", "wolf"]}, {"x": 13, "y": 33, "group": ["hound", "wolf"]},
        ],
        "wildNight": [
            {"x": 24, "y": 41, "group": ["leywolf", "hound"]}, {"x": 55, "y": 30, "group": ["leywolf", "wolf"]},
            {"x": 86, "y": 15, "group": ["leywolf", "leywolf"]}, {"x": 70, "y": 32, "group": ["wolf", "thornhound", "hound"]},
        ],
    }
    return d


# ------------------------------------------------------------------ southern rocks
def rocks():
    rnd = random.Random(2209)
    W, H = 100, 50
    G = Grid(W, H)
    for y in range(H):
        for x in range(W):
            G.g[y][x] = "." if rnd.random() < 0.7 else ","
    def band(x0, y0, x1, y1):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                G.set(x, y, "C")
    # borders and mesas
    band(0, 0, W - 1, 2); band(0, 0, 2, H - 1); band(W - 3, 0, W - 1, H - 1); band(0, H - 3, W - 1, H - 1)
    band(10, 3, 34, 12)          # cave A mesa (mouth bottom at y=12)
    band(62, 3, 92, 8)           # cave C mesa
    band(37, 17, 50, 23)         # cave B mesa
    band(82, 21, 96, 28)         # sealed cave
    band(13, 30, 34, 37)         # cave D mesa
    band(60, 38, 76, 46)         # a dead-end butte
    # ragged mesa edges
    for _ in range(260):
        x, y = rnd.randrange(3, W - 3), rnd.randrange(3, H - 3)
        if G.get(x, y) == "." and sum(G.get(x + dx, y + dy) == "C" for dx, dy in ((1, 0), (-1, 0), (0, -1))) >= 1 and G.get(x, y + 1) != "C":
            if rnd.random() < 0.35:
                G.set(x, y, "C")
    mouths = {"A": (22, 12), "C": (76, 8), "B": (43, 23), "S": (89, 28), "D": (23, 37)}
    for k, (x, y) in mouths.items():
        G.set(x, y, "O"); G.set(x + 1, y, "O")
        for dx in (-1, 0, 1, 2):     # keep the cliff whole around the mouth, and the ground in front clear
            G.set(x + dx, y - 1, "C")
            G.set(x + dx, y + 1, ".")
            G.set(x + dx, y + 2, ".")
        G.set(x - 1, y, "C"); G.set(x + 2, y, "C")
    # the road and branches
    G.line([(49, 0), (49, 6), (54, 12), (56, 22), (60, 30), (72, 33), (84, 32), (89, 30)], "=", 2, clear=1, only_clear=set("C"))
    G.line([(49, 7), (40, 13), (22, 14)], "=", 2, clear=0)
    G.line([(54, 12), (66, 11), (76, 10)], "=", 2, clear=0)
    G.line([(56, 22), (52, 26), (43, 25)], "=", 2, clear=0)
    G.line([(52, 26), (40, 33), (30, 40), (23, 39)], "=", 2, clear=0)
    for k, (x, y) in mouths.items():
        G.set(x, y, "O"); G.set(x + 1, y, "O")
        G.set(x, y + 1, "="); G.set(x + 1, y + 1, "=")
    for x in (49, 50):
        for y in range(0, 4):
            G.set(x, y, "=")
    # rocks, dead trees, scrub
    for _ in range(170):
        x, y = rnd.randrange(3, W - 3), rnd.randrange(3, H - 3)
        if G.get(x, y) in ".," and all(G.get(x + dx, y + dy) not in "=O" for dx in (-1, 0, 1) for dy in (-1, 0, 1, 2)):
            G.set(x, y, rnd.choice("rrrrTbb"))
    G.set(52, 5, "S")
    rows = G.rows()
    props = [
        {"p": "rubble", "x": 89, "y": 28, "id": "seal"},
        {"p": "herbpatch", "x": 30, "y": 25, "id": "r_h1"}, {"p": "herbpatch", "x": 70, "y": 15, "id": "r_h2"},
        {"p": "chest", "x": 78, "y": 47 - 3, "id": "c_butte"},
        {"p": "lantern", "x": 21, "y": 13}, {"p": "lantern", "x": 75, "y": 9}, {"p": "lantern", "x": 42, "y": 24}, {"p": "lantern", "x": 22, "y": 38},
    ]
    for p in props:
        if p["p"] not in ("rubble", "lantern") and G.get(p["x"], p["y"]) in SOLID:
            G.set(p["x"], p["y"], ".")
    rows = G.rows()
    goals = {f"mouth{k}": (x, y + 1) for k, (x, y) in mouths.items()}
    check("rocks", rows, (49, 1), goals, props)
    for k, (x, y) in mouths.items():
        if k != "S":
            assert (x, y) in reach(rows, (49, 1)), k
    warps = [{"x": 49, "y": 0, "to": "oak", "tx": 23, "ty": 57, "dir": "up"}, {"x": 50, "y": 0, "to": "oak", "tx": 24, "ty": 57, "dir": "up"}]
    cave_id = {"A": "caveA", "B": "caveB", "C": "caveC", "D": "caveD", "S": "caveS"}
    for k, (x, y) in mouths.items():
        for i in (0, 1):
            warps.append({"x": x + i, "y": y, "to": cave_id[k], "tx": None, "ty": None, "dir": "up", "k": k, "i": i})
    d = {
        "name": "The Southern Rocks", "outside": True, "wild_zone": True, "terrain": "rock",
        "rows": rows, "props": props, "warps": warps,
        "signs": {"52,5": ["South: the old quarry caves. Keep to the road.", "Someone has carved underneath: 'the far one is shut. good.'"]},
        "wild": [
            {"x": 48, "y": 10, "group": ["hound", "hound"]}, {"x": 32, "y": 16, "group": ["wolf", "hound"]},
            {"x": 62, "y": 18, "group": ["thornhound", "wolf"]}, {"x": 58, "y": 32, "group": ["leywolf"]},
            {"x": 78, "y": 31, "group": ["leywolf", "wolf"]}, {"x": 38, "y": 32, "group": ["wolf", "wolf"]},
            {"x": 84, "y": 14, "group": ["thornhound", "thornhound"]},
        ],
        "wildNight": [{"x": 70, "y": 26, "group": ["leywolf", "leywolf"]}, {"x": 26, "y": 22, "group": ["leywolf", "wolf", "hound"]}],
    }
    return d, mouths


# ------------------------------------------------------------------ caves
def cave(cid, name, seed, W, H, goals_spec, wild, props_spec, out_xy):
    rnd = random.Random(seed)
    G = Grid(W, H, "C")
    # carve with drunk walks from the exit, then smooth
    ex = W // 2 - 1
    pts = [(ex, H - 3)] + goals_spec
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        x, y = x0, y0
        for _ in range(4000):
            for dy in range(-1, 2):
                for dx in range(-1, 2):
                    if 2 <= x + dx < W - 2 and 2 <= y + dy < H - 2:
                        G.set(x + dx, y + dy, ".")
            if (x, y) == (x1, y1):
                break
            if rnd.random() < 0.7:
                x += (x1 > x) - (x1 < x); y += (y1 > y) - (y1 < y)
            else:
                x += rnd.choice((-1, 0, 1)); y += rnd.choice((-1, 0, 1))
            x = max(2, min(W - 3, x)); y = max(2, min(H - 3, y))
    for (gx, gy) in goals_spec:
        G.disc(gx, gy, 4.2, 3.2, ".", only=set("C"), jag=0.25, rnd=rnd)
    for _ in range(2):   # cellular smoothing that only opens
        new = [r[:] for r in G.g]
        for y in range(2, H - 2):
            for x in range(2, W - 2):
                n = sum(G.g[y + dy][x + dx] == "." for dy in (-1, 0, 1) for dx in (-1, 0, 1))
                if G.g[y][x] == "C" and n >= 5:
                    new[y][x] = "."
        G.g = new
    # exit corridor
    for y in range(H - 3, H):
        G.set(ex, y, "."); G.set(ex + 1, y, ".")
    # pools and rubble stones
    for _ in range(int(W * H / 50)):
        x, y = rnd.randrange(3, W - 3), rnd.randrange(3, H - 4)
        near = any(abs(x - gx) <= 2 and abs(y - gy) <= 2 for gx, gy in goals_spec + [(p["x"], p["y"]) for p in props_spec])
        if not near and G.get(x, y) == "." and all(G.get(x + dx, y + dy) == "." for dx in (-1, 0, 1) for dy in (-1, 0, 1)) and abs(x - ex) > 2:
            G.set(x, y, rnd.choice("rr,"))
    rows = G.rows()
    props = [dict(p) for p in props_spec]
    for p in props:
        if rows[p["y"]][p["x"]] in SOLID and p["p"] != "lantern":
            G.set(p["x"], p["y"], ".")
    rows = G.rows()
    goals = {f"g{i}": g for i, g in enumerate(goals_spec)}
    check(cid, rows, (ex, H - 1), goals, [p for p in props if p["p"] not in ("lantern",)])
    return {
        "name": name, "outside": True, "cave": True, "dark": True, "terrain": "cave",
        "rows": rows, "props": props,
        "warps": [{"x": ex, "y": H - 1, "to": "rocks", "tx": out_xy[0], "ty": out_xy[1], "dir": "down"},
                  {"x": ex + 1, "y": H - 1, "to": "rocks", "tx": out_xy[0] + 1, "ty": out_xy[1], "dir": "down"}],
        "wild": wild,
    }, (ex, H - 2)


def main():
    out = {}
    out["wood"] = woods()
    r, mouths = rocks()
    specs = {
        "A": ("caveA", "Quarry Cave", 31, 34, 22, [(10, 8), (26, 5)], [{"x": 10, "y": 8, "group": ["cavehound", "hound"]}, {"x": 26, "y": 6, "group": ["cavehound", "cavehound"]}],
              [{"p": "chest", "x": 27, "y": 4, "id": "c_a"}, {"p": "lantern", "x": 16, "y": 17}, {"p": "crate", "x": 9, "y": 7}, {"p": "barrel", "x": 11, "y": 6}]),
        "B": ("caveB", "Dripping Hollow", 47, 40, 26, [(8, 18), (12, 5), (32, 6)], [{"x": 9, "y": 17, "group": ["cavehound"]}, {"x": 13, "y": 6, "group": ["leywolf", "cavehound"]}, {"x": 31, "y": 7, "group": ["cavehound", "cavehound", "hound"]}],
              [{"p": "chest", "x": 33, "y": 5, "id": "c_b"}, {"p": "lantern", "x": 19, "y": 21}, {"p": "herbpatch", "x": 7, "y": 18, "id": "b_h1"}]),
        "C": ("caveC", "Miner's Cut", 53, 34, 20, [(6, 6), (28, 6)], [{"x": 7, "y": 7, "group": ["wolf", "cavehound"]}, {"x": 27, "y": 6, "group": ["cavehound", "thornhound"]}],
              [{"p": "chest", "x": 29, "y": 5, "id": "c_c"}, {"p": "lantern", "x": 16, "y": 15}, {"p": "crate", "x": 5, "y": 5}]),
        "D": ("caveD", "Bone Den", 61, 32, 22, [(16, 5), (6, 10), (26, 12)], [{"x": 16, "y": 6, "group": ["cavehound", "wolf", "wolf"]}, {"x": 7, "y": 10, "group": ["hound", "hound", "hound"]}],
              [{"p": "chest", "x": 26, "y": 11, "id": "c_d"}, {"p": "lantern", "x": 15, "y": 17}]),
        "S": ("caveS", "The Sealed Cave", 71, 44, 28, [(10, 18), (8, 6), (30, 8), (36, 4)], [{"x": 10, "y": 17, "group": ["cavehound", "cavehound"]}, {"x": 9, "y": 6, "group": ["leywolf", "cavehound"]}, {"x": 30, "y": 9, "group": ["blindhound"]}],
              [{"p": "shroom", "x": 37, "y": 3, "id": "moon"}, {"p": "lantern", "x": 21, "y": 23}, {"p": "chest", "x": 7, "y": 5, "id": "c_s"}]),
    }
    for k, (cid, name, seed, W, H, goals, wild, props, ) in specs.items():
        mx, my = mouths[k]
        d, inside = cave(cid, name, seed, W, H, goals, wild, props, (mx, my + 1))
        out[cid] = d
        for wp in r["warps"]:
            if wp.get("k") == k:
                wp["tx"], wp["ty"] = inside[0] + wp["i"], inside[1]
    for wp in r["warps"]:
        wp.pop("k", None); wp.pop("i", None)
    out["rocks"] = r
    js = ["/* Generated by concept/wilds.py: the Act 1 wilds. Edit the generator, not this file. */"]
    for k, d in out.items():
        js.append(f"MAP_DEFS.{k} = {json.dumps(d, separators=(',', ':'))};")
    open("src/parts/04b_wilds.js", "w").write("\n".join(js) + "\n")
    for k, d in out.items():
        print(k, len(d["rows"][0]), "x", len(d["rows"]))
    print("\n".join(out["wood"]["rows"]))
    print()
    print("\n".join(out["rocks"]["rows"]))
    print()
    print("\n".join(out["caveS"]["rows"]))


main()
