/* V93 battle screen: turn order, foe plates over heads, status icons, command tiles, victory card with loot */
const { boot, jump } = require('./common');
(async () => {
  const { b, pg, errs } = await boot({});
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  const E = (f, a) => pg.evaluate(f, a);
  let ok = true; const check = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) ok = false; };
  await E(() => { window.__battle = null; window.__durinn.fight(['crwolf', 'crwolf', 'crfrost']); }); await pg.waitForTimeout(1800);
  if (await pg.$('#dz-btip-ok')) { await pg.click('#dz-btip-ok'); }
  await pg.waitForTimeout(2600);
  check(await E(() => document.querySelectorAll('.dz-border .bo-chip').length >= 3), 'turn order strip');
  check(await E(() => [...document.querySelectorAll('.dz-btop.nb .dz-bfoe')].every((p) => parseInt(p.style.left) > 0)), 'plates sit over the foes');
  await E(() => { const B = window.__battle; const f = B.units.find((u) => u.side === 'e'); f.slowT = B.t + 30; f.markT = B.t + 30; });
  await pg.waitForTimeout(600);
  check(await E(() => document.querySelectorAll('.dz-btop .dz-bst b').length >= 2), 'status icons');
  await pg.screenshot({ path: 'shots2/b93_fight.png' });
  await E(() => { const B = window.__battle; for (const u of B.units) if (u.side === 'e') { u.hp = 1; } });
  for (let i = 0; i < 40; i++) { await pg.waitForTimeout(400); if (await pg.$('#dz-battle-done')) break; if (await pg.$('#dz-c-attack')) await pg.click('#dz-c-attack').catch(() => {}); const fo = await pg.$('.dz-bcv'); if (fo) { const bb = await fo.boundingBox(); await pg.mouse.click(bb.x + bb.width * 0.62, bb.y + bb.height * 0.62); } }
  check(!!(await pg.$('.bv')), 'victory card');
  await pg.screenshot({ path: 'shots2/b93_win.png' });
  check(errs.filter((e) => !/TUNNEL|fonts/.test(e)).length === 0, 'no errors ' + errs.filter((e) => !/TUNNEL|fonts/.test(e)).slice(0, 3));
  console.log(ok ? 'ALL PASS' : 'SOME FAILED'); await b.close();
})();
