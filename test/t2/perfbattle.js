const { boot, jump } = require('./common');
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 2 });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  const E = (fn, a) => pg.evaluate(fn, a);
  await E(() => { window.__durinn.G().flags.__nowild = true; });
  const cdp = await pg.context().newCDPSession(pg); await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 200 });
  const res = {};
  for (const [m, x, y, foes] of [['plainsSW', 30, 30, ['wolf', 'wolf', 'hound']], ['fort', 75, 60, ['sp_recruit', 'sp_corporal']], ['os', 50, 50, ['wolf', 'alpha']]]) {
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    await E(([m, x, y]) => window.__durinn.eng.warp(m, x, y, 'down', { dur: 0.1 }), [m, x, y]); await pg.waitForTimeout(1500);
    await E((f) => window.__durinn.fight(f), foes); await pg.waitForTimeout(3000);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: +(process.env.THR || 6) }); await pg.waitForTimeout(300);
    await cdp.send('Profiler.start');
    const t = (await E(() => new Promise((res) => { const t = []; let last = performance.now(); const f = (n) => { t.push(n - last); last = n; if (t.length < 150) requestAnimationFrame(f); else res(t); }; requestAnimationFrame(f); }))).sort((a, b) => a - b);
    const { profile } = await cdp.send('Profiler.stop');
    res[m] = { fps: +(1000 / (t.reduce((a, b) => a + b) / t.length)).toFixed(1), p90: +t[Math.floor(t.length * 0.9)].toFixed(1) };
    const self = {}, byId = {}; for (const n of profile.nodes) byId[n.id] = n; const cnt = {};
    profile.samples.forEach((s, i) => { cnt[s] = (cnt[s] || 0) + (profile.timeDeltas[i] || 0); });
    for (const [id, us] of Object.entries(cnt)) { const n = byId[id], k = `${n.callFrame.functionName || '(anon)'}:${n.callFrame.columnNumber}`; self[k] = (self[k] || 0) + us; }
    const tot = Object.values(self).reduce((a, b) => a + b, 0);
    console.log(m, JSON.stringify(res[m]), Object.entries(self).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => (v / tot * 100).toFixed(0) + '% ' + k).join(' | '));
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    await pg.screenshot({ path: `shots2/perf_battle_${m}.png` });
    await pg.reload(); await pg.waitForSelector('#dz-title-continue'); await pg.click('#dz-title-continue'); await pg.waitForTimeout(1500); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
    await E(() => { window.__durinn.G().flags.__nowild = true; });
  }
  console.log('errors', errs.filter((e) => !e.includes('ERR_TUNNEL')).slice(0, 3));
  await b.close();
})();
