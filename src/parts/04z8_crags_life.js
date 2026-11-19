/* ------------------------------------------------------------------ */
/* The Western Crags (Act 3): the masons' camp, Cinder Hollow and      */
/* Grimscar Mine (Hakon's brother, sold on to the Capital), the ambush */
/* on the switchbacks, the Unbound fire, the old observatory, the tarn,*/
/* and the Shrine of the First Word, where the stone warden remembers  */
/* the thief's name. The maps are in 04z7_crags.js.                    */
/* ------------------------------------------------------------------ */

/* ---------- rooms ---------- */
const CR_DOORS = {
  cr_overseer: { map: "cr01", door: [39, 41], name: "The Overseer's House", w: 14, h: 9, floor: "o" },
  cr_bunk: { map: "cr01", door: [54, 40], name: "The Bunkhouse", w: 16, h: 9, floor: "o" },
  cr_cook: { map: "cr01", door: [68, 40], name: "The Cookhouse", w: 12, h: 8, floor: "s" },
  cr_forge: { map: "cr01", door: [38, 62], name: "The Hollow Forge", w: 12, h: 8, floor: "s" },
  cr_store: { map: "cr01", door: [74, 62], name: "The Company Store", w: 12, h: 8, floor: "o" },
  cr_hut: { map: "cr00", door: [71, 52], name: "The Tarn Hut", w: 10, h: 7, floor: "o" },
};
const CR_PROPS = {
  cr_overseer: [{ p: "desk", x: 6, y: 2, lk: "crdesk" }, { p: "chair", x: 7, y: 3 }, { p: "shelf", x: 1, y: 2, v: 1 }, { p: "bed", x: 11, y: 2, v: 1 }, { p: "chest", x: 12, y: 6, id: "c_cr_house" }, { p: "lantern", x: 4, y: 0 }],
  cr_bunk: [{ p: "bed", x: 1, y: 2, v: 0 }, { p: "bed", x: 3, y: 2, v: 0 }, { p: "bed", x: 5, y: 2, v: 0 }, { p: "bed", x: 10, y: 2, v: 0 }, { p: "bed", x: 12, y: 2, v: 0 }, { p: "bed", x: 14, y: 2, v: 0 },
    { p: "straw", x: 2, y: 6 }, { p: "straw", x: 13, y: 6 }, { p: "barrel", x: 8, y: 2 }],
  cr_cook: [{ p: "fireplace", x: 1, y: 0 }, { p: "cauldron", x: 4, y: 3, lk: "crstew" }, { p: "table", x: 7, y: 4, v: 0 }, { p: "sack", x: 10, y: 2 }, { p: "barrel", x: 10, y: 5 }],
  cr_forge: [{ p: "forge", x: 2, y: 2 }, { p: "anvil", x: 5, y: 3, lk: "crchains" }, { p: "tools", x: 8, y: 0 }, { p: "rack", x: 10, y: 2, lk: "chainrack" }, { p: "barrel", x: 10, y: 5 }],
  cr_store: [{ p: "shelf", x: 1, y: 2, v: 2 }, { p: "crate", x: 4, y: 2 }, { p: "crate", x: 5, y: 2 }, { p: "sack", x: 9, y: 2 }, { p: "barrel", x: 10, y: 2 }, { p: "table", x: 5, y: 5, v: 0, lk: "crtally" }],
  cr_hut: [{ p: "fireplace", x: 1, y: 0 }, { p: "bed", x: 7, y: 2, v: 1 }, { p: "sack", x: 4, y: 2, lk: "fishnets" }, { p: "barrel", x: 8, y: 4 }],
};
for (const id in CR_DOORS) {
  const r = CR_DOORS[id], mat = Math.floor(r.w / 2) - (r.w % 2 ? 0 : 1);
  MAP_DEFS[id] = { name: r.name, outside: false, act2: true, act3: true, rows: ashRoom(r.w, r.h, mat, r.floor), props: CR_PROPS[id] || [],
    warps: [{ x: mat, y: r.h - 1, to: r.map, tx: r.door[0], ty: r.door[1] + 1, dir: "down" }] };
  MAP_DEFS[r.map].warps.push({ x: r.door[0], y: r.door[1], to: id, tx: mat, ty: r.h - 2, dir: "up" });
}
/* the Pillars of the Crags */
Object.assign(PILLAR_NAMES, { crags_camp: "the masons' camp", crags_tarn: "the high tarn" });
for (const id of ["cr00", "cr10", "cr01", "cr11"]) for (const p of MAP_DEFS[id].pillars || []) if (!PILLARS[p.id]) PILLARS[p.id] = { map: id, name: PILLAR_NAMES[p.id], at: [p.tx, p.ty + 2, "down"] };
const CR_LOOKS = {
  door: ["Barred from inside.", "Locked. Scratched into the door: 41 DAYS. Then a lot of lines."],
  pass: ["The old way through the mountain, open again. The masons have stacked the Covenant's stamped stones beside the mouth like loaves."],
};
for (const id of ["cr00", "cr10", "cr01", "cr11"]) MAP_DEFS[id].looks = Object.assign({}, CR_LOOKS, MAP_DEFS[id].looks || {});
Object.assign(LOOK_TEXT, {
  masontarp: ["A tarp over sacks of lime and a mason's level. Someone has written VAULTWARDEN'S ORDER on every sack, in case anyone forgets."],
  masonstone: ["Covenant stone, every block stamped with the seal. Laid this summer, taken down this autumn. The masons are not amused."],
  masontools: ["Picks, wedges, a sledge with a split handle. Good tools, worked hard."],
  orecart: ["An ore cart on bent rails. Grey rock with a blue thread through it: silver, a little, not much."],
  orecrate: ["A crate of sorted ore, tallied in chalk. The tallies stop in midsummer."],
  orecart2: ["An ore cart."],
  chainrack: ["Chains. Lengths of them, and leg-irons, numbered. Some of the numbers are scratched out."],
  hollowfire: ["The yard fire: a heap of wet slag-coal giving more smoke than warmth."],
  picks: ["Miners' picks, worn to the haft. The handles are dark where hands held them for years."],
  crdesk: ["The factor's desk: a tally of stores, going down; a tally of workers, going down; a letter to the Company, never sent, because nothing has gone down the pass since the wall."],
  crstew: ["Stew, mostly water. A turnip has been through it at some point."],
  crchains: ["Chains on the anvil, half re-forged. Lighter links, cleverly made: the kind that look strong and aren't."],
  crtally: ["The Company store's book. Each worker owes the Company more than the Company has ever paid him."],
  fishnets: ["Nets drying on a frame. Tarn trout: small, silver, very cold."],
  supplycart: ["A Covenant supply cart: lime, rope, lamp oil, bread for the masons. One wheel scorched black."],
  supplycrate: ["Lamp oil, crated. The Purifiers would have had a lovely fire."],
  pilgrimcandles: ["Pilgrims' candles, centuries of them, melted into one long ridge of wax. A few are recent."],
  obsplinth: ["A stone plinth where an instrument once stood: brass fittings sheared off, the bolt-holes rusted. Lines cut in the top run toward the four Pillars of the south."],
});
ITEMS.crkeys = { name: "The overseer's keys", quest: true, desc: "A ring of iron keys from Overseer Vantry's belt: the pens, the chains, the store." };
ITEMS.ore = { name: "Silver ore", sell: 6, cat: "salvage", desc: "Grey rock with a blue-white thread of silver through it." };
ITEMS.resin = { name: "Pine resin", sell: 4, cat: "herb", desc: "Amber resin from an old pine. Burns hot, and smells of the mountains." };
Object.assign(CHEST_LOOT, { c_cr_obs: [60, { gtonic: 1, ink: 2 }], c_cr_mine1: [45, { ore: 2, gpoultice: 1 }], c_cr_mine2: [80, { ore: 3, antidote: 1 }], c_cr_overseer: [150, { gpoultice: 2, gtonic: 1 }], c_cr_house: [40, { bread: 2 }] });

/* ---------- people ---------- */
const CR_FREE = (f) => !!f.cr_freed, CR_UNB = (f) => !!f.cr_unb_ok, CR_SKIRM = (f) => !!f.cr_skirm_won, CR_OVER = (f) => !!f.cr_overseer_won;
const crLook = (o) => ({ cloth: 3, outfit: "tunic", mood: "neutral", ...o });
Object.assign(NPC_DEFS, {
  crtull: { name: "Master Mason Orrin Tull", title: "The Vaultwarden's masons", look: crLook({ skin: 1, hair: 5, beard: true, cloth: 5, apron: "#6a5a4a", age: true }),
    schedule: [{ h: 0, map: "cr11", x: 66, y: 28, w: 1, where: "the masons' camp" }] },
  crwynn: { name: "Wynn", title: "Quartermaster", look: crLook({ sex: "f", skin: 2, hair: 1, cloth: 4, outfit: "coat" }), schedule: [{ h: 0, map: "cr11", x: 60, y: 28, w: 0, where: "the masons' camp" }] },
  crmason1: { name: "A mason", title: "", look: crLook({ skin: 0, hair: 2, apron: "#6a5a4a" }), schedule: [{ h: 0, map: "cr11", x: 78, y: 28, w: 2, where: "the masons' camp" }] },
  crmason2: { name: "A mason", title: "", look: crLook({ skin: 2, hair: 0, apron: "#6a5a4a" }), schedule: [{ h: 0, map: "cr11", x: 73, y: 27, w: 1, where: "the masons' camp" }] },
  crguard1: { name: "Company guard", title: "Cinder Hollow", look: crLook({ skin: 1, hair: 1, helm: true, cloth: 6, outfit: "coat" }),
    schedule: [{ h: 0, map: "cr01", x: 82, y: 44, w: 0, where: "the Hollow gate" }], flagSched: [{ when: CR_FREE, e: { h: 0, map: null } }] },
  crguard2: { name: "Company guard", title: "The mine gate", look: crLook({ skin: 2, hair: 0, helm: true, cloth: 6, outfit: "coat" }),
    schedule: [{ h: 0, map: "cr01", x: 51, y: 33, w: 0, where: "the mine gate" }], flagSched: [{ when: (f) => !!f.cr_mine_in, e: { h: 0, map: null } }] },
  crguard3: { name: "Company guard", title: "The mine gate", look: crLook({ skin: 0, hair: 2, helm: true, cloth: 6, outfit: "coat" }),
    schedule: [{ h: 0, map: "cr01", x: 54, y: 33, w: 0, where: "the mine gate" }], flagSched: [{ when: (f) => !!f.cr_mine_in, e: { h: 0, map: null } }] },
  crdorrit: { name: "Factor Dorrit Haye", title: "Grimscar Delving Company", look: crLook({ sex: "f", skin: 0, hair: 3, hairStyle: "bun", cloth: 6, outfit: "coat", glasses: true }),
    schedule: [{ h: 0, map: "cr_overseer", x: 6, y: 5, w: 1, where: "the overseer's house" }], flagSched: [{ when: CR_FREE, e: { h: 0, map: null } }] },
  crpellam: { name: "Old Pellam", title: "In the pens", look: crLook({ skin: 1, hair: 5, beard: true, cloth: 0, age: true }),
    schedule: [{ h: 0, map: "cr01", x: 46, y: 53, w: 0, where: "the pens" }], flagSched: [{ when: CR_FREE, e: { h: 0, map: "cr01", x: 58, y: 58, w: 2, where: "the yard" } }] },
  crwork1: { name: "A worker", title: "In the pens", look: crLook({ skin: 2, hair: 0, cloth: 0 }),
    schedule: [{ h: 0, map: "cr01", x: 54, y: 53, w: 0, where: "the pens" }], flagSched: [{ when: CR_FREE, e: { h: 0, map: "cr01", x: 64, y: 60, w: 3, where: "the yard" } }] },
  crwork2: { name: "A worker", title: "In the pens", look: crLook({ sex: "f", skin: 1, hair: 4, cloth: 0, outfit: "dress" }),
    schedule: [{ h: 0, map: "cr01", x: 62, y: 53, w: 0, where: "the pens" }], flagSched: [{ when: CR_FREE, e: { h: 0, map: "cr01", x: 70, y: 48, w: 3, where: "the yard" } }] },
  crwork3: { name: "A worker", title: "In the pens", look: crLook({ skin: 0, hair: 3, cloth: 0 }),
    schedule: [{ h: 0, map: "cr01", x: 70, y: 53, w: 0, where: "the pens" }], flagSched: [{ when: CR_FREE, e: { h: 0, map: "cr01", x: 50, y: 46, w: 3, where: "the yard" } }] },
  crmeg: { name: "Meg Harrow", title: "Cook", look: crLook({ sex: "f", skin: 1, hair: 2, hairStyle: "bun", cloth: 0, apron: "#c8b898" }), schedule: [{ h: 0, map: "cr_cook", x: 6, y: 5, w: 1, where: "the cookhouse" }] },
  crruel: { name: "Ruel", title: "Chained to the forge", look: crLook({ skin: 2, hair: 1, beard: true, cloth: 3, apron: "#3a2e24" }), schedule: [{ h: 0, map: "cr_forge", x: 6, y: 5, w: 1, where: "the forge" }] },
  crvantry: { name: "Overseer Joss Vantry", title: "Grimscar Delving Company", look: crLook({ skin: 1, hair: 1, beard: true, cloth: 6, outfit: "coat" }),
    schedule: [{ h: 0, map: "cr_mine3", x: 20, y: 7, w: 0, where: "the seam's end" }], flagSched: [{ when: CR_OVER, e: { h: 0, map: null } }] },
  crgristle: { name: "Gristle", title: "The overseer's man", look: crLook({ skin: 2, hair: 0, cloth: 3 }),
    schedule: [{ h: 0, map: "cr_mine3", x: 17, y: 9, w: 0, where: "the seam's end" }], flagSched: [{ when: CR_OVER, e: { h: 0, map: null } }] },
  crsayer: { name: "Corporal Ada Sayer", title: "Covenant supply", look: crLook({ sex: "f", skin: 1, hair: 3, helm: true, cloth: 4, outfit: "coat" }), schedule: [{ h: 0, map: "cr10", x: 37, y: 57, w: 0, where: "the switchbacks" }] },
  crsup1: { name: "Covenant soldier", title: "Covenant supply", look: crLook({ skin: 2, hair: 1, helm: true, cloth: 4, outfit: "coat" }), schedule: [{ h: 0, map: "cr10", x: 36, y: 59, w: 0, where: "the switchbacks" }] },
  crpur1: { name: "Purifier", title: "On the switchbacks", look: crLook({ hood: true, cloth: 9, outfit: "coat", mood: "sly" }),
    schedule: [{ h: 0, map: "cr10", x: 43, y: 56, w: 0, where: "the switchbacks" }], flagSched: [{ when: CR_SKIRM, e: { h: 0, map: null } }] },
  crpur2: { name: "Purifier", title: "On the switchbacks", look: crLook({ hood: true, cloth: 9, outfit: "coat" }),
    schedule: [{ h: 0, map: "cr10", x: 44, y: 59, w: 0, where: "the switchbacks" }], flagSched: [{ when: CR_SKIRM, e: { h: 0, map: null } }] },
  crcorvin: { name: "Corvin Ash", title: "Of the Unbound", look: crLook({ skin: 2, hair: 1, hood: true, cloth: 5, outfit: "coat" }),
    schedule: [{ h: 0, map: null }], flagSched: [{ when: CR_UNB, e: { h: 0, map: "cr10", x: 75, y: 27, w: 1, where: "the Unbound fire" } }] },
  crlise: { name: "Lise", title: "The lookout", look: crLook({ sex: "f", skin: 0, hair: 4, hood: true, cloth: 5, outfit: "coat" }),
    schedule: [{ h: 0, map: null }], flagSched: [{ when: CR_UNB, e: { h: 0, map: "cr10", x: 78, y: 30, w: 0, where: "the Unbound fire" } }] },
  crnan: { name: "Nan Tarry", title: "Tarn fisher", look: crLook({ sex: "f", skin: 1, hair: 5, hood: true, cloth: 2, outfit: "coat", age: true }), schedule: [{ h: 0, map: "cr_hut", x: 4, y: 4, w: 1, where: "the tarn hut" }] },
});
const CR_NPCS = ["crtull", "crwynn", "crmason1", "crmason2", "crguard1", "crguard2", "crguard3", "crdorrit", "crpellam", "crwork1", "crwork2", "crwork3", "crmeg", "crruel", "crvantry", "crgristle",
  "crsayer", "crsup1", "crpur1", "crpur2", "crcorvin", "crlise", "crnan"];
for (const k of CR_NPCS) { NPC_DEFS[k].id = k; NPC_DEFS[k].act2 = true; }
Object.assign(CHIBI_MAP, { crsayer: "a2_covknight", crsup1: "a2_covxbow", crpur1: "n_sarn", crpur2: "n_sarn", crguard1: "a2_covknight", crguard2: "a2_covknight", crguard3: "a2_covxbow", crvantry: "n_brack", crgristle: "n_storek" });

/* ---------- shops ---------- */
Object.assign(SHOPS, {
  cr_wynn: { name: "The Quartermaster's Cart", keeper: "Wynn", stock: ["bandage", "spoultice", "gpoultice", "btonic", "gtonic", "antidote", "bread", "ration", "rope", "torchoil"], bonus: ["hide", "food"], mult: 1.2, buy: 0.9, purse: 300 },
  cr_nan: { name: "Nan's Catch", keeper: "Nan", stock: ["bread", "ration"], bonus: ["food", "herb"], only: ["food", "herb"], mult: 1, buy: 1, purse: 80 },
});

/* ---------- talk ---------- */
const kv = (who, t) => ({ who, t });
const crWith = (c, id, t) => (inParty(c.G, id) ? [kv(id, t)] : []);
const crComp = (G, t) => (typeof compKey === "function" && inParty(G, compKey(G)) ? [kv("unchosen", t)] : []);
const crHak = (G, t) => (inParty(G, "hakon") ? [kv("hakon", t)] : []);
Object.assign(SCRIPTS, {
  crtull: (c) => [kv("crtull", c.flag("met_crtull") ? c.rot("crtull", ["We laid that wall in midsummer. Now we take it down. The Covenant pays either way.",
    "Cinder Hollow's west along the Cleft. Nobody's come out of it since the wall. Nobody's gone in. You'd be the first.",
    "The pilgrim path goes up past the tarn to the shrine. Wolves on the rocks. Worse in the pines, they say. Trees that walk."])
    : "Travellers? Through the tunnel? Hm. The Vaultwarden's letter said you'd come. Orrin Tull. Mind the loose stuff overhead."), { do: (c) => c.set("met_crtull") }],
  crwynn: (c) => [kv("crwynn", c.rot("crwynn", ["Mountain prices. Everything came up a rope.", "Lamp oil's short. A supply cart's overdue from the switchbacks.", "Buy, or stand aside for the masons."])),
    { choice: [["Trade", [{ shop: "cr_wynn" }]], ["Goodbye.", []]] }],
  crmason1: (c) => [kv("crmason1", c.rot("crmason1", ["Stone in, stone out.", "Cold up here. Colder at night.", "Heard screaming from the Hollow, first night. Not since."]))],
  crmason2: (c) => [kv("crmason2", c.rot("crmason2", ["Mind the cart.", "Tull's all right. Tull pays.", "The pines moved. I swear the pines moved."]))],
  crguard1: (c) => [kv("crguard1", c.rot("crguard1", ["Company ground. Buy, sell, or keep walking.", "Covenant? From the wall? ...Are they letting us out?", "Don't feed the ones in the pens. Factor's orders."]))],
  crguard2: (c) => {
    if (c.flag("cr_mine_in")) return [kv("crguard2", "...")];
    return [kv("crguard2", "Workers and the overseer's people only. Overseer's down the Seam. Overseer doesn't like visitors."),
      ...crHak(c.G, "Then I will visit him. Move."),
      { choice: [
        ["\"Stand aside, or be moved.\"", [kv("crguard2", "Three of them and a sellsword. Right."), { fight: { foes: ["minguard", "minguard"], win: "cr_mine_in" } }]],
        ["Leave it for now", [kv("crguard2", "That's right.")]],
      ] }];
  },
  crguard3: (c) => SCRIPTS.crguard2(c),
  crdorrit: (c) => [kv("crdorrit", c.flag("met_crdorrit") ? c.rot("crdorrit", ["The Company holds a Covenant licence. A real one. The wall was not in the licence.",
    "Food for nine days. Then we start deciding who eats.", "The overseer keeps the ledger. The overseer keeps the keys. The overseer is down the Seam and won't come up."])
    : "You came through the pass? Then the wall's down? Thank the Archon. I'm the Company's factor. Whatever you've heard, we have a licence."), { do: (c) => c.set("met_crdorrit") }],
  crpellam: (c) => {
    const s = qs(c.G, "q_arthur");
    if (c.flag("cr_freed")) return [kv("crpellam", c.rot("crpellam", ["Out of the pens. Air's the same. Tastes different.", "We'll go down the tunnel with the masons. Then home, those that have one.", "Tell your big man I'm sorry. Tell him Arthur talked about him."]))];
    if (s === 3 && c.has("crkeys")) return [
      kv("narrator", "The overseer's keys turn stiff in the locks, one pen after another. Nobody moves at first. Then everybody does."),
      kv("crpellam", "...Out. We're out. Ruel! Meg! They're out!"),
      ...crHak(c.G, "Go home, old man. Go home and eat."),
      { do: (c) => { c.take("crkeys", 1); c.set("cr_freed"); c.set("q_arthur", 4); } },
      kv("narrator", "The Company's guards look at the workers, and at you, and leave by the east gate without a word. Factor Haye goes with them."),
    ];
    const out = [kv("crpellam", "Water? No? Then what do you want with an old man in a pen?")];
    if (s >= 1 && s < 2) out.push(...crHak(c.G, "A young man. Tall. Red hair like mine, and a smith's hands. Arthur. Was he here?"),
      kv("crpellam", "Arthur. The smith-boy. He was here. He made the chains lighter when he mended them; did it so the guards never knew."),
      kv("crpellam", "The overseer took him down the Seam at midsummer, with the other one who knew a forge. Came back up without them. Whatever happened is in that man's book."),
      kv("crpellam", "He's still down there. Vantry. The overseer. Since the wall he won't come up. Thinks there's silver enough at the Seam's End to buy his way out."),
      ...crHak(c.G, "Then I go down."),
      { do: (c) => c.set("q_arthur", 2) });
    else if (s === 2 || s === 3) out.push(kv("crpellam", s === 3 ? "The keys. You have Vantry's keys? Then open it. Please." : "The Seam's End. Down past the flooded working. Mind the dead: they still dig."));
    return out;
  },
  crwork1: (c) => [kv("crwork1", c.flag("cr_freed") ? c.rot("crwork1", ["Free. I keep saying it.", "Thank you.", "The masons are giving us bread. Real bread."]) : c.rot("crwork1", ["Don't. They'll see you talking.", "Forty-one days since the wall.", "Water."]))],
  crwork2: (c) => [kv("crwork2", c.flag("cr_freed") ? c.rot("crwork2", ["I'm from Millhaven. I'm going back to Millhaven.", "Bless you.", "They said the Covenant licensed this. Did it?"]) : c.rot("crwork2", ["Go away. Please.", "They took my brother down the Seam. He didn't come back.", "I'm not crying. It's the smoke."]))],
  crwork3: (c) => [kv("crwork3", c.flag("cr_freed") ? c.rot("crwork3", ["Mind if I just sit?", "I'll walk down that tunnel on my knees if I have to.", "The overseer? Good."]) : c.rot("crwork3", ["...", "The dead work the deep shafts now. We hear them.", "Bread. Just bread."]))],
  crmeg: (c) => [kv("crmeg", c.flag("cr_freed") ? c.rot("crmeg", ["I'm cooking for everyone now. Proper portions. Let the Company sue me.", "Sit. Eat. You look like the mountain chewed you.", "Arthur used to bring me the scrapings from the forge for the fire. Kind boy."])
    : c.rot("crmeg", ["Stew. Such as it is.", "I'm Company. I cook. I don't ask.", "...Some of them are children. Did you see? Some of them are children."]))],
  crruel: (c) => [kv("crruel", c.flag("cr_freed") ? c.rot("crruel", ["Arthur taught me the trick with the links. Lighter, so a man can break them if he has to.", "I'll forge something honest now. Horseshoes. Nails.", "The Foundry buys smiths. That's what the overseer said, when he took Arthur."])
    : c.rot("crruel", ["Chained to the anvil. Good chain. I made it.", "Arthur? The boy who taught me lighter links. Gone down the Seam, with Vantry.", "Don't look at the chains. Look at the links. Third one. You'll see."]))],
  crvantry: (c) => [kv("crvantry", "Out of my seam.")],
  crgristle: (c) => [kv("crgristle", "...")],
  crsayer: (c) => [kv("crsayer", c.flag("cr_skirm_won") ? c.rot("crsayer", ["I've lime and lamp oil for the masons, and my life, thanks to you.", "Purifiers this high up. They're after the shrine. Or after us. Same thing to them.", "If you go up the pilgrim path, go armed."])
    : "Stay back!")],
  crsup1: (c) => [kv("crsup1", c.flag("cr_skirm_won") ? c.rot("crsup1", ["Thanks.", "Never seen fire do that.", "We'll make the camp by dark."]) : "Hold the cart!")],
  crpur1: (c) => [kv("crpur1", "Burn it.")], crpur2: (c) => [kv("crpur2", "...")],
  crcorvin: (c) => [kv("crcorvin", c.rot("crcorvin", [
    "Sit by the fire. You're among friends here, or at least among people who aren't trying to kill you.",
    "A man in black came up the pilgrim path in the spring, before the wall. Polite. Left black thread knotted in our snares, as if to show us how it's done.",
    "The Foundry in the Capital buys hands. Smiths, mostly. Nobody asks where from. The Covenant certainly doesn't.",
    "Ysra sent word you might come. She says you ask good questions. Keep asking them."])),
    { choice: [["Rest by the fire", [{ do: (c) => c.innRest(true) }]], ["Not now.", []]] }],
  crlise: (c) => [kv("crlise", c.rot("crlise", ["Eyes on the goat track. Always.", "Purifiers on the switchbacks again. Two days running.", "Ents in the old pines. They leave you alone if you leave the trees alone."]))],
  crnan: (c) => [kv("crnan", c.rot("crnan", ["Tarn trout. Small, silver, very cold. Want some?", "Lights at the shrine, in the spring. First in forty years. Then nothing.", "The warden? A stone that stands up. My granny said. I never asked it anything."])),
    { choice: [["Buy", [{ shop: "cr_nan" }]], ["Goodbye.", []]] }],
  look_overledger: (c) => c.flag("cr_overseer_won") ? [kv("narrator", "The overseer's ledger, open where Hakon left it. Midsummer: TWO HANDS SOLD TO THE ARCHON'S FOUNDRY, CAPITAL. ONE NAMED ARTHUR, SMITH-TRAINED.")]
    : [kv("narrator", "A ledger on the desk, bound in black. The overseer is standing in front of it.")],
  look_oldshaft: (c) => [kv("narrator", "An old shaft, boarded over. Something down there knocks back when you knock.")],
  look_obsnotes: (c) => {
    const G = c.G;
    if (!c.flag("cr_obs") && typeof compKey === "function" && inParty(G, compKey(G))) return [
      kv("narrator", "Mouldered notebooks under a fallen slab: leyline charts, star tables, and on the inside of one cover, eight names in eight different hands."),
      kv("unchosen", "...That's mine. That's my hand. Fourth line down."),
      kv("unchosen", "Every summer the College sent its best Initiates up here to chart the leylines. My year came. Eight of us, and a Master."),
      kv("unchosen", "Seven of us went back down."),
      ...(inParty(G, "tessa") ? [kv("tessa", "What happened to the eighth?")] : []),
      kv("unchosen", "Not yet. I'll tell you. Just... not here. Not yet."),
      { do: (c) => c.set("cr_obs") }];
    return [kv("narrator", c.flag("cr_obs") ? "The Initiates' notebooks, and the eight names inside the cover." : "Mouldered notebooks under a fallen slab: leyline charts and star tables, in careful student hands. Inside one cover, eight names.")];
  },
  look_sealplinth: (c) => [kv("narrator", c.flag("cr_warden_won") ? "The plinth, its socket empty. The word cut into the stone around it is too old to read, and too sharp to be that old." : "A plinth of black stone, and in its socket a palm-sized stone cut with a single word. Between you and it, the shrine's floor is very still.")],
  look_vexmark: (c) => [kv("narrator", c.flag("cr_warden_won") ? "A burnt-out torch, and snagged on the rock, a twist of black silk thread, knotted three times. Kellan Vex's mark, left where he knew someone would find it." : "A burnt-out torch, months old, and snagged on the rock, a twist of black silk thread knotted three times.")],
});

/* ---------- things that start when you walk into them ---------- */
Object.assign(SCRIPTS, {
  trig_crskirm: (c) => {
    if (c.flag("cr_skirm_won")) return [];
    return [
      kv("narrator", "Round the bend: a Covenant supply cart with a scorched wheel, two soldiers behind it, and three hooded Purifiers walking up the road toward them with fire in their hands."),
      kv("crsayer", "Lime and lamp oil for the masons! That's all! There's no magic in a sack of lime!"),
      kv("crpur1", "The masons open the way to the shrine. The shrine keeps a word. The word keeps the Vault. The man in black told us. All of it burns."),
      ...crComp(c.G, "\"The man in black.\" They've talked to someone who knows exactly what's in that shrine."),
      { choice: [["Step in", [kv("narrator", "You step between the cart and the fire.")]], ["Hang back", [kv("narrator", "You hang back. The nearest Purifier turns anyway, and sees a weaver.")]]] },
      kv("crpur1", "Another one. They breed in the Covenant's shadow. Burn the cart. Burn them."),
      { fight: { foes: ["purbrand", "purburner", "pscout"], win: "cr_skirm_won" } },
    ];
  },
  trig_unbfire: (c) => {
    if (c.flag("cr_unb_ok")) return [];
    if (c.has("unbthread")) return [
      kv("narrator", "An arrow thuds into the pine beside your head. A woman's voice from the rocks above: \"That's your warning. The next one isn't.\""),
      kv("narrator", "You hold up Ysra's red thread, knotted three times."),
      kv("crlise", "...Red. Knotted right. All right. Come up slow, hands where I can see them."),
      kv("crcorvin", "Ysra's thread. You'll be the ones from Millhaven. Sit down. You look like the mountain's been chewing on you."),
      { do: (c) => c.set("cr_unb_ok") }];
    if (c.flag("cr_unb_warned")) return [kv("narrator", "From the rocks above, the creak of a bowstring. Nobody says anything. Nobody has to.")];
    return [kv("narrator", "An arrow thuds into the pine beside your head. A woman's voice from the rocks above: \"That's your warning. Turn round. The next one won't miss.\""),
      ...crComp(c.G, "Unbound. Careful ones. They'd rather warn than kill. Let's not test it."),
      { do: (c) => c.set("cr_unb_warned") }];
  },
  trig_overseer: (c) => {
    if (c.flag("cr_overseer_won")) return [];
    return [
      kv("narrator", "The Seam's End: lamps, a desk dragged down from the house, crates of ore, and a man in a good coat counting silver into a box. A giant of a man stands beside him with a pick handle."),
      kv("crvantry", "Company ground. Company seam. I don't know who you are and I don't want to."),
      ...crHak(c.G, "A smith. Red hair. Arthur. Where is he?"),
      kv("crvantry", "Gone. Sold. Paid for, fair and square, with Covenant silver. You want him, take it up with the Covenant."),
      kv("crvantry", "Gristle. Make them go away."),
      { fight: { foes: ["overseer", "minebrute"], win: "cr_overseer_won" } },
    ];
  },
  trig_warden: (c) => {
    if (c.flag("cr_warden_won")) return [];
    const G = c.G;
    return [
      kv("narrator", "The inner shrine. Candles, centuries of them. A black plinth with a stone in it. And in front of the plinth, what you took for a heap of fallen rock stands up."),
      kv("narrator", "Crystals along its back light, one after another, the colour of old gold. When it speaks, the floor speaks with it."),
      { who: "narrator", t: "\"NAME YOURSELF. ALL WHO COME BEFORE THE WORD MUST.\"" },
      { choice: [
        [`"${G.name}."`, [{ who: "narrator", t: `"${G.name.toUpperCase()}. A TRUE NAME. I HEAR IT."` }]],
        ["Give a false name", [{ who: "narrator", t: "\"THAT IS NOT YOUR NAME.\"" }]],
      ] },
      { who: "narrator", t: "\"ONE CAME IN THE SPRING AND NAMED HIMSELF TRULY. KELLAN VEX. HE ASKED TO READ THE WORD, AS PILGRIMS MAY. I LET HIM.\"" },
      { who: "narrator", t: "\"THEN HE WENT DOWN THE MOUNTAIN AND SPOKE IT AT THE VAULT, AND BROKE WHAT IT KEPT. I WILL NOT BE A DOOR FOR THIEVES TWICE.\"" },
      ...(inParty(G, "tessa") ? [kv("tessa", "Kellan Vex. Here. He was here.")] : []),
      { who: "narrator", t: "\"IF YOU WOULD MEND WHAT HE BROKE, PROVE YOU ARE NOT WHAT HE WAS.\"" },
      { fight: { foes: ["stonewarden"], win: "cr_warden_won" } },
    ];
  },
});
QUEST_WIN_HOOKS.push((G, foes, quest) => {
  const f = G.flags;
  if (quest === "cr_mine_in") return [{ who: "narrator", t: "The last guard drops his cudgel and runs for the bunkhouse. The mine mouth is open." }];
  if (quest === "cr_skirm_won") {
    giveItem(G, "gpoultice", 2); giveItem(G, "torchoil", 2);
    return [{ who: "narrator", t: "The last Purifier's fire gutters out on the road. The cart's other wheel is still turning, very slowly." },
      { who: "crsayer", t: "Archon's breath. You... thank you. They'd have burned the cart and us on it." },
      { who: "crsayer", t: "Take some of this. Lamp oil, poultices. The masons can spare it; they'd have lost the lot." },
      { who: "narrator", t: "Corporal Sayer gives you two good poultices and two flasks of lamp oil." },
      ...(inParty(G, compKey(G)) ? [{ who: "unchosen", t: "\"The man in black told us.\" We should find out who's talking to the Purifiers about the shrine." }] : [])];
  }
  if (quest === "cr_overseer_won") {
    f.q_arthur = Math.max(f.q_arthur | 0, 3); f.hakon_capital = true; giveItem(G, "crkeys", 1);
    return [{ who: "narrator", t: "Gristle goes down like a felled pine. The overseer drops his whip and tries to run; he doesn't get far, and then he is sitting on a crate of his own silver, very pale." },
      { who: "narrator", t: "On his desk, the ledger. Hakon finds the page before anyone else can." },
      { who: "narrator", t: "MIDSUMMER. TWO HANDS, SMITH-TRAINED, SOLD TO SUB-WARDEN HALE OF THE ARCHON'S FOUNDRY, CAPITAL CITY. CARRIED OUT BY COVENANT WAGON THE NIGHT BEFORE THE WALL. ONE NAMED ARTHUR." },
      ...(inParty(G, "hakon") ? [{ who: "hakon", t: "Alive. He was alive at midsummer. And the Covenant bought him. The Covenant." },
        { who: "hakon", t: "The Capital, then. When the road opens, I go to the Capital. I don't care what letter it takes." }] : []),
      ...(inParty(G, "tessa") ? [{ who: "tessa", t: "A Covenant wagon. Covenant silver. They told us they keep order." }] : []),
      { who: "narrator", t: "On the overseer's belt, a ring of iron keys. You take them. There are people in the pens up top." }];
  }
  if (quest === "cr_warden_won") {
    f.q_auseal = 2; f.vex_thief = true; giveItem(G, "sealstone", 1);
    const comp = typeof compKey === "function" && inParty(G, compKey(G));
    return [{ who: "narrator", t: "The warden sinks to one knee, then both, and its crystals dim to embers. It does not fall apart. It kneels." },
      { who: "narrator", t: "\"YOU ARE NOT WHAT HE WAS. TAKE THE STONE. MEND WHAT HE BROKE.\"" },
      { who: "narrator", t: "You lift the Sealstone from the plinth. It is cold as well water, and the word cut into it seems to move when you don't look straight at it." },
      { who: "narrator", t: "Kellan Vex. The man who burned Oakhaven. Who killed Odile looking for a book he had lost in a tavern." },
      { who: "narrator", t: "A book stolen from a vault far in the south. The Vault of Aurelm. The book in your satchel, that you never asked for." },
      ...(inParty(G, "tessa") ? [{ who: "tessa", t: "The Vaultwarden won't say what was taken. She doesn't need to. We know. We're carrying it." },
        { who: "tessa", t: "If anyone in Aurelm finds out, we don't leave Aurelm." }] : []),
      ...(comp ? [{ who: "unchosen", t: "You've had a stolen Vault book this whole time? ...All right. All right. We think about that later. We get the letter first." }] : []),
      ...(inParty(G, "hakon") ? [{ who: "hakon", t: "Then we say nothing, give the old woman her stone, and take her letter. Secrets are lighter carried than spoken." }] : []),
      { who: "narrator", t: "You take the Sealstone." }];
  }
  return null;
});

/* ---------- the task list ---------- */
ASH_QUESTS.push(["q_arthur", "The Mines of the Crags", ["", "Find word of Arthur in Cinder Hollow", "Get into Grimscar Mine and find the overseer", "Free the workers in the Hollow's pens"],
  ["", "The mining camp at the west end of the Cleft road", "The mine mouth is above the stockade. The Company's guards stand across it", "Old Pellam's pen, in the Hollow yard"]]);
QUEST_ENTER_HOOKS.push((G, id) => {
  const f = G.flags;
  if (id === "cr11" && !f.reached_crags) {
    f.reached_crags = true;
    return [{ who: "narrator", t: "Out of the tunnel into thin, cold air. The Western Crags: grey rock, black pines, snow on the heights, and a camp of Covenant masons blinking at you over their fire." },
      ...(inParty(G, "hakon") ? [{ who: "hakon", t: "The mines are west. Down the Cleft. I can smell the slag from here." }] : [])];
  }
  if (id === "cr01" && !f.reached_hollow) {
    f.reached_hollow = true; if (f.hakon_joined && !f.q_arthur) f.q_arthur = 1;
    return [{ who: "narrator", t: "Cinder Hollow. A stockade round a yard of slag and mud; a house, a bunkhouse, a forge; and in the middle of the yard, pens of stakes with people in them." },
      ...(inParty(G, "hakon") ? [{ who: "hakon", t: "Pens. For people. ...Look for an old one. The old ones always know." }] : [])];
  }
  if (id === "cr_mine1" && !f.reached_mine) { f.reached_mine = true; return [{ who: "narrator", t: "Grimscar Mine. Cold, wet, and somewhere below, the sound of picks. Nobody has worked the upper galleries since the wall. Something is working them now." }]; }
  if (id === "cr_shrine" && !f.reached_shrine) { f.reached_shrine = true; return [{ who: "narrator", t: "The Shrine of the First Word: a hall cut into the living rock, pillars left standing where the masons stopped. It is very quiet. Even your footsteps sound like they're listening." }]; }
  return null;
});
