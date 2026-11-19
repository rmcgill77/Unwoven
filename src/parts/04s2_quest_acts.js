/* Which act each quest belongs to, for the Journal: everything defined up to here is Act Two's (Act One's work is
   the apprentice's days, which have no quest entries); quests added later are Act Three's or after. */
const QUEST_ACT = {};
ASH_QUESTS.forEach((q) => { QUEST_ACT[q[0]] = 2; });
QUEST_ACT.q_south = 2;
const questAct = (k) => QUEST_ACT[k] || 3;
