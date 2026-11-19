"""Generates Aurelm (Act 3) into src/parts/04z5_aurelm.js: the Outer City (au_out), the Vault Ward (au_vault) and the
old culvert between them (au_culvert).

Aurelm is 170 x 120 tiles like Verrin, built whole and cut in two at the inner wall so each half bakes inside a phone's
canvas limit: the Outer City is global rows 0-63, the Vault Ward rows 64-119. Layout follows the approved concept
(concept/aurelm_concept.png). The Mere lies along the west wall, with a harbour cut into the city behind a water-gate.
Outer City: the north gate and the gate square where everyone is searched; the barracks; the Purifier chapterhouse and
its burn-yard; the Traders' Exchange; the Drowned Bell; the chapel; the Exchange square; the Archive House; houses; the
Ashen Row against the east wall, greying where the curse presses. Vault Ward, behind the barred Warden's Gate: the
Warden's Hall, the seal-keepers' cloister, the officers' houses and the Garden of Names, and the rock the Vault is cut
into, its doors broken and chained. The culvert runs from the harbour sluice under the inner wall."""
import json, random, sys
from collections import deque

W, H, CUT = 170, 120, 64
SOLID = set("T~RWwfSPbr#ZXUYLKCgFHkDqO")
OUT = "/home/claude/durinn/src/parts/04z5_aurelm.js"
rnd = random.Random(7171)
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


# the Mere along the west; the walls; the north gate; the inner wall back to back in each half, the Warden's Gate through it
rect(0, 0, 15, H - 1, "~")
rect(16, 0, W - 1, 2, "F"); rect(16, H - 3, W - 1, H - 1, "F"); rect(16, 0, 18, H - 1, "F"); rect(W - 3, 0, W - 1, H - 1, "F")
rect(83, 0, 86, 2, "H")
rect(19, 60, W - 4, 63, "F"); rect(19, 64, W - 4, 67, "F")
rect(83, 60, 86, 67, "H")
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


# ---------------- the Outer City
rect(83, 3, 86, 59, "=")                                   # the Processional, gate to Warden's Gate
rect(19, 20, W - 4, 21, "="); rect(19, 47, W - 4, 48, "=")
rect(52, 3, 53, 59, "="); rect(116, 3, 117, 59, "=")
disc(84.5, 10, 13, 6, "=")                                 # the gate square
disc(84.5, 33, 17, 9, "=")                                 # the Exchange square
# the harbour, behind its water-gate, with quays and jetties
rect(19, 27, 32, 44, "~"); rect(16, 31, 18, 41, "~")
rect(19, 25, 36, 26, "="); rect(33, 25, 36, 46, "="); rect(19, 45, 36, 46, "=")
for x in (22, 25, 28):
    for y in range(27, 37): put(x, y, "B")
house(26, 48, 5, 16, 37, "outpost")        # the barracks
house(120, 150, 5, 16, 135, "watch")       # the Purifier chapterhouse
house(57, 70, 5, 13, 63, "store")          # the Traders' Exchange
house(98, 108, 4, 9, 103, "watch")         # the gate-post
house(39, 50, 24, 31, 44, "tavern")        # the Drowned Bell
house(57, 67, 23, 30, 62, "chapel")        # the chapel of the Weave
house(102, 113, 23, 34, 107, "hall")       # the Archive House
walk(37, 17, 19); walk(135, 17, 19); walk(63, 14, 19); walk(44, 32, 46); walk(62, 31, 46); walk(107, 35, 46)
# the burn-yard behind a fence, east of the chapterhouse
for x in range(140, 152): put(x, 18, "f")
for y in range(17, 20): put(151, y, "f")
# the Ashen Row: shacks and boarded houses against the east wall
for (x0, y0, k) in [(144, 24, "shack"), (156, 24, "boarded"), (144, 35, "boarded"), (156, 35, "shack"), (147, 51, "shack"), (157, 51, "boarded")]:
    house(x0, x0 + 8, y0, y0 + 6, x0 + 4, k)
    for y in range(y0 + 7, y0 + 13):
        if y < 59 and g[y][x0 + 4] in ".,*": put(x0 + 4, y, "=")
        else: break


def free(x0, y0, x1, y1, keep):
    for (a, b, c, d) in keep:
        if x1 >= a and x0 <= c and y1 >= b and y0 <= d: return False
    return all(g[y][x] in ".,*" for y in range(y0 - 1, y1 + 2) for x in range(x0 - 1, x1 + 2))


def infill(yA, yB, kinds, keep):
    for y0 in range(yA, yB - 6, 3):
        for x0 in range(20, W - 13, 3):
            x1, y1 = x0 + rnd.choice((7, 8, 9)), y0 + 5
            if y1 + 1 >= yB or not free(x0, y0, x1, y1, keep): continue
            door = (x0 + x1) // 2; wk = None
            for k in range(1, 7):
                c = g[y1 + k][door] if y1 + k < H else "#"
                if c == "=": wk = k; break
                if c not in ".,*": break
            if not wk: continue
            house(x0, x1, y0, y1, door, rnd.choice(kinds))
            for k in range(1, wk): put(door, y1 + k, "=")


infill(4, 59, ["cottage", "tailor", "cottage", "apoth", "cooper"], [(138, 16, 155, 20), (140, 22, 168, 59)])

# ---------------- the Vault Ward
rect(83, 68, 86, 84, "=")
rect(19, 84, W - 4, 85, "=")
rect(56, 84, 57, 104, "="); rect(112, 84, 113, 104, "=")
# the rock the Vault is cut into, and the Vault plaza in front of its face
for y in range(88, 102):
    k = (y - 88) / 13
    rect(int(66 - 8 * k), y, int(103 + 8 * k), y, "C")
put(84, 101, "O"); put(85, 101, "O")
rect(56, 103, 113, 106, "="); disc(84.5, 105, 12, 4, "=")
rect(19, 111, W - 4, 112, "="); rect(19, 98, 52, 99, "="); rect(118, 98, W - 4, 99, "="); rect(30, 86, 31, 111, "="); rect(140, 86, 141, 111, "=")
house(96, 126, 70, 81, 111, "hall")        # the Warden's Hall
house(28, 54, 70, 81, 41, "chapel")        # the seal-keepers' cloister
for x0 in (132, 144, 156): house(x0, x0 + 8, 70, 77, x0 + 4, "cottage")    # the officers' houses
walk(111, 82, 83); walk(41, 82, 83)
for x0 in (132, 144, 156): walk(x0 + 4, 78, 83)
for x in range(131, 166, 4):
    if g[80][x] in ".,*": put(x, 80, "T")
for (x, y) in [(70, 74), (99, 87), (70, 87), (28, 92), (40, 98), (130, 92), (140, 100), (160, 110), (24, 110)]:
    if g[y][x] in ".,*": put(x, y, "T")
for y in range(88, 102, 3):
    for x in (80, 89):
        pass
# planters along the Processional
for y in range(26, 56, 4):
    for x in (81, 88):
        if g[y][x] in ".,*": put(x, y, "b")
for y in range(69, 83, 4):
    for x in (81, 88):
        if g[y][x] in ".,*": put(x, y, "b")
for x in range(22, W - 5, 5):
    for y in (114, 116):
        if g[y][x + (y % 3)] in ".,*": put(x + (y % 3), y, "T" if (x // 5) % 3 else "b")
infill(86, 117, ["cottage", "hall", "cottage", "tailor"], [(50, 86, 120, 108), (20, 70, 30, 80)])

signs = {}


def sign(x, y, *lines):
    put(x, y, "S"); signs[f"{x},{y}"] = list(lines)


sign(81, 4, "Aurelm.", "By order of the Vaultwarden the city is closed. All within shall remain within. All who enter shall be searched.")
sign(88, 57, "The Warden's Gate. No admittance without the Vaultwarden's summons.")
sign(35, 23, "The harbour. No boats out until the lockdown is lifted.")
sign(81, 70, "The Vault Ward. Speak softly. The seal is listening.")
sign(115, 22, "The Archive House. Copies of the Covenant's records, by permission.")
sign(142, 22, "The Ashen Row. Somebody has painted over the street name, and somebody else has painted it back.")

props = []


def prop(p, x, y, **kw): props.append({"p": p, "x": x, "y": y, **kw})


# the gate square: the search post, and the cart the Purifiers mean to burn
prop("wagon", 93, 7, lk="hallcart"); prop("crate", 76, 12, lk="searched"); prop("crate", 77, 13, lk="searched"); prop("barrel", 92, 8)
prop("rack", 96, 11, lk="auspears")
for (x, y) in [(81, 3), (88, 3), (81, 58), (88, 58), (82, 68), (87, 68), (36, 17), (39, 17)]: prop("banner", x, y)
for (x, y, v) in [(73, 29, 0), (77, 29, 1), (91, 29, 0), (95, 29, 1), (73, 37, 1), (95, 37, 0)]: prop("stall", x, y, v=v)
prop("well", 84, 33, lk="aufountain")
prop("board", 66, 21, lk="aunotices")
for (x, y) in [(82, 18), (87, 18), (82, 44), (87, 44), (70, 33), (99, 33), (50, 22), (118, 22), (82, 72), (87, 72), (60, 86), (110, 86), (78, 106), (91, 106), (38, 28), (34, 40)]:
    prop("lamp", x, y)
for (x, y) in [(142, 17), (146, 17)]: prop("firepit", x, y, lk="burnyard")
prop("barrel", 31, 25); prop("crate", 34, 43); prop("sack", 33, 30, lk="fish")
prop("hatch", 24, 46, lk="sluice")                         # the sluice grate: the thief's road in
prop("hatch", 24, 74, lk="culvertgrate")                   # where it comes up, in the Vault Ward
prop("crate", 160, 30); prop("sack", 150, 44); prop("barrel", 163, 46)
rows = ["".join(r) for r in g]

# the curse leans on the east wall: a greying that deepens toward the Ashen Row
curse = []
for y in range(H):
    curse.append("".join(str(max(0, min(5, int((x - 138) / 6.0) + (1 if y < 60 else 0)))) if x > 138 else "0" for x in range(W)))


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
    if p["p"] == "hatch": continue
    for i in range({"well": 2, "stall": 2, "board": 2, "wagon": 2}.get(p["p"], 1)): blocked.add((p["x"] + i, p["y"]))
out_ok = reach(rows, (84, 5), blocked)
vlt_ok = reach(rows, (84, 69), blocked)
for (x, y), k in doors.items():
    assert (x, y + 1) in (vlt_ok if y >= CUT else out_ok), ("door cut off", k, x, y)
for xy in [(84, 102), (24, 47), (24, 75), (90, 12), (84, 59)]:
    assert xy in out_ok or xy in vlt_ok, ("cut off", xy)

# ---------------- the old culvert: from the harbour sluice, under the inner wall, up under the Vault Ward
CW, CH = 46, 26
cg = [["C"] * CW for _ in range(CH)]
def crect(x0, y0, x1, y1, c):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1): cg[y][x] = c
crect(3, 3, 8, 8, ".")                                       # the foot of the sluice ladder
crect(8, 5, 24, 8, "."); crect(8, 9, 24, 9, "~")              # the first run, the old channel beside it
crect(21, 9, 24, 19, "."); crect(25, 9, 25, 19, "~")
crect(12, 16, 21, 21, "."); crect(12, 22, 21, 22, "~")        # a side chamber, flooded at the back
crect(24, 16, 40, 19, "."); crect(24, 20, 40, 20, "~")
crect(37, 3, 42, 16, ".")                                    # the end: up under the Vault Ward's grate
for (x, y) in [(15, 6), (30, 17), (39, 8)]: cg[y][x] = ","
crows = ["".join(r) for r in cg]
cprops = [{"p": "hatch", "x": 5, "y": 4, "lk": "culvertladder"}, {"p": "hatch", "x": 39, "y": 4, "lk": "cutgrate"}, {"p": "lantern", "x": 22, "y": 6},
          {"p": "crate", "x": 14, "y": 17}, {"p": "chest", "x": 13, "y": 20, "id": "c_au_culvert"}, {"p": "bones", "x": 33, "y": 18}]
cseen = reach(crows, (5, 5), set())
assert (39, 5) in cseen and (13, 19) in cseen, "culvert broken"
culvert = {"name": "The Old Culvert", "outside": True, "cave": True, "dark": True, "terrain": "cave", "act3": True, "rows": crows, "props": cprops, "warps": [],
           "wild": [{"x": 20, "y": 7, "group": ["rat", "rat", "mslime"]}, {"x": 30, "y": 18, "group": ["mslime", "rslime"]}, {"x": 39, "y": 12, "group": ["rat", "rat", "rat"]}]}


# ---------------- cut in two, and the ways in, out and through
def half(y0, y1, name, tag):
    return {"name": name, "outside": True, "town": True, "south": True, "pave": "grey", "act3": True,
            "rows": rows[y0:y1], "curse": curse[y0:y1],
            "props": [{**p, "y": p["y"] - y0} for p in props if y0 <= p["y"] < y1],
            "signs": {f"{k.split(',')[0]},{int(k.split(',')[1]) - y0}": v for k, v in signs.items() if y0 <= int(k.split(",")[1]) < y1},
            "doorKinds": {f"{x},{y - y0}": k for (x, y), k in doors.items() if y0 <= y < y1},
            "towns": [[16, 0, W - 1, y1 - y0 - 1, tag]], "warps": []}


out, vlt = half(0, CUT, "Aurelm", "au_in"), half(CUT, H, "Aurelm: the Vault Ward", "au_vin")
WARDEN = "Two of the Vaultwarden's guards cross their halberds. \"The Vault Ward is closed. Nobody passes without the Vaultwarden's summons.\""
for x in range(83, 87):
    out["warps"].append({"x": x, "y": 3, "to": "eth22", "tx": 41, "ty": 21, "dir": "up"})
    out["warps"].append({"x": x, "y": 59, "to": "au_vault", "tx": x, "ty": 5, "dir": "down", "lock": {"need": "au_summoned", "say": WARDEN}})
    vlt["warps"].append({"x": x, "y": 4, "to": "au_out", "tx": x, "ty": 57, "dir": "up"})
# the Vault's doors: broken, chained, and nobody goes in
for x in (84, 85):
    vlt["warps"].append({"x": x, "y": 102 - CUT, "to": "au_vault", "tx": x, "ty": 103 - CUT, "dir": "up", "vault": True, "sealed": True,
                         "lock": {"need": "au_vault_open", "say": "Chains as thick as your wrist across the broken doors, and a seal-keeper on either side. Nobody goes into the Vault."}})
out["pillar"] = None; del out["pillar"]
src = ("/* Aurelm (Act 3), generated by concept/aurelm.py: the Outer City, the Vault Ward and the old culvert. Edit the generator, not this file. */\n"
       f"MAP_DEFS.au_out = {json.dumps(out, separators=(',', ':'))};\nMAP_DEFS.au_vault = {json.dumps(vlt, separators=(',', ':'))};\n"
       f"MAP_DEFS.au_culvert = {json.dumps(culvert, separators=(',', ':'))};\n")
open(OUT, "w").write(src)
print("bytes", len(src)); print("doors", {f"{x},{y}": k for (x, y), k in doors.items()})
if "-v" in sys.argv: print("\n".join(rows)); print("\n".join(crows))
