const { boot, jump } = require('./common');
const fs = require('fs');
/* whole-map renders for environment audits: MAPS env "id,id"; output audit/<id>.png */
(async () => {
  const { b, pg, errs } = await boot({});
  await jump(pg, 'a2_start');
  const ids = process.env.MAPS ? process.env.MAPS.split(',') : await pg.evaluate(() => { const { MAP_DEFS } = window.__durinn.data(); return Object.keys(MAP_DEFS).filter((k) => MAP_DEFS[k].outside); });
  for (const id of ids) {
    const url = await pg.evaluate((id) => window.__durinn.eng.mapShot(id), id);
    if (!url) { console.log('none', id); continue; }
    fs.writeFileSync(`audit/${id}.png`, Buffer.from(url.split(',')[1], 'base64'));
    console.log(id);
  }
  console.log('errors', errs.slice(0, 5));
  await b.close();
})();
