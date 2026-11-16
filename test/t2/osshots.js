const { boot, jump } = require('./common');
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 2 });
  await pg.addStyleTag({ content: '.dz-hint{opacity:0!important}' });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  const E = (fn, a) => pg.evaluate(fn, a);
  await E(() => { Object.assign(window.__durinn.G().flags, { left_oak: true, __nowild: true }); });
  const warp = async (m, x, y, d, w = 1500) => { await E(([m, x, y, d]) => window.__durinn.eng.warp(m, x, y, d, { dur: 0.15 }), [m, x, y, d]); await pg.waitForTimeout(w); };
  for (const [n, x, y, d] of process.argv.slice(2).map((s) => s.split(','))) { await warp('os', +x, +y, d); await pg.screenshot({ path: `shots2/os_${n}.png` }); }
  console.log(errs.filter((e) => !/TUNNEL/.test(e))); await b.close();
})();
