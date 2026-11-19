const { boot, jump } = require('./common');
/* The Western Crags: the pass opens on the Vaultwarden's order; the tunnel; the masons' camp; Cinder Hollow (Pellam, the mine
   gate fight, the overseer at the Seam's End, freeing the pens); the switchback ambush; the Unbound fire (warned, then welcomed
   with the red thread); the observatory; the stone warden, the Sealstone and Kellan Vex; the letter; doors; scripts; shots. */
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 2 });
  await pg.addStyleTag({ content: '.dz-hint{opacity:0!important}' });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  const E = (fn, a) => pg.evaluate(fn, a);
  await E(() => { const G = window.__durinn.G(); G.flags.__nowild = true; G.flags.act2_end = true; G.time = 10 * 60; G.flags.q_auseal = 1; G.flags.hakon_joined = true; });
  const where = () => E(() => window.__durinn.eng.mapId() + ' ' + JSON.stringify(window.__durinn.eng.playerTile()));
  const text = () => E(() => { const q = document.querySelector('.dz-dialog .dz-text'); return q ? q.textContent : ''; });
  const clear = async (n = 14) => { const seen = []; for (let i = 0; i < n; i++) { if (!(await pg.$('.dz-dialog'))) break; seen.push(await text()); if (await pg.$('.dz-choice')) { await pg.click('.dz-choice'); } else await pg.keyboard.press('e'); await pg.waitForTimeout(350); } return seen; };
  const walk = async (key, ms) => { await pg.keyboard.down(key); await pg.waitForTimeout(ms); await pg.keyboard.up(key); await pg.waitForTimeout(800); };
  const warp = async (m, x, y, d) => { await E(([m, x, y, d]) => window.__durinn.eng.warp(m, x, y, d, { dur: 0.05 }), [m, x, y, d]); await pg.waitForTimeout(1600); return clear(); };
  const run = async (s, id) => { await E(([s, id]) => window.__durinn.run(s, id), [s, id || null]); await pg.waitForTimeout(500); return clear(40); };
  const F = (k) => E((k) => window.__durinn.G().flags[k], k);
  const winFight = async (shot) => {
    for (let i = 0; i < 40; i++) { await pg.waitForTimeout(250); if (await E(() => !!window.__battle && window.__battle.phase === 'fight')) break; }
    await pg.waitForTimeout(600); if (await pg.$('#dz-btip-ok')) await pg.click('#dz-btip-ok'); await pg.waitForTimeout(1200);
    if (shot) await pg.screenshot({ path: `shots2/${shot}.png` });
    const foes = await E(() => window.__battle ? window.__battle.units.filter((u) => u.side === 'e').map((u) => u.name).join(',') : 'none');
    await E(() => { for (const u of window.__battle.units) { if (u.side === 'e') { u.hp = 0; u.ko = true; } else { u.gauge = 0; u.queued = null; } } window.__battle.queue = []; });
    for (let i = 0; i < 40; i++) { await pg.waitForTimeout(250); if (await pg.$('#dz-battle-done')) break; }
    await pg.click('#dz-battle-done'); await E(() => { window.__battle = null; }); await pg.waitForTimeout(1800); return foes;
  };
  let ok = true; const check = (c, msg) => { console.log((c ? 'PASS ' : 'FAIL ') + msg); if (!c) ok = false; };

  // the pass: walled until the Vaultwarden's order, then the tunnel
  await warp('eth01', 35, 63, 'up'); await walk('ArrowUp', 900); let w = await where(); let said = await clear();
  check(w.startsWith('eth01') && /walled up/.test(said.join(' ')), 'pass walled before the order: ' + w);
  await pg.screenshot({ path: 'shots2/cr_pass_shut.png' });
  await E(() => { window.__durinn.G().flags.crags_open = true; window.__durinn.eng.refreshWorld(); });
  await warp('eth01', 35, 63, 'up'); await pg.screenshot({ path: 'shots2/cr_pass_open.png' });
  await walk('ArrowUp', 900); await pg.waitForTimeout(800); w = await where(); await clear();
  check(w.startsWith('cr_tunnel'), 'into the tunnel: ' + w);
  await pg.screenshot({ path: 'shots2/cr_tunnel.png' });
  await warp('cr_tunnel', 6, 11, 'down'); await walk('ArrowDown', 900); await pg.waitForTimeout(800); w = await where(); said = await clear();
  check(w.startsWith('cr11') && /Western Crags/.test(said.join(' ')), 'out into the masons\' camp: ' + w);
  await pg.screenshot({ path: 'shots2/cr_camp.png' });
  // Cinder Hollow
  await warp('cr11', 3, 46, 'left'); await walk('ArrowLeft', 900); await pg.waitForTimeout(800); said = await clear(); console.log('at', await where());
  check(await F('q_arthur') === 1 && /Cinder Hollow/.test(said.join(' ')), 'arrival in the Hollow starts the Mines of the Crags');
  await pg.screenshot({ path: 'shots2/cr_hollow.png' });
  said = await run('crpellam'); check(await F('q_arthur') === 2 && /smith-boy/.test(said.join(' ')), 'Pellam remembers Arthur');
  await warp('cr01', 52, 31, 'up'); await walk('ArrowUp', 600); w = await where(); said = await clear();
  check(w.startsWith('cr01') && /Workers and the overseer/.test(said.join(' ')), 'mine mouth barred by the guards: ' + w);
  await E(() => window.__durinn.run('crguard2')); await pg.waitForTimeout(500); await clear(8); let foes = await winFight('cr_fight_guards');
  check(/Company Guard/.test(foes), 'the mine gate fight: ' + foes); await clear();
  check(await F('cr_mine_in'), 'the mine is open');
  await warp('cr01', 52, 31, 'up'); await walk('ArrowUp', 600); await pg.waitForTimeout(600); w = await where(); await clear();
  check(w.startsWith('cr_mine1'), 'into Grimscar Mine: ' + w); await pg.screenshot({ path: 'shots2/cr_mine1.png' });
  await warp('cr_mine1', 44, 27, 'down'); await walk('ArrowDown', 700); await pg.waitForTimeout(600); w = await where(); await clear();
  check(w.startsWith('cr_mine2'), 'down to the Deep Seam: ' + w); await pg.screenshot({ path: 'shots2/cr_mine2.png' });
  await warp('cr_mine2', 44, 27, 'down'); await walk('ArrowDown', 700); await pg.waitForTimeout(600); w = await where(); await clear();
  check(w.startsWith('cr_mine3'), 'down to the Seam\'s End: ' + w);
  await warp('cr_mine3', 10, 9, 'right'); await pg.screenshot({ path: 'shots2/cr_mine3.png' });
  await walk('ArrowRight', 700); said = await clear(30);
  check(/counting silver/.test(said.join(' ')), 'the overseer\'s scene plays');
  foes = await winFight('cr_fight_overseer'); check(/Vantry/.test(foes) && /Gristle/.test(foes), 'the overseer and Gristle: ' + foes);
  said = await clear(30); check(/ARCHON'S FOUNDRY/.test(said.join(' ')) && await F('hakon_capital'), 'the ledger: Arthur sold to the Capital\'s Foundry');
  said = await run('crpellam'); check(await F('cr_freed') && await F('q_arthur') === 4, 'the pens opened');
  await warp('cr01', 58, 50, 'down'); await pg.screenshot({ path: 'shots2/cr_freed.png' });
  // the switchback ambush
  await warp('cr10', 41, 64, 'up'); await walk('ArrowUp', 900); said = await clear(30);
  check(/supply cart/.test(said.join(' ')), 'the ambush on the switchbacks');
  foes = await winFight('cr_fight_skirm'); check(/Brand-Sergeant/.test(foes), 'the party fights the Purifiers: ' + foes);
  said = await clear(20); check(await F('cr_skirm_won') && /Sayer gives you/.test(said.join(' ')), 'the supply party thanks you');
  // the Unbound fire: warned without the thread, welcomed with it
  await warp('cr10', 72, 39, 'up'); await walk('ArrowUp', 900); said = await clear(8);
  check(/next one won't miss/.test(said.join(' ')) && !(await F('cr_unb_ok')), 'warned off without the thread');
  await E(() => { const G = window.__durinn.G(); G.items.unbthread = 1; });
  await warp('cr10', 72, 39, 'up'); await walk('ArrowUp', 900); said = await clear(12);
  check(await F('cr_unb_ok') && /Ysra's thread/.test(said.join(' ')), 'welcomed with the red thread');
  await warp('cr10', 75, 30, 'down'); await pg.screenshot({ path: 'shots2/cr_unbound.png' });
  said = await run('crcorvin'); check(/man in black/.test(said.join(' ')) || said.length > 0, 'Corvin talks');
  // the observatory, with the companion
  await E(() => { const G = window.__durinn.G(); if (typeof partyJoin === 'function') partyJoin(G, G.look.sex === 'f' ? 'corin' : 'elowyn'); G.flags.comp_joined = true; });
  said = await run('look_obsnotes'); check(/Seven of us went back down/.test(said.join(' ')) || /eight names/.test(said.join(' ')), 'the observatory notebooks');
  await warp('cr10', 32, 70, 'up'); await pg.screenshot({ path: 'shots2/cr_obs.png' });
  // the shrine
  await warp('cr00', 35, 18, 'up'); await pg.screenshot({ path: 'shots2/cr_shrine_out.png' });
  await walk('ArrowUp', 1600); await pg.waitForTimeout(700); w = await where(); said = await clear();
  check(w.startsWith('cr_shrine'), 'into the shrine: ' + w); await pg.screenshot({ path: 'shots2/cr_shrine.png' });
  await warp('cr_shrine', 20, 15, 'up'); await walk('ArrowUp', 700); said = await clear(40);
  check(/KELLAN VEX/.test(said.join(' ')), 'the warden names the thief');
  foes = await winFight('cr_fight_warden'); check(/Stone Warden/.test(foes), 'the stone warden: ' + foes);
  said = await clear(30);
  check(await F('vex_thief') && await E(() => !!window.__durinn.G().items.sealstone) && await F('q_auseal') === 2, 'the Sealstone taken, Vex revealed');
  check(/book in your satchel/.test(said.join(' ')), 'the tome realisation');
  said = await run('marrow'); check(await F('capital_letter') && await F('q_auseal') === 3, 'the Vaultwarden gives the letter of passage');
  // doors
  for (const [m, x, y, id] of [['cr01', 39, 41, 'cr_overseer'], ['cr01', 54, 40, 'cr_bunk'], ['cr01', 68, 40, 'cr_cook'], ['cr01', 38, 62, 'cr_forge'], ['cr01', 74, 62, 'cr_store'], ['cr00', 71, 52, 'cr_hut']]) {
    await warp(m, x, y + 1, 'up'); await walk('ArrowUp', 600); w = await where(); await clear();
    check(w.startsWith(id), 'door into ' + id + ': ' + w);
  }
  for (const s of ['crtull', 'crwynn', 'crmason1', 'crmason2', 'crguard1', 'crguard2', 'crguard3', 'crdorrit', 'crpellam', 'crwork1', 'crwork2', 'crwork3', 'crmeg', 'crruel', 'crvantry', 'crgristle', 'crsayer', 'crsup1', 'crpur1', 'crpur2', 'crcorvin', 'crlise', 'crnan',
    'look_overledger', 'look_oldshaft', 'look_sealplinth', 'look_vexmark', 'trig_crskirm', 'trig_unbfire', 'trig_overseer', 'trig_warden']) {
    const n = await E((s) => { const G = window.__durinn.G(); try { return window.__durinn.data().SCRIPTS[s]({ G, flag: (k) => !!G.flags[k], set: () => {}, has: () => true, rot: (k, l) => l[0], coins: () => {}, give: () => {}, take: () => {} }).length; } catch (e) { return 'ERR ' + e.message; } }, s);
    check(typeof n === 'number', 'script ' + s + ': ' + n);
  }
  for (const [m, x, y, n] of [['cr11', 70, 30, 'cleft'], ['cr10', 50, 50, 'pines'], ['cr00', 74, 31, 'tarn'], ['cr00', 58, 23, 'bridge'], ['cr01', 18, 60, 'heaps'], ['cr00', 30, 20, 'snow']]) {
    await warp(m, x, y, 'down'); await pg.waitForTimeout(300); await pg.screenshot({ path: `shots2/cr_${n}.png` });
  }
  const errors = errs.filter((e) => !/TUNNEL|fonts/.test(e));
  check(!errors.length, 'no errors ' + errors.slice(0, 3).join(' | '));
  console.log(ok ? 'ALL PASS' : 'SOME FAILED'); await b.close();
})();
