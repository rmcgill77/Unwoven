const { boot } = require('./common');
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 640, height: 360 }, dsf: 3 });
  const warp = async (m, x, y, d) => { await pg.evaluate(([m, x, y, d]) => window.__durinn.eng.warp(m, x, y, d, { dur: 0.2 }), [m, x, y, d]); await pg.waitForTimeout(900); };
  const A = async (w = 350) => { await pg.keyboard.press('e'); await pg.waitForTimeout(w); };
  const shot = (n) => pg.screenshot({ path: `shots2/${n}.png` });
  await pg.evaluate(() => { window.__durinn.G().flags.__nowild = true; });
  await warp('store_back', 8, 5, 'right'); await shot('c1');
  await pg.keyboard.press('e'); await pg.waitForTimeout(140); await shot('c2');
  await pg.waitForTimeout(500); for (let i = 0; i < 4; i++) await A(); await shot('c3');
  await warp('wood', 23, 38, 'left'); await shot('c4');
  await A(); await A(); await A(); await shot('c5');
  console.log(errs.filter((e) => !/ERR_TUNNEL/.test(e)));
  await b.close();
})();
