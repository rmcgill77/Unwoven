/* V93 mini-map and area map: drawn, follows the player, opens the area map with remembered ground, quest marks */
const { boot, jump } = require('./common');
(async () => {
  const { b, pg, errs } = await boot({});
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  const E = (f, a) => pg.evaluate(f, a);
  let ok = true; const check = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) ok = false; };
  await E(() => { const G = window.__durinn.G(); G.flags.act2_end = true; G.flags.capital_letter = 1; G.flags.__nowild = true; });
  await E(() => window.__durinn.eng.warp('eth22', 30, 40, 'down', { dur: 0.05 })); await pg.waitForTimeout(2500);
  check(await E(() => { const c = document.querySelector('#dz-minimap canvas'); return !!c && c.width > 100; }), 'mini-map drawn');
  await pg.keyboard.down('ArrowRight'); await pg.waitForTimeout(1500); await pg.keyboard.up('ArrowRight'); await pg.waitForTimeout(400);
  check(await E(() => { const s = window.__durinn.G().seen; return !!(s && s.eth22 && s.eth22.includes('1')); }), 'walked ground remembered');
  await pg.screenshot({ path: 'shots2/mm_corner.png' });
  await pg.click('#dz-minimap'); await pg.waitForTimeout(500);
  check(await E(() => !!document.querySelector('#dz-areamap canvas')), 'area map opens');
  await pg.screenshot({ path: 'shots2/mm_area.png' });
  await pg.click('#dz-areamap-close'); await pg.waitForTimeout(200);
  check(await E(() => !document.querySelector('#dz-areamap')), 'area map closes');
  check(await E(() => { const G = window.__durinn.G(); return G.flags.capital_letter === 1 && !G.flags.act3_end; }), 'looking ahead changed nothing');
  check(errs.filter((e) => !/TUNNEL|fonts/.test(e)).length === 0, 'no errors ' + errs.filter((e) => !/TUNNEL|fonts/.test(e)).slice(0, 3));
  console.log(ok ? 'ALL PASS' : 'SOME FAILED'); await b.close();
})();
