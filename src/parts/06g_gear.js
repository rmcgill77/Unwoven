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
function gearIcon(id) {
  if (GEAR_ICON_CACHE[id]) return GEAR_ICON_CACHE[id];
  const def = GEAR_ICON_ROWS[id] || GEAR_ICON_ROWS.pebble, c = makeCanvas(16, 16), x = c.getContext("2d");
  def[0].forEach((r, y) => [...r].forEach((ch, i) => { if (def[1][ch]) { x.fillStyle = def[1][ch]; x.fillRect(i, y, 1, 1); } }));
  return (GEAR_ICON_CACHE[id] = c);
}
function gearText(it) { return Object.keys(GEAR_STATS).filter((k) => it.gear[k]).map((k) => `${GEAR_STATS[k]} ${it.gear[k] > 0 ? "+" : ""}${it.gear[k]}`).join("  "); }
