const { boot, jump } = require('./common');
/* The end of Act Three: a road clash joined and won (quiet until the next rest), the far tome's record, the Capital Gate,
   the end-of-act card; and the new curse creatures in a fight. */
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 2 });
  await pg.addStyleTag({ content: '.dz-hint{opacity:0!important}' });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  const E = (fn, a) => pg.evaluate(fn, a);
  await E(() => { const G = window.__durinn.G(); G.flags.__nowild = true; G.flags.act2_end = true; G.time = 10 * 60; });
  const where = () => E(() => window.__durinn.eng.mapId() + ' ' + JSON.stringify(window.__durinn.eng.playerTile()));
  const text = () => E(() => { const q = document.querySelector('.dz-dialog .dz-text'); return q ? q.textContent : ''; });
  const clear = async (n = 30) => { const seen = []; for (let i = 0; i < n; i++) { if (!(await pg.$('.dz-dialog'))) break; seen.push(await text()); if (await pg.$('.dz-choice')) { await pg.click('.dz-choice'); } else await pg.keyboard.press('e'); await pg.waitForTimeout(350); } return seen; };
  const walk = async (key, ms) => { await pg.keyboard.down(key); await pg.waitForTimeout(ms); await pg.keyboard.up(key); await pg.waitForTimeout(800); };
  const warp = async (m, x, y, d) => { await E(([m, x, y, d]) => window.__durinn.eng.warp(m, x, y, d, { dur: 0.05 }), [m, x, y, d]); await pg.waitForTimeout(1600); return clear(); };
  const F = (k) => E((k) => window.__durinn.G().flags[k], k);
  const winFight = async (shot) => {
    for (let i = 0; i < 40; i++) { await pg.waitForTimeout(250); if (await E(() => !!window.__battle && window.__battle.phase === 'fight')) break; }
    await pg.waitForTimeout(600); if (await pg.$('#dz-btip-ok')) await pg.click('#dz-btip-ok'); await pg.waitForTimeout(1200);
    if (shot) await pg.screenshot({ path: `shots2/${shot}.png` });
    const foes = await E(() => window.__battle ? window.__battle.units.filter((u) => u.side === 'e').map((u) => u.name).join(',') : 'none');
    await E(() => { for (const u of window.__battle.units) { if (u.side === 'e') { u.hp = 0; u.ko = true; } else { u.gauge = 0; u.queued = null; } } window.__battle.queue = []; });
    for (let i = 0; i < 40; i++) { await pg.waitForTimeout(250); if (await pg.$('#dz-battle-done')) break; }
    await pg.click('#dz-battle-done'); await E(() => { window.__battle = null; }); await pg.waitForTimeout(1800); return foes;
  };
  let ok = true; const check = (c, msg) => { console.log((c ? 'PASS ' : 'FAIL ') + msg); if (!c) ok = false; };

  const cls = await E(() => { const D = window.__durinn.data().MAP_DEFS, out = []; for (const id in D) for (const t of D[id].triggers || []) if (/^clash/.test(t.id)) out.push({ map: id, x: t.x + D[id].ox, y: t.y + D[id].oy, ox: D[id].ox, oy: D[id].oy, id: t.id }); return out.sort((a, b) => a.id.localeCompare(b.id)); });
  check(cls.length === 6, 'six road clashes: ' + cls.map((c) => c.map).join(','));
  const c0 = cls[0], lx = c0.x - c0.ox, ly = c0.y - c0.oy;
  await warp(c0.map, lx - 8, ly, 'right'); await pg.waitForTimeout(400); await pg.screenshot({ path: 'shots2/a3_clash_before.png' });
  await walk('ArrowRight', 900); let said = await clear(14);
  check(/Hold the line/.test(said.join(' ')), 'walking up to the clash plays it');
  let foes = await winFight('a3_clash_fight'); check(/Purifier/.test(foes), 'the party fights the Purifiers: ' + foes);
  said = await clear(); check(/fought for us/.test(said.join(' ')) && (await F('clash0')) === ((await F('__rests')) | 0), 'won: soldiers thank you, the road goes quiet');
  await warp(c0.map, lx - 8, ly, 'right'); await walk('ArrowRight', 900); said = await clear(6);
  check(!said.length, 'no second clash until a rest');
  await E(() => { const G = window.__durinn.G(); window.__durinn.act2.pillarRest(G, 'eth_gate', false); });
  check(await F('__rests') >= 1 && !(await E(() => { const f = window.__durinn.G().flags; return f.clash0 === (f.__rests | 0); })), 'after a rest the clash flares up again');
  // the curse creatures
  await E(() => window.__durinn.fight(['cbear', 'cseer', 'chorn'])); foes = await winFight('a3_curse_fight'); check(/Skullmaw/.test(foes), 'curse creatures fight: ' + foes);
  await E(() => window.__durinn.fight(['cooze', 'cspike', 'cgrub'])); foes = await winFight('a3_curse_fight2'); check(/Ooze/.test(foes), 'more curse creatures: ' + foes);
  // the far tome's record
  await E(() => { const G = window.__durinn.G(); const k = G.look.sex === 'f' ? 'corin' : 'elowyn'; if (!G.partyIds.includes(k)) { G.partyIds.push(k); G.party[k] = { lv: G.party.wren.lv, xp: 0, hp: 90, mp: 12 }; } G.flags.comp_joined = true; G.flags.q_comp = 2; G.flags.capital_letter = true; G.flags.q_auseal = 3; });
  await E(() => window.__durinn.run('marrow')); await pg.waitForTimeout(500); said = await clear();
  check(/Great Sanctum/.test(said.join(' ')) && (await F('q_comp')) === 3, 'the far tome went to the Great Sanctum');
  // the Capital Gate and the card
  await warp('eth30', 67, 15, 'up'); await pg.screenshot({ path: 'shots2/a3_gate.png' });
  await walk('ArrowUp', 900); said = await clear(30);
  check(/Capital Gate/.test(said.join(' ')), 'the gate scene plays: ' + said.slice(0, 1));
  await pg.waitForTimeout(1500);
  const card = await E(() => document.body.innerText.includes('END OF ACT THREE'));
  check(card && (await F('act3_end')), 'the end of Act Three card');
  await pg.waitForTimeout(16000); await pg.screenshot({ path: 'shots2/a3_card.png' });
  const credits = await E(() => document.body.innerText);
  check(/Tiny Monsters/.test(credits) && /cave horizontal/.test(credits) && /end of Act Three/.test(credits), 'credits name the Act 3 packs and the tester role');
  if (await pg.$('#dz-credits-done')) await pg.click('#dz-credits-done'); await pg.waitForTimeout(1000);
  await warp('eth30', 67, 9, 'up'); await walk('ArrowUp', 900); said = await clear(4);
  check(/Act Four opens/.test(said.join(' ')), 'after the act, the road beyond waits for Act Four');
  const errors = errs.filter((e) => !/TUNNEL|fonts/.test(e));
  check(!errors.length, 'no errors ' + errors.slice(0, 3).join(' | '));
  console.log(ok ? 'ALL PASS' : 'SOME FAILED'); await b.close();
})();
