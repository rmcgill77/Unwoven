const { boot } = require('./common');
(async () => { const { b, pg, errs } = await boot({ viewport: { width: 412, height: 915 }, dsf: 2 }); await pg.screenshot({ path: 'shots2/portrait.png' }); console.log('rotate prompt', !!(await pg.$('.dz-rotate')), errs.filter((e) => !/TUNNEL/.test(e))); await b.close(); })();
