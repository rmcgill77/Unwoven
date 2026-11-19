/* ------------------------------------------------------------------ */
/* The book: a leather tome that opens over the game, with paper tabs  */
/* stuck to its edge. Words (the tome), Map (the Frostcrown Plains),   */
/* Beasts (the bestiary) and Quests. And the Pack, framed with the     */
/* game-interface pack, every item with its own icon.                  */
/* Everything is laid out on a fixed design stage (the book at 4x) and */
/* scaled to the screen, so each page box always holds its contents.  */
/* ------------------------------------------------------------------ */

/* ---------- item icons from the baked atlas ---------- */
const ITEM_ICON_IMG = (() => { try { const im = new Image(); im.src = ITEM_ICON_SRC; return im; } catch (e) { return null; } })();
const ITEM_ICON_CANVAS = {};
function itemIcon(id) {
  const n = ITEM_ICON_CELL[id]; if (n === undefined || !ITEM_ICON_IMG || !ITEM_ICON_IMG.complete || !ITEM_ICON_IMG.naturalWidth) return null;
  if (ITEM_ICON_CANVAS[id]) return ITEM_ICON_CANVAS[id];
  const c = makeCanvas(32, 32); c.getContext("2d").drawImage(ITEM_ICON_IMG, (n % 16) * 32, Math.floor(n / 16) * 32, 32, 32, 0, 0, 32, 32);
  return (ITEM_ICON_CANVAS[id] = c);
}
{ const base = gearIcon; gearIcon = (id) => itemIcon(id) || base(id); }
function ItemIcon({ id, size = 64 }) {
  const n = ITEM_ICON_CELL[id], k = size / 32;
  if (n === undefined) return <div style={{ width: size, height: size }} />;
  return <div className="bk-icon" style={{ width: size, height: size, backgroundImage: `url(${ITEM_ICON_SRC})`, backgroundSize: `${512 * k}px auto`, backgroundPosition: `-${(n % 16) * size}px -${Math.floor(n / 16) * size}px` }} />;
}
function Sprite({ src, idx, cell, size }) {
  const k = size / cell;
  return <div className="bk-icon" style={{ width: size, height: size, backgroundImage: `url(${src})`, backgroundSize: `auto ${cell * k}px`, backgroundPosition: `-${idx * size}px 0` }} />;
}
const Glyph = ({ k, size = 36 }) => <Sprite src={GLYPH_SRC} idx={GLYPH_IDX[k]} cell={18} size={size} />;

/* ---------- what the book remembers: beasts met, places found ---------- */
const BEAST_READ = new Set();
{ const base = battleSfx; battleSfx = (e, u) => { if (e.e === "scan" && u && u.key) BEAST_READ.add(u.key); return base(e, u); }; }
function beastNote(G, foes, won) {
  G.beasts = G.beasts || {};
  for (const k of foes || []) {
    if (!BTL_FOES[k]) continue;
    const b = G.beasts[k] || (G.beasts[k] = { kills: 0, read: false, n: Object.keys(G.beasts).length });
    if (won) b.kills++;
  }
  for (const k of BEAST_READ) if (G.beasts[k]) G.beasts[k].read = true;
  BEAST_READ.clear();
}
const PLAINS_OFF = { plainsNW: [0, 0], plainsNE: [100, 0], plainsSW: [0, 50], plainsSE: [100, 50] };
const MAP_PLACES = [
  { id: "oak", name: "Oakhaven", at: [2, 78], lab: "up" }, { id: "ash", name: "Ashford", at: [58, 88], lab: "up" },
  { id: "gw", name: "Greywick", at: [96, 24], lab: "down" }, { id: "camp", name: "Traders' camp", at: [84, 58], lab: "down" },
  { id: "wforest", name: "West Forest", at: [14, 93], lab: "right" }, { id: "eforest", name: "East Forest", at: [186, 70], lab: "left" },
  { id: "overlook", name: "Overlook", at: [117, 40], lab: "right" }, { id: "os", name: "The Outskirts", at: [150, 5], lab: "left" },
];
function placeOfMap(mid) {
  if (!mid) return null;
  if (mid === "oak" || mid.startsWith("oak_")) return "oak";
  if (mid === "ash" || mid.startsWith("ash_")) return "ash";
  if (mid === "gw" || mid.startsWith("gw_")) return "gw";
  if (mid === "os" || mid === "fort" || mid.startsWith("fort_")) return "os";
  if (mid === "wforest" || mid === "eforest") return mid;
  return null;
}
function bookPlace(G, mid, tile) {
  const f = (G.found = G.found || { oak: 1 });
  const p = placeOfMap(mid); if (p && !f[p]) f[p] = 1;
  const off = PLAINS_OFF[mid];
  if (off && tile) {
    const gx = tile[0] + off[0], gy = tile[1] + off[1];
    G.plainsAt = [gx, gy];
    for (const pl of MAP_PLACES) if (!f[pl.id] && Math.hypot(pl.at[0] - gx, pl.at[1] - gy) < 13) f[pl.id] = 1;
  }
  if (G.flags.reached_ash) f.ash = 1;
  if (G.flags.reached_gw) f.gw = 1;
  if (G.flags.reached_fort) f.os = 1;
}

/* the plains, inked on parchment: drawn once from the real map */
let PLAINS_INK = null;
function plainsInk() {
  if (PLAINS_INK) return PLAINS_INK;
  const GW = 190, GH = 110, C = 4, c = makeCanvas(GW * C, GH * C), x = c.getContext("2d");
  let seed = 3; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (const [k, [ox, oy]] of Object.entries(PLAINS_OFF)) {
    const d = MAP_DEFS[k]; if (!d) continue;
    d.rows.forEach((row, y) => {
      const Y = (oy + y) * C, snow = Math.max(0, Math.min(1, (46 - (oy + y)) / 40));
      for (let i = 0; i < row.length; i++) {
        const ch = row[i], X = (ox + i) * C;
        if (snow > 0) { x.fillStyle = `rgba(248,244,232,${0.43 * snow})`; x.fillRect(X, Y, C, C); }
        let col = null, round = false;
        if (ch === "~") col = oy + y > 30 ? "rgba(118,140,150,.78)" : "rgba(118,140,150,.47)";
        else if (ch === "T") { if (rnd() < 0.8) { col = "rgba(74,88,58,.82)"; round = true; } }
        else if (ch === "b") { col = "rgba(104,116,76,.66)"; round = true; }
        else if (ch === "r") { col = "rgba(112,104,96,.78)"; round = true; }
        else if (ch === "=" || ch === "B") col = "rgba(140,104,64,.9)";
        else if ("RWwD".includes(ch)) col = "rgba(120,60,44,.9)";
        else if (ch === "c") col = "rgba(170,150,90,.63)";
        else if ("fZ#".includes(ch)) col = "rgba(92,72,52,.78)";
        if (!col) continue;
        x.fillStyle = col;
        if (round) { x.beginPath(); x.arc(X + C / 2, Y + C / 2, C * 0.58, 0, Math.PI * 2); x.fill(); } else x.fillRect(X, Y, C, C);
      }
    });
  }
  return (PLAINS_INK = c);
}

/* ---------- shared bits ---------- */
const BK = 4, BOOK_DW = BOOK_W * BK, BOOK_DH = BOOK_H * BK;
const STAGE_W = BOOK_DW + 190, STAGE_H = BOOK_DH + 24;
const PG = (b) => ({ left: b[0] * BK, top: b[1] * BK, width: (b[2] - b[0]) * BK, height: (b[3] - b[1]) * BK });
const PL = PG(BOOK_PAGES.L), PR = PG(BOOK_PAGES.R);
const BOOK_TABS = [["words", "Words", "#76281f", "magic"], ["map", "Map", "#2c4a38", "adv"], ["beasts", "Beasts", "#363e68", "beast"], ["quests", "Journal", "#705824", "adv"]];
const BOOK_CSS = `
.bk-ov{position:absolute;inset:0;z-index:60;background:rgba(8,6,10,.72);display:grid;place-items:center;overflow:hidden;touch-action:none}
.bk-stage{position:absolute;left:50%;top:50%;transform-origin:0 0;font-family:'Pixelify Sans',ui-monospace,monospace;color:#34241a}
.bk-open{animation:bkOpen .32s ease-out}
@keyframes bkOpen{from{opacity:0;transform:translate(var(--tx),var(--ty)) scale(calc(var(--k)*.9))}to{opacity:1}}
.bk-icon{image-rendering:pixelated;background-repeat:no-repeat;flex:none}
.bk-book{position:absolute;left:0;top:12px;width:${BOOK_DW}px;height:${BOOK_DH}px;z-index:2}
.bk-book>.bk-art{position:absolute;inset:0;image-rendering:pixelated;background-repeat:no-repeat}
.bk-page{position:absolute;overflow:hidden;box-sizing:border-box;transition:opacity .12s}
.bk-page[data-hide="1"]{opacity:0}
.bk-tab{position:absolute;z-index:1;border:4px solid #1a120e;border-radius:0 18px 18px 0;color:#d6c8aa;font:inherit;font-size:24px;cursor:pointer;display:flex;align-items:center;justify-content:flex-end;padding:0 14px 0 0;box-sizing:border-box;box-shadow:inset 6px 0 0 rgba(0,0,0,.2)}
.bk-tab[aria-selected="true"]{color:#efe2c4;font-size:26px}
.bk-tab:focus-visible,.bk-btn:focus-visible,.pk-btn:focus-visible,.pk-slot:focus-visible{outline:3px solid #ffd27a;outline-offset:2px}
.bk-h1{font-size:40px;line-height:1.1;margin:0;color:#34241a;font-weight:500}
.bk-h2{font-size:22px;line-height:1.2;color:#62503a;margin:0}
.bk-t{font-size:22px;line-height:1.3;color:#34241a}
.bk-s{font-size:19px;line-height:1.3;color:#62503a}
.bk-red{color:#7c261e}
.bk-fade{color:#968470}
.bk-btn{font:inherit;font-size:20px;background:rgba(120,96,64,.16);border:3px solid #62503a;color:#34241a;border-radius:6px;cursor:pointer;padding:4px 10px;line-height:1.2}
.bk-btn[aria-pressed="true"]{background:rgba(124,38,30,.16);border-color:#7c261e}
.bk-btn:disabled{opacity:.35;cursor:default}
.bk-clamp2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.bk-clamp3{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.bk-row{display:flex;align-items:center;gap:10px;min-width:0}
.bk-pager{display:flex;align-items:center;gap:12px;font-size:20px;color:#62503a}
.bk-pager button{font:inherit;font-size:22px;width:44px;height:40px;background:none;border:3px solid #62503a;border-radius:6px;color:#34241a;cursor:pointer;padding:0}
.bk-pager button:disabled{opacity:.3;cursor:default}
`;
function useStageScale(ref, W, H) {
  const [k, setK] = useState(0.5);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const fit = () => { const w = el.clientWidth, h = el.clientHeight; if (w && h) setK(Math.min((w * 0.98) / W, (h * 0.96) / H)); };
    fit(); let ro = null;
    try { ro = new ResizeObserver(fit); ro.observe(el); } catch (e) { window.addEventListener("resize", fit); }
    return () => { if (ro) ro.disconnect(); else window.removeEventListener("resize", fit); };
  }, [W, H]);
  return k;
}
function Pager({ n, i, set, id }) {
  if (n <= 1) return null;
  return <div className="bk-pager"><button id={id + "-prev"} aria-label="Previous page" disabled={i <= 0} onClick={() => set(i - 1)}>‹</button><span>{i + 1} of {n}</span><button id={id + "-next"} aria-label="Next page" disabled={i >= n - 1} onClick={() => set(i + 1)}>›</button></div>;
}
/* how many lines a string takes at a size in a width (Pixelify runs about .58em a letter) */
const linesOf = (s, size, width) => { const per = Math.max(8, Math.floor(width / (size * 0.6))); let n = 0; for (const p of String(s).split("\n")) n += Math.max(1, Math.ceil(p.length / per)); return n; };
const paginate = (items, hOf, room) => { const pages = [[]]; let h = 0; for (const it of items) { const ih = hOf(it); if (h + ih > room && pages[pages.length - 1].length) { pages.push([]); h = 0; } pages[pages.length - 1].push(it); h += ih; } return pages; };

/* ---------- the book ---------- */
function BookScreen({ G, start, magicOn, tasks, onClose, bump, mapId, tile }) {
  useMemo(() => { try { bookPlace(G, mapId, tile); } catch (e) { /* no map */ } }, []);
  const ov = useRef(null), k = useStageScale(ov, STAGE_W, STAGE_H);
  const tabs = BOOK_TABS.filter(([id]) => id !== "words" || magicOn);
  const [sec, setSec] = useState(tabs.some((t) => t[0] === start) ? start : tabs[0][0]);
  const [turn, setTurn] = useState(null);   // { f: frame, dir }
  const pending = useRef(null);
  const style = BOOK_TABS.find((t) => t[0] === sec)[3];
  const flip = (dir, then) => {
    if (turn) return;
    pending.current = then; let f = 0;
    setTurn({ f: 0, dir });
    const id = setInterval(() => {
      f++;
      if (f === 7 && pending.current) { pending.current(); pending.current = null; }
      if (f >= BOOK_TURN_N) { clearInterval(id); setTurn(null); } else setTurn({ f, dir });
    }, 30);
    try { Sfx.play("swing2", 0.25); } catch (e) { /* no sound */ }
  };
  const go = (id) => { if (id === sec) return; const a = tabs.findIndex((t) => t[0] === sec), b = tabs.findIndex((t) => t[0] === id); flip(b > a ? 1 : -1, () => setSec(id)); };
  useEffect(() => {
    const kd = (e) => { if (e.key === "Escape" || e.key === "b") { e.stopPropagation(); onClose(); } };
    window.addEventListener("keydown", kd, true); return () => window.removeEventListener("keydown", kd, true);
  }, [onClose]);
  const art = BOOK_ART[style];
  const tx = `${-STAGE_W * k / 2}px`, ty = `${-STAGE_H * k / 2}px`;
  const hide = turn ? "1" : "0";
  const ctx = { G, bump, flip, hide, tasks, mapId, tile };
  return (
    <div className="bk-ov" ref={ov} role="dialog" aria-label="The book" onPointerDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <style>{BOOK_CSS}</style>
      <div className="bk-stage bk-open" style={{ width: STAGE_W, height: STAGE_H, transform: `translate(${tx},${ty}) scale(${k})`, "--tx": tx, "--ty": ty, "--k": k }}>
        {tabs.map(([id, label, col], i) => {
          const on = id === sec, proud = on ? 156 : 140, x0 = BOOK_DW - 60;
          return <button key={id} id={`bk-tab-${id}`} role="tab" aria-selected={on} className="bk-tab" onClick={() => go(id)}
            style={{ left: x0, top: 12 + 44 + i * 104, width: 60 + proud, height: 88, background: col, filter: on ? "none" : "brightness(.82)" }}>{label}</button>;
        })}
        <button id="bk-close" className="bk-tab" aria-label="Close the book" onClick={onClose}
          style={{ left: BOOK_DW - 60, top: 12 + 44 + tabs.length * 104 + 24, width: 60 + 110, height: 76, background: "#2a2026", justifyContent: "flex-end", gap: 8 }}><Glyph k="close" size={36} /></button>
        <div className="bk-book">
          <div className="bk-art" style={turn
            ? { backgroundImage: `url(${art.turn})`, backgroundSize: `${BOOK_DW * BOOK_TURN_N}px ${BOOK_DH}px`, backgroundPosition: `-${(turn.dir > 0 ? turn.f : BOOK_TURN_N - 1 - turn.f) * BOOK_DW}px 0`, transform: turn.dir > 0 ? "none" : "scaleX(-1)" }
            : { backgroundImage: `url(${art.open})`, backgroundSize: `${BOOK_DW}px ${BOOK_DH}px` }} />
          {sec === "words" ? <WordsPages {...ctx} /> : sec === "map" ? <MapPages {...ctx} /> : sec === "beasts" ? <BeastPages {...ctx} /> : <QuestPages {...ctx} />}
        </div>
      </div>
    </div>
  );
}
const Page = ({ side, hide, id, children, style }) => <div className="bk-page" id={id} data-page={side} data-hide={hide} style={{ ...(side === "L" ? PL : PR), ...style }}>{children}</div>;

/* --- Words: the tome --- */
function WordsPages({ G, bump, flip, hide }) {
  magicEnsure(G);
  const roots = G.words.r, sufs = G.words.s;
  const [root, setRoot] = useState(roots[0] || null);
  const [rp, setRp] = useState(0), [sp, setSp] = useState(0);
  const [slot, setSlot] = useState(Math.max(0, G.hotbar.indexOf(null)));
  const [word, setWord] = useState(null);
  const RPP = 8, rPages = Math.max(1, Math.ceil(roots.length / RPP)), SPP = 6, sPages = Math.max(1, Math.ceil(sufs.length / SPP));
  const R = root ? rootInfo(root) : null, sel = word ? weaveSpell(root, word) : null;
  const turnTo = (set, v, cur) => flip(v > cur ? 1 : -1, () => set(v));
  return (<>
    <Page side="L" hide={hide} id="bk-words-l">
      <h2 className="bk-h1">The Tome</h2>
      <div className="bk-row" style={{ justifyContent: "space-between", height: 40, marginTop: 4 }}><span className="bk-h2">Roots you know</span><Pager n={rPages} i={rp} set={(v) => turnTo(setRp, v, rp)} id="bk-roots" /></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridAutoRows: 70, gap: "4px 8px", marginTop: 6, height: 4 * 70 + 12 }}>
        {roots.slice(rp * RPP, rp * RPP + RPP).map((r) => {
          const info = rootInfo(r);
          return <button key={r} id={`bk-root-${r}`} className="bk-btn" aria-pressed={r === root} onClick={() => { setRoot(r); setWord(null); setSp(0); }}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: 4, textAlign: "left", minWidth: 0 }}>
            <Sprite src={ROOT_ICON_SRC} idx={ROOT_ICON_IDX[r] !== undefined ? ROOT_ICON_IDX[r] : ROOT_ICON_IDX._} cell={32} size={56} />
            <span style={{ minWidth: 0 }}><b style={{ fontSize: 24, fontWeight: 500, display: "block" }}>{r}</b><span className="bk-s bk-clamp2" style={{ fontSize: 17 }}>{info ? info.meaning : ""}</span></span>
          </button>;
        })}
      </div>
      <div className="bk-h2" style={{ marginTop: 10 }}>Hotbar: pick a slot, then a word</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginTop: 6 }}>
        {G.hotbar.map((id, i) => {
          const w = id ? weaveSpell(...id.split("-")) : null;
          return <button key={i} id={`bk-slot-${i}`} className="bk-btn" aria-pressed={slot === i} onClick={() => setSlot(i)} style={{ height: 82, padding: 4, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 2, minWidth: 0 }}>
            <span className="bk-s" style={{ fontSize: 16 }}>Slot {i + 1}</span>
            <span style={{ display: "block", width: "100%", textAlign: "center", fontSize: 19, color: "#34241a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{w && w.ok ? w.name : "Empty"}</span>
            {w && w.ok ? <span className="bk-s" style={{ fontSize: 16, whiteSpace: "nowrap" }}>{w.cost} br</span> : null}
          </button>;
        })}
      </div>
    </Page>
    <Page side="R" hide={hide} id="bk-words-r">
      {R ? (<>
        <div className="bk-row" style={{ alignItems: "flex-start", gap: 14 }}>
          <Sprite src={ROOT_ICON_SRC} idx={ROOT_ICON_IDX[root] !== undefined ? ROOT_ICON_IDX[root] : ROOT_ICON_IDX._} cell={32} size={96} />
          <div style={{ minWidth: 0 }}><h2 className="bk-h1" style={{ fontSize: 44 }}>{root}</h2><div className="bk-t bk-clamp2" style={{ color: "#62503a" }}>{R.meaning}</div></div>
        </div>
        <div className="bk-row" style={{ justifyContent: "space-between", height: 40, marginTop: 6 }}><span className="bk-h2">Endings you know</span><Pager n={sPages} i={sp} set={(v) => turnTo(setSp, v, sp)} id="bk-sufs" /></div>
        <div style={{ display: "grid", gap: 4, height: SPP * 44, alignContent: "start" }}>
          {sufs.slice(sp * SPP, sp * SPP + SPP).map((s) => {
            const w = weaveSpell(root, s), S = OT_SUFFIXES[s];
            return <button key={s} id={`bk-word-${s}`} className="bk-btn" aria-pressed={word === s} onClick={() => setWord(s)}
              style={{ height: 40, display: "flex", alignItems: "center", gap: 10, padding: "0 8px", textAlign: "left", opacity: w.ok ? 1 : 0.55 }}>
              <b style={{ fontSize: 22, fontWeight: 500, width: 120, flex: "none" }}>{root}{S.name}</b>
              <span className="bk-s" style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{w.ok ? S.form : "not a word"}</span>
              {w.ok ? <span className="bk-s" style={{ flex: "none" }}>{w.cost} br</span> : null}
            </button>;
          })}
        </div>
        <div style={{ marginTop: 8, height: 130, display: "flex", flexDirection: "column", gap: 8 }}>
          {!sel ? <div className="bk-s">Choose an ending to read the word.</div> : sel.ok ? (<>
            <div className="bk-s bk-clamp3" style={{ color: "#34241a" }}>{sel.desc}</div>
            <div className="bk-row">
              <button id="bk-set" className="bk-btn" onClick={() => { const h = [...G.hotbar]; const j = h.indexOf(sel.id); if (j >= 0) h[j] = null; h[slot] = sel.id; G.hotbar = h; bump(); }}>Set in slot {slot + 1}</button>
              {G.hotbar.includes(sel.id) ? <button id="bk-clear" className="bk-btn" onClick={() => { G.hotbar = G.hotbar.map((x) => (x === sel.id ? null : x)); bump(); }}>Clear</button> : null}
            </div>
          </>) : <div className="bk-s bk-red bk-clamp3">{sel.why}</div>}
        </div>
      </>) : <div className="bk-t">The tome is blank to you, for now.</div>}
    </Page>
  </>);
}

/* --- Map: the Frostcrown Plains --- */
function MapPages({ G, hide, mapId, tile }) {
  const cv = useRef(null);
  const found = G.found || { oak: 1 };
  useEffect(() => { const c = cv.current; if (!c) return; const ink = plainsInk(); c.width = ink.width; c.height = ink.height; c.getContext("2d").drawImage(ink, 0, 0); }, []);
  const MX = PL.left + Math.round((PR.left + PR.width - PL.left - 760) / 2), MY = PL.top + 56, C = 4;
  const P = (t) => [MX + t[0] * C, MY + t[1] * C];
  const here = PLAINS_OFF[mapId] && tile ? [tile[0] + PLAINS_OFF[mapId][0], tile[1] + PLAINS_OFF[mapId][1]] : (() => { const p = MAP_PLACES.find((q) => q.id === placeOfMap(mapId)); return p ? p.at : null; })();
  const nFound = MAP_PLACES.filter((p) => found[p.id]).length;
  const clampX = (x, w) => Math.max(PL.left + 4, Math.min(PR.left + PR.width - w - 4, x));
  return (<div data-hide={hide} className="bk-page" id="bk-map" style={{ left: 0, top: 0, width: BOOK_DW, height: BOOK_DH, overflow: "visible" }}>
    <div style={{ position: "absolute", left: PL.left, top: PL.top, width: PL.width }}><h2 className="bk-h1" style={{ fontSize: 30, whiteSpace: "nowrap" }}>The Frostcrown Plains</h2></div>
    <div className="bk-h2" style={{ position: "absolute", left: PR.left, top: PR.top + 8, width: PR.width, textAlign: "right" }}>Places found: {nFound} of {MAP_PLACES.length}</div>
    <canvas ref={cv} style={{ position: "absolute", left: MX, top: MY, width: 760, height: 440 }} aria-label="Map of the Frostcrown Plains" />
    {[[40, 14, "the Greywick road"], [128, 24, "the Frost Road"], [150, 46, "the downs"]].map(([x, y, s]) => { const [px, py] = P([x, y]); return <div key={s} className="bk-s" style={{ position: "absolute", left: px - 90, top: py - 12, width: 180, textAlign: "center", color: "#857058", fontSize: 18 }}>{s}</div>; })}
    {MAP_PLACES.map((p) => {
      const [px, py] = P(p.at), on = !!found[p.id], S = 56;
      const mx = Math.max(MX, Math.min(MX + 760 - S, px - S / 2)), my = Math.max(MY, Math.min(MY + 440 - S, py - S / 2));
      const lw = Math.ceil(p.name.length * 20 * 0.6) + 16;
      let lx = mx + S / 2 - lw / 2, ly = my - 30;
      if (p.lab === "down") ly = my + S + 2; else if (p.lab === "right") { lx = mx + S + 4; ly = my + S / 2 - 14; } else if (p.lab === "left") { lx = mx - lw - 4; ly = my + S / 2 - 14; }
      lx = clampX(lx, lw); ly = Math.max(MY, Math.min(MY + 440 - 28, ly));
      return <div key={p.id} id={`bk-place-${p.id}`} data-found={on ? "1" : "0"}>
        <div style={{ position: "absolute", left: mx, top: my, filter: on ? "none" : "grayscale(1) opacity(.45)" }}><Sprite src={MEDAL_SRC} idx={MEDAL_IDX[p.id]} cell={28} size={S} /></div>
        {on ? <div className="bk-s" style={{ position: "absolute", left: lx, top: ly, width: lw, height: 28, lineHeight: "28px", textAlign: "center", fontSize: 20, color: "#34241a", background: "rgba(226,212,176,.88)", borderRadius: 4 }}>{p.name}</div> : null}
      </div>;
    })}
    {(() => { const [x] = P([37, 0]); return <div id="bk-south" className="bk-s" style={{ position: "absolute", left: x - 160, top: MY + 440 - 34, width: 320, textAlign: "center", fontSize: 19, whiteSpace: "nowrap", color: "#34241a" }}>
      <span style={{ background: "rgba(226,212,176,.9)", borderRadius: 4, padding: "1px 8px" }}>To southern Etharis ▼</span></div>; })()}
    {here ? (() => { const [x, y] = P(here); return <div id="bk-you" style={{ position: "absolute", zIndex: 3, left: x - 30, top: y - 58, width: 60, textAlign: "center", pointerEvents: "none" }}>
      <div className="bk-s bk-red" style={{ fontSize: 20, background: "rgba(236,222,186,.92)", borderRadius: 4, display: "inline-block", padding: "0 6px" }}>You</div>
      <div style={{ margin: "0 auto", width: 0, height: 0, borderLeft: "13px solid transparent", borderRight: "13px solid transparent", borderTop: "24px solid #7c261e" }} /></div>; })() : null}
    <svg style={{ position: "absolute", left: MX + 760 - 120, top: MY + 440 - 130, width: 110, height: 124 }} viewBox="0 0 110 124" aria-hidden="true">
      <text x="55" y="18" textAnchor="middle" fontSize="20" fill="#34241a" fontFamily="Pixelify Sans">N</text>
      <polygon points="55,24 64,70 55,116 46,70" fill="#62503a" /><polygon points="10,70 55,61 100,70 55,79" fill="#62503a" />
    </svg>
    <div className="bk-row" style={{ position: "absolute", left: PL.left, top: MY + 440 + 10, gap: 22 }}>
      {[["road", "#8c6840"], ["river", "#768c96"], ["wood", "#4a583a"], ["snow", "#ece8dc"]].map(([l, c]) => <span key={l} className="bk-row" style={{ gap: 8 }}><span style={{ width: 24, height: 24, background: c, border: "2px solid #62503a", display: "inline-block" }} /><span className="bk-s">{l}</span></span>)}
    </div>
  </div>);
}

/* --- Beasts: the bestiary --- */
function BeastPages({ G, hide, flip }) {
  const keys = Object.keys(G.beasts || {}).filter((k) => BTL_FOES[k]).sort((a, b) => G.beasts[a].n - G.beasts[b].n);
  const [i, setI] = useState(0);
  const cv = useRef(null);
  const k = keys[Math.min(i, keys.length - 1)], d = k && BTL_FOES[k], b = k && G.beasts[k];
  useEffect(() => {
    const c = cv.current; if (!c || !d) return;
    const x = c.getContext("2d"); x.clearRect(0, 0, c.width, c.height);
    let fr = null; try { const s = foeSprite(d); fr = Array.isArray(s) ? s[0] : s && s.idle ? s.idle[0] : null; } catch (e) { fr = null; }
    if (!fr) return;
    const sc = Math.max(1, Math.min(Math.floor(300 / fr.width), Math.floor(240 / fr.height)));
    x.imageSmoothingEnabled = false;
    x.fillStyle = "rgba(150,126,92,.55)"; x.beginPath(); x.ellipse(170, 252, 140, 18, 0, 0, Math.PI * 2); x.fill();
    x.drawImage(fr, 170 - (fr.width * sc) / 2, 258 - fr.height * sc, fr.width * sc, fr.height * sc);
  }, [k]);
  if (!keys.length) return (<>
    <Page side="L" hide={hide} id="bk-beasts-l"><h2 className="bk-h1">Bestiary</h2><div className="bk-t" style={{ marginTop: 20 }}>Nothing written here yet.</div></Page>
    <Page side="R" hide={hide} id="bk-beasts-r"><div className="bk-t">Every beast you fight gets a page. Read one with Sens in battle and its numbers are written in.</div></Page>
  </>);
  const human = HUMAN_ART.has(d.art), read = b.read, q = (v) => (read ? v : "???");
  const stats = [["Health", d.hp], ["Attack", d.atk], ["Defence", d.def], ["Speed", d.spd], ["Weak to", d.weak.length ? d.weak.join(", ") : "nothing"], ["Resists", d.resist.length ? d.resist.join(", ") : "nothing"]];
  return (<>
    <Page side="L" hide={hide} id="bk-beasts-l">
      <h2 className="bk-h1 bk-clamp2" style={{ fontSize: d.name.length > 16 ? 32 : 40 }}>{d.name}</h2>
      <div className="bk-h2">Level {d.lv} · {d.boss ? "a terror" : human ? "a foe" : "a beast"}</div>
      <canvas ref={cv} width={340} height={270} style={{ display: "block", width: 340, height: 270, margin: "6px auto 0", imageRendering: "pixelated" }} />
      <div className="bk-t bk-clamp3" style={{ color: "#62503a", marginTop: 4 }}>{d.note ? d.note[0].toUpperCase() + d.note.slice(1) + "." : ""}</div>
      <div className="bk-t" style={{ marginTop: 10 }}>Beaten: {b.kills}</div>
    </Page>
    <Page side="R" hide={hide} id="bk-beasts-r">
      <h2 className="bk-h1" style={{ fontSize: 32 }}>What you know</h2>
      <div style={{ display: "grid", gridTemplateColumns: "130px 1fr", rowGap: 6, marginTop: 10 }}>
        {stats.map(([l, v]) => [<span key={l} className="bk-s" style={{ fontSize: 21 }}>{l}</span>, <span key={l + "v"} className="bk-t" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{q(v)}</span>])}
      </div>
      <div className="bk-h2" style={{ marginTop: 14 }}>Drops</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 6, height: 2 * 44 }}>
        {read ? d.drops.slice(0, 4).map(([it]) => <div key={it} className="bk-row" style={{ gap: 6, minWidth: 0 }}><ItemIcon id={it} size={40} /><span className="bk-s" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{(ITEMS[it] || { name: it }).name}</span></div>) : <span className="bk-t">???</span>}
      </div>
      {!read ? <div className="bk-s bk-red bk-clamp2" style={{ marginTop: 8 }}>Read it with Sens in battle to write its numbers in.</div> : <div style={{ height: 8 }} />}
      <div style={{ position: "absolute", left: 0, bottom: 0 }}><Pager n={keys.length} i={i} set={(v) => flip(v > i ? 1 : -1, () => setI(v))} id="bk-beast" /></div>
    </Page>
  </>);
}

/* --- Quests: the Journal (V93) --- */
/* Grouped by act, with what's done kept (struck through) under what's still open, and a Notes page that gathers
   what the party has learned about the threads running through the story. */
function journalNotes(G) {
  const f = G.flags, n = [];
  if (f.arthur_clue || f.q_arthur || f.hakon_capital) {
    const l = [];
    if (f.arthur_clue) l.push("Hakon's brother Arthur was taken by the Iron Cleave and sold south.");
    if ((f.q_arthur | 0) >= 1) l.push("The trail led to the mines of the Western Crags.");
    if (f.hakon_capital) l.push("The overseer's ledger: Arthur was sold on to Sub-Warden Hale of the Archon's Foundry, Capital City.");
    n.push({ h: "Arthur's trail", l });
  }
  if (f.q_comp) {
    const l = [], s = f.q_comp | 0;
    l.push("The former Initiate is looking for a tome like yours, one the College sent away.");
    if (s >= 2) l.push("Its record went into Aurelm's sealed stacks.");
    if (s >= 3) l.push("It was carried to the Great Sanctum in Capital City three winters past, \"not to be spoken of.\"");
    n.push({ h: "The far tome", l });
  }
  const cs = f.comp_story | 0;
  if (cs) {
    const l = ["Teo, a cook's son with no Weaver line, carried the instruments and listened at the back of the College's lessons."];
    if (cs >= 2) l.push("When the Initiates wove a light, Teo's came too, and brighter than any of theirs.");
    if (cs >= 3) l.push("Arbitrators took him north in a closed cart. The College record says he fell from a ledge.");
    if (cs >= 4 || f.comp_story_done) l.push("Asking after Teo cost the Initiate their ring and their place. Magic isn't in the blood.");
    n.push({ h: "The Initiate's story", l });
  }
  if (f.vex_thief || f.capital_letter) {
    const l = [];
    if (f.vex_thief) l.push("Kellan Vex robbed Aurelm's Vault in the spring, looking for your tome.");
    if (f.capital_letter) l.push("He is still looking. The Vaultwarden's letter opens the Capital Gate.");
    n.push({ h: "Kellan Vex", l });
  }
  return n;
}
function QuestPages({ G, hide, flip, tasks }) {
  const f = G.flags, curAct = f.act2_end ? 3 : f.act2 ? 2 : 1;
  const [act, setAct] = useState(curAct);
  const all = typeof ASH_QUESTS !== "undefined" && f.act2 ? ASH_QUESTS.filter(([k]) => qs(G, k) > 0).map(([k, name, steps]) => ({ key: k, name, done: qs(G, k) >= steps.length, act: typeof questAct === "function" ? questAct(k) : 2 })) : [];
  const actOne = { key: "_act1", name: "The Apprentice of Oakhaven", done: !!f.act2, act: 1 };
  const inAct = act === 1 ? [actOne] : all.filter((q) => q.act === act);
  const notes = journalNotes(G);
  const entries = [...(act === curAct ? [{ key: "_now", name: "What's next", now: true }] : []), ...inAct.filter((q) => !q.done), ...inAct.filter((q) => q.done), ...(notes.length ? [{ key: "_notes", name: "Notes", notes: true }] : [])];
  const [sel, setSel] = useState("_now"), [lp, setLp] = useState(0), [rp, setRp] = useState(0);
  const LPP = 7, lPages = Math.max(1, Math.ceil(entries.length / LPP));
  const cur = entries.find((e) => e.key === sel) || entries[0] || { key: "_none", name: "Nothing yet" };
  let lines = [];
  if (cur.now) lines = tasks.filter((t) => !t.done).map((t) => ({ t: t.text, h: t.hint, now: true }));
  else if (cur.notes) for (const nt of notes) { lines.push({ head: nt.h }); for (const l of nt.l) lines.push({ t: l, note: true }); }
  else if (cur.key === "_act1") lines = [
    { t: `Apprenticed in Oakhaven, to ${G.mentorName || "the master"}`, done: true }, { t: "Found the tome, and learned its first words", done: !!(f.d2_tome || f.act2) },
    { t: "Oakhaven burned", done: !!(f.d4_fire || f.act2) }, { t: "Set out across the Frostcrown Plains", done: !!f.act2 }];
  else {
    const q = ASH_QUESTS.find((x) => x[0] === cur.key), s = q ? qs(G, q[0]) : 0;
    if (q) for (let j = 1; j < q[2].length && j <= s; j++) lines.push({ t: q[2][j], h: j === s && s < q[2].length ? q[3][j] : null, done: j < s || s >= q[2].length, now: j === s && s < q[2].length });
    if (q && s >= q[2].length) lines.push({ t: "Done.", done: true });
  }
  const W = PR.width - 30, room = PR.height - 70 - 60;
  const pages = paginate(lines, (l) => (l.head ? 40 : linesOf(l.t, 22, W) * 29 + (l.h ? linesOf(l.h, 19, W) * 25 : 0) + (l.note ? 6 : 16)), room);
  for (let k = 0; k + 1 < pages.length; k++) while (pages[k].length > 1 && pages[k][pages[k].length - 1].head) pages[k + 1].unshift(pages[k].pop());   // no heading left at the foot of a page
  const page = pages[Math.min(rp, pages.length - 1)] || [];
  const acts = [1, ...(f.act2 ? [2] : []), ...(f.act2_end ? [3] : [])];
  const pick = (a) => { setAct(a); setSel(a === curAct ? "_now" : "_first"); setLp(0); setRp(0); };
  const shown = cur;
  return (<>
    <Page side="L" hide={hide} id="bk-quests-l">
      <h2 className="bk-h1">Journal</h2>
      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
        {acts.map((a) => <button key={a} id={`bk-jact-${a}`} className="bk-btn" aria-pressed={act === a} onClick={() => pick(a)} style={{ fontSize: 19, padding: "2px 12px" }}>Act {["", "I", "II", "III"][a]}</button>)}
      </div>
      <div style={{ display: "grid", gap: 6, marginTop: 10, height: LPP * 50 }}>
        {entries.slice(lp * LPP, lp * LPP + LPP).map((e) => {
          const id = e.key, on = (shown && shown.key) === id;
          return <button key={id} id={`bk-q-${(e.key === "_now" || e.key === "_notes" || e.key === "_act1" ? e.key : e.name).replace(/[^a-z0-9]/gi, "")}`} className="bk-btn" aria-pressed={on} onClick={() => { setSel(id); setRp(0); }}
            style={{ height: 44, textAlign: "left", fontSize: 21, color: e.done ? "#968470" : "#34241a", textDecoration: e.done ? "line-through" : "none", textDecorationColor: "rgba(90,60,40,.5)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            <span style={{ color: e.done ? "#5a7a3a" : e.notes ? "#3c5a7a" : "#7a2a20", display: "inline-block", width: 26, textDecoration: "none" }}>{e.done ? "✓" : e.notes ? "✎" : e.now ? "▸" : "◆"}</span>{e.name}</button>;
        })}
      </div>
      <div style={{ position: "absolute", left: 0, bottom: 0 }}><Pager n={lPages} i={lp} set={(v) => flip(v > lp ? 1 : -1, () => setLp(v))} id="bk-qlist" /></div>
    </Page>
    <Page side="R" hide={hide} id="bk-quests-r">
      <h2 className="bk-h1 bk-clamp2" style={{ fontSize: (shown ? shown.name : "").length > 20 ? 30 : 36 }}>{shown ? shown.name : ""}</h2>
      <div style={{ marginTop: 12, display: "grid", gap: 10, paddingRight: 30 }}>
        {shown ? (page.length ? page.map((l, j) => l.head
          ? <div key={j} className="bk-h2" style={{ color: "#5a2418", marginTop: j ? 8 : 0 }}>{l.head}</div>
          : <div key={j}>
            <div className="bk-t" style={{ color: l.done ? "#968470" : "#34241a" }}>{l.done ? "✓ " : l.now ? "• " : ""}{l.t}</div>
            {l.h ? <div className="bk-s" style={{ marginTop: 2 }}>{l.h}</div> : null}
          </div>) : <div className="bk-t">Nothing pressing.</div>) : null}
      </div>
      <div style={{ position: "absolute", left: 0, bottom: 0 }}><Pager n={pages.length} i={Math.min(rp, pages.length - 1)} set={(v) => flip(v > rp ? 1 : -1, () => setRp(v))} id="bk-qsteps" /></div>
    </Page>
  </>);
}

/* ---------- the Pack ---------- */
const PACK_W = 1400, PACK_H = 700;
const PACK_CATS = [["all", "All", "all"], ["supply", "Supplies", "supply"], ["gear", "Gear", "gear"], ["mat", "Materials", "mat"], ["quest", "Quest", "quest"]];
function packCat(id) {
  const it = ITEMS[id] || {};
  if (it.quest) return "quest";
  if (it.gear || it.cat === "arms") return "gear";
  if (it.cat === "supply" || it.cat === "food" || ["bread", "tonic", "poultice", "candle", "oil", "ration", "haunch", "alekeg"].includes(id)) return "supply";
  return "mat";
}
const PACK_CSS = `
.pk-ov{position:absolute;inset:0;z-index:60;background:rgba(8,6,10,.72);overflow:hidden;touch-action:none}
.pk-stage{position:absolute;left:50%;top:50%;transform-origin:0 0;font-family:'Pixelify Sans',ui-monospace,monospace;color:#e8d2a0;animation:bkOpen .25s ease-out}
.pk-panel{position:absolute;inset:0;image-rendering:pixelated;background-size:372px 384px;border:6px solid;border-image:linear-gradient(90deg,#968a74,#d4891e) 1;box-shadow:inset 0 0 0 6px #24161e,inset 0 0 0 10px rgba(212,137,30,.35),0 8px 0 #0b080c}
.pk-btn{font:inherit;font-size:22px;color:#e8d2a0;background:rgba(36,22,30,.85);border:3px solid #6e5a48;border-radius:4px;padding:4px 12px 4px 6px;display:flex;align-items:center;gap:8px;cursor:pointer;height:52px}
.pk-btn[aria-pressed="true"]{border-color:#d4891e;color:#ffe2a8;background:rgba(80,42,40,.9)}
.pk-btn:disabled{opacity:.35;cursor:default}
.pk-slot{font:inherit;color:inherit;background:none;border:3px solid transparent;border-radius:6px;display:flex;align-items:center;gap:14px;padding:4px;text-align:left;cursor:pointer;min-width:0}
.pk-slot[aria-pressed="true"]{border-color:#d4891e;background:rgba(212,137,30,.1)}
.pk-stage .bk-pager{color:#c8b088}.pk-stage .bk-pager button{border-color:#8a7258;color:#f0d8a4}
.pk-frame{position:relative;width:88px;height:92px;flex:none;background-size:88px 92px;image-rendering:pixelated;display:grid;place-items:center}
`;
function PackScreen({ G, onClose, onGo, nameOf, descOf }) {
  const ov = useRef(null), k = useStageScale(ov, PACK_W, PACK_H);
  const [cat, setCat] = useState("all"), [pg, setPg] = useState(0), [sel, setSel] = useState(null);
  useEffect(() => {
    const kd = (e) => { if (e.key === "Escape" || e.key === "i") { e.stopPropagation(); onClose(); } };
    window.addEventListener("keydown", kd, true); return () => window.removeEventListener("keydown", kd, true);
  }, [onClose]);
  const all = Object.entries(G.items).filter(([, n]) => n > 0);
  const list = all.filter(([id]) => cat === "all" || packCat(id) === cat);
  const PER = 9, pages = Math.max(1, Math.ceil(list.length / PER)), p = Math.min(pg, pages - 1);
  const pick = sel && G.items[sel] > 0 ? sel : null, it = pick ? ITEMS[pick] || {} : null;
  const tx = `${-PACK_W * k / 2}px`, ty = `${-PACK_H * k / 2}px`;
  return (
    <div className="pk-ov" ref={ov} role="dialog" aria-label="Pack" onPointerDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <style>{BOOK_CSS + PACK_CSS}</style>
      <div className="pk-stage" id="pk-stage" style={{ width: PACK_W, height: PACK_H, transform: `translate(${tx},${ty}) scale(${k})`, "--tx": tx, "--ty": ty, "--k": k }}>
        <div className="pk-panel" style={{ backgroundImage: `url(${PACK_BACK_SRC})` }} />
        <div style={{ position: "absolute", left: 40, top: 30, right: 40, display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 46, color: "#f0d8a4" }}>Pack</span>
          <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 24, color: "#c8b088", marginLeft: 18 }}><Glyph k="coin" size={36} />{G.coins} coppers</span>
          <span style={{ flex: 1 }} />
          <button className="pk-btn" id="pk-gear" onClick={() => onGo("gear")}><Glyph k="gear" size={36} />Gear</button>
          <button className="pk-btn" id="pk-close" aria-label="Close the pack" onClick={onClose}><Glyph k="close" size={36} />Close</button>
        </div>
        <div role="tablist" style={{ position: "absolute", left: 40, top: 104, display: "flex", gap: 10 }}>
          {PACK_CATS.map(([id, label, g]) => <button key={id} role="tab" id={`pk-cat-${id}`} className="pk-btn" aria-pressed={cat === id} onClick={() => { setCat(id); setPg(0); }}><Glyph k={g} size={36} />{label}</button>)}
        </div>
        <div style={{ position: "absolute", right: 44, top: 108 }}><Pager n={pages} i={p} set={setPg} id="pk-page" /></div>
        <div style={{ position: "absolute", left: 40, top: 176, width: PACK_W - 80, height: 3 * 106, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gridAutoRows: 102, gap: "4px 12px" }}>
          {list.length ? list.slice(p * PER, p * PER + PER).map(([id, n]) => (
            <button key={id} id={`pk-item-${id}`} className="pk-slot" aria-pressed={pick === id} onClick={() => setSel(id)}>
              <span className="pk-frame" style={{ backgroundImage: `url(${PACK_SLOT_SRC})` }}><ItemIcon id={id} size={64} /></span>
              <span style={{ minWidth: 0 }}>
                <span className="bk-clamp2" style={{ fontSize: 23, lineHeight: 1.2, color: "#f0dcae" }}>{nameOf(id)}</span>
                <span style={{ fontSize: 20, color: "#b49c78" }}>x{n}</span>
              </span>
            </button>
          )) : <div style={{ fontSize: 24, color: "#c8b088", gridColumn: "1/4" }}>{all.length ? "Nothing of that kind." : "Your pack is empty. Pike's Provisions sells most things."}</div>}
        </div>
        <div id="pk-detail" style={{ position: "absolute", left: 30, right: 30, bottom: 30, height: 168, background: "rgba(36,20,28,.92)", borderTop: "4px solid #6e5a48", padding: "14px 22px", boxSizing: "border-box", display: "flex", gap: 20, overflow: "hidden" }}>
          {it ? (<>
            <span className="pk-frame" style={{ backgroundImage: `url(${PACK_SLOT_SRC})` }}><ItemIcon id={pick} size={64} /></span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 30, color: "#f0d8a4", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{nameOf(pick)}</div>
              <div className="bk-clamp3" style={{ fontSize: 21, lineHeight: 1.3, color: "#d2bc94", marginTop: 4 }}>{descOf(pick)}</div>
            </div>
            <div style={{ flex: "none", width: 220, fontSize: 20, color: "#b49c78", textAlign: "right", lineHeight: 1.5 }}>
              <div>Carrying {G.items[pick]}</div>
              {it.quest ? <div>Quest item</div> : it.sell ? <div>Sells for {it.sell}</div> : null}
              {it.gear ? <div>Wear it from Gear</div> : null}
            </div>
          </>) : <div style={{ fontSize: 22, color: "#b49c78", alignSelf: "center" }}>Tap something to look at it.</div>}
        </div>
      </div>
    </div>
  );
}
