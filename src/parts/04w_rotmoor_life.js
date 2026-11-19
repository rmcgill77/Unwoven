/* ------------------------------------------------------------------ */
/* Rotmoor (Act 3): a village dying of a sickness that came with the   */
/* curse. Its rooms, its people, the guarded quarantine line, the      */
/* reeve's errand into the cellar, and Hakon's clue. The maps are in   */
/* 04v_rotmoor.js.                                                     */
/* ------------------------------------------------------------------ */

/* ---------- rooms ---------- */
const ROT_DOORS = {
  rot_reeve: { door: [9, 13], name: "The Reeve's House", w: 12, h: 9 },
  rot_herb: { door: [9, 22], name: "Hesk's Simples", w: 12, h: 9 },
  rot_inn: { door: [9, 38], name: "The Hollow Lantern", w: 16, h: 10 },
  rot_sick: { door: [44, 12], name: "The Sick-House", w: 18, h: 12, floor: "s" },
};
const ROT_PROPS = {
  rot_reeve: [{ p: "fireplace", x: 1, y: 0 }, { p: "desk", x: 5, y: 2, lk: "deadlist" }, { p: "chair", x: 6, y: 3 }, { p: "shelf", x: 9, y: 2, v: 1 }, { p: "books", x: 10, y: 2 },
    { p: "candles", x: 8, y: 2 }, { p: "chest", x: 10, y: 6, id: "c_rot_reeve" }, { p: "bed", x: 1, y: 5 }, { p: "lantern", x: 8, y: 0 }],
  rot_herb: [{ p: "herbs", x: 1, y: 0 }, { p: "herbs", x: 3, y: 0 }, { p: "herbs", x: 8, y: 0 }, { p: "shelf", x: 1, y: 2, v: 2 }, { p: "jugs", x: 2, y: 2 }, { p: "cauldron", x: 9, y: 3 },
    { p: "table", x: 4, y: 5, v: 1 }, { p: "baskets", x: 8, y: 6 }, { p: "candles", x: 6, y: 2 }],
  rot_inn: [{ p: "fireplace", x: 7, y: 0 }, { p: "lantern", x: 2, y: 0 }, { p: "lantern", x: 13, y: 0 }, { p: "barrel", x: 1, y: 2 }, { p: "barrel", x: 2, y: 2 }, { p: "cauldron", x: 5, y: 3 },
    { p: "table", x: 6, y: 6, v: 1 }, { p: "chair", x: 5, y: 6 }, { p: "table", x: 11, y: 6, v: 2 }, { p: "chair", x: 13, y: 6 }, { p: "bed", x: 14, y: 2, v: 1 }, { p: "straw", x: 10, y: 3 }, { p: "straw", x: 3, y: 7 }],
  rot_sick: [{ p: "desk", x: 8, y: 2, lk: "altar_rot" }, { p: "candles", x: 7, y: 2 }, { p: "candles", x: 10, y: 2 },
    ...[2, 4, 6, 12, 14, 16].map((x) => ({ p: "bed", x, y: 4, lk: "sickbed" })), ...[2, 4, 6, 12, 14, 16].map((x) => ({ p: "bed", x, y: 7, lk: "sickbed" })),
    { p: "cauldron", x: 9, y: 9, lk: "physic" }, { p: "jugs", x: 1, y: 9 }, { p: "straw", x: 15, y: 9 }],
};
for (const id in ROT_DOORS) {
  const r = ROT_DOORS[id], mat = Math.floor(r.w / 2) - (r.w % 2 ? 0 : 1);
  MAP_DEFS[id] = { name: r.name, outside: false, act2: true, act3: true, rows: ashRoom(r.w, r.h, mat, r.floor || "o"), props: ROT_PROPS[id] || [], dark: id === "rot_sick",
    warps: [{ x: mat, y: r.h - 1, to: "rot", tx: r.door[0], ty: r.door[1] + 1, dir: "down" }] };
  MAP_DEFS.rot.warps.push({ x: r.door[0], y: r.door[1], to: id, tx: mat, ty: r.h - 2, dir: "up" });
}

MAP_DEFS.rot.looks = Object.assign({}, ETH_LOOKS, {
  door: ["Planks nailed across the door, a red cross daubed over them. Someone inside is coughing, slow and wet.", "Sealed. A bowl of water has been left on the step, and not touched.",
    "Locked. Through the shutters, a family sitting very still around a cold hearth, the way people sit when they are listening for a cough."],
  quarantine: ["Stakes and rope, rags knotted on every few yards so it shows in the dark. Beyond it, the sick quarter.", "A Covenant soldier watches you look at it. He doesn't say anything. He doesn't have to."],
  gate_rotmoor_in: ["The north gate, and two carts dragged across it on the inside. They move them for the living, slowly."],
  wall_rotmoor_in: ["Rotmoor's wall, stained dark at the joints. On the east side the stain is wet."],
  growth: ["The curse has come in through the breach. It grows where the dead were laid out, before they started burning them."],
});
MAP_DEFS.rot_cellar.looks = { growth: ["It pulses. Faintly, slowly, like something asleep. The sickness started here. You are sure of it."] };
Object.assign(LOOK_TEXT, {
  gatecart: ["A cart dragged across the gate from the inside, its wheels chocked with stones. Rotmoor is keeping something out. Or in."],
  fouledwell: ["The well, roped off. A board nailed across it says FOUL. The water at the bottom is the colour of a bruise."],
  deadcart: ["A handcart under a sheet. Bare feet show at the end of it. Nobody has come for it yet today."],
  soup: ["A pot of thin soup over a low fire. More water than barley. The line for it is mostly children."],
  cot: ["A cot dragged out of the sick-house for the air. The blanket on it is stained grey at the edges.", "Somebody lay here this morning. The straw still holds the shape."],
  pyre_rot: ["The burning ground. The smell will not leave your clothes for days.", "They burn the dead here now, since the graveyard filled. Somebody has scratched names into the wall behind it."],
  hatch: ["A cellar trapdoor under the cooper's burned house, chained shut. The chain is new. The lock is the Reeve's."],
  deadlist: ["The Reeve's ledger. The first pages are tithes and births. The last eleven are names, a date beside each, in a hand that gets smaller as it goes."],
  sickbed: ["A villager on a straw cot, grey-lipped, the skin of the neck marked with dark lines like roots under ice.", "Asleep, or nearly. Their breath catches every few seconds. A cloth on the forehead, still damp."],
  altar_rot: ["The altar has been cleared for bandages, salves and a row of tin cups. The Covenant's sunburst still hangs above it."],
  physic: ["A pot of something bitter steaming over a low flame. Willow bark, garlic, a smell of iron underneath it."],
});
Object.assign(CHEST_LOOT, { c_rot_sample: [0, { infsample: 1 }], c_rot_old: [45, { antidote: 2 }], c_rot_reeve: [30, { gpoultice: 1 }] });
ITEMS.infsample = { name: "Sealed sample", quest: true, desc: "A jar stoppered with wax, from the heart of Rotmoor's cellar. Inside, something like a black root moves when it is warmed in the hand." };

/* ---------- people ---------- */
const ROT_GUARD = (title, skin, hair) => ({ name: "Covenant soldier", title, look: { skin, hair, helm: true, cloth: 4, outfit: "coat", mood: "neutral" } });
Object.assign(NPC_DEFS, {
  crane: { name: "Reeve Aldous Crane", title: "Reeve of Rotmoor", look: { skin: 1, hair: 5, beard: true, cloth: 2, outfit: "coat", mood: "neutral", age: true },
    schedule: [{ h: 0, map: "rot_reeve", x: 6, y: 4, w: 1, where: "the reeve's house" }] },
  wen: { name: "Sister Wen Hallow", title: "The sick-house", look: { sex: "f", skin: 0, hair: 5, hood: true, cloth: 7, outfit: "dress", mood: "neutral" },
    schedule: [{ h: 0, map: "rot_sick", x: 9, y: 6, w: 3, where: "the sick-house" }] },
  ilsa: { name: "Novice Ilsa", title: "The sick-house", look: { sex: "f", skin: 2, hair: 2, hood: true, cloth: 0, outfit: "dress", mood: "neutral" },
    schedule: [{ h: 0, map: "rot_sick", x: 4, y: 9, w: 2, where: "the sick-house" }] },
  hesk: { name: "Mother Hesk", title: "Herbalist", look: { sex: "f", skin: 2, hair: 5, hairStyle: "bun", cloth: 7, apron: "#6a7a5a", mood: "neutral", age: true },
    schedule: [{ h: 0, map: "rot_herb", x: 4, y: 3, w: 1, where: "her shop" }] },
  brannoc: { name: "Brannoc Dell", title: "Keeper of the Hollow Lantern", look: { skin: 1, hair: 0, beard: true, cloth: 1, apron: "#b0a080", mood: "neutral" },
    schedule: [{ h: 0, map: "rot_inn", x: 4, y: 4, w: 1, where: "the Hollow Lantern" }] },
  holt: { name: "Sergeant Holt", title: "The quarantine crossing", look: { skin: 2, hair: 1, beard: true, helm: true, cloth: 4, outfit: "coat", mood: "neutral" },
    schedule: [{ h: 0, map: "rot", x: 36, y: 30, w: 0, where: "the quarantine crossing" }] },
  rotguard1: { ...ROT_GUARD("Quarantine line", 0, 1), schedule: [{ h: 0, map: "rot", x: 36, y: 9, w: 0, where: "the quarantine line" }] },
  rotguard2: { ...ROT_GUARD("Quarantine line", 2, 0), schedule: [{ h: 0, map: "rot", x: 36, y: 19, w: 0, where: "the quarantine line" }] },
  rotguard3: { ...ROT_GUARD("Quarantine line", 1, 2), schedule: [{ h: 0, map: "rot", x: 36, y: 39, w: 0, where: "the quarantine line" }] },
  rotguard4: { ...ROT_GUARD("Quarantine line", 3, 1), schedule: [{ h: 0, map: "rot", x: 36, y: 50, w: 0, where: "the quarantine line" }] },
  rotguard5: { ...ROT_GUARD("Quarantine line", 0, 0), schedule: [{ h: 0, map: "rot", x: 36, y: 60, w: 0, where: "the quarantine line" }] },
  abe: { name: "Abe Tanner", title: "Gravedigger", look: { skin: 1, hair: 3, cloth: 3, outfit: "tunic", mood: "neutral", age: true },
    schedule: [{ h: 0, map: null }, { h: 6, map: "rot", x: 24, y: 49, w: 2, where: "the graveyard" }, { h: 20, map: null }] },
  rotfolk1: { name: "A hungry villager", title: "", look: { skin: 1, hair: 2, cloth: 1, outfit: "tunic", mood: "neutral" },
    schedule: [{ h: 0, map: null }, { h: 8, map: "rot", x: 10, y: 42, w: 1, where: "the soup line" }, { h: 18, map: null }] },
  rotfolk2: { name: "A coughing woman", title: "", look: { sex: "f", skin: 0, hair: 4, hood: true, cloth: 0, outfit: "dress", mood: "neutral" },
    schedule: [{ h: 0, map: null }, { h: 8, map: "rot", x: 14, y: 43, w: 1, where: "the soup line" }, { h: 18, map: null }] },
  rotchild: { name: "Pip", title: "", child: true, look: { skin: 2, hair: 1, cloth: 2, outfit: "tunic", mood: "neutral", child: true },
    schedule: [{ h: 0, map: null }, { h: 9, map: "rot", x: 22, y: 30, w: 3, where: "the square" }, { h: 17, map: null }] },
});
const ROT_NPCS = ["crane", "wen", "ilsa", "hesk", "brannoc", "holt", "rotguard1", "rotguard2", "rotguard3", "rotguard4", "rotguard5", "abe", "rotfolk1", "rotfolk2", "rotchild"];
for (const k of ROT_NPCS) { NPC_DEFS[k].id = k; NPC_DEFS[k].act2 = true; }

/* ---------- shop ---------- */
SHOPS.rot_herb = { name: "Hesk's Simples", keeper: "Hesk", stock: ["bandage", "poultice", "antidote", "btonic"], bonus: ["herb"], only: ["herb", "dark"], mult: 1.4, buy: 1.1, purse: 70 };
const ROT_INN = 25;

/* ---------- talk ---------- */
const rv = (who, t) => ({ who, t });
const rotWith = (c, id, t) => (inParty(c.G, id) ? [rv(id, t)] : []);
Object.assign(SCRIPTS, {
  crane: (c) => {
    const s = qs(c.G, "q_rotcellar"), out = [];
    if (!c.flag("met_crane")) out.push(
      rv("crane", "You came in through the gate. On purpose. That makes you brave or lost, and I'm too tired to ask which."),
      rv("crane", "Aldous Crane. Reeve of Rotmoor, for what that's worth now. Eleven dead this month. Twenty in the sick-house. More every morning."),
      rv("crane", "It came up out of the east with the dead trees. A cough, then the lines under the skin, then the fever. Then the cart."),
      ...rotWith(c, "tessa", "Is there anything we can do?"),
      rv("crane", "Talk to Sister Wen at the sick-house, if the guards will wave you near it. She knows more than I do. Then come back, and we'll see."),
      { do: (c) => c.set("met_crane") });
    else if (!s && c.flag("met_wen")) out.push(
      rv("crane", "Wen says it started under the cooper's. Old Dunmore was the first to take sick, and he'd been digging out his cellar. Found an older one beneath it, he said. Stone-lined."),
      rv("crane", "I chained the hatch myself. Nobody's been down since. But if I'm to understand this thing, and send word to Aurelm that's worth reading, I need a piece of it."),
      rv("crane", "Go down. Bring me back a sample, sealed. Wen has jars. Touch nothing you don't have to."),
      { choice: [
        ["\"We'll go down.\"", [rv("crane", "Here. The key to the chain, and my pass. Show it to Sergeant Holt at the crossing."), { do: (c) => { c.set("q_rotcellar", 1); c.set("rot_pass"); } },
          rv("narrator", "Reeve Crane gives you the cellar key and a quarantine pass."), ...rotWith(c, "hakon", "Cellars. Of course it is a cellar.")]],
        ["\"Not yet.\"", [rv("crane", "I understand. I wouldn't either.")]]] });
    else if (s === 1 || s === 2) {
      if (c.has("infsample")) out.push(
        rv("crane", "You found it. Set it there. No, on the desk. Gently."),
        rv("crane", "It's moving. Saints. It's not a sickness at all, is it? It's a root. It's the curse, grown small enough to get inside a man."),
        rv("crane", "I'll study what I can and send the rest to Aurelm with a rider. If they can find what stops it, Rotmoor may yet see spring. Take this. It's all the village can spare."),
        { do: (c) => { c.take("infsample", 1); c.set("q_rotcellar", 3); c.coins(150); c.give("gtonic", 2); } }, rv("narrator", "150 coppers and 2 greater tonics."),
        ...rotWith(c, "tessa", "If it's a root, it has a source. Somewhere further in."));
      else out.push(rv("crane", "The cooper's burned house, east of the line. The hatch is in the floor where the kitchen was. Holt will let you across."));
    } else out.push(rv("crane", s === 3 ? c.rot("crane_after", ["The rider left for Aurelm at first light. We wait.", "Two fewer coughing today. It may be nothing. I'll take nothing.", "I keep reading the names in the ledger. I should stop."])
      : c.rot("crane", ["Talk to Wen. She'll tell you more than I can.", "The guards are Covenant, not ours. They do as they're told. So far, so do we."])));
    // Hakon's brother: the reeve keeps a register of everyone who passes through
    if (inParty(c.G, "hakon") && c.flag("met_crane") && !c.flag("hakon_rot")) out.push({ choice: [
      ["Ask about a Vale man named Arthur", [
        rv("hakon", "Reeve. A man from the Vale. Big, red-haired like me, younger. He would have come through in chains, with the Iron Cleave's buyers."),
        rv("crane", "In chains... Yes. I write down everyone who passes the gate. It's habit. Wait."),
        rv("crane", "Here. Early summer, before the sickness. 'Eight men in irons, Cleave buyers, bound west for the mines in the Crags. One Vale man, red-haired, gave his name as Redfell when he was asked. Would not give the other.'"),
        rv("hakon", "Arthur. He would not give them the rest of it. Hm. That is him."),
        rv("crane", "The Crag mines. The Covenant walled up the old pass not long after. If he went in before they sealed it, he went in, and nobody's come out since. I'm sorry."),
        rv("hakon", "Do not be sorry, Reeve. Be accurate. You have been. Thank you."),
        { do: (c) => c.set("hakon_rot") }, rv("narrator", "Hakon's brother was taken west, in chains, to the mines in the Western Crags.")]],
      ["Nothing else.", []]] });
    return out;
  },
  wen: (c) => {
    if (!c.flag("met_wen")) return [
      rv("wen", "Don't come closer than the end of that bed. And keep your scarf over your mouth. I haven't had time to learn how it spreads, only that it does."),
      rv("wen", "Wen Hallow. The Covenant sent me to keep the chapel. Now I keep this."),
      rv("wen", "It starts with a cough. Then the lines, there, under the skin, dark, branching, like roots under ice. Then the fever. Most don't wake from the fever."),
      rv("wen", "Old Dunmore was the first. The cooper. He'd been digging under his house. He said there was a second cellar under his, stone-lined, older than the village."),
      rv("wen", "Tell the Reeve I said so. If anyone's going down there, it should be someone who hasn't caught it yet."),
      { do: (c) => c.set("met_wen") }, ...rotWith(c, "tessa", "Roots. Like the trees on the road in.")];
    return [rv("wen", qs(c.G, "q_rotcellar") === 1 ? "The jars are on the shelf by the door. Stopper it well. Don't let it touch your skin." : c.rot("wen", ["Two came in this morning. One went out on the cart.", "Willow bark for the fever. It doesn't help. It's something to do with my hands.", "Ilsa hasn't slept in three days. Neither have I."]))];
  },
  ilsa: (c) => [rv("ilsa", c.rot("ilsa", ["Sorry. Sorry, I can't stop. They need water.", "The lines spread faster at night. I've started counting them.", "Sister Wen says it isn't a punishment. I want to believe her."]))],
  hesk: (c) => [rv("hesk", c.rot("hesk", ["Prices are high because there's nothing left. I'm not a thief. I'm the last one open.", "Willow, yarrow, garlic. None of it touches this, but people want something.", "If you've herbs, I'll pay well. Better than well."])),
    { choice: [["Trade", [{ shop: "rot_herb" }]], ["Goodbye.", []]] }],
  brannoc: (c) => {
    const room = { choice: [
      [`Take a room (${ROT_INN} coppers)`, [{ do: (c) => { if (c.G.coins >= ROT_INN) c.coins(-ROT_INN); } }, (c.G.coins >= ROT_INN
        ? { choice: [[isNightT(c.G.time) ? "Sleep until morning" : "Sleep until nightfall", [{ do: (c) => c.innRest(true) }]], ["Just rest a while", [{ do: (c) => c.innRest(false) }]]] }
        : rv("brannoc", "Twenty-five. I'd give it free if I could. I can't."))]],
      ["Not now.", []]] };
    return [rv("brannoc", c.flag("met_brannoc") ? c.rot("brannoc", ["Soup at noon. While it lasts.", "Half the beds are empty. The other half, I don't ask.", "We used to have music in here. Fiddler took sick first week."])
      : "Rooms are cheap. Nobody's travelling. I boil the sheets every day, if that's what you're wondering."), { do: (c) => c.set("met_brannoc") }, room];
  },
  holt: (c) => [rv("holt", c.flag("rot_pass") ? c.rot("holt_pass", ["Reeve's pass. Fine. Go on, and keep your mouth covered.", "Don't touch the doors with the crosses on them.", "If you start coughing over there, you stay over there. Those are the orders."])
    : c.rot("holt", ["Nobody crosses. Reeve's orders, and the Covenant's.", "The line holds or the village dies. I'd rather it held.", "You want across, you get a pass from Reeve Crane. West of the square."]))],
  rotguard1: (c) => [rv("rotguard1", c.rot("rotg1", ["Stay on the west side.", "Move along.", "Don't make me lower this."]))],
  rotguard2: (c) => [rv("rotguard2", c.rot("rotg2", ["Two weeks on this line. Two weeks.", "Keep back from the stakes.", "They cough all night over there. You stop hearing it. Mostly."]))],
  rotguard3: (c) => [rv("rotguard3", c.rot("rotg3", ["Eyes front.", "If something comes through the breach, we're the wall. That's the job.", "Move along, please."]))],
  rotguard4: (c) => [rv("rotguard4", c.rot("rotg4", ["The burning ground's upwind today. Small mercies.", "Back from the line.", "Purifiers came by last month. Wanted to burn the whole east side, sick and all. The sergeant sent them off."]))],
  rotguard5: (c) => [rv("rotguard5", c.rot("rotg5", ["Nothing to see.", "Stay clear of the stakes.", "I had a cough last week. It went. Don't tell anyone."]))],
  abe: (c) => [rv("abe", c.rot("abe", ["Graveyard's full. I've been digging between the rows. Now they burn them. I don't know which is worse.", "Forty years I've dug here. Never this many.", "The ground's warm on the east side. Ground shouldn't be warm."]))],
  rotfolk1: (c) => [rv("rotfolk1", c.rot("rotfolk1", ["Soup's at noon. Get in line.", "My brother's over the line. They won't let me see him.", "We should have left. Where would we go?"]))],
  rotfolk2: (c) => [rv("rotfolk2", c.rot("rotfolk2", ["It's only the dust. Only the dust.", "*coughs* Don't look at me like that.", "Please don't tell the guards."]))],
  rotchild: (c) => [rv("rotchild", c.rot("rotchild", ["Are you from the Covenant? Are you going to fix it?", "My mum's in the sick-house. I wave at the window.", "Pip. I'm Pip. I'm not sick."]))],
  look_cellar: (c) => qs(c.G, "q_rotcellar") >= 1
    ? [rv("narrator", qs(c.G, "q_rotcellar") >= 3 ? "The trapdoor, open now. The stair goes down into the dark." : "The Reeve's key turns in the lock. The chain falls away, and cold air comes up the stair, smelling of iron."),
      { choice: [["Go down", [{ do: (c) => c.goto("rot_cellar", 5, 4, "down") }]], ["Not yet", []]] }]
    : [rv("narrator", "A cellar trapdoor under the cooper's burned house, chained shut. The chain is new, and the lock on it is the Reeve's.")],
});

/* ---------- the task list ---------- */
ASH_QUESTS.push(
  ["q_rotcellar", "Beneath Rotmoor", ["", "Bring back a sample from the cellar under the cooper's burned house", "Take the sample to Reeve Crane"], ["", "Sergeant Holt will let you across the quarantine line; the hatch is in the cooper's floor", "The reeve's house, west of the square"]],
);
QUEST_ENTER_HOOKS.push((G, id) => {
  if (id === "rot" && (G.flags.q_rotcellar | 0) === 1 && G.items.infsample) G.flags.q_rotcellar = 2;
  if (id === "rot" && !G.flags.reached_rot) {
    G.flags.reached_rot = true;
    return [{ who: "narrator", t: "Two men drag a cart aside from the gate and let you in, then drag it back. Neither of them looks at you." },
      { who: "narrator", t: "Rotmoor. A rope and a line of stakes runs down the middle of the village, Covenant soldiers posted along it. On the far side, doors with red crosses, and smoke from the burning ground." },
      ...(inParty(G, "tessa") ? [{ who: "tessa", t: "Keep your scarf up. And don't touch anything you don't have to." }] : [])];
  }
  if (id === "rot_cellar" && !G.flags.reached_rot_cellar) {
    G.flags.reached_rot_cellar = true;
    return [{ who: "narrator", t: "Below the cooper's cellar the wall has been broken through into older stone. The air is warm. Something has grown along the floor, dark and branching, toward the deep end." }];
  }
  return null;
});
