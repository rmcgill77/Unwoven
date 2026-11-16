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
  const winFight = async () => { // let the fight play by forcing a win
    for (let i = 0; i < 40; i++) { await pg.waitForTimeout(300); if (await pg.$('.dz-fight, .dz-battle')) break; }
    await shot('fight');
    await E(() => { const s = window.__durinnBattle; });
  };
  // arrival
  await warp('plainsSW', 58, 28, 'down'); await pg.keyboard.down('ArrowDown'); await pg.waitForTimeout(700); await pg.keyboard.up('ArrowDown'); await pg.waitForTimeout(2600);
  await talkThrough([], 10, 'arrive'); await shot('arrive');
  // interiors
  for (const r of ['ash_outpost', 'ash_chapel', 'ash_thistle', 'ash_store', 'ash_herb', 'ash_smith', 'ash_tailor', 'ash_cooper', 'ash_mill', 'ash_cole']) {
    const d = await E((r) => window.__durinn.data().MAP_DEFS[r], r); const w = d.rows[0].length, h = d.rows.length;
    await warp(r, Math.floor(w / 2) - (w % 2 ? 0 : 1), h - 2, 'up', 1200); await shot('in_' + r);
  }
  await talk('voidsong', [0], 'void'); log.push(await flags());
  await talk('perrin', [0], 'perrin');
  await talk('winnie', [1], 'winnie');
  await talk('davytarn', [0], 'tarn'); await talk('aldous', [0], 'aldous'); await talk('mabry', [0], 'mabry'); await talk('pell', [0], 'pell');
  await talk('hobb', [1], 'hobb'); await talk('agna', [], 'agna');
  log.push(await flags());
  await shot('tasks');
  console.log(log.join('\n'));
  console.log('ERR', errs.filter((e) => !/TUNNEL/.test(e)));
  await b.close();
})();
