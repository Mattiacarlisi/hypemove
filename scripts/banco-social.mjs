// Banco di prova del pannello Social (public/internal/social.html) con dati finti.
// Serve public/ in locale, sostituisce supabase-js con scripts/banco-social-stub.js (niente rete, niente dati veri)
// e fa il giro: Post → apro un Reel → Approva → Metti in programma → Programma con le icone delle piattaforme
// → uscito (simulato) con i link Instagram/Facebook/TikTok → Risultati con il selettore TikTok.
// Controlla quello che vede (è un collaudo) e con --registra salva il video per il modulo TikTok «Accounts API Access».
//   node scripts/banco-social.mjs              collaudo
//   node scripts/banco-social.mjs --registra   collaudo + video in scripts/.banco-social/giro.mp4
// Usa il Chrome installato (channel 'chrome'): il Chromium di Playwright non riproduce gli mp4 H.264.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const QUI = path.dirname(fileURLToPath(import.meta.url));
const WWW = path.resolve(QUI, '..'), ROOT = path.join(WWW, 'public'), OUT = path.join(QUI, '.banco-social');
const CREATIVE = path.resolve(WWW, '..', 'marketing', 'creative');
const REGISTRA = process.argv.includes('--registra');
let chromium;
try { ({ chromium } = await import('playwright')); } catch { ({ chromium } = await import(pathToFileURL(path.resolve(WWW, '..', 'app', 'node_modules', 'playwright', 'index.mjs')).href).then((m) => m.default ?? m)); }
fs.mkdirSync(OUT, { recursive: true });

// ── file dei post: contenuti veri del marketing, nessun dato di utenti ──
const FILE = {
  'banco-attrezzi.mp4': path.join(CREATIVE, 'social', 'attrezzi-anonimi.mp4'),
  'banco-frigo.mp4': path.join(CREATIVE, 'social', 'frigo-di-notte.mp4'),
  'banco-edizione.mp4': path.join(CREATIVE, 'social', 'edizione-straordinaria-b.mp4'),
  'banco-pigri.png': path.join(CREATIVE, 'hypemove-pigri-4x5-1080x1350.png'),
  'banco-pocotempo.png': path.join(CREATIVE, 'hypemove-poco-tempo-4x5-1080x1350.png'),
};
for (const v of ['banco-attrezzi', 'banco-frigo', 'banco-edizione']) {
  const jpg = path.join(OUT, v + '.jpg');
  if (!fs.existsSync(jpg)) execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', '1.5', '-i', FILE[v + '.mp4'], '-frames:v', '1', '-vf', 'scale=420:-2', jpg]);
  FILE[v + '.jpg'] = jpg;
}

// ── dati finti ──
const ISO = (s) => new Date(s).toISOString();
const ctl = [{ t: 'File presente e leggibile', ok: true }, { t: 'Didascalia senza parole vietate', ok: true }, { t: 'Formato giusto per Instagram e TikTok', ok: true }];
const base = { didascalia_prec: null, fonte: null, etichetta_ia: false, data_fissa: false, publish_at: null, pubblicato_il: null, permalink: null, ig_media_id: null, data_consigliata: null, controlli: ctl, controlli_media: 'x', pubblicazione: null, pubblicazione_errore: null, reel_prova: false, reel_prova_dal: null, reel_prova_media_id: null, reel_prova_permalink: null, reel_prova_errore: null, reel_prova_chiesto: null, tt_escluso: false, tt_stato: null, tt_il: null, tt_permalink: null, tt_errore: null, created_at: ISO('2026-11-26T10:00:00Z') };
const posts = [
  { ...base, id: 'banco-attrezzi', ordine: 1, titolo: 'Attrezzi Anonimi', tema: 'sonoio', formato: 're', stato: 'da_vedere', media: [{ path: 'posts/banco-attrezzi.mp4', type: 'video' }], didascalia: 'Il gruppo di sostegno degli attrezzi dimenticati in casa. Tu quale hai abbandonato? 🏋️' },
  { ...base, id: 'banco-pigri', ordine: 2, titolo: 'Per pigri che ci riprovano', tema: 'miserve', formato: 'fr', stato: 'da_vedere', media: [{ path: 'posts/banco-pigri.png', type: 'image' }], didascalia: 'Cinque minuti, dal divano al tappeto. Salvalo per stasera.' },
  { ...base, id: 'banco-frigo', ordine: 3, titolo: 'Il frigo di notte', tema: 'sonoio', formato: 're', stato: 'approvato', publish_at: ISO('2026-11-30T11:30:00Z'), media: [{ path: 'posts/banco-frigo.mp4', type: 'video' }], didascalia: 'Mezzanotte, la luce del frigo, e tu.' },
  { ...base, id: 'banco-pocotempo', ordine: 4, titolo: 'Poco tempo', tema: 'parliamone', formato: 'fr', stato: 'approvato', publish_at: ISO('2026-12-02T19:30:00Z'), tt_escluso: true, media: [{ path: 'posts/banco-pocotempo.png', type: 'image' }], didascalia: 'Quanto tempo hai davvero per te durante la settimana?' },
  { ...base, id: 'banco-edizione', ordine: 5, titolo: 'Edizione straordinaria', tema: 'sonoio', formato: 're', stato: 'pubblicato', pubblicato_il: ISO('2026-11-25T18:00:00Z'), ig_media_id: '1800000000000000', permalink: 'https://www.instagram.com/reel/BANCO0000/', tt_stato: 'uscito', tt_il: ISO('2026-11-25T18:05:00Z'), tt_permalink: 'https://www.tiktok.com/@hypemove.app/video/7400000000000000000', media: [{ path: 'posts/banco-edizione.mp4', type: 'video' }], didascalia: 'Ultim’ora dal divano.' },
];
const giorni = (f) => Array.from({ length: 30 }, (_, i) => { const d = new Date(Date.UTC(2026, 9, 28 + i)); return { g: d.toISOString().slice(0, 10), ...f(i) }; });
const link = (k) => { const gg = giorni((i) => ({ visite: Math.round(k * (3 + (i * 7) % 5)), android: Math.round(k * ((i * 3) % 3)), avvii: (i * 5) % 9 === 0 ? 1 : 0 })); const s = (c) => gg.reduce((n, r) => n + r[c], 0); return { da: gg[0].g, a: gg.at(-1).g, dal_primo: '2026-10-10', giorni: gg, ora: { visite: s('visite'), android: s('android'), avvii: s('avvii') }, prima: { visite: Math.round(s('visite') * 0.8), android: Math.round(s('android') * 0.7), avvii: 2 }, prima_intero: true, destinazioni: [{ link: 'android', n: s('android') }, { link: 'iphone', n: Math.round(s('android') / 3) }] }; };
const FX = {
  tabelle: {
    social_posts: posts, social_revisioni: [], social_idee: [],
    social_obiettivi: [
      { id: 'avvii', ordine: 1, nome: 'Primi avvii da Instagram al mese', unita: null, obiettivo: 15, valore: null, automatico: true },
      { id: 'post', ordine: 2, nome: 'Post pubblicati entro il 28 febbraio', unita: null, obiettivo: 150, valore: null, automatico: true },
      { id: 'views', ordine: 3, nome: 'Visualizzazioni a post (mediana)', unita: null, obiettivo: 400, valore: null, automatico: true },
      { id: 'foll', ordine: 4, nome: 'Follower', unita: null, obiettivo: 550, valore: null, automatico: true },
    ],
    social_instagram: [{ id: 1, collegato_il: ISO('2026-11-25T19:16:00Z'), aggiornato_il: ISO('2026-11-26T17:00:00Z'), username: 'hypemove.app', auto: true, risposte: false, scade_il: null, ultimo_errore: null, permessi: [], mancanti: [] }],
    social_tiktok: [{ id: 1, collegato_il: ISO('2026-11-26T18:00:00Z'), username: 'hypemove.app' }],
  },
  rpc: {
    social_kpi: [{ mese: '2026-10', visite: 180, android: 40, avvii: 7, pubblicati: 0, tiktok: { visite: 0, android: 0, avvii: 0, pubblicati: 0 } }, { mese: '2026-11', visite: 210, android: 48, avvii: 6, pubblicati: 3, tiktok: { visite: 34, android: 9, avvii: 2, pubblicati: 1 } }],
    social_link: { instagram: link(2), tiktok: link(0.6) },
    social_instagram_dati: { account: { follower: 445 }, giorni30: { views: 9120, reach: 6400, total_interactions: 310 }, media: [], obiettivi: { views: { v: 329, n: 3 } }, messaggi: { commenti: 0, risposte: 0, privati: 0, saltati: 0, errori: 0 }, pena: { aperta: 0, iniziata: 0, finita: 0, android: 0, denunce: 0 } },
    social_profilo: { account: { username: 'hypemove.app', post: 55, follower: 445, seguiti: 120, nome: 'Hypemove' }, media: [] },
  },
};

// ── server di public/ ──
const TIPI = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const file = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('nope'); }
  res.writeHead(200, { 'Content-Type': TIPI[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, r));

const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, ...(REGISTRA ? { recordVideo: { dir: OUT, size: { width: 1280, height: 720 } } } : {}) });
const page = await context.newPage(), T0 = Date.now(), secondi = () => (Date.now() - T0) / 1000;
let taglioDa = 0, taglioA = null;
const errori = [];
page.on('pageerror', (e) => errori.push(String(e)));
await page.route('**/supabase-js@2/**', (r) => r.fulfill({ contentType: 'text/javascript', body: fs.readFileSync(path.join(QUI, 'banco-social-stub.js'), 'utf8') }));
await page.route('**/rest/v1/**', (r) => r.abort());
await page.route('**/functions/v1/**', (r) => r.abort());
await page.route('**/storage/v1/object/public/social-media/**', (r) => { const f = FILE[path.basename(new URL(r.request().url()).pathname)]; return f ? r.fulfill({ path: f }) : r.fulfill({ status: 404, body: '' }); });
await page.addInitScript((fx) => {
  window.__FX = fx;
  try { localStorage.setItem('hm_social_page', 'post'); } catch (e) {}
  // Cursore e sottotitoli: Playwright non registra il puntatore, e il revisore di TikTok legge l'inglese.
  addEventListener('DOMContentLoaded', () => {
    const c = Object.assign(document.createElement('div'), { id: 'banco-cursore' });
    c.style.cssText = 'position:fixed;z-index:99999;width:18px;height:18px;border-radius:50%;background:rgba(255,255,255,.9);border:2px solid #7c3aed;pointer-events:none;transform:translate(-50%,-50%);left:-40px;top:-40px;transition:width .1s,height .1s';
    const s = Object.assign(document.createElement('div'), { id: 'banco-sottotitolo' });
    s.style.cssText = 'position:fixed;z-index:99998;left:50%;bottom:18px;transform:translateX(-50%);max-width:1100px;background:rgba(0,0,0,.82);color:#fff;font:600 17px/1.35 system-ui,sans-serif;padding:10px 18px;border-radius:10px;pointer-events:none;text-align:center;display:none';
    document.body.append(c, s);
    addEventListener('mousemove', (e) => { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; }, true);
    addEventListener('mousedown', () => { c.style.width = c.style.height = '26px'; }, true);
    addEventListener('mouseup', () => { c.style.width = c.style.height = '18px'; }, true);
  });
}, FX);

const pausa = (ms) => page.waitForTimeout(REGISTRA ? ms : 150);
const sotto = (t) => page.evaluate((x) => { const s = document.getElementById('banco-sottotitolo'); if (s) { s.textContent = x; s.style.display = x ? 'block' : 'none'; } }, t);
async function tocca(loc, attesa = 900) {
  await loc.scrollIntoViewIfNeeded();
  const b = await loc.boundingBox();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: REGISTRA ? 18 : 2 });
  await pausa(350);
  await loc.click();
  await pausa(attesa);
}
const esito = [];
const verifica = (nome, ok) => { esito.push([nome, !!ok]); if (!ok) console.error('✕ ' + nome); };

await page.goto(`http://localhost:${server.address().port}/internal/social.html`, { waitUntil: 'networkidle' });
// Il registratore parte con la pagina rimpicciolita in un angolo: un ridimensionamento la rimette a posto, e il video comincia da lì.
await page.setViewportSize({ width: 1280, height: 719 }); await page.setViewportSize({ width: 1280, height: 720 });
await page.waitForTimeout(800); taglioDa = secondi();
await page.mouse.move(640, 360);
await sotto('HypeMove Social — our internal content panel. It manages only our own account @hypemove.app.');
await pausa(3500);

// 1. apro il Reel e lo approvo
await sotto('1 · The owner opens a Reel made by our team and watches it.');
await tocca(page.locator('.so-card').filter({ hasText: 'Attrezzi Anonimi' }).locator('.so-pic'), 4500);
verifica('scheda aperta', await page.locator('.so-sch').isVisible());
await sotto('2 · He approves it. Every approved post goes to Instagram + Facebook and TikTok.');
await tocca(page.locator('.so-frecce button', { hasText: 'Approva' }), 2200);
verifica('tre piattaforme nella scheda', (await page.locator('.so-pfr .so-pfr-r').count()) === 3);
verifica('TikTok in attesa del profilo Instagram', (await page.locator('.so-pfr').innerText()).includes('Esce quando è sul profilo Instagram'));

// 2. data e ora
await sotto('3 · He picks the date and time. Our scheduler will publish it then.');
await page.locator('#so-g').scrollIntoViewIfNeeded();
await pausa(800);
await page.locator('#so-g').fill('2026-12-01');
await page.locator('.so-due input[type=time]').fill('12:30');
await pausa(900);
await tocca(page.getByRole('button', { name: 'Metti in programma' }), 2500);

// 3. programma con le icone
await sotto('4 · The calendar shows where each post will go: Instagram, Facebook, TikTok.');
await tocca(page.locator('aside .nav-item', { hasText: 'Programma' }), 2500);
const slot = page.locator('.so-sl').filter({ hasText: 'Attrezzi Anonimi' });
verifica('card nel calendario', await slot.count() === 1);
verifica('tre icone sulla card', (await slot.locator('.so-pf-i').count()) === 3);
await slot.hover();
await pausa(2500);

// 4. uscito (simulato: è il giro del cron)
await sotto('5 · At the scheduled time the scheduler publishes via /business/video/publish/ and checks /business/publish/status/.');
await page.evaluate(() => { __banco.pubblica('banco-attrezzi'); return carica().then(disegna); });
await pausa(3000);
await sotto('6 · Each post shows its link on every platform, TikTok included.');
await tocca(page.locator('.so-sl').filter({ hasText: 'Attrezzi Anonimi' }), 2500);
const hosts = await page.locator('.so-pfr a.so-b').evaluateAll((a) => a.map((x) => new URL(x.href).hostname));
verifica('link Instagram e TikTok nella scheda', hosts.some((h) => h.endsWith('instagram.com')) && hosts.some((h) => h.endsWith('tiktok.com')));
await pausa(2500);
await page.keyboard.press('Escape');
await pausa(600);

// 5. risultati
await sotto('7 · Results: Instagram and TikTok are measured separately, side by side.');
await tocca(page.locator('aside .nav-item', { hasText: 'Risultati' }), 2200);
const ttSel = page.locator('.so-sel-b').filter({ hasText: 'TikTok' });
await tocca(ttSel, 2800);
verifica('selettore TikTok premuto', (await ttSel.getAttribute('aria-pressed')) === 'true');
await tocca(page.locator('.so-chip', { hasText: 'TikTok' }), 3000);
verifica('post TikTok elencati', (await page.locator('.so-righe li').count()) >= 1);
await tocca(page.locator('.so-chip', { hasText: 'Link in bio' }), 3000);
await sotto('We only publish to and read data from our own TikTok account.');
await pausa(3500);

// mobile: niente scroll orizzontale
taglioA = secondi();
await page.setViewportSize({ width: 390, height: 844 });
await pausa(400);
verifica('nessuno scroll orizzontale a 390px', await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));
verifica('nessun errore della pagina', !errori.length);

const video = page.video(), tFine = secondi();
await context.close();
await browser.close();
server.close();
if (REGISTRA && video) {
  const webm = await video.path(), mp4 = path.join(OUT, 'giro.mp4');
  // Il registratore parte in ritardo sull'orologio: il ritardo è la differenza fra il tempo passato e la durata del webm.
  const durata = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', webm]).toString().trim();
  const ritardo = Number.isFinite(durata) ? Math.max(0, tFine - durata) : 0;
  taglioDa = Math.max(0, taglioDa - ritardo); taglioA -= ritardo + 1;
  // Solo il giro: fuori l'avvio rimpicciolito e il controllo finale a 390px.
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(taglioDa), '-to', String(taglioA), '-i', webm, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4]);
  fs.rmSync(webm, { force: true });
  console.log('Video: ' + mp4);
}
for (const [n, ok] of esito) console.log((ok ? '✓ ' : '✕ ') + n);
if (errori.length) console.log(errori.join('\n'));
process.exit(esito.every(([, ok]) => ok) ? 0 : 1);
