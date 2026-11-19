const { boot, jump } = require('./common');
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 1 });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  const E = (fn, a) => pg.evaluate(fn, a);
  await E(() => { const G = window.__durinn.G(); G.flags.__nowild = true; G.time = 10 * 60; });
  for (const [m, x, y, foes, n] of [['cr_mine2', 8, 14, ['skelmin', 'skelmin'], 'mine'], ['cr_shrine', 20, 20, ['stonewarden'], 'shrine'], ['au_culvert', 20, 7, ['rat', 'mslime'], 'culvert'], ['caveA', 12, 6, ['bat'], 'caveA']]) {
    await E(([m, x, y]) => window.__durinn.eng.warp(m, x, y, 'down', { dur: 0.05 }), [m, x, y]); await pg.waitForTimeout(1500);
    for (let i = 0; i < 20 && await pg.$('.dz-dialog'); i++) { await pg.keyboard.press('e'); await pg.waitForTimeout(250); }
    await E((f) => window.__durinn.fight(f), foes);
    for (let i = 0; i < 40; i++) { await pg.waitForTimeout(250); if (await E(() => !!window.__battle && window.__battle.phase === 'fight')) break; }
    await pg.waitForTimeout(800); if (await pg.$('#dz-btip-ok')) await pg.click('#dz-btip-ok'); await pg.waitForTimeout(800);
    await pg.screenshot({ path: `shots2/bg_${n}.png` });
    await E(() => { for (const u of window.__battle.units) { if (u.side === 'e') { u.hp = 0; u.ko = true; } } window.__battle.queue = []; });
    for (let i = 0; i < 40; i++) { await pg.waitForTimeout(250); if (await pg.$('#dz-battle-done')) break; }
    await pg.click('#dz-battle-done'); await E(() => { window.__battle = null; }); await pg.waitForTimeout(1500);
    for (let i = 0; i < 20 && await pg.$('.dz-dialog'); i++) { await pg.keyboard.press('e'); await pg.waitForTimeout(250); }
  }
  console.log(errs.filter((e) => !/TUNNEL|fonts/.test(e)).slice(0, 3).join(' | ') || 'no errors'); await b.close();
})();
