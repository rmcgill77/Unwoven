const { boot, jump } = require('./common');
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 2 });
  await pg.addStyleTag({ content: '.dz-hint{opacity:0!important}' });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  const E = (fn, a) => pg.evaluate(fn, a);
  await E(() => { Object.assign(window.__durinn.G().flags, { left_oak: true, __nowild: true, reached_gw: true }); });
  const warp = async (m, x, y, d, w = 1500) => { await E(([m, x, y, d]) => window.__durinn.eng.warp(m, x, y, d, { dur: 0.15 }), [m, x, y, d]); await pg.waitForTimeout(w); };
  const shot = (n) => pg.screenshot({ path: `shots2/gw_${n}.png` });
  for (const [n, x, y, d] of [['gate', 42, 62, 'up'], ['pillar', 28, 34, 'up'], ['lamphouse', 13, 14, 'up'], ['graves', 37, 13, 'up'], ['watch', 46, 11, 'up'], ['chapel', 9, 30, 'up'], ['inn', 39, 26, 'up'], ['forge', 23, 44, 'up'], ['huts', 44, 47, 'up'], ['homes', 16, 52, 'up'], ['southhomes', 25, 60, 'up']]) { await warp('gw', x, y, d); await shot(n); }
  for (const [m, x, y] of [['gw_lamp', 7, 7], ['gw_inn', 7, 7], ['gw_forge', 6, 6], ['gw_chapel', 10, 6]]) { await warp(m, x, y, 'up'); await shot('in_' + m.slice(3)); }
  await warp('gw', 27, 32, 'up'); await E(() => window.__durinn.pillar()); await pg.waitForTimeout(400); if (await pg.$('#dz-pillar-swap')) await pg.click('#dz-pillar-swap'); await pg.waitForTimeout(3500);
  for (let i = 0; i < 6; i++) { if (!(await pg.$('.dz-dialog'))) break; await pg.keyboard.press('e'); await pg.waitForTimeout(250); }
  await warp('gw', 28, 34, 'up'); await shot('night_pillar'); await pg.waitForTimeout(700); await shot('night_pillar2');
  await warp('gw', 40, 27, 'up'); await shot('night_inn');
  console.log(errs.filter((e) => !/TUNNEL/.test(e))); await b.close();
})();
