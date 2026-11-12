from PIL import Image
import json, base64, io
exec(open('anim_static.py').read().split("picks=")[0])
R='assets2/free-top-down-hunt-animals-pixel-sprite-pack/PNG/Without_shadow/'
SPEC={'deer':('Deer/Deer_Idle.png','Deer/Deer_Walk.png','Deer/Deer_Run.png'),
 'hare':('Hare/Hare_Idle.png','Hare/Hare_Walk.png','Hare/Hare_Run.png'),
 'grouse':('Black_grouse/Black_grouse_Idle.png','Black_grouse/Black_grouse_Walk.png','Black_grouse/Black_grouse_Flight.png'),
 'fox':('Fox/Fox_Idle.png','Fox/Fox_walk.png','Fox/Fox_Run.png')}
def rows(path):
    im=Image.open(R+path).convert('RGBA'); n=im.size[0]//32
    return [[grim(im.crop((c*32,r*32,(c+1)*32,(r+1)*32)),0.7,0.82) for c in range(n)] for r in range(4)]   # rows: down, up, left, right
out={}
for name,(i,w,r) in SPEC.items():
    groups={}
    for kind,path in zip('iwr',(i,w,r)):
        for d,fr in enumerate(rows(path)): groups[f'{kind}{d}']=fr
    allf=[f for v in groups.values() for f in v]
    x0=min(f.getbbox()[0] for f in allf); y0=min(f.getbbox()[1] for f in allf); x1=max(f.getbbox()[2] for f in allf); y1=max(f.getbbox()[3] for f in allf)
    cw,ch=x1-x0,y1-y0; cells=[]; n={}
    for k,v in groups.items(): n[k]=len(v); cells+=[f.crop((x0,y0,x1,y1)) for f in v]
    at=Image.new('RGBA',(cw*len(cells),ch),(0,0,0,0))
    for j,c in enumerate(cells): at.paste(c,(j*cw,0))
    b=io.BytesIO(); at.save(b,'PNG',optimize=True); print(name,cw,ch,len(cells),len(b.getvalue()))
    out[name]={'cw':cw,'ch':ch,'n':n,'src':'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()}
open('../src/parts/02j_crit_data.js','w').write('/* Ambient wildlife (craftpix hunt animals), grimmed, baked by concept/crit_bake.py */\nconst CRIT_ATLAS = '+json.dumps(out,separators=(',',':'))+';\n')
