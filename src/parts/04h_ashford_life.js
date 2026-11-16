/* ------------------------------------------------------------------ */
/* Ashford: its rooms, its people, its shops and its nine quests.      */
/* The town map itself is generated into 04g_ashford.js.               */
/* ------------------------------------------------------------------ */

/* ---------- the Pillar: a Covenant stone, so no study here; it falters after dark until it is mended ---------- */
PILLARS.ash = { map: "ash", name: "Ashford", at: [26, 28, "up"], covenant: true };
MAP_DEFS.ash.stutter = "ash_fixed";
/* how brightly a stuttering Pillar burns right now: whole by day, or once mended; at night it gutters and drops out */
function pillarStutter(def, G, night, t) {
  if (!def || !def.stutter || !night || (G && G.flags && G.flags[def.stutter])) return 1;
  const k = Math.sin(t * 2.3) + Math.sin(t * 5.1 + 1.7) * 0.6 + Math.sin(t * 0.7) * 0.8;
  return k > 1.15 ? 0.12 : k > 0.9 ? 0.45 : 0.9;
}

/* ---------- rooms ---------- */
/* room(w, h, mat, floor, extra): a plastered back wall with windows, panelling, a floor, and a door mat in the front wall */
function ashRoom(w, h, mat, floor = "o", rows = {}) {
  const out = ["X" + Array.from({ length: w - 2 }, (_, i) => (i % 5 === 2 ? "Y" : "U")).join("") + "X", "X" + "L".repeat(w - 2) + "X"];
  for (let y = 2; y < h - 1; y++) out.push(rows[y] || "X" + floor.repeat(w - 2) + "X");
  out.push("X".repeat(mat) + "m" + "X".repeat(w - mat - 1));
  return out;
}
const ASH_DOORS = {
  ash_outpost: { door: [26, 10], name: "The Covenant Outpost", w: 16, h: 10, floor: "s" },
  ash_chapel: { door: [10, 22], name: "Ashford Chapel", w: 12, h: 10 },
  ash_thistle: { door: [42, 22], name: "The Purple Thistle", w: 18, h: 12 },
  ash_store: { door: [9, 40], name: "Hobb's Provisions", w: 12, h: 9 },
  ash_herb: { door: [18, 40], name: "Wort and Willow", w: 10, h: 8 },
  ash_smith: { door: [33, 40], name: "Ashford Smithy", w: 12, h: 9, floor: "s" },
  ash_tailor: { door: [42, 40], name: "Fine Cloth and Fittings", w: 10, h: 8 },
  ash_cooper: { door: [48, 40], name: "Tarn & Son", w: 10, h: 8 },
  ash_mill: { door: [34, 50], name: "Ashford Mill", w: 12, h: 9 },
  ash_cole: { door: [14, 49], name: "The Coles' Cottage", w: 10, h: 8 },
};
const ASH_ROOM_ROWS = {
  ash_outpost: { 4: "XssuuuuuuuuuussX", 5: "XssuuuuuuuuuussX" },
  ash_chapel: { 3: "XoooouuooooX", 4: "XoooouuooooX", 5: "XoooouuooooX", 6: "XoooouuooooX", 7: "XoooouuooooX", 8: "XoooouuooooX" },
  ash_thistle: { 4: "XKKKKKKooooooooooX", 2: "XooooooooooouuuooX", 3: "XooooooooooouuuooX" },
  ash_store: { 4: "XKKKKKKKKoKX" },
  ash_herb: { 4: "XKKKKKoooX" },
  ash_tailor: { 3: "XooouuoooX", 4: "XooouuoooX" },
};
const ASH_PROPS = {
  ash_outpost: [{ p: "painting", x: 3, y: 0 }, { p: "painting", x: 12, y: 0, v: 1 }, { p: "lantern", x: 6, y: 0 }, { p: "lantern", x: 10, y: 0 },
    { p: "desk", x: 7, y: 3, lk: "vdesk" }, { p: "chair", x: 8, y: 2 }, { p: "shelf", x: 1, y: 2, v: 0 }, { p: "shelf", x: 2, y: 2, v: 0 }, { p: "shelf", x: 13, y: 2, v: 0 }, { p: "shelf", x: 14, y: 2, v: 1 },
    { p: "books", x: 1, y: 5 }, { p: "candles", x: 5, y: 2 }, { p: "candles", x: 11, y: 2 }, { p: "chest", x: 14, y: 7 }, { p: "bench", x: 2, y: 7 }, { p: "plant", x: 1, y: 8 }, { p: "plant", x: 14, y: 8 }],
  ash_chapel: [{ p: "painting", x: 4, y: 0, v: 1 }, { p: "painting", x: 7, y: 0 }, { p: "candles", x: 4, y: 2 }, { p: "candles", x: 7, y: 2 }, { p: "candles", x: 10, y: 4 }, { p: "books", x: 1, y: 5 },
    { p: "desk", x: 5, y: 2, lk: "altar" }, { p: "bench", x: 2, y: 4, lk: "pew" }, { p: "bench", x: 8, y: 4, lk: "pew" }, { p: "bench", x: 2, y: 6, lk: "pew" }, { p: "bench", x: 8, y: 6, lk: "pew" },
    { p: "plant", x: 1, y: 2 }, { p: "plant", x: 10, y: 2 }, { p: "barrel", x: 1, y: 8, lk: "font" }, { p: "lantern", x: 2, y: 0 }, { p: "lantern", x: 9, y: 0 }],
  ash_thistle: [{ p: "herbs", x: 14, y: 0 }, { p: "shelfw", x: 7, y: 0 }, { p: "painting", x: 10, y: 0, v: 1 }, { p: "jugs", x: 6, y: 2 }, { p: "firewood", x: 11, y: 2 }, { p: "fireplace", x: 12, y: 0 },
    { p: "barrel", x: 1, y: 2 }, { p: "barrel", x: 2, y: 2 }, { p: "shelf", x: 4, y: 2, v: 1 }, { p: "shelf", x: 5, y: 2, v: 1 },
    { p: "table", x: 6, y: 6, v: 1 }, { p: "chair", x: 5, y: 6 }, { p: "chair", x: 8, y: 6 }, { p: "table", x: 13, y: 6, v: 1 }, { p: "chair", x: 12, y: 6 }, { p: "chair", x: 15, y: 6 },
    { p: "table", x: 6, y: 9, v: 2 }, { p: "chair", x: 5, y: 9 }, { p: "chair", x: 8, y: 9 }, { p: "table", x: 14, y: 9, v: 1 }, { p: "chair", x: 13, y: 9 }, { p: "chair", x: 16, y: 9 },
    { p: "stool", x: 16, y: 3 }, { p: "barrel", x: 16, y: 10 }, { p: "plant", x: 1, y: 10 }, { p: "lantern", x: 3, y: 0 }, { p: "lantern", x: 8, y: 0 }, { p: "lantern", x: 16, y: 0 }],
  ash_store: [{ p: "herbs", x: 4, y: 0 }, { p: "shelfw", x: 6, y: 0 }, { p: "jugs", x: 1, y: 3 }, { p: "shelf", x: 1, y: 2, v: 2 }, { p: "shelf", x: 2, y: 2, v: 2 }, { p: "shelf", x: 3, y: 2, v: 1 },
    { p: "shelf", x: 7, y: 2, v: 2 }, { p: "shelf", x: 8, y: 2, v: 0 }, { p: "barrel", x: 9, y: 2 }, { p: "barrel", x: 10, y: 2 }, { p: "sack", x: 10, y: 3 }, { p: "sack", x: 1, y: 6 }, { p: "crate", x: 1, y: 7 }, { p: "crate", x: 10, y: 7 }, { p: "lantern", x: 5, y: 0 }, { p: "lantern", x: 10, y: 0 }],
  ash_herb: [{ p: "herbs", x: 1, y: 0 }, { p: "herbs", x: 3, y: 0, v: 1 }, { p: "herbs", x: 6, y: 0 }, { p: "cauldron", x: 7, y: 2 }, { p: "jugs", x: 1, y: 2 }, { p: "shelf", x: 2, y: 2, v: 1 }, { p: "shelf", x: 3, y: 2, v: 1 },
    { p: "baskets", x: 6, y: 5 }, { p: "plant", x: 1, y: 6 }, { p: "plant", x: 8, y: 6 }, { p: "lantern", x: 5, y: 0 }],
  ash_smith: [{ p: "tools", x: 4, y: 0 }, { p: "shelfw", x: 7, y: 0 }, { p: "forge", x: 1, y: 2 }, { p: "anvil", x: 3, y: 4 }, { p: "barrel", x: 1, y: 5 }, { p: "crate", x: 9, y: 2 }, { p: "rack", x: 6, y: 2 }, { p: "rack", x: 7, y: 2 },
    { p: "barrel", x: 10, y: 7 }, { p: "crate", x: 1, y: 7 }, { p: "lantern", x: 10, y: 0 }],
  ash_tailor: [{ p: "cloths", x: 1, y: 0 }, { p: "cloths", x: 5, y: 0 }, { p: "cloths", x: 7, y: 0 }, { p: "mirror", x: 3, y: 0 }, { p: "table", x: 4, y: 3, v: 2 }, { p: "baskets", x: 1, y: 2 }, { p: "shelf", x: 8, y: 2, v: 2 },
    { p: "rack", x: 7, y: 5 }, { p: "stool", x: 2, y: 5 }, { p: "lantern", x: 4, y: 0 }],
  ash_cooper: [{ p: "tools", x: 1, y: 0 }, { p: "barrel", x: 1, y: 2 }, { p: "barrel", x: 2, y: 2 }, { p: "barrel", x: 3, y: 2 }, { p: "barrel", x: 8, y: 2 }, { p: "bench", x: 5, y: 3 }, { p: "crate", x: 8, y: 5 },
    { p: "firewood", x: 1, y: 5 }, { p: "barrel", x: 8, y: 6 }, { p: "lantern", x: 5, y: 0 }],
  ash_mill: [{ p: "sack", x: 1, y: 2 }, { p: "sack", x: 2, y: 2 }, { p: "sack", x: 3, y: 2 }, { p: "block", x: 5, y: 3, lk: "millstone" }, { p: "baskets", x: 9, y: 2 }, { p: "barrel", x: 10, y: 4 },
    { p: "crate", x: 10, y: 7, lk: "cellar" }, { p: "straw", x: 2, y: 6 }, { p: "sack", x: 1, y: 7 }, { p: "lantern", x: 4, y: 0 }, { p: "lantern", x: 8, y: 0 }],
  ash_cole: [{ p: "herbs", x: 1, y: 0 }, { p: "fireplace", x: 7, y: 0 }, { p: "firewood", x: 6, y: 2 }, { p: "table", x: 4, y: 4, v: 1 }, { p: "chair", x: 3, y: 4 }, { p: "chair", x: 6, y: 4 },
    { p: "bed", x: 1, y: 2, v: 1 }, { p: "baskets", x: 8, y: 2 }, { p: "barrel", x: 8, y: 6 }, { p: "plant", x: 1, y: 6 }, { p: "lantern", x: 3, y: 0 }],
};
for (const id in ASH_DOORS) {
  const r = ASH_DOORS[id], mat = Math.floor(r.w / 2) - (r.w % 2 ? 0 : 1);
  MAP_DEFS[id] = { name: r.name, outside: false, act2: true, rows: ashRoom(r.w, r.h, mat, r.floor || "o", ASH_ROOM_ROWS[id] || {}), props: ASH_PROPS[id] || [],
    warps: [{ x: mat, y: r.h - 1, to: "ash", tx: r.door[0], ty: r.door[1] + 1, dir: "down" }] };
  MAP_DEFS.ash.warps.push({ x: r.door[0], y: r.door[1], to: id, tx: mat, ty: r.h - 2, dir: "up" });
}
/* the mill cellar: dark, low, and not empty */
MAP_DEFS.ash_cellar = { name: "The Mill Cellar", outside: false, act2: true, dark: true,
  rows: ["XUUUUUUUUUUX", "XLLLLLLLLLLX", "XssssssssssX", "XssssssssssX", "XssssssssssX", "XssssssssssX", "XssssssssssX", "XXXXXmXXXXXX"],
  props: [{ p: "sack", x: 1, y: 2 }, { p: "barrel", x: 9, y: 2 }, { p: "barrel", x: 10, y: 2 }, { p: "crate", x: 1, y: 5 }, { p: "straw", x: 6, y: 4 }, { p: "bones", x: 8, y: 5 }],
  warps: [{ x: 5, y: 7, to: "ash_mill", tx: 9, ty: 7, dir: "left" }] };

/* ---------- what things say in Ashford ---------- */
MAP_DEFS.ash.looks = {
  door: ["The door is barred. Somebody inside coughs, and does not come.", "Shut. A Covenant notice is tacked to the frame: Curfew at the second bell.", "Locked. A dog barks once behind it, and thinks better of it."],
  gate: ["Barred, at the Curate's order. A soldier on the other side tells you so before you ask.", "Shut fast. Through the slats: wet fields and a grey sky."],
  ashboard: ["The notice board. Covenant edicts in fresh ink: tithes due at the new moon; assembly forbidden after the second bell; any sign of the cut thread to be reported to the outpost.", "Underneath, a torn corner of cheap paper, scraped almost clean. Someone missed one word: 'unpicked'."],
};
Object.assign(LOOK_TEXT, {
  vdesk: ["Curate Voidsong's desk: neat stacks, a seal, an inkwell, and a small jar of boiled sweets."],
  millstone: ["The upper millstone, worn smooth as a river pebble. Flour dusts everything, including the cat that isn't here."],
});

/* ---------- people ---------- */
Object.assign(NPC_DEFS, {
  voidsong: { name: "Curate Voidsong", title: "Covenant Curate", look: { sex: "f", skin: 0, hair: 0, hood: true, cloth: 4, outfit: "coat", mood: "smile" },
    schedule: [{ h: 0, map: "ash_outpost", x: 8, y: 4, w: 1, where: "the Covenant outpost" }] },
  perrin: { name: "Initiate Perrin", title: "Covenant Initiate", look: { skin: 1, hair: 2, cloth: 4, outfit: "coat", mood: "neutral" },
    schedule: [{ h: 0, map: "ash_outpost", x: 12, y: 6, w: 1, where: "the outpost" }, { h: 6, map: "ash", x: 23, y: 31, w: 2, where: "Pillar Square" }, { h: 19, map: "ash_outpost", x: 12, y: 6, w: 1, where: "the outpost" }] },
  winnie: { name: "Winnie Fenn", title: "Keeper of the Purple Thistle", look: { sex: "f", skin: 1, hair: 4, hairStyle: "bun", cloth: 2, apron: "#e9d9b4", mood: "smile" },
    schedule: [{ h: 0, map: "ash_thistle", x: 3, y: 3, w: 2, where: "the Purple Thistle" }] },
  hakon: { name: "Hakon Redfell", title: "Sellsword", look: { skin: 1, hair: 4, beard: true, cloth: 3, outfit: "coat", mood: "neutral" },
    schedule: [{ h: 0, map: "ash_thistle", x: 14, y: 7, w: 0, where: "a table in the Purple Thistle" }, { h: 5, map: null }, { h: 19, map: "ash_thistle", x: 14, y: 7, w: 0, where: "a table in the Purple Thistle" }] },
  pell: { name: "Pell Ashby", title: "Minstrel", look: { skin: 2, hair: 3, cloth: 6, outfit: "tunic", mood: "smile", strap: true },
    schedule: [{ h: 0, map: "ash_thistle", x: 9, y: 8, w: 1, where: "the Purple Thistle" }] },
  osric: { name: "Osric Dunmore", title: "A regular", look: { skin: 0, hair: 5, beard: true, cloth: 1, outfit: "tunic", mood: "sly", age: true },
    schedule: [{ h: 0, map: "ash_thistle", x: 5, y: 7, w: 0, where: "the Purple Thistle" }, { h: 5, map: null }, { h: 19, map: "ash_thistle", x: 5, y: 7, w: 0, where: "the Purple Thistle" }] },
  hobb: { name: "Hobb Marlow", title: "Provisioner", look: { skin: 1, hair: 1, cloth: 5, apron: "#c8b894", mood: "neutral", age: true },
    schedule: [{ h: 0, map: "ash_store", x: 5, y: 3, w: 1, where: "Hobb's Provisions" }] },
  willow: { name: "Mistress Willow", title: "Herbalist", look: { sex: "f", skin: 0, hair: 5, hairStyle: "bun", cloth: 7, outfit: "dress", mood: "neutral", age: true },
    schedule: [{ h: 0, map: "ash_herb", x: 4, y: 3, w: 1, where: "Wort and Willow" }] },
  brannoc: { name: "Brannoc", title: "Smith", look: { skin: 2, hair: 0, beard: true, cloth: 3, apron: "#5a4a3a", mood: "neutral" },
    schedule: [{ h: 0, map: "ash_smith", x: 4, y: 5, w: 1, where: "the smithy" }] },
  ysolde: { name: "Ysolde Finch", title: "Tailor", look: { sex: "f", skin: 1, hair: 2, hairStyle: "bun", cloth: 6, outfit: "dress", mood: "sly" },
    schedule: [{ h: 0, map: "ash_tailor", x: 5, y: 5, w: 1, where: "Fine Cloth and Fittings" }] },
  davytarn: { name: "Davy Tarn", title: "Cooper", look: { skin: 1, hair: 4, cloth: 2, apron: "#8a6a4a", mood: "neutral" },
    schedule: [{ h: 0, map: "ash_cooper", x: 5, y: 5, w: 1, where: "Tarn & Son" }] },
  aldous: { name: "Aldous Grist", title: "Miller", look: { skin: 0, hair: 5, cloth: 0, apron: "#d8d0c0", mood: "neutral", age: true },
    schedule: [{ h: 0, map: "ash_mill", x: 7, y: 5, w: 1, where: "the mill" }] },
  agna: { name: "Sister Agna", title: "Chapel keeper", look: { sex: "f", skin: 1, hair: 5, hood: true, cloth: 0, outfit: "dress", mood: "neutral", age: true },
    schedule: [{ h: 0, map: "ash_chapel", x: 6, y: 3, w: 1, where: "the chapel" }] },
  mabry: { name: "Mabry Cole", title: "Farmer", look: { sex: "f", skin: 2, hair: 1, hairStyle: "bun", cloth: 5, outfit: "dress", mood: "neutral" },
    schedule: [{ h: 0, map: "ash_cole", x: 4, y: 5, w: 1, where: "the Coles' cottage" }, { h: 7, map: "ash", x: 15, y: 57, w: 2, where: "the south fields" }, { h: 18, map: "ash_cole", x: 4, y: 5, w: 1, where: "the Coles' cottage" }] },
  ashgate: { name: "Covenant soldier", title: "Gate watch", look: { skin: 0, hair: 1, helm: true, cloth: 4, outfit: "coat", mood: "neutral" },
    schedule: [{ h: 0, map: "ash", x: 14, y: 4, w: 0, where: "the main gate" }] },
  ashpatrol: { name: "Covenant soldier", title: "Square watch", look: { skin: 1, hair: 0, helm: true, cloth: 4, outfit: "coat", mood: "neutral" },
    schedule: [{ h: 0, map: "ash", x: 30, y: 29, w: 3, where: "Pillar Square" }] },
  ashfolk1: { name: "Market wife", title: "", look: { sex: "f", skin: 1, hair: 3, hairStyle: "bun", cloth: 1, outfit: "dress", mood: "smile" },
    schedule: [{ h: 0, map: null }, { h: 7, map: "ash", x: 20, y: 34, w: 4, where: "the market street" }, { h: 19, map: null }] },
  ashfolk2: { name: "Old Ned", title: "", look: { skin: 0, hair: 5, beard: true, cloth: 3, outfit: "coat", mood: "neutral", age: true },
    schedule: [{ h: 0, map: null }, { h: 8, map: "ash", x: 38, y: 44, w: 3, where: "the lane" }, { h: 18, map: null }] },
});
const ASH_NPCS = ["voidsong", "perrin", "winnie", "hakon", "pell", "osric", "hobb", "willow", "brannoc", "ysolde", "davytarn", "aldous", "agna", "mabry", "ashgate", "ashpatrol", "ashfolk1", "ashfolk2"];
for (const k of ASH_NPCS) { NPC_DEFS[k].id = k; NPC_DEFS[k].act2 = true; }

/* ---------- shops ---------- */
Object.assign(SHOPS, {
  ashford_general: { ...SHOPS.ashford_general, name: "Hobb's Provisions", keeper: "Hobb" },
  ashford_smith: { name: "Ashford Smithy", keeper: "Brannoc", stock: ["ironblade", "wayblade", "greyedge"], bonus: ["arms"], only: ["arms", "salvage"], mult: 1, buy: 1, purse: 150 },
  ashford_tailor: { name: "Fine Cloth and Fittings", keeper: "Ysolde", stock: ["paddedcoat", "ringmail", "leathercap", "kettlehat", "ashcharm", "thistlepin"], bonus: ["silk", "hide"], only: ["arms", "silk", "hide"], mult: 1, buy: 1, purse: 120 },
  ashford_herbalist: { ...SHOPS.ashford_herbalist, name: "Wort and Willow", keeper: "Willow" },
});
Object.assign(ITEMS, {
  covletter: { name: "Voidsong's letter", quest: true, desc: "Covenant seal, violet wax, and a hand full of curls. For the Commander of Fort Frostcrown." },
  covnote: { name: "Sealed note", quest: true, desc: "Initiate Perrin's note for the hunters' camp. The seal is a little crooked." },
  huntreply: { name: "The hunters' reply", quest: true, desc: "A strip of birch bark, scratched with a knife: a tally of wolves, and a word Perrin will not like." },
  casks: { name: "Tarn's casks", quest: true, desc: "Two small casks, scorched but sound. They slosh." },
  alekeg: { name: "Keg of Thistle ale", sell: 20, cat: "food", desc: "A firkin of Ashford's best, still sealed. Worth more than it weighs, almost." },
  debtpurse: { name: "Fenwick's purse", quest: true, desc: "A greasy leather purse, lighter than Pell was promised." },
  harecharm: { name: "Hare-skin charm", gear: { slot: "charm", mag: 1, spd: 2 }, desc: "A scrap of hare-skin stitched round a dried clover. The Cole children swear by it." },
});
ITEMS.yarrow.price = 6; ITEMS.yarrow.cat = "herb"; ITEMS.redcap.price = 6; ITEMS.redcap.cat = "herb"; ITEMS.mooncap.price = 25;

/* the inn: a bed for coin; the hours pass but the wild does not come back, because no Pillar was touched */
const INN_PRICE = 30;
function innRest(G, swap, home = "ash") {
  act2Ensure(G); btlRest(G);
  const wasNight = isNightT(G.time);
  if (swap) { G.time = wasNight ? DAY_T : NIGHT_T; if (wasNight) G.day += 1; }
  econRecover(G, "rest"); G.respawn = home;
  return { night: isNightT(G.time), swapped: !!swap };
}

/* ---------- quests ---------- */
const qs = (G, k) => (G.flags[k] | 0);
const ASH_QUESTS = [
  ["q_flicker", "The Flicker", ["", "Look at Ashford's Pillar after dark", "Find who is putting out the Pillar", "Mend the Pillar, after dark", "Return to Curate Voidsong"],
    ["", "Pillar Square. It falters at night", "A hidden camp south-east of Ashford, off the road. They work at night", "Pillar Square, at night", "The Covenant outpost"]],
  ["q_hakon", "Hakon's Work", ["", "Find the sellsword in the Purple Thistle after dark"], ["", "Winnie says he drinks there every night"]],
  ["q_casks", "Lost Casks", ["", "Recover Tarn's casks from the burned wagon", "Bring the casks to Davy Tarn"], ["", "On the eastern downs, past the crossroads", "Tarn & Son, on the market street"]],
  ["q_moon", "Moon-cap for a Sick Child", ["", "Bring a moon-cap to Sister Agna"], ["", "They grow in the West Forest glade at night. Mistress Willow sometimes has one after dark"]],
  ["q_rats", "Cellar Rats", ["", "Clear the rats from the mill cellar", "Tell Aldous the cellar is clear"], ["", "The crate in the back of the mill hides the cellar steps", "The mill, south of the market street"]],
  ["q_msg", "Message for the Hunters", ["", "Carry Perrin's note to the hunters' camp", "Bring the hunters' reply to Initiate Perrin"], ["", "North of the road, west of Ashford", "Pillar Square by day; the outpost after dark"]],
  ["q_whisper", "Wayfarer Whispers", ["", "Find the fire that burns only at night", "Tell Osric what you found"], ["", "Out on the eastern downs, after dark", "The Purple Thistle, after dark"]],
  ["q_debt", "The Minstrel's Debt", ["", "Collect Pell's debt from Mother Fenwick", "Bring Pell the money"], ["", "The traders' camp, near the crossroads", "The Purple Thistle"]],
  ["q_hound", "The Lost Hound", ["", "Find the Coles' dog, Tansy", "Bring the news to Mabry Cole"], ["", "She bolted towards the old farmstead, west of the Ashford turn", "The Coles' cottage, south-west of the market street; the fields by day"]],
];
function ashTasks(G, ctx) {
  const f = G.flags, l = [];
  if (!f.m_voidsong) l.push({ text: "Ask at the Covenant outpost about the road north", done: false, hint: "Curate Voidsong, north of Pillar Square" });
  if (!f.q_hakon) l.push({ text: "Look for work at the Purple Thistle", done: false, hint: "East of Pillar Square" });
  for (const [k, , steps, hints] of ASH_QUESTS) { const s = qs(G, k); if (s > 0 && s < steps.length) l.push({ text: steps[s], done: false, hint: hints[s] }); }
  if (f.hakon_joined && !f.arthur_clue) l.push({ text: "Search the Iron Cleave's camp for word of Hakon's brother", done: false, hint: "The East Light Forest, off the plains' east trail past the crossroads" });
  if (f.arthur_clue && !f.primer_read) l.push({ text: "Read the Tellers' Primer at a Pillar", done: false, hint: "Any Pillar out of the Covenant's sight" });
  if (f.arthur_clue && !f.act2_end) l.push({ text: f.q_south ? "Arthur was sold south. The road south is Hakon's road too" : "Arthur was sold south. Hakon will follow, after the Fort", done: false, hint: "The trail continues beyond this act" });
  if (qs(G, "q_flicker") >= 5 && !f.ulric_met) l.push({ text: f.reached_fort ? "Present Voidsong's letter to Arbitrator Icetoe" : "Take Voidsong's letter north to Fort Frostcrown", done: false, hint: f.reached_fort ? "The Command Post, at the north end of the Fort" : "North up the Frost Road, past the boundary stone, to the Outskirts" });
  if (f.act2_end) l.push({ text: "Act Two is complete. The plains are still yours to explore", done: false, hint: "Act Three: southern Etharis" });
  if (!l.length) l.push({ text: "Ashford is quiet, for now", done: false, hint: "The road north waits" });
  return l;
}
function questLog(G) { return ASH_QUESTS.filter(([k]) => qs(G, k) > 0).map(([k, name, steps]) => ({ name, done: qs(G, k) >= steps.length })); }

/* a won fight that moves a quest on */
const QUEST_WIN_HOOKS = [], PILLAR_HOOKS = [];   // later areas add their own
function questWin(G, foes, quest, key) {
  const f = G.flags;
  for (const h of QUEST_WIN_HOOKS) { const st = h(G, foes, quest, key); if (st) return st; }
  if (foes.includes("pleader") && qs(G, "q_flicker") === 2) {
    f.q_flicker = 3; giveItem(G, "firewax", 1);
    return [{ who: "narrator", t: "In the leader's satchel: a chisel worn bright, a pot of firewax, and a rough plan of Ashford's square with the Pillar ringed in charcoal." },
      { who: "tessa", t: "So that's how. They scorch the ward-stones at its foot, and it chokes. We can scrape it clean. Tonight, before they send someone else." }];
  }
  if (quest === "construct_beaten") return [{ who: "narrator", t: "The construct sags onto one knee, steam whistling out of its joints, and the light behind its face goes out. Something square and heavy rattles loose from its chest-plate." },
    { who: "narrator", t: "You take the construct's key." }];
  if (quest === "q_rats_won") { f.q_rats = 2; return [{ who: "narrator", t: "The last rat goes still. The cellar smells of flour, damp and something worse. It is clear." }]; }
  if (quest === "q_casks_won") { f.q_casks = 2; giveItem(G, "casks", 1); return [{ who: "narrator", t: "The scavengers scatter. Under the wagon's charred bed, wrapped in sacking: two small casks, still sealed." }]; }
  if (quest === "q_hound_won") { f.q_hound = 2; return [{ who: "narrator", t: "The boar crashes off into the scrub. From under the farmhouse beams, something whimpers, then thumps its tail." },
    { who: "narrator", t: "A brindled dog with a torn ear crawls out and leans against your leg. Tansy. She trots off towards Ashford as if she had meant to all along." }]; }
  return null;
}

/* walking into a place */
const QUEST_ENTER_HOOKS = [];
function ashEnter(G, id) {
  const f = G.flags, night = isNightT(G.time);
  for (const h of QUEST_ENTER_HOOKS) { const st = h(G, id); if (st) return st; }
  SHOPS.ashford_herbalist.stock = night ? ["yarrow", "redcap", "mooncap"] : ["yarrow", "redcap"];
  if (id === "ash_chapel") f.ash_heal_used = false;
  if (id === "ash" && !f.reached_ash) {
    f.reached_ash = true; G.respawn = G.respawn || "ash";
    return [{ who: "narrator", t: "Ashford. Stone walls, cobbled streets, and purple banners on every pole, each stamped with the Covenant's gold sigil." },
      { who: "tessa", t: "They really do like their flags here. Keep your head down and your satchel shut. If anyone asks, we're looking for work and a bed." },
      { who: "tessa", t: "The outpost is the big stone house past the square. If anyone can get us north, it's whoever runs that." }];
  }
  if (id === "ash_cellar" && qs(G, "q_rats") === 1 && !f.q_rats_won) return [{ who: "narrator", t: "Something squeals in the dark. Then another. The sacks along the wall are moving." }, { fight: { foes: ["rat", "rat", "rat"], win: "q_rats_won" } }];
  return null;
}

/* the Pillar, when the Flicker quest wants a closer look */
function ashPillarLook(c, pid) {
  for (const h of PILLAR_HOOKS) { const st = h(c, pid); if (st) return st; }
  if (pid !== "ash") return null;
  const G = c.G, night = isNightT(G.time), s = qs(G, "q_flicker");
  if (night && s === 1) return [
    { who: "narrator", t: "Up close the Pillar stutters: bright, then nothing, then bright again. Every time it drops, the square goes colder." },
    { who: "narrator", t: "Round its foot, two of the ward-stones are scorched black. Wedged in a crack below them: a clay disc, stamped with a cut thread." },
    { do: (c) => { c.set("q_flicker", 2); c.give("cuttoken", 1); } },
    { who: "tessa", t: "That's no accident. Someone's been at it with fire. And whoever carries those tokens doesn't live in town. They'll be camped somewhere close, south and east, off the road." },
  ];
  if (night && s === 3) return [
    { who: "narrator", t: "You kneel at the Pillar's foot and scrape the firewax from the ward-stones with the leader's own chisel. It comes away in black curls." },
    { who: "narrator", t: "The hum climbs back up out of the ground. The light steadies, and stays." },
    { do: (c) => { c.set("q_flicker", 4); c.set("ash_fixed", true); c.refreshWorld(); } },
    { who: "tessa", t: "Better. Now let's go and tell the Curate, before she hears it from someone who'll take the credit." },
  ];
  return null;
}

/* ---------- talk ---------- */
const v = (who, t) => ({ who, t });
Object.assign(SCRIPTS, {
  voidsong: (c) => {
    const s = qs(c.G, "q_flicker");
    if (!c.flag("m_voidsong")) return [
      v("voidsong", "Oh! Visitors! Come in, come in, mind the step. I'm Curate Voidsong. Ashford's very own. Would you like a sweet? They're liquorice. Nobody ever wants the liquorice."),
      v("voidsong", "Oakhaven? You poor things. I heard. The whole Covenant heard. Now, what can the outpost do for you?"),
      v("tessa", "We need to go north. To Fort Frostcrown."),
      v("voidsong", "North! Nobody goes north on a whim. You'll need a letter, or the March gate will turn you round and send you home in a sack."),
      v("voidsong", "What's in the satchel, by the way? You're holding it like a baby."),
      { choice: [
        ["\"Just my things.\"", [v("voidsong", "Mm. Everyone's things are just their things. Keep them close, then."), { do: (c) => c.set("tome_ash", "hide") }]],
        ["\"My master's ledgers.\"", [v("voidsong", "Ledgers! How dull. I was hoping for poetry."), { do: (c) => c.set("tome_ash", "lie") }]],
        ["\"An old book.\"", [v("narrator", "She glances at the satchel a moment too long. Then she smiles, and the moment passes."), v("voidsong", "Old books are lovely. Old books are also, sometimes, the Covenant's business. Don't leave it lying about."), { do: (c) => c.set("tome_ash", "risk") }]],
      ] },
      v("voidsong", "Now. A letter. I can write you one, but letters cost, and I'm not after coin. Have you looked at our Pillar after dark?"),
      v("voidsong", "It flickers. Like a candle in a draught. A month ago it went out altogether for a night, and the whole town sat up holding hands. The inspectors came, looked, frowned, and left."),
      v("voidsong", "Find out why it's flickering, and fix it if you can, and I'll write you the nicest letter Fort Frostcrown has ever read. Deal?"),
      { do: (c) => { c.set("m_voidsong"); c.set("q_flicker", 1); } },
      v("tessa", "Deal. We'll look tonight."),
    ];
    if (s === 4) return [
      v("voidsong", "You did it! I watched it from my window, steady as a lighthouse. Firewax and a chisel? Purifiers. Of course it was. Horrid people. They'd burn the sky if they could reach it."),
      v("voidsong", "Here. Your letter, sealed and sweetened. And this, from the outpost stores, because the road north is cold and you're dressed for a picnic."),
      { do: (c) => { c.set("q_flicker", 5); c.coins(120); c.give("covletter", 1); c.give("paddedcoat", 1); } },
      v("narrator", "120 coppers. Voidsong's letter. A padded coat."),
      v("voidsong", "Take it to the Commander at the Fort. And come and see me if you find anything... dark. I pay well for the things nobody else will touch."),
    ];
    const line = s === 1 ? "Have you seen it yet? After dark, by the square. It's worse some nights than others." : s === 2 ? "A cut-thread token? At the Pillar? Oh, that's horrid. Find them. Quickly, please." : s === 3 ? "You've found them? Then mend it. Tonight, while they're licking their wounds." :
      c.rot("voidsong", ["The Pillar's been perfect since you mended it. I've slept like a baby. A baby with a great deal of paperwork.", "Shadow is only light standing somewhere else. That's what my teacher said. She also said never to trust a man in a red hat.", "If you find bones, rings, anything old and grim, bring it here. The Covenant likes to keep such things safe."]);
    return [v("voidsong", line), { choice: [["Trade", [{ shop: "voidsong" }]], ["Goodbye.", [v("voidsong", "Mind the step!")]]] }];
  },
  perrin: (c) => {
    const s = qs(c.G, "q_msg");
    if (s === 0 && !isNightT(c.G.time)) return [
      v("perrin", "You. You're not from here. Are you going out on the plains? I mean, of course you are. Everyone's going somewhere."),
      v("perrin", "The Curate wants this note taken to the hunters' camp, west of here, north of the road. I'd go, but I'm on square duty, and the hunters, um. Don't like me."),
      { choice: [["I'll take it.", [{ do: (c) => { c.set("q_msg", 1); c.give("covnote", 1); } }, v("perrin", "Thank you! Bring back whatever they say. Even if it's rude. Especially if it's rude, so I can tell her it wasn't me.")]],
        ["Not now.", [v("perrin", "Oh. Right. Of course.")]]] },
    ];
    if (s === 1) return [v("perrin", "The hunters' camp. North of the road, west. Big man, beard, smells of smoke. Can't miss him.")];
    if (s === 2) return [v("perrin", "They answered? Let me see. Wolves, wolves, wolves, and... oh. Oh, that's very rude. Thank you."), { do: (c) => { c.take("huntreply", 1); c.set("q_msg", 3); c.coins(50); } }, v("narrator", "50 coppers.")];
    return [v("perrin", c.rot("perrin", ["The Covenant keeps us safe. That's what it's for. That's what I'm for, a bit.", "Curfew's at the second bell. I'm supposed to say that to everyone.", "Have you met the Curate? She gave me a liquorice sweet once. I still have it."]))];
  },
  winnie: (c) => {
    const night = isNightT(c.G.time), s = qs(c.G, "q_hakon");
    const room = { choice: [
      [`Take a room (${INN_PRICE} coppers)`, [{ do: (c) => { if (c.G.coins < INN_PRICE) return; c.coins(-INN_PRICE); } }, (c.G.coins >= INN_PRICE
        ? { choice: [[night ? "Sleep until morning" : "Sleep until nightfall", [{ do: (c) => c.innRest(true) }]], ["Just rest a while", [{ do: (c) => c.innRest(false) }]]] }
        : v("winnie", "Short, love? Come back with thirty and I'll warm the sheets."))]],
      ["Not tonight.", [v("winnie", "Door's always open. Well. Until the second bell.")]]] };
    if (!s) return [
      v("winnie", "Come in, come in, out of that wind! You look half-starved, the pair of you. Sit. I'm Winnie. This is the Thistle. You're family now, whether you like it or not."),
      v("winnie", "Work? Love, there's always work. Half of Ashford wants something carried, found or killed. Ask about, you'll see."),
      v("winnie", night ? "And if you want coin and company on the road, there's a big Vale fellow at the corner table. Hakon. Drinks like it's his job. Talk to him." : "And if you want a sword at your side, there's a big Vale fellow drinks here every night. Hakon. Come back after dark."),
      { do: (c) => c.set("q_hakon", 1) }, room,
    ];
    return [v("winnie", c.rot("winnie", ["Eat something. You're all elbows.", "Pell's been at that song for a week. Same verse. I may kill him.", "Hakon? Sad eyes, big heart. Don't tell him I said.", "Purple Thistle ale. Brewed in the cellar, blessed by nobody, drunk by everybody."])), room];
  },
  hakon: (c) => {
    if (c.flag("hakon_joined")) return [v("hakon", "We go when you go.")];
    return [
      v("hakon", "Hm. You're the ones from Oakhaven. Winnie talks."),
      v("hakon", "I am Hakon. Of the Redfells, from the Vale. I sell my sword, when someone is buying. Lately, no one is."),
      v("tessa", "We're going north, to the Fort. Then wherever the road goes after that."),
      v("hakon", "North. Hm. I am looking for someone. Someone important to me. The trail runs east and south, I think, but a sellsword cannot follow a trail on an empty purse."),
      v("hakon", "So. A bargain. I keep you alive on the road. You help me find who I'm looking for, when the road bends that way. Yes?"),
      { choice: [
        ["\"Yes. We'll help you find them.\"", [v("hakon", "Good. Then I am yours. Do not make me regret it."), { do: (c) => { c.set("q_hakon", 2); c.set("hakon_joined"); hakonJoin(c.G); } }, v("narrator", "Hakon Redfell joins the party.")]],
        ["\"We'll think about it.\"", [v("hakon", "Think quickly. I am cheap tonight. Tomorrow I may be sober, and expensive.")]],
      ] },
    ];
  },
  pell: (c) => {
    const s = qs(c.G, "q_debt");
    if (s === 0 && !isNightT(c.G.time)) return [
      v("pell", "A listener! Sit, sit. No? Then perhaps a favour, for a poor musician with a fine voice and an empty purse."),
      v("pell", "Mother Fenwick, at the traders' camp. She owes me for a month of songs at her fire. Sixty coppers. She says she'll pay. She says that every week."),
      { choice: [["I'll collect it.", [{ do: (c) => c.set("q_debt", 1) }, v("pell", "Bless you. Be firm. She'll cry. She can cry on cue, it's a gift.")]], ["Not my business.", [v("pell", "Everything's somebody's business, friend.")]]] },
    ];
    if (s === 2) return [v("pell", "She paid? All of it? ...Thirty. Well. Thirty is more than nothing, and nothing is what I had."), { do: (c) => { c.take("debtpurse", 1); c.set("q_debt", 3); c.coins(60); } },
      v("pell", "Keep the sixty I promised you; call the rest a lesson. And here's a verse for the road: 'North of the bridge where the stones stand tall, the cold road climbs to the Frostcrown wall.' Not my best."), v("narrator", "60 coppers.")];
    return [v("pell", c.rot("pell", ["♪ Oh the Pillar burns and the Covenant cares, and the tithe-man counts the stairs... ♪ Still working on it.", "Every town has one song. Ashford's is about tithes. Catchy, though.", "I played for a Curate once. She asked for something with fewer words."]))];
  },
  osric: (c) => {
    const s = qs(c.G, "q_whisper");
    if (s === 0) return [
      v("osric", "Sit down, you're blocking my light. ...You want a story? Everyone wants a story. Buy me a drink and you can have one for free."),
      v("osric", "There's a fire out on the downs, past the crossroads. Burns only at night. Folk who sit at it come back knowing things. Ways in and ways out that the Covenant doesn't know about."),
      v("osric", "Find it, and come tell me who's sitting at it these days. I'll make it worth your while."),
      { do: (c) => c.set("q_whisper", 1) },
    ];
    if (s === 2) return [v("osric", "A hooded fellow, and he talked about the Fort? Ha. Then he's still out there. Good."), { do: (c) => { c.set("q_whisper", 3); c.coins(40); } }, v("osric", "Forty coppers, as promised. And a word: if he offers you a way in, take it. Front doors are for people with nothing to hide."), v("narrator", "40 coppers.")];
    return [v("osric", c.rot("osric", ["I've drunk in every tavern from here to the coast. This is the third best.", "Covenant soldiers in the square, Covenant soldiers on the gate. Covenant soldiers in my ale, next.", "Hakon? Don't arm-wrestle him. Trust me."]))];
  },
  hobb: (c) => [v("hobb", c.rot("hobb", ["Provisions, fair prices. Fangs and silk I'll pay you well for; the Covenant wants silk for bandages.", "Ration, bandage, poultice. Everything a body needs to get from here to somewhere worse.", "Don't haggle. I'm too old and you're too young."])), { choice: [["Trade", [{ shop: "ashford_general" }]], ["Goodbye.", []]] }],
  willow: (c) => [v("willow", isNightT(c.G.time) ? "Moon-caps tonight, if you're quick. They don't keep." : c.rot("willow", ["Yarrow for wounds, red-cap for worse wounds. And if you want the recipe for something stronger, it'll cost you.", "Everything grows, if you let it. Even in Ashford."])),
    { choice: [["Trade", [{ shop: "ashford_herbalist" }]], ["Buy a recipe note: strong poultice (60)", [{ do: (c) => { if (c.G.coins >= 60 && !(c.G.recipes || []).includes("spoultice")) { c.coins(-60); learnRecipe(c.G, "spoultice"); } } }, v("willow", (c.G.recipes || []).includes("spoultice") ? "There. Red-cap, yarrow and silk. Bind it tight." : "Sixty, dear. Not fifty-nine.")]],
      ["Buy a recipe note: breath tonic (80)", [{ do: (c) => { if (c.G.coins >= 80 && !(c.G.recipes || []).includes("btonic")) { c.coins(-80); learnRecipe(c.G, "btonic"); } } }, v("willow", (c.G.recipes || []).includes("btonic") ? "Mandrake, yarrow, gel. Steep it cold, never hot." : "Eighty, dear.")]], ["Goodbye.", []]] }],
  brannoc: (c) => [v("brannoc", c.rot("brannoc", ["Blades. Channel blades, the Curate calls them. I call them swords with a groove.", "The Fort's smiths think they're better than me. They're right, but I'm closer.", "Mind the forge."])), { choice: [["Trade", [{ shop: "ashford_smith" }]], ["Goodbye.", []]] }],
  ysolde: (c) => [v("ysolde", c.rot("ysolde", ["Coats, caps and charms. Nothing purple, I'm afraid; the Covenant buys all the purple.", "That jerkin's seen better days. So have you, I expect.", "Silk and hide I'll buy, if it's clean. Mostly clean."])), { choice: [["Trade", [{ shop: "ashford_tailor" }]], ["Goodbye.", []]] }],
  davytarn: (c) => {
    const s = qs(c.G, "q_casks");
    if (s === 0) return [
      v("davytarn", "Tarn and Son. I'm the son. Father's in Oakhaven, or was. I was meant to go home a month back. Then I heard."),
      v("davytarn", "Two of our casks went out on a Covenant cart, east past the crossroads. The cart burned. Scavengers'll have them by now, if the fire didn't. Bring them back and I'll pay seventy and a keg."),
      { choice: [["I'll find them.", [{ do: (c) => c.set("q_casks", 1) }, v("davytarn", "East of the crossroads, on the downs. Watch yourself.")]], ["Not now.", []]] },
    ];
    if (s === 2) return [v("davytarn", "You found them! Scorched, but sound. Father always said our casks would outlive us."), { do: (c) => { c.take("casks", 1); c.set("q_casks", 3); c.coins(70); c.give("alekeg", 1); } }, v("narrator", "70 coppers and a keg of Thistle ale.")];
    if (s === 1) return [v("davytarn", "The burned wagon, east of the crossroads. Two small casks.")];
    return [v("davytarn", c.rot("davytarn", ["A good cask holds anything. Ale, oil, secrets.", "I'll go home when the gate opens. If there's a home."]))];
  },
  aldous: (c) => {
    const s = qs(c.G, "q_rats");
    if (s === 0) return [
      v("aldous", "Rats. In my cellar. Big as cats, bold as Curates. They've had a sack of meal a night for a week."),
      v("aldous", "The steps are behind the crate at the back. Clear them out and I'll pay forty, and a couple of poultices for the bites."),
      { choice: [["I'll clear them.", [{ do: (c) => c.set("q_rats", 1) }]], ["Not now.", []]] },
    ];
    if (s === 2) return [v("aldous", "Quiet down there? Good. Good. Here."), { do: (c) => { c.set("q_rats", 3); c.coins(40); c.give("poultice", 2); } }, v("narrator", "40 coppers and 2 poultices.")];
    if (s === 1) return [v("aldous", "Behind the crate at the back. Mind your ankles.")];
    return [v("aldous", c.rot("aldous", ["Grain's thin this year. The tithe isn't.", "Flour gets everywhere. I've been finding it in my ears since I was six."]))];
  },
  agna: (c) => {
    const s = qs(c.G, "q_moon"), steps = [];
    if (!c.flag("ash_heal_used")) steps.push(v("agna", "Come here. Let me see to you."), { do: (c) => { c.heal(); c.set("ash_heal_used", true); } }, v("narrator", "Her hands are cold and sure. The party is mended."));
    if (s === 0 && isNightT(c.G.time)) return [...steps,
      v("agna", "A child on the lane has the grey cough. Moon-cap would ease it, but it only grows in the forest glade at night, and I'm too old for forests."),
      { choice: [["I'll find one.", [{ do: (c) => c.set("q_moon", 1) }, v("agna", "Bless you. Willow sometimes has one after dark, if you'd rather pay than walk.")]], ["I can't.", []]] }];
    if (s === 1 && c.has("mooncap")) return [...steps, v("agna", "A moon-cap! Oh, it's still cold. Thank you."), { do: (c) => { c.take("mooncap", 1); c.set("q_moon", 2); c.coins(60); c.give("ashcharm", 1); } },
      v("agna", "Take this, too. Ash from the Pillar's own tree. Keep it about you."), v("narrator", "60 coppers and an ashwood charm.")];
    if (!steps.length) steps.push(v("agna", c.rot("agna", ["The Covenant keeps the light. We keep the people. It's not quite the same job.", "Light a candle, if you have someone to light it for.", "Once a visit, child. Come back when you've been hurt again."])));
    return steps;
  },
  mabry: (c) => {
    const s = qs(c.G, "q_hound");
    if (s === 0) return [
      v("mabry", "Have you seen a dog? Brindled, torn ear, answers to Tansy when she feels like it. A boar came at the fields three days back and she ran. Ran west, towards the old farm."),
      v("mabry", "The children won't sleep. Neither will I, truth be told."),
      { choice: [["I'll look for her.", [{ do: (c) => c.set("q_hound", 1) }, v("mabry", "Thank you. She hides when she's frightened. Under things.")]], ["Sorry.", []]] },
    ];
    if (s === 2) return [v("mabry", "She came home! Walked in bold as brass and ate the cat's supper. Thank you."), { do: (c) => { c.set("q_hound", 3); c.coins(45); c.give("harecharm", 1); } },
      v("mabry", "The children made you this. It's lucky. They say."), v("narrator", "45 coppers and a hare-skin charm.")];
    if (s === 1) return [v("mabry", "The old farmstead, west of the Ashford turn. Under things.")];
    return [v("mabry", c.rot("mabry", ["Tansy sends her regards. Well. She sends a bark.", "The fields are thin, but they're ours."]))];
  },
  ashgate: (c) => [v("ashgate", c.rot("ashgate", ["Keep the peace inside the walls.", "Gate shuts at the second bell. If you're outside, you stay outside.", "Move along."]))],
  ashpatrol: (c) => [v("ashpatrol", c.rot("ashpatrol", ["Covenant business. Move along.", "Seen anyone with a cut-thread token? Report it to the outpost.", "The square is watched day and night."]))],
  ashfolk1: (c) => [v("ashfolk1", c.rot("ashfolk1", ["Eggs are dear and getting dearer. Everything's dear except advice.", "The Curate's lovely. Bit much. Lovely."]))],
  ashfolk2: (c) => [v("ashfolk2", c.rot("ashfolk2", ["When I was a lad the Pillar never flickered. Then again, when I was a lad, nothing did.", "Covenant flags on every pole. Used to be washing lines."]))],
  look_cellar: (c) => qs(c.G, "q_rats") >= 1 ? [v("narrator", "Behind the crate: steep stone steps, and a smell of damp."), { choice: [["Go down", [{ do: (c) => c.goto("ash_cellar", 5, 6, "up") }]], ["Not yet", []]] }]
    : [v("narrator", "A heavy crate of meal. Behind it, steps go down into the dark. It's not your cellar.")],
  look_wagon: (c) => {
    if (qs(c.G, "q_casks") === 1 && !c.flag("q_casks_won")) return [v("narrator", "Two figures are already picking through the wagon's bones. They turn, knives out."), { fight: { foes: ["cutpurse", "thug"], win: "q_casks_won" } }];
    return [v("narrator", c.rot("look_wagon", ["A cart burned to its axles. The horses are gone; the driver is not.", "Scratched into the tailboard, under the soot: a thread, cut through."]))];
  },
  look_farm: (c) => {
    if (qs(c.G, "q_hound") === 1 && !c.flag("q_hound_won")) return [v("narrator", "From under the fallen beams: a thin whine. And from the brush beside the cellar door, a snort, and the clack of tusks."), { fight: { foes: ["boar"], win: "q_hound_won" } }];
    return [v("narrator", "A cellar door under fallen beams. The farm burned years ago; the tithe-men came the season after anyway.")];
  },
});
/* the plains' wagon and farm are now quest places: their looks move to scripts */
delete MAP_DEFS.plainsSE.looks.wagon; delete MAP_DEFS.plainsSW.looks.farm;

/* the plains folk join in */
Object.assign(QUEST_HOOKS, {
  hunter: (c) => qs(c.G, "q_msg") === 1 ? [v("hunter", "A note from the outpost? Hm."), v("narrator", "He reads it, snorts, and scratches a reply on birch bark with his knife."),
    v("hunter", "Tell the boy: we'll count their wolves when they pay us for the last count."), { do: (c) => { c.take("covnote", 1); c.give("huntreply", 1); c.set("q_msg", 2); } }] : null,
  trader: (c) => qs(c.G, "q_debt") === 1 ? [v("trader", "Pell! That songbird. Sixty, he says? For a month of caterwauling?"),
    { choice: [["\"Sixty. He was firm about it.\"", [v("trader", "Then he can be firm with thirty. Take it, before I remember I'm generous."), { do: (c) => { c.give("debtpurse", 1); c.set("q_debt", 2); } }]],
      ["\"He sang. You listened. Pay up.\"", [v("trader", "Hah! I like you. Thirty, and not a copper more, and a smile for free."), { do: (c) => { c.give("debtpurse", 1); c.set("q_debt", 2); } }]]] }] : null,
  wayfarer: (c) => qs(c.G, "q_whisper") === 1 ? [v("wayfarer", "Sit, if you're sitting. The fire doesn't ask who you are, and neither do I."),
    v("wayfarer", "Someone sent you. Osric, I'd guess; he's the only one in Ashford who still remembers this fire."),
    v("wayfarer", "Tell him I'm still here. And you: when you need into the Fort without the gate guards counting your teeth, come back and ask me nicely."),
    { do: (c) => { c.set("q_whisper", 2); c.set("secret_lead", true); } }] : null,
});

