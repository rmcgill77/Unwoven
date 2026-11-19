const { boot, jump } = require('./common');
/* Act 3 map: the South Road is barred until Act Two ends, then leads into southern Etharis and back; seams join the
   sections; town gates, the Capital Gate and the sealed pass turn the player back with a message; bake times. */
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 1 });
  await pg.addStyleTag({ content: '.dz-hint{opacity:0!important}' });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  const E = (fn, a) => pg.evaluate(fn, a);
  await E(() => { window.__durinn.G().flags.__nowild = true; });
  const where = () => E(() => window.__durinn.eng.mapId() + ' ' + JSON.stringify(window.__durinn.eng.playerTile()));
  const toast = async () => { const t = await E(() => { const q = document.querySelector('.dz-dialog .dz-text') || document.querySelector('.dz-toast'); return q ? q.textContent : ''; }); if (t) { await pg.keyboard.press('e'); await pg.waitForTimeout(400); } return t; };
  const walk = async (key, ms) => { await pg.keyboard.down(key); await pg.waitForTimeout(ms); await pg.keyboard.up(key); await pg.waitForTimeout(700); };
  const clear = async () => { for (let i = 0; i < 12; i++) { if (!(await pg.$('.dz-dialog'))) break; await pg.keyboard.press('e'); await pg.waitForTimeout(350); } };
  const warp = async (m, x, y, d) => { await E(([m, x, y, d]) => window.__durinn.eng.warp(m, x, y, d, { dur: 0.05 }), [m, x, y, d]); await pg.waitForTimeout(900); await clear(); };
  let ok = true; const check = (c, msg) => { console.log((c ? 'PASS ' : 'FAIL ') + msg); if (!c) ok = false; };

  await warp('plainsSW', 36, 55, 'down'); await walk('ArrowDown', 1600);
  await pg.screenshot({ path: 'shots2/eth_barred.png' });
  let w = await where(), t = await toast();
  check(w.startsWith('plainsSW') && /south is closed/.test(t), 'South Road barred before Act Two ends: ' + w + ' | ' + t);
  await E(() => { window.__durinn.G().flags.act2_end = true; }); await pg.waitForTimeout(300);
  await walk('ArrowDown', 1800); w = await where();
  check(w.startsWith('eth00'), 'South Road leads into southern Etharis: ' + w);
  await walk('ArrowUp', 1800); w = await where();
  check(w.startsWith('plainsSW'), 'and back up to the plains: ' + w);

  // seams: east along the Pale Road from section 0 into section 1
  const seam = await E(() => { const r = window.__durinn.data().MAP_DEFS.eth00.rows; for (let y = 0; y < r.length; y++) if (r[y][89] === '=' && r[y][88] === '=') return y; return -1; });
  await warp('eth00', 86, seam, 'right'); await walk('ArrowRight', 1400); w = await where();
  check(w.startsWith('eth10'), 'seam east, eth00 -> eth10 at row ' + seam + ': ' + w);

  // barred gates
  for (const [m, x, y, key, re, name] of [['eth20', 41, 63, 'ArrowUp', /Writ./, 'Verrin'], ['eth30', 67, 8, 'ArrowUp', /Capital Gate is sealed/, 'Capital Gate'], ['eth01', 35, 63, 'ArrowUp', /walled up/, 'sealed pass']]) {
    await warp(m, x, y, key === 'ArrowUp' ? 'up' : 'down'); await walk(key, 1300);
    w = await where(); t = await toast();
    check(w.startsWith(m) && re.test(t), name + ' barred: ' + w + ' | ' + t);
  }
  // bake time for every section, and that the oldest are let go
  const times = [];
  for (const m of (process.env.BAKE || 'eth00,eth10,eth20,eth30,eth01,eth11,eth21,eth31,eth02,eth12,eth22,eth32').split(',')) {
    const ms = await E((m) => new Promise((res) => { const t0 = performance.now(); window.__durinn.eng.warp(m, 45, 40, 'down', { dur: 0.01 }); const poll = () => (window.__durinn.eng.mapId() === m ? requestAnimationFrame(() => res(performance.now() - t0)) : setTimeout(poll, 5)); poll(); }), m);
    await pg.waitForTimeout(300); times.push(m + ':' + Math.round(ms));
  }
  console.log('warp+bake ms', times.join(' '));
  const errors = errs.filter((e) => !/TUNNEL|fonts/.test(e));
  check(!errors.length, 'no errors ' + errors.slice(0, 3).join(' | '));
  console.log(ok ? 'ALL PASS' : 'SOME FAILED');
  await b.close();
})();
