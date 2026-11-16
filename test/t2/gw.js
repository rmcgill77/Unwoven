const { boot, jump } = require('./common');
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 2 });
  await pg.addStyleTag({ content: '.dz-hint{opacity:0!important}' });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  const E = (fn, a) => pg.evaluate(fn, a); const log = [];
  await E(() => { const G = window.__durinn.G(); Object.assign(G.flags, { left_oak: true, __nowild: true, reached_ash: true }); G.items.scrap = 3; G.items.hide = 3; G.coins = 300; });
  const warp = async (m, x, y, d, w = 1500) => { await E(([m, x, y, d]) => window.__durinn.eng.warp(m, x, y, d, { dur: 0.15 }), [m, x, y, d]); await pg.waitForTimeout(w); };
  const shot = (n) => pg.screenshot({ path: `shots2/gw_${n}.png` });
  const talkThrough = async (picks = [], max = 30, tag = '') => { for (let i = 0; i < max; i++) { await pg.waitForTimeout(170); const st = await E(() => { const d = document.querySelector('.dz-dialog'); if (!d) return null; const t = d.querySelector('.dz-text'); return { text: t ? t.textContent : '', ch: [...d.querySelectorAll('.dz-choice')].map((b) => b.textContent) }; }); if (!st) return; if (st.ch.length) { const p = picks.length ? picks.shift() : 0; log.push(`${tag} [${st.ch[p]}]`); await pg.waitForTimeout(450); await pg.click('#dz-choice-' + p); continue; } log.push(`${tag} ${st.text.slice(0, 90)}`); await pg.keyboard.press('e'); } };
  const npcAt = (id) => E((id) => { const n = window.__durinn.eng.debugState().npcs[id]; return n ? { map: n.map, x: Math.floor(n.x / 16), y: Math.floor(n.y / 16) } : null; }, id);
  const talk = async (id, picks, tag) => { const n = await npcAt(id); if (!n || !n.map) { log.push(`!! ${id} not placed`); return; } await warp(n.map, n.x, n.y + 1, 'up', 1000); const n2 = await npcAt(id); await E(([x, y]) => { const e = window.__durinn.eng; e.placePlayer(x * 16 + 8, (y + 1) * 16 + 10); e.debugState().player.dir = 'up'; }, [n2.x, n2.y]); await pg.waitForTimeout(300); await pg.keyboard.press('e'); return talkThrough(picks, 40, tag || id); };
  const flags = () => E(() => { const f = window.__durinn.G().flags; return Object.keys(f).filter((k) => /^q_(keystone|iron|ledgers|watch|hides)|gw_|reached_gw/.test(k)).map((k) => k + '=' + f[k]).join(' '); });
  await warp('plainsNW', 97, 32, 'up'); await pg.keyboard.down('ArrowUp'); await pg.waitForTimeout(800); await pg.keyboard.up('ArrowUp'); await pg.waitForTimeout(2600);
  log.push('map ' + await E(() => window.__durinn.eng.mapId())); await talkThrough([], 8, 'arrive'); await shot('01_gate');
  for (const [n, x, y, d] of [['pillar', 27, 34, 'up'], ['lamp', 13, 13, 'up'], ['graves', 37, 13, 'up'], ['chapel', 9, 30, 'up'], ['inn', 39, 26, 'up'], ['forge', 22, 44, 'up'], ['huts', 44, 47, 'up'], ['homes', 12, 52, 'up']]) { await warp('gw', x, y, d); await shot(n); }
  for (const r of ['gw_lamp', 'gw_inn', 'gw_forge']) { const d = await E((r) => window.__durinn.data().MAP_DEFS[r], r); const w = d.rows[0].length, h = d.rows.length; await warp(r, Math.floor(w / 2) - (w % 2 ? 0 : 1), h - 2, 'up', 1200); await shot('in_' + r); }
  await talk('gideon', [0], 'gideon'); await talk('ida', [0, 1], 'ida'); await talk('ida', [1], 'ida2');
  await talk('brack', [0, 1], 'brack'); await talk('brack', [1], 'brack2');
  log.push(await flags() + ' trader mult ' + await E(() => window.__durinn.act2.SHOPS.greywick_trader.mult));
  await talk('sarn', [0], 'sarn');
  await warp('gw', 3, 27, 'up'); await E(() => window.__durinn.run('look_chapelback')); await talkThrough([0], 6, 'back'); await pg.waitForTimeout(1500); log.push('in ' + await E(() => window.__durinn.eng.mapId())); await shot('in_chapel');
  await E(() => window.__durinn.run('look_chest')); await talkThrough([], 4, 'x');
  await E(() => { const e = window.__durinn.eng; e.placePlayer(9 * 16 + 8, 3 * 16 + 6); e.debugState().player.dir = 'up'; }); await pg.waitForTimeout(300); await pg.keyboard.press('e'); await talkThrough([], 6, 'chest');
  await talk('sarn', [], 'sarn2');
  await talk('mags', [0, 1], 'mags');
  log.push(await flags() + ' coins ' + await E(() => window.__durinn.G().coins));
  // night: Tam, then the boundary stone
  await warp('gw', 27, 32, 'up'); await E(() => window.__durinn.pillar()); await pg.waitForTimeout(400); log.push('study allowed? pillar panel'); await shot('pillar_panel'); await pg.click('#dz-pillar-swap'); await pg.waitForTimeout(3500); await talkThrough([], 4, 'rest');
  await shot('night_pillar');
  await talk('tam', [0], 'tam'); await talk('marchguard', [], 'march'); await talk('tam', [], 'tam2');
  log.push(await flags());
  console.log(log.join('\n')); console.log('ERR', errs.filter((e) => !/TUNNEL/.test(e))); await b.close();
})();
