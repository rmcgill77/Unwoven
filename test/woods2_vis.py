import os
import asyncio
from playwright.async_api import async_playwright
exec(open('test/story.py').read().split("async def main")[0])
J = lambda s: f"(()=>{{const G=__durinn.G(), E=__durinn.eng; {s}}})()"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--no-sandbox"])
        pg = await (await b.new_context(viewport={"width":844,"height":390}, device_scale_factor=1.5)).new_page()
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        ev = lambda s: pg.evaluate(J(s))
        await pg.goto(("file://" + os.path.abspath("build/test.html"))); await pg.wait_for_timeout(6500)
        await pg.evaluate("localStorage.setItem('durinn_intro_seen_v1','1')"); await pg.click("#dz-title-new"); await pg.click("#dz-slides-skip");  await pg.click("#dz-create-next"); await pg.click("#dz-create-begin"); await pg.click("#dz-slides-skip"); await pg.wait_for_timeout(1200); await pg.evaluate("__durinn.G().flags.wardrobe_done=true")
        await drain(pg, "x", 20)
        await ev("G.flags.__nowild=true; G.flags.d1_paid=true")
        for n,(m,x,y) in enumerate([("wood",22,4),("ruin",24,30),("ruin",24,19),("ruin",24,6),("grove",20,26),("grove",20,13),("grove",20,7)]):
            await ev(f"E.warp('{m}',{x},{y},'up',{{dur:0.05}})"); await pg.wait_for_timeout(1500); await pg.screenshot(path=f"test/w2_{n}.png")
        print(errs); await b.close()
asyncio.run(main())
