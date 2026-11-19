const { boot, jump } = require('./common');
/* Aurelm: in from eth22, the skirmish fought and won, the Thief's Road (harbourmaster, sluice, culvert, thread, Vosk),
   the Warden's Gate opens, the Vaultwarden opens the Crags; doors into every room; scripts run; screenshots. */
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 2 });
  await pg.addStyleTag({ content: '.dz-hint{opacity:0!important}' });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  const E = (fn, a) => pg.evaluate(fn, a);
  await E(() => { const G = window.__durinn.G(); G.flags.__nowild = true; G.flags.act2_end = true; G.time = 10 * 60; G.items = G.items || {}; G.items.unbthread = 1; });
  const where = () => E(() => window.__durinn.eng.mapId() + ' ' + JSON.stringify(window.__durinn.eng.playerTile()));
  const text = () => E(() => { const q = document.querySelector('.dz-dialog .dz-text'); return q ? q.textContent : ''; });
  const clear = async (n = 14) => { const seen = []; for (let i = 0; i < n; i++) { if (!(await pg.$('.dz-dialog'))) break; seen.push(await text()); if (await pg.$('.dz-choice')) { await pg.click('.dz-choice'); } else await pg.keyboard.press('e'); await pg.waitForTimeout(350); } return seen; };
  const walk = async (key, ms) => { await pg.keyboard.down(key); await pg.waitForTimeout(ms); await pg.keyboard.up(key); await pg.waitForTimeout(800); };
  const warp = async (m, x, y, d) => { await E(([m, x, y, d]) => window.__durinn.eng.warp(m, x, y, d, { dur: 0.05 }), [m, x, y, d]); await pg.waitForTimeout(1300); return clear(); };
  const run = async (s, id) => { await E(([s, id]) => window.__durinn.run(s, id), [s, id || null]); await pg.waitForTimeout(500); return clear(40); };
  const winFight = async () => {
    for (let i = 0; i < 40; i++) { await pg.waitForTimeout(250); if (await E(() => !!window.__battle && window.__battle.phase === 'fight')) break; }
    await pg.waitForTimeout(600); if (await pg.$('#dz-btip-ok')) await pg.click('#dz-btip-ok'); await pg.waitForTimeout(1200);
    await pg.screenshot({ path: 'shots2/au_fight.png' });
    const foes = await E(() => window.__battle.units.filter((u) => u.side === 'e').map((u) => u.name).join(','));
    await E(() => { for (const u of window.__battle.units) { if (u.side === 'e') { u.hp = 0; u.ko = true; } else { u.gauge = 0; u.queued = null; } } window.__battle.queue = []; });
    for (let i = 0; i < 40; i++) { await pg.waitForTimeout(250); if (await pg.$('#dz-battle-done')) break; }
    await pg.click('#dz-battle-done'); await pg.waitForTimeout(1800); return foes;
  };
  let ok = true; const check = (c, msg) => { console.log((c ? 'PASS ' : 'FAIL ') + msg); if (!c) ok = false; };

  await E(() => window.__durinn.eng.warp('eth22', 41, 20, 'down', { dur: 0.05 })); await pg.waitForTimeout(1300); await clear();
  await walk('ArrowDown', 900); await pg.waitForTimeout(1500); let w = await where();
  check(w.startsWith('au_out'), 'through the gate into Aurelm: ' + w);
  await pg.waitForTimeout(500); await pg.screenshot({ path: 'shots2/au_skirm.png' });
  let said = await clear(30);
  check(/firepots lit/.test(said.join(' ')), 'the skirmish scene plays');
  const foes = await winFight();
  check(/Brand-Sergeant/.test(foes), 'the party fights the Purifiers: ' + foes);
  said = await clear(30);
  check(/Get off my square, Prior/.test(said.join(' ')), 'aftermath plays');
  let f = await E(() => { const g = window.__durinn.G().flags; return [g.au_skirm_won, g.q_aulock, g.q_authief]; });
  check(f[0] && f[1] === 2 && f[2] === 1, 'skirmish won, the Thief\'s Road begins: ' + f);
  await pg.screenshot({ path: 'shots2/au_after.png' });
  // the Warden's Gate is barred
  await warp('au_out', 84, 56, 'down'); await walk('ArrowDown', 900); w = await where(); said = await clear();
  check(w.startsWith('au_out') && /summons/.test(said.join(' ')), 'Warden\'s Gate barred: ' + w);
  // the Thief's Road
  said = await run('neve'); check(await E(() => window.__durinn.G().flags.q_authief === 2), 'harbourmaster: the light by the sluice');
  await warp('au_out', 24, 47, 'up');
  said = await run('look_sluice'); await pg.waitForTimeout(1500);
  w = await where(); check(w.startsWith('au_culvert'), 'down the sluice into the culvert: ' + w);
  await pg.waitForTimeout(500); await pg.screenshot({ path: 'shots2/au_culvert.png' });
  said = await run('look_cutgrate');
  check(/black thread/.test(said.join(' ')) && await E(() => !!window.__durinn.G().items.blackthread), 'the black thread found');
  said = await run('look_culvertladder'); await pg.waitForTimeout(1500); w = await where(); check(w.startsWith('au_out'), 'back up the ladder: ' + w);
  said = await run('vosk');
  check(/Not the same hand/.test(said.join(' ')), 'Vosk compares the threads');
  f = await E(() => { const g = window.__durinn.G().flags; return [g.au_summoned, g.q_authief, g.q_auseal]; });
  check(f[0] && f[1] === 5 && f[2] === 1, 'summoned: ' + f);
  await warp('au_out', 84, 56, 'down'); await walk('ArrowDown', 900); w = await where(); await clear();
  check(w.startsWith('au_vault'), 'through the Warden\'s Gate: ' + w);
  await pg.waitForTimeout(500); await pg.screenshot({ path: 'shots2/au_vault_in.png' });
  await warp('au_vault', 84, 40, 'up'); await walk('ArrowUp', 900); w = await where(); said = await clear();
  check(w.startsWith('au_vault') && /Nobody goes into the Vault/.test(said.join(' ')), 'the Vault stays shut: ' + w);
  await pg.screenshot({ path: 'shots2/au_vaultdoor.png' });
  said = await run('marrow');
  check(/Sealstone/.test(said.join(' ')) && await E(() => !!window.__durinn.G().flags.crags_open), 'the Vaultwarden opens the Crags');
  const pass = await E(() => { const d = window.__durinn.data().MAP_DEFS.eth01; const wp = d.warps.find((x) => x.look === 'pass'); return wp.lock.need + '/' + wp.to; });
  check(pass === 'crags_open/cr_tunnel', 'the pass opens into the Crags tunnel: ' + pass);
  // doors
  for (const [m, x, y, id] of [['au_out', 37, 16, 'au_barracks'], ['au_out', 135, 16, 'au_chapter'], ['au_out', 63, 13, 'au_exchange'], ['au_out', 103, 9, 'au_post'], ['au_out', 44, 31, 'au_inn'],
    ['au_out', 62, 30, 'au_chapel'], ['au_out', 107, 34, 'au_archive'], ['au_vault', 111, 17, 'au_warden'], ['au_vault', 41, 17, 'au_cloister']]) {
    await warp(m, x, y + 1, 'up'); await walk('ArrowUp', 600); w = await where(); await clear();
    check(w.startsWith(id), 'door into ' + id + ': ' + w);
    if (['au_chapter', 'au_archive', 'au_warden', 'au_inn'].includes(id)) { await pg.waitForTimeout(400); await pg.screenshot({ path: `shots2/${id}.png` }); }
  }
  for (const s of ['aupur1', 'aupur2', 'aupur3', 'ausarge', 'vosk', 'marrow', 'caddock', 'corse', 'aupell', 'auwenna', 'anselm', 'gannet', 'neve', 'augull', 'hollis', 'hallmum', 'hallkid', 'tamsin', 'augate1', 'augate2', 'auward1', 'auward2', 'keeper1', 'keeper2', 'aufolk1', 'aufolk2', 'aufolk3', 'look_culvertgrate']) {
    const n = await E((s) => { const G = window.__durinn.G(); try { return window.__durinn.data().SCRIPTS[s]({ G, flag: (k) => !!G.flags[k], set: () => {}, has: () => true, rot: (k, l) => l[0], coins: () => {}, give: () => {}, take: () => {} }).length; } catch (e) { return 'ERR ' + e.message; } }, s);
    check(typeof n === 'number' && n > 0, 'script ' + s + ': ' + n);
  }
  for (const [m, x, y, n] of [['au_out', 84, 12, 'gatesq'], ['au_out', 84, 33, 'exchange'], ['au_out', 30, 35, 'harbour'], ['au_out', 135, 22, 'chapter_out'], ['au_out', 152, 40, 'ashenrow'],
    ['au_vault', 84, 12, 'wardgate'], ['au_vault', 84, 42, 'vaultface'], ['au_vault', 140, 20, 'garden']]) {
    await warp(m, x, y, 'down'); await pg.waitForTimeout(300); await pg.screenshot({ path: `shots2/au_${n}.png` });
  }
  const errors = errs.filter((e) => !/TUNNEL|fonts/.test(e));
  check(!errors.length, 'no errors ' + errors.slice(0, 3).join(' | '));
  console.log(ok ? 'ALL PASS' : 'SOME FAILED'); await b.close();
})();
