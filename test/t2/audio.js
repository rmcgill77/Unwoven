const { boot, jump } = require('./common');
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 1 });
  const reqs = []; pg.on('request', (r) => { const u = r.url(); if (/\/(sfx|music)\//.test(u)) reqs.push(u.split('/').slice(-2).join('/')); });
  const fails = []; pg.on('requestfailed', (r) => fails.push(r.url().split('/').slice(-2).join('/')));
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  const E = (fn, a) => pg.evaluate(fn, a); const log = [];
  await E(() => { Object.assign(window.__durinn.G().flags, { left_oak: true, __nowild: true }); });
  await pg.mouse.click(400, 200);
  for (const [m, x, y] of [['plainsSW', 30, 30], ['ash', 26, 40], ['ash_thistle', 7, 7], ['wforest', 14, 4], ['eforest', 3, 27], ['gw', 42, 60], ['os', 49, 50], ['fort', 74, 80], ['fort_cells', 9, 4], ['fort_qm', 6, 7]]) {
    await E(([m, x, y]) => window.__durinn.eng.warp(m, x, y, 'up', { dur: 0.1 }), [m, x, y]); await pg.waitForTimeout(1300);
    await pg.keyboard.down('ArrowUp'); await pg.waitForTimeout(600); await pg.keyboard.up('ArrowUp');
    log.push(m + ' -> ' + await E(() => window.__durinn.music()));
  }
  await E(() => window.__durinn.fight(['frostwolf'])); await pg.waitForTimeout(2500); log.push('fight beasts -> ' + await E(() => window.__durinn.music()));
  console.log(log.join('\n')); console.log('requested', [...new Set(reqs)].join(' ')); console.log('failed', fails.join(' ')); console.log('ERR', errs.filter((e) => !/TUNNEL/.test(e))); await b.close();
})();
