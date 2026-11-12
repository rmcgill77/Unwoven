/* ------------------------------------------------------------------ */
/* Intro slides (animated pixel scenes), and the mirror / wardrobe       */
/* ------------------------------------------------------------------ */
const HEROES = { m: { name: "Corin", pro: "he", sprite: "m" }, f: { name: "Elowyn", pro: "she", sprite: "f" } };
const INTRO_SEEN_KEY = "durinn_intro_seen_v1";
const introSeen = () => { try { return localStorage.getItem(INTRO_SEEN_KEY) === "1"; } catch (e) { return false; } };
const markIntroSeen = () => { try { localStorage.setItem(INTRO_SEEN_KEY, "1"); } catch (e) { /* ignore */ } };
/* The intro slides are staged in the game itself: a fixed shot of a real map, the real lighting and grade,
   chibi actors, and a few scene effects drawn on the same pixel grid as the world. */
const T16 = 16;
const fxR = (x, c, a, b, w, h) => { x.fillStyle = c; x.fillRect(Math.round(a), Math.round(b), Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); };
const fxRng = (seed) => { let v = seed; return () => (v = (v * 16807) % 2147483647) / 2147483647; };
// Old Tongue glyphs: staves with angled branches, 5 wide, 7 tall
const RUNES = [
  ["..#..", "..#.#", "..##.", "..#..", ".##..", "#.#..", "..#.."], ["#...#", ".#.#.", "..#..", "..#..", "..#..", ".#.#.", "#...#"],
  ["..#..", ".###.", "#.#.#", "..#..", "..#..", "..#..", ".#.#."], ["#.#..", "#..#.", "#...#", "#..#.", "#.#..", "##...", "#...."],
  ["..#..", "..#..", "#.#.#", ".###.", "..#..", ".#.#.", "#...#"], [".#...", ".##..", ".#.#.", ".#..#", ".#.#.", ".##..", ".#..."],
];
function fxRune(x, k, px, py, col) { const g = RUNES[k % RUNES.length]; x.fillStyle = col; for (let r = 0; r < 7; r++) for (let c = 0; c < 5; c++) if (g[r][c] === "#") x.fillRect(Math.round(px + c), Math.round(py + r), 1, 1); }
function fxRain(x, t, w, h, n, col) { const r = fxRng(5); x.fillStyle = col; for (let i = 0; i < n; i++) { const sp = 150 + r() * 90, X = (r() * (w + 40) - t * 30 + 4000) % (w + 40) - 20, Y = (r() * h + t * sp) % (h + 10) - 10; x.fillRect(Math.round(X), Math.round(Y), 1, 4); } }
function fxMotes(x, t, cx, cy, ox, oy, rw, rh, n, col) { const r = fxRng(17); x.fillStyle = col; for (let i = 0; i < n; i++) { const ph = (t * (0.05 + r() * 0.08) + r()) % 1; x.globalAlpha = Math.sin(ph * Math.PI) * 0.8; x.fillRect(Math.round(ox + r() * rw + Math.sin(t * 0.7 + i) * 3 - cx), Math.round(oy + rh - ph * rh - cy), 1, 1); } x.globalAlpha = 1; }
function fxBundle(x, bx, by) {   // a wicker basket with a pale blanket, left on a doorstep
  fxR(x, "#0b0a10", bx - 7, by + 3, 15, 2);
  fxR(x, "#3a2a1c", bx - 7, by - 3, 14, 7); fxR(x, "#5a4028", bx - 6, by - 2, 12, 5); for (let i = 0; i < 6; i++) fxR(x, "#2e2016", bx - 6 + i * 2, by - 2, 1, 5);
  fxR(x, "#c8bea6", bx - 5, by - 6, 10, 4); fxR(x, "#e4dac2", bx - 4, by - 7, 6, 2); fxR(x, "#9a907a", bx + 2, by - 5, 3, 2);
}
const MAP_IMG = (() => { if (typeof Image === "undefined") return null; const a = new Image(), b = new Image(); a.src = TALVORA_MAP_PNG; b.src = ETHARIS_EDGE_PNG; return { map: a, edge: b }; })();
const PXF = { P: "11110100011000111110100001000010000", X: "10001010100101000100010100101010001", C: "01111100001000010000100001000001111", M: "10001110111010110101100011000110001", K: "10001100101010011000101001001010001", Y: "10001100010101000100001000010000100", A: "01110100011000111111100011000110001", B: "11110100011000111110100011000111110", D: "11110100011000110001100011000111110", E: "11111100001000011110100001000011111",
  F: "11111100001000011110100001000010000", G: "01111100001000010011100011000101111", H: "10001100011000111111100011000110001", I: "11111001000010000100001000010011111",
  L: "10000100001000010000100001000011111", N: "10001110011010110101100111000110001", O: "01110100011000110001100011000101110", R: "11110100011000111110101001001010001",
  S: "01111100001000001110000010000111110", T: "11111001000010000100001000010000100", U: "10001100011000110001100011000101110", V: "10001100011000110001010100101000100",
  W: "10001100011000110101101011101110001", Z: "11111000010001000100010001000011111" };
function fxText(x, str, cx, cy, col, sc) {   // 5x7 capitals with a dark halo, centred on (cx, cy)
  const w = str.length * 6 * sc - sc, x0 = Math.round(cx - w / 2), y0 = Math.round(cy - 3.5 * sc);
  for (const pass of [0, 1]) { x.fillStyle = pass ? col : "#140e0c";
    for (let i = 0; i < str.length; i++) { const g = PXF[str[i]]; if (!g) continue;
      for (let r = 0; r < 7; r++) for (let c = 0; c < 5; c++) if (g[r * 5 + c] === "1") {
        const X = x0 + (i * 6 + c) * sc, Y = y0 + r * sc;
        if (pass) x.fillRect(X, Y, sc, sc); else x.fillRect(X - 1, Y - 1, sc + 2, sc + 2); } } }
}
const SLIDE_SCENES = [
  // 1 · Talvora: Ryan's own map, pixelated; a slow drift toward Etharis, which then glows at its edges
  () => ({ map: "oak", time: 12 * 60, zoom: 0.75,
    fx: (x, t, cx, cy, w, h) => {
      fxR(x, "#2c231b", 0, 0, w, h);
      const M = MAP_IMG && MAP_IMG.map; if (!M || !M.complete || !M.width) return;
      const top = h * 0.08, room = h * 0.74, sc = Math.min(w / M.width, room / M.height), dw = M.width * sc, dh = M.height * sc;   // the whole map, between the top bar and the caption
      const ox = (w - dw) / 2, oy = top + (room - dh) / 2 + Math.round(Math.sin(t * 0.6));
      x.imageSmoothingEnabled = false; x.globalAlpha = Math.min(1, t / 1.2);
      x.drawImage(M, Math.round(ox), Math.round(oy), Math.round(dw), Math.round(dh));
      const E = MAP_IMG.edge; if (E && E.complete && t > 2.6) { x.globalCompositeOperation = "lighter"; x.globalAlpha = Math.min(1, (t - 2.6) / 1.5) * (0.45 + 0.35 * Math.sin(t * 2.2)); x.drawImage(E, Math.round(ox), Math.round(oy), Math.round(dw), Math.round(dh)); x.globalCompositeOperation = "source-over"; }
      x.globalAlpha = 1;
      const L = (str, mx, my, col, sc) => fxText(x, str, Math.round(ox + mx * dw), Math.round(oy + my * dh), col, sc || 1);
      L("TALVORA", 0.5, 0.06, "#e8c88c", 2); L("ETHARIS", 0.274, 0.547, "#f2e2b8"); L("THE FROZEN VALE", 0.414, 0.157, "#cfc0a0"); L("FELBRIN", 0.598, 0.273, "#cfc0a0");
      L("THE RINGVAL WILDS", 0.775, 0.523, "#cfc0a0"); L("DURTE", 0.862, 0.674, "#cfc0a0");
      L("THE", 0.488, 0.46, "#b8a890"); L("DREAD", 0.488, 0.515, "#b8a890"); L("EXPANSE", 0.488, 0.57, "#b8a890"); } }),
  // 2 · the ley-lines, the Divide, the Old Tongue: the pillar in the square, veins of light, runes rising
  () => ({ map: "oak", time: 23 * 60, x: 24 * T16, y: 18 * T16, panX: 4,
    lights: (t) => [{ x: 24 * T16, y: 17 * T16 + 4, r: 70, c: "#7fd0c8", soft: false, str: 0.75 + 0.25 * Math.sin(t * 1.6) }],
    fx: (x, t, cx, cy, w, h) => {
      const px = 24 * T16 - cx, py = 18 * T16 - cy;
      for (let k = 0; k < 6; k++) { const ang = k * 1.047 + 0.4, len = Math.min(160, t * 45);
        for (let i = 6; i < len; i += 1) { const wob = Math.sin(i * 0.09 + k * 2) * 6, X = px + Math.cos(ang) * i - Math.sin(ang) * wob, Y = py + Math.sin(ang) * i * 0.6 + Math.cos(ang) * wob * 0.6;
          const flow = (i - t * 40) % 24; x.globalAlpha = flow < 0 && flow > -6 ? 0.95 : 0.35; fxR(x, k % 2 ? "#4a88c0" : "#7fd0c8", X, Y, 1, 1); } }
      x.globalAlpha = 1;
      for (let i = 0; i < 9; i++) { const ph = (t * 0.16 + i / 9) % 1, al = Math.min(1, t * 0.5) * Math.sin(ph * Math.PI);
        x.globalAlpha = al; fxRune(x, i, px - 34 + ((i * 37) % 68) + Math.sin(t + i) * 3, py - 14 - ph * 64, i % 3 ? "#9fe0ff" : "#e8f6ff"); }
      x.globalAlpha = 1; } }),
  // 3 · the Weaver Order keeps the books: the mayor's house by candlelight, a ledger writing itself
  () => ({ map: "hall", time: 23 * 60, x: 6 * T16, y: 4 * T16, zoom: 1.5,
    lights: (t) => [{ x: 5 * T16 + 16, y: 3 * T16 + 6, r: 40, c: "#ffb050", flicker: true, str: 0.9 }],
    fx: (x, t, cx, cy) => {
      const bx = 5 * T16 + 9 - cx, by = 3 * T16 + 2 - cy;
      fxR(x, "#1a1416", bx - 1, by - 1, 22, 11); fxR(x, "#d8cca8", bx, by, 9, 9); fxR(x, "#e6dcbc", bx + 11, by, 9, 9); fxR(x, "#5a4232", bx + 9, by, 2, 9);
      const n = Math.min(14, Math.floor(t * 1.6));
      for (let i = 0; i < n; i++) { const col = i % 7, row = Math.floor(i / 7); fxR(x, "#2a2230", bx + 1 + row * 11, by + 1 + col * 1.2, 4 + (i * 3) % 4, 1); }
      const q = Math.min(13, n), qx = bx + 3 + Math.floor(q / 7) * 11 + Math.sin(t * 9) * 1.5, qy = by + 1 + (q % 7) * 1.2;
      fxR(x, "#e8e4d8", qx + 3, qy - 7, 1, 7); fxR(x, "#c8c0b0", qx + 4, qy - 8, 1, 4); fxR(x, "#14141c", qx + 3, qy, 1, 1);
      fxMotes(x, t, cx, cy, 2 * T16, 1 * T16, 7 * T16, 4 * T16, 18, "#ffd890"); } }),
  // 4 · a storm, a bundle on the step of a workshop in Oakhaven
  (c) => ({ map: "oak", time: 90, x: 14 * T16 + 8, y: 13 * T16, panY: 3, zoom: 1.5,
    lights: (t) => t > 3 ? [{ x: 14 * T16 + 8, y: 12 * T16 + 14, r: 34, c: "#ffc070", flicker: true, str: Math.min(1, (t - 3) * 0.6) }] : [],
    fx: (x, t, cx, cy, w, h) => {
      fxBundle(x, 14 * T16 + 8 - cx, 13 * T16 + 9 - cy);
      fxRain(x, t, w, h, 170, "rgba(150,170,210,0.55)");
      const r = fxRng(3); x.fillStyle = "rgba(170,190,230,0.5)"; for (let i = 0; i < 26; i++) { const ph = (t * 2.3 + r()) % 1; if (ph < 0.25) x.fillRect(Math.round(r() * w), Math.round(r() * h), 2, 1); else { r(); r(); } }
      const fl = (t % 6.5); if (fl > 5.6 && fl < 5.75 || fl > 5.85 && fl < 5.92) { x.globalAlpha = 0.35; fxR(x, "#dce6ff", 0, 0, w, h); x.globalAlpha = 1; } } }),
  // 5 · growing up in the trade: the workshop by day, a child at the bench, the master close by
  (c) => { const st = ((MAP_DEFS.shop.stations || {})[c.trade] || [{ x: 2, y: 3 }])[0], sx = st.x * T16, sy = st.y * T16;
    return { map: "shop", trade: c.trade, time: 10 * 60, x: sx + 44, y: sy + 26, zoom: 2,
      actors: [{ look: c.look, child: true, x: sx + 30, y: sy + 30, dir: "left" }, { look: npcLookFor("mentor", { trade: c.trade }), x: sx + 58, y: sy + 46, dir: "left" }],
      lights: c.trade === "smith" ? (t) => [{ x: 2 * T16 + 16, y: 2 * T16 + 10, r: 46, c: "#ff8a3a", flicker: true, str: 1 }] : null,
      fx: (x, t, cx, cy) => {
        if (c.trade === "smith") { const r = fxRng(9); for (let i = 0; i < 16; i++) { const ph = (t * 1.3 + r()) % 1, a = r() * 6.28; x.globalAlpha = 1 - ph; fxR(x, ph < 0.4 ? "#ffd070" : "#ff7a30", sx + 20 + Math.cos(a) * ph * 18 - cx, sy + 16 - ph * 20 + Math.sin(a) * ph * 6 - cy, 1, 1); } x.globalAlpha = 1; }
        fxMotes(x, t, cx, cy, 1 * T16, 2 * T16, 11 * T16, 6 * T16, 22, "#e8d8a8"); } }; },
  // 6 · Tessa: the two of them walking to the well at dusk, a heel of bread between them
  (c) => ({ map: "oak", time: 18.5 * 60, x: 21 * T16 + 8, y: 22 * T16 + 8, panX: 3, zoom: 2,
    actors: [{ look: c.look, child: true, x: 17 * T16, y: 23 * T16 + 8, walk: { tx: 22 * T16 + 6, ty: 23 * T16 + 8, speed: 17, delay: 0.5, end: "right" } },
      { look: { chibi: "tessa" }, child: true, x: 17 * T16 + 17, y: 23 * T16 + 3, walk: { tx: 22 * T16 + 23, ty: 23 * T16 + 3, speed: 17, delay: 0.5, end: "left" } }],
    fx: (x, t, cx, cy) => { if (t > 6.4) { const bx = 22 * T16 + 15 - cx, by = 23 * T16 - 8 - cy - Math.min(2, (t - 6.4) * 2); fxR(x, "#5a3a1e", bx - 2, by, 5, 3); fxR(x, "#c8964a", bx - 2, by, 5, 2); fxR(x, "#e8b86a", bx - 1, by, 2, 1); } } }),
  // 7 · nineteen winters: the same work, as a grown apprentice, in the same workshop
  (c) => { const st = ((MAP_DEFS.shop.stations || {})[c.trade] || [{ x: 2, y: 3 }])[0], sx = st.x * T16, sy = st.y * T16;
    return { map: "shop", trade: c.trade, time: 15 * 60, x: sx + 44, y: sy + 26, zoom: 2,
      actors: [{ look: c.look, x: sx + 30, y: sy + 30, dir: "left", keep: true }, { look: npcLookFor("mentor", { trade: c.trade }), x: sx + 58, y: sy + 46, dir: "left", keep: true }],
      fx: (x, t, cx, cy) => fxMotes(x, t, cx, cy, 1 * T16, 2 * T16, 11 * T16, 6 * T16, 14, "#a89a7a") }; },
  // 8 · the dream: the hero before the pillar, the whole town gathered and cheering, gold light and petals
  (c) => { const hx = 24 * T16 - 4, hy = 19 * T16 + 2;
    const ring = [["tessa", -24, 10, "up"], ["bram", -44, 6, "right"], ["wenna", -62, 0, "right"], ["pip", -54, 20, "up"], ["joss", -36, 26, "up"], ["edda", -16, 30, "up"],
      ["tomas", 4, 30, "up"], ["lenna", 22, 26, "up"], ["garrick", 38, 14, "left"], ["hester", 46, -2, "left"], ["ansel", 22, 8, "up"], ["maud", -76, 14, "right"]];
    return { map: "oak", time: 12 * 60, x: hx - 8, y: hy - 4, zoom: 2,
      actors: [{ look: c.look, x: hx, y: hy, dir: "down", keep: true }].concat(
        [{ look: npcLookFor("mentor", { trade: c.trade }), x: hx - 8, y: hy + 22, dir: "up", keep: true, hop: 11 }],
        ring.map(([id, dx, dy, d], i) => ({ look: { chibi: id }, x: hx + dx, y: hy + dy + 8, dir: d, keep: true, hop: i + 1 }))),
      fx: (x, t, cx, cy, w, h) => {
        const px = hx - cx, py = hy - cy;
        x.globalCompositeOperation = "lighter";
        x.globalAlpha = 0.13; fxR(x, "#ffcf7a", 0, 0, w, h);
        for (let i = 0; i < 7; i++) { const a = -1.9 + i * 0.13 + Math.sin(t * 0.4 + i) * 0.03, al = 0.11 + 0.05 * Math.sin(t * 1.3 + i * 2);
          x.globalAlpha = al; x.fillStyle = "#ffe0a0"; x.beginPath(); x.moveTo(px, py - 18); x.lineTo(px + Math.cos(a) * 260 - 7, py + Math.sin(a) * 260); x.lineTo(px + Math.cos(a) * 260 + 7, py + Math.sin(a) * 260); x.closePath(); x.fill(); }
        const gr = x.createRadialGradient(px, py - 12, 2, px, py - 12, 46); gr.addColorStop(0, "rgba(255,226,150,0.8)"); gr.addColorStop(1, "rgba(255,226,150,0)");
        x.globalAlpha = 0.7 + 0.3 * Math.sin(t * 2); x.fillStyle = gr; x.fillRect(px - 50, py - 62, 100, 100);
        x.globalCompositeOperation = "source-over"; x.globalAlpha = 1;
        const r = fxRng(31); for (let i = 0; i < 60; i++) { const sp = 10 + r() * 14, X = (r() * (w + 20) + Math.sin(t * 1.5 + i) * 6) % (w + 20) - 10, Y = (r() * h + t * sp) % (h + 8) - 4;
          fxR(x, ["#f0d890", "#e8a8b0", "#fff4dc", "#c8e0a0"][i % 4], X, Y, i % 3 ? 1 : 2, 1); }
        const v = x.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.62); v.addColorStop(0, "rgba(255,244,220,0)"); v.addColorStop(1, "rgba(255,244,220,0.6)");
        x.fillStyle = v; x.fillRect(0, 0, w, h); } }; },
];
/* each beat is [scene, caption]; consecutive beats on the same scene keep it running */
function slideBeats(part, trade) {
  const T = TRADES[trade] || TRADES.clerk;
  if (part === 1) return [
    [0, "Talvora, a continent full of war and magic, split in half by a great war. Within Talvora lies one of its great countries: Etharis, a land ruled by the Archon Covenant."],
    [1, "Energy flows deep beneath the dirt in veins of light originating from a great orb known as The Divide. Throughout the land the Covenant built magical pillars that helped direct and stabilize these veins, which became known as leylines."],
    [1, "Towns, villages and even some cities rose around these pillars ensuring the safety of the people, for outside the protective range of the pillars are threats ready and willing to end anyone daring enough to travel outside of them."],
    [2, "The Covenant says Weavers, casters of magic, are only born from special bloodlines and keep their books hidden away from the public. Anyone found with a suspicious tome is usually never seen again."],
    [3, "One stormy night in the small village of Oakhaven, a crying bundle was left on the steps of a house. No one knows who left it."],
  ];
  return [
    [4, `You grew up in ${MENTOR_NAME}'s copy house, copying and sorting texts from first light. Your hands learned the work before your head did.`],
    [5, "Tessa Hollis, Bram's niece from the Hollow Oak, taken in the same winter you were left. She never asked where you came from. Only whether you wanted the heel of the loaf."],
    [6, "Nineteen winters and nothing has changed in the little village. The same work, the same people, the same boring day to day life."],
    [7, "But you dream that one day you'll be someone great in the world, remembered for unimaginable feats."],
  ];
}
function IntroSlides({ part, trade, look, canSkip, onDone, eng }) {
  const beats = slideBeats(part, trade), texts = beats.map((b) => b[1]);
  const [i, setI] = useState(0), [typed, setTyped] = useState(0), [veil, setVeil] = useState(1);
  const text = texts[i], done = typed >= text.length;
  useEffect(() => {
    setTyped(0);
    if (i > 0 && beats[i - 1][0] === beats[i][0]) return;   // same scene: only the caption changes
    setVeil(1);
    const id1 = setTimeout(() => { if (eng) eng.stage(SLIDE_SCENES[beats[i][0]]({ trade: trade || "smith", look: look || { sex: "m" } })); }, 380);
    const id2 = setTimeout(() => setVeil(0), 480);
    return () => { clearTimeout(id1); clearTimeout(id2); };
  }, [i]);
  useEffect(() => () => { if (eng) eng.stage(null); }, []);
  useEffect(() => { if (done || veil) return; const id = setTimeout(() => setTyped((n) => Math.min(text.length, n + 1)), 28); return () => clearTimeout(id); }, [typed, i, done, veil, text.length]);
  const next = () => { if (veil) return; if (!done) { setTyped(text.length); return; } if (i + 1 < texts.length) setI(i + 1); else onDone(); };
  return (
    <div className="dz-slides" id="dz-slides" onClick={next}>
      <style>{`.dz-slides{position:fixed;inset:0;z-index:60;cursor:pointer}
.dz-sveil{position:absolute;inset:0;background:#07060a;opacity:0;transition:opacity .38s;pointer-events:none}.dz-sveil[data-on="1"]{opacity:1}
.dz-sbar{position:absolute;left:0;right:0;height:7vh;background:#07060a}
.dz-scap{position:absolute;left:0;right:0;bottom:0;padding:9vh 9% 4.5vh;background:linear-gradient(transparent,#07060ae6 42%);color:#eadfc4;font:clamp(14px,3.1vh,24px)/1.5 Georgia,serif;text-align:center;text-shadow:0 1px 0 #000}
.dz-scap i{display:block;margin:0 auto 6px;width:clamp(120px,22vw,220px);height:1px;background:linear-gradient(90deg,transparent,#a8946a,transparent)}
.dz-snext{position:absolute;right:16px;bottom:10px;color:#a89a76;font:11px monospace;letter-spacing:2px;text-transform:uppercase}.dz-sskip{position:absolute;right:12px;top:10px;z-index:2;font:12px monospace}
.dz-sdots{position:absolute;left:0;right:0;top:2.6vh;display:flex;gap:7px;justify-content:center;pointer-events:none}.dz-sdots b{width:6px;height:6px;transform:rotate(45deg);background:#3a3446}.dz-sdots b[data-on="1"]{background:#e8d8a8}`}</style>
      <div className="dz-sbar" style={{ top: 0 }} />
      <div className="dz-scap" id="dz-scap"><i />{text.slice(0, typed)}<span style={{ opacity: 0 }}>{text.slice(typed)}</span></div>
      <div className="dz-sveil" data-on={veil} />
      <div className="dz-sdots">{texts.map((_, k) => <b key={k} data-on={k === i ? 1 : 0} />)}</div>
      {canSkip ? <button className="dz-opt dz-sskip" id="dz-slides-skip" onClick={(e) => { e.stopPropagation(); onDone(); }}>Skip</button> : null}
      <div className="dz-snext">{done ? (i + 1 < texts.length ? "tap to continue" : "tap to begin") : ""}</div>
    </div>
  );
}
/* the mirror by the fireplace: hair colour and clothes. Required once, before the first time out of the door. */
function Wardrobe({ look, first, onDone, onCancel }) {
  const [lk, setLk] = useState(look);
  const set = (k, v) => setLk((l) => ({ ...l, [k]: v }));
  const male = lk.sex !== "f";
  return (
    <div className="dz-overlay">
      <div className="dz-panel" role="dialog" aria-label="The mirror" style={{ height: "100%" }}>
        <div className="dz-phead"><div className="dz-ptitle">The mirror</div><span className="dz-steps">{first ? "Before you go out" : "Hair and clothes"}</span></div>
        <div className="dz-create">
          <div className="dz-preview">
            <div className="dz-portrait" style={{ width: 192, height: 192 }}><PixelImage source={getPortrait(lk)} scale={1.75} /></div>
            <div style={{ display: "grid", gap: 6, justifyItems: "center" }}><span className="dz-wspr"><WalkingSprite look={lk} scale={3} /></span></div>
          </div>
          <div className="dz-cbody">
            <div className="dz-row"><b>Hair colour</b><div className="dz-sws">
              {HAIRS.map((s, i) => <button key={i} id={`dz-hair-${i}`} className="dz-swb" aria-label={s.name} aria-pressed={lk.hair === i} style={{ background: s.b }} onClick={() => set("hair", i)} />)}
            </div></div>
            <div className="dz-row"><b>{male ? "Cloak" : "Dress"}</b><div className="dz-sws">
              {CLOTHS.map((s, i) => <button key={i} id={`dz-cloth-${i}`} className="dz-swb" aria-label={s.name} aria-pressed={lk.cloth === i} style={{ background: s.b }} onClick={() => set("cloth", i)} />)}
            </div></div>
            {male ? <div className="dz-row"><b>Tunic</b><div className="dz-sws">
              {TUNICS.map((s, i) => <button key={i} id={`dz-tunic-${i}`} className="dz-swb" aria-label={s.name} aria-pressed={lk.tunic === i} style={{ background: s.b }} onClick={() => set("tunic", i)} />)}
            </div></div> : null}
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.45, color: "var(--muted)" }}>{first ? "Choose how you want to be seen. You can come back to the mirror whenever you like." : "Come back whenever you like."}</p>
          </div>
        </div>
        <div className="dz-cfoot">
          {first ? <span /> : <button className="dz-opt" id="dz-mirror-cancel" onClick={onCancel}>Cancel</button>}
          <button className="dz-act" id="dz-mirror-done" onClick={() => onDone(lk)}>Done</button>
        </div>
      </div>
    </div>
  );
}
