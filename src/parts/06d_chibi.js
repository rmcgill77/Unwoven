/* ------------------------------------------------------------------ */
/* Chibi sprites: big head, glossy eyes, clumped spiky hair, small     */
/* body. 24x34 canvas. views: "down", "right", "up" (left = flip).     */
/* ------------------------------------------------------------------ */
const CHB_HW = [4, 6, 7, 7, 7, 7, 7, 7, 7, 6, 5, 3];            // head half-widths, rows 3..14
const CHB_BANG = { 5: 11, 6: 11, 7: 7, 8: 6, 9: 7, 10: 8, 11: 9, 12: 9, 13: 8, 14: 7, 15: 6, 16: 7, 17: 11, 18: 11 };
const CHB_TOP = { 4: 5, 5: 3, 6: 2, 7: 1, 8: 1, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 1, 16: 1, 17: 2, 18: 3, 19: 5 };
const CHB_EYE = ["KKK", "WII", "IDi", ".ii"];
function drawChibi(look, view = "down", o = {}) {
  const L = resolveLook(look);
  const g0 = new Grid(24, 34);
  const g = { set: (x, y, c) => g0.set(x, y + 2, c), get: (x, y) => g0.get(x, y + 2) };
  const P = (x, y, c) => g.set(x, y, c);
  const skin = celMat({ l: L.sk.l, b: L.sk.b, d: L.sk.d }), cloth = celMat(L.cl);
  const hairM = celMat({ l: L.hr.l, b: L.hr.b, d: L.hr.d });
  const pants = celMat({ l: mix(L.pants, PAL.white, 0.2), b: L.pants, d: mix(L.pants, PAL.ink, 0.35) });
  const boot = celMat({ l: mix(L.boots, PAL.white, 0.22), b: L.boots, d: mix(L.boots, PAL.ink, 0.4) });
  const metal = celMat({ l: PAL.metalL, b: PAL.metal, d: PAL.metalD }), wood = celMat({ l: PAL.woodL, b: PAL.wood, d: PAL.woodD });
  const dress = L.outfit === "dress", coat = L.outfit === "coat", st = L.style;
  const front = view === "down", back = view === "up", side = view === "right";
  const poly = (pts, M, op) => fillPoly(g, pts, M, op);
  const eyeC = { K: mix(L.eye, PAL.ink, 0.7), W: PAL.white, I: L.eye, D: mix(L.eye, PAL.ink, 0.6), i: mix(L.eye, PAL.white, 0.45) };
  const stampEye = (x0, y0, flip) => CHB_EYE.forEach((row, j) => [...(flip ? [...row].reverse().join("") : row)].forEach((ch, i) => { if (ch !== "." && eyeC[ch]) P(x0 + i, y0 + j, eyeC[ch]); }));

  /* ---------------- back layers ---------------- */
  if (st === "long") poly(front || back ? [[3, 8], [6, 2], [18, 2], [21, 8], [21, 23], [17, 25], [7, 25], [3, 23]] : [[2, 8], [6, 2], [13, 4], [13, 14], [11, 24], [3, 24], [2, 16]], hairM, { bands: [0.2, 0.6, 0.9] });
  if (st === "hood") poly(side ? [[2, 11], [4, 2], [14, 1], [16, 12], [14, 20], [2, 20]] : [[2, 11], [4, 2], [12, 0], [20, 2], [22, 11], [20, 20], [4, 20]], cloth, { bands: [0.2, 0.55, 0.88] });

  /* ---------------- legs ---------------- */
  if (!side) {
    if (!dress) {
      poly([[8, 28], [11, 28], [11, 31], [8, 31]], pants, { bands: [0.3, 0.7, 0.95] });
      poly([[13, 28], [16, 28], [16, 31], [13, 31]], pants, { bands: [0.3, 0.7, 0.95] });
    } else { for (const x of [9, 10, 14, 15]) { P(x, 29, skin.D); P(x, 30, skin.D); } }
    poly([[7, 31], [11, 31], [11, 34], [7, 34]], boot, { bands: [0.3, 0.7, 0.95] });
    poly([[13, 31], [17, 31], [17, 34], [13, 34]], boot, { bands: [0.3, 0.7, 0.95] });
    P(8, 31, boot.L); P(14, 31, boot.L);
  } else {
    poly([[8, 28], [11, 28], [10, 31], [8, 31]], pants, { dark: true, bands: [0.3, 0.7, 0.95] });
    poly([[11, 28], [14, 28], [15, 31], [12, 31]], pants, { bands: [0.3, 0.7, 0.95] });
    poly([[7, 31], [11, 31], [11, 34], [6, 34]], boot, { dark: true });
    poly([[11, 31], [16, 31], [18, 34], [11, 34]], boot, { bands: [0.3, 0.7, 0.95] });
    P(12, 31, boot.L); P(13, 31, boot.L);
  }

  /* ---------------- body ---------------- */
  let torso;
  if (side) torso = coat ? [[8, 15], [15, 15], [16, 29], [4, 29]] : dress ? [[8, 15], [15, 15], [15, 21], [18, 29], [4, 29]] : [[8, 15], [15, 15], [15, 28], [8, 28]];
  else torso = coat ? [[7, 15], [17, 15], [19, 28], [5, 28]] : dress ? [[8, 15], [16, 15], [17, 21], [20, 29], [4, 29], [7, 21]] : [[7, 15], [17, 15], [18, 28], [6, 28]];
  poly(torso, cloth, { bands: [0.22, 0.6, 0.88] });
  if (!side) {
    if (coat) { for (let y = 17; y < 28; y++) P(12, y, cloth.S); }
    if (!coat && !dress) { for (let x = 7; x <= 17; x++) P(x, 22, wood.D); P(11, 22, metal.L); P(12, 22, metal.B); }
    if (dress) { for (let x = 8; x <= 16; x++) P(x, 20, cloth.D); for (const x of [8, 12, 15]) for (let y = 22; y < 28; y++) P(x, y, cloth.D); }
    if (L.apron && !back) { const A = celMat({ l: mix(L.apron, PAL.white, 0.3), b: L.apron, d: mix(L.apron, PAL.ink, 0.25) }); poly([[8, 20], [16, 20], [17, 29], [7, 29]], A, { bands: [0.15, 0.6, 0.9] }); for (let x = 8; x <= 16; x++) P(x, 20, A.L); }
    if (L.strap) for (let i = 0; i < 9; i++) { P(8 + i, 16 + i, wood.L); P(9 + i, 16 + i, wood.B); P(10 + i, 16 + i, wood.D); }
    /* arms */
    if (!coat) {
      poly([[4, 16], [7, 16], [7, 24], [4, 24]], cloth, { bands: [0.3, 0.7, 0.95] });
      poly([[17, 16], [20, 16], [20, 24], [17, 24]], cloth, { dark: true, bands: [0.3, 0.7, 0.95] });
      for (let x = 4; x < 7; x++) P(x, 23, cloth.L); for (let x = 17; x < 20; x++) P(x, 23, cloth.D);
      for (const [x, y] of [[4, 24], [5, 24], [4, 25], [5, 25]]) P(x, y, skin.B);
      for (const [x, y] of [[18, 24], [19, 24], [18, 25], [19, 25]]) P(x, y, skin.D);
    } else { for (const [x, y] of [[6, 25], [7, 25], [6, 26], [17, 25], [18, 25], [18, 26]]) P(x, y, skin.B); }
  } else {
    if (!coat && !dress) { for (let x = 8; x <= 15; x++) P(x, 22, wood.D); P(14, 22, metal.L); }
    if (L.apron) { const A = celMat({ l: mix(L.apron, PAL.white, 0.3), b: L.apron, d: mix(L.apron, PAL.ink, 0.25) }); poly([[12, 20], [17, 20], [17, 29], [12, 29]], A, { bands: [0.15, 0.6, 0.9] }); }
    poly([[10, 16], [14, 16], [15, 24], [11, 24]], cloth, { bands: [0.2, 0.55, 0.88] });
    for (const [x, y] of [[13, 24], [14, 24], [14, 25], [13, 25]]) P(x, y, skin.B);
    if (L.strap) for (let i = 0; i < 8; i++) { P(8 + i, 16 + i, wood.L); P(9 + i, 16 + i, wood.B); }
  }
  /* hem and cape tail on side view */
  const hemY = coat ? 28 : dress ? 28 : 27;
  for (let x = 5; x <= 19; x++) if (g.get(x, hemY)) P(x, hemY, cloth.L);
  if (coat) for (let x = 5; x <= 19; x += 3) { P(x, 29, cloth.D); }

  /* ---------------- neck + head ---------------- */
  const hcx = side ? 11 : 12;
  for (let y = 15; y <= 16; y++) for (let x = hcx - 2; x < hcx + 2; x++) P(x, y, y === 15 ? skin.S || skin.D : skin.D);
  for (let r = 0; r < 12; r++) {
    const y = 3 + r, hw = CHB_HW[r];
    for (let x = hcx - hw; x < hcx + hw; x++) {
      const t = (x - (hcx - hw)) / Math.max(1, 2 * hw - 1);
      let k = t < 0.18 ? "L" : t < 0.74 ? "B" : "D";
      if (y >= 13) k = "D";
      if (side && x >= hcx + hw - 2 && y >= 9) k = "L";
      P(x, y, skin[k]);
    }
  }
  if (back) for (let r = 0; r < 12; r++) { const y = 3 + r, hw = CHB_HW[r]; for (let x = hcx - hw; x < hcx + hw; x++) P(x, y, (st === "hood" ? cloth : st === "helm" ? metal : hairM)[x < hcx - 3 ? "L" : x > hcx + 3 ? "D" : "B"]); }
  /* face */
  if (front) {
    stampEye(6, 9, false); stampEye(15, 9, true);
    P(11, 14, mix(L.sk.s, PAL.ink, 0.45)); P(12, 14, mix(L.sk.s, PAL.ink, 0.45));
    if (L.mood === "smile" || L.mood === "kind") { P(10, 13, mix(L.sk.s, PAL.ink, 0.45)); P(13, 13, mix(L.sk.s, PAL.ink, 0.45)); }
    if (L.mood === "stern") for (const x of [6, 7, 8, 16, 17, 18]) P(x, 8, mix(L.hr.d, PAL.ink, 0.3));
    P(6, 13, mix(L.sk.b, "#d46a70", 0.35)); P(17, 13, mix(L.sk.b, "#d46a70", 0.35));
    if (L.age) { P(7, 13, skin.D); P(16, 13, skin.D); for (let x = 9; x < 15; x += 2) P(x, 6, skin.D); }
  } else if (side) {
    stampEye(14, 9, true);
    P(18, 13, mix(L.sk.s, PAL.ink, 0.45)); P(17, 13, mix(L.sk.s, PAL.ink, 0.45));
    P(17, 12, skin.D);
    P(19, 12, skin.L); P(19, 11, skin.L);
    if (L.mood === "stern") for (const x of [13, 14, 15, 16]) P(x, 8, mix(L.hr.d, PAL.ink, 0.3));
    P(13, 13, mix(L.sk.b, "#d46a70", 0.35));
    if (L.age) { P(13, 12, skin.D); for (let x = 11; x < 16; x += 2) P(x, 6, skin.D); }
  }
  /* beard */
  if (L.beard && !back) {
    const sp = front ? [[6, 17, 12], [5, 18, 13], [6, 17, 14]] : [[11, 19, 12], [10, 19, 13], [10, 18, 14]];
    sp.forEach(([a, b, y], i) => { for (let x = a; x <= b; x++) { if (i === 1 && ((front && x >= 10 && x <= 13) || (side && x >= 15 && x <= 17))) continue; P(x, y, (x + y) % 4 === 0 ? hairM.L : x > 14 ? hairM.D : hairM.B); } });
    if (front) { for (const x of [8, 9, 14, 15]) P(x, 12, hairM.B); P(11, 14, mix(L.sk.s, PAL.ink, 0.45)); P(12, 14, mix(L.sk.s, PAL.ink, 0.45)); }
  }

  /* ---------------- hair / hood / helm ---------------- */
  const hairTone = (x, y, edge) => (edge || x >= hcx + 3 || (y >= 4 && (x + (y >> 2)) % 5 === 0)) ? hairM.D : (y <= 4 && x < hcx - 1 && (x + y) % 6 < 3) ? hairM.L : hairM.B;
  if ((st === "short" || st === "long" || st === "bun") && !back) {
    for (let x = hcx - 8; x <= hcx + 7; x++) {
      const dx = x - (hcx - 8) + 4; // map to CHB tables (x from 4..19)
      let top = CHB_TOP[dx]; if (top === undefined) continue;
      let bl = side ? (x < hcx - 1 ? 13 : x < hcx + 2 ? 11 : x < hcx + 4 ? 8 : x < hcx + 6 ? 7 : 7) : (CHB_BANG[dx] ?? 7);
      if (dx === 4 || dx === 19) bl = 10;
      for (let y = top; y < bl; y++) P(x, y + (side ? 0 : 0), hairTone(x, y, y === bl - 1));
    }
    for (const [dx, h2] of [[6, 1], [9, 1], [13, 1], [16, 1]]) { const x = hcx - 8 + dx - 4; P(x, CHB_TOP[dx] - 1, hairM.B); if (dx % 2) P(x - 1, CHB_TOP[dx] - 1, hairM.L); }
    if (side) { for (let x = hcx - 8; x < hcx - 2; x++) for (let y = 8; y < 14 - (hcx - 3 - x); y++) if (x + y > 14) P(x, y, hairTone(x, y, false)); P(hcx - 9, 7, hairM.D); P(hcx - 9, 6, hairM.B); P(hcx - 10, 8, hairM.D); P(hcx - 10, 9, hairM.D); }
    if (st === "bun") { poly([[hcx - 3, -1], [hcx + 2, -1], [hcx + 3, 2], [hcx - 3, 2]], hairM, { bands: [0.3, 0.7, 0.92] }); }
  } else if (back && st !== "hood" && st !== "helm" && st !== "bald") {
    for (let x = hcx - 8; x < hcx + 8; x++) for (let y = 0 + (CHB_TOP[x - hcx + 12] ?? 5); y < 15 - (x < hcx - 6 || x > hcx + 5 ? 3 : 0); y++) { const jag = (x % 3 === 0 ? 1 : 0); if (y <= 14 - jag) P(x, y, hairTone(x, y, false)); }
    for (const x of [6, 9, 14, 17]) P(x, 0, hairM.B);
  } else if (st === "hood") {
    poly([[4, 8], [5, 2], [12, 0], [19, 2], [20, 8], [17, 5], [12, 4], [7, 5]], cloth, { bands: [0.2, 0.55, 0.88] });
    for (let x = 6; x < 18; x++) P(x, 5, cloth.S);
  } else if (st === "helm") {
    poly([[4, 8], [5, 2], [12, 0], [19, 2], [20, 8], [6, 7]], metal, { bands: [0.2, 0.55, 0.88] });
    for (let x = 5; x < 19; x++) { P(x, 7, metal.D); P(x, 6, metal.L); }
    if (front) for (let y = 8; y < 13; y++) { P(11, y, metal.B); P(12, y, metal.L); }
    P(9, 1, PAL.white); P(8, 2, metal.L);
  } else if (st === "bald") { P(10, 3, mix(L.sk.l, PAL.white, 0.5)); P(11, 3, mix(L.sk.l, PAL.white, 0.5)); P(9, 4, skin.L); }
  if (o.staff) { for (let y = 3; y < 34; y++) { P(20, y, wood.L); P(21, y, wood.B); } P(19, 2, "#bfe8ff"); P(20, 1, "#6fc4f0"); P(21, 2, "#6fc4f0"); P(20, 24, skin.B); P(21, 24, skin.B); }
  g0.outline();
  const c = g0.toCanvas();
  if (view === "left") { const f = makeCanvas(c.width, c.height), x = f.getContext("2d"); x.translate(c.width, 0); x.scale(-1, 1); x.drawImage(c, 0, 0); return f; }
  return c;
}
