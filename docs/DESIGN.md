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

Durinn is the world; Talvora is its continent, split by the War of the Gods into northern and southern landmasses around the fog-choked Dread Expanse. Magic flows through subterranean leylines that all originate from or return to The Divide, a chasm beneath Etharis. The Archon Covenant keeps a monopoly on magic by teaching that it is a noble bloodline trait, when in truth anyone who can speak the Old Tongue can channel it.

| Realm | Capital | Role in the game |
| --- | --- | --- |
| Etharis (human mainland) | Capital City | Main playable region; five sectors under Weaver and noble rule |
| Felbrin (dwarves) | Vin Darihm | Rune-iron, metalcraft, grounding materials; transactional |
| Ringval Wilds (elves) | Alhalune | Feywild threshold; hostile to outsiders |
| Frozen Vale | Farcross | Mercenary frontier with no Pillars; Sanguis-style magic; the House in the Frozen Vale hires the mercenaries met in Act 2 |
| Durte (lawless coast) | Sin's Landing | Black market for banned texts and focus tools |
| Dread Expanse | none | Fog-bound ruin islands; thinning mist opens late-game salvage |

**Key institutions**

- **The Archon Covenant (the Order): the Archons, Arbitrators, Weaver Curates and Initiates rule from Capital City. "Weaver" is simply the word for anyone who can cast**. Leyline Pillars regulate, store and redirect power, which lets the Order cut off whole provinces.
- **Class system:** Guild orphans get trade surnames (Iron-hand, Crop-foot, Timber-mark, Hide-bound, Quill-mark); orphans without a guild are the Nameless.
- **The Unbound:** an open, decentralised movement that wants to reveal the secret of magic to the world and dismantle the Covenant. The Purifiers are a separate extremist faction that wants to destroy magic at any cost, even by using it; Kellan Vex belongs to them and stays hidden.
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

Note: the six-trade table above is superseded by V51; the player is always a Quill-mark and Odile's Clerk apprentice. **Surname effects:** the surname (or its absence) changes how nobles, Weavers and guild members speak to the player, and feeds the Weaver reputation score. Quill-mark is the strongest narrative fit, since clerks can read but are barred from studying linguistics.

**Reputation:** each faction (Archon Covenant, Unbound, Purifiers) has its own reputation score. All scores start neutral after Act 1, because the Arbitrator scene gives no reputation change; later quests and casting in Weaver territory move them.

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
- In Act 1 time is scripted and advances by sleeping. From Act 2 the player swaps Day and Night only by resting at an activated Pillar (or paying for an inn room), as set out in the Act 2 day/night sections. Story beats can lock the time of day.

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
- **The mentor** is Odile (a woman, fixed), is always slightly cold toward the player, and dies at the end of Act 1. They did not steal the tome.
- **Vex burned the town.**
- **Oakhaven** is the starting town and **Isaura Thorne** is the Arbitrator. The mayor is randomized. The witch is Old Maud, who is revealed in Act 2 to be Ulric Icetoe's mother.
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
| 5 | Unbound hideouts and ruins | Unbound and Purifier presence | Faction intro quests |
| 6 | Dread Expanse ruin islands | Thinning fog | Late-game salvage zone tied to the tome's fog spell |
| 7 | Capital City and The Divide | Weaver spires, obsidian foundations | Finale |

**How factions appear in the world**

- **The Covenant:** the Arbitrator in Act 1, then Pillars, patrols and Curates in every town.
- **The Unbound:** a hidden printing press, copied Old Tongue pages, whispered rumors among guild workers.
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
| Unbound hideouts | Unbound and Purifier bases | Zealots, hidden presses, sabotage |
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

Faction names (updated): read "Weaver Order" in the table below as the Archon Covenant, and "Liberators" as the Unbound. The Purifiers' aim is to destroy magic at any cost, even by using it. All three can be joined (the Purifiers are the hardest), and joining is saved for Act 3.

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
| Independent | Hakon Redfell | None | Frontline fighter | Frozen Vale sellsword and tank who taunts and hits hard but slowly, searching for his brother Arthur (see Act 2); he cannot cast magic (decided; Sanguis dropped for him) |
| Independent | Jessa Brine | None | Ranged scout and trapper | Durte smuggler who lays -ex trap glyphs and can find banned texts |
| Independent | Ilyrae | None | Nature and healing caster | Exiled elf from the Ringval Wilds; Flor and San; distrusts Weaver magic |
| Independent | Hadrin Coppervein | None | Tinkerer and support | Felbrin-trained dwarf engineer; clockwork gadgets and gear that resists grounding charges |

Update for Act 2: Tessa Hollis (Bram's niece, sword, buffs and debuffs) joins at the end of Act 1, and Hakon (a tank, searching for his brother Arthur) is recruited at Ashford. They replace the proposals for the first two companion slots, and the rest of this table stays a proposal. Companions change only by gear.

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
- **Saving:** localStorage. Save at beds, Pillars, inns and checkpoints; autosave at zone transitions. A single save slot first, more slots in polish.
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
| Mentor | Odile (fixed), slightly cold toward the player, dies at the end of Act 1; did not steal the tome |
| Day 2 Arbitrator scene | Lie or tell the truth, always interrupted, no reputation change |
| Aftermath | Player wakes outside the destroyed home, later reaches a town with a Weaver outpost |
| Vex and the tome | Vex stole it from a Weaver vault in the far south; torn pages hide the fog-clearing spell |
| Art | Highly detailed portraits in dialogue and combat; fairly detailed overworld |
| Overworld | Hybrid: zoomed-out travel map with fog, rations and random events, plus large walkable scenes; settlement size scales with importance |
| Time | Day and night states replace the in-game clock, as in Octopath Traveler; from Act 2 the player switches only at Pillars (or inns) |
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

The town is Oakhaven; the Arbitrator's name is Arden Rose (superseded: the Arbitrator is Isaura Thorne, a woman; Arden Rose is reserved as a dormant lich king for an expansion); the witch's name can be discussed but I was thinking she could have a side quest that leads the player all across the continent; the mayor can be randomized.

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

- Used from Act 2: skeleton, fire spirit, predator plants 2 and 3, robots (Destroyer, Infantryman, Swordsman), warriors and knights (bandits), wizards (Purifiers), orcs (Frozen Vale mercenaries), hunt animals and the loot icon packs.
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

## Act 2 summary (current, consolidated)

**Status:** planning only, nothing built. This section collects the decisions made in the Act 2 sections below, which hold the detail. Where an older section disagrees, this summary and the later sections win.

### Premise

Odile has died, Tessa joins the party, and the two leave Oakhaven by the east gate for Ashford. The world opens: Ashford and Greywick, two Pillar towns on the Open Plains, two light forests, and the way north to Fort Frostcrown. Act 2 ends with the party heading south into Act 3.

### Factions and lore

- "Weaver" means anyone who can cast; it is not a faction.
- **The Archon Covenant** keeps Etharis as it is, with the secret of magic hidden (colours: purple with a gold sigil). **The Unbound** want to reveal the secret and dismantle the Covenant (yellow with a red sigil, a snapped thread). **The Purifiers** (the extremists, including Kellan Vex) want to destroy magic at any cost, even by using it. The player can join all three, the Purifiers are the hardest, and joining is saved for Act 3.
- Arbitrator Isaura Thorne is a woman. Arden Rose is a dormant lich king reserved for an expansion. The orcs in Act 2 are mercenaries hired by the House in the Frozen Vale.
- The hero's tome is secret and not a normal tome. Torn pages hold the forbidden roots; the first torn page is found in Act 3 and Ulric hints at a stolen southern tome (incomplete) before the party goes south. The Covenant would lock the hero up for having it.

### Party

- **The hero (Corin or Elowyn):** the damage dealer through magic. Weapons are foci that add MAG and a spell bonus with a small ATK; Basic Attack stays as a breath-regaining fallback.
- **Tessa:** sword, buffs and debuffs (Rally, Steady, Quickstep, Hinder, Rattle, Mark).
- **Hakon Redfell:** joins at Ashford in the Purple Thistle at Night. A tank who taunts and hits hard but slowly. His brother Arthur was taken by bandits; the trail runs from the east forest through southern Etharis to Capital City.
- Companions change only by gear.

### Areas, sizes and levels

| Area | Size | Levels | Notes |
| --- | --- | --- | --- |
| Open Plains | about 190 by 110 | 7 to 10 | Largest. Main path to the Fort, spurs to Ashford and Greywick, camps, landmarks, golem, field Pillars. Snow bands run green to full snow going north. |
| West Forest | about 90 by 55 | 7 to 9 | Ruins, a scholar, skeletons by Night. Worn Covenant Construct (level 9, two phases) guards a chest with the Weaverplate Cuirass. |
| East Forest | about 90 by 55 | 10 to 12 | Five-stage bandit camp with orc mercenaries, a tarped Pillar rest fire, and the Iron Cleave (level 12, two phases) on a coastal bluff. |
| Ashford | about 56 by 68 | town | Covenant-leaning, lively. Curate Voidsong, the Purple Thistle (Winnie Fenn), Hakon. |
| Greywick | about 56 by 68 | town | Unbound-leaning, run down. Lampwright Gideon Marsh and the Pillar Keystone quest. |
| Frostcrown Outskirts | about 100 by 60 | 12 to 13 | South gate (toll), north gate (search), a secret entrance on the west flank with nobody near. Rimefang (level 14) lairs in the north-west tor at Night. |
| Fort Frostcrown | about 170 by 100 | safe | Second largest. Arbitrator Ulric Icetoe. Market, barracks, sparring (Captain Ysolt Rennick), Weaver hall, storehouse, lower quarter. No combat except sparring. |

### Story flow (ten chapters)

1. Leaving Oakhaven
2. The road to Ashford
3. Ashford: Voidsong, Hakon and the sabotaged Pillar
4. The open plains (4a West Forest, 4b East Forest)
5. Greywick: the Keystone request
6. The Outskirts
7. Fort Frostcrown and Ulric's two quests
8. Quest 1: the letter to Old Maud, rebuilt Oakhaven and the Odile memorial, fast travel (Mem-it)
9. The Keystone returns to Greywick
10. Quest 2 and leaving south

### Systems

- **Pillars and day/night:** the player swaps Day and Night only by resting at an activated Pillar (the Oakhaven Pillar starts activated; others activate on first touch). A Pillar also restores HP and MP, saves, sets the respawn point, lets the player craft and study, and respawns regular enemies (not bosses, mini bosses, the golem or cleared chests). A centre-screen pop-up introduces this at the start of Act 2. Day and night change which enemies appear and when quests progress. Nothing is time-locked forever: waiting always works.
- **Inns:** resting at an inn also swaps time, restores, crafts and studies, but enemies do not respawn and every night costs coins (Ashford 30, Greywick 40, Fort 25).
- **Fast travel:** after Old Maud teaches it in chapter 8, touching a Pillar and saying Mem-it travels to any Pillar the player has visited. It adds no notoriety.
- **Study:** Thread Study, a short two-step mini game with mastery marks (small spell bonus) that cannot be played near the Covenant. Words from The Tellers' Primer: Ver, Cogn, Sens and the suffix -ix. Sens displays enemy health.
- **Crafting:** at any activated Pillar, three tracks (brewing, making, upgrading at a town forge), about 12 to 15 recipes, no failure or time cost, and a crafted item never sells for more than its materials.
- **Economy:** shops charge well above loot value, merchants have limited coin purses, prices fall for large stacks, and quest rewards scale with level. No carry weight, stacks cap at 999.
- **World rules:** picked herbs vanish and regrow randomly; chests open with an animation and stay open; wolves only in woods, rocks and caves; skeletons only at Night in ruins and at the standing stones.
- **Audio and access:** a lower default volume, audio sliders and a full accessibility menu ship with the Act 2 release.

### Bosses and unique loot

| Encounter | Where | Reward |
| --- | --- | --- |
| Worn Covenant Construct (Lv 9) | West Forest ruins | Weaverplate Cuirass (guard bonus: reduced damage when guarding), key, iron scrap |
| Rock golem (Lv 10) | Plains standing stones | Stone heart, cache |
| Iron Cleave (Lv 12) | East Forest bluff | The Tellers' Primer, Hakon's cleaver, bill of sale (Arthur's clue), House signet ring |
| Rimefang (Lv 14, optional) | Outskirts tor, Night | Rimefang Pelt, alpha's fang |
| Camp captains | Ambush camp, Rook's Hollow, Purifier camp | Chests and tier gear |

### Act 1 changes to make when building starts

- Tessa's end-of-Act-1 line: the Arbitrator only points the player to Ashford for shelter and supplies, so the book stays secret (approved).
- One optional foreshadow line from Old Maud about her son (approved).
- Oakhaven's east exit gains the closing wooden gate, and Oakhaven gets a rebuilt-town map variant with the Odile memorial.
- No day/night tutorial in Act 1; that is introduced at the start of Act 2.

### Open items

- Ulric's backstory and exactly what he says about the stolen southern tome and the first torn page.
- Whether Voidsong's name hints at the forbidden root Nihil.
- Purifier clues across the plains, and how the player reaches the Purifiers in Act 3.
- Whether Hakon keeps Sanguis casting, and whether Mem-it adds Mem to the spell words.
- The scholar's name at the West Forest ruins.
- Where the Fort's inn is (market inn, barracks bunk and lower-quarter hostel all appear in the plans).
- Tessa's sword sprite and the bandit archer's code-drawn bow need concept art approval.
- Real-device checks of touch controls, audio and portrait layouts, and a check that the name "Unwoven" is free.
- Per-item coin values and exact stats are a first pass, to be tuned in play.

## Act 2 plan: The Plains and the North (planning only, nothing built)

**Status:** planned, not built. Act 2 begins when Act 1 ends: Odile has died, Tessa joins the party, and the two set off for Ashford, the first town on the road.

**Factions (supersedes earlier faction names).** "Weaver" is simply the word for anyone who can cast, whether they serve the Covenant or the rebels, so it is not a faction. The three joinable factions are:

| Faction | Aim |
| --- | --- |
| The Archon Covenant | Keep Etharis as it is, under their control, with the secret of magic kept a secret. |
| The Unbound | Reveal the secret to the world and dismantle the Covenant. |
| The Purifiers (the Extremists) | Destroy magic at any cost, even by using it themselves. Kellan Vex belongs to them. |

The player can join all three, and the Purifiers are the hardest to join. Vex himself stays hidden and cannot be joined. Act 2 only plants Purifier clues (rumours, signs, traces); actual joining is Act 3. Older sections of this document that say Weavers or Liberators should be read as Covenant and Unbound.

**Geography (follows the Talvora map strictly).** Oakhaven is in the northwest of Etharis. The route runs east, then north-east across the open plains in central Etharis. Fort Frostcrown sits at the northern tip of Etharis where it meets the land bridge to the Frozen Vale. Capital City lies southeast of the route and is not reachable in Act 2. The west forest runs toward the southwest mountains. The east forest runs toward the east coast, with the Dread Expanse visible across the water.

**Snow gradient.** The environment changes as the player travels north: green grass in the south plains, frosted grass and bare trees in the mid plains, patchy snow with drifting flakes and visible breath in the north plains, and full winter in the Outskirts and the Fort, each with its own music and colder lighting. Enemies get snow re-skins.

**Areas**

| Area | Size (suggested, tiles) | Contents |
| --- | --- | --- |
| Open Plains | Largest, about 190x110 (about 3x the North Woods) | Two pillar towns, roaming bandits, hostile and friendly camps, hostile and friendly wildlife, side quests, loot, the rock golem mini boss at a ring of standing stones |
| West Light Forest | About 90x55 | Branches off the plains toward the southwest mountains. Mini boss: the Worn Covenant Construct (Robot pack Destroyer, grimmed), with the Weaverplate Cuirass |
| East Light Forest | About 90x55 | Branches off the plains toward the coast. Mini boss: the Iron Cleave (Knight pack, grimmed), with The Tellers' Primer and Hakon's cleaver |
| Frostcrown Outskirts | About 100x60 | Separate area outside the Fort. North gate, south gate and a secret entrance, with Covenant guards outside the gates |
| Fort Frostcrown | About 85% of the plains, about 170x100 | Large Covenant outpost run by Arbitrator Ulric Icetoe. Second largest area in Act 2. Always called Fort Frostcrown since it was built |

For scale, the North Woods is 108x60 tiles and the Southern Rocks 100x50. A plains map about three times the largest existing one needs a check on drawing and foe-count budgets before it is built. All the mini bosses (rock golem, Worn Covenant Construct, Iron Cleave, Rimefang and the camp captains) use art from packs already supplied (Robot, Knight, Rocks, wolf, Warrior, Wizard), grimmed to match the game; nothing is drawn from scratch.

**Plains content**

- **Ashford:** a pillar town on the way to the Fort, with a small Covenant outpost. The townsfolk mostly support the Covenant. Act 1 keeps naming Ashford as the destination; on arrival the player is directed north to the Fort. Ashford has always been separate from the Fort.
- **Greywick:** the second pillar town, further along where the snow begins, with an Unbound outpost. The town leans Unbound.
- **Pillars** act as safe points: saving, switching between day and night, restoring HP and MP, respawning regular enemies, crafting, studying (away from the Covenant) and, after Maud, fast travel.
- **Bandits** use the Warrior or Knight packs, grimmed. Wolves stay out of the plains (they belong to woods, rocks and caves). Hostile plains creatures are slimes, wild boars and field rats by Day, and skeletons and Purifier scouts at Night; friendly wildlife is the hunt animals.
- **Rock golem:** an optional mini boss that wakes when the player takes what the standing stones guard. Unique loot.
- **Side quests:** one of them reveals the secret entrance to the Frostcrown Outskirts and Fort.
- **Kellan Vex and the Purifiers** appear only as rumours, signs and traces.

**The three entrances**

- **North gate:** a checkpoint that searches travellers. The Covenant hides books about the old magic, so carrying the tome is a real risk here.
- **South gate:** a trade gate with a coin toll and less scrutiny.
- **Secret entrance:** found only through the plains side quest. No guards, no NPCs and no roaming bandits near it, so it feels cut off.

**Level range.** Act 1 ends around level 6. Plains 7 to 10, West Forest 7 to 9, East Forest 10 to 12, Outskirts 12 to 13 (Rimefang 14), Fort sparring 12 to 14.

**Companions in Act 2**

- **Tessa Hollis:** Bram's niece from the Hollow Oak (not a Clerk's apprentice). Her look does not change. She starts with a sword as her weapon, shown in hand on her sprite (new weapon art needs concept approval before building). Suggested origin: the old blade Bram keeps behind the bar.
- **Role:** buffs and debuffs, not healing. Tavern-born tricks: Rally (a rousing song, attack up), Steady (a hot meal, defence up), Quickstep (a fiddle jig, speeds allies' turns), Hinder (a spilled tray, slows a foe), Rattle (a heckle, lowers attack) and Mark (she reads a foe's tells, lowers defence). The sword is her light attack.
- **Sustain:** with no healer, Act 2 healing comes from potions, the player's own magic and resting at pillars. Balance needs a check before building.
- **Companion customization:** gear changes only (weapon, head, body, charm), shown on their sprites. No colour options.

**Still open**

- How the player reaches the Purifiers (saved for Act 3).
- (Resolved: Weaverplate Cuirass, The Tellers' Primer, Hakon's cleaver, Rimefang Pelt.)
- The Fort's layout and main quests, and the Covenant, Unbound and Purifier intro quests.
- The sword sprite for Tessa and the standing-stone ring layout, both of which need concept art approval first.

### Open Plains: detailed layout (planning only, nothing built)

The proportions below are approved. A layout diagram (plains\_layout.png) was shared in the conversation. Coordinates are tiles on a 190 by 110 map, x east and y south, north at the top.

**Entrance.** The player leaves through Oakhaven's east gate (the existing "East road: Ashford and the outer provinces" sign) onto the plains' west edge at about (3, 78). Act 1 text about Ashford and its Weaver outpost still works, because Ashford's outpost is the Covenant's caster outpost. No Act 1 change is needed.

**Paths**

- **Main path:** wide and clearly worn, about 200 tiles. Gate (3,78), then (22,76), (44,72), (70,66), (92,62), (108,52), (114,44), (128,30), (140,16), and out the north edge at (150,0) into the Frostcrown Outskirts.
- **Town spurs (slightly narrower):** to Ashford from the main path at (44,72), arriving at (58,78); to Greywick from the main path at (114,44), arriving at (98,32). Neither town sits on the main path.
- **Trails (narrow dirt tracks):** west forest from (22,76) to the south edge at (14,110); east forest from the crossroads at (92,62) east to the edge at (190,70); standing stones south to (92,86); Rook's Hollow from (130,66) south to (130,90); hunters' camp from (22,76) to (28,56); ambush camp from (70,66) to (60,44); traders' camp from the crossroads to (84,58); Wayfarers' fire from (128,30) to (140,52).

**Snow bands by latitude (y).** South of y 66: green plains (Ashford, the start). y 46 to 66: frosted grass, bare trees, a first dusting. y 24 to 46: patchy snow (Greywick). North of y 24: full snow, ending at the Outskirts.

**Places**

| Place | Position | Notes |
| --- | --- | --- |
| Ashford | (58,78) | Pillar town, small Covenant outpost, townsfolk mostly support the Covenant |
| Greywick | (98,32) | Pillar town, Unbound outpost, the town leans Unbound |
| Hunters' camp | (28,56) | Friendly; wildlife tips and hunting side quests |
| Traders' roadside camp | (84,58) | Friendly; buy and sell |
| Wayfarers' fire | (140,52) | Friendly; starts the secret-entrance side quest |
| Ambush camp | (60,44) | Hostile bandits, small loot |
| Rook's Hollow | (130,90) | Hostile bandit camp, the best loot on the plains |
| Standing stones | (92,86) | Optional rock golem mini boss, unique loot, wakes when the guarded item is taken |
| West Light Forest | south edge (14,110) | Worn Covenant Construct mini boss |
| East Light Forest | east edge (190,70) | Iron Cleave mini boss |

**Landmarks along the paths**

- **Mile markers:** stone markers about every 25 tiles along the main path, counting down the distance to Fort Frostcrown.
- **Ruined farmstead (34,74):** early and close to the road. Light loot and a few lines about the Covenant tithe.
- **Signposts at each junction:** at (44,72) for Ashford, and at the crossroads and the Greywick turn.
- **River crossing and stone bridge (78,65):** a river runs north to south across the road, with a lone Covenant patrol at the bridge.
- **Crossroads watchtower ruin (92,62):** a roadside waystone shrine and signs for the east forest, the stones, Greywick and the Fort.
- **Burned wagon with a Purifier mark (108,52):** a clue that Vex came this way, going north.
- **Overlook hill (114,44):** the first view north to the snow, at the Greywick turn.
- **Frozen pond (134,22):** the first ice, in the snow band.
- **Covenant boundary stone (146,6):** where the plains end and the Outskirts begin, with two mounted patrols.

**Danger along the road.** Bandits stay mostly off-road, and the road is safest near the towns. The riskiest stretch is the middle, from the crossroads to the Greywick turn, where bandit patrols cross the road. North of Greywick the road returns to Covenant patrols. Danger there comes from the cold and the snow wildlife instead. Level bands: Oakhaven to Ashford 7, the middle road and camps 8 to 9, Greywick and the north plains 9 to 10, Rook's Hollow and the golem 10.

**Technical note.** At about 21,000 tiles this is the largest map in the game, so it needs a performance check (drawing, collision and foe counts) before it is built. Pillars and towns are separate maps entered through warps, like the existing interiors.

### Act 2 light forests, Hakon and the starting-words change (planning only, nothing built)

Both forests are about 90 by 55 tiles. A layout diagram (forests\_layout.png) was shared in the conversation.

**West Light Forest: the Weaver construct**

- The trail enters from the plains at the north end and winds south to a ruined stone courtyard in the southwest. A side loop passes a friendly glade (deer and hare), a mandrake patch, a wolf den off the trail, herb patches and a mossed shrine. Wolves are allowed here (woods).
- The construct is dormant among the ruins, looking like a rusted statue, and wakes only when the player tries to open the chest it guards. Art comes from the Robot pack, grimmed.
- It is worn down: level 9 with 340 HP (it is the Worn Covenant Construct), a damaged limb that limps and slows it, a heavy slam that telegraphs, and an arm shot that sometimes misfires. It fights in two phases (Overdrive below 50 percent; see the West Forest table). Weak to storm and wind, resistant to stone and light.
- Defeating it drops the key. The chest is locked until then, and holds a unique piece of **body armour**.
- The armour is the Weaverplate Cuirass: Weaver-forged plate that is warded, so iron does not ground the wearer's workings, with reduced damage when guarding.

**East Light Forest: the Iron Cleave**

- A left-to-right gauntlet through the bandit camp in five stages: (1) the Outer Watch, (2) the Palisade Gate, (3) the Lumber Yard and Tents, where a tarped Pillar gives the rest fire, (4) the Captive Pens, and (5) the War Camp and Bluff Path, with a small second Pillar at the foot of the bluff. Each stage has side loops with extra chests.
- The boss, **the Iron Cleave**, waits on a coastal bluff at the end, with the Dread Expanse in view across the water. Art comes from the Knight pack, grimmed.
- Bandits and mercenaries rise from level 10 to 12 through the camp and the Iron Cleave is level 12. By then the player should be several levels higher with decent gear and the second companion, so the fight is harder than the Thornmother.
- Two phases at 50 percent health: the Knight (shield and Protect stance), then the Cleaver (no guard, whole-party Cleave, Rend), with Orc mercenaries from the House in the Frozen Vale beside him. Tessa's Mark and Rattle matter here.
- Reward: The Tellers' Primer (truth and thought workings: Ver, Cogn, Sens and the suffix -ix), the first clue to Arthur, Hakon's unique cleaver and a House signet ring.
- Rook's Hollow on the plains is suggested as the Iron Cleave's supply camp; clearing it could reveal a back route into the forest camp.

**Hakon Redfell: second companion, recruited at Ashford**

- Hakon, a Frozen Vale sellsword, is in Ashford's tavern, drinking alone.
- If the player asks the tavern keeper for work or directions, the keeper sends them to Hakon, who is looking for someone to help him find someone important to him. The player can also go straight to Hakon without talking to the keeper first.
- Hakon offers his services if the player promises to help him. That promise starts his first companion quest.
- Role: tank. He taunts enemies, takes a lot of damage and hits hard, but attacks slowly. (Open: whether he keeps Sanguis casting; as a pure tank he does not need it.)
- He joins in Ashford, early on the road, well before the east forest. The party from Ashford on is the player, Tessa (buffs and debuffs) and Hakon (tank). Plains balance needs a check with three in the party.
- Open: who he is looking for, and where that leads (a link to Fort Frostcrown is one option).

**Starting words (decision reversed).** The idea of giving the player fewer starting words was dropped. What the player starts with in Act 1 is plenty, so Act 1's words, balance and tutorial stay as they are. The Iron Cleave's tome is The Tellers' Primer.

**Hakon's quest: the search for Arthur (planning only; this supersedes the open question above about who he is looking for)**

- Hakon is looking for his brother, **Arthur**, who was taken by a group of bandits several years ago. Hakon has searched ever since, and was recently tipped off about where Arthur might be.
- Hakon does not say this at first. In Ashford he only says he is looking for someone important to him. His brother's name and story come out gradually through camp dialogue as the quest goes on.
- The quest is a chain of places that each hold clues pointing to the next place to search.
- **Part 1 (Act 2):** the tip leads to the bandit camp in the east forest, the Iron Cleave's camp. The player fights through the camp, and at the end finds the first clue, which points to an area that will appear in Act 3. The quest continues in Act 3.
- Suggested beats: Hakon's promise and the tip in Ashford; a small first lead at Rook's Hollow (the supply camp, where a note also reveals the back route into the forest camp); the rest fire in the forest, where Hakon tells the player about Arthur; and the clue after the Iron Cleave falls.
- Open: whether the Iron Cleave's band is the one that took Arthur, and what Act 3 area the first clue points to.

**Arthur's trail (decided; supersedes the two open points above)**

- The Iron Cleave's band held Arthur for a short while before selling him to another band. The first clue, found at the end of the east forest camp, points to that band and so to the next place to search.
- Act 3 is expected to take place in southern Etharis. All the other countries stay reserved for expansions, which fits the first release covering Etharis only.
- Arthur ends up in prison in Capital City. The quest therefore runs from the east forest, through southern Etharis in Act 3, to Capital City, which is also where the finale is set.
- Act 3 itself will be planned when we reach it.

### Act 2: Frostcrown Outskirts and Fort Frostcrown (planning only, nothing built)

A layout diagram (outskirts\_fort.png) was shared in the conversation.

**Frostcrown Outskirts (about 100 by 60 tiles)**

- A ring of snowy ground around the Fort's walls. The player arrives from the plains at the south.
- The south gate is the toll gate, straight ahead on arrival. The north gate is the search checkpoint, reached by following a flank road around either side of the walls. Covenant guards stand outside both gates, with guard posts beside them and no enemies nearby.
- The secret entrance is on the west flank, in a cleft of rock far from any guard post, with no one around. It leads into the Fort's kitchen undercroft.
- Not much happens here: a wagon queue, a wayside shrine and a patrol notice board near the south gate. At the north end a Covenant barricade blocks the road to the Frozen Vale, a hook for a later expansion.
- Enemies are found away from the gates: snow slimes and bats on the west flank, raiders and deserters on the east, frost slimes in the northeast, and wolves and bats only at a rocky tor with a small cave in the northwest (wolves stay in woods, rocks and caves).

**Fort Frostcrown (about 170 by 100 tiles)**

- One walled map, only slightly smaller than the plains, with a main road from the south gate through Pillar Square to the north gate. It is a safe zone with no enemies, and its buildings are interiors like Oakhaven's.
- Districts: Pillar Square and chapel (centre); the market (south: stalls, provisions, smith, apothecary, inn); the command post (north, where Arbitrator Ulric Icetoe stays and directs the fort, with the holding cells below); the barracks, training yard, armoury and forge (east); the kitchens, mess hall, stores and undercroft (west, where the secret entrance comes in); the Weaver hall (northwest: casters and grey-cloaked inspectors); the lower quarter (southwest: workers' homes, grim, since lower-status people are treated badly even inside the walls); and rampart stairs and wall walks (northeast).
- The training yard allows sparring: the player can fight practice bouts there.
- This is where the player is truly introduced to the Covenant for the first time: seeing them train, talk and manage the northern region.

**Arbitrator Ulric Icetoe**

- Strict and firm, but polite and gentle when needed. He runs a tight fort and treats his people with respect. He specializes in fire magic.

**Joining the Covenant: two quests from Ulric**

- Ulric gives the player two quests to complete before they can join the Covenant officially.
- **Quest 1:** takes the player back to the plains, possibly back to Old Maud to collect something only she would have. Note that Maud's cottage is in the North Woods, at the end of the trail north of Oakhaven, so this is a long trip back through the plains and Oakhaven. Pillar fast travel would help.
- **Quest 2:** takes the player to the southern region, into Act 3.

**Act 3 scope (to plan when we get there)**

- Act 3 should be the largest place built so far, with two cities, several settlements and plenty to do. It is set in southern Etharis.

### Covenant quest 1: the letter to Old Maud, the closed gate and fast travel (planning only, nothing built)

This supersedes the earlier open questions about Quest 1 (decided: it goes to Old Maud).

**Old Maud is Ulric's mother.** Ulric gives the player a letter to deliver to her.

**The closed way back**

- When the player crosses into the plains from Oakhaven's east gate, the way back is blocked until Ulric gives this quest. If the player tries to return, a wooden gate is shut and a guard says it is best to come back later: the town needs to rebuild after it was wrecked.
- Once the quest is given, the gate opens.

**Returning to Oakhaven**

- Some buildings have been rebuilt. The townsfolk are cold toward the player, because they blame the player for what happened.
- They will talk, but no one except Bram will deal with the party.
- Resolved: yes, a memorial or grave.

**At Maud's cottage (North Woods, end of the trail)**

1. The player delivers the letter. Maud is touched, says she misses her son, and says he is a good man who can be trusted.
2. She gives the player a shipment of healing supplies to take back to the Fort.
3. After that she explains fast travel.

**Fast travel**

- Introduced by Old Maud. By touching a pillar and reciting a word, the player can travel to any pillar they have been to before.
- She suggests trying it at the Oakhaven pillar, to get back to the Fort.
- Resolved below: Mem-it, and no notoriety.

**Quest flow:** Ulric gives the letter and the gate opens; the road back to Oakhaven; a cold reception, with only Bram dealing with the party; the North Woods and Maud; a trip back to the Oakhaven pillar and the first fast travel to the Fort; delivery of the supplies to Ulric, which completes the quest.

**Continuity notes**

- Act 1 currently shows Maud only as a hermit witch who teaches Bary-is. Making her Ulric's mother needs no change, but one optional foreshadowing line in Act 1 would help.
- The closing gate is new work at Oakhaven's east exit, and the rebuilt-Oakhaven state is a new map variant.
- Tessa is Bram's niece, so the cold reception is also a personal moment for her.

**Covenant quest 1: decisions (these close the open items above)**

- **Fast travel word:** the pillar phrase is Mem-it, from the root Mem (memory) with the suffix -it (an instant snap with no weaving, which cannot be ruptured). It fits because the player travels to a pillar they remember. Maud teaches it as a fixed phrase. Whether it also adds Mem to the player's spell words is still to be decided.
- **Notoriety:** fast travel does not add to the player's notoriety signature.
- **Odile memorial:** the rebuilt Oakhaven has a memorial or grave for Odile.
- **Act 1 foreshadowing:** Old Maud gets one optional line in Act 1 hinting at her son, for example that her boy writes when he remembers. This is a small Act 1 text change, to be made when building starts.

### The Archon Covenant rank structure (lore, from Ryan)

The Archon Covenant governs the Weaver Order through a rigid four-tier hierarchy designed to preserve its monopoly on magic and conceal the true history of the Old Tongue and The Divide. Authority and arcane knowledge are strictly compartmentalized from the top down, so public-facing members genuinely believe in the institution's benevolence while a secretive leadership class keeps absolute control.

| Tier | Role |
| --- | --- |
| The High Council (Archons) | The secretive ruling body: nine leaders based in the Great Sanctum in Capital City. They hold complete authority over the Covenant and guard its deepest secrets, including the true nature of the Old Tongue and the location of The Divide. |
| Arbitrators | The inquisitorial arm and judicial enforcers. They travel the provinces to conduct inspections, monitor Leyline Pillars, recover magical contraband, hunt down unsanctioned magic users and enforce Covenant law. |
| Weaver Curates | The public-facing branch and civic servants of the Order. They give everyday aid to commoners, such as healing and infrastructure repair, and are kept largely ignorant of the High Council's deceptions, so their genuine goodwill reinforces public trust. |
| Initiates (and Scholars) | Young recruits raised and educated in Weaver Sanctums. They learn the Old Tongue by rote and are taught that magical ability is a rare biological gift rather than a learnable skill, which anchors the Covenant's control from the ground up. |

### Act 2: Ashford (planning only, nothing built)

A layout diagram (ashford\_layout.png) was shared in the conversation.

**Character of the town**

- The player's first real contact with the Covenant. Ashford leans heavily toward supporting them: Covenant flags and banners are everywhere, and Covenant members are frequently seen walking around.
- It is otherwise a normal, lively town, slightly larger than Oakhaven. Oakhaven is 48 by 60 tiles, so Ashford is about 56 by 68.
- Ashford is a pillar town on a spur off the main plains path.

**The outpost and Curate Voidsong**

- A small local Covenant outpost, run by Curate Voidsong, who specializes in darker magic. Despite that, she is very bubbly and welcoming.
- As a Curate she belongs to the public-facing tier, so she sincerely believes in the Covenant and knows nothing of the High Council's deceptions.

**Layout (first proposal)**

- Main gate in the northwest where the plains spur arrives, a farm gate in the east, and a south lane to the fields.
- Pillar Square in the centre. The Covenant outpost faces it from the north. A tavern and inn sit to the east (Hakon drinking alone inside). The chapel is to the west, with the notice board where a leaflet was torn down in Act 1.
- A market row south of the square (provisions, apothecary, smith, tailor), a cooper (Tarn and Son, who was away at Ashford in Act 1), and homes, a mill and a well in the south.

**Continuity with Act 1**

- Ashford buys wolf fangs and spider silk. Its Pillar went dark for a whole night a month ago. Four grey-cloaked Weaver inspectors rode out there recently. The chapel door had an Unbound-style leaflet torn down by the Curates. The Arbitrator in Act 1 told the player the Ashford outpost might know what the tome is.

**Open**

- The Covenant's colours (Covenant Grey with a silver sigil is the working idea), Voidsong's roots, the tavern and keeper names, and how Voidsong sends the player on to the Fort.

### Ashford decisions, the tome's secret, audio and accessibility (planning only, nothing built)

**Ashford decisions**

- **Covenant colours:** purple with a gold sigil, on the banners and flags that fill Ashford. (Open: Act 1's Isaura Thorne wears Covenant Grey, so the suggestion is that grey cloaks mark Arbitrators and inspectors, and purple and gold is the Covenant's flag and Curate colour.)
- **Curate Voidsong's roots:** approved. She uses the sanctioned dark roots Tenebr (shadow), Mut (silence) and Somn (sleep). The idea that her name hints at the forbidden root Nihil was not decided.
- **The letter of introduction:** Voidsong gives the party the letter to Fort Frostcrown only in exchange for help. The help is investigating why Ashford's Pillar has been flickering lately.
- **The tavern and its keeper:** see the decisions below (the Purple Thistle; keeper Winnie Fenn).

**Story note: the tome is a secret**

- The hero's tome (Corin's, or Elowyn's if the player chose her) is not a normal tome, and having it must stay secret. The hero slowly finds this out by studying it.
- Each new word the hero learns is recorded in the tome. Pages have been ripped out.
- The hero must find the torn pages scattered around Talvora and study them, and discovers that they hold the restricted, dangerous words (the forbidden roots).
- The Covenant is looking for the tome. The hero must hide that they have it, because the Covenant will lock them up for having it, even if the player joins the Covenant.
- Continuity problem to resolve: at the end of Act 1 Tessa says the Arbitrator thinks the Ashford outpost will know what the book is and that the player should go there. That conflicts with the tome being secret, so that Act 1 line needs a change when building starts.
- Open: how hiding the tome works in play (scripted choices at searches, or a systemic scrutiny meter), what happens if the player is caught (one option is a locked-up scene in the Fort's cells), and when Tessa and Hakon learn what the tome is.

**Audio**

- A tester reported the music was too loud when the game first started. Plan: start at a lower default volume and add audio sliders in the settings. Today the settings have only four music presets (Off, Low, Medium, High) with Medium as the default.

**Accessibility**

- A full accessibility options menu in the settings. Proposed groups: Vision (text size, high contrast, colour-blind modes, larger UI, a readable font option), Motion (reduce motion, no screen shake, reduced flashing and particle effects), Audio (master, music and effects sliders, visual cues for important sounds), Controls (joystick size and position, left-handed layout, larger buttons, one-handed mode, haptics on or off), Reading (text speed, auto-advance dialogue, a dialogue history log, clearer quest objectives) and Battle (the existing wait mode and auto-release, slower battle speed, auto-target and tap-to-target).

**Decisions (these close the open items in the section above)**

- **Ashford's tavern:** The Purple Thistle, run by Winnie Fenn (loud and kind, treats everyone like family), who sends the player to Hakon. Greta Mallow, proposed earlier, is replaced.
- **Hiding the tome:** scripted choices in Act 2 (hide it, lie or take a risk at searches such as the north gate). A scrutiny meter, where Covenant places and Arbitrator inspections raise the risk, starts in Act 3.
- **Act 1 line change:** approved. Tessa's end-of-Act-1 line changes so the Arbitrator only points the player to Ashford for shelter and supplies, and the book stays secret.
- **Audio:** the lower default volume and the audio sliders ship with the Act 2 release, together with the accessibility menu.

### Act 2: Greywick and the Unbound (planning only, nothing built)

A layout diagram (greywick\_layout.png) was shared in the conversation. The Unbound rank structure below is a proposal, since Ryan asked for help creating it.

**Character of the town**

- The same size as Ashford, about 56 by 68 tiles. It supports the Unbound in their revolt against the Covenant.
- The Unbound's colours are yellow with a red sigil (working idea for the sigil: a snapped red thread, echoing the game's title).
- It is more run down than Ashford, because it has been cut off from the Covenant and its resources, but the people get by: broken fences, patched roofs, shuttered homes and patches of snow.
- The people are standoffish, reserved and prefer to keep to themselves.
- A small Unbound outpost sits in the town, run by one of their own. Its leader is a Lampwright (Gideon Marsh, decided).
- The town's Pillar is run down and flickers from lack of maintenance. The outpost leader gives the player a quest to restore it with an ancient item that can be stolen from Fort Frostcrown. The secret entrance into the Fort's undercroft is the natural way in.

**Layout (first proposal)**

- Gate in the southeast, where the spur from the main path arrives. The flickering Pillar stands in a small square in the centre.
- The Unbound outpost (the Lamp House) is in the northwest, with a yellow lamp in the window. A boarded Covenant chapel in the west serves as the Unbound's meeting place. A cheap, quiet inn is to the east.
- A small trader's stall and half-working forge lie south of the square. Hunters' huts are to the southeast, and a graveyard and fallen watchtower to the northeast. Many homes are shuttered.

**The Unbound: rank structure (proposal)**

The Covenant is a rigid, secretive hierarchy. The Unbound are the opposite: open and decentralised, built around cells that teach the Old Tongue to anyone. Their lamp imagery matches the yellow.

| Tier | Role |
| --- | --- |
| The Seven Speakers | A council elected by the movement. They have no single seat and are scattered across Etharis, and no one knows all seven, for safety. They hold the movement's aim: to reveal the secret of magic to the world and dismantle the Covenant. |
| Torchbearers | Field commanders (the Unbound's counterpart to Arbitrators). They organise the cells, run raids on Covenant stores and move people and books between towns. |
| Lampwrights | Outpost leaders and teachers. They keep a community's lamp lit: running the outpost, teaching, and sheltering the hunted. The Greywick outpost leader is a Lampwright. |
| Kindlings | Everyone who joins. They are taught openly that magic is a skill anyone can learn, not a rare gift, and learn the Old Tongue by practice instead of rote. |

**Open**

- The outpost leader's name, the name of the ancient item and where in the Fort it is kept, whether the Covenant notices the theft, and whether the flickering Pillars in Ashford and Greywick are linked or have separate causes (sabotage in Ashford, neglect in Greywick).

**Greywick decisions (these close the open items in the Greywick section)**

- **The Lampwright is male.** His name is Gideon Marsh.
- **The ancient item is a Pillar Keystone:** an ordinary magic item the Covenant uses to keep Pillars in working order. Greywick has not received one since declaring for the Unbound, which is why its Pillar is run down and flickers.
- **The theft:** the Fort's storehouse holds many Keystones, so the Covenant does not notice when one goes missing. The storehouse is in the Fort's western stores district, next to the undercroft where the secret entrance comes in.
- **The flickering Pillars:** Ashford's and Greywick's flickers have separate causes. Greywick's is neglect from lack of Keystones. Ashford's cause is Purifier sabotage (decided).

### Act 2: story flow (first proposal, planning only, nothing built)

**More decisions recorded**

- **Greywick's Lampwright:** Gideon Marsh.
- **Ashford's flicker:** caused by sabotage from Purifiers hiding in a camp near Ashford. This adds a hidden Purifier camp close to Ashford (suggested: in a fold of the plains southeast of Ashford, around (72,88)).
- **Loot:** the construct drops the key to a chest holding the Weaverplate Cuirass. The Iron Cleave drops a tome that is a healing and guidance tome (The Tellers' Primer: truth and thought workings).

**Order of events**

| Chapter | Where | What happens | Level |
| --- | --- | --- | --- |
| 1. Leaving Oakhaven | Plains, west edge | After Act 1 the party (the hero and Tessa) leaves by the east gate. A wooden gate shuts behind them; a guard says to come back later while the town rebuilds. Tessa's buffs and debuffs are introduced. | 6 to 7 |
| 2. The road to Ashford | Main path | A gentle first stretch: ruined farmstead, signposts, a few weak enemies, friendly wildlife. | 7 |
| 3. Ashford | Ashford | The player meets Curate Voidsong and sees how the Covenant lives. At the Purple Thistle, Winnie Fenn sends the player to Hakon, who joins for a promise and starts his search for Arthur. Voidsong gives the introduction letter to the Fort only in return for investigating the flickering Pillar. The trail leads to the hidden Purifier camp, which has been sabotaging the Pillar. Clearing it repairs the Pillar and earns the letter. The party is now three. | 7 to 8 |
| 4. The open plains | Plains, free order | Exploration with camps, side quests, the standing stones and rock golem, the Wayfarers' fire (which starts the secret-entrance quest), and Rook's Hollow (a first lead on Arthur and a back route into the forest camp). Both light forests are here. | 8 to 10 |
| 4a. West Light Forest | West forest | The construct wakes when the player tries the locked chest. Its key opens the chest: unique body armour. | 8 |
| 4b. East Light Forest | East forest | The gauntlet through the bandit camp. At the rest fire Hakon tells the player about Arthur. The Iron Cleave (level 12) drops the healing and guidance tome and the first clue to Arthur, pointing to the south. | 9 to 12 |
| 5. Greywick | Greywick | A reserved, run-down Unbound town. Lampwright Gideon Marsh asks the player to fetch a Pillar Keystone from the Fort to restore the Pillar. | 9 to 10 |
| 6. Frostcrown Outskirts | Outskirts | The player chooses a way in: the north gate (a search, so a scripted choice to hide the tome), the south gate (a toll, waived by Voidsong's letter), or the secret entrance (no one around). | 11 to 12 |
| 7. Fort Frostcrown | Fort | The first true look at the Covenant: training, sparring, market, barracks. Arbitrator Ulric Icetoe gives two quests before the player can join. The Keystone can be taken unnoticed from the storehouse next to the undercroft. | 12 |
| 8. Quest 1: the letter to Maud | Plains, Oakhaven, North Woods | The gate home opens. Oakhaven is partly rebuilt and cold toward the party, and only Bram deals with them. An Odile memorial stands there. Maud (Ulric's mother) is moved by the letter and gives healing supplies, then teaches fast travel (Mem-it). The player fast travels to the Fort and delivers the supplies. | 12 to 13 |
| 9. The Keystone returns | Greywick | Fast travel to Greywick, restore the Pillar, and finish the Unbound's introductory quest. | 13 |
| 10. Quest 2 and leaving | Fort, then south | Ulric sends the player to southern Etharis, and Arthur's trail also points south, so both lead into Act 3. Act 2 ends as the party heads south. | 13 to 14 |

Updated levels (these supersede the Level column above): chapter 1 is 6 to 7; chapter 2 is 7; chapter 3 is 7 to 8; chapter 4 is 7 to 10 (4a West Forest 7 to 9 with the construct at 9; 4b East Forest 10 to 12 with the Iron Cleave at 12); chapter 5 is 9 to 10; chapter 6 is 12 to 13; chapter 7 is 12 to 14; chapters 8 and 9 are 13; chapter 10 is 13 to 14. Time of day matters in several chapters: Hakon and the Pillar flicker in Ashford are at Night, and the Fort gates are closed at Night.

**Dependencies and rules**

- Hakon joins at Ashford, so he is in the party for the rest of Act 2. The east forest should come after Ashford and Rook's Hollow.
- Greywick's quest is accepted at Greywick and completed after the Fort, since the Keystone is there.
- Fast travel only exists after Maud teaches it in chapter 8.
- Tome secrecy is handled by scripted choices at Ashford (Voidsong), the north gate and the Fort. Joining any faction is saved for Act 3 after all three introductory quests (Covenant: Ulric's two quests; Unbound: the Keystone; Purifiers: clues only).
- Resolved: the first torn page is found in Act 3; Ulric hints at it in Act 2.

## Act 2 decisions: tome, torn page, order, new enemy packs

**Decided**

- The Iron Cleave's tome is a healing and guidance tome whose guidance is **truth and thought spells** (reveal lies, read intentions, detect hidden things). It must stay a secret from the Covenant like the rest of Corin's tome work.
- The **first torn page is found in Act 3**. Ulric hints at it in Act 2 (without knowing what it is). Neither the west forest nor the Purifier camp holds it.
- The Act 2 story-flow order is **confirmed**, including Greywick before the Fort.
- Three new enemy packs supplied for Act 2: Orcs, Skeletons, and two Slime packs. Build nothing yet.

**Pack contents (checked)**

- Orcs (side-on, 96px): Warrior (green, axe), Berserk (brown, cleaver), Shaman (staff, Magic\_1/2 attacks).
- Skeletons (side-on, 128px): Warrior (shield and sword, Protect), Spearman (Protect, Fall), Archer (Shot, Evasion, Arrow projectile).
- Slimes: side-on Green/Red/Blue (already used in Act 1) and a top-down Slime1/2/3 pack with front/back/left/right views. The top-down pack does not match our side-on walking rule, so it is only a fallback.
- All are non-grim as supplied, so they get the standard grim treatment (desaturate, darken, scars and wear) and code animation where needed. Licence file points to Craftpix's standard free licence; add to docs/CREDITS.md when built.

**Proposed placement (for Ryan to approve)**

- Orc Warrior: Iron Cleave's bandit camp muscle in the east forest, plus rare plains raiders. Orc Berserk: east forest camp brute, strongest of the camp mooks before the Iron Cleave. Orc Shaman: camp support in the east forest (buffs, heals). Orcs should read as hired muscle and not a separate orc faction, unless Ryan wants one.
- Skeleton Warrior, Spearman, Archer: kept out of the open plains. Proposed home is the west forest ruins around the construct and the standing stones near the golem, as old-ruin guardians. This is also the first time the skeleton creature appears, which fits the rule that it waits until the player is in the wider world. They are undead from the Dread Expanse era, not Arden Rose.
- Slimes: the existing green/red/blue slimes stay in the plains and forest edges. Colour tiers by area (green plains, blue frosted bands, red near ruins) is proposed.
- Wolves stay in woods, rocks and caves only (rule unchanged).

**Still open**

- Orc lore: hired muscle or their own people?
- Do skeletons belong to the west forest ruin only, or also the standing stones?
- Ulric's hint about the torn page: what exactly he says and why he knows it.
- Enemy, loot and level tables per area are the next planning step.

## Act 2 decisions: orcs, Ulric's hint, and the day/night revamp

**Decided**

- The orcs are **hired mercenaries from the House in the Frozen Vale**. They are not a separate orc faction. This ties the Iron Cleave's camp to the Frozen Vale and gives Act 3 or an expansion a thread to pull.
- **Ulric's hint:** before the party goes south he tells them a tome was stolen from a southern vault, warns them to watch for monsters and bandits because the south is more dangerous, and, if pressed, reveals the tome is incomplete. He does not know it is the same tome Corin carries.
- **Day and night revamp:** time of day should matter. Certain enemies appear only at certain times, and quests can only progress or complete at certain times.

**How it works now (Act 1 code)**

- Time is two fixed moments, DAY\_T (9:00) and NIGHT\_T (21:30). Night counts as 19:00 to 05:00. Sleeping advances the day. Time otherwise changes only through scripted events (for example the Day 4 fire) and a toggle for old saves. Wolves respawn on each switch. NPCs re-settle on each switch.
- So the groundwork exists (NPC schedules, night lighting, respawn on change) but it is a binary switch, not something the player plans around.

**Proposed design (for Ryan to approve or change)**

- Four phases: Dawn, Day, Dusk, Night. Act 1 stays on its scripted two moments; the full system switches on when the player leaves Oakhaven.
- Time advances while the player travels the overworld at a slow rate, and jumps forward when resting at an inn, camp fire or Pillar. Resting lets the player choose which phase to wake in, so they can always wait for the time they need. Fast travel advances time by distance.
- **Enemies by phase (proposed):** skeletons only at Night, in the west forest ruins and at the standing stones; wolves hunt at Dusk and Night, rest by day; Purifier scouts and ambush camps only at Night; bandit roamers on the roads by Day, and they pull back into their camps at Night; slimes by Day and Dawn, tougher when it is wet or frosted; rock golem always present; orc mercs stay in the camp at all times.
- **Quests by phase (proposed):** Wayfarers' fire (secret entrance) only at Night; the Ashford Pillar flicker is only visible at Night, so the Purifier sabotage can only be investigated then; Odile's memorial at Dusk; Hakon is only in the Purple Thistle in the evening; Fort gates are closed at Night (north gate search and south gate toll only by Day, the secret entrance works at Night); Fort sparring and the market only by Day; Maud's hut is warm and open by Day.
- **Visibility:** night lighting gets darker the further north, snow glows. Add a clear clock or phase icon on the HUD and in the accessibility menu (a mode that reduces night darkness).
- **Rules to keep:** never lock the player out. Every time-gated thing can be reached by waiting. A quest should never be failed purely because of time, only delayed.

**Questions for Ryan**

- Four phases, or keep it simpler at two (Day and Night)?
- Does time pass slowly while walking, or only when the player rests or does something?
- Should the player be able to rest anywhere (at a camp fire), or only at inns and Pillars?
- Should Act 1 be left alone, or should the system be introduced early?

## Day/night: pillar-controlled (supersedes the four-phase proposal above)

**Decided**

- Day and night work like Octopath Traveler: two states, Day and Night, chosen by the player. The player can **only swap between them at a Pillar**.
- Pillars act like bonfires in a Souls game: the player's rest and anchor points.
- The four-phase clock (Dawn, Day, Dusk, Night), slow time passing while walking, and resting anywhere at a camp fire are **dropped**.

**Proposed pillar functions (for Ryan to approve)**

- Touch a Pillar to: swap Day/Night, restore HP and MP, save, set the respawn point on defeat, and use fast travel (Mem-it, once introduced by Maud).
- Resting or swapping respawns the regular roaming enemies in that area (not bosses, mini bosses, the golem, or cleared camps' loot). This keeps the Souls feel and gives the player a reason to be careful.
- The world stays in the chosen state until the player returns to a Pillar, so choosing Day or Night is a planning decision before leaving.
- Fast travel does not change the state. Arriving at a Pillar keeps whichever state the player is in.

**Consequences for Act 2**

- Pillars are needed in the field, not only in Ashford, Greywick, the Fort and Oakhaven. Proposed field Pillars: the crossroads watchtower ruin (92,62), the overlook hill (114,44), one at each forest entrance, and one in the Outskirts near the south road. This also lets the player swap time before a gate or camp.
- Every time-gated thing must be reachable by swapping at a Pillar, so the rule "never lock the player out" still holds. The Fort gates are shut at Night, so an Outskirts Pillar is required, otherwise a player stuck outside at night would have to use the secret entrance, which is itself a quest.
- Day-only: market, sparring, Fort gates, Maud's hut open. Night-only: skeletons, Purifier scouts and camps, Wayfarers' fire, visible Ashford flicker, wolves at their most active. Day-only: bandit roamers on the roads. Hakon being in the Purple Thistle is the evening scene; with two states this becomes Night in Ashford.
- Pillar lore: a short Old Tongue phrase to swap Day/Night would sit beside Mem-it. The word is still to be chosen.
- Act 1 stays scripted on its two moments; swapping at Pillars switches on when the player leaves Oakhaven.

**Questions**

- Does a swap respawn the regular enemies (Souls style), or only the ones tied to the state?
- Can the player swap Day/Night before Old Maud introduces the pillar word?
- What is the in-world reason the Pillars can change the time of day?

## Day/night: answers recorded

**Decided**

- **Resting at a Pillar respawns the regular enemies** in that area (not bosses, mini bosses, the golem or cleared camp loot).
- **The player can swap Day/Night from the start**, not only after Maud. A **tutorial is added to Act 1** that explains the point of the system.
- **In-world reason:** none needed beyond the simple one. The player rests at the Pillar and waits for the day to change. There is no time magic; the swap is just resting until the next morning or evening. Fast travel (Mem-it) stays a separate word that Maud teaches.

**Act 1 changes this adds (to do when building starts)**

- A short Pillar tutorial in Act 1 that shows resting, the Day/Night swap, and that resting respawns regular enemies and restores HP/MP.
- Proposed placement: at the Oakhaven Pillar, taught by Odile on an early evening so the first swap happens in a safe place. Placement and speaker to be confirmed by Ryan.
- Act 1 scripted time events (such as the Day 4 fire) still override the player's choice.
- Existing Act 1 code already respawns wolves and re-settles NPCs when time changes, so the tutorial hooks into that.
- Full Act 1 change list so far: this tutorial, Tessa's end-of-Act-1 line, Maud's foreshadow line, and the volume sliders and accessibility menu.

**Still open**

- Who teaches the tutorial and when in Act 1.
- The Old Tongue phrase (if any) used to rest at a Pillar.

## Day/night introduction moved to Act 2, and new loot packs

**Decided (supersedes the Act 1 tutorial)**

- The Day/Night swap is introduced **at the start of Act 2**, not Act 1. Act 1 stays on its scripted two moments and gets no tutorial. The Act 1 change list drops the Pillar tutorial.
- When the party leaves Oakhaven and the world opens up, a tutorial tells the player that at an **activated Pillar** they can: change the time of day, refill HP (and MP), study, and respawn basic enemies in the area.
- The tutorial must also say that **day and night matter** for quests and for which enemy types appear.
- Pillars must be activated first, so each Pillar needs an activation moment the first time the player touches it. Open: whether the Oakhaven Pillar starts activated.
- Open: who delivers the tutorial (Tessa is the natural choice as the guide who has just joined).

**Loot packs supplied (all 32x32 icons, 48 per pack plus a 2-icon bonus folder in the goblin and undead packs)**

- RPG Loot (creature materials): fangs, claws, hides, scales, feathers, horns, antlers, tails, bones, spines.
- Goblin Loot (goblin and mercenary gear): horned helmet, boots, tunics, shield, axes, hammer, bow, quiver, arrows, daggers, torch, teeth, bones, coins, necklace, potions, meat and food.
- Undead Loot: skull, bones, ribcage, organs (heart, eyes, brain), rings, amulets, crown, gems, bone necklace, purple skull tome, candles, voodoo doll, key, scrolls, letter, torn parchment.
- All are already fairly dark; they get a light grim pass (desaturate and darken) so they match the rest of the art. Add to docs/CREDITS.md when built.

**Proposed use (for Ryan to approve)**

- Plains wildlife and slimes: creature materials from the RPG pack (fangs, hides, feathers, antlers). Ashford buys fangs and silk, so these double as sell items.
- Orc mercenaries and bandits: gear from the Goblin pack (horned helmet, axes, bow and arrows, shield, boots, food, coins, potions).
- Skeletons (west forest ruins, standing stones, night only): bones, skull, ribcage, bone necklace, rings and gems from the Undead pack.
- Quest items: construct's chest key (Undead key), Voidsong's letter and Maud's letter (Undead letter), the clue to Arthur (Undead scroll), the Purifier camp find (voodoo doll or candles), and the Pillar Keystone (a cyan gem).
- Torn pages for Act 3: the Undead torn parchment icon.
- The Iron Cleave's tome needs its own look so it is not mistaken for Corin's tome. The purple skull book is a candidate but may be too close to the tome; to confirm.
- Rare finds from camps and ruins: crown, amulet, rings, alchemy ingredients (heart, eyes, brain) for later crafting or sale.

**Still open**

- Which icons are given to which enemy (drop tables come with the enemy and loot tables).
- Whether the Iron Cleave's tome uses the purple book icon.

## Tutorial answers, then sellable loot, crafting and study (draft)

**Decided**

- The Day/Night tutorial is a **pop-up in the middle of the screen** that the player acknowledges. No guide character delivers it.
- The **Oakhaven Pillar starts activated**; other Pillars activate on first touch.
- The Iron Cleave's tome gets **whatever look makes it clearly different from Corin's tome**. It does not use the purple skull book.
- Next planning topics: sellable loot, a possible basic crafting system, and a study mini game for magic.

**What exists today (Act 1 code)**

- Items already have a buy `price` or a `sell` value (wolf pelt 4, fang 2, slime gel 1, red-cap 2, mandrake root 3, spider silk 3, quarry token 6). A sell screen already exists in shops. Poultice heals 24 in battle.
- Studying is a scripted scene: the player waits for the right moment, reads the tome, and new words are added. There is no mini game yet. The trade jobs have mini games (for example the cleaning job), which is the pattern to follow.

### Sellable loot (proposed)

- **Tiers:** Scrap (1 to 3 coins), Common (4 to 10), Uncommon (12 to 30), Rare (40 to 100 or more). Quest items cannot be sold.
- **Who buys what:** hunters' camp (28,56) pays well for hides, fangs, antlers and horns; the traders' camp (84,58) buys anything but pays a little less; Ashford's general trader buys fangs and silk (continuity from Act 1) and gives the best price for herbs; Greywick pays lowest but buys salvage and ruined gear without questions; the Fort quartermaster buys weapons and armour at the best price; Curate Voidsong pays extra for undead remains and dark materials, in keeping with her specialty.
- **Market feel:** each buyer pays a bonus for one category (about 25 percent) and the price drops a little when the player sells a large stack. Prices recover when the player rests at a Pillar.
- **Day/night tie-in:** some materials only come at one time. Skeleton bones, Purifier items and night herbs (moon-cap) only at Night. Roaming bandit gear and day herbs only by Day. A player who wants both has to swap at a Pillar.
- **Icon use:** creature materials from the RPG Loot pack, gear from the Goblin pack and bones and curios from the Undead pack (see the earlier loot section).
- **Inventory:** open question whether there is a carry limit. Suggested: no weight, a generous stack limit (for example 99), so selling is about coins and not about juggling.

### Basic crafting (proposed)

- **Where:** at any activated Pillar (the bonfire is the workbench). Town forges and tailors handle gear upgrades only.
- **Three tracks:**
  - Brewing: herbs, gel and mushrooms into poultice, tonic, antidote, torch oil.
  - Making: hides, fangs, bone and silk into bandages, bone arrows, charms, cord, leather patches.
  - Upgrading (town forge or tailor): spend materials and coins to raise a piece of gear by a tier. This is how companions improve, since companions only get gear changes and no stat customisation.
- **Recipes:** a short list (about 12 to 15 in Act 2), learned from recipe notes found in loot and ruins, from Old Maud (herbal) and from town crafters. No trial and error. Missing ingredients are shown greyed out.
- **Examples:** poultice (yarrow and gel), strong poultice (red-cap, yarrow and silk), moon tonic (moon-cap at night plus gel), bone arrows (bone and feather), fang charm (fang and cord), leather patch (hide and silk), torch oil (gel and candle).
- **Keep it small:** no stats, no failure chance, no time cost. It is a way to turn loot into useful items.

### Study mini game (proposed)

- **Purpose:** the way the player learns new words from tomes and pages (the starting words from Day 2 to 4 stay scripted). Used at the Iron Cleave's tome and later torn pages.
- **Name and shape:** "Thread Study", two short steps per word and about 30 to 60 seconds in total.
  1. **Trace the root:** the root's rune appears as a glowing thread with nodes. The player drags through the nodes in order. A wrong node frays the thread; three frays restarts the attempt. No timer.
  2. **Bind the suffix:** the tome gives a short clue about the ending's meaning. The player picks the matching suffix from three.
- **Reward:** the word is learned either way. A clean study earns a mastery mark (three ranks per word) that gives a small bonus to spells using that word, so repeating a study is worth doing. Failing never costs anything except another try.
- **Where:** at an activated Pillar (as decided) or in an inn room, never in view of the Covenant. At Ashford, the Fort and anywhere a Covenant member stands nearby, the game refuses with a line such as "Not here. Someone might see." This supports the rule that the tome must stay secret.
- **Accessibility:** tap-in-order instead of dragging, a no-fray option, and an auto-complete option in the accessibility menu so nobody is blocked from learning words.

**Questions for Ryan**

- Is the Pillar-bonfire workbench right for crafting, or should crafting be at specific towns only?
- Should there be a carry limit, or unlimited stacks?
- Does the mastery bonus from studying sound right, or should studying be only about learning the word?
- Should studying be refused near the Covenant (hiding the tome), or is that too restrictive?

## Crafting, study and economy: decisions and rules

**Decided**

- **Crafting is at any activated Pillar** (the Pillar is the workbench). Town forges and tailors handle gear upgrades only.
- **No carry weight.** Stacks have a large cap (proposed 999).
- **Study mastery bonus stays**: a clean study earns a mastery mark that gives a small bonus to spells using that word.
- **Study is refused near the Covenant** (Ashford, the Fort, anywhere a Covenant member is nearby) to protect the tome's secret. Allowed at field Pillars, Greywick and inn rooms.
- **Economy intent:** shops that sell potions and gear charge noticeably more than loot sells for, so the player cannot gather many stacks of items and turn them into easy money. Loot from enemies and chests must make sense for its source and still sell for a reasonable amount.

**Economy rules (proposed, supersedes the earlier price-recovery line)**

- **Buy-versus-sell gap:** shops sell potions at roughly 3 times what their ingredients sell for, and sell gear at roughly 4 to 6 times what equivalent gear sells back for. Shops buy back anything they did not sell as loot at about 20 to 30 percent of its shop price.
- **Merchant purse:** every buyer has a limited pile of coins (for example 150 early in Act 2, growing with story progress). Once it runs out they stop buying that day, so one big sale of a hoard is not possible. The purse refills with story progress and slowly a little at each Pillar rest, not instantly.
- **Diminishing price:** the first 5 of an item sell at full value, each one after drops by about 10 percent, with a floor of about 40 percent. This also recovers slowly, never instantly on rest, so rest-and-farm loops stay low yield.
- **Crafting cannot create profit:** a crafted item sells for no more than the combined sell value of what went into it. Crafting is for use, not for money.
- **Loot value target:** an ordinary fight at its level drops loot worth about 3 to 8 coins; a camp or mini boss chest 40 to 150; a unique one-off find much more but only once. A poultice costs about 2 to 3 times what an ordinary fight's loot earns, so healing supplies are bought or crafted, not freely paid for with a few kills.
- **Loot must fit its source:** wolves drop pelts and fangs; slimes drop gel; skeletons drop bones, rings and old coin; orc mercenaries drop gear, food and coin; bandits drop coin, bandages and weapons; camp chests hold supplies; ruin chests hold curios and gems; noble or Covenant stores hold quality gear. No skeleton drops meat and no wolf drops a sword.
- **Regional pricing:** Greywick charges more (supplies are cut off) and buys lower; the Fort is fair; field traders mark up.
- **Coin sources:** apart from loot, coins come from quests, so quest rewards should rise in step with the prices above.

**Still open**

- Exact coin values per item and per enemy (done as part of the enemy, loot and level tables).
- The merchant purse sizes per town.

## Inn rest rule, and the Open Plains enemy, loot and level table (draft)

**Decided: resting at an inn**

- The player can rest at an **inn instead of a Pillar**. An inn lets them swap Day/Night, restore HP and MP, craft and study (away from the Covenant). **Enemies do not respawn** when resting at an inn, but the room costs a **decent price every time**. Proposed price: about 30 coins in Ashford, 40 in Greywick (supplies are short), 25 in the Fort barracks bunk. At about 6 coins per ordinary fight, that is roughly five fights per night, so the Pillar stays the free option and the inn is the option for players who want a quiet reset.

### How the numbers were set

- Act 1 reference: level 1 foes have about 14 to 16 HP, level 3 about 30 to 40 HP, the level 4 boss 150 HP, the level 6 boss 250 HP. Attack runs about 5 at level 1, 8 at level 3 and 13 at level 6. XP is roughly 6 per foe level. Fights drop about 0 to 3 coins plus loot.
- Act 2 plains baseline (level 7): about 80 HP, 14 attack, 5 defence, 9 speed, 44 XP. Each level above adds about 12 HP, 1.5 attack, 0.7 defence and 6 XP. Slimes sit below this baseline because they are filler.
- Coin target: an ordinary fight is worth about 3 to 8 coins counting coins plus the average sell value of drops. Camp chests are worth 40 to 150. All numbers will be tuned in play.
- Wolves are **not** on the plains (they stay in woods, rocks and caves).

### Plains zones and level gradient

- Green band (south of y 66): level 7. Frosted band (y 46 to 66): level 8. Patchy snow (y 24 to 46): level 9. Snow (north of y 24): level 10.
- No regular enemies within about 12 tiles of Oakhaven's east gate, Ashford, Greywick or any Pillar. Density rises with distance from towns and with the northward gradient. Groups are 1 to 3. At most three roaming bandit groups at once.
- Regular enemies respawn on a Pillar rest; bosses, mini bosses, the golem and cleared camp chests do not.

### Regular enemies

| Enemy | Where | When | Lv | HP | ATK | DEF | SPD | XP | Coins | Drops (chance, sell value) | Art |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Meadow Slime | green band, off road | Day | 7 | 60 | 11 | 2 | 7 | 32 | 1-3 | gel 50% (1), rusty token 4% (6) | have (green slime) |
| Frost Slime | frosted band | Day | 8 | 74 | 13 | 3 | 7 | 40 | 1-4 | gel 50% (1) | have (blue slime) |
| Rust Slime | around ruins, wagon, stones | Day | 9 | 94 | 16 | 5 | 8 | 54 | 2-5 | gel 50% (1), rusty token 6% (6) | have (red slime) |
| Wild Boar | green and frosted, off road | Day | 7 | 90 | 15 | 5 | 9 | 46 | 0-2 | tusk 40% (6), hide 50% (5), haunch 30% (3) | new art needed |
| Carrion Crows (flock of 3) | near wagon, battle sites | Day | 8 | 34 each | 12 | 1 | 14 | 22 each | 0 | feather 60% (1) | new art needed |
| Roadside Cutpurse | roads, away from towns | Day | 7-8 | 78 | 14 | 4 | 12 | 42 | 3-7 | bandage 20% (3), dagger 8% (8), worn boots 10% (4) | new art needed |
| Highway Thug | roads | Day | 8 | 112 | 17 | 7 | 7 | 56 | 4-9 | spiked club 10% (7), tunic 12% (9) | new art needed |
| Bandit Archer | roads and camps | Day | 8 | 70 | 16 | 3 | 10 | 50 | 3-7 | arrows 40% (2), short bow 6% (12) | new art needed |
| Purifier Scout | near wagon, along Ashford road | Night | 9 | 100 | 18 | 5 | 11 | 66 | 4-8 | firewax candle 20% (3), ash-mark token 30% (5), leaflet 10% (clue, no sale) | new art needed |
| Skeleton Warrior | standing stones, ruins | Night | 9 | 110 | 17 | 9 | 6 | 64 | 2-6 | bone 60% (2), grave coin 35% (5), tarnished ring 4% (15) | have (new pack) |
| Skeleton Spearman | standing stones, ruins | Night | 9 | 98 | 19 | 6 | 8 | 62 | 2-6 | bone 60% (2), grave coin 35% (5) | have (new pack) |
| Skeleton Archer | standing stones, ruins | Night | 9 | 80 | 18 | 3 | 10 | 60 | 2-5 | bone 60% (2), arrows 30% (2) | have (new pack) |

Notes: bandits pull back into their camps at Night. Skeletons, scouts and Purifier items only appear at Night. Boars, crows and slimes are Day only. Boars charge first. Drops follow the loot-fits-source rule. Average value per fight comes out between about 3 (slimes) and 8 (thugs, scouts).

### Mini bosses and camps

| Encounter | Where | When | Lv | HP | ATK | XP | Coins | Rewards |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Rock Golem | standing stones (92,86) | always | 10 | 360 | 20 | 200 | 15-25 | stone heart 100% (40), the golem sleeps among the stones and wakes when the player takes what they guard (the cache); weak to storm and wind, resists stone and cold |
| Ambush camp captain (name open) | ambush camp (60,44) | Day (camp guarded at Night) | 9 | 220 | 19 | 110 | 20-30 | camp chest 60 coins plus gear (boots) |
| Rook's Hollow leader (name open) | (130,90) | always | 10 | 300 | 21 | 150 | 30-45 | chest 100 coins plus uncommon gear and a recipe note |
| Purifier cell leader | hidden camp near Ashford (72,88) | Night only | 9 | 240 | 19 | 120 | 20-30 | ends the Ashford sabotage; leaflet, ash-mark tokens |

Camps: ambush camp is 3 cutpurses, 1 archer and the captain. Rook's Hollow is 2 thugs, 2 archers and the leader. The Purifier camp is 3 scouts and the cell leader.

### Chests and finds

| Place | Contents |
| --- | --- |
| Farmstead cellar (34,74) | 2 poultices, bread, about 15 coins |
| Burned wagon (108,52) | about 30 coins, ash-mark token, a torn Covenant tithe note |
| Overlook hill (114,44) | cache: tonic, about 40 coins |
| Ambush camp chest | about 60 coins, boots |
| Standing stones cache | tarnished ring (15), bone charm, one cut gem (about 60) |
| Rook's Hollow chest | about 100 coins, uncommon gear, recipe note |

### Friendly wildlife and NPCs

Deer, hares, goats and sheep on the farmstead are non-combat scenery. The hunters' camp, traders' camp and Wayfarers' fire have friendly NPCs (the fire is Night only). None of these give XP.

### Notes and open items

- New art is needed for boars, crows, bandits and Purifier scouts (concept art first, per the standing rule). Orcs are reserved for the Frozen Vale mercenaries and are not used on the plains.
- Names for the ambush captain and the Rook's Hollow leader are open.
- Next: the west forest, then the east forest, the Outskirts, the Fort, Ashford, Greywick, and the Act 2 shop and quest reward values.

## Art correction for the plains table (supersedes its Art column and art notes)

The plains table wrongly said new art was needed for boars, crows, bandits and Purifier scouts. Earlier supplied packs already cover most of it. Corrected mapping, all with the standard grim treatment and code animation where needed:

- **Wild Boar:** Hunt Animals pack (Boar has walk, run, attack, hurt and death, with side-on views plus front and back).
- **Friendly wildlife:** Hunt Animals pack (deer, hare, fox, black grouse). The grouse already appears in Act 1.
- **Cutpurse, Highway Thug, camp captain, Rook's Hollow leader:** Warrior 1 to 3 and Knight 1 to 3 sprite packs, grimmed and varied by colour, gear and scale so each type reads differently. The Iron Cleave stays a Knight.
- **Bandit Archer:** a Warrior sprite with a bow shot drawn in code, using the arrow projectile from the Skeleton pack. Needs Ryan's approval.
- **Purifier Scout and Purifier cell leader:** the wizard packs (Fire Wizard, Lightning Mage, Wanderer Magician). Fire Wizard suits the Purifiers' burn-it-all identity and the firewax drops.
- **Carrion Crows:** no crow art exists, so they are **replaced by Field Rats** (rat from Monsters Creatures Fantasy 2 or the Pixel Monster pack), in groups of 3, Day, near the wagon and battle sites, same stats and a rat tail or hide drop instead of a feather.
- **Slimes, skeletons, golem, robot construct:** as before. The rock golem still needs a check against the Rocks pack and the construct against the Robot pack.
- **Extra fillers available if needed:** Mimic (chest ambusher, fits a rare plains chest), spiders, scorpions, worms and boneworms from the Pixel Monster pack, and the Cave Bat.

**Only genuinely new art left on the plains list:** none required. Optional: a distinct look for Purifier robes and a bandit archer pose, both small.

**Process note:** before listing any enemy as needing new art, check the earlier packs in assets, assets2, assets3 and assets5 first.

## West Forest: enemy, loot and level table (draft)

Map is about 90 by 55 tiles, a light forest branching off the plains' west trail. Plains numbers and the economy rules apply. Wolves are allowed here (woods).

### Layout and level gradient

- Entry from the plains trail at the top-left of the map. A **field Pillar sits at the forest mouth**, and a **second Pillar at the edge of the ruins** so the player can rest and retry the construct without a long walk back.
- **Edge (first third): level 7.** Wide trail, sunlit, hunters' lean-to cache, herb patches.
- **Middle (second third): level 8.** Denser trees, spider hollow, moon-cap glade.
- **Ruins (final third): level 8 to 9.** Old Weaver ruins: broken halls, a ring of fallen pillars, and the construct's clearing with the locked chest. Skeletons walk the ruins only at Night.
- Side routes: a spider hollow, a moon-cap glade, a collapsed tower with a ruin cache. The main trail loops back to the plains so the forest is never a dead end.

### Regular enemies

| Enemy | Where | When | Lv | HP | ATK | DEF | SPD | XP | Coins | Drops (chance, sell value) | Art |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Thorn Hound (pairs) | edge and middle | Day | 7 | 70 | 12 | 4 | 11 | 40 | 1-3 | pelt 35% (4) | have (green wolf) |
| Red-cap | edge | Day | 7 | 60 | 11 | 4 | 8 | 38 | 1-3 | red-cap 55% (2) | have (Act 1) |
| Mandrake | middle | Day | 8 | 66 | 12 | 3 | 9 | 44 | 1-3 | mandrake root 40% (3), yarrow 15% (2) | have (Act 1) |
| Snapjaw Plant (rooted ambusher) | middle, near trail | Day | 8 | 100 | 15 | 6 | 5 | 52 | 0-2 | snapvine 35% (3), sap 20% (4) | have (Predator Plant pack) |
| Forest Spider | middle, spider hollow | Day | 8 | 72 | 14 | 4 | 11 | 46 | 1-3 | silk 60% (3) | have (Act 1 spider) |
| Gaunt Wolf (packs of 2 to 3) | whole forest | Night | 8 | 84 | 15 | 4 | 11 | 50 | 1-4 | pelt 45% (4), fang 35% (2) | have (Act 1 wolf) |
| Cave Bat (swarm of 3) | middle and ruins | Night | 7 | 36 each | 11 | 1 | 14 | 22 each | 0 | bat wing 40% (1) | have (Act 1 bat) |
| Ley-touched Wolf | ruins only | Night | 9 | 100 | 18 | 6 | 10 | 62 | 2-5 | pelt 50% (4), tonic 8% (12) | have (Act 1 ley wolf) |
| Skeleton Warrior | ruins | Night | 9 | 110 | 17 | 9 | 6 | 64 | 2-6 | bone 60% (2), grave coin 35% (5), tarnished ring 4% (15) | have (Skeleton pack) |
| Skeleton Spearman | ruins | Night | 9 | 98 | 19 | 6 | 8 | 62 | 2-6 | bone 60% (2), grave coin 35% (5) | have (Skeleton pack) |
| Skeleton Archer | ruins | Night | 9 | 80 | 18 | 3 | 10 | 60 | 2-5 | bone 60% (2), arrows 30% (2) | have (Skeleton pack) |

Notes: Day is plants, hounds, spiders, mushrooms. Night swaps to wolves, bats and the skeletons in the ruins. Snapjaw plants cannot move and ambush anyone who walks too close, so they are avoidable. Dormant Weaver husks (Infantryman and Swordsman sprites from the Robot pack) lie in the ruins as scenery that never wakes. Average fight value is about 4 to 8 coins.

### Mini boss: the worn Weaver construct

| Field | Value |
| --- | --- |
| Name | Worn Weaver Construct (name open) |
| Art | Robot pack, Destroyer (it already has Enabling, Shot, Charge and Shutdown animations) |
| Level and stats | Lv 9, 340 HP, 21 ATK, 11 DEF, 4 SPD |
| Trigger | Dormant in its clearing. Wakes when the player tries to open the locked chest it guards (the Enabling animation plays). |
| Behaviour | Worn down: it limps (slow gauge) but hits hard. Slam has a long visible charge that can be guarded. Its arm shot misfires now and then and skips a turn. A storm spell makes it stagger and shut down briefly. |
| Weak / resists | Weak to storm and wind. Resists stone and light. |
| Reward | XP 190, coins 15 to 25, iron scrap x2 to 3 (12 each), and the chest key (quest item, 100%). |
| Chest | Unique body armour (name open), about 60 coins, a brewing recipe note. |

Proposed armour names for Ryan to pick from: Weaverplate Cuirass, Hollowgear Hauberk, Brasswright's Mantle. Tier: better than the best shop body armour available before the Fort, but not so strong it breaks the Fort's gear upgrades.

### Chests, caches and gathering

| Place | Contents |
| --- | --- |
| Hunters' lean-to (edge) | 2 poultices, about 20 coins |
| Spider hollow cache | 4 silk, about 30 coins |
| Collapsed tower cache (ruins) | tarnished ring (15), bone charm, one cut gem (about 60) |
| Ruin side chests (2) | curios, about 25 coins each |
| Weaver tablet in the ruins | lore note about the construct, no loot |
| Construct's chest | unique body armour, about 60 coins, recipe note |

Gathering (feeds crafting): yarrow patches (Day, edge), red-cap clusters (Day, edge), moon-cap (Night only, glade and ruin garden), snapvine from defeated plants.

### Friendly wildlife

Foxes, deer and hares as scenery. No friendly NPC is planned here.

### Open questions

- The construct's name and the body armour's name.
- Whether to add a friendly NPC (a hermit or scholar) who hints at the construct or sells herbs.
- Whether the construct should have a short two-phase change at half health (for example its shot stops misfiring once it overheats).

## West Forest decisions, plus pickup and chest rules

**Decided (supersedes the open names above)**

- The body armour is the **Weaverplate Cuirass**.
- The mini boss is the **Worn Covenant Construct**. The Covenant built or once controlled it, which ties the ruins to the Covenant and to the Weavers who worked there.
- A **scholar** lives and works at the ruins, studying the area. They warn the player that the chest might be what triggers the construct, but they have not tried it themselves. This is the foreshadowing, and it never forces the player's hand.
- The fight is **two phases**.

**Scholar (proposed details)**

- Camp beside the second (ruin) Pillar. Present by Day; at Night they retreat to the Pillar light or leave, since skeletons walk the ruins.
- Proposed as an independent scholar, not a Covenant Scholar, so the ruin Pillar stays usable for studying the tome. If Ryan wants tension, a Covenant Scholar would make the ruin Pillar unsafe for studying while they are present.
- Name open. Sells a few herbs and the brewing recipe note's basics, and gives the lore on the tablet and the Covenant markings on the construct.

**Worn Covenant Construct: two phases (proposed)**

- **Phase 1, from full health to 50%:** it limps (slow gauge, SPD 4). Slam has a long visible charge that can be guarded. The arm shot misfires now and then and skips a turn. Storm staggers and briefly shuts it down.
- **Transition at 50%:** it overheats. Steam vents, a short Enabling flicker, and a line of text so the player knows the fight has changed. The player gets a clear moment to heal or reposition.
- **Phase 2, below 50%, Overdrive:** gauge speeds up (SPD about 8), the arm shot no longer misfires, Slam charges faster, ATK up by about 15%, and it gains **Venting Sweep**, which hits the whole party with scalding steam. Its plating is vented, so DEF drops by about 3, which keeps the fight from dragging. A storm spell in this phase causes a longer shutdown, which rewards the weakness.
- Stats from the table above stay (Lv 9, 340 HP). Heavier hits make Phase 2 the dangerous part, so the fight is built around surviving it with Hakon's taunt and Tessa's buffs.

**World pickups (rule)**

- Herbs, mushrooms and other gathered items **disappear when picked** and **respawn randomly**, so they cannot be farmed.
- Proposed way: each picked node has a chance (about 20 to 30 percent) to regrow each time the player rests at a Pillar or re-enters the area, never twice in a row, and a regrown plant may appear at a different spot in the same patch. Day herbs only regrow in the Day state and night herbs in the Night state. Amounts per pickup stay small so even lucky regrowth is not worth farming.
- Applies to herbs, mushrooms, snapvine and any item lying on the ground. It does not apply to chests.

**Chests (rule)**

- Every chest has an **opening animation** and **stays open once looted**, so the player can see at a glance that it is looted. Looted state is saved. Chests never refill.
- The same applies to camp chests and caches. The mimic variant (rare, optional) is a chest that turns out to be a Mimic and, once beaten, is shown open and empty too.

## East Forest: enemy, loot and level table (draft)

Map is about 90 by 55 tiles, a light forest off the plains' east trail from the crossroads. It is the harder forest: the party arrives a few levels higher, with decent gear and a second companion (Hakon), and the fight at the end is meant to be harder than the west forest's. Same economy rules as the plains.

### Level formula used

Regular enemy at level L: HP 80 + 12(L-7), ATK 14 + 1.5(L-7), DEF 5 + 0.7(L-7), XP 44 + 6(L-7). Mini bosses are about 3.5 to 4 times a regular enemy's HP. Coins and loot scale up so an ordinary fight here is worth about 6 to 14 coins (the plains were 3 to 8).

### Layout and level gradient

- Field Pillar at the forest mouth. Forest edge: **level 10**. The bandit camp: **levels 10 to 12**, rising stage by stage. The bluff: **level 12**.
- The trail leads the player straight into the camp, with the forest and wildlife on either side. Side paths hold small caches and herb patches.
- The final stretch climbs to a **coastal bluff** where the Dread Expanse is in view, and the Iron Cleave waits.

### Forest wildlife (not part of the camp)

| Enemy | When | Lv | HP | ATK | DEF | SPD | XP | Coins | Drops | Art |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Wild Boar | Day | 10 | 124 | 20 | 7 | 9 | 62 | 0-2 | tusk 40% (6), hide 50% (5), haunch 30% (3) | have |
| Forest Spider | Day | 10 | 108 | 18 | 6 | 11 | 58 | 1-3 | silk 60% (3) | have |
| Gaunt Wolf (packs of 3) | Night | 10 | 112 | 19 | 6 | 11 | 60 | 1-4 | pelt 45% (4), fang 35% (2) | have |
| Cave Bat (swarm of 3) | Night | 10 | 52 each | 15 | 2 | 14 | 30 each | 0 | bat wing 40% (1) | have |

### Bandit camp enemies

| Enemy | Lv | HP | ATK | DEF | SPD | XP | Coins | Drops (chance, sell value) | Art |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Camp Cutpurse | 10 | 112 | 19 | 7 | 12 | 60 | 4-8 | bandage 20% (3), dagger 8% (8), worn boots 10% (4) | Warrior pack |
| Bandit Thug | 11 | 140 | 22 | 9 | 7 | 72 | 5-10 | spiked club 10% (7), tunic 12% (9) | Warrior pack |
| Bandit Archer | 10 | 94 | 21 | 5 | 10 | 62 | 4-8 | arrows 40% (2), short bow 6% (12) | Warrior pack plus code bow shot |
| Bandit Knight (lieutenant) | 11 | 170 | 23 | 12 | 7 | 90 | 8-14 | horned helmet 15% (14), shield 10% (12), short sword 10% (15) | Knight pack |
| Orc Warrior (Frozen Vale merc) | 11 | 150 | 23 | 9 | 8 | 76 | 6-12 | axe 12% (14), horned helmet 10% (14), haunch 30% (3) | Orc pack |
| Orc Berserk (Frozen Vale merc) | 11 | 130 | 27 | 5 | 10 | 80 | 6-12 | cleaver 10% (12), haunch 30% (3); enrages below 50% HP (+ATK) | Orc pack |
| Orc Shaman (Frozen Vale merc) | 11 | 100 | 20 | 5 | 9 | 78 | 6-12 | tonic 12% (12), potion 15% (6); heals and buffs allies, small hex | Orc pack |

The orcs are hired mercenaries from the House in the Frozen Vale. They wear House colours so the player can tell. Kill the Shaman first or it keeps healing the others.

### The five-stage gauntlet

1. **Outer Watch (level 10):** two cutpurses and an archer on patrol, plus a sentry bell. Ringing the bell by Day brings a thug unless the sentry falls first.
2. **The Palisade Gate (10 to 11):** two thugs and an archer on the wall. At Night the gate is quieter and there is a ditch route round it.
3. **Lumber Yard and Tents (11):** two thugs, an archer and an Orc Warrior. Supply chests here. A **tarped Pillar** stands in the yard, covered because the bandits never used it. The player lights it after clearing the stage, giving the **rest fire**.
4. **Captive Pens (11):** an Orc Berserk, an Orc Shaman and cutpurses. Empty pens with scratched tally marks. This is the first Arthur moment for Hakon, who reacts to the marks and a torn ledger scrap.
5. **War Camp and Bluff Path (11 to 12):** two Bandit Knights, an Orc Warrior and an Orc Shaman. The path then climbs to the bluff. A small **second Pillar sits at the foot of the bluff path** so the player can rest before the boss.

**Day versus Night in the camp:** by Day the camp is fully manned and patrols are tighter. At Night about half the tent crews are asleep (fewer enemies) but the forest outside is more dangerous (wolves, bats) and it is dark. This gives a real choice: the camp is easier at Night, the road to it is not.

### Boss: the Iron Cleave (two phases)

| Field | Value |
| --- | --- |
| Art | Knight pack, grimmed, with an oversized cleaver look (concept to approve first) |
| Level and stats | Lv 12, 600 HP total, 24 ATK, 12 DEF, 8 SPD |
| Weak / resists | Weak to storm. Resists stone and cold. |
| Start of fight | Two mercenaries stand beside him: an Orc Shaman (heals him) and an Orc Warrior |
| Phase 1, from full to 50% | **The Knight.** Guards behind shield and Protect stance (takes much less damage until broken). Shield Bash can stun, guardable. Cleave hits two targets. Hakon's taunt pulls his attacks. A storm or truth spell breaks Protect. |
| Transition at 50% | He casts aside shield and helm and draws the true cleaver, with a line of dialogue about the Vale and the hired band. |
| Phase 2, below 50% | **The Cleaver.** No guard, ATK up about 20 percent, Cleave now hits the whole party, Rend causes bleed, and he calls a last warband cry that buffs surviving mercs. |
| Reward | XP 300, coins 40 to 60, the tome (below), a bill of sale giving the clue to Arthur, and a House signet ring (lore item, about 40 coins if sold). |

### The tome (healing and guidance: truth and thought spells)

- Proposed words: roots **Ver** (truth), **Cogn** (thought) and **Sens** (the senses), plus the suffix **-ix** (a ward). **San** (mending) is already known, so San plus -ix gives a healing ward, which covers the healing half.
- Mem stays reserved for fast travel.
- Example workings: Ver-at (a truth probe that shows enemy weaknesses and intent), Cogn-or (a thought bolt), Sens-am (reveals hidden things in an area), San-ix (mending ward on one ally).
- Name and look open: it needs a clearly different look from Corin's own tome. Suggested names: The Lantern Folio, The Tellers' Primer.
- Studied through Thread Study. It cannot be studied near the Covenant.

### Chests and finds

| Place | Contents |
| --- | --- |
| Forest-edge cache | tonic, about 25 coins |
| Lumber yard supply chests (2) | poultices, bread, about 40 coins together |
| Quartermaster's tent | about 60 coins, uncommon gear |
| Captive pens (ledger scrap) | the first clue scrap (lore, no sale) |
| War camp chest | about 100 coins, rare gear, recipe note |
| Bluff overlook | a view of the Dread Expanse and a small cache of about 30 coins |

Gathering: yarrow and red-cap (Day), moon-cap (Night), snapvine. Picked herbs vanish and respawn randomly. Chests open with an animation and stay open.

### Open questions

- The tome's name and look.
- Whether the Iron Cleave's namesake cleaver is a droppable unique weapon, and if so whether it goes to Hakon.
- Whether the tarped Pillar in stage 3 is the right place for the mid-camp rest fire, with the second small Pillar at the bluff foot.

## East Forest decisions, then the Outskirts and Fort Frostcrown tables (draft)

**Decided**

- The Iron Cleave's tome is **The Tellers' Primer**.
- **Sens** (the senses) can be used to **display enemy health**. This becomes the root's core battle use: Sens works show enemy HP bars and, with Ver-at, weaknesses and intent. (HP bars are otherwise hidden or limited in this design; to confirm how limited when building.)
- The Iron Cleave's cleaver is a **unique weapon that goes to Hakon**.
- The tarped Pillar in stage 3 of the bandit camp is the mid-camp rest fire, with a small second Pillar at the foot of the bluff path.

### Frostcrown Outskirts (100 by 60): enemy, loot and level table

A ring of snow country around the Fort. Three entrances (south gate with a toll, north gate with a search, and the secret entrance on the west flank, with **no one around it**). Covenant guards stand outside the gates. Enemies stay away from the gates. A **barricade** blocks the road to the Frozen Vale. A field Pillar stands near the south road. Wolves appear only on rock outcrops here (rule).

**Levels:** south side level 12, north side level 13. Formula: level 12 is HP 140, ATK 21.5, DEF 8.5, XP 74; level 13 is HP 152, ATK 23, DEF 9.2, XP 80. A regular fight is worth about 8 to 16 coins.

| Enemy | Where | When | Lv | HP | ATK | DEF | SPD | XP | Coins | Drops (chance, sell value) | Art |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Snow Boar | open snow, south | Day | 12 | 140 | 22 | 9 | 9 | 74 | 0-2 | tusk 40% (6), hide 50% (5), haunch 30% (3) | Boar, snow tint |
| Frost Slime | open snow | Day | 12 | 110 | 18 | 5 | 7 | 55 | 2-5 | gel 50% (1) | blue slime |
| Frost Spider | rocks and treeline | Day | 12 | 128 | 21 | 8 | 11 | 70 | 2-5 | silk 60% (3), frost silk 20% (6) | Pixel Monster pack (white spider) |
| Frost Wolf (packs of 2 to 3, rocks only) | rock outcrops | Night | 13 | 144 | 24 | 8 | 11 | 80 | 2-5 | pelt 50% (5), fang 35% (2) | Act 1 wolf, white tint |
| Cave Bat (swarm of 3) | rocks | Night | 12 | 62 each | 17 | 2 | 14 | 36 each | 0 | bat wing 40% (1) | Act 1 bat |
| Ember Wisp | open snow, north | Night | 13 | 120 | 25 | 4 | 12 | 84 | 0-3 | ember dust 40% (4) | Fantasy Enemies pack (Fire Spirit) |
| Frozen Vale Scout (Orc Warrior or Berserk) | near the barricade only | Day | 13 | 156 | 26 | 10 | 8 | 86 | 8-14 | axe 12% (14), horned helmet 10% (14), haunch 30% (3) | Orc pack |
| Frozen Vale Shaman | with the scouts | Day | 13 | 108 | 22 | 5 | 9 | 84 | 8-14 | tonic 12% (12), potion 15% (6) | Orc pack |

The Ember Wisp is weak to cold and burns anyone who stays adjacent, a small nod to Ulric's fire specialty. The Frozen Vale scouts hold the area by the barricade. They are the House's mercenaries probing the Covenant's closed road, and defeating them hints at the Vale as a future area.

**Friendly and neutral:** Covenant road patrols (walk the south road, give directions, never fight), a toll keeper at the south gate, two gate guards each at the north and south gates, deer and hares. Nobody stands near the secret entrance.

**Gates and time:** south gate (toll, waived with Voidsong's letter or Ulric's seal) and north gate (search, which is the tome-hiding choice) are open by Day only. At Night they are shut and the guards keep their posts with torches, so a Night arrival makes the secret entrance the only way in unless the player swaps to Day at the field Pillar.

**Chests and finds:** abandoned Covenant supply cart (bandages, about 30 coins); roadside shrine cache (tonic, about 25 coins); frozen pond cache (cut gem, about 60); rock outcrop cache (tarnished ring and bone charm); barricade crate with House markings (about 80 coins and a clue about the Vale). No boss in the Outskirts.

### Fort Frostcrown (about 170 by 100): districts, services and sparring

One safe walled map. No combat anywhere except sparring. Pillar activates on first touch. Studying is refused anywhere in the Fort.

| District | What is there | Who and what it does |
| --- | --- | --- |
| Pillar Square and Chapel | the Pillar, chapel, notice board | Chaplain heals the party for free once per visit; rumours; Day and Night swap at the Pillar |
| Market | stalls and shops | General trader (potions, food, bandages), apothecary, armourer and forge (best non-unique gear before Act 3 and gear upgrades), tailor, furrier; open by Day only |
| Command Post | Ulric's offices, cells below | Ulric gives Quest 1 and Quest 2; cells hold a captured Purifier who gives hints about the sabotage and Kellan Vex (optional) |
| Barracks and Training Yard | bunks, parade ground, sparring ring | Sparring master runs duels; barracks bunk rest costs 25 coins and does not respawn enemies (inn rule) |
| Kitchens, Mess, Stores and Undercroft | cook, mess hall, storehouse | The storehouse holds many Pillar Keystones; patrolling storekeepers; the player can take one unnoticed |
| Weaver Hall | scholars' reading room | Covenant Scholars sell lore and a few recipe notes; **the player cannot study the tome here** |
| Lower Quarter | poor housing, hostel, fence | Grim district; hostel rest (25 coins); a fence who buys anything at about half value; refugees and workers with small side quests |
| Rampart Stairs | walls and watchtowers | Sentries, a view north to the Frozen Vale and the coast, a lookout side quest |

**Day versus Night in the Fort:** by Day the market is open, patrols are on the ramparts and the storehouse has several keepers. At Night the market and Weaver Hall are shut, the barracks are quiet and the storehouse is lightly watched, which is the easy time to take the Keystone. Ulric receives visitors by Day and works late at his desk at Night.

**Sparring (proposed rules):**

- Duels use the normal battle system, non-lethal. No defeat penalty and HP is restored afterwards.
- First victory against each opponent gives a coin prize and XP. Rematches are practice only, with no coins or XP, so it cannot be farmed.
- Opponents (levels 12 to 14, roster to confirm): Recruit (Lv 12, easy, teaches duel rules), Guard Corporal (Lv 12, Warrior art), Fire Initiate (Lv 13, Fire Wizard art, casts fire), Veteran Sergeant (Lv 13, Knight art, guards and counters), Weaver Curate (Lv 14, Lightning Mage art, spells and wards). Prizes about 30 to 80 coins each.
- Companions may fight in the spar, and the sparring master comments on the party's growth.

**Merchant purses (proposed):** hunters' camp 120, traders' camp 200, Ashford trader 200, Greywick 100, Voidsong 80 (undead remains only), Fort quartermaster 400, Fort fence 150 (pays about half). Purses refill with story progress and a little (about 10 percent) at each Pillar rest.

**Shop price ladder (proposed starting point, to be tuned):** bandage 8, poultice 12, strong poultice 28, tonic 30; mid weapons 120 to 260, mid body armour 140 to 300; gear upgrades about 80 to 200 plus materials.

### Open questions

- Does the Outskirts get an optional lair mini boss (for example a frost wolf alpha)?
- The sparring master's name and the final sparring roster.
- Whether the captured Purifier in the cells is wanted.

## Outskirts lair boss, sparring master, captured Purifier

**Decided**

- The Outskirts **gets an optional lair mini boss**.
- The five-opponent sparring roster stands (Recruit, Guard Corporal, Fire Initiate, Veteran Sergeant, Weaver Curate).
- The **captured Purifier in the cells stays**.
- The sparring master needs a name (Ryan asked for help).

**Sparring master name options (pick one)**

- Sergeant Maren Coldwell (a woman, dry and exacting; balances the Fort's cast).
- Sergeant Osric Ward (a grey veteran, quiet, notices everything).
- Master-at-Arms Brannoch Hale (loud and encouraging).
- Captain Ysolt Rennick (young and fast, proves herself each bout). Recommended: Sergeant Maren Coldwell.

**Optional lair boss: Rimefang, the Frost Wolf Alpha (proposed)**

| Field | Value |
| --- | --- |
| Where | A den in the rocky tor and small cave in the north-west of the Outskirts, well away from the gates and from the secret-entrance cleft on the west flank |
| When | Night only (wolves hunt at Night; he is not in the den by Day) |
| Art | Act 1 wolf art, scaled up and frost-tinted (Act 1's alpha is the reference) |
| Level and stats | Lv 14, 560 HP, 27 ATK, 10 DEF, 11 SPD |
| Weak / resists | Weak to fire. Resists cold. |
| Fight | Single phase. At 50% he howls and calls 2 Frost Wolves; Hakon's taunt keeps him off Tessa. A fire spell or Ember dust thrown at him stuns briefly. |
| Reward | XP 260, coins 30 to 45, Rimefang Pelt (sells for about 70 or crafts into a cold-resist cloak), alpha's fang (crafting item), a small den cache |

**Captured Purifier in the cells (proposed)**

- A scout caught by Covenant patrols. Talks only if the player visits Ulric's cells; Ulric allows it after the Ashford sabotage is settled.
- Their story can be tested with a truth working (Ver-at, from The Tellers' Primer): some statements are true and some are lies, so the player learns to use the tome to read people. Without the tome they must judge for themselves.
- True information: Purifiers target Pillars because they believe the network spreads magic. They have a hidden camp near Ashford (already dealt with if the player did that quest). Hints that more cells exist further south. Does not reveal Kellan Vex.
- Never a combat encounter. The player cannot free them.

## Sparring master decided; Ashford and Greywick service and quest tables (draft)

**Decided:** the sparring master is **Captain Ysolt Rennick**.

Both towns are safe maps with no regular enemies. The only fight tied to Ashford is the hidden Purifier camp near (72,88), already in the plains table. Economy and day/night rules apply. The Ashford and Greywick layouts and the Covenant and Unbound details stay as written in the earlier town sections.

### Ashford (56 by 68): Covenant-leaning, lively

| Place | Services and notes |
| --- | --- |
| Pillar Square | Pillar (flickers, visible at Night only; still usable for rest and Day/Night swap), notice board |
| Covenant outpost (north) | Curate Voidsong. Gives the flicker quest and, after it, the letter. Buys undead remains and dark materials at a premium (purse 80). The player cannot study the tome here. |
| Purple Thistle tavern (east) | Tavern keeper (directs the player to Hakon), Hakon drinks alone here in the evening (**Night state**), room 30 coins (no respawn), meals and drink |
| Chapel (west) | Free heal once per visit, small donation box; candles lit at Night |
| Market row (south) | General trader (buys fangs, silk, herbs at the best price; sells bandages, poultices, tonic; purse 200), smith and tailor (tier 1 Act 2 gear, below the Fort's), herbalist (recipe notes, herbs) |
| Cooper, Tarn and Son | Barrels and casks; side quest giver |
| Homes (south) | Townsfolk, side quest givers, many Covenant flags everywhere, Covenant members walk the streets |

**Day versus Night:** by Day the market and outpost are open and the streets are busy. At Night the tavern is lively, Hakon is at his table, the Pillar flickers visibly (needed for the sabotage quest), market stalls close. If the player arrives by Day, the tavern keeper says Hakon drinks here after dark, which nudges the player to swap at the Pillar.

**Quests (proposed):**

| Quest | Giver | Time | Level | What | Reward |
| --- | --- | --- | --- | --- | --- |
| The Flicker | Voidsong | Night | 8 | Investigate the Pillar, trace the sabotage to the hidden Purifier camp (72,88), defeat the cell, repair the Pillar | 120 coins, Voidsong's letter for Ulric, tier 1 gear piece |
| Hakon's Work | Tavern keeper or Hakon | Night | 8 | Recruit Hakon and promise to help him; starts his companion quest | Hakon joins |
| Lost Casks | Tarn and Son | Day | 8 | Recover casks from the burned wagon on the plains | 70 coins and a keg of ale (sellable) |
| Moon-cap for a Sick Child | Chapel | Night | 8 | Gather moon-cap (night only) from the forest glade | 60 coins, a charm |
| Cellar Rats | Farmstead (34,74) or a townsperson | Day | 7 | Clear field rats from a cellar | 40 coins, 2 poultices |
| Message for the Hunters | Covenant Initiate | Day | 8 | Carry a note to the hunters' camp (28,56) and bring back a reply | 50 coins |

### Greywick (56 by 68): Unbound-leaning, run down, standoffish

| Place | Services and notes |
| --- | --- |
| Pillar Square | Flickering Pillar (failing for lack of a Keystone; usable for rest and swap) |
| Lamp House (NW) | Unbound outpost under Lampwright Gideon Marsh. Gives the Keystone quest. Does not sell, but trades and buys salvage. |
| Boarded Covenant chapel (W) | Closed; a locked cache inside holds old Covenant ledgers (side quest) |
| Cheap inn (E) | Room 40 coins (no respawn), thin meals |
| Stall and forge (S) | Small trader (purse 100, buys low and charges about 15 percent more), forge that does basic repairs and uses iron scrap |
| Hunters' huts (SE) | Hunters who buy hides and boar parts at fair prices, standoffish |
| Graveyard and watchtower (NE) | Night visits; lookout post |

**Day versus Night:** by Day people stay indoors and keep to themselves. At Night the Lamp House is active, people talk more quietly on the street, and the graveyard and watchtower quests run.

**Quests (proposed):**

| Quest | Giver | Time | Level | What | Reward |
| --- | --- | --- | --- | --- | --- |
| A Keystone for Greywick | Gideon Marsh | Any (theft easier at Night in the Fort) | 12 | Steal a Pillar Keystone from the Fort storehouse, return and install it | 150 coins, Unbound standing, Greywick starts to open up |
| The Iron Request | Forge | Day | 9 | Bring 3 iron scrap (from the construct) | 80 coins, a free repair or upgrade |
| Boarded Chapel Ledgers | Townsperson | Day | 9 | Find a way into the boarded chapel and bring back the ledgers | 70 coins and lore on the Covenant's past dealings |
| Watch the Road | Watchtower lookout | Night | 10 | Report Covenant patrols on the Fort road | 60 coins |
| Hide Supply | Hunters | Day | 9 | Bring boar hides | about 50 coins plus bonus pay |

**Greywick trust:** the town is standoffish. Doing the first two small favours opens extra dialogue and lowers prices a little, so friendliness is earned rather than given.

### Open questions

- Are these side quests the right size and shape, or should Ashford get more (it is the larger, livelier town)?
- The tavern keeper's name (not yet set).
- Whether Greywick's price drop for trust should be shown, or stay hidden.

## Ashford: more side quests, tavern keeper name options, hidden trust

**Decided**

- **Ashford gets more side quests** (it is the larger, livelier town). Three added below, for nine total.
- **Greywick's trust price drop stays hidden.** The player is never shown a reputation number. Prices simply ease a little after the first two favours, and extra dialogue appears.
- The Purple Thistle's keeper needs a name; options below.

**Added Ashford quests (proposed)**

| Quest | Giver | Time | Level | What | Reward |
| --- | --- | --- | --- | --- | --- |
| Wayfarer Whispers | A regular at the Purple Thistle | Night | 9 | Overhear talk of a fire on the plains that only burns at night; follow the rumour to the Wayfarers' fire (84 to 140 on the plains map). This **starts the secret-entrance quest** for the Fort. | 40 coins and the lead |
| The Minstrel's Debt | The Thistle's minstrel | Day | 8 | Collect a debt from a trader at the traders' camp (84,58) | 60 coins and a song that names the road ahead |
| The Lost Hound | Farmstead family | Day | 8 | Find a farm dog that bolted from a boar on the plains | 45 coins, a hare-skin charm |

**Tavern keeper name options (pick one)**

- Marta Hollis: warm and sharp, runs a tight room. Recommended.
- Dunstan Pike: slow-spoken, sees everything.
- Winnie Fenn: loud and kind, treats everyone like family.
- Corwin Thatch: quiet and watchful, a former traveller. He or she directs the player to Hakon if asked for work or directions.

## Act 2 shops, gear tiers and quest rewards (draft)

**Decided:** Ashford's tavern keeper is **Winnie Fenn** (loud and kind, treats everyone like family).

### Gear slots and tiers (from the Act 1 code: weapon, body, head, charm)

Act 1 reference: Old sword ATK 3, Thornwake ATK 7, Quilted jerkin DEF 2, Iron-rimmed cap DEF 1, Covenant medal MAG 2. Numbers below are a starting point, to be tuned against the player's base stats.

| Tier | Where sold | Weapon ATK (price) | Body DEF (price) | Head DEF (price) | Charm MAG (price) |
| --- | --- | --- | --- | --- | --- |
| Tier 1 | Ashford smith and tailor, Greywick forge (limited), field traders at a markup | 10 to 13 (120 to 170) | 5 to 7 (140 to 190) | 2 to 3 (70 to 100) | 3 to 4 (90 to 140) |
| Tier 2 | Fort armourer and quartermaster | 16 to 20 (230 to 320) | 9 to 12 (240 to 320) | 4 to 6 (130 to 180) | 6 to 8 (170 to 240) |
| Unique (not sold) | construct's chest, Iron Cleave, Rimefang and camp chests | Hakon's cleaver about 18 | **Weaverplate Cuirass about 9 plus a guard bonus** | Rimefang cloak (cold resist) | camp chest finds |

- Weaverplate Cuirass is **better than any Tier 1 body armour** but **below the best Tier 2**, so the Fort's gear upgrades still matter.
- **Gear upgrades** (Fort armourer, Greywick forge or Ashford smith): three steps per piece (+1, +2, +3), each raising its main stat by about 10 percent. Cost per step about 80 to 200 coins plus materials (iron scrap, hide, silk, bone). Companions' gear is only changed by buying, finding and upgrading; they have no other customisation.

### Consumables and prices

Shops sell at about 3 times the ingredient sell value (see economy rules). Base prices, then regional multipliers (Ashford x1, Fort x1, Greywick x1.15, traders' camp x1.1, hunters' camp x1.1).

| Item | Price | Effect |
| --- | --- | --- |
| Bandage | 8 | small heal and stops bleed |
| Poultice | 12 | heals about 40 in a fight |
| Strong poultice | 28 | heals about 90 |
| Greater poultice (Fort only) | 55 | heals about 160 |
| Tonic | 30 | restores MP |
| Greater tonic (Fort only) | 60 | restores more MP |
| Antidote | 14 | cures poison |
| Torch oil | 10 | light and a small fire charge |
| Food (bread, ration) | 4 to 8 | small heal outside combat |
| The Tier 1 and Tier 2 items above are the only Act 2 consumables for sale; everything else is crafted or found. |  |  |

### Stock by merchant

| Merchant | Sells | Buys best (bonus) | Purse |
| --- | --- | --- | --- |
| Ashford general trader | bandage, poultice, strong poultice, tonic, antidote, food, rope, ink | fangs, silk, herbs, hides | 200 |
| Ashford smith and tailor | Tier 1 weapons, body, head and charm (about 8 items) | weapons and armour at 25 percent of price | 150 |
| Ashford herbalist | yarrow, red-cap, moon-cap (Night only stock), recipe notes (strong poultice 60, moon tonic 80) | herbs | 100 |
| Voidsong | nothing | undead remains, dark materials, bones, rings | 80 |
| Greywick trader | same basics at x1.15, a few Tier 1 items | salvage, ruined gear | 100 |
| Greywick forge | repairs and upgrades, iron scrap only | iron scrap, metal gear | 100 |
| Hunters' camp | arrows, bandages, snares | hides, tusks, antlers, fangs | 120 |
| Traders' camp | basics plus one random rare item per chapter at x1.1 | anything at a slightly lower price | 200 |
| Fort quartermaster | all consumables including greater versions, Tier 2 gear | weapons and armour | 400 |
| Fort apothecary | tonic, greater tonic, antidote, recipe notes | herbs, ingredients | 150 |
| Fort fence | nothing | anything at about half value | 150 |
| Purses refill with each story chapter and slowly (about 10 percent) at Pillar rests. |  |  |  |

### Quest reward ladder

Rule: a quest's coin reward is about 8 to 12 ordinary fights' worth of coins at its level, plus an item or small perk.

| Quest size | Coins | Examples |
| --- | --- | --- |
| Small | 40 to 60 | Cellar Rats, Message for the Hunters, Watch the Road |
| Medium | 60 to 90 | Lost Casks, Moon-cap for a Sick Child, Minstrel's Debt, Iron Request, Boarded Chapel Ledgers |
| Large | 100 to 150 | The Flicker (120), Wayfarers' fire / secret entrance (100), Greywick Keystone (150) |
| Story | 180 to 240 | Ulric's Quest 1 and Quest 2, Maud's letter and supplies |

### Income check (rough, for balance)

- Expected coins across all of Act 2: about 1,100 from fights (about 120 fights at 6 to 14), about 1,000 from side quests, about 700 from main quests, about 700 from chests and camps, about 3,500 in total.
- Planned spending: gear for three characters (weapon, body, head, charm) at Tier 1 and Tier 2, about 1,800; consumables about 600; inn and hostel rooms about 250; upgrades about 600.
- This leaves a tight but workable surplus, so the player cannot afford everything. Tune after play.

### Open items

- Whether the player's own weapon is a sword or a staff (the shop lists treat weapons as one slot).
- The exact guard bonus on the Weaverplate Cuirass.
- A concrete item list per merchant (names and descriptions) comes with the build.

## Cuirass guard bonus decided; open design problem: making magic the focus

**Decided:** the Weaverplate Cuirass's guard bonus is **reduced damage when guarding**.

**Design goal (Ryan):** the player should focus more on using magic than fighting with a sword. How to get there is **not yet decided**.

**What the Act 1 battle code already does**

- Basic Attack deals physical damage and gives **+1 breath** (MP). Breath also regenerates at 0.16 per second for everyone.
- Spells cost breath by suffix (for example -is costs 1, -os costs 3). A spell can **infuse the weapon**: the next melee hits deal 1.35 times damage with that element.
- Gear stats: weapon ATK, body and head DEF, charm MAG. Enemy weaknesses and resistances exist and the player sees them only when they discover them.

**Options (not decided)**

1. **Pure caster:** the weapon slot becomes a *focus* (staff, wand, channel blade) that gives MAG and spell power with little or no ATK. Basic Attack is a weak breath-regaining fallback.
2. **Spellblade hybrid:** keep swords, but make them channels. Spells infuse the blade and infused strikes become the strongest attack. Magic and weapon work together, so a sword is a delivery tool.
3. **Caster with a weak fallback (recommended):** the player's physical attack stays low and mainly regains breath. Weapons keep a small ATK but add MAG and a spell bonus (foci and channel blades, so Act 1's swords still fit). The party covers melee: Hakon is the tank and heavy hitter, Tessa buffs and debuffs, the player is the damage dealer through magic.

**Supporting levers (apply to any option)**

- **Enemy defence:** give armoured enemies (knights, orcs, skeletons, the construct) high DEF that blunts physical hits, while the -at suffix (surgical, pierces armour) and elemental weaknesses cut through. This makes elements the efficient answer.
- **Weakness reading:** Sens displays enemy health and Ver-at shows weaknesses and intent, so The Tellers' Primer becomes a damage tool, not just utility.
- **Breath economy:** cheap -is workings and a gentler regen let the player cast most turns; bigger -os workings stay costly and are spent deliberately. Inn rest and Pillars restore breath.
- **Mastery bonuses** from Thread Study and charms with MAG reward a caster build.
- **Shop numbers change:** if weapons become foci, the weapon column in the Tier 1 and Tier 2 gear table switches from ATK to MAG and spell bonus (small ATK kept).

**Questions to settle**

- Which option (1, 2 or 3), or a mix?
- Should Basic Attack stay available at all, or become a short "steady breath" action?

## Magic focus decided: option 3, caster with a weak fallback

**Decided**

- **Option 3.** The player's physical attack stays low and mainly regains breath. **Basic Attack stays available** as a normal action.
- Weapons keep a small ATK but add **MAG and a spell bonus**, so Act 1's swords still fit as channel blades or foci.
- The party covers melee: **Hakon** is the tank and heavy hitter, **Tessa** buffs and debuffs, and **the player** deals damage through magic.
- Supporting levers are adopted: high DEF on armoured enemies, with the -at suffix and elemental weaknesses cutting through; Sens shows enemy health and Ver-at shows weaknesses and intent; cheap -is workings for most turns and costly -os workings for deliberate spending; mastery bonuses and MAG charms.

**Changes this makes to earlier tables (to apply when building)**

- **Gear table:** the weapon column becomes ATK (small) plus MAG and a spell bonus. Suggested Tier 1 weapon: ATK 4 to 5, MAG +3 to 4. Tier 2: ATK 6 to 8, MAG +6 to 8. Charms keep MAG as their main stat, so weapons and charms together drive spell power.
- **Enemy DEF:** armoured enemies (Bandit Knight, Orc Warrior, Iron Cleave, skeletons, Worn Covenant Construct, Veteran Sergeant) should have DEF high enough that Basic Attack does little. Keep their listed DEF values, and make sure Basic Attack damage from the player is low enough that these enemies are better answered with elements or -at.
- **Hakon's cleaver** stays a physical unique weapon (Hakon is the physical fighter). Companion weapons keep ATK as their main stat.
- **Basic Attack:** stays as an option for breath recovery (+1 breath) and a fallback when out of breath. Its damage is deliberately low for the player and normal for Hakon and Tessa.
- **Balance check at build time:** the player should be able to win most ordinary fights by spending breath on -is workings and recovering with Basic Attack, while bosses reward weakness reading and bigger workings.

## Act 2 answers: Ulric, Hakon, weapons and bows (latest)

- Ulric's backstory: he was raised by Old Maud, who was a great Arbitrator before retiring to her North Woods cottage. He followed her path, wishes to sit on the High Council one day, and is fiercely loyal to the Covenant.
- Ulric's hint wording: he tells the player of the tome stolen from a southern vault, to keep a lookout for Purifiers, and that anything connected to the tome should be turned in to the nearest Covenant outpost as soon as possible. If pressed, he admits the tome is incomplete.
- Maud's past: her Act 1 foreshadow line should also hint at her past service, not only her son. Hermit witch remains how Act 1 presents her.
- Voidsong's name does not hint at Nihil (decided; supersedes the earlier open note).
- Hakon cannot cast magic. Sanguis is dropped for him; it stays a Frozen Vale and forbidden-root idea only. Wherever earlier sections say he casts with Sanguis, this replaces it.
- Mem-it adding Mem to the player's spell words: undecided.
- Fort inn: the lower-quarter hostel, plus the barracks bunk, as chosen earlier.
- Weapons: Tessa's sword, the bandit archers' bows and the Tier 1 and Tier 2 weapon icons come from the supplied 32x32 weapons pack (70 sword icons) and bow and crossbow pack (about 40 bows, crossbows and effect variants). They are inventory icons, so in-hand sprites still need the code overlay or existing sprite art. A mapping will be shown for approval before building.
- The scholar at the West Forest ruins is named Edric Thale (decided).

## Weapon and bow icon mapping (approved)

- Source: the supplied 32x32 weapons pack and bow and crossbow pack. Mapping image: weapon\_mapping.png.
- Tessa's sword: weapons pack icon 01 (plain steel).
- Tier 1 swords (iron, ATK 4 to 5, MAG +3 to 4): icons 02, 03 and 07.
- Tier 2 swords (focus weapons, ATK 6 to 8, MAG +6 to 8): icon\_32\_2\_06, and icons 09 and 18 (teal-edged).
- Hakon's cleaver (Iron Cleave drop): icon 23.
- Bandit archers: bow icons 21 (no effect) and 24, and crossbow icon 27 (no effect).
- Tier 1 bows for loot and sale: icons 8 and 15 (no effect). Tier 2 bows: icons 16 and 19 (no effect).
- Rule: use the no-effect versions to keep the look grim. Glowing variants are not used.
- Bows cannot be equipped by the player. They are for enemies, loot, selling, and certain companions who are not introduced yet.
- The icons are inventory art. In-hand sprites use the code overlay or existing character art.

## Purifier clues in Act 2 and Act 3 access (decided)

- Symbol: the cut thread is the Purifiers' mark (decided).
- Clue 1, Ashford camp (Night): the voodoo doll and candles, plus a ledger page bearing the cut-thread mark.
- Clue 2, plains Night scouts: they drop cut-thread tokens. Collecting a few unlocks a journal entry called Whispers.
- Clue 3, standing stones: the mark is scratched into the stones where skeletons rise. It suggests use of the place but proves nothing, and keeps the Arden Rose thread separate.
- Clue 4, Iron Cleave's bill of sale: paid under a cut-thread seal, so someone hired the House's mercenaries and may have taken Arthur. The signet ring points to the Frozen Vale.
- Clue 5, the captured Purifier in the Fort cells: tested with Ver-at, he says only "You don't find us. We find you."
- Clue 6, Hakon: one line at Ashford saying he has seen the mark on a contract in the Vale.
- Act 3 access: the Purifiers seek the player out. After the player has found three or more clues and kept the tome hidden, a cutter (a Purifier recruiter) leaves a token at the player's bed in the first southern city. A short trial follows, with a choice that costs the player something with the Covenant. Joining is optional and the other factions stay open.
- An earlier dead-drop idea for players who found every clue is still a possible extra.
- The captured Purifier can be freed in Act 3 only if the player is on the Purifiers' side.

## Act 2 build order (approved, not started)

Status: planning only. Nothing is built until Ryan says so. Each phase ends in a playable checkpoint that Ryan can test before the next phase. The Act 1 changes ship together with Act 2, not as a separate update.

### Phase 1: Foundations (no new art)

1. Save-state and data tables: Act 2 flags, per-Pillar Day/Night swap, new item, loot and gear tables.
2. Pillar system: the pop-up tutorial, Day/Night swap, rest, save, respawn of regular enemies, and Mem-it fast travel.
3. Economy and inventory: merchant purses, diminishing prices, stack cap 999, pickups that vanish and regrow.
4. Chests that animate open and stay open.
5. Act 1 changes: Tessa's closing line, Maud's foreshadow line (with her past), the closed east gate, and the rebuilt Oakhaven with the Odile memorial.

### Phase 2: Magic and gear

6. Magic-focus rebalance: weapons as foci, low ATK, MAG and spell bonus, Basic Attack kept.
7. Weapon icons from the approved mapping, plus Tier 1 and Tier 2 gear.
8. Thread Study mini game and crafting at Pillars, with the recipe list.
9. The Sens enemy-health display.

### Phase 3: Enemies

10. Orc, slime, skeleton and Purifier scouts, grimmed and animated.
11. Day/Night enemy filtering by area.
12. The two-phase bosses in order: Worn Covenant Construct, Iron Cleave, then Rimefang and the rock golem.

### Phase 4: Areas, one at a time (the game stays playable after each)

13. Open Plains with the Ashford camp.
14. Ashford, with its nine quests.
15. West Forest.
16. East Forest, with the bandit camp.
17. Greywick (decided: before the Fort, because the player reaches it first).
18. Outskirts, then the Fort, with the sparring master and the captured Purifier.

### Phase 5: Story and polish

19. The Covenant quest chain, then the Maud and Mem-it flow.
20. Purifier clues and the Act 3 hook.
21. Volume sliders, the accessibility menu, real-device checks and the portrait layout.

## Final answers before building, and Phase 1 start

- Mem-it: learning it also adds the root Mem to the player's spell words (decided).
- Real-device and portrait checks: Ryan will check during testing.
- The name Unwoven is free to use with the subtitle A Tale of Talvora (Ryan confirmed).
- Phase 1 of the Act 2 build order was started on 2026-11-13 at Ryan's instruction. Later phases wait for his go-ahead after each playable checkpoint.

## Phase 1 build notes (built locally, awaiting Ryan's art approval, not published)

- Act 2 begins when the Act 1 credits close. Saves made at the end of Act 1 step into Act 2 on Continue.
- Pillar: touching it in Act 2 opens a rest panel (rest until nightfall or daybreak, rest without changing the time, and Travel with Mem-it once learned). Resting mends the party, saves, sets the wake point after a defeat, brings back ordinary enemies and never named ones, and rolls herb regrowth. The Day/Night button in the HUD is gone in Act 2.
- The pop-up tutorial shows once at the start of Act 2. It mentions study, which arrives in Phase 2.
- Economy: each merchant has a purse; the first 5 of an item sell at full value, then each sale drops 10 percent to a floor of 40 percent; shops buy back their own goods at about 25 percent; stacks cap at 999. Pike's keeps its Act 1 prices and gets a purse of 60 that refills each morning. Act 2 shops charge 12 for a poultice and 30 for a tonic.
- Bram sells basics from the Hollow Oak's back shelf in the rebuilt town (new, because only Bram deals with the party). Wenna refuses to trade there.
- Pickups: a picked herb patch disappears and has a 30 percent chance to regrow at each Pillar rest or new day, never twice in a row.
- Chests: a three-frame opening animation; looted chests stay open.
- Oakhaven: the east gate stands open two tiles west of the old barricade so the trees do not hide it, and the signpost moved one tile. The rebuilt town keeps Pike's, the Hollow Oak, the chapel, Garrick's cottage and the watch house; other lots are cleared with house frames and timber. Odile's memorial stone stands where the workshop was.
- Data only for now: Act 2 loot items, consumables, Tier 1 and Tier 2 gear and the merchant table. Battle effects of the new consumables, gear icons and enemy tables come in Phases 2 and 3.
- Testing tools gained two jumps: Act 2 start, and rebuilt Oakhaven (chapter 8 preview).
- Not built yet: the road beyond the east gate ends with a note until the Open Plains exist (Phase 4).

## Phase 1 published, and Phase 2 build notes

- Phase 1 was approved and published as V62 on 2026-11-14.
- Phase 2 is built locally and awaits Ryan's approval of the gear icons before publishing.

### Magic focus

- The hero's ATK growth per level drops from 1.2 to 0.5. Level 1 is unchanged, so early Act 1 before the tome plays the same. At level 7 a basic attack does about 20 where Pyr-or does about 66.
- Weapons are foci: Tier 1 gives ATK 4 to 5, MAG +3 to 4 and spells +5 to 8 percent. Tier 2 gives ATK 6 to 8, MAG +6 to 8 and spells +10 to 15 percent.
- Weaverplate Cuirass: guarding in it turns a further 25 percent of the blow.
- Tessa starts Act 2 with Tessa's sword (ATK +4). The Gear tab can now switch between party members, and one copy of an item cannot be worn by two people.

### Sens and enemy health

- In Act 2 an enemy's health bar is hidden and replaced by a word (Unhurt, Scratched, Wounded, Failing). A Sens working shows that enemy's bar and exact numbers for the rest of the fight. Act 1 fights still show the bar. To confirm with Ryan.

### Supplies in battle

- Bandage heals 14, poultice 24 in Act 1 and 40 in Act 2, strong poultice 90, greater poultice 160, trail ration 12.
- The Act 2 breath item is a new Breath tonic (30 coins, restores 6 Breath) so the Act 1 herbal tonic keeps healing 40 health. Greater tonic restores 14 Breath.
- Torch oil makes the next three strikes burn. A new Firewax pot (crafted from Purifier firewax and torch oil) burns every enemy.
- Antidote has no use until poison arrives with the Phase 3 enemies.

### Crafting at a Pillar

- 11 recipes. Known from the start: poultice, bandage, torch oil, trail ration. Learned later: strong poultice, breath tonic, antidote, fang charm, firewax pot, greater poultice, greater tonic. No failure, no time cost, and nothing crafted sells for more than its materials.

### Thread Study

- At a Pillar: pick a known root, watch the thread, trace its knots in order (tap or drag), then bind the ending that matches a clue. Three frays restart the trace.
- A clean study earns a mastery mark: +4 percent spell power per mark on that root, three marks at most, one mark per word per rest. Each rank adds a knot; the last rank is traced from memory.
- Study is refused at any Pillar marked as watched by the Covenant (none yet).

### Icons

- The approved sword and bow icons and the loot-pack armour and charm icons are grimmed and baked into one strip for the Gear tab.

## Phase 2 published, fixes, and Phase 3 build notes

- Phase 2 was approved and published as V63. Later fixes: the rotate-your-device screen was removed (V64), the sword swing was redrawn so the blade stays in the hand and moves smoothly, with Tessa and every equipped blade shown (V65), and the level-up line uses the hero's name (V66).
- Phase 3 is built locally and awaits Ryan's art approval.

### Enemy art (all from supplied packs, grimmed and turned to face the party)

- Bandits: Warrior 1 (cutpurse), Warrior 2 (thug), Warrior 1 darker with a code-drawn bow (archer). Knights 1 to 3 for the ambush captain, Rook's Hollow leader and bandit knight.
- The Iron Cleave: Knight 3, darkened with a red cast and scaled up, guarding in phase 1 and using its heavy swing in phase 2. The oversized cleaver is not drawn; to confirm.
- Orc pack for the Frozen Vale mercenaries. Skeleton pack for warriors, spearmen and archers. Fire Wizard for Purifier scouts and Lightning Mage for the Purifier cell leader.
- Worn Covenant Construct: Robot Destroyer (shot, shutdown and enabling strips). Ember Wisp: Fire Spirit. Field Rat: Monsters Creatures Fantasy 2 rat. Wild Boar and Snow Boar: Hunt Animals boar, side row. Snapjaw: Predator Plant 1.
- Frost Spider: the Act 1 spider icon, frost-tinted. Rimefang: the Act 1 white wolf, frost-tinted and scaled up.
- Rock Golem: no golem art exists in the packs, so it is assembled from the Rocks pack (cave rocks) with ley-lit eyes. Its arms are chains of overlapping stones so no part ever detaches; it slumps on death instead of falling apart.

### Battle rules added

- Enemy moves: single hits, two-target hits, whole-party sweeps, heals, war-cry buffs, guard stances, summons, and wind-ups that announce a heavy blow the next turn (guard against it).
- Ranged attackers stay back and throw arrows, firewax, bolts, venom or hexes across the field.
- Guard stance: damage is cut to 30 percent until a storm working or a Sens reading breaks it, or it lapses after a few turns.
- Stuns: storm shuts the Construct down; fire makes Rimefang flinch.
- Poison and bleeding tick each second and never kill. Antidote cures poison; a bandage stops bleeding.
- Two-phase foes change at half health with a banner line and a short breather: the Construct overheats (faster, no misfires, Venting Sweep, lower defence); the Iron Cleave drops shield and helm (party-wide cleave, Rend bleed, war cry); Rimefang howls and two Frost Wolves join; orc berserks enrage.
- Day and Night: every Act 2 foe is tagged Day or Night from the area tables, and wild groups only appear at the matching time. Bosses and camp leaders appear at any time unless the table says otherwise.
- 18 new test fights in the testing tools cover every group and boss. Placement on maps comes with the areas in Phase 4.
- All stats are the first pass from the area tables, to be tuned in play.

## Phase 3 art revisions (Ryan's feedback)

- Decided: the Rock Golem is humanoid. It is now an upright stone man (head, chest, two arms and two legs made of overlapping cave rocks, ley-lit eyes) that slumps on its knees when it dies. Nothing detaches.
- Decided: every humanoid enemy stands at the same height as the party (75 pixels from crown to heel in battle) and at the party's scale in the overworld. This covers bandits, knights, the Iron Cleave, orcs, skeletons, Purifiers and the Construct. Exception (decided): the Rock Golem is a giant, twice the party's height. Spears and bows can reach above that height.
- Rimefang was reduced to the Act 1 wolf's pixel size, scaled 1.45 in battle.
- Note: the craftpix humanoids are drawn about 1.3 to 1.7 times larger to match, so their pixels are slightly chunkier than the party's.

* Rock Golem art (decided): Ryan supplied the craftpix Golem top-down pack. The golem uses Golem 1 (the side row that faces the party), recoloured to grey stone with ley-lit teal eyes, drawn at four times its size so it stands about twice the party's height. Idle 4, attack 9 (a leaping ground slam), hurt 4 with a red flash, death 8. The pack's death animation breaks it into rubble, which is the pack's own art. The code-built rock golem is retired.

## Phase 3 published, and town paving

- Phase 3 was approved and published as V67 (with the grey pack golem).
- Paving (decided, option 1): the craftpix path and road tileset (the same pack as in assets2, re-sent by Ryan) is used for the Act 2 towns only. Oakhaven, the plains road and the wilds keep painted dirt roads.
- Proposed styles, all grimmed: grey stone slab for Fort Frostcrown, pebble cobble for Ashford, broken and patchy cobble for run-down Greywick. A concept on a real town map comes with the towns in Phase 4, before building them in.

## Phase 4, step 13: the Open Plains (approved, published as V68)

- **Split into four quarters (technical):** the approved 190 by 110 layout is generated whole, then cut into four joined maps, because one map that size bakes to a ground image larger than phone browsers allow. Walking off an edge steps straight into the next quarter with a short fade. Quarters: the Ashford Road (south-west), the Eastern Downs (south-east), the Heath (north-west) and the Frost Road (north-east). Every coordinate in the layout section is kept.
- **Roads and places:** the main road, the Ashford and Greywick spurs, all eight trails, the river and bridge, the ruined farmstead, signposts and mile-stones counting down to the Fort, the crossroads watchtower ruin, the burned wagon with the cut-thread mark, the overlook, the frozen pond (moved a little west so the road no longer crosses it) and the boundary stone.
- **Camps:** the hunters' camp (Sefton Reeve, buys hides) and the traders' camp (Mother Fenwick) are friendly shops. The Wayfarers' fire has a wayfarer by Night only. A Covenant patrol keeps the bridge, and an outrider the boundary stone. The ambush camp, Rook's Hollow and the hidden Purifier camp (Night only) hold their leaders and chests; Rook's Hollow teaches the strong poultice recipe and the Purifier camp the firewax pot.
- **Standing stones:** taking the cache in the ring wakes the Rock Golem. Skeletons walk the ring at Night.
- **Field Pillars:** the crossroads, the overlook, and the west and east forest trail-heads. Each wakes at a first touch; a sleeping one barely glows.
- **Snow:** the ground follows the approved bands: green south of the river road, grey rime in the frosted band, drifts with ground showing through, then full snow in the north. Bands blend without a seam; the trodden road shows through; the pond is ice; trees, rocks and bushes wear snow caps; pines take over as it gets colder; snow falls in the snowy bands.
- **Foes:** about 46 roaming groups by band, Day or Night, none within 12 tiles of the gate, a town, a Pillar or a friendly camp.
- **Not built yet (later steps):** Ashford and Greywick are shut gates; the forest and Outskirts trails are blocked. The wayfarer's quest and other quests come in Phase 5.
- **Leaving Oakhaven:** the east gate now leads onto the plains. On the first step out, Oakhaven's gate shuts behind the party and stays barred until the town is rebuilt (chapter 8).
- Names chosen for now, to confirm: Sefton Reeve (hunter), Mother Fenwick (trader).

## Phase 4, step 14: Ashford (map and look built locally, awaiting Ryan's approval)

- **Published:** the Open Plains went out as V68 on 2026-11-14. Ryan approved the names Sefton Reeve and Mother Fenwick by approving the plains.
- **Map:** 56 by 68 tiles inside a stone town wall, following the approved layout. The plains spur's gate now stands open and leads in through Ashford's north-west main gate. The Covenant outpost faces Pillar Square from the north, the chapel is west, the Purple Thistle east, then the market street (provisions, herbalist, smith, tailor, Tarn and Son), the lane of homes and the mill, the well, and fenced fields in the south. The farm gate (east) and the field gate (south) are shut, so the map has one way in and out.
- **Paving:** the craftpix pebble cobble (Road5) laid in seamless rows cut from the pack, recoloured grim: grey-brown stones, dirt in the joints, moss and grime on some, and stones lifted or sunk into mud along each street's edge. The same method will lay the Fort's slabs and Greywick's broken cobble.
- **Covenant look:** purple swallowtail flags with the gold sigil (a ring bound by a single thread) on poles along every street, swaying in the wind; long banners and a sigil over the door on the stone outpost. New shop fronts: a herbalist (drying herbs, a mortar sign), a tailor (cloth and shears), a mill (meal sacks, a millstone). Three market stalls stand round the square.
- **Still to build in this step, after approval:** the interiors, Voidsong, Winnie Fenn, Hakon (Night), the shopkeepers and townsfolk, the shops, the inn room, the chapel heal, the Pillar's Night flicker, and Ashford's nine quests.

* **Approved and published as V69 (2026-11-14):** Ashford's map, paving and Covenant look. Fix from Ryan's review: every chimney (all towns) now rises out of its roof, its foot running down under the slope, instead of floating above wide or tall roofs. Standing rule: chimneys always connect to their roofs.

## New art packs (assets7, supplied 2026-11-14)

Unpacked into assets7 and added to the packs to check before saying art is needed. Nothing is in the game yet; every use waits for Ryan's approval of a concept.

- **Fantasy chibi male and female (free and full sets):** side-on platformer sheets at 128 px. Male: Wizard, Swordsman, Archer. Female: Enchantress, Musketeer, Knight. Idle, walk, run, jump, hurt, death, attacks, plus charge, elixir, rest and special attacks; the Archer has fire, poison and magic arrows.
- **RPG heroes:** smaller 96 px side-on sheets: a hooded Wizard with a staff, a Crossbowman, a Knight.
- **Traders:** three non-chibi merchants at 128 px: a hooded peddler with a pack who opens his cloak to show wares, a kneeling tinker at a small anvil, and a young traveller with a satchel.
- **Mega boss:** a 256 px armoured knight with a flaming skull and a crimson greatsword (idle, walk, run, three attacks, special, death).
- **Elemental magic projectiles (pixel art, top-down):** fireball, fire, explosion, ice arrow, lightning, spark, earth spikes, bubbles, heal and an air shield, with casts, flights and impacts in several directions, plus 16 and 32 px icons and casting characters.
- **Magic buff effects:** smooth, glowing (not pixel) rings for life recovery, mana recovery, strength, immunity, revival and debuff, plus icons. They would need pixelating and dulling to fit the grim look.
- Proposed uses (awaiting Ryan): Covenant soldiers and crossbowmen in Ashford and the Fort from the RPG heroes; the hooded peddler as the Wayfarer; chibi bases for Voidsong (Enchantress), Hakon (Swordsman, recoloured) and a future archer companion; the projectiles for battle spell effects; the buff rings, pixelated, for heals, tonics, buffs and debuffs; the mega boss held for a later boss.

## Ashford filled in (built locally; character art awaiting Ryan's approval)

- **Interiors (10):** the Covenant outpost, the chapel, the Purple Thistle, Hobb's Provisions, Wort and Willow (herbalist), the smithy, Fine Cloth and Fittings (tailor), Tarn & Son, the mill (with a cellar under it) and the Coles' cottage. Other house doors are barred, each with its own line.
- **People (names chosen, to confirm):** Curate Voidsong; Initiate Perrin; Winnie Fenn; Hakon Redfell (at the Thistle by Night only); Pell Ashby, minstrel; Osric Dunmore, a regular (Night); Hobb Marlow, provisioner; Mistress Willow, herbalist; Brannoc, smith; Ysolde Finch, tailor; Davy Tarn (the son of Tarn & Son); Aldous Grist, miller; Sister Agna, chapel; Mabry Cole, farmer; two Covenant soldiers (gate and square); two townsfolk.
- **Shops:** Hobb (general goods; buys fangs, silk, herbs and hides best), Brannoc (Tier 1 blades), Ysolde (Tier 1 coats, caps and charms; buys silk and hide), Willow (yarrow, red-cap, and moon-cap after dark; sells the strong poultice note for 60 and the breath tonic note for 80), Voidsong (buys dark materials). The single smith-and-tailor shop of the draft is split in two, one per building.
- **Inn and chapel:** a room at the Thistle costs 30: sleep to the other half of the day or just rest; it mends and saves but does not bring the wild back. Sister Agna heals the party once per visit to the chapel.
- **Ashford's Pillar:** a Covenant stone (no study there). Until it is mended it gutters and drops out at Night.
- **The tome check:** Voidsong asks about the satchel on first meeting: "Just my things", "My master's ledgers" or "An old book" (she lingers on it). The answer is remembered for later scrutiny.
- **The nine quests, all playable end to end:**
  1. **The Flicker** (Voidsong): look at the Pillar at Night (scorched ward-stones, a cut-thread token), beat the Purifier cell at its hidden camp, scrape the Pillar clean at Night, return. 120 coins, Voidsong's letter for the Fort, a padded coat.
  2. **Hakon's Work** (Winnie, then Hakon at Night): he offers his sword for help finding "someone important". He joins once his art is approved.
  3. **Lost Casks** (Davy Tarn): scavengers at the burned wagon (a fight), bring back the casks. 70 coins and a keg of Thistle ale.
  4. **Moon-cap for a Sick Child** (Sister Agna, Night): a moon-cap from the West Forest glade, or bought from Willow after dark. 60 coins and an ashwood charm.
  5. **Cellar Rats** (Aldous): the cellar under the mill (a fight). 40 coins and 2 poultices.
  6. **Message for the Hunters** (Perrin): a note to Sefton and his rude reply back. 50 coins.
  7. **Wayfarer Whispers** (Osric, Night): find the Wayfarers' fire; the wayfarer offers a way into the Fort later (starts the secret-entrance lead). 40 coins.
  8. **The Minstrel's Debt** (Pell): Mother Fenwick pays thirty of the sixty. 60 coins and a verse about the road north.
  9. **The Lost Hound** (Mabry Cole): Tansy is under the farmstead beams with a boar in the brush (a fight). 45 coins and a hare-skin charm.
- The task list in Ashford shows the main step (the outpost, the Thistle), every active quest's next step, and "Take Voidsong's letter north" once the Flicker is done.

* **Character art approved and in (2026-11-14):** Curate Voidsong (chibi Enchantress), Hakon Redfell (chibi Swordsman) and the Covenant soldier and crossbowman (RPG Knight and Crossbowman), recoloured and grimmed, side-on at party height, with their own dialogue portraits. The Covenant patrols on the plains (bridge and boundary stone) now use the soldier art too.
* **Hakon in the party:** joins at the Thistle by Night as the third member. Tank stats (high HP and DEF, slow, almost no Breath). His battle set is baked from the pack: idle, a cleaver swing (the pack's small knife removed and a notched Vale cleaver painted into his hand on every frame, so no blade floats), a swig from a flask for items and casting, hurt and death. He starts with the Vale cleaver (ATK +6); the Iron Cleave stays his upgrade from the east forest boss.

## Phase 4, step 15: the West Light Forest (approved, published as V71)

- **Way in:** the plains' west-forest trail now runs off the south edge into the forest (the fallen-timber block is gone). Walking back up the trail returns to the plains.
- **Map:** 90 by 55, in the three planned bands. Edge (level 7): a wide sunlit trail, the forest-mouth Pillar, the hunters' lean-to and its cache, yarrow and red-cap. Middle (level 8): denser trees, the spider hollow and its cache to the north, the moon-cap glade to the south. Ruins (level 8 to 9): three broken Weaver halls (two side chests), the ring of fallen pillars with the Weaver tablet at its heart, the collapsed tower and its cache, the ruin garden, the ruin Pillar with the scholar's camp, and the construct's clearing. A southern trail loops from the ruins back to the forest mouth, so the forest is never a dead end.
- **Foes:** by Day thorn hounds, red-caps, mandrakes, forest spiders (three in the hollow) and three rooted snapjaws beside the trail; by Night gaunt wolves, bat swarms, ley-touched wolves and skeletons in the ruins. None within 10 tiles of a Pillar, the scholar or the construct.
- **The Worn Covenant Construct:** stands in its clearing as a dormant, shut-down figure. Trying the locked chest behind it wakes it (the two-phase fight from Phase 3). Beaten, it drops the key; the chest holds the Weaverplate Cuirass, 60 coins and the antidote recipe note.
- **Weaver husks:** two dormant robots (the robot pack's Infantryman and Swordsman, rusted and slumped in their shut-down pose) lie in the halls as scenery. They never wake.
- **Scholar (name chosen, to confirm): Ilse Varrow**, an independent scholar, so the ruin Pillar stays usable for study. At her camp by Day only (she sleeps at the forest mouth at Night). She tells the ruins' history and warns that the chest may be what wakes the construct; afterwards she notes the Covenant's ring was stamped over an older mark. She sells yarrow, red-cap, antidotes and bandages, and buys dark materials and curios.
- **Gathering:** yarrow and red-cap by Day; moon-caps in the glade and the ruin garden open only at Night (this also completes Sister Agna's quest).
- **Chests:** lean-to (20 coins, 2 poultices), spider hollow (30 coins, 4 silk), tower (tarnished ring, bone charm, cut gem), two ruin chests (25 coins each with grave coins or a bone charm), and the construct's chest.

* **Approved and published as V71 (2026-11-14):** the West Light Forest, including the Weaver husks and the scholar Ilse Varrow. Next in Phase 4: the East Forest.

## Phase 4, step 16: the East Light Forest (approved, published as V72)

- **Way in:** the plains' east trail now runs off the east edge into the forest (the trail-head block is gone). Walking back west returns to the plains.
- **Map:** 90 by 55. The trail runs straight through the Iron Cleave's camp, with wild forest above and below, and ends on a coastal bluff above the sea (the Dread Expanse across the water). Side paths: a forest-edge cache to the north, a herb dell to the south (yarrow, red-cap, moon-caps at Night).
- **The five stages:** (1) the Outer Watch: a crate lookout, a gagged sentry bell, a warning sign; (2) the Palisade Gate: a stake wall across the clearing with an open gate on the trail and a ditch round its south end; (3) the Lumber Yard and Tents: timber stacks, lean-tos, two supply chests and the quartermaster's tent; (4) the Captive Pens: four empty pens with their doors hanging open, tally marks, and the ledger scrap; (5) the War Camp: the war tent under a Frozen Vale House banner, the war chest, and the small Pillar at the foot of the bluff path. On the bluff: the Iron Cleave with an Orc Shaman and Orc Warrior, and a small cache with a view.
- **The tarped Pillar:** the yard's Pillar stands under a filthy lashed tarp (a new sprite). Once the yard crew is beaten, touching it cuts the tarp away and wakes the Pillar; this is the rest fire, where Hakon tells the party about his brother Arthur.
- **Hakon's search (Act 2 part):** at the pens a torn ledger page reads 'Vale boy, strong, quiet. Held three weeks. Sold on.' The Iron Cleave carries a bill of sale ('One smith, sound. Delivered south.'), a House signet ring and the Tellers' Primer; Hakon takes up the Iron Cleave (equipped automatically). The task list then reads that Arthur was sold south and Hakon will follow after the Fort.
- **The Tellers' Primer:** read it at any Pillar out of the Covenant's sight to learn the roots Ver, Cogn and Sens and the ending -ix. Ver works like Sens (it marks a foe, shows its health and weakness, and breaks a raised guard); Cogn is a thrown thought that guards cannot stop.
- **Foes:** the camp is fully manned by Day; at Night about half the crews sleep, while wolves and bat swarms fill the woods. Battles hold at most three foes, so the larger crews in the plan are split into two groups each. Levels 10 to 12.
- **Chests:** forest edge (25 coins, a breath tonic), two yard chests (poultices and bread, about 40 coins together), the quartermaster's tent (60 coins, a kettle hat), the war chest (100 coins, a ring-sewn coat, a strong poultice and the fang charm recipe), the bluff (30 coins, a cut gem).

## Phase 4, step 17: Greywick (approved, published as V73)

Greywick is the Unbound-leaning Pillar town where the snow begins. It is 56×68 like Ashford, generated by concept/greywick.py into 04m\_greywick.js, with its people and quests in 04n\_greywick\_life.js. Snow covers almost everything, with only small patches of grass breaking through (fixed snow level 0.78, per Ryan), and the streets are broken grey cobble (the "grey" paving style, baked from assets6 Road1 and grimmed, with gaps and missing stones).

- **Entry:** the plains' north-west spur arrives at a gate in the south-east corner. The town wall has fallen in places but the gaps only open onto trees.
- **Layout:** the Lamp House (Unbound outpost) north-west; the graveyard and the stump of the watchtower north-east; the boarded Covenant chapel west; the cheap inn east; the flickering Pillar in the middle; Corran's stall and Ida's half-working forge south of it; the hunters' huts south-east; shuttered homes south. Unbound yellow rag-banners hang discreetly about the town.
- **The Pillar:** it stutters at night (flickers dark) until the Keystone quest is done (flag gw\_keystone). It is not a Covenant Pillar, so the Tellers' Primer can be read here.
- **Interiors:** the Lamp House (Gideon), the Greywick Inn (Mags Tull, 40 coppers a night, rest sets home to Greywick), Flint's Forge (Ida Flint, smith shop), and the boarded chapel, reached only through the rubble at its back wall, holding the tithe ledgers chest.
- **People:** Gideon (Unbound lamp-keeper), Mags Tull (innkeeper), Ida Flint (smith), Corran Vell (trader), Jory Brack (hunter), Widow Sarn, Tam (night watch, night only), and townsfolk.
- **The Keystone quest (main):** Gideon explains the Pillar's keystone was withheld by the Covenant. It stays open until after the Fort.
- **Favours (side):** Iron for Ida (3 iron scrap → 80 coppers and a kettle hat); Hides for Brack (3 hides → 50 coppers and 2 haunches); the Ledgers for Widow Sarn (the chapel chest → 70 coppers; reveals 'Keystones withheld, by order of the High Curate'); the Watch for Tam (watch the road from the boundary stone at night → 60 coppers).
- **Trust:** Greywick is standoffish. After any two favours the town warms to you (gw\_trust), and Corran's prices drop from ×1.15 to ×1.05.
- **Tested:** all five quests, trust and the price drop, the chapel ledgers, the inn and the night watch run with no errors.

## Phase 4, step 18: the Frostcrown Outskirts (approved, published as V74 with the snow battle backdrops)

The Outskirts is 100×60 tiles of full winter round Fort Frostcrown's walls. It is generated by concept/outskirts.py into 04o\_outskirts.js, with its people in 04p\_outskirts\_life.js. The Frost Road's barricade at the boundary stone is gone: the plains' north edge now leads straight up into the Outskirts, and the outrider there says the March road is open as far as the Fort.

- **The Fort's walls:** two new tiles. F is the curtain wall and H is a gate. The grim bake draws them as a three-tile-thick wall: a snowy wall-walk with crenellated parapets, and wherever the wall faces south, a two-tile face of slate-dark coursed stone with merlons, arrow slits, frost in the joints and a snow drift at its foot. There are corner towers, and twin towers flank each gate. The roofs of the Fort's main buildings show over the walls; the Fort's interior is the next step's map.
- **South gate (toll):** a recessed arch with the portcullis down, two soldiers and a sentry box, Toll keeper Hesk by day, a patrol board, banners and lamps. The wagon queue (three covered wagons) waits on the road.
- **North gate (search):** iron-strapped oak doors, two soldiers, a search post. A sign reads "Halt and be searched."
- **Both gates are barred for now.** The in-world reason is that the garrison is changing over; at night the gates are shut until dawn. The toll, search and secret-entrance choices come with the Fort build.
- **Flank roads** run round both sides of the walls from the south road to the north gate.
- **Field Pillar "the Fort road"** stands beside the south road, for Day/Night swaps before the gates.
- **The west cleft:** a narrow gap through rocks and pines, far from any guard, ends at a culvert grate under the wall (the kitchen runoff). It is rusted shut until the secret-entrance quest.
- **The NW tor:** scree, boulders and a den. Frost wolves and cave bats appear here only, at night. Rimefang (the optional lair boss, Lv 14) lies in the den at night until beaten; beating him sets rimefang\_beaten. The den cache holds a tarnished ring and a bone charm.
- **The NE:** a frozen pond with a cache (a cut gem), and the Vale road running east to a Covenant barricade. Frozen Vale scouts camp by it by day, with a crate in House colours (80 coppers and the Frozen Vale orders: count the Fort's patrols, find where the Keystones go).
- **Other finds:** the roadside shrine cache (a tonic and 25 coppers) and the burned Covenant supply cart (3 bandages and 30 coppers).
- **Foes:** snow boars, frost slimes and frost spiders by day; ember wisps at night; Vale scouts, a berserk and a shaman near the barricade. No enemies are placed near the gates or the Pillar.
- **People:** two south gate soldiers, Toll keeper Hesk, two north gate soldiers, and a road patrol.
- **New props:** covered wagon (and a burned one), Covenant sentry box with brazier, wayside shrine, and the culvert grate.
- **Tested:** walking in from the plains and back, the gate and grate looks, the guards' day and night lines, the night tor (wolves, bats, Rimefang) and the Rimefang win hook all work, with no errors. Plains and Greywick still pass.

### Battle backdrops by region (with step 18)

Ryan supplied three background packs (craftpix winter backgrounds, four nature backgrounds, fantasy horizontal battle backgrounds), now in assets8. concept/battlebg\_bake.py brings each chosen scene down to its native pixel size, then grims it: about half the colour taken out, a cool grey tint, darker and flatter, and quantized to about 40 colours. The results are baked into 02o\_bg\_data.js.

- **Outskirts:** the rocky tor uses "rocks" (winter 4); the north-east pond and Vale road use "frostlake" (winter 7); everywhere else uses "snowwood" (winter 1).
- **Northern plains:** heavy snow uses "snowfield" (winter 3); the frosted middle band uses "birch" (winter 5).
- **Greywick** uses "snowwood" if a fight ever happens there.
- **Everywhere else** keeps the drawn forest clearing.
- **Night** darkens the painted backdrops with a blue wash.
- **Not used yet:** the Castle land scene (stone arches over a paved floor) is the likely backdrop for sparring in the Fort; it will be added with the Fort. The nature pack (spring, summer, autumn) is painted rather than pixel art, so it is not used.

## Phase 4, step 19: Fort Frostcrown (approved, published as V75 with the townsfolk sprites)

The Fort is one safe walled map of 150×96 tiles, a little under the planned 170×100 so the districts sit closer together. It is generated by concept/fort.py into 04q\_fort.js, with its people, rooms and quests in 04r\_fort\_life.js and the sparring roster's stats in 06m\_fort\_late.js. The streets are grey cobble, snow is heavy (level 0.85), and the curtain wall uses the same F and H wall tiles as the Outskirts. The Pillar in the middle is a Covenant Pillar, so studying is refused anywhere in the Fort.

- **Three ways in:**
  - **South gate (the toll):** Toll keeper Hesk waives the toll for Voidsong's letter, otherwise it costs 20 coppers. Until you have paid, the gate bars the way.
  - **North gate (the search):** a scripted choice keeps the tome out of sight. You can slip it inside your coat while Tessa distracts the guard with her boot knives, or hand it to Tessa to carry under her arm like a loaf.
  - **Secret way:** once the wayfarer has given you the lead, he explains the grate ("lift, twist, and pull"). It opens into the undercroft, and a trapdoor leads up into the storehouse.
  - Both gates are barred at night, from inside and out.
  - The Outskirts gates now show the portcullis raised by day, and the guards there now send you to Hesk instead of saying the gate is barred.
- **Districts:**
  - **Centre:** Pillar Square, with the chapel, a guardhouse and the notice board.
  - **North:** the Command Post (Ulric), with a stair down to the holding cells.
  - **East:** the barracks, the armoury, and the fenced training yard with its sparring ring and straw dummies.
  - **West:** the mess and kitchens, and the storehouse over the undercroft.
  - **North-west:** the Weaver Hall.
  - **North-east:** the north tower and its lookout.
  - **South:** the market (stalls, quartermaster, apothecary, market forge, tailor and furrier, and the Frost Lantern inn).
  - **South-west:** the lower quarter (workers' homes, the hostel and the fence's back room).
- **Rooms (17):** Command Post, holding cells, chapel, Weaver Hall, north tower, mess hall, storehouse, undercroft, barracks, armoury, quartermaster, apothecary, market forge, tailor, Frost Lantern, hostel and the fence's room.
- **Arbitrator Ulric Icetoe:**
  - New chibi art: the male Wizard from the chibi pack, recoloured iron-grey and Covenant grey.
  - He reads Voidsong's letter, sets the two tasks to join, and gives Quest 1 (Ulric's letter to Maud, task "A Letter for Maud").
  - He hints that he knows about the book ("Don't study it inside my walls").
  - The road home to Oakhaven and Maud opens in a later build.
- **Captain Ysolt Rennick:**
  - New chibi art: the female Knight from the chibi pack, recoloured dark-haired with Covenant purple.
  - She runs the yard by day with five opponents: Recruit Tobin (Lv 12, 30 coppers), Corporal Ashe (Lv 12, 40), Initiate Merrow (Lv 13, fire, 55), Sergeant Kell (Lv 13, 65) and Curate Iselle (Lv 14, Weaver, 80).
  - The first win pays coins and normal XP. Rematches are practice with no reward.
  - Losing is never a defeat: the Captain calls the bout and the party is mended.
  - Battles in the Fort use the grimmed Castle land backdrop.
- **The Keystone:**
  - The storehouse shelves hold dozens of boxed Keystones.
  - By day the storekeepers are watching. At night the one storekeeper is asleep and you can take one.
  - Gideon installs it in Greywick. The flicker stops, the shutters open, the quest pays 120 coppers, and the Greywick Pillar is restored.
- **The captured Purifier:**
  - In the cells, available once the Ashford flicker is settled.
  - Six statements. With the Primer read, Ver marks each one true or a lie: there are more cells in the south, and they lie about Kellan Vex and about the camp being the last.
- **Services:**
  - Chaplain Orvin heals for free once per day.
  - The Frost Lantern charges 30 coppers a night, and resting there sets your respawn to the Fort Pillar.
- **Shops:**
  - Quartermaster Bede Marrow (supplies)
  - Armourer Dask (Fort weapons and armour; buys arms and salvage)
  - Wenn Tallow, tailor and furrier (coats; pays more for hides)
  - Apothecary Lisle
  - Nettle the fence (pays half for anything)
- **Other people:**
  - Cook Harrow
  - Scholar Aurel Vane of the Weaver Hall
  - the storekeeper
  - square, market and north-lane soldiers
  - a recruit
  - a lower-quarter woman
  - the tower sentry
- **New art:** the straw practice dummy, Ulric, Ysolt, and the five sparring opponents (recoloured from the Covenant knight and crossbowman, the Fire Wizard, the Knight and the Lightning Mage).
- **Tested:** all three ways in, Ulric's quest, sparring wins and rewards, the chaplain, the prisoner with Ver, the night gate lock, the Keystone theft and its return to Greywick, and the secret way through the undercroft into the storehouse all work, with no errors. The Outskirts, Greywick, Ashford and East Forest tests still pass.

### Rule: no NPC ever uses the player's sprite (from Ryan)

Forty Act 2 NPCs had no sprite of their own, so they were drawn with the player's sprite. All of them now have their own. concept/npcpack\_bake.py builds them from the packs Ryan supplied (assets9: peasants, village NPCs, witches, warrior girls).

- **How each sprite is made:** each person is one body from the packs. Only their clothing changes colour; skin, hair, leather and wood keep their own. The result is grimmed like the rest of the cast and baked side-on at the party's height.
- **Safeguard:** any NPC without a set of its own now gets a townsperson sprite, picked by name. The player's sprite is never a fallback.
- **Check:** an audit of all 74 NPCs finds none drawn with the player's sprite.

### Idea for Act 3 (from Ryan)

The hero the player did not pick becomes a companion in southern Etharis. If the player chose Elowyn, Corin joins as a companion, and the other way round.

### Elves (lore, from Ryan)

There are elves in Talvora, but they are mainly found in the Ringval Wilds. So when the elf NPC pack is used for northern townsfolk (Quartermaster Bede, Cook Harrow, Apothecary Lisle), their ears are rounded off. Ilse Varrow, the scholar in the West Forest, stays an elf. The pack's light-dress woman is not used in the snowy north.

The anime warrior pack has no walk or standing animations. It gives two Fort labourers who stay in place: a hauler dragging salt-fish crates by the market storerooms, and a worker resting by the lower-quarter fire.

### Asset catalogue: UI, book and object packs (assets11, for Phase 5 polish)

- **Animated magic book, adventure book and bestiary book (page-turn animations):** the tome screen could turn real pages when opened and when moving between words.
- **Fantasy adventure book UI:** book frame, ribbons, buttons and a world-map page. Use it for the tome, quest log and map screens.
- **Bestiary UI, and bestiary monsters pack 2 (page parts and monster titles):** a Bestiary that fills in as foes are fought. Casting Sens could unlock each foe's stats, weaknesses and intent there, which ties in with the decided Sens rule.
- **RPG magic icons and spellbook UI (fire, water, ice, nature icons and book ornaments):** icons for the Old Tongue roots and workings in the tome and the battle Cast menu.
- **HP, mana, stamina and scroll bars, with portrait frames:** a battle HUD restyle (HP, Breath, ATB gauge).
- **Bridges (top-down):** proper bridges over the plains river and the forest streams, replacing the plank tiles.
- **Treasure 32×32 (icons, chests, keys, gems):** item icons, and chest variants for special caches (a gilded chest for the Weaverplate, an iron one for the Fort).
- **Resources and icons basic (herbs, ores, gems, food):** item icons for the crafting materials and herbs.

## Act 2 ending: chapters 8 to 10 (approved, published as V76)

The code is in src/parts/04s\_act2\_end.js. It builds on the rebuilt-Oakhaven state, Bram's rebuilt lines and the Mem-it travel screen that were already in the game.

- **Chapter 8, the road home:**
  - Ulric's first meeting now opens Oakhaven's east gate (sets oak\_rebuilt). Saves that had already met Ulric open it on the next map change.
  - Arriving home plays a cold-reception scene: new timber and cleared lots, nobody waves, Tessa sees the Hollow Oak's roof and the memorial stone. Hakon adds a line if he is in the party.
  - Bram now speaks to Tessa directly, since she is in the party, instead of saying that she writes to him.
  - Maud stays in her cottage in the rebuilt state. She reveals she is Ulric's mother, with thirty years of unanswered letters under the bed.
  - She packs Maud's bundle (salves, linen, and a short note on the back of his letter), then teaches Mem and -it.
  - Mem-it travel works from any woken Pillar. Tested from Oakhaven's Pillar to the Fort's.
- **Chapter 9, the Keystone returns:** unchanged from step 19. It can be done before or after Maud.
- **Chapter 10, the second task and leaving:**
  - Ulric reads his mother's note privately, pays 150 coppers, and gives the second task: carry his dispatch to the Covenant's southern seat in Etharis, where a vault was broken open and an old tome stolen. He warns that the south's roads are dangerous.
  - Asking "What was in the tome?" brings his hint: it was not whole, and pages had been cut from it long before the thieves came.
  - Hakon ties Arthur's trail to the same road.
  - Ashford's south field gate opens for the Arbitrator's seal. Taking the road south plays the closing scene (Hakon's line, Tessa's goodbye to the north, a nod to Greywick if its Pillar was restored) and then the End of Act Two credits.
  - After the credits the plains stay open to explore. The credits card and the task both say "The plains are still yours to explore".
- **New quest log entries:** A Letter for Maud (three steps) and The Road South.
- **New items:** Maud's bundle and the Arbitrator's dispatch.
- **Tested:** the whole chain from Ulric's letter through the credits plays with no errors. The Fort, Greywick, Ashford and Outskirts tests still pass.

## Phase 5, step 1: credits, music and sound (published as V77)

- **Credits:** both End of Act cards now share one credit list. Created by Ryan McGill · Burnt Pixel Studios. The world, maps, buildings, props, animation and code-drawn art are made by Burnt Pixel Studios. Music: xDeviruchi (Act One) and "Music composed by Bert Cole · bitbybitsound.com" (Act Two, as his licence asks). Sound: TomMusic, Free Fantasy SFX Pack. The craftpix.net character, creature, background and tile packs are listed by name, plus Monsters Creatures Fantasy 2, Pixel Monster Pack, Pixel Chest Pack and Soul Hunter by Honza Shift. Type: Pixelify Sans (SIL OFL).
- **Act Two music (Bert Cole, 16-Bit Starter Pack):**
  - Long Road Ahead plays on the plains by day, and Simpler Times on plains and fields at night.
  - Outside The Ruins plays in the West Forest, and Heavy Air in the Iron Cleave's camp.
  - Bustling Streets plays in Ashford by day, and Smooth As Glass in Ashford at night.
  - Remnants of What Once Was plays in Greywick.
  - Crystal Clear plays in the Outskirts.
  - Hall of the King plays in the Fort.
  - Returning Home plays in rebuilt Oakhaven.
  - Fisticuffs and Ale plays in the inns, taverns and the mess.
  - A Little R & R plays in other Act Two rooms, and No Sunlight Here in the cells, the undercroft and dark rooms.
  - Battle with Beasts plays for animal fights, If It's a Fight You Want for fights with people, It's Bossin Time for bosses, and Outside the Colosseum for sparring.
  - Past, Present, Future plays over the Act Two credits.
  - Victorious and To Suffer a Loss play as short sounds after winning and losing a battle.
  - Act One keeps the xDeviruchi tracks.
- **Sound effects (TomMusic):**
  - In battle: sword hits, blocks, arrow hits, an element sound for each spell (fire, ice, rock, wave, spell impact), heals, wards, casting, infusing and boss phase changes.
  - In the world: chests opening; doors when going in and out; the portcullis at the Fort gates; the lock at the undercroft grate.
  - Footsteps change with the ground: dirt outdoors, stone on paved town streets and stone floors, wood on floorboards and bridges.
  - Ambience loops: forest day and night in the wild, room sounds by day and night indoors, and a cave hum in caves, cells and the undercroft.
  - A new Effects volume setting sits beside Music in Settings.
- **Files:** the music and sounds are compressed copies stored next to the page (music/ and sfx/), about 17 MB of new music and 3 MB of effects.

## The book, the Pack and item icons (V78, published)

**Item icons.** Every one of the 109 items has its own icon from the icon packs, one pack per kind so each group reads as a set: weapons from 1000 RPG Icons; body and head armour and boots from RPG Equipment Sets; charms and rings from Rings and Amulets; draughts and tonics from RPG Potions; letters, books and papers from RPG Items; sacks, barrels and purses from Things for RPG; herbs, beast parts and curios from 1000 RPG Icons; rope from Resource Icons; silk and the Rimefang cloak from Cloaks and Belts. The candles and the bandage are drawn in-house. All are grimmed (colour down to about 70%, slightly darkened). The same icons now show on the Gear screen.

**The book.** The book has its own Book button, which sits directly above the Pack button (V79). The Pack button's menu has Gear, Pack and Character. The book opens over the game with paper tabs stuck to its right edge (Words, Map, Beasts, Quests, and a Close tab). Changing tabs or pages plays the page-turn animation. Keys: B opens the book, M opens the map, I opens the Pack.

- Words (blue magic book): the roots you know, with their spell icons; the hotbar; and the endings that do and do not make a word with the chosen root. Tap a slot, then a word, then Set.
- Map (green adventure book): The Frostcrown Plains, drawn from the real plains map, with place medallions. Places stay grey until you find them, either by entering them or by coming within about 13 tiles on the plains. A You marker, a key and a compass.
- Beasts (red bestiary): a page for every foe you have fought, in the order you met them, with its picture, note and kill count. Health, attack, defence, speed, weaknesses, resistances and drops show as ??? until it has been read with Sens in battle.
- Quests (green book): What's next (the current task list), then open quests, then finished ones. Each quest shows its steps so far, with a hint for the current step.

**Fit rule.** Each page is a fixed box on a design stage (the book at 4x), and the whole stage scales to the screen. Lists are paged rather than allowed to spill. A test checks that every element sits inside its page box in landscape and portrait.

**The Pack.** Built in the game-interface pack style: the plum Back1 backing, a grey-to-amber frame, Frame1 item slots and the pack's glyphs on the buttons. Category tabs are All, Supplies, Gear, Materials and Quest; nine items show per page. Tapping an item shows its icon, description, how many you carry and its sell value.

**The South Road (V78).** A new main road, three tiles wide like the main road, branches south-west off the Oakhaven–Ashford road just west of the Ashford turn. It runs down the plains to their southern edge, where a Covenant barricade closes it, with a sign: "South: the Etharis road, to the southern provinces. Closed by order of the Covenant. Travellers with an Arbitrator's seal leave by Ashford's south gate." This is the way into southern Etharis for Act 3, when the barricade can open. The book map draws it from the world and labels it "To southern Etharis". It is generated in concept/plains.py (south\_road).

## Performance (V80)

- **Finishing grade moved to the GPU.** The cool desaturation is now a CSS filter on the world canvas: saturate .76 and brightness .9 outside, saturate .86 and brightness .94 inside. The vignette and film grain are two still overlay layers (`.dz-fx`) above the canvas. They used to be full-screen canvas blends every frame, and the saturation blend in particular was costing phones about a third of each frame. The look is unchanged.
- **No world drawing behind battles.** The world's simulation keeps running, but it skips drawing while a battle covers the screen (`eng.setHidden`). The battle screen also checks its own size every 32 frames instead of every frame.
- **Measured at about phone CPU speed (6x throttle), steady walking:** the Outskirts went from about 26 to about 40 fps; the Fort, Ashford, Greywick and the plains from about 28–32 to about 45–58 fps; battles from about 35–39 to about 53–59 fps. Night lighting costs roughly 10 fps more. Measurements on the test machine vary by about ±8 fps between runs.
- **Tried and dropped:** drawing only the on-screen part of the baked map image showed no reliable gain.

## Casters and abilities (V81)

Only casters can use magic. The player (Corin or Elowyn) and the Hooded one are casters (`caster: true` in BTL\_PARTY). Everyone else gets an **Abilities** button in battle instead of Cast, and the battle engine refuses any cast from a non-caster.

Abilities cost **Stamina**, which is the same pool casters call Breath. Non-casters see it labelled Stamina in battle and as ST on the Character page. Each attack or defend wins back 1 point. Hakon's pool was raised so he can use his abilities: 5 base, plus 0.3 per level.

- **Tessa (Scout):** Quick Cut (1 St, one foe): a light cut, after which she is ready again in half the time. Hamstring (2 St, one foe): a low cut that slows the foe for about 10 seconds. Rally (3 St, the party): +40 to every other ally's turn gauge.
- **Hakon (Sellsword):** Cleave (2 St, all foes): one wide swing at 0.7 power. Shield Wall (2 St, self): he guards and draws about three-quarters of the foes' attacks for about 9 seconds. Crushing Blow (3 St, one foe): a 1.7x blow that breaks a raised guard.

Abilities live in BTL\_ABILITIES (06e\_battle.js), keyed by party member, so a future companion, such as the hero not picked in Act 3, gets their own list there.

## Towns from outside, trees, the new HUD, tester thanks and the developer lock (V83)

**Towns read as towns from the plains.** Every enterable town shows a wall, a gate and the town beyond it, built from the fort's wall art (snow off below the snow line: moss, dirt and weathered stone instead) and the ordinary house art. Plains cells: F is wall, H is the gate, R/W/w are houses. `bldKinds` (top-left x,y → kind) dresses a house without a door; `paveZones` (x0,y0,x1,y1,style) cobbles a town's streets on the plains map.

- Ashford (plains 44–77, 80–97): north wall with the gate arch at 58–59, Covenant banners and lamps, a cobbled street south, two rows of houses (apothecary, tailor, inn, chapel, outpost, store, cooper, cottages), trees closing the far side and the river on the east. The way in is now the row in front of the gate (row 79); leaving Ashford lands one row north (row 78).
- Greywick (plains 83–103, 17–30): an older snowy wall, the gate open at 96–98, boarded house, lamp-house, inn and a shack behind, the Unbound's banners, forest at its back. The way in is the row in front of the gate (row 31); leaving lands at row 32. The town keeps west of the quarter seam at x 100.
- Oakhaven's east gate (west edge, rows 60–96): a wall north and south of the road with cottage backs beyond and two lamps; the gate itself stays barred until the town is rebuilt.
- Looking at the gate or the wall gives the town's description (`towngate`, `townwall`).

**Trees.** Every overworld tree now comes from the craftpix Free Top-Down Trees pack (concept/tree\_bake.py → 02r\_tree\_data.js), grimmed and drawn at 2x so their pixels match the ground tiles. Kinds: pine, leafy (with moss and an occasional autumn tree), dead (burned and broken), and snow versions of pine and dead on the snowy plains. Each tree stands on its trunk's foot with a dark pool at the roots, a light cast shadow, and grass and weeds round its base, so none of them float.

**HUD.** The top-left panel uses the Game User Interface pack (concept/hud\_bake.py → 02s\_hud\_data.js): the open-right frame whose lines run beige into orange, a brass junction between the place and task sections, the speckled plum backing, the segmented loading bar as the leyline meter (teal when calm, orange when wild), and yellow icons for day or night, coppers, the leyline and the task. It is 236px wide (212px on short screens).

**Sound when away.** All music, ambience and sound effects pause when the page is hidden or the window loses focus (another app, another tab, a locked phone, the chat beside the game) and pick up again on return.

**Developer lock.** The testing tools, the Art tab and the collision and frame-rate switches stay hidden until the developer password is entered in Settings. Only a stretched hash is kept in the code; the unlock is remembered per device and can be undone with Lock developer tools. It keeps testers out of the menus; it is not real security. The tests unlock through the stored hash, so the password is not in the repo.

**Testers.** Both end-of-act cards thank every tester and offer anyone who reaches the end of an act a role in the game: send Ryan a screenshot of the card and say how they would like to appear.

**Handoff.** The repo zip handed to Claude Code must always be 30 MB or smaller. Unchanged audio already in the repo is left out of later zips, and the README says so; when a single zip cannot hold everything, the work is handed over act by act.
