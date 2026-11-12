import os
import asyncio, json, sys
from playwright.async_api import async_playwright
exec(open('test/story.py').read().split("async def main")[0])
DEV = [  # name, w, h, dpr, touch
 ("phone_se", 667, 375, 2, True), ("phone", 844, 390, 3, True), ("phone_max", 932, 430, 3, True),
 ("fold_closed", 960, 411, 2.625, True), ("fold_open_land", 832, 750, 2.625, True), ("fold_open_port", 750, 832, 2.625, True),
 ("tablet", 1180, 820, 2, True), ("tablet_43", 1024, 768, 2, True), ("monitor", 1920, 1080, 1, False), ("monitor_qhd", 2560, 1440, 1, False),
]
if len(sys.argv) > 1: DEV = [d for d in DEV if d[0] in sys.argv[1].split(",")]
CHECK = r"""(() => {
  const W = innerWidth, H = innerHeight, bad = [];
  const sel = 'button, [role=button], .dz-hud, .dz-dialog, .dz-panel, .dz-tcard, .dz-btn-a, .dz-btn-pack, .dz-stick, .dz-bpanel, .dz-battle, .dz-create';
  for (const el of document.querySelectorAll(sel)) {
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    if (!r.width || !r.height || cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue;
    const name = (el.id || el.className || el.tagName).toString().slice(0, 40) + ' "' + (el.innerText || '').trim().slice(0, 18) + '"';
    if (r.right > W + 1 || r.bottom > H + 1 || r.left < -1 || r.top < -1) bad.push('OUT ' + name + ' ' + [r.left, r.top, r.right, r.bottom].map(Math.round));
    if ((el.tagName === 'BUTTON' || el.getAttribute('role') === 'button') && matchMedia('(pointer: coarse)').matches && (r.height < 30 || r.width < 30)) bad.push('SMALL ' + name + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
  }
  const de = document.documentElement; if (de.scrollWidth > W + 1 || de.scrollHeight > H + 1) bad.push('PAGE SCROLL ' + de.scrollWidth + 'x' + de.scrollHeight);
  return bad;
})()"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--no-sandbox"])
        report = {}
        for (name, w, h, dpr, touch) in DEV:
            ctx = await b.new_context(viewport={"width": w, "height": h}, device_scale_factor=dpr, has_touch=touch, is_mobile=touch)
            pg = await ctx.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
            out = {}
            async def shot(k):
                await pg.screenshot(path=f"test/dev/{name}_{k}.png"); out[k] = await pg.evaluate(CHECK)
            await pg.goto(("file://" + os.path.abspath("build/test.html"))); await pg.wait_for_timeout(6500)
            await shot("1title")
            await pg.evaluate("localStorage.setItem('durinn_intro_seen_v1','1')")
            if name == "fold_open_port" or h > w * 1.15:
                pass
            await pg.click("#dz-title-new"); await pg.wait_for_timeout(5000); await shot("2slide")
            await pg.click("#dz-slides-skip"); await pg.wait_for_timeout(800); await shot("3create")
            await pg.click("#dz-create-next"); await pg.wait_for_timeout(500); await shot("3create2")
            await pg.click("#dz-create-begin"); await pg.click("#dz-slides-skip"); await pg.wait_for_timeout(1500)
            await shot("4dialog")
            await pg.evaluate("__durinn.G().flags.wardrobe_done=true"); await drain(pg, "x", 20); await pg.wait_for_timeout(600)
            await shot("5game")
            try:
                await pg.click(".dz-btn-pack", timeout=3000)
            except Exception:
                await pg.keyboard.press("i")
            await pg.wait_for_timeout(700); await shot("6pack")
            await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
            await pg.evaluate("(()=>{const G=__durinn.G(); G.flags.magic=true; G.items.oldsword=1;})()")
            await pg.evaluate("__durinn.fight(['wolf','hound'])"); await pg.wait_for_timeout(2200)
            ok = await pg.query_selector("#dz-btip-ok")
            if ok: await ok.click(); await pg.wait_for_timeout(1800)
            else:
                f = await pg.query_selector("text=Fight")
                if f: await f.click(); await pg.wait_for_timeout(1800)
            await shot("7battle")
            out["errs"] = errs; report[name] = out
            await ctx.close()
        await b.close()
        json.dump(report, open("test/dev/report.json", "w"), indent=1)
        for n, o in report.items():
            print("==", n, "errs:", o.get("errs"))
            for k, v in o.items():
                if k != "errs" and v: print("  ", k, v[:8])
asyncio.run(main())
