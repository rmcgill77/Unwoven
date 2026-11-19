/* ------------------------------------------------------------------ */
/* Greywick: the Unbound's town. Its rooms, its standoffish people,    */
/* the Lamp House, the Keystone request, and four small favours that   */
/* earn the town's trust. The map is in 04m_greywick.js.               */
/* ------------------------------------------------------------------ */

/* the Pillar: neglected, not sabotaged. It flickers until a Keystone is set in it. Not a Covenant stone, so study is safe */
PILLARS.gw = { map: "gw", name: "Greywick", at: [27, 32, "up"] };
MAP_DEFS.gw.stutter = "gw_keystone";
delete MAP_DEFS.plainsNW.looks.gate;

/* ---------- rooms ---------- */
const GW_DOORS = {
  gw_lamp: { door: [13, 10], name: "The Lamp House", w: 14, h: 10 },
  gw_inn: { door: [39, 23], name: "The Greywick Inn", w: 14, h: 10 },
  gw_forge: { door: [21, 40], name: "Flint's Forge", w: 12, h: 9, floor: "s" },
};
const GW_PROPS = {
  gw_lamp: [{ p: "lantern", x: 2, y: 0 }, { p: "lantern", x: 6, y: 0 }, { p: "lantern", x: 11, y: 0 }, { p: "books", x: 1, y: 2 }, { p: "shelf", x: 2, y: 2, v: 1 }, { p: "shelf", x: 3, y: 2, v: 0 },
    { p: "desk", x: 6, y: 3, lk: "press" }, { p: "chair", x: 7, y: 2 }, { p: "candles", x: 10, y: 2 }, { p: "table", x: 9, y: 5, v: 1 }, { p: "bench", x: 2, y: 6 }, { p: "bench", x: 2, y: 4 },
    { p: "crate", x: 12, y: 7, lk: "leaflets" }, { p: "sack", x: 12, y: 2 }, { p: "plant", x: 1, y: 8 }],
  gw_inn: [{ p: "fireplace", x: 6, y: 0 }, { p: "lantern", x: 2, y: 0 }, { p: "lantern", x: 11, y: 0 }, { p: "barrel", x: 1, y: 2 }, { p: "barrel", x: 2, y: 2 }, { p: "shelf", x: 4, y: 2, v: 2 },
    { p: "table", x: 5, y: 6, v: 1 }, { p: "chair", x: 4, y: 6 }, { p: "chair", x: 7, y: 6 }, { p: "table", x: 10, y: 6, v: 2 }, { p: "chair", x: 9, y: 6 }, { p: "chair", x: 12, y: 6 },
    { p: "bed", x: 12, y: 2, v: 1 }, { p: "straw", x: 9, y: 3 }, { p: "jugs", x: 3, y: 3 }],
  gw_forge: [{ p: "forge", x: 1, y: 2 }, { p: "anvil", x: 3, y: 4 }, { p: "tools", x: 5, y: 0 }, { p: "barrel", x: 1, y: 5 }, { p: "crate", x: 9, y: 2 }, { p: "rack", x: 7, y: 2 }, { p: "crate", x: 10, y: 6, lk: "scrapheap" }, { p: "lantern", x: 9, y: 0 }],
};
const GW_ROWS = { gw_inn: { 4: "XKKKKK" + "o".repeat(7) + "X" } };
for (const id in GW_DOORS) {
  const r = GW_DOORS[id], mat = Math.floor(r.w / 2) - (r.w % 2 ? 0 : 1);
  MAP_DEFS[id] = { name: r.name, outside: false, act2: true, rows: ashRoom(r.w, r.h, mat, r.floor || "o", GW_ROWS[id] || {}), props: GW_PROPS[id] || [],
    warps: [{ x: mat, y: r.h - 1, to: "gw", tx: r.door[0], ty: r.door[1] + 1, dir: "down" }] };
  MAP_DEFS.gw.warps.push({ x: r.door[0], y: r.door[1], to: id, tx: mat, ty: r.h - 2, dir: "up" });
}
/* the boarded chapel: no door that opens; a loose board round the back */
MAP_DEFS.gw_chapel = { name: "The Boarded Chapel", outside: false, act2: true, dark: true,
  rows: ["XUUYUUUUYUUX", "XLLLLLLLLLLX", "XooooooooooX", "XoooouuooooX", "XoooouuooooX", "XoooouuooooX", "XoooouuooooX", "XXXXXXXXXXmX"],
  props: [{ p: "desk", x: 5, y: 2, lk: "altar_gw" }, { p: "bench", x: 2, y: 4, lk: "pew" }, { p: "bench", x: 8, y: 4, lk: "pew" }, { p: "bench", x: 2, y: 6, lk: "pew" }, { p: "candles", x: 4, y: 2 },
    { p: "chest", x: 9, y: 2, id: "c_gw_ledgers" }, { p: "straw", x: 7, y: 6 }, { p: "books", x: 1, y: 5 }, { p: "painting", x: 4, y: 0, v: 1 }],
  warps: [{ x: 10, y: 7, to: "gw", tx: 3, ty: 26, dir: "down" }] };

MAP_DEFS.gw.looks = {
  door: ["Shuttered. Through a crack: a cold hearth and somebody very still, listening.", "Barred from inside. A child's voice asks who it is, and an older one hushes it.", "Nailed shut. Someone left, and did not mean to come back."],
  gate: ["The gate hangs off one hinge. Nobody has tried to mend it."],
  hides: ["Hides stretched on frames, scraped thin. Boar, mostly. The hunters here take what the plains give."],
};
Object.assign(LOOK_TEXT, {
  press: ["A little hand press, inked black, and a tray of type. Half a page is set: 'The Pillars were never theirs.'"],
  leaflets: ["A crate of fresh leaflets, still smelling of ink. 'What was woven can be unpicked.' The same words the Curates tore off Ashford's chapel door."],
  altar_gw: ["The altar cloth has been folded neatly and left on top. Someone still dusts in here."],
  scrapheap: ["A heap of iron scrap waiting for the forge: hinges, horseshoes, half a helmet. Nothing whole."],
});
Object.assign(CHEST_LOOT, { c_gw_ledgers: [12, { gwledgers: 1 }] });
ITEMS.gwledgers = { name: "Covenant ledgers", quest: true, desc: "Two water-stained ledgers from the boarded chapel: tithes taken from Greywick, and a column headed 'Keystones withheld'." };

/* ---------- people ---------- */
Object.assign(NPC_DEFS, {
  gideon: { name: "Gideon Marsh", title: "Lampwright of the Unbound", look: { skin: 2, hair: 5, beard: true, cloth: 6, outfit: "coat", mood: "neutral", age: true },
    schedule: [{ h: 0, map: "gw_lamp", x: 7, y: 5, w: 1, where: "the Lamp House" }] },
  mags: { name: "Mags Tull", title: "Innkeeper", look: { sex: "f", skin: 0, hair: 5, hairStyle: "bun", cloth: 1, apron: "#b8a888", mood: "neutral", age: true },
    schedule: [{ h: 0, map: "gw_inn", x: 3, y: 3, w: 1, where: "the inn" }] },
  ida: { name: "Ida Flint", title: "Smith", look: { sex: "f", skin: 1, hair: 4, hairStyle: "bun", cloth: 3, apron: "#5a4a3a", mood: "neutral" },
    schedule: [{ h: 0, map: "gw_forge", x: 4, y: 5, w: 1, where: "the forge" }] },
  corran: { name: "Corran Vell", title: "Trader", look: { skin: 2, hair: 1, cloth: 5, outfit: "coat", mood: "sly" },
    schedule: [{ h: 0, map: null }, { h: 7, map: "gw", x: 25, y: 45, w: 1, where: "the stall south of the Pillar" }, { h: 19, map: null }] },
  brack: { name: "Jory Brack", title: "Hunter", look: { skin: 2, hair: 0, beard: true, cloth: 3, outfit: "coat", mood: "neutral", strap: true },
    schedule: [{ h: 0, map: null }, { h: 6, map: "gw", x: 44, y: 46, w: 1, where: "the hunters' huts" }, { h: 20, map: null }] },
  sarn: { name: "Widow Sarn", title: "", look: { sex: "f", skin: 0, hair: 5, hood: true, cloth: 0, outfit: "dress", mood: "neutral", age: true },
    schedule: [{ h: 0, map: null }, { h: 8, map: "gw", x: 11, y: 51, w: 1, where: "the lane by the homes" }, { h: 18, map: null }] },
  tam: { name: "Tam", title: "Watchtower lookout", look: { skin: 1, hair: 3, cloth: 2, outfit: "coat", mood: "neutral" },
    schedule: [{ h: 0, map: "gw", x: 46, y: 9, w: 0, where: "the fallen watchtower" }, { h: 5, map: null }, { h: 19, map: "gw", x: 46, y: 9, w: 0, where: "the fallen watchtower" }] },
  gwfolk: { name: "A Greywick man", title: "", look: { skin: 1, hair: 2, cloth: 1, outfit: "tunic", mood: "neutral" },
    schedule: [{ h: 0, map: null }, { h: 9, map: "gw", x: 30, y: 36, w: 4, where: "near the Pillar" }, { h: 17, map: null }] },
});
const GW_NPCS = ["gideon", "mags", "ida", "corran", "brack", "sarn", "tam", "gwfolk"];
for (const k of GW_NPCS) { NPC_DEFS[k].id = k; NPC_DEFS[k].act2 = true; }

/* ---------- shops ---------- */
Object.assign(SHOPS, {
  greywick_trader: { ...SHOPS.greywick_trader, keeper: "Corran" },
  greywick_forge: { ...SHOPS.greywick_forge, keeper: "Ida" },
  gw_hunters: { name: "The hunters' huts", keeper: "Jory", stock: ["arrows", "ration"], bonus: ["hide", "food"], only: ["hide", "food"], mult: 1.15, buy: 1, purse: 90 },
  gideon: { name: "The Lamp House", keeper: "Gideon", stock: [], bonus: ["salvage", "arms"], only: ["salvage", "arms", "dark"], mult: 1, buy: 0.9, purse: 100 },
});
const GW_INN = 40;

/* ---------- trust: earned, never shown. Two favours and the town warms a little; prices ease ---------- */
const GW_FAVOURS = ["q_iron", "q_ledgers", "q_watch", "q_hides"];
/* called as a favour is being finished (k): counts the others already done, plus this one */
function gwTrustCheck(c, k) {
  if (c.flag("gw_trust") || GW_FAVOURS.filter((q) => q !== k && (c.G.flags[q] | 0) >= 3).length + 1 < 2) return [];
  return [{ do: (c) => { c.set("gw_trust"); SHOPS.greywick_trader.mult = 1.05; SHOPS.greywick_trader.buy = 0.9; SHOPS.greywick_forge.mult = 1.05; } },
    { who: "narrator", t: "Word gets round a small town. People in Greywick nod to you now, and one or two even say good morning." }];
}

/* ---------- talk ---------- */
const gv = (who, t) => ({ who, t });
Object.assign(SCRIPTS, {
  gideon: (c) => {
    const s = qs(c.G, "q_keystone");
    if (!s) return [
      gv("gideon", "Shut the door. Thank you. Lamp's lit, so you're welcome, but you're also strangers, and strangers in Greywick are usually Covenant with their badges in their pockets."),
      gv("gideon", "Gideon Marsh. Lampwright, they call me. It means I keep the lamp lit and teach whoever asks to read the words the Covenant keeps to itself."),
      gv("tessa", "You teach the Old Tongue? Openly?"),
      gv("gideon", "As openly as a shuttered town can. That's the Unbound. No masters, no secrets. Just a lamp in a window."),
      gv("gideon", "You've seen our Pillar. It gutters every night, and every night it's a little worse. Pillars need Keystones to stay whole. The Covenant hands them out to the towns that bend the knee. We stopped bending, so they stopped sending."),
      gv("gideon", "There's a storehouse full of Keystones in Fort Frostcrown. If you're going north, and you look like you are, bring one back. One. They'll never miss it."),
      { choice: [["\"We'll try.\"", [gv("gideon", "That's all anyone can do. Thank you."), { do: (c) => c.set("q_keystone", 1) }]],
        ["\"You're asking us to steal from the Covenant.\"", [gv("gideon", "I'm asking you to return something to the people it was made for. But I won't argue. Think on it."), { do: (c) => c.set("q_keystone", 1) }]]] },
      gv("narrator", "Gideon's request will have to wait for the Fort."),
    ];
    return [gv("gideon", c.flag("gw_trust") ? c.rot("gideon_t", ["The town's warmed to you. That's rarer than a Keystone.", "Come to the chapel one night. We read aloud there. Nobody's arrested anyone yet.", "The Covenant says the words are dangerous. So are knives. We still let children cut their bread."]) :
      c.rot("gideon", ["The Keystone. When you're north. I won't keep asking.", "The lamp's lit. That's all the sign we need.", "If you've salvage, I'll take it. The press eats iron like a hungry dog."])),
      { choice: [["Trade", [{ shop: "gideon" }]], ["Goodbye.", []]] }];
  },
  mags: (c) => {
    const room = { choice: [
      [`Take a room (${GW_INN} coppers)`, [{ do: (c) => { if (c.G.coins >= GW_INN) c.coins(-GW_INN); } }, (c.G.coins >= GW_INN
        ? { choice: [[isNightT(c.G.time) ? "Sleep until morning" : "Sleep until nightfall", [{ do: (c) => c.innRest(true) }]], ["Just rest a while", [{ do: (c) => c.innRest(false) }]]] }
        : gv("mags", "Forty. Not a copper under. Firewood's dear this far north."))]],
      ["Not now.", []]] };
    return [gv("mags", c.flag("met_mags") ? c.rot("mags", ["Forty a night. The sheets are clean. Mostly.", "No Covenant under my roof. Never have, never will.", "Soup's thin. It's soup."]) : "Forty a night. No questions, and I'll thank you not to ask any either."), { do: (c) => c.set("met_mags") }, room];
  },
  ida: (c) => {
    const s = qs(c.G, "q_iron"), steps = [];
    if (!s) steps.push(gv("ida", "Forge only half works. The bellows split, and there's no iron to mend it with. Nobody brings scrap up the Greywick road any more."),
      gv("ida", "Bring me three pieces of good iron scrap. Old Covenant plate is best; they built things to last, give them that."),
      { choice: [["I'll find some.", [{ do: (c) => c.set("q_iron", 1) }]], ["Not now.", []]] });
    else if (s === 1 && (c.G.items.scrap || 0) >= 3) steps.push(gv("ida", "That's Weaver-age iron. Where did you... no, don't tell me."), { do: (c) => { c.take("scrap", 3); c.set("q_iron", 3); c.coins(80); c.give("kettlehat", 1); } },
      gv("ida", "There. Eighty coppers, and a hat I beat out of what was left over. It'll keep your head on."), gv("narrator", "80 coppers and a kettle hat."), ...gwTrustCheck(c, "q_iron"));
    else steps.push(gv("ida", s === 1 ? "Three pieces of scrap. I can wait. The forge can't." : c.rot("ida", ["Bellows hold now. Thanks to you.", "If you've ruined gear, I'll buy it for the iron."])));
    return [...steps, { choice: [["Trade", [{ shop: "greywick_forge" }]], ["Goodbye.", []]] }];
  },
  corran: (c) => [gv("corran", c.rot("corran", c.flag("gw_trust") ? ["For you, a better price. Don't tell anyone.", "Everything's dearer up here. Less dear for friends."] : ["Prices are what they are. The Covenant cut the road; the road cut my margins.", "Buying? Selling? Standing there?"])),
    { choice: [["Trade", [{ shop: "greywick_trader" }]], ["Goodbye.", []]] }],
  brack: (c) => {
    const s = qs(c.G, "q_hides"), steps = [];
    if (!s) steps.push(gv("brack", "Hides. We need boar hides, three of them, for the winter roofs. The plains are full of boar and we're short a man to hunt them."),
      { choice: [["I'll bring some.", [{ do: (c) => c.set("q_hides", 1) }]], ["Not now.", []]] });
    else if (s === 1 && (c.G.items.hide || 0) >= 3) steps.push(gv("brack", "Good hides. Badly skinned, but good."), { do: (c) => { c.take("hide", 3); c.set("q_hides", 3); c.coins(50); c.give("haunch", 2); } },
      gv("brack", "Fifty, and some meat for the road. Fair?"), gv("narrator", "50 coppers and 2 haunches of meat."), ...gwTrustCheck(c, "q_hides"));
    else steps.push(gv("brack", s === 1 ? "Three boar hides. The boars won't skin themselves." : c.rot("brack", ["Roofs are holding.", "Hides, tusks, meat. We'll buy them fair."])));
    return [...steps, { choice: [["Trade", [{ shop: "gw_hunters" }]], ["Goodbye.", []]] }];
  },
  sarn: (c) => {
    const s = qs(c.G, "q_ledgers");
    if (!s) return [gv("sarn", "The chapel. The Curates boarded it when we stopped paying, but the ledgers are still inside. Every tithe they ever took from this town."),
      gv("sarn", "My husband kept those books for them, before. I'd like to know what he wrote. There's a loose board at the back, if you're small and quiet."),
      { choice: [["I'll fetch them.", [{ do: (c) => c.set("q_ledgers", 1) }]], ["Not now.", []]] }];
    if (s === 1 && c.has("gwledgers")) return [gv("sarn", "Let me see. Tithes, tithes... 'Keystones withheld, by order of the High Curate.' Withheld. Not lost. Withheld."),
      { do: (c) => { c.take("gwledgers", 1); c.set("q_ledgers", 3); c.coins(70); } }, gv("sarn", "Gideon should see this. Here. For your trouble."), gv("narrator", "70 coppers."), ...gwTrustCheck(c, "q_ledgers")];
    return [gv("sarn", s === 1 ? "The loose board's round the back of the chapel, on the west side." : c.rot("sarn", ["Withheld. I keep saying it to myself.", "He wrote a neat hand, my husband. For all the good it did."]))];
  },
  tam: (c) => {
    const s = qs(c.G, "q_watch");
    if (!s) return [gv("tam", "I watch the Fort road. Somebody has to. If Covenant riders come for us, I want an hour's warning, not a minute's."),
      gv("tam", "Go up to the boundary stone on the Frost Road, after dark, and count their patrols. Come back and tell me how many."),
      { choice: [["I'll go.", [{ do: (c) => c.set("q_watch", 1) }]], ["Not tonight.", []]] }];
    if (s === 2) return [gv("tam", "Three riders and a cart? On the Fort road, at night? They're moving something."), { do: (c) => { c.set("q_watch", 3); c.coins(60); } }, gv("narrator", "60 coppers."), ...gwTrustCheck(c, "q_watch")];
    return [gv("tam", s === 1 ? "The boundary stone. After dark. Count them." : c.rot("tam", ["Quiet tonight.", "The tower fell in my grandfather's time. The view didn't."]))];
  },
  gwfolk: (c) => [gv("gwfolk", c.flag("gw_trust") ? c.rot("gwfolk_t", ["Morning. You're the ones helping out.", "Mind the ice by the well."]) : c.rot("gwfolk", ["...", "We don't get many travellers. We don't want many either.", "Keep walking."]))],
  look_chapelback: (c) => qs(c.G, "q_ledgers") >= 1
    ? [gv("narrator", "Round the back of the chapel one board sits proud of the rest. It swings aside on a single nail."), { choice: [["Squeeze through", [{ do: (c) => c.goto("gw_chapel", 10, 6, "up") }]], ["Not now", []]] }]
    : [gv("narrator", "Broken masonry and a boarded wall. One plank sits a little loose.")],
});
QUEST_HOOKS.marchguard = (c) => qs(c.G, "q_watch") === 1 && isNightT(c.G.time)
  ? [gv("narrator", "From the shadow of the boundary stone you watch the road. Three riders pass, then a covered cart with an escort, heading north to the Fort. Nobody speaks."), { do: (c) => c.set("q_watch", 2) }]
  : null;

/* ---------- the task list in Greywick ---------- */
ASH_QUESTS.push(
  ["q_keystone", "A Keystone for Greywick", ["", "Bring a Pillar Keystone from Fort Frostcrown"], ["", "The Fort's storehouse, north past the Outskirts"]],
  ["q_iron", "The Iron Request", ["", "Bring Ida Flint three pieces of iron scrap"], ["", "The Worn Covenant Construct in the West Forest is made of the stuff"]],
  ["q_ledgers", "Boarded Chapel Ledgers", ["", "Fetch the ledgers from Greywick's boarded chapel"], ["", "A loose board at the back of the chapel, on the west side"]],
  ["q_watch", "Watch the Road", ["", "Count the Covenant patrols at the boundary stone, after dark", "Tell Tam what you saw"], ["", "The Frost Road, north-east of Greywick", "The fallen watchtower in Greywick, after dark"]],
  ["q_hides", "Hide Supply", ["", "Bring the Greywick hunters three boar hides"], ["", "Boar roam the plains by day"]],
);
QUEST_ENTER_HOOKS.push((G, id) => {
  if (id === "gw") SHOPS.greywick_trader.mult = G.flags.gw_trust ? 1.05 : 1.15;
  if (id === "gw" && !G.flags.reached_gw) {
    G.flags.reached_gw = true;
    return [{ who: "narrator", t: "Greywick. Snow in the gutters, shutters closed on most of the houses, and a Pillar in the square that gutters like a cheap candle." },
      { who: "narrator", t: "On a few doors, half hidden, rags of yellow cloth with a red thread stitched on them, snapped in two." },
      { who: "tessa", t: "Nobody's waving. I suppose that's fair. Look: a yellow lamp, up in the north-west. That's somebody who wants to be found." }];
  }
  return null;
});
