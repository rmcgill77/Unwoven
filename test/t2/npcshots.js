const { boot, jump } = require('./common');
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 2 });
  await pg.addStyleTag({ content: '.dz-hint{opacity:0!important}' });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  const E = (fn, a) => pg.evaluate(fn, a);
  await E(() => { Object.assign(window.__durinn.G().flags, { left_oak: true, __nowild: true, reached_ash: true, reached_gw: true, reached_fort: true }); });
  for (const [n, m, x, y] of [['hauler', 'fort', 84, 86], ['sitter', 'fort', 21, 72], ['fort_qm', 'fort_qm', 6, 7], ['fort_mess', 'fort_mess', 8, 8]]) {
    await E(([m, x, y]) => window.__durinn.eng.warp(m, x, y, 'up', { dur: 0.1 }), [m, x, y]); await pg.waitForTimeout(1500); await pg.screenshot({ path: `shots2/npc_${n}.png` }); }
  console.log('ERR', errs.filter((e) => !/TUNNEL/.test(e))); await b.close();
})();
