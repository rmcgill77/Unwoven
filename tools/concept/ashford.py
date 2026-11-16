"""Generates Ashford (Act 2) into src/parts/04g_ashford.js.

Ashford is a walled Pillar town of 56 x 68 tiles, leaning hard toward the Covenant: purple and gold flags on every street.
Layout follows the approved plan: the main gate in the north-west where the plains spur arrives, the Covenant outpost
facing Pillar Square from the north, the chapel west, the Purple Thistle east, the market row south of the square,
the cooper, then homes, a mill, a well and the fields in the south. Streets are paved with pebble cobble (def.pave)."""
import json, random
from collections import deque

W, H = 56, 68
SOLID = set("T~RWwfSPbr#ZXUYLKCg")
rnd = random.Random(5517)
g = [["." if rnd.random() < 0.6 else ("," if rnd.random() < 0.8 else "*") for _ in range(W)] for _ in range(H)]


def put(x, y, c):
    if 0 <= x < W and 0 <= y < H:
        g[y][x] = c


def rect(x0, y0, x1, y1, c):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            put(x, y, c)


def disc(cx, cy, rx, ry, c):
    for y in range(int(cy - ry - 1), int(cy + ry + 2)):
        for x in range(int(cx - rx - 1), int(cx + rx + 2)):
            if ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1:
                put(x, y, c)


# the woods outside, and the town wall
for y in range(H):
    for x in range(W):
        if min(x, y, W - 1 - x, H - 1 - y) < 2:
            g[y][x] = "T"
rect(2, 2, W - 3, 2, "#"); rect(2, H - 3, W - 3, H - 3, "#"); rect(2, 2, 2, H - 3, "#"); rect(W - 3, 2, W - 3, H - 3, "#")

# ---- streets
rect(12, 0, 13, 9, "=")                     # from the north gate down
for k in range(0, 14):                      # the gate road bends south-east to the square
    rect(12 + k, 9 + k // 2, 14 + k, 10 + k // 2, "=")
rect(26, 11, 27, 64, "=")                   # the high street, north to south
rect(3, 32, W - 4, 34, "=")                 # the market street, west wall to the farm gate
rect(3, 43, 52, 44, "=")                    # the lane past the homes
rect(9, 44, 10, 63, "="); rect(43, 44, 44, 63, "=")   # lanes down to the fields
disc(26.5, 25, 7.5, 5.5, "=")               # Pillar Square
rect(42, 23, 43, 31, "=")                   # the Thistle's yard to the market street
rect(9, 23, 10, 31, "=")                    # the chapel steps to the market street

# gates: the main gate north, a farm gate east, the field gate south (shut)
put(12, 2, "G"); put(13, 2, "G")
put(W - 3, 32, "g"); put(W - 3, 33, "g")
put(26, H - 3, "g"); put(27, H - 3, "g")

# ---- buildings: R roof rows, then one wall row with windows (w) and a door (D)
doors = {}


def house(x0, x1, y0, y1, door, kind, wins=None):
    rect(x0, y0, x1, y1 - 1, "R")
    for x in range(x0, x1 + 1):
        put(x, y1, "W")
    for wx in (wins or [x for x in range(x0 + 1, x1) if (x - x0) % 3 == 1 and abs(x - door) > 1]):
        put(wx, y1, "w")
    put(door, y1, "D")
    doors[(door, y1)] = kind
    # keep the step in front of the door clear
    if g[y1 + 1][door] in "Tbr":
        put(door, y1 + 1, ".")


house(17, 36, 5, 10, 26, "outpost")              # the Covenant outpost, facing the square
house(5, 14, 18, 22, 10, "chapel")               # the chapel, west
house(37, 48, 17, 22, 42, "tavern")              # the Purple Thistle, east
house(4, 9, 7, 10, 6, "cottage")                 # the gatehouse cottage
house(40, 47, 6, 9, 43, "cottage")               # the Curate's lodging
house(6, 13, 36, 40, 9, "store")                 # provisions
house(15, 21, 36, 40, 18, "apoth")               # the herbalist
house(30, 37, 36, 40, 33, "smithy")              # the smith
house(39, 44, 36, 40, 42, "tailor")              # the tailor
house(46, 51, 36, 40, 48, "cooper")              # Tarn and Son
house(3, 8, 46, 49, 6, "cottage"); house(12, 18, 46, 49, 14, "cottage")
house(3, 8, 53, 56, 6, "cottage"); house(12, 18, 53, 56, 15, "cottage")
house(30, 38, 46, 50, 34, "mill")
house(46, 51, 46, 49, 48, "cottage"); house(46, 51, 53, 56, 48, "cottage"); house(31, 37, 53, 56, 34, "cottage")
house(19, 24, 53, 56, 21, "cottage")

# fields in the south, fenced, with the field gate shut beyond
for (x0, x1) in ((3, 22), (31, 52)):
    rect(x0, 59, x1, 63, "c")
    rect(x0, 58, x1, 58, "f")
rect(9, 58, 10, 63, "="); rect(43, 58, 44, 63, "="); rect(26, 58, 27, 64, "=")

# hedges and trees inside the walls, never on a street
for (x, y) in [(3, 14), (3, 15), (16, 14), (50, 12), (51, 12), (50, 27), (51, 28), (3, 27), (22, 50), (23, 51), (40, 52), (40, 56), (52, 51), (17, 28)]:
    if g[y][x] in ".,*":
        put(x, y, "b")
for (x, y) in [(5, 28), (49, 25), (52, 6), (3, 5), (21, 47), (52, 54)]:
    if g[y][x] in ".,*":
        put(x, y, "T")

# the Pillar in the middle of the square
put(26, 25, "P"); put(27, 25, "P")

# ---- signs
signs = {}


def sign(x, y, *lines):
    put(x, y, "S"); signs[f"{x},{y}"] = list(lines)


sign(15, 4, "Ashford.", "A Pillar town under the protection of the Archon Covenant. Keep the peace and you are welcome.")
sign(29, 11, "The Covenant Outpost of Ashford. Curate Voidsong receives visitors by day.")
sign(12, 23, "The Chapel of the Covenant. Healing for those who ask; a candle for those who cannot.")
sign(45, 23, "The Purple Thistle. Rooms, ale and a hot supper. Kind words free.")
sign(11, 41, "Hobb's Provisions. Fair prices for fangs and silk.")
sign(20, 41, "Wort and Willow, herbalist.")
sign(35, 41, "Ashford Smithy. Blades mended and sold.")
sign(41, 41, "Fine Cloth and Fittings.")
sign(50, 41, "Tarn & Son, Coopers. Casks, barrels and buckets.")
sign(37, 51, "Ashford Mill. Meal ground on market days.")
sign(W - 5, 31, "The farm gate. Barred at the Curate's order since the Pillar went dark.")
sign(29, 64, "The field gate. Shut until the harvest.")

# ---- props
props = []


def prop(p, x, y, **kw):
    props.append({"p": p, "x": x, "y": y, **kw})


# Covenant flags: on every street, thickest round the outpost and the square
for (x, y) in [(11, 4), (14, 7), (16, 12), (22, 16), (31, 16), (19, 22), (34, 22), (24, 30), (29, 30), (5, 31), (16, 31), (37, 31), (48, 31),
               (25, 41), (28, 41), (25, 52), (28, 52), (17, 11), (36, 11), (2 + 13, 35), (24, 12)]:
    if g[y][x] in ".,*":
        prop("banner", x, y)
for (x, y) in [(15, 10), (25, 19), (28, 19), (20, 25), (33, 25), (8, 35), (22, 35), (31, 35), (44, 35), (25, 46), (28, 46), (25, 60), (11, 46), (42, 46)]:
    if g[y][x] in ".,*":
        prop("lamp", x, y)
prop("board", 13, 29, lk="ashboard")
prop("well", 41, 57)
prop("stall", 19, 28, v=0); prop("stall", 32, 28, v=2); prop("stall", 15, 30, v=1)
prop("barrel", 47, 23); prop("barrel", 48, 23); prop("bench", 38, 24)
prop("barrel", 52, 41); prop("crate", 46, 41, v=0); prop("barrel", 45, 42)
prop("anvil", 38, 41); prop("crate", 14, 41, v=1); prop("sack", 5, 41)
prop("sack", 29, 51); prop("sack", 39, 51); prop("baskets", 13, 51)
prop("goat", 20, 61)
for k, (x, y) in enumerate([(5, 62), (17, 60), (35, 61), (49, 62)]):
    prop("herbpatch", x, y, id=f"p_ash{k}")

rows = ["".join(r) for r in g]

# ---- check every door and gate can be reached from the north gate
def reach(start):
    seen = {start}; q = deque([start])
    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < W and 0 <= ny < H and (nx, ny) not in seen and rows[ny][nx] not in SOLID:
                seen.add((nx, ny)); q.append((nx, ny))
    return seen


ok = reach((12, 3))
bad = [(k, v) for k, v in doors.items() if (k[0], k[1] + 1) not in ok]
assert not bad, bad

warps = [{"x": 12, "y": 0, "to": "plainsSW", "tx": 58, "ty": 29, "dir": "up"}, {"x": 13, "y": 0, "to": "plainsSW", "tx": 59, "ty": 29, "dir": "up"}]
d = {
    "name": "Ashford", "outside": True, "town": True, "pave": "ash", "act2": True,
    "rows": rows, "props": props, "signs": signs, "warps": warps,
    "doorKinds": {f"{x},{y}": k for (x, y), k in doors.items()},
    "pillar": {"id": "ash", "x": 27 * 16, "y": 25 * 16 + 8, "r": 22},
}
js = "/* Ashford, generated by concept/ashford.py */\nMAP_DEFS.ash = " + json.dumps(d, separators=(",", ":")) + ";\n"
open("/home/claude/durinn/src/parts/04g_ashford.js", "w").write(js)
print("\n".join(rows))
