import os,sys; sys.path.insert(0,'.')
import bake, headfix, folk_side
from PIL import Image
def render(keys, path, sm=True, S=5):
    out=Image.new("RGBA",(59*S*len(keys)*2//1,50*S),"#1c1730")
    for i,k in enumerate(keys):
        bake.SMOOTH[0]=False
        an=bake.build(*bake.VARIANTS[k])
        for n,f in enumerate([an["idle_down"][0], headfix.smooth(an["idle_down"][0],(0,0),None,(1 if k in folk_side.HATS else None))]):
            im=Image.fromarray(f).crop((0,0,59,50)).resize((59*S,50*S),Image.NEAREST); out.paste(im,((i*2+n)*59*S,0),im)
    out.save(path)
if __name__=="__main__":
    ks=sys.argv[2:]; render(ks, sys.argv[1])
