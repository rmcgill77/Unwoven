import os
import asyncio, json
from playwright.async_api import async_playwright
JS = r"""
(() => {
  const D = __durinn.data(), E = __durinn.eng, S = E.debugState();
  const SOL = new Set(D.SOLID_TILES), PD = D.PROP_DEFS, out = [];
  const VEC = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const ids = Object.keys(D.MAP_DEFS);
  // arrivals per map from every warp anywhere
  const arr = {}; ids.forEach((id) => arr[id] = []);
  ids.forEach((id) => (D.MAP_DEFS[id].warps || []).forEach((w) => { if (arr[w.to]) arr[w.to].push([w.tx, w.ty, id]); }));
  const res = {};
  for (const id of ids) {
    const def = D.MAP_DEFS[id]; if (!def.rows) continue;
    const rows = def.rows, h = rows.length, w = rows[0].length;
    const at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? null : rows[y][x]);
    const solid = Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => SOL.has(rows[y][x])));
    const props = [...(def.props || []), ...((def.stations && def.stations[S.G ? S.G.trade : "clerk"]) || [])];
    const propAt = {};
    for (const p of props) { const pd = PD[p.p]; if (!pd) { out.push(`${id}: prop type ${p.p} has no definition`); continue; }
      for (let j = 0; j < pd.fh; j++) for (let i = 0; i < pd.fw; i++) { propAt[`${p.x+i},${p.y+j}`] = p; if (!pd.wall && !pd.deco && solid[p.y+j]) solid[p.y + j][p.x + i] = true; } }
    if (def.outside) for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (rows[y][x] === "D" && !(def.warps || []).some((q) => q.x === x && q.y === y)) solid[y][x] = true;
    // warp tiles are walkable triggers
    const starts = arr[id].map((a) => [a[0], a[1]]);
    if (id === "shop" && def.spawnBed) starts.push([def.spawnBed.tx, def.spawnBed.ty]);
    if (!starts.length) { res[id] = "no arrivals"; continue; }
    const seen = new Set(), q = [];
    for (const s0 of starts) { if (solid[s0[1]] && solid[s0[1]][s0[0]]) out.push(`${id}: arrival tile ${s0} is solid`); q.push(s0); seen.add(s0 + ""); }
    while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) { const nx = x+dx, ny = y+dy; if (nx<0||ny<0||nx>=w||ny>=h||solid[ny][nx]||seen.has(nx+","+ny)) continue; seen.add(nx+","+ny); q.push([nx, ny]); } }
    // what can be targeted from reachable tiles (player feet at tile centre, as findTarget does)
    const hit = new Set(), hitUp = new Set();
    for (const k of seen) { const [x, y] = k.split(",").map(Number);
      for (const d in VEC) { const [vx, vy] = VEC[d]; const px = x*16+8 + vx*11, py = y*16+12 - 2 + vy*11; hit.add(Math.floor(px/16) + "," + Math.floor(py/16)); if (d === 'up') hitUp.add(Math.floor(px/16) + "," + Math.floor(py/16));
        // also the far edge of the tile (player can stand anywhere in it)
        const px2 = x*16+8 + vx*15, py2 = y*16+ (vy<0?4:15) - 2 + vy*11; hit.add(Math.floor(px2/16) + "," + Math.floor(py2/16)); } }
    // interactable props
    for (const p of props) { const pd = PD[p.p]; if (!pd) continue;
      const lk = p.lk || pd.look; const inter = p.station || p.p === "bed" || lk; if (!inter) continue;
      let ok = false; for (let j = 0; j < pd.fh; j++) for (let i = 0; i < pd.fw; i++) if (hit.has(`${p.x+i},${p.y+j}`) || (pd.wall && [0,-1,1].some((o) => hitUp.has(`${p.x+i+o},${p.y+j+1}`) && (o === 0 || !propAt[`${p.x+i},${p.y+j+1}`]) && !(o !== 0 && propAt[`${p.x+i+o},${p.y+j}`] && PD[propAt[`${p.x+i+o},${p.y+j}`].p].wall)) || (pd.wall && hitUp.has(`${p.x+i},${p.y+j+2}`) && propAt[`${p.x+i},${p.y+j+2}`] && !PD[propAt[`${p.x+i},${p.y+j+2}`].p].wall))) ok = true;
      if (!ok) { for (let i = 0; i < pd.fw; i++) { const f = propAt[`${p.x+i},${p.y+1}`]; if (!pd.wall && f && f !== p && hitUp.has(`${p.x+i},${p.y+1}`) && !p.id && (f.lk || (PD[f.p]||{}).look) !== lk) ok = true; } }
      if (!ok) out.push(`${id}: ${p.p}${p.id ? ":" + p.id : ""} at ${p.x},${p.y} can't be reached`);
      if (lk && !p.station && p.p !== "bed") { const key = lk === "shelf" ? "shelf" + (p.v || 0) : lk;
        if (!["mirror","board","pillar"].includes(key) && !D.SCRIPTS["look_" + key] && !D.LOOK_TEXT[key]) out.push(`${id}: ${p.p} at ${p.x},${p.y} has look key '${key}' with no text (prompt shows, nothing happens)`); } }
    // signs
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const c = rows[y][x];
      if (c === "S") { if (!hit.has(x+","+y)) out.push(`${id}: sign at ${x},${y} can't be reached`); if (!(def.signs || {})[`${x},${y}`]) out.push(`${id}: sign at ${x},${y} has no text`); }
      if (c === "D" && def.outside && !hit.has(x+","+y)) {} }
    // warps reachable
    for (const wp of def.warps || []) { const k = `${wp.x},${wp.y}`; let near = seen.has(k) || [[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy]) => seen.has(`${wp.x+dx},${wp.y+dy}`)); if (!near) out.push(`${id}: warp at ${k} to ${wp.to} can't be reached`); if (!D.MAP_DEFS[wp.to]) out.push(`${id}: warp to unknown map ${wp.to}`); }
    res[id] = { reach: seen.size, w, h };
  }
  // NPC schedule spots
  for (const nid in D.NPC_DEFS) for (const e of D.NPC_DEFS[nid].schedule || []) {
    const def = D.MAP_DEFS[e.map]; if (!def) { out.push(`npc ${nid}: schedule map ${e.map} unknown`); continue; }
    const c = def.rows[e.y] && def.rows[e.y][e.x];
    if (c === undefined) out.push(`npc ${nid}: spot ${e.map} ${e.x},${e.y} outside map`);
    else if (SOL.has(c) && c !== "K") out.push(`npc ${nid}: spot ${e.map} ${e.x},${e.y} is on solid tile '${c}' (h ${e.h})`);
    const props = [...(def.props || []), ...((def.stations && def.stations.clerk) || [])];
    for (const p of props) { const pd = PD[p.p]; if (!pd || pd.wall || pd.deco) continue; if (e.x >= p.x && e.x < p.x + pd.fw && e.y >= p.y && e.y < p.y + pd.fh) out.push(`npc ${nid}: spot ${e.map} ${e.x},${e.y} is inside a ${p.p} (h ${e.h})`); }
  }
  return JSON.stringify({ out, res });
})()
"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--no-sandbox"])
        pg = await (await b.new_context(viewport={"width":844,"height":390})).new_page()
        await pg.goto(("file://" + os.path.abspath("build/test.html"))); await pg.wait_for_timeout(6500)
        await pg.evaluate("localStorage.setItem('durinn_intro_seen_v1','1')"); await pg.click("#dz-title-new"); await pg.click("#dz-slides-skip"); await pg.click("#dz-sex-m"); await pg.click("#dz-create-next"); await pg.click("#dz-create-begin"); await pg.click("#dz-slides-skip"); await pg.wait_for_timeout(1500)
        r = json.loads(await pg.evaluate(JS))
        for o in r["out"]: print(o)
        print({k: v for k, v in r["res"].items()})
        await b.close()
asyncio.run(main())
