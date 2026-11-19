const { boot, jump } = require('./common');
/* Balance: simulated fights, attack-only party AI (a floor on what a player can do), by area and party level. */
(async () => {
  const { b, pg } = await boot({ viewport: { width: 915, height: 412 }, dsf: 1 });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  const E = (fn, a) => pg.evaluate(fn, a);
  const SC = JSON.parse(process.env.SC || 'null') || [
    ['A2 plains', 7, [['thug', 'cutpurse'], ['archer', 'archer'], ['pscout', 'pscout'], ['boar']]],
    ['A3 roads', 10, [['roadknife', 'roadbow'], ['roadbrute', 'roadknife'], ['roadknife', 'roadknife', 'roadbow'], ['crwolf', 'crwolf', 'crwolf'], ['purburner', 'pscout', 'pscout']]],
    ['A3 roads', 12, [['roadknife', 'roadbow'], ['roadbrute', 'roadknife'], ['roadknife', 'roadknife', 'roadbow'], ['crwolf', 'crwolf', 'crwolf'], ['purburner', 'pscout', 'pscout']]],
    ['A3 curse', 12, [['cbear'], ['cseer', 'chorn'], ['cooze', 'cspike', 'cspike'], ['cgrub', 'chorn'], ['cbear', 'cspike']]],
    ['A3 clash', 11, [['purburner', 'purburner', 'pscout'], ['purbrand', 'purburner', 'pscout']]],
    ['A3 crags', 13, [['skelmin', 'skelmin'], ['ent'], ['ent', 'crwolf'], ['entdead', 'crfrost'], ['minguard', 'minguard']]],
    ['A3 bosses', 11, [['purburner', 'purburner', 'purbrand']]],
    ['A3 bosses', 13, [['overseer', 'minebrute'], ['stonewarden']]],
    ['A3 bosses', 14, [['overseer', 'minebrute'], ['stonewarden'], ['covarbiter', 'covguard', 'covguard']]],
  ];
  const res = await E((SC) => {
    const { createBattle } = window.__durinn.act2, G = window.__durinn.G();
    const party = (lv) => ['wren', 'tessa', 'hakon'].map((key) => ({ key, lv, hp: 9999, mp: 9999, eq: (G.party[key] && G.party[key].eq) || undefined, name: key }));
    const one = (lv, foes) => {
      const B = createBattle({ party: party(lv), foes, wait: false, canFlee: false, autoRelease: true });
      let t = 0;
      while (B.phase === 'fight' && t < 400) {
        for (const u of B.ready()) { const tg = B.living('e').sort((a, b) => a.hp - b.hp)[0]; if (tg) B.command(u.id, { type: 'attack', target: tg.id }); }
        if (B.window) { try { B.release && B.release(0.6); } catch (e) {} }
        B.step(0.05); t += 0.05;
        if (!B.living('e').length || !B.living('p').length) break;
      }
      const P = B.allies(), hp = P.reduce((a, u) => a + Math.max(0, u.hp), 0) / P.reduce((a, u) => a + u.maxHp, 0);
      return { win: B.living('e').length === 0 && B.living('p').length > 0, hp, t };
    };
    return SC.map(([name, lv, groups]) => [name, lv, groups.map((g) => { let w = 0, hp = 0, t = 0; const N = 24; for (let i = 0; i < N; i++) { const r = one(lv, g); w += r.win; hp += r.hp; t += r.t; } return [g.join('+'), Math.round(100 * w / N), Math.round(100 * hp / N), Math.round(t / N)]; })]);
  }, SC);
  for (const [name, lv, rows] of res) { console.log(`${name} @ party lv ${lv}`); for (const r of rows) console.log(`   ${r[0].padEnd(34)} win ${String(r[1]).padStart(3)}%  hp left ${String(r[2]).padStart(3)}%  ${r[3]}s`); }
  await b.close();
})();
