import os
import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--no-sandbox"])
        pg = await (await b.new_context(viewport={"width":844,"height":390}, device_scale_factor=2)).new_page()
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(("file://" + os.path.abspath("build/test.html"))); await pg.wait_for_timeout(6500)
        await pg.evaluate("localStorage.setItem('durinn_intro_seen_v1','1')"); await pg.click("#dz-title-new"); await pg.click("#dz-slides-skip");  await pg.click("#dz-create-next"); await pg.click("#dz-create-begin"); await pg.click("#dz-slides-skip"); await pg.wait_for_timeout(1200); await pg.evaluate("__durinn.G().flags.wardrobe_done=true")
        for i in range(14): await pg.keyboard.press("e"); await pg.wait_for_timeout(100)
        await pg.evaluate("(()=>{const G=__durinn.G(); Object.assign(G.flags,{d1_intro:true,d1_job:true,d1_order:true,d1_delivered:true,d1_paid:true,magic:true}); G.day=2; G.time=10*60; G.items.poultice=2; __durinn.eng.warp('oak',5,20,'down',{dur:0.05});})()")
        await pg.wait_for_timeout(1500)
        print('town wolves', await pg.evaluate("__durinn.eng.debugState().wolves.length"))
        await pg.evaluate("__durinn.eng.warp('wood',30,33,'down',{dur:0.05})")
        await pg.wait_for_timeout(1500)
        st = await pg.evaluate("(()=>{const s=__durinn.eng.debugState(); return {map:s.mapId, wolves:s.wolves.map(w=>[w.key,Math.round(w.x/16),Math.round(w.y/16)]), p:[Math.round(s.player.x/16),Math.round(s.player.y/16)], pil:__durinn.eng.inPillar()}})()")
        print(st)
        await pg.screenshot(path="test/w1.png")
        # walk west toward the wolf at (4,24)
        await pg.keyboard.down("s")
        for i in range(40):
            await pg.wait_for_timeout(150)
            if await pg.query_selector("#dz-bcmd"): break
        await pg.keyboard.up("s")
        await pg.screenshot(path="test/w2.png")
        print("battle open:", bool(await pg.query_selector("#dz-bcmd")))
        # fight: attack with Wren only
        for i in range(80):
            if await pg.query_selector("#dz-bover"): break
            tipb = await pg.query_selector("#dz-btip-ok")
            if tipb: await tipb.click(); await pg.wait_for_timeout(100)
            btn = await pg.query_selector("#dz-c-attack")
            if btn:
                await btn.click(); await pg.wait_for_timeout(100)
                t = await pg.query_selector("[id^=dz-t-]")
                if t: await t.click()
            await pg.wait_for_timeout(400)
            if i==8: await pg.screenshot(path="test/w3.png")
        await pg.screenshot(path="test/w4.png")
        ph = await pg.evaluate("window.__battle && window.__battle.phase")
        print("phase", ph)
        done = await pg.query_selector("#dz-battle-done")
        if done: await done.click(); await pg.wait_for_timeout(800)
        st = await pg.evaluate("(()=>{const s=__durinn.eng.debugState(); const G=__durinn.G(); return {wolves:s.wolves.length, coins:G.coins, party:G.party, slain:G.slain, mapId:s.mapId, hp:G.party.wren.hp}})()")
        print(st)
        await pg.screenshot(path="test/w5.png")
        await b.close(); print(errs)
asyncio.run(main())
