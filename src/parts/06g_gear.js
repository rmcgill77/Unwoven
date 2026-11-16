/* Gear icons: 16 x 16 pixel art drawn from row strings */
const GEAR_ICON_ROWS = {
  oldsword: [["..............k.", "............kwk.", "...........kwwk.", "..........kwwk..", ".........kwwk...", "........kwwk....", ".......kwwk.....", "..k...kwwk......", "..kk.kwwk.......", "...kkwwk........", "....kwk.........", "...kbkk.........", "..kbbk..........", ".kbk.kk.........", "kbk.............", "kk.............."], { k: "#1c1620", w: "#9aa3ad", b: "#6a4a2a" }],
  thornwake: [["..............kk", ".............kwk", "............kwgk", "..........tkwgk.", "..........kwgkt.", "........tkwgk...", "........kwgk.t..", "......tkwgkk....", "......kwgkt.....", "..k..kwgk.......", "..tk.kgk........", "...tkvk.........", "...kbvk.........", "..kbvk.tk.......", ".kbk..k.........", "kkk............."], { k: "#16201a", w: "#a9c0a2", g: "#4f8a3a", t: "#c8b890", b: "#3a2a1a", v: "#5f9a44" }],
  jerkin: [["................", "....kk....kk....", "...kttkkkkttk...", "..kttttttttttk..", "..kttddttddttk..", ".kktttdttdtttkk.", "kttktttddtttktk.", "kttkttttttttktk.", "kttkttddddttktk.", "kkkkttttttttkkk.", "...kttttttttk...", "...kttddddttk...", "...kttttttttk...", "...kkkkkkkkkk...", "................", "................"], { k: "#1c1620", t: "#8a6a44", d: "#5e4630" }],
  ironcap: [["................", "................", "....kkkkkkkk....", "...kcccccccck...", "..kccccccccck...", "..kcccckkcccck..", ".kccccktkcccck..", ".kcccckttkccck..", ".kccckttttkcck..", ".kcccktttttkck..", ".kkcckkkkkkkkk..", "..kkk...........", "................", "................", "................", "................"], { k: "#1c1620", c: "#5d5a64", t: "#2a2430" }],
  medal: [["................", "....rr..rr......", ".....rrrr.......", "......rr........", ".....kkkk.......", "....kyyyyk......", "...kyyhhyyk.....", "...kyhyyhyk.....", "...kyhyyyyk.....", "...kyyyyyyk.....", "....kyyyyk......", ".....kkkk.......", "................", "................", "................", "................"], { k: "#1c1620", r: "#8f2c2c", y: "#b8913a", h: "#e3c874" }],
  pebble: [["................", "................", "................", ".....kkkk.......", "...kkgggkk......", "..kgggggggk.....", "..kgggwgggk.....", "..kggggggk......", "...kkgggkk......", ".....kkk........", "................", "................", "................", "................", "................", "................"], { k: "#1c1620", g: "#7c7c86", w: "#a6a6b0" }],
};
const GEAR_ICON_CACHE = {};
/* pack icons (32 x 32) decode from the baked strip; until they do, a thing shows the pebble */
const GEAR_BIG = {};
(function () {
  if (typeof Image === "undefined" || typeof GEAR_ATLAS === "undefined") return;
  const im = new Image();
  im.onload = () => GEAR_ATLAS.ids.forEach((id, i) => { const c = makeCanvas(32, 32); c.getContext("2d").drawImage(im, i * 32, 0, 32, 32, 0, 0, 32, 32); GEAR_BIG[id] = c; });
  im.src = GEAR_ATLAS.src;
})();
const GEAR_ICON_ALIAS = { helm: "greathelm" };
function gearIcon(id) {
  const big = GEAR_BIG[id] || GEAR_BIG[GEAR_ICON_ALIAS[id]]; if (big) return big;
  if (GEAR_ICON_CACHE[id]) return GEAR_ICON_CACHE[id];
  const def = GEAR_ICON_ROWS[id] || GEAR_ICON_ROWS.pebble, c = makeCanvas(16, 16), x = c.getContext("2d");
  def[0].forEach((r, y) => [...r].forEach((ch, i) => { if (def[1][ch]) { x.fillStyle = def[1][ch]; x.fillRect(i, y, 1, 1); } }));
  return (GEAR_ICON_CACHE[id] = c);
}
function gearText(it) {
  const out = Object.keys(GEAR_STATS).filter((k) => it.gear[k]).map((k) => `${GEAR_STATS[k]} ${it.gear[k] > 0 ? "+" : ""}${it.gear[k]}`);
  if (it.gear.spell) out.push(`Spells +${Math.round(it.gear.spell * 100)}%`);
  if (it.gear.guard) out.push(`Guard +${Math.round(it.gear.guard * 100)}%`);
  return out.join("  ");
}
/* who may carry what: a few things belong to one person. One of a thing cannot be in two hands. */
function gearFits(id, who) { const it = ITEMS[id]; return !!it && !!it.gear && (!it.who || it.who === who); }
function gearEquipFor(G, id, who) {
  if (!gearFits(id, who)) return false;
  const users = Object.keys(G.equip || {}).filter((w) => w !== who && G.equip[w][ITEMS[id].gear.slot] === id);
  if (users.length >= (G.items[id] || 0)) for (const w of users.slice(0, 1)) gearRemove(G, ITEMS[id].gear.slot, w);
  return gearEquip(G, id, who);
}
/* Act Two kit: Tessa carries her uncle's tavern sword */
function act2Kit(G) {
  if (!G.partyIds || !G.partyIds.includes("tessa") || G.flags.kit_tessa) return;
  G.flags.kit_tessa = true; giveItem(G, "tessablade", 1); gearEquip(G, "tessablade", "tessa");
}
