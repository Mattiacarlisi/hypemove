// ============================================================
// HYPEMOVE · SOCIAL — post Instagram: obiettivi, programma, proposte, revisioni, idee, pubblicati.
// Dati: tabelle social_* (RLS: solo operatori, migration 20261125160000_social_panel.sql).
// Login: lo stesso email+password delle altre pagine interne (stessa sessione di kpi.html).
// Tutto il testo entra con textContent: qui non si costruisce mai HTML da stringhe.
// La pubblicazione su Instagram non passa da qui: publish_at è solo il programma.
// ============================================================
const SUPABASE_URL = 'https://fiwskdxntgcredypplub.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpd3NrZHhudGdjcmVkeXBwbHViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMzIxNzAsImV4cCI6MjA2NDYwODE3MH0.W5b8A2zfm0Oeo746SXcANdeRhd2HsAMk5ND9Uc-q7Uo';
const MEDIA = `${SUPABASE_URL}/storage/v1/object/public/social-media/`;
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const PAGINE = [
  ['obiettivi', 'Obiettivi', 'M4 20V10M10 20V4M16 20v-7M22 20H2'],
  ['programma', 'Programma', 'M4 6h16v15H4zM4 10h16M8 3v4M16 3v4'],
  ['proposte', 'Proposte', 'M4 4h7v9H4zM13 4h7v5h-7zM13 11h7v9h-7zM4 15h7v5H4z'],
  ['revisioni', 'Revisioni', 'M20 11a8 8 0 1 0-2.300 5.700M20 5v6h-6'],
  ['idee', 'Idee', 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.600 10.800c.6.500 1 1.200 1 2.200h5.200c0-1 .4-1.700 1-2.200A6 6 0 0 0 12 3z'],
  ['pubblicati', 'Pubblicati', 'M5 13l4 4L19 7'],
];
const STATI = { da_vedere: 'Da vedere', revisione: 'In revisione', rifatto: 'Rifatto, da rivedere', approvato: 'Approvato', scartato: 'Scartato', pubblicato: 'Pubblicato', archivio: 'Archivio' };
const TEMI = { sonoio: 'Sono io', parliamone: 'Parliamone', miserve: 'Mi serve', natale: 'Natale' };
const TEMI_NOTA = { sonoio: 'Per le condivisioni', parliamone: 'Per i commenti', miserve: 'Per i salvataggi', natale: 'Dall’8 al 27 dicembre' };
const FORMATI = { fr: 'Frase e risposta', qu: 'Carta a quadretti', pd: 'Prima e dopo', sc: 'Scene da film', fo: 'Foto di casa', na: 'Natale', fi: 'Figurine', tr: 'Tribunale di Moovy', tv: 'Quiz in tv', se: 'Da tenere', ar: 'Archivio' };
const SETTIMANA = 13;                 // post previsti a settimana (due al giorno, uno la domenica)
const INIZIO = '2026-11-30';

const S = { page: 'obiettivi', tema: 'tutti', stato: 'decidere', sett: null, apri: null, coda: [], posts: [], rev: [], idee: [], ob: [], kpi: null, caricato: false };
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
const inRevisione = () => S.posts.filter((p) => p.stato === 'revisione' || p.stato === 'rifatto');

// ── dati ──
async function carica() {
  const [p, r, i, o, k] = await Promise.all([
    sb.from('social_posts').select('*').order('ordine'),
    sb.from('social_revisioni').select('*').order('created_at'),
    sb.from('social_idee').select('*').order('id'),
    sb.from('social_obiettivi').select('*').order('ordine'),
    sb.rpc('social_kpi'),
  ]);
  const err = [p, r, i, o].find((x) => x.error);
  if (err) throw err.error;
  Object.assign(S, { posts: p.data, rev: r.data, idee: i.data, ob: o.data, kpi: k.error ? null : k.data, caricato: true });
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
function conta(k) { return k === 'proposte' ? daDecidere().length : k === 'revisioni' ? S.posts.filter((p) => p.stato === 'rifatto').length : 0; }
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
    el('button', { type: 'button', className: 'so-pic', aria: { label: 'Apri ' + p.titolo }, on: { click: () => apri(p.id, coda) } }, m ? el('img', { src: thumb(m), alt: p.titolo, loading: 'lazy' }) : null, tag ? el('span', { className: 'so-tag', textContent: tag }) : null),
    el('div', { className: 'so-cb' },
      el('div', { className: 'so-riga' }, el('span', { className: 'so-st ' + p.stato, textContent: STATI[p.stato] }), p.publish_at && p.stato !== 'pubblicato' ? el('span', { textContent: leggibile(giorno(p.publish_at), { day: 'numeric', month: 'short' }) + ' ' + ora(p.publish_at) }) : null),
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
  const stato = () => { const diversa = ta.value.trim() !== p.didascalia; salva.hidden = chiuso || !diversa; if (indietro) indietro.hidden = chiuso || diversa; };
  ta.addEventListener('input', () => { B.did = ta.value; alza(ta); stato(); }); stato();
  dx.append(el('div', {}, el('label', { className: 'so-lab', for: 'so-did', textContent: 'Didascalia' }), ta, el('div', { className: 'so-fine', style: 'margin-top:8px' }, salva, indietro)));
  if (p.etichetta_ia || p.fonte) dx.append(el('div', { className: 'so-riga' }, p.etichetta_ia ? el('span', { className: 'so-st rifatto', textContent: 'Va pubblicato con l’etichetta IA' }) : null, p.fonte ? el('span', { textContent: p.fonte }) : null));

  // decisione
  if (!chiuso) {
    const dopo = async (id, st, detto) => { const i = S.coda.indexOf(id), prossimo = S.coda[i + 1]; if (await decidi(id, st, detto) && prossimo && S.apri === id) apri(prossimo, S.coda); };
    dx.append(el('div', { className: 'so-tre' },
      bottone(p.stato === 'approvato' ? 'Approvato ✓' : 'Approva', p.stato === 'approvato' ? 'si' : 'pri', () => p.stato === 'approvato' ? decidi(p.id, 'da_vedere', 'Torna da vedere') : dopo(p.id, 'approvato', 'Approvato')),
      bottone('Rimanda', S.rivedi ? 'rev' : '', () => { S.rivedi = !S.rivedi; scheda(); }, { aria: { expanded: String(!!S.rivedi) } }),
      bottone(p.stato === 'scartato' ? 'Recupera' : 'Scarta', 'no', () => p.stato === 'scartato' ? decidi(p.id, 'da_vedere', 'Recuperato') : dopo(p.id, 'scartato', 'Scartato'))));
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

  // programma
  if (!['archivio', 'scartato', 'pubblicato'].includes(p.stato)) {
    const g = el('input', { type: 'date', className: 'so-in', id: 'so-g', value: p.publish_at ? giorno(p.publish_at) : '', aria: { label: 'Giorno' } });
    const o = el('input', { type: 'time', className: 'so-in', value: p.publish_at ? ora(p.publish_at) : '12:30', aria: { label: 'Ora' } });
    const sal = bottone('Sposta', 'pri', () => { if (!g.value || !o.value) { g.focus(); return; } aggiorna(p.id, { publish_at: istante(g.value, o.value) }, 'Messo in programma'); });
    const tog = p.publish_at ? bottone('Togli dal programma', '', () => aggiorna(p.id, { publish_at: null }, 'Tolto dal programma')) : null;
    const agg = () => { sal.hidden = !!p.publish_at && g.value === giorno(p.publish_at) && o.value === ora(p.publish_at); sal.textContent = p.publish_at ? 'Sposta' : 'Metti in programma'; };
    g.addEventListener('input', agg); o.addEventListener('input', agg); agg();
    dx.append(el('div', {}, el('label', { className: 'so-lab', for: 'so-g', textContent: 'Quando esce' }), el('div', { className: 'so-due' }, g, o), el('div', { className: 'so-fine', style: 'margin-top:8px' }, sal, tog)));
  }
  if (p.stato === 'approvato') {
    const l = el('input', { type: 'url', className: 'so-in', id: 'so-link', placeholder: 'https://www.instagram.com/p/…', style: 'width:100%', value: B.link || '' });
    l.addEventListener('input', () => { B.link = l.value; });
    dx.append(el('div', { className: 'so-box' }, el('label', { className: 'so-lab', for: 'so-link', style: 'margin:0', textContent: 'Pubblicato a mano?' }), l, bottone('Segna come pubblicato', '', () => { const v = l.value.trim(); if (v && !/^https:\/\/(www\.)?instagram\.com\//.test(v)) { toast('Il link deve essere di Instagram.', false); return; } aggiorna(p.id, { stato: 'pubblicato', pubblicato_il: new Date().toISOString(), permalink: v || null }, 'Segnato come pubblicato'); })));
  }
  if (p.stato === 'pubblicato') dx.append(el('p', { className: 'so-riga', textContent: 'Pubblicato ' + (p.pubblicato_il ? leggibile(giorno(p.pubblicato_il), { day: 'numeric', month: 'long' }) + ' alle ' + ora(p.pubblicato_il) : '') }), p.permalink ? el('a', { href: p.permalink, target: '_blank', rel: 'noopener', textContent: 'Apri su Instagram', style: 'color:var(--purple);font-weight:600' }) : null);
  const i = S.coda.indexOf(p.id);
  if (S.coda.length > 1) dx.append(el('div', { className: 'so-frecce' }, bottone('‹ Prima', '', () => passa(-1), { disabled: i <= 0 }), bottone('Dopo ›', '', () => passa(1), { disabled: i >= S.coda.length - 1 })));

  const box = el('div', { className: 'so-sch', role: 'dialog', aria: { modal: 'true', label: p.titolo } }, sxVecchia && sxVecchia.dataset.media === JSON.stringify(p.media) ? sxVecchia : sx, dx);
  const vel = el('div', { className: 'so-vel', on: { click: (e) => { if (e.target === vel) chiudiSeSalvato(); } } }, box);
  vel.dataset.id = p.id;
  document.body.append(vel);
  alza(ta);
  if (stessa) box.scrollTop = scroll;
  if (S.rivedi && !stessa) box.querySelector('#so-nota')?.scrollIntoView({ block: 'center' });
}
document.addEventListener('keydown', (e) => { if (!S.apri || /TEXTAREA|INPUT/.test(e.target.tagName)) return; if (e.key === 'Escape') chiudiSeSalvato(); if (e.key === 'ArrowLeft') passa(-1); if (e.key === 'ArrowRight') passa(1); });

// ── pagine ──
const VISTE = {
  obiettivi(main) {
    main.append(testa('Obiettivi e KPI', 'Dal 30 novembre al 28 febbraio. Bilancio il 3 gennaio.'));
    const ult = S.kpi?.at(-1), prec = S.kpi?.at(-2);
    const box = el('div', { className: 'so-ob' });
    S.ob.forEach((o, n) => {
      let v = o.valore, sotto = null;
      if (o.id === 'avvii') { v = ult?.avvii ?? null; sotto = ult ? 'Questo mese' + (prec ? ', il mese scorso ' + prec.avvii : '') : null; }
      else if (o.id === 'post') { v = S.posts.filter((p) => p.stato === 'pubblicato').length; sotto = daDecidere().length + ' da decidere, ' + S.posts.filter((p) => p.stato === 'approvato').length + ' approvati'; }
      else if (v == null) sotto = 'Da misurare: serve Instagram collegato';
      else sotto = 'Letto il ' + leggibile(o.valore_il, { day: 'numeric', month: 'long' });
      const art = el('article', { className: n === 0 ? 'grande' : '' }, el('h3', { textContent: o.nome + (o.unita ? ' ' + o.unita : '') }),
        el('div', { className: 'so-num' }, num(v), el('small', { textContent: ' su ' + num(o.obiettivo) })),
        el('div', { className: 'so-bar' }, el('i', { style: 'width:' + Math.max(0, Math.min(100, (v || 0) / o.obiettivo * 100)) + '%' })),
        sotto ? el('p', { textContent: sotto }) : null);
      if (!o.automatico) art.append(el('button', { type: 'button', className: 'so-mod', textContent: 'Aggiorna a mano', on: { click: (e) => {
        const inp = el('input', { type: 'number', inputMode: 'decimal', className: 'so-in', style: 'width:100%', value: o.valore ?? '', aria: { label: o.nome } });
        e.target.replaceWith(el('div', { className: 'so-due' }, inp, bottone('Salva', 'pri', () => { if (inp.value === '' || !Number.isFinite(+inp.value)) { inp.focus(); return; } scrivi(() => sb.from('social_obiettivi').update({ valore: +inp.value, valore_il: giorno(Date.now()) }).eq('id', o.id), 'Aggiornato'); })));
        inp.focus();
      } } }));
      box.append(art);
    });
    main.append(box, el('h2', { className: 'so-h2' }, 'Dalla bio all’app', el('small', { textContent: 'Contati da noi, senza robot' })));
    if (!S.kpi) { main.append(vuoto('I numeri non si caricano. Riapri la pagina.')); return; }
    main.append(el('div', { className: 'table-wrap' }, el('table', { className: 'so-tab' }, el('thead', {}, el('tr', {}, ['Mese', 'Pagina del link', 'Tocchi su Android', 'Primi avvii', 'Post'].map((t) => el('th', { textContent: t })))), el('tbody', {}, S.kpi.slice().reverse().map((r) => el('tr', {}, el('td', { textContent: leggibile(r.mese + '-01', { month: 'long', year: 'numeric' }) }), [r.visite, r.android, r.avvii, r.pubblicati].map((v) => el('td', { textContent: num(v) }))))))));
  },

  programma(main) {
    const oggi = giorno(Date.now());
    S.sett ??= lunedi(oggi < INIZIO ? INIZIO : oggi);
    const gg = Array.from({ length: 7 }, (_, n) => piu(S.sett, n));
    const quando = (p) => p.stato === 'pubblicato' ? p.pubblicato_il : p.publish_at;
    const del = (g) => S.posts.filter((p) => quando(p) && p.stato !== 'scartato' && p.stato !== 'archivio' && giorno(quando(p)) === g).sort((a, b) => quando(a) < quando(b) ? -1 : 1);
    const tutti = gg.flatMap(del), ok = tutti.filter((p) => p.stato === 'approvato' || p.stato === 'pubblicato').length;
    main.append(testa('Programma', tutti.length + ' post su ' + SETTIMANA + ', ' + ok + ' approvati'));
    main.append(el('p', { className: 'so-avviso', textContent: 'Instagram non è ancora collegato: gli orari non partono da soli.' }));
    main.append(el('div', { className: 'so-sett' }, bottone('‹', '', () => { S.sett = piu(S.sett, -7); disegna(); }, { aria: { label: 'Settimana prima' }, style: 'width:46px' }), el('b', { textContent: leggibile(gg[0], { day: 'numeric', month: 'short' }) + ' – ' + leggibile(gg[6], { day: 'numeric', month: 'short' }) }), bottone('›', '', () => { S.sett = piu(S.sett, 7); disegna(); }, { aria: { label: 'Settimana dopo' }, style: 'width:46px' })));
    const coda = tutti.map((p) => p.id);
    main.append(el('div', { className: 'so-gg' }, gg.map((g) => el('section', { className: 'so-g' + (g === oggi ? ' oggi' : '') }, el('b', { textContent: leggibile(g, { weekday: 'short', day: 'numeric', month: 'short' }) }),
      del(g).map((p) => el('button', { type: 'button', className: 'so-sl ' + p.stato, on: { click: () => apri(p.id, coda) } }, p.media[0] ? el('img', { src: thumb(p.media[0]), alt: '', loading: 'lazy' }) : null, el('span', {}, el('time', { textContent: ora(quando(p)) }), el('span', { textContent: p.titolo }), el('span', { className: 'so-st ' + p.stato, textContent: STATI[p.stato] })))),
      g >= oggi ? el('button', { type: 'button', className: 'so-piu', textContent: '+ Aggiungi', on: { click: () => scegli(g) } }) : null))));
  },

  proposte(main) {
    const tutti = S.posts.filter((p) => p.stato !== 'pubblicato');
    const F = { decidere: ['Da decidere', (p) => p.stato === 'da_vedere' || p.stato === 'rifatto'], revisione: ['In revisione', (p) => p.stato === 'revisione'], approvato: ['Approvati', (p) => p.stato === 'approvato'], scartato: ['Scartati', (p) => p.stato === 'scartato'], archivio: ['Archivio', (p) => p.stato === 'archivio'] };
    const perTema = (p) => S.tema === 'tutti' || (S.stato === 'archivio' ? true : p.tema === S.tema);
    main.append(testa('Proposte', daDecidere().length + ' da decidere'));
    const chip = (on, t, n, fn) => el('button', { type: 'button', className: 'so-chip' + (on ? ' on' : ''), aria: { pressed: String(on) }, on: { click: fn } }, t, n != null ? el('b', { textContent: n }) : null);
    main.append(el('div', { className: 'so-fil', aria: { label: 'Stato' } }, Object.entries(F).map(([k, [t, f]]) => chip(S.stato === k, t, tutti.filter(f).length, () => { S.stato = k; disegna(); }))));
    if (S.stato !== 'archivio') main.append(el('div', { className: 'so-fil', aria: { label: 'Tema' } }, chip(S.tema === 'tutti', 'Tutti', null, () => { S.tema = 'tutti'; disegna(); }), Object.entries(TEMI).map(([k, t]) => chip(S.tema === k, t, tutti.filter((p) => p.tema === k && F[S.stato][1](p)).length, () => { S.tema = k; disegna(); }))));
    const vis = tutti.filter((p) => F[S.stato][1](p) && perTema(p));
    if (!vis.length) { main.append(vuoto(S.stato === 'decidere' ? 'Hai deciso tutto.' : 'Niente qui.')); return; }
    const gruppi = []; for (const p of vis) { const k = S.stato === 'archivio' ? 'archivio' : p.tema + '/' + p.formato; let g = gruppi.find((x) => x.k === k); if (!g) gruppi.push(g = { k, p, l: [] }); g.l.push(p); }
    const coda = gruppi.flatMap((g) => g.l.map((p) => p.id));
    for (const g of gruppi) main.append(el('h2', { className: 'so-h2' }, FORMATI[g.p.formato] || '', S.stato === 'archivio' ? null : el('small', { textContent: g.p.formato === 'na' ? TEMI_NOTA.natale : TEMI[g.p.tema] + '. ' + TEMI_NOTA[g.p.tema] })), el('div', { className: 'so-grid' }, g.l.map((p) => carta(p, coda))));
  },

  revisioni(main) {
    const a = S.posts.filter((p) => p.stato === 'rifatto'), b = S.posts.filter((p) => p.stato === 'revisione');
    main.append(testa('Revisioni', b.length === 1 ? '1 richiesta aperta' : b.length + ' richieste aperte'));
    if (!a.length && !b.length) { main.append(vuoto('Nessuna revisione. Le chiedi da un post, con «Rimanda».')); return; }
    const coda = inRevisione().map((p) => p.id);
    if (a.length) main.append(el('h2', { className: 'so-h2' }, 'Rifatti', el('small', { textContent: 'Tocca a te' })), el('div', { className: 'so-grid' }, a.map((p) => carta(p, coda))));
    if (b.length) main.append(el('h2', { className: 'so-h2' }, 'Da rifare', el('small', { textContent: 'Tocca a Claude' })), el('div', { className: 'so-grid' }, b.map((p) => carta(p, coda))));
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

  pubblicati(main) {
    const l = S.posts.filter((p) => p.stato === 'pubblicato').sort((a, b) => a.pubblicato_il < b.pubblicato_il ? 1 : -1);
    main.append(testa('Pubblicati', l.length + ' post'));
    if (!l.length) { main.append(vuoto('Ancora niente.')); return; }
    const coda = l.map((p) => p.id);
    main.append(el('div', { className: 'so-grid' }, l.map((p) => carta(p, coda))));
    main.append(el('p', { className: 'so-vuoto', textContent: 'Visualizzazioni, commenti e condivisioni arrivano quando Instagram è collegato.' }));
  },
};

// «+ Aggiungi» nel programma: scegli fra i post senza data, prima gli approvati
function scegli(g) {
  const l = S.posts.filter((p) => !p.publish_at && ['approvato', 'da_vedere', 'rifatto'].includes(p.stato)).sort((a, b) => (a.stato === 'approvato' ? 0 : 1) - (b.stato === 'approvato' ? 0 : 1));
  const presi = S.posts.filter((p) => p.publish_at && p.stato !== 'scartato' && giorno(p.publish_at) === g).map((p) => ora(p.publish_at));
  const h = presi.includes('12:30') ? '20:30' : '12:30';
  const via = () => { vel.remove(); document.body.style.overflow = ''; };
  const vel = el('div', { className: 'so-vel', on: { click: (e) => { if (e.target === vel) via(); } } }, el('div', { className: 'so-sch', style: 'display:block;padding:18px', role: 'dialog', aria: { modal: 'true', label: 'Scegli un post' } },
    el('div', { className: 'so-tit', style: 'margin-bottom:14px' }, el('h2', { textContent: leggibile(g) + ', ore ' + h }), el('button', { type: 'button', className: 'so-x', textContent: '✕', aria: { label: 'Chiudi' }, on: { click: via } })),
    l.length ? el('div', { className: 'so-grid' }, l.map((p) => el('article', { className: 'so-card' }, el('button', { type: 'button', className: 'so-pic', aria: { label: 'Metti ' + p.titolo }, on: { click: () => { via(); aggiorna(p.id, { publish_at: istante(g, h) }, 'Messo in programma'); } } }, p.media[0] ? el('img', { src: thumb(p.media[0]), alt: '', loading: 'lazy' }) : null), el('div', { className: 'so-cb' }, el('span', { className: 'so-st ' + p.stato, style: 'justify-self:start', textContent: STATI[p.stato] }), el('strong', { textContent: p.titolo }))))) : vuoto('Non ci sono post liberi.')));
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
