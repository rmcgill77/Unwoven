/* ------------------------------------------------------------------ */
/* The East Light Forest: the Iron Cleave's camp. The tarped Pillar,   */
/* the pens and Hakon's brother, the bluff, the Tellers' Primer.       */
/* Map: 04k_eforest.js                                                 */
/* ------------------------------------------------------------------ */
PILLARS.efyard = { map: "eforest", name: "the lumber yard (tarped)", at: [42, 32, "up"] };
PILLARS.efbluff = { map: "eforest", name: "the foot of the bluff", at: [75, 24, "up"] };
delete MAP_DEFS.plainsSE.looks.barricade;

MAP_DEFS.eforest.looks = {
  bell: ["A sentry bell on a post, its rope frayed. Someone has stuffed a rag in its mouth so it only clanks.", "Under the bell, scratched into the post: a tally of travellers. Most marks are crossed out."],
  qmtent: ["The quartermaster's tent: a frame of poles, a tarp roof and a smell of lamp oil. Ledgers stacked on a barrel, all in a cipher."],
  tally: ["Tally marks, scratched into the pen post with a nail. Rows of five. They stop in the middle of a row.", "Low on the post, too low for a grown man to reach comfortably, someone has scratched a single letter: A."],
  wartent: ["The war tent. A House banner hangs inside: a white stag on black, the colours the orcs wear on their arm-bands. Frozen Vale colours, a long way south."],
  expanse: ["From the edge of the bluff the coast falls away into grey water. Far out, under a lid of cloud, the Dread Expanse lies flat and dark, and nothing moves on it."],
};
Object.assign(CHEST_LOOT, {
  c_ef_edge: [25, { btonic: 1 }], c_ef_yard1: [20, { poultice: 2, bread: 1 }], c_ef_yard2: [20, { poultice: 1, bread: 1 }],
  c_ef_qm: [60, { kettlehat: 1 }], c_ef_war: [100, { ringmail: 1, spoultice: 1 }], c_ef_bluff: [30, { cutgem: 1 }],
});
CHEST_RECIPE.c_ef_war = "fangcharm";
ITEMS.ledgerscrap = { name: "Torn ledger scrap", quest: true, desc: "A page torn from a camp ledger: 'Vale boy, strong, quiet. Held three weeks. Sold on.' The rest is torn away." };

/* the yard crew falls: the tarp can come off the Pillar */
QUEST_WIN_HOOKS.push((G, foes) => {
  const f = G.flags;
  if (foes.includes("bthug") && foes.includes("orcW") && !f.ef_yard_clear) {
    f.ef_yard_clear = true;
    return [{ who: "narrator", t: "The yard goes quiet. Under a filthy tarp in the middle of it, something hums: a Pillar, lashed over and left to sleep." }];
  }
  if (foes.includes("ironcleave") && !f.arthur_clue) {
    f.arthur_clue = true;
    if (G.partyIds && G.partyIds.includes("hakon") && G.items.hakoncleaver > 0) gearEquip(G, "hakoncleaver", "hakon");
    return [
      { who: "narrator", t: "The Iron Cleave goes down on one knee, then all the way. The cleaver rings on the rock and lies still." },
      { who: "narrator", t: "In his coat: a House signet ring, a slim grey book, and a folded bill of sale under a seal of a cut thread. 'One smith, sound. Delivered south.'" },
      { who: "hakon", t: "One smith. Arthur was apprenticed to a smith before they took him. Sound, they write, as if he were a horse." },
      { who: "hakon", t: "South. They sold him south. Then that is where we go, when the Fort is done. You promised." },
      { who: "tessa", t: "We did. And that book: it's not yours, Corin, but it's the same kind of thing as yours. Read it somewhere the Covenant isn't looking." },
      { who: "narrator", t: "Hakon takes up the Iron Cleave. It suits him better than its last owner." },
    ];
  }
  return null;
});

/* the tarped Pillar, Hakon's story by its fire, and reading the Primer at any Pillar out of the Covenant's sight */
PILLAR_HOOKS.push((c, pid) => {
  const G = c.G, f = G.flags;
  if (pid === "efyard" && !f.ef_tarp_off) {
    if (!f.ef_yard_clear) return [{ who: "narrator", t: "Something under a tarp in the yard hums, very faintly. You can't get to it with the yard crew watching." }];
    const steps = [{ who: "narrator", t: "You cut the lashings and drag the tarp off. The Pillar underneath is grimy and sullen, and then it isn't: the hum climbs, the light comes up, and the yard is warm for the first time in years." },
      { do: (c) => { c.set("ef_tarp_off"); act2Ensure(c.G).pillars.efyard = true; c.refreshWorld(); } }];
    if (f.hakon_joined && !f.arthur_told) steps.push(
      { who: "hakon", t: "Sit. I have a thing to say, and I will only say it once, so listen." },
      { who: "hakon", t: "The someone I am looking for is my brother. Arthur. Younger than me. Bandits took him off the road five winters ago, while I was away selling my sword to people who did not deserve it." },
      { who: "hakon", t: "I have followed every tale since. The last one said: the Iron Cleave's camp, east of Ashford. So. Here we are." },
      { who: "tessa", t: "Then we find out what they know. All of it." },
      { do: (c) => c.set("arthur_told") });
    return steps;
  }
  if (G.items.primer > 0 && !f.primer_read && PILLARS[pid] && !PILLARS[pid].covenant) return [
    { who: "narrator", t: "By the Pillar's light, away from any Covenant eye, you open the Tellers' Primer. Its pages are thin and grey, and the words on them sit very still." },
    { who: "narrator", t: "Ver, which tells true from false. Cogn, which is thought, thrown like a stone. Sens, the senses, named properly at last. And -ix, a ward, set round something to keep it." },
    { do: (c) => { learnWords(c.G, { r: ["Ver", "Cogn", "Sens"], s: ["ix"] }); c.set("primer_read"); } },
    { who: "narrator", t: "You learned the roots Ver, Cogn and Sens, and the ending -ix. Your own tome takes them down, one by one, in a hand that is not quite yours." },
    { who: "tessa", t: "Your book's writing in itself again. I'm never going to get used to that." },
  ];
  return null;
});

/* the tarp itself answers like the Pillar under it */
SCRIPTS.look_tarp = (c) => PILLAR_HOOKS[0](c, "efyard") || [{ who: "narrator", t: "The tarp is off. The Pillar hums." }];

/* the pens: Hakon's first sight of his brother's trail */
SCRIPTS.look_ledger = (c) => {
  if (c.flag("arthur1")) return [{ who: "narrator", t: "A crate of mouldy ledgers. The page that mattered is in your pack." }];
  const steps = [{ who: "narrator", t: "A crate of ledgers, most of them rotten. One page has been torn out and stuffed back in sideways. 'Vale boy, strong, quiet. Held three weeks. Sold on.'" },
    { do: (c) => { c.set("arthur1"); c.give("ledgerscrap", 1); } }];
  if (c.flag("hakon_joined")) steps.push({ who: "hakon", t: "Vale boy. Strong, quiet." }, { who: "narrator", t: "Hakon reads it twice, and folds it very small, and does not say anything else for a while." });
  return steps;
};
