const { boot, jump } = require('./common');
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 1 });
  await pg.addStyleTag({ content: '.dz-hint{opacity:0!important}' });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  const E = (fn, a) => pg.evaluate(fn, a);
  await E(() => { const G = window.__durinn.G(); G.flags.left_oak = true; G.flags.__nowild = true; G.coins = 500; });
  const log = [];
  const shot = (n) => pg.screenshot({ path: `shots2/q_${n}.png` });
  const warp = async (m, x, y, d, w = 1300) => { await E(([m, x, y, d]) => window.__durinn.eng.warp(m, x, y, d, { dur: 0.15 }), [m, x, y, d]); await pg.waitForTimeout(w); };
  // finish whatever dialogue is open, choosing option `pick` (index list consumed in order)
  const talkThrough = async (picks = [], max = 40, tag = '') => {
    for (let i = 0; i < max; i++) {
      await pg.waitForTimeout(160);
      const st = await E(() => { const d = document.querySelector('.dz-dialog'); if (!d) return null; const t = d.querySelector('.dz-text'); return { text: t ? t.textContent : '', ch: [...d.querySelectorAll('.dz-choice')].map((b) => b.textContent) }; });
      if (!st) { if (await pg.$('.dz-fight, .dz-battle')) return 'fight'; return 'done'; }
      if (st.ch.length) { const p = picks.length ? picks.shift() : 0; log.push(`${tag} [choose ${st.ch[p]}]`); await pg.waitForTimeout(450); await pg.click('#dz-choice-' + p); continue; }
      log.push(`${tag} ${st.text.slice(0, 90)}`);
      await pg.keyboard.press('e'); await pg.waitForTimeout(60); await pg.keyboard.press('e');
    }
    return 'max';
  };
  const npcAt = (id) => E((id) => { const n = window.__durinn.eng.debugState().npcs[id]; return n ? { map: n.map, x: Math.floor(n.x / 16), y: Math.floor(n.y / 16) } : null; }, id);
  const talk = async (id, picks, tag) => {
    const n = await npcAt(id); if (!n || !n.map) { log.push(`!! ${id} not placed`); return; }
    await warp(n.map, n.x, n.y + 1, 'up', 1000);
    const n2 = await npcAt(id); await E(([x, y]) => window.__durinn.eng.placePlayer(x * 16 + 8, (y + 1) * 16 + 10), [n2.x, n2.y]); await pg.waitForTimeout(250);
    await pg.keyboard.press('e'); return talkThrough(picks, 40, tag || id);
  };
  const flags = () => E(() => { const f = window.__durinn.G().flags; return Object.keys(f).filter((k) => /^q_|m_|reached|ash_|hakon|tome_|secret/.test(k)).map((k) => k + '=' + f[k]).join(' '); });
  const winFight = async (n) => {
    for (let i = 0; i < 40; i++) { await pg.waitForTimeout(250); if (await E(() => !!window.__battle && window.__battle.phase === 'fight')) break; }
    await pg.waitForTimeout(600); if (await pg.$('#dz-btip-ok')) await pg.click('#dz-btip-ok');
    await pg.waitForTimeout(500); if (n) await shot('fight_' + n);
    await E(() => { for (const u of window.__battle.units) if (u.side === 'e') { u.hp = 0; u.ko = true; } });
    for (let i = 0; i < 40; i++) { await pg.waitForTimeout(250); if (await pg.$('#dz-battle-done')) break; }
    await pg.click('#dz-battle-done'); await pg.waitForTimeout(1500); log.push('fight won ' + n);
    await talkThrough([], 10, 'after-' + n);
  };
  const run = async (name, picks, tag) => { await E((n) => window.__durinn.run(n), name); return talkThrough(picks, 30, tag || name); };

  await E(() => { const f = window.__durinn.G().flags; Object.assign(f, { reached_ash: true, m_voidsong: true, q_flicker: 1, q_msg: 1, q_hakon: 1, q_casks: 1, q_rats: 1, q_hound: 1, q_debt: 1 }); window.__durinn.G().items.covnote = 1; });
  // nightfall at Ashford's Pillar
  await warp('ash', 26, 27, 'up'); await E(() => window.__durinn.pillar()); await pg.waitForTimeout(400); await pg.click('#dz-pillar-swap'); await pg.waitForTimeout(3500);
  await talkThrough([], 5, 'rest');
  await warp('ash', 26, 26, 'up', 1500); await shot('night_pillar'); await pg.keyboard.press('e'); await talkThrough([], 10, 'pillar1');
  await E(() => window.__durinn.fight(['pleader', 'pscout'])); await winFight('pleader');
  await warp('ash', 26, 26, 'up', 1200); await pg.keyboard.press('e'); await talkThrough([], 10, 'pillar2'); await shot('night_mended');
  await talk('voidsong', [1], 'void2');
  await talk('hakon', [0], 'hakon'); await talk('osric', [], 'osric'); await talk('agna', [0], 'agna');
  await E(() => { window.__durinn.G().items.mooncap = 1; }); await talk('agna', [], 'agna2');
  log.push(await flags());
  // the plains folk
  await talk('hunter', [], 'hunter'); await talk('trader', [0], 'trader');
  await talk('wayfarer', [], 'wayfarer');
  await run('look_wagon', [], 'wagon'); await winFight('casks');
  await run('look_farm', [], 'farm'); await winFight('hound');
  await warp('ash_mill', 9, 6, 'right'); await run('look_cellar', [0], 'cellar'); await pg.waitForTimeout(2500); await talkThrough([], 6, 'cellar-in'); await winFight('rats');
  log.push(await flags());
  for (const id of ['perrin', 'pell', 'osric', 'davytarn', 'aldous', 'mabry']) await talk(id, [], id + '-done');
  log.push(await flags());
  log.push(JSON.stringify(await E(() => { const G = window.__durinn.G(); return { coins: G.coins, items: Object.keys(G.items).filter((k) => /letter|coat|keg|charm|casks|purse|reply|note/.test(k)), party: G.partyIds }; })));
  console.log(log.join('\n'));
  console.log('ERR', errs.filter((e) => !/TUNNEL/.test(e)));
  await b.close();
})();
