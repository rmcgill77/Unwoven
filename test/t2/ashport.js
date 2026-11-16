const { boot, jump } = require('./common');
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 2 });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  await pg.evaluate(() => { const f = window.__durinn.G().flags; Object.assign(f, { left_oak: true, reached_ash: true, m_voidsong: true, q_flicker: 1, q_hakon: 1 }); });
  for (const id of ['voidsong', 'hakon', 'ashgate', 'ashpatrol']) { await pg.evaluate((id) => window.__durinn.run(id), id); await pg.waitForTimeout(700); await pg.screenshot({ path: `shots2/port_${id}.png` }); await pg.keyboard.press('Escape'); for (let i = 0; i < 12; i++) { if (!(await pg.$('.dz-dialog'))) break; if (await pg.$('#dz-choice-1')) { await pg.waitForTimeout(450); await pg.click('#dz-choice-1'); } else await pg.keyboard.press('e'); await pg.waitForTimeout(200); } }
  console.log(errs.filter((e) => !/TUNNEL/.test(e))); await b.close();
})();
