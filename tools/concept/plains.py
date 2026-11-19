"""Generates the Open Plains (Act 2) into src/parts/04e_plains.js.

The plains are planned as one 190 x 110 map (coordinates in the design doc are global tiles, x east, y south).
A single map that size bakes to a ground canvas larger than phone browsers allow, so the plains are generated
whole and then cut into four quarters, joined by walk-through warps along every open seam:
    plainsSW  x 0-99,   y 50-109   the Ashford road: the start, the farmstead, hunters, the river, the crossroads
    plainsSE  x 100-189, y 50-109  the eastern downs: the burned wagon, Rook's Hollow, the east forest trail
    plainsNW  x 0-99,   y 0-49     the heath: the ambush camp, the Greywick gate
    plainsNE  x 100-189, y 0-49    the frost road: the overlook, the frozen pond, the boundary stone
Deterministic: re-running gives the same maps. Every key spot is checked for a walkable route from the gate."""
import json, math, random
from collections import deque

SOLID = set("T~RWwfSPbr#ZXUYLKCg")
W, H = 190, 110
CUT_X, CUT_Y = 100, 50
BLD_KINDS = {}
PAVE_ZONES = [(44, 81, 77, 97, "ash"), (83, 17, 99, 31, "grey")]   # town streets drawn as paving: x0, y0, x1, y1, style   # "x,y" of a building's top-left -> its kind (how the bake dresses it); filled by main()


class Grid:
    def __init__(s, w, h, fill="."):
        s.w, s.h = w, h
        s.g = [[fill] * w for _ in range(h)]

    def get(s, x, y):
        return s.g[y][x] if 0 <= x < s.w and 0 <= y < s.h else None

    def set(s, x, y, c):
        if 0 <= x < s.w and 0 <= y < s.h:
            s.g[y][x] = c

    def disc(s, cx, cy, rx, ry, c, only=None, jag=0.0, rnd=None):
        for y in range(int(cy - ry - 1), int(cy + ry + 2)):
            for x in range(int(cx - rx - 1), int(cx + rx + 2)):
                k = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2
                lim = 1 + (rnd.uniform(-jag, jag) if rnd else 0)
                if k <= lim and (only is None or s.get(x, y) in only):
                    s.set(x, y, c)

    def line(s, pts, c, width=2, clear=0):
        """walk a polyline; paint c across `width` tiles and clear `clear` tiles of cover each side"""
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
            n = int(max(abs(x1 - x0), abs(y1 - y0)) * 2) + 1
            for i in range(n + 1):
                t = i / n
                x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
                for dy in range(-clear - width // 2, width - width // 2 + clear):
                    for dx in range(-clear - width // 2, width - width // 2 + clear):
                        tx, ty = int(round(x)) + dx, int(round(y)) + dy
                        inner = -(width // 2) <= dx < width - width // 2 and -(width // 2) <= dy < width - width // 2
                        cur = s.get(tx, ty)
                        if cur is None:
                            continue
                        if inner:
                            if cur == "~":
                                s.set(tx, ty, "B")
                            elif cur not in ("B", "P"):
                                s.set(tx, ty, c)
                        elif cur in "Tbr":
                            s.set(tx, ty, ".")


def reach(rows, start, blocked=()):
    h, w = len(rows), len(rows[0])
    seen = {start}
    q = deque([start])
    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in seen and rows[ny][nx] not in SOLID and (nx, ny) not in blocked:
                seen.add((nx, ny)); q.append((nx, ny))
    return seen


def grass(rnd):
    v = rnd.random()
    return "." if v < 0.55 else ("," if v < 0.85 else "*")


def snow_at(y):
    """0 green, about .2 frosted, about .55 patchy snow, about .85 full snow (matches the bake's bands)"""
    return 0.85 if y < 24 else 0.55 if y < 46 else 0.2 if y < 66 else 0.0


def main():
    rnd = random.Random(2611)
    G = Grid(W, H)
    for y in range(H):
        for x in range(W):
            G.g[y][x] = grass(rnd)
    # the plains are open: copses, lone trees, scrub and rocks, thinning as the snow comes; a thick wild edge all round
    for y in range(H):
        for x in range(W):
            d = min(x, y, W - 1 - x, H - 1 - y)
            n = (math.sin(x * 0.13 + y * 0.07) + math.sin(x * 0.05 - y * 0.17) + math.sin((x - y) * 0.09)) / 3
            dens = 0.035 if snow_at(y) < 0.5 else 0.025
            if d < 2 or (d < 4 and rnd.random() < 0.55) or n > 0.62 or rnd.random() < dens:
                G.g[y][x] = "T"
            elif n > 0.5 and rnd.random() < 0.25:
                G.g[y][x] = "b"
    feats = {}

    # ---------------- water: a river north to south, and the frozen pond
    rx = 78
    for y in range(52, H):
        rx += rnd.choice((-1, 0, 0, 0, 1)) if y % 3 == 0 else 0
        rx = max(75, min(81, rx))
        for dx in range(3):
            G.set(rx + dx, y, "~")
    G.disc(78.5, 51.5, 2.6, 2, "~", jag=0.2, rnd=rnd)                      # the spring the river rises from
    G.disc(121, 18, 6, 3.4, "~", jag=0.15, rnd=rnd)                        # the frozen pond, just off the road

    # ---------------- roads
    main_path = [(0, 78), (3, 78), (22, 76), (44, 72), (70, 66), (92, 62), (108, 52), (114, 44), (128, 30), (140, 16), (150, 0)]
    G.line(main_path, "=", 3, clear=2)
    G.line([(44, 72), (52, 76), (58, 78)], "=", 2, clear=1)                 # Ashford spur
    G.line([(114, 44), (106, 38), (98, 32)], "=", 2, clear=1)               # Greywick spur
    south_road = [(30, 75), (32, 86), (35, 98), (37, 109)]                  # the South Road, to southern Etharis (Act 3)
    G.line(south_road, "=", 3, clear=2)
    trails = [
        [(22, 76), (18, 90), (14, 100), (14, 109)],                           # west forest
        [(92, 62), (120, 64), (150, 68), (189, 70)],                          # east forest
        [(92, 62), (93, 74), (92, 84)],                                       # standing stones
        [(130, 66), (131, 78), (130, 88)],                                    # Rook's Hollow
        [(22, 76), (25, 66), (28, 58)],                                       # hunters' camp
        [(70, 66), (66, 55), (61, 46)],                                       # ambush camp
        [(92, 62), (86, 60), (84, 59)],                                       # traders' camp
        [(128, 30), (134, 40), (140, 50)],                                    # Wayfarers' fire
    ]
    for t in trails:
        G.line(t, "=", 1, clear=1)

    # ---------------- places
    def clear_round(cx, cy, r, ry=None):
        ry = ry or r * 0.7
        for y in range(int(cy - ry - 1), int(cy + ry + 2)):
            for x in range(int(cx - r - 1), int(cx + r + 2)):
                if ((x - cx) / r) ** 2 + ((y - cy) / ry) ** 2 <= 1 and G.get(x, y) in set("Tbr"):
                    G.set(x, y, grass(rnd))
    props, signs, chests, camps = [], {}, [], []
    bld_kinds = BLD_KINDS; bld_kinds.clear()

    def sign(x, y, *lines):
        G.set(x, y, "S"); signs[(x, y)] = list(lines)

    def chest(x, y, cid):
        props.append({"p": "chest", "x": x, "y": y, "id": cid}); G.set(x, y, "."); chests.append((x, y))

    def pillar(pid, tx, ty):
        """a field Pillar: two tiles of stone with worn flags around; the stone itself is drawn by the bake"""
        clear_round(tx + 1, ty, 6, 4)
        for x in (tx, tx + 1):
            G.set(x, ty, "P")
        feats["pillar_" + pid] = (tx, ty)
        return {"id": pid, "tx": tx, "ty": ty, "r": 5}
    pillars = []

    # the gate from Oakhaven, and the first sign
    sign(5, 75, "West: Oakhaven.", "East: Ashford, and the outer provinces.")
    # ruined farmstead (34,74): broken walls, dead furrows, a cellar door
    clear_round(34, 72, 7, 5)
    for (x, y) in [(30, 69), (31, 69), (32, 69), (36, 69), (37, 69), (30, 70), (30, 71), (37, 70), (37, 72), (31, 73), (30, 73)]:
        G.set(x, y, "#")
    for (x, y) in [(33, 70), (35, 71), (34, 69)]:
        G.set(x, y, "r")
    for y in range(66, 69):
        for x in range(39, 44):
            G.set(x, y, "c")
    for x in range(39, 44):
        G.set(x, 65, "f")
    chest(34, 71, "c_farm")
    props += [{"p": "rubble", "x": 32, "y": 72, "lk": "farm"}, {"p": "bones", "x": 36, "y": 73}, {"p": "herbpatch", "x": 28, "y": 70, "id": "p_farm1"}, {"p": "herbpatch", "x": 41, "y": 70, "id": "p_farm2"}]
    feats["farm"] = (34, 74)
    # signpost at the Ashford turn, and Ashford's gate at the end of its spur
    sign(46, 70, "South-east: Ashford. A Pillar town, under the protection of the Covenant.", "North-east: the crossroads, Greywick and Fort Frostcrown.")
    clear_round(59, 79, 5, 4)
    # Ashford seen from outside: its north wall (three tiles thick, the gate in the middle), and the town behind it,
    # roofs and a chapel, with a street running south from the gate. Trees close the far side; the river the east.
    def wall(x0, x1, y0, y1):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                G.set(x, y, "F")
    def house(x0, x1, y0, y1, kind=None):
        """roof rows over one wall row along the bottom; windows every other tile"""
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                G.set(x, y, "W" if y == y1 and (x - x0) % 2 == 0 else "w" if y == y1 else "R")
        if kind: bld_kinds[f"{x0},{y0}"] = kind
    # Oakhaven's east gate, on the west edge: its wall runs north and south of the road with the backs of its houses
    # beyond, and the road passes through the gap (the warp at the very edge keeps the gate barred while it rebuilds)
    for y in range(60, 97):
        for x in range(0, 7):
            if not (77 <= y <= 79 and x <= 6): G.set(x, y, grass(rnd))
    wall(3, 4, 60, 75); wall(3, 4, 81, 96)
    for (x0, y0) in [(0, 61), (0, 66), (0, 71), (0, 82), (0, 87), (0, 92)]:
        house(x0, 2, y0, y0 + 2, "cottage")
    for y in (60, 65, 70, 75, 76, 80, 81, 86, 91, 96):
        for x in (0, 1, 2):
            if G.get(x, y) not in set("RWw"): G.set(x, y, "T" if y in (60, 96) else G.get(x, y))
    for (x, y) in [(6, 76), (6, 80)]:
        props.append({"p": "lamp", "x": x, "y": y})
    G.set(5, 75, "S")                                                         # the first sign stays by the gate
    for y in range(83, 99):
        for x in range(44, 78):
            G.set(x, y, grass(rnd) if y < 96 else "T")
    wall(44, 77, 80, 82)
    for x in (58, 59):
        for y in (80, 81, 82):
            G.set(x, y, "H")                                                  # the north gate, open by day
    wall(44, 46, 83, 97)                                                      # the west wall runs south to the woods
    for y in range(83, 96):
        for x in (57, 58, 59, 60):
            G.set(x, y, "=")                                                  # the street south from the gate
    for x in range(47, 77):
        G.set(x, 89, "=")                                                     # and the cross street
    for (x0, x1, y0, y1, k) in [(47, 50, 83, 85, "cottage"), (52, 55, 83, 85, "apoth"), (62, 65, 83, 85, "tailor"), (67, 70, 83, 85, "cottage"), (72, 76, 83, 85, "inn"),
                                (47, 51, 90, 93, "chapel"), (53, 55, 91, 93, "cottage"), (62, 67, 90, 93, "outpost"), (69, 72, 91, 93, "store"), (74, 76, 91, 93, "cooper")]:
        house(x0, x1, y0, y1, k)
    for y in range(83, 96):
        G.set(77, y, "T")
    for (x, y) in [(56, 79), (61, 79)]:
        props.append({"p": "banner", "x": x, "y": y})                        # the Covenant's banners either side of the gate
    for (x, y) in [(55, 79), (62, 79)]:
        props.append({"p": "lamp", "x": x, "y": y})
    sign(63, 79, "Ashford.", "Gate shut at dusk by order of the Curate.")
    feats["ashford_gate"] = (58, 79)
    # hunters' camp (28,56)
    clear_round(28, 56, 6, 4); camps.append({"x": 28, "y": 56, "r": 3})
    props += [{"p": "leanto", "x": 25, "y": 54}, {"p": "firepit", "x": 28, "y": 56}, {"p": "firewood", "x": 31, "y": 54}, {"p": "bones", "x": 30, "y": 58}, {"p": "barrel", "x": 26, "y": 57}]
    feats["hunters"] = (28, 58)
    # the bridge (78,65) and its patrol
    feats["bridge"] = (82, 65)
    # traders' roadside camp (84,58)
    clear_round(84, 58, 5, 3); camps.append({"x": 84, "y": 58, "r": 2})
    props += [{"p": "crate", "x": 82, "y": 56}, {"p": "crate", "x": 83, "y": 56}, {"p": "sack", "x": 86, "y": 56}, {"p": "barrel", "x": 87, "y": 57}, {"p": "firepit", "x": 85, "y": 59}]
    feats["traders"] = (84, 59)
    # crossroads (92,62): the watchtower ruin, a waystone shrine, signs, and a field Pillar
    clear_round(94, 60, 7, 5)
    for (x, y) in [(97, 56), (98, 56), (99, 56), (97, 57), (99, 57), (97, 58)]:
        G.set(x, y, "#")
    sign(90, 60, "The crossroads.", "North-east: Greywick and Fort Frostcrown. East: the eastern woods.", "South: the old standing stones. West: Ashford and Oakhaven.")
    pillars.append(pillar("crossroads", 94, 58))
    # standing stones (92,86): a ring, the cache in the middle; the golem wakes when it is taken
    clear_round(92, 86, 7, 5)
    for k in range(10):
        a = k / 10 * math.tau
        G.set(int(round(92 + 5 * math.cos(a))), int(round(86 + 3.4 * math.sin(a))), "r")
    G.set(92, 89, ".")    # a gap in the ring where the trail comes in
    chest(92, 86, "c_stones")
    feats["stones"] = (92, 87)
    # the hidden Purifier camp (72,88), in a fold of the plains: no trail, ringed by scrub
    clear_round(70, 88, 6, 4); camps.append({"x": 70, "y": 88, "r": 3})
    for k in range(16):
        a = k / 16 * math.tau
        x, y = int(round(70 + 8 * math.cos(a))), int(round(88 + 5.5 * math.sin(a)))
        if G.get(x, y) in set(".,*") and k % 4:
            G.set(x, y, "b")
    props += [{"p": "leanto", "x": 67, "y": 86}, {"p": "firepit", "x": 70, "y": 88}, {"p": "crate", "x": 73, "y": 86}, {"p": "candles", "x": 72, "y": 90}, {"p": "barrel", "x": 66, "y": 89}]
    chest(74, 89, "c_pcamp")
    feats["pcamp"] = (70, 89)
    # west forest trail-head: a Pillar at the treeline, and the way into the wood (the forest itself is a later build)
    pillars.append(pillar("wforest", 17, 100))
    sign(16, 106, "The West Light Forest. Old Weaver ruins lie deep in it.", "Wolves after dark. Keep to the trail.")
    feats["wforest"] = (14, 104)
    # the South Road ends at a Covenant barricade on the edge of the plains, until Act Three opens it
    # a gap is left where the road runs through: the Covenant's guard post holds it, and turns travellers back until Act Three
    for x in range(29, 45):
        if G.get(x, 107) in set("=.,*") and not 34 <= x <= 39: G.set(x, 107, "Z")
    props += [{"p": "sentry", "x": 33, "y": 105}, {"p": "banner", "x": 40, "y": 106}]
    sign(40, 104, "South: the Etharis road, to the southern provinces.", "Closed by order of the Covenant until the roads are safe.")
    feats["south_road"] = (36, 104)
    # burned wagon (108,52): a Purifier mark
    clear_round(108, 54, 5, 3)
    props += [{"p": "firepit", "x": 108, "y": 54, "lk": "wagon"}, {"p": "crate", "x": 106, "y": 55}, {"p": "barrel", "x": 110, "y": 53}, {"p": "bones", "x": 109, "y": 56}]
    chest(111, 55, "c_wagon")
    feats["wagon"] = (107, 55)
    # Rook's Hollow (130,90): a sunken bandit camp
    clear_round(130, 90, 8, 5); camps.append({"x": 130, "y": 90, "r": 4})
    for k in range(18):
        a = k / 18 * math.tau
        x, y = int(round(130 + 10 * math.cos(a))), int(round(90 + 6.5 * math.sin(a)))
        if G.get(x, y) in set(".,*") and k not in (13, 14):
            G.set(x, y, "f" if k % 3 else "r")
    props += [{"p": "leanto", "x": 126, "y": 87}, {"p": "leanto", "x": 133, "y": 87}, {"p": "firepit", "x": 130, "y": 90}, {"p": "crate", "x": 135, "y": 92}, {"p": "barrel", "x": 125, "y": 92}, {"p": "sack", "x": 127, "y": 93}]
    chest(134, 93, "c_rook")
    feats["rook"] = (130, 92)
    # east forest trail-head: a Pillar, and the way into the wood (a later build)
    pillars.append(pillar("eforest", 176, 67))
    sign(183, 67, "The eastern woods. The coast road lies beyond.", "Bandit country. Travellers go armed, or go another way.")
    feats["eforest"] = (182, 70)
    # Wayfarers' fire (140,52): a ring of stones, nobody here by day
    clear_round(140, 52, 5, 3); camps.append({"x": 140, "y": 52, "r": 2})
    props += [{"p": "firepit", "x": 140, "y": 52, "lk": "wayfire"}, {"p": "deadlog", "x": 137, "y": 54}, {"p": "deadlog", "x": 142, "y": 50}]
    feats["wayfire"] = (140, 54)
    # ambush camp (60,44)
    clear_round(60, 44, 7, 4); camps.append({"x": 60, "y": 44, "r": 3})
    props += [{"p": "leanto", "x": 57, "y": 42}, {"p": "firepit", "x": 60, "y": 44}, {"p": "crate", "x": 63, "y": 42}, {"p": "barrel", "x": 64, "y": 43}]
    chest(62, 41, "c_ambush")
    feats["ambush"] = (60, 46)
    # Greywick's gate at the end of its spur
    clear_round(97, 31, 5, 4)
    # Greywick seen from outside: a lower, older wall with its gate hanging open, the fronts of its houses over it,
    # and the forest at its back. The town keeps to the west of the quarter seam (x 100).
    for y in range(17, 28):
        for x in range(83, 100):
            G.set(x, y, grass(rnd) if y > 18 else "T")
    for y in range(17, 31):
        for x in range(100, 104):
            if y < 28: G.set(x, y, "T")
    wall(83, 103, 28, 30)
    for x in (96, 97, 98):
        for y in (28, 29, 30):
            G.set(x, y, "H")
    wall(83, 84, 19, 27)
    for y in range(19, 28):
        for x in (96, 97, 98):
            G.set(x, y, "=")                                                  # the high street, through the gate
    for (x0, x1, y0, y1, k) in [(86, 89, 20, 22, "boarded"), (91, 94, 19, 22, "lamphouse"), (86, 88, 24, 26, "shack"), (90, 94, 24, 26, "inn")]:
        house(x0, x1, y0, y1, k)
    for (x, y) in [(95, 31), (99, 31)]:
        props.append({"p": "ubanner", "x": x, "y": y})
    sign(100, 31, "Greywick.", "Someone has painted over the Covenant's mark on this sign.")
    feats["greywick_gate"] = (97, 32)
    # overlook hill (114,44): the first view of the snow, a cache and a field Pillar at the Greywick turn
    clear_round(116, 42, 6, 4)
    for (x, y) in [(119, 39), (120, 40), (121, 42), (112, 39)]:
        G.set(x, y, "r")
    pillars.append(pillar("overlook", 117, 40))
    chest(121, 44, "c_overlook")
    sign(111, 46, "The Greywick road turns west here.", "North: Fort Frostcrown.")
    feats["overlook"] = (115, 43)
    # frozen pond (134,22) is already water; the snow pass turns it to ice
    feats["pond"] = (121, 23)
    # Covenant boundary stone (146,6) and the patrol; the Outskirts road beyond is a later build
    G.set(146, 6, "r")
    sign(147, 7, "Here ends the Plains of Etharis.", "Beyond lies the Frostcrown March, held for the Archon Covenant.")
    for x in range(146, 152):                                                # the March road, open now: on to the Outskirts
        G.set(x, 1, "=")
    feats["boundary"] = (148, 9)
    # mile markers about every 25 tiles along the main road, counting down to the Fort
    walked, last = 0.0, None
    for (x0, y0), (x1, y1) in zip(main_path, main_path[1:]):
        seg = math.hypot(x1 - x0, y1 - y0)
        for i in range(int(seg)):
            t = i / seg; x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
            walked += 1
            if walked > 20 and int(walked) % 26 == 0 and 8 < x < 186 and 6 < y < 104:
                mx, my = int(round(x)) + 2, int(round(y)) - 2
                if G.get(mx, my) in set(".,*Tb"):
                    left = max(1, round((200 - walked) / 25))
                    sign(mx, my, f"A mile-stone, worn smooth. Fort Frostcrown: {left} {'league' if left == 1 else 'leagues'}.")
    # scattered herbs, off the road
    for i in range(26):
        for _ in range(60):
            x, y = rnd.randrange(6, W - 6), rnd.randrange(30, H - 6)
            if G.get(x, y) in set(".,*") and all(G.get(x + dx, y + dy) not in ("=", "S", "#", "P") for dx in (-2, 0, 2) for dy in (-2, 0, 2)):
                props.append({"p": "herbpatch", "x": x, "y": y, "id": f"p_h{i}"}); break
    for p in props:
        if G.get(p["x"], p["y"]) in SOLID:
            G.set(p["x"], p["y"], ".")
    rows = ["".join(r) for r in G.g]

    # ---------------- reachability: every place from the Oakhaven gate
    blocked = set()
    for p in props:
        fw = {"rubble": 2, "leanto": 2, "deadlog": 2}.get(p["p"], 1)
        if p["p"] not in ("herbpatch", "candles", "bones"):
            for i in range(fw):
                blocked.add((p["x"] + i, p["y"]))
    r = reach(rows, (1, 78), blocked)
    for name, xy in feats.items():
        if name.startswith("pillar_"):
            tx, ty = xy; xy = (tx, ty + 1)
        assert xy in r, f"plains: {name} {xy} not reachable"
    for (x, y) in chests:
        assert any((x + dx, y + dy) in r for dx, dy in ((0, 1), (1, 0), (-1, 0), (0, -1))), f"chest {x},{y} cut off"

    # ---------------- foes: by band, Day or Night, never within 12 tiles of the gate, a town or a Pillar
    safe = [(1, 78), (58, 79), (97, 32)] + [(p["tx"], p["ty"]) for p in pillars] + [feats["hunters"], feats["traders"], feats["wayfire"], feats["bridge"]]
    def free(x, y, rr=12):
        return all(math.hypot(x - a, y - b) >= rr for a, b in safe)
    def band_foes(y, night):
        s = snow_at(y)
        if night:
            return [["pscout"], ["pscout", "pscout"]] if s < 0.5 else [["pscout", "rslime"], ["fslime", "fslime"]]
        if s == 0:
            return [["mslime", "mslime"], ["boar"], ["cutpurse"], ["rat", "rat", "rat"], ["mslime", "boar"]]
        if s < 0.5:
            return [["fslime", "rat"], ["boar", "boar"], ["thug", "cutpurse"], ["archer", "cutpurse"], ["rat", "rat", "rat"]]
        if s < 0.8:
            return [["rslime", "fslime"], ["thug", "archer"], ["boar"], ["archer", "archer"]]
        return [["fslime", "fslime"], ["fslime", "rslime"], ["boar", "boar"]]
    wild = []
    for i in range(46):
        for _ in range(80):
            x, y = rnd.randrange(6, W - 6), rnd.randrange(6, H - 6)
            if rows[y][x] in set(".,*") and (x, y) in r and free(x, y) and all(math.hypot(x - g["x"], y - g["y"]) > 9 for g in wild):
                night = i % 4 == 3
                wild.append({"x": x, "y": y, "group": rnd.choice(band_foes(y, night)), "when": "night" if night else "day"}); break
    # camps and guardians (bosses stay down once beaten)
    wild += [
        {"x": 60, "y": 45, "group": ["captain", "cutpurse", "archer"]},
        {"x": 56, "y": 47, "group": ["cutpurse", "cutpurse"], "when": "day"},
        {"x": 130, "y": 91, "group": ["rook", "thug", "archer"]},
        {"x": 126, "y": 84, "group": ["thug", "cutpurse"]}, {"x": 136, "y": 95, "group": ["archer", "archer"]},
        {"x": 70, "y": 89, "group": ["pleader", "pscout", "pscout"], "when": "night"},
        {"x": 92, "y": 92, "group": ["golem"], "need": "stones_taken"},
        {"x": 88, "y": 87, "group": ["skelW", "skelS"], "when": "night"}, {"x": 96, "y": 89, "group": ["skelA", "skelW"], "when": "night"},
    ]
    return rows, props, signs, pillars, wild, camps


def cut(rows, props, signs, pillars, wild, camps):
    quarters = {
        "plainsSW": (0, CUT_Y, CUT_X, H, "Open Plains: the Ashford Road"),
        "plainsSE": (CUT_X, CUT_Y, W, H, "Open Plains: the Eastern Downs"),
        "plainsNW": (0, 0, CUT_X, CUT_Y, "Open Plains: the Heath"),
        "plainsNE": (CUT_X, 0, W, CUT_Y, "Open Plains: the Frost Road"),
    }
    def owner(x, y):
        for k, (x0, y0, x1, y1, _) in quarters.items():
            if x0 <= x < x1 and y0 <= y < y1:
                return k
    out = {}
    for k, (x0, y0, x1, y1, name) in quarters.items():
        sub = [r[x0:x1] for r in rows[y0:y1]]
        loc = lambda o: {**o, "x": o["x"] - x0, "y": o["y"] - y0}
        d = {
            "name": name, "outside": True, "wild_zone": True, "plains": True, "snowY0": y0,
            "rows": sub,
            "props": [loc(p) for p in props if owner(p["x"], p["y"]) == k],
            "signs": {f"{x - x0},{y - y0}": v for (x, y), v in signs.items() if owner(x, y) == k},
            "pillars": [{**p, "tx": p["tx"] - x0, "ty": p["ty"] - y0} for p in pillars if owner(p["tx"], p["ty"]) == k],
            "wild": [loc(g) for g in wild if owner(g["x"], g["y"]) == k],
            "camps": [loc(c) for c in camps if owner(c["x"], c["y"]) == k],
            "paveZones": [[a - x0, b - y0, c - x0, d - y0, st] for (a, b, c, d, st) in PAVE_ZONES if owner(a, b) == k],
            "bldKinds": {f"{int(a) - x0},{int(b) - y0}": v for a, b, v in ((*key.split(","), v) for key, v in BLD_KINDS.items()) if owner(int(a), int(b)) == k},
            "warps": [],
        }
        out[k] = d
    # seams: walking off one quarter's edge steps into the next, two tiles further on
    def walk(x, y):
        return 0 <= x < W and 0 <= y < H and rows[y][x] not in SOLID
    for k, (x0, y0, x1, y1, _) in quarters.items():
        d = out[k]
        for y in range(y0, y1):
            for (x, nx) in ((x0, x0 - 2), (x1 - 1, x1 + 1)):
                if 0 < x < W - 1 and walk(x, y) and walk(nx, y) and owner(nx, y) and owner(nx, y) != k:
                    o = owner(nx, y); qx, qy = quarters[o][0], quarters[o][1]
                    d["warps"].append({"x": x - x0, "y": y - y0, "to": o, "tx": nx - qx, "ty": y - qy, "dir": "left" if nx < x else "right"})
        for x in range(x0, x1):
            for (y, ny) in ((y0, y0 - 2), (y1 - 1, y1 + 1)):
                if 0 < y < H - 1 and walk(x, y) and walk(x, ny) and owner(x, ny) and owner(x, ny) != k:
                    o = owner(x, ny); qx, qy = quarters[o][0], quarters[o][1]
                    d["warps"].append({"x": x - x0, "y": y - y0, "to": o, "tx": x - qx, "ty": ny - qy, "dir": "up" if ny < y else "down"})
    # the way home: the west edge of the Ashford road leads back to Oakhaven's east gate (shut while the town rebuilds)
    for y in (77, 78, 79):
        out["plainsSW"]["warps"].append({"x": 0, "y": y - CUT_Y, "to": "oak", "tx": 45, "ty": 18 if y < 79 else 19, "dir": "left",
                                         "lock": {"flag": "left_oak", "unless": "oak_rebuilt", "say": "The gate is barred from inside. A voice calls over it: \"Best come back later. The town needs rebuilding.\""}})
    # Greywick: through its gate at the end of the spur
    for x in (96, 97, 98):
        out["plainsNW"]["warps"].append({"x": x, "y": 31, "to": "gw", "tx": min(43, x - 54), "ty": 64, "dir": "up"})
    # the East Light Forest: the trail runs off the east edge into the wood
    for y in (69, 70, 71):
        out["plainsSE"]["warps"].append({"x": W - 1 - CUT_X, "y": y - CUT_Y, "to": "eforest", "tx": 1, "ty": y - 43, "dir": "right"})
    # the West Light Forest: the trail runs off the south edge into the wood
    for x in (13, 14):
        out["plainsSW"]["warps"].append({"x": x, "y": H - 1 - CUT_Y, "to": "wforest", "tx": x, "ty": 1, "dir": "down"})
    # the Frostcrown Outskirts: the road runs off the north edge
    for x in range(145, 154):
        if out["plainsNE"]["rows"][0][x - CUT_X] != "T":
            out["plainsNE"]["warps"].append({"x": x - CUT_X, "y": 0, "to": "os", "tx": min(51, max(46, x - CUT_X)), "ty": 58, "dir": "up"})
    # southern Etharis (Act 3): the South Road runs off the south edge, through the Covenant's guard post
    for x in range(30, 45):
        if out["plainsSW"]["rows"][H - 1 - CUT_Y][x] not in SOLID:
            out["plainsSW"]["warps"].append({"x": x, "y": H - 1 - CUT_Y, "to": "eth00", "tx": max(34, min(38, x)), "ty": 2, "dir": "down",
                                             "lock": {"need": "act2_end", "say": "A Covenant guard steps into the road. \"The south is closed. Nobody passes without the Arbitrator's leave.\""}})
    # Ashford: through its open gate at the end of the spur
    for x in (58, 59):
        out["plainsSW"]["warps"].append({"x": x, "y": 79 - CUT_Y, "to": "ash", "tx": x - 46, "ty": 3, "dir": "down"})
    return out


if __name__ == "__main__":
    rows, props, signs, pillars, wild, camps = main()
    maps = cut(rows, props, signs, pillars, wild, camps)
    js = ["/* The Open Plains, generated by concept/plains.py (one 190 x 110 map cut into four joined quarters) */"]
    for k, d in maps.items():
        js.append(f"MAP_DEFS.{k} = {json.dumps(d, separators=(',', ':'))};")
    open("/home/claude/durinn/src/parts/04e_plains.js", "w").write("\n".join(js) + "\n")
    for k, d in maps.items():
        print(k, len(d["rows"][0]), "x", len(d["rows"]), "props", len(d["props"]), "wild", len(d["wild"]), "warps", len(d["warps"]), "pillars", [p["id"] for p in d["pillars"]])
    # an overview of the whole plains, for checking
    from PIL import Image
    col = {".": (70, 96, 60), ",": (64, 90, 56), "*": (80, 104, 66), "=": (140, 118, 86), "~": (50, 80, 110), "B": (110, 80, 50), "T": (30, 52, 34), "b": (46, 70, 44), "r": (110, 110, 116),
           "S": (230, 210, 150), "#": (150, 150, 156), "c": (110, 96, 60), "f": (120, 90, 60), "Z": (160, 60, 40), "g": (200, 120, 40), "P": (120, 230, 220)}
    im = Image.new("RGB", (W, H))
    for y in range(H):
        for x in range(W):
            c = col.get(rows[y][x], (255, 0, 255)); s = snow_at(y)
            im.putpixel((x, y), tuple(int(v + (225 - v) * s * 0.7) for v in c))
    for g in wild:
        im.putpixel((g["x"], g["y"]), (220, 40, 40) if g.get("when") != "night" else (150, 60, 220))
    for p in props:
        if p["p"] == "chest": im.putpixel((p["x"], p["y"]), (255, 220, 0))
    im = im.resize((W * 5, H * 5), Image.NEAREST)
    from PIL import ImageDraw
    dr = ImageDraw.Draw(im)
    dr.line([(CUT_X * 5, 0), (CUT_X * 5, H * 5)], fill=(255, 255, 255)); dr.line([(0, CUT_Y * 5), (W * 5, CUT_Y * 5)], fill=(255, 255, 255))
    im.save("/tmp/claude-0/-home-claude/81f7a483-afca-5415-8c60-809b5595b3f8/scratchpad/plains_overview.png")
