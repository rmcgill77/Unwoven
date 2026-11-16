from PIL import Image
import numpy as np
OUTC=(6,6,8,255)
def walk(img):
    a=np.array(img); H,W=a.shape[:2]
    # find boot columns from bottom rows
    ys,xs=np.where(a[...,3]>0); bottom=ys.max()
    row=a[bottom-1]; cols=[x for x in range(W) if row[x,3]>0]
    mid=W//2
    L=[x for x in cols if x<mid]; R=[x for x in cols if x>=mid]
    L=(min(L),max(L)); R=(min(R),max(R))
    hem=bottom-4      # boots occupy the last ~4 rows
    frames=[]
    for f in range(8):
        b=np.zeros((H+2,W,4),np.uint8); b[:H]=a
        side = L if f<4 else R; other = R if f<4 else L
        k=f%4
        ext = (0,1,1,0)[k]; lift=(0,1,2,1)[k]
        # leading boot lengthens by repeating its top row
        if ext:
            x0,x1=side[0]-1,side[1]+2
            blk=b[hem:bottom+2,x0:x1].copy()
            b[hem+ext:bottom+2+ext,x0:x1]=blk
        # trailing boot lifts behind the robe hem (cut top rows, keep outline under)
        if lift:
            x0,x1=other[0]-1,other[1]+2
            blk=a[hem+1:bottom+1,x0:x1].copy()
            b[hem+1:bottom+2,x0:x1]=0
            # keep robe hem row intact; paste boot shifted up, but clipped below hem
            sh=blk[lift:]
            b[hem+1:hem+1+sh.shape[0],x0:x1]=sh
            # re-close outline under the shortened boot
            yb=hem+1+sh.shape[0]
            for x in range(x0,x1):
                if b[yb-1,x,3]>0 and b[yb,x,3]==0: b[yb,x]=OUTC
        # robe hem sways toward the stepping side
        sway = (0,1,1,0)[k]*(1 if f<4 else -1)
        if sway:
            for y in range(hem-6,hem+1):
                b[y]=np.roll(b[y],sway,axis=0)
        # bob: down a pixel on contact frames
        bob = 1 if k in (0,) else 0
        if bob: b=np.roll(b,1,axis=0)
        frames.append(Image.fromarray(b))
    return frames
def pieces(im):
    a=np.array(im)[...,3]>0; H,W=a.shape; seen=np.zeros_like(a); n=0
    for y in range(H):
        for x in range(W):
            if a[y,x] and not seen[y,x]:
                n+=1; st=[(y,x)]; seen[y,x]=1
                while st:
                    cy,cx=st.pop()
                    for dy in(-1,0,1):
                        for dx in(-1,0,1):
                            yy,xx=cy+dy,cx+dx
                            if 0<=yy<H and 0<=xx<W and a[yy,xx] and not seen[yy,xx]: seen[yy,xx]=1; st.append((yy,xx))
    return n
if __name__=='__main__':
    for n in ('front','back'):
        fr=walk(Image.open(f'corin_hd_{n}.png').convert('RGBA'))
        print(n,[pieces(f) for f in fr])
        big=[Image.alpha_composite(Image.new('RGBA',f.size,(36,32,42,255)),f).resize((f.size[0]*6,f.size[1]*6),Image.NEAREST) for f in fr]
        big[0].save(f'corin_walk_{n}.gif',save_all=True,append_images=big[1:],duration=110,loop=0)
        S=Image.new('RGBA',(8*fr[0].size[0]*4,fr[0].size[1]*4),(36,32,42,255))
        for i,f in enumerate(fr): S.alpha_composite(f.resize((f.size[0]*4,f.size[1]*4),Image.NEAREST),(i*f.size[0]*4,0))
        S.save(f'corin_walk_{n}_strip.png')
