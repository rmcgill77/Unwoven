/* ------------------------------------------------------------------ */
/* Fort Frostcrown: the Covenant at home. The three ways in, the       */
/* rooms, Arbitrator Ulric Icetoe and his first task, Captain Ysolt    */
/* Rennick's sparring ring, the storehouse Keystones, the captured     */
/* Purifier, and the shops. The map is in 04q_fort.js; the sparring    */
/* roster's battle stats are in 06m_fort_late.js.                      */
/* ------------------------------------------------------------------ */
PILLARS.fort = { map: "fort", name: "Fort Frostcrown", at: [74, 47, "up"], covenant: true };
const fv = (who, t) => ({ who, t });

/* ---------- getting in: the Outskirts gates are open by day, for those who have paid or been searched ---------- */
for (let x = 48; x < 52; x++) {
  MAP_DEFS.os.warps.push({ x, y: 43, to: "fort", tx: x + 25, ty: 91, dir: "up",
    lock: { night: true, need: "fort_pass_s", say: "The sentry steps across the gate. \"Toll first. Hesk, at the post.\"", sayNight: "The portcullis is down for the night. \"First light,\" the sentry says, and means it." } });
  MAP_DEFS.os.warps.push({ x, y: 10, to: "fort", tx: x + 25, ty: 5, dir: "down",
    lock: { night: true, need: "fort_pass_n", say: "A soldier bars the way with his pike. \"Search first. Over here.\"", sayNight: "The north gate is shut for the night." } });
}
MAP_DEFS.os.looks.southgate = ["The south gate, its portcullis wound up for the day. Through the arch: a paved street, smoke, the noise of a market.", "Over the arch, carved deep: the Covenant's knot, and under it, 'By Weave and Warden'."];
MAP_DEFS.os.looks.northgate = ["The north gate: black oak under iron straps. By day one leaf stands open, and everyone who passes is searched."];

/* the toll keeper: Voidsong's letter, or two silver (twenty coppers) */
SCRIPTS.ostoll = (c) => {
  if (isNightT(c.G.time)) return [fv("ostoll", "Post's shut. Come back in daylight.")];
  if (c.flag("fort_pass_s")) return [fv("ostoll", c.rot("ostoll2", ["You're paid up. Go on through.", "In and out as you please, by day. Mind the market thieves.", "Nineteen winters at this post. The wagons get fewer every one."]))];
  const steps = [fv("ostoll", "Two silver a head, carts by weight, letters of the Covenant free.")];
  if (c.G.items.covletter > 0) return [...steps, fv("ostoll", "And that's Curate Voidsong's seal. Free, then. Free for your friends as well. Go on, before the queue sees you."),
    { do: (c) => c.set("fort_pass_s") }, fv("narrator", "Hesk waves the party through the south gate. The toll is waived.")];
  return [...steps, { choice: [["Pay twenty coppers", [{ do: (c) => { if (c.G.coins >= 20) { c.coins(-20); c.set("fort_pass_s"); } } },
    { do: (c) => null }, fv("ostoll", c.G.coins >= 20 ? "Thank you kindly. In you go." : "Twenty coppers. You haven't got twenty coppers. The north gate's free, if you don't mind being looked at.")]],
    ["\"Not today.\"", [fv("ostoll", "Then the queue's behind the wagons.")]]] }];
};
/* the north gate: a search, and the tome to keep out of sight */
SCRIPTS.osnorth1 = (c) => {
  if (isNightT(c.G.time)) return [fv("osnorth1", "The north gate opens at first light. Before that, the only things that come up this road are wolves and Vale scouts.")];
  if (c.flag("fort_pass_n")) return [fv("osnorth1", c.rot("osnorth1b", ["You've been searched. Go on in.", "Frozen Vale outriders on the east road. If you go that way, you go alone."]))];
  return [fv("osnorth1", "North gate. Everyone is searched. Packs on the table, coats open, arms out."),
    fv("narrator", "Your pack holds the oilcloth bundle. The soldier is already reaching for it."),
    { choice: [
      ["Slip the bundle inside your coat", [fv("narrator", "You shrug the pack off one shoulder and the bundle goes under your coat in the same movement. The soldier empties the pack: bread, bandages, a spare shirt."),
        fv("osnorth1", "Coat."), fv("tessa", "He's freezing, can't you see? Look, my turn. I've got a knife in my boot. Two, actually."),
        fv("narrator", "While the soldier deals with Tessa's knives, nobody pats your coat."), fv("osnorth1", "Fine. In. All of you."), { do: (c) => c.set("fort_pass_n") }]],
      ["Hand the bundle to Tessa first", [fv("narrator", "Tessa takes the bundle without a word and holds it under her arm like a loaf. The soldier goes through your pack, then hers. He does not unwrap the bread."),
        fv("osnorth1", "In."), fv("tessa", "Never search the person holding the bread. Everybody knows that."), { do: (c) => c.set("fort_pass_n") }]],
      ["\"Never mind. We'll use the other gate.\"", [fv("osnorth1", "Suit yourself. The toll's two silver.")]],
    ] }];
};
/* the culvert grate: opened with the wayfarer's knowledge */
SCRIPTS.look_grate = (c) => {
  if (!c.flag("secret_lead")) return [fv("narrator", "An iron grate at the foot of the wall, where the Fort's kitchen runoff comes out under the stone. Black water, a smell of onions and grease, and a draught of warm air."),
    fv("narrator", "The bars are rusted into their frame. Someone who knew this grate was here, and how it was hung, might get it open. You don't, yet.")];
  return [fv("narrator", c.flag("grate_open") ? "The grate swings up on its rusted hinge, the way the wayfarer showed you." : "Lift, twist, and pull, the wayfarer said. The grate grinds, gives, and swings up on a hinge nobody has oiled in fifty years."),
    { choice: [["Go in under the wall", [{ do: (c) => { c.set("grate_open"); c.goto("fort_under", 2, 4, "right"); } }]], ["Leave it", []]] }];
};
/* the wayfarer, asked nicely, tells how the grate is hung */
const _wayfarer0 = SCRIPTS.wayfarer;
SCRIPTS.wayfarer = (c) => {
  const s = qs(c.G, "q_whisper");
  if (s >= 2 && !c.flag("grate_told")) return [fv("wayfarer", "You came back. And you asked nicely, more or less. Good."),
    fv("wayfarer", "West flank of the Fort, a cleft in the rocks where no guard bothers to stand. A grate at the bottom of the wall: the kitchen runoff."),
    fv("wayfarer", "It isn't rusted shut. It only looks it. Lift, twist, and pull. It comes out in the undercroft, under the stores."),
    fv("wayfarer", "What you do in there is your own business. I'd go at night. Storekeepers sleep like anyone."),
    { do: (c) => { c.set("grate_told"); c.set("secret_lead"); } }];
  return _wayfarer0 ? _wayfarer0(c) : [fv("wayfarer", "The fire doesn't ask who you are.")];
};

/* ---------- rooms ---------- */
const FORT_ROOMS = {
  fort_cmd: { name: "The Command Post", w: 18, h: 11, floor: "s" },
  fort_chapel: { name: "The Fort Chapel", w: 12, h: 10 },
  fort_weaver: { name: "The Weaver Hall", w: 16, h: 10, floor: "s" },
  fort_tower: { name: "The North Tower", w: 9, h: 8, floor: "s" },
  fort_mess: { name: "The Mess Hall", w: 18, h: 10 },
  fort_store: { name: "The Storehouse", w: 14, h: 10, floor: "s" },
  fort_barracks: { name: "The Barracks", w: 18, h: 10 },
  fort_armoury: { name: "The Armoury", w: 10, h: 9, floor: "s" },
  fort_qm: { name: "The Quartermaster's", w: 12, h: 9 },
  fort_apoth: { name: "The Apothecary", w: 10, h: 9 },
  fort_smith: { name: "The Market Forge", w: 11, h: 9, floor: "s" },
  fort_tailor: { name: "Tailor and Furrier", w: 9, h: 8 },
  fort_inn: { name: "The Frost Lantern", w: 14, h: 10 },
  fort_hostel: { name: "The Lower Quarter Hostel", w: 10, h: 8 },
  fort_fence: { name: "A Back Room", w: 8, h: 7 },
};
const FORT_PROPS = {
  fort_cmd: [{ p: "banner", x: 4, y: 0 }, { p: "banner", x: 13, y: 0 }, { p: "fireplace", x: 8, y: 0 }, { p: "desk", x: 8, y: 3, lk: "ulricdesk" }, { p: "chair", x: 9, y: 2 }, { p: "shelf", x: 1, y: 2, v: 1 }, { p: "shelf", x: 2, y: 2, v: 2 },
    { p: "books", x: 15, y: 2 }, { p: "table", x: 13, y: 6, v: 2, lk: "maptable" }, { p: "lantern", x: 2, y: 0 }, { p: "lantern", x: 15, y: 0 }, { p: "crate", x: 1, y: 8, lk: "cellstair" }],
  fort_chapel: [{ p: "desk", x: 5, y: 2, lk: "altar_fort" }, { p: "candles", x: 4, y: 2 }, { p: "candles", x: 7, y: 2 }, { p: "bench", x: 2, y: 4 }, { p: "bench", x: 8, y: 4 }, { p: "bench", x: 2, y: 6 }, { p: "bench", x: 8, y: 6 }, { p: "banner", x: 2, y: 0 }, { p: "banner", x: 9, y: 0 }],
  fort_weaver: [{ p: "shelf", x: 1, y: 2, v: 0 }, { p: "shelf", x: 2, y: 2, v: 1 }, { p: "shelf", x: 3, y: 2, v: 2 }, { p: "books", x: 12, y: 2 }, { p: "desk", x: 7, y: 3, lk: "weaverdesk" }, { p: "candles", x: 9, y: 3 },
    { p: "table", x: 11, y: 6, v: 1 }, { p: "chair", x: 10, y: 6 }, { p: "lantern", x: 5, y: 0 }, { p: "lantern", x: 10, y: 0 }, { p: "painting", x: 7, y: 0, v: 1, lk: "weavemap" }],
  fort_tower: [{ p: "crate", x: 1, y: 2 }, { p: "barrel", x: 7, y: 2 }, { p: "lantern", x: 4, y: 0 }, { p: "rack", x: 6, y: 5, lk: "lookout" }],
  fort_mess: [{ p: "fireplace", x: 3, y: 0 }, { p: "cauldron", x: 3, y: 2 }, { p: "table", x: 7, y: 4, v: 1 }, { p: "table", x: 12, y: 4, v: 2 }, { p: "bench", x: 7, y: 6 }, { p: "bench", x: 12, y: 6 },
    { p: "barrel", x: 15, y: 2 }, { p: "barrel", x: 16, y: 2 }, { p: "sack", x: 1, y: 7 }, { p: "jugs", x: 9, y: 2 }],
  fort_store: [{ p: "crate", x: 2, y: 2 }, { p: "crate", x: 3, y: 2, v: 1 }, { p: "barrel", x: 5, y: 2 }, { p: "sack", x: 6, y: 2 }, { p: "shelf", x: 9, y: 2, v: 2, lk: "keystones" }, { p: "shelf", x: 10, y: 2, v: 1, lk: "keystones" },
    { p: "crate", x: 11, y: 5, lk: "storeledger" }, { p: "crate", x: 2, y: 6 }, { p: "sack", x: 3, y: 6 }, { p: "lantern", x: 6, y: 0 }],
  fort_barracks: [{ p: "bed", x: 1, y: 2, v: 0 }, { p: "bed", x: 3, y: 2, v: 0 }, { p: "bed", x: 5, y: 2, v: 0 }, { p: "bed", x: 11, y: 2, v: 0 }, { p: "bed", x: 13, y: 2, v: 0 }, { p: "bed", x: 15, y: 2, v: 0 },
    { p: "table", x: 8, y: 5, v: 1 }, { p: "stool", x: 7, y: 5 }, { p: "rack", x: 16, y: 6 }, { p: "lantern", x: 9, y: 0 }],
  fort_armoury: [{ p: "rack", x: 1, y: 2 }, { p: "rack", x: 2, y: 2 }, { p: "rack", x: 7, y: 2 }, { p: "anvil", x: 4, y: 4 }, { p: "crate", x: 7, y: 6 }, { p: "lantern", x: 4, y: 0 }],
  fort_qm: [{ p: "shelf", x: 1, y: 2, v: 2 }, { p: "shelf", x: 2, y: 2, v: 1 }, { p: "crate", x: 9, y: 2 }, { p: "crate", x: 10, y: 2, v: 1 }, { p: "barrel", x: 1, y: 6 }, { p: "sack", x: 10, y: 6 }, { p: "desk", x: 6, y: 3 }],
  fort_apoth: [{ p: "shelf", x: 1, y: 2, v: 0 }, { p: "herbs", x: 3, y: 0, v: 1 }, { p: "cauldron", x: 7, y: 2 }, { p: "table", x: 5, y: 5, v: 1 }, { p: "jugs", x: 8, y: 6 }],
  fort_smith: [{ p: "forge", x: 1, y: 2 }, { p: "anvil", x: 3, y: 4 }, { p: "tools", x: 5, y: 0 }, { p: "rack", x: 8, y: 2 }, { p: "barrel", x: 9, y: 6 }],
  fort_tailor: [{ p: "cloths", x: 1, y: 2 }, { p: "rack", x: 6, y: 2, lk: "pelts" }, { p: "table", x: 4, y: 4, v: 1 }, { p: "mirror", x: 7, y: 0 }],
  fort_inn: [{ p: "fireplace", x: 6, y: 0 }, { p: "lantern", x: 2, y: 0 }, { p: "lantern", x: 11, y: 0 }, { p: "barrel", x: 1, y: 2 }, { p: "barrel", x: 2, y: 2 }, { p: "table", x: 5, y: 6, v: 1 }, { p: "chair", x: 4, y: 6 },
    { p: "table", x: 10, y: 6, v: 2 }, { p: "chair", x: 9, y: 6 }, { p: "bed", x: 12, y: 2, v: 1 }, { p: "jugs", x: 3, y: 3 }],
  fort_hostel: [{ p: "straw", x: 1, y: 2 }, { p: "straw", x: 3, y: 2 }, { p: "straw", x: 6, y: 2 }, { p: "bed", x: 8, y: 2, v: 0 }, { p: "firewood", x: 1, y: 5 }, { p: "stool", x: 5, y: 5 }],
  fort_fence: [{ p: "crate", x: 1, y: 2 }, { p: "crate", x: 2, y: 2, v: 1 }, { p: "sack", x: 6, y: 2 }, { p: "table", x: 4, y: 4, v: 2 }, { p: "candles", x: 5, y: 3 }],
};
const FORT_ROWS = { fort_inn: { 4: "XKKKKK" + "o".repeat(7) + "X" }, fort_qm: { 4: "XoooKKKKoooX" } };
for (const id in FORT_ROOMS) {
  const r = FORT_ROOMS[id], key = Object.keys(MAP_DEFS.fort.doorNames).find((k) => MAP_DEFS.fort.doorNames[k] === id);
  const [dx, dy] = key.split(",").map(Number), mat = Math.floor(r.w / 2) - (r.w % 2 ? 0 : 1);
  MAP_DEFS[id] = { name: r.name, outside: false, act2: true, rows: ashRoom(r.w, r.h, mat, r.floor || "o", FORT_ROWS[id] || {}), props: FORT_PROPS[id] || [],
    warps: [{ x: mat, y: r.h - 1, to: "fort", tx: dx, ty: dy + 1, dir: "down" }] };
  MAP_DEFS.fort.warps.push({ x: dx, y: dy, to: id, tx: mat, ty: r.h - 2, dir: "up" });
}
/* the holding cells, down a stair from the command post */
MAP_DEFS.fort_cells = { name: "The Holding Cells", outside: false, act2: true, dark: true,
  rows: ["XUUUUUUUUUUX", "XLLLLLLLLLLX", "XoXooXooXooX", "XoXooXooXooX", "XooooooooooX", "XXXXXXXXXXXX"],
  props: [{ p: "straw", x: 3, y: 2 }, { p: "straw", x: 6, y: 2 }, { p: "bones", x: 9, y: 3 }, { p: "lantern", x: 5, y: 0 }, { p: "stool", x: 1, y: 4 }],
  warps: [{ x: 10, y: 4, to: "fort_cmd", tx: 1, ty: 7, dir: "up" }] };
SCRIPTS.look_cellstair = (c) => [fv("narrator", "Behind the crates, a stone stair goes down. A draught comes up it that smells of damp and old straw."),
  { choice: [["Go down to the cells", [{ do: (c) => c.goto("fort_cells", 9, 4, "left") }]], ["Stay up here", []]] }];
/* the undercroft: dark, wet, and the way in from the grate */
MAP_DEFS.fort_under = { name: "The Undercroft", outside: false, act2: true, dark: true,
  rows: ["XUUUUUUUUUUUUUX", "XLLLLLLLLLLLLLX", "XoooooooooooooX", "XoooXXXoooooooX", "mooooXXoooooooX", "XoooooooooooooX", "XXXXXXXXXXXXXXX"],
  props: [{ p: "barrel", x: 6, y: 2 }, { p: "barrel", x: 7, y: 2 }, { p: "sack", x: 9, y: 5 }, { p: "crate", x: 12, y: 2, lk: "understair" }, { p: "bones", x: 2, y: 2 }],
  warps: [{ x: 0, y: 4, to: "os", tx: 30, ty: 25, dir: "left" }] };
SCRIPTS.look_understair = (c) => [fv("narrator", "Steps go up to a trapdoor. Above it, faintly: someone snoring, and the smell of sacking and lamp oil. The storehouse."),
  { choice: [["Go up", [{ do: (c) => c.goto("fort_store", 12, 7, "left") }]], ["Not yet", []]] }];
FORT_PROPS.fort_store.push({ p: "crate", x: 12, y: 7, lk: "storetrap" });
SCRIPTS.look_storetrap = (c) => [fv("narrator", "A trapdoor under a loose crate. It goes down into the undercroft."),
  { choice: [["Go down", [{ do: (c) => c.goto("fort_under", 12, 3, "left") }]], ["Leave it", []]] }];

Object.assign(MAP_DEFS.fort, { looks: {
  fortboard: ["The Fort's notice board. Duty rosters, a list of the week's tolls, a reward for a lost grey mare.", "A neat notice in Arbitrator Icetoe's hand: 'Visitors to the Command Post by day. The Arbitrator regrets he cannot see petitioners after dark.'", "Under it, in another hand: 'He sees them anyway. Knock.'"],
  practicerack: ["Practice blades: wood weighted with lead, and blunted iron for the officers. Every one is notched."],
  dummy: ["A straw man in a sack tunic, stuck through with a hundred practice thrusts. Someone has drawn a face on it with charcoal. It looks like a Vale orc."],
} });
Object.assign(LOOK_TEXT, {
  ulricdesk: ["The Arbitrator's desk: reports squared in neat piles, a seal, a pen, a cold cup of tea. A letter half-written: 'Mother,' and then nothing."],
  maptable: ["A map of the March, pinned flat. The Fort, Greywick, Ashford. Pins of red thread east of the Fort, along the Vale road. More of them than last month, by the holes."],
  altar_fort: ["A clean altar under the Covenant's knot. Candles, a bowl of water, a folded cloth. Everything is very straight."],
  weaverdesk: ["Notes on the Pillar network in a cramped hand: 'Keystone output falls by a fifth per decade untended. Greywick: none issued since the declaration.'"],
  weavemap: ["A great map of the Weave: the Pillars as knots, the threads between them drawn in silver. The south is mostly blank, with a single word: 'Etharis'."],
  lookout: ["From the tower top: the Outskirts white below, the Vale road running east, and far off north, under a lid of cloud, the Frozen Vale.", "Further still, a dark line that might be the coast, and beyond it the Dread Expanse."],
  keystones: ["Shelves of plain wooden boxes, each stamped with the Covenant's knot. Inside, packed in straw: cyan stones the size of a fist, humming very faintly. Pillar Keystones. Dozens of them."],
  storeledger: ["The storehouse ledger: 'Keystones, Pillar, received 40, issued 31.' Below, in pencil: 'Count again Thursday.' Nobody has."],
  pelts: ["Pelts stretched on frames: wolf, fox, boar, and one big white wolf hide with no price on it at all."],
});

/* the Keystone: plain to see, and taken when the stores are quiet */
SCRIPTS.look_keystones = (c) => {
  if (c.flag("fort_keystone")) return [fv("narrator", "One box is a little lighter than the others now. Nobody has noticed. Nobody is going to.")];
  if (!isNightT(c.G.time)) return [fv("narrator", LOOK_TEXT.keystones[0]), fv("narrator", "Two storekeepers are counting sacks at the other end of the room, and one of them keeps glancing your way. Not now.")];
  const want = qs(c.G, "q_keystone") >= 1;
  return [fv("narrator", "The storehouse is dark but for one lamp. The night storekeeper is asleep on a sack of meal, his mouth open."),
    fv("narrator", LOOK_TEXT.keystones[0]),
    { choice: [[want ? "Take one Keystone, for Greywick" : "Take a Keystone", [fv("narrator", "You lift one stone out of its straw and close the lid. It is warm in your hand, and it hums a little louder, as if it knows where it is going."),
      { do: (c) => { c.give("keystone", 1); c.set("fort_keystone"); if (qs(c.G, "q_keystone") === 1) c.set("q_keystone", 2); } }, fv("tessa", "Forty received, thirty-one issued. They'll never miss it.")]],
      ["Leave them", [fv("narrator", "You leave the boxes as they are.")]]] }];
};

/* ---------- people ---------- */
Object.assign(NPC_DEFS, {
  ulric: { name: "Arbitrator Ulric Icetoe", title: "Commander of Fort Frostcrown", look: { skin: 0, hair: 5, beard: true, cloth: 4, outfit: "coat", mood: "neutral", age: true },
    schedule: [{ h: 0, map: "fort_cmd", x: 9, y: 4, w: 0, where: "the Command Post" }] },
  ysolt: { name: "Captain Ysolt Rennick", title: "Master of the training yard", look: { sex: "f", skin: 1, hair: 1, cloth: 4, outfit: "coat", mood: "smile" },
    schedule: [{ h: 0, map: "fort_barracks", x: 9, y: 4, w: 0, where: "the barracks" }, { h: 7, map: "fort", x: 128, y: 44, w: 1, where: "the training yard" }, { h: 19, map: "fort_barracks", x: 9, y: 4, w: 0, where: "the barracks" }] },
  bede: { name: "Quartermaster Bede Marrow", title: "Stores and supply", look: { skin: 2, hair: 2, beard: true, cloth: 4, outfit: "coat", mood: "neutral", age: true },
    schedule: [{ h: 0, map: null }, { h: 7, map: "fort_qm", x: 6, y: 5, w: 0, where: "the quartermaster's" }, { h: 19, map: null }] },
  lisle: { name: "Apothecary Lisle", title: "Fort apothecary", look: { sex: "f", skin: 0, hair: 4, hairStyle: "bun", cloth: 7, apron: "#7a8a6a", mood: "neutral" },
    schedule: [{ h: 0, map: null }, { h: 7, map: "fort_apoth", x: 5, y: 4, w: 0, where: "the apothecary" }, { h: 19, map: null }] },
  dask: { name: "Armourer Dask", title: "Arms and armour", look: { skin: 3, hair: 0, beard: true, cloth: 3, apron: "#4a3a2a", mood: "neutral" },
    schedule: [{ h: 0, map: null }, { h: 7, map: "fort_smith", x: 5, y: 5, w: 0, where: "the market forge" }, { h: 19, map: null }] },
  wenn: { name: "Wenn Tallow", title: "Tailor and furrier", look: { skin: 1, hair: 3, cloth: 5, outfit: "coat", mood: "smile" },
    schedule: [{ h: 0, map: null }, { h: 7, map: "fort_tailor", x: 4, y: 3, w: 0, where: "the tailor's" }, { h: 19, map: null }] },
  orvin: { name: "Chaplain Orvin", title: "The Fort chapel", look: { skin: 1, hair: 5, hood: true, cloth: 4, outfit: "dress", mood: "smile", age: true },
    schedule: [{ h: 0, map: "fort_chapel", x: 6, y: 3, w: 0, where: "the chapel" }] },
  ama: { name: "Ama Brisk", title: "Keeper of the Frost Lantern", look: { sex: "f", skin: 2, hair: 1, hairStyle: "bun", cloth: 1, apron: "#a89878", mood: "smile" },
    schedule: [{ h: 0, map: "fort_inn", x: 3, y: 3, w: 1, where: "the Frost Lantern" }] },
  storek: { name: "Storekeeper", title: "The storehouse", look: { skin: 0, hair: 2, cloth: 4, outfit: "tunic", mood: "neutral" },
    schedule: [{ h: 0, map: "fort_store", x: 4, y: 4, w: 0, where: "the storehouse (asleep)" }, { h: 6, map: "fort_store", x: 4, y: 5, w: 2, where: "the storehouse" }, { h: 20, map: "fort_store", x: 4, y: 4, w: 0, where: "the storehouse (asleep)" }] },
  aurel: { name: "Scholar Aurel Vane", title: "Weaver Hall", look: { skin: 0, hair: 4, cloth: 6, outfit: "coat", mood: "neutral", glasses: true },
    schedule: [{ h: 0, map: null }, { h: 8, map: "fort_weaver", x: 7, y: 5, w: 1, where: "the Weaver Hall" }, { h: 18, map: null }] },
  nettle: { name: "Nettle", title: "", look: { sex: "f", skin: 2, hair: 2, hood: true, cloth: 9, outfit: "coat", mood: "sly" },
    schedule: [{ h: 0, map: "fort_fence", x: 4, y: 3, w: 0, where: "a back room in the lower quarter" }] },
  cook: { name: "Cook Harrow", title: "The mess", look: { skin: 1, hair: 0, cloth: 1, apron: "#c8b898", mood: "neutral" },
    schedule: [{ h: 0, map: "fort_mess", x: 5, y: 3, w: 1, where: "the mess hall" }] },
  prisoner: { name: "The prisoner", title: "Holding cell", look: { skin: 2, hair: 2, hood: true, cloth: 9, outfit: "coat", mood: "neutral" },
    schedule: [{ h: 0, map: "fort_cells", x: 7, y: 3, w: 0, where: "the cells" }] },
  ftguard1: { name: "Covenant soldier", title: "Square watch", look: { skin: 0, hair: 1, helm: true, cloth: 4, outfit: "coat", mood: "neutral" },
    schedule: [{ h: 0, map: "fort", x: 70, y: 50, w: 4, where: "Pillar Square" }] },
  ftguard2: { name: "Covenant soldier", title: "Market watch", look: { skin: 2, hair: 0, helm: true, cloth: 4, outfit: "coat", mood: "neutral" },
    schedule: [{ h: 0, map: "fort", x: 76, y: 74, w: 3, where: "the market" }] },
  ftguard3: { name: "Covenant crossbowman", title: "North lane", look: { skin: 1, hair: 1, helm: true, cloth: 4, outfit: "coat", mood: "neutral" },
    schedule: [{ h: 0, map: "fort", x: 100, y: 22, w: 4, where: "the north lane" }] },
  ftrecruit: { name: "Recruit", title: "Training yard", look: { skin: 2, hair: 3, cloth: 4, outfit: "tunic", mood: "neutral" },
    schedule: [{ h: 0, map: "fort_barracks", x: 4, y: 5, w: 1, where: "the barracks" }, { h: 7, map: "fort", x: 120, y: 43, w: 2, where: "the training yard" }, { h: 19, map: "fort_barracks", x: 4, y: 5, w: 1, where: "the barracks" }] },
  ftworker: { name: "A lower-quarter woman", title: "", look: { sex: "f", skin: 1, hair: 2, hood: true, cloth: 1, outfit: "dress", mood: "neutral" },
    schedule: [{ h: 0, map: null }, { h: 7, map: "fort", x: 20, y: 68, w: 3, where: "the lower quarter" }, { h: 19, map: null }] },
  ftsentry: { name: "Tower sentry", title: "The north tower", look: { skin: 0, hair: 0, helm: true, cloth: 4, outfit: "coat", mood: "neutral" },
    schedule: [{ h: 0, map: "fort_tower", x: 4, y: 4, w: 0, where: "the north tower" }] },
});
Object.assign(NPC_DEFS, {
  fthauler: { name: "A hauler", title: "The market", look: { skin: 1, hair: 0, cloth: 3, outfit: "tunic", mood: "neutral" },
    schedule: [{ h: 0, map: null }, { h: 7, map: "fort", x: 85, y: 83, w: 0, where: "the market storerooms" }, { h: 19, map: null }] },
  ftsitter: { name: "A worker", title: "The lower quarter", look: { skin: 2, hair: 2, cloth: 1, outfit: "tunic", mood: "neutral" },
    schedule: [{ h: 0, map: "fort", x: 21, y: 69, w: 0, where: "by the fire in the lower quarter" }] },
});
const FORT_NPCS = ["ulric", "ysolt", "bede", "lisle", "dask", "wenn", "orvin", "ama", "storek", "aurel", "nettle", "cook", "prisoner", "ftguard1", "ftguard2", "ftguard3", "ftrecruit", "ftworker", "ftsentry", "fthauler", "ftsitter"];
for (const k of FORT_NPCS) { NPC_DEFS[k].id = k; NPC_DEFS[k].act2 = true; }
Object.assign(CHIBI_MAP, { ulric: "a2_ulric", ysolt: "a2_ysolt", ftguard1: "a2_covknight", ftguard2: "a2_covknight", ftguard3: "a2_covxbow", ftsentry: "a2_covxbow" });

/* ---------- shops ---------- */
Object.assign(SHOPS, {
  fort_quartermaster: { name: "The Quartermaster's", keeper: "Bede", stock: ["bandage", "poultice", "spoultice", "gpoultice", "btonic", "antidote", "torchoil", "ration"], bonus: ["arms"], mult: 1, buy: 1, purse: 400 },
  fort_armourer: { name: "The Market Forge", keeper: "Dask", stock: ["fortblade", "leyblade", "frostcrown", "fortplate", "sallet", "greathelm", "leycharm", "scholarseal"], bonus: ["arms", "salvage"], only: ["arms", "salvage"], mult: 1, buy: 1, purse: 300 },
  fort_tailor: { name: "Tailor and Furrier", keeper: "Wenn", stock: ["paddedcoat", "ringmail", "brigandine", "leathercap"], bonus: ["hide"], only: ["arms", "hide", "silk"], mult: 1, buy: 1.1, purse: 200 },
  fort_apothecary: { ...SHOPS.fort_apothecary, keeper: "Lisle" },
  fort_fence: { ...SHOPS.fort_fence, keeper: "Nettle" },
});

/* ---------- what they say ---------- */
const FORT_HEAL = (c) => c.G.flags.fort_heal_day === c.G.day;
Object.assign(SCRIPTS, {
  bede: (c) => [fv("bede", c.rot("bede", ["Supplies by the book. Prices by the book. I pay fair for anything with an edge on it.", "Everything that comes into this Fort goes past my ledger. Everything.", "You're not a soldier. Good. Soldiers never pay."])), { shop: "fort_quartermaster" }],
  dask: (c) => [fv("dask", c.rot("dask", ["Fort steel. Best you'll find north of the river, and the price says so.", "Bring me salvage, I'll pay for it. The Vale's leavings make good nails."])), { shop: "fort_armourer" }],
  wenn: (c) => [fv("wenn", c.rot("wenn", ["Coats, caps, and the hides to make them. I'll buy pelts. Good ones.", "That white wolf on the frame? Somebody else's kill. I'm still hoping they'll come back for it."])), { shop: "fort_tailor" }],
  lisle: (c) => [fv("lisle", c.rot("lisle", ["Tonics, salves, antidotes. Sealed and dated.", "Bring me herbs and I'll pay. Moon-cap, yarrow, anything with a root."])), { shop: "fort_apothecary" }],
  nettle: (c) => [fv("nettle", c.rot("nettle", ["Anything, for half. No questions. That's the deal.", "You didn't come in by the gate, did you? No. Nobody who finds this room does."])), { shop: "fort_fence" }],
  orvin: (c) => FORT_HEAL(c) ? [fv("orvin", "Rest a moment. The Weave holds. Come back tomorrow if you need me.")]
    : [fv("orvin", "Travellers. Sit. Let me see to you."), { do: (c) => { c.heal(); c.G.flags.fort_heal_day = c.G.day; } }, fv("narrator", "The chaplain's hands are warm and steady. The party is mended."), fv("orvin", "No charge. The Arbitrator insists on it.")],
  ama: (c) => [fv("ama", `A bed at the Frost Lantern: ${INN_PRICE} coppers. The fire's the best in the Fort and the soup is the second best.`),
    c.G.coins >= INN_PRICE ? { choice: [[isNightT(c.G.time) ? "Sleep until morning" : "Sleep until nightfall", [{ do: (c) => { c.coins(-INN_PRICE); c.innRest(true); } }]], ["Just rest a while", [{ do: (c) => { c.coins(-INN_PRICE); c.innRest(false); } }]], ["\"Not tonight.\"", []]] }
      : fv("ama", "You've not got it. The hostel in the lower quarter is cheaper.")],
  cook: (c) => [fv("cook", c.rot("cook", ["Mess is for the garrison. You can have bread, if you're quick. Go on.", "Kitchen runoff goes out under the west wall. Don't ask me why everyone wants to know that lately.", "Six hundred men on salt fish. I'd give my right arm for an onion."]))],
  storek: (c) => isNightT(c.G.time) ? [fv("narrator", "The storekeeper is asleep on a sack of meal. He mutters something about Thursday.")]
    : [fv("storek", c.rot("storek", ["Stores are closed to visitors. Requisitions go through the Quartermaster.", "Keystones? We've boxes of them. Nobody ever asks for them. Greywick used to, before."]))],
  aurel: (c) => [fv("aurel", c.rot("aurel", ["The Weaver Hall keeps the Pillar records. Every stone, every Keystone, every flicker.", "Old Tongue? We read it. We do not study it here. The Arbitrator is strict about that, and he's right to be.", "There are Pillars in the south older than the Covenant. The records stop where the Etharis road begins."]))],
  ftguard1: (c) => [fv("ftguard1", c.rot("ftguard1", ["Keep the peace in the square.", "The Arbitrator's in the Command Post, north end. He'll see you if you've business.", "Studying? In the Fort? Not unless you want to see the cells."]))],
  ftguard2: (c) => [fv("ftguard2", c.rot("ftguard2", ["Market's open till dusk.", "Mind your purse. The lower quarter's light-fingered."]))],
  ftguard3: (c) => [fv("ftguard3", c.rot("ftguard3", ["North lane. Command Post on your left, the tower up on the right.", "Vale scouts on the east road again. Third time this month."]))],
  ftrecruit: (c) => [fv("ftrecruit", c.rot("ftrecruit", ["Captain Rennick put me on my back nine times this morning. Nine. She was eating an apple.", "I joined for the boots. The boots are very good."]))],
  ftworker: (c) => [fv("ftworker", c.rot("ftworker", ["Inside the walls, aye. Still not inside, if you follow me. They need us to scrub and haul. They don't need to know our names.", "My boy wants to be a soldier. I want him to want something else."]))],
  fthauler: (c) => [fv("fthauler", c.rot("fthauler", ["Salt fish. Forty crates of it. Mind your feet.", "If the quartermaster asks, I've been at this since dawn."]))],
  ftsitter: (c) => [fv("ftsitter", c.rot("ftsitter", ["Sit, if you like. Fire's free. Everything else in here costs.", "Twelve hours hauling for the garrison. They don't eat the fish themselves, you know. They sell it south."]))],
  ftsentry: (c) => [fv("ftsentry", "Up the stair, if you want the view. Don't touch the horn."), fv("narrator", LOOK_TEXT.lookout[0])],
});

/* ---------- Arbitrator Ulric Icetoe ---------- */
SCRIPTS.ulric = (c) => {
  const f = c.G.flags, night = isNightT(c.G.time);
  if (!f.ulric_met) {
    const steps = [
      fv("narrator", night ? "The Arbitrator is still at his desk, a lamp at his elbow and his coat over the chair. He looks up, and does not seem surprised." : "A tall man in Covenant grey stands at a map table, reading a report. He finishes it before he looks up."),
      fv("ulric", "Ulric Icetoe. I keep this Fort. And you are the people who came up the March road in winter, which makes you either foolish or sent."),
    ];
    if (c.G.items.covletter > 0) steps.push(fv("narrator", "You hand over Voidsong's letter. He breaks the seal with his thumb and reads it twice."),
      fv("ulric", "Curate Voidsong writes that you mended Ashford's Pillar, and turned out the people breaking it. She writes very little about anyone. This is a great deal."),
      { do: (c) => { c.take("covletter", 1); c.set("ulric_letter"); } });
    else steps.push(fv("ulric", "No letter? Then I'll judge you myself. That takes longer, and I am a patient man."));
    steps.push(
      fv("ulric", "You want to join the Covenant. Or someone wants it for you. Either way, it is not given. It is earned, and I set the tasks."),
      fv("ulric", "Two of them. The second will wait. The first is simpler, and I would rather not send a soldier."),
      fv("narrator", "He takes a sealed letter from the drawer, and holds it a moment longer than he needs to."),
      fv("ulric", "Take this to Old Maud, in the North Woods past Oakhaven. She is... she will know who it is from. Bring back whatever she gives you."),
      fv("tessa", "Maud? Our Maud? The witch in the woods?"),
      fv("ulric", "She was not always called that. Go carefully. Oakhaven has had a hard winter."),
      { do: (c) => { c.give("maudletter", 1); c.set("ulric_met"); c.set("q_maud", 1); } },
      fv("narrator", "You received Ulric's letter."),
      fv("ulric", "One more thing. You carry yourself like someone with a book in their coat. I don't want to know. Don't study it inside my walls."));
    return steps;
  }
  if (qs(c.G, "q_maud") === 1) return [fv("ulric", c.rot("ulric", ["Maud. The North Woods, past Oakhaven. The road home is open to you when you're ready.", "I write to her every winter. She never writes back. Perhaps she will, by your hand.", "If you meet Captain Rennick in the yard, let her try you. It will tell me more than any letter."]))];
  return [fv("ulric", "Go well.")];
};

/* ---------- the captured Purifier (Ulric allows it once Ashford's sabotage is settled) ---------- */
const PRISONER_SAYS = [
  [true, "\"We burn Pillars because they spread magic. Every stone is a needle, and the Weave is the thread, and you're all sewn up in it.\""],
  [true, "\"There was a camp by Ashford. You know that. You were the ones who broke it.\""],
  [false, "\"There are no more of us. That camp was the last.\""],
  [true, "\"South. There are cells in the south. More of us than you'd think.\""],
  [false, "\"I've never heard the name Kellan Vex.\""],
  [false, "\"The Covenant feeds us well down here. No complaints.\""],
];
SCRIPTS.prisoner = (c) => {
  if (qs(c.G, "q_flicker") < 5) return [fv("narrator", "A hooded figure sits against the wall of the cell and does not look up. A guard at the stair shakes his head: not without the Arbitrator's leave.")];
  const ver = c.flag("primer_read");
  const steps = [fv("narrator", "A Purifier scout, caught on the March road. Thin, ash on the cuffs, eyes that do not stay still. They look at you, then at the bundle in your coat, and smile."),
    fv("prisoner", "The ones from Ashford. Come to look at me?")];
  if (ver && !c.flag("prisoner_read")) steps.push(fv("narrator", "Under your breath, too quiet for the guard: Ver. The tome warms against your ribs, and the prisoner's words come to you with a weight to them, true or hollow."));
  for (const [truth, line] of PRISONER_SAYS) {
    steps.push(fv("prisoner", line));
    if (ver) steps.push(fv("narrator", truth ? "(Ver: this rings true.)" : "(Ver: hollow. A lie.)"));
  }
  steps.push(ver ? fv("tessa", "So there are more of them, there's something about Kellan Vex they won't say, and the soup's bad. Useful.") : fv("tessa", "I don't believe half of that. I just don't know which half."),
    { do: (c) => { c.set("prisoner_talked"); if (ver) c.set("prisoner_read"); } });
  return steps;
};

/* ---------- Captain Ysolt Rennick and the sparring ring ---------- */
const SPAR_ROSTER = [
  ["sp_recruit", "Recruit Tobin", 30], ["sp_corporal", "Corporal Ashe", 40], ["sp_initiate", "Initiate Merrow (fire)", 55],
  ["sp_sergeant", "Sergeant Kell", 65], ["sp_curate", "Curate Iselle (Weaver)", 80],
];
SCRIPTS.ysolt = (c) => {
  if (isNightT(c.G.time)) return [fv("ysolt", "Yard's closed after dark. Come back in daylight and I'll find you somebody to lose to.")];
  const steps = [];
  if (!c.flag("ysolt_met")) steps.push(fv("ysolt", "Captain Rennick. I run the yard. You're the ones the Arbitrator is curious about."),
    fv("ysolt", "Rules: practice blades, no killing, I call it when it's done. Beat someone the first time and the Fort pays you. After that it's practice, and you pay with bruises."),
    { do: (c) => c.set("ysolt_met") });
  const done = SPAR_ROSTER.filter(([k]) => c.flag("spar_" + k)).length;
  steps.push(fv("ysolt", done === SPAR_ROSTER.length ? "You've beaten my whole roster. Don't tell them I said so, but I'm impressed." : done ? "Back for more? Pick one." : "Pick an opponent."),
    { choice: [...SPAR_ROSTER.map(([k, name, prize]) => [`${name}${c.flag("spar_" + k) ? " (beaten)" : `, ${prize} coppers`}`, [{ spar: { foes: [k], key: k, prize: c.flag("spar_" + k) ? 0 : prize } }]]), ["\"Not today.\"", [fv("ysolt", "Then get out of my ring.")]]] });
  return steps;
};

/* ---------- arriving ---------- */
QUEST_ENTER_HOOKS.push((G, id) => {
  if (id === "fort" && !G.flags.reached_fort) {
    G.flags.reached_fort = true; G.respawn = G.respawn || "fort";
    return [{ who: "narrator", t: "Fort Frostcrown. Inside the walls the snow is swept into banks, the streets are paved, and everything is moving: soldiers in grey, carts, smoke from a hundred chimneys." },
      { who: "narrator", t: "Somewhere east, a drill sergeant is counting. Somewhere south, a market is shouting. In the middle of it all, a Pillar burns steady and bright." },
      { who: "tessa", t: "So this is the Covenant when it's at home. It's... tidier than I expected." },
      ...(G.partyIds && G.partyIds.includes("hakon") ? [{ who: "hakon", t: "Tidy, and a great many swords. Keep your book out of sight." }] : [])];
  }
  return null;
});

/* ---------- the Keystone goes home to Greywick ---------- */
{
  const k = ASH_QUESTS.find((q) => q[0] === "q_keystone");
  if (k) { k[2] = ["", "Bring a Pillar Keystone from Fort Frostcrown", "Take the Keystone to Gideon in Greywick"]; k[3] = ["", "The Fort's storehouse, in the west stores district. Quieter at night", "The Lamp House, Greywick"]; }
  const m = ["q_maud", "A Letter for Maud", ["", "Take Ulric's letter to Old Maud in the North Woods"], ["", "Oakhaven's east gate, then the North Woods trail"]];
  if (!ASH_QUESTS.find((q) => q[0] === "q_maud")) ASH_QUESTS.push(m);
}
const _gideon0 = SCRIPTS.gideon;
SCRIPTS.gideon = (c) => {
  if (qs(c.G, "q_keystone") === 2 && c.G.items.keystone > 0) return [
    fv("gideon", "Is that... it is. Let me see it. Gods, it's warm."),
    fv("narrator", "Gideon carries the Keystone out to the square in both hands. He sets it into the Pillar's socket, and turns it, once."),
    fv("narrator", "The flicker stops. The light climbs, steady and white, and up and down the street shutters open, one by one."),
    { do: (c) => { c.take("keystone", 1); c.set("gw_keystone"); c.set("q_keystone", 3); c.coins(120); act2Ensure(c.G).pillars.gw = true; c.refreshWorld(); } },
    fv("gideon", "You took that from under the Covenant's nose and gave it back to the people it was made for. The Unbound won't forget that. Neither will I."),
    fv("narrator", "120 coppers."),
    fv("tessa", "Look at them. They're coming out to see it."),
  ];
  return _gideon0 ? _gideon0(c) : [];
};
