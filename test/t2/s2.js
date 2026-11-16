const { boot } = require('./common');
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 1300, height: 560 }, dsf: 1 });
  await pg.waitForTimeout(1500);
  await pg.evaluate(() => {
    const A = window.__durinn.art, G = window.__durinn.G();
    const c = document.createElement('canvas'); c.width = 1300; c.height = 560; c.style.cssText = 'position:fixed;left:0;top:0;z-index:9999;background:#3a3a44'; document.body.appendChild(c);
    const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
    const tmp = document.createElement('canvas'); tmp.width = 96; tmp.height = 84; const tx = tmp.getContext('2d');
    [['wren', G.look], ['tessa', {}]].forEach(([k, look], r) => { const s = A.battleFor(k, look, null);
      for (let n = 0; n < 20; n++) { const f = n / 2 + 0.01; tx.clearRect(0, 0, 96, 84); tx.drawImage(s.anims.attack[Math.min(9, Math.floor(f))], 0, 0); const p = A.swingPose(f); A.drawSwordOn(tx, p[0], p[1], p[2]); x.drawImage(tmp, 20, 10, 70, 74, (n % 10) * 128, r * 280 + Math.floor(n / 10) * 136, 140, 148); } });
  });
  await pg.screenshot({ path: 'shots2/atk2.png' }); console.log(errs.filter((e) => !/TUNNEL/.test(e))); await b.close();
})();
