from PIL import Image, ImageDraw, ImageEnhance
import os
exec(open('packs_sheet.py').read().split("# 1 slimes")[0])
def grim(f, sat=0.55, br=0.72, tint=(18,16,24)):
    f=f.convert('RGBA'); a=f.split()[3]; rgb=f.convert('RGB')
    rgb=ImageEnhance.Color(rgb).enhance(sat); rgb=ImageEnhance.Brightness(rgb).enhance(br)
    t=Image.new('RGB',rgb.size,tint); rgb=Image.blend(rgb,t,0.12); o=rgb.convert('RGBA'); o.putalpha(a); return o
def up(f,s): f=tight(f); return f.resize((f.size[0]*s,f.size[1]*s),Image.NEAREST)
W,H=1100,780; im=Image.new('RGB',(W,H),(24,22,30)); d=ImageDraw.Draw(im)
def label(x,y,t,c=(230,220,190)): d.text((x,y),t,fill=c)
# ground strip
d.rectangle((0,250,W,H),fill=(34,36,30))
label(10,8,"ACT 1 CANDIDATES  (left: pack as drawn   right: same sprite grimmed to match Durinn)",(255,255,255))
S=A+'free-slime-sprite-sheets-pixel-art/'
x=20
for c,nm in [('Green','Mire slime (woods, rocks)'),('Blue','Cave slime (caves)'),('Red','Rust slime (rocks, ruins)')]:
    a=idle(S+f'{c}_Slime/Idle.png',0); b=grim(a,0.5,0.7)
    ua,ub=up(a,2),up(b,2)
    im.paste(ua,(x,200-ua.size[1]+30),ua); im.paste(ub,(x+ua.size[0]+10,200-ub.size[1]+30),ub)
    label(x,215,nm); x+=ua.size[0]*2+50
E_=A+'free-fantasy-enemies-pixel-art-sprite-pack/'
sk=idle(E_+'Skeleton/Idle.png',0); pl=idle(E_+'Plent/Idle.png',0)
x=20; label(x,262+10,"Second type, pick one:  A) Skeleton  (ruins, graveyard)   B) Plant creature  (woods)",(255,255,255))
y0=330
for a,nm in [(sk,'Skeleton'),(pl,'Plant creature')]:
    b=grim(a,0.6,0.75); ua,ub=up(a,2),up(b,2)
    im.paste(ua,(x,y0+170-ua.size[1]),ua); im.paste(ub,(x+ua.size[0]+10,y0+170-ub.size[1]),ub); label(x,y0+178,nm); x+=ua.size[0]*2+60
# world later
label(520,262,"WORLD, AFTER ACT 1 (not in Act 1)",(255,255,255))
P=A+'free-predator-plant-mobs-pixel-art-pack/PNG/'
items=[]
for n in ['Plant1','Plant2','Plant3']:
    f=Image.open(P+n+'/Without_shadow/'+n+'_Idle_without_shadow.png').convert('RGBA').crop((0,0,128,128)); items.append((grim(f,0.7,0.8),'Predator '+n[-1]))
R=A+'free-robot-pixel-art-sprite-sheets/'
for n,lab in [('Destroyer','Automaton: Destroyer'),('Infantryman','Automaton: Infantry'),('Swordsman','Automaton: Blade')]: items.append((grim(idle(R+n+'/Idle.png',0),0.5,0.7),lab))
Wp=A+'free-warrior-pixel-art-sprite-sheets/'
for i,lab in [(1,'Raider (axe)'),(2,'Raider (shield)'),(3,'Raider (spear)')]: items.append((grim(idle(Wp+f'Warrior_{i}/Idle.png',0,96),0.6,0.78),lab))
K=A+'free-knight-character-sprites-pixel-art/'
items.append((grim(idle(K+'Knight_1/Idle.png',0),0.5,0.8),'Knight / Arbitrator guard'))
items.append((grim(idle(E_+'Fire_Spirit/Idle.png',0),0.75,0.8),'Fire spirit'))
x=500;y=300;
for k,(f,nm) in enumerate(items):
    f=tight(f); s=1 if max(f.size)>60 else 2; f=f.resize((f.size[0]*s,f.size[1]*s),Image.NEAREST)
    cx=520+(k%4)*140; cy=290+(k//4)*160
    im.paste(f,(cx+(130-f.size[0])//2,cy+110-f.size[1]),f); label(cx,cy+118,nm[:22])
im.save('pk_board.png'); print(im.size)
