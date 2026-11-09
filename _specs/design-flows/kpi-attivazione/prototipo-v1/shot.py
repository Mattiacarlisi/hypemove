import sys
from playwright.sync_api import sync_playwright
url, out = sys.argv[1], sys.argv[2]; clicks = sys.argv[3:]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1440,'height':900})
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('http://localhost:8765/'+url); pg.wait_for_timeout(700)
    for c in clicks: pg.click(c); pg.wait_for_timeout(300)
    pg.screenshot(path=out,full_page=True); print(out, errs)
