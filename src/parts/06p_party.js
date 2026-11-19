/* ------------------------------------------------------------------ */
/* The party from Act 3: the hero who was not chosen joins as a second */
/* caster; three may walk the road (the hero and two beside them), the */
/* rest wait and are called at a Pillar; whoever walks with you        */
/* follows you through the world.                                      */
/* ------------------------------------------------------------------ */

/* the hero not chosen at the start: Elowyn if the player is Corin, Corin if the player is Elowyn */
const COMP_LOOK = {
  elowyn: { sex: "f", skin: 1, hair: 1, cloth: 0, eyes: 0, tunic: 0 },
  corin: { sex: "m", skin: 1, hair: 1, cloth: 0, eyes: 0, tunic: 0, cut: "spiky" },
};
const compKey = (G) => (G && G.look && G.look.sex === "f" ? "corin" : "elowyn");
const compName = (G) => (compKey(G) === "corin" ? "Corin" : "Elowyn");
const compPro = (G) => (compKey(G) === "corin" ? { they: "he", them: "him", their: "his" } : { they: "she", them: "her", their: "her" });
/* a former Covenant Initiate: a caster with a better word-arm than the hero has yet, and less in the sword */
BTL_PARTY.elowyn = { name: "Elowyn", role: "Former Initiate", caster: true, base: { hp: 50, mp: 12, atk: 9, mag: 11, def: 5, spd: 11 }, grow: { hp: 7.5, mp: 1.8, atk: 0.9, mag: 1.9, def: 0.9, spd: 0.45 } };
BTL_PARTY.corin = { name: "Corin", role: "Former Initiate", caster: true, base: { hp: 52, mp: 11, atk: 10, mag: 10, def: 5, spd: 10 }, grow: { hp: 8, mp: 1.7, atk: 1, mag: 1.8, def: 1, spd: 0.4 } };

/* the unchosen hero as a person in the world, before they join: one id, whose name and face follow the player's choice */
NPC_DEFS.unchosen = { id: "unchosen", name: "{comp}", title: "A former Initiate", act2: true, heroLook: true,
  schedule: [{ h: 0, map: "ver_registry", x: 13, y: 5, w: 1, where: "the Registry of the Weave" }],
  flagSched: [{ when: (f) => !!f.comp_joined, e: { h: 0, map: null } }, { when: (f) => !f.reached_verrin_hi, e: { h: 0, map: null } }] };

/* ---------- three walk the road ---------- */
const PARTY_MAX = 3;   // the hero and two beside them
const partyReserve = (G) => (G.reserve = G.reserve || []);
function partyJoin(G, id) {
  btlEnsureParty(G);
  if (G.partyIds.includes(id) || partyReserve(G).includes(id)) return "already";
  const lv = Math.max(1, G.party.wren.lv);
  G.party[id] = G.party[id] || btlFreshMember(id, lv);
  if (G.partyIds.length < PARTY_MAX) { G.partyIds.push(id); return "active"; }
  G.reserve.push(id); return "reserve";
}
/* someone called back from waiting is never far behind: they come back no more than a level under the hero, mended */
function partyCatchUp(G, id) {
  const m = G.party[id], lv = Math.max(m.lv, G.party.wren.lv - 1);
  if (lv !== m.lv) { m.lv = lv; m.xp = 0; }
  const st = btlStatsFor(G, id, m.lv); m.hp = st.hp; m.mp = st.mp;
}
function partyBench(G, id) {
  if (id === "wren" || !G.partyIds.includes(id)) return false;
  G.partyIds = G.partyIds.filter((k) => k !== id); partyReserve(G).push(id); return true;
}
function partyCall(G, id) {
  const r = partyReserve(G); if (!r.includes(id) || G.partyIds.length >= PARTY_MAX) return false;
  G.reserve = r.filter((k) => k !== id); G.partyIds.push(id); partyCatchUp(G, id); return true;
}
const partyName = (G, id) => (id === "wren" ? G.name : id === compKey(G) ? compName(G) : (BTL_PARTY[id] || {}).name || id);
const partyLook = (G, id) => (id === "wren" ? G.look : COMP_LOOK[id] ? COMP_LOOK[id] : CHIBI_MAP[id] ? { chibi: CHIBI_MAP[id] } : { chibi: id });

/* ---------- meeting them: at the Registry, turned away from its archive ---------- */
const cv = (who, t) => ({ who, t });
Object.assign(SCRIPTS, {
  unchosen: (c) => {
    const G = c.G, P = compPro(G), nm = compName(G);
    if (!c.flag("met_unchosen")) return [
      cv("narrator", `At the end of the hall a young ${P.they === "she" ? "woman" : "man"} in a travel-stained Initiate's coat is leaning on the Registrar's desk, very quietly furious.`),
      cv("unchosen", "I know what's in the lower archive. I catalogued half of it. I'm asking to read one ledger. One."),
      cv("lorne", "And I'm telling you, as I told you yesterday: former Initiates have no standing in the Registry. Good day."),
      cv("unchosen", "...Fine. Good day."),
      cv("unchosen", "You. You've been watching. You've got the look. Someone who's been told no by the Covenant and is trying to decide whether it was a fair no."),
      cv("unchosen", `${nm}. I was an Initiate of the College here, until last year. Something happened, and I left. Don't ask me about that yet.`),
      cv("unchosen", "There's a tome. Not here, not in Etharis at all. Far past the edge of any map the Covenant sells. The Registry's lower archive holds the only record of where it went, and the Registry won't let me near it."),
      cv("unchosen", "But Aurelm's Vault keeps copies of everything Verrin locks away. Everything. If you're going south, and you look like you are, take me with you."),
      cv("unchosen", "I can weave. Properly. I was the best in my year, before I wasn't anything. Help me find word of that book, and I'll stand beside you whatever comes."),
      ...(inParty(G, "tessa") ? [cv("tessa", "An Initiate who walked out of the College. Is that even allowed?")] : []),
      cv("unchosen", "No. That's rather the point."),
      { do: (c) => c.set("met_unchosen") },
      { choice: [
        ["\"Come with us.\"", compJoinSteps(G)],
        ["\"Give us a little time.\"", [cv("unchosen", "I'll be here, being refused. Don't take too long.")]],
      ] },
    ];
    return [cv("unchosen", "Still being refused. Have you decided?"), { choice: [["\"Come with us.\"", compJoinSteps(G)], ["\"Not yet.\"", []]] }];
  },
});
/* the joining itself, and the first lesson in who walks the road */
function compJoinSteps(G) {
  const full = G.partyIds && G.partyIds.length >= PARTY_MAX, nm = compName(G);
  return [cv("unchosen", "Good. I'll get my things. I don't have many things."),
    { do: (c) => { const k = compKey(c.G), where = partyJoin(c.G, k); c.set("comp_joined"); c.set("q_comp", 1); if (where === "reserve") c.set("swap_tut"); const st = btlStatsFor(c.G, k, c.G.party[k].lv); c.G.party[k].hp = st.hp; c.G.party[k].mp = st.mp; } },
    cv("narrator", full ? `${nm} joins you. Three may walk the road together: you, and two beside you. The rest wait, and come when called at a Pillar. Touch the Pillar in Pillar Court to choose who walks with you.` : `${nm} joins the party.`)];
}
ASH_QUESTS.push(["q_comp", "The Far Tome", ["", "Help the former Initiate find word of the far tome. Aurelm's Vault keeps copies of Verrin's records", "The record went into the Vault's sealed stacks. Once the Vault is whole, ask the Vaultwarden", ""], ["", "Ask at the Archive House in Aurelm", "The Warden's Hall, in Aurelm's Vault Ward"]]);
