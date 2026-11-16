/* ------------------------------------------------------------------ */
/* The West Light Forest: its Pillars, the scholar, the ruins' lore,   */
/* the construct's chest, and what grows there. Map: 04i_wforest.js    */
/* ------------------------------------------------------------------ */
PILLARS.wfmouth = { map: "wforest", name: "West Forest mouth", at: [16, 8, "up"] };
PILLARS.wfruins = { map: "wforest", name: "Weaver ruins", at: [64, 29, "up"] };
/* the husks lie where they stopped, and never wake */
for (const h of MAP_DEFS.wforest.husks || []) MAP_DEFS.wforest.wild.push({ x: h.x, y: h.y, group: [h.y % 2 ? "huskI" : "huskS"], statue: true, face: h.y % 2 ? "right" : "left" });
delete MAP_DEFS.plainsSW.looks.barricade;

MAP_DEFS.wforest.looks = {
  ruin: ["Fallen masonry, cut with a care nobody spends on stone any more. Thread-patterns are carved along every edge, worn almost smooth.", "Under the moss, a mason's mark: a ring bound by a single thread. The Covenant's sigil, older than the Covenant."],
  tablet: ["A Weaver tablet, cracked across. The script is old Tongue, but some of it you can read: 'Here the word was kept, and here it was given a body, and the body was set to guard what the word had made.'",
    "Lower down, newer letters scratched over the old: 'Property of the Archon Covenant. Do not wake.' Someone has scratched a second line under that: 'Too late.'"],
};
Object.assign(CHEST_LOOT, {
  c_wf_leanto: [20, { poultice: 2 }], c_wf_spider: [30, { silk: 4 }], c_wf_tower: [0, { ring: 1, bonecharm: 1, cutgem: 1 }],
  c_wf_ruin1: [25, { gravecoin: 2 }], c_wf_ruin2: [25, { bonecharm: 1 }], c_construct: [60, { weaverplate: 1 }],
});
CHEST_RECIPE.c_construct = "antidote";

/* the scholar who studies the ruins by day, and keeps well clear of them by night */
NPC_DEFS.ilse = { id: "ilse", act2: true, name: "Ilse Varrow", title: "Scholar", look: { sex: "f", skin: 0, hair: 2, hairStyle: "bun", cloth: 5, outfit: "coat", mood: "neutral" },
  schedule: [{ h: 0, map: null }, { h: 6, map: "wforest", x: 69, y: 29, w: 1, where: "her camp at the Weaver ruins" }, { h: 19, map: null }] };
SHOPS.ilse = { name: "Ilse's satchel", keeper: "Ilse", stock: ["yarrow", "redcap", "antidote", "bandage"], bonus: ["dark", "curio"], only: ["dark", "curio", "herb"], mult: 1.1, buy: 1, purse: 90 };
SCRIPTS.ilse = (c) => {
  const first = !c.flag("met_ilse");
  const steps = first ? [
    { who: "ilse", t: "Oh. Visitors. Don't step on the tablet, it's cracked enough. Ilse Varrow. I study the ruins. Nobody pays me to, which keeps it honest." },
    { who: "ilse", t: "These were Weaver halls, before there was a Covenant to own them. Then the Covenant came, and carved its ring over the old marks, and left something behind to keep the place." },
    { who: "ilse", t: "The rusted figure in the south clearing. It's a construct. Covenant-made, or Covenant-claimed; the plates are stamped with their sigil. It hasn't moved in the month I've been here." },
    { who: "ilse", t: "There's a chest behind it. Locked. I haven't touched it, and I'd think hard before you do. If I were a Weaver building a guard, I'd tie it to the thing it guards." },
    { do: (c) => c.set("met_ilse") },
  ] : [{ who: "ilse", t: c.flag("construct_beaten") ? c.rot("ilse_after", ["You woke it, and you're still standing. I'll write that down, if you don't mind. In very small letters, so the Covenant doesn't read it.", "The plates under its arm were stamped twice: the Covenant's ring over an older mark. They didn't build it. They found it, and put their name on it."]) :
    c.rot("ilse", ["The tablet speaks of a word given a body. I think the Weavers could make things that weren't alive, and make them obey.", "The skeletons walk at night. I don't. I sleep at the forest mouth, by the Pillar, with my back to a tree.", "Moon-caps grow in the ruin garden after dark. Sister Agna in Ashford is always after them."]) }];
  return [...steps, { choice: [["Trade", [{ shop: "ilse" }]], ["Goodbye.", [{ who: "ilse", t: "Mind the tablet." }]]] }];
};

/* what you can pick: red-cap and yarrow by day, moon-caps that only open after dark */
const LOOK_HERB_BASE = SCRIPTS.look_herbpatch;
SCRIPTS.look_herbpatch = (c, id) => {
  const s = String(id || "");
  if (!s.startsWith("rc_") && !s.startsWith("mc_")) return LOOK_HERB_BASE(c, id);
  const k = "herb_" + id;
  if (c.G.picked && c.G.picked[k]) return [{ who: "narrator", t: "Picked clean. It will come back when it pleases." }];
  if (s.startsWith("mc_") && !isNightT(c.G.time)) return [{ who: "narrator", t: "Pale caps, folded shut and grey in the daylight. Moon-caps only open after dark." }];
  const item = s.startsWith("rc_") ? "redcap" : "mooncap";
  return [{ do: (c) => { pickMark(c.G, k); c.give(item, 1); } },
    { who: "narrator", t: item === "redcap" ? "A cluster of red-cap, speckled and twitching. You ease one free." : "A moon-cap, glowing cold and blue from underneath. You lift it free; it is colder than the air." }];
};

/* the construct's chest: trying it wakes the guard; its key opens it */
const LOOK_CHEST_BASE = SCRIPTS.look_chest;
SCRIPTS.look_chest = (c, id) => {
  if (id !== "c_construct" || c.flag("chest_c_construct")) return LOOK_CHEST_BASE(c, id);
  if (!c.flag("construct_beaten")) return [
    { who: "narrator", t: "The chest is iron-bound and locked, the lock shaped like the Covenant's ring. You set a hand on the lid." },
    { who: "narrator", t: "Behind you, metal groans. Rust sheets off the figure in the clearing as it straightens, and a light comes up behind the slits of its face." },
    { who: "tessa", t: "Ilse was right. Of course she was right. Back! Back!" },
    { fight: { foes: ["construct"], win: "construct_beaten" } },
  ];
  if (!c.has("constructkey")) return [{ who: "narrator", t: "Locked. The keyhole is shaped like a ring bound by a thread. The construct must have carried the key." }];
  return [{ who: "narrator", t: "The square iron key turns, stiffly, and something inside the lid clicks free." }, { do: (c) => c.take("constructkey", 1) }, ...LOOK_CHEST_BASE(c, id)];
};
