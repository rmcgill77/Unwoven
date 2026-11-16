/* Ashford, the parts that need the battle and gear code loaded first */
/* ---------- the approved Ashford art: Voidsong, Hakon and the Covenant's soldiers ---------- */
Object.assign(CHIBI_MAP, { voidsong: "a2_voidsong", hakon: "a2_hakon", ashgate: "a2_covknight", ashpatrol: "a2_covxbow", bridgeguard: "a2_covknight", marchguard: "a2_covxbow" });
/* Hakon Redfell: a tank. Slow, heavy, hard to put down; barely a word of the Old Tongue in him */
BTL_PARTY.hakon = { name: "Hakon", role: "Sellsword", base: { hp: 66, mp: 5, atk: 11, mag: 1, def: 8, spd: 7 }, grow: { hp: 10, mp: 0.3, atk: 1.5, mag: 0.2, def: 1.3, spd: 0.25 } };
ITEMS.valecleaver = { name: "Vale cleaver", who: "hakon", gear: { slot: "weapon", atk: 6 }, desc: "Hakon's own blade: a broad, notched cleaver from the Vale, honed on every whetstone between there and here." };
const HAKON_READY = true;
NPC_DEFS.hakon.flagSched = [{ when: (f) => !!f.hakon_joined, e: { h: 0, map: null } }];
function hakonJoin(G) {
  btlEnsureParty(G);
  if (!G.partyIds.includes("hakon")) { G.partyIds.push("hakon"); G.party.hakon = btlFreshMember("hakon", G.party.wren.lv); }
  if (!(G.items.valecleaver > 0) && !(G.equip && G.equip.hakon && G.equip.hakon.weapon)) { giveItem(G, "valecleaver", 1); gearEquip(G, "valecleaver", "hakon"); }
  const st = btlStatsFor(G, "hakon", G.party.hakon.lv); G.party.hakon.hp = st.hp; G.party.hakon.mp = st.mp;
}
Object.assign(GEAR_ICON_ALIAS, { valecleaver: "hakoncleaver", harecharm: "fangcharm" });

/* the west forest's husks: scenery only, drawn from the robot pack; nobody fights them */
for (const k of ["huskI", "huskS"]) BTL_FOES[k] = { name: "Weaver husk", lv: 1, art: k, hp: 1, atk: 0, def: 0, spd: 1, xp: 0, coins: [0, 0], drops: [], note: "rusted still" };

/* the Tellers' Primer's words: Ver sees through a thing, Cogn throws a thought at it */
Object.assign(OT_EFFECT, {
  Ver: { k: "mark", el: "mind", pw: 1.1, acc: "at id am", d: "Tells true from false: names what a thing fears, and sees through its guard." },
  Cogn: { k: "dmg", el: "mind", pw: 0.95, acc: "is or at el am", d: "A thought, thrown like a stone. Guards do not stop it." },
});
for (const r of ["Ver", "Cogn"]) if (!OT_WORKING.includes(r)) OT_WORKING.push(r);
