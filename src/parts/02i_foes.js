/* Loader for the baked foe atlases: FOE_FR[art] = { idle:[canvas], attack:[..], hurt:[..], dead:[..], w, h } (null until decoded) */
const FOE_FR = {};
(function () {
  if (typeof Image === "undefined" || typeof FOE_ATLAS === "undefined") return;
  Object.keys(FOE_ATLAS).forEach((k) => {
    const a = FOE_ATLAS[k], im = new Image();
    im.onload = () => {
      const o = { w: a.cw, h: a.ch }; let i = 0;
      Object.keys(a.n).forEach((kind) => {
        o[kind] = [];
        for (let j = 0; j < a.n[kind]; j++, i++) { const c = makeCanvas(a.cw, a.ch), x = c.getContext("2d"); x.drawImage(im, i * a.cw, 0, a.cw, a.ch, 0, 0, a.cw, a.ch); o[kind].push(c); }
      });
      o[0] = o.idle[0]; o[1] = o.attack[0]; o.length = 2;
      FOE_FR[k] = o;
    };
    im.src = a.src;
  });
})();

/* ambient wildlife: CRIT_FR[animal][kind+dir] = [canvas]; kinds i (idle) w (walk) r (run); dirs 0 down 1 up 2 left 3 right */
const CRIT_FR = {};
(function () {
  if (typeof Image === "undefined" || typeof CRIT_ATLAS === "undefined") return;
  Object.keys(CRIT_ATLAS).forEach((k) => {
    const a = CRIT_ATLAS[k], im = new Image();
    im.onload = () => {
      const o = { w: a.cw, h: a.ch }; let i = 0;
      Object.keys(a.n).forEach((kind) => {
        o[kind] = [];
        for (let j = 0; j < a.n[kind]; j++, i++) { const c = makeCanvas(a.cw, a.ch), x = c.getContext("2d"); x.drawImage(im, i * a.cw, 0, a.cw, a.ch, 0, 0, a.cw, a.ch); o[kind].push(c); }
      });
      CRIT_FR[k] = o;
    };
    im.src = a.src;
  });
})();
