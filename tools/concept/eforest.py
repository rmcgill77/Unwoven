"""Generates the East Light Forest (Act 2) into src/parts/04k_eforest.js.

90 x 55, off the plains' east trail. The trail runs straight into the Iron Cleave's camp, a left-to-right gauntlet in five
stages, with wild forest on either side and a coastal bluff at the far end (the Dread Expanse across the water):
    1 Outer Watch (x 14-24)          level 10
    2 Palisade Gate (x 27-31)        10 to 11; a ditch round the south end of the palisade
    3 Lumber Yard and Tents (x 33-50) 11; supply chests, the quartermaster's tent, the tarped Pillar (the rest fire)
    4 Captive Pens (x 52-64)          11; empty pens, tally marks, the ledger scrap (Hakon's first Arthur moment)
    5 War Camp and Bluff Path (x 66-80) 11 to 12; the war camp chest, the small Pillar at the bluff's foot
    the bluff (x 78-86, y 4-14)       the Iron Cleave, and a small cache with a view
Deterministic; every key spot is checked for a route from the entrance."""
import json, math, random, sys
sys.path.insert(0, "/home/claude/durinn/concept")
from plains import Grid, reach, grass, SOLID

W, H = 90, 55
rnd = random.Random(9213)
G = Grid(W, H)
for y in range(H):
    for x in range(W):
        G.g[y][x] = grass(rnd)
for y in range(H):
    for x in range(W):
        d = min(x, y, W - 1 - x, H - 1 - y)
        n = (math.sin(x * 0.17 + y * 0.13) + math.sin(x * 0.09 - y * 0.23) + math.sin((x - y) * 0.11)) / 3
        if d < 2 or (d < 4 and rnd.random() < 0.6) or n > 0.2 or rnd.random() < 0.16:
            G.g[y][x] = "T"
# the sea along the east edge, and the cliff that drops to it
for y in range(H):
    edge = 86 + int(2 * math.sin(y * 0.3)) + (1 if y % 7 == 0 else 0)
    for x in range(edge, W):
        G.set(x, y, "~")
    for x in range(edge - 2, edge):
        if 3 <= y <= 50: G.set(x, y, "C")
feats, props, signs, chests, pillars = {}, [], {}, [], []


def clear_rect(x0, y0, x1, y1):
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
    pillars.append({"id": pid, "tx": tx, "ty": ty, "r": 4})


# ---------------- the camp's ground: cleared and trampled
clear_rect(13, 21, 25, 33)        # outer watch
clear_rect(32, 18, 51, 37)        # lumber yard and tents
clear_rect(52, 20, 65, 35)        # captive pens
clear_rect(66, 17, 81, 34)        # war camp
clear_round(81, 9, 5, 4)          # the bluff top
# ---------------- the trail: in at the west edge, straight through the camp, then up the bluff path
trail = [(0, 27), (8, 27), (14, 26), (24, 27), (31, 27), (40, 27), (50, 28), (58, 27), (66, 26), (74, 25), (78, 20), (80, 14), (81, 10)]
G.line(trail, "=", 2, clear=1)
# side paths into the woods: a forest-edge cache north, a herb dell south
G.line([(8, 27), (9, 17), (11, 12)], "=", 1, clear=1); clear_round(11, 11, 4, 3)
G.line([(20, 33), (22, 42), (26, 46)], "=", 1, clear=1); clear_round(27, 46, 5, 3)
chest(12, 10, "c_ef_edge"); feats["edgecache"] = (11, 12)
for k, (x, y) in enumerate([(25, 45), (29, 47), (24, 47)]): props.append({"p": "herbpatch", "x": x, "y": y, "id": f"yw_e{k}"})
for k, (x, y) in enumerate([(28, 44), (31, 46)]): props.append({"p": "herbpatch", "x": x, "y": y, "id": f"mc_e{k}"})
props.append({"p": "herbpatch", "x": 10, "y": 13, "id": "rc_e0"})
feats["dell"] = (27, 46)

# 1 the Outer Watch: a lookout of stacked crates and a sentry bell on a post
props += [{"p": "crate", "x": 17, "y": 23}, {"p": "crate", "x": 18, "y": 23, "v": 1}, {"p": "barrel", "x": 19, "y": 23}, {"p": "firepit", "x": 21, "y": 30},
          {"p": "lamp", "x": 22, "y": 24, "lk": "bell"}]
sign(12, 25, "Turn back. This road belongs to the Iron Cleave.", "Somebody has added underneath, in a different hand: 'and he means it'.")
feats["watch"] = (19, 28)
# 2 the Palisade Gate: a sharpened-stake wall across the clearing, an open gate on the trail, a ditch round the south end
for y in range(16, 41):
    if G.get(29, y) not in ("=",) and G.get(29, y) != "~": G.set(29, y, "Z")
    if G.get(30, y) == "T": G.set(30, y, ".")
for y in (26, 27, 28): G.set(29, y, "=")
G.line([(25, 36), (28, 39), (31, 39), (33, 34)], "=", 1, clear=1)                      # the ditch route
for y in (38, 39, 40): G.set(29, y, "=")
for y in range(41, 47): G.set(29, y, "T")
feats["gate"] = (30, 27); feats["ditch"] = (31, 39)
# 3 the Lumber Yard and Tents
props += [{"p": "leanto", "x": 35, "y": 21}, {"p": "leanto", "x": 39, "y": 21}, {"p": "leanto", "x": 43, "y": 33}, {"p": "leanto", "x": 47, "y": 33},
          {"p": "timber", "x": 35, "y": 31}, {"p": "timber", "x": 38, "y": 32}, {"p": "timber", "x": 35, "y": 34}, {"p": "block", "x": 41, "y": 24},
          {"p": "firepit", "x": 37, "y": 25}, {"p": "crate", "x": 48, "y": 22}, {"p": "barrel", "x": 49, "y": 22}, {"p": "sack", "x": 50, "y": 23},
          {"p": "frame", "x": 45, "y": 19, "lk": "qmtent"}]
chest(37, 23, "c_ef_yard1"); chest(46, 36, "c_ef_yard2"); chest(48, 20, "c_ef_qm")
pillar("efyard", 42, 30)
props.append({"p": "tarp", "x": 42, "y": 30, "lk": "tarp", "goneFlag": "ef_tarp_off"})       # lashed over: the bandits never used it
feats["yard"] = (40, 27)
# 4 the Captive Pens: fenced pens with gaps, tally marks on the posts, the ledger scrap
for (x0, y0) in [(54, 20), (60, 20), (54, 31), (60, 31)]:
    for x in range(x0, x0 + 5):
        G.set(x, y0, "f"); G.set(x, y0 + 3, "f")
    for y in range(y0, y0 + 4):
        G.set(x0, y, "f"); G.set(x0 + 4, y, "f")
    G.set(x0 + 2, y0 + 3 if y0 < 27 else y0, ".")                                     # the pen doors hang open
props += [{"p": "rubble", "x": 55, "y": 21, "lk": "tally"}, {"p": "straw", "x": 62, "y": 22}, {"p": "straw", "x": 56, "y": 33}, {"p": "bones", "x": 62, "y": 33},
          {"p": "crate", "x": 58, "y": 29, "lk": "ledger"}, {"p": "firepit", "x": 64, "y": 28}]
feats["pens"] = (58, 27)
# 5 the War Camp: the big tent, the war chest, banners of the House the orcs serve
props += [{"p": "frame", "x": 70, "y": 18, "lk": "wartent"}, {"p": "leanto", "x": 75, "y": 30}, {"p": "leanto", "x": 68, "y": 30}, {"p": "firepit", "x": 72, "y": 26},
          {"p": "barrel", "x": 74, "y": 20}, {"p": "crate", "x": 75, "y": 21}, {"p": "block", "x": 69, "y": 24}]
chest(76, 19, "c_ef_war")
feats["warcamp"] = (72, 24)
pillar("efbluff", 75, 22)
# the bluff: the Iron Cleave's stand, a cache at the edge
props += [{"p": "rubble", "x": 79, "y": 7, "lk": "expanse"}]
chest(83, 7, "c_ef_bluff")
feats["bluff"] = (81, 10)
sign(77, 15, "The bluff path. Beyond the camp, the coast, and the grey water they call the Dread Expanse.")
# scrub and rocks in the open ground
for _ in range(80):
    x, y = rnd.randrange(3, W - 6), rnd.randrange(3, H - 3)
    if G.get(x, y) in set(".,*") and all(G.get(x + dx, y + dy) not in ("=", "P", "S", "f", "Z") for dx in (-1, 0, 1) for dy in (-1, 0, 1)) and all(abs(x - c[0]) + abs(y - c[1]) > 2 for c in chests) and not (13 <= x <= 81 and 17 <= y <= 37):
        G.set(x, y, rnd.choice("bbr"))
for p in props:
    if G.get(p["x"], p["y"]) in SOLID and p["p"] not in ("lamp", "tarp"): G.set(p["x"], p["y"], ".")
rows = ["".join(r) for r in G.g]

blocked = set()
for p in props:
    fw = {"rubble": 2, "leanto": 2, "deadlog": 2, "timber": 2, "block": 2, "frame": 3}.get(p["p"], 1)
    fh = 2 if p["p"] == "frame" else 1
    if p["p"] not in ("herbpatch", "candles", "bones", "straw"):
        for i in range(fw):
            for j in range(fh): blocked.add((p["x"] + i, p["y"] - j))
r = reach(rows, (1, 27), blocked)
for name, xy in feats.items():
    if name.startswith("pillar_"): xy = (xy[0], xy[1] + 1)
    assert xy in r, f"eforest: {name} {xy} not reachable"
for (x, y) in chests:
    assert any((x + dx, y + dy) in r for dx, dy in ((0, 1), (1, 0), (-1, 0), (0, -1))), f"chest {x},{y} cut off"

# ---------------- foes. The camp: fully manned by Day; at Night half the tents sleep. The woods: worse at Night.
wild = [
    # 1 Outer Watch
    {"x": 18, "y": 27, "group": ["ccutpurse", "ccutpurse", "barcher"]},
    {"x": 22, "y": 31, "group": ["bthug"], "when": "day"},
    # 2 Palisade Gate
    {"x": 31, "y": 25, "group": ["bthug", "bthug", "barcher"], "when": "day"},
    {"x": 31, "y": 29, "group": ["bthug"], "when": "night"},
    # 3 Lumber Yard and Tents (the yard crew: beat them and the tarped Pillar can be lit)
    {"x": 38, "y": 28, "group": ["bthug", "barcher", "orcW"], "yard": True},
    {"x": 44, "y": 31, "group": ["bthug", "ccutpurse"]},
    {"x": 46, "y": 25, "group": ["ccutpurse", "bthug"], "when": "day"},
    # 4 Captive Pens
    {"x": 58, "y": 25, "group": ["orcB", "orcS", "ccutpurse"]},
    {"x": 62, "y": 34, "group": ["ccutpurse", "barcher"], "when": "day"},
    # 5 War Camp
    {"x": 69, "y": 27, "group": ["bknight", "bknight", "orcS"]},
    {"x": 73, "y": 31, "group": ["orcW", "bthug"]},
    {"x": 77, "y": 31, "group": ["orcW", "barcher"], "when": "day"},
    # the bluff
    {"x": 81, "y": 9, "group": ["ironcleave", "orcS", "orcW"]},
]
safe = [(1, 27)] + [(p["tx"], p["ty"]) for p in pillars]
for i in range(16):
    for _ in range(150):
        x, y = rnd.randrange(4, 84), rnd.randrange(4, H - 4)
        if 12 <= x <= 82 and 16 <= y <= 38: continue
        if rows[y][x] in set(".,*") and (x, y) in r and all(math.hypot(x - a, y - b) >= 9 for a, b in safe) and all(math.hypot(x - g["x"], y - g["y"]) > 7 for g in wild):
            night = i % 2 == 1
            grp = rnd.choice([["gwolfE", "gwolfE", "gwolfE"], ["batE", "batE", "batE"]] if night else [["boarE"], ["fspiderE", "fspiderE"], ["boarE", "fspiderE"]])
            wild.append({"x": x, "y": y, "group": grp, "when": "night" if night else "day"}); break
d = {"name": "The East Light Forest", "outside": True, "wild_zone": True, "rows": rows, "props": props, "signs": signs, "pillars": pillars, "wild": wild,
     "camps": [{"x": 19, "y": 28, "r": 3}, {"x": 41, "y": 27, "r": 5}, {"x": 58, "y": 27, "r": 4}, {"x": 72, "y": 25, "r": 5}],
     "warps": [{"x": 0, "y": y, "to": "plainsSE", "tx": 87, "ty": y - 7, "dir": "left"} for y in (26, 27, 28)]}
open("/home/claude/durinn/src/parts/04k_eforest.js", "w").write("/* The East Light Forest, generated by concept/eforest.py */\nMAP_DEFS.eforest = " + json.dumps(d, separators=(",", ":")) + ";\n")
print("\n".join(rows)); print("wild", len(wild), "props", len(props))
from PIL import Image
col = {".": (70, 96, 60), ",": (64, 90, 56), "*": (80, 104, 66), "=": (140, 118, 86), "T": (30, 52, 34), "b": (46, 70, 44), "r": (110, 110, 116), "S": (230, 210, 150), "#": (150, 150, 156), "P": (120, 230, 220), "~": (40, 60, 80), "C": (90, 84, 76), "Z": (160, 60, 40), "f": (120, 90, 60)}
im = Image.new("RGB", (W, H))
for y in range(H):
    for x in range(W): im.putpixel((x, y), col.get(rows[y][x], (255, 0, 255)))
for g in wild: im.putpixel((g["x"], g["y"]), (220, 40, 40) if g.get("when") != "night" else (150, 60, 220))
for (x, y) in chests: im.putpixel((x, y), (255, 220, 0))
im.resize((W * 8, H * 8), Image.NEAREST).save("/tmp/claude-0/-home-claude/81f7a483-afca-5415-8c60-809b5595b3f8/scratchpad/phase4/eforest_overview.png")
