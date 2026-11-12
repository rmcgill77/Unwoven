"""Hand-built walk cycles for views the pack lacks: alternate leg lift, body bob, hem sway."""
import numpy as np
from cast2 import PX, PY
LEG_TOP = 70          # base-frame row where the legs begin
CX = 24               # base-frame column between the legs
# (left lift, right lift, bob, hem sway)
CYCLE = [(0, 0, 0, 0), (2, 0, -1, 1), (0, 0, 0, 0), (0, 2, -1, -1)]
def walk_frames(fr, cycle=CYCLE, leg_top=LEG_TOP, cx=CX):
    H, W = fr.shape[:2]; lt = leg_top + PY; c = cx + PX
    out = []
    for ll, rl, bob, sway in cycle:
        f = np.zeros_like(fr)
        def put(src_rows, src_cols, dy, dx=0):
            for y in src_rows:
                for x in src_cols:
                    if fr[y, x, 3]:
                        yy, xx = y + dy, x + dx
                        if 0 <= yy < H and 0 <= xx < W: f[yy, xx] = fr[y, x]
        put(range(lt, H), range(0, c), bob - ll)        # left leg
        put(range(lt, H), range(c, W), bob - rl)        # right leg
        # body + head over the legs; the lower cloak sways sideways
        for y in range(0, lt):
            dx = sway if y >= 62 + PY else 0
            for x in range(W):
                if fr[y, x, 3]:
                    yy, xx = y + bob, x + dx
                    if 0 <= yy < H and 0 <= xx < W: f[yy, xx] = fr[y, x]
        # close the seam where a lifted leg pulled away from the hem
        out.append(f)
    return out

# livelier 8-frame cycle: (left lift, right lift, bob, hem swing, lean, hair lag)
CYCLE8 = [(0, 0, 0, 0, 0, 0), (2, 0, -1, 1, 1, 1), (3, 0, -2, 2, 1, 1), (1, 0, -1, 1, 0, -1),
          (0, 0, 0, 0, 0, 0), (0, 2, -1, -1, -1, 1), (0, 3, -2, -2, -1, 1), (0, 1, -1, -1, 0, -1)]
def walk_frames8(fr, cycle=CYCLE8, leg_top=LEG_TOP, cx=CX, hem_top=54, hair_bottom=20):
    H, W = fr.shape[:2]; lt = leg_top + PY; c = cx + PX; ht = hem_top + PY; hb = hair_bottom + PY
    out = []
    for ll, rl, bob, swing, lean, lag in cycle:
        f = np.zeros_like(fr)
        def put(y, x, yy, xx):
            if 0 <= yy < H and 0 <= xx < W: f[yy, xx] = fr[y, x]
        for y in range(lt, H):
            for x in range(W):
                if fr[y, x, 3]: put(y, x, y + bob - (ll if x < c else rl), x + lean)
        for y in range(0, lt):
            dx = lean + (round(swing * (y - ht) / max(1, lt - ht)) if y >= ht else 0)
            dy = bob + (lag if y < hb else 0)
            for x in range(W):
                if fr[y, x, 3]: put(y, x, y + dy, x + dx)
        # hair lag can open a one-pixel seam between the top of the hair and the rest: fill it from below
        if any(l for *_, l in [cycle[0]]): pass
        for y in range(1, H - 1):
            for x in range(W):
                if not f[y, x, 3] and f[y - 1, x, 3] and f[y + 1, x, 3] and fr[min(H - 1, max(0, y - bob)), min(W - 1, max(0, x - lean)), 3]:
                    f[y, x] = f[y + 1, x]
        out.append(f)
    return out
