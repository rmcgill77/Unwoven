const { boot, jump } = require('./common');
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 2 });
  await pg.addStyleTag({ content: '.dz-hint{opacity:0!important}' });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  const E = (fn, a) => pg.evaluate(fn, a);
  await E(() => { const f = window.__durinn.G().flags; Object.assign(f, { left_oak: true }); });
  const warp = async (m, x, y, d, w = 1500) => { await E(([m, x, y, d]) => window.__durinn.eng.warp(m, x, y, d, { dur: 0.15 }), [m, x, y, d]); await pg.waitForTimeout(w); };
  await warp('wforest', 83, 37, 'down'); await pg.screenshot({ path: 'shots2/wf_statue.png' });
  console.log(JSON.stringify(await E(() => window.__durinn.eng.debugState().wolves.filter((w) => w.statue).map((w) => [w.group[0], Math.round(w.x / 16), Math.round(w.y / 16)]))));
  await warp('wforest', 63, 22, 'up'); await pg.screenshot({ path: 'shots2/wf_husk1.png' });
  await warp('wforest', 75, 39, 'up'); await pg.screenshot({ path: 'shots2/wf_husk2.png' });
  await warp('wforest', 12, 3, 'up'); await pg.keyboard.down('ArrowUp'); await pg.waitForTimeout(1200); await pg.keyboard.up('ArrowUp'); await pg.waitForTimeout(2200);
  console.log('exit to', await E(() => window.__durinn.eng.mapId()));
  console.log('ERR', errs.filter((e) => !/TUNNEL/.test(e))); await b.close();
})();
