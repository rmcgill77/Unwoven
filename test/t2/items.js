const { boot, jump } = require('./common');
(async () => {
  const { b, pg } = await boot({ viewport: { width: 915, height: 412 }, dsf: 1 });
  await jump(pg, 'a2_start');
  const r = await pg.evaluate(() => { const I = window.__durinn.act2.ITEMS; return Object.keys(I).map((k) => [k, I[k].name, I[k].cat || (I[k].gear ? 'gear:' + I[k].gear.slot : I[k].quest ? 'quest' : '')]); });
  console.log(JSON.stringify(r)); await b.close();
})();
