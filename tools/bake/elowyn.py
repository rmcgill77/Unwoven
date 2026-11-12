from PIL import Image
import colorsys, sys
SC='assets/_extracted/'
src=Image.open(SC+'fem/Knight/Idle.png').convert('RGBA').crop((0,0,128,128))
def erase_sword(im):
    im=im.copy(); px=im.load()
    for y in range(100,124):
        for x in range(60,100): px[x,y]=(0,0,0,0)
    for y in range(100,124):
        for x in range(30,60):
            p=px[x,y]
            if p[3]>0: px[114-x,y]=p
    return im
base=erase_sword(src); base.save('elowyn_nosword.png')
hexrgb=lambda h:tuple(int(h[i:i+2],16) for i in (1,3,5))
def lum(c): return (0.3*c[0]+0.59*c[1]+0.11*c[2])/255
def ramp_map(c,ramp):  # ramp: dark..light list of 3
    return ramp
HAIR_SRC={'#e4a672':'l','#b86f50':'b','#743f39':'d'}
SKIN_SRC={'#ffc2a1':'l','#e9b5a3':'b','#f5a097':'b','#ba756a':'d','#bd6a62':'d'}
DRESS_SRC={'#283540':'b','#14182e':'d','#122020':'d','#333941':'b'}
EYE_SRC={'#59c135':1,'#9cdb43':2,'#d6f264':4,'#24523b':0}
def recolour(im,skin,hair,cloth,eyes=None):
    im=im.copy(); px=im.load()
    for y in range(128):
        for x in range(128):
            r,g,b,a=px[x,y]
            if not a: continue
            h='#%02x%02x%02x'%(r,g,b)
            head = y<100
            new=None
            if head and h in HAIR_SRC: new=hair[HAIR_SRC[h]]
            elif head and h in SKIN_SRC: new=skin[SKIN_SRC[h]]
            elif h in EYE_SRC and eyes and head: new=eyes[EYE_SRC[h]]
            elif not head and h in DRESS_SRC: new=cloth[DRESS_SRC[h]]
            elif not head and h in SKIN_SRC and False: pass
            if new: px[x,y]=hexrgb(new)+(a,)
    return im
if __name__=='__main__':
    pass
