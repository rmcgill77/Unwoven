const { boot } = require('./common');
(async () => {
  const { b, pg } = await boot(); await pg.waitForTimeout(1500);
  console.log(await pg.evaluate(() => {
    const A = window.__durinn.art, G = window.__durinn.G(), out = {};
    const bb = (c) => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let y0 = 1e9, y1 = -1; for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 20) { y0 = Math.min(y0, y); y1 = Math.max(y1, y); } return y1 - y0 + 1; };
    out.corin = bb(A.battleFor('wren', G.look, null).anims.idle[0]);
    out.tessa = bb(A.battleFor('tessa', {}, null).anims.idle[0]);
    out.elowyn = bb(A.battleFor('wren', { ...G.look, chibi: 'elowyn' }, null).anims.idle[0]);
    return JSON.stringify(out);
  }));
  await b.close();
})();
