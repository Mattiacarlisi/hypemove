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
// Riferimenti di settore e soglie usati nei grafici (RevenueCat 2026 Health & Fitness Google Play; LTV/CAC > 3 David Skok)
const CT_PROVE_SETTORE = 0.357;           // prove gratuite che diventano un abbonamento
const CT_LTVCAC_SANO = 3;                 // LTV ÷ CAC sano sopra 3
const CT_RIENTRO_SANO = 12;               // rientro del CAC sano sotto 12 mesi
const CT_MESI_DATI = 6;                   // sotto questi mesi con paganti il pareggio è solo un'indicazione
const CT_MESE_MEDIO = 365.25 / 12;        // giorni di un mese medio, per proiettare un ritmo «al mese»
const CT_SALDO_ESEMPIO = 5000;            // saldo d'esempio, mostrato solo col bottone e mai salvato
const CT_POCHI_CASI = 30;                 // sotto 30 casi una percentuale va letta coi conteggi

const ctRomeFmt = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit' });
function ctDay(d) { return ctRomeFmt.format(d instanceof Date ? d : new Date(d)); }   // 'YYYY-MM-DD' ora di Roma
// Ora di Roma al millisecondo: serve alla competenza (inizio dei mesi e scadenza di un periodo a mesi di calendario)
const ctRomePartsFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
function ctRomeParts(t) {
  const p = {}; for (const x of ctRomePartsFmt.formatToParts(new Date(t))) p[x.type] = Number(x.value);
  return { y: p.year, mo: p.month - 1, d: p.day, h: p.hour % 24, mi: p.minute, s: p.second, ms: ((t % 1000) + 1000) % 1000 };
}
function ctRomeOff(t) { const p = ctRomeParts(t); return Date.UTC(p.y, p.mo, p.d, p.h, p.mi, p.s, p.ms) - t; }
function ctRomeWall(y, mo, d, h = 0, mi = 0, s = 0, ms = 0) {   // ora "da orologio" di Roma → istante
  const u = Date.UTC(y, mo, d, h, mi, s, ms);
  let g = u - ctRomeOff(u); g = u - ctRomeOff(g); return g;
}
function ctInizioMese(m) { const [y, mm] = m.split('-').map(Number); return ctRomeWall(y, mm - 1, 1); }
function ctPiuMesi(t, n) {                                   // stesso giorno e ora, n mesi di calendario dopo (31/01 + 1 → 28/02)
  const p = ctRomeParts(t); const giorni = new Date(Date.UTC(p.y, p.mo + n + 1, 0)).getUTCDate();
  return ctRomeWall(p.y, p.mo + n, Math.min(p.d, giorni), p.h, p.mi, p.s, p.ms);
}
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
const CT_PLURALI = { 'annuale': 'annuali', 'mensile': 'mensili', 'annuale a rate': 'annuali a rate', 'a rate': 'a rate', 'annuale scontato': 'annuali scontati' };
function ctPl(n, label) { return `${n} ${n === 1 ? label : (CT_PLURALI[label] || label)}`; }

// ── CARICAMENTO ──────────────────────────────────────────────────────────────────
function ctState() {
  if (!state.ct) state.ct = { data: null, metaDays: null, metaErr: null, loading: false, error: null, view: 'mesi', open: {}, sel: null, report: null, syncing: false, loadedAt: null,
    mode: 'cassa',                                   // cassa | comp (competenza)
    dr: { open: false, id: 'mrr', pin: null },       // cassetto dei grafici: aperto, metrica, periodo fissato
    drScroll: 0, anim: true,
    saldo: null,                                     // { saldo, data } da finance_settings.conto_saldo
    saldoBozza: null, esempio: false, saldoSaving: false };
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
    const saldoP = Promise.resolve(sb.from('finance_settings').select('value').eq('key', 'conto_saldo').maybeSingle()).catch(e => ({ error: e }));
    let { data, error } = await sb.rpc('finance_conto_dati');
    if (error) throw error;
    // Saldo in banca: se la lettura fallisce il conto resta usabile, si chiede di nuovo il saldo.
    const sr = await saldoP;
    const sv = !sr.error && sr.data && sr.data.value;
    ct.saldo = sv && sv.saldo != null && isFinite(Number(sv.saldo)) ? { saldo: Number(sv.saldo), data: sv.data || null } : null;
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
    ct.loadedAt = new Date(); ct.animPage = true;
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
  return { lordo: 0, iva: 0, comm: 0, netto: 0, entrateReg: 0, meta: 0, altri: 0, stime: 0, servizio: 0,
    altriCat: {}, stimeVoci: {}, ordini: [], rimborsi: [], movimenti: [], metaGiorni: null, metaFonte: null, voci: [] };
}
function ctAddOrdine(b, o, segno = 1) {
  b.lordo += segno * o.lordo; b.iva += segno * o.iva; b.netto += segno * o.netto; b.comm += segno * (o.lordo - o.iva - o.netto);
}
function ctRisultato(b) { return b.netto + b.entrateReg - b.meta - b.altri - b.stime; }
function ctSomma(bs) {
  const t = ctBucket();
  for (const b of bs) {
    for (const k of ['lordo', 'iva', 'comm', 'netto', 'entrateReg', 'meta', 'altri', 'stime', 'servizio']) t[k] += b[k];
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
      if (ctServizio(x)) t.servizio += v;
    }
    const st = stimaVoci(m, movM);
    if (isCur && ct.metaDays) {
      b.metaGiorni = ct.metaDays; b.metaFonte = 'api';
      b.meta = Object.values(ct.metaDays).reduce((s, v) => s + v, 0);
    }
    if (isCur && st[CT_STIME.ai.voce] && giornoN > 0) {     // AI: finora quello consumato, il resto in proporzione
      const ai = st[CT_STIME.ai.voce];
      p.stime += ctR2(ai / giornoN * restano); p.servizio += ctR2(ai / giornoN * restano); p.stimeVoci[CT_STIME.ai.voce] = ctR2(ai / giornoN * restano);
    }
    for (const [k, v] of Object.entries(st)) { b.stime += v; b.servizio += v; b.stimeVoci[k] = v; }
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
    const persi = abb.filter(a => a.pagato != null && a.scade != null && a.scade <= Math.min(t, now) && ctDay(a.scade).slice(0, 7) === m);
    ind[m] = { paganti: att.length, persi: persi.length, persiRimborsi: persi.filter(a => a.rimborsato).length, nuovi: nuovi.length, nuoviDiretti: nuovi.filter(a => a.prova == null).length,
      mrr: att.reduce((s, a) => s + nettoMese(a), 0), proveOk: decise.filter(x => x.e.ok).length, proveTot: decise.length,
      perPiano: att.reduce((o, a) => (o[a.piano] = (o[a.piano] || 0) + 1, o), {}),
      // Da dove nasce il MRR: netto mensile dei nuovi paganti (primo pagamento nel mese) e dei persi (stesse regole di «persi»)
      mrrNuovo: nuovi.reduce((s, a) => s + nettoMese(a), 0), mrrPerso: persi.reduce((s, a) => s + nettoMese(a), 0),
      persiDett: persi.map(a => CT_PIANO_LABEL[a.piano] + (a.rimborsato ? ' rimborsato' : '')) };
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

  // Competenza: il netto di ogni ordine si spalma sul periodo che copre (annuale 12 mesi di calendario,
  // mensile e rata 1 mese), per sovrapposizione esatta degli intervalli in millisecondi; rimborsati esclusi.
  // Il mese in corso arriva fino a adesso; compFull = mese intero, con i soli ordini già fatti.
  const periodi = (d.ordini || []).filter(o => o.stato !== 'REFUNDED').map(o => {
    const s = new Date(o.at).getTime();
    return { s, e: ctPiuMesi(s, ctPiano(o) === 'annuale' ? 12 : 1), netto: o.netto != null ? Number(o.netto) : ctNet(Number(o.lordo)) };
  }).filter(p => p.s <= now && p.e > p.s);
  const quota = (a, b) => periodi.reduce((s, p) => { const ov = Math.min(p.e, b) - Math.max(p.s, a); return ov > 0 ? s + p.netto * ov / (p.e - p.s) : s; }, 0);
  const comp = {}, cumulatoC = {}, risconti = {};
  let accC = 0, accCassa = 0, accComp = 0;
  for (const m of mesi) {
    comp[m] = quota(ctInizioMese(m), m === cur ? now : ctInizioMese(addMese(m, 1)));
    accC += ctRisultato(cols[m]) - cols[m].netto + comp[m]; cumulatoC[m] = accC;
    accCassa += cols[m].netto; accComp += comp[m];
    risconti[m] = accCassa - accComp;               // incassato a fine mese che appartiene ai mesi dopo
  }
  const compFull = quota(ctInizioMese(cur), ctInizioMese(addMese(cur, 1)));
  const compTutto = periodi.reduce((s, p) => s + p.netto, 0);   // verifica: spalmato su tutto il periodo = netto degli ordini

  return { oggi, cur, mesi, chiusi, cols, ind, tot, cumulato, scen, blocchi, tasso, inProva, abb,
    proveDecise: tutteDecise, metaBasso, metaAlto, giorniAttivi, giornoN, restano, giorniCur,
    attiviOra: attiviAl(now), nettoMese, now, comp, compFull, compTutto, cumulatoC, risconti };
}

// ── COLONNE ──────────────────────────────────────────────────────────────────────
function ctColonne(M, view = ctState().view) {
  const cs = [];
  if (view === 'trimestri') {
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
    roas: c.kind !== 'E' && meta > 0 ? netto / meta : null,
    persi: c.kind === 'E' ? null : sum('persi'),
    arppu: c.kind !== 'E' && i.paganti ? i.mrr / i.paganti : null,
    crescita: (() => { if (c.kind === 'E' || c.kind === 'T') return null; const prev = addMese(c.mesi[0], -1); const p = M.ind[prev]; return p && p.mrr > 0 ? i.mrr / p.mrr - 1 : null; })(),
    margine: c.kind !== 'E' ? ctMargine(c.b) : null,
    payback: c.kind !== 'E' && nuovi && i.paganti && i.mrr > 0 ? (meta / nuovi) / (i.mrr / i.paganti) : null,
    roi: c.kind !== 'E' ? ctRoi(c.b) : null,
  };
}

// Costi di servizio: quelli che crescono con gli utenti (server, infrastruttura, AI), per il margine lordo.
const CT_SERVIZIO_RE = /supabase|google cloud|openrouter|hosting|server/i;
function ctServizio(x) { return x.categoria === 'Hosting & Infrastruttura' || CT_SERVIZIO_RE.test(String(x.descrizione || '')); }
function ctMargine(b) { return b.netto > 0 ? (b.netto - b.servizio) / b.netto : null; }

// ROI su tutti i costi: (entrate − costi) ÷ costi
function ctCosti(b) { return b.meta + b.altri + b.stime; }
function ctRoi(b) { const k = ctCosti(b); return k > 0 ? (b.netto + b.entrateReg - k) / k : null; }
function ctPct(v, dec = 1) { return v == null || !isFinite(v) ? '—' : ctN(v * 100, dec) + '%'; }

// ── VALORE DI UN CLIENTE NEL TEMPO (LTV) ─────────────────────────────────────────────
// Nessun vostro abbonamento ha ancora rinnovato: finché i casi sono meno di CT_LTV_MIN si usano
// i tassi di primo rinnovo del settore (RevenueCat 2026, Health & Fitness su Google Play).
const CT_RINNOVO_SETTORE = { mensile: 0.573, annuale: 0.246 };
const CT_LTV_MIN = 30;
const CT_DAY = 86400000;
function ctLtv(M) {
  const now = Date.now();
  const propri = (piano, periodo, soglia) => {
    const arrivati = M.abb.filter(a => a.pagato != null && (piano === 'annuale' ? a.piano !== 'mensile' : a.piano === 'mensile') && a.pagato + periodo * CT_DAY < now);
    return { n: arrivati.length, ok: arrivati.filter(a => a.scade != null && a.scade > a.pagato + soglia * CT_DAY).length };
  };
  const own = { mensile: propri('mensile', 31, 40), annuale: propri('annuale', 366, 400) };
  const r = {}, fonte = {};
  for (const p of ['mensile', 'annuale']) {
    const usaPropri = own[p].n >= CT_LTV_MIN;
    r[p] = usaPropri ? own[p].ok / own[p].n : CT_RINNOVO_SETTORE[p];
    fonte[p] = usaPropri ? 'vostro' : 'settore';
  }
  const annNet = ctNet(CT_LISTINO.annuale);
  const valore = a => {
    const n1 = a.ultimo_netto != null ? Number(a.ultimo_netto) : ctNet(Number(a.prezzo) || CT_LISTINO[a.piano]);
    if (a.piano === 'mensile') return { v: n1 / (1 - r.mensile), conto: `${ctN(n1)} ÷ (1 − ${ctPct(r.mensile)})`, label: 'mensile' };
    if (a.piano === 'rate') { const y = ctR2(n1 * 12); return { v: y / (1 - r.annuale), conto: `12 × ${ctN(n1)} = ${ctN(y)} ÷ (1 − ${ctPct(r.annuale)})`, label: 'a rate' }; }
    const n2 = ctNet(Number(a.prezzo) || CT_LISTINO.annuale);
    if (Math.abs(n1 - n2) < 0.01) return { v: n2 / (1 - r.annuale), conto: `${ctN(n2)} ÷ (1 − ${ctPct(r.annuale)})`, label: 'annuale' };
    return { v: n1 + r.annuale * n2 / (1 - r.annuale), conto: `${ctN(n1)} il 1° anno + ${ctPct(r.annuale)} × ${ctN(n2)} ÷ (1 − ${ctPct(r.annuale)})`, label: 'annuale scontato' };
  };
  const gruppi = {};
  for (const a of M.attiviOra) { const x = valore(a); const k = x.label + '|' + x.v.toFixed(2); (gruppi[k] ||= { ...x, n: 0 }).n++; }
  const G = Object.values(gruppi);
  const n = M.attiviOra.length;
  const ltv = n ? G.reduce((s, g) => s + g.v * g.n, 0) / n : null;
  const pagantiSempre = M.abb.filter(a => a.pagato != null).length;
  const storico = pagantiSempre ? M.tot.netto / pagantiSempre : null;
  return { ltv, G, n, r, fonte, own, storico, pagantiSempre, annNet };
}

// ── RENDER ───────────────────────────────────────────────────────────────────────
// Ogni spiegazione dice cos'è, la formula, e il conto rifatto coi numeri della pagina:
// così un errore si vede subito. Le funzioni ricevono il modello del render corrente.
function ctBox(titolo, def, formula, calcolo, nota) {
  return `<b>${titolo}</b>${def ? `<p>${def}</p>` : ''}`
    + (formula ? `<div class="ct-f"><span>Formula</span>${formula}</div>` : '')
    + (calcolo ? `<div class="ct-f ct-calc"><span>Il conto</span>${calcolo}</div>` : '')
    + (nota ? `<p class="ct-nota">${nota}</p>` : '');
}
function ctMeseCur(M) { return CT_MESI[Number(M.cur.slice(5)) - 1]; }
function ctDaFeb() { return 'da ' + CT_MESI[Number(CT_DAL.slice(5)) - 1]; }
function ctNuoviTot(M) { return M.mesi.reduce((s, m) => s + M.ind[m].nuovi, 0); }

const CT_INFO = {
  netto: M => {
    const F = M.cols[M.cur];
    return ctBox('Netto che arriva da Google',
      `Dal prezzo Google toglie l'IVA al 22% (la versa lui allo Stato), poi il 15% di commissione su quello che resta. È il netto vero di ogni ordine, letto da Google.`,
      `prezzo ÷ 1,22 × 0,85 &nbsp;(9,90 → 6,89 · 29,99 → 20,89)`,
      `${ctMeseCur(M)} finora: ${ctN(F.lordo)} pagati − ${ctN(F.iva)} IVA − ${ctN(F.comm)} commissione = <b>${ctN(F.netto)} €</b>`,
      `Google lo versa verso il 15 del mese dopo: è il netto maturato nel mese, non il bonifico.`);
  },
  meta: M => {
    const F = M.cols[M.cur];
    return ctBox('Meta Ads', `Mesi chiusi: la voce del Registro. Mese in corso: l'API Meta giorno per giorno, oggi compreso (parziale).`, null,
      F.metaGiorni ? `${ctMeseCur(M)}: ${Object.keys(F.metaGiorni).length} giorni letti dall'API = <b>${ctN(F.meta)} €</b>` : `${ctMeseCur(M)}: ${ctN(F.meta)} € dal Registro`);
  },
  altri: () => ctBox('Altri costi nel Registro', `Tutte le spese del Registro tranne Meta, nel mese della loro data. Nel mese in corso una voce con data futura (un ricorrente del 20) sta in «previsto». Apri la riga per vederle per categoria, clicca una cifra per l'elenco.`),
  stime: M => {
    const v = M.cols[M.cur].stimeVoci;
    return ctBox('Costi stimati',
      `Costi veri che nel Registro non ci sono ancora. La stima di un mese sparisce da sola quando nel Registro c'è la voce vera con quel nome.`,
      `${CT_STIME.voci.map(x => `${x.voce} = ${ctN(x.importo)} € (ultimo importo registrato)`).join(' · ')} · AI = dollari stimati dall'app × ${ctN(CT_STIME.cambioUsdEur)}`,
      Object.keys(v).length ? `${ctMeseCur(M)} finora: ${Object.entries(v).map(([k, x]) => `${k} ${ctN(x)}`).join(' + ')} = <b>${ctN(M.cols[M.cur].stime)} €</b>` : null);
  },
  risultato: M => {
    const F = M.cols[M.cur];
    return ctBox('EBITDA, il risultato del mese', `Il margine operativo: entrate meno tutti i costi di funzionamento, prima delle imposte. Per voi coincide con il risultato del mese, perché non ci sono ammortamenti né interessi.`,
      `netto da Google − Meta − altri costi − costi stimati`,
      `${ctMeseCur(M)} finora: ${ctN(F.netto)} − ${ctN(F.meta)} − ${ctN(F.altri)} − ${ctN(F.stime)} = <b>${ctN(ctRisultato(F))} €</b>`
        + `<br>stima di fine mese: <b>${ctN(M.scen.centrale.ris)} €</b>, tra ${ctN(M.scen.prudente.ris)} e ${ctN(M.scen.ottimista.ris)}`
        + (ctState().mode === 'comp' ? `<br>per competenza, ${ctMeseCur(M)} finora: ${ctN(M.comp[M.cur])} − ${ctN(F.meta)} − ${ctN(F.altri)} − ${ctN(F.stime)} = <b>${ctN(ctRisultato(F) - F.netto + M.comp[M.cur])} €</b> (la stima di fine mese si fa solo in cassa)` : ''),
      `<b>Imposte.</b> Oggi gli incassi vanno sulla P.IVA di Mattia: se è forfettario si paga sul 67% dei ricavi anche quando si è in perdita; se è ordinario solo sull'utile. In una SRL: IRES 24% sull'utile e IRAP 4,73% (Marche) sul valore della produzione, che non è l'utile. Da confermare col commercialista.`);
  },
  ebitdaM: M => {
    const F = M.cols[M.cur], P = M.cols[addMese(M.cur, -1)];
    const r = b => b.netto > 0 ? ctRisultato(b) / b.netto : null;
    return ctBox('EBITDA margin', `Quanta parte del netto resta dopo tutti i costi. Con un netto piccolo il numero diventa enorme: conta più la direzione che il valore.`,
      `EBITDA ÷ netto da Google (in competenza: EBITDA di competenza ÷ netto di competenza)`,
      `${ctMeseCur(M)} finora: ${ctN(ctRisultato(F))} ÷ ${ctN(F.netto)} = <b>${ctPct(r(F), 0)}</b>`
        + (P && r(P) != null ? `<br>${CT_MESI[Number(addMese(M.cur, -1).slice(5)) - 1]}: ${ctN(ctRisultato(P))} ÷ ${ctN(P.netto)} = ${ctPct(r(P), 0)}` : ''));
  },
  cassa: M => {
    const cassa = M.tot.netto, comp = M.mesi.reduce((s, m) => s + M.comp[m], 0);
    return ctBox('Cassa o competenza', `Due modi di contare lo stesso incasso. <b>Cassa</b>: un annuale da ${ctN(ctNet(CT_LISTINO.annuale))} € netti entra tutto nel mese dell'ordine, cioè quello che arriva da Google. <b>Competenza</b>: lo stesso annuale vale ${ctN(ctNet(CT_LISTINO.annuale) / 12)} € al mese per 12 mesi, un mensile vale il suo mese. La cassa dice se reggete; la competenza dice quanto vale davvero il mese, ed è quella del bilancio di una SRL.`,
      `netto di ogni ordine spalmato sul periodo che copre (annuale 12 mesi, mensile e rata 1 mese), al millisecondo; rimborsi esclusi`,
      `${ctDaFeb()}: ${ctN(cassa)} € incassati − ${ctN(comp)} € di competenza = <b>${ctN(M.risconti[M.cur])} €</b> incassati per i mesi dopo (risconti)<br>${ctMeseCur(M)}: ${ctN(M.comp[M.cur])} € fino a oggi · ${ctN(M.compFull)} € a mese intero`,
      `Il mese intero conta solo gli ordini già fatti: le vendite previste da qui a fine mese non sono spalmate, per questo in competenza la stima di fine mese dell'EBITDA non c'è. ROI, ROAS e CAC restano in cassa.`);
  },
  risconti: M => ctBox('Incassato per i mesi dopo (risconti)', `La parte del netto già incassato che appartiene ai mesi che vengono: un annuale pagato oggi copre anche i prossimi 11 mesi. A fine periodo, non nel periodo.`,
    `netto incassato ${ctDaFeb()} a fine periodo − netto di competenza ${ctDaFeb()} a fine periodo`,
    `oggi: ${ctN(M.tot.netto)} − ${ctN(M.mesi.reduce((s, m) => s + M.comp[m], 0))} = <b>${ctN(M.risconti[M.cur])} €</b>`),
  movimenti: M => {
    const I = M.ind[M.cur], P = M.ind[addMese(M.cur, -1)] || { mrr: 0 };
    return ctBox('Da dove nasce il MRR', `Il MRR cresce con i nuovi paganti e cala con quelli persi. La differenza è il MRR netto del mese.`,
      `MRR nuovo − MRR perso = MRR netto = MRR fine − MRR inizio`,
      `${ctMeseCur(M)}: +${ctN(I.mrrNuovo)} − ${ctN(I.mrrPerso)} = <b>${ctFS(I.mrrNuovo - I.mrrPerso)} €</b> · ${ctN(I.mrr)} − ${ctN(P.mrr)} = ${ctFS(I.mrr - P.mrr)} €`,
      `MRR nuovo: netto al mese degli abbonamenti con il primo pagamento nel mese. MRR perso: netto al mese di quelli scaduti nel mese senza rinnovo, rimborsi compresi (contati al prezzo dell'ultimo ordine).${I.persiDett.length ? ` Persi a ${ctMeseCur(M)}: ${I.persiDett.join(', ')}.` : ''}`);
  },
  saldo: M => {
    const b = ctBurn(M);
    return ctBox('Autonomia (runway)', `Quanti mesi potete andare avanti con i soldi sul conto, se la perdita resta quella media. Il netto di Google arriva con un mese di ritardo: il conto in banca è un po' indietro rispetto al conto economico.`,
      `saldo ÷ perdita media al mese (ultimi 3 mesi chiusi)`,
      b.ora != null && b.ora < 0 ? `perdita media: <b>${ctN(b.ora)} €</b> al mese` : null,
      `Il saldo si salva nel Finance con la data di inserimento: aggiornatelo quando cambia.`);
  },
  pareggio: M => {
    const P = ctPareggio(M);
    return ctBox('Quando arriviamo al pareggio', `Il mese in cui i paganti coprono i costi di funzionamento senza pubblicità (gradino 1 della scala). Due ipotesi di ritmo, perché una sola data sarebbe una finta precisione.`,
      `paganti mancanti ÷ paganti in più al mese`,
      P.man <= 0 ? `servono ${P.need} paganti, oggi ${P.n}: <b>gradino già coperto</b>` :
        `mancano ${P.need} − ${P.n} = <b>${P.man}</b> paganti<br>ritmo di ${ctMeseCur(M)}: ${ctFS(P.nettiCur, 0)} in ${M.giornoN} giorni ≈ ${ctFS(P.rB, 1)} al mese → ${P.rB > 0 ? `${P.man} ÷ ${ctN(P.rB, 1)} = <b>${ctN(P.mB, 1)} mesi</b>, ${ctMeseAnno(P.dB)}` : 'non si arriva'}<br>ritmo medio da ${CT_MESI[Number(P.primo.slice(5)) - 1]}: ${P.n} in ${ctN(P.mesiTrascorsi, 1)} mesi ≈ ${ctFS(P.rA, 1)} al mese → ${P.rA > 0 ? `${P.man} ÷ ${ctN(P.rA, 1)} = <b>${ctN(P.mA, 1)} mesi</b>, ${ctMeseAnno(P.dA)}` : 'non si arriva'}`,
      `Ipotesi: costi fermi a ${ctN(P.funz)} €/mese, mix di piani fermo (${ctN(P.perPag)} € a pagante), nessun abbandono; un mese = ${ctN(CT_MESE_MEDIO, 2)} giorni.${P.mesiConPaganti < CT_MESI_DATI ? ` Con ${P.mesiConPaganti} mesi di paganti servono più mesi di dati.` : ''}`);
  },
  cumulato: M => ctBox('Cumulato', `Quanto avete messo di tasca vostra finora (se negativo).`,
    `somma dei risultati ${ctDaFeb()} a oggi`,
    `${M.mesi.map(m => ctN(ctRisultato(M.cols[m]))).join(' + ')} = <b>${ctN(M.cumulato[M.cur])} €</b>`
      + (ctState().mode === 'comp' ? `<br>per competenza: <b>${ctN(M.cumulatoC[M.cur])} €</b>; la differenza (${ctN(M.risconti[M.cur])} €) sono i risconti` : '')),
  paganti: M => {
    const p = M.attiviOra.reduce((o, a) => (o[a.piano] = (o[a.piano] || 0) + 1, o), {});
    return ctBox('Paganti', `Abbonamenti pagati e non ancora scaduti (a fine mese, o oggi). Chi ha disdetto ma ha ancora giorni pagati conta fino alla scadenza. Esclusi test e account interni; le prove non contano.`,
      `abbonamenti con un pagamento e scadenza dopo oggi`,
      `${Object.entries(p).map(([k, n]) => ctPl(n, CT_PIANO_LABEL[k])).join(' + ')} = <b>${M.attiviOra.length}</b>${M.inProva.length ? ` · più ${M.inProva.length} in prova` : ''}`);
  },
  nuovi: M => ctBox('Nuovi paganti', `Abbonamenti con il primo pagamento nel mese, da prova o diretti. Un rimborso non lo toglie da qui: lo toglie dai paganti.`, null,
    `${ctMeseCur(M)}: ${M.ind[M.cur].nuovi - M.ind[M.cur].nuoviDiretti} da prova + ${M.ind[M.cur].nuoviDiretti} diretti = <b>${M.ind[M.cur].nuovi}</b>`),
  prove: M => {
    const ok = M.proveDecise.filter(e => e.ok).length, n = M.proveDecise.length;
    return ctBox('Prove che pagano', `Prove gratuite con l'esito già deciso: pagate, oppure scadute o disdette senza pagare. Le prove ancora aperte non contano.`,
      `prove pagate ÷ prove con l'esito deciso`,
      `${ok} pagate ÷ (${ok} pagate + ${n - ok} non pagate) = <b>${ctPct(n ? ok / n : null, 0)}</b>`,
      `Settore (RevenueCat 2026, Health & Fitness su Google Play): 35,7%. Sotto le 30 prove la percentuale balla molto: guardate i conteggi.`);
  },
  mrr: M => {
    const g = {};
    for (const a of M.attiviOra) { const v = M.nettoMese(a); const k = CT_PIANO_LABEL[a.piano] + '|' + v.toFixed(2); (g[k] ||= { l: CT_PIANO_LABEL[a.piano], v, n: 0 }).n++; }
    const mrr = M.attiviOra.reduce((s, a) => s + M.nettoMese(a), 0);
    return ctBox('Ricavo ricorrente mensile (MRR)', `Quanto netto vi lasciano al mese gli abbonamenti attivi oggi. È il primo numero che guarda un investitore.`,
      `somma del netto mensile di ogni abbonamento attivo (annuale: netto ÷ 12) · ARR = MRR × 12`,
      `${Object.values(g).map(x => `${ctPl(x.n, x.l)} × ${ctN(x.v)}`).join(' + ')} = <b>${ctN(mrr)} €</b><br>ARR: ${ctN(mrr)} × 12 = <b>${ctN(mrr * 12)} €</b>`);
  },
  cac: M => {
    const F = M.cols[M.cur], n = M.ind[M.cur].nuovi, nt = ctNuoviTot(M);
    return ctBox('Costo per nuovo pagante (CAC)', `Quanto vi costa in pubblicità ogni nuovo pagante. Conta tutti i nuovi paganti, anche quelli arrivati senza pubblicità, quindi è un po' ottimista.`,
      `spesa Meta ÷ nuovi paganti, nello stesso periodo`,
      `${ctMeseCur(M)}: ${ctN(F.meta)} ÷ ${n} = <b>${n ? ctN(F.meta / n) + ' €' : '—'}</b><br>${ctDaFeb()}: ${ctN(M.tot.meta)} ÷ ${nt} = <b>${nt ? ctN(M.tot.meta / nt) + ' €' : '—'}</b>`);
  },
  roi: M => {
    const F = M.cols[M.cur], T = M.tot;
    const riga = (b, l) => { const k = ctCosti(b), r = ctRoi(b); return `${l}: (${ctN(b.netto + b.entrateReg)} entrate − ${ctN(k)} costi) ÷ ${ctN(k)} costi = <b>${ctPct(r)}</b>`; };
    return ctBox('Ritorno sull\'investimento (ROI)', `Quanto rende tutto quello che avete speso: Meta, strumenti, server, AI. 0% è il pareggio; −60% vuol dire che di ogni 100 € spesi ne sono tornati 40.`,
      `(netto da Google − tutti i costi) ÷ tutti i costi`,
      `${riga(F, ctMeseCur(M) + ' finora')}<br>${riga(T, ctDaFeb())}`);
  },
  roas: M => {
    const F = M.cols[M.cur], T = M.tot;
    return ctBox('Ritorno su Meta (ROAS)', `Guarda solo la pubblicità: quanti euro netti sono tornati per ogni euro speso in Meta. Sotto 1 € la pubblicità non si è ancora ripagata. Gli annuali pagano subito, i mensili un po' ogni mese: il ritorno dei mensili arriva dopo.`,
      `netto da Google ÷ spesa Meta, nello stesso periodo`,
      `${ctMeseCur(M)}: ${ctN(F.netto)} ÷ ${ctN(F.meta)} = <b>${F.meta ? ctN(F.netto / F.meta) + ' €' : '—'}</b><br>${ctDaFeb()}: ${ctN(T.netto)} ÷ ${ctN(T.meta)} = <b>${T.meta ? ctN(T.netto / T.meta) + ' €' : '—'}</b>`);
  },
  ltv: M => {
    const L = ctLtv(M); const F = M.cols[M.cur]; const n = M.ind[M.cur].nuovi;
    const cac = n ? F.meta / n : null;
    const tassi = ['mensile', 'annuale'].map(p => `${p}: ${ctPct(L.r[p])} (${L.fonte[p] === 'settore' ? 'settore' : 'vostro'}; i vostri: ${L.own[p].n ? `${L.own[p].ok} su ${L.own[p].n}` : 'nessuno ancora arrivato al rinnovo'})`).join(' · ');
    return ctBox('Valore di un cliente nel tempo (LTV)',
      `Quanto netto vi lascia un pagante in tutta la sua vita. Si suppone che a ogni rinnovo resti la stessa quota di abbonati. Non toglie il costo dell'AI per utente.`,
      `netto per periodo ÷ (1 − quota che rinnova) · poi media sui paganti di oggi`,
      `${L.G.map(g => `${ctPl(g.n, g.label)}: ${g.conto} = ${ctN(g.v)}`).join('<br>')}<br>media: (${L.G.map(g => `${g.n} × ${ctN(g.v)}`).join(' + ')}) ÷ ${L.n} = <b>${ctN(L.ltv)} €</b>`
        + (cac ? `<br>LTV ÷ CAC di ${ctMeseCur(M)}: ${ctN(L.ltv)} ÷ ${ctN(cac)} = <b>${ctN(L.ltv / cac)}</b> (riferimento: sopra 3)` : '')
        + (L.storico != null ? `<br>Incassato finora per pagante: ${ctN(M.tot.netto)} ÷ ${L.pagantiSempre} paganti di sempre = <b>${ctN(L.storico)} €</b>` : ''),
      `Quote di rinnovo — ${tassi}. Si passa ai vostri dati da soli quando i casi sono almeno ${CT_LTV_MIN}. Settore: RevenueCat 2026, primo rinnovo, Health & Fitness su Google Play.`);
  },
  burn: M => {
    const u = M.chiusi.slice(-3);
    const v = u.map(m => ctRisultato(M.cols[m]));
    return ctBox('Perdita media al mese (burn)', `Quanto vi costa ogni mese tenere aperta l'attività. Non è il conto in banca: Google versa con un mese di ritardo. Con il saldo in banca diventa l'autonomia (runway): saldo ÷ perdita al mese = mesi che restano.`,
      `media dei risultati degli ultimi 3 mesi chiusi`,
      u.length ? `(${u.map((m, i) => `${CT_MESI[Number(m.slice(5)) - 1]} ${ctN(v[i])}`).join(' + ')}) ÷ ${u.length} = <b>${ctN(v.reduce((s, x) => s + x, 0) / u.length)} €</b>` : null);
  },
  persi: M => {
    const I = M.ind[M.cur];
    return ctBox('Paganti persi', `Abbonamenti pagati che sono scaduti senza rinnovarsi, rimborsi compresi. Da qui nasce il tasso di abbandono (churn), che si misura bene solo quando i primi abbonamenti arrivano al rinnovo.`,
      `abbonamenti pagati con scadenza nel mese e non rinnovati`,
      `${ctMeseCur(M)}: <b>${I.persi}</b>${I.persiRimborsi ? ` (di cui ${I.persiRimborsi} ${I.persiRimborsi === 1 ? 'rimborsato' : 'rimborsati'})` : ''} su ${M.ind[addMese(M.cur, -1)] ? M.ind[addMese(M.cur, -1)].paganti : 0} paganti a inizio mese`,
      `Abbandono mensile = persi ÷ paganti a inizio mese. Con pochi paganti un solo abbandono sposta la percentuale di molti punti: guardate i conteggi.`);
  },
  crescita: M => {
    const a = M.ind[addMese(M.cur, -1)], b = M.ind[M.cur];
    return ctBox('Crescita del MRR', `Di quanto è cresciuto il ricavo ricorrente mensile rispetto al mese prima. È la misura di crescita che chiede un investitore.`,
      `MRR di fine mese ÷ MRR di fine mese precedente − 1`,
      a ? `${ctMeseCur(M)}: ${ctN(b.mrr)} ÷ ${ctN(a.mrr)} − 1 = <b>${a.mrr > 0 ? ctPct(b.mrr / a.mrr - 1, 0) : '—'}</b>` : null,
      `Nel mese in corso il MRR è quello di oggi.`);
  },
  arppu: M => {
    const I = M.ind[M.cur];
    return ctBox('Ricavo medio per pagante (ARPPU)', `Quanto netto vi lascia al mese, in media, un pagante. Con tanti annuali è basso: un annuale vale 1,74 € al mese, un mensile 6,89 €.`,
      `MRR ÷ paganti`, `oggi: ${ctN(I.mrr)} ÷ ${I.paganti} = <b>${I.paganti ? ctN(I.mrr / I.paganti) + ' €' : '—'}</b>`);
  },
  margine: M => {
    const F = M.cols[M.cur], T = M.tot;
    return ctBox('Margine lordo', `Quanto resta del netto dopo i costi che servono a far funzionare l'app per gli utenti: server, infrastruttura, AI. Le app in abbonamento mature stanno sopra il 70-80%; oggi è negativo perché i server e l'AI servono anche a tanti utenti gratuiti.`,
      `(netto da Google − costi di servizio) ÷ netto da Google · costi di servizio = categoria Hosting & Infrastruttura, Supabase, Google Cloud, OpenRouter e le stime`,
      `${ctMeseCur(M)} finora: (${ctN(F.netto)} − ${ctN(F.servizio)}) ÷ ${ctN(F.netto)} = <b>${ctPct(ctMargine(F), 0)}</b><br>${ctDaFeb()}: (${ctN(T.netto)} − ${ctN(T.servizio)}) ÷ ${ctN(T.netto)} = <b>${ctPct(ctMargine(T), 0)}</b>`);
  },
  payback: M => {
    const F = M.cols[M.cur], I = M.ind[M.cur];
    const cac = I.nuovi ? F.meta / I.nuovi : null, arppu = I.paganti ? I.mrr / I.paganti : null;
    return ctBox('Rientro del CAC', `In quanti mesi il netto di un pagante ripaga quello che è costato in pubblicità. Sotto i 12 mesi è considerato sano.`,
      `CAC ÷ ricavo medio per pagante al mese (ARPPU)`,
      cac && arppu ? `${ctMeseCur(M)}: ${ctN(cac)} ÷ ${ctN(arppu)} = <b>${ctN(cac / arppu, 1)} mesi</b>` : null,
      `Vale solo se il pagante resta abbastanza a lungo: un annuale che non rinnova lascia 20,89 € in tutto.`);
  },
  previsto: M => ctBox('Stima di fine mese', `Somma di blocchi che vedi cliccando una cifra della colonna «fine mese».`,
    `rinnovi in calendario + prove che finiscono entro fine mese × quota di prove che paga + nuove vendite al ritmo del mese; Meta alla media giornaliera`,
    `netto: ${ctN(M.cols[M.cur].netto)} finora + ${ctN(M.blocchi.rinnovi.netto)} rinnovi + ${ctN(M.blocchi.prove.netto)} prove + ${ctN(M.blocchi.nuove.netto)} nuove = <b>${ctN(M.scen.centrale.netto)} €</b><br>risultato: <b>${ctN(M.scen.centrale.ris)} €</b>, tra ${ctN(M.scen.prudente.ris)} e ${ctN(M.scen.ottimista.ris)}`),
  scala: M => {
    const n = M.attiviOra.length, mrr = M.attiviOra.reduce((s, a) => s + M.nettoMese(a), 0);
    return ctBox('Quanto manca per reggervi da soli', `Quanti paganti servono, con il mix di piani di oggi, per coprire ogni gradino. Un annuale porta 1,74 € al mese, un mensile 6,89 €: il mix conta molto.`,
      `paganti necessari = euro al mese da coprire ÷ MRR per pagante`,
      `MRR per pagante: ${ctN(mrr)} ÷ ${n} = <b>${n ? ctN(mrr / n) : '—'} €</b>`,
      `Costi fissi SRL ≈ ${ctN(CT_SRL_MESE, 0)} €/mese (camera di commercio, libri sociali, bilancio, commercialista). Due compensi minimi = 18.808 €/anno a testa con INPS e IRAP ≈ ${ctN(CT_COMPENSI_MESE, 0)} €/mese. Stime da confermare col commercialista.`);
  },
};
let ctLastM = null;

function ctI(key) { return `<button type="button" class="ct-i" data-ct-info="${key}" aria-label="Spiegazione">i</button>`; }

function ctCell(v, opts = {}) {
  if (v == null || !isFinite(v)) return `<span class="ct-dash">—</span>`;
  const z = Math.abs(v) < (opts.pct ? 0.00005 : 0.005);
  const cls = ['ct-n', z ? 'ct-zero' : '', opts.color && !z ? (v < 0 ? 'ct-neg' : 'ct-pos') : '', opts.stim ? 'ct-stim' : '', opts.att ? 'ct-att' : ''].join(' ');
  return `<span class="${cls}">${opts.pct ? ctPct(v, 0) : ctN(v)}</span>`;
}

// Valori per colonna che dipendono da cassa/competenza (P = resto del mese, E = fine mese, T = totale)
function ctCompCol(M, c) {
  if (c.kind === 'P') return M.compFull - M.comp[M.cur];
  if (c.kind === 'E') return M.compFull;
  return c.mesi.reduce((s, m) => s + M.comp[m], 0);
}
function ctRisCol(M, c, comp) {
  if (!comp) return ctRisultato(c.b);
  if (c.kind === 'P' || c.kind === 'E') return null;           // in competenza la stima di fine mese non si fa
  return ctRisultato(c.b) - c.b.netto + ctCompCol(M, c);
}
function ctEmCol(M, c, comp) {
  if (c.kind === 'P') return null;
  const ris = ctRisCol(M, c, comp); if (ris == null) return null;
  const netto = comp ? ctCompCol(M, c) : c.b.netto;
  return netto > 0 ? ris / netto : null;
}
function ctUltimo(M, c) { return c.kind === 'T' ? M.cur : c.mesi[c.mesi.length - 1]; }
function ctPinKey(c) { return c.kind === 'P' || c.kind === 'T' ? null : c.key; }

function ctRighe(M) {
  const anyEntrateReg = Object.values(M.cols).some(b => Math.abs(b.entrateReg) > 0.004);
  const cats = [...new Set(Object.values(M.cols).flatMap(b => Object.keys(b.altriCat)))].sort();
  const vociStima = [...new Set(Object.values(M.cols).flatMap(b => Object.keys(b.stimeVoci)))];
  const ct = ctState(); const comp = ct.mode === 'comp', q = ct.view === 'trimestri';
  const R = [];
  R.push({ sec: 'Entrate' });
  if (!comp) {
    R.push({ k: 'lordo', l: 'Pagato dagli utenti', h: 'IVA compresa', get: b => b.lordo });
    R.push({ k: 'iva', l: '− IVA 22%', h: 'la versa Google allo Stato', get: b => -b.iva, sub: true });
    R.push({ k: 'comm', l: '− Commissione Google 15%', h: 'sul prezzo senza IVA', get: b => -b.comm, sub: true });
    R.push({ k: 'netto', l: '= Netto da Google', info: 'netto', m: 'netto', get: b => b.netto, strong: true, color: true });
  } else {
    R.push({ k: 'netto', l: '= Netto di competenza', h: 'ordini spalmati sul periodo coperto', info: 'cassa', m: 'netto', val: ctCompCol, strong: true, color: true });
    R.push({ k: 'risconti', l: 'Incassato per i mesi dopo', h: 'risconti, a fine periodo', info: 'risconti', sub: true,
      val: (M, c) => c.kind === 'P' || c.kind === 'E' ? null : M.risconti[ctUltimo(M, c)] });
  }
  if (anyEntrateReg) R.push({ k: 'entrateReg', l: '+ Altre entrate', h: 'dal Registro', get: b => b.entrateReg });
  R.push({ sec: 'Costi' });
  R.push({ k: 'meta', l: '− Meta Ads', info: 'meta', m: 'meta', get: b => -b.meta, hl: true });
  R.push({ k: 'altri', l: '− Altri costi', info: 'altri', get: b => -b.altri, exp: 'altri', h: 'dal Registro' });
  if (ct.open.altri) for (const c of cats) R.push({ k: 'cat:' + c, l: c, get: b => -(b.altriCat[c] || 0), child: true });
  R.push({ k: 'stime', l: '− Costi stimati', info: 'stime', get: b => -b.stime, exp: 'stime', stim: true, h: 'mancano nel Registro' });
  if (ct.open.stime) for (const v of vociStima) R.push({ k: 'stima:' + v, l: v, get: b => -(b.stimeVoci[v] || 0), child: true, stim: true });
  R.push({ sec: 'Risultato' });
  R.push({ k: 'ris', l: `= EBITDA (risultato del ${q ? 'periodo' : 'mese'})`, h: comp ? 'per competenza, prima delle imposte' : 'prima delle imposte', info: 'risultato', m: 'ebitda',
    val: (M, c) => ctRisCol(M, c, comp), strong: true, color: true, big: true });
  R.push({ k: 'em', l: 'EBITDA margin', h: 'EBITDA ÷ netto', info: 'ebitdaM', m: 'ebitdaM', val: (M, c) => ctEmCol(M, c, comp), pct: true, color: true });
  R.push({ k: 'cum', l: 'Cumulato', info: 'cumulato', m: 'cum', cum: true, color: true });
  R.push({ sec: 'Indicatori' });
  R.push({ k: 'paganti', l: q ? 'Paganti a fine periodo' : 'Paganti a fine mese', info: 'paganti', m: 'paganti', ind: 'paganti', int: true });
  R.push({ k: 'nuovi', l: 'Nuovi paganti', info: 'nuovi', m: 'nuovi', ind: 'nuovi', int: true });
  R.push({ k: 'persi', l: 'Paganti persi', info: 'persi', m: 'persi', ind: 'persi', int: true });
  R.push({ k: 'prove', l: 'Prove che pagano', info: 'prove', m: 'prove', ind: 'prove' });
  R.push({ k: 'mrr', l: 'Ricavo ricorrente mensile (MRR)', info: 'mrr', m: 'mrr', ind: 'mrr' });
  R.push({ k: 'mov', l: q ? 'MRR netto del periodo' : 'MRR netto del mese', h: 'nuovo − perso', info: 'movimenti', m: 'movimenti', ind: 'mov' });
  R.push({ k: 'crescita', l: 'Crescita del MRR', info: 'crescita', m: 'crescita', ind: 'crescita' });
  R.push({ k: 'arppu', l: 'Ricavo per pagante (ARPPU)', info: 'arppu', m: 'arppu', ind: 'arppu' });
  R.push({ k: 'margine', l: 'Margine lordo', info: 'margine', m: 'margine', ind: 'margine' });
  R.push({ k: 'cac', l: 'Costo per nuovo pagante (CAC)', info: 'cac', m: 'cac', ind: 'cac' });
  R.push({ k: 'payback', l: 'Rientro del CAC (mesi)', info: 'payback', m: 'payback', ind: 'payback' });
  R.push({ k: 'roi', l: 'Ritorno sull’investimento (ROI)', info: 'roi', m: 'roi', ind: 'roi' });
  R.push({ k: 'roas', l: 'Ritorno su Meta (ROAS)', info: 'roas', m: 'roas', ind: 'roas' });
  return R;
}

function ctValore(M, r, c) {
  if (r.val) return r.val(M, c);
  if (r.cum) {
    if (c.kind === 'P') return null;
    if (ctState().mode === 'comp') return c.kind === 'E' ? null : M.cumulatoC[ctUltimo(M, c)];
    if (c.kind === 'T') return M.cumulato[M.cur];
    if (c.kind === 'q') return M.cumulato[c.mesi[c.mesi.length - 1]];
    return M.cumulato[c.key];
  }
  return r.get(c.b);
}

function ctIndHTML(M, r, c) {
  const dash = `<span class="ct-dash">—</span>`;
  if (r.ind === 'mov') {
    if (c.kind === 'P' || c.kind === 'E') return dash;
    const v = c.mesi.reduce((s, m) => s + M.ind[m].mrrNuovo - M.ind[m].mrrPerso, 0);
    return Math.abs(v) < 0.005 ? `<span class="ct-n ct-zero">0,00</span>` : `<span class="ct-n">${ctFS(v)}</span>`;
  }
  const I = ctIndCol(M, c);
  if (!I) return dash;
  if (r.ind === 'paganti') return I.paganti == null ? dash : `<span class="ct-n">${I.paganti}</span>`;
  if (r.ind === 'nuovi') return I.nuovi == null ? dash : `<span class="ct-n">${I.nuovi}</span>`;
  if (r.ind === 'prove') return !I.proveTot ? dash : `<span class="ct-n">${I.proveOk} su ${I.proveTot}</span>`;
  if (r.ind === 'mrr') return I.mrr == null ? dash : `<span class="ct-n">${ctN(I.mrr)}</span>`;
  if (r.ind === 'cac') return I.cac == null ? dash : `<span class="ct-n">${ctN(I.cac)}</span><small class="ct-base">÷ ${I.cacBase}</small>`;
  if (r.ind === 'persi') return I.persi == null ? dash : `<span class="ct-n">${I.persi}</span>`;
  if (r.ind === 'arppu') return I.arppu == null ? dash : `<span class="ct-n">${ctN(I.arppu)}</span>`;
  if (r.ind === 'crescita') return I.crescita == null ? dash : `<span class="ct-n ${I.crescita >= 0 ? 'ct-pos' : 'ct-neg'}">${I.crescita >= 0 ? '+' : ''}${ctPct(I.crescita, 0)}</span>`;
  if (r.ind === 'margine') return I.margine == null ? dash : `<span class="ct-n ${I.margine >= 0 ? '' : 'ct-neg'}">${ctPct(I.margine, 0)}</span>`;
  if (r.ind === 'payback') return I.payback == null ? dash : `<span class="ct-n">${ctN(I.payback, 1)}</span>`;
  if (r.ind === 'roas') return I.roas == null ? dash : `<span class="ct-n ${I.roas >= 1 ? 'ct-pos' : ''}">${ctN(I.roas)} €</span>`;
  if (r.ind === 'roi') return I.roi == null ? dash : `<span class="ct-n ${I.roi >= 0 ? 'ct-pos' : 'ct-neg'}">${ctPct(I.roi)}</span>`;
  return '';
}

const CT_ICO_GRAF = '<svg class="ct-cg" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M2 12V8M5.5 12V4M9 12V7M12.5 12V2"/></svg>';

function ctTabella(M) {
  const ct = ctState(); const dr = ct.dr;
  const cs = ctColonne(M);
  const R = ctRighe(M);
  const colCls = c => ['ct-c', c.live ? 'ct-live' : '', c.kind === 'F' || (c.kind === 'q' && c.live) ? 'ct-l1' : '', c.kind === 'E' || (c.kind === 'q' && c.live) ? 'ct-l3' : '', c.kind === 'T' ? 'ct-tot' : ''].join(' ');
  const liveN = cs.filter(c => c.live).length;
  const before = cs.findIndex(c => c.live);
  const grp = ct.view === 'mesi' && liveN ? `<tr class="ct-grp"><th class="ct-lab"></th>${before > 0 ? `<th colspan="${before}"></th>` : ''}<th colspan="${liveN}" class="ct-grp-live">${ctMeseLabel(M.cur)} · in corso ${ctI('previsto')}</th><th></th></tr>` : '';
  const head = `<tr><th class="ct-lab">Euro</th>${cs.map(c => `<th class="${colCls(c)}">${c.head}<small>${c.sub}</small></th>`).join('')}</tr>`;
  const body = R.map(r => {
    if (r.sec) return `<tr class="ct-sec"><td class="ct-lab">${r.sec}</td><td colspan="${cs.length}"></td></tr>`;
    const nome = r.m ? `<button type="button" class="ct-rl" data-ct-open="${r.m}" aria-label="Apri il grafico: ${ctEsc(r.l.replace(/^[−=+] /, ''))}"><span class="ct-l">${r.l}</span>${CT_ICO_GRAF}</button>`
      : r.exp ? `<button type="button" class="ct-exp" data-ct-exp="${r.exp}" aria-expanded="${!!ct.open[r.exp]}"><span class="ct-car">›</span>${r.l}</button>` : `<span class="ct-l">${r.l}</span>`;
    const lab = `<td class="ct-lab">${nome}${r.info ? ctI(r.info) : ''}${r.h ? `<span class="ct-h">${r.h}</span>` : ''}</td>`;
    const tds = cs.map(c => {
      const sel = ct.sel && ct.sel.r === r.k && ct.sel.c === c.key ? ' ct-sel' : '';
      const pk = ctPinKey(c);
      const pin = dr.open && r.m && r.m === dr.id && dr.pin && dr.pin === pk ? ' ct-pin' : '';
      let inner;
      if (r.ind) inner = ctIndHTML(M, r, c);
      else {
        const v = ctValore(M, r, c);
        const stim = r.stim || (c.kind === 'P') || (c.kind === 'E' && ['netto', 'lordo', 'iva', 'comm', 'meta', 'ris', 'cum', 'em'].includes(r.k));
        inner = ctCell(v, { color: r.color, pct: r.pct, stim: stim && v != null && Math.abs(v) >= 0.005 });
        if (c.kind === 'E' && r.k === 'ris' && v != null) inner += `<small class="ct-range">${ctN(M.scen.prudente.ris)} … ${ctN(M.scen.ottimista.ris)}</small>`;
        if (c.kind === 'E' && r.k === 'netto' && ct.mode === 'cassa') inner += `<small class="ct-range">${ctN(M.scen.prudente.netto)} … ${ctN(M.scen.ottimista.netto)}</small>`;
      }
      const apre = r.m && c.kind !== 'P' ? ` data-ct-m="${r.m}"${pk ? ` data-ct-pin="${pk}"` : ''}` : '';
      return `<td class="${colCls(c)}${sel}${pin}" data-ct-cell="${r.k}|${c.key}"${apre} tabindex="0">${inner}</td>`;
    }).join('');
    const rsel = dr.open && r.m && r.m === dr.id ? 'ct-rsel' : '';
    return `<tr class="${[r.strong ? 'ct-strong' : '', r.hl ? 'ct-hl' : '', r.sub ? 'ct-subr' : '', r.child ? 'ct-child' : '', r.big ? 'ct-big' : '', rsel].join(' ')}"${r.m ? ` data-ct-row="${r.m}"` : ''}>${lab}${tds}</tr>`;
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
  const x = ctDettaglioCorpo(M, ct.sel.r, ct.sel.c);
  if (!x) return '';
  return `<div class="ct-det"><div class="ct-det-h"><h3>${x.titolo}</h3><button type="button" class="ct-x" data-ct-close aria-label="Chiudi">×</button></div>${x.corpo}</div>`;
}
// Da cosa nasce una cifra (riga rk, colonna ck): usato sotto la tabella e nel cassetto col periodo fissato
function ctDettaglioCorpo(M, rk, ck) {
  const cs = ctColonne(M); const c = cs.find(x => x.key === ck); const r = ctRighe(M).find(x => x.k === rk);
  if (!c || !r) return null;
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
  } else if (r.k === 'risconti') {
    const u = ctUltimo(M, c), ms = M.mesi.filter(m => m <= u);
    const cassa = ms.reduce((s, m) => s + M.cols[m].netto, 0), comp = ms.reduce((s, m) => s + M.comp[m], 0);
    corpo = `<p>${ctN(cassa)} € incassati ${ctDaFeb()} − ${ctN(comp)} € di competenza = <b>${ctN(cassa - comp)} €</b> che appartengono ai mesi dopo ${u === M.cur ? 'oggi' : 'la fine di ' + ctMeseLabel(u)}.</p>`;
  } else if (r.ind) {
    const I = ctIndCol(M, c) || {};
    const forms = {
      paganti: `${I.paganti ?? '—'} abbonamenti pagati e non scaduti`,
      nuovi: `${I.nuovi ?? '—'} primi pagamenti nel periodo`,
      prove: `${I.proveOk ?? 0} prove pagate su ${I.proveTot ?? 0} con l'esito deciso nel periodo`,
      mrr: `${ctN(I.mrr ?? 0)} € al mese = somma del netto mensile di ogni abbonamento attivo (annuali ÷ 12)`,
      cac: `${ctN(b.meta)} € di Meta ÷ ${I.cacBase ?? 0} nuovi paganti`,
      persi: `${I.persi ?? 0} abbonamenti pagati scaduti nel periodo senza rinnovo (rimborsi compresi)`,
      arppu: `MRR ${ctN(I.mrr ?? 0)} ÷ ${I.paganti ?? 0} paganti = ${I.arppu != null ? ctN(I.arppu) + ' €' : '—'}`,
      crescita: `MRR di fine periodo ÷ MRR di fine periodo precedente − 1 = ${I.crescita != null ? ctPct(I.crescita) : '—'}`,
      margine: `(${ctN(b.netto)} netto − ${ctN(b.servizio)} costi di servizio) ÷ ${ctN(b.netto)} = ${ctPct(ctMargine(b))}`,
      payback: `CAC ${I.cac != null ? ctN(I.cac) : '—'} ÷ ARPPU ${I.arppu != null ? ctN(I.arppu) : '—'} = ${I.payback != null ? ctN(I.payback, 1) + ' mesi' : '—'}`,
      roas: `${ctN(b.netto)} € netti ÷ ${ctN(b.meta)} € di Meta = ${b.meta ? ctN(b.netto / b.meta) + ' €' : '—'}`,
      roi: `(${ctN(b.netto + b.entrateReg)} entrate − ${ctN(ctCosti(b))} costi) ÷ ${ctN(ctCosti(b))} costi = ${ctPct(ctRoi(b))}`,
      mov: `MRR nuovo ${ctN(c.mesi.reduce((s, m) => s + M.ind[m].mrrNuovo, 0))} − MRR perso ${ctN(c.mesi.reduce((s, m) => s + M.ind[m].mrrPerso, 0))}`,
    };
    corpo = `<p>${forms[r.ind]}</p>`;
  }
  return { titolo, corpo };
}

// ── FORMATI E SERIE PER I GRAFICI ─────────────────────────────────────────────────────
function ctFS(v, dec = 2) { return v == null || !isFinite(v) ? '—' : (v >= 0.5 * Math.pow(10, -dec) ? '+' : '') + ctN(v, dec); }
function ctFSP(v, dec = 0) { return v == null || !isFinite(v) ? '—' : (v * 100 >= 0.5 * Math.pow(10, -dec) ? '+' : '') + ctPct(v, dec); }
function ctArrow(d) { return d > 0 ? '▲' : d < 0 ? '▼' : ''; }
function ctCap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function ctMeseAnno(d) { return d ? `${CT_MESI[d.getMonth()]} ${d.getFullYear()}` : '—'; }
function ctMeseBreveAnno(d) { return d ? `${CT_MESI_BREVI[d.getMonth()].toLowerCase()} ${d.getFullYear()}` : '—'; }
function ctTraMesi(n) {                      // oggi + n mesi (la parte frazionaria in giorni di un mese medio)
  const d = new Date(Date.now()); const whole = Math.floor(n);
  d.setMonth(d.getMonth() + whole); d.setDate(d.getDate() + Math.round((n - whole) * CT_MESE_MEDIO)); return d;
}
function ctNomeMese(m, breve) { const i = Number(m.slice(5)) - 1; return breve ? CT_MESI_BREVI[i].toLowerCase() : CT_MESI[i]; }

// Perdita al mese: media dei risultati degli ultimi 3 mesi chiusi (sempre in cassa)
function ctBurn(M) {
  const ch = M.chiusi, media = {};
  for (let i = 2; i < ch.length; i++) media[ch[i]] = (ctRisultato(M.cols[ch[i]]) + ctRisultato(M.cols[ch[i - 1]]) + ctRisultato(M.cols[ch[i - 2]])) / 3;
  const k = Object.keys(media), u3 = ch.slice(-3);
  const ora = u3.length ? u3.reduce((s, m) => s + ctRisultato(M.cols[m]), 0) / u3.length : null;
  return { media, ora, prima: k.length > 1 ? media[k[k.length - 2]] : null, u3, ultimo: ch[ch.length - 1] };
}

// Una voce per periodo (mese o trimestre) con tutto quello che serve ai grafici; mode = cassa | comp
function ctSerie(M, view, mode = 'cassa') {
  const curY = M.cur.slice(0, 4), g = M.giornoN;
  return ctColonne(M, view).filter(c => c.kind === 'm' || c.kind === 'F' || c.kind === 'q').map(c => {
    const b = c.b, last = c.mesi[c.mesi.length - 1], I0 = M.ind[last];
    const sum = k => c.mesi.reduce((s, m) => s + M.ind[m][k], 0);
    const partial = c.mesi.includes(M.cur);
    let lab, sub, long;
    if (c.kind === 'q') {
      const [y, n] = c.key.split('-Q');
      const r = c.mesi.map(m => ctNomeMese(m, true));
      lab = `${n}° trim.`; sub = partial ? `al ${g} ${ctNomeMese(M.cur, true)}` : (r.length > 1 ? `${r[0]}–${r[r.length - 1]}` : r[0]);
      long = `${n}° trimestre${y !== curY ? ' ' + y : ''} (${sub})`;
    } else {
      const [y, mm] = last.split('-').map(Number);
      lab = CT_MESI_BREVI[mm - 1]; sub = partial ? `al ${g}` : (mm === 1 ? String(y) : '');
      long = CT_MESI[mm - 1] + (String(y) !== curY ? ' ' + y : '') + (partial ? ` (al ${g})` : '');
    }
    const nettoC = c.mesi.reduce((s, m) => s + M.comp[m], 0);
    const ris = ctRisultato(b), risC = ris - b.netto + nettoC;
    const I = ctIndCol(M, c) || {};
    const pOk = sum('proveOk'), pTot = sum('proveTot');
    const comp = mode === 'comp';
    return { key: c.key, kind: c.kind, mesi: c.mesi, n: c.mesi.length, lab, sub, long, partial, b,
      netto: b.netto, lordo: b.lordo, iva: b.iva, comm: b.comm, meta: b.meta, altri: b.altri, stime: b.stime, serv: b.servizio, costi: ctCosti(b),
      ris, risC, nettoC, cum: M.cumulato[last], cumC: M.cumulatoC[last],
      pag: I0.paganti, mrr: I0.mrr, nuovi: sum('nuovi'), dir: sum('nuoviDiretti'), persi: sum('persi'),
      pOk, pTot, rate: pTot ? pOk / pTot : null, mN: sum('mrrNuovo'), mP: sum('mrrPerso'), persiDett: c.mesi.flatMap(m => M.ind[m].persiDett),
      cac: I.cac ?? null, arppu: I.arppu ?? null, roas: I.roas ?? null, roi: I.roi ?? null, payback: I.payback ?? null, margine: I.margine ?? null, crescita: I.crescita ?? null,
      ebitda: comp ? risC : ris, nettoV: comp ? nettoC : b.netto,
      em: comp ? (nettoC > 0 ? risC / nettoC : null) : (b.netto > 0 ? ris / b.netto : null) };
  });
}
function ctPrimo(B) { const i = B.findIndex(b => b.pag > 0 || b.nuovi > 0 || b.pTot > 0); return i < 0 ? 0 : i; }
function ctVs(B, v, lungo) {
  const P = B[B.length - 2]; if (!P) return '';
  return v === 'mesi' ? 'su ' + ctNomeMese(P.key, !lungo) : 'sul ' + P.lab;
}
// La stima di fine mese (solo in cassa): stesse cifre della colonna «Fine mese»
function ctStima(M) {
  const E = M.cols[M.cur + ':E'], S = M.scen;
  const cumPrima = M.cumulato[M.cur] - ctRisultato(M.cols[M.cur]);
  return { key: M.cur + ':E', lab: CT_MESI_BREVI[Number(M.cur.slice(5)) - 1], netto: E.netto, lordo: E.lordo, meta: E.meta, funz: E.altri + E.stime,
    ris: S.centrale.ris, lo: S.prudente.ris, hi: S.ottimista.ris, nettoLo: S.prudente.netto, nettoHi: S.ottimista.netto,
    cum: cumPrima + S.centrale.ris, cumLo: cumPrima + S.prudente.ris, cumHi: cumPrima + S.ottimista.ris,
    nettoC: M.compFull, em: E.netto > 0 ? S.centrale.ris / E.netto : null };
}

// ── GRAFICI SVG (a scala, senza librerie) ──────────────────────────────────────────────
const CT_G = '#4ade80', CT_R = '#f87171', CT_P = '#a78bfa', CT_INK = '#d4d4e6', CT_MUTE = '#9a9abd';
const CT_PK = { [CT_G]: 'g', [CT_R]: 'r', [CT_P]: 'p', [CT_INK]: 'i', [CT_MUTE]: 'm' };
const CT_SURF = 'var(--ct-surf)';
let CT_CH = {}, ctUid = 0;
function ctSegno(v) { return v < 0 ? CT_R : CT_G; }
function ctNice(min, max, n, minStep = 0) {
  if (min === max) max = min + 1;
  const raw = (max - min) / n, mag = Math.pow(10, Math.floor(Math.log10(raw))), e = raw / mag;
  const st = Math.max(minStep, (e >= 7.5 ? 10 : e >= 3.5 ? 5 : e >= 1.5 ? 2 : 1) * mag);
  const lo = Math.floor(min / st + 1e-9) * st, hi = Math.ceil(max / st - 1e-9) * st; const t = [];
  for (let v = lo; v <= hi + st * 1e-6; v += st) t.push(+v.toFixed(10));
  return { lo, hi, t, st };
}
function ctBarPath(x, w, ya, yb) {
  const h = Math.abs(ya - yb); if (h < 0.4) return '';
  const r = Math.min(4, h, w / 2), l = x - w / 2, rr = x + w / 2;
  return yb < ya ? `M${l},${ya}V${yb + r}Q${l},${yb} ${l + r},${yb}H${rr - r}Q${rr},${yb} ${rr},${yb + r}V${ya}Z`
    : `M${l},${ya}V${yb - r}Q${l},${yb} ${l + r},${yb}H${rr - r}Q${rr},${yb} ${rr},${yb - r}V${ya}Z`;
}
// c = { pts:[{key,lab,sub,strong,partial,bars:[{a,b,c,st,w,gap}],wh,tick,cnt,cntDn,empty,tip:{t,v,l}}], lines, refs, marks, step, end, yMax, yMin, W, H, tick, aria }
function ctChart(c) {
  const pts = c.pts || [];
  if (!pts.length) return `<p class="ct-muted">Nessun dato per questo periodo.</p>`;
  const id = 'ctc' + (++ctUid), W = c.W || 590, H = c.H || 250, pl = c.pl || 58, pr = c.pr || ((c.refs || []).length ? 86 : 20), pt = 22, pb = 38;
  const n = pts.length, pw = W - pl - pr, ph = H - pt - pb, band = pw / n;
  const xs = pts.map((_, i) => pl + band * (i + 0.5));
  const vals = [0];
  pts.forEach(p => { (p.bars || []).forEach(b => vals.push(b.a, b.b)); if (p.wh) vals.push(p.wh.lo, p.wh.hi); if (p.tick != null) vals.push(p.tick); });
  (c.lines || []).forEach(l => l.vals.forEach(v => v != null && isFinite(v) && vals.push(v)));
  (c.refs || []).forEach(r => vals.push(r.v)); if (c.yMax != null) vals.push(c.yMax); if (c.yMin != null) vals.push(c.yMin);
  const T = ctNice(Math.min(...vals), Math.max(...vals), c.ticks || 4, c.intero ? 1 : 0), y = v => pt + (T.hi - v) / (T.hi - T.lo) * ph, y0 = y(0);
  const bw = Math.min(24, band * 0.46), tk = c.tick || (v => ctN(v, T.st < 1 ? (T.st < 0.1 ? 2 : 1) : 0));
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" tabindex="0" aria-label="${ctEsc(c.aria || 'Grafico')}"><defs>`;
  for (const [col, k] of Object.entries(CT_PK)) s += `<pattern id="${id}${k}" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)"><rect width="5" height="5" fill="${col}" fill-opacity=".16"/><rect width="2" height="5" fill="${col}"/></pattern>`;
  s += '</defs>';
  T.t.forEach(v => { s += `<line x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}" class="${Math.abs(v) < 1e-9 ? 'ct-zl' : 'ct-gl'}"/><text x="${pl - 9}" y="${y(v) + 3.5}" class="ct-yt" text-anchor="end">${ctEsc(tk(v))}</text>`; });
  if (T.lo < 0 && T.hi > 0) s += `<line x1="${pl}" x2="${W - pr}" y1="${y0}" y2="${y0}" class="ct-zl"/>`;
  // barre
  pts.forEach((p, i) => (p.bars || []).forEach(b => {
    const x = xs[i], ya = y(b.a), yb = y(b.b), dn = b.b < b.a, w = b.w || bw;
    const d = ctBarPath(x, w, ya + (b.gap ? (dn ? 2 : -2) : 0), yb); if (!d) return;
    const st = `style="--d:${i * 35}ms"`;
    if (b.st === 'outline') { const top = Math.min(ya, yb), h = Math.abs(ya - yb); s += `<rect x="${x - w / 2 + 0.75}" y="${top}" width="${w - 1.5}" height="${h}" rx="3" fill="none" stroke="${b.c}" stroke-width="1.4" stroke-dasharray="3 2.5" class="ct-late"/>`; }
    else if (b.st === 'hatch' || b.st === 'hatchGhost') s += `<path d="${d}" fill="url(#${id}${CT_PK[b.c] || 'i'})" ${b.st === 'hatchGhost' ? 'opacity=".5"' : ''} class="ct-grow${dn ? ' ct-dn' : ''}" ${st}/>`;
    else s += `<path d="${d}" fill="${b.c}" fill-opacity="${b.st === 'ghost' ? 0.3 : 1}" class="ct-grow${dn ? ' ct-dn' : ''}" ${st}/>`;
  }));
  // forchette, tacche, conteggi
  pts.forEach((p, i) => {
    const x = xs[i];
    if (p.wh) { const xw = x + bw / 2 + 8, a = y(p.wh.lo), b = y(p.wh.hi); s += `<g class="ct-late" stroke="${CT_INK}" stroke-width="1.4"><line x1="${xw}" x2="${xw}" y1="${a}" y2="${b}"/><line x1="${xw - 4}" x2="${xw + 4}" y1="${a}" y2="${a}"/><line x1="${xw - 4}" x2="${xw + 4}" y1="${b}" y2="${b}"/></g>`; }
    if (p.tick != null) { const yt = y(p.tick); s += `<line x1="${x - bw / 2 - 5}" x2="${x + bw / 2 + 5}" y1="${yt}" y2="${yt}" style="stroke:${CT_SURF}" stroke-width="5" class="ct-late"/><line x1="${x - bw / 2 - 5}" x2="${x + bw / 2 + 5}" y1="${yt}" y2="${yt}" stroke="#ececf6" stroke-width="2" stroke-linecap="round" class="ct-late"/>`; }
    if (p.cnt) { const top = Math.min(...(p.bars || []).map(b => y(Math.max(b.a, b.b))), y0); s += `<text x="${x}" y="${top - 6}" class="ct-cnt" text-anchor="middle">${ctEsc(p.cnt)}</text>`; }
    if (p.cntDn) { const bot = Math.max(...(p.bars || []).map(b => y(Math.min(b.a, b.b))), y0); s += `<text x="${x}" y="${bot + 13}" class="ct-cnt ct-cnt-r" text-anchor="middle">${ctEsc(p.cntDn)}</text>`; }
    if (p.empty) s += `<text x="${x}" y="${y0 - 6}" class="ct-cnt" text-anchor="middle">${ctEsc(p.empty)}</text>`;
  });
  // riferimenti di settore
  (c.refs || []).forEach(r => {
    const yr = y(r.v), ls = r.label.split('|');
    s += `<line x1="${pl}" x2="${W - pr + 4}" y1="${yr}" y2="${yr}" class="ct-ref"/><text x="${W - pr + 9}" y="${yr + 3.5 - (ls.length - 1) * 5.5}" class="ct-reft">${ls.map((l, i) => `<tspan x="${W - pr + 9}" dy="${i ? 11 : 0}">${ctEsc(l)}</tspan>`).join('')}</text>`;
  });
  // linee
  (c.lines || []).forEach(l => {
    const segs = []; let cur = null;
    l.vals.forEach((v, i) => {
      if (v == null || !isFinite(v)) { cur = null; return; }
      const dash = l.dashFrom != null && i >= l.dashFrom;
      if (!cur || cur.dash !== dash) { const start = cur ? cur.pts[cur.pts.length - 1] : null; cur = { dash, pts: start ? [start] : [] }; segs.push(cur); }
      cur.pts.push([xs[i], y(v), i]);
    });
    segs.forEach(sg => {
      if (sg.pts.length < 2) return;
      const d = 'M' + sg.pts.map(q => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join('L');
      if (l.area && !sg.dash) s += `<path d="${d}L${sg.pts[sg.pts.length - 1][0]},${y0}L${sg.pts[0][0]},${y0}Z" fill="${l.color}" fill-opacity=".1" class="ct-late"/>`;
      s += sg.dash ? `<path d="${d}" fill="none" stroke="${l.color}" stroke-width="2" stroke-dasharray="5 4" stroke-linecap="round" class="ct-late"/>`
        : `<path d="${d}" pathLength="1" fill="none" stroke="${l.color}" stroke-width="${l.w || 2}" stroke-linejoin="round" stroke-linecap="round" class="ct-draw"/>`;
    });
    l.vals.forEach((v, i) => {
      if (v == null || !isFinite(v)) return;
      const show = l.dots === 'all' || (l.dots !== 'none' && (i === l.vals.length - 1 || l.vals[i + 1] == null || i === l.dotAt)); if (!show) return;
      const hollow = (pts[i] && pts[i].partial) || (l.dashFrom != null && i >= l.dashFrom && l.hollowDash !== false);
      s += `<circle cx="${xs[i]}" cy="${y(v)}" r="4" style="fill:${hollow ? CT_SURF : l.color};stroke:${hollow ? l.color : CT_SURF}" stroke-width="2" class="ct-late"/>`;
    });
  });
  (c.marks || []).forEach(m => {
    const x = pl + band * (m.i + 0.5), ym = y(m.v);
    s += `<g class="ct-late"><circle cx="${x}" cy="${ym}" r="4.5" style="fill:${m.color};stroke:${CT_SURF}" stroke-width="2"/><text x="${x + (m.dx || 0)}" y="${ym + (m.below ? 18 : -10)}" class="ct-dl" text-anchor="${m.anchor || 'middle'}" style="fill:${m.color}">${ctEsc(m.text)}</text></g>`;
  });
  // asse x
  pts.forEach((p, i) => {
    s += `<text x="${xs[i]}" y="${H - pb + 16}" class="ct-xl" text-anchor="middle">${ctEsc(p.lab)}</text>`;
    if (p.sub) s += `<text x="${xs[i]}" y="${H - pb + 29}" class="${p.strong ? 'ct-xs2' : 'ct-xs'}" text-anchor="middle">${ctEsc(p.sub)}</text>`;
  });
  // salto fra due periodi (es. +121%): guida dal valore prima, freccia fino al valore dopo, scritta a destra
  if (c.step) {
    const q = c.step, xa = xs[q.i0], xb = xs[q.i1], ya = y(q.a), yb = y(q.b), xr = xb + 12, su = q.b >= q.a, col = su ? CT_G : CT_R;
    const punta = su ? `M${xr - 4},${yb + 7}L${xr},${yb + 1}L${xr + 4},${yb + 7}` : `M${xr - 4},${yb - 7}L${xr},${yb - 1}L${xr + 4},${yb - 7}`;
    s += `<g class="ct-late"><line x1="${xa}" x2="${xr + 4}" y1="${ya}" y2="${ya}" stroke="#6a6a96" stroke-width="1" stroke-dasharray="2 3"/><line x1="${xr}" x2="${xr}" y1="${ya}" y2="${su ? yb + 3 : yb - 3}" stroke="${col}" stroke-width="1.5"/><path d="${punta}" fill="none" stroke="${col}" stroke-width="1.5" stroke-linejoin="round"/><text x="${xr + 8}" y="${(ya + yb) / 2}" class="ct-stp" style="fill:${col}">${ctEsc(q.t)}</text><text x="${xr + 8}" y="${(ya + yb) / 2 + 14}" class="ct-stp2">${ctEsc(q.t2)}</text></g>`;
  }
  if (c.end) { const p = c.end, x = xs[p.i] + (p.dx || 0), yv = y(p.v); s += `<text x="${x}" y="${p.v < 0 ? yv + 16 : yv - 10}" class="ct-dl ct-late" text-anchor="${p.anchor || 'middle'}">${ctEsc(p.text)}</text>`; }
  s += `<line class="ct-xh" x1="0" x2="0" y1="${pt}" y2="${pt + ph}" style="opacity:0"/><rect x="${pl}" y="0" width="${pw}" height="${H}" fill="transparent"/></svg>`;
  CT_CH[id] = { xs, band, pl, pts, W, pt };
  return `<div class="ct-chart" data-cid="${id}">${s}<div class="ct-tip" hidden></div></div>`;
}
// Mirino e tooltip: mouse, tastiera (← → sul grafico), e periodo fissato (data-pin) che resta mostrato
function ctWireCharts(el) {
  if (!el) return;
  el.querySelectorAll('.ct-chart').forEach(ch => {
    const c = CT_CH[ch.dataset.cid]; if (!c || ch.dataset.w) return; ch.dataset.w = '1';
    const svg = ch.querySelector('svg'), tip = ch.querySelector('.ct-tip'), xh = svg.querySelector('.ct-xh'); let cur = -1;
    const show = i => {
      if (i < 0 || i >= c.pts.length) return; cur = i; const p = c.pts[i];
      xh.setAttribute('x1', c.xs[i]); xh.setAttribute('x2', c.xs[i]); xh.style.opacity = 1; tip.hidden = false; tip.replaceChildren();
      const tl = document.createElement('span'); tl.className = 'tl'; tl.textContent = p.tip ? p.tip.t : p.lab;
      const b = document.createElement('b'); b.textContent = p.tip ? p.tip.v : ''; tip.append(tl, b);
      ((p.tip && p.tip.l) || []).forEach(t => { if (!t) return; const d = document.createElement('div'); d.textContent = t; tip.append(d); });
      const r = svg.getBoundingClientRect(), k = r.width / c.W, x = c.xs[i] * k, tw = tip.offsetWidth;
      tip.style.left = (x + 12 + tw > r.width ? Math.max(0, x - 12 - tw) : x + 12) + 'px'; tip.style.top = (c.pt * k + 2) + 'px';
    };
    const hide = () => {
      if (ch.dataset.pin) { const j = c.pts.findIndex(p => p.key === ch.dataset.pin); if (j >= 0) { show(j); return; } }
      xh.style.opacity = 0; tip.hidden = true; cur = -1;
    };
    svg.addEventListener('pointermove', e => { const r = svg.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * c.W; show(Math.max(0, Math.min(c.pts.length - 1, Math.floor((x - c.pl) / c.band)))); });
    svg.addEventListener('pointerleave', hide); svg.addEventListener('blur', hide);
    svg.addEventListener('focus', () => { if (cur < 0) show(c.pts.length - 1); });
    svg.addEventListener('keydown', e => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault(); e.stopPropagation();
      show(Math.max(0, Math.min(c.pts.length - 1, (cur < 0 ? c.pts.length - 1 : cur) + (e.key === 'ArrowRight' ? 1 : -1))));
    });
    if (ch.dataset.pin) requestAnimationFrame(hide);
  });
}
function ctSpark(vals, color, opt = {}) {
  const W = 240, H = 30, n = vals.length; const v = vals.filter(x => x != null && isFinite(x)); if (!v.length) return '<div class="ct-spark-v"></div>';
  let lo = Math.min(0, ...v, opt.ref ?? Infinity), hi = Math.max(...v, opt.ref ?? -Infinity); if (hi === lo) hi = lo + 1;
  const X = i => 3 + (W - 6) * (n === 1 ? 0.5 : i / (n - 1)), Y = x => 3 + (hi - x) / (hi - lo) * (H - 6);
  const P = []; vals.forEach((x, i) => { if (x != null && isFinite(x)) P.push([X(i), Y(x)]); });
  let s = `<svg class="ct-spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">`;
  if (opt.ref != null) s += `<line x1="0" x2="${W}" y1="${Y(opt.ref)}" y2="${Y(opt.ref)}" stroke="#55557a" stroke-width="1" stroke-dasharray="3 3" vector-effect="non-scaling-stroke"/>`;
  if (lo < 0 && hi > 0) s += `<line x1="0" x2="${W}" y1="${Y(0)}" y2="${Y(0)}" stroke="#2a2a3c" stroke-width="1" vector-effect="non-scaling-stroke"/>`;
  if (P.length > 1) {
    const body = P.slice(0, -1), last = P.slice(-2);
    if (body.length > 1) s += `<path d="M${body.map(p => p.join(',')).join('L')}" fill="none" stroke="#5c5c88" stroke-width="1.5" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>`;
    s += `<path d="M${last.map(p => p.join(',')).join('L')}" fill="none" stroke="${color}" stroke-width="2" vector-effect="non-scaling-stroke" ${opt.partial ? 'stroke-dasharray="4 3"' : ''}/>`;
  }
  const L = P[P.length - 1]; s += '</svg>';
  return `<div class="ct-spark-v">${s}<span class="ct-spark-dot" style="left:calc(${(L[0] / W * 100).toFixed(2)}% - 4px);top:${(L[1] - 4).toFixed(1)}px;background:${opt.partial ? CT_SURF : color};border-color:${opt.partial ? color : CT_SURF}"></span></div>`;
}
function ctHbars(items, color, max, fmt) {
  return items.map(([l, v, s], i) => `<div class="ct-hb"><span>${ctEsc(l)}</span><span><i class="ct-bar" style="width:${Math.max(1.5, v / (max || 1) * 100).toFixed(1)}%;background:${color};animation-delay:${i * 60}ms"></i></span><span class="v">${fmt(v)}</span>${s ? `<small>${ctEsc(s)}</small>` : ''}</div>`).join('');
}
// legenda: [tipo, colore, testo]; tipi: bar ghost ln dl ol ht tk wh
function ctLegend(L) {
  if (!L) return '';
  return `<div class="ct-lg">${L.filter(x => x[2]).map(([t, c, l]) => {
    let st = '';
    if (t === 'ht') st = `style="background:repeating-linear-gradient(135deg,${c || CT_MUTE} 0 2px,transparent 2px 5px)"`;
    else if (c && t !== 'dl' && t !== 'ol') st = `style="background:${c}${t === 'ghost' ? ';opacity:.35' : ''}"`;
    return `<span><i class="ct-lgi ct-lg-${t}" ${st}></i>${ctEsc(l)}</span>`;
  }).join('')}</div>`;
}
function ctChip(c) { return c ? `<span class="ct-chip ct-chip-${c.k}">${ctEsc(c.t)}</span>` : ''; }
function ctBarPts(B, get, o) {
  return B.map(b => {
    const v = get(b), ok = v != null && isFinite(v), c = typeof o.color === 'function' ? o.color(ok ? v : 0) : o.color;
    return { key: b.key, lab: b.lab, sub: b.sub, strong: b.partial, partial: b.partial,
      bars: ok ? [{ a: 0, b: v, c, st: b.partial ? (o.ghost ? 'hatchGhost' : 'hatch') : (o.ghost ? 'ghost' : 'solid') }] : [],
      cnt: o.cnt ? o.cnt(b) : null, empty: ok ? null : (o.empty || null),
      tip: { t: b.long, v: o.fmt(ok ? v : null, b), l: (o.tip ? o.tip(b) : []).filter(Boolean) } };
  });
}
function ctLinePts(B, o) { return B.map(b => ({ key: b.key, lab: b.lab, sub: b.sub, strong: b.partial, partial: b.partial, tip: { t: b.long, v: o.fmt(b), l: (o.tip ? o.tip(b) : []).filter(Boolean) } })); }
function ctStimaPt(S, color, val, wh, tip) { return { key: S.key, lab: S.lab, sub: 'stima', strong: true, bars: val == null || !isFinite(val) ? [] : [{ a: 0, b: val, c: color, st: 'outline' }], wh, tip }; }
const ctTickE = x => ctN(x, 0) + ' €';
const ctTickP = x => ctN(x * 100, 0) + '%';
function ctRiga(b, celle) { return { c: celle, p: b.partial, k: b.key }; }
function ctLink(attr, testo) { return `<button type="button" class="ct-link" ${attr}>${testo} <span aria-hidden="true">→</span></button>`; }

function ctCumCfg(M, mode, H, view) {
  const B = ctSerie(M, view, mode), comp = mode === 'comp', k = comp ? 'cumC' : 'cum';
  const pts = ctLinePts(B, { fmt: b => ctE(b[k]), tip: b => [`EBITDA del periodo ${ctE(comp ? b.risC : b.ris)}`] });
  const vals = B.map(b => b[k]);
  const est = view === 'mesi' && !comp;
  if (est) {
    const S = ctStima(M);
    pts.push({ key: S.key, lab: S.lab, sub: 'stima', strong: true, wh: { lo: S.cumLo, hi: S.cumHi }, tip: { t: `fine ${ctNomeMese(M.cur)}, stima`, v: ctE(S.cum), l: [`tra ${ctE(S.cumLo)} e ${ctE(S.cumHi)}`] } });
    vals.push(S.cum);
  }
  const last = vals[vals.length - 1];
  return { H, pts, lines: [{ vals, color: ctSegno(last), dashFrom: est ? vals.length - 2 : (B[B.length - 1].partial ? vals.length - 1 : null), dots: 'last', dotAt: vals.length - 2 }], tick: ctTickE, aria: 'Cumulato' };
}

// ── DA DOVE NASCE IL MRR ───────────────────────────────────────────────────────────
function ctMovData(M, v) {
  const B = ctSerie(M, v), i0 = ctPrimo(B);
  return B.slice(i0).map((b, j) => { const pr = B[i0 + j - 1]; return { b, ini: pr ? pr.mrr : 0, net: b.mN - b.mP, nuovo: b.mN, perso: b.mP }; });
}
function ctMovCfg(M, v, W, H) {
  const D = ctMovData(M, v);
  const pts = D.map(d => {
    const b = d.b, st = b.partial ? 'hatch' : 'solid', bars = [{ a: 0, b: d.nuovo, c: CT_G, st }];
    if (d.perso > 0.004) bars.push({ a: 0, b: -d.perso, c: CT_R, st, gap: true });
    return { key: b.key, lab: b.lab, sub: b.sub, strong: b.partial, partial: b.partial, bars, tick: d.net, cnt: '+' + ctN(d.nuovo), cntDn: d.perso > 0.004 ? '−' + ctN(d.perso) : null,
      tip: { t: b.long, v: `${ctFS(d.net)} € netti`, l: [`+ ${ctE(d.nuovo)} MRR nuovo · ${b.nuovi} ${b.nuovi === 1 ? 'nuovo pagante' : 'nuovi paganti'}`, d.perso > 0.004 ? `− ${ctE(d.perso)} MRR perso · ${b.persiDett.join(', ')}` : 'nessun pagante perso'] } };
  });
  return { W, H, pts, tick: ctTickE, aria: 'Da dove nasce il MRR' };
}
function ctMovLegend(M, v) { return [['bar', CT_G, 'MRR nuovo'], ['bar', CT_R, 'MRR perso'], ['tk', '', 'MRR netto'], ['ht', CT_MUTE, v === 'mesi' ? `${ctNomeMese(M.cur)}, al ${M.giornoN}` : `trimestre in corso, al ${M.giornoN} ${ctNomeMese(M.cur, true)}`]]; }

// ── PAREGGIO (gradino 1) ──────────────────────────────────────────────────────────
// Due ipotesi: ritmo dei nuovi paganti netti del mese in corso portato a un mese medio; ritmo medio dal primo mese con paganti.
function ctPareggio(M) {
  const n = M.attiviOra.length, mrr = M.attiviOra.reduce((s, a) => s + M.nettoMese(a), 0), perPag = n ? mrr / n : 0;
  const E = M.cols[M.cur + ':E'], funz = E.altri + E.stime;
  const need = perPag > 0 ? Math.ceil(funz / perPag) : null, man = need == null ? null : need - n;
  const conPag = M.mesi.filter(m => M.ind[m].paganti > 0), primo = conPag[0] || M.cur;
  const prima = M.ind[addMese(M.cur, -1)];
  const nettiCur = n - (prima ? prima.paganti : 0);
  const rB = M.giornoN ? nettiCur / M.giornoN * CT_MESE_MEDIO : 0;
  const mesiTrascorsi = M.mesi.filter(m => m >= primo && m < M.cur).length + M.giornoN / M.giorniCur;
  const rA = mesiTrascorsi > 0 ? n / mesiTrascorsi : 0;
  const mA = man > 0 && rA > 0 ? man / rA : null, mB = man > 0 && rB > 0 ? man / rB : null;
  return { n, perPag, funz, need, man, primo, nettiCur, rA, rB, mA, mB, dA: mA != null ? ctTraMesi(mA) : null, dB: mB != null ? ctTraMesi(mB) : null,
    mesiConPaganti: conPag.length, mesiTrascorsi, poco: conPag.length < CT_MESI_DATI };
}
function ctPareggioTesto(P) {
  if (P.need == null) return 'senza paganti non si calcola';
  if (P.man <= 0) return 'gradino già coperto';
  const d = [P.dB, P.dA].filter(Boolean).sort((a, b) => a - b);
  if (!d.length) return 'a questo ritmo non si arriva';
  if (d.length === 1 || (d[0].getMonth() === d[1].getMonth() && d[0].getFullYear() === d[1].getFullYear())) return ctMeseAnno(d[0]);
  return d[0].getFullYear() === d[1].getFullYear() ? `${CT_MESI[d[0].getMonth()]} – ${ctMeseAnno(d[1])}` : `${ctMeseAnno(d[0])} – ${ctMeseAnno(d[1])}`;
}

// ── METRICHE DEL CASSETTO ──────────────────────────────────────────────────────────
// build(M, view, mode) → { title, q, info, val, valNeg, chips, sub, charts:[{title,cfg}], legend, few, fewT, extra, extraTop, table:{cols,rows}, note, det }
const CT_METRICHE = [];
function ctDef(id, gruppo, tab, build, opt = {}) { CT_METRICHE.push({ id, gruppo, tab, build, ...opt }); }
const ctPer = v => v === 'mesi' ? 'mese' : 'trimestre';
const ctAl = M => `al ${M.giornoN}`;

ctDef('mrr', 'Indicatore', 'MRR', (M, v) => {
  const B = ctSerie(M, v), L = B[B.length - 1], Pp = B[B.length - 2], cr = L.crescita, dd = Pp ? L.mrr - Pp.mrr : null;
  const gr = {};
  for (const a of M.attiviOra) { const x = M.nettoMese(a), g = (gr[a.piano] ||= { n: 0, v: 0, vals: {} }); g.n++; g.v += x; g.vals[ctN(x)] = (g.vals[ctN(x)] || 0) + 1; }
  const fatto = Object.entries(gr).sort((a, b) => b[1].v - a[1].v).map(([p, g]) => [ctPl(g.n, CT_PIANO_LABEL[p]), g.v, Object.entries(g.vals).map(([x, k]) => `${k} × ${x}`).join(' + ')]);
  return { title: 'Ricavo ricorrente mensile (MRR)', q: `Il netto al mese degli abbonamenti attivi, a fine ${ctPer(v)}. ${ctCap(ctNomeMese(M.cur))}: oggi.`, info: 'mrr',
    val: ctE(L.mrr), chips: cr != null ? [{ t: `${ctArrow(cr)} ${ctFSP(cr)} ${ctVs(B, v, true)}`, k: cr >= 0 ? 'good' : 'bad' }] : [],
    sub: `ARR ${ctE(L.mrr * 12)}${dd != null ? ` · ${ctFS(dd)} € in un ${ctPer(v)}` : ''}`,
    charts: [{ cfg: { pts: ctLinePts(B, { fmt: b => ctE(b.mrr), tip: b => [`${b.pag} paganti`, b.crescita != null ? `crescita ${ctFSP(b.crescita)}` : ''] }),
      lines: [{ vals: B.map(b => b.mrr), color: CT_G, area: true, dashFrom: L.partial ? B.length - 1 : null }],
      end: { i: B.length - 1, v: L.mrr, text: ctE(L.mrr), anchor: 'end', dx: -8 }, pr: 84,
      step: Pp && Pp.mrr > 0 && cr != null ? { i0: B.length - 2, i1: B.length - 1, a: Pp.mrr, b: L.mrr, t: ctFSP(cr), t2: ctFS(dd) + ' €' } : null,
      tick: ctTickE, aria: 'MRR per periodo' } }],
    extra: fatto.length ? `<div class="ct-xb"><h4 class="ct-h4">Di cosa è fatto oggi</h4>${ctHbars(fatto, CT_G, Math.max(...fatto.map(x => x[1])) * 1.05, x => ctE(x))}</div>` : '',
    table: { cols: ['Periodo', 'MRR', 'Paganti', 'Crescita'], rows: B.map(b => ctRiga(b, [b.long, ctE(b.mrr), b.pag, b.crescita == null ? '—' : ctFSP(b.crescita)])) } };
});

ctDef('paganti', 'Indicatore', 'Paganti', (M, v) => {
  const B = ctSerie(M, v), L = B[B.length - 1], Pp = B[B.length - 2], d = Pp ? L.pag - Pp.pag : null;
  const piani = M.attiviOra.reduce((o, a) => (o[a.piano] = (o[a.piano] || 0) + 1, o), {});
  return { title: 'Paganti', q: `Abbonamenti pagati e non scaduti, a fine ${ctPer(v)}. ${ctCap(ctNomeMese(M.cur))}: oggi.`, info: 'paganti',
    val: String(L.pag), chips: d != null ? [{ t: `${ctArrow(d)} ${ctFS(d, 0)} ${ctVs(B, v, true)}`, k: d >= 0 ? 'good' : 'bad' }] : [],
    sub: Object.entries(piani).map(([p, k]) => ctPl(k, CT_PIANO_LABEL[p])).join(' · ') + (M.inProva.length ? ` · più ${M.inProva.length} in prova` : ''),
    charts: [{ cfg: { pts: ctBarPts(B, b => b.pag, { color: CT_P, fmt: x => `${x ?? 0} paganti`, tip: b => [`+${b.nuovi} nuovi · −${b.persi} persi`] }), end: { i: B.length - 1, v: L.pag, text: String(L.pag) }, tick: x => ctN(x, 0), aria: 'Paganti per periodo', intero: true } }],
    extra: ctLink('data-ct-open="pareggio"', 'Quando arriviamo al pareggio'),
    table: { cols: ['Periodo', 'Paganti', 'Nuovi', 'Persi'], rows: B.map(b => ctRiga(b, [b.long, b.pag, b.nuovi, b.persi])) } };
});

ctDef('prove', 'Indicatore', 'Prove', (M, v) => {
  const B0 = ctSerie(M, v), B = B0.slice(ctPrimo(B0));
  let o = 0, t = 0; const cum = B.map(b => { o += b.pOk; t += b.pTot; return [o, t]; });
  const ok = M.proveDecise.filter(e => e.ok).length, n = M.proveDecise.length, rate = n ? ok / n : null;
  const da = v === 'mesi' ? 'da ' + ctNomeMese(B[0].key) : 'dal ' + B[0].lab;
  const pts = ctBarPts(B, b => b.rate, { color: CT_P, fmt: x => x == null ? 'nessuna prova conclusa' : ctPct(x, 0), cnt: b => b.pTot ? `${b.pOk}/${b.pTot}` : null, empty: 'nessuna', tip: b => [b.pTot ? `${b.pOk} su ${b.pTot} prove nel periodo` : ''] });
  pts.forEach((p, i) => { if (cum[i][1]) p.tip.l.push(`${da}: ${cum[i][0]} su ${cum[i][1]} = ${ctPct(cum[i][0] / cum[i][1], 0)}`); });
  const diff = rate == null ? null : rate - CT_PROVE_SETTORE;
  const chips = [];
  if (diff != null) chips.push({ t: `${ctArrow(diff)} ${ctFS(diff * 100, 1)} punti sul settore`, k: diff >= 0 ? 'good' : 'bad' });
  if (n < CT_POCHI_CASI) chips.push({ t: `pochi casi: ${n}`, k: 'warn' });
  return { title: 'Prove che pagano', q: 'Su 100 prove gratuite finite, quante diventano un abbonamento.', info: 'prove',
    val: rate == null ? '—' : ctPct(rate, 0), chips, sub: `${ok} su ${n} prove ${da} · settore ${ctPct(CT_PROVE_SETTORE)}`,
    charts: [{ cfg: { pts, lines: [{ vals: cum.map(([a, b]) => b ? a / b : null), color: CT_INK, dots: 'all' }], refs: [{ v: CT_PROVE_SETTORE, label: `settore|${ctPct(CT_PROVE_SETTORE)}` }], yMax: 1, tick: ctTickP, aria: 'Prove che pagano per periodo' } }],
    legend: [['bar', CT_P, `nel ${ctPer(v)} (pagate/finite)`], ['ln', CT_INK, `${da}, in totale`], ['dl', '', 'settore']],
    few: n < CT_POCHI_CASI ? `Sono ${n} prove in tutto. Sotto le ${CT_POCHI_CASI} la percentuale si sposta molto con una sola prova: guardate i conteggi sulle colonne.` : null,
    table: { cols: ['Periodo', 'Nel periodo', '%', ctCap(da)], rows: B.map((b, i) => ctRiga(b, [b.long, b.pTot ? `${b.pOk} su ${b.pTot}` : 'nessuna', b.rate == null ? '—' : ctPct(b.rate, 0), cum[i][1] ? `${cum[i][0]} su ${cum[i][1]} = ${ctPct(cum[i][0] / cum[i][1], 0)}` : '—'])) } };
});

ctDef('burn', 'Indicatore', 'Perdita', (M, v) => {
  const bu = ctBurn(M), S = ctStima(M), ct = ctState();
  let charts, table, legend = null;
  if (v === 'mesi') {
    const B = ctSerie(M, 'mesi');
    const pts = ctBarPts(B, b => b.ris, { color: ctSegno, ghost: true, fmt: x => ctE(x), tip: b => [bu.media[b.key] != null ? `media 3 mesi: ${ctE(bu.media[b.key])}` : '', b.partial ? 'mese non chiuso: non entra nella media' : ''] });
    pts.push(ctStimaPt(S, ctSegno(S.ris), S.ris, { lo: S.lo, hi: S.hi }, { t: `${ctNomeMese(M.cur)}, stima di fine mese`, v: ctE(S.ris), l: [`tra ${ctE(S.lo)} e ${ctE(S.hi)}`] }));
    const iL = B.findIndex(b => b.key === bu.ultimo);
    charts = [{ cfg: { pts, lines: [{ vals: B.map(b => bu.media[b.key] ?? null).concat([null]), color: CT_R, dots: 'last' }],
      end: bu.media[bu.ultimo] != null && iL >= 0 ? { i: iL, v: bu.media[bu.ultimo], text: ctE(bu.media[bu.ultimo]), anchor: 'end', dx: -10 } : null, tick: ctTickE, aria: 'Perdita media al mese' } },
      { title: `Cumulato ${ctDaFeb()}`, cfg: ctCumCfg(M, 'cassa', 170, 'mesi') }];
    legend = [['ghost', CT_R, 'EBITDA del mese'], ['ln', CT_R, 'media degli ultimi 3 mesi'], ['ol', '', `stima di fine ${ctNomeMese(M.cur)}`], ['wh', '', 'forchetta']];
    table = { cols: ['Mese', 'EBITDA', 'Media 3 mesi', 'Cumulato'], rows: B.map(b => ctRiga(b, [b.long, ctE(b.ris), bu.media[b.key] != null ? ctE(bu.media[b.key]) : '—', ctE(b.cum)])).concat([{ c: [`${ctNomeMese(M.cur)}, stima`, ctE(S.ris), '—', ctE(S.cum)], e: true }]) };
  } else {
    const B = ctSerie(M, 'trimestri');
    charts = [{ cfg: { pts: ctBarPts(B, b => b.ris / b.n, { color: ctSegno, fmt: x => ctE(x), tip: b => [`EBITDA del trimestre: ${ctE(b.ris)}`, `${b.n} ${b.n === 1 ? 'mese' : 'mesi'}${b.partial ? ', non chiuso' : ''}`] }), tick: ctTickE, aria: 'Perdita media al mese per trimestre' } },
      { title: 'Cumulato', cfg: ctCumCfg(M, 'cassa', 170, 'trimestri') }];
    table = { cols: ['Trimestre', 'EBITDA', 'Al mese', 'Cumulato'], rows: B.map(b => ctRiga(b, [b.long, ctE(b.ris), ctE(b.ris / b.n), ctE(b.cum)])) };
  }
  const d = bu.ora != null && bu.prima != null ? bu.ora - bu.prima : null;
  const saldo = ct.saldo && ct.saldo.saldo;
  return { title: 'Perdita al mese (burn)', q: 'Quanto costa ogni mese tenere aperta l\'attività: media degli ultimi 3 mesi chiusi, in cassa.', info: 'burn',
    val: ctE(bu.ora), valNeg: bu.ora < 0, chips: d != null ? [{ t: `${ctArrow(d)} ${ctFS(d)} € sul mese prima`, k: d < 0 ? 'bad' : 'good' }] : [],
    sub: `${bu.u3.length ? `media ${ctNomeMese(bu.u3[0], true)}–${ctNomeMese(bu.u3[bu.u3.length - 1], true)}` : ''}${bu.prima != null ? ` · un mese fa ${ctE(bu.prima)}` : ''} · cumulato ${ctE(M.cumulato[M.cur])}`,
    charts, legend,
    extra: ctLink('data-ct-goto="saldo"', saldo && bu.ora < 0 ? `Autonomia: ${ctN(saldo / -bu.ora, 1)} mesi` : 'Autonomia: inserisci il saldo in banca'), table };
});

ctDef('cac', 'Indicatore', 'CAC', (M, v) => {
  const B0 = ctSerie(M, v), B = B0.slice(ctPrimo(B0)), L = B[B.length - 1], Pp = B[B.length - 2];
  const d = L.cac != null && Pp && Pp.cac ? L.cac / Pp.cac - 1 : null, nt = ctNuoviTot(M);
  return { title: 'Costo per nuovo pagante (CAC)', q: 'Quanto costa in Meta ogni nuovo pagante, nello stesso periodo.', info: 'cac',
    val: ctE(L.cac), chips: d != null ? [{ t: `${ctArrow(d)} ${ctFSP(d)} ${ctVs(B, v, true)}`, k: d <= 0 ? 'good' : 'bad' }] : [],
    sub: nt ? `${ctDaFeb()}: ${ctE(M.tot.meta / nt)} (${ctN(M.tot.meta)} ÷ ${nt})` : '',
    charts: [{ cfg: { pts: ctBarPts(B, b => b.cac, { color: CT_P, fmt: x => ctE(x), empty: '—', cnt: b => b.nuovi ? `÷ ${b.nuovi}` : null, tip: b => [`${ctE(b.meta)} di Meta ÷ ${b.nuovi} nuovi`] }), tick: ctTickE, aria: 'CAC per periodo' } },
      { title: 'Rientro del CAC, in mesi', cfg: { H: 180, pts: ctBarPts(B, b => b.payback, { color: CT_P, fmt: x => x == null ? '—' : ctN(x, 1) + ' mesi', empty: '—', tip: b => [b.cac != null && b.arppu != null ? `CAC ${ctN(b.cac)} ÷ ARPPU ${ctN(b.arppu)}` : ''] }), refs: [{ v: CT_RIENTRO_SANO, label: `sano sotto|${CT_RIENTRO_SANO} mesi` }], tick: x => ctN(x, 0), aria: 'Rientro del CAC' } }],
    table: { cols: ['Periodo', 'Meta', 'Nuovi', 'CAC', 'Rientro'], rows: B.map(b => ctRiga(b, [b.long, ctE(b.meta), b.nuovi, ctE(b.cac), b.payback == null ? '—' : ctN(b.payback, 1) + ' mesi'])) } };
});

ctDef('ltv', 'Indicatore', 'LTV', (M, v) => {
  const LT = ctLtv(M), B0 = ctSerie(M, v), B = B0.slice(ctPrimo(B0));
  const n = M.ind[M.cur].nuovi, cac = n ? M.cols[M.cur].meta / n : null, r = LT.ltv != null && cac ? LT.ltv / cac : null;
  const gm = LT.G.length ? Math.max(...LT.G.map(g => g.v)) * 1.1 : 1;
  return { title: 'Valore di un cliente (LTV)', q: 'Quanto netto lascia un pagante in tutta la sua vita, con le quote di rinnovo.', info: 'ltv',
    val: ctE(LT.ltv), chips: r != null ? [{ t: `LTV/CAC ${ctN(r)} · sano sopra ${CT_LTVCAC_SANO}`, k: r >= CT_LTVCAC_SANO ? 'good' : 'bad' }] : [],
    sub: LT.storico != null ? `incassato finora ${ctE(LT.storico)} a pagante (${ctN(M.tot.netto)} ÷ ${LT.pagantiSempre})` : '',
    extraTop: LT.G.length ? `<div class="ct-xb ct-xb-top"><h4 class="ct-h4">Per piano, sui ${LT.n} paganti di oggi</h4>${ctHbars(LT.G.map(g => [ctPl(g.n, g.label), g.v, g.conto]), CT_P, gm, x => ctE(x))}</div>` : '',
    charts: [{ title: 'LTV/CAC per periodo, con il valore di oggi', cfg: { H: 200, pts: ctBarPts(B, b => b.cac ? LT.ltv / b.cac : null, { color: CT_P, fmt: x => x == null ? '—' : ctN(x), empty: '—', tip: b => [b.cac ? `${ctN(LT.ltv)} ÷ ${ctN(b.cac)} di CAC` : 'nessun nuovo pagante'] }), refs: [{ v: CT_LTVCAC_SANO, label: `sano:|sopra ${CT_LTVCAC_SANO}` }], tick: x => ctN(x, 0), aria: 'LTV su CAC' } }],
    few: LT.fonte.mensile === 'settore' || LT.fonte.annuale === 'settore' ? `Si usano le quote di primo rinnovo del settore (mensile ${ctPct(LT.r.mensile)}, annuale ${ctPct(LT.r.annuale)}) finché i vostri casi sono meno di ${CT_LTV_MIN}. Il rapporto per periodo usa l'LTV di oggi.` : null, fewT: 'Stima',
    table: { cols: ['Periodo', 'CAC', 'LTV/CAC'], rows: B.map(b => ctRiga(b, [b.long, ctE(b.cac), b.cac ? ctN(LT.ltv / b.cac) : '—'])) } };
});

ctDef('roi', 'Indicatore', 'ROI', (M, v) => {
  const B = ctSerie(M, v), L = B[B.length - 1], Pp = B[B.length - 2], d = L.roi != null && Pp && Pp.roi != null ? (L.roi - Pp.roi) * 100 : null;
  return { title: 'Ritorno sull\'investimento (ROI)', q: 'Quanto rende tutto quello che si è speso. 0% è il pareggio.', info: 'roi',
    val: ctPct(L.roi), valNeg: L.roi < 0, chips: d != null ? [{ t: `${ctArrow(d)} ${ctFS(d, 1)} punti ${ctVs(B, v, true)}`, k: d >= 0 ? 'good' : 'bad' }] : [],
    sub: `tutti i costi · ${ctDaFeb()}: ${ctPct(ctRoi(M.tot))}`,
    charts: [{ cfg: { pts: ctBarPts(B, b => b.roi, { color: ctSegno, fmt: x => ctPct(x), empty: '—', tip: b => [`(${ctN(b.netto + b.b.entrateReg)} − ${ctN(b.costi)}) ÷ ${ctN(b.costi)}`] }), refs: [{ v: 0, label: 'pareggio|0%' }], yMax: 0.1, tick: ctTickP, aria: 'ROI per periodo' } }],
    table: { cols: ['Periodo', 'Entrate', 'Costi', 'ROI'], rows: B.map(b => ctRiga(b, [b.long, ctE(b.netto + b.b.entrateReg), ctE(b.costi), ctPct(b.roi)])) } };
});

ctDef('roas', 'Indicatore', 'ROAS', (M, v) => {
  const B = ctSerie(M, v), L = B[B.length - 1], Pp = B[B.length - 2], d = L.roas != null && Pp && Pp.roas != null ? L.roas - Pp.roas : null;
  const T = M.tot;
  return { title: 'Ritorno su Meta (ROAS)', q: 'Euro netti tornati per ogni euro speso in Meta.', info: 'roas',
    val: L.roas == null ? '—' : ctN(L.roas) + ' €', chips: d != null ? [{ t: `${ctArrow(d)} ${ctFS(d)} € ${ctVs(B, v, true)}`, k: d >= 0 ? 'good' : 'bad' }] : [],
    sub: `per 1 € di Meta · ${ctDaFeb()}: ${T.meta > 0 ? ctN(T.netto / T.meta) + ' €' : '—'}`,
    charts: [{ cfg: { pts: ctBarPts(B, b => b.roas, { color: CT_P, fmt: x => x == null ? 'niente Meta' : ctN(x) + ' €', empty: '—', tip: b => b.meta ? [`${ctE(b.netto)} ÷ ${ctE(b.meta)}`] : ['nessuna spesa Meta'] }), refs: [{ v: 1, label: '1 €: Meta|ripagata' }], tick: x => ctN(x, 1) + ' €', aria: 'ROAS per periodo' } }],
    table: { cols: ['Periodo', 'Netto', 'Meta', 'ROAS'], rows: B.map(b => ctRiga(b, [b.long, ctE(b.netto), ctE(b.meta), b.roas == null ? '—' : ctN(b.roas) + ' €'])) } };
});

ctDef('ebitda', 'Conto', 'EBITDA', (M, v, mode) => {
  const comp = mode === 'comp', B = ctSerie(M, v, mode), L = B[B.length - 1], S = ctStima(M), mc = ctNomeMese(M.cur);
  const pts = ctBarPts(B, b => b.ebitda, { color: ctSegno, fmt: x => ctE(x), tip: b => [`netto ${ctN(b.nettoV)} − Meta ${ctN(b.meta)} − altri ${ctN(b.altri + b.stime)}${b.b.entrateReg ? ` + altre entrate ${ctN(b.b.entrateReg)}` : ''}`] });
  const est = v === 'mesi' && !comp;
  if (est) pts.push(ctStimaPt(S, ctSegno(S.ris), S.ris, { lo: S.lo, hi: S.hi }, { t: `${mc}, stima di fine mese`, v: ctE(S.ris), l: [`prudente ${ctE(S.lo)}`, `ottimista ${ctE(S.hi)}`] }));
  return { title: 'EBITDA · risultato del ' + ctPer(v), q: 'Entrate meno tutti i costi, prima delle imposte. Niente ammortamenti né interessi.', info: 'risultato', mode: true, det: 'ris',
    val: ctE(L.ebitda), valNeg: L.ebitda < 0, chips: [comp ? { t: 'stima di fine mese: solo in cassa', k: 'neu' } : { t: `stima fine ${mc} ${ctE(S.ris)}`, k: 'neu' }],
    sub: comp ? `${L.long}, per competenza` : `${L.long} · forchetta di fine mese ${ctN(S.lo)} … ${ctN(S.hi)} €`,
    charts: [{ cfg: { pts, tick: ctTickE, aria: 'EBITDA per periodo' } }],
    legend: v === 'mesi' ? [['ht', CT_R, `${mc}, ${ctAl(M)}`]].concat(est ? [['ol', '', 'stima di fine mese'], ['wh', '', 'forchetta prudente–ottimista']] : []) : null,
    table: { cols: ['Periodo', comp ? 'Netto di competenza' : 'Netto', 'Costi', 'EBITDA'], rows: B.map(b => ctRiga(b, [b.long, ctE(b.nettoV), ctE(-b.costi), ctE(b.ebitda)]))
      .concat(est ? [{ c: [`${mc}, stima`, ctE(S.netto), ctE(-(S.meta + S.funz)), ctE(S.ris)], e: true }] : []) } };
});

ctDef('ebitdaM', 'Conto', 'EBITDA margin', (M, v, mode) => {
  const comp = mode === 'comp', B0 = ctSerie(M, v, mode), B = B0.slice(ctPrimo(B0)), L = B[B.length - 1], Pp = B[B.length - 2], S = ctStima(M), mc = ctNomeMese(M.cur);
  const pts = ctBarPts(B, b => b.em, { color: ctSegno, fmt: x => ctPct(x, 0), empty: '—', tip: b => [`${ctN(b.ebitda)} ÷ ${ctN(b.nettoV)}`] });
  const est = v === 'mesi' && !comp && S.em != null;
  if (est) pts.push(ctStimaPt(S, ctSegno(S.em), S.em, null, { t: `${mc}, stima di fine mese`, v: ctPct(S.em, 0), l: [`${ctN(S.ris)} ÷ ${ctN(S.netto)}`] }));
  const conEm = B.filter(b => b.em != null), min = conEm.length ? conEm.reduce((a, b) => b.em < a.em ? b : a) : null;
  const d = L.em != null && Pp && Pp.em != null ? L.em - Pp.em : null;
  return { title: 'EBITDA margin', q: 'Quanta parte del netto resta dopo tutti i costi.', info: 'ebitdaM', mode: true,
    val: ctPct(L.em, 0), valNeg: L.em < 0, chips: d != null ? [{ t: `${ctArrow(d)} da ${ctPct(Pp.em, 0)} ${v === 'mesi' ? 'a ' + ctNomeMese(Pp.key) : 'nel ' + Pp.lab}`, k: d >= 0 ? 'good' : 'bad' }] : [],
    sub: L.long + (comp ? ', per competenza' : ''),
    charts: [{ cfg: { pts, tick: ctTickP, aria: 'EBITDA margin' } }],
    fewT: 'Numeri piccoli', few: min && min.em < -1 ? `${ctCap(min.long)}: ${ctN(-min.ebitda)} € persi su ${ctN(min.nettoV)} € di netto${comp ? ' di competenza' : ''} fanno ${ctPct(min.em, 0)}. Il numero è giusto, ma con un netto così piccolo conta la direzione.` : null,
    table: { cols: ['Periodo', 'EBITDA', comp ? 'Netto di competenza' : 'Netto', 'Margin'], rows: B.map(b => ctRiga(b, [b.long, ctE(b.ebitda), ctE(b.nettoV), b.em == null ? '—' : ctPct(b.em, 0)])) } };
});

ctDef('netto', 'Conto', 'Netto', (M, v) => {
  const B = ctSerie(M, v), L = B[B.length - 1], S = ctStima(M), mc = ctNomeMese(M.cur);
  const pts = ctBarPts(B, b => b.netto, { color: CT_G, fmt: x => ctE(x), tip: b => [`competenza ${ctE(b.nettoC)}`, b.lordo ? `pagato ${ctE(b.lordo)} − IVA ${ctN(b.iva)} − comm. ${ctN(b.comm)}` : ''] });
  const comp = B.map(b => b.nettoC);
  if (v === 'mesi') {
    pts.push(ctStimaPt(S, CT_G, S.netto, { lo: S.nettoLo, hi: S.nettoHi }, { t: `${mc}, stima di fine mese`, v: ctE(S.netto), l: [`tra ${ctE(S.nettoLo)} e ${ctE(S.nettoHi)}`, `competenza a mese intero ${ctE(S.nettoC)}, solo ordini già fatti`] }));
    comp.push(S.nettoC);
  }
  const cassaT = M.tot.netto, compT = M.mesi.reduce((s, m) => s + M.comp[m], 0);
  return { title: 'Netto da Google: cassa e competenza', q: 'Le barre sono quello che arriva da Google nel periodo. La linea è quanto di quell\'incasso appartiene davvero al periodo.', info: 'netto', det: 'netto',
    val: ctE(L.netto), chips: v === 'mesi' ? [{ t: `stima fine ${mc} ${ctE(S.netto)}`, k: 'neu' }] : [], sub: `${L.long} · di competenza ${ctE(L.nettoC)}`,
    charts: [{ cfg: { pts, lines: [{ vals: comp, color: CT_INK, dots: 'all', dashFrom: v === 'mesi' ? comp.length - 1 : null }], tick: ctTickE, aria: 'Netto per periodo' } }],
    legend: [['bar', CT_G, 'cassa'], ['ln', CT_INK, 'competenza'], ['ht', CT_G, `${v === 'mesi' ? mc : 'trimestre in corso'}, ${ctAl(M)}`]].concat(v === 'mesi' ? [['ol', '', 'stima'], ['wh', '', 'forchetta']] : []),
    extra: `<div class="ct-note">${ctCap(ctDaFeb())}: <b>${ctE(cassaT)}</b> incassati, <b>${ctE(compT)}</b> di competenza: <b>${ctE(M.risconti[M.cur])}</b> sono incassati per i mesi dopo (risconti).</div>`,
    table: { cols: ['Periodo', 'Pagato', 'Netto (cassa)', 'Competenza'], rows: B.map(b => ctRiga(b, [b.long, ctE(b.lordo), ctE(b.netto), ctE(b.nettoC)]))
      .concat(v === 'mesi' ? [{ c: [`${mc}, stima`, '≈ ' + ctE(S.lordo), ctE(S.netto), ctE(S.nettoC) + ' *'], e: true }] : []) },
    note: v === 'mesi' ? '* La competenza a mese intero conta solo gli ordini già fatti: le vendite previste fino a fine mese non sono spalmate.' : null };
});

ctDef('meta', 'Conto', 'Meta', (M, v) => {
  const B = ctSerie(M, v), L = B[B.length - 1], Pp = B[B.length - 2], S = ctStima(M), mc = ctNomeMese(M.cur);
  const pts = ctBarPts(B, b => b.meta, { color: CT_R, fmt: x => ctE(x), tip: b => [b.nuovi ? `${b.nuovi} nuovi paganti` : ''] });
  if (v === 'mesi') pts.push(ctStimaPt(S, CT_R, S.meta, null, { t: `${mc}, stima di fine mese`, v: ctE(S.meta), l: ['media giornaliera sui giorni che restano'] }));
  const charts = [{ cfg: { pts, tick: ctTickE, aria: 'Meta per periodo' } }];
  const mg = M.cols[M.cur].metaGiorni;
  if (mg) {
    const days = [];
    for (let g = 1; g <= M.giornoN; g++) {
      const k = `${M.cur}-${String(g).padStart(2, '0')}`, x = mg[k];
      days.push({ key: 'd' + g, lab: g % 2 ? String(g) : '', sub: '', bars: x ? [{ a: 0, b: x, c: CT_R, st: g === M.giornoN ? 'hatch' : 'solid' }] : [],
        tip: { t: `${g} ${mc}${g === M.giornoN ? ' (in corso)' : ''}`, v: x ? ctE(x) : 'nessuna spesa', l: [] } });
    }
    charts.push({ title: `${ctCap(mc)} giorno per giorno`, cfg: { H: 160, pts: days, tick: ctTickE, ticks: 3, aria: `Meta di ${mc} per giorno` } });
  }
  return { title: 'Meta Ads', q: `Spesa in pubblicità. Mesi chiusi dal Registro, ${mc} ${mg ? "dall'API giorno per giorno" : 'dal Registro'}.`, info: 'meta', det: 'meta',
    val: ctE(L.meta), chips: v === 'mesi' ? [{ t: `stima fine ${mc} ${ctE(S.meta)}`, k: 'neu' }] : [], sub: `${L.long}${Pp ? ` · ${Pp.long} ${ctE(Pp.meta)}` : ''}`,
    charts, table: { cols: ['Periodo', 'Meta', 'Nuovi', 'CAC'], rows: B.map(b => ctRiga(b, [b.long, ctE(b.meta), b.nuovi, ctE(b.cac)])) } };
});

ctDef('cum', 'Conto', 'Cumulato', (M, v, mode) => {
  const comp = mode === 'comp', S = ctStima(M), B = ctSerie(M, v, mode), mc = ctNomeMese(M.cur);
  const est = v === 'mesi' && !comp;
  return { title: `Cumulato ${ctDaFeb()}`, q: 'Quanto avete messo di tasca vostra, periodo dopo periodo.', info: 'cumulato', mode: true,
    val: ctE(comp ? M.cumulatoC[M.cur] : M.cumulato[M.cur]), valNeg: (comp ? M.cumulatoC[M.cur] : M.cumulato[M.cur]) < 0,
    chips: [comp ? { t: 'stima di fine mese: solo in cassa', k: 'neu' } : { t: `stima fine ${mc} ${ctE(S.cum)}`, k: 'neu' }],
    sub: comp ? `per competenza · in cassa ${ctE(M.cumulato[M.cur])}: la differenza sono i ${ctE(M.risconti[M.cur])} di risconti` : `forchetta di fine ${mc} ${ctN(S.cumLo)} … ${ctN(S.cumHi)} €`,
    charts: [{ cfg: ctCumCfg(M, mode, 240, v) }],
    table: { cols: ['Periodo', 'EBITDA', 'Cumulato'], rows: B.map(b => ctRiga(b, [b.long, ctE(b.ebitda), ctE(comp ? b.cumC : b.cum)])).concat(est ? [{ c: [`${mc}, stima`, ctE(S.ris), ctE(S.cum)], e: true }] : []) } };
});

ctDef('movimenti', 'Indicatore', 'Movimenti MRR', (M, v) => {
  const D = ctMovData(M, v), L = D[D.length - 1];
  return { title: 'Da dove nasce il MRR', q: `Ogni ${ctPer(v)}: quanto MRR portano i nuovi paganti, quanto se ne va con i persi, e il netto.`, info: 'movimenti',
    val: ctFS(L.net) + ' €', valNeg: L.net < 0, chips: [{ t: `${L.b.nuovi} ${L.b.nuovi === 1 ? 'nuovo' : 'nuovi'} · ${L.b.persi} ${L.b.persi === 1 ? 'perso' : 'persi'}`, k: 'neu' }],
    sub: `MRR netto di ${L.b.long} · da ${ctN(L.ini)} a ${ctN(L.b.mrr)} €`,
    charts: [{ cfg: ctMovCfg(M, v, 590, 250) }], legend: ctMovLegend(M, v),
    table: { cols: ['Periodo', 'Inizio', '+ Nuovo', '− Perso', '= Netto', 'Fine'], rows: D.map(d => ctRiga(d.b, [d.b.long, ctE(d.ini), '+' + ctN(d.nuovo), d.perso > 0.004 ? '−' + ctN(d.perso) : '0,00', ctFS(d.net), ctE(d.b.mrr)])) } };
});

ctDef('crescita', 'Indicatore', 'Crescita', (M, v) => {
  const B = ctSerie(M, v).filter(b => b.crescita != null), L = B[B.length - 1];
  if (!L) return { title: 'Crescita del MRR', q: 'Di quanto cresce il ricavo ricorrente rispetto al periodo prima.', info: 'crescita', val: '—', chips: [], sub: 'serve un periodo con MRR prima', charts: [{ cfg: { pts: [] } }], table: { cols: ['Periodo'], rows: [] } };
  const prima = b => b.mrr / (1 + b.crescita), max = B.reduce((a, b) => b.crescita > a.crescita ? b : a);
  return { title: 'Crescita del MRR', q: 'Di quanto cresce il ricavo ricorrente rispetto al periodo prima.', info: 'crescita',
    val: ctFSP(L.crescita), valNeg: L.crescita < 0, chips: [{ t: `${ctFS(L.mrr - prima(L))} € in euro`, k: 'neu' }], sub: `${L.long}: ${ctN(L.mrr)} ÷ ${ctN(prima(L))} − 1`,
    charts: [{ cfg: { pts: ctBarPts(B, b => b.crescita, { color: c => c < 0 ? CT_R : CT_P, fmt: x => ctFSP(x), tip: b => [`MRR ${ctE(b.mrr)}`, `${ctFS(b.mrr - prima(b))} € sul periodo prima`] }), tick: ctTickP, aria: 'Crescita del MRR' } }],
    fewT: 'Numeri piccoli', few: max.crescita > 1 ? `Con un MRR di pochi euro le percentuali esplodono: ${ctFSP(max.crescita)} a ${max.long} sono ${ctFS(max.mrr - prima(max))} € in più. Guardate anche «Da dove nasce il MRR».` : null,
    table: { cols: ['Periodo', 'MRR', 'Crescita'], rows: B.map(b => ctRiga(b, [b.long, ctE(b.mrr), ctFSP(b.crescita)])) } };
});

ctDef('arppu', 'Indicatore', 'ARPPU', (M, v) => {
  const B0 = ctSerie(M, v), B = B0.slice(ctPrimo(B0)), L = B[B.length - 1], Pp = B[B.length - 2], d = L.arppu != null && Pp && Pp.arppu != null ? L.arppu - Pp.arppu : null;
  const mens = ctNet(CT_LISTINO.mensile), ann = ctNet(CT_LISTINO.annuale) / 12;
  return { title: 'Ricavo medio per pagante (ARPPU)', q: 'Quanto netto lascia al mese, in media, un pagante.', info: 'arppu',
    val: ctE(L.arppu), chips: d != null ? [{ t: `${ctArrow(d)} ${ctFS(d)} € ${ctVs(B, v, true)}`, k: 'neu' }] : [], sub: `un annuale vale ${ctN(ann)} € al mese, un mensile ${ctN(mens)} €`,
    charts: [{ cfg: { pts: ctLinePts(B, { fmt: b => ctE(b.arppu), tip: b => [`${ctN(b.mrr)} ÷ ${b.pag} paganti`] }), lines: [{ vals: B.map(b => b.arppu), color: CT_P, dots: 'all', dashFrom: L.partial ? B.length - 1 : null }],
      refs: [{ v: mens, label: `un mensile|${ctN(mens)} €` }, { v: ann, label: `un annuale|${ctN(ann)} €` }], tick: ctTickE, aria: 'ARPPU' } }],
    table: { cols: ['Periodo', 'MRR', 'Paganti', 'ARPPU'], rows: B.map(b => ctRiga(b, [b.long, ctE(b.mrr), b.pag, ctE(b.arppu)])) } };
});

ctDef('margine', 'Indicatore', 'Margine lordo', (M, v) => {
  const B0 = ctSerie(M, v), B = B0.slice(ctPrimo(B0)), L = B[B.length - 1], Pp = B[B.length - 2], d = L.margine != null && Pp && Pp.margine != null ? L.margine - Pp.margine : null;
  return { title: 'Margine lordo', q: 'Quanto resta del netto dopo server, infrastruttura e AI.', info: 'margine',
    val: ctPct(L.margine, 0), valNeg: L.margine < 0, chips: d != null ? [{ t: `${ctArrow(d)} da ${ctPct(Pp.margine, 0)} ${v === 'mesi' ? 'a ' + ctNomeMese(Pp.key) : 'nel ' + Pp.lab}`, k: d >= 0 ? 'good' : 'bad' }] : [],
    sub: `${L.long} · ${ctDaFeb()} ${ctPct(ctMargine(M.tot), 0)}`,
    charts: [{ cfg: { pts: ctBarPts(B, b => b.margine, { color: ctSegno, fmt: x => ctPct(x, 0), empty: '—', tip: b => [`(${ctN(b.netto)} − ${ctN(b.serv)}) ÷ ${ctN(b.netto)}`] }), tick: ctTickP, aria: 'Margine lordo' } }],
    table: { cols: ['Periodo', 'Netto', 'Servizio', 'Margine'], rows: B.map(b => ctRiga(b, [b.long, ctE(b.netto), ctE(b.serv), b.margine == null ? '—' : ctPct(b.margine, 0)])) } };
});

ctDef('payback', 'Indicatore', 'Rientro CAC', (M, v) => {
  const B0 = ctSerie(M, v), B = B0.slice(ctPrimo(B0)), L = B[B.length - 1], nt = ctNuoviTot(M);
  const ora = M.attiviOra.length, arppu = ora ? M.attiviOra.reduce((s, a) => s + M.nettoMese(a), 0) / ora : null;
  const tot = nt && arppu ? (M.tot.meta / nt) / arppu : null;
  return { title: 'Rientro del CAC', q: 'In quanti mesi il netto di un pagante ripaga la pubblicità che è costato.', info: 'payback',
    val: L.payback == null ? '—' : `${ctN(L.payback, 1)} mesi`, chips: L.payback == null ? [] : [L.payback <= CT_RIENTRO_SANO ? { t: `sotto ${CT_RIENTRO_SANO}: sano`, k: 'good' } : { t: `sopra ${CT_RIENTRO_SANO} mesi`, k: 'bad' }],
    sub: tot != null ? `${ctDaFeb()}: ${ctN(tot, 1)} mesi` : '',
    charts: [{ cfg: { pts: ctBarPts(B, b => b.payback, { color: CT_P, fmt: x => x == null ? '—' : ctN(x, 1) + ' mesi', empty: '—', tip: b => [b.cac != null && b.arppu != null ? `CAC ${ctN(b.cac)} ÷ ARPPU ${ctN(b.arppu)}` : ''] }), refs: [{ v: CT_RIENTRO_SANO, label: `sano sotto|${CT_RIENTRO_SANO} mesi` }], tick: x => ctN(x, 0), aria: 'Rientro del CAC' } }],
    table: { cols: ['Periodo', 'CAC', 'ARPPU', 'Rientro'], rows: B.map(b => ctRiga(b, [b.long, ctE(b.cac), ctE(b.arppu), b.payback == null ? '—' : ctN(b.payback, 1)])) } };
});

ctDef('nuovi', 'Indicatore', 'Nuovi', (M, v) => {
  const B0 = ctSerie(M, v), B = B0.slice(ctPrimo(B0)), L = B[B.length - 1], Pp = B[B.length - 2], d = Pp ? L.nuovi - Pp.nuovi : null;
  return { title: 'Nuovi paganti', q: 'Primi pagamenti nel periodo, da prova o diretti.', info: 'nuovi',
    val: String(L.nuovi), chips: d != null ? [{ t: `${ctArrow(d)} ${ctFS(d, 0)} ${ctVs(B, v, true)}`, k: d >= 0 ? 'good' : 'bad' }] : [],
    sub: `${L.long}: ${L.nuovi - L.dir} da prova · ${L.dir} diretti`,
    charts: [{ cfg: { pts: ctBarPts(B, b => b.nuovi, { color: CT_P, fmt: x => `${x ?? 0} nuovi`, tip: b => [`${b.nuovi - b.dir} da prova · ${b.dir} diretti`] }), tick: x => ctN(x, 0), aria: 'Nuovi paganti', intero: true } }],
    table: { cols: ['Periodo', 'Nuovi', 'Da prova', 'Diretti'], rows: B.map(b => ctRiga(b, [b.long, b.nuovi, b.nuovi - b.dir, b.dir])) } };
});

ctDef('persi', 'Indicatore', 'Persi', (M, v) => {
  const B0 = ctSerie(M, v), i0 = ctPrimo(B0), B = B0.slice(i0), L = B[B.length - 1], LT = ctLtv(M);
  const inizio = i => (B0[i0 + i - 1] || { pag: 0 }).pag, iniL = inizio(B.length - 1);
  return { title: 'Paganti persi', q: 'Abbonamenti pagati scaduti senza rinnovo, rimborsi compresi.', info: 'persi',
    val: String(L.persi), chips: iniL < CT_POCHI_CASI ? [{ t: 'pochi casi', k: 'warn' }] : [], sub: `${L.long}: ${L.persi} su ${iniL} paganti a inizio ${ctPer(v)}`,
    charts: [{ cfg: { pts: ctBarPts(B, b => b.persi, { color: CT_R, fmt: x => `${x ?? 0} ${x === 1 ? 'perso' : 'persi'}`, tip: b => [b.persiDett.join(', ')] }), yMax: 2, tick: x => ctN(x, 0), aria: 'Paganti persi', intero: true } }],
    few: `Al primo rinnovo sono arrivati ${LT.own.mensile.n} ${LT.own.mensile.n === 1 ? 'mensile' : 'mensili'} e ${LT.own.annuale.n} ${LT.own.annuale.n === 1 ? 'annuale' : 'annuali'}: il tasso di abbandono si misura bene da ${CT_LTV_MIN} casi. Settore, primo rinnovo: mensile ${ctPct(CT_RINNOVO_SETTORE.mensile)}, annuale ${ctPct(CT_RINNOVO_SETTORE.annuale)}.`,
    table: { cols: ['Periodo', 'Persi', 'Paganti a inizio', 'Chi'], rows: B.map((b, i) => ctRiga(b, [b.long, b.persi, inizio(i), b.persiDett.join(', ') || '—'])) } };
});

ctDef('pareggio', 'Previsione', 'Pareggio', M => {
  const P = ctPareggio(M), mc = ctNomeMese(M.cur), primoN = ctNomeMese(P.primo);
  const verdetto = P.poco ? 'servono più mesi di dati' : null;
  const base = { title: 'Quando arriviamo al pareggio', q: 'Il mese in cui i paganti coprono i costi di funzionamento senza pubblicità (gradino 1).', info: 'pareggio',
    val: ctPareggioTesto(P), chips: [{ t: 'ipotesi' + (verdetto ? ' · ' + verdetto : ''), k: 'warn' }],
    sub: P.need != null ? `servono ${P.need} paganti per ${ctN(P.funz)} €/mese · oggi ${P.n}` : '' };
  if (P.need == null) return { ...base, charts: [{ cfg: { pts: [] } }], table: { cols: ['Ritmo'], rows: [] } };
  const mesiFut = Math.min(24, Math.max(3, Math.ceil(Math.max(P.mA || 0, P.mB || 0)) + 1));
  const ms = []; for (let m = P.primo; m <= addMese(M.cur, mesiFut); m = addMese(m, 1)) ms.push(m);
  const iCur = ms.indexOf(M.cur);
  const proj = r => ms.map((_, i) => { if (i < iCur || r <= 0) return null; if (i > iCur && P.n + r * (i - 1 - iCur) >= P.need) return null; return P.n + r * (i - iCur); });
  const act = ms.map((m, i) => i < iCur ? M.ind[m].paganti : i === iCur ? P.n : null);
  const pA = proj(P.rA), pB = proj(P.rB);
  const pts = ms.map((m, i) => {
    const mm = Number(m.slice(5));
    return { key: 'p' + m, lab: CT_MESI_BREVI[mm - 1], sub: i === iCur ? ctAl(M) : (mm === 1 ? m.slice(0, 4) : ''), strong: i === iCur, partial: i === iCur,
      tip: { t: i <= iCur ? ctMeseLabel(m) + (i === iCur ? ` (${ctAl(M)})` : '') : `${ctMeseLabel(m)}, ipotesi`, v: i <= iCur ? `${act[i]} paganti` : (pA[i] != null ? `≈ ${ctN(pA[i], 0)} al ritmo medio` : 'oltre il gradino al ritmo medio'),
        l: i <= iCur ? [] : [pB[i] != null ? `≈ ${ctN(pB[i], 0)} al ritmo di ${mc}` : `oltre il gradino al ritmo di ${mc}`] } };
  });
  const marks = [];
  const vicini = P.mA != null && P.mB != null && Math.abs(P.mA - P.mB) < 2;
  if (P.mB != null && P.mB <= mesiFut) marks.push({ i: iCur + P.mB, v: P.need, text: ctMeseBreveAnno(P.dB), color: CT_G, anchor: 'end', dx: -8 });
  if (P.mA != null && P.mA <= mesiFut) marks.push({ i: iCur + P.mA, v: P.need, text: ctMeseBreveAnno(P.dA), color: CT_P, anchor: 'end', dx: -8, below: vicini });
  const riga = (nome, r, m, d) => ({ c: [nome, ctFS(r, 1), m == null ? '—' : ctN(m, 1), m == null ? 'non si arriva' : ctMeseAnno(d)] });
  return { ...base,
    charts: [{ cfg: { pts, lines: [{ vals: act, color: CT_INK, dots: 'all', hollowDash: false }, { vals: pA, color: CT_P, dashFrom: 0, dots: 'none' }, { vals: pB, color: CT_G, dashFrom: 0, dots: 'none' }],
      refs: [{ v: P.need, label: `gradino 1|${P.need} paganti` }], marks, yMax: P.need * 1.25, tick: x => ctN(x, 0), aria: 'Proiezione dei paganti', intero: true } }],
    legend: [['ln', CT_INK, 'paganti veri'], ['ln', CT_G, `ritmo di ${mc}: ≈ ${ctFS(P.rB, 1)} al mese`], ['ln', CT_P, `ritmo medio da ${primoN}: ≈ ${ctFS(P.rA, 1)} al mese`], ['dl', '', 'gradino 1']],
    fewT: 'Ipotesi', few: `Ritmo di ${mc} e ritmo medio da ${primoN}, costi fermi a ${ctN(P.funz)} €/mese, mix di piani fermo (${ctN(P.perPag)} € a pagante), nessun abbandono.${P.poco ? ` Con ${P.mesiConPaganti} mesi di paganti è un'indicazione, non una data: servono più mesi di dati.` : ''}`,
    table: { cols: ['Ritmo', 'Paganti in più al mese', 'Mesi', 'Arrivo'], rows: [riga(`di ${mc} (${ctFS(P.nettiCur, 0)} in ${M.giornoN} giorni)`, P.rB, P.mB, P.dB), riga(`medio da ${primoN} (${P.n} in ${ctN(P.mesiTrascorsi, 1)} mesi)`, P.rA, P.mA, P.dA)] } };
}, { noView: true });

// Le metriche che cambiano fra cassa e competenza hanno l'interruttore nel cassetto
for (const id of ['ebitda', 'ebitdaM', 'cum']) CT_METRICHE.find(x => x.id === id).mode = true;

// ── CASSETTO ───────────────────────────────────────────────────────────────────────
const CT_SVG_PREV = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M10 3 5 8l5 5"/></svg>';
const CT_SVG_NEXT = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m6 3 5 5-5 5"/></svg>';
const CT_SVG_X = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m4 4 8 8M12 4l-8 8"/></svg>';
function ctMetrica(id) { return CT_METRICHE.find(x => x.id === id) || CT_METRICHE[0]; }
function ctSeg(attr, val, opts, label) {
  return `<div class="ct-seg ct-seg-sm" role="group" aria-label="${label}">${opts.map(([k, l]) => `<button type="button" ${attr}="${k}" aria-pressed="${val === k}">${l}</button>`).join('')}</div>`;
}
function ctDrawerInner(M, anim) {
  const ct = ctState(), dr = ct.dr, v = ct.view;
  const idx = Math.max(0, CT_METRICHE.findIndex(x => x.id === dr.id)), m = CT_METRICHE[idx];
  const mode = m.mode ? ct.mode : 'cassa';
  let d;
  try { d = m.build(M, v, mode); } catch (e) { console.error(e); d = { title: m.tab, q: 'Errore nel calcolo: ' + ctEsc(e.message), val: '—', chips: [], charts: [], table: { cols: [], rows: [] } }; }
  const head = `<div class="ct-dhd">
      <div class="ct-dnav"><button type="button" class="ct-ib" data-ct-nav="-1" aria-label="Metrica precedente">${CT_SVG_PREV}</button>
        <span class="ct-dpos">${idx + 1} di ${CT_METRICHE.length}</span>
        <button type="button" class="ct-ib" data-ct-nav="1" aria-label="Metrica successiva">${CT_SVG_NEXT}</button></div>
      <span class="ct-keys"><kbd>←</kbd><kbd>→</kbd> scorri · <kbd>Esc</kbd> chiudi</span>
      <span class="ct-flex1"></span>
      ${m.mode ? ctSeg('data-ct-mode', ct.mode, [['cassa', 'Cassa'], ['comp', 'Competenza']], 'Cassa o competenza') : ''}
      ${m.noView ? '' : ctSeg('data-ct-view', v, [['mesi', 'Mesi'], ['trimestri', 'Trimestri']], 'Vista del grafico')}
      <button type="button" class="ct-ib" data-ct-drclose aria-label="Chiudi il grafico">${CT_SVG_X}</button></div>
    <nav class="ct-dtabs" aria-label="Metriche">${CT_METRICHE.map(x => `<button type="button" data-ct-open="${x.id}" aria-current="${x.id === m.id}">${x.tab}</button>`).join('')}</nav>`;
  const pinOk = dr.pin && d.charts.length && d.charts[0].cfg && (d.charts[0].cfg.pts || []).some(p => p.key === dr.pin);
  let det = '';
  if (dr.pin && d.det) { const x = ctDettaglioCorpo(M, d.det, dr.pin); if (x) det = `<div class="ct-pind"><h4 class="ct-h4">${x.titolo}</h4>${x.corpo}</div>`; }
  const info = d.info && CT_INFO[d.info] ? CT_INFO[d.info](M).replace(/^<b>[\s\S]*?<\/b>/, '') : '';
  const t = d.table || { cols: [], rows: [] };
  const charts = (d.charts || []).map((c, i) => {
    let h = ctChart(c.cfg);
    if (i === 0 && pinOk) h = h.replace('class="ct-chart"', `class="ct-chart" data-pin="${ctEsc(dr.pin)}"`);
    const lg = i === 0 ? ctLegend(d.legend || ctDefLegend(M, d, v, m)) : '';
    return `<div class="ct-dc">${c.title ? `<h4 class="ct-h4">${c.title}</h4>` : ''}${h}${lg}</div>`;
  }).join('');
  const body = `<div class="ct-db${anim ? ' ct-anim ct-swap' : ''}" tabindex="-1">
    <div><div class="ct-deye">${m.gruppo} · ${m.noView ? 'proiezione' : v === 'mesi' ? 'mese per mese' : 'trimestre per trimestre'}${m.mode && mode === 'comp' ? ' · competenza' : ''}</div>
      <h3 class="ct-dt">${d.title} ${d.info ? ctI(d.info) : ''}</h3><p class="ct-dq">${d.q}</p></div>
    <div><div class="ct-dhv"><b class="${d.valNeg ? 'ct-neg' : ''}">${d.val}</b>${(d.chips || []).map(ctChip).join('')}</div><div class="ct-dsub">${d.sub || ''}</div></div>
    ${d.extraTop || ''}
    ${charts}
    ${d.few ? `<div class="ct-few"><b>${d.fewT || 'Pochi casi'}</b><span>${d.few}</span></div>` : ''}
    ${d.extra || ''}
    ${det}
    ${t.rows.length ? `<table class="ct-vt"><caption>I valori</caption><thead><tr>${t.cols.map(c => `<th scope="col">${c}</th>`).join('')}</tr></thead><tbody>${t.rows.map(r => `<tr class="${r.p ? 'ct-vp' : ''}${r.e ? ' ct-ve' : ''}${dr.pin && r.k === dr.pin ? ' ct-vpin' : ''}">${r.c.map(x => `<td>${x ?? '—'}</td>`).join('')}</tr>`).join('')}</tbody></table>` : ''}
    ${d.note ? `<p class="ct-dnote">${d.note}</p>` : ''}
    ${info ? `<div class="ct-dform">${info}</div>` : ''}
  </div>`;
  return head + body;
}
function ctDefLegend(M, d, v, m) {
  if (m.noView) return null;
  const c = d.charts && d.charts[0] && d.charts[0].cfg; if (!c || !c.pts) return null;
  const isLine = !(c.pts || []).some(p => p.bars && p.bars.length);
  const t = v === 'mesi' ? `${ctNomeMese(M.cur)}, ${ctAl(M)}` : `trimestre in corso, ${ctAl(M)} ${ctNomeMese(M.cur, true)}`;
  return isLine ? [['dl', '', 'tratteggio: ' + t]] : [['ht', CT_MUTE, 'righe: ' + t]];
}
function ctDrawer(M) {
  const ct = ctState(), dr = ct.dr;
  const anim = ct.anim && dr.open; ct.anim = false;
  return `<aside class="ct-dr${dr.open ? ' ct-open' : ''}" id="ctDr" aria-label="Grafico della metrica" aria-hidden="${!dr.open}"${dr.open ? '' : ' inert'}>${ctDrawerInner(M, anim)}</aside>`;
}

// ── KPI IN TESTA ───────────────────────────────────────────────────────────────────
function ctKpi(M) {
  const ct = ctState(), v = ct.view, dr = ct.dr;
  const B = ctSerie(M, v), L = B[B.length - 1], Pp = B[B.length - 2], i0 = ctPrimo(B), Bi = B.slice(i0);
  const vs = ctVs(B, v, false);
  const ora = M.attiviOra;
  const mrr = ora.reduce((s, a) => s + M.nettoMese(a), 0);
  const F = M.cols[M.cur]; const I = M.ind[M.cur];
  const cacMese = I.nuovi ? F.meta / I.nuovi : null;
  const totNuovi = ctNuoviTot(M), cacTot = totNuovi ? M.tot.meta / totNuovi : null;
  const arppu = ora.length ? mrr / ora.length : null;
  const roasMese = F.meta > 0 ? F.netto / F.meta : null, roasTot = M.tot.meta > 0 ? M.tot.netto / M.tot.meta : null;
  const roiMese = ctRoi(F), roiTot = ctRoi(M.tot);
  const LT = ctLtv(M), bu = ctBurn(M);
  const ok = M.proveDecise.filter(e => e.ok).length, n = M.proveDecise.length;
  const piani = ora.reduce((o, a) => (o[a.piano] = (o[a.piano] || 0) + 1, o), {});
  const daFeb = 'da ' + CT_MESI_BREVI[Number(CT_DAL.slice(5)) - 1].toLowerCase();
  const card = (id, label, val, chip, sub, viz, cls = '') => `<div class="ct-kpi${dr.open && dr.id === id ? ' ct-on' : ''}" data-ct-k="${id}">
      <button type="button" class="ct-kbtn" data-ct-open="${id}" aria-label="Apri il grafico: ${ctEsc(label)}"></button>
      <div class="ct-kl">${label}${ctI(id)}<span class="ct-go">${CT_ICO_GRAF}</span></div>
      <div class="ct-kv"><b class="${cls}">${val}</b>${ctChip(chip)}</div><div class="ct-ks">${sub}</div>${viz}</div>`;
  const delta = (a, b) => a != null && b != null ? a - b : null;
  // MRR
  const cr = L.crescita;
  const kMrr = card('mrr', 'Ricavo ricorrente (MRR)', ctE(mrr), cr != null ? { t: `${ctArrow(cr)} ${ctFSP(cr)} ${vs}`, k: cr >= 0 ? 'good' : 'bad' } : null,
    `ARR ${ctN(mrr * 12)} €`, ctSpark(B.map(b => b.mrr), CT_G, { partial: L.partial }));
  // Paganti
  const dp = Pp ? L.pag - Pp.pag : null;
  const kPag = card('paganti', 'Paganti', ora.length, dp != null ? { t: `${ctArrow(dp)} ${ctFS(dp, 0)} ${vs}`, k: dp >= 0 ? 'good' : 'bad' } : null,
    `${Object.entries(piani).map(([p, k]) => `${k} ${p === 'rate' ? 'a rate' : p === 'annuale' ? 'annuali' : 'mensili'}`).join(' · ')}${M.inProva.length ? ` · ${M.inProva.length} in prova` : ''}`,
    ctSpark(B.map(b => b.pag), CT_P, { partial: L.partial }));
  // Prove
  let o = 0, t = 0; const cumP = Bi.map(b => { o += b.pOk; t += b.pTot; return t ? o / t : null; });
  const kProve = card('prove', 'Prove che pagano', n ? `${ok} su ${n}` : '—', n ? { t: `${ctPct(ok / n, 0)} · settore ${ctPct(CT_PROVE_SETTORE)}`, k: 'neu' } : null,
    n ? `${n < CT_POCHI_CASI ? 'pochi casi · ' : ''}${ctNomeMese(M.cur)} ${I.proveOk} su ${I.proveTot}` : 'nessuna prova conclusa',
    ctSpark(cumP, CT_P, { ref: CT_PROVE_SETTORE, partial: L.partial }));
  // Perdita
  const db = delta(bu.ora, bu.prima);
  const sparkBurn = v === 'mesi' ? ctSpark(Object.values(bu.media), CT_R, {}) : ctSpark(B.map(b => b.ris / b.n), CT_R, { partial: L.partial });
  const kBurn = card('burn', 'Perdita al mese (burn)', bu.ora == null ? '—' : ctE(bu.ora), db != null ? { t: `${ctArrow(db)} ${ctFS(db)} € su ${ctNomeMese(M.chiusi[M.chiusi.length - 2] || M.cur, true)}`, k: db < 0 ? 'bad' : 'good' } : null,
    `${bu.u3.length ? `media ${ctNomeMese(bu.u3[0], true)}–${ctNomeMese(bu.u3[bu.u3.length - 1], true)} · ` : ''}cumulato ${ctE(M.cumulato[M.cur])}`, sparkBurn, bu.ora != null && bu.ora < 0 ? 'ct-neg' : '');
  // CAC
  const Lc = Bi[Bi.length - 1], Pc = Bi[Bi.length - 2], dc = Lc && Pc && Lc.cac != null && Pc.cac ? Lc.cac / Pc.cac - 1 : null;
  const kCac = card('cac', 'Costo per pagante (CAC)', cacMese == null ? '—' : ctE(cacMese), dc != null ? { t: `${ctArrow(dc)} ${ctFSP(dc)} ${vs}`, k: dc <= 0 ? 'good' : 'bad' } : null,
    `${daFeb} ${ctE(cacTot)}${cacMese && arppu ? ` · rientro ${ctN(cacMese / arppu, 1)} mesi` : ''}`, ctSpark(Bi.map(b => b.cac), CT_P, { partial: L.partial }));
  // LTV
  const r = LT.ltv != null && cacMese ? LT.ltv / cacMese : null;
  const mx = Math.max(CT_LTVCAC_SANO * 7 / 6, (r || 0) * 1.1);
  const meter = r == null ? '<div class="ct-meter"></div>' : `<div class="ct-meter" aria-hidden="true"><div class="t"><i style="width:${Math.min(100, r / mx * 100).toFixed(1)}%;background:${r >= CT_LTVCAC_SANO ? CT_G : CT_R}"></i><s style="left:${(CT_LTVCAC_SANO / mx * 100).toFixed(1)}%"></s></div><div class="l"><span>LTV/CAC ${ctN(r)}</span><span>sano: ${CT_LTVCAC_SANO}</span></div></div>`;
  const kLtv = card('ltv', 'Valore di un cliente (LTV)', LT.ltv == null ? '—' : ctE(LT.ltv), r != null ? { t: `LTV/CAC ${ctN(r)}`, k: r >= CT_LTVCAC_SANO ? 'good' : 'bad' } : null,
    `incassato finora ${ctE(LT.storico)} a pagante`, meter);
  // ROI
  const dr2 = L.roi != null && Pp && Pp.roi != null ? (L.roi - Pp.roi) * 100 : null;
  const kRoi = card('roi', 'Ritorno sull’investimento (ROI)', ctPct(roiMese), dr2 != null ? { t: `${ctArrow(dr2)} ${ctFS(dr2, 1)} punti ${vs}`, k: dr2 >= 0 ? 'good' : 'bad' } : null,
    `tutti i costi · ${daFeb} ${ctPct(roiTot)}`, ctSpark(B.map(b => b.roi), roiMese != null && roiMese >= 0 ? CT_G : CT_R, { partial: L.partial }), roiMese != null ? (roiMese >= 0 ? 'ct-pos' : 'ct-neg') : '');
  // ROAS
  const da = L.roas != null && Pp && Pp.roas != null ? L.roas - Pp.roas : null;
  const kRoas = card('roas', 'Ritorno su Meta (ROAS)', roasMese == null ? '—' : ctN(roasMese) + ' €', da != null ? { t: `${ctArrow(da)} ${ctFS(da)} € ${vs}`, k: da >= 0 ? 'good' : 'bad' } : null,
    `per 1 € di Meta · ${daFeb} ${roasTot == null ? '—' : ctN(roasTot) + ' €'}`, ctSpark(B.map(b => b.roas), CT_P, { ref: 1, partial: L.partial }), roasMese != null && roasMese >= 1 ? 'ct-pos' : '');
  return `<div class="ct-kpis">${kMrr}${kPag}${kProve}${kBurn}${kCac}${kLtv}${kRoi}${kRoas}</div>`;
}

// ── DA DOVE NASCE IL MRR (carta sotto la tabella) ─────────────────────────────────────
function ctMovCard(M) {
  const v = ctState().view, D = ctMovData(M, v), L = D[D.length - 1];
  return `<div class="card ct-card ct-mov"><div class="ct-cardh"><div class="card-title" style="margin:0">Da dove nasce il MRR ${ctI('movimenti')}</div><button type="button" class="btn btn-ghost ct-btn-sm" data-ct-open="movimenti">Apri il grafico</button></div>
    ${ctChart(ctMovCfg(M, v, 560, 210))}${ctLegend(ctMovLegend(M, v))}
    <div class="ct-movsum"><span>${ctCap(L.b.long)}:</span><span>MRR nuovo <b>+${ctN(L.nuovo)}</b></span><span>MRR perso <b>−${ctN(L.perso)}</b></span><span>netto <b>${ctFS(L.net)} €</b></span></div></div>`;
}

// ── SALDO IN BANCA E AUTONOMIA ─────────────────────────────────────────────────────
function ctParseSaldo(s) {
  let x = String(s ?? '').replace(/[\s€]/g, '');
  if (!x) return null;
  if (x.includes(',')) x = x.replace(/\./g, '').replace(',', '.');
  else if (/^-?\d{1,3}(\.\d{3})+$/.test(x)) x = x.replace(/\./g, '');
  const n = Number(x); return isFinite(n) ? n : null;
}
function ctRunway(M, saldo, esempio) {
  const bu = ctBurn(M);
  if (bu.ora == null) return `<div class="ct-empty">Serve almeno un mese chiuso per la perdita media.</div>`;
  if (bu.ora >= 0) return `<div class="ct-run"><div class="ct-run-when">Negli ultimi 3 mesi chiusi siete in utile (${ctE(bu.ora)} al mese): il saldo non si consuma.</div></div>`;
  const m = saldo / -bu.ora, d = ctTraMesi(m), max = 24;
  const ticks = [0, 6, 12, 18, 24].map(k => k ? ctMeseBreveAnno(ctTraMesi(k)) : 'oggi');
  return `<div class="ct-run">${esempio ? '<span class="ct-exb">Esempio, non il vostro saldo</span>' : ''}<div class="ct-run-big">${ctN(m, 1)}<small>mesi di autonomia</small></div>
    <div class="ct-run-when">fino a ${ctMeseAnno(d)} circa, con ${ctE(-bu.ora)} di perdita al mese</div>
    <div class="ct-rtrack" aria-hidden="true"><i style="width:${Math.min(100, m / max * 100).toFixed(1)}%"></i></div><div class="ct-rticks">${ticks.map(x => `<span>${x}</span>`).join('')}</div></div>`;
}
function ctSaldoOut(M) {
  const ct = ctState();
  const bozza = ct.saldoBozza != null ? ctParseSaldo(ct.saldoBozza) : (ct.saldo ? ct.saldo.saldo : null);
  if (bozza != null && bozza > 0) return ctRunway(M, bozza, false) + (ct.saldoBozza != null && (!ct.saldo || bozza !== ct.saldo.saldo) ? `<p class="ct-foot ct-foot-w">Non ancora salvato: premi Salva o Invio.</p>` : '');
  if (ct.esempio) return ctRunway(M, CT_SALDO_ESEMPIO, true);
  const bu = ctBurn(M);
  return `<div class="ct-empty">Inserisci il saldo del conto: l'autonomia è saldo ÷ ${bu.ora != null && bu.ora < 0 ? ctE(-bu.ora) : 'la perdita media'} al mese.</div>`;
}
function ctSaldoCard(M) {
  const ct = ctState(), s = ct.saldo;
  const val = ct.saldoBozza != null ? ct.saldoBozza : (s ? ctN(s.saldo) : '');
  const quando = s && s.data ? new Date(s.data).toLocaleString('it-IT', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;
  return `<div class="card ct-card ct-saldo" id="ctSaldo"><div class="ct-cardh"><div class="card-title" style="margin:0">Saldo in banca e autonomia ${ctI('saldo')}</div></div>
    <label class="ct-sl" for="ctSaldoIn">Saldo del conto</label>
    <div class="ct-inrow"><div class="ct-in"><input id="ctSaldoIn" inputmode="decimal" autocomplete="off" placeholder="inserisci il saldo" value="${ctEsc(val)}"><span>€</span></div>
      <button type="button" class="btn btn-primary ct-btn-sm" data-ct-saldo-save ${ct.saldoSaving ? 'disabled' : ''}>${ct.saldoSaving ? 'Salvo…' : 'Salva'}</button>
      ${!s && ct.saldoBozza == null ? `<button type="button" class="btn btn-ghost ct-btn-sm" data-ct-esempio>${ct.esempio ? 'Togli l\'esempio' : `Prova con ${ctN(CT_SALDO_ESEMPIO, 0)} € d'esempio`}</button>` : ''}</div>
    <div id="ctSaldoOut">${ctSaldoOut(M)}</div>
    <div class="ct-foot">${quando ? `Inserito il ${quando}.` : 'Il saldo si salva nel Finance, con la data di inserimento.'}</div></div>`;
}
async function ctSalvaSaldo() {
  const ct = ctState();
  const raw = ct.saldoBozza != null ? ct.saldoBozza : (ct.saldo ? String(ct.saldo.saldo) : '');
  const n = String(raw).trim() === '' ? null : ctParseSaldo(raw);
  if (String(raw).trim() !== '' && (n == null || n < 0)) { showToast('Saldo non valido: scrivi una cifra, es. 4.250,00', 'error'); return; }
  const value = { saldo: n, data: new Date().toISOString() };
  ct.saldoSaving = true; render();
  try {
    const { error } = await sb.from('finance_settings').upsert({ key: 'conto_saldo', value, updated_at: value.data });
    if (error) throw error;
    ct.saldo = n == null ? null : value; ct.saldoBozza = null; ct.esempio = false;
    ct.saldoSaving = false; showToast(n == null ? 'Saldo tolto' : 'Saldo salvato');
  } catch (e) {
    console.error(e); ct.saldoSaving = false; render(); showToast('Errore nel salvataggio del saldo.', 'error');
  }
}

// ── SCALA «azienda vera» ──────────────────────────────────────────────────────────
function ctScala(M) {
  const ora = M.attiviOra; const n = ora.length;
  const mrr = ora.reduce((s, a) => s + M.nettoMese(a), 0);
  const perPag = n ? mrr / n : 0;
  const E = M.cols[M.cur + ':E'];
  const funz = E.altri + E.stime;              // costi di funzionamento del mese (senza pubblicità)
  const meta = E.meta;
  const P = ctPareggio(M);
  const gradini = [
    ['Costi di funzionamento', 'server, AI, strumenti; senza pubblicità', funz],
    ['+ Meta al ritmo di questo mese', `stima di fine mese ${ctN(meta, 0)} €`, funz + meta],
    ['+ costi fissi di una SRL', `≈ ${ctN(CT_SRL_MESE, 0)} €/mese`, funz + meta + CT_SRL_MESE],
    ['+ due compensi minimi', `≈ ${ctN(CT_COMPENSI_MESE, 0)} €/mese`, funz + meta + CT_SRL_MESE + CT_COMPENSI_MESE],
  ];
  const pareggio = P.need == null ? '' : `<button type="button" class="ct-be" data-ct-open="pareggio"><span><b>Pareggio di funzionamento: ${P.man <= 0 ? 'già coperto' : ctPareggioTesto(P)}</b><br><small>al ritmo di ${ctNomeMese(M.cur)} o al ritmo medio da ${ctNomeMese(P.primo)}${P.poco ? ' · servono più mesi di dati' : ''}</small></span><span class="ct-chip ct-chip-warn">ipotesi</span></button>`;
  const rows = gradini.map(([t, s, euro], i) => {
    const serve = perPag ? Math.ceil(euro / perPag) : null;
    const servMens = Math.ceil(euro / ctNet(CT_LISTINO.mensile));
    const pct = serve ? Math.min(100, n / serve * 100) : 0;
    return `<div class="ct-step"><span class="ct-sk">${i + 1}</span><span class="ct-st">${t}<small>${s}</small></span>
      <span class="ct-sp">${serve == null ? '—' : ctN(serve, 0)} paganti<small>${ctN(euro, 0)} €/mese · ${ctN(servMens, 0)} se tutti mensili</small></span>
      <span class="ct-track"><i style="width:${pct.toFixed(1)}%"></i></span>${i === 0 ? pareggio : ''}</div>`;
  }).join('');
  return `<div class="card ct-card ct-scala"><div class="card-title">Quanto manca per reggervi da soli ${ctI('scala')}</div>
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
  L.push(`EBITDA (risultato)         ${ctE(ctRisultato(b))}`);
  L.push(`EBITDA margin              ${b.netto > 0 ? ctPct(ctRisultato(b) / b.netto, 0) : '—'}  (EBITDA ÷ netto)`);
  L.push(`Cumulato da ${ctMeseLabel(CT_DAL)}  ${ctE(M.cumulato[last])}`);
  if (parz) L.push(`EBITDA stimato a fine ${ctMeseLabel(M.cur)}: ${ctE(M.scen.centrale.ris)} (tra ${ctE(M.scen.prudente.ris)} e ${ctE(M.scen.ottimista.ris)})`);
  if (isQ) {
    L.push(''); L.push('MESE PER MESE');
    for (const m of ms) L.push(`${ctMeseLabel(m).padEnd(16)} netto ${ctE(M.cols[m].netto).padStart(10)}  Meta ${ctE(-M.cols[m].meta).padStart(10)}  EBITDA ${ctE(ctRisultato(M.cols[m])).padStart(11)}`);
  }
  L.push(''); L.push('INDICATORI');
  L.push(`Paganti ${parz ? 'oggi' : 'a fine periodo'}: ${I.paganti}  ·  nuovi nel periodo: ${nuovi}`);
  L.push(`Ricavo ricorrente mensile (MRR): ${ctE(I.mrr)}  ·  ARR: ${ctE(I.mrr * 12)}`);
  { const mn = ms.reduce((s, m) => s + M.ind[m].mrrNuovo, 0), mp = ms.reduce((s, m) => s + M.ind[m].mrrPerso, 0);
    L.push(`Da dove nasce il MRR: nuovo +${ctN(mn)} · perso ${mp > 0.004 ? '−' + ctN(mp) : '0,00'} · netto ${ctFS(mn - mp)} €`); }
  if (nuovi) L.push(`Costo per nuovo pagante (CAC): ${ctE(b.meta / nuovi)}`);
  L.push(`Ritorno sull’investimento (ROI, tutti i costi): ${ctPct(ctRoi(b))}`);
  if (b.meta) L.push(`Ritorno su Meta (ROAS): ${ctN(b.netto / b.meta)} € netti per 1 € speso`);
  if (ctMargine(b) != null) L.push(`Margine lordo: ${ctPct(ctMargine(b), 0)} (netto meno server, infrastruttura e AI)`);
  { const persi = ms.reduce((s, m) => s + M.ind[m].persi, 0); L.push(`Paganti persi nel periodo: ${persi}`); }
  if (parz) { const LT = ctLtv(M); if (LT.ltv != null) L.push(`Valore di un cliente (LTV, stima con rinnovi di settore): ${ctE(LT.ltv)}`); }
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
  try { M = ctModel(); ctLastM = M; } catch (e) { console.error(e); return `${head}<div class="card"><div class="empty"><div class="empty-text">Errore nel calcolo: ${ctEsc(e.message)}</div></div></div>`; }
  CT_CH = {};
  const animPage = ct.animPage; ct.animPage = false;
  const comp = ct.mode === 'comp';
  return `${head}
    ${ctKpi(M)}
    <div class="card ct-card">
      <div class="ct-cap"><div class="card-title" style="margin:0">${ct.view === 'trimestri' ? 'Conto per trimestre' : 'Conto per mese'}</div>
        <div class="ct-capr"><div class="ct-leg"><span><i class="ct-sw ct-sw-a"></i>avvenuto</span><span><i class="ct-sw ct-sw-s"></i>stimato</span></div>
          <div class="ct-capm">${ctSeg('data-ct-mode', ct.mode, [['cassa', 'Cassa'], ['comp', 'Competenza']], 'Cassa o competenza')}${ctI('cassa')}</div></div></div>
      ${comp ? `<div class="ct-comp-note">Vista per competenza: <b>${ctE(M.risconti[M.cur])}</b> già incassati sono per i mesi dopo (risconti). A fine ${ctNomeMese(M.cur)} solo il netto: EBITDA e cumulato si stimano in cassa. ROI, ROAS e CAC restano in cassa.</div>` : ''}
      ${ctTabella(M)}
      ${ctDettaglio(M)}
    </div>
    <div class="ct-row2${animPage ? ' ct-anim' : ''}">${ctMovCard(M)}${ctSaldoCard(M)}</div>
    ${ctScala(M)}
    ${ctReportModal(M)}
    ${ctDrawer(M)}`;
}

// ── CASSETTO: aprire, scorrere, chiudere senza rifare la pagina ─────────────────────────
function ctDrRender(anim) {
  const ct = ctState(), el = document.getElementById('ctDr');
  if (!el || !ctLastM) { ct.anim = anim; render(); return; }
  ctChiudiInfo();
  el.innerHTML = ctDrawerInner(ctLastM, anim);
  ct.drScroll = 0;
  ctDrWire(el);
}
function ctDrWire(el) {
  const ct = ctState(); if (!el) return;
  ctWireCharts(el);
  const db = el.querySelector('.ct-db');
  if (db) { db.scrollTop = ct.drScroll || 0; db.addEventListener('scroll', () => { ct.drScroll = db.scrollTop; }, { passive: true }); }
}
function ctSync() {
  const ct = ctState(), dr = ct.dr, el = document.getElementById('ctDr');
  if (el) { el.classList.toggle('ct-open', dr.open); el.setAttribute('aria-hidden', String(!dr.open)); el.inert = !dr.open; }
  document.querySelectorAll('.ct-kpi[data-ct-k]').forEach(k => k.classList.toggle('ct-on', dr.open && k.dataset.ctK === dr.id));
  document.querySelectorAll('tr[data-ct-row]').forEach(r => r.classList.toggle('ct-rsel', dr.open && r.dataset.ctRow === dr.id));
  document.querySelectorAll('td.ct-pin').forEach(td => td.classList.remove('ct-pin'));
  if (dr.open && dr.pin) document.querySelectorAll(`td[data-ct-m="${dr.id}"][data-ct-pin="${CSS.escape(dr.pin)}"]`).forEach(td => td.classList.add('ct-pin'));
}
function ctDrApri(id, pin = null) {
  const ct = ctState(), dr = ct.dr;
  if (!CT_METRICHE.some(x => x.id === id)) return;
  const eraAperto = dr.open, uguale = dr.open && dr.id === id && (dr.pin || null) === (pin || null);
  dr.id = id; dr.pin = pin || null; dr.open = true;
  if (ct.sel) { ct.sel = null; const d = document.querySelector('.ct-det'); if (d) d.remove(); document.querySelectorAll('td.ct-sel').forEach(td => td.classList.remove('ct-sel')); }
  if (!uguale) ctDrRender(true);
  ctSync();
  if (!eraAperto) { const db = document.querySelector('#ctDr .ct-db'); if (db) db.focus({ preventScroll: true }); }
}
function ctDrNav(d) {
  const dr = ctState().dr, n = CT_METRICHE.length;
  const i = Math.max(0, CT_METRICHE.findIndex(x => x.id === dr.id));
  dr.id = CT_METRICHE[(i + d + n) % n].id; dr.pin = null;
  ctDrRender(true); ctSync();
}
function ctDrChiudi() { const dr = ctState().dr; dr.open = false; dr.pin = null; ctChiudiInfo(); ctSync(); }

// ── EVENTI ─────────────────────────────────────────────────────────────────────────
let ctPop = null;
let ctPopAt = 0;
function ctChiudiInfo() { if (ctPop) { ctPop.remove(); ctPop = null; } }
function ctApriInfo(btn) {
  const key = btn.dataset.ctInfo;
  if (ctPop && ctPop.dataset.key === key) { ctChiudiInfo(); return; }
  ctChiudiInfo();
  ctPopAt = Date.now();
  ctPop = document.createElement('div');
  ctPop.className = 'ct-pop'; ctPop.dataset.key = key; ctPop.setAttribute('role', 'tooltip');
  const v = CT_INFO[key]; ctPop.innerHTML = typeof v === 'function' ? (ctLastM ? v(ctLastM) : '') : (v || '');
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
// Comandi della pagina e del cassetto: delegati, perché il cassetto si ridisegna da solo
document.addEventListener('click', e => {
  if (state.page !== 'conto' || !state.ct || !e.target.closest) return;
  const t = e.target.closest('[data-ct-open],[data-ct-nav],[data-ct-drclose],[data-ct-mode],[data-ct-view],[data-ct-goto],[data-ct-esempio],[data-ct-saldo-save]');
  if (!t) return;
  const ct = state.ct;
  if (t.dataset.ctOpen) { ctDrApri(t.dataset.ctOpen); return; }
  if (t.dataset.ctNav) { ctDrNav(Number(t.dataset.ctNav)); return; }
  if (t.hasAttribute('data-ct-drclose')) { ctDrChiudi(); return; }
  if (t.dataset.ctMode) { if (ct.mode !== t.dataset.ctMode) { ct.mode = t.dataset.ctMode; ct.sel = null; ct.anim = true; render(); } return; }
  if (t.dataset.ctView) { if (ct.view !== t.dataset.ctView) { ct.view = t.dataset.ctView; ct.sel = null; ct.dr.pin = null; ct.anim = true; ct.animPage = true; render(); } return; }
  if (t.dataset.ctGoto === 'saldo') {
    ctDrChiudi();
    const s = document.getElementById('ctSaldo'); if (s) s.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
    setTimeout(() => { const i = document.getElementById('ctSaldoIn'); if (i) i.focus({ preventScroll: true }); }, 350);
    return;
  }
  if (t.hasAttribute('data-ct-esempio')) { ct.esempio = !ct.esempio; render(); return; }
  if (t.hasAttribute('data-ct-saldo-save')) { ctSalvaSaldo(); return; }
});
document.addEventListener('input', e => {
  if (state.page !== 'conto' || !state.ct || e.target.id !== 'ctSaldoIn') return;
  state.ct.saldoBozza = e.target.value; state.ct.esempio = false;
  const o = document.getElementById('ctSaldoOut'); if (o && ctLastM) o.innerHTML = ctSaldoOut(ctLastM);
});
document.addEventListener('keydown', e => {
  const ct = state.ct;
  if (e.key === 'Escape') {
    if (ctPop) { ctChiudiInfo(); return; }
    if (ct && ct.report) { ct.report = null; render(); return; }
    if (ct && ct.dr.open && state.page === 'conto' && !state.modal) ctDrChiudi();
    return;
  }
  if (!ct || state.page !== 'conto') return;
  if (e.key === 'Enter' && e.target.id === 'ctSaldoIn') { e.preventDefault(); ctSalvaSaldo(); return; }
  if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && ct.dr.open && !ct.report && !state.modal && !e.altKey && !e.ctrlKey && !e.metaKey) {
    const tg = e.target;
    if (tg.closest && tg.closest('input, select, textarea, .ct-chart, [contenteditable="true"]')) return;
    e.preventDefault(); ctDrNav(e.key === 'ArrowRight' ? 1 : -1);
  }
});
window.addEventListener('scroll', () => { if (Date.now() - ctPopAt > 400) ctChiudiInfo(); }, true);

function attachContoEvents() {
  ctChiudiInfo();
  if (state.page !== 'conto') return;
  const ct = ctState();
  document.querySelectorAll('[data-ct-exp]').forEach(el => el.addEventListener('click', () => { ct.open[el.dataset.ctExp] = !ct.open[el.dataset.ctExp]; render(); }));
  // Una cifra di una riga con grafico apre il cassetto col mirino fermo su quel periodo; le altre aprono «da cosa nasce».
  const pick = el => {
    if (el.dataset.ctM) { ctDrApri(el.dataset.ctM, el.dataset.ctPin || null); return; }
    const [r, c] = el.dataset.ctCell.split('|');
    ct.sel = ct.sel && ct.sel.r === r && ct.sel.c === c ? null : { r, c };
    if (ct.sel) { ct.dr.open = false; ct.dr.pin = null; }
    render();
  };
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
  ctWireCharts(document.querySelector('.ct-row2'));
  ctDrWire(document.getElementById('ctDr'));
}
