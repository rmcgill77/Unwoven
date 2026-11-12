"""Elowyn (female hero) atlases, built from the craftpix Free Fantasy Chibi Female Sprites 'Knight' with the sword erased.
Writes elowyn_atlas.json: {"chars": {"elowyn": {...overworld...}}, "battle": {"elowyn": {...}}}"""
import base64, io, json, sys
import numpy as np
from PIL import Image
SC = 'assets/_extracted/fem/Knight/'
ROLES = ["skin","skinD","hairA","hairB","hairD","hairHi","outL","out","backA","backHL","eye0","eye1","eye2","eye3","eye4","in","inD"]
RI = {r: i + 1 for i, r in enumerate(ROLES)}
FAC = 14
hx = lambda h: tuple(int(h[i:i+2], 16) for i in (1, 3, 5))
STEEL = {hx(c) for c in ["#dae0ea", "#a3a7c2", "#ffffff", "#8b93af", "#dba463"]}
BLACKS = {(6, 6, 8), (0, 0, 0)}
HAIR = {"#e4a672": "hairHi", "#b86f50": "hairA", "#743f39": "hairD", "#bb7547": "hairA"}
SKIN = {"#ffc2a1": "skin", "#e9b5a3": "skin", "#f5a097": "skin", "#ba756a": "skinD", "#bd6a62": "skinD", "#ba756a": "skinD"}
DRESS = {"#283540": "outL", "#333941": "outL", "#14182e": "out", "#122020": "out"}
EYE = {"#24523b": "eye0", "#59c135": "eye1", "#9cdb43": "eye2", "#d6f264": "eye4"}
HEAD_Y = 100   # native rows above this are head; below is body
def load(name):
    im = Image.open(SC + name + '.png').convert('RGBA'); n = im.width // 128
    return [np.array(im.crop((i * 128, 0, i * 128 + 128, 128))) for i in range(n)]
def erase_steel(f, passes=6):
    f = f.copy(); H, W = f.shape[:2]
    op = f[:, :, 3] > 0
    steel = np.zeros((H, W), bool)
    eye = np.zeros((H, W), bool)                       # the eye whites share the blade's colours: keep anything near the iris
    for y in range(H):
        for x in range(W):
            if op[y, x] and '#%02x%02x%02x' % tuple(int(v) for v in f[y, x, :3]) in EYE: eye[y, x] = True
    near_eye = eye.copy()
    for dy in range(-6, 7):
        for dx in range(-6, 7): near_eye |= np.roll(np.roll(eye, dy, 0), dx, 1)
    for y in range(H):
        for x in range(W):
            if op[y, x] and not near_eye[y, x] and tuple(int(v) for v in f[y, x, :3]) in STEEL: steel[y, x] = True
    rem = steel.copy()
    isblack = lambda y, x: op[y, x] and tuple(int(v) for v in f[y, x, :3]) in BLACKS
    for _ in range(passes):
        new = rem.copy()
        for y in range(1, H - 1):
            for x in range(1, W - 1):
                if rem[y, x] or not isblack(y, x): continue
                near_rem = False; body = False
                for dy in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        if not (dy or dx): continue
                        yy, xx = y + dy, x + dx
                        if rem[yy, xx]: near_rem = True
                        elif op[yy, xx] and not isblack(yy, xx): body = True
                if near_rem and not body: new[y, x] = True
        if (new == rem).all(): break
        rem = new
    f[rem] = (0, 0, 0, 0)
    return f
GREYS = {hx(c) for c in ["#6d758d", "#686f99", "#849be4", "#333941"]}
def clean(f):
    """keep only pixels within one pixel of real fill colour: drops what is left of the blade's outline and trail."""
    H, W = f.shape[:2]; op = f[:, :, 3] > 0
    col = lambda y, x: tuple(int(v) for v in f[y, x, :3])
    fill = np.zeros((H, W), bool)
    for y in range(H):
        for x in range(W):
            if not op[y, x]: continue
            c = col(y, x)
            if c in BLACKS: continue
            if c in GREYS:
                same = sum(1 for dy in (-1, 0, 1) for dx in (-1, 0, 1) if (dy or dx) and 0 <= y + dy < H and 0 <= x + dx < W and op[y + dy, x + dx] and col(y + dy, x + dx) == c)
                if same < 3: continue
            fill[y, x] = True
    keep = fill.copy()
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            keep |= np.roll(np.roll(fill, dy, 0), dx, 1)
    g = f.copy(); g[~keep] = 0
    return g
def mirror_arm(f):
    """front view: drop the right arm + sword and copy the left side across (dress is symmetric)."""
    f = f.copy()
    f[100:124, 60:100] = 0
    for y in range(100, 124):
        for x in range(30, 60):
            if f[y, x, 3]: f[y, 114 - x] = f[y, x]
    return f
def roles_of(f, head_y=HEAD_Y):
    H, W = f.shape[:2]; m = np.zeros((H, W), np.uint8)
    for y in range(H):
        for x in range(W):
            if not f[y, x, 3]: continue
            h = '#%02x%02x%02x' % tuple(int(v) for v in f[y, x, :3])
            head = y < head_y; r = None
            if head: r = HAIR.get(h) or SKIN.get(h) or EYE.get(h)
            else: r = DRESS.get(h)
            if r: m[y, x] = RI[r]
    return m
def crop(f, W, x_centre=54, bottom=127, H=84, yb=77):
    """paste into a W x H frame so that native row `bottom` lands on row yb and x_centre is the middle."""
    o = np.zeros((H, W, 4), np.uint8)
    x0 = x_centre - W // 2; y0 = bottom - yb
    for y in range(H):
        sy = y0 + y
        if 0 <= sy < 128:
            xs = np.arange(W) + x0; ok = (xs >= 0) & (xs < 128)
            o[y, ok] = f[sy, xs[ok]]
    return o
def shift_x(f, dx):
    o = np.zeros_like(f)
    if dx > 0: o[:, dx:] = f[:, :-dx]
    elif dx < 0: o[:, :dx] = f[:, -dx:]
    else: o = f.copy()
    return o
def bob(f, dy, rows_from):
    """move everything above rows_from up by dy (feet planted)."""
    o = f.copy()
    if dy: o[:rows_from - dy] = f[dy:rows_from]; o[rows_from - dy:rows_from] = 0
    return o
def back_view(front):
    """Mirror the dressed front, then turn the head into a hair mass seen from behind (bob, parting, strands)."""
    import math
    f = front[:, ::-1].copy(); H, W = f.shape[:2]
    m = f[:, :, 3] > 0
    hb = HEAD_Y - 50 - 1
    head = m.copy(); head[hb + 1:] = False
    for y in range(hb + 1):                                  # fill holes (the eye) so the mass is solid
        xs = np.where(m[y])[0]
        if len(xs): head[y, xs.min():xs.max() + 1] = True
    ys = np.where(head.any(1))[0]; top = ys.min()
    for y in range(hb + 1):          # round the bob: pull the lower corners in
        d = (y - top) / max(1, hb - top)
        if d > 0.6:
            xs = np.where(head[y])[0]
            if len(xs):
                k = int(round((d - 0.6) * 22)); head[y, xs.min():xs.min() + k] = False; head[y, xs.max() - k + 1:xs.max() + 1] = False
    xs_all = np.where(head.any(0))[0]; cx = (xs_all.min() + xs_all.max()) / 2.0
    out = f.copy(); out[:hb + 1] = 0
    rolesm = np.zeros((H, W), np.uint8)
    col = {"hairHi": (228, 166, 114), "hairA": (184, 111, 80), "hairD": (116, 63, 57)}
    for y in range(hb + 1):
        for x in range(W):
            if not head[y, x]: continue
            edge = any(not (0 <= y + dy < H and 0 <= x + dx < W and head[y + dy, x + dx]) for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)))
            if edge: out[y, x] = (6, 6, 8, 255); continue
            depth = (y - top) / max(1, hb - top)
            ang = math.atan2(x - cx, (y - top) + 9)
            strand = int(math.floor(ang * 11)) % 3
            r = "hairA"
            if depth < 0.55 and strand == 0 and (x < cx + 8): r = "hairHi"
            if depth < 0.22: r = "hairHi" if strand != 2 else "hairA"
            if strand == 2 and depth > 0.35: r = "hairD"
            if abs(x - cx) < 0.9 and 0.12 < depth < 0.85: r = "hairD"     # parting
            if depth > 0.86: r = "hairD"                                   # shadowed ends under the bob
            out[y, x] = (*col[r], 255); rolesm[y, x] = RI[r]
    for y in (hb + 1, hb + 2):       # stray bob pixels left beside the shoulders
        for x in range(W):
            c = tuple(int(v) for v in out[y, x, :3])
            if out[y, x, 3] and (c in BLACKS or c in {(228, 166, 114), (184, 111, 80), (116, 63, 57), (228, 166, 114)} or '#%02x%02x%02x' % c in HAIR or '#%02x%02x%02x' % c in SKIN):
                out[y, x] = 0
    # the cape / dress back below the head is the mirrored front
    return out, rolesm

# ------------------------------------------------------------------ build
def b64png(arr_or_img):
    im = arr_or_img if isinstance(arr_or_img, Image.Image) else Image.fromarray(arr_or_img)
    buf = io.BytesIO(); im.save(buf, "PNG", optimize=True); return base64.b64encode(buf.getvalue()).decode()
def strip(frames):
    h, w = frames[0].shape[:2]; im = Image.new("RGBA", (w * len(frames), h))
    for i, f in enumerate(frames): im.paste(Image.fromarray(f), (i * w, 0))
    return im
def role_strip(rframes):
    h, w = rframes[0].shape; im = Image.new("L", (w * len(rframes), h))
    for i, m in enumerate(rframes): im.paste(Image.fromarray((m * FAC).astype(np.uint8)), (i * w, 0))
    return im
def eye_centre(f, m):
    ys, xs = np.where((m == RI["eye1"]) | (m == RI["eye2"]) | (m == RI["eye0"]))
    return [int(round(xs.mean())), int(round(ys.mean()))] if len(xs) else None
def anchor(f):
    ys = np.where(f[:, :, 3].any(1))[0]; yb = int(ys.max()); xs = np.where(f[max(0, yb - 6):yb + 1, :, 3].any(0))[0]
    return [int(round((xs.min() + xs.max()) / 2)), yb]
# Natural front/back walk, 8 frames: contact (one boot forward) -> passing (feet together, body up) -> contact (other boot) -> passing.
#   fwd: how far the stepping boot moves along the walk direction (down the screen walking toward camera, up the screen walking away)
#   back: how far the trailing boot lifts (heel up, tucked behind the hem)
#   bob: body rise (px) on the passing frames
STEP = [  # (side stepping: -1 left boot, +1 right boot, 0 together), fwd, back, bob
    (-1, 2, 2, 0), (-1, 1, 1, 0), (0, 0, 0, 1), (1, 1, 1, 0),
    (1, 2, 2, 0), (1, 1, 1, 0), (0, 0, 0, 1), (-1, 1, 1, 0)]
FOOT_Y = 73      # boots are everything below this row (the hem edge)
HEM_Y = 62       # the skirt below this row follows the stepping leg
def sway(f, k, view="down"):
    """Front/back walk built so nothing ever separates from her: a leading boot that comes forward is lengthened (its top row is
    repeated, so the leg extends) rather than moved; a boot that rises only slides up behind the hem; the bob lifts her whole figure."""
    side, fwd, back, bobv = STEP[k]
    toward = 1 if view == "down" else -1
    H, W = f.shape[:2]; cx = 29
    body = f.copy(); body[FOOT_Y:] = 0
    o = np.zeros_like(f)
    for sgn, sl in ((-1, slice(0, cx + 1)), (1, slice(cx + 1, W))):
        if side == 0: dy = 0
        elif sgn == side: dy = toward * fwd                 # leading boot: down the screen walking toward, up walking away
        else: dy = -back if toward > 0 else min(1, back)     # trailing boot: heel tucks up (toward) / shows a touch lower (away)
        ft = np.zeros_like(f)
        if dy > 0:                                           # lengthen: repeat the boot's top row so it stays joined to the hem
            for y in range(FOOT_Y, H):
                sy = max(FOOT_Y, y - dy); ft[y, sl] = f[sy, sl]
            ft[FOOT_Y - 1, sl] = f[FOOT_Y - 1, sl] * 0
        else:
            ft[FOOT_Y:, sl] = f[FOOT_Y:, sl]
            if dy < 0: ft = np.roll(ft, dy, 0); ft[H + dy:] = 0
        a = ft[:, :, 3] > 0; o[a] = ft[a]
    b = body.copy()
    if side and fwd >= 2 and toward > 0:                     # the skirt on the stepping side eases down over the forward leg
        cols = slice(0, cx + 1) if side < 0 else slice(cx + 1, W)
        src = body.copy()
        for y in range(HEM_Y, FOOT_Y):
            d = int(round((y - HEM_Y) / (FOOT_Y - HEM_Y)))
            b[y, cols] = src[max(0, y - d), cols]
    a = b[:, :, 3] > 0; o[a] = b[a]
    if bobv: o = np.roll(o, -bobv, 0); o[H - bobv:] = 0      # passing frame: the whole figure rises together
    return o
def drop_strays(f, keep_if_many=5, small=15):
    """remove small pieces that have come loose from her (sword-erase leftovers); frames with many pieces are slash effects and keep them"""
    from scipy import ndimage
    lab, n = ndimage.label(f[:, :, 3] > 0)
    if n <= 1 or n >= keep_if_many: return f
    sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1)); o = f.copy()
    for i, sz in enumerate(sizes, 1):
        if sz < small: o[lab == i] = 0
    return o
def pieces(f):
    """number of separate opaque pieces (4-connected); a joined-up sprite is 1"""
    from collections import deque
    a = f[:, :, 3] > 0; seen = np.zeros_like(a); n = 0
    for y0, x0 in zip(*np.where(a)):
        if seen[y0, x0]: continue
        n += 1; q = deque([(y0, x0)]); seen[y0, x0] = True
        while q:
            y, x = q.popleft()
            for yy, xx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                if 0 <= yy < a.shape[0] and 0 <= xx < a.shape[1] and a[yy, xx] and not seen[yy, xx]: seen[yy, xx] = True; q.append((yy, xx))
    return n
def build():
    clean_ = lambda f: clean(erase_steel(f))
    idle_n = [mirror_arm(clean_(f)) for f in load('Idle')]
    walk_n = [clean_(f) for f in load('Walk')]
    A = {}
    W = 59
    idle = [crop(f, W) for f in idle_n]
    walk_s = [crop(f, W) for f in walk_n]
    back0, back_roles0 = back_view(idle[0])
    # roles for front/side frames (head rows are above window row 50)
    def with_roles(frames): return [(f, roles_of(f, HEAD_Y - 50)) for f in frames]
    bobs = [0, 1, 1, 0, 0, 1, 1, 0]; hems = [-1, 0, 1, 0, 1, 0, -1, 0]
    walk_down = [sway(idle[0], k, 'down') for k in range(8)]
    walk_up = [sway(back0, k, 'up') for k in range(8)]
    print('pieces idle', pieces(idle[0]), pieces(back0), 'walk_down', [pieces(x) for x in walk_down], 'walk_up', [pieces(x) for x in walk_up])
    # back-view roles: hair roles painted by back_view; the body below uses the dress classification
    def back_roles(f, hr):
        r = roles_of(f, HEAD_Y - 50); r[:50] = 0
        # head rows come from the painted hair mass: re-derive them by colour
        for y in range(50):
            for x in range(W):
                if f[y, x, 3]:
                    c = tuple(int(v) for v in f[y, x, :3])
                    r[y, x] = {(228, 166, 114): RI["hairHi"], (184, 111, 80): RI["hairA"], (116, 63, 57): RI["hairD"]}.get(c, 0)
        return r
    sets = [("idle_down", idle), ("walk_down", walk_down), ("idle_up", [back0]), ("walk_up", walk_up), ("idle_side", [walk_s[0]]), ("walk_side", walk_s)]
    frames, rf, idx, ec = [], [], {}, []
    for name, fs in sets:
        idx[name] = list(range(len(frames), len(frames) + len(fs)))
        for f in fs:
            r = back_roles(f, None) if "up" in name else roles_of(f, HEAD_Y - 50)
            frames.append(f); rf.append(r); ec.append(None if "up" in name else eye_centre(f, r))
    over = {"png": b64png(strip(frames)), "roles": b64png(role_strip(rf)), "fw": W, "fh": 84, "anims": idx, "anchor": {}, "ec": ec}
    def anc(name): return anchor(frames[idx[name][0]])
    over["anchor"] = {"down": anc("idle_down"), "up": anc("idle_up"), "side": anc("idle_side")}
    # ---- battle: 96 x 84, facing right
    CW = 96
    bc = lambda f: crop(f, CW)
    def sh(f, dy):
        o = np.zeros_like(f)
        if dy < 0: o[:dy] = f[-dy:]
        else: o = f.copy()
        o[-8:] = f[-8:]; return o
    side0 = bc(walk_n[0])
    idle_b = [sh(side0, d) for d in (0, 0, -1, -1, -1, 0)]
    a1 = [bc(clean_(f)) for f in load('Attack_1')]; a1s = [bc(f) for f in load('Attack_1')]
    a3 = [bc(clean_(f)) for f in load('Attack_3')]
    hurt = [bc(clean_(f)) for f in load('Hurt')]; dead = [bc(clean_(f)) for f in load('Dead')]
    dbl = lambda l, order: [l[i] for i in order]
    B = {"idle": idle_b, "attack": dbl(a1, [0, 0, 1, 1, 2, 2, 3, 3, 4, 4]), "attack_sword": dbl(a1s, [0, 0, 1, 1, 2, 2, 3, 3, 4, 4]),
         "cast": dbl(a3, [0, 1, 2, 2, 3, 3, 4]), "hurt": dbl(hurt, [0, 1, 2, 2]), "dead": dbl(dead, [0, 1, 2, 3])}
    bframes, brf, bidx = [], [], {}
    for k in ["idle", "attack", "cast", "hurt", "dead", "attack_sword"]:
        bidx[k] = list(range(len(bframes), len(bframes) + len(B[k])))
        for f in B[k]: f = drop_strays(f); bframes.append(f); brf.append(roles_of(f, HEAD_Y - 50))
    bat = {"png": b64png(strip(bframes)), "roles": b64png(role_strip(brf)), "fw": CW, "fh": 84, "anims": bidx, "anchor": anchor(idle_b[0])}
    return over, bat, strip(frames), strip(bframes)
if __name__ == "__main__":
    over, bat, s1, s2 = build()
    json.dump({"chars": {"elowyn": over}, "battle": {"elowyn": bat}}, open("elowyn_atlas.json", "w"))
    s1.save("elowyn_atlas_over.png"); s2.save("elowyn_atlas_battle.png")
    print(len(over["png"]) // 1024, "KB over,", len(bat["png"]) // 1024, "KB battle", over["anims"], over["anchor"], bat["anchor"])
