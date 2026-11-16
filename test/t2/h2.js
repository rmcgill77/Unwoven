const { boot } = require('./common');
(async () => {
  const { b, pg } = await boot();
  console.log(await pg.evaluate(() => {
    const cb = window.__durinn.act2.createBattle;
    const B = cb({ party: [{ key: 'wren', lv: 7, hp: 999, mp: 99 }], foes: ['wolf'], items: { poultice: 2, btonic: 1, torchoil: 1 }, words: { r: [], s: [] }, rng: () => 0.5, act2: true });
    const u = B.allies()[0]; B.foes()[0].gauge = -9999; B.foes()[0].spd = 0;
    const run = (cmd) => { u.gauge = 100; const ok = B.command(u.id, cmd); for (let i = 0; i < 90; i++) B.step(1 / 60); return ok; };
    u.hp = 10; u.mp = 2; const o = [];
    o.push(run({ type: 'item', item: 'poultice', target: u.id }) + ' hp=' + u.hp);
    o.push(run({ type: 'item', item: 'btonic', target: u.id }) + ' mp=' + u.mp);
    o.push(run({ type: 'item', item: 'torchoil', target: u.id }) + ' infuse=' + JSON.stringify(u.infuse));
    return o.join(' | ');
  }));
  await b.close();
})();
