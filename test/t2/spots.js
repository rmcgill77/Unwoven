const { boot, jump } = require('./common');
/* screenshots of fixed spots: SPOTS env "map,x,y;..." ; OUT prefix */
(async () => {
  const vp = process.env.TALL ? { width: 412, height: 915 } : { width: 915, height: 412 };
  const { b, pg, errs } = await boot({ viewport: vp, dsf: 2 });
  await pg.addStyleTag({ content: '.dz-hint{opacity:0!important}' });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  await pg.evaluate(() => { const G = window.__durinn.G(); G.flags.__nowild = true; });
  const spots = (process.env.SPOTS || '').split(';').filter(Boolean);
  for (const sp of spots) {
    const [m, x, y, night] = sp.split(',');
    await pg.evaluate(([m, x, y]) => window.__durinn.eng.warp(m, +x, +y, 'down', { dur: 0.1 }), [m, x, y]);
    await pg.waitForTimeout(1800);
    if (night) { await pg.evaluate(() => window.__durinn.eng.setNight(true, false)); await pg.waitForTimeout(500); }
    await pg.screenshot({ path: `shots2/${process.env.OUT || 'spot'}_${m}_${x}_${y}.png` });
    if (night) await pg.evaluate(() => window.__durinn.eng.setNight(false, false));
  }
  console.log('errors', errs.filter((e) => !/TUNNEL|fonts/.test(e)).slice(0, 5));
  await b.close();
})();
