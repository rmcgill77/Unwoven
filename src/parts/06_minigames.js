
/* ------------------------------------------------------------------ */
/* Tiny 3x5 pixel font for minigame readouts                           */
/* ------------------------------------------------------------------ */
const FONT3 = {
  "0": "111101101101111", "1": "010110010010111", "2": "111001111100111", "3": "111001111001111", "4": "101101111001001",
  "5": "111100111001111", "6": "111100111101111", "7": "111001010010010", "8": "111101111101111", "9": "111101111001111",
  A: "010101111101101", B: "110101110101110", C: "011100100100011", D: "110101101101110", E: "111100110100111",
  F: "111100110100100", G: "011100101101011", H: "101101111101101", I: "111010010010111", J: "001001001101010",
  K: "101101110101101", L: "100100100100111", M: "101111111101101", N: "110101101101101", O: "010101101101010",
  P: "110101110100100", Q: "010101101110011", R: "110101110101101", S: "011100010001110", T: "111010010010010",
  U: "101101101101111", V: "101101101101010", W: "101101111111101", X: "101101010101101", Y: "101101010010010",
  Z: "111001010100111", " ": "000000000000000", "/": "001001010100100", ":": "000010000010000", "!": "010010010000010",
  ".": "000000000000010", "+": "000010111010000", "-": "000000111000000", "%": "101001010100101",
};
function drawText(ctx, str, x, y, color, scale = 1, align = "left", shadow = PAL.ink) {
  const s = String(str).toUpperCase();
  const w = s.length * 4 * scale - scale;
  let ox = align === "center" ? Math.round(x - w / 2) : align === "right" ? x - w : x;
  const paint = (col, dx, dy) => {
    ctx.fillStyle = col;
    let cx = ox + dx;
    for (const ch of s) {
      const g = FONT3[ch] || FONT3[" "];
      for (let i = 0; i < 15; i++) if (g[i] === "1") ctx.fillRect(cx + (i % 3) * scale, y + dy + Math.floor(i / 3) * scale, scale, scale);
      cx += 4 * scale;
    }
  };
  if (shadow) paint(shadow, scale, scale);
  paint(color, 0, 0);
}
function rectP(ctx, x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }

const MG_W = 200, MG_H = 120;

function makeSparks() {
  const list = [];
  return {
    burst(x, y, n, cols, spd = 60) {
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4, sp = spd * (0.4 + Math.random());
        list.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.3 + Math.random() * 0.4, c: pick(cols) });
      }
    },
    update(dt) { for (const p of list) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 140 * dt; p.life -= dt; } for (let i = list.length - 1; i >= 0; i--) if (list[i].life <= 0) list.splice(i, 1); },
    draw(ctx) { for (const p of list) rectP(ctx, p.x, p.y, 1, 1, p.c); },
  };
}
function feedbackFor(q) { return q >= 1 ? "PERFECT" : q >= 0.7 ? "GOOD" : q > 0 ? "OK" : "MISS"; }
function feedbackColor(q) { return q >= 1 ? PAL.leyL : q >= 0.7 ? PAL.flowerY : q > 0 ? PAL.parch : PAL.flowerR; }

/* ------------------------------------------------------------------ */
/* Blacksmith: strike while the marker is in the hot zone              */
/* ------------------------------------------------------------------ */
function mgForge(level, art) {
  const strikes = 6;
  let i = 0, m = 0, dir = 1, speed = clamp(0.95 - level * 0.035, 0.6, 0.95);
  const hw = clamp(0.085 + level * 0.008, 0.085, 0.15), sweet = hw * 0.4;
  let c = 0.3 + Math.random() * 0.4, hammer = 0, fb = null, endT = 0;
  const res = [], sp = makeSparks();
  const g = {
    title: "Forge horseshoes", help: "Tap when the marker is in the hot zone. Six strikes.", keysHelp: "Space or E to strike",
    done: false, score: 0,
    press() {
      if (g.done || endT > 0 || hammer > 0) return;
      const d = Math.abs(m - c);
      const q = d <= sweet ? 1 : d <= hw ? 0.7 : d <= hw * 1.9 ? 0.35 : 0;
      res.push(q); fb = { q, t: 0.7 }; hammer = 0.16;
      sp.burst(100, 70, q > 0 ? 10 + q * 14 : 4, [PAL.fireL, PAL.ember, PAL.white], 50 + q * 40);
      i++;
      if (i >= strikes) endT = 0.9; else { c = 0.18 + Math.random() * 0.64; speed *= 1.1; }
    },
    down() { g.press(); }, move() {}, up() {}, key() {},
    update(dt) {
      if (g.done) return;
      if (endT > 0) { endT -= dt; if (endT <= 0) { g.done = true; g.score = res.reduce((a, b) => a + b, 0) / strikes; } }
      else { m += dir * speed * dt; if (m > 1) { m = 1; dir = -1; } if (m < 0) { m = 0; dir = 1; } }
      if (hammer > 0) hammer -= dt;
      if (fb) { fb.t -= dt; if (fb.t <= 0) fb = null; }
      sp.update(dt);
    },
    draw(ctx, t) {
      rectP(ctx, 0, 0, MG_W, MG_H, PAL.night);
      for (let k = 0; k < 6; k++) { ctx.globalAlpha = 0.07; rectP(ctx, 100 - 20 - k * 14, 96 - k * 6, 40 + k * 28, 30 + k * 6, PAL.ember); }
      ctx.globalAlpha = 1;
      rectP(ctx, 0, 100, MG_W, 20, PAL.shadow);
      drawText(ctx, `STRIKE ${Math.min(i + 1, strikes)}/${strikes}`, 8, 6, PAL.parch);
      // gauge
      const gx = 30, gy = 18, gw = 140;
      rectP(ctx, gx - 2, gy - 2, gw + 4, 12, PAL.ink);
      rectP(ctx, gx, gy, gw, 8, PAL.shadow);
      if (endT <= 0) {
        rectP(ctx, gx + (c - hw * 1.9) * gw, gy, hw * 3.8 * gw, 8, PAL.fireD);
        rectP(ctx, gx + (c - hw) * gw, gy, hw * 2 * gw, 8, PAL.ember);
        rectP(ctx, gx + (c - sweet) * gw, gy, sweet * 2 * gw, 8, PAL.fireL);
        rectP(ctx, gx + m * gw - 1, gy - 3, 3, 14, PAL.white);
      }
      // anvil
      const anvil = art.prop("anvil", 0);
      ctx.drawImage(anvil, 0, 0, 16, 16, 84, 66, 32, 32);
      // glowing bar bending into a horseshoe
      const bend = Math.min(1, i / strikes);
      const heat = res.length ? res.reduce((a, b) => a + b, 0) / res.length : 1;
      const col = bend < 1 ? (heat > 0.6 ? PAL.fireL : PAL.ember) : PAL.fireD;
      for (let k = -14; k <= 14; k++) {
        const x = 100 + k, y = 72 - Math.round(bend * 10 * (1 - (k * k) / 196));
        rectP(ctx, x, y, 1, 3, col); rectP(ctx, x, y, 1, 1, PAL.white);
      }
      // hammer
      const hy = hammer > 0 ? 50 + (0.16 - hammer) * 90 : 36;
      rectP(ctx, 108, hy - 22, 3, 22, PAL.woodL);
      rectP(ctx, 102, hy, 15, 7, PAL.metal); rectP(ctx, 102, hy, 15, 2, PAL.metalL);
      sp.draw(ctx);
      if (fb) drawText(ctx, feedbackFor(fb.q), 100, 40, feedbackColor(fb.q), 2, "center");
    },
  };
  return g;
}

/* ------------------------------------------------------------------ */
/* Clerk: memorise a line of Old Tongue glyphs and copy it              */
/* ------------------------------------------------------------------ */
const GLYPHS = [
  "0011100010001010000011000001100000101000100011100", "1000001010001000101000001000001010001000101000001",
  "0001000001110010111010011111001101001110100001000", "1111111100000110000011111111100000110000011111111",
  "0001000001010001000100111110010001001000100100010", "1110000101000010100001111111000010100001010000111",
  "0100010010001000101000001000001000001000001000001", "0011100000100011111110010000010000010000011111110",
];
function drawGlyph(ctx, idx, x, y, col, scale = 1) {
  const gstr = GLYPHS[idx];
  for (let i = 0; i < 49; i++) if (gstr[i] === "1") rectP(ctx, x + (i % 7) * scale, y + Math.floor(i / 7) * scale, scale, scale, col);
}
function mgCopy(level) {
  const rounds = level >= 5 ? [4, 5, 6] : [3, 4, 5];
  let r = 0, seq = [], entered = [], phase = "show", timer = 0, cursor = 0, fb = null;
  let correct = 0, total = 0;
  const newRound = () => {
    seq = []; entered = [];
    for (let k = 0; k < rounds[r]; k++) { let gl; do gl = (Math.random() * 8) | 0; while (gl === seq[k - 1]); seq.push(gl); }
    phase = "show"; timer = 1.2 + rounds[r] * 0.5 + level * 0.12;
  };
  newRound();
  const pal = (k) => ({ x: 28 + (k % 4) * 38, y: 70 + Math.floor(k / 4) * 24, w: 30, h: 20 });
  const choose = (k) => {
    if (phase !== "input") return;
    entered.push(k);
    if (entered.length === seq.length) {
      const ok = entered.filter((v, j) => v === seq[j]).length;
      correct += ok; total += seq.length;
      fb = { q: ok / seq.length, t: 0.9 }; phase = "feedback"; timer = 1.0;
    }
  };
  const g = {
    title: "Copy the ledger", help: "Memorise the line of glyphs. When it's covered, tap them out in the same order.", keysHelp: "Arrows to choose, Space or E to write",
    done: false, score: 0,
    press() { choose(cursor); },
    down(x, y) { for (let k = 0; k < 8; k++) { const p = pal(k); if (x >= p.x && x < p.x + p.w && y >= p.y && y < p.y + p.h) { cursor = k; choose(k); } } },
    move() {}, up() {},
    key(name) {
      if (name === "ArrowLeft") cursor = (cursor + 7) % 8;
      if (name === "ArrowRight") cursor = (cursor + 1) % 8;
      if (name === "ArrowUp" || name === "ArrowDown") cursor = (cursor + 4) % 8;
    },
    update(dt) {
      if (g.done) return;
      timer -= dt;
      if (phase === "show" && timer <= 0) phase = "input";
      if (phase === "feedback" && timer <= 0) {
        r++;
        if (r >= rounds.length) { g.done = true; g.score = total ? correct / total : 0; } else newRound();
      }
      if (fb) { fb.t -= dt; if (fb.t <= 0) fb = null; }
    },
    draw(ctx, t) {
      rectP(ctx, 0, 0, MG_W, MG_H, PAL.woodD);
      rectP(ctx, 14, 4, 172, 60, PAL.paper); rectP(ctx, 14, 4, 172, 2, PAL.white); rectP(ctx, 14, 62, 172, 2, PAL.parch);
      drawText(ctx, `LINE ${r + 1}/${rounds.length}`, 20, 8, PAL.wood, 1, "left", null);
      const n = seq.length, gw = 16, sx = 100 - (n * gw) / 2;
      for (let k = 0; k < n; k++) {
        if (phase === "show" || phase === "feedback") drawGlyph(ctx, seq[k], sx + k * gw + 2, 18, "#2a3060", 2 - (n > 5 ? 0 : 0));
        else { rectP(ctx, sx + k * gw + 2, 18, 13, 13, PAL.parch); rectP(ctx, sx + k * gw + 4, 22, 9, 1, PAL.hideD); }
      }
      if (phase === "show") { const w = Math.max(0, timer / (1.2 + n * 0.5 + level * 0.12)); rectP(ctx, 20, 34, 160 * w, 2, PAL.hideD); }
      for (let k = 0; k < n; k++) {
        const x = sx + k * gw + 2;
        rectP(ctx, x, 54, 13, 1, PAL.stone);
        if (k < entered.length) drawGlyph(ctx, entered[k], x, 40, phase === "feedback" && entered[k] !== seq[k] ? PAL.flowerR : "#2a3060", 2);
      }
      for (let k = 0; k < 8; k++) {
        const p = pal(k), sel = k === cursor && phase === "input";
        rectP(ctx, p.x, p.y, p.w, p.h, sel ? PAL.parch : PAL.wood);
        rectP(ctx, p.x, p.y, p.w, 1, sel ? PAL.white : PAL.woodL);
        drawGlyph(ctx, k, p.x + 8, p.y + 3, phase === "input" ? PAL.ink : PAL.woodD, 2);
      }
      if (phase !== "input" && phase !== "feedback") drawText(ctx, "MEMORISE", 100, 8, PAL.roof, 1, "center", null);
      if (phase === "input") drawText(ctx, "WRITE IT OUT", 100, 8, PAL.leaf, 1, "center", null);
      if (fb) drawText(ctx, fb.q >= 1 ? "PERFECT" : `${Math.round(fb.q * seq.length)}/${seq.length} RIGHT`, 100, 38, feedbackColor(fb.q), 2, "center");
    },
  };
  return g;
}

/* ------------------------------------------------------------------ */
/* Carpenter: cut on the pencil marks as the saw passes                 */
/* ------------------------------------------------------------------ */
function mgSaw(level) {
  const x0 = 18, x1 = 182;
  let round = 0, sx = x0 - 10, marks = [], cuts = [], fb = null, endT = 0, drop = 0, gapT = 0;
  const base = clamp(64 - level * 3, 44, 64);
  const results = [];
  const newPlank = () => {
    marks = [];
    let x = x0 + 22;
    for (let k = 0; k < 4; k++) { x += 8 + Math.random() * 18; marks.push({ x: Math.round(x), cut: null }); x += 14; }
    sx = x0 - 10; cuts = [];
  };
  newPlank();
  const speed = () => base * (round ? 1.3 : 1);
  const g = {
    title: "Cut chair legs", help: "Tap as the saw passes each pencil mark. Two planks.", keysHelp: "Space or E to cut",
    done: false, score: 0,
    press() {
      if (g.done || gapT > 0 || endT > 0) return;
      const open = marks.filter((mk) => mk.cut === null);
      if (!open.length) return;
      let best = open[0];
      for (const mk of open) if (Math.abs(mk.x - sx) < Math.abs(best.x - sx)) best = mk;
      const err = Math.abs(best.x - sx);
      const q = err <= 1.5 ? 1 : Math.max(0, 1 - err / 11);
      best.cut = Math.round(sx); results.push(q); fb = { q: q >= 1 ? 1 : q, t: 0.6 }; drop = 0.12;
    },
    down() { g.press(); }, move() {}, up() {}, key() {},
    update(dt) {
      if (g.done) return;
      if (fb) { fb.t -= dt; if (fb.t <= 0) fb = null; }
      if (drop > 0) drop -= dt;
      if (endT > 0) { endT -= dt; if (endT <= 0) { g.done = true; g.score = results.reduce((a, b) => a + b, 0) / 8; } return; }
      if (gapT > 0) { gapT -= dt; if (gapT <= 0) { round++; newPlank(); } return; }
      sx += speed() * dt;
      const allCut = marks.every((mk) => mk.cut !== null);
      if (sx > x1 + 6 || allCut) {
        for (const mk of marks) if (mk.cut === null) { mk.cut = -1; results.push(0); }
        if (round >= 1) endT = 0.8; else gapT = 0.8;
      }
    },
    draw(ctx) {
      rectP(ctx, 0, 0, MG_W, MG_H, PAL.wood);
      for (let y = 0; y < MG_H; y += 6) rectP(ctx, 0, y, MG_W, 1, PAL.woodD);
      drawText(ctx, `PLANK ${round + 1}/2`, 8, 6, PAL.parch);
      // plank
      rectP(ctx, x0, 52, x1 - x0, 18, PAL.pathL); rectP(ctx, x0, 52, x1 - x0, 2, PAL.parch); rectP(ctx, x0, 68, x1 - x0, 2, PAL.path);
      for (let k = 0; k < 5; k++) rectP(ctx, x0 + 10 + k * 33, 58 + (k % 2) * 4, 18, 1, PAL.path);
      for (const mk of marks) {
        rectP(ctx, mk.x, 50, 1, 22, PAL.ink); rectP(ctx, mk.x - 2, 46, 5, 1, PAL.ink); rectP(ctx, mk.x - 1, 47, 3, 1, PAL.ink); rectP(ctx, mk.x, 48, 1, 1, PAL.ink);
        if (mk.cut !== null && mk.cut >= 0) {
          rectP(ctx, mk.cut, 52, 2, 18, PAL.shadow);
          if (Math.abs(mk.cut - mk.x) > 2) rectP(ctx, Math.min(mk.cut, mk.x), 74, Math.abs(mk.cut - mk.x) + 1, 1, PAL.flowerR);
        }
        if (mk.cut === -1) drawText(ctx, "X", mk.x, 76, PAL.flowerR, 1, "center");
      }
      // saw
      const yy = drop > 0 ? 50 : 36;
      if (endT <= 0 && gapT <= 0) {
        rectP(ctx, sx - 1, yy - 2, 3, 22, PAL.metalL);
        rectP(ctx, sx - 1, yy + 18, 3, 2, PAL.metal);
        for (let k = 0; k < 10; k++) rectP(ctx, sx + 2, yy + k * 2, 1, 1, PAL.metal);
        rectP(ctx, sx - 4, yy - 10, 9, 8, PAL.woodD); rectP(ctx, sx - 3, yy - 9, 7, 2, PAL.woodL);
      }
      if (fb) drawText(ctx, feedbackFor(fb.q), 100, 22, feedbackColor(fb.q), 2, "center");
    },
  };
  return g;
}

/* ------------------------------------------------------------------ */
/* Tanner: drag to scrape the hide clean before time runs out           */
/* ------------------------------------------------------------------ */
function mgScrape(level) {
  const cs = 4, gx = 28, gy = 20, cols = 36, rows = 21;
  const dirt = new Float32Array(cols * rows), inside = new Uint8Array(cols * rows);
  let total = 0;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const dx = (i + 0.5 - cols / 2) / (cols / 2), dy = (j + 0.5 - rows / 2) / (rows / 2);
    const wob = 0.86 + 0.1 * Math.sin(i * 0.9) + 0.06 * Math.cos(j * 1.3);
    if (dx * dx + dy * dy <= wob) { inside[j * cols + i] = 1; dirt[j * cols + i] = Math.random() < 0.45 ? 2 : 1; total++; }
  }
  const dur = 11 + level * 0.6;
  let time = dur, px = 100, py = 60, active = false, endT = 0, keys = new Set();
  const cleaned = () => { let c = 0; for (let k = 0; k < dirt.length; k++) if (inside[k] && dirt[k] <= 0) c++; return c; };
  const g = {
    title: "Scrape the hide", help: "Drag across the hide to scrape off the dark patches before time runs out.", keysHelp: "Arrows move the scraper",
    done: false, score: 0, keyboard: false,
    press() {}, down(x, y) { active = true; px = x; py = y; }, move(x, y) { if (active) { px = x; py = y; } }, up() { active = false; },
    key(name, isDown) { g.keyboard = true; if (isDown) keys.add(name); else keys.delete(name); },
    update(dt) {
      if (g.done) return;
      if (endT > 0) { endT -= dt; if (endT <= 0) g.done = true; return; }
      time -= dt;
      const kx = (keys.has("ArrowRight") ? 1 : 0) - (keys.has("ArrowLeft") ? 1 : 0), ky = (keys.has("ArrowDown") ? 1 : 0) - (keys.has("ArrowUp") ? 1 : 0);
      if (kx || ky) { px = clamp(px + kx * 110 * dt, gx, gx + cols * cs); py = clamp(py + ky * 110 * dt, gy, gy + rows * cs); }
      if (active || g.keyboard) {
        const r = 7;
        for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
          const k = j * cols + i;
          if (!inside[k] || dirt[k] <= 0) continue;
          const cx = gx + i * cs + 2, cy = gy + j * cs + 2;
          if ((cx - px) ** 2 + (cy - py) ** 2 <= r * r) dirt[k] -= dt * 7;
        }
      }
      const frac = cleaned() / total;
      g.progress = frac;
      if (time <= 0 || frac >= 0.985) { g.score = clamp(frac / 0.92, 0, 1); endT = 0.7; }
    },
    draw(ctx) {
      rectP(ctx, 0, 0, MG_W, MG_H, PAL.shadow);
      rectP(ctx, gx - 8, gy - 8, cols * cs + 16, rows * cs + 16, PAL.woodD);
      rectP(ctx, gx - 6, gy - 6, cols * cs + 12, rows * cs + 12, PAL.wood);
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const k = j * cols + i;
        if (!inside[k]) continue;
        const d = dirt[k];
        const base = (i * 7 + j * 3) % 11 === 0 ? PAL.hideD : (i + j) % 9 === 0 ? PAL.hideL : PAL.hide;
        rectP(ctx, gx + i * cs, gy + j * cs, cs, cs, d > 1 ? "#5a3e26" : d > 0 ? "#7e5a3a" : base);
      }
      for (const [x, y] of [[gx - 4, gy - 4], [gx + cols * cs + 2, gy - 4], [gx - 4, gy + rows * cs + 2], [gx + cols * cs + 2, gy + rows * cs + 2]]) rectP(ctx, x, y, 2, 2, PAL.parch);
      rectP(ctx, 30, 6, 140, 4, PAL.ink); rectP(ctx, 30, 6, 140 * Math.max(0, time / dur), 4, time < 3 ? PAL.flowerR : PAL.flowerY);
      drawText(ctx, `${Math.round((g.progress || 0) * 100)}%`, 192, 5, PAL.parch, 1, "right");
      // scraper
      rectP(ctx, px - 6, py - 1, 12, 3, PAL.metalL); rectP(ctx, px - 6, py + 1, 12, 1, PAL.metal);
      rectP(ctx, px - 2, py - 8, 4, 7, PAL.woodL); rectP(ctx, px - 2, py - 8, 4, 1, PAL.pathL);
      if (endT > 0) drawText(ctx, g.score >= 0.95 ? "SPOTLESS" : g.score >= 0.6 ? "GOOD" : "PATCHY", 100, 56, feedbackColor(g.score >= 0.95 ? 1 : g.score), 2, "center");
    },
  };
  return g;
}

/* ------------------------------------------------------------------ */
/* Farmhand: pull turnips the moment they ripen                         */
/* ------------------------------------------------------------------ */
function mgHarvest(level) {
  const colsN = 4, rowsN = 3;
  const plots = Array.from({ length: colsN * rowsN }, () => ({ s: "empty", t: 0 }));
  const dur = 18, ripeWin = 1.5 + level * 0.09;
  let time = dur, spawn = 0.4, picked = 0, ripened = 0, ruined = 0, cursor = 0, endT = 0, pops = [];
  const box = (k) => ({ x: 22 + (k % colsN) * 40, y: 20 + Math.floor(k / colsN) * 31, w: 34, h: 26 });
  const tap = (k) => {
    const p = plots[k];
    if (p.s === "ripe") { p.s = "picked"; p.t = 0.45; picked++; const b = box(k); pops.push({ x: b.x + 17, y: b.y + 4, t: 0.6, txt: "+1", c: PAL.leyL }); }
    else if (p.s === "sprout") { p.s = "wilted"; p.t = 0.9; ruined++; const b = box(k); pops.push({ x: b.x + 17, y: b.y + 4, t: 0.6, txt: "-", c: PAL.flowerR }); }
  };
  const g = {
    title: "Harvest the turnips", help: "Pull each turnip the moment its top turns full and bright. Pulling early ruins it.", keysHelp: "Arrows to move, Space or E to pull",
    done: false, score: 0,
    press() { tap(cursor); },
    down(x, y) { for (let k = 0; k < plots.length; k++) { const b = box(k); if (x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h) { cursor = k; tap(k); } } },
    move() {}, up() {},
    key(name, isDown) {
      if (!isDown) return;
      const c = cursor % colsN, r = Math.floor(cursor / colsN);
      if (name === "ArrowLeft") cursor = r * colsN + ((c + colsN - 1) % colsN);
      if (name === "ArrowRight") cursor = r * colsN + ((c + 1) % colsN);
      if (name === "ArrowUp") cursor = ((r + rowsN - 1) % rowsN) * colsN + c;
      if (name === "ArrowDown") cursor = ((r + 1) % rowsN) * colsN + c;
    },
    update(dt) {
      if (g.done) return;
      if (endT > 0) { endT -= dt; if (endT <= 0) g.done = true; return; }
      time -= dt;
      for (const p of plots) {
        if (p.s === "empty") continue;
        p.t -= dt;
        if (p.t > 0) continue;
        if (p.s === "sprout") { p.s = "ripe"; p.t = ripeWin; ripened++; }
        else if (p.s === "ripe") { p.s = "wilted"; p.t = 0.9; }
        else p.s = "empty";
      }
      spawn -= dt;
      if (spawn <= 0 && time > 1.5) {
        spawn = 0.45 + Math.random() * 0.45;
        const free = plots.map((p, k) => (p.s === "empty" ? k : -1)).filter((k) => k >= 0);
        if (free.length) { const p = plots[pick(free)]; p.s = "sprout"; p.t = 1.0 + Math.random() * 0.8; }
      }
      for (const q of pops) { q.t -= dt; q.y -= dt * 14; }
      pops = pops.filter((q) => q.t > 0);
      if (time <= 0) { g.score = clamp((picked - ruined * 0.5) / Math.max(1, ripened), 0, 1); endT = 0.7; }
    },
    draw(ctx, t) {
      rectP(ctx, 0, 0, MG_W, MG_H, PAL.grassD);
      rectP(ctx, 12, 14, 176, 102, PAL.dirt);
      rectP(ctx, 30, 5, 120, 4, PAL.ink); rectP(ctx, 30, 5, 120 * Math.max(0, time / dur), 4, time < 4 ? PAL.flowerR : PAL.flowerY);
      drawText(ctx, `${picked}`, 190, 4, PAL.parch, 1, "right");
      for (let k = 0; k < plots.length; k++) {
        const b = box(k), p = plots[k];
        rectP(ctx, b.x, b.y, b.w, b.h, PAL.woodD);
        for (let fy = b.y + 4; fy < b.y + b.h; fy += 6) rectP(ctx, b.x + 2, fy, b.w - 4, 1, "#5a3e26");
        const cx = b.x + 17, cy = b.y + 15;
        if (p.s === "sprout") { rectP(ctx, cx - 1, cy - 2, 1, 4, PAL.leafL); rectP(ctx, cx + 1, cy - 3, 1, 5, PAL.leaf); }
        if (p.s === "ripe") {
          const glint = Math.floor(t * 6) % 2;
          rectP(ctx, cx - 4, cy + 1, 9, 5, PAL.white); rectP(ctx, cx - 4, cy + 1, 9, 2, PAL.turnip);
          rectP(ctx, cx - 4, cy - 7, 2, 8, PAL.leafL); rectP(ctx, cx, cy - 9, 2, 10, PAL.grassH); rectP(ctx, cx + 3, cy - 6, 2, 7, PAL.leafL);
          if (glint) rectP(ctx, cx + 6, cy - 8, 1, 1, PAL.white);
        }
        if (p.s === "wilted") { rectP(ctx, cx - 3, cy, 7, 2, PAL.hideD); rectP(ctx, cx - 4, cy - 2, 2, 2, PAL.pathD); rectP(ctx, cx + 2, cy - 1, 2, 2, PAL.pathD); }
        if (p.s === "picked") rectP(ctx, cx - 3, cy + 1, 7, 3, PAL.ink);
        if (k === cursor && g.keyboardUsed) { rectP(ctx, b.x - 1, b.y - 1, b.w + 2, 1, PAL.flowerY); rectP(ctx, b.x - 1, b.y + b.h, b.w + 2, 1, PAL.flowerY); }
      }
      for (const q of pops) drawText(ctx, q.txt, q.x, q.y, q.c, 1, "center");
      if (endT > 0) drawText(ctx, g.score >= 0.95 ? "PERFECT" : g.score >= 0.6 ? "GOOD HAUL" : "THIN HAUL", 100, 56, feedbackColor(g.score >= 0.95 ? 1 : g.score), 2, "center");
    },
  };
  const k0 = g.key;
  g.key = (n, d) => { g.keyboardUsed = true; k0(n, d); };
  return g;
}

/* ------------------------------------------------------------------ */
/* Stonemason: drop each stone squarely onto the course below           */
/* ------------------------------------------------------------------ */
function mgStack(level) {
  const courses = 6, baseW = 80, bh = 11, groundY = 104;
  const placed = [{ x: 60, w: baseW }];
  let i = 0, x = 10, dir = 1, falls = [], fb = null, endT = 0;
  const speed = () => clamp(78 - level * 3, 52, 78) * (1 + i * 0.12);
  const g = {
    title: "Set the wall course", help: "Tap to drop each stone. Whatever hangs over the edge is chipped away.", keysHelp: "Space or E to drop",
    done: false, score: 0,
    press() {
      if (g.done || endT > 0) return;
      const prev = placed[placed.length - 1], w = prev.w;
      const a = Math.max(x, prev.x), b = Math.min(x + w, prev.x + prev.w);
      let ov = b - a;
      const y = groundY - (placed.length + 1) * bh;
      if (ov <= 2) {
        falls.push({ x, y, w, vy: 0 }); fb = { q: 0, t: 0.8 }; endT = 0.9; return;
      }
      let nx = a;
      if (Math.abs(x - prev.x) <= 1.5) { nx = prev.x; ov = w; fb = { q: 1, t: 0.6 }; }
      else {
        fb = { q: ov / w >= 0.85 ? 0.7 : 0.35, t: 0.6 };
        if (x < prev.x) falls.push({ x, y, w: prev.x - x, vy: 0 }); else falls.push({ x: prev.x + prev.w, y, w: x + w - (prev.x + prev.w), vy: 0 });
      }
      placed.push({ x: nx, w: ov });
      i++;
      if (i >= courses) endT = 0.9;
      x = dir > 0 ? 10 : MG_W - 10 - ov;
    },
    down() { g.press(); }, move() {}, up() {}, key() {},
    update(dt) {
      if (g.done) return;
      if (fb) { fb.t -= dt; if (fb.t <= 0) fb = null; }
      for (const f of falls) { f.vy += 260 * dt; f.y += f.vy * dt; }
      falls = falls.filter((f) => f.y < MG_H + 10);
      if (endT > 0) {
        endT -= dt;
        if (endT <= 0) { g.done = true; g.score = placed.slice(1).reduce((a, p) => a + p.w, 0) / (courses * baseW); }
        return;
      }
      const w = placed[placed.length - 1].w;
      x += dir * speed() * dt;
      if (x + w > MG_W - 8) { x = MG_W - 8 - w; dir = -1; }
      if (x < 8) { x = 8; dir = 1; }
    },
    draw(ctx) {
      rectP(ctx, 0, 0, MG_W, MG_H, "#3a3448");
      rectP(ctx, 0, groundY, MG_W, MG_H - groundY, PAL.dirt);
      rectP(ctx, 0, groundY, MG_W, 1, PAL.pathD);
      drawText(ctx, `COURSE ${Math.min(i + 1, courses)}/${courses}`, 8, 6, PAL.parch);
      const stone = (sx, sy, w, light) => {
        rectP(ctx, sx, sy, w, bh, light ? PAL.stoneL : PAL.stone);
        rectP(ctx, sx, sy, w, 2, light ? PAL.white : PAL.stoneL);
        rectP(ctx, sx, sy + bh - 1, w, 1, PAL.stoneD);
        for (let k = 14; k < w - 4; k += 16) rectP(ctx, sx + k, sy + 2, 1, bh - 3, PAL.stoneD);
      };
      placed.forEach((p, k) => stone(p.x, groundY - (k + 1) * bh + (k === 0 ? 0 : 0), p.w, false));
      for (const f of falls) stone(f.x, f.y, f.w, false);
      if (endT <= 0 && i < courses) stone(x, groundY - (placed.length + 1) * bh, placed[placed.length - 1].w, true);
      if (fb) drawText(ctx, feedbackFor(fb.q), 100, 18, feedbackColor(fb.q), 2, "center");
    },
  };
  return g;
}

const MINIGAMES = { forge: mgForge, copy: mgCopy, saw: mgSaw, scrape: mgScrape, harvest: mgHarvest, stack: mgStack };

const XP_PER_LEVEL = 80;
const tradeLevel = (xp) => Math.min(10, 1 + Math.floor((xp || 0) / XP_PER_LEVEL));
