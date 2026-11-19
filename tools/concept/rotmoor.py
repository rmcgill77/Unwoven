"""Generates Rotmoor (Act 3) into src/parts/04v_rotmoor.js: the village inside its walls (rot) and the cellar under the
cooper's burned house (rot_cellar).

Rotmoor is 56 x 68 like Ashford and Greywick, the village nearest the curse, dying of a sickness that came with it.
Layout follows the approved concept (concept/rotmoor_concept.png): the north gate, barred from inside with carts; the
well quarter west of the high street (the reeve, the herbalist, the half-shut inn, the full graveyard); a quarantine
line of stakes down the middle, Covenant guards posted all along it and one guarded crossing on the cross street; the
sick quarter east of it (the chapel made a sick-house, houses sealed with red crosses, the burning ground, the breach
in the east wall where the curse has come in). Under the cooper's burned house, a cellar where the sickness started.
The curse strength is stored per tile like the overworld, strongest in the east."""
import json, random
from collections import deque

W, H = 56, 68
SOLID = set("T~RWwfSPbr#ZXUYLKCgFHkDq")
OUT = "/home/claude/durinn/src/parts/04v_rotmoor.js"
rnd = random.Random(4411)
g = [["." if rnd.random() < 0.6 else ("," if rnd.random() < 0.8 else "*") for _ in range(W)] for _ in range(H)]


def put(x, y, c):
    if 0 <= x < W and 0 <= y < H: g[y][x] = c


def rect(x0, y0, x1, y1, c):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1): put(x, y, c)


def curse(x, y): return max(0.0, min(1.0, (x - 24) / 26 + (y - 28) / 80 + (rnd.random() - 0.5) * 0.08))


# the woods outside, the wall, the north gate
for y in range(H):
    for x in range(W):
        if min(x, y, W - 1 - x, H - 1 - y) < 2: g[y][x] = "T"
rect(2, 2, W - 3, 2, "#"); rect(2, H - 3, W - 3, H - 3, "#"); rect(2, 2, 2, H - 3, "#"); rect(W - 3, 2, W - 3, H - 3, "#")
put(27, 2, "G"); put(28, 2, "G"); rect(27, 0, 28, 1, "=")
# the breach: the east wall has fallen where the curse came in
for y in range(38, 51): put(W - 3, y, "." if y % 4 else "r")

# streets
rect(27, 3, 28, 63, "=")                      # the high street
rect(3, 28, 52, 29, "=")                      # the cross street, through the one crossing
rect(3, 46, 36, 47, "=")                      # the lower lane, to the graveyard and the inn yard
for y in range(23, 34):
    for x in range(20, 36):
        if (x - 27.5) ** 2 / 36 + (y - 28.5) ** 2 / 20 <= 1: put(x, y, "=")

doors, plague = {}, []


def house(x0, x1, y0, y1, door, kind, sealed=False):
    rect(x0, y0, x1, y1 - 1, "R")
    for x in range(x0, x1 + 1): put(x, y1, "W")
    for wx in [x for x in range(x0 + 1, x1) if (x - x0) % 3 == 1 and abs(x - door) > 1]: put(wx, y1, "w")
    put(door, y1, "D"); doors[(door, y1)] = kind
    if sealed: plague.append(f"{door},{y1}")
    if g[y1 + 1][door] in "Tbr#f": put(door, y1 + 1, ".")


def shell(x0, x1, y0, y1):
    """a burned house: the stone footings standing, the rest fallen in"""
    for x in range(x0, x1 + 1):
        for y in (y0, y1):
            if rnd.random() < 0.75: put(x, y, "#")
    for y in range(y0, y1 + 1):
        for x in (x0, x1):
            if rnd.random() < 0.75: put(x, y, "#")
    for y in range(y0 + 1, y1):
        for x in range(x0 + 1, x1):
            put(x, y, "r" if rnd.random() < 0.18 else ",")


# the well quarter (west)
house(6, 12, 8, 13, 9, "cottage")                      # the reeve's house
house(15, 21, 8, 13, 18, "cottage", sealed=True)       # the sickness has reached the west too
house(6, 12, 17, 22, 9, "apoth")                       # the herbalist
house(15, 21, 18, 22, 18, "shack")
house(5, 13, 33, 38, 9, "tavern")                      # the Hollow Lantern
house(16, 22, 33, 37, 19, "cottage")
house(29, 34, 38, 42, 31, "cottage", sealed=True)
house(6, 11, 51, 55, 8, "shack")
shell(30, 35, 7, 12)
# the graveyard, south-west: full, and fresh mounds past the old rows
graveyard = {"x0": 14, "y0": 50, "x1": 34, "y1": 61}
for y in (51, 53, 55, 57, 59):
    for x in range(15, 34, 2):
        if g[y][x] in ".,*" and rnd.random() < 0.92: put(x, y, "r")
# the quarantine line: stakes and rope from the north wall to the south, one crossing on the cross street
for y in range(3, H - 3):
    if y not in (28, 29): put(37, y, "q")
# the sick quarter (east)
house(40, 48, 6, 12, 44, "chapel")                     # the chapel, now the sick-house
house(40, 45, 18, 22, 42, "cottage", sealed=True)
house(47, 51, 18, 22, 49, "shack", sealed=True)
house(40, 45, 32, 36, 42, "cottage", sealed=True)
shell(47, 51, 31, 35)
shell(40, 46, 50, 56)                                  # the cooper's, burned: the cellar is under it
put(43, 56, "."); put(43, 57, ".")                    # where its door was
for (x, y) in [(51, 40), (52, 45), (50, 48), (52, 38), (49, 58), (51, 61), (46, 62)]:
    put(x, y, "k")                                     # the curse's growths, come in through the breach
# a few trees in the west, mostly cut for the pyres
for (x, y) in [(4, 15), (24, 16), (4, 44), (24, 60), (12, 62), (33, 17)]:
    if g[y][x] in ".,*": put(x, y, "T")

signs = {}


def sign(x, y, *lines):
    put(x, y, "S"); signs[f"{x},{y}"] = list(lines)


sign(25, 5, "Rotmoor.", "Below, in fresh paint: SICKNESS. KEEP TO THE WEST SIDE.")
sign(35, 27, "QUARANTINE.", "By order of the Reeve and of the Covenant: no crossing without a pass.")
sign(13, 23, "Herbs and simples. Prices are what they are.")
sign(14, 39, "The Hollow Lantern. Soup at noon, while it lasts.")

props = []


def prop(p, x, y, **kw): props.append({"p": p, "x": x, "y": y, **kw})


prop("wagon", 23, 5, lk="gatecart"); prop("wagon", 30, 5, lk="gatecart", v=1)     # the carts that bar the gate
prop("well", 23, 25, lk="fouledwell")
prop("wagon", 31, 31, lk="deadcart", v=2)
prop("cauldron", 12, 40, lk="soup"); prop("barrel", 5, 40); prop("sack", 6, 40)
for (x, y) in [(39, 14), (41, 14), (47, 14), (49, 14)]: prop("bed", x, y, lk="cot")   # cots outside the sick-house
prop("candles", 43, 14)
prop("firepit", 47, 43, lk="pyre_rot"); prop("bones", 45, 42); prop("bones", 49, 44); prop("bones", 48, 41); prop("timber", 44, 45)
prop("hatch", 43, 53, lk="cellar")
prop("timber", 32, 10); prop("rubble", 48, 33)
prop("lamp", 26, 7); prop("lamp", 29, 24); prop("lamp", 10, 30); prop("lamp", 34, 32)
prop("banner", 33, 27); prop("banner", 36, 25)                                    # the Covenant's flag over the crossing
prop("barrel", 30, 44); prop("crate", 14, 14)
camps = [{"x": 47, "y": 43, "r": 3}]

rows = ["".join(r) for r in g]


def reach(rows, start, blocked=()):
    seen = {start}; q = deque([start])
    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < len(rows[0]) and 0 <= ny < len(rows) and (nx, ny) not in seen and rows[ny][nx] not in SOLID and (nx, ny) not in blocked:
                seen.add((nx, ny)); q.append((nx, ny))
    return seen


blocked = set()
for p in props:
    if p["p"] in ("hatch", "candles", "bones"): continue
    fw, fh = {"wagon": (2, 1), "well": (2, 1), "bed": (1, 2), "rubble": (2, 1), "timber": (2, 1)}.get(p["p"], (1, 1))
    for i in range(fw):
        for j in range(fh): blocked.add((p["x"] + i, p["y"] + j))
# the line holds: from the gate, nothing east of it is reachable until the crossing opens
west = reach(rows, (27, 4), blocked | {(37, 28), (37, 29)})
assert not any(x > 37 for (x, y) in west), "the quarantine line leaks"
alln = reach(rows, (27, 4), blocked)
for (dx, dy), k in doors.items():
    assert (dx, dy + 1) in alln, ("door cut off", k, dx, dy)
for name, xy in {"hatch": (43, 54), "pyre": (47, 45), "cart": (31, 33), "well": (24, 27), "graveyard": (20, 50)}.items():
    assert xy in alln, (name, xy)

warps = [{"x": 27, "y": 0, "to": "eth32", "tx": 40, "ty": 13, "dir": "up"}, {"x": 28, "y": 0, "to": "eth32", "tx": 40, "ty": 13, "dir": "up"}]
SAY = "A guard steps across the gap and lowers his spear. \"Nobody crosses without the Reeve's pass. Nobody.\""
for y in (28, 29):
    warps.append({"x": 37, "y": y, "to": "rot", "tx": 39, "ty": y, "dir": "right", "lock": {"need": "rot_pass", "say": SAY}})
    warps.append({"x": 38, "y": y, "to": "rot", "tx": 35, "ty": y, "dir": "left", "lock": {"need": "rot_pass", "say": SAY}})
rot = {"name": "Rotmoor", "outside": True, "town": True, "south": True, "pave": "grey", "act3": True,
       "rows": rows, "curse": ["".join(str(min(9, int(round(curse(x, y) * 9)))) for x in range(W)) for y in range(H)],
       "props": props, "signs": signs, "warps": warps, "graveyard": graveyard, "camps": camps, "plague": plague,
       "doorKinds": {f"{x},{y}": k for (x, y), k in doors.items()}, "towns": [[0, 0, W - 1, H - 1, "rotmoor_in"]]}

# ---------------- the cellar: dug deep under the cooper's, older than the house; the sickness started down here
CW, CH = 40, 30
c = [["C"] * CW for _ in range(CH)]
def crect(x0, y0, x1, y1, ch="."):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1): c[y][x] = ch
crect(3, 2, 10, 8)            # the cooper's cellar: barrels, the ladder up
crect(6, 9, 7, 13)            # a passage broken through the back wall
crect(4, 14, 14, 19)          # an older room, stone-lined
crect(15, 16, 22, 17)         # the tunnel east
crect(23, 11, 30, 20)         # a crypt, opened
crect(26, 21, 27, 24)         # down again
crect(18, 24, 36, 27)         # the long hall, where it grows
crect(31, 20, 36, 23)         # its end: the heart of it
for (x, y) in [(5, 2), (6, 2)]: c[y][x] = "."
for (x, y) in [(28, 12), (24, 19), (20, 26), (34, 25), (36, 21), (31, 27), (23, 24)]: c[y][x] = "k"
crows = ["".join(r) for r in c]
cprops = [{"p": "lantern", "x": 7, "y": 2}, {"p": "barrel", "x": 3, "y": 3}, {"p": "barrel", "x": 3, "y": 4}, {"p": "barrel", "x": 10, "y": 3}, {"p": "crate", "x": 9, "y": 7},
          {"p": "bones", "x": 8, "y": 16}, {"p": "bones", "x": 12, "y": 18}, {"p": "candles", "x": 5, "y": 15}, {"p": "bones", "x": 25, "y": 13}, {"p": "bones", "x": 29, "y": 18},
          {"p": "bones", "x": 22, "y": 26}, {"p": "chest", "x": 34, "y": 21, "id": "c_rot_sample"}, {"p": "chest", "x": 13, "y": 15, "id": "c_rot_old"}]
cr = reach(crows, (5, 3), {(p["x"], p["y"]) for p in cprops if p["p"] in ("barrel", "crate", "chest")})
assert (34, 22) in cr and (13, 16) in cr, "cellar chests cut off"
cwild = [{"x": 9, "y": 17, "group": ["rslime", "rslime"]}, {"x": 26, "y": 15, "group": ["skelW", "skelS"]}, {"x": 26, "y": 25, "group": ["skelA", "rslime"]},
         {"x": 33, "y": 22, "group": ["skelW", "skelS", "rslime"]}]
cellar = {"name": "The Rotmoor Cellar", "outside": True, "cave": True, "dark": True, "terrain": "cave", "act3": True,
          "rows": crows, "curse": ["".join(str(min(9, max(0, int((x * 0.22 + y * 0.18) - 1)))) for x in range(CW)) for y in range(CH)],
          "props": cprops, "wild": cwild,
          "warps": [{"x": 5, "y": 2, "to": "rot", "tx": 43, "ty": 54, "dir": "up"}, {"x": 6, "y": 2, "to": "rot", "tx": 43, "ty": 54, "dir": "up"}]}

src = ("/* Rotmoor and the cellar under it (Act 3), generated by concept/rotmoor.py. Edit the generator, not this file. */\n"
       f"MAP_DEFS.rot = {json.dumps(rot, separators=(',', ':'))};\nMAP_DEFS.rot_cellar = {json.dumps(cellar, separators=(',', ':'))};\n")
open(OUT, "w").write(src)
print("\n".join(rows)); print(); print("\n".join(crows)); print("bytes", len(src), "doors", doors, "plague", plague)
