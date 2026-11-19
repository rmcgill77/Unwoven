"""Generates Stonebridge (Act 3) into src/parts/04x_stonebridge.js: the village inside its walls (map sb).

Stonebridge is 56 x 68 like Ashford and Greywick: a quiet Covenant farming village at the foot of the Western Crags,
the first town south of the barricade. Layout follows the approved concept (concept/stonebridge_concept.png): the
north gate from the plains road onto the green and its well; the bailiff's hall, the smithy, the store, the
Shepherd's Rest and the chapel around it; the millstream across the village under the Weaver-age stone bridge it is
named for, the mill on its bank; homes, fields and the sheep fold to the south; the old lookout tower in the
north-east; a west gate toward the Crags path, kept shut. The Crags rise straight behind the west wall."""
import json, random
from collections import deque

W, H = 56, 68
SOLID = set("T~RWwfSPbr#ZXUYLKCgFHkDq")
OUT = "/home/claude/durinn/src/parts/04x_stonebridge.js"
rnd = random.Random(2207)
g = [["." if rnd.random() < 0.6 else ("," if rnd.random() < 0.8 else "*") for _ in range(W)] for _ in range(H)]


def put(x, y, c):
    if 0 <= x < W and 0 <= y < H: g[y][x] = c


def rect(x0, y0, x1, y1, c):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1): put(x, y, c)


# woods outside; the Crags straight behind the west wall; the wall; the gates
for y in range(H):
    for x in range(W):
        if min(x, y, W - 1 - x, H - 1 - y) < 2: g[y][x] = "T"
for y in range(2, H - 2): put(0, y, "C"); put(1, y, "C")
rect(2, 2, W - 3, 2, "#"); rect(2, H - 3, W - 3, H - 3, "#"); rect(2, 2, 2, H - 3, "#"); rect(W - 3, 2, W - 3, H - 3, "#")
put(27, 2, "G"); put(28, 2, "G"); rect(27, 0, 28, 1, "=")
put(2, 30, "g"); put(2, 31, "g")                                        # the west gate, toward the Crags path: shut

# the millstream, west to east, under the wall at both ends
for x in range(3, W - 3):
    y0 = 36 + (1 if 18 < x < 40 else 0)
    for y in range(y0, y0 + 3): put(x, y, "~")
# streets, and the green
rect(27, 3, 28, 63, "=")
rect(6, 20, 50, 21, "=")
rect(3, 30, 26, 31, "=")
rect(29, 50, 50, 51, "=")
rect(8, 50, 26, 51, "=")
for y in range(13, 28):
    for x in range(18, 38):
        if (x - 27.5) ** 2 / 64 + (y - 20.5) ** 2 / 30 <= 1: put(x, y, "=")
for y in range(37, 40):
    for x in (27, 28): put(x, y, "B")                                  # the stone bridge

doors = {}


def house(x0, x1, y0, y1, door, kind):
    rect(x0, y0, x1, y1 - 1, "R")
    for x in range(x0, x1 + 1): put(x, y1, "W")
    for wx in [x for x in range(x0 + 1, x1) if (x - x0) % 3 == 1 and abs(x - door) > 1]: put(wx, y1, "w")
    put(door, y1, "D"); doors[(door, y1)] = kind
    if g[y1 + 1][door] in "Tbr#f~": put(door, y1 + 1, ".")


house(31, 40, 7, 12, 35, "hall")          # 1 the bailiff's hall
house(42, 48, 7, 12, 45, "cottage")
house(8, 15, 8, 13, 11, "smithy")         # 2 the smithy
house(18, 24, 8, 12, 21, "store")         # 6 the store
house(8, 15, 23, 28, 11, "tavern")        # 5 the Shepherd's Rest
house(40, 47, 23, 28, 43, "chapel")       # 7 the chapel
house(6, 13, 41, 46, 9, "cooper")         # 3 the mill, on the stream's south bank
house(33, 39, 42, 47, 36, "cottage")
house(42, 48, 42, 47, 45, "cottage")
house(16, 22, 43, 47, 19, "cottage")
house(49, 52, 13, 17, 50, "watch")        # 9 the old lookout tower
for (x, y) in [(49, 18), (50, 18), (51, 18), (50, 19)]: put(x, y, ".")
# fields and the sheep fold
for y in range(54, 62):
    for x in range(8, 25): put(x, y, "c")
for x in range(33, 49):
    put(x, 53, "f" if x not in (40, 41) else "."); put(x, 62, "f")
for y in range(53, 63): put(33, y, "f"); put(48, y, "f")
# a few trees and bushes about the green and the lanes
for (x, y) in [(5, 16), (47, 16), (24, 33), (31, 33), (5, 48), (51, 40), (30, 57), (51, 57)]:
    if g[y][x] in ".,*": put(x, y, "T")
for (x, y) in [(16, 30), (36, 30), (25, 46), (31, 46), (50, 33)]:
    if g[y][x] in ".,*": put(x, y, "b")

signs = {}


def sign(x, y, *lines):
    put(x, y, "S"); signs[f"{x},{y}"] = list(lines)


sign(25, 5, "Stonebridge.", "A village of the Archon Covenant. Travellers report to the bailiff.")
sign(26, 34, "The Stone Bridge. Laid in the Weaver years. Mind the third step.")
sign(13, 29, "The Shepherd's Rest. Beds, stew, no trouble.")
sign(4, 33, "West gate: closed. The Crags path is closed by order of the Covenant.")
sign(37, 13, "The bailiff's hall. Writs, tithes and complaints.")

props = []


def prop(p, x, y, **kw): props.append({"p": p, "x": x, "y": y, **kw})


prop("well", 26, 17, lk="sbwell")
prop("wheel", 12, 38)                                                    # the mill's wheel, turning in the stream
prop("banner", 25, 4); prop("banner", 30, 4); prop("banner", 33, 13); prop("banner", 38, 29)
prop("board", 44, 30, lk="sbboard")
for (x, y) in [(24, 4), (31, 4), (19, 19), (36, 22), (26, 41), (29, 41), (10, 32)]: prop("lamp", x, y)
prop("anvil", 16, 14); prop("barrel", 7, 14); prop("crate", 23, 13); prop("sack", 25, 13)
prop("barrel", 7, 29); prop("bench", 16, 29)
prop("sack", 14, 47, lk="flour"); prop("sack", 15, 47, lk="flour"); prop("crate", 5, 47)
for (x, y) in [(36, 56), (40, 58), (44, 55), (38, 60), (45, 59)]: prop("goat", x, y, lk="sheep")
prop("baskets", 25, 55); prop("barrel", 9, 52)
for k, (x, y) in enumerate([(4, 20), (51, 50), (30, 24)]): prop("herbpatch", x, y, id=f"sb_{k}")
rows = ["".join(r) for r in g]


def reach(start):
    blocked = set()
    for p in props:
        if p["p"] in ("herbpatch",): continue
        fw = {"well": 2, "board": 2, "bench": 2, "baskets": 2}.get(p["p"], 1)
        for i in range(fw): blocked.add((p["x"] + i, p["y"]))
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
for name, xy in {"bridge": (27, 41), "fold": (40, 55), "tower": (50, 18), "westgate": (3, 30), "fields": (16, 52)}.items():
    assert xy in ok, (name, xy)

warps = [{"x": 27, "y": 0, "to": "eth01", "tx": 66, "ty": 12, "dir": "up"}, {"x": 28, "y": 0, "to": "eth01", "tx": 66, "ty": 12, "dir": "up"}]
d = {"name": "Stonebridge", "outside": True, "town": True, "south": True, "pave": "ash", "act3": True, "stoneBridge": True,
     "rows": rows, "props": props, "signs": signs, "warps": warps,
     "doorKinds": {f"{x},{y}": k for (x, y), k in doors.items()}, "towns": [[0, 0, W - 1, H - 1, "sb_in"]]}
src = "/* Stonebridge (Act 3), generated by concept/stonebridge.py. Edit the generator, not this file. */\nMAP_DEFS.sb = " + json.dumps(d, separators=(",", ":")) + ";\n"
open(OUT, "w").write(src)
print("\n".join(rows)); print("doors", doors)
