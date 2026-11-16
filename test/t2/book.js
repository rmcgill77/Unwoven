const { boot, jump } = require('./common');
/* the book and the Pack: open each page, check nothing spills out of its page box, screenshot */
(async () => {
  const vp = process.argv[2] === 'tall' ? { width: 412, height: 915 } : { width: 915, height: 412 };
  const tag = process.argv[2] === 'tall' ? '_p' : '';
  const { b, pg, errs } = await boot({ viewport: vp, dsf: 2 });
  await pg.addStyleTag({ content: '.dz-hint{opacity:0!important}' });
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  const E = (fn, a) => pg.evaluate(fn, a); const log = [];
  await E(() => {
    const G = window.__durinn.G();
    Object.assign(G.flags, { __nowild: true, q_flicker: 5, q_casks: 2, q_hakon: 1, q_moon: 1, q_debt: 3, reached_ash: true, reached_gw: true, reached_fort: true, ulric_met: true, q_maud: 2, q_keystone: 1 });
    Object.assign(G.items, { bandage: 4, poultice: 3, spoultice: 1, btonic: 2, torchoil: 2, ration: 5, pelt: 3, fang: 2, yarrow: 2, sap: 1, scrap: 2, dagger: 1, maudbundle: 1, keystone: 1, letter: 1, bread: 2, cutgem: 1, signet: 1 });
    G.found = { oak: 1, ash: 1, gw: 1, camp: 1, wforest: 1, os: 1 };
    G.beasts = { wolf: { kills: 6, read: true, n: 0 }, slimeG: { kills: 2, read: false, n: 1 }, bandit1: { kills: 1, read: true, n: 2 } };
    for (const k of Object.keys(G.beasts)) if (!window.__durinn.act2) delete G.beasts[k];
  });
  await E(() => window.__durinn.eng.warp('plainsNE', 40, 20, 'down', { dur: 0.1 })); await pg.waitForTimeout(1500);
  const check = () => E(() => {
    const out = [];
    for (const p of document.querySelectorAll('.bk-page[data-page]')) {
      const r = p.getBoundingClientRect();
      if (p.scrollHeight > p.clientHeight + 1 || p.scrollWidth > p.clientWidth + 1) out.push(`${p.id} scroll ${p.scrollWidth}x${p.scrollHeight} > ${p.clientWidth}x${p.clientHeight}`);
      for (const el of p.querySelectorAll('*')) { const q = el.getBoundingClientRect(); if (!q.width) continue; if (q.left < r.left - 1 || q.right > r.right + 1 || q.top < r.top - 1 || q.bottom > r.bottom + 1) { out.push(`${p.id}: ${el.tagName}.${el.className} "${(el.textContent || '').slice(0, 30)}" off the page`); break; } }
    }
    const book = document.querySelector('.bk-book'); if (book) { const r = book.getBoundingClientRect(); if (r.left < 0 || r.top < 0 || r.right > innerWidth || r.bottom > innerHeight) out.push('book off screen'); }
    for (const t of document.querySelectorAll('.bk-tab')) { const q = t.getBoundingClientRect(); if (q.right > innerWidth + 1 || q.bottom > innerHeight + 1) out.push(t.id + ' off screen'); }
    return out;
  });
  await pg.click('#dz-book'); await pg.waitForTimeout(700);
  for (const s of ['words', 'map', 'beasts', 'quests']) {
    if (await pg.$('#bk-tab-' + s)) { await pg.click('#bk-tab-' + s); await pg.waitForTimeout(800); }
    log.push(s + ': ' + JSON.stringify(await check()));
    await pg.screenshot({ path: `shots2/book_${s}${tag}.png` });
  }
  // turn a bestiary page, pick a word, a quest
  await pg.click('#bk-tab-beasts'); await pg.waitForTimeout(700); if (await pg.$('#bk-beast-next')) { await pg.click('#bk-beast-next'); await pg.waitForTimeout(200); await pg.screenshot({ path: `shots2/book_turn${tag}.png` }); await pg.waitForTimeout(600); await pg.screenshot({ path: `shots2/book_beasts2${tag}.png` }); log.push('beast2: ' + JSON.stringify(await check())); }
  await pg.click('#bk-tab-quests'); await pg.waitForTimeout(700); const qb = await pg.$$('[id^="bk-q-"]'); if (qb[1]) { await qb[1].click(); await pg.waitForTimeout(300); await pg.screenshot({ path: `shots2/book_quest2${tag}.png` }); log.push('quest2: ' + JSON.stringify(await check())); }
  if (await pg.$('#bk-tab-words')) { await pg.click('#bk-tab-words'); await pg.waitForTimeout(700); const w = await pg.$$('[id^="bk-word-"]'); if (w[0]) { await w[0].click(); await pg.waitForTimeout(200); } await pg.screenshot({ path: `shots2/book_word${tag}.png` }); log.push('word: ' + JSON.stringify(await check())); }
  await pg.click('#bk-close'); await pg.waitForTimeout(300); log.push('closed: ' + !(await pg.$('.bk-ov')));
  // the Pack
  await pg.click('#dz-pack'); await pg.waitForTimeout(600); await pg.click('#pk-item-bandage'); await pg.waitForTimeout(200);
  await pg.screenshot({ path: `shots2/pack${tag}.png` });
  log.push('pack fit: ' + await E(() => { const s = document.querySelector('#pk-stage').getBoundingClientRect(); return s.left >= 0 && s.top >= 0 && s.right <= innerWidth && s.bottom <= innerHeight; }));
  await pg.click('#pk-cat-gear'); await pg.waitForTimeout(200); await pg.screenshot({ path: `shots2/pack_gear${tag}.png` });
  await pg.click('#pk-gear'); await pg.waitForTimeout(400); await pg.screenshot({ path: `shots2/gear${tag}.png` });
  // a fight, read with Sens, lands in the bestiary
  console.log(log.join('\n')); console.log('errors', errs.slice(0, 5));
  await b.close();
})();
