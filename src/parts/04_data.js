
/* ------------------------------------------------------------------ */
/* Trades                                                              */
/* ------------------------------------------------------------------ */
/* Whatever guild took the orphan in, the player is always a Quill-mark (the Clerk's surname). The trades keep their own surnames for the NPCs who carry them. */
const PLAYER_SURNAME = "Quill-mark";
const TRADES = {
  smith: {
    name: "Blacksmith", surname: "Iron-hand", work: "Forging and repair", bonus: "Better gear crafting",
    game: "forge", stationName: "the forge", jobName: "Forge a set of horseshoes",
    productName: "a set of horseshoes", itemName: "Horseshoes", recipient: "tomas",
    shopName: "{mentor}'s Smithy", shopSign: "{mentor}'s Smithy. Horseshoes, hinges and honest iron.",
    order: "The watch wants a set of horseshoes by noon, and the forge is already hot.",
    mentorLook: { skin: 1, hair: 4, hairStyle: "bald", beard: true, cloth: 3, apron: "#5a3a24", age: true, mood: "stern" }, gender: "m",
  },
  clerk: {
    name: "Clerk", surname: "Quill-mark", work: "Copying and sorting texts", bonus: "Learns Old Tongue words faster",
    game: "copy", stationName: "the copy desk", jobName: "Copy a page of the tithe ledger",
    productName: "the copied tithe ledger", itemName: "Tithe ledger", recipient: "mayor",
    shopName: "{mentor}'s Copy House", shopSign: "{mentor}'s Copy House. Letters, ledgers and contracts. No unlicensed texts.",
    order: "The mayor wants a fair copy of the tithe ledger, and wants it without blots.",
    mentorLook: { skin: 0, hair: 5, hairStyle: "bun", cloth: 4, outfit: "dress", age: true, mood: "stern" }, gender: "f",
  },
  carp: {
    name: "Carpenter", surname: "Timber-mark", work: "Building and repair", bonus: "Cheaper crafting, trap-making",
    game: "saw", stationName: "the workbench", jobName: "Cut a set of chair legs",
    productName: "four new chair legs", itemName: "Chair legs", recipient: "bram",
    shopName: "{mentor}'s Workshop", shopSign: "{mentor}'s Workshop. Joinery, carts and repairs.",
    order: "Bram broke another chair at the Hollow Oak. Somebody sat on it who shouldn't have. He wants new legs.",
    mentorLook: { skin: 2, hair: 1, hairStyle: "short", beard: true, cloth: 1, apron: "#9a6a3c", mood: "stern" }, gender: "m",
  },
  tanner: {
    name: "Tanner", surname: "Hide-bound", work: "Curing hides", bonus: "Armor crafting, resist bonuses",
    game: "scrape", stationName: "the hide racks", jobName: "Scrape and cure a hide",
    productName: "a cured hide", itemName: "Cured hide", recipient: "wenna",
    shopName: "{mentor}'s Tannery", shopSign: "{mentor}'s Tannery. Leather, hides and straps. Mind the smell.",
    order: "There's a hide on the rack that's been soaking since Fourthday. Scrape it before it turns.",
    mentorLook: { skin: 3, hair: 0, hairStyle: "bun", cloth: 3, apron: "#563220", age: true, mood: "stern" }, gender: "f",
  },
  farm: {
    name: "Farmhand", surname: "Crop-foot", work: "Harvesting and herb work", bonus: "Gathering and potion bonuses",
    game: "harvest", stationName: "the turnip field across the stream", jobName: "Harvest the turnip rows",
    productName: "a basket of turnips", itemName: "Basket of turnips", recipient: "bram", fieldStation: true,
    shopName: "{mentor}'s Farmhouse", shopSign: "{mentor}'s Farmhouse. Turnips, barley and the odd goose.",
    order: "The turnips in the west field won't pick themselves, and Bram wants a basket for his stew.",
    mentorLook: { skin: 1, hair: 4, hood: true, cloth: 6, outfit: "dress", age: true, mood: "stern" }, gender: "f",
  },
  mason: {
    name: "Stonemason", surname: "Stone-set", work: "Masonry and quarry work", bonus: "Sturdier wards and constructs",
    game: "stack", stationName: "the stone block", jobName: "Set a course of wall stones",
    productName: "a carved boundary marker", itemName: "Boundary marker", recipient: "mayor",
    shopName: "{mentor}'s Stoneyard", shopSign: "{mentor}'s Stoneyard. Walls, wells and gravestones.",
    order: "The mayor wants a new boundary marker. Set me a course first, so I can see your hands haven't gone soft.",
    mentorLook: { skin: 2, hair: 4, hairStyle: "short", beard: true, cloth: 5, age: true, mood: "stern" }, gender: "m",
  },
};
const TRADE_ORDER = ["smith", "clerk", "carp", "tanner", "farm", "mason"];

/* The player is always the Clerk's apprentice, and the Clerk is always Odile. */
const MENTOR_NAME = "Odile";
const MENTOR_NAMES = {
  m: ["Garrick", "Oswin", "Brannoc", "Edric", "Hadley", "Corwin", "Aldric"],
  f: ["Marta", "Ysolde", "Hesper", "Brenna", "Odile", "Gwenna"],
};
const MAYORS = [
  { n: "Penhallow", g: "m" }, { n: "Ashby", g: "m" }, { n: "Moss", g: "m" }, { n: "Thistlewood", g: "f" },
];
const PLAYER_NAMES = ["Aren", "Wren", "Tobin", "Mira", "Cael", "Isla", "Rowan", "Elsa", "Fenn", "Lark", "Bryn", "Nell"];

const ITEMS = {
  bread: { name: "Rye bread", price: 4, desc: "A dense loaf, still warm at the crust." },
  candle: { name: "Tallow candle", price: 3, desc: "Smoky, but it burns through most of a night." },
  tonic: { name: "Herbal tonic", price: 12, desc: "Bitter and green. Said to mend most aches." },
  rope: { name: "Coil of rope", price: 6, desc: "Thirty feet of good hemp." },
  ink: { name: "Ink and quill", price: 8, desc: "Wenna swears the ink comes from Durte. Nobody asks how." },
  delivery: { name: "Delivery", quest: true, desc: "Work from the shop, to be delivered." },
  parcel: { name: "Joss's parcel", quest: true, desc: "Brown paper, string, and a faint smell of tea. For Wenna Pike." },
  poultice: { name: "Poultice", price: 6, desc: "Moss, clay and a clean rag. Heals 24 in a fight." },
  oil: { name: "Flask of lamp oil", quest: true, desc: "A stoppered flask of lamp oil. It smells of tallow and old grudges." },
  tome: { name: "Oilcloth bundle", quest: true, desc: "A battered book wrapped in oilcloth. Strange letters crawl across the cover. Reading it could hang you." },
  letter: { name: "Sealed letter", quest: true, desc: "Heavy paper, a guild wax seal, and no name on the front. For Old Maud." },
  mooncap: { name: "Moon-cap", quest: true, desc: "A pale cave mushroom. The underside of its cap glows a cold blue, and it is colder than the air." },
  pelt: { name: "Wolf pelt", sell: 4, desc: "Rank and matted. Wenna knows a tanner who doesn't ask questions." },
  fang: { name: "Wolf fang", sell: 2, desc: "Yellow and cracked. Folk in Ashford wear them for luck." },
  gel: { name: "Slime gel", sell: 1, desc: "Cold and faintly sour. Tanners use it to soften hides, so Wenna will take it." },
  redcap: { name: "Red-cap", sell: 2, desc: "A speckled mushroom cap that still twitches. Maud dries them for a poultice base." },
  mroot: { name: "Mandrake root", sell: 3, desc: "Knotted and pale, with something almost like a face. It stopped screaming a while ago." },
  silk: { name: "Spider silk", sell: 3, desc: "Strong, grey and sticky. Folk in Ashford would pay for a hank." },
  yarrow: { name: "Yarrow bundle", sell: 2, desc: "Pale flowers and bitter leaves. Maud swears by it; Wenna sells it." },
  token: { name: "Quarry token", sell: 6, desc: "A stamped brass token from when the southern quarry paid in scrip. Collectors still buy them." },
  charm: { name: "Rowan charm", quest: true, desc: "Rowan twigs tied with red thread. It smells of smoke and cold water, and it hums very faintly when you hold it." },
  oldsword: { name: "Old sword", gear: { slot: "weapon", atk: 3 }, desc: "Nicked and dull, but it keeps an edge. Your mentor oils it every winter and swears she never uses it." },
  thornwake: { name: "Thornwake", gear: { slot: "weapon", atk: 7 }, desc: "A green-black blade that grew rather than was forged. Moss creeps along the fuller, and it is always faintly damp." },
  jerkin: { name: "Quilted jerkin", gear: { slot: "body", def: 2 }, desc: "Layers of wool and waxed canvas, sewn tight. It smells of Pike's stockroom." },
  ironcap: { name: "Iron-rimmed cap", gear: { slot: "head", def: 1 }, desc: "A leather cap with an iron rim. Dented, so somebody's head once needed it." },
  medal: { name: "Covenant medal", gear: { slot: "charm", mag: 2 }, desc: "A tarnished brass medal from the chapel's offerings. Folk say it steadies the mind." },
  pebble: { name: "Lenna's lucky stone", desc: "Smooth, grey, and warm from a small hand. Lenna swears it is lucky. It has not been lucky for her." },
};
const SHOP_STOCK = ["bread", "candle", "tonic", "rope", "ink", "poultice"];

/* ------------------------------------------------------------------ */
/* Map format                                                          */
/* rows: one character per 16px tile. Legend:                          */
/*  outside  . grass  , tuft  * flowers  = path  ~ water  B bridge     */
/*           c crops  f fence  T tree  R roof  W wall  w window        */
/*           D door  S sign  P pillar  b bush  r rock  # stone wall    */
/*           Z barricade                                               */
/*  inside   X dark wall  U upper wall  Y upper wall with window       */
/*           L lower wall  o plank floor  s stone floor  u rug         */
/*           K counter  m door mat (exit)                              */
/* props: furniture placed on tiles { p, x, y, v?, id?, station? }    */
/* warps: walk onto (x,y) to arrive at map `to`, tile (tx,ty)          */
/* ------------------------------------------------------------------ */
const SOLID_TILES = new Set(["T", "~", "R", "W", "w", "f", "S", "P", "b", "r", "#", "Z", "X", "U", "Y", "L", "K", "C"]);

const MAP_DEFS = {
  oak: {
    name: "Oakhaven", outside: true,
    rows: [
      "TTTTTTTT~~TTTTTTTTTTTTT==TTTTTTTTTTTTTTTTTTTTTTT",
      "TTTTTTTT~~TTTTTTTTTTTTTZZTTTTTTTTTTTTTTTTTTTTTTT",
      "TTTTTTTT~~......TTTTT*.==.TTTTT..,.....,..TTTTTT",
      "TTTTTTTT~~......TTTTT*.==.TTTTT.......*...TTTTTT",
      "TTffffff~~......TTTTT..==,TTTTT.*.*,......TTTTTT",
      "TTfccccf~~*,*.,...,.,..==,........,,,.....TTTTTT",
      "TTfccccf~~.............==S....................TT",
      "TTfccccf~~,.,*....,,...==..r,........,r.,.,,,.TT",
      "TTfccccf~~..*,.......*.==..*.......,...,......TT",
      "TTfccccf~~..RRRRRR.....==....RRRRR..,.~~~...,.TT",
      "TTfccccf~~..RRRRRRb.,.,==....RRRRR..~~~~~~~...TT",
      "TTfccccf~~..RRRRRR.b...==..b.RRRRR.~~~~~~~~~..TT",
      "TTfccccf~~.,WwDWwW,....==...*WwDwW.~~~~~~~~~r.TT",
      "TTfccccf~~..**=S*......==.....*=S.r~~~~~~~~~..TT",
      "TTff..ff~~.,..=........==....,.=....~~~~~~~...TT",
      "TT..==..~~....=.,.,==========..=.,..,.~~~,....TT",
      "TT,.==..~~.b*.=....==========*,=..,...,....,..TT",
      "TT.,==..~~..S.=...,====PP====..=......r.....S.TT",
      "=Z======BB====================================Z=",
      "=Z======BB====================================Z=",
      "TT.....,~~..,......==========.................TT",
      "TT.....*~~.,...,.,.==========..,....*.........TT",
      "TT......~~.,.......==========......,*.........TT",
      "TT......~~..RRRRR......==,..*..RRRRRRR........TT",
      "TT...,r.~~..RRRRR,..*,.==......RRRRRRR.......*TT",
      "TT...,..~~,.RRRRR...b..==..b...RRRRRRR........TT",
      "TT,,....~~..WwDwW...,..==......WwWDWwWb.,.....TT",
      "TT.,,...~~.*,.=S.,,....==,.......S=...........TT",
      "TT.,.,..~~.==============================.....TT",
      "TT.,....~~....,.,......==...,....,............TT",
      "TT......~~.....,,,.....==....b.*....,.........TT",
      "TT....,.~~,......b..,b.==.............,.......TT",
      "TT....*.~~.,,.,........==..,...,...,..........TT",
      "TT......~~.......,.....==,..,*.......,........TT",
      "TT......~~.....,...,..*==...RRRRRRRRR.........TT",
      "TTRRRRR.~~.RRRRR.RRRRR.==,..RRRRRRRRR.RRRRRRR,TT",
      "TTRRRRR,~~.RRRRR.RRRRR.==.b.RRRRRRRRR.RRRRRRR.TT",
      "TTRRRRR.~~.RRRRR.RRRRR.==...RRRRRRRRR.RRRRRRR.TT",
      "TTWwDwW.~~*WwDwW.WwDwW,==...WwWwDwWwW.WwWDWwW,TT",
      "TT.,=S..~~*..=S,,..=S..==,...,.,=S.......=S...TT",
      "TT======BB===================================*TT",
      "TT======BB===================================,TT",
      "TTfff.ff~~.............==.......,.,..,...*.,..TT",
      "TTfccccf~~.,,........b*==*....b...............TT",
      "TTfccccf~~.,,..,...,,,.==......,....b.........TT",
      "TTfccccf~~..RRRRRRR....==.b.RRRRRRR,..RRRRRRR.TT",
      "TTfccccf~~.,RRRRRRR..,.==.,.RRRRRRR...RRRRRRR.TT",
      "TTfccccf~~..RRRRRRR....==...RRRRRRR.,*RRRRRRR.TT",
      "TTfccccf~~..WwWDWwW...*==...WwWDWwW,*.WwWDWwW.TT",
      "TTffffff~~.....=S......==.,...*=S......,.=S...TT",
      "TT....*.~~===================================.TT",
      "TT*.*..,~~===================================*TT",
      "TT....,.~~,...b........==.,*..#####.S####.,...TT",
      "TT.....,~~.*T.TT*.T,TT.==.*TT.#.r.r.r.r.#.TT.TTT",
      "TT......~~..T.TT.....T.==.TTT.#r.r..r.r.#..TT.TT",
      "TT.....,~~,T..TT.T,TTT.==.T,T.###########.T.TTTT",
      "TT......~~.TT....T.T...==.T.T.,..*..,..,..T*,TTT",
      "TT.,....~~,..TTTT....,.==...T..,..,...*...TT.TTT",
      "TTTTTTTT~~TTTTTTTTTTTTTZZTTTTbbbbbbbbbbbbbTTTTTT",
      "TTTTTTTT~~TTTTTTTTTTTTT==TTTTTTTTTTTTTTTTTTTTTTT",
    ],
    props: [
      { p: "goat", x: 37, y: 29 }, { p: "bloom", x: 11, y: 15, id: "b1" }, { p: "bloom", x: 11, y: 22, id: "b2" }, { p: "bloom", x: 12, y: 6, id: "b3" },
      { p: "lamp", x: 18, y: 15 }, { p: "lamp", x: 29, y: 15 }, { p: "lamp", x: 18, y: 22 }, { p: "lamp", x: 29, y: 22 },
      { p: "lamp", x: 30, y: 27 }, { p: "lamp", x: 17, y: 13 }, { p: "board", x: 20, y: 14 }, { p: "well", x: 26, y: 21 },
      { p: "lamp", x: 22, y: 33 }, { p: "lamp", x: 25, y: 39 }, { p: "lamp", x: 22, y: 43 }, { p: "lamp", x: 25, y: 49 },
      { p: "lamp", x: 14, y: 42 }, { p: "lamp", x: 36, y: 42 }, { p: "well", x: 26, y: 44 },
      { p: "bench", x: 20, y: 42 }, { p: "barrel", x: 17, y: 49 }, { p: "crate", x: 19, y: 49 }, { p: "sack", x: 11, y: 49 },
      { p: "barrel", x: 37, y: 39 }, { p: "baskets", x: 39, y: 42 },
    ],
    warps: [
      { x: 14, y: 12, to: "shop", tx: 6, ty: 9, dir: "up" },
      { x: 31, y: 12, to: "store", tx: 6, ty: 7, dir: "up" },
      { x: 14, y: 26, to: "hall", tx: 6, ty: 7, dir: "up" },
      { x: 34, y: 26, to: "tavern", tx: 9, ty: 10, dir: "up" },
      { x: 13, y: 38, to: "cottage_g", tx: 4, ty: 6, dir: "up" },
      { x: 32, y: 38, to: "chapel", tx: 5, ty: 8, dir: "up" },
      { x: 41, y: 38, to: "cottage_h", tx: 4, ty: 6, dir: "up" },
      { x: 4, y: 38, to: "cottage_e", tx: 4, ty: 6, dir: "up" },
      { x: 23, y: 0, to: "wood", tx: 10, ty: 58, dir: "up" }, { x: 24, y: 0, to: "wood", tx: 11, ty: 58, dir: "up" },
      { x: 23, y: 59, to: "rocks", tx: 49, ty: 1, dir: "down" }, { x: 24, y: 59, to: "rocks", tx: 50, ty: 1, dir: "down" },
    ],
    doorKinds: {
      "13,38": "cottage", "19,38": "cooper", "32,38": "chapel", "41,38": "dyehouse", "4,38": "cottage",
      "15,48": "carter", "31,48": "watch", "41,48": "stable",
    },
    signs: {
      "15,13": ["{shop_sign}"],
      "12,17": ["Welcome to Oakhaven.", "Under the protection of the Archon Covenant."],
      "32,13": ["Pike's Provisions. Bread, candles, rope, and everything in between."],
      "15,27": ["The Mayor's House. Petitions heard on market days."],
      "33,27": ["The Hollow Oak. Ale, stew and a warm hearth."],
      "25,6": ["North road: the North Woods, and Old Maud's cottage.", "Closed by order of the watch. Show a guild seal to pass."],
      "44,17": ["East road: Ashford and the outer provinces."],
      "14,39": ["Old Garrick. Retired from the watch. Knock first, or he will assume the worst."],
      "20,39": ["Tarn & Son, Coopers. Casks, barrels and buckets. Locked: the cooper is away at Ashford."],
      "33,39": ["The Chapel of the Covenant. Open to all who keep the peace."],
      "42,39": ["Vane's Dye House. Mind the blue; it does not wash off."],
      "5,39": ["Crop-foot farm. Please stay out of the turnips."],
      "16,49": ["Carter's yard. Joss Carter, hauling to any road."],
      "32,49": ["The Watch House. Locked. Tomas has the key and the keys have opinions."],
      "42,49": ["Oakhaven stables. The horses went to the lord's wagons. The smell stayed."],
      "36,52": ["Rest in the quiet. The Covenant keeps the names of those below."],
    },
    pillar: { x: 24 * TILE, y: 17 * TILE + 8, r: 11 },
    graveyard: { x0: 31, y0: 53, x1: 39, y1: 54 },
    // no wolves inside the town: they keep to the woods, the rocks and the caves
  },
  shop: {
    name: "{shop_name}", outside: false,
    rows: [
      "XUUYUUUUUUUYUX",
      "XLLLLLLLLLLLLX",
      "XssssooooooooX",
      "XssssoooouuuoX",
      "XssssooouuuuoX",
      "XoooooooouuuoX",
      "XooooooooooooX",
      "XooooooooooooX",
      "XooooooooooooX",
      "XooooooooooooX",
      "XXXXXXmXXXXXXX",
    ],
    props: [
      { p: "tools", x: 4, y: 0 }, { p: "shelfw", x: 6, y: 0 }, { p: "painting", x: 10, y: 0 }, { p: "chest", x: 1, y: 7 }, { p: "jugs", x: 6, y: 2 }, { p: "straw", x: 6, y: 8 }, { p: "candles", x: 11, y: 9 },
      { p: "fireplace", x: 8, y: 0 }, { p: "mirror", x: 7, y: 1 },
      { p: "table", x: 9, y: 4, v: 2 }, { p: "chair", x: 8, y: 4 }, { p: "chair", x: 11, y: 4 },
      { p: "bed", x: 12, y: 2, v: 2, id: "mentor" }, { p: "dresser", x: 10, y: 2 },
      { p: "bed", x: 12, y: 7, v: 0, id: "player" }, { p: "barrel", x: 12, y: 9 },
      { p: "shelf", x: 3, y: 2, v: 1 }, { p: "plant", x: 1, y: 9 },
    ],
    stations: {
      smith: [{ p: "forge", x: 2, y: 2, station: true }, { p: "anvil", x: 3, y: 4, station: true }, { p: "barrel", x: 1, y: 4 }, { p: "crate", x: 5, y: 2 }],
      clerk: [{ p: "desk", x: 2, y: 3, station: true }, { p: "stool", x: 2, y: 4 }, { p: "shelf", x: 1, y: 2, v: 0 }, { p: "shelf", x: 4, y: 2, v: 0 }, { p: "shelf", x: 5, y: 2, v: 0 }],
      carp: [{ p: "bench", x: 2, y: 3, station: true }, { p: "crate", x: 1, y: 5 }, { p: "crate", x: 5, y: 2 }, { p: "barrel", x: 1, y: 2 }],
      tanner: [{ p: "rack", x: 2, y: 2, station: true }, { p: "rack", x: 3, y: 2, station: true }, { p: "rack", x: 4, y: 2, station: true }, { p: "barrel", x: 1, y: 4 }, { p: "sack", x: 5, y: 2 }],
      farm: [{ p: "baskets", x: 2, y: 3 }, { p: "sack", x: 1, y: 2 }, { p: "sack", x: 4, y: 2 }, { p: "crate", x: 5, y: 2 }],
      mason: [{ p: "block", x: 2, y: 3, station: true }, { p: "crate", x: 1, y: 2 }, { p: "sack", x: 5, y: 2 }, { p: "barrel", x: 1, y: 6 }],
    },
    warps: [{ x: 6, y: 10, to: "oak", tx: 14, ty: 13, dir: "down" }],
    spawnBed: { tx: 11, ty: 8, dir: "down" },
  },
  store: {
    name: "Pike's Provisions", outside: false,
    rows: [
      "XUUYUUUUYUUX",
      "XLLLLLLLLLLX",
      "XooooooooooX",
      "XooooooooooX",
      "XKKKKKKKKoKX",
      "XooooooooooX",
      "XooooooooooX",
      "XooooooooooX",
      "XXXXXXmXXXXX",
    ],
    props: [
      { p: "herbs", x: 4, y: 0 }, { p: "shelfw", x: 6, y: 0 }, { p: "jugs", x: 1, y: 3 }, { p: "straw", x: 5, y: 6 },
      { p: "shelf", x: 1, y: 2, v: 2 }, { p: "shelf", x: 2, y: 2, v: 2 }, { p: "shelf", x: 3, y: 2, v: 1 },
      { p: "shelf", x: 7, y: 2, v: 2 }, { p: "shelf", x: 8, y: 2, v: 0 }, { p: "barrel", x: 9, y: 2 }, { p: "barrel", x: 10, y: 2 },
      { p: "sack", x: 10, y: 3 }, { p: "sack", x: 1, y: 6 }, { p: "crate", x: 1, y: 7 }, { p: "crate", x: 10, y: 7 }, { p: "barrel", x: 10, y: 6 },
      { p: "lantern", x: 5, y: 0 }, { p: "lantern", x: 10, y: 0 },
    ],
    warps: [{ x: 6, y: 8, to: "oak", tx: 31, ty: 13, dir: "down" }],
  },
  hall: {
    name: "The Mayor's House", outside: false,
    rows: [
      "XUUYUUUUYUUX",
      "XLLLLLLLLLLX",
      "XooooooooooX",
      "XoouuuuuuooX",
      "XoouuuuuuooX",
      "XoouuuuuuooX",
      "XooooooooooX",
      "XooooooooooX",
      "XXXXXXmXXXXX",
    ],
    props: [
      { p: "painting", x: 4, y: 0 }, { p: "painting", x: 5, y: 0, v: 1 }, { p: "chest", x: 10, y: 6 }, { p: "books", x: 1, y: 3 }, { p: "candles", x: 2, y: 6 },
      { p: "desk", x: 5, y: 3 }, { p: "shelf", x: 1, y: 2, v: 0 }, { p: "shelf", x: 2, y: 2, v: 0 },
      { p: "shelf", x: 9, y: 2, v: 0 }, { p: "shelf", x: 10, y: 2, v: 1 }, { p: "plant", x: 1, y: 7 }, { p: "plant", x: 10, y: 7 },
      { p: "chair", x: 3, y: 6 }, { p: "dresser", x: 7, y: 2 },
      { p: "lantern", x: 1, y: 0 }, { p: "lantern", x: 6, y: 0 }, { p: "lantern", x: 10, y: 0 },
    ],
    warps: [{ x: 6, y: 8, to: "oak", tx: 14, ty: 27, dir: "down" }],
  },
  tavern: {
    name: "The Hollow Oak", outside: false,
    rows: [
      "XUUUUYUUUUUUUUYUUX",
      "XLLLLLLLLLLLLLLLLX",
      "XooooooooooouuuooX",
      "XooooooooooouuuooX",
      "XKKKKKKooooooooooX",
      "XooooooooooooooooX",
      "XooooooooooooooooX",
      "XooooooooooooooooX",
      "XooooooooooooooooX",
      "XooooooooooooooooX",
      "XooooooooooooooooX",
      "XXXXXXXXXmXXXXXXXX",
    ],
    props: [
      { p: "herbs", x: 14, y: 0 }, { p: "shelfw", x: 7, y: 0 }, { p: "painting", x: 10, y: 0, v: 1 }, { p: "herbs", x: 16, y: 0, v: 1 }, { p: "jugs", x: 6, y: 2 }, { p: "firewood", x: 11, y: 2 }, { p: "chest", x: 16, y: 9 }, { p: "straw", x: 10, y: 7 }, { p: "straw", x: 3, y: 9 },
      { p: "fireplace", x: 12, y: 0 },
      { p: "barrel", x: 1, y: 2 }, { p: "barrel", x: 2, y: 2 }, { p: "shelf", x: 4, y: 2, v: 1 }, { p: "shelf", x: 5, y: 2, v: 1 },
      { p: "table", x: 6, y: 6, v: 1 }, { p: "chair", x: 5, y: 6 }, { p: "chair", x: 8, y: 6 },
      { p: "table", x: 13, y: 6, v: 1 }, { p: "chair", x: 12, y: 6 }, { p: "chair", x: 15, y: 6 },
      { p: "table", x: 6, y: 9, v: 2 }, { p: "chair", x: 5, y: 9 }, { p: "chair", x: 8, y: 9 },
      { p: "table", x: 13, y: 9, v: 1 }, { p: "chair", x: 12, y: 9 }, { p: "chair", x: 15, y: 9 },
      { p: "stool", x: 16, y: 3 }, { p: "barrel", x: 16, y: 10 }, { p: "plant", x: 1, y: 10 },
      { p: "lantern", x: 3, y: 0 }, { p: "lantern", x: 8, y: 0 },
    ],
    warps: [{ x: 9, y: 11, to: "oak", tx: 34, ty: 27, dir: "down" }],
  },
  chapel: {
    name: "The Chapel", outside: false,
    rows: [
      "XUUYUUUUYUUX",
      "XLLLLLLLLLLX",
      "XooooooooooX",
      "XoooouuooooX",
      "XoooouuooooX",
      "XoooouuooooX",
      "XoooouuooooX",
      "XoooouuooooX",
      "XoooouuooooX",
      "XXXXXmXXXXXX",
    ],
    props: [
      { p: "painting", x: 4, y: 0, v: 1 }, { p: "painting", x: 7, y: 0 }, { p: "candles", x: 4, y: 2 }, { p: "candles", x: 7, y: 2 }, { p: "candles", x: 10, y: 4 }, { p: "chest", x: 10, y: 8, lk: "offering" }, { p: "books", x: 1, y: 5 },
      { p: "desk", x: 5, y: 2, lk: "altar" },
      { p: "bench", x: 2, y: 4, lk: "pew" }, { p: "bench", x: 8, y: 4, lk: "pew" },
      { p: "bench", x: 2, y: 6, lk: "pew" }, { p: "bench", x: 8, y: 6, lk: "pew" },
      { p: "plant", x: 1, y: 2 }, { p: "plant", x: 10, y: 2 }, { p: "barrel", x: 1, y: 8, lk: "font" },
      { p: "lantern", x: 2, y: 0 }, { p: "lantern", x: 5, y: 0 }, { p: "lantern", x: 9, y: 0 },
    ],
    warps: [{ x: 5, y: 9, to: "oak", tx: 32, ty: 39, dir: "down" }],
  },
  cottage_g: {
    name: "Garrick's Cottage", outside: false,
    rows: ["XUUYUUYUUX","XLLLLLLLLX","XooooooooX","XooouuoooX","XooouuoooX","XooooooooX","XooooooooX","XXXXmXXXXX"],
    props: [
      { p: "herbs", x: 1, y: 0 }, { p: "painting", x: 4, y: 0 }, { p: "firewood", x: 6, y: 2 }, { p: "books", x: 8, y: 5 }, { p: "chest", x: 8, y: 3 }, { p: "jugs", x: 1, y: 4 },
      { p: "fireplace", x: 7, y: 0 }, { p: "dresser", x: 1, y: 2 }, { p: "shelf", x: 4, y: 2, v: 0 }, { p: "shelf", x: 5, y: 2, v: 1 },
      { p: "table", x: 4, y: 4, v: 1 }, { p: "chair", x: 3, y: 4 }, { p: "chair", x: 6, y: 4 },
      { p: "barrel", x: 8, y: 6 }, { p: "crate", x: 1, y: 6 }, { p: "plant", x: 1, y: 5 }, { p: "lantern", x: 3, y: 0 },
    ],
    warps: [{ x: 4, y: 7, to: "oak", tx: 13, ty: 39, dir: "down" }],
  },
  cottage_h: {
    name: "Vane's Dye House", outside: false,
    rows: ["XUUYUUYUUX","XLLLLLLLLX","XooooooooX","XooouuoooX","XooouuoooX","XooooooooX","XooooooooX","XXXXmXXXXX"],
    props: [
      { p: "cloths", x: 1, y: 0 }, { p: "cloths", x: 5, y: 0 }, { p: "cloths", x: 7, y: 0 }, { p: "jugs", x: 4, y: 2 }, { p: "straw", x: 2, y: 5 },
      { p: "barrel", x: 1, y: 2, lk: "vat" }, { p: "barrel", x: 2, y: 2, lk: "vat" }, { p: "barrel", x: 3, y: 2, lk: "vat" },
      { p: "baskets", x: 5, y: 2 }, { p: "shelf", x: 8, y: 2, v: 2 }, { p: "table", x: 4, y: 4, v: 2 },
      { p: "bench", x: 6, y: 6 }, { p: "crate", x: 1, y: 6 }, { p: "sack", x: 8, y: 5 }, { p: "lantern", x: 4, y: 0 }, { p: "lantern", x: 8, y: 0 },
    ],
    warps: [{ x: 4, y: 7, to: "oak", tx: 41, ty: 39, dir: "down" }],
  },
  cottage_e: {
    name: "Crop-foot Farm", outside: false,
    rows: ["XUUYUUYUUX","XLLLLLLLLX","XooooooooX","XooouuoooX","XooouuoooX","XooooooooX","XooooooooX","XXXXmXXXXX"],
    props: [
      { p: "herbs", x: 1, y: 0 }, { p: "herbs", x: 4, y: 0, v: 1 }, { p: "firewood", x: 6, y: 2 }, { p: "jugs", x: 8, y: 3 }, { p: "straw", x: 5, y: 6 }, { p: "chest", x: 8, y: 5 },
      { p: "fireplace", x: 7, y: 0 }, { p: "baskets", x: 1, y: 2 }, { p: "sack", x: 4, y: 2 }, { p: "sack", x: 5, y: 2 },
      { p: "table", x: 4, y: 4, v: 1 }, { p: "chair", x: 3, y: 4 }, { p: "chair", x: 6, y: 4 },
      { p: "barrel", x: 8, y: 6 }, { p: "plant", x: 1, y: 6 }, { p: "lantern", x: 3, y: 0 },
    ],
    warps: [{ x: 4, y: 7, to: "oak", tx: 4, ty: 39, dir: "down" }],
  },
  hut: {
    name: "Maud's Hut", outside: false,
    rows: ["XUUYUUYUUX","XLLLLLLLLX","XooooooooX","XooouuoooX","XooouuoooX","XooooooooX","XooooooooX","XXXXmXXXXX"],
    props: [
      { p: "herbs", x: 1, y: 0 }, { p: "herbs", x: 5, y: 0, v: 1 }, { p: "cauldron", x: 6, y: 2 }, { p: "candles", x: 3, y: 5 }, { p: "jugs", x: 8, y: 3 }, { p: "books", x: 8, y: 5 },
      { p: "fireplace", x: 7, y: 0 }, { p: "shelf", x: 1, y: 2, v: 1 }, { p: "shelf", x: 2, y: 2, v: 1 }, { p: "shelf", x: 3, y: 2, v: 0 },
      { p: "table", x: 5, y: 4, v: 2 }, { p: "chair", x: 7, y: 4 }, { p: "chair", x: 5, y: 5 },
      { p: "baskets", x: 1, y: 5, lk: "herbs" }, { p: "barrel", x: 8, y: 6 }, { p: "plant", x: 1, y: 6 }, { p: "plant", x: 8, y: 2 },
      { p: "lantern", x: 4, y: 0 },
    ],
    warps: [{ x: 4, y: 7, to: "wood", tx: 94, ty: 10, dir: "down" }],
  },
};

/* ------------------------------------------------------------------ */
/* NPCs and daily schedules                                            */
/* Each entry applies from hour h. map null = gone home for the day.  */
/* w = wander radius in tiles around the anchor.                       */
/* ------------------------------------------------------------------ */
const NPC_DEFS = {
  mentor: {
    name: "{mentor}", title: "Your mentor",
    schedule: [
      { h: 0, map: "shop", x: 11, y: 3, w: 0, where: "the copy house" },
      { h: 6, map: "shop", x: 5, y: 5, w: 1, where: "the copy house" },
      { h: 12, map: "shop", x: 9, y: 5, w: 0, where: "the copy house" },
      { h: 13, map: "shop", x: 5, y: 5, w: 1, where: "the copy house" },
      { h: 20, map: "shop", x: 10, y: 6, w: 1, where: "the copy house" },
      { h: 22, map: "shop", x: 11, y: 3, w: 0, where: "the copy house" },
    ],
  },
  bram: {
    name: "Bram Hollis", title: "Keeper of the Hollow Oak",
    look: { skin: 1, hair: 1, hairStyle: "short", beard: true, cloth: 2, apron: "#e9d9b4", mood: "smile" },
    schedule: [{ h: 0, map: "tavern", x: 3, y: 3, w: 2, where: "the Hollow Oak" }],
  },
  wenna: {
    name: "Wenna Pike", title: "Shopkeeper",
    look: { skin: 0, hair: 2, hairStyle: "bun", cloth: 1, outfit: "dress", mood: "sly" },
    schedule: [
      { h: 0, map: "store", x: 8, y: 3, w: 0, where: "Pike's Provisions" },
      { h: 7, map: "store", x: 5, y: 3, w: 2, where: "Pike's Provisions" },
      { h: 19, map: "tavern", x: 11, y: 7, w: 1, where: "the Hollow Oak" },
      { h: 22, map: "store", x: 8, y: 3, w: 0, where: "Pike's Provisions" },
    ],
  },
  mayor: {
    name: "Mayor {mayor}", title: "Mayor of Oakhaven",
    schedule: [
      { h: 0, map: "hall", x: 3, y: 7, w: 0, where: "the Mayor's House" },
      { h: 8, map: "hall", x: 5, y: 2, w: 1, where: "the Mayor's House" },
      { h: 11, map: "oak", x: 26, y: 16, w: 2, where: "the town square" },
      { h: 14, map: "hall", x: 5, y: 2, w: 1, where: "the Mayor's House" },
      { h: 18, map: "tavern", x: 11, y: 5, w: 1, where: "the Hollow Oak" },
      { h: 21, map: "hall", x: 3, y: 7, w: 0, where: "the Mayor's House" },
    ],
    flagSched: [{ when: (f) => f.d3_scene_on && !f.d3_scene, e: { h: 0, map: "oak", x: 26, y: 17, w: 0, where: "the town square" } }],
  },
  tomas: {
    name: "Tomas Reed", title: "Town watch",
    look: { skin: 2, hair: 0, helm: true, cloth: 0, outfit: "coat", mood: "neutral" },
    schedule: [
      { h: 0, map: "oak", x: 24, y: 21, w: 3, where: "the town square" },
      { h: 6, map: "oak", x: 21, y: 19, w: 4, where: "the town square" },
      { h: 13, map: "oak", x: 41, y: 19, w: 3, where: "the east road" },
      { h: 17, map: "oak", x: 22, y: 20, w: 4, where: "the town square" },
      { h: 20, map: "tavern", x: 10, y: 8, w: 1, where: "the Hollow Oak" },
      { h: 22, map: "oak", x: 24, y: 21, w: 3, where: "the town square" },
    ],
    flagSched: [{ when: (f) => f.d3_scene_on && !f.d3_scene, e: { h: 0, map: "oak", x: 24, y: 20, w: 0, where: "the town square" } }],
  },
  edda: {
    name: "Edda Crop-foot", title: "Farmer",
    look: { skin: 2, hair: 3, hairStyle: "long", cloth: 1, mood: "kind", strap: true },
    schedule: [
      { h: 0, map: "cottage_e", x: 4, y: 5, w: 1, where: "the farmhouse" },
      { h: 6, map: "oak", x: 5, y: 45, w: 1, where: "the turnip field" },
      { h: 17, map: "tavern", x: 12, y: 8, w: 1, where: "the Hollow Oak" },
      { h: 21, map: "cottage_e", x: 4, y: 5, w: 1, where: "the farmhouse" },
    ],
  },
  maud: {
    name: "Old Maud", title: "",
    look: { skin: 1, hair: 5, hood: true, cloth: 5, age: true, mood: "sly" },
    schedule: [
      { h: 0, map: "hut", x: 4, y: 3, w: 0, where: "her cottage in the North Woods" },
    ],
  },
  pip: {
    name: "Pip", title: "Wandering bard",
    look: { skin: 3, hair: 0, hairStyle: "short", cloth: 4, mood: "smile", strap: true },
    schedule: [
      { h: 0, map: "tavern", x: 16, y: 5, w: 0, where: "the Hollow Oak" },
      { h: 10, map: "oak", x: 21, y: 21, w: 2, where: "the town square" },
      { h: 16, map: "tavern", x: 16, y: 4, w: 1, where: "the Hollow Oak" },
    ],
  },
  stranger: {
    name: "The stranger", title: "Hooded traveller",
    look: { skin: 1, hair: 3, hairStyle: "short", beard: true, cloth: 0, outfit: "coat", mood: "neutral" },
    schedule: [{ h: 0, map: null, via: [9, 10] }],
    flagSched: [{ when: (f, h) => f.d2_stranger && !f.d2_scene && h >= 17, e: { h: 0, map: "tavern", x: 15, y: 4, w: 0, where: "the Hollow Oak" } }],
  },
  tessa: {
    name: "Tessa Hollis", title: "Your oldest friend",
    look: { skin: 1, hair: 2, hairStyle: "long", cloth: 3, apron: "#e9d9b4", mood: "smile" },
    schedule: [
      { h: 0, map: null },
      { h: 6, map: "tavern", x: 4, y: 5, w: 1, where: "the Hollow Oak" },
      { h: 13, map: "oak", x: 24, y: 22, w: 2, where: "the well in the square" },
      { h: 19, map: "tavern", x: 8, y: 7, w: 2, where: "the Hollow Oak" },
      { h: 23, map: null },
    ],
  },
  joss: {
    name: "Joss Carter", title: "Carter",
    look: { skin: 2, hair: 1, hairStyle: "short", beard: true, cloth: 3, mood: "neutral" },
    schedule: [
      { h: 0, map: null },
      { h: 7, map: "oak", x: 38, y: 19, w: 2, where: "the east road" },
      { h: 17, map: "tavern", x: 14, y: 8, w: 1, where: "the Hollow Oak" },
      { h: 22, map: null },
    ],
  },
  lenna: {
    name: "Lenna", title: "Edda's granddaughter",
    look: { skin: 2, hair: 3, hairStyle: "bun", cloth: 0, mood: "smile" },
    schedule: [
      { h: 0, map: null },
      { h: 8, map: "oak", x: 22, y: 20, w: 5, where: "the town square" },
      { h: 17, map: null },
    ],
  },
  garrick: {
    name: "Old Garrick", title: "Retired watchman",
    look: { skin: 1, hair: 5, hairStyle: "short", beard: true, cloth: 5, outfit: "coat", age: true, mood: "stern" },
    schedule: [
      { h: 0, map: "cottage_g", x: 4, y: 5, w: 1, where: "his cottage" },
      { h: 9, map: "oak", x: 40, y: 16, w: 1, where: "the pond" },
      { h: 18, map: "tavern", x: 16, y: 8, w: 1, where: "the Hollow Oak" },
      { h: 22, map: "cottage_g", x: 4, y: 5, w: 1, where: "his cottage" },
    ],
  },
  ansel: {
    name: "Ansel Tarn", title: "Cooper's apprentice",
    look: { skin: 0, hair: 2, hairStyle: "short", cloth: 6, mood: "sly" },
    schedule: [
      { h: 0, map: null },
      { h: 7, map: "oak", x: 19, y: 20, w: 3, where: "the town square" },
      { h: 12, map: "oak", x: 30, y: 16, w: 2, where: "the east side of the square" },
      { h: 19, map: "tavern", x: 9, y: 7, w: 1, where: "the Hollow Oak" },
      { h: 22, map: null },
    ],
  },
  hester: {
    name: "Hester Vane", title: "Dyer",
    look: { skin: 0, hair: 4, hairStyle: "long", cloth: 4, outfit: "dress", mood: "kind" },
    schedule: [
      { h: 0, map: "cottage_h", x: 4, y: 5, w: 1, where: "her dye house" },
      { h: 8, map: "oak", x: 41, y: 43, w: 2, where: "outside the dye house" },
      { h: 17, map: "store", x: 3, y: 5, w: 1, where: "Pike's Provisions" },
      { h: 19, map: "cottage_h", x: 4, y: 5, w: 1, where: "her dye house" },
    ],
  },
  thorne: {
    name: "Arbitrator Thorne", title: "Archon Covenant",
    look: { skin: 0, hair: 5, hairStyle: "bun", cloth: 0, outfit: "coat", mood: "stern" },
    schedule: [{ h: 0, map: null, via: [45, 18] }],
    flagSched: [
      { when: (f) => f.d3_scene_on && !f.d3_scene, e: { h: 0, map: "oak", x: 27, y: 19, w: 0, where: "the town square" } },
      { when: (f) => f.d3_scene && !f.d4_fire, e: { h: 0, map: "hall", x: 5, y: 5, w: 1, where: "the Mayor's House" } },
    ],
  },
  kellan: {
    name: "Kellan Vex", title: "",
    look: { skin: 1, hair: 3, hairStyle: "short", beard: true, cloth: 0, outfit: "coat", mood: "neutral" },
    schedule: [{ h: 0, map: null }],
  },
};

for (const k in NPC_DEFS) NPC_DEFS[k].id = k;
/* The fire (Day 4 dusk) and the ash that follows rewrite who is where. Entries are constants so the engine sees no change tick to tick. */
const SCHED_NONE = { h: 0, map: null };
const FIRE_SCHED = {
  kellan: { h: 0, map: "oak", x: 15, y: 15, w: 0, where: "before the workshop" },
  mentor: { h: 0, map: "oak", x: 14, y: 14, w: 0, where: "before the workshop" },
};
const ASH_SCHED = {
  tessa: { h: 0, map: "oak", x: 16, y: 14, w: 0, where: "the ruins of the workshop" },
  tomas: { h: 0, map: "oak", x: 22, y: 20, w: 1, where: "beside the Pillar" },
  bram: { h: 0, map: "oak", x: 26, y: 20, w: 1, where: "beside the Pillar" },
  wenna: { h: 0, map: "oak", x: 22, y: 22, w: 1, where: "beside the Pillar" },
  mayor: { h: 0, map: "oak", x: 27, y: 22, w: 0, where: "beside the Pillar" },
  edda: { h: 0, map: "oak", x: 20, y: 22, w: 1, where: "beside the Pillar" },
};
function scheduleAt(def, hour, flags) {
  if (flags && flags.d5_ash) return ASH_SCHED[def.id] || SCHED_NONE;
  if (flags && flags.d4_fire) return FIRE_SCHED[def.id] || SCHED_NONE;
  if (def.flagSched && flags) for (const q of def.flagSched) if (q.when(flags, hour)) return q.e;
  let e = def.schedule[0];
  for (const s of def.schedule) if (s.h <= hour) e = s;
  return e;
}

/* ------------------------------------------------------------------ */
/* Dialogue                                                            */
/* A script is a list of steps:                                        */
/*   "text"                          spoken by the conversation owner  */
/*   { who, t }                      who = npc id, "narrator" or "mentor" */
/*   { choice: [[label, steps], ...] }                                 */
/*   { do: (c) => {} }               change state                      */
/*   { shop: true } { job: true } { sleep: true }  open after dialogue */
/* Text may use {name} {surname} {full} {mentor} {mayor} {trade}       */
/* {they} {them} {their} {They} {kid} follow the player's pronouns     */
/* {station} {product} {recipient} {where}                             */
/* ------------------------------------------------------------------ */
const NOTICES = [
  { who: "narrator", t: "NOTICE: By order of the Archon Covenant, all unlicensed texts, almanacs and old writings are to be surrendered to a Curate for inspection." },
  { who: "narrator", t: "LOST: Goat, brown, answers to Barley. Return to Edda Crop-foot. Reward of two coppers and her gratitude." },
  { who: "narrator", t: "The West Province tithe is due at the turn of the month. Lord Harrowgate thanks the people of Oakhaven for their diligence." },
  { who: "narrator", t: "Tonight at the Hollow Oak: Pip sings 'The Fall of the Middle Sea', all eleven verses." },
];

function mentorChatter(c) {
  if (c.flag("passedOut")) {
    c.set("passedOut", false);
    return ["Found you face down in the street at midnight. Do that again and you can sleep in it."];
  }
  const part = isNightT(c.G.time) ? "Night" : c.G.flags.d1_paid ? "Afternoon" : "Morning";
  const lines = {
    Morning: ["Work's there. You know where.", "If you're looking for praise, look somewhere else.", "Up early. Good. Don't make a habit of being late, either."],
    Afternoon: ["If you're here to talk, talk while you work.", "Mind {station}. It's worth more than your contract.", "The guild sent me an apprentice, not a conversation."],
    Evening: ["Supper's bread. It was bread yesterday as well.", "Don't stay out past dark. The watch has enough to do.", "You did your work. That's all I ask. Mostly."],
    Night: ["Bed. Now.", "Candles cost money. Go to sleep."],
  }[part];
  return [c.rot("mentor" + part, lines)];
}

const SCRIPTS = {
  intro: (c) => [
    { who: "narrator", t: "Oakhaven. A farming town at the western edge of Etharis, under the protection of the Archon Covenant." },
    { who: "narrator", t: "{full}. Apprentice to {mentor}, {trade_lower} of Oakhaven." },
    { who: "mentor", t: "{name}. Up. The sun's been up an hour, and so should you." },
    { choice: [
      ["Morning, {mentor}.", [{ who: "mentor", t: "Is it." }]],
      ["Five more minutes.", [{ who: "mentor", t: "You can have five more minutes when you start paying rent." }]],
    ] },
    { who: "mentor", t: "{order}" },
    { who: "mentor", t: "{station_cap}. Now. Come and find me when it's done." },
    { do: (c) => c.set("d1_intro", true) },
    { who: "narrator", t: "Before you go out: there is a mirror on the wall by the fireplace. You don't leave a master's shop looking like you slept in it." },
  ],

  afterFirstJob: (c, score) => [
    { who: "mentor", t: score >= 0.75 ? "Hm. That will do." : score >= 0.4 ? "Passable. Barely." : "I've seen better work from a goat. It will have to do." },
    { who: "mentor", t: "Take {product} to {recipient}. {recipient_hint}" },
    { who: "mentor", t: "Then go to Pike's and buy me a tallow candle. Here, three coppers. Don't lose them." },
    { do: (c) => { c.give("delivery", 1); c.coins(3); c.set("d1_order", true); } },
    { who: "narrator", t: "You received {product} and 3 coppers." },
  ],

  mentor: (c) => {
    const f = c.G.flags;
    if (!f.d1_intro) return SCRIPTS.intro(c);
    if (!f.d1_job) return [{ who: "mentor", t: "{station_cap} first. Talk after." }];
    if (f.d1_order && !f.d1_paid) {
      const delivered = !!f.d1_delivered, candle = c.has("candle");
      if (delivered && candle) {
        return [
          { who: "mentor", t: "Candle." },
          { do: (c) => c.take("candle", 1) },
          { who: "narrator", t: "You hand over the tallow candle." },
          { who: "mentor", t: "Took you long enough. Here." },
          { do: (c) => { c.coins(5); c.set("d1_paid", true); } },
          { who: "narrator", t: "You received 5 coppers." },
          { who: "mentor", t: "That's your wage for today. Spend it on something sensible, which means not ale." },
          ...SCRIPTS.d1_witch(c),
        ];
      }
      if (!delivered && !candle) return [{ who: "mentor", t: "{product_cap} won't walk to {recipient} on its own. And I still have no candle." }];
      if (!delivered) return [{ who: "mentor", t: "The candle's a start. Now {product}. {recipient_hint}" }];
      return [{ who: "mentor", t: "{recipient} sent word it arrived. Where's my candle?" }];
    }
    if (c.G.day === 1 && f.d1_paid) {
      if (!f.d1_sword && !f.d1_maud) return [{ who: "mentor", t: "Sword first. Storeroom, east wall, the chest by the shelves. I'd rather you walked out with an edge in your hand. Old Maud is north, through the woods, past the barricade." }];
      if (!f.d1_maud) return [{ who: "mentor", t: "Old Maud. North road, through the woods. Show the watch the seal at the barricade. And mind the wolves." }];
      if (!f.d1_report) return [
        { who: "player", t: "Maud says the charm takes three days. Rowan cut at the dark of the moon." },
        { who: "mentor", t: "Three days." },
        { who: "narrator", t: "{mentor} looks at the door, then at the bar across it, as if measuring one against the other." },
        { who: "mentor", t: "Then it will keep three days. Bed. Tomorrow is a working day like any other." },
        { do: (c) => c.set("d1_report") },
      ];
    }
    if (c.G.day >= 2 && !f.d2_errand) return SCRIPTS.d2_mentor(c);
    if (f.d2_errand && !f.d2_errand_done) {
      if (c.has("oil")) return [
        { who: "mentor", t: "Oil. Good. Put it there." },
        { do: (c) => { c.take("oil", 1); c.coins(5); c.set("d2_errand_done"); } },
        { who: "narrator", t: "You received 5 coppers." },
        { who: "mentor", t: "Now go and be young somewhere that isn't here. Tessa said something about the Hollow Oak tonight." },
      ];
      return [{ who: "mentor", t: "The lamp oil. From Pike's. It isn't going to fetch itself, and I'm not paying you to stand there." }];
    }
    if (c.G.day >= 3 && !f.d3_mentor) return SCRIPTS.d3_mentor(c);
    if (c.G.day >= 4 && !f.d4_errand) return SCRIPTS.d4_mentor(c);
    if (f.d4_errand && !f.d4_maud) return [{ who: "mentor", t: f.d4_bargain ? "A mushroom? Then fetch her the mushroom. Today, {name}. Not tomorrow." : "Still here? Maud. The charm. Go." }];
    return mentorChatter(c);
  },

  d3_mentor: (c) => [
    { who: "mentor", t: "Day three. An Arbitrator of the Covenant rides in at noon, and the mayor has decided that is a holiday. It is not." },
    { who: "mentor", t: "Arbitrators ask questions. The wise answer is as few words as possible. You have been at the desk all week and you have seen nothing." },
    { choice: [
      ["Is something wrong?", [{ who: "mentor", t: "Nothing is wrong. Everything is as it was. Remember that." }]],
      ["I'll keep my head down.", [{ who: "mentor", t: "For once, a sensible sentence." }]],
    ] },
    { who: "mentor", t: "Stand in the square at noon like everyone else. And {name}. Not at the front." },
    { do: (c) => { c.set("d3_mentor"); } },
  ],

  d3_scene: (c) => [
    { do: (c) => { c.set("d3_scene_on"); c.teleport(24, 21, "up"); } },
    { who: "narrator", t: "A bell rings across the square. Folk drift out of doorways, wiping their hands, pretending not to hurry." },
    { wait: 7500 },
    { who: "mayor", t: "Citizens! Neighbours! Friends of the Pillar! Oakhaven has the honour of receiving an Arbitrator of the Archon Covenant. Manners, please. Tomas, stand up straight." },
    { who: "tomas", t: "I am standing up straight, Mayor." },
    { who: "thorne", t: "Thank you, Mayor. I will not keep your town long. I am Isaura Thorne. I am here to ask questions, not to hang anyone." },
    { who: "thorne", t: "A book was taken from a Weaver vault in the south. Green leather, bound in iron wire. The thief is a man, grey in the beard, travelling alone, and he came north." },
    { who: "thorne", t: "Has anyone in Oakhaven spoken with such a stranger?" },
    { who: "narrator", t: "Nobody moves. Somewhere a baby coughs. Isaura Thorne sweeps her gaze across the crowd, and stops on you." },
    { cue: [["move", "thorne", 25, 20, { face: "down" }], ["emote", "player", "!"], ["cam", "player", 25, 19]], wait: 1600 },
    { who: "thorne", t: "You. The apprentice. You have the look of someone holding their breath." },
    { who: "thorne", t: "I can ask the way the Covenant asks, with a word that makes a lie painful. Or I can ask the way a neighbour asks. Which would you prefer?" },
    { choice: [
      ["Tell the truth. A stranger sat in the Hollow Oak.", [
        { do: (c) => { c.set("d3_choice", "truth"); } },
        { who: "player", t: "A man like that sat in the Hollow Oak last night. He left in a hurry." },
        { who: "thorne", t: "Did he. In a hurry, and in which direction?" },
      ]],
      ["Lie. Say you have seen no one.", [
        { do: (c) => { c.set("d3_choice", "lie"); } },
        { who: "player", t: "No, Arbitrator. Nobody like that." },
        { who: "thorne", t: "Nobody." },
        { who: "narrator", t: "She tastes the word. You feel something being warmed behind her teeth." },
      ]],
      ["Say nothing.", [
        { do: (c) => { c.set("d3_choice", "silent"); } },
        { who: "narrator", t: "You hold her gaze and your tongue. The silence stretches until it creaks." },
        { who: "thorne", t: "Silence is also an answer, apprentice. Not always the one you hope." },
      ]],
    ] },
    { cue: [["puff", "thorne", "ley"]] },
    { who: "thorne", t: "Ver—" },
    { who: "narrator", t: "The syllable settles on your shoulders like a hand." },
    { cue: [["move", "mayor", 26, 20, { speed: 2.4, face: "left" }], ["emote", "mayor", "!"]], wait: 900 },
    { who: "mayor", t: "Arbitrator! Forgive me, the feast! The cook is beside himself! The lamb will not wait for law or heaven!" },
    { who: "thorne", t: "..." },
    { who: "thorne", t: "Later, then. I will find you again, apprentice." },
    { cue: [["move", "mayor", 14, 27, { speed: 1.4 }], ["move", "thorne", 15, 28]], wait: 2600 },
    { do: (c) => { c.set("d3_scene"); } },
    { who: "narrator", t: "The crowd breathes out. Isaura Thorne follows the mayor toward the hall, and every back in the square unclenches at once." },
    { who: "narrator", t: "Whatever she was about to ask, she has not forgotten. You can feel it." },
    { do: (c) => { c.set("south_open"); c.refreshWorld(); } },
    { who: "tomas", t: "And the Arbitrator says the roads may open. All of them. South road too, for what it's worth. Nothing down there but rocks and old holes." },
  ],

  d3_study: (c) => [
    { who: "narrator", t: "You wait for the house to settle, lift the loose board, and take out the tome." },
    { who: "narrator", t: "Pages that were noise yesterday have begun to read. Pyr, flame. Nix, the cold that follows it. San, the mending word. In the margin, a cramped hand: 'Breath first. Always breath first.'" },
    { do: (c) => { c.set("d3_study"); c.learn({ r: ["Pyr", "Nix", "San"], s: ["at", "am"] }); } },
    { who: "narrator", t: "New: Pyr, Nix, San, and the endings -at and -am. Open the Tome from the menu to weave them." },
    { who: "narrator", t: "Isaura Thorne is somewhere in this town, and you are lying on a bed that hides the thing she is hunting." },
    { sleep: true },
  ],

  d1_witch: (c) => [
    { who: "mentor", t: "One more errand before you waste the day." },
    { who: "mentor", t: "Old Maud keeps a cottage in the North Woods, at the end of the trail. I want a charm from her. A ward, for the door. Take her this, into her hand." },
    { do: (c) => { c.give("letter", 1); c.give("poultice", 2); c.set("d1_witch"); } },
    { who: "narrator", t: "You received a sealed letter and two poultices." },
    { choice: [
      ["A ward? For what?", [{ who: "mentor", t: "For the door. Doors are for keeping things out. That is all you need to know." }]],
      ["The north road is closed.", [{ who: "mentor", t: "Show the watch the guild seal at the barricade. They'll open it. The wolves have been bold this year, so keep your wits." }]],
    ] },
    { who: "mentor", t: "And you'll want more than a stern look for the wolves. There's an old sword in the chest in the storeroom, through the door on the east wall. Take it. It has been waiting for somebody to need it." },
    { do: (c) => { c.set("d1_sword_ask"); } },
  ],

  d4_mentor: (c) => [
    { who: "mentor", t: "You're up. Good. Three days. Maud's charm should be ready." },
    { who: "mentor", t: "Fetch it. Today. Don't stop to talk to every goat on the way." },
    { do: (c) => { c.give("poultice", 2); c.set("d4_errand"); } },
    { who: "narrator", t: "You received two poultices." },
    { choice: [
      ["Is something wrong?", [{ who: "mentor", t: "Something is always wrong. Today I would like one thing to be right. Go." }]],
      ["On my way.", [{ who: "mentor", t: "Good." }]],
    ] },
  ],

  look_barricade: (c) => {
    const f = c.G.flags;
    if (c.tile && c.tile[1] >= 50) return [{ who: "narrator", t: f.south_open ? "The south barricade stands open." : "The south road to the old quarry is barred. A watchman leans on the planks. 'Not till the Arbitrator's been and gone. Orders.'" }];
    if (c.tile && c.tile[1] <= 4 && f.d1_witch && !f.d1_sword && !f.d4_open) return [
      { who: "narrator", t: "The watchman looks you up and down. 'Going out there with nothing in your hands? Wolves don't care about guild seals.'" },
      { who: "narrator", t: "Your mentor mentioned an old sword, in the chest in the storeroom of the workshop." },
    ];
    if (c.tile && c.tile[1] <= 4 && f.d1_witch && !f.d4_open) return [
      { who: "narrator", t: "A watchman on the far side of the planks raises his lantern. You hold up the guild seal." },
      { who: "narrator", t: "He squints at it, mutters something about guilds and their notions, and drags the planks aside. 'Back before dark. Wolves don't read seals.'" },
      { do: (c) => { c.set("d4_open"); c.refreshWorld(); } },
    ];
    return LOOK_TEXT.barricade.map((x) => ({ who: "narrator", t: x }));
  },

  thorne: (c) => {
    const f = c.G.flags;
    const lines = [
      "I am told the Pillar here is the oldest in the county. The mayor has mentioned it nineteen times.",
      "Do not mistake courtesy for leisure. I will be in Oakhaven until the lamplighters finish, and no longer.",
      "The Covenant keeps the peace. It keeps a great deal else besides, and most of it is paperwork.",
    ];
    if (f.d3_choice === "truth") return [{ who: "thorne", t: "You told me about the stranger. That was well done. Keep your eyes open." }, c.rot("thorne", lines)];
    if (f.d3_choice === "lie") return [{ who: "thorne", t: "Nobody, you said." }, { who: "thorne", t: "Lies leave a taste, apprentice. I will remember the flavour." }];
    return [c.rot("thorne", lines)];
  },
  kellan: (c) => [{ who: "kellan", t: "Not now." }],

  d4_fire_start: (c) => [
    { do: (c) => { c.fireStart(); } },
    { who: "narrator", t: "The north road is quiet. Too quiet. Then the wind turns and you smell it: woodsmoke, and under it something sweeter and worse." },
    { who: "narrator", t: "Oakhaven is burning." },
    { who: "narrator", t: "Roofs fold in on themselves. People run with buckets and children. The Pillar in the square still hums, but the sound has gone thin and wrong." },
    { who: "narrator", t: "Ahead, in front of the workshop, a figure stands in the firelight, perfectly still." },
  ],

  d4_confront: (c) => [
    { cue: [["move", "player", 15, 18, { face: "up" }], ["face", "kellan", "down"], ["hold", "mentor"], ["cam", "player", 16, 17]], wait: 1500 },
    { who: "narrator", t: "{mentor} lies against the workshop wall with one hand pressed to her ribs. The stranger from the Hollow Oak stands over her with the stillness of a man waiting on a kettle." },
    { who: "kellan", t: "The apprentice. Good. She swore you knew nothing. She is a poor liar, your master." },
    { who: "mentor", t: "{name}. Run." },
    { who: "kellan", t: "Kellan Vex. You have seen me once. You will remember me longer." },
    { who: "kellan", t: "A book was in my coat when I sat down in that tavern and not in my coat when I stood up. A copyist who writes for the Covenant seemed the sort of woman who might know where books go. I have been very patient with her." },
    { who: "mentor", t: "I have told you. I never saw your book." },
    { who: "kellan", t: "And yet. Child. Where is it?" },
    { choice: [
      ["I have it. Let her go.", [
        { who: "player", t: "I have it. Take it and let her go." },
        { who: "kellan", t: "You have it? Then she lied to me and to you. Oh, that is better." },
        { who: "mentor", t: "Don't be a fool, {name}." },
      ]],
      ["Weave Vis-or at him.", [
        { who: "narrator", t: "You do not answer. You breathe in." },
      ]],
      ["Say nothing.", [
        { who: "kellan", t: "Brave. Or foolish. Let's learn which." },
      ]],
    ] },
    { cue: [["puff", "player", "ley"], ["emote", "player", "...", 1.4]], wait: 900 },
    { who: "narrator", t: "You draw breath. Inhale. Weave. The old words rise in your throat: Vis... -or." },
    { who: "kellan", t: "Vis. A small word for small hands." },
    { cue: [["puff", "kellan", "dark"], ["shake", "player", 0.5, 5], ["move", "player", 15, 20, { speed: 3.2, back: true, face: "up" }]], wait: 900 },
    { do: (c) => { c.shake(); } },
    { who: "narrator", t: "He does not move. He speaks over you, one quiet syllable, and your weave tears like wet paper. The backlash throws you across the cobbles." },
    { who: "narrator", t: "Rupture. You taste blood. The world is a long way off." },
    { who: "mentor", t: "Leave... the child... alone." },
    { cue: [["move", "mentor", 15, 14, { speed: 2.2, face: "down" }], ["emote", "mentor", "!"]], wait: 1000 },
    { who: "narrator", t: "{mentor} hauls herself up the wall and throws her weight against the stranger's arm. It is the bravest thing you have ever seen her do. It is also the last." },
    { cue: [["face", "kellan", "up"]], wait: 500 },
    { who: "kellan", t: "Nihil." },
    { cue: [["puff", "mentor", "dark"], ["hide", "mentor"], ["shake", "player", 0.7, 4]], wait: 1600 },
    { do: (c) => { c.shake(); } },
    { who: "narrator", t: "{mentor} stops. Not falls. Stops, like a candle with the flame lifted off." },
    { cue: [["face", "kellan", "down"]] },
    { who: "kellan", t: "That was the clerk. Now you." },
    { cue: [["move", "kellan", 15, 18]], wait: 1200 },
    { who: "thorne", t: "Kellan Vex! In the Archon's name, stand where you are!" },
    { cue: [["show", "thorne", 25, 15], ["move", "thorne", 19, 16, { speed: 1.6, face: "left" }], ["puff", "thorne", "light"], ["show", "tomas", 26, 16], ["move", "tomas", 21, 17, { speed: 1.6, face: "left" }], ["face", "kellan", "right"]], wait: 2400 },
    { who: "narrator", t: "A horn. Boots. Tomas shouting. Light that is not fire, white and cold, coming down the street." },
    { who: "kellan", t: "The Arbitrator. How convenient." },
    { who: "kellan", t: "Keep the book, child, if you have it. Keep it warm. It will lead me to you better than any hunt." },
    { cue: [["puff", "kellan", "dark"], ["move", "kellan", 10, 16, { speed: 1.8 }]], wait: 1500 },
    { cue: [["puff", "kellan", "dark"], ["hide", "kellan"]], wait: 900 },
    { who: "narrator", t: "Fog pours out of his sleeves. It smells of nothing. The edges of the world go grey, then black." },
    { act: "aftermath" },
  ],

  d5_wake: (c) => [
    { who: "narrator", t: "Black. Then grey. Then a sky the colour of dishwater, and the smell of wet ash." },
    { cue: [["move", "tessa", 15, 14, { speed: 2, face: "left" }], ["emote", "tessa", "!"], ["face", "player", "right"]], wait: 1200 },
    { who: "tessa", t: "Don't sit up. Don't. Sit. Up. You idiot." },
    { who: "narrator", t: "Tessa's face swims into focus. Her hands are black to the wrist, and her eyes are red." },
    { who: "tessa", t: "You've been out three days. Isaura Thorne's people held the square till morning. The Pillar's light kept the fire off. Nothing else was kept off." },
    { who: "tessa", t: "We buried {mentor} with the others. I said something over her. It wasn't good, but it was something." },
    { who: "narrator", t: "Where the workshop stood there is a black frame and a smell. You still have the tome. Of everything in Oakhaven, you still have the tome." },
    { who: "tessa", t: "The Arbitrator says Vex went north into the fog and the fog closed behind him. She says every Pillar between here and Ashford is a target now." },
    { who: "tessa", t: "There's a Weaver outpost at Ashford. She thinks they'll know what that book is. She thinks you should go there." },
    { who: "tessa", t: "I'm coming with you. Don't argue. I've lost enough." },
    { do: (c) => { c.joinParty("tessa"); c.set("act1_end"); } },
    { who: "narrator", t: "Tessa Hollis has joined your party." },
    { who: "narrator", t: "Oakhaven is ash, and you are what is left of the apprenticeship. Speak with the survivors by the Pillar when you are ready." },
    { who: "narrator", t: "Act One ends here. The road to Ashford opens in the next act." },
    { act: "credits" },
  ],

  d2_mentor: (c) => [
    { who: "mentor", t: "Up before the bell, for once. Don't let it go to your head. You've been under my roof long enough to know I notice." },
    { who: "mentor", t: "The lamp is nearly dry, and I will not work by candle. Go to Pike's Provisions and ask Wenna for a flask of lamp oil. Put it on my tab." },
    { choice: [
      ["Anything else?", [{ who: "mentor", t: "Yes. Stop asking questions that have already been answered." }]],
      ["On my way.", [{ who: "mentor", t: "Good." }]],
    ] },
    { do: (c) => { c.set("d2_errand"); } },
    { who: "narrator", t: "New task: fetch lamp oil from Pike's Provisions." },
  ],

  stranger: (c) => c.flag("d2_scene")
    ? [{ who: "stranger", t: "..." }]
    : [{ who: "stranger", t: "Sit, or go. You are standing in my light." }],

  d2_scene: (c) => [
    { cue: [["move", "tessa", 10, 8, { face: "left" }], ["move", "player", 9, 8, { face: "right" }], ["emote", "tessa", "!"]], wait: 1800 },
    { who: "narrator", t: "The Hollow Oak is warm and loud tonight. Tessa has claimed the table by the hearth and is waving a spoon at you like a flag." },
    { who: "tessa", t: "There you are. Sit before Uncle Bram finds you something to carry." },
    { who: "tessa", t: "You look like you were dragged behind a cart. Rough night? Or just the usual?" },
    { choice: [
      ["It feels longer.", [{ who: "tessa", t: "It always does. Nineteen years of being the strays and still no one lets us forget it." }]],
      ["Don't start.", [{ who: "tessa", t: "Wouldn't dream of it. I'd only start with the good material." }]],
    ] },
    { who: "tessa", t: "Hester says the Pillar over in Ashford went dark for a whole night last month. A whole night! Imagine that." },
    { who: "tessa", t: "I'd go and look, if anyone would let me out of this tavern. Ashford, the coast, anywhere with a bigger sky." },
    { do: (c) => { c.set("d2_stranger"); } },
    { cue: [["face", "tessa", "down"], ["emote", "tessa", "?", 2.4], ["face", "player", "down"]], wait: 5500 },
    { cue: [["face", "tessa", "left"], ["face", "player", "right"]] },
    { who: "narrator", t: "The door sighs open on a cold draught. A hooded traveller shakes the rain from his coat and takes the corner table without looking at anyone." },
    { who: "tessa", t: "Third night running. Pays in old coin and talks to nobody. Uncle Bram says leave him be." },
    { cue: [["move", "bram", 6, 3, { face: "down" }]], wait: 1600 },
    { who: "narrator", t: "Further down the bar, Bram is pouring for Tomas and a knot of regulars. His voice carries." },
    { who: "bram", t: "...Tomorrow noon, so I heard. An Arbitrator, up from the capital. To settle the tithe, they say, and look into 'irregularities.'" },
    { who: "bram", t: "Never met one. Don't plan to enjoy it. They say an Arbitrator can tell when you're lying." },
    { cue: [["emote", "stranger", "!", 2], ["face", "stranger", "left"], ["face", "player", "up"]], wait: 1400 },
    { who: "narrator", t: "In the corner, the hooded man has gone very still. Then he stands, and a chair scrapes." },
    { who: "stranger", t: "Not here. Not yet." },
    { do: (c) => { c.set("d2_scene"); } },
    { cue: [["emote", "bram", "?", 3], ["emote", "tessa", "...", 3]], wait: 4500 },
    { cue: [["face", "player", "right"], ["face", "tessa", "left"]] },
    { who: "narrator", t: "He is out the door before his stew arrives. Bram stares after him, shrugs, and goes back to pouring." },
    { who: "tessa", t: "Well. That was dramatic. Even for the Hollow Oak." },
    { who: "tessa", t: "An Arbitrator, though. Tomorrow. Uncle will want the whole tavern scrubbed, and I know exactly who is going to be scrubbing it." },
    { choice: [
      ["I'll help, if I'm not working.", [{ who: "tessa", t: "You are a better friend than I deserve. Don't tell anyone I said that." }]],
      ["Better you than me.", [{ who: "tessa", t: "Traitor. I'll remember this when you want the good stew." }]],
    ] },
    { who: "tessa", t: "Go on, get some sleep. It's late, and tomorrow is going to be loud." },
    { who: "narrator", t: "As you stand, something catches your eye beneath the stranger's empty chair: an oilcloth bundle, forgotten in his hurry. Nobody is looking. You pick it up before you think about it." },
    { do: (c) => { c.give("tome"); c.set("d2_tome"); } },
    { who: "narrator", t: "You received an oilcloth bundle. It is heavier than a book should be, and faintly warm." },
    { who: "narrator", t: "Better not open it here. Take it home, and wait for dark." },
  ],

  d2_study: (c) => [
    { who: "narrator", t: "{mentor}'s snores rattle the rafters. You unwrap the bundle by the light of a single candle." },
    { who: "narrator", t: "A tome. The letters on the cover are not any alphabet you were taught, and yet you know, as you know your own name, how they sound." },
    { who: "narrator", t: "PHAOS. VIS. The words rise off the page. The air in the room leans in to listen." },
    { who: "narrator", t: "Old Tongue. A word is a root and a suffix. Speak one wrong, and the world answers wrong." },
    { tut: true },
  ],
  d2_study_done: (c) => [
    { do: (c) => { c.set("d2_study"); c.set("magic"); c.learn({ r: ["Phaos", "Vis"], s: ["is", "or"] }); } },
    { who: "narrator", t: "You close the tome. Your hands are shaking, and you are smiling for the first time all week." },
    { who: "narrator", t: "New: Tome (menu). Phaos, Vis, and the endings -is and -or. Press the cast key on the road to call a light." },
    { who: "narrator", t: "Then you hide it under the cot, behind the loose board, and lie awake listening for boots." },
    { sleep: true },
  ],

  bram: (c) => {
    const lines = [
      "Oh. It's you. Come in, then. Mind the third step, it bites. You know that. You've been bitten before.",
      "Folk up from Ashford say their Pillar went dark for a whole night. A whole night! Ours still hums, thank the Covenant.",
      "Your {mentor} drinks here twice a year and complains about the ale both times.",
      "Stew's turnip again. It's always turnip. This is Oakhaven.",
      "Strangers don't come through often. When they do, they drink like they're trying to forget something.",
      "Don't take it to heart when the regulars go quiet. They've done it since you were small. It says more about them than it does about you.",
    ];
    const first = c.part === "Evening" || c.part === "Night" ? "Busy tonight. Sit if you like, but don't take a table from paying folk." : "Morning, {surname}. Or near enough.";
    return [first, { choice: [
      ["Any news?", [c.rot("bram", lines)]],
      ["Just passing through.", ["Aren't we all."]],
    ] }];
  },

  wenna: (c) => {
    if (c.flag("d2_errand") && !c.flag("d2_errand_done") && !c.has("oil")) return [
      "Lamp oil for {mentor}? Again? That woman burns more oil than she sells ink.",
      { do: (c) => { c.give("oil"); } },
      { who: "narrator", t: "Wenna hands you a stoppered flask. \"On her tab,\" she says, and writes something unflattering in her ledger." },
    ];
    if (c.has("parcel")) return [
      { do: (c) => { c.take("parcel", 1); c.coins(3); c.set("joss_done", true); } },
      { who: "narrator", t: "You hand over Joss's parcel." },
      "Joss's tea again. He thinks I can't tell he waters it down. Here, for your trouble.",
      { who: "narrator", t: "You received 3 coppers." },
    ];
    const lines = [
      "Prices went up again. The lord raised the tithe, so the carters raised theirs, so I raised mine. Don't look at me like that.",
      "A Curate came through last spring and took every almanac I had. Said the star charts were unlicensed texts. Star charts!",
      "That ink comes from the south. Don't ask me how far south.",
      "Some in this town count you at half price, {name}. I charge you the same as anyone. Consider it manners.",
      "You've been {mentor}'s ward since you were knee-high, and half this street still lowers its voice when you walk past. Don't let it sour you. Not everyone means it.",
    ];
    if (c.map !== "store") return [c.rot("wenna", lines)];
    return ["What'll it be?", { choice: [
      ["Buy something", [{ shop: true }]],
      ["Just talking", [c.rot("wenna", lines)]],
      ["Nothing, thanks", ["Then stop warming my floor."]],
    ] }];
  },

  mayor: (c) => [c.rot("mayor", [
    "Ah. One of the guild children. {surname}, is it? Yes, yes, we have met. Several times. Splendid. Oakhaven has paid its tithe on time eleven years running. The Archon Council notices such things.",
    "One day a Weaver of real standing will visit us, and they will find this town in perfect order.",
    "Do keep the square tidy, young {surname}. Appearances are a civic duty.",
    "My predecessor let moss grow on the Pillar's plinth. Moss! I had it scrubbed with my own handkerchief.",
    "The guild raised you, and the guild's name is on your contract, so mind how you behave. You are, in a way, Oakhaven's own doing. A reflection on us all.",
  ])],

  tomas: (c) => {
    if (c.part === "Night") return ["Off home with you. Nothing good happens after dark, and I'd rather not have to write it down."];
    return [c.rot("tomas", [
      "Roads are barred. The wolves are bold this year, and I'd rather count heads at the barricade than at the graveyard.",
      "If you see anyone strange in town, you come to me. Not that anything ever happens here.",
      "Don't touch the Pillar. The last fellow who scratched his name in it was fined more than his house was worth.",
      "Quiet day. I like quiet days. Quiet days are why I took this job.",
      "The guild's foundling. Aye. I keep an eye on every stray in this town, {name}. Nothing personal. It's the watch's habit.",
    ])];
  },

  edda: (c) => [c.rot("edda", [
    c.G.trade === "farm" ? "Your {mentor} works me harder than the oxen. Don't tell them I said so." : "A Quill-mark, and proud of it? Crop-foot, me. Folk with guild names work twice as hard to be thought half as good.",
    "If you see a brown goat called Barley, she's mine. She isn't lost. She's exploring.",
    "The soil's been odd lately. Turnips came up purple on one side. My gran would have said the ground was restless.",
    "Hard work won't make you rich, but it keeps you warm at night. Mostly.",
      "Folk talk about the foundlings like they came out of a bog. You were left on the steps of a house one stormy night, same as a loaf left out to cool. Eat something, {name}.",
  ])],

  maud: (c) => [c.rot("maud", [
    "When I was a girl, my gran said the old words belonged to everyone. Then the Weavers came, and she stopped saying it.",
    "Sit by the Pillar some evening and listen. It sounds like breathing. In, and out.",
    "Hm? Oh, I'm not mad, dear. Just old. People mix the two up.",
    "Every few years they take the books away. And every few years, a few come back.",
      "I've watched you since you were a bundle on the steps of a house, {name}, a bundle with opinions. Nobody asked me to look in on you. I did anyway. Old women are allowed.",
  ])],

  pip: (c) => ["Want a song? I know forty about the War of the Gods, and none of them end well.", { choice: [
    ["Play one", [
      { who: "narrator", t: "Pip tunes the lute and sings, low and slow:" },
      { who: "narrator", t: "Where the middle sea once lay, now the grey fog drinks the day. Sail, and you will not return, till the gods have ceased to burn." },
      "Eleven verses. Bram says nine is the legal limit.",
    ]],
    ["Another time", [c.rot("pip", [
      "Tips are welcome. Requests are tolerated.",
      "They say the fog over the Dread Expanse is thinning. The sailors who come back tell the best stories. The ones who don't tell none.",
      "I've played in every town in the West Province. Oakhaven has the best stew and the worst chairs.",
      "I wrote a verse about the guild children once. Bram said it was too sad for a tavern. The people who like it most never sit near the front.",
    ])]],
  ] }],

  tessaMeet: (c) => [
    { who: "tessa", t: "{name}! There you are. I've been sat on this well for an hour pretending to supervise it." },
    { who: "narrator", t: "Tessa Hollis. Bram's niece, taken in the same winter you were left on the steps of a house. You have been the two strays of Oakhaven for as long as either of you can remember." },
    { choice: [
      ["Sorry. {mentor} kept me late.", [{ who: "tessa", t: "She always does. One day she'll let you out before dark and we'll both faint." }]],
      ["You could have come and found me.", [{ who: "tessa", t: "And face {mentor}'s stare? I value my kneecaps." }]],
    ] },
    { who: "tessa", t: "Sit. I stole you something." },
    { who: "narrator", t: "Tessa hands you half a loaf of bread. Still warm. Almost certainly stolen from her uncle's kitchen." },
    { who: "tessa", t: "Pip's singing tonight. Eleven verses. Uncle's already hiding the good cups." },
    { who: "tessa", t: "Can I ask you something? Do you ever think about leaving? Properly leaving." },
    { choice: [
      ["Every day.", [{ who: "tessa", t: "Liar. You think about it on Tuesdays, when the ink's dry and there's nothing left to copy." }]],
      ["Where would we even go?", [{ who: "tessa", t: "Anywhere that isn't here. Ashford. The coast. Somewhere with more than one tavern." }]],
      ["Oakhaven is home.", [{ who: "tessa", t: "It is. That's the awful part." }]],
    ] },
    { who: "tessa", t: "Tomas barred the north road. Wenna says the Curates are taking books again. Something's tightening, {name}, and I'd rather be moving when it does." },
    { who: "tessa", t: "Whatever happens, we go together. Promise me." },
    { choice: [
      ["I promise.", [{ who: "tessa", t: "Good. I'll hold you to it. I'm very good at holding people to things." }]],
      ["Let's survive tomorrow first.", [{ who: "tessa", t: "Spoilsport. Fine. Tomorrow, then. And then the world." }]],
    ] },
    { who: "narrator", t: "Tessa laughs and shoves your shoulder. For a moment Oakhaven feels exactly the size it should be." },
    { do: (c) => { c.set("metTessa", true); c.give("bread", 1); } },
    { who: "narrator", t: "You received Rye bread." },
  ],

  tessa: (c) => {
    const f = c.G.flags;
    if (f.d1_paid && !f.metTessa) return SCRIPTS.tessaMeet(c);
    if (!f.d1_paid) return [c.rot("tessa0", [
      "{name}! Has {mentor} let you off the leash yet? No? Poor thing.",
      "I'd wave but I'm carrying eleven mugs and a grudge.",
      "Come by the well when you're done. I'll be the one looking bored.",
    ])];
    const night = c.part === "Evening" || c.part === "Night";
    if (c.G.day === 2 && !f.d2_scene && !night) return [{ who: "tessa", t: "Come by the Hollow Oak tonight. Uncle Bram's doing the good stew, which means he's in a mood and I need a friendly face." }];
    return [c.rot("tessa" + (night ? "n" : "d"), night ? [
      "Uncle says if I drop one more mug it comes out of my wages. I told him I don't have wages. He said 'exactly.'",
      "Pip's got a new verse. It's worse than the others. I love it.",
      "Don't look now, but Ansel's been trying to impress me for twenty minutes. With a barrel. He's lifting a barrel. It's not working.",
    ] : [
      "Race you to the pond. No? Coward.",
      "Don't tell {mentor}, but I think she likes you. The way a rock likes rain.",
      "Ashford, the coast, anywhere. I've got a map in my head and it's mostly lies.",
      "You look tired. Eat something. Actually, take this. Never mind, it's gone. I ate it.",
    ])];
  },

  joss: (c) => {
    const f = c.G.flags;
    if (!f.joss_given) return [
      { who: "joss", t: "{name}! Just the pair of legs I need." },
      "Parcel for Wenna at Pike's. My wagon's down a wheel, and my knees are down a good deal more. Two coppers for the trouble. Wenna will likely tip you.",
      { choice: [
        ["Happy to help.", [
          { do: (c) => { c.give("parcel", 1); c.coins(2); c.set("joss_given", true); } },
          { who: "narrator", t: "You received Joss's parcel and 2 coppers." },
          "Good {kid}. Good apprentice.",
        ]],
        ["Not today.", ["Suit yourself. I'll be here. Complaining."]],
      ] },
    ];
    if (c.has("parcel")) return ["Wenna's waiting on that, {name}. Pike's Provisions, north side of the square."];
    return [c.rot("joss", [
      "The Covenant's tithe wagons are slower every month. They pay me by the day, and the roads get longer.",
      "Weaver inspectors rode out to Ashford last week. Four of them, grey cloaks, not a smile between them. I took the long way round.",
      "Carting's easy. It's the people who ask what's in the barrels that wear you out.",
      "Mind where you stand, {name}. No, not you. Folk like you are just... quicker blamed when a crate goes missing. That's all. Never mind.",
    ])];
  },

  lenna: (c) => {
    const f = c.G.flags;
    const lines = [
      "{name}! {name}! Guess what I saw. A crow. It was very large. Maybe it was two crows.",
      "Gran says I'm not allowed near the pond. The pond says otherwise.",
      "Tomas let me hold his helmet! It smelled like a boot.",
      "Are you going to be a master one day? Can you write me a story? A small one. A medium one.",
    ];
    if (!f.lenna_gift) return [
      { who: "lenna", t: "{name}! Look what I found by the river!" },
      "It's a lucky stone. I'm lending it to you, because you've got a face like it needs luck.",
      { choice: [
        ["Thanks, Lenna.", [
          { do: (c) => { c.give("pebble", 1); c.set("lenna_gift", true); } },
          { who: "narrator", t: "You received Lenna's lucky stone." },
          "You have to give it back. Eventually. Probably.",
        ]],
        ["Keep it, it's yours.", ["You're no fun. Fine. I'll keep it. But you're missing out."]],
      ] },
    ];
    return [c.rot("lenna", lines)];
  },

  garrick: (c) => {
    const f = c.G.flags;
    if (f.garrick_done) return [c.rot("garrick", [
      "Twenty years on the watch and the worst I ever saw was a goat in the chapel. Barley. Same goat. She's immortal.",
      "I walked the shore of the Dread Expanse once, when I was young. The fog doesn't roll. It waits.",
      "The Purifiers would burn the fog, the books and the lot, and call it clean. I've seen men like that. They never stop at the fog.",
      "I still say you were left on the steps of that house for a reason. Not a bad one. Folk can say what they like about guild children. I've watched you since you could hold a bucket.",
    ])];
    if (c.has("tonic")) return [
      { who: "garrick", t: "Is that a tonic? Bless you, {name}." },
      { do: (c) => { c.take("tonic", 1); c.coins(14); c.set("garrick_done", true); } },
      { who: "narrator", t: "You hand over the tonic and receive 14 coppers." },
      "Twelve for the bottle, two for being the only young person in Oakhaven who listens. I'll tell you about the Expanse some day.",
    ];
    if (!f.garrick_asked) return [
      { who: "garrick", t: "{name}. Your {mentor} still working you into the ground?" },
      "My knee's been at me since dawn. Bring me a tonic from Pike's and I'll pay you back with interest. Fourteen coppers, if you take a poor old watchman's word.",
      { do: (c) => c.set("garrick_asked", true) },
    ];
    return ["A tonic from Pike's, {name}. My knee won't mend itself."];
  },

  ansel: (c) => [c.rot("ansel", [
    "{name}! Heard {mentor} made you work through supper. Coopers get supper. Just saying.",
    "I can hoop a barrel faster than you can copy a page. Don't argue. I'll arm-wrestle you for it. Actually, no. Please don't.",
    "Tessa laughed at my joke yesterday. Possibly at me. Either way, progress.",
    "If the guild ever sends you to Ashford, take me. I'll carry things. And complain.",
  ])],

  hester: (c) => [c.rot("hester", [
    "{name}, love, you've got ink on your chin. Or soot. Hard to tell, with your lot.",
      "{name}, love, the guild children always eat last at the feast. Take the pie. I made two.",
    "Madder root from the south, woad from the coast. Do you know what a pound of true blue costs? More than your contract.",
    "Someone pinned a leaflet to the Ashford chapel door. Said the Weavers hoard the old words while the rest of us beg for scraps. The Curates tore it down by noon. Funny how fast they were.",
    "You're a good one, {name}. Don't let the guild make you small.",
  ])],

  delivery: (c, id) => {
    const lines = {
      tomas: "Horseshoes from {mentor}? Good. The watch horses have been going about barefoot like monks.",
      mayor: c.G.trade === "clerk" ? "The tithe ledger! And not a single blot. Well. Hardly any." : "A boundary marker! It shall stand at the edge of the square for a hundred years. I'll send a man for it.",
      bram: c.G.trade === "carp" ? "Chair legs! Lovely. Now I can stop telling folk the wobble is character." : "Turnips for the stew. Tell {mentor} it's paid, and that I'm not short this time.",
      wenna: "A cured hide, and only slightly smelly. Tell {mentor} I'll pay at the end of the month, same as always.",
    };
    return [
      { do: (c) => { c.take("delivery", 1); c.set("d1_delivered", true); } },
      { who: "narrator", t: "You hand over {product}." },
      lines[id] || "Thank you kindly.",
    ];
  },

  bedPlayer: (c) => {
    const f = c.G.flags, night = isNightT(c.G.time);
    if (f.d4_fire) return [{ who: "narrator", t: "There is no time. Smoke is in your lungs and something is wrong outside." }];
    if (c.G.day >= 4 && !f.d4_lost) return [{ who: "narrator", t: "Your cot. You could not sleep if you tried. Today is not finished with you." }];
    if (c.G.day === 1 && !f.d1_paid) return [{ who: "narrator", t: "Your cot. {mentor} will have words if you sleep before the work is done." }];
    if (c.G.day === 1 && !f.d1_maud) return [{ who: "narrator", t: "Your cot. {mentor} sent you to Old Maud in the North Woods. That comes first." }];
    if (f.d2_tome && !f.d2_study && night) return SCRIPTS.d2_study(c);
    if (f.d3_scene && !f.d3_study && night) return SCRIPTS.d3_study(c);
    const sceneDue = (c.G.day === 2 && !f.d2_scene) || (c.G.day === 3 && !f.d3_scene), studyDue = (f.d2_tome && !f.d2_study) || (f.d3_scene && !f.d3_study);
    const canSleep = !sceneDue && !studyDue;
    const opts = [];
    if (canSleep) opts.push(["Sleep until morning", [{ sleep: true }]]);
    if (!night) opts.push(["Rest until nightfall", [{ do: (c) => { c.setNight(true); } }, { who: "narrator", t: "You lie back and let the hours drift. When you sit up, the window has gone dark." }]]);
    if (!opts.length) return [{ who: "narrator", t: sceneDue ? (c.G.day === 3 ? "Your cot. The Arbitrator addresses the square today." : "Your cot. Tessa is expecting you at the Hollow Oak tonight.") : "Your cot. You are far too wound up to sleep." }];
    const lead = night ? "Your cot. Lumpy, but yours." : canSleep ? "Your cot. Nothing needs doing. You could sleep the day away." : "Your cot. " + (sceneDue ? "Tessa is expecting you at the Hollow Oak tonight." : "You can't settle yet.");
    return [{ who: "narrator", t: lead }, { choice: [...opts, ["Not yet", []]] }];
  },

  station: (c) => {
    const t = c.trade;
    if (c.G.day === 1 && !c.flag("d1_intro")) return [{ who: "narrator", t: "Better hear what {mentor} wants first." }];
    if (c.G.jobsToday >= 3) return [{ who: "narrator", t: "Your hand is cramped and the letters swim. Enough copying for one day." }];
    if (isNightT(c.G.time)) return [{ who: "narrator", t: "Too dark to work properly. It will keep until morning." }];
    return [{ who: "narrator", t: "{station_cap}. {job_name}?" }, { choice: [
      ["Start work", [{ job: true }]],
      ["Not now", []],
    ] }];
  },
};

/* Things you can look at */
const LOOK_TEXT = {
  bed_mentor: ["{mentor}'s bed. You value your life."],
  shelf0: ["Guild ledgers, a book of hymns to the Covenant, and an almanac with its star charts cut out.", "Records, accounts and contracts. Nothing a Curate would object to."],
  shelf1: ["Bottles of something brown. And something greener.", "Bottles of lamp oil, vinegar and what might be ale."],
  shelf2: ["Jars of salt, dried beans and lamp oil.", "Spools of thread, nails and a tin of wax."],
  fireplace: ["The fire crackles. Someone keeps it fed."],
  barrel: ["A barrel of rainwater.", "The barrel sloshes. Better not ask."],
  crate: ["Crates, stacked for reuse.", "A crate of odds and ends."],
  sack: ["A sack of grain, or possibly sand."],
  dresser: ["Somebody else's things. Better not."],
  well: ["The well water tastes of iron and old stone."],
  baskets: ["Yesterday's turnips, waiting for market."],
  vdesk: ["The curate's writing desk. A list of hymns, a list of tithes, and a list of names with lines through some of them."],
  desk: ["The mayor's desk. A letter on top reads: 'On the matter of the tithe, I remain your most humble servant.'"],
  pillar: [
    "The stone hums. You feel it in your teeth more than your ears.",
    "Inside its reach the leyline runs calm. Out past the trees, it does not.",
  ],
  barricade: ["A barricade of planks and rope. The watch has closed the roads. The wolves have been bold this year."],
  water: ["The stream runs cold and quick."],
  crops: ["Edda's turnip rows. Better leave them be."],
  door: ["Locked.", "Locked. Nobody answers.", "The door is barred from the inside."],
  altar: ["A plain stone table with a cracked clay cup and a thick candle. The Covenant's mark is scratched into the wood."],
  pew: ["A worn pew. Names have been carved into the back, then scratched out, then carved again."],
  offering: ["An offering box, padlocked. Somebody has scratched a small, rude drawing into the lid."],
  font: ["A basin of rainwater. Someone has left a goat hair in it."],
  vat: ["A vat of dye, deep blue. It stains your thumb on sight."],
  chest: ["A chest with an iron hasp. Locked, and you are not that kind of apprentice.", "The lid is heavy. Whatever is inside is somebody else's business."],
  books: ["A stack of almanacs and ledgers, foxed with damp.", "A prayer book of the Covenant, its spine cracked at the same page over and over."],
  jugs: ["Clay jugs. One smells of cider, one of vinegar, and one of something you decide not to investigate."],
  cauldron: ["It bubbles. It smells of nettles, iron and the inside of a cave.", "Something green turns over in the broth and looks at you. Probably a leaf."],
  herbs: ["Bundles of herbs drying from a beam: yarrow, feverfew, something bitter you don't know."],
  painting: ["A small painting, dark with smoke. Someone's grandmother, or someone's idea of one.", "A painted hillside under a weak sun. The paint is cracked like old mud."],
  shelfw: ["Jars of salt, honey and pickled things, labelled in three different hands."],
  tools: ["Hammer, tongs and a shovel, each hung in its own outline. Put them back where you found them."],
  firewood: ["Split logs, stacked neat. Someone takes pride in this."],
  firepit: ["A ring of blackened stones. The ash is cold, but not old.", "Someone cooked here and left in a hurry. Half a rabbit's ribs lie in the ashes."],
  leanto: ["A lean-to of branches and a torn oilcloth. Whoever slept here is not coming back for it.", "The bedroll inside is damp and smells of wolf."],
  deadlog: ["A fallen trunk, hollow and soft with rot. Beetles have the run of it.", "Moss, rot and a gap underneath. A good place to hide something."],
  bones: ["Old bones, cracked for the marrow. Deer, mostly. Mostly.", "Gnawed clean. Something large lairs near here."],
};

/* Day 1 work orders, shown in the HUD and the menu */
function taskListMain(G, ctx) {
  const t = TRADES[G.trade], f = G.flags;
  const has = (k) => (G.items[k] || 0) > 0;
  if (!f.d1_paid) {
    const list = [{ text: `Work at ${t.stationName}`, done: !!f.d1_job }];
    if (f.d1_order) {
      list.push({ text: `Deliver ${t.productName} to ${ctx.npcName(t.recipient)}`, done: !!f.d1_delivered, hint: f.d1_delivered ? "" : ctx.where(t.recipient) });
      list.push({ text: "Buy a tallow candle at Pike's Provisions", done: has("candle") });
      list.push({ text: `Report back to ${G.mentorName}`, done: false });
    }
    return list;
  }
  const evening = isNightT(G.time);
  if (G.day === 1) {
    const l = [];
    if (!f.d1_sword && !f.d1_maud) l.push({ text: "Fetch the old sword from the storeroom chest", done: false, hint: `In ${G.mentorName}'s copy house, through the east door` });
    if (!f.d1_maud) l.push({ text: "Take the sealed letter to Old Maud", done: false, hint: f.d4_open ? "North Woods, at the end of the trail" : "Show the seal at the north barricade" });
    else if (!f.d1_report) l.push({ text: `Tell ${G.mentorName} what Maud said`, done: false, hint: ctx.where("mentor") });
    l.push({ text: "Sleep in your cot", done: false, hint: f.d1_maud ? "The woods are yours to roam first, if you like" : "" });
    return l;
  }
  if (G.day === 2 && !f.d2_study) {
    const l = [];
    if (!f.d2_errand) l.push({ text: `Talk to ${G.mentorName}`, done: false, hint: ctx.where("mentor") });
    else if (!f.d2_errand_done) l.push({ text: "Fetch lamp oil from Pike's Provisions", done: has("oil"), hint: has("oil") ? `Bring it to ${G.mentorName}` : ctx.where("wenna") });
    if (!f.d2_scene) l.push({ text: "Spend the evening with Tessa at the Hollow Oak", done: false, hint: evening ? "The Hollow Oak, on the square" : "At night: rest, or switch to night in town" });
    else l.push({ text: "Take the bundle home and read it after dark", done: false, hint: evening ? `Your cot is in ${buildVars(G).shop_name}` : "" });
    return l;
  }
  if (f.d5_ash) return [{ text: "Speak with the survivors by the Pillar", done: false, hint: "Beside the Pillar in the square" }, { text: "Act One ends here. The road to Ashford opens next.", done: false }];
  if (f.d4_fire) return [{ text: f.d4_lost ? "Rest" : "Reach the workshop", done: false, hint: "It is burning" }];
  if (G.day === 4) {
    const l = [];
    if (!f.d4_errand) l.push({ text: `Talk to ${G.mentorName}`, done: false, hint: ctx.where("mentor") });
    else if (!f.d4_bargain) l.push({ text: "Fetch the charm from Old Maud", done: false, hint: "North Woods, at the end of the trail" });
    else if (!f.d4_maud && !has("mooncap")) l.push({ text: "Find a moon-cap in the sealed cave", done: false, hint: f.moved_seal ? "Deep inside the far cave, south of town" : "Southern Rocks, the far cave. Cast Bary-is by the rubble" });
    else if (!f.d4_maud) l.push({ text: "Bring the moon-cap to Old Maud", done: false, hint: "North Woods, at the end of the trail" });
    else l.push({ text: "Return to Oakhaven", done: false, hint: "Hurry" });
    return l;
  }
  if (G.day === 3 && !f.d3_study) {
    const l = [];
    if (!f.d3_mentor) l.push({ text: `Talk to ${G.mentorName}`, done: false, hint: ctx.where("mentor") });
    if (!f.d3_scene) l.push({ text: "Attend the Arbitrator's address in the square", done: false, hint: f.d3_mentor ? (evening ? "In daylight" : "The square, by the Pillar") : "Talk to your mentor first" });
    else { l.push({ text: "Read the tome after dark", done: false, hint: evening ? `Your cot is in ${buildVars(G).shop_name}` : "Rest until nightfall, or switch to night" }); l.push({ text: "The south road is open: the Southern Rocks and their caves", done: false, hint: "Optional" }); }
    return l;
  }
  const work = { text: `Work at ${t.stationName} (${Math.min(3, G.jobsToday)} of 3 today)`, done: G.jobsToday >= 3 };
  const sleep = { text: "Sleep in your cot after dark", done: false, hint: evening ? `Your cot is in ${buildVars(G).shop_name}` : "" };
  const list = evening ? [sleep, work] : [work, sleep];
  if (!f.metTessa) list.unshift({ text: "Find Tessa Hollis", done: false, hint: ctx.where("tessa") });
  return list;
}

/* ------------------------------------------------------------------ */
/* Side quests: small favours around town. Each hook runs before the   */
/* villager's ordinary talk and returns a script, or null to fall through */
/* ------------------------------------------------------------------ */
const bloomCount = (f) => ["b1", "b2", "b3"].filter((k) => f["bloom_" + k]).length;
const SIGN_PATROL = { "12,17": "patrol_w", "44,17": "patrol_e", "25,6": "patrol_n" };
const patrolCount = (f) => ["patrol_w", "patrol_e", "patrol_n"].filter((k) => f[k]).length;

const QUEST_HOOKS = {
  maud: (c) => {
    const f = c.G.flags;
    if (f.d1_witch && !f.d1_maud) return [
      { who: "maud", t: "The wolves didn't eat you. Pity. I'd have had the pelts." },
      { who: "maud", t: "Well? You've walked all this way to stand in my door like a post. What's that in your hand?" },
      { do: (c) => { c.take("letter", 1); } },
      { who: "narrator", t: "She breaks the guild seal and reads. The firelight moves in her face. She reads it twice." },
      { who: "maud", t: "A ward. For her door. She hasn't asked me for anything in fifteen years, and now she wants a ward." },
      { choice: [
        ["What's she afraid of?", [{ who: "maud", t: "She didn't write that down, and I didn't ask. Folk who need wards don't like questions." }]],
        ["Can you make it?", [{ who: "maud", t: "Can I make it. Child, I was making wards when your guild was three men and a rumour." }]],
      ] },
      { who: "maud", t: "Rowan, cut at the dark of the moon, and bound three nights. Come back in three days. Not two. Three." },
      { who: "maud", t: "And while you're in my woods, pick what you like. Yarrow sells in town. Wolves sell better, if you can get the pelts off them." },
      { do: (c) => c.set("d1_maud") },
      { who: "narrator", t: "New: the North Woods are open to you. Herbs, pelts and odd finds sell at Pike's Provisions." },
    ];
    if (f.d4_errand && !f.d4_bargain) return [
      { who: "maud", t: "Three days. You can count, then. Good." },
      { who: "maud", t: "The charm's bound, near enough. It wants one more thing to close it, and I haven't got it. A moon-cap." },
      { who: "maud", t: "A pale mushroom. Grows in the dark under the southern rocks, where the old quarry was. The only patch I know of is in the far cave, the one at the end of the road." },
      { choice: [
        ["That cave is blocked. Rubble fills the mouth.", [{ who: "maud", t: "I know. I watched it come down, thirty years ago. A man died under it, and the quarry closed." }]],
        ["Why can't you fetch it?", [{ who: "maud", t: "Because my knees are older than your guild. And because of the rubble." }]],
      ] },
      { who: "player", t: "Nobody could shift that rubble. Not in a week." },
      { who: "maud", t: "Nobody with a shovel." },
      { cue: [["emote", "maud", "...", 1.6]], wait: 1400 },
      { who: "maud", t: "You've been reading something you shouldn't. Don't lie to me. It's on you like the smell of a struck flint." },
      { who: "maud", t: "So. One word, from me, and you never heard it from me. Bary. Weight. The pull the ground has on everything." },
      { who: "maud", t: "Say it small, with the ending you already have. Bary-is. Not to hurt. To lean. Stone wants to fall. Give it somewhere better to fall to." },
      { do: (c) => { c.learn({ r: ["Bary"] }); c.set("d4_bargain"); } },
      { who: "narrator", t: "New word: Bary, weight. Stand by the rubble and cast Bary-is from the cast button to move it." },
      { who: "maud", t: "Moon-cap. One. And come straight back. The light's wrong today." },
    ];
    if (f.d4_bargain && !f.d4_maud && !c.has("mooncap")) return [{ who: "maud", t: "No moon-cap, no charm. The far cave, south. Bary-is, and lean." }];
    if (f.d4_bargain && !f.d4_maud) return [
      { who: "maud", t: "Give it here. Gently. It bruises like a peach." },
      { do: (c) => { c.take("mooncap", 1); } },
      { who: "narrator", t: "She crumbles the cap over the rowan and red thread. The bundle drinks the blue light and goes still." },
      { who: "maud", t: "There. A ward, closed. Tell her it will keep out what knocks. It will not keep out what has already been invited in." },
      { who: "maud", t: "The leyline's wrong today. It smells like a struck flint. Out past the pillars the surges come and go like a bad tooth. Did you feel it?" },
      { do: (c) => { c.give("charm", 1); c.set("d4_maud"); } },
      { who: "narrator", t: "You received the rowan charm." },
      { who: "maud", t: "Go home. Fast. And child: if you live through tonight, come and find me. There's more under that fog than anyone has told you." },
    ];
    return null;
  },
  edda: (c) => {
    const f = c.G.flags;
    if (!f.d1_paid || f.q_goat_done) return null;
    if (!f.q_goat) return [
      { who: "edda", t: "{name}! You have young legs and no better plans. Barley's gone again." },
      "Brown goat, bad temper, answers to nothing. She isn't lost, she's exploring. But the exploring has got to stop before my turnips are explored too.",
      { choice: [
        ["I'll look for her.", [{ do: (c) => c.set("q_goat") }, { who: "narrator", t: "New task: find Edda's goat, Barley." }, "She'll be somewhere with grass and no fences. Which is everywhere. Good luck."]],
        ["Not today.", ["Hm. Barley will be disappointed. She won't show it."]],
      ] },
    ];
    if (f.q_goat_found) return [
      { who: "edda", t: "Barley's back in the field, chewing like nothing happened. She's got your smell on her, so I'd guess you found her." },
      { do: (c) => { c.coins(4); c.give("bread", 1); c.set("q_goat_done"); } },
      { who: "narrator", t: "You received 4 coppers and a loaf of rye bread." },
      "Take it. It's what I'd have paid in turnips, only warmer.",
    ];
    return [{ who: "edda", t: "Still no Barley? Try somewhere with grass and no fences. Which is everywhere. Sorry." }];
  },
  hester: (c) => {
    const f = c.G.flags;
    if (!f.d1_paid || f.q_dye_done) return null;
    if (!f.q_dye) return [
      { who: "hester", t: "{name}, love, you've got young eyes. I need three riverblooms, the small blue ones that grow along the bank." },
      "The petals give a blue no coast woad can match. I can't kneel on that bank any more, my knees have opinions.",
      { choice: [
        ["I'll fetch them.", [{ do: (c) => c.set("q_dye") }, { who: "narrator", t: "New task: pick three riverblooms along the west bank of the river." }, "Bless you. Mind the wolves. They like the river too."]],
        ["Sorry, busy.", ["Of course. Everyone is."]],
      ] },
    ];
    const n = bloomCount(f);
    if (n >= 3) return [
      { who: "hester", t: "Oh, look at those. Look at that colour!" },
      { do: (c) => { c.coins(6); c.set("q_dye_done"); } },
      { who: "narrator", t: "You received 6 coppers." },
      "A true blue. The first I've had since my mother died. Keep your head up, {name}.",
    ];
    return [{ who: "hester", t: `Riverblooms, love: three of them, small and blue, along the west bank. You have ${n} so far.` }];
  },
  ansel: (c) => {
    const f = c.G.flags;
    if (!f.d1_paid || f.q_candle_done) return null;
    if (!f.q_candle) return [
      { who: "ansel", t: "{name}! Quick. Not a word to Tessa. I need a tallow candle." },
      "It's for a poem. I write at night when nobody can hear me failing. Pike's wants three coppers and I want to keep my dignity as well as my coppers. Buy one for me and I'll make it worth it.",
      { choice: [
        ["Fine, I'll bring one.", [{ do: (c) => c.set("q_candle") }, { who: "narrator", t: "New task: bring Ansel a tallow candle from Pike's Provisions." }, "You're a saint. A small, judgemental saint."]],
        ["Write it in the dark.", ["It's how the greats did it. Probably."]],
      ] },
    ];
    if (c.has("candle")) return [
      { who: "ansel", t: "That's it. That's the candle." },
      { do: (c) => { c.take("candle", 1); c.coins(6); c.set("q_candle_done"); } },
      { who: "narrator", t: "You received 6 coppers." },
      "Don't ask to read it. It's about barrels. Mostly barrels.",
    ];
    return [{ who: "ansel", t: "A tallow candle, {name}. From Pike's. I have never needed anything so badly." }];
  },
  tomas: (c) => {
    const f = c.G.flags;
    if (!f.d1_paid || f.q_patrol_done || c.part === "Night") return null;
    if (!f.q_patrol) return [
      { who: "tomas", t: "You. Apprentice. You look like you can read." },
      "I can't leave the square, and the notice posts at the edges of town need checking. West road, east road, north road. Read each one and make sure nobody's tampered with it. Six coppers when you report back.",
      { choice: [
        ["I'll do it.", [{ do: (c) => c.set("q_patrol") }, { who: "narrator", t: "New task: read the notices on the west, east and north roads for Tomas." }, "Stay on the road. Wolves have been bold lately."]],
        ["Not today.", ["Suit yourself. Crime doesn't take days off, but I'm told I can."]],
      ] },
    ];
    if (patrolCount(f) >= 3) return [
      { who: "tomas", t: "All three? Nobody's scratched them, nobody's pinned leaflets over them?" },
      { do: (c) => { c.coins(6); c.set("q_patrol_done"); } },
      { who: "narrator", t: "You received 6 coppers." },
      "Good. Boring is good. Boring means nobody died.",
    ];
    return [{ who: "tomas", t: `West, east and north notice posts. You've read ${patrolCount(f)} of three.` }];
  },
  pip: (c) => {
    const f = c.G.flags;
    if (!f.d1_paid || f.q_verse_done) return null;
    const right = (n) => [{ who: "pip", t: n }, { do: (c) => { c.set("q_verse_" + (c.flag("q_verse_a") ? "b" : "a")); } }];
    if (!f.q_verse_a) return [
      { who: "pip", t: "A face that has not heard 'The Fall of the Middle Sea' yet. Wonderful. Settle a bet for me, would you?" },
      "I'm stuck on a verse. 'Where the lamps burn low and the ale runs cold, we sing of the heroes brave and...' what?",
      { choice: [
        ["...bold.", [{ do: (c) => c.set("q_verse_a") }, "Bold! Yes. Of course. I've been trying 'sturdy' since Tuesday."]],
        ["...young.", ["Young? It doesn't rhyme. Though neither do most of my verses, and Bram still pays me."]],
        ["...brief.", ["Brief. They are never brief. That's the problem."]],
      ] },
    ];
    if (!f.q_verse_b) return [
      { who: "pip", t: "Back for more? Good. Second line: 'The fog came in at the close of day, and took the ships that sailed...'" },
      { choice: [
        ["...away.", [{ do: (c) => { c.set("q_verse_b"); c.coins(4); c.set("q_verse_done"); } }, { who: "narrator", t: "You received 4 coppers." }, "Away. The ships, sailed away. I'm a fool. Bless you, {name}. It'll go in tonight's set, and I'll even mention you. Maybe."]],
        ["...by sea.", ["By sea? Where else would a ship sail? Over the hills?"]],
        ["...slowly.", ["Slowly. Hm. It scans like a wagon with a broken wheel."]],
      ] },
    ];
    return null;
  },
};

/* what you can pick, read or find out in the open */
SCRIPTS.look_goat = (c) => {
  const f = c.G.flags;
  if (f.q_goat_found) return [{ who: "narrator", t: "Barley chews placidly, entirely unrepentant." }];
  if (!f.q_goat) return [{ who: "narrator", t: "A brown goat with an air of grievance. She watches you chew a long thought, then goes back to the grass." }];
  return [
    { who: "narrator", t: "A brown goat with a bad temper and the look of someone who knows she's been found." },
    { who: "narrator", t: "You wave a handful of grass. Barley considers this for a long, insulting moment, then follows you at a walk, as if it were her idea." },
    { do: (c) => c.set("q_goat_found") },
    { who: "narrator", t: "Barley will find her own way back to the turnip field. Tell Edda." },
  ];
};
SCRIPTS.look_rubble = (c) => {
  const f = c.G.flags;
  if (f.d4_bargain) return [{ who: "narrator", t: "Rubble chokes the cave mouth, wall to wall. Stand close and cast Bary-is." }];
  return [{ who: "narrator", t: "Rubble chokes the cave mouth, wall to wall. No shovel would shift this in a week. A cold draught breathes out between the stones." }];
};
SCRIPTS.look_shroom = (c) => {
  if (c.has("mooncap") || c.flag("d4_maud")) return [{ who: "narrator", t: "Pale moon-caps glow in the dark. Maud only needs the one." }];
  return [
    { do: (c) => { c.give("mooncap", 1); c.set("got_mooncap"); } },
    { who: "narrator", t: "Moon-caps, pale as bone, glowing a cold blue from underneath. You ease the largest one free. It is colder than the air." },
    { who: "narrator", t: "You received a moon-cap." },
  ];
};
SCRIPTS.look_herbpatch = (c, id) => {
  const k = "herb_" + id;
  if (c.G.flags[k] === c.G.day) return [{ who: "narrator", t: "Picked clean. It will come back by tomorrow." }];
  return [
    { do: (c) => { c.set(k, c.G.day); c.give("yarrow", 1); } },
    { who: "narrator", t: "You cut a bundle of yarrow and feverfew. Wenna will pay for it." },
  ];
};
const CHEST_LOOT = {
  c_camp: [6, { poultice: 1 }], c_blind: [3, { tonic: 1 }], c_den: [9, { fang: 2 }], c_butte: [5, { token: 1 }],
  c_stock: [3, { jerkin: 1 }], c_study: [6, { poultice: 1 }], c_guest: [4, { ironcap: 1 }], c_vestry: [2, { medal: 1 }], c_bed: [5, {}], c_dye: [3, { yarrow: 1 }],
  c_a: [8, { token: 1, poultice: 1 }], c_b: [10, { tonic: 1, token: 1 }], c_c: [7, { token: 2 }], c_d: [6, { fang: 2, poultice: 1 }], c_s: [12, { tonic: 2 }], c_ruin: [8, { token: 1, tonic: 1 }], c_grove: [25, { thornwake: 1 }],
};
SCRIPTS.look_door = (c) => (c.G.flags.d4_fire && !c.G.flags.d5_ash
  ? [{ who: "narrator", t: c.rot("look:fire_door", ["The door is wreathed in flame. The heat drives you back a step.", "Fire roars behind the planks. Nobody is going in there.", "The latch is too hot to touch. Smoke pours from every crack."]) }]
  : [{ who: "narrator", t: c.rot("look:door", LOOK_TEXT.door) }]);
SCRIPTS.look_chest = (c, id) => {
  if (id === "c_sword") {
    if (c.flag("chest_c_sword")) return [{ who: "narrator", t: "Empty. The oilcloth it was wrapped in is still folded in the corner." }];
    return [
      { who: "narrator", t: "The lid sticks, then gives. Under a fold of oilcloth, a sword, plain and old, with a leather-wrapped grip worn dark by somebody else's hand." },
      { do: (c) => { c.set("chest_c_sword"); c.set("d1_sword"); c.give("oldsword", 1); } },
      { who: "narrator", t: "You take the old sword. It is heavier than it looks. You can swap gear any time in your Pack." },
    ];
  }
  const loot = id && CHEST_LOOT[id];
  if (!loot) return [{ who: "narrator", t: c.rot("look:chest", LOOK_TEXT.chest) }];
  if (c.flag("chest_" + id)) return [{ who: "narrator", t: "Empty. Somebody got here first, and it was you." }];
  const [coins, items] = loot, names = Object.keys(items).map((k) => `${items[k] > 1 ? items[k] + " × " : ""}${ITEMS[k].name.toLowerCase()}`);
  return [
    { do: (c) => { c.set("chest_" + id); c.coins(coins); for (const k in items) c.give(k, items[k]); } },
    { who: "narrator", t: `The hasp is rusted through. Inside: ${coins} coppers${names.length ? ", " + names.join(", ") : ""}.` },
  ];
};
SCRIPTS.look_bloom = (c, id) => {
  const f = c.G.flags, k = "bloom_" + id;
  if (!f.q_dye) return [{ who: "narrator", t: "Small blue riverblooms, nodding over the water." }];
  if (f[k]) return [{ who: "narrator", t: "You've already picked these." }];
  return [
    { do: (c) => c.set(k) },
    { who: "narrator", t: `You pick a handful of riverblooms (${bloomCount({ ...f, [k]: true })} of 3).` },
  ];
};

function sideTasks(G, ctx) {
  const f = G.flags, out = [];
  if (!f.d1_paid) return out;
  if (f.q_goat && !f.q_goat_done) out.push({ text: "Find Edda's goat, Barley", done: !!f.q_goat_found, hint: f.q_goat_found ? "Tell Edda" : "Grass, and no fences" });
  if (f.q_dye && !f.q_dye_done) out.push({ text: "Pick three riverblooms for Hester", done: bloomCount(f) >= 3, hint: `${bloomCount(f)} of 3 · west bank` });
  if (f.q_candle && !f.q_candle_done) out.push({ text: "Bring Ansel a tallow candle", done: (G.items.candle || 0) > 0, hint: "Pike's Provisions" });
  if (f.q_patrol && !f.q_patrol_done) out.push({ text: "Check the notice posts for Tomas", done: patrolCount(f) >= 3, hint: `${patrolCount(f)} of 3 · west, east, north` });
  return out;
}
function taskList(G, ctx) { return [...taskListMain(G, ctx), ...sideTasks(G, ctx)]; }

/* tavern dice: who will sit down and play, and how they carry it */
const DICE_FOLK = {
  bram: { name: "Bram", win: "House always wins. Eventually. Mostly.", lose: "Hah! Don't tell my wife.", push: "Even. Dull. Again?" },
  tomas: { name: "Tomas", win: "Fair and square. I'd have to arrest myself otherwise.", lose: "That's... unusual. I'm not going to write that down.", push: "A tie. The law remains undecided." },
  garrick: { name: "Garrick", win: "Forty years of cards and dice. You'll get there, {kid}.", lose: "Beginner's luck! Don't get used to it.", push: "A tie. Even the dice can't decide." },
  edda: { name: "Edda", win: "Turnips and dice, those are my two strengths.", lose: "My dice always come up purple on one side too.", push: "Even. Like my turnips." },
  wenna: { name: "Wenna", win: "Pleasure doing business.", lose: "Hmph. I'll put that on your tab.", push: "A tie. How dull." },
};


/* The north barricade opens for the Day 4 errand; after the fire the town is rubble. */
const WORLD_DYNAMIC = ["oak", "rocks"];
function worldDef(id, flags) {
  const base = MAP_DEFS[id];
  if (!base || !flags) return base;
  if (id === "rocks") return flags.moved_seal ? { ...base, props: base.props.filter((p) => p.id !== "seal") } : base;
  if (id !== "oak" || (!flags.d4_open && !flags.south_open && !flags.d5_ash && !flags.d4_fire)) return base;
  let rows = base.rows, warps = base.warps;
  if (flags.d4_open) rows = rows.map((r, y) => (y === 1 ? r.slice(0, 23) + "==" + r.slice(25) : r));
  if (flags.south_open) rows = rows.map((r, y) => (y === 58 ? r.slice(0, 23) + "==" + r.slice(25) : r));
  if (flags.d5_ash) {
    rows = rows.map((r, y) => r.split("").map((ch, x) => ("RWwD".includes(ch) ? ((x * 7 + y * 3) % 5 === 0 ? "r" : ",") : ch)).join(""));
    warps = warps.filter((w) => w.to === "wood" || w.to === "rocks");
  }
  if (flags.d4_fire && !flags.d5_ash) warps = warps.filter((w) => w.to === "wood" || w.to === "rocks");   // every door is ablaze
  return { ...base, rows, warps, burning: !!(flags.d4_fire && !flags.d5_ash), doorKinds: flags.d5_ash ? {} : base.doorKinds };
}

const ASH_TALK = {
  tessa: ["The Arbitrator says Ashford. I say Ashford. For once we agree.", "I keep looking for the Hollow Oak's sign. Then I remember."],
  tomas: ["I should have been at the shop. I was at the barricade. Hold that thought, Tomas, don't let it grow.", "The Covenant will send someone. The Covenant always sends someone. They are always late."],
  bram: ["The Hollow Oak is a hole in the ground with a chimney. Tessa's all I have left of it.", "Eat something. Everyone eats. That is the only rule I have left."],
  wenna: ["Fire took the shop. It did not take my ledgers. I keep them in my head. Do not tell the Covenant."],
  mayor: ["Everything I built... a house, an office... all the paper. Tell me, {name}, why does paper burn so willingly?"],
  edda: ["Turnips survive anything. People are the ones who don't."],
};
