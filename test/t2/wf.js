const { boot, jump } = require('./common');
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 2 });
  await pg.addStyleTag({ content: '.dz-hint{opacity:0!important}' });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  const E = (fn, a) => pg.evaluate(fn, a); const log = [];
  await E(() => { const f = window.__durinn.G().flags; Object.assign(f, { left_oak: true, __nowild: true }); });
  const warp = async (m, x, y, d, w = 1500) => { await E(([m, x, y, d]) => window.__durinn.eng.warp(m, x, y, d, { dur: 0.15 }), [m, x, y, d]); await pg.waitForTimeout(w); };
  const shot = (n) => pg.screenshot({ path: `shots2/wf_${n}.png` });
  const talkThrough = async (picks = [], max = 30, tag = '') => { for (let i = 0; i < max; i++) { await pg.waitForTimeout(170); const st = await E(() => { const d = document.querySelector('.dz-dialog'); if (!d) return null; const t = d.querySelector('.dz-text'); return { text: t ? t.textContent : '', ch: [...d.querySelectorAll('.dz-choice')].map((b) => b.textContent) }; }); if (!st) return; if (st.ch.length) { const p = picks.length ? picks.shift() : 0; log.push(`${tag} [${st.ch[p]}]`); await pg.waitForTimeout(450); await pg.click('#dz-choice-' + p); continue; } log.push(`${tag} ${st.text.slice(0, 80)}`); await pg.keyboard.press('e'); } };
  const winFight = async (n) => { for (let i = 0; i < 40; i++) { await pg.waitForTimeout(250); if (await E(() => !!window.__battle && window.__battle.phase === 'fight')) break; } await pg.waitForTimeout(600); if (await pg.$('#dz-btip-ok')) await pg.click('#dz-btip-ok'); await pg.waitForTimeout(700); await shot('fight_' + n); await E(() => { for (const u of window.__battle.units) if (u.side === 'e') { u.hp = 0; u.ko = true; } }); for (let i = 0; i < 40; i++) { await pg.waitForTimeout(250); if (await pg.$('#dz-battle-done')) break; } await pg.click('#dz-battle-done'); await pg.waitForTimeout(1500); await talkThrough([], 8, 'after'); };
  // walk in from the plains trail
  await warp('plainsSW', 14, 56, 'down'); await pg.keyboard.down('ArrowDown'); await pg.waitForTimeout(900); await pg.keyboard.up('ArrowDown'); await pg.waitForTimeout(2200);
  log.push('map after walking south: ' + await E(() => window.__durinn.eng.mapId())); await shot('01_mouth');
  for (const [n, x, y, d] of [['edge', 22, 18, 'up'], ['hollow', 45, 13, 'up'], ['middle', 40, 25, 'down'], ['glade', 41, 41, 'down'], ['ruinpillar', 66, 29, 'up'], ['hall', 62, 23, 'up'], ['ring', 77, 23, 'up'], ['tower', 85, 12, 'up'], ['garden', 71, 43, 'down'], ['construct', 83, 38, 'down']]) { await warp('wforest', x, y, d); await shot(n); }
  // the scholar
  await warp('wforest', 69, 31, 'up', 1200);
  await E(() => window.__durinn.run('ilse')); await talkThrough([1], 20, 'ilse');
  // the chest: wakes the construct
  await E(() => window.__durinn.run('look_chest')); await talkThrough([], 6, 'chest-noid');
  await E(() => window.__durinn.eng.warp('wforest', 85, 43, 'up', { dur: 0.1 })); await pg.waitForTimeout(1300);
  log.push('target ' + JSON.stringify(await E(() => window.__durinn.eng.interact())));
  await pg.keyboard.press('e'); await talkThrough([], 8, 'chest');
  await winFight('construct');
  log.push('key ' + await E(() => window.__durinn.G().items.constructkey));
  await shot('after_construct');
  await pg.keyboard.press('e'); await talkThrough([], 8, 'chest2');
  log.push('cuirass ' + await E(() => window.__durinn.G().items.weaverplate) + ' recipes ' + await E(() => window.__durinn.G().recipes.join(',')));
  // night: moon-caps and skeletons
  await warp('wforest', 64, 29, 'up'); await E(() => window.__durinn.pillar()); await pg.waitForTimeout(400); await pg.click('#dz-pillar-swap'); await pg.waitForTimeout(3500); await talkThrough([], 4, 'rest');
  await E(() => { window.__durinn.G().flags.__nowild = false; window.__durinn.eng.respawnWild(); });
  await warp('wforest', 70, 41, 'down'); await shot('night_garden');
  await warp('wforest', 76, 28, 'up'); await shot('night_ruins');
  log.push('wild at night: ' + JSON.stringify(await E(() => window.__durinn.eng.debugState().wolves.map((w) => w.group.join('+')).slice(0, 12))));
  // back out to the plains
  await warp('wforest', 13, 2, 'up'); await pg.keyboard.down('ArrowUp'); await pg.waitForTimeout(700); await pg.keyboard.up('ArrowUp'); await pg.waitForTimeout(2200);
  log.push('map after walking north: ' + await E(() => window.__durinn.eng.mapId()));
  console.log(log.join('\n')); console.log('ERR', errs.filter((e) => !/TUNNEL/.test(e))); await b.close();
})();
