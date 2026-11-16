import json, sys
import bake, style_bake as SB, thorne_final, thorne_side
bake.FRONT_FN["thorne"] = thorne_final.thorne_a; bake.SIDE_FN["thorne"] = thorne_side.thorne
bake.LOOK["thorne"] = dict(hair=("#b8bac4", "#8a8c96", "#3e4048"), body=("#4a5262", "#2a303c")); bake.VARIANTS["thorne"] = ("thorne", None, None)
world, battle = {}, {}
for k in bake.VARIANTS:
    d = SB.world(k)
    if not k.startswith("wren"): d.pop("roles"); d.pop("ec")
    world[k] = d; print(k, end=" ", flush=True)
for k in ["wren"] + ["wren_" + s for s in SB.W.STYLES]: battle[k] = SB.battle(k)
base = json.load(open("styles_atlas.json"))
base["world"] = world; base["battle"] = battle
json.dump(base, open("styles_atlas_all.json", "w")); print("done")
