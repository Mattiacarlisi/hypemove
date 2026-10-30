// Collaudo visivo della card «Attivazione per sprint» (Overview della dashboard interna), senza login e senza
// database: serve `public/` in locale, sostituisce supabase-js con un finto client (nessuna sessione, nessuna
// chiamata di rete) e disegna la card con il codice e il CSS veri, sui numeri di scripts/fixtures/sprint-activation.json.
// Scatta: default (ultimi 6), menu aperto, «Tutti», fasi spente, finestra stretta, legenda completa aperta. Errori JS = collaudo fallito.
//   node scripts/smoke-sprint-activation.mjs
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = path.resolve('public');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
const FIXTURE = JSON.parse(fs.readFileSync(path.resolve('scripts/fixtures/sprint-activation.json'), 'utf8'));
const OUT = 'scripts/.smoke-sa';

const server = http.createServer((req, res) => {
  const file = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('nope'); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(0, r));
const port = server.address().port;

// Finto supabase-js: nessuna sessione (la pagina si ferma sul login), ogni chiamata risponde vuoto.
const FAKE = `window.supabase = { createClient() {
  const empty = () => Promise.resolve({ data: null, error: null });
  const chain = new Proxy(function () {}, { get: (t, k) => k === 'then' ? (ok) => ok({ data: [], error: null }) : () => chain, apply: () => chain });
  return {
    auth: { getSession: () => Promise.resolve({ data: { session: null } }), getUser: () => Promise.resolve({ data: { user: null }, error: null }),
            signOut: empty, onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }) },
    rpc: empty, from: () => chain, channel: () => chain, removeChannel: () => {}, storage: { from: () => chain },
  };
} };`;

const browser = await chromium.launch();
const errors = [];
async function shoot(name, width, setup) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => errors.push(`${name}: ${e}`));
  await page.route(/supabase-js|supabase\.js/, r => r.fulfill({ contentType: 'text/javascript', body: FAKE }));
  await page.goto(`http://localhost:${port}/internal/kpi.html`, { waitUntil: 'networkidle' });
  await page.evaluate(({ rows, setup }) => {
    // eslint-disable-next-line no-undef
    Object.assign(state, { sa: rows, saError: null, saCache: { computedAt: new Date().toISOString(), pending: false, failed: false, fresh: false },
      saSel: null, saPhases: true, saCoorte: false, saMenu: false, saW: 800 }, setup || {});
    document.body.innerHTML = '<div id="probe" style="max-width:1180px;margin:0 auto;padding:24px;background:#0a0a0f;min-height:100vh"></div>';
    document.body.style.background = '#0a0a0f';
    // eslint-disable-next-line no-undef
    window.render = () => { document.getElementById('probe').innerHTML = sprintActivationCard(); attachSprintActivation(); };
    window.render();
  }, { rows: FIXTURE, setup });
  await page.waitForTimeout(400);
  const card = page.locator('.sa-card');
  await card.screenshot({ path: `${OUT}-${name}.png` });
  const text = (await card.innerText()).replace(/\s+/g, ' ');
  await page.close();
  return text;
}

const out = {};
out.default = await shoot('default', 1280);
out.menu    = await shoot('menu', 1280, { saMenu: true });
out.tutti   = await shoot('tutti', 1280, { saSel: FIXTURE.filter(r => r.coorte > 0).map(r => r.id) });
out.nofasi  = await shoot('nofasi', 1280, { saPhases: false });
out.coorte  = await shoot('coorte', 1280, { saCoorte: true });
out.stretta = await shoot('stretta', 480);
out.vuota   = await shoot('vuota', 1280, { saSel: [] });
out.errore  = await shoot('errore', 1280, { sa: null, saError: 'x' });
out.carica  = await shoot('carica', 1280, { sa: null });
out.legenda = await shoot('legenda', 1280, { saLegend: true });
out.legcoo  = await shoot('legenda-coorte', 1280, { saLegend: true, saCoorte: true });
out.legtel  = await shoot('legenda-390', 390, { saLegend: true });

const checks = {
  'errori JS': errors.length ? errors : 'nessuno',
  'default mostra 6 sprint': out.default.includes('6 sprint'),
  'menu con «dati mancanti» sugli sprint 1-2': (out.menu.match(/dati mancanti/g) || []).length === 2,
  'vuota dice nessuno sprint': out.vuota.includes('Nessuno sprint scelto'),
  'errore con Riprova': out.errore.includes('Riprova'),
  'linea dal primo avvio in legenda': out.coorte.includes('attivati su chi ha aperto') && !out.default.includes('attivati su chi ha aperto'),
  'legenda completa chiusa di default': !out.default.includes('Nome dello sprint in grigio'),
  'legenda completa con esempio e invito a «Dal primo avvio»': out.legenda.includes('su 100.') && out.legenda.includes('Si accende con'),
  'legenda completa col primo avvio acceso: esempio, niente invito': !out.legcoo.includes('Si accende con'),
  'nessun trattino lungo nei testi': !Object.values(out).some(t => t.includes('—')),
};
console.log(JSON.stringify(checks, null, 2));
console.log(`screenshot → ${OUT}-*.png`);
await browser.close();
server.close();
process.exit(errors.length ? 1 : 0);
