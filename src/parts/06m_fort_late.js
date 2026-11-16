/* ------------------------------------------------------------------ */
/* The Fort's sparring roster: Covenant soldiers in practice kit.      */
/* Fought only in Captain Rennick's ring (04r_fort_life.js).           */
/* ------------------------------------------------------------------ */
for (const a of ["sp_recruit", "sp_corporal", "sp_initiate", "sp_sergeant", "sp_curate"]) HUMAN_ART.add(a);
Object.assign(BTL_FOES, {
  sp_recruit: A2({ name: "Recruit Tobin", lv: 12, art: "sp_recruit", hp: 130, atk: 19, def: 9, spd: 8, xp: 60, note: "eager, sturdy, and slow to learn",
    moves: [{ n: "Practice blade", k: "hit", w: 3 }, { n: "Shield up", k: "guard", w: 1, p: 2 }] }),
  sp_corporal: A2({ name: "Corporal Ashe", lv: 12, art: "sp_corporal", hp: 150, atk: 22, def: 10, spd: 9, xp: 72, note: "a crossbowman made to fight up close, and not pleased about it",
    moves: [{ n: "Measured cut", k: "hit", w: 3 }, { n: "Crossbow, at close range", k: "hit", w: 1, shot: true, p: 1.1 }] }),
  sp_initiate: A2({ name: "Initiate Merrow", lv: 13, art: "sp_initiate", hp: 120, atk: 24, def: 6, spd: 11, xp: 80, weak: ["cold"], resist: ["fire"], note: "one of the Arbitrator's fire students. Hot-headed",
    moves: [{ n: "Staff strike", k: "hit", w: 2 }, { n: "Ember bolt", k: "hit", w: 2, shot: true, anim: "cast", proj: "fire", el: "fire", p: 1.15 }] }),
  sp_sergeant: A2({ name: "Sergeant Kell", lv: 13, art: "sp_sergeant", hp: 190, atk: 24, def: 13, spd: 7, xp: 88, note: "twenty years on the wall. Waits for you to make a mistake",
    moves: [{ n: "Heavy cut", k: "hit", w: 3, p: 1.1 }, { n: "Shield wall", k: "guard", w: 2, p: 2, anim: "guard" }] }),
  sp_curate: A2({ name: "Curate Iselle", lv: 14, art: "sp_curate", hp: 160, atk: 26, def: 8, spd: 10, xp: 100, weak: ["mind"], resist: ["shock"], note: "a Weaver of the Covenant. Reads the bout like a page",
    moves: [{ n: "Rod strike", k: "hit", w: 2 }, { n: "Weave-bolt", k: "hit", w: 3, shot: true, anim: "cast", proj: "shock", el: "shock", p: 1.2 }] }),
});

/* Every townsperson has a sprite of their own (02n_npc_chibi_data.js); none is ever drawn with the player's. */
for (const k in NPC_SETS) if (!CHIBI_MAP[k]) CHIBI_MAP[k] = NPC_SETS[k];
