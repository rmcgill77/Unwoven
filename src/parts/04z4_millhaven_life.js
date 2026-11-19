/* ------------------------------------------------------------------ */
/* Millhaven (Act 3): the mill-and-market village at the crossroads.   */
/* Its rooms, its people, the tinker's daughter who can weave, and the */
/* parley with the Unbound in the back room, played as a scene. The    */
/* map is in 04z3_millhaven.js.                                        */
/* ------------------------------------------------------------------ */

/* ---------- rooms ---------- */
const MH_DOORS = {
  mh_inn: { door: [9, 13], name: "The Wheel and Sheaf", w: 16, h: 10 },
  mh_tithe: { door: [19, 12], name: "The Tithe-House", w: 12, h: 9, floor: "s" },
  mh_trade: { door: [36, 12], name: "The Traders' Hall", w: 16, h: 10 },
  mh_bakery: { door: [9, 28], name: "Rudd's Bakery", w: 12, h: 9 },
  mh_mill: { door: [41, 39], name: "The Great Mill", w: 12, h: 9 },
  mh_tinker: { door: [9, 44], name: "Wick's", w: 12, h: 9, floor: "s" },
};
const MH_PROPS = {
  mh_inn: [{ p: "fireplace", x: 7, y: 0 }, { p: "lantern", x: 2, y: 0 }, { p: "lantern", x: 13, y: 0 }, { p: "barrel", x: 1, y: 2 }, { p: "barrel", x: 2, y: 2 }, { p: "shelf", x: 4, y: 2, v: 2 },
    { p: "table", x: 5, y: 6, v: 1 }, { p: "chair", x: 4, y: 6 }, { p: "chair", x: 7, y: 6 }, { p: "table", x: 10, y: 6, v: 2 }, { p: "chair", x: 9, y: 6 }, { p: "chair", x: 12, y: 6 }, { p: "bed", x: 14, y: 2, v: 1 }, { p: "jugs", x: 3, y: 3 }],
  mh_tithe: [{ p: "desk", x: 5, y: 2, lk: "tithebook" }, { p: "chair", x: 6, y: 3 }, { p: "shelf", x: 1, y: 2, v: 1 }, { p: "sack", x: 9, y: 2, lk: "flour" }, { p: "sack", x: 10, y: 2, lk: "flour" }, { p: "painting", x: 5, y: 0, v: 1 }, { p: "lantern", x: 2, y: 0 }],
  mh_trade: [{ p: "shelf", x: 1, y: 2, v: 2 }, { p: "shelf", x: 2, y: 2, v: 1 }, { p: "crate", x: 5, y: 2 }, { p: "crate", x: 6, y: 2 }, { p: "sack", x: 12, y: 2 }, { p: "barrel", x: 14, y: 2 }, { p: "rack", x: 9, y: 2 },
    { p: "table", x: 6, y: 6, v: 0 }, { p: "baskets", x: 11, y: 6 }, { p: "lantern", x: 4, y: 0 }, { p: "lantern", x: 11, y: 0 }],
  mh_bakery: [{ p: "fireplace", x: 1, y: 0 }, { p: "table", x: 5, y: 3, v: 0, lk: "bread" }, { p: "baskets", x: 8, y: 2, lk: "bread" }, { p: "sack", x: 10, y: 2, lk: "flour" }, { p: "barrel", x: 10, y: 6 }],
  mh_mill: [{ p: "block", x: 4, y: 3, lk: "millstone" }, { p: "sack", x: 1, y: 2, lk: "flour" }, { p: "sack", x: 2, y: 2, lk: "flour" }, { p: "sack", x: 1, y: 3, lk: "flour" }, { p: "baskets", x: 8, y: 2 }, { p: "barrel", x: 10, y: 6 }, { p: "lantern", x: 6, y: 0 }],
  mh_tinker: [{ p: "tools", x: 1, y: 0 }, { p: "tools", x: 4, y: 0 }, { p: "anvil", x: 3, y: 3 }, { p: "table", x: 6, y: 3, v: 0, lk: "tinkerbench" }, { p: "crate", x: 10, y: 2, lk: "tinkerjunk" }, { p: "barrel", x: 10, y: 6 },
    { p: "cloths", x: 8, y: 0, lk: "backcurtain" }, { p: "lantern", x: 6, y: 0 }],
};
for (const id in MH_DOORS) {
  const r = MH_DOORS[id], mat = Math.floor(r.w / 2) - (r.w % 2 ? 0 : 1);
  MAP_DEFS[id] = { name: r.name, outside: false, act2: true, act3: true, rows: ashRoom(r.w, r.h, mat, r.floor || "o"), props: MH_PROPS[id] || [],
    warps: [{ x: mat, y: r.h - 1, to: "mh", tx: r.door[0], ty: r.door[1] + 1, dir: "down" }] };
  MAP_DEFS.mh.warps.push({ x: r.door[0], y: r.door[1], to: id, tx: mat, ty: r.h - 2, dir: "up" });
}
/* the back room behind the tinker's curtain: shutters closed, one lamp. Reached only when Fen leads you in. */
MAP_DEFS.mh_back = { name: "The Back Room", outside: false, act2: true, act3: true, dark: true, rows: ashRoom(10, 8, 4, "o"),
  props: [{ p: "table", x: 3, y: 3, v: 0, lk: "backtable" }, { p: "candles", x: 4, y: 2 }, { p: "chair", x: 2, y: 3 }, { p: "chair", x: 6, y: 3 }, { p: "crate", x: 8, y: 2 }, { p: "straw", x: 1, y: 5 }],
  warps: [{ x: 4, y: 7, to: "mh_tinker", tx: 8, ty: 3, dir: "down" }] };
MAP_DEFS.mh.looks = Object.assign({}, ETH_LOOKS, {
  door: ["Locked. Flour dust on the sill.", "Nobody home. A cat watches you from the window and does not approve.", "Shut. Somebody inside is arguing about the price of barley."],
  gate: ["The south gate, barred. Chalked on it: AURELM ROAD ROUND THE WEST LANE. Under that, smaller: AND GOOD LUCK."],
  gate_mh_in: ["The north gate, open, with a toll-box beside it that nobody seems to be minding."],
  wall_mh_in: ["A low wall of river stone. It keeps the sheep in more than it keeps anything out."],
});
Object.assign(LOOK_TEXT, {
  rumours: ["The rumour board. 'Rotmoor: NO WAGONS.' 'Lost on the Aurelm road: one cart, two mules, one husband.' 'The trees east of the Mere are going grey. Do not cut them for firewood.'",
    "Someone has pinned a drawing of a leaf, black-veined, with WHAT IS THIS written under it. Underneath, a dozen different hands have written I DON'T KNOW."],
  caravan: ["A covered wagon from Verrin, its canvas stamped with the tithe mark. The driver is asleep on the box."],
  bread: ["Rye loaves, still warm. The smell follows you out of the door."],
  tinkerjunk: ["Pots, pans, a cracked lamp, three left boots and a Covenant helmet with the badge prised off. Everything mended or waiting to be."],
  tinkerbench: ["A workbench of lamp parts and clock springs. A lamp chimney has been set aside, very clean, as if for something special."],
  backcurtain: ["A heavy curtain over a doorway at the back. A draught moves it now and then. Somebody's back there."],
  backtable: ["A plain table with a lamp on it and nothing else. Whoever uses this room doesn't leave things lying about."],
  tithebook: ["The tithe book: Millhaven's flour, sack by sack, all of it going north to Verrin. A column for Rotmoor stops halfway down the page."],
});
ITEMS.unbthread = { name: "Knotted red thread", quest: true, desc: "A length of red thread, knotted three times. Ysra said: show it at their fires on the road, and you'll get a warning instead of an arrow." };

/* ---------- people ---------- */
const MH_PARLEY = (f) => !!f.mh_parley_on && !f.mh_parley;
Object.assign(NPC_DEFS, {
  fen: { name: "Fen Wick", title: "The tinker's daughter", look: { sex: "f", skin: 1, hair: 3, hairStyle: "bun", cloth: 1, outfit: "dress", mood: "neutral" },
    schedule: [{ h: 0, map: "mh_tinker", x: 5, y: 5, w: 1, where: "her father's shop" }, { h: 8, map: "mh", x: 11, y: 47, w: 2, where: "outside the tinker's shed" }, { h: 19, map: "mh_tinker", x: 5, y: 5, w: 1, where: "her father's shop" }],
    flagSched: [{ when: MH_PARLEY, e: { h: 0, map: "mh_back", x: 2, y: 5, w: 0, where: "the back room" } }] },
  ysra: { name: "Ysra Vell", title: "Of the Unbound", look: { sex: "f", skin: 2, hair: 0, hood: true, cloth: 9, outfit: "coat", mood: "neutral" },
    schedule: [{ h: 0, map: null }], flagSched: [{ when: MH_PARLEY, e: { h: 0, map: "mh_back", x: 5, y: 2, w: 0, where: "the back room" } }] },
  tobin: { name: "Tobin", title: "The lookout", look: { skin: 3, hair: 1, cloth: 3, outfit: "coat", mood: "sly" },
    schedule: [{ h: 0, map: null }], flagSched: [{ when: MH_PARLEY, e: { h: 0, map: "mh_back", x: 8, y: 4, w: 0, where: "the back room" } }] },
  abner: { name: "Abner Wick", title: "Tinker", look: { skin: 1, hair: 5, beard: true, cloth: 3, apron: "#5a4a3a", mood: "neutral", age: true },
    schedule: [{ h: 0, map: "mh_tinker", x: 3, y: 5, w: 1, where: "his shop" }] },
  gwen: { name: "Gwen Tolly", title: "Keeper of the Wheel and Sheaf", look: { sex: "f", skin: 0, hair: 2, hairStyle: "bun", cloth: 5, apron: "#c8b898", mood: "smile" },
    schedule: [{ h: 0, map: "mh_inn", x: 3, y: 4, w: 1, where: "the Wheel and Sheaf" }] },
  pryce: { name: "Clerk Aldo Pryce", title: "Tithe-clerk of the Covenant", look: { skin: 0, hair: 2, cloth: 4, outfit: "coat", mood: "neutral", glasses: true },
    schedule: [{ h: 0, map: "mh_tithe", x: 6, y: 4, w: 1, where: "the tithe-house" }] },
  dagny: { name: "Dagny Ferrow", title: "Caravan master", look: { sex: "f", skin: 2, hair: 1, cloth: 5, outfit: "coat", mood: "sly" },
    schedule: [{ h: 0, map: "mh_trade", x: 7, y: 4, w: 1, where: "the traders' hall" }] },
  marta: { name: "Marta Rudd", title: "Baker", look: { sex: "f", skin: 1, hair: 4, hairStyle: "bun", cloth: 0, apron: "#e0d8c8", mood: "smile" },
    schedule: [{ h: 0, map: "mh_bakery", x: 5, y: 5, w: 1, where: "the bakery" }] },
  oswin: { name: "Oswin Rudd", title: "Miller", look: { skin: 1, hair: 3, beard: true, cloth: 0, apron: "#d8d0c0", mood: "neutral" },
    schedule: [{ h: 0, map: "mh_mill", x: 6, y: 5, w: 1, where: "the mill" }] },
  mhguard: { name: "Covenant soldier", title: "The granary", look: { skin: 2, hair: 1, helm: true, cloth: 4, outfit: "coat", mood: "neutral" },
    schedule: [{ h: 0, map: "mh", x: 32, y: 48, w: 0, where: "the granary" }] },
  lem: { name: "Lem", title: "Wagon driver", look: { skin: 2, hair: 2, cloth: 3, outfit: "tunic", mood: "neutral" },
    schedule: [{ h: 0, map: null }, { h: 7, map: "mh", x: 35, y: 20, w: 2, where: "the caravan yard" }, { h: 19, map: null }] },
  rotwoman: { name: "A woman from Rotmoor", title: "", look: { sex: "f", skin: 0, hair: 4, hood: true, cloth: 0, outfit: "dress", mood: "neutral" },
    schedule: [{ h: 0, map: null }, { h: 8, map: "mh", x: 20, y: 27, w: 1, where: "by the rumour board" }, { h: 18, map: null }] },
  mhfolk: { name: "A market-goer", title: "", look: { skin: 1, hair: 0, cloth: 2, outfit: "tunic", mood: "smile" },
    schedule: [{ h: 0, map: null }, { h: 8, map: "mh", x: 30, y: 31, w: 4, where: "the market" }, { h: 18, map: null }] },
});
const MH_NPCS = ["fen", "ysra", "tobin", "abner", "gwen", "pryce", "dagny", "marta", "oswin", "mhguard", "lem", "rotwoman", "mhfolk"];
for (const k of MH_NPCS) { NPC_DEFS[k].id = k; NPC_DEFS[k].act2 = true; }

/* ---------- shops ---------- */
Object.assign(SHOPS, {
  mh_trade: { name: "The Traders' Hall", keeper: "Dagny", stock: ["bandage", "poultice", "spoultice", "btonic", "antidote", "bread", "ration", "rope", "torchoil", "brigandine", "sallet", "leyblade"], bonus: ["hide", "silk", "salvage", "food"], mult: 1, buy: 1, purse: 320 },
  mh_bakery: { name: "Rudd's Bakery", keeper: "Marta", stock: ["bread", "ration"], bonus: ["food"], only: ["food"], mult: 0.9, buy: 1, purse: 60 },
  mh_tinker: { name: "Wick's", keeper: "Abner", stock: ["rope", "torchoil", "candle"], bonus: ["salvage"], only: ["salvage", "arms"], mult: 1, buy: 1.05, purse: 160 },
});
const MH_INN = 35;

/* ---------- talk ---------- */
const mv = (who, t) => ({ who, t });
const mhWith = (c, id, t) => (inParty(c.G, id) ? [mv(id, t)] : []);
const mhComp = (c, t) => (typeof compKey === "function" && inParty(c.G, compKey(c.G)) ? [mv("unchosen", t)] : []);
Object.assign(SCRIPTS, {
  fen: (c) => {
    const s = qs(c.G, "q_mhparley");
    if (!c.flag("met_fen")) return [
      mv("narrator", "A girl in a flour-dusted dress is crouched over an old lamp by the tinker's door. She whispers something, and the wick catches, all on its own."),
      mv("fen", "Oh. Oh no. You didn't see that. Please say you didn't see that."),
      ...mhWith(c, "tessa", "We saw it. It's all right. We won't tell anyone."),
      mv("fen", "My da says I mustn't. The tithe clerk says it can't happen at all. Not to people like us. Millers and tinkers don't weave, he says. Only the old lines."),
      mv("fen", "But it does happen. It happens to me. I just say the word, and it listens."),
      ...mhComp(c, "That's... not supposed to be possible. Not without the College blood. They told us that every day."),
      mv("fen", "There are people who'd like to meet you. They heard you came from Verrin. Not out here. The back room, behind Da's shop. Come and find me when you're ready."),
      { do: (c) => { c.set("met_fen"); c.set("q_mhparley", 1); } }];
    if (s === 1) return [mv("fen", "Ready? They're careful. They won't wait long."),
      { choice: [["\"Take us to them.\"", [mv("fen", "This way. Mind the curtain."), { do: (c) => { c.set("mh_parley_on"); c.goto("mh_back", 4, 6, "up"); } }]], ["\"Not yet.\"", [mv("fen", "Don't leave it long.")]]] }];
    return [mv("fen", c.rot("fen", ["I lit every lamp in the shed this morning. Da pretended not to notice.", "Ysra says I'm not the only one. I didn't know there were others.", "Will you come back through? I'd like to show you the word for wind."]))];
  },
  abner: (c) => [mv("abner", c.rot("abner", ["Pots, pans, locks, lamps. If it's broken, I've mended worse.", "My girl? She's a good girl. Leave her be.", "Covenant helmets mend just like anyone else's, once you've taken the badge off."])),
    { choice: [["Trade", [{ shop: "mh_tinker" }]], ["Goodbye.", []]] }],
  gwen: (c) => {
    const room = { choice: [
      [`Take a room (${MH_INN} coppers)`, [{ do: (c) => { if (c.G.coins >= MH_INN) c.coins(-MH_INN); } }, (c.G.coins >= MH_INN
        ? { choice: [[isNightT(c.G.time) ? "Sleep until morning" : "Sleep until nightfall", [{ do: (c) => c.innRest(true) }]], ["Just rest a while", [{ do: (c) => c.innRest(false) }]]] }
        : mv("gwen", "Thirty-five. Traders pay it without blinking. You're blinking."))]],
      ["Not now.", []]] };
    return [mv("gwen", c.flag("met_gwen") ? c.rot("gwen", ["Every road in the south ends at my bar sooner or later.", "Heard the trees are going grey past the Mere. Heard it from three different drovers.", "Rotmoor folk can sleep in the barn. Not in the beds. I'm sorry. I've children."])
      : "The Wheel and Sheaf! Thirty-five a night, ale extra, gossip free."), { do: (c) => c.set("met_gwen") }, room];
  },
  pryce: (c) => [mv("pryce", c.rot("pryce", ["Tithes are counted, sealed and sent. That is the whole of my job, and I do it well.", "Weaving? Among millers? Don't be absurd. The gift runs in the old lines.", "Rotmoor's tithe has stopped. I've written to Verrin four times."]))],
  dagny: (c) => [mv("dagny", c.rot("dagny", ["Wagons north, wagons west, wagons south to Aurelm. Nothing east any more.", "Buying or selling? Both's fine. Gawping's free for a minute.", "Purifiers stopped my lead wagon on the Verrin road and burned the canvas. Said it smelled of the curse. It smelled of onions."])),
    { choice: [["Trade", [{ shop: "mh_trade" }]], ["Goodbye.", []]] }],
  marta: (c) => [mv("marta", c.rot("marta", ["Rye, barley, a little white for the clerk. He won't eat rye.", "Oswin grinds, I bake, the village eats. Simple.", "The apples in the orchard are spotting. Black spots, like veins. Don't eat the spotted ones."])),
    { choice: [["Buy bread", [{ shop: "mh_bakery" }]], ["Goodbye.", []]] }],
  oswin: (c) => [mv("oswin", c.rot("oswin", ["Half the south's flour goes through these stones.", "The race ran warm last week. Warm. Off the river. I've never known it.", "Listen. That's the wheel. That's Millhaven's heart."]))],
  mhguard: (c) => [mv("mhguard", c.rot("mhguard", ["Tithe grain. Keep back.", "Verrin's grain, not yours.", "Quiet post. Too quiet, since Rotmoor."]))],
  lem: (c) => [mv("lem", c.rot("lem", ["Aurelm road's open but I wouldn't. Things at night.", "Mules won't go past the Mere any more. They know.", "Verrin tomorrow. Tithe flour. Again."]))],
  rotwoman: (c) => [mv("rotwoman", c.rot("rotwoman", ["I'm not sick. I'm not. They checked my neck at the gate.", "My sister's still in Rotmoor. Behind the line.", "They let me sleep in the barn. That's kind. I know it's kind."]))],
  mhfolk: (c) => [mv("mhfolk", c.rot("mhfolk", ["Market day every day but the Archon's!", "Cheese from Stonebridge, cloth from Verrin, rumours from everywhere.", "You're not from Rotmoor? Good. No offence."]))],
  ysra: (c) => [mv("ysra", "We've said what we came to say. Keep the thread.")],
  tobin: (c) => [mv("tobin", "...")],
});
/* the parley: played as a scene the moment Fen brings you through the curtain */
function mhParley(G) {
  const reg = !!G.flags.ver_registered, comp = typeof compKey === "function" && inParty(G, compKey(G));
  return [
    { who: "narrator", t: "A small room with the shutters closed and one lamp, which Fen lights with a word. Two strangers are already there: a woman in a dark coat at the table, and a man by the far wall who never stops watching the door." },
    { who: "ysra", t: "Sit. Not there. By the door. You'll want to know you can leave." },
    { who: "ysra", t: "Ysra. We've watched you since Stonebridge. The bailiff writes down every name that passes. So do we." },
    reg ? { who: "ysra", t: "You let them write you into the Registry. Show me your wrist. Faded. The ink always fades. The record never does." }
      : { who: "ysra", t: "You didn't let them register you. Interesting. Most people do. Most people think it's a kindness." },
    { who: "ysra", t: "Fen. Show them." },
    { who: "narrator", t: "Fen whispers. The lamp flame lifts off the wick and hangs in the air, a hand's breadth above it, burning on nothing." },
    { who: "ysra", t: "Her mother was a miller's daughter. Her father mends pots. No Weaver line, no College blood, not a drop. And yet." },
    { who: "ysra", t: "The Covenant teaches that the gift runs in blood. That only the old lines can weave, and everyone else must be kept safe from it. Fen is a hole in that story. There are more holes than you'd think." },
    ...(comp ? [{ who: "unchosen", t: "At the College they told us the ones like her were flukes. That they burn out, young." }, { who: "ysra", t: "They told you that. Did you ever see one burn out?" }, { who: "unchosen", t: "...No." }] : []),
    { choice: [
      ["\"The Covenant keeps order. Maybe it has its reasons.\"", [{ who: "ysra", t: "It does. I'd only ask you to find out what they are." }]],
      ["\"Why are you telling us this?\"", [{ who: "ysra", t: "Because you're going to Aurelm, and because you can weave, and because nobody else will tell you." }]],
      ["\"Who are you people?\"", [{ who: "ysra", t: "The Unbound. Not an army. Not a church. People who think words belong to whoever can say them." }]],
    ] },
    { who: "ysra", t: "Something was taken from the Vault at Aurelm. The Covenant wants it back more than it has wanted anything in a hundred years. When you learn what it is, ask yourselves why." },
    ...(G.partyIds && G.partyIds.includes("hakon") ? [{ who: "hakon", t: "You talk like a priest of the other side." }, { who: "ysra", t: "I talk like someone who's been lied to. Priests on every side sound alike to those." }] : []),
    { who: "ysra", t: "Take this. A red thread, knotted. Show it at our fires on the road and you'll get a warning instead of an arrow." },
    { do: (c) => { c.give("unbthread", 1); c.set("mh_parley"); c.set("q_mhparley", 2); } },
    { who: "narrator", t: "Ysra gives you a knotted red thread." },
    { who: "ysra", t: "We won't ask you to join us. Not now. Just keep your eyes open, and keep Fen's secret." },
    { who: "narrator", t: "When you look round, the man by the wall is gone. Ysra pulls up her hood, nods once, and follows him out through a door you hadn't noticed." },
  ];
}

/* ---------- the task list ---------- */
ASH_QUESTS.push(["q_mhparley", "A Word in the Back Room", ["", "Meet the people Fen says want a word, in the tinker's back room"], ["", "Talk to Fen at the tinker's shed when you're ready"]]);
QUEST_ENTER_HOOKS.push((G, id) => {
  if (id === "mh_back" && G.flags.mh_parley_on && !G.flags.mh_parley) return mhParley(G);
  if (id === "mh" && !G.flags.reached_mh) {
    G.flags.reached_mh = true;
    return [{ who: "narrator", t: "Millhaven. Wagons in the yard, stalls on the green, flour dust in the air, and somewhere under it all the steady knock of the great mill's wheel." },
      { who: "narrator", t: "A crowd round a board by the market. Someone is reading the notices out loud. The word Rotmoor comes up more than once." }];
  }
  return null;
});
