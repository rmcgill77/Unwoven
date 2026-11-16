const { boot, jump } = require('./common');
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 2 });
  await pg.addStyleTag({ content: '.dz-hint{opacity:0!important}' });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  const E = (fn, a) => pg.evaluate(fn, a); const log = [];
  await E(() => { Object.assign(window.__durinn.G().flags, { left_oak: true, __nowild: true }); });
  const warp = async (m, x, y, d, w = 1500) => { await E(([m, x, y, d]) => window.__durinn.eng.warp(m, x, y, d, { dur: 0.15 }), [m, x, y, d]); await pg.waitForTimeout(w); };
  const shot = (n) => pg.screenshot({ path: `shots2/os_${n}.png` });
  const talkThrough = async (picks = [], max = 30, tag = '') => { for (let i = 0; i < max; i++) { await pg.waitForTimeout(170); const st = await E(() => { const d = document.querySelector('.dz-dialog'); if (!d) return null; const t = d.querySelector('.dz-text'); return { text: t ? t.textContent : '', ch: [...d.querySelectorAll('.dz-choice')].map((b) => b.textContent) }; }); if (!st) return; if (st.ch.length) { const p = picks.length ? picks.shift() : 0; log.push(`${tag} [${st.ch[p]}]`); await pg.waitForTimeout(450); await pg.click('#dz-choice-' + p); continue; } log.push(`${tag} ${st.text.slice(0, 110)}`); await pg.keyboard.press('e'); } };
  const face = async (x, y, d = 'up') => { await E(([x, y, d]) => { const e = window.__durinn.eng; e.placePlayer(x * 16 + 8, y * 16 + 8); e.debugState().player.dir = d; }, [x, y, d]); await pg.waitForTimeout(350); };
  const look = async (x, y, d, tag) => { await face(x, y, d); log.push(tag + ' -> ' + JSON.stringify(await E(() => window.__durinn.eng.interact()))); await pg.keyboard.press('e'); await talkThrough([], 8, tag); };
  // walk up the Frost Road into the Outskirts
  await warp('plainsNE', 48, 3, 'up'); await pg.keyboard.down('ArrowUp'); await pg.waitForTimeout(1100); await pg.keyboard.up('ArrowUp'); await pg.waitForTimeout(2200);
  log.push('map ' + await E(() => window.__durinn.eng.mapId() + ' ' + JSON.stringify(window.__durinn.eng.playerTile())));
  await shot('01_arrive');
  for (const [n, x, y, d] of [['road', 49, 50, 'up'], ['southgate', 49, 46, 'up'], ['wagons', 55, 49, 'up'], ['shrine', 31, 57, 'up'], ['pillar', 42, 56, 'up'], ['westflank', 22, 40, 'up'], ['cleft', 26, 26, 'right'],
    ['tor', 12, 13, 'up'], ['northgate', 49, 6, 'down'], ['northroad', 49, 3, 'down'], ['valecamp', 84, 11, 'up'], ['pond', 80, 22, 'up'], ['eastflank', 78, 38, 'up'], ['cart', 70, 55, 'up'], ['swcorner', 30, 46, 'up']]) { await warp('os', x, y, d); await shot(n); }
  // people and things
  await warp('os', 49, 50, 'up');
  for (const k of ['osgate1', 'ostoll', 'ospatrol']) { await E((k) => window.__durinn.run(k), k); await talkThrough([], 8, k); }
  await look(49, 43, 'up', 'southgate'); await look(31, 25, 'right', 'grate'); await look(40, 43, 'up', 'wall');
  // night: the tor and Rimefang
  await warp('os', 41, 54, 'up'); await E(() => window.__durinn.pillar()); await pg.waitForTimeout(400); log.push('pillar ' + !!(await pg.$('#dz-pillar-swap'))); if (await pg.$('#dz-pillar-swap')) await pg.click('#dz-pillar-swap'); await pg.waitForTimeout(3500); await talkThrough([], 6, 'rest');
  await E(() => { window.__durinn.G().flags.__nowild = false; window.__durinn.eng.respawnWild(); });
  log.push('night wild ' + JSON.stringify(await E(() => window.__durinn.eng.debugState().wolves.map((w) => w.group.join('+')))));
  await warp('os', 11, 12, 'up'); await shot('night_tor'); await warp('os', 49, 46, 'up'); await shot('night_gate');
  await E(() => { window.__durinn.G().flags.__nowild = true; window.__durinn.eng.respawnWild(); });
  await E(() => window.__durinn.run('osgate1')); await talkThrough([], 6, 'night-gate');
  await E(() => window.__durinn.fight(['rimefang'])); for (let i = 0; i < 40; i++) { await pg.waitForTimeout(250); if (await E(() => !!window.__battle && window.__battle.phase === 'fight')) break; } await pg.waitForTimeout(600); if (await pg.$('#dz-btip-ok')) await pg.click('#dz-btip-ok'); await pg.waitForTimeout(900); await shot('fight_rimefang'); await E(() => { for (const u of window.__battle.units) { if (u.side === 'e') { u.hp = 0; u.ko = true; } else { u.gauge = 0; u.queued = null; } } window.__battle.queue = []; }); for (let i = 0; i < 40; i++) { await pg.waitForTimeout(250); if (await pg.$('#dz-battle-done')) break; } await pg.click('#dz-battle-done'); await pg.waitForTimeout(1600); await talkThrough([], 10, 'after-rime'); log.push('rime ' + await E(() => window.__durinn.G().flags.rimefang_beaten));
  // back down to the plains
  await warp('os', 49, 57, 'down'); await pg.keyboard.down('ArrowDown'); await pg.waitForTimeout(900); await pg.keyboard.up('ArrowDown'); await pg.waitForTimeout(2000);
  log.push('back ' + await E(() => window.__durinn.eng.mapId() + ' ' + JSON.stringify(window.__durinn.eng.playerTile()) + ' ' + JSON.stringify(window.__durinn.eng.debugState().npcs ? 1 : 0)));
  console.log(log.join('\n')); console.log('ERR', errs.filter((e) => !/TUNNEL/.test(e))); await b.close();
})();
