// KPI Dashboard — pagina «Stats» (tema Notte del design system HypeMove).
// Caricato DOPO kpi.js: usa `sb`, `state`, `render` e `esc` di quel file. Le serie arrivano
// dalle RPC kpi_stats_sprints e kpi_stats_series (contratto in _specs/design-flows/kpi-home).
// Le misure, i colori e i testi copiano la tavola «2A - Sprint in alto».

const ST = {
  INK: '#ffffff', MUT: '#9ca3af', TER: '#6f7683', BLU: '#4361ee', ORA: '#fb8b04',
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
  computedAt: null,     // ora in cui il database ha calcolato i dati in vista (cache)
  menuOpen: false, menuIdx: 0,
  seq: 0,
  gross: false,         // grafico 1: false = «Con tasse», resa netta (20,90 €); true = «Senza tasse», prezzo pieno (29,99 €)
  cmp: null,            // grafico 1: id degli sprint di confronto scelti; null = i due precedenti
  cmpOpen: false,
  rate: null,           // grafico 1: tasso di fine prova impostato a mano (0..1); null = quello dei dati. Non si ricorda fra le visite
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
  if (!silent) { stats.loading = true; stats.error = null; stats.data = opts.keepData ? stats.data : null; render(); }
  try {
    const [ser, lst] = await Promise.all([
      sb.rpc('kpi_cache_get', { p_query: 'stats_series', p_scope: stats.sprintId || 'default', p_force: !!opts.force }),
      sb.rpc('kpi_stats_sprints'),
    ]);
    if (seq !== stats.seq) return;
    if (ser.error) throw ser.error;
    const data = ser.data && ser.data.data;
    if (!data) throw new Error('Sprint non trovato');
    if (!data.sprint_curves) throw new Error('Il database non restituisce ancora i dati del primo grafico: manca la migrazione kpi_stats_sprint_curves.');
    stats.data = data;
    stats.computedAt = ser.data.computed_at ? new Date(ser.data.computed_at) : null;
    if (!lst.error && Array.isArray(lst.data)) stats.sprints = lst.data;
    stats.error = null;
    stats.lastUpdated = new Date();
  } catch (e) {
    if (seq !== stats.seq) return;
    stats.error = e.message || 'Errore sconosciuto';
    if (!silent) stats.data = null;
  }
  stats.loading = false;
  render();
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
  const x1 = ML + PW, lab = new Map(o.labs);
  let s = '';
  if (o.ads != null) s += stRect(ML, mt, X(Math.min(o.ads, nx - 1)) - ML, PH, ST.ADS);
  if (o.fz != null && o.fz < nx - 1) s += stRect(X(o.fz), mt, x1 - X(o.fz), PH, ST.FZ);
  if (o.fz2 != null && o.fz2 < nx - 1) s += stRect(X(o.fz2), mt, x1 - X(o.fz2), PH, ST.FZ2);
  for (const [v] of o.ticks) if (v) s += stLine(ML, Y(v), x1, Y(v), ST.GRID);
  s += stLine(ML, Y(0), x1, Y(0), ST.INK, 1.5);
  for (const [v, l] of o.ticks) s += stText(ML - 8, Y(v) + 4, l, ST.MUT, 600, 'end');
  for (let i = 0; i < nx; i++) s += stLine(X(i), mt + PH, X(i), mt + PH + (lab.has(i) ? 6 : 3), ST.TER);
  for (const [i, t] of o.labs) {
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
const ST_FO = [[0, '0'], [0.25, '0,25'], [0.5, '0,50'], [0.75, '0,75'], [1, '1']];



const stChanges = vals => vals.map((v, i) => (i > 0 && Math.abs(v - vals[i - 1]) > 1e-9 ? i : -1)).filter(i => i >= 0);

// Calendario comune ai grafici sulla data: dal primo giorno disponibile alla fine dello sprint scelto.
// `end`: una data oltre la fine dello sprint fino a cui allungare l'asse (grafico 4).
function stCalendar(d, end) {
  const m = d.meta, fine = end && end > m.sprint.fine ? end : m.sprint.fine, from = [d.trials_per_100_first_opens && d.trials_per_100_first_opens.from, m.sprint.inizio,
    d.trial_rate.points[0] && d.trial_rate.points[0].date].filter(Boolean).sort()[0];
  const nx = stDayN(fine) - stDayN(from) + 1;
  const last = stDayN(m.ultimo_giorno_intero) - stDayN(from);
  const hasToday = m.oggi >= from && m.oggi <= fine;
  const today = hasToday ? stDayN(m.oggi) - stDayN(from) : null;
  const idx = iso => stDayN(iso) - stDayN(from);
  const labs = [];
  const stop = new Set([today, nx - 1].filter(x => x != null));
  for (let i = 1; i < nx - 1; i += 7) if (![...stop].some(t => Math.abs(t - i) < 3)) labs.push([i, stDM(stAddDays(from, i))]);
  if (today != null && today < nx - 1) labs.push([today, 'oggi']);
  labs.push([nx - 1, stDM(stAddDays(from, nx - 1))]);
  return { from, nx, last, today, idx, labs, fz: last < nx - 1 ? last + 0.5 : null, date: i => stAddDays(from, i) };
}

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

// Asse dei giorni: le date di inizio, fine pubblicità e maturazione dello sprint in esame, «oggi», e i numeri dove c'è posto.
function stCurveLabels(sel, nd, w) {
  const step = (w - 66) / Math.max(nd - 1, 1), near = (a, b) => Math.abs(a - b) * step < 44;
  const keys = [];
  const add = (i, t) => { if (i >= 0 && i < nd && !keys.some(k => near(k[0], i))) keys.push([i, t]); };
  if (sel.today_day != null) add(sel.today_day - 1, 'oggi');
  add(0, stDM(sel.inizio)); add(sel.days - 1, stDM(sel.matura)); add(sel.ads_days - 1, stDM(sel.fine));
  const every = step < 24 ? 2 : 1, labs = [...keys];
  if (w > 600) for (let i = 0; i < nd; i++) if (i % every === 0 && !keys.some(k => near(k[0], i) && k[0] !== i || k[0] === i)) labs.push([i, String(i + 1)]);
  return labs.sort((a, b) => a[0] - b[0]);
}

function stBuildSprintDay(w, h, d) {
  const { sel, cmp, val } = stCurveSet(d);
  const nd = Math.max(sel.days, ...cmp.map(s => s.days), 2);
  const top = Math.max(0, ...[sel, ...cmp].flatMap(s => s.points.map(p => val(p) ?? 0)));
  const stepY = top <= 2 ? 0.5 : 1, ymax = Math.max(1.5, Math.ceil(top / stepY) * stepY);
  const ticks = []; for (let v = 0; v <= ymax + 1e-9; v += stepY) ticks.push([v, v === 0 ? '0' : (Number.isInteger(v) ? v : stIt(v, 2)) + ' €']);
  const c = stBase(w, h, {
    nx: nd, ymax, ticks, par: d.sprint_curves.breakeven,
    fz: sel.today_day != null ? sel.today_day - 1.5 : null, labs: stCurveLabels(sel, nd, w),
    ads: sel.ads_days - 0.5,   // i giorni in cui la pubblicità dello sprint in esame era attiva, anche a sprint chiuso
  });
  const pts = s => s.points.map(p => ({ i: p.day - 1, v: val(p), est: p.est }));
  let s = c.s;
  cmp.forEach((sp, k) => {
    const col = ST_CMP_COLORS[k % ST_CMP_COLORS.length], runs = stRuns(pts(sp), ymax, true);
    s += stCurve(c, runs, { color: col, estColor: col, estDash: '7 6', sw: 2.5, dot: (p, r, e) => e.last && r === runs.at(-1) ? 'dot' : null });
  });
  const maturing = sel.today_day != null, runs = stRuns(pts(sel), ymax, true);
  s += stCurve(c, runs, {
    color: maturing ? ST.INK : ST.BLU, estColor: ST.BLU, estDash: '7 6', sw: 3,
    dot: (p, r, e) => !e.last ? null : (r.est ? (r === runs.at(-1) ? 'ring' : null) : 'dot'),
  });
  const byDay = new Map(sel.points.map(p => [p.day, p]));
  return {
    svg: stSvg(w, h, s), c, nx: nd,
    hov: i => { const p = byDay.get(i + 1), v = p ? val(p) : null; if (v == null) return null;
      return { txt: `giorno ${i + 1} · ${stDM(stAddDays(sel.inizio, i))} · ${p.est ? 'stima ' : ''}${stEuro(v)} € per euro`, v }; },
  };
}
// Grafico 3: prove avviate ogni 100 € spesi, solo dati veri fino a oggi, stessi sprint e stessi giorni del grafico 1.
const stT100 = p => (p.cs > 0 && p.st != null ? 100 * p.st / p.cs : null);
const stT100Real = sp => sp.points.filter(p => sp.today_day == null || p.day <= sp.today_day);
function stBuildT100(w, h, d) {
  const { sel, cmp } = stCurveSet(d), par = d.trials_per_100.breakeven;
  const nd = Math.max(sel.days, ...cmp.map(x => x.days), 2);
  const top = Math.max(par ?? 0, ...[sel, ...cmp].map(x => stT100(stT100Real(x).at(-1) || {}) ?? 0));
  const ymax = Math.max(12, Math.ceil(top / 4) * 4), stepY = ymax > 24 ? 8 : 4;
  const ticks = []; for (let v = 0; v <= ymax; v += stepY) ticks.push([v, String(v)]);
  const c = stBase(w, h, { nx: nd, ymax, ticks, par, fz: sel.today_day != null ? sel.today_day - 0.5 : null, labs: stCurveLabels(sel, nd, w) });
  const pts = x => stT100Real(x).map(p => ({ i: p.day - 1, v: stT100(p) }));
  let s = c.s;
  cmp.forEach((x, k) => {
    const col = ST_CMP_COLORS[k % ST_CMP_COLORS.length], runs = stRuns(pts(x), ymax, true);
    s += stCurve(c, runs, { color: col, estColor: col, sw: 2.5, dot: (p, r, e) => e.last && r === runs.at(-1) ? 'dot' : null });
  });
  const col = sel.today_day != null ? ST.INK : ST.BLU, runs = stRuns(pts(sel), ymax, true);
  s += stCurve(c, runs, { color: col, estColor: col, sw: 3, dot: (p, r, e) => e.last && r === runs.at(-1) ? 'dot' : null });
  const byDay = new Map(stT100Real(sel).map(p => [p.day, p]));
  return {
    svg: stSvg(w, h, s), c, nx: nd,
    hov: i => { const p = byDay.get(i + 1), v = p ? stT100(p) : null; if (v == null) return null;
      return { txt: `giorno ${i + 1} · ${stDM(stAddDays(sel.inizio, i))} · ${p.st} prove su ${stEuro(p.cs)} € · ${stIt(v, 1)}`, v }; },
  };
}

function stBuildRate(w, h, d) {
  const cal = stCalendar(d);
  const c = stBase(w, h, { nx: cal.nx, ymax: 100, ticks: ST_PCT, fz: cal.fz, labs: cal.labs });
  // la curva parte da quando le prove finite sono abbastanza: prima ogni punto è fatto di due o tre casi
  const P = d.trial_rate.points.filter(p => p.ended >= (d.trial_rate.min_ended ?? 5));
  const pts = P.map(p => ({ i: cal.idx(p.date), v: p.v }));
  const ch = new Set(stChanges(pts.map(p => p.v ?? 0)));
  const runs = stRuns(pts, 100, false);
  const s = c.s + stCurve(c, runs, { color: ST.INK, estColor: ST.INK, sw: 3, dot: (p, r, e) => (ch.has(p[0]) || (e.last && r === runs.at(-1))) ? 'dot' : null });
  const by = new Map(P.map(p => [cal.idx(p.date), p]));
  return { svg: stSvg(w, h, s), c, nx: cal.nx,
    hov: i => { const p = by.get(i); return p && p.v != null ? { txt: `${stDM(cal.date(i))} · ${p.paid} pagate su ${p.ended} finite · ${stPct(p.v)}`, v: p.v } : null; } };
}

// Grafico 4: chi ha pagato (vero) e dove si arriva quando scadono le prove aperte (stima), su tutta la storia.
const stPayEst = ep => (ep.est_full && ep.est_full.length ? ep.est_full : ep.est || []);
function stBuildPayers(w, h, d) {
  const ep = d.expected_payers, E = stPayEst(ep), cal = stCalendar(d, E.length ? E.at(-1).date : null);
  const top = Math.max(1, ...ep.real.map(p => p.paid), ...E.map(p => p.v));
  const stepY = top <= 8 ? 2 : 4, ymax = Math.ceil((top + 0.5) / stepY) * stepY;
  const ticks = []; for (let v = 0; v <= ymax; v += stepY) ticks.push([v, String(v)]);
  const c = stBase(w, h, { nx: cal.nx, ymax, ticks, fz: cal.fz, labs: cal.labs });
  const paid = ep.real.map(p => ({ i: cal.idx(p.date), v: p.paid }));
  const est = E.map(p => ({ i: cal.idx(p.date), v: p.v }));
  const chP = new Set(stChanges(paid.map(p => p.v))), chE = new Set(stChanges(est.map(p => p.v)));
  const rp = stRuns(paid, ymax, false), re = stRuns(est, ymax, false);
  let s = c.s + stCurve(c, rp, { color: ST.INK, estColor: ST.INK, sw: 3, dot: (p, r, e) => (chP.has(p[0]) || (e.last && r === rp.at(-1))) ? 'dot' : null });
  s += stCurve(c, re.map(r => ({ ...r, est: true })), { color: ST.BLU, estColor: ST.BLU, estDash: '7 6', sw: 3,
    dot: (p, r, e) => (!e.first && (chE.has(p[0]) || (e.last && r === re.at(-1)))) ? 'ring' : null });
  const byR = new Map(ep.real.map(p => [cal.idx(p.date), p])), byE = new Map(E.map(p => [cal.idx(p.date), p]));
  return { svg: stSvg(w, h, s), c, nx: cal.nx,
    hov: i => { const r = byR.get(i);
      if (r) return { txt: `${stDM(cal.date(i))} · ${r.paid} hanno pagato`, v: r.paid };
      const e = byE.get(i); return e ? { txt: `${stDM(cal.date(i))} · stima ${stIt(e.v, 1)} paganti`, v: e.v } : null; } };
}

// Grafico 5: un punto per sprint, lo stesso valore finale del grafico 1 (ultimo punto della curva di ogni sprint).
function stSprintEnds(d) {
  const { all, val } = stCurveSet(d), dup = n => all.filter(x => x.numero === n).length > 1;
  return all.map(sp => { const p = sp.points.at(-1); return { sp, v: p ? val(p) : null, est: !!p && (p.on > 0 || p.og > 0), dup: dup(sp.numero) }; });
}
function stBuildSprints(w, h, d) {
  const P = stSprintEnds(d), nx = Math.max(P.length, 2);
  const top = Math.max(0, ...P.map(p => p.v ?? 0)), ymax = Math.max(1.5, Math.ceil(top / 0.5) * 0.5);
  const ticks = []; for (let v = 0; v <= ymax + 1e-9; v += 0.5) ticks.push([v, v === 0 ? '0' : (Number.isInteger(v) ? v : stIt(v, 2)) + ' €']);
  // i doppioni (due sprint con lo stesso numero) si distinguono con la data di inizio
  const lab = p => !p.dup ? 'S' + p.sp.numero : (w > 600 ? `S${p.sp.numero} ${stDM(p.sp.inizio)}` : stDM(p.sp.inizio));
  const c = stBase(w, h, { nx, ymax, ticks, par: d.sprint_curves.breakeven, labs: P.map((p, i) => [i, lab(p)]) });
  const runs = stRuns(P.map((p, i) => ({ i, v: p.v })), ymax, true);
  // bianco pieno = sprint chiuso, anello blu = ci sono ancora prove aperte (stima), punto blu grande = sprint in esame
  let s = c.s + stCurve(c, runs, { color: ST.INK, estColor: ST.INK, sw: 3, dot: p => (P[p[0]].est ? 'ring' : 'dot') });
  P.forEach((p, i) => { if (p.sp.selected && p.v != null && p.v <= ymax) s += stDot(c.X(i), c.Y(p.v), 6, ST.BLU); });
  return { svg: stSvg(w, h, s), c, nx,
    hov: i => { const p = P[i]; return p && p.v != null ? { txt: `${stCurveName(p.sp)} · ${p.est ? 'stima ' : ''}${stEuro(p.v)} € per euro`, v: p.v } : null; } };
}

function stBuildKeep(w, h, d) {
  const cal = stCalendar(d), P = d.trials_not_cancelled.points;
  const c = stBase(w, h, { nx: cal.nx, ymax: 100, ticks: ST_PCT, fz: cal.fz, labs: cal.labs });
  const pts = P.map(p => ({ i: cal.idx(p.date), v: p.v }));
  const ch = new Set(stChanges(pts.map(p => p.v ?? 0)));
  const runs = stRuns(pts, 100, false);
  const s = c.s + stCurve(c, runs, { color: ST.INK, estColor: ST.INK, sw: 3, dot: (p, r, e) => (ch.has(p[0]) || (e.last && r === runs.at(-1))) ? 'dot' : null });
  const by = new Map(P.map(p => [cal.idx(p.date), p]));
  return { svg: stSvg(w, h, s), c, nx: cal.nx,
    hov: i => { const p = by.get(i); return p && p.v != null ? { txt: `${stDM(cal.date(i))} · ${stPct(p.v)} delle prove non disdette`, v: p.v } : null; } };
}

function stBuildFo(w, h, d) {
  const cal = stCalendar(d), fo = d.trials_per_100_first_opens;
  const c = stBase(w, h, { nx: cal.nx, ymax: 1, ticks: ST_FO, fz: cal.fz, labs: cal.labs });
  const pts = fo.points.map(p => ({ i: cal.idx(p.date), v: p.v }));
  const runs = stRuns(pts, 1, false);
  const s = c.s + stCurve(c, runs, { color: ST.INK, estColor: ST.INK, sw: 3, dot: (p, r, e) => e.last && r === runs.at(-1) ? 'dot' : null });
  const by = new Map(fo.points.map(p => [cal.idx(p.date), p]));
  return { svg: stSvg(w, h, s), c, nx: cal.nx,
    hov: i => { const p = by.get(i); return p && p.v != null ? { txt: `${stDM(cal.date(i))} · ${stIt(p.v, 2)} prove ogni 100 primi accessi`, v: p.v } : null; } };
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
      <div class="st-cap">${o.cap}</div>
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
  sprint: 'Lo sprint, giorno per giorno', rate: 'Prove che poi pagano', t100: 'Prove avviate ogni 100 €',
  payers: 'Paganti attesi', sprints: 'Sprint dopo sprint', keep: 'Prove non disdette', fo: 'Prove ogni 100 primi accessi',
};
const ST_ORDER = ['sprint', 'rate', 't100', 'payers', 'sprints', 'keep', 'fo'];

function stCards(d) {
  const m = d.meta;
  const cs = stCurveSet(d), sel = cs.sel, maturing = sel.today_day != null;
  const lastPt = sel.points.filter(p => cs.val(p) != null).at(-1);
  const when = `pubblicità ${stDM(sel.inizio)}–${stDM(sel.fine)} · matura il ${stDM(sel.matura)}`;
  const money = `${stEuro(stats.gross ? sel.paid_gross : sel.paid_net)} € pagati su ${stEuro(sel.spend)} € spesi`;
  const c = {};
  c.sprint = !lastPt ? { num: '–', cap: `nessuna spesa ancora · ${when}`, color: ST.INK }
    : { num: stEuro(cs.val(lastPt)) + ' €', color: maturing ? ST.BLU : ST.INK,
        cap: `${maturing ? 'stima a maturazione' : 'reale'}${cs.manual ? ` · tasso a mano ${stPct(cs.rate * 100)}` : ''} · ${money} · ${when}` };
  c.sprint.legend = [
    ...(maturing ? [stLgd(ST.INK, 'pagato'), stLgd(ST.BLU, 'stima', '6 5')] : [stLgd(ST.BLU, stCurveName(sel))]),
    ...cs.cmp.map((x, k) => stLgd(ST_CMP_COLORS[k % ST_CMP_COLORS.length], stCurveName(x))),
    stLgd(ST.ORA, 'pareggio'), stLgRect(ST.ADS, 'pubblicità'), ...(maturing ? [stLgRect(ST.FZ, 'da oggi')] : []),
  ].join('');
  c.sprint.tools = stSprintTools(d, cs);

  const r = d.trial_rate.now;
  c.rate = r.ended > 0 ? { num: stPct(r.pct), cap: `${r.paid} pagate su ${r.ended} prove finite o disdette`, color: ST.INK }
                       : { num: '–', cap: 'nessuna prova finita ancora', color: ST.INK };

  const tl = stT100Real(sel).filter(p => stT100(p) != null).at(-1), par3 = d.trials_per_100.breakeven;
  c.t100 = { num: tl ? stIt(stT100(tl), 1) : '–', color: ST.INK,
    cap: `${tl ? `${tl.st} ${tl.st === 1 ? 'prova' : 'prove'} su ${stEuro(tl.cs)} € spesi` : 'nessuna spesa ancora'} · pareggio a ${stIt(par3, 1)}` };

  const ep = d.expected_payers, E4 = stPayEst(ep), open = m.rate.open - m.rate.open_cancelled, canc = m.rate.open_cancelled;
  if (E4.length) {
    c.payers = { num: stIt(ep.total_estimate ?? E4.at(-1).v, 1), color: ST.BLU,
      cap: `${m.rate.paid} hanno pagato + ${stIt(ep.expected_new, 1)} attesi da ${open} ${open === 1 ? 'prova aperta' : 'prove aperte'}${canc ? ` · ${canc} ${canc === 1 ? 'disdetta vale' : 'disdette valgono'} zero` : ''}` };
  } else {
    const lr = ep.real.at(-1);
    c.payers = { num: lr ? String(lr.paid) : '–', cap: lr ? 'hanno pagato' : '', color: ST.INK };
  }
  c.payers.legend = [stLgd(ST.INK, 'hanno pagato'), ...(E4.length ? [stLgd(ST.BLU, 'stima', '6 5')] : [])].join('');

  const P5 = stSprintEnds(d), selI = P5.findIndex(p => p.sp.selected), selP = P5[selI];
  const prevClosed = P5.slice(0, Math.max(selI, 0)).filter(p => !p.est && p.v != null).at(-1);
  c.sprints = selP && selP.v != null ? { num: stEuro(selP.v) + ' €', color: selP.est ? ST.BLU : ST.INK,
    cap: `${selP.est ? 'stima · ' : ''}${stCurveName(selP.sp)}${prevClosed ? ` · ultimo chiuso ${stEuro(prevClosed.v)} €` : ''}` } : { num: '–', cap: '', color: ST.INK };

  const kp = d.trials_not_cancelled.points.filter(p => p.v != null).at(-1);
  c.keep = kp ? { num: Math.round(kp.v) + '%', cap: `${kp.kept} prove su ${kp.started} con il rinnovo attivo`, color: ST.INK } : { num: '–', cap: '', color: ST.INK };

  const fo = d.trials_per_100_first_opens, fl = fo.points.filter(p => p.v != null).at(-1);
  c.fo = { num: fl ? stIt(fl.v, 1) : '–', cap: `dal ${stDM(fo.from)}`, color: ST.INK };
  return { c };
}

// Comandi del grafico 1: quanto vale un abbonamento e con quali sprint confrontare.
function stSprintTools(d, cs) {
  const val = d.sprint_curves.value, ids = cs.cmp.map(s => s.id);
  const seg = (on, g, txt, tip) => `<button class="st-segb${on ? ' st-on' : ''}" data-st-gross="${g}" aria-pressed="${on}" title="${tip}">${txt}</button>`;
  const opts = cs.all.filter(s => s.id !== cs.sel.id).reverse().map(s => `
      <button class="st-opt${ids.includes(s.id) ? ' st-sel' : ''}" role="option" aria-selected="${ids.includes(s.id)}" data-st-cmp="${s.id}">
        <span class="st-optdot"></span><span class="st-optl">Sprint ${s.numero}</span><span class="st-optd">${stDM(s.inizio)}–${stDM(s.fine)}</span>
      </button>`).join('');
  return `<div class="st-tools">
      <div class="st-seg" role="group" aria-label="Valore di un abbonamento">
        ${seg(!stats.gross, 0, 'Con tasse', `Tolte IVA e commissione di Google: un annuale ci lascia ${stEuro(val.net_year)} €`)}
        ${seg(stats.gross, 1, 'Senza tasse', `Senza togliere niente: un annuale vale il prezzo pieno, ${stEuro(val.gross_year)} €`)}
      </div>
      <label class="st-rate${cs.manual ? ' st-manual' : ''}" title="Quante prove finite diventano pagamenti. Dai dati: ${stPct(cs.dataRate * 100)}. Vale solo per questo grafico">
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
  const upd = !at ? ''
    : 'calcolato ' + (at.toDateString() === new Date().toDateString() ? '' : 'il ' + at.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }) + ' ')
      + 'alle ' + at.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
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
      <button class="st-refresh" id="st-refresh-btn" ${stats.loading ? 'disabled' : ''}>Aggiorna</button>
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
  else if (!stats.data) body = `<div class="st-grid">${ST_ORDER.map(k => stSkeletonCard(k, ST_TITLES[k], k === 'sprint')).join('')}</div>`;
  else {
    const { c } = stCards(stats.data);
    body = `<div class="st-grid">${ST_ORDER.map(k => stCardHtml({ key: k, big: k === 'sprint', title: ST_TITLES[k], ...c[k] })).join('')}</div>`;
    if (stats.error) body = `<div class="st-banner">Aggiornamento non riuscito: ${esc(stats.error)}</div>` + body;
  }
  return `<div class="st-page" id="st-page">${stHeader()}${body}</div>`;
}

// ── DISEGNO E PASSAGGIO DEL MOUSE ─────────────────────────────────────
const ST_BUILD = { sprint: stBuildSprintDay, rate: stBuildRate, t100: stBuildT100, payers: stBuildPayers, sprints: stBuildSprints, keep: stBuildKeep, fo: stBuildFo };

function drawStatsCharts() {
  statsCharts = [];
  if (!stats.data) return;
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
