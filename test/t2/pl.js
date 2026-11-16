const { boot, jump } = require('./common');
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 2 });
  await pg.addStyleTag({ content: '.dz-hint{opacity:0!important}' });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  const warp = async (m, x, y, d, wait = 1200) => { const t0 = Date.now(); await pg.evaluate(([m, x, y, d]) => window.__durinn.eng.warp(m, x, y, d, { dur: 0.2 }), [m, x, y, d]); await pg.waitForTimeout(wait); return Date.now() - t0; };
  const A = async (w = 450) => { await pg.keyboard.press('e'); await pg.waitForTimeout(w); };
  const shot = (n) => pg.screenshot({ path: `shots2/pl_${n}.png` });
  // walk out through the east gate
  await warp('oak', 45, 18, 'right');
  const t0 = Date.now(); await pg.keyboard.down('ArrowRight'); await pg.waitForTimeout(900); await pg.keyboard.up('ArrowRight'); await pg.waitForTimeout(3500);
  console.log('after gate map', await pg.evaluate(() => window.__durinn.eng.mapId()), Date.now() - t0, 'ms');
  await shot('01_arrive');
  for (let i = 0; i < 4; i++) await A();
  // walk back west: barred
  await pg.keyboard.down('ArrowLeft'); await pg.waitForTimeout(600); await pg.keyboard.up('ArrowLeft'); await pg.waitForTimeout(500); await shot('02_barred'); await A(); await A();
  console.log('map after barred', await pg.evaluate(() => window.__durinn.eng.mapId()));
  await pg.evaluate(() => { window.__durinn.G().flags.__nowild = true; });
  const spots = [['plainsSW', 34, 24, 'down', 'farm'], ['plainsSW', 58, 31, 'down', 'ashford_gate'], ['plainsSW', 28, 9, 'up', 'hunters'], ['plainsSW', 82, 17, 'right', 'bridge'], ['plainsSW', 94, 12, 'up', 'crossroads'], ['plainsSW', 92, 39, 'up', 'stones'], ['plainsSW', 70, 41, 'up', 'pcamp'],
    ['plainsSE', 8, 5, 'right', 'wagon'], ['plainsSE', 30, 43, 'down', 'rook'], ['plainsNW', 60, 47, 'up', 'ambush'], ['plainsNW', 97, 33, 'up', 'greywick'], ['plainsNE', 15, 44, 'up', 'overlook'], ['plainsNE', 34, 28, 'up', 'pond'], ['plainsNE', 48, 10, 'up', 'boundary']];
  for (const [m, x, y, d, n] of spots) { const ms = await warp(m, x, y, d, 1400); await shot(n); console.log(n, ms + 'ms'); }
  // a pillar in the field: wake it
  await warp('plainsSW', 95, 10, 'up'); await A(700); await shot('pillar_wake'); for (let i = 0; i < 2; i++) await A(500);
  console.log('pillars', JSON.stringify(await pg.evaluate(() => window.__durinn.G().pillars)));
  console.log(errs.filter((e) => !/TUNNEL/.test(e))); await b.close();
})();
