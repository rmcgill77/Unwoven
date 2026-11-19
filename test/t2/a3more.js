const { boot, jump } = require('./common');
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 2 });
  await pg.addStyleTag({ content: '.dz-hint{opacity:0!important}' });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  const E = (fn, a) => pg.evaluate(fn, a);
  await E(() => { const G = window.__durinn.G(); G.flags.__nowild = true; G.flags.act2_end = true; G.flags.reached_ash = true; G.flags.magic = true; G.time = 10 * 60; G.flags.q_sbwrit = 1;
    const k = G.look.sex === 'f' ? 'corin' : 'elowyn'; if (!G.partyIds.includes(k)) { G.partyIds.push(k); G.party[k] = { lv: G.party.wren.lv, xp: 0, hp: 90, mp: 12 }; } G.flags.comp_joined = true; });
  const where = () => E(() => window.__durinn.eng.mapId() + ' ' + JSON.stringify(window.__durinn.eng.playerTile()));
  const text = () => E(() => { const q = document.querySelector('.dz-dialog .dz-text'); return q ? q.textContent : ''; });
  const clear = async (n = 30) => { const seen = []; for (let i = 0; i < n; i++) { if (!(await pg.$('.dz-dialog'))) break; seen.push(await text()); if (await pg.$('.dz-choice')) { await pg.click('.dz-choice'); } else await pg.keyboard.press('e'); await pg.waitForTimeout(330); } return seen; };
  const walk = async (key, ms) => { await pg.keyboard.down(key); await pg.waitForTimeout(ms); await pg.keyboard.up(key); await pg.waitForTimeout(800); };
  const warp = async (m, x, y, d) => { await E(([m, x, y, d]) => window.__durinn.eng.warp(m, x, y, d, { dur: 0.05 }), [m, x, y, d]); await pg.waitForTimeout(1600); return clear(); };
  const run = async (s) => { await E((s) => window.__durinn.run(s), s); await pg.waitForTimeout(400); return clear(40); };
  const F = (k) => E((k) => window.__durinn.G().flags[k], k);
  const rest = () => E(() => window.__durinn.act2.pillarRest(window.__durinn.G(), 'eth_gate', false));
  let ok = true; const check = (c, msg) => { console.log((c ? 'PASS ' : 'FAIL ') + msg); if (!c) ok = false; };
  // the task list knows it's Act Three
  // the companion's story, one piece per rest
  await E(() => { window.__durinn.G().flags.cr_obs = true; });
  let said = await run('dbg_pillarhook'); check(/Teo/.test(said.join(' ')) && (await F('comp_story')) === 1, 'piece one at a Pillar');
  said = await run('dbg_pillarhook'); check(!said.length, 'nothing more until a rest');
  for (let n = 2; n <= 4; n++) { await rest(); said = await run('dbg_pillarhook'); check((await F('comp_story')) === n, 'piece ' + n + ': ' + (said[1] || '').slice(0, 60)); }
  check(await F('comp_story_done'), 'the whole incident told');
  // an Unbound camp: warned off, then welcomed
  const u = await E(() => { const D = window.__durinn.data().MAP_DEFS; for (const id in D) for (const t of D[id].triggers || []) if (t.id === 'unb0') return { map: id, x: t.x, y: t.y }; });
  await warp(u.map, u.x - 9, u.y, 'right'); await walk('ArrowRight', 900); said = await clear(8);
  check(/warning/.test(said.join(' ')) && !(await F('unb_trusted')), 'warned off without the thread');
  await E(() => { window.__durinn.G().items.unbthread = 1; });
  await warp(u.map, u.x - 9, u.y, 'right'); await walk('ArrowRight', 900); said = await clear(12);
  check(await F('unb_trusted'), 'welcomed with the red thread');
  await warp(u.map, u.x - 3, u.y + 3, 'up'); await pg.screenshot({ path: 'shots2/a3_unbcamp.png' });
  said = await run('unb0a'); check(said.length > 0, 'the camp talks');
  // scrutiny
  said = await run('dbg_cast'); check((await F('scrutiny')) >= 12 && /scrutiny rises/.test(said.join(' ')), 'casting in Verrin raises scrutiny: ' + await F('scrutiny'));
  await pg.waitForTimeout(300); await pg.screenshot({ path: 'shots2/a3_scrutiny_hud.png' });
  check(await E(() => !!document.querySelector('#dz-scrutiny')), 'scrutiny shows in the HUD');
  await E(() => { window.__durinn.G().flags.scrutiny = 55; });
  await warp('eth20', 41, 64, 'up'); await walk('ArrowUp', 1300); await pg.waitForTimeout(900); said = await clear(30);
  check(/Inquisitor Crane/.test(said.join(' ')) && (await F('scrutiny_questioned')), 'at 50, questioned in Verrin: ' + await where());
  await E(() => { window.__durinn.G().flags.scrutiny = 100; delete window.__durinn.G().flags.ver_registered; });
  await warp('ver_lo', 84, 56, 'down'); await walk('ArrowDown', 1300); await pg.waitForTimeout(500); await clear();
  await warp('eth20', 41, 64, 'up'); await walk('ArrowUp', 1300); await pg.waitForTimeout(900); said = await clear(30);
  check(/Your satchel/.test(said.join(' ')), 'at 100, the Inquisitor comes');
  for (let i = 0; i < 40; i++) { await pg.waitForTimeout(250); if (await E(() => !!window.__battle && window.__battle.phase === 'fight')) break; }
  await pg.waitForTimeout(1200); if (await pg.$('#dz-btip-ok')) await pg.click('#dz-btip-ok'); await pg.waitForTimeout(800);
  await pg.screenshot({ path: 'shots2/a3_arrest.png' });
  await E(() => { for (const u of window.__battle.units) { if (u.side === 'e') { u.hp = 0; u.ko = true; } } window.__battle.queue = []; });
  for (let i = 0; i < 40; i++) { await pg.waitForTimeout(250); if (await pg.$('#dz-battle-done')) break; }
  await pg.click('#dz-battle-done'); await pg.waitForTimeout(1800); said = await clear();
  check((await F('scrutiny')) === 40, 'fought free: scrutiny drops to 40');
  await rest(); check((await F('scrutiny')) === 25, 'a rest away from the cities lowers it: ' + await F('scrutiny'));
  await warp('eth20', 41, 40, 'up'); await pg.waitForTimeout(500);
  let task = await E(() => (document.querySelector('.dz-task') || {}).textContent || '');
  check(!/Ashford|Act Two/.test(task) && task.length > 5, 'Act Three task in the HUD: ' + task);
  // Ulric's dispatch, and Eyes in Aurelm
  await E(() => { const G = window.__durinn.G(); G.items.dispatch = 1; G.flags.q_lantern = 4; G.flags.ver_lantern = true; G.flags.reached_verrin_hi = true; });
  said = await run('venn'); check(/Icetoe/.test(said.join(' ')) && !(await E(() => window.__durinn.G().items.dispatch)), 'Venn takes Ulric\'s dispatch');
  const errors = errs.filter((e) => !/TUNNEL|fonts/.test(e));
  check(!errors.length, 'no errors ' + errors.slice(0, 3).join(' | '));
  console.log(ok ? 'ALL PASS' : 'SOME FAILED'); await b.close();
})();
