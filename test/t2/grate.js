const { boot, jump } = require('./common');
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 1 });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  const E = (fn, a) => pg.evaluate(fn, a);
  await E(() => { Object.assign(window.__durinn.G().flags, { left_oak: true, __nowild: true, secret_lead: true }); });
  await E(() => window.__durinn.eng.warp('os', 30, 25, 'right', { dur: 0.1 })); await pg.waitForTimeout(1200);
  await E(() => window.__durinn.run('look_grate'));
  for (let i = 0; i < 10; i++) { await pg.waitForTimeout(300); if (await pg.$('#dz-choice-0')) { await pg.waitForTimeout(400); await pg.click('#dz-choice-0'); break; } await pg.keyboard.press('e'); }
  await pg.waitForTimeout(2000); console.log('after grate', await E(() => window.__durinn.eng.mapId() + JSON.stringify(window.__durinn.eng.playerTile())));
  await E(() => window.__durinn.run('look_understair'));
  for (let i = 0; i < 10; i++) { await pg.waitForTimeout(300); if (await pg.$('#dz-choice-0')) { await pg.waitForTimeout(400); await pg.click('#dz-choice-0'); break; } await pg.keyboard.press('e'); }
  await pg.waitForTimeout(2000); console.log('after stair', await E(() => window.__durinn.eng.mapId() + JSON.stringify(window.__durinn.eng.playerTile())));
  await pg.keyboard.down('ArrowDown'); await pg.waitForTimeout(900); await pg.keyboard.up('ArrowDown'); await pg.waitForTimeout(1800);
  console.log('walk out', await E(() => window.__durinn.eng.mapId() + JSON.stringify(window.__durinn.eng.playerTile())));
  console.log('ERR', errs.filter((e) => !/TUNNEL/.test(e))); await b.close();
})();
