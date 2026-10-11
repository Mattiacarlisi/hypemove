// KPI Dashboard — pagina «Stats» (tema Notte del design system HypeMove).
// Caricato DOPO kpi.js: usa `sb`, `state`, `render` e `esc` di quel file. Le serie arrivano
// dalle RPC kpi_stats_sprints e kpi_stats_series (contratto in _specs/design-flows/kpi-home).
// Le misure, i colori e i testi copiano la tavola «2A - Sprint in alto».

const ST = {
  INK: '#ffffff', MUT: '#9ca3af', TER: '#6f7683', BLU: '#4361ee', ORA: '#fb8b04', VER: '#3fb950',
  GRID: '#2a2e37', CARD: '#1a1d24', PAGE: '#0f1115', PAST12: '#d1d5db',
  FZ: 'rgba(255,255,255,0.04)', FZ2: 'rgba(255,255,255,0.05)', FZ_LEG: 'rgba(255,255,255,0.09)',
  ADS: 'rgba(67,97,238,0.14)',   // fascia dei giorni di pubblicità, distinta dal grigio di «da oggi»
};


const ST_REFRESH_STALE_MS = 5 * 60 * 1000;

const stats = {
  sprints: null,        // kpi_stats_sprints
  sprintId: null,       // null = sprint predefinito scelto dal server
  data: null,           // kpi_stats_series
  loading: true, error: null, lastUpdated: null,
  cachePending: false, cacheFailed: false, cacheFresh: false,   // ricalcolo in corso / non riuscito / appena arrivato
  computedAt: null,     // ora in cui il database ha calcolato i dati in vista (cache)
  menuOpen: false, menuIdx: 0,
  seq: 0,
  gross: false,         // globale «Con tasse / Senza tasse» dalla barra sopra i grafici: false = resa netta (20,90 €), true = prezzo pieno (29,99 €). Vale per i grafici in euro
  cmp: null,            // globale «Confronta» dalla barra: id degli sprint di confronto scelti; null = i due precedenti. Vale per i grafici per sprint
  cmpOpen: false,
  rate: null,           // globale «Tasso» dalla barra: tasso di fine prova impostato a mano (0..1); null = quello dei dati. Vale per il ROI. Non si ricorda fra le visite
};
const ST_LS = { gross: 'kpi.stats.gross', cmp: 'kpi.stats.compare' };
const stLsGet = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
const stLsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* senza memoria la scelta vale per la visita */ } };
stats.gross = stLsGet(ST_LS.gross) === true;
{ const c = stLsGet(ST_LS.cmp); if (Array.isArray(c)) stats.cmp = c; }
const ST_CMP_MAX = 3;
let statsCharts = [];   // metadati dei grafici disegnati, per il passaggio del mouse

// ── FORMATO ───────────────────────────────────────────────────────────
const stIt = (v, d = 2) => Number(v).toFixed(d).replace('.', ',');
const stEuro = v => (Math.abs(v) < 1e-9 ? '0' : stIt(v, 2));
const stPct = v => { const r = Math.round(v * 10) / 10; return String(r).replace('.', ',') + '%'; };
const stDM = iso => iso.slice(8, 10) + '/' + iso.slice(5, 7);
const stDayN = iso => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) / 864e5;
const stAddDays = (iso, n) => { const d = new Date((stDayN(iso) + n) * 864e5); return d.toISOString().slice(0, 10); };
const stNum = v => Number(v).toFixed(4).replace(/\.?0+$/, '');

// ── DATI ──────────────────────────────────────────────────────────────
async function fetchStats(opts = {}) {
  const silent = !!opts.silent && !!stats.data;
  const seq = ++stats.seq;
  const scope = stats.sprintId || 'default';
  if (!silent) { stats.loading = true; stats.error = null; stats.data = opts.keepData ? stats.data : null; render(); }
  const apply = d => {
    stats.data = d.data;
    stats.computedAt = d.computed_at ? new Date(d.computed_at) : null;
    stats.error = null;
    stats.lastUpdated = new Date();
  };
  try {
    // 1. si legge il valore salvato (anche scaduto): si disegna subito
    const [ser, lst] = await Promise.all([
      sb.rpc('kpi_cache_get', { p_query: 'stats_series', p_scope: scope, p_force: false }),
      sb.rpc('kpi_stats_sprints'),
    ]);
    if (seq !== stats.seq) return;
    if (ser.error) throw ser.error;
    if (!lst.error && Array.isArray(lst.data)) stats.sprints = lst.data;
    let d = ser.data;
    let need = !!opts.force || !!(d && d.stale);
    if (!d || !d.data) { d = null; need = true; }   // niente di salvato: la pagina resta in caricamento finché il ricalcolo non torna
    if (d) {
      apply(d);
      stats.cacheFailed = kcFailed(d);
      stats.cachePending = need;
      stats.loading = false;
      render();
    }
    // 2. scaduto, mancante o «Aggiorna»: UNA chiamata di ricalcolo, poi si ridisegna
    if (need) {
      const r = await kpiRecompute('stats_series', scope, !!opts.force || !d);
      if (seq !== stats.seq) return;
      if (r.data) {
        if (!r.data.sprint_curves) throw new Error('Il database non restituisce ancora i dati del primo grafico: manca la migrazione kpi_stats_sprint_curves.');
        apply(r);
        stats.cacheFailed = r.failed;
        stats.cacheFresh = !!r.recomputed;
      } else if (!d) {
        throw new Error(r.error || 'Sprint non trovato');
      } else {
        stats.cacheFailed = true;
      }
      stats.cachePending = false;
    }
    if (!stats.data.sprint_curves) throw new Error('Il database non restituisce ancora i dati del primo grafico: manca la migrazione kpi_stats_sprint_curves.');
  } catch (e) {
    if (seq !== stats.seq) return;
    stats.error = e.message || 'Errore sconosciuto';
    stats.cachePending = false;
    if (!silent) stats.data = null;
  }
  stats.loading = false;
  render();
  stats.cacheFresh = false;
}

function statsOnNav() {
  const old = !stats.lastUpdated || Date.now() - stats.lastUpdated.getTime() > ST_REFRESH_STALE_MS;
  if (!stats.loading && (!stats.data || old)) fetchStats({ silent: !!stats.data });
}

function statsSelectSprint(id) {
  stats.menuOpen = false;
  const pick = (stats.sprints || []).find(s => s.id === id);
  stats.sprintId = pick && pick.predefinito ? null : id;
  fetchStats();
}

// ── GRAFICO: motore (porta di plot() di gen5.py) ──────────────────────
const stN = x => x.toFixed(1);
const stText = (x, y, t, fill, w, anchor) =>
  `<text x="${stN(x)}" y="${stN(y)}" font-size="12" font-weight="${w}" fill="${fill}" text-anchor="${anchor}">${t}</text>`;
const stLine = (x1, y1, x2, y2, c, w = 1) =>
  `<line x1="${stN(x1)}" y1="${stN(y1)}" x2="${stN(x2)}" y2="${stN(y2)}" stroke="${c}" stroke-width="${w}"></line>`;
const stRect = (x, y, w, h, fill) => `<rect x="${stN(x)}" y="${stN(y)}" width="${stN(w)}" height="${stN(h)}" fill="${fill}"></rect>`;
const stDot = (x, y, r, c) => `<circle cx="${stN(x)}" cy="${stN(y)}" r="${r}" fill="${c}"></circle>`;
const stRing = (x, y, r = 5) => `<circle cx="${stN(x)}" cy="${stN(y)}" r="${r}" fill="${ST.CARD}" stroke="${ST.BLU}" stroke-width="3"></circle>`;
const stPoly = (pts, c, sw, dash) =>
  `<polyline points="${pts.map(p => stN(p[0]) + ',' + stN(p[1])).join(' ')}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ''}></polyline>`;

// Tratti continui: si spezza dove il valore manca o non sta nella scala (il punto non si disegna) e dove
// cambia reale/stima (il punto di confine si ripete, così la curva non si interrompe).
function stRuns(pts, ymax, join) {
  const out = []; let cur = null;
  for (const p of pts) {
    if (p.v == null || p.v > ymax + 1e-9 || p.v < -1e-9) { cur = null; continue; }
    if (cur && cur.est === !!p.est) cur.pts.push([p.i, p.v]);
    else {
      const prev = cur && join ? cur.pts[cur.pts.length - 1] : null;
      cur = { est: !!p.est, pts: prev ? [prev, [p.i, p.v]] : [[p.i, p.v]] };
      out.push(cur);
    }
  }
  return out;
}

// Una curva: ogni tratto reale o stimato col suo colore e tratteggio. Ritorna i pezzi SVG e i punti disegnati.
function stCurve(c, runs, spec) {
  let s = '';
  for (const r of runs) {
    const col = r.est ? spec.estColor : spec.color;
    const dash = r.est ? spec.estDash : null;
    if (r.pts.length > 1) s += stPoly(r.pts.map(p => [c.X(p[0]), c.Y(p[1])]), col, spec.sw, dash);
  }
  const dots = [];
  runs.forEach((r, ri) => {
    r.pts.forEach((p, k) => {
      const last = k === r.pts.length - 1;
      const first = k === 0;
      const kind = spec.dot ? spec.dot(p, r, { first, last, k }) : null;
      if (kind) dots.push([p, kind, r]);
    });
  });
  for (const [p, kind, r] of dots) {
    s += kind === 'ring' ? stRing(c.X(p[0]), c.Y(p[1]), 5) : stDot(c.X(p[0]), c.Y(p[1]), 4, r.est ? spec.estColor : spec.color);
  }
  return s;
}

// Assi, griglia e zone. Nessuna scritta dentro l'area del grafico: i valori stanno sui bordi.
function stBase(w, h, o) {
  const ML = 52, MR = 14, mt = 10, mb = 30, nx = o.nx;
  const PW = w - ML - MR, PH = h - mt - mb, ymax = o.ymax;
  const y0 = -0.07 * ymax, y1 = ymax * 1.04;
  const X = i => ML + PW * i / (nx - 1);
  const Y = v => mt + PH * (1 - (v - y0) / (y1 - y0));
  // o.thin: tiene l'ultima etichetta e, andando indietro, solo quelle che hanno spazio (12 px, circa 6,8 px a carattere)
  const labs = !o.thin ? o.labs : o.labs.reduceRight((acc, [i, t]) => {
    const tw = t.length * 6.8, r = i === nx - 1 ? X(i) + MR - 2 : X(i) + tw / 2;
    if (r + 8 <= acc.left) { acc.out.unshift([i, t]); acc.left = r - tw; }
    return acc;
  }, { out: [], left: Infinity }).out;
  const x1 = ML + PW, lab = new Map(labs);
  let s = '';
  if (o.ads != null) s += stRect(ML, mt, X(Math.min(o.ads, nx - 1)) - ML, PH, ST.ADS);
  if (o.fz != null && o.fz < nx - 1) s += stRect(X(o.fz), mt, x1 - X(o.fz), PH, ST.FZ);
  if (o.fz2 != null && o.fz2 < nx - 1) s += stRect(X(o.fz2), mt, x1 - X(o.fz2), PH, ST.FZ2);
  for (const [v] of o.ticks) if (v) s += stLine(ML, Y(v), x1, Y(v), ST.GRID);
  s += stLine(ML, Y(0), x1, Y(0), ST.INK, 1.5);
  for (const [v, l] of o.ticks) s += stText(ML - 8, Y(v) + 4, l, ST.MUT, 600, 'end');
  for (let i = 0; i < nx; i++) s += stLine(X(i), mt + PH, X(i), mt + PH + (lab.has(i) ? 6 : 3), ST.TER);
  for (const [i, t] of labs) {
    const today = t === 'oggi', last = i === nx - 1;
    s += stText(X(i) + (last ? MR - 2 : 0), h - 8, t, today ? ST.INK : ST.MUT, today ? 800 : 600, last ? 'end' : 'middle');
  }
  if (o.par != null && o.par <= ymax) {
    s += `<line x1="${stN(ML)}" y1="${stN(Y(o.par))}" x2="${stN(x1)}" y2="${stN(Y(o.par))}" stroke="${ST.ORA}" stroke-width="3" stroke-linecap="round"></line>`;
  }
  return { s, X, Y, ML, MR, mt, PW, PH, nx, w, h, ymax };
}

const stSvg = (w, h, inner) =>
  `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;font-family:inherit" aria-hidden="true">${inner}</svg>`;

// ── GRAFICO: i sei ────────────────────────────────────────────────────
const ST_PCT = [[0, '0'], [25, '25%'], [50, '50%'], [75, '75%'], [100, '100%']];



const stChanges = vals => vals.map((v, i) => (i > 0 && Math.abs(v - vals[i - 1]) > 1e-9 ? i : -1)).filter(i => i >= 0);


// ── GRAFICO 1: ogni sprint dal primo giorno a maturazione ─────────────
const ST_CMP_COLORS = [ST.PAST12, ST.MUT, ST.TER];
const stCurveName = s => `Sprint ${s.numero} · ${stDM(s.inizio)}–${stDM(s.fine)}`;

// Sprint di confronto: quelli scelti, altrimenti i due che precedono lo sprint in esame.
function stCmpIds(d) {
  const all = d.sprint_curves.sprints, selI = all.findIndex(s => s.selected);
  if (Array.isArray(stats.cmp)) return stats.cmp.filter(id => all.some((s, i) => s.id === id && i !== selI)).slice(-ST_CMP_MAX);
  return all.slice(Math.max(0, selI - 2), Math.max(0, selI)).map(s => s.id);
}
function stCurveSet(d) {
  const all = d.sprint_curves.sprints, sel = all.find(s => s.selected) || all.at(-1), ids = stCmpIds(d);
  const dataRate = d.sprint_curves.rate ?? 0, rate = stats.rate ?? dataRate, g = stats.gross;
  // valore di un punto: (pagato + tasso × prove aperte) / spesa
  const val = p => (p.cs > 0 ? ((g ? p.pg : p.pn) + rate * (g ? p.og : p.on)) / p.cs : null);
  return { all, sel, cmp: all.filter(s => ids.includes(s.id)), val, rate, dataRate, manual: stats.rate != null };
}
function stToggleCmp(id) {
  const cur = stCmpIds(stats.data), i = cur.indexOf(id);
  if (i >= 0) cur.splice(i, 1); else cur.push(id);
  stats.cmp = cur.slice(-ST_CMP_MAX);
  stLsSet(ST_LS.cmp, stats.cmp);
  render();
}

// ── GRAFICO «ROI»: euro per euro sugli stessi giorni ──
// (incassi + tasso × prove in scadenza) / spesa, per data di calendario sulla finestra.
// Stessi totali delle altre schede: il denominatore è tutta la spesa del periodo.
function stBuildSprintDay(w, h, d) {
  const sc = stCurveSet(d), sel = sc.sel, cmp = sc.cmp, rate = sc.rate, g = stats.gross;
  const all = d.sprint_curves.sprints, oggi = d.meta.oggi;
  const W = stWindow(all, sel.inizio, sel.matura, g);
  const nd = Math.max(W.days.length, ...cmp.map(sp => stDayN(sp.matura) - stDayN(sp.inizio) + 1), 2);
  const val = (S, k, r) => {
    const s = S.spend[k], p = S.paid[k], o = S.open[k];
    if (s == null || p == null || o == null) return null;
    if (s > 0) return (p + r * o) / s;
    return (p + o === 0 ? 0 : null);
  };
  const top = Math.max(0, ...W.days.map((dt, k) => val(W, k, rate) ?? 0),
    ...cmp.flatMap(sp => { const C = stWindow(all, sp.inizio, sp.matura, g); return C.days.map((dt, k) => val(C, k, rate) ?? 0); }));
  const stepY = top <= 2 ? 0.5 : 1, ymax = Math.max(1.5, Math.ceil(top / stepY) * stepY);
  const ticks = []; for (let v = 0; v <= ymax + 1e-9; v += 0.5) ticks.push([v, v === 0 ? '0' : (Number.isInteger(v) ? v : stIt(v, 2)) + ' €']);
  const ti = W.days.findIndex(x => x >= oggi);
  const lastSpend = W.days.reduce((a, dt, k) => ((W.spend[k] - (k ? W.spend[k - 1] : 0)) > 0 ? k : a), -1);
  const c = stBase(w, h, { nx: nd, ymax, ticks, par: 1,
    fz: ti > 0 ? ti - 0.5 : null, labs: stDateLabs(W.days), ads: lastSpend >= 0 ? lastSpend + 0.5 : null });
  const pts = W.days.map((dt, k) => ({ i: k, v: val(W, k, rate), est: W.open[k] > 0 }));
  const runs = stRuns(pts, ymax, true);
  let s = c.s;
  cmp.forEach((sp, k) => {
    const col = ST_CMP_COLORS[k % ST_CMP_COLORS.length];
    const C = stWindow(all, sp.inizio, sp.matura, g);
    const cr = stRuns(C.days.map((dt, j) => ({ i: j, v: val(C, j, rate) })), ymax, true);
    s += stCurve(c, cr, { color: col, estColor: col, sw: 2.5, dot: (p, r, e) => e.last && r === cr.at(-1) ? 'dot' : null });
  });
  s += stCurve(c, runs, {
    color: ST.INK, estColor: ST.BLU, estDash: '7 6', sw: 3,
    dot: (p, r, e) => !e.last ? null : (r.est ? (r === runs.at(-1) ? 'ring' : null) : 'dot'),
  });
  return { svg: stSvg(w, h, s), c, nx: nd,
    hov: i => {
      if (i < 0 || i >= W.days.length) return null;
      const v = val(W, i, rate);
      return v == null ? null : { txt: `${stDM(W.days[i])}${W.open[i] > 0 ? ' · stima' : ''} · ${stEuro(v)} € per euro`, v };
    } };
}
const stEuroTick = v => v === 0 ? '€0' : '€' + String(Math.round(v * 100) / 100).replace('.', ',');

// ── PERIODO: aggregati di calendario sulla finestra [inizio, matura] ──
// Gli sprint sovrapposti si spartiscono spesa e incassi (ogni giorno sta in una sola riga,
// ogni utente in una sola): qui si risommano per data di calendario, così spesa e ricavi
// sono contati sugli STESSI giorni. Il confronto allinea le finestre per anzianità, come il ROI.
function stWindowDays(w0, w1) {
  const out = [];
  for (let k = 0; k <= stDayN(w1) - stDayN(w0); k++) out.push(stAddDays(w0, k));
  return out;
}
// cumulato della riga alla data (piatto oltre la maturazione, zero prima dell'inizio)
const stRowCum = (sp, date, key) => {
  const pts = sp.points || [], i = stDayN(date) - stDayN(sp.inizio) + 1;
  if (i < 1 || !pts.length) return 0;
  return pts[Math.min(i, pts.length) - 1][key] ?? 0;
};
// flussi cumulati di calendario su una finestra, sommati su tutte le righe
function stWindow(all, w0, w1, g) {
  const days = stWindowDays(w0, w1), okey = g ? 'og' : 'on', pkey = g ? 'pg' : 'pn';
  const flow = key => {
    const inc = days.map((dt, k) => {
      const pd = k === 0 ? stAddDays(w0, -1) : days[k - 1];
      let v = 0;
      for (const sp of all) v += Math.max(0, stRowCum(sp, dt, key) - stRowCum(sp, pd, key));
      return v;
    });
    let t = 0;
    return inc.map(v => (t += v));
  };
  const spend = flow('cs'), paid = flow(pkey), trials = flow('st');
  const open = days.map(dt => { let o = 0; for (const sp of all) o += stRowCum(sp, dt, okey); return o; });
  return { days, spend, paid, trials, open };
}
// etichette di calendario, diradate se la finestra è lunga
function stDateLabs(days) {
  const n = days.length, step = n > 16 ? 2 : 1, out = [];
  for (let i = 0; i < n; i += step) out.push([i, stDM(days[i])]);
  if (n > 1 && (n - 1) % step !== 0) out.push([n - 1, stDM(days[n - 1])]);
  return out;
}
// cumulati della serie globale {date, paid, ended} dentro la finestra
function stRateWindow(pts, w0, w1) {
  const days = stWindowDays(w0, w1), b0 = stAddDays(w0, -1);
  const at = (dt, key) => { let v = 0; for (const q of pts) { if (q.date <= dt) v = q[key]; else break; } return v; };
  return days.map(dt => ({ date: dt, paid: at(dt, 'paid') - at(b0, 'paid'), ended: at(dt, 'ended') - at(b0, 'ended') }));
}


// ── GRAFICO «Spesa cumulata e incassi»: spesa e ricavi sugli stessi giorni ──
// Spesa Meta e incassi per data di calendario sulla finestra [inizio, matura], sommati su
// tutte le righe: con gli sprint sovrapposti i 116 € si vedono tutti. Solo dati veri.
function stBuildMoney(w, h, d) {
  const sc = stCurveSet(d), sel = sc.sel, cmp = sc.cmp, g = stats.gross;
  const all = d.sprint_curves.sprints;
  const W = stWindow(all, sel.inizio, sel.matura, g);
  const nd = Math.max(W.days.length, 2);
  const top = Math.max(10, W.spend.at(-1) ?? 0, W.paid.at(-1) ?? 0);
  const pow = Math.pow(10, Math.floor(Math.log10(top))), norm = top / pow;
  const ymax = (norm <= 1 ? 1 : norm <= 1.25 ? 1.25 : norm <= 1.5 ? 1.5 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * pow;
  const ticks = [0, ymax / 4, ymax / 2, 3 * ymax / 4, ymax].map(v => [v, stEuroTick(v)]);
  const c = stBase(w, h, { nx: nd, ymax, ticks, labs: stDateLabs(W.days) });
  let s = c.s;
  cmp.forEach((sp, k) => {
    const col = ST_CMP_COLORS[k % ST_CMP_COLORS.length];
    const C = stWindow(all, sp.inizio, sp.matura, g);
    const runs = stRuns(C.paid.map((v, i) => ({ i, v })), ymax, true);
    s += stCurve(c, runs, { color: col, estColor: col, sw: 2.5, dot: (p, r, e) => e.last && r === runs.at(-1) ? 'dot' : null });
  });
  s += stCurve(c, stRuns(W.spend.map((v, i) => ({ i, v })), ymax, true),
    { color: ST.BLU, estColor: ST.BLU, sw: 3, dot: () => 'dot' });
  s += stCurve(c, stRuns(W.paid.map((v, i) => ({ i, v })), ymax, true),
    { color: ST.VER, estColor: ST.VER, sw: 3, dot: () => 'dot' });
  return {
    svg: stSvg(w, h, s), c, nx: nd,
    hov: i => {
      if (i < 0 || i >= W.days.length) return null;
      return { txt: `${stDM(W.days[i])} · spesi ${stEuro(W.spend[i])} € · incassati ${stEuro(W.paid[i])} €`, v: W.spend[i] };
    },
  };
}

// ── GRAFICO «Prove avviate — totale cumulato»: partenze per data di avvio ──
// Conteggi per data di calendario dentro la finestra, sommati su tutte le righe.
function stBuildTrials(w, h, d) {
  const sc = stCurveSet(d), sel = sc.sel, cmp = sc.cmp;
  const all = d.sprint_curves.sprints;
  const W = stWindow(all, sel.inizio, sel.matura, stats.gross);
  const nx = Math.max(W.days.length, 2);
  const top = Math.max(2, W.trials.at(-1) ?? 0, ...cmp.flatMap(sp => stWindow(all, sp.inizio, sp.matura, stats.gross).trials));
  const stepY = top <= 8 ? 2 : top <= 20 ? 4 : top <= 40 ? 8 : 20;
  const ymax = Math.ceil((top + 0.5) / stepY) * stepY;
  const ticks = []; for (let v = 0; v <= ymax; v += stepY) ticks.push([v, String(v)]);
  const c = stBase(w, h, { nx, ymax, ticks, labs: stDateLabs(W.days) });
  const runs = stRuns(W.trials.map((v, i) => ({ i, v })), ymax, true);
  let s = c.s;
  cmp.forEach((sp, k) => {
    const col = ST_CMP_COLORS[k % ST_CMP_COLORS.length];
    const C = stWindow(all, sp.inizio, sp.matura, stats.gross);
    const cr = stRuns(C.trials.map((v, i) => ({ i, v })), ymax, true);
    s += stCurve(c, cr, { color: col, estColor: col, sw: 2.5, dot: (p, r, e) => e.last && r === cr.at(-1) ? 'dot' : null });
  });
  s += stCurve(c, runs, { color: ST.BLU, estColor: ST.BLU, sw: 3, dot: () => 'dot' });
  return { svg: stSvg(w, h, s), c, nx,
    hov: i => (i >= 0 && i < W.days.length)
      ? { txt: `${stDM(W.days[i])} · ${W.trials[i]} ${(W.trials[i] ?? 0) === 1 ? 'prova' : 'prove'}`, v: W.trials[i] } : null };
}

// Soglia delle prove che pagano: sotto il 30% siamo sotto la media (Europa occidentale 29,7%, RevenueCat 2026);
// la media del fitness è il 38%. Nessuna fonte incrocia fitness, Europa e Android.
const ST_RATE_SOGLIA = 30;

// ── GRAFICO «Prove che poi pagano»: solo le prove finite nel periodo ──
// Cumulato delle conclusioni (pagamenti, scadenze, disdette) con data di fine dentro la
// finestra: la stessa regola degli altri grafici. Soglia del 30% come prima.
function stBuildRate(w, h, d) {
  const sc = stCurveSet(d), sel = sc.sel, cmp = sc.cmp;
  const R = stRateWindow(d.trial_rate.points, sel.inizio, sel.matura);
  const real = (d.expected_payers && d.expected_payers.real) || [];
  const atS = dt => { let v = 0; for (const p of real) { if (p.date <= dt) v = p.started; else break; } return v; };
  const b0 = stAddDays(sel.inizio, -1);
  const tot = atS(sel.matura) - atS(b0);
  const starts = R.map(r => atS(r.date) - atS(b0));
  const nd = Math.max(R.length, 2);
  const c = stBase(w, h, { nx: nd, ymax: 100, ticks: ST_PCT, par: ST_RATE_SOGLIA, labs: stDateLabs(R.map(r => r.date)) });
  const pp = (r, t) => (t > 0 ? 100 * r.paid / t : null);
  const lp = (r, t) => (t > 0 ? 100 * Math.max(0, r.ended - r.paid) / t : null);
  const pts = R.map((r, i) => ({ i, v: pp(r, tot) }));
  const ch = new Set(stChanges(pts.map(p => p.v ?? 0)));
  const runs = stRuns(pts, 100, false);
  let s = c.s + stCurve(c, runs, { color: ST.VER, estColor: ST.VER, sw: 3, dot: (p, r, e) => (ch.has(p[0]) || (e.last && r === runs.at(-1))) ? 'dot' : null });
  const rl = stRuns(R.map((r, i) => ({ i, v: lp(r, tot) })), 100, false);
  s += stCurve(c, rl, { color: ST.MUT, estColor: ST.MUT, sw: 2.5, dot: (p, r, e) => e.last && r === rl.at(-1) ? 'dot' : null });
  cmp.forEach((sp, k) => {
    const col = ST_CMP_COLORS[k % ST_CMP_COLORS.length];
    const C = stRateWindow(d.trial_rate.points, sp.inizio, sp.matura);
    const t2 = atS(sp.matura) - atS(stAddDays(sp.inizio, -1));
    const cr = stRuns(C.map((r, i) => ({ i, v: pp(r, t2) })), 100, false);
    s += stCurve(c, cr, { color: col, estColor: col, sw: 2.5, dot: (p, r, e) => e.last && r === cr.at(-1) ? 'dot' : null });
  });
  return { svg: stSvg(w, h, s), c, nx: nd,
    hov: i => { const r = R[i]; if (!r || tot <= 0) return null;
      const open = Math.max(0, starts[i] - r.ended);
      return { txt: `${stDM(r.date)} · ${r.paid} pagate · ${Math.max(0, r.ended - r.paid)} perse · ${open} aperte (su ${tot})`, v: pp(r, tot) }; } };
}

// ── PAGINA ────────────────────────────────────────────────────────────
function stLgd(c, txt, dash) {
  return `<div class="st-lg"><svg width="26" height="12" aria-hidden="true"><line x1="2" y1="6" x2="24" y2="6" stroke="${c}" stroke-width="3" stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ''}></line></svg><span>${txt}</span></div>`;
}
const stLgRect = (fill, txt) =>
  `<div class="st-lg"><svg width="20" height="12" aria-hidden="true"><rect x="1" y="1" width="18" height="10" rx="3" fill="${fill}" stroke="${ST.GRID}" stroke-width="1"></rect></svg><span>${txt}</span></div>`;

function stCardHtml(o) {
  return `
    <div class="st-card${o.big ? ' st-big' : ''}${o.legend ? ' st-has-leg' : ''}" data-st-card="${o.key}">
      <div class="st-title">${o.title}</div>
      <div class="st-num" style="color:${o.color || ST.INK}">${o.num}</div>
      <div class="st-cap" title="${String(o.cap).replace(/"/g, '&quot;')}">${o.cap}</div>
      ${o.tools || ''}
      ${o.legend ? `<div class="st-legend">${o.legend}</div>` : ''}
      <div class="st-readout" data-st-readout></div>
      <div class="st-chart" data-st-chart="${o.key}">${o.skeleton ? '<div class="st-sk st-sk-chart"></div>' : ''}</div>
    </div>`;
}

function stSkeletonCard(key, title, big) {
  return `
    <div class="st-card${big ? ' st-big' : ''}" data-st-card="${key}">
      <div class="st-title">${title}</div>
      <div class="st-sk st-sk-num"></div><div class="st-sk st-sk-cap"></div>
      <div class="st-chart"><div class="st-sk st-sk-chart"></div></div>
    </div>`;
}

const ST_TITLES = {
  money: 'Spesa cumulata e incassi', trials: 'Prove avviate — totale cumulato',
  sprint: 'ROI', rate: 'Prove che poi pagano',
};
const ST_ORDER = ['money', 'trials', 'sprint', 'rate'];
const ST_BIG = ['money', 'trials', 'sprint'];

function stCards(d) {
  const cs = stCurveSet(d), sel = cs.sel;
  const c = {};
  // Spesa e incassi per data di calendario sulla finestra: gli stessi giorni per tutti.
  {
    const g = stats.gross;
    const W = stWindow(d.sprint_curves.sprints, sel.inizio, sel.matura, g);
    const spend = W.spend.at(-1) ?? 0, earn = W.paid.at(-1) ?? 0;
    const div = earn - spend, kind = g ? 'lordi' : 'netti';
    const per = `periodo ${stDM(sel.inizio)}–${stDM(sel.matura)}`;
    c.money = { num: stEuro(div) + ' €', color: ST.INK,
      cap: `il divario fra investimento e ricavi · ${stEuro(spend)} € spesi, ${stEuro(earn)} € incassati ${kind} · ${per}` };
    c.money.legend = [stLgd(ST.BLU, 'Spesa ads cumulata'), stLgd(ST.VER, `Incassi ${kind} cumulati`),
      ...cs.cmp.map((x, k) => stLgd(ST_CMP_COLORS[k % ST_CMP_COLORS.length], stCurveName(x) + ' · incassi'))].join('');
  }
  // Prove avviate per data di avvio dentro la finestra.
  {
    const W = stWindow(d.sprint_curves.sprints, sel.inizio, sel.matura, stats.gross);
    const tot = W.trials.at(-1) ?? 0;
    const per = `periodo ${stDM(sel.inizio)}–${stDM(sel.matura)}`;
    c.trials = { num: String(tot), color: ST.INK, cap: `prove avviate nel ${per}` };
    c.trials.legend = [stLgd(ST.BLU, 'Prove avviate'),
      ...cs.cmp.map((x, k) => stLgd(ST_CMP_COLORS[k % ST_CMP_COLORS.length], stCurveName(x)))].join('');
  }
  // Euro per euro sugli stessi giorni delle altre schede: stesso denominatore.
  {
    const W = stWindow(d.sprint_curves.sprints, sel.inizio, sel.matura, stats.gross);
    const hasOpen = (W.open.at(-1) ?? 0) > 0;
    const ti = W.days.findIndex(x => x >= d.meta.oggi);
    const fval = k => { const s = W.spend[k], p = W.paid[k], o = W.open[k]; return s > 0 ? (p + cs.rate * o) / s : ((p + o === 0) ? 0 : null); };
    const finals = W.days.map((dt, k) => fval(k)).filter(v => v != null);
    const fv = finals.at(-1);
    const per = `periodo ${stDM(sel.inizio)}–${stDM(sel.matura)}`;
    c.sprint = fv == null ? { num: '–', cap: `nessuna spesa ancora · ${per}`, color: ST.INK }
      : { num: stEuro(fv) + ' €', color: hasOpen ? ST.BLU : ST.INK,
          cap: `${hasOpen ? 'stima a maturazione' : 'reale'}${cs.manual ? ` · tasso a mano ${stPct(cs.rate * 100)}` : ''} · ${stEuro(W.paid.at(-1) ?? 0)} € pagati su ${stEuro(W.spend.at(-1) ?? 0)} € spesi · ${per}` };
    c.sprint.legend = [
      ...(hasOpen ? [stLgd(ST.INK, 'pagato'), stLgd(ST.BLU, 'stima', '6 5')] : [stLgd(ST.INK, stCurveName(sel))]),
      ...cs.cmp.map((x, k) => stLgd(ST_CMP_COLORS[k % ST_CMP_COLORS.length], stCurveName(x))),
      stLgd(ST.ORA, 'pareggio'), stLgRect(ST.ADS, 'pubblicità'), ...(ti > 0 ? [stLgRect(ST.FZ, 'da oggi')] : []),
    ].join('');
  }

  const Rw = stRateWindow(d.trial_rate.points, sel.inizio, sel.matura).at(-1) ?? { paid: 0, ended: 0 };
  const Rreal = (d.expected_payers && d.expected_payers.real) || [];
  const RatS = dt => { let v = 0; for (const p of Rreal) { if (p.date <= dt) v = p.started; else break; } return v; };
  const Rb0 = stAddDays(sel.inizio, -1);
  const Rtot = RatS(sel.matura) - RatS(Rb0);
  const Rlost = Math.max(0, Rw.ended - Rw.paid), Ropen = Math.max(0, Rtot - Rw.ended);
  c.rate = Rtot > 0 ? { num: stPct(100 * Rw.paid / Rtot), cap: `${Rw.paid} pagate su ${Rtot} avviate nel periodo · ${Rlost} concluse senza pagare · ${Ropen} ancora aperte · soglia ${ST_RATE_SOGLIA}%`, color: ST.INK }
                    : { num: '–', cap: `nessuna prova avviata nel periodo · soglia ${ST_RATE_SOGLIA}%`, color: ST.INK };
  c.rate.legend = [stLgd(ST.VER, 'pagate'), stLgd(ST.MUT, 'concluse senza pagare'), stLgd(ST.ORA, 'soglia'),
    ...cs.cmp.map((x, k) => stLgd(ST_CMP_COLORS[k % ST_CMP_COLORS.length], stCurveName(x)))].join('');

  return { c };
}

// Barra globale sopra i grafici: quanto vale un abbonamento, tasso di conversione e sprint di confronto.
// Vale per tutti i grafici per sprint (tasse anche per quelli in euro, tasso per il ROI).
function stToolbarHtml(d, cs) {
  const val = d.sprint_curves.value, ids = cs.cmp.map(s => s.id);
  const seg = (on, g, txt, tip) => `<button class="st-segb${on ? ' st-on' : ''}" data-st-gross="${g}" aria-pressed="${on}" title="${tip}">${txt}</button>`;
  const opts = cs.all.filter(s => s.id !== cs.sel.id).reverse().map(s => `
      <button class="st-opt${ids.includes(s.id) ? ' st-sel' : ''}" role="option" aria-selected="${ids.includes(s.id)}" data-st-cmp="${s.id}">
        <span class="st-optdot"></span><span class="st-optl">Sprint ${s.numero}</span><span class="st-optd">${stDM(s.inizio)}–${stDM(s.fine)}</span>
      </button>`).join('');
  return `<div class="st-bar">
      <div class="st-seg" role="group" aria-label="Valore di un abbonamento">
        ${seg(!stats.gross, 0, 'Con tasse', `Tolte IVA e commissione di Google: un annuale ci lascia ${stEuro(val.net_year)} €`)}
        ${seg(stats.gross, 1, 'Senza tasse', `Senza togliere niente: un annuale vale il prezzo pieno, ${stEuro(val.gross_year)} €`)}
      </div>
      <label class="st-rate${cs.manual ? ' st-manual' : ''}" title="Quante prove finite diventano pagamenti. Dai dati: ${stPct(cs.dataRate * 100)}. Vale per il ROI">
        <span>Tasso</span><input id="st-rate-in" type="number" min="0" max="100" step="1" inputmode="decimal" value="${Math.round(cs.rate * 1000) / 10}" aria-label="Tasso di fine prova, in percentuale"><span>%</span>
      </label>
      ${cs.manual ? `<button class="st-rate-reset" id="st-rate-reset" title="Torna al tasso calcolato dai dati">dai dati ${stPct(cs.dataRate * 100)}</button>` : ''}
      <div class="st-cmpwrap">
        <button class="st-pill st-pill-sel" id="st-cmp-btn" aria-haspopup="listbox" aria-expanded="${stats.cmpOpen}" title="Scegli gli sprint di confronto, al massimo ${ST_CMP_MAX}">
          <span>Confronta${ids.length ? ' · ' + ids.length : ''}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
        </button>${stats.cmpOpen ? `<div class="st-menu st-menu-r" role="listbox" aria-multiselectable="true" aria-label="Sprint di confronto">${opts}</div>` : ''}
      </div>
    </div>`;
}

function stSprintLabel(s, withDates) {
  const cv = stats.data && stats.data.sprint_curves.sprints.find(x => x.id === s.id);
  const g = cv ? (cv.today_day != null ? `giorno ${cv.today_day} di ${cv.days}` : 'chiuso')
               : (s.in_corso ? `giorno ${s.giorno} di ${s.durata}` : 'chiuso');
  const fine = cv ? cv.fine : s.fine;
  return `Sprint ${s.numero} · ${g}${withDates ? ` · ${stDM(s.inizio)}–${stDM(fine)}` : ''}`;
}

function stMenuHtml() {
  const list = stats.sprints || (stats.data ? [stats.data.meta.sprint] : []);
  const cur = stats.data ? stats.data.meta.sprint.id : null;
  return `<div class="st-menu" role="listbox" aria-label="Scegli lo sprint" tabindex="-1">${list.map((s, i) => `
      <button class="st-opt${i === stats.menuIdx ? ' st-act' : ''}${s.id === cur ? ' st-sel' : ''}" role="option" aria-selected="${s.id === cur}" data-st-opt="${s.id}" data-st-i="${i}">
        <span class="st-optdot"></span><span class="st-optl">${stSprintLabel(s)}</span><span class="st-optd">${stDM(s.inizio)}–${stDM(s.fine)}</span>
      </button>`).join('')}</div>`;
}

function stHeader() {
  const sp = stats.data && stats.data.meta.sprint;
  const at = stats.computedAt;
  const upd = !at ? '' : kcMark({ computedAt: at, pending: stats.cachePending, failed: stats.cacheFailed, fresh: stats.cacheFresh });
  const pill = sp
    ? `<div class="st-pillwrap">
         <button class="st-pill st-pill-sel" id="st-sprint-btn" aria-haspopup="listbox" aria-expanded="${stats.menuOpen}" title="Scegli lo sprint">
           <span>${stSprintLabel(sp, true)}</span>
           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
         </button>${stats.menuOpen ? stMenuHtml() : ''}
       </div>${sp.open_trials > 0 ? `<div class="st-pill st-pill-blue">${sp.open_trials} ${sp.open_trials === 1 ? 'prova aperta' : 'prove aperte'}</div>` : ''}`
    : `<div class="st-sk st-sk-pill"></div>`;
  return `<div class="st-head">
      <button class="nav-toggle nav-toggle-desk" data-nav-toggle title="Mostra il menu" aria-label="Mostra il menu">${NAV_PANEL_ICON}</button>
      <h1 class="st-h1">Stats</h1>${pill}
      <div class="st-grow"></div>
      <div class="st-meta">${stats.loading ? 'Caricamento…' : upd}</div>
      <button class="st-refresh" id="st-refresh-btn" ${stats.loading || stats.cachePending ? 'disabled' : ''}>Aggiorna</button>
    </div>`;
}

function stErrorHtml(msg) {
  return `<div class="st-errwrap"><div class="st-err">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${ST.ORA}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/></svg>
      <div class="st-err-t">Errore nel caricamento</div>
      <div class="st-err-m">${esc(msg)}</div>
      <button class="st-err-btn" id="st-err-btn">Aggiorna</button>
    </div></div>`;
}

function pageStats() {
  let body;
  if (stats.error && !stats.data) body = stErrorHtml(stats.error);
  else if (!stats.data) body = `<div class="st-grid">${ST_ORDER.map(k => stSkeletonCard(k, ST_TITLES[k], ST_BIG.includes(k))).join('')}</div>`;
  else {
    const { c } = stCards(stats.data);
    const cs = stCurveSet(stats.data);
    body = stToolbarHtml(stats.data, cs) + `<div class="st-grid">${ST_ORDER.map(k => stCardHtml({ key: k, big: ST_BIG.includes(k), title: ST_TITLES[k], ...c[k] })).join('')}</div>`;
    if (stats.error) body = `<div class="st-banner">Aggiornamento non riuscito: ${esc(stats.error)}</div>` + body;
  }
  return `<div class="st-page" id="st-page">${stHeader()}${body}</div>`;
}

// ── DISEGNO E PASSAGGIO DEL MOUSE ─────────────────────────────────────
const ST_BUILD = { money: stBuildMoney, trials: stBuildTrials, sprint: stBuildSprintDay, rate: stBuildRate };

function stFitBig() {
  document.querySelectorAll('.st-card.st-big.st-has-leg').forEach(card => {
  const cap = card.querySelector('.st-cap'), leg = card.querySelector('.st-legend'), chart = card.querySelector('.st-chart');
  leg.style.top = chart.style.top = card.style.height = '';
  const narrow = window.matchMedia('(max-width: 900px)').matches;
  const legTop = narrow ? leg.offsetTop : Math.max(leg.offsetTop, cap.offsetTop + cap.offsetHeight + 8);
  const need = legTop + leg.offsetHeight + 14, grow = need - chart.offsetTop;
  if (legTop !== leg.offsetTop) leg.style.top = legTop + 'px';
  if (grow > 0) { card.style.height = card.offsetHeight + grow + 'px'; chart.style.top = need + 'px'; }
  });
}

function drawStatsCharts() {
  statsCharts = [];
  if (!stats.data) return;
  stFitBig();
  document.querySelectorAll('[data-st-chart]').forEach(el => {
    const key = el.dataset.stChart, w = Math.round(el.clientWidth), h = Math.round(el.clientHeight);
    if (!w || !h || !ST_BUILD[key]) return;
    let ch;
    try { ch = ST_BUILD[key](w, h, stats.data); } catch (e) { console.error('stats chart', key, e); return; }
    el.innerHTML = ch.svg + '<div class="st-guide"></div><div class="st-mark"></div>';
    statsCharts.push({ el, ch, card: el.closest('.st-card') });
  });
}

function stHover(entry, ev) {
  const { el, ch, card } = entry, c = ch.c;
  const r = el.getBoundingClientRect(), x = ev.clientX - r.left;
  const guide = el.querySelector('.st-guide'), mark = el.querySelector('.st-mark'), pill = card.querySelector('[data-st-readout]');
  const inside = x >= c.ML - 6 && x <= c.ML + c.PW + 6 && ev.clientY - r.top <= c.mt + c.PH + 4;
  const i = Math.max(0, Math.min(c.nx - 1, Math.round((x - c.ML) / c.PW * (c.nx - 1))));
  const hv = inside ? ch.hov(i) : null;
  if (!hv) { stHoverOff(entry); return; }
  guide.style.cssText = `display:block;left:${c.X(i) - 0.75}px;top:${c.mt}px;height:${c.PH}px`;
  if (hv.v != null && hv.v >= 0 && hv.v <= c.ymax) mark.style.cssText = `display:block;left:${c.X(i) - 14}px;top:${c.Y(hv.v) - 14}px`;
  else mark.style.display = 'none';
  pill.textContent = hv.txt; pill.classList.add('st-on');
}

function stHoverOff(entry) {
  entry.el.querySelectorAll('.st-guide,.st-mark').forEach(n => { n.style.display = 'none'; });
  entry.card.querySelector('[data-st-readout]').classList.remove('st-on');
}

let stResizeObs = null;
function attachStatsEvents() {
  if (state.page !== 'stats') { if (stResizeObs) { stResizeObs.disconnect(); stResizeObs = null; } return; }
  document.getElementById('st-sprint-btn')?.addEventListener('click', ev => {
    ev.stopPropagation();
    stats.menuOpen = !stats.menuOpen; stats.cmpOpen = false;
    stats.menuIdx = Math.max(0, (stats.sprints || []).findIndex(s => stats.data && s.id === stats.data.meta.sprint.id));
    render();
  });
  document.getElementById('st-sprint-btn')?.addEventListener('keydown', ev => {
    if (ev.key === 'ArrowDown' && !stats.menuOpen) { ev.preventDefault(); ev.target.click(); }
  });
  document.querySelectorAll('[data-st-opt]').forEach(b => {
    b.addEventListener('click', ev => { ev.stopPropagation(); statsSelectSprint(b.dataset.stOpt); });
    b.addEventListener('mouseenter', () => { stats.menuIdx = +b.dataset.stI; document.querySelectorAll('.st-opt').forEach(o => o.classList.toggle('st-act', o === b)); });
  });
  document.querySelectorAll('[data-st-gross]').forEach(b => b.addEventListener('click', () => {
    stats.gross = b.dataset.stGross === '1'; stLsSet(ST_LS.gross, stats.gross); render();
  }));
  document.getElementById('st-rate-in')?.addEventListener('change', ev => {
    const v = parseFloat(String(ev.target.value).replace(',', '.')), dr = stats.data.sprint_curves.rate ?? 0;
    stats.rate = Number.isFinite(v) && Math.abs(v / 100 - dr) > 0.0005 ? Math.min(100, Math.max(0, v)) / 100 : null;
    render();
  });
  document.getElementById('st-rate-reset')?.addEventListener('click', () => { stats.rate = null; render(); });
  document.getElementById('st-cmp-btn')?.addEventListener('click', ev => { ev.stopPropagation(); stats.cmpOpen = !stats.cmpOpen; stats.menuOpen = false; render(); });
  document.querySelectorAll('[data-st-cmp]').forEach(b => b.addEventListener('click', ev => { ev.stopPropagation(); stToggleCmp(b.dataset.stCmp); }));
  const refresh = () => fetchStats({ keepData: true, force: true });
  document.getElementById('st-refresh-btn')?.addEventListener('click', refresh);
  document.getElementById('st-err-btn')?.addEventListener('click', refresh);

  drawStatsCharts();
  statsCharts.forEach(entry => {
    entry.el.addEventListener('mousemove', ev => stHover(entry, ev));
    entry.el.addEventListener('mouseleave', () => stHoverOff(entry));
  });
  const pageEl = document.getElementById('st-page');
  if (stResizeObs) stResizeObs.disconnect();
  if (pageEl && 'ResizeObserver' in window) {
    let lastW = pageEl.clientWidth, t = null;
    stResizeObs = new ResizeObserver(() => {
      if (pageEl.clientWidth === lastW) return;
      lastW = pageEl.clientWidth; clearTimeout(t);
      t = setTimeout(() => { drawStatsCharts(); statsCharts.forEach(entry => {
        entry.el.addEventListener('mousemove', ev => stHover(entry, ev));
        entry.el.addEventListener('mouseleave', () => stHoverOff(entry)); }); }, 80);
    });
    stResizeObs.observe(pageEl);
  }
}

// Menu dello sprint: Esc chiude, frecce scorrono, Invio sceglie; un clic fuori chiude.
document.addEventListener('keydown', ev => {
  if (stats.cmpOpen && state.page === 'stats' && ev.key === 'Escape') { ev.preventDefault(); stats.cmpOpen = false; render(); document.getElementById('st-cmp-btn')?.focus(); return; }
  if (!stats.menuOpen || state.page !== 'stats') return;
  const list = stats.sprints || [];
  if (ev.key === 'Escape') { ev.preventDefault(); stats.menuOpen = false; render(); document.getElementById('st-sprint-btn')?.focus(); }
  else if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
    ev.preventDefault();
    stats.menuIdx = (stats.menuIdx + (ev.key === 'ArrowDown' ? 1 : -1) + list.length) % Math.max(list.length, 1);
    document.querySelectorAll('.st-opt').forEach((o, i) => o.classList.toggle('st-act', i === stats.menuIdx));
  } else if (ev.key === 'Enter') {
    const s = list[stats.menuIdx]; if (s) { ev.preventDefault(); statsSelectSprint(s.id); }
  }
});
document.addEventListener('click', ev => {
  if (stats.menuOpen && !ev.target.closest('.st-pillwrap')) { stats.menuOpen = false; render(); }
  else if (stats.cmpOpen && !ev.target.closest('.st-cmpwrap')) { stats.cmpOpen = false; render(); }
});
