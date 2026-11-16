const { boot, jump } = require('./common');
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 2 });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  const E = (fn, a) => pg.evaluate(fn, a);
  await E(() => { Object.assign(window.__durinn.G().flags, { left_oak: true, __nowild: true }); });
  const warp = async (m, x, y, d, w = 1300) => { await E(([m, x, y, d]) => window.__durinn.eng.warp(m, x, y, d, { dur: 0.15 }), [m, x, y, d]); await pg.waitForTimeout(w); };
  for (const [n, m, x, y, foes] of [['corporal', 'fort', 128, 46, ['sp_corporal']], ['initiate', 'fort', 128, 46, ['sp_initiate']], ['sergeant', 'fort', 128, 46, ['sp_sergeant']], ['curate', 'fort', 128, 46, ['sp_curate']]]) {
    await warp(m, x, y, 'up'); await E((f) => window.__durinn.fight(f), foes);
    for (let i = 0; i < 40; i++) { await pg.waitForTimeout(250); if (await E(() => !!window.__battle && window.__battle.phase === 'fight')) break; }
    await pg.waitForTimeout(500); if (await pg.$('#dz-btip-ok')) await pg.click('#dz-btip-ok'); await pg.waitForTimeout(1200);
    await pg.screenshot({ path: `shots2/bbg_${n}.png` });
    await E(() => { for (const u of window.__battle.units) { if (u.side === 'e') { u.hp = 0; u.ko = true; } else { u.gauge = 0; u.queued = null; } } window.__battle.queue = []; });
    for (let i = 0; i < 40; i++) { await pg.waitForTimeout(250); if (await pg.$('#dz-battle-done')) break; } await pg.click('#dz-battle-done'); await pg.waitForTimeout(1500);
    for (let i = 0; i < 8; i++) { if (!(await pg.$('.dz-dialog'))) break; await pg.keyboard.press('e'); await pg.waitForTimeout(200); }
  }
  console.log('ERR', errs.filter((e) => !/TUNNEL/.test(e))); await b.close();
})();
