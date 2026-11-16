"""Generates the West Light Forest (Act 2) into src/parts/04i_wforest.js.

About 90 x 55 tiles, off the plains' west-forest trail. Three bands west to east, as planned:
    edge   (x < 30)   level 7: a wide sunlit trail, the hunters' lean-to, yarrow and red-cap
    middle (30 to 60) level 8: denser trees, the spider hollow (north), the moon-cap glade (south)
    ruins  (x > 60)   level 8 to 9: old Weaver halls, a ring of fallen pillars, the collapsed tower, the ruin garden,
                      the scholar's camp by the ruin Pillar, and the Worn Covenant Construct's clearing with the locked chest
The main trail runs from the forest mouth to the ruins; a southern trail loops back, so the forest is never a dead end.
Deterministic. Every key spot is checked for a walkable route from the entrance."""
import json, math, random, sys
sys.path.insert(0, "/home/claude/durinn/concept")
from plains import Grid, reach, grass, SOLID

W, H = 90, 55
rnd = random.Random(4401)
G = Grid(W, H)
for y in range(H):
    for x in range(W):
        G.g[y][x] = grass(rnd)
# cover: light at the edge, dense in the middle, thinner and broken among the ruins
for y in range(H):
    for x in range(W):
        d = min(x, y, W - 1 - x, H - 1 - y)
        n = (math.sin(x * 0.19 + y * 0.11) + math.sin(x * 0.08 - y * 0.27) + math.sin((x + y) * 0.1)) / 3
        dens = 0.1 if x < 30 else 0.22 if x < 60 else 0.12
        thr = 0.32 if x < 30 else 0.1 if x < 60 else 0.25
        if d < 2 or (d < 4 and rnd.random() < 0.6) or n > thr or rnd.random() < dens:
            G.g[y][x] = "T"
feats, props, signs, chests, pillars = {}, [], {}, [], []


def clear_round(cx, cy, r, ry=None):
    ry = ry or r * 0.7
    for y in range(int(cy - ry - 1), int(cy + ry + 2)):
        for x in range(int(cx - r - 1), int(cx + r + 2)):
            if ((x - cx) / r) ** 2 + ((y - cy) / ry) ** 2 <= 1 and G.get(x, y) in set("Tbr"):
                G.set(x, y, grass(rnd))


def sign(x, y, *lines):
    G.set(x, y, "S"); signs[f"{x},{y}"] = list(lines)


def chest(x, y, cid):
    props.append({"p": "chest", "x": x, "y": y, "id": cid}); G.set(x, y, "."); chests.append((x, y))


def pillar(pid, tx, ty):
    clear_round(tx + 1, ty, 6, 4)
    for x in (tx, tx + 1):
        G.set(x, ty, "P")
    feats["pillar_" + pid] = (tx, ty)
    pillars.append({"id": pid, "tx": tx, "ty": ty, "r": 5})


# ---------------- clearings first, then trails through them
for (cx, cy, r, ry) in [(14, 8, 7, 5), (24, 16, 6, 4), (45, 10, 6, 4), (41, 44, 7, 4), (66, 30, 7, 5), (77, 20, 7, 5), (84, 40, 7, 6), (85, 10, 5, 4), (71, 46, 6, 4), (74, 30, 5, 4)]:
    clear_round(cx, cy, r, ry)
main = [(13, 0), (13, 6), (20, 13), (30, 20), (40, 24), (50, 26), (60, 28), (66, 30), (72, 28), (77, 23), (80, 30), (82, 36)]
G.line(main, "=", 2, clear=1)
loop = [(66, 32), (68, 40), (60, 46), (48, 48), (38, 46), (28, 44), (20, 38), (16, 28), (14, 18), (14, 10)]
G.line(loop, "=", 1, clear=1)
spurs = [[(40, 24), (44, 16), (45, 12)],          # spider hollow
         [(41, 44), (41, 40)],                      # moon-cap glade (on the loop)
         [(77, 20), (84, 14), (85, 11)],            # collapsed tower
         [(68, 40), (71, 45)],                      # ruin garden
         [(20, 13), (24, 15)]]                      # hunters' lean-to
for s in spurs:
    G.line(s, "=", 1, clear=1)

# ---------------- the forest mouth: a Pillar, a sign
pillar("wfmouth", 16, 6)
sign(11, 4, "The West Light Forest.", "Weaver ruins lie east, past the spider hollow. Mind the snapjaws by the trail.")
# hunters' lean-to (edge)
props += [{"p": "leanto", "x": 23, "y": 14}, {"p": "firepit", "x": 26, "y": 17}, {"p": "firewood", "x": 22, "y": 17}]
chest(27, 15, "c_wf_leanto")
feats["leanto"] = (25, 16)
for k, (x, y) in enumerate([(9, 12), (18, 21), (27, 24), (8, 26)]):
    props.append({"p": "herbpatch", "x": x, "y": y, "id": f"yw_{k}"})
for k, (x, y) in enumerate([(21, 9), (29, 11), (12, 30)]):
    props.append({"p": "herbpatch", "x": x, "y": y, "id": f"rc_{k}"})
# spider hollow (north of the middle): webs of bones and a cache
props += [{"p": "bones", "x": 43, "y": 9}, {"p": "bones", "x": 48, "y": 11}, {"p": "deadlog", "x": 46, "y": 8}]
chest(47, 9, "c_wf_spider")
feats["hollow"] = (45, 11)
# moon-cap glade (south of the middle): moon-caps only show at night
for k, (x, y) in enumerate([(38, 43), (43, 45), (40, 46), (45, 43)]):
    props.append({"p": "herbpatch", "x": x, "y": y, "id": f"mc_{k}"})
feats["glade"] = (41, 44)
# ---------------- the ruins
pillar("wfruins", 64, 27)
feats["scholar"] = (68, 29)
props += [{"p": "leanto", "x": 68, "y": 26}, {"p": "firepit", "x": 70, "y": 29}, {"p": "books", "x": 71, "y": 27}, {"p": "crate", "x": 72, "y": 27}]
# broken halls: stone walls with gaps, west of the ring
for (x0, y0, x1, y1) in [(58, 15, 66, 21), (52, 33, 60, 39), (72, 33, 78, 38)]:
    for x in range(x0, x1 + 1):
        for y in (y0, y1):
            if rnd.random() < 0.72: G.set(x, y, "#")
    for y in range(y0, y1 + 1):
        for x in (x0, x1):
            if rnd.random() < 0.72: G.set(x, y, "#")
    for y in range(y0 + 1, y1):
        for x in range(x0 + 1, x1):
            if G.get(x, y) == "T": G.set(x, y, grass(rnd))
G.line([(62, 21), (62, 23)], "=", 1)                                        # doorways
G.line([(56, 33), (56, 30)], "=", 1)
props += [{"p": "rubble", "x": 60, "y": 18, "lk": "ruin"}, {"p": "rubble", "x": 55, "y": 36}, {"p": "rubble", "x": 74, "y": 35}]
chest(64, 17, "c_wf_ruin1"); chest(54, 37, "c_wf_ruin2")
feats["hall1"] = (62, 18); feats["hall2"] = (57, 35)
# the ring of fallen pillars
for k in range(10):
    a = k / 10 * math.tau
    x, y = int(round(77 + 5 * math.cos(a))), int(round(20 + 3.4 * math.sin(a)))
    if G.get(x, y) != "=": G.set(x, y, "r")
props.append({"p": "rubble", "x": 76, "y": 20, "lk": "tablet"})       # the Weaver tablet at the ring's heart
feats["ring"] = (77, 22)
# the collapsed tower and its cache
for (x, y) in [(83, 7), (84, 7), (86, 7), (87, 7), (83, 8), (87, 8), (83, 9), (87, 10)]:
    G.set(x, y, "#")
props.append({"p": "rubble", "x": 85, "y": 8})
chest(86, 9, "c_wf_tower")
feats["tower"] = (85, 11)
# the ruin garden: moon-caps at night, yarrow by day
for k, (x, y) in enumerate([(69, 46), (73, 47), (71, 44)]):
    props.append({"p": "herbpatch", "x": x, "y": y, "id": f"mc_g{k}"})
props.append({"p": "herbpatch", "x": 74, "y": 44, "id": "yw_g"})
feats["garden"] = (71, 45)
# the construct's clearing: a rusted figure, a locked chest behind it
chest(85, 42, "c_construct")
props += [{"p": "rubble", "x": 80, "y": 44}, {"p": "bones", "x": 88, "y": 39}]
feats["construct"] = (83, 40)
# husks: two dormant Weaver husks lie in the halls as scenery
husks = [{"x": 63, "y": 19}, {"x": 75, "y": 36}]
# scattered rocks and bushes off the trail
for _ in range(90):
    x, y = rnd.randrange(3, W - 3), rnd.randrange(3, H - 3)
    if G.get(x, y) in set(".,*") and all(G.get(x + dx, y + dy) not in ("=", "P", "S") for dx in (-1, 0, 1) for dy in (-1, 0, 1)) and all(abs(x - c[0]) + abs(y - c[1]) > 2 for c in chests):
        G.set(x, y, rnd.choice("bbbr"))
for p in props:
    if G.get(p["x"], p["y"]) in SOLID: G.set(p["x"], p["y"], ".")
rows = ["".join(r) for r in G.g]

# ---------------- reachability
blocked = set()
for p in props:
    fw = {"rubble": 2, "leanto": 2, "deadlog": 2}.get(p["p"], 1)
    if p["p"] not in ("herbpatch", "candles", "bones"):
        for i in range(fw): blocked.add((p["x"] + i, p["y"]))
r = reach(rows, (13, 1), blocked)
for name, xy in feats.items():
    if name.startswith("pillar_"): xy = (xy[0], xy[1] + 1)
    assert xy in r, f"wforest: {name} {xy} not reachable"
for (x, y) in chests:
    assert any((x + dx, y + dy) in r for dx, dy in ((0, 1), (1, 0), (-1, 0), (0, -1))), f"chest {x},{y} cut off"

# ---------------- foes: Day is plants, hounds and spiders; Night is wolves, bats, and skeletons in the ruins
safe = [(13, 1)] + [(p["tx"], p["ty"]) for p in pillars] + [feats["scholar"], feats["construct"]]
def free(x, y, rr=10): return all(math.hypot(x - a, y - b) >= rr for a, b in safe)
def band(x, night):
    if night:
        if x < 30: return [["gwolf", "gwolf"]]
        if x < 60: return [["gwolf", "gwolf", "gwolf"], ["bat2", "bat2", "bat2"]]
        return [["skelW", "skelS"], ["skelA", "skelW"], ["leywolf2"], ["bat2", "bat2", "bat2"], ["skelS", "skelA", "skelW"]]
    if x < 30: return [["thornhound2", "thornhound2"], ["redcap2", "redcap2"], ["redcap2", "thornhound2"]]
    if x < 60: return [["mandrake2", "mandrake2"], ["thornhound2", "thornhound2"], ["fspider", "fspider"], ["mandrake2", "redcap2"]]
    return [["fspider", "mandrake2"], ["thornhound2", "fspider"]]
wild = []
for i in range(26):
    for _ in range(120):
        x, y = rnd.randrange(5, W - 5), rnd.randrange(5, H - 5)
        if rows[y][x] in set(".,*") and (x, y) in r and free(x, y) and all(math.hypot(x - g["x"], y - g["y"]) > 8 for g in wild):
            night = i % 3 == 2
            wild.append({"x": x, "y": y, "group": rnd.choice(band(x, night)), "when": "night" if night else "day"}); break
# the spider hollow's spiders, snapjaws rooted by the trail
wild += [{"x": 44, "y": 12, "group": ["fspider", "fspider", "fspider"], "when": "day"},
         {"x": 33, "y": 19, "group": ["snapjaw"], "when": "day"}, {"x": 52, "y": 24, "group": ["snapjaw"], "when": "day"},
         {"x": 47, "y": 29, "group": ["snapjaw"], "when": "day"}]
# the construct, dormant: it stands like a statue until the chest is tried
statues = [{"x": 83, "y": 41, "group": ["construct"], "statue": True, "unless": "construct_beaten"}]

d = {"name": "The West Light Forest", "outside": True, "wild_zone": True, "rows": rows, "props": props, "signs": signs,
     "pillars": pillars, "wild": wild + statues, "husks": husks,
     "warps": [{"x": 12, "y": 0, "to": "plainsSW", "tx": 13, "ty": 57, "dir": "up"}, {"x": 13, "y": 0, "to": "plainsSW", "tx": 14, "ty": 57, "dir": "up"}]}
open("/home/claude/durinn/src/parts/04i_wforest.js", "w").write("/* The West Light Forest, generated by concept/wforest.py */\nMAP_DEFS.wforest = " + json.dumps(d, separators=(",", ":")) + ";\n")
print("\n".join(rows))
print("wild", len(wild), "props", len(props))
from PIL import Image
col = {".": (70, 96, 60), ",": (64, 90, 56), "*": (80, 104, 66), "=": (140, 118, 86), "T": (30, 52, 34), "b": (46, 70, 44), "r": (110, 110, 116), "S": (230, 210, 150), "#": (150, 150, 156), "P": (120, 230, 220)}
im = Image.new("RGB", (W, H))
for y in range(H):
    for x in range(W): im.putpixel((x, y), col.get(rows[y][x], (255, 0, 255)))
for g in wild: im.putpixel((g["x"], g["y"]), (220, 40, 40) if g.get("when") != "night" else (150, 60, 220))
for (x, y) in chests: im.putpixel((x, y), (255, 220, 0))
im.resize((W * 8, H * 8), Image.NEAREST).save("/tmp/claude-0/-home-claude/81f7a483-afca-5415-8c60-809b5595b3f8/scratchpad/phase4/wforest_overview.png")
