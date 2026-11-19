/* ------------------------------------------------------------------ */
/* Aurelm (Act 3): the Covenant's vault city on the Mere, in lockdown  */
/* after the theft. Its rooms and people; the skirmish at the gate     */
/* square, fought by the party; the Thief's Road through the old       */
/* culvert; the Vaultwarden, who opens the Crags and holds the letter  */
/* of passage. The maps are in 04z5_aurelm.js.                         */
/* ------------------------------------------------------------------ */

/* ---------- rooms ---------- */
const AU_DOORS = {
  au_barracks: { map: "au_out", door: [37, 16], name: "The Barracks", w: 18, h: 10, floor: "s" },
  au_chapter: { map: "au_out", door: [135, 16], name: "The Purifier Chapterhouse", w: 16, h: 10, floor: "s" },
  au_exchange: { map: "au_out", door: [63, 13], name: "The Traders' Exchange", w: 16, h: 10 },
  au_post: { map: "au_out", door: [103, 9], name: "The Gate-Post", w: 10, h: 8, floor: "s" },
  au_inn: { map: "au_out", door: [44, 31], name: "The Drowned Bell", w: 16, h: 10 },
  au_chapel: { map: "au_out", door: [62, 30], name: "The Chapel of the Weave", w: 14, h: 11, floor: "s" },
  au_archive: { map: "au_out", door: [107, 34], name: "The Archive House", w: 18, h: 11, floor: "s" },
  au_warden: { map: "au_vault", door: [111, 17], name: "The Warden's Hall", w: 20, h: 12, floor: "s" },
  au_cloister: { map: "au_vault", door: [41, 17], name: "The Seal-Keepers' Cloister", w: 18, h: 11, floor: "s" },
};
const AU_PROPS = {
  au_barracks: [{ p: "rack", x: 1, y: 2, lk: "auspears" }, { p: "rack", x: 2, y: 2 }, { p: "bed", x: 13, y: 2, v: 1 }, { p: "bed", x: 15, y: 2, v: 1 }, { p: "table", x: 6, y: 5, v: 2, lk: "lockdownmap" }, { p: "chair", x: 5, y: 5 }, { p: "chair", x: 8, y: 5 },
    { p: "barrel", x: 1, y: 7 }, { p: "crate", x: 16, y: 7 }, { p: "lantern", x: 4, y: 0 }, { p: "lantern", x: 13, y: 0 }],
  au_chapter: [{ p: "candles", x: 7, y: 2 }, { p: "candles", x: 8, y: 2 }, { p: "cauldron", x: 2, y: 2, lk: "burnyard" }, { p: "cauldron", x: 13, y: 2, lk: "burnyard" }, { p: "books", x: 1, y: 6, lk: "purtract" },
    { p: "table", x: 6, y: 5, v: 0 }, { p: "chair", x: 5, y: 5 }, { p: "chair", x: 9, y: 5 }, { p: "shelf", x: 14, y: 6, v: 1 }],
  au_exchange: [{ p: "rack", x: 1, y: 2 }, { p: "shelf", x: 2, y: 2, v: 2 }, { p: "anvil", x: 5, y: 3 }, { p: "crate", x: 9, y: 2 }, { p: "sack", x: 11, y: 2 }, { p: "barrel", x: 14, y: 2 },
    { p: "table", x: 6, y: 6, v: 0 }, { p: "baskets", x: 10, y: 6 }, { p: "lantern", x: 4, y: 0 }, { p: "lantern", x: 11, y: 0 }],
  au_post: [{ p: "desk", x: 3, y: 2, lk: "searchlog" }, { p: "chair", x: 4, y: 3 }, { p: "rack", x: 8, y: 2, lk: "auspears" }, { p: "crate", x: 1, y: 5, lk: "searched" }],
  au_inn: [{ p: "fireplace", x: 7, y: 0 }, { p: "lantern", x: 2, y: 0 }, { p: "lantern", x: 13, y: 0 }, { p: "barrel", x: 1, y: 2 }, { p: "barrel", x: 2, y: 2 }, { p: "jugs", x: 4, y: 2 },
    { p: "table", x: 5, y: 6, v: 1 }, { p: "chair", x: 4, y: 6 }, { p: "chair", x: 7, y: 6 }, { p: "table", x: 10, y: 6, v: 2 }, { p: "chair", x: 9, y: 6 }, { p: "chair", x: 12, y: 6 }, { p: "bed", x: 14, y: 2, v: 1 }, { p: "sack", x: 1, y: 7, lk: "fish" }],
  au_chapel: [{ p: "candles", x: 6, y: 2 }, { p: "candles", x: 7, y: 2 }, { p: "bench", x: 3, y: 5 }, { p: "bench", x: 8, y: 5 }, { p: "bench", x: 3, y: 7 }, { p: "bench", x: 8, y: 7 }, { p: "painting", x: 6, y: 0, v: 1 }],
  au_archive: [{ p: "books", x: 1, y: 2 }, { p: "books", x: 2, y: 2 }, { p: "books", x: 3, y: 2 }, { p: "books", x: 13, y: 2 }, { p: "books", x: 14, y: 2 }, { p: "books", x: 15, y: 2 }, { p: "desk", x: 8, y: 3, lk: "copyledger" },
    { p: "chair", x: 9, y: 4 }, { p: "table", x: 4, y: 7, v: 0 }, { p: "candles", x: 5, y: 7 }, { p: "shelfw", x: 12, y: 7 }, { p: "lantern", x: 7, y: 0 }],
  au_warden: [{ p: "painting", x: 9, y: 0, v: 1 }, { p: "desk", x: 9, y: 3, lk: "wardendesk" }, { p: "chair", x: 10, y: 4 }, { p: "shelf", x: 1, y: 2, v: 1 }, { p: "shelf", x: 2, y: 2, v: 2 }, { p: "books", x: 17, y: 2 },
    { p: "candles", x: 6, y: 2 }, { p: "candles", x: 13, y: 2 }, { p: "table", x: 3, y: 8, v: 0 }, { p: "lantern", x: 4, y: 0 }, { p: "lantern", x: 15, y: 0 }],
  au_cloister: [{ p: "candles", x: 8, y: 2, lk: "sealword" }, { p: "candles", x: 9, y: 2, lk: "sealword" }, { p: "bench", x: 3, y: 5 }, { p: "bench", x: 12, y: 5 }, { p: "bed", x: 1, y: 7, v: 1 }, { p: "bed", x: 16, y: 7, v: 1 }, { p: "books", x: 15, y: 2 }],
};
for (const id in AU_DOORS) {
  const r = AU_DOORS[id], mat = Math.floor(r.w / 2) - (r.w % 2 ? 0 : 1);
  MAP_DEFS[id] = { name: r.name, outside: false, act2: true, act3: true, rows: ashRoom(r.w, r.h, mat, r.floor || "o"), props: AU_PROPS[id] || [],
    warps: [{ x: mat, y: r.h - 1, to: r.map, tx: r.door[0], ty: r.door[1] + 1, dir: "down" }] };
  MAP_DEFS[r.map].warps.push({ x: r.door[0], y: r.door[1], to: id, tx: mat, ty: r.h - 2, dir: "up" });
}
const AU_LOOKS = {
  door: ["Locked, and a curfew notice nailed to it.", "Shuttered. Someone inside goes very quiet when you knock.", "Locked. A chalk mark on the door: SEARCHED."],
  gate_au_in: ["The north gate, barred from inside, with soldiers on the walk above. Nobody leaves Aurelm while the lockdown holds. You might, with the Covenant's leave."],
  wall_au_in: ["Aurelm's wall: old grey stone, older than the Covenant's flag on it."],
  gate_au_vin: ["The Warden's Gate, from the inside."],
  wall_au_vin: ["The inner wall, higher than the outer one. Whatever Aurelm keeps, it keeps it in here."],
};
MAP_DEFS.au_out.looks = Object.assign({}, ETH_LOOKS, AU_LOOKS);
MAP_DEFS.au_vault.looks = Object.assign({}, ETH_LOOKS, AU_LOOKS);
Object.assign(LOOK_TEXT, {
  hallcart: ["A family's cart, loaded with everything they own. Someone has daubed a grey hand on the side in ash: the Purifiers' mark for 'tainted'."],
  searched: ["Crates, broken open at the gate and nailed back shut, badly. Every one is chalked SEARCHED."],
  aufountain: ["The Exchange fountain. A stone Archon holds a key, not a sword. The water has been shut off for the lockdown."],
  aunotices: ["Notices: CURFEW AT DUSK. NO BOATS. ALL LOSSES TO BE REPORTED AT THE BARRACKS. And in a different hand: THE COVENANT CANNOT EVEN KEEP ITS OWN DOOR SHUT. THE PURIFIERS WILL."],
  burnyard: ["A firepot of Purifier wax, banked and smouldering. The smell is sweet, and wrong."],
  fish: ["A sack of salt fish, salted in the spring. No boats have gone out since the theft, and it shows."],
  lockdownmap: ["A map of Aurelm pinned with markers: every gate, every guard, every searched house. The harbour is marked SECURE. Nobody has marked the sluice at all."],
  purtract: ["Purifier tracts. 'The Word is a Wound.' 'What the Covenant Will Not Burn.' 'On the Lethal Mercy of Fire.' You put them down again."],
  searchlog: ["The gate-post's search log, months thick: the lockdown's been on since the spring. Every cart, every bag, every name. Not one entry for the night of the theft. Nobody came through the gate that night."],
  copyledger: ["The copy-ledger: every record copied from Verrin's Registry and archive, and where the copy went. Most say 'Archive House'. A few, in red: 'Vault, sealed stacks'."],
  wardendesk: ["The Vaultwarden's desk, very neat. One drawer is locked. A list on top, with one line struck through so hard the pen went through the paper."],
  sealword: ["Two candles before a bare stone. The seal-keepers kneel here in turns, night and day, saying the same word under their breath, over and over."],
  auspears: ["Covenant spears, racked and oiled. Half the rack is empty: the rest are on the walls."],
});
ITEMS.blackthread = { name: "Knotted black thread", quest: true, desc: "Found by the cut grate under the Vault Ward: thread knotted three times, like the Unbound's red thread, but dyed black. Whoever left it wanted it found." };
ITEMS.sealstone = { name: "The Sealstone", quest: true, desc: "A palm-sized stone, cold as well water, cut with a single word. The Vaultwarden needs it to make the Vault's seal whole again." };
ITEMS.capletter = { name: "Letter of passage", quest: true, desc: "Under the Vaultwarden's seal: the bearer and companions are to be admitted to the Capital without let or question." };
Object.assign(CHEST_LOOT, { c_au_culvert: [55, { gpoultice: 1, firepot: 1 }] });

/* ---------- people ---------- */
const AU_SKIRM = (f) => !!f.au_skirm_won;
Object.assign(NPC_DEFS, {
  vosk: { name: "Captain Brenner Vosk", title: "Captain of the Aurelm watch", look: { skin: 2, hair: 1, beard: true, helm: true, cloth: 4, outfit: "coat", mood: "neutral" },
    schedule: [{ h: 0, map: "au_barracks", x: 8, y: 7, w: 1, where: "the barracks" }] },
  marrow: { name: "Vaultwarden Odile Marrow", title: "Keeper of the Vault", look: { sex: "f", skin: 0, hair: 5, hairStyle: "bun", cloth: 4, outfit: "coat", mood: "neutral", age: true },
    schedule: [{ h: 0, map: "au_warden", x: 10, y: 6, w: 1, where: "the Warden's Hall" }] },
  caddock: { name: "Prior Caddock Stray", title: "Of the Purifiers", look: { skin: 0, hair: 0, hood: true, cloth: 9, outfit: "coat", mood: "sly" },
    schedule: [{ h: 0, map: "au_chapter", x: 7, y: 4, w: 1, where: "the chapterhouse" }] },
  corse: { name: "Brother Corse", title: "Purifier", look: { skin: 1, hair: 1, hood: true, cloth: 9, outfit: "coat", mood: "neutral" },
    schedule: [{ h: 0, map: "au_out", x: 150, y: 33, w: 3, where: "the Ashen Row" }] },
  aupell: { name: "Archivist Pell", title: "Keeper of the Archive House", look: { skin: 1, hair: 5, cloth: 2, outfit: "coat", mood: "neutral", glasses: true, age: true },
    schedule: [{ h: 0, map: "au_archive", x: 8, y: 5, w: 1, where: "the Archive House" }] },
  auwenna: { name: "Sister Wenna", title: "Seal-keeper", look: { sex: "f", skin: 2, hair: 4, hood: true, cloth: 0, outfit: "dress", mood: "neutral" },
    schedule: [{ h: 0, map: "au_cloister", x: 8, y: 5, w: 1, where: "the cloister" }] },
  anselm: { name: "Father Anselm", title: "Chapel of the Weave", look: { skin: 1, hair: 5, cloth: 0, outfit: "coat", mood: "neutral", age: true },
    schedule: [{ h: 0, map: "au_chapel", x: 6, y: 4, w: 1, where: "the chapel" }] },
  gannet: { name: "Harl Gannet", title: "Keeper of the Drowned Bell", look: { skin: 2, hair: 2, beard: true, cloth: 3, apron: "#5a4a3a", mood: "smile" },
    schedule: [{ h: 0, map: "au_inn", x: 3, y: 4, w: 1, where: "the Drowned Bell" }] },
  neve: { name: "Neve Sallow", title: "Harbourmaster", look: { sex: "f", skin: 1, hair: 2, cloth: 3, outfit: "coat", mood: "neutral" },
    schedule: [{ h: 0, map: "au_out", x: 34, y: 33, w: 1, where: "the harbour" }, { h: 20, map: "au_inn", x: 11, y: 5, w: 0, where: "the Drowned Bell" }] },
  augull: { name: "Gull", title: "Fisher's boy", child: true, look: { skin: 2, hair: 3, cloth: 1, outfit: "tunic", mood: "smile", child: true },
    schedule: [{ h: 0, map: null }, { h: 7, map: "au_out", x: 26, y: 26, w: 3, where: "the jetties" }, { h: 19, map: null }] },
  hollis: { name: "Hollis Vey", title: "Traders' Exchange", look: { skin: 0, hair: 1, cloth: 5, apron: "#4a3a2a", mood: "smile" },
    schedule: [{ h: 0, map: "au_exchange", x: 7, y: 4, w: 1, where: "the Exchange" }] },
  hallmum: { name: "Bryony Halloran", title: "Of the burned cart", look: { sex: "f", skin: 1, hair: 3, hood: true, cloth: 0, outfit: "dress", mood: "neutral" },
    schedule: [{ h: 0, map: "au_out", x: 95, y: 8, w: 0, where: "by her cart" }] },
  hallkid: { name: "Tam Halloran", title: "", child: true, look: { skin: 1, hair: 3, cloth: 1, outfit: "tunic", mood: "neutral", child: true },
    schedule: [{ h: 0, map: "au_out", x: 96, y: 9, w: 0, where: "by the cart" }] },
  aupur1: { name: "Purifier", title: "At the gate square", look: { skin: 1, hair: 1, hood: true, cloth: 9, outfit: "coat", mood: "sly" },
    schedule: [{ h: 0, map: "au_out", x: 88, y: 8, w: 0, where: "the gate square" }], flagSched: [{ when: AU_SKIRM, e: { h: 0, map: null } }] },
  aupur2: { name: "Purifier", title: "At the gate square", look: { skin: 0, hair: 0, hood: true, cloth: 9, outfit: "coat", mood: "neutral" },
    schedule: [{ h: 0, map: "au_out", x: 91, y: 9, w: 0, where: "the gate square" }], flagSched: [{ when: AU_SKIRM, e: { h: 0, map: null } }] },
  aupur3: { name: "Purifier Brand-Sergeant", title: "At the gate square", look: { skin: 2, hair: 2, hood: true, beard: true, cloth: 9, outfit: "coat", mood: "sly" },
    schedule: [{ h: 0, map: "au_out", x: 90, y: 7, w: 0, where: "the gate square" }], flagSched: [{ when: AU_SKIRM, e: { h: 0, map: null } }] },
  ausarge: { name: "Covenant sergeant", title: "The gate square", look: { skin: 1, hair: 3, helm: true, cloth: 4, outfit: "coat", mood: "neutral" },
    schedule: [{ h: 0, map: "au_out", x: 87, y: 9, w: 0, where: "the gate square" }] },
  tamsin: { name: "Old Tamsin", title: "The Ashen Row", look: { sex: "f", skin: 0, hair: 5, hood: true, cloth: 0, outfit: "dress", mood: "neutral", age: true },
    schedule: [{ h: 0, map: "au_out", x: 158, y: 44, w: 1, where: "the Ashen Row" }] },
  augate1: { name: "Covenant soldier", title: "The north gate", look: { skin: 1, hair: 1, helm: true, cloth: 4, outfit: "coat", mood: "neutral" },
    schedule: [{ h: 0, map: "au_out", x: 80, y: 4, w: 0, where: "the gate" }] },
  augate2: { name: "Covenant soldier", title: "The north gate", look: { skin: 2, hair: 0, helm: true, cloth: 4, outfit: "coat", mood: "neutral" },
    schedule: [{ h: 0, map: "au_out", x: 89, y: 4, w: 0, where: "the gate" }] },
  auward1: { name: "Warden's guard", title: "The Warden's Gate", look: { skin: 0, hair: 1, helm: true, cloth: 4, outfit: "coat", mood: "neutral" },
    schedule: [{ h: 0, map: "au_out", x: 82, y: 57, w: 0, where: "the Warden's Gate" }] },
  auward2: { name: "Warden's guard", title: "The Warden's Gate", look: { skin: 2, hair: 2, helm: true, cloth: 4, outfit: "coat", mood: "neutral" },
    schedule: [{ h: 0, map: "au_out", x: 87, y: 57, w: 0, where: "the Warden's Gate" }] },
  keeper1: { name: "Seal-keeper", title: "At the Vault doors", look: { skin: 1, hair: 0, hood: true, cloth: 0, outfit: "coat", mood: "neutral" },
    schedule: [{ h: 0, map: "au_vault", x: 81, y: 39, w: 0, where: "the Vault doors" }] },
  keeper2: { name: "Seal-keeper", title: "At the Vault doors", look: { sex: "f", skin: 2, hair: 4, hood: true, cloth: 0, outfit: "dress", mood: "neutral" },
    schedule: [{ h: 0, map: "au_vault", x: 88, y: 39, w: 0, where: "the Vault doors" }] },
  aufolk1: { name: "A townswoman", title: "", look: { sex: "f", skin: 1, hair: 1, cloth: 2, outfit: "dress", mood: "neutral" },
    schedule: [{ h: 0, map: null }, { h: 8, map: "au_out", x: 80, y: 38, w: 4, where: "the Exchange square" }, { h: 18, map: null }] },
  aufolk2: { name: "A dock hand", title: "", look: { skin: 2, hair: 0, cloth: 3, outfit: "tunic", mood: "neutral" },
    schedule: [{ h: 0, map: null }, { h: 7, map: "au_out", x: 30, y: 45, w: 3, where: "the quay" }, { h: 19, map: null }] },
  aufolk3: { name: "An officer's wife", title: "", look: { sex: "f", skin: 0, hair: 3, hairStyle: "bun", cloth: 5, outfit: "dress", mood: "smile" },
    schedule: [{ h: 0, map: null }, { h: 9, map: "au_vault", x: 146, y: 15, w: 3, where: "the Garden of Names" }, { h: 17, map: null }] },
});
const AU_NPCS = ["aupur1", "aupur2", "aupur3", "ausarge", "vosk", "marrow", "caddock", "corse", "aupell", "auwenna", "anselm", "gannet", "neve", "augull", "hollis", "hallmum", "hallkid", "tamsin", "augate1", "augate2", "auward1", "auward2", "keeper1", "keeper2", "aufolk1", "aufolk2", "aufolk3"];
for (const k of AU_NPCS) { NPC_DEFS[k].id = k; NPC_DEFS[k].act2 = true; }

/* ---------- shops ---------- */
Object.assign(SHOPS, {
  au_exchange: { name: "The Traders' Exchange", keeper: "Hollis", stock: ["bandage", "spoultice", "gpoultice", "btonic", "gtonic", "antidote", "bread", "ration", "rope", "torchoil", "fortblade", "leyblade", "brigandine", "fortplate", "sallet", "greathelm"],
    bonus: ["arms", "hide", "silk", "food"], mult: 1.15, buy: 0.95, purse: 450 },
});
const AU_INN = 50;

/* ---------- talk ---------- */
const av = (who, t) => ({ who, t });
const auWith = (c, id, t) => (inParty(c.G, id) ? [av(id, t)] : []);
const auComp = (G, t) => (typeof compKey === "function" && inParty(G, compKey(G)) ? [av("unchosen", t)] : []);
Object.assign(SCRIPTS, {
  vosk: (c) => {
    const t = qs(c.G, "q_authief");
    if (t === 4 && c.has("blackthread")) return [
      av("vosk", "Under the Vault Ward? Through the culvert? That drain's been bricked up since my grandfather's day."),
      av("vosk", "...Sawn. Clean. They took their time. And this? Thread, knotted thrice. That's the Unbound's mark. Everybody knows it."),
      ...(c.has("unbthread") ? [{ choice: [
        ["Show him the red thread from Millhaven", [av("narrator", "You hold the two threads side by side. The red is plain wool, knotted loosely. The black is silk, and the knots are pulled tight and neat."),
          av("vosk", "...Not the same hand. Not the same thread, even. Somebody wanted us to find a black one and think of a red one."), av("vosk", "I'll not ask where you got the red. I'll ask you to keep it out of my barracks.")]],
        ["Say nothing", [av("vosk", "The Prior will say it's Unbound work. The Prior will say a lot of things.")]],
      ] }] : [av("vosk", "Or somebody wants it to look like the Unbound's mark. I've seen that done before.")]),
      av("vosk", "This goes to the Vaultwarden. She'll want to see the ones who found it. I'll send word through the Warden's Gate."),
      { do: (c) => { c.take("blackthread", 1); c.set("au_summoned"); c.set("q_authief", 5); c.set("q_auseal", 1); } },
      av("narrator", "Captain Vosk gives a runner the black thread, and a note under his own seal."),
      av("vosk", "Go on. They'll let you through the Warden's Gate now. Mind your manners in there."),
    ];
    if (t === 5) return [av("vosk", c.rot("vosk", ["The Vaultwarden has you. Better her than me.", "The Prior's men followed you twice yesterday. Thought you'd want to know.", "My grandfather bricked that drain. I've half a mind to go and brick it again."]))];
    if (t >= 1) return [av("vosk", c.rot("vosk", ["The harbour folk see everything that moves on the water, and half of what doesn't. Ask the harbourmaster.", "Nobody came through the gates that night. I'd swear to it. So how did they get in?", "Find me how, and I'll see the Vaultwarden hears it was you."]))];
    return [av("vosk", "The city's closed. If you've business, make it quick and make it quiet.")];
  },
  neve: (c) => {
    const t = qs(c.G, "q_authief");
    if (t === 1) return [
      av("neve", "The night of the theft? Fog on the Mere. No boats out, I made sure of it."),
      av("neve", "But there was a light. Low down, by the sluice, where the old culvert runs under the city. I thought it was eel-catchers. It wasn't the season for eels."),
      av("neve", "I told the barracks. They told me the culvert's bricked up. I didn't argue. You can go and look, if you like getting wet."),
      { do: (c) => c.set("q_authief", 2) }];
    return [av("neve", c.rot("neve", ["No boats. Not one. The fish don't care about the lockdown, but I have to.", "The Mere's been warm this autumn. Warm and grey along the east shore.", "My father kept this harbour forty years and never lost so much as a net."]))];
  },
  augull: (c) => [av("augull", c.rot("augull", ["Did you see the fight? I saw the fight! From up the mast!", "You can see the Vault rock from the end of the jetty. Mum says don't look at it too long.", "I'm not allowed past the sluice. Something lives in the culvert. Rats as big as dogs, Harl says."]))],
  marrow: (c) => {
    const s = qs(c.G, "q_auseal");
    if (s === 1 && !c.flag("crags_open")) return [
      av("narrator", "The Vaultwarden does not get up. She finishes the line she is writing, blots it, and only then looks at you."),
      av("marrow", "You found the culvert. The watch had walked over that grate for sixty years. I should thank you, and I do. Sit."),
      av("marrow", "You'll want to know what was taken. You'll not hear it from me. The Covenant has its reasons, and this is one I keep."),
      av("narrator", "In your satchel, wrapped in an old shirt, the tome you never asked for sits very still."),
      av("marrow", "What I can tell you is what was broken. The Vault is sealed with a word: a word spoken into stone and kept alive by the keepers saying it, night and day. When the thief took what they took, the seal cracked."),
      av("marrow", "A cracked seal can be mended. It needs the Sealstone, the stone the word was first cut into. It was carried west, long ago, to a shrine deep in the Crags, for safekeeping."),
      ...auComp(c.G, "The shrine at the old mine-heads. We read about it at the College. Nobody's been since the pass was walled."),
      av("marrow", "Just so. I've ordered the pass opened. My masons are taking the wall down as we speak. Bring me the Sealstone, and I'll write you a letter that will open the Capital itself."),
      ...auWith(c, "hakon", "The Crags. West. Where they took Arthur, in chains."),
      { do: (c) => { c.set("crags_open"); } },
      av("narrator", "The sealed pass west of Stonebridge is being opened."),
      av("marrow", "Go carefully. Whoever took what they took went that way too, or I'm a fool. I'm not a fool."),
    ];
    if ((s === 1 || s === 2) && c.has("sealstone")) return [
      av("marrow", "...You have it. Give it here. Gently."),
      { do: (c) => { c.take("sealstone", 1); c.give("capletter", 1); c.set("capital_letter"); c.set("q_auseal", 3); } },
      av("marrow", "As promised. The bearer and companions, admitted to the Capital without let or question. Don't make me regret the 'without question'."),
      av("narrator", "The Vaultwarden gives you a letter of passage."),
    ];
    if (s === 1 || s === 2) return [av("marrow", c.rot("marrow", ["The Sealstone. West, through the pass, deep in the Crags.", "The keepers can hold the crack for a while. Not for ever.", "No, I will not tell you what was taken. Ask me again and I'll have you shown out."]))];
    return [av("marrow", "The Vault Ward is not a place to wander. State your business.")];
  },
  caddock: (c) => [av("caddock", c.flag("met_caddock") ? c.rot("caddock", ["The Covenant cannot keep a door shut. We can keep a fire lit.", "Your friend the captain will hang a thief and call it justice. We'd burn the word that let them in.", "Every weaver is a door. Remember that I said so, when they open."])
    : "You're the ones who put my brothers in the dirt at the gate. No, don't. They were careless, and I've told them so. Next time they'll be careful."), { do: (c) => c.set("met_caddock") }],
  corse: (c) => [av("corse", c.rot("corse", ["Stand back. This row's going grey. When it's grey enough, it burns.", "The curse comes in on the wind and on the word. We stop one by stopping the other.", "Move along, weaver. I can smell it on you."]))],
  aupell: (c) => {
    const G = c.G;
    if (c.flag("comp_joined") && qs(G, "q_comp") === 1) return [
      av("aupell", "A tome? From past the edge of the maps? Hm. Every copy from Verrin passes my desk. Let me see."),
      av("narrator", "The archivist runs a finger down the copy-ledger, then stops, and taps a line written in red."),
      av("aupell", "Here. Copied, yes. But not to my shelves. To the Vault, sealed stacks. The Covenant decided some things are not for the Archive House."),
      ...auComp(G, "Of course they did. Of course it's in the one place in the south nobody can get into."),
      av("aupell", "When the Vault is whole again, the Vaultwarden might let you read it. She's strict, not cruel. Mostly not cruel."),
      { do: (c) => c.set("q_comp", 2) }];
    return [av("aupell", c.rot("aupell", ["Copies of everything Verrin locks away. Most of it is tithe rolls. Most of it.", "Quiet, please. The paper can hear you.", "The red lines in the ledger? Those went to the Vault. I copy them; I don't keep them."]))];
  },
  auwenna: (c) => [av("auwenna", c.rot("auwenna", ["The seal is a word. We keep it by saying it. If we all stopped at once, it would go out like a candle.",
    "Anyone could learn the word, you know. Anyone who was taught it. The blood has nothing to do with it. Don't tell the Prior I said so.",
    "It's cracked. I can feel it when I say the word now: a catch, like a stair that's not quite where you left it."]))],
  anselm: (c) => [av("anselm", c.rot("anselm", ["Sit, if you like. The chapel is the one place the lockdown can't search.", "Locking a city to find one thief. I understand the reasons. I don't like them.", "The Purifiers say fire is mercy. I've buried enough of their mercy."]))],
  gannet: (c) => {
    const room = { choice: [
      [`Take a room (${AU_INN} coppers)`, [{ do: (c) => { if (c.G.coins >= AU_INN) c.coins(-AU_INN); } }, (c.G.coins >= AU_INN
        ? { choice: [[isNightT(c.G.time) ? "Sleep until morning" : "Sleep until nightfall", [{ do: (c) => c.innRest(true) }]], ["Just rest a while", [{ do: (c) => c.innRest(false) }]]] }
        : av("gannet", "Fifty. Lockdown price. I don't like it either."))]],
      ["Not now.", []]] };
    return [av("gannet", c.flag("met_gannet") ? c.rot("gannet", ["No boats, no fish, no trade. Just soldiers, and they drink on account.", "Something lives in the culvert. Gull's heard it. So have I.", "The Purifiers drink here too. They pay. I almost wish they didn't."])
      : "The Drowned Bell! The bell's at the bottom of the Mere, before you ask. Fifty a night while the lockdown lasts."), { do: (c) => c.set("met_gannet") }, room];
  },
  hollis: (c) => [av("hollis", c.rot("hollis", ["Half my stock's stuck on wagons outside the wall. The other half's yours, at a price.", "Arms, armour, physic. Lockdown prices, sorry.", "The Prior bought every flask of lamp oil I had. Every one."])),
    { choice: [["Trade", [{ shop: "au_exchange" }]], ["Goodbye.", []]] }],
  hallmum: (c) => [av("hallmum", c.flag("met_hallmum") ? c.rot("hallmum", ["We'll sleep in the cart till they let us out. It's still ours. Thanks to you.", "My husband's hands went grey, in the Row. He's in the chapel now. They said our cart was tainted too.", "Tam won't stop talking about you."])
    : "You stood in front of our cart. Strangers. I don't... thank you. They'd have burned everything we own, and called it a kindness."), { do: (c) => c.set("met_hallmum") }],
  hallkid: (c) => [av("hallkid", c.rot("hallkid", ["You made the fire go out! How did you do that?", "Mum says don't stare at weavers. I'm not staring. I'm looking.", "The man in the black hood said our cart was sick. Carts can't be sick."]))],
  aupur1: (c) => [av("aupur1", "Stand aside.")], aupur2: (c) => [av("aupur2", "...")], aupur3: (c) => [av("aupur3", "Burn it.")],
  ausarge: (c) => [av("ausarge", c.flag("au_skirm_won") ? c.rot("ausarge", ["I owe you. I don't like owing, but I owe you.", "Three of them. I had three of them, and a sword I'd not drawn in a year.", "Captain's at the barracks. He'll want you."]) : "Stand back, all of you!")],
  tamsin: (c) => [av("tamsin", c.rot("tamsin", ["My hands went grey at the tips in the summer. Didn't spread. Doesn't hurt. Don't tell the hoods.", "The Row's been here since before the Vault. We'll be here after.", "They burn a house a week, now. Never the same street twice. So you can't see the pattern."]))],
  augate1: (c) => [av("augate1", c.rot("augate1", ["Nobody leaves. Orders.", "Searched, are you? Then go on.", "Purifiers want the gate. They're not getting it."]))],
  augate2: (c) => [av("augate2", c.rot("augate2", ["Keep moving.", "Since the spring on this gate. Since the spring.", "You were good in that scrap. Don't let it go to your head."]))],
  auward1: (c) => [av("auward1", c.flag("au_summoned") ? "The Vaultwarden is expecting you. Go through." : "Nobody passes without the Vaultwarden's summons.")],
  auward2: (c) => [av("auward2", c.flag("au_summoned") ? "Through you go. Mind your feet." : "Turn about.")],
  keeper1: (c) => [av("keeper1", "...")],
  keeper2: (c) => [av("keeper2", c.rot("keeper2", ["Hush. We're saying the word.", "Nobody goes in. Not even us, now.", "Can you hear it? No. Of course not. Never mind."]))],
  aufolk1: (c) => [av("aufolk1", c.rot("aufolk1", ["Curfew at dusk. As if the thief's going to come back for seconds.", "My sister's in Millhaven. I can't even send a letter.", "The Purifiers want the city. The Covenant won't give it to them. I'd just like some bread."]))],
  aufolk2: (c) => [av("aufolk2", c.rot("aufolk2", ["No boats. So no work. So no pay.", "The sluice? Smells. Always has.", "Harbourmaster saw something, I heard. She won't say what."]))],
  aufolk3: (c) => [av("aufolk3", c.rot("aufolk3", ["The Garden of Names: every Vaultwarden since the founding, cut into the stones.", "My husband hasn't slept since the theft.", "We're quite safe in here. Quite safe."]))],
  look_sluice: (c) => {
    const t = qs(c.G, "q_authief");
    if (t < 2) return [av("narrator", "An iron grate over the old sluice, where the culvert runs under the city. It stinks. Nobody's looked at it in years.")];
    return [av("narrator", t === 2 ? "The iron grate over the sluice. Look closer: two bars have been sawn through near the bottom and set back in place, so nobody would notice from above." : "The sawn grate over the sluice, leading down into the old culvert."),
      ...(t === 2 ? [{ do: (c) => c.set("q_authief", 3) }] : []),
      { choice: [["Climb down", [{ do: (c) => c.goto("au_culvert", 5, 6, "down") }]], ["Leave it", []]] }];
  },
  look_culvertladder: (c) => [av("narrator", "Rungs set into the wall, up to the harbour sluice."), { choice: [["Climb up", [{ do: (c) => c.goto("au_out", 24, 47, "down") }]], ["Stay", []]] }],
  look_cutgrate: (c) => {
    const steps = [];
    if (!c.flag("au_thread")) {
      steps.push(av("narrator", "The culvert ends under a grate, high in the roof. Through the bars: the Vault Ward. Every bar has been sawn through, and the grate set back from above."),
        av("narrator", "Snagged on a cut bar, where nobody climbing through could miss it: a length of black thread, knotted three times."),
        { do: (c) => { c.give("blackthread", 1); c.set("au_thread"); if (qs(c.G, "q_authief") < 4) c.set("q_authief", 4); } },
        av("narrator", "You take the knotted black thread."),
        ...auComp(c.G, "Knotted three times. Like Fen's people use. Except it's black. Somebody wanted us to find this."),
        ...auWith(c, "tessa", "That's not a clue. That's a signpost."));
    }
    if (c.flag("au_summoned")) steps.push({ choice: [["Climb up into the Vault Ward", [{ do: (c) => c.goto("au_vault", 24, 11, "down") }]], ["Stay", []]] });
    else if (c.flag("au_thread") && steps.length === 0) steps.push(av("narrator", "Through the bars, boots: a guard is standing right above the grate. Not this way. Not yet."));
    return steps;
  },
  look_culvertgrate: (c) => [av("narrator", "The grate the thief sawed through, set into the paving behind the cloister. The watch has walked over it for years."),
    { choice: [["Climb down into the culvert", [{ do: (c) => c.goto("au_culvert", 39, 6, "down") }]], ["Leave it", []]] }],
});

/* ---------- the skirmish at the gate square ---------- */
function auSkirmish(G) {
  return [
    { who: "narrator", t: "The north gate grinds open just far enough for you. Inside, two soldiers check your packs and your hands, and wave you through." },
    { who: "narrator", t: "The gate square is shouting. A family's cart, a grey hand daubed on it in ash. Three Purifiers in black hoods with firepots lit, and a mother with a boy behind her." },
    { who: "narrator", t: "A Covenant sergeant is trying to get between them, one man against three, and losing." },
    { who: "aupur3", t: "Tainted! Her husband's hands went grey on the Row! The cart, the clothes, all of it burns!" },
    ...(inParty(G, "tessa") ? [{ who: "tessa", t: "They'll burn the cart with the boy still holding on to it." }] : []),
    ...auComp(G, "That's Purifier fire. It doesn't go out when you ask it to."),
    { choice: [
      ["Step between them", [{ who: "narrator", t: "You step in front of the cart. The nearest Purifier looks at you, and at your hands." }]],
      ["Stay out of it", [{ who: "narrator", t: "You hang back. It doesn't help. The nearest Purifier's eyes find you anyway, and your hands." }]],
    ] },
    { who: "aupur3", t: "Weaver. Another one. It walks in our gate, bold as the plague. Burn that too." },
    { fight: { foes: ["purburner", "purburner", "purbrand"], win: "au_skirm_won" } },
  ];
}
QUEST_WIN_HOOKS.push((G, foes, quest) => {
  if (quest !== "au_skirm_won") return null;
  G.flags.q_aulock = 2; G.flags.q_authief = Math.max(G.flags.q_authief | 0, 1);
  return [
    { who: "narrator", t: "The last firepot rolls into the gutter and gutters out. The square is very quiet. Then soldiers, a dozen, at the run." },
    { who: "vosk", t: "Hold! All of you! ...Well. You've done my sergeant's job for him." },
    { who: "narrator", t: "A tall man in a black hood walks into the square without hurrying. The Purifiers who can still stand go to him at once." },
    { who: "caddock", t: "Captain Vosk. Your city is closed, and yet a stranger kills my brothers in the street. The Vault is robbed under your nose. And the curse is at your east wall." },
    { who: "caddock", t: "How long, Captain, before the Covenant asks the Purifiers to keep Aurelm for it? Not long, I think." },
    { who: "vosk", t: "Get off my square, Prior." },
    { who: "narrator", t: "The Prior smiles, and goes." },
    { who: "vosk", t: "You. Come to the barracks. ...No, you're not under arrest. I'll be honest: I need someone who isn't mine. Every man in my watch is watched." },
    { who: "vosk", t: "Nobody came through the gates the night the Vault was robbed. I'd swear to that. So how did the thief get in? Find out, and the Vaultwarden hears it was you who found it. The harbour folk see more than my men do. Start there." },
    { who: "narrator", t: "The Hallorans are already pulling their cart back to the side of the square. The boy is staring at you." },
  ];
});

/* ---------- the task list ---------- */
ASH_QUESTS.push(
  ["q_aulock", "The Locked City", ["", "Get through Aurelm's gate"], ["", "Aurelm, south of Millhaven by the Mere"]],
  ["q_authief", "The Thief's Road", ["", "Find out how the thief got into the Vault Ward", "Search the sluice by the harbour", "Follow the old culvert under the city", "Take what you found to Captain Vosk"],
    ["", "Captain Vosk says the harbour folk see everything. Try the harbourmaster", "The sluice grate is on the quay, south of the harbour", "The culvert runs east, under the inner wall", "The barracks, north-west of the gate square"]],
  ["q_auseal", "The Broken Seal", ["", "Bring the Sealstone back from the shrine deep in the Crags", "Take the Sealstone to the Vaultwarden in Aurelm"], ["", "Through the old pass west of Stonebridge, then up past the high tarn to the Shrine of the First Word", "The Warden's Hall, in Aurelm's Vault Ward"]],
);
QUEST_ENTER_HOOKS.push((G, id) => {
  if (id === "au_out" && !G.flags.au_skirm_won) { if (!G.flags.q_aulock) G.flags.q_aulock = 1; return auSkirmish(G); }
  if (id === "au_vault" && !G.flags.reached_au_vault) {
    G.flags.reached_au_vault = true;
    return [{ who: "narrator", t: "The Vault Ward. Quieter than the Outer City, cleaner, and colder. At the far end the great grey rock rises out of the paving, and in its face, the Vault: doors broken, chains across them, and two keepers murmuring the same word over and over." }];
  }
  if (id === "au_culvert" && !G.flags.reached_au_culvert) {
    G.flags.reached_au_culvert = true;
    return [{ who: "narrator", t: "The old culvert: brick, black water, and the smell of a century of Aurelm. Old boot-scuffs, months old, dried into the slime on the walkway, heading east." }];
  }
  return null;
});

/* who wears what: the Covenant's soldiers in the Fort's own kit, the Purifiers in their dark hoods (not the player's sprite, ever) */
Object.assign(CHIBI_MAP, { vosk: "a2_covknight", ausarge: "a2_covknight", augate1: "a2_covknight", augate2: "a2_covxbow", auward1: "a2_covknight", auward2: "a2_covknight",
  aupur1: "n_sarn", aupur2: "n_sarn", aupur3: "n_sarn", corse: "n_sarn", caddock: "n_sarn" });
