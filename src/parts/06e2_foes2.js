/* ------------------------------------------------------------------ */
/* Act 2 foes. Numbers from the design doc's area tables (a first pass,
   to be tuned in play). moves: what a foe does with a turn, weighted.
   k: hit (one), two, all, heal, buff, guard, summon, charge (a wind-up
   that becomes `then` next turn). shot/cast moves stay put and throw a
   projectile (proj). anim: which strip of the atlas plays. dot: poison
   or bleed. phase2: what changes at half health. when: day or night. */
/* ------------------------------------------------------------------ */
const MV = {
  hit: { n: "Strike", k: "hit", w: 3 },
  bite: { n: "Bite", k: "hit", w: 3 },
  shot: (proj, el) => ({ n: proj === "arrow" ? "Loose" : "Hurl", k: "hit", w: 3, shot: true, anim: "attack", proj, el }),
};
const A2 = (o) => ({ scale: 1, weak: [], resist: [], drops: [], coins: [0, 0], ...o });
Object.assign(BTL_FOES, {
  /* ---- the Open Plains ---- */
  mslime: A2({ name: "Meadow Slime", lv: 7, art: "slimeG", hp: 60, atk: 11, def: 2, spd: 7, xp: 32, coins: [1, 3], drops: [["gel", 0.5], ["token", 0.04]], weak: ["fire"], resist: ["growth"], when: "day", note: "bog-water given a grudge, and fed" }),
  fslime: A2({ name: "Frost Slime", lv: 8, art: "slimeB", hp: 74, atk: 13, def: 3, spd: 7, xp: 40, coins: [1, 4], drops: [["gel", 0.5]], weak: ["fire"], resist: ["cold"], when: "day", note: "rime crusted on a cold heart" }),
  rslime: A2({ name: "Rust Slime", lv: 9, art: "slimeR", hp: 94, atk: 16, def: 5, spd: 8, xp: 54, coins: [2, 5], drops: [["gel", 0.5], ["token", 0.06]], weak: ["cold"], resist: ["fire"], when: "day", note: "it has eaten something iron, and kept the taste" }),
  boar: A2({ name: "Wild Boar", lv: 7, art: "boar", scale: 1.15, hp: 90, atk: 15, def: 5, spd: 9, xp: 46, coins: [0, 2], drops: [["tusk", 0.4], ["hide", 0.5], ["haunch", 0.3]], weak: ["fire"], when: "day", note: "charges first, and thinks never",
    moves: [{ n: "Gore", k: "hit", w: 3 }, { n: "Paw the ground", k: "charge", w: 1, say: "Paws the ground...", then: { n: "Charge", k: "hit", p: 1.8 } }] }),
  rat: A2({ name: "Field Rat", lv: 8, art: "rat", scale: 1.5, hp: 34, atk: 12, def: 1, spd: 14, xp: 22, drops: [["rattail", 0.6]], weak: ["fire"], when: "day", note: "fat on what the war left behind",
    moves: [{ n: "Gnaw", k: "hit", w: 3, dot: "bleed", dotP: 0.2 }] }),
  cutpurse: A2({ name: "Roadside Cutpurse", lv: 7, art: "bandit1", hp: 78, atk: 14, def: 4, spd: 12, xp: 42, coins: [3, 7], drops: [["bandage", 0.2], ["dagger", 0.08], ["boots", 0.1]], when: "day", note: "quick hands, and quicker to run",
    moves: [MV.hit, { n: "Low blow", k: "hit", w: 1, p: 0.8, dot: "bleed", dotP: 0.7 }] }),
  thug: A2({ name: "Highway Thug", lv: 8, art: "bandit2", hp: 112, atk: 17, def: 7, spd: 7, xp: 56, coins: [4, 9], drops: [["club", 0.1], ["tunic", 0.12]], when: "day", note: "a wall with a grudge",
    moves: [MV.hit, { n: "Crushing blow", k: "hit", w: 1, p: 1.4 }] }),
  archer: A2({ name: "Bandit Archer", lv: 8, art: "archer", hp: 70, atk: 16, def: 3, spd: 10, xp: 50, coins: [3, 7], drops: [["arrows", 0.4], ["shortbow", 0.06]], bow: true, when: "day", note: "stays back, and aims for whoever is weaving",
    moves: [MV.shot("arrow")] }),
  pscout: A2({ name: "Purifier Scout", lv: 9, art: "purifier", hp: 100, atk: 18, def: 5, spd: 11, xp: 66, coins: [4, 8], drops: [["firewax", 0.2], ["cuttoken", 0.3], ["leaflet", 0.1]], weak: ["cold"], resist: ["fire"], when: "night", note: "smells of lamp oil and certainty",
    moves: [{ n: "Ash knife", k: "hit", w: 2 }, { n: "Firewax flask", k: "hit", w: 2, shot: true, anim: "cast", proj: "fire", el: "fire", p: 1.1 }] }),
  skelW: A2({ name: "Skeleton Warrior", lv: 9, art: "skelW", hp: 110, atk: 17, def: 9, spd: 6, xp: 64, coins: [2, 6], drops: [["bone", 0.6], ["gravecoin", 0.35], ["ring", 0.04]], weak: ["light"], resist: ["cold", "growth"], when: "night", note: "it remembers how to fight, and nothing else",
    moves: [MV.hit, { n: "Raise shield", k: "guard", w: 1, p: 2, anim: "guard" }] }),
  skelS: A2({ name: "Skeleton Spearman", lv: 9, art: "skelS", hp: 98, atk: 19, def: 6, spd: 8, xp: 62, coins: [2, 6], drops: [["bone", 0.6], ["gravecoin", 0.35]], weak: ["light"], resist: ["cold", "growth"], when: "night", note: "the spear goes through one of you and into the next",
    moves: [MV.hit, { n: "Impale", k: "two", w: 1, p: 0.85 }] }),
  skelA: A2({ name: "Skeleton Archer", lv: 9, art: "skelA", hp: 80, atk: 18, def: 3, spd: 10, xp: 60, coins: [2, 5], drops: [["bone", 0.6], ["arrows", 0.3]], weak: ["light"], resist: ["cold", "growth"], when: "night", note: "it does not blink, so it does not miss often",
    moves: [MV.shot("arrow")] }),
  golem: A2({ name: "Rock Golem", lv: 10, art: "golem", hp: 360, atk: 20, def: 10, spd: 5, xp: 200, coins: [15, 25], drops: [["stoneheart", 1]], weak: ["storm", "wind"], resist: ["stone", "cold"], boss: true, note: "the standing stones' last ward, woken by a thief",
    moves: [{ n: "Slam", k: "hit", w: 3, p: 1.15 }, { n: "Quake", k: "all", w: 2, p: 0.65 }, { n: "Gather", k: "charge", w: 1, say: "Stone grinds as it draws back a fist...", then: { n: "Boulder fist", k: "hit", p: 2 } }] }),
  captain: A2({ name: "Ambush Captain", lv: 9, art: "knight2", hp: 220, atk: 19, def: 8, spd: 9, xp: 110, coins: [20, 30], drops: [["boots", 1]], boss: true, note: "runs the ambush camp, and never the risk",
    moves: [MV.hit, { n: "Sweeping cut", k: "two", w: 2, p: 0.85 }, { n: "Shield up", k: "guard", w: 1, p: 2, anim: "guard" }] }),
  rook: A2({ name: "Rook's Hollow Leader", lv: 10, art: "knight1", hp: 300, atk: 21, def: 9, spd: 9, xp: 150, coins: [30, 45], drops: [["shortsword", 1]], boss: true, note: "the band does what she says, and says it back",
    moves: [MV.hit, { n: "Rally the band", k: "buff", w: 1, p: 1.15, anim: "guard" }, { n: "Shield up", k: "guard", w: 1, p: 2, anim: "guard" }, { n: "Sweeping cut", k: "two", w: 2, p: 0.85 }] }),
  pleader: A2({ name: "Purifier Cell Leader", lv: 9, art: "pleader", hp: 240, atk: 19, def: 6, spd: 10, xp: 120, coins: [20, 30], drops: [["firewax", 1], ["cuttoken", 1], ["leaflet", 1]], weak: ["cold"], resist: ["fire"], boss: true, when: "night", note: "burns the Pillars to save the world from them",
    moves: [{ n: "Cleansing fire", k: "all", w: 2, p: 0.75, el: "fire", anim: "cast", shot: true, proj: "fire" }, { n: "Firebolt", k: "hit", w: 3, shot: true, anim: "cast", proj: "fire", el: "fire", p: 1.15 }, { n: "Stoke the faithful", k: "buff", w: 1, p: 1.15, anim: "cast" }] }),

  /* ---- the West Forest ---- */
  thornhound2: A2({ name: "Thorn Hound", lv: 7, art: "wolfG", hp: 70, atk: 12, def: 4, spd: 11, xp: 40, coins: [1, 3], drops: [["pelt", 0.35]], weak: ["fire", "wind"], resist: ["growth"], when: "day", note: "burrs and briars knotted into the coat" }),
  redcap2: A2({ name: "Red-cap", lv: 7, art: "redcap", hp: 60, atk: 11, def: 4, spd: 8, xp: 38, coins: [1, 3], drops: [["redcap", 0.55]], weak: ["fire"], resist: ["growth"], when: "day", note: "a toadstool that learned to walk, and grew up" }),
  mandrake2: A2({ name: "Mandrake", lv: 8, art: "mandrake", hp: 66, atk: 12, def: 3, spd: 9, xp: 44, coins: [1, 3], drops: [["mroot", 0.4], ["yarrow", 0.15]], weak: ["fire", "wind"], resist: ["growth", "life"], when: "day", note: "uprooted, and furious about it" }),
  snapjaw: A2({ name: "Snapjaw", lv: 8, art: "snapjaw", hp: 100, atk: 15, def: 6, spd: 5, xp: 52, coins: [0, 2], drops: [["snapvine", 0.35], ["sap", 0.2]], weak: ["fire", "wind"], resist: ["growth"], rooted: true, when: "day", note: "rooted by the trail, and patient as a trap",
    moves: [{ n: "Snap", k: "hit", w: 3, p: 1.1 }, { n: "Venom spit", k: "hit", w: 1, p: 0.7, dot: "poison", dotP: 0.8, shot: true, proj: "venom" }] }),
  fspider: A2({ name: "Forest Spider", lv: 8, art: "spider", hp: 72, atk: 14, def: 4, spd: 11, xp: 46, coins: [1, 3], drops: [["silk", 0.6]], weak: ["fire", "light"], resist: ["stone"], when: "day", note: "as big as a dog, and patient",
    moves: [MV.bite, { n: "Venom bite", k: "hit", w: 1, dot: "poison", dotP: 0.7 }] }),
  gwolf: A2({ name: "Gaunt Wolf", lv: 8, art: "wolfB", hp: 84, atk: 15, def: 4, spd: 11, xp: 50, coins: [1, 4], drops: [["pelt", 0.45], ["fang", 0.35]], weak: ["fire"], when: "night", note: "starved, and wary of flame" }),
  bat2: A2({ name: "Cave Bat", lv: 7, art: "bat", hp: 36, atk: 11, def: 1, spd: 14, xp: 22, drops: [["batwing", 0.4]], weak: ["storm", "wind"], when: "night", note: "fast, frail, and always from above" }),
  leywolf2: A2({ name: "Ley-touched Wolf", lv: 9, art: "wolfL", hp: 100, atk: 18, def: 6, spd: 10, xp: 62, coins: [2, 5], drops: [["pelt", 0.5], ["btonic", 0.08]], weak: ["light", "fire"], resist: ["storm"], when: "night", note: "the ruins' leyline runs in its veins" }),
  construct: A2({ name: "Worn Covenant Construct", lv: 9, art: "robot", hp: 340, atk: 21, def: 11, spd: 4, xp: 190, coins: [15, 25], drops: [["scrap", 1], ["scrap", 1], ["scrap", 0.5], ["constructkey", 1]], weak: ["storm", "wind"], resist: ["stone", "light"], stunBy: ["storm"], misfire: 0.22, boss: true, note: "Covenant work, older than the Covenant admits",
    moves: [{ n: "Lumbering blow", k: "hit", w: 2 }, { n: "Arm shot", k: "hit", w: 2, shot: true, anim: "shot", proj: "bolt", p: 1.1 }, { n: "Wind up", k: "charge", w: 1, say: "Gears grind as it raises an arm: guard!", then: { n: "Slam", k: "hit", p: 2, anim: "attack" } }],
    phase2: { at: 0.5, text: "It overheats. Steam screams from every joint: Overdrive.", spd: 8, atk: 1.15, def: -3, misfire: 0,
      moves: [{ n: "Lumbering blow", k: "hit", w: 2 }, { n: "Arm shot", k: "hit", w: 2, shot: true, anim: "shot", proj: "bolt", p: 1.15 }, { n: "Venting sweep", k: "all", w: 2, p: 0.75, el: "fire", anim: "stun" }, { n: "Wind up", k: "charge", w: 1, say: "It braces, venting: guard!", then: { n: "Slam", k: "hit", p: 2.1, anim: "attack" } }] } }),

  /* ---- the East Forest and the Iron Cleave's camp ---- */
  boarE: A2({ name: "Wild Boar", lv: 10, art: "boar", scale: 1.2, hp: 124, atk: 20, def: 7, spd: 9, xp: 62, coins: [0, 2], drops: [["tusk", 0.4], ["hide", 0.5], ["haunch", 0.3]], weak: ["fire"], when: "day", note: "older, bigger, and no wiser",
    moves: [{ n: "Gore", k: "hit", w: 3 }, { n: "Paw the ground", k: "charge", w: 1, say: "Paws the ground...", then: { n: "Charge", k: "hit", p: 1.8 } }] }),
  fspiderE: A2({ name: "Forest Spider", lv: 10, art: "spider", hp: 108, atk: 18, def: 6, spd: 11, xp: 58, coins: [1, 3], drops: [["silk", 0.6]], weak: ["fire", "light"], resist: ["stone"], when: "day", note: "patient, and hungry",
    moves: [MV.bite, { n: "Venom bite", k: "hit", w: 1, dot: "poison", dotP: 0.7 }] }),
  gwolfE: A2({ name: "Gaunt Wolf", lv: 10, art: "wolfB", hp: 112, atk: 19, def: 6, spd: 11, xp: 60, coins: [1, 4], drops: [["pelt", 0.45], ["fang", 0.35]], weak: ["fire"], when: "night", note: "the pack runs the east wood at night" }),
  batE: A2({ name: "Cave Bat", lv: 10, art: "bat", hp: 52, atk: 15, def: 2, spd: 14, xp: 30, drops: [["batwing", 0.4]], weak: ["storm", "wind"], when: "night", note: "fast, frail, and always from above" }),
  ccutpurse: A2({ name: "Camp Cutpurse", lv: 10, art: "bandit1", hp: 112, atk: 19, def: 7, spd: 12, xp: 60, coins: [4, 8], drops: [["bandage", 0.2], ["dagger", 0.08], ["boots", 0.1]], note: "the band's quickest knife",
    moves: [MV.hit, { n: "Low blow", k: "hit", w: 1, p: 0.8, dot: "bleed", dotP: 0.7 }] }),
  bthug: A2({ name: "Bandit Thug", lv: 11, art: "bandit2", hp: 140, atk: 22, def: 9, spd: 7, xp: 72, coins: [5, 10], drops: [["club", 0.1], ["tunic", 0.12]], note: "paid by the day, and it shows",
    moves: [MV.hit, { n: "Crushing blow", k: "hit", w: 1, p: 1.4 }] }),
  barcher: A2({ name: "Bandit Archer", lv: 10, art: "archer", hp: 94, atk: 21, def: 5, spd: 10, xp: 62, coins: [4, 8], drops: [["arrows", 0.4], ["shortbow", 0.06]], bow: true, note: "on the palisade, with the high ground",
    moves: [MV.shot("arrow")] }),
  bknight: A2({ name: "Bandit Knight", lv: 11, art: "knight3", hp: 170, atk: 23, def: 12, spd: 7, xp: 90, coins: [8, 14], drops: [["helm", 0.15], ["shield", 0.1], ["shortsword", 0.1]], note: "stolen plate, and the training to use it",
    moves: [MV.hit, { n: "Shield up", k: "guard", w: 1, p: 2, anim: "guard" }] }),
  orcW: A2({ name: "Orc Warrior", lv: 11, art: "orcW", hp: 150, atk: 23, def: 9, spd: 8, xp: 76, coins: [6, 12], drops: [["axe", 0.12], ["helm", 0.1], ["haunch", 0.3]], note: "a Frozen Vale sellsword, paid in House silver",
    moves: [MV.hit, { n: "Cleave", k: "two", w: 1, p: 0.85 }] }),
  orcB: A2({ name: "Orc Berserk", lv: 11, art: "orcB", hp: 130, atk: 27, def: 5, spd: 10, xp: 80, coins: [6, 12], drops: [["cleaver", 0.1], ["haunch", 0.3]], note: "gets worse when it bleeds",
    moves: [MV.hit], phase2: { at: 0.5, text: "Berserk! It roars and stops caring what you do to it.", atk: 1.25, moves: [{ n: "Frenzy", k: "hit", w: 3, anim: "special" }] } }),
  orcS: A2({ name: "Orc Shaman", lv: 11, art: "orcS", hp: 100, atk: 20, def: 5, spd: 9, xp: 78, coins: [6, 12], drops: [["btonic", 0.12], ["potion", 0.15]], weak: ["storm"], note: "heals the others; strike it first",
    moves: [{ n: "Mend", k: "heal", w: 3, p: 0.16, anim: "cast" }, { n: "War chant", k: "buff", w: 1, p: 1.12, anim: "cast" }, { n: "Hex", k: "hit", w: 2, shot: true, anim: "cast", proj: "hex", p: 0.9 }] }),
  ironcleave: A2({ name: "The Iron Cleave", lv: 12, art: "cleave", hp: 600, atk: 24, def: 12, spd: 8, xp: 300, coins: [40, 60], drops: [["primer", 1], ["hakoncleaver", 1], ["billofsale", 1], ["signet", 1]], weak: ["storm"], resist: ["stone", "cold"], boss: true, prot: 3, note: "the House's hired captain. The shield breaks to storm, or to a word that sees through it",
    moves: [MV.hit, { n: "Shield bash", k: "hit", w: 2, p: 1.1, anim: "guard" }, { n: "Cleave", k: "two", w: 2, p: 0.85 }, { n: "Shield up", k: "guard", w: 1, p: 3, anim: "guard" }],
    phase2: { at: 0.5, name: "The Cleaver", text: "He casts aside shield and helm, and draws the true cleaver. \"The Vale paid for this. You'll pay for the rest.\"", atk: 1.2, def: -4, prot: 0,
      moves: [{ n: "Great cleave", k: "all", w: 3, p: 0.85, anim: "special" }, { n: "Rend", k: "hit", w: 2, p: 1, dot: "bleed", dotP: 0.9 }, { n: "Warband cry", k: "buff", w: 1, p: 1.15 }] } }),

  /* ---- the Frostcrown Outskirts ---- */
  snowboar: A2({ name: "Snow Boar", lv: 12, art: "boarS", scale: 1.25, hp: 140, atk: 22, def: 9, spd: 9, xp: 74, coins: [0, 2], drops: [["tusk", 0.4], ["hide", 0.5], ["haunch", 0.3]], weak: ["fire"], resist: ["cold"], when: "day", note: "white with frost, and twice as mean for it",
    moves: [{ n: "Gore", k: "hit", w: 3 }, { n: "Paw the snow", k: "charge", w: 1, say: "Paws the snow...", then: { n: "Charge", k: "hit", p: 1.8 } }] }),
  fslimeO: A2({ name: "Frost Slime", lv: 12, art: "slimeB", hp: 110, atk: 18, def: 5, spd: 7, xp: 55, coins: [2, 5], drops: [["gel", 0.5]], weak: ["fire"], resist: ["cold"], when: "day", note: "half frozen and wholly annoyed" }),
  frostspider: A2({ name: "Frost Spider", lv: 12, art: "spiderW", hp: 128, atk: 21, def: 8, spd: 11, xp: 70, coins: [2, 5], drops: [["silk", 0.6], ["frostsilk", 0.2]], weak: ["fire"], resist: ["cold", "stone"], when: "day", note: "its silk never thaws",
    moves: [MV.bite, { n: "Numbing bite", k: "hit", w: 1, dot: "poison", dotP: 0.7, el: "cold" }] }),
  frostwolf: A2({ name: "Frost Wolf", lv: 13, art: "wolfW", hp: 144, atk: 24, def: 8, spd: 11, xp: 80, coins: [2, 5], drops: [["pelt", 0.5], ["fang", 0.35]], weak: ["fire"], resist: ["cold"], when: "night", note: "it hunts in the rocks, in the dark" }),
  batO: A2({ name: "Cave Bat", lv: 12, art: "bat", hp: 62, atk: 17, def: 2, spd: 14, xp: 36, drops: [["batwing", 0.4]], weak: ["storm", "wind"], when: "night", note: "fast, frail, and always from above" }),
  wisp: A2({ name: "Ember Wisp", lv: 13, art: "wisp", hp: 120, atk: 25, def: 4, spd: 12, xp: 84, coins: [0, 3], drops: [["emberdust", 0.4]], weak: ["cold"], resist: ["fire"], when: "night", note: "a coal that will not go out, looking for something to burn",
    moves: [{ n: "Scorch", k: "hit", w: 2, el: "fire" }, { n: "Ember", k: "hit", w: 2, shot: true, proj: "fire", el: "fire", p: 1.05 }] }),
  valescout: A2({ name: "Frozen Vale Scout", lv: 13, art: "orcW", hp: 156, atk: 26, def: 10, spd: 8, xp: 86, coins: [8, 14], drops: [["axe", 0.12], ["helm", 0.1], ["haunch", 0.3]], when: "day", note: "a House outrider, far from home",
    moves: [MV.hit, { n: "Cleave", k: "two", w: 1, p: 0.85 }] }),
  valeberserk: A2({ name: "Frozen Vale Berserk", lv: 13, art: "orcB", hp: 140, atk: 29, def: 6, spd: 10, xp: 88, coins: [8, 14], drops: [["cleaver", 0.1], ["haunch", 0.3]], when: "day", note: "gets worse when it bleeds",
    moves: [MV.hit], phase2: { at: 0.5, text: "Berserk!", atk: 1.25, moves: [{ n: "Frenzy", k: "hit", w: 3, anim: "special" }] } }),
  valeshaman: A2({ name: "Frozen Vale Shaman", lv: 13, art: "orcS", hp: 108, atk: 22, def: 5, spd: 9, xp: 84, coins: [8, 14], drops: [["btonic", 0.12], ["potion", 0.15]], weak: ["storm"], when: "day", note: "heals the others; strike it first",
    moves: [{ n: "Mend", k: "heal", w: 3, p: 0.16, anim: "cast" }, { n: "War chant", k: "buff", w: 1, p: 1.12, anim: "cast" }, { n: "Hex", k: "hit", w: 2, shot: true, anim: "cast", proj: "hex", p: 0.9 }] }),
  rimefang: A2({ name: "Rimefang", lv: 14, art: "wolfF", scale: 1.45, hp: 560, atk: 27, def: 10, spd: 11, xp: 260, coins: [30, 45], drops: [["rimefang", 1], ["fang", 1], ["fang", 1]], weak: ["fire"], resist: ["cold"], stunBy: ["fire"], boss: true, when: "night", note: "the white alpha of the tor. Fire makes him flinch",
    moves: [{ n: "Maul", k: "hit", w: 3, p: 1.1 }, { n: "Frost breath", k: "all", w: 1, p: 0.7, el: "cold" }],
    phase2: { at: 0.5, text: "Rimefang howls. Somewhere in the rocks, the pack answers.", summon: ["frostwolf", "frostwolf"], moves: [{ n: "Maul", k: "hit", w: 3, p: 1.15 }, { n: "Frost breath", k: "all", w: 2, p: 0.75, el: "cold" }] } }),
});
/* which group of foes may be out: a group spawns by Day or by Night as its foes do, unless the map says otherwise */
function wildAllowed(g, night) {
  const when = g.when || (BTL_FOES[g.group[0]] || {}).when;
  return !when || when === (night ? "night" : "day");
}
/* people and things shaped like people stand as tall as the party, in battle and out in the world */
const HUMAN_ART = new Set(["robot", "huskI", "huskS", "bandit1", "bandit2", "bandit3", "archer", "knight1", "knight2", "knight3", "cleave", "orcW", "orcB", "orcS", "skelW", "skelS", "skelA", "robot", "purifier", "pleader"]);
