/* ------------------------------------------------------------------ */
/* Old Tongue: roots, suffixes and the spells they weave               */
/* A spell is one Root + one Suffix. Not every pair is a real word.    */
/* ------------------------------------------------------------------ */

/* [id, category, short meaning, implemented effect key or null] */
const OT_ROOTS = [
  ["Pyr", "Elements and matter", "flame and heat"], ["Nix", "Elements and matter", "frost and winter"], ["Vent", "Elements and matter", "wind and breath of air"],
  ["Petr", "Elements and matter", "stone and weight"], ["Ferr", "Elements and matter", "iron"], ["Fulg", "Elements and matter", "storm and lightning"],
  ["Bary", "Elements and matter", "gravity"], ["Nebul", "Elements and matter", "mist and fog"], ["Vitr", "Elements and matter", "glass"],
  ["Plast", "Elements and matter", "shaping, clay"], ["Fract", "Elements and matter", "breaking"], ["Stas", "Elements and matter", "stillness"],
  ["Tach", "Elements and matter", "speed"], ["Solen", "Elements and matter", "sun-fire"],
  ["Phaos", "Light, shadow, force, motion", "light"], ["Tenebr", "Light, shadow, force, motion", "shadow"], ["Vis", "Light, shadow, force, motion", "raw force"],
  ["Vinc", "Light, shadow, force, motion", "binding"], ["Ton", "Light, shadow, force, motion", "sound"], ["Eid", "Light, shadow, force, motion", "image and illusion"],
  ["Chron", "Light, shadow, force, motion", "time"],
  ["Cogn", "Mind, senses, life, nature", "thought"], ["Sens", "Mind, senses, life, nature", "the senses"], ["Mut", "Mind, senses, life, nature", "silence"],
  ["Ver", "Mind, senses, life, nature", "truth"], ["Somn", "Mind, senses, life, nature", "sleep"], ["Mem", "Mind, senses, life, nature", "memory"],
  ["San", "Mind, senses, life, nature", "mending and health"], ["Carn", "Mind, senses, life, nature", "flesh"], ["Flor", "Mind, senses, life, nature", "growing things"],
  ["Ven", "Mind, senses, life, nature", "venom"],
  ["Vora", "Forbidden and esoteric", "devouring"], ["Sanguis", "Forbidden and esoteric", "blood"], ["Xeno", "Forbidden and esoteric", "the foreign, the unmaking of wards"],
  ["Nihil", "Forbidden and esoteric", "nothing"], ["Strig", "Forbidden and esoteric", "the hunt"], ["Nexus", "Forbidden and esoteric", "the knot"], ["Phag", "Forbidden and esoteric", "consumption"],
].map(([id, cat, m]) => ({ id, cat, meaning: m, forbidden: cat.startsWith("Forbidden") }));

/* suffix: form, power, charge seconds, breath cost */
const OT_SUFFIXES = {
  is: { name: "-is", group: "Scale and precision", form: "minor", tag: "A small, quick working.", pw: 0.7, charge: 0.6, cost: 1 },
  os: { name: "-os", group: "Scale and precision", form: "major", tag: "A great working. Slow to draw.", pw: 1.7, charge: 1.9, cost: 3 },
  at: { name: "-at", group: "Scale and precision", form: "surgical", tag: "Precise. Slips past armour and guards.", pw: 1.05, charge: 1.1, cost: 2, pierce: 0.6 },
  ix: { name: "-ix", group: "Delivery and form", form: "ward", tag: "A ward around one ally.", pw: 1, charge: 1.0, cost: 2 },
  el: { name: "-el", group: "Delivery and form", form: "beam", tag: "A beam that strikes the target and the one behind it.", pw: 1.3, charge: 1.6, cost: 3 },
  am: { name: "-am", group: "Delivery and form", form: "radial cloud", tag: "A cloud that reaches everyone on that side.", pw: 0.75, charge: 1.6, cost: 3 },
  or: { name: "-or", group: "Delivery and form", form: "projectile", tag: "A bolt, thrown.", pw: 1.2, charge: 1.2, cost: 2 },
  on: { name: "-on", group: "Delivery and form", form: "construct", tag: "A solid thing, made real.", pw: 1, charge: 1.5, cost: 3, unwritten: true },
  ar: { name: "-ar", group: "Delivery and form", form: "decoy", tag: "A false image that draws the eye.", pw: 1, charge: 1.2, cost: 2, unwritten: true },
  en: { name: "-en", group: "Delivery and form", form: "infusion", tag: "Pours the working into an ally's weapon.", pw: 1, charge: 0.9, cost: 2 },
  us: { name: "-us", group: "Delivery and form", form: "snare", tag: "Binds the target: slower, or asleep.", pw: 1, charge: 1.1, cost: 2 },
  ex: { name: "-ex", group: "Timing and flow", form: "delayed trap", tag: "Set it now. It speaks later.", pw: 1, charge: 1.3, cost: 2, unwritten: true },
  it: { name: "-it", group: "Timing and flow", form: "instant snap", tag: "No weaving at all. Weak, but it cannot be ruptured.", pw: 0.55, charge: 0, cost: 2 },
  ant: { name: "-ant", group: "Timing and flow", form: "sustained channel", tag: "Held open while you breathe.", pw: 1, charge: 1.5, cost: 3, unwritten: true },
  in: { name: "-in", group: "Timing and flow", form: "inversion", tag: "Turns the working inside out.", pw: 1, charge: 1.2, cost: 2, unwritten: true },
  id: { name: "-id", group: "Timing and flow", form: "diagnostic echo", tag: "Asks the world what it is.", pw: 1, charge: 0.5, cost: 1 },
};

/* what each implemented root does, and which suffixes it accepts */
const OT_EFFECT = {
  Pyr:   { k: "dmg", el: "fire", pw: 1.0, acc: "is os at or el am it ix en", d: "Burns." },
  Nix:   { k: "dmg", el: "cold", pw: 0.9, acc: "is os at or el am it ix en us", d: "Chills and slows." },
  Vent:  { k: "dmg", el: "wind", pw: 0.85, acc: "is os at or el am it ix us", d: "Cuts, and the cut goes through armour.", pierce: 0.3 },
  Petr:  { k: "dmg", el: "stone", pw: 1.15, acc: "is os at or am ix en us", d: "Heavy, and hard to ward against." },
  Fulg:  { k: "dmg", el: "storm", pw: 1.0, acc: "is os at or el it ix en", d: "Strikes hard against armour.", pierce: 0.5 },
  Phaos: { k: "dmg", el: "light", pw: 0.8, acc: "is os at el am it ix en", d: "Light. It also lights the way." },
  Vis:   { k: "dmg", el: "force", pw: 0.9, acc: "is os at or el am it ix us en", d: "Raw force. Nothing resists it." },
  San:   { k: "heal", el: "life", pw: 1.0, acc: "is os at am ix en", d: "Mends." },
  Sens:  { k: "mark", el: "mind", pw: 1.0, acc: "id at am", d: "Finds the weak place." },
  Flor:  { k: "snare", el: "growth", pw: 1.0, acc: "is us am or en", d: "Roots, vines and slow green strangling." },
  Bary:  { k: "dmg", el: "force", pw: 0.8, acc: "is os", d: "Weight. It drags at whatever it names." },
  Somn:  { k: "sleep", el: "mind", pw: 1.0, acc: "us am or", d: "A heavy, sudden sleep." },
};
const OT_WORKING = Object.keys(OT_EFFECT);
const rootInfo = (id) => OT_ROOTS.find((r) => r.id === id);

/* Weave a pair. Returns a spell description, or { ok:false, why } */
function weaveSpell(root, suf) {
  const R = rootInfo(root), S = OT_SUFFIXES[suf], E = OT_EFFECT[root];
  if (!R || !S) return { ok: false, why: "Those are not words." };
  if (!E) return { ok: false, why: `${root} has not been written down yet.` };
  if (S.unwritten) return { ok: false, why: `${S.name} is in the tome, but its pages are too damaged to read.` };
  if (!E.acc.split(" ").includes(suf)) return { ok: false, why: `${root} will not take ${S.name}. The words refuse each other.` };
  const sp = { ok: true, id: `${root}-${suf}`, root, suf, name: `${root}${S.name}`, el: E.el, pw: S.pw * E.pw, charge: S.charge, cost: S.cost, pierce: Math.max(S.pierce || 0, E.pierce || 0), form: S.form, k: E.k, target: "foe", mapUse: null };
  if (suf === "ix") { sp.k = "ward"; sp.target = "ally"; }
  else if (suf === "en") { sp.k = "infuse"; sp.target = "ally"; }
  else if (E.k === "heal") { sp.target = suf === "am" ? "allies" : "ally"; if (suf === "ix") sp.k = "ward"; }
  else if (E.k === "mark") { sp.k = "mark"; sp.target = suf === "am" ? "foes" : "foe"; if (suf === "id") sp.pw = 1; }
  else if (suf === "us" || E.k === "snare" || E.k === "sleep") { sp.k = E.k === "sleep" ? "sleep" : "snare"; sp.target = suf === "am" ? "foes" : "foe"; }
  else if (suf === "am") sp.target = "foes";
  if ((E.k === "snare" || E.k === "sleep") && suf === "am") sp.target = "foes";
  if (E.k === "snare" && (suf === "or" || suf === "is")) sp.k = "dmg", sp.pw = 0.55 * S.pw;   // a thorn: a little damage, no bind
  if (E.k === "sleep" && suf === "or") sp.k = "sleep";
  // map uses
  if (root === "Phaos" && suf === "is") sp.mapUse = "light";
  if (root === "Sens" && suf === "id") sp.mapUse = "scan";
  if (root === "Bary" && suf === "is") sp.mapUse = "move";
  sp.desc = spellText(sp, S, E);
  return sp;
}
function spellText(sp, S, E) {
  const tgt = { foe: "one foe", foes: "every foe", ally: "one ally", allies: "every ally" }[sp.target];
  const act = { dmg: `${E.d}`, heal: "Restores health.", ward: "Absorbs the next blows and cannot be ruptured through.", infuse: `The next three strikes carry ${E.el}.`,
    snare: "Binds the target: slowed for a time.", sleep: "Puts the target to sleep until struck.", mark: "The target takes more damage for a time." }[sp.k];
  return `${act} ${S.tag} Target: ${tgt}.${sp.mapUse === "light" ? " Also lights a room." : ""}${sp.mapUse === "scan" ? " Also reveals what lurks nearby." : ""}${sp.mapUse === "move" ? " Out of battle, it shifts rubble and fallen stone." : ""}`;
}
/* every valid spell the known words allow */
function knownSpells(words) {
  const out = [];
  for (const r of words.r) for (const s of words.s) { const sp = weaveSpell(r, s); if (sp.ok) out.push(sp); }
  return out;
}

/* ---- the save: vocabulary, hotbar, signatures ---- */
function magicEnsure(G) {
  if (!G.words) G.words = { r: [], s: [] };
  if (!G.hotbar) G.hotbar = [null, null, null, null];
  if (!G.sigs) G.sigs = 0;
  return G.words;
}
function learnWords(G, add) {
  magicEnsure(G); const got = [];
  for (const r of add.r || []) if (!G.words.r.includes(r)) { G.words.r.push(r); got.push(r); }
  for (const s of add.s || []) if (!G.words.s.includes(s)) { G.words.s.push(s); got.push("-" + s); }
  // fill an empty hotbar slot with any new working spell
  for (const sp of knownSpells(G.words)) if (!G.hotbar.includes(sp.id)) { const i = G.hotbar.indexOf(null); if (i >= 0) G.hotbar[i] = sp.id; }
  return got;
}
const ALL_WORDS = { r: OT_WORKING, s: ["is", "os", "at", "ix", "el", "am", "or", "en", "us", "it", "id"] };
