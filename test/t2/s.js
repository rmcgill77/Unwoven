const { boot } = require('./common');
(async () => {
  const { b, pg } = await boot({ viewport: { width: 1300, height: 900 }, dsf: 1 });
  await pg.waitForTimeout(1500);
  const info = await pg.evaluate(() => {
    const A = window.__durinn.art, G = window.__durinn.G(), out = [];
    const rows = [['wren', G.look, 'oldsword'], ['wren', { ...G.look, chibi: undefined, body: 'f' }, 'oldsword'], ['tessa', {}, null], ['wren', G.look, null]];
    const c = document.createElement('canvas'); c.width = 1300; c.height = 900; c.style.cssText = 'position:fixed;left:0;top:0;z-index:9999;background:#333'; document.body.appendChild(c);
    const x = c.getContext('2d'); x.imageSmoothingEnabled = false; let y = 0;
    for (const [k, look, w] of rows) { const s = A.battleFor(k, look, w); if (!s) { out.push(k + ' none'); continue; } out.push(k + ' ' + s.fw + 'x' + s.fh + ' atk' + s.anims.attack.length + ' keys ' + Object.keys(s.anims).join(',')); s.anims.attack.forEach((f, i) => x.drawImage(f, i * 128, y, s.fw * 128 / 96 * 1, s.fh * 128 / 96)); y += 120; }
    return [out, JSON.stringify(G.look)];
  });
  console.log(info); await pg.screenshot({ path: 'shots2/atk.png' }); await b.close();
})();
