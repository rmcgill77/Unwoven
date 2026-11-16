const { chromium } = require('playwright');
const SAVE = { v: 1, name: "Corin", trade: "clerk", pro: "he", look: { skin: 1, hair: 1, hairStyle: "short", cloth: 0, strap: true, mood: "neutral", chibi: "corin" },
  mentorName: "Odile", mayorName: "Moss", mayorGender: "m", map: "oak", x: 24 * 16 + 8, y: 21 * 16 + 12, dir: "down", day: 1, time: 540, coins: 40, items: {}, flags: { d1_intro: true, wardrobe_done: true, d1_job: true, d1_order: true, d1_delivered: true, d1_paid: true }, chatter: {}, tradeXP: 0, jobsToday: 0, jobsDay: 1, stats: { jobs: 0 } };
async function boot(opts = {}) {
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: opts.viewport || { width: 915, height: 412 }, deviceScaleFactor: opts.dsf || 2 });
  const errs = []; pg.on('pageerror', (e) => errs.push(String(e))); pg.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await pg.addInitScript((s) => { if (!localStorage.getItem('durinn.save.v1')) localStorage.setItem('durinn.save.v1', JSON.stringify(s)); localStorage.setItem('durinn.settings.v2', JSON.stringify({ debug: false, fps: false, touch: 'off', wait: true, music: 0 })); }, opts.save || SAVE);
  await pg.goto('file://' + require('path').resolve(__dirname, '../../build/test.html'));
  await pg.waitForSelector('#dz-title-continue', { timeout: 30000 }).catch(async () => { await pg.mouse.click(400, 200); await pg.waitForSelector('#dz-title-continue', { timeout: 30000 }); });
  await pg.click('#dz-title-continue'); await pg.waitForTimeout(900);
  return { b, pg, errs };
}
async function jump(pg, id) {
  await pg.click('#dz-menu'); await pg.waitForTimeout(200);
  if (await pg.$('#dz-tab-settings')) await pg.click('#dz-tab-settings');
  if (!(await pg.$('#dz-jump-' + id))) await pg.click('#dz-tools');
  await pg.click('#dz-jump-' + id); await pg.waitForTimeout(1400);
}
const D = (pg, fn, arg) => pg.evaluate(fn, arg);
module.exports = { boot, jump, D, SAVE };
