import asyncio, base64, sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("file://concept/sheet.html")
        for s in (4,):
            d = await pg.evaluate(f"render({s})"); open(f"cast_{s}.png","wb").write(base64.b64decode(d.split(",")[1]))
        print(errs); await b.close()
asyncio.run(main())
