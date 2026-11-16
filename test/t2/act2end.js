const { boot, jump } = require('./common');
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 2 });
  await pg.addStyleTag({ content: '.dz-hint{opacity:0!important}' });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  const E = (fn, a) => pg.evaluate(fn, a); const log = [];
  await E(() => { const G = window.__durinn.G(); Object.assign(G.flags, { left_oak: true, __nowild: true, q_flicker: 5, reached_ash: true, reached_fort: true, fort_pass_s: true, hakon_joined: true }); G.items.covletter = 1; window.__durinn.act2.act2Ensure(G).pillars.fort = true; window.__durinn.act2.act2Ensure(G).pillars.ash = true; });
  const warp = async (m, x, y, d, w = 1500) => { await E(([m, x, y, d]) => window.__durinn.eng.warp(m, x, y, d, { dur: 0.15 }), [m, x, y, d]); await pg.waitForTimeout(w); };
  const shot = (n) => pg.screenshot({ path: `shots2/a2e_${n}.png` });
  const where = () => E(() => window.__durinn.eng.mapId() + ' ' + JSON.stringify(window.__durinn.eng.playerTile()));
  const flags = (ks) => E((ks) => ks.map((k) => k + '=' + window.__durinn.G().flags[k]).join(' '), ks);
  const talkThrough = async (picks = [], max = 50, tag = '') => { for (let i = 0; i < max; i++) { await pg.waitForTimeout(170); const st = await E(() => { const d = document.querySelector('.dz-dialog'); if (!d) return null; const t = d.querySelector('.dz-text'); return { text: t ? t.textContent : '', ch: [...d.querySelectorAll('.dz-choice')].map((b) => b.textContent) }; }); if (!st) return; if (st.ch.length) { const p = picks.length ? picks.shift() : 0; log.push(`${tag} [${st.ch[p]}]`); await pg.waitForTimeout(450); await pg.click('#dz-choice-' + p); continue; } log.push(`${tag} ${st.text.slice(0, 110)}`); await pg.keyboard.press('e'); } };
  const run = async (k, picks = [], tag = k) => { await E((k) => window.__durinn.run(k), k); await talkThrough(picks, 50, tag); };
  await warp('fort_cmd', 9, 6, 'up'); await run('ulric'); log.push(await flags(['ulric_met', 'q_maud', 'oak_rebuilt']));
  // home along the Ashford road
  await warp('plainsSW', 2, 28, 'left'); await pg.keyboard.down('ArrowLeft'); await pg.waitForTimeout(900); await pg.keyboard.up('ArrowLeft'); await pg.waitForTimeout(2200);
  log.push('home: ' + await where()); await talkThrough([], 12, 'home'); await shot('oak_gate');
  for (const [n, x, y] of [['oak_square', 24, 24], ['oak_memorial', 15, 14], ['oak_tavern', 34, 29]]) { await warp('oak', x, y, 'up'); await shot(n); }
  await warp('tavern', 4, 5, 'up'); await run('bram_rebuilt', [1], 'bram'); await shot('bram');
  // Maud
  await warp('hut', 4, 5, 'up'); await shot('hut'); await run('maud', [], 'maud'); log.push(await flags(['q_maud', 'memit']) + ' bundle=' + await E(() => window.__durinn.G().items.maudbundle));
  // Mem-it from Oakhaven's stone to the Fort
  await warp('oak', 24, 21, 'up'); await E(() => window.__durinn.pillar()); await pg.waitForTimeout(500); log.push('pillar ui: ' + await E(() => [...document.querySelectorAll('.dz-opt')].map((b) => b.id + ':' + b.textContent).join(' / '))); if (await pg.$('#dz-pillar-travel')) { await pg.click('#dz-pillar-travel'); await pg.waitForTimeout(400); await shot('memit'); await pg.click('#dz-travel-fort'); } await pg.waitForTimeout(3500);
  log.push('memit: ' + await where());
  await warp('fort_cmd', 9, 6, 'up'); await run('ulric', [0], 'ulric2'); log.push(await flags(['q_maud', 'q_south', 'ulric_hint']) + ' dispatch=' + await E(() => window.__durinn.G().items.dispatch));
  // the south gate
  await warp('ash', 26, 63, 'down'); await shot('ash_south');
  await E(() => { const e = window.__durinn.eng; e.placePlayer(26 * 16 + 8, 64 * 16 + 8); e.debugState().player.dir = 'down'; }); await pg.waitForTimeout(300);
  log.push('gate target ' + JSON.stringify(await E(() => window.__durinn.eng.interact()))); await pg.keyboard.press('e'); await talkThrough([0], 30, 'south');
  await pg.waitForTimeout(9000); await shot('credits'); log.push(await flags(['act2_end', 'q_south']) + ' credits=' + !!(await pg.$('#dz-credits-done')));
  if (await pg.$('#dz-credits-done')) { await pg.click('#dz-credits-done'); await pg.waitForTimeout(800); }
  log.push('after: ' + await where());
  console.log(log.join('\n')); console.log('ERR', errs.filter((e) => !/TUNNEL/.test(e))); await b.close();
})();
