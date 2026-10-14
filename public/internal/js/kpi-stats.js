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
  menuOpen: false, menuIdx: 0, grpOpen: null,
  scopeKey: null,   // gruppo (g:15) o dettaglio di riga (r:uuid); null = default dal server
  seq: 0,
  gross: false,         // globale «Con tasse / Senza tasse» dalla barra sopra i grafici: false = resa netta (20,90 €), true = prezzo pieno (29,99 €). Vale per i grafici in euro
  tax: false,           // «IRES + IRAP» dalla barra, solo con «Con tasse»: toglie il 27,9% del guadagno dove gli incassi netti superano la spesa
  cmp: null,            // globale «Confronta» dalla barra: id degli sprint di confronto scelti; null = i due precedenti. Vale per i grafici per sprint
  cmpOpen: false,
  rate: null,           // globale «Tasso» dalla barra: tasso di fine prova impostato a mano (0..1); null = quello dei dati. Vale per il ROI e le proiezioni. Non si ricorda fra le visite
  proj: true,           // globale «Con proiezione»: assi estesi all'ultima scadenza, stime col tasso
};
const ST_LS = { gross: 'kpi.stats.gross', tax: 'kpi.stats.tax', cmp: 'kpi.stats.compare', proj: 'kpi.stats.proj', scope: 'kpi.stats.scope' };
const stLsGet = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
const stLsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* senza memoria la scelta vale per la visita */ } };
stats.gross = stLsGet(ST_LS.gross) === true;
stats.tax = stLsGet(ST_LS.tax) === true;
// IRES 24% + IRAP 3,9%: si pagano sull'utile, quindi solo sulla parte di incassi netti che supera la spesa
const ST_PROFIT_TAX = 0.279;
const stProfitTax = (earn, spend) => (stats.tax && !stats.gross && earn > spend ? ST_PROFIT_TAX * (earn - spend) : 0);
const stAfterTax = (earn, spend) => earn - stProfitTax(earn, spend);
stats.proj = stLsGet(ST_LS.proj) !== false;
{ const c = stLsGet(ST_LS.cmp); if (Array.isArray(c)) stats.cmp = c; }
stLoadScope();
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
  if (!stats.sprints) {
    // primo giro: serve l'elenco per convalidare il gruppo salvato prima di chiedere i dati
    try { const l = await sb.rpc('kpi_stats_sprints'); if (!l.error && Array.isArray(l.data)) stats.sprints = l.data; } catch (e) { /* riprova sotto */ }
  }
  stSanitizeScope();
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
    // giro automatico o ritorno sulla pagina: un valore più vecchio di 5 minuti si ricalcola, come fa l'Overview
    const aged = !!opts.fresh && !!(d && d.computed_at) && Date.now() - new Date(d.computed_at).getTime() > ST_REFRESH_STALE_MS;
    const force = !!opts.force || aged;
    let need = force || !!(d && d.stale);
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
      const r = await kpiRecompute('stats_series', scope, force || !d);
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
  if (!stats.loading && (!stats.data || old)) fetchStats({ silent: !!stats.data, fresh: true });
}

function statsSelectSprint(id) {  // dettaglio di riga
  stats.menuOpen = false; stats.grpOpen = null;
  const pick = (stats.sprints || []).find(s => s.id === id);
  if (!pick) return;
  stats.scopeKey = 'r:' + id; stats.sprintId = id;
  stSaveScope(); fetchStats();
}

// ── GRUPPI: righe con stesso numero = un esperimento ──
// Il selettore mostra un gruppo solo; il dettaglio di riga resta scegliibile.
const stGroupKey = s => (s.numero == null ? 'r:' + s.id : 'g:' + s.numero);
function stGroups(list) {
  const map = new Map();
  for (const s of list || []) {
    const k = stGroupKey(s);
    if (!map.has(k)) map.set(k, { key: k, numero: s.numero, rows: [] });
    map.get(k).rows.push(s);
  }
  const out = [...map.values()];
  out.forEach(gr => {
    gr.rows.sort((a, b) => (a.inizio < b.inizio ? 1 : a.inizio > b.inizio ? -1 : 0));
    gr.w0 = gr.rows.at(-1).inizio;
    gr.fine = gr.rows.map(s => s.fine).sort().at(-1);
  });
  out.sort((a, b) => (a.w0 < b.w0 ? 1 : a.w0 > b.w0 ? -1 : 0));
  return out;
}
function stRepRow(gr) {
  const rs = [...gr.rows].sort((a, b) => (a.fine < b.fine ? 1 : a.fine > b.fine ? -1 : (a.inizio < b.inizio ? 1 : -1)));
  return rs[0];
}
// finestra in esame: dettaglio di riga oppure unione del gruppo
function stScope(d) {
  const list = stats.sprints || [];
  const curves = (d && d.sprint_curves.sprints) || [];
  const mat = id => { const x = curves.find(y => y.id === id); return (x && x.matura) || null; };
  if (stats.scopeKey && stats.scopeKey[0] === 'r') {
    const id = stats.scopeKey.slice(2);
    const s = list.find(x => x.id === id) || ((d && d.meta.sprint.id === id) ? d.meta.sprint : null);
    if (s) return { kind: 'row', key: stats.scopeKey, rows: [s], row: s, w0: s.inizio, w1: mat(s.id) || s.fine };
  }
  const groups = stGroups(list.length ? list : (d ? [d.meta.sprint] : []));
  const gr = (stats.scopeKey && stats.scopeKey[0] === 'g' && groups.find(g => g.key === stats.scopeKey))
    || groups.find(g => g.rows.some(s => d && s.id === d.meta.sprint.id)) || groups[0] || null;
  if (!gr) return null;
  return { kind: 'group', key: gr.key, rows: gr.rows, numero: gr.numero, w0: gr.w0,
    w1: gr.rows.map(s => mat(s.id) || s.fine).sort().at(-1), fine: gr.fine };
}
function stScopeLabel() {
  const S = stats.data && stScope(stats.data);
  if (!S) return '';
  const t = stats.data.meta.oggi;
  const g = (t >= S.w0 && t <= S.w1) ? `giorno ${stDayN(t) - stDayN(S.w0) + 1} di ${stDayN(S.w1) - stDayN(S.w0) + 1}` : 'chiuso';
  if (S.kind === 'row') return `${stSprintLabel(S.row, true)} · dettaglio`;
  const name = S.numero != null ? `Sprint ${S.numero}` : S.rows[0].nome;
  return `${name} · ${g} · ${stDM(S.w0)}–${stDM(S.fine)}`;
}
// voce di menu piatta (gruppi espandibili) per mouse e tastiera
function stMenuItems() {
  const groups = stGroups(stats.sprints || (stats.data ? [stats.data.meta.sprint] : []));
  const S = stats.data ? stScope(stats.data) : null;
  const out = [];
  groups.forEach(gr => {
    const multi = gr.rows.length > 1;
    if (!multi) {
      const s = gr.rows[0];
      out.push({ type: 'row', key: 'r:' + s.id, s, sel: S && S.key === 'r:' + s.id });
      return;
    }
    out.push({ type: 'group', key: gr.key, gr, sel: S && S.kind === 'group' && S.key === gr.key });
    if (stats.grpOpen === gr.key) {
      gr.rows.forEach(s => {
        out.push({ type: 'row', key: 'r:' + s.id, s, sub: true, sel: S && S.kind === 'row' && S.key === 'r:' + s.id });
      });
    }
  });
  return out;
}
function stSaveScope() { stLsSet(ST_LS.scope, stats.scopeKey); }
function stLoadScope() {
  const k = stLsGet(ST_LS.scope);
  stats.scopeKey = typeof k === 'string' ? k : null;
}
function stSanitizeScope() {
  const list = stats.sprints || [];
  if (stats.scopeKey && !(stGroups(list).some(g => g.key === stats.scopeKey)
    || list.some(s => 'r:' + s.id === stats.scopeKey))) stats.scopeKey = null;
  stats.sprintId = stScopeRpcId();
}
function stScopeRpcId() {
  const list = stats.sprints || [];
  if (!stats.scopeKey) return null;
  if (stats.scopeKey[0] === 'r') {
    const id = stats.scopeKey.slice(2);
    return list.some(s => s.id === id) ? id : null;
  }
  const gr = stGroups(list).find(g => g.key === stats.scopeKey);
  if (!gr) return null;
  if (gr.rows.some(s => s.predefinito)) return null;
  return stRepRow(gr).id;
}
function statsSelectGroup(key) {
  stats.menuOpen = false; stats.grpOpen = null;
  const gr = stGroups(stats.sprints || []).find(g => g.key === key);
  if (!gr) return;
  stats.scopeKey = key;
  stats.sprintId = stScopeRpcId();
  stSaveScope(); fetchStats();
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
  const val = p => (p.cs > 0 ? stAfterTax((g ? p.pg : p.pn) + rate * (g ? p.og : p.on), p.cs) / p.cs : null);
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
  const AE = stAxisEnd(d);
  const S = stScope(d);
  const w1 = stats.proj ? AE : (S.w1 < oggi ? S.w1 : oggi);
  const W = stWindow(stRowsOf(d, S), S.w0, w1, g);
  const dc = stHasDc(all);
  const wins = cmp.map(sp => stWindow([sp], sp.inizio, stats.proj ? AE : (sp.matura < oggi ? sp.matura : oggi), g));
  const nd = Math.max(W.days.length, ...wins.map(C => C.days.length), 2);
  const val = (S, k, r) => {
    const s = S.spend[k], p = S.paid[k], o = S.open[k];
    if (s == null || p == null || o == null) return null;
    if (s > 0) return stAfterTax(p + r * o, s) / s;
    return (p + o === 0 ? 0 : null);
  };
  const top = Math.max(0, ...W.days.map((dt, k) => val(W, k, rate) ?? 0),
    ...wins.flatMap(C => C.days.map((dt, k) => val(C, k, rate) ?? 0)));
  const stepY = top <= 2 ? 0.5 : 1, ymax = Math.max(1.5, Math.ceil(top / stepY) * stepY);
  const ticks = []; for (let v = 0; v <= ymax + 1e-9; v += 0.5) ticks.push([v, v === 0 ? '0' : (Number.isInteger(v) ? v : stIt(v, 2)) + ' €']);
  const ti = W.days.findIndex(x => x >= oggi);
  const lastSpend = W.days.reduce((a, dt, k) => ((W.spend[k] - (k ? W.spend[k - 1] : 0)) > 0 ? k : a), -1);
  const c = stBase(w, h, { nx: nd, ymax, ticks, par: 1,
    fz: ti > 0 ? ti - 0.5 : null, labs: stDateLabs(W.days), ads: lastSpend >= 0 ? lastSpend + 0.5 : null });
  const pts = W.days.map((dt, k) => ({ i: k, v: val(W, k, rate), est: W.open[k] > 0 || dt > oggi }));
  const runs = stRuns(pts, ymax, true);
  let s = c.s;
  cmp.forEach((sp, k) => {
    const col = ST_CMP_COLORS[k % ST_CMP_COLORS.length], C = wins[k];
    const cr = stRuns(C.days.map((dt, j) => ({ i: j, v: val(C, j, rate), est: C.days[j] > oggi })), ymax, true);
    s += stCurve(c, cr, { color: col, estColor: col, estDash: '7 6', sw: 2.5, dot: (p, r, e) => e.last && r === cr.at(-1) ? 'dot' : null });
  });
  s += stCurve(c, runs, {
    color: ST.INK, estColor: ST.BLU, estDash: '7 6', sw: 3,
    dot: (p, r, e) => !e.last ? null : (r.est ? (r === runs.at(-1) ? 'ring' : null) : 'dot'),
  });
  return { svg: stSvg(w, h, s), c, nx: nd,
    hov: i => {
      if (i < 0 || i >= W.days.length) return null;
      const v = val(W, i, rate);
      if (v == null) return null;
      const ab = dc ? ` · ${W.offers[i]} ${(W.offers[i] ?? 0) === 1 ? 'offerta' : 'offerte'}` : '';
      return { txt: `${stDM(W.days[i])}${W.open[i] > 0 && W.days[i] <= oggi ? ' · stima' : ''} · ${stEuro(v)} € per euro${ab}`, v };
    } };
}
const stEuroTick = v => v === 0 ? '€0' : '€' + String(Math.round(v * 100) / 100).replace('.', ',');

// ── PERIODO: aggregati di calendario sulla finestra [inizio, matura] ──
// Coorte: ogni utente sta nella riga del suo primo avvio, e i suoi pagamenti restano lì anche se
// arrivano dopo la fine dello sprint. Si sommano solo le righe dello scope; la spesa è quella dei
// giorni di pubblicità di quelle righe. Il confronto allinea le finestre per anzianità, come il ROI.
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
// i pagamenti arrivati dopo l'ultimo giorno della curva stanno sommati sull'ultimo punto: se la data vera
// cade nella finestra si contano da quel giorno, altrimenti restano dove sono (cosi' non spariscono)
const stRowCumW = (sp, date, key, w1) => {
  let v = stRowCum(sp, date, key);
  if (sp.late && sp.late.length && date >= sp.matura) for (const l of sp.late) if (l.date > date && l.date <= w1) v -= l[key] ?? 0;
  return v;
};
// righe della coorte in esame: un utente sta nello sprint del suo primo avvio, quindi si sommano solo
// le righe dello scope (gruppo o dettaglio), mai quelle degli sprint vicini che cadono negli stessi giorni
const stRowsOf = (d, S) => {
  const ids = new Set((S && S.rows || []).map(r => r.id));
  return (d.sprint_curves.sprints || []).filter(sp => ids.has(sp.id));
};
// flussi cumulati di calendario su una finestra, sommati sulle righe date
function stWindow(all, w0, w1, g) {
  const days = stWindowDays(w0, w1), okey = g ? 'og' : 'on', pkey = g ? 'pg' : 'pn';
  const flow = key => {
    const inc = days.map((dt, k) => {
      const pd = k === 0 ? stAddDays(w0, -1) : days[k - 1];
      let v = 0;
      for (const sp of all) v += stRowCumW(sp, dt, key, w1) - stRowCumW(sp, pd, key, w1);   // i rimborsi scendono
      return v;
    });
    let t = 0;
    return inc.map(v => (t += v));
  };
  const spend = flow('cs'), paid = flow(pkey), trials = flow('st'), offers = flow('dc');
  const open = days.map(dt => { let o = 0; for (const sp of all) o += stRowCum(sp, dt, okey); return o; });
  return { days, spend, paid, trials, open, offers };
}
// la finestra ha il conteggio delle offerte (chiave dc: solo dopo la migrazione direct_offers)
const stHasDc = all => (all || []).some(sp => (sp.points || []).some(p => p && ('dc' in p)));

// ultimo giorno da disegnare: con proiezione, fino all'ultima maturazione con prove aperte
const stAxisEnd = d => {
  const S = stScope(d);
  let end = (S && S.w1) || d.meta.sprint.fine || d.meta.oggi;
  for (const sp of stRowsOf(d, S)) {
    if ((sp.open_trials ?? 0) > 0 && sp.matura > end) end = sp.matura;
  }
  const cap = stAddDays(d.meta.oggi, 30);
  return end > cap ? cap : end;
};
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
// Spesa Meta dei giorni di pubblicità e incassi della coorte, sulla finestra [inizio, matura]
// delle righe dello scope. Solo dati veri.

function stBuildMoney(w, h, d) {
  const sc = stCurveSet(d), sel = sc.sel, cmp = sc.cmp, g = stats.gross;
  const all = d.sprint_curves.sprints, oggi = d.meta.oggi;
  const AE = stAxisEnd(d);
  const S = stScope(d);
  const w1 = stats.proj ? AE : (S.w1 < oggi ? S.w1 : oggi);
  const W = stWindow(stRowsOf(d, S), S.w0, w1, g);
  const dc = stHasDc(all), rT = sc.rate;
  const wins = cmp.map(sp => stWindow([sp], sp.inizio, stats.proj ? AE : (sp.matura < oggi ? sp.matura : oggi), g));
  const nd = Math.max(W.days.length, ...wins.map(C => C.days.length), 2);
  const paidT = (X, i) => stAfterTax(X.paid[i], X.spend[i]), projT = i => stAfterTax(W.paid[i] + rT * W.open[i], W.spend[i]);
  const iEnd = W.days.length - 1;
  const projEnd = iEnd >= 0 ? projT(iEnd) : 0;
  const top = Math.max(10, W.spend.at(-1) ?? 0, iEnd >= 0 ? paidT(W, iEnd) : 0, stats.proj ? projEnd : 0);
  const pow = Math.pow(10, Math.floor(Math.log10(top))), norm = top / pow;
  const ymax = (norm <= 1 ? 1 : norm <= 1.25 ? 1.25 : norm <= 1.5 ? 1.5 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * pow;
  const ticks = [0, ymax / 4, ymax / 2, 3 * ymax / 4, ymax].map(v => [v, stEuroTick(v)]);
  const c = stBase(w, h, { nx: nd, ymax, ticks, labs: stDateLabs(W.days) });
  let s = c.s;
  cmp.forEach((sp, k) => {
    const col = ST_CMP_COLORS[k % ST_CMP_COLORS.length], C = wins[k];
    const runs = stRuns(C.paid.map((v, i) => ({ i, v: paidT(C, i), est: C.days[i] > oggi })), ymax, true);
    s += stCurve(c, runs, { color: col, estColor: col, estDash: '7 6', sw: 2.5, dot: (p, r, e) => e.last && r === runs.at(-1) ? 'dot' : null });
  });
  const estD = i => W.days[i] > oggi;
  s += stCurve(c, stRuns(W.spend.map((v, i) => ({ i, v, est: estD(i) })), ymax, true),
    { color: ST.BLU, estColor: ST.BLU, estDash: '7 6', sw: 3, dot: () => 'dot' });
  if (!stats.proj) s += stCurve(c, stRuns(W.paid.map((v, i) => ({ i, v: paidT(W, i), est: estD(i) })), ymax, true),
    { color: ST.VER, estColor: ST.VER, estDash: '7 6', sw: 3, dot: () => 'dot' });
  if (stats.proj) {
    // la bianca è la proiezione degli incassi cumulati: coincide col reale nel passato
    const runsP = stRuns(W.days.map((dt, i) => ({ i, v: projT(i), est: W.open[i] > 0 || dt > oggi })), ymax, true);
    s += stCurve(c, runsP, { color: ST.INK, estColor: ST.INK, estDash: '7 6', sw: 2.5,
      dot: (p, r, e) => e.last && r === runsP.at(-1) ? 'ring' : null });
  }
  return {
    svg: stSvg(w, h, s), c, nx: nd,
    hov: i => {
      if (i < 0 || i >= W.days.length) return null;
      const ab = dc ? ` · ${W.offers[i]} ${(W.offers[i] ?? 0) === 1 ? 'offerta' : 'offerte'}` : '';
      const pj = stats.proj ? ` · proiezione ${stEuro(projT(i))} €` : '';
      return { txt: `${stDM(W.days[i])} · spesi ${stEuro(W.spend[i])} € · incassati ${stEuro(paidT(W, i))} €${ab}${pj}`, v: W.spend[i] };
    },
  };
}

// ── GRAFICO «Prove avviate — totale cumulato»: partenze per data di avvio ──
// Prove della coorte per data di avvio, sommate sulle righe dello scope.

function stBuildTrials(w, h, d) {
  const sc = stCurveSet(d), sel = sc.sel, cmp = sc.cmp;
  const all = d.sprint_curves.sprints, oggi = d.meta.oggi;
  const AE = stAxisEnd(d);
  const S = stScope(d);
  const w1 = stats.proj ? AE : (S.w1 < oggi ? S.w1 : oggi);
  const W = stWindow(stRowsOf(d, S), S.w0, w1, stats.gross);
  const dc = stHasDc(all);
  const wins = cmp.map(sp => stWindow([sp], sp.inizio, stats.proj ? AE : (sp.matura < oggi ? sp.matura : oggi), stats.gross));
  const nx = Math.max(W.days.length, ...wins.map(C => C.days.length), 2);
  const top = Math.max(2, W.trials.at(-1) ?? 0, ...wins.flatMap(C => C.trials));
  const stepY = top <= 8 ? 2 : top <= 20 ? 4 : top <= 40 ? 8 : 20;
  const ymax = Math.ceil((top + 0.5) / stepY) * stepY;
  const ticks = []; for (let v = 0; v <= ymax; v += stepY) ticks.push([v, String(v)]);
  const c = stBase(w, h, { nx, ymax, ticks, labs: stDateLabs(W.days) });
  const estD = i => W.days[i] > oggi;
  const runs = stRuns(W.trials.map((v, i) => ({ i, v, est: estD(i) })), ymax, true);
  let s = c.s;
  cmp.forEach((sp, k) => {
    const col = ST_CMP_COLORS[k % ST_CMP_COLORS.length], C = wins[k];
    const cr = stRuns(C.trials.map((v, i) => ({ i, v, est: C.days[i] > oggi })), ymax, true);
    s += stCurve(c, cr, { color: col, estColor: col, estDash: '7 6', sw: 2.5, dot: (p, r, e) => e.last && r === cr.at(-1) ? 'dot' : null });
  });
  s += stCurve(c, runs, { color: ST.BLU, estColor: ST.BLU, estDash: '7 6', sw: 3, dot: () => 'dot' });
  if (dc) s += stCurve(c, stRuns(W.offers.map((v, i) => ({ i, v, est: estD(i) })), ymax, true),
    { color: ST.VER, estColor: ST.VER, estDash: '7 6', sw: 3, dot: () => 'dot' });
  return { svg: stSvg(w, h, s), c, nx,
    hov: i => (i >= 0 && i < W.days.length)
      ? { txt: `${stDM(W.days[i])} · ${W.trials[i]} ${(W.trials[i] ?? 0) === 1 ? 'prova' : 'prove'}${dc ? ` · ${W.offers[i]} ${(W.offers[i] ?? 0) === 1 ? 'offerta' : 'offerte'}` : ''}`, v: W.trials[i] } : null };
}

// Soglia delle prove che pagano: sotto il 30% siamo sotto la media (Europa occidentale 29,7%, RevenueCat 2026);
// la media del fitness è il 38%. Nessuna fonte incrocia fitness, Europa e Android.
const ST_RATE_SOGLIA = 30;

// ── GRAFICO «Prove che poi pagano»: solo le prove finite nel periodo ──
// Cumulato delle conclusioni (pagamenti, scadenze, disdette) con data di fine dentro la
// finestra: la stessa regola degli altri grafici. Soglia del 30% come prima.

// Serie della coorte (chiavi cohort): partenze e fati giorno per giorno dentro la finestra.
// Senza chiavi (cache vecchia) si ripiega sui cumulati globali: le disdette restano dentro
// le concluse e il confronto resta per riga. Con le chiavi il confronto non si applica
// (segue una sola coorte: quella dello sprint scelto).
function stCohort(d, S, w1) {
  let C = d.cohort, CP = d.cohort_points;
  if (Array.isArray(d.cohort_rows) && d.cohort_rows.length) {
    // somma per giorno delle sole righe dello scope; l'ultimo punto ha già i fati arrivati dopo la maturazione
    const ids = new Set((S && S.rows || []).map(r => r.id)), by = new Map();
    for (const r of d.cohort_rows) if (ids.has(r.id)) for (const p of r.points || []) {
      const q = by.get(p.date) || { date: p.date, started: 0, paid: 0, cancelled: 0, lost: 0 };
      for (const k of ['started', 'paid', 'cancelled', 'lost']) q[k] += p[k] ?? 0;
      by.set(p.date, q);
    }
    CP = [...by.values()].sort((a, b) => (a.date < b.date ? -1 : 1));
    const L = CP.at(-1) || { started: 0, paid: 0, cancelled: 0, lost: 0 };
    C = { started: L.started, paid: L.paid, cancelled: L.cancelled, lost: L.lost };
  }
  if (C && Array.isArray(CP) && CP.length) {
    const idx = CP.map((p, k) => k).filter(k => CP[k].date <= w1);
    const gg = arr => idx.map(k => arr[k]);
    return { split: true, tot: C.started ?? 0, days: gg(CP.map(p => p.date)),
      started: gg(CP.map(p => p.started ?? 0)),
      paid: gg(CP.map(p => p.paid ?? 0)), canc: gg(CP.map(p => p.cancelled ?? 0)), lost: gg(CP.map(p => p.lost ?? 0)),
      openEnd: Math.max(0, (C.started ?? 0) - (C.paid ?? 0) - (C.cancelled ?? 0) - (C.lost ?? 0)) };
  }
  const R = stRateWindow(d.trial_rate.points, S.w0, w1);
  const Wall = stWindow(stRowsOf(d, S), S.w0, w1, stats.gross);
  const tot = Wall.trials.at(-1) ?? 0;
  const paidEnd = R.length ? R[R.length - 1].paid : 0;
  const lostEnd = R.length ? Math.max(0, R[R.length - 1].ended - R[R.length - 1].paid) : 0;
  return { split: false, tot, days: R.map(r => r.date), started: Wall.trials,
    paid: R.map(r => r.paid), canc: R.map(() => 0), lost: R.map(r => Math.max(0, r.ended - r.paid)),
    openEnd: Math.max(0, tot - paidEnd - lostEnd) };
}
function stBuildRate(w, h, d) {
  const sc = stCurveSet(d), sel = sc.sel, cmp = sc.cmp;
  const all = d.sprint_curves.sprints, oggi = d.meta.oggi, dc = stHasDc(all);
  const AE = stAxisEnd(d);
  const S = stScope(d);
  const w1 = stats.proj ? AE : (S.w1 < oggi ? S.w1 : oggi);
  const K = stCohort(d, S, w1);
  const nd = Math.max(K.days.length, 2);
  const c = stBase(w, h, { nx: nd, ymax: 100, ticks: ST_PCT, par: ST_RATE_SOGLIA, labs: stDateLabs(K.days) });
  const pp = (pa, t) => (t > 0 ? 100 * pa / t : null);
  const pts = K.paid.map((v, i) => ({ i, v: pp(v, K.tot), est: K.days[i] > oggi }));
  const ch = new Set(stChanges(pts.map(p => p.v ?? 0)));
  const runs = stRuns(pts, 100, true);
  let s = c.s + stCurve(c, runs, { color: ST.VER, estColor: ST.VER, estDash: '7 6', sw: 3,
    dot: (p, r, e) => (ch.has(p[0]) || (e.last && r === runs.at(-1))) ? 'dot' : null });
  const lostCol = K.split ? ST.TER : ST.MUT;
  const rl = stRuns(K.lost.map((v, i) => ({ i, v: pp(v, K.tot), est: K.days[i] > oggi })), 100, true);
  s += stCurve(c, rl, { color: lostCol, estColor: lostCol, estDash: '7 6', sw: 2.5,
    dot: (p, r, e) => e.last && r === rl.at(-1) ? 'dot' : null });
  if (K.split) {
    const rc = stRuns(K.canc.map((v, i) => ({ i, v: pp(v, K.tot), est: K.days[i] > oggi })), 100, true);
    s += stCurve(c, rc, { color: ST.MUT, estColor: ST.MUT, estDash: '7 6', sw: 2.5,
      dot: (p, r, e) => e.last && r === rc.at(-1) ? 'dot' : null });
  } else {
    cmp.forEach((sp, k) => {
      const col = ST_CMP_COLORS[k % ST_CMP_COLORS.length];
      const w1c = stats.proj ? AE : (sp.matura < oggi ? sp.matura : oggi);
      const C = stRateWindow(d.trial_rate.points, sp.inizio, w1c);
      const Cw = stWindow([sp], sp.inizio, w1c, stats.gross);
      const t2 = Cw.trials.at(-1) ?? 0;
      const cr = stRuns(C.map((r, i) => ({ i, v: pp(r.paid, t2), est: C[i].date > oggi })), 100, true);
      s += stCurve(c, cr, { color: col, estColor: col, estDash: '7 6', sw: 2.5, dot: (p, r, e) => e.last && r === cr.at(-1) ? 'dot' : null });
    });
  }
  const rT = sc.rate;
  const proj = stats.proj && K.tot > 0 ? 100 * ((K.paid.at(-1) ?? 0) + rT * K.openEnd) / K.tot : null;
  if (stats.proj && proj != null) {
    const fi = K.days.findIndex(x => x >= oggi), from = fi < 0 ? K.days.length : Math.max(0, fi - 1);
    if (from < K.days.length - 1) {
      const rp = stRuns(K.days.slice(from).map((dt, j) => ({ i: from + j, v: proj, est: true })), 100, true);
      s += stCurve(c, rp, { color: ST.INK, estColor: ST.INK, estDash: '7 6', sw: 2.5,
        dot: (p, r, e) => e.last && r === rp.at(-1) ? 'ring' : null });
    }
  }
  const off = dc ? stWindow(stRowsOf(d, S), S.w0, w1, stats.gross).offers : null;
  return { svg: stSvg(w, h, s), c, nx: nd,
    hov: i => { if (i < 0 || i >= K.days.length || K.tot <= 0) return null;
      const ab = dc ? ` · ${off[i]} ${(off[i] ?? 0) === 1 ? 'offerta' : 'offerte'}` : '';
      const pj = stats.proj && proj != null ? ` · proiezione ${stPct(proj)}` : '';
      const open = Math.max(0, (K.started[i] ?? 0) - K.paid[i] - K.canc[i] - K.lost[i]);
      const det = K.split ? ` · ${K.canc[i]} disdette` : '';
      return { txt: `${stDM(K.days[i])} · ${K.paid[i]} pagate${det} · ${K.lost[i]} ${K.split ? 'scadute' : 'perse'} · ${open} aperte (su ${K.tot})${ab}${pj}`, v: pp(K.paid[i], K.tot) }; } };
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
  const S = stScope(d);
  const AE = stAxisEnd(d);
  const w1 = stats.proj ? AE : (S.w1 < d.meta.oggi ? S.w1 : d.meta.oggi);
  const c = {};
  // Spesa e incassi per data di calendario sulla finestra: gli stessi giorni per tutti.
  {
    const g = stats.gross, all = d.sprint_curves.sprints, dc = stHasDc(all);
    const W = stWindow(stRowsOf(d, S), S.w0, w1, g);
    const spend = W.spend.at(-1) ?? 0, earn = W.paid.at(-1) ?? 0;
    const div = earn - spend, kind = g ? 'lordi' : 'netti';
    const per = `periodo ${stDM(S.w0)}–${stDM(S.w1)}`;
    const off = dc ? (W.offers.at(-1) ?? 0) : null;
    const rT = cs.rate, projEarn = earn + rT * (W.open.at(-1) ?? 0);
    const base = stats.proj ? projEarn : earn, tax = stProfitTax(base, spend);
    const pdiv = base - tax - spend;
    const taxTxt = !stats.tax || g ? '' : (tax > 0 ? ` · IRES e IRAP stimate ${stEuro(tax)} € su ${stEuro(base - spend)} € di utile` : (base > spend ? '' : ' · IRES e IRAP zero: il periodo è in perdita'));
    c.money = { num: stEuro(pdiv) + ' €', color: ST.INK,
      cap: `il divario fra investimento e ricavi · ${stEuro(spend)} € spesi, ${stEuro(earn)} € incassati ${kind}${off == null ? '' : ` (di cui ${off} ${off === 1 ? 'offerta' : 'offerte'})`} · ${per}${stats.proj ? ` · proiezione +${stEuro(rT * (W.open.at(-1) ?? 0))} €` : ''}${taxTxt}` };
    c.money.legend = [stLgd(ST.BLU, 'Spesa ads cumulata'),
      ...(stats.proj ? [stLgd(ST.INK, 'proiezione')] : [stLgd(ST.VER, `Incassi ${kind} cumulati`)]),
      ...cs.cmp.map((x, k) => stLgd(ST_CMP_COLORS[k % ST_CMP_COLORS.length], stCurveName(x) + ' · incassi'))].join('');
  }
  // Prove avviate per data di avvio dentro la finestra, con le offerte pagate in parallelo.
  {
    const all = d.sprint_curves.sprints, dc = stHasDc(all);
    const W = stWindow(stRowsOf(d, S), S.w0, w1, stats.gross);
    const tot = W.trials.at(-1) ?? 0, off = dc ? (W.offers.at(-1) ?? 0) : null;
    const per = `periodo ${stDM(S.w0)}–${stDM(S.w1)}`;
    c.trials = { num: off == null ? String(tot) : `${tot} + ${off}`, color: ST.INK,
      cap: off == null ? `prove avviate nel ${per}` : `${tot} ${tot === 1 ? 'prova avviata' : 'prove avviate'} · ${off} ${off === 1 ? 'offerta pagata' : 'offerte pagate'} nel ${per}` };
    c.trials.legend = [stLgd(ST.BLU, 'Prove avviate'),
      ...(off == null ? [] : [stLgd(ST.VER, 'Offerte pagate')]),
      ...(stats.proj ? [stLgd(ST.MUT, 'proiezione', '7 6')] : []),
      ...cs.cmp.map((x, k) => stLgd(ST_CMP_COLORS[k % ST_CMP_COLORS.length], stCurveName(x)))].join('');
  }
  // Euro per euro sugli stessi giorni delle altre schede: stesso denominatore.
  {
    const all = d.sprint_curves.sprints, dc = stHasDc(all);
    const W = stWindow(stRowsOf(d, S), S.w0, w1, stats.gross);
    const hasOpen = (W.open.at(-1) ?? 0) > 0;
    const off = dc ? (W.offers.at(-1) ?? 0) : null;
    const ti = W.days.findIndex(x => x >= d.meta.oggi);
    const fval = k => { const s = W.spend[k], p = W.paid[k], o = W.open[k]; return s > 0 ? stAfterTax(p + cs.rate * o, s) / s : ((p + o === 0) ? 0 : null); };
    const finals = W.days.map((dt, k) => fval(k)).filter(v => v != null);
    const fv = finals.at(-1);
    const per = `periodo ${stDM(S.w0)}–${stDM(S.w1)}`;
    c.sprint = fv == null ? { num: '–', cap: `nessuna spesa ancora · ${per}`, color: ST.INK }
      : { num: stEuro(fv) + ' €', color: hasOpen ? ST.BLU : ST.INK,
          cap: `${hasOpen ? 'stima a maturazione' : 'reale'}${cs.manual ? ` · tasso a mano ${stPct(cs.rate * 100)}` : ''} · ${stEuro(W.paid.at(-1) ?? 0)} € pagati${off == null ? '' : ` (di cui ${off} ${off === 1 ? 'offerta' : 'offerte'})`} su ${stEuro(W.spend.at(-1) ?? 0)} € spesi · ${per}` };
    c.sprint.legend = [
      ...(hasOpen ? [stLgd(ST.INK, 'pagato'), stLgd(ST.BLU, 'stima', '6 5')] : [stLgd(ST.INK, stCurveName(sel))]),
      ...(stats.proj ? [stLgd(ST.INK, 'proiezione', '7 6')] : []),
      ...cs.cmp.map((x, k) => stLgd(ST_CMP_COLORS[k % ST_CMP_COLORS.length], stCurveName(x))),
      stLgd(ST.ORA, 'pareggio'), stLgRect(ST.ADS, 'pubblicità'), ...(ti > 0 ? [stLgRect(ST.FZ, 'da oggi')] : []),
    ].join('');
  }

  const K = stCohort(d, S, w1);
  const Kp = K.paid.at(-1) ?? 0, Kc = K.canc.at(-1) ?? 0, Kl = K.lost.at(-1) ?? 0;
  const Ko = Math.max(0, K.tot - Kp - Kc - Kl);
  const rT = cs.rate;
  const Kproj = K.tot > 0 ? 100 * (Kp + rT * Ko) / K.tot : null;
  const Know = K.tot > 0 ? 100 * Kp / K.tot : null;
  const det = K.split ? ` · ${Kc} disdette` : '';
  const lostTxt = K.split ? 'scadute senza pagare' : 'concluse senza pagare';
  c.rate = K.tot > 0 ? { num: stPct(stats.proj ? Kproj ?? 0 : Know ?? 0), cap: `${Kp} pagate su ${K.tot} avviate nel periodo${det} · ${Kl} ${lostTxt} · ${Ko} ancora aperte · soglia ${ST_RATE_SOGLIA}%${stats.proj ? ` · proiezione ${stPct(Kproj ?? 0)}` : ''}`, color: ST.INK }
                    : { num: '–', cap: `nessuna prova avviata nel periodo · soglia ${ST_RATE_SOGLIA}%`, color: ST.INK };
  c.rate.legend = [stLgd(ST.VER, 'pagate'),
    ...(K.split ? [stLgd(ST.MUT, 'disdette'), stLgd(ST.TER, 'scadute senza pagare')] : [stLgd(ST.MUT, 'concluse senza pagare')]),
    stLgd(ST.ORA, 'soglia'),
    ...(stats.proj ? [stLgd(ST.INK, 'proiezione', '7 6')] : [])].join('');

  return { c };
}

// Barra globale sopra i grafici: quanto vale un abbonamento, tasso di conversione e sprint di confronto.
// Vale per tutti i grafici per sprint (tasse anche per quelli in euro, tasso per il ROI).
function stToolbarHtml(d, cs) {
  const val = d.sprint_curves.value, ids = cs.cmp.map(s => s.id);
  const seg = (on, attr, val, txt, tip) => `<button class="st-segb${on ? ' st-on' : ''}" data-st-${attr}="${val}" aria-pressed="${on}" title="${tip}">${txt}</button>`;
  const opts = cs.all.filter(s => s.id !== cs.sel.id).reverse().map(s => `
      <button class="st-opt${ids.includes(s.id) ? ' st-sel' : ''}" role="option" aria-selected="${ids.includes(s.id)}" data-st-cmp="${s.id}">
        <span class="st-optdot"></span><span class="st-optl">Sprint ${s.numero}</span><span class="st-optd">${stDM(s.inizio)}–${stDM(s.fine)}</span>
      </button>`).join('');
  const note = stats.gross ? '' : `<span class="st-taxnote"><b>IVA 22% + Google 15%</b> sul prezzo di ogni abbonamento${stats.tax ? '<br><b>IRES 24% + IRAP 3,9%</b> sull’utile: incassi netti meno spesa ads' : ''}</span>`;
  return `<div class="st-bar${note ? (stats.tax ? ' st-noted st-noted2' : ' st-noted') : ''}">
      <div class="st-segcol">
      <div class="st-seg" role="group" aria-label="Valore di un abbonamento">
        ${seg(!stats.gross, 'gross', 0, 'Con tasse', `Tolte IVA e commissione di Google: un annuale ci lascia ${stEuro(val.net_year)} €`)}
        ${seg(stats.gross, 'gross', 1, 'Senza tasse', `Senza togliere niente: un annuale vale il prezzo pieno, ${stEuro(val.gross_year)} €`)}
      </div>${note}
      </div>
      ${stats.gross ? '' : `<div class="st-seg" role="group" aria-label="Imposte sull’utile">
        ${seg(stats.tax, 'tax', stats.tax ? 0 : 1, 'IRES + IRAP', 'Stima delle imposte di una società: il 27,9% del guadagno, solo dove gli incassi netti superano la spesa')}
      </div>`}
      <div class="st-seg" role="group" aria-label="Proiezione col tasso">
        ${seg(stats.proj, 'proj', 1, 'Con proiezione', 'Assi estesi all\u2019ultima scadenza: le prove attive si proiettano col tasso')}
        ${seg(!stats.proj, 'proj', 0, 'Senza proiezione', 'Solo dati veri fino a oggi')}
      </div>
      <label class="st-rate${cs.manual ? ' st-manual' : ''}" title="Quante prove finite diventano pagamenti. Dai dati: ${stPct(cs.dataRate * 100)}. Vale per il ROI e le proiezioni">
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
  const items = stMenuItems();
  const t = stats.data.meta.oggi;
  const gLabel = gr => {
    const w1 = gr.rows.map(s => { const x = stats.data.sprint_curves.sprints.find(y => y.id === s.id); return (x && x.matura) || s.fine; }).sort().at(-1);
    const g = (t >= gr.w0 && t <= w1) ? `giorno ${stDayN(t) - stDayN(gr.w0) + 1} di ${stDayN(w1) - stDayN(gr.w0) + 1}` : 'chiuso';
    const name = gr.numero != null ? `Sprint ${gr.numero}` : gr.rows[0].nome;
    return `${name} · ${g}`;
  };
  return `<div class="st-menu" role="listbox" aria-label="Scegli lo sprint" tabindex="-1">${items.map((it, i) => {
    const act = i === stats.menuIdx ? ' st-act' : '', sel = it.sel ? ' st-sel' : '';
    if (it.type === 'group') {
      const open = stats.grpOpen === it.key;
      return `<div class="st-optrow"><button class="st-opt${act}${sel}" role="option" aria-selected="${!!it.sel}" data-st-grp="${it.key}" data-st-i="${i}">
        <span class="st-optdot"></span><span class="st-optl">${gLabel(it.gr)} · ${it.gr.rows.length}</span><span class="st-optd">${stDM(it.gr.w0)}–${stDM(it.gr.fine)}</span>
      </button><button class="st-exp" data-st-exp="${it.key}" aria-expanded="${open}" title="Dettaglio righe" aria-label="Dettaglio righe">${open ? '▾' : '▸'}</button></div>`;
    }
    const s = it.s;
    return `<button class="st-opt${it.sub ? ' st-sub' : ''}${act}${sel}" role="option" aria-selected="${!!it.sel}" data-st-opt="${s.id}" data-st-i="${i}">
      <span class="st-optdot"></span><span class="st-optl">${stSprintLabel(s)}</span><span class="st-optd">${stDM(s.inizio)}–${stDM(s.fine)}</span>
    </button>`;
  }).join('')}</div>`;
}

function stHeader() {
  const sp = stats.data && stats.data.meta.sprint;
  const at = stats.computedAt;
  const upd = !at ? '' : kcMark({ computedAt: at, pending: stats.cachePending, failed: stats.cacheFailed, fresh: stats.cacheFresh });
  const pill = sp
    ? `<div class="st-pillwrap">
         <button class="st-pill st-pill-sel" id="st-sprint-btn" aria-haspopup="listbox" aria-expanded="${stats.menuOpen}" title="Scegli lo sprint">
           <span>${stScopeLabel()}</span>
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
    if (stats.menuOpen) {
      const items = stMenuItems();
      const S = stScope(stats.data);
      if (S && S.kind === 'group' && stGroups(stats.sprints || []).find(g => g.key === S.key && g.rows.length > 1)) stats.grpOpen = S.key;
      stats.menuIdx = Math.max(0, items.findIndex(it => it.sel));
    }
    render();
  });
  document.getElementById('st-sprint-btn')?.addEventListener('keydown', ev => {
    if (ev.key === 'ArrowDown' && !stats.menuOpen) { ev.preventDefault(); ev.target.click(); }
  });
  document.querySelectorAll('[data-st-opt]').forEach(b => {
    b.addEventListener('click', ev => { ev.stopPropagation(); statsSelectSprint(b.dataset.stOpt); });
    b.addEventListener('mouseenter', () => { stats.menuIdx = +b.dataset.stI; document.querySelectorAll('.st-opt').forEach(o => o.classList.toggle('st-act', o === b)); });
  });
  document.querySelectorAll('[data-st-grp]').forEach(b => {
    b.addEventListener('click', ev => { ev.stopPropagation(); statsSelectGroup(b.dataset.stGrp); });
    b.addEventListener('mouseenter', () => { stats.menuIdx = +b.dataset.stI; document.querySelectorAll('.st-opt').forEach(o => o.classList.toggle('st-act', o === b)); });
  });
  document.querySelectorAll('[data-st-exp]').forEach(b => b.addEventListener('click', ev => {
    ev.stopPropagation(); stats.grpOpen = stats.grpOpen === b.dataset.stExp ? null : b.dataset.stExp; render();
  }));
  document.querySelectorAll('[data-st-tax]').forEach(b => b.addEventListener('click', () => {
    stats.tax = b.dataset.stTax === '1'; stLsSet(ST_LS.tax, stats.tax); render();
  }));
  document.querySelectorAll('[data-st-gross]').forEach(b => b.addEventListener('click', () => {
    stats.gross = b.dataset.stGross === '1'; stLsSet(ST_LS.gross, stats.gross); render();
  }));
  document.querySelectorAll('[data-st-proj]').forEach(b => b.addEventListener('click', () => {
    stats.proj = b.dataset.stProj === '1'; stLsSet(ST_LS.proj, stats.proj); render();
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
  const list = stMenuItems();
  if (ev.key === 'Escape') { ev.preventDefault(); stats.menuOpen = false; render(); document.getElementById('st-sprint-btn')?.focus(); }
  else if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
    ev.preventDefault();
    stats.menuIdx = (stats.menuIdx + (ev.key === 'ArrowDown' ? 1 : -1) + list.length) % Math.max(list.length, 1);
    document.querySelectorAll('.st-opt').forEach((o, i) => o.classList.toggle('st-act', i === stats.menuIdx));
  } else if (ev.key === 'Enter') {
    const it = list[stats.menuIdx]; if (!it) return; ev.preventDefault();
    if (it.type === 'group') statsSelectGroup(it.key); else statsSelectSprint(it.s.id);
  }
});
document.addEventListener('click', ev => {
  if (stats.menuOpen && !ev.target.closest('.st-pillwrap')) { stats.menuOpen = false; render(); }
  else if (stats.cmpOpen && !ev.target.closest('.st-cmpwrap')) { stats.cmpOpen = false; render(); }
});
