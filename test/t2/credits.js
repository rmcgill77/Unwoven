const { boot, jump } = require('./common');
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 2 });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  await pg.evaluate(() => window.__durinn.run('look_gate'));
  await pg.evaluate(() => { const G = window.__durinn.G(); G.flags.q_south = 1; });
  for (let i = 0; i < 8; i++) { if (!(await pg.$('.dz-dialog'))) break; await pg.keyboard.press('e'); await pg.waitForTimeout(200); }
  await pg.evaluate(() => { const e = window.__durinn.eng; e.warp('ash', 26, 63, 'down', { dur: 0.1 }); }); await pg.waitForTimeout(1200);
  await pg.evaluate(() => { const e = window.__durinn.eng; e.placePlayer(26 * 16 + 8, 64 * 16 + 8); e.debugState().player.dir = 'down'; }); await pg.keyboard.press('e');
  for (let i = 0; i < 30; i++) { await pg.waitForTimeout(250); if (await pg.$('#dz-choice-0')) { await pg.waitForTimeout(400); await pg.click('#dz-choice-0'); continue; } if (await pg.$('.dz-dialog')) await pg.keyboard.press('e'); else if (await pg.$('#dz-credits-done')) break; }
  await pg.waitForTimeout(16000); await pg.screenshot({ path: "shots2/credits2.png" }); console.log("thanks", !!(await pg.$("#dz-credits-thanks")), !!(await pg.$("#dz-credits-role")));
  await pg.evaluate(() => { const d = document.querySelector('[aria-label="Act credits"]'); if (d) d.scrollTop = 9999; }); await pg.waitForTimeout(500); await pg.screenshot({ path: 'shots2/credits2b.png' });
  console.log('ERR', errs.filter((e) => !/TUNNEL/.test(e))); await b.close();
})();
