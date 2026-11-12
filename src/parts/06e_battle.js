/* ------------------------------------------------------------------ */
/* Battle core: stats, enemies, ATB simulation (no DOM, no React)      */
/* Casting follows the Old Tongue loop: Inhale + Weave are charge time */
/* on the gauge, a hit while weaving is a Rupture, Release is a tap.   */
/* ------------------------------------------------------------------ */

/* party members: base stats at level 1 and growth per level. mp is Breath. */
const BTL_PARTY = {
  wren: { name: "Wren", role: "Apprentice", base: { hp: 48, mp: 10, atk: 8, mag: 10, def: 5, spd: 11 }, grow: { hp: 7, mp: 1.6, atk: 1.2, mag: 1.8, def: 0.9, spd: 0.4 } },
  tessa: { name: "Tessa", role: "Scout", base: { hp: 42, mp: 4, atk: 9, mag: 3, def: 4, spd: 13 }, grow: { hp: 7, mp: 0.6, atk: 1.6, mag: 0.6, def: 1, spd: 0.5 } },
  companion: { name: "Hooded one", role: "Stranger", base: { hp: 46, mp: 12, atk: 6, mag: 11, def: 4, spd: 9 }, grow: { hp: 8, mp: 2, atk: 1, mag: 2, def: 1, spd: 0.3 } },
};
const BTL_XP_FOR = (lv) => Math.round(18 * Math.pow(lv, 1.55));      // xp needed to leave this level
const BTL_MAX_LV = 20;
const GEAR_SLOTS = [["weapon", "Weapon"], ["head", "Head"], ["body", "Body"], ["charm", "Charm"]];
const GEAR_STATS = { hp: "HP", mp: "MP", atk: "ATK", mag: "MAG", def: "DEF", spd: "SPD" };
function btlStats(key, lv, eq) {
  const d = BTL_PARTY[key], o = {};
  for (const k in d.base) o[k] = Math.round(d.base[k] + d.grow[k] * (lv - 1));
  if (eq) for (const slot in eq) { const it = typeof ITEMS !== "undefined" && ITEMS[eq[slot]]; if (it && it.gear) for (const k in GEAR_STATS) if (it.gear[k]) o[k] += it.gear[k]; }
  return o;
}
const btlStatsFor = (G, key, lv) => btlStats(key, lv, G && G.equip && G.equip[key]);
function gearList(G) { return Object.keys(G.items || {}).filter((id) => ITEMS[id] && ITEMS[id].gear && G.items[id] > 0); }
function gearEquip(G, id, who = "wren") {
  const it = ITEMS[id]; if (!it || !it.gear || !(G.items[id] > 0)) return false;
  if (!G.equip) G.equip = {}; if (!G.equip[who]) G.equip[who] = {};
  G.equip[who][it.gear.slot] = id; gearClamp(G, who); return true;
}
function gearRemove(G, slot, who = "wren") { if (G.equip && G.equip[who]) { delete G.equip[who][slot]; gearClamp(G, who); } }
function gearClamp(G, who) { const m = G.party && G.party[who]; if (!m) return; const s = btlStatsFor(G, who, m.lv); m.hp = Math.min(m.hp, s.hp); m.mp = Math.min(m.mp, s.mp); }
function btlFreshMember(key, lv = 1) { const s = btlStats(key, lv); return { lv, xp: 0, hp: s.hp, mp: s.mp }; }
function btlEnsureParty(G) {
  if (!G.party) G.party = { wren: btlFreshMember("wren") };
  if (!G.partyIds) G.partyIds = ["wren"];
  for (const id of G.partyIds) if (!G.party[id]) G.party[id] = btlFreshMember(id);
  if (typeof magicEnsure === "function") magicEnsure(G);
  return G.party;
}

const BTL_ITEMS = { poultice: { name: "Poultice", heal: 24, desc: "Moss, clay and a clean rag. Heals 24." }, tonic: { name: "Herbal tonic", heal: 40, desc: "Bitter and green. Heals 40." } };

/* enemies. art: which sprite the renderer draws. weak/resist are elements. */
const BTL_FOES = {
  wolf: { name: "Gaunt Wolf", lv: 2, art: "wolfB", hp: 28, atk: 8, def: 2, spd: 10, xp: 14, coins: [0, 2], drops: [["poultice", 0.12], ["pelt", 0.45], ["fang", 0.3]], scale: 1, weak: ["fire"], resist: [], note: "starved, and wary of flame" },
  hound: { name: "Starved Hound", lv: 1, art: "wolfB", hp: 16, atk: 5, def: 1, spd: 12, xp: 8, coins: [0, 1], drops: [["fang", 0.3], ["pelt", 0.15]], scale: 0.8, tint: 0.12, weak: ["fire", "light"], resist: [], note: "frail and quick" },
  alpha: { name: "Scarred Alpha", lv: 4, art: "wolfB", hp: 150, atk: 12, def: 4, spd: 11, xp: 46, coins: [3, 7], drops: [["poultice", 0.6], ["pelt", 1], ["fang", 1]], scale: 1.25, tint: 0.2, boss: true, weak: ["storm"], resist: ["cold"], note: "thick-furred, and scarred by old lightning" },
  thornhound: { name: "Thorn Hound", lv: 2, art: "wolfG", hp: 24, atk: 6, def: 2, spd: 11, xp: 12, coins: [0, 2], drops: [["poultice", 0.15], ["pelt", 0.35]], scale: 0.9, tint: 0.35, weak: ["fire", "wind"], resist: ["growth"], note: "burrs and briars knotted through its coat" },
  cavehound: { name: "Cave Hound", lv: 3, art: "wolfW", hp: 40, atk: 9, def: 3, spd: 11, xp: 20, coins: [1, 3], drops: [["fang", 0.5], ["poultice", 0.15]], scale: 0.95, tint: 0.08, weak: ["light", "fire"], resist: ["cold"], note: "pale and half-blind, it hunts by sound" },
  blindhound: { name: "Old Blind Hound", lv: 5, art: "wolfW", hp: 120, atk: 10, def: 4, spd: 8, xp: 60, coins: [6, 12], drops: [["tonic", 1], ["fang", 1]], scale: 1.3, tint: 0.04, boss: true, weak: ["light"], resist: ["cold", "stone"], note: "milk-eyed and huge; light makes it flinch" },
  slimeG: { name: "Mire Slime", lv: 1, art: "slimeG", hp: 14, atk: 4, def: 0, spd: 7, xp: 6, coins: [0, 1], drops: [["gel", 0.5]], scale: 1, weak: ["fire"], resist: ["growth"], note: "bog-water given a grudge" },
  slimeB: { name: "Cave Slime", lv: 2, art: "slimeB", hp: 22, atk: 6, def: 1, spd: 7, xp: 11, coins: [0, 2], drops: [["gel", 0.5], ["poultice", 0.08]], scale: 1, weak: ["storm"], resist: ["cold"], note: "pale and cold, and it numbs what it touches" },
  slimeR: { name: "Rust Slime", lv: 3, art: "slimeR", hp: 32, atk: 8, def: 2, spd: 8, xp: 17, coins: [1, 3], drops: [["gel", 0.5], ["token", 0.06]], scale: 1, weak: ["cold"], resist: ["fire"], note: "stained red by the old quarry iron" },
  redcap: { name: "Red-cap", lv: 2, art: "redcap", hp: 22, atk: 6, def: 2, spd: 8, xp: 12, coins: [0, 2], drops: [["redcap", 0.55]], scale: 1, weak: ["fire"], resist: ["growth"], note: "a toadstool that learned to walk" },
  thornmother: { name: "The Thornmother", lv: 6, art: "thornmother", hp: 250, atk: 13, def: 5, spd: 7, xp: 140, coins: [20, 30], drops: [["mroot", 1], ["yarrow", 1]], scale: 1.5, tint: 0, rooted: true, boss: true, weak: ["fire", "wind"], resist: ["growth", "life", "cold"], note: "an old guardian of the ruin, grown into the grove around it" },
  mandrake: { name: "Mandrake", lv: 2, art: "mandrake", hp: 18, atk: 5, def: 1, spd: 9, xp: 11, coins: [0, 2], drops: [["mroot", 0.4], ["yarrow", 0.15]], scale: 1, weak: ["fire", "wind"], resist: ["growth", "life"], note: "uprooted, and furious about it" },
  bat: { name: "Cave Bat", lv: 2, art: "bat", hp: 14, atk: 5, def: 0, spd: 14, xp: 10, coins: [0, 1], drops: [["poultice", 0.08]], scale: 1, weak: ["storm", "wind"], resist: [], note: "fast, frail, and always from above" },
  spider: { name: "Quarry Spider", lv: 3, art: "spider", hp: 30, atk: 8, def: 2, spd: 11, xp: 18, coins: [0, 2], drops: [["silk", 0.5]], scale: 1, weak: ["fire", "light"], resist: ["stone"], note: "as big as a dog, and patient" },
  leywolf: { name: "Ley-touched Wolf", lv: 3, art: "wolfL", hp: 38, atk: 8, def: 3, spd: 10, xp: 22, coins: [1, 3], drops: [["poultice", 0.2], ["tonic", 0.08], ["pelt", 0.5], ["fang", 0.3]], scale: 1.08, tint: 0.55, weak: ["light", "fire"], resist: ["storm"], note: "its fur crackles with wild leyline" }
};

/* ---- tuning ---- */
const BTL = {
  RATE: 2.6,           // gauge points per second per point of speed (gauge is 0-100)
  FOE_SLOW: 0.85,
  GUARD: 0.5,
  FLEE_BASE: 0.5,
  T_STEP: 0.3, T_ATK: 0.75, T_RETURN: 0.35, ATK_HIT: 0.525,
  T_CAST: 0.84, T_HURT: 0.4, T_DEAD: 0.6, T_REL: 0.62, REL_HIT: 0.2,
  T_FOE_LUNGE: 0.38, T_FOE_BITE: 0.18, T_FOE_BACK: 0.34,
  WIN_DUR: 0.9, WIN_SWEET: [0.46, 0.7], WIN_OK: [0.28, 0.88],   // release window, as fractions of its length
  RUPT_BURN: 3, WEAK: 1.4, RESIST: 0.6, WILD_POWER: 1.2, WILD_MISFIRE: 0.1,
  REGEN_BREATH: 0.16,  // breath per second, for everyone
};

/* ---- simulation ---- */
function createBattle({ party, foes, items = {}, wait = true, rng = Math.random, canFlee = true, words = null, hotbar = null, ley = { wild: false }, autoRelease = false }) {
  const B = { t: 0, phase: "fight", units: [], events: [], queue: [], cur: null, items: { ...items }, wait, waiting: false, rng, canFlee, result: null, used: {},
    words: words || { r: [], s: [] }, hotbar: hotbar || [null, null, null, null], ley, autoRelease, window: null };
  let uid = 1;
  party.forEach((p, i) => {
    const s = btlStats(p.key, p.lv, p.eq);
    B.units.push({ id: uid++, side: "p", slot: i, key: p.key, name: p.name || BTL_PARTY[p.key].name, role: BTL_PARTY[p.key].role, lv: p.lv,
      hp: Math.min(p.hp, s.hp) || (p.hp <= 0 ? 0 : s.hp), maxHp: s.hp, mp: Math.min(p.mp, s.mp), maxMp: s.mp, atk: s.atk, mag: s.mag, def: s.def, spd: s.spd,
      gauge: 18 + rng() * 40, guard: false, ko: p.hp <= 0, anim: { n: "idle", t: 0 }, act: null, look: p.look, cast: null, ward: 0, infuse: null, breathAcc: 0, slowT: 0, sleepT: 0, markT: 0 });
  });
  foes.forEach((k, i) => {
    const d = BTL_FOES[k];
    B.units.push({ id: uid++, side: "e", slot: i, key: k, name: d.name, lv: d.lv, hp: d.hp, maxHp: d.hp, mp: 0, maxMp: 0, atk: d.atk, mag: 0, def: d.def, spd: d.spd,
      gauge: 10 + rng() * 45, guard: false, ko: false, anim: { n: "idle", t: 0 }, act: null, art: d.art, scale: d.scale, tint: d.tint || 0, boss: !!d.boss,
      weak: d.weak || [], resist: d.resist || [], note: d.note, cast: null, ward: 0, infuse: null, slowT: 0, sleepT: 0, markT: 0 });
  });
  for (const u of B.units) if (u.ko) { u.anim = { n: "dead", t: 9 }; u.gauge = 0; }
  B.by = (id) => B.units.find((u) => u.id === id);
  B.allies = () => B.units.filter((u) => u.side === "p");
  B.foes = () => B.units.filter((u) => u.side === "e");
  B.living = (side) => B.units.filter((u) => u.side === side && !u.ko);
  B.ready = () => B.units.filter((u) => u.side === "p" && !u.ko && u.gauge >= 100 && !u.queued && !u.act && !u.cast);
  B.spellsKnown = () => knownSpells(B.words);
  const rnd = (a, b) => a + rng() * (b - a);
  const emit = (e) => B.events.push({ t: B.t, ...e });

  const physical = (a, d, extra = 1) => Math.max(1, Math.round((a.atk * 2 - d.def) * rnd(0.85, 1.15) * extra));
  function elemMult(dst, el) { if (!el) return 1; if (dst.weak && dst.weak.includes(el)) return BTL.WEAK; if (dst.resist && dst.resist.includes(el)) return BTL.RESIST; return 1; }

  /* ---- taking damage: wards soak it, a hit on a weaving caster is a Rupture ---- */
  function damage(src, dst, amt, kind, el) {
    let rupture = true;
    if (dst.guard) amt = Math.max(1, Math.round(amt * BTL.GUARD));
    if (dst.markT > B.t) amt = Math.round(amt * 1.25);
    const em = elemMult(dst, el); if (em !== 1) amt = Math.max(1, Math.round(amt * em));
    if (dst.ward > 0) { const soak = Math.min(dst.ward, amt); dst.ward -= soak; amt -= soak; if (soak) emit({ e: "ward", id: dst.id, amt: soak }); if (amt === 0) rupture = false; }
    if (amt > 0) {
      dst.hp = Math.max(0, dst.hp - amt);
      emit({ e: "dmg", id: dst.id, amt, kind, el, weak: em > 1, resist: em < 1 });
      if (dst.hp <= 0) { dst.ko = true; dst.gauge = 0; dst.queued = null; dst.cast = null; dst.sleepT = 0; dst.anim = { n: "dead", t: 0 }; emit({ e: "ko", id: dst.id }); }
      else dst.anim = { n: "hurt", t: 0 };
      if (dst.sleepT > B.t) dst.sleepT = 0;       // a blow wakes the sleeper
    }
    if (rupture && !dst.ko && dst.cast && !dst.cast.ready && dst.cast.spell.charge > 0) rupt(dst);
  }
  function rupt(u) {
    if (B.window && B.window.uid === u.id) B.window = null;
    u.cast = null; u.gauge = 35;   // a torn weave costs the turn, not the whole gauge
    u.hp = Math.max(1, u.hp - BTL.RUPT_BURN); emit({ e: "rupture", id: u.id }); emit({ e: "dmg", id: u.id, amt: BTL.RUPT_BURN, kind: "burn", el: "fire" });
    u.anim = { n: "hurt", t: 0 };
  }
  function heal(dst, amt) {
    const a = Math.min(amt, dst.maxHp - dst.hp); dst.hp += a;
    emit({ e: "heal", id: dst.id, amt: a });
  }

  /* ---- commands from the player ---- */
  B.command = (uid_, cmd) => {
    const u = B.by(uid_);
    if (!u || u.side !== "p" || u.ko || u.gauge < 100 || u.queued || u.act || u.cast) return false;
    if (cmd.type === "attack") { const t = B.by(cmd.target); if (!t || t.ko) return false; }
    if (cmd.type === "cast") {
      const sp = typeof cmd.spell === "string" ? weaveSpell(...cmd.spell.split("-")) : cmd.spell;
      if (!sp || !sp.ok) return false;
      const [r, s] = [sp.root, sp.suf];
      if (!B.words.r.includes(r) || !B.words.s.includes(s)) return false;
      if (u.mp < sp.cost) return false;
      if (sp.target === "foe" || sp.target === "ally") { const t = B.by(cmd.target); if (!t || t.ko) return false; if ((sp.target === "foe") !== (t.side === "e")) return false; }
      u.mp -= sp.cost; u.gauge = 0;
      u.cast = { spell: sp, target: cmd.target || null, t: 0, ready: false, wait: false };
      emit({ e: "inhale", id: u.id, name: sp.name });
      return true;
    }
    if (cmd.type === "item") { if (!(B.items[cmd.item] > 0)) return false; const t = B.by(cmd.target); if (!t || t.ko) return false; B.items[cmd.item]--; B.used[cmd.item] = (B.used[cmd.item] || 0) + 1; }
    if (cmd.type === "flee" && !B.canFlee) return false;
    u.queued = cmd; B.queue.push(u.id); return true;
  };
  /* the player's tap in the release window. q is 0..1 progress through the window */
  B.release = (uid_, q) => {
    const w = B.window; if (!w || w.uid !== uid_) return false;
    const u = B.by(uid_); if (!u || !u.cast) return false;
    let quality = 0.8, label = "Sloppy";
    const f = q === undefined ? w.t / BTL.WIN_DUR : q;
    if (f >= BTL.WIN_SWEET[0] && f <= BTL.WIN_SWEET[1]) { quality = 1.2; label = "Clean"; }
    else if (f >= BTL.WIN_OK[0] && f <= BTL.WIN_OK[1]) { quality = 1.0; label = "Steady"; }
    u.cast.quality = quality; u.cast.label = label; B.window = null; queueRelease(u); return true;
  };
  function queueRelease(u) {
    u.cast.ready = true; u.cast.wait = false; u.queued = { type: "release" }; B.queue.push(u.id);
  }

  /* ---- start an action ---- */
  function begin(u, cmd) {
    u.guard = false; u.queued = null;
    const a = { kind: cmd.type, t: 0, target: cmd.target, item: cmd.item, hit: false, dur: 0, hitAt: 0, spell: null };
    if (u.side === "p") {
      if (cmd.type === "attack") { u.gauge = 0; a.dur = BTL.T_STEP + BTL.T_ATK + BTL.T_RETURN; a.hitAt = BTL.T_STEP + BTL.ATK_HIT; }
      else if (cmd.type === "release") { a.kind = "release"; a.spell = u.cast.spell; a.target = u.cast.target; a.dur = BTL.T_REL; a.hitAt = BTL.REL_HIT; a.quality = u.cast.quality; }
      else if (cmd.type === "item") { u.gauge = 0; a.dur = 0.8; a.hitAt = 0.4; }
      else if (cmd.type === "defend") { u.gauge = 0; a.dur = 0.5; a.hitAt = 0.05; }
      else if (cmd.type === "flee") { u.gauge = 0; a.dur = 0.9; a.hitAt = 0.5; }
    } else { u.gauge = 0; a.kind = "bite"; a.dur = BTL.T_FOE_LUNGE + BTL.T_FOE_BITE + BTL.T_FOE_BACK; a.hitAt = BTL.T_FOE_LUNGE; }
    u.act = a; B.cur = u.id;
  }
  function spellPower(u, sp, quality) {
    let p = u.mag * sp.pw * 1.9 * quality * rnd(0.92, 1.08);
    if (B.ley.wild) p *= BTL.WILD_POWER;
    return p;
  }
  function resolveSpell(u, a) {
    const sp = a.spell, q = a.quality || 1;
    let tgt = a.target ? B.by(a.target) : null;
    // wild leyline: sometimes a casting slips
    let misfire = false;
    if (B.ley.wild && sp.charge > 0 && rng() < BTL.WILD_MISFIRE) { misfire = true; emit({ e: "text", id: u.id, text: "The leyline surges!" }); }
    const foes = B.living("e"), allies = B.living("p");
    const pickFoe = () => (tgt && !tgt.ko && tgt.side === "e" ? tgt : foes[0]);
    if (misfire && sp.target === "foe") { const f = foes[Math.floor(rng() * foes.length)]; if (f) tgt = f; }
    const pw = misfire ? 0.7 : 1;
    switch (sp.k) {
      case "dmg": {
        const list = sp.target === "foes" ? foes : [pickFoe()].filter(Boolean);
        for (const t of list) {
          const raw = spellPower(u, sp, q) * pw;
          const def = t.def * (1 - sp.pierce);
          damage(u, t, Math.max(1, Math.round(raw - def * 0.5)), "magic", sp.el);
        }
        if (sp.form === "beam") { const t = pickFoe(), behind = foes.find((f) => f !== t && !f.ko); if (t && behind) damage(u, behind, Math.max(1, Math.round(spellPower(u, sp, q) * 0.5 * pw)), "magic", sp.el); }
        break;
      }
      case "heal": {
        const base = u.mag * 1.5 * sp.pw * q;
        const list = sp.target === "allies" ? allies : [tgt && !tgt.ko ? tgt : u];
        for (const t of list) heal(t, Math.round(base + 6 + (sp.target === "allies" ? 0 : 4)));
        break;
      }
      case "ward": { const t = tgt && !tgt.ko ? tgt : u; t.ward += Math.round((u.mag * 1.6 + 8) * q * sp.pw); emit({ e: "warded", id: t.id }); break; }
      case "infuse": { const t = tgt && !tgt.ko ? tgt : u; t.infuse = { el: sp.el, n: 3 }; emit({ e: "infused", id: t.id, el: sp.el }); break; }
      case "snare": {
        const list = sp.target === "foes" ? foes : [pickFoe()].filter(Boolean);
        for (const t of list) { t.slowT = B.t + 10 + q * 2; emit({ e: "text", id: t.id, text: "Slowed" }); }
        break;
      }
      case "sleep": {
        const list = sp.target === "foes" ? foes : [pickFoe()].filter(Boolean);
        for (const t of list) { if (t.boss && rng() < 0.7) { emit({ e: "text", id: t.id, text: "Shrugs it off" }); continue; } t.sleepT = B.t + 7 + q * 2; t.gauge = Math.min(t.gauge, 40); emit({ e: "text", id: t.id, text: "Asleep" }); }
        break;
      }
      case "mark": {
        const list = sp.target === "foes" ? foes : [pickFoe()].filter(Boolean);
        for (const t of list) {
          t.markT = B.t + 12;
          emit({ e: "scan", id: t.id, text: `${t.name}: ${t.hp}/${t.maxHp} HP${t.weak.length ? " · weak to " + t.weak.join(", ") : ""}${t.resist.length ? " · resists " + t.resist.join(", ") : ""}` });
        }
        break;
      }
    }
    emit({ e: "cast", id: u.id, name: sp.name, label: a.quality >= 1.2 ? "Clean" : a.quality >= 1 ? "Steady" : "Sloppy" });
    if (B.onSignature) B.onSignature(u, sp);
  }
  function resolve(u, a) {
    const tgt = a.target ? B.by(a.target) : null;
    if (a.kind === "attack" || a.kind === "bite") {
      let t = tgt;
      if (!t || t.ko) t = B.living(u.side === "p" ? "e" : "p")[0];
      if (!t) return;
      let dmg = physical(u, t), el = null;
      if (u.infuse && u.infuse.n > 0) { dmg = Math.round(dmg * 1.35); el = u.infuse.el; u.infuse.n--; if (!u.infuse.n) u.infuse = null; }
      damage(u, t, dmg, a.kind, el);
      if (u.side === "p") u.mp = Math.min(u.maxMp, u.mp + 1);       // a steadying breath
    } else if (a.kind === "release") {
      resolveSpell(u, a); u.cast = null;
    } else if (a.kind === "item") {
      if (tgt && !tgt.ko) heal(tgt, BTL_ITEMS[a.item].heal);
    } else if (a.kind === "defend") { u.guard = true; u.mp = Math.min(u.maxMp, u.mp + 1); emit({ e: "guard", id: u.id }); }
    else if (a.kind === "flee") {
      const f = B.living("e"), avg = f.reduce((s, x) => s + x.spd, 0) / Math.max(1, f.length);
      const chance = Math.min(0.9, Math.max(0.2, BTL.FLEE_BASE + (u.spd - avg) * 0.04));
      if (B.rng() < chance && B.canFlee) { B.phase = "fled"; emit({ e: "fled" }); }
      else emit({ e: "text", id: u.id, text: "Can't get away!" });
    }
  }
  function foeChoose(u) {
    const al = B.living("p"); if (!al.length) return null;
    let t = al[Math.floor(B.rng() * al.length)];
    if (B.rng() < 0.3) t = al.reduce((m, x) => (x.hp / x.maxHp < m.hp / m.maxHp ? x : m), al[0]);
    // beasts go for the one who is weaving
    const weaver = al.find((x) => x.cast && !x.cast.ready && x.cast.spell.charge > 0);
    if (weaver && B.rng() < 0.35) t = weaver;
    return { type: "attack", target: t.id };
  }

  /* ---- main step ---- */
  B.step = (dt) => {
    if (B.phase !== "fight") { for (const u of B.units) u.anim.t += dt; return; }
    B.t += dt;
    for (const u of B.units) u.anim.t += dt;
    const acting = B.cur !== null;
    B.waiting = false;
    if (B.wait && !acting && B.ready().length && !B.window) B.waiting = true;
    if (B.window) { B.window.t += dt; if (B.window.t >= BTL.WIN_DUR) B.release(B.window.uid, 2); }
    if (!B.waiting) {
      for (const u of B.units) {
        if (u.ko) continue;
        /* weaving: charge time ticks on the gauge */
        if (u.cast && !u.cast.ready) {
          u.cast.t += dt;
          if (u.cast.t >= u.cast.spell.charge) {
            if (u.cast.spell.charge === 0 || B.autoRelease) { u.cast.quality = 1; u.cast.label = "Steady"; queueRelease(u); }
            else { u.cast.wait = true; u.cast.ready = false; }
          }
        }
        if (u.act || u.cast) continue;
        if (u.sleepT > B.t) continue;
        const slow = u.slowT > B.t ? 0.5 : 1;
        if (u.gauge < 100) u.gauge = Math.min(100, u.gauge + u.spd * BTL.RATE * dt * slow * (u.side === "e" ? BTL.FOE_SLOW : 1));
      }
      /* breath comes back slowly */
      for (const u of B.units) if (u.side === "p" && !u.ko && u.mp < u.maxMp) { u.breathAcc += BTL.REGEN_BREATH * dt; if (u.breathAcc >= 1) { u.breathAcc -= 1; u.mp++; } }
    }
    /* open the release window for the first charged caster */
    if (!B.window) {
      const w = B.living("p").find((u) => u.cast && u.cast.wait && !u.cast.ready);
      if (w) { B.window = { uid: w.id, t: 0 }; }
    }
    /* foes whose gauge is full queue themselves */
    for (const u of B.units) if (u.side === "e" && !u.ko && !u.act && u.gauge >= 100 && !u.queued && u.sleepT <= B.t) { const c = foeChoose(u); if (c) { u.queued = c; B.queue.push(u.id); } }
    if (B.cur === null && B.queue.length) {
      while (B.queue.length) {
        const u = B.by(B.queue.shift());
        if (u && !u.ko && u.queued) { begin(u, u.queued); break; }
        if (u) u.queued = null;
      }
    }
    if (B.cur !== null) {
      const u = B.by(B.cur), a = u.act;
      a.t += dt;
      if (!a.hit && a.t >= a.hitAt) { a.hit = true; resolve(u, a); }
      if (a.t >= a.dur) { u.act = null; B.cur = null; if (u.ko) u.anim = { n: "dead", t: 9 }; }
    }
    for (const u of B.units) if (u.anim.n === "hurt" && u.anim.t > BTL.T_HURT && !u.ko) u.anim = { n: "idle", t: 0 };
    if (B.phase === "fight" && B.cur === null) {
      if (!B.living("e").length) finish("won");
      else if (!B.living("p").length) finish("lost");
    }
    if (B.phase === "fled") finish("fled");
  };
  function finish(ph) {
    B.phase = ph; B.cur = null; B.window = null;
    for (const u of B.units) { u.act = null; u.queued = null; }   // a flee resolves mid-action: nothing may be left waiting to finish
    let xp = 0, coins = 0; const loot = {};
    if (ph === "won") {
      for (const f of B.foes()) {
        const d = BTL_FOES[f.key]; xp += d.xp; coins += d.coins[0] + Math.floor(rng() * (d.coins[1] - d.coins[0] + 1));
        for (const [it, p] of d.drops) if (rng() < p) loot[it] = (loot[it] || 0) + 1;
      }
    }
    B.result = { phase: ph, xp, coins, loot, used: B.used,
      members: B.allies().map((u) => ({ key: u.key, hp: ph === "lost" ? 0 : u.hp, mp: u.mp, ko: u.ko })) };
  }
  return B;
}

/* apply a finished battle to the save. returns level-up notes */
function btlApply(G, res) {
  btlEnsureParty(G);
  const ups = [];
  for (const m of res.members) { const r = G.party[m.key]; if (r) { r.hp = m.ko ? 0 : m.hp; r.mp = m.mp; } }
  for (const k in res.used) { G.items[k] = Math.max(0, (G.items[k] || 0) - res.used[k]); if (!G.items[k]) delete G.items[k]; }
  if (res.phase === "won") {
    G.coins += res.coins;
    for (const k in res.loot) G.items[k] = (G.items[k] || 0) + res.loot[k];
    const alive = res.members.filter((m) => !m.ko).length || 1;
    for (const m of res.members) {
      const r = G.party[m.key]; if (!r) continue;
      if (m.ko) continue;
      r.xp += Math.round(res.xp / alive);
      while (r.lv < BTL_MAX_LV && r.xp >= BTL_XP_FOR(r.lv)) {
        r.xp -= BTL_XP_FOR(r.lv); const old = btlStatsFor(G, m.key, r.lv); r.lv++;
        const s = btlStatsFor(G, m.key, r.lv); r.hp += s.hp - old.hp; r.mp += s.mp - old.mp;
        ups.push({ key: m.key, lv: r.lv });
      }
    }
  }
  return ups;
}
function btlRest(G) { btlEnsureParty(G); for (const id in G.party) { const s = btlStatsFor(G, id, G.party[id].lv); G.party[id].hp = s.hp; G.party[id].mp = s.mp; } }
