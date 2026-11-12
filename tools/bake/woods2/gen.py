import random, json
def grid(w,h,fill='T'): return [[fill]*w for _ in range(h)]
def carve(g,x0,y0,x1,y1,c='.'):
    for y in range(y0,y1+1):
        for x in range(x0,x1+1): g[y][x]=c
def sprinkle(g,seed,ground='.'):
    r=random.Random(seed)
    for y,row in enumerate(g):
        for x,c in enumerate(row):
            if c=='.':
                v=r.random()
                row[x]=',' if v<.2 else '*' if v<.26 else 'b' if v<.30 else 'r' if v<.325 else '.'
def edge_trees(g):
    h=len(g);w=len(g[0]); r=random.Random(5)
    for y in range(h):
        for x in range(w):
            if g[y][x]!='T' and (x in(0,1,w-1,w-2) or y in (0,1)): g[y][x]='T'

# ---------- the Mossed Ruin: 48 x 34
W,H=48,34
g=grid(W,H)
carve(g,4,5,43,30)                                    # clearing
# ragged forest bites into the clearing
r=random.Random(11)
for _ in range(60):
    x=r.randint(3,44);y=r.randint(4,31)
    if min(x-3,44-x,y-4,31-y)<=3: g[y][x]='T'
sprinkle(g,3)
# the hall: broken stone ring x13..34, y9..21
for x in range(13,35):
    for y in (9,21): g[y][x]='#'
for y in range(9,22):
    for x in (13,34): g[y][x]='#'
carve(g,14,10,33,20,'.'); sprinkle_cells=[(x,y) for y in range(10,21) for x in range(14,34)]
rr=random.Random(8)
for x,y in sprinkle_cells:
    v=rr.random(); g[y][x]=',' if v<.12 else '*' if v<.15 else '.'
# breaks in the ring (collapsed sections you can walk through)
for x in (18,19): g[21][x]='.'
for x in (28,29,30): g[21][x]='.'
for y in (14,15): g[y][13]='.'
for y in (12,13): g[y][34]='.'
for x in (16,17): g[9][x]='.'
# inner pillars (stone blocks)
for (x,y) in [(17,13),(17,17),(30,13),(30,17),(20,11),(27,11)]: g[y][x]='#'
# main gate south + north arch
for x in (23,24): g[21][x]='.'; g[9][x]='.'
# road from the south entrance to the gate, then the hall aisle, then north to the grove path
carve(g,23,22,24,33,'='); carve(g,23,10,24,21,'=')
# north: a corridor through the trees up to the top edge
carve(g,23,2,24,8,'=')
for y in range(2,9):
    for x in (22,25):
        if g[y][x]!='=': g[y][x]='T' if y<6 else ','
# south entrance corridor to the edge
for y in range(31,34):
    for x in (22,25): g[y][x]='T'
edge_trees(g)
g[33][23]=g[33][24]='='; 
for y in (0,1): 
    for x in (23,24): g[y][x]='T'
carve(g,23,1,24,1,'=')
g[24][25]='S'
rows=[''.join(r) for r in g]
ruin=dict(name="The Mossed Ruin",outside=True,wild_zone=True,rows=rows)
ruin['props']=[
 {"p":"rubble","x":20,"y":16},{"p":"rubble","x":27,"y":15},{"p":"rubble","x":16,"y":19},{"p":"rubble","x":31,"y":19},
 {"p":"shroom","x":15,"y":11},{"p":"shroom","x":32,"y":11},{"p":"shroom","x":21,"y":19,"id":"ru_sh"},
 {"p":"bones","x":26,"y":18},{"p":"bones","x":19,"y":13},
 {"p":"herbpatch","x":8,"y":14,"id":"ru_h1"},{"p":"herbpatch","x":38,"y":24,"id":"ru_h2"},{"p":"herbpatch","x":40,"y":12,"id":"ru_h3"},
 {"p":"chest","x":31,"y":10,"id":"c_ruin"},
 {"p":"deadlog","x":9,"y":26},{"p":"deadlog","x":36,"y":6},
 {"p":"shroom","x":12,"y":24},{"p":"shroom","x":37,"y":17},
]
ruin['warps']=[{"x":23,"y":33,"to":"wood","tx":21,"ty":3,"dir":"down"},{"x":24,"y":33,"to":"wood","tx":22,"ty":3,"dir":"down"},
 {"x":23,"y":1,"to":"grove","tx":19,"ty":27,"dir":"up"},{"x":24,"y":1,"to":"grove","tx":20,"ty":27,"dir":"up"}]
ruin['signs']={"25,24":["A stone post, green with moss. Old Tongue is cut into it, worn almost smooth. You can make out one word: 'keep'."]}
ruin['wild']=[{"x":14,"y":26,"group":["redcap","mandrake"]},{"x":38,"y":28,"group":["thornhound","wolf"]},{"x":25,"y":15,"group":["mandrake","mandrake"]}]
ruin['wildNight']=[{"x":22,"y":14,"group":["leywolf","thornhound"]}]

# ---------- the Heartwood Grove: 40 x 30
W,H=40,30
g=grid(W,H)
# round clearing around (20,13), radius ~10, plus a throat to the south
import math
for y in range(H):
    for x in range(W):
        if math.hypot((x-20)/1.25,(y-13))<9.5: g[y][x]='.'
carve(g,19,20,20,28,'=')                      # the path in
carve(g,18,20,21,22,'.')
sprinkle(g,9)
# ring of standing roots (stone) around the boss's court
for a in range(0,360,30):
    x=int(round(20+12*math.cos(math.radians(a))*0.0+0)); 
# trees knot back in: leave a court clear
carve(g,19,20,20,28,'=')
for y in range(23,29):
    for x in (18,21): g[y][x]='T'
g[13][20]=','
for yy in range(6,20):
    for xx in range(17,24):
        if g[yy][xx] in 'br': g[yy][xx]='.'
# the reward chest is behind the boss
g[5][20]='.'
for x in range(8,33):
    for y in range(H):
        pass
edge_trees(g)
g[29][19]=g[29][20]='='
rows=[''.join(r) for r in g]
grove=dict(name="The Heartwood Grove",outside=True,wild_zone=True,rows=rows)
grove['props']=[
 {"p":"chest","x":20,"y":5,"id":"c_grove"},
 {"p":"bones","x":17,"y":9},{"p":"bones","x":23,"y":10},{"p":"bones","x":19,"y":16},{"p":"bones","x":22,"y":15},
 {"p":"rubble","x":14,"y":10},{"p":"rubble","x":26,"y":9},
 {"p":"shroom","x":15,"y":14},{"p":"shroom","x":25,"y":13},{"p":"shroom","x":18,"y":6},{"p":"shroom","x":22,"y":6},
 {"p":"herbpatch","x":13,"y":16,"id":"gr_h1"},{"p":"herbpatch","x":27,"y":17,"id":"gr_h2"},
]
grove['warps']=[{"x":19,"y":29,"to":"ruin","tx":23,"ty":3,"dir":"down"},{"x":20,"y":29,"to":"ruin","tx":24,"ty":3,"dir":"down"}]
grove['signs']={}
grove['wild']=[{"x":20,"y":11,"group":["thornmother"]}]
grove['wildNight']=[]
for m in (ruin,grove):
    for r in m['rows']: assert len(r)==len(m['rows'][0])
out="\n/* the north woods grow deeper: the Mossed Ruin and the Heartwood Grove (plant boss) */\nMAP_DEFS.ruin = "+json.dumps(ruin,separators=(',',':'))+";\nMAP_DEFS.grove = "+json.dumps(grove,separators=(',',':'))+";\n"
open('concept/woods2/woods2.js','w').write(out)
print("\n".join(ruin['rows'])); print(); print("\n".join(grove['rows']))
