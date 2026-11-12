from PIL import Image, ImageDraw
import numpy as np
A='assets5/Fire Wizard/'
SKS=(190,130,118); DKH=(66,36,51)
def shave(fr):
    a=np.array(fr.convert('RGBA'))
    ys,xs=np.where((a[...,0]==233)&(a[...,1]==181)&(a[...,3]>0))
    if len(ys)==0: return Image.fromarray(a)
    y0,y1,x0,x1=ys.min(),ys.max(),xs.min(),xs.max()
    for y in range(y1-1,y1+3):
        for x in range(x0-1,x1+1):
            p=a[y,x]
            if p[3] and tuple(p[:3]) in ((113,65,59),(91,49,56)):
                a[y,x]=(*SKS,255) if y<=y1+0 else (*DKH,255)
    return Image.fromarray(a)
def frames(n):
    im=Image.open(A+n+'.png').convert('RGBA'); w=im.size[1]
    return [shave(im.crop((i*w,0,(i+1)*w,w))) for i in range(im.size[0]//w)]
if __name__=='__main__':
    idle=frames('Idle')
    bg=Image.new('RGBA',(900,700),(36,32,42,255))
    g=idle[0].crop((0,0,128,128)); b=g.getbbox(); g=g.crop((b[0],b[1],b[2],b[1]+40)).resize(((b[2]-b[0])*14,40*14),Image.NEAREST)
    bg.alpha_composite(g,(10,10)); bg.save('fw_shave.png')
