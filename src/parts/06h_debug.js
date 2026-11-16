/* ------------------------------------------------------------------ */
/* Testing tools: jump to story checkpoints, give things, teleport.   */
/* ------------------------------------------------------------------ */
const DBG_QUEST_ITEMS = ["letter", "mooncap", "charm", "parcel", "oil", "delivery", "tome", "candle"];
const DBG_STAGES = [
  { id: "d1_sent", label: "Day 1 · Sent to Maud", day: 1, lv: 1, flags: ["d1_intro", "d1_job", "d1_order", "d1_delivered", "d1_paid", "d1_witch", "d1_sword_ask"], items: { letter: 1, poultice: 2 }, at: ["shop", 6, 8, "up"] },
  { id: "d1_sword", label: "Day 1 · Sword in hand, north road open", day: 1, lv: 1, flags: ["d1_sword", "chest_c_sword", "d4_open"], items: { oldsword: 1 }, at: ["oak", 24, 3, "up"] },
  { id: "d1_maud", label: "Day 1 · Met Maud", day: 1, lv: 2, flags: ["d1_maud"], drop: ["letter"], at: ["wood", 94, 12, "down"] },
  { id: "d2", label: "Day 2 · Morning", day: 2, lv: 2, flags: ["d1_report"], at: ["oak", 24, 21, "down"] },
  { id: "d3", label: "Day 3 · The Arbitrator arrives", day: 3, lv: 3, flags: ["metTessa", "d2_errand", "d2_errand_done", "d2_stranger", "d2_scene", "d2_tome", "d2_study", "magic", "d3_mentor"], words: [["Phaos", "Vis"], ["is", "or"]], hotbar: ["Phaos-is", "Vis-is", "Vis-or", null], at: ["oak", 24, 21, "down"] },
  { id: "d4_bargain", label: "Day 4 · Maud's bargain", day: 4, lv: 3, flags: ["d3_scene", "d3_study", "south_open", "d4_errand"], choice: "truth", words: [["Pyr", "Nix", "San"], ["at", "am"]], at: ["wood", 94, 12, "down"] },
  { id: "d4_cave", label: "Day 4 · At the sealed cave", day: 4, lv: 4, flags: ["d4_bargain"], words: [["Bary"], []], at: ["rocks", 86, 29, "right"] },
  { id: "d4_cap", label: "Day 4 · Moon-cap in hand", day: 4, lv: 4, flags: ["moved_seal", "got_mooncap"], items: { mooncap: 1 }, at: ["wood", 94, 12, "down"] },
  { id: "d4_fire", label: "Day 4 · Charm in hand, the town burns", day: 4, lv: 4, flags: ["d4_maud"], drop: ["mooncap"], items: { charm: 1 }, at: ["wood", 10, 57, "down"] },
  { id: "d7_ash", label: "Day 7 · Ashes of Oakhaven", day: 7, lv: 5, flags: ["d4_fire", "d4_lost", "d5_ash", "act1_end"], drop: ["charm"], party: ["tessa"], at: ["oak", 24, 21, "down"] },
  { id: "a2_start", label: "Act 2 · The world opens (Pillar rest)", day: 7, lv: 6, flags: ["act2"], at: ["oak", 24, 21, "up"] },
  { id: "a2_plains", label: "Act 2 · On the Open Plains", day: 7, lv: 7, flags: ["tut_pillar", "left_oak"], at: ["plainsSW", 2, 28, "right"] },
  { id: "a2_rebuilt", label: "Act 2 · Oakhaven rebuilt (chapter 8 preview)", day: 12, lv: 12, flags: ["tut_pillar", "oak_rebuilt", "memit", "d4_open", "south_open"], at: ["oak", 44, 19, "left"] },
];
const DBG_SPOTS = [
  ["Oakhaven square", "oak", 24, 21, "down"], ["Oakhaven north gate", "oak", 24, 3, "up"], ["Oakhaven south gate", "oak", 23, 57, "down"],
  ["Workshop", "shop", 6, 8, "up"], ["Storeroom", "shop_store", 3, 4, "up"], ["Pike's Provisions", "store", 6, 7, "up"], ["Pike's stockroom", "store_back", 3, 5, "up"],
  ["Mayor's house", "hall", 6, 7, "up"], ["Mayor's study", "hall_study", 4, 4, "up"], ["Hollow Oak", "tavern", 9, 10, "up"], ["Tavern kitchen", "tavern_kitchen", 5, 4, "up"], ["Guest room", "tavern_guest", 4, 4, "up"],
  ["Chapel", "chapel", 5, 8, "up"], ["Vestry", "chapel_vestry", 3, 3, "up"], ["Garrick's cottage", "cottage_g", 4, 6, "up"], ["Garrick's bedroom", "cottage_g_bed", 3, 3, "up"],
  ["Dye House", "cottage_h", 4, 6, "up"], ["Dye store", "cottage_h_back", 3, 3, "up"], ["Crop-foot Farm", "cottage_e", 4, 6, "up"], ["Farm pantry", "cottage_e_back", 3, 3, "up"],
  ["Maud's hut", "hut", 4, 6, "up"],
  ["Plains · from Oakhaven", "plainsSW", 2, 28, "right"], ["Plains · farmstead", "plainsSW", 34, 24, "down"], ["Plains · Ashford gate", "plainsSW", 58, 31, "up"], ["Plains · hunters' camp", "plainsSW", 28, 9, "up"],
  ["Plains · crossroads Pillar", "plainsSW", 95, 10, "up"], ["Plains · standing stones", "plainsSW", 92, 40, "up"], ["Plains · Purifier camp", "plainsSW", 70, 42, "up"], ["Plains · west forest trail", "plainsSW", 15, 53, "down"],
  ["Plains · burned wagon", "plainsSE", 8, 5, "right"], ["Plains · Rook's Hollow", "plainsSE", 30, 44, "up"], ["Plains · Wayfarers' fire", "plainsSE", 40, 4, "up"], ["Plains · east forest trail", "plainsSE", 78, 20, "right"],
  ["Plains · ambush camp", "plainsNW", 60, 47, "up"], ["Plains · Greywick gate", "plainsNW", 97, 33, "up"], ["Plains · Overlook Pillar", "plainsNE", 18, 42, "up"], ["Plains · frozen pond", "plainsNE", 21, 25, "up"], ["Plains · boundary stone", "plainsNE", 48, 10, "up"], ["Maud's loft", "hut_loft", 3, 3, "up"],
  ["Ashford · square", "ash", 26, 30, "up"], ["Ashford · the Thistle", "ash_thistle", 8, 9, "up"],
  ["West Forest · mouth", "wforest", 14, 4, "down"], ["West Forest · spider hollow", "wforest", 45, 13, "up"], ["West Forest · moon-cap glade", "wforest", 41, 41, "down"], ["West Forest · ruin Pillar", "wforest", 65, 29, "up"], ["West Forest · construct", "wforest", 82, 38, "down"],
  ["East Forest · edge", "eforest", 3, 27, "right"], ["East Forest · palisade gate", "eforest", 26, 27, "right"], ["East Forest · lumber yard", "eforest", 42, 32, "up"], ["East Forest · captive pens", "eforest", 58, 28, "up"], ["East Forest · war camp", "eforest", 72, 28, "up"], ["East Forest · the bluff", "eforest", 80, 13, "up"],
  ["Greywick · gate", "gw", 42, 63, "up"], ["Greywick · Pillar", "gw", 27, 33, "up"], ["Greywick · Lamp House", "gw_lamp", 6, 8, "up"],
  ["Fort · south gate", "fort", 74, 89, "up"], ["Fort · Pillar Square", "fort", 74, 49, "up"], ["Fort · Command Post", "fort", 74, 20, "up"], ["Fort · training yard", "fort", 128, 50, "up"], ["Fort · storehouse", "fort", 18, 44, "up"], ["Fort · lower quarter", "fort", 20, 70, "up"],
  ["Outskirts · south road", "os", 49, 56, "up"], ["Outskirts · south gate", "os", 49, 45, "up"], ["Outskirts · north gate", "os", 49, 7, "down"], ["Outskirts · cleft", "os", 26, 25, "right"], ["Outskirts · tor", "os", 12, 12, "up"],
  ["Woods · south gate", "wood", 11, 57, "up"], ["Woods · trail", "wood", 30, 37, "down"], ["Woods · deep", "wood", 58, 22, "down"], ["Woods · Maud's cottage", "wood", 94, 12, "down"],
  ["Rocks · north gate", "rocks", 49, 2, "down"], ["Rocks · sealed cave", "rocks", 86, 29, "right"],
  ...["caveA", "caveB", "caveC", "caveD", "caveS"].map((id) => { const w = MAP_DEFS[id].warps[0]; return [MAP_DEFS[id].name || id, id, w.x, w.y - 1, "up"]; }),
];
const DBG_FIGHTS = [["Wolf", ["wolf"]], ["Wolf + hound", ["wolf", "hound"]], ["Hound pair", ["hound", "hound"]], ["Scarred Alpha", ["alpha"]], ["Cave hounds", ["cavehound", "cavehound"]], ["Old Blind Hound", ["blindhound"]]];
DBG_FIGHTS.push(
  ["A2 · Plains by day: cutpurse, thug, archer", ["cutpurse", "thug", "archer"]], ["A2 · Boar and field rats", ["boar", "rat", "rat"]], ["A2 · Three slimes", ["mslime", "fslime", "rslime"]],
  ["A2 · Plains by night: skeletons", ["skelW", "skelS", "skelA"]], ["A2 · Purifier scouts", ["pscout", "pscout"]], ["A2 · Rock Golem", ["golem"]],
  ["A2 · Ambush captain and band", ["captain", "cutpurse", "archer"]], ["A2 · Rook's Hollow leader", ["rook", "thug", "archer"]], ["A2 · Purifier cell leader", ["pleader", "pscout", "pscout"]],
  ["A2 · West Forest: snapjaw, spider, mandrake", ["snapjaw", "fspider", "mandrake2"]], ["A2 · West Forest night: ley wolf and bats", ["leywolf2", "bat2", "bat2"]], ["A2 · Worn Covenant Construct", ["construct"]],
  ["A2 · Camp: orc warrior, berserk, shaman", ["orcW", "orcB", "orcS"]], ["A2 · Camp: bandit knight and archers", ["bknight", "barcher", "barcher"]], ["A2 · The Iron Cleave", ["ironcleave", "orcS", "orcW"]],
  ["A2 · Outskirts: snow boar, frost spider, wisp", ["snowboar", "frostspider", "wisp"]], ["A2 · Outskirts: Frozen Vale scouts", ["valescout", "valeberserk", "valeshaman"]], ["A2 · Rimefang", ["rimefang"]],
);

function dbgHeal(G) { btlEnsureParty(G); for (const id of G.partyIds) { const s = btlStatsFor(G, id, G.party[id].lv); G.party[id].hp = s.hp; G.party[id].mp = s.mp; } }
function dbgSetLevel(G, lv) {
  btlEnsureParty(G);
  for (const id of G.partyIds) { G.party[id].lv = lv; G.party[id].xp = 0; }
  dbgHeal(G);
}
function dbgLearnAll(G) {
  G.words = { r: [...ALL_WORDS.r], s: [...ALL_WORDS.s] }; G.flags.magic = true;
  if (!G.hotbar || !G.hotbar.some(Boolean)) G.hotbar = ["Pyr-or", "Fulg-at", "San-is", "Vis-ix"];
}
function dbgGive(G, id, n = 1) {
  G.items[id] = (G.items[id] || 0) + n;
  const it = ITEMS[id];
  if (it && it.gear && !(G.equip && G.equip.wren && G.equip.wren[it.gear.slot])) gearEquip(G, id, "wren");
}
function dbgClearLoot(G) { for (const k of Object.keys(G.flags)) if (/^(chest_|herb_|bloom_)/.test(k)) delete G.flags[k]; G.picked = {}; G.regrew = {}; }
/* Rebuild the story state up to a checkpoint. Returns where to put the player. */
function dbgJump(G, idx) {
  const keep = {}; for (const k of ["__nowild"]) if (G.flags[k]) keep[k] = G.flags[k];
  const flags = {}, words = { r: [], s: [] }; let items = {}, last = DBG_STAGES[idx], hotbar = null, choice = null, party = [];
  for (let i = 0; i <= idx; i++) {
    const s = DBG_STAGES[i];
    for (const f of s.flags) flags[f] = true;
    if (s.words) { words.r.push(...s.words[0]); words.s.push(...s.words[1]); }
    if (s.hotbar) hotbar = s.hotbar; if (s.choice) choice = s.choice; if (s.party) party = s.party;
    for (const d of s.drop || []) delete items[d];
    for (const k in s.items || {}) items[k] = s.items[k];
  }
  if (choice) flags.d3_choice = choice;
  act2Ensure(G); G.respawn = "oak"; G.slain = {};
  Object.assign(G, { flags: { ...flags, ...keep }, day: last.day, time: DAY_T, jobsToday: 0, jobsDay: last.day, words, hotbar: hotbar || G.hotbar || [null, null, null, null] });
  if (!words.r.length) G.words = { r: [], s: [] };
  for (const q of DBG_QUEST_ITEMS) delete G.items[q];
  for (const k in items) G.items[k] = Math.max(G.items[k] || 0, items[k]);
  btlEnsureParty(G);
  for (const id of party) if (!G.partyIds.includes(id)) { G.partyIds.push(id); G.party[id] = btlFreshMember(id, last.lv); }
  if (G.flags.act2) act2Kit(G);
  if (G.items.oldsword && !(G.equip && G.equip.wren && G.equip.wren.weapon)) gearEquip(G, "oldsword", "wren");
  if (G.party.wren.lv < last.lv) dbgSetLevel(G, last.lv); else dbgHeal(G);
  return last.at;
}
