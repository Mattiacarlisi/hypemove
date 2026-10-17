// ── CONTO MENSILE ───────────────────────────────────────────────────────────────
// Conto economico mese per mese: dal prezzo pagato dagli utenti al netto che arriva da
// Google, meno Meta e gli altri costi, fino al risultato. Il mese in corso ha tre colonne
// (finora / previsto fino a fine mese / fine mese con forchetta).
//
// Fonti:
//   ordini e abbonamenti  RPC finance_conto_dati (solo operatori, nessun dato personale)
//   Meta mese in corso    API Meta giorno per giorno (stesso token del Registro);
//                         mesi chiusi: voce del Registro (categoria Marketing & ADS)
//   altri costi           Registro (finance_movimenti), per data
//   costi stimati         voci note che mancano nel Registro (CT_STIME) + AI da ai_calls;
//                         la stima di un mese sparisce appena nel Registro c'è la voce vera.
// Caricato PRIMA di finance.js: usa sb, state, setState, render, META_* solo a runtime.

const CT_DAL = '2026-02';                 // primo mese del conto (prima: solo pochi euro di hosting)
const CT_SYNC_STALE_MS = 30 * 60 * 1000;  // ordini Google più vecchi di così: si aggiornano entrando
const CT_STIME = {
  cambioUsdEur: 0.86,                     // indicativo: l'AI è stimata in dollari dall'app
  voci: [                                 // ultimo importo registrato, da quando manca
    { voce: 'Supabase',     cerca: 'supabase',     importo: 21.89, dal: '2026-08' },
    { voce: 'Google Cloud', cerca: 'google cloud', importo: 8.70,  dal: '2026-08' },
  ],
  ai: { voce: 'AI (OpenRouter)', cerca: 'openrouter', dal: '2026-08' },
};
// Soglie della scala «azienda vera» (ricerca del 17/10/2026, da confermare col commercialista)
const CT_SRL_MESE = 350;                  // costi fissi SRL: camera di commercio, libri, bilancio, commercialista
const CT_COMPENSI_MESE = 3983;            // due compensi minimi (18.808 €/anno) con INPS e IRAP
const CT_LISTINO = { annuale: 29.99, mensile: 9.90, rate: 2.50 };
const CT_MESI = ['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];
const CT_MESI_BREVI = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];

const ctRomeFmt = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit' });
function ctDay(d) { return ctRomeFmt.format(d instanceof Date ? d : new Date(d)); }   // 'YYYY-MM-DD' ora di Roma
function ctR2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }
function ctNet(lordo) { return ctR2(ctR2(lordo / 1.22) * 0.85); }                    // verificato su tutti gli ordini
function ctIva(lordo) { return ctR2(lordo - ctR2(lordo / 1.22)); }
function ctN(v, dec = 2) {
  if (v == null || !isFinite(v)) return '—';
  const neg = v < 0 && Math.abs(v) >= 0.005;
  let [i, d] = Math.abs(v).toFixed(dec).split('.');
  i = i.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return (neg ? '−' : '') + i + (dec ? ',' + d : '');
}
function ctE(v) { return v == null || !isFinite(v) ? '—' : ctN(v) + ' €'; }
function ctEsc(s) { return String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function ctMeseLabel(m, breve) { const [y, mm] = m.split('-').map(Number); return breve ? `${CT_MESI_BREVI[mm - 1]} '${String(y).slice(2)}` : `${CT_MESI[mm - 1]} ${y}`; }
function ctFineMese(m) { const [y, mm] = m.split('-').map(Number); return `${m}-${String(new Date(y, mm, 0).getDate()).padStart(2, '0')}`; }
function ctGiorniMese(m) { const [y, mm] = m.split('-').map(Number); return new Date(y, mm, 0).getDate(); }
function ctTrim(m) { const [y, mm] = m.split('-').map(Number); return `${y}-Q${Math.ceil(mm / 3)}`; }
function ctPiano(x) {
  const b = x.piano_base || '';
  if (b.includes('installments') || Number(x.prezzo) === 2.5 || Number(x.lordo) === 2.5) return 'rate';
  if (b.startsWith('monthly') || x.prodotto === 'premium_monthly') return 'mensile';
  return 'annuale';
}
const CT_PIANO_LABEL = { annuale: 'annuale', mensile: 'mensile', rate: 'annuale a rate' };

// ── CARICAMENTO ──────────────────────────────────────────────────────────────────
function ctState() {
  if (!state.ct) state.ct = { data: null, metaDays: null, metaErr: null, loading: false, error: null, view: 'mesi', open: {}, sel: null, report: null, syncing: false, loadedAt: null };
  return state.ct;
}

async function ctFetchMetaDays(mese, token) {
  const until = ctDay(new Date());
  const tr = encodeURIComponent(JSON.stringify({ since: `${mese}-01`, until: until < ctFineMese(mese) ? until : ctFineMese(mese) }));
  const url = `${META_API}/${META_AD_ACCOUNT}/insights?fields=spend&time_increment=1&time_range=${tr}&limit=100&access_token=${token}`;
  const res = await fetch(url).then(r => r.json());
  if (res.error) throw new Error(res.error.message || 'Errore API Meta');
  const days = {};
  for (const r of res.data || []) days[r.date_start] = parseFloat(r.spend || 0);
  return days;
}

async function ctLoad({ forzaSync = false } = {}) {
  const ct = ctState();
  if (ct.loading) return;
  ct.loading = true; ct.error = null;
  if (state.page === 'conto') render();
  try {
    let { data, error } = await sb.rpc('finance_conto_dati');
    if (error) throw error;
    // Ordini Google vecchi: prima un giro di sync-fatture (lo stesso del bottone in Fatture).
    const vecchio = !data.ultimo_sync || (Date.now() - new Date(data.ultimo_sync).getTime() > CT_SYNC_STALE_MS);
    if (forzaSync || vecchio) {
      ct.syncing = true; if (state.page === 'conto') render();
      try {
        const r = await sb.functions.invoke('sync-fatture', { body: {} });
        if (r.error) throw r.error;
        const again = await sb.rpc('finance_conto_dati');
        if (!again.error) data = again.data;
        if (typeof ftLoad === 'function') ftLoad();
      } catch (e) { console.error('sync-fatture', e); }
      ct.syncing = false;
    }
    ct.data = data;
    ct.metaDays = null; ct.metaErr = null;
    if (state.metaToken) {
      try { ct.metaDays = await ctFetchMetaDays(currentMeseStr(), state.metaToken); }
      catch (e) { ct.metaErr = e?.message || String(e); }
    } else ct.metaErr = 'token Meta mancante';
    ct.loadedAt = new Date();
  } catch (e) {
    const msg = e?.message || String(e);
    ct.error = /forbidden|operatore|JWT|permission/i.test(msg)
      ? 'Serve il login da operatore. Accedi dalla dashboard KPI e poi ricarica questa pagina.'
      : msg;
  }
  ct.loading = false;
  render();
}

// ── MODELLO ──────────────────────────────────────────────────────────────────────
// Un "bucket" è una colonna: un mese chiuso, le tre colonne del mese in corso, un trimestre, il totale.
function ctBucket() {
  return { lordo: 0, iva: 0, comm: 0, netto: 0, entrateReg: 0, meta: 0, altri: 0, stime: 0,
    altriCat: {}, stimeVoci: {}, ordini: [], rimborsi: [], movimenti: [], metaGiorni: null, metaFonte: null, voci: [] };
}
function ctAddOrdine(b, o, segno = 1) {
  b.lordo += segno * o.lordo; b.iva += segno * o.iva; b.netto += segno * o.netto; b.comm += segno * (o.lordo - o.iva - o.netto);
}
function ctRisultato(b) { return b.netto + b.entrateReg - b.meta - b.altri - b.stime; }
function ctSomma(bs) {
  const t = ctBucket();
  for (const b of bs) {
    for (const k of ['lordo', 'iva', 'comm', 'netto', 'entrateReg', 'meta', 'altri', 'stime']) t[k] += b[k];
    for (const [k, v] of Object.entries(b.altriCat)) t.altriCat[k] = (t.altriCat[k] || 0) + v;
    for (const [k, v] of Object.entries(b.stimeVoci)) t.stimeVoci[k] = (t.stimeVoci[k] || 0) + v;
    t.ordini.push(...b.ordini); t.rimborsi.push(...b.rimborsi); t.movimenti.push(...b.movimenti);
  }
  return t;
}

function ctModel() {
  const ct = ctState(); const d = ct.data;
  const oggi = ctDay(new Date()); const cur = oggi.slice(0, 7);
  const now = Date.now();
  const mesi = []; for (let m = CT_DAL; m <= cur; m = addMese(m, 1)) mesi.push(m);

  // Ordini: ricavo nel mese dell'ordine; un rimborso si toglie nel mese in cui avviene.
  const ordini = (d.ordini || []).map(o => {
    const lordo = Number(o.lordo), iva = Number(o.iva ?? ctIva(lordo));
    const rimb = o.stato === 'REFUNDED';
    const netto = rimb ? ctNet(lordo) : (o.netto != null ? Number(o.netto) : ctNet(lordo));
    return { giorno: ctDay(o.at), piano: ctPiano(o), offerta: o.offerta, lordo, iva, netto,
      rimborsoGiorno: rimb ? ctDay(o.rimborsato_at || o.at) : null };
  });
  const abb = (d.abbonamenti || []).map(a => ({ ...a, piano: ctPiano(a),
    pagato: a.pagato_at ? new Date(a.pagato_at).getTime() : null,
    scade: a.scade_at ? new Date(a.scade_at).getTime() : null,
    prova: a.prova_da ? new Date(a.prova_da).getTime() : null }));

  const stimaVoci = (m, movM) => {
    const out = {};
    const has = cerca => movM.some(x => x.tipo === 'Spesa' && String(x.descrizione || '').toLowerCase().includes(cerca));
    for (const v of CT_STIME.voci) if (m >= v.dal && !has(v.cerca)) out[v.voce] = v.importo;
    const usd = Number((d.ai_usd || {})[m] || 0);
    if (m >= CT_STIME.ai.dal && usd > 0 && !has(CT_STIME.ai.cerca)) out[CT_STIME.ai.voce] = ctR2(usd * CT_STIME.cambioUsdEur);
    return out;
  };

  const cols = {};      // chiave → bucket
  const giorniCur = ctGiorniMese(cur), giornoN = Number(oggi.slice(8, 10)), restano = giorniCur - giornoN;
  for (const m of mesi) {
    const isCur = m === cur;
    const b = ctBucket(); const p = isCur ? ctBucket() : null;
    for (const o of ordini) {
      if (o.giorno.slice(0, 7) === m && !(o.rimborsoGiorno && o.rimborsoGiorno.slice(0, 7) === m)) { ctAddOrdine(b, o); b.ordini.push(o); }
      if (o.rimborsoGiorno && o.rimborsoGiorno.slice(0, 7) === m && o.giorno.slice(0, 7) !== m) { ctAddOrdine(b, o, -1); b.rimborsi.push(o); }
      else if (o.rimborsoGiorno && o.rimborsoGiorno.slice(0, 7) === m) b.rimborsi.push(o);
    }
    const movM = state.movimenti.filter(x => x.mese === m);
    for (const x of movM) {
      const futuro = isCur && (x.dataEsatta || `${m}-01`) > oggi;
      const t = futuro ? p : b;
      if (x.tipo === 'Entrata') { t.entrateReg += x.importo; t.movimenti.push(x); continue; }
      const v = Math.abs(x.importo);
      if (x.categoria === META_AUTO_CAT) { if (!isCur || !ct.metaDays) { t.meta += v; t.movimenti.push(x); t.metaFonte = 'registro'; } continue; }
      t.altri += v; t.altriCat[x.categoria] = (t.altriCat[x.categoria] || 0) + v; t.movimenti.push(x);
    }
    const st = stimaVoci(m, movM);
    if (isCur && ct.metaDays) {
      b.metaGiorni = ct.metaDays; b.metaFonte = 'api';
      b.meta = Object.values(ct.metaDays).reduce((s, v) => s + v, 0);
    }
    if (isCur && st[CT_STIME.ai.voce] && giornoN > 0) {     // AI: finora quello consumato, il resto in proporzione
      const ai = st[CT_STIME.ai.voce];
      p.stime += ctR2(ai / giornoN * restano); p.stimeVoci[CT_STIME.ai.voce] = ctR2(ai / giornoN * restano);
    }
    for (const [k, v] of Object.entries(st)) { b.stime += v; b.stimeVoci[k] = v; }
    cols[m] = b; if (isCur) cols[cur + ':P'] = p;
  }

  // Indicatori per mese
  const fineMs = m => m === cur ? now : new Date(ctFineMese(m) + 'T23:59:59+01:00').getTime();
  const attiviAl = t => abb.filter(a => a.pagato != null && a.pagato <= t && a.scade != null && a.scade > t);
  const nettoMese = a => {   // ricavo ricorrente mensile di un abbonamento (netto)
    const n = a.ultimo_netto != null ? Number(a.ultimo_netto) : ctNet(Number(a.prezzo) || CT_LISTINO[a.piano]);
    return a.piano === 'annuale' ? n / 12 : n;
  };
  const prove = abb.filter(a => a.prova != null);
  const esitoProva = a => {   // giorno in cui l'esito è deciso, e se ha pagato
    if (a.pagato != null) return { t: a.pagato, ok: true };
    if (a.status === 'cancelled' || a.rinnovo_auto === false || (a.scade != null && a.scade <= now)) return { t: Math.min(a.scade ?? now, now), ok: false };
    return null;
  };
  const ind = {};
  for (const m of mesi) {
    const t = fineMs(m); const att = attiviAl(t);
    const nuovi = abb.filter(a => a.pagato != null && ctDay(a.pagato).slice(0, 7) === m);
    const decise = prove.map(a => ({ a, e: esitoProva(a) })).filter(x => x.e && ctDay(x.e.t).slice(0, 7) === m);
    ind[m] = { paganti: att.length, nuovi: nuovi.length, nuoviDiretti: nuovi.filter(a => a.prova == null).length,
      mrr: att.reduce((s, a) => s + nettoMese(a), 0), proveOk: decise.filter(x => x.e.ok).length, proveTot: decise.length,
      perPiano: att.reduce((o, a) => (o[a.piano] = (o[a.piano] || 0) + 1, o), {}) };
  }
  const tutteDecise = prove.map(esitoProva).filter(Boolean);
  const tasso = tutteDecise.length ? tutteDecise.filter(e => e.ok).length / tutteDecise.length : 0;
  const inProva = prove.filter(a => a.pagato == null && !esitoProva(a));

  // Previsione del resto del mese in corso (blocchi sempre visibili nel dettaglio)
  const fine = new Date(ctFineMese(cur) + 'T23:59:59+01:00').getTime();
  const P = cols[cur + ':P'];
  const voce = (piano, lordo, quando, n = 1, peso = 1) => ({ piano, lordo, netto: ctNet(lordo), iva: ctIva(lordo), quando, n, peso });
  const rinnovi = abb.filter(a => a.pagato != null && a.status === 'active' && a.rinnovo_auto !== false && a.scade > now && a.scade <= fine)
    .map(a => voce(a.piano, Number(a.prezzo) || CT_LISTINO[a.piano], ctDay(a.scade)));
  const proveFinite = inProva.filter(a => a.scade > now && a.scade <= fine)
    .map(a => voce(a.piano, Number(a.prezzo) || CT_LISTINO.annuale, ctDay(a.scade)));
  const diretti = abb.filter(a => a.pagato != null && a.prova == null && ctDay(a.pagato).slice(0, 7) === cur && !a.rimborsato);
  const proveAvviate = prove.filter(a => ctDay(a.prova).slice(0, 7) === cur).length;
  const giorniProveUtili = Math.max(0, restano - 7);          // una prova nuova finisce in 7 giorni
  // netto vero dell'ultimo ordine (il prezzo di Google è quello del rinnovo, non lo sconto pagato)
  const nettoMedioDiretto = diretti.length ? diretti.reduce((s, a) => s + (a.ultimo_netto != null ? Number(a.ultimo_netto) : ctNet(Number(a.prezzo) || CT_LISTINO[a.piano])), 0) / diretti.length : 0;
  const lordoMedioDiretto = nettoMedioDiretto * 1.22 / 0.85;
  const nuoveDirette = giornoN ? diretti.length / giornoN * restano : 0;
  const nuoveProve = giornoN ? proveAvviate / giornoN * giorniProveUtili * tasso : 0;
  const somma = (arr, k) => arr.reduce((s, v) => s + v[k] * v.n * v.peso, 0);
  const blocchi = {
    rinnovi: { netto: somma(rinnovi, 'netto'), lordo: somma(rinnovi, 'lordo'), iva: somma(rinnovi, 'iva'), voci: rinnovi },
    prove: { tutte: somma(proveFinite, 'netto'), netto: somma(proveFinite, 'netto') * tasso,
      lordo: somma(proveFinite, 'lordo') * tasso, iva: somma(proveFinite, 'iva') * tasso, voci: proveFinite },
    nuove: { n: nuoveDirette + nuoveProve,
      netto: nuoveDirette * nettoMedioDiretto + nuoveProve * ctNet(CT_LISTINO.annuale),
      lordo: nuoveDirette * lordoMedioDiretto + nuoveProve * CT_LISTINO.annuale,
      iva: nuoveDirette * (lordoMedioDiretto - lordoMedioDiretto / 1.22) + nuoveProve * ctIva(CT_LISTINO.annuale),
      diretti: diretti.length, proveAvviate, giornoN, restano, giorniProveUtili },
  };
  for (const k of ['rinnovi', 'prove', 'nuove']) {
    P.lordo += blocchi[k].lordo; P.iva += blocchi[k].iva; P.netto += blocchi[k].netto;
    P.comm += blocchi[k].lordo - blocchi[k].iva - blocchi[k].netto;
  }
  // Meta: media di tutti i giorni (basso) o solo dei giorni con campagne attive (alto)
  const md = cols[cur].metaGiorni ? Object.entries(cols[cur].metaGiorni) : [];
  const metaFin = cols[cur].meta;
  const giorniAttivi = md.filter(([, v]) => v > 0).length;
  const metaBasso = giornoN ? metaFin / giornoN * restano : 0;
  const metaAlto = giorniAttivi ? metaFin / giorniAttivi * restano : metaBasso;
  P.meta = (metaBasso + metaAlto) / 2;
  const F = cols[cur];
  const E = ctSomma([F, P]);
  const finoraRis = ctRisultato(F), costiFissiP = P.altri + P.stime;
  const scen = {
    prudente: { netto: F.netto + blocchi.rinnovi.netto, meta: metaFin + metaAlto },
    centrale: { netto: E.netto, meta: metaFin + P.meta },
    ottimista: { netto: F.netto + blocchi.rinnovi.netto + blocchi.prove.tutte + blocchi.nuove.netto * 1.5, meta: metaFin + metaBasso },
  };
  for (const s of Object.values(scen)) s.ris = s.netto + F.entrateReg + P.entrateReg - s.meta - F.altri - F.stime - costiFissiP;
  cols[cur + ':E'] = E;

  const chiusi = mesi.filter(m => m !== cur);
  const tot = ctSomma(mesi.map(m => cols[m]));        // da febbraio a oggi (il mese in corso conta il «finora»)
  const cumulato = {}; let acc = 0;
  for (const m of mesi) { acc += ctRisultato(cols[m]); cumulato[m] = acc; }
  cumulato[cur + ':E'] = acc - finoraRis + ctRisultato(E);

  return { oggi, cur, mesi, chiusi, cols, ind, tot, cumulato, scen, blocchi, tasso, inProva,
    proveDecise: tutteDecise, metaBasso, metaAlto, giorniAttivi, giornoN, restano, giorniCur,
    attiviOra: attiviAl(now), nettoMese };
}

// ── COLONNE ──────────────────────────────────────────────────────────────────────
function ctColonne(M) {
  const ct = ctState();
  const cs = [];
  if (ct.view === 'trimestri') {
    const qs = [...new Set(M.mesi.map(ctTrim))];
    for (const q of qs) {
      const ms = M.mesi.filter(m => ctTrim(m) === q);
      const inCorso = ms.includes(M.cur);
      const [y, n] = q.split('-Q');
      cs.push({ key: q, kind: 'q', mesi: ms, b: ctSomma(ms.map(m => M.cols[m])), live: inCorso,
        head: `${n}° trim. ${y}`, sub: inCorso ? `fino a oggi` : ms.map(m => CT_MESI_BREVI[Number(m.slice(5)) - 1]).join('–') });
    }
  } else {
    for (const m of M.chiusi) cs.push({ key: m, kind: 'm', mesi: [m], b: M.cols[m], head: CT_MESI_BREVI[Number(m.slice(5)) - 1], sub: m.slice(0, 4) });
    const g = Number(M.oggi.slice(8, 10));
    cs.push({ key: M.cur, kind: 'F', mesi: [M.cur], b: M.cols[M.cur], head: `1–${g}`, sub: 'finora', live: true });
    if (M.restano > 0) cs.push({ key: M.cur + ':P', kind: 'P', mesi: [M.cur], b: M.cols[M.cur + ':P'], head: `${g + 1}–${M.giorniCur}`, sub: 'previsto', live: true });
    cs.push({ key: M.cur + ':E', kind: 'E', mesi: [M.cur], b: M.cols[M.cur + ':E'], head: 'Fine mese', sub: 'stima', live: true });
  }
  cs.push({ key: 'T', kind: 'T', mesi: M.mesi, b: M.tot, head: 'Totale', sub: `da ${CT_MESI_BREVI[Number(CT_DAL.slice(5)) - 1].toLowerCase()} a oggi` });
  return cs;
}

// Indicatori per colonna
function ctIndCol(M, c) {
  const last = c.mesi[c.mesi.length - 1];
  if (c.kind === 'P') return null;
  const i = M.ind[last];
  const sum = k => c.mesi.reduce((s, m) => s + M.ind[m][k], 0);
  const nuovi = c.kind === 'E' ? null : sum('nuovi');
  const meta = c.b.meta, netto = c.b.netto;
  return {
    paganti: c.kind === 'E' ? null : i.paganti,
    nuovi, proveOk: c.kind === 'E' ? null : sum('proveOk'), proveTot: c.kind === 'E' ? null : sum('proveTot'),
    mrr: c.kind === 'E' ? null : i.mrr,
    cac: c.kind !== 'E' && nuovi ? meta / nuovi : null, cacBase: nuovi,
    roi: c.kind !== 'E' && meta > 0 ? netto / meta : null,
  };
}

// ── RENDER ───────────────────────────────────────────────────────────────────────
const CT_INFO = {
  netto: `<b>Netto che arriva da Google</b>Dal prezzo Google toglie l'IVA al 22% (la versa lui allo Stato), poi il 15% di commissione su quello che resta. Arriva il 69,7% di quello che paga l'utente: 9,90 € → 6,89 €, 29,99 € → 20,89 €. È il netto vero di ogni ordine (Orders API).<br><br>Google lo versa verso il 15 del mese dopo: questo è il netto <i>maturato</i> nel mese, non il bonifico.`,
  meta: `<b>Meta Ads</b>Mesi chiusi: la voce del Registro. Mese in corso: l'API Meta giorno per giorno, oggi compreso (parziale).`,
  altri: `<b>Altri costi nel Registro</b>Tutte le spese del Registro tranne Meta, nel mese della loro data. Nel mese in corso una voce con data futura (es. un ricorrente del 20) sta in «previsto».`,
  stime: `<b>Costi stimati</b>Costi veri che nel Registro non ci sono ancora: ${CT_STIME.voci.map(v => `${v.voce} (${ctN(v.importo)} €, ultimo importo registrato)`).join(', ')} e l'AI, stimata dall'app in dollari (cambio ${ctN(CT_STIME.cambioUsdEur)}). La stima di un mese sparisce da sola quando nel Registro c'è la voce vera con quel nome.`,
  risultato: `<b>Risultato del mese, prima delle imposte</b>Netto da Google meno tutti i costi.<br><br><b>Imposte.</b> Oggi gli incassi vanno sulla P.IVA di Mattia: se è forfettario si paga sul 67% dei ricavi anche quando si è in perdita; se è ordinario solo sull'utile. In una SRL: IRES 24% sull'utile e IRAP 4,73% (Marche) sul valore della produzione, che non è l'utile. Da confermare col commercialista.`,
  cumulato: `<b>Cumulato</b>La somma dei risultati da ${ctMeseLabel(CT_DAL)} a oggi: quanto avete messo di tasca vostra finora (se negativo).`,
  paganti: `<b>Paganti</b>Abbonamenti pagati e non ancora scaduti a fine mese (nel mese in corso: oggi). Esclusi test e account interni. Chi ha disdetto ma ha ancora giorni pagati conta fino alla scadenza.`,
  nuovi: `<b>Nuovi paganti</b>Abbonamenti con il primo pagamento nel mese, da prova o diretti. Un rimborso non lo toglie da qui: lo toglie dai paganti.`,
  prove: `<b>Prove che pagano</b>Prove gratuite con l'esito deciso nel mese: pagate, oppure scadute o disdette senza pagare. Il conteggio prima della percentuale: sotto le 30 prove la percentuale balla molto.<br><br>Settore (RevenueCat 2026, Health & Fitness su Google Play): 35,7% delle prove diventa pagante.`,
  mrr: `<b>Ricavo ricorrente mensile (MRR)</b>Quanto netto entra al mese dagli abbonamenti attivi, con gli annuali divisi per 12: un annuale vale 1,74 € al mese, un mensile 6,89 €. È il numero che un investitore guarda per primo. ARR = MRR × 12.`,
  cac: `<b>Costo per nuovo pagante (CAC)</b>Spesa Meta del periodo ÷ nuovi paganti del periodo. Conta tutti i nuovi paganti, anche quelli arrivati senza pubblicità, quindi è un po' ottimista.`,
  roi: `<b>Ritorno su Meta (ROI)</b>Euro netti arrivati da Google per ogni euro speso in Meta, nello stesso periodo. Sotto 1 € la pubblicità non si è ancora ripagata. Gli annuali pagano tutto subito, quindi il ritorno dei mensili arriva nei mesi dopo.`,
  burn: `<b>Perdita media al mese (burn)</b>La media dei risultati degli ultimi 3 mesi chiusi, se negativi: quanto vi costa tenere aperta l'attività ogni mese. Non è il conto in banca: Google versa con un mese di ritardo.`,
  previsto: `<b>Stima di fine mese</b>Somma di blocchi sempre visibili nel dettaglio (clicca una cifra della colonna): rinnovi già in calendario, prove che finiscono entro fine mese moltiplicate per la quota di prove che finora ha pagato, nuove vendite al ritmo del mese, Meta alla media giornaliera del mese. La forchetta va dallo scenario prudente all'ottimista.`,
  scala: `<b>Quanto manca per reggervi da soli</b>Paganti necessari = euro al mese da coprire ÷ ricavo ricorrente mensile per pagante di oggi. Il mix conta: un annuale porta 1,74 € al mese, un mensile 6,89 €.<br><br>Costi fissi SRL ≈ ${ctN(CT_SRL_MESE, 0)} €/mese (camera di commercio, libri sociali, bilancio, commercialista). Due compensi minimi = 18.808 €/anno a testa con INPS e IRAP ≈ ${ctN(CT_COMPENSI_MESE, 0)} €/mese. Stime da confermare col commercialista.`,
};

function ctI(key) { return `<button type="button" class="ct-i" data-ct-info="${key}" aria-label="Spiegazione">i</button>`; }

function ctCell(v, opts = {}) {
  if (v == null) return `<span class="ct-dash">—</span>`;
  const z = Math.abs(v) < 0.005;
  const cls = ['ct-n', z ? 'ct-zero' : '', opts.color && !z ? (v < 0 ? 'ct-neg' : 'ct-pos') : '', opts.stim ? 'ct-stim' : '', opts.att ? 'ct-att' : ''].join(' ');
  return `<span class="${cls}">${ctN(v)}</span>`;
}

function ctRighe(M) {
  const anyEntrateReg = Object.values(M.cols).some(b => Math.abs(b.entrateReg) > 0.004);
  const cats = [...new Set(Object.values(M.cols).flatMap(b => Object.keys(b.altriCat)))].sort();
  const vociStima = [...new Set(Object.values(M.cols).flatMap(b => Object.keys(b.stimeVoci)))];
  const ct = ctState();
  const R = [];
  R.push({ sec: 'Entrate' });
  R.push({ k: 'lordo', l: 'Pagato dagli utenti', h: 'IVA compresa', get: b => b.lordo });
  R.push({ k: 'iva', l: '− IVA 22%', h: 'la versa Google allo Stato', get: b => -b.iva, sub: true });
  R.push({ k: 'comm', l: '− Commissione Google 15%', h: 'sul prezzo senza IVA', get: b => -b.comm, sub: true });
  R.push({ k: 'netto', l: '= Netto da Google', info: 'netto', get: b => b.netto, strong: true, color: true });
  if (anyEntrateReg) R.push({ k: 'entrateReg', l: '+ Altre entrate', h: 'dal Registro', get: b => b.entrateReg });
  R.push({ sec: 'Costi' });
  R.push({ k: 'meta', l: '− Meta Ads', info: 'meta', get: b => -b.meta, hl: true });
  R.push({ k: 'altri', l: '− Altri costi', info: 'altri', get: b => -b.altri, exp: 'altri', h: 'dal Registro' });
  if (ct.open.altri) for (const c of cats) R.push({ k: 'cat:' + c, l: c, get: b => -(b.altriCat[c] || 0), child: true });
  R.push({ k: 'stime', l: '− Costi stimati', info: 'stime', get: b => -b.stime, exp: 'stime', stim: true, h: 'mancano nel Registro' });
  if (ct.open.stime) for (const v of vociStima) R.push({ k: 'stima:' + v, l: v, get: b => -(b.stimeVoci[v] || 0), child: true, stim: true });
  R.push({ sec: 'Risultato' });
  R.push({ k: 'ris', l: ct.view === 'trimestri' ? '= Risultato del periodo' : '= Risultato del mese', info: 'risultato', get: b => ctRisultato(b), strong: true, color: true, big: true });
  R.push({ k: 'cum', l: 'Cumulato', info: 'cumulato', cum: true, color: true });
  R.push({ sec: 'Indicatori' });
  R.push({ k: 'paganti', l: ct.view === 'trimestri' ? 'Paganti a fine periodo' : 'Paganti a fine mese', info: 'paganti', ind: 'paganti', int: true });
  R.push({ k: 'nuovi', l: 'Nuovi paganti', info: 'nuovi', ind: 'nuovi', int: true });
  R.push({ k: 'prove', l: 'Prove che pagano', info: 'prove', ind: 'prove' });
  R.push({ k: 'mrr', l: 'Ricavo ricorrente mensile (MRR)', info: 'mrr', ind: 'mrr' });
  R.push({ k: 'cac', l: 'Costo per nuovo pagante (CAC)', info: 'cac', ind: 'cac' });
  R.push({ k: 'roi', l: 'Ritorno su Meta (ROI)', info: 'roi', ind: 'roi' });
  return R;
}

function ctValore(M, r, c) {
  if (r.cum) {
    if (c.kind === 'P') return null;
    if (c.kind === 'T') return M.cumulato[M.cur];
    if (c.kind === 'q') return M.cumulato[c.mesi[c.mesi.length - 1]];
    return M.cumulato[c.key];
  }
  return r.get(c.b);
}

function ctIndHTML(M, r, c) {
  const I = ctIndCol(M, c);
  if (!I) return `<span class="ct-dash">—</span>`;
  if (r.ind === 'paganti') return I.paganti == null ? `<span class="ct-dash">—</span>` : `<span class="ct-n">${I.paganti}</span>`;
  if (r.ind === 'nuovi') return I.nuovi == null ? `<span class="ct-dash">—</span>` : `<span class="ct-n">${I.nuovi}</span>`;
  if (r.ind === 'prove') return !I.proveTot ? `<span class="ct-dash">—</span>` : `<span class="ct-n">${I.proveOk} su ${I.proveTot}</span>`;
  if (r.ind === 'mrr') return I.mrr == null ? `<span class="ct-dash">—</span>` : `<span class="ct-n">${ctN(I.mrr)}</span>`;
  if (r.ind === 'cac') return I.cac == null ? `<span class="ct-dash">—</span>` : `<span class="ct-n">${ctN(I.cac)}</span><small class="ct-base">÷ ${I.cacBase}</small>`;
  if (r.ind === 'roi') return I.roi == null ? `<span class="ct-dash">—</span>` : `<span class="ct-n ${I.roi >= 1 ? 'ct-pos' : ''}">${ctN(I.roi)} €</span>`;
  return '';
}

function ctTabella(M) {
  const ct = ctState();
  const cs = ctColonne(M);
  const R = ctRighe(M);
  const colCls = c => ['ct-c', c.live ? 'ct-live' : '', c.kind === 'F' || (c.kind === 'q' && c.live) ? 'ct-l1' : '', c.kind === 'E' || (c.kind === 'q' && c.live) ? 'ct-l3' : '', c.kind === 'T' ? 'ct-tot' : ''].join(' ');
  const liveN = cs.filter(c => c.live).length;
  const before = cs.findIndex(c => c.live);
  const grp = ct.view === 'mesi' && liveN ? `<tr class="ct-grp"><th class="ct-lab"></th>${before > 0 ? `<th colspan="${before}"></th>` : ''}<th colspan="${liveN}" class="ct-grp-live">${ctMeseLabel(M.cur)} · in corso ${ctI('previsto')}</th><th></th></tr>` : '';
  const head = `<tr><th class="ct-lab">Euro</th>${cs.map(c => `<th class="${colCls(c)}">${c.head}<small>${c.sub}</small></th>`).join('')}</tr>`;
  const body = R.map(r => {
    if (r.sec) return `<tr class="ct-sec"><td class="ct-lab">${r.sec}</td><td colspan="${cs.length}"></td></tr>`;
    const lab = `<td class="ct-lab">${r.exp ? `<button type="button" class="ct-exp" data-ct-exp="${r.exp}" aria-expanded="${!!ct.open[r.exp]}"><span class="ct-car">›</span>${r.l}</button>` : `<span class="ct-l">${r.l}</span>`}${r.info ? ctI(r.info) : ''}${r.h ? `<span class="ct-h">${r.h}</span>` : ''}</td>`;
    const tds = cs.map(c => {
      const sel = ct.sel && ct.sel.r === r.k && ct.sel.c === c.key ? ' ct-sel' : '';
      let inner;
      if (r.ind) inner = ctIndHTML(M, r, c);
      else {
        const v = ctValore(M, r, c);
        const stim = r.stim || (c.kind === 'P') || (c.kind === 'E' && ['netto', 'lordo', 'iva', 'comm', 'meta', 'ris', 'cum'].includes(r.k));
        inner = ctCell(v, { color: r.color, stim: stim && v != null && Math.abs(v) >= 0.005 });
        if (c.kind === 'E' && r.k === 'ris') inner += `<small class="ct-range">${ctN(M.scen.prudente.ris)} … ${ctN(M.scen.ottimista.ris)}</small>`;
        if (c.kind === 'E' && r.k === 'netto') inner += `<small class="ct-range">${ctN(M.scen.prudente.netto)} … ${ctN(M.scen.ottimista.netto)}</small>`;
      }
      return `<td class="${colCls(c)}${sel}" data-ct-cell="${r.k}|${c.key}" tabindex="0">${inner}</td>`;
    }).join('');
    return `<tr class="${[r.strong ? 'ct-strong' : '', r.hl ? 'ct-hl' : '', r.sub ? 'ct-subr' : '', r.child ? 'ct-child' : '', r.big ? 'ct-big' : ''].join(' ')}">${lab}${tds}</tr>`;
  }).join('');
  return `<div class="ct-tw"><table class="ct-pl"><thead>${grp}${head}</thead><tbody>${body}</tbody></table></div>`;
}

// ── DETTAGLIO «da cosa nasce» ───────────────────────────────────────────────────────
function ctRigheLista(items) {
  if (!items.length) return `<p class="ct-muted">Nessuna voce.</p>`;
  return `<ul class="ct-lines">${items.map(([a, b, c]) => `<li><span>${a}</span><span class="ct-n">${b}</span>${c ? `<span class="ct-src">${c}</span>` : ''}</li>`).join('')}</ul>`;
}
function ctGiornoIT(g) { const [y, m, d] = g.split('-'); return `${Number(d)} ${CT_MESI_BREVI[Number(m) - 1].toLowerCase()}`; }

function ctDettaglio(M) {
  const ct = ctState(); if (!ct.sel) return '';
  const cs = ctColonne(M); const c = cs.find(x => x.key === ct.sel.c); const r = ctRighe(M).find(x => x.k === ct.sel.r);
  if (!c || !r) return '';
  const titolo = `${r.l.replace(/^[−=+] /, '')} · ${c.kind === 'm' ? ctMeseLabel(c.key) : c.kind === 'q' ? c.head : c.kind === 'T' ? 'da ' + ctMeseLabel(CT_DAL) + ' a oggi' : ctMeseLabel(M.cur) + ' · ' + c.sub}`;
  let corpo = '';
  const b = c.b;
  if (c.kind === 'P' || (c.kind === 'E' && !r.ind)) {
    const B = M.blocchi;
    corpo = `
      ${ctRigheLista([
        ['Rinnovi in calendario', ctE(B.rinnovi.netto), B.rinnovi.voci.map(v => `${ctGiornoIT(v.quando)}: ${CT_PIANO_LABEL[v.piano]} ${ctN(v.lordo)} €`).join(' · ') || 'nessuno'],
        [`Prove che finiscono entro il ${M.giorniCur}`, ctE(B.prove.netto), `${B.prove.voci.length} prove × ${ctN(B.prove.voci.length ? B.prove.tutte / B.prove.voci.length : 0)} € netti × ${M.proveDecise.filter(e => e.ok).length} su ${M.proveDecise.length} prove che finora hanno pagato`],
        ['Nuove vendite al ritmo del mese', ctE(B.nuove.netto), `${B.nuove.diretti} acquisti diretti e ${B.nuove.proveAvviate} prove in ${B.nuove.giornoN} giorni, proiettati sui ${B.nuove.restano} giorni che restano`],
        ['Meta', ctE(-(c.kind === 'P' ? c.b.meta : c.b.meta)), `${ctN(M.cols[M.cur].meta)} € in ${M.giornoN} giorni; per i ${M.restano} che restano tra ${ctN(M.metaBasso)} e ${ctN(M.metaAlto)} € (media di tutti i giorni o solo di quelli con campagne attive)`],
        ['Altri costi e stime', ctE(-((c.kind === 'P' ? 0 : M.cols[M.cur].altri + M.cols[M.cur].stime) + M.cols[M.cur + ':P'].altri + M.cols[M.cur + ':P'].stime)), M.cols[M.cur + ':P'].movimenti.map(x => `${ctEsc(x.descrizione)} ${ctN(Math.abs(x.importo))} € il ${ctGiornoIT(x.dataEsatta)}`).join(' · ')],
      ])}
      <div class="ct-scen">
        <div class="hd"></div><div class="hd">Prudente</div><div class="hd ct-c2">Centrale</div><div class="hd">Ottimista</div>
        <div>Netto da Google</div><div>${ctN(M.scen.prudente.netto)}</div><div class="ct-c2">${ctN(M.scen.centrale.netto)}</div><div>${ctN(M.scen.ottimista.netto)}</div>
        <div>Meta</div><div>${ctN(-M.scen.prudente.meta)}</div><div class="ct-c2">${ctN(-M.scen.centrale.meta)}</div><div>${ctN(-M.scen.ottimista.meta)}</div>
        <div>Risultato</div><div><b>${ctN(M.scen.prudente.ris)}</b></div><div class="ct-c2"><b>${ctN(M.scen.centrale.ris)}</b></div><div><b>${ctN(M.scen.ottimista.ris)}</b></div>
      </div>
      <p class="ct-muted">Prudente: solo i rinnovi, Meta alta. Ottimista: tutte le prove pagano e le nuove vendite vanno il 50% meglio, Meta bassa.</p>`;
  } else if (['lordo', 'iva', 'comm', 'netto'].includes(r.k)) {
    const rows = b.ordini.map(o => [`${ctGiornoIT(o.giorno)} · ${CT_PIANO_LABEL[o.piano]}${o.offerta && o.offerta.startsWith('discount') ? ' scontato' : ''}`, `${ctN(o.lordo)} → ${ctN(o.netto)}`, null]);
    for (const o of b.rimborsi) rows.push([`${ctGiornoIT(o.rimborsoGiorno)} · rimborso ${CT_PIANO_LABEL[o.piano]}`, `${ctN(o.lordo)} → 0,00`, 'escluso dal conto']);
    corpo = `<p class="ct-muted">${b.ordini.length} ordini Google · prezzo → netto</p>${ctRigheLista(rows)}`;
  } else if (r.k === 'meta') {
    if (b.metaGiorni) {
      const g = Object.entries(b.metaGiorni).sort();
      corpo = `<p class="ct-muted">API Meta, giorno per giorno</p>${ctRigheLista(g.map(([d, v]) => [ctGiornoIT(d) + (d === M.oggi ? ' (in corso)' : ''), ctN(v), null]))}`;
    } else corpo = ctRigheLista(b.movimenti.filter(x => x.categoria === META_AUTO_CAT).map(x => [ctEsc(x.descrizione), ctN(Math.abs(x.importo)), x.dataEsatta ? ctGiornoIT(x.dataEsatta) : '']));
  } else if (r.k === 'altri' || r.k.startsWith('cat:')) {
    const cat = r.k.startsWith('cat:') ? r.k.slice(4) : null;
    corpo = ctRigheLista(b.movimenti.filter(x => x.tipo === 'Spesa' && x.categoria !== META_AUTO_CAT && (!cat || x.categoria === cat))
      .map(x => [ctEsc(x.descrizione), ctN(Math.abs(x.importo)), `${ctEsc(x.categoria)} · ${x.dataEsatta ? ctGiornoIT(x.dataEsatta) : x.mese}`]));
  } else if (r.k === 'stime' || r.k.startsWith('stima:')) {
    corpo = ctRigheLista(Object.entries(b.stimeVoci).map(([k, v]) => [k, ctN(v), k === CT_STIME.ai.voce ? 'costo stimato dall\'app in dollari' : 'ultimo importo registrato: aggiungi la voce nel Registro e la stima sparisce']));
  } else if (r.k === 'ris' || r.k === 'cum') {
    corpo = ctRigheLista([['Netto da Google', ctN(b.netto)], ...(b.entrateReg ? [['Altre entrate', ctN(b.entrateReg)]] : []), ['Meta', ctN(-b.meta)], ['Altri costi', ctN(-b.altri)], ['Costi stimati', ctN(-b.stime)], ['Risultato', ctN(ctRisultato(b))]]);
  } else if (r.ind) {
    const I = ctIndCol(M, c) || {};
    const forms = {
      paganti: `${I.paganti ?? '—'} abbonamenti pagati e non scaduti`,
      nuovi: `${I.nuovi ?? '—'} primi pagamenti nel periodo`,
      prove: `${I.proveOk ?? 0} prove pagate su ${I.proveTot ?? 0} con l'esito deciso nel periodo`,
      mrr: `${ctN(I.mrr ?? 0)} € al mese = somma del netto mensile di ogni abbonamento attivo (annuali ÷ 12)`,
      cac: `${ctN(b.meta)} € di Meta ÷ ${I.cacBase ?? 0} nuovi paganti`,
      roi: `${ctN(b.netto)} € netti ÷ ${ctN(b.meta)} € di Meta`,
    };
    corpo = `<p>${forms[r.ind]}</p>`;
  }
  return `<div class="ct-det"><div class="ct-det-h"><h3>${titolo}</h3><button type="button" class="ct-x" data-ct-close aria-label="Chiudi">×</button></div>${corpo}</div>`;
}

// ── KPI IN TESTA ───────────────────────────────────────────────────────────────────
function ctKpi(M) {
  const ora = M.attiviOra;
  const mrr = ora.reduce((s, a) => s + M.nettoMese(a), 0);
  const F = M.cols[M.cur]; const I = M.ind[M.cur];
  const cacMese = I.nuovi ? F.meta / I.nuovi : null;
  const totNuovi = M.mesi.reduce((s, m) => s + M.ind[m].nuovi, 0);
  const cacTot = totNuovi ? M.tot.meta / totNuovi : null;
  const roiMese = F.meta > 0 ? F.netto / F.meta : null;
  const roiTot = M.tot.meta > 0 ? M.tot.netto / M.tot.meta : null;
  const ult3 = M.chiusi.slice(-3);
  const burn = ult3.length ? ult3.reduce((s, m) => s + ctRisultato(M.cols[m]), 0) / ult3.length : null;
  const ok = M.proveDecise.filter(e => e.ok).length, n = M.proveDecise.length;
  const piani = ora.reduce((o, a) => (o[a.piano] = (o[a.piano] || 0) + 1, o), {});
  const tile = (label, info, val, sub, cls = '') => `<div class="ct-kpi"><div class="ct-kl">${label}${ctI(info)}</div><div class="ct-kv ${cls}">${val}</div><div class="ct-ks">${sub}</div></div>`;
  return `<div class="ct-kpis">
    ${tile('Ricavo ricorrente (MRR)', 'mrr', ctE(mrr), `ARR ${ctN(mrr * 12)} € all'anno`)}
    ${tile('Paganti', 'paganti', ora.length, `${Object.entries(piani).map(([p, k]) => `${k} ${p === 'rate' ? 'a rate' : p === 'annuale' ? 'annuali' : 'mensili'}`).join(' · ')}${M.inProva.length ? ` · ${M.inProva.length} in prova` : ''}`)}
    ${tile(`Costo per pagante (CAC)`, 'cac', cacMese == null ? '—' : ctE(cacMese), `${CT_MESI[Number(M.cur.slice(5)) - 1]} · da ${CT_MESI_BREVI[Number(CT_DAL.slice(5)) - 1].toLowerCase()}: ${ctE(cacTot)}`)}
    ${tile('Ritorno su Meta (ROI)', 'roi', roiMese == null ? '—' : ctN(roiMese) + ' €', `per 1 € speso · da ${CT_MESI_BREVI[Number(CT_DAL.slice(5)) - 1].toLowerCase()}: ${roiTot == null ? '—' : ctN(roiTot) + ' €'}`, roiMese != null && roiMese >= 1 ? 'ct-pos' : '')}
    ${tile('Prove che pagano', 'prove', n ? `${ok} su ${n}` : '—', n ? `${Math.round(ok / n * 100)}% · settore 35,7%` : 'nessuna prova conclusa')}
    ${tile('Perdita al mese (burn)', 'burn', burn == null ? '—' : ctE(burn), `media ultimi 3 mesi · cumulato ${ctE(M.cumulato[M.cur])}`, burn != null && burn < 0 ? 'ct-neg' : '')}
  </div>`;
}

// ── SCALA «azienda vera» ──────────────────────────────────────────────────────────
function ctScala(M) {
  const ora = M.attiviOra; const n = ora.length;
  const mrr = ora.reduce((s, a) => s + M.nettoMese(a), 0);
  const perPag = n ? mrr / n : 0;
  const E = M.cols[M.cur + ':E'];
  const funz = E.altri + E.stime;              // costi di funzionamento del mese (senza pubblicità)
  const meta = E.meta;
  const gradini = [
    ['Costi di funzionamento', 'server, AI, strumenti; senza pubblicità', funz],
    ['+ Meta al ritmo di questo mese', `stima di fine mese ${ctN(meta, 0)} €`, funz + meta],
    ['+ costi fissi di una SRL', `≈ ${ctN(CT_SRL_MESE, 0)} €/mese`, funz + meta + CT_SRL_MESE],
    ['+ due compensi minimi', `≈ ${ctN(CT_COMPENSI_MESE, 0)} €/mese`, funz + meta + CT_SRL_MESE + CT_COMPENSI_MESE],
  ];
  const rows = gradini.map(([t, s, euro], i) => {
    const serve = perPag ? Math.ceil(euro / perPag) : null;
    const servMens = Math.ceil(euro / ctNet(CT_LISTINO.mensile));
    const pct = serve ? Math.min(100, n / serve * 100) : 0;
    return `<div class="ct-step"><span class="ct-sk">${i + 1}</span><span class="ct-st">${t}<small>${s}</small></span>
      <span class="ct-sp">${serve == null ? '—' : ctN(serve, 0)} paganti<small>${ctN(euro, 0)} €/mese · ${ctN(servMens, 0)} se tutti mensili</small></span>
      <span class="ct-track"><i style="width:${pct.toFixed(1)}%"></i></span></div>`;
  }).join('');
  return `<div class="card ct-card"><div class="card-title">Quanto manca per reggervi da soli ${ctI('scala')}</div>
    <div class="ct-scala-now">Oggi <b>${n}</b> paganti · <b>${ctN(perPag)} €</b> netti al mese ciascuno</div>${rows}</div>`;
}

// ── REPORT ─────────────────────────────────────────────────────────────────────────
function ctReportTesto(M, key) {
  const isQ = key.includes('Q');
  const ms = isQ ? M.mesi.filter(m => ctTrim(m) === key) : [key];
  const parz = ms.includes(M.cur);
  const b = ctSomma(ms.map(m => M.cols[m]));
  const last = ms[ms.length - 1]; const I = M.ind[last];
  const nuovi = ms.reduce((s, m) => s + M.ind[m].nuovi, 0);
  const pOk = ms.reduce((s, m) => s + M.ind[m].proveOk, 0), pTot = ms.reduce((s, m) => s + M.ind[m].proveTot, 0);
  const [y, q] = key.split('-Q');
  const titolo = isQ ? `HypeMove · ${q}° trimestre ${y}` : `HypeMove · ${ctMeseLabel(key)}`;
  const L = [];
  L.push(titolo + (parz ? ` (provvisorio al ${ctGiornoIT(M.oggi)})` : ''));
  L.push('');
  L.push('CONTO');
  L.push(`Pagato dagli utenti        ${ctE(b.lordo)}`);
  L.push(`Netto da Google            ${ctE(b.netto)}  (dopo IVA ${ctE(b.iva)} e commissione ${ctE(b.comm)})`);
  if (b.entrateReg) L.push(`Altre entrate              ${ctE(b.entrateReg)}`);
  L.push(`Meta Ads                   ${ctE(-b.meta)}`);
  L.push(`Altri costi                ${ctE(-b.altri)}`);
  if (b.stime) L.push(`Costi stimati              ${ctE(-b.stime)}  (${Object.keys(b.stimeVoci).join(', ')})`);
  L.push(`Risultato                  ${ctE(ctRisultato(b))}`);
  L.push(`Cumulato da ${ctMeseLabel(CT_DAL)}  ${ctE(M.cumulato[last])}`);
  if (parz) L.push(`Stima a fine ${ctMeseLabel(M.cur)}: ${ctE(M.scen.centrale.ris)} (tra ${ctE(M.scen.prudente.ris)} e ${ctE(M.scen.ottimista.ris)})`);
  if (isQ) {
    L.push(''); L.push('MESE PER MESE');
    for (const m of ms) L.push(`${ctMeseLabel(m).padEnd(16)} netto ${ctE(M.cols[m].netto).padStart(10)}  Meta ${ctE(-M.cols[m].meta).padStart(10)}  risultato ${ctE(ctRisultato(M.cols[m])).padStart(11)}`);
  }
  L.push(''); L.push('INDICATORI');
  L.push(`Paganti ${parz ? 'oggi' : 'a fine periodo'}: ${I.paganti}  ·  nuovi nel periodo: ${nuovi}`);
  L.push(`Ricavo ricorrente mensile (MRR): ${ctE(I.mrr)}  ·  ARR: ${ctE(I.mrr * 12)}`);
  if (nuovi) L.push(`Costo per nuovo pagante (CAC): ${ctE(b.meta / nuovi)}`);
  if (b.meta) L.push(`Ritorno su Meta: ${ctN(b.netto / b.meta)} € netti per 1 € speso`);
  if (pTot) L.push(`Prove che pagano: ${pOk} su ${pTot}`);
  L.push('');
  L.push('Netto = quanto resta dopo IVA 22% e commissione Google 15%; Google lo versa verso il 15 del mese dopo.');
  return L.join('\n');
}

function ctReportModal(M) {
  const ct = ctState(); if (!ct.report) return '';
  const opzioni = [...M.mesi.slice().reverse().map(m => [m, ctMeseLabel(m)]), ...[...new Set(M.mesi.map(ctTrim))].reverse().map(q => [q, `${q.split('-Q')[1]}° trimestre ${q.split('-Q')[0]}`])];
  return `<div class="modal-overlay" data-ct-repclose>
    <div class="modal ct-repmodal" role="dialog" aria-label="Report">
      <div class="modal-title">Report</div>
      <div class="ct-repbar"><select class="form-select" id="ctRepSel">${opzioni.map(([k, l]) => `<option value="${k}" ${k === ct.report ? 'selected' : ''}>${l}</option>`).join('')}</select>
        <button class="btn btn-primary" id="ctRepCopy">Copia</button></div>
      <pre class="ct-rep" id="ctRepText">${ctEsc(ctReportTesto(M, ct.report))}</pre>
      <div class="modal-actions"><button class="btn btn-ghost" data-ct-repclose>Chiudi</button></div>
    </div></div>`;
}

// ── PAGINA ─────────────────────────────────────────────────────────────────────────
function renderConto() {
  const ct = ctState();
  if (!ct.data && !ct.loading && !ct.error) setTimeout(() => ctLoad(), 0);
  const head = `<div class="page-header ct-ph"><div><div class="page-title">Conto mensile</div>
      <div class="page-sub">${ct.data ? `Ordini Google aggiornati ${ct.data.ultimo_sync ? 'alle ' + new Date(ct.data.ultimo_sync).toLocaleString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'mai'}${ct.metaErr ? ` · Meta del mese dal Registro (API: ${ctEsc(ct.metaErr)})` : ''}` : 'Netto Google, Meta e costi, mese per mese'}</div></div>
    <div class="ct-actions">
      <div class="ct-seg" role="group" aria-label="Vista"><button type="button" data-ct-view="mesi" aria-pressed="${ct.view === 'mesi'}">Mesi</button><button type="button" data-ct-view="trimestri" aria-pressed="${ct.view === 'trimestri'}">Trimestri</button></div>
      <button class="btn btn-ghost" id="ctReport" ${ct.data ? '' : 'disabled'}>Report</button>
      <button class="btn btn-ghost" id="ctReload" ${ct.loading ? 'disabled' : ''}>${ct.syncing ? 'Aggiorno da Google…' : ct.loading ? 'Carico…' : 'Aggiorna'}</button>
    </div></div>`;
  if (ct.error) return `${head}<div class="card"><div class="empty"><div class="empty-text">${ctEsc(ct.error)}</div></div></div>`;
  if (!ct.data) return `${head}<div class="card"><div class="empty"><div class="empty-text">${ct.syncing ? 'Aggiorno gli ordini da Google…' : 'Carico il conto…'}</div></div></div>`;
  let M;
  try { M = ctModel(); } catch (e) { console.error(e); return `${head}<div class="card"><div class="empty"><div class="empty-text">Errore nel calcolo: ${ctEsc(e.message)}</div></div></div>`; }
  return `${head}
    ${ctKpi(M)}
    <div class="card ct-card">
      <div class="ct-cap"><div class="card-title" style="margin:0">${ct.view === 'trimestri' ? 'Conto per trimestre' : 'Conto per mese'}</div>
        <div class="ct-leg"><span><i class="ct-sw ct-sw-a"></i>avvenuto</span><span><i class="ct-sw ct-sw-s"></i>stimato</span></div></div>
      ${ctTabella(M)}
      ${ctDettaglio(M)}
    </div>
    ${ctScala(M)}
    ${ctReportModal(M)}`;
}

// ── EVENTI ─────────────────────────────────────────────────────────────────────────
let ctPop = null;
function ctChiudiInfo() { if (ctPop) { ctPop.remove(); ctPop = null; } }
function ctApriInfo(btn) {
  const key = btn.dataset.ctInfo;
  if (ctPop && ctPop.dataset.key === key) { ctChiudiInfo(); return; }
  ctChiudiInfo();
  ctPop = document.createElement('div');
  ctPop.className = 'ct-pop'; ctPop.dataset.key = key; ctPop.setAttribute('role', 'tooltip');
  ctPop.innerHTML = CT_INFO[key] || '';
  document.body.appendChild(ctPop);
  const r = btn.getBoundingClientRect(); const w = ctPop.offsetWidth, h = ctPop.offsetHeight;
  const left = Math.max(8, Math.min(window.innerWidth - w - 8, r.left + r.width / 2 - w / 2));
  const top = r.bottom + 8 + h > window.innerHeight ? r.top - h - 8 : r.bottom + 8;
  ctPop.style.left = left + 'px'; ctPop.style.top = Math.max(8, top) + 'px';
}
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-ct-info]');
  if (b) { e.preventDefault(); e.stopPropagation(); ctApriInfo(b); return; }
  if (ctPop && !e.target.closest('.ct-pop')) ctChiudiInfo();
}, true);
document.addEventListener('keydown', e => { if (e.key === 'Escape') { ctChiudiInfo(); const ct = state.ct; if (ct && ct.report) { ct.report = null; render(); } } });
window.addEventListener('scroll', ctChiudiInfo, true);

function attachContoEvents() {
  ctChiudiInfo();
  if (state.page !== 'conto') return;
  const ct = ctState();
  document.querySelectorAll('[data-ct-view]').forEach(el => el.addEventListener('click', () => { ct.view = el.dataset.ctView; ct.sel = null; render(); }));
  document.querySelectorAll('[data-ct-exp]').forEach(el => el.addEventListener('click', () => { ct.open[el.dataset.ctExp] = !ct.open[el.dataset.ctExp]; render(); }));
  const pick = el => { const [r, c] = el.dataset.ctCell.split('|'); ct.sel = ct.sel && ct.sel.r === r && ct.sel.c === c ? null : { r, c }; render(); };
  document.querySelectorAll('[data-ct-cell]').forEach(el => {
    el.addEventListener('click', () => pick(el));
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(el); } });
  });
  const x = document.querySelector('[data-ct-close]'); if (x) x.addEventListener('click', () => { ct.sel = null; render(); });
  const rl = document.getElementById('ctReload'); if (rl) rl.addEventListener('click', () => ctLoad({ forzaSync: true }));
  const rp = document.getElementById('ctReport'); if (rp) rp.addEventListener('click', () => { const pre = currentMeseStr(); ct.report = addMese(pre, -1) >= CT_DAL ? addMese(pre, -1) : pre; render(); });
  document.querySelectorAll('[data-ct-repclose]').forEach(el => el.addEventListener('click', e => { if (e.target === el) { ct.report = null; render(); } }));
  const sel = document.getElementById('ctRepSel'); if (sel) sel.addEventListener('change', () => { ct.report = sel.value; render(); });
  const cp = document.getElementById('ctRepCopy');
  if (cp) cp.addEventListener('click', async () => {
    const t = document.getElementById('ctRepText').textContent;
    try { await navigator.clipboard.writeText(t); showToast('Report copiato'); }
    catch { const r = document.createRange(); r.selectNodeContents(document.getElementById('ctRepText')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
  });
}
