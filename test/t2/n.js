const { boot, jump } = require('./common');
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 2 });
  await jump(pg, 'a2_start'); await pg.click('#dz-pillar-tut-ok'); await pg.waitForTimeout(300);
  await pg.evaluate(() => { const G = window.__durinn.G(); G.flags.btip = true; G.flags.btip2 = true; });
  const groups = [['cutpurse', 'thug', 'archer'], ['skelW', 'skelS', 'skelA'], ['pscout', 'pleader'], ['golem'], ['construct'], ['orcW', 'orcB', 'orcS'], ['ironcleave', 'bknight'], ['valescout', 'valeshaman', 'snowboar']];
  let n = 0;
  for (const g of groups) {
    await pg.evaluate((g) => window.__durinn.fight(g), g); await pg.waitForTimeout(1200);
    const tip = await pg.$('.dz-btipcard .dz-act'); if (tip) { await tip.click(); await pg.waitForTimeout(300); }
    await pg.evaluate(() => { document.querySelectorAll('.dz-btipcard').forEach((x) => x.remove()); });
    await pg.screenshot({ path: `shots2/n${n}_a.png` });
    await pg.waitForTimeout(2600); await pg.screenshot({ path: `shots2/n${n}_b.png` });
    // leave the fight
    await pg.evaluate(() => { const r = document.querySelector('#dz-c-flee'); });
    await pg.reload(); await pg.waitForSelector('#dz-title-continue', { timeout: 30000 }); await pg.click('#dz-title-continue'); await pg.waitForTimeout(800);
    if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
    n++;
  }
  console.log(errs.filter((e) => !/TUNNEL/.test(e))); await b.close();
})();
