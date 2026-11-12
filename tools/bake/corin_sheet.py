from PIL import Image, ImageDraw, ImageFont
from corin_fw import frames
from corin_walk import walk
BG=(36,32,42,255); TX=(214,204,184,255); DIM=(150,140,128,255)
try: F=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',18); f2=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',14)
except: F=f2=None
def up(im,k): return im.resize((im.size[0]*k,im.size[1]*k),Image.NEAREST)
def tight(im): return im.crop(im.getbbox())
idle=frames('Idle'); wk=frames('Walk'); a1=frames('Attack_1'); a2=frames('Attack_2'); hu=frames('Hurt'); de=frames('Dead')
fr=Image.open('corin_hd_front.png'); bk=Image.open('corin_hd_back.png'); pt=Image.open('corin_hd_portrait.png'); old=Image.open('base_front.png').convert('RGBA')
S=Image.new('RGBA',(1800,1240),BG); d=ImageDraw.Draw(S)
d.text((24,14),'CORIN  -  refined concept (hooded apprentice, no staff, rune-sword at the hip)',fill=TX,font=F)
x=30; base=640
for lab,im in (('side (pack, beard removed)',idle[0]),('front (drawn)',fr),('back (drawn)',bk)):
    g=up(tight(im),8); S.alpha_composite(g,(x,base-g.size[1])); d.text((x,52),lab,fill=DIM,font=f2); x+=g.size[0]+60
d.text((x,52),'portrait (56px, shown 9x)',fill=DIM,font=f2); S.alpha_composite(up(pt,9),(x,72))
# animation strips
y=690
def strip(lab,lst,crop=None,k=3):
    global y
    d.text((24,y),lab,fill=DIM,font=f2); xx=24; y+=20; hmax=0
    for f in lst:
        g=f.crop(crop) if crop else f
        g=up(g,k); S.alpha_composite(g,(xx,y)); xx+=g.size[0]+6; hmax=max(hmax,g.size[1])
    y+=hmax+14
strip('walk - side (pack)',wk,(30,52,96,128),2)
strip('walk - front (drawn, 8 frames, one connected piece every frame)',walk(fr),None,2)
strip('walk - back',walk(bk),None,2)
# right column: actions + scale
d.text((1000,690),'attacks draw the rune-sword (pack frames)',fill=DIM,font=f2)
xx=1000
for f in a1+a2:
    g=up(f.crop((24,52,124,128)),2); S.alpha_composite(g,(xx,712)) if xx<1780-200 else None; xx+=96
xx=1000
d.text((1000,880),'hurt / dead',fill=DIM,font=f2)
for f in hu+de[-1:]:
    g=up(f.crop((24,52,124,128)),2); S.alpha_composite(g,(xx,900)); xx+=200
d.text((1000,1070),'same pixel scale: old chibi vs new',fill=DIM,font=f2)
S.alpha_composite(up(old,2),(1000,1090)); S.alpha_composite(up(tight(fr),2),(1120,1092)); S.alpha_composite(up(tight(idle[0]),2),(1200,1092))
S.convert('RGB').save('corin_refined_sheet.png')
# gif: front, side, back walking side by side
fw=walk(fr); bw=walk(bk)
gif=[]
for i in range(8):
    c=Image.new('RGBA',(130,76),BG)
    c.alpha_composite(fw[i],(4,4)); c.alpha_composite(wk[i%len(wk)].crop((30,52,96,128)).crop((0,0,66,76)),(38,0)) ; c.alpha_composite(bw[i],(96,4))
    gif.append(up(c,5))
gif[0].save('corin_refined_walk.gif',save_all=True,append_images=gif[1:],duration=120,loop=0)
