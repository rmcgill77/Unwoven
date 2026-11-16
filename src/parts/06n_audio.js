/* ------------------------------------------------------------------ */
/* Act Two's music, sound effects and ambience.                        */
/* Music by Bert Cole (bitbybitsound.com), 16-Bit Starter Pack.        */
/* Effects and ambience by TomMusic (tommusic.itch.io), Free Fantasy   */
/* SFX Pack. Files sit beside the page in music/ and sfx/.             */
/* ------------------------------------------------------------------ */
Object.assign(MUSIC_FILES, {
  a2plains: "music/a2plains.mp3", a2night: "music/a2night.mp3", a2forest: "music/a2forest.mp3", a2camp: "music/a2camp.mp3",
  a2ash: "music/a2ash.mp3", a2ashnight: "music/a2ashnight.mp3", a2greywick: "music/a2greywick.mp3", a2march: "music/a2march.mp3",
  a2fort: "music/a2fort.mp3", a2home: "music/a2home.mp3", a2tavern: "music/a2tavern.mp3", a2inside: "music/a2inside.mp3", a2under: "music/a2under.mp3",
  a2beasts: "music/a2beasts.mp3", a2fight: "music/a2fight.mp3", a2boss: "music/a2boss.mp3", a2spar: "music/a2spar.mp3", a2credits: "music/a2credits.mp3",
});
const A2_TAVERNS = new Set(["ash_thistle", "gw_inn", "fort_inn", "fort_mess", "tavern"]);
const A2_UNDER = new Set(["fort_cells", "fort_under", "gw_chapel", "ash_cellar"]);
{
  const base = musicFor;
  musicFor = (o) => {
    const { screen, credits, fight, G, def, mapId, night } = o;
    if (!(G && G.flags && G.flags.act2) || screen !== "game") return base(o);
    if (credits === 2) return "a2credits";
    if (credits) return base(o);
    if (fight) {
      if (fight.spar) return "a2spar";
      if (fight.boss) return "a2boss";
      const human = (fight.foes || []).some((k) => BTL_FOES[k] && HUMAN_ART.has(BTL_FOES[k].art));
      return human ? "a2fight" : "a2beasts";
    }
    if (o.job || o.dice || !def || !mapId) return base(o);
    if (def.cave) return base(o);
    if (A2_UNDER.has(mapId)) return "a2under";
    if (A2_TAVERNS.has(mapId)) return "a2tavern";
    if (mapId === "oak" && G.flags.oak_rebuilt) return night ? "a2night" : "a2home";
    if (!def.outside) return def.act2 || G.flags.oak_rebuilt ? "a2inside" : base(o);
    if (mapId.startsWith("plains")) return night ? "a2night" : "a2plains";
    if (mapId === "wforest") return "a2forest";
    if (mapId === "eforest") return "a2camp";
    if (mapId === "ash") return night ? "a2ashnight" : "a2ash";
    if (mapId === "gw") return "a2greywick";
    if (mapId === "os") return "a2march";
    if (mapId === "fort") return "a2fort";
    return base(o);
  };
}

/* ---------- sound effects: short one-shots from small pools, and one ambience loop at a time ---------- */
const SFX_NAMES = ["hit1", "hit2", "hit3", "swing1", "swing2", "block", "parry", "unsheath", "bowhit", "bowshot", "fire", "ice", "rock", "spell", "spell2", "buff", "ward", "heal", "phase", "wave",
  "chest", "door", "doorclose", "gate", "portcullis", "unlock", "torch", "victory", "defeat",
  "step_dirt1", "step_dirt2", "step_dirt3", "step_stone1", "step_stone2", "step_stone3", "step_wood1", "step_wood2", "step_wood3"];
const Sfx = (() => {
  const pools = {}; let vol = 0.6, amb = null, ambWant = null, ambTimer = 0;
  const get = (k) => {
    const p = pools[k] || (pools[k] = []);
    let a = p.find((x) => x.paused || x.ended);
    if (!a && p.length < 3) { try { a = new Audio(`sfx/${k}.mp3`); a.preload = "auto"; p.push(a); } catch (e) { return null; } }
    return a || p[0];
  };
  const ambEls = {};
  const ambTick = () => {
    let busy = false;
    for (const k of Object.keys(ambEls)) {
      const a = ambEls[k], target = k === ambWant ? vol * 0.32 : 0, d = target - a.volume;
      if (Math.abs(d) > 0.01) { a.volume = Math.max(0, Math.min(1, a.volume + Math.sign(d) * 0.02)); busy = true; }
      else { a.volume = target; if (target === 0 && !a.paused) a.pause(); }
    }
    if (!busy) { clearInterval(ambTimer); ambTimer = 0; }
  };
  return {
    play(k, v = 1) {
      if (!vol || !k) return;
      const a = get(k); if (!a) return;
      try { a.currentTime = 0; a.volume = Math.min(1, vol * v); const p = a.play(); if (p && p.catch) p.catch(() => {}); } catch (e) { /* not yet allowed to play */ }
    },
    any(ks, v) { this.play(ks[Math.floor(Math.random() * ks.length)], v); },
    amb(k) {
      if (k === ambWant) return; ambWant = k;
      if (k && !ambEls[k]) { try { const a = new Audio(`sfx/amb_${k}.mp3`); a.loop = true; a.volume = 0; ambEls[k] = a; } catch (e) { /* ignore */ } }
      if (k && ambEls[k] && ambEls[k].paused && vol) { const p = ambEls[k].play(); if (p && p.catch) p.catch(() => {}); }
      if (!ambTimer) ambTimer = setInterval(ambTick, 60);
    },
    volume(v) { vol = v; const k = ambWant; ambWant = null; this.amb(k); },
    get vol() { return vol; },
  };
})();

/* which ambience fits the place */
function ambienceFor(def, mapId, night) {
  if (!def) return null;
  if (def.cave || def.dark || A2_UNDER.has(mapId)) return "cave";
  if (!def.outside) return night ? "insidenight" : "insideday";
  if (def.town || mapId === "oak" || mapId === "fort") return null;
  return night ? "forestnight" : "forestday";
}

/* footsteps: what the ground is made of under the player */
function stepKind(def, cells, tx, ty) {
  if (!def || !cells || !cells[ty]) return "dirt";
  const c = cells[ty][tx];
  if (!def.outside) return c === "s" ? "stone" : "wood";
  if (c === "=" && (def.pave || def.town)) return "stone";
  if (c === "B") return "wood";
  return "dirt";
}

/* battle: each hit, spell, guard and heal makes its sound */
const EL_SFX = { fire: "fire", cold: "ice", ice: "ice", earth: "rock", force: "wave", growth: "spell2", shock: "spell", light: "spell2", mind: "spell" };
function battleSfx(e, u) {
  if (e.e === "dmg") {
    if (e.kind === "magic") Sfx.play(EL_SFX[e.el] || "spell", 0.9);
    else if (e.shot || e.proj) Sfx.play("bowhit", 0.9);
    else Sfx.any(["hit1", "hit2", "hit3"], 0.9);
  } else if (e.e === "guard") Sfx.play("block", 0.8);
  else if (e.e === "heal") Sfx.play("heal", 0.6);
  else if (e.e === "ward" || e.e === "warded") Sfx.play("ward", 0.6);
  else if (e.e === "cast") Sfx.play("buff", 0.6);
  else if (e.e === "infused") Sfx.play("torch", 0.7);
  else if (e.e === "phase") Sfx.play("phase", 0.9);
  else if (e.e === "rupture") Sfx.play("rock", 0.9);
}

/* chests creak open */
{
  const base = SCRIPTS.look_chest;
  SCRIPTS.look_chest = (c, id) => {
    if (id && CHEST_LOOT[id] && !c.flag("chest_" + id)) Sfx.play("chest", 0.9);
    else if (id === "c_sword" && !c.flag("chest_c_sword")) Sfx.play("chest", 0.9);
    return base(c, id);
  };
}
