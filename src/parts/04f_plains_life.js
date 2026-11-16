/* ------------------------------------------------------------------ */
/* The Open Plains: who lives there, what can be found, what things    */
/* say when looked at. The maps themselves are in 04e_plains.js.       */
/* ------------------------------------------------------------------ */

/* field Pillars, by the names travellers use for them; each wakes at a touch */
const PILLAR_NAMES = { crossroads: "Crossroads", wforest: "West Forest trail", eforest: "East Forest trail", overlook: "Overlook Hill" };
for (const id in MAP_DEFS) for (const p of MAP_DEFS[id].pillars || []) if (!PILLARS[p.id]) PILLARS[p.id] = { map: id, name: PILLAR_NAMES[p.id] || p.id, at: [p.tx, p.ty + 2, "down"] };

/* what things say on the plains, where it differs from home */
MAP_DEFS.plainsSW.looks = {
  barricade: ["Fallen timber, dragged across the trail and left. Beyond it the West Light Forest closes in, dark and quiet.", "Someone has carved a cut thread into the top log. (The West Forest opens in a later build.)"],
  townwall: ["A town wall: dressed stone, kept in good repair. Over it, rooftops and chimney smoke."],
  towngate: ["Ashford's north gate, open by day. Covenant banners hang either side, purple and gold.", "Beyond the arch: a cobbled street, roofs, the chapel's slate spire."],
  farm: ["A cellar door under fallen beams. The farm burned years ago; the tithe-men came the season after anyway."],
};
MAP_DEFS.plainsSE.looks = {
  barricade: ["A palisade of sharpened stakes across the trail, new and badly made. Bandit work. (The East Forest opens in a later build.)"],
  wagon: ["A cart burned to its axles. The horses are gone; the driver is not.", "Scratched into the tailboard, under the soot: a thread, cut through."],
  wayfire: ["A ring of stones round old ash. Travellers stop here, but only after dark, and never for long."],
};
MAP_DEFS.plainsNW.looks = {
  towngate: ["Greywick's gate hangs open on its hinges. Nobody stands watch.", "Someone has painted over the Covenant sigil on the arch. Badly, and recently."],
  townwall: ["Greywick's wall: old stone, patched with timber where it has fallen. The roofs behind it sag."],
  gate: ["Greywick's gate hangs crooked on one hinge, tied shut with rope. (Greywick opens in a later build.)", "Someone has painted over the Covenant sigil on the crossbar. Badly, and recently."],
};
MAP_DEFS.plainsNE.looks = {
  barricade: ["A Covenant barrier of iron-shod beams. Past it the road climbs into the Frostcrown March. (The Outskirts open in a later build.)"],
};

/* chests out in the open: coins, things, and sometimes a recipe note */
Object.assign(CHEST_LOOT, {
  c_farm: [15, { poultice: 2, bread: 1 }], c_wagon: [30, { cuttoken: 1 }], c_overlook: [40, { btonic: 1 }],
  c_ambush: [60, { boots: 1, bandage: 2 }], c_stones: [0, { ring: 1, bonecharm: 1, cutgem: 1 }], c_rook: [100, { ringmail: 1 }],
  c_pcamp: [20, { firewax: 2, cuttoken: 2, leaflet: 1 }],
});
const CHEST_RECIPE = { c_rook: "spoultice", c_pcamp: "firepot" };

/* people of the plains */
Object.assign(NPC_DEFS, {
  hunter: { name: "Sefton Reeve", title: "Hunter", look: { skin: 2, hair: 4, hairStyle: "short", beard: true, cloth: 3, outfit: "coat", mood: "neutral", strap: true },
    schedule: [{ h: 0, map: "plainsSW", x: 27, y: 8, w: 1, where: "the hunters' camp" }] },
  trader: { name: "Mother Fenwick", title: "Roadside trader", look: { skin: 1, hair: 5, hairStyle: "bun", cloth: 6, outfit: "dress", mood: "sly", age: true },
    schedule: [{ h: 0, map: "plainsSW", x: 83, y: 9, w: 1, where: "the traders' camp" }] },
  bridgeguard: { name: "Covenant patrol", title: "Bridge watch", look: { skin: 0, hair: 1, helm: true, cloth: 4, outfit: "coat", mood: "neutral" },
    schedule: [{ h: 0, map: "plainsSW", x: 83, y: 16, w: 1, where: "the river bridge" }] },
  wayfarer: { name: "A wayfarer", title: "", look: { skin: 3, hair: 0, hood: true, cloth: 9, outfit: "coat", mood: "sly" },
    schedule: [{ h: 0, map: "plainsSE", x: 41, y: 3, w: 0, where: "the Wayfarers' fire" }, { h: 5, map: null }, { h: 19, map: "plainsSE", x: 41, y: 3, w: 0, where: "the Wayfarers' fire" }] },
  marchguard: { name: "Covenant outrider", title: "Frostcrown March", look: { skin: 2, hair: 0, helm: true, cloth: 4, outfit: "coat", mood: "neutral" },
    schedule: [{ h: 0, map: "plainsNE", x: 48, y: 9, w: 1, where: "the boundary stone" }] },
});
for (const k of ["hunter", "trader", "bridgeguard", "wayfarer", "marchguard"]) { NPC_DEFS[k].id = k; NPC_DEFS[k].act2 = true; }

Object.assign(SCRIPTS, {
  hunter: (c) => [c.rot("hunter", [
    "Boar by day, and keep off the road when you hear them. Rats in anything that was ever a barn.",
    "Bandits have pushed the game out of the east downs. A camp of them down in Rook's Hollow, south of the river road.",
    "Don't go near the standing stones after dark. The dead don't stay down there. And don't touch what's in the ring.",
    "Wolves keep to the woods and the rocks. Out here it's the slimes you'll trip over, and the Purifier scouts after dusk.",
  ]), { choice: [["Trade", [{ shop: "hunters" }]], ["Good hunting.", ["And to you. Keep your knife where you can reach it."]]] }],
  trader: (c) => ["Coin first, chatter after. What are you buying, and what have you got that I'd want?",
    { choice: [["Trade", [{ shop: "traders" }]], ["Any news?", [c.rot("trader", [
      "A Covenant cart burned on the road past the crossroads. Nobody's claimed the bodies. Nobody's claimed the cart either.",
      "Greywick's gone sour. Half the town shuttered, and the Pillar there flickers like a cheap candle.",
      "Ashford pays fair for fangs and silk. Greywick pays for anything, badly.",
    ])]], ["Not today.", ["Then make room for someone with a purse."]]] }],
  bridgeguard: (c) => [c.rot("bridgeguard", c.part === "Night"
    ? ["Move along. Nobody crosses after dark without a reason, and nobody has a good one.", "If you see torches on the downs, it's Purifiers. Report it, then stay well away."]
    : ["The Covenant keeps this bridge. The Covenant keeps the road. Mind you stay on both.", "Bandits east of here, slimes everywhere, and the stones to the south are no place for anyone.", "Ashford is south-east of the road. Fort Frostcrown is north, a long walk and a cold one."])],
  wayfarer: () => [{ who: "wayfarer", t: "Sit, if you're sitting. The fire doesn't ask who you are, and neither do I." },
    { who: "wayfarer", t: "You've the look of someone carrying something heavier than a pack. Keep it close. There are folk on these roads who burn what they don't understand." },
    { who: "wayfarer", t: "If you ever need into the Fort without the gate guards counting your teeth, come back and ask me nicely. Not tonight." }],
  marchguard: (c) => [c.rot("marchguard", ["The March is closed to travellers until the thaw. Orders from Arbitrator Icetoe.", "Frozen Vale outriders have been seen near the barricade. We're not letting anyone through to meet them.", "Turn back, apprentice. It only gets colder from here."])],
});
