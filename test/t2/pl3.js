const { boot, jump } = require('./common');
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 2 });
  await pg.addStyleTag({ content: '.dz-hint{opacity:0!important}' });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  await pg.evaluate(() => { const G = window.__durinn.G(); G.flags.left_oak = true; G.flags.__nowild = true; });
  const warp = async (m, x, y, d, wait = 1400) => { await pg.evaluate(([m, x, y, d]) => window.__durinn.eng.warp(m, x, y, d, { dur: 0.2 }), [m, x, y, d]); await pg.waitForTimeout(wait); };
  const A = async (w = 450) => { await pg.keyboard.press('e'); await pg.waitForTimeout(w); };
  const shot = (n) => pg.screenshot({ path: `shots2/pl_${n}.png` });
  const where = () => pg.evaluate(() => [window.__durinn.eng.mapId(), ...window.__durinn.eng.playerTile()]);
  // SW -> SE along the road (global x 99 -> 101)
  await warp('plainsSW', 96, 9, 'right'); await pg.keyboard.down('ArrowRight'); await pg.waitForTimeout(1300); await pg.keyboard.up('ArrowRight'); await pg.waitForTimeout(1500);
  console.log('east seam', await where()); await shot('seam_e');
  // SE -> NE going north on the road near global (110,50)
  await warp('plainsSE', 9, 3, 'up'); await pg.keyboard.down('ArrowUp'); await pg.waitForTimeout(1200); await pg.keyboard.up('ArrowUp'); await pg.waitForTimeout(1500);
  console.log('north seam', await where()); await shot('seam_n');
  // the hunter and his shop
  await warp('plainsSW', 27, 9, 'up'); await A(600); await shot('hunter_talk');
  for (let i = 0; i < 6 && !(await pg.$('#dz-choice-0')); i++) await A(400);
  if (await pg.$('#dz-choice-0')) { await pg.click('#dz-choice-0'); await pg.waitForTimeout(700); }
  await shot('hunter_shop'); console.log('shop open', !!(await pg.$('#dz-shop-close')));
  if (await pg.$('#dz-shop-close')) await pg.click('#dz-shop-close');
  // the stones: take the cache, the golem wakes
  await pg.evaluate(() => { delete window.__durinn.G().flags.__nowild; });
  await warp('plainsSW', 92, 37, 'up'); await A(600); for (let i = 0; i < 4; i++) await A(500); await pg.waitForTimeout(1500); await shot('golem_wake');
  console.log('flags', await pg.evaluate(() => !!window.__durinn.G().flags.stones_taken), 'fight', !!(await pg.$('.dz-battle')));
  console.log(errs.filter((e) => !/TUNNEL/.test(e))); await b.close();
})();
