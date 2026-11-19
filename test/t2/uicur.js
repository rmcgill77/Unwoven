/* current-UI reference shots and clean backgrounds for the UI concept sheets -> concept/ui/ */
const { chromium } = require('playwright');
const { boot, jump, SAVE } = require('./common');
const O = 'concept/ui/';
(async () => {
  // title, before continuing
  { const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2 });
    await pg.addInitScript((s) => { localStorage.setItem('durinn.save.v1', JSON.stringify(s)); localStorage.setItem('durinn.settings.v2', JSON.stringify({ touch: 'on', music: 0 })); }, SAVE);
    await pg.goto('file://' + require('path').resolve(__dirname, '../../build/test.html')); await pg.waitForSelector('#dz-title-continue', { timeout: 30000 }).catch(() => {}); await pg.waitForTimeout(1500);
    await pg.screenshot({ path: O + 'cur_title.png' }); await b.close(); }
  const { b, pg } = await boot({});
  await pg.evaluate(() => { const s = JSON.parse(localStorage.getItem('durinn.settings.v2')); s.touch = 'on'; localStorage.setItem('durinn.settings.v2', JSON.stringify(s)); });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  await pg.evaluate(() => { window.__durinn.G().flags.__nowild = true; });
  const hide = await pg.addStyleTag({ content: '.dz-hint{opacity:0!important}' });
  const shot = async (name, clean) => {
    let st = null; if (clean) st = await pg.addStyleTag({ content: '.dz-root > *:not(.dz-canvas):not(canvas){visibility:hidden!important} .dz-battle > *:not(.dz-bstage){visibility:hidden!important}' });
    await pg.screenshot({ path: O + name + '.png' }); if (st) await st.evaluate((e) => e.remove());
  };
  await pg.evaluate(() => window.__durinn.eng.warp('ash', 17, 41, 'down', { dur: 0.1 })); await pg.waitForTimeout(1800);
  await shot('cur_town'); await shot('bg_town', true);
  await pg.evaluate(() => window.__durinn.eng.warp('eth21', 22, 30, 'down', { dur: 0.1 })); await pg.waitForTimeout(1800);
  await shot('bg_wild', true);
  await pg.evaluate(() => window.__durinn.run && window.__durinn.run('tessa')); await pg.waitForTimeout(900); await shot('cur_dialog');
  for (let i = 0; i < 8; i++) { await pg.keyboard.press('Escape'); await pg.mouse.click(450, 380); await pg.waitForTimeout(150); }
  await pg.evaluate(() => window.__durinn.fight(['crwolf', 'crwolf', 'crfrost'])); await pg.waitForTimeout(2500);
  if (await pg.$('#dz-btip-ok')) { await pg.click('#dz-btip-ok'); await pg.waitForTimeout(300); }
  await pg.waitForTimeout(2500); await shot('cur_battle'); await shot('bg_battle', true);
  await pg.click('#dz-menu').catch(() => {}); await pg.waitForTimeout(500); await shot('cur_menu');
  await b.close();
})();
