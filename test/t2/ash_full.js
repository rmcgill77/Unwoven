const { boot, jump } = require('./common');
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 1800, height: 2200 }, dsf: 1 });
  await pg.addStyleTag({ content: '.dz-hint{opacity:0!important} .dz-hud,.dz-task,.dz-pack{display:none!important}' });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  await pg.evaluate(() => { window.__durinn.G().flags.left_oak = true; window.__durinn.G().flags.__nowild = true; });
  await pg.evaluate(() => window.__durinn.eng.warp('ash', 27, 34, 'down', { dur: 0.2 })); await pg.waitForTimeout(2500);
  await pg.screenshot({ path: 'shots2/ash_full.png' });
  console.log(errs.length); await b.close();
})();
