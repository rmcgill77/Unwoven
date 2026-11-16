const { boot, jump } = require('./common');
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 1 });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  await pg.evaluate(() => { const G = window.__durinn.G(); G.flags.left_oak = true; G.flags.__nowild = true; });
  for (const y of [9, 10]) {
    await pg.evaluate((y) => window.__durinn.eng.warp('plainsSW', 95, y, 'up', { dur: 0.1 }), y); await pg.waitForTimeout(1500);
    console.log(y, JSON.stringify(await pg.evaluate(() => { const e = window.__durinn.eng; const t = e.playerTile(); const m = e.debugState().map; return { i: e.interact(), t, row: m.cells[t[1]-1].slice(t[0]-2, t[0]+3), dir: e.debugState().player.dir }; })));
  }
  await pg.evaluate(() => window.__durinn.eng.warp('plainsSW', 95, 9, 'up', { dur: 0.1 })); await pg.waitForTimeout(1300); await pg.keyboard.down('ArrowUp'); await pg.waitForTimeout(250); await pg.keyboard.up('ArrowUp'); await pg.waitForTimeout(200);
  console.log(JSON.stringify(await pg.evaluate(() => window.__durinn.eng.interact())));
  await pg.keyboard.press('e'); await pg.waitForTimeout(800);
  console.log(await pg.evaluate(() => JSON.stringify(window.__durinn.G().pillars)));
  console.log(errs.filter((e) => !/TUNNEL/.test(e))); await b.close();
})();
