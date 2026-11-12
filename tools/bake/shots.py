import asyncio
from playwright.async_api import async_playwright
exec(open('test/story.py').read().split("async def main")[0])
J = lambda s: f"(()=>{{const G=__durinn.G(), E=__durinn.eng; {s}}})()"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
        pg = await (await b.new_context(viewport={"width":844,"height":390}, device_scale_factor=2)).new_page()
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        ev = lambda s: pg.evaluate(J(s))
        await pg.goto("file://build/concept.html"); await pg.wait_for_timeout(6500)
        await pg.click("#dz-title-new"); await pg.click("#dz-trade-smith"); await pg.click("#dz-create-next"); await pg.click("#dz-create-next"); await pg.fill("#dz-name","Wren"); await pg.click("#dz-create-begin"); await pg.wait_for_timeout(1200)
        await drain(pg, "x", 20)
        await ev("G.flags.__nowild=true; E.setNight(false,false)")
        for n,(m,x,y,d) in enumerate([("tavern_kitchen",4,4,"up"),("tavern_guest",4,4,"up"),("chapel_vestry",3,3,"up"),("cottage_g_bed",3,3,"up"),("hut_loft",3,3,"up")]):
            await ev(f"E.warp('{m}',{x},{y},'{d}',{{dur:0.05}})"); await pg.wait_for_timeout(1500); await pg.screenshot(path=f"concept/gear/rm_{n}.png")
        print(errs); await b.close()
asyncio.run(main())
