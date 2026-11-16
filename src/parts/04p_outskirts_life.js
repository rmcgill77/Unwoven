/* ------------------------------------------------------------------ */
/* The Frostcrown Outskirts: the snow round Fort Frostcrown's walls.   */
/* The field Pillar, the gate guards and the toll keeper, the wagon    */
/* queue, the west cleft and its grate, Rimefang's den, the Vale       */
/* scouts at the barricade. Map: 04o_outskirts.js                      */
/* ------------------------------------------------------------------ */
PILLARS.osroad = { map: "os", name: "the Fort road", at: [41, 54, "up"] };
delete MAP_DEFS.plainsNE.looks.barricade;

MAP_DEFS.os.looks = {
  patrolboard: ["The patrol board. Rotas in a neat Covenant hand, a list of wanted men, and a notice: 'Frozen Vale outriders sighted on the east road. Do not engage. Report to the north gate.'",
    "Pinned under the rota, half torn: 'Missing from the stores: one crate, Keystones, Pillar, six. Any man with knowledge to report it to the Quartermaster.'"],
  tollpost: ["The toll post: a sentry box, a brazier, a strongbox chained to the post. The tariff is painted on a board: 'Persons, two silver. Carts, by weight. Letters of the Covenant, free.'"],
  searchpost: ["The search post at the north gate. A table outside it, scrubbed bare, where packs are emptied and gone through. Someone has left a pair of tongs on it."],
  shrine: ["A wayside shrine to the Weave, its lamp long out. Frozen to the ledge: a copper, a ribbon, a child's carved wolf.", "Carved under the niche, very small: a thread, unbroken."],
  supplycart: ["A Covenant supply cart, burned and left. The canvas is gone and one wheel is off. The tracks that brought it here have long since snowed over.", "Whatever burned it took its time. The crates were opened first."],
  wagon: ["A wagon in the queue for the south gate. The carter is asleep under a blanket on the box, or pretending to be.", "Barrels and sacks, roped down, a tally chalked on the tailboard. Flour and salt fish for the Fort.", "The wagon's horse has a frost-white muzzle and does not care about you at all."],
  sentry: ["A Covenant sentry box. The brazier beside it is kept burning, day and night."],
  den: ["Bones, gnawed white, and a smell of wet fur. Something big sleeps here.", "Deep claw marks in the rock, higher than your head."],
  valecrate: ["A crate with House markings: a white stag on black. Frozen Vale colours, the same the orcs wore in the Iron Cleave's camp."],
  fortwall: ["The curtain wall of Fort Frostcrown: dark stone, laid by someone who did not mean it ever to come down. Frost in every joint.", "Up on the wall-walk a sentry stops, looks down at you for a long moment, and walks on."],
  southgate: ["The south gate. The portcullis is down, and the gate behind it barred.", "Over the arch, carved deep: the Covenant's knot, and under it, 'By Weave and Warden'."],
  northgate: ["The north gate: two leaves of black oak under iron straps, shut fast. A hatch in one leaf opens, someone looks at you, and it shuts again."],
  barricade: ["A Covenant barricade across the Vale road: iron-shod beams, chained. Past it the road runs east and north, towards the Frozen Vale.", "Fresh boot prints in the snow on the far side. Big ones."],
  pond: ["The pond is frozen solid. Under the ice, very still, the shapes of reeds."],
};

Object.assign(CHEST_LOOT, {
  c_os_cart: [30, { bandage: 3 }], c_os_shrine: [25, { tonic: 1 }], c_os_pond: [60, { cutgem: 1 }],
  c_os_tor: [0, { ring: 1, bonecharm: 1 }], c_os_vale: [80, { valeorders: 1 }],
});
ITEMS.valeorders = { name: "Frozen Vale orders", quest: true, desc: "Orders in a House hand, sealed with a white stag: 'Count the Fort's patrols. Find where the Keystones go. Do not be seen.' Unsigned." };

/* ---------- people: the gate watches, the toll keeper, a road patrol ---------- */
Object.assign(NPC_DEFS, {
  osgate1: { name: "Covenant soldier", title: "South gate", look: { skin: 0, hair: 1, helm: true, cloth: 4, outfit: "coat", mood: "neutral" },
    schedule: [{ h: 0, map: "os", x: 46, y: 44, w: 0, where: "the south gate" }] },
  osgate2: { name: "Covenant soldier", title: "South gate", look: { skin: 2, hair: 0, helm: true, cloth: 4, outfit: "coat", mood: "neutral" },
    schedule: [{ h: 0, map: "os", x: 53, y: 44, w: 0, where: "the south gate" }] },
  ostoll: { name: "Toll keeper Hesk", title: "South gate tolls", look: { skin: 1, hair: 4, beard: true, cloth: 4, outfit: "coat", mood: "neutral", age: true },
    schedule: [{ h: 0, map: null }, { h: 7, map: "os", x: 44, y: 45, w: 0, where: "the toll post" }, { h: 19, map: null }] },
  osnorth1: { name: "Covenant soldier", title: "North gate", look: { skin: 1, hair: 1, helm: true, cloth: 4, outfit: "coat", mood: "neutral" },
    schedule: [{ h: 0, map: "os", x: 46, y: 8, w: 0, where: "the north gate" }] },
  osnorth2: { name: "Covenant soldier", title: "North gate", look: { skin: 0, hair: 0, helm: true, cloth: 4, outfit: "coat", mood: "neutral" },
    schedule: [{ h: 0, map: "os", x: 53, y: 8, w: 0, where: "the north gate" }] },
  ospatrol: { name: "Covenant patrol", title: "The Fort road", look: { skin: 2, hair: 1, helm: true, cloth: 4, outfit: "coat", mood: "neutral" },
    schedule: [{ h: 0, map: null }, { h: 6, map: "os", x: 51, y: 54, w: 3, where: "the Fort road" }, { h: 20, map: null }] },
});
const OS_NPCS = ["osgate1", "osgate2", "ostoll", "osnorth1", "osnorth2", "ospatrol"];
for (const k of OS_NPCS) { NPC_DEFS[k].id = k; NPC_DEFS[k].act2 = true; }

/* ---------- what they say: the gates stay shut for now (the Fort itself is the next step) ---------- */
const osv = (who, t) => ({ who, t });
const osNight = (c) => isNightT(c.G.time);
Object.assign(SCRIPTS, {
  osgate1: (c) => osNight(c) ? [osv("osgate1", "Gates shut at dark. Nobody in, nobody out, not for silver, not for the Arbitrator's own mother. Come back with the sun.")]
    : [osv("osgate1", c.rot("osgate1", c.flag("fort_pass_s") ? ["Go on through.", "Wagons queue on the right. People queue behind the wagons. That's how it's always been."] : ["Tolls are Hesk's business, at the post there. Pay him or show him a Covenant letter, and the gate's yours.", "Keeping the gate is my business. Hesk takes the money."]))],
  osgate2: (c) => osNight(c) ? [osv("osgate2", "Shut till morning. There's a fire at the Pillar down the road, if you're cold. You look cold.")]
    : [osv("osgate2", c.rot("osgate2", ["Toll's two silver. Talk to Hesk.", "You've come up from the plains? Then you've seen more of the world this month than I have this year.", "The wall's older than the Covenant. We just put the gates on it."]))],
  ostoll: (c) => {
    const letter = c.G.items.covletter > 0;
    return [osv("ostoll", "Two silver a head, carts by weight, letters of the Covenant free. And none of it matters today, because the gate is barred."),
      letter ? osv("ostoll", "That's Curate Voidsong's seal. When the gate opens, you'll walk through it without paying a copper. Keep it dry.")
        : osv("ostoll", "If you've no letter and no silver, there's always the north gate. They don't charge there. They just go through everything you own."),
      osv("ostoll", c.rot("ostoll", ["I've stood at this post nineteen winters. The wagons get fewer every one.", "The queue? They've been there since yesterday. Salt fish. It keeps."]))];
  },
  osnorth1: (c) => osNight(c) ? [osv("osnorth1", "The north gate opens at first light. Before that, the only things that come up this road are wolves and Vale scouts.")]
    : [osv("osnorth1", c.rot("osnorth1", ["Everyone who comes in by the north gate is searched. Everyone. Packs, pockets, boots. The gate's barred today in any case.", "If you're carrying anything the Covenant wouldn't like, the south gate's kinder. Costs more, asks less.", "Frozen Vale outriders on the east road. If you go that way, you go alone."]))],
  osnorth2: (c) => [osv("osnorth2", c.rot("osnorth2", ["Move along.", "We search because the Vale sends spies. Last month one came through with a book of Old Tongue sewn into his coat lining.", "Nothing comes in this gate that we haven't looked at twice."]))],
  ospatrol: (c) => [osv("ospatrol", c.rot("ospatrol", ["The Fort's straight on. Gates open by day, when they're open at all.", "Stay off the rocks to the north-west after dark. The wolves up there have a big one leading them now. White as the snow.", "There's a shrine on the west side of the road. My mother left a copper there for me, the year I came north. It's still there."]))],
});

/* the culvert grate: the secret way in, opened by a later quest */
SCRIPTS.look_grate = (c) => [
  osv("narrator", "An iron grate at the foot of the wall, where the Fort's kitchen runoff comes out under the stone. Black water, a smell of onions and grease, and a draught of warm air."),
  osv("narrator", "The bars are rusted into their frame. Someone who knew this grate was here, and how it was hung, might get it open. You don't, yet."),
];

/* Rimefang falls; the Vale scouts give up a hint of the Vale */
QUEST_WIN_HOOKS.push((G, foes) => {
  const f = G.flags;
  if (foes.includes("rimefang") && !f.rimefang_beaten) {
    f.rimefang_beaten = true;
    return [{ who: "narrator", t: "Rimefang goes down in the snow and does not get up. Up on the tor, the howling stops." },
      { who: "tessa", t: "That's the one the patrols were scared of. I don't blame them." },
      ...(G.partyIds && G.partyIds.includes("hakon") ? [{ who: "hakon", t: "A good pelt. Take it. A cloak of that will keep the March outside you." }] : [])];
  }
  if ((foes.includes("valescout") || foes.includes("valeshaman")) && !f.os_vale_met) {
    f.os_vale_met = true;
    return [{ who: "narrator", t: "The last scout falls back against the barricade. On his arm-band: a white stag on black. The same colours as the Iron Cleave's orcs." },
      { who: "tessa", t: "They're a long way from the Vale. And they were watching the Fort, not the road." }];
  }
  return null;
});

/* the outrider at the boundary stone now lets people up the March road */
SCRIPTS.marchguard = (c) => [osv("marchguard", c.rot("marchguard2", ["The March road's open to the Outskirts. Past the Fort, it's closed to everyone. Orders from Arbitrator Icetoe.",
  "Frozen Vale outriders have been seen east of the Fort. Stay on the road and you'll live to complain about the toll.", "Fort Frostcrown's two miles north. It only gets colder from here."]))];
CHIBI_MAP.osgate1 = "a2_covknight"; CHIBI_MAP.osgate2 = "a2_covknight"; CHIBI_MAP.osnorth1 = "a2_covknight"; CHIBI_MAP.osnorth2 = "a2_covknight"; CHIBI_MAP.ospatrol = "a2_covxbow";
