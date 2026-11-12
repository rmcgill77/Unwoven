import os
import asyncio, json
from playwright.async_api import async_playwright
SHOT="test/u"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--no-sandbox"])
        ctx = await b.new_context(viewport={"width":844,"height":390}, device_scale_factor=2, has_touch=False)
        pg = await ctx.new_page()
        errs=[]; pg.on("pageerror", lambda e: errs.append("PAGE "+str(e))); pg.on("console", lambda m: errs.append("CON "+m.text) if m.type=="error" else None)
        await pg.goto(("file://" + os.path.abspath("build/test.html"))); await pg.wait_for_timeout(6500)
        await pg.screenshot(path=f"{SHOT}01_title.png")
        await pg.evaluate("localStorage.setItem('durinn_intro_seen_v1','1')"); await pg.click("#dz-title-new"); await pg.wait_for_timeout(200); await pg.click("#dz-slides-skip")
        pass
        await pg.screenshot(path=f"{SHOT}02b_who.png")
        await pg.click("#dz-create-next"); await pg.click("#dz-skin-2"); await pg.click("#dz-eyes-3")
        await pg.wait_for_timeout(200); await pg.screenshot(path=f"{SHOT}03_look.png")
        await pg.click("#dz-create-begin"); await pg.click("#dz-slides-skip"); await pg.wait_for_timeout(1500)
        await pg.evaluate("__durinn.G().flags.wardrobe_done=true")
        await pg.screenshot(path=f"{SHOT}05_intro.png")
        async def adv(n=1, wait=350):
            for _ in range(n):
                for k in range(2):
                    if not await pg.query_selector(".dz-dialog") or await pg.query_selector("#dz-choice-0"): break
                    await pg.keyboard.press("e"); await pg.wait_for_timeout(90)
                await pg.wait_for_timeout(wait)
        async def dlg():
            return await pg.evaluate("(()=>{const d=document.querySelector('.dz-dialog');return d?d.innerText:null})()")
        # advance intro until choices
        for i in range(10):
            if await pg.query_selector("#dz-choice-0"): break
            await adv(1)
        await pg.screenshot(path=f"{SHOT}06_choice.png")
        await pg.keyboard.press("ArrowDown"); await pg.keyboard.press("e"); await pg.wait_for_timeout(500)
        for i in range(8):
            if not await dlg(): break
            await adv(1)
        print("after intro dialog:", await dlg())
        await pg.screenshot(path=f"{SHOT}07_shop.png")
        # teleport next to anvil (3,4): stand at (3,5) facing up
        await pg.evaluate("(()=>{const s=__durinn.eng.debugState();s.player.x=2*16+8;s.player.y=4*16+12;s.player.dir='up';})()")
        await pg.wait_for_timeout(200)
        await pg.keyboard.press("e"); await pg.wait_for_timeout(500)
        print("station:", await dlg())
        await adv(1)
        await pg.wait_for_timeout(200)
        if await pg.query_selector("#dz-choice-0"): await pg.click("#dz-choice-0")
        await pg.wait_for_timeout(500)
        await pg.screenshot(path=f"{SHOT}08_mg_intro.png")
        await pg.click("#dz-mg-start"); await pg.wait_for_timeout(300)
        for i in range(120):
            await pg.wait_for_timeout(450)
            if await pg.query_selector("#dz-mg-done"): break
            await pg.keyboard.press(" ")
            if i==2: await pg.screenshot(path=f"{SHOT}09_mg_play.png")
            if i%10==9: await pg.screenshot(path=f"{SHOT}09_mg_{i}.png")
            if await pg.query_selector("#dz-mg-done"): break
        await pg.wait_for_timeout(1500)
        await pg.screenshot(path=f"{SHOT}10_mg_result.png")
        await pg.click("#dz-mg-done"); await pg.wait_for_timeout(800)
        print("after job:", await dlg())
        await pg.screenshot(path=f"{SHOT}11_after_job.png")
        for i in range(6):
            if not await dlg(): break
            await adv(1)
        G = await pg.evaluate("JSON.stringify(__durinn.G())")
        print("G after order:", G)
        # go to Tomas: warp to oak square
        await pg.evaluate("__durinn.eng.warp('oak',21,18,'down')"); await pg.wait_for_timeout(1200)
        await pg.screenshot(path=f"{SHOT}12_oak.png")
        pos = await pg.evaluate("(()=>{const n=__durinn.eng.debugState().npcs.tomas;return [n.map,n.x,n.y]})()")
        print("tomas", pos)
        await pg.evaluate(f"(()=>{{const s=__durinn.eng.debugState();const n=s.npcs.tomas;n.path=null;n.wanderT=99;s.player.x=n.x;s.player.y=n.y-16;s.player.dir='down';}})()")
        await pg.wait_for_timeout(200); await pg.keyboard.press("e"); await pg.wait_for_timeout(500)
        print("tomas dlg:", await dlg()); await pg.screenshot(path=f"{SHOT}13_deliver.png")
        for i in range(4):
            if not await dlg(): break
            await adv(1)
        # store: go in via door walking
        await pg.evaluate("__durinn.eng.warp('store',6,5,'up')"); await pg.wait_for_timeout(1200)
        await pg.evaluate("(()=>{const s=__durinn.eng.debugState();const n=s.npcs.wenna;n.path=null;n.wanderT=99;n.x=5*16+8;n.y=3*16+12;s.player.x=5*16+8;s.player.y=5*16+12;s.player.dir='up';})()")
        await pg.wait_for_timeout(200); await pg.keyboard.press("e"); await pg.wait_for_timeout(600)
        print("wenna:", await dlg())
        await adv(1); await pg.wait_for_timeout(300)
        await pg.click("#dz-choice-0"); await pg.wait_for_timeout(500)
        await pg.screenshot(path=f"{SHOT}14_store.png")
        await pg.click("#dz-buy-candle"); await pg.wait_for_timeout(200)
        await pg.screenshot(path=f"{SHOT}15_bought.png")
        await pg.click("#dz-shop-close"); await pg.wait_for_timeout(200)
        # walk out the door for real to test warp: player to (6,7) facing down, hold ArrowDown
        await pg.evaluate("(()=>{const s=__durinn.eng.debugState();s.player.x=6*16+8;s.player.y=7*16+12;})()")
        await pg.keyboard.down("ArrowDown"); await pg.wait_for_timeout(700); await pg.keyboard.up("ArrowDown"); await pg.wait_for_timeout(600)
        print("map after walking out:", await pg.evaluate("__durinn.eng.mapId()"))
        # walk into shop door from (14,13)
        await pg.evaluate("(()=>{const s=__durinn.eng.debugState();s.player.x=14*16+8;s.player.y=14*16+4;})()")
        await pg.keyboard.down("ArrowUp"); await pg.wait_for_timeout(6500); await pg.keyboard.up("ArrowUp"); await pg.wait_for_timeout(600)
        print("map after walking in:", await pg.evaluate("__durinn.eng.mapId()"))
        await pg.evaluate("(()=>{const s=__durinn.eng.debugState();const n=s.npcs.mentor;n.path=null;n.wanderT=99;s.player.x=n.x;s.player.y=n.y+16;s.player.dir='up';})()")
        await pg.wait_for_timeout(200); await pg.keyboard.press("e"); await pg.wait_for_timeout(500)
        for i in range(10):
            d = await dlg()
            if not d: break
            print(" mentor:", d.replace("\n"," | ")[:110])
            await adv(1)
        await pg.screenshot(path=f"{SHOT}16_paid.png")
        G = json.loads(await pg.evaluate("JSON.stringify(__durinn.G())"))
        print("flags", G["flags"], "coins", G["coins"], "items", G["items"])
        # menu tabs
        for _ in range(60):
            if not await dlg(): break
            await pg.keyboard.press("e"); await pg.wait_for_timeout(150)
        await pg.click("#dz-pack"); await pg.wait_for_timeout(300); await pg.screenshot(path=f"{SHOT}17_menu_self.png")
        await pg.click("#dz-tab-tasks"); await pg.wait_for_timeout(200); await pg.screenshot(path=f"{SHOT}18_menu_tasks.png")
        await pg.click("#dz-close"); await pg.click("#dz-menu"); await pg.click("#dz-tab-art"); await pg.wait_for_timeout(400); await pg.screenshot(path=f"{SHOT}19_menu_art.png", full_page=False)
        await pg.click("#dz-close"); await pg.wait_for_timeout(200)
        # evening, sleep
        await pg.evaluate("(()=>{const s=__durinn.eng.debugState();s.G.time=20*60;s.player.x=11*16+8;s.player.y=8*16+12;s.player.dir='right';})()")
        await pg.wait_for_timeout(400); await pg.screenshot(path=f"{SHOT}20_evening.png")
        await pg.keyboard.press("e"); await pg.wait_for_timeout(500); print("bed:", await dlg())
        await adv(1); await pg.wait_for_timeout(200)
        if await pg.query_selector("#dz-choice-0"): await pg.click("#dz-choice-0")
        await pg.wait_for_timeout(2200); print("morning:", await dlg())
        await pg.screenshot(path=f"{SHOT}21_morning.png")
        G = json.loads(await pg.evaluate("JSON.stringify(__durinn.G())")); print("day", G["day"], "time", G["time"])
        saved = await pg.evaluate("localStorage.getItem('durinn.save.v1') ? JSON.parse(localStorage.getItem('durinn.save.v1')).day : null"); print("saved day", saved)
        # reload and continue
        await pg.reload(); await pg.wait_for_timeout(6500)
        await pg.screenshot(path=f"{SHOT}22_title_continue.png")
        await pg.click("#dz-title-continue"); await pg.wait_for_timeout(800)
        print("continued map", await pg.evaluate("__durinn.eng.mapId()"), "day", await pg.evaluate("__durinn.G().day"))
        # each minigame
        for k in ["copy","saw","scrape","harvest","stack"]:
            await pg.evaluate(f"__durinn.openJob('{k}')"); await pg.wait_for_timeout(300)
            await pg.click("#dz-mg-start"); await pg.wait_for_timeout(200)
            if k=="scrape":
                box = await pg.eval_on_selector(".dz-mgcanvas","e=>{const r=e.getBoundingClientRect();return [r.left,r.top,r.width,r.height]}")
                await pg.mouse.move(box[0]+box[2]*0.3, box[1]+box[3]*0.4); await pg.mouse.down()
                for j in range(30): await pg.mouse.move(box[0]+box[2]*(0.25+0.5*((j%10)/10)), box[1]+box[3]*(0.3+0.4*(j/30))); await pg.wait_for_timeout(40)
                await pg.mouse.up()
            elif k=="harvest":
                await pg.wait_for_timeout(2500)
                box = await pg.eval_on_selector(".dz-mgcanvas","e=>{const r=e.getBoundingClientRect();return [r.left,r.top,r.width,r.height]}")
                await pg.mouse.click(box[0]+box[2]*(39/200), box[1]+box[3]*(33/120))
            elif k=="copy":
                await pg.wait_for_timeout(500)
            else:
                for j in range(3): await pg.wait_for_timeout(500); await pg.keyboard.press(" ")
            await pg.wait_for_timeout(500)
            await pg.screenshot(path=f"{SHOT}30_mg_{k}.png")
            await pg.evaluate("(()=>{})()")
            # close: press Escape won't work mid-play; reload state by removing job via openJob? skip: reload page
            await pg.reload(); await pg.wait_for_timeout(700); await pg.click("#dz-title-continue"); await pg.wait_for_timeout(500)
        print("errors:", errs)
        await b.close()
asyncio.run(main())
