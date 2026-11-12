
/* ------------------------------------------------------------------ */
/* Characters: 16x24 walk sprites (adult proportions, 25 rows with outline) */
/* look = { skin, hair, hairStyle, cloth, outfit, beard, apron, strap, */
/*          age, mood, helm, hood }                                    */
/* ------------------------------------------------------------------ */
function resolveLook(look) {
  const sk = SKINS[look.skin ?? 1] || SKINS[1];
  const hr = HAIRS[look.hair ?? 1] || HAIRS[1];
  const cl = CLOTHS[look.cloth ?? 0] || CLOTHS[0];
  return {
    sk, hr, cl,
    style: look.hood ? "hood" : look.helm ? "helm" : look.hairStyle || "short",
    outfit: look.outfit || "tunic",
    beard: !!look.beard, apron: look.apron || null, strap: !!look.strap,
    pants: look.pants || mix(PAL.woodD, PAL.ink, 0.1), boots: mix(PAL.woodD, PAL.ink, 0.55), belt: look.belt || PAL.wood,
    age: !!look.age, mood: look.mood || "neutral", eye: look.eye || "#2a1e18",
  };
}

function drawCharacter(dir, frame, look) {
  const L = resolveLook(look);
  const g = new Grid(16, 25);
  const step = frame === 1 ? -1 : frame === 3 ? 1 : 0;      // which leg is forward
  const oy = step !== 0 ? 1 : 0;                              // body dips on the contact frames
  const R = (x, y, w, h, c) => g.rect(x, y, w, h, c), P = (x, y, c) => g.set(x, y, c);
  const skin = L.sk.b, skinD = L.sk.d, skinL = L.sk.l, skinS = L.sk.s;
  const hair = L.hr.b, hairD = L.hr.d, hairL = L.hr.l;
  const cloth = L.cl.b, clothD = L.cl.d, clothL = L.cl.l;
  const dress = L.outfit === "dress", coat = L.outfit === "coat";
  const pantsL = mix(L.pants, PAL.white, 0.12), pantsD = mix(L.pants, PAL.ink, 0.3);
  const bootL = mix(L.boots, PAL.white, 0.14);
  const side = dir === "left" || dir === "right";

  /* ---- legs and skirts ---- */
  if (!side) {
    if (dress) {
      R(4, 15 + oy, 8, 7, cloth); R(4, 15 + oy, 1, 7, clothL); R(11, 15 + oy, 1, 7, clothD);
      for (const fx of [6, 9]) R(fx, 17 + oy, 1, 5, clothD);
      R(3, 21, 10, 1, clothD); R(4, 20, 8, 1, clothL);
      R(5, 22, 2, 2, L.boots); R(9, 22, 2, 2, L.boots);
      if (step === -1) { P(5, 23, null); P(6, 23, null); } if (step === 1) { P(9, 23, null); P(10, 23, null); }
    } else {
      const leg = (x, back) => {
        const top = 16 + oy, h = back ? 4 : 5;
        R(x, top, 3, h, L.pants); R(x, top, 1, h, pantsL); R(x + 2, top, 1, h, pantsD);
        const by = back ? 20 : 21;
        R(x, by, 3, 3 - (back ? 1 : 0), L.boots); R(x, by, 1, 2, bootL); R(x, by + 2 - (back ? 1 : 0), 3, 1, mix(L.boots, PAL.ink, 0.4));
      };
      leg(5, step === 1); leg(8, step === -1);
      if (coat) { R(4, 15 + oy, 8, 6, cloth); R(4, 15 + oy, 1, 6, clothL); R(11, 15 + oy, 1, 6, clothD); R(7, 16 + oy, 2, 5, clothD); R(4, 20, 8, 1, clothD); }
    }
  } else {
    // side view: the legs overlap and scissor
    const frontX = step === 1 ? 4 : step === -1 ? 9 : 6, backX = step === 1 ? 9 : step === -1 ? 4 : 7;
    const legS = (x, back) => {
      const top = 16 + oy, by = back ? 20 : 21;
      R(x, top, 3, back ? 4 : 5, back ? pantsD : L.pants);
      if (!back) R(x, top, 1, 5, pantsL);
      R(x, by, 4, 3 - (back ? 1 : 0), back ? mix(L.boots, PAL.ink, 0.25) : L.boots);
      if (!back) R(x, by, 1, 2, bootL);
    };
    if (dress) {
      R(5, 15 + oy, 7, 7, cloth); R(5, 15 + oy, 1, 7, clothL); R(11, 15 + oy, 1, 7, clothD); R(4, 21, 9, 1, clothD);
      R(6, 22, 3, 2, L.boots); if (step) R(step === 1 ? 9 : 4, 22, 3, 1, L.boots);
    } else {
      legS(backX, true); legS(frontX, false);
      if (coat) { R(5, 15 + oy, 7, 6, cloth); R(5, 15 + oy, 1, 6, clothL); R(11, 15 + oy, 1, 6, clothD); R(5, 20, 7, 1, clothD); }
    }
  }

  /* ---- torso ---- */
  const tx = side ? 5 : 5, tw = side ? 6 : 6;
  R(tx, 9 + oy, tw, 7, cloth);
  R(tx, 9 + oy, 1, 7, clothL); R(tx + tw - 1, 9 + oy, 1, 7, clothD);
  R(tx, 9 + oy, tw, 1, clothL);
  if (!side) { P(7, 11 + oy, clothD); P(8, 12 + oy, clothD); P(7, 13 + oy, clothD); }   // fabric fold
  if (!dress) { R(tx, 14 + oy, tw, 1, L.belt); P(side ? 8 : 8, 14 + oy, PAL.flowerY); R(tx, 15 + oy, tw, 1, clothD); }
  else { R(tx, 13 + oy, tw, 1, clothD); }
  // collar and neck
  if (dir === "up") { R(6, 8 + oy, 4, 1, skinD); R(6, 9 + oy, 4, 1, clothD); }
  else if (!side) { R(7, 8 + oy, 2, 1, skinS); R(6, 9 + oy, 4, 1, clothL); P(7, 9 + oy, skinD); P(8, 9 + oy, skinD); }
  else { R(7, 8 + oy, 2, 1, skinS); R(6, 9 + oy, 4, 1, clothL); }
  if (L.apron && dir !== "up") {
    if (!side) { R(6, 10 + oy, 4, 7, L.apron); R(6, 10 + oy, 4, 1, mix(L.apron, PAL.white, 0.3)); R(9, 11 + oy, 1, 6, mix(L.apron, PAL.ink, 0.22)); R(5, 10 + oy, 1, 1, L.apron); R(10, 10 + oy, 1, 1, L.apron); }
    else { R(8, 10 + oy, 3, 7, L.apron); R(8, 10 + oy, 3, 1, mix(L.apron, PAL.white, 0.3)); R(10, 11 + oy, 1, 6, mix(L.apron, PAL.ink, 0.22)); }
  }
  if (L.strap) {
    const sc = PAL.woodD, sl = PAL.woodL;
    if (dir === "down") { for (let i = 0; i < 5; i++) { P(5 + i, 9 + oy + i, sc); P(6 + i, 9 + oy + i, PAL.wood); } P(7, 11 + oy, PAL.metalL); }
    else if (dir === "up") { R(6, 10 + oy, 4, 4, sl); R(6, 10 + oy, 4, 1, PAL.wood); R(6, 13 + oy, 4, 1, PAL.woodD); }
    else { R(5, 10 + oy, 2, 4, sl); R(5, 13 + oy, 2, 1, PAL.woodD); }
  }

  /* ---- arms ---- */
  if (!side) {
    const arm = (x, fwd, lightSide) => {
      const len = fwd === 1 ? 7 : fwd === -1 ? 5 : 6;
      R(x, 10 + oy, 2, len - 2, lightSide ? cloth : clothD);
      R(lightSide ? x : x + 1, 10 + oy, 1, len - 2, lightSide ? clothL : clothD);
      R(x, 10 + oy + len - 2, 2, 1, clothD);
      R(x, 10 + oy + len - 1, 2, 2, skin); P(lightSide ? x : x + 1, 10 + oy + len - 1, skinL); P(x + 1, 10 + oy + len, skinD);
    };
    arm(3, step === -1 ? -1 : step === 1 ? 1 : 0, true);
    arm(11, step === 1 ? -1 : step === -1 ? 1 : 0, false);
  } else {
    const swing = step === 1 ? -1 : step === -1 ? 1 : 0;
    const ax = 7 + swing * 1;
    R(ax, 10 + oy, 3, 4, clothD); R(ax, 10 + oy, 1, 4, cloth); R(ax, 14 + oy, 3, 1, mix(clothD, PAL.ink, 0.2));
    R(ax, 15 + oy, 3, 2, skin); P(ax, 15 + oy, skinL);
  }

  /* ---- head ---- */
  const H = oy;          // head dips with the body
  const style = L.style;
  if (dir === "down") {
    R(5, 3 + H, 6, 6, skin);
    R(5, 3 + H, 1, 6, skinL); R(10, 3 + H, 1, 6, skinD); R(6, 8 + H, 4, 1, skinD);
    P(5, 8 + H, null); P(10, 8 + H, null);
    P(10, 4 + H, skinD);
    // eyes, brows, nose, mouth
    P(6, 5 + H, L.eye); P(9, 5 + H, L.eye); P(6, 5 + H, mix(L.eye, PAL.ink, 0.4)); P(9, 5 + H, mix(L.eye, PAL.ink, 0.4));
    P(7, 5 + H, mix(skin, PAL.white, 0.4)); P(8, 5 + H, mix(skin, PAL.white, 0.0));
    R(6, 4 + H, 2, 1, skinD); R(8, 4 + H, 2, 1, skinD);
    if (L.mood === "stern") { P(7, 4 + H, hairD); P(8, 4 + H, hairD); P(6, 4 + H, hairD); P(9, 4 + H, hairD); }
    if (L.mood === "sly") { P(9, 4 + H, hairD); P(8, 4 + H, hairD); }
    P(8, 6 + H, skinD); P(7, 6 + H, skinL);
    const lip = mix(skinD, "#8a3a3a", 0.5);
    if (L.mood === "smile" || L.mood === "kind") { P(6, 7 + H, skinD); R(7, 7 + H, 2, 1, lip); P(9, 7 + H, skinD); }
    else if (L.mood === "stern") { R(7, 7 + H, 2, 1, mix(skinS, PAL.ink, 0.2)); }
    else R(7, 7 + H, 2, 1, lip);
    if (L.age) { P(6, 3 + H, skinD); P(9, 3 + H, skinD); P(5, 6 + H, skinD); P(10, 6 + H, skinD); }
    // hair
    if (style === "hood") {
      R(4, 2 + H, 8, 2, cloth); R(3, 4 + H, 2, 6, cloth); R(11, 4 + H, 2, 6, clothD); R(4, 1 + H, 8, 1, clothL); R(5, 0 + H, 6, 1, clothL); R(5, 3 + H, 6, 1, clothD);
      R(3, 4 + H, 1, 6, clothL);
    } else if (style === "helm") {
      R(4, 1 + H, 8, 3, PAL.metal); R(5, 0 + H, 6, 1, PAL.metalL); R(4, 3 + H, 8, 1, PAL.metalD); R(5, 1 + H, 2, 1, PAL.metalL);
      R(7, 4 + H, 2, 3, PAL.metal); R(4, 4 + H, 1, 3, hairD); R(11, 4 + H, 1, 3, hairD);
    } else if (style === "bald") {
      R(5, 2 + H, 6, 1, skin); R(4, 3 + H, 1, 3, mix(skinD, hair, 0.45)); R(11, 3 + H, 1, 3, mix(skinD, hair, 0.45)); R(6, 2 + H, 2, 1, skinL);
    } else {
      R(5, 1 + H, 6, 1, hair); R(4, 2 + H, 8, 2, hair); R(4, 4 + H, 1, 3, hair); R(11, 4 + H, 1, 3, hairD);
      R(5, 3 + H, 3, 1, hair); P(8, 3 + H, skin); P(9, 3 + H, hair);
      R(5, 1 + H, 2, 1, hairL); P(6, 2 + H, hairL); P(7, 2 + H, hairL); P(10, 2 + H, hairD); P(10, 3 + H, hairD);
      if (style === "long") { R(4, 6 + H, 1, 6, hair); R(11, 6 + H, 1, 6, hairD); R(3, 8 + H, 1, 3, hair); R(12, 8 + H, 1, 3, hairD); P(4, 12 + H, hairD); P(11, 12 + H, hairD); }
      if (style === "bun") { R(6, 0 + H, 4, 1, hair); P(7, 0 + H, hairL); }
    }
    if (L.beard) { R(5, 6 + H, 6, 3, hair); R(6, 8 + H, 4, 1, hairD); R(7, 7 + H, 2, 1, mix(skinD, "#8a3a3a", 0.5)); P(5, 6 + H, hairD); P(10, 6 + H, hairD); R(5, 6 + H, 1, 2, hairL); }
  } else if (dir === "up") {
    R(5, 3 + H, 6, 5, skin); R(6, 8 + H, 4, 1, skinD);
    if (style === "hood") { R(4, 1 + H, 8, 8, cloth); R(3, 3 + H, 1, 6, clothL); R(12, 3 + H, 1, 6, clothD); R(4, 8 + H, 8, 1, clothD); R(5, 1 + H, 3, 1, clothL); R(7, 4 + H, 2, 4, clothD); }
    else if (style === "helm") { R(4, 1 + H, 8, 6, PAL.metal); R(5, 0 + H, 6, 1, PAL.metalL); R(4, 6 + H, 8, 1, PAL.metalD); R(6, 2 + H, 2, 1, PAL.metalL); R(4, 7 + H, 8, 1, hairD); }
    else if (style === "bald") { R(4, 2 + H, 8, 5, skin); R(5, 1 + H, 6, 1, skin); R(6, 2 + H, 2, 1, skinL); R(4, 6 + H, 8, 1, mix(skinD, hair, 0.5)); R(10, 3 + H, 1, 3, skinD); }
    else {
      R(5, 1 + H, 6, 1, hair); R(4, 2 + H, 8, 6, hair); R(5, 8 + H, 6, 1, hairD);
      R(5, 1 + H, 3, 1, hairL); R(5, 2 + H, 2, 1, hairL); R(10, 3 + H, 1, 5, hairD); R(7, 3 + H, 1, 4, hairD); P(6, 5 + H, hairD);
      if (style === "long") { R(4, 8 + H, 8, 4, hair); R(5, 12 + H, 6, 1, hairD); R(8, 8 + H, 1, 4, hairD); R(10, 8 + H, 2, 4, hairD); }
      if (style === "bun") { R(6, 0 + H, 4, 2, hair); R(7, 0 + H, 2, 1, hairL); }
    }
  } else {
    // facing right
    R(6, 3 + H, 6, 6, skin); R(6, 3 + H, 1, 6, skinD); R(11, 3 + H, 1, 5, skinL); R(7, 8 + H, 4, 1, skinD);
    P(12, 6 + H, skin); P(12, 5 + H, skinD);                       // nose
    P(10, 5 + H, mix(L.eye, PAL.ink, 0.4)); P(11, 5 + H, mix(skin, PAL.white, 0.35)); R(9, 4 + H, 3, 1, skinD);
    if (L.mood === "stern") R(9, 4 + H, 3, 1, hairD);
    if (L.mood === "smile" || L.mood === "kind") P(11, 7 + H, mix(skinD, "#8a3a3a", 0.5)); else R(10, 7 + H, 2, 1, mix(skinD, "#8a3a3a", 0.5));
    P(7, 6 + H, skinS);                                             // ear
    if (L.age) { P(10, 6 + H, skinD); P(9, 3 + H, skinD); }
    if (style === "hood") { R(4, 1 + H, 8, 3, cloth); R(4, 4 + H, 5, 6, cloth); R(11, 2 + H, 1, 2, clothD); R(4, 8 + H, 8, 1, clothD); R(5, 1 + H, 3, 1, clothL); R(9, 9 + H, 3, 1, clothD); }
    else if (style === "helm") { R(4, 1 + H, 8, 3, PAL.metal); R(5, 0 + H, 6, 1, PAL.metalL); R(4, 3 + H, 9, 1, PAL.metalD); R(4, 4 + H, 4, 4, hairD); R(5, 1 + H, 2, 1, PAL.metalL); P(12, 4 + H, PAL.metalD); }
    else if (style === "bald") { R(5, 2 + H, 7, 1, skin); R(4, 3 + H, 8, 1, skin); R(5, 3 + H, 2, 1, skinL); R(4, 4 + H, 3, 3, mix(skinD, hair, 0.5)); }
    else {
      R(5, 1 + H, 6, 1, hair); R(4, 2 + H, 8, 2, hair); R(4, 4 + H, 3, 4, hair); R(7, 4 + H, 1, 2, hairD); R(6, 8 + H, 1, 1, hairD);
      P(11, 3 + H, hairD); R(5, 1 + H, 3, 1, hairL); P(6, 2 + H, hairL); P(9, 3 + H, hairD);
      if (style === "long") { R(3, 5 + H, 4, 8, hair); R(3, 5 + H, 1, 8, hairL); R(6, 8 + H, 1, 5, hairD); P(4, 13 + H, hairD); }
      if (style === "bun") { R(3, 1 + H, 3, 3, hair); P(4, 1 + H, hairL); }
    }
    if (L.beard) { R(8, 6 + H, 4, 3, hair); R(8, 8 + H, 3, 1, hairD); P(12, 7 + H, hairD); R(8, 6 + H, 1, 2, hairL); }
  }
  return g.outline();
}

function characterGrid(dir, frame, look) {
  if (dir === "left") return drawCharacter("right", frame, look).flip();
  return drawCharacter(dir, frame, look);
}

const SHEET_CACHE = new Map();
function lookKey(look) { return JSON.stringify(look); }
function getSheet(look) {
  const key = lookKey(look);
  let s = SHEET_CACHE.get(key);
  if (!s) {
    s = {};
    for (const dir of ["down", "up", "right", "left"]) s[dir] = [0, 1, 2, 3].map((f) => characterGrid(dir, f, look).toCanvas());
    SHEET_CACHE.set(key, s);
  }
  return s;
}


/* ------------------------------------------------------------------ */
/* Portraits v3: 64x64 pixel-art busts.                                */
/* Flat cel shading in 3-4 tones per material, hand-placed features,   */
/* no gradients or dithering. Lit from the upper left.                 */
/* ------------------------------------------------------------------ */
const P_HW = [6, 8, 9, 10, 11, 11, 12, 12, 12, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 12, 12, 12, 11, 11, 10, 10, 9, 9, 8, 8, 7, 7, 6, 5, 4, 2];   // head half-widths, y = 10..46
const P_TPL = {
  eye: [".EEEEE.", "EWHPIWE", ".WIIIW.", ".ddddd."],
  nose: ["..LD..", "..LD..", "..LD..", "..LDD.", ".LBBDD", ".LLBDS", "SNBBNS", "..DD.."],
  ear: [".LBB", "LBDB", "LDSB", "LDBB", ".LBB", "..DB"],
  brow: {
    neutral: ["..hhhh..", ".hhhhhhh"],
    stern: ["..hhhhh.", ".hhhhhhh", "......hh"],
    smile: ["..hhhh..", ".hhhhhh."],
    kind: ["..hhhh..", ".hhhhhh."],
    sly: ["..hhhh..", ".hhhhhhh"],
  },
  mouth: {
    neutral: ["...RRRRRR...", ".RMMMMMMMMR.", "..rRRRRRRr..", "....DDDD...."],
    smile: ["M..RRRRRR..M", ".MMMMMMMMMM.", "..RrrrrrrR..", "....DDDD...."],
    kind: ["M..RRRRRR..M", ".MMMMMMMMMM.", "..RrrrrrrR..", "....DDDD...."],
    stern: ["...RRRRRR...", ".MMMMMMMMMM.", "M..rRRRRr..M", "....DDDD...."],
    sly: ["...RRRRRR..M", ".MMMMMMMMMM.", "M..rRRRRr...", "....DDDD...."],
  },
};
function stampTpl(g, tpl, x0, y0, map, flip) {
  for (let j = 0; j < tpl.length; j++) {
    const row = flip ? [...tpl[j]].reverse().join("") : tpl[j];
    for (let i = 0; i < row.length; i++) { const c = row[i]; if (c !== "." && map[c]) g.set(x0 + i, y0 + j, map[c]); }
  }
}
function drawPortrait(look) {
  const L = resolveLook(look);
  const g = new Grid(64, 64);
  const S = L.sk, H = L.hr, C = L.cl;
  const SK = { L: S.l, B: S.b, D: S.d, S: S.s };
  const HR = { H: H.l, h: H.b, k: H.d, K: mix(H.d, PAL.ink, 0.45) };
  const CL = { L: C.l, B: C.b, D: C.d, S: mix(C.d, PAL.ink, 0.4) };
  const MT = { L: PAL.metalL, B: PAL.metal, D: PAL.metalD, S: mix(PAL.metalD, PAL.ink, 0.4) };
  const lidC = mix(S.s, PAL.ink, 0.5), eyeW = mix(PAL.white, S.d, 0.18);
  const lipC = mix(S.d, "#8a3a40", 0.5), lipL = mix(S.b, "#b86a70", 0.45), mouthC = mix(S.s, PAL.ink, 0.45);
  const FEAT = { ...SK, d: S.d, E: lidC, W: eyeW, H: PAL.white, P: PAL.ink, I: L.eye, N: mix(S.s, PAL.ink, 0.5), M: mouthC, R: lipC, r: lipL, h: H.b, k: H.d };
  const cx = 31.5;
  const hwAt = (y) => (y >= 10 && y <= 46 ? P_HW[y - 10] : 0);
  const inHead = (x, y) => { const hw = hwAt(y); return hw > 0 && Math.abs(x + 0.5 - 32) < hw; };
  const px = (x, y, c) => g.set(x, y, c);

  /* ---- long hair behind everything ---- */
  const streak = (x, y) => { const s = (x + y * 2) % 8; return s === 0 ? "H" : s === 7 ? "k" : "h"; };
  const hairTone = (x, y, edge) => {
    const u = (x - cx) / 16;
    let t = streak(x, y);
    if (u > 0.35) t = t === "H" ? "h" : "k";
    if (u > 0.75 || edge) t = "K";
    if (u < -0.5 && y < 22 && (x + y) % 5 === 0) t = "H";
    return HR[t];
  };
  if (L.style === "long") {
    for (let y = 18; y < 64; y++) for (let x = 6; x < 58; x++) {
      const a = Math.abs(x + 0.5 - 32), w = y < 50 ? 19 : 19 + (y - 50) * 0.6;
      if (a > w || a < (y < 46 ? 0 : 10)) continue;
      px(x, y, hairTone(x, y, a > w - 1.2));
    }
  }

  /* ---- neck and shoulders ---- */
  for (let y = 44; y < 56; y++) for (let x = 26; x < 38; x++) {
    const sh = y < 49 ? "S" : x < 29 ? "B" : x < 34 ? "D" : "S";
    px(x, y, SK[x < 29 && y >= 49 ? "B" : sh]);
  }
  for (let y = 52; y < 64; y++) {
    const hw = Math.min(31.5, 9 + (y - 52) * 2.1);
    for (let x = 0; x < 64; x++) {
      const u = (x + 0.5 - 32) / hw;
      if (Math.abs(u) > 1) continue;
      let t = "B";
      if (u < -0.55) t = "L"; else if (u > 0.82) t = "S"; else if (u > 0.4) t = "D";
      if (y === 52 || (y === 53 && Math.abs(u) > 0.7)) t = u < 0 ? "L" : "B";
      px(x, y, CL[t]);
    }
  }
  for (let y = 56; y < 64; y++) { const x1 = 19 + ((y - 56) >> 1), x2 = 43 - ((y - 56) >> 1) + 1; if (hwAt(0) === 0) { px(x1, y, CL.D); px(x2, y, CL.D); } }
  if (L.outfit === "tunic") {
    for (let y = 52; y < 59; y++) { const w = Math.max(0, 5 - Math.floor((y - 52) * 0.8)); for (let x = 32 - w; x < 32 + w; x++) px(x, y, y < 54 ? SK.S : x < 31 ? SK.D : SK.S); if (w) { px(32 - w - 1, y, CL.L); px(32 + w, y, CL.B); } }
    for (const [x, y] of [[30, 56], [33, 56], [31, 57], [32, 57], [30, 58], [33, 58], [31, 59], [32, 59], [30, 60], [33, 60]]) px(x, y, PAL.parch);
  } else if (L.outfit === "dress") {
    for (let y = 51; y < 60; y++) for (let x = 14; x < 50; x++) {
      const dx = (x + 0.5 - 32) / 15, dy = (y + 0.5 - 51) / 8;
      const e = dx * dx + dy * dy;
      if (e > 1) continue;
      px(x, y, e > 0.8 ? CL.L : x < 30 ? SK.B : x < 38 ? SK.D : SK.S);
    }
  } else if (L.outfit === "coat") {
    for (let y = 48; y < 64; y++) {
      const w = Math.max(2, 5 + (y - 52) * 0.35);
      for (let x = 0; x < 64; x++) { const a = Math.abs(x + 0.5 - 32); if (a < w && y > 52) px(x, y, a < 1 ? CL.S : x < 32 ? mix(PAL.parch, PAL.ink, 0.25) : mix(PAL.parch, PAL.ink, 0.45)); }
    }
    for (let y = 46; y < 55; y++) for (let x = 20; x < 44; x++) { const a = Math.abs(x + 0.5 - 32); if (a >= 6 && a < 12 && !(a < 7.5 && y > 52)) px(x, y, a < 8 ? (x < 32 ? CL.L : CL.B) : x < 32 ? CL.B : CL.D); }
    for (let y = 53; y < 64; y++) { const o = 6 + (y - 53) * 0.8; px(Math.round(32 - o), y, CL.L); px(Math.round(31 + o), y, CL.D); px(Math.round(32 - o) - 1, y, CL.B); px(Math.round(31 + o) + 1, y, CL.D); }
    for (const by of [57, 61]) { px(30, by, MT.L); px(31, by, MT.B); px(30, by + 1, MT.B); px(31, by + 1, MT.D); }
  }
  if (L.apron) {
    const A = { L: mix(L.apron, PAL.white, 0.3), B: L.apron, D: mix(L.apron, PAL.ink, 0.22), S: mix(L.apron, PAL.ink, 0.4) };
    for (let y = 57; y < 64; y++) for (let x = 20; x < 44; x++) px(x, y, y === 57 ? A.L : x < 26 ? A.L : x > 38 ? A.D : A.B);
    for (let y = 51; y < 57; y++) { px(21 + (y - 51) * 0.4 | 0, y, A.B); px(22 + (y - 51) * 0.4 | 0, y, A.D); px(42 - (y - 51) * 0.4 | 0, y, A.B); px(41 - (y - 51) * 0.4 | 0, y, A.D); }
  }
  if (L.strap) for (let i = 0; i < 34; i++) { const x = 12 + i, y = 51 + (i * 0.4 | 0); px(x, y, PAL.woodL); px(x, y + 1, PAL.wood); px(x, y + 2, PAL.wood); px(x, y + 3, PAL.woodD); }
  if (L.strap) { px(36, 58, MT.L); px(37, 58, MT.B); px(36, 59, MT.B); px(37, 59, MT.D); }

  /* ---- ears ---- */
  stampTpl(g, P_TPL.ear, 15, 24, SK, false);
  stampTpl(g, P_TPL.ear, 45, 24, { L: SK.B, B: SK.D, D: SK.S, S: SK.S }, true);

  /* ---- head: flat cel shading ---- */
  for (let y = 10; y <= 46; y++) {
    const r = y - 10, hw = P_HW[r];
    for (let x = 32 - hw; x < 32 + hw; x++) {
      const u = (x + 0.5 - 32) / hw;
      let t = "B";
      if (u < -0.42 && r >= 3 && r <= 28) t = "L";
      if (r >= 2 && r <= 7 && u < 0.35) t = "L";
      if (u > 0.5 && r >= 6) t = "D";
      if (u > 0.82 && r >= 9 && r <= 31) t = "S";
      if (r >= 28 && u > -0.15) t = "D";
      if (r >= 31 && u > -0.5) t = "D";
      if (r >= 34) t = u > -0.2 ? "S" : "D";
      if (r >= 19 && r <= 23 && u > -0.86 && u < -0.5) t = "L";
      px(x, y, SK[t]);
    }
  }
  for (let y = 23; y < 24; y++) for (const [a, b] of [[21, 29], [35, 43]]) for (let x = a; x < b; x++) px(x, y, SK.D);   // brow shadow
  /* ---- features ---- */
  stampTpl(g, P_TPL.nose, 29, 27, FEAT, false);
  stampTpl(g, P_TPL.eye, 22, 24, FEAT, false);
  stampTpl(g, P_TPL.eye, 35, 24, FEAT, true);
  const mood = L.mood in P_TPL.mouth ? L.mood : "neutral";
  const brow = P_TPL.brow[mood] || P_TPL.brow.neutral;
  stampTpl(g, brow, 21, mood === "stern" ? 20 : 21, FEAT, false);
  stampTpl(g, brow, 35, mood === "stern" ? 20 : mood === "sly" ? 20 : 21, FEAT, true);
  stampTpl(g, P_TPL.mouth[mood], 26, 38, FEAT, false);
  if (L.age) {
    for (const y of [14, 17]) for (let x = 25; x < 39; x++) if ((x + y) % 3) px(x, y, SK.D);
    for (let k = 0; k < 4; k++) { px(20 + k, 25 + k, SK.D); px(43 - k, 25 + k, SK.S); px(27 - (k >> 1), 31 + k, SK.D); px(36 + (k >> 1), 31 + k, SK.S); }
  }
  // chin crease and cheek shade
  px(31, 43, SK.D); px(32, 43, SK.D);

  /* ---- beard ---- */
  if (L.beard) {
    for (let y = 33; y <= 50; y++) for (let x = 14; x < 50; x++) {
      const hw = hwAt(y) || (y <= 49 ? 3 : 0);
      const ax = Math.abs(x + 0.5 - 32);
      const wide = y >= 40 ? hw + 1.2 : hw + 0.4;
      if (ax > wide) continue;
      if (y < 40 && ax < 9.5 && !(y >= 35 && y <= 37 && ax < 6.5)) continue;
      if (y >= 38 && y <= 40 && ax < 5.5) continue;       // mouth gap
      if (y >= 35 && y <= 36 && ax < 1.6) continue;
      const edge = ax > wide - 1.2 || y >= 49;
      px(x, y, HR[edge ? "K" : ((x * 3 + y) % 7 === 0 ? "k" : (x + y * 2) % 9 === 0 ? "H" : x > 36 ? "k" : "h")]);
    }
    stampTpl(g, P_TPL.mouth[mood], 26, 38, { R: lipC, r: lipL, M: mouthC, D: HR.k }, false);
  }

  /* ---- hair, hood, helm ---- */
  const st = L.style;
  if (st === "short" || st === "long" || st === "bun") {
    for (let y = 5; y < 32; y++) for (let x = 12; x < 52; x++) {
      const ax = Math.abs(x + 0.5 - 32);
      const top = [6, 9, 11, 12, 13][Math.max(0, Math.min(4, y - 5))] ?? 14;
      const hhw = y < 10 ? top : 14.2;
      if (ax > hhw) continue;
      let yb;
      if (x < 24) yb = 21; else if (x < 28) yb = 18; else if (x < 32) yb = 16; else if (x < 37) yb = 15; else if (x < 41) yb = 17; else yb = 22;
      const side = ax >= Math.max(hwAt(y) - 2.6, 9.5) && y < 29;
      if (y < yb || (side && y < 28 && y >= 10)) {
        if (st === "bun" && y < 8 && ax > 7) continue;
        px(x, y, hairTone(x, y, ax > hhw - 1));
      }
    }
    for (let x = 20; x < 44; x++) { const y0 = x < 24 ? 21 : x < 28 ? 18 : x < 32 ? 16 : x < 37 ? 15 : x < 41 ? 17 : 22; if (inHead(x, y0) && g.get(x, y0) && g.get(x, y0) !== HR.K) px(x, y0, SK.D); }
    if (st === "bun") for (let y = 0; y < 13; y++) for (let x = 24; x < 40; x++) {
      const dx = (x + 0.5 - 32) / 7.4, dy = (y + 0.5 - 5.5) / 6.4;
      if (dx * dx + dy * dy <= 1) px(x, y, hairTone(x, y, dx * dx + dy * dy > 0.78));
    }
    if (st === "long") for (const sgn of [-1, 1]) for (let y = 22; y < 62; y++) for (let k = 0; k < 7; k++) {
      const x = Math.round(32 + sgn * (hwAt(Math.min(y, 40)) + 0.5 + k + (y > 44 ? (y - 44) * 0.25 : 0)));
      if (y > 52 && k > 6 - (y - 52) * 0.5) continue;
      px(x, y, hairTone(x, y, k === 6));
    }
  } else if (st === "bald") {
    for (let r = 1; r < 6; r++) { px(24 + r, 10 + r - 1, SK.L); }
    for (const [x, y] of [[26, 10], [27, 10], [28, 11], [25, 12]]) px(x, y, mix(S.l, PAL.white, 0.5));
    for (let y = 22; y < 31; y++) { const hw = hwAt(y); px(32 - hw, y, mix(S.d, H.b, 0.45)); px(31 + hw, y, mix(S.s, H.d, 0.45)); px(33 - hw, y, mix(S.b, H.b, 0.3)); }
  } else if (st === "hood") {
    for (let y = 2; y < 64; y++) for (let x = 2; x < 62; x++) {
      const dx = (x + 0.5 - 32) / 23.5, dy = (y + 0.5 - 30) / 29;
      const outer = dx * dx + dy * dy <= 1 || y >= 52;
      if (!outer) continue;
      const ox = (x + 0.5 - 32) / 13, oy = (y + 0.5 - 28) / 19.5, o = ox * ox + oy * oy;
      if (o <= 1 && y < 50) continue;
      if (y >= 46 && y < 56 && Math.abs(x + 0.5 - 32) < 6.5) continue;
      const u = (x + 0.5 - 32) / 24;
      let t = u < -0.55 ? "L" : u > 0.78 ? "S" : u > 0.35 ? "D" : "B";
      if (o < 1.5 && y < 50) t = o < 1.22 ? "S" : "D";
      if ((x * 2 + y) % 11 === 0 && t === "B") t = "D";
      px(x, y, CL[t]);
    }
  } else if (st === "helm") {
    for (let y = 5; y < 24; y++) for (let x = 12; x < 52; x++) {
      const dx = (x + 0.5 - 32) / 15.2, dy = (y + 0.5 - 20) / 15;
      if (dx * dx + dy * dy > 1 || y > 22) continue;
      const u = dx;
      let t = u < -0.45 ? "L" : u > 0.42 ? "D" : "B";
      if (u > 0.82) t = "S";
      if (y >= 20) t = u < 0 ? "B" : "D";
      px(x, y, MT[t]);
    }
    for (let x = 17; x < 47; x++) if (g.get(x, 21)) px(x, 21, MT.L);
    for (let y = 22; y < 36; y++) { px(31, y, MT.L); px(32, y, MT.B); px(33, y, MT.D); }
    for (const x of [20, 26, 38, 44]) px(x, 21, PAL.white);
    for (const sgn of [-1, 1]) for (let y = 23; y < 30; y++) { px(Math.round(32 + sgn * (hwAt(y) - 0.5)) - (sgn > 0 ? 1 : 0), y, HR[sgn < 0 ? "h" : "k"]); }
  }
  return g.outline();
}

const PORTRAIT_CACHE = new Map();
function getPortrait(look) {
  if (CHIBI.ready) { const k = "c:" + JSON.stringify(look); let cp = PORTRAIT_CACHE.get(k); if (!cp) { cp = chibiPortrait(look); if (cp) PORTRAIT_CACHE.set(k, cp); } if (cp) return cp; }
  const key = lookKey(look);
  let c = PORTRAIT_CACHE.get(key);
  if (!c) { c = drawPortrait(look).toCanvas(); PORTRAIT_CACHE.set(key, c); }
  return c;
}
