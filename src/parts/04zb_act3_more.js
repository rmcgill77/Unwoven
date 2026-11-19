/* ------------------------------------------------------------------ */
/* Act Three, finished off:                                            */
/*  - the companion's incident, told a piece at a time at Pillar rests  */
/*  - the Unbound camps of southern Etharis: an arrow without Ysra's    */
/*    red thread, a fire and a rest with it                            */
/*  - scrutiny: how close the Covenant is to noticing the tome         */
/*  - loose threads: Ulric's dispatch reaches Verrin, "Eyes in Aurelm"  */
/*    completes, and the task list knows it's Act Three                 */
/* ------------------------------------------------------------------ */
const mv3 = (who, t) => ({ who, t });
const compIn = (G) => typeof compKey === "function" && inParty(G, compKey(G));

/* ---------- the companion's incident, at Pillar rests ---------- */
const COMP_STORY = [
  (G) => [mv3("unchosen", "You want to know about the eighth. All right. Some of it."),
    mv3("unchosen", "There were seven of us Initiates on the mountain that summer, and Teo. Teo carried the instruments. A cook's son from Verrin's Lower Town. No Weaver line in him at all."),
    mv3("unchosen", "He listened. That's all. Every night, while Master Corvane taught us the words, Teo sat at the back with the brass and listened."),
    ...(inParty(G, "tessa") ? [mv3("tessa", "Like you listened, with your tome. Just... with ears.")] : [])],
  (G) => [mv3("unchosen", "The fourth night, Corvane had us weave a light over the leyline. Seven of us, together. A simple word. We'd done it a hundred times."),
    mv3("unchosen", "Teo said it with us. Under his breath, from the back. And the light came for him too."),
    mv3("unchosen", "Brighter than ours. Brighter than mine. And I was the best in my year."),
    ...(G.flags.mh_parley ? [mv3("unchosen", "Like Fen, in Millhaven. Exactly like Fen.")] : [])],
  (G) => [mv3("unchosen", "Corvane didn't look surprised. That's what I remember. He looked frightened."),
    mv3("unchosen", "In the morning there were Arbitrators on the path. They took Teo down the mountain in a closed cart. North. Toward the Capital."),
    mv3("unchosen", "The College record says he fell from the ledge at the observatory. I've read it. I know the handwriting."),
    ...(inParty(G, "hakon") ? [mv3("hakon", "A closed cart, going north. I know that road now. My brother went down it too.")] : [])],
  (G) => [mv3("unchosen", "So I asked where Teo was. Then I asked again, in front of the whole College, at the Archon's Day reading."),
    mv3("unchosen", "They said I had a fever. That I'd imagined the light. When I wouldn't stop asking, they took my Initiate's ring and sent me out of Verrin with the clothes I stood in."),
    mv3("unchosen", "That's the incident. That's all of it. Magic isn't in the blood. It never was. They know it, and they hide anyone who proves it."),
    mv3("unchosen", "If Teo's alive, he's in the Capital. So is my tome. So is everything, apparently."),
    { do: (c) => c.set("comp_story_done") }],
];
PILLAR_HOOKS.push((c, pid) => {
  const G = c.G, f = G.flags;
  if (!f.cr_obs || f.comp_story_done || !compIn(G)) return null;
  const n = f.comp_story | 0, rests = f.__rests | 0;
  if (n > 0 && rests <= (f.comp_story_at | 0)) return null;               // one piece per rest
  if (n >= COMP_STORY.length) return null;
  return [mv3("narrator", "By the Pillar's light, the former Initiate sits down beside you without being asked."), ...COMP_STORY[n](G),
    { do: (c) => { c.set("comp_story", n + 1); c.set("comp_story_at", c.G.flags.__rests | 0); } }];
});

/* ---------- the Unbound camps of southern Etharis ---------- */
const UNB_NAMES = [["Maddox", "Wren-of-the-Downs"], ["Isolde Marr", "Quill"], ["Old Harrow", "Bree"], ["Tamsen", "Cobb"], ["Rook", "Sefa"], ["Ennis Vale", "Pike"]];
const UNB_GOSSIP = [
  "The Covenant tithe-wagons run north every week. They come back with soldiers.",
  "Rotmoor's line moves a road's width every month. The Purifiers say burn it all. The Covenant says wait. Neither of them is a cure.",
  "Fen's well, in Millhaven? Good. Ysra worries about that girl.",
  "The Purifiers have a man in black who tells them things. Nobody's seen his face. Everybody knows his thread.",
  "The Capital buys people. The Foundry, the Sanctum. Nobody goes in and comes out talking.",
  "If you're a weaver, and you are, don't cast where a soldier can see. They write it down. Everything gets written down.",
];
const unbOk = (f) => !!f.unb_trusted;
for (const u of ETH_UNBOUND) {
  const i = u.id, [n1, n2] = UNB_NAMES[i % UNB_NAMES.length];
  const add = (id, name, look, [gx, gy]) => {
    NPC_DEFS[id] = { id, act2: true, name, title: "Of the Unbound", look, schedule: [{ h: 0, map: null }],
      flagSched: [{ when: unbOk, e: { h: 0, map: u.map, x: gx - u.ox, y: gy - u.oy, w: 0, where: "the Unbound fire" } }] };
  };
  add(`unb${i}a`, n1, { skin: (i * 2) % 4, hair: i % 6, hood: true, cloth: 5, outfit: "coat", mood: "neutral" }, u.npc[0]);
  add(`unb${i}b`, n2, { sex: "f", skin: (i + 1) % 4, hair: (i + 2) % 6, hood: true, cloth: 5, outfit: "coat", mood: "neutral" }, u.npc[1]);
  SCRIPTS[`unb${i}a`] = (c) => [mv3(`unb${i}a`, c.rot(`unb${i}a`, [UNB_GOSSIP[i % UNB_GOSSIP.length], UNB_GOSSIP[(i + 3) % UNB_GOSSIP.length], "Sit, if you want. The fire's free. The rest is careful."])),
    { choice: [["Rest by the fire", [{ do: (c) => { c.innRest(true); scrutinyAdd(c.G, -15); } }]], ["Not now.", []]] }];
  SCRIPTS[`unb${i}b`] = (c) => [mv3(`unb${i}b`, c.rot(`unb${i}b`, ["Eyes on the road.", "Red thread, knotted thrice. You'll be fine here.", "We don't fight unless we have to. Live to talk another day."]))];
  SCRIPTS[`trig_unb${i}`] = (c) => {
    const f = c.G.flags;
    if (!f.act2_end) return [];
    if (f.unb_trusted) { if (f[`unb${i}_seen`]) return []; f[`unb${i}_seen`] = true; return [mv3("narrator", "A camp fire off the road, a yellow banner with a red sigil, and two hooded figures who raise a hand when they see your red thread.")]; }
    if (c.has("unbthread")) return [
      mv3("narrator", "An arrow hisses into the ground at your feet. A voice from behind the lean-to: \"Far enough.\""),
      mv3("narrator", "You hold up Ysra's red thread, knotted three times. A long pause. Then two figures step out, bows lowered."),
      mv3(`unb${i}a`, "Ysra's people. Come and sit. You'll find the same welcome at any of our fires, now. We talk to each other."),
      { do: (c) => { c.set("unb_trusted"); c.set(`unb${i}_seen`); } }];
    if (f[`unb${i}_warned`]) return [mv3("narrator", "From the scrub by the camp, the creak of a bowstring. Nobody shows themselves.")];
    return [mv3("narrator", "An arrow thuds into the earth a stride in front of you. A voice you can't place: \"That's a warning. Strangers walk round.\""),
      { do: (c) => c.set(`unb${i}_warned`) }];
  };
}

/* ---------- scrutiny: how near the Covenant is to noticing what you carry ---------- */
/* Rises when you cast in a Covenant city or in sight of its soldiers, when you're searched, and when soldiers see you
   fight at their side. It falls with rest at a Pillar away from the cities, or at an Unbound fire. At 50 an officer
   questions you; at 100 the Arbitrators come. Act Three on. */
const COV_MAPS = /^(ver_|au_|sb|eth)/;
const COV_CITY = /^(ver_lo|ver_hi|au_out|au_vault)$/;
function scrutinyAdd(G, n) {
  if (!G || !G.flags || !G.flags.act2_end) return 0;
  const f = G.flags, was = f.scrutiny | 0;
  f.scrutiny = Math.max(0, Math.min(100, was + n));
  return f.scrutiny - was;
}
function soldierNear(G, mapId, tile) {
  if (!tile) return false;
  for (const id in NPC_DEFS) {
    const d = NPC_DEFS[id]; if (!d.look || !d.look.helm) continue;
    const e = scheduleAt(d, (G.time / 60) % 24, G.flags);
    if (e && e.map === mapId && Math.hypot(e.x - tile[0], e.y - tile[1]) < 8) return true;
  }
  return false;
}
/* casting a word on the map: in a Covenant city, or where a helmeted soldier can see */
function scrutinyOnCast(G, mapId, tile) {
  if (!G.flags.act2_end) return null;
  const city = COV_CITY.test(mapId), seen = soldierNear(G, mapId, tile);
  if (!city && !seen) return null;
  const d = scrutinyAdd(G, (city ? 12 : 0) + (seen ? 10 : 0));
  return d > 0 ? (seen ? "A soldier saw that. Your scrutiny rises." : "Someone in the street saw that. Your scrutiny rises.") : null;
}
/* resting lowers it, more so away from the cities */
{
  const _rest = pillarRest;
  pillarRest = function (G, pid, ...a) {
    const r = _rest(G, pid, ...a);
    if (G.flags && G.flags.act2_end) scrutinyAdd(G, PILLARS[pid] && COV_MAPS.test(PILLARS[pid].map) && /^(ver|au)/.test(PILLARS[pid].map) ? -5 : -15);
    return r;
  };
}
/* the soldiers you fight beside remember your hands; the Aurelm gate searches everyone */
QUEST_WIN_HOOKS.push((G, foes, quest) => {
  if (/^clash\d+_win$/.test(quest || "") || quest === "cr_skirm_won" || quest === "au_skirm_won") scrutinyAdd(G, 8);
  return null;
});
Object.assign(NPC_DEFS, {
  covofficer: { id: "covofficer", act2: true, name: "Inquisitor Sabeth Crane", title: "Arbitrator's office", look: { sex: "f", skin: 0, hair: 4, hairStyle: "bun", cloth: 4, outfit: "coat", mood: "neutral" }, schedule: [{ h: 0, map: null }] },
});
CHIBI_MAP.covofficer = "a2_ysolt";
const SCRUTINY_SAY = (G) => (G.flags.ver_registered ? "You're on the Registry. I've read your line. It's a very short line, for someone who weaves." : "You're not on the Registry. A weaver who isn't on the Registry is either a fool or a problem.");
QUEST_ENTER_HOOKS.unshift((G, id) => {   // first in line: the Inquisitor doesn't wait for anyone's welcome
  const f = G.flags;
  if (!f.act2_end || !COV_CITY.test(id)) return null;
  const s = f.scrutiny | 0;
  if (s >= 100) return [
    mv3("narrator", "Four soldiers step out of the crowd at once, and the crowd steps back. A woman in an Arbitrator's grey walks between them."),
    mv3("covofficer", "Inquisitor Crane. You've been seen weaving in the Archon's streets, in front of the Archon's soldiers, more times than I have fingers. Your satchel. Now."),
    { choice: [
      [f.capital_letter ? "Show the Vaultwarden's letter" : f.ver_registered ? "Point to your Registry line" : "Talk your way out", f.capital_letter || f.ver_registered
        ? [mv3("covofficer", f.capital_letter ? "...The Vaultwarden's own seal. On a weaver. Hm." : "Registered. Barely. Hm."), mv3("covofficer", "Then you're someone else's problem today. Not tomorrow. Keep your hands in your sleeves."), { do: (c) => c.set("scrutiny", 60) }]
        : [mv3("covofficer", "No. Take them."), { fight: { foes: ["covarbiter", "covguard", "covguard"], win: "scrutiny_fled" } }]],
      ["Run for it", [mv3("narrator", "You bolt. They're faster than they look."), { fight: { foes: ["covarbiter", "covguard", "covguard"], win: "scrutiny_fled" } }]],
    ] }];
  if (s >= 50 && !f.scrutiny_questioned) return [
    mv3("narrator", "A woman in Arbitrator's grey falls into step beside you, as if she'd been waiting."),
    mv3("covofficer", "Inquisitor Crane. Walk with me a moment. People have been telling me about you."),
    mv3("covofficer", SCRUTINY_SAY(G)),
    { choice: [
      ["\"We're the Arbiter's eyes. Ask Cassius Venn.\"", [mv3("covofficer", "...I will. Don't make me sorry I did."), { do: (c) => { c.set("scrutiny_questioned"); scrutinyAdd(c.G, c.G.flags.q_aurelm ? -20 : -5); } }]],
      ...(G.coins >= 30 ? [["Offer her thirty coppers", [mv3("covofficer", "Put that away before someone sees you trying to bribe an Inquisitor. ...Fine. Keep it out of my streets."), { do: (c) => { c.set("scrutiny_questioned"); c.coins(-30); scrutinyAdd(c.G, -10); } }]]] : []),
      ["Say nothing", [mv3("covofficer", "Silence. That's an answer too. I'll be watching."), { do: (c) => { c.set("scrutiny_questioned"); scrutinyAdd(c.G, 5); } }]],
    ] }];
  return null;
});
QUEST_WIN_HOOKS.push((G, foes, quest) => {
  if (quest !== "scrutiny_fled") return null;
  G.flags.scrutiny = 40; delete G.flags.scrutiny_fled;
  return [mv3("narrator", "You leave the Inquisitor's men in the street and lose yourselves in the alleys before the bells start. The tome is still in your satchel. That was close."),
    ...(inParty(G, "tessa") ? [mv3("tessa", "We can't do that again. Rest somewhere they aren't, and keep your hands still in town.")] : [])];
});
/* first time it starts to climb, someone says so */
QUEST_ENTER_HOOKS.push((G, id) => {
  const f = G.flags;
  if (f.act2_end && (f.scrutiny | 0) >= 20 && !f.scrutiny_told) { f.scrutiny_told = true;
    return [mv3("narrator", "Scrutiny: how much the Covenant has noticed you weaving. It rises when you cast in a Covenant city or where soldiers can see, and when they see you fight. It falls when you rest at a Pillar away from the cities, or at an Unbound fire."),
      ...(inParty(G, "tessa") ? [mv3("tessa", "People are looking at us. At you. Let's not give them more to look at.")] : [])]; }
  return null;
});

/* ---------- loose threads ---------- */
/* Ulric's dispatch reaches the Covenant's southern seat */
{
  const _venn = SCRIPTS.venn;
  SCRIPTS.venn = (c) => {
    const st = _venn(c);
    if (c.has("dispatch")) st.unshift(mv3("narrator", "You give the Arbiter Ulric's sealed dispatch. He breaks the Fort's knot and reads it standing up."),
      mv3("venn", "Icetoe. Short, as ever. He says the north is holding, the Purifiers are bolder than he likes, and that the bearers are honest. From Icetoe that is a medal."),
      { do: (c) => c.take("dispatch", 1) });
    return st;
  };
}
/* "Eyes in Aurelm" ends when the Vaultwarden summons you */
{
  const q = ASH_QUESTS.find((x) => x[0] === "q_aurelm");
  if (q) { q[2] = ["", "Go south to Aurelm and offer the Vault-Keeper your help", ""]; q[3] = ["", "Aurelm lies far south, past Millhaven, round by the west lane", ""]; }
}
QUEST_ENTER_HOOKS.push((G, id) => { if (id === "au_vault" && (G.flags.q_aurelm | 0) === 1) G.flags.q_aurelm = 2; return null; });
/* the task list in Act Three: the quests in hand, the main road first, and no Act Two leftovers */
function act3Tasks(G, ctx) {
  const f = G.flags, l = [];
  const main = ["q_act3", "q_auseal", "q_authief", "q_aulock", "q_aurelm", "q_lantern", "q_sbwrit", "q_arthur", "q_comp", "q_mhparley", "q_rotcellar"];
  const seen = new Set();
  for (const k of main) { const q = ASH_QUESTS.find((x) => x[0] === k); if (!q) continue; const s = qs(G, k); if (s > 0 && s < q[2].length && q[2][s]) { l.push({ text: q[2][s], done: false, hint: q[3][s] }); seen.add(k); } }
  for (const [k, , steps, hints] of ASH_QUESTS) { if (seen.has(k)) continue; const s = qs(G, k); if (s > 0 && s < steps.length && steps[s]) l.push({ text: steps[s], done: false, hint: hints[s] }); }
  if (f.hakon_joined && !f.hakon_rot && !f.q_arthur) l.push({ text: "Ask after Hakon's brother in the south", done: false, hint: "Rotmoor's reeve hears everything that passes the quarantine" });
  if (!f.q_sbwrit && !f.reached_verrin_hi) l.unshift({ text: "Find the road to Verrin, the Covenant's seat in the south", done: false, hint: "Verrin's gate wants a writ. Stonebridge's bailiff writes them, west of the Pale Road" });
  if (f.act3_end) l.unshift({ text: "Act Three is complete. The south is still yours to explore", done: false, hint: "Act Four: the road to the Capital" });
  if (!l.length) l.push({ text: "Southern Etharis is quiet, for now", done: false, hint: "Talk to people. Somebody always wants something" });
  return l;
}
{
  const _tlm = taskListMain;
  taskListMain = function (G, ctx) { return G && G.flags && G.flags.act2_end ? act3Tasks(G, ctx) : _tlm(G, ctx); };
}
/* test hook: the Pillar's story beats without walking to one */
SCRIPTS.dbg_pillarhook = (c) => ashPillarLook(c, "eth_gate") || [];
SCRIPTS.dbg_cast = (c) => { const m = scrutinyOnCast(c.G, "ver_lo", [84, 30]); return m ? [mv3("narrator", m)] : []; };
