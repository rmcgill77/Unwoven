/* ------------------------------------------------------------------ */
/* Verrin (Act 3): the Covenant's city in the south. Its rooms, its    */
/* people, the writ at the south gate, the lamplighter's errand that   */
/* opens the Lantern Gate, the Registry, and the Arbiter who sends you */
/* on to Aurelm. The maps are in 04z_verrin.js.                        */
/* ------------------------------------------------------------------ */

PILLARS.verrin_court = { map: "ver_hi", name: "Pillar Court, Verrin", at: [84, 33, "up"], covenant: true };

/* ---------- rooms ---------- */
const VER_DOORS = {
  ver_lamp: { map: "ver_lo", door: [73, 54], name: "The Gilded Lamp", w: 18, h: 12 },
  ver_arms: { map: "ver_lo", door: [112, 22], name: "Kell's Arms", w: 12, h: 9, floor: "s" },
  ver_physic: { map: "ver_lo", door: [122, 22], name: "Brand's Physic", w: 12, h: 9 },
  ver_trade: { map: "ver_lo", door: [112, 41], name: "Hale's Goods", w: 12, h: 9 },
  ver_books: { map: "ver_lo", door: [122, 41], name: "Mosse's Books", w: 12, h: 9 },
  ver_nell: { map: "ver_lo", door: [154, 24], name: "The Lamplighter's House", w: 12, h: 9 },
  ver_chapel: { map: "ver_hi", door: [84, 17], name: "The Grand Chapel of the Archon", w: 20, h: 12, floor: "s" },
  ver_registry: { map: "ver_hi", door: [52, 20], name: "The Registry of the Weave", w: 18, h: 11, floor: "s" },
  ver_arbiter: { map: "ver_hi", door: [116, 20], name: "The Arbiter's Hall", w: 18, h: 11, floor: "s" },
};
const VER_PROPS = {
  ver_lamp: [{ p: "fireplace", x: 8, y: 0 }, { p: "lantern", x: 2, y: 0 }, { p: "lantern", x: 15, y: 0 }, { p: "painting", x: 5, y: 0, v: 1 }, { p: "painting", x: 12, y: 0, v: 0 },
    { p: "table", x: 4, y: 5, v: 2 }, { p: "chair", x: 3, y: 5 }, { p: "chair", x: 6, y: 5 }, { p: "table", x: 11, y: 5, v: 1 }, { p: "chair", x: 10, y: 5 }, { p: "chair", x: 13, y: 5 },
    { p: "table", x: 7, y: 8, v: 2 }, { p: "chair", x: 6, y: 8 }, { p: "chair", x: 9, y: 8 }, { p: "shelf", x: 1, y: 2, v: 2 }, { p: "jugs", x: 2, y: 2 }, { p: "bed", x: 16, y: 2, v: 1 }, { p: "plant", x: 16, y: 9 }],
  ver_arms: [{ p: "rack", x: 1, y: 2 }, { p: "rack", x: 2, y: 2 }, { p: "tools", x: 5, y: 0 }, { p: "anvil", x: 8, y: 3 }, { p: "crate", x: 10, y: 6 }, { p: "lantern", x: 9, y: 0 }],
  ver_physic: [{ p: "herbs", x: 1, y: 0 }, { p: "herbs", x: 4, y: 0 }, { p: "shelf", x: 1, y: 2, v: 2 }, { p: "jugs", x: 3, y: 2 }, { p: "cauldron", x: 9, y: 3 }, { p: "table", x: 5, y: 5, v: 1 }, { p: "candles", x: 7, y: 2 }],
  ver_trade: [{ p: "shelf", x: 1, y: 2, v: 2 }, { p: "shelf", x: 2, y: 2, v: 1 }, { p: "baskets", x: 5, y: 2 }, { p: "crate", x: 9, y: 2 }, { p: "sack", x: 10, y: 2 }, { p: "barrel", x: 10, y: 6 }, { p: "lantern", x: 6, y: 0 }],
  ver_books: [{ p: "shelf", x: 1, y: 2, v: 1 }, { p: "shelf", x: 2, y: 2, v: 0 }, { p: "shelf", x: 9, y: 2, v: 1 }, { p: "shelf", x: 10, y: 2, v: 0 }, { p: "books", x: 4, y: 2 }, { p: "desk", x: 5, y: 5, lk: "vbooks" }, { p: "candles", x: 7, y: 2 }],
  ver_nell: [{ p: "fireplace", x: 1, y: 0 }, { p: "table", x: 5, y: 4, v: 0, lk: "glasses" }, { p: "lantern", x: 4, y: 0 }, { p: "lantern", x: 8, y: 0 }, { p: "crate", x: 10, y: 2 }, { p: "bed", x: 10, y: 5 }, { p: "chair", x: 4, y: 4 }],
  ver_chapel: [{ p: "desk", x: 9, y: 2, lk: "altar_ver" }, { p: "candles", x: 7, y: 2 }, { p: "candles", x: 12, y: 2 }, { p: "painting", x: 9, y: 0, v: 1 },
    ...[3, 5, 7].map((y) => ({ p: "bench", x: 3, y, lk: "pew" })), ...[3, 5, 7].map((y) => ({ p: "bench", x: 14, y, lk: "pew" })), { p: "plant", x: 1, y: 2 }, { p: "plant", x: 18, y: 2 }],
  ver_registry: [{ p: "desk", x: 8, y: 2, lk: "ledger_reg" }, { p: "chair", x: 9, y: 3 }, { p: "shelf", x: 1, y: 2, v: 1 }, { p: "shelf", x: 2, y: 2, v: 0 }, { p: "shelf", x: 15, y: 2, v: 1 }, { p: "shelf", x: 16, y: 2, v: 0 },
    { p: "books", x: 3, y: 2 }, { p: "bench", x: 3, y: 7 }, { p: "bench", x: 13, y: 7 }, { p: "candles", x: 11, y: 2 }, { p: "lantern", x: 4, y: 0 }, { p: "lantern", x: 13, y: 0 }],
  ver_arbiter: [{ p: "desk", x: 8, y: 2, lk: "arbiter_desk" }, { p: "chair", x: 9, y: 3 }, { p: "painting", x: 8, y: 0, v: 1 }, { p: "shelf", x: 1, y: 2, v: 1 }, { p: "shelf", x: 16, y: 2, v: 1 },
    { p: "plant", x: 1, y: 8 }, { p: "plant", x: 16, y: 8 }, { p: "lantern", x: 4, y: 0 }, { p: "lantern", x: 13, y: 0 }, { p: "chest", x: 15, y: 5, id: "c_ver_arbiter" }],
};
for (const id in VER_DOORS) {
  const r = VER_DOORS[id], mat = Math.floor(r.w / 2) - (r.w % 2 ? 0 : 1);
  MAP_DEFS[id] = { name: r.name, outside: false, act2: true, act3: true, rows: ashRoom(r.w, r.h, mat, r.floor || "o"), props: VER_PROPS[id] || [],
    warps: [{ x: mat, y: r.h - 1, to: r.map, tx: r.door[0], ty: r.door[1] + 1, dir: "down" }] };
  MAP_DEFS[r.map].warps.push({ x: r.door[0], y: r.door[1], to: id, tx: mat, ty: r.h - 2, dir: "up" });
}
const VER_LOOKS = {
  door: ["Locked. A brass plate on it gives a name and a Covenant rank.", "Nobody answers. The knocker is polished bright.", "A servant opens it a crack, looks at your boots, and closes it again."],
  gate_verrin_in: ["A gate of black iron under the Covenant's sunburst. Guards in purple and gold either side, very still."],
  wall_verrin_in: ["White stone, scrubbed. Somebody's job is to keep Verrin's walls clean, and they do it well."],
};
for (const id of ["ver_lo", "ver_hi"]) MAP_DEFS[id].looks = Object.assign({}, ETH_LOOKS, VER_LOOKS);
Object.assign(LOOK_TEXT, {
  fountain: ["The Archon's fountain: a white figure with open hands, water running from both. The basin is full of coppers, and a soldier watches it."],
  vboard: ["A notice board by the Lantern Gate. 'Curfew at the second bell.' 'The Registry of the Weave sits daily.' 'Report the snapped thread wherever it is seen.'"],
  spears: ["Practice spears racked in rows, blunted, numbered. Even the training weapons in Verrin are kept in order."],
  vlamp: ["A street lamp on an iron post, burning clean."],
  glasses: ["New lamp chimneys packed in straw, and a box of wicks. A list in careful hand: which lamps, which streets, which nights."],
  vbooks: ["Histories of the Covenant, a primer of the Old Tongue with half the pages sealed by order, and a book of Verrin's laws as thick as a brick."],
  altar_ver: ["The great altar under the sunburst, gold on white. Seven candles for the seven Archons. One is always kept unlit."],
  ledger_reg: ["The Registry's ledger. Name, place of birth, the nature of the gift, and a column headed 'Mark given'. Every line is filled."],
  arbiter_desk: ["Reports from Aurelm, Rotmoor and the Capital Road, sorted into neat piles. The pile from Aurelm is the tallest."],
});
Object.assign(CHEST_LOOT, { c_ver_arbiter: [80, { gtonic: 1 }] });
ITEMS.lanterntoken = { name: "Lamplighter's token", quest: true, desc: "A brass disc stamped with a lantern. The Lamplighters of Verrin walk every street, High Town too, and so may whoever carries one." };
ITEMS.lampglass = { name: "Lamp chimneys", quest: true, desc: "New glass chimneys and wicks, packed in straw, for the lamps someone keeps smashing in the east tenements." };

/* ---------- people ---------- */
const VG = (name, title, skin, hair) => ({ name, title, look: { skin, hair, helm: true, cloth: 4, outfit: "coat", mood: "neutral" } });
Object.assign(NPC_DEFS, {
  rhosyn: { name: "Captain Rhosyn Tal", title: "Captain of the south gate", look: { sex: "f", skin: 1, hair: 1, helm: true, cloth: 4, outfit: "coat", mood: "neutral" },
    schedule: [{ h: 0, map: "ver_lo", x: 88, y: 54, w: 0, where: "the south gate" }] },
  sabine: { name: "Warden Sabine Coll", title: "Warden of the Lantern Gate", look: { sex: "f", skin: 0, hair: 4, hairStyle: "bun", helm: true, cloth: 4, outfit: "coat", mood: "neutral" },
    schedule: [{ h: 0, map: "ver_lo", x: 81, y: 5, w: 0, where: "the Lantern Gate" }] },
  nell: { name: "Nell Ashby", title: "Lamplighter", look: { sex: "f", skin: 2, hair: 2, hood: true, cloth: 1, outfit: "coat", mood: "smile", age: true },
    schedule: [{ h: 0, map: "ver_nell", x: 5, y: 5, w: 1, where: "the lamplighter's house" }] },
  mirela: { name: "Mirela Sorrel", title: "Keeper of the Gilded Lamp", look: { sex: "f", skin: 0, hair: 3, hairStyle: "bun", cloth: 5, apron: "#e0d8c0", mood: "smile" },
    schedule: [{ h: 0, map: "ver_lamp", x: 3, y: 4, w: 1, where: "the Gilded Lamp" }] },
  jasper: { name: "Jasper Kell", title: "Armourer", look: { skin: 1, hair: 0, beard: true, cloth: 3, apron: "#4a3a2a", mood: "neutral" },
    schedule: [{ h: 0, map: "ver_arms", x: 5, y: 5, w: 1, where: "his shop" }] },
  ottilie: { name: "Ottilie Brand", title: "Apothecary", look: { sex: "f", skin: 1, hair: 4, hairStyle: "bun", cloth: 7, apron: "#7a8a6a", mood: "neutral", glasses: true },
    schedule: [{ h: 0, map: "ver_physic", x: 5, y: 3, w: 1, where: "her shop" }] },
  fenwick: { name: "Fenwick Hale", title: "Trader", look: { skin: 2, hair: 1, cloth: 5, outfit: "coat", mood: "smile" },
    schedule: [{ h: 0, map: "ver_trade", x: 5, y: 4, w: 1, where: "his shop" }] },
  aurin: { name: "Aurin Mosse", title: "Bookseller", look: { skin: 0, hair: 5, cloth: 6, outfit: "coat", mood: "neutral", glasses: true, age: true },
    schedule: [{ h: 0, map: "ver_books", x: 5, y: 4, w: 1, where: "his shop" }] },
  herald: { name: "Covenant herald", title: "The market", look: { skin: 1, hair: 3, cloth: 4, outfit: "tunic", mood: "smile" },
    schedule: [{ h: 0, map: null }, { h: 7, map: "ver_lo", x: 79, y: 27, w: 1, where: "the market" }, { h: 19, map: null }] },
  vdrill1: { ...VG("Covenant recruit", "The training yard", 2, 0), schedule: [{ h: 0, map: null }, { h: 7, map: "ver_lo", x: 18, y: 21, w: 2, where: "the training yard" }, { h: 18, map: null }] },
  vdrill2: { ...VG("Drill sergeant", "The training yard", 0, 1), schedule: [{ h: 0, map: null }, { h: 7, map: "ver_lo", x: 28, y: 24, w: 1, where: "the training yard" }, { h: 18, map: null }] },
  vpatrol: { ...VG("Covenant soldier", "Street patrol", 1, 2), schedule: [{ h: 0, map: "ver_lo", x: 84, y: 40, w: 6, where: "the Gate Road" }] },
  vtene1: { name: "A tenement woman", title: "", look: { sex: "f", skin: 2, hair: 2, hood: true, cloth: 0, outfit: "dress", mood: "neutral" },
    schedule: [{ h: 0, map: null }, { h: 8, map: "ver_lo", x: 146, y: 30, w: 2, where: "the east tenements" }, { h: 18, map: null }] },
  vtene2: { name: "A dock-hand", title: "", look: { skin: 3, hair: 0, cloth: 3, outfit: "tunic", mood: "sly" },
    schedule: [{ h: 0, map: null }, { h: 9, map: "ver_lo", x: 148, y: 46, w: 2, where: "the east tenements" }, { h: 20, map: null }] },
  vkid: { name: "Lark", title: "", child: true, look: { skin: 1, hair: 1, cloth: 2, outfit: "tunic", mood: "sly", child: true },
    schedule: [{ h: 0, map: null }, { h: 9, map: "ver_lo", x: 139, y: 34, w: 3, where: "the east tenements" }, { h: 17, map: null }] },
  venn: { name: "Arbiter Cassius Venn", title: "Arbiter of the South", look: { skin: 0, hair: 5, beard: true, cloth: 6, outfit: "coat", mood: "neutral", age: true },
    schedule: [{ h: 0, map: "ver_arbiter", x: 8, y: 4, w: 1, where: "the Arbiter's Hall" }] },
  lorne: { name: "Registrar Ebbe Lorne", title: "Registry of the Weave", look: { skin: 1, hair: 2, cloth: 4, outfit: "coat", mood: "neutral", glasses: true },
    schedule: [{ h: 0, map: "ver_registry", x: 8, y: 4, w: 1, where: "the Registry" }] },
  dawe: { name: "High Curate Seraphine Dawe", title: "The Grand Chapel", look: { sex: "f", skin: 0, hair: 5, hood: true, cloth: 4, outfit: "dress", mood: "smile", age: true },
    schedule: [{ h: 0, map: "ver_chapel", x: 9, y: 4, w: 1, where: "the Grand Chapel" }] },
  vguardhi: { ...VG("Covenant soldier", "The Lantern Gate", 2, 1), schedule: [{ h: 0, map: "ver_hi", x: 81, y: 51, w: 0, where: "the Lantern Gate" }] },
  vnoble: { name: "A High Town lady", title: "", look: { sex: "f", skin: 0, hair: 3, hairStyle: "bun", cloth: 6, outfit: "dress", mood: "neutral" },
    schedule: [{ h: 0, map: null }, { h: 9, map: "ver_hi", x: 64, y: 31, w: 3, where: "the Avenue" }, { h: 18, map: null }] },
  vinitiate: { name: "A Covenant Initiate", title: "The Initiates' College", look: { skin: 2, hair: 1, hood: true, cloth: 4, outfit: "coat", mood: "neutral" },
    schedule: [{ h: 0, map: null }, { h: 8, map: "ver_hi", x: 54, y: 52, w: 1, where: "the College steps" }, { h: 18, map: null }] },
});
const VER_NPCS = ["rhosyn", "sabine", "nell", "mirela", "jasper", "ottilie", "fenwick", "aurin", "herald", "vdrill1", "vdrill2", "vpatrol", "vtene1", "vtene2", "vkid", "venn", "lorne", "dawe", "vguardhi", "vnoble", "vinitiate"];
for (const k of VER_NPCS) { NPC_DEFS[k].id = k; NPC_DEFS[k].act2 = true; }

/* ---------- shops ---------- */
Object.assign(SHOPS, {
  ver_arms: { name: "Kell's Arms", keeper: "Jasper", stock: ["fortblade", "leyblade", "brigandine", "fortplate", "sallet", "greathelm", "frostcrown"], bonus: ["arms"], only: ["arms", "salvage"], mult: 1.1, buy: 0.95, purse: 400 },
  ver_physic: { name: "Brand's Physic", keeper: "Ottilie", stock: ["spoultice", "gpoultice", "btonic", "gtonic", "antidote"], bonus: ["herb"], only: ["herb", "dark"], mult: 1.1, buy: 1, purse: 250 },
  ver_trade: { name: "Hale's Goods", keeper: "Fenwick", stock: ["bandage", "poultice", "spoultice", "bread", "ration", "rope", "torchoil", "ink", "candle"], bonus: ["hide", "silk", "food"], mult: 1.05, buy: 1, purse: 300 },
  ver_books: { name: "Mosse's Books", keeper: "Aurin", stock: ["ink", "candle"], bonus: ["dark"], only: ["dark", "salvage"], mult: 1.2, buy: 1.1, purse: 200 },
});
const VER_INN = 60;

/* ---------- talk ---------- */
const vv = (who, t) => ({ who, t });
const verWith = (c, id, t) => (inParty(c.G, id) ? [vv(id, t)] : []);
const VER_LAMPS = ["a", "b", "c"];
const verLampsDone = (G) => VER_LAMPS.filter((k) => G.flags["vlamp_" + k]).length;
Object.assign(SCRIPTS, {
  rhosyn: (c) => [vv("rhosyn", c.rot("rhosyn", ["Walk in order. Keep to the left of the Gate Road. Don't touch the fountain coppers.", "Stonebridge's writ. Good. Corwen writes a clean hand.", "We turned away forty from the south last week. Rotmoor folk, mostly. Orders."]))],
  sabine: (c) => {
    const s = qs(c.G, "q_lantern");
    if (c.flag("ver_lantern")) return [vv("sabine", c.rot("sabine_ok", ["Nell's token. Go through.", "Mind your manners up there. High Town has long memories.", "The Pillar's in the court, straight up the Processional."]))];
    if (!s) return [
      vv("sabine", "High Town is for residents, the Covenant's servants, and those who carry a Lamplighter's token. You are none of those."),
      vv("sabine", "If you have business with the Arbiter, or the Registry, the Lamplighters can vouch for you. They walk every street in the city, and they know who belongs where."),
      vv("sabine", "Nell Ashby, in the east tenements. She'll give you a token or she won't. That's the check."),
      { do: (c) => c.set("q_lantern", 1) }, ...verWith(c, "tessa", "A lamplighter decides who's allowed up the hill? That's... actually rather sensible.")];
    return [vv("sabine", "Nell Ashby, in the east tenements. Her house is the one with lamps in every window. Token, or turn about.")];
  },
  nell: (c) => {
    const s = qs(c.G, "q_lantern");
    if (s <= 1) return [
      vv("nell", "Sabine sent you? Ha. She sends me everyone she doesn't like the look of. Sit, sit."),
      vv("nell", "A token. Well. A token means I vouch for you, and I don't vouch for strangers. But I'll tell you how strangers stop being strangers."),
      vv("nell", "Three lamps in the tenements keep getting smashed. Same three, every few nights. Glass broken, wicks cut. I've not the knees to climb those posts as often as I used to."),
      vv("nell", "Take these chimneys and wicks and set them right. Do that, and you've done the city a service, and I'll put my name to you."),
      { do: (c) => { c.set("q_lantern", 2); c.give("lampglass", 1); } }, vv("narrator", "Nell gives you a bundle of lamp chimneys and wicks.")];
    if (s === 2) { const n = verLampsDone(c.G); return [vv("nell", n ? `${n} of three. Keep on. The one by the well-yard's the worst.` : "Three lamps. East tenements. You'll know them, they'll be the dark ones.")]; }
    if (s === 3) return [
      vv("nell", "All three? And did you see who's breaking them?"),
      vv("nell", "No, don't tell me. I can guess. Some folk in the tenements want a few dark corners, and the Covenant wants none at all. I just want the streets lit."),
      { do: (c) => { c.set("q_lantern", 4); c.set("ver_lantern"); c.take("lampglass", 1); c.give("lanterntoken", 1); c.coins(40); } },
      vv("nell", "Here. A Lamplighter's token, and forty for your trouble. Show Sabine. She'll scowl, and then she'll let you through."),
      vv("narrator", "Nell gives you a Lamplighter's token and 40 coppers.")];
    return [vv("nell", c.rot("nell", ["Lamps are lit. City's safe. That's the job.", "Forty years I've lit these streets. Never been up the hill except to light it.", "The Unbound have their meetings in the dark. The Covenant has its meetings in the light. I light both."]))];
  },
  look_vlamp: (c, id) => {
    const s = qs(c.G, "q_lantern");
    if (s === 2 && !c.flag("vlamp_" + id)) {
      const n = verLampsDone(c.G) + 1;
      return [vv("narrator", id === "b" ? "The glass is smashed and the wick cut short. Someone has scratched a snapped thread into the post." : "The lamp is dark, its chimney in pieces on the ground and its wick cut. Neat work. Deliberate."),
        { choice: [["Fit a new chimney and wick", [{ do: (c) => { c.set("vlamp_" + id); if (n >= 3) c.set("q_lantern", 3); } },
          vv("narrator", n >= 3 ? "The last of the three lamps burns again. Time to tell Nell." : `You fit new glass and a wick. (${n} of 3)`)]], ["Leave it", []]] }];
    }
    return [vv("narrator", c.flag("vlamp_" + id) ? "The lamp you mended, burning clean. For now." : "A street lamp on an iron post. This one has been smashed, and recently.")];
  },
  mirela: (c) => {
    const room = { choice: [
      [`Take a room (${VER_INN} coppers)`, [{ do: (c) => { if (c.G.coins >= VER_INN) c.coins(-VER_INN); } }, (c.G.coins >= VER_INN
        ? { choice: [[isNightT(c.G.time) ? "Sleep until morning" : "Sleep until nightfall", [{ do: (c) => c.innRest(true) }]], ["Just rest a while", [{ do: (c) => c.innRest(false) }]]] }
        : vv("mirela", "Sixty. This is the Gilded Lamp, not a hayloft."))]],
      ["Not now.", []]] };
    return [vv("mirela", c.flag("met_mirela") ? c.rot("mirela", ["Boots off the chairs, please.", "The Arbiter dined here last month. We've had the chair re-covered.", "Wine from the Capital, if you've the coin. You haven't."])
      : "Welcome to the Gilded Lamp. Sixty a night, and we do ask that guests wash before dinner."), { do: (c) => c.set("met_mirela") }, room];
  },
  jasper: (c) => [vv("jasper", c.rot("jasper", ["Covenant pattern, every piece. Proofed and stamped.", "If it's good enough for the Arbiter's guard, it's good enough for you.", "Going south? Buy the heavier mail."])), { choice: [["Trade", [{ shop: "ver_arms" }]], ["Goodbye.", []]] }],
  ottilie: (c) => [vv("ottilie", c.rot("ottilie", ["Tonics, poultices, physic. Everything's dearer since Rotmoor.", "If you've come from the south, don't touch your face until you've washed.", "I hear the sickness is in the roots. I hear a lot of things."])), { choice: [["Trade", [{ shop: "ver_physic" }]], ["Goodbye.", []]] }],
  fenwick: (c) => [vv("fenwick", c.rot("fenwick", ["Rope, oil, bread. Everything a traveller forgets.", "Business is good. People buy when they're frightened.", "The Capital road's closed to carts. Everything comes the long way."])), { choice: [["Trade", [{ shop: "ver_trade" }]], ["Goodbye.", []]] }],
  aurin: (c) => [vv("aurin", c.rot("aurin", ["Histories, primers, law. Nothing the Registry hasn't approved. Mostly.", "Old Tongue primers have half their pages sealed. By order. I didn't seal them.", "If you find old books on the road, I buy. Quietly."])), { choice: [["Trade", [{ shop: "ver_books" }]], ["Goodbye.", []]] }],
  herald: (c) => [vv("herald", c.rot("herald", ["Hear ye! The Registry of the Weave sits daily in High Town! All who show the mark, report!", "Hear ye! Curfew at the second bell! The Arbiter keeps the peace!", "Hear ye! Report the snapped thread wherever it is seen!"]))],
  vdrill1: (c) => [vv("vdrill1", c.rot("vdrill1", ["Can't talk. Drill.", "Third week. My arms have stopped hurting. Now they just don't work.", "We're being sent to Aurelm. Everyone's being sent to Aurelm."]))],
  vdrill2: (c) => [vv("vdrill2", c.rot("vdrill2", ["Move along, civilian.", "Again! From the top! Shields UP!", "Purifiers think they can do our job with fire. They can't."]))],
  vpatrol: (c) => [vv("vpatrol", c.rot("vpatrol", ["Keep to the left.", "Papers? Writ? Good. Carry on.", "Quiet day. Quiet's good."]))],
  vtene1: (c) => [vv("vtene1", c.rot("vtene1", ["You're not from the tenements.", "The lamps? I don't know anything about the lamps.", "My cousin's in Rotmoor. Was."]))],
  vtene2: (c) => [vv("vtene2", c.rot("vtene2", ["Nice boots. Covenant buy you those?", "There's a meeting, some nights. You didn't hear it from me.", "Snapped thread? Never heard of it. Never."]))],
  vkid: (c) => [vv("vkid", c.rot("vkid", ["I didn't break any lamps.", "You can see the stars better when the lamps are out. That's all I'm saying.", "Are you rich? You look rich. You don't look rich."]))],
  venn: (c) => {
    const s = qs(c.G, "q_aurelm");
    if (!s) return [
      vv("venn", "Sit. The Lamplighter vouches for you, and the bailiff of Stonebridge writes you a clean hand. That is two more people than vouch for most travellers."),
      vv("venn", "Cassius Venn. I am the Arbiter of the South, which means I keep the Archon's order between here and the Capital. It is not an easy year for order."),
      vv("venn", "Rotmoor is sick. The trees on the road are dying. And Aurelm, our oldest city, the keeper of the Vault, has been robbed. Of what, the Vault-Keeper will not say in a letter."),
      vv("venn", "I need eyes in Aurelm that are not Aurelm's. Go south. Offer the Vault-Keeper your help, in my name. Tell me what you find."),
      { do: (c) => c.set("q_aurelm", 1) }, ...verWith(c, "hakon", "Aurelm. South. Hm. And the Crags are west. We will go where the road bends.")];
    return [vv("venn", c.rot("venn", ["Aurelm. The Vault-Keeper is expecting someone. Not you, but someone.", "The Registry is across the court, if you have business with it.", "Order is a kindness, traveller. Most people only learn that when it is gone."]))];
  },
  lorne: (c) => {
    const out = [];
    if (!c.flag("ver_registered")) out.push(
      vv("lorne", "Name? No, wait. You're the travellers with the Lamplighter's token. Good. You'll have the Weave in you, at least one of you. I can always tell. It's in how you stand."),
      vv("lorne", "Registration is for your protection. The Covenant keeps the gifted safe, and keeps the world safe from the careless. Name, birthplace, the nature of the gift, and the mark."),
      { choice: [["Register", [vv("lorne", "There. Your name in the ledger, the mark on your wrist. It'll fade in a day. The record won't."), { do: (c) => c.set("ver_registered") },
        vv("narrator", "Your name is written in the Registry of the Weave.")]],
        ["\"Not today.\"", [vv("lorne", "It will have to be some day. The law isn't a suggestion. But I can wait. The Registry is patient.")]]] });
    else out.push(vv("lorne", c.rot("lorne", ["The record is kept. That's all the Registry does: keeps.", "A former Initiate was in here this morning, shouting about the archive. Shouting. In the Registry.", "Every gift in the south, in one book. It's a beautiful thing, order."])));
    return out;
  },
  dawe: (c) => [vv("dawe", c.rot("dawe", ["Welcome, children of the Weave. The Archons kept the world when it would have unravelled. The Covenant keeps it now.",
    "Seven candles, seven Archons. One is always unlit, for the Archon who failed. We remember failure here. It keeps us careful.", "Pray for Rotmoor. Pray for Aurelm. And pray the roots stay in the south."]))],
  vguardhi: (c) => [vv("vguardhi", c.rot("vguardhi", ["Token. Good.", "Mind the Avenue. Carriages.", "Quiet up here. Always quiet up here."]))],
  vnoble: (c) => [vv("vnoble", c.rot("vnoble", ["Oh. You're... from Lower Town?", "The Arbiter dines with us on Holy Days. He's very tired lately.", "I hear Aurelm is simply ruined. Robbed! The Vault!"]))],
  vinitiate: (c) => [vv("vinitiate", c.rot("vinitiate", ["The College is closed to visitors. I'm sorry.", "We learn the words the Covenant allows. Only those.", "Someone left the College last year. Walked out in the middle of the night. We're not supposed to talk about it."]))],
});

/* ---------- the task list ---------- */
ASH_QUESTS.push(
  ["q_lantern", "The Lantern Gate", ["", "Find Nell Ashby the lamplighter in the east tenements", "Mend the three smashed lamps in the tenements", "Tell Nell the lamps are lit"], ["", "Warden Coll says Nell can vouch for you", "Look for the dark lamps among the tenements", "The lamplighter's house, east tenements"]],
  ["q_aurelm", "Eyes in Aurelm", ["", "Go south to Aurelm and offer the Vault-Keeper your help"], ["", "Aurelm lies far south, past Millhaven"]],
);
QUEST_ENTER_HOOKS.push((G, id) => {
  if (id === "ver_lo" && (G.flags.q_sbwrit | 0) === 1) G.flags.q_sbwrit = 2;
  if (id === "ver_lo" && !G.flags.reached_verrin) {
    G.flags.reached_verrin = true;
    return [{ who: "narrator", t: "The south gate guard reads the bailiff's writ twice, folds it, and hands it back. \"Verrin. Walk in order.\"" },
      { who: "narrator", t: "White stone, scrubbed clean. Purple and gold on every pole. Soldiers on every corner, a herald crying the law in the market, and above it all, the Lantern Gate and the high white towers of High Town." },
      ...(inParty(G, "tessa") ? [{ who: "tessa", t: "It's beautiful. It's also a bit like being watched by a building." }] : [])];
  }
  if (id === "ver_hi" && !G.flags.reached_verrin_hi) {
    G.flags.reached_verrin_hi = true;
    return [{ who: "narrator", t: "High Town. Gardens behind iron rails, a court of white stone around the city's Pillar, and at the head of the Processional, the Grand Chapel of the Archon." }];
  }
  return null;
});
