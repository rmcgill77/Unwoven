"""Generates the Western Crags (Act 3) into src/parts/04z7_crags.js.

One 180 x 160 map (global tiles), cut into four 90 x 80 sections joined by walk-through seams like southern Etharis:

    cr00 x 0-89  y 0-79:   the High Peaks (the shrine, the tarn, the pilgrim path and the rope bridge)
    cr10 x 90-179 y 0-79:  the Old Pines (the switchbacks, the Unbound fire, the old observatory)
    cr01 x 0-89  y 80-159: Cinder Hollow (the mining camp, Grimscar Mine, the spoil heaps)
    cr11 x 90-179 y 80-159: the Cleft (the tunnel mouth, the masons' camp, the Cleft road)

Plus their own maps: the pass tunnel (cr_tunnel), Grimscar Mine on three levels (cr_mine1-3), the Shrine of the First
Word (cr_shrine), Cinder Hollow's rooms and the tarn fisher's hut. Layout follows the approved concept
(concept/crags_concept.png). Snow lies on the high north, by latitude. Deterministic, and every key spot is checked for a
walkable route from the tunnel."""
import json, math, random, sys
sys.path.insert(0, "/home/claude/durinn/concept")
from plains import Grid, reach

SOLID = set("T~RWwfSPbr#ZXUYLKCgFHkqO")
W, H, CW, CH = 180, 160, 90, 80
OUT = "/home/claude/durinn/src/parts/04z7_crags.js"
SCR = "/tmp/claude-0/-home-claude/81f7a483-afca-5415-8c60-809b5595b3f8/scratchpad/"
NAMES = [["the High Peaks", "the Old Pines"], ["Cinder Hollow", "the Cleft"]]
rnd = random.Random(9090)


class VNoise:
    def __init__(s, cell, seed): s.cell, s.seed = cell, seed
    def v(s, ix, iy): return random.Random(ix * 73856093 ^ iy * 19349663 ^ s.seed * 83492791).random()
    def __call__(s, x, y):
        fx, fy = x / s.cell, y / s.cell; ix, iy = int(math.floor(fx)), int(math.floor(fy)); tx, ty = fx - ix, fy - iy
        tx, ty = tx * tx * (3 - 2 * tx), ty * ty * (3 - 2 * ty)
        a, b, c, d = s.v(ix, iy), s.v(ix + 1, iy), s.v(ix, iy + 1), s.v(ix + 1, iy + 1)
        return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty


N1, N2 = VNoise(17, 11), VNoise(7, 12)


def height(x, y):
    """the land rises to the north-west; ridges of cliff run along its contours"""
    return 1.0 - (x / W) * 0.45 - (y / H) * 0.55 + 0.12 * math.sin(x / 9.0) * math.cos(y / 11.0) + (N1(x, y) - 0.5) * 0.16


def grass(): v = rnd.random(); return "." if v < 0.6 else ("," if v < 0.86 else "*")


G = Grid(W, H)
for y in range(H):
    for x in range(W): G.g[y][x] = grass()
# ---------------- rock: a thick wild edge, cliff bands on the contours, the high peaks solid
for y in range(H):
    for x in range(W):
        d = min(x, y, W - 1 - x, H - 1 - y); h = height(x, y)
        edge = 3 + int(N2(x, y) * 4)
        if d < edge or h > 0.9 or any(abs(h - k) < 0.016 for k in (0.48, 0.63, 0.78)): G.g[y][x] = "C"
        elif rnd.random() < 0.035: G.g[y][x] = "r"
# pines on the middle slopes, east and north-east; thinner pines elsewhere
for y in range(H):
    for x in range(W):
        if G.g[y][x] == "C": continue
        h = height(x, y)
        dense = 92 < x < 176 and 8 < y < 98 and 0.36 < h < 0.66 and N2(x * 1.3, y * 1.3) > 0.38
        if (dense and rnd.random() < 0.6) or (not dense and h < 0.7 and rnd.random() < 0.05): G.g[y][x] = "T"


def carve(pts, width=2, c="=", clear=1, keep=""):
    """a road: paint c, turn water into bridges, and cut through rock, trees and boulders either side"""
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        n = int(max(abs(x1 - x0), abs(y1 - y0)) * 2) + 1
        for i in range(n + 1):
            t = i / n; x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
            for dy in range(-clear - width // 2, width - width // 2 + clear):
                for dx in range(-clear - width // 2, width - width // 2 + clear):
                    tx, ty = int(round(x)) + dx, int(round(y)) + dy
                    cur = G.get(tx, ty)
                    if cur is None or min(tx, ty, W - 1 - tx, H - 1 - ty) < 2: continue
                    inner = -(width // 2) <= dx < width - width // 2 and -(width // 2) <= dy < width - width // 2
                    if inner:
                        if cur in "~B": G.set(tx, ty, "B")
                        elif cur not in keep: G.set(tx, ty, c)
                    elif cur in "TbrC": G.set(tx, ty, grass())


def clear_round(cx, cy, rx, ry, c=None):
    for y in range(int(cy - ry - 1), int(cy + ry + 2)):
        for x in range(int(cx - rx - 1), int(cx + rx + 2)):
            if ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1 and min(x, y, W - 1 - x, H - 1 - y) >= 3: G.set(x, y, c or grass())


def rock(x0, y0, x1, y1):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1): G.set(x, y, "C")


# ---------------- water: the high tarn, a stream from it down the Cleft, a gorge stream off the peaks
G.disc(74, 40, 11, 7, "~", jag=0.1, rnd=rnd)
river = [(84, 44), (96, 58), (108, 76), (116, 96), (132, 104), (150, 110), (164, 116), (176, 118)]
gorge = [(62, 3), (60, 14), (58, 24), (54, 36), (63, 40)]
for line in (river, gorge):
    for (x0, y0), (x1, y1) in zip(line, line[1:]):
        n = int(max(abs(x1 - x0), abs(y1 - y0)) * 2) + 1
        for i in range(n + 1):
            t = i / n; x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
            for dy in range(2):
                for dx in range(2): G.set(int(round(x)) + dx, int(round(y)) + dy, "~")

# ---------------- places, cleared first so the roads run into them
feats, props, signs, pillars, camps, doors, kinds, triggers = {}, [], {}, [], [], {}, {}, []


def prop(p, x, y, **kw): props.append({"p": p, "x": x, "y": y, **kw})


def sign(x, y, *lines): G.set(x, y, "S"); signs[(x, y)] = list(lines)


def pillar(pid, tx, ty):
    clear_round(tx + 1, ty, 6, 4)
    for x in (tx, tx + 1): G.set(x, ty, "P")
    feats["pillar_" + pid] = (tx, ty + 1); pillars.append({"id": pid, "tx": tx, "ty": ty, "r": 5})


def house(x0, x1, y0, y1, door, kind):
    for y in range(y0, y1):
        for x in range(x0, x1 + 1): G.set(x, y, "R")
    for x in range(x0, x1 + 1): G.set(x, y1, "w" if (x - x0) % 3 == 1 and abs(x - door) > 1 else "W")
    G.set(door, y1, "D"); doors[(door, y1)] = kind; kinds[f"{x0},{y0}"] = kind
    G.set(door, y1 + 1, "=")


# the tunnel mouth in the east wall, and the masons' camp below it
rock(164, 98, 178, 107)
clear_round(158, 110, 12, 6)
G.set(171, 107, "O"); G.set(172, 107, "O"); G.set(171, 108, "."); G.set(172, 108, ".")
feats["tunnel"] = (171, 109)
pillar("crags_camp", 152, 113)
for (p, x, y, kw) in [("leanto", 160, 104, {}), ("leanto", 164, 110, {}), ("tarp", 154, 105, {"lk": "masontarp"}), ("firepit", 158, 109, {}), ("crate", 150, 106, {"lk": "masonstone"}),
                      ("crate", 151, 107, {}), ("barrel", 167, 113, {}), ("rack", 162, 114, {"lk": "masontools"}), ("ubanner", 0, 0, {})]:
    if p == "ubanner": continue
    prop(p, x, y, **kw)
prop("banner", 157, 103)
camps.append({"x": 158, "y": 109, "r": 4})
sign(166, 112, "Covenant works. By order of the Vaultwarden of Aurelm, the old way into the Crags is opened.", "Travellers keep to the roads. The Crags are not safe.")
# Cinder Hollow: the stockade, its houses and cages, the mine mouth in the cliff above it
for y in range(98, 154):
    for x in range(24, 90):
        if G.get(x, y) in "TrC~": G.set(x, y, grass())
rock(24, 99, 86, 109)
for y in range(112, 151):
    for x in range(30, 85):
        if G.get(x, y) != "~": G.set(x, y, grass())
for x in range(30, 85): G.set(x, 112, "f"); G.set(x, 150, "f")
for y in range(112, 151): G.set(30, y, "f"); G.set(84, y, "f")
for y in (126, 127): G.set(84, y, ".")                     # the east gate
for x in (52, 53): G.set(x, 112, ".")                      # the gate up to the mine
for y in (140, 141): G.set(30, y, ".")                     # the west gate, to the spoil heaps
G.set(52, 109, "O"); G.set(53, 109, "O"); G.set(52, 110, "."); G.set(53, 110, "."); G.set(52, 111, "="); G.set(53, 111, "=")
house(34, 44, 115, 121, 39, "outpost")      # the overseer's house
house(48, 60, 115, 120, 54, "shack")        # the bunkhouse
house(64, 72, 115, 120, 68, "cottage")      # the cookhouse
house(34, 42, 137, 142, 38, "smithy")       # the forge
house(70, 78, 137, 142, 74, "carter")       # the store
rect_pts = []
for y in range(124, 147):
    for x in range(31, 84):
        if G.get(x, y) in ".,*" and (x in (32, 33) or y in (124, 146)): pass
carve([(84, 126.5), (60, 126.5), (53, 126.5), (53, 112)], 2, clear=0, keep="fDRWw")
carve([(39, 122), (39, 126)], 1, clear=0); carve([(68, 121), (68, 126)], 1, clear=0)
# the cages: four pens of stakes on the yard, the workers' rows
for k in range(4):
    x0 = 44 + k * 8
    for x in range(x0, x0 + 5):
        G.set(x, 131, "q"); G.set(x, 135, "q")
    for y in range(131, 136): G.set(x0, y, "q"); G.set(x0 + 4, y, "q")
    feats[f"cage{k}"] = (x0 + 2, 129)
prop("firepit", 62, 139, lk="hollowfire"); prop("barrel", 66, 140); prop("crate", 60, 141, lk="orecrate"); prop("wagon", 76, 130, lk="orecart")
prop("sack", 46, 128); prop("rack", 36, 130, lk="chainrack")
for (x, y) in [(50, 113), (56, 113), (80, 125), (80, 129)]: prop("lamp", x, y)
sign(87, 128, "CINDER HOLLOW. Grimscar Delving Company.", "Licensed under the Covenant. Trespassers will be put to work.")
feats["hollow"] = (60, 128); feats["mine"] = (52, 111)
# the spoil heaps west and south of the Hollow: slag, dead wood, old shafts
clear_round(17, 136, 12, 15)
for _ in range(140):
    x, y = rnd.randrange(5, 30), rnd.randrange(100, 155)
    if G.get(x, y) in ".,*": G.set(x, y, "r" if rnd.random() < 0.7 else "T")
for _ in range(50):
    x, y = rnd.randrange(30, 86), rnd.randrange(151, 156)
    if G.get(x, y) in ".,*": G.set(x, y, "r")
prop("bones", 14, 128); prop("bones", 20, 140); prop("hatch", 16, 134, lk="oldshaft")
feats["heaps"] = (28, 141)
# the switchbacks and the ambush on them
feats["skirmish"] = (130, 57)
# the old observatory: a ring of broken wall on a knoll above the river
clear_round(122, 68, 7, 5)
for a in range(0, 360, 20):
    if 60 <= a <= 120: continue                             # the way in, on the south side
    x, y = 122 + round(5 * math.cos(math.radians(a))), 68 + round(3.5 * math.sin(math.radians(a)))
    G.set(x, y, "#")
prop("block", 121, 67, lk="obsplinth"); prop("books", 124, 66, lk="obsnotes"); prop("rubble", 119, 69); prop("chest", 125, 69, id="c_cr_obs")
feats["observatory"] = (122, 72)
# the Unbound fire on a hidden ledge, up the goat track
clear_round(166, 28, 6, 4)
for (p, x, y) in [("leanto", 163, 26), ("firepit", 166, 28), ("ubanner", 169, 25), ("crate", 170, 29), ("sack", 162, 29)]: prop(p, x, y)
camps.append({"x": 166, "y": 28, "r": 3})
triggers.append({"id": "unbfire", "x": 162, "y": 34, "r": 4})
feats["unbound"] = (166, 31)
# the high tarn: a Pillar on the north shore, the fisher's hut on the south
pillar("crags_tarn", 78, 29)
clear_round(72, 52, 6, 3)
house(68, 75, 48, 52, 71, "shack")
prop("sack", 76, 52, lk="fishnets"); prop("barrel", 66, 52)
feats["hut"] = (71, 54)
# the shrine: a cave mouth in the highest face
rock(20, 3, 50, 12)
clear_round(35, 16, 7, 3)
G.set(34, 12, "O"); G.set(35, 12, "O"); G.set(34, 13, "."); G.set(35, 13, ".")
prop("candles", 31, 14, lk="pilgrimcandles"); prop("bones", 39, 15)
feats["shrine"] = (34, 15)
sign(38, 16, "THE SHRINE OF THE FIRST WORD.", "Speak your name at the door. The warden is listening.")

# ---------------- roads
carve([(171, 109), (166, 111), (158, 113), (148, 116), (128, 118), (110, 122), (96, 126), (85, 126.5)], 2)       # the Cleft road
carve([(150, 113), (146, 98), (138, 92), (144, 82), (134, 74), (140, 64), (128, 56), (118, 50), (104, 47), (92, 42), (86, 36), (80, 31)], 2)   # the switchbacks, up to the tarn
carve([(78, 30), (68, 28), (60, 23), (50, 20), (42, 17), (35, 14)], 1)                                         # the old pilgrim path, over the gorge
carve([(138, 66), (150, 56), (158, 44), (162, 36), (164, 31)], 1)                                               # the goat track
carve([(134, 74), (128, 73), (122, 72)], 1)                                                                     # to the observatory
carve([(71, 53), (74, 47)], 1)                                                                                  # the hut, to the shore path
carve([(80, 31), (82, 38), (80, 46), (74, 50)], 1)
# the rope bridge: where the pilgrim path crosses the gorge stream
for y in (22, 23):
    for x in range(52, 66):
        if G.get(x, y) == "~": G.set(x, y, "B")
        elif G.get(x, y) in "CTr" and 54 <= x <= 63: G.set(x, y, "=")
feats["bridge"] = (59, 22)
# the ambush party on the switchbacks
for y in range(52, 63):
    for x in range(124, 139):
        if ((x - 131) / 7.5) ** 2 + ((y - 57.5) / 5) ** 2 <= 1 and G.get(x, y) in "TrC": G.set(x, y, grass())
prop("wagon", 128, 55, lk="supplycart"); prop("crate", 132, 54, lk="supplycrate"); prop("barrel", 126, 58)
triggers.append({"id": "crskirm", "x": 131, "y": 59, "r": 4})

for p in props:
    if G.get(p["x"], p["y"]) in SOLID and p["p"] not in ("hatch",): G.set(p["x"], p["y"], ".")
rows = ["".join(r) for r in G.g]

# ---------------- reachability from the tunnel mouth
blocked = set()
for p in props:
    if p["p"] in ("herbpatch", "candles", "bones", "hatch"): continue
    for i in range({"leanto": 2, "wagon": 2, "tarp": 2}.get(p["p"], 1)): blocked.add((p["x"] + i, p["y"]))
R = reach([r.replace("O", ".") for r in rows], (171, 109), blocked)
bad = [f"{k} {xy}" for k, xy in feats.items() if xy not in R]
for (x, y), k in doors.items():
    if (x, y + 1) not in R: bad.append(f"door {k} {x},{y}")
assert not bad, bad
if "-dbg" in sys.argv:
    for y in range(8, 36): print("".join(("@" if (x, y) in R else rows[y][x]) for x in range(20, 100)))

# ---------------- foes, by ground: wolves in the pines and on the rocks, ents in the old timber, the dead on the heaps
safe = [(171, 109), (60, 128), (166, 28), (152, 114), (78, 30), (71, 53), (34, 15)]
def far(x, y, rr=12): return all(math.hypot(x - a, y - b) >= rr for a, b in safe)
def wooded(x, y): return sum(rows[y + dy][x + dx] == "T" for dx in range(-3, 4) for dy in range(-3, 4) if 0 <= x + dx < W and 0 <= y + dy < H) > 10
wild = []
for i in range(54):
    for _ in range(120):
        x, y = rnd.randrange(5, W - 5), rnd.randrange(5, H - 5)
        if rows[y][x] in ".,*" and (x, y) in R and far(x, y) and all(math.hypot(x - g["x"], y - g["y"]) > 9 for g in wild):
            if x < 30 and y > 98: grp = rnd.choice([["skelmin", "skelmin"], ["skelmin", "skelW"], ["skelmin", "skelA", "skelmin"]]); when = "night"
            elif wooded(x, y): grp = rnd.choice([["ent"], ["crwolf", "crwolf"], ["ent", "crwolf"], ["crwolf", "crwolf", "crwolf"]]); when = None
            elif y < 30: grp = rnd.choice([["crfrost", "crfrost"], ["entdead", "crfrost"], ["crfrost"]]); when = None
            else: grp = rnd.choice([["crwolf", "crwolf"], ["boar"], ["thug", "archer"], ["cavehound", "cavehound"]]); when = "night" if i % 4 == 3 else "day"
            g = {"x": x, "y": y, "group": grp}
            if when: g["when"] = when
            wild.append(g); break


def sec(cx, cy): return f"cr{cx}{cy}"


def owner(x, y):
    if 0 <= x < W and 0 <= y < H: return sec(x // CW, y // CH)


out = {}
for cy in range(2):
    for cx in range(2):
        k = sec(cx, cy); x0, y0 = cx * CW, cy * CH
        loc = lambda o: {**o, "x": o["x"] - x0, "y": o["y"] - y0}
        out[k] = {"name": "The Western Crags: " + NAMES[cy][cx], "outside": True, "wild_zone": True, "lru": True, "crags": True, "terrain": "rock", "pines": True,
                  "snowY0": y0, "ox": x0, "oy": y0, "rows": [r[x0:x0 + CW] for r in rows[y0:y0 + CH]],
                  "props": [loc(p) for p in props if owner(p["x"], p["y"]) == k],
                  "signs": {f"{x - x0},{y - y0}": v for (x, y), v in signs.items() if owner(x, y) == k},
                  "pillars": [{**p, "tx": p["tx"] - x0, "ty": p["ty"] - y0} for p in pillars if owner(p["tx"], p["ty"]) == k],
                  "wild": [loc(g) for g in wild if owner(g["x"], g["y"]) == k],
                  "camps": [loc(c) for c in camps if owner(c["x"], c["y"]) == k],
                  "triggers": [loc(t) for t in triggers if owner(t["x"], t["y"]) == k],
                  "doorKinds": {f"{x - x0},{y - y0}": v for (x, y), v in doors.items() if owner(x, y) == k},
                  "bldKinds": {f"{int(a) - x0},{int(b) - y0}": v for a, b, v in ((*key.split(","), v) for key, v in kinds.items()) if owner(int(a), int(b)) == k},
                  "warps": []}
def walk(x, y): return 0 <= x < W and 0 <= y < H and rows[y][x] not in SOLID
for k, d in out.items():
    x0, y0 = d["ox"], d["oy"]; x1, y1 = x0 + CW, y0 + CH
    for y in range(y0, y1):
        for (x, nx) in ((x0, x0 - 2), (x1 - 1, x1 + 1)):
            o = owner(nx, y)
            if o and o != k and walk(x, y) and walk(nx, y):
                d["warps"].append({"x": x - x0, "y": y - y0, "to": o, "tx": nx - out[o]["ox"], "ty": y - out[o]["oy"], "dir": "left" if nx < x else "right"})
    for x in range(x0, x1):
        for (y, ny) in ((y0, y0 - 2), (y1 - 1, y1 + 1)):
            o = owner(x, ny)
            if o and o != k and walk(x, y) and walk(x, ny):
                d["warps"].append({"x": x - x0, "y": y - y0, "to": o, "tx": x - out[o]["ox"], "ty": ny - out[o]["oy"], "dir": "up" if ny < y else "down"})
def gw(x, y, to, tx, ty, dr, **kw):
    o = owner(x, y); d = out[o]; d["warps"].append({"x": x - d["ox"], "y": y - d["oy"], "to": to, "tx": tx, "ty": ty, "dir": dr, **kw})
for x in (171, 172): gw(x, 108, "cr_tunnel", 6, 12, "up")
for x in (52, 53): gw(x, 110, "cr_mine1", 5 if x == 52 else 6, 26, "up", lock={"need": "cr_mine_in", "say": "Two Company guards stand across the mine mouth with cudgels. \"Workers and the overseer's people only.\""})
for x in (34, 35): gw(x, 13, "cr_shrine", 19 if x == 34 else 20, 25, "up")


# ---------------- the maps of their own
def cave(w, h, carve_fn):
    g = [["C"] * w for _ in range(h)]
    def rr(x0, y0, x1, y1, c="."):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                if 0 <= x < w and 0 <= y < h: g[y][x] = c
    carve_fn(rr, g)
    return g


def finish(g, start, must):
    rows_ = ["".join(r) for r in g]
    ok = reach(rows_, start, set())
    miss = [m for m in must if m not in ok]
    assert not miss, miss
    return rows_


def tunnel(rr, g):
    rr(4, 10, 8, 12); rr(4, 6, 12, 10); rr(10, 4, 30, 8); rr(26, 6, 44, 10); rr(40, 8, 48, 12); rr(46, 11, 48, 13); rr(5, 12, 7, 13)
    for x in range(14, 40, 5): g[9 if x % 2 else 4][x] = ","
tg = cave(54, 14, tunnel)
tun = {"name": "The Pass Tunnel", "outside": True, "cave": True, "dark": True, "terrain": "cave", "act3": True, "rows": finish(tg, (6, 12), [(47, 12)]),
       "props": [{"p": "lantern", "x": 12, "y": 5}, {"p": "lantern", "x": 40, "y": 9}, {"p": "crate", "x": 28, "y": 7, "lk": "masonstone"}, {"p": "rubble", "x": 33, "y": 8}, {"p": "tools", "x": 44, "y": 9, "lk": "masontools"}],
       "warps": [{"x": 5, "y": 13, "to": "cr11", "tx": 171 - 90, "ty": 109 - 80, "dir": "down"}, {"x": 6, "y": 13, "to": "cr11", "tx": 172 - 90, "ty": 109 - 80, "dir": "down"},
                 {"x": 47, "y": 13, "to": "eth01", "tx": 35, "ty": 142 - 80, "dir": "down"}, {"x": 48, "y": 13, "to": "eth01", "tx": 36, "ty": 142 - 80, "dir": "down"}],
       "wild": []}


def mine1(rr, g):
    rr(3, 22, 9, 27); rr(5, 16, 9, 22); rr(5, 14, 24, 18); rr(20, 6, 26, 18); rr(20, 4, 40, 8); rr(36, 4, 42, 22); rr(28, 18, 46, 22); rr(42, 20, 46, 28)
    rr(12, 20, 18, 26); rr(9, 22, 12, 24)                  # a side gallery
    rr(4, 27, 7, 29); rr(43, 28, 45, 29)
m1 = cave(50, 30, mine1)
mine_1 = {"name": "Grimscar Mine: the Upper Galleries", "outside": True, "cave": True, "dark": True, "terrain": "cave", "act3": True, "rows": finish(m1, (5, 27), [(44, 28), (15, 23)]),
          "props": [{"p": "lantern", "x": 8, "y": 15}, {"p": "lantern", "x": 30, "y": 5}, {"p": "lantern", "x": 40, "y": 20}, {"p": "wagon", "x": 22, "y": 10, "lk": "orecart"}, {"p": "tools", "x": 6, "y": 17, "lk": "picks"},
                    {"p": "chest", "x": 14, "y": 21, "id": "c_cr_mine1"}, {"p": "bones", "x": 38, "y": 12}, {"p": "crate", "x": 33, "y": 19, "lk": "orecrate"}],
          "warps": [{"x": 4, "y": 29, "to": "cr01", "tx": 52, "ty": 111 - 80, "dir": "down"}, {"x": 5, "y": 29, "to": "cr01", "tx": 52, "ty": 111 - 80, "dir": "down"}, {"x": 6, "y": 29, "to": "cr01", "tx": 53, "ty": 111 - 80, "dir": "down"},
                    {"x": 43, "y": 29, "to": "cr_mine2", "tx": 5, "ty": 26, "dir": "down"}, {"x": 44, "y": 29, "to": "cr_mine2", "tx": 5, "ty": 26, "dir": "down"}, {"x": 45, "y": 29, "to": "cr_mine2", "tx": 6, "ty": 26, "dir": "down"}],
          "wild": [{"x": 22, "y": 16, "group": ["bat", "bat", "cavehound"]}, {"x": 38, "y": 8, "group": ["skelmin", "skelmin"]}, {"x": 40, "y": 21, "group": ["cavehound", "cavehound"]}]}


def mine2(rr, g):
    rr(3, 22, 9, 27); rr(6, 10, 10, 22); rr(6, 6, 30, 10); rr(16, 10, 20, 20); rr(16, 18, 34, 22); rr(30, 6, 34, 22); rr(30, 4, 46, 8); rr(42, 8, 46, 28)
    rr(22, 12, 28, 16, "~")                                  # a flooded working
    rr(4, 27, 7, 29); rr(43, 28, 45, 29)
m2 = cave(50, 30, mine2)
mine_2 = {"name": "Grimscar Mine: the Deep Seam", "outside": True, "cave": True, "dark": True, "terrain": "cave", "act3": True, "rows": finish(m2, (5, 27), [(44, 28)]),
          "props": [{"p": "lantern", "x": 8, "y": 9}, {"p": "lantern", "x": 32, "y": 20}, {"p": "lantern", "x": 44, "y": 10}, {"p": "bones", "x": 18, "y": 19}, {"p": "chest", "x": 33, "y": 5, "id": "c_cr_mine2"},
                    {"p": "wagon", "x": 10, "y": 7, "lk": "orecart"}, {"p": "rack", "x": 44, "y": 24, "lk": "chainrack"}],
          "warps": [{"x": 4, "y": 29, "to": "cr_mine1", "tx": 44, "ty": 27, "dir": "down"}, {"x": 5, "y": 29, "to": "cr_mine1", "tx": 44, "ty": 27, "dir": "down"}, {"x": 6, "y": 29, "to": "cr_mine1", "tx": 44, "ty": 27, "dir": "down"},
                    {"x": 43, "y": 29, "to": "cr_mine3", "tx": 4, "ty": 16, "dir": "down"}, {"x": 44, "y": 29, "to": "cr_mine3", "tx": 4, "ty": 16, "dir": "down"}, {"x": 45, "y": 29, "to": "cr_mine3", "tx": 5, "ty": 16, "dir": "down"}],
          "wild": [{"x": 8, "y": 14, "group": ["skelmin", "skelmin", "skelA"]}, {"x": 26, "y": 20, "group": ["bat", "spider", "spider"]}, {"x": 38, "y": 6, "group": ["minguard", "minguard"]}, {"x": 44, "y": 18, "group": ["skelmin", "skelW"]}]}


def mine3(rr, g):
    rr(3, 14, 7, 17); rr(3, 10, 10, 14); rr(8, 4, 30, 14)     # the overseer's last stand: the end of the seam
    rr(3, 17, 6, 19)
m3 = cave(34, 20, mine3)
mine_3 = {"name": "Grimscar Mine: the Seam's End", "outside": True, "cave": True, "dark": True, "terrain": "cave", "act3": True, "rows": finish(m3, (4, 16), [(26, 6)]),
          "props": [{"p": "lantern", "x": 12, "y": 5}, {"p": "lantern", "x": 26, "y": 5}, {"p": "desk", "x": 25, "y": 6, "lk": "overledger"}, {"p": "chest", "x": 28, "y": 6, "id": "c_cr_overseer"}, {"p": "crate", "x": 22, "y": 5}, {"p": "rack", "x": 9, "y": 5, "lk": "chainrack"}],
          "warps": [{"x": 3, "y": 19, "to": "cr_mine2", "tx": 44, "ty": 27, "dir": "down"}, {"x": 4, "y": 19, "to": "cr_mine2", "tx": 44, "ty": 27, "dir": "down"}, {"x": 5, "y": 19, "to": "cr_mine2", "tx": 44, "ty": 27, "dir": "down"}],
          "triggers": [{"id": "overseer", "x": 16, "y": 9, "r": 4}], "wild": []}


def shrine(rr, g):
    rr(17, 22, 22, 25); rr(18, 14, 21, 22); rr(10, 8, 30, 14); rr(16, 3, 24, 8)
    rr(18, 25, 21, 27)
    for x in (12, 28):
        for y in (9, 12): g[y][x] = "C"                      # pillars of the living rock
sg = cave(40, 28, shrine)
shrine_ = {"name": "The Shrine of the First Word", "outside": True, "cave": True, "dark": True, "terrain": "cave", "act3": True, "rows": finish(sg, (19, 25), [(20, 5)]),
           "props": [{"p": "candles", "x": 17, "y": 13, "lk": "pilgrimcandles"}, {"p": "candles", "x": 22, "y": 13, "lk": "pilgrimcandles"}, {"p": "block", "x": 20, "y": 4, "lk": "sealplinth"},
                     {"p": "bones", "x": 25, "y": 11}, {"p": "lantern", "x": 14, "y": 9}, {"p": "lantern", "x": 26, "y": 9}, {"p": "rubble", "x": 11, "y": 13, "lk": "vexmark"}],
           "warps": [{"x": 18, "y": 27, "to": "cr00", "tx": 34, "ty": 14, "dir": "down"}, {"x": 19, "y": 27, "to": "cr00", "tx": 34, "ty": 14, "dir": "down"}, {"x": 20, "y": 27, "to": "cr00", "tx": 35, "ty": 14, "dir": "down"}, {"x": 21, "y": 27, "to": "cr00", "tx": 35, "ty": 14, "dir": "down"}],
           "triggers": [{"id": "warden", "x": 20, "y": 9, "r": 4}], "wild": []}

src = ["/* The Western Crags (Act 3), generated by concept/crags.py: four joined 90 x 80 sections, the tunnel, the mine and the shrine.",
       "   Edit the generator, not this file. */"]
for k, d in out.items(): src.append(f"MAP_DEFS.{k} = {json.dumps(d, separators=(',', ':'))};")
for k, d in [("cr_tunnel", tun), ("cr_mine1", mine_1), ("cr_mine2", mine_2), ("cr_mine3", mine_3), ("cr_shrine", shrine_)]:
    src.append(f"MAP_DEFS.{k} = {json.dumps(d, separators=(',', ':'))};")
open(OUT, "w").write("\n".join(src) + "\n")
print("bytes", sum(len(s) for s in src)); print("doors", {f"{x},{y}": k for (x, y), k in doors.items()})
for k, d in out.items(): print(k, d["name"], "props", len(d["props"]), "wild", len(d["wild"]), "warps", len(d["warps"]), "pillars", [p["id"] for p in d["pillars"]])

from PIL import Image, ImageDraw
col = {".": (84, 88, 76), ",": (78, 82, 70), "*": (92, 96, 82), "=": (156, 136, 100), "~": (60, 90, 120), "B": (130, 96, 60), "T": (34, 56, 38), "r": (120, 118, 116),
       "S": (230, 210, 150), "#": (160, 156, 164), "C": (66, 62, 64), "O": (10, 8, 8), "R": (150, 80, 60), "W": (110, 90, 70), "w": (200, 180, 90), "D": (60, 30, 20), "f": (120, 90, 50), "q": (90, 60, 40), "P": (120, 230, 220)}
im = Image.new("RGB", (W, H))
for y in range(H):
    for x in range(W):
        c = col.get(rows[y][x], (255, 0, 255))
        if y < 24 and rows[y][x] in ".,*": c = (200, 204, 210)
        elif y < 46 and rows[y][x] in ".,*" and (x * 7 + y * 3) % 5 < 3: c = (170, 174, 180)
        im.putpixel((x, y), c)
for g_ in wild: im.putpixel((g_["x"], g_["y"]), (230, 40, 40))
im = im.resize((W * 5, H * 5), Image.NEAREST); dr = ImageDraw.Draw(im)
dr.line([(CW * 5, 0), (CW * 5, H * 5)], fill=(255, 255, 255)); dr.line([(0, CH * 5), (W * 5, CH * 5)], fill=(255, 255, 255))
im.save(SCR + "crags_overview.png")
