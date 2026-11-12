import asyncio, json, base64
from playwright.async_api import async_playwright
V={'skin':[0,2,3,6],'hair':[0,3,6,9],'cloth':[0,2,4,8],'eyes':[0,1,3,4]}
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
        pg=await b.new_page(viewport={"width":1340,"height":670})
        await pg.goto("file://build/test.html"); await pg.wait_for_timeout(7000)
        js="""(look)=>{const s=__durinn.art.chibiFor(look); if(!s) return null; const f=s.anims.idle_down[0]; return f.toDataURL();}"""
        out={}
        base={'skin':1,'hair':1,'cloth':0,'eyes':0,'tunic':0,'cut':'spiky'}
        async def get(name,look):
            d=await pg.evaluate(js,look); 
            if not d: print('null',name); return
            open(f'spr/corin_{name}.png','wb').write(base64.b64decode(d.split(',')[1]))
        await get('base',base)
        for k,vs in V.items():
            for v in vs: await get(f'{k}{v}',{**base,k:v})
        await b.close()
asyncio.run(main())
