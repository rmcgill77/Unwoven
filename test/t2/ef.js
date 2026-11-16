const { boot, jump } = require('./common');
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 2 });
  await pg.addStyleTag({ content: '.dz-hint{opacity:0!important}' });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  const E = (fn, a) => pg.evaluate(fn, a); const log = [];
  await E(() => { const f = window.__durinn.G().flags; Object.assign(f, { left_oak: true, __nowild: true, q_hakon: 1 }); });
  const warp = async (m, x, y, d, w = 1500) => { await E(([m, x, y, d]) => window.__durinn.eng.warp(m, x, y, d, { dur: 0.15 }), [m, x, y, d]); await pg.waitForTimeout(w); };
  const shot = (n) => pg.screenshot({ path: `shots2/ef_${n}.png` });
  const talkThrough = async (picks = [], max = 30, tag = '') => { for (let i = 0; i < max; i++) { await pg.waitForTimeout(170); const st = await E(() => { const d = document.querySelector('.dz-dialog'); if (!d) return null; const t = d.querySelector('.dz-text'); return { text: t ? t.textContent : '', ch: [...d.querySelectorAll('.dz-choice')].map((b) => b.textContent) }; }); if (!st) return; if (st.ch.length) { const p = picks.length ? picks.shift() : 0; log.push(`${tag} [${st.ch[p]}]`); await pg.waitForTimeout(450); await pg.click('#dz-choice-' + p); continue; } log.push(`${tag} ${st.text.slice(0, 90)}`); await pg.keyboard.press('e'); } };
  const winFight = async (n) => { for (let i = 0; i < 40; i++) { await pg.waitForTimeout(250); if (await E(() => !!window.__battle && window.__battle.phase === 'fight')) break; } await pg.waitForTimeout(600); if (await pg.$('#dz-btip-ok')) await pg.click('#dz-btip-ok'); await pg.waitForTimeout(900); await shot('fight_' + n); await E(() => { for (const u of window.__battle.units) { if (u.side === 'e') { u.hp = 0; u.ko = true; } else { u.gauge = 0; u.queued = null; } } window.__battle.queue = []; }); for (let i = 0; i < 40; i++) { await pg.waitForTimeout(250); if (await pg.$('#dz-battle-done')) break; } if (!(await pg.$('#dz-battle-done'))) { await shot('stuck_' + n); log.push('STUCK ' + JSON.stringify(await E(() => { const B = window.__battle; return { ph: B.phase, cur: B.cur, win: B.window, q: B.queue, t: B.t, keys: Object.keys(B).join(','), u: B.units.map((u) => [u.key, u.side, u.hp, u.ko, u.act && u.act.kind, Math.round(u.gauge), !!u.cast]) }; }))); console.log(log.join('\n')); process.exit(1); } await pg.click('#dz-battle-done'); await pg.waitForTimeout(1600); await talkThrough([], 12, 'after-' + n); };
  await E(() => window.__durinn.run('hakon')); await talkThrough([0], 20, 'hakon');
  log.push('party ' + await E(() => window.__durinn.G().partyIds.join(',')));
  // walk in from the plains
  await warp('plainsSE', 87, 20, 'right'); await pg.keyboard.down('ArrowRight'); await pg.waitForTimeout(900); await pg.keyboard.up('ArrowRight'); await pg.waitForTimeout(2200);
  log.push('map ' + await E(() => window.__durinn.eng.mapId())); await shot('01_edge');
  for (const [n, x, y, d] of [['watch', 18, 29, 'up'], ['gate', 27, 27, 'right'], ['ditch', 30, 37, 'up'], ['yard', 40, 29, 'up'], ['qm', 46, 22, 'up'], ['pens', 58, 28, 'up'], ['war', 72, 28, 'up'], ['bluffpath', 78, 18, 'up'], ['bluff', 81, 11, 'up'], ['dell', 27, 44, 'down']]) { await warp('eforest', x, y, d); await shot(n); }
  // tarped Pillar before and after the yard crew
  await warp('eforest', 42, 32, 'up', 1200); await E(() => { const e = window.__durinn.eng; e.placePlayer(42 * 16 + 8, 31 * 16 + 6); e.debugState().player.dir = 'up'; }); await pg.waitForTimeout(400); await pg.keyboard.press('e'); await talkThrough([], 6, 'tarp1');
  await E(() => window.__durinn.fight(['bthug', 'barcher', 'orcW'])); await winFight('yard');
  await warp('eforest', 42, 32, 'up', 1200); await E(() => { const e = window.__durinn.eng; e.placePlayer(42 * 16 + 8, 31 * 16 + 6); e.debugState().player.dir = 'up'; }); await pg.waitForTimeout(400); await pg.keyboard.press('e'); log.push('tgt2 ' + JSON.stringify(await E(() => window.__durinn.eng.interact())) + ' dlg ' + !!(await pg.$('.dz-dialog'))); await pg.waitForTimeout(400); await talkThrough([], 14, 'tarp2'); await shot('tarp_off');
  log.push('flags ' + await E(() => JSON.stringify(window.__durinn.G().pillars) + ' ' + ['ef_yard_clear','ef_tarp_off','arthur_told'].map((k) => k + '=' + window.__durinn.G().flags[k]).join(' ')));
  // the ledger in the pens
  await E(() => window.__durinn.run('look_ledger')); await talkThrough([], 8, 'ledger');
  // the Iron Cleave
  await E(() => window.__durinn.fight(['ironcleave', 'orcS', 'orcW'])); await winFight('cleave');
  log.push('hakon weapon ' + await E(() => JSON.stringify(window.__durinn.G().equip.hakon)) + ' items ' + await E(() => Object.keys(window.__durinn.G().items).filter((k) => /primer|bill|signet|ledger|cleaver/.test(k)).join(',')));
  // read the primer at the bluff Pillar
  await warp('eforest', 75, 24, 'up', 1200); await pg.keyboard.down('ArrowUp'); await pg.waitForTimeout(200); await pg.keyboard.up('ArrowUp'); await pg.waitForTimeout(350); await pg.keyboard.press('e'); await talkThrough([], 10, 'primer');
  log.push('words ' + await E(() => window.__durinn.G().words.r.join(',') + ' / ' + window.__durinn.G().words.s.join(',')));
  // a truth working in battle: Ver-at breaks the Cleave's guard
  await E(() => window.__durinn.fight(['bknight'])); for (let i = 0; i < 30; i++) { await pg.waitForTimeout(250); if (await E(() => !!window.__battle && window.__battle.phase === 'fight')) break; } if (await pg.$('#dz-btip-ok')) await pg.click('#dz-btip-ok');
  log.push('cast Ver-at ' + await E(() => { const B = window.__battle; const u = B.units.find((x) => x.key === 'wren'); u.gauge = 100; u.mp = 30; const t = B.units.find((x) => x.side === 'e'); return B.command(u.id, { type: 'cast', spell: 'Ver-at', target: t.id }); }));
  await pg.waitForTimeout(3000); await shot('ver');
  await E(() => { for (const u of window.__battle.units) { if (u.side === 'e') { u.hp = 0; u.ko = true; } else { u.gauge = 0; u.queued = null; } } window.__battle.queue = []; }); for (let i = 0; i < 40; i++) { await pg.waitForTimeout(250); if (await pg.$('#dz-battle-done')) break; } await pg.click('#dz-battle-done'); await pg.waitForTimeout(1200);
  log.push('tasks ' + await E(() => document.querySelector('.dz-task, .dz-tasks') ? document.querySelector('.dz-task, .dz-tasks').textContent.slice(0, 200) : ''));
  // night in the camp
  await warp('eforest', 75, 24, 'up'); await E(() => window.__durinn.pillar()); await pg.waitForTimeout(400); await pg.click('#dz-pillar-swap'); await pg.waitForTimeout(3500); await talkThrough([], 4, 'rest');
  await E(() => { window.__durinn.G().flags.__nowild = false; window.__durinn.eng.respawnWild(); });
  log.push('night wild ' + JSON.stringify(await E(() => window.__durinn.eng.debugState().wolves.map((w) => w.group.join('+')))));
  await E(() => { window.__durinn.G().flags.__nowild = true; window.__durinn.eng.respawnWild(); });
  await warp('eforest', 58, 28, 'up'); await shot('night_pens');
  await warp('eforest', 2, 27, 'left'); await pg.keyboard.down('ArrowLeft'); await pg.waitForTimeout(800); await pg.keyboard.up('ArrowLeft'); await pg.waitForTimeout(2200);
  log.push('exit to ' + await E(() => window.__durinn.eng.mapId()));
  console.log(log.join('\n')); console.log('ERR', errs.filter((e) => !/TUNNEL/.test(e))); await b.close();
})();
