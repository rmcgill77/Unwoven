const { boot, jump } = require('./common');
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 2 });
  await jump(pg, 'a2_start'); await pg.click('#dz-pillar-tut-ok'); await pg.waitForTimeout(300);
  await pg.evaluate(() => window.__durinn.fight(['rimefang'])); await pg.waitForTimeout(1200);
  await pg.evaluate(() => { document.querySelectorAll('.dz-btipcard').forEach((x) => x.remove()); });
  await pg.waitForTimeout(600); await pg.screenshot({ path: 'shots2/rime.png' });
  console.log(errs.filter((e) => !/TUNNEL/.test(e))); await b.close();
})();
