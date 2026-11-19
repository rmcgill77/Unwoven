/* ------------------------------------------------------------------ */
/* Southern Etharis (Act 3): what the land says when looked at.        */
/* The towns, the Capital Gate and the Crags are barred for now; their  */
/* gates say so. Shared by all twelve sections.                         */
/* ------------------------------------------------------------------ */
const ETH_LOOKS = {
  gate_verrin: ["Verrin's south gate: a portcullis of black iron under the Covenant's sunburst, purple and gold.", "Guards in Covenant tabards watch the road. One checks a list."],
  wall_verrin: ["Verrin's walls: dressed white stone, scrubbed clean, every course true. Bell-towers and slate roofs over the top."],
  gate_aurelm: ["Aurelm's north gate. Twice the guards Verrin keeps, and they are not looking at the road. They are looking south."],
  wall_aurelm: ["Aurelm's walls are old and very thick. Somewhere behind them is the Vault."],
  gate_stonebridge: ["Stonebridge's gate, timber in a stone arch. A bell hangs over it for when the road brings trouble."],
  wall_stonebridge: ["A village wall, knee-high once, raised to a man's height in fresh stone."],
  gate_millhaven: ["Millhaven's gate stands open. Flour dust on the hinges."],
  wall_millhaven: ["Millhaven's wall: fieldstone, mortared in a hurry. The sound of a millwheel from somewhere inside."],
  gate_rotmoor: ["Rotmoor's gate is barred from inside. Fresh claw marks run down the timber, deep as a thumb."],
  wall_rotmoor: ["Something dark weeps from the joints of Rotmoor's wall. It smells of iron and old meat."],
  gate_capital: ["The Capital Gate. Iron on iron, sealed with the Covenant's wax a foot across.", "Beyond it, the road climbs north-east toward the Capital."],
  wall_capital: ["The Capital's outer wall runs east as far as you can see. Lookouts walk the top of it in pairs."],
  growth: ["Something grows here that should not. It is warm to stand near, and it turns, slowly, as you move.", "The curse. It has come this far north already."],
  pass: ["The old way into the Western Crags, walled up with new stone. Every block is stamped with the Covenant's seal.", "Cold air breathes through the joints."],
  pyre: ["A burned-out pyre beside the road, the ash still warm. Purifier work.", "Someone is chained to the stake in what is left. You look away."],
};
for (const id of Object.keys(MAP_DEFS)) if (MAP_DEFS[id].south) MAP_DEFS[id].looks = Object.assign({}, ETH_LOOKS, MAP_DEFS[id].looks || {});

/* the field Pillars of southern Etharis, by the names travellers use for them: rest, party swaps, travel */
Object.assign(PILLAR_NAMES, { eth_gate: "the South Road", stonebridge: "Stonebridge green", verrin: "Verrin's gate square", millhaven: "Millhaven green",
  aurelm: "Aurelm's gate square", rotmoor: "Rotmoor's gate", capital_road: "the Capital Road" });
for (const id in MAP_DEFS) if (MAP_DEFS[id].south) for (const p of MAP_DEFS[id].pillars || []) if (!PILLARS[p.id]) PILLARS[p.id] = { map: id, name: PILLAR_NAMES[p.id] || p.id, at: [p.tx, p.ty + 2, "down"] };
