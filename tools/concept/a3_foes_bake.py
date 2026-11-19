# Act 3 foes for the Western Crags, from the craftpix packs Ryan supplied: skeleton miners (Skeleton 1, dusted with
# ore-grime), the old pines' ents (Ent 3 darkened to pine, Ent 1 as dead wood), and the shrine's stone warden (Golem 2,
# its crystals turned to the shrine's word-light). Top-down sheets: the third row walks left, toward the party.
from PIL import Image, ImageEnhance, ImageOps
import json, base64, io, sys
R = '/home/claude/durinn/'; P3 = '/home/claude/packs3/'


def grim(f, sat=0.6, br=0.78, tint=None, ta=0):
    a = f.split()[3]; rgb = ImageEnhance.Brightness(ImageEnhance.Color(f.convert('RGB')).enhance(sat)).enhance(br)
    if tint: rgb = Image.blend(rgb, Image.new('RGB', rgb.size, tint), ta)
    o = rgb.convert('RGBA'); o.putalpha(a); return o


def strip(path, cell, row=2):
    im = Image.open(path).convert('RGBA')
    fr = [im.crop((i * cell, row * cell, (i + 1) * cell, (row + 1) * cell)) for i in range(im.size[0] // cell)]
    return [f for f in fr if f.getbbox()]


def pick(fr, n):
    if len(fr) <= n: return fr
    return [fr[round(i * (len(fr) - 1) / (n - 1))] for i in range(n)]


PREV = {}


def pack(groups, name, scale=1):
    if scale != 1: groups = {k: [f.resize((round(f.width * scale), round(f.height * scale)), Image.NEAREST) for f in v] for k, v in groups.items()}
    allf = [f for v in groups.values() for f in v]
    x0 = min(f.getbbox()[0] for f in allf); y0 = min(f.getbbox()[1] for f in allf); x1 = max(f.getbbox()[2] for f in allf); y1 = max(f.getbbox()[3] for f in allf)
    cw, ch = x1 - x0, y1 - y0; order, cells = [], []
    for k, v in groups.items(): order.append([k, len(v)]); cells += [f.crop((x0, y0, x1, y1)) for f in v]
    at = Image.new('RGBA', (cw * len(cells), ch), (0, 0, 0, 0))
    for i, c in enumerate(cells): at.paste(c, (i * cw, 0))
    b = io.BytesIO(); at.save(b, 'PNG', optimize=True)
    print(name, cw, ch, len(cells), len(b.getvalue()))
    PREV[name] = (groups, cw, ch, x0, y0)
    foot = y1 - max(f.getbbox()[3] for f in groups['idle'])
    return {'cw': cw, 'ch': ch, 'foot': foot, 'n': dict(order), 'src': 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()}


out = {}


def topdown(key, base, cell, scale, prep, caps=None):
    caps = caps or {}
    g = {}
    for kind, f in (('idle', 'Idle'), ('attack', 'Attack'), ('hurt', 'Hurt'), ('dead', 'Death')):
        n = caps.get(kind, {'idle': 4, 'attack': 7, 'hurt': 4, 'dead': 6}[kind])
        g[kind] = pick([prep(x) for x in strip(base + f + '_without_shadow.png', cell)], n)
    out[key] = pack(g, key, scale)


# skeleton miners: bone gone grey-brown with ore dust; Skeleton 3, horned, as the mine's dead foreman
topdown('skelmin', P3 + 'skel/PNG/Skeleton1/Without_shadow/Skeleton1_', 64, 3, lambda f: grim(f, .45, .72, (90, 70, 50), .22))
topdown('skelfore', P3 + 'skel/PNG/Skeleton3/Without_shadow/Skeleton3_', 64, 3, lambda f: grim(f, .5, .7, (70, 50, 40), .18))
# the old pines' ents: Ent 3 with its leaves darkened to pine; Ent 1 as dead wood
topdown('ent', P3 + 'ent/PNG/Ent3/Without_shadow/Ent3_', 128, 2, lambda f: grim(f, .45, .62, (30, 54, 40), .28))
topdown('entdead', P3 + 'ent/PNG/Ent1/Without_shadow/Ent1_', 128, 2, lambda f: grim(f, .4, .66, (60, 54, 50), .2))


# the stone warden: Golem 2's pale stone kept, its violet crystals turned to the word-light of the shrine (pale gold)
def warden(f, red=0):
    a0 = f.copy(); f = grim(f, .62, .8); a = f.split()[3]; px = f.load(); src = a0.load()
    for y in range(f.height):
        for x in range(f.width):
            r, g, b, al = src[x, y]
            if al and (b > g + 25 or r > g + 40) and abs(r - b) < 120 and max(r, b) > 90:     # the crystals, violet (or flushed red when struck)
                k = (r + g + b) / 3 / 255
                px[x, y] = (int(120 + 90 * k), int(112 + 80 * k), int(70 + 50 * k), al)
    if red: f = Image.composite(Image.blend(f, Image.new('RGBA', f.size, (150, 40, 40, 255)), red), f, a)
    return f


GB = R + 'assets6/golem/PNG/Golem2/Without_shadow/Golem2_'
gi = pick([warden(x) for x in strip(GB + 'Idle_without_shadow.png', 128)], 4)
ga = pick([warden(x) for x in strip(GB + 'Attack_without_shadow.png', 128)], 9)
gd = pick([warden(x) for x in strip(GB + 'Death_without_shadow.png', 128)], 8)
gh = [warden(strip(GB + 'Idle_without_shadow.png', 128)[0], r) for r in (0.45, 0.3, 0.15)]   # struck: the stone flushes, the crystals keep their light
out['warden'] = pack({'idle': gi, 'attack': ga, 'hurt': gh, 'dead': gd}, 'warden', 4)

# the curse's own creatures, from the Tiny Monsters pack: side-on sheets one frame tall, already facing the party (left),
# their bright hides drained and bruised toward the curse's violet; skull faces kept pale
TM = '/home/claude/packs5/tiny/'
def tside(key, d, scale, caps=None):
    caps = caps or {}
    def frames(f):
        im = Image.open(TM + d + '/' + f + '.png').convert('RGBA'); h = im.height
        return [im.crop((i * h, 0, (i + 1) * h, h)) for i in range(im.width // h) if im.crop((i * h, 0, (i + 1) * h, h)).getbbox()]
    prep = lambda f: grim(f, .48, .74, (70, 44, 80), .26)
    g = {k: pick([prep(x) for x in frames(f)], caps.get(k, {'idle': 4, 'attack': 6, 'hurt': 4, 'dead': 6}[k])) for k, f in (('idle', 'Idle'), ('attack', 'Attack'), ('hurt', 'Hurt'), ('dead', 'Death'))}
    out[key] = pack(g, key, scale)
tside('cbear', '1 Bear', 2.6)
tside('cseer', '2 Mage', 2.4)
tside('cooze', '3 Ooze', 2.2)
tside('chorn', '4 Red', 2.4)
tside('cspike', '5 Tiny', 2.2)
tside('cgrub', '6 Yellow', 2.2)
js = '/* Act 3 foes for the Western Crags, grimmed and baked by concept/a3_foes_bake.py (craftpix skeleton, ent and golem packs) */\nObject.assign(FOE_ATLAS, ' + json.dumps(out, separators=(',', ':')) + ');\n'
open(R + 'src/parts/02u_act3_foes_data.js', 'w').write(js); print('total', len(js))
from PIL import ImageDraw
Wt = 1800; y = 0; sheet = Image.new('RGB', (Wt, 3000), (34, 30, 40)); d = ImageDraw.Draw(sheet)
for name, (g, cw, ch, x0, y0) in PREV.items():
    x = 90; d.text((6, y + 4), name, fill=(232, 217, 180))
    for k, v in g.items():
        for f in v:
            c = f.crop((x0, y0, x0 + cw, y0 + ch))
            if x + cw > Wt: x = 90; y += ch + 4
            sheet.paste(c, (x, y), c); x += cw + 2
    y += ch + 10
sheet.crop((0, 0, Wt, y)).save(sys.argv[1] if len(sys.argv) > 1 else '/tmp/a3foes.png')
