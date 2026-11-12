import numpy as np
SRC = None          # padded RGBA frame being dressed
HOFF = (0, 0)       # head offset vs the base front frame
BOFF = (0, 0)       # body offset
MODE = "front"
REGIONS = {
  "front": dict(face=[(14, 24), (18, 19), (30, 17), (37, 21), (39, 30), (38, 37), (33, 40), (31, 41), (21, 41), (17, 38), (14, 34)],
                lash=((16, 25), (30, 38), (25, 33)), fore=27, neck=37, cols=(11, 37), closed=[(18, 29), (31, 29)], jaw=30),
  "side":  dict(face=[(30, 15), (38, 13), (41, 17), (41, 25), (41, 33), (40, 37), (36, 40), (29, 40), (26, 36), (26, 26), (28, 19)],
                lash=((33, 40), (33, 40), (25, 32)), fore=99, neck=36, cols=(19, 41), closed=[(33, 29)], jaw=36),
}
def R(): return REGIONS[MODE]
OVR = {}
