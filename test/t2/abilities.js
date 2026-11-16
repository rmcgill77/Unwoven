const { boot, jump } = require('./common');
/* Tessa and Hakon get Abilities instead of Cast; the player still casts */
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 2 });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  const E = (fn, a) => pg.evaluate(fn, a); const log = [];
  await E(() => { const G = window.__durinn.G(); G.flags.__nowild = true; G.flags.tip_btl = G.flags.tip_btl0 = true; if (!G.partyIds.includes('hakon')) { G.partyIds.push('hakon'); G.party.hakon = btlFreshMember('hakon', 8); } G.party.tessa.mp = 9; G.party.hakon.mp = 9; }).catch((e) => log.push('setup ' + e));
  await E(() => window.__durinn.eng.warp('plainsSW', 30, 30, 'down', { dur: 0.1 })); await pg.waitForTimeout(1500);
  await E(() => window.__durinn.fight(['alpha', 'wolf', 'wolf'])); await pg.waitForTimeout(1500);
  if (await pg.$('#dz-btip-ok')) await pg.click('#dz-btip-ok');
  const seen = {}; const used = { tessa: [], hakon: [] }; let shots = 0;
  for (let i = 0; i < 400 && Object.keys(seen).length < 3 || (i < 400 && (used.tessa.length < 3 || used.hakon.length < 3)); i++) {
    await pg.waitForTimeout(120);
    const st = await E(() => { const w = document.querySelector('.dz-bwho'), c = document.querySelector('#dz-bcmd'); return { who: w ? w.textContent : '', stage: c ? c.dataset.stage : '', cast: !!document.querySelector('#dz-c-magic'), skill: !!document.querySelector('#dz-c-skill'), over: !document.querySelector('.dz-battle') || !!document.querySelector('.dz-bresult, #dz-bdone') }; });
    if (st.over || !st.who) { if (st.over) break; continue; }
    if (st.stage !== 'cmd') continue;
    const name = st.who.split(' ')[0]; seen[name] = { cast: st.cast, abilities: st.skill };
    if (st.skill) {
      const key = name === 'Tessa' ? 'tessa' : 'hakon';
      await pg.click('#dz-c-skill'); await pg.waitForTimeout(150);
      if (shots++ < 1) await pg.screenshot({ path: `shots2/abilities_${key}.png` });
      const order = key === 'tessa' ? ['quickcut', 'hamstring', 'rally'] : ['shieldwall', 'cleave', 'crush'];
      const next = order.find((x) => !used[key].includes(x)) || order[0];
      const btn = await pg.$(`#dz-k-${next}:not([disabled])`);
      if (btn) { await btn.click(); used[key].push(next); await pg.waitForTimeout(120); const t = await pg.$('[id^="dz-t-"]'); if (t) await t.click(); }
      else await pg.click('#dz-c-back').then(() => pg.click('#dz-c-attack'));
      if (key === 'hakon' && next === 'shieldwall') await pg.screenshot({ path: 'shots2/abilities_after.png' });
    } else {
      const f = await pg.$('#dz-c-attack'); if (f) await f.click(); await pg.waitForTimeout(80); const t = await pg.$('[id^="dz-t-"]'); if (t) await t.click();
    }
  }
  log.push('menus ' + JSON.stringify(seen)); log.push('used ' + JSON.stringify(used));
  log.push('log ' + await E(() => { const l = document.querySelector('.dz-blog'); return l ? l.textContent.slice(-300) : ''; }));
  console.log(log.join('\n')); console.log('errors', errs.filter((e) => !e.includes('ERR_TUNNEL')).slice(0, 5));
  await b.close();
})();
