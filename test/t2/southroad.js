const { boot, jump } = require('./common');
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 2 });
  await pg.addStyleTag({ content: '.dz-hint{opacity:0!important}' });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  const E = (fn, a) => pg.evaluate(fn, a);
  await E(() => { window.__durinn.G().flags.__nowild = true; });
  for (const [n, x, y] of [['branch', 31, 29], ['road', 33, 42], ['barricade', 37, 54]]) { await E(([x, y]) => window.__durinn.eng.warp('plainsSW', x, y, 'down', { dur: 0.1 }), [x, y]); await pg.waitForTimeout(1600); await pg.screenshot({ path: `shots2/south_${n}.png` }); }
  await pg.keyboard.down('ArrowDown'); await pg.waitForTimeout(1500); await pg.keyboard.up('ArrowDown');
  console.log('after walking south:', await E(() => window.__durinn.eng.mapId() + ' ' + JSON.stringify(window.__durinn.eng.playerTile())));
  await E(() => window.__durinn.eng.warp('plainsSW', 40, 55, 'up', { dur: 0.1 })); await pg.waitForTimeout(1200); await pg.keyboard.press('e'); await pg.waitForTimeout(900);
  console.log('sign:', await E(() => { const t = document.querySelector('.dz-dialog .dz-text'); return t ? t.textContent : 'none'; }));
  await pg.screenshot({ path: 'shots2/south_sign.png' });
  console.log('errors', errs.filter((e) => !e.includes('ERR_TUNNEL')).slice(0, 5)); await b.close();
})();
