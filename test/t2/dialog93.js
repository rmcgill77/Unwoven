/* V93 dialogue box: portrait, name plate, tab choices, hold to fast-forward, auto mode, log */
const { boot, jump } = require('./common');
(async () => {
  const { b, pg, errs } = await boot({});
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  const E = (f, a) => pg.evaluate(f, a);
  let ok = true; const check = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) ok = false; };
  await E(() => window.__durinn.eng.warp('eth21', 22, 30, 'down', { dur: 0.05 })); await pg.waitForTimeout(2200);
  await E(() => { const G = window.__durinn.G(); G.flags.capital_letter = 1; window.__durinn.run('trig_capgate'); });
  await pg.waitForTimeout(400);
  check(await E(() => !!document.querySelector('.dz-dialog.nd')), 'new dialogue box');
  await pg.screenshot({ path: 'shots2/dlg93_line.png' });
  // hold to fast-forward through the two narrator lines to the choice
  const box = await pg.$('.dz-dialog'); const bb = await box.boundingBox();
  await pg.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await pg.mouse.down(); await pg.waitForTimeout(2600); await pg.mouse.up();
  check(await E(() => !!document.querySelector('#dz-choice-0')), 'holding skips to the choice');
  await pg.screenshot({ path: 'shots2/dlg93_choice.png' });
  await pg.click('#dz-dlg-log'); await pg.waitForTimeout(300);
  check(await E(() => (document.querySelector('#dz-dlglog') || {}).textContent.includes('Capital Gate')), 'log keeps the lines');
  await pg.screenshot({ path: 'shots2/dlg93_log.png' });
  await pg.click('#dz-dlglog-close');
  await pg.click('#dz-choice-1', { delay: 50 }); await pg.waitForTimeout(500);
  // auto mode advances on its own
  await pg.click('#dz-dlg-auto').catch(() => {});
  await E(() => window.__durinn.run('trig_capgate')); await pg.waitForTimeout(300);
  await pg.click('#dz-dlg-auto'); 
  const t0 = await E(() => document.querySelector('.dz-text').textContent); await pg.waitForTimeout(9000);
  const t1 = await E(() => (document.querySelector('.dz-text') || {}).textContent || 'none');
  check(t0 !== t1, 'auto mode moves on');
  check(errs.filter((e) => !/TUNNEL|fonts/.test(e)).length === 0, 'no errors ' + errs.slice(0, 3));
  console.log(ok ? 'ALL PASS' : 'SOME FAILED'); await b.close();
})();
