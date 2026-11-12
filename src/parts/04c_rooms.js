/* ------------------------------------------------------------------ */
/* Extra interior rooms. 'd' is an inner doorway tile in a wall.      */
/* ------------------------------------------------------------------ */
(function () {
  const door = (id, x, y) => { const r = MAP_DEFS[id].rows; r[y] = r[y].slice(0, x) + "d" + r[y].slice(x + 1); };
  const link = (a, ax, ay, b, bx, by, dir) => {
    const bdx = bx + (dir === "right" ? -1 : 1), back = dir === "right" ? "left" : "right";
    door(a, ax, ay); door(b, bdx, by);
    MAP_DEFS[a].warps.push({ x: ax, y: ay, to: b, tx: bx, ty: by, dir });
    MAP_DEFS[b].warps.push({ x: bdx, y: by, to: a, tx: ax + (dir === "right" ? -1 : 1), ty: ay, dir: back });
  };
  const room = (id, name, rows, props) => { MAP_DEFS[id] = { name, outside: false, rows, props, warps: [] }; };
  const G = (w, h, f = "o") => Array.from({ length: h }, (_, y) => (y === 0 ? "XUUYUUUUUUUUUUUUUUUU".slice(0, w - 1) + "X" : y === 1 ? "X" + "L".repeat(w - 2) + "X" : y === h - 1 ? "X".repeat(w) : "X" + f.repeat(w - 2) + "X"));

  // mentor's shop -> storeroom (the old sword chest)
  room("shop_store", "Storeroom", G(9, 8), [
    { p: "shelf", x: 1, y: 2, v: 0 }, { p: "shelf", x: 2, y: 2, v: 2 }, { p: "chest", x: 4, y: 2, id: "c_sword" }, { p: "crate", x: 6, y: 2 }, { p: "crate", x: 7, y: 2 }, { p: "crate", x: 7, y: 3 },
    { p: "barrel", x: 1, y: 6 }, { p: "barrel", x: 2, y: 6 }, { p: "sack", x: 3, y: 6 }, { p: "straw", x: 6, y: 5 }, { p: "candles", x: 7, y: 6 }, { p: "tools", x: 5, y: 0 },
    { p: "lantern", x: 3, y: 0 }, { p: "lantern", x: 6, y: 0 },
  ]);
  link("shop", 13, 6, "shop_store", 1, 4, "right");

  // Pike's -> stockroom
  room("store_back", "Pike's Stockroom", G(11, 8, "s"), [
    { p: "barrel", x: 1, y: 2 }, { p: "barrel", x: 2, y: 2 }, { p: "barrel", x: 3, y: 2 }, { p: "crate", x: 8, y: 2 }, { p: "crate", x: 9, y: 2 }, { p: "crate", x: 9, y: 3 },
    { p: "sack", x: 1, y: 6 }, { p: "sack", x: 2, y: 6 }, { p: "shelf", x: 5, y: 2, v: 2 }, { p: "shelf", x: 6, y: 2, v: 1 }, { p: "chest", x: 9, y: 5, id: "c_stock" },
    { p: "jugs", x: 9, y: 6 }, { p: "herbs", x: 7, y: 0 }, { p: "lantern", x: 4, y: 0 }, { p: "lantern", x: 9, y: 0 }, { p: "straw", x: 6, y: 5 },
  ]);
  link("store", 11, 5, "store_back", 1, 5, "right");

  // Mayor's house -> study
  room("hall_study", "The Mayor's Study", G(9, 7), [
    { p: "desk", x: 3, y: 3 }, { p: "chair", x: 3, y: 5 }, { p: "shelf", x: 1, y: 2, v: 0 }, { p: "shelf", x: 2, y: 2, v: 0 }, { p: "shelf", x: 6, y: 2, v: 1 }, { p: "shelf", x: 7, y: 2, v: 0 },
    { p: "painting", x: 4, y: 0 }, { p: "books", x: 7, y: 5 }, { p: "candles", x: 1, y: 5 }, { p: "plant", x: 7, y: 3 }, { p: "lantern", x: 2, y: 0 }, { p: "lantern", x: 6, y: 0 }, { p: "chest", x: 7, y: 4, id: "c_study" },
  ]);
  link("hall", 11, 5, "hall_study", 1, 4, "right");

  // tavern -> kitchen (west) and guest room (east)
  room("tavern_kitchen", "Hollow Oak Kitchen", G(10, 8, "s"), [
    { p: "fireplace", x: 4, y: 0 }, { p: "table", x: 5, y: 4, v: 2 }, { p: "barrel", x: 1, y: 2 }, { p: "barrel", x: 2, y: 2 }, { p: "shelf", x: 7, y: 2, v: 2 }, { p: "shelf", x: 8, y: 2, v: 1 },
    { p: "sack", x: 1, y: 6 }, { p: "sack", x: 2, y: 6 }, { p: "jugs", x: 7, y: 6 }, { p: "herbs", x: 3, y: 0 }, { p: "crate", x: 8, y: 5 }, { p: "lantern", x: 7, y: 0 },
  ]);
  link("tavern", 0, 5, "tavern_kitchen", 8, 4, "left");
  room("tavern_guest", "Hollow Oak Guest Room", G(10, 8), [
    { p: "bed", x: 2, y: 2, v: 0 }, { p: "bed", x: 7, y: 2, v: 0 }, { p: "dresser", x: 4, y: 2 }, { p: "chest", x: 8, y: 5, id: "c_guest" }, { p: "candles", x: 3, y: 6 }, { p: "chair", x: 5, y: 5 },
    { p: "plant", x: 8, y: 6 }, { p: "lantern", x: 3, y: 0 }, { p: "lantern", x: 6, y: 0 },
  ]);
  link("tavern", 17, 5, "tavern_guest", 1, 4, "right");

  // chapel -> vestry
  room("chapel_vestry", "Chapel Vestry", G(8, 6, "s"), [
    { p: "desk", x: 2, y: 3, lk: "vdesk" }, { p: "shelf", x: 1, y: 2, v: 0 }, { p: "shelf", x: 2, y: 2, v: 0 }, { p: "books", x: 5, y: 2 }, { p: "candles", x: 1, y: 4 }, { p: "chest", x: 5, y: 4, id: "c_vestry" },
    { p: "lantern", x: 3, y: 0 }, { p: "plant", x: 6, y: 4 },
  ]);
  link("chapel", 11, 3, "chapel_vestry", 1, 3, "right");

  // cottages -> back rooms
  room("cottage_g_bed", "Garrick's Bedroom", G(8, 6), [
    { p: "bed", x: 6, y: 2, v: 0 }, { p: "dresser", x: 3, y: 2 }, { p: "chest", x: 5, y: 2, id: "c_bed" }, { p: "candles", x: 4, y: 4 }, { p: "chair", x: 2, y: 4 }, { p: "lantern", x: 3, y: 0 }, { p: "tools", x: 1, y: 0 },
  ]);
  link("cottage_g", 9, 4, "cottage_g_bed", 1, 3, "right");
  room("cottage_h_back", "Dye Store", G(8, 6), [
    { p: "cloths", x: 3, y: 0 }, { p: "cloths", x: 4, y: 0 }, { p: "barrel", x: 1, y: 2, lk: "vat" }, { p: "barrel", x: 2, y: 2, lk: "vat" }, { p: "baskets", x: 5, y: 2 }, { p: "jugs", x: 5, y: 4 },
    { p: "crate", x: 4, y: 4 }, { p: "sack", x: 1, y: 4 }, { p: "chest", x: 6, y: 4, id: "c_dye" }, { p: "lantern", x: 6, y: 0 },
  ]);
  link("cottage_h", 9, 4, "cottage_h_back", 1, 3, "right");
  room("cottage_e_back", "Farm Pantry", G(8, 6), [
    { p: "sack", x: 1, y: 2 }, { p: "baskets", x: 2, y: 2 }, { p: "baskets", x: 4, y: 2 }, { p: "crate", x: 6, y: 2 }, { p: "sack", x: 2, y: 4 }, { p: "barrel", x: 1, y: 4 }, { p: "barrel", x: 6, y: 4 },
    { p: "jugs", x: 4, y: 4 }, { p: "herbs", x: 2, y: 0 }, { p: "lantern", x: 5, y: 0 },
  ]);
  link("cottage_e", 9, 4, "cottage_e_back", 1, 3, "right");
  room("hut_loft", "Maud's Drying Loft", G(8, 6), [
    { p: "herbs", x: 1, y: 0 }, { p: "herbs", x: 3, y: 0 }, { p: "herbs", x: 4, y: 0 }, { p: "shelf", x: 1, y: 2, v: 2 }, { p: "shelf", x: 2, y: 2, v: 1 }, { p: "baskets", x: 5, y: 2 },
    { p: "jugs", x: 5, y: 4 }, { p: "sack", x: 1, y: 4 }, { p: "candles", x: 3, y: 4 }, { p: "lantern", x: 6, y: 0 },
  ]);
  link("hut", 9, 4, "hut_loft", 1, 3, "right");
})();
