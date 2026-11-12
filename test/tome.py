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
        await pg.evaluate("(()=>{const G=__durinn.G(); Object.assign(G.flags,{d1_intro:true,d1_job:true,d1_order:true,d1_delivered:true,d1_paid:true,magic:true}); G.day=3; G.time=21*60; G.words={r:['Phaos','Vis','Sens'],s:['is','or','id']}; G.hotbar=['Phaos-is','Vis-is',null,null]; G.sigs=0; __durinn.eng.warp('oak',24,24,'down',{dur:0.05});})()")
        await pg.wait_for_timeout(1200)
        # map cast
        await pg.keyboard.press("q"); await pg.wait_for_timeout(300)
        print("castm", bool(await pg.query_selector("#dz-castm")))
        await pg.screenshot(path="test/t1.png")
        await pg.click("#dz-map-Phaos-is"); await pg.wait_for_timeout(1200)
        await pg.screenshot(path="test/t2.png")
        print("breath", await pg.evaluate("__durinn.G().party.wren.mp"))
        # tome
        await pg.keyboard.press("i"); await pg.wait_for_timeout(300)
        tab = await pg.query_selector("#dz-tab-tome")
        print("tome tab", bool(tab))
        if tab:
            await tab.click(); await pg.wait_for_timeout(300)
            await pg.click("#dz-slot-3"); await pg.click("#dz-tr-Sens"); await pg.click("#dz-ts-id"); await pg.wait_for_timeout(200)
            await pg.screenshot(path="test/t3.png")
            await pg.click("#dz-set-slot"); await pg.wait_for_timeout(200)
            print("hotbar", await pg.evaluate("__durinn.G().hotbar"))
        await b.close(); print(errs)
asyncio.run(main())
