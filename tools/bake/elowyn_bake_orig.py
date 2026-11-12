"""Elowyn with her ORIGINAL craftpix sprite: no sword erased, nothing mirrored or rebuilt. Side-on frames only (idle, walk, attack, cast, hurt, dead).
Writes ../src/parts/02g_elowyn_data.js"""
import json, numpy as np
from elowyn_bake import *
W, CW = 80, 96
def head_cx(f):
    ys, xs = np.where(f[:100, :, 3] > 0); return (xs.min() + xs.max()) / 2.0
def feet_x(f):
    ys = np.where(f[:, :, 3].any(1))[0]; yb = ys.max(); xs = np.where(f[max(0, yb - 6):yb + 1, :, 3].any(0))[0]; return (xs.min() + xs.max()) / 2.0
idle_n, walk_n = load('Idle'), load('Walk')
HX = 34                                   # head centre column in every overworld frame
def over_frame(f): return crop(f, W, x_centre=int(round(head_cx(f))) + W // 2 - HX)
idle = [over_frame(f) for f in idle_n]; walk = [over_frame(f) for f in walk_n]
# front view (walking toward the camera): the existing front idle and walk, built at 59 wide, set into the 80 wide frame with the body on the same column
clean_ = lambda f: clean(erase_steel(f))
def two_legs(f):
    """mirroring her arm across left a stub of leg under the middle of the hem: remove it and close the hem with its outline"""
    f = f.copy()
    f[74:, 32:38] = 0
    for x in range(32, 39):
        if f[73, x, 3]: f[73, x] = (6, 6, 8, 255)
    return f
front_idle59 = [two_legs(crop(mirror_arm(clean_(f)), 59)) for f in idle_n]
def walk_front(f, k):
    """two legs, nothing else: each boot in turn lifts up under the hem and sets down again; the skirt is drawn over the lifted boot,
    and on the two lift peaks her whole figure rises a pixel together so nothing comes apart"""
    LIFT_L = [0, 1, 2, 1, 0, 0, 0, 0]; LIFT_R = [0, 0, 0, 0, 0, 1, 2, 1]; BOB = [0, 0, 1, 0, 0, 0, 1, 0]
    B0 = 74
    body = f.copy(); body[B0:] = 0
    o = np.zeros_like(f)
    for (x0, x1), d in (((22, 31), LIFT_L[k]), ((36, 46), LIFT_R[k])):
        boot = np.zeros_like(f); boot[B0:, x0:x1] = f[B0:, x0:x1]
        if d: boot = np.roll(boot, -d, 0); boot[f.shape[0] - d:] = 0
        a = boot[:, :, 3] > 0; o[a] = boot[a]
    a = body[:, :, 3] > 0; o[a] = body[a]
    if BOB[k]: o = np.roll(o, -BOB[k], 0); o[f.shape[0] - BOB[k]:] = 0
    return o
walk_down59 = [walk_front(front_idle59[0], k) for k in range(8)]
def wide(f):
    o = np.zeros((84, W, 4), np.uint8); o[:, HX - 29:HX - 29 + 59] = f; return o
def add_sword(f):
    """a sword in her hand on the viewer's right, held out and raised to the side (clear of her legs): the grip is painted over the gauntlet so the two stay joined"""
    f = f.copy(); H_, W_ = f.shape[:2]
    hand = [(y, x) for y in range(50, 72) for x in range(HX + 8, HX + 24) if f[y, x, 3] and tuple(int(v) for v in f[y, x, :3]) in GREYS | {hx('#8b93af'), hx('#a3a7c2'), hx('#dae0ea')}]
    if not hand: return f
    hy, hx_ = int(round(np.mean([h[0] for h in hand]))), int(round(np.mean([h[1] for h in hand])))
    INK, STL, HI, SH, GD, GR = (6, 6, 8, 255), (218, 224, 234, 255), (255, 255, 255, 255), (163, 167, 194, 255), (219, 164, 99, 255), (92, 58, 34, 255)
    core = {}
    n = 17; tx, ty = 16, -9
    for i in range(n + 1):
        x = hx_ + 3 + int(round(i * tx / n)); y = hy - 1 + int(round(i * ty / n)); core[(y, x)] = HI if i % 4 == 1 else STL; core[(y + 1, x)] = SH
    for g in range(-3, 3): core[(hy - 1 + g, hx_ + 2)] = GD                           # cross-guard
    for k, (dy, dx) in enumerate(((0, 1), (1, 0), (2, -1))): core[(hy + dy, hx_ + dx)] = GR     # grip, over the gauntlet, running back down toward the wrist
    core[(hy + 3, hx_ - 2)] = GD                                                       # pommel
    out = {}
    for (y, x) in core:
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                if (y + dy, x + dx) not in core: out[(y + dy, x + dx)] = INK
    for d in (out, core):
        for (y, x), c in d.items():
            if 0 <= y < H_ and 0 <= x < W_: f[y, x] = c
    return f
fidle = [add_sword(wide(f)) for f in front_idle59]; fwalk = [add_sword(wide(f)) for f in walk_down59]
frames = idle + walk + fidle + fwalk; ni, nw, nf = len(idle), len(walk), len(fidle)
rf = [roles_of(f, HEAD_Y - 50) for f in frames]
ec = [eye_centre(f, r) for f, r in zip(frames, rf)]
ix = list(range(ni)); wx = list(range(ni, ni + nw))
fx_ = list(range(ni + nw, ni + nw + nf)); fw_ = list(range(ni + nw + nf, ni + nw + nf + len(fwalk)))
anims = {"idle_down": fx_, "walk_down": fw_, "idle_up": ix, "walk_up": wx, "idle_side": ix, "walk_side": wx}
a0 = anchor(idle[0]); a1_ = anchor(fidle[0])
over = {"png": b64png(strip(frames)), "roles": b64png(role_strip(rf)), "fw": W, "fh": 84, "anims": anims, "anchor": {"down": a1_, "up": a0, "side": a0}, "ec": ec, "noBack": True}
# battle: constant registration from the first idle frame so the lunges keep their travel
BX = 40
xc = int(round(feet_x(idle_n[0]))) + CW // 2 - BX
bc = lambda f: crop(f, CW, x_centre=xc)
dbl = lambda l, order: [l[i] for i in order]
a1 = [bc(f) for f in load('Attack_1')]; a3 = [bc(f) for f in load('Attack_3')]
idle_b = [bc(f) for f in idle_n]; hurt = [bc(f) for f in load('Hurt')]; dead = [bc(f) for f in load('Dead')]
atk = dbl(a1, [0, 0, 1, 1, 2, 2, 3, 3, 4, 4])
B = {"idle": idle_b, "attack": atk, "cast": dbl(a3, [0, 1, 2, 2, 3, 3, 4]), "hurt": dbl(hurt, [0, 1, 2, 2]), "dead": dbl(dead, [0, 1, 2, 3]), "attack_sword": atk}
bframes, brf, bidx = [], [], {}
for k in ["idle", "attack", "cast", "hurt", "dead", "attack_sword"]:
    bidx[k] = list(range(len(bframes), len(bframes) + len(B[k])))
    for f in B[k]: bframes.append(f); brf.append(roles_of(f, HEAD_Y - 50))
bat = {"png": b64png(strip(bframes)), "roles": b64png(role_strip(brf)), "fw": CW, "fh": 84, "anims": bidx, "anchor": anchor(idle_b[0])}
portrait = [3 + HX - 29, 6, 54, 54]
js = ("/* Elowyn: the female hero, in her original craftpix Free Fantasy Chibi Female Sprites knight frames with the sword kept, unaltered (side-on frames original; the toward-camera walk is the front view built earlier; used under the craftpix licence). */\n"
      "CHIBI_DATA.chars.elowyn = " + json.dumps(over) + ";\nBATTLE_DATA.chars.elowyn = " + json.dumps(bat) + ";\nCHIBI_DATA.chars.elowyn.portrait = " + json.dumps(portrait) + ";\n")
open('src/parts/02g_elowyn_data.js', 'w').write(js)
strip(frames).save('elowyn_orig_over.png'); strip(bframes).save('elowyn_orig_battle.png')
print(anims, a0, bat["anchor"], portrait, len(frames), len(bframes))
