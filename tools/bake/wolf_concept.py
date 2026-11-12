from PIL import Image, ImageDraw
import math
exec(open('anim_static.py').read().split("picks=")[0])
P='assets3/62a730f9/Pixel Monster Pack/32x32 monsters/'
cols=['black','white','blue','green']
bg=(34,36,30); S=4
im=Image.new('RGB',(900,640),bg); d=ImageDraw.Draw(im)
d.text((8,6),'WOLF PACK SPRITES: as drawn (top) and grimmed to match Durinn (bottom)',fill=(240,230,200))
for i,c in enumerate(cols):
    a=tight(Image.open(P+f'wolf-{c}.png').convert('RGBA')); b=tight(grim(a,0.5,0.72))
    for j,(f,y) in enumerate([(a,40),(b,200)]):
        g=f.resize((f.size[0]*S,f.size[1]*S),Image.NEAREST); im.paste(g,(20+i*215,y+130-g.size[1]),g)
    d.text((20+i*215,175),c,fill=(210,210,220))
# animation strip for black grimmed wolf, flipped? show 11 frames at 3x
a=tight(grim(tight(Image.open(P+'wolf-black.png').convert('RGBA')),0.5,0.72)); base=a.resize((a.size[0]*2,a.size[1]*2),Image.NEAREST)
fr=[]
for t in range(6): k=math.sin(t/6*6.2832); fr.append(xform(base,1-0.03*k,1+0.05*k,W=120,H=100))
for sx,sy,dx,dy in [(1.05,0.9,-3,0),(0.92,1.08,-8,-2),(1.2,0.88,10,0),(1.12,0.95,14,0),(1,1,6,0)]: fr.append(xform(base,sx,sy,dx*2,dy*2,W=120,H=100))
fr.append(xform(base,1,1,-8,0,flash=0.8,W=120,H=100))
d.text((8,340),'animation in code:  idle x6 · attack lunge x5 · hurt flash',fill=(240,230,200))
for i,f in enumerate(fr): im.paste(f,(8+i*80,360-0) if False else (8+i*80,350),f) if False else None
sheet=Image.new('RGB',(900,200),bg)
for i,f in enumerate(fr):
    f=f.resize((80,67),Image.NEAREST); sheet.paste(f,(6+i*80,20),f)
im.paste(sheet,(0,350)); im=im.crop((0,0,900,560)); im.save('wolf_concept.png')
