"""numbered contact sheets of the icon packs, so items can be matched to icons by number"""
import glob, os, re, sys
from PIL import Image, ImageDraw, ImageFont
A = "/home/claude/durinn/assets14/"
OUT = "/tmp/claude-0/-home-claude/81f7a483-afca-5415-8c60-809b5595b3f8/scratchpad/idx/"
os.makedirs(OUT, exist_ok=True)
F = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 11)
num = lambda f: [int(x) if x.isdigit() else x for x in re.split(r"(\d+)", os.path.basename(f))]
PACKS = {
    "k": "1000-rpg-icons-pixel-art-pack/32x32/*.png", "e": "rpg-icons-pixel-art-equipment-sets/32x32/*.png", "w": "epic-weapons-pixel-art-rpg-icon-pack/32x32/*.png",
    "p": "rpg-potions-pixel-art-pack/32x32/*.png", "i": "pixel-art-rpg-items-32x32-for-games/Icons/*.png", "r": "resource-rpg-icons-32x32-pixel-art/Icons/*.png",
    "t": "things-for-rpg-game-32x32-pixel-art/Icons/*.png", "a": "ring-earring-and-amulet-pixel-art-icons/Icons/*.png", "c": "cloak-and-belt-pixel-art-32x32-icon-pack/Icons/*.png",
    "x": "100-pixel-art-weapon-icons-pack-3/Icons/*.png",
}
index = {}
for key, pat in PACKS.items():
    fs = sorted(glob.glob(A + pat), key=num)
    for i, f in enumerate(fs): index[f"{key}{i}"] = f
    for part in range(0, len(fs), 240):
        chunk = fs[part:part + 240]; cols = 20; rows = (len(chunk) + cols - 1) // cols
        out = Image.new("RGB", (cols * 60, rows * 74), (52, 48, 46)); d = ImageDraw.Draw(out)
        for j, f in enumerate(chunk):
            im = Image.open(f).convert("RGBA"); im = im.resize((48, 48), Image.NEAREST)
            x, y = (j % cols) * 60 + 6, (j // cols) * 74 + 2
            out.paste(im, (x, y), im); d.text((x, y + 50), f"{key}{part + j}", font=F, fill=(240, 220, 120))
        out.save(OUT + f"{key}_{part // 240}.png")
import json
json.dump(index, open(OUT + "index.json", "w"))
print({k: sum(1 for x in index if x.startswith(k) and x[len(k):].isdigit()) for k in PACKS})
