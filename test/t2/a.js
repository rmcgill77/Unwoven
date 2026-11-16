const { boot, jump } = require('./common');
(async () => {
  const { b, pg, errs } = await boot();
  await pg.screenshot({ path: 'shots2/a0_start.png' });
  await jump(pg, 'a2_start');
  await pg.screenshot({ path: 'shots2/a1_tut.png' });
  console.log('tut', !!(await pg.$('#dz-pillar-tut')));
  await pg.click('#dz-pillar-tut-ok'); await pg.waitForTimeout(300);
  await pg.evaluate(() => window.__durinn.pillar()); await pg.waitForTimeout(300);
  await pg.screenshot({ path: 'shots2/a2_pillar.png' });
  const before = await pg.evaluate(() => { const G = window.__durinn.G(); return { time: G.time, day: G.day, rests: G.rests, hp: G.party.wren.hp }; });
  await pg.click('#dz-pillar-swap'); await pg.waitForTimeout(2500);
  const after = await pg.evaluate(() => { const G = window.__durinn.G(); return { time: G.time, day: G.day, rests: G.rests, respawn: G.respawn, flags: Object.keys(G.flags).join(',') }; });
  console.log(JSON.stringify(before), JSON.stringify(after));
  await pg.screenshot({ path: 'shots2/a3_night.png' });
  console.log('errors', errs);
  await b.close();
})();
