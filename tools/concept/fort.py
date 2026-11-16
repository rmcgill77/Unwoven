"""Generates Fort Frostcrown (Act 2) into src/parts/04q_fort.js.

One walled map, 150 x 96 tiles, safe (no foes). The curtain wall runs round the edge (F, three tiles thick) with the
south gate (toll) and the north gate (search) on the main road, which runs from one to the other through Pillar Square.
Districts, as planned:
    centre   Pillar Square, the chapel, the notice board
    south    the market: stalls, the quartermaster, the apothecary, the armoury forge, the tailor and furrier, the inn
    north    the command post (Arbitrator Ulric Icetoe), with the holding cells below it
    east     the barracks, the training yard and its sparring ring, the armoury
    west     the mess and kitchens, the storehouse (the Keystones) over the undercroft (the secret way in)
    NW       the Weaver Hall          SW   the lower quarter: workers' homes, the hostel, the fence
    NE       the north tower: the stair up to the ramparts and the lookout
Streets are grey cobble (def.pave = "grey"); snow lies heavy everywhere else (def.snowLevel)."""
import json, random
from collections import deque

W, H = 150, 96
SOLID = set("T~RWwfSPbr#ZXUYLKCgFH")
rnd = random.Random(9601)
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


# ---------------- streets
GX = 73                                         # the main road and both gates: x 73 to 76
rect(GX, 3, GX + 3, H - 4, "=")
rect(3, 46, W - 4, 47, "=")                     # the cross street, west wall to east wall
disc(74.5, 46.5, 11, 6.5, "=")                  # Pillar Square
rect(3, 22, W - 4, 22, "=")                     # the north lane, past the command post
rect(3, 70, W - 4, 70, "=")                     # the market lane
rect(40, 23, 40, 90, "=")                       # the west street, down into the lower quarter
rect(108, 23, 108, 69, "=")                     # the east street, past the barracks and yard
rect(20, 47, 20, 60, "="); rect(128, 47, 128, 56, "=")
rect(54, 6, 95, 6, "="); rect(54, 6, 54, 22, "="); rect(95, 6, 95, 22, "=")   # round the command post to the north gate
put(74, 45, "P"); put(75, 45, "P")

# ---------------- the walls
rect(0, 0, W - 1, 2, "F"); rect(0, H - 3, W - 1, H - 1, "F"); rect(0, 0, 2, H - 1, "F"); rect(W - 3, 0, W - 1, H - 1, "F")
for (cx, cy) in [(0, 0), (W - 6, 0), (0, H - 6), (W - 6, H - 6)]: rect(cx, cy, cx + 5, cy + 5, "F")   # corner towers
rect(GX, H - 3, GX + 3, H - 1, "H")             # the south gate
rect(GX, 0, GX + 3, 2, "H")                     # the north gate
for x in (GX - 3, GX - 2, GX - 1, GX + 4, GX + 5, GX + 6):   # gate towers inside the wall
    for y in (3, 4): put(x, y, "F")
    for y in (H - 5, H - 4): put(x, y, "F")

# ---------------- buildings: R roof rows, one wall row with windows (w) and a door (D)
doors = {}


def house(x0, x1, y0, y1, door, kind, wins=None, name=None):
    rect(x0, y0, x1, y1 - 1, "R")
    for x in range(x0, x1 + 1): put(x, y1, "W")
    for wx in (wins or [x for x in range(x0 + 1, x1) if (x - x0) % 3 == 1 and abs(x - door) > 1]): put(wx, y1, "w")
    put(door, y1, "D"); doors[(door, y1)] = (kind, name)
    if g[y1 + 1][door] not in "=": put(door, y1 + 1, "=")


house(58, 91, 9, 18, 74, "outpost", name="fort_cmd")         # the command post, facing the main road
house(84, 93, 34, 39, 88, "chapel", name="fort_chapel")       # the chapel on Pillar Square
house(56, 66, 34, 39, 61, "outpost", name=None)               # the square's guardhouse (no way in)
house(10, 32, 9, 16, 21, "hall", name="fort_weaver")          # the Weaver Hall
house(118, 128, 8, 14, 123, "watch", name="fort_tower")       # the north tower: stair to the ramparts
house(10, 30, 26, 32, 20, "tavern", name="fort_mess")         # the mess hall and kitchens
house(10, 26, 36, 42, 18, "store", name="fort_store")         # the storehouse
house(112, 134, 26, 32, 123, "watch", name="fort_barracks")   # the barracks
house(136, 144, 26, 32, 140, "smithy", name="fort_armoury")   # the armoury
house(56, 68, 62, 68, 62, "store", name="fort_qm")            # the quartermaster
house(82, 92, 62, 67, 87, "apoth", name="fort_apoth")         # the apothecary
house(94, 104, 62, 68, 99, "smithy", name="fort_smith")       # the market forge
house(44, 52, 64, 68, 48, "tailor", name="fort_tailor")       # the tailor and furrier
house(54, 68, 76, 82, 62, "inn", name="fort_inn")             # the Frost Lantern
for (x0, x1, y0, y1, d) in [(6, 13, 52, 55, 9), (15, 22, 52, 55, 18), (24, 31, 52, 55, 27), (6, 13, 62, 65, 10), (15, 22, 62, 65, 17),
                            (6, 13, 74, 77, 9), (24, 31, 74, 77, 28), (6, 13, 84, 87, 10), (15, 22, 84, 87, 18), (24, 31, 84, 87, 27)]:
    house(x0, x1, y0, y1, d, "shack", name=None)               # the lower quarter
house(24, 34, 62, 66, 29, "cottage", name="fort_hostel")      # the hostel
house(15, 22, 74, 77, 18, "shack", name="fort_fence")         # the fence's back room
house(84, 94, 76, 81, 89, "store", name=None)                 # market storerooms (locked)
house(112, 120, 76, 81, 116, "watch", name=None)              # a gatehouse office (locked)

# ---------------- the training yard: a fenced ring, posts and straw targets
for x in range(112, 145):
    put(x, 37, "f"); put(x, 58, "f")
for y in range(37, 59):
    put(112, y, "f"); put(144, y, "f")
for y in (46, 47): put(112, y, ".")        # the gap from the east street
rect(108, 46, 112, 47, "=")
disc(128, 47, 8, 5, "=")                    # the sparring ring: trodden flat

props, signs = [], {}


def prop(p, x, y, **kw): props.append({"p": p, "x": x, "y": y, **kw})


def sign(x, y, *lines):
    put(x, y, "S"); signs[f"{x},{y}"] = list(lines)


# yard furniture: straw targets, racks of practice weapons, the master's bench
for (x, y) in [(116, 40), (119, 40), (122, 40), (134, 54), (137, 54), (140, 54)]: prop("dummy", x, y)
prop("rack", 116, 54, lk="practicerack"); prop("rack", 118, 54, lk="practicerack"); prop("bench", 131, 41); prop("barrel", 142, 39)
prop("banner", 126, 39); prop("banner", 130, 39)
sign(110, 45, "The Training Yard.", "Bouts by day, by leave of Captain Rennick. Practice blades only.")
# the square: banners, the notice board, lamps
prop("board", 68, 42, lk="fortboard")
for (x, y) in [(64, 44), (85, 44), (64, 50), (85, 50)]: prop("lamp", x, y)
for (x, y) in [(70, 40), (79, 40)]: prop("banner", x, y)
sign(78, 52, "Pillar Square.", "North: the Command Post. East: barracks and yard. West: stores and kitchens. South: the market.")
# the market: stalls along the road, crates and barrels
for k, (x, y) in enumerate([(70, 72), (70, 76), (70, 80), (78, 72), (78, 76), (78, 80)]): prop("stall", x, y, v=k % 3)
for (x, y) in [(69, 74), (81, 78), (53, 70), (95, 71), (100, 71)]: prop("barrel", x, y)
for (x, y) in [(81, 74), (66, 84)]: prop("crate", x, y, v=1)
prop("wagon", 86, 84, v=1); prop("crate", 87, 83, v=0); prop("well", 48, 78)
# the kitchen yard: barrels, sacks, a woodpile, the cook's block
for (x, y) in [(31, 34), (33, 34), (12, 34)]: prop("barrel", x, y)
for (x, y) in [(28, 35), (14, 34)]: prop("sack", x, y)
prop("firewood", 30, 37); prop("block", 33, 37)
# the lower quarter: washing, a fire, rubbish
prop("firepit", 20, 69); prop("rubble", 34, 80); prop("timber", 30, 91); prop("crate", 36, 58, v=0); prop("barrel", 23, 58)
# banners at the gates, lamps along the main road
for (x, y) in [(71, 6), (78, 6), (71, 89), (78, 89)]: prop("banner", x, y)
for y in (26, 34, 58, 86): prop("lamp", 72, y); prop("lamp", 77, y)
for k, (x, y) in enumerate([(35, 89), (140, 88), (8, 44)]): prop("herbpatch", x, y, id=f"ft_{k}")
for (x, y) in [(36, 54), (4, 70), (46, 90), (102, 88), (132, 66), (146, 20), (50, 28), (98, 28)]: put(x, y, "T")   # a few bare trees the garrison hasn't burned

rows = ["".join(r) for r in g]
for p in props:
    assert rows[p["y"]][p["x"]] not in SOLID, (p, rows[p["y"]][p["x"]])


def reach(start, blocked):
    seen = {start}; q = deque([start])
    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < W and 0 <= ny < H and (nx, ny) not in seen and rows[ny][nx] not in SOLID and (nx, ny) not in blocked:
                seen.add((nx, ny)); q.append((nx, ny))
    return seen


blocked = set()
for p in props:
    fw = {"stall": 2, "wagon": 2, "rubble": 2, "timber": 2}.get(p["p"], 1)
    if p["p"] not in ("herbpatch",):
        for i in range(fw): blocked.add((p["x"] + i, p["y"]))
ok = reach((74, 90), blocked)
bad = [(k, v) for k, v in doors.items() if v[1] and (k[0], k[1] + 1) not in ok]
assert not bad, bad
for name, xy in {"pillar": (74, 46), "ring": (128, 47), "northgate": (74, 4), "board": (68, 43)}.items():
    assert xy in ok, (name, xy)

warps = [{"x": x, "y": H - 4, "to": "os", "tx": x - 25, "ty": 45, "dir": "down", "lock": {"night": True, "say": "The south gate is barred for the night. The sentry shakes his head: \"First light.\""}} for x in range(GX, GX + 4)]
warps += [{"x": x, "y": 3, "to": "os", "tx": x - 25, "ty": 7, "dir": "up", "lock": {"night": True, "say": "The north gate is shut for the night. \"Nobody goes out that way after dark. Not with the Vale about.\""}} for x in range(GX, GX + 4)]
d = {"name": "Fort Frostcrown", "outside": True, "town": True, "fort": True, "pave": "grey", "act2": True, "snowY0": 0, "snowLevel": 0.85,
     "rows": rows, "props": props, "signs": signs, "warps": warps,
     "doorKinds": {f"{x},{y}": k for (x, y), (k, n) in doors.items()}, "doorNames": {f"{x},{y}": n for (x, y), (k, n) in doors.items() if n},
     "pillar": {"id": "fort", "x": 75 * 16, "y": 45 * 16 + 8, "r": 24}}
open("/home/claude/durinn/src/parts/04q_fort.js", "w").write("/* Fort Frostcrown, generated by concept/fort.py */\nMAP_DEFS.fort = " + json.dumps(d, separators=(",", ":")) + ";\n")
print("doors", {v[1]: k for k, v in doors.items() if v[1]})
from PIL import Image
col = {".": (220, 224, 230), ",": (212, 216, 224), "*": (226, 230, 236), "=": (140, 136, 130), "T": (30, 52, 34), "b": (46, 70, 44), "r": (110, 110, 116), "S": (230, 210, 150),
       "P": (120, 230, 220), "F": (70, 72, 84), "H": (20, 20, 24), "R": (90, 50, 50), "W": (150, 130, 100), "w": (220, 200, 120), "D": (60, 30, 20), "f": (120, 90, 60)}
im = Image.new("RGB", (W, H))
for y in range(H):
    for x in range(W): im.putpixel((x, y), col.get(rows[y][x], (255, 0, 255)))
for p in props: im.putpixel((p["x"], p["y"]), (240, 160, 40))
im.resize((W * 6, H * 6), Image.NEAREST).save("/tmp/claude-0/-home-claude/81f7a483-afca-5415-8c60-809b5595b3f8/scratchpad/phase4/fort_overview.png")
