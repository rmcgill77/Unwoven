/* V93 Journal: quests grouped by act, done ones kept, notes gathered from the story so far */
const { boot, jump } = require('./common');
(async () => {
  const { b, pg, errs } = await boot({});
  await jump(pg, 'a2_start'); if (await pg.$('#dz-pillar-tut-ok')) await pg.click('#dz-pillar-tut-ok');
  const E = (f, a) => pg.evaluate(f, a);
  let ok = true; const check = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) ok = false; };
  await E(() => { const f = window.__durinn.G().flags; Object.assign(f, { act2_end: true, q_flicker: 5, q_rats: 3, q_arthur: 3, hakon_capital: true, arthur_clue: true, q_comp: 3, comp_story: 2, vex_thief: true, q_act3: 1, capital_letter: 1, q_auseal: 3 }); });
  await pg.keyboard.press('b'); await pg.waitForTimeout(900);
  await pg.click('#bk-tab-quests'); await pg.waitForTimeout(800);
  check(await E(() => !!document.querySelector('#bk-jact-3') && !!document.querySelector('#bk-jact-2')), 'act tabs');
  await pg.screenshot({ path: 'shots2/journal_now.png' });
  await pg.click('#bk-q-notes'); await pg.waitForTimeout(500);
  const notes = await E(() => document.querySelector('#bk-quests-r').textContent);
  check(/Arthur/.test(notes) && /of [2-9]/.test(notes), 'notes gathered, over pages');
  await pg.screenshot({ path: 'shots2/journal_notes.png' });
  await pg.click('#bk-jact-2'); await pg.waitForTimeout(500);
  const l2 = await E(() => document.querySelector('#bk-quests-l').textContent);
  check(/The Flicker/.test(l2) && /Cellar Rats/.test(l2) && !/Mines of the Crags/.test(l2), 'Act II quests, done ones kept: ' + l2.slice(0, 120));
  await pg.screenshot({ path: 'shots2/journal_act2.png' });
  await pg.click('#bk-jact-1'); await pg.waitForTimeout(400);
  check(/Apprentice of Oakhaven/.test(await E(() => document.querySelector('#bk-quests-l').textContent)), 'Act I entry');
  check(errs.filter((e) => !/TUNNEL|fonts/.test(e)).length === 0, 'no errors ' + errs.filter((e) => !/TUNNEL|fonts/.test(e)).slice(0, 3));
  console.log(ok ? 'ALL PASS' : 'SOME FAILED'); await b.close();
})();
