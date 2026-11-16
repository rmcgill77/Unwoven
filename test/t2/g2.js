const { boot, jump } = require('./common');
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 2 });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok'); await pg.waitForTimeout(300);
  for (const [i, g] of [[0, ['golem']]]) {
    await pg.evaluate((g) => window.__durinn.fight(g), g); await pg.waitForTimeout(1500);
    { const tip = await pg.$('.dz-btipcard .dz-act'); if (tip) await tip.click(); }
    await pg.waitForTimeout(2600); await pg.screenshot({ path: `shots2/q${i}.png` });
    await pg.evaluate(() => { const B = document.querySelector('.dz-battle'); }); 
    await pg.reload(); await pg.waitForSelector('#dz-title-continue'); await pg.click('#dz-title-continue'); await pg.waitForTimeout(900); await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  }
  console.log(errs.filter((e) => !/TUNNEL/.test(e))); await b.close();
})();
