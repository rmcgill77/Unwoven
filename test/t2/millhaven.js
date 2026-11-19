const { boot, jump } = require('./common');
/* Millhaven: in through the north gate from eth11 and back out; doors into every room; scripts run;
   Fen's meeting and the back-room parley played through as a scene; screenshots. */
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 2 });
  await pg.addStyleTag({ content: '.dz-hint{opacity:0!important}' });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  const E = (fn, a) => pg.evaluate(fn, a);
  await E(() => { const G = window.__durinn.G(); G.flags.__nowild = true; G.flags.act2_end = true; });
  const where = () => E(() => window.__durinn.eng.mapId() + ' ' + JSON.stringify(window.__durinn.eng.playerTile()));
  const text = () => E(() => { const q = document.querySelector('.dz-dialog .dz-text'); return q ? q.textContent : ''; });
  const clear = async (n = 14) => { const seen = []; for (let i = 0; i < n; i++) { if (!(await pg.$('.dz-dialog'))) break; seen.push(await text()); if (await pg.$('.dz-choice')) { await pg.click('.dz-choice'); } else await pg.keyboard.press('e'); await pg.waitForTimeout(350); } return seen; };
  const walk = async (key, ms) => { await pg.keyboard.down(key); await pg.waitForTimeout(ms); await pg.keyboard.up(key); await pg.waitForTimeout(800); };
  const warp = async (m, x, y, d) => { await E(([m, x, y, d]) => window.__durinn.eng.warp(m, x, y, d, { dur: 0.05 }), [m, x, y, d]); await pg.waitForTimeout(1300); return clear(); };
  let ok = true; const check = (c, msg) => { console.log((c ? 'PASS ' : 'FAIL ') + msg); if (!c) ok = false; };

  // the town gate on the overworld
  const gate = await E(() => { const d = window.__durinn.data().MAP_DEFS.eth11; return d.warps.filter((w) => w.to === 'mh'); });
  check(gate.length >= 1, 'eth11 has a gate into Millhaven: ' + JSON.stringify(gate[0]));
  const g0 = gate[0];
  await warp('eth11', g0.x, g0.y - 2, 'down'); await walk('ArrowDown', 900); let w = await where(); let said = await clear();
  check(w.startsWith('mh '), 'through the gate into Millhaven: ' + w);
  check(/Millhaven\. Wagons/.test(said.join(' ')), 'arrival line plays');
  await pg.screenshot({ path: 'shots2/mh_gate.png' });
  await warp('mh', 27, 4, 'up'); await walk('ArrowUp', 900); w = await where(); await clear();
  check(w.startsWith('eth11'), 'and back out to the road: ' + w);
  // doors
  for (const [x, y, id] of [[9, 13, 'mh_inn'], [19, 12, 'mh_tithe'], [36, 12, 'mh_trade'], [9, 28, 'mh_bakery'], [41, 39, 'mh_mill'], [9, 44, 'mh_tinker']]) {
    await warp('mh', x, y + 1, 'up'); await walk('ArrowUp', 600); w = await where(); await clear();
    check(w.startsWith(id), 'door into ' + id + ': ' + w);
    await pg.waitForTimeout(500); await pg.screenshot({ path: `shots2/mh_${id}.png` });
    await walk('ArrowDown', 900); w = await where(); await clear();
    check(w.startsWith('mh '), '  and back out: ' + w);
  }
  // scripts
  for (const s of ['fen', 'abner', 'gwen', 'pryce', 'dagny', 'marta', 'oswin', 'mhguard', 'lem', 'rotwoman', 'mhfolk', 'ysra', 'tobin']) {
    const n = await E((s) => { const G = window.__durinn.G(); try { return window.__durinn.data().SCRIPTS[s]({ G, flag: (k) => !!G.flags[k], set: () => {}, has: () => true, rot: (k, l) => l[0], coins: () => {}, give: () => {}, take: () => {} }).length; } catch (e) { return 'ERR ' + e.message; } }, s);
    check(typeof n === 'number' && n > 0, 'script ' + s + ': ' + n);
  }
  // Fen, then the parley
  await E(() => { const G = window.__durinn.G(); G.time = 10 * 60; G.flags.ver_registered = true; });
  await warp('mh', 11, 49, 'up');
  await pg.screenshot({ path: 'shots2/mh_fen_out.png' });
  await E(() => window.__durinn.run('fen')); await pg.waitForTimeout(500); said = await clear();
  check(/wick catches/.test(said.join(' ')), 'meeting Fen: she lights a lamp with a word');
  check(await E(() => window.__durinn.G().flags.q_mhparley === 1), 'q_mhparley at step 1');
  await E(() => window.__durinn.run('fen')); await pg.waitForTimeout(500);
  said = await clear(8);
  await pg.waitForTimeout(1500);
  w = await where(); check(w.startsWith('mh_back'), 'Fen leads you into the back room: ' + w);
  await pg.waitForTimeout(600); await pg.screenshot({ path: 'shots2/mh_parley.png' });
  said = said.concat(await clear(40));
  const all = said.join(' | ');
  check(/Ysra\. We've watched you/.test(all), 'the parley plays as a scene');
  check(/Registry\. Show me your wrist/.test(all), 'it knows you registered at Verrin');
  check(/Vault at Aurelm/.test(all), 'the Vault warning is given');
  const f = await E(() => { const G = window.__durinn.G(); return { p: G.flags.mh_parley, q: G.flags.q_mhparley, t: !!(G.items && G.items.unbthread) }; });
  check(f.p && f.q === 2 && f.t, 'quest done, thread given: ' + JSON.stringify(f));
  await warp('mh_back', 4, 6, 'up'); await pg.waitForTimeout(400);
  const after = await E(() => { const D = window.__durinn.data().NPC_DEFS, f = window.__durinn.G().flags; return D.ysra.flagSched[0].when(f); });
  check(!after, 'Ysra is gone afterwards');
  await pg.screenshot({ path: 'shots2/mh_back_after.png' });
  for (const [x, y, n] of [[27, 10, 'north'], [27, 29, 'market'], [36, 18, 'yard'], [44, 36, 'mill'], [12, 46, 'tinker'], [16, 59, 'orchard']]) {
    await warp('mh', x, y, 'down'); await pg.waitForTimeout(300); await pg.screenshot({ path: `shots2/mh_${n}.png` });
  }
  const errors = errs.filter((e) => !/TUNNEL|fonts/.test(e));
  check(!errors.length, 'no errors ' + errors.slice(0, 3).join(' | '));
  console.log(ok ? 'ALL PASS' : 'SOME FAILED'); await b.close();
})();
