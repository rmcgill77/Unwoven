from PIL import Image, ImageDraw
import numpy as np
A='assets5/Lightning Mage/'
OUT=(6,6,8,255); DK=(59,32,39,255); MID=(113,65,59,255); SH=(66,36,51,255); HI=(171,81,48,255)
SKIN=(233,181,163,255); SKS=(190,130,118,255)
HAIR=(92,58,42,255); HAIRD=(58,36,30,255); HAIRH=(128,86,58,255)
SC=(74,98,112,255); SCD=(48,68,82,255); SCK=(30,44,56,255); SCH=(110,136,148,255)
BELT=(160,134,98,255); EYE=(30,22,30,255)
REMAP={(244,210,156,255):HAIRH,(160,134,98,255):HAIR,(173,47,69,255):SC,(115,23,45,255):SCD,(70,4,20,255):SCK}
def recol(im):
    a=np.array(im.convert('RGBA'))
    for k,v in REMAP.items():
        m=(a[...,0]==k[0])&(a[...,1]==k[1])&(a[...,2]==k[2])&(a[...,3]>0)
        a[m]=v
    return Image.fromarray(a)
def frames(name,n=None):
    im=Image.open(A+name+'.png').convert('RGBA'); w=im.size[1]
    return [recol(im.crop((i*w,0,(i+1)*w,w))) for i in range(im.size[0]//w)]
class C:
    def __init__(s,w,h): s.a=np.zeros((h,w,4),np.uint8); s.w=w; s.h=h
    def px(s,x,y,c):
        if 0<=x<s.w and 0<=y<s.h: s.a[y,x]=c
    def rect(s,x0,y0,x1,y1,c):
        for y in range(y0,y1+1):
            for x in range(x0,x1+1): s.px(x,y,c)
    def span(s,y,x0,x1,c):
        for x in range(x0,x1+1): s.px(x,y,c)
    def outline(s,col=OUT):
        m=s.a[...,3]>0; o=np.zeros_like(m)
        o[1:]|=m[:-1]; o[:-1]|=m[1:]; o[:,1:]|=m[:,:-1]; o[:,:-1]|=m[:,1:]
        o&=~m
        s.a[o]=col
    def img(s): return Image.fromarray(s.a)

def body(front=True):
    c=C(32,68); cx=16
    # robe: shoulders row 21 -> hem row 60, widening
    for y in range(21,61):
        t=(y-21)/39; half=int(7+t*4)
        x0,x1=cx-half,cx+half-1
        c.span(y,x0,x1,MID)
        c.span(y,x0,x0+1,HI if y%7 else MID)          # lit left edge
        c.span(y,x1-2,x1,SH)                           # shadow right
        if y>44 and y%6==0: c.px(cx-1+ (y%3),y,SH)     # folds
    # centre fold / opening
    if front:
        for y in range(24,60): c.px(cx,y,DK); c.px(cx-1,y,SH) if y>44 else None
    else:
        for y in range(26,60,1): c.px(cx,y,SH)
    # belt
    c.span(38,cx-8,cx+7,BELT); c.span(39,cx-8,cx+7,DK)
    if front: c.rect(cx-1,38,cx,40,HI)
    # hem trim
    c.span(60,cx-11,cx+10,DK)
    # sleeves + hands
    for sx in (-1,1):
        xs=cx+sx*9
        for y in range(22,42):
            xo=xs+ (1 if sx>0 else -1)*(1 if y>34 else 0)
            c.span(y,min(xo,xo+sx*2),max(xo,xo+sx*2),MID if sx<0 else SH)
        c.rect(xs+sx*1-(0 if sx>0 else 1), 42,xs+sx*1+(1 if sx>0 else 0),44,SKIN)
    # boots
    for bx in (cx-6,cx+2):
        c.rect(bx,61,bx+3,65,DK); c.rect(bx,65,bx+4,66,SH)
    # scarf / collar
    c.rect(cx-6,18,cx+5,22,SC); c.span(18,cx-6,cx-4,SCH); c.span(22,cx-6,cx+5,SCD)
    if front:
        c.rect(cx-1,23,cx+1,31,SC); c.rect(cx+1,23,cx+1,31,SCD)   # hanging end
        c.rect(cx-1,31,cx+1,32,SCK)
    else:
        c.rect(cx-2,23,cx+1,33,SC); c.rect(cx+1,23,cx+1,33,SCD); c.rect(cx-2,33,cx+1,34,SCK)
    # hood
    c.rect(cx-7,5,cx+6,18,DK)
    for y in range(3,6): c.span(y,cx-5+(5-y),cx+4-(5-y),DK)
    c.span(6,cx-6,cx+5,SH)
    # head
    if front:
        c.rect(cx-5,8,cx+4,17,SKIN); c.rect(cx+3,9,cx+4,17,SKS)
        # hair fringe
        c.rect(cx-5,7,cx+4,10,HAIR); c.span(7,cx-4,cx+2,HAIRH); c.px(cx-5,11,HAIR);c.px(cx+4,11,HAIR)
        c.px(cx-1,11,HAIR); c.px(cx+1,11,HAIR); c.px(cx,10,HAIR)
        c.px(cx-3,13,EYE); c.px(cx-2,13,EYE); c.px(cx+1,13,EYE); c.px(cx+2,13,EYE)
        c.px(cx-3,12,HAIRD); c.px(cx-2,12,HAIRD); c.px(cx+1,12,HAIRD); c.px(cx+2,12,HAIRD)
        c.px(cx,15,SKS); c.span(17,cx-1,cx,SKS)
    else:
        c.rect(cx-5,7,cx+4,17,HAIR); c.rect(cx+2,8,cx+4,17,HAIRD)
        c.span(8,cx-4,cx,HAIRH); c.span(9,cx-3,cx-1,HAIRH)
    # hood rim over forehead (front) / drape (back)
    if front:
        c.span(6,cx-7,cx+6,DK); c.px(cx-7,7,DK);c.px(cx+6,7,DK)
    else:
        for y in range(14,22): c.span(y,cx-6,cx+5,DK if y%2 else SH)
        c.rect(cx-6,18,cx+5,19,DK)
    c.outline(OUT)
    return c.img()

def portrait():
    c=C(44,44); cx=22
    # hood
    for y in range(2,44):
        t=min(1,(y-2)/20); half=int(10+t*10)
        c.span(y,cx-half,cx+half-1,DK)
    c.rect(cx-12,40,cx+11,43,SC)
    # scarf
    c.rect(cx-14,34,cx+13,43,SC); c.span(34,cx-14,cx-8,SCH); c.rect(cx-14,41,cx+13,43,SCD)
    # shoulders
    c.rect(cx-20,38,cx-15,43,MID); c.rect(cx+14,38,cx+19,43,SH)
    # face
    c.rect(cx-8,12,cx+7,32,SKIN); c.rect(cx+5,14,cx+7,32,SKS)
    c.rect(cx-7,32,cx+6,34,SKIN); c.rect(cx-5,34,cx+4,35,SKS)
    # hair
    c.rect(cx-9,8,cx+8,16,HAIR); c.rect(cx-9,16,cx-8,22,HAIR); c.rect(cx+7,16,cx+8,22,HAIRD)
    c.span(8,cx-6,cx+2,HAIRH); c.span(9,cx-8,cx-1,HAIRH)
    for x,l in ((-7,3),(-5,4),(-3,2),(0,3),(2,4),(4,2),(6,3)): c.rect(cx+x,16,cx+x+1,16+l,HAIR)
    # brows eyes nose mouth
    c.span(19,cx-6,cx-2,HAIRD); c.span(19,cx+1,cx+5,HAIRD)
    c.rect(cx-5,21,cx-3,23,(244,236,226,255)); c.rect(cx+2,21,cx+4,23,(244,236,226,255))
    c.rect(cx-4,21,cx-3,23,(60,80,64,255)); c.rect(cx+3,21,cx+4,23,(60,80,64,255))
    c.px(cx-4,22,EYE); c.px(cx+3,22,EYE)
    c.px(cx,26,SKS); c.px(cx+1,27,SKS); c.span(30,cx-2,cx+1,(160,90,90,255)); c.span(31,cx-1,cx,SKS)
    c.outline(OUT)
    return c.img()

def up(im,k): return im.resize((im.size[0]*k,im.size[1]*k),Image.NEAREST)
def crop(im):
    b=im.getbbox(); return im.crop(b)
if __name__=='__main__':
    walk=frames('Walk'); idle=frames('Idle'); atk=frames('Attack_1'); hurt=frames('Hurt'); dead=frames('Dead')
    print(len(walk),len(idle),len(atk),len(hurt),len(dead))
    fr=body(True); bk=body(False); pt=portrait()
    K=8
    W=1700;H=1000
    S=Image.new('RGBA',(W,H),(36,32,42,255)); d=ImageDraw.Draw(S)
    d.text((20,10),'CORIN - wizard-pack style concept   (side from pack, front/back/portrait drawn)',fill=(230,220,200,255))
    X=[30]
    def put(im,lab,y=60,k=K):
        x=X[0]
        g=up(crop(im),k); S.alpha_composite(g,(x,y+ (560-g.size[1]) if y==60 else y)); 
        d.text((x,40),lab,fill=(200,190,170,255)); X[0]=x+g.size[0]+40
    put(idle[0],'side idle'); put(fr,'front'); put(bk,'back')
    x=X[0]; g=up(pt,10); S.alpha_composite(g,(x,60)); d.text((x,40),'portrait',fill=(200,190,170,255))
    # walk strip + actions row
    y2=640; xx=20
    for lab,lst in (('walk',walk[:6]),('attack',atk[:4]),('hurt',hurt[:1]),('dead',dead[-1:])):
        d.text((xx,y2-14),lab,fill=(200,190,170,255))
        for f in lst:
            g=up(f.crop((0,40,128,128)),2); g=g.crop((40,0,216,176)); S.alpha_composite(g,(xx,y2)); xx+=110
        xx+=20
    # scale compare at 1x on grass tile
    S.convert('RGB').save('corin_wiz_sheet.png')
    fr.save('corin_front.png'); bk.save('corin_back.png'); pt.save('corin_portrait.png')
