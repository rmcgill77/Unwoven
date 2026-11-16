const { boot, jump } = require('./common');
(async () => {
  for (const [vp, tag, touch] of [[{ width: 915, height: 412 }, 'land', 'on'], [{ width: 412, height: 915 }, 'port', 'on'], [{ width: 915, height: 412 }, 'keys', 'off']]) {
    const { b, pg } = await boot({ viewport: vp, dsf: 2 });
    await pg.evaluate((t) => { const s = JSON.parse(localStorage.getItem('durinn.settings.v2')); s.touch = t; localStorage.setItem('durinn.settings.v2', JSON.stringify(s)); }, touch);
    await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
    await pg.reload(); await pg.waitForSelector('#dz-title-continue'); await pg.click('#dz-title-continue'); await pg.waitForTimeout(1500); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
    await pg.screenshot({ path: `shots2/bookbtn_${tag}.png` });
    const r = await pg.evaluate(() => [...document.querySelectorAll('.dz-btn')].map((e) => { const q = e.getBoundingClientRect(); return e.className.split(' ')[1] + ':' + [q.left, q.top, q.right, q.bottom].map(Math.round).join(','); }));
    console.log(tag, r.join(' | '));
    await pg.click('#dz-book'); await pg.waitForTimeout(600); console.log(tag, 'book open', !!(await pg.$('.bk-ov')));
    await b.close();
  }
})();
