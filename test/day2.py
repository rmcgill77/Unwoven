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
        await pg.evaluate("(()=>{const G=__durinn.G(); Object.assign(G.flags,{d1_intro:true,d1_job:true,d1_order:true,d1_delivered:true,d1_paid:true,metTessa:true,d2_errand:true,d2_errand_done:true,d2_stranger:true,d2_scene:true,d2_tome:true}); G.items.tome=1; G.day=2; G.time=20*60;})()")
        await pg.evaluate("(()=>{const G=__durinn.G(); G.time=21*60; __durinn.eng.warp('shop',11,8,'down',{dur:0.05});})()")
        await pg.wait_for_timeout(1200)
        await pg.keyboard.down("d"); await pg.wait_for_timeout(300); await pg.keyboard.up("d")
        for i in range(16):
            await pg.keyboard.press("e"); await pg.wait_for_timeout(300)
            t = await pg.query_selector(".dz-text"); print(i, (await t.inner_text())[:60] if t else None)
            if await pg.query_selector("#dz-tut"): break
        print("tut open", bool(await pg.query_selector("#dz-tut")))
        await pg.screenshot(path="test/d2c.png")
        ring = await pg.query_selector("#dz-tut-ring"); bb = await ring.bounding_box()
        cx, cy = bb["x"]+bb["width"]/2, bb["y"]+bb["height"]/2
        await pg.mouse.move(cx,cy); await pg.mouse.down(); await pg.mouse.up()   # attune
        await pg.mouse.down(); await pg.wait_for_timeout(1900)                   # inhale
        print("step", await pg.evaluate("window.__tut.state().step"))
        await pg.wait_for_timeout(1900); await pg.mouse.up()                     # weave
        print("step", await pg.evaluate("window.__tut.state().step"))
        await pg.screenshot(path="test/d2d.png")
        await pg.wait_for_function("window.__tut.state().t >= window.__tut.state().flareAt + 0.1", timeout=4000)
        await pg.mouse.down(); await pg.mouse.up(); await pg.wait_for_timeout(1500)
        print("tut gone", not await pg.query_selector("#dz-tut"))
        for i in range(10):
            await pg.keyboard.press("e"); await pg.wait_for_timeout(250)
        print(await pg.evaluate("(()=>{const G=__durinn.G(); return {f:G.flags,w:G.words,h:G.hotbar,day:G.day}})()"))
        await pg.screenshot(path="test/d2e.png")
        await b.close(); print(errs)
asyncio.run(main())
