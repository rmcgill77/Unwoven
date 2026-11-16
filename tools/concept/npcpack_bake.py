"""Gives every Act 2 townsperson a sprite of their own, so no NPC is ever drawn with the player's sprite.

Bodies come from the packs Ryan supplied (assets9): the peasants pack, the village NPC pack, the witches and the
warrior girls. Each person is one body with its clothes and hair turned to their own colours (skin is left alone),
then grimmed like the rest of the cast, and baked side-on at the party's height like the Covenant soldiers.
Writes src/parts/02n_npc_chibi_data.js and a concept sheet."""
import base64, colorsys, io, json, math
from PIL import Image, ImageDraw, ImageFont

A = "/home/claude/durinn/assets9/"
src = open("/home/claude/durinn/concept/ashchibi_bake.py").read()
exec(src[:src.index("world, battle, sheets")])          # frames(), resample(), union(), strip(), WORLD_H, FOOT

BODIES = {   # key: (folder, idle, walk)
    "farmhand": ("f8f4fde3/Peasants_1", "Idle.png", "Walk.png"),
    "robed": ("f8f4fde3/Peasants_2", "Idle.png", "Walk.png"),
    "woodman": ("f8f4fde3/Peasants_3", "Idle.png", "Walk.png"),
    "smith": ("aa713b91/Peasants_1", "Idle_2.png", None),
    "barmaid": ("aa713b91/Peasants_2", "Idle.png", "Walk.png"),
    "lad": ("aa713b91/Peasants_3", "Idle.png", "Walk.png"),
    "apron": ("aa713b91/Peasants_4", "Idle.png", "Walk.png"),
    "goodwife": ("d98b1275/Witch_1", "Idle.png", "Walk.png"),
    "hooded": ("d98b1275/Witch_2", "Idle.png", "Walk.png"),
    "scholar": ("d98b1275/Witch_3", "Idle.png", "Walk.png"),
    "rover": ("e196a1a3/Girl_1", "Idle.png", "Walk.png"),
    "vestman": ("../assets10/900a483c/Elf_2", "Idle.png", "Walk.png"),     # the elf pack, ears rounded off: elves keep to the Ringval Wilds
    "leafwoman": ("../assets10/900a483c/Elf_3", "Idle.png", "Walk.png"),
    "summermaid": ("../assets10/900a483c/Elf_1", "Idle.png", "Walk.png"),
}
BODIES.update({   # the anime-warrior pack has no walk, only labours: used for two Fort workers who never move
    "hauler": ("../assets10/f5ac169b/Man_1", "Dragging Objects.png", None),
    "sitter": ("../assets10/f5ac169b/Man_2", "Sit down.png", None),
})
ROUND_EARS = {"vestman", "leafwoman", "summermaid"}
# who wears what: (body, hue shift in degrees, saturation, value)
PEOPLE = {
    "hunter": ("woodman", 0, 0.9, 1.0), "trader": ("goodwife", 250, 0.8, 0.95), "wayfarer": ("hooded", 0, 0.6, 0.85),
    "perrin": ("lad", 230, 0.9, 0.95), "winnie": ("barmaid", 0, 1.0, 1.0), "pell": ("farmhand", 140, 0.9, 0.95),
    "osric": ("woodman", 190, 0.4, 0.85), "hobb": ("apron", 0, 1.0, 1.0), "willow": ("goodwife", 0, 1.0, 1.0),
    "brannoc": ("smith", 0, 1.0, 1.0), "ysolde": ("goodwife", 300, 0.9, 1.0), "davytarn": ("woodman", 30, 0.8, 0.95),
    "aldous": ("apron", 40, 0.5, 1.05), "agna": ("hooded", 200, 0.25, 1.1), "mabry": ("barmaid", 80, 0.8, 0.95),
    "ashfolk1": ("goodwife", 330, 0.7, 0.95), "ashfolk2": ("woodman", 120, 0.4, 0.8),
    "ilse": ("scholar", 0, 1.0, 1.0), "gideon": ("apron", 60, 0.9, 1.05), "mags": ("barmaid", 160, 0.6, 0.9),
    "ida": ("rover", 20, 0.6, 0.9), "corran": ("lad", 290, 0.8, 0.95), "brack": ("woodman", 80, 0.7, 0.9),
    "sarn": ("hooded", 230, 0.15, 0.7), "tam": ("farmhand", 200, 0.6, 0.85), "gwfolk": ("farmhand", 30, 0.5, 0.85),
    "ostoll": ("apron", 220, 0.6, 0.9), "bede": ("vestman", 200, 0.35, 0.85), "lisle": ("leafwoman", 0, 0.8, 0.95),
    "dask": ("smith", 200, 0.5, 0.9), "wenn": ("lad", 30, 0.9, 1.0), "orvin": ("hooded", 200, 0.1, 1.25),
    "ama": ("barmaid", 30, 0.7, 1.0), "storek": ("farmhand", 240, 0.4, 0.9), "aurel": ("scholar", 230, 0.7, 0.9),
    "nettle": ("hooded", 110, 0.7, 0.85), "cook": ("vestman", 0, 0.15, 1.15), "prisoner": ("hooded", 20, 0.3, 0.7),
    "ftrecruit": ("lad", 250, 0.4, 0.85), "fthauler": ("hauler", 0, 0.6, 0.9), "ftsitter": ("sitter", 30, 0.5, 0.85), "ftworker": ("goodwife", 30, 0.3, 0.8),
}


def is_skin(r, g, b):
    h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
    return 0.02 <= h <= 0.11 and 0.18 <= s <= 0.62 and v >= 0.45


def dress(im, dh, sm, vm):
    im = im.copy(); px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if not a: continue
            h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            warm = h < 0.16 or h > 0.97                          # skin, hair, leather and wood keep their hue: only cloth changes colour
            if not is_skin(r, g, b) and (s > 0.12 or v > 0.15):
                if not warm: h = (h + dh / 360) % 1
                s = min(1, s * (sm if not warm else (1 + sm) / 2)); v = min(1, v * vm)
            s *= 0.78; v *= 0.9                                  # the cast's grim: a little drained, a little darker
            r, g, b = colorsys.hsv_to_rgb(h, s, v)
            px[x, y] = (round(r * 255), round(g * 255), round(b * 255), a)
    return im


def round_ears(f):
    """the elf pack's ears are little points of skin standing up into the hair behind the face; fill them with hair"""
    f = f.copy(); px = f.load(); w, h = f.size
    bb = f.getbbox()
    if not bb: return f
    top = bb[1]; head_bottom = top + 22
    face = [x for y in range(top, head_bottom) for x in range(w) if px[x, y][3] and is_skin(*px[x, y][:3])]
    if not face: return f
    cx = sorted(face)[len(face) * 3 // 4]                            # the face sits to the right; the ear is behind it
    for _ in range(3):
        hits = []
        for y in range(top, head_bottom):
            for x in range(1, min(w - 1, cx - 3)):
                r, g, b, a = px[x, y]
                if not a or not is_skin(r, g, b): continue
                nb = [px[x + dx, y + dy] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (-1, -1), (1, -1), (-1, 1))]
                hair = [q for q in nb if q[3] and not is_skin(*q[:3])]
                if len(hair) >= 5: hits.append((x, y, max(hair, key=lambda q: sum(q[:3]))))
        for x, y, c in hits: px[x, y] = c
    return f


def load(folder, f):
    im = Image.open(A + folder + "/" + f).convert("RGBA"); h = im.height
    return [im.crop((i * h, 0, i * h + h, h)) for i in range(im.width // h) if im.crop((i * h, 0, i * h + h, h)).getbbox()]


world, previews = {}, {}
for who, (body, dh, sm, vm) in PEOPLE.items():
    folder, fi, fw = BODIES[body]
    rd = round_ears if body in ROUND_EARS else (lambda f: f)
    raw = load(folder, fi)
    if body == "sitter": raw = raw[-3:] + raw[-3:][::-1]           # settled on the ground: only the last, seated frames, rocking a little
    idle = [dress(rd(f), dh, sm, vm) for f in resample(raw, 6)]
    walk = [dress(rd(f), dh, sm, vm) for f in resample(load(folder, fw), 8)] if fw else idle
    s = strip({"idle_down": idle, "walk_down": walk, "idle_up": idle, "walk_up": walk, "idle_side": idle, "walk_side": walk}, WORLD_H)
    hx = (s["head"][0] + s["head"][2]) // 2
    world["n_" + who] = {"png": s["png"], "fw": s["fw"], "fh": s["fh"], "anims": s["anims"], "noBack": True,
                         "anchor": {"down": [s["ax"], 77], "up": [s["ax"], 77], "side": [s["ax"], 77]}, "portrait": [max(0, hx - 24), max(0, s["head"][1] - 2), 48, 48]}
    previews[who] = s["sheet"].crop((0, 0, s["fw"], s["fh"]))
js = ("/* Act 2 townsfolk, one sprite each, from the supplied peasant, village, witch and warrior packs (concept/npcpack_bake.py) */\n"
      "Object.assign(CHIBI_DATA.chars, " + json.dumps(world, separators=(",", ":")) + ");\n"
      "const NPC_SETS = " + json.dumps({k: "n_" + k for k in PEOPLE}) + ";\n")
open("/home/claude/durinn/src/parts/02n_npc_chibi_data.js", "w").write(js)
print("bytes", len(js))
# concept sheet: everyone, at three times size, with Tessa for scale
F = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 12)
NAMES = {"hunter": "Sefton Reeve", "trader": "Mother Fenwick", "wayfarer": "Wayfarer", "perrin": "Init. Perrin", "winnie": "Winnie Fenn", "pell": "Pell Ashby", "osric": "Osric Dunmore",
         "hobb": "Hobb Marlow", "willow": "Mistress Willow", "brannoc": "Brannoc", "ysolde": "Ysolde Finch", "davytarn": "Davy Tarn", "aldous": "Aldous Grist", "agna": "Sister Agna",
         "mabry": "Mabry Cole", "ashfolk1": "Market wife", "ashfolk2": "Old Ned", "ilse": "Ilse Varrow", "gideon": "Gideon Marsh", "mags": "Mags Tull", "ida": "Ida Flint",
         "corran": "Corran Vell", "brack": "Jory Brack", "sarn": "Widow Sarn", "tam": "Tam", "gwfolk": "Greywick man", "ostoll": "Hesk (toll)", "bede": "Bede Marrow",
         "lisle": "Apoth. Lisle", "dask": "Armourer Dask", "wenn": "Wenn Tallow", "orvin": "Chaplain Orvin", "ama": "Ama Brisk", "storek": "Storekeeper", "aurel": "Aurel Vane",
         "nettle": "Nettle", "cook": "Cook Harrow", "prisoner": "Prisoner", "ftrecruit": "Recruit", "ftworker": "Lower-qtr woman", "fthauler": "Crate hauler", "ftsitter": "Worker resting"}
tessa = Image.open("/home/claude/durinn/concept/battle_tessa.png").convert("RGBA").crop((0, 0, 96, 84))
cells = [("Tessa (party)", tessa)] + [(NAMES[k], v) for k, v in previews.items()]
cw, ch, cols, Z = 110, 300, 10, 3
out = Image.new("RGB", (cols * cw * 1 + 20, ((len(cells) + cols - 1) // cols) * (ch // 3 * 1 + 120)), (46, 42, 40)); dr = ImageDraw.Draw(out)
for i, (name, im) in enumerate(cells):
    bb = im.getbbox(); im = im.crop(bb); im = im.resize((im.width * 1, im.height * 1), Image.NEAREST)
    x = 10 + (i % cols) * cw; y = (i // cols) * (ch // 3 + 120)
    g = im.resize((im.width * 1, im.height * 1), Image.NEAREST)
    out.paste(g, (x + (cw - g.width) // 2, y + 100 - g.height), g); dr.text((x + 2, y + 104), name, font=F, fill=(235, 228, 210))
out = out.resize((out.width * 2, out.height * 2), Image.NEAREST)
out.save("/tmp/claude-0/-home-claude/81f7a483-afca-5415-8c60-809b5595b3f8/scratchpad/townsfolk.png"); print(out.size)
