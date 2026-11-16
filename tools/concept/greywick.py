"""Generates Greywick (Act 2) into src/parts/04m_greywick.js.

Greywick is the Unbound-leaning Pillar town, 56 x 68 like Ashford, where the snow begins: run down, standoffish, cut off
from the Covenant. Layout follows the approved plan: the Lamp House (the Unbound outpost) in the north-west, the
graveyard and the fallen watchtower in the north-east, the boarded Covenant chapel in the west, the cheap inn in the
east, the flickering Pillar in the middle, the trader's stall and the half-working forge south of it, the hunters' huts
in the south-east, and shuttered homes in the south. The gate is in the south-east, where the plains spur arrives.
Streets are broken cobble (def.pave = "grey"); patchy snow lies everywhere (def.snowLevel)."""
import json, random
from collections import deque

W, H = 56, 68
SOLID = set("T~RWwfSPbr#ZXUYLKCg")
rnd = random.Random(7731)
g = [["." if rnd.random() < 0.6 else ("," if rnd.random() < 0.8 else "*") for _ in range(W)] for _ in range(H)]


def put(x, y, c):
    if 0 <= x < W and 0 <= y < H: g[y][x] = c


def rect(x0, y0, x1, y1, c):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1): put(x, y, c)


def line(pts, c, wdt=2):
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        n = max(abs(x1 - x0), abs(y1 - y0)) * 2 + 1
        for i in range(n + 1):
            t = i / n; x, y = round(x0 + (x1 - x0) * t), round(y0 + (y1 - y0) * t)
            for d in range(wdt):
                put(x + d, y, c); put(x, y + d, c)


# the woods outside, and a wall that has fallen in places (the gaps open only onto the trees)
for y in range(H):
    for x in range(W):
        if min(x, y, W - 1 - x, H - 1 - y) < 2: g[y][x] = "T"
for x in range(2, W - 2):
    for y in (2, H - 3):
        put(x, y, "#" if rnd.random() < 0.8 else "T")
for y in range(2, H - 2):
    for x in (2, W - 3):
        put(x, y, "#" if rnd.random() < 0.8 else "T")

# streets
line([(42, 66), (42, 58), (36, 50), (30, 40), (28, 32)], "=")      # from the gate up to the Pillar
line([(26, 28), (20, 20), (14, 12)], "=")                           # to the Lamp House
line([(29, 28), (35, 24), (39, 23)], "=")                           # to the inn
line([(27, 32), (22, 37), (21, 41)], "=")                           # to the forge
line([(36, 50), (24, 50), (10, 50)], "=", 1)                        # the lane past the homes
line([(42, 58), (44, 45)], "=", 1)                                  # to the hunters' huts
line([(14, 12), (40, 12)], "=", 1)                                  # along the north, to the graveyard
line([(13, 28), (8, 28)], "=", 1)                                   # to the chapel
for y in range(29, 33):
    for x in range(23, 33):
        if (x - 27.5) ** 2 / 25 + (y - 30.5) ** 2 / 6 <= 1: put(x, y, "=")
put(27, 30, "P"); put(28, 30, "P")
put(42, H - 3, "G"); put(43, H - 3, "G"); rect(42, H - 2, 43, H - 1, "=")

doors = {}


def house(x0, x1, y0, y1, door, kind, wins=None):
    rect(x0, y0, x1, y1 - 1, "R")
    for x in range(x0, x1 + 1): put(x, y1, "W")
    for wx in (wins or [x for x in range(x0 + 1, x1) if (x - x0) % 3 == 1 and abs(x - door) > 1]): put(wx, y1, "w")
    put(door, y1, "D"); doors[(door, y1)] = kind
    if g[y1 + 1][door] in "Tbr#": put(door, y1 + 1, ".")


house(6, 20, 6, 10, 13, "lamphouse")          # the Lamp House
house(4, 12, 23, 27, 8, "boarded")            # the boarded chapel
house(34, 45, 19, 23, 39, "inn")              # the inn
house(16, 26, 36, 40, 21, "smithy")           # the forge
house(36, 41, 40, 43, 38, "shack"); house(46, 51, 40, 43, 48, "shack")   # the hunters' huts
house(4, 10, 46, 49, 7, "shack"); house(13, 19, 46, 49, 16, "shack")
house(4, 10, 54, 57, 7, "shack"); house(13, 19, 54, 57, 15, "shack"); house(22, 29, 53, 56, 25, "shack"); house(32, 37, 55, 58, 34, "shack")
house(45, 48, 4, 7, 46, "watch")               # what is left of the watchtower
# the graveyard: headstones in rows, a broken fence round it
graveyard = {"x0": 33, "y0": 7, "x1": 42, "y1": 10}
for y in (7, 9):
    for x in range(33, 43, 2):
        if rnd.random() < 0.85: put(x, y, "r")
for x in range(32, 44):
    if rnd.random() < 0.7: put(x, 5, "f")
    if rnd.random() < 0.6 and x not in (37, 38): put(x, 11, "f")
for y in range(6, 11):
    if rnd.random() < 0.7: put(32, y, "f")
    if rnd.random() < 0.7: put(43, y, "f")
# rubble of the fallen tower, and the collapsed wall section by it
for (x, y) in [(44, 9), (46, 9), (49, 8), (50, 6), (47, 10)]: put(x, y, "r")
# trees and bushes, sparse: the town has cut most of them for fuel
for (x, y) in [(4, 15), (24, 14), (50, 16), (52, 30), (4, 38), (30, 46), (50, 56), (24, 60), (10, 62)]:
    if g[y][x] in ".,*": put(x, y, "T")
for (x, y) in [(22, 24), (31, 36), (46, 30), (10, 34), (33, 62), (48, 50), (16, 62)]:
    if g[y][x] in ".,*": put(x, y, "b")

signs = {}


def sign(x, y, *lines):
    put(x, y, "S"); signs[f"{x},{y}"] = list(lines)


sign(40, 63, "Greywick.", "Under the old name, painted fresh and small: a red thread, snapped.")
sign(16, 11, "The Lamp House. The lamp is lit. Come in if you mean it.")
sign(41, 24, "Beds. Forty. No questions, no Covenant.")
sign(23, 41, "Forge. Repairs. Iron scrap bought.")
sign(10, 28, "By order of the Archon Covenant: this chapel is closed.", "Under it, in chalk: 'So is your mind.'")

props = []


def prop(p, x, y, **kw): props.append({"p": p, "x": x, "y": y, **kw})


# the Unbound's yellow rags, hung discreetly; a few lamps, most of them dark
for (x, y) in [(22, 11), (11, 13), (31, 26), (23, 33), (37, 47)]:
    if g[y][x] in ".,*": prop("ubanner", x, y)
for (x, y) in [(25, 27), (31, 33), (40, 56), (19, 21)]:
    if g[y][x] in ".,*": prop("lamp", x, y)
prop("stall", 24, 43, v=1); prop("crate", 26, 43, v=1); prop("barrel", 27, 42)
prop("anvil", 27, 39); prop("barrel", 15, 39)
prop("rack", 44, 43, lk="hides"); prop("rack", 45, 44, lk="hides"); prop("firepit", 43, 46); prop("bones", 47, 46)
prop("well", 31, 45); prop("rubble", 3, 25, lk="chapelback"); prop("timber", 20, 59)
prop("rubble", 9, 18); prop("barrel", 33, 22); prop("sack", 46, 23); prop("crate", 21, 11)
for k, (x, y) in enumerate([(6, 62), (48, 62), (29, 16)]): prop("herbpatch", x, y, id=f"gw_{k}")

rows = ["".join(r) for r in g]


def reach(start):
    seen = {start}; q = deque([start])
    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < W and 0 <= ny < H and (nx, ny) not in seen and rows[ny][nx] not in SOLID:
                seen.add((nx, ny)); q.append((nx, ny))
    return seen


ok = reach((42, 64))
bad = [(k, v) for k, v in doors.items() if (k[0], k[1] + 1) not in ok]
assert not bad, bad
for name, xy in {"pillar": (27, 31), "graveyard": (37, 12), "chapelback": (3, 26), "hides": (44, 45), "stall": (25, 44)}.items():
    assert xy in ok, (name, xy)

warps = [{"x": 42, "y": H - 1, "to": "plainsNW", "tx": 96, "ty": 32, "dir": "down"}, {"x": 43, "y": H - 1, "to": "plainsNW", "tx": 97, "ty": 32, "dir": "down"}]
d = {"name": "Greywick", "outside": True, "town": True, "pave": "grey", "act2": True, "snowY0": 0, "snowLevel": 0.78,
     "rows": rows, "props": props, "signs": signs, "warps": warps, "graveyard": graveyard,
     "doorKinds": {f"{x},{y}": k for (x, y), k in doors.items()},
     "pillar": {"id": "gw", "x": 28 * 16, "y": 30 * 16 + 8, "r": 22}}
open("/home/claude/durinn/src/parts/04m_greywick.js", "w").write("/* Greywick, generated by concept/greywick.py */\nMAP_DEFS.gw = " + json.dumps(d, separators=(",", ":")) + ";\n")
print("\n".join(rows))
print("doors", doors)
