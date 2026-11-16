# Unwoven: A Tale of Talvora – Game Design Document

·

## Vision and pillars

A mobile-first pixel RPG in the spirit of classic Zelda: you explore a hand-authored overworld with a virtual joystick, touch visible enemies to start ATB-style battles, and grow from a nameless guild apprentice into a Weaver of the Old Tongue. The whole game ships as one self-contained React component with canvas rendering and localStorage saves, matching Ryan's other games.

Pillars

Magic is language. Every spell is a spoken Root + Suffix. Learning words, not leveling a mana bar, is the core fantasy.

Risk lives in the weave. Inhale, Weave and Release are a real cast loop; getting hit mid-weave causes a Rupture.

The world answers you. Casting leaves a Lingering Signature that Weavers can trace, so reputation is mechanical, not cosmetic.

Your choices pick a side. Three factions, three endings, with each faction introduced organically and joined only after an intro quest.

Semi-open exploration. Zones are gated by danger, not walls. Wander in early if you dare.

Reference points: old-school Zelda (exploration, tone of the map), Final Fantasy IV-IX (ATB battles, companions), and The Midnight Appraiser / Second Sight Pawn (pixel style, mobile UI).

Art direction: highly detailed pixel-art portraits during dialogue and combat, and fairly detailed sprites and tiles on the overworld.

## World summary

Durinn is the world; Talvora is its continent, split by the War of the Gods into northern and southern landmasses around the fog-choked Dread Expanse. Magic flows through subterranean leylines that all originate from or return to The Divide, a chasm beneath Etharis. The Archon Covenant keeps a monopoly on magic by teaching that it is a noble bloodline trait, when in truth anyone who can speak the Old Tongue can channel it.

Realm

Capital

Role in the game

Etharis (human mainland)

Capital City

Main playable region; five sectors under Weaver and noble rule

Felbrin (dwarves)

Vin Darihm

Rune-iron, metalcraft, grounding materials; transactional

Ringval Wilds (elves)

Alhalune

Feywild threshold; hostile to outsiders

Frozen Vale

Farcross

Mercenary frontier with no Pillars; Sanguis-style magic; the House in the Frozen Vale hires the mercenaries met in Act 2

Durte (lawless coast)

Sin's Landing

Black market for banned texts and focus tools

Dread Expanse

none

Fog-bound ruin islands; thinning mist opens late-game salvage

Key institutions

The Archon Covenant (the Order): the Archons, Arbitrators, Weaver Curates and Initiates rule from Capital City. "Weaver" is simply the word for anyone who can cast. Leyline Pillars regulate, store and redirect power, which lets the Order cut off whole provinces.

Class system: Guild orphans get trade surnames (Iron-hand, Crop-foot, Timber-mark, Hide-bound, Quill-mark); orphans without a guild are the Nameless.

The Unbound: an open, decentralised movement that wants to reveal the secret of magic to the world and dismantle the Covenant. The Purifiers are a separate extremist faction that wants to destroy magic at any cost, even by using it; Kellan Vex belongs to them and stays hidden.

The Gathering Storm: leyline failures and blackouts are spreading, a sign that The Divide is destabilizing.

Scope decision: the first release covers Etharis only. Other realms appear as places named in dialogue, trade goods and later expansions.

## Magic system as gameplay

There is no mana bar. Casting draws on the local leyline, so the resources are breath, strain and leyline strength under the player's feet. Spells are built from 38 roots and 16 suffixes (608 pairings), but each root only accepts suffixes that make sense for it, which keeps the real spell list manageable.

The four-step cast loop

Step

Lore

Gameplay

1. Attune

Feel the leyline hum

Passive. A ripple or HUD gauge shows local leyline strength.

2. Inhale

Draw raw energy up from the earth

Hold the spell button; a breath ring fills. Overfilling adds strain damage.

3. Weave

Shape the energy

Keep the ring steady. A hit during this step causes a Rupture: knockback, burn, stagger, cast cancelled.

4. Release

Speak the Root + Suffix

Let go in the timing window. Clean timing gives full power; sloppy timing causes deviation or a misfire.

In battle (see Combat), Inhale and Weave become charge time on the ATB bar and Release becomes an optional timing tap.

Zone rules

Inside a Pillar radius: stable casting, no surges.

Wild Borders: stronger casts, plus surge events, tremors and a higher misfire chance.

Frozen Vale and no-Pillar areas: Sanguis casting (sacrificing health) is the only reliable option.

Lore rules turned into mechanics

Lingering Signature: every cast leaves a trace that Sens-id or Mem-id can read. Arbitrators and Curates can detect recent casting, which drives a notoriety meter in Weaver towns.

Acoustic vulnerability: gags, throat injuries, lung exhaustion and Mut-ix silence fields block the Release, stranding the weave.

Grounding charges: iron filings plus blackpowder or sulfur force an instant Rupture. Musketeers and Arbitrator guards are the anti-caster enemy type.

Forbidden roots (Vora, Sanguis, Xeno, Nihil, Strig, Nexus, Phag) are story-gated and tied to faction or ending paths.

Roots and suffixes by category

Category

Roots

Elements and matter

Pyr, Nix, Vent, Petr, Ferr, Fulg, Bary, Nebul, Vitr, Plast, Fract, Stas, Tach, Solen

Light, shadow, force, motion

Phaos, Tenebr, Vis, Vinc, Ton, Eid, Chron

Mind, senses, life, nature

Cogn, Sens, Mut, Ver, Somn, Mem, San, Carn, Flor, Ven

Forbidden and esoteric

Vora, Sanguis, Xeno, Nihil, Strig, Nexus, Phag

Group

Suffixes

Scale and precision

-is (minor), -os (major), -at (surgical)

Delivery and form

-ix (ward), -el (beam), -am (radial cloud), -or (projectile), -on (solid construct), -ar (decoy), -en (infusion), -us (snare)

Timing and flow

-ex (delayed trap), -it (instant snap), -ant (sustained channel), -in (inversion), -id (diagnostic echo)

Learning and crafting: roots and suffixes are learned separately from texts, shrines, scholars, rivals and companions. A weaving table lets the player combine known words, and four favorites go on the hotbar. Quill-mark clerks learn words faster. Suffix -in enables puzzle solutions, such as Pyr-in to freeze a water gate.

## Hybrid combat

The player explores in real time with the joystick. Enemies are visible on the map, and touching one (or being spotted by it) starts an ATB battle on a separate battle screen, Final Fantasy style. Winning returns the player to the exact map position.

Exploration layer

Joystick on the left, interact and menu buttons on the right.

Enemies patrol, sleep or guard, so the player can sneak around, lure or ambush. Striking first gives a head start on the ATB gauges.

Zone-specific hazards (surges, tremors) occur on the map, not in battle.

Non-combat spells work on the map: light, detection, Sens-id scans, Mem-id tracking, puzzle solving.

Battle layer (ATB)

Each party member has an ATB gauge. When full, they pick a command: Cast, Attack, Item, Defend or Flee.

Casting is charged. A spell needs Inhale and Weave ticks before Release. Larger spells charge longer.

Rupture: a hit on a caster mid-charge cancels the cast and deals burn and stagger damage. Defend, wards (-ix) and positioning protect casters.

Release timing tap: an optional tap for full power. Missing it causes deviation rather than failure, and an accessibility setting can make it automatic.

Leyline strength modifies every cast: stable in Pillar zones, stronger and riskier in the Wild Borders.

Enemy counters: musketeers with grounding charges force Ruptures, silence casters (Mut-ix) block Release, and Weaver Curates use Xeno to strip wards.

Elemental and conceptual weaknesses reward bringing different roots, for example Pyr against Flor and Fulg against armored targets.

Party: up to three active members in battle (the player plus two companions); the rest wait at camp or base. Companion roles are covered below.

Why hybrid: it keeps the Zelda-style exploration feel and joystick controls, while ATB makes companions, spell variety and balancing far simpler than real-time combat with 600+ spell combinations.

## Character creation and trades

The player is always an orphan. Creation sets a name, a look, a trade and a surname.

Background

Apprentice: every player starts as an orphan taken in by a guild trade. The player gets the trade surname, a mentor, a shop to live in and non-combat jobs. The mentor is slightly cold toward the player, since orphans are not looked upon in this world.

Street Nameless: saved for a later DLC; not in the first release.

Trades

Trade

Surname

Non-combat work

Passive bonus

Blacksmith

Iron-hand

Forging and repair minigame

Better gear crafting

Clerk

Quill-mark

Copying and sorting texts

Learns Old Tongue words faster

Carpenter

Timber-mark

Building and repair jobs

Cheaper crafting, trap-making

Tanner

Hide-bound

Curing hides

Armor crafting, resist bonuses

Farmhand

Crop-foot

Harvesting and herb work

Gathering and potion bonuses

Stonemason (placeholder)

Stone-set (placeholder)

Masonry and quarry jobs

Sturdier wards and constructs

Note: the six-trade table above is superseded by V51; the player is always a Quill-mark and Odile's Clerk apprentice. Surname effects: the surname (or its absence) changes how nobles, Weavers and guild members speak to the player, and feeds the Weaver reputation score. Quill-mark is the strongest narrative fit, since clerks can read but are barred from studying linguistics.

Reputation: each faction (Archon Covenant, Unbound, Purifiers) has its own reputation score. All scores start neutral after Act 1, because the Arbitrator scene gives no reputation change; later quests and casting in Weaver territory move them.

## Act 1: the scripted opening

Act 1 is longer and more open than first planned: the same story spine, with free exploration of the north woods and a southern cave region between the story beats. Every beat still teaches one system, and the world opens only after the fire. Day numbers below are approximate, because story time now advances by sleeping rather than a clock.

Beat

What happens

Teaches

Day 1: apprenticeship

The player works their trade, delivers the work, buys a candle for the mentor and collects a wage. Built in Phase 2.

Movement, interaction, trade minigames, dialogue, shops

Day 1: the witch

The mentor sends the player north to the witch to ask for the charm the mentor needs. Wolves attack on the road. The witch is introduced and says the charm will take time. The north woods open.

First ATB battles, the witch, leaving town

Free roaming: the north woods

The player hunts for loot to sell at the store and levels up before the story moves on. The woods are large, with the witch's home deep inside.

Combat practice, loot, selling, levelling

Day 2: the tavern

The mentor sends the player to the tavern. A mysterious stranger enters after them and sits down. The keeper steps away and is overheard telling customers an Arbitrator arrives tomorrow. The stranger panics and flees.

NPC schedules, eavesdropping, story hook

Day 2 night: the tome

Leaving the tavern, the player finds the stranger's tome. At home they study it.

Magic tutorial: Attune, Inhale, Weave, Release; first Root and Suffix

Day 3: the Arbitrator

After speaking with the mentor, the player is questioned about the stranger. The player may lie or tell the truth, but the mayor always interrupts before they answer, so nothing is said and reputation does not change. The player does jobs, then studies again at night.

Dialogue choices, more words

Free roaming: the southern road

The road south opens onto a rocky area with several caves. All can be entered except one, sealed by rubble. Enemies, loot and levelling.

Exploring caves, tougher enemies

Day 4: the witch's bargain

The player returns to the witch. For the charm, she needs a rare mushroom that grows only in the sealed cave. The player says rubble blocks it, and she teaches them a word that moves it.

The Word of Moving, a new overworld mechanic

Day 4: the sealed cave

The player uses the word to clear the rubble, fights through the cave, takes the mushroom and returns it to the witch for the charm.

Words as puzzle tools, a first mini-dungeon

Day 4: the fire

Returning to town with the charm, the player finds Oakhaven in flames. They reach home and find the mentor being tortured by the stranger, now holding the tome again. The player fights and is scripted to lose.

Rupture, a loss that advances the story

Aftermath

The player wakes just outside their destroyed home, long after the flames have died, and sets out to find more magic. They eventually reach another town with a Weaver Order outpost, which is the first faction contact.

World opens up

Day and night replace the clock

The in-game clock and time display are removed. The world has two states, day and night, in the manner of Octopath Traveler 1 and 2.

Day: shops are open, most townsfolk are out working, and the usual enemies roam the wilds.

Night: shops close, the tavern fills, different townsfolk and some secrets appear, and the wilds are more dangerous.

Story beats advance when the player sleeps at night. Between beats, free roaming has no time limit, so the player can explore, fight and level up at their own pace.

In Act 1 time is scripted and advances by sleeping. From Act 2 the player swaps Day and Night only by resting at an activated Pillar (or paying for an inn room), as set out in the Act 2 day/night sections. Story beats can lock the time of day.

Longer Act 1: new beats and areas

The witch on day 1. The mentor sends the player to the witch to ask for a charm the mentor needs. The witch is introduced early, and wolves on the road give the first combat.

North woods open early, so the player can fight for loot to sell at the store and level up before the story turns. The woods are bigger than before, with the witch's home deep inside.

Southern road and rocky caves. The road south opens onto a rocky area with several caves. The player can enter all of them except one, which is sealed by rubble until the witch's quest.

The witch's bargain. In exchange for the charm, the witch needs a rare mushroom that grows only in the sealed cave. The player points out that rubble blocks the way, and the witch teaches them a word that moves it.

The fire comes last. The player returns to town with the charm and finds Oakhaven under attack, which leads into the scripted loss and the aftermath.

New mechanic: the Word of Moving

Bary-is, a new Old Tongue word, lets the player move obstacles such as rubble, boulders and loose barricades in the overworld, so words now solve puzzles as well as win fights.

It follows the normal Root and Suffix rules and uses breath, and the Lingering Signature applies in Weaver territory.

It is first used on the sealed cave, then reused for gated spots across the world, including generated dungeon puzzles.

The word is Bary-is (gravity, minor). The witch teaches it because the player does not know the root Bary yet; it is the player's first gravity word.

Story facts established in Act 1

The stranger is Kellan Vex, a Purifier leader. He believes the mentor stole the tome, because he found it in the shop where the player lives.

The tome is stolen property, but not by the mentor. Vex took it from a Weaver vault far to the south. Some pages are torn out, which the player sees on first reading.

The mentor is Odile (a woman, fixed), is always slightly cold toward the player, and dies at the end of Act 1. They did not steal the tome.

Vex burned the town.

Oakhaven is the starting town and Isaura Thorne is the Arbitrator. The mayor is randomized. The witch is Old Maud, who is revealed in Act 2 to be Ulric Icetoe's mother.

Hidden truth, revealed later: the tome contains the spell that clears the fog over the Dread Expanse. The missing pages matter.

Design notes

The Day 2 scene is a moment of choice with no consequence: the player may lie or tell the truth, but is always interrupted. The Lingering Signature is introduced later, when the player casts in Weaver territory.

Act 1 is built as a scripted sequence separate from the open-world engine, with a day and night state, locked doors, sealed paths and scripted triggers.

## Overworld and zones

The overworld is a hybrid. A zoomed-out travel map links regions, with fog of war, rations, travel time and random events. Towns, outposts, wilds and dungeons are fully walkable scenes at the same zoom as Oakhaven, and they are big: cities 120 by 90 tiles or more, large settlements about 80 by 60, outposts about 55 by 40, wilderness scenes about 70 by 45, dungeons several floors of about 45 by 35. Zones are gated by enemy danger and story rather than walls. The structure below is a proposal built from the lore; names and ordering are open to change.

Order

Zone

Lore basis

Character

1

Starting town and woods

Pillar-protected town, witch's cottage

Tutorial zone; safe, then Wild Border surges in the woods

2

Outer province roads and towns

Etharis outer provinces

Fortress towns, Weaver patrols, first faction sightings

3

The Wild Borders

Land outside any Pillar radius

Mutated predators, tremors, unstable casting

4

Regional lord castles

Five-sector administration

Political questlines, noble houses, tithes

5

Unbound hideouts and ruins

Unbound and Purifier presence

Faction intro quests

6

Dread Expanse ruin islands

Thinning fog

Late-game salvage zone tied to the tome's fog spell

7

Capital City and The Divide

Weaver spires, obsidian foundations

Finale

How factions appear in the world

The Covenant: the Arbitrator in Act 1, then Pillars, patrols and Curates in every town.

The Unbound: a hidden printing press, copied Old Tongue pages, whispered rumors among guild workers.

Purifiers: Vex's recruiters, graffiti and sabotage of Pillars.

Each faction's recruitment starts after a short intro quest for each, so the player sees all three before choosing.

Map authoring

Zones are authored as 2D arrays (or compact strings) of tile ids, with separate layers for ground, objects, collision and triggers.

Each zone declares its leyline strength, enemy table, ambient music and Pillar radius.

A tile editor workflow (a simple in-browser tool or hand-edited JSON) is decided in Phase 2.

## Generated dungeons

Dungeons are procedurally generated from themed room templates, so each visit has a fresh layout but a predictable structure: entrance, branching rooms, a key or switch item, a locked gate and a boss room. Story dungeons use fixed boss rooms and fixed rewards inside a generated shell.

Theme

Setting

Signature hazards and enemies

Leyline caverns

Underground junctions near Pillars and Wild Borders

Surges, mutated beasts, unstable floors

Weaver vaults

Order storage and archives

Wards, Curates, Arbitrator guards, grounding traps

Unbound hideouts

Unbound and Purifier bases

Zealots, hidden presses, sabotage

Expanse ruins

Fog-bound islands

Residual divine fallout, relic guardians

The Divide

Beneath Capital City

Final descent; all elements and forbidden roots

Generator outline

Pick a theme, size and difficulty from the zone.

Place rooms on a grid and connect them with a spanning tree, then add loops.

Assign room types: combat, puzzle, treasure, rest, key, boss.

Place locks and keys so the key always sits earlier in the path than its lock.

Fill rooms from the theme's enemy and loot tables, scaled to zone level.

Seed the generator so a dungeon can be reproduced from its seed, which also makes saves small.

Puzzles use the magic system: Pyr-in to freeze a water gate, Vent-or to move light objects, Ver-id to reveal hidden wards, Mut-ix to sneak past sound-sensitive guards.

## Factions and three endings

There are three factions and three endings. Each faction is shown to the player in the world first, then offers an intro quest. Only after completing the intro quests does the player commit to a side.

Faction names (updated): read "Weaver Order" in the table below as the Archon Covenant, and "Liberators" as the Unbound. The Purifiers' aim is to destroy magic at any cost, even by using it. All three can be joined (the Purifiers are the hardest), and joining is saved for Act 3.

Faction

Goal

Intro quest idea

Ending

Weaver Order

Preserve the monopoly and the Covenant

Help an Arbitrator track a Lingering Signature

Order: control is kept; the lie survives or is reshaped from within

Liberators

Spread the Old Tongue and democratize magic

Help move a printing press or copy a lexicon page

Liberation: magic is open to everyone, with the cost of a divided, chaotic world

Purifiers

Reach and destroy The Divide

Sabotage a Leyline Pillar

Extinction: magic is purged, with catastrophic environmental and seismic collapse

Faction rules

Reputation starts neutral after Act 1; the town with the Weaver outpost is the first faction contact.

Each faction has its own reputation score and unlockable words, gear and companions.

Quest choices can open or close faction paths, but the player stays uncommitted until all three intro quests are done.

Faction choice should affect which forbidden roots the player can learn (for example Strig and Nexus with the Purifiers, Xeno with the Weavers).

Spine of the main plot

Act 1: the tome, the fire and the loss to Vex.

Act 2: the player explores, learns magic and meets all three factions.

Act 3: the player commits to a faction after the intro quests.

Act 4: the tome's missing pages, the fog spell and the Dread Expanse drive the late game.

Finale: Capital City and The Divide, resolved by faction choice.

The endings' exact shape, and how the fog spell interacts with them, are open questions in the last section.

## Companions

The game needs at least 7 companions: one or more per faction (at least 3) and at least 4 independent of any faction. The names, roles and concepts below are proposals for you to rewrite; the roles keep the party balanced in ATB combat. Non-human companions live in or pass through Etharis, since the first release covers Etharis only.

Slot

Name

Tied to

Role

Concept

Weaver

Corvin Hale

Weaver Order

Ward and support caster

Junior Curate at the Weaver outpost who starts doubting the Order; knows Sens and Mem tracking

Liberator

Tamsin Quill-mark

Liberators

Healer and scholar

Clerk who secretly copies Old Tongue pages on a hidden press; San and Ver

Purifier

Maren Iron-hand

Purifiers

Heavy damage, grounding charges

Former blacksmith's apprentice who blames magic for her guild's hardship; iron and blackpowder

Independent

Hakon Redfell

None

Frontline fighter

Frozen Vale sellsword and tank who taunts and hits hard but slowly, searching for his brother Arthur (see Act 2); he cannot cast magic (decided; Sanguis dropped for him)

Independent

Jessa Brine

None

Ranged scout and trapper

Durte smuggler who lays -ex trap glyphs and can find banned texts

Independent

Ilyrae

None

Nature and healing caster

Exiled elf from the Ringval Wilds; Flor and San; distrusts Weaver magic

Independent

Hadrin Coppervein

None

Tinkerer and support

Felbrin-trained dwarf engineer; clockwork gadgets and gear that resists grounding charges

Update for Act 2: Tessa Hollis (Bram's niece, sword, buffs and debuffs) joins at the end of Act 1, and Hakon (a tank, searching for his brother Arthur) is recruited at Ashford. They replace the proposals for the first two companion slots, and the rest of this table stays a proposal. Companions change only by gear.

Systems

Each companion has a personal quest, a camp dialogue thread and a reaction to the player's faction and reputation.

Faction companions can leave or turn on the player if the player picks a rival faction. Independents stay unless their own quest goes badly.

Companions learn words from the same shared pool as the player, but each has a signature Root and a playstyle.

Active party in battle is the player plus two companions; the rest wait at base.

Personalities, personal quests and voices are still to be written once you pick the ones you like.

## Progression and systems

Power comes from two tracks: character level and vocabulary. Level raises health, breath capacity and strain tolerance. Vocabulary is what unlocks new spells.

Word discovery: roots and suffixes come from tomes, shrines, scholars, rivals, faction trainers and companions. Forbidden roots are gated by story and faction.

Weaving table: combine known Root + Suffix pairs, preview the effect and save favorites to a four-slot hotbar. Invalid pairs are blocked or produce weak results.

Trade skills: the apprenticeship trade keeps working after Act 1 as crafting and gathering (forging, copying, building, tanning, herbalism).

Gear and loot: chests, shops, drops and crafted items. Iron and grounding materials matter because they interact with magic.

Notoriety: the Lingering Signature feeds a heat meter in Weaver towns. High heat means patrols, Arbitrators and ambushes; it decays when the player stays away from Pillars or avoids casting.

Quest log and journal: tracks main story, faction quests, companion quests and discovered words.

Saving: localStorage. Save at beds, Pillars, inns and checkpoints; autosave at zone transitions. A single save slot first, more slots in polish.

Mobile UX: large touch targets, joystick on the left, buttons on the right, safe-area padding, pause on tab hide, and a reduced-motion setting.

## Technical architecture

The game is one self-contained React component: the React shell draws touch UI, and a canvas game loop runs the five systems that hold all game logic.

The systems read and write one shared game state, and the save layer serializes it.

Proposed technical choices

Pixel canvas scaled up with pixelated rendering. The internal resolution is settled in Phase 1 with an art test, since fairly detailed overworld sprites need more pixels than a classic 240 by 160 canvas.

Game state lives in refs, not React state, so the loop does not trigger a re-render every frame.

Joystick and buttons use pointer events with multi-touch, so movement and actions work at the same time.

Maps, the lexicon, enemies and story flags are plain data objects, so content can grow without changing engine code.

Dungeons store only a seed and progress in the save file.

Act 1 runs as a scripted sequence on the same engine, driven by the day counter and story flags.

## Phased development plan

The game is built in eight phases, with Act 1 as the first fully playable slice. Nothing is built until you approve this plan.

Phases 1 to 4 deliver the engine, the town, battles and magic. Phase 5 now starts with the Act 1 rework (day and night, the witch on day 1, the larger north woods, the southern caves and Bary-is), then widens the game with the travel map and the first open-world zones.

## Decisions and open questions

The design is settled enough to start Phase 1 once you approve; the questions below can be answered while the engine is built, but the first four affect Act 1 content.

Decisions made

Topic

Decision

Platform and view

Mobile first, joystick, top-down pixel art, old-school Zelda feel

Combat

Hybrid: real-time map exploration, ATB battles on contact

Party size

The player plus two companions in battle

Spells

Both projectile and area spells; Root + Suffix system

World structure

Hand-authored overworld, generated dungeons

Saves

localStorage

Endings

Three, one per faction path; details still open

First release scope

Etharis only

Tone

Dark and political, but hopeful

Factions

Introduced organically in the world; the player joins only after an intro quest for each

Companions

At least one per faction and at least four independent

Backgrounds

Apprentice only at launch, with another trade replacing the street start; Nameless is a later DLC

Opening

Orphan apprentice in Oakhaven; tome, Arbitrator Isaura Thorne, witch and fire as scripted in Act 1

Mentor

Odile (fixed), slightly cold toward the player, dies at the end of Act 1; did not steal the tome

Day 2 Arbitrator scene

Lie or tell the truth, always interrupted, no reputation change

Aftermath

Player wakes outside the destroyed home, later reaches a town with a Weaver outpost

Vex and the tome

Vex stole it from a Weaver vault in the far south; torn pages hide the fog-clearing spell

Art

Highly detailed portraits in dialogue and combat; fairly detailed overworld

Overworld

Hybrid: zoomed-out travel map with fog, rations and random events, plus large walkable scenes; settlement size scales with importance

Time

Day and night states replace the in-game clock, as in Octopath Traveler; from Act 2 the player switches only at Pillars (or inns)

Act 1 length

Longer: witch on day 1, open north woods, southern caves, sealed cave and the Word of Moving before the fire

Character creation

8 hairstyles, 7 eye colours, 5 face marks, separate cloak and tunic colours, pronouns, more skin and hair colours

Orphan standing

The player is a lifelong, well-known resident of Oakhaven, but as an orphan is treated differently; dialogue never treats them as new

Build progress: Phases 1 to 4 are built and Act 1 has had one playtest pass: engine, town, ATB battles, magic, the chibi cast with a full character creator and two overworld mockups. Phase 5 is next but is on hold: the Act 1 rework above (day and night, the witch on day 1, the north woods, the southern caves and the Word of Moving) comes first, and nothing new is built until its concept art is approved. Resolution is the Detailed setting (224 px on the short side).

Open questions

Street Nameless opening: who plays the mentor role if the player has no apprenticeship, and does the Act 1 script change?

Im thinking we take this role out and replace it with another trade. Nameless can be an eventual dlc.

The mentor: name, personality and trade (does it change with the player's trade?). Does the mentor survive the torture, and did they really steal the tome?

The mentor's name can be randomized but their personality is always slightly cold towards to the player. Orphans in this world arent looked highly upon. The mentor always dies and no, they didnt steal the tome. Vex assumes they did since they found it in their shop which the player lives at.

Day 2 Arbitrator: the mayor interrupts before the player answers, so should the Lingering Signature check ever land, and what does the reputation change depend on?

Thinking on this too, no more reputation gain or loss here, just an opportunity for the player to lie or tell the truth but is always interrupted.

Aftermath: where does the player wake, and which faction do they meet first?

The player wakes just outside their destroyed home. The player would eventually find themselves in another town which would have a Weaver order outpost.

Names: the starting town, the Arbitrator, the witch and the mayor.

The town is Oakhaven; the Arbitrator's name is Arden Rose (superseded: the Arbitrator is Isaura Thorne, a woman; Arden Rose is reserved as a dormant lich king for an expansion); the witch's name can be discussed but I was thinking she could have a side quest that leads the player all across the continent; the mayor can be randomized.

Party size in battle: the plan assumes the player plus two companions. Is that right?

Yes.

Endings: what exactly happens in each, and how does the fog spell and the Dread Expanse tie into them? What is Vex's fate?

Not sure yet, I want to focus on the core of the game before the ending.

Companions: names, personalities and origins for all seven.

Help me come up with them.

Art direction: palette, sprite size and any references from your earlier game to match.

Highly detailed pixel art for portraits while characters are talking/combat, fairly detailed for overworld.

## Gear, Pack and interior rooms (built, V33)

Pack button sits above Interact and opens Gear, Items, Quests, Tome and Character. Keyboard: I. The top-right menu now holds Settings, How magic works and Art. Keyboard: Esc.

Gear slots: Weapon, Head, Body, Charm. Items carry a gear block (ATK, DEF, MAG, HP, MP, SPD) and bonuses are added in btlStatsFor, so battle, resting and level-ups all use them. Equipment is stored per party member (G.equip).

Day 1 sword: the mentor sends the player to the storeroom chest in the workshop for the Old Sword (ATK +3). The north barricade watchman refuses to open until the player has it. The sword shows in the hand on the battle attack frames only.

Other gear found in chests: Quilted jerkin (Pike's stockroom), Iron-rimmed cap (Hollow Oak guest room), Covenant medal (chapel vestry).

New rooms: storeroom, Pike's stockroom, Mayor's study, tavern kitchen and guest room, chapel vestry, Garrick's bedroom, Vane's dye store, farm pantry, Maud's drying loft. Rooms connect through an inner doorway tile.

Balance: with the sword, wolf attack rose 7 to 8, Cave Hound hp 40 atk 9, Scarred Alpha hp 150 atk 12, Old Blind Hound hp 120 atk 10. Alpha needs about Lv4 solo.

## Testing tools, collision fit and the burning town (built, V34–V36)

### Testing tools (Menu → Settings → Testing tools)

Checkpoint jumps: 10 story checkpoints skip straight to a point in the finished game: sword sent, sword fetched, Maud, Day 2, Day 3, the bargain, the cave, the moon-cap, the fire, and the ashes (Day 7). Each sets the flags, items, level and location a real playthrough would have.

Spots: warp to any area. Fights: start any foe group.

Cheats for testing: heal, set level, learn all words, add coins, toggle day/night, change the day, turn off wild encounters, clear or reset chests.

Give items: pick any item by id, give one or five, or give all gear, the starter kit, or all loot.

### Collision fit

Houses block movement only where they are drawn. Roof tiles that fall outside the gable (the empty corners) are walkable.

The shaping is computed when the map is baked, from the same roof polygon the sprite uses, so it stays correct for every building size.

### The burning town (Day 4 fire)

No entry: while Oakhaven burns, every building door is locked. Looking at one shows a rotating burning-door line. The only exits are the north woods and the southern rocks. Entry returns after the ash.

Art (approved from concept screenshots): the houses themselves are drawn burning. Roofs are charred with burn-through holes and a glowing rim. Windows and doors are full of fire with soot above them. The old smooth overlay flames are gone.

Flames: hard-edged pixel tongues in four tones (#8a2418, #d2501c, #f08a2a, #ffd068, with #fff3c0 highlights), stepped columns that lick and settle. They are rooted at anchor points the building bake returns (burn holes, window tops, door tops). Smoke, spark flares and flickering ember lights use the same anchors.

The map is re-baked in its burning form while the fire flag is set and the ash flag is not.

### Still to do

Other oversized collision (lamps, bushes, signs) if it feels off in play.

A gear screen for party members.

Audio; the balance-sim bot update; the remaining world beyond Act 1.

## Act 1 environment rework and hero/intro plan (V37)

Rules

Wolves never appear in Oakhaven. They live only in the woods, the southern rocks and the caves.

Quill-mark stays as the Clerk's surname.

Built in V37

Water: curved shorelines, mud banks, reeds, darker rippled water; the bog is greener with duckweed.

Bridges: landing boards run onto both banks so they join the road.

Wells: flagstone apron centred under the well, a worn track to the nearest road, spilt water.

Graveyard: headstones on mounds, wall closed on the south.

Paths: diagonal paths smoothed, narrow woods trail, cart ruts only on 2-wide town roads.

Cliffs and caves: rounded broken edges, side faces, cast shadow, rubble and dripstone.

Camp: cold fire pit, torn lean-to, trampled earth. Hollow logs and bones beside outdoor chests.

Ragged forest edges with undergrowth; rocks and bushes grounded with pebbles and grass.

Bugs: interior props in Garrick's bedroom, dye store and farm pantry no longer overlap or block.

Hero and intro (planned, not built)

Named hero: Corin (male, the current male design) or Elowyn (female, design to be supplied by Ryan).

Flow: title, then slides 1-4 (world, ley-lines and the Old Tongue, the Weavers, the bundle at the door), then trade choice, then male/female, then skin tone, eye colour and hair, then slides 5-7 matched to the trade (growing up in the trade, growing up with Tessa Hollis, the hint of power), then wake in the cot, then mirror/wardrobe for clothes and hair colour before the door opens for the first time.

Intro is skippable only after the first viewing.

The mentor appears only as a silhouette (their name is random).

Storyboard approved. Open points: the age line on slide 7 (currently seventeen winters) and Tessa's wording on slide 6.

Concept sheets for the hero designs and the gender/look/wardrobe screens come first, after the female design arrives.

## V38–V39: Hero and intro flow

Heroes: Corin (male, craftpix Wizard chibi) and Elowyn (female, craftpix Knight chibi with hair over one eye, sword erased, eye whites protected). Chosen on the creator's gender screen; old saves default to male.

Flow: splash → title → intro slides 1–4 → creator (trade, then male/female) → slides 5–7 → game. The Skip button appears only after the intro has been seen once.

Slide 5 (growing up in the trade) and slide 6 (Tessa) draw the children smaller, with a big head and a short body and legs (V39). Slide 7 keeps the line "Seventeen winters"; Tessa's wording is approved as written.

Mirror in the shop room: the wardrobe must be used before the shop door lets you out. Bridge and well alignment fixed in V37.

Not yet used: the other craftpix packs (enemies, NPCs, nature) wait for approval of concept art before they go in.

## V40–V42: Foes, wolves and wildlife

All art is from craftpix free packs, toned down to Durinn's gritty palette and baked into atlases. Sprites that aren't animated get idle, attack and hurt motion in code. Every art change was shown to Ryan and approved before publishing.

V40: new foes in Act 1

Slimes (animated pack): Mire Slime (green, woods), Cave Slime (blue, caves) and Rust Slime (red, rocks).

Monster icons, animated in code: Red-cap and Mandrake (woods), Cave Bat (caves), Quarry Spider (caves and rocks).

New drops, all sellable: slime gel, red-cap, mandrake root and spider silk.

They replaced several wolf groups in the woods, caves and rocks. The other wolf groups remain, and wolves still never appear in town.

Fix: the battle HUD now shows the hero's name (Corin or Elowyn) instead of "Wren".

V41: wolves

All wolves now use the Pixel Monster Pack wolf in four colours, animated in code. Black is the Gaunt Wolf, Starved Hound and Scarred Alpha. White is the Cave Hound and Old Blind Hound. Blue is the Ley-touched Wolf. Green is the Thorn Hound.

Overworld wolves were enlarged slightly.

V42: ambient wildlife

North Woods only: 3 deer, 6 hares, 4 grouse and 2 foxes, spawned at random each day.

They are harmless, wander and idle, and run off when the player gets close (deer and foxes spook from the furthest).

Not yet used

Used from Act 2: skeleton, fire spirit, predator plants 2 and 3, robots (Destroyer, Infantryman, Swordsman), warriors and knights (bandits), wizards (Purifiers), orcs (Frozen Vale mercenaries), hunt animals and the loot icon packs.

Trees, ruins, dungeon and road tiles, guild hall, weapons and dialogue-portrait templates.

Music pack (xDeviruchi): licence terms to be checked before it goes into a published game.

## V43–V45: Music and Elowyn's walk

V43: music. Ten xDeviruchi tracks (gamedevmarket.net, free and open licence) play from compact MP3s that load on demand and crossfade between moments. Title and character creation: Title Theme. Intro slides and Oakhaven by day: And The Journey Begins!. Interiors and Oakhaven at night: Take some rest and eat some food!. North Woods and Southern Rocks: Exploring The Unknown. Caves: Mysterious Dungeon. The sealed cave: The Icy Cave. Normal battles: Prepare for Battle!. Boss battles: Decisive Battle. Dice and job minigames: Minigame. The town fire: The Final of The Fantasy (to be moved to the ending and credits once they exist). The studio splash is silent. Settings has a Music volume option (Off, Low, Medium, High; Medium by default). Each track loops as a whole file, so a tiny gap at the loop point is possible.

V44–V45: Elowyn's walk. Her front and back walk was only a 1-pixel bob, so it was rebuilt. V45 copies Corin's timing, measured frame by frame from his atlas: the head, body and boots rise by different amounts and the figure leans a pixel toward the stepping side, over the same eight-frame cycle.

## V46: Elowyn's walk, rebuilt

V45's copy of Corin's motion stretched her badly, so it was replaced. Her front and back walk is now a natural eight-frame step cycle. A leading boot lengthens instead of moving away from the hem, a rising boot slides up behind the hem, and the bob lifts her whole figure together. Rule (Ryan): no part of a character's body may ever come apart from the rest. The bake script now checks this by counting separate pieces in every frame, and it removed loose fragments left in her battle attack frames by the sword erase. The only frames with more than one piece are the two sword-swing frames, where the extra pieces are the slash streaks.

## V47: Side-on walking

Characters no longer have front or back walk animations. Every character walks side-on, left or right, even when moving up or down the screen, and turns to face the camera whenever they stop (after a very short pause so they don't flicker between poses). The game still tracks facing for talking, doors and interactions; only what is drawn changed. The chibi art stays as the game's style. A trial restyle of Corin in the craftpix wizard-sprite style (hooded, no staff, rune-sword at the hip) was made as concept art and set aside.

## V48: Opening slides and creator preview

The creator preview now only shows the side walk and the camera-facing pose. The seven opening slides are no longer separate painted scenes: each is a fixed shot inside the game itself, with the real tiles, lighting, film grain and chibi characters.

Slide 1: the North Woods at dusk, the Dread Expanse closing in from the edges.

Slide 2: the pillar in Oakhaven's square at night, with ley-lines and Old Tongue runes.

Slide 3: the Mayor's House by candlelight, a ledger writing itself.

Slide 4: a storm over the workshop, with a bundle on the step.

Slide 5: the workshop by day, the hero as a child at the trade's station with the master nearby.

Slide 6: the hero and Tessa as children walking to the well at dusk.

Slide 7: the workshop at night, the master's book with the ink moving on its own.

The caption text is unchanged.

## V49: Corin hairstyle and face marks removed

Corin's creator no longer offers Hairstyle or Face marks. Skin and Eyes remain. Corin keeps the spiky cut with no marks.

## V50: Flame sound and tap-to-begin

The studio splash now has a synthesised flame sound (whoosh, crackle, low bed) that follows the music setting. A tap-to-begin screen comes first, and the tap unlocks audio.

## V51: New opening, revised map, Clerk-only start

Opening slides

Slide 1: Ryan's own map of Talvora, pixelated and grimmed, with in-engine pixel labels (Talvora, Etharis, The Frozen Vale, Felbrin, The Ringval Wilds, Durte, The Dread Expanse). Etharis's outline glows.

Map fixes: a small land bridge joins the Frozen Vale to Etharis. The Dread Expanse, the middle island, is smaller and touches no country.

Slide 2: the leylines scene, text split over two taps.

Slides 3 and 4: the Weaver hall and the storm with the bundle, using Ryan's text.

Last slides: "Nineteen winters" in the workshop, then a dream of the hero revered by the whole town at the pillar.

Player identity

The player is always a Quill-mark and always the Clerk's apprentice. The guild choice is removed and the creator is two steps (Who you are, Look).

Other trades remain in the code for their NPCs. Older saves keep their original trade but show the Quill-mark surname.

Movement and facing (V52)

Idle characters keep the direction they were walking. Walk animations toward the camera are allowed; walking away from the camera is never animated (the character turns side-on instead).

Elowyn (V53–V55)

Her sprite is the original, unaltered sword sprite. Side views are unchanged from the original.

She has a front-facing view with the sword and two legs that walk normally. Her up-facing is always drawn side-on.

Mentor and the house (V56)

The mentor is always Odile, a woman. She is no longer random.

The mirror moved to a reachable spot on row 1 of the house, with the shelf in front of it relocated.

Act 1 sweep and Odile's sprite (V57)

A full Act 1 sweep fixed pronoun, name, forge, cutscene-position and look-text issues. Every interactable on every map is checked for reachability.

The four lines about being left as a baby now say "on the steps of a house", matching the intro slide.

Odile has a new sprite: steel-grey hair in a tight bun pinned with a quill, a stern face with fine lines, an ink-blue high-collared dress with a linen collar, a dark belt and a pen case. She has front, back and side views and a dialogue portrait.

Creatures and bosses

The skeleton is on hold until the player is out in the wider world.

The plant creature becomes a boss deep in the woods. Defeating it rewards a unique sword.

Open items

Some back-wall decorations (paintings, herbs, cloths, shelves, tools) cannot be inspected, though they show no prompt.

Audio and the final look of the map on a real device are unverified.

North Woods expansion (V58)

A new trail at the top edge of the North Woods leads north to two new places, reached in order: the Mossed Ruin, then the Heartwood Grove.

The Mossed Ruin is a broken Old Tongue stone hall, overgrown with moss. It has a south gate, a north arch, fallen pillars, glowing mushrooms, herb patches, a chest and a stone post to read. Wild encounters here include redcaps, mandrakes and thornhounds, with leywolves at night.

The Heartwood Grove is a round clearing reached through the ruin's north arch. The boss stands in the middle of the clearing and a chest holding the reward sits behind her.

The Thornmother (boss)

She is Plant 1, the red pitcher plant, from the supplied craftpix Predator Plant Mobs pack, grimmed to the game's palette.

She is rooted: she does not chase. Walking up to her starts the fight.

She is level 7 with 320 HP, weak to fire and wind, and resistant to growth, life and cold.

Her reward chest holds Thornwake, a unique sword (attack 7, against 3 for the old sword). Its icon is currently the old sword recoloured green, and a redraw is still open.

Plants 2 and 3 from the same pack remain unused for other creatures later.

Process note

Check the supplied asset packs before drawing any new creature. The first Thornmother was hand-drawn by mistake and was replaced with the pack art.

Game title (V59)

The game is now called Unwoven: A Tale of Talvora. It is short, one word, and leaves room for a subtitle on a possible second game.

"Unwoven" describes the hero at the start: an orphan Clerk's apprentice who has not yet learned to weave. It stays neutral between the three factions and endings.

The title screen, the browser tab title and the landscape notice use the new name. Durinn remains the name of the world in the story. Save data keys are unchanged, so existing saves still load.

Still to do: search the app stores and Steam to confirm the name is free.

Act 1 polish (V60)

Every wall decoration (paintings, herbs, cloths, tools) can be inspected. Looking at furniture below one adds an "On the wall above" line; a few wall pieces moved a tile along their wall. The vestry desk moved one tile left so the room is no longer cut in half. The ruin-to-woods arrival no longer lands on a tree.

Balance was checked by simulation. The Thornmother is now level 6 with 250 HP and 13 attack, so a solo player can win at level 5 with the sword or level 4 with fire magic. The Scarred Alpha stays an optional fight for about level 4–5.

The tap screen shows "Loading" while the town is built, instead of ignoring taps.

"Final of the Fantasy" now plays over a new End of Act One credits card. The burning town uses the boss track.

Slide 4 now names Odile's copy house. Slide 5 now calls Tessa Bram's niece, taken in the same winter the hero was left, matching the game.

Bridges have posts and a two-beam rail. Night is slightly less dark, and the player carries a soft glow outdoors.

The Thornwake icon is redrawn as a moss-green blade with pale thorns and a vine-wrapped grip.

Still open: the town lawn (the specific issue still needs to be identified).

## Act 2 summary (current, consolidated)

Status: planning only, nothing built. This section collects the decisions made in the Act 2 sections below, which hold the detail. Where an older section disagrees, this summary and the later sections win.

### Premise

Odile has died, Tessa joins the party, and the two leave Oakhaven by the east gate for Ashford. The world opens: Ashford and Greywick, two Pillar towns on the Open Plains, two light forests, and the way north to Fort Frostcrown. Act 2 ends with the party heading south into Act 3.

### Factions and lore

"Weaver" means anyone who can cast; it is not a faction.

The Archon Covenant keeps Etharis as it is, with the secret of magic hidden (colours: purple with a gold sigil). The Unbound want to reveal the secret and dismantle the Covenant (yellow with a red sigil, a snapped thread). The Purifiers (the extremists, including Kellan Vex) want to destroy magic at any cost, even by using it. The player can join all three, the Purifiers are the hardest, and joining is saved for Act 3.

Arbitrator Isaura Thorne is a woman. Arden Rose is a dormant lich king reserved for an expansion. The orcs in Act 2 are mercenaries hired by the House in the Frozen Vale.

The hero's tome is secret and not a normal tome. Torn pages hold the forbidden roots; the first torn page is found in Act 3 and Ulric hints at a stolen southern tome (incomplete) before the party goes south. The Covenant would lock the hero up for having it.

### Party

The hero (Corin or Elowyn): the damage dealer through magic. Weapons are foci that add MAG and a spell bonus with a small ATK; Basic Attack stays as a breath-regaining fallback.

Tessa: sword, buffs and debuffs (Rally, Steady, Quickstep, Hinder, Rattle, Mark).

Hakon Redfell: joins at Ashford in the Purple Thistle at Night. A tank who taunts and hits hard but slowly. His brother Arthur was taken by bandits; the trail runs from the east forest through southern Etharis to Capital City.

Companions change only by gear.

### Areas, sizes and levels

Area

Size

Levels

Notes

Open Plains

about 190 by 110

7 to 10

Largest. Main path to the Fort, spurs to Ashford and Greywick, camps, landmarks, golem, field Pillars. Snow bands run green to full snow going north.

West Forest

about 90 by 55

7 to 9

Ruins, a scholar, skeletons by Night. Worn Covenant Construct (level 9, two phases) guards a chest with the Weaverplate Cuirass.

East Forest

about 90 by 55

10 to 12

Five-stage bandit camp with orc mercenaries, a tarped Pillar rest fire, and the Iron Cleave (level 12, two phases) on a coastal bluff.

Ashford

about 56 by 68

town

Covenant-leaning, lively. Curate Voidsong, the Purple Thistle (Winnie Fenn), Hakon.

Greywick

about 56 by 68

town

Unbound-leaning, run down. Lampwright Gideon Marsh and the Pillar Keystone quest.

Frostcrown Outskirts

about 100 by 60

12 to 13

South gate (toll), north gate (search), a secret entrance on the west flank with nobody near. Rimefang (level 14) lairs in the north-west tor at Night.

Fort Frostcrown

about 170 by 100

safe

Second largest. Arbitrator Ulric Icetoe. Market, barracks, sparring (Captain Ysolt Rennick), Weaver hall, storehouse, lower quarter. No combat except sparring.

### Story flow (ten chapters)

Leaving Oakhaven

The road to Ashford

Ashford: Voidsong, Hakon and the sabotaged Pillar

The open plains (4a West Forest, 4b East Forest)

Greywick: the Keystone request

The Outskirts

Fort Frostcrown and Ulric's two quests

Quest 1: the letter to Old Maud, rebuilt Oakhaven and the Odile memorial, fast travel (Mem-it)

The Keystone returns to Greywick

Quest 2 and leaving south

### Systems

Pillars and day/night: the player swaps Day and Night only by resting at an activated Pillar (the Oakhaven Pillar starts activated; others activate on first touch). A Pillar also restores HP and MP, saves, sets the respawn point, lets the player craft and study, and respawns regular enemies (not bosses, mini bosses, the golem or cleared chests). A centre-screen pop-up introduces this at the start of Act 2. Day and night change which enemies appear and when quests progress. Nothing is time-locked forever: waiting always works.

Inns: resting at an inn also swaps time, restores, crafts and studies, but enemies do not respawn and every night costs coins (Ashford 30, Greywick 40, Fort 25).

Fast travel: after Old Maud teaches it in chapter 8, touching a Pillar and saying Mem-it travels to any Pillar the player has visited. It adds no notoriety.

Study: Thread Study, a short two-step mini game with mastery marks (small spell bonus) that cannot be played near the Covenant. Words from The Tellers' Primer: Ver, Cogn, Sens and the suffix -ix. Sens displays enemy health.

Crafting: at any activated Pillar, three tracks (brewing, making, upgrading at a town forge), about 12 to 15 recipes, no failure or time cost, and a crafted item never sells for more than its materials.

Economy: shops charge well above loot value, merchants have limited coin purses, prices fall for large stacks, and quest rewards scale with level. No carry weight, stacks cap at 999.

World rules: picked herbs vanish and regrow randomly; chests open with an animation and stay open; wolves only in woods, rocks and caves; skeletons only at Night in ruins and at the standing stones.

Audio and access: a lower default volume, audio sliders and a full accessibility menu ship with the Act 2 release.

### Bosses and unique loot

Encounter

Where

Reward

Worn Covenant Construct (Lv 9)

West Forest ruins

Weaverplate Cuirass (guard bonus: reduced damage when guarding), key, iron scrap

Rock golem (Lv 10)

Plains standing stones

Stone heart, cache

Iron Cleave (Lv 12)

East Forest bluff

The Tellers' Primer, Hakon's cleaver, bill of sale (Arthur's clue), House signet ring

Rimefang (Lv 14, optional)

Outskirts tor, Night

Rimefang Pelt, alpha's fang

Camp captains

Ambush camp, Rook's Hollow, Purifier camp

Chests and tier gear

### Act 1 changes to make when building starts

Tessa's end-of-Act-1 line: the Arbitrator only points the player to Ashford for shelter and supplies, so the book stays secret (approved).

One optional foreshadow line from Old Maud about her son (approved).

Oakhaven's east exit gains the closing wooden gate, and Oakhaven gets a rebuilt-town map variant with the Odile memorial.

No day/night tutorial in Act 1; that is introduced at the start of Act 2.

### Open items

Ulric's backstory and exactly what he says about the stolen southern tome and the first torn page.

Whether Voidsong's name hints at the forbidden root Nihil.

Purifier clues across the plains, and how the player reaches the Purifiers in Act 3.

Whether Hakon keeps Sanguis casting, and whether Mem-it adds Mem to the spell words.

The scholar's name at the West Forest ruins.

Where the Fort's inn is (market inn, barracks bunk and lower-quarter hostel all appear in the plans).

Tessa's sword sprite and the bandit archer's code-drawn bow need concept art approval.

Real-device checks of touch controls, audio and portrait layouts, and a check that the name "Unwoven" is free.

Per-item coin values and exact stats are a first pass, to be tuned in play.

## Act 2 plan: The Plains and the North (planning only, nothing built)

Status: planned, not built. Act 2 begins when Act 1 ends: Odile has died, Tessa joins the party, and the two set off for Ashford, the first town on the road.

Factions (supersedes earlier faction names). "Weaver" is simply the word for anyone who can cast, whether they serve the Covenant or the rebels, so it is not a faction. The three joinable factions are:

Faction

Aim

The Archon Covenant

Keep Etharis as it is, under their control, with the secret of magic kept a secret.

The Unbound

Reveal the secret to the world and dismantle the Covenant.

The Purifiers (the Extremists)

Destroy magic at any cost, even by using it themselves. Kellan Vex belongs to them.

The player can join all three, and the Purifiers are the hardest to join. Vex himself stays hidden and cannot be joined. Act 2 only plants Purifier clues (rumours, signs, traces); actual joining is Act 3. Older sections of this document that say Weavers or Liberators should be read as Covenant and Unbound.

Geography (follows the Talvora map strictly). Oakhaven is in the northwest of Etharis. The route runs east, then north-east across the open plains in central Etharis. Fort Frostcrown sits at the northern tip of Etharis where it meets the land bridge to the Frozen Vale. Capital City lies southeast of the route and is not reachable in Act 2. The west forest runs toward the southwest mountains. The east forest runs toward the east coast, with the Dread Expanse visible across the water.

Snow gradient. The environment changes as the player travels north: green grass in the south plains, frosted grass and bare trees in the mid plains, patchy snow with drifting flakes and visible breath in the north plains, and full winter in the Outskirts and the Fort, each with its own music and colder lighting. Enemies get snow re-skins.

Areas

Area

Size (suggested, tiles)

Contents

Open Plains

Largest, about 190x110 (about 3x the North Woods)

Two pillar towns, roaming bandits, hostile and friendly camps, hostile and friendly wildlife, side quests, loot, the rock golem mini boss at a ring of standing stones

West Light Forest

About 90x55

Branches off the plains toward the southwest mountains. Mini boss: the Worn Covenant Construct (Robot pack Destroyer, grimmed), with the Weaverplate Cuirass

East Light Forest

About 90x55

Branches off the plains toward the coast. Mini boss: the Iron Cleave (Knight pack, grimmed), with The Tellers' Primer and Hakon's cleaver

Frostcrown Outskirts

About 100x60

Separate area outside the Fort. North gate, south gate and a secret entrance, with Covenant guards outside the gates

Fort Frostcrown

About 85% of the plains, about 170x100

Large Covenant outpost run by Arbitrator Ulric Icetoe. Second largest area in Act 2. Always called Fort Frostcrown since it was built

For scale, the North Woods is 108x60 tiles and the Southern Rocks 100x50. A plains map about three times the largest existing one needs a check on drawing and foe-count budgets before it is built. All the mini bosses (rock golem, Worn Covenant Construct, Iron Cleave, Rimefang and the camp captains) use art from packs already supplied (Robot, Knight, Rocks, wolf, Warrior, Wizard), grimmed to match the game; nothing is drawn from scratch.

Plains content

Ashford: a pillar town on the way to the Fort, with a small Covenant outpost. The townsfolk mostly support the Covenant. Act 1 keeps naming Ashford as the destination; on arrival the player is directed north to the Fort. Ashford has always been separate from the Fort.

Greywick: the second pillar town, further along where the snow begins, with an Unbound outpost. The town leans Unbound.

Pillars act as safe points: saving, switching between day and night, restoring HP and MP, respawning regular enemies, crafting, studying (away from the Covenant) and, after Maud, fast travel.

Bandits use the Warrior or Knight packs, grimmed. Wolves stay out of the plains (they belong to woods, rocks and caves). Hostile plains creatures are slimes, wild boars and field rats by Day, and skeletons and Purifier scouts at Night; friendly wildlife is the hunt animals.

Rock golem: an optional mini boss that wakes when the player takes what the standing stones guard. Unique loot.

Side quests: one of them reveals the secret entrance to the Frostcrown Outskirts and Fort.

Kellan Vex and the Purifiers appear only as rumours, signs and traces.

The three entrances

North gate: a checkpoint that searches travellers. The Covenant hides books about the old magic, so carrying the tome is a real risk here.

South gate: a trade gate with a coin toll and less scrutiny.

Secret entrance: found only through the plains side quest. No guards, no NPCs and no roaming bandits near it, so it feels cut off.

Level range. Act 1 ends around level 6. Plains 7 to 10, West Forest 7 to 9, East Forest 10 to 12, Outskirts 12 to 13 (Rimefang 14), Fort sparring 12 to 14.

Companions in Act 2

Tessa Hollis: Bram's niece from the Hollow Oak (not a Clerk's apprentice). Her look does not change. She starts with a sword as her weapon, shown in hand on her sprite (new weapon art needs concept approval before building). Suggested origin: the old blade Bram keeps behind the bar.

Role: buffs and debuffs, not healing. Tavern-born tricks: Rally (a rousing song, attack up), Steady (a hot meal, defence up), Quickstep (a fiddle jig, speeds allies' turns), Hinder (a spilled tray, slows a foe), Rattle (a heckle, lowers attack) and Mark (she reads a foe's tells, lowers defence). The sword is her light attack.

Sustain: with no healer, Act 2 healing comes from potions, the player's own magic and resting at pillars. Balance needs a check before building.

Companion customization: gear changes only (weapon, head, body, charm), shown on their sprites. No colour options.

Still open

How the player reaches the Purifiers (saved for Act 3).

(Resolved: Weaverplate Cuirass, The Tellers' Primer, Hakon's cleaver, Rimefang Pelt.)

The Fort's layout and main quests, and the Covenant, Unbound and Purifier intro quests.

The sword sprite for Tessa and the standing-stone ring layout, both of which need concept art approval first.

### Open Plains: detailed layout (planning only, nothing built)

The proportions below are approved. A layout diagram (plains_layout.png) was shared in the conversation. Coordinates are tiles on a 190 by 110 map, x east and y south, north at the top.

Entrance. The player leaves through Oakhaven's east gate (the existing "East road: Ashford and the outer provinces" sign) onto the plains' west edge at about (3, 78). Act 1 text about Ashford and its Weaver outpost still works, because Ashford's outpost is the Covenant's caster outpost. No Act 1 change is needed.

Paths

Main path: wide and clearly worn, about 200 tiles. Gate (3,78), then (22,76), (44,72), (70,66), (92,62), (108,52), (114,44), (128,30), (140,16), and out the north edge at (150,0) into the Frostcrown Outskirts.

Town spurs (slightly narrower): to Ashford from the main path at (44,72), arriving at (58,78); to Greywick from the main path at (114,44), arriving at (98,32). Neither town sits on the main path.

Trails (narrow dirt tracks): west forest from (22,76) to the south edge at (14,110); east forest from the crossroads at (92,62) east to the edge at (190,70); standing stones south to (92,86); Rook's Hollow from (130,66) south to (130,90); hunters' camp from (22,76) to (28,56); ambush camp from (70,66) to (60,44); traders' camp from the crossroads to (84,58); Wayfarers' fire from (128,30) to (140,52).

Snow bands by latitude (y). South of y 66: green plains (Ashford, the start). y 46 to 66: frosted grass, bare trees, a first dusting. y 24 to 46: patchy snow (Greywick). North of y 24: full snow, ending at the Outskirts.

Places

Place

Position

Notes

Ashford

(58,78)

Pillar town, small Covenant outpost, townsfolk mostly support the Covenant

Greywick

(98,32)

Pillar town, Unbound outpost, the town leans Unbound

Hunters' camp

(28,56)

Friendly; wildlife tips and hunting side quests

Traders' roadside camp

(84,58)

Friendly; buy and sell

Wayfarers' fire

(140,52)

Friendly; starts the secret-entrance side quest

Ambush camp

(60,44)

Hostile bandits, small loot

Rook's Hollow

(130,90)

Hostile bandit camp, the best loot on the plains

Standing stones

(92,86)

Optional rock golem mini boss, unique loot, wakes when the guarded item is taken

West Light Forest

south edge (14,110)

Worn Covenant Construct mini boss

East Light Forest

east edge (190,70)

Iron Cleave mini boss

Landmarks along the paths

Mile markers: stone markers about every 25 tiles along the main path, counting down the distance to Fort Frostcrown.

Ruined farmstead (34,74): early and close to the road. Light loot and a few lines about the Covenant tithe.

Signposts at each junction: at (44,72) for Ashford, and at the crossroads and the Greywick turn.

River crossing and stone bridge (78,65): a river runs north to south across the road, with a lone Covenant patrol at the bridge.

Crossroads watchtower ruin (92,62): a roadside waystone shrine and signs for the east forest, the stones, Greywick and the Fort.

Burned wagon with a Purifier mark (108,52): a clue that Vex came this way, going north.

Overlook hill (114,44): the first view north to the snow, at the Greywick turn.

Frozen pond (134,22): the first ice, in the snow band.

Covenant boundary stone (146,6): where the plains end and the Outskirts begin, with two mounted patrols.

Danger along the road. Bandits stay mostly off-road, and the road is safest near the towns. The riskiest stretch is the middle, from the crossroads to the Greywick turn, where bandit patrols cross the road. North of Greywick the road returns to Covenant patrols. Danger there comes from the cold and the snow wildlife instead. Level bands: Oakhaven to Ashford 7, the middle road and camps 8 to 9, Greywick and the north plains 9 to 10, Rook's Hollow and the golem 10.

Technical note. At about 21,000 tiles this is the largest map in the game, so it needs a performance check (drawing, collision and foe counts) before it is built. Pillars and towns are separate maps entered through warps, like the existing interiors.

### Act 2 light forests, Hakon and the starting-words change (planning only, nothing built)

Both forests are about 90 by 55 tiles. A layout diagram (forests_layout.png) was shared in the conversation.

West Light Forest: the Weaver construct

The trail enters from the plains at the north end and winds south to a ruined stone courtyard in the southwest. A side loop passes a friendly glade (deer and hare), a mandrake patch, a wolf den off the trail, herb patches and a mossed shrine. Wolves are allowed here (woods).

The construct is dormant among the ruins, looking like a rusted statue, and wakes only when the player tries to open the chest it guards. Art comes from the Robot pack, grimmed.

It is worn down: level 9 with 340 HP (it is the Worn Covenant Construct), a damaged limb that limps and slows it, a heavy slam that telegraphs, and an arm shot that sometimes misfires. It fights in two phases (Overdrive below 50 percent; see the West Forest table). Weak to storm and wind, resistant to stone and light.

Defeating it drops the key. The chest is locked until then, and holds a unique piece of body armour.

The armour is the Weaverplate Cuirass: Weaver-forged plate that is warded, so iron does not ground the wearer's workings, with reduced damage when guarding.

East Light Forest: the Iron Cleave

A left-to-right gauntlet through the bandit camp in five stages: (1) the Outer Watch, (2) the Palisade Gate, (3) the Lumber Yard and Tents, where a tarped Pillar gives the rest fire, (4) the Captive Pens, and (5) the War Camp and Bluff Path, with a small second Pillar at the foot of the bluff. Each stage has side loops with extra chests.

The boss, the Iron Cleave, waits on a coastal bluff at the end, with the Dread Expanse in view across the water. Art comes from the Knight pack, grimmed.

Bandits and mercenaries rise from level 10 to 12 through the camp and the Iron Cleave is level 12. By then the player should be several levels higher with decent gear and the second companion, so the fight is harder than the Thornmother.

Two phases at 50 percent health: the Knight (shield and Protect stance), then the Cleaver (no guard, whole-party Cleave, Rend), with Orc mercenaries from the House in the Frozen Vale beside him. Tessa's Mark and Rattle matter here.

Reward: The Tellers' Primer (truth and thought workings: Ver, Cogn, Sens and the suffix -ix), the first clue to Arthur, Hakon's unique cleaver and a House signet ring.

Rook's Hollow on the plains is suggested as the Iron Cleave's supply camp; clearing it could reveal a back route into the forest camp.

Hakon Redfell: second companion, recruited at Ashford

Hakon, a Frozen Vale sellsword, is in Ashford's tavern, drinking alone.

If the player asks the tavern keeper for work or directions, the keeper sends them to Hakon, who is looking for someone to help him find someone important to him. The player can also go straight to Hakon without talking to the keeper first.

Hakon offers his services if the player promises to help him. That promise starts his first companion quest.

Role: tank. He taunts enemies, takes a lot of damage and hits hard, but attacks slowly. (Open: whether he keeps Sanguis casting; as a pure tank he does not need it.)

He joins in Ashford, early on the road, well before the east forest. The party from Ashford on is the player, Tessa (buffs and debuffs) and Hakon (tank). Plains balance needs a check with three in the party.

Open: who he is looking for, and where that leads (a link to Fort Frostcrown is one option).

Starting words (decision reversed). The idea of giving the player fewer starting words was dropped. What the player starts with in Act 1 is plenty, so Act 1's words, balance and tutorial stay as they are. The Iron Cleave's tome is The Tellers' Primer.

Hakon's quest: the search for Arthur (planning only; this supersedes the open question above about who he is looking for)

Hakon is looking for his brother, Arthur, who was taken by a group of bandits several years ago. Hakon has searched ever since, and was recently tipped off about where Arthur might be.

Hakon does not say this at first. In Ashford he only says he is looking for someone important to him. His brother's name and story come out gradually through camp dialogue as the quest goes on.

The quest is a chain of places that each hold clues pointing to the next place to search.

Part 1 (Act 2): the tip leads to the bandit camp in the east forest, the Iron Cleave's camp. The player fights through the camp, and at the end finds the first clue, which points to an area that will appear in Act 3. The quest continues in Act 3.

Suggested beats: Hakon's promise and the tip in Ashford; a small first lead at Rook's Hollow (the supply camp, where a note also reveals the back route into the forest camp); the rest fire in the forest, where Hakon tells the player about Arthur; and the clue after the Iron Cleave falls.

Open: whether the Iron Cleave's band is the one that took Arthur, and what Act 3 area the first clue points to.

Arthur's trail (decided; supersedes the two open points above)

The Iron Cleave's band held Arthur for a short while before selling him to another band. The first clue, found at the end of the east forest camp, points to that band and so to the next place to search.

Act 3 is expected to take place in southern Etharis. All the other countries stay reserved for expansions, which fits the first release covering Etharis only.

Arthur ends up in prison in Capital City. The quest therefore runs from the east forest, through southern Etharis in Act 3, to Capital City, which is also where the finale is set.

Act 3 itself will be planned when we reach it.

### Act 2: Frostcrown Outskirts and Fort Frostcrown (planning only, nothing built)

A layout diagram (outskirts_fort.png) was shared in the conversation.

Frostcrown Outskirts (about 100 by 60 tiles)

A ring of snowy ground around the Fort's walls. The player arrives from the plains at the south.

The south gate is the toll gate, straight ahead on arrival. The north gate is the search checkpoint, reached by following a flank road around either side of the walls. Covenant guards stand outside both gates, with guard posts beside them and no enemies nearby.

The secret entrance is on the west flank, in a cleft of rock far from any guard post, with no one around. It leads into the Fort's kitchen undercroft.

Not much happens here: a wagon queue, a wayside shrine and a patrol notice board near the south gate. At the north end a Covenant barricade blocks the road to the Frozen Vale, a hook for a later expansion.

Enemies are found away from the gates: snow slimes and bats on the west flank, raiders and deserters on the east, frost slimes in the northeast, and wolves and bats only at a rocky tor with a small cave in the northwest (wolves stay in woods, rocks and caves).

Fort Frostcrown (about 170 by 100 tiles)

One walled map, only slightly smaller than the plains, with a main road from the south gate through Pillar Square to the north gate. It is a safe zone with no enemies, and its buildings are interiors like Oakhaven's.

Districts: Pillar Square and chapel (centre); the market (south: stalls, provisions, smith, apothecary, inn); the command post (north, where Arbitrator Ulric Icetoe stays and directs the fort, with the holding cells below); the barracks, training yard, armoury and forge (east); the kitchens, mess hall, stores and undercroft (west, where the secret entrance comes in); the Weaver hall (northwest: casters and grey-cloaked inspectors); the lower quarter (southwest: workers' homes, grim, since lower-status people are treated badly even inside the walls); and rampart stairs and wall walks (northeast).

The training yard allows sparring: the player can fight practice bouts there.

This is where the player is truly introduced to the Covenant for the first time: seeing them train, talk and manage the northern region.

Arbitrator Ulric Icetoe

Strict and firm, but polite and gentle when needed. He runs a tight fort and treats his people with respect. He specializes in fire magic.

Joining the Covenant: two quests from Ulric

Ulric gives the player two quests to complete before they can join the Covenant officially.

Quest 1: takes the player back to the plains, possibly back to Old Maud to collect something only she would have. Note that Maud's cottage is in the North Woods, at the end of the trail north of Oakhaven, so this is a long trip back through the plains and Oakhaven. Pillar fast travel would help.

Quest 2: takes the player to the southern region, into Act 3.

Act 3 scope (to plan when we get there)

Act 3 should be the largest place built so far, with two cities, several settlements and plenty to do. It is set in southern Etharis.

### Covenant quest 1: the letter to Old Maud, the closed gate and fast travel (planning only, nothing built)

This supersedes the earlier open questions about Quest 1 (decided: it goes to Old Maud).

Old Maud is Ulric's mother. Ulric gives the player a letter to deliver to her.

The closed way back

When the player crosses into the plains from Oakhaven's east gate, the way back is blocked until Ulric gives this quest. If the player tries to return, a wooden gate is shut and a guard says it is best to come back later: the town needs to rebuild after it was wrecked.

Once the quest is given, the gate opens.

Returning to Oakhaven

Some buildings have been rebuilt. The townsfolk are cold toward the player, because they blame the player for what happened.

They will talk, but no one except Bram will deal with the party.

Resolved: yes, a memorial or grave.

At Maud's cottage (North Woods, end of the trail)

The player delivers the letter. Maud is touched, says she misses her son, and says he is a good man who can be trusted.

She gives the player a shipment of healing supplies to take back to the Fort.

After that she explains fast travel.

Fast travel

Introduced by Old Maud. By touching a pillar and reciting a word, the player can travel to any pillar they have been to before.

She suggests trying it at the Oakhaven pillar, to get back to the Fort.

Resolved below: Mem-it, and no notoriety.

Quest flow: Ulric gives the letter and the gate opens; the road back to Oakhaven; a cold reception, with only Bram dealing with the party; the North Woods and Maud; a trip back to the Oakhaven pillar and the first fast travel to the Fort; delivery of the supplies to Ulric, which completes the quest.

Continuity notes

Act 1 currently shows Maud only as a hermit witch who teaches Bary-is. Making her Ulric's mother needs no change, but one optional foreshadowing line in Act 1 would help.

The closing gate is new work at Oakhaven's east exit, and the rebuilt-Oakhaven state is a new map variant.

Tessa is Bram's niece, so the cold reception is also a personal moment for her.

Covenant quest 1: decisions (these close the open items above)

Fast travel word: the pillar phrase is Mem-it, from the root Mem (memory) with the suffix -it (an instant snap with no weaving, which cannot be ruptured). It fits because the player travels to a pillar they remember. Maud teaches it as a fixed phrase. Whether it also adds Mem to the player's spell words is still to be decided.

Notoriety: fast travel does not add to the player's notoriety signature.

Odile memorial: the rebuilt Oakhaven has a memorial or grave for Odile.

Act 1 foreshadowing: Old Maud gets one optional line in Act 1 hinting at her son, for example that her boy writes when he remembers. This is a small Act 1 text change, to be made when building starts.

### The Archon Covenant rank structure (lore, from Ryan)

The Archon Covenant governs the Weaver Order through a rigid four-tier hierarchy designed to preserve its monopoly on magic and conceal the true history of the Old Tongue and The Divide. Authority and arcane knowledge are strictly compartmentalized from the top down, so public-facing members genuinely believe in the institution's benevolence while a secretive leadership class keeps absolute control.

Tier

Role

The High Council (Archons)

The secretive ruling body: nine leaders based in the Great Sanctum in Capital City. They hold complete authority over the Covenant and guard its deepest secrets, including the true nature of the Old Tongue and the location of The Divide.

Arbitrators

The inquisitorial arm and judicial enforcers. They travel the provinces to conduct inspections, monitor Leyline Pillars, recover magical contraband, hunt down unsanctioned magic users and enforce Covenant law.

Weaver Curates

The public-facing branch and civic servants of the Order. They give everyday aid to commoners, such as healing and infrastructure repair, and are kept largely ignorant of the High Council's deceptions, so their genuine goodwill reinforces public trust.

Initiates (and Scholars)

Young recruits raised and educated in Weaver Sanctums. They learn the Old Tongue by rote and are taught that magical ability is a rare biological gift rather than a learnable skill, which anchors the Covenant's control from the ground up.

### Act 2: Ashford (planning only, nothing built)

A layout diagram (ashford_layout.png) was shared in the conversation.

Character of the town

The player's first real contact with the Covenant. Ashford leans heavily toward supporting them: Covenant flags and banners are everywhere, and Covenant members are frequently seen walking around.

It is otherwise a normal, lively town, slightly larger than Oakhaven. Oakhaven is 48 by 60 tiles, so Ashford is about 56 by 68.

Ashford is a pillar town on a spur off the main plains path.

The outpost and Curate Voidsong

A small local Covenant outpost, run by Curate Voidsong, who specializes in darker magic. Despite that, she is very bubbly and welcoming.

As a Curate she belongs to the public-facing tier, so she sincerely believes in the Covenant and knows nothing of the High Council's deceptions.

Layout (first proposal)

Main gate in the northwest where the plains spur arrives, a farm gate in the east, and a south lane to the fields.

Pillar Square in the centre. The Covenant outpost faces it from the north. A tavern and inn sit to the east (Hakon drinking alone inside). The chapel is to the west, with the notice board where a leaflet was torn down in Act 1.

A market row south of the square (provisions, apothecary, smith, tailor), a cooper (Tarn and Son, who was away at Ashford in Act 1), and homes, a mill and a well in the south.

Continuity with Act 1

Ashford buys wolf fangs and spider silk. Its Pillar went dark for a whole night a month ago. Four grey-cloaked Weaver inspectors rode out there recently. The chapel door had an Unbound-style leaflet torn down by the Curates. The Arbitrator in Act 1 told the player the Ashford outpost might know what the tome is.

Open

The Covenant's colours (Covenant Grey with a silver sigil is the working idea), Voidsong's roots, the tavern and keeper names, and how Voidsong sends the player on to the Fort.

### Ashford decisions, the tome's secret, audio and accessibility (planning only, nothing built)

Ashford decisions

Covenant colours: purple with a gold sigil, on the banners and flags that fill Ashford. (Open: Act 1's Isaura Thorne wears Covenant Grey, so the suggestion is that grey cloaks mark Arbitrators and inspectors, and purple and gold is the Covenant's flag and Curate colour.)

Curate Voidsong's roots: approved. She uses the sanctioned dark roots Tenebr (shadow), Mut (silence) and Somn (sleep). The idea that her name hints at the forbidden root Nihil was not decided.

The letter of introduction: Voidsong gives the party the letter to Fort Frostcrown only in exchange for help. The help is investigating why Ashford's Pillar has been flickering lately.

The tavern and its keeper: see the decisions below (the Purple Thistle; keeper Winnie Fenn).

Story note: the tome is a secret

The hero's tome (Corin's, or Elowyn's if the player chose her) is not a normal tome, and having it must stay secret. The hero slowly finds this out by studying it.

Each new word the hero learns is recorded in the tome. Pages have been ripped out.

The hero must find the torn pages scattered around Talvora and study them, and discovers that they hold the restricted, dangerous words (the forbidden roots).

The Covenant is looking for the tome. The hero must hide that they have it, because the Covenant will lock them up for having it, even if the player joins the Covenant.

Continuity problem to resolve: at the end of Act 1 Tessa says the Arbitrator thinks the Ashford outpost will know what the book is and that the player should go there. That conflicts with the tome being secret, so that Act 1 line needs a change when building starts.

Open: how hiding the tome works in play (scripted choices at searches, or a systemic scrutiny meter), what happens if the player is caught (one option is a locked-up scene in the Fort's cells), and when Tessa and Hakon learn what the tome is.

Audio

A tester reported the music was too loud when the game first started. Plan: start at a lower default volume and add audio sliders in the settings. Today the settings have only four music presets (Off, Low, Medium, High) with Medium as the default.

Accessibility

A full accessibility options menu in the settings. Proposed groups: Vision (text size, high contrast, colour-blind modes, larger UI, a readable font option), Motion (reduce motion, no screen shake, reduced flashing and particle effects), Audio (master, music and effects sliders, visual cues for important sounds), Controls (joystick size and position, left-handed layout, larger buttons, one-handed mode, haptics on or off), Reading (text speed, auto-advance dialogue, a dialogue history log, clearer quest objectives) and Battle (the existing wait mode and auto-release, slower battle speed, auto-target and tap-to-target).

Decisions (these close the open items in the section above)

Ashford's tavern: The Purple Thistle, run by Winnie Fenn (loud and kind, treats everyone like family), who sends the player to Hakon. Greta Mallow, proposed earlier, is replaced.

Hiding the tome: scripted choices in Act 2 (hide it, lie or take a risk at searches such as the north gate). A scrutiny meter, where Covenant places and Arbitrator inspections raise the risk, starts in Act 3.

Act 1 line change: approved. Tessa's end-of-Act-1 line changes so the Arbitrator only points the player to Ashford for shelter and supplies, and the book stays secret.

Audio: the lower default volume and the audio sliders ship with the Act 2 release, together with the accessibility menu.

### Act 2: Greywick and the Unbound (planning only, nothing built)

A layout diagram (greywick_layout.png) was shared in the conversation. The Unbound rank structure below is a proposal, since Ryan asked for help creating it.

Character of the town

The same size as Ashford, about 56 by 68 tiles. It supports the Unbound in their revolt against the Covenant.

The Unbound's colours are yellow with a red sigil (working idea for the sigil: a snapped red thread, echoing the game's title).

It is more run down than Ashford, because it has been cut off from the Covenant and its resources, but the people get by: broken fences, patched roofs, shuttered homes and patches of snow.

The people are standoffish, reserved and prefer to keep to themselves.

A small Unbound outpost sits in the town, run by one of their own. Its leader is a Lampwright (Gideon Marsh, decided).

The town's Pillar is run down and flickers from lack of maintenance. The outpost leader gives the player a quest to restore it with an ancient item that can be stolen from Fort Frostcrown. The secret entrance into the Fort's undercroft is the natural way in.

Layout (first proposal)

Gate in the southeast, where the spur from the main path arrives. The flickering Pillar stands in a small square in the centre.

The Unbound outpost (the Lamp House) is in the northwest, with a yellow lamp in the window. A boarded Covenant chapel in the west serves as the Unbound's meeting place. A cheap, quiet inn is to the east.

A small trader's stall and half-working forge lie south of the square. Hunters' huts are to the southeast, and a graveyard and fallen watchtower to the northeast. Many homes are shuttered.

The Unbound: rank structure (proposal)

The Covenant is a rigid, secretive hierarchy. The Unbound are the opposite: open and decentralised, built around cells that teach the Old Tongue to anyone. Their lamp imagery matches the yellow.

Tier

Role

The Seven Speakers

A council elected by the movement. They have no single seat and are scattered across Etharis, and no one knows all seven, for safety. They hold the movement's aim: to reveal the secret of magic to the world and dismantle the Covenant.

Torchbearers

Field commanders (the Unbound's counterpart to Arbitrators). They organise the cells, run raids on Covenant stores and move people and books between towns.

Lampwrights

Outpost leaders and teachers. They keep a community's lamp lit: running the outpost, teaching, and sheltering the hunted. The Greywick outpost leader is a Lampwright.

Kindlings

Everyone who joins. They are taught openly that magic is a skill anyone can learn, not a rare gift, and learn the Old Tongue by practice instead of rote.

Open

The outpost leader's name, the name of the ancient item and where in the Fort it is kept, whether the Covenant notices the theft, and whether the flickering Pillars in Ashford and Greywick are linked or have separate causes (sabotage in Ashford, neglect in Greywick).

Greywick decisions (these close the open items in the Greywick section)

The Lampwright is male. His name is Gideon Marsh.

The ancient item is a Pillar Keystone: an ordinary magic item the Covenant uses to keep Pillars in working order. Greywick has not received one since declaring for the Unbound, which is why its Pillar is run down and flickers.

The theft: the Fort's storehouse holds many Keystones, so the Covenant does not notice when one goes missing. The storehouse is in the Fort's western stores district, next to the undercroft where the secret entrance comes in.

The flickering Pillars: Ashford's and Greywick's flickers have separate causes. Greywick's is neglect from lack of Keystones. Ashford's cause is Purifier sabotage (decided).

### Act 2: story flow (first proposal, planning only, nothing built)

More decisions recorded

Greywick's Lampwright: Gideon Marsh.

Ashford's flicker: caused by sabotage from Purifiers hiding in a camp near Ashford. This adds a hidden Purifier camp close to Ashford (suggested: in a fold of the plains southeast of Ashford, around (72,88)).

Loot: the construct drops the key to a chest holding the Weaverplate Cuirass. The Iron Cleave drops a tome that is a healing and guidance tome (The Tellers' Primer: truth and thought workings).

Order of events

Chapter

Where

What happens

Level

1. Leaving Oakhaven

Plains, west edge

After Act 1 the party (the hero and Tessa) leaves by the east gate. A wooden gate shuts behind them; a guard says to come back later while the town rebuilds. Tessa's buffs and debuffs are introduced.

6 to 7

2. The road to Ashford

Main path

A gentle first stretch: ruined farmstead, signposts, a few weak enemies, friendly wildlife.

7

3. Ashford

Ashford

The player meets Curate Voidsong and sees how the Covenant lives. At the Purple Thistle, Winnie Fenn sends the player to Hakon, who joins for a promise and starts his search for Arthur. Voidsong gives the introduction letter to the Fort only in return for investigating the flickering Pillar. The trail leads to the hidden Purifier camp, which has been sabotaging the Pillar. Clearing it repairs the Pillar and earns the letter. The party is now three.

7 to 8

4. The open plains

Plains, free order

Exploration with camps, side quests, the standing stones and rock golem, the Wayfarers' fire (which starts the secret-entrance quest), and Rook's Hollow (a first lead on Arthur and a back route into the forest camp). Both light forests are here.

8 to 10

4a. West Light Forest

West forest

The construct wakes when the player tries the locked chest. Its key opens the chest: unique body armour.

8

4b. East Light Forest

East forest

The gauntlet through the bandit camp. At the rest fire Hakon tells the player about Arthur. The Iron Cleave (level 12) drops the healing and guidance tome and the first clue to Arthur, pointing to the south.

9 to 12

5. Greywick

Greywick

A reserved, run-down Unbound town. Lampwright Gideon Marsh asks the player to fetch a Pillar Keystone from the Fort to restore the Pillar.

9 to 10

6. Frostcrown Outskirts

Outskirts

The player chooses a way in: the north gate (a search, so a scripted choice to hide the tome), the south gate (a toll, waived by Voidsong's letter), or the secret entrance (no one around).

11 to 12

7. Fort Frostcrown

Fort

The first true look at the Covenant: training, sparring, market, barracks. Arbitrator Ulric Icetoe gives two quests before the player can join. The Keystone can be taken unnoticed from the storehouse next to the undercroft.

12

8. Quest 1: the letter to Maud

Plains, Oakhaven, North Woods

The gate home opens. Oakhaven is partly rebuilt and cold toward the party, and only Bram deals with them. An Odile memorial stands there. Maud (Ulric's mother) is moved by the letter and gives healing supplies, then teaches fast travel (Mem-it). The player fast travels to the Fort and delivers the supplies.

12 to 13

9. The Keystone returns

Greywick

Fast travel to Greywick, restore the Pillar, and finish the Unbound's introductory quest.

13

10. Quest 2 and leaving

Fort, then south

Ulric sends the player to southern Etharis, and Arthur's trail also points south, so both lead into Act 3. Act 2 ends as the party heads south.

13 to 14

Updated levels (these supersede the Level column above): chapter 1 is 6 to 7; chapter 2 is 7; chapter 3 is 7 to 8; chapter 4 is 7 to 10 (4a West Forest 7 to 9 with the construct at 9; 4b East Forest 10 to 12 with the Iron Cleave at 12); chapter 5 is 9 to 10; chapter 6 is 12 to 13; chapter 7 is 12 to 14; chapters 8 and 9 are 13; chapter 10 is 13 to 14. Time of day matters in several chapters: Hakon and the Pillar flicker in Ashford are at Night, and the Fort gates are closed at Night.

Dependencies and rules

Hakon joins at Ashford, so he is in the party for the rest of Act 2. The east forest should come after Ashford and Rook's Hollow.

Greywick's quest is accepted at Greywick and completed after the Fort, since the Keystone is there.

Fast travel only exists after Maud teaches it in chapter 8.

Tome secrecy is handled by scripted choices at Ashford (Voidsong), the north gate and the Fort. Joining any faction is saved for Act 3 after all three introductory quests (Covenant: Ulric's two quests; Unbound: the Keystone; Purifiers: clues only).

Resolved: the first torn page is found in Act 3; Ulric hints at it in Act 2.

## Act 2 decisions: tome, torn page, order, new enemy packs

Decided

The Iron Cleave's tome is a healing and guidance tome whose guidance is truth and thought spells (reveal lies, read intentions, detect hidden things). It must stay a secret from the Covenant like the rest of Corin's tome work.

The first torn page is found in Act 3. Ulric hints at it in Act 2 (without knowing what it is). Neither the west forest nor the Purifier camp holds it.

The Act 2 story-flow order is confirmed, including Greywick before the Fort.

Three new enemy packs supplied for Act 2: Orcs, Skeletons, and two Slime packs. Build nothing yet.

Pack contents (checked)

Orcs (side-on, 96px): Warrior (green, axe), Berserk (brown, cleaver), Shaman (staff, Magic_1/2 attacks).

Skeletons (side-on, 128px): Warrior (shield and sword, Protect), Spearman (Protect, Fall), Archer (Shot, Evasion, Arrow projectile).

Slimes: side-on Green/Red/Blue (already used in Act 1) and a top-down Slime1/2/3 pack with front/back/left/right views. The top-down pack does not match our side-on walking rule, so it is only a fallback.

All are non-grim as supplied, so they get the standard grim treatment (desaturate, darken, scars and wear) and code animation where needed. Licence file points to Craftpix's standard free licence; add to docs/CREDITS.md when built.

Proposed placement (for Ryan to approve)

Orc Warrior: Iron Cleave's bandit camp muscle in the east forest, plus rare plains raiders. Orc Berserk: east forest camp brute, strongest of the camp mooks before the Iron Cleave. Orc Shaman: camp support in the east forest (buffs, heals). Orcs should read as hired muscle and not a separate orc faction, unless Ryan wants one.

Skeleton Warrior, Spearman, Archer: kept out of the open plains. Proposed home is the west forest ruins around the construct and the standing stones near the golem, as old-ruin guardians. This is also the first time the skeleton creature appears, which fits the rule that it waits until the player is in the wider world. They are undead from the Dread Expanse era, not Arden Rose.

Slimes: the existing green/red/blue slimes stay in the plains and forest edges. Colour tiers by area (green plains, blue frosted bands, red near ruins) is proposed.

Wolves stay in woods, rocks and caves only (rule unchanged).

Still open

Orc lore: hired muscle or their own people?

Do skeletons belong to the west forest ruin only, or also the standing stones?

Ulric's hint about the torn page: what exactly he says and why he knows it.

Enemy, loot and level tables per area are the next planning step.

## Act 2 decisions: orcs, Ulric's hint, and the day/night revamp

Decided

The orcs are hired mercenaries from the House in the Frozen Vale. They are not a separate orc faction. This ties the Iron Cleave's camp to the Frozen Vale and gives Act 3 or an expansion a thread to pull.

Ulric's hint: before the party goes south he tells them a tome was stolen from a southern vault, warns them to watch for monsters and bandits because the south is more dangerous, and, if pressed, reveals the tome is incomplete. He does not know it is the same tome Corin carries.

Day and night revamp: time of day should matter. Certain enemies appear only at certain times, and quests can only progress or complete at certain times.

How it works now (Act 1 code)

Time is two fixed moments, DAY_T (9:00) and NIGHT_T (21:30). Night counts as 19:00 to 05:00. Sleeping advances the day. Time otherwise changes only through scripted events (for example the Day 4 fire) and a toggle for old saves. Wolves respawn on each switch. NPCs re-settle on each switch.

So the groundwork exists (NPC schedules, night lighting, respawn on change) but it is a binary switch, not something the player plans around.

Proposed design (for Ryan to approve or change)

Four phases: Dawn, Day, Dusk, Night. Act 1 stays on its scripted two moments; the full system switches on when the player leaves Oakhaven.

Time advances while the player travels the overworld at a slow rate, and jumps forward when resting at an inn, camp fire or Pillar. Resting lets the player choose which phase to wake in, so they can always wait for the time they need. Fast travel advances time by distance.

Enemies by phase (proposed): skeletons only at Night, in the west forest ruins and at the standing stones; wolves hunt at Dusk and Night, rest by day; Purifier scouts and ambush camps only at Night; bandit roamers on the roads by Day, and they pull back into their camps at Night; slimes by Day and Dawn, tougher when it is wet or frosted; rock golem always present; orc mercs stay in the camp at all times.

Quests by phase (proposed): Wayfarers' fire (secret entrance) only at Night; the Ashford Pillar flicker is only visible at Night, so the Purifier sabotage can only be investigated then; Odile's memorial at Dusk; Hakon is only in the Purple Thistle in the evening; Fort gates are closed at Night (north gate search and south gate toll only by Day, the secret entrance works at Night); Fort sparring and the market only by Day; Maud's hut is warm and open by Day.

Visibility: night lighting gets darker the further north, snow glows. Add a clear clock or phase icon on the HUD and in the accessibility menu (a mode that reduces night darkness).

Rules to keep: never lock the player out. Every time-gated thing can be reached by waiting. A quest should never be failed purely because of time, only delayed.

Questions for Ryan

Four phases, or keep it simpler at two (Day and Night)?

Does time pass slowly while walking, or only when the player rests or does something?

Should the player be able to rest anywhere (at a camp fire), or only at inns and Pillars?

Should Act 1 be left alone, or should the system be introduced early?

## Day/night: pillar-controlled (supersedes the four-phase proposal above)

Decided

Day and night work like Octopath Traveler: two states, Day and Night, chosen by the player. The player can only swap between them at a Pillar.

Pillars act like bonfires in a Souls game: the player's rest and anchor points.

The four-phase clock (Dawn, Day, Dusk, Night), slow time passing while walking, and resting anywhere at a camp fire are dropped.

Proposed pillar functions (for Ryan to approve)

Touch a Pillar to: swap Day/Night, restore HP and MP, save, set the respawn point on defeat, and use fast travel (Mem-it, once introduced by Maud).

Resting or swapping respawns the regular roaming enemies in that area (not bosses, mini bosses, the golem, or cleared camps' loot). This keeps the Souls feel and gives the player a reason to be careful.

The world stays in the chosen state until the player returns to a Pillar, so choosing Day or Night is a planning decision before leaving.

Fast travel does not change the state. Arriving at a Pillar keeps whichever state the player is in.

Consequences for Act 2

Pillars are needed in the field, not only in Ashford, Greywick, the Fort and Oakhaven. Proposed field Pillars: the crossroads watchtower ruin (92,62), the overlook hill (114,44), one at each forest entrance, and one in the Outskirts near the south road. This also lets the player swap time before a gate or camp.

Every time-gated thing must be reachable by swapping at a Pillar, so the rule "never lock the player out" still holds. The Fort gates are shut at Night, so an Outskirts Pillar is required, otherwise a player stuck outside at night would have to use the secret entrance, which is itself a quest.

Day-only: market, sparring, Fort gates, Maud's hut open. Night-only: skeletons, Purifier scouts and camps, Wayfarers' fire, visible Ashford flicker, wolves at their most active. Day-only: bandit roamers on the roads. Hakon being in the Purple Thistle is the evening scene; with two states this becomes Night in Ashford.

Pillar lore: a short Old Tongue phrase to swap Day/Night would sit beside Mem-it. The word is still to be chosen.

Act 1 stays scripted on its two moments; swapping at Pillars switches on when the player leaves Oakhaven.

Questions

Does a swap respawn the regular enemies (Souls style), or only the ones tied to the state?

Can the player swap Day/Night before Old Maud introduces the pillar word?

What is the in-world reason the Pillars can change the time of day?

## Day/night: answers recorded

Decided

Resting at a Pillar respawns the regular enemies in that area (not bosses, mini bosses, the golem or cleared camp loot).

The player can swap Day/Night from the start, not only after Maud. A tutorial is added to Act 1 that explains the point of the system.

In-world reason: none needed beyond the simple one. The player rests at the Pillar and waits for the day to change. There is no time magic; the swap is just resting until the next morning or evening. Fast travel (Mem-it) stays a separate word that Maud teaches.

Act 1 changes this adds (to do when building starts)

A short Pillar tutorial in Act 1 that shows resting, the Day/Night swap, and that resting respawns regular enemies and restores HP/MP.

Proposed placement: at the Oakhaven Pillar, taught by Odile on an early evening so the first swap happens in a safe place. Placement and speaker to be confirmed by Ryan.

Act 1 scripted time events (such as the Day 4 fire) still override the player's choice.

Existing Act 1 code already respawns wolves and re-settles NPCs when time changes, so the tutorial hooks into that.

Full Act 1 change list so far: this tutorial, Tessa's end-of-Act-1 line, Maud's foreshadow line, and the volume sliders and accessibility menu.

Still open

Who teaches the tutorial and when in Act 1.

The Old Tongue phrase (if any) used to rest at a Pillar.

## Day/night introduction moved to Act 2, and new loot packs

Decided (supersedes the Act 1 tutorial)

The Day/Night swap is introduced at the start of Act 2, not Act 1. Act 1 stays on its scripted two moments and gets no tutorial. The Act 1 change list drops the Pillar tutorial.

When the party leaves Oakhaven and the world opens up, a tutorial tells the player that at an activated Pillar they can: change the time of day, refill HP (and MP), study, and respawn basic enemies in the area.

The tutorial must also say that day and night matter for quests and for which enemy types appear.

Pillars must be activated first, so each Pillar needs an activation moment the first time the player touches it. Open: whether the Oakhaven Pillar starts activated.

Open: who delivers the tutorial (Tessa is the natural choice as the guide who has just joined).

Loot packs supplied (all 32x32 icons, 48 per pack plus a 2-icon bonus folder in the goblin and undead packs)

RPG Loot (creature materials): fangs, claws, hides, scales, feathers, horns, antlers, tails, bones, spines.

Goblin Loot (goblin and mercenary gear): horned helmet, boots, tunics, shield, axes, hammer, bow, quiver, arrows, daggers, torch, teeth, bones, coins, necklace, potions, meat and food.

Undead Loot: skull, bones, ribcage, organs (heart, eyes, brain), rings, amulets, crown, gems, bone necklace, purple skull tome, candles, voodoo doll, key, scrolls, letter, torn parchment.

All are already fairly dark; they get a light grim pass (desaturate and darken) so they match the rest of the art. Add to docs/CREDITS.md when built.

Proposed use (for Ryan to approve)

Plains wildlife and slimes: creature materials from the RPG pack (fangs, hides, feathers, antlers). Ashford buys fangs and silk, so these double as sell items.

Orc mercenaries and bandits: gear from the Goblin pack (horned helmet, axes, bow and arrows, shield, boots, food, coins, potions).

Skeletons (west forest ruins, standing stones, night only): bones, skull, ribcage, bone necklace, rings and gems from the Undead pack.

Quest items: construct's chest key (Undead key), Voidsong's letter and Maud's letter (Undead letter), the clue to Arthur (Undead scroll), the Purifier camp find (voodoo doll or candles), and the Pillar Keystone (a cyan gem).