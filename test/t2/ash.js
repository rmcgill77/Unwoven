const { boot, jump } = require('./common');
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 2 });
  await pg.addStyleTag({ content: '.dz-hint{opacity:0!important}' });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  await pg.evaluate(() => { window.__durinn.G().flags.left_oak = true; window.__durinn.G().flags.__nowild = true; });
  const warp = async (m, x, y, d, wait = 1500) => { await pg.evaluate(([m, x, y, d]) => window.__durinn.eng.warp(m, x, y, d, { dur: 0.2 }), [m, x, y, d]); await pg.waitForTimeout(wait); };
  const shot = (n) => pg.screenshot({ path: `shots2/ash_${n}.png` });
  // walk in through the plains gate
  await warp('plainsSW', 58, 28, 'down');
  await pg.keyboard.down('ArrowDown'); await pg.waitForTimeout(700); await pg.keyboard.up('ArrowDown'); await pg.waitForTimeout(2500);
  console.log('map', await pg.evaluate(() => window.__durinn.eng.mapId()));
  await shot('01_gate');
  if (process.argv[3] === 'night') { await warp('ash', 26, 27, 'up'); await pg.evaluate(() => window.__durinn.pillar()); await pg.waitForTimeout(300); await pg.click('#dz-pillar-swap'); await pg.waitForTimeout(3000); }
  const spots = (process.argv[2] || 'square,outpost,thistle,chapel,market,cooper,homes,mill,fields').split(',');
  const at = { square: [26, 29, 'up'], outpost: [26, 13, 'up'], thistle: [42, 25, 'up'], chapel: [10, 25, 'up'], market: [18, 42, 'up'], smith: [36, 42, 'up'], cooper: [48, 42, 'up'], homes: [10, 51, 'up'], mill: [36, 52, 'up'], fields: [27, 60, 'down'], east: [50, 33, 'right'] };
  for (const n of spots) { const [x, y, d] = at[n]; await warp('ash', x, y, d); await shot(n + (process.argv[3] || '')); }
  console.log(errs); await b.close();
})();
