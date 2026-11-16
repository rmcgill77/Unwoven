const { boot, jump } = require('./common');
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 2 });
  await jump(pg, 'a2_start'); await pg.click('#dz-pillar-tut-ok'); await pg.waitForTimeout(300);
  await pg.evaluate(() => window.__durinn.fight(['wolf'])); await pg.waitForTimeout(2500);
  const fb = await pg.$('.dz-btipcard .dz-act'); if (fb) await fb.click();
  await pg.waitForSelector('#dz-c-attack', { timeout: 20000 }); await pg.click('#dz-c-attack');
  for (let i = 0; i < 8; i++) { await pg.waitForTimeout(140); await pg.screenshot({ path: `shots2/sw${i}.png` }); }
  console.log(errs.filter((e) => !/TUNNEL/.test(e))); await b.close();
})();
