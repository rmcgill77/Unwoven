# Unwoven: A Tale of Talvora – Game Design Document

Nov 3, 2026 · @Ryan

## Vision and pillars

A mobile-first pixel RPG in the spirit of classic Zelda: you explore a hand-authored overworld with a virtual joystick, touch visible enemies to start ATB-style battles, and grow from a nameless guild apprentice into a Weaver of the Old Tongue. The whole game ships as one self-contained React component with canvas rendering and localStorage saves, matching Ryan's other games.

**Pillars**

- **Magic is language.** Every spell is a spoken Root + Suffix. Learning words, not leveling a mana bar, is the core fantasy.
- **Risk lives in the weave.** Inhale, Weave and Release are a real cast loop; getting hit mid-weave causes a Rupture.
- **The world answers you.** Casting leaves a Lingering Signature that Weavers can trace, so reputation is mechanical, not cosmetic.
- **Your choices pick a side.** Three factions, three endings, with each faction introduced organically and joined only after an intro quest.
- **Semi-open exploration.** Zones are gated by danger, not walls. Wander in early if you dare.

**Reference points:** old-school Zelda (exploration, tone of the map), Final Fantasy IV-IX (ATB battles, companions), and The Midnight Appraiser / Second Sight Pawn (pixel style, mobile UI).

**Art direction:** highly detailed pixel-art portraits during dialogue and combat, and fairly detailed sprites and tiles on the overworld.

## World summary

Durinn is the world; Talvora is its continent, split by the War of the Gods into northern and southern landmasses around the fog-choked Dread Expanse. Magic flows through subterranean leylines that all originate from or return to The Divide, a chasm beneath Etharis. The Weaver Order keeps a monopoly on magic by teaching that it is a noble bloodline trait, when in truth anyone who can speak the Old Tongue can channel it.

| Realm | Capital | Role in the game |
| --- | --- | --- |
| Etharis (human mainland) | Capital City | Main playable region; five sectors under Weaver and noble rule |
| Felbrin (dwarves) | Vin Darihm | Rune-iron, metalcraft, grounding materials; transactional |
| Ringval Wilds (elves) | Alhalune | Feywild threshold; hostile to outsiders |
| Frozen Vale | Farcross | Mercenary frontier with no Pillars; Sanguis-style magic |
| Durte (lawless coast) | Sin's Landing | Black market for banned texts and focus tools |
| Dread Expanse | none | Fog-bound ruin islands; thinning mist opens late-game salvage |

**Key institutions**

- **Weaver Order / Archon Covenant:** Archons, Arbitrators and Curates rule from Capital City. Leyline Pillars regulate, store and redirect power, which lets the Order cut off whole provinces.
- **Class system:** Guild orphans get trade surnames (Iron-hand, Crop-foot, Timber-mark, Hide-bound, Quill-mark); orphans without a guild are the Nameless.
- **The Unbound:** an underground movement split into Liberators (spread the Old Tongue) and Purifiers (destroy The Divide), the latter led by Kellan Vex.
- **The Gathering Storm:** leyline failures and blackouts are spreading, a sign that The Divide is destabilizing.

**Scope decision:** the first release covers Etharis only. Other realms appear as places named in dialogue, trade goods and later expansions.

## Magic system as gameplay

There is no mana bar. Casting draws on the local leyline, so the resources are **breath**, **strain** and **leyline strength** under the player's feet. Spells are built from 38 roots and 16 suffixes (608 pairings), but each root only accepts suffixes that make sense for it, which keeps the real spell list manageable.

**The four-step cast loop**

| Step | Lore | Gameplay |
| --- | --- | --- |
| 1. Attune | Feel the leyline hum | Passive. A ripple or HUD gauge shows local leyline strength. |
| 2. Inhale | Draw raw energy up from the earth | Hold the spell button; a breath ring fills. Overfilling adds strain damage. |
| 3. Weave | Shape the energy | Keep the ring steady. A hit during this step causes a Rupture: knockback, burn, stagger, cast cancelled. |
| 4. Release | Speak the Root + Suffix | Let go in the timing window. Clean timing gives full power; sloppy timing causes deviation or a misfire. |

In battle (see Combat), Inhale and Weave become charge time on the ATB bar and Release becomes an optional timing tap.

**Zone rules**

- **Inside a Pillar radius:** stable casting, no surges.
- **Wild Borders:** stronger casts, plus surge events, tremors and a higher misfire chance.
- **Frozen Vale and no-Pillar areas:** Sanguis casting (sacrificing health) is the only reliable option.

**Lore rules turned into mechanics**

- **Lingering Signature:** every cast leaves a trace that Sens-id or Mem-id can read. Arbitrators and Curates can detect recent casting, which drives a notoriety meter in Weaver towns.
- **Acoustic vulnerability:** gags, throat injuries, lung exhaustion and Mut-ix silence fields block the Release, stranding the weave.
- **Grounding charges:** iron filings plus blackpowder or sulfur force an instant Rupture. Musketeers and Arbitrator guards are the anti-caster enemy type.
- **Forbidden roots** (Vora, Sanguis, Xeno, Nihil, Strig, Nexus, Phag) are story-gated and tied to faction or ending paths.

**Roots and suffixes by category**

| Category | Roots |
| --- | --- |
| Elements and matter | Pyr, Nix, Vent, Petr, Ferr, Fulg, Bary, Nebul, Vitr, Plast, Fract, Stas, Tach, Solen |
| Light, shadow, force, motion | Phaos, Tenebr, Vis, Vinc, Ton, Eid, Chron |
| Mind, senses, life, nature | Cogn, Sens, Mut, Ver, Somn, Mem, San, Carn, Flor, Ven |
| Forbidden and esoteric | Vora, Sanguis, Xeno, Nihil, Strig, Nexus, Phag |

| Group | Suffixes |
| --- | --- |
| Scale and precision | -is (minor), -os (major), -at (surgical) |
| Delivery and form | -ix (ward), -el (beam), -am (radial cloud), -or (projectile), -on (solid construct), -ar (decoy), -en (infusion), -us (snare) |
| Timing and flow | -ex (delayed trap), -it (instant snap), -ant (sustained channel), -in (inversion), -id (diagnostic echo) |

**Learning and crafting:** roots and suffixes are learned separately from texts, shrines, scholars, rivals and companions. A weaving table lets the player combine known words, and four favorites go on the hotbar. Quill-mark clerks learn words faster. Suffix -in enables puzzle solutions, such as Pyr-in to freeze a water gate.

## Hybrid combat

The player explores in real time with the joystick. Enemies are visible on the map, and touching one (or being spotted by it) starts an ATB battle on a separate battle screen, Final Fantasy style. Winning returns the player to the exact map position.

**Exploration layer**

- Joystick on the left, interact and menu buttons on the right.
- Enemies patrol, sleep or guard, so the player can sneak around, lure or ambush. Striking first gives a head start on the ATB gauges.
- Zone-specific hazards (surges, tremors) occur on the map, not in battle.
- Non-combat spells work on the map: light, detection, Sens-id scans, Mem-id tracking, puzzle solving.

**Battle layer (ATB)**

- Each party member has an ATB gauge. When full, they pick a command: Cast, Attack, Item, Defend or Flee.
- **Casting is charged.** A spell needs Inhale and Weave ticks before Release. Larger spells charge longer.
- **Rupture:** a hit on a caster mid-charge cancels the cast and deals burn and stagger damage. Defend, wards (-ix) and positioning protect casters.
- **Release timing tap:** an optional tap for full power. Missing it causes deviation rather than failure, and an accessibility setting can make it automatic.
- **Leyline strength** modifies every cast: stable in Pillar zones, stronger and riskier in the Wild Borders.
- **Enemy counters:** musketeers with grounding charges force Ruptures, silence casters (Mut-ix) block Release, and Weaver Curates use Xeno to strip wards.
- **Elemental and conceptual weaknesses** reward bringing different roots, for example Pyr against Flor and Fulg against armored targets.

**Party:** up to three active members in battle (the player plus two companions); the rest wait at camp or base. Companion roles are covered below.

**Why hybrid:** it keeps the Zelda-style exploration feel and joystick controls, while ATB makes companions, spell variety and balancing far simpler than real-time combat with 600+ spell combinations.

## Character creation and trades

The player is always an orphan. Creation sets a name, a look, a trade and a surname.

**Background**

- **Apprentice:** every player starts as an orphan taken in by a guild trade. The player gets the trade surname, a mentor, a shop to live in and non-combat jobs. The mentor is slightly cold toward the player, since orphans are not looked upon in this world.
- **Street Nameless:** saved for a later DLC; not in the first release.

**Trades**

| Trade | Surname | Non-combat work | Passive bonus |
| --- | --- | --- | --- |
| Blacksmith | Iron-hand | Forging and repair minigame | Better gear crafting |
| Clerk | Quill-mark | Copying and sorting texts | Learns Old Tongue words faster |
| Carpenter | Timber-mark | Building and repair jobs | Cheaper crafting, trap-making |
| Tanner | Hide-bound | Curing hides | Armor crafting, resist bonuses |
| Farmhand | Crop-foot | Harvesting and herb work | Gathering and potion bonuses |
| Stonemason (placeholder) | Stone-set (placeholder) | Masonry and quarry jobs | Sturdier wards and constructs |

**Surname effects:** the surname (or its absence) changes how nobles, Weavers and guild members speak to the player, and feeds the Weaver reputation score. Quill-mark is the strongest narrative fit, since clerks can read but are barred from studying linguistics.

**Reputation:** each faction (Weavers, Liberators, Purifiers) has its own reputation score. All scores start neutral after Act 1, because the Arbitrator scene gives no reputation change; later quests and casting in Weaver territory move them.

## Act 1: the scripted opening

Act 1 is longer and more open than first planned: the same story spine, with free exploration of the north woods and a southern cave region between the story beats. Every beat still teaches one system, and the world opens only after the fire. Day numbers below are approximate, because story time now advances by sleeping rather than a clock.

| Beat | What happens | Teaches |
| --- | --- | --- |
| Day 1: apprenticeship | The player works their trade, delivers the work, buys a candle for the mentor and collects a wage. Built in Phase 2. | Movement, interaction, trade minigames, dialogue, shops |
| Day 1: the witch | The mentor sends the player north to the witch to ask for the charm the mentor needs. Wolves attack on the road. The witch is introduced and says the charm will take time. The north woods open. | First ATB battles, the witch, leaving town |
| Free roaming: the north woods | The player hunts for loot to sell at the store and levels up before the story moves on. The woods are large, with the witch's home deep inside. | Combat practice, loot, selling, levelling |
| Day 2: the tavern | The mentor sends the player to the tavern. A mysterious stranger enters after them and sits down. The keeper steps away and is overheard telling customers an Arbitrator arrives tomorrow. The stranger panics and flees. | NPC schedules, eavesdropping, story hook |
| Day 2 night: the tome | Leaving the tavern, the player finds the stranger's tome. At home they study it. | Magic tutorial: Attune, Inhale, Weave, Release; first Root and Suffix |
| Day 3: the Arbitrator | After speaking with the mentor, the player is questioned about the stranger. The player may lie or tell the truth, but the mayor always interrupts before they answer, so nothing is said and reputation does not change. The player does jobs, then studies again at night. | Dialogue choices, more words |
| Free roaming: the southern road | The road south opens onto a rocky area with several caves. All can be entered except one, sealed by rubble. Enemies, loot and levelling. | Exploring caves, tougher enemies |
| Day 4: the witch's bargain | The player returns to the witch. For the charm, she needs a rare mushroom that grows only in the sealed cave. The player says rubble blocks it, and she teaches them a word that moves it. | The Word of Moving, a new overworld mechanic |
| Day 4: the sealed cave | The player uses the word to clear the rubble, fights through the cave, takes the mushroom and returns it to the witch for the charm. | Words as puzzle tools, a first mini-dungeon |
| Day 4: the fire | Returning to town with the charm, the player finds Oakhaven in flames. They reach home and find the mentor being tortured by the stranger, now holding the tome again. The player fights and is scripted to lose. | Rupture, a loss that advances the story |
| Aftermath | The player wakes just outside their destroyed home, long after the flames have died, and sets out to find more magic. They eventually reach another town with a Weaver Order outpost, which is the first faction contact. | World opens up |

**Day and night replace the clock**

- The in-game clock and time display are removed. The world has two states, day and night, in the manner of Octopath Traveler 1 and 2.
- Day: shops are open, most townsfolk are out working, and the usual enemies roam the wilds.
- Night: shops close, the tavern fills, different townsfolk and some secrets appear, and the wilds are more dangerous.
- Story beats advance when the player sleeps at night. Between beats, free roaming has no time limit, so the player can explore, fight and level up at their own pace.
- The player can switch between day and night at will in safe places (towns, camps and the like), as in Octopath. Story beats can lock the time of day.

**Longer Act 1: new beats and areas**

- **The witch on day 1.** The mentor sends the player to the witch to ask for a charm the mentor needs. The witch is introduced early, and wolves on the road give the first combat.
- **North woods open early,** so the player can fight for loot to sell at the store and level up before the story turns. The woods are bigger than before, with the witch's home deep inside.
- **Southern road and rocky caves.** The road south opens onto a rocky area with several caves. The player can enter all of them except one, which is sealed by rubble until the witch's quest.
- **The witch's bargain.** In exchange for the charm, the witch needs a rare mushroom that grows only in the sealed cave. The player points out that rubble blocks the way, and the witch teaches them a word that moves it.
- **The fire comes last.** The player returns to town with the charm and finds Oakhaven under attack, which leads into the scripted loss and the aftermath.

**New mechanic: the Word of Moving**

- Bary-is, a new Old Tongue word, lets the player move obstacles such as rubble, boulders and loose barricades in the overworld, so words now solve puzzles as well as win fights.
- It follows the normal Root and Suffix rules and uses breath, and the Lingering Signature applies in Weaver territory.
- It is first used on the sealed cave, then reused for gated spots across the world, including generated dungeon puzzles.
- The word is Bary-is (gravity, minor). The witch teaches it because the player does not know the root Bary yet; it is the player's first gravity word.

**Story facts established in Act 1**

- **The stranger is Kellan Vex**, a Purifier leader. He believes the mentor stole the tome, because he found it in the shop where the player lives.
- **The tome is stolen property,** but not by the mentor. Vex took it from a Weaver vault far to the south. Some pages are torn out, which the player sees on first reading.
- **The mentor** has a randomized name, is always slightly cold toward the player, and always dies in Act 1. They did not steal the tome.
- **Vex burned the town.**
- **Oakhaven** is the starting town and **Isaura Thorne** is the Arbitrator. The mayor is randomized. The witch's name is open; she could give a side quest that leads the player across the continent.
- **Hidden truth, revealed later:** the tome contains the spell that clears the fog over the Dread Expanse. The missing pages matter.

**Design notes**

- The Day 2 scene is a moment of choice with no consequence: the player may lie or tell the truth, but is always interrupted. The Lingering Signature is introduced later, when the player casts in Weaver territory.
- Act 1 is built as a scripted sequence separate from the open-world engine, with a day and night state, locked doors, sealed paths and scripted triggers.

## Overworld and zones

The overworld is a hybrid. A zoomed-out travel map links regions, with fog of war, rations, travel time and random events. Towns, outposts, wilds and dungeons are fully walkable scenes at the same zoom as Oakhaven, and they are big: cities 120 by 90 tiles or more, large settlements about 80 by 60, outposts about 55 by 40, wilderness scenes about 70 by 45, dungeons several floors of about 45 by 35. Zones are gated by enemy danger and story rather than walls. The structure below is a proposal built from the lore; names and ordering are open to change.

| Order | Zone | Lore basis | Character |
| --- | --- | --- | --- |
| 1 | Starting town and woods | Pillar-protected town, witch's cottage | Tutorial zone; safe, then Wild Border surges in the woods |
| 2 | Outer province roads and towns | Etharis outer provinces | Fortress towns, Weaver patrols, first faction sightings |
| 3 | The Wild Borders | Land outside any Pillar radius | Mutated predators, tremors, unstable casting |
| 4 | Regional lord castles | Five-sector administration | Political questlines, noble houses, tithes |
| 5 | Unbound hideouts and ruins | Liberator and Purifier presence | Faction intro quests |
| 6 | Dread Expanse ruin islands | Thinning fog | Late-game salvage zone tied to the tome's fog spell |
| 7 | Capital City and The Divide | Weaver spires, obsidian foundations | Finale |

**How factions appear in the world**

- **Weavers:** the Arbitrator in Act 1, then Pillars, patrols and Curates in every town.
- **Liberators:** a hidden printing press, copied Old Tongue pages, whispered rumors among guild workers.
- **Purifiers:** Vex's recruiters, graffiti and sabotage of Pillars.

Each faction's recruitment starts after a short intro quest for each, so the player sees all three before choosing.

**Map authoring**

- Zones are authored as 2D arrays (or compact strings) of tile ids, with separate layers for ground, objects, collision and triggers.
- Each zone declares its leyline strength, enemy table, ambient music and Pillar radius.
- A tile editor workflow (a simple in-browser tool or hand-edited JSON) is decided in Phase 2.

## Generated dungeons

Dungeons are procedurally generated from themed room templates, so each visit has a fresh layout but a predictable structure: entrance, branching rooms, a key or switch item, a locked gate and a boss room. Story dungeons use fixed boss rooms and fixed rewards inside a generated shell.

| Theme | Setting | Signature hazards and enemies |
| --- | --- | --- |
| Leyline caverns | Underground junctions near Pillars and Wild Borders | Surges, mutated beasts, unstable floors |
| Weaver vaults | Order storage and archives | Wards, Curates, Arbitrator guards, grounding traps |
| Unbound hideouts | Liberator and Purifier bases | Zealots, hidden presses, sabotage |
| Expanse ruins | Fog-bound islands | Residual divine fallout, relic guardians |
| The Divide | Beneath Capital City | Final descent; all elements and forbidden roots |

**Generator outline**

1. Pick a theme, size and difficulty from the zone.
2. Place rooms on a grid and connect them with a spanning tree, then add loops.
3. Assign room types: combat, puzzle, treasure, rest, key, boss.
4. Place locks and keys so the key always sits earlier in the path than its lock.
5. Fill rooms from the theme's enemy and loot tables, scaled to zone level.
6. Seed the generator so a dungeon can be reproduced from its seed, which also makes saves small.

**Puzzles** use the magic system: Pyr-in to freeze a water gate, Vent-or to move light objects, Ver-id to reveal hidden wards, Mut-ix to sneak past sound-sensitive guards.

## Factions and three endings

There are three factions and three endings. Each faction is shown to the player in the world first, then offers an intro quest. Only after completing the intro quests does the player commit to a side.

| Faction | Goal | Intro quest idea | Ending |
| --- | --- | --- | --- |
| Weaver Order | Preserve the monopoly and the Covenant | Help an Arbitrator track a Lingering Signature | **Order:** control is kept; the lie survives or is reshaped from within |
| Liberators | Spread the Old Tongue and democratize magic | Help move a printing press or copy a lexicon page | **Liberation:** magic is open to everyone, with the cost of a divided, chaotic world |
| Purifiers | Reach and destroy The Divide | Sabotage a Leyline Pillar | **Extinction:** magic is purged, with catastrophic environmental and seismic collapse |

**Faction rules**

- Reputation starts neutral after Act 1; the town with the Weaver outpost is the first faction contact.
- Each faction has its own reputation score and unlockable words, gear and companions.
- Quest choices can open or close faction paths, but the player stays uncommitted until all three intro quests are done.
- Faction choice should affect which forbidden roots the player can learn (for example Strig and Nexus with the Purifiers, Xeno with the Weavers).

**Spine of the main plot**

1. Act 1: the tome, the fire and the loss to Vex.
2. Act 2: the player explores, learns magic and meets all three factions.
3. Act 3: the player commits to a faction after the intro quests.
4. Act 4: the tome's missing pages, the fog spell and the Dread Expanse drive the late game.
5. Finale: Capital City and The Divide, resolved by faction choice.

The endings' exact shape, and how the fog spell interacts with them, are open questions in the last section.

## Companions

The game needs at least 7 companions: one or more per faction (at least 3) and at least 4 independent of any faction. The names, roles and concepts below are proposals for you to rewrite; the roles keep the party balanced in ATB combat. Non-human companions live in or pass through Etharis, since the first release covers Etharis only.

| Slot | Name | Tied to | Role | Concept |
| --- | --- | --- | --- | --- |
| Weaver | Corvin Hale | Weaver Order | Ward and support caster | Junior Curate at the Weaver outpost who starts doubting the Order; knows Sens and Mem tracking |
| Liberator | Tamsin Quill-mark | Liberators | Healer and scholar | Clerk who secretly copies Old Tongue pages on a hidden press; San and Ver |
| Purifier | Maren Iron-hand | Purifiers | Heavy damage, grounding charges | Former blacksmith's apprentice who blames magic for her guild's hardship; iron and blackpowder |
| Independent | Hakon Redfell | None | Frontline fighter | Frozen Vale sellsword who casts with Sanguis, trading health for power |
| Independent | Jessa Brine | None | Ranged scout and trapper | Durte smuggler who lays -ex trap glyphs and can find banned texts |
| Independent | Ilyrae | None | Nature and healing caster | Exiled elf from the Ringval Wilds; Flor and San; distrusts Weaver magic |
| Independent | Hadrin Coppervein | None | Tinkerer and support | Felbrin-trained dwarf engineer; clockwork gadgets and gear that resists grounding charges |

**Systems**

- Each companion has a personal quest, a camp dialogue thread and a reaction to the player's faction and reputation.
- Faction companions can leave or turn on the player if the player picks a rival faction. Independents stay unless their own quest goes badly.
- Companions learn words from the same shared pool as the player, but each has a signature Root and a playstyle.
- Active party in battle is the player plus two companions; the rest wait at base.

Personalities, personal quests and voices are still to be written once you pick the ones you like.

## Progression and systems

Power comes from two tracks: character level and vocabulary. Level raises health, breath capacity and strain tolerance. Vocabulary is what unlocks new spells.

- **Word discovery:** roots and suffixes come from tomes, shrines, scholars, rivals, faction trainers and companions. Forbidden roots are gated by story and faction.
- **Weaving table:** combine known Root + Suffix pairs, preview the effect and save favorites to a four-slot hotbar. Invalid pairs are blocked or produce weak results.
- **Trade skills:** the apprenticeship trade keeps working after Act 1 as crafting and gathering (forging, copying, building, tanning, herbalism).
- **Gear and loot:** chests, shops, drops and crafted items. Iron and grounding materials matter because they interact with magic.
- **Notoriety:** the Lingering Signature feeds a heat meter in Weaver towns. High heat means patrols, Arbitrators and ambushes; it decays when the player stays away from Pillars or avoids casting.
- **Quest log and journal:** tracks main story, faction quests, companion quests and discovered words.
- **Saving:** localStorage. Save at beds, camps and checkpoints; autosave at zone transitions. A single save slot first, more slots in polish.
- **Mobile UX:** large touch targets, joystick on the left, buttons on the right, safe-area padding, pause on tab hide, and a reduced-motion setting.

## Technical architecture

The game is one self-contained React component: the React shell draws touch UI, and a canvas game loop runs the five systems that hold all game logic.

&#91;embedded content: technical architecture · 1 shell, 1 loop, 5 systems, 1 save layer\]

The systems read and write one shared game state, and the save layer serializes it.

**Proposed technical choices**

- Pixel canvas scaled up with pixelated rendering. The internal resolution is settled in Phase 1 with an art test, since fairly detailed overworld sprites need more pixels than a classic 240 by 160 canvas.
- Game state lives in refs, not React state, so the loop does not trigger a re-render every frame.
- Joystick and buttons use pointer events with multi-touch, so movement and actions work at the same time.
- Maps, the lexicon, enemies and story flags are plain data objects, so content can grow without changing engine code.
- Dungeons store only a seed and progress in the save file.
- Act 1 runs as a scripted sequence on the same engine, driven by the day counter and story flags.

## Phased development plan

The game is built in eight phases, with Act 1 as the first fully playable slice. Nothing is built until you approve this plan.

&#91;embedded content: development roadmap · 8 phases, 3 gates\]

Phases 1 to 4 deliver the engine, the town, battles and magic. Phase 5 now starts with the Act 1 rework (day and night, the witch on day 1, the larger north woods, the southern caves and Bary-is), then widens the game with the travel map and the first open-world zones.

## Decisions and open questions

The design is settled enough to start Phase 1 once you approve; the questions below can be answered while the engine is built, but the first four affect Act 1 content.

**Decisions made**

| Topic | Decision |
| --- | --- |
| Platform and view | Mobile first, joystick, top-down pixel art, old-school Zelda feel |
| Combat | Hybrid: real-time map exploration, ATB battles on contact |
| Party size | The player plus two companions in battle |
| Spells | Both projectile and area spells; Root + Suffix system |
| World structure | Hand-authored overworld, generated dungeons |
| Saves | localStorage |
| Endings | Three, one per faction path; details still open |
| First release scope | Etharis only |
| Tone | Dark and political, but hopeful |
| Factions | Introduced organically in the world; the player joins only after an intro quest for each |
| Companions | At least one per faction and at least four independent |
| Backgrounds | Apprentice only at launch, with another trade replacing the street start; Nameless is a later DLC |
| Opening | Orphan apprentice in Oakhaven; tome, Arbitrator Isaura Thorne, witch and fire as scripted in Act 1 |
| Mentor | Randomized name, slightly cold toward the player, always dies; did not steal the tome |
| Day 2 Arbitrator scene | Lie or tell the truth, always interrupted, no reputation change |
| Aftermath | Player wakes outside the destroyed home, later reaches a town with a Weaver outpost |
| Vex and the tome | Vex stole it from a Weaver vault in the far south; torn pages hide the fog-clearing spell |
| Art | Highly detailed portraits in dialogue and combat; fairly detailed overworld |
| Overworld | Hybrid: zoomed-out travel map with fog, rations and random events, plus large walkable scenes; settlement size scales with importance |
| Time | Day and night states replace the in-game clock, as in Octopath Traveler; the player can switch freely in safe places |
| Act 1 length | Longer: witch on day 1, open north woods, southern caves, sealed cave and the Word of Moving before the fire |
| Character creation | 8 hairstyles, 7 eye colours, 5 face marks, separate cloak and tunic colours, pronouns, more skin and hair colours |
| Orphan standing | The player is a lifelong, well-known resident of Oakhaven, but as an orphan is treated differently; dialogue never treats them as new |

**Build progress:** Phases 1 to 4 are built and Act 1 has had one playtest pass: engine, town, ATB battles, magic, the chibi cast with a full character creator and two overworld mockups. Phase 5 is next but is on hold: the Act 1 rework above (day and night, the witch on day 1, the north woods, the southern caves and the Word of Moving) comes first, and nothing new is built until its concept art is approved. Resolution is the Detailed setting (224 px on the short side).

**Open questions**

1. **Street Nameless opening:** who plays the mentor role if the player has no apprenticeship, and does the Act 1 script change?

Im thinking we take this role out and replace it with another trade. Nameless can be an eventual dlc.&#32;

2. **The mentor:** name, personality and trade (does it change with the player's trade?). Does the mentor survive the torture, and did they really steal the tome?

The mentor's name can be randomized but their personality is always slightly cold towards to the player. Orphans in this world arent looked highly upon. The mentor always dies and no, they didnt steal the tome. Vex assumes they did since they found it in their shop which the player lives at.

3. **Day 2 Arbitrator:** the mayor interrupts before the player answers, so should the Lingering Signature check ever land, and what does the reputation change depend on?

Thinking on this too, no more reputation gain or loss here, just an opportunity for the player to lie or tell the truth but is always interrupted.

4. **Aftermath:** where does the player wake, and which faction do they meet first?

The player wakes just outside their destroyed home. The player would eventually find themselves in another town which would have a Weaver order outpost.

5. **Names:** the starting town, the Arbitrator, the witch and the mayor.

The town is Oakhaven; the Arbitrator's name is Arden Rose; the witch's name can be discussed but I was thinking she could have a side quest that leads the player all across the continent; the mayor can be randomized.

6. **Party size in battle:** the plan assumes the player plus two companions. Is that right?

Yes.

7. **Endings:** what exactly happens in each, and how does the fog spell and the Dread Expanse tie into them? What is Vex's fate?

Not sure yet, I want to focus on the core of the game before the ending.

8. **Companions:** names, personalities and origins for all seven.

Help me come up with them.

9. **Art direction:** palette, sprite size and any references from your earlier game to match.

Highly detailed pixel art for portraits while characters are talking/combat, fairly detailed for overworld.

## Gear, Pack and interior rooms (built, V33)

- **Pack button** sits above Interact and opens Gear, Items, Quests, Tome and Character. Keyboard: I. The top-right menu now holds Settings, How magic works and Art. Keyboard: Esc.
- **Gear slots:** Weapon, Head, Body, Charm. Items carry a gear block (ATK, DEF, MAG, HP, MP, SPD) and bonuses are added in btlStatsFor, so battle, resting and level-ups all use them. Equipment is stored per party member (G.equip).
- **Day 1 sword:** the mentor sends the player to the storeroom chest in the workshop for the Old Sword (ATK +3). The north barricade watchman refuses to open until the player has it. The sword shows in the hand on the battle attack frames only.
- **Other gear found in chests:** Quilted jerkin (Pike's stockroom), Iron-rimmed cap (Hollow Oak guest room), Covenant medal (chapel vestry).
- **New rooms:** storeroom, Pike's stockroom, Mayor's study, tavern kitchen and guest room, chapel vestry, Garrick's bedroom, Vane's dye store, farm pantry, Maud's drying loft. Rooms connect through an inner doorway tile.
- **Balance:** with the sword, wolf attack rose 7 to 8, Cave Hound hp 40 atk 9, Scarred Alpha hp 150 atk 12, Old Blind Hound hp 120 atk 10. Alpha needs about Lv4 solo.

## Testing tools, collision fit and the burning town (built, V34–V36)

### Testing tools (Menu → Settings → Testing tools)

- **Checkpoint jumps:** 10 story checkpoints skip straight to a point in the finished game: sword sent, sword fetched, Maud, Day 2, Day 3, the bargain, the cave, the moon-cap, the fire, and the ashes (Day 7). Each sets the flags, items, level and location a real playthrough would have.
- **Spots:** warp to any area. **Fights:** start any foe group.
- **Cheats for testing:** heal, set level, learn all words, add coins, toggle day/night, change the day, turn off wild encounters, clear or reset chests.
- **Give items:** pick any item by id, give one or five, or give all gear, the starter kit, or all loot.

### Collision fit

- Houses block movement only where they are drawn. Roof tiles that fall outside the gable (the empty corners) are walkable.
- The shaping is computed when the map is baked, from the same roof polygon the sprite uses, so it stays correct for every building size.

### The burning town (Day 4 fire)

- **No entry:** while Oakhaven burns, every building door is locked. Looking at one shows a rotating burning-door line. The only exits are the north woods and the southern rocks. Entry returns after the ash.
- **Art (approved from concept screenshots):** the houses themselves are drawn burning. Roofs are charred with burn-through holes and a glowing rim. Windows and doors are full of fire with soot above them. The old smooth overlay flames are gone.
- **Flames:** hard-edged pixel tongues in four tones (#8a2418, #d2501c, #f08a2a, #ffd068, with #fff3c0 highlights), stepped columns that lick and settle. They are rooted at anchor points the building bake returns (burn holes, window tops, door tops). Smoke, spark flares and flickering ember lights use the same anchors.
- The map is re-baked in its burning form while the fire flag is set and the ash flag is not.

### Still to do

- Other oversized collision (lamps, bushes, signs) if it feels off in play.
- A gear screen for party members.
- Audio; the balance-sim bot update; the remaining world beyond Act 1.

## Act 1 environment rework and hero/intro plan (V37)

**Rules**

- Wolves never appear in Oakhaven. They live only in the woods, the southern rocks and the caves.
- Quill-mark stays as the Clerk's surname.

**Built in V37**

- Water: curved shorelines, mud banks, reeds, darker rippled water; the bog is greener with duckweed.
- Bridges: landing boards run onto both banks so they join the road.
- Wells: flagstone apron centred under the well, a worn track to the nearest road, spilt water.
- Graveyard: headstones on mounds, wall closed on the south.
- Paths: diagonal paths smoothed, narrow woods trail, cart ruts only on 2-wide town roads.
- Cliffs and caves: rounded broken edges, side faces, cast shadow, rubble and dripstone.
- Camp: cold fire pit, torn lean-to, trampled earth. Hollow logs and bones beside outdoor chests.
- Ragged forest edges with undergrowth; rocks and bushes grounded with pebbles and grass.
- Bugs: interior props in Garrick's bedroom, dye store and farm pantry no longer overlap or block.

**Hero and intro (planned, not built)**

- Named hero: Corin (male, the current male design) or Elowyn (female, design to be supplied by Ryan).
- Flow: title, then slides 1-4 (world, ley-lines and the Old Tongue, the Weavers, the bundle at the door), then trade choice, then male/female, then skin tone, eye colour and hair, then slides 5-7 matched to the trade (growing up in the trade, growing up with Tessa Hollis, the hint of power), then wake in the cot, then mirror/wardrobe for clothes and hair colour before the door opens for the first time.
- Intro is skippable only after the first viewing.
- The mentor appears only as a silhouette (their name is random).
- Storyboard approved. Open points: the age line on slide 7 (currently seventeen winters) and Tessa's wording on slide 6.
- Concept sheets for the hero designs and the gender/look/wardrobe screens come first, after the female design arrives.

## V38–V39: Hero and intro flow

- Heroes: **Corin** (male, craftpix Wizard chibi) and **Elowyn** (female, craftpix Knight chibi with hair over one eye, sword erased, eye whites protected). Chosen on the creator's gender screen; old saves default to male.
- Flow: splash → title → intro slides 1–4 → creator (trade, then male/female) → slides 5–7 → game. The Skip button appears only after the intro has been seen once.
- Slide 5 (growing up in the trade) and slide 6 (Tessa) draw the children smaller, with a big head and a short body and legs (V39). Slide 7 keeps the line "Seventeen winters"; Tessa's wording is approved as written.
- Mirror in the shop room: the wardrobe must be used before the shop door lets you out. Bridge and well alignment fixed in V37.
- Not yet used: the other craftpix packs (enemies, NPCs, nature) wait for approval of concept art before they go in.

## V40–V42: Foes, wolves and wildlife

All art is from craftpix free packs, toned down to Durinn's gritty palette and baked into atlases. Sprites that aren't animated get idle, attack and hurt motion in code. Every art change was shown to Ryan and approved before publishing.

**V40: new foes in Act 1**

- Slimes (animated pack): Mire Slime (green, woods), Cave Slime (blue, caves) and Rust Slime (red, rocks).
- Monster icons, animated in code: Red-cap and Mandrake (woods), Cave Bat (caves), Quarry Spider (caves and rocks).
- New drops, all sellable: slime gel, red-cap, mandrake root and spider silk.
- They replaced several wolf groups in the woods, caves and rocks. The other wolf groups remain, and wolves still never appear in town.
- Fix: the battle HUD now shows the hero's name (Corin or Elowyn) instead of "Wren".

**V41: wolves**

- All wolves now use the Pixel Monster Pack wolf in four colours, animated in code. Black is the Gaunt Wolf, Starved Hound and Scarred Alpha. White is the Cave Hound and Old Blind Hound. Blue is the Ley-touched Wolf. Green is the Thorn Hound.
- Overworld wolves were enlarged slightly.

**V42: ambient wildlife**

- North Woods only: 3 deer, 6 hares, 4 grouse and 2 foxes, spawned at random each day.
- They are harmless, wander and idle, and run off when the player gets close (deer and foxes spook from the furthest).

**Not yet used**

- Skeleton, fire spirit, plant creature, predator plants, robots (to be recoloured as Divide-era guardians), raiders and knights (world, after Act 1).
- Trees, ruins, dungeon and road tiles, guild hall, weapons and dialogue-portrait templates.
- Music pack (xDeviruchi): licence terms to be checked before it goes into a published game.

## V43–V45: Music and Elowyn's walk

**V43: music.** Ten xDeviruchi tracks (gamedevmarket.net, free and open licence) play from compact MP3s that load on demand and crossfade between moments. Title and character creation: Title Theme. Intro slides and Oakhaven by day: And The Journey Begins!. Interiors and Oakhaven at night: Take some rest and eat some food!. North Woods and Southern Rocks: Exploring The Unknown. Caves: Mysterious Dungeon. The sealed cave: The Icy Cave. Normal battles: Prepare for Battle!. Boss battles: Decisive Battle. Dice and job minigames: Minigame. The town fire: The Final of The Fantasy (to be moved to the ending and credits once they exist). The studio splash is silent. Settings has a Music volume option (Off, Low, Medium, High; Medium by default). Each track loops as a whole file, so a tiny gap at the loop point is possible.

**V44–V45: Elowyn's walk.** Her front and back walk was only a 1-pixel bob, so it was rebuilt. V45 copies Corin's timing, measured frame by frame from his atlas: the head, body and boots rise by different amounts and the figure leans a pixel toward the stepping side, over the same eight-frame cycle.

## V46: Elowyn's walk, rebuilt

V45's copy of Corin's motion stretched her badly, so it was replaced. Her front and back walk is now a natural eight-frame step cycle. A leading boot lengthens instead of moving away from the hem, a rising boot slides up behind the hem, and the bob lifts her whole figure together. **Rule (Ryan): no part of a character's body may ever come apart from the rest.** The bake script now checks this by counting separate pieces in every frame, and it removed loose fragments left in her battle attack frames by the sword erase. The only frames with more than one piece are the two sword-swing frames, where the extra pieces are the slash streaks.

## V47: Side-on walking

Characters no longer have front or back walk animations. Every character walks side-on, left or right, even when moving up or down the screen, and turns to face the camera whenever they stop (after a very short pause so they don't flicker between poses). The game still tracks facing for talking, doors and interactions; only what is drawn changed. The chibi art stays as the game's style. A trial restyle of Corin in the craftpix wizard-sprite style (hooded, no staff, rune-sword at the hip) was made as concept art and set aside.

## V48: Opening slides and creator preview

The creator preview now only shows the side walk and the camera-facing pose. The seven opening slides are no longer separate painted scenes: each is a fixed shot inside the game itself, with the real tiles, lighting, film grain and chibi characters.

- Slide 1: the North Woods at dusk, the Dread Expanse closing in from the edges.
- Slide 2: the pillar in Oakhaven's square at night, with ley-lines and Old Tongue runes.
- Slide 3: the Mayor's House by candlelight, a ledger writing itself.
- Slide 4: a storm over the workshop, with a bundle on the step.
- Slide 5: the workshop by day, the hero as a child at the trade's station with the master nearby.
- Slide 6: the hero and Tessa as children walking to the well at dusk.
- Slide 7: the workshop at night, the master's book with the ink moving on its own.

The caption text is unchanged.

## V49: Corin hairstyle and face marks removed

Corin's creator no longer offers Hairstyle or Face marks. Skin and Eyes remain. Corin keeps the spiky cut with no marks.

## V50: Flame sound and tap-to-begin

The studio splash now has a synthesised flame sound (whoosh, crackle, low bed) that follows the music setting. A tap-to-begin screen comes first, and the tap unlocks audio.

## V51: New opening, revised map, Clerk-only start

**Opening slides**

- Slide 1: Ryan's own map of Talvora, pixelated and grimmed, with in-engine pixel labels (Talvora, Etharis, The Frozen Vale, Felbrin, The Ringval Wilds, Durte, The Dread Expanse). Etharis's outline glows.
- Map fixes: a small land bridge joins the Frozen Vale to Etharis. The Dread Expanse, the middle island, is smaller and touches no country.
- Slide 2: the leylines scene, text split over two taps.
- Slides 3 and 4: the Weaver hall and the storm with the bundle, using Ryan's text.
- Last slides: "Nineteen winters" in the workshop, then a dream of the hero revered by the whole town at the pillar.

**Player identity**

- The player is always a Quill-mark and always the Clerk's apprentice. The guild choice is removed and the creator is two steps (Who you are, Look).
- Other trades remain in the code for their NPCs. Older saves keep their original trade but show the Quill-mark surname.

**Movement and facing (V52)**

- Idle characters keep the direction they were walking. Walk animations toward the camera are allowed; walking away from the camera is never animated (the character turns side-on instead).

**Elowyn (V53–V55)**

- Her sprite is the original, unaltered sword sprite. Side views are unchanged from the original.
- She has a front-facing view with the sword and two legs that walk normally. Her up-facing is always drawn side-on.

**Mentor and the house (V56)**

- The mentor is always Odile, a woman. She is no longer random.
- The mirror moved to a reachable spot on row 1 of the house, with the shelf in front of it relocated.

**Act 1 sweep and Odile's sprite (V57)**

- A full Act 1 sweep fixed pronoun, name, forge, cutscene-position and look-text issues. Every interactable on every map is checked for reachability.
- The four lines about being left as a baby now say "on the steps of a house", matching the intro slide.
- Odile has a new sprite: steel-grey hair in a tight bun pinned with a quill, a stern face with fine lines, an ink-blue high-collared dress with a linen collar, a dark belt and a pen case. She has front, back and side views and a dialogue portrait.

**Creatures and bosses**

- The skeleton is on hold until the player is out in the wider world.
- The plant creature becomes a boss deep in the woods. Defeating it rewards a unique sword.

**Open items**

- Some back-wall decorations (paintings, herbs, cloths, shelves, tools) cannot be inspected, though they show no prompt.
- Audio and the final look of the map on a real device are unverified.

**North Woods expansion (V58)**

- A new trail at the top edge of the North Woods leads north to two new places, reached in order: the Mossed Ruin, then the Heartwood Grove.
- The Mossed Ruin is a broken Old Tongue stone hall, overgrown with moss. It has a south gate, a north arch, fallen pillars, glowing mushrooms, herb patches, a chest and a stone post to read. Wild encounters here include redcaps, mandrakes and thornhounds, with leywolves at night.
- The Heartwood Grove is a round clearing reached through the ruin's north arch. The boss stands in the middle of the clearing and a chest holding the reward sits behind her.

**The Thornmother (boss)**

- She is Plant 1, the red pitcher plant, from the supplied craftpix Predator Plant Mobs pack, grimmed to the game's palette.
- She is rooted: she does not chase. Walking up to her starts the fight.
- She is level 7 with 320 HP, weak to fire and wind, and resistant to growth, life and cold.
- Her reward chest holds Thornwake, a unique sword (attack 7, against 3 for the old sword). Its icon is currently the old sword recoloured green, and a redraw is still open.
- Plants 2 and 3 from the same pack remain unused for other creatures later.

**Process note**

- Check the supplied asset packs before drawing any new creature. The first Thornmother was hand-drawn by mistake and was replaced with the pack art.

**Game title (V59)**

- The game is now called Unwoven: A Tale of Talvora. It is short, one word, and leaves room for a subtitle on a possible second game.
- "Unwoven" describes the hero at the start: an orphan Clerk's apprentice who has not yet learned to weave. It stays neutral between the three factions and endings.
- The title screen, the browser tab title and the landscape notice use the new name. Durinn remains the name of the world in the story. Save data keys are unchanged, so existing saves still load.
- Still to do: search the app stores and Steam to confirm the name is free.

**Act 1 polish (V60)**

- Every wall decoration (paintings, herbs, cloths, tools) can be inspected. Looking at furniture below one adds an "On the wall above" line; a few wall pieces moved a tile along their wall. The vestry desk moved one tile left so the room is no longer cut in half. The ruin-to-woods arrival no longer lands on a tree.
- Balance was checked by simulation. The Thornmother is now level 6 with 250 HP and 13 attack, so a solo player can win at level 5 with the sword or level 4 with fire magic. The Scarred Alpha stays an optional fight for about level 4–5.
- The tap screen shows "Loading" while the town is built, instead of ignoring taps.
- "Final of the Fantasy" now plays over a new End of Act One credits card. The burning town uses the boss track.
- Slide 4 now names Odile's copy house. Slide 5 now calls Tessa Bram's niece, taken in the same winter the hero was left, matching the game.
- Bridges have posts and a two-beam rail. Night is slightly less dark, and the player carries a soft glow outdoors.
- The Thornwake icon is redrawn as a moss-green blade with pale thorns and a vine-wrapped grip.
- Still open: the town lawn (the specific issue still needs to be identified).
