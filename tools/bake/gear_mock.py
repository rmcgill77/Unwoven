import asyncio
from playwright.async_api import async_playwright
exec(open('test/story.py').read().split("async def main")[0])
J = lambda s: f"(()=>{{const G=__durinn.G(), E=__durinn.eng; {s}}})()"
ICON_JS = r"""
window.__icon=(rows,pal,sc)=>{const c=document.createElement('canvas');c.width=16;c.height=16;const x=c.getContext('2d');rows.forEach((r,y)=>[...r].forEach((ch,i)=>{if(pal[ch]){x.fillStyle=pal[ch];x.fillRect(i,y,1,1)}}));c.style.cssText=`width:${16*sc}px;height:${16*sc}px;image-rendering:pixelated`;return c};
window.__ICONS={
 sword:[["..............k.","............kwk.","...........kwwk.","..........kwwk..",".........kwwk...","........kwwk....",".......kwwk.....","..k...kwwk......","..kk.kwwk.......","...kkwwk........","....kwk.........","...kbkk.........","..kbbk..........",".kbk.kk.........","kbk.............","kk.............."],{k:'#1c1620',w:'#9aa3ad',b:'#6a4a2a'}],
 rust:[["..............k.","............kwk.","...........kwrk.","..........kwrk..",".........kwrk...","........kwwk....",".......kwrk.....","..k...kwrk......","..kk.kwwk.......","...kkwrk........","....kwk.........","...kbkk.........","..kbbk..........",".kbk.kk.........","kbk.............","kk.............."],{k:'#1c1620',w:'#8e949b',r:'#7a4a32',b:'#5a3a22'}],
 body:[["................","....kk....kk....","...kttkkkkttk...","..kttttttttttk..","..kttddttddttk..",".kktttdttdtttkk.","kttktttddtttktk.","kttkttttttttktk.","kttkttddddttktk.","kkkkttttttttkkk.","...kttttttttk...","...kttddddttk...","...kttttttttk...","...kkkkkkkkkk...","................","................"],{k:'#1c1620',t:'#8a6a44',d:'#5e4630'}],
 head:[["................","................","....kkkkkkkk....","...kcccccccck...","..kccccccccck...","..kcccckkcccck..",".kccccktkcccck..",".kcccckttkccck..",".kccckttttkcck..",".kcccktttttkck..",".kkcckkkkkkkkk..","..kkk...........","................","................","................","................"],{k:'#1c1620',c:'#5d5a64',t:'#2a2430'}],
 charm:[["................",".......kk.......","......krrk......",".....krrrrk.....","......kkkk......","....kbkbkbk.....","...kbkbkbkbk....","....kbkbkbk.....","...kbkkbkkbk....","....kk.kk.k.....","...rr..rr.......","...r...r........","................","................","................","................"],{k:'#1c1620',r:'#b33a3a',b:'#6a4a2a'}],
};
"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
        pg = await (await b.new_context(viewport={"width":844,"height":390}, device_scale_factor=2, has_touch=True, is_mobile=True)).new_page()
        ev = lambda s: pg.evaluate(J(s))
        await pg.goto("file://build/concept.html"); await pg.wait_for_timeout(6500)
        await pg.click("#dz-title-new"); await pg.click("#dz-trade-smith"); await pg.click("#dz-create-next"); await pg.click("#dz-create-next"); await pg.fill("#dz-name","Wren"); await pg.click("#dz-create-begin"); await pg.wait_for_timeout(1200)
        await drain(pg, "x", 20)
        await ev("G.flags.__nowild=true; G.flags.d1_paid=true")
        await ev("E.warp('oak',31,15,'down',{dur:0.05})"); await pg.wait_for_timeout(1500)
        await pg.evaluate(ICON_JS)
        # HUD mock: Pack button above interact, menu stays top-right
        await pg.evaluate("""()=>{
          const a=document.querySelector('.dz-btn-a'); const r=a.getBoundingClientRect();
          const b=document.createElement('button'); b.className='dz-btn'; b.id='mock-pack';
          b.style.cssText=`width:54px;height:54px;right:${innerWidth-r.right+10}px;bottom:${innerHeight-r.top+10}px;background:#2c2438;border:2px solid #14101c;box-shadow:inset 0 0 0 2px #5b4b7a;color:#e8dcc0;position:absolute`;
          b.innerHTML='<div><span style="font-size:11px">Pack</span></div>'; a.parentNode.appendChild(b);
          const k=document.createElement('div'); k.textContent='NEW: Pack = gear, items, quests, tome';k.style.cssText='position:absolute;right:'+(innerWidth-r.left+6)+'px;bottom:'+(innerHeight-r.top+30)+'px;color:#e8dcc0;font:11px monospace;background:#000a;padding:3px 6px;border:1px solid #5b4b7a;text-align:right';a.parentNode.appendChild(k);
          const m=document.querySelector('#dz-menu'); const q=document.createElement('div'); q.textContent='Menu: settings, how magic works, save and quit';q.style.cssText='position:absolute;top:60px;right:10px;color:#e8dcc0;font:11px monospace;background:#000a;padding:3px 6px;border:1px solid #5b4b7a';m.parentNode.appendChild(q);
        }""")
        await pg.wait_for_timeout(300); await pg.screenshot(path="concept/gear/hud_mock.png")
        # Gear screen mock
        await pg.click("#dz-menu"); await pg.wait_for_timeout(400)
        await pg.evaluate("""()=>{
          const tabs=document.querySelector('[role=tablist]'); tabs.innerHTML='';
          ['Gear','Items','Quests','Tome','Character'].forEach((t,i)=>{const b=document.createElement('button');b.className='dz-tab';b.textContent=t;b.setAttribute('aria-selected',i==0);tabs.appendChild(b)});
          document.querySelector('.dz-ptitle').textContent='Pack';
          const body=document.querySelector('.dz-pbody'); body.innerHTML='';
          const I=(k,sc)=>__icon(__ICONS[k][0],__ICONS[k][1],sc);
          const wrap=document.createElement('div'); wrap.style.cssText='display:grid;grid-template-columns:200px 1fr 170px;gap:12px;align-items:start;font-size:13px';
          // slots
          const slots=document.createElement('div'); slots.style.cssText='display:grid;gap:6px';
          [['Weapon','sword','Old sword','ATK +3'],['Head','head','Iron-rimmed cap','DEF +1'],['Body','body','Quilted jerkin','DEF +2'],['Charm','charm','Rowan charm','—']].forEach(([s,ic,n,st],i)=>{
            const r=document.createElement('div'); r.style.cssText='display:grid;grid-template-columns:44px 1fr;gap:8px;align-items:center;padding:4px;border:2px solid '+(i==0?'#e8dcc0':'#5b4b7a')+';background:#1c1628';
            const box=document.createElement('div'); box.style.cssText='width:44px;height:44px;display:grid;place-items:center;background:#0e0b14'; box.appendChild(I(ic,2.5));
            const t=document.createElement('div'); t.innerHTML='<div style="font-size:10px;opacity:.6;letter-spacing:.1em">'+s.toUpperCase()+'</div><div>'+n+'</div><div style="color:#8fd18f;font-size:11px">'+st+'</div>'; r.append(box,t); slots.appendChild(r)});
          // list
          const list=document.createElement('div'); list.style.cssText='display:grid;gap:6px'; list.innerHTML='<div style="font-size:10px;opacity:.6;letter-spacing:.1em">WEAPON — CARRIED</div>';
          [['sword','Old sword','Nicked and dull, but it keeps an edge. Your mentor oiled it.','ATK +3','Equipped'],['rust','Rusty cleaver','Found in the wolf den. Heavy.','ATK +4  SPD -1','Equip']].forEach(([ic,n,d,st,btn])=>{
            const r=document.createElement('div'); r.style.cssText='display:grid;grid-template-columns:44px 1fr auto;gap:8px;align-items:center;padding:4px;border:2px solid #3a3050;background:#181322';
            const box=document.createElement('div'); box.style.cssText='width:44px;height:44px;display:grid;place-items:center;background:#0e0b14'; box.appendChild(I(ic,2.5));
            const t=document.createElement('div'); t.innerHTML='<b>'+n+'</b> <span style="color:#8fd18f;font-size:11px">'+st+'</span><div style="font-size:11px;opacity:.75">'+d+'</div>';
            const bt=document.createElement('button'); bt.className='dz-act'; bt.textContent=btn; if(btn=='Equipped') bt.disabled=true; r.append(box,t,bt); list.appendChild(r)});
          // stats
          const st=document.createElement('div'); st.className='dz-stat'; st.style.cssText='display:grid;grid-template-columns:1fr auto;gap:2px 8px;border:2px solid #3a3050;padding:8px;background:#181322';
          st.innerHTML='<div style="grid-column:1/3;font-size:10px;opacity:.6;letter-spacing:.1em">WREN  Lv 1</div><span>HP</span><b>48</b><span>MP</span><b>10</b><span>ATK</span><b>8 <span style="color:#8fd18f">+3</span></b><span>DEF</span><b>5 <span style="color:#8fd18f">+3</span></b><span>MAG</span><b>10</b><span>SPD</span><b>11</b>';
          wrap.append(slots,list,st); body.appendChild(wrap);
        }""")
        await pg.wait_for_timeout(300); await pg.screenshot(path="concept/gear/pack_mock.png")
        await b.close()
asyncio.run(main())
