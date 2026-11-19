const { boot, jump } = require('./common');
/* Stonebridge: in through its gate from the overworld and back out; every door; scripts run; screenshots. */
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 2 });
  await pg.addStyleTag({ content: '.dz-hint{opacity:0!important}' });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  const E = (fn, a) => pg.evaluate(fn, a);
  await E(() => { const G = window.__durinn.G(); G.flags.__nowild = true; G.flags.act2_end = true; });
  const where = () => E(() => window.__durinn.eng.mapId() + ' ' + JSON.stringify(window.__durinn.eng.playerTile()));
  const clear = async () => { for (let i = 0; i < 14; i++) { if (!(await pg.$('.dz-dialog'))) break; await pg.keyboard.press('e'); await pg.waitForTimeout(350); } };
  const walk = async (key, ms) => { await pg.keyboard.down(key); await pg.waitForTimeout(ms); await pg.keyboard.up(key); await pg.waitForTimeout(700); };
  const warp = async (m, x, y, d) => { await E(([m, x, y, d]) => window.__durinn.eng.warp(m, x, y, d, { dur: 0.05 }), [m, x, y, d]); await pg.waitForTimeout(1200); await clear(); };
  let ok = true; const check = (c, msg) => { console.log((c ? 'PASS ' : 'FAIL ') + msg); if (!c) ok = false; };

  await warp('eth01', 66, 11, 'down'); await walk('ArrowDown', 1400); let w = await where(); await clear();
  check(w.startsWith('sb '), 'in through the gate: ' + w);
  await pg.waitForTimeout(800); await clear(); await pg.screenshot({ path: 'shots2/sb_in.png' }); await walk('ArrowUp', 1500); w = await where(); await clear();
  check(w.startsWith('eth01'), 'and back out: ' + w);
  for (const [x, y, id] of [[35, 13, 'sb_hall'], [11, 14, 'sb_smithy'], [21, 13, 'sb_store'], [11, 29, 'sb_inn'], [43, 29, 'sb_chapel'], [9, 47, 'sb_mill'], [50, 18, 'sb_tower']]) {
    await warp('sb', x, y, 'up'); await walk('ArrowUp', 700); w = await where(); await clear();
    check(w.startsWith(id), 'door into ' + id + ': ' + w);
    if (id === 'sb_hall' || id === 'sb_inn') await pg.screenshot({ path: `shots2/sb_${id}.png` });
  }
  for (const s of ['corwen', 'bryn', 'tilda', 'agnes', 'odo', 'hamm', 'gil', 'sela', 'dun', 'sbwatch', 'sbkid']) {
    const n = await E((s) => { const G = window.__durinn.G(); try { return window.__durinn.data().SCRIPTS[s]({ G, flag: (k) => !!G.flags[k], set: () => {}, has: () => true, rot: (k, l) => l[0], coins: () => {}, give: () => {}, take: () => {} }).length; } catch (e) { return 'ERR ' + e.message; } }, s);
    check(typeof n === 'number' && n > 0, 'script ' + s + ': ' + n);
  }
  for (const [x, y, n] of [[27, 6, 'gate'], [27, 20, 'green'], [27, 35, 'bridge'], [10, 40, 'mill'], [40, 56, 'fold'], [16, 55, 'fields'], [49, 20, 'tower'], [6, 31, 'westgate']]) {
    await warp('sb', x, y, 'down'); await pg.screenshot({ path: `shots2/sb_${n}.png` });
  }
  const errors = errs.filter((e) => !/TUNNEL|fonts/.test(e));
  check(!errors.length, 'no errors ' + errors.slice(0, 3).join(' | '));
  console.log(ok ? 'ALL PASS' : 'SOME FAILED'); await b.close();
})();
