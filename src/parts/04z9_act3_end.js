/* ------------------------------------------------------------------ */
/* The end of Act Three, and the war on the roads.                     */
/*  - Six clashes on southern Etharis's roads: Covenant soldiers and   */
/*    Purifiers at each other's throats. The party can join, on the    */
/*    Covenant's side (the Purifiers burn weavers). A clash won stays   */
/*    quiet until the next Pillar rest, then flares up again.          */
/*  - The far tome's record, read in the Vaultwarden's hall.           */
/*  - The Capital Gate: the letter of passage opens the road north-   */
/*    east, and the act closes with its card.                          */
/* ------------------------------------------------------------------ */
const xv = (who, t) => ({ who, t });

/* the Pillar rest count, mirrored into the flags so the world's schedules can see it */
{
  const _rest = pillarRest;
  pillarRest = function (G, ...a) { const r = _rest(G, ...a); G.flags.__rests = G.rests | 0; return r; };
}
const clashQuiet = (f, i) => f[`clash${i}`] !== undefined && f[`clash${i}`] === (f.__rests | 0);

/* ---------- the clashes ---------- */
for (const cl of ETH_CLASHES) {
  const i = cl.id, live = (f) => !!f.act2_end && !clashQuiet(f, i);
  const add = (id, name, title, look, [gx, gy], face, chibi) => {
    NPC_DEFS[id] = { id, act2: true, name, title, look, schedule: [{ h: 0, map: null }],
      flagSched: [{ when: live, e: { h: 0, map: cl.map, x: gx - cl.ox, y: gy - cl.oy, w: 0, face, where: "fighting on the road" } }] };
    CHIBI_MAP[id] = chibi;
  };
  add(`clc${i}a`, "Covenant soldier", "Fighting on the road", { skin: 1, hair: 1, helm: true, cloth: 4, outfit: "coat", mood: "neutral" }, cl.cov[0], "right", "a2_covknight");
  add(`clc${i}b`, "Covenant soldier", "Fighting on the road", { skin: 2, hair: 0, helm: true, cloth: 4, outfit: "coat", mood: "neutral" }, cl.cov[1], "right", "a2_covxbow");
  add(`clp${i}a`, "Purifier", "Fighting on the road", { hood: true, cloth: 9, outfit: "coat", mood: "sly" }, cl.pur[0], "left", "n_sarn");
  add(`clp${i}b`, "Purifier", "Fighting on the road", { hood: true, cloth: 9, outfit: "coat", mood: "neutral" }, cl.pur[1], "left", "n_sarn");
  add(`clp${i}c`, "Purifier", "Fighting on the road", { hood: true, cloth: 9, outfit: "coat", mood: "sly" }, cl.pur[2], "left", "n_sarn");
  for (const k of ["a", "b"]) SCRIPTS[`clc${i}${k}`] = (c) => [xv(`clc${i}${k}`, clashQuiet(c.G.flags, i) ? "Thanks for the help back there." : "Get back! Purifiers!")];
  for (const k of ["a", "b", "c"]) SCRIPTS[`clp${i}${k}`] = (c) => [xv(`clp${i}${k}`, "Burn it all.")];
  const SCENES = [
    ["A Covenant patrol has a Purifier cell pinned against a burning cart. Or the other way round. It is hard to tell, and nobody is winning.", "Hold the line! In the Archon's name, hold!", "The Covenant hides the word and calls it order. We burn it and call it mercy."],
    ["Two Covenant soldiers back to back on the road, three Purifiers circling them with fire in their hands.", "Stay out of this, travellers! ...No. Please. Help us.", "Weavers' dogs. Lie down with them, burn with them."],
    ["Smoke on the road ahead. A Covenant tithe-wagon on its side, its guards drawn up behind it, and Purifiers walking toward them through the smoke.", "They want the tithe-grain! They'll burn it rather than let it reach Verrin!", "Grain grown under the Covenant's lie. Ash is cleaner."],
  ];
  const [scene, covLine, purLine] = SCENES[i % SCENES.length];
  SCRIPTS[`trig_clash${i}`] = (c) => {
    if (!c.G.flags.act2_end || clashQuiet(c.G.flags, i)) return [];
    const foes = i % 2 ? ["purbrand", "purburner", "pscout"] : ["purburner", "purburner", "pscout"];
    return [xv("narrator", scene), xv(`clc${i}a`, covLine), xv(`clp${i}a`, purLine),
      { choice: [
        ["Join the Covenant soldiers", [xv("narrator", "You step in beside the soldiers. The nearest Purifier sees your hands, and smiles."), xv(`clp${i}a`, "A weaver. Better and better."), { fight: { foes, win: `clash${i}_win` } }]],
        ["Stay out of it", [xv("narrator", "You hang back off the road. The fight goes on without you, and you don't stay to see who wins.")]],
      ] }];
  };
}
LOOK_TEXT.clashfire = ["A cart burning on the road, Purifier wax still sputtering in the wheel-hubs."];
QUEST_WIN_HOOKS.push((G, foes, quest) => {
  const m = /^clash(\d+)_win$/.exec(quest || ""); if (!m) return null;
  const i = +m[1], f = G.flags; f[`clash${i}`] = f.__rests | 0; delete f[`clash${i}_win`];
  const coins = 18 + i * 3; G.coins += coins; giveItem(G, i % 2 ? "gtonic" : "gpoultice", 1);
  f.clashes_won = (f.clashes_won | 0) + 1;
  return [xv("narrator", "The last Purifier goes down in the smoke. The soldiers lower their blades and look at you, and at your hands, for a long moment."),
    xv(`clc${i}a`, ["Archon's breath. You're a weaver. And you fought for us.", "We'd not have held. Take this, it's the patrol's purse. The captain won't miss it.", "Don't tell the Arbitrators we owe a weaver our necks. Just... thank you."][i % 3]),
    xv("narrator", `The soldiers press ${coins} coppers and a ${i % 2 ? "tonic" : "poultice"} on you.`),
    ...(f.clashes_won === 2 && inParty(G, "tessa") ? [xv("tessa", "Covenant soldiers, thanking a weaver. Six months ago they'd have taken us in chains.")] : [])];
});

/* ---------- the far tome's record: read in the Warden's Hall, once the letter is given ---------- */
{
  const _marrow = SCRIPTS.marrow;
  SCRIPTS.marrow = (c) => {
    const G = c.G;
    if (c.flag("capital_letter") && qs(G, "q_comp") === 2) {
      if (!(typeof compKey === "function" && inParty(G, compKey(G)))) return [xv("marrow", "Your friend, the former Initiate, sent word asking to read a record from the sealed stacks. Bring them, and I'll allow it. Once.")];
      return [
        xv("marrow", "Your Initiate. Pell sent up a note: a record in the sealed stacks. Very well. One page, read here, in front of me."),
        xv("narrator", "A seal-keeper brings a single ledger page on a board. The Initiate reads it twice, very still."),
        xv("unchosen", "\"One tome, bound in grey hide, in no tongue the College knows. Brought into Etharis from beyond the Ringval Wilds. Held at Aurelm eleven winters.\""),
        xv("unchosen", "\"Carried to the Great Sanctum, Capital City, three winters past, by order of the High Council. Not to be copied. Not to be spoken of.\""),
        xv("unchosen", "The Capital. Of course it's the Capital. Everything ends up in the Capital."),
        xv("marrow", "You'll find the Sanctum harder to talk your way into than my hall. Good day."),
        { do: (c) => c.set("q_comp", 3) }];
    }
    const st = _marrow(c);
    if (c.flag("capital_letter") && !c.flag("q_act3")) st.push({ do: (c) => c.set("q_act3", 1) });
    return st;
  };
}
{
  const q = ASH_QUESTS.find((x) => x[0] === "q_comp");
  if (q) { q[2] = ["", "Help the former Initiate find word of the far tome. Aurelm's Vault keeps copies of Verrin's records", "The record went into the Vault's sealed stacks. Once the Vault is whole, ask the Vaultwarden", "The far tome was carried to the Great Sanctum in Capital City", ""];
    q[3] = ["", "Ask at the Archive House in Aurelm", "The Warden's Hall, in Aurelm's Vault Ward", "The Capital: the road beyond the Capital Gate"]; }
}
ASH_QUESTS.push(["q_act3", "The Capital Road", ["", "Take the letter of passage to the Capital Gate"], ["", "The Capital Gate, at the north-east end of the Verrin road"]]);

/* ---------- the Capital Gate: the act ends ---------- */
SCRIPTS.trig_capgate = (c) => {
  const G = c.G, f = G.flags;
  if (!f.capital_letter || f.act3_end) return [];
  const comp = typeof compKey === "function" && inParty(G, compKey(G));
  return [
    xv("narrator", "The Capital Gate: a wall across the north-east road, higher than Verrin's, the Covenant's knot carved over the arch. The guards watch you come the whole way."),
    xv("narrator", "You hold up the Vaultwarden's letter. The sergeant reads it twice, looks at each of you in turn, and does not like what he sees. Then he looks at the seal again."),
    { choice: [
      ["Take the Capital Road", [
        xv("narrator", "The bar lifts. Beyond the gate the road runs on north-east between stone mileposts, toward a smudge of white on the horizon that is not cloud."),
        ...(inParty(G, "hakon") ? [xv("hakon", "The Foundry. He's somewhere in that. Hold on, Arthur. A little longer.")] : []),
        ...(comp ? [xv("unchosen", f.q_comp >= 3 ? "The Great Sanctum is in that city. So is the record of my tome. So is whatever the Council won't speak of." : "The College sent me away from that city. I'm walking back into it with a stolen Vault book in my friend's satchel. Wonderful.")] : []),
        ...(inParty(G, "tessa") ? [xv("tessa", "Oakhaven. Ashford. The Fort. The south. Every time we think we've seen how big it is.")] : []),
        xv("narrator", "In your satchel the tome sits heavy and quiet. Somewhere ahead, a man named Kellan Vex is looking for it. And the Covenant, which wrote your letter, would chain you for carrying it."),
        xv("narrator", "Magic, they told you, is in the blood. A miller's girl in Millhaven lit a lamp with a word. A seal-keeper said anyone could learn it. The answer is in that city. You walk toward it."),
        { do: (c) => { c.set("act3_end"); c.set("q_act3", 2); } },
        { act: "credits3" },
      ]],
      ["\"Not yet.\"", [xv("narrator", "The sergeant lowers the bar again. \"When you're ready. The letter doesn't expire. We do.\"")]],
    ] }];
};
