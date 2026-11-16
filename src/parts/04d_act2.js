/* ------------------------------------------------------------------ */
/* Act 2 foundations (Phase 1): items, merchants, the economy rules,   */
/* Pillars as rest points, pickups that regrow, and the Act 2 state.   */
/* Nothing here draws; the engine and the UI call into it.             */
/* ------------------------------------------------------------------ */
const STACK_CAP = 999;
function giveItem(G, id, n = 1) { G.items[id] = Math.min(STACK_CAP, (G.items[id] || 0) + n); return G.items[id]; }

/* ---------- items the wider world adds ---------- */
/* cat: what kind of thing it is, so a buyer can pay a bonus for a category. tier is only for sorting. */
Object.assign(ITEMS, {
  // creature materials
  tusk: { name: "Boar tusk", sell: 6, cat: "hide", desc: "Yellow, curved, and chipped at the tip. The boar was using it." },
  hide: { name: "Boar hide", sell: 5, cat: "hide", desc: "Thick, bristled and badly skinned. A tanner will sigh, and pay." },
  haunch: { name: "Haunch of meat", sell: 3, cat: "food", desc: "Wrapped in dock leaves. It will keep for a day in this cold." },
  rattail: { name: "Rat tail", sell: 1, cat: "hide", desc: "The watch pays a copper a tail. Nobody asks what they do with them." },
  batwing: { name: "Bat wing", sell: 1, cat: "dark", desc: "Thin as wet paper. Apothecaries grind them into something they will not name." },
  frostsilk: { name: "Frost silk", sell: 6, cat: "silk", desc: "Spider silk gone white and stiff with rime. It never quite thaws." },
  snapvine: { name: "Snapvine", sell: 3, cat: "herb", desc: "A length of vine that still tries, weakly, to close on your finger." },
  sap: { name: "Amber sap", sell: 4, cat: "herb", desc: "Thick and bitter. It seals a wound, or a letter." },
  emberdust: { name: "Ember dust", sell: 4, cat: "dark", desc: "Warm grey grit that glows when you breathe on it." },
  // what people carry
  bandage: { name: "Bandage", price: 8, sell: 3, cat: "supply", desc: "Boiled linen, rolled tight. Stops a bleed and mends a little." },
  dagger: { name: "Chipped dagger", sell: 8, cat: "arms", desc: "Somebody's last argument. The edge is mostly notches." },
  boots: { name: "Worn boots", sell: 4, cat: "arms", desc: "Two boots, not a pair. Still better than most on the road." },
  club: { name: "Spiked club", sell: 7, cat: "arms", desc: "A fence post with nails through it. Honest work, of a kind." },
  tunic: { name: "Bandit's tunic", sell: 9, cat: "arms", desc: "Good wool under the dirt. The stitched-over holes tell their own story." },
  arrows: { name: "Bundle of arrows", sell: 2, cat: "arms", desc: "Goose-fletched, and straighter than their owner's aim." },
  shortbow: { name: "Short bow", sell: 12, cat: "arms", desc: "Yew, worn pale at the grip. It has been drawn in anger more than once." },
  helm: { name: "Horned helmet", sell: 14, cat: "arms", desc: "Frozen Vale work. One horn is cracked, the other is not original." },
  shield: { name: "Dented shield", sell: 12, cat: "arms", desc: "Painted over twice. Under the paint, somebody else's crest." },
  shortsword: { name: "Short sword", sell: 15, cat: "arms", desc: "Plain, heavy and sharp. A soldier's blade, not a lord's." },
  axe: { name: "Vale axe", sell: 14, cat: "arms", desc: "Bearded and badly balanced. It was not made for wood." },
  cleaver: { name: "Notched cleaver", sell: 12, cat: "arms", desc: "A butcher's tool that changed trades." },
  potion: { name: "Murky draught", sell: 6, cat: "supply", desc: "Orc brew, thick as pond water. It smells of pine tar and regret." },
  scrap: { name: "Iron scrap", sell: 12, cat: "salvage", desc: "Plates and rivets, old and well made. A forge will want them." },
  // the dead and the dark
  bone: { name: "Old bone", sell: 2, cat: "dark", desc: "Dry, light and very clean. It walked here on its own." },
  gravecoin: { name: "Grave coin", sell: 5, cat: "dark", desc: "Struck for a king nobody remembers, to pay a ferryman nobody has met." },
  ring: { name: "Tarnished ring", sell: 15, cat: "dark", desc: "Silver gone black. There is an inscription inside, worn to a whisper." },
  bonecharm: { name: "Bone charm", sell: 10, cat: "dark", desc: "Knucklebones on a cord. It rattles when nothing moves it." },
  cutgem: { name: "Cut gem", sell: 60, cat: "curio", desc: "Cloudy blue, old-cut. Somebody hid this, and never came back for it." },
  stoneheart: { name: "Stone heart", sell: 40, cat: "curio", desc: "A fist of grey rock, warm as a hand. It beats about once an hour." },
  signet: { name: "House signet ring", sell: 40, cat: "curio", desc: "Heavy gold, with the seal of a House in the Frozen Vale. Proof of who was paid, if not who paid." },
  // the Purifiers
  firewax: { name: "Firewax candle", sell: 3, cat: "dark", desc: "Black wax that burns hot and fast. It has one purpose, and it is not light." },
  cuttoken: { name: "Cut-thread token", sell: 5, cat: "dark", desc: "A clay disc stamped with a thread, cut through. Whoever carries these does not want them found." },
  leaflet: { name: "Singed leaflet", quest: true, desc: "Cheap paper, hand-pressed. 'What was woven can be unpicked.' The rest is ash." },
  // supplies sold in the wider world (their battle effects arrive with Phase 2)
  spoultice: { name: "Strong poultice", price: 28, sell: 7, cat: "supply", desc: "Red-cap, yarrow and silk, bound tight. Mends a serious wound." },
  gpoultice: { name: "Greater poultice", price: 55, sell: 14, cat: "supply", desc: "Fort-made, and sealed with wax. The quartermaster counts every one." },
  btonic: { name: "Breath tonic", price: 30, sell: 6, cat: "supply", desc: "Mandrake and yarrow, steeped cold. It opens the chest and steadies the word." },
  firepot: { name: "Firewax pot", cat: "supply", desc: "Purifier wax and lamp oil in a clay flask. Throw it, and stand well back." },
  fangcharm: { name: "Fang charm", gear: { slot: "charm", mag: 2, spd: 1 }, desc: "Wolf fangs knotted on spider silk. Hunters swear it keeps the hand quick." },
  gtonic: { name: "Greater tonic", price: 60, sell: 12, cat: "supply", desc: "Clear, cold and sharp. It puts the breath back in you." },
  antidote: { name: "Antidote", price: 14, sell: 4, cat: "supply", desc: "Charcoal, honey and a bitter root. It works if you are quick." },
  torchoil: { name: "Torch oil", price: 10, sell: 2, cat: "supply", desc: "Thin oil in a clay flask. Burns bright, and takes to a blade." },
  ration: { name: "Trail ration", price: 6, sell: 2, cat: "food", desc: "Hard cheese, harder biscuit and a strip of something that was once a goat." },
  // quest pieces
  constructkey: { name: "Construct's key", quest: true, desc: "A square iron key with a Covenant mark filed almost flat." },
  maudletter: { name: "Ulric's letter", quest: true, desc: "Good paper, a Covenant seal, and a careful hand. For Old Maud, in the North Woods." },
  billofsale: { name: "Bill of sale", quest: true, desc: "A receipt for 'one smith, sound', paid under a seal of a cut thread." },
  keystone: { name: "Pillar Keystone", quest: true, desc: "A cyan stone the size of an egg. It hums in the same key as the Pillars." },
  primer: { name: "The Tellers' Primer", quest: true, desc: "A slim book bound in grey cloth, nothing like yours. Its pages teach how to tell true from false." },
  // unique gear found in the world
  weaverplate: { name: "Weaverplate Cuirass", gear: { slot: "body", def: 9, guard: 0.25 }, desc: "Covenant plate, older than the Covenant admits. Guarding in it turns a blow further aside." },
  hakoncleaver: { name: "The Iron Cleave", who: "hakon", gear: { slot: "weapon", atk: 18 }, desc: "A cleaver the length of a man's arm, carried south from the Vale. It suits Hakon better than its last owner." },
  rimefang: { name: "Rimefang cloak", gear: { slot: "head", def: 4 }, desc: "The pelt of the white wolf, hood and all. The cold stays outside it." },
});
/* Tier 1 and Tier 2 gear. Weapons are foci: a little ATK, and MAG for the spells that do the real work. */
Object.assign(ITEMS, {
  ironblade: { name: "Iron channel blade", price: 120, tier: 1, gear: { slot: "weapon", atk: 4, mag: 3, spell: 0.05 }, desc: "A broad, plain blade with a groove down the flat. Ashford smiths call it a channel; nobody says for what." },
  wayblade: { name: "Wayfarer's blade", price: 145, tier: 1, gear: { slot: "weapon", atk: 5, mag: 3, spell: 0.06 }, desc: "Light, straight and honest. The grip is wrapped in somebody's old scarf." },
  greyedge: { name: "Grey-edge", price: 170, tier: 1, gear: { slot: "weapon", atk: 5, mag: 4, spell: 0.08 }, desc: "A chipped blade that hums a little when you speak near it." },
  tessablade: { name: "Tessa's sword", who: "tessa", gear: { slot: "weapon", atk: 4 }, desc: "Bram's old tavern sword, taken down from over the hearth. Tessa keeps it sharper than he ever did." },
  paddedcoat: { name: "Padded coat", price: 140, tier: 1, gear: { slot: "body", def: 5 }, desc: "Thick wool, quilted in diamonds. Warm, and it turns a knife." },
  ringmail: { name: "Ring-sewn coat", price: 190, tier: 1, gear: { slot: "body", def: 7 }, desc: "Iron rings sewn to leather, one at a time, by someone very patient." },
  leathercap: { name: "Boiled leather cap", price: 70, tier: 1, gear: { slot: "head", def: 2 }, desc: "Hard as a turtle and about as handsome." },
  kettlehat: { name: "Kettle hat", price: 100, tier: 1, gear: { slot: "head", def: 3 }, desc: "A wide iron brim. It keeps off rain, arrows and conversation." },
  ashcharm: { name: "Ashwood charm", price: 90, tier: 1, gear: { slot: "charm", mag: 3 }, desc: "A sliver of Pillar-struck ash on a cord. It is never quite cold." },
  thistlepin: { name: "Thistle pin", price: 140, tier: 1, gear: { slot: "charm", mag: 4 }, desc: "Silver, shaped like the Purple Thistle's sign. Winnie says they are lucky. Winnie sells them." },
  fortblade: { name: "Fort channel blade", price: 230, tier: 2, gear: { slot: "weapon", atk: 6, mag: 6, spell: 0.1 }, desc: "Teal-edged steel from the Fort's own forge. The edge is the colour of a Pillar at dusk." },
  leyblade: { name: "Ley-etched blade", price: 280, tier: 2, gear: { slot: "weapon", atk: 7, mag: 7, spell: 0.12 }, desc: "Fine lines run the length of the flat, and fill with light when you breathe in." },
  frostcrown: { name: "Frostcrown edge", price: 320, tier: 2, gear: { slot: "weapon", atk: 8, mag: 8, spell: 0.15 }, desc: "The armourer's best. It rings like a struck bell and stays cold in the hand." },
  brigandine: { name: "Brigandine", price: 240, tier: 2, gear: { slot: "body", def: 9 }, desc: "Steel plates riveted inside good canvas. Fort issue, with the number filed off." },
  fortplate: { name: "Fort half-plate", price: 320, tier: 2, gear: { slot: "body", def: 12 }, desc: "Breast, back and a grudging allowance for breathing." },
  sallet: { name: "Open sallet", price: 130, tier: 2, gear: { slot: "head", def: 4 }, desc: "A soldier's helm, cut away so you can see what is about to hit you." },
  greathelm: { name: "Rampart helm", price: 180, tier: 2, gear: { slot: "head", def: 6 }, desc: "Heavy, lined with fleece, and stamped with the Fort's crown." },
  leycharm: { name: "Ley-glass charm", price: 170, tier: 2, gear: { slot: "charm", mag: 6 }, desc: "A bead of fused sand from the foot of a Pillar. It shows the weave like breath on a window." },
  scholarseal: { name: "Scholar's seal", price: 240, tier: 2, gear: { slot: "charm", mag: 8 }, desc: "A Covenant Scholar's seal, sold quietly. It steadies the word in your mouth." },
});

/* what the things from Act 1 count as */
for (const [id, cat] of [["pelt", "hide"], ["fang", "hide"], ["gel", "hide"], ["redcap", "herb"], ["mroot", "herb"], ["yarrow", "herb"], ["silk", "silk"], ["token", "curio"], ["bread", "food"], ["poultice", "supply"], ["tonic", "supply"]]) if (ITEMS[id]) ITEMS[id].cat = cat;

/* ---------- merchants ---------- */
/* stock: what they sell. bonus: categories they pay a quarter more for. only: the only categories they will buy.
   mult: regional price multiplier. buy: how much of an item's value they pay (1 = full). purse: their coin. */
const SHOPS = {
  pike: { name: "Pike's Provisions", keeper: "Wenna", stock: ["bread", "candle", "tonic", "rope", "ink", "poultice"], bonus: [], mult: 1, buy: 1, purse: 60 },
  bram: { name: "The Hollow Oak's back shelf", keeper: "Bram", stock: ["bread", "ration", "bandage", "poultice", "btonic"], bonus: ["food"], mult: 1, buy: 1, purse: 80 },
  ashford_general: { name: "Ashford general trader", stock: ["bandage", "poultice", "spoultice", "btonic", "antidote", "bread", "ration", "rope", "ink"], bonus: ["hide", "silk", "herb"], mult: 1, buy: 1, purse: 200 },
  ashford_smith: { name: "Ashford smith and tailor", stock: ["ironblade", "wayblade", "greyedge", "paddedcoat", "ringmail", "leathercap", "kettlehat", "ashcharm", "thistlepin"], bonus: ["arms"], only: ["arms", "salvage"], mult: 1, buy: 1, purse: 150 },
  ashford_herbalist: { name: "Ashford herbalist", stock: ["yarrow", "redcap"], bonus: ["herb"], only: ["herb"], mult: 1, buy: 1, purse: 100 },
  voidsong: { name: "Curate Voidsong", stock: [], bonus: ["dark"], only: ["dark"], mult: 1, buy: 1, purse: 80 },
  greywick_trader: { name: "Greywick trader", stock: ["bandage", "poultice", "spoultice", "btonic", "antidote", "bread", "leathercap", "paddedcoat"], bonus: ["salvage"], mult: 1.15, buy: 0.8, purse: 100 },
  greywick_forge: { name: "Greywick forge", stock: [], bonus: ["salvage"], only: ["salvage", "arms"], mult: 1.15, buy: 0.9, purse: 100 },
  hunters: { name: "Hunters' camp", keeper: "Sefton", stock: ["arrows", "bandage"], bonus: ["hide"], only: ["hide", "food"], mult: 1.1, buy: 1, purse: 120 },
  traders: { name: "Traders' camp", keeper: "Mother Fenwick", stock: ["bandage", "poultice", "btonic", "ration", "torchoil"], bonus: [], mult: 1.1, buy: 0.9, purse: 200 },
  fort_quartermaster: { name: "Fort quartermaster", stock: ["bandage", "poultice", "spoultice", "gpoultice", "btonic", "gtonic", "antidote", "torchoil", "ration", "fortblade", "leyblade", "frostcrown", "brigandine", "fortplate", "sallet", "greathelm", "leycharm", "scholarseal"], bonus: ["arms"], mult: 1, buy: 1, purse: 400 },
  fort_apothecary: { name: "Fort apothecary", stock: ["btonic", "gtonic", "antidote"], bonus: ["herb"], only: ["herb", "dark"], mult: 1, buy: 1, purse: 150 },
  fort_fence: { name: "Lower-quarter fence", stock: [], bonus: [], mult: 1, buy: 0.5, purse: 150 },
};
/* Out in the wider world a poultice and a tonic cost what they are worth. Pike's kept its old prices to the end. */
const ACT2_PRICE = { poultice: 12 };

function act2Ensure(G) {
  if (!G) return G;
  G.purse = G.purse || {}; G.sold = G.sold || {}; G.picked = G.picked || {}; G.regrew = G.regrew || {};
  G.pillars = G.pillars || { oak: true }; G.rests = G.rests || 0;
  G.recipes = G.recipes || [...RECIPE_START]; G.mastery = G.mastery || {}; G.studied = G.studied || {};
  return G;
}
/* ---------- economy ---------- */
const SELL_FULL = 5, SELL_STEP = 0.1, SELL_FLOOR = 0.4;
function shopPurse(G, id) { act2Ensure(G); const s = SHOPS[id]; if (G.purse[id] === undefined) G.purse[id] = s ? s.purse : 0; return G.purse[id]; }
function buyPrice(shopId, itemId) {
  const it = ITEMS[itemId], s = SHOPS[shopId] || SHOPS.pike; if (!it || !it.price) return null;
  const base = (shopId !== "pike" && ACT2_PRICE[itemId]) || it.price;
  return Math.max(1, Math.round(base * (s.mult || 1)));
}
/* what one more of this item would sell for here: its value, the buyer's taste, and how many you have already unloaded */
function sellQuote(G, shopId, itemId) {
  const it = ITEMS[itemId], s = SHOPS[shopId] || SHOPS.pike; act2Ensure(G);
  if (!it || it.quest || (it.gear && !it.price)) return null;
  const base = it.sell !== undefined ? it.sell : it.price ? Math.round(it.price * 0.25) : 0;
  if (!base) return null;
  if (s.only && !s.only.includes(it.cat || "misc")) return null;
  const n = G.sold[itemId] || 0, dim = Math.max(SELL_FLOOR, 1 - Math.max(0, n - SELL_FULL + 1) * SELL_STEP);
  const bonus = s.bonus && s.bonus.includes(it.cat) ? 1.25 : 1;
  const price = Math.max(1, Math.round(base * bonus * (s.buy || 1) * dim));
  return { price, base, bonus: bonus > 1, low: dim < 1, floor: dim <= SELL_FLOOR, short: shopPurse(G, shopId) < price };
}
function sellOne(G, shopId, itemId) {
  const q = sellQuote(G, shopId, itemId);
  if (!q || !(G.items[itemId] > 0) || q.short) return null;
  G.coins += q.price; G.purse[shopId] -= q.price; G.sold[itemId] = (G.sold[itemId] || 0) + 1;
  G.items[itemId] -= 1; if (!G.items[itemId]) delete G.items[itemId];
  return q;
}
function buyOne(G, shopId, itemId) {
  const p = buyPrice(shopId, itemId);
  if (p === null || G.coins < p || (G.items[itemId] || 0) >= STACK_CAP) return null;
  G.coins -= p; giveItem(G, itemId, 1); shopPurse(G, shopId); G.purse[shopId] += p;
  return p;
}
/* time passing: a new day in Oakhaven refills Wenna's purse; a rest at a Pillar only trickles coin back.
   Either way the market forgets a couple of your sales, never all of them at once. */
function econRecover(G, kind) {
  act2Ensure(G);
  for (const id in SHOPS) {
    const cap = SHOPS[id].purse; if (G.purse[id] === undefined) continue;
    G.purse[id] = kind === "day" ? Math.max(G.purse[id], cap) : Math.min(Math.max(G.purse[id], cap), G.purse[id] + Math.ceil(cap * 0.1));
  }
  for (const k of Object.keys(G.sold)) { G.sold[k] = Math.max(0, G.sold[k] - 2); if (!G.sold[k]) delete G.sold[k]; }
}

/* ---------- things picked in the wild vanish, and come back when they please ---------- */
const REGROW_CHANCE = 0.3;
const pickKey = (p) => (p.p === "herbpatch" ? "herb_" : p.p + "_") + p.id;
function propGone(G, p) {
  if (G && p && p.goneFlag) return !!(G.flags && G.flags[p.goneFlag]);
  if (!G || !p || !p.id) return false;
  if (p.p === "herbpatch") return !!(G.picked && G.picked["herb_" + p.id]);
  if (p.p === "bloom") return !!(G.flags && G.flags["bloom_" + p.id]);
  return false;
}
function chestOpen(G, p) { return !!(G && p && p.p === "chest" && p.id && G.flags && G.flags["chest_" + p.id]); }
function pickMark(G, key) { act2Ensure(G); G.picked[key] = G.regrew[key] ? 2 : 1; delete G.regrew[key]; }
/* one roll per rest or new day. A patch that has only just grown back and been cut again sits the next roll out. */
function regrowRoll(G, rng = Math.random) {
  act2Ensure(G); let n = 0;
  for (const k of Object.keys(G.picked)) {
    if (G.picked[k] === 2) { G.picked[k] = 1; continue; }
    if (rng() < REGROW_CHANCE) { delete G.picked[k]; G.regrew[k] = 1; n++; }
  }
  return n;
}

/* ---------- Pillars: where the world lets you rest ---------- */
/* at: the tile the traveller arrives on. Oakhaven's has always been awake; the others wake at a touch. */
const PILLARS = {
  oak: { map: "oak", name: "Oakhaven", at: [24, 20, "down"] },
};
const pillarOf = (mapId) => Object.keys(PILLARS).find((k) => PILLARS[k].map === mapId) || null;
const pillarsAwake = (G) => Object.keys(PILLARS).filter((k) => act2Ensure(G).pillars[k]);
/* Beasts beaten in the wider world stay beaten until you rest at a Pillar. Named ones stay beaten for good. */
const SLAIN_REST = "rest";
function isSlain(G, key) {
  const v = G.slain && G.slain[key];
  return v === G.day || v === SLAIN_REST || !!(G.slainBoss && G.slainBoss[key]);
}
function markSlain(G, key, boss) {
  G.slain = G.slain || {};
  if (G.flags && G.flags.act2) { if (boss) { G.slainBoss = G.slainBoss || {}; G.slainBoss[key] = 1; } else G.slain[key] = SLAIN_REST; }
  else G.slain[key] = G.day;
}
/* Rest at a Pillar: mend, save your place, let the beasts come back and the herbs think about it.
   swap: also wait for the other half of the day. Returns what happened, for the screen to tell. */
function pillarRest(G, pillarId, swap, rng = Math.random) {
  act2Ensure(G); btlRest(G);
  const wasNight = isNightT(G.time);
  if (swap) { G.time = wasNight ? DAY_T : NIGHT_T; if (wasNight) G.day += 1; }
  G.slain = {}; G.rests += 1; G.respawn = pillarId;
  const grew = regrowRoll(G, rng); econRecover(G, "rest");
  return { night: isNightT(G.time), swapped: !!swap, grew };
}
/* What stands at the east gate. The road beyond is built with the Open Plains. */
const PLAINS_BUILT = typeof MAP_DEFS !== "undefined" && !!MAP_DEFS.plainsSW;

/* ---------- crafting at a Pillar: loot into useful things, never into profit ---------- */
/* needs: what goes in. out and n: what comes out. from: where the recipe is learned (a note for the Quests of later phases). */
const RECIPES = {
  poultice: { out: "poultice", n: 1, needs: { yarrow: 1, gel: 1 }, track: "Brewing", from: "Old Maud's way" },
  bandage: { out: "bandage", n: 1, needs: { silk: 1 }, track: "Making", from: "common knowledge" },
  torchoil: { out: "torchoil", n: 1, needs: { gel: 1, candle: 1 }, track: "Brewing", from: "common knowledge" },
  ration: { out: "ration", n: 2, needs: { haunch: 1, bread: 1 }, track: "Making", from: "common knowledge" },
  spoultice: { out: "spoultice", n: 1, needs: { redcap: 1, yarrow: 1, silk: 1 }, track: "Brewing", from: "a herbalist's note" },
  btonic: { out: "btonic", n: 1, needs: { mroot: 1, yarrow: 1, gel: 1 }, track: "Brewing", from: "a herbalist's note" },
  antidote: { out: "antidote", n: 1, needs: { sap: 1, yarrow: 1 }, track: "Brewing", from: "a scholar's note" },
  fangcharm: { out: "fangcharm", n: 1, needs: { fang: 3, silk: 1 }, track: "Making", from: "the hunters' camp" },
  firepot: { out: "firepot", n: 1, needs: { firewax: 1, torchoil: 1 }, track: "Making", from: "a Purifier's leaflet" },
  gpoultice: { out: "gpoultice", n: 1, needs: { spoultice: 1, sap: 1, emberdust: 1 }, track: "Brewing", from: "the Fort apothecary" },
  gtonic: { out: "gtonic", n: 1, needs: { btonic: 1, frostsilk: 1 }, track: "Brewing", from: "the Fort apothecary" },
};
const RECIPE_START = ["poultice", "bandage", "torchoil", "ration"];
function canCraft(G, id) { const r = RECIPES[id]; return !!r && Object.keys(r.needs).every((k) => (G.items[k] || 0) >= r.needs[k]) && (G.items[r.out] || 0) + r.n <= STACK_CAP; }
function craftOne(G, id) {
  if (!canCraft(G, id)) return false; const r = RECIPES[id];
  for (const k in r.needs) { G.items[k] -= r.needs[k]; if (!G.items[k]) delete G.items[k]; }
  giveItem(G, r.out, r.n); return true;
}
function learnRecipe(G, id) { act2Ensure(G); if (!RECIPES[id] || G.recipes.includes(id)) return false; G.recipes.push(id); return true; }

/* ---------- Thread Study: a word studied until it sits right ---------- */
const MASTERY_MAX = 3;
/* Not under the Covenant's eye. A Pillar marked covenant refuses, and so will any place a Covenant caster is standing. */
function studyAllowed(G, pillarId) { const p = PILLARS[pillarId]; return !(p && p.covenant); }
const studyRank = (G, root) => (act2Ensure(G).mastery[root] || 0);
const studiedNow = (G, root) => act2Ensure(G).studied[root] === G.rests + 1;
/* A clean study earns a mark, once per rest per word. Anything else costs nothing but the try. */
function studyResult(G, root, clean) {
  act2Ensure(G); const had = G.mastery[root] || 0;
  if (!clean || had >= MASTERY_MAX || studiedNow(G, root)) return false;
  G.mastery[root] = had + 1; G.studied[root] = G.rests + 1; return true;
}
/* The rune of a root: the same knot of points every time, more of them as the word is known better. */
function runeFor(root, n) {
  let seed = 0; for (let i = 0; i < root.length; i++) seed = (seed * 31 + root.charCodeAt(i)) | 0;
  const rnd = mulberry32(seed ^ 0x9e37), cells = [];
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) cells.push([x, y]);
  for (let i = cells.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [cells[i], cells[j]] = [cells[j], cells[i]]; }
  return cells.slice(0, n).map(([x, y]) => ({ x: 40 + x * 73 + (rnd() - 0.5) * 26, y: 40 + y * 73 + (rnd() - 0.5) * 26 }));
}
/* The binding question: one ending's meaning, and three endings to choose from. */
function studyQuiz(root, words, rng = Math.random) {
  const all = Object.keys(OT_SUFFIXES).filter((k) => !OT_SUFFIXES[k].unwritten), known = (words && words.s || []).filter((k) => all.includes(k));
  const E = OT_EFFECT[root], fit = known.filter((k) => !E || E.acc.split(" ").includes(k));
  const pool = fit.length ? fit : known.length ? known : all, ans = pool[Math.floor(rng() * pool.length)];
  const others = all.filter((k) => k !== ans).sort(() => rng() - 0.5).slice(0, 2);
  return { ans, clue: OT_SUFFIXES[ans].tag, form: OT_SUFFIXES[ans].form, options: [ans, ...others].sort(() => rng() - 0.5) };
}
