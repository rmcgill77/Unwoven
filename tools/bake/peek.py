import sys
from PIL import Image
import ctx, side, anim2
from anim import centroid, EYE
from cast2 import PY
ctx.MODE="side"
fr=anim2.frames("8933c1ac",30,52)[0]; ctx.SRC=fr; ctx.HOFF=(0,0); ctx.BOFF=(0,0)
ims=[fr]+[f() for n,f in side.SIDE[1:]]
S=6; w,h=fr.shape[1]*S,fr.shape[0]*S
c=Image.new("RGBA",(w*len(ims),h),"#1c1730")
for i,a in enumerate(ims):
    im=Image.fromarray(a).resize((w,h),Image.NEAREST); c.paste(im,(i*w,0),im)
c.crop((0,0,c.width,h*62//84)).save("side_peek.png")
