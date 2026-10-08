# Misura le posizioni (relative alla radice .kb) degli elementi con id nelle tavole «Oggi» e scrive measure_oggi.json.
import re, json, os, asyncio
from playwright.async_api import async_playwright
src = open('/home/d4nd0n/.claude/skills/redesign/shoot.py').read().split('async def main')[0]
ns = {}; exec(src, ns)
FILES = {'main': 'Main', 'utenti': 'oggi-3-utenti-aperti', 'conv': 'oggi-4-conversazioni', 'feedback': 'oggi-5-feedback', 'prompting': 'oggi-6-prompting', 'stretta': 'oggi-7-finestra-stretta'}
async def main():
    out = {}
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--allow-file-access-from-files'])
        for k, f in FILES.items():
            path = 'project/%s.dc.html' % f
            html, srcf = ns['build'](path)
            m = re.search(r'"\$preview"\s*:\s*\{\s*"width"\s*:\s*(\d+)\s*,\s*"height"\s*:\s*(\d+)', srcf)
            BW, BH = int(m.group(1)), int(m.group(2))
            os.makedirs('out', exist_ok=True); oh = 'out/m_%s.html' % f; open(oh, 'w').write(html)
            pg = await b.new_page(viewport={'width': BW, 'height': BH})
            await pg.goto('file://' + os.path.abspath(oh)); await pg.wait_for_timeout(600)
            r = await pg.evaluate('''() => { window.__M = true; window.__frame(3);
              const root = document.querySelector('.kb').getBoundingClientRect(); const o = {};
              document.querySelectorAll('[id]').forEach(e => { if (e.id === 'stage' || e.id === 'tpl') return; const r = e.getBoundingClientRect(); o[e.id] = [r.left - root.left, r.top - root.top, r.width, r.height]; });
              return o; }''')
            out[k] = r
        await b.close()
    json.dump(out, open('measure_oggi.json', 'w'), indent=0)
    print({k: len(v) for k, v in out.items()})
asyncio.run(main())
