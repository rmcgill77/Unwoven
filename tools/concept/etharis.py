"""Generates Southern Etharis (Act 3) into src/parts/04t_etharis.js.

One 360 x 240 map (global tiles, x east, y south), cut into twelve 90 x 80 sections joined by walk-through seams,
the same way the plains are cut into quarters. A whole section is about the size of a plains quarter, so it bakes
in the same time and fits a phone's canvas limit; only the last few sections visited are kept baked.

    col 0 x 0-89        col 1 x 90-179        col 2 x 180-269       col 3 x 270-359
    row 0 y 0-79:   the Pale Road     the Northern Fields   Verrin                the Capital Road
    row 1 y 80-159: the Crags' Foot   the Millhaven Downs   the Turning Land      the Eastern Holts
    row 2 y 160-239: the Old Track    the Southern Fields   Aurelm and the Mere   the Cursed Reach

The layout follows the approved concept (concept/south_etharis_map.png), with the towns nudged so none straddles a
seam. The curse spreads from the far south-east; its strength is stored per tile (0-9) for the bake. The town gates,
the Capital Gate and the sealed pass into the Western Crags are barred until their builds or story beats open them.
Deterministic: re-running gives the same maps. Every key spot is checked for a walkable route from the entry."""
import json, math, random, sys
sys.path.insert(0, "/home/claude/durinn/concept")
from plains import Grid, reach, grass

SOLID = set("T~RWwfSPbr#ZXUYLKCgFHk")
W, H = 360, 240
CW, CH = 90, 80
OUT = "/home/claude/durinn/src/parts/04t_etharis.js"
SCR = "/tmp/claude-0/-home-claude/81f7a483-afca-5415-8c60-809b5595b3f8/scratchpad/"
NAMES = [["the Pale Road", "the Northern Fields", "Verrin", "the Capital Road"],
         ["the Crags' Foot", "the Millhaven Downs", "the Turning Land", "the Eastern Holts"],
         ["the Old Track", "the Southern Fields", "Aurelm and the Mere", "the Cursed Reach"]]
BLD_KINDS, PAVE_ZONES, TOWN_RECTS, GRAVEYARDS, CLASHES, UNBS = {}, [], [], [], [], []


def sec_id(cx, cy): return f"eth{cx}{cy}"


class VNoise:
    """smooth value noise on a coarse random grid, bilinear with a smoothstep"""
    def __init__(s, cell, seed):
        s.cell = cell; s.r = random.Random(seed); s.g = {}
    def v(s, ix, iy):
        k = (ix, iy)
        if k not in s.g: s.g[k] = s.r.random() if False else random.Random(ix * 73856093 ^ iy * 19349663 ^ s.cell * 83492791).random()
        return s.g[k]
    def __call__(s, x, y):
        fx, fy = x / s.cell, y / s.cell; ix, iy = int(math.floor(fx)), int(math.floor(fy)); tx, ty = fx - ix, fy - iy
        tx, ty = tx * tx * (3 - 2 * tx), ty * ty * (3 - 2 * ty)
        a, b, c, d = s.v(ix, iy), s.v(ix + 1, iy), s.v(ix, iy + 1), s.v(ix + 1, iy + 1)
        return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty


N1, N2, N3 = VNoise(23, 1), VNoise(9, 2), VNoise(41, 3)


def curse_at(x, y):
    d = math.hypot((x - 350) * 0.8, (y - 232) * 1.0)
    n = 0.6 * N1(x, y) + 0.4 * N2(x, y)
    return max(0.0, min(1.0, 1 - (d - 40) / 150 + (n - 0.5) * 0.45))


def mountain(x, y):
    """the Western Crags: a short range down the west edge, thickest about y 125"""
    t = max(0.0, 1 - abs(y - 126) / 74.0) ** 0.6
    edge = -6 + 44 * t + 6 * math.sin(y / 13.0) + 4 * math.sin(y / 5.3 + 1.7) + (N3(x * 0.5, y) - 0.5) * 16
    return x < edge


def main():
    rnd = random.Random(3307)
    G = Grid(W, H)
    curse = [[curse_at(x, y) for x in range(W)] for y in range(H)]
    for y in range(H):
        for x in range(W):
            G.g[y][x] = grass(rnd)
    # wild cover: copses, lone trees, scrub; a thick wild edge all round
    woods = [(110, 24, 30, 13), (292, 84, 28, 15), (104, 150, 18, 12), (268, 114, 22, 24), (96, 198, 30, 18),
             (160, 218, 20, 12), (334, 134, 20, 28), (16, 34, 12, 16), (176, 98, 12, 9), (64, 220, 22, 12)]
    for y in range(H):
        for x in range(W):
            d = min(x, y, W - 1 - x, H - 1 - y)
            wn = max(((x - wx) / rx) ** 2 + ((y - wy) / ry) ** 2 <= 1 + (N2(x, y) - 0.5) * 0.8 for (wx, wy, rx, ry) in woods)
            if d < 2 or (d < 4 and rnd.random() < 0.55) or (wn and rnd.random() < 0.82) or rnd.random() < 0.03:
                G.g[y][x] = "T"
            elif N1(x * 1.7, y * 1.7) > 0.72 and rnd.random() < 0.3:
                G.g[y][x] = "b"
    # the Western Crags
    for y in range(H):
        for x in range(W):
            if mountain(x, y): G.g[y][x] = "C"
            elif mountain(x - 3, y) and rnd.random() < 0.18: G.g[y][x] = "r"      # boulders shed at the foot
    feats, props, signs, chests, camps, pillars = {}, [], {}, [], [], []
    BLD_KINDS.clear(); PAVE_ZONES.clear(); TOWN_RECTS.clear()
    TOWN_RECTS.append((316, 0, 359, 4, "capital"))

    # ---------------- water: a river from the foot of the Crags east to the Mere
    river = [(38, 121), (60, 123), (82, 121), (104, 120), (126, 124), (150, 126), (174, 131), (196, 142), (216, 154)]
    for (x0, y0), (x1, y1) in zip(river, river[1:]):
        n = int(max(abs(x1 - x0), abs(y1 - y0)) * 2) + 1
        for i in range(n + 1):
            t = i / n; x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
            for dy in range(3):
                for dx in range(2):
                    G.set(int(round(x)) + dx, int(round(y)) + dy - 1, "~")
    G.disc(38, 121, 2.6, 2, "~", jag=0.2, rnd=rnd)                         # the spring under the rock
    G.disc(229, 161, 16, 12, "~", jag=0.12, rnd=rnd)                        # the Mere

    # ---------------- towns: walls (F), gates (H), houses (R/W/w), streets (=)
    def wall(x0, x1, y0, y1):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                G.set(x, y, "F")

    def house(x0, x1, y0, y1, kind=None):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                G.set(x, y, "W" if y == y1 and (x - x0) % 2 == 0 else "w" if y == y1 else "R")
        if kind: BLD_KINDS[f"{x0},{y0}"] = kind

    def town(name, x0, y0, x1, y1, gate, gw, thick, kinds, big=None, pave="ash", seed=0):
        """a walled town seen from outside: wall all round, one gate (side 'n' or 's'), houses in blocks between streets"""
        tr = random.Random(seed)
        for y in range(y0 - 3, y1 + 4):
            for x in range(x0 - 3, x1 + 4):
                if G.get(x, y) not in (None, "~"): G.set(x, y, grass(tr))
        wall(x0, x1, y0, y0 + thick - 1); wall(x0, x1, y1 - thick + 1, y1)
        wall(x0, x0 + 1, y0, y1); wall(x1 - 1, x1, y0, y1)
        gx = (x0 + x1) // 2 - gw // 2
        gy0, gy1 = (y0, y0 + thick - 1) if gate == "n" else (y1 - thick + 1, y1)
        for x in range(gx, gx + gw):
            for y in range(gy0, gy1 + 1):
                G.set(x, y, "H")
        ix0, ix1, iy0, iy1 = x0 + 2, x1 - 2, y0 + thick, y1 - thick
        for y in range(iy0, iy1 + 1):
            for x in range(ix0, ix1 + 1):
                G.set(x, y, grass(tr))
        # the high street from the gate, and cross streets every block
        for y in range(iy0, iy1 + 1):
            for x in range(gx, gx + gw): G.set(x, y, "=")
        cross = list(range(iy0 + 5, iy1 - 2, 6))
        for cy in cross:
            for x in range(ix0, ix1 + 1): G.set(x, cy, "=")
        PAVE_ZONES.append((ix0, iy0, ix1, iy1, pave))
        # blocks of houses, filled left to right between the streets; a big hall where asked
        bands = [iy0] + [c + 1 for c in cross]
        ends = [c - 1 for c in cross] + [iy1]
        if big:
            bx0, bx1, by0, by1, bk = big
            house(bx0, bx1, by0, by1, bk)
        for b0, b1 in zip(bands, ends):
            if b1 - b0 < 2: continue
            for side in ((ix0 + 1, gx - 2), (gx + gw + 1, ix1 - 1)):
                x = side[0]
                while x + 3 <= side[1]:
                    w = tr.choice((4, 4, 5, 6)); xe = min(side[1], x + w - 1)
                    if xe - x < 3: break
                    yb = min(b1, b0 + 3)
                    if all(G.get(xx, yy) not in ("R", "W", "w") for xx in range(x - 1, xe + 2) for yy in range(b0, yb + 1)):
                        house(x, xe, b0 + (1 if b1 - b0 > 3 else 0), yb, tr.choice(kinds))
                    x = xe + 2
        front = ((gx + gw // 2), gy0 - 2) if gate == "n" else ((gx + gw // 2), gy1 + 2)
        feats[name] = front
        TOWN_RECTS.append((x0, y0, x1, y1, name))
        return {"gate": gate, "gx": gx, "gw": gw, "gy": gy0 - 1 if gate == "n" else gy1 + 1, "front": front}

    CITY = ["cottage", "inn", "store", "chapel", "watch", "outpost", "cottage", "tailor", "apoth", "cooper"]
    VIL = ["cottage", "cottage", "inn", "store", "shack", "chapel", "cooper"]
    ROT = ["boarded", "shack", "boarded", "cottage", "shack", "chapel"]
    verrin = town("verrin", 195, 26, 249, 59, "s", 4, 3, CITY, big=(216, 229, 30, 34, "chapel"), pave="ash", seed=11)
    aurelm = town("aurelm", 195, 184, 249, 216, "n", 4, 3, CITY, big=(226, 238, 200, 204, "outpost"), pave="grey", seed=12)
    stoneb = town("stonebridge", 50, 95, 82, 113, "n", 3, 2, VIL, pave="ash", seed=13)
    millh = town("millhaven", 134, 141, 166, 159, "n", 3, 2, VIL, pave="ash", seed=14)
    rotm = town("rotmoor", 294, 175, 326, 193, "n", 3, 2, ROT, pave="grey", seed=15)
    towns = {"verrin": verrin, "aurelm": aurelm, "stonebridge": stoneb, "millhaven": millh, "rotmoor": rotm}

    # the Capital Gate: a great wall across the north-east corner, its gate shut
    for y in range(0, 6):
        for x in range(316, W):
            G.set(x, y, "F" if y < 5 else grass(rnd))
    for x in range(336, 340):
        for y in range(0, 5): G.set(x, y, "H")
    for y in range(6, 10):
        for x in range(328, 348):
            if G.get(x, y) in set("Tbr"): G.set(x, y, grass(rnd))
    feats["capital_gate"] = (337, 7)

    # ---------------- roads
    entry = [(36, 0), (36, 18), (48, 34), (62, 44)]
    G.line(entry, "=", 3, clear=2)
    vf = verrin["front"]; af = aurelm["front"]; sf = stoneb["front"]; mf = millh["front"]; rf = rotm["front"]
    G.line([(62, 44), (90, 50), (130, 58), (170, 64), (200, 64), (vf[0], vf[1])], "=", 3, clear=2)            # the Pale Road east to Verrin
    G.line([(vf[0], vf[1]), (244, 66), (268, 58), (296, 40), (322, 22), (337, 8)], "=", 3, clear=2)           # the Capital Road
    G.line([(62, 44), (64, 62), (66, 80), (sf[0], sf[1])], "=", 2, clear=1)                                   # south to Stonebridge
    G.line([(sf[0], sf[1]), (86, 92), (100, 106), (124, 114), (150, 118)], "=", 2, clear=1)                   # Stonebridge to the Millhaven bridge
    G.line([(vf[0], vf[1]), (214, 76), (196, 96), (172, 110), (150, 118), (mf[0], mf[1])], "=", 3, clear=2)   # Verrin south over the bridge to Millhaven
    G.line([(mf[0], mf[1]), (128, 139), (125, 152), (130, 166), (160, 176), (196, 180), (af[0], af[1])], "=", 3, clear=2)   # Millhaven round to Aurelm
    G.line([(mf[0], mf[1]), (176, 139), (200, 140), (232, 143), (262, 150), (288, 162), (rf[0], rf[1])], "=", 2, clear=1)   # east to Rotmoor
    G.line([(af[0], af[1]), (250, 180), (272, 176), (rf[0] - 6, rf[1]), (rf[0], rf[1])], "=", 2, clear=1)     # Aurelm to Rotmoor
    # the old track to the sealed pass, off the Aurelm road
    G.line([(130, 166), (108, 170), (86, 164), (66, 154), (52, 150), (40, 150)], "=", 1, clear=1)
    # the sealed pass: a notch cut into the Crags' east face, the cave mouth at its head, south-facing
    for y in range(124, 141):                                              # a spur of the range, so the pass is cut into real rock
        for x in range(14, 50):
            if ((x - 14) / 36) ** 2 + ((y - 140) / 16) ** 2 <= 1 + (N2(x, y) - 0.5) * 0.3: G.set(x, y, "C")
    for y in range(141, 153):
        for x in range(28, 46):
            if G.get(x, y) in ("C", "r", "T", "b"): G.set(x, y, grass(rnd))
    for x in range(26, 48):
        if G.get(x, 140) != "C": G.set(x, 140, "C")
        if G.get(x, 139) != "C": G.set(x, 139, "C")
    G.set(35, 140, "O"); G.set(36, 140, "O")
    feats["pass"] = (35, 142)

    # ---------------- places
    def clear_round(cx, cy, r, ry=None):
        ry = ry or r * 0.7
        for y in range(int(cy - ry - 1), int(cy + ry + 2)):
            for x in range(int(cx - r - 1), int(cx + r + 2)):
                if ((x - cx) / r) ** 2 + ((y - cy) / ry) ** 2 <= 1 and G.get(x, y) in set("Tbrk"):
                    G.set(x, y, grass(rnd))

    def sign(x, y, *lines):
        G.set(x, y, "S"); signs[(x, y)] = list(lines)

    def chest(x, y, cid):
        props.append({"p": "chest", "x": x, "y": y, "id": cid}); G.set(x, y, "."); chests.append((x, y))

    def pillar(pid, tx, ty):
        clear_round(tx + 1, ty, 6, 4)
        for x in (tx, tx + 1): G.set(x, ty, "P")
        feats["pillar_" + pid] = (tx, ty + 1)
        pillars.append({"id": pid, "tx": tx, "ty": ty, "r": 5})

    def camp(cx, cy, r, kit, cid=None, banner=None):
        clear_round(cx, cy, r + 3, r + 1); camps.append({"x": cx, "y": cy, "r": r})
        for p, dx, dy in kit: props.append({"p": p, "x": cx + dx, "y": cy + dy})
        if cid: chest(cx + r, cy + 1, cid)
        if banner: props.append({"p": banner, "x": cx - 1, "y": cy - r})

    # the way in from the plains: a waystation where the South Road comes down, and the first Pillar
    sign(39, 4, "North: the Plains of Etharis, and Ashford.", "South: Stonebridge. East: Verrin, seat of the Covenant in the south.")
    pillar("eth_gate", 42, 12)
    feats["entry"] = (36, 2)
    sign(58, 41, "The Pale Road.", "East: Verrin. South: Stonebridge, and the Crags.")
    # Stonebridge's Pillar on the green before its gate; its stone bridge is where the road crosses the river
    pillar("stonebridge", 74, 89)
    sign(sf[0] + 3, sf[1] - 1, "Stonebridge.", "A Covenant village. Keep to the road after dark.")
    # Verrin's gate square, banners and lamps, and the Pillar on the square
    clear_round(vf[0], vf[1] + 3, 9, 4)
    pillar("verrin", vf[0] + 9, vf[1] + 3)
    for (dx, p) in ((-4, "banner"), (5, "banner"), (-6, "lamp"), (7, "lamp")):
        props.append({"p": p, "x": vf[0] + dx, "y": vf[1] - 1})
    sign(vf[0] - 7, vf[1] + 1, "Verrin.", "By the grace of the Archon Covenant. Present your papers at the gate.")
    # Millhaven's green
    pillar("millhaven", mf[0] + 9, mf[1] - 2)
    sign(mf[0] - 4, mf[1] - 1, "Millhaven.", "North: Verrin. West: Stonebridge. South: Aurelm. East: Rotmoor, and no further.")
    # Aurelm's gate square
    clear_round(af[0], af[1] - 3, 9, 4)
    pillar("aurelm", af[0] + 9, af[1] - 5)
    for (dx, p) in ((-4, "banner"), (5, "banner"), (-6, "lamp"), (7, "lamp")):
        props.append({"p": p, "x": af[0] + dx, "y": af[1] + 1})
    sign(af[0] - 7, af[1] - 1, "Aurelm.", "The Covenant keeps the south. The Covenant keeps the Vault.")
    # Rotmoor: a Pillar half-choked, burned houses, a graveyard dug up
    pillar("rotmoor", rf[0] + 9, rf[1] - 4)
    sign(rf[0] - 4, rf[1] - 1, "Rotmoor.", "Someone has scratched beneath the name: TURN BACK.")
    # the Capital Road's Pillar, and the sign at the Capital Gate
    pillar("capital_road", 300, 46)
    sign(331, 8, "The Capital Gate.", "Sealed by order of the Archon Covenant. Passage by letter only.")
    sign(vf[0] + 14, vf[1] + 6, "North-east: the Capital Road. South: Millhaven.")
    # the sealed pass
    sign(42, 149, "The old way into the Western Crags.", "Sealed by the Covenant. Rockfall, and worse.")
    # Unbound camps, off the roads, careful and hidden: lean-tos, a cold fire, their mark
    UKIT = [("leanto", -3, -2), ("firepit", 0, 0), ("crate", 3, -2), ("barrel", -4, 1)]
    for i, (cx, cy) in enumerate([(122, 84), (228, 122), (84, 172), (300, 102), (152, 206), (270, 206)]):
        camp(cx, cy, 3, UKIT, cid=f"c3_unb{i}", banner="ubanner")
        feats[f"unbound{i}"] = (cx, cy + 2)
    # Purifier marks along the roads: a burned wagon, a pyre, a stake
    for i, (cx, cy) in enumerate([(150, 63), (284, 48), (190, 108), (250, 146)]):
        clear_round(cx, cy + 3, 5, 3.5)
        props += [{"p": "firepit", "x": cx, "y": cy + 3, "lk": "pyre"}, {"p": "bones", "x": cx + 1, "y": cy + 4}, {"p": "wagon", "x": cx - 3, "y": cy + 2}]
        feats[f"pyre{i}"] = (cx + 1, cy + 5)
    # a ruined watchtower on the Northern Fields, and a shrine by the Mere
    clear_round(124, 36, 6, 4)
    for (x, y) in [(121, 33), (122, 33), (123, 33), (121, 34), (123, 34), (121, 35), (127, 37), (128, 37)]:
        G.set(x, y, "#")
    chest(124, 36, "c3_tower")
    feats["tower"] = (124, 38)
    clear_round(206, 168, 5, 3)
    props.append({"p": "shrine", "x": 206, "y": 168})
    chest(209, 169, "c3_mere")
    feats["mere"] = (206, 170)
    # Rotmoor's graveyard, dug up, east of the village
    clear_round(336, 186, 7, 5)
    for k in range(9):
        G.set(332 + (k % 3) * 3, 183 + (k // 3) * 2, "r")
    GRAVEYARDS.append((331, 182, 339, 188))
    feats["graves"] = (336, 190)
    # ---------------- the curse: growths too thick to pass, where it runs deepest
    for y in range(4, H - 4):
        for x in range(4, W - 4):
            if curse[y][x] > 0.62 and G.get(x, y) in set(".,*") and rnd.random() < 0.02:
                if all(G.get(x + dx, y + dy) not in ("=", "S", "P", "F", "H", "R", "W", "w", "~") for dx in range(-2, 3) for dy in range(-2, 3)):
                    G.set(x, y, "k")
            elif curse[y][x] > 0.5 and G.get(x, y) == "b":
                G.set(x, y, "T")                                                     # scrub gone to dead wood
    # herbs, off the road and out of the curse
    for i in range(30):
        for _ in range(80):
            x, y = rnd.randrange(6, W - 6), rnd.randrange(6, H - 6)
            if G.get(x, y) in set(".,*") and curse[y][x] < 0.4 and all(G.get(x + dx, y + dy) not in ("=", "S", "#", "P", "F") for dx in (-2, 0, 2) for dy in (-2, 0, 2)):
                props.append({"p": "herbpatch", "x": x, "y": y, "id": f"p3_h{i}"}); break
    for p in props:
        if G.get(p["x"], p["y"]) in SOLID: G.set(p["x"], p["y"], ".")
    rows = ["".join(r) for r in G.g]

    # ---------------- reachability from the way in
    blocked = set()
    for p in props:
        fw = {"leanto": 2, "deadlog": 2, "wagon": 2}.get(p["p"], 1)
        if p["p"] not in ("herbpatch", "candles", "bones"):
            for i in range(fw): blocked.add((p["x"] + i, p["y"]))
    rs = [r.replace("O", ".") for r in rows]
    R = reach([r for r in rs], (36, 1), blocked)
    bad = [f"{name} {xy}" for name, xy in feats.items() if xy not in R]
    if bad: print("UNREACHABLE", bad)
    globals()["_BAD"] = bad
    for (x, y) in chests:
        if not any((x + dx, y + dy) in R for dx, dy in ((0, 1), (1, 0), (-1, 0), (0, -1))): print("chest cut off", x, y)
    for k, t in towns.items():
        for x in range(t["gx"], t["gx"] + t["gw"]):
            if (x, t["gy"]) not in R: print("gate unreachable", k, x, t["gy"])

    # ---------------- foes (placeholders from the Act 2 roster until the Act 3 foes are drawn): by band, Day or Night
    safe = [(36, 1)] + [t["front"] for t in towns.values()] + [(p["tx"], p["ty"]) for p in pillars]
    def free(x, y, rr=11): return all(math.hypot(x - a, y - b) >= rr for a, b in safe)
    def wooded(x, y): return sum(rows[y + dy][x + dx] in "TC" for dx in range(-3, 4) for dy in range(-3, 4) if 0 <= x + dx < W and 0 <= y + dy < H) > 14
    def groups(x, y, night):
        c = curse[y][x]
        if c > 0.6: return [["cbear"], ["cseer", "chorn"], ["cooze", "cspike", "cspike"], ["cgrub", "chorn"], ["skelW", "cseer"], ["cbear", "cspike"]]
        if c > 0.3: return [["chorn", "chorn"], ["cooze", "cseer"], ["skelW", "skelA"], ["purburner", "pscout"]] if night else [["cgrub", "cspike"], ["cooze"], ["roadbrute", "roadknife"], ["chorn"]]
        if wooded(x, y): return [["crwolf", "crwolf"], ["crwolf"]] if not night else [["crwolf", "crwolf", "crwolf"]]
        if night: return [["pscout", "purburner"], ["purburner", "pscout", "pscout"]]
        return [["roadknife", "roadbow"], ["roadbrute", "roadknife"], ["roadbow", "roadbow"], ["boar"], ["roadknife", "roadknife", "roadbow"]]
    wild = []
    for i in range(130):
        for _ in range(80):
            x, y = rnd.randrange(6, W - 6), rnd.randrange(6, H - 6)
            if rows[y][x] in set(".,*") and (x, y) in R and free(x, y) and all(math.hypot(x - g["x"], y - g["y"]) > 10 for g in wild):
                night = i % 4 == 3
                wild.append({"x": x, "y": y, "group": rnd.choice(groups(x, y, night)), "when": "night" if night else "day"}); break
    for i, (cx, cy) in enumerate([(150, 63), (284, 48), (190, 108), (250, 146)]):     # Purifier cells keep their pyres
        wild.append({"x": cx + 2, "y": cy + 6, "group": ["purbrand", "purburner", "pscout"] if i % 2 else ["purburner", "pscout"]})
    # ---------------- the Covenant and the Purifiers at each other's throats on the roads: six clashes the party can join
    CLASHES.clear()
    taken = [(g["x"], g["y"]) for g in wild]
    for i, (tx, ty) in enumerate([(110, 50), (290, 45), (190, 95), (90, 165), (180, 180), (275, 160)]):
        best = None
        for r in range(0, 30):
            for dy in range(-r, r + 1):
                for dx in range(-r, r + 1):
                    x, y = tx + dx, ty + dy
                    if 0 <= x < W and 0 <= y < H and rows[y][x] == "=" and (x, y) in R and 8 <= x % CW <= CW - 9 and 6 <= y % CH <= CH - 7 and free(x, y, 9):
                        best = (x, y); break
                if best: break
            if best: break
        assert best, ("no road for clash", i)
        x, y = best
        def spot(cx, cy):
            for rr in range(0, 4):
                for ddy in range(-rr, rr + 1):
                    for ddx in range(-rr, rr + 1):
                        p = (cx + ddx, cy + ddy)
                        if rows[p[1]][p[0]] in ".,*=" and p in R and p not in used: used.add(p); return p
        used = {(x, y)}
        cov = [spot(x - 3, y - 1), spot(x - 3, y + 1)]; pur = [spot(x + 3, y - 1), spot(x + 3, y + 1), spot(x + 4, y)]
        props.append({"p": "firepit", "x": x + 1, "y": y - 2, "lk": "clashfire"})
        CLASHES.append({"id": i, "x": x, "y": y, "cov": cov, "pur": pur})
        for g in list(wild):
            if math.hypot(g["x"] - x, g["y"] - y) < 8: wild.remove(g)
    # the Unbound camps: who sits at each fire, and where a stranger is first seen coming
    UNBS.clear()
    occ = {(p["x"] + i, p["y"]) for p in props for i in range({"leanto": 2, "wagon": 2}.get(p["p"], 1))}
    for i, (cx, cy) in enumerate([(122, 84), (228, 122), (84, 172), (300, 102), (152, 206), (270, 206)]):
        sp = [(cx + dx, cy + dy) for dy in (1, -1, 2, 0) for dx in (-1, 1, 2, -2) if rows[cy + dy][cx + dx] in ".,*=" and (cx + dx, cy + dy) not in occ and (cx + dx, cy + dy) in R]
        assert len(sp) >= 2, ("unbound camp crowded", i)
        UNBS.append({"id": i, "x": cx, "y": cy, "npc": [sp[0], sp[-1]]})
        for g in list(wild):
            if math.hypot(g["x"] - cx, g["y"] - cy) < 8: wild.remove(g)
    return rows, curse, props, signs, pillars, wild, camps, towns


def cut(rows, curse, props, signs, pillars, wild, camps, towns):
    out = {}
    def owner(x, y):
        if 0 <= x < W and 0 <= y < H: return sec_id(x // CW, y // CH)
    for cy in range(H // CH):
        for cx in range(W // CW):
            k = sec_id(cx, cy); x0, y0 = cx * CW, cy * CH; x1, y1 = x0 + CW, y0 + CH
            loc = lambda o: {**o, "x": o["x"] - x0, "y": o["y"] - y0}
            out[k] = {
                "name": "Southern Etharis: " + NAMES[cy][cx], "outside": True, "wild_zone": True, "south": True, "lru": True,
                "ox": x0, "oy": y0,
                "rows": [r[x0:x1] for r in rows[y0:y1]],
                "curse": ["".join(str(min(9, int(round(curse[y][x] * 9)))) for x in range(x0, x1)) for y in range(y0, y1)],
                "props": [loc(p) for p in props if owner(p["x"], p["y"]) == k],
                "signs": {f"{x - x0},{y - y0}": v for (x, y), v in signs.items() if owner(x, y) == k},
                "pillars": [{**p, "tx": p["tx"] - x0, "ty": p["ty"] - y0} for p in pillars if owner(p["tx"], p["ty"]) == k],
                "wild": [loc(g) for g in wild if owner(g["x"], g["y"]) == k],
                "camps": [loc(c) for c in camps if owner(c["x"], c["y"]) == k],
                "paveZones": [[a - x0, b - y0, c - x0, d - y0, st] for (a, b, c, d, st) in PAVE_ZONES if owner(a, b) == k],
                "bldKinds": {f"{int(a) - x0},{int(b) - y0}": v for a, b, v in ((*key.split(","), v) for key, v in BLD_KINDS.items()) if owner(int(a), int(b)) == k},
                "towns": [[a - x0, b - y0, c - x0, d - y0, n] for (a, b, c, d, n) in TOWN_RECTS if owner(a, b) == k or owner(c, d) == k],
                "warps": [],
                "triggers": [{"id": f"clash{c['id']}", "x": c["x"] - x0, "y": c["y"] - y0, "r": 5} for c in CLASHES if owner(c["x"], c["y"]) == k]
                            + ([{"id": "capgate", "x": 337 - x0, "y": 10 - y0, "r": 3}] if owner(337, 10) == k else [])
                            + [{"id": f"unb{u['id']}", "x": u["x"] - x0, "y": u["y"] - y0, "r": 7} for u in UNBS if owner(u["x"], u["y"]) == k],
            }
            for (a, b, c, d) in GRAVEYARDS:
                if owner(a, b) == k: out[k]["graveyard"] = {"x0": a - x0, "y0": b - y0, "x1": c - x0, "y1": d - y0}
    def walk(x, y): return 0 <= x < W and 0 <= y < H and rows[y][x] not in SOLID
    for k, d in out.items():
        x0, y0 = d["ox"], d["oy"]; x1, y1 = x0 + CW, y0 + CH
        for y in range(y0, y1):
            for (x, nx) in ((x0, x0 - 2), (x1 - 1, x1 + 1)):
                o = owner(nx, y)
                if 0 < x < W - 1 and o and o != k and walk(x, y) and walk(nx, y):
                    d["warps"].append({"x": x - x0, "y": y - y0, "to": o, "tx": nx - out[o]["ox"], "ty": y - out[o]["oy"], "dir": "left" if nx < x else "right"})
        for x in range(x0, x1):
            for (y, ny) in ((y0, y0 - 2), (y1 - 1, y1 + 1)):
                o = owner(x, ny)
                if 0 < y < H - 1 and o and o != k and walk(x, y) and walk(x, ny):
                    d["warps"].append({"x": x - x0, "y": y - y0, "to": o, "tx": x - out[o]["ox"], "ty": ny - out[o]["oy"], "dir": "up" if ny < y else "down"})
    # back to the plains: the road runs off the north edge, up to the Covenant checkpoint on the South Road
    for x in range(33, 40):
        if rows[0][x] == "=":
            out["eth00"]["warps"].append({"x": x, "y": 0, "to": "plainsSW", "tx": x, "ty": 56, "dir": "up"})
    # barred ways: the town gates (their maps are later builds), the Capital Gate, the sealed pass
    def bar(gx, gy, n, need, say, look, dr="up"):
        o = owner(gx, gy); d = out[o]
        for x in range(gx, gx + n):
            d["warps"].append({"x": x - d["ox"], "y": gy - d["oy"], "to": o, "tx": x - d["ox"], "ty": gy - d["oy"], "dir": dr,
                               "lock": {"need": need, "say": say}, "look": look})
    INSIDE = {"aurelm": ("au_out", 84, 85, 5), "rotmoor": ("rot", 27, 28, 4), "stonebridge": ("sb", 27, 28, 4), "verrin": ("ver_lo", 84, 85, 56), "millhaven": ("mh", 27, 28, 4)}
    INSIDE_LOCK = {"verrin": {"need": "q_sbwrit", "say": "A gate guard holds out a hand. \"Writ.\" You have none. \"Then you have no business in Verrin. Stonebridge's bailiff writes them. West along the road.\""}}     # towns whose insides are built: their gates lead in (map, x of the two gate tiles, row)
    for name, t in towns.items():
        if name in INSIDE:
            m, ax, bx, ay = INSIDE[name]; o = owner(t["gx"], t["gy"]); d = out[o]
            for i, x in enumerate(range(t["gx"], t["gx"] + t["gw"])):
                d["warps"].append({"x": x - d["ox"], "y": t["gy"] - d["oy"], "to": m, "tx": ax if i < t["gw"] / 2 else bx, "ty": ay, "dir": "down" if t["gate"] == "n" else "up", **({"lock": INSIDE_LOCK[name]} if name in INSIDE_LOCK else {})})
            continue
        title = name.capitalize() if name != "stonebridge" else "Stonebridge"
        bar(t["gx"], t["gy"], t["gw"], f"open_{name}", f"{title}'s gate is shut. ({title} opens in a later build.)", "towngate3", "down" if t["gy"] < t["front"][1] + 3 and t["front"][1] < t["gy"] + 3 and t["gate"] == "n" else "up")
    bar(336, 5, 4, "act4_open", "The Capital Gate is sealed. The guards will not lift the bar without a letter of passage.", "capgate")
    for wp in out["eth30"]["warps"]:
        if wp.get("look") == "capgate": wp["lock"]["alt"] = {"flag": "act3_end", "say": "The guards stand aside for the Vaultwarden's letter. The Capital Road runs on north-east. (Act Four opens in a later build.)"}
    for i, x in enumerate((35, 36)):      # the old way into the Crags: walled until the Vaultwarden's order, then the tunnel
        d = out["eth01"]
        d["warps"].append({"x": x - d["ox"], "y": 141 - d["oy"], "to": "cr_tunnel", "tx": 47 + i, "ty": 12, "dir": "up", "look": "pass", "sealedUntil": "crags_open",
                           "lock": {"need": "crags_open", "say": "The way into the Crags is walled up with fresh stone, stamped with the Covenant's seal."}})
    return out


if __name__ == "__main__":
    rows, curse, props, signs, pillars, wild, camps, towns = main()
    maps = cut(rows, curse, props, signs, pillars, wild, camps, towns)
    js = ["/* Southern Etharis (Act 3), generated by concept/etharis.py: one 360 x 240 map cut into twelve joined 90 x 80 sections.",
          "   Edit the generator, not this file. */"]
    for k, d in maps.items():
        js.append(f"MAP_DEFS.{k} = {json.dumps(d, separators=(',', ':'))};")
    js.append("const ETH_UNBOUND = " + json.dumps([{**u, "map": f"eth{u['x'] // CW}{u['y'] // CH}", "ox": (u["x"] // CW) * CW, "oy": (u["y"] // CH) * CH} for u in UNBS], separators=(",", ":")) + ";")
    js.append("const ETH_CLASHES = " + json.dumps([{**c, "map": f"eth{c['x'] // CW}{c['y'] // CH}", "ox": (c["x"] // CW) * CW, "oy": (c["y"] // CH) * CH} for c in CLASHES], separators=(",", ":")) + ";")
    src = "\n".join(js) + "\n"
    open(OUT, "w").write(src)
    print("bytes", len(src))
    for k, d in maps.items():
        print(k, d["name"], "props", len(d["props"]), "wild", len(d["wild"]), "warps", len(d["warps"]), "pillars", [p["id"] for p in d["pillars"]])
    from PIL import Image, ImageDraw
    col = {".": (70, 96, 60), ",": (64, 90, 56), "*": (80, 104, 66), "=": (150, 126, 90), "~": (50, 80, 110), "B": (120, 90, 56), "T": (30, 52, 34), "b": (46, 70, 44), "r": (110, 110, 116),
           "S": (230, 210, 150), "#": (150, 150, 156), "C": (96, 92, 88), "O": (20, 16, 14), "F": (70, 66, 70), "H": (200, 160, 60), "R": (150, 80, 60), "W": (110, 90, 70), "w": (200, 180, 90),
           "k": (150, 40, 80), "P": (120, 230, 220)}
    im = Image.new("RGB", (W, H))
    for y in range(H):
        for x in range(W):
            c = col.get(rows[y][x], (255, 0, 255)); a = curse[y][x]
            rot = (70, 44, 64)
            t = max(0, min(1, (a - 0.25) / 0.6)) * 0.75
            im.putpixel((x, y), tuple(int(v + (q - v) * t) for v, q in zip(c, rot)))
    for g in wild: im.putpixel((g["x"], g["y"]), (230, 40, 40) if g.get("when") != "night" else (160, 70, 230))
    for p in props:
        if p["p"] == "chest": im.putpixel((p["x"], p["y"]), (255, 220, 0))
    im = im.resize((W * 4, H * 4), Image.NEAREST); dr = ImageDraw.Draw(im)
    for gx in range(CW, W, CW): dr.line([(gx * 4, 0), (gx * 4, H * 4)], fill=(255, 255, 255))
    for gy in range(CH, H, CH): dr.line([(0, gy * 4), (W * 4, gy * 4)], fill=(255, 255, 255))
    im.save(SCR + "etharis_overview.png")
    assert not _BAD, _BAD
