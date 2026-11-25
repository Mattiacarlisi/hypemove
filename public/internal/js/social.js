// ============================================================
// HYPEMOVE · SOCIAL — Instagram in cinque pagine: Oggi (cosa serve da te), Post, Programma, Risultati, Idee.
// Dati: tabelle social_* (RLS: solo operatori, migration 20261125160000 e seguenti).
// Login: lo stesso email+password delle altre pagine interne (stessa sessione di kpi.html).
// Tutto il testo entra con textContent: qui non si costruisce mai HTML da stringhe.
// La pubblicazione su Instagram non passa da qui: publish_at è solo il programma.
// ============================================================
const SUPABASE_URL = 'https://fiwskdxntgcredypplub.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpd3NrZHhudGdjcmVkeXBwbHViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMzIxNzAsImV4cCI6MjA2NDYwODE3MH0.W5b8A2zfm0Oeo746SXcANdeRhd2HsAMk5ND9Uc-q7Uo';
const MEDIA = `${SUPABASE_URL}/storage/v1/object/public/social-media/`;
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const PAGINE = [
  ['oggi', 'Oggi', 'M3 11l9-8 9 8M5 10v10h14V10M10 20v-6h4v6'],
  ['post', 'Post', 'M4 4h7v9H4zM13 4h7v5h-7zM13 11h7v9h-7zM4 15h7v5H4z'],
  ['programma', 'Programma', 'M4 6h16v15H4zM4 10h16M8 3v4M16 3v4'],
  ['risultati', 'Risultati', 'M4 20V10M10 20V4M16 20v-7M22 20H2'],
  ['idee', 'Idee', 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.600 10.800c.6.500 1 1.200 1 2.200h5.200c0-1 .4-1.700 1-2.200A6 6 0 0 0 12 3z'],
];
const STATI = { da_vedere: 'Da vedere', revisione: 'In revisione', rifatto: 'Rifatto, da rivedere', approvato: 'Approvato', scartato: 'Scartato', pubblicato: 'Pubblicato', archivio: 'Archivio' };
const TEMI = { sonoio: 'Sono io', parliamone: 'Parliamone', miserve: 'Mi serve', natale: 'Natale' };
const TEMI_NOTA = { sonoio: 'Per le condivisioni', parliamone: 'Per i commenti', miserve: 'Per i salvataggi', natale: 'Dall’8 al 27 dicembre' };
const FORMATI = { fr: 'Frase e risposta', qu: 'Carta a quadretti', pd: 'Prima e dopo', sc: 'Scene da film', fo: 'Foto di casa', na: 'Natale', fi: 'Figurine', tr: 'Tribunale di Moovy', tv: 'Quiz in tv', se: 'Da tenere', ar: 'Archivio' };
const SETTIMANA = 13;                 // post previsti a settimana (due al giorno, uno la domenica)
const INIZIO = '2026-11-30';

const S = { page: 'oggi', tema: 'tutti', stato: 'decidere', ris: 'obiettivi', giorni: 30, link: null, ig: null, conn: null, sett: null, apri: null, coda: [], posts: [], rev: [], idee: [], ob: [], kpi: null, caricato: false };
try { const p = localStorage.getItem('hm_social_page'); if (PAGINE.some(([k]) => k === p)) S.page = p; } catch (e) {}

// ── piccoli attrezzi ──
function el(tag, props, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (k === 'on') for (const [ev, fn] of Object.entries(v)) e.addEventListener(ev, fn);
    else if (k === 'aria') for (const [a, x] of Object.entries(v)) e.setAttribute('aria-' + a, x);
    else if (k === 'role' || k === 'for') e.setAttribute(k, v);
    else e[k] = v;
  }
  e.append(...kids.flat(Infinity).filter((x) => x != null && x !== false));
  return e;
}
const icona = (d) => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor'); s.setAttribute('stroke-width', '1.900'); s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round'); s.setAttribute('width', '18'); s.setAttribute('height', '18'); s.setAttribute('aria-hidden', 'true'); const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', d); s.append(p); return s; };
const bottone = (txt, cls, fn, extra) => el('button', { type: 'button', className: 'so-b ' + (cls || ''), textContent: txt, on: { click: fn }, ...(extra || {}) });
const thumb = (m) => MEDIA + m.path.replace('posts/', 'thumbs/').replace(/\.mp4$/, '.jpg');
const ROMA = 'Europe/Rome';
const fmtGiorno = new Intl.DateTimeFormat('sv-SE', { timeZone: ROMA, year: 'numeric', month: '2-digit', day: '2-digit' });
const fmtOra = new Intl.DateTimeFormat('it-IT', { timeZone: ROMA, hour: '2-digit', minute: '2-digit', hour12: false });
const giorno = (d) => fmtGiorno.format(new Date(d));
const ora = (d) => fmtOra.format(new Date(d));
const leggibile = (iso, opz) => new Intl.DateTimeFormat('it-IT', { timeZone: 'UTC', ...(opz || { weekday: 'long', day: 'numeric', month: 'long' }) }).format(new Date(iso + 'T12:00:00Z'));
const piu = (iso, n) => { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const lunedi = (iso) => piu(iso, -((new Date(iso + 'T12:00:00Z').getUTCDay() + 6) % 7));
// «30 novembre, 12:30» di Roma → istante, anche a cavallo dell'ora legale
function istante(g, h) { const u = new Date(`${g}T${h}:00Z`).getTime(); const sposta = (t) => { const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: ROMA, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).formatToParts(new Date(t)).map((x) => [x.type, x.value])); return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - t; }; let t = u - sposta(u); t = u - sposta(t); return new Date(t).toISOString(); }
const num = (v) => v == null ? '–' : new Intl.NumberFormat('it-IT').format(v);
const alza = (t) => { t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight + 4, 420) + 'px'; };
let toastT;
function toast(msg, ok) { document.querySelector('.toast')?.remove(); const t = el('div', { className: 'toast ' + (ok === false ? 'error' : 'success'), textContent: msg, role: 'status' }); document.body.append(t); clearTimeout(toastT); toastT = setTimeout(() => t.remove(), 3200); }
const post = (id) => S.posts.find((p) => p.id === id);
const revDi = (id) => S.rev.filter((r) => r.post_id === id).sort((a, b) => a.created_at < b.created_at ? -1 : 1);
const daDecidere = () => S.posts.filter((p) => p.stato === 'da_vedere' || p.stato === 'rifatto');
const approvatiLiberi = () => S.posts.filter((p) => p.stato === 'approvato' && !p.publish_at);
const controlliOk = (p) => Array.isArray(p.controlli) && p.controlli.every((c) => c.ok);
// Controlli della didascalia: si ricalcolano mentre si scrive.
function controllaTesto(t) {
  const out = [];
  const tag = (t.match(/#[\p{L}\d_]+/gu) || []).length;
  if (t.length > 2200) out.push('Troppo lunga: ' + t.length + ' caratteri su 2.200');
  if (tag > 30) out.push(tag + ' hashtag, il massimo è 30');
  if (/\b(gratis|gratuit[aoie])\b/i.test(t)) out.push('C’è «gratis»');
  if (/duolingo/i.test(t)) out.push('C’è «Duolingo»');
  if (/\btagga\b|scrivi v o f/i.test(t)) out.push('Chiede di taggare o di scrivere una parola: Instagram lo penalizza');
  if (/https?:\/\//i.test(t)) out.push('I link nella didascalia non si possono toccare');
  return out;
}
const pronto = (p) => controlliOk(p) && !controllaTesto(p.didascalia).length;

// ── dati ──
async function carica() {
  const [p, r, i, o, k, c, l, d] = await Promise.all([
    sb.from('social_posts').select('*').order('ordine'),
    sb.from('social_revisioni').select('*').order('created_at'),
    sb.from('social_idee').select('*').order('id'),
    sb.from('social_obiettivi').select('*').order('ordine'),
    sb.rpc('social_kpi'),
    sb.from('social_instagram').select('*'),
    sb.rpc('social_link', { p_giorni: S.giorni }),
    sb.rpc('social_instagram_dati'),
  ]);
  const err = [p, r, i, o].find((x) => x.error);
  if (err) throw err.error;
  Object.assign(S, { posts: p.data, rev: r.data, idee: i.data, ob: o.data, kpi: k.error ? null : k.data, conn: c.error ? null : c.data?.[0] ?? null, link: l.error ? null : l.data, ig: d.error ? null : d.data, caricato: true });
}
// Ogni scrittura: prima il server, poi la pagina si ridisegna con quello che il server ha davvero.
let occupato = false;
async function scrivi(fn, detto) {
  if (occupato) return false;
  occupato = true;
  try {
    const { error } = await fn();
    if (error) throw error;
    await carica();
    if (detto) toast(detto);
    return true;
  } catch (e) {
    console.error('social', e);
    toast(navigator.onLine === false ? 'Sei senza connessione. Non è stato salvato.' : 'Non salvato. Riprova.', false);
    return false;
  } finally { occupato = false; disegna(); }
}
const decidi = (id, stato, detto) => scrivi(() => sb.rpc('social_decidi', { p_post: id, p_stato: stato }), detto);
const aggiorna = (id, campi, detto) => scrivi(() => sb.from('social_posts').update(campi).eq('id', id), detto);

// ── cornice ──
function conta(k) { return k === 'post' ? daDecidere().length : k === 'programma' ? approvatiLiberi().length : 0; }
function vai(k) { S.page = k; try { localStorage.setItem('hm_social_page', k); } catch (e) {} window.scrollTo(0, 0); disegna(); }
function disegna() {
  const app = document.getElementById('app');
  const voci = (cls) => PAGINE.map(([k, t, d]) => { const n = conta(k); return el('button', { type: 'button', className: cls + (S.page === k ? (cls ? ' active' : 'on') : ''), on: { click: () => vai(k) }, aria: S.page === k ? { current: 'page' } : {} }, icona(d), cls ? t : el('span', { textContent: t }), n ? el('span', { className: 'so-n', textContent: n }) : null); });
  const main = el('main', { className: 'main so-main' });
  app.replaceChildren(
    el('aside', { className: 'sidebar' }, el('a', { className: 'sidebar-logo', href: 'index.html' }, el('div', { className: 'logo-mark' }, 'Hype', el('span', { textContent: 'move' })), el('div', { className: 'logo-sub', textContent: 'Social' })), el('nav', { className: 'nav' }, voci('nav-item')), el('div', { className: 'nav', style: 'flex:none' }, el('button', { type: 'button', className: 'nav-item', textContent: 'Esci', on: { click: esci } }))),
    main,
    el('nav', { className: 'so-bassa', aria: { label: 'Sezioni' } }, voci('')),
  );
  if (!S.caricato) { main.append(el('p', { className: 'so-vuoto', textContent: 'Carico…' })); return; }
  VISTE[S.page](main);
  scheda();
}
const testa = (t, s) => el('div', { className: 'so-head' }, el('h1', { textContent: t }), s ? el('p', { textContent: s }) : null);
const vuoto = (t) => el('p', { className: 'so-vuoto', textContent: t });

// ── carta di un post ──
function carta(p, coda) {
  const m = p.media[0], ultima = revDi(p.id).at(-1);
  const tag = m?.type === 'video' ? 'Reel' : p.media.length > 1 ? p.media.length + ' pagine' : null;
  return el('article', { className: 'so-card' },
    el('button', { type: 'button', className: 'so-pic', aria: { label: 'Apri ' + p.titolo }, on: { click: () => apri(p.id, coda) } }, m ? el('img', { src: thumb(m), alt: p.titolo, loading: 'lazy' }) : null, tag ? el('span', { className: 'so-tag', textContent: tag }) : null, !pronto(p) && !['pubblicato', 'archivio'].includes(p.stato) ? el('span', { className: 'so-tag rosso', textContent: 'Da sistemare' }) : null),
    el('div', { className: 'so-cb' },
      el('div', { className: 'so-riga' }, el('span', { className: 'so-st ' + p.stato, textContent: STATI[p.stato] }), p.publish_at && p.stato !== 'pubblicato' ? el('span', { textContent: leggibile(giorno(p.publish_at), { day: 'numeric', month: 'short' }) + ' ' + ora(p.publish_at) }) : p.data_consigliata && p.stato !== 'pubblicato' ? el('span', { textContent: 'per il ' + leggibile(p.data_consigliata, { day: 'numeric', month: 'short' }) }) : null),
      el('strong', { textContent: p.titolo }),
      p.stato === 'rifatto' && ultima?.risposta ? el('p', { textContent: ultima.risposta, style: 'color:#b7f0cb' }) : p.stato === 'revisione' && ultima ? el('p', { textContent: '«' + ultima.nota + '»' }) : p.didascalia ? el('p', { textContent: p.didascalia }) : null,
      ['pubblicato', 'archivio'].includes(p.stato) ? null : el('div', { className: 'so-az' },
        bottone('Approva', p.stato === 'approvato' ? 'si' : '', () => decidi(p.id, p.stato === 'approvato' ? 'da_vedere' : 'approvato', p.stato === 'approvato' ? 'Torna da vedere' : 'Approvato'), { aria: { pressed: String(p.stato === 'approvato') } }),
        bottone('Rimanda', p.stato === 'revisione' ? 'rev' : '', () => apri(p.id, coda, true)),
        bottone('Scarta', p.stato === 'scartato' ? 'no' : '', () => decidi(p.id, p.stato === 'scartato' ? 'da_vedere' : 'scartato', p.stato === 'scartato' ? 'Recuperato' : 'Scartato'), { aria: { pressed: String(p.stato === 'scartato') } }))));
}
function apri(id, coda, rivedi) { S.apri = id; S.coda = coda || [id]; S.rivedi = !!rivedi; S.bozza = {}; scheda(); }
function chiudi() { S.apri = null; S.bozza = {}; document.querySelector('.so-vel')?.remove(); document.body.style.overflow = ''; }
function sporco() { const p = post(S.apri); return p && ((S.bozza.did != null && S.bozza.did !== p.didascalia) || (S.bozza.nota || '').trim()); }
function chiudiSeSalvato() { if (sporco() && !S.avvisato) { S.avvisato = true; toast('Hai scritto qualcosa che non è salvato. Tocca di nuovo per chiudere.', false); setTimeout(() => { S.avvisato = false; }, 4000); return; } S.avvisato = false; chiudi(); }
function passa(d) { const i = S.coda.indexOf(S.apri) + d; if (i < 0 || i >= S.coda.length) return; if (sporco() && !S.avvisato) { chiudiSeSalvato(); return; } S.avvisato = false; apri(S.coda[i], S.coda); }

// ── scheda di un post ──
function scheda() {
  const vecchia = document.querySelector('.so-vel'), scroll = vecchia?.querySelector('.so-sch')?.scrollTop || 0, stessa = vecchia?.dataset.id === S.apri, sxVecchia = stessa ? vecchia.querySelector('.so-sx') : null;
  vecchia?.remove();
  const p = S.apri && post(S.apri);
  if (!p) { document.body.style.overflow = ''; return; }
  document.body.style.overflow = 'hidden';
  const barra = [];
  const B = S.bozza, chiuso = ['pubblicato', 'archivio'].includes(p.stato);
  const giro = el('div', { className: 'so-giro', tabIndex: 0 }, p.media.map((m, n) => m.type === 'video' ? el('video', { src: MEDIA + m.path, poster: thumb(m), controls: true, playsInline: true, preload: 'none' }) : el('img', { src: MEDIA + m.path, alt: p.titolo + (p.media.length > 1 ? ', pagina ' + (n + 1) : '') })));
  const pag = p.media.length > 1 ? el('div', { className: 'so-pag', textContent: '1 di ' + p.media.length }) : null;
  if (pag) giro.addEventListener('scroll', () => { pag.textContent = Math.round(giro.scrollLeft / giro.clientWidth + 1) + ' di ' + p.media.length; });
  const sx = el('div', { className: 'so-sx' }, giro, pag);
  sx.dataset.media = JSON.stringify(p.media);
  const dx = el('div', { className: 'so-dx' });
  dx.append(el('div', { className: 'so-tit' }, el('div', { style: 'flex:1;min-width:0;display:grid;gap:6px' }, el('div', { className: 'so-riga' }, el('span', { className: 'so-st ' + p.stato, textContent: STATI[p.stato] }), el('span', { textContent: FORMATI[p.formato] || '' })), el('h2', { textContent: p.titolo })), el('button', { type: 'button', className: 'so-x', textContent: '✕', aria: { label: 'Chiudi' }, on: { click: chiudiSeSalvato } })));

  // didascalia
  const ta = el('textarea', { className: 'so-ta', id: 'so-did', value: B.did ?? p.didascalia, maxLength: 2200, readOnly: chiuso });
  const salva = bottone('Salva didascalia', 'pri', async () => { const v = ta.value.trim(); B.did = null; if (!(await aggiorna(p.id, { didascalia: v }, 'Didascalia salvata'))) { B.did = v; scheda(); } });
  const indietro = p.didascalia_prec != null && p.didascalia_prec !== p.didascalia ? bottone('Torna a quella di prima', '', () => { B.did = null; aggiorna(p.id, { didascalia: p.didascalia_prec }, 'Rimessa quella di prima'); }) : null;
  const avv = el('ul', { className: 'so-avv' }), cont = el('small');
  const stato = () => { const diversa = ta.value.trim() !== p.didascalia; cont.textContent = ta.value.length + ' su 2.200'; avv.replaceChildren(...(chiuso ? [] : controllaTesto(ta.value).map((x) => el('li', { textContent: x })))); salva.hidden = chiuso || !diversa; if (indietro) indietro.hidden = chiuso || diversa; };
  ta.addEventListener('input', () => { B.did = ta.value; alza(ta); stato(); }); stato();
  dx.append(el('div', {}, el('label', { className: 'so-lab', for: 'so-did', textContent: 'Didascalia' }), ta, avv, el('div', { className: 'so-fine', style: 'margin-top:8px' }, salva, indietro, cont)));
  if (p.etichetta_ia || p.fonte) dx.append(el('div', { className: 'so-riga' }, p.etichetta_ia ? el('span', { className: 'so-st rifatto', textContent: 'Va pubblicato con l’etichetta IA' }) : null, p.fonte ? el('span', { textContent: p.fonte }) : null));

  if (!['archivio', 'pubblicato'].includes(p.stato)) {
    const cc = Array.isArray(p.controlli) ? p.controlli : [], no = cc.filter((c) => !c.ok);
    dx.append(el('details', { className: 'so-contr' + (cc.length && !no.length ? ' ok' : ' no'), open: no.length > 0 }, el('summary', { textContent: !cc.length ? 'Controlli non ancora fatti' : no.length ? no.length + ' da sistemare' : cc.length + ' controlli superati' }), el('ul', {}, cc.map((c) => el('li', { className: c.ok ? '' : 'no', textContent: (c.ok ? '✓ ' : '✕ ') + c.t })))));
  }
  // decisione
  if (!chiuso) {
    const dopo = async (id, st, detto) => { const i = S.coda.indexOf(id), prossimo = S.coda[i + 1]; if (await decidi(id, st, detto) && prossimo && S.apri === id) apri(prossimo, S.coda); };
    barra.push(
      bottone(p.stato === 'approvato' ? 'Approvato ✓' : 'Approva', p.stato === 'approvato' ? 'si' : 'pri', () => p.stato === 'approvato' ? decidi(p.id, 'da_vedere', 'Torna da vedere') : dopo(p.id, 'approvato', 'Approvato')),
      bottone('Rimanda', S.rivedi ? 'rev' : '', () => { S.rivedi = !S.rivedi; scheda(); if (S.rivedi) document.getElementById('so-nota')?.scrollIntoView({ block: 'center' }); }, { aria: { expanded: String(!!S.rivedi) } }),
      bottone(p.stato === 'scartato' ? 'Recupera' : 'Scarta', 'no', () => p.stato === 'scartato' ? decidi(p.id, 'da_vedere', 'Recuperato') : dopo(p.id, 'scartato', 'Scartato')));
    if (S.rivedi) {
      B.cosa ??= 'tutto';
      const nota = el('textarea', { className: 'so-ta', id: 'so-nota', value: B.nota || '', maxLength: 2000, placeholder: 'Cosa non ti piace? Come lo vorresti?' });
      const inv = bottone('Invia', 'pri', async () => { const n = nota.value.trim(); if (!n) { nota.focus(); return; } inv.disabled = true; if (await scrivi(() => sb.rpc('social_rimanda', { p_post: p.id, p_cosa: B.cosa, p_nota: n }), 'Inviata')) { S.rivedi = false; S.bozza.nota = ''; scheda(); } });
      inv.disabled = !(B.nota || '').trim();
      nota.addEventListener('input', () => { B.nota = nota.value; inv.disabled = !nota.value.trim(); });
      dx.append(el('div', { className: 'so-box' }, el('span', { className: 'so-lab', style: 'margin:0', textContent: 'Cosa va rifatto' }),
        el('div', { className: 'so-tre' }, [['tutto', 'Tutto'], ['immagine', p.media[0]?.type === 'video' ? 'Video' : 'Immagine'], ['didascalia', 'Didascalia']].map(([k, t]) => bottone(t, B.cosa === k ? 'rev' : '', () => { B.cosa = k; B.nota = nota.value; scheda(); }, { aria: { pressed: String(B.cosa === k) } }))),
        nota, inv));
    }
  }
  // storia
  const r = revDi(p.id);
  if (r.length) dx.append(el('div', {}, el('span', { className: 'so-lab', textContent: 'Revisioni' }), el('div', { className: 'so-note' }, r.map((x) => [
    el('div', {}, el('small', { textContent: { tutto: 'Tutto', immagine: 'Immagine', didascalia: 'Didascalia' }[x.cosa] + ', ' + leggibile(giorno(x.created_at), { day: 'numeric', month: 'short' }) + ' ' + ora(x.created_at) + (x.stato === 'chiusa' ? ', chiusa' : '') }), x.nota),
    x.risposta ? el('div', { className: 'risp' }, el('small', { textContent: 'Fatto' }), x.risposta) : null]))));

  // programma: solo i post approvati
  if (p.stato === 'approvato') {
    const ok = pronto(p);
    const g = el('input', { type: 'date', className: 'so-in', id: 'so-g', value: p.publish_at ? giorno(p.publish_at) : p.data_consigliata || '', aria: { label: 'Giorno' } });
    const o = el('input', { type: 'time', className: 'so-in', value: p.publish_at ? ora(p.publish_at) : '12:30', aria: { label: 'Ora' } });
    const sal = bottone('Sposta', 'pri', () => { if (!g.value || !o.value) { g.focus(); return; } aggiorna(p.id, { publish_at: istante(g.value, o.value) }, 'Messo in programma'); });
    const tog = p.publish_at ? bottone('Togli dal programma', '', () => aggiorna(p.id, { publish_at: null }, 'Tolto dal programma')) : null;
    const agg = () => { sal.hidden = !!p.publish_at && g.value === giorno(p.publish_at) && o.value === ora(p.publish_at); sal.textContent = p.publish_at ? 'Sposta' : 'Metti in programma'; sal.disabled = !ok; };
    g.addEventListener('input', agg); o.addEventListener('input', agg); agg();
    dx.append(el('div', {}, el('label', { className: 'so-lab', for: 'so-g', textContent: 'Quando esce' }), el('div', { className: 'so-due' }, g, o), el('div', { className: 'so-fine', style: 'margin-top:8px' }, sal, tog), ok ? null : el('p', { className: 'so-riga', textContent: 'Prima vanno sistemati i controlli.' })));
  } else if (!['archivio', 'scartato', 'pubblicato'].includes(p.stato) && p.data_consigliata) dx.append(el('p', { className: 'so-riga', textContent: 'Pensato per ' + leggibile(p.data_consigliata) }));
  if (p.stato === 'approvato') {
    const l = el('input', { type: 'url', className: 'so-in', id: 'so-link', placeholder: 'https://www.instagram.com/p/…', style: 'width:100%', value: B.link || '' });
    l.addEventListener('input', () => { B.link = l.value; });
    dx.append(el('div', { className: 'so-box' }, el('label', { className: 'so-lab', for: 'so-link', style: 'margin:0', textContent: 'Pubblicato a mano?' }), l, bottone('Segna come pubblicato', '', () => { const v = l.value.trim(); if (v && !/^https:\/\/(www\.)?instagram\.com\//.test(v)) { toast('Il link deve essere di Instagram.', false); return; } aggiorna(p.id, { stato: 'pubblicato', pubblicato_il: new Date().toISOString(), permalink: v || null }, 'Segnato come pubblicato'); })));
  }
  if (p.stato === 'pubblicato') dx.append(el('p', { className: 'so-riga', textContent: 'Pubblicato ' + (p.pubblicato_il ? leggibile(giorno(p.pubblicato_il), { day: 'numeric', month: 'long' }) + ' alle ' + ora(p.pubblicato_il) : '') }), p.permalink ? el('a', { href: p.permalink, target: '_blank', rel: 'noopener', textContent: 'Apri su Instagram', style: 'color:var(--purple);font-weight:600' }) : null);
  const i = S.coda.indexOf(p.id);
  if (S.coda.length > 1 || barra.length) dx.append(el('div', { className: 'so-frecce' }, bottone('‹', 'fr', () => passa(-1), { disabled: i <= 0, aria: { label: 'Post prima' } }), barra, bottone('›', 'fr', () => passa(1), { disabled: i >= S.coda.length - 1, aria: { label: 'Post dopo' } })));

  const box = el('div', { className: 'so-sch', role: 'dialog', aria: { modal: 'true', label: p.titolo } }, sxVecchia && sxVecchia.dataset.media === JSON.stringify(p.media) ? sxVecchia : sx, dx);
  const vel = el('div', { className: 'so-vel', on: { click: (e) => { if (e.target === vel) chiudiSeSalvato(); } } }, box);
  vel.dataset.id = p.id;
  document.body.append(vel);
  alza(ta);
  if (stessa) box.scrollTop = scroll;
  if (S.rivedi && !stessa) box.querySelector('#so-nota')?.scrollIntoView({ block: 'center' });
  if (S.coda.length > 1) box.querySelector('.so-tit .so-riga')?.append(el('span', { textContent: (S.coda.indexOf(p.id) + 1) + ' di ' + S.coda.length }));
}
document.addEventListener('keydown', (e) => { if (!S.apri || /TEXTAREA|INPUT/.test(e.target.tagName)) return; if (e.key === 'Escape') chiudiSeSalvato(); if (e.key === 'ArrowLeft') passa(-1); if (e.key === 'ArrowRight') passa(1); });

// ── pagine ──
const chip = (on, t, n, fn) => el('button', { type: 'button', className: 'so-chip' + (on ? ' on' : ''), aria: { pressed: String(on) }, on: { click: fn } }, t, n != null ? el('b', { textContent: n }) : null);
const quando = (p) => p.stato === 'pubblicato' ? p.pubblicato_il : p.publish_at;
const delGiorno = (g) => S.posts.filter((p) => quando(p) && ['approvato', 'pubblicato'].includes(p.stato) && giorno(quando(p)) === g).sort((a, b) => quando(a) < quando(b) ? -1 : 1);
const collegato = () => !!S.conn?.collegato_il;
const perc = (a, b) => b ? Math.round(a / b * 100) + '%' : '–';

// Barre di un solo colore, una per giorno: il dettaglio si legge passando o toccando, e c'è la tabella sotto.
function barre(righe, chiave, titolo) {
  const max = Math.max(1, ...righe.map((r) => r[chiave])), tot = righe.reduce((n, r) => n + r[chiave], 0);
  const base = tot + ' in ' + righe.length + ' giorni', nota = el('span', { textContent: base, role: 'status' });
  const box = el('div', { className: 'so-barre', tabIndex: 0, aria: { label: titolo + ', ' + base } }, righe.map((r) => { const b = el('i', {}); b.style.height = r[chiave] ? Math.max(5, r[chiave] / max * 100) + '%' : '2px'; if (!r[chiave]) b.className = 'zero'; return el('div', {}, b); }));
  let sel = -1;
  const mostra = (i) => { box.children[sel]?.classList.remove('on'); sel = i; if (i < 0) { nota.textContent = base; return; } box.children[i].classList.add('on'); nota.textContent = leggibile(righe[i].g, { weekday: 'short', day: 'numeric', month: 'short' }) + ': ' + righe[i][chiave]; };
  const da = (e) => { const r = box.getBoundingClientRect(); mostra(Math.max(0, Math.min(righe.length - 1, Math.floor((e.clientX - r.left) / r.width * righe.length)))); };
  box.addEventListener('pointermove', da); box.addEventListener('pointerdown', da); box.addEventListener('pointerleave', () => mostra(-1)); box.addEventListener('blur', () => mostra(-1));
  box.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); mostra(Math.max(0, Math.min(righe.length - 1, sel < 0 ? righe.length - 1 : sel + (e.key === 'ArrowRight' ? 1 : -1)))); } });
  return el('div', { className: 'so-graf' }, el('div', { className: 'so-gt' }, el('b', { textContent: titolo }), nota), box, el('div', { className: 'so-asse' }, el('span', { textContent: leggibile(righe[0].g, { day: 'numeric', month: 'short' }) }), el('span', { textContent: 'oggi' })));
}
function imbuto(passi) {
  const max = Math.max(1, ...passi.map((x) => x[1] || 0));
  return el('ol', { className: 'so-imb' }, passi.map(([t, n, sotto], i) => el('li', {}, el('div', {}, el('span', { textContent: t }), el('b', { textContent: n == null ? '–' : num(n) })), el('div', { className: 'so-bar' }, el('i', { style: 'width:' + (n ? Math.max(1.5, n / max * 100) : 0) + '%' })), sotto || (i && n != null && passi[i - 1][1] ? el('small', { textContent: perc(n, passi[i - 1][1]) + ' del passo prima' }) : null))));
}

// Mette gli approvati senza data nei primi posti liberi (12:30 e 20:30, la domenica uno), formati alternati; Natale alla sua data.
function pianoAutomatico() {
  const oggi = giorno(Date.now()), dal = oggi < INIZIO ? INIZIO : piu(oggi, 1);
  const pieni = {}, formati = {}; for (const p of S.posts) if (p.publish_at && p.stato === 'approvato') { const g = giorno(p.publish_at); (pieni[g] ??= new Set()).add(ora(p.publish_at)); (formati[g] ??= []).push(p.formato); }
  const orari = (g) => new Date(g + 'T12:00:00Z').getUTCDay() === 0 ? ['12:30'] : ['12:30', '20:30'];
  const metti = (p, g, h) => { (pieni[g] ??= new Set()).add(h); (formati[g] ??= []).push(p.formato); out.push({ id: p.id, publish_at: istante(g, h) }); };
  const out = [], liberi = approvatiLiberi().filter(pronto);
  for (const p of liberi.filter((x) => x.data_consigliata && x.data_consigliata >= oggi)) { const h = ['20:30', '12:30'].find((x) => !pieni[p.data_consigliata]?.has(x)); if (h) metti(p, p.data_consigliata, h); }
  const resto = liberi.filter((x) => !x.data_consigliata);
  for (let i = 0; i < 90 && resto.length; i++) { const g = piu(dal, i); for (const h of orari(g)) { if (pieni[g]?.has(h) || !resto.length) continue; const ieri = formati[piu(g, -1)] || []; let k = resto.findIndex((p) => !(formati[g] || []).includes(p.formato) && !ieri.includes(p.formato)); if (k < 0) k = resto.findIndex((p) => !(formati[g] || []).includes(p.formato)); if (k < 0) k = 0; metti(resto.splice(k, 1)[0], g, h); } }
  return out;
}

const VISTE = {
  oggi(main) {
    const oggi = giorno(Date.now()), d = daDecidere(), rif = S.posts.filter((p) => p.stato === 'rifatto'), rev = S.posts.filter((p) => p.stato === 'revisione'), lib = approvatiLiberi();
    main.append(testa('Oggi', leggibile(oggi)));
    const voce = (n, t, sotto, azione, fn, forte) => el('section', { className: 'so-voce' + (forte ? ' forte' : '') }, el('div', {}, el('b', { className: 'so-num', textContent: n }), el('div', {}, el('strong', { textContent: t }), sotto ? el('span', { textContent: sotto }) : null)), azione ? bottone(azione, forte ? 'pri' : '', fn) : null);
    const box = el('div', { className: 'so-voci' });
    if (d.length) box.append(voce(d.length, d.length === 1 ? 'post da decidere' : 'post da decidere', rif.length ? rif.length + (rif.length === 1 ? ' rifatto come chiedevi' : ' rifatti come chiedevi') : 'Uno alla volta', 'Inizia', () => { const c = [...rif, ...d.filter((p) => p.stato !== 'rifatto')].map((p) => p.id); apri(c[0], c); }, true));
    if (lib.length) box.append(voce(lib.length, lib.length === 1 ? 'approvato senza data' : 'approvati senza data', null, 'Metti in programma', () => vai('programma'), !d.length));
    if (rev.length) box.append(voce(rev.length, rev.length === 1 ? 'da rifare' : 'da rifare', 'Tocca a Claude', 'Vedi', () => { S.stato = 'revisione'; S.tema = 'tutti'; vai('post'); }));
    if (!d.length && !lib.length && !rev.length) box.append(vuoto('Tutto deciso.'));
    main.append(box);
    if (!collegato()) main.append(el('button', { type: 'button', className: 'so-avviso so-avb', on: { click: () => { S.ris = 'instagram'; vai('risultati'); } } }, 'Instagram da collegare: manca un passaggio tuo ›'));
    else if (S.conn.ultimo_errore) main.append(el('p', { className: 'so-avviso', textContent: 'Instagram non si aggiorna: ' + S.conn.ultimo_errore }));
    main.append(el('h2', { className: 'so-h2' }, 'Prossimi sette giorni'), el('div', { className: 'so-7' }, Array.from({ length: 7 }, (_, i) => piu(oggi, i)).map((g) => { const n = delGiorno(g).length; return el('button', { type: 'button', className: n ? 'pieno' : '', aria: { label: leggibile(g) + ', ' + n + ' post' }, on: { click: () => { S.sett = lunedi(g); vai('programma'); } } }, el('span', { textContent: leggibile(g, { weekday: 'short' }) }), el('b', { textContent: leggibile(g, { day: 'numeric' }) }), el('i', { textContent: n || '–' })); })));
    if (S.link) { const o = S.link.ora; main.append(el('h2', { className: 'so-h2' }, 'Link in bio', el('small', { textContent: 'Ultimi ' + S.giorni + ' giorni' })), el('button', { type: 'button', className: 'so-tre so-tile', aria: { label: 'Apri i numeri del link' }, on: { click: () => { S.ris = 'link'; vai('risultati'); } } }, [['Visite', o.visite], ['Tocchi su Android', o.android], ['Primi avvii', o.avvii]].map(([t, n]) => el('span', {}, el('b', { className: 'so-num', textContent: num(n) }), t)))); }
  },

  post(main) {
    const F = { decidere: ['Da decidere', (p) => p.stato === 'da_vedere' || p.stato === 'rifatto'], revisione: ['In revisione', (p) => p.stato === 'revisione'], approvato: ['Approvati', (p) => p.stato === 'approvato'], pubblicato: ['Pubblicati', (p) => p.stato === 'pubblicato'], scartato: ['Scartati', (p) => p.stato === 'scartato'], archivio: ['Archivio', (p) => p.stato === 'archivio'] };
    const f = F[S.stato][1], senzaTema = ['archivio', 'pubblicato'].includes(S.stato);
    main.append(testa('Post'));
    main.append(el('div', { className: 'so-fil', role: 'group', aria: { label: 'Stato' } }, Object.entries(F).map(([k, [t, g]]) => chip(S.stato === k, t, S.posts.filter(g).length, () => { S.stato = k; disegna(); }))));
    if (!senzaTema) main.append(el('div', { className: 'so-fil', role: 'group', aria: { label: 'Tema' } }, chip(S.tema === 'tutti', 'Tutti i temi', null, () => { S.tema = 'tutti'; disegna(); }), Object.entries(TEMI).map(([k, t]) => chip(S.tema === k, t, S.posts.filter((p) => p.tema === k && f(p)).length, () => { S.tema = k; disegna(); }))));
    const vis = S.posts.filter((p) => f(p) && (senzaTema || S.tema === 'tutti' || p.tema === S.tema)).sort((a, b) => (a.stato === 'rifatto' ? 0 : 1) - (b.stato === 'rifatto' ? 0 : 1) || a.ordine - b.ordine);
    if (S.stato === 'pubblicato') vis.sort((a, b) => a.pubblicato_il < b.pubblicato_il ? 1 : -1);
    if (!vis.length) { main.append(vuoto({ decidere: 'Hai deciso tutto.', revisione: 'Niente da rifare. Da un post, tocca «Rimanda».', approvato: 'Nessun post approvato.', pubblicato: 'Ancora niente.' }[S.stato] || 'Niente qui.')); return; }
    const gruppi = []; for (const p of vis) { const k = p.stato === 'rifatto' ? 'rifatto' : senzaTema ? S.stato : p.tema + '/' + p.formato; let g = gruppi.find((x) => x.k === k); if (!g) gruppi.push(g = { k, p, l: [] }); g.l.push(p); }
    const coda = gruppi.flatMap((g) => g.l.map((p) => p.id));
    for (const g of gruppi) main.append(g.k === 'rifatto' ? el('h2', { className: 'so-h2' }, 'Rifatti', el('small', { textContent: 'Come chiedevi tu' })) : senzaTema ? '' : el('h2', { className: 'so-h2' }, FORMATI[g.p.formato] || '', el('small', { textContent: g.p.formato === 'na' ? TEMI_NOTA.natale : TEMI[g.p.tema] + '. ' + TEMI_NOTA[g.p.tema] })), el('div', { className: 'so-grid' }, g.l.map((p) => carta(p, coda))));
  },

  programma(main) {
    const oggi = giorno(Date.now()), lib = approvatiLiberi();
    S.sett ??= lunedi(oggi < INIZIO ? INIZIO : oggi);
    const gg = Array.from({ length: 7 }, (_, n) => piu(S.sett, n)), tutti = gg.flatMap(delGiorno);
    main.append(testa('Programma', tutti.length + ' post su ' + SETTIMANA + ' questa settimana'));
    if (!collegato()) main.append(el('p', { className: 'so-avviso', textContent: 'Instagram non è ancora collegato: gli orari non partono da soli.' }));
    if (lib.length) {
      const buoni = lib.filter(pronto), piano = pianoAutomatico();
      main.append(el('section', { className: 'so-box', style: 'margin-bottom:18px' }, el('div', { className: 'so-fine' }, el('strong', { textContent: lib.length === 1 ? '1 approvato senza data' : lib.length + ' approvati senza data' }), buoni.length ? bottone('Distribuisci da solo', 'pri', () => scrivi(async () => { for (const x of piano) { const r = await sb.from('social_posts').update({ publish_at: x.publish_at }).eq('id', x.id); if (r.error) return r; } return {}; }, piano.length + (piano.length === 1 ? ' messo in programma' : ' messi in programma'))) : null),
        el('div', { className: 'so-fila' }, lib.map((p) => el('button', { type: 'button', aria: { label: 'Apri ' + p.titolo }, on: { click: () => apri(p.id, lib.map((x) => x.id)) } }, p.media[0] ? el('img', { src: thumb(p.media[0]), alt: p.titolo, loading: 'lazy' }) : p.titolo)))));
    }
    main.append(el('div', { className: 'so-sett' }, bottone('‹', '', () => { S.sett = piu(S.sett, -7); disegna(); }, { aria: { label: 'Settimana prima' }, style: 'width:46px' }), el('b', { textContent: leggibile(gg[0], { day: 'numeric', month: 'short' }) + ' – ' + leggibile(gg[6], { day: 'numeric', month: 'short' }) }), bottone('›', '', () => { S.sett = piu(S.sett, 7); disegna(); }, { aria: { label: 'Settimana dopo' }, style: 'width:46px' })));
    const coda = tutti.map((p) => p.id);
    main.append(el('div', { className: 'so-gg' }, gg.map((g) => el('section', { className: 'so-g' + (g === oggi ? ' oggi' : '') }, el('b', { textContent: leggibile(g, { weekday: 'short', day: 'numeric', month: 'short' }) }),
      delGiorno(g).map((p) => el('button', { type: 'button', className: 'so-sl ' + p.stato, on: { click: () => apri(p.id, coda) } }, p.media[0] ? el('img', { src: thumb(p.media[0]), alt: '', loading: 'lazy' }) : null, el('span', {}, el('time', { textContent: ora(quando(p)) }), el('span', { textContent: p.titolo }), p.stato === 'pubblicato' ? el('span', { className: 'so-st pubblicato', textContent: 'Pubblicato' }) : null))),
      g >= oggi ? el('button', { type: 'button', className: 'so-piu', textContent: '+ Aggiungi', disabled: !lib.length, on: { click: () => scegli(g) } }) : null))));
    if (!lib.length && !tutti.length) main.append(vuoto('Qui entrano solo i post che approvi.'));
  },

  risultati(main) {
    main.append(testa('Risultati'));
    const T = { obiettivi: 'Obiettivi', link: 'Link in bio', instagram: 'Instagram', messaggi: 'Messaggi' };
    main.append(el('div', { className: 'so-fil seg', role: 'group', aria: { label: 'Risultati' } }, Object.entries(T).map(([k, t]) => chip(S.ris === k, t, null, () => { S.ris = k; disegna(); }))));
    ({ obiettivi: vObiettivi, link: vLink, instagram: vInstagram, messaggi: vMessaggi })[S.ris](main);
  },

  idee(main) {
    const vive = S.idee.filter((i) => i.stato === 'riserva' || i.stato === 'da_fare');
    main.append(testa('Riserva di idee', vive.filter((i) => i.stato === 'da_fare').length + ' da fare, ' + vive.filter((i) => i.stato === 'riserva').length + ' in riserva'));
    const t = el('input', { className: 'so-in', style: 'width:100%', placeholder: 'La tua idea', maxLength: 300, aria: { label: 'La tua idea' } }), d = el('input', { className: 'so-in', style: 'width:100%', placeholder: 'Dettagli, se servono', maxLength: 1000, aria: { label: 'Dettagli' } });
    const te = el('select', { className: 'so-in', aria: { label: 'Tema' } }, Object.entries(TEMI).map(([k, x]) => el('option', { value: k, textContent: x })));
    main.append(el('form', { className: 'so-box', on: { submit: (e) => { e.preventDefault(); const v = t.value.trim(); if (!v) { t.focus(); return; } scrivi(() => sb.from('social_idee').insert({ titolo: v, dettaglio: d.value.trim(), tema: te.value, stato: 'da_fare', mia: true }), 'Idea aggiunta'); } } }, t, d, el('div', { className: 'so-due' }, te, el('button', { className: 'so-b pri', textContent: 'Aggiungi' }))));
    const riga = (i) => el('div', { className: 'so-idea' }, el('div', {}, el('b', { textContent: i.titolo }), el('span', { textContent: [i.mia ? 'Tua' : null, i.dettaglio].filter(Boolean).join('. ') })), el('div', {},
      bottone(i.stato === 'da_fare' ? 'Da fare ✓' : 'Falla', i.stato === 'da_fare' ? 'si' : '', () => scrivi(() => sb.from('social_idee').update({ stato: i.stato === 'da_fare' ? 'riserva' : 'da_fare' }).eq('id', i.id))),
      bottone('Scarta', '', () => scrivi(() => sb.from('social_idee').update({ stato: 'scartata' }).eq('id', i.id), 'Scartata'))));
    for (const [k, x] of Object.entries(TEMI)) { const l = vive.filter((i) => i.tema === k).sort((a, b) => (a.stato === 'da_fare' ? 0 : 1) - (b.stato === 'da_fare' ? 0 : 1)); if (l.length) main.append(el('h2', { className: 'so-h2' }, x, el('small', { textContent: TEMI_NOTA[k] })), ...l.map(riga)); }
    const via = S.idee.filter((i) => i.stato === 'scartata');
    if (via.length) main.append(el('details', { style: 'margin-top:24px' }, el('summary', { style: 'cursor:pointer;color:var(--muted);padding:10px 0', textContent: 'Scartate (' + via.length + ')' }), via.map((i) => el('div', { className: 'so-idea' }, el('div', {}, el('b', { textContent: i.titolo })), el('div', {}, bottone('Recupera', '', () => scrivi(() => sb.from('social_idee').update({ stato: 'riserva' }).eq('id', i.id), 'Recuperata')))))));
  },

};

// ── risultati ──
function vObiettivi(main) {
  main.append(el('p', { className: 'so-riga', style: 'margin-bottom:12px', textContent: 'Dal 30 novembre al 28 febbraio. Bilancio il 3 gennaio.' }));
  const ult = S.kpi?.at(-1), prec = S.kpi?.at(-2), box = el('div', { className: 'so-ob' });
  S.ob.forEach((o, n) => {
    let v = o.valore, sotto = null;
    if (o.id === 'avvii') { v = ult?.avvii ?? null; sotto = ult ? 'Questo mese' + (prec ? ', il mese scorso ' + prec.avvii : '') : null; }
    else if (o.id === 'post') { v = S.posts.filter((p) => p.stato === 'pubblicato').length; sotto = daDecidere().length + ' da decidere, ' + S.posts.filter((p) => p.stato === 'approvato').length + ' approvati'; }
    else if (o.id === 'foll' && S.ig?.account?.follower != null) { v = S.ig.account.follower; sotto = 'Da Instagram'; }
    else if (v == null) sotto = 'Da misurare: serve Instagram collegato';
    else sotto = 'Letto il ' + leggibile(o.valore_il, { day: 'numeric', month: 'long' });
    const art = el('article', { className: n === 0 ? 'grande' : '' }, el('h3', { textContent: o.nome + (o.unita ? ' ' + o.unita : '') }), el('div', { className: 'so-num' }, num(v), el('small', { textContent: ' su ' + num(o.obiettivo) })), el('div', { className: 'so-bar' }, el('i', { style: 'width:' + Math.max(0, Math.min(100, (v || 0) / o.obiettivo * 100)) + '%' })), sotto ? el('p', { textContent: sotto }) : null);
    if (!o.automatico && sotto !== 'Da Instagram') art.append(el('button', { type: 'button', className: 'so-mod', textContent: 'Aggiorna a mano', on: { click: (e) => { const inp = el('input', { type: 'number', inputMode: 'decimal', className: 'so-in', style: 'width:100%', value: o.valore ?? '', aria: { label: o.nome } }); e.target.replaceWith(el('div', { className: 'so-due' }, inp, bottone('Salva', 'pri', () => { if (inp.value === '' || !Number.isFinite(+inp.value)) { inp.focus(); return; } scrivi(() => sb.from('social_obiettivi').update({ valore: +inp.value, valore_il: giorno(Date.now()) }).eq('id', o.id), 'Aggiornato'); }))); inp.focus(); } } }));
    box.append(art);
  });
  main.append(box);
}

function vLink(main) {
  const L = S.link;
  main.append(el('div', { className: 'so-fil', role: 'group', aria: { label: 'Periodo' } }, [7, 30, 90].map((g) => chip(S.giorni === g, g + ' giorni', null, async () => { S.giorni = g; const { data, error } = await sb.rpc('social_link', { p_giorni: g }); if (error) toast('Non si carica. Riprova.', false); else S.link = data; disegna(); }))));
  if (!L) { main.append(vuoto('I numeri non si caricano. Riapri la pagina.')); return; }
  const conf = (a, b) => L.prima_intero ? 'prima ' + num(b) : null;
  main.append(el('div', { className: 'so-tre so-tile' }, [['Visite alla pagina', 'visite'], ['Tocchi su Android', 'android'], ['Primi avvii', 'avvii']].map(([t, k]) => el('span', {}, el('b', { className: 'so-num', textContent: num(L.ora[k]) }), t, conf(L.ora[k], L.prima[k]) ? el('small', { textContent: conf(L.ora[k], L.prima[k]) }) : null))));
  if (!L.prima_intero) main.append(el('p', { className: 'so-riga', style: 'margin:8px 0 0', textContent: 'Contiamo dal 10 ottobre, quindi manca il confronto col periodo prima.' }));
  main.append(el('h2', { className: 'so-h2' }, 'Dalla bio all’app'), imbuto([['Apre hypemove.app/link', L.ora.visite], ['Tocca «Scarica per Android»', L.ora.android], ['Apre l’app la prima volta', L.ora.avvii]]));
  main.append(el('p', { className: 'so-riga', style: 'margin-top:8px', textContent: 'Solo Android: su iPhone l’arrivo non si vede. Tolti i robot.' }));
  main.append(el('h2', { className: 'so-h2' }, 'Giorno per giorno'), barre(L.giorni, 'visite', 'Visite'), barre(L.giorni, 'android', 'Tocchi su Android'));
  const N = { android: 'Scarica per Android', iphone: 'iPhone', sito: 'Sito', guide: 'Guide', coach: 'Coach' };
  if (L.destinazioni.length) main.append(el('h2', { className: 'so-h2' }, 'Dove toccano'), el('ul', { className: 'so-righe' }, L.destinazioni.map((d) => el('li', {}, el('span', { textContent: N[d.link] || d.link }), el('b', { textContent: num(d.n) })))));
  main.append(el('details', { style: 'margin-top:20px' }, el('summary', { className: 'so-sum', textContent: 'Tabella' }), el('div', { className: 'table-wrap' }, el('table', { className: 'so-tab' }, el('thead', {}, el('tr', {}, ['Giorno', 'Visite', 'Android', 'Primi avvii'].map((t) => el('th', { textContent: t })))), el('tbody', {}, L.giorni.slice().reverse().filter((r) => r.visite || r.android || r.avvii).map((r) => el('tr', {}, el('td', { textContent: leggibile(r.g, { day: 'numeric', month: 'short' }) }), [r.visite, r.android, r.avvii].map((v) => el('td', { textContent: v })))))))));
}

function vInstagram(main) {
  if (!collegato()) {
    const inp = el('input', { type: 'password', className: 'so-in', style: 'width:100%', placeholder: 'Incolla qui la chiave (EAA…)', autocomplete: 'off', aria: { label: 'Chiave di Meta' } }), out = el('p', { className: 'so-riga', role: 'status' });
    const b = bottone('Collega', 'pri', async () => {
      const token = inp.value.trim(); if (!token) { inp.focus(); return; }
      b.disabled = true; out.textContent = 'Controllo con Meta e scarico i dati, ci vuole circa un minuto…';
      const { data, error } = await sb.functions.invoke('social-instagram', { body: { azione: 'collega', token } });
      let msg = data?.errore; if (error) { try { msg = (await error.context.json()).errore; } catch (e) { msg = 'Non riesco a collegarmi. Riprova.'; } }
      inp.value = ''; b.disabled = false;
      if (msg) { out.textContent = msg; return; }
      toast('Collegato: @' + (data.username || 'hypemove.app')); await carica().catch(() => {}); disegna();
    });
    main.append(el('section', { className: 'so-box' }, el('strong', { style: 'font-size:16px', textContent: 'Collega @hypemove.app' }),
      el('ol', { className: 'so-passi' }, el('li', {}, 'Apri ', el('a', { href: 'https://business.facebook.com/latest/settings/system_users?business_id=981913040519792&selected_user_id=61582721401522', target: '_blank', rel: 'noopener', textContent: 'Utenti di sistema su Meta' }), ' e tocca «Genera token».'), el('li', { textContent: 'App «Hypemove», scadenza «Mai».' }), el('li', {}, 'Spunta: ', el('b', { textContent: 'instagram_basic, instagram_content_publish, instagram_manage_comments, instagram_manage_insights, instagram_manage_messages, pages_show_list, pages_read_engagement' }), '.'), el('li', { textContent: 'Copia la chiave e incollala qui.' })),
      inp, b, out, el('p', { className: 'so-riga', textContent: 'Finisce nella cassaforte del server: da qui non si può rileggere.' })));
    return;
  }
  const I = S.ig, C = S.conn;
  const agg = bottone('Aggiorna ora', '', async () => { agg.disabled = true; agg.textContent = 'Aggiorno…'; const { error } = await sb.functions.invoke('social-instagram', { body: { azione: 'aggiorna' } }); if (error) toast('Non aggiornato. Riprova.', false); else toast('Aggiornato'); await carica().catch(() => {}); disegna(); });
  main.append(el('div', { className: 'so-fine', style: 'margin-bottom:12px' }, el('span', { className: 'so-riga', textContent: '@' + (C.username || 'hypemove.app') + (C.aggiornato_il ? ', aggiornato ' + leggibile(giorno(C.aggiornato_il), { day: 'numeric', month: 'short' }) + ' alle ' + ora(C.aggiornato_il) : '') }), agg));
  if (C.ultimo_errore) main.append(el('p', { className: 'so-avviso', textContent: C.ultimo_errore }));
  if (C.mancanti?.length) main.append(el('p', { className: 'so-avviso', textContent: 'Permessi mancanti: ' + C.mancanti.join(', ') }));
  if (!I) { main.append(vuoto('I numeri non si caricano.')); return; }
  const g = I.giorni30 || {};
  main.append(el('div', { className: 'so-tre so-tile quattro' }, [['Follower', I.account?.follower], ['Visualizzazioni', g.views], ['Persone raggiunte', g.reach], ['Interazioni', g.total_interactions], ['Tocchi sul link', g.profile_links_taps], ['Commenti', g.comments]].map(([t, n]) => el('span', {}, el('b', { className: 'so-num', textContent: num(n ?? null) }), t))));
  main.append(el('p', { className: 'so-riga', style: 'margin-top:8px', textContent: 'Ultimi 30 giorni, pubblicità compresa. «Persone raggiunte» somma i giorni.' }));
  main.append(el('h2', { className: 'so-h2' }, 'Post per post'), el('div', { className: 'table-wrap' }, el('table', { className: 'so-tab' }, el('thead', {}, el('tr', {}, ['Post', 'Viste', 'Commenti', 'Condivisi', 'Salvati'].map((t) => el('th', { textContent: t })))), el('tbody', {}, I.media.map((m) => el('tr', {}, el('td', {}, el('a', { href: m.link && m.link.startsWith('https://') ? m.link : '#', target: '_blank', rel: 'noopener', textContent: (m.testo || 'Senza testo').slice(0, 46) }), el('small', { style: 'display:block;color:var(--muted)', textContent: m.quando ? leggibile(giorno(m.quando), { day: 'numeric', month: 'short', year: '2-digit' }) : '' })), ['views', 'comments', 'shares', 'saved'].map((k) => el('td', { textContent: num(m.numeri[k] ?? null) }))))))));
}

function vMessaggi(main) {
  const m = S.ig?.messaggi, p = S.ig?.pena;
  main.append(el('p', { className: 'so-avviso', textContent: 'Le risposte automatiche sono spente: partono quando Instagram è collegato e la pagina delle pene è online.' }));
  if (!m || !p) { main.append(vuoto('I numeri non si caricano. Riapri la pagina.')); return; }
  main.append(el('h2', { className: 'so-h2', style: 'margin-top:4px' }, 'Tribunale: dal commento all’app'), imbuto([['Commenti ricevuti', m.commenti], ['Risposte sotto al post', m.risposte], ['Messaggi privati mandati', m.privati], ['Apre la pagina della pena', p.aperta], ['Inizia i 30 secondi', p.iniziata], ['Finisce la pena', p.finita], ['Tocca «Scarica»', p.android]]));
  main.append(el('ul', { className: 'so-righe', style: 'margin-top:16px' }, [['Denunce mandate a un’amica', p.denunce], ['Commenti saltati (salute, offese)', m.saltati], ['Messaggi non riusciti', m.errori]].map(([t, n]) => el('li', {}, el('span', { textContent: t }), el('b', { textContent: num(n) })))));
}

// «+ Aggiungi» nel programma: scegli fra i post senza data, prima gli approvati
function scegli(g) {
  const l = S.posts.filter((p) => !p.publish_at && p.stato === 'approvato' && pronto(p));
  const presi = S.posts.filter((p) => p.publish_at && p.stato !== 'scartato' && giorno(p.publish_at) === g).map((p) => ora(p.publish_at));
  const h = presi.includes('12:30') ? '20:30' : '12:30';
  const via = () => { vel.remove(); document.body.style.overflow = ''; };
  const vel = el('div', { className: 'so-vel', on: { click: (e) => { if (e.target === vel) via(); } } }, el('div', { className: 'so-sch', style: 'display:block;padding:18px', role: 'dialog', aria: { modal: 'true', label: 'Scegli un post' } },
    el('div', { className: 'so-tit', style: 'margin-bottom:14px' }, el('h2', { textContent: leggibile(g) + ', ore ' + h }), el('button', { type: 'button', className: 'so-x', textContent: '✕', aria: { label: 'Chiudi' }, on: { click: via } })),
    l.length ? el('div', { className: 'so-grid' }, l.map((p) => el('article', { className: 'so-card' }, el('button', { type: 'button', className: 'so-pic', aria: { label: 'Metti ' + p.titolo }, on: { click: () => { via(); aggiorna(p.id, { publish_at: istante(g, h) }, 'Messo in programma'); } } }, p.media[0] ? el('img', { src: thumb(p.media[0]), alt: '', loading: 'lazy' }) : null), el('div', { className: 'so-cb' }, el('span', { className: 'so-st ' + p.stato, style: 'justify-self:start', textContent: STATI[p.stato] }), el('strong', { textContent: p.titolo }))))) : vuoto('Nessun post approvato senza data. Approvane qualcuno dalla pagina Post.')));
  document.body.style.overflow = 'hidden';
  document.body.append(vel);
}

// ── ingresso ──
function porta(msg) {
  const em = el('input', { type: 'email', className: 'so-in', placeholder: 'Email', autocomplete: 'username', required: true, aria: { label: 'Email' } }), pw = el('input', { type: 'password', className: 'so-in', placeholder: 'Password', autocomplete: 'current-password', required: true, aria: { label: 'Password' } });
  const out = el('p', { textContent: msg || 'Lo stesso accesso della pagina KPI.', role: 'status' });
  document.getElementById('app').replaceChildren(el('div', { className: 'so-gate' }, el('form', { on: { submit: async (e) => { e.preventDefault(); out.textContent = 'Entro…'; const { error } = await sb.auth.signInWithPassword({ email: em.value.trim(), password: pw.value }); if (error) { out.textContent = 'Email o password non corrette.'; return; } avvia(); } } }, el('h1', { textContent: 'Social' }), out, em, pw, el('button', { className: 'so-b pri', textContent: 'Entra' }))));
}
async function esci() { await sb.auth.signOut({ scope: 'local' }); Object.assign(S, { caricato: false, apri: null }); porta(); }
async function avvia() {
  const { data } = await sb.auth.getSession();
  if (!data.session) { porta(); return; }
  const { data: ok, error } = await sb.rpc('is_internal_operator');
  if (error) { document.getElementById('app').replaceChildren(el('div', { className: 'so-gate' }, el('div', { style: 'display:grid;gap:12px;text-align:center' }, el('p', { textContent: 'Non riesco a collegarmi.' }), bottone('Riprova', 'pri', avvia)))); return; }
  if (!ok) { porta('Questo account non è abilitato.'); return; }
  disegna();
  try { await carica(); disegna(); } catch (e) { console.error('social', e); document.querySelector('.so-main')?.replaceChildren(vuoto('Non si carica.'), bottone('Riprova', 'pri', avvia)); }
}
// Tornando sulla pagina si rileggono i dati, ma mai mentre si sta scrivendo o con una scheda aperta.
document.addEventListener('visibilitychange', async () => { if (document.visibilityState !== 'visible' || !S.caricato || S.apri || occupato || /TEXTAREA|INPUT|SELECT/.test(document.activeElement?.tagName || '') || document.querySelector('.so-vel')) return; try { await carica(); disegna(); } catch (e) { console.error('social', e); } });
avvia();
