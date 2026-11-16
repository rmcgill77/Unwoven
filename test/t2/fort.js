const { boot, jump } = require('./common');
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 2 });
  await pg.addStyleTag({ content: '.dz-hint{opacity:0!important}' });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  const E = (fn, a) => pg.evaluate(fn, a); const log = [];
  await E(() => { const G = window.__durinn.G(); Object.assign(G.flags, { left_oak: true, __nowild: true, q_flicker: 5, primer_read: true, q_keystone: 1, reached_gw: true, q_whisper: 2 }); G.items.covletter = 1; G.coins = 300; });
  const warp = async (m, x, y, d, w = 1500) => { await E(([m, x, y, d]) => window.__durinn.eng.warp(m, x, y, d, { dur: 0.15 }), [m, x, y, d]); await pg.waitForTimeout(w); };
  const shot = (n) => pg.screenshot({ path: `shots2/fort_${n}.png` });
  const where = () => E(() => window.__durinn.eng.mapId() + ' ' + JSON.stringify(window.__durinn.eng.playerTile()));
  const talkThrough = async (picks = [], max = 40, tag = '') => { for (let i = 0; i < max; i++) { await pg.waitForTimeout(170); const st = await E(() => { const d = document.querySelector('.dz-dialog'); if (!d) return null; const t = d.querySelector('.dz-text'); return { text: t ? t.textContent : '', ch: [...d.querySelectorAll('.dz-choice')].map((b) => b.textContent) }; }); if (!st) return; if (st.ch.length) { const p = picks.length ? picks.shift() : 0; log.push(`${tag} [${st.ch[p]}]`); await pg.waitForTimeout(450); await pg.click('#dz-choice-' + p); continue; } log.push(`${tag} ${st.text.slice(0, 100)}`); await pg.keyboard.press('e'); } };
  const run = async (k, picks = [], tag = k) => { await E((k) => window.__durinn.run(k), k); await talkThrough(picks, 40, tag); };
  const walk = async (key, ms) => { await pg.keyboard.down(key); await pg.waitForTimeout(ms); await pg.keyboard.up(key); await pg.waitForTimeout(1800); };
  const winFight = async (n) => { for (let i = 0; i < 40; i++) { await pg.waitForTimeout(250); if (await E(() => !!window.__battle && window.__battle.phase === 'fight')) break; } await pg.waitForTimeout(600); if (await pg.$('#dz-btip-ok')) await pg.click('#dz-btip-ok'); await pg.waitForTimeout(900); await shot('fight_' + n); await E(() => { for (const u of window.__battle.units) { if (u.side === 'e') { u.hp = 0; u.ko = true; } else { u.gauge = 0; u.queued = null; } } window.__battle.queue = []; }); for (let i = 0; i < 40; i++) { await pg.waitForTimeout(250); if (await pg.$('#dz-battle-done')) break; } await pg.click('#dz-battle-done'); await pg.waitForTimeout(1600); await talkThrough([], 12, 'after-' + n); };
  const flags = (ks) => E((ks) => ks.map((k) => k + '=' + window.__durinn.G().flags[k]).join(' '), ks);
  // the south gate: barred until Hesk is seen
  await warp('os', 49, 46, 'up'); await walk('ArrowUp', 900); log.push('before toll: ' + await where());
  await run('ostoll'); await walk('ArrowUp', 1200); log.push('after toll: ' + await where()); await talkThrough([], 10, 'arrive');
  await shot('01_inside_gate');
  for (const [n, x, y, d] of [['market', 74, 76, 'up'], ['square', 74, 52, 'up'], ['cmdpost', 74, 22, 'up'], ['yard', 126, 52, 'up'], ['barracks', 123, 36, 'up'], ['stores', 20, 46, 'up'], ['weaver', 21, 20, 'up'], ['lower', 18, 70, 'up'], ['tower', 123, 18, 'up'], ['northgate', 74, 6, 'up'], ['inn', 62, 86, 'up']]) { await warp('fort', x, y, d); await shot(n); }
  for (const id of ['fort_cmd', 'fort_chapel', 'fort_weaver', 'fort_mess', 'fort_store', 'fort_barracks', 'fort_qm', 'fort_inn', 'fort_cells', 'fort_under']) { const [x, y] = await E((id) => { const r = window.__durinn.data().MAP_DEFS[id].rows; return [Math.floor(r[0].length / 2), r.length - 2]; }, id); await warp(id, x, y, 'up', 1200); await shot('in_' + id.slice(5)); }
  // Ulric
  await run('ulric'); log.push(await flags(['ulric_met', 'q_maud', 'ulric_letter']) + ' maudletter=' + await E(() => window.__durinn.G().items.maudletter));
  // Ysolt and a first bout
  const c0 = await E(() => window.__durinn.G().coins);
  await warp('fort', 128, 46, 'up'); await run('ysolt', [0]); await winFight('recruit');
  log.push('spar ' + await flags(['spar_sp_recruit']) + ' coins ' + c0 + '->' + await E(() => window.__durinn.G().coins));
  await run('ysolt', [3]); await winFight('sergeant');
  await run('orvin'); await run('bede', [], 'bede'); log.push('shop ' + !!(await pg.$('.dz-shop')));
  if (await pg.$('.dz-shop-close')) await pg.click('.dz-shop-close'); await pg.keyboard.press('Escape'); await pg.waitForTimeout(400);
  // the prisoner
  await warp('fort_cells', 7, 4, 'up'); await run('prisoner', [], 'prisoner');
  // night: the keystone, the gates barred
  await warp('fort', 74, 47, 'up'); await E(() => window.__durinn.pillar()); await pg.waitForTimeout(400); if (await pg.$('#dz-pillar-swap')) await pg.click('#dz-pillar-swap'); await pg.waitForTimeout(3500); await talkThrough([], 6, 'rest');
  log.push('study allowed ' + (await pg.$('.dz-pinote') ? 'no' : 'yes?'));
  await warp('fort', 74, 89, 'down'); await walk('ArrowDown', 1000); log.push('night exit: ' + await where());
  await shot('night_gate'); await warp('fort', 74, 50, 'up'); await shot('night_square');
  await warp('fort_store', 9, 4, 'up'); await run('look_keystones', [0], 'keystone'); log.push(await flags(['fort_keystone', 'q_keystone']));
  await E(() => window.__durinn.run('look_storetrap')); await talkThrough([0], 6, 'trap'); log.push('trap: ' + await where());
  // to Greywick with it
  await warp('gw_lamp', 7, 7, 'up'); await run('gideon', [], 'gideon'); log.push(await flags(['gw_keystone', 'q_keystone']));
  // north gate search and the grate, by day
  await warp('os', 41, 54, 'up'); await E(() => window.__durinn.pillar()); await pg.waitForTimeout(400); if (await pg.$('#dz-pillar-swap')) await pg.click('#dz-pillar-swap'); await pg.waitForTimeout(3500); await talkThrough([], 6, 'rest2');
  await warp('os', 49, 7, 'down'); await run('osnorth1', [0], 'search'); await walk('ArrowDown', 1300); log.push('north: ' + await where());
  await run('wayfarer', [], 'wayfarer'); await warp('os', 30, 25, 'right'); await E(() => window.__durinn.run('look_grate')); await talkThrough([0], 6, 'grate'); log.push('grate: ' + await where());
  console.log(log.join('\n')); console.log('ERR', errs.filter((e) => !/TUNNEL/.test(e))); await b.close();
})();
