from PIL import Image, ImageEnhance
import json, base64, io, math, sys
sys.argv=['x']
exec(open('anim_static.py').read().split("picks=")[0])   # grim, tight, xform, frames helpers (M path too)
SL='assets/free-slime-sprite-sheets-pixel-art/'
def strip(path,n=None):
    im=Image.open(path).convert('RGBA'); h=im.size[1]; return [im.crop((i*h,0,(i+1)*h,h)) for i in range(im.size[0]//h)]
def pack(groups, name):
    """groups: dict kind->[RGBA frames]; shared bbox, bottom-centre anchored"""
    allf=[f for v in groups.values() for f in v]
    x0=min(f.getbbox()[0] for f in allf); y0=min(f.getbbox()[1] for f in allf); x1=max(f.getbbox()[2] for f in allf); y1=max(f.getbbox()[3] for f in allf)
    cw,ch=x1-x0,y1-y0; order=[]; cells=[]
    for k,v in groups.items():
        order.append([k,len(v)]); cells+= [f.crop((x0,y0,x1,y1)) for f in v]
    at=Image.new('RGBA',(cw*len(cells),ch),(0,0,0,0))
    for i,c in enumerate(cells): at.paste(c,(i*cw,0))
    b=io.BytesIO(); at.save(b,'PNG',optimize=True)
    print(name,cw,ch,len(cells),len(b.getvalue()))
    return {'cw':cw,'ch':ch,'n':dict(order),'src':'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()}
out={}
for key,c,sat,br in [('slimeG','Green',0.5,0.68),('slimeB','Blue',0.5,0.68),('slimeR','Red',0.55,0.7)]:
    d=SL+c+'_Slime/'
    g=lambda f: [grim(x,sat,br) for x in strip(d+f)]
    idle=g('Idle.png'); att=g('Attack_1.png'); hurt=g('Hurt.png')[:4]; dead=g('Dead.png')
    out[key]=pack({'idle':idle,'attack':att,'hurt':hurt,'dead':dead},key)
for key,icon in [('redcap','Icon3'),('mandrake','Icon17'),('bat','Icon38'),('spider','Icon32')]:
    base=tight(grim(Image.open(M+icon+'.png').convert('RGBA'))); base=base.resize((base.size[0]*2,base.size[1]*2),Image.NEAREST)
    W=H=160
    fr,lab=frames(base) if False else (None,None)
    # generate at 2x with canvas 160
    def X(sx,sy,dx=0,dy=0): return xform(base,sx,sy,dx*2,dy*2,W=W,H=H)
    idle=[X(1-0.04*math.sin(t/6*6.2832),1+0.06*math.sin(t/6*6.2832)) for t in range(6)]
    att=[X(*a) for a in [(1.1,0.88,-3,0),(0.9,1.12,-6,-2),(1.2,0.9,8,0),(1.1,0.95,12,0),(1,1,6,0)]]
    out[key]=pack({'idle':idle,'attack':att},key)
WP='assets3/62a730f9/Pixel Monster Pack/32x32 monsters/'
for key,col,sat,br in [('wolfB','black',0.5,0.72),('wolfW','white',0.5,0.72),('wolfL','blue',0.5,0.72),('wolfG','green',0.5,0.72)]:
    base=tight(grim(Image.open(WP+f'wolf-{col}.png').convert('RGBA'),sat,br)); base=base.resize((base.size[0]*2,base.size[1]*2),Image.NEAREST)
    W,H=120,90
    def X(sx,sy,dx=0,dy=0): return xform(base,sx,sy,dx*2,dy*2,W=W,H=H)
    idle=[X(1-0.03*math.sin(t/6*6.2832),1+0.05*math.sin(t/6*6.2832)) for t in range(6)]
    att=[X(*a) for a in [(1.05,0.9,-3,0),(0.92,1.08,-8,-2),(1.2,0.88,10,0),(1.12,0.95,14,0),(1,1,6,0)]]
    out[key]=pack({'idle':idle,'attack':att},key)
js='/* New foes (craftpix slime, monster-icon packs), grimmed and baked to atlases by concept/foes_bake.py */\nconst FOE_ATLAS = '+json.dumps(out,separators=(',',':'))+';\n'
open('../src/parts/02h_foes_data.js','w').write(js); print(len(js))
