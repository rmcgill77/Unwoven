/* V93 notifications: items, coins and quest steps picked up outside fights raise stacked notes */
const { boot, jump } = require('./common');
(async () => {
  const { b, pg, errs } = await boot({});
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  const E = (f, a) => pg.evaluate(f, a);
  let ok = true; const check = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) ok = false; };
  await E(() => window.__durinn.eng.warp('eth21', 22, 30, 'down', { dur: 0.05 })); await pg.waitForTimeout(2500);
  await E(() => { const G = window.__durinn.G(); G.items.yarrow = (G.items.yarrow || 0) + 2; G.coins += 18; G.flags.q_moon = 1; });
  await pg.waitForTimeout(900);
  const t = await E(() => [...document.querySelectorAll('.dz-note')].map((n) => n.dataset.k + ':' + n.textContent));
  console.log(t);
  check(t.some((x) => /^i:\+2 Yarrow/.test(x)), 'item note');
  check(t.some((x) => /coppers/.test(x)), 'coin note');
  check(t.some((x) => /^q:◆New quest/.test(x)), 'quest note');
  await pg.screenshot({ path: 'shots2/notes.png' });
  await E(() => window.__durinn.toast('Game saved')); await pg.waitForTimeout(300);
  check(await E(() => /Game saved/.test(document.querySelector('.dz-notes').textContent)), 'old toasts use the same stack');
  check(errs.filter((e) => !/TUNNEL|fonts/.test(e)).length === 0, 'no errors ' + errs.slice(0, 3));
  console.log(ok ? 'ALL PASS' : 'SOME FAILED'); await b.close();
})();
