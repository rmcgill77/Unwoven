# Act 2 foes: craftpix side-view packs, the hunt-animal boar, the predator plant, monster-pack icons and a golem
# assembled from the rocks pack. Grimmed, turned to face left (the party stands on the left), and baked to atlases.
from PIL import Image, ImageEnhance, ImageOps
import json, base64, io, math, sys
R = '/home/claude/durinn/'
def grim(f, sat=0.6, br=0.78, tint=None, ta=0):
    a = f.split()[3]; rgb = ImageEnhance.Brightness(ImageEnhance.Color(f.convert('RGB')).enhance(sat)).enhance(br)
    if tint: rgb = Image.blend(rgb, Image.new('RGB', rgb.size, tint), ta)
    o = rgb.convert('RGBA'); o.putalpha(a); return o
def strip(path, cell=None, row=0, flip=True):
    im = Image.open(R + path).convert('RGBA'); h = cell or im.size[1]
    fr = [im.crop((i * h, row * h, (i + 1) * h, (row + 1) * h)) for i in range(im.size[0] // h)]
    fr = [f for f in fr if f.getbbox()]
    return [ImageOps.mirror(f) for f in fr] if flip else fr
def pick(fr, n):
    if len(fr) <= n: return fr
    return [fr[round(i * (len(fr) - 1) / (n - 1))] for i in range(n)]
def pack(groups, name, scale=1):
    allf = [f for v in groups.values() for f in v]
    if scale != 1: groups = {k: [f.resize((round(f.width * scale), round(f.height * scale)), Image.NEAREST) for f in v] for k, v in groups.items()}; allf = [f for v in groups.values() for f in v]
    x0 = min(f.getbbox()[0] for f in allf); y0 = min(f.getbbox()[1] for f in allf); x1 = max(f.getbbox()[2] for f in allf); y1 = max(f.getbbox()[3] for f in allf)
    cw, ch = x1 - x0, y1 - y0; order = []; cells = []
    for k, v in groups.items(): order.append([k, len(v)]); cells += [f.crop((x0, y0, x1, y1)) for f in v]
    at = Image.new('RGBA', (cw * len(cells), ch), (0, 0, 0, 0))
    for i, c in enumerate(cells): at.paste(c, (i * cw, 0))
    b = io.BytesIO(); at.save(b, 'PNG', optimize=True)
    print(name, cw, ch, len(cells), len(b.getvalue()))
    PREV[name] = (groups, cw, ch, x0, y0)
    foot = y1 - max(f.getbbox()[3] for f in groups['idle'])   # pixels under the feet (a slam's dust), so the feet still stand on the ground
    return {'cw': cw, 'ch': ch, 'foot': foot, 'n': dict(order), 'src': 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()}
PREV = {}; out = {}
PARTY_H = 75
def side(key, d, files, sat=0.6, br=0.78, tint=None, ta=0, caps=None, bh=None):
    caps = caps or {}; g = {}
    for kind, f in files.items():
        n = caps.get(kind, {'idle': 6, 'attack': 7, 'hurt': 3, 'dead': 5}.get(kind, 6))
        g[kind] = pick([grim(x, sat, br, tint, ta) for x in strip(d + f)], n)
    out[key] = pack(g, key, PARTY_H / bh if bh else 1)
W = 'assets/free-warrior-pixel-art-sprite-sheets/'; K = 'assets/free-knight-character-sprites-pixel-art/'; O = 'assets6/orc/Craftpix_Orc/'; S = 'assets6/skel/'
std = lambda a='Attack_1.png': {'idle': 'Idle.png', 'attack': a, 'hurt': 'Hurt.png', 'dead': 'Dead.png'}
side('bandit1', W + 'Warrior_1/', std(), 0.5, 0.74, bh=45)
side('bandit2', W + 'Warrior_2/', std(), 0.5, 0.72, bh=47)
side('bandit3', W + 'Warrior_3/', {**std(), 'guard': 'Protect.png'}, 0.5, 0.72, bh=47)
side('archer', W + 'Warrior_1/', std(), 0.42, 0.7, (70, 60, 40), 0.18, bh=45)
for i in (1, 2, 3): side(f'knight{i}', K + f'Knight_{i}/', {**std('Attack 1.png'), 'guard': 'Defend.png'}, 0.5, 0.72, bh=64)
side('cleave', K + 'Knight_3/', {**std('Attack 3.png'), 'guard': 'Defend.png', 'special': 'Attack 2.png'}, 0.4, 0.62, (60, 20, 18), 0.12, bh=64)
side('orcW', O + 'Orc_Warrior/', std(), 0.55, 0.74, bh=59)
side('orcB', O + 'Orc_Berserk/', {**std(), 'special': 'Attack_3.png'}, 0.55, 0.74, bh=61)
side('orcS', O + 'Orc_Shaman/', {**std(), 'cast': 'Magic_1.png'}, 0.55, 0.74, bh=63)
side('skelW', S + 'Skeleton_Warrior/', {**std(), 'guard': 'Protect.png'}, 0.55, 0.72, bh=58)
side('skelS', S + 'Skeleton_Spearman/', std(), 0.55, 0.72, bh=58)
side('skelA', S + 'Skeleton_Archer/', std('Shot_1.png'), 0.55, 0.72, bh=58)
side('robot', 'assets/free-robot-pixel-art-sprite-sheets/Destroyer/', {**std(), 'shot': 'Shot_1.png', 'wake': 'Enabling.png', 'stun': 'Shutdown.png'}, 0.45, 0.68, (40, 50, 60), 0.12, {'shot': 8}, bh=77)
# dormant Weaver husks in the west forest ruins: rusted, mossed, slumped where they shut down (scenery, never fought)
RB = 'assets/free-robot-pixel-art-sprite-sheets/'
side('huskI', RB + 'Infantryman/', {'idle': 'Shutdown.png', 'attack': 'Shutdown.png', 'hurt': 'Hurt.png', 'dead': 'Dead.png'}, 0.3, 0.58, (80, 56, 34), 0.28, bh=77)
side('huskS', RB + 'Swordsman/', {'idle': 'Shutdown.png', 'attack': 'Shutdown.png', 'hurt': 'Hurt.png', 'dead': 'Dead.png'}, 0.3, 0.58, (80, 56, 34), 0.28, bh=72)
side('purifier', 'assets5/Fire Wizard/', {**std(), 'cast': 'Fireball.png'}, 0.5, 0.7, (30, 20, 20), 0.15, bh=66)
side('pleader', 'assets5/Lightning Mage/', {**std(), 'cast': 'Light_ball.png'}, 0.45, 0.66, (40, 20, 20), 0.18, bh=63)
# the Fort's sparring roster: Covenant men and women in practice kit, purple and grey
side('sp_recruit', 'assets7/out/covknight/', std(), 0.9, 0.92, bh=48)
side('sp_corporal', 'assets7/out/covxbow/', std(), 0.9, 0.92, bh=48)
side('sp_initiate', 'assets5/Fire Wizard/', {**std(), 'cast': 'Fireball.png'}, 0.55, 0.95, (70, 56, 100), 0.12, bh=62)
side('sp_sergeant', K + 'Knight_2/', {**std('Attack 1.png'), 'guard': 'Defend.png'}, 0.4, 0.88, (70, 56, 100), 0.14, bh=54)
side('sp_curate', 'assets5/Lightning Mage/', {**std(), 'cast': 'Light_ball.png'}, 0.5, 0.95, (80, 64, 110), 0.14, bh=60)
side('wisp', 'assets/free-fantasy-enemies-pixel-art-sprite-pack/Fire_Spirit/', std('Attack.png'), 0.6, 0.78)
# the rat runs on a 70px grid
MC = 'assets3/358c3377/Monsters Creatures Fantasy 2/Rat/'
out['rat'] = pack({'idle': pick([grim(x, .55, .74) for x in strip(MC + 'idle.png', 70)], 6), 'attack': pick([grim(x, .55, .74) for x in strip(MC + 'attack_bite.png', 70)], 7), 'hurt': [grim(x, .55, .74) for x in strip(MC + 'hurt.png', 70)], 'dead': [grim(x, .55, .74) for x in strip(MC + 'rat-death.png', 70)]}, 'rat')
# the boar and the plant: four facings per sheet, the third row walks left
BO = 'assets2/free-top-down-hunt-animals-pixel-sprite-pack/PNG/Without_shadow/Boar/Boar_'
def boar(key, tint=None, ta=0):
    g = lambda f, n: pick([grim(x, .6, .76, tint, ta).resize((64, 64), Image.NEAREST) for x in strip(BO + f, 32, 2, False)], n)
    out[key] = pack({'idle': g('Idle.png', 4), 'attack': g('Attack.png', 5), 'hurt': g('Hurt.png', 4), 'dead': g('Death.png', 6)}, key)
boar('boar'); boar('boarS', (200, 220, 240), 0.32)
PL = 'assets/free-predator-plant-mobs-pixel-art-pack/PNG/Plant1/Without_shadow/Plant1_'
gp = lambda f, n: pick([grim(x, .55, .7) for x in strip(PL + f, 64, 2, False)], n)
out['snapjaw'] = pack({'idle': gp('Idle_without_shadow.png', 4), 'attack': gp('Attack_without_shadow.png', 7), 'hurt': gp('Hurt_without_shadow.png', 4), 'dead': gp('Death_without_shadow.png', 6)}, 'snapjaw', 1.5)
# monster-pack icons, animated in code like the Act 1 wolves
MP = R + 'assets3/62a730f9/Pixel Monster Pack/64x64 monsters/'
def tight(f): return f.crop(f.getbbox())
def xform(base, sx, sy, dx=0, dy=0, flash=0, alpha=1.0, rot=0, Wd=64, Hd=64):
    w, h = base.size; f = base.resize((max(1, round(w * sx)), max(1, round(h * sy))), Image.NEAREST)
    if rot: f = f.rotate(rot, expand=True, resample=Image.NEAREST)
    if flash: f = Image.composite(Image.blend(f, Image.new('RGBA', f.size, (255, 255, 255, 255)), flash), f, f.split()[3])
    if alpha < 1: f.putalpha(f.split()[3].point(lambda v: int(v * alpha)))
    c = Image.new('RGBA', (Wd, Hd), (0, 0, 0, 0)); c.paste(f, (Wd // 2 - f.size[0] // 2 + dx, Hd - 6 - f.size[1] + dy), f); return c
def icon(key, f, Wd, Hd, sat=.55, br=.74, tint=None, ta=0, k=1):
    base = tight(grim(Image.open(MP + f).convert('RGBA'), sat, br, tint, ta))
    if k != 1: base = base.resize((round(base.width * k), round(base.height * k)), Image.NEAREST)
    X = lambda *a, **kw: xform(base, *a, Wd=Wd, Hd=Hd, **kw)
    idle = [X(1 - 0.03 * math.sin(t / 6 * 6.2832), 1 + 0.05 * math.sin(t / 6 * 6.2832)) for t in range(6)]
    att = [X(*a) for a in [(1.05, 0.9, 3, 0), (0.92, 1.08, 8, -2), (1.2, 0.88, -10, 0), (1.12, 0.95, -14, 0), (1, 1, -6, 0)]]
    hurt = [X(1, 1, d, 0, flash=fl) for fl, d in [(0.8, 4), (0.45, 6), (0.15, 3)]]
    dead = [X(sx, sy, 0, 0, alpha=al) for sx, sy, al in [(1, 1, 1), (1.05, 0.8, .9), (1.1, 0.55, .7), (1.2, 0.3, .4), (1.3, 0.12, .15)]]
    out[key] = pack({'idle': idle, 'attack': att, 'hurt': hurt, 'dead': dead}, key)
LM = R + 'assets2/free-low-level-monsters-pixel-icons-32x32/PNG/Transperent/'
_mp = MP; MP = LM; icon('spiderW', 'Icon32.png', 96, 72, k=2, tint=(200, 220, 240), ta=0.35); MP = _mp
MP = R + 'assets3/62a730f9/Pixel Monster Pack/32x32 monsters/'; icon('wolfF', 'wolf-white.png', 120, 90, k=2, tint=(170, 200, 230), ta=0.25)
# the rock golem: built from cave rocks, eyes lit with ley-light. Every piece stays joined; it slumps rather than falls apart.
RK = R + 'assets/free-rocks-pixel-art-asset-pack/PNG/'
rk = lambda f, k: (lambda im: im.resize((round(im.width * k), round(im.height * k)), Image.NEAREST))(grim(Image.open(RK + f).convert('RGBA'), .7, .78))
# the rock golem: the Golem 1 sheet (top-down pack, the row that walks left), recoloured to grey stone with ley-lit eyes,
# and drawn at four times its size so it stands about twice the party's height
from PIL import ImageOps as _IO
GO = 'assets6/golem/PNG/Golem1/Without_shadow/Golem1_'
def stone(f, red=0):
    a = f.split()[3]; src = f.load()
    L = ImageEnhance.Contrast(f.convert('L')).enhance(1.12)
    g = _IO.colorize(L, (20, 20, 28), (186, 188, 198)).convert('RGBA'); g.putalpha(a); px = g.load()
    for y in range(f.height):
        for x in range(f.width):
            r, gg, b, al = src[x, y]
            if al and r > 190 and gg > 150 and b < 110: px[x, y] = (110, 220, 210, 255)   # the eyes keep their light
    if red: g = Image.composite(Image.blend(g, Image.new('RGBA', g.size, (150, 40, 40, 255)), red), g, a)
    return g
gs = lambda f, n, red=0: pick([stone(x, red) for x in strip(GO + f, 128, 2, False)], n)
gi, ga, gd = gs('Idle_without_shadow.png', 4), gs('Attack_without_shadow.png', 9), gs('Death_without_shadow.png', 8)
gh = [stone(x, r) for x, r in zip(strip(GO + 'Hurt_without_shadow.png', 128, 2, False), (0, 0.35, 0.25, 0.1))]
out['golem'] = pack({'idle': gi, 'attack': ga, 'hurt': gh, 'dead': gd}, 'golem', 4)
js = '/* Act 2 foes, grimmed and baked by concept/foes2_bake.py (craftpix warrior, knight, orc, skeleton, robot, wizard, fire spirit, rat, hunt-animal boar, predator plant, monster pack, rocks) */\nObject.assign(FOE_ATLAS, ' + json.dumps(out, separators=(',', ':')) + ');\n'
open(R + 'src/parts/02h2_foes2_data.js', 'w').write(js); print('total', len(js))
# contact sheet for approval: every foe, every animation, facing the party
from PIL import ImageDraw
rows = []
for name, (g, cw, ch, x0, y0) in PREV.items():
    fr = [(k, f.crop((x0, y0, x0 + cw, y0 + ch))) for k, v in g.items() for f in v]
    rows.append((name, fr, cw, ch))
Wt = 1800; y = 0; sheet = Image.new('RGB', (Wt, 6000), (34, 30, 40)); d = ImageDraw.Draw(sheet)
for name, fr, cw, ch in rows:
    x = 90; d.text((6, y + 4), name, fill=(232, 217, 180)); rh = ch
    for k, f in fr:
        if x + cw > Wt: x = 90; y += rh + 4
        sheet.paste(f, (x, y), f); x += cw + 2
    y += rh + 10
sheet.crop((0, 0, Wt, y)).save(sys.argv[1] if len(sys.argv) > 1 else '/tmp/foes2.png')
