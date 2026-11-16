const { boot, jump } = require('./common');
const fs = require('fs');
/* frame timing and a CPU profile while walking through busy places */
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 2 });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  const E = (fn, a) => pg.evaluate(fn, a);
  await E((s) => { window.__perfSkip = JSON.parse(s); }, process.env.SKIP || '{}');
  if (process.env.NIGHT) await E(() => { window.__durinn.G().time = 23 * 60; });
  await E(() => { const G = window.__durinn.G(); Object.assign(G.flags, { __nowild: true, reached_fort: true, reached_ash: true, reached_gw: true }); });
  const cdp = await pg.context().newCDPSession(pg);
  await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 200 });
  const out = {};
  const places = (process.argv[2] || 'plainsSW:30,30;ash:30,30;fort:75,60;gw:30,30;os:50,50;oak:24,22').split(';').map((s) => { const [m, xy] = s.split(':'); const [x, y] = xy.split(',').map(Number); return [m, x, y]; });
  const THR = +(process.env.THR || 6);
  for (const [m, x, y] of places) {
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    await E(([m, x, y]) => window.__durinn.eng.warp(m, x, y, 'down', { dur: 0.1 }), [m, x, y]); await pg.waitForTimeout(2500);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: THR }); await pg.waitForTimeout(300);
    await cdp.send('Profiler.start').catch(() => {});
    const fr = E(() => new Promise((res) => { const t = []; let last = performance.now(); const f = (n) => { t.push(n - last); last = n; if (t.length < 150) requestAnimationFrame(f); else res(t); }; requestAnimationFrame(f); }));
    for (const k of ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp']) { await pg.keyboard.down(k); await pg.waitForTimeout(500); await pg.keyboard.up(k); }
    const t = (await fr).sort((a, b) => a - b);
    const pr = (await cdp.send('Profiler.stop')).profile; (global.PROFS = global.PROFS || []).push(pr);
    out[m] = { median: +t[t.length >> 1].toFixed(1), p90: +t[Math.floor(t.length * 0.9)].toFixed(1), fps: +(1000 / (t.reduce((a, b) => a + b) / t.length)).toFixed(1) };
  }
  const profile = global.PROFS.reduce((a, p) => { if (!a) return p; const off = Math.max(...a.nodes.map((n) => n.id)); for (const n of p.nodes) { n.id += off; if (n.children) n.children = n.children.map((c) => c + off); } a.nodes.push(...p.nodes); a.samples.push(...p.samples.map((x) => x + off)); a.timeDeltas.push(...p.timeDeltas); return a; }, null);
  fs.writeFileSync('/tmp/claude-0/-home-claude/81f7a483-afca-5415-8c60-809b5595b3f8/scratchpad/prof.cpuprofile', JSON.stringify(profile));
  // self time by function
  const self = {}, byId = {}; for (const n of profile.nodes) byId[n.id] = n;
  const dt = profile.timeDeltas; const cnt = {};
  profile.samples.forEach((s, i) => { cnt[s] = (cnt[s] || 0) + (dt[i] || 0); });
  for (const [id, us] of Object.entries(cnt)) { const n = byId[id], k = `${n.callFrame.functionName || '(anon)'}:${n.callFrame.lineNumber}:${n.callFrame.columnNumber}`; self[k] = (self[k] || 0) + us; }
  const tot = Object.values(self).reduce((a, b) => a + b, 0);
  console.log(JSON.stringify(out));
  console.log(Object.entries(self).sort((a, b) => b[1] - a[1]).slice(0, 30).map(([k, v]) => (v / tot * 100).toFixed(1) + '% ' + k).join('\n'));
  console.log('errors', errs.filter((e) => !e.includes('ERR_TUNNEL')).slice(0, 3));
  await b.close();
})();
