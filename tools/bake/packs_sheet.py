from PIL import Image, ImageDraw
import glob, os
A='assets/'
BG=(30,28,36)
def fix(p):
    d,f=os.path.split(p)
    if os.path.exists(p): return p
    for g in os.listdir(d):
        if g.lower()==f.lower(): return os.path.join(d,g)
    for g in os.listdir(d):
        if g.lower().startswith(f.lower().split('.')[0][:4]): return os.path.join(d,g)
    raise FileNotFoundError(p)
def frames(path, fh=None):
    path=fix(path); im=Image.open(path).convert('RGBA'); h=fh or im.size[1]; n=im.size[0]//h
    return [im.crop((i*h,0,(i+1)*h,im.size[1])) for i in range(n)]
def tight(f):
    b=f.getbbox(); return f.crop(b) if b else f
def sheet(rows, out, cell=150, scale=1, cols=None, title=None):
    # rows: list of (label, [images])
    W=max(len(r[1]) for r in rows)*cell+110; H=len(rows)*(cell+18)+(24 if title else 4)
    im=Image.new('RGB',(W,H),BG); d=ImageDraw.Draw(im)
    if title: d.text((6,5),title,fill=(230,220,190))
    y=24 if title else 4
    for lab,ims in rows:
        d.text((6,y+cell//2),lab[:16],fill=(200,200,210))
        for i,f in enumerate(ims):
            f=tight(f); s=min(scale, (cell-8)/max(f.size)); 
            if s!=1: f=f.resize((max(1,int(f.size[0]*s)),max(1,int(f.size[1]*s))),Image.NEAREST)
            im.paste(f,(104+i*cell+(cell-f.size[0])//2, y+cell-4-f.size[1]),f)
        y+=cell+18
    im.save(out); print(out, im.size)
def idle(p, i=0, fh=None):
    fr=frames(p,fh); return fr[min(i,len(fr)-1)]
# 1 slimes: idle, walk, attack, hurt, dead for 3 colours
rows=[]
for c in ['Green','Blue','Red']:
    d=A+f'free-slime-sprite-sheets-pixel-art/{c}_Slime/'
    rows.append((c+' slime',[idle(d+'Idle.png',0),idle(d+'walk.png',2),idle(d+'Attack_1.png',2),idle(d+'Hurt.png',1),idle(d+'Dead.png',2)]))
sheet(rows,'concept/pk_slimes.png',cell=140,scale=1.4,title='SLIMES  (idle · walk · attack · hurt · dead)')
# 2 enemies
E=A+'free-fantasy-enemies-pixel-art-sprite-pack/'
rows=[]
for n,lab in [('Skeleton','Skeleton'),('Fire_Spirit','Fire spirit'),('Plent','Plant creature')]:
    d=E+n+'/'; rows.append((lab,[idle(d+'Idle.png',0),idle(d+('Run.png' if os.path.exists(d+'Run.png') else 'Walk.png'),2),idle(d+'Attack_1.png' if os.path.exists(d+'Attack_1.png') else d+'Attack.png',3),idle(d+'Hurt.png',1),idle(d+'Dead.png',2)]))
sheet(rows,'concept/pk_enemies.png',cell=150,scale=1.2,title='ENEMIES  (idle · run · attack · hurt · dead)')
# 3 predator plants + robots
P=A+'free-predator-plant-mobs-pixel-art-pack/PNG/'
rows=[]
for n in ['Plant1','Plant2','Plant3']:
    d=P+n+'/Without_shadow/'
    rows.append((n.replace('Plant','Predator plant '),[idle(d+f'{n}_Idle_without_shadow.png',0,256),idle(d+f'{n}_Walk_without_shadow.png',2,128) if False else idle(d+f'{n}_Walk_without_shadow.png',2,128),idle(d+f'{n}_Attack_without_shadow.png',3,128) if False else idle(d+f'{n}_Attack_without_shadow.png',3,128),idle(d+f'{n}_Hurt_without_shadow.png',1,128),idle(d+f'{n}_Death_without_shadow.png',4,128)]))
sheet(rows,'concept/pk_plants.png',cell=150,scale=1,title='PREDATOR PLANTS')
R=A+'free-robot-pixel-art-sprite-sheets/'
rows=[(n,[idle(R+n+'/Idle.png',0),idle(R+n+'/'+next((g for g in os.listdir(R+n) if g.lower().startswith(('walk','run'))),'Attack_2.png'),2),idle(R+n+'/Attack_1.png',2),idle(R+n+'/Hurt.png',1),idle(R+n+'/Dead.png',3)]) for n in ['Destroyer','Infantryman','Swordsman']]
sheet(rows,'concept/pk_robots.png',cell=150,scale=1.2,title='ROBOTS')
# 4 humans: warriors + knights
W=A+'free-warrior-pixel-art-sprite-sheets/'; K=A+'free-knight-character-sprites-pixel-art/'
rows=[(f'Warrior {i}',[idle(W+f'Warrior_{i}/Idle.png',0,96),idle(W+f'Warrior_{i}/Run.png',2,96),idle(W+f'Warrior_{i}/Attack_1.png',2,96),idle(W+f'Warrior_{i}/Hurt.png',1,96),idle(W+f'Warrior_{i}/Dead.png',3,96)]) for i in (1,2,3)]
rows+=[(f'Knight {i}',[idle(K+f'Knight_{i}/Idle.png',0),idle(K+f'Knight_{i}/Run.png',2) if os.path.exists(K+f'Knight_{i}/Run.png') else idle(K+f'Knight_{i}/Walk.png',2),idle(K+f'Knight_{i}/Attack 1.png',3),idle(K+f'Knight_{i}/Hurt.png',1),idle(K+f'Knight_{i}/Dead.png',3)]) for i in (1,2,3)]
sheet(rows,'concept/pk_humans.png',cell=140,scale=1.3,title='WARRIORS and KNIGHTS')
