
/* ------------------------------------------------------------------ */
/* Interior ground tiles                                               */
/* ------------------------------------------------------------------ */
function paintFloor(x, v) {
  x.fillStyle = mix(PAL.floorD, PAL.ink, 0.4); x.fillRect(0, 0, 16, 16);
  for (let r = 0; r < 4; r++) {
    const y = r * 4, h = hash2(v + r * 3, r);
    const tone = h % 3;
    const base = tone === 0 ? PAL.floor : tone === 1 ? mix(PAL.floor, PAL.floorL, 0.4) : mix(PAL.floor, PAL.floorD, 0.45);
    x.fillStyle = base; x.fillRect(0, y, 16, 3);
    x.fillStyle = mix(base, PAL.white, 0.1); x.fillRect(0, y, 16, 1);
    x.globalAlpha = 0.55; x.fillStyle = PAL.floorD;
    x.fillRect((h >> 3) % 9, y + 1, 5 + (h % 4), 1);
    x.fillRect((h >> 5) % 11, y + 2, 4, 1);
    x.globalAlpha = 1;
    const off = (hash2(v + 11, r) % 12) + 2;
    x.fillStyle = mix(PAL.floorD, PAL.ink, 0.5); x.fillRect(off, y, 1, 3);
    if (h % 7 === 0) { x.fillStyle = PAL.floorD; x.fillRect((off + 6) % 14 + 1, y + 1, 2, 1); x.fillStyle = mix(PAL.floorD, PAL.ink, 0.4); x.fillRect((off + 6) % 14 + 1, y + 1, 1, 1); }
  }
}

function paintStoneFloor(x, v) {
  x.fillStyle = PAL.stone; x.fillRect(0, 0, 16, 16);
  x.fillStyle = PAL.stoneD;
  const o = v % 2 ? 0 : 8;
  x.fillRect(0, 7, 16, 1); x.fillRect(0, 15, 16, 1);
  x.fillRect(o, 0, 1, 7); x.fillRect((o + 8) % 16, 8, 1, 7);
  x.fillStyle = PAL.stoneL; x.fillRect(o + 1, 1, 3, 1); x.fillRect(((o + 8) % 16) + 1, 9, 3, 1);
  if (v % 3 === 0) { x.fillStyle = PAL.stoneD; x.fillRect(4, 11, 2, 1); }
}

function paintWallUpper(x, v, win, night) {
  x.fillStyle = PAL.plaster; x.fillRect(0, 0, 16, 16);
  const rnd = mulberry32(v * 97 + 1);
  for (let i = 0; i < 6; i++) {
    x.fillStyle = rnd() < 0.5 ? PAL.plasterD : PAL.plasterL;
    x.fillRect((rnd() * 16) | 0, 3 + ((rnd() * 12) | 0), 1, 1);
  }
  x.fillStyle = PAL.woodD; x.fillRect(0, 0, 16, 2);
  x.fillStyle = PAL.wood; x.fillRect(0, 2, 16, 1);
  x.fillStyle = PAL.plasterD; x.fillRect(0, 15, 16, 1);
  if (v % 3 === 0) {
    x.fillStyle = PAL.wood; x.fillRect(0, 0, 2, 16);
    x.fillStyle = PAL.woodD; x.fillRect(2, 0, 1, 16);
  }
  if (win) {
    x.fillStyle = PAL.woodD; x.fillRect(3, 4, 10, 9);
    x.fillStyle = night ? PAL.glassN : PAL.glass; x.fillRect(4, 5, 8, 7);
    x.fillStyle = night ? PAL.night : PAL.foam; x.fillRect(4, 5, 2, 2);
    x.fillStyle = PAL.woodD; x.fillRect(7, 5, 2, 7); x.fillRect(4, 8, 8, 1);
    x.fillStyle = PAL.woodL; x.fillRect(2, 13, 12, 1);
  }
}

function paintWallLower(x) {
  x.fillStyle = PAL.wood; x.fillRect(0, 0, 16, 16);
  x.fillStyle = PAL.woodL; x.fillRect(0, 0, 16, 2);
  x.fillStyle = PAL.woodD; x.fillRect(0, 2, 16, 1);
  x.fillRect(2, 4, 12, 1); x.fillRect(2, 12, 12, 1); x.fillRect(2, 4, 1, 9); x.fillRect(13, 4, 1, 9);
  x.fillStyle = PAL.woodL; x.fillRect(3, 5, 10, 1);
  x.fillStyle = PAL.woodD; x.fillRect(0, 14, 16, 2);
  x.fillStyle = PAL.ink; x.fillRect(0, 15, 16, 1);
}

function paintVoid(x, mask) {
  x.fillStyle = PAL.ink; x.fillRect(0, 0, 16, 16);
  x.fillStyle = PAL.shadow;
  if (mask & E) x.fillRect(13, 0, 3, 16);
  if (mask & W) x.fillRect(0, 0, 3, 16);
  if (mask & N) x.fillRect(0, 0, 16, 3);
  x.fillStyle = PAL.woodD;
  if (mask & E) x.fillRect(15, 0, 1, 16);
  if (mask & W) x.fillRect(0, 0, 1, 16);
  if (mask & N) x.fillRect(0, 0, 16, 1);
}

function paintMat(x, v) {
  paintFloor(x, v);
  x.fillStyle = PAL.rugD; x.fillRect(1, 1, 14, 14);
  x.fillStyle = PAL.rug; x.fillRect(2, 2, 12, 12);
  x.fillStyle = PAL.rugL;
  for (let i = 3; i < 13; i += 2) { x.fillRect(i, 3, 1, 1); x.fillRect(i, 12, 1, 1); }
  x.fillRect(7, 6, 2, 1); x.fillRect(6, 7, 4, 1); x.fillRect(7, 8, 2, 1);
}

function paintRug(x, mask, v) {
  x.fillStyle = PAL.rug; x.fillRect(0, 0, 16, 16);
  x.fillStyle = PAL.rugD;
  if (mask & N) x.fillRect(0, 0, 16, 2);
  if (mask & S) x.fillRect(0, 14, 16, 2);
  if (mask & W) x.fillRect(0, 0, 2, 16);
  if (mask & E) x.fillRect(14, 0, 2, 16);
  x.fillStyle = PAL.rugL;
  if (mask & N) for (let i = 1; i < 16; i += 3) x.fillRect(i, 3, 1, 1);
  if (mask & S) for (let i = 1; i < 16; i += 3) x.fillRect(i, 12, 1, 1);
  if (mask & W) for (let i = 1; i < 16; i += 3) x.fillRect(3, i, 1, 1);
  if (mask & E) for (let i = 1; i < 16; i += 3) x.fillRect(12, i, 1, 1);
  if (v % 2 === 0) { x.fillRect(7, 5, 2, 1); x.fillRect(6, 6, 4, 4); x.fillRect(7, 10, 2, 1); x.fillStyle = PAL.rugD; x.fillRect(7, 7, 2, 2); }
}

function paintCounter(x, mask) {
  x.fillStyle = PAL.woodL; x.fillRect(0, 0, 16, 9);
  x.fillStyle = PAL.pathL; x.fillRect(0, 0, 16, 1);
  x.fillStyle = PAL.wood; x.fillRect(2, 3, 6, 1); x.fillRect(9, 6, 5, 1);
  x.fillStyle = PAL.wood; x.fillRect(0, 9, 16, 7);
  x.fillStyle = PAL.woodD; x.fillRect(0, 9, 16, 1); x.fillRect(0, 15, 16, 1); x.fillRect(7, 10, 1, 5);
  x.fillStyle = PAL.woodL; x.fillRect(2, 11, 4, 1); x.fillRect(9, 11, 4, 1);
  x.fillStyle = PAL.ink;
  if (mask & W) x.fillRect(0, 0, 1, 16);
  if (mask & E) x.fillRect(15, 0, 1, 16);
}

function paintBarricade(x, v) {
  paintPath(x, 0, v);
  const g = new Grid(16, 16);
  g.rect(2, 4, 2, 11, PAL.woodD); g.rect(12, 4, 2, 11, PAL.woodD);
  g.rect(1, 6, 14, 2, PAL.woodL); g.rect(1, 10, 14, 2, PAL.woodL);
  for (let i = 0; i < 10; i++) { g.set(3 + i, 5 + Math.floor(i * 0.8), PAL.flowerR); }
  g.rect(1, 6, 14, 1, PAL.pathL);
  g.outline().draw(x);
}

/* ------------------------------------------------------------------ */
/* Furniture and props                                                 */
/* ------------------------------------------------------------------ */
function drawBed(v) {
  const c = CLOTHS[v] || CLOTHS[0];
  const g = new Grid(16, 32);
  g.rect(1, 0, 14, 6, PAL.wood); g.rect(1, 0, 14, 1, PAL.woodL); g.rect(1, 0, 2, 6, PAL.woodD); g.rect(13, 0, 2, 6, PAL.woodD);
  g.rect(2, 6, 12, 23, PAL.paper);
  g.rect(3, 6, 10, 5, PAL.white); g.rect(3, 10, 10, 1, PAL.parch); g.set(3, 6, PAL.parch);
  g.rect(2, 12, 12, 17, c.b); g.rect(2, 12, 12, 2, c.l); g.rect(12, 14, 2, 15, c.d);
  for (let y = 17; y < 29; y += 5) g.rect(2, y, 10, 1, c.d);
  g.rect(1, 28, 14, 4, PAL.wood); g.rect(1, 28, 14, 1, PAL.woodL); g.rect(1, 31, 14, 1, PAL.woodD);
  return g.outline();
}

function drawTable(v) {
  const g = new Grid(32, 20);
  g.rect(1, 1, 30, 10, PAL.woodL); g.rect(1, 1, 30, 1, PAL.pathL);
  g.rect(4, 4, 10, 1, PAL.wood); g.rect(17, 7, 11, 1, PAL.wood);
  g.rect(1, 11, 30, 3, PAL.wood); g.rect(1, 13, 30, 1, PAL.woodD);
  g.rect(2, 14, 3, 5, PAL.woodD); g.rect(27, 14, 3, 5, PAL.woodD);
  if (v === 1) { // mugs and bread
    g.rect(6, 3, 4, 5, PAL.metalL); g.rect(6, 3, 4, 1, PAL.white); g.rect(10, 4, 1, 3, PAL.metal); g.rect(7, 4, 2, 1, PAL.ember);
    g.rect(20, 2, 4, 5, PAL.metalL); g.rect(20, 2, 4, 1, PAL.white); g.rect(19, 3, 1, 3, PAL.metal);
    g.rect(13, 6, 6, 3, PAL.pathL); g.rect(13, 6, 6, 1, PAL.parch); g.set(15, 7, PAL.pathD);
  }
  if (v === 2) { // candle and plate
    g.rect(14, 0, 2, 6, PAL.white); g.set(14, 0, PAL.fireL); g.rect(6, 4, 8, 4, PAL.white); g.rect(7, 5, 6, 2, PAL.parch);
  }
  return g.outline();
}

function drawChair() {
  const g = new Grid(16, 16);
  g.rect(3, 1, 10, 7, PAL.wood); g.rect(3, 1, 10, 1, PAL.woodL);
  g.rect(5, 3, 1, 4, PAL.woodD); g.rect(8, 3, 1, 4, PAL.woodD); g.rect(10, 3, 1, 4, PAL.woodD);
  g.rect(3, 8, 10, 4, PAL.woodL); g.rect(3, 11, 10, 1, PAL.wood);
  g.rect(3, 12, 2, 3, PAL.woodD); g.rect(11, 12, 2, 3, PAL.woodD);
  return g.outline();
}

function drawStool() {
  const g = new Grid(16, 16);
  g.rect(4, 6, 8, 4, PAL.woodL); g.rect(5, 5, 6, 1, PAL.woodL); g.rect(4, 9, 8, 1, PAL.wood);
  g.rect(4, 10, 2, 5, PAL.woodD); g.rect(10, 10, 2, 5, PAL.woodD); g.rect(7, 10, 2, 4, PAL.wood);
  return g.outline();
}

function drawShelf(v) {
  const g = new Grid(16, 28);
  const rnd = mulberry32(300 + v * 13);
  g.rect(0, 0, 16, 28, PAL.wood);
  g.rect(2, 2, 12, 25, PAL.woodD);
  g.rect(0, 0, 16, 2, PAL.woodL);
  const rows = [3, 12, 21];
  for (const r of rows) {
    g.rect(0, r + 7, 16, 2, PAL.woodL); g.rect(0, r + 8, 16, 1, PAL.wood);
    let xx = 2;
    while (xx < 14) {
      if (v === 0) { // books
        const w = rnd() < 0.5 ? 1 : 2, h = 4 + ((rnd() * 3) | 0);
        const col = pick([PAL.roof, CLOTHS[0].b, PAL.leaf, CLOTHS[6].b, CLOTHS[4].b, PAL.parch, PAL.roofD], rnd);
        g.rect(xx, r + 7 - h, w, h, col); g.set(xx, r + 7 - h, mix(col, PAL.white, 0.3));
        xx += w + (rnd() < 0.2 ? 1 : 0);
      } else if (v === 1) { // bottles
        const col = pick([PAL.leafL, PAL.waterL, PAL.roofL, PAL.pathL, PAL.ley], rnd);
        if (xx + 3 > 14) break;
        g.rect(xx, r + 3, 3, 4, col); g.set(xx + 1, r + 2, col); g.set(xx + 1, r + 1, PAL.woodL); g.set(xx, r + 3, mix(col, PAL.white, 0.5));
        xx += 4;
      } else { // jars and goods
        if (xx + 4 > 14) break;
        const col = pick([PAL.parch, PAL.pathL, PAL.hide, PAL.white], rnd);
        g.rect(xx, r + 3, 4, 4, col); g.rect(xx, r + 2, 4, 1, PAL.woodL); g.set(xx, r + 3, PAL.white);
        xx += 5;
      }
    }
  }
  return g.outline();
}

function drawDresser() {
  const g = new Grid(32, 24);
  g.rect(1, 4, 30, 17, PAL.wood); g.rect(0, 2, 32, 3, PAL.woodL); g.rect(0, 2, 32, 1, PAL.pathL);
  for (let i = 0; i < 3; i++) {
    const y = 6 + i * 5;
    g.rect(3, y, 26, 4, PAL.woodL); g.rect(3, y + 3, 26, 1, PAL.woodD);
    g.rect(14, y + 1, 4, 1, PAL.metalL);
  }
  g.rect(2, 21, 3, 3, PAL.woodD); g.rect(27, 21, 3, 3, PAL.woodD);
  g.rect(22, 0, 5, 2, PAL.parch);
  return g.outline();
}

function drawFireplace(frame) {
  const g = new Grid(32, 32);
  g.rect(6, 0, 20, 7, PAL.stoneD);
  g.rect(2, 7, 28, 25, PAL.stone);
  for (let y = 9; y < 32; y += 4) for (let x = 2 + ((y >> 2) % 2) * 3; x < 30; x += 6) { g.rect(x, y, 5, 1, PAL.stoneL); g.set(x + 5, y + 1, PAL.stoneD); }
  g.rect(0, 7, 32, 3, PAL.woodD); g.rect(0, 7, 32, 1, PAL.woodL);
  g.rect(8, 14, 16, 18, PAL.ink); g.rect(9, 15, 14, 2, PAL.shadow);
  g.rect(10, 28, 12, 2, PAL.woodD); g.rect(11, 27, 4, 1, PAL.wood); g.rect(17, 27, 4, 1, PAL.wood);
  const heights = frame ? [6, 9, 7, 11, 8, 6, 9] : [8, 6, 10, 7, 11, 7, 5];
  for (let i = 0; i < 7; i++) {
    const x = 10 + i * 2, h = heights[i];
    for (let k = 0; k < h; k++) {
      const y = 27 - k;
      g.set(x, y, k > h - 3 ? PAL.fireD : k > h - 6 ? PAL.ember : PAL.fireL);
      if (k < h - 2) g.set(x + 1, y, k > h - 5 ? PAL.ember : PAL.fireL);
    }
  }
  return g.outline();
}

function drawBarrel() {
  const g = new Grid(16, 18);
  g.rect(3, 1, 10, 16, PAL.wood); g.rect(2, 4, 12, 10, PAL.wood);
  g.rect(4, 1, 8, 3, PAL.woodL); g.rect(5, 2, 6, 1, PAL.woodD);
  for (const x of [5, 8, 11]) g.rect(x, 4, 1, 12, PAL.woodD);
  g.rect(2, 5, 12, 1, PAL.metal); g.rect(2, 13, 12, 1, PAL.metal); g.set(3, 5, PAL.metalL); g.set(3, 13, PAL.metalL);
  g.rect(4, 6, 1, 6, PAL.woodL);
  return g.outline();
}

function drawCrate() {
  const g = new Grid(16, 16);
  g.rect(1, 2, 14, 13, PAL.woodL);
  g.rect(1, 2, 14, 2, PAL.pathL);
  g.rect(1, 2, 2, 13, PAL.wood); g.rect(13, 2, 2, 13, PAL.wood); g.rect(1, 13, 14, 2, PAL.wood);
  for (let i = 0; i < 9; i++) { g.set(3 + i, 4 + i, PAL.woodD); g.set(4 + i, 4 + i, PAL.wood); }
  g.set(2, 3, PAL.metalL); g.set(13, 3, PAL.metalL);
  return g.outline();
}

function drawSack() {
  const g = new Grid(16, 16);
  const rows = [[6, 4], [5, 6], [4, 8], [3, 10], [3, 10], [2, 12], [2, 12], [2, 12], [2, 12], [3, 10], [3, 10]];
  rows.forEach(([x, w], i) => g.rect(x, 4 + i, w, 1, PAL.hide));
  g.rect(6, 2, 4, 2, PAL.hideD); g.rect(6, 4, 4, 1, PAL.woodD);
  for (let y = 6; y < 15; y++) g.set(12 - (y > 8 ? 0 : 1), y, PAL.hideD);
  g.rect(4, 8, 2, 1, PAL.hideL); g.rect(4, 9, 1, 2, PAL.hideL);
  return g.outline();
}

function drawPlant() {
  const g = new Grid(16, 18);
  g.rect(4, 11, 8, 6, PAL.roofD); g.rect(3, 11, 10, 2, PAL.roof); g.set(4, 11, PAL.roofL);
  const leaves = [[7, 1], [5, 3], [9, 3], [3, 5], [11, 5], [6, 6], [9, 7], [4, 8], [10, 9], [7, 9]];
  for (const [x, y] of leaves) { g.rect(x, y, 3, 2, PAL.leaf); g.set(x, y, PAL.leafL); g.set(x + 2, y + 1, PAL.leafD); }
  return g.outline();
}

function drawForge(frame) {
  const g = new Grid(32, 32);
  g.rect(10, 0, 12, 4, PAL.stoneD); g.rect(7, 4, 18, 6, PAL.stoneD); g.rect(8, 4, 16, 1, PAL.stone);
  g.rect(1, 10, 30, 22, PAL.stone); g.rect(1, 10, 30, 2, PAL.stoneL);
  for (let y = 14; y < 32; y += 4) for (let x = 1 + ((y >> 2) % 2) * 3; x < 31; x += 6) g.rect(x, y, 1, 3, PAL.stoneD);
  for (let y = 13; y < 32; y += 4) g.rect(1, y, 30, 1, PAL.stoneD);
  g.rect(6, 15, 20, 11, PAL.ink);
  g.rect(7, 22, 18, 4, PAL.fireD);
  const rnd = mulberry32(77 + frame * 5);
  for (let i = 0; i < 16; i++) g.set(7 + ((rnd() * 18) | 0), 22 + ((rnd() * 4) | 0), rnd() < 0.5 ? PAL.ember : PAL.fireL);
  const hs = frame ? [3, 5, 2, 4, 6, 3, 4, 2, 5] : [4, 2, 5, 3, 4, 6, 2, 4, 3];
  hs.forEach((h, i) => { for (let k = 0; k < h; k++) g.set(8 + i * 2, 21 - k, k > h - 2 ? PAL.fireD : PAL.ember); });
  return g.outline();
}

function drawAnvil() {
  const g = new Grid(16, 16);
  g.rect(4, 11, 8, 5, PAL.woodD); g.rect(4, 11, 8, 1, PAL.wood);
  g.rect(2, 4, 12, 3, PAL.metal); g.rect(0, 5, 3, 2, PAL.metal); g.rect(2, 4, 12, 1, PAL.metalL);
  g.rect(5, 7, 6, 2, PAL.metalD); g.rect(4, 9, 8, 2, PAL.metal); g.set(4, 9, PAL.metalL);
  return g.outline();
}

function drawDesk() {
  const g = new Grid(32, 24);
  g.rect(1, 6, 30, 8, PAL.woodL); g.rect(1, 6, 30, 1, PAL.pathL);
  g.rect(1, 14, 30, 6, PAL.wood); g.rect(1, 14, 30, 1, PAL.woodD);
  g.rect(4, 16, 8, 2, PAL.woodL); g.rect(20, 16, 8, 2, PAL.woodL); g.set(7, 16, PAL.metalL); g.set(23, 16, PAL.metalL);
  g.rect(2, 20, 3, 4, PAL.woodD); g.rect(27, 20, 3, 4, PAL.woodD);
  g.rect(4, 7, 10, 6, PAL.paper); g.rect(5, 8, 7, 1, "#4a4a72"); g.rect(5, 10, 8, 1, "#4a4a72"); g.rect(5, 12, 5, 1, "#4a4a72");
  g.rect(15, 8, 6, 5, PAL.white); g.rect(16, 9, 4, 1, "#4a4a72");
  g.rect(22, 9, 3, 3, PAL.ink); g.set(22, 9, PAL.metal);
  for (let i = 0; i < 5; i++) g.set(21 + i, 8 - i, PAL.white);
  g.rect(26, 2, 2, 6, PAL.white); g.set(26, 1, PAL.fireL); g.set(27, 0, PAL.fireL); g.set(26, 0, PAL.ember); g.rect(25, 7, 4, 1, PAL.metal);
  return g.outline();
}

function drawBench() {
  const g = new Grid(32, 22);
  g.rect(1, 5, 30, 7, PAL.woodL); g.rect(1, 5, 30, 1, PAL.pathL);
  g.rect(1, 12, 30, 4, PAL.wood); g.rect(1, 15, 30, 1, PAL.woodD);
  g.rect(2, 16, 3, 6, PAL.woodD); g.rect(27, 16, 3, 6, PAL.woodD); g.rect(5, 19, 22, 1, PAL.wood);
  g.rect(3, 3, 18, 4, PAL.pathL); g.rect(3, 3, 18, 1, PAL.parch); g.rect(6, 5, 8, 1, PAL.path);
  g.rect(22, 6, 7, 3, PAL.metalL); g.rect(22, 8, 7, 1, PAL.metal); g.rect(29, 5, 2, 5, PAL.woodD);
  for (let i = 0; i < 4; i++) g.set(23 + i * 2, 9, PAL.metalD);
  return g.outline();
}

function drawRack() {
  const g = new Grid(16, 30);
  g.rect(1, 0, 2, 30, PAL.woodD); g.rect(13, 0, 2, 30, PAL.woodD);
  g.rect(0, 1, 16, 2, PAL.wood); g.rect(0, 23, 16, 2, PAL.wood);
  const rows = [[5, 6], [4, 8], [3, 10], [3, 10], [3, 10], [4, 8], [3, 10], [3, 10], [3, 10], [4, 8], [3, 10], [3, 10], [3, 10], [4, 8], [3, 10], [4, 8], [5, 6], [6, 4]];
  rows.forEach(([x, w], i) => g.rect(x, 4 + i, w, 1, PAL.hide));
  for (let i = 0; i < 18; i += 3) { g.set(5 + (i % 5), 5 + i, PAL.hideD); g.set(9 - (i % 3), 6 + i, PAL.hideD); }
  for (let i = 0; i < 18; i += 4) g.set(4, 5 + i, PAL.hideL);
  g.set(3, 4, PAL.parch); g.set(12, 4, PAL.parch); g.set(3, 20, PAL.parch); g.set(12, 20, PAL.parch);
  return g.outline();
}

function drawBaskets() {
  const g = new Grid(32, 18);
  for (const bx of [1, 17]) {
    g.rect(bx, 7, 14, 10, PAL.woodL); g.rect(bx, 7, 14, 1, PAL.pathL);
    for (let y = 8; y < 17; y += 2) for (let x = bx + ((y >> 1) % 2); x < bx + 14; x += 2) g.set(x, y, PAL.wood);
    for (let i = 0; i < 3; i++) {
      const tx = bx + 2 + i * 4;
      g.rect(tx, 5, 3, 3, PAL.white); g.rect(tx, 5, 3, 1, PAL.turnip); g.set(tx + 2, 6, PAL.turnip);
      g.rect(tx, 2, 1, 3, PAL.leafL); g.rect(tx + 2, 1, 1, 4, PAL.leaf); g.set(tx + 1, 3, PAL.leafL);
    }
  }
  return g.outline();
}

function drawBlock() {
  const g = new Grid(32, 20);
  g.rect(2, 4, 22, 15, PAL.stone); g.rect(2, 4, 22, 5, PAL.stoneL); g.rect(2, 4, 22, 1, PAL.white);
  g.rect(22, 8, 2, 11, PAL.stoneD); g.rect(2, 18, 22, 1, PAL.stoneD);
  for (let i = 0; i < 4; i++) g.rect(5 + i * 4, 11 + (i % 2), 2, 1, PAL.stoneD);
  g.rect(25, 9, 6, 2, PAL.metalL); g.rect(25, 10, 6, 1, PAL.metal); g.rect(30, 8, 2, 4, PAL.woodD);
  g.rect(25, 14, 6, 4, PAL.woodL); g.rect(27, 12, 2, 2, PAL.wood); g.rect(25, 17, 6, 1, PAL.wood);
  g.set(6, 3, PAL.stoneL); g.set(12, 2, PAL.stoneL); g.set(18, 3, PAL.stoneL);
  return g.outline();
}

function drawWell() {
  const g = new Grid(32, 28);
  g.rect(4, 4, 2, 14, PAL.woodD); g.rect(26, 4, 2, 14, PAL.woodD);
  for (let i = 0; i < 6; i++) g.rect(2 + i * 2, 5 - i, 28 - i * 4, 1, i % 2 ? PAL.roof : PAL.roofL);
  g.rect(2, 5, 28, 2, PAL.roofD);
  g.rect(6, 8, 20, 1, PAL.wood); g.rect(15, 9, 1, 5, PAL.parch); g.rect(13, 13, 5, 4, PAL.wood); g.rect(13, 13, 5, 1, PAL.metal);
  for (let y = 16; y < 28; y++) {
    const w = y < 18 ? 24 - (18 - y) * 4 : 26;
    const x0 = 16 - w / 2;
    g.rect(x0, y, w, 1, y < 20 ? PAL.stoneL : PAL.stone);
  }
  g.rect(7, 18, 18, 3, PAL.waterD); g.rect(9, 18, 6, 1, PAL.water);
  for (let x = 4; x < 28; x += 5) g.rect(x, 23, 1, 4, PAL.stoneD);
  g.rect(3, 22, 26, 1, PAL.stoneD);
  return g.outline();
}

function drawLamp(lit) {
  const g = new Grid(16, 32);
  g.rect(7, 10, 2, 19, PAL.metalD); g.set(7, 12, PAL.metal);
  g.rect(5, 28, 6, 3, PAL.metal); g.rect(5, 28, 6, 1, PAL.metalL);
  g.rect(5, 1, 6, 2, PAL.metal); g.rect(6, 0, 4, 1, PAL.metalL);
  g.rect(4, 3, 8, 7, PAL.metalD);
  g.rect(5, 4, 6, 5, lit ? PAL.fireL : PAL.glassN);
  if (lit) { g.rect(7, 5, 2, 3, PAL.ember); g.set(5, 4, PAL.white); }
  g.rect(5, 10, 6, 1, PAL.metal);
  return g.outline();
}

function drawBoard() {
  const g = new Grid(32, 26);
  g.rect(3, 12, 2, 14, PAL.woodD); g.rect(27, 12, 2, 14, PAL.woodD);
  g.rect(1, 2, 30, 15, PAL.woodD); g.rect(2, 3, 28, 13, PAL.woodL);
  g.rect(0, 0, 32, 3, PAL.wood); g.rect(0, 0, 32, 1, PAL.woodL);
  const papers = [[4, 4, 7, 9, PAL.paper], [13, 5, 6, 7, PAL.white], [21, 4, 7, 10, PAL.paper]];
  for (const [x, y, w, h, c] of papers) {
    g.rect(x, y, w, h, c); g.set(x + (w >> 1), y, PAL.flowerR);
    for (let ly = y + 2; ly < y + h - 1; ly += 2) g.rect(x + 1, ly, w - 2 - (ly % 3), 1, PAL.stone);
  }
  return g.outline();
}

/* ------------------------------------------------------------------ */
/* Light sprites with ordered dithering                                */
/* ------------------------------------------------------------------ */
function makeLightSprite(r) {
  const c = makeCanvas(r * 2, r * 2);
  const x = c.getContext("2d");
  const img = x.createImageData(r * 2, r * 2);
  for (let j = 0; j < r * 2; j++) for (let i = 0; i < r * 2; i++) {
    const d = Math.hypot(i + 0.5 - r, j + 0.5 - r) / r;
    if (d >= 1) continue;
    const a = Math.pow(1 - d, 1.4);   // smooth falloff: the world is drawn at 2x, where dithered light reads as halftone
    const k = (j * r * 2 + i) * 4;
    img.data[k] = 255; img.data[k + 1] = 255; img.data[k + 2] = 255; img.data[k + 3] = Math.round(a * 255);
  }
  x.putImageData(img, 0, 0);
  return c;
}

/* ------------------------------------------------------------------ */
/* Art bank                                                            */
/* ------------------------------------------------------------------ */
const PROP_DRAW = {
  bed: drawBed, table: drawTable, chair: drawChair, stool: drawStool, shelf: drawShelf, dresser: drawDresser,
  fireplace: drawFireplace, barrel: drawBarrel, crate: drawCrate, sack: drawSack, plant: drawPlant,
  forge: drawForge, anvil: drawAnvil, desk: drawDesk, bench: drawBench, rack: drawRack, baskets: drawBaskets,
  block: drawBlock, well: drawWell, lamp: drawLamp, board: drawBoard,
};

function buildArt() {
  const cache = new Map();
  // grain strength by tile family: water stays calm so the animation reads, wood and stone get more tooth
  const grainFor = (key) => (/^w\d/.test(key) ? 0.5 : /^(br|z|f\d)/.test(key) ? 0.9 : 1);
  const tile = (key, paint) => {
    let c = cache.get(key);
    if (!c) { c = makeCanvas(16, 16); paint(c.getContext("2d")); texturize(c, grainFor(key), strHash(key.replace(/\.[01]\./, "."))); cache.set(key, c); }
    return c;
  };
  const overGrass = (key, v, grid) => tile(key + v, (x) => { paintGrass(x, v, false); grid.draw(x); });
  const bush = drawBush(), rock = drawRock(), sign = drawSign();
  const lights = new Map(), tints = new Map();
  const art = {
    tile, cache,
    grass: (v, t) => tile(`g${v}${t ? "t" : ""}`, (x) => paintGrass(x, v, t)),
    flowers: (v) => tile(`fl${v}`, (x) => paintFlowers(x, v)),
    path: (m, v) => tile(`p${m}.${v}`, (x) => paintPath(x, m, v)),
    water: (m, f, v) => tile(`w${m}.${f}.${v}`, (x) => paintWater(x, m, f, v)),
    bridge: (m) => tile(`br${m}`, (x) => paintBridge(x, m)),
    crop: (v) => tile(`c${v}`, (x) => paintCrop(x, v)),
    fence: (m, v) => tile(`f${m}.${v}`, (x) => paintFence(x, m, v)),
    roof: (m) => tile(`r${m}`, (x) => paintRoof(x, m)),
    wall: (k, n) => tile(`wl${k}${n ? "n" : ""}`, (x) => paintWall(x, k, n)),
    stone: () => tile("st", (x) => paintStoneWall(x)),
    bush: (v) => overGrass("bu", v, bush),
    rock: (v) => overGrass("ro", v, rock),
    sign: (v) => overGrass("si", v, sign),
    barricade: (v) => tile(`z${v}`, (x) => paintBarricade(x, v)),
    floor: (v) => tile(`fo${v}`, (x) => paintFloor(x, v)),
    flag: (v) => tile(`fs${v}`, (x) => paintStoneFloor(x, v)),
    wallUp: (v, win, n) => tile(`wu${v}${win ? "w" : ""}${n ? "n" : ""}`, (x) => paintWallUpper(x, v, win, n)),
    wallLo: () => tile("wlo", (x) => paintWallLower(x)),
    voidT: (m) => tile(`vd${m}`, (x) => paintVoid(x, m)),
    mat: (v) => tile(`mt${v}`, (x) => paintMat(x, v)),
    rug: (m, v) => tile(`rg${m}.${v}`, (x) => paintRug(x, m, v)),
    counter: (m) => tile(`ct${m}`, (x) => paintCounter(x, m)),
    trees: [texturize(drawTree(0).toCanvas(), 0.6, 3), texturize(drawTree(1).toCanvas(), 0.6, 4)],
    pillar: drawPillar().toCanvas(),
    prompt: drawPromptIcon(),
    shadow: drawShadow(),
    prop(name, v = 0) {
      const key = `prop:${name}:${v}`;
      let c = cache.get(key);
      if (!c) { c = PROP_DRAW[name](v).toCanvas(); texturize(c, 0.55, strHash(name) + v); cache.set(key, c); }
      return c;
    },
    light(r) {
      let c = lights.get(r);
      if (!c) { c = makeLightSprite(r); lights.set(r, c); }
      return c;
    },
    lightTint(r, color) {
      const key = r + color;
      let c = tints.get(key);
      if (!c) {
        c = makeCanvas(r * 2, r * 2);
        const x = c.getContext("2d");
        x.drawImage(art.light(r), 0, 0);
        x.globalCompositeOperation = "source-in";
        x.fillStyle = color; x.fillRect(0, 0, r * 2, r * 2);
        tints.set(key, c);
      }
      return c;
    },
  };
  return art;
}
