
/* ------------------------------------------------------------------ */
/* Props: footprint in tiles (fw, fh), sprite offset (dx, dy)          */
/* ------------------------------------------------------------------ */
const PROP_DEFS = {
  bed: { fw: 1, fh: 2 },
  table: { fw: 2, fh: 1, dy: -4 },
  chair: { fw: 1, fh: 1 },
  stool: { fw: 1, fh: 1 },
  shelf: { fw: 1, fh: 1, dy: -12, look: "shelf" },
  dresser: { fw: 2, fh: 1, dy: -8, look: "dresser" },
  fireplace: { fw: 2, fh: 2, wall: true, frames: 2, look: "fireplace", light: { r: 56, c: PAL.ember, ox: 16, oy: 24, flicker: true } },
  barrel: { fw: 1, fh: 1, dy: -2, look: "barrel" },
  crate: { fw: 1, fh: 1, look: "crate" },
  sack: { fw: 1, fh: 1, look: "sack" },
  plant: { fw: 1, fh: 1, dy: -2 },
  forge: { fw: 2, fh: 1, dy: -16, frames: 2, light: { r: 46, c: PAL.ember, ox: 16, oy: 6, flicker: true } },
  anvil: { fw: 1, fh: 1 },
  desk: { fw: 2, fh: 1, dy: -8, look: "desk", light: { r: 22, c: PAL.fireL, ox: 26, oy: -7, flicker: true } },
  bench: { fw: 2, fh: 1, dy: -6 },
  rack: { fw: 1, fh: 1, dy: -14 },
  baskets: { fw: 2, fh: 1, dy: -2, look: "baskets" },
  block: { fw: 2, fh: 1, dy: -4 },
  well: { fw: 2, fh: 1, dy: -12, look: "well" },
  lamp: { fw: 1, fh: 1, dy: -16, light: { r: 44, c: PAL.glow, ox: 8, oy: -10, night: true, str: 0.72 } },
  board: { fw: 2, fh: 1, dy: -10, look: "board" },
  goat: { fw: 1, fh: 1, dy: -6, look: "goat" },
  bloom: { fw: 1, fh: 1, dy: -2, look: "bloom" },
  chest: { fw: 1, fh: 1, look: "chest" }, books: { fw: 1, fh: 1, deco: true, look: "books" }, jugs: { fw: 1, fh: 1, look: "jugs" },
  cauldron: { fw: 1, fh: 1, look: "cauldron", light: { r: 20, c: PAL.ember, ox: 8, oy: 12, flicker: true, str: 0.7 } },
  candles: { fw: 1, fh: 1, deco: true, light: { r: 22, c: PAL.fireL, ox: 8, oy: 6, flicker: true, str: 0.75 } }, straw: { fw: 1, fh: 1, deco: true },
  herbs: { fw: 1, fh: 1, wall: true, look: "herbs" }, painting: { fw: 1, fh: 1, wall: true, look: "painting" }, mirror: { fw: 1, fh: 1, wall: true, look: "mirror" }, shelfw: { fw: 1, fh: 1, wall: true, look: "shelfw" },
  tools: { fw: 1, fh: 1, wall: true, look: "tools" }, cloths: { fw: 1, fh: 1, wall: true, look: "vat" }, firewood: { fw: 1, fh: 1, look: "firewood" },
  rubble: { fw: 2, fh: 1, dy: -10, look: "rubble" },
  shroom: { fw: 1, fh: 1, deco: true, look: "shroom", light: { r: 40, c: "#7ad0e0", ox: 8, oy: 6, flicker: true, str: 0.9 } },
  herbpatch: { fw: 1, fh: 1, deco: true, look: "herbpatch" },
  firepit: { fw: 1, fh: 1, look: "firepit" }, leanto: { fw: 2, fh: 1, look: "leanto" }, deadlog: { fw: 2, fh: 1, look: "deadlog" }, bones: { fw: 1, fh: 1, deco: true, look: "bones" },
  lantern: { fw: 1, fh: 1, wall: true, light: { r: 46, c: PAL.ember, ox: 8, oy: 10, flicker: true, str: 0.9 } },
};

const HB = { l: -5, r: 5, t: -4, b: 2 };
const DIR_VEC = { down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0] };
const OPPOSITE = { down: "up", up: "down", left: "right", right: "left" };

/* ------------------------------------------------------------------ */
/* Text variables and NPC helpers shared by the engine and the UI      */
/* ------------------------------------------------------------------ */
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
function fillText(str, vars) { return String(str).replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m)); }

/* chibi sprites are drawn in the world at a reduced size so people stand about as tall as a doorway */
const WORLD_CHIBI_K = 0.6;
const WORLD_CHIBI_CACHE = new WeakMap();
function worldChibi(img) {
  let c = WORLD_CHIBI_CACHE.get(img);
  if (c) return c;
  c = makeCanvas(Math.max(1, Math.round(img.width * WORLD_CHIBI_K)), Math.max(1, Math.round(img.height * WORLD_CHIBI_K)));
  const x = c.getContext("2d"); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = "high";
  x.drawImage(img, 0, 0, c.width, c.height);
  WORLD_CHIBI_CACHE.set(img, c);
  return c;
}
/* a child-sized copy of a chibi frame: big head kept, short body, feet on the same row */
const CHILD_CHIBI_CACHE = new WeakMap();
function childChibi(img) {
  let c = CHILD_CHIBI_CACHE.get(img); if (c) return c;
  c = makeCanvas(img.width, img.height); const x = c.getContext("2d"); x.imageSmoothingEnabled = false;
  const H = 50, hs = 0.78, bs = 0.58, bh = (img.height - H) * bs, bw = img.width * bs, hw = img.width * hs, bot = img.height;
  x.drawImage(img, 0, H, img.width, img.height - H, Math.round((img.width - bw) / 2), Math.round(bot - bh), Math.round(bw), Math.round(bh));
  x.drawImage(img, 0, 0, img.width, H, Math.round((img.width - hw) / 2), Math.round(bot - bh - H * hs + 1), Math.round(hw), Math.round(H * hs));
  CHILD_CHIBI_CACHE.set(img, c); return c;
}
function npcLookFor(id, G) {
  if (id === "mentor") return { ...TRADES[(G && G.trade) || "smith"].mentorLook, chibi: "mentor" };
  if (id === "mayor") {
    return G && G.mayorGender === "f"
      ? { skin: 0, hair: 2, hairStyle: "bun", cloth: 4, outfit: "coat", mood: "smile", age: true, chibi: "mayor_f" }
      : { skin: 0, hair: 4, hairStyle: "short", cloth: 4, outfit: "coat", mood: "smile", age: true, chibi: "mayor_m" };
  }
  if (id === "player") return G ? G.look : { skin: 1, hair: 1, hairStyle: "short", cloth: 0, outfit: "tunic", strap: true };
  return NPC_DEFS[id] ? { ...NPC_DEFS[id].look, chibi: CHIBI_MAP[id] || null } : null;
}

function buildVars(G, hour) {
  if (!G) return {};
  const t = TRADES[G.trade];
  const v = {
    name: G.name, surname: PLAYER_SURNAME, full: `${G.name} ${PLAYER_SURNAME}`, mentor: G.mentorName, mayor: G.mayorName,
    trade: t.name, trade_lower: t.name.toLowerCase(), station: t.stationName, station_cap: cap(t.stationName),
    product: t.productName, product_cap: cap(t.productName), job_name: t.jobName, order: t.order,
  };
  const PR = { she: { they: "she", them: "her", their: "her", kid: "lass", are: "is" }, he: { they: "he", them: "him", their: "his", kid: "lad", are: "is" }, they: { they: "they", them: "them", their: "their", kid: "youngster", are: "are" } }[G.pro || "they"];
  Object.assign(v, PR, { They: cap(PR.they), Their: cap(PR.their) });
  v.shop_name = fillText(t.shopName, v);
  v.shop_sign = fillText(t.shopSign, v);
  const rid = t.recipient;
  v.recipient = npcName(rid, v);
  const e = scheduleAt(NPC_DEFS[rid], hour === undefined ? 8 : hour);
  v.where = e.map ? e.where : "at home";
  v.recipient_hint = e.map ? `${v.recipient} will be at ${e.where} at this hour.` : `${v.recipient} has gone home for the night.`;
  return v;
}
function npcName(id, vars) { return NPC_DEFS[id] ? fillText(NPC_DEFS[id].name, vars || {}) : id; }

/* ------------------------------------------------------------------ */
/* Map preparation                                                     */
/* ------------------------------------------------------------------ */

/* Soft ground shading: contact shadows under trees, props and buildings, and wall occlusion indoors. */
function buildShade(def, cells, w, h, props) {
  const c = makeCanvas(w * TILE, h * TILE), x = c.getContext("2d");
  const at = (tx, ty) => (tx < 0 || ty < 0 || tx >= w || ty >= h ? null : cells[ty][tx]);
  const BUILD = new Set(["R", "W", "D", "w", "#"]);
  const WALLISH = new Set(["U", "Y", "L", "X"]);
  const FLOORS = new Set(["o", "s", "m", "u"]);
  const blob = (cx0, cy0, rx, ry, a) => {
    x.fillStyle = `rgba(10,6,22,${a})`;
    for (let k = 0; k < 3; k++) {
      const rr = 1 - k * 0.22;
      x.beginPath(); x.ellipse(cx0, cy0, rx * rr, ry * rr, 0, 0, Math.PI * 2); x.fill();
    }
  };
  for (let ty = 0; ty < h; ty++) for (let tx = 0; tx < w; tx++) {
    const ch = cells[ty][tx], px = tx * TILE, py = ty * TILE;
    if (BUILD.has(ch)) {
      x.fillStyle = "rgba(10,6,22,0.13)"; x.fillRect(px + 7, py + 5, TILE, TILE);
      x.fillStyle = "rgba(10,6,22,0.13)"; x.fillRect(px + 4, py + 3, TILE, TILE);
    } else if (ch === "T") blob(px + 9, py + 14, 9, 4.2, 0.1);
    else if (ch === "b" || ch === "r") blob(px + 8, py + 14, 6, 2.6, 0.11);
    else if (FLOORS.has(ch)) {
      const n = at(tx, ty - 1), wst = at(tx - 1, ty), est = at(tx + 1, ty);
      if (n && (WALLISH.has(n) || n === "K")) { for (let k = 0; k < 5; k++) { x.fillStyle = `rgba(8,5,18,${(0.2 - k * 0.04).toFixed(3)})`; x.fillRect(px, py + k, TILE, 1); } }
      if (wst === "X") { for (let k = 0; k < 3; k++) { x.fillStyle = `rgba(8,5,18,${(0.2 - k * 0.06).toFixed(3)})`; x.fillRect(px + k, py, 1, TILE); } }
      if (est === "X") { for (let k = 0; k < 3; k++) { x.fillStyle = `rgba(8,5,18,${(0.2 - k * 0.06).toFixed(3)})`; x.fillRect(px + TILE - 1 - k, py, 1, TILE); } }
    }
  }
  // buildings keep their own colour: remove the shadow where the wall or roof itself is
  x.globalCompositeOperation = "destination-out";
  for (let ty = 0; ty < h; ty++) for (let tx = 0; tx < w; tx++) {
    const ch = cells[ty][tx];
    if (BUILD.has(ch) || WALLISH.has(ch) || ch === "K") { x.fillStyle = "#000"; x.fillRect(tx * TILE, ty * TILE, TILE, TILE); }
  }
  x.globalCompositeOperation = "source-over";
  // contact line where a wall meets the ground in front of it
  for (let ty = 0; ty < h; ty++) for (let tx = 0; tx < w; tx++) {
    const ch = cells[ty][tx];
    if (def.outside && (ch === "." || ch === "," || ch === "=" || ch === "P" || ch === "*") && (at(tx, ty - 1) === "W" || at(tx, ty - 1) === "D" || at(tx, ty - 1) === "w")) {
      for (let k = 0; k < 4; k++) { x.fillStyle = `rgba(10,6,22,${(0.2 - k * 0.045).toFixed(3)})`; x.fillRect(tx * TILE, ty * TILE + k, TILE, 1); }
    }
  }
  for (const p of props) {
    if (p.def.wall) continue;
    const fx = p.x * TILE, fy = p.y * TILE, fw = p.def.fw * TILE, fh = p.def.fh * TILE;
    blob(fx + fw / 2 + 2, fy + fh - 2, fw / 2 + 3, 3.4, 0.1);
  }
  return c;
}

function prepareMap(id, def, art, trade) {
  const cells = def.rows.map((r) => r.split(""));
  const h = cells.length, w = cells[0].length;
  const at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? null : cells[y][x]);
  const solid = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) solid[y * w + x] = SOLID_TILES.has(cells[y][x]) ? 1 : 0;

  const props = [...(def.props || []), ...((def.stations && def.stations[trade]) || [])].map((p) => ({ ...p, def: PROP_DEFS[p.p] }));
  const propAt = new Map();
  for (const p of props) {
    for (let j = 0; j < p.def.fh; j++) for (let i = 0; i < p.def.fw; i++) {
      propAt.set(`${p.x + i},${p.y + j}`, p);
      if (!p.def.wall && !p.def.deco) solid[(p.y + j) * w + p.x + i] = 1;
    }
  }
  const warpAt = new Map();
  for (const wp of def.warps || []) warpAt.set(`${wp.x},${wp.y}`, wp);
  // a door with nowhere to go is a locked door: solid, and examining it says so
  if (def.outside) for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (cells[y][x] === "D" && !warpAt.has(`${x},${y}`)) solid[y * w + x] = 1;

  const mask = (x, y, test, edgeValue) => {
    let mk = 0;
    const chk = (nx, ny, bit) => { const c = at(nx, ny); if (c === null ? edgeValue : test(c)) mk |= bit; };
    chk(x, y - 1, N); chk(x + 1, y, E); chk(x, y + 1, S); chk(x - 1, y, W);
    return mk;
  };
  const pathLike = new Set(["=", "P", "B", "D", "Z"]);
  const waterLike = new Set(["~", "B"]);
  const keys = [], lights = [];
  for (let y = 0; y < h; y++) {
    const row = [];
    for (let x = 0; x < w; x++) {
      const c = cells[y][x];
      const v = hash2(x, y) % 4, v8 = hash2(x + 3, y * 5) % 8;
      let k;
      switch (c) {
        case ".": k = art.grass(v, false); break;
        case ",": k = art.grass(v, true); break;
        case "*": k = art.flowers(v); break;
        case "=": case "P": k = art.path(mask(x, y, (n) => !pathLike.has(n), false), v); break;
        case "Z": k = art.barricade(v); break;
        case "~": { const mk = mask(x, y, (n) => !waterLike.has(n), false); k = [art.water(mk, 0, v), art.water(mk, 1, v)]; break; }
        case "B": k = art.bridge(mask(x, y, (n) => n !== "B", false)); break;
        case "c": k = art.crop(v); break;
        case "f": k = art.fence(mask(x, y, (n) => n === "f", false), v); break;
        case "T":
          k = art.grass(v, false);
          break;
        case "R": k = art.roof(mask(x, y, (n) => n !== "R", true)); break;
        case "W": case "D": k = art.wall(c, false); break;
        case "w":
          k = { win: true, d: art.wall("w", false), n: art.wall("w", true) };
          lights.push({ x: x * TILE + 8, y: y * TILE + 10, r: 20, c: PAL.glow, night: true, str: 0.8 });
          break;
        case "S": k = art.sign(v); break;
        case "b": k = art.bush(v); break;
        case "r": k = art.rock(v); break;
        case "#": k = art.stone(); break;
        case "X": k = art.voidT(mask(x, y, (n) => n !== "X", false)); break;
        case "U": k = art.wallUp(x % 3, false, false); break;
        case "Y": k = { win: true, d: art.wallUp(x % 3, true, false), n: art.wallUp(x % 3, true, true) }; break;
        case "L": k = art.wallLo(); break;
        case "o": k = art.floor(v8); break;
        case "s": k = art.flag(v8); break;
        case "u": k = art.rug(mask(x, y, (n) => n !== "u", true), (x + y) % 2); break;
        case "K": k = art.counter(mask(x, y, (n) => n !== "K", true)); break;
        case "m": case "d": k = art.mat(v8); break;
        default: k = art.grass(v, false);
      }
      row.push(k);
    }
    keys.push(row);
  }

  for (const p of props) {
    const d = p.def;
    if (d.light) lights.push({ x: p.x * TILE + d.light.ox, y: p.y * TILE + d.light.oy, r: d.light.r, c: d.light.c, flicker: d.light.flicker, night: d.light.night, str: d.light.str });
  }
  if (def.pillar) lights.push({ x: def.pillar.x, y: 17 * TILE, r: 52, c: PAL.ley, flicker: true, str: 0.85 });

  // the grim art pass: one baked ground layer plus high-detail sprites, sharing the cast's pixel density
  const g = bakeGrimMap(id, def, cells, w, h, props, trade);
  for (const [cx, cy] of g.clear || []) solid[cy * w + cx] = 0;
  const water = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (cells[y][x] === "~") water.push(x, y);
  return { id, def, w, h, cells, at, solid, props, propAt, warpAt, keys, flames: g.flames, talls: g.talls, decals: [], lights: [...lights, ...g.lights], shade: null, base: g.base, water };
}

/* ------------------------------------------------------------------ */
/* Engine                                                              */
/* ------------------------------------------------------------------ */
function createEngine(canvas, root, hooks) {
  const ctx = canvas.getContext("2d");
  const art = buildArt();
  let maps = {}, mapsTrade = null;
  const lightCanvas = makeCanvas(1, 1);
  const lctx = lightCanvas.getContext("2d");
  const s = {
    mode: "attract", G: null, mapId: "oak", map: null,
    player: { x: 0, y: 0, dir: "down", anim: 0, moving: false },
    npcs: {}, looks: {}, cam: { x: 0, y: 0 }, t: 0, particles: [], blocked: false, wolves: [], critters: [], smoke: [], emotes: [], shakeT: 0, shakeA: 0, encounter: null, lightT: 0, scan: null, breathT: 0,
    fade: null, target: null, view: { w: 320, h: 180, scale: 1 }, settings: { ...DEFAULT_SETTINGS },
    attractTime: 19.6 * 60, passOutSent: false, hudTimer: 0, fpsFrames: 0, fpsTime: 0, fps: 0,
  };
  const input = { keys: new Set(), jx: 0, jy: 0 };
  const rand = mulberry32(Date.now() & 0xffff);

  function ensureMaps(trade) {
    if (mapsTrade === trade) return;
    maps = {};
    // maps are baked on first visit: the wilds are large and most are not seen in a session
    maps = new Proxy({}, { get(t, id) {
      if (typeof id !== "string") return t[id];
      if (!(id in t) && MAP_DEFS[id]) t[id] = prepareMap(id, worldDef(id, s.G && s.G.flags), art, trade);
      return t[id];
    } });
    mapsTrade = trade;
  }
  const hour = () => (s.mode === "attract" ? s.attractTime : s.G.time) / 60;

  /* story state that changes the town: the opened barricade, the fire, the ash */
  function refreshWorld() {
    if (!s.G || !mapsTrade) return;
    const fl = s.G.flags || {};
    for (const id of WORLD_DYNAMIC) delete maps[id];
    s.fireSpots = null;
    if (fl.d4_fire && !fl.d5_ash) {
      const m = maps.oak, spots = (m.flames || []).map(([x, y, sc]) => [x, y, sc]);
      s.fireSpots = spots;
      for (let i = 0; i < spots.length; i += 1) m.lights.push({ x: spots[i][0], y: spots[i][1] - 6, r: 46 * spots[i][2] + 14, c: PAL.ember, flicker: true, str: 1 });
    }
    if (maps[s.mapId]) s.map = maps[s.mapId];
  }

  function resize() {
    const rect = root.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const devW = Math.max(1, rect.width * dpr), devH = Math.max(1, rect.height * dpr);
    // the world is drawn at WZ x so the chibi characters can sit on it at their native resolution
    const scale = Math.max(1, Math.round(Math.min(devW, devH) / (RES_SHORT * WZ))) * (s.stage && s.stage.zoom ? s.stage.zoom : 1);
    let w = Math.ceil(devW / scale), h = Math.ceil(devH / scale);
    w += w % WZ; h += h % WZ;
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    canvas.style.width = (w * scale) / dpr + "px";
    canvas.style.height = (h * scale) / dpr + "px";
    s.view = { w: w / WZ, h: h / WZ, scale };
    if (s.map) snapCamera();
  }

  /* ---------- collision ---------- */
  const tileSolid = (tx, ty) => {
    const m = s.map;
    if (tx < 0 || ty < 0 || tx >= m.w || ty >= m.h) return true;
    return m.solid[ty * m.w + tx] === 1;
  };
  const npcBox = (n) => [n.x - 6, n.y - 5, n.x + 6, n.y + 2];
  function solidRect(x0, y0, x1, y1, ignoreNpc, ignoreSet) {
    const tx0 = Math.floor(x0 / TILE), tx1 = Math.floor((x1 - 0.001) / TILE);
    const ty0 = Math.floor(y0 / TILE), ty1 = Math.floor((y1 - 0.001) / TILE);
    for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) if (tileSolid(tx, ty)) return true;
    for (const id in s.npcs) {
      const n = s.npcs[id];
      if (n.map !== s.mapId || n === ignoreNpc || n.hidden || (ignoreSet && ignoreSet.has(n))) continue;
      const b = npcBox(n);
      if (x1 > b[0] && x0 < b[2] && y1 > b[1] && y0 < b[3]) return true;
    }
    return false;
  }
  /* NPCs already overlapping the player (someone walked into you) never pin you in place */
  const overlapping = () => {
    const p = s.player, x0 = p.x + HB.l, y0 = p.y + HB.t, x1 = p.x + HB.r, y1 = p.y + HB.b, out = new Set();
    for (const id in s.npcs) { const n = s.npcs[id]; if (n.map !== s.mapId || n.hidden) continue; const b = npcBox(n); if (x1 > b[0] && x0 < b[2] && y1 > b[1] && y0 < b[3]) out.add(n); }
    return out.size ? out : null;
  };
  const blockedAt = (px, py, ign) => solidRect(px + HB.l, py + HB.t, px + HB.r, py + HB.b, null, ign);

  function moveAxis(axis, d) {
    if (d === 0) return;
    const p = s.player, sign = Math.sign(d), ign = overlapping();
    let rem = Math.abs(d);
    while (rem > 0) {
      const st = Math.min(0.25, rem);
      const nx = axis === "x" ? p.x + sign * st : p.x;
      const ny = axis === "y" ? p.y + sign * st : p.y;
      if (blockedAt(nx, ny, ign)) break;
      p.x = nx; p.y = ny; rem -= st;
    }
    if (rem <= 0) return;
    const probeX = axis === "x" ? p.x + sign * 0.5 : p.x;
    const probeY = axis === "y" ? p.y + sign * 0.5 : p.y;
    for (let k = 1; k <= 6; k++) {
      for (const side of [1, -1]) {
        const ox = axis === "y" ? side * k : 0, oy = axis === "x" ? side * k : 0;
        if (!blockedAt(probeX + ox, probeY + oy)) {
          const amt = Math.min(Math.abs(d), k);
          const nx = p.x + Math.sign(ox) * amt, ny = p.y + Math.sign(oy) * amt;
          if (!blockedAt(nx, ny)) { p.x = nx; p.y = ny; }
          return;
        }
      }
    }
  }

  /* ---------- camera ---------- */
  function camTarget() {
    const { w, h } = s.view, m = s.map, mapW = m.w * TILE, mapH = m.h * TILE;
    let x, y;
    if (s.stage) {
      const st = s.stage, k = s.t - st.t0;
      x = st.x - w / 2 + (st.panX || 0) * Math.sin(k * 0.18) + (st.driftX || 0) * k;
      y = st.y - h / 2 + (st.panY || 0) * Math.sin(k * 0.13 + 1) + (st.driftY || 0) * k;
    } else if (s.mode === "attract") {
      const t = s.t * 0.035;
      x = (mapW - w) / 2 + Math.sin(t) * Math.max(0, mapW - w) * 0.42;
      y = (mapH - h) / 2 + Math.sin(t * 0.7 + 1) * Math.max(0, mapH - h) * 0.3;
    } else {
      const fc = s.camFocus || s.player;
      x = fc.x - w / 2; y = fc.y - 8 - h / 2;
    }
    x = mapW <= w ? (mapW - w) / 2 : Math.max(0, Math.min(mapW - w, x));
    y = mapH <= h ? (mapH - h) / 2 : Math.max(0, Math.min(mapH - h, y));
    return { x, y };
  }
  function snapCamera() { const c = camTarget(); s.cam.x = c.x; s.cam.y = c.y; }

  /* ---------- NPCs ---------- */
  const tileCenter = (tx, ty) => [tx * TILE + 8, ty * TILE + 12];
  const npcTile = (n) => [Math.floor(n.x / TILE), Math.floor((n.y - 4) / TILE)];

  function findPath(mapId, start, goal) {
    const m = maps[mapId];
    if (!m) return null;
    const [sx, sy] = start, [gx, gy] = goal;
    if (sx === gx && sy === gy) return [];
    const key = (x, y) => y * m.w + x;
    const prev = new Int32Array(m.w * m.h).fill(-1);
    const q = [key(sx, sy)];
    prev[q[0]] = q[0];
    let found = false;
    while (q.length) {
      const k = q.shift();
      const x = k % m.w, y = (k / m.w) | 0;
      if (x === gx && y === gy) { found = true; break; }
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= m.w || ny >= m.h) continue;
        const nk = key(nx, ny);
        if (prev[nk] !== -1) continue;
        if (m.solid[nk]) continue;
        if (m.warpAt.has(`${nx},${ny}`) && !(nx === gx && ny === gy)) continue;
        prev[nk] = k; q.push(nk);
      }
    }
    if (!found) return null;
    const path = [];
    let k = key(gx, gy);
    while (k !== key(sx, sy)) { path.push([k % m.w, (k / m.w) | 0]); k = prev[k]; }
    return path.reverse();
  }

  function exitToward(mapId, target, via) {
    const m = maps[mapId];
    if (via && m.def.outside) return via;
    if (target) { const wp = (m.def.warps || []).find((w) => w.to === target); if (wp) return [wp.x, wp.y]; }
    if (!m.def.outside) { const wp = (m.def.warps || []).find((w) => w.to === "oak"); if (wp) return [wp.x, wp.y]; }
    return null;
  }

  function placeAtAnchor(n, e) {
    n.map = e.map; n.path = null; n.leaving = null; n.wait = 0; n.hidden = false;
    if (e.map) { const [x, y] = tileCenter(e.x, e.y); n.x = x; n.y = y; }
    if (e.via) n.lastVia = e.via;
  }

  function settleNpcs() {
    const hr = hour();
    for (const id in NPC_DEFS) {
      const def = NPC_DEFS[id];
      const e = scheduleAt(def, hr, s.G && s.G.flags);
      let n = s.npcs[id];
      if (!n) n = s.npcs[id] = { id, x: 0, y: 0, dir: "down", anim: 0, path: null, wanderT: 1 + rand() * 3, talking: false };
      n.entry = e; n.talking = false; n.dir = "down";
      placeAtAnchor(n, e);
      if (!n.lastVia) { const v = def.schedule.find((q) => q.via); if (v) n.lastVia = v.via; }
    }
  }

  function onScheduleChange(n, e) {
    const cur = s.mapId, from = n.map;
    if (from === cur && e.map === cur) {
      n.path = findPath(cur, npcTile(n), [e.x, e.y]) || null;
      if (!n.path) placeAtAnchor(n, e);
    } else if (from === cur && e.map !== cur) {
      const ex = exitToward(cur, e.map, e.via);
      const path = ex ? findPath(cur, npcTile(n), ex) : null;
      if (path) { n.path = path; n.leaving = e; } else placeAtAnchor(n, e);
      if (e.via) n.lastVia = e.via;
    } else if (from !== cur && e.map === cur) {
      const ent = from ? exitToward(cur, from, null) : (!maps[cur].def.outside ? exitToward(cur, "oak", null) : n.lastVia || null);
      if (ent) {
        const [x, y] = tileCenter(ent[0], ent[1]);
        n.map = cur; n.x = x; n.y = y; n.dir = "down";
        n.path = findPath(cur, ent, [e.x, e.y]);
        if (!n.path) placeAtAnchor(n, e);
      } else placeAtAnchor(n, e);
    } else {
      placeAtAnchor(n, e);
    }
  }

  function walkNpc(n, dt) {
    const [tx, ty] = n.path[0];
    const [gx, gy] = tileCenter(tx, ty);
    const dx = gx - n.x, dy = gy - n.y, dist = Math.hypot(dx, dy);
    if (dist < 0.6) { n.x = gx; n.y = gy; n.path.shift(); return; }
    n.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up";
    const st = Math.min(dist, NPC_SPEED * dt);
    const nx = n.x + (dx / dist) * st, ny = n.y + (dy / dist) * st;
    const p = s.player;
    const pb = [p.x + HB.l, p.y + HB.t, p.x + HB.r, p.y + HB.b];
    const b = [nx - 6, ny - 5, nx + 6, ny + 2];
    if (s.mode === "play" && b[2] > pb[0] && b[0] < pb[2] && b[3] > pb[1] && b[1] < pb[3]) {
      n.wait = (n.wait || 0) + dt;
      if (n.wait > 3) { n.wait = 0; if (n.leaving) finishLeave(n); else n.path = null; }
      return;
    }
    n.wait = 0;
    n.x = nx; n.y = ny; n.anim += dt * 7;
  }

  function finishLeave(n) {
    const e = n.leaving;
    placeAtAnchor(n, e);
  }

  function updateNpcs(dt) {
    const hr = hour();
    for (const id in NPC_DEFS) {
      const n = s.npcs[id];
      if (!n) continue;
      const e = scheduleAt(NPC_DEFS[id], hr, s.G && s.G.flags);
      if (e !== n.entry) { const old = n.entry; n.entry = e; if (old) onScheduleChange(n, e); }
      if (n.cue) {   // held by a cutscene: walk the scripted path, otherwise stand still
        if (n.map === s.mapId && n.path && n.path.length) walkNpc(n, dt * (n.cueSpeed || 1));
        else { n.path = null; n.anim = 0; if (n.leaving) finishLeave(n); if (n.cueFace) n.dir = n.cueFace; }
        continue;
      }
      if (n.map !== s.mapId || n.talking) continue;
      if (n.path && n.path.length) { walkNpc(n, dt); continue; }
      n.path = null;
      if (n.leaving) { finishLeave(n); continue; }
      n.anim = 0;
      n.wanderT -= dt;
      if (n.wanderT <= 0) {
        n.wanderT = 2.5 + rand() * 4;
        const e2 = n.entry;
        if (!e2 || !e2.map) continue;
        const cur = npcTile(n);
        if (e2.w > 0) {
          for (let tries = 0; tries < 6; tries++) {
            const tx = e2.x + Math.round((rand() * 2 - 1) * e2.w), ty = e2.y + Math.round((rand() * 2 - 1) * e2.w);
            if (tileSolid(tx, ty) || s.map.warpAt.has(`${tx},${ty}`)) continue;
            const path = findPath(s.mapId, cur, [tx, ty]);
            if (path && path.length <= e2.w * 3) { n.path = path; break; }
          }
        } else if (cur[0] !== e2.x || cur[1] !== e2.y) {
          n.path = findPath(s.mapId, cur, [e2.x, e2.y]);
        } else if (rand() < 0.4) {
          n.dir = pick(["down", "left", "right"], rand);
        }
      }
    }
  }

  /* ---------- interaction ---------- */
  function npcNear(px, py) {
    for (const id in s.npcs) {
      const n = s.npcs[id];
      if (n.map !== s.mapId || n.hidden) continue;
      if (Math.abs(px - n.x) < 9 && py > n.y - 14 && py < n.y + 6) return n;
    }
    return null;
  }
  function findTarget() {
    const p = s.player, [vx, vy] = DIR_VEC[p.dir], m = s.map;
    const px = p.x + vx * 11, py = p.y - 2 + vy * 11;
    const n = npcNear(px, py);
    if (n) return { kind: "npc", id: n.id, x: n.x, y: n.y - 44 };
    const tx = Math.floor(px / TILE), ty = Math.floor(py / TILE);
    const c = m.at(tx, ty);
    const prop = m.propAt.get(`${tx},${ty}`);
    const mark = (o, x, y) => ({ ...o, x, y });
    if (prop) {
      const top = prop.y * TILE + (prop.def.dy || 0) - 2;
      const midX = (prop.x + prop.def.fw / 2) * TILE;
      if (prop.station) return mark({ kind: "station" }, midX, top);
      if (prop.p === "bed") return mark({ kind: "bed", id: prop.id }, midX, top);
      const lk = prop.lk || prop.def.look;
      // a decoration hung on the back wall above this furniture is described along with it
      let also = null;
      if (p.dir === "up" && !prop.def.wall) for (let i = 0; i < prop.def.fw && !also; i++) {
        const q = m.propAt.get(`${prop.x + i},${prop.y - 2}`);
        if (q && q.def.wall && (q.lk || q.def.look) && q.def.look !== "mirror") also = (q.lk || q.def.look) + (q.v ? ":" + q.v : "");
        const b = m.propAt.get(`${prop.x + i},${prop.y - 1}`);   // or something stood behind it, out of reach
        if (!also && b && b !== prop && !b.def.wall && (b.lk || b.def.look) && (b.lk || b.def.look) !== lk && !b.id) also = "~" + ((b.lk || b.def.look) === "shelf" ? "shelf" + (b.v || 0) : (b.lk || b.def.look));
      }
      if (lk) return mark({ kind: "look", key: lk === "shelf" ? "shelf" + (prop.v || 0) : lk + (prop.id ? ":" + prop.id : ""), also }, midX, top);
      if (also) return mark({ kind: "look", key: also }, midX, top);
    }
    if (!prop && p.dir === "up") {   // decorations hung on a back wall sit one row behind the wall face
      const wall = (x) => { const q = m.propAt.get(`${x},${ty - 1}`); return q && q.def.wall && (q.lk || q.def.look) ? q : null; };
      const wp = wall(tx) || (!m.propAt.get(`${tx},${ty - 1}`) && (wall(tx - 1) || wall(tx + 1)));
      if (wp && wp.def.wall && (wp.lk || wp.def.look)) {
        const lk = wp.lk || wp.def.look;
        return mark({ kind: "look", key: lk === "shelf" ? "shelf" + (wp.v || 0) : lk + (wp.id ? ":" + wp.id : "") }, (wp.x + wp.def.fw / 2) * TILE, wp.y * TILE + (wp.def.dy || 0) - 2);
      }
    }
    if (c === "K") {
      const n2 = npcNear(px + vx * 16, py + vy * 16);
      if (n2) return { kind: "npc", id: n2.id, x: n2.x, y: n2.y - 44 };
    }
    if (c === "D" && !m.warpAt.has(`${tx},${ty}`)) return { kind: "look", key: "door", x: tx * TILE + 8, y: ty * TILE - 4 };
    if (c === "S") return { kind: "sign", key: `${tx},${ty}`, x: tx * TILE + 8, y: ty * TILE - 4 };
    if (c === "P") return { kind: "look", key: "pillar", x: m.def.pillar.x, y: 18 * TILE - 50 };
    if (c === "Z") return { kind: "look", key: "barricade", x: tx * TILE + 8, y: ty * TILE - 2 };
    if (c === "c") {
      if (s.G && TRADES[s.G.trade].fieldStation) return { kind: "station", x: tx * TILE + 8, y: ty * TILE - 2 };
      return { kind: "look", key: "crops", x: tx * TILE + 8, y: ty * TILE - 2 };
    }
    return null;
  }

  /* ---------- warps and fades ---------- */

  /* ---------- wild beasts: roam outside the pillar, chase, and start a battle on contact ---------- */
  let wolfArt = null;
  function worldWolf(tint, big) {
    if (!wolfArt) wolfArt = {};
    const k = tint + "_" + big;
    if (wolfArt[k]) return wolfArt[k];
    const sc = big ? 0.7 : 0.55, out = { l: [], r: [] };
    [drawWolf(0, {}), drawWolf(1, { growl: true })].forEach((c) => {
      const w = Math.round(c.width * sc), h = Math.round(c.height * sc);
      const a = makeCanvas(w, h), ax = a.getContext("2d"); ax.imageSmoothingEnabled = false; ax.drawImage(c, 0, 0, w, h);
      const b = makeCanvas(w, h), bx = b.getContext("2d"); bx.translate(w, 0); bx.scale(-1, 1); bx.drawImage(a, 0, 0);
      out.l.push(a); out.r.push(b);
    });
    wolfArt[k] = out; return out;
  }
  const foeWorldCache = new Map();
  function worldFoe(src, sc, flip) {
    let m = foeWorldCache.get(src); if (!m) { m = {}; foeWorldCache.set(src, m); }
    const k = sc + (flip ? "r" : "l"); if (m[k]) return m[k];
    const w = Math.max(1, Math.round(src.width * sc)), h = Math.max(1, Math.round(src.height * sc)), c = makeCanvas(w, h), x = c.getContext("2d"); x.imageSmoothingEnabled = false;
    if (flip) { x.translate(w, 0); x.scale(-1, 1); } x.drawImage(src, 0, 0, w, h); m[k] = c; return c;
  }
  const inPillar = (x, y, pad = 0) => { const pl = s.map && s.map.def.pillar; return !!pl && Math.hypot(x - pl.x, y - (pl.y - 8)) < pl.r * TILE + pad; };
  function spawnWolves() {
    s.wolves = []; s.encounter = null; spawnCritters();
    const wd = s.map && s.map.def.wild;
    if (!wd || !s.G || s.G.flags.__nowild || (s.G.flags && s.G.flags.d4_fire && !s.G.flags.d4_lost)) return;
    s.G.slain = s.G.slain || {};
    const night = isNightT(s.G.time);
    const all = [...wd, ...((night && s.map.def.wildNight) || [])];
    all.forEach((g, i) => {
      const key = s.mapId + ":" + i;
      if (s.G.slain[key] === s.G.day) return;
      s.wolves.push({ key, group: g.group, x: g.x * TILE + 8, y: g.y * TILE + 8, hx: g.x * TILE + 8, hy: g.y * TILE + 8, dir: "left", anim: Math.random() * 6, tx: null, ty: null, wt: Math.random() * 2, stun: 0, alert: 0, chase: false, root: g.group.some((k) => BTL_FOES[k] && BTL_FOES[k].rooted), big: g.group.some((k) => BTL_FOES[k] && BTL_FOES[k].boss) });
    });
  }
  function wolfMove(w, dx, dy) {
    const old = [s.player.x, s.player.y];
    // reuse the player's collision probe at the wolf's position
    const ok = (x, y) => !blockedAt(x, y) && !inPillar(x, y, 12);
    if (ok(w.x + dx, w.y + dy)) { w.x += dx; w.y += dy; return true; }
    if (dx && ok(w.x + dx, w.y)) { w.x += dx; return true; }
    if (dy && ok(w.x, w.y + dy)) { w.y += dy; return true; }
    return false;
  }
  /* ---------- ambient wildlife: harmless, wanders, bolts when you get close ---------- */
  const CRIT_KINDS = { deer: { n: 3, sc: 1.05, walk: 12, run: 52, spook: 62 }, hare: { n: 6, sc: 1.15, walk: 9, run: 60, spook: 48 }, grouse: { n: 4, sc: 1.15, walk: 8, run: 58, spook: 44 }, fox: { n: 2, sc: 1.05, walk: 13, run: 56, spook: 70 } };
  function spawnCritters() {
    s.critters = [];
    const def = s.map && s.map.def; if (!def || def.id === undefined && !def.wild_zone || !def.wild_zone || def.terrain === "rock") return;
    const H = def.rows.length, W = def.rows[0].length; let seed = 7 + (s.G ? s.G.day || 0 : 0) * 31; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (const k of Object.keys(CRIT_KINDS)) for (let i = 0, tries = 0; i < CRIT_KINDS[k].n && tries < 200; tries++) {
      const x = (3 + rnd() * (W - 6)) * TILE, y = (3 + rnd() * (H - 6)) * TILE;
      if (blockedAt(x, y) || inPillar(x, y, 40) || Math.hypot(x - s.player.x, y - s.player.y) < 70) continue;
      i++; s.critters.push({ k, x, y, dir: 2 + (rnd() < 0.5 ? 1 : 0), anim: rnd() * 8, tx: null, ty: null, wt: rnd() * 3, flee: 0, fdx: 0, fdy: 0 });
    }
  }
  function critMove(c, dx, dy) {
    const ok = (x, y) => !blockedAt(x, y) && !inPillar(x, y, 12);
    if (ok(c.x + dx, c.y + dy)) { c.x += dx; c.y += dy; return true; }
    if (dx && ok(c.x + dx, c.y)) { c.x += dx; return true; }
    if (dy && ok(c.x, c.y + dy)) { c.y += dy; return true; }
    return false;
  }
  function updateCritters(dt) {
    if (!s.critters.length || s.mode !== "play") return;
    const p = s.player;
    for (const c of s.critters) {
      const K = CRIT_KINDS[c.k], dx = c.x - p.x, dy = c.y - p.y, d = Math.hypot(dx, dy) || 1;
      if (d < K.spook && !(c.flee > 0)) { c.flee = 2.2; c.fdx = dx / d; c.fdy = dy / d; }
      if (c.flee > 0) {
        c.flee -= dt; c.anim += dt * 11;
        if (!critMove(c, c.fdx * K.run * dt, c.fdy * K.run * dt)) { c.fdx = -c.fdy; c.fdy = c.fdx * 0 + (c.fdx > 0 ? 0.4 : -0.4); }
        c.dir = Math.abs(c.fdx) > Math.abs(c.fdy) ? (c.fdx > 0 ? 3 : 2) : (c.fdy > 0 ? 0 : 1);
        c.moving = true; c.running = true; continue;
      }
      c.running = false; c.wt -= dt; c.anim += dt * (c.moving ? 7 : 2.5);
      if (c.wt <= 0) {
        c.wt = 2 + Math.random() * 5;
        if (Math.random() < 0.55) { const a = Math.random() * 6.28, r = 10 + Math.random() * 30; c.tx = c.x + Math.cos(a) * r; c.ty = c.y + Math.sin(a) * r * 0.7; } else { c.tx = null; c.moving = false; }
      }
      if (c.tx !== null) {
        const ex = c.tx - c.x, ey = c.ty - c.y, ed = Math.hypot(ex, ey);
        if (ed > 2) { c.moving = critMove(c, (ex / ed) * K.walk * dt, (ey / ed) * K.walk * dt); c.dir = Math.abs(ex) > Math.abs(ey) ? (ex > 0 ? 3 : 2) : (ey > 0 ? 0 : 1); } else { c.tx = null; c.moving = false; }
      }
    }
  }
  function updateWolves(dt) {
    updateCritters(dt);
    if (!s.wolves.length || s.mode !== "play") return;
    const p = s.player, safe = inPillar(p.x, p.y) || (!s.map.def.outside && !s.map.def.cave);
    const busy = s.blocked || !!s.fade || !!s.encounter;
    for (const w of s.wolves) {
      w.anim += dt * (w.chase ? 9 : 3);
      if (w.stun > 0) { w.stun -= dt; w.chase = false; const dx = w.hx - w.x, dy = w.hy - w.y, d = Math.hypot(dx, dy); if (d > 3) { wolfMove(w, (dx / d) * 24 * dt, (dy / d) * 24 * dt); w.dir = dx > 0 ? "right" : "left"; } continue; }
      const dx = p.x - w.x, dy = p.y - w.y, d = Math.hypot(dx, dy);
      if (!busy && !safe && d < 78) {
        if (!w.chase) { w.chase = true; w.alert = 0.55; }
      } else if (w.chase && (safe || d > 150)) w.chase = false;
      if (w.chase) {
        if (w.alert > 0) { w.alert -= dt; w.dir = dx > 0 ? "right" : "left"; }
        else if (!busy && !w.root) {
          const sp = (w.big ? 46 : 54) * dt;
          wolfMove(w, (dx / d) * sp, (dy / d) * sp); w.dir = dx > 0 ? "right" : "left";
        }
        if (!busy && !safe && d < 13 && w.alert <= 0) {
          s.encounter = w; w.chase = false;
          if (hooks.onEncounter) hooks.onEncounter({ key: w.key, foes: w.group, boss: w.big, wild: !inPillar(w.x, w.y, 40) });
        }
      } else {
        w.wt -= dt;
        if (w.wt <= 0) { w.wt = 2 + Math.random() * 3; const a = Math.random() * 6.28, r = Math.random() * 36; w.tx = w.hx + Math.cos(a) * r; w.ty = w.hy + Math.sin(a) * r * 0.6; if (Math.random() < 0.3) w.tx = null; }
        if (w.tx !== null) { const ex = w.tx - w.x, ey = w.ty - w.y, ed = Math.hypot(ex, ey); if (ed > 2) { wolfMove(w, (ex / ed) * 14 * dt, (ey / ed) * 14 * dt); w.dir = ex > 0 ? "right" : "left"; } }
      }
    }
  }

  function loadMap(id, tx, ty, dir) {
    s.mapId = id; s.map = maps[id];
    const [x, y] = tileCenter(tx, ty);
    s.player.x = x; s.player.y = y; s.player.dir = dir || "down"; s.player.moving = false;
    settleNpcs();
    spawnWolves();
    snapCamera();
    if (s.G) { s.G.map = id; s.G.x = x; s.G.y = y; s.G.dir = s.player.dir; }
    if (hooks.onMapChange) hooks.onMapChange(id);
  }
  function fadeTo(cb, dur = 0.22) { s.fade = { t: 0, dur, phase: "out", cb }; }

  /* ---------- update ---------- */
  function update(dt) {
    s.t += dt;
    if (s.shakeT > 0) s.shakeT -= dt;
    for (const em of s.emotes) em.t += dt;
    if (s.emotes.length) s.emotes = s.emotes.filter((em) => em.t < em.dur);
    if (s.fade) {
      s.fade.t += dt;
      if (s.fade.t >= s.fade.dur) {
        if (s.fade.phase === "out") { const cb = s.fade.cb; s.fade = { t: 0, dur: s.fade.dur, phase: "in" }; if (cb) cb(); }
        else s.fade = null;
      }
    }
    const busy = s.blocked || !!s.fade || s.mode !== "play";
    if (s.mode === "play" && !busy) {
      if (s.G.party && s.G.party.wren) {   // breath returns slowly while you walk
        s.breathT += dt;
        if (s.breathT > 9) { s.breathT = 0; for (const id in s.G.party) { const m = s.G.party[id], mx = btlStatsFor(s.G, id, m.lv).mp; if (m.mp < mx) m.mp++; } }
        // indoors or under the Pillar's calm, wounds knit: a few HP every couple of seconds
        s.healT = (s.healT || 0) + dt;
        if (s.healT > 2) { s.healT = 0; const safe = (!s.map.def.outside && !s.map.def.cave) || inPillar(s.player.x, s.player.y); if (safe) for (const id in s.G.party) { const m = s.G.party[id], mx = btlStatsFor(s.G, id, m.lv).hp; if (m.hp < mx) m.hp = Math.min(mx, m.hp + Math.max(1, Math.round(mx * 0.04))); } }
      }
    }
    const p = s.player;
    if (s.mode === "play") {
      let ix = 0, iy = 0;
      const k = input.keys;
      if (k.has("ArrowLeft") || k.has("a")) ix -= 1;
      if (k.has("ArrowRight") || k.has("d")) ix += 1;
      if (k.has("ArrowUp") || k.has("w")) iy -= 1;
      if (k.has("ArrowDown") || k.has("s")) iy += 1;
      ix += input.jx; iy += input.jy;
      let mag = Math.hypot(ix, iy);
      if (mag > 1) { ix /= mag; iy /= mag; mag = 1; }
      if (busy || mag < 0.15) mag = 0;
      p.moving = mag > 0;
      if (p.moving) {
        const ax = Math.abs(ix), ay = Math.abs(iy);
        const horiz = p.dir === "left" || p.dir === "right";
        if (ax > ay * (horiz ? 0.8 : 1.25)) p.dir = ix > 0 ? "right" : "left";
        else p.dir = iy > 0 ? "down" : "up";
        const len = Math.hypot(ix, iy), spd = SPEED * mag;
        moveAxis("x", (ix / len) * spd * dt);
        moveAxis("y", (iy / len) * spd * dt);
        p.anim += dt * 8 * Math.max(0.6, mag);
        const wp = s.map.warpAt.get(`${Math.floor(p.x / TILE)},${Math.floor(p.y / TILE)}`);
        if (wp && s.mapId === "shop" && s.G && !s.G.flags.wardrobe_done && !s.fade) {   // the first time out of the door: not before the mirror
          p.y = (wp.y - 1) * TILE + 12; p.moving = false; hooks.onWarpBlocked && hooks.onWarpBlocked();
        } else if (wp && !s.fade) {
          fadeTo(() => { loadMap(wp.to, wp.tx, wp.ty, wp.dir); hooks.onEnterMap && hooks.onEnterMap(wp.to); });
        }
      } else p.anim = 0;
      // cutscene: the player walks where the scene puts them
      if (p.cuePath && p.cuePath.length) {
        const [tx, ty] = p.cuePath[0], gx = tx * TILE + 8, gy = ty * TILE + 12, dx = gx - p.x, dy = gy - p.y, d = Math.hypot(dx, dy);
        if (d < 0.8) { p.x = gx; p.y = gy; p.cuePath.shift(); if (!p.cuePath.length && p.cueFace) p.dir = p.cueFace; }
        else { const st = Math.min(d, SPEED * (p.cueSpeed || 0.8) * dt); if (!p.cueBack) p.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up"; p.x += (dx / d) * st; p.y += (dy / d) * st; p.moving = !p.cueBack; p.anim += dt * 8; }
      }
      s.target = busy ? null : findTarget();
      const tk = s.target ? s.target.kind + ":" + (s.target.key || s.target.id || "") : "";
      if (tk !== s.targetKey) { s.targetKey = tk; hooks.onTarget && hooks.onTarget(s.target); }
    }
    updateNpcs(dt);
    updateWolves(dt);

    const c = camTarget(), lerp = s.mode === "attract" ? 1 : 1 - Math.exp(-dt * 10);
    s.cam.x += (c.x - s.cam.x) * lerp;
    s.cam.y += (c.y - s.cam.y) * lerp;

    if (s.fireSpots && s.mapId === "oak" && s.fireSpots.length) {
      // smoke billows from roofs near the player
      if (Math.random() < 0.55) {
        const sp = s.fireSpots[(Math.random() * s.fireSpots.length) | 0];
        if (Math.abs(sp[0] - s.player.x) < 260 && Math.abs(sp[1] - s.player.y) < 190) s.smoke.push({ x: sp[0] + (Math.random() - 0.5) * 8, y: sp[1] - 14, vx: 6 + Math.random() * 6, vy: -10 - Math.random() * 8, r: 3 + Math.random() * 3, life: 3 + Math.random() * 2, max: 5, c: Math.random() < 0.5 ? "#4a3a36" : "#5e4a42" });
      }
      // now and then a roof gives way: a flare of sparks
      s.flareT = (s.flareT || 0) - dt;
      if (s.flareT <= 0) {
        s.flareT = 1.2 + Math.random() * 2.5;
        const sp = s.fireSpots[(Math.random() * s.fireSpots.length) | 0];
        if (Math.abs(sp[0] - s.player.x) < 200 && Math.abs(sp[1] - s.player.y) < 140) for (let i = 0; i < 26; i++) { const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2, v = 30 + Math.random() * 50; s.particles.push({ x: sp[0], y: sp[1] - 6, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.8 + Math.random() * 0.8, max: 1.6, size: Math.random() < 0.4 ? 2 : 1, c: i % 3 ? PAL.fireL : "#fff3c0" }); }
      }
      for (let k = 0; k < 4; k++) if (Math.random() < 0.8) {
        const sp = s.fireSpots[(Math.random() * s.fireSpots.length) | 0];
        if (Math.abs(sp[0] - s.player.x) < 220 && Math.abs(sp[1] - s.player.y) < 160) s.particles.push({ x: sp[0] + (Math.random() - 0.5) * 12, y: sp[1], vx: (Math.random() - 0.4) * 16, vy: -20 - Math.random() * 30, life: 1.1 + Math.random() * 0.8, max: 1.9, size: Math.random() < 0.3 ? 2 : 1, c: Math.random() < 0.5 ? PAL.fireL : PAL.ember });
      }
    }
    for (const sm of s.smoke) { sm.x += sm.vx * dt; sm.y += sm.vy * dt; sm.r += dt * 3.2; sm.life -= dt; }
    if (s.smoke.length) s.smoke = s.smoke.filter((sm) => sm.life > 0);
    for (const pt of s.particles) { pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.vy -= 30 * dt; pt.vx *= 0.96; pt.life -= dt; }
    s.particles = s.particles.filter((pt) => pt.life > 0);

    s.hudTimer -= dt;
    if (s.hudTimer <= 0) { s.hudTimer = 0.1; updateHud(); }
  }

  function leylineReading() {
    const m = s.map;
    if (!m.def.outside) return { wild: false, value: 0.3, label: "Calm, indoors" };
    const p = s.player, pl = m.def.pillar;
    if (!pl) {   // deep wood: no Pillar for miles, and the leyline surges like a struck flint
      const surge = Math.sin(s.t * 3.1) * Math.sin(s.t * 1.3) * 0.2;
      return { wild: true, value: Math.max(0.45, Math.min(1, 0.78 + surge)), label: "Wild, surging" };
    }
    const d = Math.hypot(p.x - pl.x, p.y - pl.y) / TILE;
    if (d <= pl.r) return { wild: false, value: 0.32 + Math.sin(s.t * 2) * 0.03, label: "Calm, under the Pillar" };
    const base = Math.min(1, 0.5 + ((d - pl.r) / 8) * 0.5);
    const surge = Math.sin(s.t * 7.1) * Math.sin(s.t * 2.3) * 0.12;
    return { wild: true, value: Math.max(0.3, Math.min(1, base + surge)), label: "Wild, unregulated" };
  }

  function updateHud() {
    const h = hooks.hud && hooks.hud();
    if (!h || s.mode !== "play") return;
    const G = s.G, r = leylineReading();
    const set = (el, txt) => { if (el && el.textContent !== txt) el.textContent = txt; };
    set(h.place, fillText(s.map.def.name, buildVars(G)));
    set(h.time, `Day ${G.day} · ${isNightT(G.time) ? "Night" : "Day"}`);
    set(h.coins, `${G.coins} coppers`);
    set(h.ley, r.label);
    if (h.bar) { h.bar.style.width = Math.round(r.value * 100) + "%"; h.bar.dataset.wild = r.wild ? "1" : "0"; }
    set(h.fps, s.settings.fps ? `${s.fps} fps · ${s.view.w}×${s.view.h} @${s.view.scale}x` : "");
  }

  /* ---------- render ---------- */
  function render() {
    const { w, h } = s.view, m = s.map;
    ctx.setTransform(WZ, 0, 0, WZ, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = PAL.ink;
    ctx.fillRect(0, 0, w, h);
    let cx = Math.round(s.cam.x), cy = Math.round(s.cam.y);
    if (s.shakeT > 0) { cx += Math.round((Math.random() - 0.5) * s.shakeA * 2); cy += Math.round((Math.random() - 0.5) * s.shakeA); }
    const tx0 = Math.max(0, Math.floor(cx / TILE)), ty0 = Math.max(0, Math.floor(cy / TILE));
    const tx1 = Math.min(m.w - 1, Math.floor((cx + w) / TILE)), ty1 = Math.min(m.h - 1, Math.floor((cy + h) / TILE));
    const tmin = s.mode === "attract" ? s.attractTime : s.G.time;
    const night = m.def.dark ? 1 : s.mode === "attract" ? nightAmount(tmin) : (isNightT(tmin) ? 1 : 0);
    const wf = Math.floor(s.t * 1.6) % 2, ff = Math.floor(s.t * 6) % 2;
    if (m.base) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(m.base, -cx * WZ, -cy * WZ);
      // a slow shimmer on the water: short pale streaks drifting along each tile
      if (m.water && m.water.length) {
        ctx.fillStyle = "#56646a";
        for (let i = 0; i < m.water.length; i += 2) {
          const tx = m.water[i], ty = m.water[i + 1];
          if (tx * TILE + TILE < cx || tx * TILE > cx + w || ty * TILE + TILE < cy || ty * TILE > cy + h) continue;
          for (let k = 0; k < 2; k++) {
            const seed = hash2(tx * 7 + k, ty * 13), ph = (s.t * (0.6 + (seed % 5) * 0.12) + (seed % 100) / 25) % 4;
            if (ph > 2.6) continue;
            const sx = Math.round((tx * TILE - cx) * WZ + ((seed >> 3) % 22) + ph * 3), sy = Math.round((ty * TILE - cy) * WZ + ((seed >> 7) % 26) + 3);
            ctx.globalAlpha = Math.sin((ph / 2.6) * Math.PI) * 0.6;
            ctx.fillRect(sx, sy, 4 + (seed % 3), 1);
          }
        }
        ctx.globalAlpha = 1;
      }
      ctx.setTransform(WZ, 0, 0, WZ, 0, 0);
    } else {
      for (let ty = ty0; ty <= ty1; ty++) {
        const row = m.keys[ty];
        for (let tx = tx0; tx <= tx1; tx++) {
          const k = row[tx];
          const img = Array.isArray(k) ? k[wf] : k.win ? (night > 0.45 ? k.n : k.d) : k;
          ctx.drawImage(img, tx * TILE - cx, ty * TILE - cy);
        }
      }
      for (const d of m.decals) ctx.drawImage(d.frames ? d.frames[ff] : d.img, d.x - cx, d.y - cy);
    }

    const ents = [];
    const p = s.player;
    const pushChar = (look, dir, moving, anim, x, y, sheetFr, ent) => {
      const set = chibiFor(look);
      if (ent && !ent.keep) { if (dir === "left" || dir === "right") ent.face = dir; const vm = (typeof window !== "undefined" && window.__sideView !== undefined) ? window.__sideView : 4;
        if (vm === 4) { if (moving) ent.lastMv = s.t; if (dir === "up" && (moving || (ent.lastMv !== undefined && s.t - ent.lastMv < 0.14))) { dir = ent.face || "right"; moving = true; } }   // walking toward the camera is animated, walking away is drawn side-on, and everyone stays facing the way they last walked
        else if (vm) { if (moving) ent.lastMv = s.t; const idle = !(ent.lastMv !== undefined && s.t - ent.lastMv < 0.14);
          if (moving || !idle) { if (dir === "up" || dir === "down") dir = ent.face || "right"; moving = true; }
          else if (vm === 3) dir = "down"; } }
      if (set && set.noBack && dir === "up") dir = (ent && ent.face) || "right";
      if (set) { const f = chibiFrame(set, dir, moving, anim, s.t), sc = worldChibi(ent && ent.child ? childChibi(f.img) : f.img); ents.push({ chibi: true, img: sc, ax: Math.round(f.anchor[0] * WORLD_CHIBI_K), ay: Math.round(f.anchor[1] * WORLD_CHIBI_K), x, y, sortY: y }); }
      else ents.push({ img: getSheet(look)[dir][sheetFr], x: Math.round(x - 8), y: Math.round(y - 24), sortY: y, old: true });
    };
    if (s.mode === "play") pushChar(s.G.look, p.dir, p.moving, p.anim, p.x, p.y, p.moving ? Math.floor(p.anim) % 4 : 0, p);
    if (s.stage) for (const a of s.stage.actors || []) {
      const k = s.t - s.stage.t0;
      let x = a.x, y = a.y, mv = false, dir = a.dir || "down";
      if (a.walk) {   // walk from (x,y) to (tx,ty) after a delay, then stop
        const d = Math.hypot(a.walk.tx - a.x, a.walk.ty - a.y), u = Math.max(0, Math.min(d, (k - (a.walk.delay || 0)) * (a.walk.speed || 18)));
        x = a.x + ((a.walk.tx - a.x) * u) / (d || 1); y = a.y + ((a.walk.ty - a.y) * u) / (d || 1);
        mv = u > 0 && u < d; if (mv) dir = a.walk.tx >= a.x ? "right" : "left"; else if (u >= d) dir = a.walk.end || "down";
      }
      a.anim = (a.anim || 0) + (mv ? 0.14 : 0);
      if (a.hop) y -= Math.round(Math.max(0, Math.sin(k * 7 + a.hop * 2.3)) * 2.5);
      if (a.look) pushChar(a.look, dir, mv, a.anim, x, y, 0, a);
    }
    if (!s.stage) for (const id in s.npcs) {
      const n = s.npcs[id];
      if (n.map !== s.mapId || n.hidden) continue;
      const look = { ...(s.looks[id] || npcLookFor(id, s.G)), chibi: (npcLookFor(id, s.G) || {}).chibi };
      const mv = !!(n.path && n.path.length);
      pushChar(look, n.dir, mv, n.anim, n.x, n.y, mv ? Math.floor(n.anim) % 4 : 0, n);
    }
    for (const c of s.critters) {
      if (c.x < cx - 40 || c.x > cx + w + 40 || c.y < cy - 40 || c.y > cy + h + 40) continue;
      const fa = CRIT_FR[c.k]; if (!fa) continue;
      const arr = fa[(c.running ? "r" : c.moving ? "w" : "i") + c.dir]; if (!arr) continue;
      const K = CRIT_KINDS[c.k], img = worldFoe(arr[Math.floor(c.anim) % arr.length], K.sc, false);
      ents.push({ chibi: true, img, ax: Math.round(img.width / 2), ay: img.height - 1, x: c.x, y: c.y, sortY: c.y });
    }
    const w_ = w, h_ = h;
    for (const w of s.wolves) {
      if (w.x < cx - 40 || w.x > cx + w_ + 40 || w.y < cy - 40 || w.y > cy + h_ + 40) continue;
      const fa = FOE_FR[(BTL_FOES[w.group[0]] || {}).art];
      if (fa) {
        const kind = w.chase && w.alert <= 0 ? "attack" : "idle", arr = fa[kind], f0 = arr[Math.floor(w.anim * (w.chase ? 1.5 : 0.8)) % arr.length], sc = ((BTL_FOES[w.group[0]].art || "").indexOf("wolf") === 0 ? 0.65 : fa.h > 50 ? 0.5 : 0.62) * (w.root ? 2.3 : w.big ? 1.25 : 1);
        const wc = worldFoe(f0, sc, w.dir === "right"), bob = w.chase ? Math.abs(Math.sin(w.anim)) * 1.2 : 0;
        ents.push({ chibi: true, img: wc, ax: Math.round(wc.width / 2), ay: wc.height - 2 + Math.round(bob), x: w.x, y: w.y, sortY: w.y, wolf: w });
        continue;
      }
      const art_ = worldWolf(0, w.big), fr = (w.dir === "right" ? art_.r : art_.l)[w.chase && w.alert <= 0 && Math.floor(w.anim) % 2 ? 1 : 0];
      const bob = w.chase ? Math.abs(Math.sin(w.anim)) * 1.5 : 0;
      ents.push({ chibi: true, img: fr, ax: Math.round(fr.width / 2), ay: fr.height - 2 + Math.round(bob), x: w.x, y: w.y, sortY: w.y, wolf: w });
    }
    for (const e of ents) {
      if (e.old) ctx.drawImage(art.shadow, e.x + 1 - cx, e.y + 21 - cy);
      else ctx.drawImage(art.shadow, Math.round(e.x - 10 - cx), Math.round(e.y - 4 - cy), 20, 7);
    }

    const list = [];
    for (const t of m.talls) {
      const img = t.frames ? t.frames[ff] : t.lit ? t.lit[night > 0.15 ? 1 : 0] : t.img;
      const iw = t.hi ? img.width / WZ : img.width, ih = t.hi ? img.height / WZ : img.height;
      if (t.x + iw < cx || t.x > cx + w || t.y + ih < cy || t.y > cy + h) continue;
      list.push({ img, x: t.x, y: t.y, sortY: t.sortY, hi: t.hi });
    }
    list.push(...ents);
    list.sort((a, b) => a.sortY - b.sortY);
    for (const o of list) {
      if (o.chibi) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(o.img, Math.round((o.x - cx) * WZ - o.ax), Math.round((o.y - cy) * WZ + 1 - o.ay));
        ctx.setTransform(WZ, 0, 0, WZ, 0, 0);
      } else if (o.hi) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(o.img, Math.round((o.x - cx) * WZ), Math.round((o.y - cy) * WZ));
        ctx.setTransform(WZ, 0, 0, WZ, 0, 0);
      } else ctx.drawImage(o.img, o.x - cx, o.y - cy);
    }
    if (s.scan) {
      const k = (s.t - s.scan.t0) / 1.4;
      if (k > 1.4) s.scan = null;
      else {
        const r = Math.min(1, k) * 150;
        ctx.strokeStyle = PAL.leyL; ctx.globalAlpha = Math.max(0, 1 - k / 1.4) * 0.8; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(Math.round(s.scan.x - cx), Math.round(s.scan.y - cy - 4), r, r * 0.7, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(Math.round(s.scan.x - cx), Math.round(s.scan.y - cy - 4), r * 0.7, r * 0.5, 0, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
      }
    }
    for (const w of s.wolves) if (w.seen > s.t) {   // sensed through the weave: a pulse on the beast
      const px = Math.round(w.x - cx), py = Math.round(w.y - cy), pr = 8 + Math.sin(s.t * 6) * 1.5;
      ctx.strokeStyle = "#e4503c"; ctx.globalAlpha = Math.min(1, (w.seen - s.t) / 2); ctx.beginPath(); ctx.ellipse(px, py - 8, pr, pr * 0.7, 0, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
      ctx.fillStyle = "#e4503c"; ctx.fillRect(px - 1, py - 30, 2, 5); ctx.fillRect(px - 1, py - 23, 2, 2);
    }
    for (const w of s.wolves) if (w.alert > 0) { ctx.fillStyle = "#e4503c"; ctx.fillRect(Math.round(w.x - cx) - 1, Math.round(w.y - cy) - 34, 2, 6); ctx.fillRect(Math.round(w.x - cx) - 1, Math.round(w.y - cy) - 26, 2, 2); }

    if (m.def.pillar) {
      const pl = m.def.pillar;
      for (let i = 0; i < 12; i++) {
        const ph = (s.t * 0.35 + i / 12) % 1;
        const mx = pl.x + Math.sin(i * 12.9) * 14 + Math.sin(s.t * 1.3 + i) * 2;
        const my = 18 * TILE - 6 - ph * 46;
        ctx.globalAlpha = Math.sin(ph * Math.PI);
        ctx.fillStyle = i % 3 ? PAL.ley : PAL.leyL;
        ctx.fillRect(Math.round(mx - cx), Math.round(my - cy), 1, 1);
      }
      ctx.globalAlpha = 1;
    }
    for (const pt of s.particles) {
      ctx.globalAlpha = Math.min(1, (pt.life / pt.max) * 1.5);
      ctx.fillStyle = pt.c;
      ctx.fillRect(Math.round(pt.x - cx), Math.round(pt.y - cy), pt.size, pt.size);
    }
    ctx.globalAlpha = 1;

    renderLight(cx, cy, night);
    if (s.stage && s.stage.fx) { ctx.save(); s.stage.fx(ctx, s.t - s.stage.t0, cx, cy, w, h); ctx.restore(); }
    if (s.fireSpots && s.mapId === "oak") drawFire(cx, cy, w, h);
    if (s.emotes.length) drawEmotes(cx, cy);
    if (s.fireSpots && s.mapId === "oak") { ctx.globalAlpha = 0.12 + 0.04 * Math.sin(s.t * 9) + 0.03 * Math.sin(s.t * 23); ctx.fillStyle = "#d2501c"; ctx.fillRect(0, 0, w, h); ctx.globalAlpha = 1; }

    grade(w, h);

    if (s.target && s.mode === "play" && !s.blocked && !s.fade) {
      const bob = Math.round(Math.sin(s.t * 6) * 1.5);
      ctx.drawImage(art.prompt, Math.round(s.target.x - 5 - cx), Math.round(s.target.y - 12 + bob - cy));
    }

    if (s.settings.debug && s.mode === "play") {
      ctx.fillStyle = "rgba(214,90,106,0.35)";
      for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) if (tileSolid(tx, ty)) ctx.fillRect(tx * TILE - cx, ty * TILE - cy, TILE, TILE);
      ctx.fillStyle = "rgba(122,224,212,0.4)";
      for (const wp of m.def.warps || []) ctx.fillRect(wp.x * TILE - cx, wp.y * TILE - cy, TILE, TILE);
      ctx.strokeStyle = PAL.flowerY; ctx.lineWidth = 1;
      ctx.strokeRect(Math.round(p.x + HB.l - cx) + 0.5, Math.round(p.y + HB.t - cy) + 0.5, HB.r - HB.l - 1, HB.b - HB.t - 1);
      ctx.fillStyle = PAL.flowerY;
      for (const id in s.npcs) {
        const n = s.npcs[id];
        if (n.map !== s.mapId || !n.path) continue;
        for (const [px2, py2] of n.path) ctx.fillRect(px2 * TILE + 7 - cx, py2 * TILE + 11 - cy, 2, 2);
      }
      if (m.def.pillar) {
        ctx.strokeStyle = PAL.ley; ctx.beginPath();
        ctx.arc(Math.round(m.def.pillar.x - cx), Math.round(m.def.pillar.y - cy), m.def.pillar.r * TILE, 0, Math.PI * 2); ctx.stroke();
      }
    }

    if (s.fade) {
      const a = s.fade.phase === "out" ? s.fade.t / s.fade.dur : 1 - s.fade.t / s.fade.dur;
      ctx.globalAlpha = clamp(a, 0, 1);
      ctx.fillStyle = PAL.ink; ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    }
  }


  /* ---------- finishing grade: vignette and fine film grain ---------- */
  let vig = null, grain = null, grainPat = null, grainT = 0, grainX = 0, grainY = 0;
  function grade(w, h) {
    ctx.save();
    ctx.globalCompositeOperation = "saturation"; ctx.globalAlpha = s.map && s.map.def.outside ? 0.24 : 0.14;
    ctx.fillStyle = "#808080"; ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "multiply"; ctx.globalAlpha = s.map && s.map.def.outside ? 1 : 0.6;
    ctx.fillStyle = "#dfe3ea"; ctx.fillRect(0, 0, w, h);
    ctx.restore();
    if (!vig || vig.width !== w || vig.height !== h) {
      vig = makeCanvas(w, h);
      const v = vig.getContext("2d");
      const gr = v.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.32, w / 2, h / 2, Math.hypot(w, h) * 0.56);
      gr.addColorStop(0, "rgba(10,6,22,0)"); gr.addColorStop(1, "rgba(10,6,22,0.5)");
      v.fillStyle = gr; v.fillRect(0, 0, w, h);
    }
    ctx.drawImage(vig, 0, 0);
    if (!grain) {
      grain = makeCanvas(64, 64);
      const gc = grain.getContext("2d"), id = gc.createImageData(64, 64);
      for (let i = 0; i < 64 * 64; i++) { const v = Math.random() < 0.5 ? 0 : 255; id.data[i * 4] = v; id.data[i * 4 + 1] = v; id.data[i * 4 + 2] = v; id.data[i * 4 + 3] = 255; }
      gc.putImageData(id, 0, 0);
      grainPat = ctx.createPattern(grain, "repeat");
    }
    if (s.t - grainT > 0.12) { grainT = s.t; grainX = (Math.random() * 64) | 0; grainY = (Math.random() * 64) | 0; }
    ctx.save();
    ctx.globalAlpha = 0.024;
    ctx.translate(-grainX, -grainY);
    ctx.fillStyle = grainPat; ctx.fillRect(grainX, grainY, w, h);
    ctx.restore();
  }

  /* The burning town: flame tongues on every roof in view, rolling smoke, flares of sparks. Drawn after the light pass, so fire glows. */
  function drawFire(cx, cy, w, h) {
    const t = s.t;
    const vis = s.fireSpots.filter(([x, y]) => x > cx - 20 && x < cx + w + 20 && y > cy - 10 && y < cy + h + 40);
    // flames: hard-edged pixel tongues rooted in the burn holes, four tones, stepped columns that lick and settle
    const TONE = ["#8a2418", "#d2501c", "#f08a2a", "#ffd068", "#fff3c0"], PXL = 2;
    ctx.globalAlpha = 1;
    for (let i = 0; i < vis.length; i++) {
      const [x, y, sc = 1] = vis[i], k = (x * 7 + y * 13) % 97;
      const bx = Math.round(x - cx), by = Math.round(y - cy);
      const hw = Math.round((7 + (k % 4)) * sc), ht = (14 + (k % 7)) * sc;
      const f = Math.floor(t * 9 + k) % 4;
      for (let dx = -hw; dx <= hw; dx += PXL) {
        const u = 1 - Math.abs(dx) / (hw + 1);
        const wob = 0.65 + 0.35 * Math.sin(t * (7 + (k % 5)) + dx * 0.9 + k) * Math.sin(t * 3.1 + dx * 0.4 + f);
        const ch = Math.max(PXL * 2, Math.round((ht * Math.pow(u, 0.9) * wob + 3) / PXL) * PXL);
        const lean = Math.round(Math.sin(t * 1.6 + k + dx * 0.15) * 1.5 + 1) * PXL * (ch / ht > 0.6 ? 1 : 0);
        for (let layer = 0; layer < 4; layer++) {
          const lh = Math.round(ch * (1 - layer * 0.26) / PXL) * PXL, inset = layer * PXL * 0.5;
          if (lh <= 0 || Math.abs(dx) > hw - inset) continue;
          ctx.fillStyle = TONE[layer + (layer === 3 && (k + f) % 3 === 0 ? 1 : 0)];
          ctx.fillRect(bx + dx + lean, by - lh, PXL, lh);
        }
      }
    }
    ctx.globalAlpha = 1;
    // smoke: dark billows that grow and fade as they climb
    for (const sm of s.smoke) {
      const a = Math.min(1, sm.life / sm.max) * 0.5 * Math.min(1, (sm.max - sm.life) * 2);
      ctx.globalAlpha = a; ctx.fillStyle = sm.c;
      ctx.beginPath(); ctx.arc(Math.round(sm.x - cx), Math.round(sm.y - cy), sm.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  /* little speech-bubble marks over heads during scenes: ! ? ... and a heart-free sigh */
  function drawEmotes(cx, cy) {
    for (const em of s.emotes) {
      const who = em.id === "player" ? s.player : s.npcs[em.id];
      if (!who || (em.id !== "player" && (who.map !== s.mapId || who.hidden))) continue;
      const pop = Math.min(1, em.t / 0.12), fade = Math.min(1, (em.dur - em.t) / 0.25);
      const x = Math.round(who.x - cx), y = Math.round(who.y - cy - 40 - (1 - pop) * 3 + Math.sin(em.t * 6) * 0.6);
      ctx.globalAlpha = fade;
      ctx.fillStyle = PAL.ink; ctx.fillRect(x - 6, y - 7, 13, 11); ctx.fillRect(x - 1, y + 4, 3, 2);
      ctx.fillStyle = em.kind === "!" ? "#ffe8a8" : "#f4ecdc"; ctx.fillRect(x - 5, y - 6, 11, 9); ctx.fillRect(x, y + 3, 1, 2);
      ctx.fillStyle = em.kind === "!" ? "#a8301c" : PAL.ink;
      if (em.kind === "!") { ctx.fillRect(x, y - 5, 1, 5); ctx.fillRect(x, y + 1, 1, 1); }
      else if (em.kind === "?") { ctx.fillRect(x - 1, y - 5, 3, 1); ctx.fillRect(x + 2, y - 4, 1, 2); ctx.fillRect(x, y - 2, 2, 1); ctx.fillRect(x, y - 1, 1, 1); ctx.fillRect(x, y + 1, 1, 1); }
      else { const n = Math.min(3, 1 + Math.floor(em.t / 0.3)); for (let i = 0; i < n; i++) ctx.fillRect(x - 3 + i * 3, y - 1, 1, 1); }
    }
    ctx.globalAlpha = 1;
  }
  function renderLight(cx, cy, night) {
    const { w, h } = s.view, m = s.map;
    const inside = !m.def.outside;
    const amb = inside ? 0.42 + 0.26 * night : m.def.dark ? 0.5 : 0.58 * night;
    if (!inside && night > 0.02 && night < 0.95) {
      ctx.globalAlpha = 0.1 * Math.sin(night * Math.PI);
      ctx.fillStyle = PAL.ember; ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    }
    if (amb <= 0.01) return;
    if (lightCanvas.width !== w || lightCanvas.height !== h) { lightCanvas.width = w; lightCanvas.height = h; }
    lctx.globalCompositeOperation = "source-over";
    lctx.clearRect(0, 0, w, h);
    lctx.fillStyle = `rgba(14,10,38,${amb.toFixed(3)})`;
    lctx.fillRect(0, 0, w, h);
    lctx.globalCompositeOperation = "destination-out";
    const vis = [];
    for (const L of m.lights) {
      if (L.night && night < 0.15) continue;
      if (L.x + L.r < cx || L.x - L.r > cx + w || L.y + L.r < cy || L.y - L.r > cy + h) continue;
      vis.push(L);
    }
    if (s.stage && s.stage.lights) for (const L of s.stage.lights(s.t - s.stage.t0)) vis.push(L);
    if (s.mode === "play" && !inside) vis.push({ x: s.player.x, y: s.player.y - 6, r: m.def.dark ? 88 : 44, c: PAL.glow, soft: true, str: m.def.dark ? 1.4 : 1.15 });
    if (s.mode === "play" && s.lightT > s.t) { const k = Math.min(1, (s.lightT - s.t) / 4); vis.push({ x: s.player.x, y: s.player.y - 8, r: 74, c: PAL.leyL, soft: true, str: 0.95 * k + 0.05 }); }
    for (const L of vis) {
      const str = L.str || 1;
      lctx.globalAlpha = str * (L.flicker ? 0.86 + 0.14 * Math.sin(s.t * 9 + L.x) : L.soft ? 0.55 : 1);
      lctx.drawImage(art.light(L.r), Math.round(L.x - L.r - cx), Math.round(L.y - L.r - cy));
    }
    lctx.globalAlpha = 1;
    lctx.globalCompositeOperation = "source-over";
    ctx.drawImage(lightCanvas, 0, 0);
    ctx.save();
    ctx.beginPath(); ctx.rect(-cx, -cy, m.w * TILE, m.h * TILE); ctx.clip();
    ctx.globalCompositeOperation = "lighter";
    for (const L of vis) {
      if (L.soft) continue;
      ctx.globalAlpha = inside ? 0.34 + night * 0.1 : 0.16 * night;
      ctx.drawImage(art.lightTint(L.r, L.c), Math.round(L.x - L.r - cx), Math.round(L.y - L.r - cy));
    }
    ctx.restore();
  }

  /* ---------- loop ---------- */
  let raf = 0, last = performance.now(), acc = 0;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    let dt = (now - last) / 1000;
    last = now;
    if (s.paused) { acc = 0; return; }
    if (dt > 0.25) dt = 0.25;
    acc += dt;
    while (acc >= STEP) { update(STEP); acc -= STEP; }
    render();
    s.fpsFrames++; s.fpsTime += dt;
    if (s.fpsTime >= 0.5) { s.fps = Math.round(s.fpsFrames / s.fpsTime); s.fpsFrames = 0; s.fpsTime = 0; }
  }
  const onVis = () => { last = performance.now(); acc = 0; };
  document.addEventListener("visibilitychange", onVis);
  const ro = new ResizeObserver(() => resize());
  ro.observe(root);

  // boot into attract mode
  ensureMaps("smith");
  s.map = maps.oak; s.mapId = "oak";
  settleNpcs();
  resize();
  snapCamera();
  raf = requestAnimationFrame(frame);

  return {
    input, art,
    /* the intro slides: a fixed shot of a real map, staged actors and scene effects drawn on the world's pixel grid */
    stage(cfg) {
      if (!cfg) { if (s.stage) { s.stage = null; resize(); this.attract(); } return; }
      s.mode = "attract"; s.G = null;
      ensureMaps(cfg.trade || "smith");
      s.stage = { ...cfg, t0: s.t };
      s.mapId = cfg.map; s.map = maps[cfg.map]; s.attractTime = cfg.time;
      s.wolves = []; s.critters = []; s.particles = []; s.fireSpots = null;
      resize(); snapCamera();
    },
    attract() {
      s.mode = "attract"; s.G = null; s.looks = {}; s.stage = null;
      ensureMaps("smith");
      s.mapId = "oak"; s.map = maps.oak; s.attractTime = 19.6 * 60;
      settleNpcs(); snapCamera();
    },
    start(G) {
      if (s.stage) { s.stage = null; resize(); } s.G = G; s.mode = "play"; s.passOutSent = G.time >= 24 * 60;
      ensureMaps(G.trade);
      s.looks = {};
      for (const id in NPC_DEFS) s.looks[id] = npcLookFor(id, G);
      refreshWorld();
      s.mapId = G.map; s.map = maps[G.map];
      s.player.x = G.x; s.player.y = G.y; s.player.dir = G.dir || "down";
      settleNpcs(); spawnWolves(); snapCamera(); updateHud();
    },
    setBlocked(b) { s.blocked = b; if (b) { input.jx = 0; input.jy = 0; } },
    isFading: () => !!s.fade,
    applySettings(next) { s.settings = { ...next }; resize(); },
    view: () => ({ ...s.view }),
    hour: () => hour(),
    mapId: () => s.mapId,
    interact() { return s.fade ? null : s.target; },
    faceNpc(id) {
      const n = s.npcs[id];
      if (!n) return;
      if (n.cue) return;
      n.talking = true; n.path = null;
      const dx = s.player.x - n.x, dy = s.player.y - n.y;
      n.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up";
    },
    releaseNpcs() { for (const id in s.npcs) s.npcs[id].talking = false; },
    /* cutscene direction: [verb, id, ...args]. Held NPCs ignore their schedules until cueRelease. */
    cue(list) {
      for (const c of list) {
        const [verb, id] = c, isP = id === "player", n = isP ? null : s.npcs[id];
        if (!isP && !n) continue;
        if (verb === "move") {
          const [, , x, y, opt = {}] = c;
          if (isP) { const from = [Math.floor(s.player.x / TILE), Math.floor((s.player.y - 2) / TILE)]; s.player.cuePath = findPath(s.mapId, from, [x, y]) || [[x, y]]; s.player.cueSpeed = opt.speed || 0.8; s.player.cueFace = opt.face || null; s.player.cueBack = !!opt.back; }
          else { n.cue = true; n.cueSpeed = opt.speed || 1; n.cueFace = opt.face || null; n.talking = false; n.path = n.map === s.mapId ? (findPath(s.mapId, npcTile(n), [x, y]) || [[x, y]]) : null; }
        } else if (verb === "face") { if (isP) s.player.dir = c[2]; else { n.cue = true; n.dir = c[2]; n.cueFace = c[2]; n.path = null; } }
        else if (verb === "hold") { if (n) { n.cue = true; n.path = null; } }
        else if (verb === "emote") s.emotes.push({ id, kind: c[2], t: 0, dur: c[3] || 1.6 });
        else if (verb === "hide") { if (n) { n.hidden = true; n.cue = true; } }
        else if (verb === "show") { if (n) { const [, , x, y] = c; n.cue = true; n.hidden = false; n.map = s.mapId; const [px, py] = tileCenter(x, y); n.x = px; n.y = py; n.path = null; } }
        else if (verb === "puff") {
          const who = isP ? s.player : n, cols = c[2] === "dark" ? ["#1a161e", "#2e2834", "#4a4252"] : c[2] === "light" ? ["#f4f0e0", "#c8f0ff", "#ffffff"] : [PAL.ley, PAL.leyL, PAL.white];
          for (let i = 0; i < 30; i++) { const a = Math.random() * Math.PI * 2, v = 12 + Math.random() * 40; s.particles.push({ x: who.x, y: who.y - 12, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 10, life: 0.6 + Math.random() * 0.8, max: 1.4, size: Math.random() < 0.4 ? 2 : 1, c: cols[i % 3] }); }
        }
        else if (verb === "cam") { s.camFocus = c[2] == null ? null : { x: c[2] * TILE + 8, y: c[3] * TILE + 12 }; }
        else if (verb === "shake") { s.shakeT = c[2] || 0.4; s.shakeA = c[3] || 3; }
      }
    },
    cueRelease() {
      for (const id in s.npcs) { const n = s.npcs[id]; if (n.cue) { n.cue = false; n.cueFace = null; n.wanderT = 1; } }
      s.player.cuePath = null; s.emotes = []; s.camFocus = null;
    },
    cueBusy: () => !!(s.player.cuePath && s.player.cuePath.length) || Object.values(s.npcs).some((n) => n.cue && n.path && n.path.length && n.map === s.mapId),

    addTime(min) { if (s.G) s.G.time = Math.min(s.G.time + min, 24 * 60 - 1); },
    /* day and night: towns and indoors are safe places to let the hours pass */
    safeHere: () => !!s.map && s.mode === "play" && !s.map.def.cave && (!s.map.def.outside || s.mapId === "oak"),
    setNight(n, fade = true) {
      if (!s.G) return;
      const go = () => { s.G.time = n ? NIGHT_T : DAY_T; settleNpcs(); spawnWolves(); updateHud(); };
      if (fade) fadeTo(go, 0.4); else go();
    },
    warp(mapId, tx, ty, dir, opts = {}) {
      fadeTo(() => { if (opts.before) opts.before(); loadMap(mapId, tx, ty, dir); if (opts.after) opts.after(); }, opts.dur || 0.35);
    },
    resetPassOut() { s.passOutSent = false; },
    sync() { if (s.G) { s.G.map = s.mapId; s.G.x = Math.round(s.player.x); s.G.y = Math.round(s.player.y); s.G.dir = s.player.dir; } },
    burst() {
      const p = s.player, [vx, vy] = DIR_VEC[p.dir];
      const ox = p.x + vx * 8, oy = p.y - 6 + vy * 6;
      for (let i = 0; i < 22; i++) {
        const a = Math.random() * Math.PI * 2, sp = 20 + Math.random() * 45;
        s.particles.push({
          x: ox, y: oy, vx: Math.cos(a) * sp + vx * 30, vy: Math.sin(a) * sp + vy * 30 - 10,
          life: 0.4 + Math.random() * 0.5, max: 0.9, size: Math.random() < 0.3 ? 2 : 1, c: [PAL.ley, PAL.leyL, PAL.leyD][i % 3],
        });
      }
    },
    refreshWorld() { refreshWorld(); settleNpcs(); },
    playerTile: () => [Math.floor(s.player.x / TILE), Math.floor((s.player.y - 2) / TILE)],
    resolveEncounter(outcome) {
      const w = s.encounter; s.encounter = null; if (!w) return;
      if (outcome === "won") { s.G.slain = s.G.slain || {}; s.G.slain[w.key] = s.G.day; s.wolves = s.wolves.filter((x) => x !== w); }
      else if (outcome === "fled") { w.stun = 8; const dx = w.x - s.player.x, dy = w.y - s.player.y, d = Math.hypot(dx, dy) || 1; w.x += (dx / d) * 26; w.y += (dy / d) * 26; }
      else spawnWolves();
    },
    inPillar: () => inPillar(s.player.x, s.player.y),
    crits: () => s.critters.map((c) => ({ k: c.k, x: Math.round(c.x), y: Math.round(c.y), run: !!c.running })),
    placePlayer(x, y) { s.player.x = x; s.player.y = y; },
    castMap(kind) {
      if (kind === "light") { s.lightT = s.t + 75; for (let i = 0; i < 14; i++) { const a = Math.random() * 6.28; s.particles.push({ x: s.player.x, y: s.player.y - 10, vx: Math.cos(a) * 30, vy: Math.sin(a) * 30 - 12, life: 0.6, max: 0.6, size: 1, c: i % 2 ? PAL.leyL : PAL.white }); } return "The air round you glows."; }
      if (kind === "move") {
        const m = s.map, px = s.player.x, py = s.player.y;
        const rub = m.props.find((p) => p.p === "rubble" && Math.hypot((p.x + p.def.fw / 2) * TILE - px, (p.y + p.def.fh / 2) * TILE - py) < 44);
        for (let i = 0; i < 22; i++) { const a = Math.random() * 6.28; s.particles.push({ x: px + Math.cos(a) * 22, y: py - 6 + Math.sin(a) * 12, vx: -Math.cos(a) * 26, vy: -Math.sin(a) * 16 - 8, life: 0.7, max: 0.7, size: 1, c: i % 2 ? "#b8a0f0" : "#7a5ac8" }); }
        if (!rub) return "Bary-is: the pebbles at your feet shiver and settle. Nothing here is heavy enough to move.";
        if (s.G) { s.G.flags["moved_" + (rub.id || "rubble")] = true; }
        s.shakeT = 0.5; s.shakeA = 3;
        refreshWorld();
        if (hooks.onMoved) hooks.onMoved(rub.id || "rubble");
        return "Bary-is: the rubble groans, lifts, and slides aside. The way is open.";
      }
      if (kind === "scan") {
        s.scan = { t0: s.t, x: s.player.x, y: s.player.y };
        let n = 0; for (const w of s.wolves) if (Math.hypot(w.x - s.player.x, w.y - s.player.y) < 190) { w.seen = s.t + 9; n++; }
        return n ? `Sens-id: ${n} ${n > 1 ? "creatures" : "creature"} nearby, and hungry.` : "Sens-id: nothing hunts near you.";
      }
      return "";
    },
    setPaused(v) { s.paused = !!v; last = performance.now(); acc = 0; },
    debugState: () => s,
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); document.removeEventListener("visibilitychange", onVis); },
  };
}
