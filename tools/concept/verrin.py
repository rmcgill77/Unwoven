"""Generates Verrin (Act 3) into src/parts/04z_verrin.js: Lower Town (ver_lo) and High Town (ver_hi).

Verrin is 170 x 120 tiles, larger than Fort Frostcrown, built whole and cut in two at the inner wall so each half bakes
inside a phone's canvas limit: High Town is global rows 0-57, Lower Town rows 58-119. Layout follows the approved
concept (concept/verrin_concept.png). Lower Town: the south gate (the writ is checked), the Gate Road, the Gilded Lamp,
the market and the Archon's fountain, the shops row, the barracks and training yard, the east tenements where the
lamplighter lives; the inner wall and the Lantern Gate, barred to strangers until the lamplighter vouches for them.
High Town: the Processional, Pillar Court and the city's Pillar, the Grand Chapel, the Registry of the Weave, the
Arbiter's Hall, the Initiates' College, the Archive, and the grand houses."""
import json, random, sys
from collections import deque

W, H, CUT = 170, 120, 58
SOLID = set("T~RWwfSPbr#ZXUYLKCgFHkDq")
OUT = "/home/claude/durinn/src/parts/04z_verrin.js"
rnd = random.Random(5150)
g = [["." if rnd.random() < 0.6 else ("," if rnd.random() < 0.8 else "*") for _ in range(W)] for _ in range(H)]


def put(x, y, c):
    if 0 <= x < W and 0 <= y < H: g[y][x] = c


def rect(x0, y0, x1, y1, c):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1): put(x, y, c)


def disc(cx, cy, rx, ry, c):
    for y in range(int(cy - ry - 1), int(cy + ry + 2)):
        for x in range(int(cx - rx - 1), int(cx + rx + 2)):
            if ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1: put(x, y, c)


# the outer walls; the south gate; the inner wall, back to back in each half, and the Lantern Gate through it
rect(0, 0, W - 1, 2, "F"); rect(0, H - 3, W - 1, H - 1, "F"); rect(0, 0, 2, H - 1, "F"); rect(W - 3, 0, W - 1, H - 1, "F")
rect(83, H - 3, 86, H - 1, "H")
rect(3, 54, W - 4, 57, "F"); rect(3, 58, W - 4, 61, "F")
rect(83, 54, 86, 61, "H")

# ---------------- High Town
rect(83, 3, 86, 53, "=")                                   # the Processional
rect(3, 30, W - 4, 32, "=")                                # the Avenue
rect(36, 3, 37, 53, "="); rect(132, 3, 133, 53, "=")
disc(84.5, 31, 19, 10, "=")                                # Pillar Court
put(84, 31, "P"); put(85, 31, "P")
doors, kinds = {}, {}


def house(x0, x1, y0, y1, door, kind):
    rect(x0, y0, x1, y1 - 1, "R")
    for x in range(x0, x1 + 1): put(x, y1, "W")
    for wx in [x for x in range(x0 + 1, x1) if (x - x0) % 3 == 1 and abs(x - door) > 1]: put(wx, y1, "w")
    put(door, y1, "D"); doors[(door, y1)] = kind
    if g[y1 + 1][door] in "Tbr#f~": put(door, y1 + 1, ".")
    for x in range(min(door, 0) + door - 0, door + 1):
        pass


house(73, 96, 5, 17, 84, "chapel")         # the Grand Chapel of the Archon
house(42, 62, 8, 20, 52, "hall")           # the Registry of the Weave
house(106, 126, 8, 20, 116, "outpost")     # the Arbiter's Hall
house(42, 62, 37, 50, 52, "watch")         # the Initiates' College (closed)
house(106, 126, 37, 50, 116, "hall")       # the Archive (by permission only)
for (x0, y0) in [(6, 6), (6, 18), (6, 36), (20, 6), (20, 42), (140, 6), (140, 18), (140, 36), (154, 6), (154, 18), (154, 40)]:
    house(x0, x0 + 9, y0, y0 + 7, x0 + 4, "cottage")
for (x, y) in [(66, 24), (103, 24), (66, 38), (103, 38), (30, 26), (139, 26), (30, 50), (139, 50), (70, 50), (99, 50)]:
    if g[y][x] in ".,*": put(x, y, "T")
for y in range(20, 30, 2):
    for x in (68, 101):
        if g[y][x] in ".,*": put(x, y, "b")
# paths from the Processional to the doors
rect(52, 21, 52, 29, "="); rect(116, 21, 116, 29, "="); rect(52, 33, 52, 36, "="); rect(116, 33, 116, 36, "=")
for (x0, y0) in [(6, 6), (6, 18), (6, 36), (20, 6), (140, 6), (140, 18), (140, 36), (154, 6), (154, 18)]:
    for y in range(y0 + 8, 30):
        if g[y][x0 + 4] in ".,*": put(x0 + 4, y, "=")

# ---------------- Lower Town
rect(83, 62, 86, H - 4, "=")                               # the Gate Road
rect(3, 70, W - 4, 71, "="); rect(3, 88, W - 4, 90, "=")
rect(40, 62, 41, H - 4, "="); rect(128, 62, 129, H - 4, "=")
disc(85, 89, 21, 11, "=")                                  # the market square
house(66, 80, 104, 112, 73, "tavern")      # the Gilded Lamp
house(90, 100, 106, 113, 95, "watch")      # the gate-house
house(108, 116, 73, 80, 112, "smithy")     # the armourer
house(118, 126, 73, 80, 122, "apoth")      # the apothecary
house(108, 116, 93, 99, 112, "store")      # the trader
house(118, 126, 93, 99, 122, "cottage")    # the bookseller
house(10, 36, 95, 110, 23, "outpost")      # the barracks
for x in range(12, 35):
    put(x, 74, "f" if x not in (23, 24) else "."); put(x, 86, "f" if x not in (23, 24) else ".")
for y in range(74, 87): put(12, y, "f"); put(34, y, "f")
for (x0, y0, k) in [(136, 63, "shack"), (150, 63, "boarded"), (136, 76, "shack"), (150, 76, "cottage"), (136, 95, "boarded"), (150, 95, "shack"), (136, 105, "shack"), (150, 105, "shack")]:
    house(x0, x0 + 8, y0, y0 + 6, x0 + 4, k)
for (x0, y0) in [(46, 63), (58, 63), (46, 76), (46, 95), (58, 95), (46, 105), (110, 105)]:
    house(x0, x0 + 8, y0, y0 + 6, x0 + 4, "cottage")
for (x0, y0) in [(46, 63), (58, 63), (46, 76), (46, 95), (58, 95), (46, 105), (110, 105), (136, 63), (150, 63), (136, 76), (150, 76), (136, 95), (150, 95), (136, 105), (150, 105)]:
    for y in range(y0 + 7, y0 + 12):
        if g[y][x0 + 4] in ".,*": put(x0 + 4, y, "=")
        else: break
rect(73, 113, 73, 114, "="); rect(95, 114, 95, 114, "=")
for (x, y) in [(5, 64), (5, 112), (164, 64), (164, 90), (62, 84), (107, 84), (36, 66), (132, 112)]:
    if g[y][x] in ".,*": put(x, y, "T")

# fill the empty blocks with more houses, each with a short paved walk down to the nearest street
def free(x0, y0, x1, y1):
    if x1 >= 11 and x0 <= 35 and y1 >= 73 and y0 <= 87: return False          # keep the training yard open
    return all(g[y][x] in ".,*" for y in range(y0 - 1, y1 + 2) for x in range(x0 - 1, x1 + 2))
for (yA, yB, kindsF) in [(4, 52, ["hall", "cottage", "outpost"]), (63, 115, ["cottage", "store", "tailor", "cottage"])]:
    for y0 in range(yA, yB - 6, 3):
        for x0 in range(4, W - 13, 3):
            x1, y1 = x0 + rnd.choice((7, 8, 9)), y0 + 5
            if y1 + 1 >= yB or not free(x0, y0, x1, y1): continue
            door = (x0 + x1) // 2; walk = None
            for k in range(1, 7):
                c = g[y1 + k][door] if y1 + k < H else "#"
                if c == "=": walk = k; break
                if c not in ".,*": break
            if not walk: continue
            house(x0, x1, y0, y1, door, rnd.choice(kindsF))
            for k in range(1, walk): put(door, y1 + k, "=")
# street trees and planters along the Processional and the Gate Road
for y in range(6, 52, 4):
    for x in (81, 88):
        if g[y][x] in ".,*": put(x, y, "b")
for y in range(66, 112, 6):
    for x in (81, 88):
        if g[y][x] in ".,*": put(x, y, "T")

signs = {}


def sign(x, y, *lines):
    put(x, y, "S"); signs[f"{x},{y}"] = list(lines)


sign(81, 113, "Verrin.", "By the grace of the Archon Covenant. Walk in order.")
sign(81, 64, "The Lantern Gate. High Town: residents, the Covenant's servants, and those who carry a Lamplighter's token.")
sign(88, 34, "Pillar Court. The Arbiter's Hall lies east, the Registry of the Weave west.")
sign(50, 22, "The Registry of the Weave. All who show the mark must be entered here.")
sign(105, 92, "The shops row: arms, physic, goods and books.")
sign(146, 72, "Somebody has chalked a red thread on the wall here, snapped in two. Somebody else has half scrubbed it off.")

props = []


def prop(p, x, y, **kw): props.append({"p": p, "x": x, "y": y, **kw})


prop("well", 84, 92, lk="fountain")
for (x, y, v) in [(71, 84, 0), (75, 84, 1), (94, 84, 0), (98, 84, 1), (71, 95, 1), (98, 95, 0)]: prop("stall", x, y, v=v)
for (x, y) in [(79, 113), (88, 113), (79, 62), (88, 62), (80, 53), (89, 53), (78, 4), (91, 4)]: prop("banner", x, y)
for (x, y) in [(82, 66), (87, 66), (82, 80), (87, 80), (82, 100), (87, 100), (70, 34), (99, 34), (82, 22), (87, 22), (60, 31), (110, 31)]: prop("lamp", x, y)
# the three tenement lamps someone keeps smashing (the lamplighter's errand)
for (x, y, k) in [(142, 72, "a"), (156, 92, "b"), (142, 103, "c")]: prop("lamp", x, y, lk="vlamp", id=k)
for (x, y) in [(16, 78), (20, 78), (16, 82), (26, 80)]: prop("dummy", x, y)
prop("rack", 30, 76, lk="spears"); prop("barrel", 13, 93); prop("crate", 37, 96)
prop("barrel", 148, 70); prop("crate", 160, 100); prop("sack", 135, 88)
for (x, y) in [(102, 76), (128, 98)]: prop("barrel", x, y)
prop("board", 88, 64, lk="vboard")
rows = ["".join(r) for r in g]


def reach(rows, start, blocked):
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
    fw = {"well": 2, "stall": 2, "board": 2}.get(p["p"], 1)
    for i in range(fw): blocked.add((p["x"] + i, p["y"]))
lo_ok = reach(rows, (84, 115), blocked)
hi_ok = reach(rows, (84, 52), blocked)
for (x, y), k in doors.items():
    assert (x, y + 1) in (lo_ok if y >= CUT else hi_ok), ("door cut off", k, x, y)
for (x, y, k) in [(142, 72, "a"), (156, 92, "b"), (142, 103, "c")]:
    assert any((x + dx, y + dy) in lo_ok for dx, dy in ((0, 1), (1, 0), (-1, 0), (0, -1))), ("lamp", k)
assert (84, 32) in hi_ok and (84, 62) in lo_ok

# ---------------- cut in two, and the ways in, out and through
def half(y0, y1, name):
    return {"name": name, "outside": True, "town": True, "south": True, "pave": "ash", "act3": True,
            "rows": rows[y0:y1],
            "props": [{**p, "y": p["y"] - y0} for p in props if y0 <= p["y"] < y1],
            "signs": {f"{k.split(',')[0]},{int(k.split(',')[1]) - y0}": v for k, v in signs.items() if y0 <= int(k.split(",")[1]) < y1},
            "doorKinds": {f"{x},{y - y0}": k for (x, y), k in doors.items() if y0 <= y < y1},
            "towns": [[0, 0, W - 1, y1 - y0 - 1, "verrin_in"]], "warps": []}


hi, lo = half(0, CUT, "Verrin: High Town"), half(CUT, H, "Verrin: Lower Town")
hi["pillar"] = {"id": "verrin_court", "x": 85 * 16, "y": 31 * 16 + 8, "r": 22}
LANTERN = "The warden steps into the gate and raises a hand. \"High Town is for residents and the Covenant's servants. A Lamplighter's token, or turn about.\""
for x in range(83, 87):
    lo["warps"].append({"x": x, "y": 62 - CUT, "to": "ver_hi", "tx": x, "ty": 51, "dir": "up", "lock": {"need": "ver_lantern", "say": LANTERN}})
    hi["warps"].append({"x": x, "y": 53, "to": "ver_lo", "tx": x, "ty": 64 - CUT, "dir": "down"})
    lo["warps"].append({"x": x, "y": H - 4 - CUT, "to": "eth20", "tx": 42, "ty": 62, "dir": "down"})
src = ("/* Verrin (Act 3), generated by concept/verrin.py: Lower Town and High Town. Edit the generator, not this file. */\n"
       f"MAP_DEFS.ver_lo = {json.dumps(lo, separators=(',', ':'))};\nMAP_DEFS.ver_hi = {json.dumps(hi, separators=(',', ':'))};\n")
open(OUT, "w").write(src)
print("bytes", len(src)); print("doors", {f"{x},{y}": k for (x, y), k in doors.items()})
if "-v" in sys.argv: print("\n".join(rows))
