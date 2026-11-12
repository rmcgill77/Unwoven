/* ------------------------------------------------------------------ */
/* Chibi sprite runtime: decode atlases, slice frames, recolour player */
/* ------------------------------------------------------------------ */
const CHIBI = { ready: false, sets: {}, imgs: {}, roleImgs: {}, cbs: [], battle: {}, bImgs: {}, bRoleImgs: {} };
const CHIBI_MAP = { stranger: "kellan", mentor: "mentor", bram: "bram", tessa: "tessa", wenna: "wenna", tomas: "tomas", edda: "edda", maud: "maud", pip: "pip",
  joss: "joss", lenna: "lenna", garrick: "garrick", ansel: "ansel", hester: "hester", kellan: "kellan", companion: "companion", thorne: "thorne" };
function chibiSlice(src, d) {
  const anims = {};
  for (const name in d.anims) {
    anims[name] = d.anims[name].map((i) => { const c = makeCanvas(d.fw, d.fh); c.getContext("2d").drawImage(src, i * d.fw, 0, d.fw, d.fh, 0, 0, d.fw, d.fh); return c; });
  }
  for (const name of ["idle_side", "walk_side"]) {
    anims[name + "_l"] = (anims[name + "_nb"] || anims[name]).map((c) => { const f = makeCanvas(d.fw, d.fh), x = f.getContext("2d"); x.translate(d.fw, 0); x.scale(-1, 1); x.drawImage(c, 0, 0); return f; });
  }
  const a = d.anchor;
  return { anims, fw: d.fw, fh: d.fh, portrait: d.portrait, noBack: !!d.noBack, anchor: { down: a.down, up: a.up, right: a.side, left: [d.fw - 1 - a.side[0], a.side[1]] } };
}
function loadChibi() {
  if (CHIBI.loading) return; CHIBI.loading = true;
  const keys = Object.keys(CHIBI_DATA.chars), bkeys = Object.keys(BATTLE_DATA.chars);
  let left = 0;
  keys.forEach((k) => { left += CHIBI_DATA.chars[k].roles ? 2 : 1; });
  bkeys.forEach((k) => { left += BATTLE_DATA.chars[k].roles ? 2 : 1; });
  const done = () => { if (--left === 0) { CHIBI.ready = true; try { PORTRAIT_CACHE.clear(); } catch (e) { /* ignore */ } CHIBI.cbs.splice(0).forEach((f) => f()); } };
  const img = (b64, cb) => { const im = new Image(); im.onload = () => { cb(im); done(); }; im.src = "data:image/png;base64," + b64; };
  keys.forEach((k) => {
    const d = CHIBI_DATA.chars[k];
    img(d.png, (im) => { CHIBI.sets[k] = chibiSlice(im, d); CHIBI.imgs[k] = im; });
    if (d.roles) img(d.roles, (im) => { CHIBI.roleImgs[k] = im; });
  });
  bkeys.forEach((k) => {
    const d = BATTLE_DATA.chars[k];
    img(d.png, (im) => { CHIBI.battle[k] = battleSlice(im, d); CHIBI.bImgs[k] = im; });
    if (d.roles) img(d.roles, (im) => { CHIBI.bRoleImgs[k] = im; });
  });
}
function onChibiReady(f) { if (CHIBI.ready) f(); else CHIBI.cbs.push(f); }
const hexRGB = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const PLAYER_CHIBI = new Map();
/* eye ramps (dark rim, three mids, highlight); null keeps the base art's warm ember eyes */
const EYES = [
  { name: "Ember", c: null }, { name: "Brown", c: ["#2a1a10", "#5a3a20", "#8a5a30", "#b8884a", "#e0b878"] }, { name: "Amber", c: ["#3a2410", "#7a4a1a", "#b8782a", "#e0a84a", "#f8d888"] },
  { name: "Green", c: ["#123a26", "#2f7a46", "#5aa85a", "#a8d86a", "#d6f264"] }, { name: "Blue", c: ["#122a4a", "#2a5a9a", "#4a8ad0", "#8ac0f0", "#d0ecff"] },
  { name: "Grey", c: ["#2a3038", "#4a5664", "#7a8898", "#a8b8c8", "#d8e4f0"] }, { name: "Violet", c: ["#2a1a3a", "#5a3a7a", "#8a5ab0", "#b88ad8", "#e8c8f8"] },
];
/* inner tunic colours (the belly and chest panel); the first keeps the base art's navy */
const TUNICS = [
  { name: "Navy", b: "#2c354d", d: "#14182e", keep: true }, { name: "Cream", b: "#e2d2b0", d: "#b09c7c" }, { name: "Moss", b: "#5a6a3c", d: "#34401f" },
  { name: "Wine", b: "#7a3040", d: "#4a1a26" }, { name: "Ochre", b: "#a88a46", d: "#6e5a28" }, { name: "Slate", b: "#6a7280", d: "#3e444e" }, { name: "Black", b: "#2a262c", d: "#141216" },
];
const FACE_MARKS = [{ id: "none", name: "None" }, { id: "freckles", name: "Freckles" }, { id: "scar", name: "Scar" }, { id: "mole", name: "Beauty mark" }, { id: "paint", name: "Woad stripes" }];
const CUTS = [{ id: "spiky", name: "Spiky" }, { id: "crop", name: "Short crop" }, { id: "long", name: "Long" }, { id: "tail", name: "Ponytail" }, { id: "braid", name: "Side braid" }, { id: "bun", name: "Top knot" }, { id: "mop", name: "Messy mop" }, { id: "shorn", name: "Shorn" }];
const cutKey = (look) => (look.sex === "f" && CHIBI_DATA.chars.elowyn ? "elowyn" : look.cut && look.cut !== "spiky" && CHIBI_DATA.chars["wren_" + look.cut] ? "wren_" + look.cut : "wren");
/* role name -> [r,g,b] or null (leave as drawn) */
function playerPalette(look) {
  const S = SKINS[look.skin ?? 1] || SKINS[1], Hh = HAIRS[look.hair ?? 1] || HAIRS[1], C = CLOTHS[look.cloth ?? 0] || CLOTHS[0];
  const E = (EYES[look.eyes ?? 0] || EYES[0]).c, T = TUNICS[look.tunic ?? 0] || TUNICS[0];
  const backA = mix(Hh.b, Hh.l, 0.4);
  const p = { skin: S.l, skinD: S.d, hairA: Hh.b, hairB: mix(Hh.b, Hh.l, 0.12), hairD: Hh.d, hairHi: Hh.l, outL: mix(C.b, PAL.ink, 0.35), out: mix(C.d, PAL.ink, 0.5), backA, backHL: mix(backA, "#ffffff", 0.25) };
  if (E) E.forEach((c, i) => { p["eye" + i] = c; });
  if (!T.keep) { p.in = T.b; p.inD = T.d; }
  const o = {}; for (const k in p) o[k] = hexRGB(p[k]);
  return o;
}
function recolourAtlas(img, roleImg, look) {
  const W = img.width, H = img.height, c = makeCanvas(W, H), x = c.getContext("2d"); x.drawImage(img, 0, 0);
  const r = makeCanvas(W, H), rx = r.getContext("2d"); rx.drawImage(roleImg, 0, 0);
  const id = x.getImageData(0, 0, W, H), rd = rx.getImageData(0, 0, W, H).data, pal = playerPalette(look), names = CHIBI_DATA.roles, fac = CHIBI_DATA.fac;
  for (let i = 0; i < W * H; i++) {
    const role = Math.round(rd[i * 4] / fac);
    if (role > 0 && id.data[i * 4 + 3]) { const p = pal[names[role - 1]]; if (p) { id.data[i * 4] = p[0]; id.data[i * 4 + 1] = p[1]; id.data[i * 4 + 2] = p[2]; } }
  }
  x.putImageData(id, 0, 0);
  return { c, x };
}
/* face marks are stamped per frame, relative to the eyes (front and side views); offsets from the painted art's eye centre */
const MARK_PX = {
  freckles: { f: [[-10, 3], [-8, 4], [-6, 3], [2, 3], [4, 4], [6, 3]], s: [[-4, 3], [-2, 4], [0, 3]], col: ["#b8703a", 0.55] },
  scar: { f: [[3, 1], [3, 2], [4, 3], [4, 4], [5, 5], [6, 6]], s: [[-2, 1], [-2, 2], [-1, 3], [-1, 4], [0, 5]], col: ["#a04040", 0.65] },
  mole: { f: [[4, 7]], s: [[-2, 6]], col: ["#5a3020", 1] },
  paint: { f: [[-12, 3], [-11, 3], [-10, 3], [-9, 3], [-8, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3]], s: [[-5, 3], [-4, 3], [-3, 3], [-2, 3]], col: ["#2e6a8a", 1] },
};
function stampMarks(x, d, look, skinHex) {
  const m = MARK_PX[look.mark]; if (!m || !d.ec || look.sex === "f") return;
  const col = m.col[1] >= 1 ? m.col[0] : mix(skinHex, m.col[0], m.col[1]);
  x.fillStyle = col;
  const put = (names, key) => names.forEach((n) => (d.anims[n] || []).forEach((fi) => {
    const e = d.ec[fi]; if (!e) return;
    m[key].forEach(([dx, dy]) => x.fillRect(fi * d.fw + e[0] + dx, e[1] + dy, 1, 1));
  }));
  put(["idle_down", "walk_down"], "f"); put(["idle_side", "walk_side", "idle_side_nb", "walk_side_nb"], "s");
}
const pLookKey = (look) => [look.sex, look.skin, look.hair, look.cloth, look.cut, look.eyes, look.tunic, look.mark].join(",");
function playerChibi(look) {
  const key = pLookKey(look);
  let s = PLAYER_CHIBI.get(key);
  if (s) return s;
  const k = cutKey(look), d = CHIBI_DATA.chars[k], { c, x } = recolourAtlas(CHIBI.imgs[k], CHIBI.roleImgs[k], look);
  stampMarks(x, d, look, (SKINS[look.skin ?? 1] || SKINS[1]).l);
  s = chibiSlice(c, d); PLAYER_CHIBI.set(key, s);
  return s;
}
/* the chibi set for a look: named characters carry look.chibi, the player is recoloured from the base */
function chibiFor(look) {
  if (!CHIBI.ready || !look) return null;
  if (look.chibi && CHIBI.sets[look.chibi]) return CHIBI.sets[look.chibi];
  return playerChibi(look);
}
/* the frame and anchor to draw for a facing / moving state */
function chibiFrame(set, dir, moving, anim, t) {
  if (set.noBack && dir === "up") dir = "right";   // Elowyn has no back view: walking away is drawn side-on
  const side = dir === "left" || dir === "right";
  let name = (moving ? "walk_" : "idle_") + (side ? "side" : dir === "up" ? "up" : "down");
  if (dir === "left") name += "_l";
  const fr = set.anims[name];
  const i = moving ? Math.floor(anim) % fr.length : name === "idle_down" ? Math.floor(t * 5) % fr.length : 0;
  return { img: fr[i], anchor: set.anchor[side ? dir : dir === "up" ? "up" : "down"] };
}
function chibiPortrait(look) {
  const set = chibiFor(look);
  if (!set) return null;
  const src = set.anims.idle_down[0], c = makeCanvas(48, 48), x = c.getContext("2d");
  x.imageSmoothingEnabled = false;
  const pr = set.portrait || [6, 2, 48, 48];
  if (pr[2] !== 48) { c.width = pr[2]; c.height = pr[3] + 2; x.imageSmoothingEnabled = false; }
  x.drawImage(src, pr[0], pr[1], pr[2], pr[3], 0, 2, pr[2], pr[3]);
  return c;
}

/* ---- side-view battle sets: idle / attack / cast / hurt / dead, facing right ---- */
function battleSlice(src, d) {
  const anims = {};
  for (const n in d.anims) anims[n] = d.anims[n].map((i) => { const c = makeCanvas(d.fw, d.fh); c.getContext("2d").drawImage(src, i * d.fw, 0, d.fw, d.fh, 0, 0, d.fw, d.fh); return c; });
  return { anims, fw: d.fw, fh: d.fh, anchor: d.anchor };
}
const PLAYER_BATTLE = new Map();
/* Sword in hand on the attack frames: hand spots are measured from the base atlas (96 x 84 frames). */
const SWORD_POSE = [null, [56, 62, -125, 0], [56, 62, -120, 0], [57, 63, -112, 0], [59, 64, -100, 0], [60, 64, -88, 0], [68, 60, -60, 1], [68, 44, -30, 1], [71, 41, 5, 1], [72, 42, 20, 1]];
function drawSwordOn(ctx, hx, hy, deg) {
  const a = (deg * Math.PI) / 180, ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux;
  const px = (x, y, col) => { ctx.fillStyle = col; ctx.fillRect(Math.round(x), Math.round(y), 1, 1); };
  const along = (t, w, col) => { for (let k = -w; k <= w; k++) px(hx + ux * t + nx * k, hy + uy * t + ny * k, col); };
  for (let t = -5; t <= 2; t += 0.5) { along(t, 1, "#1c1620"); }
  for (let t = -5; t <= 2; t += 0.5) px(hx + ux * t, hy + uy * t, "#5a3a22");
  for (let k = -4; k <= 4; k += 0.5) { px(hx + ux * 3 + nx * k, hy + uy * 3 + ny * k, "#1c1620"); }
  for (let k = -3; k <= 3; k += 0.5) px(hx + ux * 3 + nx * k, hy + uy * 3 + ny * k, "#8a7a5e");
  for (let t = 4; t <= 28; t += 0.5) along(t, 2, "#1c1620");
  for (let t = 4; t <= 27; t += 0.5) { along(t, 1, "#aab3bd"); px(hx + ux * t - nx, hy + uy * t - ny, "#e3e8ee"); }
  px(hx + ux * 28, hy + uy * 28, "#e3e8ee");
}
function swordSet(set) {
  if (!set) return set;
  if (set.sworded) return set.sworded;
  const attack = set.anims.attack.map((f, i) => {
    const pose = SWORD_POSE[i]; if (!pose) return f;
    const c = makeCanvas(set.fw, set.fh), x = c.getContext("2d"); x.imageSmoothingEnabled = false;
    if (!pose[3]) { drawSwordOn(x, pose[0], pose[1], pose[2]); x.drawImage(f, 0, 0); } else { x.drawImage(f, 0, 0); drawSwordOn(x, pose[0], pose[1], pose[2]); }
    return c;
  });
  if (set.anims.attack_sword) return (set.sworded = { ...set, anims: { ...set.anims, attack: set.anims.attack_sword } });   // Elowyn: the swing is painted into her own frames
  return (set.sworded = { ...set, anims: { ...set.anims, attack } });
}
function battleFor(key, look, weapon) {
  if (!CHIBI.ready) return null;
  if (key !== "wren") return CHIBI.battle[key] || null;
  const k = pLookKey(look);
  let s = PLAYER_BATTLE.get(k);
  if (!s) {
    const bk = cutKey(look), d = BATTLE_DATA.chars[bk], { c } = recolourAtlas(CHIBI.bImgs[bk], CHIBI.bRoleImgs[bk], look);
    s = battleSlice(c, d); PLAYER_BATTLE.set(k, s);
  }
  return weapon === "oldsword" || weapon === "thornwake" ? swordSet(s) : s;
}
