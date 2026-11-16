const { boot } = require('./common');
(async () => {
  const { b, pg, errs } = await boot();
  console.log(await pg.evaluate(() => {
    const cb = window.__durinn.act2.createBattle, out = [];
    const mk = (act2, eq, mastery) => cb({ party: [{ key: 'wren', lv: 7, hp: 999, mp: 99, eq }], foes: ['wolf', 'hound'], items: { poultice: 2, firepot: 1, btonic: 1, torchoil: 1 }, words: { r: ['Sens', 'Pyr'], s: ['id', 'is', 'or'] }, rng: () => 0.5, act2, mastery, autoRelease: true });
    const run = (B, cmd, secs = 6) => { const u = B.allies()[0]; u.gauge = 100; const ok = B.command(u.id, cmd); for (let i = 0; i < secs * 60; i++) B.step(1 / 60); return ok; };
    let B = mk(true, {}); const f = B.foes();
    out.push('sens ' + run(B, { type: 'cast', spell: 'Sens-id', target: f[0].id }) + ' read=' + f[0].read + '/' + f[1].read);
    const hp0 = f.map((x) => x.hp); out.push('pot ' + run(B, { type: 'item', item: 'firepot', target: null }) + ' ' + hp0 + '->' + f.map((x) => x.hp));
    const u = B.allies()[0]; u.mp = 2; out.push('btonic ' + run(B, { type: 'item', item: 'btonic', target: u.id }, 1) + ' mp=' + u.mp);
    u.hp = 10; run(B, { type: 'item', item: 'poultice', target: u.id }, 1); out.push('poultice act2 hp=' + u.hp);
    B = mk(false, {}); B.allies()[0].hp = 10; run(B, { type: 'item', item: 'poultice', target: B.allies()[0].id }, 1); out.push('poultice act1 hp>=' + B.allies()[0].hp);
    const dmg = (eq, m) => { const B2 = mk(true, eq, m), t = B2.foes()[0]; t.hp = t.maxHp = 9999; run(B2, { type: 'cast', spell: 'Pyr-or', target: t.id }, 3); return 9999 - t.hp; };
    out.push('Pyr-or plain ' + dmg({}) + ' focus ' + dmg({ weapon: 'frostcrown' }) + ' focus+3 marks ' + dmg({ weapon: 'frostcrown' }, { Pyr: 3 }));
    const atk = () => { const B2 = mk(true, {}), t = B2.foes()[0]; t.hp = t.maxHp = 9999; run(B2, { type: 'attack', target: t.id }, 3); return 9999 - t.hp; };
    out.push('basic attack lv7 ' + atk());
    return out.join('\n');
  }));
  console.log(errs.filter((e) => !/ERR_TUNNEL/.test(e))); await b.close();
})();
