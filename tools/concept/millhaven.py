"""Generates Millhaven (Act 3) into src/parts/04z3_millhaven.js: the village inside its walls (map mh).

Millhaven is 56 x 68 like Ashford and Greywick: the mill-and-market village where the southern roads meet. Layout
follows the approved concept (concept/millhaven_concept.png): the north gate from the bridge; the Wheel and Sheaf,
the Covenant tithe-house and the traders' hall with its caravan yard; the market square with its stalls and the rumour
board; the bakery; the great mill on the mill-race that runs down the east side, the millpond, the granary; the
tinker's shed, where the Unbound keep a back room; homes and the spotting orchard in the south; the south gate, shut."""
import json, random
from collections import deque

W, H = 56, 68
SOLID = set("T~RWwfSPbr#ZXUYLKCgFHkDq")
OUT = "/home/claude/durinn/src/parts/04z3_millhaven.js"
rnd = random.Random(3141)
g = [["." if rnd.random() < 0.6 else ("," if rnd.random() < 0.8 else "*") for _ in range(W)] for _ in range(H)]


def put(x, y, c):
    if 0 <= x < W and 0 <= y < H: g[y][x] = c


def rect(x0, y0, x1, y1, c):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1): put(x, y, c)


for y in range(H):
    for x in range(W):
        if min(x, y, W - 1 - x, H - 1 - y) < 2: g[y][x] = "T"
rect(2, 2, W - 3, 2, "#"); rect(2, H - 3, W - 3, H - 3, "#"); rect(2, 2, 2, H - 3, "#"); rect(W - 3, 2, W - 3, H - 3, "#")
put(27, 2, "G"); put(28, 2, "G"); rect(27, 0, 28, 1, "=")
put(27, H - 3, "g"); put(28, H - 3, "g")                                   # the south gate, toward the Aurelm road: shut
# the mill-race down the east side, pooling in the millpond before the wheel
for y in range(3, H - 3):
    for x in range(46, 49): put(x, y, "~")
for y in range(43, 56):
    for x in range(39, 54):
        if x <= W - 4 and ((x - 46.5) / 7) ** 2 + ((y - 49) / 5.5) ** 2 <= 1: put(x, y, "~")
# streets and the market green
rect(27, 3, 28, 63, "=")
rect(4, 33, 44, 34, "=")
rect(4, 49, 37, 50, "=")
rect(29, 14, 44, 15, "=")
for y in range(20, 39):
    for x in range(14, 42):
        if ((x - 27.5) / 13) ** 2 + ((y - 29.5) / 8.5) ** 2 <= 1: put(x, y, "=")

doors = {}


def house(x0, x1, y0, y1, door, kind):
    rect(x0, y0, x1, y1 - 1, "R")
    for x in range(x0, x1 + 1): put(x, y1, "W")
    for wx in [x for x in range(x0 + 1, x1) if (x - x0) % 3 == 1 and abs(x - door) > 1]: put(wx, y1, "w")
    put(door, y1, "D"); doors[(door, y1)] = kind
    if g[y1 + 1][door] in "Tbr#f~": put(door, y1 + 1, ".")


def walk(x, y0, y1):
    for y in range(y0, y1 + 1):
        if g[y][x] in ".,*": put(x, y, "=")


house(5, 14, 7, 13, 9, "inn")            # the Wheel and Sheaf
house(16, 23, 7, 12, 19, "outpost")      # the tithe-house
house(31, 42, 6, 12, 36, "store")        # the traders' hall
house(6, 12, 23, 28, 9, "cottage")       # the bakery
house(37, 44, 31, 39, 41, "mill")        # the great mill
house(30, 36, 41, 46, 33, "stable")      # the granary
house(6, 13, 38, 44, 9, "carter")        # the tinker's shed
house(16, 22, 40, 45, 19, "cottage")
for (x0, y0) in [(6, 52), (14, 52), (22, 52), (31, 54)]:
    house(x0, x0 + 6, y0, y0 + 5, x0 + 3, "cottage")
walk(9, 14, 32); walk(19, 13, 19); walk(36, 13, 13); walk(9, 29, 32); walk(41, 40, 48); walk(33, 47, 48); walk(9, 45, 48); walk(19, 46, 48)
for (x0, y0) in [(6, 52), (14, 52), (22, 52)]: pass
walk(34, 60, 63)
# the orchard, south of the homes
for y in (59, 61, 63):
    for x in range(7, 26, 3):
        if g[y][x] in ".,*": put(x, y, "T")
for (x, y) in [(4, 18), (24, 17), (43, 22), (4, 46), (51, 30), (51, 60), (38, 59)]:
    if g[y][x] in ".,*": put(x, y, "b")

signs = {}


def sign(x, y, *lines):
    put(x, y, "S"); signs[f"{x},{y}"] = list(lines)


sign(25, 5, "Millhaven.", "Market every day but the Archon's. Tithes at the tithe-house. Keep your purse close.")
sign(13, 14, "The Wheel and Sheaf. Beds, ale, news.")
sign(43, 13, "Caravan yard. Wagons to Verrin, Stonebridge and Aurelm. Rotmoor: no wagons.")
sign(14, 45, "Wick's. Pots, pans, locks, lamps, anything. Knock twice.")
sign(29, 63, "South gate: closed. The Aurelm road is walked from the west lane, round the walls.")

props = []


def prop(p, x, y, **kw): props.append({"p": p, "x": x, "y": y, **kw})


prop("board", 22, 25, lk="rumours")
for (x, y, v) in [(17, 28, 0), (21, 28, 1), (33, 28, 0), (37, 28, 1)]: prop("stall", x, y, v=v)
prop("wagon", 32, 17, lk="caravan"); prop("wagon", 38, 17, v=1, lk="caravan"); prop("crate", 36, 19); prop("barrel", 42, 18); prop("sack", 30, 19)
prop("wheel", 46, 34)
for (x, y) in [(35, 47), (37, 47)]: prop("sack", x, y, lk="flour")
prop("barrel", 4, 13); prop("bench", 10, 15)
prop("baskets", 13, 29, lk="bread")
prop("crate", 5, 45, lk="tinkerjunk"); prop("barrel", 13, 46)
for (x, y) in [(24, 4), (31, 4), (14, 24), (40, 24), (26, 40), (29, 40), (10, 34)]: prop("lamp", x, y)
prop("banner", 18, 13); prop("banner", 21, 13)
for k, (x, y) in enumerate([(9, 60), (21, 62), (40, 60)]): prop("herbpatch", x, y, id=f"mh_{k}")
rows = ["".join(r) for r in g]


def reach(start):
    blocked = set()
    for p in props:
        if p["p"] == "herbpatch": continue
        for i in range({"wagon": 2, "stall": 2, "board": 2, "bench": 2, "baskets": 2, "wheel": 2}.get(p["p"], 1)): blocked.add((p["x"] + i, p["y"]))
    seen = {start}; q = deque([start])
    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < W and 0 <= ny < H and (nx, ny) not in seen and rows[ny][nx] not in SOLID and (nx, ny) not in blocked:
                seen.add((nx, ny)); q.append((nx, ny))
    return seen


ok = reach((27, 4))
bad = [(k, v) for k, v in doors.items() if (k[0], k[1] + 1) not in ok]
assert not bad, bad
for name, xy in {"board": (22, 27), "yard": (35, 18), "orchard": (14, 60), "tinker": (10, 46)}.items():
    assert xy in ok, (name, xy)

warps = [{"x": 27, "y": 0, "to": "eth11", "tx": 60, "ty": 58, "dir": "up"}, {"x": 28, "y": 0, "to": "eth11", "tx": 60, "ty": 58, "dir": "up"}]
d = {"name": "Millhaven", "outside": True, "town": True, "south": True, "pave": "ash", "act3": True,
     "rows": rows, "props": props, "signs": signs, "warps": warps,
     "doorKinds": {f"{x},{y}": k for (x, y), k in doors.items()}, "towns": [[0, 0, W - 1, H - 1, "mh_in"]]}
src = "/* Millhaven (Act 3), generated by concept/millhaven.py. Edit the generator, not this file. */\nMAP_DEFS.mh = " + json.dumps(d, separators=(",", ":")) + ";\n"
open(OUT, "w").write(src)
print("\n".join(rows)); print("doors", {f"{x},{y}": k for (x, y), k in doors.items()})
