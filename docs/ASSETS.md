# Raw asset packs (not in the repo)

Third-party licensed packs live in assets/ ... assets14/ on the author's machine (about 2.7 GB). They are only needed to re-run the bake scripts in concept/; their baked output is already in src/parts/02*_data.js. Do not commit them; check each pack's licence before redistributing. Credits are shown in-game.

## assets
- free-fantasy-enemies-pixel-art-sprite-pack
- free-knight-character-sprites-pixel-art
- free-pixel-art-fantasy-2d-battlegrounds
- free-pixel-magic-sprite-effects-pack
- free-predator-plant-mobs-pixel-art-pack
- free-robot-pixel-art-sprite-sheets
- free-rocks-pixel-art-asset-pack
- free-slime-sprite-sheets-pixel-art
- free-warrior-pixel-art-sprite-sheets
## assets10
- 900a483c
- f5ac169b
## assets11
- adventure-fantasy-book-pixel-art
- bestiary-book-pixel-art-asset-pack
- fantasy-adventure-book-pixel-ui-asset-pack
- fantasy-bestiary-ui-monster-pixel-art-pack
- free-animated-magic-book-pixel-art-asset-pack
- free-bridges-top-down-pixel-art-asset-pack
- hp-mana-stamina-and-scroll-bar-pixel-rpg-asset-pack
- pixel-art-bestiary-monsters-asset-pack-2
- pixel-art-resources-and-icons-basic-pack
- rpg-magic-icons-spellbook-pixel-ui-pack
- treasure-32x32-objects-and-icons-pixel-pack
## assets12
- 16-Bit_Starter_Pack_-_Bit_By_Bit_Sound__FREE_DOWNLOAD_.zip
- 7bb53962-craftpix-net-189510-grassland-top-down-tileset-pixel-art.zip
- Free_Fantasy_SFX_Pack_By_TomMusic.zip
- music
- sfx
## assets13
- 1 Frames
- 2 Bars
- 3 Icons
- 4 Palette
- 5 Logo
- 6 Font
- Font.txt
- License.txt
- PSD
## assets14
- 100-pixel-art-weapon-icons-pack-3
- 100-potion-pixel-art-icons
- 1000-rpg-icons-pixel-art-pack
- cloak-and-belt-pixel-art-32x32-icon-pack
- epic-weapons-pixel-art-rpg-icon-pack
- pixel-art-rpg-items-32x32-for-games
- resource-rpg-icons-32x32-pixel-art
- ring-earring-and-amulet-pixel-art-icons
- rpg-icons-pixel-art-equipment-sets
- rpg-potions-pixel-art-pack
- things-for-rpg-game-32x32-pixel-art
## assets2
- 32x32-pixel-art-weapons-free-collection
- free-2d-top-down-pixel-dungeon-asset-pack
- free-low-level-monsters-pixel-icons-32x32
- free-path-and-road-top-down-pixel-tileset
- free-prototype-dialogue-portraits-for-pixel-games
- free-top-down-hunt-animals-pixel-sprite-pack
- free-top-down-pixel-art-guild-hall-asset-pack
- free-top-down-ruins-pixel-art
- free-tree-pixel-art-asset-pack
## assets3
- 0f9a3e44
- 2f738184
- 358c3377
- 54fb0089
- 62a730f9
- 815ea604
- b85faa9d
## assets4
- How to Use.pdf
- Separated Audio Files.rar
- xDeviruchi - And The Journey Begins!.wav
- xDeviruchi - Decisive Battle.wav
- xDeviruchi - Exploring The Unknown.wav
- xDeviruchi - Minigame .wav
- xDeviruchi - Mysterious Dungeon.wav
- xDeviruchi - Prepare for Battle! .wav
- xDeviruchi - Take some rest and eat some food!.wav
- xDeviruchi - The Final of The Fantasy.wav
- xDeviruchi - The Icy Cave .wav
- xDeviruchi - Title Theme.wav
## assets5
- COUPON.pdf
- COUPON.png
- Fire Wizard
- Font.txt
- Free Assets Craftpix!.url
- Licens.txt
- Lightning Mage
- PSD
- Wanderer Magican
## assets6
- golem
- orc
- paths
- skel
- slime
- slimeSide
- slimeTD
## assets7
- elemental-magic-projectiles-top-down-pixel-art-asset-pack
- fantasy-chibi-female-sprite-sheets-pixel-art
- fantasy-chibi-male-sprites-pixel-art
- free-fantasy-chibi-female-sprites-pixel-art
- free-fantasy-chibi-male-sprites-pixel-art
- magic-buff-effects-pack-for-top-down-games
- mega-boss-for-pixel-platformer-character-pack
- out
- rpg-heroes-pixel-art-asset-pack
- trader
## assets8
- 0ee97ae9-craftpix-net-882062-free-winter-backgrounds-pixel-art
- craftpix-net-593685-free-4-nature-backgrounds-for-rpg-battle
- craftpix-net-807934-fantasy-horizontal-battle-backgrounds
## assets9
- 3e2da069
- 48fe3924
- aa713b91
- af7bd614
- d98b1275
- e196a1a3
- f8f4fde3
- cavebg: cave battle backdrops (from packs4/cavebg), used by concept/battlebg_bake.py
- fieldbg: outdoor battle backdrops (summerwood, autumnfield, cursed, canyon), used by concept/battlebg_bake.py
- portal: glowing_ring.png (Totem_animation from the glowing cave pack), kept for portals in a later act; not yet baked

## assets15
- craftpix Free Top-Down Trees pixel art (baked into src/parts/02r_tree_data.js by concept/tree_bake.py)

## Act 3 packs (outside the repo folder on the author's machine: packs3 to packs6, and assets12's zip)
- packs3/cursedobj, packs3/cursedtiles, packs3/undeadobj: craftpix cursed land and undead objects (baked into src/parts/02t_curse_data.js by concept/curse_bake.py)
- packs3/skel, packs3/ent: craftpix skeleton and ent sprite packs (baked into src/parts/02u_act3_foes_data.js by concept/a3_foes_bake.py; the stone warden comes from assets6/golem)
- packs4/caveobj, packs4/glowcave: craftpix top-down cave objects and glowing cave tileset (baked into src/parts/02v_cave_data.js by concept/cave_bake.py)
- packs4/cavebg: cave battle backgrounds (copied to assets9/cavebg)
- packs5/tiny: craftpix Tiny Monsters (curse creatures, also in 02u_act3_foes_data.js)
- packs6/grass: craftpix Grassland top-down tileset, unzipped from assets12 (bushes, stones in turf, tufts, pebbles, stumps baked into src/parts/02w_nature_data.js by concept/nature_bake.py)
