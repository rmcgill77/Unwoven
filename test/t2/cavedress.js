const { boot, jump } = require('./common');
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 1 });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  const E = (fn, a) => pg.evaluate(fn, a);
  await E(() => { const G = window.__durinn.G(); G.flags.__nowild = true; G.time = 10 * 60; for (const k of ['reached_mine', 'reached_shrine', 'reached_au_culvert', 'reached_rot_cellar']) G.flags[k] = true; });
  for (const [m, x, y] of [['caveA', 10, 8], ['caveB', 12, 6], ['caveD', 10, 10], ['caveS', 9, 6], ['cr_mine1', 22, 10], ['cr_mine2', 20, 8], ['cr_shrine', 20, 12], ['au_culvert', 18, 7], ['rot_cellar', 10, 6]]) {
    await E(([m, x, y]) => window.__durinn.eng.warp(m, x, y, 'down', { dur: 0.05 }), [m, x, y]); await pg.waitForTimeout(1600);
    for (let i = 0; i < 20 && await pg.$('.dz-dialog'); i++) { await pg.keyboard.press('e'); await pg.waitForTimeout(250); }
    await pg.screenshot({ path: `shots2/dress_${m}.png` });
  }
  console.log(errs.filter((e) => !/TUNNEL|fonts/.test(e)).slice(0, 3).join(' | ') || 'no errors'); await b.close();
})();
