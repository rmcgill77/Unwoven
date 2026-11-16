import math, random, io, base64, json
from PIL import Image, ImageDraw
CW,CH=128,120
C=dict(ol=(22,18,26),b1=(74,54,40),b2=(52,38,30),b3=(100,76,52),bl=(126,98,66),m1=(58,88,46),m2=(38,62,36),ml=(96,130,62),
       eye=(240,208,90),eyeg=(180,230,110),mouth=(14,10,16),th=(186,170,150),thd=(120,104,92),fl=(176,64,96),fld=(112,36,66),flc=(240,200,120))
def P(d,pts,c): d.polygon([(round(x),round(y)) for x,y in pts],fill=c)
def L(d,a,b,w,c): d.line([(round(a[0]),round(a[1])),(round(b[0]),round(b[1]))],fill=c,width=w)
def vine(d,pts,w,c1,c2,thorns=True,rng=None):
    for i in range(len(pts)-1):
        L(d,pts[i],pts[i+1],w,c1); L(d,(pts[i][0]-1,pts[i][1]-1),(pts[i+1][0]-1,pts[i+1][1]-1),max(1,w-3),c2)
    if thorns:
        for i in range(1,len(pts)-1,1):
            x,y=pts[i]; dx=pts[i+1][0]-pts[i-1][0]; dy=pts[i+1][1]-pts[i-1][1]; n=math.hypot(dx,dy) or 1
            nx,ny=-dy/n,dx/n
            for s in (1,-1):
                P(d,[(x+nx*s*w*.4,y+ny*s*w*.4),(x+nx*s*(w*.4+6),y+ny*s*(w*.4+6)-2),(x+nx*s*w*.4+dx/n*3,y+ny*s*w*.4+dy/n*3)],C['th'])
def frame(t,atk=0.0):
    im=Image.new('RGBA',(CW,CH),(0,0,0,0)); d=ImageDraw.Draw(im)
    sway=math.sin(t*2*math.pi)*2.5; bob=math.sin(t*2*math.pi*2)*1.2
    cx=64+sway*.4; base=112
    # root feet
    for k,(ex,ey) in enumerate([(-44,0),(-30,4),(-16,6),(16,6),(30,4),(44,0)]):
        pts=[(cx+ex*.3,base-14),(cx+ex*.7,base-6+ey*.3),(cx+ex,base+ey*.2)]
        vine(d,pts,6 if abs(ex)<30 else 5,C['b1'],C['b3'],thorns=False)
    # trunk body (hollow, mossy shoulders)
    body_top=46+bob-atk*6
    P(d,[(cx-26,base-10),(cx-30,base-34),(cx-24,body_top+8),(cx-12,body_top),(cx+12,body_top),(cx+24,body_top+8),(cx+30,base-34),(cx+26,base-10)],C['b1'])
    P(d,[(cx-26,base-10),(cx-30,base-34),(cx-24,body_top+8),(cx-16,body_top+4),(cx-20,base-30)],C['b2'])
    for i in range(5):  # bark cracks
        x=cx-18+i*9; L(d,(x,body_top+14+(i%2)*6),(x+((i%3)-1)*2,base-16),1,C['b2'])
    P(d,[(cx-28,body_top+12),(cx-18,body_top+2),(cx,body_top-2),(cx+18,body_top+2),(cx+28,body_top+12),(cx+16,body_top+16),(cx,body_top+12),(cx-16,body_top+16)],C['m1'])
    for i in range(7): d.point((round(cx-20+i*7),round(body_top+8+(i%3))),fill=C['ml'])
    # face hollow
    P(d,[(cx-15,body_top+16),(cx-11,body_top+10),(cx,body_top+8),(cx+11,body_top+10),(cx+15,body_top+16),(cx+12,body_top+34),(cx,body_top+40),(cx-12,body_top+34)],C['mouth'])
    glow=.5+.5*math.sin(t*2*math.pi+1)
    ec=tuple(int(C['eye'][i]*(.7+.3*glow)+C['eyeg'][i]*0*glow) for i in range(3))
    for sx in (-1,1):
        P(d,[(cx+sx*5,body_top+20),(cx+sx*10,body_top+18),(cx+sx*11,body_top+23),(cx+sx*6,body_top+24)],ec)
    P(d,[(cx-9,body_top+30),(cx-5,body_top+28),(cx-3,body_top+31),(cx,body_top+28),(cx+3,body_top+31),(cx+5,body_top+28),(cx+9,body_top+30),(cx+5,body_top+35),(cx-5,body_top+35)],C['th'])
    # flower bud on the chest
    fy=base-26; 
    for a in range(0,360,72):
        px=cx+math.cos(math.radians(a))*5; py=fy+math.sin(math.radians(a))*4
        P(d,[(cx,fy),(px-2,py-2),(px+2,py+2)],C['fl'])
    d.ellipse([cx-2,fy-2,cx+2,fy+2],fill=C['flc'])
    # crown of thorned antlers
    for k,(ax,ay,bx,by) in enumerate([(-14,0,-34,-22),(-6,-2,-16,-34),(6,-2,18,-36),(14,0,36,-20),(0,-3,2,-30)]):
        wob=math.sin(t*2*math.pi+k)*1.5
        pts=[(cx+ax,body_top+ay+6),(cx+(ax+bx)/2+wob,body_top+(ay+by)/2+6),(cx+bx+wob*1.5,body_top+by+6)]
        vine(d,pts,4,C['b1'],C['b3'],thorns=True)
        P(d,[(pts[-1][0]-2,pts[-1][1]),(pts[-1][0],pts[-1][1]-7),(pts[-1][0]+2,pts[-1][1])],C['th'])
    # arms: thorned vines
    for sx in (-1,1):
        sh=(cx+sx*26,body_top+14)
        if atk>0:   # lunge: arms sweep forward and down
            a=atk; e=(cx+sx*(34-14*a),body_top+22+36*a); h=(cx+sx*(26-22*a),body_top+44+30*a)
        else:
            lift=math.sin(t*2*math.pi+(0 if sx<0 else math.pi))*4
            e=(cx+sx*40,body_top+30+lift); h=(cx+sx*46,body_top+54+lift*1.5)
        vine(d,[sh,e,h],7,C['m2'],C['m1'],thorns=True)
        P(d,[(h[0]-5,h[1]-3),(h[0],h[1]+8),(h[0]+5,h[1]-3)],C['th'])
        for fx in (-4,0,4): L(d,h,(h[0]+fx*1.5,h[1]+9),2,C['thd'])
    # outline
    a=im.split()[3]; w,h=im.size; px=a.load(); out=im.copy(); op=out.load(); src=im.load()
    for y in range(h):
        for x in range(w):
            if px[x,y]==0:
                for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
                    xx,yy=x+dx,y+dy
                    if 0<=xx<w and 0<=yy<h and px[xx,yy]>0: op[x,y]=C['ol']+(255,); break
    return out
idle=[frame(i/6) for i in range(6)]
atk=[frame(.0,0),frame(.1,.35),frame(.2,.8),frame(.3,1.0),frame(.4,.4)]
strip=Image.new('RGBA',(CW*11,CH),(0,0,0,0))
for i,f in enumerate(idle+atk): strip.paste(f,(i*CW,0))
strip.save('thorn_atlas.png')
bg=Image.new('RGBA',strip.size,(40,36,50,255)); bg.alpha_composite(strip)
bg.crop((0,0,CW*6,CH)).resize((CW*6*2//1,CH*2),Image.NEAREST).save('thorn_idle.png')
bg.crop((CW*6,0,CW*11,CH)).resize((CW*5*2,CH*2),Image.NEAREST).save('thorn_attack.png')
