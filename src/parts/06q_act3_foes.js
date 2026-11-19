/* ------------------------------------------------------------------ */
/* Act 3 foes, first pass. The Purifiers of Aurelm: their fire is      */
/* always lethal, and they mean it to be.                              */
/* ------------------------------------------------------------------ */
Object.assign(BTL_FOES, {
  purburner: A2({ name: "Purifier Burner", lv: 12, art: "purifier", hp: 150, atk: 23, def: 7, spd: 11, xp: 95, coins: [8, 14], drops: [["firewax", 0.4], ["firepot", 0.15], ["leaflet", 0.1]], weak: ["cold"], resist: ["fire"],
    note: "carries the fire the Purifiers call mercy",
    moves: [{ n: "Ash knife", k: "hit", w: 2 }, { n: "Firewax flask", k: "hit", w: 3, shot: true, anim: "cast", proj: "fire", el: "fire", p: 1.2 }] }),
  purbrand: A2({ name: "Purifier Brand-Sergeant", lv: 13, art: "pleader", hp: 320, atk: 25, def: 8, spd: 10, xp: 170, coins: [25, 40], drops: [["firewax", 1], ["firepot", 0.5]], weak: ["cold"], resist: ["fire"], boss: true,
    note: "marks the tainted with a grey hand, and then with fire",
    moves: [{ n: "Cleansing fire", k: "all", w: 2, p: 0.8, el: "fire", anim: "cast", shot: true, proj: "fire" }, { n: "Brand", k: "hit", w: 3, shot: true, anim: "cast", proj: "fire", el: "fire", p: 1.3 },
      { n: "Gather the flame", k: "charge", w: 1, say: "The sergeant cups his hands, and the fire in them turns white...", then: { n: "Pyre", k: "all", p: 1.25, el: "fire", anim: "cast", shot: true, proj: "fire" } }] }),
});

/* ---- the Western Crags ---- */
Object.assign(BTL_FOES, {
  crwolf: A2({ name: "Pine Wolf", lv: 12, art: "wolfB", hp: 130, atk: 22, def: 6, spd: 12, xp: 80, coins: [2, 5], drops: [["pelt", 0.5], ["fang", 0.35]], weak: ["fire"], note: "lean from the long winter, and not afraid of people" }),
  crfrost: A2({ name: "Frost Wolf", lv: 13, art: "wolfW", hp: 150, atk: 24, def: 7, spd: 12, xp: 92, coins: [2, 6], drops: [["pelt", 0.5], ["fang", 0.4]], weak: ["fire"], resist: ["cold"], note: "white on white, until it moves",
    moves: [MV.bite, { n: "Rime bite", k: "hit", w: 1, p: 1.25, el: "cold" }] }),
  skelmin: A2({ name: "Skeleton Miner", lv: 12, art: "skelmin", hp: 130, atk: 22, def: 9, spd: 8, xp: 82, coins: [3, 8], drops: [["bone", 0.6], ["ore", 0.3], ["gravecoin", 0.2]], weak: ["light"], resist: ["cold", "growth"],
    note: "still working the seam it died in", moves: [MV.hit, { n: "Pick swing", k: "hit", w: 1, p: 1.3 }] }),
  skelfore: A2({ name: "Dead Foreman", lv: 13, art: "skelfore", hp: 190, atk: 24, def: 10, spd: 9, xp: 120, coins: [8, 16], drops: [["bone", 0.6], ["gravecoin", 0.5], ["ring", 0.06]], weak: ["light"], resist: ["cold", "growth"],
    note: "drives the dead as he drove the living", moves: [MV.hit, { n: "Lash the line", k: "buff", w: 1, p: 1.15 }, { n: "Cleave", k: "two", w: 1, p: 0.85 }] }),
  ent: A2({ name: "Old Pine", lv: 13, art: "ent", hp: 240, atk: 23, def: 11, spd: 5, xp: 120, coins: [0, 3], drops: [["resin", 0.5], ["mroot", 0.15]], weak: ["fire"], resist: ["growth", "stone"],
    note: "a pine that has stood too long to be cut, and knows it", moves: [{ n: "Bough sweep", k: "two", w: 2, p: 0.9 }, { n: "Root grip", k: "hit", w: 2, p: 1.1 }, { n: "Creak", k: "guard", w: 1, p: 2, anim: "idle" }] }),
  entdead: A2({ name: "Deadwood", lv: 12, art: "entdead", hp: 160, atk: 22, def: 9, spd: 6, xp: 90, coins: [0, 2], drops: [["resin", 0.3]], weak: ["fire"], resist: ["growth", "cold"],
    note: "lightning-killed, and not lying down about it", moves: [{ n: "Splinter lash", k: "hit", w: 3, p: 1.1 }] }),
  minguard: A2({ name: "Company Guard", lv: 12, art: "bandit2", hp: 150, atk: 23, def: 9, spd: 8, xp: 85, coins: [6, 12], drops: [["club", 0.08], ["bandage", 0.3]], note: "paid by the head, and counts heads",
    moves: [MV.hit, { n: "Cudgel", k: "hit", w: 1, p: 1.3 }] }),
  minebrute: A2({ name: "Gristle", lv: 14, art: "bandit3", hp: 330, atk: 27, def: 11, spd: 6, xp: 170, coins: [10, 20], drops: [["club", 0.4]], note: "the overseer's man, who does the lifting and the hitting",
    moves: [{ n: "Haymaker", k: "hit", w: 3, p: 1.25 }, { n: "Shoulder through", k: "two", w: 1, p: 0.9 }, { n: "Brace", k: "guard", w: 1, p: 2, anim: "guard" }] }),
  overseer: A2({ name: "Overseer Joss Vantry", lv: 14, art: "knight2", hp: 380, atk: 26, def: 11, spd: 9, xp: 260, coins: [40, 60], drops: [["boots", 0.3]], boss: true, note: "kept the ledger, and the whip, and the keys",
    moves: [MV.hit, { n: "Whip crack", k: "all", w: 2, p: 0.7 }, { n: "Rally Gristle", k: "buff", w: 1, p: 1.2, anim: "guard" }, { n: "Shield up", k: "guard", w: 1, p: 2, anim: "guard" }] }),
  stonewarden: A2({ name: "The Stone Warden", lv: 15, art: "warden", hp: 720, atk: 28, def: 14, spd: 5, xp: 420, coins: [0, 0], weak: ["storm", "light"], resist: ["stone", "cold", "fire"], boss: true, note: "set at the shrine's door when the word was first cut, and fooled only once",
    moves: [{ n: "Slam", k: "hit", w: 3, p: 1.15 }, { n: "Quake", k: "all", w: 2, p: 0.7 }, { n: "Speak the word", k: "charge", w: 1, say: "The warden's crystals blaze. It is saying something, very slowly...", then: { n: "The First Word", k: "all", p: 1.3, el: "light" } }] }),
});

/* ---- southern Etharis: the curse's own creatures (Tiny Monsters pack), and the roads' Act 3 cutthroats ---- */
Object.assign(BTL_FOES, {
  cbear: A2({ name: "Skullmaw", lv: 13, art: "cbear", hp: 250, atk: 25, def: 10, spd: 6, xp: 120, coins: [2, 6], drops: [["pelt", 0.4], ["bone", 0.4]], weak: ["fire", "light"], resist: ["growth"],
    note: "a bear the curse got into; it wears its own skull on the outside now", moves: [{ n: "Maul", k: "hit", w: 3, p: 1.2 }, { n: "Wild swipe", k: "two", w: 1, p: 0.85 }] }),
  cseer: A2({ name: "Hollow Seer", lv: 12, art: "cseer", hp: 120, atk: 21, def: 6, spd: 10, xp: 96, coins: [3, 8], drops: [["batwing", 0.3], ["emberdust", 0.25]], weak: ["light"], resist: ["growth"],
    note: "it mutters in a voice that isn't its own, and the curse listens", moves: [{ n: "Hex", k: "hit", w: 3, shot: true, anim: "attack", proj: "hex", p: 1.1 }, { n: "Wither", k: "all", w: 1, p: 0.6, shot: true, anim: "attack", proj: "hex" }] }),
  cooze: A2({ name: "Grave Ooze", lv: 12, art: "cooze", hp: 170, atk: 20, def: 8, spd: 5, xp: 88, coins: [1, 4], drops: [["gel", 0.5]], weak: ["fire"], resist: ["cold"],
    note: "what the curse makes of a churchyard", moves: [{ n: "Engulf", k: "hit", w: 3, p: 1.1, dot: "poison", dotP: 0.5 }] }),
  chorn: A2({ name: "Bloodhorn", lv: 12, art: "chorn", hp: 130, atk: 24, def: 7, spd: 12, xp: 90, coins: [2, 6], drops: [["bone", 0.4], ["fang", 0.25]], weak: ["light", "cold"], resist: ["fire"],
    note: "small, fast, and mostly teeth", moves: [MV.hit, { n: "Gore", k: "hit", w: 1, p: 1.35, dot: "bleed", dotP: 0.5 }] }),
  cspike: A2({ name: "Bonespine", lv: 11, art: "cspike", hp: 100, atk: 22, def: 9, spd: 9, xp: 74, coins: [1, 4], drops: [["bone", 0.6]], weak: ["light"], resist: ["growth", "cold"],
    note: "it throws its own spines, and grows more", moves: [{ n: "Spine", k: "hit", w: 3, shot: true, anim: "attack", proj: "venom", p: 1.05 }] }),
  cgrub: A2({ name: "Ember Grub", lv: 12, art: "cgrub", hp: 140, atk: 22, def: 8, spd: 7, xp: 86, coins: [1, 5], drops: [["emberdust", 0.5]], weak: ["cold"], resist: ["fire"],
    note: "it is warm to the touch, and then very warm", moves: [MV.bite, { n: "Spit embers", k: "two", w: 1, p: 0.8, el: "fire" }] }),
  roadknife: A2({ name: "Road Knife", lv: 11, art: "bandit1", hp: 120, atk: 21, def: 6, spd: 11, xp: 76, coins: [6, 12], drops: [["dagger", 0.08], ["bandage", 0.25]], when: "day", note: "takes your purse, then your boots",
    moves: [MV.hit, { n: "Low blow", k: "hit", w: 1, p: 0.8, dot: "bleed", dotP: 0.7 }] }),
  roadbow: A2({ name: "Road Archer", lv: 11, art: "archer", hp: 96, atk: 21, def: 4, spd: 11, xp: 72, coins: [4, 10], drops: [["arrows", 0.4]], bow: true, when: "day", note: "never closer than a bowshot", moves: [MV.shot("arrow")] }),
  roadbrute: A2({ name: "Road Brute", lv: 12, art: "bandit2", hp: 170, atk: 23, def: 9, spd: 7, xp: 88, coins: [6, 12], drops: [["club", 0.1]], when: "day", note: "a wall with a grudge and a toll",
    moves: [MV.hit, { n: "Crushing blow", k: "hit", w: 1, p: 1.4 }] }),
});

/* ---- the Covenant, when it comes for a weaver with too much scrutiny on them ---- */
Object.assign(BTL_FOES, {
  covguard: A2({ name: "Covenant Guard", lv: 12, art: "sp_recruit", hp: 160, atk: 22, def: 10, spd: 9, xp: 70, coins: [4, 9], drops: [["bandage", 0.3]], note: "following orders, mostly",
    moves: [MV.hit, { n: "Shield bash", k: "hit", w: 1, p: 1.15 }, { n: "Shield up", k: "guard", w: 1, p: 2, anim: "guard" }] }),
  covarbiter: A2({ name: "Inquisitor's Weaver", lv: 13, art: "sp_curate", hp: 200, atk: 21, def: 8, spd: 10, xp: 120, coins: [10, 20], drops: [["gtonic", 0.4]], weak: ["mind"], note: "a Covenant weaver, sent to bring in an unregistered one",
    moves: [{ n: "Binding word", k: "hit", w: 3, shot: true, anim: "cast", proj: "bolt", el: "force", p: 1.1 }, { n: "Ward the guards", k: "buff", w: 1, p: 1.15, anim: "cast" }] }),
});

/* humanoid foes stand at the party's height: the warrior-pack bandits were baked a head taller than everyone else */
for (const k in BTL_FOES) { const f = BTL_FOES[k]; if (["bandit1", "bandit2", "bandit3", "archer"].includes(f.art) && !f.__hscaled) { f.scale = (f.scale || 1) * 0.8; f.__hscaled = true; } }

/* ---- balance pass (t2/balance.js, attack-only floor): the curse and the Crags were too soft for where they sit,
   the Aurelm gate fight too hard for a fight you can't avoid, and the warden too easy for the act's last boss ---- */
for (const k of ["cbear", "cseer", "cooze", "chorn", "cspike", "cgrub"]) { const f = BTL_FOES[k]; f.hp = Math.round(f.hp * 1.3); f.atk = Math.round(f.atk * 1.15); f.xp = Math.round(f.xp * 1.2); }
for (const k of ["skelmin", "skelfore", "ent", "entdead", "minguard", "crwolf", "crfrost"]) { const f = BTL_FOES[k]; f.hp = Math.round(f.hp * 1.2); f.atk = Math.round(f.atk * 1.12); f.xp = Math.round(f.xp * 1.1); }
Object.assign(BTL_FOES.purbrand, { hp: 270, atk: 23 });
Object.assign(BTL_FOES.stonewarden, { hp: 980, atk: 31, def: 15 });
BTL_FOES.ent.spd = 7;
