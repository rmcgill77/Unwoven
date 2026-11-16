import json, base64, io, sys
import numpy as np
from PIL import Image
import bake, style_bake as SB, folk_side, odile
bake.FRONT_FN["odile"] = odile.odile; bake.SIDE_FN["odile"] = odile.odile_s; bake.LOOK["odile"] = odile.LOOK
bake.VARIANTS["mentor"] = ("odile", None, None)
d = SB.world("mentor"); d.pop("roles", None); d.pop("ec", None)
json.dump(d, open("odile_world.json", "w"))
im = Image.open(io.BytesIO(base64.b64decode(d["png"])))
im.save("odile_atlas.png"); print(d["fw"], d["fh"], d["anims"], d["anchor"])
