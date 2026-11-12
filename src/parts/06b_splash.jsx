
/* ------------------------------------------------------------------ */
/* Burnt Pixel Studios splash: animated, cannot be skipped             */
/* ------------------------------------------------------------------ */
const FONT5 = {
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  N: ["10001", "11001", "10101", "10101", "10011", "10001", "10001"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
};
const SPLASH_W = 256, SPLASH_H = 144, SPLASH_LEN = 5.6;

function splashMask(str, gap) {
  // returns list of {x,y} pixels for the string in 5x7 glyphs, plus width
  const px = [];
  let cx = 0;
  for (const ch of str) {
    const g = FONT5[ch] || FONT5[" "];
    for (let y = 0; y < 7; y++) for (let x = 0; x < 5; x++) if (g[y][x] === "1") px.push({ x: cx + x, y });
    cx += 5 + gap;
  }
  return { px, w: cx - gap };
}


/* Flame sound for the splash: synthesised with Web Audio (no files). Event-driven from the animation, so it follows each
   letter as it ignites. Browsers keep audio locked until the first tap or key press, so it starts the moment that happens. */
function splashFlame() {
  const AC = typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext);
  let vol = 0.5; try { const st = loadSettings(); if (st.music !== undefined) vol = st.music; } catch (e) { /* ignore */ }
  if (!AC || vol <= 0) return { whoosh() {}, crackle() {}, bed() {}, stop() {}, level: () => 0 };
  const ac = new AC(), master = ac.createGain(); master.gain.value = Math.min(0.65, vol * 0.8 + 0.1);
  const an = ac.createAnalyser(); an.fftSize = 512; master.connect(an); an.connect(ac.destination); const rec = ac.createMediaStreamDestination(); master.connect(rec);
  const buf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = buf.getChannelData(0);
  let b0 = 0; for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; b0 = 0.97 * b0 + 0.03 * w; d[i] = w * 0.6 + b0 * 3; }   // white plus a rumble of brown
  const src = (loop) => { const n = ac.createBufferSource(); n.buffer = buf; n.loop = !!loop; n.loopStart = Math.random(); return n; };
  const resume = () => { if (ac.state === "suspended") ac.resume().catch(() => {}); };
  const evs = ["pointerdown", "keydown", "touchend"]; evs.forEach((e) => window.addEventListener(e, resume, { passive: true })); resume();
  const live = () => ac.state === "running";
  // the low bed: a fire's constant roar, opened and closed by how much of the title is alight
  const bedN = src(true), bedF = ac.createBiquadFilter(), bedG = ac.createGain();
  bedF.type = "lowpass"; bedF.frequency.value = 650; bedG.gain.value = 0; bedN.connect(bedF); bedF.connect(bedG); bedG.connect(master); bedN.start();
  const dat = new Uint8Array(an.fftSize);
  return {
    whoosh(big) {   // the breath of ignition: a band of noise sweeping upward
      if (!live()) return; const t = ac.currentTime, dur = big ? 1.5 : 0.9, n = src(false), f = ac.createBiquadFilter(), g = ac.createGain();
      f.type = "bandpass"; f.Q.value = 0.9; f.frequency.setValueAtTime(260, t); f.frequency.exponentialRampToValueAtTime(big ? 2200 : 3000, t + dur * 0.8);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(big ? 0.9 : 0.5, t + dur * 0.35); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      n.connect(f); f.connect(g); g.connect(master); n.start(t, Math.random()); n.stop(t + dur + 0.05);
    },
    crackle(k) {   // a snap: a bright click, sometimes with a low pop under it
      if (!live()) return; const t = ac.currentTime, n = src(false), f = ac.createBiquadFilter(), g = ac.createGain(), len = 0.012 + Math.random() * 0.03;
      f.type = "highpass"; f.frequency.value = 1800 + Math.random() * 3200; g.gain.setValueAtTime((0.25 + Math.random() * 0.5) * (k || 1), t); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
      n.connect(f); f.connect(g); g.connect(master); n.start(t, Math.random()); n.stop(t + len + 0.02);
      if (Math.random() < 0.22) { const o = ac.createOscillator(), og = ac.createGain(); o.frequency.setValueAtTime(150 + Math.random() * 90, t); o.frequency.exponentialRampToValueAtTime(48, t + 0.07); og.gain.setValueAtTime(0.35 * (k || 1), t); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.08); o.connect(og); og.connect(master); o.start(t); o.stop(t + 0.1); }
    },
    bed(level, over) { if (live()) bedG.gain.setTargetAtTime(level * 0.55, ac.currentTime, over || 0.25); },
    stream: rec.stream, level() { an.getByteTimeDomainData(dat); let m = 0; for (let i = 0; i < dat.length; i++) m = Math.max(m, Math.abs(dat[i] - 128)); return m / 128; },
    stop() { evs.forEach((e) => window.removeEventListener(e, resume)); try { bedG.gain.setTargetAtTime(0, ac.currentTime, 0.08); } catch (e) { /* ignore */ } setTimeout(() => { try { ac.close(); } catch (e) { /* ignore */ } }, 600); },
  };
}

function Splash({ onDone }) {
  const cvRef = useRef(null);
  useEffect(() => {
    const cv = cvRef.current;
    const ctx = cv.getContext("2d");
    cv.width = SPLASH_W; cv.height = SPLASH_H;
    const rnd = mulberry32(90210);
    // title: BURNT PIXEL at 2x (10x14 glyphs) so it reads big; STUDIOS small and spaced
    const t1 = splashMask("BURNT PIXEL", 1), t2 = splashMask("STUDIOS", 3);
    const S1 = 2, S2 = 1;
    const ox1 = Math.round((SPLASH_W - t1.w * S1) / 2), oy1 = 74;
    const ox2 = Math.round((SPLASH_W - t2.w * S2) / 2), oy2 = 100;
    const T1 = t1.px.map((p) => ({ x: ox1 + p.x * S1, y: oy1 + p.y * S1, s: S1, at: 1.2 + (p.x / t1.w) * 1.5 + rnd() * 0.35 + (p.y / 7) * 0.12 }));
    const T2 = t2.px.map((p) => ({ x: ox2 + p.x * S2, y: oy2 + p.y * S2, s: S2, at: 2.9 + (p.x / t2.w) * 0.8 + rnd() * 0.25 }));
    const all = T1.concat(T2);
    const snd = splashFlame(); try { window.__splashSnd = snd; } catch (e) { /* ignore */ }
    let w1 = false, w2 = false, w0 = false;
    const parts = [];
    const emit = (x, y, n, up) => {
      for (let i = 0; i < n; i++) parts.push({
        x: x + (rnd() - 0.5) * 3, y, vx: (rnd() - 0.5) * 14, vy: -(8 + rnd() * (up || 26)),
        life: 0.5 + rnd() * 0.9, max: 1.4, c: [PAL.fireL, PAL.ember, PAL.fireD, "#ffe9b0"][Math.floor(rnd() * 4)],
      });
    };
    // the mark: a pixel with a burnt corner
    const mark = (cx, cy, t) => {
      const k = Math.min(1, Math.max(0, (t - 0.25) / 0.6));
      if (k <= 0) return;
      const sz = 22, x0 = Math.round(cx - sz / 2), y0 = Math.round(cy - sz / 2);
      const burn = Math.min(0.5, Math.max(0, (t - 0.6) / 2.4));
      const glowA = (0.35 + 0.12 * Math.sin(t * 9) + 0.08 * Math.sin(t * 23)) * k;
      const gr = ctx.createRadialGradient(cx, cy, 2, cx, cy, 44);
      gr.addColorStop(0, `rgba(232,150,74,${glowA})`); gr.addColorStop(1, "rgba(232,150,74,0)");
      ctx.fillStyle = gr; ctx.fillRect(cx - 50, cy - 50, 100, 100);
      for (let y = 0; y < sz; y++) for (let x = 0; x < sz; x++) {
        // burnt corner: top right eaten by a ragged diagonal
        const d = (x - (sz - 1)) * -1 + y; // distance-ish from the top-right corner
        const rag = ((hash2(x, y) % 5) - 2) * 0.9;
        const edge = d + rag - burn * 16;
        if (edge < 0) continue;
        let c;
        const near = edge < 2.4;
        if (near) c = edge < 0.9 ? PAL.fireL : edge < 1.7 ? PAL.ember : PAL.fireD;
        else {
          const shade = (hash2(x * 3, y * 7) % 100) / 100;
          c = y < 3 || x < 3 ? "#5a4a46" : y > sz - 4 || x > sz - 4 ? "#1c1618" : shade > 0.72 ? "#3a2e30" : "#2a2224";
        }
        ctx.fillStyle = c;
        ctx.fillRect(x0 + x, y0 + y, 1, 1);
      }
      // outline ring
      ctx.fillStyle = "rgba(10,8,12,0.9)";
      if (Math.random() < 0.55 * k && burn > 0.1) emit(x0 + sz - 6 - burn * 6 + Math.random() * 6, y0 + 2 + burn * 4 + Math.random() * 4, 1, 22);
      if (Math.random() < 0.3 * k && burn > 0.1) snd.crackle(0.45);
    };
    let t = 0, last = performance.now(), raf = 0, done = false;
    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
      ctx.fillStyle = "#0b090e"; ctx.fillRect(0, 0, SPLASH_W, SPLASH_H);
      // soft ember haze behind the title
      const haze = Math.min(1, Math.max(0, (t - 0.8) / 1.6));
      const hg = ctx.createRadialGradient(SPLASH_W / 2, 84, 6, SPLASH_W / 2, 84, 120);
      hg.addColorStop(0, `rgba(160,70,30,${0.22 * haze})`); hg.addColorStop(1, "rgba(160,70,30,0)");
      ctx.fillStyle = hg; ctx.fillRect(0, 0, SPLASH_W, SPLASH_H);

      mark(SPLASH_W / 2, 40, t);

      // sound, following the picture: the mark smoulders, BURNT PIXEL ignites with a roar, STUDIOS with a smaller one
      if (!w0 && t > 0.5) { w0 = true; snd.whoosh(false); }
      if (!w1 && t > T1[0].at - 0.05 && t > 1.1) { w1 = true; snd.whoosh(true); }
      if (!w2 && t > 2.85) { w2 = true; snd.whoosh(false); }
      let lit = 0; for (const p of all) if (t > p.at) lit++;
      snd.bed(Math.min(1, lit / all.length) * (t > SPLASH_LEN - 1.3 ? Math.max(0, (SPLASH_LEN - 0.4 - t) / 0.9) : 1) + (t > 0.6 ? 0.06 : 0), 0.3);

      for (const p of all) {
        const age = t - p.at;
        if (age < 0) continue;
        let c;
        if (age < 0.18) c = "#fff3c8";
        else if (age < 0.4) c = PAL.fireL;
        else if (age < 0.75) c = PAL.ember;
        else {
          const k = Math.min(1, (age - 0.75) / 1.4);
          c = mix(PAL.ember, p.s === S1 ? PAL.parch : "#b9a98c", k);
        }
        ctx.fillStyle = c;
        ctx.fillRect(p.x, p.y, p.s, p.s);
        if (age < 0.5 && Math.random() < 0.09) { emit(p.x + 1, p.y, 1, 30); if (Math.random() < 0.55) snd.crackle(1); }
        if (age > 0.75 && age < 0.9 && Math.random() < 0.05) emit(p.x + 1, p.y, 1, 14);
      }
      // flicker on the finished title
      if (t > 3.6 && t < 4.9) {
        const f = 0.5 + 0.5 * Math.sin(t * 17);
        ctx.fillStyle = `rgba(232,150,74,${0.05 * f})`;
        ctx.fillRect(ox1 - 4, oy1 - 4, t1.w * S1 + 8, 22);
      }
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life -= dt;
        if (p.life <= 0) { parts.splice(i, 1); continue; }
        p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 4 * dt;
        ctx.globalAlpha = Math.min(1, p.life / 0.5);
        ctx.fillStyle = p.c;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
      }
      ctx.globalAlpha = 1;
      // fade out at the end
      const fo = Math.min(1, Math.max(0, (t - (SPLASH_LEN - 0.8)) / 0.8));
      if (fo > 0) { ctx.fillStyle = `rgba(11,9,14,${fo})`; ctx.fillRect(0, 0, SPLASH_W, SPLASH_H); }
      if (t >= SPLASH_LEN) { if (!done) { done = true; onDone(); } return; }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); snd.stop(); };
  }, []);
  return (
    <div className="dz-splash" role="img" aria-label="Burnt Pixel Studios">
      <canvas ref={cvRef} className="dz-splash-cv" />
    </div>
  );
}

/* Browsers keep sound locked until the first tap or key press, so the game opens on a quiet screen asking for one.
   That press unlocks the audio, which lets the splash's flame (and later the music) play from the first moment. */
const SKIP_TAP = typeof window !== "undefined" && window.location.protocol === "file:" && window.location.hash !== "#tap";   // local test builds skip it
function TapToBegin({ onTap }) {
  // the world is baked right after this first paint; until that's done the screen says so instead of ignoring taps
  const [ready, setReady] = useState(false);
  const readyRef = useRef(false);
  useEffect(() => { const t = setTimeout(() => { readyRef.current = true; setReady(true); }, 40); return () => clearTimeout(t); }, []);
  useEffect(() => {
    let done = false;
    const go = (e) => { if (done || !readyRef.current) return; if (e.type === "keydown" && (e.key === "Shift" || e.key === "Control" || e.key === "Alt" || e.key === "Meta")) return; done = true; onTap(); };
    const evs = ["pointerdown", "keydown", "touchend"]; evs.forEach((e) => window.addEventListener(e, go));
    return () => evs.forEach((e) => window.removeEventListener(e, go));
  }, []);
  return (
    <div className="dz-splash" id="dz-tap" role="button" aria-label="Tap to begin" style={{ cursor: "pointer" }}>
      <style>{`@keyframes dz-tapb{0%,100%{opacity:.35}50%{opacity:1}}.dz-tapt{font:clamp(13px,3.2vh,22px) monospace;letter-spacing:.38em;color:#e8964a;text-transform:uppercase;animation:dz-tapb 1.8s ease-in-out infinite;text-shadow:0 0 14px #a0461e88}.dz-tapn{margin-top:1.6vh;font:clamp(10px,2vh,13px) monospace;letter-spacing:.2em;color:#6a5a4c;text-transform:uppercase}`}</style>
      <div style={{ textAlign: "center" }}><div className="dz-tapt">{ready ? "Tap to begin" : "Loading"}</div><div className="dz-tapn">{ready ? "Best with sound on" : "\u00a0"}</div></div>
    </div>
  );
}
