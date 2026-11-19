
/* ------------------------------------------------------------------ */
/* Battle art mock-up: large full-body figures, a wolf, a forest       */
/* clearing, and a draft of the battle HUD. Close-up pixel art, flat cel-shaded, lit   */
/* from the upper left with a low sun behind the enemy.                */
/* ------------------------------------------------------------------ */
/* flat cel-shaded pixel primitives: polygon fill with hard bands, no gradients */
const celMat = (c) => ({ L: c.l, B: c.b, D: c.d, S: mix(c.d, PAL.ink, 0.4) });
function fillPoly(g, pts, M, o = {}) {
  const bands = o.bands || [0.2, 0.6, 0.88];
  let y0 = Infinity, y1 = -Infinity;
  for (const p of pts) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
  for (let y = Math.ceil(y0 - 0.5); y <= Math.floor(y1 - 0.5); y++) {
    const yc = y + 0.5, xs = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      if ((a[1] <= yc && b[1] > yc) || (b[1] <= yc && a[1] > yc)) xs.push(a[0] + ((yc - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
    }
    xs.sort((p, q) => p - q);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const xa = xs[k], xb = xs[k + 1];
      for (let x = Math.ceil(xa - 0.5); x < Math.ceil(xb - 0.5); x++) {
        let t = (x + 0.5 - xa) / Math.max(1, xb - xa);
        if (o.flip) t = 1 - t;
        let key = t < bands[0] ? "L" : t < bands[1] ? "B" : t < bands[2] ? "D" : "S";
        if (o.dark) key = key === "L" ? "B" : key === "B" ? "D" : "S";
        const c = M[key];
        if (c) g.set(x, y, c);
      }
    }
  }
}
function rowSpans(g, y, spans, fn) { for (let x = spans[0]; x <= spans[1]; x++) { const c = fn(x, y); if (c) g.set(x, y, c); } }
/* flat sun-side rim: the enemy's low sun sits to the right */
function rimLight(g, color) {
  const add = [];
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) { const c = g.get(x, y); if (c && !g.get(x + 1, y) && g.get(x - 1, y)) add.push(x, y, mix(c, color, 0.42)); }
  for (let i = 0; i < add.length; i += 3) g.set(add[i], add[i + 1], add[i + 2]);
}

const FIG_FRONT = [9, 11, 12, 12, 12, 12, 13, 12, 12, 13, 15, 14, 13, 13, 12, 11, 9];
const FIG_BACK = [4, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 3, 4, 5, 7];
function drawFigure(look, opts = {}) {
  const L = resolveLook(look);
  const g = new Grid(46, 79);
  const S = L.sk, st = L.style;
  const skin = celMat({ l: S.l, b: S.b, d: S.d }), cloth = celMat(L.cl), hairM = celMat({ l: L.hr.l, b: L.hr.b, d: L.hr.d });
  const pants = celMat({ l: mix(L.pants, PAL.white, 0.2), b: L.pants, d: mix(L.pants, PAL.ink, 0.35) });
  const boots = celMat({ l: mix(L.boots, PAL.white, 0.2), b: L.boots, d: mix(L.boots, PAL.ink, 0.4) });
  const wood = celMat({ l: PAL.woodL, b: PAL.wood, d: PAL.woodD }), metal = celMat({ l: PAL.metalL, b: PAL.metal, d: PAL.metalD });
  const dress = L.outfit === "dress", coat = L.outfit === "coat";
  const hx = 14, hy = 3;
  const P = (x, y, c) => g.set(x, y, c);

  /* back hair (long) and hood back */
  if (st === "long") fillPoly(g, [[hx - 4, hy + 3], [hx + 4, hy - 1], [hx + 6, hy + 20], [hx + 3, hy + 36], [hx - 5, hy + 36], [hx - 6, hy + 14]], hairM, { bands: [0.3, 0.7, 0.9] });
  if (st === "hood") fillPoly(g, [[hx - 5, hy + 2], [hx + 3, hy - 4], [hx + 12, hy - 1], [hx + 8, hy + 22], [hx - 6, hy + 26]], cloth, { bands: [0.15, 0.6, 0.85] });

  /* legs, far then near */
  const legMat = dress ? skin : pants;
  fillPoly(g, [[17, 46], [22, 46], [21, 70], [16, 70]], legMat, { dark: true, bands: [0.3, 0.7, 0.95] });
  fillPoly(g, [[14, 68], [21, 68], [24, 74], [25, 76], [13, 76], [13, 72]], boots, { dark: true, bands: [0.2, 0.6, 0.9] });
  fillPoly(g, [[21, 46], [27, 46], [29, 70], [23, 70]], legMat, { bands: [0.25, 0.65, 0.92] });
  fillPoly(g, [[22, 68], [28, 68], [31, 74], [32, 76], [21, 76], [21, 72]], boots, { bands: [0.2, 0.6, 0.9] });
  for (const [x, y] of [[23, 73], [24, 73], [29, 74], [30, 75]]) P(x, y, boots.L);
  P(13, 76, boots.S); P(14, 76, boots.S);

  /* far arm */
  fillPoly(g, [[25, 22], [29, 22], [33, 31], [33, 37], [31, 37], [28, 31]], cloth, { dark: true, bands: [0.2, 0.6, 0.9] });
  fillPoly(g, [[31, 36], [34, 36], [34, 39], [31, 39]], skin, { dark: true });

  /* torso */
  const torso = coat ? [[15, 22], [20, 20], [27, 20], [30, 23], [31, 32], [32, 52], [31, 61], [15, 61], [14, 52], [14, 30]]
    : dress ? [[15, 22], [20, 20], [27, 20], [30, 23], [30, 30], [28, 38], [31, 48], [34, 62], [10, 62], [13, 48], [16, 38], [14, 30]]
    : [[15, 22], [20, 20], [27, 20], [30, 23], [30, 30], [28, 38], [28, 47], [16, 47], [16, 38], [14, 30]];
  fillPoly(g, torso, cloth, { bands: [0.22, 0.58, 0.86] });
  /* neck, then collar/neckline */
  fillPoly(g, [[19, hy + 14], [26, hy + 14], [27, 22], [19, 22]], skin, { bands: [0.15, 0.6, 0.85] });
  for (let x = 19; x < 27; x++) P(x, 21, skin.D);
  if (L.outfit === "tunic") { for (const [x, y] of [[22, 22], [23, 22], [22, 23], [23, 23], [22, 24]]) P(x, y, skin.D); for (const [x, y] of [[21, 22], [24, 22], [21, 23], [24, 23], [22, 25], [23, 25]]) P(x, y, cloth.L); P(22, 26, PAL.parch); P(23, 27, PAL.parch); P(22, 28, PAL.parch); }
  if (dress) { for (let x = 19; x < 27; x++) P(x, 22, skin.B); for (let x = 20; x < 26; x++) P(x, 23, skin.D); for (let x = 18; x < 28; x++) P(x, 22 - ((x < 20 || x > 25) ? 0 : 1) + 1, cloth.L); }
  if (coat) {
    fillPoly(g, [[20, 20], [24, 20], [25, 30], [22, 33]], cloth, { dark: true, bands: [0.5, 0.8, 1] });
    for (let y = 30; y < 60; y++) P(24, y, cloth.S);
    for (const y of [34, 40, 46, 52]) { P(23, y, metal.L); P(23, y + 1, metal.D); }
    for (let y = 22; y < 31; y++) { P(22 + ((y - 22) >> 1), y, cloth.L); P(26 + ((y - 22) >> 2), y, cloth.D); }
    for (let x = 15; x < 32; x++) P(x, 56, cloth.D);
    P(30, 61, cloth.S); P(31, 61, cloth.S);
  }
  /* folds and hem */
  const FX = coat ? [17, 20, 28] : dress ? [14, 18, 24, 29, 32] : [18, 26];
  for (const x of FX) for (let y = coat ? 40 : dress ? 46 : 30; y < (coat ? 60 : dress ? 61 : 46); y++) if ((y + x) % 7 > 1 && g.get(x, y)) P(x, y, cloth.D);
  const hemY = coat ? 60 : dress ? 61 : 46;
  for (let x = 10; x < 35; x++) if (g.get(x, hemY)) P(x, hemY, cloth.L);
  /* belt */
  if (!coat) { const by = dress ? 38 : 39; for (let x = 15; x < 30; x++) if (g.get(x, by)) { P(x, by, PAL.woodD); P(x, by + 1, mix(PAL.woodD, PAL.ink, 0.35)); } P(27, by, metal.L); P(28, by, metal.B); P(27, by + 1, metal.D); P(28, by + 1, metal.D); P(14, by, PAL.woodD); }
  if (L.apron) { const A = celMat({ l: mix(L.apron, PAL.white, 0.3), b: L.apron, d: mix(L.apron, PAL.ink, 0.25) }); fillPoly(g, [[22, 40], [31, 40], [32, 60], [22, 60]], A, { bands: [0.15, 0.6, 0.9] }); for (let x = 22; x < 31; x++) P(x, 40, A.L); for (let y = 26; y < 40; y++) { P(26, y, A.D); P(27, y, A.B); } }
  if (L.strap) { for (let i = 0; i < 16; i++) { const x = 18 + i * 0.75 | 0, y = 22 + i; if (g.get(x, y)) { P(x, y, PAL.woodL); P(x + 1, y, PAL.wood); P(x + 2, y, PAL.woodD); } } P(26, 36, metal.L); P(27, 36, metal.B); P(26, 37, metal.D); }
  if (L.outfit === "tunic") for (let x = 16; x < 29; x++) if (g.get(x, 22)) P(x, 22, cloth.L);

  /* head, flat bands */
  for (let r = 0; r < 17; r++) {
    const bx = hx + FIG_BACK[r], fx = hx + FIG_FRONT[r], y = hy + r;
    for (let x = bx; x < fx; x++) {
      const t = (x - bx) / Math.max(1, fx - bx - 1);
      let k = t < 0.22 ? "L" : t < 0.82 ? "B" : "D";
      if (r >= 13) k = t < 0.3 ? "B" : "D";
      if (r >= 15) k = "D";
      if (x >= fx - 2 && r >= 6 && r <= 11 && r !== 10) k = "L" === k ? "B" : "B";
      P(x, y, skin[k]);
    }
  }
  P(hx + 14, hy + 10, skin.L); P(hx + 13, hy + 10, skin.L); P(hx + 13, hy + 11, skin.D);
  /* ear */
  if (st !== "long" && st !== "hood") { for (const [dx, dy, k] of [[5, 7, "L"], [6, 7, "B"], [5, 8, "L"], [6, 8, "D"], [5, 9, "L"], [6, 9, "D"], [7, 8, "B"], [6, 10, "B"], [5, 10, "B"]]) P(hx + dx, hy + dy, skin[k]); }
  /* eye, brow, mouth */
  const fx6 = hx + FIG_FRONT[8];
  const lid = mix(S.s, PAL.ink, 0.5), browC = st === "bald" || st === "helm" ? mix(S.d, L.hr.d, 0.5) : L.hr.d;
  P(fx6 - 4, hy + 8, mix(PAL.white, S.d, 0.15)); P(fx6 - 3, hy + 8, PAL.ink);
  for (let x = fx6 - 5; x <= fx6 - 2; x++) P(x, hy + 7, lid);
  for (let x = fx6 - 5; x <= fx6 - 1; x++) P(x, hy + 6, browC);
  if (L.mood === "stern" || L.mood === "sly") { P(fx6 - 1, hy + 7, browC); P(fx6 - 5, hy + 5, browC); }
  const mc = mix(S.s, PAL.ink, 0.45), lipC = mix(S.d, "#8a3a40", 0.5);
  const mx = hx + FIG_FRONT[13] - 5;
  P(mx + 1, hy + 12, lipC); P(mx + 2, hy + 12, lipC);
  for (let x = mx; x <= mx + 3; x++) P(x, hy + 13, mc);
  if (L.mood === "smile" || L.mood === "kind") P(mx + 4, hy + 12, mc);
  if (L.age) { P(fx6 - 6, hy + 9, skin.D); P(fx6 - 7, hy + 10, skin.D); P(fx6 - 5, hy + 11, skin.D); for (let x = hx + 3; x < hx + 9; x += 2) P(x, hy + 4, skin.D); }
  /* beard */
  if (L.beard) {
    const spans = [[8, 13], [5, 13], [4, 14], [3, 14], [3, 13], [3, 12], [3, 10]];
    for (let i = 0; i < spans.length; i++) {
      const y = hy + 10 + i;
      for (let x = hx + spans[i][0]; x <= hx + spans[i][1]; x++) {
        if (i === 3 && x >= hx + 9 && x <= hx + 13) continue;   // mouth gap
        const edge = x === hx + spans[i][0] || i === 6;
        P(x, y, edge ? hairM.D : (x + y) % 5 === 0 ? hairM.L : x > hx + 10 ? hairM.D : hairM.B);
      }
    }
    for (let x = mx; x <= mx + 3; x++) P(x, hy + 13, mc);
  }
  /* hair, hood, helm */
  const hairTone = (x, r) => (r <= 1 && x < hx + 9) ? hairM.L : (x < hx + 2 || r >= 7) ? hairM.D : ((x + r * 2) % 5 === 0 ? hairM.D : (r <= 3 && (x + r) % 4 === 0) ? hairM.L : hairM.B);
  if (st === "short" || st === "long" || st === "bun") {
    const sp = [[4, 10], [2, 12], [0, 13], [-1, 13], [-1, 12], [-1, 10], [-1, 8], [-1, 5], [-1, 3], [-1, 3], [0, 2]];
    for (let r = 0; r < sp.length; r++) for (let x = hx + sp[r][0]; x <= hx + sp[r][1]; x++) P(x, hy + r, hairTone(x, r));
    for (let x = hx + 6; x <= hx + 12; x++) P(x, hy + 3, hairM.D);
    if (st === "bun") fillPoly(g, [[hx + 1, hy - 3], [hx + 4, hy - 4], [hx + 7, hy - 3], [hx + 7, hy + 1], [hx + 1, hy + 1]], hairM, { bands: [0.3, 0.7, 0.9] });
    if (st === "long") for (let r = 4; r < 36; r++) for (let x = hx - 5; x <= hx - 1 + (r > 18 ? 1 : 0) + (r > 10 && r < 28 ? 3 : 0); x++) if (r > 11 || x < hx) P(x, hy + r, hairTone(x, r > 20 ? 3 : r));
  } else if (st === "bald") {
    for (const [dx, dy] of [[5, 0], [6, 0], [4, 1], [7, 0]]) P(hx + dx, hy + dy, mix(S.l, PAL.white, 0.5));
    for (let r = 4; r < 10; r++) P(hx + FIG_BACK[r], hy + r, mix(S.d, L.hr.b, 0.5));
  } else if (st === "hood") {
    fillPoly(g, [[hx - 2, hy + 6], [hx + 1, hy - 2], [hx + 8, hy - 4], [hx + 14, hy - 1], [hx + 14, hy + 3], [hx + 10, hy + 4], [hx + 6, hy + 3], [hx + 3, hy + 6], [hx + 4, hy + 20], [hx - 2, hy + 24]], cloth, { bands: [0.2, 0.55, 0.85] });
    fillPoly(g, [[hx - 5, hy + 14], [hx + 6, hy + 14], [hx + 9, hy + 20], [hx + 8, hy + 24], [hx - 6, hy + 24]], cloth, { bands: [0.2, 0.55, 0.85] });
    for (let x = hx + 2; x < hx + 13; x++) P(x, hy + 4, cloth.S);
  } else if (st === "helm") {
    fillPoly(g, [[hx + 1, hy + 6], [hx + 2, hy - 1], [hx + 8, hy - 3], [hx + 14, hy - 1], [hx + 14, hy + 5], [hx + 1, hy + 6]], metal, { bands: [0.2, 0.55, 0.88] });
    for (let x = hx + 1; x < hx + 14; x++) P(x, hy + 5, metal.D);
    for (let x = hx + 2; x < hx + 14; x++) P(x, hy + 4, metal.L);
    for (let y = hy + 5; y < hy + 11; y++) { P(hx + 12, y, metal.B); P(hx + 13, y, metal.L); }
    P(hx + 8, hy - 3, metal.L); P(hx + 7, hy - 3, metal.L);
    for (let y = hy + 6; y < hy + 10; y++) P(hx + 3, y, metal.D);
  }
  /* near arm and hand */
  fillPoly(g, [[18, 22], [24, 22], [25, 30], [19, 31]], cloth, { bands: [0.25, 0.65, 0.92] });
  fillPoly(g, [[19, 29], [25, 30], [31, 33], [30, 37], [24, 35], [19, 33]], cloth, { bands: [0.2, 0.6, 0.9] });
  for (let i = 0; i < 6; i++) { const x = 22 + i, y = 32 + (i >> 1); if (i % 3 === 1) P(x, y, cloth.D); }
  for (const [x, y] of [[28, 33], [29, 34], [29, 35], [28, 36], [30, 36]]) P(x, y, cloth.L);
  fillPoly(g, [[30, 34], [34, 34], [34, 38], [30, 38]], skin, { bands: [0.3, 0.7, 0.9] });
  P(33, 34, skin.L); P(34, 36, skin.D);
  if (opts.staff) {
    for (let y = 2; y < 78; y++) { P(31, y, wood.L); P(32, y, wood.B); if (y % 9 === 0) P(31, y, wood.D); }
    fillPoly(g, [[29, 3], [31, -1], [34, 3], [34, 5], [29, 5]], metal, { bands: [0.3, 0.6, 0.9] });
    P(31, 1, "#bfe8ff"); P(32, 2, "#6fc4f0"); P(31, 2, "#6fc4f0");
    for (let x = 30; x < 34; x++) P(x, 34, skin.B);
  }
  g.outline();
  rimLight(g, "#f0b878");
  return g.toCanvas();
}

/* The wolf in the world's pixel language: black outline, flat tones, mangy and starved. */
function drawWolf(frame = 0, opts = {}) {
  const s = new PB(112, 72), up = opts.growl ? 1 : 0;
  const F = { L: "#5a5458", B: "#433e44", D: "#2e2a32", S: "#1e1a22" }, BEL = "#6a6266";
  // far legs
  s.poly([[38, 40], [44, 40], [43, 62], [37, 62]], F.D); s.poly([[35, 60], [44, 60], [45, 65], [34, 65]], F.S);
  s.poly([[74, 38], [83, 38], [81, 50], [78, 58], [80, 64], [72, 64], [74, 56], [71, 46]], F.D);
  // tail, low and ragged
  s.poly([[86, 24], [98, 26], [106, 36], [108, 50], [102, 52], [96, 40], [88, 32]], F.B); s.poly([[98, 26], [106, 36], [103, 38], [96, 30]], F.L);
  // body: ribs showing, sunken belly
  s.poly([[30, 20], [44, 14], [68, 14], [84, 20], [90, 30], [84, 40], [70, 42], [50, 40], [34, 40], [26, 30]], F.B);
  s.poly([[30, 20], [44, 14], [68, 14], [84, 20], [70, 22], [46, 22]], F.L);
  for (const x of [50, 56, 62, 68]) s.line([[x, 26], [x - 2, 37]], F.D);
  s.poly([[40, 38], [52, 41], [66, 41], [74, 38], [66, 43], [48, 43]], BEL);
  // mane: ragged hackles
  s.poly([[28, 28], [28, 14], [32, 17], [34, 8], [39, 14], [42, 5], [46, 13], [51, 9], [52, 20], [42, 30]], F.B);
  for (const [x, y] of [[34, 10], [41, 8], [49, 12]]) s.set(x, y, F.L);
  // near legs
  s.poly([[32, 36], [40, 36], [39, 60], [31, 60]], F.B); s.line([[33, 38], [33, 58]], F.L);
  s.poly([[29, 59], [40, 59], [41, 65], [28, 65]], F.D);
  s.poly([[66, 32], [80, 32], [82, 42], [78, 50], [74, 56], [77, 64], [67, 64], [69, 54], [66, 44]], F.B); s.line([[68, 36], [70, 52]], F.L);
  for (const x of [29, 32, 35, 67, 70, 73]) s.set(x, 65, "#c8c0b0");
  // head
  s.poly([[2, 30 + up], [7, 25 + up], [16, 20 + up], [24, 18 + up], [32, 22], [30, 32], [16, 34], [6, 33 + up]], F.B);
  s.poly([[7, 25 + up], [16, 20 + up], [24, 18 + up], [22, 24], [12, 26]], F.L);
  s.poly([[18, 20], [21, 6], [28, 18]], F.B); s.poly([[26, 19], [31, 8], [34, 21]], F.D); s.poly([[21, 17], [22, 10], [25, 17]], "#4a2430");
  if (opts.growl) {
    s.poly([[3, 32], [8, 33], [18, 35], [24, 36], [22, 42], [9, 41]], "#3e121e");
    s.poly([[4, 38], [9, 40], [22, 42], [24, 39], [15, 38]], BEL);
    for (const x of [6, 9, 12, 15]) { s.set(x, 33, "#e4dcc8"); s.set(x, 34, "#e4dcc8"); }
    for (const x of [8, 11, 14]) s.set(x, 39, "#e4dcc8");
  } else { s.line([[4, 33], [24, 33]], "#120c14"); for (const x of [6, 9, 12]) s.set(x, 34, "#e4dcc8"); }
  s.rect(1, 28 + up, 3, 30 + up, "#08060c"); s.set(2, 28 + up, "#5a6068");
  const ex = 15, ey = 24 + up;
  s.set(ex, ey, "#e8c860"); s.set(ex + 1, ey, "#c89030"); s.set(ex - 1, ey + 1, "#a06020"); s.set(ex, ey + 1, "#c89030");
  s.line([[ex - 3, ey - 1], [ex + 4, ey - 2]], "#0e0c14");
  s.line([[19, 26], [25, 32]], "#6a3434"); s.line([[54, 18], [60, 26]], "#5a3030");   // old scars
  s.outline();
  return s.canvas();
}

/* Painted backdrops for some regions (baked in 02o_bg_data.js); everywhere else keeps the drawn forest clearing. */
const BATTLE_BG = {};
for (const k in BATTLE_BG_SRC) { try { const im = new Image(); im.src = BATTLE_BG_SRC[k]; BATTLE_BG[k] = im; } catch (e) { /* no DOM */ } }
let BATTLE_SCENE = null, BATTLE_NIGHT = false;
function battleSceneFor(mapId, tx, ty) {
  const def = MAP_DEFS[mapId];
  if (mapId === "fort") return "castle";
  if (!def || !def.outside) return null;
  if (mapId === "fort") return "castle";
  if (mapId === "os") return tx < 22 && ty < 20 ? "rocks" : tx > 70 && ty < 30 ? "frostlake" : "snowwood";
  if (mapId === "gw") return "snowwood";
  if (def.cave || def.terrain === "cave") {                                     // under the ground: the cave backdrops
    if (mapId === "cr_shrine" || mapId === "caveS") return "crystalcave";            // word-light, moon-light
    if (mapId === "au_culvert" || mapId === "rot_cellar" || mapId === "caveD") return "spidercave";   // slime, webs, the infection
    return "cave";
  }
  const sn = snowAtTile(def, ty);
  if (def.crags) return sn > 0.5 ? "snowfield" : sn > 0.15 ? "snowwood" : "rocks";   // the Western Crags
  const treesNear = () => { let n = 0; for (let y = ty - 3; y <= ty + 3; y++) for (let x = tx - 3; x <= tx + 3; x++) { const r = def.rows[y]; if (r && r[x] === "T") n++; } return n > 10; };
  if (def.south) {                                                                 // southern Etharis: fields gone to autumn, woods, and where the curse runs, dead ground
    if (typeof curseAtTile === "function" && curseAtTile(def, tx, ty) > 0.38) return "cursed";
    if (def.town) return mapId === "rot" ? "cursed" : "autumnfield";
    return treesNear() ? "summerwood" : "autumnfield";
  }
  if (mapId === "rot" || mapId === "au_out" || mapId === "au_vault" || mapId === "sb" || mapId === "mh" || mapId.startsWith("ver_")) return mapId === "rot" ? "cursed" : "autumnfield";
  if (mapId === "rocks") return "canyon";                                           // Act One's southern rocks
  if (mapId === "wood" || mapId === "ruin" || mapId === "grove" || mapId === "wforest" || mapId === "eforest") return "summerwood";
  if (def.plains && sn > 0.5) return "snowfield";
  if (def.plains && sn > 0.25) return "birch";
  if (def.plains) return "summerwood";
  return null;
}
function drawBattleBackdrop(w, h) {
  const c = makeCanvas(w, h), x = c.getContext("2d");
  const art = BATTLE_SCENE && BATTLE_BG[BATTLE_SCENE];
  if (art && art.complete && art.naturalWidth) {
    const s = Math.max(w / art.naturalWidth, h / art.naturalHeight), dw = art.naturalWidth * s, dh = art.naturalHeight * s;
    x.imageSmoothingEnabled = false;
    const lift = { castle: 0.17 }[BATTLE_SCENE] || 0;                                                   // how much of the picture's foot runs off the bottom
    x.drawImage(art, Math.round((w - dw) / 2), Math.round(h - dh + dh * lift), Math.round(dw), Math.round(dh));   // anchored to the ground
    if (BATTLE_NIGHT) { x.fillStyle = "rgba(14,16,40,0.5)"; x.fillRect(0, 0, w, h); }
    const fl = x.createLinearGradient(0, h * 0.62, 0, h);                                                 // a darker band where the fight stands
    fl.addColorStop(0, "rgba(20,18,26,0)"); fl.addColorStop(1, "rgba(20,18,26,0.28)"); x.fillStyle = fl; x.fillRect(0, h * 0.62, w, h * 0.38);
    return c;
  }
  const rnd = mulberry32(4242);
  const hor = Math.round(h * 0.4);
  const sky = ["#16181e", "#1e2128", "#262a31", "#30343b", "#3a3e44", "#44474c", "#4e5054", "#5a5b5e"];
  for (let y = 0; y < hor; y++) for (let px = 0; px < w; px++) {
    x.fillStyle = ramp(sky, Math.pow(y / hor, 1.55), px, y);
    x.fillRect(px, y, 1, 1);
  }
  const sunX = w * 0.78, sunY = hor - 4;
  let gr = x.createRadialGradient(sunX, sunY, 2, sunX, sunY, Math.max(w, h) * 0.5);
  gr.addColorStop(0, "rgba(200,204,206,0.35)"); gr.addColorStop(0.25, "rgba(170,176,180,0.15)"); gr.addColorStop(1, "rgba(160,166,170,0)");
  x.fillStyle = gr; x.fillRect(0, 0, w, hor + 4);
  // faint high clouds
  for (let i = 0; i < 6; i++) {
    const cy = 8 + rnd() * hor * 0.5, cx = rnd() * w, cw = 40 + rnd() * 90;
    for (let k = 0; k < 3; k++) { x.fillStyle = `rgba(${200 + k * 20},${130 + k * 20},${120 + k * 10},${0.07})`; x.fillRect(cx, cy + k * 2, cw - k * 12, 2); }
  }
  // tree layers, far to near
  const layers = [
    { y: hor - 18, h: 34, col: "#2f3532", n: Math.ceil(w / 11), sz: 0.9 },
    { y: hor - 6, h: 42, col: "#232926", n: Math.ceil(w / 14), sz: 1.1 },
    { y: hor + 6, h: 54, col: "#171c19", n: Math.ceil(w / 19), sz: 1.4 },
  ];
  layers.forEach((L, li) => {
    for (let i = 0; i < L.n; i++) {
      const tx = (i + rnd() * 0.8) * (w / L.n), ty = L.y + rnd() * 8, th = L.h * (0.7 + rnd() * 0.6), tw = th * 0.42 * L.sz;
      x.fillStyle = L.col;
      const tiers = 7;
      for (let k = 0; k < tiers; k++) {
        const kw = Math.max(2, tw * (0.22 + (k / (tiers - 1)) * 0.78)), ky = ty - th + k * (th / tiers);
        x.fillRect(Math.round(tx - kw / 2), Math.round(ky), Math.round(kw), Math.round(th / tiers) + 1);
        if (k > 0) x.fillRect(Math.round(tx - kw / 2 - 1), Math.round(ky + th / tiers - 1), 1, 1);
      }
    }
    x.fillStyle = L.col; x.fillRect(0, L.y + 8, w, hor - L.y + 10);
    const fog = x.createLinearGradient(0, L.y - 20, 0, hor + 10);
    fog.addColorStop(0, `rgba(150,158,160,${0.0})`); fog.addColorStop(1, `rgba(150,158,160,${0.26 - li * 0.06})`);
    x.fillStyle = fog; x.fillRect(0, L.y - 20, w, hor - L.y + 30);
  });
  // ground with perspective
  const grass = ["#141a12", "#1e261a", "#283224", "#343e2c", "#424a34"];
  for (let y = hor; y < h; y++) {
    const s = (y - hor) / (h - hor);
    for (let px = 0; px < w; px++) {
      const n = (hash2(px >> 1, y) % 100) / 100 - 0.5;
      x.fillStyle = ramp(grass, 0.62 - s * 0.38 + n * 0.16 + Math.sin(px * 0.05 + y * 0.2) * 0.04, px, y);
      x.fillRect(px, y, 1, 1);
    }
  }
  // dirt arena
  const ax = w * 0.5, ay = h * 0.8, arx = w * 0.46, ary = h * 0.14;
  const dirt = ["#221c16", "#30281e", "#3e3226", "#4c3e2e", "#5c4c38"];
  for (let y = Math.floor(ay - ary); y < ay + ary; y++) for (let px = Math.floor(ax - arx); px < ax + arx; px++) {
    const dx = (px - ax) / arx, dy = (y - ay) / ary, d = dx * dx + dy * dy;
    if (d > 1) continue;
    const edge = d > 0.84 ? (d - 0.84) / 0.16 : 0;
    if (edge > 0 && (hash2(px, y) % 100) / 100 < edge * 0.85) continue;
    const n = (hash2(px * 3, y * 5) % 100) / 100 - 0.5;
    x.fillStyle = ramp(dirt, 0.68 - edge * 0.4 - dy * 0.14 + n * 0.22 + Math.sin(px * 0.3) * 0.03, px, y);
    x.fillRect(px, y, 1, 1);
  }
  for (let i = 0; i < w * 0.9; i++) {                                    // blades, pebbles, leaves
    const px = (rnd() * w) | 0, py = hor + 2 + ((rnd() * (h - hor)) | 0), s = (py - hor) / (h - hor), bh = 1 + Math.round(s * 4);
    x.fillStyle = rnd() < 0.5 ? "#1e261a" : rnd() < 0.5 ? "#445036" : "#5e5c40";
    x.fillRect(px, py - bh, 1, bh);
  }
  for (let i = 0; i < 70; i++) {
    const px = ax + (rnd() - 0.5) * arx * 1.7, py = ay + (rnd() - 0.5) * ary * 1.6, s = 1 + (py > ay ? 1 : 0);
    x.fillStyle = "#6a5a44"; x.fillRect(px, py + s, s + 1, 1); x.fillStyle = "#a89878"; x.fillRect(px, py, s, s);
  }
  for (let i = 0; i < 90; i++) {
    const px = rnd() * w, py = hor + 8 + rnd() * (h - hor - 8);
    x.fillStyle = ["#4e4028", "#5a4a30", "#3e3424", "#6a5236"][(rnd() * 4) | 0]; x.fillRect(px, py, 2, 1);
  }
  // foreground trunks and canopy framing the shot
  const trunk = (tx, tw, lean, rim) => {
    for (let y = -4; y < h; y++) {
      const off = Math.round(lean * (y / h)), wd = Math.round(tw * (1 + y / h * 0.35));
      for (let px = tx + off; px < tx + off + wd; px++) {
        const u = (px - tx - off) / wd, n = (hash2(px, y >> 2) % 100) / 100 - 0.5;
        const bark = ["#0a0810", "#161220", "#241c2c", "#382a34", "#523c3c"];
        x.fillStyle = ramp(bark, (rim ? 0.55 - (1 - u) * 0.15 + (u > 0.88 ? 0.28 : 0) : 0.5 - u * 0.2) + n * 0.25 + (Math.sin(px * 1.3) * 0.08), px, y);
        x.fillRect(px, y, 1, 1);
      }
    }
  };
  trunk(-12, 34, 10, false); trunk(w - 24, 30, -8, true);
  for (let i = 0; i < 22; i++) {
    const side = i % 2 ? w : 0, px = side + (side ? -1 : 1) * rnd() * 70, py = rnd() * h * 0.2;
    x.fillStyle = ["#0c1410", "#12201a", "#1a2c20"][(rnd() * 3) | 0];
    x.beginPath(); x.ellipse(px, py, 8 + rnd() * 16, 5 + rnd() * 9, 0, 0, Math.PI * 2); x.fill();
  }
  // god rays
  for (let i = 0; i < 4; i++) {
    const rx = w * (0.52 + i * 0.1), rw = 14 + i * 5;
    const rg = x.createLinearGradient(rx, 0, rx - 60, h * 0.9);
    rg.addColorStop(0, "rgba(255,200,130,0.16)"); rg.addColorStop(1, "rgba(255,200,130,0)");
    x.fillStyle = rg; x.beginPath(); x.moveTo(rx, 0); x.lineTo(rx + rw, 0); x.lineTo(rx + rw - 80, h * 0.9); x.lineTo(rx - 80, h * 0.9); x.closePath(); x.fill();
  }
  return c;
}

/* ------------------------------------------------------------------ */
/* Battle screen: runs a createBattle() simulation, draws it with the  */
/* chibi battle sets, and hosts the command menu                       */
/* ------------------------------------------------------------------ */
const EL_COL = { fire: ["#ffb040", "#ff6a30", "#fff0c0"], cold: ["#bfe8ff", "#7ac0ff", "#ffffff"], wind: ["#d8f0e0", "#a8d8c0", "#ffffff"], stone: ["#b8a890", "#8a7a68", "#e8dcc8"],
  storm: ["#fff6a0", "#a8c8ff", "#ffffff"], light: ["#fff8d0", "#ffe890", "#ffffff"], force: ["#c8a8ff", "#8a6adf", "#e8dcff"], life: ["#a8e07a", "#e0ffc8", "#7ad08a"],
  growth: ["#7ac060", "#a8e07a", "#4a8a40"], mind: ["#a8c8ff", "#e0d0ff", "#ffffff"] };
const FOE_ART = new Map();
/* V93: a little face for the turn-order strip, and the status icons a fighter carries */
const BTL_CHIP = {};
function btlChip(u) {
  const key = u.side + ":" + u.key; if (BTL_CHIP[key]) return BTL_CHIP[key];
  let url = "";
  try {
    if (u.side === "p") url = getPortrait(u.look || { chibi: u.key === "companion" ? "companion" : (CHIBI_MAP[u.key] || u.key) }).toDataURL();
    else { const fr = foeSprite(u), im = (fr.idle && fr.idle[0]) || fr[0]; if (im) { const c = makeCanvas(im.width, im.height); c.getContext("2d").drawImage(im, 0, 0); url = c.toDataURL(); } }
  } catch (e) { url = ""; }
  return (BTL_CHIP[key] = url);
}
function btlStatusIcons(u, B) {
  if (u.ko) return [];
  const o = [];
  if (u.stunT > B.t) o.push(["✶", "#b08a2a", "Stunned"]);
  if (u.sleepT > B.t) o.push(["z", "#4a5a9a", "Asleep"]);
  if (u.slowT > B.t) o.push(["≈", "#2a6a7a", "Slowed"]);
  if (u.markT > B.t) o.push(["◎", "#9a3a3a", "Marked"]);
  if (u.dot) o.push([u.dot.k === "poison" ? "☠" : "♨", u.dot.k === "poison" ? "#5a7a2a" : "#a04a20", u.dot.k === "poison" ? "Poisoned" : "Burning"]);
  if (u.prot > 0 || u.guard) o.push(["⛨", "#3a6a8a", "Guarding"]);
  if (u.ward > 0) o.push(["◇", "#4a7aa8", "Warded"]);
  if (u.infuse) o.push(["✦", "#8a6a2a", "Infused"]);
  if (u.charging) o.push(["!", "#a8501c", "Winding up"]);
  return o.slice(0, 4);
}
function foeSprite(u) {
  if (FOE_FR[u.art]) return FOE_FR[u.art];
  const k = u.art + (u.tint || 0);
  let f = FOE_ART.get(k);
  if (!f) {
    const base = [drawWolf(0, {}), drawWolf(1, { growl: true })];
    f = base.map((c) => {
      if (!u.tint) return c;
      const o = makeCanvas(c.width, c.height), x = o.getContext("2d"); x.drawImage(c, 0, 0);
      x.globalCompositeOperation = "source-atop"; x.fillStyle = `rgba(120,28,34,${u.tint * 2.2})`; x.fillRect(0, 0, c.width, c.height);
      return o;
    });
    FOE_ART.set(k, f);
  }
  return f;
}
function partySlots(w, h) { return [[w * 0.30, h * 0.9], [w * 0.15, h * 0.8], [w * 0.45, h * 0.78]]; }
function foeSlots(w, h) { return [[w * 0.74, h * 0.88], [w * 0.6, h * 0.79], [w * 0.88, h * 0.77]]; }

function BattleScreen({ G, foes, party, magic, settings = {}, canFlee = true, practice = false, wild = false, onEnd }) {
  const cvRef = useRef(null), boxRef = useRef(null);
  const B = useMemo(() => {
    magicEnsure(G);
    const b = createBattle({ party, foes, items: G.items || {}, canFlee, wait: settings.wait !== false, words: G.words, hotbar: G.hotbar, ley: { wild }, autoRelease: !!settings.autoRelease, act2: !!(G.flags && G.flags.act2), mastery: G.mastery });
    b.onSignature = () => { G.sigs = (G.sigs || 0) + 1; };
    return b;
  }, []);
  const [win, setWin] = useState(null);                   // release window overlay
  const winRef = useRef({ bar: null });
  const [, setRev] = useState(0);   // a foe joining mid-fight needs a new name bar
  const [menu, setMenu] = useState(null);                 // { id, stage: cmd|spell|item|target, pend }
  const [over, setOver] = useState(null);                 // result card
  const menuRef = useRef(null); menuRef.current = menu;
  const hover = useRef(null);
  const refs = useRef({ foeCond: {}, foeHp: {}, foeBadge: {}, hp: {}, mp: {}, atb: {}, hpBar: {}, row: {}, ward: {}, log: null, foePlate: {}, foeTop: {}, foeSt: {}, heroSt: {}, order: null, orderKey: "", orderT: 0 });
  const doneRef = useRef(false);
  const hitRef = useRef(null);
  const [tip, setTip] = useState(() => (magic && !(G.flags && G.flags.tip_btl) ? 1 : !(G.flags && G.flags.tip_btl0) && !practice ? 0 : null));
  const tipRef = useRef(tip); tipRef.current = tip;

  const unitById = (id) => B.by(id);
  const choose = (cmd) => { const m = menuRef.current; if (!m) return; if (B.command(m.id, cmd)) { setMenu(null); hover.current = null; } };
  const livingFoes = () => B.living("e");
  const pickCmd = (name) => {
    const m = menuRef.current; if (!m) return;
    const u = unitById(m.id);
    if (name === "attack") { const f = livingFoes(); if (f.length === 1) choose({ type: "attack", target: f[0].id }); else setMenu({ ...m, stage: "target", pend: { type: "attack" } }); }
    else if (name === "magic") setMenu({ ...m, stage: "spell" });
    else if (name === "skill") setMenu({ ...m, stage: "skill" });
    else if (name === "item") setMenu({ ...m, stage: "item" });
    else if (name === "defend") choose({ type: "defend" });
    else if (name === "flee") choose({ type: "flee" });
  };
  const pickSpell = (sp) => {
    const m = menuRef.current;
    if (!sp.ok) return;
    const cmd = { type: "cast", spell: sp.id };
    if (sp.target === "foes" || sp.target === "allies") { choose(cmd); return; }
    if (sp.target === "foe") { const f = livingFoes(); if (f.length === 1) choose({ ...cmd, target: f[0].id }); else setMenu({ ...m, stage: "target", pend: { ...cmd, side: "e", from: "spell" } }); }
    else setMenu({ ...m, stage: "target", pend: { ...cmd, side: "p", from: "spell" } });
  };
  const pickSkill = (ab) => {
    const m = menuRef.current, cmd = { type: "skill", skill: ab.id };
    if (ab.target === "foe") { const f = livingFoes(); if (f.length === 1) choose({ ...cmd, target: f[0].id }); else setMenu({ ...m, stage: "target", pend: { ...cmd, side: "e" } }); }
    else choose(cmd);
  };
  const pickRoot = (r) => { const m = menuRef.current; setMenu({ ...m, stage: "suf", root: r }); };
  const pickItem = (k) => { const m = menuRef.current; if (BTL_ITEMS[k].foes) { choose({ type: "item", item: k, target: null }); return; } setMenu({ ...m, stage: "target", pend: { type: "item", item: k, side: "p" } }); };
  const pickTarget = (id) => { const m = menuRef.current; choose({ ...m.pend, target: id }); };
  const back = () => {
    const m = menuRef.current; if (!m) return; hover.current = null;
    if (m.stage === "target" && m.pend.type === "cast") setMenu({ ...m, stage: m.pend.from === "weave" ? "suf" : "spell", pend: null });
    else if (m.stage === "target" && m.pend.type === "item") setMenu({ ...m, stage: "item", pend: null });
    else if (m.stage === "target" && m.pend.type === "skill") setMenu({ ...m, stage: "skill", pend: null });
    else if (m.stage === "suf") setMenu({ ...m, stage: "root", root: null });
    else if (m.stage === "root") setMenu({ ...m, stage: "spell" });
    else setMenu({ ...m, stage: "cmd", pend: null });
  };
  useEffect(() => {
    const k = (e) => { if (e.key === "Escape") back(); };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, []);

  useEffect(() => {
    const cv = cvRef.current, box = boxRef.current, ctx = cv.getContext("2d");
    let backdrop = null, view = { w: 0, h: 0, scale: 1 }, vig = null, raf = 0, last = performance.now(), t = 0;
    const floaters = [], parts = [], shake = { t: 0, a: 0 }, logLines = []; let logT = 0; let unitN = B.units.length;
    const motes = Array.from({ length: 30 }, () => ({ x: Math.random(), y: Math.random(), s: 0.1 + Math.random() * 0.25, ph: Math.random() * 6 }));
    const sets = {};
    const blades = {};
    B.allies().forEach((u) => { const wp = (G.equip && G.equip[u.key] && G.equip[u.key].weapon) || null; sets[u.id] = battleFor(u.key, u.look || {}, wp); if (wp && sets[u.id] && !sets[u.id].anims.attack_sword) blades[u.id] = wp; });
    const resize = () => {
      const r = box.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
      const devW = Math.max(1, r.width * dpr), devH = Math.max(1, r.height * dpr);
      const scale = Math.max(1, Math.floor(Math.min(devH / 150, devW / 360)));
      const w = Math.ceil(devW / scale), h = Math.ceil(devH / scale);
      cv.width = w; cv.height = h;
      cv.style.width = (w * scale) / dpr + "px"; cv.style.height = (h * scale) / dpr + "px";
      view = { w, h, scale };
      backdrop = drawBattleBackdrop(w, h);
      vig = makeCanvas(w, h);
      const v = vig.getContext("2d"), vg = v.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.hypot(w, h) * 0.55);
      vg.addColorStop(0, "rgba(8,5,18,0)"); vg.addColorStop(1, "rgba(8,5,18,0.55)"); v.fillStyle = vg; v.fillRect(0, 0, w, h);
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(box);
    const home = (u, w, h) => (u.side === "p" ? partySlots(w, h)[u.slot] : foeSlots(w, h)[u.slot]);
    const burst = (x, y, n, cols, sp = 1) => { for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, v = (10 + Math.random() * 38) * sp; parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 14, life: 0.35 + Math.random() * 0.4, max: 0.75, c: cols[i % cols.length] }); } };
    const shadow = (x, y, rx) => { ctx.fillStyle = "rgba(8,5,16,0.38)"; ctx.beginPath(); ctx.ellipse(x, y, rx, rx * 0.26, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "rgba(8,5,16,0.25)"; ctx.beginPath(); ctx.ellipse(x + 3, y, rx * 1.15, rx * 0.3, 0, 0, Math.PI * 2); ctx.fill(); };
    /* where a unit is drawn this frame, from its action */
    const pose = (u, w, h) => {
      const [hx, hy] = home(u, w, h); let x = hx, y = hy; const a = u.act;
      if (a && u.side === "p" && a.kind === "attack") {
        const tg = unitById(a.target), th = tg ? home(tg, w, h) : [hx + 60, hy];
        const tx = th[0] - 62 * (tg && tg.scale ? tg.scale : 1), ty = th[1] + 3;
        const tt = a.t; let f = tt < BTL.T_STEP ? tt / BTL.T_STEP : tt < BTL.T_STEP + BTL.T_ATK ? 1 : 1 - (tt - BTL.T_STEP - BTL.T_ATK) / BTL.T_RETURN;
        f = Math.max(0, Math.min(1, f)); f = f * f * (3 - 2 * f);
        x = hx + (tx - hx) * f; y = hy + (ty - hy) * f;
      } else if (a && u.side === "e") {
        const mv = a.move, stay = mv && (mv.shot || ["heal", "buff", "guard", "summon", "charge"].includes(mv.k));
        const tg = unitById(a.target) || B.living("p")[0];
        let th = tg ? home(tg, w, h) : [hx - 60, hy];
        if (mv && mv.k === "all") { const ps = partySlots(w, h).slice(0, B.allies().length); th = [ps.reduce((q, p) => q + p[0], 0) / ps.length, ps.reduce((q, p) => q + p[1], 0) / ps.length]; }
        if (stay) th = [hx + 30, hy];
        const tx = th[0] + 30, ty = th[1];
        const tt = a.t; let f = tt < BTL.T_FOE_LUNGE ? tt / BTL.T_FOE_LUNGE : tt < BTL.T_FOE_LUNGE + BTL.T_FOE_BITE ? 1 : 1 - (tt - BTL.T_FOE_LUNGE - BTL.T_FOE_BITE) / BTL.T_FOE_BACK;
        f = Math.max(0, Math.min(1, f)); f = f * f * (3 - 2 * f);
        x = hx + (tx - hx) * f; y = hy + (ty - hy) * f;
      }
      if (u.anim.n === "hurt" && !u.ko) x += (u.side === "p" ? -1 : 1) * Math.max(0, 1 - u.anim.t / 0.25) * 4;
      return [x, y];
    };
    /* tap-to-target: which living unit sits under a point on the canvas */
    hitRef.current = (cx, cy) => {
      const { w, h } = view; let best = null, bd = 1e9;
      for (const u of B.units) {
        if (u.ko) continue;
        const [px, py] = pose(u, w, h);
        let hw, top;
        if (u.side === "e") { const fr = foeSprite(u), sc = u.scale || 1; hw = (fr[0].width * sc) / 2 + 6; top = py - fr[0].height * sc - 4; }
        else { hw = 18; top = py - 64; }
        const inside = cx >= px - hw && cx <= px + hw && cy >= top && cy <= py + 8;
        const d = Math.hypot(cx - px, cy - (top + py) / 2);
        if ((inside || d < 34) && d < bd) { bd = d; best = u; }
      }
      return best;
    };
    let sizeTick = 0;
    const frame = (now) => {
      if ((++sizeTick & 31) === 0) { const r = box.getBoundingClientRect(), dpr = window.devicePixelRatio || 1; if (Math.abs(r.width * dpr - view.w * view.scale) > view.scale * 2 || Math.abs(r.height * dpr - view.h * view.scale) > view.scale * 2) resize(); }   // a missed resize (fold/unfold, rotation) never leaves the stage blank
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now; t += dt;
      if (B.units.length !== unitN) { unitN = B.units.length; setRev((x) => x + 1); }
      const { w, h } = view;
      /* sim runs while the screen is up and not paused by the result card */
      if (tipRef.current === null) B.step(dt);
      /* events -> floaters and particles */
      for (const e of B.events.splice(0)) {
        const u = unitById(e.id); if (!u) continue;
        if (typeof battleSfx === "function") battleSfx(e, u);
        const [px, py] = pose(u, w, h), top = py - (u.side === "p" ? 56 : 40 * (u.scale || 1));
        if (e.e === "dmg") {
          floaters.push({ x: px, y: top - 6, text: String(e.amt) + (e.weak ? "!" : ""), col: u.side === "p" ? "#ff9a8a" : e.weak ? "#ffb060" : e.kind === "magic" ? "#ffe08a" : "#fff0c0", t: 0, big: !!e.weak });
          if (e.weak) floaters.push({ x: px, y: top + 16, text: "Weak spot", col: "#ffd060", t: 0, small: true });
          else if (e.resist) floaters.push({ x: px, y: top + 16, text: "Resists", col: "#9cb0c8", t: 0, small: true });
          burst(px, top + 14, e.kind === "magic" ? 20 : 12, e.kind === "magic" && EL_COL[e.el] ? EL_COL[e.el] : [PAL.fireL, PAL.white], 1);
          if (u.side === "p") { shake.t = 0.25; shake.a = 3; } else if (u.hp <= 0) { shake.t = 0.18; shake.a = 2; }
        } else if (e.e === "heal") {
          floaters.push({ x: px, y: top, text: "+" + e.amt, col: "#a8e07a", t: 0 });
          for (let i = 0; i < 10; i++) parts.push({ x: px + (Math.random() - 0.5) * 20, y: py - 10 - Math.random() * 20, vx: 0, vy: -16 - Math.random() * 12, life: 0.7, max: 0.7, c: i % 2 ? "#a8e07a" : "#e0ffc8" });
        } else if (e.e === "phase") { floaters.push({ x: px, y: top - 12, text: "!", col: "#ff9a5a", t: 0 }); shake.t = 0.5; shake.a = 4; burst(px, top + 20, 30, ["#ff9a5a", "#ffe0a8", "#ffffff"], 1.5); logLines.push(e.text); if (logLines.length > 3) logLines.shift(); logT = t; }
        else if (e.e === "text") floaters.push({ x: px, y: top, text: e.text, col: "#e9d9b4", t: 0, small: true });
        else if (e.e === "guard") floaters.push({ x: px, y: top, text: "Guard", col: "#9cc8ff", t: 0, small: true });
        else if (e.e === "rupture") { floaters.push({ x: px, y: top - 8, text: "RUPTURE", col: "#ff7a5a", t: 0 }); shake.t = 0.35; shake.a = 4; burst(px, top + 20, 26, ["#ff7a5a", "#ffb040", "#fff0c0"], 1.4); }
        else if (e.e === "inhale") floaters.push({ x: px, y: top - 4, text: e.name, col: "#c8b8ff", t: 0, small: true });
        else if (e.e === "cast") floaters.push({ x: px, y: top - 2, text: e.label + "!", col: e.label === "Clean" ? "#ffe890" : "#d8ccb0", t: 0, small: true });
        else if (e.e === "ward") floaters.push({ x: px, y: top, text: "Ward -" + e.amt, col: "#9cc8ff", t: 0, small: true });
        else if (e.e === "warded") { floaters.push({ x: px, y: top, text: "Warded", col: "#9cc8ff", t: 0, small: true }); burst(px, py - 24, 14, EL_COL.force, 0.8); }
        else if (e.e === "infused") floaters.push({ x: px, y: top, text: "Infused", col: (EL_COL[e.el] || EL_COL.fire)[0], t: 0, small: true });
        else if (e.e === "scan") { floaters.push({ x: px, y: top - 2, text: "Read", col: "#a8c8ff", t: 0, small: true }); logLines.push(e.text); if (logLines.length > 3) logLines.shift(); logT = t; }
      }
      /* release window overlay follows the sim */
      const bw = B.window;
      if ((bw && (!winRef.current.w || winRef.current.w !== bw.uid)) || (!bw && winRef.current.w)) { winRef.current.w = bw ? bw.uid : null; setWin(bw ? { uid: bw.uid } : null); }
      if (bw && winRef.current.bar) { winRef.current.bar.style.left = Math.round((bw.t / BTL.WIN_DUR) * 100) + "%"; }
      /* menu follows the sim: open for whoever is ready */
      const rd = B.ready(), m = menuRef.current;
      if (B.phase === "fight") {
        if (m) { const cu = unitById(m.id); if (!cu || cu.ko || cu.gauge < 100 || cu.queued || cu.act || cu.cast) setMenu(null); }
        else if (rd.length) setMenu({ id: rd[0].id, stage: "cmd", pend: null });
      } else if (m) setMenu(null);
      if (B.phase !== "fight" && !doneRef.current) {
        const settled = B.units.every((u) => !u.act);
        if (!B.endT) B.endT = t;
        if (settled && t - B.endT > (B.phase === "won" ? 1.0 : B.phase === "fled" ? 0.5 : 1.4)) {
          doneRef.current = true;
          const res = B.result, ups = btlApply(G, res);
          if (res.phase === "fled") onEnd(res, ups, true); else setOver({ res, ups });
        }
      }
      /* ----- draw ----- */
      ctx.save();
      if (shake.t > 0) { shake.t -= dt; ctx.translate(Math.round((Math.random() - 0.5) * shake.a * 2), Math.round((Math.random() - 0.5) * shake.a)); }
      ctx.drawImage(backdrop, 0, 0);
      const items = [];
      for (const u of B.units) {
        const [px, py] = pose(u, w, h);
        if (u.side === "p") {
          const set = sets[u.id]; if (!set) continue;
          const A = set.anims, a = u.act; let img;
          if (u.ko) img = A.dead[Math.min(3, Math.floor(u.anim.t / 0.15))];
          else if (u.anim.n === "hurt") img = A.hurt[Math.min(3, Math.floor(u.anim.t / 0.1))];
          let blade = null;
          if (u.ko || u.anim.n === "hurt") { /* handled above */ }
          else if (a && a.kind === "attack") { const tt = a.t - BTL.T_STEP; img = tt < 0 ? A.idle[0] : tt < BTL.T_ATK ? A.attack[Math.min(9, Math.floor(tt / (BTL.T_ATK / 10)))] : A.idle[0];
            if (blades[u.id]) {   // the blade follows the hand through the whole swing, and out again as the fighter steps back
              const f = tt < 0 ? 0 : tt < BTL.T_ATK ? (tt / BTL.T_ATK) * 10 : 0, fade = tt < 0 ? Math.max(0, 1 + tt / 0.12) : tt < BTL.T_ATK ? 1 : Math.max(0, 1 - (tt - BTL.T_ATK) / 0.16);
              blade = { f, fade, id: blades[u.id], trail: tt > 0 && tt < BTL.T_ATK && f > 6.2 && f < 9.4 };
            } }
          else if (a && a.kind === "release") img = A.cast[Math.min(6, 3 + Math.floor(a.t / 0.1))];
          else if (u.cast) img = u.cast.wait ? A.cast[3] : A.cast[Math.floor(t * 6 + u.slot) % 3];
          else if (a && (a.kind === "item" || a.kind === "skill")) img = A.cast[Math.min(3, Math.floor(a.t / 0.2))];
          else if (u.guard || (a && a.kind === "defend")) img = A.hurt[0];
          else img = A.idle[Math.floor(t * 5 + u.slot * 2) % A.idle.length];
          items.push({ u, y: py, x: Math.round(px - set.anchor[0]), yy: Math.round(py - set.anchor[1] - 1), img, sx: px, blade });
        } else {
          const fr = foeSprite(u), a = u.act, sc = u.scale || 1;
          let img = fr[a && a.t < BTL.T_FOE_LUNGE + BTL.T_FOE_BITE ? 1 : 0];
          if (fr.idle) {
            const pick = (arr, i) => arr[Math.max(0, Math.min(arr.length - 1, i))];
            if (u.ko && fr.dead) img = pick(fr.dead, Math.floor(u.anim.t / 0.18));
            else if (u.anim.n === "hurt" && fr.hurt) img = pick(fr.hurt, Math.floor(u.anim.t / 0.1));
            else if (a && a.t < BTL.T_FOE_LUNGE + BTL.T_FOE_BITE) { const strip = (a.move && a.move.anim && fr[a.move.anim]) || (a.move && a.move.shot && (fr.cast || fr.shot)) || fr.attack; img = pick(strip, Math.floor(a.t / (BTL.T_FOE_LUNGE + BTL.T_FOE_BITE) * strip.length)); }
            else if (u.stunT > B.t && fr.stun) img = pick(fr.stun, Math.floor((t * 6) % fr.stun.length));
            else if (u.stunT > B.t) img = fr.hurt ? fr.hurt[0] : fr.idle[0];
            else if ((u.prot > 0 || u.charging) && fr.guard) img = fr.guard[Math.min(fr.guard.length - 1, 1)];
            else if (u.charging) img = fr.attack[0];
            else img = fr.idle[Math.floor(t * 5 + u.slot * 2) % fr.idle.length];
          }
          const bob = u.ko ? 0 : Math.sin(t * 2.1 + u.slot) * 0.9;
          items.push({ u, y: py, img, sc, x: Math.round(px - (img.width * sc) / 2), yy: Math.round(py - img.height * sc + 3 + bob + (fr.foot || 0) * sc), sx: px });
        }
      }
      items.sort((a, b) => a.y - b.y);
      for (const it of items) if (it.u.side === "e") refs.current.foeTop[it.u.id] = [it.sx, it.yy];
      for (const it of items) { const u = it.u; if (u.side === "p") shadow(it.sx - 3, it.y, u.ko ? 18 : 15); else if (!(u.ko && u.anim.t > 0.8)) shadow(it.sx, it.y + 1, it.img.width * it.sc * 0.4); }
      for (const it of items) {
        const u = it.u;
        if (u.side === "p") {
          if (u.gauge >= 100 && !u.ko && B.phase === "fight") { ctx.strokeStyle = `rgba(233,217,180,${0.45 + 0.35 * Math.sin(t * 7)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(it.sx - 3, it.y, 18, 5, 0, 0, Math.PI * 2); ctx.stroke(); }
          ctx.drawImage(it.img, it.x, it.yy);
          if (it.blade && it.blade.fade > 0) {
            const bl = it.blade, tint = SWORD_TINT[bl.id];
            if (bl.trail) for (const [df, al] of [[1.1, 0.14], [0.7, 0.22], [0.35, 0.34]]) { const g = swingPose(bl.f - df); ctx.globalAlpha = al; drawSwordOn(ctx, it.x + g[0], it.yy + g[1], g[2], ["#e3e8ee", "#ffffff"]); }
            const p0 = swingPose(bl.f); ctx.globalAlpha = bl.fade; drawSwordOn(ctx, it.x + p0[0], it.yy + p0[1], p0[2], tint); ctx.globalAlpha = 1;
          }
          if (u.cast) {
            const c = u.cast, el = EL_COL[c.spell.el] || EL_COL.force, f = c.wait ? 1 : Math.min(1, c.t / Math.max(0.01, c.spell.charge));
            for (let i = 0; i < 6; i++) { const an = t * 3 + i * 1.05, r = 20 * (1 - f * 0.45) + Math.sin(t * 5 + i) * 2; ctx.fillStyle = el[i % 3]; ctx.globalAlpha = 0.5 + 0.5 * f; ctx.fillRect(Math.round(it.sx - 3 + Math.cos(an) * r), Math.round(it.y - 26 + Math.sin(an) * r * 0.7), 2, 2); }
            ctx.globalAlpha = 1;
            const bx = Math.round(it.sx - 15), by = Math.round(it.y - 70);
            ctx.fillStyle = "#120d1c"; ctx.fillRect(bx - 1, by - 1, 32, 5); ctx.fillStyle = c.wait ? "#ffe890" : el[1]; ctx.fillRect(bx, by, Math.round(30 * f), 3);
          }
        } else {
          const ko = u.ko ? Math.min(1, u.anim.t / 0.8) : 0;
          ctx.globalAlpha = 1 - ko;
          const dw = it.img.width * it.sc, dh = it.img.height * it.sc * (1 - ko * 0.35);
          const dy = it.yy + it.img.height * it.sc - dh + ko * 4;
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(it.img, it.x, dy, dw, dh);
          if (BTL_FOES[u.key] && BTL_FOES[u.key].bow && !u.ko) {   // the bandit's bow, held out toward the party; the string draws back on a shot
            const a2 = u.act, pull = a2 && a2.move && a2.move.shot && a2.t < BTL.T_FOE_LUNGE ? a2.t / BTL.T_FOE_LUNGE : 0, bx = it.x + dw * 0.26, by = dy + dh * 0.5, r = dh * 0.32;
            ctx.strokeStyle = "#4a3020"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(bx + r * 0.55, by, r, Math.PI * 0.62, Math.PI * 1.38); ctx.stroke();
            ctx.strokeStyle = "#5e4630"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(bx + r * 0.55, by, r, Math.PI * 0.66, Math.PI * 1.34); ctx.stroke();
            const sx0 = bx + r * 0.55 + Math.cos(Math.PI * 0.62) * r, sy0 = by + Math.sin(Math.PI * 0.62) * r, sy1 = by - Math.sin(Math.PI * 0.62) * r, nock = sx0 + pull * 6;
            ctx.strokeStyle = "#cbbfa4"; ctx.beginPath(); ctx.moveTo(sx0, sy0); ctx.lineTo(nock, by); ctx.lineTo(sx0, sy1); ctx.stroke();
          }
          if (u.prot > 0 && !u.ko) { ctx.strokeStyle = `rgba(156,200,255,${0.35 + 0.2 * Math.sin(t * 5)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(it.sx, dy + dh * 0.55, dw * 0.42, dh * 0.5, 0, Math.PI * 0.6, Math.PI * 1.4); ctx.stroke(); }
          const pa = u.act;
          if (pa && pa.move && pa.move.proj && pa.t > 0.08 && pa.t < BTL.T_FOE_LUNGE) {   // a thrown thing crosses the field and lands on the hit
            const k = (pa.t - 0.08) / (BTL.T_FOE_LUNGE - 0.08), tgs = pa.move.k === "all" ? B.living("p") : [unitById(pa.target) || B.living("p")[0]];
            for (const tg of tgs) { if (!tg) continue;
              const [qx, qy] = pose(tg, w, h), sx0 = it.sx - 10, sy0 = dy + dh * 0.45, ex = qx + 4, ey = qy - 26, x = sx0 + (ex - sx0) * k, y = sy0 + (ey - sy0) * k - Math.sin(k * Math.PI) * (pa.move.proj === "arrow" ? 10 : 16);
              const P = pa.move.proj;
              if (P === "arrow") { const ang = Math.atan2(ey - sy0 - Math.cos(k * Math.PI) * 10 * Math.PI, ex - sx0); ctx.strokeStyle = "#d8ccb0"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - Math.cos(ang) * 10, y - Math.sin(ang) * 10); ctx.stroke(); ctx.fillStyle = "#e8e0d0"; ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 2, 2); }
              else { const col = P === "fire" ? ["#ffb040", "#ff6a2a", "#fff0c0"] : P === "bolt" ? ["#9cf0ff", "#4ab0d0", "#ffffff"] : P === "venom" ? ["#9ad050", "#5a8a2a", "#e0ffa0"] : ["#b080e0", "#6a3aa0", "#e8d0ff"];
                ctx.fillStyle = col[1]; ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = col[0]; ctx.beginPath(); ctx.arc(x, y, 2.6, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = col[2]; ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 2, 2);
                if (Math.random() < 0.6) parts.push({ x, y, vx: (Math.random() - 0.5) * 10, vy: -6 - Math.random() * 8, life: 0.3, max: 0.3, c: col[Math.floor(Math.random() * 3)] }); }
            }
          }
          if (u.anim.n === "hurt" && u.anim.t < 0.25) { ctx.globalAlpha = (1 - u.anim.t / 0.25) * 0.8; ctx.globalCompositeOperation = "lighter"; ctx.drawImage(it.img, it.x, dy, dw, dh); ctx.globalCompositeOperation = "source-over"; }
          ctx.globalAlpha = 1;
        }
      }
      /* markers: active hero and target hover */
      const mm = menuRef.current;
      const mark = (u, col) => { const [px, py] = pose(u, w, h), top = py - (u.side === "p" ? 62 : 44 * (u.scale || 1)) + Math.sin(t * 6) * 1.5; ctx.fillStyle = col; ctx.fillRect(Math.round(px) - 3, Math.round(top), 7, 1); ctx.fillRect(Math.round(px) - 2, Math.round(top) + 1, 5, 1); ctx.fillRect(Math.round(px) - 1, Math.round(top) + 2, 3, 1); ctx.fillRect(Math.round(px), Math.round(top) + 3, 1, 1); };
      if (mm && B.phase === "fight") {
        const mu = unitById(mm.id); if (mu) mark(mu, "#e9d9b4");
        if (mm.stage === "target") for (const u of B.units) {
          if (u.ko || (mm.pend.side === "p") !== (u.side === "p")) continue;
          const [px, py] = pose(u, w, h), top = py - (u.side === "p" ? 62 : 44 * (u.scale || 1));
          const on = u.id === hover.current, pulse = 0.5 + 0.5 * Math.sin(t * 7);
          ctx.strokeStyle = on ? "#ff7a6a" : `rgba(255,${u.side === "p" ? 230 : 140},${u.side === "p" ? 150 : 110},${0.35 + pulse * 0.45})`; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.ellipse(Math.round(px), Math.round(py + 1), 16 * (u.scale || 1), 5, 0, 0, Math.PI * 2); ctx.stroke();
          mark(u, on ? "#ff7a6a" : u.side === "p" ? "#a8e07a" : "#ffb060");
        }
      }
      /* beams and slashes */
      for (const u of B.units) {
        const a = u.act; if (!a || u.side !== "p") continue;
        const tg = unitById(a.target); if (!tg) continue;
        const [sx, sy] = pose(u, w, h), [tx, ty] = pose(tg, w, h);
        if (a.kind === "release" && a.t > 0.05 && a.t < 0.5) {
          const sp = a.spell, col = EL_COL[sp.el] || EL_COL.force;
          const targets = sp.target === "foes" ? B.living("e") : sp.target === "allies" ? B.living("p") : [tg];
          for (const t2 of targets) {
            const [tx2, ty2] = pose(t2, w, h), x0 = sx + 22, y0 = sy - 38, x1 = tx2 - 2, y1 = ty2 - 22 * (t2.scale || 1) - 8;
            if (sp.form === "ward" || sp.form === "infusion" || sp.k === "heal") { for (let i = 0; i < 8; i++) { ctx.fillStyle = col[i % 3]; ctx.fillRect(Math.round(tx2 + Math.cos(i + t * 8) * 14), Math.round(ty2 - 28 + Math.sin(i * 1.3 + t * 8) * 18), 2, 2); } continue; }
            const n = sp.form === "radial cloud" ? 10 : 26, spread = sp.form === "radial cloud" ? 14 : 3;
            for (let i = 0; i < n; i++) { const k = i / (n - 1), jx = (Math.random() - 0.5) * spread, jy = (Math.random() - 0.5) * spread; ctx.fillStyle = col[i % 3]; const big = sp.form === "major" || sp.form === "beam" ? 3 : 2; ctx.fillRect(Math.round(x0 + (x1 - x0) * (sp.form === "projectile" ? Math.min(1, (a.t - 0.05) / 0.22) : k) + jx), Math.round(y0 + (y1 - y0) * (sp.form === "projectile" ? Math.min(1, (a.t - 0.05) / 0.22) : k) + jy), big, big); if (sp.form === "projectile") break; }
          }
        }
        if (a.kind === "attack" && a.t > BTL.T_STEP + 0.45 && a.t < BTL.T_STEP + 0.72) {
          const k = (a.t - BTL.T_STEP - 0.45) / 0.27;
          for (let i = 0; i < 16; i++) { const an = -1.3 + (i / 15) * 2.6 + k * 0.4; ctx.fillStyle = i % 3 ? "#ffe08a" : "#fff"; ctx.globalAlpha = 1 - k * 0.6; ctx.fillRect(Math.round(sx + 22 + Math.cos(an) * 20), Math.round(sy - 30 + Math.sin(an) * 22), 2, 2); }
          ctx.globalAlpha = 1;
        }
      }
      for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.life -= dt; if (p.life <= 0) { parts.splice(i, 1); continue; } p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 40 * dt; ctx.globalAlpha = Math.max(0, p.life / p.max); ctx.fillStyle = p.c; ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, 2); }
      ctx.globalAlpha = 1;
      for (let i = floaters.length - 1; i >= 0; i--) { const f = floaters[i]; f.t += dt; if (f.t > 1.1) { floaters.splice(i, 1); continue; } ctx.globalAlpha = Math.min(1, (1.1 - f.t) * 2.2);
        const sc = f.small ? 1 : f.big ? 4 : 3, pop = f.small ? 0 : Math.max(0, 0.12 - f.t) * 40, fx = Math.round(f.x), fy = Math.round(f.y - f.t * 22 - pop);
        if (!f.small) for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]]) drawText(ctx, f.text, fx + ox * 2, fy + oy * 2, "#140c14", sc, "center", null);   // an ink outline all round
        drawText(ctx, f.text, fx, fy, f.col, sc, "center", f.small ? "#2a1018" : null); }
      ctx.globalAlpha = 1;
      for (let i = 0; i < 3; i++) {
        const mx = ((t * (3 + i * 2) + i * 130) % (w + 200)) - 200, my = h * (0.5 + i * 0.12);
        const mg = ctx.createLinearGradient(mx, 0, mx + 200, 0);
        mg.addColorStop(0, "rgba(255,190,140,0)"); mg.addColorStop(0.5, "rgba(255,190,140,0.07)"); mg.addColorStop(1, "rgba(255,190,140,0)");
        ctx.fillStyle = mg; ctx.fillRect(mx, my, 200, h * 0.09);
      }
      for (const mo of motes) { const px = ((mo.x + t * 0.004 * mo.s * 6) % 1) * w, py = ((mo.y - t * 0.012 * mo.s * 3 + 1) % 1) * h; ctx.globalAlpha = 0.25 + 0.4 * Math.abs(Math.sin(t * mo.s * 3 + mo.ph)); ctx.fillStyle = "#ffe0a8"; ctx.fillRect(Math.round(px), Math.round(py), 1, 1); }
      ctx.globalAlpha = 1;
      ctx.restore();
      overcastGrade(ctx, w, h, 1);
      ctx.drawImage(vig, 0, 0);
      /* DOM HUD */
      const R = refs.current;
      for (const u of B.units) {
        if (u.side === "e") { const el = R.foeHp[u.id]; if (el) { el.style.width = Math.round((u.hp / u.maxHp) * 100) + "%"; el.parentNode.parentNode.dataset.ko = u.ko ? "1" : "0";
          if (B.act2) {   // out in the wider world a foe's health is a guess until Sens reads it
            const box = el.parentNode.parentNode, f = u.hp / u.maxHp, word = u.ko ? "Down" : u.read ? `${u.hp}/${u.maxHp}` : f > 0.99 ? "Unhurt" : f > 0.6 ? "Scratched" : f > 0.3 ? "Wounded" : "Failing";
            if (box.dataset.read !== (u.read ? "1" : "0")) box.dataset.read = u.read ? "1" : "0";
            const cw = R.foeCond[u.id]; if (cw && cw.textContent !== word) cw.textContent = word;
          } const bd = R.foeBadge[u.id]; if (bd) { const st = u.stunT > B.t ? "Stunned" : u.sleepT > B.t ? "Asleep" : u.charging ? "Winding up" : u.prot > 0 ? "Guarding" : u.slowT > B.t ? "Slowed" : u.markT > B.t ? "Marked" : ""; if (bd.textContent !== st) bd.textContent = st; } } }
        else {
          if (R.hp[u.id]) R.hp[u.id].textContent = u.hp + "/" + u.maxHp;
          if (R.mp[u.id]) R.mp[u.id].textContent = (u.maxMp ? (btlCaster(u.key) ? "Breath " : "Stamina ") + u.mp + "/" + u.maxMp : "") + (u.ward > 0 ? " · Ward " + u.ward : "") + (u.infuse ? " · Infused" : "") + (u.dot ? (u.dot.k === "poison" ? " · Poisoned" : " · Bleeding") : "");
          if (R.hpBar[u.id]) { R.hpBar[u.id].style.width = Math.round((u.hp / u.maxHp) * 100) + "%"; R.hpBar[u.id].dataset.low = u.hp / u.maxHp < 0.3 ? "1" : "0"; }
          const b = R.atb[u.id]; if (b) { b.style.width = Math.round(u.gauge) + "%"; b.dataset.full = u.gauge >= 100 ? "1" : "0"; }
          if (R.row[u.id]) { R.row[u.id].dataset.ko = u.ko ? "1" : "0"; R.row[u.id].dataset.sel = menuRef.current && menuRef.current.id === u.id ? "1" : "0"; }
        }
      }
      if (R.log) { const txt = t - logT < 5 ? logLines.join("  |  ") : ""; if (R.log.textContent !== txt) R.log.textContent = txt; }
      /* V93: who acts next, the foes' plates over their heads, and status icons */
      if (t - R.orderT > 0.2) {
        R.orderT = t;
        const est = B.units.filter((u) => !u.ko).map((u) => {
          if (u.act || u.queued || u.cast) return [-1, u];
          const rate = Math.max(0.01, (u.spd || 1) * BTL.RATE * (u.slowT > B.t ? 0.5 : 1) * (u.side === "e" ? BTL.FOE_SLOW : 1));
          let tt = u.gauge >= 100 ? 0 : (100 - u.gauge) / rate; if (u.stunT > B.t) tt += u.stunT - B.t; if (u.sleepT > B.t) tt += u.sleepT - B.t;
          return [tt, u];
        }).sort((a, b) => a[0] - b[0]).slice(0, 6);
        const key = est.map((x) => x[1].id).join(",");
        if (R.order && key !== R.orderKey) { R.orderKey = key; R.order.innerHTML = '<span class="bo-lb">Next</span>' + est.map(([, u], i) => `<i class="bo-chip" data-side="${u.side}" data-now="${i === 0 ? 1 : 0}" title="${u.name || ""}" style="background-image:url(${btlChip(u)})"></i>`).join(""); }
        for (const u of B.units) {
          const icons = btlStatusIcons(u, B), html = icons.map(([g, c, tl]) => `<b style="background:${c}" title="${tl}">${g}</b>`).join("");
          const el = u.side === "e" ? R.foeSt[u.id] : R.heroSt[u.id];
          if (el && el.dataset.k !== html) { el.dataset.k = html; el.innerHTML = html; }
        }
      }
      { const cvE = cvRef.current, kx = cvE ? cvE.clientWidth / w : 1, placed = [];
        if (cvE) for (const u of [...B.units].filter((x) => x.side === "e").sort((p, q) => (R.foeTop[q.id] || [0, 0])[1] - (R.foeTop[p.id] || [0, 0])[1])) {
          const pl = R.foePlate[u.id], at = R.foeTop[u.id]; if (!pl || !at) continue;
          const pw = pl.offsetWidth, ph = pl.offsetHeight;
          let lx = Math.round(cvE.offsetLeft + at[0] * kx - pw / 2), ly = Math.round(cvE.offsetTop + at[1] * kx - ph - 4);
          lx = Math.max(4, Math.min(cvE.offsetLeft + cvE.clientWidth - pw - 4, lx)); ly = Math.max(58, ly);
          for (let pass = 0; pass < 4; pass++) {   // plates that would cover each other stack upward instead
            const hit = placed.find((o) => lx < o[0] + o[2] + 3 && o[0] < lx + pw + 3 && ly < o[1] + o[3] + 3 && o[1] < ly + ph + 3);
            if (!hit) break; ly = hit[1] - ph - 4; if (ly < 58) { ly = 58; lx = hit[0] + hit[2] + 6; }
          }
          placed.push([lx, ly, pw, ph]);
          const L = lx + "px", T = ly + "px"; if (pl.style.left !== L) pl.style.left = L; if (pl.style.top !== T) pl.style.top = T;
        } }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    try { window.__battle = B; } catch (e) { /* ignore */ }
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  /* tapping the battlefield: pick a target, or attack a foe straight from the command menu */
  const onStageTap = (e) => {
    const cv = cvRef.current, f = hitRef.current; if (!cv || !f || B.phase !== "fight") return;
    const r = cv.getBoundingClientRect();
    const u = f(((e.clientX - r.left) / r.width) * cv.width, ((e.clientY - r.top) / r.height) * cv.height);
    if (!u) return;
    const m = menuRef.current;
    if (m && m.stage === "target") { if ((m.pend.side === "p") === (u.side === "p")) pickTarget(u.id); return; }
    if (m && m.stage === "cmd" && u.side === "e") { choose({ type: "attack", target: u.id }); return; }
    if (!m && u.side === "p" && u.gauge >= 100 && !u.queued && !u.act && !u.cast) setMenu({ id: u.id, stage: "cmd", pend: null });
  };
  const mu = menu ? B.by(menu.id) : null;
  const heroes = B.allies(), foeUnits = B.foes();
  const known = B.spellsKnown();
  const hotSpells = (G.hotbar || []).filter(Boolean).map((id) => weaveSpell(...id.split("-"))).filter((x) => x.ok);
  const canCast = (sp) => !!mu && mu.mp >= sp.cost;
  const itemList = Object.keys(BTL_ITEMS).filter((k) => (B.items[k] || 0) > 0);
  const targets = menu && menu.stage === "target" ? (menu.pend.side === "p" ? heroes.filter((u) => !u.ko) : foeUnits.filter((u) => !u.ko)) : [];
  return (
    <div className="dz-battle" role="dialog" aria-label="Battle">
      <div className="dz-bstage" ref={boxRef}><canvas ref={cvRef} className="dz-bcv" onPointerDown={onStageTap} /></div>
      <div className="dz-border dz-frame" aria-label="Turn order" style={over ? { display: "none" } : undefined} ref={(el) => { refs.current.order = el; }} />
      <div className="dz-btop nb" style={over ? { display: "none" } : undefined}>
        {foeUnits.map((u) => (
          <div className="dz-bfoe dz-frame" key={u.id} data-ko="0" data-read={B.act2 ? "0" : "1"} data-veil={B.act2 ? "1" : "0"} ref={(el) => { refs.current.foePlate[u.id] = el; }}>
            <b>{u.name}</b><span>Lv {u.lv}</span><span className="dz-bst" ref={(el) => { refs.current.foeSt[u.id] = el; }} /><em className="dz-bbadge" ref={(el) => { refs.current.foeBadge[u.id] = el; }} />
            {B.act2 ? <em className="dz-bcond" ref={(el) => { refs.current.foeCond[u.id] = el; }}>Unhurt</em> : null}
            <div className="dz-bhp"><i ref={(el) => { refs.current.foeHp[u.id] = el; }} style={{ width: "100%" }} /></div>
          </div>
        ))}
      </div>
      <div className="dz-blog" ref={(el) => { refs.current.log = el; }} />
      {win ? (
        <div className="dz-brel dz-frame" id="dz-brel">
          <div className="dz-brel-t">Release · {B.by(win.uid) ? B.by(win.uid).cast && B.by(win.uid).cast.spell.name : ""}</div>
          <div className="dz-brel-bar"><i className="dz-brel-ok" style={{ left: BTL.WIN_OK[0] * 100 + "%", width: (BTL.WIN_OK[1] - BTL.WIN_OK[0]) * 100 + "%" }} /><i className="dz-brel-sw" style={{ left: BTL.WIN_SWEET[0] * 100 + "%", width: (BTL.WIN_SWEET[1] - BTL.WIN_SWEET[0]) * 100 + "%" }} /><b ref={(el) => { winRef.current.bar = el; }} /></div>
          <div className="dz-brel-h">Tap when the marker is in the gold</div>
          <button className="dz-act" id="dz-release" onPointerDown={(e) => { e.preventDefault(); B.release(win.uid); }}>Release</button>
        </div>
      ) : null}
      <div className="dz-bpanel">
        <div className="dz-bcmd dz-frame" id="dz-bcmd" data-stage={menu ? menu.stage : "none"}>
          {!menu ? <div className="dz-bwait">{B.phase === "fight" ? "Readying…" : B.phase === "won" ? "Victory" : B.phase === "lost" ? "Fallen" : "Away"}</div> : null}
          {menu && menu.stage === "cmd" ? (
            <>
              <div className="dz-bwho">{mu ? mu.name : ""} <i>· tap an enemy to attack it</i></div>
              <button className="dz-bc" id="dz-c-attack" data-g="⚔" onClick={() => pickCmd("attack")}>Attack</button>
              {mu && btlCaster(mu.key)
                ? <button className="dz-bc" id="dz-c-magic" data-g="✦" disabled={!magic || !known.length} onClick={() => pickCmd("magic")}>Cast</button>
                : <button className="dz-bc" id="dz-c-skill" data-g="✦" disabled={!(mu && (BTL_ABILITIES[mu.key] || []).length)} onClick={() => pickCmd("skill")}>Abilities</button>}
              <button className="dz-bc" id="dz-c-item" data-g="⚗" disabled={!itemList.length} onClick={() => pickCmd("item")}>Item</button>
              <button className="dz-bc" id="dz-c-defend" data-g="⛨" onClick={() => pickCmd("defend")}>Defend</button>
              <button className="dz-bc" id="dz-c-flee" data-g="↶" disabled={!canFlee} onClick={() => pickCmd("flee")}>Flee</button>
            </>
          ) : null}
          {menu && menu.stage === "skill" && mu ? (
            <>
              <div className="dz-bwho">{mu.name} · Abilities <i>· Stamina {mu.mp}/{mu.maxMp}</i></div>
              {(BTL_ABILITIES[mu.key] || []).map((ab) => <button key={ab.id} className="dz-bc" id={`dz-k-${ab.id}`} disabled={mu.mp < ab.cost} title={ab.desc} onClick={() => pickSkill(ab)}>{ab.name} <small>{ab.cost} St · {ab.target === "foes" ? "all foes" : ab.target === "allies" ? "the party" : ab.target === "self" ? "self" : "one foe"}</small></button>)}
              <button className="dz-bc dz-back" id="dz-c-back" onClick={back}>Back</button>
            </>
          ) : null}
          {menu && menu.stage === "spell" ? (
            <>
              <div className="dz-bwho">Old Tongue</div>
              {hotSpells.map((sp, i) => <button key={sp.id} className="dz-bc" id={`dz-s-${sp.id}`} disabled={!canCast(sp)} title={sp.desc} onClick={() => pickSpell(sp)}>{sp.name} <small>{sp.cost} Br · {sp.charge ? sp.charge.toFixed(1) + "s" : "instant"}</small></button>)}
              <button className="dz-bc" id="dz-c-weave" onClick={() => setMenu({ ...menuRef.current, stage: "root" })}>Weave…</button>
              <button className="dz-bc dz-back" id="dz-c-back" onClick={back}>Back</button>
            </>
          ) : null}
          {menu && menu.stage === "root" ? (
            <>
              <div className="dz-bwho">Root</div>
              {G.words.r.filter((r) => OT_EFFECT[r]).map((r) => <button key={r} className="dz-bc" id={`dz-r-${r}`} onClick={() => pickRoot(r)}>{r} <small>{rootInfo(r).meaning}</small></button>)}
              <button className="dz-bc dz-back" id="dz-c-back" onClick={back}>Back</button>
            </>
          ) : null}
          {menu && menu.stage === "suf" ? (
            <>
              <div className="dz-bwho">{menu.root}…</div>
              {G.words.s.map((sf) => { const sp = weaveSpell(menu.root, sf); if (!sp.ok) return null; return <button key={sf} className="dz-bc" id={`dz-f-${sf}`} disabled={!canCast(sp)} title={sp.desc} onClick={() => pickSpell(sp)}>{sp.name} <small>{sp.cost} Br · {sp.charge ? sp.charge.toFixed(1) + "s" : "instant"}</small></button>; })}
              <button className="dz-bc dz-back" id="dz-c-back" onClick={back}>Back</button>
            </>
          ) : null}
          {menu && menu.stage === "item" ? (
            <>
              <div className="dz-bwho">Items</div>
              {itemList.map((k) => <button key={k} className="dz-bc" id={`dz-i-${k}`} onClick={() => pickItem(k)}>{BTL_ITEMS[k].name} <small>×{B.items[k]} · {btlItemText(k, B.act2)}</small></button>)}
              <button className="dz-bc dz-back" id="dz-c-back" onClick={back}>Back</button>
            </>
          ) : null}
          {menu && menu.stage === "target" ? (
            <>
              <div className="dz-bwho">{menu.pend.side === "p" ? "Tap an ally, or pick below" : "Tap an enemy, or pick below"}</div>
              {targets.map((u) => (
                <button key={u.id} className="dz-bc" id={`dz-t-${u.id}`} onPointerEnter={() => { hover.current = u.id; }} onFocus={() => { hover.current = u.id; }} onClick={() => pickTarget(u.id)}>{u.name}</button>
              ))}
              <button className="dz-bc dz-back" id="dz-c-back" onClick={back}>Back</button>
            </>
          ) : null}
        </div>
        <div className="dz-bparty dz-frame">
          {heroes.map((u) => (
            <div className="dz-brow" key={u.id} data-sel="0" data-ko="0" ref={(el) => { refs.current.row[u.id] = el; }}
              onClick={() => { if (B.phase === "fight" && u.gauge >= 100 && !u.ko && !u.queued && !u.act) setMenu({ id: u.id, stage: "cmd", pend: null }); }}>
              <div className="dz-bchip"><PixelImage source={getPortrait(u.look || { chibi: u.key === "companion" ? "companion" : (CHIBI_MAP[u.key] || u.key) })} scale={0.7} /></div>
              <div className="dz-binfo">
                <div className="dz-bname"><b>{u.name}</b><small>Lv {u.lv}</small><span ref={(el) => { refs.current.hp[u.id] = el; }}>{u.hp}/{u.maxHp}</span></div>
                <div className="dz-bhp"><i ref={(el) => { refs.current.hpBar[u.id] = el; }} data-low="0" /></div>
                <div className="dz-batb"><i ref={(el) => { refs.current.atb[u.id] = el; }} /></div>
                <div className="dz-bmp" ref={(el) => { refs.current.mp[u.id] = el; }} /><span className="dz-bst" ref={(el) => { refs.current.heroSt[u.id] = el; }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      {tip !== null ? (
        <div className="dz-mgover" id="dz-btip">
          <div className="dz-mgcard dz-frame dz-btipcard">
            <div className="dz-ptitle">{tip === 1 ? "Fighting with the Old Tongue" : "How battle works"}</div>
            <ul>
              <li>Each fighter has a gauge. When yours is full, the command tiles light up.</li>
              <li><b>Tap an enemy</b> to strike it, or choose a command below.</li>
              {tip === 1 ? <li><b>Cast</b> spends Breath and weaves for a moment. <b>Getting hit while weaving tears the spell (Rupture).</b> Cast when the beasts have just acted.</li> : <li><b>Defend</b> halves the next blow. <b>Item</b> uses a poultice. <b>Flee</b> may fail.</li>}
              {tip === 1 ? <li>When the Release bar appears, tap <b>Release</b> with the marker in the gold for a Clean, strong spell.</li> : null}
              {tip === 1 ? <li>Wolves fear <b>fire</b> and <b>light</b>. More in Menu → How magic works.</li> : null}
            </ul>
            <button className="dz-act" id="dz-btip-ok" onClick={() => { G.flags = G.flags || {}; if (tip === 1) G.flags.tip_btl = true; G.flags.tip_btl0 = true; setTip(null); }}>Fight</button>
          </div>
        </div>
      ) : null}
      {over ? (
        <div className="dz-mgover" id="dz-bover">
          <div className="dz-mgcard dz-frame" style={{ padding: "18px 22px" }}>
            {over.res.phase === "won" ? (
              <div className="bv">
                <div className="dz-ptitle bv-h">Victory</div>
                <div className="bv-sub">{foeUnits.length === 1 ? foeUnits[0].name + " beaten" : foeUnits.length + " foes beaten"}</div>
                <div className="dz-reward" style={{ display: "none" }}><span>+{over.res.xp} XP</span>{over.res.coins ? <span>+{over.res.coins} coppers</span> : null}</div>
                <div className="bv-xp">
                  {heroes.map((u) => {
                    const r = G.party && G.party[u.key], up = over.ups.filter((x) => x.key === u.key).pop(), mem = (over.res.members || []).find((m) => m.key === u.key), down = mem && mem.ko;
                    const need = r && typeof BTL_XP_FOR === "function" ? BTL_XP_FOR(r.lv) : 0, k = r && need ? Math.min(1, r.xp / need) : 0;
                    return <div className="bv-row" key={u.id}>
                      <div className="bv-face"><PixelImage source={getPortrait(u.look || { chibi: u.key === "companion" ? "companion" : (CHIBI_MAP[u.key] || u.key) })} scale={0.62} /></div>
                      <span className="bv-n">{u.name}</span>
                      <div className="bv-bar"><i style={{ width: Math.round(k * 100) + "%" }} data-up={up ? "1" : "0"} /></div>
                      <span className="bv-v" data-up={up ? "1" : "0"}>{down ? "down" : up ? `Level ${up.lv}!` : `+${Math.round(over.res.xp / Math.max(1, (over.res.members || []).filter((m) => !m.ko).length))} xp`}</span>
                    </div>;
                  })}
                </div>
                <div className="bv-loot">
                  {Object.keys(over.res.loot).map((k) => <div className="bv-item" key={k} title={(BTL_ITEMS[k] || ITEMS[k] || { name: k }).name}><ItemIcon id={k} size={32} /><span>{over.res.loot[k] > 1 ? over.res.loot[k] + " × " : ""}{BTL_ITEMS[k] ? BTL_ITEMS[k].name : ITEMS[k] ? ITEMS[k].name : k}</span></div>)}
                  {over.res.coins ? <div className="bv-item" data-k="coin"><b>◉</b><span>{over.res.coins} coppers</span></div> : null}
                  {!Object.keys(over.res.loot).length && !over.res.coins ? <div className="bv-none">Nothing worth taking.</div> : null}
                </div>
                {over.ups.map((u, i) => <div key={i} className="dz-lvup" style={{ display: "none" }}>{(u.key === "wren" && G && G.name) || BTL_PARTY[u.key].name} reached level {u.lv}</div>)}
              </div>
            ) : (
              <>
                <div className="dz-ptitle">You fall</div>
                <div>The world goes grey at the edges.</div>
              </>
            )}
            <button className="dz-act" id="dz-battle-done" onClick={() => onEnd(over.res, over.ups, false)}>Continue</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
