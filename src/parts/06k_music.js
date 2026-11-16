/* ------------------------------------------------------------------ */
/* Music: xDeviruchi tracks (gamedevmarket.net, free and open licence), */
/* streamed on demand from music/*.mp3, crossfaded, resumed per track.   */
/* ------------------------------------------------------------------ */
const MUSIC_FILES = { title: "music/title.mp3", journey: "music/journey.mp3", explore: "music/explore.mp3", dungeon: "music/dungeon.mp3", icy: "music/icy.mp3", battle: "music/battle.mp3", boss: "music/boss.mp3", rest: "music/rest.mp3", minigame: "music/minigame.mp3", final: "music/final.mp3" };
/* The app is "away" while its page is hidden or the window has lost focus (another app, another tab, the
   chat beside the artifact). Every sound is paused then and picks up where it was on return. */
const AWAY = { on: false, subs: [] };
const audioAway = () => AWAY.on;
function setAudioAway(v) { v = !!v; if (v === AWAY.on) return; AWAY.on = v; AWAY.subs.forEach((f) => { try { f(v); } catch (e) { /* ignore */ } }); }
if (typeof window !== "undefined" && typeof document !== "undefined") {
  const check = () => setAudioAway(document.hidden || (document.hasFocus && !document.hasFocus()));
  document.addEventListener("visibilitychange", check);
  window.addEventListener("blur", () => setAudioAway(true));
  window.addEventListener("focus", () => setAudioAway(!!document.hidden));
  window.addEventListener("pagehide", () => setAudioAway(true));
  window.addEventListener("pageshow", check);
  ["pointerdown", "keydown", "touchstart"].forEach((ev) => window.addEventListener(ev, () => setAudioAway(!!document.hidden), { passive: true, capture: true }));
}
const Music = (() => {
  const els = {}; let want = null, vol = 0.5, cur = null, timer = 0, blocked = false;
  const mk = (k) => {
    if (els[k]) return els[k];
    try { const a = new Audio(MUSIC_FILES[k]); a.loop = true; a.preload = "auto"; a.volume = 0; els[k] = a; return a; } catch (e) { return null; }
  };
  const tick = () => {
    let busy = false;
    for (const k of Object.keys(els)) {
      const a = els[k], target = k === want && vol > 0 ? vol : 0, d = target - a.volume;
      if (Math.abs(d) > 0.01) { a.volume = Math.max(0, Math.min(1, a.volume + Math.sign(d) * Math.min(Math.abs(d), 0.03))); busy = true; }
      else { a.volume = target; if (target === 0 && !a.paused) a.pause(); }
    }
    if (!busy && !(want && vol > 0 && blocked)) { clearInterval(timer); timer = 0; }
  };
  const run = () => { if (!timer) timer = setInterval(tick, 50); };
  const start = (k) => {
    const a = mk(k); if (!a || AWAY.on) return;
    if (a.paused) { const p = a.play(); if (p && p.catch) p.catch(() => { blocked = true; run(); }); }
  };
  AWAY.subs.push((away) => {
    if (away) { for (const k of Object.keys(els)) if (!els[k].paused) els[k].pause(); }
    else if (want && vol > 0) { const a = mk(want); if (a) { a.volume = Math.max(a.volume, 0.05); start(want); } run(); }
  });
  const unlock = () => { if (blocked && want && vol > 0) { blocked = false; start(want); run(); } };
  if (typeof window !== "undefined") { ["pointerdown", "keydown", "touchend"].forEach((ev) => window.addEventListener(ev, unlock, { passive: true })); }
  return {
    play(k) { if (k === want) return; want = k; if (k && vol > 0) start(k); run(); },
    volume(v) { vol = v; if (want && vol > 0) start(want); run(); },
    current: () => want,
    debug: () => Object.keys(els).map((k) => [k, els[k].paused, +els[k].currentTime.toFixed(1), +els[k].volume.toFixed(2), els[k].readyState, els[k].error ? els[k].error.code : 0]),
  };
})();

/* which track fits the moment */
function musicFor({ screen, credits, fight, job, dice, G, def, mapId, night }) {
  if (screen === "splash") return null;
  if (screen !== "game") return screen === "intro1" || screen === "intro2" ? "journey" : "title";
  if (credits) return "final";
  if (fight) return fight.boss ? "boss" : "battle";
  if (job || dice) return "minigame";
  if (G && G.flags && G.flags.d4_fire && !G.flags.d4_lost) return "boss";   // the town burning; the closing theme is kept for the credits
  if (!def) return "journey";
  if (def.cave) return mapId === "caveS" ? "icy" : "dungeon";
  if (!def.outside) return "rest";
  if (def.wild_zone) return "explore";
  return night ? "rest" : "journey";
}
