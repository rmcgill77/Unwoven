import asyncio, base64, io
from PIL import Image
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page()
        await pg.goto("file:///home/claude/durinn/concept/sheet.html")
        d = await pg.evaluate("one(0,6)"); me = Image.open(io.BytesIO(base64.b64decode(d.split(",")[1])))
        await b.close()
    ref = Image.open("/mnt/user-data/attachments/81f7a483-afca-5415-8c60-809b5595b3f8/45b084c9-image.png").convert("RGBA").crop((41,52,88,128))
    ref = ref.resize((ref.width*6, ref.height*6), Image.NEAREST)
    c = Image.new("RGBA", (ref.width + me.width + 60, max(ref.height, me.height) + 20), "#1c1730")
    c.paste(ref, (10, 10 + (c.height-20-ref.height)), ref); c.paste(me, (ref.width + 50, 10), me); c.save("cmp.png")
asyncio.run(main())
