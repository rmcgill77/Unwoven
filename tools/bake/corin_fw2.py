from PIL import Image, ImageDraw
import numpy as np
from corin_fw import frames
OUT=(6,6,8,255); BR=(113,65,59,255); BRD=(91,49,56,255); BRK=(66,36,51,255)
NV=(36,34,52,255); SL=(74,84,98,255); OR=(249,163,27,255); RUN=(185,191,251,255)
SK=(233,181,163,255); SKS=(190,130,118,255); EYE=(20,16,24,255); HR=(66,40,34,255)
class C:
    def __init__(s,w,h): s.a=np.zeros((h,w,4),np.uint8); s.w=w; s.h=h
    def px(s,x,y,c):
        if 0<=x<s.w and 0<=y<s.h: s.a[y,x]=c
    def span(s,y,x0,x1,c):
        for x in range(x0,x1+1): s.px(x,y,c)
    def rect(s,x0,y0,x1,y1,c):
        for y in range(y0,y1+1): s.span(y,x0,x1,c)
    def outline(s):
        m=s.a[...,3]>0; o=np.zeros_like(m)
        o[1:]|=m[:-1]; o[:-1]|=m[1:]; o[:,1:]|=m[:,:-1]; o[:,:-1]|=m[:,1:]
        s.a[o&~m]=OUT
    def img(s): return Image.fromarray(s.a)
def body(front):
    c=C(36,70); cx=18
    def half_hood(y):  # hood 2..19
        t=(y-2)/17
        return int(round(5+3*min(1,t*2.2)-0*t))
    # robe rows 40..63, narrow A-line
    for y in range(36,64):
        t=(y-36)/27; h=int(8+t*3)
        c.span(y,cx-h,cx+h-1,NV)
        c.span(y,cx-h,cx-h+1,SL)
        c.span(y,cx+h-2,cx+h-1,(26,24,40,255))
        if y>48 and y%7==0: c.span(y,cx-2,cx-1,BRK)
    c.span(63,cx-11,cx+10,BRK)
    for bx in (cx-6,cx+1): c.rect(bx,64,bx+4,67,BRK); c.span(67,bx,bx+5,NV)
    # mantle rows 18..42 (shoulders -> hem), arms inside it
    for y in range(18,43):
        t=(y-18)/24
        h=int(7+min(t*4,1)*3+ (1 if y>30 else 0))
        if y<21: h=int(5+(y-18)*1.3)
        if front:
            gap=2+int(t*2)
            c.span(y,cx-h,cx-gap,BR); c.span(y,cx+gap,cx+h-1,BRD)
            c.span(y,cx-h,cx-h+1,BRK); c.span(y,cx+h-2,cx+h-1,BRK)
            c.px(cx-gap,y,OR); c.px(cx+gap,y,OR)
            c.span(y,cx-gap+1,cx+gap-1,NV)
            if 30<y<42: c.px(cx-gap+1,y,SL)
        else:
            c.span(y,cx-h,cx+h-1,BR); c.span(y,cx+h-4,cx+h-1,BRD); c.span(y,cx-h,cx-h+1,BRK)
            if y%7==0 and y>24: c.span(y,cx-3,cx+2,BRD)
    c.span(43,cx-11,cx+10,BRK)
    # hands tucked at sleeve ends, attached below the mantle hem
    c.rect(cx-10,43,cx-8,46,SK); c.rect(cx+7,43,cx+9,46,SK) if front else None
    if front:
        c.rect(cx-6,36,cx+5,37,BRK); c.rect(cx-1,36,cx,38,OR)
        c.px(cx+4,38,RUN); c.px(cx+4,39,RUN); c.px(cx+3,40,RUN)
    # hood rows 2..19
    for y in range(2,20):
        if y<4: h=3+(y-2)*1
        elif y<7: h=5+(y-4)
        else: h=8
        c.span(y,cx-h,cx+h-1,BR); c.span(y,cx+h-3,cx+h-1,BRD); c.span(y,cx-h,cx-h+1,BRK)
    c.span(2,cx-3,cx+2,BRD)
    if front:
        for y in range(7,19):
            w=4 if y>8 else 3
            c.span(y,cx-w,cx+w-1,NV)
        c.rect(cx-3,9,cx+2,17,SK); c.rect(cx+1,10,cx+2,17,SKS)
        c.rect(cx-3,8,cx+2,9,HR); c.px(cx-3,10,HR); c.px(cx+2,10,HR)
        c.px(cx-2,12,EYE); c.px(cx+1,12,EYE); c.span(11,cx-2,cx-1,HR); c.span(11,cx+1,cx+2,HR)
        c.px(cx,14,SKS); c.span(16,cx-1,cx,SKS)
        c.span(19,cx-7,cx+6,OR)
    else:
        for y in range(14,20): c.span(y,cx-8,cx+7,BR if y%3 else BRD)
    c.outline(); return c.img()
def portrait():
    c=C(48,48); cx=24
    import math
    for y in range(0,48):
        for x in range(48):
            dx=(x-cx+0.5)/22; dy=(y-26)/27
            if dx*dx+dy*dy<=1 or y>26 and abs(x-cx+0.5)<22:
                c.px(x,y,BR if x>cx-12 else BRK)
                if x>cx+9: c.px(x,y,BRD)
                if x<cx-18: c.px(x,y,BRK)
    for y in range(6,48):
        for x in range(48):
            dx=(x-cx+0.5)/10.5; dy=(y-24)/19
            if dx*dx+dy*dy<=1 or (y>24 and abs(x-cx+0.5)<10.5-max(0,(y-34)*0.9)): c.px(x,y,NV)
    c.rect(cx-6,13,cx+5,30,SK); c.rect(cx+3,14,cx+5,30,SKS)
    c.rect(cx-5,31,cx+4,34,SK); c.rect(cx-3,33,cx+2,35,SKS)
    c.rect(cx-7,10,cx+6,15,HR); c.span(10,cx-5,cx+1,(100,66,50,255))
    for x,l in ((-6,4),(-4,5),(-2,3),(0,4),(2,5),(4,3)): c.rect(cx+x,15,cx+x+1,15+l,HR)
    c.rect(cx-7,15,cx-6,21,HR); c.rect(cx+5,15,cx+6,21,HR)
    c.span(21,cx-5,cx-1,HR); c.span(21,cx+1,cx+4,HR)
    c.rect(cx-5,23,cx-2,25,(236,226,214,255)); c.rect(cx+1,23,cx+4,25,(236,226,214,255))
    c.rect(cx-4,23,cx-3,25,(70,90,110,255)); c.rect(cx+2,23,cx+3,25,(70,90,110,255))
    c.px(cx-4,24,EYE); c.px(cx+2,24,EYE)
    c.px(cx,28,SKS); c.px(cx+1,29,SKS); c.span(32,cx-2,cx+1,(160,90,90,255))
    c.span(41,cx-12,cx+11,OR)
    c.outline(); return c.img()
def up(im,k): return im.resize((im.size[0]*k,im.size[1]*k),Image.NEAREST)
def tight(im): return im.crop(im.getbbox())
if __name__=='__main__':
    idle=frames('Idle'); walk=frames('Walk'); atk=frames('Attack_1'); hurt=frames('Hurt'); dead=frames('Dead')
    print(len(idle),len(walk),len(atk),len(hurt),len(dead))
    fr=body(True); bk=body(False); pt=portrait()
    S=Image.new('RGBA',(1700,1000),(36,32,42,255)); d=ImageDraw.Draw(S)
    d.text((20,10),'CORIN v2 - hooded, no staff (Fire Wizard base, beard removed; front/back/portrait drawn)',fill=(230,220,200,255))
    x=30
    for lab,im in (('side idle',idle[0]),('front',fr),('back',bk)):
        g=up(tight(im),8); S.alpha_composite(g,(x,620-g.size[1])); d.text((x,40),lab,fill=(200,190,170,255)); x+=g.size[0]+50
    d.text((x,40),'portrait',fill=(200,190,170,255)); S.alpha_composite(up(pt,10),(x,60))
    y2=660; xx=20
    for lab,lst in (('walk',walk[:6]),('attack',atk[:5]),('hurt',hurt[:1]),('dead',dead[-1:])):
        d.text((xx,y2-14),lab,fill=(200,190,170,255))
        for f in lst:
            g=up(f.crop((20,40,128,128)),2); S.alpha_composite(g,(xx,y2)); xx+=115
        xx+=15
    S.convert('RGB').save('corin_fw_sheet.png'); fr.save('corin_fw_front.png'); bk.save('corin_fw_back.png'); pt.save('corin_fw_portrait.png')
