import os
import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--no-sandbox"])
        ctx = await b.new_context(viewport={"width":844,"height":390}, device_scale_factor=2, has_touch=True, is_mobile=True)
        pg = await ctx.new_page()
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(("file://" + os.path.abspath("build/test.html"))); await pg.wait_for_timeout(6500)
        await pg.evaluate("localStorage.setItem('durinn_intro_seen_v1','1')"); await pg.click("#dz-title-new"); await pg.click("#dz-slides-skip");  await pg.wait_for_timeout(400)
        await pg.screenshot(path="test/cr_a.png")
        await pg.click("#dz-sex-m"); await pg.click("#dz-create-next"); await pg.wait_for_timeout(300)
        await pg.click("#dz-eyes-4"); await pg.click("#dz-skin-4"); print("male has no hairstyle/marks:", not await pg.query_selector("#dz-cut-long"), not await pg.query_selector("#dz-mark-freckles"))
        await pg.wait_for_timeout(300); await pg.screenshot(path="test/cr_b.png")
        await pg.click("#dz-back" if False else "#dz-create-back"); await pg.click("#dz-sex-f"); await pg.click("#dz-create-next"); await pg.wait_for_timeout(300)
        print("female look has no cut/marks:", not await pg.query_selector("#dz-cut-long"), not await pg.query_selector("#dz-mark-freckles"))
        await pg.screenshot(path="test/cr_d.png")
        await pg.click("#dz-create-begin"); await pg.click("#dz-slides-skip"); await pg.wait_for_timeout(1500); await pg.screenshot(path="test/cr_e.png")
        print("hero", await pg.evaluate("(()=>{const G=__durinn.G(); return G.name+' '+G.look.sex+' '+G.pro})()"))
        print(errs); await b.close()
asyncio.run(main())
