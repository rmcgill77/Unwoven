# Corin front/back authored as mirrored half-masks + shading + detail overlays
from PIL import Image, ImageDraw
import numpy as np
P={'#':(6,6,8),'b':(113,65,59),'m':(91,49,56),'k':(66,36,51),'n':(36,34,52),'v':(24,22,36),
   'g':(74,84,98),'G':(96,108,122),'o':(249,163,27),'O':(190,110,20),'w':(185,191,251),'W':(120,128,190),
   's':(233,181,163),'z':(190,130,118),'Z':(150,96,92),'h':(70,44,36),'H':(104,68,50),'e':(16,12,20),
   'l':(136,80,66),'L':(54,40,34),'x':(160,90,90)}
# half masks, 14 cols (col 13 = centre-left). Materials:
# H hood/mantle  O hood opening  R robe  B boot  K hand
FRONT_HALF='''
...........HHH
.........HHHHH
........HHHHHH
.......HHHHHHH
......HHHHHHHH
......HHHHHHHH
......HHHHHOOO
.....HHHHOOOOO
.....HHHOOOOOO
.....HHHOOOOOO
.....HHHOOOOOO
.....HHHOOOOOO
.....HHHOOOOOO
.....HHHOOOOOO
.....HHHHOOOOO
.....HHHHHOOOO
....HHHHHHHOOO
...HHHHHHHHHRR
..HHHHHHHHHHRR
..HHHHHHHHHRRR
..HHHHHHHHHRRR
..HHHHHHHHHRRR
..HHHHHHHHHRRR
..HHHHHHHHHRRR
..HHHHHHHHHRRR
.HHHHHHHHHHRRR
.HHHHHHHHHHRRR
.HHHHHHHHHHRRR
.HHHHHHHHHHRRR
.HHHHHHHHHHRRR
.HHHHHHHHHRRRR
.HHHHHHHHRRRRR
.SSSHHHRRRRRRR
.SSSSRRRRRRRRR
.SSSSRRRRRRRRR
.SSSSRRRRRRRRR
.SSSSRRRRRRRRR
.SSSSRRRRRRRRR
.SSSSRRRRRRRRR
.SSSSRRRRRRRRR
.KKKSRRRRRRRRR
.KKK.RRRRRRRRR
..K..RRRRRRRRR
....RRRRRRRRRR
....RRRRRRRRRR
....RRRRRRRRRR
....RRRRRRRRRR
....RRRRRRRRRR
...RRRRRRRRRRR
...RRRRRRRRRRR
...RRRRRRRRRRR
...RRRRRRRRRRR
...RRRRRRRRRRR
...RRRRRRRRRRR
..RRRRRRRRRRRR
..RRRRRRRRRRRR
..RRRRRRRRRRRR
..RRRRRRRRRRRR
..RRRRRRRRRRRR
.RRRRRRRRRRRRR
.RRRRRRRRRRRRR
.....BBBB.....
.....BBBB.....
....BBBBB.....
'''
def mask(half, back=False):
    rows=[r for r in half.strip('\n').split('\n')]
    assert all(len(r)==14 for r in rows), [ (i,len(r)) for i,r in enumerate(rows) if len(r)!=14]
    M=[list(r+r[::-1]) for r in rows]
    if back:
        M=[[('H' if ch=='O' else ch) for ch in row] for row in M]
        # mantle closes across the back down to the hem
        for y,row in enumerate(M):
            if 17<=y<=40:
                for x in range(28):
                    if row[x]=='R': row[x]='H'
            if y in(41,42):   # ragged back hem
                for x in range(28):
                    if row[x]=='R' and x%5 in (1,2,3) and 6<x<22: row[x]='H'
    return M
def render(M, back=False):
    h=len(M); w=28
    A=[['.']*w for _ in range(h)]
    mat=lambda x,y: M[y][x] if 0<=x<w and 0<=y<h else '.'
    for y in range(h):
        for x in range(w):
            m=M[y][x]
            if m=='.': continue
            l=x
            while l>0 and M[y][l-1]==m: l-=1
            r=x
            while r<w-1 and M[y][r+1]==m: r+=1
            if m=='H':
                c='b'
                if x>=17: c='m'
                if x>=21 or x==r: c='k'
                if x==l: c='k' if y>16 else 'b'
                if x in (l+1,l+2) and x<12 and y<16: c='l'
                if 19<=y<=30 and x==5: c='m'
                if 19<=y<=30 and x==22: c='k'
                if 22<=y<=30 and x==9 and not back: c='m'
                if 'O' in (mat(x,y+1),mat(x+1,y),mat(x-1,y)): c='k'
                if mat(x,y+1) in 'RSBK': c='#'
            elif m=='O': c='v'
            elif m=='S':
                c='n'
                if x==l: c='g'
                if x==l+1 and x<14: c='g'
                if x>14 and x==r: c='v'
            elif m=='R':
                c='n'
                if y>31:
                    if x<=l+2: c='g'
                    if x==l and x<10: c='G'
                    if x>=r-1: c='v'
                    if y>40 and x in (9,18): c='v'
                    if y>48 and x==6: c='n'
                    if y>50 and x==13: c='v'
                if mat(x-1,y)=='S' or mat(x+1,y)=='S': c='#'
            elif m=='B': c='L' if x<14 else 'k'
            elif m=='K': c='s' if x<14 else 'z'
            A[y][x]=c
    out=[row[:] for row in A]
    for y in range(h):
        for x in range(w):
            if A[y][x]=='.':
                for dx,dy in((1,0),(-1,0),(0,1),(0,-1)):
                    xx,yy=x+dx,y+dy
                    if 0<=xx<w and 0<=yy<h and A[yy][xx] not in '.#': out[y][x]='#'; break
    return out
def frame(G):
    G=[['.']*2+row+['.']*2 for row in G]
    return [['.']*32]+G+[['.']*32]
def front():
    G=frame(render(mask(FRONT_HALF)))
    def P_(x,y,c): G[y+1][x+2]=c
    face=['hhhhhhhhhh',
          'hHHhhhHHhh',
          'hhshhhhshh',
          'hshhsshhzh',
          'hsessssezh',
          'hssssssszv',
          'vsssszsszv',
          'vssssssszv',
          'vssZZZszvv',
          'vvszzzzzvv']
    for j,row in enumerate(face):
        for i,ch in enumerate(row): P_(9+i,8+j,ch)
    # collar trim and capelet edges
    for x in range(10,18): P_(x,17,'k')
    P_(11,17,'o'); P_(16,17,'O')
    for y in range(18,31):
        xl=11 if y<29 else (10 if y<30 else 9)
        P_(xl,y,'o'); P_(27-xl,y,'O')
    # stole ends under the capelet
    for y in range(18,31): P_(12,y,'n'); P_(15,y,'n')
    # belt
    for x in range(6,22):
        if G[34][x+2] not in '.#': P_(x,33,'L'); P_(x,34,'#')
    P_(13,33,'o'); P_(14,33,'O')
    # rune sword hilt on his left hip, scabbard down to the hem
    for (x,y,c) in [(17,30,'#'),(18,31,'w'),(17,31,'W'),(18,32,'w'),(19,32,'#'),(19,35,'W'),(19,36,'w'),(20,37,'W'),(20,38,'w'),(20,39,'W'),(21,40,'w'),(21,41,'W'),(21,42,'#')]:
        P_(x,y,c)
    P_(19,33,'w'); P_(19,34,'W')
    return G
def back():
    G=frame(render(mask(FRONT_HALF,True),True))
    def P_(x,y,c): G[y+1][x+2]=c
    for y in range(3,16): P_(14,y,'m')
    for y in range(6,15): P_(15,y,'k')
    for x in range(6,22): P_(x,16,'m' if x<14 else 'k')
    for x in range(5,23): P_(x,17,'k')
    for y in range(19,30): P_(9,y,'m'); P_(18,y,'k')
    for (x,y,c) in [(4,41,'W'),(4,42,'w'),(3,43,'#')]: pass
    return G
def toimg(G):
    h=len(G); w=len(G[0]); im=Image.new('RGBA',(w,h),(0,0,0,0)); px=im.load()
    for y in range(h):
        for x in range(w):
            c=G[y][x]
            if c!='.': px[x,y]=P[c]+(255,)
    return im
if __name__=='__main__':
    f=toimg(front()); b=toimg(back())
    f.save('corin_hd_front.png'); b.save('corin_hd_back.png')
    S=Image.new('RGBA',(700,600),(36,32,42,255))
    S.alpha_composite(f.resize((f.size[0]*8,f.size[1]*8),Image.NEAREST),(10,10))
    S.alpha_composite(b.resize((b.size[0]*8,b.size[1]*8),Image.NEAREST),(300,10))
    S.save('corin_hd_fb.png')
