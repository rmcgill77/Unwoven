const { boot, jump } = require('./common');
(async () => {
  const { b, pg } = await boot({ viewport: { width: 915, height: 412 }, dsf: 1 });
  await jump(pg, 'a2_start');
  const r = await pg.evaluate(() => { const D = window.__durinn, N = D.data().NPC_DEFS, G = D.G(), out = []; for (const k in N) { const lk = D.art.npcLookFor(k, G) || {}; const where = (N[k].schedule || []).map((s) => s.map).filter(Boolean)[0] || ''; out.push([k, lk.chibi || '-', N[k].name, where]); } return out; });
  console.log(JSON.stringify(r)); await b.close();
})();
