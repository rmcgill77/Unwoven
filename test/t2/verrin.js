const { boot, jump } = require('./common');
/* Verrin: the south gate wants the writ; inside, the Lantern Gate is barred until the lamplighter's errand is done;
   the lamps can be mended; doors into every room; scripts run; screenshots. */
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 2 });
  await pg.addStyleTag({ content: '.dz-hint{opacity:0!important}' });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  const E = (fn, a) => pg.evaluate(fn, a);
  await E(() => { const G = window.__durinn.G(); G.flags.__nowild = true; G.flags.act2_end = true; });
  const where = () => E(() => window.__durinn.eng.mapId() + ' ' + JSON.stringify(window.__durinn.eng.playerTile()));
  const text = () => E(() => { const q = document.querySelector('.dz-dialog .dz-text'); return q ? q.textContent : ''; });
  const clear = async () => { const seen = []; for (let i = 0; i < 14; i++) { if (!(await pg.$('.dz-dialog'))) break; seen.push(await text()); await pg.keyboard.press('e'); await pg.waitForTimeout(350); } return seen; };
  const walk = async (key, ms) => { await pg.keyboard.down(key); await pg.waitForTimeout(ms); await pg.keyboard.up(key); await pg.waitForTimeout(800); };
  const warp = async (m, x, y, d) => { await E(([m, x, y, d]) => window.__durinn.eng.warp(m, x, y, d, { dur: 0.05 }), [m, x, y, d]); await pg.waitForTimeout(1300); await clear(); };
  let ok = true; const check = (c, msg) => { console.log((c ? 'PASS ' : 'FAIL ') + msg); if (!c) ok = false; };

  await warp('eth20', 41, 64, 'up'); await walk('ArrowUp', 1200); let w = await where(); let said = await clear();
  check(w.startsWith('eth20') && /Writ/.test(said.join(' ')), 'south gate barred without the writ: ' + w);
  await E(() => { window.__durinn.G().flags.q_sbwrit = 1; });
  await walk('ArrowUp', 1200); w = await where(); await pg.waitForTimeout(600); await clear();
  check(w.startsWith('ver_lo'), 'with the writ, into Lower Town: ' + w);
  await pg.screenshot({ path: 'shots2/ver_gate.png' });
  await warp('ver_lo', 84, 7, 'up'); await walk('ArrowUp', 1000); w = await where(); said = await clear();
  check(w.startsWith('ver_lo') && /Lamplighter's token/.test(said.join(' ')), 'Lantern Gate barred: ' + w);
  await E(() => { window.__durinn.G().flags.ver_lantern = true; });
  await walk('ArrowUp', 1000); w = await where(); await pg.waitForTimeout(600); await clear();
  check(w.startsWith('ver_hi'), 'with the token, into High Town: ' + w);
  await walk('ArrowDown', 1200); w = await where(); await clear();
  check(w.startsWith('ver_lo'), 'and back down: ' + w);
  for (const [m, x, y, id] of [['ver_lo', 73, 55, 'ver_lamp'], ['ver_lo', 112, 23, 'ver_arms'], ['ver_lo', 122, 23, 'ver_physic'], ['ver_lo', 112, 42, 'ver_trade'], ['ver_lo', 122, 42, 'ver_books'],
    ['ver_lo', 154, 25, 'ver_nell'], ['ver_hi', 84, 18, 'ver_chapel'], ['ver_hi', 52, 21, 'ver_registry'], ['ver_hi', 116, 21, 'ver_arbiter']]) {
    await warp(m, x, y, 'up'); await walk('ArrowUp', 700); w = await where(); await clear();
    check(w.startsWith(id), 'door into ' + id + ': ' + w);
    if (['ver_lamp', 'ver_chapel', 'ver_registry', 'ver_arbiter'].includes(id)) await pg.screenshot({ path: `shots2/ver_${id}.png` });
  }
  for (const s of ['rhosyn', 'sabine', 'nell', 'mirela', 'jasper', 'ottilie', 'fenwick', 'aurin', 'herald', 'vdrill1', 'vdrill2', 'vpatrol', 'vtene1', 'vtene2', 'vkid', 'venn', 'lorne', 'dawe', 'vguardhi', 'vnoble', 'vinitiate']) {
    const n = await E((s) => { const G = window.__durinn.G(); try { return window.__durinn.data().SCRIPTS[s]({ G, flag: (k) => !!G.flags[k], set: () => {}, has: () => true, rot: (k, l) => l[0], coins: () => {}, give: () => {}, take: () => {} }).length; } catch (e) { return 'ERR ' + e.message; } }, s);
    if (!(typeof n === 'number' && n > 0)) check(false, 'script ' + s + ': ' + n);
  }
  const lamp = await E(() => { const G = window.__durinn.G(); G.flags.q_lantern = 2; const S = window.__durinn.data().SCRIPTS; return S.look_vlamp({ G, flag: (k) => !!G.flags[k], set: () => {}, rot: (k, l) => l[0] }, 'a').length; });
  check(lamp === 2, 'a smashed lamp offers the mend: ' + lamp);
  for (const [m, x, y, n] of [['ver_lo', 84, 60, 'gateroad'], ['ver_lo', 84, 32, 'market'], ['ver_lo', 84, 9, 'lantern'], ['ver_lo', 22, 22, 'yard'], ['ver_lo', 145, 15, 'tenements'], ['ver_lo', 116, 26, 'shops'],
    ['ver_hi', 84, 36, 'court'], ['ver_hi', 84, 22, 'chapel_out'], ['ver_hi', 52, 24, 'registry_out'], ['ver_hi', 140, 31, 'avenue']]) {
    await warp(m, x, y, 'down'); await pg.screenshot({ path: `shots2/ver_${n}.png` });
  }
  const errors = errs.filter((e) => !/TUNNEL|fonts/.test(e));
  check(!errors.length, 'no errors ' + errors.slice(0, 3).join(' | '));
  console.log(ok ? 'ALL PASS' : 'SOME FAILED'); await b.close();
})();
