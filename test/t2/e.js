const { boot, jump } = require('./common');
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 640, height: 360 }, dsf: 3 });
  const warp = async (m, x, y, d) => { await pg.evaluate(([m, x, y, d]) => window.__durinn.eng.warp(m, x, y, d, { dur: 0.2 }), [m, x, y, d]); await pg.waitForTimeout(1000); };
  const shot = (n) => pg.screenshot({ path: `shots2/${n}.png` });
  await jump(pg, 'a2_rebuilt');
  await warp('oak', 41, 18, 'right'); await shot('e1_gate_open');
  await pg.evaluate(() => { window.__durinn.G().flags.__gate_shut = true; window.__durinn.eng.refreshWorld(); }); await warp('oak', 41, 18, 'right'); await shot('e2_gate_shut');
  await pg.evaluate(() => { delete window.__durinn.G().flags.__gate_shut; window.__durinn.eng.refreshWorld(); });
  await warp('oak', 16, 12, 'left'); await shot('e3_memorial');
  console.log(errs.filter((e) => !/ERR_TUNNEL/.test(e))); await b.close();
})();
