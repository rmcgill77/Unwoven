from PIL import Image
import numpy as np, math
from corin_hd import P
W=56
G=[['.']*W for _ in range(W)]
def put(x,y,c):
    if 0<=x<W and 0<=y<W: G[y][x]=c
cx=27.5
# shoulders / capelet
for y in range(38,W):
    for x in range(W):
        d=abs(x-cx)
        if d< 14+ (y-38)*1.6:
            put(x,y,'b' if x<cx-4 else ('m' if x<cx+10 else 'k'))
            if x<cx-14: put(x,y,'k' if y>44 else 'b')
# hood outer
for y in range(W):
    for x in range(W):
        dx=(x-cx)/19.5; dy=(y-25)/23
        if dx*dx+dy*dy<=1 and y<46:
            r=math.hypot(dx+0.35,dy+0.45)
            c='l' if r<0.55 else 'b'
            if x>cx+6: c='m'
            if x>cx+13: c='k'
            if x<cx-16: c='k'
            put(x,y,c)
# hood inner shadow (opening)
for y in range(W):
    for x in range(W):
        dx=(x-cx)/12.5; dy=(y-27)/19
        if (dx*dx+dy*dy<=1 and y>9) or (y>27 and abs(x-cx)<12.5-(y-27)*0.55 and y<44):
            put(x,y,'n' if (dx*dx+dy*dy)>0.72 else 'v')
# neck in shadow
for y in range(35,44):
    for x in range(int(cx-4),int(cx+4)): put(x,y,'Z' if (x>cx-1 or y<38) else 'z')
# face
face_l={13:(-8,8),14:(-9,8),15:(-9,9),16:(-9,9),17:(-9,9),18:(-9,9),19:(-9,9),20:(-9,9),21:(-9,9),22:(-9,9),23:(-9,9),
        24:(-9,9),25:(-9,9),26:(-8,8),27:(-8,8),28:(-8,8),29:(-7,7),30:(-7,7),31:(-6,6),32:(-5,5),33:(-4,4),34:(-3,3)}
for y,(a,b) in face_l.items():
    for x in range(int(cx+a),int(cx+b)):
        c='s'
        if x>=cx+5: c='z'
        if x>=cx+7: c='Z'
        if x<=cx-8: c='z'
        put(x,y,c)
# jaw shading
for x in range(int(cx-3),int(cx+3)): put(x,34,'z')
for y in range(29,34): put(int(cx+(7 if y<31 else 6-(y-31))),y,'Z')
# hair: crown under hood + fringe
for y in range(10,17):
    for x in range(int(cx-11),int(cx+11)):
        dx=(x-cx)/11; dy=(y-17)/7
        if dx*dx+dy*dy<=1:
            hl = (-0.8<dx<-0.1 and 11<=y<=13) or (-0.6<dx<-0.3 and y==14)
            put(x,y,'H' if hl else ('L' if dx>0.55 else 'h'))
fr=[(-10,6),(-9,7),(-8,5),(-7,6),(-6,8),(-5,6),(-4,4),(-3,5),(-2,7),(-1,5),(0,3),(1,4),(2,6),(3,5),(4,4),(5,6),(6,7),(7,5),(8,6),(9,8),(10,6)]
for dx,l in fr:
    for k in range(l): put(int(cx+dx),16+k,'h' if k<l-1 else ('H' if dx%3==0 else 'h'))
for dx in (2,6): put(int(cx+dx),13,'H')
# side locks
for y in range(16,27): put(int(cx-10),y,'h'); put(int(cx+9),y,'h')
for y in range(17,24): put(int(cx-9),y,'h'); put(int(cx+8),y,'h')
# brows
for x in range(-7,-2): put(int(cx+x),22 if x>-6 else 23,'h')
for x in range(2,7): put(int(cx+x),22 if x<5 else 23,'h')
# eyes: white, iris, pupil, highlight, lid line
for ex in (-6,3):
    x0=int(cx+ex)
    for i in range(4): put(x0+i,24,'e')        # upper lid
    for i in range(4): put(x0+i,25,'s')
    put(x0,25,'w' if False else 'S'); 
    put(x0,25,'Q'); put(x0+1,25,'I'); put(x0+2,25,'I'); put(x0+3,25,'Q')
    put(x0,26,'Q'); put(x0+1,26,'I'); put(x0+2,26,'e'); put(x0+3,26,'Q')
    put(x0+1,25,'Y')
    put(x0+1,27,'z'); put(x0+2,27,'z')
# nose
for y in range(26,30): put(int(cx+1),y,'z')
put(int(cx),30,'z'); put(int(cx+1),30,'Z'); put(int(cx-1),30,'z')
# mouth
for x in range(-2,3): put(int(cx+x),32,'x' if abs(x)<2 else 'Z')
put(int(cx),33,'z')
# cheek warmth
put(int(cx-6),29,'r'); put(int(cx-5),29,'r'); put(int(cx+4),29,'r')
# collar: navy robe + orange trim V + capelet edge
for y in range(42,W):
    for x in range(W):
        d=abs(x-cx)
        if d< 4+(y-42)*0.9 and G[y][x]!='.':
            put(x,y,'n' if d>1.5 else 'v')
    put(int(cx-4-(y-42)*0.9),y,'o'); put(int(cx+3+(y-42)*0.9),y,'O')
# rune-sword hilt peeking at bottom right
for i,(x,y) in enumerate([(41,50),(42,51),(43,52),(44,53),(45,54),(46,55)]): put(x,y,'w' if i%2 else 'W')
# outline
out=[r[:] for r in G]
for y in range(W):
    for x in range(W):
        if G[y][x]=='.':
            for dx,dy in((1,0),(-1,0),(0,1),(0,-1)):
                xx,yy=x+dx,y+dy
                if 0<=xx<W and 0<=yy<W and G[yy][xx]!='.': out[y][x]='#';break
P.update({'Q':(236,226,214),'I':(76,104,124),'Y':(170,200,220),'S':(236,226,214),'r':(214,150,140)})
im=Image.new('RGBA',(W,W),(0,0,0,0)); px=im.load()
for y in range(W):
    for x in range(W):
        c=out[y][x]
        if c!='.': px[x,y]=P[c]+(255,)
im.save('corin_hd_portrait.png')
bg=Image.new('RGBA',(W*10,W*10),(36,32,42,255)); bg.alpha_composite(im.resize((W*10,W*10),Image.NEAREST)); bg.save('corin_hd_portrait_big.png')
