const { boot } = require('./common');
/* developer tools are locked until the password; sound pauses when the page is hidden or loses focus */
(async () => {
  const { b, pg, errs } = await boot({ dev: false });
  const E = (fn, a) => pg.evaluate(fn, a); const log = [];
  await pg.click('#dz-menu'); await pg.waitForTimeout(200); if (await pg.$('#dz-tab-settings')) await pg.click('#dz-tab-settings'); await pg.waitForTimeout(200);
  log.push('locked: tools=' + !!(await pg.$('#dz-tools')) + ' pass=' + !!(await pg.$('#dz-dev-pass')) + ' art=' + !!(await pg.$('#dz-tab-art')));
  await pg.fill('#dz-dev-pass', 'wrong'); await pg.click('#dz-dev-go'); await pg.waitForTimeout(150);
  log.push('wrong: err=' + !!(await pg.$('#dz-dev-err')) + ' tools=' + !!(await pg.$('#dz-tools')));
  await pg.screenshot({ path: 'shots2/devlock.png' });
  await pg.fill('#dz-dev-pass', process.env.DEV_PW || ''); await pg.click('#dz-dev-go'); await pg.waitForTimeout(200);
  log.push('right: tools=' + !!(await pg.$('#dz-tools')) + ' art=' + !!(await pg.$('#dz-tab-art')) + ' stored=' + await E(() => localStorage.getItem('durinn.dev.v1')));
  await pg.reload(); await pg.waitForSelector('#dz-title-continue'); await pg.click('#dz-title-continue'); await pg.waitForTimeout(900);
  await pg.click('#dz-menu'); await pg.waitForTimeout(200); if (await pg.$('#dz-tab-settings')) await pg.click('#dz-tab-settings'); await pg.waitForTimeout(200);
  log.push('after reload: tools=' + !!(await pg.$('#dz-tools')));
  await pg.click('#dz-dev-lock'); await pg.waitForTimeout(150); log.push('relocked: pass=' + !!(await pg.$('#dz-dev-pass')));
  // sound: fake a playing element and check the away switch pauses it
  const snd = await E(async () => {
    const out = [];
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange'));
    out.push('hidden->away ' + audioAwayProbe());
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); window.dispatchEvent(new Event('focus'));
    out.push('focus->away ' + audioAwayProbe());
    window.dispatchEvent(new Event('blur')); out.push('blur->away ' + audioAwayProbe());
    window.dispatchEvent(new PointerEvent('pointerdown')); out.push('tap->away ' + audioAwayProbe());
    return out.join(', ');
    function audioAwayProbe() { return window.__durinn && window.__durinn.away ? window.__durinn.away() : 'n/a'; }
  });
  log.push('sound: ' + snd);
  console.log(log.join('\n')); console.log('errors', errs.slice(0, 5));
  await b.close();
})();
