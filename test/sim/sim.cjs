const fs = require("fs");
const P = require("path").join(__dirname, "../../src/parts/");
const data = fs.readFileSync(P + "04_data.js", "utf8");
const i = data.indexOf("const ITEMS = {"); let d = 0, j = i;
for (; j < data.length; j++) { if (data[j] === "{") d++; if (data[j] === "}") { d--; if (d === 0) break; } }
const src = data.slice(i, j + 2) + "\n" + fs.readFileSync(P + "06f_magic.js", "utf8") + "\n" + fs.readFileSync(P + "06e_battle.js", "utf8") +
  "\nmodule.exports={createBattle,BTL_FOES,BTL_PARTY,btlStats,BTL,BTL_XP_FOR,weaveSpell,ITEMS};";
const M = {}; new Function("module", "require", src)(M, require);
const { createBattle, BTL_FOES, weaveSpell } = M.exports;
function seeded(s) { return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function run(partyDef, foes, opts = {}) {
  const rng = seeded(opts.seed || 1);
  const B = createBattle({ party: partyDef.map((p) => ({ ...p, hp: 999, mp: 999 })), foes, items: { poultice: opts.poultice ?? 2 }, wait: false, rng, autoRelease: true,
    words: opts.words || { r: [], s: [] } });
  let t = 0;
  while (B.phase === "fight" && t < 300) {
    for (const u of B.ready()) {
      const foesL = B.living("e"); if (!foesL.length) break;
      const tgt = foesL.slice().sort((a, b) => a.hp - b.hp)[0];
      const allies = B.living("p"), low = allies.find((a) => a.hp < a.maxHp * 0.35);
      if (low && B.items.poultice > 0) { B.command(u.id, { type: "item", item: "poultice", target: low.id }); continue; }
      if (opts.spell && u.key === "wren" && u.mp >= 3) { const ok = B.command(u.id, { type: "cast", spell: opts.spell, target: tgt.id }); if (ok) continue; }
      B.command(u.id, { type: "attack", target: tgt.id });
    }
    for (const u of B.units) if (u.cast && u.cast.ready && B.release) B.release(u.id, 1);
    B.step(0.05); t += 0.05;
  }
  const al = B.allies();
  return { win: B.phase === "won", t, hpLeft: al.reduce((a, u) => a + u.hp, 0) / al.reduce((a, u) => a + u.maxHp, 0), ko: al.filter((u) => u.ko).length };
}
function stat(partyDef, foes, opts) {
  let w = 0, hp = 0, tt = 0, N = 200;
  for (let s = 1; s <= N; s++) { const r = run(partyDef, foes, { ...opts, seed: s * 7919 }); w += r.win; hp += r.hpLeft; tt += r.t; }
  return { win: (w / N * 100).toFixed(0) + "%", hp: (hp / N * 100).toFixed(0) + "%", t: (tt / N).toFixed(1) + "s" };
}
module.exports = { run, stat, BTL_FOES, M };
if (require.main === module) {
  const sets = JSON.parse(process.argv[2]);
  for (const [label, party, foes, opts] of sets) console.log(label.padEnd(44), JSON.stringify(stat(party, foes, opts || {})));
}
