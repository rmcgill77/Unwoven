import sys; sys.path.insert(0,'.')
import numpy as np, bake, headfix, anim2, ctx
from anim import centroid, EYE
from cast2 import PY
from PIL import Image
def dress3(sheet, mode, x0, fn):
    ctx.MODE=mode; M=anim2.MODES[mode]
    ref=anim2.frames(M["ref"][0], M["x0"], M["y0"])[0]
    E0,B0=centroid(ref,EYE,0,42+PY),centroid(ref,{"in","inD"},50+PY); out=[]
    for fr in anim2.frames(sheet,x0,M["y0"]):
        ctx.SRC=fr; e,b=centroid(fr,EYE,0,42+PY),centroid(fr,{"in","inD"},50+PY)
        ctx.HOFF=(round(e[0]-E0[0]),round(e[1]-E0[1])) if e else (0,0); ctx.BOFF=(round(b[0]-B0[0]),round(b[1]-B0[1])) if b else ctx.HOFF
        f=fr.copy() if fn is None else fn()
        out.append(headfix.smooth(f,ctx.HOFF) if mode=="front" and not HATTED[0] else f)
    return out
if len(sys.argv)>1: bake.dress=dress3
import folk_side
HATTED=[False]
keys=["wren","tessa","bram","kellan","mentor","wenna","mayor_f","tomas","maud","pip","lenna","hester"]
S=5; out=Image.new("RGBA",(59*S*6,52*S*2),"#1c1730")
for i,k in enumerate(keys):
    HATTED[0]= k in folk_side.HATS
    an=bake.build(*bake.VARIANTS[k]); im=Image.fromarray(an["idle_down"][0]).crop((0,0,59,52)).resize((59*S,52*S),Image.NEAREST)
    out.paste(im,((i%6)*59*S,(i//6)*52*S),im)
out.save(sys.argv[1] if len(sys.argv)>1 else "/tmp/hf_before.png")
