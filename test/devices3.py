import os
import asyncio
from playwright.async_api import async_playwright
exec(open('test/story.py').read().split("async def main")[0])
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
        ctx=await b.new_context(viewport={"width":960,"height":411},device_scale_factor=2.625,has_touch=True,is_mobile=True)
        pg=await ctx.new_page(); errs=[]; pg.on("pageerror",lambda e: errs.append(str(e)))
        await pg.goto(("file://" + os.path.abspath("build/test.html"))); await pg.wait_for_timeout(6500)
        await pg.evaluate("localStorage.setItem('durinn_intro_seen_v1','1')"); await pg.click("#dz-title-new"); await pg.click("#dz-slides-skip"); await pg.click("#dz-create-next"); await pg.click("#dz-create-begin"); await pg.click("#dz-slides-skip"); await pg.wait_for_timeout(1200)
        await pg.evaluate("__durinn.G().flags.wardrobe_done=true"); await drain(pg,"x",20)
        await pg.evaluate("(()=>{__durinn.G().flags.__nowild=true; __durinn.eng.warp('oak',20,21,'down',{dur:0.05})})()"); await pg.wait_for_timeout(1500)
        cv="(()=>{const c=document.querySelector('.dz-canvas');const r=c.getBoundingClientRect();return [Math.round(r.width),Math.round(r.height),innerWidth,innerHeight]})()"
        for i,(w,h) in enumerate([(750,832),(411,960),(960,411),(832,750)]):
            await pg.set_viewport_size({"width":w,"height":h}); await pg.wait_for_timeout(1200)
            print((w,h),"canvas",await pg.evaluate(cv),"rotate shown",bool(await pg.query_selector(".dz-rotate")))
            await pg.screenshot(path=f"test/dev/fold_t{i}.png")
        await pg.evaluate("__durinn.fight(['wolf'])"); await pg.wait_for_timeout(2000)
        ok=await pg.query_selector("#dz-btip-ok")
        if ok: await ok.click()
        await pg.wait_for_timeout(800)
        await pg.set_viewport_size({"width":960,"height":411}); await pg.wait_for_timeout(1500); await pg.screenshot(path="test/dev/fold_tb.png")
        print("errs",errs); await b.close()
asyncio.run(main())
