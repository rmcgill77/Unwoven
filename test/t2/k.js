const { boot } = require('./common');
(async () => {
  const { b, pg, errs } = await boot();
  console.log(await pg.evaluate(() => {
    const cb = window.__durinn.act2.createBattle, out = [];
    const party = [{ key: 'wren', lv: 9, hp: 999, mp: 99, eq: { weapon: 'greyedge' } }, { key: 'tessa', lv: 9, hp: 999, mp: 99, eq: { weapon: 'tessablade' } }];
    const sim = (foes, secs = 240, words = { r: ['Pyr', 'Fulg', 'San', 'Sens', 'Nix'], s: ['is', 'or', 'at', 'id', 'am'] }, plan) => {
      const B = cb({ party, foes, items: { poultice: 9, antidote: 3, bandage: 3 }, words, rng: Math.random, act2: true, autoRelease: true });
      const log = []; let steps = 0;
      while (B.phase === 'fight' && steps < secs * 60) {
        for (const u of B.ready()) { const f = B.living('e'); if (!f.length) break; const sp = plan ? plan(B, u, f) : null; B.command(u.id, sp || { type: 'attack', target: f[0].id }); }
        B.step(1 / 60); steps++;
        for (const e of B.events.splice(0)) if (['phase', 'text'].includes(e.e) && !/Steady|Clean/.test(e.text || '')) log.push(e.e === 'phase' ? 'PHASE' : e.text);
      }
      const uniq = [...new Set(log)].slice(0, 12).join(', ');
      return `${foes.join('+')}: ${B.phase} in ${(steps / 60).toFixed(0)}s, party hp ${B.allies().map((u) => u.hp + '/' + u.maxHp).join(' ')} | ${uniq}`;
    };
    const caster = (B, u, f) => u.key === 'wren' && u.mp >= 2 ? { type: 'cast', spell: f.some((x) => x.prot > 0) ? 'Fulg-or' : 'Pyr-or', target: f[0].id } : null;
    for (const g of [['cutpurse', 'thug', 'archer'], ['boar', 'rat', 'rat'], ['skelW', 'skelS', 'skelA'], ['golem'], ['construct'], ['orcW', 'orcB', 'orcS'], ['ironcleave', 'orcS', 'orcW'], ['rimefang'], ['snapjaw', 'fspider', 'mandrake2']]) out.push(sim(g, 300, undefined, caster));
    return out.join('\n');
  }));
  console.log(errs.filter((e) => !/TUNNEL/.test(e))); await b.close();
})();
