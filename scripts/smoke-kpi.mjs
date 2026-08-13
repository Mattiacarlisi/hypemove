// Collaudo rapido della dashboard interna: serve `public/` in locale, apre la
// pagina Premium con un browser vero e guarda cosa c'è a schermo.
// Nato dopo il 13/08/2026, quando una modifica al riquadro d'errore ha lasciato
// la pagina vuota in produzione: da lì in poi si guarda prima di pubblicare.
//   node scripts/smoke-kpi.mjs
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = path.resolve('public');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };

const server = http.createServer((req, res) => {
  const file = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('nope'); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(0, r));
const port = server.address().port;

const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

await page.goto(`http://localhost:${port}/internal/kpi.html`, { waitUntil: 'networkidle' });
await page.click('text=Premium');
// Le tre sezioni della prova partono dopo kpi_premium e ritentano fino a 5 volte:
// il tempo d'attesa deve coprire il caso peggiore, non quello fortunato.
await page.waitForTimeout(35000);

// innerText restituisce il testo COME LO VEDI: i titoli con text-transform
// arrivano in maiuscolo, quindi il confronto va fatto senza maiuscole o il test
// dice "sezione mancante" mentre la sezione è a schermo.
const body = (await page.innerText('body')).toLowerCase();
const has = (s) => body.includes(s.toLowerCase());
const esito = {
  'errori JS': errors.length ? errors : 'nessuno',
  'testata Premium': has('Premium') && has('Periodo'),
  'sezione gate': has('Gate di fine prova'),
  'gate coi numeri': has('Chi ci arriva') || has('aperture del gate') || has('prove finite'),
  'sezione regalo': has('regalo'),
  'timeout a schermo': has('non ha fatto in tempo'),
  'pagina vuota': body.trim().length < 400,
};
console.log(JSON.stringify(esito, null, 2));
await page.screenshot({ path: 'scripts/.smoke-premium.png', fullPage: true });
console.log('screenshot → scripts/.smoke-premium.png');
await browser.close();
server.close();
