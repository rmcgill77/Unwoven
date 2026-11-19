const { boot, jump } = require('./common');
/* Rotmoor: in through the gate from the overworld; the quarantine line holds without a pass and opens with one;
   the rooms, the cellar; screenshots for review. */
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 2 });
  await pg.addStyleTag({ content: '.dz-hint{opacity:0!important}' });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  const E = (fn, a) => pg.evaluate(fn, a);
  await E(() => { const G = window.__durinn.G(); G.flags.__nowild = true; G.flags.act2_end = true; });
  const where = () => E(() => window.__durinn.eng.mapId() + ' ' + JSON.stringify(window.__durinn.eng.playerTile()));
  const text = async () => { const t = await E(() => { const q = document.querySelector('.dz-dialog .dz-text'); return q ? q.textContent : ''; }); return t; };
  const clear = async () => { const seen = []; for (let i = 0; i < 14; i++) { if (!(await pg.$('.dz-dialog'))) break; seen.push(await text()); await pg.keyboard.press('e'); await pg.waitForTimeout(350); } return seen; };
  const walk = async (key, ms) => { await pg.keyboard.down(key); await pg.waitForTimeout(ms); await pg.keyboard.up(key); await pg.waitForTimeout(700); };
  const warp = async (m, x, y, d) => { await E(([m, x, y, d]) => window.__durinn.eng.warp(m, x, y, d, { dur: 0.05 }), [m, x, y, d]); await pg.waitForTimeout(1200); await clear(); };
  let ok = true; const check = (c, msg) => { console.log((c ? 'PASS ' : 'FAIL ') + msg); if (!c) ok = false; };

  await warp('eth32', 40, 12, 'down'); await walk('ArrowDown', 1400);
  let w = await where(); const intro = await clear();
  check(w.startsWith('rot '), 'in through the gate: ' + w + ' | ' + (intro[0] || '').slice(0, 60));
  await pg.screenshot({ path: 'shots2/rot_gate.png' });
  // the line holds without a pass
  await warp('rot', 34, 28, 'right'); await walk('ArrowRight', 1200);
  w = await where(); const said = await clear();
  check(w.startsWith('rot ') && JSON.parse(w.split(' ')[1])[0] <= 37 && /Reeve's pass/.test(said.join(' ')), 'quarantine line barred: ' + w + ' | ' + said.join(' ').slice(0, 70));
  await E(() => { window.__durinn.G().flags.rot_pass = true; window.__durinn.G().flags.q_rotcellar = 1; });
  await walk('ArrowRight', 900); w = await where(); await clear();
  check(w.startsWith('rot ') && JSON.parse(w.split(' ')[1])[0] >= 39, 'crossing with the pass: ' + w);
  await walk('ArrowLeft', 900); w = await where(); await clear();
  check(w.startsWith('rot ') && JSON.parse(w.split(' ')[1])[0] <= 36, 'and back: ' + w);
  // rooms
  for (const [x, y, id] of [[9, 14, 'rot_reeve'], [9, 23, 'rot_herb'], [9, 39, 'rot_inn'], [44, 13, 'rot_sick']]) {
    await warp('rot', x, y, 'up'); await walk('ArrowUp', 700); w = await where(); await clear();
    check(w.startsWith(id), 'door into ' + id + ': ' + w);
    await pg.screenshot({ path: `shots2/rot_${id}.png` });
  }
  // the cellar, and the sample
  await warp('rot_cellar', 5, 4, 'down'); w = await where(); check(w.startsWith('rot_cellar'), 'cellar: ' + w);
  await pg.screenshot({ path: 'shots2/rot_cellar1.png' });
  await warp('rot_cellar', 33, 23, 'up'); await pg.screenshot({ path: 'shots2/rot_cellar2.png' });
  // scripts run without error
  for (const s of ['crane', 'wen', 'holt', 'hesk', 'brannoc', 'rotguard4', 'look_cellar']) {
    const n = await E((s) => { try { return window.__durinn.data().SCRIPTS[s](window.__durinn.ctx ? window.__durinn.ctx() : { G: window.__durinn.G(), flag: (k) => !!window.__durinn.G().flags[k], set: () => {}, has: () => true, rot: (k, l) => l[0], coins: () => {}, give: () => {}, take: () => {} }).length; } catch (e) { return 'ERR ' + e.message; } }, s);
    check(typeof n === 'number' && n > 0, 'script ' + s + ': ' + n);
  }
  // spots for review
  for (const [x, y, n] of [[27, 8, 'north'], [27, 28, 'square'], [33, 30, 'crossing'], [44, 18, 'sickquarter'], [46, 44, 'pyre'], [43, 55, 'cooper'], [22, 54, 'graveyard'], [11, 41, 'soup']]) {
    await warp('rot', x, y, 'down'); await pg.screenshot({ path: `shots2/rot_${n}.png` });
  }
  const errors = errs.filter((e) => !/TUNNEL|fonts/.test(e));
  check(!errors.length, 'no errors ' + errors.slice(0, 3).join(' | '));
  console.log(ok ? 'ALL PASS' : 'SOME FAILED'); await b.close();
})();
