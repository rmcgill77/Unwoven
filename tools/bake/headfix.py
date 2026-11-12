"""Round the head silhouette: close the notch between hair/hood and cheek (morphological closing on the head's sides), filling with the hair mass's own colours."""
import numpy as np
from scipy.ndimage import binary_closing, binary_dilation
EYE_Y = 32; UP, DOWN = 5, 13; R = 4

def _disk(r):
    y, x = np.ogrid[-r:r + 1, -r:r + 1]; return (x * x + y * y) <= r * r + 1

def _above(a, y, x, ymin):
    for yy in range(y - 1, ymin - 1, -1):
        if not a[yy, x, 3]: return None
        if tuple(a[yy, x, :3]) != (0, 0, 0): return a[yy, x, :3].copy()
    return None

def smooth(a, hoff=(0, 0), ey=None, up=None, r=R):
    a = a.copy(); ey = (EYE_Y + hoff[1]) if ey is None else ey
    y0, y1 = ey - (UP if up is None else up), ey + DOWN
    H, W = a.shape[:2]; op = a[:, :, 3] > 0
    pad = np.pad(op, r + 2)
    cl = binary_closing(pad, structure=_disk(r))[r + 2:-(r + 2), r + 2:-(r + 2)]
    band = np.zeros_like(op); band[y0:y1 + 1] = True
    cx = (np.where(op[ey])[0].min() + np.where(op[ey])[0].max()) // 2
    new = cl & ~op & band
    # only the outer flanks (never the middle of the face/neck, never below the chin line)
    cols = np.arange(W); new &= (np.abs(cols - cx) > 9)[None, :]
    if not new.any(): return a
    skin = tuple(a[ey + 4, cx, :3])
    skinish = lambda c: c is None or sum(abs(int(c[i]) - int(skin[i])) for i in range(3)) < 40
    src = a.copy()
    sidec = {}
    for sd, xr in ((0, range(0, cx)), (1, range(W - 1, cx, -1))):
        c = None
        for x in xr:
            if op[y0 + 2, x]:
                c = src[y0 + 2, x, :3]
                if tuple(c) == (0, 0, 0): c = None; continue
                break
        sidec[sd] = c if not skinish(c) else None
    ys, xs = np.where(new)
    for y, x in zip(ys, xs):
        c = _above(src, y, x, y0 - 4)
        if skinish(c): c = sidec[0 if x < cx else 1]
        if c is None: c = sidec[0 if x < cx else 1]
        if c is None: continue
        a[y, x, :3] = c; a[y, x, 3] = 255
    filled = new
    ring = binary_dilation(filled, structure=np.array([[0, 1, 0], [1, 1, 1], [0, 1, 0]], bool)) & ~filled & ~op
    a[ring] = (0, 0, 0, 255)
    # old outline pixels that are now inside the head become hair again
    nowop = a[:, :, 3] > 0
    for y, x in zip(*np.where(op & np.all(a[:, :, :3] == 0, axis=2) & band)):
        if filled[y, max(x - 1, 0)] or filled[y, min(x + 1, W - 1)]:
            n = [(y, x - 1), (y, x + 1)]
            c = None
            for yy, xx in n:
                if 0 <= xx < W and filled[yy, xx]: c = a[yy, xx, :3]
            if c is not None and not np.all(c == 0): a[y, x, :3] = c
    return a
