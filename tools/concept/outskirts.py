"""Generates the Frostcrown Outskirts (Act 2) into src/parts/04o_outskirts.js.

100 x 60 tiles of full winter round the walls of Fort Frostcrown, as planned:
    south   the road in from the plains, the field Pillar, the wagon queue, the shrine and the patrol board, and the
            south gate (the toll gate) between two gate towers, with a guard post and the toll keeper
    flanks  a road round each side of the walls to the north gate (the search checkpoint), with its own guard post
    west    a cleft in the rocks, far from any guard, ending at a culvert grate under the wall (the secret entrance)
    NW      a rocky tor with a den: wolves and bats at night, and Rimefang, the optional lair boss
    NE      a frozen pond, frost slimes, and the Vale road running east to a Covenant barricade (Frozen Vale scouts)
The Fort itself is a separate map (a later step), so its walls here are solid, with the roofs inside showing over them.
Wall tiles are "F" and gate tiles "H"; the grim bake draws them as a curtain wall with a face wherever it looks south.
Deterministic. Every key spot is checked for a walkable route from the south road."""
import json, math, random, sys
sys.path.insert(0, "/home/claude/durinn/concept")
import plains
from plains import Grid, reach, grass

SOLID = set("T~RWwfSPbr#ZXUYLKCgFH")
plains.SOLID.update("FH")
W, H = 100, 60
rnd = random.Random(5150)
G = Grid(W, H)
for y in range(H):
    for x in range(W):
        G.g[y][x] = grass(rnd)
# a ragged belt of pine and dead trees round the edge, thicker on the east and in the north-east
for y in range(H):
    for x in range(W):
        d = min(x, y, W - 1 - x, H - 1 - y)
        n = (math.sin(x * 0.23 + y * 0.13) + math.sin(x * 0.07 - y * 0.31)) / 2
        if d < 2 or (d < 4 and rnd.random() < 0.55) or (d < 7 and n > 0.55) or (x > 84 and y > 14 and rnd.random() < 0.18):
            G.g[y][x] = "T"
feats, props, signs, chests, pillars = {}, [], {}, [], []


def clear(x0, y0, x1, y1):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            if G.get(x, y) in set("Tbr"): G.set(x, y, grass(rnd))


def clear_round(cx, cy, r, ry=None):
    ry = ry or r * 0.7
    for y in range(int(cy - ry - 1), int(cy + ry + 2)):
        for x in range(int(cx - r - 1), int(cx + r + 2)):
            if ((x - cx) / r) ** 2 + ((y - cy) / ry) ** 2 <= 1 and G.get(x, y) in set("Tbr"): G.set(x, y, grass(rnd))


def sign(x, y, *lines):
    G.set(x, y, "S"); signs[f"{x},{y}"] = list(lines)


def chest(x, y, cid):
    props.append({"p": "chest", "x": x, "y": y, "id": cid}); G.set(x, y, "."); chests.append((x, y))


def pillar(pid, tx, ty):
    clear_round(tx + 1, ty, 5, 3)
    for x in (tx, tx + 1): G.set(x, ty, "P")
    feats["pillar_" + pid] = (tx, ty)
    pillars.append({"id": pid, "tx": tx, "ty": ty, "r": 5})


def rect(x0, y0, x1, y1, c):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1): G.set(x, y, c)


FX0, FY0, FX1, FY1 = 33, 11, 66, 42
GX = 48
# ---------------- roads
S_ROAD = [(49, 59), (49, 52), (49, FY1 + 1)]
G.line(S_ROAD, "=", 4, clear=1)
ring = [(49, 51), (36, 50), (24, 46), (21, 36), (21, 20), (24, 8), (36, 4), (49, 4), (49, FY0 - 1)]
G.line(ring, "=", 2, clear=1)
G.line([(50, 51), (63, 50), (75, 46), (78, 36), (78, 20), (75, 8), (63, 4), (50, 4)], "=", 2, clear=1)
VALE = [(75, 6), (82, 4), (90, 4), (99, 4)]          # the Vale road, east off the map
G.line(VALE, "=", 2, clear=1)
for y in range(1, 8): G.set(92, y, "Z")              # the Covenant barricade across it
for x in range(93, W): G.set(x, 4, "T"); G.set(x, 5, "T")

# ---------------- the Fort: a curtain wall three tiles thick, towers at the corners and either side of each gate
FX0, FY0, FX1, FY1 = 33, 11, 66, 42
for y in range(FY0 - 3, FY1 + 5):                   # a bare strip at the foot of the wall: the garrison keeps it clear
    for x in range(FX0 - 3, FX1 + 4):
        if G.get(x, y) != "=": G.set(x, y, ".")
rect(FX0, FY0, FX1, FY1, "=")                       # inside: the Fort's streets (unreachable; seen over the wall)
for (x0, y0, x1, y1) in [(FX0, FY0, FX1, FY0 + 2), (FX0, FY1 - 2, FX1, FY1), (FX0, FY0, FX0 + 2, FY1), (FX1 - 2, FY0, FX1, FY1)]:
    rect(x0, y0, x1, y1, "F")
for (cx, cy) in [(FX0, FY0), (FX1 - 3, FY0), (FX0, FY1 - 3), (FX1 - 3, FY1 - 3)]:
    rect(cx - 1, cy - 1, cx + 4, cy + 4, "F")        # corner towers, standing a tile proud of the wall
GX = 48                                              # the gates are four tiles wide, x 48 to 51
rect(GX - 3, FY1 - 2, GX - 1, FY1 + 2, "F"); rect(GX + 4, FY1 - 2, GX + 6, FY1 + 2, "F")   # south gate towers
rect(GX, FY1 - 1, GX + 3, FY1, "H")                 # the south gate (toll), recessed between its towers
rect(GX - 3, FY0 - 2, GX - 1, FY0 + 2, "F"); rect(GX + 4, FY0 - 2, GX + 6, FY0 + 2, "F")   # north gate towers
rect(GX, FY0, GX + 3, FY0 + 2, "H")                 # the north gate (search)
# a few roofs inside the walls: the command post, barracks, the chapel, the market
interior = []


def roof(x0, x1, y0, y1, kind):
    rect(x0, y0, x1, y1 - 1, "R")
    for x in range(x0, x1 + 1): G.set(x, y1, "W")
    for x in range(x0 + 1, x1, 3): G.set(x, y1, "w")
    interior.append(kind)


roof(41, 58, 15, 19, "hall")        # the command post, north
roof(37, 44, 23, 26, "store")       # kitchens and stores, west
roof(55, 63, 23, 27, "watch")       # barracks, east
roof(46, 53, 27, 30, "chapel")      # the chapel on Pillar Square
roof(37, 45, 33, 36, "inn")         # the market's inn, south-west
roof(55, 62, 33, 36, "smithy")      # the armoury, south-east

# ---------------- the south approach: Pillar, wagon queue, shrine, notice board, toll post
pillar("osroad", 41, 53)
sign(53, 57, "Fort Frostcrown.", "Gates open by day. Tolls at the south gate. All persons entering by the north gate will be searched.")
props += [{"p": "wagon", "x": 54, "y": 45, "v": 0}, {"p": "wagon", "x": 54, "y": 48, "v": 1}, {"p": "wagon", "x": 55, "y": 51, "v": 2},
          {"p": "sack", "x": 57, "y": 46}, {"p": "barrel", "x": 57, "y": 49}, {"p": "crate", "x": 58, "y": 50, "v": 1}]
props += [{"p": "board", "x": 45, "y": 47, "lk": "patrolboard"}, {"p": "sentry", "x": 43, "y": 44, "lk": "tollpost"}, {"p": "banner", "x": 44, "y": FY1 + 3},
          {"p": "banner", "x": 55, "y": FY1 + 3}, {"p": "lamp", "x": 47, "y": FY1 + 3}, {"p": "lamp", "x": 52, "y": FY1 + 3}]
clear_round(30, 55, 3, 2)
props += [{"p": "shrine", "x": 30, "y": 54, "lk": "shrine"}]
chest(32, 55, "c_os_shrine")
feats["shrine"] = (30, 56)
# the abandoned supply cart, off the east flank road, half buried
clear_round(70, 52, 3, 2)
props += [{"p": "wagon", "x": 69, "y": 52, "v": 3, "lk": "supplycart"}]
chest(72, 53, "c_os_cart")
feats["cart"] = (70, 54)
# ---------------- the north gate: its guard post and banners
props += [{"p": "sentry", "x": 54, "y": FY0 - 4, "lk": "searchpost"}, {"p": "banner", "x": 44, "y": FY0 - 3}, {"p": "banner", "x": 55, "y": FY0 - 3},
          {"p": "lamp", "x": 47, "y": FY0 - 3}, {"p": "lamp", "x": 52, "y": FY0 - 3}, {"p": "crate", "x": 45, "y": FY0 - 5, "v": 0}]
sign(44, 3, "North gate. Halt and be searched.", "By order of Arbitrator Ulric Icetoe.")

# ---------------- the west cleft and the culvert grate under the wall
for y in range(20, 32):
    for x in range(22, FX0 - 3):
        if not (25 <= y <= 26): G.set(x, y, "r" if rnd.random() < 0.8 else "T")
clear(22, 25, FX0 - 1, 26)
for y in (24, 27):
    for x in range(FX0 - 3, FX0):
        G.set(x, y, "r")
G.line([(21, 25), (24, 25)], "=", 2)
props += [{"p": "grate", "x": FX0 - 1, "y": 25, "lk": "grate"}, {"p": "bones", "x": 27, "y": 26}]
feats["grate"] = (FX0 - 2, 25)

# ---------------- the north-west tor and the den
for y in range(3, 18):
    for x in range(3, 19):
        dd = math.hypot((x - 11) / 8, (y - 10) / 7)
        ridge = math.sin(x * 0.9 + y * 0.45) + math.sin(x * 0.35 - y * 1.05) + rnd.uniform(-0.5, 0.5)
        if dd < 1 and ridge > (0.1 if dd > 0.55 else 0.7): G.set(x, y, "r")
        elif dd < 1.05 and rnd.random() < 0.12: G.set(x, y, "T")
clear_round(11, 10, 3.2, 2.2)
G.line([(18, 12), (14, 11), (11, 10)], ".", 1)
G.line([(21, 14), (18, 12)], "=", 1, clear=1)
props += [{"p": "bones", "x": 10, "y": 9}, {"p": "bones", "x": 13, "y": 11}, {"p": "rubble", "x": 8, "y": 8, "lk": "den"}]
for (bx, by) in [(5, 6), (15, 5), (4, 12), (16, 14), (9, 15), (12, 4), (6, 9), (17, 9)]:   # big boulders among the scree
    props.append({"p": "rubble", "x": bx, "y": by}); G.set(bx, by, "."); G.set(bx + 1, by, ".")
chest(14, 9, "c_os_tor")
feats["den"] = (11, 11)

# ---------------- the north-east: the frozen pond, and the Vale scouts' fire by the barricade
G.disc(82, 17, 5, 3, "~", rnd=rnd, jag=0.15)
clear_round(82, 17, 7.5, 5)
G.disc(82, 17, 5, 3, "~", rnd=rnd, jag=0.15)
chest(84, 21, "c_os_pond")
feats["pond"] = (82, 22)
clear_round(86, 8, 4, 3)
props += [{"p": "firepit", "x": 86, "y": 8}, {"p": "crate", "x": 89, "y": 7, "v": 1, "lk": "valecrate"}]
chest(88, 9, "c_os_vale")
feats["valecamp"] = (85, 7)
props += [{"p": "timber", "x": 64, "y": 54}, {"p": "rubble", "x": 26, "y": 41}, {"p": "deadlog", "x": 70, "y": 30}]

# ---------------- reachability
for p in props:
    if G.get(p["x"], p["y"]) in SOLID: G.set(p["x"], p["y"], ".")
rows = ["".join(r) for r in G.g]
blocked = set()
for p in props:
    fw = {"rubble": 2, "deadlog": 2, "wagon": 2, "timber": 2}.get(p["p"], 1)
    if p["p"] not in ("herbpatch", "bones", "grate"):
        for i in range(fw): blocked.add((p["x"] + i, p["y"]))
SOLIDSET = SOLID
r = reach(rows, (49, 58), blocked)
for name, xy in feats.items():
    if name.startswith("pillar_"): xy = (xy[0], xy[1] + 1)
    assert xy in r, f"outskirts: {name} {xy} not reachable"
for (x, y) in chests:
    assert any((x + dx, y + dy) in r for dx, dy in ((0, 1), (1, 0), (-1, 0), (0, -1))), f"chest {x},{y} cut off"
for gx in range(GX, GX + 4):
    assert (gx, FY1 + 1) in r and (gx, FY0 - 1) in r, "a gate is cut off"

# ---------------- foes: away from the gates and the road, as planned
safe = [(49, 58), (49, FY1 + 2), (49, FY0 - 2), (41, 54), (30, 55), (FX0 - 2, 25)]
def free(x, y, rr=9): return all(math.hypot(x - a, y - b) >= rr for a, b in safe)
def zone(x, y, night):
    if x < 20 and y < 19: return None                                                      # the tor has its own
    if x < 30: return [["fslimeO", "fslimeO"], ["fslimeO", "fslimeO", "fslimeO"]] if not night else [["fslimeO", "fslimeO"], ["wisp"]]
    if x > 70 and y < 30: return [["fslimeO", "fslimeO"], ["fslimeO", "frostspider"]] if not night else [["wisp"], ["wisp", "fslimeO"]]
    if x > 70: return [["snowboar"], ["snowboar", "snowboar"], ["frostspider", "frostspider"]] if not night else [["wisp"], ["fslimeO", "fslimeO"]]
    if y > 44: return [["snowboar"], ["fslimeO", "fslimeO"]] if not night else [["wisp"]]
    return [["fslimeO", "fslimeO"]] if not night else [["wisp"]]
wild = []
for i in range(24):
    for _ in range(200):
        x, y = rnd.randrange(4, W - 4), rnd.randrange(4, H - 4)
        night = i % 3 == 2
        if rows[y][x] in set(".,*") and (x, y) in r and free(x, y) and zone(x, y, night) and not (FX0 - 4 <= x <= FX1 + 4 and FY0 - 4 <= y <= FY1 + 5) \
                and all(math.hypot(x - g["x"], y - g["y"]) > 8 for g in wild):
            wild.append({"x": x, "y": y, "group": rnd.choice(zone(x, y, night)), "when": "night" if night else "day"}); break
# the tor: wolves and bats only, and only at night; frost spiders in the rocks by day
wild += [{"x": 7, "y": 14, "group": ["frostwolf", "frostwolf"], "when": "night"}, {"x": 16, "y": 6, "group": ["frostwolf", "frostwolf", "frostwolf"], "when": "night"},
         {"x": 6, "y": 6, "group": ["batO", "batO", "batO"], "when": "night"}, {"x": 16, "y": 15, "group": ["batO", "batO", "batO"], "when": "night"},
         {"x": 15, "y": 13, "group": ["frostspider", "frostspider"], "when": "day"}, {"x": 25, "y": 29, "group": ["frostspider"], "when": "day"}]
# Rimefang lies up in his den at night until he is beaten
wild += [{"x": 11, "y": 9, "group": ["rimefang"], "when": "night", "unless": "rimefang_beaten", "face": "down"}]
# the Vale scouts by their fire, by day
wild += [{"x": 84, "y": 9, "group": ["valescout", "valeshaman"], "when": "day"}, {"x": 80, "y": 6, "group": ["valescout", "valeberserk"], "when": "day"}]

warps = [{"x": x, "y": H - 1, "to": "plainsNE", "tx": x, "ty": 1, "dir": "down"} for x in range(46, 52)]
d = {"name": "The Frostcrown Outskirts", "outside": True, "wild_zone": True, "fort": True, "snowY0": 0, "snowLevel": 0.92,
     "rows": rows, "props": props, "signs": signs, "pillars": pillars, "wild": wild, "warps": warps,
     "fortBox": [FX0, FY0, FX1, FY1], "gates": {"south": [GX, FY1], "north": [GX, FY0]}}
open("/home/claude/durinn/src/parts/04o_outskirts.js", "w").write("/* The Frostcrown Outskirts, generated by concept/outskirts.py */\nMAP_DEFS.os = " + json.dumps(d, separators=(",", ":")) + ";\n")
print("\n".join(rows))
print("wild", len(wild), "props", len(props))
from PIL import Image
col = {".": (220, 224, 230), ",": (212, 216, 224), "*": (226, 230, 236), "=": (140, 136, 130), "T": (30, 52, 34), "b": (46, 70, 44), "r": (110, 110, 116), "S": (230, 210, 150),
       "#": (150, 150, 156), "P": (120, 230, 220), "F": (70, 72, 84), "H": (20, 20, 24), "R": (90, 50, 50), "W": (150, 130, 100), "w": (220, 200, 120), "~": (150, 180, 210), "Z": (160, 60, 40)}
im = Image.new("RGB", (W, H))
for y in range(H):
    for x in range(W): im.putpixel((x, y), col.get(rows[y][x], (255, 0, 255)))
for g in wild: im.putpixel((g["x"], g["y"]), (220, 40, 40) if g.get("when") != "night" else (150, 60, 220))
for (x, y) in chests: im.putpixel((x, y), (255, 220, 0))
im.resize((W * 8, H * 8), Image.NEAREST).save("/tmp/claude-0/-home-claude/81f7a483-afca-5415-8c60-809b5595b3f8/scratchpad/phase4/outskirts_overview.png")
