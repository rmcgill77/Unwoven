/* V93 title, pause menu, touch controls: shots and checks */
const { chromium } = require('playwright');
const { boot, jump, SAVE } = require('./common');
(async () => {
  let ok = true; const check = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) ok = false; };
  { const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2 });
    const sv = { ...SAVE, playMs: 3 * 3600000 + 25 * 60000, flags: { ...SAVE.flags, act2: true, act2_end: true }, partyIds: ['wren', 'tessa', 'hakon'], map: 'ver_lo' };
    await pg.addInitScript((s) => { localStorage.setItem('durinn.save.v1', JSON.stringify(s)); localStorage.setItem('durinn.settings.v2', JSON.stringify({ touch: 'on', music: 0 })); }, sv);
    await pg.goto('file://' + require('path').resolve(__dirname, '../../build/test.html')); await pg.waitForSelector('#dz-title-continue', { timeout: 30000 }).catch(async () => { await pg.mouse.click(400, 200); await pg.waitForSelector('#dz-title-continue'); });
    await pg.waitForTimeout(2500);
    check(await pg.evaluate(() => /3h 25m played/.test(document.querySelector('.nt-slot').textContent)), 'save slot shows play time');
    await pg.screenshot({ path: 'shots2/ui93_title.png' }); await b.close(); }
  const { b, pg, errs } = await boot({});
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  await pg.click('#dz-menu'); await pg.waitForTimeout(400); await pg.click('#dz-tab-settings'); await pg.waitForTimeout(300);
  check(!!(await pg.$('.dz-panel.pm .dz-prail')), 'menu rail');
  await pg.click('#dz-ctlsize-XL'); await pg.click('#dz-lefty-on'); await pg.click('#dz-touch-on'); await pg.waitForTimeout(200);
  await pg.screenshot({ path: 'shots2/ui93_menu.png' });
  await pg.click('#dz-close'); await pg.waitForTimeout(400);
  const pos = await pg.evaluate(() => { const a = document.querySelector('.dz-btn-a').getBoundingClientRect(); return [a.left, a.width]; });
  check(pos[0] < 200 && pos[1] > 95, 'left-handed and XL: A on the left, bigger ' + pos);
  await pg.screenshot({ path: 'shots2/ui93_lefty.png' });
  await pg.click('#dz-menu'); await pg.waitForTimeout(300); await pg.click('#dz-rail-map'); await pg.waitForTimeout(500);
  check(!!(await pg.$('#dz-areamap')), 'Map in the rail opens the area map');
  check(errs.filter((e) => !/TUNNEL|fonts/.test(e)).length === 0, 'no errors ' + errs.filter((e) => !/TUNNEL|fonts/.test(e)).slice(0, 3));
  console.log(ok ? 'ALL PASS' : 'SOME FAILED'); await b.close();
})();
