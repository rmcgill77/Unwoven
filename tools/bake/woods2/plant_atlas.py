import sys, colorsys
from PIL import Image
P=int(sys.argv[1]) if len(sys.argv)>1 else 3
base=f'assets/free-predator-plant-mobs-pixel-art-pack/PNG/Plant{P}/Parts/'
def load(n,act): return Image.open(base+f'Plant{n}_{act}_{{}}.png'.replace('{}','{}').format('x') ) if False else None
def comp(act,kinds):
    ims=[Image.open(base+f'Plant{P}_{act}_{k}.png').convert('RGBA') for k in kinds]
    out=ims[0].copy()
    for i in ims[1:]: out.alpha_composite(i)
    return out
def grim(im):
    px=im.load()
    for y in range(im.height):
        for x in range(im.width):
            r,g,b,a=px[x,y]
            if a==0: continue
            h,s,v=colorsys.rgb_to_hsv(r/255,g/255,b/255)
            s*=.62; v=v*.78
            r,g,b=[int(c*255) for c in colorsys.hsv_to_rgb(h,s,v)]
            # cold murk toward the game's night palette
            r=int(r*.95+14*.05); g=int(g*.98+22*.02); b=int(b*1.0+12*.04)
            px[x,y]=(r,g,b,a)
    return im
idle=comp('Idle',['body','head']); atk=comp('Attack',['body','head'])
frames=[idle.crop((i*64,0,i*64+64,64)) for i in range(4)]+[atk.crop((i*64,0,i*64+64,64)) for i in range(7)]
S=2
strip=Image.new('RGBA',(64*S*len(frames),64*S),(0,0,0,0))
for i,f in enumerate(frames): strip.paste(grim(f.copy()).resize((64*S,64*S),Image.NEAREST),(i*64*S,0))
strip.save(f'concept/woods2/plant{P}_atlas.png')
bg=Image.new('RGBA',strip.size,(40,36,50,255)); bg.alpha_composite(strip); bg.save(f'concept/woods2/plant{P}_preview.png')
