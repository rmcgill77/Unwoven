const { boot, jump } = require('./common');
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 2 });
  await pg.addStyleTag({ content: '.dz-hint{opacity:0!important}' });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  const E = (fn, a) => pg.evaluate(fn, a);
  await E(() => { const f = window.__durinn.G().flags; Object.assign(f, { left_oak: true, __nowild: true, reached_ash: true, m_voidsong: true, q_hakon: 1 }); });
  const warp = async (m, x, y, d, w = 1500) => { await E(([m, x, y, d]) => window.__durinn.eng.warp(m, x, y, d, { dur: 0.15 }), [m, x, y, d]); await pg.waitForTimeout(w); };
  const shot = (n) => pg.screenshot({ path: `shots2/art_${n}.png` });
  await warp('ash_outpost', 7, 7, 'up'); await shot('voidsong');
  await warp('ash', 15, 7, 'up'); await shot('gate');
  await warp('ash', 29, 31, 'up'); await shot('square');
  await warp('plainsSW', 82, 18, 'up'); await shot('bridge');
  await warp('ash', 26, 27, 'up'); await E(() => window.__durinn.pillar()); await pg.waitForTimeout(400); await pg.click('#dz-pillar-swap'); await pg.waitForTimeout(3500);
  await warp('ash_thistle', 12, 9, 'up'); await shot('hakon_night');
  await pg.evaluate(() => window.__durinn.run('hakon')); await pg.waitForTimeout(300);
  for (let i = 0; i < 20; i++) { await pg.waitForTimeout(200); if (await pg.$('#dz-choice-0')) { await pg.waitForTimeout(450); await pg.click('#dz-choice-0'); } else if (await pg.$('.dz-dialog')) await pg.keyboard.press('e'); else break; }
  console.log(JSON.stringify(await E(() => { const G = window.__durinn.G(); return { ids: G.partyIds, hk: G.party.hakon, eq: G.equip && G.equip.hakon }; })));
  await E(() => window.__durinn.fight(['thug', 'cutpurse']));
  for (let i = 0; i < 30; i++) { await pg.waitForTimeout(250); if (await pg.$('#dz-btip-ok')) break; }
  if (await pg.$('#dz-btip-ok')) await pg.click('#dz-btip-ok');
  await pg.waitForTimeout(800); await shot('battle');
  // make Hakon swing: force an attack act and capture frames
  await E(() => { const B = window.__battle; const u = B.units.find((x) => x.key === 'hakon'); u.gauge = 100; const t = B.units.find((x) => x.side === 'e' && !x.ko); B.command(u.id, { type: 'attack', target: t.id }); });
  for (let k = 0; k < 30; k++) {
    await pg.waitForTimeout(70);
    const st = await E(() => { const B = window.__battle; const u = B.units.find((x) => x.key === 'hakon'); return u && u.act ? u.act.kind + ':' + u.act.t.toFixed(2) : (u ? 'g' + Math.round(u.gauge) : 'none'); });
    if (st.startsWith('attack')) await shot('hswing_' + k);
  }
  console.log('ERR', errs.filter((e) => !/TUNNEL/.test(e))); await b.close();
})();
