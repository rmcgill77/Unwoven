/* ------------------------------------------------------------------ */
/* Grim world art. Everything here is drawn at 2x (32px per tile) so  */
/* it shares the pixel density of the chibi cast: black outlines on    */
/* objects, flat 2-3 tone fills, hand-placed marks, muted overcast     */
/* palette. Maps are baked once into a ground layer plus sprites.      */
/* ------------------------------------------------------------------ */
const GT = 32;            // grim tile size in pixels (TILE * WZ)
const GINK = [12, 8, 14];

/* ---------- hashing and noise (world coordinates, so maps are seamless) ---------- */
function gh(x, y, s = 0) {
  let v = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1442695041)) >>> 0;
  v = Math.imul(v ^ (v >>> 13), 1274126177) >>> 0;
  return (v ^ (v >>> 16)) >>> 0;
}
function gnoise(x, y, cell, seed) {
  const gx = Math.floor(x / cell), gy = Math.floor(y / cell), fx = x / cell - gx, fy = y / cell - gy;
  const u = fx * fx * (3 - 2 * fx), w = fy * fy * (3 - 2 * fy);
  const v = (i, j) => (gh(gx + i, gy + j, seed) % 1000) / 1000;
  return (v(0, 0) * (1 - u) + v(1, 0) * u) * (1 - w) + (v(0, 1) * (1 - u) + v(1, 1) * u) * w;
}
const rgbOf = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const RGB_CACHE = new Map();
const C = (h) => { let c = RGB_CACHE.get(h); if (!c) { c = rgbOf(h); RGB_CACHE.set(h, c); } return c; };

/* ---------- a crisp pixel buffer: scanline polygons, pixel ellipses, outlines ---------- */
class PB {
  constructor(w, h) { this.w = w; this.h = h; this.d = new Uint8ClampedArray(w * h * 4); }
  set(x, y, c, a = 255) {
    x |= 0; y |= 0;
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 4, col = typeof c === "string" ? C(c) : c;
    this.d[i] = col[0]; this.d[i + 1] = col[1]; this.d[i + 2] = col[2]; this.d[i + 3] = a;
  }
  get(x, y) { if (x < 0 || y < 0 || x >= this.w || y >= this.h) return 0; return this.d[(y * this.w + x) * 4 + 3]; }
  blend(x, y, col, a) {   // alpha-blend a colour over what is there (shadows, light)
    x |= 0; y |= 0;
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 4;
    this.d[i] += (col[0] - this.d[i]) * a; this.d[i + 1] += (col[1] - this.d[i + 1]) * a; this.d[i + 2] += (col[2] - this.d[i + 2]) * a;
    if (!this.d[i + 3]) this.d[i + 3] = 255 * a;
  }
  rect(x0, y0, x1, y1, c) { for (let y = Math.max(0, y0); y <= Math.min(this.h - 1, y1); y++) for (let x = Math.max(0, x0); x <= Math.min(this.w - 1, x1); x++) this.set(x, y, c); }
  poly(pts, c) {
    let y0 = 1e9, y1 = -1e9;
    for (const p of pts) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
    for (let y = Math.max(0, Math.floor(y0)); y <= Math.min(this.h - 1, Math.ceil(y1)); y++) {
      const yc = y + 0.5, xs = [];
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length];
        if ((a[1] <= yc && b[1] > yc) || (b[1] <= yc && a[1] > yc)) xs.push(a[0] + ((yc - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
      }
      xs.sort((p, q) => p - q);
      for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.ceil(xs[k] - 0.5); x < Math.ceil(xs[k + 1] - 0.5); x++) this.set(x, y, c);
    }
  }
  ell(x0, y0, x1, y1, c) {
    const cx = (x0 + x1 + 1) / 2, cy = (y0 + y1 + 1) / 2, rx = (x1 - x0 + 1) / 2, ry = (y1 - y0 + 1) / 2;
    for (let y = Math.floor(y0); y <= y1; y++) for (let x = Math.floor(x0); x <= x1; x++) {
      const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
      if (dx * dx + dy * dy <= 1) this.set(x, y, c);
    }
  }
  line(pts, c, w = 1) {
    for (let i = 0; i + 1 < pts.length; i++) {
      const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
      const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
      for (let k = 0; k <= n; k++) {
        const x = Math.round(x0 + ((x1 - x0) * k) / n), y = Math.round(y0 + ((y1 - y0) * k) / n);
        for (let a = 0; a < w; a++) for (let b = 0; b < w; b++) this.set(x + a, y + b, c);
      }
    }
  }
  outline() {   // black one-pixel line around the silhouette, outside it
    const add = [];
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      if (this.get(x, y)) continue;
      if (this.get(x - 1, y) || this.get(x + 1, y) || this.get(x, y - 1) || this.get(x, y + 1)) add.push(x, y);
    }
    for (let i = 0; i < add.length; i += 2) this.set(add[i], add[i + 1], GINK);
    return this;
  }
  canvas() {
    const c = makeCanvas(this.w, this.h), x = c.getContext("2d");
    x.putImageData(new ImageData(this.d, this.w, this.h), 0, 0);
    return c;
  }
}

/* ---------- palette ---------- */
const GP = {
  g0: "#334028", g1: "#3b4830", g2: "#445036", dead: "#5e5c40", deadL: "#7a7452", gmud: "#463c2e",
  m0: "#3e3226", m1: "#4c3e2e", m2: "#5c4c38", m3: "#6e5c44", wet: "#2a2622", pud: "#2c343c", pudL: "#5a6a74", straw: "#8a7a4e",
  bog: "#2a3230", bogL: "#3e4a46", bank: "#121614", bankL: "#4e5a54",
  wood: "#4e3e2c", woodL: "#62503a", woodD: "#3a2c20", plank: "#5a4630",
  stone: "#5e5c60", stoneL: "#767478", stoneD: "#4a484c", moss: "#4e5a38",
};

/* ---------- ground ---------- */
function groundColor(wx, wy) {
  const n = gnoise(wx, wy, 22, 1) * 0.75 + gnoise(wx, wy, 7, 2) * 0.25, m = gnoise(wx, wy, 30, 5);
  if (m > 0.8 && n > 0.45) return GP.dead;
  if (m < 0.12 && n < 0.4) return GP.gmud;
  if (n < 0.3) return GP.g0;
  if (n > 0.7) return GP.g2;
  return GP.g1;
}
function rockGroundColor(wx, wy) {   // the southern rocks: grit, gravel and thin scrub
  const n = gnoise(wx, wy, 18, 41) * 0.7 + gnoise(wx, wy, 5, 42) * 0.3, m = gnoise(wx, wy, 34, 43);
  if (m > 0.78 && n > 0.5) return "#4a5034";
  if (n < 0.3) return "#4a443c";
  if (n > 0.72) return "#6a6258";
  return (gh(wx >> 1, wy >> 1, 44) % 9 === 0) ? "#3e3a34" : "#5a544a";
}
function caveFloorColor(wx, wy) {
  const n = gnoise(wx, wy, 14, 51) * 0.7 + gnoise(wx, wy, 4, 52) * 0.3;
  if (gnoise(wx, wy, 22, 53) > 0.82) return "#30343a";
  return n < 0.32 ? "#3a342c" : n > 0.7 ? "#564c40" : "#463e34";
}
function terrainColor(def, wx, wy) { return def.terrain === "rock" ? rockGroundColor(wx, wy) : def.terrain === "cave" ? caveFloorColor(wx, wy) : groundColor(wx, wy); }
/* cliffs: a broken top with a lit rim, a striated face where the rock drops to the south, darker side faces to east
   and west, and rounded outer corners so the rock reads as a mass rather than a grid of slabs */
function cliffInto(b, def, at, tx, ty, CF) {
  const cave = def.terrain === "cave";
  const top = cave ? ["#1a1614", "#221e1a", "#100c0a"] : ["#6a665e", "#78746b", "#5a564f"];
  const face = cave ? ["#3a322c", "#463c34", "#2a241e"] : ["#3c383c", "#4a464a", "#2a262a"];
  const side = cave ? ["#2a241f", "#211c18"] : ["#343036", "#29252b"];
  const rim = cave ? "#4a4038" : "#868178", ink = cave ? "#0a0806" : "#201c24";
  const isC = (x, y) => { const c = at(x, y); return c === null || c === "C" || c === "O"; };
  // the face is two tiles tall: the lowest row of rock, and the lower part of the row above it
  const d = !isC(tx, ty + 1) ? 1 : !isC(tx, ty + 2) && at(tx, ty + 2) !== null ? 2 : 0;
  const wallN = !isC(tx, ty - 1), wallW = !isC(tx - 1, ty), wallE = !isC(tx + 1, ty);
  const openSW = d && !isC(tx - 1, ty + d - 1), openSE = d && !isC(tx + 1, ty + d - 1);   // the face ends here and turns a corner
  let border = false;
  if (CF) for (let j = -1; j <= 1 && !border; j++) for (let i = -1; i <= 1; i++) if (!isC(tx + i, ty + j)) { border = true; break; }
  for (let y = 0; y < GT; y++) for (let x = 0; x < GT; x++) {
    const wx = tx * GT + x, wy = ty * GT + y;
    let edge = false;
    if (border) {
      const cut = 0.42 + (gnoise(wx, wy, cave ? 7 : 9, 68) - 0.5) * (cave ? 0.22 : 0.16), cf = CF(wx, wy);
      if (cf < cut) continue;                    // a rounded, broken outer edge: the ground shows through
      edge = cf < cut + 0.04;
    }
    let col;
    const fy = d === 1 ? y + (GT - 12) : d === 2 ? y - 12 : -1;   // pixels down from the lip; the lip sits 12px into the upper row
    const faceRow = fy >= 0;
    const sideW = (wallW || openSW) ? x : 99, sideE = (wallE || openSE) ? GT - 1 - x : 99, sd = Math.min(sideW, sideE);
    if (faceRow && fy >= 1) {
      const v = gnoise(wx * 1.6, wy * 0.35, 9, 61);
      col = v < 0.33 ? face[2] : v > 0.7 ? face[1] : face[0];
      if (((wx + (gh(wx >> 3, 3) % 3)) % 9) === 0) col = face[2];
      if (((wy + (gh(wy >> 2, 5) % 4)) % 13) === 0 && gh(wx >> 2, wy >> 3, 6) % 3 === 0) col = face[1];
      const tot = GT * 2 - 12;
      if (fy > tot - 14) col = mix(col, "#000000", (fy - (tot - 14)) / 22);
      if (sd < 7) col = mix(col, "#000000", 0.35 - sd * 0.04);            // the face rounds away at its ends
    } else {
      const v = gnoise(wx, wy, 11, 62) * 0.7 + gnoise(wx, wy, 3, 63) * 0.3;
      col = v < 0.3 ? top[2] : v > 0.7 ? top[1] : top[0];
      if (gnoise(wx, wy, 7, 64) > 0.86) col = top[2];
      if (!cave) { const m = gnoise(wx, wy, 19, 65); if (m > 0.78) col = m > 0.86 ? "#4a5636" : "#46503a"; else if (m < 0.1) col = "#3e3a34"; }   // scrub and grit on the tops
      const cr = gnoise(wx, wy, 9, 67); if (cr > 0.485 && cr < 0.515) col = cave ? "#161210" : "#34302e";   // cracks between the blocks
      else if (cr > 0.515 && cr < 0.53) col = cave ? "#4a443c" : "#76726c";
      if ((gh(wx >> 2, wy >> 2, 66) % 41) === 0) col = top[2];
      // a side face where the rock drops away to the east or west
      if (sd < 10 && !faceRow) { col = (sd < 1) ? ink : ((wx * 3 + (wy >> 2)) % 7 === 0 ? side[1] : side[0]); if (sd > 6) col = mix(col, top[0], (sd - 6) / 5); }
      else if (sd < 12 && !faceRow) col = rim;                                // the rim above the side face
      if (wallN && y < 5) col = y < 1 ? ink : y < 3 ? rim : mix(col, rim, 0.4);   // the far edge catches the light
    }
    if (faceRow && fy === 0) col = rim;                                       // the lip above the face
    if (edge) col = ink;
    b.set(wx, wy, col);
  }
}
function mudColor(wx, wy) {
  const v = gnoise(wx, wy, 16, 3) * 0.75 + gnoise(wx, wy, 5, 4) * 0.25;
  if (gnoise(wx, wy, 13, 11) > 0.85) return GP.wet;
  return v < 0.28 ? GP.m0 : v > 0.74 ? GP.m2 : GP.m1;
}
function bladesInto(b, tx, ty) {   // short grass blades, some pale and dead, scattered across a grass tile
  for (let k = 0; k < 6; k++) {
    const x = tx * GT + (gh(tx, ty, 20 + k) % 28) + 2, y = ty * GT + (gh(tx, ty, 30 + k) % 26) + 5;
    const c = gh(tx, ty, 40 + k) % 4 === 0 ? GP.deadL : GP.g2;
    b.line([[x, y - 3], [x, y]], c); b.set(x + 1, y, GP.g0);
  }
}

/* ---------- sprites ---------- */
const GS = {};   // cache of generated sprites
function gsprite(key, make) { let c = GS[key]; if (!c) { c = make(); GS[key] = c; } return c; }

function sprTreeLeafy(v) {
  const s = new PB(70, 104);
  s.rect(32, 56, 39, 100, "#3a3026"); s.rect(32, 56, 34, 100, "#4e4234");
  s.poly([[26, 102], [32, 94], [39, 94], [46, 102]], "#3a3026");
  const cl = [[34, 30, 18], [20, 42, 13], [50, 40, 13], [36, 50, 12], [26, 22, 10 + (v % 3)]];
  for (const [cx, cy, r] of cl) s.ell(cx - r, cy - r, cx + r, cy + r, "#2e3a28");
  for (const [cx, cy, r] of cl.slice(0, 3)) s.ell(cx - r + 2, cy - r + 1, cx + r - 7, cy + r - 8, "#3c4a32");
  for (let k = 0; k < 10; k++) { const x = 16 + (gh(k, v, 1) % 40), y = 14 + (gh(k, v, 2) % 38); s.rect(x, y, x + 2, y + 1, "#1c2418"); }
  s.line([[34, 56], [24, 44]], "#3a3026", 2); s.line([[37, 56], [48, 44]], "#3a3026", 2);
  return s.outline().canvas();
}
function sprTreeDead(v) {
  const s = new PB(84, 112), bark = "#3a3026", barkL = "#4e4234";
  s.poly([[36, 110], [38, 62], [34, 42], [40, 40], [44, 60], [48, 110]], bark); s.poly([[38, 62], [40, 40], [42, 62]], barkL);
  const br = [
    [[38, 52], [20, 32], [8, 28 + v % 4], [10, 24], [22, 28], [38, 46]], [[42, 48], [60, 30], [74, 24 + v % 5], [76, 28], [62, 34], [44, 54]],
    [[40, 42], [36, 18], [30, 6], [34, 4], [40, 16], [42, 40]], [[22, 30], [16, 14], [20, 14], [26, 28]], [[60, 32], [66, 14], [70, 16], [64, 32]],
  ];
  for (const p of br) s.poly(p, bark);
  s.poly([[28, 110], [36, 100], [48, 100], [58, 110]], bark);
  s.line([[39, 66], [40, 102]], barkL); s.line([[44, 72], [45, 98]], "#2a221a");
  return s.outline().canvas();
}
function sprTreePine(v) {
  const s = new PB(64, 112);
  s.rect(29, 86, 34, 108, "#3a2c22"); s.rect(29, 86, 30, 108, "#4a3a2c");
  const tiers = [[32, 4, 12, 30], [32, 18, 18, 48], [32, 34, 24, 66], [32, 52, 29, 90]];
  for (const [cx, top, hw, bot] of tiers) {
    const jag = [];
    for (let i = 0; i <= 8; i++) { const t = i / 8; jag.push([cx - hw + t * hw * 2, bot - (i % 2 ? 4 : 0) - ((gh(i, v, top) % 3))]); }
    s.poly([[cx, top], ...jag.reverse().map((p) => p).reverse()].concat([]), "#24321f");
    s.poly([[cx, top], [cx - hw * 0.7, bot - 6], [cx - 2, bot - 8]], "#2e3e26");
  }
  for (let k = 0; k < 8; k++) { const x = 14 + (gh(k, v, 5) % 36), y = 24 + (gh(k, v, 6) % 60); s.set(x, y, "#3a4a2e"); s.set(x + 1, y, "#3a4a2e"); }
  return s.outline().canvas();
}
function sprBush(v) {
  const s = new PB(36, 26);
  const cl = [[10, 15, 9], [23, 13, 10], [16, 9, 8]];
  for (const [cx, cy, r] of cl) s.ell(cx - r, cy - r, cx + r, cy + r, "#2e3a28");
  for (const [cx, cy, r] of cl) s.ell(cx - r + 2, cy - r + 1, cx + r - 5, cy + r - 6, "#3e4c32");
  if (v % 2) { s.set(12, 9, "#6a2a2a"); s.set(25, 8, "#6a2a2a"); s.set(19, 14, "#6a2a2a"); }
  return s.outline().canvas();
}
function sprRock(v) {
  const s = new PB(26, 20);
  s.poly([[2, 18], [4, 7], [11, 2], [21, 5], [24, 18]], GP.stone); s.poly([[4, 7], [11, 2], [12, 9], [6, 13]], GP.stoneL);
  s.line([[12, 9], [18, 15]], GP.stoneD); if (v % 2) s.ell(4, 12, 12, 17, GP.moss);
  return s.outline().canvas();
}
function sprRubble2(v, cave) {   // a spill of broken rock at the foot of a cliff
  const s = new PB(30, 18), c0 = cave ? "#3a342e" : GP.stone, c1 = cave ? "#4c443c" : GP.stoneL, c2 = cave ? "#2a2420" : GP.stoneD;
  const pts = [[2, 16, 9], [10, 15, 7], [19, 16, 10], [25, 12, 5], [6, 10, 6]];
  for (let k = 0; k < pts.length; k++) { if ((k + v) % 4 === 3) continue; const [x, y, r] = pts[k]; s.poly([[x - r * 0.5, y], [x - r * 0.4, y - r * 0.7], [x + r * 0.1, y - r], [x + r * 0.5, y - r * 0.5], [x + r * 0.5, y]], c0); s.line([[x - r * 0.4, y - r * 0.7], [x + r * 0.1, y - r]], c1); s.set(Math.round(x), Math.round(y - 2), c2); }
  return s.outline().canvas();
}
function sprStalag(v) {   // a stub of dripstone rising from the cave floor
  const s = new PB(14, 26), h = 14 + (v % 3) * 4;
  s.poly([[1, 25], [5, 25 - h], [7, 25 - h - 2], [9, 25 - h + 1], [13, 25]], "#3e362e"); s.poly([[5, 25 - h], [7, 25 - h - 2], [7, 25]], "#544a3e");
  s.line([[9, 25 - h + 6], [10, 24]], "#2a241e");
  return s.outline().canvas();
}
function sprHeadstone(v) {   // weathered grave markers: a rounded slab, a plain cross, a leaning stone
  const s = new PB(20, 28), c0 = "#6a6866", c1 = "#82807c", c2 = "#4e4c4c";
  if (v === 1) { s.rect(8, 4, 11, 26, c0); s.rect(3, 9, 16, 12, c0); s.rect(8, 4, 9, 26, c1); s.rect(3, 9, 16, 9, c1); }
  else if (v === 2) { s.poly([[4, 26], [6, 9], [10, 5], [15, 8], [16, 26]], c2); s.poly([[6, 9], [10, 5], [10, 26], [6, 26]], c0); }
  else { s.rect(4, 10, 15, 26, c0); s.ell(4, 4, 15, 15, c0); s.rect(4, 10, 6, 26, c1); s.line([[7, 14], [12, 14]], c2); s.line([[7, 17], [11, 17]], c2); }
  if (v !== 1) for (let x = 4; x < 16; x++) if (gh(x, v, 3) % 3 === 0) s.set(x, 25 - (gh(x, v) % 3), GP.moss);
  return s.outline().canvas();
}
function sprFirePit() {   // a ring of soot-black stones around cold ash
  const s = new PB(30, 18);
  s.ell(3, 5, 27, 16, "#2a2622"); s.ell(7, 7, 23, 14, "#4a4640"); s.ell(10, 8, 20, 13, "#6a6660");
  s.line([[9, 11], [21, 9]], "#3a2a1c", 2); s.line([[11, 8], [19, 13]], "#2a1e14", 2);
  for (let k = 0; k < 9; k++) { const a = (k / 9) * Math.PI * 2, x = 15 + Math.cos(a) * 12, y = 10.5 + Math.sin(a) * 5.5; s.ell(x - 3, y - 2, x + 3, y + 2, k % 3 ? "#5a5654" : "#3e3a38"); s.set(Math.round(x - 1), Math.round(y - 1), "#76726e"); }
  return s.outline().canvas();
}
function sprLeanTo() {   // branches against a pole, a torn oilcloth, a bedroll poking out
  const s = new PB(62, 40);
  s.poly([[4, 38], [30, 4], [58, 38]], "#3e3a2c"); s.poly([[8, 38], [30, 9], [30, 38]], "#4a4636"); s.poly([[30, 9], [44, 24], [40, 38], [30, 38]], "#2e2a20");
  for (let k = 0; k < 7; k++) s.line([[8 + k * 7, 38], [30, 5]], "#2a2014");
  s.line([[30, 2], [30, 38]], "#2a1e14", 2); s.line([[26, 4], [34, 8]], "#2a1e14");
  s.poly([[20, 38], [24, 30], [36, 30], [40, 38]], "#14100c"); s.rect(22, 33, 38, 37, "#5a4a36"); s.rect(22, 33, 25, 37, "#6e5c44");
  s.poly([[40, 20], [52, 30], [46, 32]], "#5a5446");
  return s.outline().canvas();
}
function sprDeadLog() {   // a fallen, hollow trunk furred with moss
  const s = new PB(62, 24);
  s.poly([[4, 8], [52, 6], [58, 12], [56, 21], [6, 22], [2, 15]], "#3a3026"); s.poly([[6, 8], [52, 6], [54, 10], [6, 12]], "#4e4234");
  s.ell(48, 6, 60, 21, "#4e4234"); s.ell(51, 9, 58, 18, "#1a140e"); s.ell(52, 10, 56, 15, "#2a2016");
  for (let x = 6; x < 48; x++) if (gh(x, 7) % 3 === 0) s.line([[x, 7], [x, 8 + (gh(x, 2) % 3)]], GP.moss);
  s.line([[14, 16], [30, 15]], "#2a2018"); s.line([[34, 18], [44, 17]], "#2a2018");
  s.line([[8, 22], [2, 23]], "#3a3026"); s.line([[20, 22], [24, 23]], "#3a3026");
  return s.outline().canvas();
}
function sprBones() {
  const s = new PB(30, 14), c = "#b0a890", d = "#7a7460";
  s.line([[3, 10], [15, 6]], c, 2); s.ell(1, 8, 5, 12, c); s.ell(13, 4, 17, 8, c);
  s.line([[18, 11], [27, 9]], d, 2); s.ell(20, 3, 28, 9, c); s.set(23, 5, "#2a241e"); s.set(26, 5, "#2a241e");
  s.line([[7, 3], [9, 1]], d); s.line([[10, 3], [12, 1]], d);
  return s.outline().canvas();
}
function sprStone(v) {
  const s = new PB(10, 8);
  if (v % 2) { s.poly([[1, 7], [2, 3], [6, 1], [9, 4], [8, 7]], GP.stone); s.poly([[2, 3], [6, 1], [6, 4]], GP.stoneL); }
  else { s.poly([[1, 5], [3, 2], [6, 3], [5, 5]], GP.stone); s.set(3, 2, GP.stoneL); }
  return s.outline().canvas();
}
function sprWeed(v) {
  const s = new PB(14, 14);
  if (v === 0) [[2, 9], [4, 12], [6, 8], [8, 11], [10, 7]].forEach(([x, h], k) => s.line([[x, 13], [x + (k % 3) - 1, 13 - h]], ["#445036", "#55603e", "#3a4630"][k % 3]));
  else if (v === 1) { s.poly([[6, 13], [2, 6], [6, 8]], "#3e4a30"); s.poly([[7, 13], [12, 5], [8, 9]], "#4c5838"); s.poly([[6, 13], [6, 2], [8, 8]], "#55603e"); s.outline(); }
  else [[3, 8], [5, 11], [7, 9], [9, 10]].forEach(([x, h], k) => s.line([[x, 13], [x + 1, 13 - h]], ["#7a7452", "#5e5c40"][k % 2]));
  return s.canvas();
}
function sprRoot() { const s = new PB(26, 10); s.line([[0, 8], [8, 6], [16, 7], [25, 4]], "#3a3026", 2); s.line([[10, 6], [14, 2]], "#3a3026"); return s.outline().canvas(); }
function sprSign() {
  const s = new PB(30, 36); s.rect(13, 14, 16, 35, GP.woodD); s.rect(13, 14, 13, 35, GP.wood);
  s.poly([[1, 3], [28, 1], [28, 16], [2, 17]], GP.wood); s.poly([[1, 3], [28, 1], [28, 4], [1, 6]], GP.woodL);
  for (const y of [9, 12]) s.line([[5, y], [24, y - 1]], GP.woodD);
  s.line([[20, 3], [25, 15]], "#2a2018");   // split board
  return s.outline().canvas();
}
function sprFence(m, v) {   // m: neighbours that are fence, bits N E S W
  const s = new PB(34, 34);
  const lean = (gh(v, 2) % 5) - 2, broken = v % 5 === 3;
  if (broken) s.poly([[13, 32], [18, 32], [18 + lean, 20], [13 + lean, 22]], GP.wood);
  else { s.poly([[13, 33], [18, 33], [18 + lean, 4], [13 + lean, 4]], GP.wood); s.line([[13 + lean, 5], [13, 32]], GP.woodL); }
  const rails = [];
  if (m & 2) rails.push([16, 33]); if (m & 8) rails.push([0, 16]);
  for (const [a, b] of rails) {
    if (v % 7 !== 1) s.poly([[a, 11], [b, 12], [b, 15], [a, 14]], "#463828");
    if (v % 3 !== 2) s.poly([[a, 22], [b, 23], [b, 26], [a, 25]], "#463828");
  }
  if ((m & 1) || (m & 4)) { s.rect(14, 0, 17, 33, GP.woodD); s.line([[14, 0], [14, 33]], GP.wood); }
  return s.outline().canvas();
}
function sprStoneWall(v) {
  const s = new PB(34, 40);
  s.rect(1, 8, 32, 39, GP.stoneD); s.rect(1, 4, 32, 10, GP.stone); s.rect(1, 4, 32, 5, GP.stoneL);
  for (let y = 14; y < 40; y += 8) { s.line([[1, y], [32, y]], "#3a383c"); for (let x = 1 + ((y >> 3) % 2) * 8; x < 33; x += 16) s.line([[x, y - 8], [x, y]], "#3a383c"); }
  for (let x = 2; x < 32; x++) if (gnoise(x + v * 40, 0, 5, 9) > 0.5) s.line([[x, 4], [x, 4 + 1 + (gh(x, v) % 3)]], GP.moss);
  return s.outline().canvas();
}
function sprBarricade(v) {
  const s = new PB(36, 44);
  for (const [x, t] of [[3, 2], [12, 0], [21, 4], [30, 1]]) { s.poly([[x, 42], [x + 4, 42], [x + 4, t + 6], [x + 2, t], [x, t + 6]], GP.wood); s.line([[x, t + 6], [x, 42]], GP.woodL); }
  s.poly([[0, 16], [35, 22], [35, 26], [0, 20]], GP.woodD); s.poly([[0, 32], [35, 28], [35, 32], [0, 36]], GP.woodD);
  s.line([[6, 18], [10, 34]], "#5a5a5e");   // nails and wire
  return s.outline().canvas();
}
function sprPillar() {
  /* An ancient monolith: sheared top, weathered grain, worn rune-grooves with a faint ley glow, moss and ivy climbing from a sunken plinth. */
  const W = 76, H = 168, s = new PB(W, H), cx = 38;
  const ST = ["#2e2c34", "#3a3842", "#46444e", "#54525c", "#62606a", "#72707a"];
  const shade = (k) => ST[Math.max(0, Math.min(ST.length - 1, k | 0))];
  // plinth: two sunken slabs, chipped at the corners
  const slab = (x0, x1, y0, y1, top) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const edge = Math.min(x - x0, x1 - x, y - y0);
      if (edge < 2 && gnoise(x, y, 3, 77) > 0.62) continue;                 // bitten edges
      const lit = y < y0 + top ? 3 : x < x0 + (x1 - x0) * 0.35 ? 2 : 1;
      s.set(x, y, shade(lit + (gnoise(x, y, 4, 61) > 0.6 ? 1 : 0) - (gnoise(x, y, 9, 62) < 0.25 ? 1 : 0)));
    }
    for (let x = x0 + 3; x < x1 - 2; x += 9 + (gh(x, y0) % 7)) s.line([[x, y0 + top + 1], [x + (gh(x, y1) % 3) - 1, y1 - 1]], ST[0]);   // joints
  };
  slab(2, W - 3, 150, H - 3, 4);
  slab(9, W - 10, 138, 152, 4);
  // the stone itself: irregular silhouette, wider at the foot, top sheared off at a slant
  const rows = [];
  for (let y = 10; y <= 140; y++) {
    const f = (y - 10) / 130, half = 13 + f * 9 + (gnoise(0, y, 6, 91) - 0.5) * 3;
    let l = Math.round(cx - half + (gnoise(1, y, 9, 92) - 0.5) * 2), r = Math.round(cx + half + (gnoise(2, y, 9, 93) - 0.5) * 2);
    rows.push([y, l, r]);
  }
  for (const [y, l, r] of rows) {
    for (let x = l; x <= r; x++) {
      // sheared top: a slanted break running down to the right, with a jagged lip
      const cut = 10 + (x - (cx - 22)) * 0.42 + (gnoise(x, 0, 3, 94) - 0.5) * 4;
      if (y < cut) continue;
      const u = (x - l) / Math.max(1, r - l);                                 // 0 left (lit) .. 1 right (shadow)
      let k = 4.2 - u * 3.2;
      k += (gnoise(x, y, 5, 95) - 0.5) * 1.6 + (gnoise(x, y, 17, 96) - 0.5) * 1.2;   // grain and old weathering
      if (y < cut + 2) k += 1.2;                                              // fresh-looking break catches light
      s.set(x, y, shade(k));
    }
  }
  // strata and cracks
  for (const yy of [34, 58, 81, 103, 122]) for (let x = cx - 24; x <= cx + 24; x++) if (s.get(x, yy) && gnoise(x, yy, 4, yy) > 0.35) s.set(x, yy + ((gh(x, yy) % 5) === 0 ? 1 : 0), ST[1]);
  const crack = (x, y, n, dir, seed) => { for (let i = 0; i < n; i++) { if (!s.get(x, y)) break; s.set(x, y, ST[0]); if (gh(i, seed) % 3 === 0) s.set(x + 1, y, ST[1]); y++; x += (gh(i, seed, 2) % 3) - 1 + (i % 7 === 0 ? dir : 0); } };
  crack(cx + 6, 24, 40, 1, 3); crack(cx - 9, 70, 30, -1, 4); crack(cx + 12, 96, 26, 1, 5); crack(cx - 2, 112, 22, 0, 6);
  // rune grooves: worn nearly smooth; a few still hold a thread of ley light
  const glyphs = [[[0, 0], [0, 6]], [[-2, 2], [2, 2]], [[-2, 0], [2, 6]], [[0, 0], [2, 3], [0, 6]], [[-2, 6], [0, 0], [2, 6]], [[-2, 0], [-2, 6], [2, 6]]];
  let gy = 28;
  for (let i = 0; i < 12; i++) {
    const g = glyphs[gh(i, 7) % glyphs.length], gx = cx - 2 + ((gh(i, 8) % 3) - 1);
    const worn = gh(i, 9) % 10 < 4, glow = !worn && gh(i, 10) % 3 !== 0;
    for (let k = 0; k + 1 < g.length; k++) s.line([[gx + g[k][0], gy + g[k][1]], [gx + g[k + 1][0], gy + g[k + 1][1]]], worn ? ST[2] : ST[0]);
    if (glow) for (let k = 0; k < g.length; k++) s.set(gx + g[k][0], gy + g[k][1], gh(i, k) % 2 ? "#5fbfb4" : "#3f8a84");
    gy += 9;
  }
  // moss: thick at the foot and on the shadow side, thinning upward; lichen freckles higher up
  for (let y = 40; y <= 152; y++) for (let x = 0; x < W; x++) {
    if (!s.get(x, y)) continue;
    const up = (y - 40) / 112, u = (x - (cx - 22)) / 44;
    const m = gnoise(x, y, 6, 97) * 0.65 + gnoise(x, y, 2, 98) * 0.35;
    if (m > 0.86 - up * 0.32 - u * 0.12) s.set(x, y, m > 0.9 - up * 0.2 ? "#5a6a3c" : "#435030");
    else if (y < 120 && gh(x, y, 99) % 97 === 0) s.set(x, y, "#9a9a72");
  }
  // ivy climbing the lit side
  let ix = cx - 18, iy = 146;
  for (let i = 0; i < 70 && iy > 50; i++) {
    s.set(ix, iy, "#2c3a22"); iy -= 1 + (i % 3 === 0 ? 1 : 0); ix += (gh(i, 31) % 3) - 1; ix = Math.max(cx - 24, Math.min(cx - 10, ix));
    if (i % 4 === 0) { const sd = gh(i, 32) % 2 ? 1 : -1; s.set(ix + sd, iy, "#4e6a34"); s.set(ix + sd * 2, iy, "#5e7c3e"); s.set(ix + sd, iy - 1, "#4e6a34"); }
  }
  // a rusted iron band from some forgotten repair
  for (let x = cx - 24; x <= cx + 24; x++) { if (s.get(x, 92)) { s.set(x, 92, "#4a3026"); s.set(x, 93, gh(x, 93) % 4 ? "#5c3a2a" : "#7a4a30"); } }
  // broken chips at the foot
  for (const [x, y, r] of [[8, 146, 3], [66, 147, 4], [60, 156, 2], [14, 158, 2]]) s.ell(x - r, y - r * 0.7, x + r, y + r * 0.7, ST[2]);
  return s.outline().canvas();
}
/* old flagstones in a ring round the Pillar, half swallowed by grass */
function pillarGround(b, cx, cy) {
  for (let y = -46; y <= 46; y++) for (let x = -80; x <= 80; x++) {
    const d = Math.hypot(x / 80, y / 46); if (d > 1) continue;
    const wx = cx + x, wy = cy + y;
    const cell = ((Math.floor((wx + (Math.floor(wy / 9) % 2) * 6) / 13) * 7 + Math.floor(wy / 9) * 13) >>> 0);
    const gap = (((wx + (Math.floor(wy / 9) % 2) * 6) % 13) === 0) || (wy % 9 === 0);
    const keep = gnoise(wx, wy, 11, 120) > d * 0.62 + 0.1;
    if (!keep) continue;
    if (gap) { b.set(wx, wy, gnoise(wx, wy, 3, 121) > 0.5 ? GP.g0 : "#2a2a28"); continue; }
    const tone = gh(cell, 122) % 3;
    b.set(wx, wy, gnoise(wx, wy, 4, 123) > 0.82 ? GP.moss : ["#55535a", "#5e5c62", "#4c4a50"][tone]);
  }
}
function sprLamp(lit) {
  const s = new PB(18, 64), iron = "#2e2c34", ironL = "#4c4a54", ironD = "#17151b";
  s.poly([[4, 63], [5, 56], [12, 56], [13, 63]], "#3a383e"); s.rect(5, 56, 12, 57, ironL);                  // stone foot
  s.rect(7, 22, 10, 56, iron); s.rect(7, 22, 7, 56, ironL); s.rect(10, 22, 10, 56, ironD);                    // post, lit from the left
  for (const y of [30, 42, 52]) { s.rect(6, y, 11, y + 1, ironD); s.rect(6, y, 11, y, ironL); }               // collars
  s.poly([[7, 56], [4, 59], [13, 59], [10, 56]], iron);                                                       // flare at the base
  s.rect(3, 19, 14, 21, ironD); s.rect(3, 19, 14, 19, ironL);                                                 // lantern floor
  s.rect(3, 5, 14, 18, ironD);                                                                                // lantern body
  const glass = lit ? ["#f0c868", "#d89a44", "#b87830"] : ["#4a5460", "#3a4450", "#2c343e"];
  s.rect(5, 7, 12, 17, glass[1]); s.rect(5, 7, 12, 9, glass[0]); s.rect(5, 15, 12, 17, glass[2]);
  s.rect(8, 7, 9, 17, ironD);                                                                                  // glazing bar
  if (lit) { s.rect(7, 11, 10, 14, "#fff0b0"); }
  s.poly([[2, 5], [8, -1], [15, 5]], iron); s.poly([[2, 5], [8, -1], [8, 5]], ironL); s.rect(7, -2, 9, 0, ironD);  // cap
  for (const [x, y] of [[8, 34], [9, 46], [7, 26], [10, 38], [8, 50]]) s.set(x, y, "#5c3a2a");               // rust
  s.set(7, 40, "#5c3a2a"); s.set(10, 28, "#5c3a2a");
  return s.outline().canvas();
}
function sprWell() {
  const s = new PB(64, 70);
  s.rect(8, 8, 11, 44, GP.woodD); s.rect(52, 8, 55, 44, GP.woodD);
  s.poly([[2, 14], [32, 1], [62, 14], [58, 18], [6, 18]], "#4a4028"); s.poly([[2, 14], [32, 1], [32, 18], [6, 18]], "#5e5032");
  s.rect(4, 40, 59, 68, GP.stoneD); s.rect(4, 40, 59, 45, GP.stone); s.ell(10, 38, 53, 48, "#1e2628"); s.line([[18, 42], [26, 42]], "#3e4a50");
  for (const y of [52, 60]) s.line([[4, y], [59, y]], "#3a383c");
  for (const [x, y] of [[14, 45], [34, 52], [24, 60], [46, 45], [50, 60]]) s.line([[x, y], [x, y + 6]], "#3a383c");
  s.rect(30, 18, 33, 32, "#8a8478"); s.rect(27, 30, 36, 36, GP.wood);
  for (let x = 6; x < 58; x++) if (gnoise(x, 1, 5, 4) > 0.55) s.set(x, 66, GP.moss);
  return s.outline().canvas();
}
function sprBoard() {
  const s = new PB(64, 52);
  s.rect(6, 20, 9, 51, GP.woodD); s.rect(54, 20, 57, 51, GP.woodD);
  s.rect(2, 2, 61, 36, GP.wood); s.rect(2, 2, 61, 5, GP.woodL); s.poly([[0, 2], [32, -4], [63, 2], [63, 5], [0, 5]], "#4a4028");
  const notes = [[8, 10, 18, 26, "#a89a7c"], [22, 8, 34, 22, "#8e8268"], [38, 12, 50, 30, "#9c907a"], [52, 9, 58, 20, "#7e735e"]];
  for (const [x0, y0, x1, y1, c] of notes) { s.rect(x0, y0, x1, y1, c); s.line([[x0 + 2, y0 + 4], [x1 - 2, y0 + 4]], "#5e5848"); s.line([[x0 + 2, y0 + 8], [x1 - 3, y0 + 8]], "#5e5848"); s.set((x0 + x1) >> 1, y0, "#2a2a30"); }
  s.poly([[40, 30], [50, 30], [48, 34], [42, 35]], "#6a2a2a");   // a torn notice, red ink
  return s.outline().canvas();
}
function sprCrow() {
  const s = new PB(14, 10);
  s.poly([[2, 6], [6, 3], [10, 4], [13, 3], [11, 6], [7, 8]], "#1c1a20"); s.set(10, 4, "#5a5a66"); s.set(12, 5, "#8a7a3a");
  s.line([[6, 8], [5, 9]], "#2a2a30"); s.line([[8, 8], [8, 9]], "#2a2a30");
  return s.outline().canvas();
}
function sprFirewood() {
  const s = new PB(40, 26);
  for (let r = 0; r < 3; r++) for (let k = 0; k < 5 - r; k++) {
    const x = 2 + k * 7 + r * 3, y = 18 - r * 7;
    s.ell(x, y, x + 8, y + 7, "#5a4630"); s.ell(x + 2, y + 2, x + 6, y + 5, "#8a7450"); s.set(x + 4, y + 3, "#5a4630");
  }
  return s.outline().canvas();
}
function sprRefuse() {
  const s = new PB(40, 22);
  s.ell(0, 8, 39, 21, "#3e3428"); s.ell(4, 6, 24, 16, "#5a4c38"); s.rect(20, 4, 30, 12, "#5e4a32"); s.line([[20, 4], [30, 12]], "#4a3a28");
  s.ell(28, 12, 36, 18, "#6e6452"); s.rect(8, 12, 12, 15, "#7a7468");
  return s.outline().canvas();
}


/* ---------- interior dressing ---------- */
function sprChest() {
  const s = new PB(30, 24);
  s.rect(1, 8, 28, 23, "#5a3e26"); s.rect(1, 8, 28, 10, "#6e4e30");
  s.poly([[1, 9], [3, 2], [26, 2], [28, 9]], "#6a4a2e"); s.poly([[3, 2], [26, 2], [25, 5], [4, 5]], "#7e5a38");
  for (const x of [5, 23]) { s.rect(x, 2, x + 2, 23, "#3a3640"); s.rect(x, 2, x, 23, "#5a5660"); }
  s.rect(1, 13, 28, 14, "#3a3640"); s.rect(13, 11, 16, 16, "#8a7a46"); s.set(14, 13, "#2a2420");
  return s.outline().canvas();
}
function sprBooks() {
  const s = new PB(22, 18), cols = [["#6a2a2a", "#8a3a34"], ["#2a3e5a", "#3a5478"], ["#4a4a2a", "#6a6a3a"], ["#3e2a4a", "#5a3e6a"]];
  let y = 17;
  for (let i = 0; i < 4; i++) { const h = 3 + (i % 2), w = 16 - i * 2 + (i % 2) * 3, x = 2 + (i * 3) % 5; s.rect(x, y - h, x + w, y, cols[i][0]); s.rect(x, y - h, x + w, y - h, cols[i][1]); s.rect(x + w - 1, y - h + 1, x + w, y - 1, "#d8c8a0"); y -= h + 1; }
  return s.outline().canvas();
}
function sprJugs() {
  const s = new PB(26, 22);
  s.ell(1, 6, 13, 21, "#7a4a2c"); s.ell(3, 8, 7, 18, "#9a6038"); s.rect(5, 2, 9, 7, "#6a3e24"); s.rect(4, 1, 10, 2, "#8a5636"); s.line([[11, 8], [14, 6], [14, 12], [11, 14]], "#5a3420");
  s.ell(13, 11, 24, 21, "#5e6a6e"); s.ell(15, 12, 18, 18, "#7e8a8e"); s.rect(17, 8, 20, 12, "#4e5a5e");
  return s.outline().canvas();
}
function sprCauldron() {
  const s = new PB(30, 28);
  s.line([[4, 27], [7, 19]], "#1e1c22", 2); s.line([[25, 27], [22, 19]], "#1e1c22", 2);
  s.ell(2, 8, 27, 26, "#2a282e"); s.ell(4, 10, 12, 22, "#3e3c44"); s.ell(3, 6, 26, 12, "#1a181e"); s.ell(6, 7, 23, 11, "#3e6a3a"); s.ell(10, 8, 16, 10, "#6a9a4a");
  s.set(18, 8, "#8aba6a"); s.set(13, 9, "#a8d888");
  s.ell(9, 24, 20, 28, "#d8682a"); s.ell(12, 25, 17, 27, "#ffd068");
  return s.outline().canvas();
}
function sprCandles() {
  const s = new PB(16, 20);
  for (const [x, h] of [[2, 10], [7, 14], [11, 8]]) { s.rect(x, 19 - h, x + 2, 19, "#e8dcc0"); s.rect(x, 19 - h, x, 19, "#fff4dc"); s.set(x + 1, 18 - h, "#ffd068"); s.set(x + 1, 17 - h, "#fff3c0"); s.set(x + 2, 20 - h, "#d8c8a8"); }
  s.ell(0, 17, 15, 19, "#c8b890");
  return s.outline().canvas();
}
function sprStraw() {
  const s = new PB(30, 12);
  for (let i = 0; i < 26; i++) { const x = 1 + (gh(i, 3) % 26), y = 2 + (gh(i, 4) % 8), l = 3 + (gh(i, 5) % 4), d = gh(i, 6) % 2 ? 1 : -1; s.line([[x, y], [x + l, y + d]], gh(i, 7) % 3 ? "#a8904e" : "#c8b068"); }
  return s.canvas();
}
function sprHerbs(v) {
  const s = new PB(30, 24);
  s.rect(0, 1, 29, 2, "#3a2a1c");
  const greens = v ? [["#7a3a4a", "#9a5a5a"], ["#8a7a3a", "#aa9a4a"], ["#4a6a3a", "#6a8a4a"]] : [["#4a6a3a", "#6a8a4a"], ["#5a5a3a", "#7a7a4a"], ["#3e5a4a", "#5e7a5a"]];
  for (let k = 0; k < 4; k++) { const x = 3 + k * 7, g = greens[k % 3]; s.line([[x + 2, 2], [x + 2, 6]], "#8a6a3a"); s.poly([[x, 6], [x + 5, 6], [x + 4, 18 + (k % 2) * 3], [x + 1, 18 + (k % 2) * 3]], g[0]); s.line([[x + 1, 8], [x + 2, 16]], g[1]); s.rect(x, 6, x + 5, 7, "#a83a2a"); }
  return s.outline().canvas();
}
function sprPainting(v) {
  const s = new PB(28, 22);
  s.rect(1, 1, 26, 20, "#6a4a26"); s.rect(1, 1, 26, 2, "#9a7a3a"); s.rect(3, 3, 24, 18, v ? "#2a3a4a" : "#3a3020");
  if (v) { s.poly([[3, 14], [10, 8], [15, 12], [20, 6], [24, 12], [24, 18], [3, 18]], "#3e4e3a"); s.ell(16, 4, 20, 8, "#d8c88a"); }
  else { s.ell(9, 6, 18, 15, "#a88a6a"); s.rect(8, 13, 19, 18, "#4a2a3a"); s.rect(11, 6, 16, 8, "#3a2a1e"); }
  return s.outline().canvas();
}
function sprMirror() {
  const s = new PB(24, 30);
  s.rect(1, 1, 22, 28, "#4a3220"); s.rect(1, 1, 22, 3, "#7a5a34"); s.rect(1, 1, 3, 28, "#5e4228");
  s.rect(4, 4, 19, 26, "#1c222a");
  s.rect(5, 5, 18, 25, "#3e4a58"); s.rect(5, 5, 18, 12, "#56667a");            // sky-side of the glass
  s.line([[7, 24], [15, 8]], "#8aa0b8"); s.line([[9, 24], [16, 12]], "#6e8298"); s.set(16, 7, "#d0e0f0");   // a streak of light
  s.rect(5, 22, 18, 25, "#2a323c");
  return s.outline().canvas();
}
function sprShelfW() {
  const s = new PB(30, 20);
  s.rect(0, 16, 29, 18, "#4e3826"); s.rect(0, 16, 29, 16, "#6a4e32"); s.line([[3, 18], [6, 20]], "#3a2a1c"); s.line([[26, 18], [23, 20]], "#3a2a1c");
  const jar = (x, h, c) => { s.rect(x, 15 - h, x + 4, 15, c); s.rect(x + 1, 14 - h, x + 3, 15 - h, "#3a2a1c"); s.set(x + 1, 14 - h + 3, "#ffffff"); };
  jar(2, 7, "#5a7a6a"); jar(8, 9, "#8a5a3a"); jar(14, 6, "#6a6a8a"); jar(20, 8, "#7a6a3a"); s.rect(25, 10, 28, 15, "#d8c8a0");
  return s.outline().canvas();
}
function sprTools() {
  const s = new PB(30, 26);
  s.rect(0, 2, 29, 4, "#4e3826");
  s.rect(3, 4, 4, 20, "#5a4630"); s.rect(1, 18, 6, 24, "#4a4850");                          // hammer
  s.line([[11, 4], [11, 22]], "#3a3840"); s.line([[13, 4], [14, 22]], "#3a3840"); s.rect(10, 20, 15, 23, "#2a2830");   // tongs
  s.rect(19, 4, 20, 14, "#5a4630"); s.poly([[17, 14], [23, 14], [24, 24], [16, 24]], "#6a6870");   // shovel
  s.rect(26, 4, 27, 23, "#5a4630"); s.rect(24, 5, 29, 8, "#4a4850");
  return s.outline().canvas();
}
function sprCloths() {
  const s = new PB(30, 30), cols = ["#a83a4a", "#3a6aa8", "#d8a83a", "#5a8a4a"];
  s.rect(0, 1, 29, 2, "#3a2a1c");
  for (let k = 0; k < 4; k++) { const x = 1 + k * 7; s.rect(x, 2, x + 5, 20 + (k % 2) * 7, cols[k]); s.rect(x + 1, 2, x + 1, 20 + (k % 2) * 7, "#ffffff40"); s.rect(x, 18 + (k % 2) * 7, x + 5, 20 + (k % 2) * 7, cols[(k + 1) % 4]); }
  return s.outline().canvas();
}

/* ---------- interior props, sized to their footprint ---------- */
function sprBarrel() {
  const s = new PB(26, 32); s.ell(1, 1, 24, 9, "#5e4430"); s.rect(1, 5, 24, 27, "#4e3826"); s.ell(1, 23, 24, 31, "#4e3826");
  s.rect(1, 5, 5, 27, "#62483a"); s.ell(4, 2, 21, 8, "#3a2a1e");
  for (const y of [10, 21]) s.rect(1, y, 24, y + 1, "#3a383e");
  return s.outline().canvas();
}
function sprCrate(v) {
  const s = new PB(30, 28); s.rect(1, 1, 28, 26, "#5a4630"); s.rect(1, 1, 28, 3, "#6e5a3e");
  for (const y of [9, 17]) s.line([[1, y], [28, y]], "#3e3022");
  s.line([[2, 2], [27, 25]], "#4a3a28", 2);
  if (v % 2) s.poly([[19, 1], [28, 1], [28, 10], [22, 6]], "#1a1410");
  return s.outline().canvas();
}
function sprSack() {
  const s = new PB(28, 28);
  s.poly([[4, 26], [2, 14], [8, 6], [11, 2], [17, 2], [20, 6], [26, 14], [24, 26]], "#7a6a4a"); s.poly([[4, 26], [2, 14], [8, 6], [11, 2], [13, 26]], "#8a7a56");
  s.line([[10, 6], [18, 6]], "#4e4230"); s.line([[8, 16], [10, 24]], "#5e5238"); s.ell(6, 22, 22, 27, "#6a5c40");
  return s.outline().canvas();
}
function sprBed(v) {
  const s = new PB(32, 64);
  s.rect(1, 2, 30, 62, GP.woodD); s.rect(3, 4, 28, 14, "#8e8670"); s.rect(3, 4, 28, 5, "#a89e86");
  const bl = ["#5a4e44", "#4e4a44", "#5e3a3a"][v % 3];
  s.rect(3, 18, 28, 60, bl); s.rect(3, 18, 8, 60, mix(bl, "#ffffff", 0.12)); s.line([[3, 18], [28, 18]], "#8e8670");
  for (const y of [32, 46]) s.line([[5, y], [26, y]], mix(bl, "#000000", 0.3));
  s.line([[14, 22], [18, 40]], mix(bl, "#000000", 0.25));
  return s.outline().canvas();
}
function sprTable(v) {
  const s = new PB(64, 44);
  s.rect(1, 6, 62, 26, "#5e4630"); s.rect(1, 6, 62, 9, "#6e5438"); s.rect(1, 26, 62, 30, "#3e2e20");
  for (const x of [4, 54]) s.rect(x, 30, x + 5, 43, "#3e2e20");
  for (let k = 0; k < 2; k++) { const x = 12 + k * 26; s.line([[x, 12], [x + 14, 13]], "#4a3828"); }
  if (v % 3 === 1) { s.rect(14, 4, 22, 14, "#6a5a44"); s.rect(15, 5, 21, 7, "#a89060"); s.ell(36, 8, 50, 16, "#7a7468"); s.ell(39, 9, 47, 14, "#4a3a22"); }
  else if (v % 3 === 2) { s.rect(20, 10, 34, 16, "#a89a7c"); s.line([[22, 12], [32, 12]], "#6e6452"); s.rect(44, 6, 48, 14, "#d8ccaa"); s.set(46, 5, "#f6c860"); }
  else { s.ell(18, 8, 30, 15, "#7a7468"); s.rect(40, 6, 46, 14, "#6a5a44"); }
  return s.outline().canvas();
}
function sprChair() {
  const s = new PB(24, 36);
  s.rect(4, 2, 19, 18, "#4e3a28"); s.rect(4, 2, 19, 4, "#5e4630"); s.line([[8, 6], [8, 16]], "#3a2a1e"); s.line([[15, 6], [15, 16]], "#3a2a1e");
  s.rect(2, 18, 21, 24, "#5e4630"); s.rect(2, 18, 21, 19, "#6e5438");
  for (const x of [3, 18]) s.rect(x, 24, x + 2, 35, "#3a2a1e");
  return s.outline().canvas();
}
function sprStool() {
  const s = new PB(22, 26); s.ell(1, 4, 20, 11, "#5e4630"); s.ell(3, 5, 18, 9, "#6a5036");
  for (const x of [3, 10, 17]) s.line([[x, 10], [x - 1 + (x > 10 ? 1 : 0), 25]], "#3e2e20", 2);
  return s.outline().canvas();
}
function sprShelf(v) {
  const s = new PB(32, 58); s.rect(1, 1, 30, 56, "#3a2a1e");
  for (const y of [16, 32, 48, 55]) s.rect(1, y, 30, y + 2, "#5e4630");
  const items = [["#5a6a4a", "#7a5a3a", "#4e5a6a", "#6a6252"], ["#8a7a5a", "#6a5a4a", "#5e5848", "#7a6a50"], ["#4e5a6a", "#6a3a3a", "#5a6a4a", "#8a8478"]][v % 3];
  for (let r = 0; r < 3; r++) for (let k = 0; k < 4; k++) {
    const x = 4 + k * 7, top = r * 16 + 16, h = 6 + (gh(k, r, v) % 6);
    if (gh(k, r, v + 9) % 5 === 0) continue;
    s.rect(x, top - h, x + 4, top - 1, items[(k + r) % 4]); s.set(x + 1, top - h, mix(items[(k + r) % 4], "#ffffff", 0.3));
  }
  return s.outline().canvas();
}
function sprDresser() {
  const s = new PB(64, 44); s.rect(2, 2, 61, 42, "#4a3626"); s.rect(2, 2, 61, 5, "#5e4630");
  for (const y of [10, 22, 34]) { s.rect(6, y, 57, y + 9, "#5a4430"); s.rect(28, y + 4, 35, y + 5, "#8a8270"); }
  s.rect(44, -2 + 2, 50, 2, "#d8ccaa");
  return s.outline().canvas();
}
function sprFireplace(frame) {
  const W = 64, s = new PB(W, 80);
  s.rect(2, 0, W - 3, 78, "#56524e"); s.rect(2, 0, W - 3, 4, "#6a6662");
  for (let y = 9; y < 78; y += 9) { s.line([[2, y], [W - 3, y]], "#3e3a38"); for (let x = 2 + ((y / 9) % 2) * 7; x < W - 2; x += 14) s.line([[x, y - 9], [x, y]], "#3e3a38"); }
  s.rect(W / 2 - 4, 4, W / 2 + 4, 30, "#2a2624");
  s.rect(10, 38, W - 11, 78, "#140c0a"); s.poly([[10, 38], [W / 2, 30], [W - 11, 38]], "#56524e");
  const f = frame ? 4 : 0;
  s.poly([[16, 78], [22, 56 + f], [30, 66], [W / 2, 48 - f], [W / 2 + 8, 64], [W - 18, 78]], "#c8602a");
  s.poly([[22, 78], [28, 64 - f], [W / 2, 58 + f], [W / 2 + 6, 68], [W - 24, 78]], "#e8a040"); s.poly([[W / 2 - 4, 78], [W / 2, 66 + f], [W / 2 + 4, 78]], "#f6d880");
  s.rect(14, 74, W - 15, 78, "#3a2a1e"); s.rect(0, 32, W - 1, 36, "#3a2a1e");
  s.rect(W - 22, 50, W - 20, 74, "#2a2a30"); s.ell(W - 30, 60, W - 12, 74, "#2a2a30");
  return s.outline().canvas();
}
function sprForge(frame) {
  const s = new PB(64, 64);
  s.rect(4, 14, 59, 62, "#4a4846"); s.rect(4, 14, 59, 18, "#5e5c5a");
  for (let y = 24; y < 62; y += 9) s.line([[4, y], [59, y]], "#34322e");
  s.rect(12, 26, 51, 46, "#1a0e0a");
  const f = frame ? 3 : 0;
  s.poly([[14, 46], [20, 32 + f], [26, 40], [32, 28 - f], [38, 40], [44, 33 + f], [50, 46]], "#c8602a"); s.poly([[20, 46], [26, 38], [32, 34 + f], [38, 38], [44, 46]], "#f6c860");
  s.rect(22, 0, 41, 14, "#3a3836"); s.rect(22, 0, 25, 14, "#4a4846");
  s.rect(4, 58, 59, 62, "#3a3836");
  return s.outline().canvas();
}
function sprAnvil() {
  const s = new PB(32, 30);
  s.rect(10, 18, 21, 28, "#3a2c20"); s.poly([[2, 6], [28, 6], [30, 9], [22, 12], [22, 18], [10, 18], [10, 12], [6, 10]], "#4a4a52");
  s.poly([[2, 6], [28, 6], [27, 8], [3, 8]], "#6a6a74"); s.line([[10, 13], [22, 13]], "#34343a");
  return s.outline().canvas();
}
function sprDesk() {
  const s = new PB(64, 44);
  s.rect(1, 8, 62, 28, "#4a3626"); s.rect(1, 8, 62, 11, "#5e4630"); s.rect(1, 28, 62, 32, "#2e2218");
  for (const x of [3, 56]) s.rect(x, 32, x + 4, 43, "#2e2218");
  s.rect(10, 12, 30, 22, "#a89a7c"); s.line([[13, 15], [27, 15]], "#6e6452"); s.line([[13, 18], [25, 18]], "#6e6452");
  s.rect(36, 12, 40, 18, "#2a2a30"); s.line([[40, 12], [46, 4]], "#d8ccaa");
  s.rect(50, 4, 54, 12, "#d8ccaa"); s.set(52, 3, "#f6c860");
  return s.outline().canvas();
}
function sprBench() {
  const s = new PB(64, 40);
  s.rect(1, 10, 62, 22, "#5e4630"); s.rect(1, 10, 62, 13, "#6e5438");
  for (const x of [4, 56]) s.rect(x, 22, x + 4, 39, "#3e2e20");
  s.rect(10, 4, 30, 10, "#7a6a50"); s.line([[34, 6], [50, 8]], "#8a8478", 2); s.rect(50, 4, 56, 10, "#3a2a1e");
  return s.outline().canvas();
}
function sprRack() {
  const s = new PB(32, 58);
  s.rect(2, 2, 5, 56, GP.woodD); s.rect(26, 2, 29, 56, GP.woodD); s.rect(2, 4, 29, 7, GP.wood);
  s.poly([[7, 8], [24, 8], [26, 40], [21, 48], [10, 46], [5, 38]], "#7a5e44"); s.poly([[7, 8], [14, 8], [12, 44], [5, 38]], "#8a6e50");
  s.line([[10, 20], [20, 34]], "#5e4630");
  return s.outline().canvas();
}
function sprBaskets() {
  const s = new PB(64, 34);
  for (const [x, c] of [[2, "#7a6a44"], [22, "#6a5a3a"], [42, "#7a6a44"]]) {
    s.poly([[x, 10], [x + 20, 10], [x + 18, 32], [x + 2, 32]], c); s.ell(x, 6, x + 20, 14, mix(c, "#000000", 0.2));
    for (let y = 16; y < 32; y += 5) s.line([[x + 2, y], [x + 18, y]], mix(c, "#000000", 0.3));
    s.ell(x + 4, 4, x + 16, 10, ["#5a6a3a", "#7a5a2a", "#6a3a2a"][(x / 20) | 0]);
  }
  return s.outline().canvas();
}
function sprBlock() {
  const s = new PB(64, 40);
  s.poly([[4, 12], [58, 10], [60, 38], [2, 38]], GP.stone); s.poly([[4, 12], [58, 10], [58, 16], [4, 18]], GP.stoneL);
  s.line([[14, 18], [18, 36]], GP.stoneD); s.line([[40, 20], [42, 34]], GP.stoneD);
  s.rect(46, 2, 50, 12, "#4a4a52"); s.rect(44, 10, 52, 13, GP.woodD);
  return s.outline().canvas();
}
function sprPlant() {
  const s = new PB(26, 32);
  s.poly([[6, 20], [20, 20], [18, 31], [8, 31]], "#5a3a2a"); s.rect(5, 18, 21, 21, "#6a4a34");
  for (const [x, y] of [[13, 2], [6, 8], [20, 7], [9, 14], [17, 13]]) s.poly([[13, 18], [x, y], [x + 3, y + 2]], ["#3e4a30", "#4c5838", "#55603e"][(x + y) % 3]);
  s.set(10, 6, "#6a5a3a");   // a browning leaf
  return s.outline().canvas();
}
function sprGoat() {
  const s = new PB(34, 28);
  s.ell(6, 8, 26, 20, "#9a8a6e"); s.ell(8, 9, 24, 16, "#b0a07e");           // body
  s.ell(22, 5, 32, 13, "#9a8a6e"); s.rect(28, 9, 33, 12, "#7a6a50");        // head and muzzle
  s.poly([[24, 5], [22, 0], [26, 4]], "#d8d0b8"); s.poly([[28, 5], [28, 0], [31, 5]], "#d8d0b8");   // horns
  s.poly([[24, 5], [22, 3], [24, 8]], "#7a6a50");                          // ear
  s.line([[30, 13], [30, 18]], "#d8d0b8");                                  // beard
  for (const x of [9, 13, 21, 25]) s.rect(x, 19, x + 2, 26, "#6a5a44");     // legs
  s.rect(9, 25, 11, 27, "#2a2220"); s.rect(13, 25, 15, 27, "#2a2220"); s.rect(21, 25, 23, 27, "#2a2220"); s.rect(25, 25, 27, 27, "#2a2220");
  s.poly([[6, 10], [2, 7], [5, 13]], "#9a8a6e"); s.set(28, 8, "#1a1614");   // tail, eye
  return s.outline().canvas();
}
function sprCaveMouth(sealed) {   // a dark arch in the rock with a timber frame (or none, where nobody has dug)
  const k = 1.3, P = (pts) => pts.map(([x, y]) => [Math.round(x * k), Math.round(y * k)]), R = (x0, y0, x1, y1, c) => s.rect(Math.round(x0 * k), Math.round(y0 * k), Math.round(x1 * k), Math.round(y1 * k), c);
  const s = new PB(Math.round(76 * k), Math.round(44 * k));
  s.poly(P([[4, 44], [8, 18], [20, 6], [38, 2], [56, 6], [68, 18], [72, 44]]), "#3a363a");
  s.poly(P([[14, 44], [16, 22], [26, 12], [38, 9], [50, 12], [60, 22], [62, 44]]), "#08060a");
  s.poly(P([[18, 44], [20, 26], [28, 18], [38, 15], [48, 18], [56, 26], [58, 44]]), "#020104");
  for (let n = 0; n < 12; n++) { const x = 8 + (gh(n, 7) % 58), y = 6 + (gh(n, 8) % 12); R(x, y, x + 3, y, "#5a565a"); }
  if (!sealed) {
    R(12, 16, 16, 43, "#4e3e2c"); R(12, 16, 13, 43, "#62503a");
    R(60, 16, 64, 43, "#4e3e2c"); R(60, 16, 61, 43, "#62503a");
    R(9, 13, 67, 17, "#3a2c20"); R(9, 13, 67, 13.5, "#62503a");
  }
  return s.outline().canvas();
}
function sprRubble() {   // a choke of broken stone filling a cave mouth
  const k = 1.1, P = (pts) => pts.map(([x, y]) => [Math.round(x * k), Math.round(y * k)]);
  const s = new PB(Math.round(68 * k), Math.round(46 * k));
  const stones = [[4, 46, 22, 30], [16, 46, 38, 26], [32, 46, 56, 28], [48, 46, 66, 32], [10, 32, 28, 16], [24, 30, 46, 10], [40, 30, 58, 16], [20, 18, 34, 6], [36, 16, 48, 4]];
  stones.forEach(([x0, y1, x1, y0], n) => {
    const c = ["#6e6a6e", "#5e5a5e", "#7a767a", "#545054"][n % 4];
    s.poly(P([[x0, y1], [x0 + 2, y0 + 4], [(x0 + x1) / 2, y0], [x1 - 2, y0 + 3], [x1, y1]]), c);
    s.line(P([[x0 + 3, y0 + 5], [(x0 + x1) / 2, y0 + 1]]), "#9a969a");
    s.line(P([[(x0 + x1) / 2, y1 - 3], [x1 - 3, y0 + 6]]), "#3e3a3e");
  });
  for (let n = 0; n < 18; n++) { const [[x, y]] = P([[4 + (gh(n, 3) % 60), 34 + (gh(n, 4) % 10)]]); s.rect(x, y, x + 2, y + 1, "#4a464a"); }
  return s.outline().canvas();
}
function sprShroom() {   // pale cave-caps with a cold blue glow under the gills
  const s = new PB(30, 26);
  [[6, 24, 4, 12], [15, 24, 6, 6], [24, 24, 4, 13]].forEach(([x, y, r, top]) => {
    s.rect(x - 1, top + r, x + 1, y, "#c8d0d8"); s.set(x - 1, top + r + 2, "#e8f0f4");
    s.ell(x - r - 2, top, x + r + 2, top + r + 2, "#5ab8cc"); s.ell(x - r, top, x + r - 1, top + r - 1, "#8ad8e8");
    s.set(x - 1, top + 1, "#e8fbff"); s.line([[x - r, top + r + 1], [x + r, top + r + 1]], "#2a6a7a");
  });
  return s.outline().canvas();
}
function sprHerbPatch() {   // yarrow and feverfew, worth a few coppers to the right buyer
  const s = new PB(26, 18);
  [[4, 17, 9], [9, 17, 12], [14, 17, 10], [19, 17, 13], [23, 17, 8]].forEach(([x, y, h], k) => s.line([[x, y], [x + (k % 2), y - h]], k % 2 ? "#4a5a34" : "#3e4c2c"));
  [[4, 8], [10, 5], [19, 4], [15, 7], [23, 9]].forEach(([x, y]) => { s.ell(x - 2, y - 1, x + 2, y + 1, "#d8d4c0"); s.set(x, y, "#b8b090"); });
  return s.outline().canvas();
}
function sprBloom() {
  const s = new PB(18, 18);
  for (const [x, y] of [[5, 9], [9, 6], [13, 10]]) { s.line([[x, 17], [x, y + 3]], "#3e5a38"); s.ell(x - 3, y - 2, x + 3, y + 3, "#4a6ab8"); s.ell(x - 2, y - 1, x + 2, y + 2, "#7a9ae0"); s.set(x, y, "#f0e8a0"); }
  s.poly([[2, 17], [6, 13], [8, 17]], "#4a6a40"); s.poly([[10, 17], [14, 13], [16, 17]], "#4a6a40");
  return s.outline().canvas();
}

/* tint toward the ambient palette, darken toward the ground, break up flat fills: makes a sprite sit in the scene instead of on it */
function settleSprite(c, ao = 0.28) {
  const x = c.getContext("2d"), W = c.width, H = c.height, id = x.getImageData(0, 0, W, H), d = id.data;
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const k = (j * W + i) * 4; if (!d[k + 3]) continue;
    const t = j / H, low = t > 0.62 ? (t - 0.62) / 0.38 : 0, n = (gnoise(i * 0.8, j * 0.8, 3, 52) - 0.5) * 14;
    for (let q = 0; q < 3; q++) {
      let v = d[k + q] + n;
      v += ([58, 66, 60][q] - v) * 0.1;            // pull toward the cool ground tone
      v += ([12, 10, 16][q] - v) * (low * ao);     // ambient occlusion near the ground
      d[k + q] = Math.max(0, Math.min(255, v));
    }
  }
  x.putImageData(id, 0, 0);
  return c;
}
const SCALED = new Map();
function scaleSprite(img, k, key) {
  if (!img || k === 1) return img;
  const id = key + "@" + k; let c = SCALED.get(id); if (c) return c;
  c = makeCanvas(Math.max(1, Math.round(img.width * k)), Math.max(1, Math.round(img.height * k)));
  const x = c.getContext("2d"); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = "high"; x.drawImage(img, 0, 0, c.width, c.height);
  SCALED.set(id, c); return c;
}
/* indoor furniture is drawn smaller so a person stands in proportion to it */
const INDOOR_K = { table: 0.74, chair: 0.74, stool: 0.78, bed: 0.82, dresser: 0.74, desk: 0.76, bench: 0.74, rack: 0.84, anvil: 0.8, forge: 0.8, barrel: 0.76, crate: 0.76, sack: 0.78, plant: 0.82, shelf: 0.9, fireplace: 0.84, baskets: 0.78, block: 0.78, chest: 0.8, books: 0.8, jugs: 0.8, cauldron: 0.8, candles: 0.85, straw: 0.9, herbs: 0.85, painting: 0.85, mirror: 0.85, shelfw: 0.85, tools: 0.85, cloths: 0.85, firewood: 0.6 };
const GPROP = {
  goat: () => sprGoat(), bloom: () => sprBloom(), rubble: () => sprRubble(), shroom: () => sprShroom(), herbpatch: () => sprHerbPatch(),
  bed: (v) => sprBed(v), table: (v) => sprTable(v), chair: () => sprChair(), stool: () => sprStool(), shelf: (v) => sprShelf(v),
  dresser: () => sprDresser(), fireplace: (f) => sprFireplace(f), barrel: () => sprBarrel(), crate: (v) => sprCrate(v), sack: () => sprSack(),
  plant: () => sprPlant(), forge: (f) => sprForge(f), anvil: () => sprAnvil(), desk: () => sprDesk(), bench: () => sprBench(), rack: () => sprRack(),
  lantern: () => { const s = new PB(18, 30); s.line([[9, 0], [9, 7]], "#2a2a30"); s.rect(4, 8, 13, 26, "#2a2a30"); s.rect(6, 10, 11, 24, "#d89038"); s.rect(6, 10, 11, 12, "#f6d080"); s.poly([[3, 8], [9, 4], [15, 8]], "#2a2a30"); s.rect(5, 26, 12, 28, "#2a2a30"); return s.outline().canvas(); },
  chest: () => sprChest(), books: () => sprBooks(), jugs: () => sprJugs(), cauldron: () => sprCauldron(), candles: () => sprCandles(), straw: () => sprStraw(),
  herbs: (v) => sprHerbs(v), painting: (v) => sprPainting(v), mirror: () => sprMirror(), shelfw: () => sprShelfW(), tools: () => sprTools(), cloths: () => sprCloths(), firewood: () => sprFirewood(),
  baskets: () => sprBaskets(), block: () => sprBlock(), well: () => sprWell(), lamp: (lit) => sprLamp(lit), board: () => sprBoard(),
  firepit: () => sprFirePit(), leanto: () => sprLeanTo(), deadlog: () => sprDeadLog(), bones: () => sprBones(),
};

/* ---------- buildings ---------- */
/* A building is drawn from its footprint in the map: roof rows above, one wall row with windows (w) and a door (D). */
function sprBuilding(opt, night) {
  const { W, H, roofH, wins, door, style, seed } = opt;
  const s = new PB(W + 12, H + 4), wallTop = roofH, base = H;
  const kind = opt.kind || "";
  const KP = {
    tavern: { roof: ["#3e1e1a", "#6a3a2e", "#84503c"], wall: ["#8a7050", "#9a8260", "#6e5840"], thatch: false },
    smithy: { roof: ["#16181e", "#262a32", "#363c48"], wall: ["#5a5654", "#6a6664", "#464240"], thatch: false },
    store: { roof: ["#2a3a26", "#3e5636", "#52704a"], wall: ["#b4a682", "#c4b894", "#9a8e6c"], thatch: false },
    hall: { roof: ["#1e2438", "#303a5a", "#42507a"], wall: ["#7a7674", "#8c8886", "#5e5a58"], thatch: false },
    chapel: { roof: ["#2a2e3a", "#464c5e", "#5e6680"], wall: ["#a8a49a", "#bab6aa", "#8a867c"], thatch: false },
    cottage: { roof: ["#4a4028", "#6a5a36", "#82703f"], wall: ["#a08a66", "#b49c76", "#86704e"], thatch: true },
    dyehouse: { roof: ["#1e3a3e", "#2e5a5e", "#427a7a"], wall: ["#9a8468", "#ac9676", "#80694e"], thatch: false },
    cooper: { roof: ["#3a2a1c", "#58422a", "#725836"], wall: ["#8c7450", "#9e8660", "#725c3e"], thatch: true },
    watch: { roof: ["#2a1a20", "#4a2a34", "#643a46"], wall: ["#6c6a68", "#7e7c7a", "#54524e"], thatch: false },
    stable: { roof: ["#5a4a22", "#7e6a30", "#9a843c"], wall: ["#7a5e3e", "#8e7048", "#64492e"], thatch: true },
    carter: { roof: ["#2e2e28", "#464438", "#5c5a48"], wall: ["#8a7858", "#9c8a68", "#70603f"], thatch: false },
  }[kind];
  const thatch = KP ? KP.thatch : (style === "hovel" || style === "timber");
  const roofDark = KP ? KP.roof[0] : thatch ? "#4a4028" : "#2e3036", roofMid = KP ? KP.roof[1] : thatch ? "#5e5032" : "#3c4046", roofLit = KP ? KP.roof[2] : thatch ? "#6e5e3c" : "#4a4e56";
  // chimney for warm houses
  if (style !== "hovel") { const cx = W - 34; s.rect(cx, 0, cx + 16, roofH * 0.7, "#4e4c4e"); s.rect(cx, 0, cx + 4, roofH * 0.7, "#625f62"); s.rect(cx - 2, 0, cx + 18, 4, "#3a383a"); }
  const peak = 6, eave = wallTop;
  s.poly([[2, eave], [W / 2 + 6, peak], [W + 10, eave]], roofMid);
  s.poly([[2, eave], [W / 2 + 6, peak], [W / 2 + 6, eave]], roofLit);
  if (style === "hovel") s.poly([[W / 2 + 10, peak + 20], [W / 2 + 36, peak + 28], [W / 2 + 30, eave - 6], [W / 2 + 8, eave - 12]], "#4a4028");   // patch
  if (!thatch) for (let k = 0; k < 4; k++) { const x = 20 + k * (W / 4) + (gh(k, seed) % 10), y = eave - 14 + (gh(k, seed, 1) % 8); s.ell(x, y, x + 12, y + 5, GP.moss); }
  s.rect(0, eave - 2, W + 11, eave + 6, roofDark);
  // walls
  const wallC = KP ? KP.wall : style === "stone" ? ["#6a6662", "#7a7672", "#565250"] : style === "timber" ? ["#958a70", "#a39880", "#7c7260"] : ["#8e8268", "#9c907a", "#766c56"];
  s.rect(6, eave + 6, W + 5, base, wallC[0]); s.rect(6, eave + 6, 12, base, wallC[1]); s.rect(W - 6, eave + 6, W + 5, base, wallC[2]);
  if (style === "stone") {
    for (let y = eave + 14; y < base; y += 9) { s.line([[6, y], [W + 5, y]], "#4a4644"); for (let x = 6 + ((y / 9 | 0) % 2) * 9; x < W + 5; x += 18) s.line([[x, y - 9], [x, y]], "#4a4644"); }
  } else {
    for (let y = eave + 8; y < base - 8; y++) for (let x = 8; x < W + 4; x++) {   // grime and patchy plaster
      const v = gnoise(x * 0.6, y * 0.25, 6, 31 + seed);
      if (v > 0.68) s.set(x, y, wallC[2]); else if (v < 0.2) s.set(x, y, mix(wallC[1], "#ffffff", 0.06));
    }
    const beams = [6, Math.round(W / 2) - 2, W + 1]; if (W > 160) beams.splice(1, 0, Math.round(W / 4), Math.round((3 * W) / 4));
    for (const x of beams) s.rect(x, eave + 6, x + 4, base, "#3a2a1e");
    s.rect(6, eave + 6, W + 5, eave + 10, "#3a2a1e");
    for (let k = 0; k < 6; k++) { const x = 14 + k * (W / 6) + (gh(k, seed, 3) % 6), ln = 8 + (gh(k, seed, 4) % 16); s.rect(x, eave + 11, x + 1, eave + 11 + ln, wallC[2]); }
    if (style === "hovel") { const x = W - 34; s.poly([[x, base - 26], [x + 8, base - 30], [x + 16, base - 22], [x + 10, base - 14], [x + 2, base - 16]], "#5a4030"); for (let y = base - 26; y < base - 14; y += 4) s.line([[x + 2, y], [x + 14, y + 1]], "#3e2a1c"); }
  }
  // mud splashed up the foot of the wall, and a stone footing
  for (let x = 6; x < W + 6; x++) { const top = base - 10 + Math.round(gnoise(x, 0, 5, 77 + seed) * 6); for (let y = top; y < base - 2; y++) s.set(x, y, style === "stone" ? "#4e4a46" : "#5e5240"); }
  s.rect(6, base - 3, W + 5, base, "#4a4642");
  // windows
  const winH = Math.min(26, base - eave - 26), wy = eave + 12;
  for (const wx of wins) {
    const x = wx - 11;
    if (style === "hovel" && gh(wx, seed) % 2 === 0) {   // boarded
      s.rect(x, wy, x + 22, wy + winH, "#1a1614"); s.line([[x - 2, wy + 2], [x + 24, wy + winH - 4]], "#5a4430", 3); s.line([[x - 2, wy + winH - 4], [x + 24, wy + 3]], "#4e3c2c", 3);
      continue;
    }
    s.rect(x, wy, x + 22, wy + winH, "#2a2624");
    const glow = kind === "smithy" ? "#e8782a" : kind === "tavern" ? "#d8a84a" : "#c89a48";
    s.rect(x + 3, wy + 3, x + 19, wy + winH - 3, kind === "smithy" ? glow : (night || kind === "tavern") ? glow : "#2e3a44");
    if (night) s.rect(x + 3, wy + 3, x + 19, wy + 7, "#e0b860"); else s.rect(x + 4, wy + 4, x + 8, wy + 8, "#46566a");
    if (style === "stone") for (const bx of [x + 8, x + 14]) s.rect(bx, wy + 3, bx + 1, wy + winH - 3, "#1a1614");
    else { s.rect(x + 10, wy + 3, x + 12, wy + winH - 3, "#2a2624"); s.rect(x + 3, wy + (winH >> 1), x + 19, wy + (winH >> 1) + 1, "#2a2624"); }
    s.rect(x - 3, wy + winH, x + 25, wy + winH + 3, "#4e4a46");
  }
  // door
  if (door != null) {
    const dx = door - 12, dt = base - Math.min(36, base - eave - 10);
    s.rect(dx - 3, dt - 3, dx + 27, base, "#2a2624");
    if (style === "hovel") s.poly([[dx, dt], [dx + 24, dt + 2], [dx + 24, base], [dx, base]], "#3e2c1e"); else s.rect(dx, dt, dx + 24, base, "#4a3424");
    for (const i of [6, 12, 18]) s.line([[dx + i, dt + 1], [dx + i, base]], "#2a1e14");
    s.rect(dx + 19, dt + 16, dx + 21, dt + 18, "#8a8270");
  }
  // each building gets something that says what it is
  const dxp = door != null ? door - 12 : Math.round(W / 2) - 12, tdoor = base - Math.min(36, base - eave - 10);
  if (kind === "tavern") {          // hanging sign with a foaming mug, and a hooded lantern
    const x = Math.min(W - 24, dxp + 38), y = eave + 12;
    s.rect(x - 6, y - 4, x + 26, y - 2, "#2a1a10"); s.rect(x - 6, y - 4, x - 4, y + 4, "#2a1a10");
    s.rect(x + 1, y - 2, x + 2, y + 3, "#2a1a10"); s.rect(x + 21, y - 2, x + 22, y + 3, "#2a1a10");
    s.rect(x - 1, y + 3, x + 24, y + 22, "#3a2214"); s.rect(x, y + 4, x + 23, y + 21, "#5a3a22");
    s.rect(x + 6, y + 8, x + 15, y + 19, "#d8b060"); s.rect(x + 15, y + 11, x + 19, y + 16, "#d8b060"); s.rect(x + 7, y + 8, x + 14, y + 11, "#f0e8d0");
    s.rect(dxp - 16, tdoor + 4, dxp - 12, tdoor + 14, "#2a1e14"); s.rect(dxp - 18, tdoor + 14, dxp - 10, tdoor + 22, "#e0b050");
  } else if (kind === "smithy") {   // soot stains up the wall, a coal chute and an iron anvil sign
    for (let k = 0; k < 5; k++) { const x = 20 + k * (W / 5), hh = 16 + (gh(k, seed) % 18); for (let y = eave + 12; y < eave + 12 + hh; y++) for (let xx = x; xx < x + 8; xx++) if (gnoise(xx, y, 4, 9) > 0.4) s.set(xx, y, "#2a2628"); }
    const x = Math.min(W - 30, dxp + 38), y = eave + 14;
    s.rect(x - 4, y - 4, x + 28, y - 2, "#1a1618"); s.rect(x + 3, y - 2, x + 4, y + 2, "#1a1618");
    s.rect(x - 1, y + 2, x + 26, y + 20, "#2a2628"); s.poly([[x + 3, y + 7], [x + 22, y + 7], [x + 24, y + 10], [x + 18, y + 12], [x + 18, y + 16], [x + 8, y + 16], [x + 8, y + 12], [x + 5, y + 10]], "#9a9aa4");
    s.rect(Math.round(W * 0.15), base - 16, Math.round(W * 0.15) + 22, base - 3, "#1c1a1c"); s.rect(Math.round(W * 0.15) + 3, base - 19, Math.round(W * 0.15) + 12, base - 14, "#2a2628");
  } else if (kind === "store") {    // striped awning over the shop front, hanging loaf sign
    const aTop = eave + 8, aBot = eave + 22;
    for (let x = 4; x < W + 8; x += 12) {
      const c1 = ((x - 4) / 12 | 0) % 2 ? "#e8e0c8" : "#3e7a4a";
      s.poly([[x, aTop], [x + 12, aTop], [x + 13, aBot], [x - 1, aBot]], c1);
      s.ell(x - 1, aBot - 2, x + 13, aBot + 4, c1);
    }
    s.rect(2, aTop - 2, W + 10, aTop + 1, "#2a3a2a");
    const x = Math.min(W - 22, dxp + 36), y = aBot + 8;
    s.rect(x, y, x + 20, y + 15, "#4a3424"); s.rect(x + 2, y + 2, x + 18, y + 13, "#caa060"); s.ell(x + 4, y + 5, x + 16, y + 11, "#e8c47a"); s.line([[x + 7, y + 6], [x + 9, y + 10]], "#a87a3a");
  } else if (kind === "hall") {     // banners at the door, steps, a lintel
    const bx = [dxp - 30, dxp + 40];
    for (const x of bx) { s.rect(x - 1, eave + 6, x + 15, eave + 9, "#2a2218"); s.rect(x, eave + 9, x + 14, eave + 42, "#7a2430"); s.poly([[x, eave + 42], [x + 7, eave + 36], [x + 14, eave + 42]], "#7a2430"); s.rect(x + 5, eave + 15, x + 9, eave + 29, "#d0b060"); s.rect(x + 2, eave + 19, x + 12, eave + 22, "#d0b060"); }
    s.rect(dxp - 8, base - 5, dxp + 32, base, "#8a8682"); s.rect(dxp - 4, base - 9, dxp + 28, base - 5, "#7a7672");
    s.rect(dxp - 6, tdoor - 8, dxp + 30, tdoor - 3, "#9a9690"); s.poly([[dxp - 6, tdoor - 8], [dxp + 12, tdoor - 18], [dxp + 30, tdoor - 8]], "#8a8682");
  } else if (kind === "workshop") {   // a trade emblem on a hanging board
    const x = Math.min(W - 30, dxp + 38), y = eave + 14, t = opt.trade;
    s.rect(x - 4, y - 4, x + 28, y - 2, "#2a1a10"); s.rect(x - 1, y + 2, x + 26, y + 22, "#3a2a1c"); s.rect(x, y + 3, x + 25, y + 21, "#6a5238");
    if (t === "clerk") { s.rect(x + 7, y + 6, x + 19, y + 18, "#e8dcc0"); s.line([[x + 9, y + 10], [x + 17, y + 10]], "#6a5a4a"); s.line([[x + 9, y + 14], [x + 15, y + 14]], "#6a5a4a"); s.line([[x + 20, y + 4], [x + 12, y + 20]], "#1a1a22", 2); }
    else if (t === "carpenter") { s.rect(x + 5, y + 10, x + 21, y + 15, "#b8b8c0"); for (let k = 0; k < 8; k++) s.rect(x + 5 + k * 2, y + 15, x + 6 + k * 2, y + 17, "#b8b8c0"); s.rect(x + 20, y + 8, x + 24, y + 18, "#7a5030"); }
    else if (t === "tanner") { s.poly([[x + 5, y + 7], [x + 20, y + 6], [x + 22, y + 14], [x + 16, y + 20], [x + 8, y + 19], [x + 4, y + 13]], "#8a5a34"); s.rect(x + 9, y + 10, x + 16, y + 11, "#5a3a20"); }
    else { s.poly([[x + 4, y + 8], [x + 21, y + 8], [x + 24, y + 11], [x + 17, y + 13], [x + 17, y + 18], [x + 8, y + 18], [x + 8, y + 13], [x + 6, y + 11]], "#9a9aa4"); }
  } else if (kind === "chapel") {     // a cross on the gable, a round window, steps
    const cx = Math.round(W / 2 + 6);
    s.rect(cx - 2, peak + 6, cx + 2, peak + 30, "#d4ccb8"); s.rect(cx - 8, peak + 12, cx + 8, peak + 16, "#d4ccb8");
    s.ell(cx - 9, peak + 36, cx + 9, peak + 54, night ? "#d8b060" : "#56688a"); s.ell(cx - 6, peak + 39, cx + 6, peak + 51, night ? "#f0d890" : "#6e82a6");
    s.rect(dxp - 10, base - 5, dxp + 34, base, "#8a8682"); s.rect(dxp - 6, base - 9, dxp + 30, base - 5, "#7a7672");
    s.rect(dxp - 8, tdoor - 8, dxp + 32, tdoor - 3, "#9a9690"); s.poly([[dxp - 8, tdoor - 8], [dxp + 12, tdoor - 20], [dxp + 32, tdoor - 8]], "#8a8682");
  } else if (kind === "dyehouse") {   // cloth drying on a line under the eaves
    s.rect(4, eave + 6, W + 8, eave + 8, "#2a1a10");
    const cols = ["#a83a4a", "#3a6aa8", "#d8a83a", "#5a8a4a", "#7a4a8a"];
    for (let k = 0; k < 5; k++) { const x = 10 + k * ((W - 26) / 5 | 0); s.rect(x, eave + 8, x + 9, eave + 30 + (k % 2) * 8, cols[k]); s.rect(x + 2, eave + 8, x + 3, eave + 30 + (k % 2) * 8, "#ffffff22"); }
  } else if (kind === "cooper") {     // a hoop-and-stave sign
    const x = Math.min(W - 30, dxp + 38), y = eave + 14;
    s.rect(x - 4, y - 4, x + 28, y - 2, "#2a1a10"); s.rect(x - 1, y + 2, x + 26, y + 22, "#3a2a1c"); s.rect(x, y + 3, x + 25, y + 21, "#6a5238");
    s.ell(x + 4, y + 5, x + 21, y + 19, "#9a6a3a"); s.rect(x + 4, y + 9, x + 21, y + 10, "#2a1a10"); s.rect(x + 4, y + 14, x + 21, y + 15, "#2a1a10");
  } else if (kind === "watch") {      // a shield banner and a barred window
    const x = Math.min(W - 26, dxp + 40), y = eave + 8;
    s.rect(x - 1, y - 2, x + 15, y, "#2a2218");
    s.poly([[x, y], [x + 14, y], [x + 14, y + 22], [x + 7, y + 30], [x, y + 22]], "#3a4a6a"); s.rect(x + 6, y + 4, x + 8, y + 24, "#c8a85a"); s.rect(x + 2, y + 10, x + 12, y + 12, "#c8a85a");
    s.rect(dxp - 8, base - 5, dxp + 32, base, "#8a8682");
  } else if (kind === "stable") {     // hay bales, a horseshoe over the door
    s.rect(6, base - 14, 26, base - 2, "#c8a850"); s.rect(6, base - 8, 26, base - 7, "#8a6a2a"); s.rect(10, base - 24, 30, base - 14, "#d4b45c"); s.rect(10, base - 19, 30, base - 18, "#8a6a2a");
    s.ell(dxp + 4, tdoor - 18, dxp + 20, tdoor - 2, "#a8a8b4"); s.ell(dxp + 7, tdoor - 15, dxp + 17, tdoor - 2, "#2a2418");
  } else if (kind === "carter") {     // a wheel on the wall
    const x = Math.min(W - 30, dxp + 38), y = eave + 12;
    s.ell(x, y, x + 24, y + 24, "#5a4028"); s.ell(x + 3, y + 3, x + 21, y + 21, "#2e2218"); s.ell(x + 10, y + 10, x + 14, y + 14, "#8a6a3a");
    s.line([[x + 12, y + 2], [x + 12, y + 22]], "#5a4028"); s.line([[x + 2, y + 12], [x + 22, y + 12]], "#5a4028");
  }
  s.outline();
  // roof texture lines after the outline so they read as drawn detail
  for (let y = peak + 10; y < eave; y += thatch ? 6 : 7) {
    const span = ((y - peak) / (eave - peak)) * (W / 2 + 4), xa = Math.round(W / 2 + 6 - span), xb = Math.round(W / 2 + 6 + span);
    if (thatch) for (let x = xa + 2; x < xb - 2; x += 5) s.line([[x, y], [x - 2, y + 5]], "#40381f");
    else { s.line([[xa, y], [xb, y]], "#26282e"); for (let x = xa + (y % 14); x < xb; x += 10) s.line([[x, y], [x, y + 6]], "#26282e"); }
  }
  s.line([[2, eave], [W / 2 + 6, peak], [W + 10, eave]], GINK);
  for (let x = 4; x < W + 8; x++) if (gnoise(x, 2, 6, seed + 3) > 0.5) s.line([[x, eave - 3 - (gh(x, seed) % 3)], [x, eave - 2]], thatch ? "#3a4028" : GP.moss);   // moss on the eaves
  sprBuilding.anchors = [];
  if (opt.burn) burnBuilding(s, opt, sprBuilding.anchors);
  return s.canvas();
}

/* A house on fire: charred roof, holes burnt through to a glowing frame, windows and door full of flame, soot above them.
   Flame anchors (sprite px) come back so the engine can grow animated pixel flames out of them. */
function burnBuilding(s, opt, anchors) {
  const { W, H, roofH, wins, door, seed } = opt, eave = roofH, peak = 6, base = H;
  const CHAR = ["#14100f", "#201816", "#2c201a"], EMB = ["#5a1a12", "#8a2418", "#d2501c", "#f08a2a", "#ffd068"];
  const inRoof = (x, y) => y > peak + 3 && y < eave - 3 && s.get(x, y) > 0 && Math.abs(x - (W / 2 + 6)) < ((y - peak) / (eave - peak)) * (W / 2 + 4) - 6;
  for (let y = peak + 3; y < eave - 2; y++) for (let x = 4; x < W + 8; x++) {
    if (!inRoof(x, y)) continue;
    const v = gnoise(x * 0.7, y * 0.9, 9, 400 + seed);
    if (v > 0.55) s.set(x, y, v > 0.72 ? CHAR[0] : CHAR[1]); else if (v < 0.12) s.set(x, y, CHAR[2]);
  }
  const n = Math.max(2, Math.round(W / 70));
  for (let k = 0; k < n; k++) {
    const hx = Math.round(W / 2 + 6 + (((gh(k, seed, 61) % 100) / 100) - 0.5) * W * 0.55), hy = Math.round(peak + 14 + ((gh(k, seed, 62) % 100) / 100) * Math.max(4, eave - peak - 30));
    if (!inRoof(hx, hy)) continue;
    const rx = 9 + (gh(k, seed, 63) % 6), ry = 6 + (gh(k, seed, 64) % 4);
    s.ell(hx - rx - 3, hy - ry - 2, hx + rx + 3, hy + ry + 2, CHAR[0]);
    s.ell(hx - rx, hy - ry, hx + rx, hy + ry, EMB[1]);
    s.ell(hx - rx + 3, hy - ry + 2, hx + rx - 3, hy + ry - 2, EMB[2]);
    s.ell(hx - rx + 6, hy - ry + 3, hx + rx - 6, hy + ry - 3, EMB[3]);
    s.ell(hx - 3, hy - 1, hx + 3, hy + 2, EMB[4]);
    for (let r = 0; r < 4; r++) { const a = (gh(k, r, seed) % 628) / 100, l = 5 + (gh(r, k, seed) % 8); s.line([[hx + Math.cos(a) * rx, hy + Math.sin(a) * ry], [hx + Math.cos(a) * (rx + l), hy + Math.sin(a) * (ry + l * 0.6)]], EMB[1]); }
    anchors.push([hx, hy + 2, 1.15]);
  }
  for (let x = 6; x < W + 6; x += 3) if (gh(x, seed, 70) % 4 === 0) { const y = eave - 4 - (gh(x, seed, 71) % 3); if (s.get(x, y) > 0) { s.set(x, y, EMB[2]); s.set(x + 1, y, EMB[3]); } }
  const winH = Math.min(26, base - eave - 26), wy = eave + 12;
  for (const wx of wins) {
    const x = wx - 11;
    s.rect(x + 3, wy + 3, x + 19, wy + winH - 3, EMB[3]); s.rect(x + 5, wy + 6, x + 17, wy + winH - 3, EMB[4]); s.rect(x + 3, wy + 3, x + 19, wy + 6, EMB[2]);
    s.rect(x + 10, wy + 3, x + 12, wy + winH - 3, "#2a1a14");
    for (let yy = wy - 26; yy < wy + 2; yy++) for (let xx = x - 2; xx < x + 25; xx++) if (s.get(xx, yy) > 0 && yy > eave + 6 && gnoise(xx * 0.8, yy * 0.4, 5, 500 + seed) > 0.32 + (wy - yy) * 0.014) s.blend(xx, yy, [18, 12, 12], 0.7);
    anchors.push([x + 11, wy + 2, 0.8]);
  }
  if (door != null) {
    const dx = door - 12, dt = base - Math.min(36, base - eave - 10);
    s.rect(dx + 2, dt + 2, dx + 22, base - 1, EMB[2]); s.rect(dx + 5, dt + 7, dx + 19, base - 1, EMB[3]); s.rect(dx + 8, dt + 14, dx + 16, base - 1, EMB[4]);
    for (const i of [6, 12, 18]) s.line([[dx + i, dt], [dx + i, base]], "#2a1410");
    s.rect(dx - 3, dt - 3, dx + 27, dt, CHAR[0]);
    anchors.push([dx + 12, dt + 3, 0.9]);
  }
}

/* ---------- interior surfaces ---------- */
function plankColor(wx, wy) {
  const row = wy >> 3, len = 96 + (gh(row, 6) % 64), off = gh(row, 5) % 70;
  if (wy % 8 === 0 || (wx + off) % len === 0) return "#2a1e14";
  const seg = ((wx + off) / len) | 0, shade = gh(row * 31 + seg, 9) % 3;
  if (gnoise(wx, wy, 18, 41) > 0.8) return "#3e2e20";
  const v = gnoise(wx * 0.25, wy, 6, row + 3);
  return v > 0.75 ? "#6e5438" : ["#4e3a28", "#5a4430", "#644c34"][shade];
}
function flagColor(wx, wy) {
  const bx = Math.floor((wx + ((wy >> 4) % 2) * 9) / 18), by = wy >> 4;
  const gx = (wx + ((wy >> 4) % 2) * 9) % 18, gy = wy % 16;
  if (gx === 0 || gy === 0) return "#2e2c2e";
  const s = gh(bx, by, 3) % 3; if (gnoise(wx, wy, 9, 8) > 0.82) return "#3a3a30";
  return ["#4a4848", "#545252", "#5e5c5a"][s];
}
function dirtFloorColor(wx, wy) { const v = gnoise(wx, wy, 12, 7) * 0.7 + gnoise(wx, wy, 4, 8) * 0.3; return v < 0.35 ? "#3a3026" : v < 0.72 ? "#4a3c2e" : "#56483a"; }
function upperWallColor(wx, wy, damp) {
  const v = gnoise(wx * 0.5, wy * 0.2, 7, 61);
  if (damp && gnoise(wx, wy * 0.35, 10, 71) > 0.72 && wy % 64 > 10) return "#5e5848";
  return v < 0.3 ? "#7e735e" : v < 0.75 ? "#8e8268" : "#9a8e74";
}

/* ---------- baking a whole map ---------- */

/* ---------- per-building interior themes: every room should read as its own place ---------- */
function tavernPlank(wx, wy) {   // wide, warm boards, ale-stained and well trodden
  const row = wy >> 4, len = 150 + (gh(row, 16) % 60), off = gh(row, 15) % 90;
  if (wy % 16 === 0 || (wx + off) % len === 0) return "#241408";
  const seg = ((wx + off) / len) | 0, sh = gh(row * 29 + seg, 19) % 3;
  if (gnoise(wx, wy, 22, 91) > 0.78) return "#3a2412";   // spilled ale, long dried
  const v = gnoise(wx * 0.2, wy, 6, row + 13);
  return v > 0.78 ? "#8a6234" : ["#6e4a28", "#7a5430", "#64421f"][sh];
}
function storePlank(wx, wy) {   // pale, scrubbed boards laid tidy
  const row = wy >> 3, len = 80 + (gh(row, 26) % 30), off = gh(row, 25) % 60;
  if (wy % 8 === 0 || (wx + off) % len === 0) return "#4e4030";
  const seg = ((wx + off) / len) | 0, sh = gh(row * 31 + seg, 29) % 3;
  return gnoise(wx * 0.3, wy, 6, row + 5) > 0.8 ? "#b09a72" : ["#8e7c5a", "#9a8662", "#86744f"][sh];
}
function hallFloor(wx, wy) {   // polished checkered stone
  const gx = wx % 32, gy = wy % 32;
  if (gx === 0 || gy === 0) return "#14141e";
  const dark = (((wx >> 5) + (wy >> 5)) & 1) === 0, v = gnoise(wx * 0.4, wy * 0.4, 8, 44);
  if (gnoise(wx, wy, 20, 45) > 0.9) return dark ? "#2a2e44" : "#7a7e94";   // a vein in the stone
  return dark ? (v > 0.6 ? "#323650" : "#2a2e44") : (v > 0.6 ? "#6a6e86" : "#5e6278");
}
function sootFlag(wx, wy) {   // forge-floor flagstones blackened with soot and scale
  const c = flagColor(wx, wy), n = gnoise(wx, wy, 14, 83);
  if (n > 0.62) return mix(c, "#141214", 0.55);
  return mix(c, "#141214", 0.22);
}
function sawdustPlank(wx, wy) {   // working boards, scuffed pale with shavings
  const c = plankColor(wx, wy);
  return gnoise(wx, wy, 3, 66) > 0.82 ? "#a89468" : gnoise(wx, wy, 9, 67) > 0.8 ? "#8a7650" : c;
}
const INTERIOR_THEME = {
  tavern: { floor: tavernPlank, upper: ["#7c5a3a", "#8c6a46", "#6a4a2e"], beam: ["#2a160c", "#46281a"], lower: ["#4a2a1c", "#2a160e", "#6a3e28"], trim: "#7a5230", rug: ["#5a2c28", "#6a3a30", "#8a6a3a"] },
  store: { floor: storePlank, upper: ["#bcae8c", "#cabc9c", "#a89a78"], beam: ["#6a5a3c", "#8a7a56"], lower: ["#4a5e46", "#34482f", "#6a8260"], trim: "#d8c890", rug: ["#3a5a4a", "#486a58", "#8a9a6a"] },
  hall: { floor: hallFloor, upper: ["#4a5068", "#565c78", "#3e4358"], beam: ["#1c1c28", "#8a7a46"], lower: ["#3a1e22", "#22100f", "#8a7a46"], trim: "#9a8a52", rug: ["#6a1e30", "#7e2a3c", "#c8a85a"] },
  smith: { floor: sootFlag, upper: ["#3e3c3e", "#4c4a4c", "#302e30"], beam: ["#161214", "#3a3436"], lower: ["#3a3838", "#222022", "#58524e"], trim: "#6a625a", rug: ["#3a2a28", "#4a3430", "#6a4a2a"] },
  chapel: { floor: hallFloor, upper: ["#6a6c78", "#787a88", "#585a68"], beam: ["#22222c", "#8a8a96"], lower: ["#3a3c4a", "#22242e", "#70727e"], trim: "#a8a8b4", rug: ["#3a2a5a", "#4a3a6e", "#c8b46a"] },
  cottage: { floor: tavernPlank, upper: ["#a08a66", "#b09a74", "#8a7658"], beam: ["#3a2616", "#5a3e26"], lower: ["#5a4028", "#3a2818", "#7a5a38"], trim: "#6a4a2c", rug: ["#6a3a30", "#7e4a3a", "#b08a4a"] },
  craft: { floor: sawdustPlank, upper: ["#8e8268", "#9c907a", "#766c56"], beam: ["#2e2218", "#3a2a1e"], lower: ["#3e2e20", "#2a1e14", "#5a4430"], trim: "#5a4430", rug: ["#5e3236", "#6e5a3a", "#463438"] },
};
function interiorThemeFor(id, trade) { if (/^(cottage_|hut)/.test(id)) return INTERIOR_THEME.cottage; return id === "shop" ? (trade === "smith" ? INTERIOR_THEME.smith : INTERIOR_THEME.craft) : INTERIOR_THEME[id] || null; }

/* a smooth field over the tile grid: 1 inside a set of tiles, 0 outside, blurred and bilinear, so a threshold gives curved edges */
function tileField(cells, w, h, test) {
  const W2 = w + 2, F = new Float32Array(W2 * (h + 2));
  const v = (x, y) => (test(cells[clamp(y, 0, h - 1)][clamp(x, 0, w - 1)]) ? 1 : 0);
  for (let y = -1; y <= h; y++) for (let x = -1; x <= w; x++)
    F[(y + 1) * W2 + x + 1] = (4 * v(x, y) + 2 * (v(x - 1, y) + v(x + 1, y) + v(x, y - 1) + v(x, y + 1)) + v(x - 1, y - 1) + v(x + 1, y - 1) + v(x - 1, y + 1) + v(x + 1, y + 1)) / 16;
  const g = (x, y) => F[(clamp(y, -1, h) + 1) * W2 + clamp(x, -1, w) + 1];
  return (wx, wy) => {
    const u = wx / GT - 0.5, vv = wy / GT - 0.5, x0 = Math.floor(u), y0 = Math.floor(vv), fx = u - x0, fy = vv - y0;
    const a = g(x0, y0) + (g(x0 + 1, y0) - g(x0, y0)) * fx, b2 = g(x0, y0 + 1) + (g(x0 + 1, y0 + 1) - g(x0, y0 + 1)) * fx;
    return a + (b2 - a) * fy;
  };
}
/* murky water: dark in the middle, a pale wet sheen at the edge, stretched ripples, a mud bank around it */
const WATER_PAL = {
  town: { deep: "#16222a", mid: "#1c2c34", shallow: "#26383e", sheen: "#3c545a", ripple: "#4a6870", bank: ["#231d16", "#3a2f22", "#4a3e2c"], weed: "#3e4a2a" },
  bog: { deep: "#151d19", mid: "#1b2620", shallow: "#25302a", sheen: "#38463a", ripple: "#4a5a44", bank: ["#1f1a13", "#33291d", "#43372a"], weed: "#4a5a2e" },
};
function waterColor(P, d, wx, wy) {
  if (d < 0.025) return P.sheen;
  let col = d > 0.2 ? P.deep : d > 0.08 ? P.mid : P.shallow;
  const r = gnoise(wx * 0.45, wy * 2.2, 7, 177);
  if (r > 0.72) col = d > 0.2 ? P.mid : P.shallow; else if (r < 0.18 && d > 0.08) col = P.deep;
  if (d < 0.06 && gnoise(wx, wy, 3, 178) > 0.6) col = P.shallow;
  return col;
}
function bakeGrimMap(id, def, cells, w, h, props, trade) {
  const W = w * GT, H = h * GT;
  const b = new PB(W, H);
  const at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? null : cells[y][x]);
  const talls = [], lightsOut = [];
  const ROAD = new Set(["=", "P", "Z", "S"]), WATER = new Set(["~"]);
  const BUILD = new Set(["R", "W", "w", "D"]);
  const isRoad = (x, y) => { const c = at(x, y); return c === "=" || c === "P" || c === "Z" || c === "B"; };
  const isWater = (x, y) => { const c = at(x, y); return c === "~" || c === "B"; };
  bakeGrimMap.rat = 0; bakeGrimMap.clear = []; bakeGrimMap.flames = [];
  const hi = (img, x, y, sortY, extra) => talls.push({ hi: true, img, x, y, sortY, ...(extra || {}) });   // x,y in world units

  if (def.outside) {
    /* ground, roads, water, crops: painted pixel by pixel in world coordinates.
       Water, roads and cliffs are read from smooth fields rather than tile edges, so shores, trails and rock rims
       curve instead of stepping tile by tile. */
    const isWaterC = (c) => c === "~" || c === "B", isRoadC = (c) => c === "=" || c === "P" || c === "Z" || c === "B" || c === "D", isCliffC = (c) => c === "C" || c === "O";
    const WF = tileField(cells, w, h, isWaterC), RF = tileField(cells, w, h, isRoadC), CF = tileField(cells, w, h, isCliffC);
    bakeGrimMap.CF = CF; bakeGrimMap.RF = RF; bakeGrimMap.WF = WF;
    const nearTile = (test, tx, ty, r) => { for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) { const c = at(clamp(tx + i, 0, w - 1), clamp(ty + j, 0, h - 1)); if (test(c)) return true; } return false; };
    const WP = id === "wood" ? WATER_PAL.bog : WATER_PAL.town, town = id === "oak";
    for (let ty = 0; ty < h; ty++) for (let tx = 0; tx < w; tx++) {
      const c = cells[ty][tx];
      const nW = nearTile(isWaterC, tx, ty, 1), nR = nearTile(isRoadC, tx, ty, 1), nR2 = town && nearTile(isRoadC, tx, ty, 2);
      for (let y = 0; y < GT; y++) for (let x = 0; x < GT; x++) {
        const wx = tx * GT + x, wy = ty * GT + y;
        let col = null;
        if (nW && !BUILD.has(c)) {
          const d = WF(wx, wy) + (gnoise(wx, wy, 9, 171) - 0.5) * 0.2 - 0.42;
          if (d >= 0) col = waterColor(WP, d, wx, wy);
          else if (d > -0.12 && !isRoadC(c)) col = d > -0.05 ? WP.bank[0] : (gnoise(wx, wy, 5, 173) > 0.45 ? WP.bank[1] : WP.bank[2]);
        }
        if (!col && (nR || nR2) && c !== "~") {
          const rf = RF(wx, wy) + (gnoise(wx, wy, 7, 172) - 0.5) * 0.16;
          if (rf > 0.36) col = mudColor(wx, wy);
          else if (rf > 0.31) col = gnoise(wx, wy, 3, 174) > 0.5 ? GP.m0 : GP.gmud;   // a ragged lip of trodden earth
          else if (town && rf > 0.12 && gnoise(wx, wy, 13, 175) * (rf + 0.4) > 0.36) col = gnoise(wx, wy, 4, 176) > 0.55 ? GP.gmud : GP.dead;   // grass worn thin beside the roads
        }
        if (!col) {
          if (c === "c") { const row = (wy >> 3) % 2; col = row ? "#3e3226" : (gnoise(wx, wy, 8, 21) > 0.5 ? "#4c3e2e" : "#5a4a36"); }
          else if (isRoadC(c)) col = terrainColor(def, wx, wy);
          else col = terrainColor(def, wx, wy);
        }
        b.set(wx, wy, col);
      }
      if (c === "C" || c === "O") cliffInto(b, def, at, tx, ty, CF);
      else if (!isRoadC(c) && c !== "~" && c !== "c" && !BUILD.has(c) && (!def.terrain || (def.terrain === "rock" && gh(tx, ty, 9) % 3 === 0))) bladesInto(b, tx, ty);
    }
    /* the ground darkens where it meets the foot of a cliff */
    for (let ty = 0; ty < h; ty++) for (let tx = 0; tx < w; tx++) {
      if (isCliffC(cells[ty][tx]) || !nearTile(isCliffC, tx, ty, 1)) continue;
      for (let y = 0; y < GT; y++) for (let x = 0; x < GT; x++) {
        const wx = tx * GT + x, wy = ty * GT + y, cf = CF(wx, wy), sh = CF(wx - 14, wy - 8) > 0.5 ? 0.3 : 0;
        const a = Math.max(sh, cf > 0.18 ? Math.min(0.55, (cf - 0.18) * 1.9) : 0);
        if (a > 0) b.blend(wx, wy, def.terrain === "cave" ? [4, 3, 6] : [14, 12, 16], a);
      }
    }
    /* cart ruts on narrow roads, puddles, straw and stones */
    for (let ty = 0; ty < h; ty++) for (let tx = 0; tx < w; tx++) {
      if (!isRoad(tx, ty)) continue;
      let runH = 0, runV = 0;
      for (let k = -3; k <= 3; k++) { if (isRoad(tx, ty + k)) runV++; if (isRoad(tx + k, ty)) runH++; }
      const horiz = runH >= runV;
      const width = horiz ? [-2, -1, 0, 1, 2].filter((k) => isRoad(tx, ty + k)).length : [-2, -1, 0, 1, 2].filter((k) => isRoad(tx + k, ty)).length;
      if (width === 2 && at(tx, ty) === "=" && id === "oak") {
        const ruts = horiz ? (isRoad(tx, ty - 1) ? [6] : [24]) : (isRoad(tx - 1, ty) ? [6] : [24]);
        for (const k0 of ruts) for (let t = 0; t < GT; t++) {
          const wob = Math.round((gnoise(horiz ? tx * GT + t : ty * GT + t, k0, 12, 21) - 0.5) * 3);
          const p = horiz ? [tx * GT + t, ty * GT + k0 + wob] : [tx * GT + k0 + wob, ty * GT + t];
          b.set(p[0], p[1], GP.wet); b.set(p[0] + (horiz ? 0 : -1), p[1] + (horiz ? -1 : 0), GP.m3); b.set(p[0] + (horiz ? 0 : 1), p[1] + (horiz ? 1 : 0), GP.m0);
        }
      }
      const r = gh(tx, ty, 7);
      if (r % 5 === 0 && bakeGrimMap.RF(tx * GT + 16, ty * GT + 16) > 0.55) {
        const cx = tx * GT + (gh(tx, ty, 8) % 16) + 8, cy = ty * GT + (gh(tx, ty, 9) % 14) + 9;
        b.poly([[cx - 7, cy], [cx - 4, cy - 3], [cx + 3, cy - 3], [cx + 7, cy + 1], [cx + 2, cy + 3], [cx - 5, cy + 3]], GP.wet);
        b.poly([[cx - 5, cy], [cx - 3, cy - 2], [cx + 3, cy - 2], [cx + 5, cy + 1], [cx - 4, cy + 2]], GP.pud); b.line([[cx - 3, cy - 1], [cx + 1, cy - 1]], GP.pudL);
      }
      for (let k = 0; k < 3; k++) {
        const x = tx * GT + (gh(tx, ty, 50 + k) % 26) + 3, y = ty * GT + (gh(tx, ty, 60 + k) % 26) + 3;
        if (k === 0) b.line([[x, y], [x + 4, y - 1]], GP.straw); else { b.rect(x, y, x + 1, y, "#6e6660"); b.set(x, y + 1, GP.m0); }
      }
    }
    /* sparse, sickly crops along the furrows */
    for (let ty = 0; ty < h; ty++) for (let tx = 0; tx < w; tx++) {
      if (cells[ty][tx] !== "c") continue;
      for (let row = 0; row < 4; row++) for (let k = 0; k < 3; k++) {
        if (gh(tx * 3 + k, ty * 4 + row, 5) % 3 === 0) continue;   // gaps where nothing came up
        const x = tx * GT + 4 + k * 10 + (gh(tx, row, k) % 4), y = ty * GT + row * 8 + 6;
        const dead = gh(tx, ty, row * 3 + k) % 4 === 0, c1 = dead ? "#6a6444" : "#4a5634", c2 = dead ? "#5a5238" : "#3a4628";
        b.line([[x, y], [x, y - 5]], c2); b.set(x - 1, y - 4, c1); b.set(x + 1, y - 3, c1); b.set(x - 1, y - 2, c2); b.set(x + 2, y - 5, c1);
      }
    }
    /* water surface lines and reeds; bridge planks */
    for (let ty = 0; ty < h; ty++) for (let tx = 0; tx < w; tx++) {
      const c = cells[ty][tx];
      if (c === "~") {
        const WPc = id === "wood" ? WATER_PAL.bog : WATER_PAL.town;
        for (let k = 0; k < 2; k++) { const x = tx * GT + (gh(tx, ty, k) % 24) + 2, y = ty * GT + (gh(ty, tx, k) % 26) + 3; if (bakeGrimMap.WF(x, y) > 0.7) { b.line([[x, y], [x + 5, y]], WPc.ripple); b.set(x + 1, y + 1, WPc.deep); } }
        const shore = ["~", "B"].includes(at(tx - 1, ty)) + ["~", "B"].includes(at(tx + 1, ty)) + ["~", "B"].includes(at(tx, ty - 1)) + ["~", "B"].includes(at(tx, ty + 1)) < 4;
        if (shore && gh(tx, ty) % 3 === 0) { const x = tx * GT + (gh(tx, ty, 5) % 22) + 4, y0 = ty * GT + (gh(tx, ty, 6) % 12) + 16; for (const d of [0, 2, 4, 5]) b.line([[x + d * 1.5, y0], [x + d * 1.5 - 1, y0 - 9 - (d % 3) * 3]], d % 2 ? "#4e5434" : "#5e6440"); b.line([[x - 1, y0 + 1], [x + 9, y0 + 1]], WPc.bank[0]); }
        if (id === "wood" && gh(tx, ty, 3) % 2 === 0) for (let k = 0; k < 7; k++) { const x = tx * GT + (gh(tx, ty, 30 + k) % 28) + 2, y = ty * GT + (gh(tx, ty, 40 + k) % 28) + 2; b.set(x, y, WPc.weed); b.set(x + 1, y, WPc.weed); }
      }
      if (c === "B") {
        const horiz = isRoad(tx - 1, ty) || isRoad(tx + 1, ty) || at(tx - 1, ty) === "B" && at(tx + 1, ty) === "B";
        for (let y = 0; y < GT; y++) for (let x = 0; x < GT; x++) {
          const k = horiz ? x : y, wx = tx * GT + x, wy = ty * GT + y;
          const seam = k % 8 === 0 || ((horiz ? y : x) === 0 && false);
          let col = seam ? "#2a1e14" : (gh((horiz ? wx : wy) >> 3, 4) % 3 === 0 ? "#5a4630" : "#4e3e2c");
          if (gnoise(wx, wy, 6, 19) > 0.8) col = "#3a2c20";
          b.set(wx, wy, col);
        }
        // landing boards: planks run out over the bank at each end so no strip of water shows between the bridge and the road
        for (const [dx, dy] of horiz ? [[-1, 0], [1, 0]] : [[0, -1], [0, 1]]) {
          if (at(tx + dx, ty + dy) === "B" || at(tx + dx, ty + dy) === "~") continue;
          for (let e = 0; e < 11; e++) for (let t = 0; t < GT; t++) {
            const wx = horiz ? (dx < 0 ? tx * GT - 1 - e : (tx + 1) * GT + e) : tx * GT + t, wy = horiz ? ty * GT + t : (dy < 0 ? ty * GT - 1 - e : (ty + 1) * GT + e);
            const k = horiz ? wx : wy; let col = k % 8 === 0 ? "#2a1e14" : (gh(k >> 3, 4) % 3 === 0 ? "#5a4630" : "#4e3e2c");
            if (e >= 9 && gnoise(wx, wy, 5, 23) > 0.45) continue;   // ragged outer edge
            b.set(wx, wy, col);
          }
        }
        // rails as tall pieces so characters pass behind the far one
        // posts at the bridge ends and a two-beam rail between them, lit along the top so it reads against the planks
        const rail = new PB(GT, 16), endL = at(tx - 1, ty) !== "B", endR = at(tx + 1, ty) !== "B";
        rail.rect(0, 4, GT - 1, 6, "#4a3826"); rail.rect(0, 4, GT - 1, 4, "#8a6c46"); rail.rect(0, 10, GT - 1, 11, "#3e2e20"); rail.rect(0, 10, GT - 1, 10, "#6e5638");
        for (const px of [endL ? 1 : -1, Math.floor(GT / 2) - 2, endR ? GT - 5 : -1]) if (px >= 0) { rail.rect(px, 0, px + 3, 15, "#3a2a1c"); rail.rect(px, 0, px + 3, 1, "#9a7a50"); rail.rect(px + 3, 2, px + 3, 15, "#2a1e14"); }
        rail.outline();
        const rc = rail.canvas();
        if (horiz) {
          if (at(tx, ty - 1) !== "B") hi(rc, tx * TILE, ty * TILE - 8, ty * TILE);
          if (at(tx, ty + 1) !== "B") hi(rc, tx * TILE, (ty + 1) * TILE - 7, (ty + 1) * TILE + 2);
        }
      }
    }
    /* buildings: connected footprints of roof/wall tiles */
    const seen = new Uint8Array(w * h);
    const buildings = [];
    for (let ty = 0; ty < h; ty++) for (let tx = 0; tx < w; tx++) {
      if (seen[ty * w + tx] || !BUILD.has(cells[ty][tx])) continue;
      let x0 = tx, x1 = tx, y0 = ty, y1 = ty; const stack = [[tx, ty]]; seen[ty * w + tx] = 1;
      const wins = [], doors = [];
      while (stack.length) {
        const [x, y] = stack.pop(); x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
        if (cells[y][x] === "w") wins.push(x); if (cells[y][x] === "D") doors.push([x, y]);
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && ny >= 0 && nx < w && ny < h && !seen[ny * w + nx] && BUILD.has(cells[ny][nx])) { seen[ny * w + nx] = 1; stack.push([nx, ny]); }
        }
      }
      buildings.push({ x0, x1, y0, y1, wins, doors });
    }
    const warpTo = {};
    for (const wp of def.warps || []) warpTo[`${wp.x},${wp.y}`] = wp.to;
    for (const bd of buildings) {
      const tw = bd.x1 - bd.x0 + 1, th = bd.y1 - bd.y0 + 1;
      const door = bd.doors[0];
      const to = door ? warpTo[`${door[0]},${door[1]}`] : null;
      const style0 = to === "hall" || (to === "shop" && trade === "smith") ? "stone" : to === "store" ? "timber" : to === "tavern" ? "timber" : to === "shop" ? "timber" : "hovel";
      const kind0 = to === "shop" ? (trade === "smith" ? "smithy" : "workshop") : to === "store" ? "store" : to === "hall" ? "hall" : to === "tavern" ? "tavern" : "";
      const dk = door && (def.doorKinds || {})[`${door[0]},${door[1]}`];
      const style = dk ? (dk === "chapel" || dk === "watch" ? "stone" : "timber") : style0;
      const kind = dk || kind0;
      const BW = tw * GT, BH = th * GT;
      const opt = { W: BW - 12, H: BH, roofH: Math.round(BH * 0.52), wins: bd.wins.map((x) => (x - bd.x0) * GT + 10), door: door ? (door[0] - bd.x0) * GT + 10 : null, style, seed: bd.x0 * 7 + bd.y0, kind, trade };
      if (def.burning) opt.burn = true;
      const day = sprBuilding(opt, false), night = style === "hovel" ? day : sprBuilding(opt, true);
      const px = bd.x0 * GT - 4, py = bd.y0 * GT - 4;
      if (def.burning) for (const [ax, ay, sc] of sprBuilding.anchors) bakeGrimMap.flames.push([(px + ax) / WZ, (py + ay) / WZ, sc, (py + day.height) / WZ]);
      /* collision follows the drawn house: roof tiles outside the gable (the empty corners) are walkable */
      {
        const eave = opt.roofH, peak = 6, half = opt.W / 2 + 4;
        for (let ty = bd.y0; ty <= bd.y1; ty++) for (let tx = bd.x0; tx <= bd.x1; tx++) {
          if (cells[ty][tx] !== "R") continue;
          const cxs = (tx - bd.x0) * GT + 4 + GT / 2, cys = (ty - bd.y0) * GT + 4 + GT * 0.72;
          if (cys >= eave) continue;
          const t = Math.max(0, Math.min(1, (eave - cys) / (eave - peak)));
          if (cys < peak + 2 || cxs < 2 + t * half + 4 || cxs > opt.W + 10 - t * half - 4) bakeGrimMap.clear.push([tx, ty]);
        }
      }
      castShadow(b, day, px, py, 12, 6, 0.42);
      contactBand(b, px + 4, px + day.width - 6, py + day.height - 5, 9, 0.5);
      for (let k = 0; k < day.width; k += 18) mudPatch(b, px + k + 8, py + day.height + 1, 12, 4, k + bd.x0);
      hi(null, px / WZ, py / WZ, (bd.y1 + 1) * TILE - 1, { lit: [day, night] });
      // weeds and stones growing along the foot of the wall, drawn in front of it
      const baseY = (py + day.height - 2) / WZ;
      for (let k = 0; k < Math.floor(day.width / 11); k++) {
        const wx = (px + 4 + k * 11 + (gh(k, bd.x0, 1) % 6)) / WZ;
        if (door && Math.abs(wx * WZ - (bd.x0 * GT + opt.door)) < 18) continue;   // keep the doorway clear
        if (gh(k, bd.x0, 2) % 4) hi(gsprite("weed" + (gh(k, bd.x0, 3) % 3), () => sprWeed(gh(k, bd.x0, 3) % 3)), wx, baseY - 6 + (gh(k, bd.x0, 4) % 2), baseY + 1.5);
        if (gh(k, bd.x0, 5) % 3 === 0) hi(gsprite("stone" + (k % 2), () => sprStone(k % 2)), wx + 2, baseY - 1, baseY + 2);
      }
      // a worn track from the door down to the road
      if (door) {
        const dxp = bd.x0 * GT + opt.door + 2, dyp = (door[1] + 1) * GT;
        let ey = dyp; for (let k = 1; k < 5; k++) if (isRoad(door[0], door[1] + k)) { ey = (door[1] + k) * GT + 4; break; }
        footTrack(b, [[dxp, dyp - 2], [dxp + 4, ey]], 7, bd.x0);
      }
      // lived-in things against the wall
      const rx = (px + day.width - 52) / WZ, lx = (px + 10) / WZ;
      if (kind === "smithy") { hi(gsprite("anvil", sprAnvil), rx, baseY - 14, baseY + 0.5); hi(gsprite("barrel", sprBarrel), lx, baseY - 15, baseY + 0.5); }
      else if (kind === "store") { hi(gsprite("crate0", () => sprCrate(0)), rx - 4, baseY - 14, baseY + 0.5); hi(gsprite("crate1", () => sprCrate(1)), rx + 12, baseY - 12, baseY + 0.7); hi(gsprite("sack", sprSack), lx, baseY - 14, baseY + 0.5); }
      else if (kind === "tavern") { hi(gsprite("barrel", sprBarrel), lx, baseY - 15, baseY + 0.5); hi(gsprite("barrel", sprBarrel), lx + 14, baseY - 15, baseY + 0.7); hi(gsprite("bench", sprBench), rx - 8, baseY - 10, baseY + 0.5); }
      else if (kind === "hall") { hi(gsprite("plant", sprPlant), lx, baseY - 18, baseY + 0.5); hi(gsprite("plant", sprPlant), rx + 24, baseY - 18, baseY + 0.5); }
      else if (kind === "workshop") { hi(gsprite("crate0", () => sprCrate(0)), rx, baseY - 14, baseY + 0.5); hi(gsprite("firewood", sprFirewood), lx, baseY - 12, baseY + 0.5); }
      else if (style !== "stone") hi(gsprite("firewood", sprFirewood), rx, baseY - 12, baseY + 0.5);
      else { hi(gsprite("barrel", sprBarrel), lx, baseY - 15, baseY + 0.5); }
    }
    /* trees, bushes, rocks, signs, fences, walls, barricades, pillar */
    for (let ty = 0; ty < h; ty++) for (let tx = 0; tx < w; tx++) {
      const c = cells[ty][tx], r = gh(tx, ty, 77);
      if (c === "O" && at(tx - 1, ty) !== "O") {   // a cave mouth, two tiles wide, cut into the cliff face
        const sealed = (def.warps || []).some((wp) => wp.x === tx && wp.y === ty && wp.to === "caveS");
        const img = gsprite("cavemouth" + (sealed ? 1 : 0), () => sprCaveMouth(sealed));
        const ox = tx * GT + GT - img.width / 2, oy = (ty + 1) * GT - img.height + 2;
        hi(img, ox / WZ, oy / WZ, ty * TILE + 1);
      } else if (c === "T") {
        const kind = def.terrain === "rock" ? "dead" : r % 10 < 5 ? "pine" : r % 10 < 8 ? "leafy" : "dead", v = r % 4;
        const img = gsprite(`tree_${kind}${v}`, () => (kind === "pine" ? sprTreePine(v) : kind === "leafy" ? sprTreeLeafy(v) : sprTreeDead(v)));
        const ox = (gh(tx, ty, 2) % 13) - 6, ox2 = tx * GT + 16 - img.width / 2 + ox, oy = ty * GT + 28 - img.height - (gh(tx, ty, 4) % 9);
        castShadow(b, img, ox2, oy, 14, 5, 0.3);
        hi(img, ox2 / WZ, oy / WZ, ty * TILE + 14 + (ox & 1));
        const open = at(tx, ty + 1) !== "T" && at(tx, ty + 1) !== null;
        if (open && gh(tx, ty, 6) % 3 !== 0) {   // undergrowth where the trees give way, so the edge of a wood is ragged rather than ruled
          const bimg = gsprite("bush" + (r % 2), () => sprBush(r % 2)), bx = tx * GT + (gh(tx, ty, 7) % 14) - 4, by = ty * GT + 32 - bimg.height + 2;
          castShadow(b, bimg, bx, by, 4, 3, 0.3); hi(bimg, bx / WZ, by / WZ, ty * TILE + 15.5);
        }
        if (open) for (let k = 0; k < 2; k++) hi(gsprite("weed" + ((r + k) % 3), () => sprWeed((r + k) % 3)), tx * TILE + (gh(tx, ty, 8 + k) % 14), ty * TILE + 16 + (k ? 1 : -1), ty * TILE + 23);
      } else if (c === "b") {
        const img = gsprite("bush" + (r % 2), () => sprBush(r % 2)), ox = tx * GT + 16 - 18, oy = ty * GT + 30 - img.height;
        castShadow(b, img, ox, oy, 5, 3, 0.35); hi(img, ox / WZ, oy / WZ, ty * TILE + 15);
        for (let k = 0; k < 2; k++) hi(gsprite("weed" + ((r + k) % 3), () => sprWeed((r + k) % 3)), tx * TILE + (k ? 11 : 0) + (gh(tx, ty, k) % 3), ty * TILE + 9, ty * TILE + 15.5);
      } else if (c === "r" && def.graveyard && tx >= def.graveyard.x0 && tx <= def.graveyard.x1 && ty >= def.graveyard.y0 && ty <= def.graveyard.y1) {
        const img = gsprite("grave" + (r % 3), () => sprHeadstone(r % 3)), ox = tx * GT + 6, oy = ty * GT + 22 - img.height;
        b.ell(tx * GT + 4, ty * GT + 18, tx * GT + 27, ty * GT + 31, GP.m1); b.ell(tx * GT + 6, ty * GT + 20, tx * GT + 25, ty * GT + 29, "#52432f");   // the mound
        castShadow(b, img, ox, oy, 4, 2, 0.35); hi(img, ox / WZ, oy / WZ, ty * TILE + 11);
      } else if (c === "r") {
        const img = gsprite("rock" + (r % 2), () => sprRock(r % 2)), ox = tx * GT + 3, oy = ty * GT + 30 - img.height;
        castShadow(b, img, ox, oy, 4, 3, 0.35); hi(img, ox / WZ, oy / WZ, ty * TILE + 15);
        contactBand(b, ox + 3, ox + img.width - 3, oy + img.height - 4, 4, 0.45);
        for (let k = 0; k < 2; k++) if (gh(tx, ty, 140 + k) % 3) { const sx = tx * TILE + (k ? 13 : -1) + (gh(tx, k, 3) % 3), sy = ty * TILE + 13; hi(gsprite("stone" + ((tx + k) % 2), () => sprStone((tx + k) % 2)), sx, sy - 3, sy + 1.5); }
        if (gh(tx, ty, 142) % 2) hi(gsprite("weed" + (r % 3), () => sprWeed(r % 3)), tx * TILE + 6, ty * TILE + 9, ty * TILE + 15.5);
      } else if (c === "S") {
        const img = gsprite("sign", sprSign), ox = tx * GT + 1, oy = ty * GT + 30 - img.height;
        castShadow(b, img, ox, oy, 5, 3, 0.35); hi(img, ox / WZ, oy / WZ, ty * TILE + 15);
      } else if (c === "f") {
        const m = (at(tx, ty - 1) === "f" ? 1 : 0) | (at(tx + 1, ty) === "f" ? 2 : 0) | (at(tx, ty + 1) === "f" ? 4 : 0) | (at(tx - 1, ty) === "f" ? 8 : 0);
        const img = gsprite(`fence${m}_${r % 8}`, () => sprFence(m, r % 8)), ox = tx * GT - 1, oy = ty * GT + 30 - img.height;
        castShadow(b, img, ox, oy, 4, 3, 0.3); hi(img, ox / WZ, oy / WZ, ty * TILE + 15);
      } else if (c === "#") {
        const img = gsprite("swall" + (r % 4), () => sprStoneWall(r % 4)), ox = tx * GT - 1, oy = ty * GT + 32 - img.height;
        castShadow(b, img, ox, oy, 6, 4, 0.38); hi(img, ox / WZ, oy / WZ, ty * TILE + 15);
      } else if (c === "Z") {
        const img = gsprite("barricade" + (r % 2), () => sprBarricade(r % 2)), ox = tx * GT - 2, oy = ty * GT + 32 - img.height;
        castShadow(b, img, ox, oy, 6, 4, 0.38); hi(img, ox / WZ, oy / WZ, ty * TILE + 15);
      }
    }
    if (def.pillar) {
      const img = gsprite("pillar", sprPillar), px = def.pillar.x * WZ - img.width / 2, py = 18 * GT + 6 - img.height;
      pillarGround(b, def.pillar.x * WZ, 18 * GT - 4);
      castShadow(b, img, px, py, 14, 6, 0.3);
      hi(img, px / WZ, py / WZ, 18 * TILE - 2);
    }
    /* trampled, ash-smeared earth where people have camped */
    for (const cp of def.camps || []) {
      const cx = cp.x * GT + 16, cy = cp.y * GT + 16;
      for (let y = -cp.r * GT; y <= cp.r * GT; y++) for (let x = -cp.r * GT; x <= cp.r * GT; x++) {
        const wx = cx + x, wy = cy + y, dd = Math.hypot(x, y * 1.5) / (cp.r * GT) + (gnoise(wx, wy, 9, 181) - 0.5) * 0.5;
        if (dd < 0.75) b.set(wx, wy, gnoise(wx, wy, 5, 182) > 0.6 ? GP.m0 : dd < 0.35 && gnoise(wx, wy, 4, 183) > 0.7 ? "#2e2a26" : GP.gmud);
        else if (dd < 0.95 && gnoise(wx, wy, 3, 184) > 0.5) b.set(wx, wy, GP.dead);
      }
    }
    /* rock spilled at the foot of the cliffs, a few boulders on the tops, dripstone along cave walls */
    if (def.terrain === "rock" || def.terrain === "cave") {
      const cave = def.terrain === "cave", isC = (x, y) => { const c = at(x, y); return c === "C" || c === "O"; };
      for (let ty = 1; ty < h - 1; ty++) for (let tx = 1; tx < w - 1; tx++) {
        const c = cells[ty][tx], r = gh(tx, ty, 131);
        if (isC(tx, ty)) {
          if (!cave && isC(tx, ty + 1) && isC(tx, ty + 2) && isC(tx - 1, ty) && isC(tx + 1, ty) && isC(tx, ty - 1) && r % 9 === 0) {
            const img = gsprite("rock" + (r % 2), () => sprRock(r % 2)), ox = tx * GT + (r % 8), oy = ty * GT + 26 - img.height;
            castShadow(b, img, ox, oy, 4, 3, 0.35); hi(img, ox / WZ, oy / WZ, ty * TILE + 13);
          }
          continue;
        }
        if (c !== "." && c !== "," && c !== "*") continue;
        if (bakeGrimMap.RF(tx * GT + 16, ty * GT + 16) > 0.3 || (def.warps || []).some((wp) => Math.abs(wp.x - tx) < 2 && Math.abs(wp.y - ty) < 3)) continue;
        const up = isC(tx, ty - 1), side = isC(tx - 1, ty) || isC(tx + 1, ty);
        if ((up || side) && r % 3 === 0) {
          const img = gsprite("rubble2_" + (r % 4) + (cave ? "c" : ""), () => sprRubble2(r % 4, cave));
          const ox = tx * GT + (isC(tx - 1, ty) ? 0 : isC(tx + 1, ty) ? GT - img.width : (r % 6)), oy = ty * GT + (up ? 2 : 10);
          castShadow(b, img, ox, oy, 3, 2, 0.3); hi(img, ox / WZ, oy / WZ, ty * TILE + (up ? 2 : 10) / WZ + img.height / WZ);
        } else if (cave && (up || side) && r % 5 === 1) {
          const img = gsprite("stalag" + (r % 3), () => sprStalag(r % 3)), ox = tx * GT + (r % 12) + 4, oy = ty * GT + 18 - img.height;
          hi(img, ox / WZ, oy / WZ, ty * TILE + 9);
        }
      }
    }
    /* scattered detail: weeds, stones, roots, leaves, crows; denser near walls and tree edges */
    for (let ty = 0; ty < h; ty++) for (let tx = 0; tx < w; tx++) {
      const c = cells[ty][tx];
      if (!(c === "." || c === "," || c === "*")) continue;
      const near = ["T", "R", "W", "f", "#", "~"].some((n) => at(tx - 1, ty) === n || at(tx + 1, ty) === n || at(tx, ty - 1) === n || at(tx, ty + 1) === n);
      const r = gh(tx, ty, 91);
      if (r % (near ? 2 : 4) !== 0) continue;
      const x = tx * TILE + (gh(tx, ty, 92) % 12) + 2, y = ty * TILE + (gh(tx, ty, 93) % 10) + 4, k = r % 9;
      if (k < 4) hi(gsprite("weed" + (k % 3), () => sprWeed(k % 3)), x, y - 6, y + 1);
      else if (k < 6) hi(gsprite("stone" + (k % 2), () => sprStone(k % 2)), x, y - 3, y + 1);
      else if (k === 6 && near) hi(gsprite("root", sprRoot), x - 4, y - 4, y + 1);
      else if (k === 7 && gh(tx, ty, 94) % 5 === 0) hi(gsprite("crow", sprCrow), x, y - 4, y + 1);
      else { for (let n = 0; n < 5; n++) { const lx = x * WZ + (gh(n, tx, ty) % 18), ly = y * WZ + (gh(n, ty, tx) % 8); b.set(lx, ly, ["#5a4a30", "#6a5236", "#4e4028"][n % 3]); b.set(lx + 1, ly, ["#5a4a30", "#6a5236", "#4e4028"][n % 3]); } }
      if (c === "*" && gh(tx, ty, 95) % 3 === 0) {   // the odd pale wildflower survives
        const fx = tx * GT + (gh(tx, ty, 96) % 24) + 4, fy = ty * GT + (gh(tx, ty, 97) % 22) + 6, col = ["#a89a6a", "#8a7a9a", "#9a6a6a"][gh(tx, ty, 98) % 3];
        for (const [ddx, ddy] of [[0, -1], [-1, 0], [1, 0], [0, 1]]) b.set(fx + ddx, fy + ddy, col); b.set(fx, fy, "#c8bc98");
      }
    }
  } else {
    /* interiors: dark void, plastered upper wall with timber, panelled lower wall, floors */
    for (let ty = 0; ty < h; ty++) for (let tx = 0; tx < w; tx++) {
      const c = cells[ty][tx];
      for (let y = 0; y < GT; y++) for (let x = 0; x < GT; x++) {
        const wx = tx * GT + x, wy = ty * GT + y;
        let col;
        const T = interiorThemeFor(id, trade);
        if (c === "X") col = "#0c080e";
        else if (c === "U" || c === "Y") {
          if (T) { const v = gnoise(wx * 0.5, wy * 0.2, 7, 61); col = v < 0.3 ? T.upper[2] : v < 0.75 ? T.upper[0] : T.upper[1]; }
          else col = upperWallColor(wx, wy, id !== "hall");
          if (y < 5) col = y < 2 ? "#0c080e" : (T ? T.beam[0] : "#2e2218");
          if (T && id === "hall" && y === 5) col = T.beam[1];
          if (tx % 3 === 0 && x < 5) col = x === 4 ? (T ? T.beam[0] : "#241810") : (T ? T.beam[1] : "#3a2a1e");
          if (T && id === "store" && (x + y) % 16 === 0) col = T.upper[2];   // painted plaster, faintly striped
        } else if (c === "L") {
          const LC = T ? T.lower : ["#3e2e20", "#2a1e14", "#5a4430"];
          col = x % 8 === 0 ? LC[1] : LC[0];
          if (id === "hall" && x % 16 < 2) col = LC[1];
          if (id === "store" && y > 5 && y < GT - 6) col = (x >> 2) % 2 ? LC[0] : mix(LC[0], "#ffffff", 0.07);
          if (id === "shop" && trade === "smith") col = gnoise(wx, wy, 6, 12) > 0.55 ? LC[0] : mix(LC[0], "#000000", 0.2);
          if (y < 3) col = y === 1 ? LC[2] : (T ? T.beam[0] : "#2e2218"); else if (y > GT - 4) col = "#1a120c";
          else if (!T && gh(tx, x, 4) % 9 === 0 && y > 6 && y < 20) col = "#4a3828";
        } else if (c === "s") col = flagColor(wx, wy);
        else if (c === "d") col = (x < 3 || x > 12 ? "#1c130c" : (y % 5 === 0 ? "#2a1d12" : gnoise(wx, wy, 4, 3) > 0.5 ? "#4a3a26" : "#3e301f"));
        else if (c === "m") col = (x + y) % 4 === 0 ? "#4a3e2a" : gnoise(wx, wy, 4, 3) > 0.5 ? "#6a5a3a" : "#5e5032";
        else if (T && (c === "o" || c === "u")) col = T.floor(wx, wy);
        else if (id === "shop" && c === "o" && gnoise(wx, wy, 20, 55) > 0.86) col = dirtFloorColor(wx, wy);
        else col = plankColor(wx, wy);
        b.set(wx, wy, col);
      }
      if (c === "Y") {   // a small grimy window high on the wall
        const x0 = tx * GT + 6, y0 = 6;
        b.rect(x0, y0, x0 + 19, y0 + 18, "#2a2624"); b.rect(x0 + 2, y0 + 2, x0 + 17, y0 + 16, "#5a6670"); b.rect(x0 + 3, y0 + 3, x0 + 7, y0 + 7, "#7a8a94");
        b.rect(x0 + 9, y0 + 2, x0 + 10, y0 + 16, "#2a2624"); b.rect(x0 + 2, y0 + 9, x0 + 17, y0 + 10, "#2a2624");
        lightsOut.push({ x: tx * TILE + 8, y: TILE * 1.4, r: 30, c: "#a8b8c8", str: 0.35, day: true });
      }
      if ((c === "U") && gh(tx, ty, 13) % 3 === 0) b.line([[tx * GT + 12, 14], [tx * GT + 16, 22], [tx * GT + 14, 30]], "#5a5040");   // crack
    }
    /* rug: a worn red runner with a faded border */
    for (let ty = 0; ty < h; ty++) for (let tx = 0; tx < w; tx++) {
      if (cells[ty][tx] !== "u") continue;
      for (let y = 0; y < GT; y++) for (let x = 0; x < GT; x++) {
        const wx = tx * GT + x, wy = ty * GT + y;
        const eN = at(tx, ty - 1) !== "u" && y < 4, eS = at(tx, ty + 1) !== "u" && y > GT - 5, eW = at(tx - 1, ty) !== "u" && x < 4, eE = at(tx + 1, ty) !== "u" && x > GT - 5;
        const RC = (interiorThemeFor(id, trade) || {}).rug || ["#4e2a2e", "#5e3236", "#6e5a3a"];
        let col = gnoise(wx, wy, 9, 14) > 0.7 ? RC[0] : RC[1];
        if (eN || eS || eW || eE) col = RC[2];
        if (gnoise(wx, wy, 14, 15) > 0.85) col = "#463438";   // worn through
        b.set(wx, wy, col);
      }
    }
    /* contact shading under the wall and along the side walls */
    for (let ty = 0; ty < h; ty++) for (let tx = 0; tx < w; tx++) {
      const c = cells[ty][tx];
      if (c === "X" || c === "U" || c === "Y" || c === "L") continue;
      const n = at(tx, ty - 1);
      if (n === "L" || n === "K") for (let k = 0; k < 8; k++) for (let x = 0; x < GT; x++) b.blend(tx * GT + x, ty * GT + k, [8, 6, 14], 0.4 * (1 - k / 8));
      if (at(tx - 1, ty) === "X") for (let k = 0; k < 5; k++) for (let y = 0; y < GT; y++) b.blend(tx * GT + k, ty * GT + y, [8, 6, 14], 0.35 * (1 - k / 5));
      if (at(tx + 1, ty) === "X") for (let k = 0; k < 5; k++) for (let y = 0; y < GT; y++) b.blend(tx * GT + GT - 1 - k, ty * GT + y, [8, 6, 14], 0.35 * (1 - k / 5));
    }
    /* counters become tall pieces so people stand behind them */
    for (let ty = 0; ty < h; ty++) for (let tx = 0; tx < w; tx++) {
      if (cells[ty][tx] !== "K") continue;
      const l = at(tx - 1, ty) === "K", r = at(tx + 1, ty) === "K";
      const img = gsprite(`counter${l ? 1 : 0}${r ? 1 : 0}`, () => {
        const s = new PB(GT, 46);
        s.rect(0, 12, GT - 1, 44, "#4a3626"); s.rect(0, 6, GT - 1, 14, "#6a5036"); s.rect(0, 6, GT - 1, 7, "#7e6040");
        s.rect(6, 18, 25, 40, "#3e2e20"); s.rect(7, 19, 24, 20, "#5a4430"); s.rect(0, 42, GT - 1, 44, "#2a1e14");
        if (!l) s.rect(0, 6, 1, 44, "#2a1e14"); if (!r) s.rect(GT - 2, 6, GT - 1, 44, "#2a1e14");
        return s.canvas();
      });
      if (gh(tx, ty) % 3 === 0) {   // something left on the counter
        const extra = gsprite("tankard", () => { const s = new PB(10, 12); s.rect(1, 1, 7, 11, "#6a5a44"); s.rect(2, 2, 6, 4, "#a89060"); s.rect(7, 4, 9, 8, "#4a3e30"); return s.outline().canvas(); });
        hi(extra, tx * TILE + 4, ty * TILE - 3, ty * TILE + 16.5);
      }
      hi(scaleSprite(img, 0.78, `counter${l ? 1 : 0}${r ? 1 : 0}`), tx * TILE, ty * TILE + 16 - 46 * 0.78 / WZ, ty * TILE + 16);
    }
    /* scattered floor clutter: straw, crumbs, a rat in the poorer rooms */
    for (let ty = 0; ty < h; ty++) for (let tx = 0; tx < w; tx++) {
      const c = cells[ty][tx];
      if (c !== "o" && c !== "s") continue;
      const r = gh(tx, ty, 61);
      if (r % 5 === 0) { const x = tx * GT + (r % 24) + 4, y = ty * GT + ((r >> 5) % 20) + 6; b.line([[x, y], [x + 5, y - 1]], "#7a6a44"); b.line([[x + 2, y + 2], [x + 6, y + 3]], "#6a5a3a"); }
      if (r % 23 === 0 && id !== "hall" && !bakeGrimMap.rat) bakeGrimMap.rat = 1, hi(gsprite("rat", () => { const s = new PB(18, 9); s.ell(4, 2, 14, 8, "#3e3a3c"); s.ell(12, 3, 17, 7, "#4a4648"); s.set(15, 4, "#d84a4a"); s.line([[4, 6], [0, 4]], "#5a4e4c"); return s.outline().canvas(); }), tx * TILE + 3, ty * TILE + 8, ty * TILE + 13);
    }
  }

  /* props: new sprites anchored to the bottom of their footprint; frames and lit variants carried over */
  for (const p of props) {
    const d = p.def, make = GPROP[p.p];
    if (!make) continue;
    const SETTLE = new Set(["lamp", "well", "board", "barrel", "crate", "sack", "anvil", "block", "baskets", "bench"]);
    const K = def.outside ? 1 : (INDOOR_K[p.p] || 1), setl = def.outside && SETTLE.has(p.p);
    const mk1 = (key, fn) => gsprite(key, () => { let c = fn(); if (setl) c = settleSprite(c, p.p === "lamp" ? 0.34 : 0.28); return c; });
    const sc = (im, key) => (K === 1 ? im : scaleSprite(im, K, key));
    const frames = d.frames ? [0, 1].map((f) => sc(gsprite(`p_${p.p}_${f}`, () => make(f)), `p_${p.p}_${f}`)) : null;
    const lit = p.p === "lamp" ? [mk1("p_lamp_0", () => make(false)), mk1("p_lamp_1", () => make(true))] : null;
    const img = frames || lit ? null : sc(mk1(`p_${p.p}_${p.v || 0}`, () => make(p.v || 0)), `p_${p.p}_${p.v || 0}`);
    const ref = img || (frames ? frames[0] : lit[1]);
    const fwp = d.fw * GT, x2 = p.x * GT + (fwp - ref.width) / 2, y2 = (p.y + d.fh) * GT - ref.height - (d.wall ? 0 : 2);
    if (def.outside && p.p === "well") wellGround(b, p, bakeGrimMap.RF, d.fw);
    if (!d.wall && p.p !== "straw") {
      castShadow(b, ref, Math.round(x2), y2, 6, 4, def.outside ? 0.38 : 0.3); contactBand(b, Math.round(x2) + 2, Math.round(x2) + ref.width - 2, y2 + ref.height - 4, 5, def.outside ? 0.5 : 0.3);
      if (def.outside) {   // worn earth around the foot, with grass and stones growing up against it
        const cxp = Math.round(x2 + ref.width / 2), byp = y2 + ref.height - 3;
        mudPatch(b, cxp, byp, Math.max(8, ref.width * 0.42), 4, p.x * 13 + p.y);
        const bx = (x2 + ref.width / 2) / WZ, by = (y2 + ref.height) / WZ;
        for (let k = 0; k < 3; k++) {
          const ox = (k - 1) * Math.min(7, ref.width / WZ * 0.38) + ((gh(k, p.x, p.y) % 5) - 2);
          talls.push({ hi: true, img: gsprite("weed" + ((k + p.x) % 3), () => sprWeed((k + p.x) % 3)), x: bx + ox - 3, y: by - 7 + (gh(k, p.y) % 2), sortY: by + 1.2 });
        }
        if (gh(p.x, p.y, 5) % 2) talls.push({ hi: true, img: gsprite("stone" + (p.x % 2), () => sprStone(p.x % 2)), x: bx + 5, y: by - 3, sortY: by + 1.5 });
      }
    }
    const entry = { hi: true, img, frames, lit, x: x2 / WZ, y: y2 / WZ, sortY: d.wall ? -1 : d.deco ? p.y * TILE + 2 : (p.y + d.fh) * TILE - 2 };
    talls.push(entry);
  }
  return { base: (() => { const c = b.canvas(); return c; })(), talls, lights: lightsOut, clear: bakeGrimMap.clear, flames: bakeGrimMap.flames };
}

/* ---------- helpers that ground objects in the base layer ---------- */
function wellGround(b, p, RF, fw) {   // flagstones around a well, and the path people wear to it from the nearest road
  const cx = p.x * GT + (fw || 1) * GT / 2, cy = p.y * GT + GT - 2;
  let best = null;
  for (let r = 1; r <= 7 && !best; r++) for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) {
    if (Math.max(Math.abs(i), Math.abs(j)) !== r) continue;
    const wx = (p.x + i) * GT + 16, wy = (p.y + j) * GT + 16;
    if (RF && RF(wx, wy) > 0.6 && (!best || Math.hypot(i, j) < best[2])) best = [wx, wy, Math.hypot(i, j)];
  }
  if (best && best[2] > 1.2) footTrack(b, [[cx, cy + 4], [(cx + best[0]) / 2 + 6, (cy + best[1]) / 2], [best[0], best[1]]], 9, p.x * 7 + p.y);
  const ay = cy + 4;
  b.ell(cx - 38, ay - 15, cx + 38, ay + 15, "#3e3a36");
  for (let k = 0; k < 18; k++) { const a = (k / 18) * Math.PI * 2, x = cx + Math.cos(a) * 31, y = ay + Math.sin(a) * 11; b.poly([[x - 6, y - 3], [x + 5, y - 4], [x + 6, y + 3], [x - 5, y + 4]], k % 2 ? "#5e5a56" : "#6a6662"); b.line([[x - 5, y - 3], [x + 4, y - 4]], "#7a7672"); }
  b.ell(cx - 12, ay + 5, cx + 4, ay + 10, GP.pud); b.line([[cx - 9, ay + 6], [cx - 3, ay + 6]], GP.pudL);   // spilt water
}
function castShadow(b, img, x, y, dx, dy, a) {
  const id = img.getContext("2d").getImageData(0, 0, img.width, img.height).data;
  for (let j = 0; j < img.height; j++) for (let i = 0; i < img.width; i++) if (id[(j * img.width + i) * 4 + 3] > 0) b.blend(x + i + dx, y + j + dy, [8, 6, 14], a);
}
function contactBand(b, x0, x1, y, depth, a) { for (let k = 0; k < depth; k++) for (let x = x0; x < x1; x++) b.blend(x, y + k, [8, 6, 14], a * (1 - k / depth)); }
function mudPatch(b, cx, cy, rx, ry, seed) {
  const pts = [];
  for (let k = 0; k < 16; k++) { const a = (k / 16) * Math.PI * 2, r = 0.75 + (gh(k, seed) % 100) / 400; pts.push([cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]); }
  b.poly(pts, GP.m1); b.poly(pts.map(([x, y]) => [cx + (x - cx) * 0.6, cy + (y - cy) * 0.6]), GP.m0);
}
function footTrack(b, pts, w, seed) {
  for (let s = 0; s + 1 < pts.length; s++) {
    const [x0, y0] = pts[s], [x1, y1] = pts[s + 1], n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / 2));
    for (let i = 0; i <= n; i++) { const t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t, r = w * (0.8 + (gh(i, seed) % 100) / 400); b.ell(x - r, y - r * 0.5, x + r, y + r * 0.5, GP.m0); }
    for (let i = 0; i <= n; i++) { const t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t, r = w * 0.55; b.ell(x - r, y - r * 0.45, x + r, y + r * 0.45, GP.m1); }
    for (let i = 0; i < n; i += 5) { const t = i / n, x = x0 + (x1 - x0) * t + (gh(i, seed, 3) % 6) - 3, y = y0 + (y1 - y0) * t; b.ell(x, y, x + 2, y + 4, GP.wet); }
  }
}
