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
function gnoise(x, y, cell, seed) {   // smooth value noise; written out flat (no closures), it is the bake's busiest function
  const gx = Math.floor(x / cell), gy = Math.floor(y / cell), fx = x / cell - gx, fy = y / cell - gy;
  const u = fx * fx * (3 - 2 * fx), w = fy * fy * (3 - 2 * fy);
  const v00 = (gh(gx, gy, seed) % 1000) / 1000, v10 = (gh(gx + 1, gy, seed) % 1000) / 1000, v01 = (gh(gx, gy + 1, seed) % 1000) / 1000, v11 = (gh(gx + 1, gy + 1, seed) % 1000) / 1000;
  return (v00 * (1 - u) + v10 * u) * (1 - w) + (v01 * (1 - u) + v11 * u) * w;
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
    /* the rock's outline wanders: the lip of the face rises and falls along its length, the side faces lean in and
       out, the foot breaks up into the ground, and the field the outline is cut from is pushed about by slow noise */
    const lipOff = Math.round((gnoise(wx, 0, 23, 69) - 0.5) * 12), sideOff = Math.round((gnoise(0, wy, 19, 73) - 0.5) * 10), northOff = Math.round((gnoise(wx, 5, 17, 74) - 0.5) * 8);
    if (d === 1 && y > GT - 2 - Math.round(gnoise(wx, ty, 6, 70) * 6)) continue;   // the foot of the face, ragged where it meets the ground
    if (border) {
      const wxw = wx + (gnoise(wx, wy, 31, 71) - 0.5) * 14, wyw = wy + (gnoise(wx, wy, 31, 72) - 0.5) * 14;
      const cut = 0.42 + (gnoise(wx, wy, cave ? 7 : 9, 68) - 0.5) * (cave ? 0.22 : 0.18) + (d ? 0 : (gnoise(wx, wy, 38, 75) - 0.45) * 0.2), cf = CF(d ? wx : wxw, d ? wy : wyw);   // and bites out of it, a few large
      if (cf < cut) continue;                    // a rounded, broken outer edge: the ground shows through
      edge = cf < cut + 0.04;
    }
    let col;
    const fy = d === 1 ? y + (GT - 12) - lipOff : d === 2 ? y - 12 - lipOff : -1;   // pixels down from the lip; the lip sits about 12px into the upper row
    const faceRow = fy >= 0;
    const sideW = (wallW || openSW) ? x + sideOff : 99, sideE = (wallE || openSE) ? GT - 1 - x - sideOff : 99, sd = Math.min(sideW, sideE);
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
      if (sd < 0 && !faceRow) continue;
      if (sd < 10 && !faceRow) { col = (sd < 1) ? ink : ((wx * 3 + (wy >> 2)) % 7 === 0 ? side[1] : side[0]); if (sd > 6) col = mix(col, top[0], (sd - 6) / 5); }
      else if (sd < 12 && !faceRow) col = rim;                                // the rim above the side face
      if (wallN && y + northOff < 0) continue;
      if (wallN && y + northOff < 5) { const yy = y + northOff; col = yy < 1 ? ink : yy < 3 ? rim : mix(col, rim, 0.4); }   // the far edge catches the light
    }
    if (faceRow && fy === 0) col = rim;                                       // the lip above the face
    if (edge) col = ink;
    b.set(wx, wy, col);
  }
}
function mudColor(wx, wy) {
  const v = gnoise(wx, wy, 16, 3) * 0.75 + gnoise(wx, wy, 5, 4) * 0.25;
  const wn = gnoise(wx, wy, 13, 11) + (gnoise(wx, wy, 3, 12) - 0.5) * 0.08;   // damp hollows: dark at the bottom, shading out through the mud
  if (wn > 0.9) return GP.wet;
  if (wn > 0.84) return GP.m0;
  return v < 0.28 ? GP.m0 : v > 0.74 ? GP.m2 : GP.m1;
}
/* town paving: the craftpix pack's stones laid in rows of seamless strips, recoloured grim and dirtied stone by stone.
   rf is the road field at the pixel: the middle of a street is whole cobble, the edges break into loose stones and mud. */
const PAVE_PAL = {
  ash: [["#2c2824", "#46403a", "#686056", "#7a7264", "#857c6c"], ["#2a2622", "#3e3a34", "#5a544c", "#6a6458", "#746c5e"], ["#2a2a22", "#3e4232", "#56603e", "#646c48", "#6c7450"]],
  grey: [["#26282c", "#3c4046", "#545a62", "#666c74"], ["#24262a", "#363a3e", "#4a4e54", "#585c62"], ["#262a24", "#3a4034", "#4e5844", "#5c6650"]],
};
function paveColor(style, wx, wy, rf) {
  const P = PAVE[style], pals = PAVE_PAL[style];
  if (!P || !pals) return null;
  const sx = wx >> 1, sy = wy >> 1, row = sy >> 4, strip = P.strips[gh(row, 0, 611 + style.length) % P.strips.length];
  const L = strip[0].length, off = gh(row, 1, 612) % L;
  const rank = +strip[sy & 15][(sx + off) % L];
  // which stone is this: cells of about 6 by 6 source pixels, so a whole cobble is tinted together
  const cell = gh((sx + off) / 6 | 0, (sy / 6 | 0) + row * 7, 613);
  const edge = rf < 0.5, moss = gnoise(wx, wy, 26, 615) > 0.66 && cell % 3 === 0;
  if (edge && (cell % 5 < (rf < 0.44 ? 4 : 2) || gnoise(wx, wy, 7, 614) > 0.7)) return null;   // stones lifted or sunk at the street's edge
  if (style === "grey" && (gnoise(wx, wy, 20, 618) > 0.68 || cell % 11 === 0)) return null;      // a broken street: whole patches gone to mud
  let col = (moss ? pals[2] : cell % 7 === 0 ? pals[1] : pals[0])[rank];
  if (rank <= 1 && gnoise(wx, wy, 11, 616) > 0.55) col = GP.m0;                               // dirt packed into the joints
  if (rank >= 2 && gnoise(wx, wy, 18, 617) > 0.72) col = mix(col, "#3e3428", 0.35);           // grime trodden over the stones
  return col;
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

/* Trees from the craftpix top-down pack (02r_tree_data.js), decoded once and drawn at 2x so their pixels match the
   ground tiles. pickTree chooses one by kind and a hash, so the same spot always grows the same tree. */
function sprPackTree(name) {
  const t = TREE_ART[name], c = makeCanvas(t.w * 2, t.h * 2), x = c.getContext("2d"), id = x.createImageData(t.w * 2, t.h * 2), d = id.data;
  const rgb = TREE_PAL.map((h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
  for (let y = 0; y < t.h; y++) { const row = t.rows[y]; for (let i = 0; i < row.length; i++) { const ch = row[i]; if (ch === " ") continue; const k = rgb[TREE_CH.indexOf(ch)];
    for (let j = 0; j < 4; j++) { const o = (((y * 2 + (j >> 1)) * t.w * 2) + i * 2 + (j & 1)) * 4; d[o] = k[0]; d[o + 1] = k[1]; d[o + 2] = k[2]; d[o + 3] = 255; } } }
  x.putImageData(id, 0, 0); return c;
}
function pickTree(kind, r) { const list = TREE_KINDS[kind]; const name = list[r % list.length]; return { name, img: gsprite("ptree_" + name, () => sprPackTree(name)) }; }
/* where a trunk meets the ground: a soft dark pool, darkest at the roots, so a tree stands in the earth */
function rootPool(b, cx, cy, rx, ry, a) {
  for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) { const d = (x * x) / (rx * rx) + (y * y) / (ry * ry); if (d <= 1) b.blend(cx + x, cy + y, [10, 8, 12], a * (1 - d) * (1 - d * 0.3)); }
}

/* ---------- southern Etharis: the curse ---------- */
/* Its strength is stored per tile (0-9) by the generator; read smoothly between tile centres so the bands blend. */
function curseAtTile(def, tx, ty) {
  const cu = def && def.curse; if (!cu) return 0;
  const h = cu.length, w = cu[0].length, x = Math.max(0, Math.min(w - 1, tx | 0)), y = Math.max(0, Math.min(h - 1, ty | 0));
  return (cu[y].charCodeAt(x) - 48) / 9;
}
function curseAtPx(def, wx, wy) {
  const cu = def.curse, h = cu.length, w = cu[0].length;
  const fx = Math.max(0, Math.min(w - 1.001, wx / GT - 0.5)), fy = Math.max(0, Math.min(h - 1.001, wy / GT - 0.5)), ix = fx | 0, iy = fy | 0, tx = fx - ix, ty = fy - iy;
  const v = (x, y) => cu[y].charCodeAt(x) - 48, x1 = Math.min(w - 1, ix + 1), y1 = Math.min(h - 1, iy + 1);
  return ((v(ix, iy) * (1 - tx) + v(x1, iy) * tx) * (1 - ty) + (v(ix, y1) * (1 - tx) + v(x1, y1) * tx) * ty) / 9;
}
/* cursed-land art (02t_curse_data.js): decoded once, drawn at 1x, the cast's own pixel density */
function sprCurse(group, name) {
  const G = CURSE_ART[group], t = G.art[name], c = makeCanvas(t.w, t.h), x = c.getContext("2d"), id = x.createImageData(t.w, t.h), d = id.data;
  const rgb = G.pal.map((h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
  for (let y = 0; y < t.h; y++) { const row = t.rows[y]; for (let i = 0; i < row.length; i++) { const ch = row[i]; if (ch === " ") continue; const k = rgb[CURSE_CH.indexOf(ch)], o = (y * t.w + i) * 4; d[o] = k[0]; d[o + 1] = k[1]; d[o + 2] = k[2]; d[o + 3] = 255; } }
  x.putImageData(id, 0, 0); return c;
}
function sprCave(group, name) {   // the cave dressing: same packing as the curse art
  const G = CAVE_ART[group], t = G.art[name], c = makeCanvas(t.w, t.h), x = c.getContext("2d"), id = x.createImageData(t.w, t.h), d = id.data;
  const rgb = G.pal.map((h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
  for (let y = 0; y < t.h; y++) { const row = t.rows[y]; for (let i = 0; i < row.length; i++) { const ch = row[i]; if (ch === " ") continue; const k = rgb[CURSE_CH.indexOf(ch)], o = (y * t.w + i) * 4; d[o] = k[0]; d[o + 1] = k[1]; d[o + 2] = k[2]; d[o + 3] = 255; } }
  x.putImageData(id, 0, 0); return c;
}
function sprNature(name) {   // bushes, stones in turf, tufts: same packing as the curse art
  const G = NATURE_ART, t = G.art[name], c = makeCanvas(t.w, t.h), x = c.getContext("2d"), id = x.createImageData(t.w, t.h), d = id.data;
  const rgb = G.pal.map((h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
  for (let y = 0; y < t.h; y++) { const row = t.rows[y]; for (let i = 0; i < row.length; i++) { const ch = row[i]; if (ch === " ") continue; const k = rgb[CURSE_CH.indexOf(ch)], o = (y * t.w + i) * 4; d[o] = k[0]; d[o + 1] = k[1]; d[o + 2] = k[2]; d[o + 3] = 255; } }
  x.putImageData(id, 0, 0); return c;
}
const natImg = (name) => gsprite("nat_" + name, () => sprNature(name));
const NAT = {
  bush: ["bush3", "bush4", "bush5", "bush6", "bush7", "bush10", "bush11", "bush13", "bush1", "bush5", "bush4", "bush17", "bush18", "bush15", "bush2", "bush8", "bush14", "bush6"],
  bushSmall: ["bush7", "bush10", "bush11", "bush13", "bush18", "bush5"],
  scrub: ["scrub1", "scrub2", "scrub3", "scrub4"],
  rockG: ["stone3_g", "stone4_g", "turf5", "stone3_g", "turf4", "stone4_g", "turf3"],
  rockD: ["stone3_d", "stone4_d", "stone3_d", "stone4_d", "stone5_d"],
  boulderG: ["stone1_g", "stone2_g"], boulderD: ["stone1_d", "stone2_d"],
  tuft: ["tuft1", "tuft2", "tuft3", "tuft1"], rtuft: ["rtuft1", "rtuft2", "rtuft3", "rtuft4"], peb: ["peb1", "peb2", "peb3", "peb4"], stump: ["stump1", "stump2", "stump4", "stump5"],
};
const natPick = (set, r) => natImg(NAT[set][r % NAT[set].length]);
/* what each cave is strewn with, along its walls: [group, name, glows] */
const CAVE_SETS = {
  mine: [["mine", "beige_rpck2"], ["mine", "beige_rpck3"], ["mine", "white_crystal2"], ["mine", "white_crystal3"], ["mine", "white_crystal_vertical1"], ["mine", "human_skeleton"], ["mine", "dinosaur_skeleton__head"], ["mine", "mushroom13"], ["mine", "blue_green_crystal3"], ["mine", "beige_rpck3"]],
  bones: [["mine", "human_skeleton"], ["mine", "dinosaur_skeleton__head"], ["mine", "cocoon_web"], ["mine", "beige_rpck3"], ["mine", "mushroom41"], ["mine", "human_skeleton"], ["mine", "cocoon_web"]],
  glow: [["glow", "crystal1_1", 1], ["glow", "crystal2_3", 1], ["glow", "crystal3_1", 1], ["glow", "crystal4_3", 1], ["glow", "crystal1_3", 1], ["glow", "rock_crystal_1", 1], ["mine", "white_crystal1"], ["mine", "blue_green_crystal1", 1], ["mine", "crystal_blue_green_vertical1", 1]],
  damp: [["glow", "mushroom1_3", 1], ["glow", "mushroom5_3", 1], ["glow", "mushroom5_1", 1], ["glow", "mushroom4_1", 1], ["glow", "plant1_1"], ["glow", "plant2_1"], ["glow", "plant4_1"], ["mine", "mushroom11"], ["mine", "mushroom22"], ["mine", "cocoon_web"], ["glow", "plant3_1", 1], ["glow", "mushroom2_1"]],
};
const CAVE_THEME = { caveA: "mine", caveC: "mine", cr_tunnel: "mine", cr_mine1: "mine", cr_mine2: "mine", cr_mine3: "mine", caveD: "bones", caveS: "glow", cr_shrine: "glow", caveB: "damp", au_culvert: "damp", rot_cellar: "damp" };
const CURSE_DECAL_PX = {};
const CURSE_TREES = ["monster_tree1", "web_tree2", "monster_tree2", "web_tree1", "monster_tree3", "web_tree3"];
const CURSE_BIG = ["jaws_plant_2", "tentacle_plant_2", "rock_eyes_1", "rock3_2", "spike_plant_2", "meat_flower_1", "claw_eggs_2", "claw_monster_3", "tooth_monster_2", "eyes_1", "skull_pile", "web_rock1", "rock1_1", "rune_stone_1"];
const CURSE_SMALL_MID = ["bones_2", "bones_3", "bones_5", "bones_8", "grave1", "grave2", "grave3", "grave5", "grave6", "undead_plant1", "undead_plant3", "mushroom1_2", "mushroom2_3", "bone_pelvis", "web_rock3", "rock1_4"];
const CURSE_SMALL_DEEP = ["bones_6", "eye_plant_2", "eye_plant_3", "many_eyes_plant_2", "pustules_2", "pustules_3", "tubular_plant_2", "rock_eyes_3", "mushrooms_2", "eggs_3", "webbed_1", "rune_stone_4", "bone_arm_sword"];
/* The ground goes wrong: green drains to dust and dead straw, then to bruised, root-veined earth; water turns to murk.
   Roads stay readable, trodden through it. Flat veins are pressed into the ground where the curse runs deepest. */
function curseGround(b, def, w, h) {
  const d = b.d, W = b.w, RF = bakeGrimMap.RF, WF = bakeGrimMap.WF, cells = def.rows;
  const near = (tx, ty, test) => { for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) { const r = cells[ty + j]; if (r && test(r[tx + i])) return true; } return false; };
  for (let ty = 0; ty < h; ty++) for (let tx = 0; tx < w; tx++) {
    let mx = 0; for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) mx = Math.max(mx, curseAtTile(def, tx + i, ty + j));
    if (mx <= 0.15 || "CO#FH".includes(cells[ty][tx])) continue;   // rock, walls and houses keep their own colours
    const nW = near(tx, ty, (c) => c === "~" || c === "B"), nR = near(tx, ty, (c) => c === "=" || c === "P" || c === "B" || c === "Z" || c === "G" || c === "g");
    for (let py = 0; py < GT; py += 2) for (let px = 0; px < GT; px += 2) {   // worked in 2x2 blocks: the fields are smooth, each pixel keeps its own shade
      const bx = tx * GT + px, by = ty * GT + py, a = curseAtPx(def, bx + 1, by + 1); if (a <= 0.14) continue;
      const n = gnoise(bx, by, 19, 701);
      const water = nW && WF(bx, by) > 0.55, onRoad = !water && nR && RF(bx, by) > 0.35;
      const k1 = Math.max(0, Math.min(1, (a - 0.14) / 0.36)) * (onRoad ? 0.25 : 0.85), k2 = Math.max(0, Math.min(1, (a - 0.48) / 0.32)) * (onRoad ? 0.3 : 0.9);
      const flesh = k2 > 0 && n > 0.5 && gnoise(bx, by, 11, 703) > 0.76, crack = k2 > 0 && !flesh && Math.abs(gnoise(bx, by, 23, 704) - 0.5) < 0.011 && gnoise(bx, by, 31, 706) > 0.62;
      for (let q = 0; q < 4; q++) {
        const wx = bx + (q & 1), wy = by + (q >> 1), i = (wy * W + wx) * 4; if (!d[i + 3]) continue;
        const lum = (d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11) / 255;
        if (water) { const k = Math.min(0.8, a * 1.1); d[i] += (44 + n * 18 - d[i]) * k; d[i + 1] += (34 + n * 12 - d[i + 1]) * k; d[i + 2] += (54 + n * 20 - d[i + 2]) * k; continue; }
        d[i] += (30 + lum * 250 - d[i]) * k1; d[i + 1] += (26 + lum * 200 - d[i + 1]) * k1; d[i + 2] += (22 + lum * 140 - d[i + 2]) * k1;   // drained to dust and dead straw (shadows stay dark)
        if (k2 > 0) {
          let r0, g0, b0;
          if (crack) { r0 = 34; g0 = 20; b0 = 28; } else if (flesh) { r0 = 96 + n * 24; g0 = 50 + n * 12; b0 = 56 + n * 12; } else { r0 = 18 + lum * 170 + n * 14; g0 = 12 + lum * 100; b0 = 16 + lum * 136 + n * 10; }
          d[i] += (r0 - d[i]) * k2; d[i + 1] += (g0 - d[i + 1]) * k2; d[i + 2] += (b0 - d[i + 2]) * k2;
        }
      }
    }
  }
  // veins pressed into the ground
  for (let ty = 0; ty < h; ty += 2) for (let tx = 0; tx < w; tx += 2) {
    const a = curseAtTile(def, tx, ty), r = gh(tx, ty, 705);
    if (a < 0.6 || r % 11 > (a > 0.85 ? 1 : 0)) continue;
    const name = ["veins_1", "veins_2", "veins_3", "veins_4"][r % 4], img = gsprite("cd_" + name, () => sprCurse("decal", name));
    const cx = tx * GT + (r % 40) - img.width / 2, cy = ty * GT + ((r >>> 6) % 40) - img.height / 2;
    const id = CURSE_DECAL_PX[name] || (CURSE_DECAL_PX[name] = img.getContext("2d").getImageData(0, 0, img.width, img.height).data), al = 0.55 + Math.min(0.35, (a - 0.55));
    for (let y = 0; y < img.height; y++) for (let x = 0; x < img.width; x++) {
      const o = (y * img.width + x) * 4; if (!id[o + 3]) continue;
      const wx = Math.round(cx + x), wy = Math.round(cy + y); if (wx < 0 || wy < 0 || wx >= W || wy >= h * GT) continue;
      if ((RF && RF(wx, wy) > 0.3) || (WF && WF(wx, wy) > 0.4) || "CO#FH".includes(cells[(wy / GT) | 0][(wx / GT) | 0])) continue;
      b.blend(wx, wy, [id[o], id[o + 1], id[o + 2]], al);
    }
  }
}

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
  else if (v === 1) { const t = natImg("tuft1"), c = s.canvas(); c.getContext("2d").drawImage(t, Math.round((14 - t.width) / 2), 14 - t.height); return c; }   // a clump of turf
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
/* The town gate, one tile of it. Shut: planks under iron straps. Open: a post with the leaf folded back against it. */
function sprGate(open, lower) {
  const s = new PB(40, 60);
  if (open) {   // a heavy post with an iron cap, and the leaf swung back flat against the hedge side
    const y0 = lower ? 6 : 2, y1 = lower ? 58 : 50;
    s.poly([[20, y0 + 10], [36, y0 + (lower ? 16 : 4)], [36, y1 - (lower ? 2 : 14)], [20, y1 - 4]], "#4a3626");
    for (let k = 0; k < 3; k++) s.line([[24 + k * 4, y0 + 9 - (lower ? -k * 2 : k * 2)], [24 + k * 4, y1 - 5 - (lower ? -k : k * 3)]], "#3a2a1c");
    s.line([[20, y0 + 16], [36, y0 + (lower ? 21 : 10)]], "#3a3640", 2); s.line([[20, y1 - 12], [36, y1 - (lower ? 9 : 21)]], "#3a3640", 2);
    s.rect(9, y0 + 3, 20, y1, GP.woodD); s.rect(9, y0 + 3, 12, y1, GP.wood); s.rect(9, y0 + 3, 9, y1, GP.woodL);
    s.rect(7, y0, 22, y0 + 4, "#3a3640"); s.rect(7, y0, 22, y0, "#6a6670"); s.rect(8, y1 - 6, 21, y1 - 4, "#3a3640");
    return s.outline().canvas();
  }
  for (let x = 2; x < 38; x += 6) { s.rect(x, 12 + (gh(x, 3) % 2), x + 4, 58, GP.wood); s.line([[x, 13], [x, 58]], GP.woodL); s.line([[x + 4, 13], [x + 4, 58]], GP.woodD); }
  s.rect(0, 20, 39, 24, "#3a3640"); s.rect(0, 44, 39, 48, "#3a3640"); s.rect(0, 20, 39, 20, "#6a6670"); s.rect(0, 44, 39, 44, "#6a6670");
  for (const x of [5, 19, 33]) { s.rect(x, 21, x + 1, 22, "#8a8690"); s.rect(x, 45, x + 1, 46, "#8a8690"); }
  s.rect(0, 8, 39, 12, GP.woodD); s.rect(0, 8, 39, 8, GP.woodL);
  return s.outline().canvas();
}
/* Odile's stone: tall, plainly cut, with a guild seal and three lines nobody could agree on. Yarrow and a turnip at the foot. */
function sprMemorial() {
  const s = new PB(44, 70), c0 = "#6c6a6c", c1 = "#86848a", c2 = "#4a484c";
  s.rect(10, 18, 33, 64, c0); s.ell(10, 4, 33, 30, c0); s.rect(10, 18, 13, 64, c1); s.rect(30, 18, 33, 64, c2);
  s.ell(16, 11, 27, 22, c2); s.ell(18, 13, 25, 20, c0); s.line([[21, 14], [21, 19]], c2, 2); s.line([[19, 17], [24, 17]], c2);   // the guild seal
  for (const [y, a, b] of [[30, 15, 28], [36, 16, 27], [42, 15, 25], [48, 17, 28]]) s.line([[a, y], [b, y]], c2);
  s.rect(5, 63, 38, 68, "#4e4c4e"); s.rect(5, 63, 38, 63, c1);
  for (let x = 10; x < 33; x++) if (gh(x, 5, 3) % 4 === 0) s.set(x, 62 - (gh(x, 2) % 4), GP.moss);
  for (const [x, h] of [[2, 10], [5, 13], [8, 9]]) { s.line([[x, 68], [x, 68 - h]], "#4a5a34"); s.ell(x - 2, 66 - h, x + 2, 69 - h, "#d8d4c0"); }   // yarrow
  s.ell(34, 61, 41, 68, "#8a5a7c"); s.ell(35, 62, 38, 65, "#a6749a"); s.line([[37, 61], [39, 56]], "#4a6a40", 2);   // Edda's turnip
  return s.outline().canvas();
}
/* A Pillar lashed under a filthy tarp: folds, ropes, pegs, and a thin seam of ley-light where the hem lifts */
function sprTarp() {
  const W = 84, H = 166, s = new PB(W, H), cx = 42, C = ["#2a2a20", "#3a3a2a", "#4a4834", "#58553e"];
  const half = (y) => 14 + (y / H) * 26 + Math.sin(y * 0.11) * 1.5;            // narrow at the sheared top, wide at the plinth
  for (let y = 6; y < H - 4; y++) {
    const h = half(y);
    for (let x = Math.round(cx - h); x <= Math.round(cx + h); x++) {
      const f = Math.sin((x - cx) * 0.42 + y * 0.03) + Math.sin((x + y * 0.5) * 0.13);   // vertical folds
      const col = f > 1.1 ? C[3] : f > 0.2 ? C[2] : f > -0.8 ? C[1] : C[0];
      s.set(x, y, gnoise(x, y, 7, 911) > 0.82 ? "#2e2a20" : col);
    }
  }
  s.poly([[cx - 14, 6], [cx + 12, 2], [cx + 16, 10], [cx - 15, 12]], C[1]);   // the cloth bunched over the top
  for (const [y, sl] of [[40, 3], [86, 4], [128, -3]]) {                        // rope lashings, wrapped round
    const h = half(y);
    s.line([[cx - h, y], [cx + h, y + sl]], "#8a7650", 2); s.line([[cx - h, y + 1], [cx + h, y + sl + 1]], "#5a4a30");
    s.ell(cx + h - 4, y + sl - 2, cx + h + 2, y + sl + 4, "#8a7650");
  }
  for (let x = cx - 36; x < cx + 36; x += 3) if (gnoise(x, 0, 3, 912) > 0.45) s.set(x, H - 5, "#7ad0c8");   // light leaking under the hem
  for (const px of [cx - 40, cx + 38]) { s.line([[px, H - 6], [px + (px < cx ? 6 : -6), H - 22]], "#5a4a30"); s.rect(px - 1, H - 6, px + 1, H - 2, "#3a2c20"); }   // guy ropes and pegs
  for (let k = 0; k < 6; k++) { const x = cx - 20 + k * 8, y = 60 + (k * 37) % 70; s.ell(x, y, x + 5, y + 3, "#4a3a28"); }   // mud stains
  return s.outline().canvas();
}
/* The Covenant's flag on a street pole: purple, weathered, the gold sigil (a ring bound by a single thread).
   Two frames, the cloth swinging a little in the wind. */
const COV = { p0: "#2e1a3a", p1: "#4a2a5c", p2: "#5e3a72", g0: "#8a6a2a", g1: "#c8a24a" };
function covSigil(s, cx, cy, r) {
  s.ell(cx - r, cy - r, cx + r, cy + r, COV.g1); s.ell(cx - r + 2, cy - r + 2, cx + r - 2, cy + r - 2, COV.p1);
  s.line([[cx, cy - r - 2], [cx, cy + r + 2]], COV.g1); s.set(cx + 1, cy + r + 2, COV.g0);
}
const UNB = { p0: "#6a5418", p1: "#9a7c26", p2: "#b8963a", g0: "#5a1a14", g1: "#9a2a20" };
/* the Unbound's mark: a red thread, snapped, its two ends curling away */
function unbSigil(s, cx, cy, r) {
  s.line([[cx - r, cy + r], [cx - 1, cy]], UNB.g1, 2); s.line([[cx + 1, cy - 1], [cx + r, cy - r]], UNB.g1, 2);
  s.set(cx - 1, cy - 1, UNB.g1); s.set(cx + 2, cy + 1, UNB.g1); s.set(cx - r - 1, cy + r - 1, UNB.g0); s.set(cx + r + 1, cy - r + 1, UNB.g0);
}
function sprBanner(f, fac) {
  const s = new PB(30, 78), sw = f ? 2 : 0, P = fac === "u" ? UNB : COV;
  s.rect(3, 4, 5, 76, "#3a2c20"); s.rect(3, 4, 3, 76, "#5a4630"); s.ell(1, 0, 7, 6, COV.g0); s.set(4, 2, COV.g1);   // the pole and its gilt knob
  s.rect(5, 8, 26, 9, "#3a2c20");                                                                                      // the crossbar
  const L = 7, R = 25, top = 10, bot = 50;
  s.poly([[L, top], [R, top], [R + sw, bot - 6], [L + 9 + sw, bot], [L + sw, bot - 6]], P.p1);                        // a swallowtail, swinging
  s.poly([[L, top], [L + 4, top], [L + 4 + sw, bot - 4], [L + sw, bot - 6]], P.p2);
  s.poly([[R - 4, top], [R, top], [R + sw, bot - 6], [R - 4 + sw, bot - 4]], P.p0);
  s.rect(L, top, R, top + 2, P.g0);
  if (fac === "u") { unbSigil(s, 16 + (sw >> 1), 26, 5); for (const [x, y] of [[10, 18], [22, 40], [14, 44]]) s.rect(x + sw, y, x + 2 + sw, y + 1, "#4a3a12"); }   // patched, and patched again
  else covSigil(s, 16 + (sw >> 1), 25, 5);
  for (const [x, y] of [[10, 38], [20, 31], [12, 44]]) s.rect(x + sw, y, x + 1 + sw, y + 1, "#3a2244");                // stains and moth holes
  s.rect(0, 74, 9, 77, "#4a4642");
  return s.outline().canvas();
}
/* A market stall: trestle, goods and a striped awning; at night its owner leaves it covered */
function sprStall(v) {
  const s = new PB(64, 62), aw = [["#6a2a2a", "#c8b894"], ["#2e4a3a", "#c8b894"], ["#4a2a5c", "#c8a24a"]][v % 3];
  for (const x of [4, 57]) { s.rect(x, 14, x + 2, 60, "#3a2c20"); s.rect(x, 14, x, 60, "#5a4630"); }
  for (let k = 0; k < 6; k++) { const x = 1 + k * 10.5; s.poly([[x, 6], [x + 10.5, 6], [x + 11, 20], [x - 0.5, 20]], aw[k % 2]); s.ell(x - 0.5, 17, x + 11, 23, aw[k % 2]); }
  s.rect(0, 4, 63, 7, "#3a2c20");
  s.rect(2, 38, 61, 44, "#5a4630"); s.rect(2, 38, 61, 38, "#7a6040"); s.rect(4, 44, 59, 46, "#2e2218");
  const goods = [["#8a5a2a", "#a87038"], ["#4a6a34", "#6a8a44"], ["#8a8a92", "#a8a8b0"]][v % 3];
  for (let k = 0; k < 6; k++) { const x = 6 + k * 9; s.ell(x, 30 + (k % 2) * 2, x + 8, 38, goods[k % 2]); s.set(x + 3, 32 + (k % 2) * 2, "#d8c8a0"); }
  s.rect(10, 48, 22, 59, "#5a4630"); s.rect(10, 48, 22, 49, "#7a6040"); s.ell(36, 50, 50, 60, "#7a6a4a"); s.line([[38, 52], [48, 52]], "#5a4a32");   // crate and sack beneath
  return s.outline().canvas();
}
/* A house going back up: posts, beams and rafters, pegged but not yet walled, with a ladder left against it. */
function sprFrame() {
  const s = new PB(96, 84), d = GP.woodD, m = GP.wood, l = GP.woodL;
  const post = (x, y0) => { s.rect(x, y0, x + 4, 82, m); s.rect(x, y0, x, 82, l); s.rect(x + 4, y0, x + 4, 82, d); };
  for (const x of [4, 32, 60, 87]) post(x, 36);
  s.rect(2, 34, 93, 38, m); s.rect(2, 34, 93, 34, l); s.rect(2, 38, 93, 38, d);
  s.rect(4, 58, 91, 60, d);
  for (const [a, b] of [[4, 32], [32, 60], [60, 87]]) s.line([[a + 4, 58], [b, 40]], d, 2);          // braces
  for (const x of [6, 34, 62, 88]) { s.line([[x, 36], [48, 6]], m, 3); s.line([[x, 35], [48, 5]], l); }   // rafters to the ridge
  s.rect(46, 4, 50, 36, m); s.rect(46, 4, 46, 36, l);
  for (let y = 44; y < 82; y += 7) s.line([[70, y], [78, y]], d);                                    // ladder
  s.line([[70, 40], [70, 82]], l, 2); s.line([[78, 40], [78, 82]], d, 2);
  for (const [x, y] of [[6, 36], [34, 36], [62, 36], [89, 36], [48, 8]]) s.set(x, y, "#2a1e14");     // pegs
  return s.outline().canvas();
}
function sprTimber() {
  const s = new PB(58, 26);
  for (let r = 0; r < 4; r++) { const y = 22 - r * 5, x0 = 2 + r * 2, x1 = 55 - (r % 2) * 5; s.rect(x0, y - 3, x1, y, r % 2 ? "#8a6a42" : "#9a7a4e"); s.rect(x0, y - 3, x1, y - 3, "#b8946a"); s.rect(x1 - 1, y - 2, x1, y, "#d8b888"); s.line([[x0 + 9, y - 2], [x1 - 6, y - 2]], "#7a5c38"); }
  s.rect(0, 23, 57, 25, "#3a2a1c"); s.rect(24, 1, 33, 4, "#5a5a5e");   // a bearer under it, a stone on top
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
/* A chest: shut (0), the lid lifting (1), and thrown back on its hinges with nothing left inside (2). */
function sprChest(f) {
  if (f) {
    const s = new PB(30, 34), top = 18;
    if (f === 1) {   // lid cracked: a dark gap under it
      s.rect(1, top, 28, 33, "#5a3e26"); s.rect(1, top, 28, top + 2, "#1a120c");
      s.poly([[1, top - 1], [3, top - 9], [26, top - 9], [28, top - 1]], "#6a4a2e"); s.poly([[3, top - 9], [26, top - 9], [25, top - 6], [4, top - 6]], "#7e5a38");
      for (const x of [5, 23]) { s.rect(x, top - 9, x + 2, top - 1, "#3a3640"); s.rect(x, top + 3, x + 2, 33, "#3a3640"); s.rect(x, top + 3, x, 33, "#5a5660"); }
    } else {         // lid upright behind the box, its pale underside showing; the inside is dark and empty
      s.poly([[2, top], [3, 2], [26, 2], [27, top]], "#4a3220"); s.poly([[4, top - 1], [5, 4], [24, 4], [25, top - 1]], "#5e4630");
      s.rect(3, 2, 26, 3, "#7e5a38");
      for (const x of [6, 22]) { s.rect(x, 2, x + 1, top - 1, "#3a3640"); }
      s.rect(1, top, 28, 33, "#5a3e26"); s.rect(2, top, 27, top + 4, "#140e0a"); s.rect(3, top + 4, 26, top + 4, "#2a1e14");
      for (const x of [5, 23]) { s.rect(x, top + 5, x + 2, 33, "#3a3640"); s.rect(x, top + 5, x, 33, "#5a5660"); }
    }
    s.rect(1, 25, 28, 26, "#3a3640"); s.rect(13, 23, 16, 28, "#6a5e3a"); s.set(14, 25, "#2a2420");
    if (f === 2) { s.rect(13, 23, 16, 24, "#3a3640"); s.rect(14, 27, 15, 29, "#6a5e3a"); }   // the hasp hangs loose
    return s.outline().canvas();
  }
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
function sprCaveMouth(sealed, walled) {   // a dark arch in the rock with a timber frame (or none, where nobody has dug); walled: bricked up by the Covenant
  const k = 1.3, P = (pts) => pts.map(([x, y]) => [Math.round(x * k), Math.round(y * k)]), R = (x0, y0, x1, y1, c) => s.rect(Math.round(x0 * k), Math.round(y0 * k), Math.round(x1 * k), Math.round(y1 * k), c);
  const s = new PB(Math.round(76 * k), Math.round(44 * k));
  s.poly(P([[4, 44], [8, 18], [20, 6], [38, 2], [56, 6], [68, 18], [72, 44]]), "#3a363a");
  s.poly(P([[14, 44], [16, 22], [26, 12], [38, 9], [50, 12], [60, 22], [62, 44]]), "#08060a");
  s.poly(P([[18, 44], [20, 26], [28, 18], [38, 15], [48, 18], [56, 26], [58, 44]]), "#020104");
  for (let n = 0; n < 12; n++) { const x = 8 + (gh(n, 7) % 58), y = 6 + (gh(n, 8) % 12); R(x, y, x + 3, y, "#5a565a"); }
  if (walled) {   // new dressed stone in courses filling the arch, the Covenant's seal pressed into the middle
    const arch = P([[14, 44], [16, 22], [26, 12], [38, 9], [50, 12], [60, 22], [62, 44]]);
    const inside = (x, y) => { let c = false; for (let i = 0, j = arch.length - 1; i < arch.length; j = i++) { const [xi, yi] = arch[i], [xj, yj] = arch[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
    for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) {
      if (!inside(x + 0.5, y + 0.5)) continue;
      const row = Math.floor(y / 6), bx = Math.floor((x + (row % 2) * 6) / 12), seam = y % 6 === 0 || (x + (row % 2) * 6) % 12 === 0;
      s.set(x, y, seam ? "#4a4642" : ["#8e887c", "#9a9488", "#847e72"][(bx * 7 + row * 3) % 3]);
      if (!seam && y % 6 === 1) s.set(x, y, "#aaa496");
    }
    covSigil(s, Math.round(38 * k), Math.round(30 * k), 6);
  }
  if (!sealed) {
    R(12, 16, 16, 43, "#4e3e2c"); R(12, 16, 13, 43, "#62503a");
    R(60, 16, 64, 43, "#4e3e2c"); R(60, 16, 61, 43, "#62503a");
    R(9, 13, 67, 17, "#3a2c20"); R(9, 13, 67, 13.5, "#62503a");
  }
  return s.outline().canvas();
}
function sprVaultDoor() {   // Aurelm's Vault: a dressed-stone portal in the rock, the Covenant's sigil on the lintel; one iron leaf wrenched off its hinge, the other shut; chains across both
  const k = 1.3, P = (pts) => pts.map(([x, y]) => [Math.round(x * k), Math.round(y * k)]), R = (x0, y0, x1, y1, c) => s.rect(Math.round(x0 * k), Math.round(y0 * k), Math.round(x1 * k), Math.round(y1 * k), c);
  const s = new PB(Math.round(76 * k), Math.round(48 * k));
  s.poly(P([[2, 48], [4, 8], [38, 0], [72, 8], [74, 48]]), "#4a4644");                 // the dressed face cut into the rock
  for (let y = 4; y < 48; y += 6) R(4, y, 72, y, "#3a3634");
  for (let n = 0; n < 14; n++) { const x = 6 + (gh(n, 17) % 62), y = 6 + (gh(n, 18) % 38); R(x, y, x + 4, y, "#5e5a56"); }
  R(10, 8, 66, 14, "#6e6a64"); R(10, 8, 66, 9, "#8a867e"); covSigil(s, Math.round(38 * k), Math.round(11 * k), 4);   // the lintel
  R(14, 15, 62, 48, "#08060a");                                                          // the dark beyond
  s.poly(P([[38, 15], [61, 15], [61, 48], [38, 48]]), "#2a2c30");                         // the right leaf, shut
  for (let y = 18; y < 48; y += 7) R(39, y, 60, y + 1, "#3e4248");
  for (const y of [20, 34]) for (const x of [42, 50, 58]) R(x, y, x + 1, y + 1, "#6a6e74");
  s.poly(P([[15, 22], [33, 15], [36, 48], [17, 48]]), "#22242a");                         // the left leaf, torn from its top hinge and hanging askew
  for (let n = 0; n < 4; n++) s.line(P([[16 + n, 26 + n * 6], [34, 19 + n * 7]]), "#3a3e44");
  s.line(P([[15, 22], [33, 15]]), "#5a5e64");
  R(30, 16, 34, 17, "#7a3a20");                                                          // a sheared hinge, rusting
  const chain = (x0, y0, x1, y1) => { const n = 14; for (let i = 0; i <= n; i++) { const x = x0 + ((x1 - x0) * i) / n, y = y0 + ((y1 - y0) * i) / n + Math.sin((i / n) * Math.PI) * 3; R(x - 1, y - 1, x + 1, y + 1, i % 2 ? "#8a8e94" : "#5a5e64"); } };
  chain(14, 20, 62, 42); chain(62, 20, 14, 42); chain(14, 31, 62, 31);                   // chains across, X and bar
  R(35, 28, 41, 35, "#6a5a3a"); R(36, 29, 40, 34, "#8a7448"); R(37, 26, 39, 28, "#5a5e64");   // the padlock
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
  chest: (f) => sprChest(f), books: () => sprBooks(), jugs: () => sprJugs(), cauldron: () => sprCauldron(), candles: () => sprCandles(), straw: () => sprStraw(),
  herbs: (v) => sprHerbs(v), painting: (v) => sprPainting(v), mirror: () => sprMirror(), shelfw: () => sprShelfW(), tools: () => sprTools(), cloths: () => sprCloths(), firewood: () => sprFirewood(),
  baskets: () => sprBaskets(), block: () => sprBlock(), well: () => sprWell(), lamp: (lit) => sprLamp(lit), board: () => sprBoard(),
  firepit: () => sprFirePit(), leanto: () => sprLeanTo(), deadlog: () => sprDeadLog(), bones: () => sprBones(),
  memorial: () => sprMemorial(), frame: () => sprFrame(), timber: () => sprTimber(),
  banner: (f) => sprBanner(f), ubanner: (f) => sprBanner(f, "u"), stall: (v) => sprStall(v), tarp: () => sprTarp(),
  wagon: (v) => sprWagon(v), sentry: () => sprSentry(), shrine: () => sprShrine(), grate: () => sprGrate(), dummy: () => sprDummy(), hatch: () => sprHatch(), wheel: (f) => sprWheel(f),
};
/* A straw practice man on a post: a sack tunic, a sack head with a charcoal face, straw out of every thrust. */
function sprDummy() {
  const s = new PB(28, 54);
  s.rect(12, 30, 15, 53, GP.woodD); s.rect(12, 30, 12, 53, GP.wood); s.rect(3, 22, 24, 25, GP.wood);
  s.ell(6, 16, 21, 40, "#8a7a4e"); s.ell(8, 18, 19, 38, "#a08e5a"); s.rect(7, 24, 20, 36, "#6a5a3a");
  s.ell(8, 2, 19, 16, "#b8a878"); s.line([[11, 8], [12, 8]], "#2a2622"); s.line([[15, 8], [16, 8]], "#2a2622"); s.line([[11, 12], [16, 11]], "#2a2622");
  for (const [x, y] of [[5, 22], [22, 23], [10, 32], [17, 28], [14, 37]]) { s.line([[x, y], [x + 2, y - 3]], "#d8c890"); }
  s.rect(10, 51, 17, 53, "#3a3228");
  return s.outline().canvas();
}
/* A covered wagon, side-on: a canvas tilt on hoops over a plank bed, two big wheels. v 3 is the burned-out supply cart. */
function sprWagon(v) {
  const s = new PB(70, 50), burnt = v === 3, tilt = [["#8a826c", "#a29a82"], ["#6e6a5a", "#888270"], ["#7a6a52", "#94846a"], ["#2a2622", "#3a3430"]][v % 4];
  if (!burnt) { s.poly([[6, 30], [8, 10], [14, 4], [56, 4], [62, 10], [64, 30]], tilt[0]); s.poly([[10, 28], [11, 11], [16, 7], [54, 7], [59, 11], [60, 28]], tilt[1]);
    for (const x of [18, 32, 46]) s.line([[x, 6], [x, 29]], "#5a5446"); s.rect(10, 6, 60, 8, "#c8ccd6"); }
  else { for (const x of [12, 30, 48]) { s.line([[x, 30], [x + 2, 10]], "#2a221c", 2); } s.poly([[8, 30], [62, 30], [58, 24], [12, 22]], "#3a3026"); }
  s.rect(4, 30, 66, 36, burnt ? "#2e2620" : GP.wood); s.rect(4, 30, 66, 31, burnt ? "#3a3028" : GP.woodL); s.rect(4, 36, 66, 37, GP.woodD);
  s.line([[66, 34], [70, 40]], GP.woodD, 2);
  for (const cx of [16, 54]) { s.ell(cx - 9, 31, cx + 9, 49, "#2a2018"); s.ell(cx - 7, 33, cx + 7, 47, burnt && cx > 30 ? "#14100c" : "#5a4630"); s.ell(cx - 2, 38, cx + 2, 42, "#2a2018");
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 4; s.line([[cx + Math.cos(a) * 7, 40 + Math.sin(a) * 7], [cx - Math.cos(a) * 7, 40 - Math.sin(a) * 7]], "#3a2c20"); } }
  if (burnt) s.poly([[48, 36], [62, 36], [64, 44], [50, 46]], "#1a1612");   // a wheel gone, the bed down on that side
  return s.outline().canvas();
}
/* A Covenant sentry box: a narrow plank hut with a pitched cap, the sigil painted on the side, a brazier beside it. */
function sprSentry() {
  const s = new PB(36, 62);
  s.rect(4, 16, 26, 60, "#4a4446"); s.rect(4, 16, 6, 60, "#5e585a"); s.rect(8, 24, 22, 58, "#16141a");
  s.poly([[1, 18], [15, 4], [29, 18]], "#2e2a36"); s.poly([[3, 17], [15, 6], [15, 17]], "#3e3848"); s.line([[1, 18], [15, 4], [29, 18]], "#c8ccd6");
  s.rect(10, 30, 20, 40, "#6a5a7a"); s.ell(12, 32, 18, 38, "#c8b46a");
  s.rect(28, 44, 35, 49, "#2a2a30"); s.rect(30, 49, 33, 60, "#2a2a30"); s.ell(28, 40, 35, 46, "#e08838"); s.set(31, 41, "#f8d080");
  return s.outline().canvas();
}
/* A wayside shrine: a stone post with a little gabled niche, a lamp gone out inside, offerings frozen to the ledge. */
function sprShrine() {
  const s = new PB(30, 56);
  s.rect(9, 26, 21, 54, GP.stoneD); s.rect(9, 26, 11, 54, GP.stone); s.rect(5, 50, 25, 55, GP.stoneD);
  s.rect(5, 10, 25, 28, GP.stone); s.rect(9, 14, 21, 26, "#1a181e"); s.poly([[3, 12], [15, 2], [27, 12]], "#3a3842"); s.line([[3, 12], [15, 2], [27, 12]], "#d0d4de");
  s.rect(13, 19, 17, 25, "#5a5a62"); s.rect(14, 20, 16, 22, "#8a7a5a");
  s.rect(6, 28, 24, 29, "#d0d4de"); s.set(8, 27, "#8a2a2a"); s.set(21, 27, "#6a6a3a");
  return s.outline().canvas();
}
/* A culvert grate where the Fort's kitchen runoff leaves under the wall: iron bars over black water, rust down the stone. */
function sprGrate() {
  const s = new PB(34, 28);
  s.rect(0, 0, 33, 27, "#3a383e"); s.rect(3, 3, 30, 24, "#0c0b0e");
  for (let x = 5; x < 30; x += 5) { s.rect(x, 3, x + 1, 24, "#5e5c64"); s.set(x, 3, "#8a8890"); }
  s.rect(3, 12, 30, 13, "#4e4c54"); s.line([[10, 24], [12, 27]], "#7a4a2a"); s.line([[24, 24], [25, 27]], "#7a4a2a");
  s.rect(4, 20, 29, 23, "#1e2a30");
  return s.canvas();
}

/* a quarantine stake: a split post sharpened to a point, a rope through it running on to the next, a rag knotted on */
function sprStake(v, up, dn, post = true) {
  const s = new PB(22, 62), x = 9;
  if (!post) {   // between the stakes: the rope sagging on, a rag here and there
    s.line([[x + 2, 0], [x + 1, 30], [x + 2, 61]], "#7a6844"); s.line([[x + 3, 0], [x + 2, 30], [x + 3, 61]], "#b8a070");
    if (v === 0) s.poly([[x + 3, 28], [x + 9, 30], [x + 8, 38], [x + 4, 33]], "#c8a43a");
    if (v === 1) s.poly([[x + 1, 30], [x - 5, 33], [x - 4, 40], [x, 35]], "#a8302a");
    return s.outline().canvas();
  }
  s.poly([[x, 6], [x + 2, 0], [x + 4, 6]], "#7a6244"); s.rect(x, 6, x + 4, 57, "#5a4430"); s.rect(x, 6, x, 57, "#7a6244"); s.rect(x + 4, 6, x + 4, 57, "#3a2c20");
  for (const yy of [20, 38]) s.rect(x - 1, yy, x + 5, yy + 1, "#2e2418");
  s.rect(x - 2, 56, x + 6, 59, "#3a3026");
  const rope = "#b8a070", ropeD = "#7a6844";
  if (up) { s.line([[x + 2, 22], [x + 2, 0]], ropeD); s.line([[x + 3, 22], [x + 3, 0]], rope); }
  if (dn) { s.line([[x + 2, 24], [x + 2, 61]], ropeD); s.line([[x + 3, 24], [x + 3, 61]], rope); }
  s.ell(x - 1, 20, x + 5, 25, rope);
  if (v === 0) { s.poly([[x + 5, 22], [x + 12, 24], [x + 11, 33], [x + 6, 28]], "#c8a43a"); s.line([[x + 7, 25], [x + 10, 31]], "#8a6a1e"); }
  if (v === 1) { s.poly([[x - 1, 23], [x - 7, 26], [x - 6, 34], [x - 2, 29]], "#a8302a"); }
  return s.outline().canvas();
}
/* a mill's undershot wheel, side-on in the stream: a rim, spokes and paddles; two frames a little turned */
function sprWheel(f) {
  const s = new PB(60, 62), cx = 30, cy = 30, R = 28;
  const ang = f ? Math.PI / 12 : 0;
  s.ell(cx - R, cy - R, cx + R, cy + R, "#3a2a1c"); s.ell(cx - R + 3, cy - R + 3, cx + R - 3, cy + R - 3, "#0e1418");
  for (let k = 0; k < 8; k++) {
    const a = ang + (k * Math.PI) / 4, x1 = cx + Math.cos(a) * (R - 2), y1 = cy + Math.sin(a) * (R - 2);
    s.line([[cx, cy], [x1, y1]], "#5a4630", 2);
    const px = cx + Math.cos(a) * R, py = cy + Math.sin(a) * R, nx = -Math.sin(a) * 4, ny = Math.cos(a) * 4;
    s.poly([[px - nx, py - ny], [px + nx, py + ny], [px + nx + Math.cos(a) * 3, py + ny + Math.sin(a) * 3], [px - nx + Math.cos(a) * 3, py - ny + Math.sin(a) * 3]], "#6e5638");
  }
  s.ell(cx - 4, cy - 4, cx + 4, cy + 4, "#2a2a30"); s.ell(cx - 2, cy - 2, cx + 2, cy + 2, "#6a6a72");
  for (let k = 0; k < 8; k++) s.rect(4 + k * 7, 56 + (k + f) % 2, 7 + k * 7, 57 + (k + f) % 2, "#a8c8d8");   // white water where the paddles bite
  return s.outline().canvas();
}
/* a cellar trapdoor set flat in the ground: two leaves of planks on a stone lip, an iron ring, a rusted chain */
function sprHatch() {
  const s = new PB(34, 26);
  s.rect(0, 0, 33, 25, "#4a4642"); s.rect(1, 1, 32, 1, "#6a6660"); s.rect(0, 24, 33, 25, "#2e2a28");
  for (const x0 of [3, 17]) {
    s.rect(x0, 3, x0 + 13, 22, "#4e3a26");
    for (let x = x0 + 3; x < x0 + 13; x += 4) s.line([[x, 3], [x, 22]], "#33261a");
    s.rect(x0, 3, x0 + 13, 3, "#6e5638"); s.rect(x0, 8, x0 + 13, 9, "#3a3a3e"); s.rect(x0, 17, x0 + 13, 18, "#3a3a3e");
  }
  s.rect(16, 3, 17, 22, "#1a1410");
  s.ell(13, 11, 20, 16, "#5a5a60"); s.ell(15, 13, 18, 14, "#1a1410");
  for (let k = 0; k < 6; k++) s.rect(18 + k * 2, 13 + (k % 2), 19 + k * 2, 14 + (k % 2), "#6a4a2e");
  return s.outline().canvas();
}

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
    outpost: { roof: ["#1c1824", "#2a2436", "#3a3248"], wall: ["#6e6a66", "#807c78", "#58544f"], thatch: false },
    apoth: { roof: ["#22301e", "#34482c", "#465e3a"], wall: ["#9a8a6a", "#ac9c7a", "#806e50"], thatch: false },
    tailor: { roof: ["#3a2232", "#5a3448", "#72465c"], wall: ["#a49072", "#b6a282", "#887458"], thatch: false },
    mill: { roof: ["#4a4028", "#6a5a36", "#82703f"], wall: ["#7c6e5a", "#8e806a", "#625646"], thatch: true },
    lamphouse: { roof: ["#26241e", "#38352a", "#4a4636"], wall: ["#8e8064", "#a09274", "#74684e"], thatch: false },
    boarded: { roof: ["#222428", "#34363e", "#464a54"], wall: ["#7a766c", "#8c887c", "#5e5a52"], thatch: false },
    inn: { roof: ["#3a2a1c", "#54402a", "#6a5236"], wall: ["#8a7a5c", "#9c8c6c", "#706246"], thatch: true },
  }[kind];
  const thatch = KP ? KP.thatch : (style === "hovel" || style === "timber");
  const roofDark = KP ? KP.roof[0] : thatch ? "#4a4028" : "#2e3036", roofMid = KP ? KP.roof[1] : thatch ? "#5e5032" : "#3c4046", roofLit = KP ? KP.roof[2] : thatch ? "#6e5e3c" : "#4a4e56";
  // chimney for warm houses
  const peak = 6, eave = wallTop;
  if (style !== "hovel") {   // the stack rises from the roof: its foot runs down under the slope so it never floats
    const cx = W - 34, roofY = (x) => peak + Math.max(0, (x - (W / 2 + 6)) / (W / 2 + 4)) * (eave - peak);
    const foot = Math.ceil(roofY(cx + 16)) + 3, top = Math.max(0, Math.round(roofY(cx)) - 30);
    s.rect(cx, top, cx + 16, foot, "#4e4c4e"); s.rect(cx, top, cx + 4, foot, "#625f62"); s.rect(cx - 2, top, cx + 18, top + 4, "#3a383a");
  }
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
    if (opt.plague) {   // sealed with the sick inside: planks nailed across, a red cross daubed over them
      for (const by of [dt + 7, dt + 21]) { s.rect(dx - 3, by, dx + 27, by + 3, "#6a5236"); s.rect(dx - 3, by, dx + 27, by, "#8a7050"); s.set(dx - 1, by + 1, "#2a2420"); s.set(dx + 25, by + 1, "#2a2420"); }
      s.line([[dx + 2, dt + 2], [dx + 22, base - 2]], "#a8242a", 3); s.line([[dx + 22, dt + 2], [dx + 2, base - 2]], "#a8242a", 3);
      s.line([[dx + 3, dt + 1], [dx + 21, base - 4]], "#d23a3a", 1); s.set(dx + 12, base - 1, "#7a1a1e"); s.set(dx + 13, base, "#7a1a1e");
    }
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
  } else if (kind === "outpost") {    // the Covenant's house: long purple banners with the gold sigil, a carved lintel, steps
    const bxs = [dxp - 34, dxp + 44]; if (W > 260) bxs.push(18, W - 20);
    for (const x of bxs) {
      if (x < 8 || x > W - 10) continue;
      s.rect(x - 2, eave + 6, x + 16, eave + 9, "#2a2218"); s.rect(x, eave + 9, x + 14, eave + 50, COV.p1); s.rect(x, eave + 9, x + 2, eave + 50, COV.p2); s.rect(x + 12, eave + 9, x + 14, eave + 50, COV.p0);
      s.poly([[x, eave + 50], [x + 7, eave + 43], [x + 14, eave + 50]], COV.p1); s.rect(x, eave + 9, x + 14, eave + 11, COV.g0);
      covSigil(s, x + 7, eave + 24, 4);
    }
    s.rect(dxp - 10, base - 5, dxp + 34, base, "#8a8682"); s.rect(dxp - 6, base - 9, dxp + 30, base - 5, "#7a7672");
    s.rect(dxp - 8, tdoor - 8, dxp + 32, tdoor - 3, "#9a9690"); s.poly([[dxp - 8, tdoor - 8], [dxp + 12, tdoor - 20], [dxp + 32, tdoor - 8]], "#8a8682");
    covSigil(s, dxp + 12, tdoor - 11, 3);
  } else if (kind === "apoth") {      // drying herbs under the eaves and a mortar sign
    for (let k = 0; k < 5; k++) { const x = 14 + k * 9; s.line([[x, eave + 8], [x, eave + 18]], "#3a2c20"); s.ell(x - 3, eave + 16, x + 3, eave + 26, k % 2 ? "#5a6a3a" : "#7a6a3a"); }
    const x = Math.min(W - 30, dxp + 38), y = eave + 14;
    s.rect(x - 4, y - 4, x + 28, y - 2, "#2a1a10"); s.rect(x - 1, y + 2, x + 26, y + 22, "#3a2a1c"); s.rect(x, y + 3, x + 25, y + 21, "#6a5238");
    s.poly([[x + 6, y + 9], [x + 19, y + 9], [x + 16, y + 18], [x + 9, y + 18]], "#b8b4a8"); s.line([[x + 15, y + 5], [x + 20, y + 12]], "#7a5a3a", 2);
  } else if (kind === "tailor") {     // a bolt of cloth and a pair of shears on the board
    const x = Math.min(W - 30, dxp + 38), y = eave + 14;
    s.rect(x - 4, y - 4, x + 28, y - 2, "#2a1a10"); s.rect(x - 1, y + 2, x + 26, y + 22, "#3a2a1c"); s.rect(x, y + 3, x + 25, y + 21, "#6a5238");
    s.rect(x + 4, y + 7, x + 12, y + 18, "#7a3a5a"); s.rect(x + 4, y + 7, x + 12, y + 8, "#9a5a7a");
    s.ell(x + 15, y + 13, x + 19, y + 17, "#a8a8b4"); s.ell(x + 19, y + 13, x + 23, y + 17, "#a8a8b4"); s.line([[x + 17, y + 13], [x + 22, y + 5]], "#a8a8b4"); s.line([[x + 21, y + 13], [x + 16, y + 5]], "#a8a8b4");
  } else if (kind === "mill") {       // sacks of meal and a millstone leant on the wall
    s.ell(8, base - 30, 34, base - 4, "#7a7672"); s.ell(18, base - 20, 24, base - 14, "#4a4642");
    for (const x of [W - 40, W - 26]) { s.ell(x, base - 18, x + 14, base - 2, "#b4a682"); s.line([[x + 3, base - 14], [x + 11, base - 14]], "#8a7c5c"); }
  } else if (kind === "lamphouse") {  // the Unbound's house: a yellow lamp burning by the door day and night, their banner, a lamp in every window
    const lx = dxp + 32, ly = tdoor - 6;
    s.rect(lx - 2, ly - 10, lx + 12, ly - 8, "#2a2218"); s.rect(lx + 4, ly - 8, lx + 5, ly - 4, "#2a2218");
    s.rect(lx, ly - 4, lx + 9, ly + 10, "#2a2218"); s.rect(lx + 2, ly - 2, lx + 7, ly + 8, "#f0c040"); s.rect(lx + 3, ly - 1, lx + 6, ly + 2, "#fff0a0");
    for (const wx of wins) { const x = wx - 11; s.rect(x + 3, eave + 15, x + 19, eave + 15 + Math.min(26, base - eave - 26) - 6, "#d8a830"); }
    const bx = Math.max(10, dxp - 34);
    s.rect(bx - 2, eave + 6, bx + 16, eave + 9, "#2a2218"); s.rect(bx, eave + 9, bx + 14, eave + 46, UNB.p1); s.rect(bx, eave + 9, bx + 2, eave + 46, UNB.p2);
    s.poly([[bx, eave + 46], [bx + 7, eave + 40], [bx + 14, eave + 46]], UNB.p1); unbSigil(s, bx + 7, eave + 24, 4);
  } else if (kind === "boarded") {    // a Covenant chapel, shut: planks nailed over door and windows, the sigil chiselled off the gable
    const cx = Math.round(W / 2 + 6);
    s.ell(cx - 9, peak + 36, cx + 9, peak + 54, "#2a2624"); s.line([[cx - 10, peak + 38], [cx + 10, peak + 52]], "#5a4430", 3); s.line([[cx - 10, peak + 52], [cx + 10, peak + 38]], "#4e3c2c", 3);
    s.rect(cx - 3, peak + 10, cx + 3, peak + 26, "#5e5a52");                                   // where the sigil was
    for (const wx of wins) { const x = wx - 11; for (let k = 0; k < 3; k++) s.line([[x - 3, eave + 14 + k * 8], [x + 25, eave + 16 + k * 8]], k % 2 ? "#4e3c2c" : "#5a4430", 3); }
    for (let k = 0; k < 4; k++) s.line([[dxp - 4, tdoor + 4 + k * 8], [dxp + 28, tdoor + 6 + k * 8]], k % 2 ? "#4e3c2c" : "#5a4430", 3);
    s.rect(dxp + 6, tdoor + 10, dxp + 18, tdoor + 22, "#c8b894"); s.line([[dxp + 8, tdoor + 13], [dxp + 16, tdoor + 13]], "#6a5a4a"); s.line([[dxp + 8, tdoor + 17], [dxp + 14, tdoor + 17]], "#6a5a4a");   // a notice: by order, closed
  } else if (kind === "inn") {        // a hanging sign with a bed on it, and a lantern
    const x = Math.min(W - 24, dxp + 38), y = eave + 12;
    s.rect(x - 6, y - 4, x + 26, y - 2, "#2a1a10"); s.rect(x + 1, y - 2, x + 2, y + 3, "#2a1a10"); s.rect(x + 21, y - 2, x + 22, y + 3, "#2a1a10");
    s.rect(x - 1, y + 3, x + 24, y + 20, "#3a2214"); s.rect(x, y + 4, x + 23, y + 19, "#5a3a22");
    s.rect(x + 4, y + 10, x + 19, y + 15, "#c8b894"); s.rect(x + 4, y + 8, x + 8, y + 10, "#e8e0c8"); s.rect(x + 3, y + 8, x + 4, y + 16, "#2a1a10"); s.rect(x + 19, y + 11, x + 20, y + 16, "#2a1a10");
    s.rect(dxp - 16, tdoor + 4, dxp - 12, tdoor + 14, "#2a1e14"); s.rect(dxp - 18, tdoor + 14, dxp - 10, tdoor + 22, "#c89040");
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
  const ROAD = new Set(["=", "P", "Z", "S", "G", "g"]), WATER = new Set(["~"]);
  const BUILD = new Set(["R", "W", "w", "D"]);
  const isRoad = (x, y) => { const c = at(x, y); return c === "=" || c === "P" || c === "Z" || c === "B" || c === "G" || c === "g"; };
  const isWater = (x, y) => { const c = at(x, y); return c === "~" || c === "B"; };
  bakeGrimMap.rat = 0; bakeGrimMap.clear = []; bakeGrimMap.flames = [];
  const snowy = def.snowY0 !== undefined;
  const hi = (img, x, y, sortY, extra) => {   // x,y in world units; on the snowy plains, things wear a cap of snow
    if (snowy && img && !(extra && extra.nocap)) { const sn = snowAtTile(def, Math.floor((sortY || y) / TILE)); if (sn > 0.12) img = snowCapped(img, sn); }
    talls.push({ hi: true, img, x, y, sortY, ...(extra || {}) });
  };

  if (def.outside) {
    /* ground, roads, water, crops: painted pixel by pixel in world coordinates.
       Water, roads and cliffs are read from smooth fields rather than tile edges, so shores, trails and rock rims
       curve instead of stepping tile by tile. */
    const isWaterC = (c) => c === "~" || c === "B", isRoadC = (c) => c === "=" || c === "P" || c === "Z" || c === "B" || c === "D" || c === "G" || c === "g", isCliffC = (c) => c === "C" || c === "O";
    const WF = tileField(cells, w, h, isWaterC), RF0 = tileField(cells, w, h, isRoadC), CF = tileField(cells, w, h, isCliffC);
    /* roads wander: the tile field is pushed about by slow noise so the edges drift and the width breathes, and it is
       averaged over a cross so junctions and bends round off instead of meeting at right angles */
    const RWARP = def.pave ? 9 : 16, RR = 9;
    const nearRd = new Uint8Array(w * h);   // tiles within two of a road: everywhere else the field is simply zero
    for (let ty = 0; ty < h; ty++) for (let tx = 0; tx < w; tx++) if (isRoadC(cells[ty][tx])) for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) { const x = tx + i, y = ty + j; if (x >= 0 && y >= 0 && x < w && y < h) nearRd[y * w + x] = 1; }
    const RS = 4, RW2 = Math.ceil(w * GT / RS) + 2, RMEMO = new Float32Array(RW2 * (Math.ceil(h * GT / RS) + 2)).fill(-1);   // the field on a 4px lattice, worked out once, read smoothly between
    const RG = (i, j) => { const mi = j * RW2 + i, mv = RMEMO[mi]; return mv >= 0 ? mv : (RMEMO[mi] = RFraw(i * RS, j * RS)); };
    const RF = (wx, wy) => {
      const tx = (wx / GT) | 0, ty = (wy / GT) | 0; if (tx < 0 || ty < 0 || tx >= w || ty >= h || !nearRd[ty * w + tx]) return 0;
      const u = wx / RS, v = wy / RS, i = u | 0, j = v | 0, fx = u - i, fy = v - j;
      const a = RG(i, j) + (RG(i + 1, j) - RG(i, j)) * fx, c = RG(i, j + 1) + (RG(i + 1, j + 1) - RG(i, j + 1)) * fx;
      return a + (c - a) * fy;
    };
    const RFraw = (wx, wy) => {
      const X = wx + (gnoise(wx, wy, 44, 401) - 0.5) * RWARP * 2, Y = wy + (gnoise(wx, wy, 44, 402) - 0.5) * RWARP * 2;
      const c = RF0(X, Y); if (c <= 0.02 || c >= 0.98) return c;
      const avg = (c * 2 + RF0(X - RR, Y) + RF0(X + RR, Y) + RF0(X, Y - RR) + RF0(X, Y + RR)) / 6;
      return c > avg ? c * 0.8 + avg * 0.2 : avg;   // inside corners fill in; a narrow track keeps its width
    };
    bakeGrimMap.CF = CF; bakeGrimMap.RF = RF; bakeGrimMap.WF = WF; bakeGrimMap.cells = cells;
    const nearTile = (test, tx, ty, r) => { for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) { const c = at(clamp(tx + i, 0, w - 1), clamp(ty + j, 0, h - 1)); if (test(c)) return true; } return false; };
    const WP = id === "wood" ? WATER_PAL.bog : WATER_PAL.town, town = id === "oak" || !!def.town;
    const TCACHE = new Array(256).fill(null);
    for (let ty = 0; ty < h; ty++) for (let tx = 0; tx < w; tx++) {
      const c = cells[ty][tx];
      const nW = nearTile(isWaterC, tx, ty, 1), nR = nearTile(isRoadC, tx, ty, 1), nR2 = town && nearTile(isRoadC, tx, ty, 2);
      TCACHE.fill(null);
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
          const pz = def.paveZones ? def.paveZones.find((z) => tx >= z[0] && tx <= z[2] && ty >= z[1] && ty <= z[3]) : null;   // a town's streets seen from the plains
          if ((def.pave || pz) && rf > 0.38) col = paveColor(pz ? pz[4] : def.pave, wx, wy, rf);
          if (col) {}
          else if (rf > 0.36) col = mudColor(wx, wy);
          else if (rf > 0.31) col = gnoise(wx, wy, 3, 174) > 0.5 ? GP.m0 : GP.gmud;   // a ragged lip of trodden earth
          else if (town && rf > 0.12 && gnoise(wx, wy, 13, 175) * (rf + 0.4) > 0.36) col = gnoise(wx, wy, 4, 176) > 0.55 ? GP.gmud : GP.dead;   // grass worn thin beside the roads
        }
        if (!col) {
          if (c === "c") { const row = (wy >> 3) % 2; col = row ? "#3e3226" : (gnoise(wx, wy, 8, 21) > 0.5 ? "#4c3e2e" : "#5a4a36"); }
          else { const ci = (y >> 1) * 16 + (x >> 1); col = TCACHE[ci] || (TCACHE[ci] = terrainColor(def, wx & ~1, wy & ~1)); }   // one world pixel is 2x2 here: work the ground out once per world pixel
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
      if (!def.pave && r % 5 === 0 && bakeGrimMap.RF(tx * GT + 16, ty * GT + 16) > 0.55) {
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
        const roadNB = (x, y) => isRoad(x, y) && at(x, y) !== "B";
        const horiz = def.stoneBridge ? roadNB(tx - 1, ty) || roadNB(tx + 1, ty) || (at(tx - 1, ty) === "B" && at(tx + 1, ty) === "B" && !roadNB(tx, ty - 1))
          : isRoad(tx - 1, ty) || isRoad(tx + 1, ty) || at(tx - 1, ty) === "B" && at(tx + 1, ty) === "B";
        const stone = !!def.stoneBridge;
        const flag = (wx, wy) => {   // old dressed flagstones in staggered courses, worn pale down the middle
          const row = Math.floor(wy / 10), off = (row % 2) * 8, bx = Math.floor((wx + off) / 16);
          if (wy % 10 === 0 || (wx + off) % 16 === 0) return "#3e3a36";
          const v = gh(bx, row, 41) % 3; let col = v === 0 ? "#6e6a64" : v === 1 ? "#7a766e" : "#625e58";
          if (gnoise(wx, wy, 9, 42) > 0.74) col = "#4e5a3e"; else if (wy % 10 === 1) col = "#8a867e";
          return col;
        };
        for (let y = 0; y < GT; y++) for (let x = 0; x < GT; x++) {
          const k = horiz ? x : y, wx = tx * GT + x, wy = ty * GT + y;
          if (stone) { b.set(wx, wy, flag(wx, wy)); continue; }
          const seam = k % 8 === 0 || ((horiz ? y : x) === 0 && false);
          let col = seam ? "#2a1e14" : (gh((horiz ? wx : wy) >> 3, 4) % 3 === 0 ? "#5a4630" : "#4e3e2c");
          if (gnoise(wx, wy, 6, 19) > 0.8) col = "#3a2c20";
          b.set(wx, wy, col);
        }
        if (stone && !horiz) {   // a stone bridge, end-on: low parapets of the same stone along both sides, standing up out of the water
          for (const side of [-1, 1]) {
            if (at(tx + side, ty) === "B") continue;
            const par = new PB(13, GT + 14);
            for (let y = 0; y < GT + 14; y++) for (let x = 0; x < 13; x++) { const row = Math.floor(y / 8), seam = y % 8 === 0 || (x + (row % 2) * 6) % 13 === 0; par.set(x, y, seam ? "#3a3632" : x < 3 ? "#8e8a82" : x > 10 ? "#54504a" : (gh(row, x >> 2, 43) % 2 ? "#6a665e" : "#76726a")); }
            par.rect(0, 0, 12, 2, "#9a968c");
            const px = side < 0 ? tx * GT - 8 : (tx + 1) * GT - 5;
            castShadow(b, par.canvas(), px, ty * GT - 8, 3, 2, 0.3);
            hi(par.outline().canvas(), px / WZ, (ty * GT - 10) / WZ, ty * TILE + 15);
          }
        }
        // landing boards: planks run out over the bank at each end so no strip of water shows between the bridge and the road
        for (const [dx, dy] of horiz ? [[-1, 0], [1, 0]] : [[0, -1], [0, 1]]) {
          if (at(tx + dx, ty + dy) === "B" || at(tx + dx, ty + dy) === "~") continue;
          for (let e = 0; e < 11; e++) for (let t = 0; t < GT; t++) {
            const wx = horiz ? (dx < 0 ? tx * GT - 1 - e : (tx + 1) * GT + e) : tx * GT + t, wy = horiz ? ty * GT + t : (dy < 0 ? ty * GT - 1 - e : (ty + 1) * GT + e);
            const k = horiz ? wx : wy; let col = stone ? flag(wx, wy) : k % 8 === 0 ? "#2a1e14" : (gh(k >> 3, 4) % 3 === 0 ? "#5a4630" : "#4e3e2c");
            if (e >= 9 && gnoise(wx, wy, 5, 23) > 0.45) continue;   // ragged outer edge
            b.set(wx, wy, col);
          }
        }
        // rails as tall pieces so characters pass behind the far one
        // posts at the bridge ends and a two-beam rail between them, lit along the top so it reads against the planks
        if (stone) continue;
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
      const dk = (door && (def.doorKinds || {})[`${door[0]},${door[1]}`]) || (def.bldKinds || {})[`${bd.x0},${bd.y0}`];
      const style = dk ? (dk === "chapel" || dk === "watch" || dk === "outpost" || dk === "boarded" ? "stone" : dk === "shack" ? "hovel" : "timber") : style0;
      const kind = dk || kind0;
      const BW = tw * GT, BH = th * GT;
      const opt = { W: BW - 12, H: BH, roofH: Math.round(BH * 0.52), wins: bd.wins.map((x) => (x - bd.x0) * GT + 10), door: door ? (door[0] - bd.x0) * GT + 10 : null, style, seed: bd.x0 * 7 + bd.y0, kind, trade,
        plague: !!(door && def.plague && def.plague.includes(door[0] + "," + door[1])) };
      if (def.burning) opt.burn = true;
      let day = sprBuilding(opt, false), night = style === "hovel" ? day : sprBuilding(opt, true);
      const snB = snowy ? snowAtTile(def, bd.y0) : 0;
      if (snB > 0.3) { day = snowRoof(day, opt.roofH + 4, snB, bd.x0); night = night === day ? day : snowRoof(night, opt.roofH + 4, snB, bd.x0); }
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
        if (gh(k, bd.x0, 5) % 3 === 0) { const t = snowy ? gsprite("stone" + (k % 2), () => sprStone(k % 2)) : natPick(def.pave ? "peb" : "rtuft", gh(k, bd.x0, 6)); hi(t, wx + 2, baseY + 2 - t.height / WZ, baseY + 2); }
      }
      // a worn track from the door down to the road
      if (door) {
        const dxp = bd.x0 * GT + opt.door + 2, dyp = (door[1] + 1) * GT;
        let ey = dyp; for (let k = 1; k < 5; k++) if (isRoad(door[0], door[1] + k)) { ey = (door[1] + k) * GT + 4; break; }
        footTrack(b, [[dxp, dyp - 4], [dxp + (gh(bd.x0, 3) % 7) - 3, (dyp + ey) / 2], [dxp + 3, ey + 4]], 9, bd.x0);
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
        const sealed = (def.warps || []).some((wp) => wp.x === tx && wp.y === ty && (wp.to === "caveS" || wp.sealed)) || (def.warps || []).some((wp) => wp.x === tx && wp.y === ty + 1 && wp.sealed);
        const walled = (def.warps || []).some((wp) => wp.x === tx && wp.y === ty + 1 && wp.sealed);
        const vault = (def.warps || []).some((wp) => wp.x === tx && wp.y === ty + 1 && wp.vault);
        const img = vault ? gsprite("vaultdoor", () => sprVaultDoor()) : gsprite("cavemouth" + (sealed ? 1 : 0) + (walled ? "w" : ""), () => sprCaveMouth(sealed, walled));
        const ox = tx * GT + GT - img.width / 2, oy = (ty + 1) * GT - img.height + 2;
        hi(img, ox / WZ, oy / WZ, ty * TILE + 1);
      } else if (c === "T" && def.south && curseAtTile(def, tx, ty) > 0.64 && (curseAtTile(def, tx, ty) > 0.8 || gh(tx, ty, 12) % 3)) {   // the curse's own trees: twisted, faced, webbed
        const name = CURSE_TREES[gh(tx, ty, 11) % CURSE_TREES.length], img = gsprite("ctree_" + name, () => sprCurse("trees", name));
        const jx = (gh(tx, ty, 2) % 9) - 4, footX = tx * GT + 16 + jx, footY = ty * GT + 28 + (gh(tx, ty, 4) % 3) - 1;
        castShadow(b, img, footX - img.width / 2, footY - img.height, 7, 3, 0.12);
        rootPool(b, footX, footY - 2, Math.max(9, Math.round(img.width * 0.3)), 5, 0.5);
        hi(img, (footX - img.width / 2) / WZ, (footY - img.height) / WZ, ty * TILE + 14 + (jx & 1));
      } else if (c === "k") {   // a growth of the curse, too thick to pass
        const name = CURSE_BIG[gh(tx, ty, 13) % CURSE_BIG.length], img = gsprite("cbig_" + name, () => sprCurse("big", name));
        const footX = tx * GT + 16 + (gh(tx, ty, 2) % 7) - 3, footY = ty * GT + 30;
        castShadow(b, img, footX - img.width / 2, footY - img.height, 6, 3, 0.18);
        rootPool(b, footX, footY - 3, Math.max(10, Math.round(img.width * 0.34)), 6, 0.45);
        hi(img, (footX - img.width / 2) / WZ, (footY - img.height) / WZ, ty * TILE + 15);
      } else if (c === "T") {
        const sn = snowAtTile(def, ty);
        const cu = def.south ? curseAtTile(def, tx, ty) : 0;
        const base = def.pines ? (r % 10 < 8 ? "pine" : "dead") : def.south ? (cu > 0.36 ? (r % 10 < 8 ? "dead" : "pine") : r % 10 < 6 ? "leafy" : r % 10 < 9 ? "pine" : "dead") : def.terrain === "rock" ? "dead" : sn > 0.5 ? (r % 10 < 7 ? "pine" : "dead") : sn > 0.1 ? (r % 10 < 4 ? "pine" : r % 10 < 6 ? "leafy" : "dead") : r % 10 < 5 ? "pine" : r % 10 < 8 ? "leafy" : "dead";
        const kind = sn > 0.3 && base !== "leafy" ? "snow" + base : base;
        const { img } = pickTree(kind, gh(tx, ty, 11));
        // the trunk's foot sits on the tile's lower part; trees shift sideways and a little up or down, never off the ground
        const jx = (gh(tx, ty, 2) % 11) - 5, jy = (gh(tx, ty, 4) % 5) - 2, footX = tx * GT + 16 + jx, footY = ty * GT + 27 + jy;
        const ox2 = footX - img.width / 2, oy = footY - img.height;
        castShadow(b, img, ox2, oy, 9, 4, 0.18);
        rootPool(b, footX + 1, footY - 1, Math.max(9, Math.round(img.width * 0.26)), 5, 0.55);
        hi(img, ox2 / WZ, oy / WZ, ty * TILE + 14 + (jx & 1), kind.startsWith("snow") ? { nocap: true } : null);
        const open = at(tx, ty + 1) !== "T" && at(tx, ty + 1) !== null;
        if (open && gh(tx, ty, 6) % 3 !== 0) {   // undergrowth where the trees give way, so the edge of a wood is ragged rather than ruled
          const bimg = def.terrain === "rock" ? natPick("scrub", gh(tx, ty, 7)) : natPick("bushSmall", gh(tx, ty, 7)), bx = tx * GT + 16 - bimg.width / 2 + (gh(tx, ty, 9) % 15) - 7, by = ty * GT + 33 - bimg.height;
          castShadow(b, bimg, bx, by, 4, 3, 0.28); hi(bimg, bx / WZ, by / WZ, ty * TILE + 15.5);
        }
        // grass and weeds about the roots, in front of and beside the trunk, so the tree grows out of the ground
        for (let k = 0; k < 3; k++) if (k < 2 || open) {
          const wx = footX / WZ - 9 + (gh(tx, ty, 8 + k) % 16), wy = footY / WZ - 2 + (k === 2 ? 3 : 0);
          if (!def.terrain && !snowy && (r + k) % 2) { const t = natPick("tuft", gh(tx, ty, 18 + k)); hi(t, wx - 2, wy + 2 - t.height / WZ, footY / WZ + 0.3 + k * 0.01); }
          else { const wv = (r + k) % 3; hi(gsprite("weed" + wv, () => sprWeed(wv)), wx, wy - 3, footY / WZ + 0.3 + k * 0.01); }
        }
      } else if (c === "b") {
        // bushes in a row (hedges, field edges) step out of line: each sits a little high or low, left or right, big or small
        const rowy = at(tx - 1, ty) === "b" || at(tx + 1, ty) === "b", jy = rowy ? (gh(tx, ty, 23) % 11) - 6 : (gh(tx, ty, 23) % 5) - 2;
        const img = def.terrain === "rock" ? natPick("scrub", gh(tx, ty, 21)) : natPick(rowy && gh(tx, ty, 24) % 3 === 0 ? "bushSmall" : "bush", gh(tx, ty, 21)), ox = Math.round(tx * GT + 16 - img.width / 2 + (gh(tx, ty, 22) % 9) - 4), oy = ty * GT + 32 + jy - img.height;
        castShadow(b, img, ox, oy, 5, 3, 0.3); hi(img, ox / WZ, oy / WZ, ty * TILE + 15 + jy / WZ);
      } else if (c === "r" && def.graveyard && tx >= def.graveyard.x0 && tx <= def.graveyard.x1 && ty >= def.graveyard.y0 && ty <= def.graveyard.y1) {
        const img = gsprite("grave" + (r % 3), () => sprHeadstone(r % 3)), ox = tx * GT + 6, oy = ty * GT + 22 - img.height;
        b.ell(tx * GT + 4, ty * GT + 18, tx * GT + 27, ty * GT + 31, GP.m1); b.ell(tx * GT + 6, ty * GT + 20, tx * GT + 25, ty * GT + 29, "#52432f");   // the mound
        castShadow(b, img, ox, oy, 4, 2, 0.35); hi(img, ox / WZ, oy / WZ, ty * TILE + 11);
      } else if (c === "r") {
        const bare = def.terrain === "rock" || def.terrain === "cave" || !!def.pave;
        const img = natPick(bare ? "rockD" : "rockG", gh(tx, ty, 141)), ox = Math.round(tx * GT + 16 - img.width / 2 + (gh(tx, ty, 143) % 7) - 3), oy = ty * GT + 32 - img.height;
        castShadow(b, img, ox, oy, 4, 3, 0.3); hi(img, ox / WZ, oy / WZ, ty * TILE + 15);
        if (!bare && gh(tx, ty, 142) % 3 === 0) { const t = natPick("rtuft", gh(tx, ty, 144)); hi(t, tx * TILE + (gh(tx, ty, 145) % 2 ? -3 : 12), ty * TILE + 15 - t.height / WZ, ty * TILE + 15.5); }
      } else if (c === "S") {
        const img = gsprite("sign", sprSign), ox = tx * GT + 1, oy = ty * GT + 30 - img.height;
        castShadow(b, img, ox, oy, 5, 3, 0.35); hi(img, ox / WZ, oy / WZ, ty * TILE + 15);
      } else if (c === "q") {   // the quarantine line: sharpened stakes, rope strung between, rags tied on so it shows at night
        const up = at(tx, ty - 1) === "q", dn = at(tx, ty + 1) === "q";
        const post = ty % 3 === 0 || !up || !dn, img = gsprite(`qstake${r % 3}${up ? 1 : 0}${dn ? 1 : 0}${post ? 1 : 0}`, () => sprStake(r % 3, up, dn, post)), ox = tx * GT + 16 - img.width / 2, oy = ty * GT + 30 - img.height;
        castShadow(b, img, ox, oy, 4, 2, 0.3); hi(img, ox / WZ, oy / WZ, ty * TILE + 15);
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
      } else if (c === "g") {
        const img = gsprite("gate_shut", () => sprGate(false)), ox = tx * GT - 4, oy = ty * GT + 34 - img.height;
        castShadow(b, img, ox, oy, 6, 4, 0.38); hi(img, ox / WZ, oy / WZ, ty * TILE + 15);
      } else if (c === "G") {   // an open gate: the leaves stand back against the posts, and the road runs between
        const lower = at(tx, ty - 1) === "G" || at(tx, ty - 1) === "g", pair = lower || at(tx, ty + 1) === "G";
        const img = gsprite("gate_open" + (lower ? 1 : 0), () => sprGate(true, lower)), ox = tx * GT - 4, oy = pair ? (lower ? ty * GT + 4 : ty * GT - 34) : ty * GT + 32 - img.height;
        castShadow(b, img, ox, oy, 6, 4, 0.38); hi(img, ox / WZ, oy / WZ, (oy + img.height) / WZ - 1);
      }
    }
    for (const pl of pillarList(def)) {
      const img = gsprite("pillar", sprPillar), px = pl.x * WZ - img.width / 2, py = pl.base * WZ + 6 - img.height;
      pillarGround(b, pl.x * WZ, pl.base * WZ - 4);
      castShadow(b, img, px, py, 14, 6, 0.3);
      hi(img, px / WZ, py / WZ, pl.base - 2);
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
            const img = natPick("rockD", r >>> 4), ox = tx * GT + (r % 8), oy = ty * GT + 28 - img.height;
            castShadow(b, img, ox, oy, 4, 3, 0.3); hi(img, ox / WZ, oy / WZ, ty * TILE + 13);
          }
          continue;
        }
        if (c !== "." && c !== "," && c !== "*") continue;
        if (bakeGrimMap.RF(tx * GT + 16, ty * GT + 16) > 0.3 || (def.warps || []).some((wp) => Math.abs(wp.x - tx) < 2 && Math.abs(wp.y - ty) < 3)) continue;
        const up = isC(tx, ty - 1), side = isC(tx - 1, ty) || isC(tx + 1, ty);
        if ((up || side) && r % 3 === 0) {
          const img = cave ? gsprite("rubble2_" + (r % 4) + "c", () => sprRubble2(r % 4, cave)) : natImg(["stone4_d", "peb1", "stone5_d", "peb2", "stone3_d", "peb3"][(r >>> 3) % 6]);
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
      const grassy = !def.terrain && !snowy;
      if (k < 4) { if (grassy && k % 2) { const t = natPick(k === 3 ? "scrub" : "tuft", r >>> 6); hi(t, x, y + 1 - t.height / WZ, y + 1); } else hi(gsprite("weed" + (k % 3), () => sprWeed(k % 3)), x, y - 6, y + 1); }
      else if (k < 6) { const t = snowy ? gsprite("stone" + (k % 2), () => sprStone(k % 2)) : grassy ? natPick(k === 4 ? "rtuft" : "tuft", r >>> 6) : natPick(def.terrain === "cave" ? "peb" : k === 4 ? "peb" : "rtuft", r >>> 6); hi(t, x, y + 1 - t.height / WZ, y + 1); }
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
    const pickable = (p.p === "herbpatch" || p.p === "bloom") && !!p.id;
    if (!d.wall && p.p !== "straw" && !pickable && !p.goneFlag) {
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
    if (pickable) entry.prop = { p: p.p, id: p.id };
    if (p.goneFlag) entry.prop = { p: p.p, id: p.id, goneFlag: p.goneFlag };
    if (p.p === "chest" && p.id) { entry.prop = { p: "chest", id: p.id }; entry.open = [img, sc(gsprite("p_chest_o1", () => make(1)), "p_chest_o1"), sc(gsprite("p_chest_o2", () => make(2)), "p_chest_o2")]; }
    talls.push(entry);
  }
  if (def.outside && def.snowY0 !== undefined) snowGround(b, def, w, h);
  if (def.outside && def.curse) {
    curseGround(b, def, w, h);
    /* bones, graves, stalks and pustules strewn over cursed ground; none on roads, none blocking a way through */
    for (let ty = 1; ty < h - 1; ty++) for (let tx = 1; tx < w - 1; tx++) {
      const c = cells[ty][tx]; if (c !== "." && c !== "," && c !== "*") continue;
      const a = curseAtTile(def, tx, ty), r = gh(tx, ty, 707); if (a < 0.34 || (r % 1000) / 1000 > (a - 0.32) * 0.2) continue;
      if (bakeGrimMap.RF(tx * GT + 16, ty * GT + 16) > 0.25 || (def.warps || []).some((wp) => Math.abs(wp.x - tx) < 2 && Math.abs(wp.y - ty) < 2)) continue;
      const list = a > 0.62 && r % 3 ? CURSE_SMALL_DEEP : CURSE_SMALL_MID, name = list[(r >>> 3) % list.length], img = gsprite("csm_" + name, () => sprCurse("small", name));
      const footX = tx * GT + 6 + (r % 20), footY = ty * GT + 26 + ((r >>> 5) % 5);
      castShadow(b, img, footX - img.width / 2, footY - img.height, 4, 2, 0.14);
      talls.push({ hi: true, img, x: (footX - img.width / 2) / WZ, y: (footY - img.height) / WZ, sortY: footY / WZ });
    }
  }
  if (def.outside && (def.terrain === "cave" || def.cave) && typeof CAVE_ART !== "undefined") {
    /* crystals, mushrooms, bones and webs along the cave walls: on floor that touches rock, away from doors, props and warps; never solid */
    const set = CAVE_SETS[CAVE_THEME[id] || "mine"], taken = new Set((props || []).map((p) => `${p.x},${p.y}`));
    const nearC = (x, y) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => cells[y + dy] && cells[y + dy][x + dx] === "C");
    for (let ty = 1; ty < h - 1; ty++) for (let tx = 1; tx < w - 1; tx++) {
      const c = cells[ty][tx]; if (c !== "." && c !== "," && c !== "*") continue;
      const r = gh(tx, ty, 919); if (r % 5 !== 0 || !nearC(tx, ty) || taken.has(`${tx},${ty}`)) continue;
      if ((def.warps || []).some((wp) => Math.abs(wp.x - tx) < 3 && Math.abs(wp.y - ty) < 3)) continue;
      const [grp, name, glow] = set[(r >>> 3) % set.length], img = gsprite("cave_" + name, () => sprCave(grp, name));
      const footX = tx * GT + 16 + ((r >>> 7) % 9) - 4, footY = ty * GT + 24 + ((r >>> 11) % 5);
      castShadow(b, img, footX - img.width / 2, footY - img.height, 4, 2, 0.16);
      talls.push({ hi: true, img, x: (footX - img.width / 2) / WZ, y: (footY - img.height) / WZ, sortY: footY / WZ });
      if (glow) lightsOut.push({ x: footX / WZ, y: (footY - img.height / 2) / WZ, r: 22, c: grp === "glow" && name.startsWith("mush") ? "#9a7ac8" : "#7ab8c8", str: 0.45, flicker: false });
    }
  }
  if (def.fort || def.plains || def.south) fortWalls(b, def, cells, w, h, (img, x, y, sortY) => talls.push({ hi: true, img, x, y, sortY }));
  return { base: (() => { const c = b.canvas(); return c; })(), talls, lights: lightsOut, clear: bakeGrimMap.clear, flames: bakeGrimMap.flames };
}

/* ---------- the Fort's curtain wall, seen from the Outskirts ---------- */
/* Wall tiles are F and gate tiles H. A tile is wall-walk (grey flags under snow, a parapet along any open edge) unless
   it is one of the two lowest rows of its column of wall, which together make the face: slate-dark coursed stone
   under a crenellated top, arrow slits, frost in the joints and a drift of snow at the foot. Gates are dark arches with
   a portcullis down (shut) on a south face, and iron-strapped timber doors where they sit in the wall-walk. */
/* Fort Frostcrown's walls, and the town walls seen from the open plains (Ashford, Greywick). Away from the snow the
   white becomes moss and weathered stone, and the frost in the joints becomes dirt. */
function fortWalls(b, def, cells, w, h, hi) {
  const at = (x, y) => (y >= 0 && y < h && x >= 0 && x < w ? cells[y][x] : null), isF = (c) => c === "F" || c === "H";
  let any = false; for (let y = 0; y < h && !any; y++) if (cells[y].indexOf("F") >= 0 || cells[y].indexOf("H") >= 0) any = true;
  if (!any) return;
  const mix = (a, c, t) => [a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t, a[2] + (c[2] - a[2]) * t];
  let wy0 = h; for (let y = 0; y < h; y++) if (cells[y].indexOf("H") >= 0) { wy0 = y; break; }
  const snowy = !!def.fort || (typeof snowAtTile === "function" && snowAtTile(def, wy0) > 0.35);
  const SL = snowy ? [[46, 48, 58], [56, 58, 68], [66, 68, 78], [38, 38, 46]] : [[62, 60, 60], [74, 72, 70], [86, 84, 80], [46, 44, 46]], MORT = snowy ? [28, 28, 34] : [36, 34, 32];
  const SNOW = snowy ? [214, 218, 228] : [70, 82, 52], FLAG = snowy ? [[88, 86, 92], [98, 96, 102], [78, 76, 84]] : [[92, 88, 84], [102, 98, 92], [80, 76, 72]];
  const RIME = snowy ? [150, 154, 166] : [96, 94, 88], FROST = snowy ? [150, 156, 170] : [40, 46, 30], LIGHT = snowy ? [190, 194, 204] : [96, 106, 70], LIGHT2 = snowy ? [180, 184, 194] : [98, 96, 92], DRIFT = snowy ? [196, 200, 212] : [58, 66, 42];
  const put = (x, y, c) => b.set(x, y, c);
  // runs of gate tiles, so an arch spans the whole gate
  const gateSpan = (tx, ty) => { let a = tx, z = tx; while (at(a - 1, ty) === "H") a--; while (at(z + 1, ty) === "H") z++; return [a, z]; };
  for (let ty = 0; ty < h; ty++) for (let tx = 0; tx < w; tx++) {
    const c = at(tx, ty); if (!isF(c)) continue;
    const below1 = isF(at(tx, ty + 1)), below2 = isF(at(tx, ty + 2));
    const role = !below1 ? "lo" : !below2 ? "hi" : "walk", X0 = tx * GT, Y0 = ty * GT;
    if (role === "walk") {
      for (let py = 0; py < GT; py++) for (let px = 0; px < GT; px++) {
        const wx = X0 + px, wy = Y0 + py, row = Math.floor(wy / 12), sx = Math.floor((wx + (row % 2) * 9) / 18);
        let col = FLAG[(sx * 7 + row * 3) % 3];
        if (wy % 12 === 0 || (wx + (row % 2) * 9) % 18 === 0) col = [60, 58, 66];
        col = mix(col, [50, 48, 54], gnoise(wx, wy, 6, 611) * 0.35);
        const sn = gnoise(wx, wy, 10, 612) * 0.7 + gnoise(wx, wy, 3, 613) * 0.3;
        col = mix(col, RIME, 0.18);                                                                         // a rime over everything (a weathering, off the snow)
        const edge = Math.min(py, GT - 1 - py) < 5 || Math.min(px, GT - 1 - px) < 5;                           // snow banks against the parapets and in the joints
        if (sn > (edge ? 0.5 : 0.66)) col = mix(col, SNOW, Math.min(0.85, (sn - (edge ? 0.5 : 0.66)) * 4));
        put(wx, wy, col);
      }
      if (c === "H") {   // timber doors set in the wall-walk: the north gate, seen from outside
        const [a, z] = gateSpan(tx, ty), gx0 = a * GT + 4, gx1 = (z + 1) * GT - 5;
        for (let py = 2; py < GT - 2; py++) for (let px = 0; px < GT; px++) {
          const wx = X0 + px; if (wx < gx0 || wx > gx1) continue;
          let col = (wx - gx0) % 8 < 1 ? [42, 30, 22] : [78 + ((wx >> 3) % 2) * 8, 58, 40];
          if ((Y0 + py) % 22 < 3) col = [58, 58, 66];
          if ((Y0 + py) % 22 === 1 && (wx - gx0) % 8 === 4) col = [120, 120, 128];
          put(wx, Y0 + py, mix(col, SNOW, gnoise(wx, Y0 + py, 4, 615) > 0.8 ? 0.6 : 0));
        }
      }
      // parapets: a low crenellated lip wherever the walk meets open ground on its left, right or above
      const lip = (horiz, x0, y0, len, out) => {
        for (let i = 0; i < len; i++) for (let k = 0; k < 6; k++) {
          const merl = (Math.floor(((horiz ? x0 : y0) + i) / 8) % 2) === 0, tall = merl ? 6 : 3;
          if (k >= tall) continue;
          const x = horiz ? x0 + i : x0 + (out < 0 ? k : GT - 1 - k), y = horiz ? y0 + (out < 0 ? k : GT - 1 - k) : y0 + i;
          put(x, y, k === tall - 1 || (horiz ? false : false) ? (merl ? SNOW : LIGHT2) : k === 0 ? SL[3] : SL[1]);
        }
      };
      if (!isF(at(tx, ty - 1))) lip(true, X0, Y0, GT, -1);
      if (!isF(at(tx - 1, ty))) lip(false, X0, Y0, GT, -1);
      if (!isF(at(tx + 1, ty))) lip(false, X0, Y0, GT, 1);
      continue;
    }
    // the face: two tiles of coursed stone; "hi" carries the crenellations, "lo" the footing and drift
    const faceTop = role === "hi" ? Y0 : Y0 - GT;
    for (let py = 0; py < GT; py++) for (let px = 0; px < GT; px++) {
      const wx = X0 + px, wy = Y0 + py, fy = wy - faceTop, course = Math.floor(fy / 8), bx = Math.floor((wx + (course % 2) * 8) / 16);
      let col = SL[(bx * 5 + course * 3) % 3];
      if (fy % 8 === 7 || (wx + (course % 2) * 8) % 16 === 15) col = MORT;
      else if (fy % 8 === 0) col = mix(col, [86, 88, 98], 0.5);
      col = mix(col, [24, 22, 26], Math.max(0, gnoise(wx, wy * 0.3, 5, 621) - 0.55) * 1.4);            // soot and wet streaks run down
      if (col === MORT && gnoise(wx, wy, 4, 622) > 0.62) col = FROST;                                      // frost (or moss) in the joints
      if (role === "hi" && py < 9) {                                                                       // merlons and the gaps between
        const merl = (Math.floor(wx / 12) % 2) === 0;
        if (!merl) col = py < 7 ? [52, 50, 56] : SL[3];
        else if (py < 3) col = mix(SNOW, LIGHT, gnoise(wx, 0, 3, 623));
        else if (py === 3) col = SL[2];
      }
      if (role === "lo" && py > GT - 7) { col = mix(col, [26, 24, 28], 0.45); const dr = gnoise(wx, 0, 9, 624); if (py > GT - 3 - dr * 6) col = mix(SNOW, DRIFT, gnoise(wx, wy, 3, 625)); }
      put(wx, wy, col);
    }
    // an arrow slit in every fourth face tile
    if (role === "hi" && c === "F" && (tx * 7 + 3) % 4 === 0 && isF(at(tx - 1, ty)) && isF(at(tx + 1, ty))) {
      for (let py = 14; py < GT + 6; py++) for (let px = 14; px < 18; px++) put(X0 + px, Y0 + py, px === 14 ? [20, 18, 22] : [10, 9, 12]);
      for (let px = 12; px < 20; px++) put(X0 + px, Y0 + 22, [10, 9, 12]);
    }
    if (c === "H") {   // a gate in the face: an arch, black inside, with the portcullis down
      const [a, z] = gateSpan(tx, ty), gx0 = a * GT + 5, gx1 = (z + 1) * GT - 6, mid = (gx0 + gx1) / 2, rad = (gx1 - gx0) / 2;
      for (let py = 0; py < GT; py++) for (let px = 0; px < GT; px++) {
        const wx = X0 + px, wy = Y0 + py, fy = wy - faceTop; if (wx < gx0 - 4 || wx > gx1 + 4) continue;
        const archTop = 14 + rad - Math.sqrt(Math.max(0, rad * rad - (wx - mid) * (wx - mid))) * 0.55;
        if (fy < archTop - 4) continue;
        if (wx < gx0 || wx > gx1 || fy < archTop) { put(wx, wy, (Math.floor(wx / 6) + Math.floor(fy / 5)) % 2 ? [92, 94, 104] : [74, 76, 86]); continue; }   // voussoirs
        let col = [12, 11, 14];
        const raised = fy < archTop + 12;                                                                   // the portcullis, wound up into the arch
        if (raised && ((wx - gx0) % 7 < 2 || (fy % 9) < 2)) col = (wx - gx0) % 7 === 0 || fy % 9 === 0 ? [96, 96, 104] : [58, 58, 66];
        if (raised && fy >= archTop + 10) col = [40, 40, 46];
        if (!raised && fy > archTop + 18) col = mix([12, 11, 14], [70, 68, 74], Math.min(1, (fy - archTop - 18) / 30));   // the street beyond, faintly
        if (fy > GT * 2 - 3) col = mix(SNOW, LIGHT, gnoise(wx, wy, 3, 626));
        put(wx, wy, col);
      }
    }
  }
  /* the walls stand in the ground: a dark wet foot where the face meets the earth, with grit and weeds banked against
     it; the low sun throws each wall's shadow out to the east, and the ground under the far side is dim */
  const dark = (x, y, a) => b.blend(x, y, [8, 6, 14], a);
  for (let ty = 0; ty < h; ty++) for (let tx = 0; tx < w; tx++) {
    const c = at(tx, ty); if (isF(c) || c === null) continue;
    const X0 = tx * GT, Y0 = ty * GT;
    if (isF(at(tx, ty - 1)) && at(tx, ty - 1) !== "H") {   // below a face
      for (let px = 0; px < GT; px++) {
        const wx = X0 + px, depth = 9 + Math.round(gnoise(wx, Y0, 7, 631) * 6);
        for (let py = 0; py < depth; py++) dark(wx, Y0 + py, 0.55 * (1 - py / depth) ** 1.4);
        const grit = Math.round(gnoise(wx, Y0, 5, 632) * 5);
        for (let py = 0; py < grit; py++) if (gnoise(wx, Y0 + py, 3, 633) > 0.35) put(wx, Y0 + py, snowy ? [150, 154, 166] : gnoise(wx, py, 4, 634) > 0.5 ? [62, 50, 38] : [48, 40, 32]);
      }
      if (hi && !snowy) for (let k = 0; k < 3; k++) if (gh(tx, ty, 640 + k) % 3) {
        const t = natPick(k === 1 ? "rtuft" : "tuft", gh(tx, ty, 650 + k)), x = (X0 + 3 + k * 10 + (gh(tx, ty, 660 + k) % 5)) / WZ, y = (Y0 + 4) / WZ;
        hi(t, x, y - t.height / WZ, y + 0.2);
      }
    }
    if (isF(at(tx - 1, ty))) for (let py = 0; py < GT; py++) {   // a wall to the west: its east face, end-on, then its shadow
      const wy = Y0 + py, fw = 6, course = Math.floor(wy / 8);
      for (let px = 0; px < fw; px++) put(X0 + px, wy, wy % 8 === 7 || (px === 3 && course % 2) ? MORT : px === 0 ? SL[2] : mix(SL[3], [20, 18, 22], px / fw * 0.5));
      const wd = 12 + Math.round(gnoise(X0, wy, 9, 635) * 6); for (let px = fw; px < fw + wd; px++) dark(X0 + px, wy, 0.42 * (1 - (px - fw) / wd) ** 1.3);
    }
    if (isF(at(tx + 1, ty))) for (let py = 0; py < GT; py++) {   // a wall to the east: its west face catches the light
      const wy = Y0 + py; for (let px = 0; px < 5; px++) put(X0 + GT - 1 - px, wy, wy % 8 === 7 ? MORT : px === 4 ? SL[3] : mix(SL[1], SL[2], px / 5));
      for (let px = 5; px < 10; px++) dark(X0 + GT - 1 - px, wy, 0.28 * (1 - (px - 5) / 5));
    }
    if (isF(at(tx, ty + 1))) for (let px = 0; px < GT; px++) for (let py = 0; py < 4; py++) dark(X0 + px, Y0 + GT - 1 - py, 0.26 * (1 - py / 4));
  }
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
/* Shadows laid on the ground rather than pasted beside a thing: the sprite's silhouette is projected flat along the
   ground from its foot (low sun in the north-west, so shadows run right and a little toward the viewer), softened,
   and fading as it leaves the foot; under the foot itself a dark contact pool, so everything sits in the ground.
   The projected mask is cached per sprite. */
const SHADOW_MASKS = new WeakMap();
function shadowMask(img) {
  let m = SHADOW_MASKS.get(img); if (m) return m;
  const W = img.width, H = img.height, src = img.getContext("2d").getImageData(0, 0, W, H).data;
  let fy = -1, x0 = W, x1 = -1;
  for (let j = H - 1; j >= 0 && fy < 0; j--) for (let i = 0; i < W; i++) if (src[(j * W + i) * 4 + 3] > 40) { fy = j; break; }
  if (fy < 0) { m = { none: true }; SHADOW_MASKS.set(img, m); return m; }
  const footBand = Math.max(2, Math.round((fy + 1) * 0.12));
  for (let j = fy - footBand; j <= fy; j++) for (let i = 0; i < W; i++) if (j >= 0 && src[(j * W + i) * 4 + 3] > 40) { x0 = Math.min(x0, i); x1 = Math.max(x1, i); }
  const SK = 0.42, SQ = 0.16, R = 2, pad = 6;
  const MW = Math.ceil(W + fy * SK) + pad * 2, MH = Math.ceil(fy * SQ) + pad * 2 + 4;
  let a = new Float32Array(MW * MH);
  for (let j = 0; j <= fy; j++) {
    const h = fy - j, wgt = 1 - (h / (fy + 1)) * 0.55, oy = Math.round(h * SQ) + pad, ox = h * SK + pad;
    for (let i = 0; i < W; i++) {
      if (src[(j * W + i) * 4 + 3] < 60) continue;
      const k = oy * MW + Math.round(i + ox); if (wgt > a[k]) a[k] = wgt;
    }
  }
  /* fill the gaps the squash leaves, then soften: two box passes each way */
  for (let y = 1; y < MH - 1; y++) for (let x = 0; x < MW; x++) { const k = y * MW + x; if (!a[k]) { const v = Math.min(a[k - MW], a[k + MW]); if (v) a[k] = v; } }
  const tmp = new Float32Array(MW * MH);
  for (let pass = 0; pass < 2; pass++) {
    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) { let s = 0; for (let d = -R; d <= R; d++) { const xx = x + d; if (xx >= 0 && xx < MW) s += a[y * MW + xx]; } tmp[y * MW + x] = s / (2 * R + 1); }
    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) { let s = 0; for (let d = -R; d <= R; d++) { const yy = y + d; if (yy >= 0 && yy < MH) s += tmp[yy * MW + x]; } a[y * MW + x] = s / (2 * R + 1); }
  }
  m = { a, MW, MH, pad, fy, fx0: x0, fx1: x1 };
  SHADOW_MASKS.set(img, m); return m;
}
function contactPool(b, cx, cy, rx, ry, a) {   // soft occlusion where a thing meets the ground: darkest at the middle, gone at the rim
  const d = b.d, W = b.w;
  for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
    if (x < 0 || y < 0 || x >= W || y >= b.h) continue;
    const q = ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2; if (q >= 1) continue;
    const t = a * (1 - q) * (1 - q), i = (y * W + x) * 4;
    d[i] += (8 - d[i]) * t; d[i + 1] += (6 - d[i + 1]) * t; d[i + 2] += (14 - d[i + 2]) * t;
  }
}
function castShadow(b, img, x, y, dx, dy, a) {
  const m = shadowMask(img); if (m.none) return;
  const d = b.d, W = b.w, H = b.h, k = Math.min(0.62, a * 1.25), ox = Math.round(x) - m.pad, oy = Math.round(y) + m.fy - m.pad;
  for (let j = 0; j < m.MH; j++) {
    const yy = oy + j; if (yy < 0 || yy >= H) continue;
    for (let i = 0; i < m.MW; i++) {
      const v = m.a[j * m.MW + i]; if (v < 0.02) continue;
      const xx = ox + i; if (xx < 0 || xx >= W) continue;
      const t = v * k, q = (yy * W + xx) * 4;
      d[q] += (8 - d[q]) * t; d[q + 1] += (6 - d[q + 1]) * t; d[q + 2] += (14 - d[q + 2]) * t;
    }
  }
  const fw = Math.max(4, m.fx1 - m.fx0 + 1);
  contactPool(b, Math.round(x) + (m.fx0 + m.fx1 + 1) / 2, Math.round(y) + m.fy - 0.5, fw * 0.62 + 2, Math.max(3, Math.min(7, fw * 0.22)), Math.min(0.6, 0.3 + a));
}
function contactBand(b, x0, x1, y, depth, a) { for (let k = 0; k < depth; k++) for (let x = x0; x < x1; x++) b.blend(x, y + k, [8, 6, 14], a * (1 - k / depth)); }
function mudPatch(b, cx, cy, rx, ry, seed) {
  const pts = [];
  for (let k = 0; k < 16; k++) { const a = (k / 16) * Math.PI * 2, r = 0.75 + (gh(k, seed) % 100) / 400; pts.push([cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]); }
  b.poly(pts, GP.m1); b.poly(pts.map(([x, y]) => [cx + (x - cx) * 0.6, cy + (y - cy) * 0.6]), GP.m0);
}
function footTrack(b, pts, w, seed) {   // a path worn by feet: bare earth down the middle, grass trodden thin and patchy at the sides
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  const segD = (px, py) => {   // distance to the path, and how far along it we are (0..1)
    let best = 1e9, along = 0, acc = 0, tot = 0;
    for (let s = 0; s + 1 < pts.length; s++) tot += Math.hypot(pts[s + 1][0] - pts[s][0], pts[s + 1][1] - pts[s][1]);
    for (let s = 0; s + 1 < pts.length; s++) {
      const [ax, ay] = pts[s], [bx, by] = pts[s + 1], dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1, L = Math.sqrt(L2);
      const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / L2)), d = Math.hypot(px - ax - dx * t, py - ay - dy * t);
      if (d < best) { best = d; along = (acc + t * L) / (tot || 1); }
      acc += L;
    }
    return [best, along];
  };
  const pad = w * 1.6;
  for (let y = Math.floor(y0 - pad); y <= y1 + pad; y++) for (let x = Math.floor(x0 - pad); x <= x1 + pad; x++) {
    const [d, along] = segD(x, y), ww = w * (0.85 + along * 0.45) * (0.85 + gnoise(x, y, 11, seed + 3) * 0.3);   // wider where it meets the road
    const n = gnoise(x, y, 4, seed + 5);
    if (d < ww * 0.5) b.set(x, y, n > 0.62 ? GP.m2 : n < 0.25 ? GP.m0 : GP.m1);
    else if (d < ww * 0.85 && n > 0.35) b.set(x, y, n > 0.7 ? GP.gmud : GP.m0);
    else if (d < ww * 1.25 && gnoise(x, y, 3, seed + 7) > 0.62) b.set(x, y, gnoise(x, y, 5, seed + 9) > 0.5 ? GP.dead : GP.gmud);
  }
}

/* ---------- snow on the northern plains ---------- */
/* The ground: frost in pale rime patches, then drifts with ground showing between, then a full cover with only
   the trampled road and dark stones breaking it. Water freezes to grey ice in the snow. */
function snowGround(b, def, w, h) {
  const d = b.d, W = b.w, RF = bakeGrimMap.RF, WF = bakeGrimMap.WF, nRow = new Float32Array((W >> 1) + 1), rRow = new Float32Array((W >> 1) + 1), wRow = new Float32Array((W >> 1) + 1);
  for (let ty = 0; ty < h; ty++) {
    const a0 = snowAtTile(def, ty); if (a0 <= 0.01) continue;
    for (let py = 0; py < GT; py++) {
      const wy = ty * GT + py, a = snowAtTile(def, ty + py / GT), cliffRow = bakeGrimMap.cells ? bakeGrimMap.cells[ty] : null;
      if (!(py & 1)) for (let k = 0; k <= W >> 1; k++) { nRow[k] = gnoise(k * 2, wy + def.snowY0 * GT, 26, 77) * 0.7 + gnoise(k * 2, wy + def.snowY0 * GT, 7, 78) * 0.3; rRow[k] = RF ? RF(k * 2, wy) : 0; wRow[k] = WF ? WF(k * 2, wy) : 0; }   // drifts, road and water, worked out at every second pixel
      for (let wx = 0; wx < W; wx++) {
        const i = (wy * W + wx) * 4; if (!d[i + 3]) continue;
        const n = nRow[wx >> 1];
        const lum = (d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11) / 255;
        const road = rRow[wx >> 1], water = wRow[wx >> 1];
        let k;
        if (water > 0.55 && a > 0.4) { const ice = [116 + n * 30, 128 + n * 30, 142 + n * 28]; d[i] += (ice[0] - d[i]) * 0.85; d[i + 1] += (ice[1] - d[i + 1]) * 0.85; d[i + 2] += (ice[2] - d[i + 2]) * 0.85; if (gnoise(wx, wy, 5, 79) > 0.86) { d[i] = 186; d[i + 1] = 196; d[i + 2] = 206; } continue; }
        {   // one rule for every band, so the bands meet without a seam: patches where the noise runs high, more of them and whiter as the snow deepens
          const t = 0.95 - a, cover = Math.max(0, Math.min(1, (n - t) / 0.05)), full = 0.3 + Math.max(0, Math.min(1, (a - 0.15) / 0.5)) * 0.62;
          k = cover * full + (1 - cover) * a * 0.28;
        }
        if (road > 0.35) k *= a > 0.5 ? 0.55 : 0.4;                                                 // the road is trodden through
        if (cliffRow && (cliffRow[(wx / GT) | 0] === "C" || cliffRow[(wx / GT) | 0] === "O") && lum < 0.3) k *= 0.12;   // sheer rock faces hold no snow: only a rime
        const shade = 168 + lum * 70 + (n - 0.5) * 18, sn = [shade - 6, shade - 2, shade + 8];
        d[i] += (sn[0] - d[i]) * k; d[i + 1] += (sn[1] - d[i + 1]) * k; d[i + 2] += (sn[2] - d[i + 2]) * k;
      }
    }
  }
}
/* A sprite with snow lying on every surface that faces up: the top pixel of each run turns white, and a second
   below it in deep snow. Cached per sprite and depth. */
/* snow lying on a roof: the slope goes white, thinner along the tile courses and where the chimney's warmth melts it,
   with a ragged overhang at the eaves */
function snowRoof(img, roofY, sn, seed) {
  const c = makeCanvas(img.width, img.height), x = c.getContext("2d"); x.drawImage(img, 0, 0);
  const id = x.getImageData(0, 0, c.width, c.height), d = id.data, W = c.width;
  for (let py = 0; py < Math.min(c.height, roofY); py++) for (let px = 0; px < W; px++) {
    const i = (py * W + px) * 4; if (d[i + 3] < 40) continue;
    const lum = (d[i] + d[i + 1] + d[i + 2]) / 3, n = gnoise(px + seed * 13, py, 5, 811);
    let k = Math.min(0.9, sn * 0.95) * (n > 0.28 ? 1 : 0.35);
    if (py > roofY - 6) k *= 0.55 + gnoise(px, seed, 3, 812) * 0.5;      // the eave line, ragged
    const v = 196 + lum * 0.12 + (n - 0.5) * 14;
    d[i] += (v - 6 - d[i]) * k; d[i + 1] += (v - 2 - d[i + 1]) * k; d[i + 2] += (v + 8 - d[i + 2]) * k;
  }
  x.putImageData(id, 0, 0); return c;
}
const SNOWCAP = new WeakMap();
function snowCapped(img, sn) {
  const lv = sn > 0.7 ? 3 : sn > 0.4 ? 2 : 1;
  let m = SNOWCAP.get(img); if (!m) { m = {}; SNOWCAP.set(img, m); }
  if (m[lv]) return m[lv];
  const c = makeCanvas(img.width, img.height), x = c.getContext("2d"); x.drawImage(img, 0, 0);
  const id = x.getImageData(0, 0, c.width, c.height), d = id.data, Wd = c.width;
  const op = (px, py) => py >= 0 && d[(py * Wd + px) * 4 + 3] > 40;
  const deep = lv === 3 ? 3 : lv === 2 ? 2 : 1;
  for (let py = 0; py < c.height; py++) for (let px = 0; px < Wd; px++) {
    if (!op(px, py) || op(px, py - 1)) continue;
    if (lv === 1 && (px * 7 + py * 3) % 3) continue;                                              // frost: a scatter of rime, not a cap
    for (let k = 0; k < deep; k++) { if (!op(px, py + k)) break; const i = ((py + k) * Wd + px) * 4, v = k ? 200 : 228; d[i] = v - 8; d[i + 1] = v - 4; d[i + 2] = v + 6; }
  }
  x.putImageData(id, 0, 0);
  return (m[lv] = c);
}
