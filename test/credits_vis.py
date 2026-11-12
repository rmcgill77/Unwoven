import os
import asyncio
from playwright.async_api import async_playwright
exec(open('test/story.py').read().split("async def main")[0])
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--no-sandbox"])
        pg = await (await b.new_context(viewport={"width":844,"height":390}, device_scale_factor=1.5)).new_page()
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(("file://" + os.path.abspath("build/test.html"))); await pg.wait_for_timeout(6500)
        await pg.evaluate("localStorage.setItem('durinn_intro_seen_v1','1')"); await pg.click("#dz-title-new"); await pg.click("#dz-slides-skip");  await pg.click("#dz-create-next"); await pg.click("#dz-create-begin"); await pg.click("#dz-slides-skip"); await pg.wait_for_timeout(1200)
        await drain(pg, "x", 20)
        await pg.evaluate("__durinn.run('d5_wake')"); await pg.wait_for_timeout(800)
        await drain(pg, "x", 40); await pg.wait_for_timeout(7500)
        await pg.screenshot(path="test/credits.png")
        print("music:", await pg.evaluate("__durinn.music()"))
        await pg.click("#dz-credits-done"); await pg.wait_for_timeout(600)
        print("after:", await pg.evaluate("__durinn.music()"), await pg.evaluate("__durinn.G().flags.act1_end")); print(errs); await b.close()
asyncio.run(main())
