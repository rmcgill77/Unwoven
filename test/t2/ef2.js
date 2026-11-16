const { boot, jump } = require('./common');
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 1 });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  const E = (fn, a) => pg.evaluate(fn, a);
  await E(() => { Object.assign(window.__durinn.G().flags, { left_oak: true, __nowild: true }); });
  await E(() => window.__durinn.eng.warp('eforest', 42, 32, 'up', { dur: 0.1 })); await pg.waitForTimeout(1300);
  for (let i = 0; i < 6; i++) { await pg.keyboard.down('ArrowUp'); await pg.waitForTimeout(120); await pg.keyboard.up('ArrowUp'); await pg.waitForTimeout(100); console.log(JSON.stringify(await E(() => ({ t: window.__durinn.eng.playerTile(), i: window.__durinn.eng.interact() })))); }
  console.log(errs.filter((e) => !/TUNNEL/.test(e))); await b.close();
})();
