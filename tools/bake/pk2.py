from PIL import Image, ImageDraw
import glob, os, sys
R='assets2/'
def sheet(pack, pats, out, n=24, cell=112, cols=8, maxsrc=None):
    fs=[]
    for p in pats: fs+=sorted(glob.glob(R+pack+'/'+p,recursive=True))
    fs=[f for f in fs if 'oupon' not in f and 'preview' not in f.lower()][:n]
    rows=(len(fs)+cols-1)//cols
    im=Image.new('RGB',(cols*cell,rows*(cell+12)),(40,38,46)); d=ImageDraw.Draw(im)
    for i,f in enumerate(fs):
        try: a=Image.open(f).convert('RGBA')
        except Exception: continue
        s=min((cell-6)/a.size[0],(cell-6)/a.size[1]); s=min(s,4) if min(a.size)<48 else s
        a=a.resize((max(1,int(a.size[0]*s)),max(1,int(a.size[1]*s))),Image.NEAREST)
        x=(i%cols)*cell+(cell-a.size[0])//2; y=(i//cols)*(cell+12)+2
        im.paste(a,(x,y),a); d.text(((i%cols)*cell+2,(i//cols)*(cell+12)+cell-2),os.path.basename(f)[:18],fill=(190,190,200))
    im.save(out); print(out,im.size,len(fs))
sheet('free-tree-pixel-art-asset-pack',['PNG/*.png'],'concept/p2_trees.png',n=24,cell=130,cols=8)
sheet('free-top-down-hunt-animals-pixel-sprite-pack',['PNG/Without_shadow/*/*Idle*.png'],'concept/p2_animals.png',n=16,cell=130,cols=8)
sheet('free-low-level-monsters-pixel-icons-32x32',['PNG/Transperent/*.png'],'concept/p2_monsters.png',n=50,cell=72,cols=10)
sheet('32x32-pixel-art-weapons-free-collection',['Icons/*.png'],'concept/p2_weapons.png',n=70,cell=72,cols=14)
sheet('free-top-down-ruins-pixel-art',['PNG/Assets_texture_shadow/*.png'],'concept/p2_ruins.png',n=24,cell=130,cols=6)
sheet('free-prototype-dialogue-portraits-for-pixel-games',['Prototype/*.png'],'concept/p2_portraits.png',n=18,cell=150,cols=6)
G='free-top-down-pixel-art-guild-hall-asset-pack/PNG/'
sheet('free-top-down-pixel-art-guild-hall-asset-pack',['PNG/Exterior.png','PNG/Interior_objects.png','PNG/Citizen1_Idle_without_shadow.png','PNG/Citizen2_Idle_without_shadow.png','PNG/Mage1_without_shadow.png','PNG/Mage3_without_shadow.png','PNG/Guildmaster.png','PNG/Fighter2_Idle_without_shadow.png'],'concept/p2_guild.png',n=8,cell=260,cols=4)
sheet('free-2d-top-down-pixel-dungeon-asset-pack',['Tiled_files/walls_floor.png','Tiled_files/Objects.png','Tiled_files/doors_lever_chest_animation.png','Tiled_files/Water_coasts_animation.png'],'concept/p2_dungeon.png',n=4,cell=330,cols=4)
sheet('free-path-and-road-top-down-pixel-tileset',['PNG_Tiled/*.png'],'concept/p2_roads.png',n=8,cell=250,cols=4)
