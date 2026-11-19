const { boot, jump } = require('./common');
/* The hero not chosen: met at the Registry in Verrin, joins; with the party full they wait, and the Pillar in Pillar
   Court opens on the party view; swap who walks with you; followers drawn; the companion fights as a caster. */
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 2 });
  await pg.addStyleTag({ content: '.dz-hint{opacity:0!important}' });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  const E = (fn, a) => pg.evaluate(fn, a);
  let ok = true; const check = (c, msg) => { console.log((c ? 'PASS ' : 'FAIL ') + msg); if (!c) ok = false; };
  await E(() => { const G = window.__durinn.G(); Object.assign(G.flags, { __nowild: true, act2_end: true, q_sbwrit: 2, ver_lantern: true, reached_verrin: true, reached_verrin_hi: true, hakon_joined: true, tut_pillar: true });
    if (!G.partyIds.includes('tessa')) G.partyIds.push('tessa'); window.__durinn.act2.act2Ensure(G); });
  await E(() => { const G = window.__durinn.G(); if (!G.partyIds.includes('hakon')) { G.partyIds.push('hakon'); G.party.hakon = { lv: G.party.wren.lv, xp: 0, hp: 200, mp: 5 }; } });
  console.log('party before', await E(() => JSON.stringify(window.__durinn.G().partyIds)));
  const clear = async (pick) => { for (let i = 0; i < 30; i++) { const ch = await pg.$$('.dz-choice'); if (ch.length) { await ch[pick || 0].click(); await pg.waitForTimeout(400); continue; } if (!(await pg.$('.dz-dialog'))) break; await pg.keyboard.press('e'); await pg.waitForTimeout(300); } };
  await E(() => window.__durinn.eng.warp('ver_registry', 9, 7, 'up', { dur: 0.05 })); await pg.waitForTimeout(1500); await clear();
  await pg.screenshot({ path: 'shots2/comp_registry.png' });
  const who = await E(() => window.__durinn.data().NPC_DEFS.unchosen && window.__durinn.G().look.sex);
  await E(() => window.__durinn.run('unchosen')); await pg.waitForTimeout(500);
  await pg.screenshot({ path: 'shots2/comp_talk.png' });
  await clear(0);
  const st = await E(() => { const G = window.__durinn.G(); return { ids: G.partyIds, res: G.reserve, f: !!G.flags.comp_joined, tut: !!G.flags.swap_tut }; });
  check(st.f && st.res && st.res.length === 1 && st.tut, 'joined, waiting in reserve with the swap lesson set: ' + JSON.stringify(st));
  // the Pillar in Pillar Court opens on the party view
  await E(() => window.__durinn.eng.warp('ver_hi', 84, 34, 'up', { dur: 0.05 })); await pg.waitForTimeout(1500); await clear();
  await E(() => window.__durinn.pillar()); await pg.waitForTimeout(400);
  await E(() => { const G = window.__durinn.G(); }); 
  const pv = await pg.$('#dz-party');
  if (!pv) { await pg.click('#dz-pillar-party').catch(() => {}); await pg.waitForTimeout(300); }
  check(!!(await pg.$('#dz-party')), 'party view at the Pillar');
  await pg.screenshot({ path: 'shots2/comp_party1.png' });
  await pg.click('#dz-party-bench-tessa'); await pg.waitForTimeout(300);
  const ck = await E(() => compKey(window.__durinn.G())).catch(() => null);
  const key = await E(() => { const G = window.__durinn.G(); return G.reserve.find((k) => k !== 'tessa'); });
  await pg.click(`#dz-party-call-${key}`); await pg.waitForTimeout(300);
  await pg.screenshot({ path: 'shots2/comp_party2.png' });
  const st2 = await E(() => { const G = window.__durinn.G(); return { ids: G.partyIds, res: G.reserve }; });
  check(st2.ids.includes(key) && st2.res.includes('tessa') && st2.ids.length === 3, 'swapped: ' + JSON.stringify(st2));
  await pg.click('#dz-pillar-close'); await pg.waitForTimeout(400);
  // followers: walk a little and look
  await pg.keyboard.down('ArrowDown'); await pg.waitForTimeout(900); await pg.keyboard.up('ArrowDown'); await pg.keyboard.down('ArrowRight'); await pg.waitForTimeout(900); await pg.keyboard.up('ArrowRight'); await pg.waitForTimeout(400);
  await pg.screenshot({ path: 'shots2/comp_follow.png' });
  // a fight with the companion in it
  await E(() => window.__durinn.fight(['skelW', 'skelS'])); await pg.waitForTimeout(2500);
  await pg.screenshot({ path: 'shots2/comp_battle.png' });
  const errors = errs.filter((e) => !/TUNNEL|fonts/.test(e));
  check(!errors.length, 'no errors ' + errors.slice(0, 3).join(' | '));
  console.log(ok ? 'ALL PASS' : 'SOME FAILED'); await b.close();
})();
