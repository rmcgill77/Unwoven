import math
from env import h2
def vnoise(x, y, cell=8, seed=0):
    gx, gy = math.floor(x / cell), math.floor(y / cell); fx, fy = x / cell - gx, y / cell - gy
    sm = lambda t: t * t * (3 - 2 * t)
    v = lambda i, j: (h2(gx + i, gy + j, seed) % 1000) / 1000
    a, b, c, d = v(0, 0), v(1, 0), v(0, 1), v(1, 1); u, w = sm(fx), sm(fy)
    return (a * (1 - u) + b * u) * (1 - w) + (c * (1 - u) + d * u) * w
def fbm(x, y, seed=0): return vnoise(x, y, 11, seed) * 0.6 + vnoise(x, y, 4, seed + 7) * 0.4
