
/* ------------------------------------------------------------------ */
/* Props                                                               */
/* ------------------------------------------------------------------ */

const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bayer = (x, y) => (BAYER4[((y & 3) << 2) | (x & 3)] + 0.5) / 16;
/* Pick from a dark-to-light ramp with ordered dithering: t in 0..1 */
function ramp(list, t, x, y) {
  const f = clamp(t, 0, 0.9999) * (list.length - 1), i = Math.floor(f), fr = f - i;
  return fr > bayer(x, y) ? list[i + 1] : list[i];
}

function drawTree(v) {
  const g = new Grid(16, 24);
  const rnd = mulberry32(1000 + v * 17);
  const L = [mix(PAL.leafD, PAL.ink, 0.45), PAL.leafD, PAL.leaf, PAL.leafL, mix(PAL.leafL, PAL.grassH, 0.55)];
  // trunk with bark ridges and root flare
  for (let y = 14; y < 23; y++) {
    const w = y > 20 ? 6 : 4, x0 = 8 - (w >> 1);
    for (let x = x0; x < x0 + w; x++) {
      const t = (x - x0) / (w - 1);
      g.set(x, y, t < 0.25 ? PAL.woodL : t > 0.7 ? mix(PAL.woodD, PAL.ink, 0.35) : ((x + y) % 3 === 0 ? PAL.woodD : PAL.wood));
    }
  }
  // canopy: overlapping clumps, lit from the upper left
  const clumps = [[8, 8, 6.2], [4.5, 10, 4.2], [11.5, 10, 4.2], [7, 4.5, 4], [11, 6, 3.4], [4, 6.5, 3.2], [8, 12, 4.4]];
  const shade = (x, y) => {
    let best = null;
    for (const [cx, cy, r] of clumps) {
      const dx = x + 0.5 - cx, dy = (y + 0.5 - cy) * 1.05, d2 = dx * dx + dy * dy;
      if (d2 > r * r) continue;
      const lit = clamp(0.5 - (dx * 0.55 + dy * 0.8) / (r * 1.5), 0, 1);
      const rim = Math.sqrt(d2) / r;
      const t = lit * 0.85 + 0.08 - Math.max(0, rim - 0.78) * 0.9;
      if (!best || cy + dy * 0 > best.cy) best = { t, cy };
    }
    return best;
  };
  for (let y = 0; y < 19; y++) for (let x = 0; x < 16; x++) {
    const b = shade(x, y);
    if (!b) continue;
    const jitter = (rnd() - 0.5) * 0.18;
    g.set(x, y, ramp(L, b.t + jitter, x, y));
  }
  // leaf flecks
  for (let i = 0; i < 14; i++) {
    const x = (rnd() * 16) | 0, y = (rnd() * 17) | 0;
    if (!g.get(x, y)) continue;
    g.set(x, y, rnd() < 0.5 ? L[4] : L[0]);
  }
  return g.outline();
}

function drawBush() {
  const g = new Grid(16, 16);
  const rnd = mulberry32(55);
  const L = [mix(PAL.leafD, PAL.ink, 0.45), PAL.leafD, PAL.leaf, PAL.leafL, mix(PAL.leafL, PAL.grassH, 0.5)];
  const clumps = [[8, 10, 5.4], [4.5, 11, 3.6], [11.5, 11, 3.6], [7, 7.5, 3.6]];
  for (let y = 3; y < 15; y++) for (let x = 0; x < 16; x++) {
    let best = null;
    for (const [cx, cy, r] of clumps) {
      const dx = x + 0.5 - cx, dy = (y + 0.5 - cy) * 1.15, d2 = dx * dx + dy * dy;
      if (d2 > r * r) continue;
      const lit = clamp(0.5 - (dx * 0.55 + dy * 0.8) / (r * 1.5), 0, 1);
      const t = lit * 0.9 + 0.05 - Math.max(0, Math.sqrt(d2) / r - 0.75);
      if (!best || t > best) best = t;
    }
    if (best !== null) g.set(x, y, ramp(L, best + (rnd() - 0.5) * 0.16, x, y));
  }
  for (const [bx, by] of [[5, 9], [10, 10], [8, 12], [11, 8]]) { if (g.get(bx, by)) { g.set(bx, by, PAL.flowerR); g.set(bx, by - 1, mix(PAL.flowerR, PAL.white, 0.35)); } }
  return g.outline();
}

function drawRock() {
  const g = new Grid(16, 16);
  const rnd = mulberry32(77);
  const L = [mix(PAL.stoneD, PAL.ink, 0.4), PAL.stoneD, PAL.stone, PAL.stoneL, mix(PAL.stoneL, PAL.white, 0.35)];
  for (let y = 5; y < 15; y++) for (let x = 1; x < 15; x++) {
    const dx = (x + 0.5 - 7.8) / 6.2, dy = (y + 0.5 - 10.4) / 4.6;
    const e = dx * dx + dy * dy + (rnd() - 0.5) * 0.12;
    if (e > 1) continue;
    const facet = (dx > 0.15 ? -0.28 : 0) + (dy > 0.25 ? -0.18 : 0);
    const lit = clamp(0.55 - dx * 0.4 - dy * 0.5 + facet, 0, 1);
    g.set(x, y, ramp(L, lit, x, y));
  }
  for (const [x, y] of [[6, 9], [7, 10], [8, 11], [10, 9]]) if (g.get(x, y)) g.set(x, y, L[0]);
  for (const [x, y] of [[4, 11], [5, 12], [9, 13]]) if (g.get(x, y)) g.set(x, y, mix(PAL.leaf, PAL.stone, 0.3));
  return g.outline();
}
function drawSign() {
  const g = new Grid(16, 16);
  g.rect(7, 10, 2, 5, PAL.wood); g.set(7, 10, PAL.woodD);
  g.rect(2, 3, 12, 7, PAL.woodL);
  g.rect(2, 3, 12, 1, PAL.parch);
  g.rect(4, 5, 8, 1, PAL.woodD); g.rect(4, 7, 6, 1, PAL.woodD);
  return g.outline();
}

function drawPillar() {
  const g = new Grid(32, 44);
  g.rect(3, 38, 26, 5, PAL.stoneD); g.rect(3, 38, 26, 1, PAL.stone);
  g.rect(5, 35, 22, 3, PAL.stone); g.rect(5, 35, 22, 1, PAL.stoneL);
  for (let y = 10; y <= 34; y++) {
    const half = 5 + ((y - 10) / 24) * 2;
    const x0 = Math.round(16 - half), x1 = Math.round(16 + half) - 1;
    for (let x = x0; x <= x1; x++) g.set(x, y, x <= x0 + 1 ? PAL.stoneL : x >= x1 - 1 ? PAL.stoneD : PAL.stone);
  }
  for (let y = 4; y <= 9; y++) {
    const half = y - 3;
    for (let x = 16 - half; x < 16 + half; x++) g.set(x, y, x < 16 ? PAL.stoneL : PAL.stone);
  }
  g.rect(15, 0, 2, 1, PAL.leyL);
  g.rect(14, 1, 4, 3, PAL.ley); g.set(15, 1, PAL.leyL); g.set(15, 2, PAL.leyL);
  g.rect(15, 4, 2, 1, PAL.leyD);
  for (let y = 13; y <= 31; y += 5) {
    g.set(15, y, PAL.ley); g.set(16, y + 1, PAL.ley); g.set(15, y + 2, PAL.leyD); g.set(16, y + 3, PAL.leyD);
  }
  return g.outline();
}

function drawPromptIcon() {
  const g = new Grid(11, 12);
  g.rect(1, 0, 9, 9, PAL.white);
  g.set(1, 0, null); g.set(9, 0, null); g.set(1, 8, null); g.set(9, 8, null);
  g.rect(4, 9, 3, 1, PAL.white); g.set(5, 10, PAL.white);
  // letter A
  g.rect(4, 2, 3, 1, PAL.ink); g.rect(3, 3, 1, 5, PAL.ink); g.rect(7, 3, 1, 5, PAL.ink); g.rect(4, 5, 3, 1, PAL.ink);
  return g.outline().toCanvas();
}

function drawShadow() {
  const c = makeCanvas(14, 6);
  const x = c.getContext("2d");
  x.fillStyle = "rgba(12,9,20,0.16)"; x.fillRect(0, 2, 14, 2); x.fillRect(2, 1, 10, 4);
  x.fillStyle = "rgba(12,9,20,0.26)"; x.fillRect(2, 2, 10, 2); x.fillRect(4, 1, 6, 4);
  x.fillStyle = "rgba(12,9,20,0.22)"; x.fillRect(4, 2, 6, 2);
  return c;
}
/* ------------------------------------------------------------------ */
/* Ground tiles                                                        */
/* ------------------------------------------------------------------ */
const N = 1, E = 2, S = 4, W = 8;

function paintGrass(x, v, tuft) {
  x.fillStyle = PAL.grass; x.fillRect(0, 0, 16, 16);
  const rnd = mulberry32(v * 31 + 7);
  // soft tonal patches break up the flat green
  for (let i = 0; i < 6; i++) {
    const px = (rnd() * 16) | 0, py = (rnd() * 16) | 0, pw = 3 + ((rnd() * 5) | 0), ph = 2 + ((rnd() * 3) | 0);
    x.globalAlpha = 0.5; x.fillStyle = rnd() < 0.5 ? PAL.grassD : PAL.grassL;
    x.fillRect(px, py, pw, ph);
  }
  x.globalAlpha = 1;
  // individual blades with a light tip
  for (let i = 0; i < 10; i++) {
    const bx = (rnd() * 16) | 0, by = 2 + ((rnd() * 13) | 0), hh = 2 + ((rnd() * 2) | 0), lean = rnd() < 0.5 ? -1 : 1;
    x.fillStyle = PAL.grassD; x.fillRect(bx, by, 1, hh);
    x.fillStyle = rnd() < 0.5 ? PAL.grassL : PAL.grassH; x.fillRect(bx + (hh > 2 ? lean : 0), by - 1, 1, 1);
  }
  for (let i = 0; i < 2; i++) { x.fillStyle = rnd() < 0.5 ? PAL.dirt : PAL.pathD; x.fillRect((rnd() * 16) | 0, (rnd() * 16) | 0, 1, 1); }
  if (tuft) {
    for (let i = 0; i < 2; i++) {
      const tx = 2 + ((rnd() * 10) | 0), ty = 4 + ((rnd() * 9) | 0);
      x.fillStyle = PAL.grassD; x.fillRect(tx, ty + 1, 1, 3); x.fillRect(tx + 2, ty, 1, 4); x.fillRect(tx + 1, ty + 2, 1, 2); x.fillRect(tx - 1, ty + 2, 1, 2);
      x.fillStyle = PAL.grassH; x.fillRect(tx, ty, 1, 1); x.fillRect(tx + 2, ty - 1, 1, 1);
      x.fillStyle = PAL.grassL; x.fillRect(tx + 1, ty + 1, 1, 1);
    }
  }
}
function paintFlowers(x, v) {
  paintGrass(x, v, false);
  const rnd = mulberry32(v * 13 + 99);
  for (let i = 0; i < 4; i++) {
    const fx = 2 + ((rnd() * 11) | 0), fy = 3 + ((rnd() * 10) | 0);
    const col = [PAL.flowerR, PAL.white, PAL.flowerY, "#8a78b8"][(rnd() * 4) | 0];
    x.fillStyle = PAL.grassD; x.fillRect(fx, fy + 1, 1, 2);
    x.fillStyle = col; x.fillRect(fx - 1, fy, 3, 1); x.fillRect(fx, fy - 1, 1, 3);
    x.fillStyle = PAL.flowerY; x.fillRect(fx, fy, 1, 1);
  }
}
function paintPath(x, mask, v) {
  x.fillStyle = PAL.path; x.fillRect(0, 0, 16, 16);
  const rnd = mulberry32(v * 53 + 3);
  for (let i = 0; i < 5; i++) {
    x.globalAlpha = 0.5; x.fillStyle = rnd() < 0.5 ? PAL.pathD : PAL.pathL;
    x.fillRect((rnd() * 14) | 0, (rnd() * 14) | 0, 2 + ((rnd() * 4) | 0), 2 + ((rnd() * 2) | 0));
  }
  x.globalAlpha = 1;
  // pebbles with a lit top and a shadow underneath
  for (let i = 0; i < 6; i++) {
    const px = (rnd() * 15) | 0, py = (rnd() * 14) | 0;
    x.fillStyle = PAL.pathD; x.fillRect(px, py + 1, 2, 1);
    x.fillStyle = rnd() < 0.5 ? PAL.pathL : mix(PAL.stoneL, PAL.path, 0.4); x.fillRect(px, py, 1, 1);
  }
  // faint cart ruts on vertical-ish tiles
  if (v % 2 === 0) { x.fillStyle = PAL.pathD; x.globalAlpha = 0.55; x.fillRect(4, 0, 1, 16); x.fillRect(11, 0, 1, 16); x.globalAlpha = 1; }
  const edge = (side) => {
    for (let i = 0; i < 16; i++) {
      const d = 1 + ((hash2(i + v * 16, side) % 3) === 0 ? 1 : 0) + ((hash2(i * 3, side + 9) % 7) === 0 ? 1 : 0);
      const grass = (hash2(i, side + 5) % 3) ? PAL.grass : PAL.grassD;
      x.fillStyle = grass;
      if (side === N) x.fillRect(i, 0, 1, d);
      if (side === S) x.fillRect(i, 16 - d, 1, d);
      if (side === W) x.fillRect(0, i, d, 1);
      if (side === E) x.fillRect(16 - d, i, d, 1);
      x.fillStyle = PAL.pathD;
      if (side === N) x.fillRect(i, d, 1, 1);
      if (side === S) x.fillRect(i, 15 - d, 1, 1);
      if (side === W) x.fillRect(d, i, 1, 1);
      if (side === E) x.fillRect(15 - d, i, 1, 1);
      if (hash2(i + 40, side) % 4 === 0) {
        x.fillStyle = PAL.grassH;
        if (side === N) x.fillRect(i, 0, 1, 1); if (side === S) x.fillRect(i, 15, 1, 1);
        if (side === W) x.fillRect(0, i, 1, 1); if (side === E) x.fillRect(15, i, 1, 1);
      }
    }
  };
  if (mask & N) edge(N); if (mask & S) edge(S); if (mask & W) edge(W); if (mask & E) edge(E);
}
function paintWater(x, mask, frame, v) {
  x.fillStyle = PAL.water; x.fillRect(0, 0, 16, 16);
  const rnd = mulberry32(v * 7 + 11);
  // depth bands
  x.globalAlpha = 0.45; x.fillStyle = PAL.waterD;
  for (let y = 0; y < 16; y += 5) x.fillRect(0, y + ((v + y) % 3), 16, 2);
  x.globalAlpha = 1;
  for (let i = 0; i < 4; i++) {
    const wy = 1 + ((rnd() * 13) | 0), wx = ((rnd() * 10) | 0) + (frame ? 2 : 0);
    x.fillStyle = PAL.waterL; x.fillRect(wx % 13, wy, 3, 1);
    x.fillStyle = mix(PAL.waterL, PAL.foam, 0.4); x.fillRect((wx + 1) % 13, wy, 1, 1);
    x.fillStyle = PAL.waterD; x.fillRect((wx + 1) % 13, wy + 1, 3, 1);
  }
  const foam = (side) => {
    x.fillStyle = PAL.waterD;
    if (side === N) x.fillRect(0, 0, 16, 3);
    if (side === S) x.fillRect(0, 15, 16, 1);
    if (side === W) x.fillRect(0, 0, 3, 16);
    if (side === E) x.fillRect(13, 0, 3, 16);
    x.fillStyle = mix(PAL.waterL, PAL.foam, 0.55);
    for (let i = (frame ? 1 : 0); i < 16; i += 4) {
      if (side === N) x.fillRect(i, 3, 2, 1);
      if (side === S) x.fillRect(i, 14, 2, 1);
      if (side === W) x.fillRect(3, i, 1, 2);
      if (side === E) x.fillRect(12, i, 1, 2);
    }
    x.fillStyle = PAL.foam;
    for (let i = (frame ? 2 : 0); i < 16; i += 5) {
      if (side === N) x.fillRect(i, 3, 1, 1);
      if (side === S) x.fillRect(i, 14, 1, 1);
      if (side === W) x.fillRect(3, i, 1, 1);
      if (side === E) x.fillRect(12, i, 1, 1);
    }
  };
  if (mask & N) foam(N); if (mask & S) foam(S); if (mask & W) foam(W); if (mask & E) foam(E);
}
function paintBridge(x, mask) {
  x.fillStyle = PAL.woodL; x.fillRect(0, 0, 16, 16);
  x.fillStyle = PAL.wood;
  for (let i = 3; i < 16; i += 4) x.fillRect(i, 0, 1, 16);
  x.fillStyle = PAL.pathL; x.fillRect(1, 5, 1, 1); x.fillRect(9, 11, 1, 1);
  if (mask & N) { x.fillStyle = PAL.woodD; x.fillRect(0, 0, 16, 3); x.fillStyle = PAL.wood; x.fillRect(0, 0, 16, 1); }
  if (mask & S) { x.fillStyle = PAL.woodD; x.fillRect(0, 13, 16, 3); x.fillStyle = PAL.wood; x.fillRect(0, 13, 16, 1); }
}

function paintCrop(x, v) {
  x.fillStyle = PAL.dirt; x.fillRect(0, 0, 16, 16);
  x.fillStyle = PAL.woodD;
  for (let y = 3; y < 16; y += 5) x.fillRect(0, y, 16, 1);
  const rnd = mulberry32(v * 19 + 5);
  for (let row = 0; row < 3; row++) {
    for (let i = 1; i < 16; i += 4) {
      const y = row * 5 + 1, ox = i + ((rnd() * 2) | 0);
      x.fillStyle = PAL.grassL; x.fillRect(ox, y, 1, 2); x.fillRect(ox + 1, y, 1, 1);
      x.fillStyle = PAL.grassH; x.fillRect(ox, y, 1, 1);
    }
  }
}

function paintFence(x, mask, v) {
  paintGrass(x, v, false);
  x.fillStyle = PAL.woodL;
  if (mask & W) { x.fillRect(0, 6, 8, 2); x.fillRect(0, 10, 8, 2); }
  if (mask & E) { x.fillRect(8, 6, 8, 2); x.fillRect(8, 10, 8, 2); }
  if (mask & N) x.fillRect(7, 0, 2, 6);
  if (mask & S) x.fillRect(7, 12, 2, 4);
  x.fillStyle = PAL.woodD;
  if (mask & W) { x.fillRect(0, 8, 7, 1); x.fillRect(0, 12, 7, 1); }
  if (mask & E) { x.fillRect(9, 8, 7, 1); x.fillRect(9, 12, 7, 1); }
  x.fillStyle = PAL.woodD; x.fillRect(6, 3, 4, 11);
  x.fillStyle = PAL.wood; x.fillRect(7, 3, 2, 10);
  x.fillStyle = PAL.pathL; x.fillRect(7, 3, 2, 1);
}

function paintRoof(x, mask) {
  x.fillStyle = PAL.roofD; x.fillRect(0, 0, 16, 16);
  // staggered clay shingles, each with its own tone
  for (let row = 0; row < 4; row++) {
    const y = row * 4, off = row % 2 ? 4 : 0;
    for (let i = -1; i < 3; i++) {
      const sx = i * 8 + off, h = hash2(i + row * 5, row * 3 + 1) % 4;
      const base = h === 0 ? PAL.roofL : h === 1 ? PAL.roof : h === 2 ? mix(PAL.roof, PAL.roofD, 0.35) : mix(PAL.roof, PAL.roofL, 0.35);
      x.fillStyle = base; x.fillRect(sx, y, 7, 3);
      x.fillStyle = mix(base, PAL.white, 0.14); x.fillRect(sx, y, 7, 1);
      x.fillStyle = mix(base, PAL.ink, 0.35); x.fillRect(sx + 6, y, 1, 3);
      if (h === 3 && row % 2) { x.fillStyle = mix(PAL.leaf, PAL.roof, 0.35); x.fillRect(sx + 2, y + 1, 2, 1); }
    }
    x.fillStyle = mix(PAL.roofD, PAL.ink, 0.5); x.fillRect(0, y + 3, 16, 1);
  }
  if (mask & N) { x.fillStyle = PAL.roofD; x.fillRect(0, 0, 16, 2); x.fillStyle = mix(PAL.roofL, PAL.white, 0.12); x.fillRect(0, 2, 16, 1); }
  if (mask & W) { x.fillStyle = PAL.roofD; x.fillRect(0, 0, 2, 16); }
  if (mask & E) { x.fillStyle = mix(PAL.roofD, PAL.ink, 0.6); x.fillRect(15, 0, 1, 16); x.fillStyle = PAL.roofD; x.fillRect(13, 0, 2, 16); }
  if (mask & S) { x.fillStyle = PAL.ink; x.fillRect(0, 15, 16, 1); x.fillStyle = mix(PAL.roofD, PAL.ink, 0.5); x.fillRect(0, 13, 16, 2); }
}
function paintWall(x, kind, night) {
  // timber frame, plaster infill, stone footing
  x.fillStyle = PAL.plaster; x.fillRect(0, 0, 16, 16);
  const rnd = mulberry32(kind.charCodeAt(0) * 3);
  for (let i = 0; i < 9; i++) { x.globalAlpha = 0.5; x.fillStyle = rnd() < 0.5 ? PAL.plasterD : PAL.plasterL; x.fillRect((rnd() * 14) | 0, ((rnd() * 11) | 0) + 2, 2 + ((rnd() * 4) | 0), 1); }
  x.globalAlpha = 1;
  // eave shadow under the roof
  x.fillStyle = mix(PAL.plasterD, PAL.ink, 0.35); x.fillRect(0, 0, 16, 1);
  x.fillStyle = PAL.plasterD; x.fillRect(0, 1, 16, 2);
  // corner posts
  x.fillStyle = PAL.woodD; x.fillRect(0, 0, 2, 16); x.fillStyle = PAL.wood; x.fillRect(1, 0, 1, 16);
  // stone footing
  x.fillStyle = PAL.stone; x.fillRect(0, 13, 16, 3);
  x.fillStyle = PAL.stoneD; x.fillRect(0, 13, 16, 1); x.fillRect(5, 14, 1, 2); x.fillRect(11, 14, 1, 2); x.fillRect(0, 15, 16, 1);
  x.fillStyle = PAL.stoneL; x.fillRect(2, 14, 3, 1); x.fillRect(7, 14, 3, 1);
  if (kind === "w") {
    // recessed window with sill, shutters and leaded glass
    x.fillStyle = PAL.woodD; x.fillRect(3, 3, 10, 9);
    x.fillStyle = night ? PAL.glow : PAL.glass; x.fillRect(4, 4, 8, 7);
    if (!night) { x.fillStyle = PAL.glassN; x.globalAlpha = 0.5; x.fillRect(4, 8, 8, 3); x.globalAlpha = 1; x.fillStyle = PAL.foam; x.fillRect(5, 5, 2, 1); x.fillRect(5, 6, 1, 1); }
    else { x.fillStyle = PAL.fireL; x.fillRect(5, 5, 3, 2); x.fillStyle = PAL.ember; x.fillRect(4, 9, 8, 2); }
    x.fillStyle = PAL.woodD; x.fillRect(7, 4, 2, 7); x.fillRect(4, 7, 8, 1);
    x.fillStyle = PAL.wood; x.fillRect(2, 3, 1, 9); x.fillRect(13, 3, 1, 9);
    x.fillStyle = PAL.woodL; x.fillRect(2, 12, 12, 1);
    x.fillStyle = PAL.woodD; x.fillRect(2, 13, 12, 1);
  }
  if (kind === "D") {
    // plank door in a stone arch
    x.fillStyle = PAL.stoneD; x.fillRect(2, 2, 12, 14);
    x.fillStyle = PAL.stone; x.fillRect(3, 3, 10, 13);
    x.fillStyle = PAL.ink; x.fillRect(4, 4, 8, 12);
    x.fillStyle = PAL.woodD; x.fillRect(4, 5, 8, 11);
    x.fillStyle = PAL.wood; x.fillRect(5, 5, 2, 11); x.fillRect(9, 5, 2, 11);
    x.fillStyle = PAL.woodL; x.fillRect(5, 5, 1, 11); x.fillRect(9, 5, 1, 11);
    x.fillStyle = PAL.metalL; x.fillRect(4, 8, 8, 1); x.fillRect(4, 12, 8, 1);
    x.fillStyle = PAL.flowerY; x.fillRect(10, 10, 1, 2);
    x.fillStyle = PAL.stoneL; x.fillRect(3, 3, 10, 1);
  }
}
function paintStoneWall(x) {
  x.fillStyle = PAL.stoneD; x.fillRect(0, 0, 16, 16);
  // irregular ashlar courses with mortar, lit from the upper left
  const courses = [[0, 4], [4, 4], [8, 4], [12, 4]];
  courses.forEach(([y, h], r) => {
    let cx0 = r % 2 ? -3 : 0;
    while (cx0 < 16) {
      const w = 6 + (hash2(cx0 + 9, r * 7) % 3);
      const x0 = Math.max(0, cx0), x1 = Math.min(16, cx0 + w - 1);
      const tone = hash2(cx0, r + 4) % 3;
      x.fillStyle = tone === 0 ? PAL.stone : tone === 1 ? mix(PAL.stone, PAL.stoneL, 0.4) : mix(PAL.stone, PAL.stoneD, 0.4);
      x.fillRect(x0, y, x1 - x0, h - 1);
      x.fillStyle = PAL.stoneL; x.fillRect(x0, y, Math.max(0, x1 - x0), 1);
      x.fillStyle = mix(PAL.stoneD, PAL.ink, 0.35); x.fillRect(x1 - 1 > x0 ? x1 - 1 : x0, y + 1, 1, h - 2);
      if (hash2(cx0, r) % 5 === 0) { x.fillStyle = mix(PAL.leaf, PAL.stone, 0.4); x.fillRect(x0 + 1, y + h - 2, 2, 1); }
      cx0 += w;
    }
  });
}
