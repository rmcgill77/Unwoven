# Bakes the approved weapon icons and the gear icons from the loot packs into one grimmed strip.
import sys, json, base64, io
from PIL import Image, ImageEnhance
S = sys.argv[1]
W = S + '/wpn/Icons/'; B = S + '/bow/PNG/Transperent/'; G = S + '/loot/gob/PNG/Transperent/Icon'; U = S + '/loot/und/PNG/Transperent/Icon'
def grim(im, sat=0.72, br=0.86):
    a = im.split()[3]; rgb = ImageEnhance.Color(im.convert('RGB')).enhance(sat); rgb = ImageEnhance.Brightness(rgb).enhance(br)
    r, g, b = rgb.split(); b = b.point(lambda v: min(255, int(v * 1.04))); out = Image.merge('RGBA', (r, g, b, a)); return out
M = {
 'tessablade': W+'Iicon_32_01.png', 'ironblade': W+'Iicon_32_02.png', 'wayblade': W+'Iicon_32_03.png', 'greyedge': W+'Iicon_32_07.png',
 'fortblade': W+'icon_32_2_06.png', 'leyblade': W+'Iicon_32_09.png', 'frostcrown': W+'Iicon_32_18.png', 'hakoncleaver': W+'Iicon_32_23.png',
 'shortbow': B+'Icon21_no_effect.png', 'bow_b': B+'Icon24.png', 'crossbow': B+'Icon27_no_effect.png', 'bow_t1a': B+'Icon8_no_effect.png', 'bow_t1b': B+'Icon15_no_effect.png', 'bow_t2a': B+'Icon16_no_effect.png', 'bow_t2b': B+'Icon19_no_effect.png',
 'paddedcoat': G+'20.png', 'ringmail': G+'17.png', 'brigandine': G+'18.png', 'fortplate': G+'19.png', 'weaverplate': G+'13.png',
 'leathercap': G+'22.png', 'kettlehat': U+'44.png', 'sallet': G+'14.png', 'greathelm': G+'21.png', 'rimefang': U+'27.png',
 'ashcharm': U+'30.png', 'thistlepin': U+'18.png', 'leycharm': U+'28.png', 'scholarseal': U+'19.png', 'fangcharm': G+'12.png',
}
ids = list(M); strip = Image.new('RGBA', (32 * len(ids), 32))
for i, k in enumerate(ids):
    im = Image.open(M[k]).convert('RGBA')
    if im.size != (32, 32): im = im.resize((32, 32), Image.NEAREST)
    strip.paste(grim(im), (i * 32, 0))
buf = io.BytesIO(); strip.save(buf, 'PNG', optimize=True)
open('src/parts/06g2_gear_data.js', 'w').write('/* Gear icons from the craftpix weapon, bow and loot packs, grimmed and baked by concept/gear_bake.py */\nconst GEAR_ATLAS = ' + json.dumps({'ids': ids, 'src': 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()}, separators=(',', ':')) + ';\n')
strip.resize((strip.width * 3, 96), Image.NEAREST).save(S + '/gear_strip.png'); print(len(ids), len(buf.getvalue()))
