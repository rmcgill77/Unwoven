# Credits and asset licences

**Unwoven: A Tale of Talvora** is created by Ryan / Burnt Pixel Studios. All rights reserved.

## Music
*8-Bit Fantasy & Adventure Music (2021)* by **xDeviruchi**, from GameDev Market. The pack's manual says the tracks may be used in any commercial or non-commercial project. The game ships them as MP3s in `public/music/`:

| File | Track |
|---|---|
| title.mp3 | Title Theme |
| journey.mp3 | And The Journey Begins! |
| explore.mp3 | Exploring The Unknown |
| dungeon.mp3 | Mysterious Dungeon |
| icy.mp3 | The Icy Cave |
| battle.mp3 | Prepare for Battle! |
| boss.mp3 | Decisive Battle |
| rest.mp3 | Take some rest and eat some food! |
| minigame.mp3 | Minigame |
| final.mp3 | The Final of The Fantasy (End of Act One credits) |

## Art
Character, creature and battle art is built from free packs on **craftpix.net**, recoloured ("grimmed") to the game's palette and baked into the data files in `src/parts/` (base64 PNG atlases). Packs used include:

- Chibi wizard and knight sprites (Corin, Elowyn and the townsfolk bases)
- Slime sprite sheets
- Pixel Monster Pack (wolves)
- Free Predator Plant Mobs (the Thornmother uses Plant 1)
- Top-down hunt animals (deer, hare, grouse, fox)
- Low-level monster icons
- Other packs supplied to the project that are kept for later acts (rocks, ruins, trees, dungeon, guild hall, road tiles, weapons, dialogue portraits, battlegrounds, magic effects)

craftpix licence: https://craftpix.net/file-licenses/ . The assets may be used inside the game, but the **raw pack files must not be redistributed**. That is why `assets/` is gitignored and the raw packs are not in this repository. Keep the repository private if in doubt.

Some art was drawn in code for this game (the town, buildings, terrain, Odile and other custom figures, the bridge, the UI). The intro map is Ryan's own drawing.

## Type
Pixelify Sans (Google Fonts, SIL Open Font License), loaded from fonts.googleapis.com.

## Libraries
React 18 (MIT). esbuild (MIT) for building.

## App icon
The app icon (docs/icon-master.png) was created by Ryan with Gemini and is used as the game's icon.
