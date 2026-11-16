const { boot, jump } = require('./common');
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 2 });
  await pg.addStyleTag({ content: '.dz-hint{opacity:0!important}' });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  await pg.evaluate(() => { const G = window.__durinn.G(); G.flags.left_oak = true; G.flags.__nowild = true; });
  const warp = async (m, x, y, d, wait = 1400) => { await pg.evaluate(([m, x, y, d]) => window.__durinn.eng.warp(m, x, y, d, { dur: 0.2 }), [m, x, y, d]); await pg.waitForTimeout(wait); };
  const A = async (w = 450) => { await pg.keyboard.press('e'); await pg.waitForTimeout(w); };
  const shot = (n) => pg.screenshot({ path: `shots2/pl_${n}.png` });
  await warp('plainsSW', 28, 9, 'up'); await shot('hunters');
  await warp('plainsNE', 21, 25, 'up'); await shot('pond');
  // wake the crossroads Pillar
  await warp('plainsSW', 95, 9, 'up'); await A(800); await shot('pillar_wake'); await A(600); await shot('pillar_menu');
  console.log('pillars', JSON.stringify(await pg.evaluate(() => window.__durinn.G().pillars)));
  if (await pg.$('#dz-pillar-close')) await pg.click('#dz-pillar-close');
  // cross the seam from SW into SE along the main road, on foot
  await warp('plainsSW', 97, 10, 'right'); await pg.keyboard.down('ArrowRight'); await pg.waitForTimeout(1500); await pg.keyboard.up('ArrowRight'); await pg.waitForTimeout(1500);
  console.log('after seam', await pg.evaluate(() => [window.__durinn.eng.mapId(), window.__durinn.eng.playerTile()]));
  await shot('seam');
  // talk to the hunter and open the shop
  await warp('plainsSW', 27, 9, 'up'); await A(); await shot('hunter_talk'); for (let i = 0; i < 6; i++) { if (await pg.$('#dz-choice-0')) { await pg.click('#dz-choice-0'); await pg.waitForTimeout(500); break; } await A(300); }
  await pg.waitForTimeout(400); await shot('hunter_shop');
  console.log(errs.filter((e) => !/TUNNEL/.test(e))); await b.close();
})();
