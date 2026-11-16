/* ------------------------------------------------------------------ */
/* The end of Act Two.                                                 */
/*   8. Ulric's letter opens the road home: Oakhaven, half rebuilt and  */
/*      cold; Maud, who is his mother, reads it, sends supplies, and    */
/*      teaches Mem-it. The party travels by Pillar and delivers.       */
/*   9. The Keystone (04r) can go home to Greywick at any time.         */
/*  10. Ulric's second task and his warning; Hakon's road and the       */
/*      Covenant's both run south; the party leaves by Ashford's south  */
/*      gate, and the act closes.                                       */
/* ------------------------------------------------------------------ */
const ev = (who, t) => ({ who, t });
const inParty = (G, id) => !!(G.partyIds && G.partyIds.includes(id));

/* ---------- the quest log ---------- */
{
  const m = ASH_QUESTS.find((q) => q[0] === "q_maud");
  if (m) { m[2] = ["", "Take Ulric's letter to Old Maud in the North Woods", "Bring Maud's bundle to Ulric at the Fort"]; m[3] = ["", "Oakhaven's east gate is open again. Maud's cottage is at the end of the north trail", "Mem-it from any Pillar to Fort Frostcrown, then the Command Post"]; }
  if (!ASH_QUESTS.find((q) => q[0] === "q_south")) ASH_QUESTS.push(["q_south", "The Road South", ["", "Leave by Ashford's south gate, for southern Etharis"], ["", "The field gate at the bottom of Ashford. It will open for the Arbitrator's seal"]]);
}
ITEMS.maudbundle = { name: "Maud's bundle", quest: true, desc: "Salves, tinctures and clean linen, packed tight in a shawl and tied with red thread. On top, a folded note in a crabbed hand: 'Ulric.'" };
ITEMS.dispatch = { name: "The Arbitrator's dispatch", quest: true, desc: "Sealed with the Fort's knot. For the Covenant's southern seat in Etharis. Heavier than a letter ought to be." };

/* Maud is still in her cottage when the town is rebuilt; Tessa is in the party now, so Bram speaks to her, not of her */
REBUILT_SCHED.maud = { h: 0, map: "hut", x: 4, y: 3, w: 0, where: "her cottage in the North Woods" };
{
  const _bram = SCRIPTS.bram_rebuilt;
  SCRIPTS.bram_rebuilt = (c) => {
    const st = _bram(c);
    if (inParty(c.G, "tessa")) for (const s of st) if (s && s.choice) for (const ch of s.choice) for (let i = 0; i < ch[1].length; i++) {
      const x = ch[1][i];
      if (typeof x === "string" && x.startsWith("Tessa writes")) ch[1][i] = "And you, Tessa. You're thin. Your mother would have had my ears for letting you go.";
    }
    return st;
  };
}

/* ---------- 8. home ---------- */
QUEST_ENTER_HOOKS.push((G, id) => {
  const f = G.flags;
  if (f.ulric_met && !f.oak_rebuilt) f.oak_rebuilt = true;   // saves from before the road home opened
  if (id === "oak" && f.oak_rebuilt && f.ulric_met && !f.oak_return_seen) {
    f.oak_return_seen = true;
    return [
      ev("narrator", "Oakhaven. New timber where the houses were, half of it still white. A few roofs. A lot of cleared ground, swept flat, with nothing on it yet."),
      ev("narrator", "People stop working as you come through the gate. Nobody waves. A woman takes her child by the shoulder and turns him round."),
      ev("tessa", "They've done a lot. More than I thought. That's the Hollow Oak, look, it's got its roof back."),
      ev("tessa", "And that's... they put a stone where the workshop was."),
      ...(inParty(G, "hakon") ? [ev("hakon", "A town that burned and is building again. That is a hard town. Do not take the cold of it personally.")] : []),
      ev("narrator", "Maud's cottage is north, through the woods, at the end of the trail. Bram will be at the Hollow Oak."),
    ];
  }
  return null;
});

/* Maud reads her son's letter */
{
  const _maud = SCRIPTS.maud;
  SCRIPTS.maud = (c) => {
    const f = c.G.flags, s = qs(c.G, "q_maud");
    if (s === 1 && c.G.items.maudletter > 0) return [
      ev("maud", "You again. You've got older. And you've brought company, and a Covenant seal. Give it here before you drop it in the snow."),
      ev("narrator", "Maud turns the letter over and looks at the seal for a long time before she breaks it. She reads it once, slowly. Then she reads it again."),
      ev("maud", "Ulric. He always did write like a man filling out a requisition."),
      ev("tessa", "Ulric? The Arbitrator? He's... you're his..."),
      ev("maud", "His mother. Yes. Close your mouth, girl, you'll catch the cold. He went to the Covenant at sixteen and I told him not to come back with that knot on his coat. He didn't come back at all."),
      ev("maud", "Thirty years of letters. Every winter. I keep them under the bed. I never wrote one back. Pride's a cold thing to sleep beside."),
      ev("maud", "He says his Fort is short of salves and his apothecary is a fool. Well. That I can mend."),
      ev("narrator", "She fills a shawl with jars and linen and ties it with red thread. Then she writes something short on the back of his letter, folds it, and tucks it in the top."),
      { do: (c) => { c.take("maudletter", 1); c.give("maudbundle", 1); c.set("q_maud", 2); } },
      ev("narrator", "You received Maud's bundle."),
      ev("maud", "Now. You'll not walk all the way back to that Fort with my jars rattling. You've a tome. You've touched the stones. You can feel them, can't you? Like knots in a net."),
      ev("maud", "Mem, which is memory. -it, the going. Mem-it. Hold a Pillar you've touched in your mind, the way you'd hold a face, and say it. And you're there."),
      { do: (c) => { c.learn({ r: ["Mem"], s: ["it"] }); c.set("memit"); } },
      ev("narrator", "You learned the root Mem and the ending -it. At any Pillar you have woken, you can now travel to any other: Travel, Mem-it."),
      ev("maud", "Try it at the town stone. And child: tell him... no. Give him the bundle. He can read."),
    ];
    if (s === 2) return [ev("maud", c.rot("maud_a2", ["Go on. The Fort. Mem-it, from the town stone.", "Tell him the green jar's for chilblains and the brown one isn't for drinking.", "The woods are quieter since the fire. I don't trust quiet."]))];
    if (s >= 3) return [ev("maud", c.rot("maud_a3", ["He wrote back already. Two lines. Two more than I expected.", "South, is it? Take the wolf pelts off anything that tries to eat you. They sell well down there."]))];
    return _maud ? _maud(c) : null;
  };
}

/* ---------- 10. Ulric: the bundle, the second task, the warning ---------- */
{
  const _ulric = SCRIPTS.ulric;
  SCRIPTS.ulric = (c) => {
    const s = qs(c.G, "q_maud");
    if (s === 2 && c.G.items.maudbundle > 0) return [
      ev("narrator", "Ulric unties the red thread himself. He finds the note on top before he finds the jars, and reads it standing up."),
      ev("narrator", "Whatever it says, it is short. He folds it once and puts it inside his coat, over his heart, and for a moment the Arbitrator of Fort Frostcrown is only a man in a cold room."),
      ev("ulric", "Thank you. That is the first task. I will not say more about it, and you will not ask."),
      { do: (c) => { c.take("maudbundle", 1); c.set("q_maud", 3); c.coins(150); } },
      ev("narrator", "150 coppers, from the Arbitrator's own purse."),
      ev("ulric", "The second task is harder, and further. A Covenant vault in southern Etharis was broken open this autumn. A tome was taken. An old one."),
      ev("ulric", "Carry my dispatch to our southern seat. Tell them what you have seen in the March: the Purifiers, the Vale scouts, the Pillars going dark. Then do what they ask of you. Come back with their word, and you will wear the knot."),
      ev("ulric", "The south is not the March. There are things on those roads that were old when the Covenant was young, and bandits who would sell their own mothers. Go armed."),
      { choice: [
        ["\"What was in the tome?\"", [
          ev("ulric", "Workings. Old Tongue, of a kind the Weaver Hall does not teach. That is all I was told."),
          ev("ulric", "And one thing more, which I was not told, and you did not hear: it was not whole. Pages had been cut out of it long before the thieves came. Someone has the rest of it, somewhere."),
          ev("narrator", "Under your coat, the oilcloth bundle is very still."),
          { do: (c) => c.set("ulric_hint") }]],
        ["\"We'll go.\"", [ev("ulric", "I know you will. That is why I am asking you.")]],
      ] },
      { do: (c) => { c.give("dispatch", 1); c.set("q_south", 1); } },
      ev("narrator", "You received the Arbitrator's dispatch."),
      ...(inParty(c.G, "hakon") ? [ev("hakon", "South. The Cleave's bill of sale said south, for my brother. Two roads, and they run the same way. I do not believe in luck, but I will take it.")] : []),
      ev("tessa", "Southern Etharis. I've never been further than Ashford. Before this winter I'd never been further than the Hollow Oak."),
      ev("ulric", "Leave by Ashford's south gate. Show them the seal. And whatever you carry in that coat: keep carrying it quietly."),
    ];
    if (qs(c.G, "q_south") === 1) return [ev("ulric", c.rot("ulric_s", ["Ashford's south gate. The dispatch, to our southern seat.", "Rennick says you have the makings of something. She does not say that.", "Go well. Come back."]))];
    return _ulric ? _ulric(c) : [];
  };
}

/* the gate home opens with Ulric's letter */
{
  const _u = SCRIPTS.ulric;
  SCRIPTS.ulric = (c) => {
    const st = _u(c);
    if (!c.G.flags.ulric_met && Array.isArray(st)) st.push({ do: (c) => c.set("oak_rebuilt") }, ev("narrator", "The way home is open: Oakhaven's east gate, at the western end of the Ashford road."));
    return st;
  };
}

/* ---------- 10. the south gate of Ashford: the act ends ---------- */
delete MAP_DEFS.ash.looks.gate;
SCRIPTS.look_gate = (c) => {
  const south = c.tile && c.tile[1] > 50;
  if (!south) return [ev("narrator", c.rot("ashgate_look", ["Barred, at the Curate's order. A soldier on the other side tells you so before you ask.", "Shut fast. Through the slats: wet fields and a grey sky."]))];
  if (qs(c.G, "q_south") !== 1) return [ev("narrator", "The south field gate, barred. Past it the fields run down to a road, and the road runs south, a long way."), ev("narrator", "A soldier leans on the other side. \"Nobody south without a seal. Arbitrator's orders.\"")];
  return [
    ev("narrator", "You hold up the Arbitrator's seal. The soldier reads it, straightens, and lifts the bar."),
    { choice: [["Take the road south", [
      ev("narrator", "The gate swings open on wet fields and a road running away south, grey under a grey sky. For the first time in weeks there is no snow on it."),
      ...(inParty(c.G, "hakon") ? [ev("hakon", "Arthur. I am coming. Hold on a little longer.")] : []),
      ev("tessa", "Oakhaven's behind us. Ashford's behind us. The Fort. Greywick. All of it."),
      ev("tessa", "Come on, then. Before I think about it."),
      ...(c.G.flags.gw_keystone ? [ev("narrator", "Behind you, far off in the north, a Pillar you set right burns steady over Greywick.")] : []),
      ev("narrator", "Somewhere south, a vault stands broken open, and a book that is not whole waits for the rest of itself. You walk towards it."),
      { do: (c) => { c.set("q_south", 2); c.set("act2_end"); } },
      { act: "credits2" },
    ]], ["\"Not yet.\"", [ev("narrator", "The soldier lets the bar fall again. \"When you're ready.\"")]]] },
  ];
};
