import os
import asyncio, sys
from playwright.async_api import async_playwright
exec(open('test/story.py').read().split("async def main")[0])
DEV=[("phone",844,390,3,True),("fold_closed",960,411,2.625,True),("fold_open_port",750,832,2.625,True),("tablet",1180,820,2,True),("monitor_qhd",2560,1440,1,False)]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
        for (name,w,h,dpr,touch) in DEV:
            ctx=await b.new_context(viewport={"width":w,"height":h},device_scale_factor=dpr,has_touch=touch,is_mobile=touch)
            pg=await ctx.new_page(); errs=[]; pg.on("pageerror",lambda e: errs.append(str(e)))
            await pg.goto(("file://" + os.path.abspath("build/test.html"))); await pg.wait_for_timeout(6500)
            await pg.evaluate("localStorage.setItem('durinn_intro_seen_v1','1')"); await pg.click("#dz-title-new"); await pg.click("#dz-slides-skip"); await pg.click("#dz-create-next"); await pg.click("#dz-create-begin"); await pg.click("#dz-slides-skip"); await pg.wait_for_timeout(1200)
            await pg.evaluate("__durinn.G().flags.wardrobe_done=true"); await drain(pg,"x",20); await pg.wait_for_timeout(500)
            await pg.evaluate("(()=>{__durinn.G().flags.__nowild=true; __durinn.eng.warp('oak',20,21,'down',{dur:0.05})})()"); await pg.wait_for_timeout(1500)
            # movement: joystick drag on touch, arrow keys otherwise
            p0=await pg.evaluate("(()=>{const s=__durinn.eng.debugState();return [s.player.x,s.player.y]})()")
            if touch:
                joy=await pg.query_selector(".dz-joy-base")
                r=await joy.bounding_box(); cx,cy=r["x"]+r["width"]/2,r["y"]+r["height"]/2
                cdp=await ctx.new_cdp_session(pg)
                await cdp.send("Input.dispatchTouchEvent",{"type":"touchStart","touchPoints":[{"x":cx,"y":cy}]})
                for i in range(1,8): await cdp.send("Input.dispatchTouchEvent",{"type":"touchMove","touchPoints":[{"x":cx+i*6,"y":cy}]}); await pg.wait_for_timeout(30)
                await pg.wait_for_timeout(900)
                await cdp.send("Input.dispatchTouchEvent",{"type":"touchEnd","touchPoints":[]})
            else:
                await pg.keyboard.down("ArrowRight"); await pg.wait_for_timeout(900); await pg.keyboard.up("ArrowRight")
            p1=await pg.evaluate("(()=>{const s=__durinn.eng.debugState();return [s.player.x,s.player.y]})()")
            print(name,"moved",round(p1[0]-p0[0]),round(p1[1]-p0[1]))
            await pg.evaluate("__durinn.openJob('copy')"); await pg.wait_for_timeout(500)
            await pg.click("#dz-mg-start"); await pg.wait_for_timeout(900); await pg.screenshot(path=f"test/dev/{name}_8job.png")
            await pg.reload(); await pg.wait_for_timeout(6500); await pg.click("#dz-title-continue"); await pg.wait_for_timeout(1200)
            await pg.evaluate("__durinn.openDice('bram')"); await pg.wait_for_timeout(900); await pg.screenshot(path=f"test/dev/{name}_9dice.png")
            print(name,"errs",errs); await ctx.close()
        await b.close()
asyncio.run(main())
