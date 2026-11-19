/* ------------------------------------------------------------------ */
/* Stonebridge (Act 3): the quiet Covenant village at the foot of the  */
/* Crags. Its rooms, its people, the writ for Verrin, the smith's      */
/* pelts, and an old miner who remembers the pass. The map is in       */
/* 04x_stonebridge.js.                                                 */
/* ------------------------------------------------------------------ */

/* ---------- rooms ---------- */
const SB_DOORS = {
  sb_hall: { door: [35, 12], name: "The Bailiff's Hall", w: 16, h: 10, floor: "s" },
  sb_smithy: { door: [11, 13], name: "Halloway's Smithy", w: 12, h: 9, floor: "s" },
  sb_store: { door: [21, 12], name: "Penn's Store", w: 12, h: 9 },
  sb_inn: { door: [11, 28], name: "The Shepherd's Rest", w: 16, h: 10 },
  sb_chapel: { door: [43, 28], name: "Stonebridge Chapel", w: 12, h: 10 },
  sb_mill: { door: [9, 46], name: "The Mill", w: 12, h: 9 },
  sb_tower: { door: [50, 17], name: "The Old Lookout", w: 8, h: 8, floor: "s" },
};
const SB_PROPS = {
  sb_hall: [{ p: "desk", x: 7, y: 2, lk: "writs" }, { p: "chair", x: 8, y: 3 }, { p: "shelf", x: 2, y: 2, v: 1 }, { p: "shelf", x: 3, y: 2, v: 0 }, { p: "books", x: 4, y: 2 },
    { p: "painting", x: 7, y: 0, v: 1 }, { p: "lantern", x: 2, y: 0 }, { p: "lantern", x: 13, y: 0 }, { p: "bench", x: 2, y: 6 }, { p: "bench", x: 11, y: 6 }, { p: "chest", x: 13, y: 2, id: "c_sb_hall" }, { p: "plant", x: 14, y: 7 }],
  sb_smithy: [{ p: "forge", x: 1, y: 2 }, { p: "anvil", x: 4, y: 4 }, { p: "tools", x: 6, y: 0 }, { p: "rack", x: 8, y: 2 }, { p: "barrel", x: 1, y: 5 }, { p: "crate", x: 10, y: 6 }, { p: "lantern", x: 9, y: 0 }],
  sb_store: [{ p: "shelf", x: 1, y: 2, v: 2 }, { p: "shelf", x: 2, y: 2, v: 1 }, { p: "baskets", x: 5, y: 2 }, { p: "crate", x: 9, y: 2 }, { p: "sack", x: 10, y: 2 }, { p: "barrel", x: 10, y: 6 }, { p: "jugs", x: 4, y: 5 }, { p: "lantern", x: 6, y: 0 }],
  sb_inn: [{ p: "fireplace", x: 7, y: 0 }, { p: "lantern", x: 2, y: 0 }, { p: "lantern", x: 13, y: 0 }, { p: "barrel", x: 1, y: 2 }, { p: "barrel", x: 2, y: 2 }, { p: "shelf", x: 4, y: 2, v: 2 },
    { p: "table", x: 5, y: 6, v: 1 }, { p: "chair", x: 4, y: 6 }, { p: "chair", x: 7, y: 6 }, { p: "table", x: 10, y: 6, v: 2 }, { p: "chair", x: 9, y: 6 }, { p: "chair", x: 12, y: 6 }, { p: "bed", x: 14, y: 2, v: 1 }, { p: "jugs", x: 3, y: 3 }],
  sb_chapel: [{ p: "desk", x: 5, y: 2, lk: "altar_sb" }, { p: "candles", x: 4, y: 2 }, { p: "candles", x: 7, y: 2 }, { p: "bench", x: 2, y: 4, lk: "pew" }, { p: "bench", x: 8, y: 4, lk: "pew" },
    { p: "bench", x: 2, y: 6, lk: "pew" }, { p: "bench", x: 8, y: 6, lk: "pew" }, { p: "painting", x: 5, y: 0, v: 0 }],
  sb_mill: [{ p: "block", x: 4, y: 3, lk: "millstone" }, { p: "sack", x: 1, y: 2, lk: "flour" }, { p: "sack", x: 2, y: 2, lk: "flour" }, { p: "sack", x: 1, y: 3, lk: "flour" }, { p: "baskets", x: 8, y: 2 },
    { p: "barrel", x: 10, y: 6 }, { p: "lantern", x: 6, y: 0 }],
  sb_tower: [{ p: "chair", x: 3, y: 3 }, { p: "table", x: 4, y: 3, v: 0, lk: "spyglass" }, { p: "straw", x: 1, y: 5 }, { p: "lantern", x: 5, y: 0 }],
};
for (const id in SB_DOORS) {
  const r = SB_DOORS[id], mat = Math.floor(r.w / 2) - (r.w % 2 ? 0 : 1);
  MAP_DEFS[id] = { name: r.name, outside: false, act2: true, act3: true, rows: ashRoom(r.w, r.h, mat, r.floor || "o"), props: SB_PROPS[id] || [],
    warps: [{ x: mat, y: r.h - 1, to: "sb", tx: r.door[0], ty: r.door[1] + 1, dir: "down" }] };
  MAP_DEFS.sb.warps.push({ x: r.door[0], y: r.door[1], to: id, tx: mat, ty: r.h - 2, dir: "up" });
}

MAP_DEFS.sb.looks = Object.assign({}, ETH_LOOKS, {
  door: ["Locked. A pot of something on the hob inside; you can smell it through the shutters.", "Nobody answers. A dog barks, once, and thinks better of it.", "Shut. Somebody's left their muddy boots on the step."],
  gate: ["The west gate: timber, barred, the bar nailed in place. Past it the path climbs into the Crags.", "Somebody has painted the Covenant's sunburst on it, twice the size it needs to be."],
  gate_sb_in: ["The north gate, open. A boy sits on the wall above it, supposed to be watching the road, actually watching you."],
  wall_sb_in: ["A good wall, mortared fresh this year. The village has been raising it a course at a time since the curse news came north."],
});
Object.assign(LOOK_TEXT, {
  millwheel: ["The millwheel, black with wet, turning steady in the cold stream off the Crags. It has not stopped in forty years, Hamm says."],
  sbwell: ["The village well, clean and cold. A tin cup on a chain. Rotmoor's is fouled, they say. Nobody here drinks without looking first."],
  sbboard: ["The chapel's notice board: 'Tithes due at the hall on the first of the month.' 'Lost: one ewe, black face.' 'All who show the mark of the Weave must register at Verrin. By order.'"],
  flour: ["Sacks of flour stamped for Verrin, and a smaller stack stamped for nowhere at all."],
  sheep: ["A sheep. It regards you with the deep suspicion of an animal that has been counted every day of its life."],
  writs: ["Writs of passage in a neat stack, each waiting for the bailiff's seal. A ledger of who has gone south, and who has come back."],
  altar_sb: ["A plain altar under the Covenant's sunburst, polished by a lot of elbows."],
  millstone: ["The lower millstone, grooved and white with dust. The wheel turns it from below. You can feel it in your feet."],
  spyglass: ["An old brass spyglass on a stand, aimed west at the Crags. Through it: the sealed pass, and the stamp of the Covenant on new stone."],
});
Object.assign(CHEST_LOOT, { c_sb_hall: [40, { spoultice: 1 }] });
ITEMS.sbwrit = { name: "Writ of passage", quest: true, desc: "A writ from the bailiff of Stonebridge, under seal: the bearers are known to the village and may be admitted at Verrin to see to their business." };

/* ---------- people ---------- */
Object.assign(NPC_DEFS, {
  corwen: { name: "Bailiff Ned Corwen", title: "Bailiff of Stonebridge", look: { skin: 0, hair: 2, beard: true, cloth: 4, outfit: "coat", mood: "neutral", glasses: true },
    schedule: [{ h: 0, map: "sb_hall", x: 7, y: 4, w: 1, where: "the bailiff's hall" }] },
  bryn: { name: "Bryn Halloway", title: "Smith", look: { skin: 2, hair: 0, beard: true, cloth: 3, apron: "#4a3a2a", mood: "neutral" },
    schedule: [{ h: 0, map: "sb_smithy", x: 5, y: 5, w: 1, where: "the smithy" }] },
  tilda: { name: "Tilda Penn", title: "Storekeeper", look: { sex: "f", skin: 1, hair: 3, hairStyle: "bun", cloth: 5, apron: "#b8a888", mood: "smile" },
    schedule: [{ h: 0, map: "sb_store", x: 5, y: 4, w: 1, where: "the store" }] },
  agnes: { name: "Agnes Whitlow", title: "Keeper of the Shepherd's Rest", look: { sex: "f", skin: 0, hair: 4, hairStyle: "bun", cloth: 1, apron: "#c8b898", mood: "smile", age: true },
    schedule: [{ h: 0, map: "sb_inn", x: 3, y: 4, w: 1, where: "the Shepherd's Rest" }] },
  odo: { name: "Brother Odo", title: "Stonebridge Chapel", look: { skin: 1, hair: 5, hood: true, cloth: 4, outfit: "dress", mood: "smile" },
    schedule: [{ h: 0, map: "sb_chapel", x: 6, y: 3, w: 1, where: "the chapel" }] },
  hamm: { name: "Hamm Fuller", title: "Miller", look: { skin: 1, hair: 1, cloth: 0, apron: "#d8d0c0", mood: "neutral" },
    schedule: [{ h: 0, map: "sb_mill", x: 6, y: 5, w: 1, where: "the mill" }] },
  gil: { name: "Old Gil", title: "The lookout", look: { skin: 2, hair: 5, beard: true, cloth: 3, outfit: "coat", mood: "neutral", age: true },
    schedule: [{ h: 0, map: "sb_tower", x: 3, y: 4, w: 0, where: "the old lookout" }] },
  sela: { name: "Sela", title: "Shepherd", look: { sex: "f", skin: 1, hair: 1, hood: true, cloth: 2, outfit: "dress", mood: "smile" },
    schedule: [{ h: 0, map: null }, { h: 6, map: "sb", x: 41, y: 57, w: 3, where: "the sheep fold" }, { h: 19, map: null }] },
  dun: { name: "Farmer Dun", title: "", look: { skin: 2, hair: 2, cloth: 3, outfit: "tunic", mood: "neutral" },
    schedule: [{ h: 0, map: null }, { h: 6, map: "sb", x: 16, y: 52, w: 3, where: "the fields" }, { h: 19, map: null }] },
  sbwatch: { name: "Covenant soldier", title: "North gate", look: { skin: 0, hair: 1, helm: true, cloth: 4, outfit: "coat", mood: "neutral" },
    schedule: [{ h: 0, map: "sb", x: 30, y: 5, w: 0, where: "the north gate" }] },
  sbkid: { name: "Wat", title: "", child: true, look: { skin: 1, hair: 3, cloth: 1, outfit: "tunic", mood: "smile", child: true },
    schedule: [{ h: 0, map: null }, { h: 8, map: "sb", x: 24, y: 22, w: 4, where: "the green" }, { h: 18, map: null }] },
});
const SB_NPCS = ["corwen", "bryn", "tilda", "agnes", "odo", "hamm", "gil", "sela", "dun", "sbwatch", "sbkid"];
for (const k of SB_NPCS) { NPC_DEFS[k].id = k; NPC_DEFS[k].act2 = true; }

/* ---------- shops ---------- */
Object.assign(SHOPS, {
  sb_store: { name: "Penn's Store", keeper: "Tilda", stock: ["bandage", "poultice", "spoultice", "btonic", "antidote", "bread", "ration", "rope", "torchoil"], bonus: ["hide", "herb", "food"], mult: 1, buy: 1, purse: 180 },
  sb_smith: { name: "Halloway's Smithy", keeper: "Bryn", stock: ["fortblade", "leyblade", "brigandine", "fortplate", "sallet", "greathelm"], bonus: ["arms"], only: ["arms", "salvage"], mult: 1.05, buy: 1, purse: 220 },
  sb_mill: { name: "The Mill", keeper: "Hamm", stock: ["bread", "ration"], bonus: ["food"], only: ["food"], mult: 0.9, buy: 1, purse: 60 },
});
const SB_INN = 30;

/* ---------- talk ---------- */
const sv = (who, t) => ({ who, t });
const sbWith = (c, id, t) => (inParty(c.G, id) ? [sv(id, t)] : []);
Object.assign(SCRIPTS, {
  corwen: (c) => {
    const s = qs(c.G, "q_sbwrit");
    if (!s) return [
      sv("corwen", "Travellers. From the north road? Then you came past the barricade, and someone with more braid than me let you through. Names, please. I write everyone down."),
      sv("corwen", "Ned Corwen, bailiff. Stonebridge is a Covenant village and a quiet one, and I'd like it to stay both."),
      sv("corwen", "Business south? Verrin, then. You'll want a writ. They'll not open the gate to strangers off the road, not since the curse news, and not since the Purifiers started burning carts."),
      sv("corwen", "And a word, kindly meant. If either of you carries the mark of the Weave, Verrin will want you registered. Don't hide it from them. It goes worse when they find it themselves."),
      ...sbWith(c, "tessa", "We'll bear that in mind."),
      { do: (c) => { c.set("q_sbwrit", 1); c.give("sbwrit", 1); } }, sv("narrator", "Bailiff Corwen seals a writ of passage for Verrin."),
      sv("corwen", "There. Show that at Verrin's south gate. And if you're passing back this way, the smith has been after wolf pelts all season. The Crags' foot is full of them."),
    ];
    return [sv("corwen", c.rot("corwen", ["The writ will see you into Verrin. What happens after is Verrin's business.", "Quiet village. I'd like it to stay quiet.", "Rotmoor's gone quiet too. Not the good kind.", "Every name in, every name out. Habit of thirty years."]))];
  },
  bryn: (c) => {
    const s = qs(c.G, "q_sbpelts"), steps = [];
    if (!s) steps.push(sv("bryn", "Wolves came down off the Crags this spring and haven't gone back up. Three ewes this month."),
      sv("bryn", "Bring me three good pelts. I line the soldiers' coats with them, and the Covenant pays by the coat."),
      { choice: [["We'll hunt some.", [{ do: (c) => c.set("q_sbpelts", 1) }]], ["Not now.", []]] });
    else if (s === 1 && (c.G.items.pelt || 0) >= 3) steps.push(sv("bryn", "Good pelts. Thick. These came from the woods at the Crags' foot, I can smell the pine."),
      { do: (c) => { c.take("pelt", 3); c.set("q_sbpelts", 3); c.coins(90); c.give("sallet", 1); } }, sv("bryn", "Ninety, and a helm I had spare. Better on your head than on my shelf."), sv("narrator", "90 coppers and a sallet."));
    else steps.push(sv("bryn", s === 1 ? "Three pelts. The wolves keep to the trees at the Crags' foot, west and south of here." : c.rot("bryn", ["Sela's not lost a ewe since. That's on you.", "Blades, mail, helms. Covenant pattern, honest weight."])));
    return [...steps, { choice: [["Trade", [{ shop: "sb_smith" }]], ["Goodbye.", []]] }];
  },
  tilda: (c) => [sv("tilda", c.rot("tilda", ["Rope, oil, bread, bandages. If you're going south, take more bandages than you think.", "Prices went up when Rotmoor shut. Everything comes the long way round now.", "Oh, travellers! We hardly get any. Buy something, I'll talk your ears off."])),
    { choice: [["Trade", [{ shop: "sb_store" }]], ["Goodbye.", []]] }],
  agnes: (c) => {
    const room = { choice: [
      [`Take a room (${SB_INN} coppers)`, [{ do: (c) => { if (c.G.coins >= SB_INN) c.coins(-SB_INN); } }, (c.G.coins >= SB_INN
        ? { choice: [[isNightT(c.G.time) ? "Sleep until morning" : "Sleep until nightfall", [{ do: (c) => c.innRest(true) }]], ["Just rest a while", [{ do: (c) => c.innRest(false) }]]] }
        : sv("agnes", "Thirty, love. I'd do it for less if the flour wasn't dear."))]],
      ["Not now.", []]] };
    return [sv("agnes", c.flag("met_agnes") ? c.rot("agnes", ["Mutton stew again. It's always mutton stew. It's a shepherds' inn.", "Sit by the fire. You look like you've walked from the north.", "Gil's up the tower again. He'll tell you about the mines if you let him. Don't let him."])
      : "Welcome to the Shepherd's Rest! Thirty a night, stew included, and you'll not find a cleaner bed this side of Verrin."), { do: (c) => c.set("met_agnes") }, room];
  },
  odo: (c) => [sv("odo", c.rot("odo", ["Welcome, travellers. The Covenant keeps the Weave in order, and order keeps us safe. That's all the sermon you'll get from me today.",
    "Verrin is very grand. You'll see. They register the gifted there, the ones who can weave. It's for their protection, mostly.", "Pray for Rotmoor, if you pray. I've stopped knowing what else to do for them."]))],
  hamm: (c) => [sv("hamm", c.rot("hamm", ["Wheel's turning, flour's milling. Half of it goes to Verrin as tithe. The other half goes in the bread.", "The stream comes down off the Crags. Cold as iron. The wheel likes it.", "Bread for the road? Fresh this morning."])),
    { choice: [["Buy bread", [{ shop: "sb_mill" }]], ["Goodbye.", []]] }],
  gil: (c) => {
    const out = [sv("gil", c.flag("met_gil") ? c.rot("gil", ["The pass. I can see the seal from here. New stone, Covenant stamp. Ugly work.", "Forty years in those mines, I did. Silver, then iron, then nothing.", "There's something in the air off the Crags lately. Like a held breath."])
      : "Mind the ladder. I'm Gil. I was a miner, up in the Crags, before they shut the mines. Now I watch the pass. Somebody should.")];
    if (!c.flag("met_gil")) out.push(sv("gil", "The Covenant walled the old way up this summer. Rockfall, they said. There was no rockfall. I'd have heard it."), { do: (c) => c.set("met_gil") });
    if (c.flag("hakon_rot") && !c.flag("hakon_gil")) out.push({ choice: [
      ["Ask about the men in chains", [
        ...sbWith(c, "hakon", "Old man. The Iron Cleave's buyers. Men in chains, bound for the mines. Did you see them?"),
        sv("gil", "Saw them. Early summer. Eight men on a line, and the Cleave's people with whips. Went up the pass towards the old workings."),
        sv("gil", "A week later the Covenant came and walled it shut. I watched the whole time through that glass. Nobody came back down before the wall went up."),
        ...sbWith(c, "hakon", "Then he is still in there."),
        sv("gil", "Or what's in there has him. I'm sorry, big man. That's the truth as I saw it."),
        { do: (c) => c.set("hakon_gil") }]],
      ["Nothing.", []]] });
    return out;
  },
  sela: (c) => [sv("sela", c.rot("sela", ["Forty-one sheep. Forty-one. I count them every morning.", "The wolves come at dusk. I can hear them up in the pines.", "That one's Bramble. She bites."]))],
  dun: (c) => [sv("dun", c.rot("dun", ["Barley's thin this year. Thinner every year, closer you get to the south.", "Good soil, Stonebridge. Bad neighbours.", "Rotmoor bought our wool. Not any more."]))],
  sbwatch: (c) => [sv("sbwatch", c.rot("sbwatch", ["Report to the bailiff, if you haven't.", "Quiet post. I like quiet posts.", "Purifier riders came through last month. Didn't stop. Didn't need to."]))],
  sbkid: (c) => [sv("sbkid", c.rot("sbkid", ["Are you knights?", "My da says the Crags have ghosts in. I've seen one. Probably.", "I'm watching the road. That's my job. Mostly."]))],
});

/* ---------- the task list ---------- */
ASH_QUESTS.push(
  ["q_sbwrit", "Papers for Verrin", ["", "Show the bailiff's writ at Verrin's south gate"], ["", "Verrin lies east along the Pale Road"]],
  ["q_sbpelts", "Pelts for the Smith", ["", "Bring Bryn Halloway three wolf pelts"], ["", "Wolves keep to the woods at the foot of the Crags"]],
);
QUEST_ENTER_HOOKS.push((G, id) => {
  if (id === "sb" && !G.flags.reached_sb) {
    G.flags.reached_sb = true;
    return [{ who: "narrator", t: "Stonebridge. Thatch and stone under the grey wall of the Crags, a millwheel turning, sheep somewhere. After the plains it is very quiet." },
      { who: "narrator", t: "A Covenant soldier at the gate nods you through, and a boy on the wall above shouts that there are strangers, to everyone and no one." },
      ...(inParty(G, "tessa") ? [{ who: "tessa", t: "It's like home was. Before. Let's find whoever's in charge." }] : [])];
  }
  return null;
});
