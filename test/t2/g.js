const { boot, jump } = require('./common');
(async () => {
  const { b, pg, errs } = await boot({ viewport: { width: 915, height: 412 }, dsf: 2 });
  const shot = (n) => pg.screenshot({ path: `shots2/${n}.png` });
  await jump(pg, 'a2_start'); await pg.click('#dz-pillar-tut-ok'); await pg.waitForTimeout(300);
  await pg.click('#dz-menu'); await pg.waitForTimeout(200); await pg.click('#dz-tab-settings'); if (!(await pg.$('#dz-give-act2'))) await pg.click('#dz-tools'); await pg.click('#dz-give-act2'); await pg.waitForTimeout(200);
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(200);
  if (await pg.$('.dz-overlay')) await pg.mouse.click(5, 5);
  // gear tab
  await pg.keyboard.press('i'); await pg.waitForTimeout(300); if (await pg.$('#dz-tab-gear')) await pg.click('#dz-tab-gear'); await pg.waitForTimeout(600); await shot('g1_gear');
  await pg.click('#dz-equip-frostcrown').catch(() => {}); await pg.waitForTimeout(200); await shot('g1b_gear');
  if (await pg.$('#dz-gwho-tessa')) { await pg.click('#dz-gwho-tessa'); await pg.waitForTimeout(200); await shot('g2_gear_tessa'); }
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(200);
  console.log('stats', JSON.stringify(await pg.evaluate(() => { const G = window.__durinn.G(); return [window.__durinn.act2.btlStatsFor(G, 'wren', G.party.wren.lv), window.__durinn.act2.btlStatsFor(G, 'tessa', G.party.tessa.lv), G.equip]; })));
  // pillar: craft
  await pg.evaluate(() => window.__durinn.pillar()); await pg.waitForTimeout(300); await shot('g3_pillar');
  await pg.click('#dz-pillar-craft'); await pg.waitForTimeout(200); await shot('g4_craft');
  await pg.click('#dz-craft-spoultice'); await pg.click('#dz-craft-firepot').catch(() => console.log('firepot needs torchoil first')); await pg.click('#dz-craft-torchoil'); await pg.click('#dz-craft-firepot'); await pg.click('#dz-craft-btonic');
  console.log('items', JSON.stringify(await pg.evaluate(() => window.__durinn.G().items)));
  await pg.click('#dz-pillar-back'); await pg.click('#dz-pillar-study'); await pg.waitForTimeout(200); await shot('g5_studylist');
  await pg.click('#dz-study-Pyr'); await pg.waitForTimeout(500); await shot('g6_study_show');
  await pg.waitForTimeout(1500);
  const pts = await pg.evaluate(() => window.__durinn.act2.runeFor('Pyr', 5));
  const box = await (await pg.$('.dz-stsvg')).boundingBox();
  for (let i = 0; i < pts.length; i++) { await pg.mouse.click(box.x + pts[i].x / 300 * box.width, box.y + pts[i].y / 300 * box.height); await pg.waitForTimeout(120); if (i === 2) await shot('g7_study_trace'); }
  await pg.waitForTimeout(700); await shot('g8_study_bind');
  const ans = await pg.evaluate(() => { const b = [...document.querySelectorAll('.dz-stopts .dz-opt')]; return b.map((x) => x.id); });
  console.log('opts', ans);
  // answer correctly: clue text -> find suffix by tag
  const right = await pg.evaluate(() => { const clue = document.querySelector('.dz-stclue').textContent.replace(/[“”]/g, ''); return clue; });
  console.log('clue', right);
  await pg.evaluate(() => { /* try each; the correct one is unknown to the test, so read the game's table through the DOM is not possible */ });
  await pg.click('#' + ans[0]); await pg.waitForTimeout(1200); await shot('g9_study_done');
  await pg.click('#dz-study-done'); await pg.waitForTimeout(300);
  console.log('mastery', JSON.stringify(await pg.evaluate(() => [window.__durinn.G().mastery, window.__durinn.G().studied, window.__durinn.G().rests])));
  // battle: veil and Sens, items
  await pg.evaluate(() => { const G = window.__durinn.G(); G.hotbar = ['Sens-id', 'Pyr-or', 'San-is', 'Vis-is']; window.__durinn.fight(['wolf', 'hound']); });
  await pg.waitForTimeout(2500); await shot('g10_battle_veiled');
  console.log(errs.filter((e) => !/ERR_TUNNEL/.test(e))); await b.close();
})();
