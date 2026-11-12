from PIL import Image, ImageEnhance, ImageDraw
import math
M='assets2/free-low-level-monsters-pixel-icons-32x32/PNG/Transperent/'
def grim(f,sat=0.6,br=0.78):
    a=f.split()[3]; rgb=ImageEnhance.Brightness(ImageEnhance.Color(f.convert('RGB')).enhance(sat)).enhance(br)
    o=rgb.convert('RGBA'); o.putalpha(a); return o
def tight(f): return f.crop(f.getbbox())
def xform(base, sx, sy, dx=0, dy=0, flash=0, alpha=1.0, rot=0, W=64, H=64):
    # base is tight RGBA at 1x; scale from bottom-centre, nearest, canvas WxH at 1x
    w,h=base.size; nw,nh=max(1,round(w*sx)),max(1,round(h*sy))
    f=base.resize((nw,nh),Image.NEAREST)
    if rot: f=f.rotate(rot,expand=True,resample=Image.NEAREST)
    if flash:
        px=f.load()
        for y in range(f.size[1]):
            for x in range(f.size[0]):
                r,g,b,a=px[x,y]
                if a: px[x,y]=(int(r+(255-r)*flash),int(g+(255-g)*flash),int(b+(255-b)*flash),a)
    if alpha<1:
        a=f.split()[3].point(lambda v:int(v*alpha)); f.putalpha(a)
    c=Image.new('RGBA',(W,H),(0,0,0,0)); 
    c.paste(f,(W//2-f.size[0]//2+dx,H-6-f.size[1]+dy),f); return c
def frames(base):
    fr=[]; lab=[]
    for t in range(6): k=math.sin(t/6*2*math.pi); fr.append(xform(base,1-0.04*k,1+0.06*k)); lab.append('idle')
    for sx,sy,dx,dy in [(1.1,0.88,-3,0),(0.9,1.12,-6,-2),(1.2,0.9,8,0),(1.1,0.95,12,0),(1,1,6,0)]: fr.append(xform(base,sx,sy,dx,dy)); lab.append('attack')
    for fl,dx in [(0.9,-4),(0.5,-6),(0.2,-3)]: fr.append(xform(base,1,1,dx,0,flash=fl)); lab.append('hurt')
    for sx,sy,al,rot in [(1,1,1,0),(1.05,0.8,0.9,8),(1.1,0.55,0.7,20),(1.2,0.3,0.4,0),(1.3,0.12,0.15,0)]: fr.append(xform(base,sx,sy,0,0,alpha=al,rot=rot)); lab.append('dead')
    return fr,lab
picks=[('Icon3','Red-cap'),('Icon17','Mandrake'),('Icon38','Bat'),('Icon32','Spider'),('Icon21','Bog lump')]
S=3; rows=[]; gifs=[]
for n,lab in picks:
    base=tight(grim(Image.open(M+n+'.png').convert('RGBA'))); fr,_=frames(base); rows.append((lab,fr))
W=64*S; sheet=Image.new('RGB',(90+W*len(rows[0][1])//2+10, 1),(34,36,30))
cols=len(rows[0][1]); sheet=Image.new('RGB',(90+cols*W//1,len(rows)*(64*S+14)+22),(34,36,30)); d=ImageDraw.Draw(sheet)
d.text((6,5),'static monsters animated in code:  idle x6 · attack x5 · hurt x3 · death x5',fill=(235,225,200))
for r,(lab,fr) in enumerate(rows):
    d.text((6,22+r*(64*S+14)+64*S//2),lab,fill=(210,210,220))
    for i,f in enumerate(fr):
        f=f.resize((W,W),Image.NEAREST); sheet.paste(f,(90+i*W,22+r*(64*S+14)),f)
sheet=sheet.resize((sheet.size[0]//2,sheet.size[1]//2),Image.NEAREST) if sheet.size[0]>2400 else sheet
sheet.save('anim_strip.png'); print(sheet.size)
# gif: all five side by side, looping
G=[]
for i in range(19):
    c=Image.new('RGB',(64*len(rows)*2,128),(34,36,30))
    for r,(lab,fr) in enumerate(rows):
        f=fr[i].resize((128,128),Image.NEAREST); c.paste(f,(r*128,0),f)
    G.append(c)
G[0].save('anim_loop.gif',save_all=True,append_images=G[1:],duration=110,loop=0,disposal=2); print('gif')
