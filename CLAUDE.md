# Unwoven: working notes for Claude Code

Read `README.md` for build, test and release. This file covers how the game is put together and the owner's standing rules.

## The owner's standing rules (keep to these)

- **Approve before publishing:** show concept art or screenshots and get Ryan's approval before shipping any art, character or area change. Text, balance and bug fixes don't need it, but say what changed.
- **Check the supplied packs first:** before drawing any new creature or object, look for it in the supplied asset packs (`assets/`, kept locally, not committed). A hand-drawn monster once replaced pack art by mistake.
- **Look and feel:**
  - Art is **gritty and grim**, never cartoonish.
  - Characters keep the **chibi** style.
  - Supplied packs are **grimmed** to the game's palette.
  - Any sprite that isn't animated must be given code animation.
- **Character rules:**
  - No part of a character may ever separate from the body in any frame.
  - Nothing walks *away* from the camera with an animation; that direction is drawn side-on.
  - Walking toward the camera is animated.
  - Idle characters keep the direction they were walking.
- **Screens:** landscape only, and it must work on phones, the Galaxy Z Fold 7 closed and open, tablets and monitors. A phone held upright gets a "turn your device" screen. The open Fold is near-square and plays either way.
- **World and lore:**
  - Wolves appear only in the woods, the rocks and the caves, never in town.
  - The overworld is a hybrid: a travel map plus walkable scenes.
  - **Finish an act before building the rest of the world.**
- **Story facts:**
  - The player is always a **Quill-mark**, the Clerk's apprentice, a lifelong Oakhaven orphan who is well known in town and never treated as new.
  - The mentor is always **Odile** (she/her).
  - Isaura Thorne, the Arbitrator, is a woman.
  - Arden Rose is a dormant male lich king, reserved for a later expansion (the Dread Expanse).
  - The skeleton creature is held until the world opens up.
- **Design doc:** `docs/DESIGN.md` is a snapshot. The living copy is Ryan's Claude Docs design doc; record decisions there too.

## Architecture

- **The game:** one React function component (`DurinnGame` in `07_ui.jsx`), concatenated from `src/parts/` in the order listed in `scripts/build.cjs`, then minified with esbuild. All parts share one scope; there are no imports between parts.
- **Runtime:** React comes from `window.React` (bundled `vendor.js`, or cdnjs on the claude.ai artifact).

| Part | Role |
|---|---|
| `01_core.js` | Palette, canvas helpers, tile size |
| `02*_data.js` | Baked atlases (base64 PNG + frame metadata): chibi characters, battle sprites, Elowyn, foes (`FOE_ATLAS`), critters, the intro map |
| `02i_foes.js`, `02d_chibi.js` | Atlas loaders, recolouring by palette role, `chibiFrame` / `swordSet` |
| `03a/03b_world.js` | Procedural tile art |
| `03c_grim.js` | The "grim" bake: one detailed ground layer per map plus tall sprites (buildings, trees, bridges, rails) |
| `04_data.js` | Interiors (`MAP_DEFS`), `ITEMS`, `CHEST_LOOT`, NPCs and schedules, `SCRIPTS` (all dialogue and cutscenes), `LOOK_TEXT`, `TRADES` (only the clerk is used) |
| `04b_wilds.js` | North Woods, Southern Rocks, the caves, the Mossed Ruin and the Heartwood Grove |
| `04c_rooms.js` | Back rooms |
| `05_engine.js` | Canvas engine: `PROP_DEFS`, map prep, movement and collision, `findTarget` (interaction), wild encounters, day/night lighting, cutscene staging |
| `06_minigames.js`, `06e_battle.js` (pure ATB sim: `BTL_PARTY`, `BTL_FOES`, `createBattle`), `06f_magic.js` (Old Tongue roots and suffixes) | Mini-games, battles, magic |
| `06g_gear.js`, `06h_debug.js` (test-skip menu), `06k_music.js` (`musicFor` chooses the track) | Gear, debug, music |
| `06b_splash.jsx`, `06c_battleart.jsx`, `06i_intro.jsx` | Splash, battle renderer, intro slides |
| `07_ui.jsx` | Everything React: screens, HUD, dialogue runner, menus, creator, wardrobe, credits |

**Maps** are rows of tile characters.
- **Solid tiles:** `SOLID_TILES` in `04_data.js`.
- **Common tiles:** `T` tree, `.` and `,` grass, `*` flowers, `b` bush, `r` rock, `=` road, `~` water, `B` bridge, `#` stone wall, `S` sign, `Z` barricade, `P` pillar.
- **Interior walls:** `U` / `Y` upper wall and window, `L` lower wall face. Row 0 is the upper wall and row 1 the solid wall face.
- **Props** sit on top of the rows; `wall: true` props hang on row 0.
- **Interaction** reads the single tile in front of the player. Facing up at furniture also describes a wall decoration above it, or something stood behind it.

**Scripts** are arrays of beats:
- `{ who, t }` is a line.
- `{ choice }` offers choices.
- `{ do: (c) => ... }` runs code: `c.set`, `c.give`, `c.learn`, `c.joinParty`.
- `{ cue }` stages actors.
- `{ act: "name" }` runs `afterActions.current[name]` in `07_ui.jsx`, for example `aftermath` or `credits`.

**Saves:** the localStorage keys are prefixed `durinn_`. Don't rename them, or existing saves stop loading.

**Big-screen UI:** on large viewports the menus are scaled with CSS `zoom` (`--uiz` on `.dz-root`).
- The battle stage and the touch controls are excluded.
- Inside zoomed UI, size things by layout size (`clientWidth`), not `getBoundingClientRect`, or they double-scale.

## Testing hooks

`window.__durinn` (local builds) exposes:

| Hook | What it does |
|---|---|
| `G()` | The save state; `flags`, `items`, `party` and `time` are writable |
| `eng.warp(map, x, y, dir, {dur})` | Move the player |
| `eng.debugState()` | Engine state |
| `fight([...foeKeys])` | Start a battle |
| `openJob(kind)` | Open a mini-game |
| `openDice(npc)` | Open the dice game |
| `run(scriptName)` | Play a script |
| `data()` | `MAP_DEFS`, `SCRIPTS`, `LOOK_TEXT`, `PROP_DEFS` and more |
| `music()` | The current track |

- **Test flags:** `G().flags.__nowild = true` stops wild encounters while testing.
- **Debug menu:** the in-game settings menu has a debug section that skips to any finished part of Act One.
- **Local tests:** they skip the "tap to begin" screen; open `test.html#tap` to see it.
- **After changing maps or props,** run `npm run test:reach`. Its expected reports are listed below; anything else is new.
  - The Oakhaven north and south gates are barricades that story flags remove, so it reports the arrivals at (23,1)/(24,1) and the rocks warps.
  - A few objects stand behind an identical, reachable twin: the store shelf and barrel, two crates, and a study shelf.
- After changing foes or party stats, check `test/sim/sim.cjs`. The Thornmother is tuned so a solo player wins at level 5 with the sword, or level 4 with fire magic.

## Sprites

`tools/bake/` holds the Python (Pillow) scripts that drew the custom characters (Odile: `odile.py` + `odile_bake.py`), baked atlases from the packs (`elowyn_bake_orig.py`, `foes_bake.py`, `crit_bake.py`), the intro map (`map/map_bake.py`) and the woods expansion (`woods2/gen.py` for the ruin and grove maps, `plant_atlas.py` for the Thornmother).
- They expect the raw packs under `assets/` and write JSON or PNG that gets pasted into the `02*_data.js` files.
- Some paths in them are machine-specific; fix them up as needed.
- They were working tools, not a polished pipeline.

## Known open items

- The town lawn needs a polish pass; ask Ryan what bothers him about it.
- The audio mix, and how the touch controls feel on real phones and the Fold, haven't been checked on hardware.
- The game is about 1.6 MB of JS, mostly the baked atlases. The first-load bake takes about 1 second on desktop and is covered by a "Loading" screen.
- Next up after Act One: the world opens (Ashford and its Weaver outpost), factions, companions, the skeleton creature, and the unused packs (ruins, trees, dungeon, guild hall, roads, weapons, portraits).
