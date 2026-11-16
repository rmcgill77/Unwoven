const { boot, jump } = require('./common');
/* walk into each town gate from the plains and land in the town; and back out without bouncing */
(async () => {
  const { b, pg, errs } = await boot();
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  const E = (fn, a) => pg.evaluate(fn, a); const log = [];
  await E(() => { const G = window.__durinn.G(); G.flags.__nowild = true; Object.assign(G.flags, { reached_ash: true, reached_gw: true }); });
  const clear = async () => { for (let i = 0; i < 12 && await pg.$('.dz-dialog'); i++) { if (await pg.$('#dz-choice-0')) await pg.click('#dz-choice-0'); else await pg.keyboard.press('e'); await pg.waitForTimeout(250); } };
  const walk = async (key, ms) => { await clear(); await pg.keyboard.down(key); await pg.waitForTimeout(ms); await pg.keyboard.up(key); await pg.waitForTimeout(1600); };
  const where = () => E(() => { const d = window.__durinn.eng.debugState(); return d.mapId + ' ' + Math.floor(d.player.x / 16) + ',' + Math.floor(d.player.y / 16); });
  await E(() => window.__durinn.eng.warp('plainsSW', 58, 26, 'down', { dur: 0.1 })); await pg.waitForTimeout(1500);
  await walk('ArrowDown', 1500); log.push('ashford gate -> ' + await where());
  await walk('ArrowUp', 1200); log.push('out of ashford -> ' + await where());
  await pg.waitForTimeout(1500); log.push('settled -> ' + await where());
  await E(() => window.__durinn.eng.warp('plainsNW', 97, 34, 'up', { dur: 0.1 })); await pg.waitForTimeout(1500);
  await walk('ArrowUp', 1500); log.push('greywick gate -> ' + await where());
  await walk('ArrowDown', 1500); log.push('out of greywick -> ' + await where());
  await E(() => window.__durinn.eng.warp('plainsSW', 6, 28, 'left', { dur: 0.1 })); await pg.waitForTimeout(1500);
  await walk('ArrowLeft', 1500); log.push('oakhaven gate -> ' + await where() + ' says: ' + await E(() => { const d = document.querySelector('.dz-dialog'); return d ? d.textContent.slice(0, 80) : 'nothing'; }));
  console.log(log.join('\n')); console.log('errors', errs.filter((e) => !/TUNNEL|fonts/.test(e)).slice(0, 5));
  await b.close();
})();
