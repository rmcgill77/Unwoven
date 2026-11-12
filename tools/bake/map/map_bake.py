import cv2, numpy as np, sys, base64, io
from PIL import Image
SRC=sys.argv[1]
im=np.array(Image.open(SRC).convert('RGB')); H,W=im.shape[:2]
hsv=cv2.cvtColor(im,cv2.COLOR_RGB2HSV)
V=hsv[...,2].astype(int); S=hsv[...,1].astype(int)
# label ink: dark, low-saturation strokes (script names, small town names, scale bar)
ink=((V<120)&(S<90)).astype(np.uint8)
# keep the big grey islands (flat mid grey, large blobs) out of the ink mask
n,lab,st,_=cv2.connectedComponentsWithStats(ink,8)
for i in range(1,n):
    if st[i,cv2.CC_STAT_AREA]>4000: ink[lab==i]=0
ink[int(H*0.88):, int(W*0.80):]=1     # scale bar and the faint compass mark, bottom right
ink=cv2.dilate(ink,np.ones((5,5),np.uint8))
clean=cv2.inpaint(im,ink*255,6,cv2.INPAINT_TELEA)
# --- Ryan's revisions: shrink the Dread Expanse so it touches no nation, and bridge the Frozen Vale to Etharis ---
gr=((np.abs(clean[...,0].astype(int)-clean[...,1])<7)&(np.abs(clean[...,1].astype(int)-clean[...,2])<7)&(clean[...,0]>105)&(clean[...,0]<160)).astype(np.uint8)
gr=cv2.morphologyEx(gr,cv2.MORPH_OPEN,np.ones((5,5),np.uint8)); gn,gl,gs,_=cv2.connectedComponentsWithStats(gr,8)
gi=1+np.argmax(gs[1:,cv2.CC_STAT_AREA]); isl=(gl==gi).astype(np.uint8); isl=cv2.morphologyEx(isl,cv2.MORPH_CLOSE,np.ones((9,9),np.uint8))
ys,xs=np.nonzero(isl); cx_,cy_=xs.mean(),ys.mean(); ISL=(int(cx_),int(cy_))
hole=cv2.dilate(isl,np.ones((27,27),np.uint8))
_pm=np.median(np.concatenate([clean[:40].reshape(-1,3),clean[-40:].reshape(-1,3)]),axis=0)
clean[hole>0]=np.clip(_pm+np.random.default_rng(2).integers(-5,6,(int(hole.sum()),1)),0,255).astype(np.uint8)
SC=0.75
M=np.float32([[SC,0,cx_-SC*cx_],[0,SC,cy_-SC*cy_]])
isl2=cv2.warpAffine(isl,M,(W,H),flags=cv2.INTER_NEAREST); col=cv2.warpAffine(np.where(isl[...,None]>0,clean*0+np.array([128,128,128],np.uint8),0).astype(np.uint8),M,(W,H),flags=cv2.INTER_NEAREST)
clean[isl2>0]=(128,128,128)
# land bridge: pale foothills running from the Vale's south-west flank down into Etharis' northern ridge
BR=np.array([[552,199],[578,197],[584,232],[580,243],[552,241],[550,222]],np.int32)
br=np.zeros((H,W),np.uint8); cv2.fillPoly(br,[BR],1)
yy_,xx_=np.mgrid[0:H,0:W]; tt=np.clip((yy_-196)/50.0,0,1)[...,None]
top=np.array([196,208,206],float); bot=np.array([176,184,128],float)
bc=(top*(1-tt)+bot*tt)+np.random.default_rng(5).integers(-9,10,(H,W,1))
clean[br>0]=np.clip(bc[br>0],0,255).astype(np.uint8)
rg=np.random.default_rng(9)
for _ in range(5):   # a few grey foothill peaks so the bridge reads as mountain pass
    px=int(rg.integers(556,576)); py=int(rg.integers(200,238)); cv2.fillPoly(clean,[np.array([[px,py],[px+7,py+12],[px-7,py+12]],np.int32)],(214,214,218)); cv2.line(clean,(px,py),(px-7,py+12),(140,140,148),1)
Image.fromarray(clean).save('map_clean2.png')
OW=512; OH=round(H*OW/W)
small=cv2.resize(clean,(OW,OH),interpolation=cv2.INTER_AREA).astype(float)
# land vs parchment: parchment is the dominant colour of the border
border=np.concatenate([clean[:40].reshape(-1,3),clean[-40:].reshape(-1,3)]).astype(float); pm=np.median(border,axis=0)
dist=np.sqrt(((clean.astype(float)-pm)**2).sum(axis=2)); land=(((dist>34)&(hole==0))|(br>0)|(isl2>0)).astype(np.uint8)
land=cv2.morphologyEx(land,cv2.MORPH_OPEN,np.ones((5,5),np.uint8)); land=cv2.morphologyEx(land,cv2.MORPH_CLOSE,np.ones((9,9),np.uint8))
n_,lab_,st_,_=cv2.connectedComponentsWithStats(land,8)
for i in range(1,n_):
    x_,y_,w_,h_,a_=st_[i]
    if a_<1500 or x_<=2 or y_<=2 or x_+w_>=W-2 or y_+h_>=H-2: land[lab_==i]=0   # specks, and stains touching the border
_o=cv2.morphologyEx(land,cv2.MORPH_OPEN,np.ones((15,15),np.uint8)); _z=np.zeros_like(land); _z[280:620,630:700]=1; land=np.where((_z>0)&(isl2==0),_o,land).astype(np.uint8)
land[258:292,676:716]=0; land[300:384,694:724]=np.where(isl2[300:384,694:724]>0,1,0)   # halo leftovers: a false second bridge, and a stray blob
n_,lab_,st_,_=cv2.connectedComponentsWithStats(land,8)
for i in range(1,n_):
    if st_[i,cv2.CC_STAT_AREA]<2500: land[lab_==i]=0
sea=(1-land).astype(np.uint8); n2,lab2,st2,_=cv2.connectedComponentsWithStats(sea,4)
for i in range(1,n2):
    if st2[i,cv2.CC_STAT_AREA]<1500: land[lab2==i]=1   # fill holes left by labels and town marks
landS=cv2.resize(land,(OW,OH),interpolation=cv2.INTER_AREA)>0
# grim it: land keeps some colour, parchment goes dark and sepia
g=small.mean(axis=2,keepdims=True)
small=g+(small-g)*0.62
small=(small-128)*1.18+128
small=small*0.78+np.array([6,4,2])
small[~landS]=small[~landS]*0.55+np.array([22,14,8])
small=np.clip(small,0,255).astype(np.uint8)
# parchment grain and darkened edges (burnt parchment)
rng=np.random.default_rng(3)
small=np.clip(small.astype(int)+rng.integers(-6,7,small.shape[:2])[...,None],0,255).astype(np.uint8)
yy,xx=np.mgrid[0:OH,0:OW]; d=np.maximum(np.abs(xx/OW-0.5)*2,np.abs(yy/OH-0.5)*2)
small=(small*(1-np.clip((d-0.78)/0.22,0,1)[...,None]*0.55)).astype(np.uint8)
P=Image.fromarray(small).quantize(colors=28,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE).convert('RGB')
A=np.array(P)
# inked coastline and a pale rim just inside it
L=landS.astype(np.uint8); coast=L-cv2.erode(L,np.ones((3,3),np.uint8)); rim=cv2.erode(L,np.ones((3,3),np.uint8))-cv2.erode(L,np.ones((5,5),np.uint8))
A[coast>0]=(34,24,22); A[rim>0]=np.clip(A[rim>0].astype(int)+18,0,255)
outside=cv2.dilate(L,np.ones((5,5),np.uint8))-cv2.dilate(L,np.ones((3,3),np.uint8))
A[outside>0]=(A[outside>0]*0.8).astype(np.uint8)
# Etharis mask from the source colours, for the in-game glow outline
sm=cv2.resize(im,(OW,OH),interpolation=cv2.INTER_NEAREST)
h2=cv2.cvtColor(sm,cv2.COLOR_RGB2HSV)
green=((h2[...,0]>25)&(h2[...,0]<45)&(h2[...,1]>50)&(h2[...,2]>120)).astype(np.uint8)
green[:, int(OW*0.47):]=0
green=cv2.morphologyEx(green,cv2.MORPH_CLOSE,np.ones((5,5),np.uint8))
n,lab,st,_=cv2.connectedComponentsWithStats(green,8); big=1+np.argmax(st[1:,cv2.CC_STAT_AREA]); eth=(lab==big).astype(np.uint8)
edge=eth-cv2.erode(eth,np.ones((3,3),np.uint8))
# pixel labels
F={'A':["01110","10001","10001","11111","10001","10001","10001"],'B':["11110","10001","10001","11110","10001","10001","11110"],'D':["11110","10001","10001","10001","10001","10001","11110"],
'E':["11111","10000","10000","11110","10000","10000","11111"],'F':["11111","10000","10000","11110","10000","10000","10000"],'G':["01111","10000","10000","10011","10001","10001","01111"],
'H':["10001","10001","10001","11111","10001","10001","10001"],'I':["11111","00100","00100","00100","00100","00100","11111"],'L':["10000","10000","10000","10000","10000","10000","11111"],
'N':["10001","11001","10101","10101","10011","10001","10001"],'O':["01110","10001","10001","10001","10001","10001","01110"],'R':["11110","10001","10001","11110","10100","10010","10001"],
'S':["01111","10000","10000","01110","00001","00001","11110"],'T':["11111","00100","00100","00100","00100","00100","00100"],'U':["10001","10001","10001","10001","10001","10001","01110"],
'V':["10001","10001","10001","10001","01010","01010","00100"],'W':["10001","10001","10001","10101","10101","11011","10001"],'Z':["11111","00001","00010","00100","01000","10000","11111"],' ':["000","000","000","000","000","000","000"]}
def text(A,s,cx,cy,col,sc=1,halo=(14,10,12)):
    w=sum((len(F[c][0])+1)*sc for c in s)-sc; x0=int(cx-w/2); y0=int(cy-7*sc/2)
    pts=[]; x=x0
    for c in s:
        g=F[c]
        for r in range(7):
            for k in range(len(g[0])):
                if g[r][k]=='1':
                    for a in range(sc):
                        for b in range(sc): pts.append((x+k*sc+a,y0+r*sc+b))
        x+=(len(g[0])+1)*sc
    for (px,py) in pts:
        for dx,dy in ((1,0),(-1,0),(0,1),(0,-1),(1,1)):
            if 0<=py+dy<A.shape[0] and 0<=px+dx<A.shape[1]: A[py+dy,px+dx]=halo
    for (px,py) in pts: A[py,px]=col
k=OW/W
INK=(222,206,170); DIM=(190,176,146)
#text(A,"ETHARIS",410*k,445*k,INK)
#text(A,"THE FROZEN VALE",620*k,128*k,DIM)
#text(A,"FELBRIN",895*k,222*k,DIM)
#text(A,"THE RINGVAL WILDS",1160*k,425*k,DIM)
#text(A,"DURTE",1290*k,548*k,DIM)
#text(A,"TALVORA",OW/2,16,(232,200,140),2)
Image.fromarray(A).save('talvora_px.png')
Image.fromarray(edge*255).save('etharis_edge.png')
Image.fromarray(A).resize((OW*3,OH*3),Image.NEAREST).save('talvora_px_x3.png')
def b64(img):
    bio=io.BytesIO(); img.save(bio,'PNG',optimize=True); return base64.b64encode(bio.getvalue()).decode()
ea=np.zeros((OH,OW,4),np.uint8); ea[edge>0]=(255,214,140,255)
open('src/parts/02k_map_data.js','w').write('/* Talvora map (Ryan\'s own map, pixelated) and the outline of Etharis, for the first intro slide */\nconst TALVORA_MAP_PNG = "data:image/png;base64,'+b64(Image.fromarray(A))+'";\nconst ETHARIS_EDGE_PNG = "data:image/png;base64,'+b64(Image.fromarray(ea))+'";\n')
print(OW,OH, ink.sum(), eth.sum())
