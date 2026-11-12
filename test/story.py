import os
import asyncio, sys
from playwright.async_api import async_playwright
async def drain(pg, label, maxn=200, shots=None):
    n=0; last=None; shot=0
    for i in range(maxn):
        t = await pg.query_selector(".dz-text")
        if t is None:
            for w in range(24):
                await pg.wait_for_timeout(450)
                if shots is not None and shot<shots and w in (1,3):
                    await pg.screenshot(path=f"test/st_{label}_{shot}.png"); shot+=1
                t = await pg.query_selector(".dz-text")
                if t is not None: break
            if t is None:
                break
        txt=(await t.inner_text())
        if txt!=last and shots is not None and shot<shots:
            await pg.screenshot(path=f"test/st_{label}_{shot}.png"); shot+=1
        last=txt
        await pg.keyboard.press("e"); await pg.wait_for_timeout(240); n+=1
    return n
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--no-sandbox"])
        pg = await (await b.new_context(viewport={"width":844,"height":390}, device_scale_factor=1.5)).new_page()
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(("file://" + os.path.abspath("build/test.html"))); await pg.wait_for_timeout(6500)
        await pg.evaluate("localStorage.setItem('durinn_intro_seen_v1','1')"); await pg.click("#dz-title-new"); await pg.click("#dz-slides-skip");  await pg.click("#dz-create-next"); await pg.click("#dz-create-begin"); await pg.click("#dz-slides-skip"); await pg.wait_for_timeout(1200); await pg.evaluate("__durinn.G().flags.wardrobe_done=true")
        for i in range(14): await pg.keyboard.press("e"); await pg.wait_for_timeout(80)
        await pg.evaluate("(()=>{const G=__durinn.G(); Object.assign(G.flags,{d1_intro:true,d1_job:true,d1_order:true,d1_delivered:true,d1_paid:true,metTessa:true,d2_errand:true,d2_errand_done:true,d2_stranger:true,d2_scene:true,d2_tome:true,d2_study:true,magic:true}); G.words={r:['Phaos','Vis'],s:['is','or']}; G.day=3; G.time=8*60;})()")
        # mentor Day 3
        await pg.evaluate("__durinn.eng.warp('shop',6,5,'down',{dur:0.05})"); await pg.wait_for_timeout(900)
        await pg.evaluate("__durinn.run('d3_mentor')"); print("d3_mentor", await drain(pg,"m3"))
        # noon: go to oak, scene triggers
        await pg.evaluate("(()=>{__durinn.G().time=12*60+5})()")
        await pg.evaluate("__durinn.eng.warp('oak',14,15,'down',{dur:0.05})"); await pg.wait_for_timeout(3500)
        await pg.screenshot(path="test/st_scene_a.png")
        n=await drain(pg,"d3",300,shots=8); print("d3 scene lines", n)
        print(await pg.evaluate("(()=>{const G=__durinn.G(); return {f:{s:G.flags.d3_scene,c:G.flags.d3_choice},map:__durinn.eng.mapId()}})()"))
        await pg.screenshot(path="test/st_scene_b.png")
        # night study
        await pg.evaluate("(()=>{__durinn.G().time=21*60})()")
        await pg.evaluate("__durinn.eng.warp('shop',11,8,'down',{dur:0.05})"); await pg.wait_for_timeout(900)
        await pg.evaluate("__durinn.run('bedPlayer')"); n=await drain(pg,"s3"); print("bed3",n)
        await pg.wait_for_timeout(2500)
        print(await pg.evaluate("(()=>{const G=__durinn.G(); return {day:G.day,w:G.words,f:G.flags.d3_study}})()"))
        await drain(pg,"wake")
        # day 4
        await pg.evaluate("__durinn.run('d4_mentor')"); print("d4",await drain(pg,"m4"))
        print(await pg.evaluate("(()=>{const G=__durinn.G(); return {items:G.items,f:G.flags.d4_errand}})()"))
        # barricade
        await pg.evaluate("__durinn.eng.warp('oak',23,2,'up',{dur:0.05})"); await pg.wait_for_timeout(1200)
        await pg.keyboard.down("w"); await pg.wait_for_timeout(250); await pg.keyboard.up("w"); await pg.wait_for_timeout(300)
        await pg.keyboard.press("e"); await pg.wait_for_timeout(300)
        print("barricade lines", await drain(pg,"bar"))
        print(await pg.evaluate("(()=>{const G=__durinn.G(); return {open:G.flags.d4_open,y:__durinn.eng.debugState().player.y}})()"))
        await pg.screenshot(path="test/st_barricade.png")
        # walk north into the wood
        await pg.keyboard.down("w")
        for i in range(40):
            await pg.wait_for_timeout(150)
            if await pg.evaluate("__durinn.eng.mapId()")=="wood": break
        await pg.keyboard.up("w"); await pg.wait_for_timeout(1500)
        print("map", await pg.evaluate("__durinn.eng.mapId()"))
        await pg.screenshot(path="test/st_wood0.png")
        for k,(x,y) in enumerate([(17,30),(14,20),(17,10),(17,7)]):
            await pg.evaluate(f"__durinn.eng.warp('wood',{x},{y},'up',{{dur:0.05}})"); await pg.wait_for_timeout(1200); await pg.screenshot(path=f"test/st_wood{k+1}.png")
        # hut
        await pg.keyboard.down("w"); await pg.wait_for_timeout(700); await pg.keyboard.up("w"); await pg.wait_for_timeout(1500)
        print("map", await pg.evaluate("__durinn.eng.mapId()"))
        await pg.screenshot(path="test/st_hut.png")
        print(errs); await b.close()
asyncio.run(main())
