import os
import asyncio, sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--no-sandbox"])
        errs=[]
        pg = await (await b.new_context(viewport={"width":844,"height":390}, device_scale_factor=2)).new_page()
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.on("console", lambda m: errs.append("C:"+m.text) if m.type=="error" and "font" not in m.text.lower() and "ERR_" not in m.text else None)
        await pg.goto(("file://" + os.path.abspath("build/test.html"))); await pg.wait_for_timeout(6500)
        await pg.click("#dz-title-battle"); await pg.wait_for_timeout(2500)
        await pg.screenshot(path="test/bt1.png")
        # play: attack the first foe with whoever is ready, a few rounds
        log=[]
        for i in range(60):
            tipb = await pg.query_selector("#dz-btip-ok")
            if tipb: await tipb.click(); await pg.wait_for_timeout(100)
            btn = await pg.query_selector("#dz-c-attack")
            if btn:
                await btn.click(); await pg.wait_for_timeout(120)
                t = await pg.query_selector("[id^=dz-t-]")
                if t: await t.click()
                if i==3: await pg.screenshot(path="test/bt2.png")
            over = await pg.query_selector("#dz-bover")
            if over: break
            await pg.wait_for_timeout(500)
            if i==6: await pg.screenshot(path="test/bt3.png")
        await pg.screenshot(path="test/bt4.png")
        st = await pg.evaluate("(()=>{const B=window.__battle;return B?{phase:B.phase,t:B.t,u:B.units.map(u=>[u.name,u.hp,u.ko])}:null})()")
        print(st)
        await b.close(); print(errs)
asyncio.run(main())
