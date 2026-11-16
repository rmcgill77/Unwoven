const { boot, jump } = require('./common');
const shot = (pg, n) => pg.screenshot({ path: `shots2/${n}.png` });
(async () => {
  const { b, pg, errs } = await boot();
  await pg.evaluate(() => { const s = JSON.parse(localStorage.getItem('durinn.settings.v2')); });
  const dbgOff = async () => { await pg.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /debug/i.test(x.textContent)); }); };
  const warp = async (m, x, y, d) => { await pg.evaluate(([m, x, y, d]) => window.__durinn.eng.warp(m, x, y, d, { dur: 0.2 }), [m, x, y, d]); await pg.waitForTimeout(900); };
  const A = async () => { await pg.keyboard.press('e'); await pg.waitForTimeout(350); };
  // chest
  await warp('store_back', 9, 6, 'up'); await shot(pg, 'b1_chest_shut');
  await A(); await pg.waitForTimeout(150); await shot(pg, 'b2_chest_opening');
  for (let i = 0; i < 4; i++) await A();
  await shot(pg, 'b3_chest_open');
  console.log('chest flag', await pg.evaluate(() => window.__durinn.G().flags.chest_c_stock), 'items', JSON.stringify(await pg.evaluate(() => window.__durinn.G().items)));
  await warp('store', 6, 6, 'up'); await warp('store_back', 8, 6, 'right'); await shot(pg, 'b4_chest_reenter');
  // herb
  await pg.evaluate(() => { window.__durinn.G().flags.__nowild = true; });
  await warp('wood', 22, 39, 'up'); await shot(pg, 'b5_herb_before');
  await A(); await A(); await A(); await shot(pg, 'b6_herb_after');
  console.log('picked', JSON.stringify(await pg.evaluate(() => window.__durinn.G().picked)), 'yarrow', await pg.evaluate(() => window.__durinn.G().items.yarrow));
  await A(); await pg.waitForTimeout(200); console.log('target after pick', JSON.stringify(await pg.evaluate(() => window.__durinn.eng.interact())));
  console.log('regrow rolls', await pg.evaluate(() => { const G = window.__durinn.G(), a = window.__durinn.act2; const out = []; out.push(a.regrowRoll(G, () => 0.9)); out.push(JSON.stringify(G.picked)); out.push(a.regrowRoll(G, () => 0.1)); out.push(JSON.stringify(G.picked) + JSON.stringify(G.regrew)); return out.join(' | '); }));
  await pg.waitForTimeout(300); await shot(pg, 'b7_herb_regrown');
  // shop economy at Pike's
  console.log('econ', await pg.evaluate(() => { const G = window.__durinn.G(), a = window.__durinn.act2; G.items.pelt = 12; G.items.yarrow = 3; G.coins = 40; const out = []; for (let i = 0; i < 12; i++) { const q = a.sellOne(G, 'pike', 'pelt'); out.push(q ? q.price : 'x'); } out.push('purse ' + G.purse.pike, 'coins ' + G.coins, 'left ' + (G.items.pelt || 0)); a.econRecover(G, 'rest'); out.push('rest purse ' + G.purse.pike + ' sold ' + G.sold.pelt); a.econRecover(G, 'day'); out.push('day purse ' + G.purse.pike + ' sold ' + G.sold.pelt); return out.join(','); }));
  await pg.evaluate(() => { const G = window.__durinn.G(); G.items.pelt = 9; G.items.fang = 4; G.items.token = 2; G.sold = { pelt: 7 }; G.purse.pike = 23; window.__durinn.shop('pike'); });
  await pg.waitForTimeout(400); await shot(pg, 'b8_shop');
  console.log('errors', errs.filter((e) => !/ERR_TUNNEL/.test(e)));
  await b.close();
})();
