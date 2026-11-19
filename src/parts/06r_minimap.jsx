/* ------------------------------------------------------------------ */
/* The mini-map and the area map (V93).                                */
/*  - Each map is inked once into a tile-per-pixel image from its real */
/*    cells (after the cliffs are weathered).                          */
/*  - The corner map follows the player: you, Pillars, doors and the   */
/*    way on, and quest marks; a mark off the edge sits on the rim.    */
/*  - Ground the player has walked near is remembered in G.seen, so    */
/*    the area map keeps unvisited country dark.                       */
/*  - Quest marks: live story triggers on this map (their scripts are  */
/*    dry-run with a context that changes nothing), and exits whose    */
/*    destination is named in the current task.                        */
/* ------------------------------------------------------------------ */
const MM_COL = {
  ".": "#39472f", ",": "#3c4a31", "*": "#3e4c33", T: "#22301d", b: "#2c3b25", r: "#66625c", c: "#4a4030", k: "#4a2e3a",
  "=": "#6a5536", P: "#6e6a64", G: "#6a5536", g: "#6a5536", Z: "#5a4630", S: "#6a5536",
  "~": "#1d3446", B: "#6a5238", C: "#4c4842", O: "#141010",
  R: "#a8926c", W: "#c2ab80", w: "#c2ab80", D: "#e6d098", F: "#8a8680", H: "#5a5048", "#": "#7a7670", f: "#5a4630", q: "#5a4630",
  o: "#6e5238", s: "#5e5a54", u: "#6a3a34", m: "#6e5c3c", d: "#4a3826", U: "#1c1626", Y: "#1c1626", L: "#2a2030", X: "#0c080e", K: "#4a3626",
};
const MM_CELL = 6;   // tiles per cell of remembered ground
const MM_IMG = {};
function mmInk(id, m) {
  const key = id + ":" + m.w + "x" + m.h; if (MM_IMG[key]) return MM_IMG[key];
  const def = m.def, c = makeCanvas(m.w, m.h), x = c.getContext("2d"), im = x.createImageData(m.w, m.h), d = im.data;
  const rock = def.terrain === "rock", cave = def.terrain === "cave";
  for (let ty = 0; ty < m.h; ty++) {
    const sn = typeof snowAtTile === "function" ? snowAtTile(def, ty) : 0;
    for (let tx = 0; tx < m.w; tx++) {
      const ch = m.cells[ty][tx];
      let col = MM_COL[ch] || MM_COL["."];
      if (ch === "." || ch === "," || ch === "*") col = cave ? "#2e2822" : rock ? "#5a554c" : sn > 0.45 ? "#a9adb6" : col;
      else if (ch === "C" && cave) col = "#120e0c";
      else if ((ch === "=" || ch === "P") && def.pave) col = "#6e6a64";
      else if (ch === "T" && sn > 0.45) col = "#3e4a44";
      const [r, g, b] = rgbOf(col), i = (ty * m.w + tx) * 4;
      const n = ((tx * 7 + ty * 13) % 5) - 2;   // a faint grain so open ground is not a flat sheet
      d[i] = r + n; d[i + 1] = g + n; d[i + 2] = b + n; d[i + 3] = 255;
    }
  }
  x.putImageData(im, 0, 0);
  return (MM_IMG[key] = c);
}
/* remembered ground, a string of 0/1 per cell, kept in the save */
function mmSeen(G, id, m) {
  const cw = Math.ceil(m.w / MM_CELL), ch = Math.ceil(m.h / MM_CELL);
  G.seen = G.seen || {};
  let s = G.seen[id];
  if (!s || s.length !== cw * ch) s = G.seen[id] = "0".repeat(cw * ch);
  return { s, cw, ch };
}
function mmReveal(G, id, m, tx, ty) {
  if (!m.def.outside || m.def.terrain === "cave" && false) return;
  const { s, cw, ch } = mmSeen(G, id, m), cx = Math.floor(tx / MM_CELL), cy = Math.floor(ty / MM_CELL);
  let a = null;
  for (let j = -2; j <= 2; j++) for (let i = -3; i <= 3; i++) {
    const x = cx + i, y = cy + j; if (x < 0 || y < 0 || x >= cw || y >= ch || Math.abs(i) + Math.abs(j) > 4) continue;
    const k = y * cw + x; if (s[k] === "1") continue;
    if (!a) a = s.split(""); a[k] = "1";
  }
  if (a) G.seen[id] = a.join("");
}
/* the marks for a map: [{x,y (world px), k: you|pillar|door|quest|exit, label, dir}] */
function mmMarks(G, id, m, task, dryCtx) {
  const out = [], def = m.def;
  for (const pl of typeof pillarList === "function" ? pillarList(def) : []) out.push({ x: pl.x, y: pl.base, k: "pillar", label: pl.name || "Pillar" });
  const words = task ? (task.text + " " + (task.hint || "")).toLowerCase() : "";
  const seenExit = new Set();
  for (const wp of def.warps || []) {
    const to = MAP_DEFS[wp.to]; if (!to) continue;
    const name = (to.name || wp.to).split(":")[0].trim(), outside = to.outside;
    const key = wp.to + Math.round(wp.x / 3) + "," + Math.round(wp.y / 3); if (seenExit.has(key)) continue; seenExit.add(key);
    const quest = !!words && name.length > 3 && words.includes(name.toLowerCase());
    out.push({ x: wp.x * TILE + 8, y: wp.y * TILE + 8, k: quest ? "quest" : outside && def.outside ? "exit" : "door", label: to.name || wp.to });
  }
  const dc = (def.triggers || []).length && dryCtx ? dryCtx() : null;
  for (const t of def.triggers || []) {
    const sc = SCRIPTS["trig_" + t.id]; if (!sc || !dc) continue;
    // live only when walking there would start something: a choice, a fight, or a change of state
    let live = false; try { const st = sc(dc); live = Array.isArray(st) && st.some((x) => x && (x.choice || x.fight || x.do || x.act)); } catch (e) { live = false; }
    if (live) out.push({ x: t.x * TILE + 8, y: t.y * TILE + 8, k: "quest", label: "Something here" });
  }
  return out;
}
const MM_MARK = { pillar: "#6dccc4", door: "#e6d098", exit: "#c9b78e", quest: "#e0b850" };
function mmDrawMark(g, k, x, y, s) {
  g.fillStyle = "#0f0d14";
  if (k === "pillar") { g.save(); g.translate(x, y); g.rotate(Math.PI / 4); g.fillRect(-s - 1, -s - 1, s * 2 + 2, s * 2 + 2); g.fillStyle = MM_MARK.pillar; g.fillRect(-s, -s, s * 2, s * 2); g.restore(); }
  else if (k === "quest") { g.beginPath(); g.moveTo(x, y - s - 2); g.lineTo(x + s + 2, y); g.lineTo(x, y + s + 2); g.lineTo(x - s - 2, y); g.fill(); g.fillStyle = MM_MARK.quest; g.beginPath(); g.moveTo(x, y - s); g.lineTo(x + s, y); g.lineTo(x, y + s); g.lineTo(x - s, y); g.fill(); }
  else { g.fillRect(x - s, y - s + 1, s * 2, s * 2 - 1); g.fillStyle = MM_MARK[k] || "#ccc"; g.fillRect(x - s + 1, y - s + 2, s * 2 - 2, s * 2 - 3); }
}
function mmDrawYou(g, x, y, dir, s) {
  const a = { up: -Math.PI / 2, down: Math.PI / 2, left: Math.PI, right: 0 }[dir] || Math.PI / 2;
  g.save(); g.translate(x, y); g.rotate(a);
  g.fillStyle = "#0f0d14"; g.beginPath(); g.moveTo(s + 3, 0); g.lineTo(-s - 1, s + 2); g.lineTo(-s + 1, 0); g.lineTo(-s - 1, -s - 2); g.fill();
  g.fillStyle = "#f4ecdc"; g.beginPath(); g.moveTo(s + 1, 0); g.lineTo(-s, s); g.lineTo(-s + 2, 0); g.lineTo(-s, -s); g.fill();
  g.restore();
}

function MiniMap({ eng, G, task, dryCtx, onOpen, hidden }) {
  const cv = useRef(null), marksRef = useRef({ id: null, t: 0, list: [] });
  useEffect(() => {
    let raf = 0, last = 0;
    const draw = (now) => {
      raf = requestAnimationFrame(draw);
      if (now - last < 120) return; last = now;
      const c = cv.current; if (!c || !eng) return;
      let st; try { st = eng.debugState(); } catch (e) { return; }
      const m = st.map, id = st.mapId; if (!m || !m.cells) return;
      const px = st.player.x, py = st.player.y, tx = Math.floor(px / TILE), ty = Math.floor(py / TILE);
      if (G) mmReveal(G, id, m, tx, ty);
      const mr = marksRef.current;
      if (mr.id !== id || now - mr.t > 1500) { mr.id = id; mr.t = now; mr.list = G ? mmMarks(G, id, m, task, dryCtx) : []; }
      const dpr = Math.min(3, window.devicePixelRatio || 1), W = c.clientWidth, H = c.clientHeight;
      if (c.width !== Math.round(W * dpr)) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
      const g = c.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.imageSmoothingEnabled = false;
      const k = m.def.outside ? 3 : 5;                       // pixels per tile
      const ox = W / 2 - (px / TILE) * k, oy = H / 2 - (py / TILE) * k;
      g.fillStyle = "#14111c"; g.fillRect(0, 0, W, H);
      g.drawImage(mmInk(id, m), Math.round(ox), Math.round(oy), m.w * k, m.h * k);
      for (const mk of mr.list) {
        let x = ox + (mk.x / TILE) * k, y = oy + (mk.y / TILE) * k;
        const off = x < 5 || y < 5 || x > W - 5 || y > H - 5;
        if (off && mk.k !== "quest") continue;
        x = Math.max(5, Math.min(W - 5, x)); y = Math.max(5, Math.min(H - 5, y));
        mmDrawMark(g, mk.k, x, y, mk.k === "quest" ? 3 : 2);
      }
      mmDrawYou(g, W / 2, H / 2, st.player.dir, 3);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [eng, G, task, dryCtx]);
  return (
    <button className="dz-mini dz-frame" id="dz-minimap" data-hide={hidden ? "1" : "0"} aria-label="Area map" onPointerDown={(e) => e.stopPropagation()} onClick={onOpen}>
      <canvas ref={cv} />
      <span className="dz-mini-n" aria-hidden="true">N</span>
    </button>
  );
}

function AreaMap({ eng, G, task, dryCtx, onClose }) {
  const cv = useRef(null), [info, setInfo] = useState(null);
  useEffect(() => {
    const c = cv.current; if (!c || !eng) return;
    const st = eng.debugState(), m = st.map, id = st.mapId; if (!m) return;
    const W = c.clientWidth, H = c.clientHeight, dpr = Math.min(3, window.devicePixelRatio || 1);
    c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
    const g = c.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.imageSmoothingEnabled = false;
    const k = Math.max(1, Math.min(W / m.w, H / m.h)), ox = (W - m.w * k) / 2, oy = (H - m.h * k) / 2;
    g.fillStyle = "#14111c"; g.fillRect(0, 0, W, H);
    g.drawImage(mmInk(id, m), ox, oy, m.w * k, m.h * k);
    let fogged = 0;
    if (m.def.outside && G) {   // unvisited country stays dark
      const { s, cw, ch } = mmSeen(G, id, m);
      for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) if (s[y * cw + x] !== "1") {
        fogged++;
        const x0 = Math.round(ox + x * MM_CELL * k), x1 = Math.round(ox + Math.min(m.w, (x + 1) * MM_CELL) * k), y0 = Math.round(oy + y * MM_CELL * k), y1 = Math.round(oy + Math.min(m.h, (y + 1) * MM_CELL) * k);
        g.fillStyle = "rgba(14,11,20,0.86)"; g.fillRect(x0, y0, x1 - x0, y1 - y0);
      }
    }
    const marks = G ? mmMarks(G, id, m, task, dryCtx) : [];
    const seenAt = (x, y) => { if (!m.def.outside || !G) return true; const { s, cw } = mmSeen(G, id, m); return s[Math.floor(y / TILE / MM_CELL) * cw + Math.floor(x / TILE / MM_CELL)] === "1"; };
    for (const mk of marks) if (mk.k === "quest" || seenAt(mk.x, mk.y)) mmDrawMark(g, mk.k, ox + (mk.x / TILE) * k, oy + (mk.y / TILE) * k, mk.k === "quest" ? 5 : 4);
    mmDrawYou(g, ox + (st.player.x / TILE) * k, oy + (st.player.y / TILE) * k, st.player.dir, 5);
    setInfo({ name: fillText(m.def.name || id, typeof buildVars === "function" ? buildVars(G) : {}), fog: fogged, quests: marks.filter((x) => x.k === "quest").length });
  }, [eng, G, task, dryCtx]);
  return (
    <div className="dz-overlay" id="dz-areamap" onPointerDown={(e) => { e.stopPropagation(); if (e.target === e.currentTarget) onClose(); }}>
      <div className="dz-panel dz-amap" role="dialog" aria-label="Area map">
        <div className="dz-phead"><div className="dz-ptitle">{info ? info.name : "Map"}</div><button className="dz-close" id="dz-areamap-close" onClick={onClose}>Close</button></div>
        <div className="dz-amap-body">
          <canvas ref={cv} />
          <div className="dz-amap-key">
            <div><i data-k="you">▲</i>You</div><div><i data-k="pillar" />Pillar</div><div><i data-k="door" />Door</div><div><i data-k="exit" />Way on</div><div><i data-k="quest" />Quest</div>
            {info && info.fog ? <small>Ground you have not walked stays dark.</small> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
