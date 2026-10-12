// KPI Dashboard — pagina «AI Coach» (tema Notte). Caricato DOPO kpi.js e kpi-stats.js:
// usa `sb`, `state`, `esc`, `romeDay`, `addDays`, `ptSprints`, `NAV_PANEL_ICON` di quei file.
// Misure, testi e tempi copiano le tavole red-1 … red-7 del redesign (_specs/design-flows/kpi-ai-coach).
// Ogni blocco (benchmark, uso, conversazioni) carica e mostra il proprio errore per conto suo e si
// ridisegna da solo dentro il suo contenitore: il resto della pagina non si muove.
// Benchmark a righe e «Chat da correggere»: kpi-ai-coach-lista.js.
// RPC: kpi_coach_benchmark, kpi_ai_usage, kpi_ai_users, kpi_events_by_name, kpi_ai_conversations, kpi_ai_conversation.

const AIC = {
  INK: '#ffffff', SEC: '#9ca3af', TER: '#6f7683', BRD: '#2a2e37', GRID: '#23272f', NEST: '#14171d',
  BLU: '#4361ee', LB: '#8da2ff', ORG: '#fb8b04', GRN: '#4ade80', RED: '#f87171', SEL: '#262d45',
};
const AIC_PERIODS = [['oggi', 'Oggi'], ['settimana', 'Settimana'], ['mese', 'Mese'], ['sprint', 'Sprint']];
const AIC_CAP = { oggi: 'oggi', settimana: 'ultima settimana', mese: 'ultimo mese', sprint: 'sprint' };
const AIC_TABS = [['spontanee', 'Spontanee', 'spontanea'], ['feedback', 'Post-workout', 'feedback'], ['paywall', 'Primo workout', 'paywall']];
const AIC_FEED = [['Notifiche', 'workout_feedback_notification_scheduled'], ['Mostrati', 'workout_feedback_shown'], ['Risposte', 'workout_feedback_replied']];
const AIC_ROWS = 6;   // righe mostrate prima di «Altre N»
const AIC_SCREEN = { home: 'Home', 'workout-feedback': 'Fine workout', 'workout-details': 'Dettaglio workout', profile: 'Profilo' };

const aic = {
  bench: { data: null, error: null, loading: false, animated: false },
  period: 'mese', sprintId: null,
  usage: { key: null, data: null, error: null, loading: false, animKey: '' },
  usersOpen: false,
  users: { key: null, data: null, error: null, loading: false },
  tab: 'spontanee', query: '',
  conv: {},          // tab → { data, error, loading, more }
  feed: { key: null, data: null, error: null, loading: false },
  open: null,        // session_id della chat aperta
  chats: {},         // session_id → { data, error, loading }
  seq: { bench: 0, usage: 0, users: 0, feed: 0, conv: 0 },
  narrow: false, wired: false,
};

// ── utilità ───────────────────────────────────────────────────────────
const aicFi = n => String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const aicFd = x => (Math.round((Number(x) || 0) * 100) / 100).toFixed(2).replace('.', ',');
const aicFn = x => String(Math.round(x * 100) / 100).replace('.', ',');
const aicNarrow = () => typeof matchMedia === 'function' && matchMedia('(max-width: 900px)').matches;
const aicErrMsg = e => (e && (e.message || e.details)) || String(e);
const aicIc = (d, sz, col, st) => `<svg class="aic-ico" width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${st ? `style="${st}"` : ''} aria-hidden="true">${d}</svg>`;
const AIC_SPARK = '<path d="M11 3l1.9 5.1L18 10l-5.1 1.9L11 17l-1.9-5.1L4 10l5.1-1.9z"/><path d="M19 15v5M16.5 17.5h5"/>';
const AIC_ARROW = '<path d="M5 5v6a3 3 0 0 0 3 3h11"/><path d="M15 10l4 4-4 4"/>';
const AIC_CHD = '<path d="M6 9l6 6 6-6"/>';
const AIC_SEARCH = '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>';
const AIC_WARN = '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>';

async function aicRpc(name, args) {
  const { data, error } = await sb.rpc(name, args);
  if (error) throw error;
  return data;
}

// Mezzanotte di Roma di un giorno 'YYYY-MM-DD' come istante (serve alle RPC con timestamp).
function aicRomeStart(day) {
  for (const off of ['+02:00', '+01:00']) {
    const d = new Date(day + 'T00:00:00' + off);
    if (d.toLocaleString('sv-SE', { timeZone: 'Europe/Rome' }).startsWith(day + ' 00:00')) return d;
  }
  return new Date(day + 'T00:00:00');
}
const AIC_DTF = new Intl.DateTimeFormat('it-IT', { timeZone: 'Europe/Rome', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
function aicWhen(ts) {
  const d = new Date(ts);
  if (isNaN(d)) return '—';
  const p = {}; AIC_DTF.formatToParts(d).forEach(x => { p[x.type] = x.value; });
  return `${p.day}/${p.month} · ${p.hour === '24' ? '00' : p.hour}:${p.minute}`;
}

// Periodo scelto → { from, to, hourly, today } (giorni di Roma). Sprint senza sprint caricati: come «Mese».
function aicRange() {
  const today = romeDay(new Date());
  let kind = aic.period;
  if (kind === 'oggi') return { from: today, to: today, hourly: true, today, kind };
  if (kind === 'sprint') {
    const list = typeof ptSprints === 'function' ? ptSprints() : [];
    if (list.length) {
      const cur = list.find(s => s.id === aic.sprintId) || [...list].reverse().find(s => s.from <= today) || list[list.length - 1];
      const to = cur.to && cur.to < today ? cur.to : today;
      return { from: cur.from, to, hourly: false, today, kind };
    }
    kind = 'mese';
  }
  return { from: addDays(today, kind === 'settimana' ? -6 : -29), to: today, hourly: false, today, kind: aic.period };
}
const aicRangeKey = r => `${r.kind}|${r.from}|${r.to}|${r.hourly ? 1 : 0}`;

// ── caricamenti ───────────────────────────────────────────────────────
async function aicLoadBench() {
  const b = aic.bench, seq = ++aic.seq.bench;
  b.loading = true; b.error = null;
  try {
    const data = await aicRpc('kpi_coach_benchmark');
    if (!data || !Array.isArray(data.passaggi)) throw new Error('risposta inattesa');
    if (seq !== aic.seq.bench) return;
    b.data = data;
  } catch (e) {
    if (seq !== aic.seq.bench) return;
    console.error('aicLoadBench', e); b.error = aicErrMsg(e);
  }
  b.loading = false;
  aicRefresh('bench');
}

async function aicLoadUsage() {
  const r = aicRange(), key = aicRangeKey(r), u = aic.usage, seq = ++aic.seq.usage;
  const same = u.key === key;
  u.key = key; u.loading = true; u.error = null; if (!same) u.data = null;
  try {
    const data = await aicRpc('kpi_ai_usage', { p_from: r.from, p_to: r.to, p_hourly: r.hourly });
    if (!data || !Array.isArray(data.serie)) throw new Error('risposta inattesa');
    if (seq !== aic.seq.usage) return;
    u.data = data;
  } catch (e) {
    if (seq !== aic.seq.usage) return;
    console.error('aicLoadUsage', e); u.error = aicErrMsg(e);
  }
  u.loading = false;
  aicRefresh('uso');
}

async function aicLoadUsers() {
  const r = aicRange(), key = aicRangeKey(r), u = aic.users, seq = ++aic.seq.users;
  u.key = key; u.loading = true; u.error = null; u.data = null;
  aicRefresh('uso');
  try {
    const data = await aicRpc('kpi_ai_users', { p_from: aicRomeStart(r.from).toISOString(), p_to: aicRomeStart(r.to).toISOString() });
    if (seq !== aic.seq.users) return;
    u.data = data || [];
  } catch (e) {
    if (seq !== aic.seq.users) return;
    console.error('aicLoadUsers', e); u.error = aicErrMsg(e);
  }
  u.loading = false;
  aicRefresh('uso');
}

async function aicLoadFeed() {
  const r = aicRange(), key = aicRangeKey(r), f = aic.feed, seq = ++aic.seq.feed;
  f.key = key; f.loading = true; f.error = null; f.data = null;
  try {
    const data = await aicRpc('kpi_events_by_name', {
      p_from: aicRomeStart(r.from).toISOString(), p_to: aicRomeStart(r.to).toISOString(), p_events: AIC_FEED.map(x => x[1]), p_end: null,
    });
    if (seq !== aic.seq.feed) return;
    const map = {}; (data || []).forEach(x => { map[x.event_name] = Number(x.total) || 0; });
    f.data = map;
  } catch (e) {
    if (seq !== aic.seq.feed) return;
    console.error('aicLoadFeed', e); f.error = aicErrMsg(e);
  }
  f.loading = false;
  const fe = document.getElementById('aic-feed');
  if (fe && aic.tab === 'feedback' && state.page === 'ai-coach') fe.innerHTML = aicFeedHtml();
}

async function aicLoadConv(tab) {
  const t = AIC_TABS.find(x => x[0] === tab);
  const c = aic.conv[tab] || (aic.conv[tab] = { data: null, error: null, loading: false, more: false });
  const seq = ++aic.seq.conv;
  c.loading = true; c.error = null;
  try {
    const data = await aicRpc('kpi_ai_conversations', { p_surface: t[2], lim: 50 });
    c.data = Array.isArray(data) ? data : [];
  } catch (e) {
    console.error('aicLoadConv', e); c.error = aicErrMsg(e);
  }
  c.loading = false;
  if (aic.tab === tab && state.page === 'ai-coach') aicUpdateList();
}

async function aicLoadChat(id) {
  const ch = aic.chats[id] = { data: null, error: null, loading: true };
  try {
    const data = await aicRpc('kpi_ai_conversation', { p_session_id: id });
    ch.data = Array.isArray(data) ? data : [];
  } catch (e) {
    console.error('aicLoadChat', e); ch.error = aicErrMsg(e);
  }
  ch.loading = false;
  if (aic.open === id && state.page === 'ai-coach') aicUpdateList();
}

// Ingresso nella pagina: ricarica in sordina ciò che c'è già, così si vedono i giri nuovi senza sagome.
function aicEnter() {
  aicLoadBench();
  aiclLoad();
  aicLoadUsage();
  aicLoadConv(aic.tab);
  if (aic.tab === 'feedback') aicLoadFeed();
  if (aic.usersOpen) aicLoadUsers();
}

// Carica ciò che manca la prima volta che la pagina si disegna.
function aicEnsure() {
  if (!aic.bench.data && !aic.bench.loading && !aic.bench.error) aicLoadBench();
  aiclEnsure();
  const key = aicRangeKey(aicRange());
  if (aic.usage.key !== key && !aic.usage.loading && !aic.usage.error) aicLoadUsage();
  const c = aic.conv[aic.tab];
  if (!c) aicLoadConv(aic.tab);
  if (aic.tab === 'feedback' && aic.feed.key !== key && !aic.feed.loading && !aic.feed.error) aicLoadFeed();
}

// ── pezzi comuni ──────────────────────────────────────────────────────
function aicError(msg, retry) {
  return `<div class="aic-e">${aicIc(AIC_WARN, 40, AIC.SEC)}<div class="aic-e-t">Errore nel caricamento</div>
    <div class="aic-e-m">${esc(msg)}</div><button class="aic-e-b" data-aic-retry="${retry}">Riprova</button></div>`;
}
const aicSk = (w, h, st) => `<i class="aic-sk" style="display:block;width:${w};height:${h};${st || ''}"></i>`;

// ── USO ───────────────────────────────────────────────────────────────
const AIC_METRICS = {
  p: { title: 'Persone', f: 'persone', col: AIC.LB, rgb: '141,162,255', zero: false, label: v => aicFi(v), tick: v => aicFn(v), unit: ['persona', 'persone'] },
  c: { title: 'Costo', f: 'costo', col: AIC.LB, rgb: '141,162,255', zero: false, label: v => aicFd(v), tick: v => aicFn(v) + ' $', unit: null },
  e: { title: 'Errori', f: 'errori', col: AIC.RED, rgb: '248,113,113', zero: true, label: v => aicFi(v), tick: v => aicFn(v), unit: ['errore', 'errori'] },
};
const AIC_GROUPS = [
  ['Piano premium', c => c === 'roadmap-premium'], ['Nota allenamento', c => c === 'workout-coach-note'],
  ['Creazione piano', c => c.startsWith('plan')], ['Feedback allenamento', c => c === 'workout-feedback'],
  ['Chat', c => ['home', 'workout-details', 'profile', 'workouts', 'roadmap', 'exercise'].includes(c)],
  ['Primo workout', c => c === 'paywall-giorno-zero'], ['Foto pasto', c => c === 'meal-scan'],
];
function aicGroups(per) {
  const acc = {};
  (per || []).forEach(x => {
    const c = String(x.contesto || ''), n = Number(x.chiamate) || 0;
    const g = AIC_GROUPS.find(a => a[1](c));
    const name = g ? g[0] : 'Altro';
    acc[name] = (acc[name] || 0) + n;
  });
  const out = Object.keys(acc).filter(k => k !== 'Altro' && acc[k] > 0).map(k => [k, acc[k]]).sort((a, b) => b[1] - a[1]);
  if (acc.Altro > 0) out.push(['Altro', acc.Altro]);
  return out;
}

function aicNice(max, ints) {
  if (!(max > 0)) return 2;
  const e = Math.pow(10, Math.floor(Math.log10(max)));
  const ms = (ints && max < 10) ? [2, 4, 6, 8, 10] : [1, 2, 3, 4, 5, 6, 8, 10];
  for (const m of ms) if (m * e >= max - 1e-9) return m * e;
  return 10 * e;
}

// Colonne nel tempo di una card. rows = serie del server, hourly = 24 colonne all'ora.
function aicColumns(key, serie, hourly, today, anim) {
  const M = AIC_METRICS[key], n = serie.length, vals = serie.map(r => Number(r[M.f]) || 0);
  const ymax = aicNice(Math.max(...vals, 0), key !== 'c'), tdy = !hourly && n && serie[n - 1].t === today;
  const lab = r => hourly ? r.t.slice(11, 13) : r.t.slice(8, 10) + '/' + r.t.slice(5, 7);
  const pct = v => (v / ymax * 100).toFixed(3) + '%';
  let s = '';
  [ymax / 2, ymax].forEach(v => {
    s += `<div class="aic-cgl" style="bottom:${pct(v)}"></div><div class="aic-cyl" style="bottom:${pct(v)}">${M.tick(v)}</div>`;
  });
  s += '<div class="aic-cbase"></div><div class="aic-cols">';
  const bw = n > 10 ? '.62' : '.5';
  vals.forEach((v, i) => {
    const r = serie[i];
    const tipN = M.unit ? `${aicFi(v)} ${M.unit[v === 1 ? 0 : 1]}` : `${aicFd(v)} $`;
    const tip = `${hourly ? lab(r) + ':00' : lab(r)} · ${tipN}`;
    let bar = '';
    const dly = `--d:${(0.05 + i * (n > 20 ? .012 : .025)).toFixed(3)}s`;
    if (v === 0) { if (M.zero) bar = `<i class="aic-bar aic-zero" style="--c:${M.col};--bw:${bw};${dly}"></i>`; }
    else if (tdy && i === n - 1) bar = `<i class="aic-bar aic-today" style="--c:${M.col};--c2:rgba(${M.rgb},.22);--bw:${bw};height:${pct(v)};${dly}"></i>`;
    else bar = `<i class="aic-bar" style="--c:${M.col};--bw:${bw};height:${pct(v)};${dly}"></i>`;
    s += `<div class="aic-col" data-tip="${esc(tip)}" data-tipk="c">${bar}</div>`;
  });
  s += '</div>';
  // picchi: il massimo e l'ultimo, il primo centrato sulla colonna, l'ultimo a destra sopra le barre vicine
  const mi = vals.indexOf(Math.max(...vals));
  const lastIdx = n - 1;
  if (vals[mi] > 0 && (hourly ? mi !== lastIdx : mi < n - 3)) {
    s += `<div class="aic-pk aic-fade" style="left:${((mi + .5) / n * 100).toFixed(3)}%;bottom:calc(${pct(vals[mi])} + 6px);transform:translateX(-50%);--d:.7s">${M.label(vals[mi])}</div>`;
  }
  if (!hourly && vals[lastIdx] > 0) {
    const near = Math.max(...vals.slice(Math.max(0, n - 4)));
    s += `<div class="aic-pk aic-fade" style="right:0;bottom:calc(${pct(near)} + 6px);--d:.8s">${M.label(vals[lastIdx])}</div>`;
  }
  const idx = hourly ? [0, 6, 12, 18] : (n > 10 ? [0, 7, 14, 21] : vals.map((_, i) => i).slice(0, tdy ? n - 1 : n));
  idx.filter(i => i < n - (tdy && n > 10 ? 1 : 0)).forEach(i => {
    s += `<div class="aic-xl" style="left:${((i + .5) / n * 100).toFixed(3)}%">${lab(serie[i])}</div>`;
  });
  if (tdy) s += `<div class="aic-xl aic-xr">oggi</div>`;
  return `<div class="aic-ch"><div class="aic-cp">${s}</div></div>`;
}

function aicBigNumbers(u, r) {
  const serie = u.serie || [];
  let persone, capP;
  if (r.kind === 'oggi') { persone = Number(u.persone) || 0; capP = 'oggi'; }
  else { persone = serie.length ? serie.reduce((a, x) => a + (Number(x.persone) || 0), 0) / serie.length : 0; capP = 'al giorno'; }
  const cap = AIC_CAP[r.kind];
  return {
    p: [aicFi(persone), capP], c: [aicFd(u.costo) + ' $', cap], e: [aicFi(u.errori), cap],
  };
}

function aicUsoHtml() {
  const r = aicRange(), key = aicRangeKey(r), u = aic.usage;
  const seg = `<div class="aic-seg" role="tablist" aria-label="Periodo">${AIC_PERIODS.map(([k, l]) =>
    `<button class="aic-segb${aic.period === k ? ' aic-on' : ''}" role="tab" aria-selected="${aic.period === k}" data-aic-period="${k}">${l}</button>`).join('')}</div>`;
  const head = `<div class="aic-uh"><h2 class="aic-h2">Uso</h2>${seg}</div>`;
  if (u.error && u.key === key) {
    return head + `<div class="aic-cards"><div class="aic-card" style="grid-column:1/-1;min-height:288px;margin-bottom:32px">${aicError(u.error, 'uso')}</div></div>`;
  }
  const ready = u.data && u.key === key;
  const titles = { p: 'Persone', c: 'Costo', e: 'Errori' };
  let cards = '', per = '', usersHtml = '';
  if (!ready) {
    cards = ['p', 'c', 'e'].map(k => `<div class="aic-card aic-tc${k === 'p' && aic.usersOpen ? ' aic-sel' : ''}"><span class="aic-tt">${titles[k]}</span>
      ${k === 'p' ? aicIc(AIC_CHD, 20, AIC.SEC, 'position:absolute;right:24px;top:18px') : ''}
      ${aicSk('150px', '44px', 'position:absolute;left:24px;top:52px;border-radius:10px')}${aicSk('96px', '14px', 'position:absolute;left:26px;top:112px;border-radius:7px')}
      <div class="aic-ch">${[40, 70, 55, 90, 60, 80, 100, 65, 85, 50, 95, 70, 60, 75, 45, 85].map((h, i, a) =>
        `<i class="aic-sk aic-sk-abs" style="left:calc(38px + (100% - 44px) * ${(i / a.length).toFixed(4)});width:calc((100% - 44px) / ${a.length} - 4px);bottom:24px;height:${(h * .8).toFixed(0)}px;border-radius:3px"></i>`).join('')}</div></div>`).join('');
    per = `<div class="aic-card aic-per"><span class="aic-tt">Per cosa</span>${aicSk('180px', '44px', 'position:absolute;left:24px;top:64px;border-radius:10px')}${aicSk('84px', '14px', 'position:absolute;left:26px;top:124px;border-radius:7px')}
      <div class="aic-pbars">${[0, 1, 2, 3, 4, 5, 6].map(i => `<div class="aic-pr"><span class="aic-pl">${aicSk(`${130 - (i % 3) * 14}px`, '12px', 'border-radius:6px')}</span><div class="aic-pt">${aicSk(`${Math.max(30, 280 - i * 38)}px`, '14px', 'border-radius:5px')}</div></div>`).join('')}</div></div>`;
  } else {
    const d = u.data, serie = d.serie || [], big = aicBigNumbers(d, r);
    const anim = u.animKey !== key; u.animKey = key;
    cards = ['p', 'c', 'e'].map(k => {
      const open = k === 'p' && aic.usersOpen;
      const inner = `<span class="aic-tt">${titles[k]}</span>${k === 'p' ? `<span class="aic-chev">${aicIc(AIC_CHD, 20, AIC.SEC)}</span>` : ''}
        <div class="aic-big${k === 'e' ? ' aic-err-n' : ''}">${big[k][0]}</div><div class="aic-cap">${big[k][1]}</div>${aicColumns(k, serie, r.hourly, r.today, anim)}`;
      return k === 'p'
        ? `<button class="aic-card aic-tc aic-pcard${open ? ' aic-sel' : ''}" data-aic-users aria-expanded="${open}" aria-label="Persone">${inner}</button>`
        : `<div class="aic-card aic-tc">${inner}</div>`;
    }).join('');
    const groups = aicGroups(d.per_contesto), mx = groups.length ? groups[0][1] : 1;
    per = `<div class="aic-card aic-per"><span class="aic-tt">Per cosa</span><div class="aic-big">${aicFi(d.chiamate)}</div><div class="aic-cap">chiamate</div>
      <div class="aic-pbars">${groups.map(([nm, v], i) => `<div class="aic-pr"><span class="aic-pl">${esc(nm)}</span><div class="aic-pt"><i class="aic-pbar" style="--r:${(v / mx).toFixed(4)};--d:${(0.3 + i * .08).toFixed(2)}s"></i><span class="aic-pv">${aicFi(v)}</span></div></div>`).join('')}</div></div>`;
    return `<div class="${anim ? 'aic-a' : ''}">${head}<div class="aic-cards">${cards}</div>${aicUsersHtml()}${per}</div>`;
  }
  return head + `<div class="aic-cards">${cards}</div>${aicUsersHtml()}${per}`;
}

function aicUsersHtml() {
  if (!aic.usersOpen) return '';
  const u = aic.users;
  let body;
  if (u.error) body = aicError(u.error, 'users');
  else if (u.loading || !u.data) body = `<div class="aic-umsg"><i class="aic-sk" style="display:block;width:220px;height:14px;border-radius:7px"></i></div>`;
  else if (!u.data.length) body = `<div class="aic-umsg">Nessuno</div>`;
  else {
    body = `<div class="aic-ur aic-uh0"><span>#</span><span>Utente</span><span class="aic-ue" style="font-family:inherit;color:inherit">Email</span></div>` +
      u.data.map((x, i) => `<div class="aic-ur"><span class="aic-un">${i + 1}</span><span class="aic-uu">${esc(x.name || '—')}</span><span class="aic-ue">${esc(x.email || '—')}</span></div>`).join('');
  }
  return `<div class="aic-card aic-users"><div class="aic-users-s">${body}</div></div>`;
}

// ── CONVERSAZIONI ─────────────────────────────────────────────────────
function aicRowHtml(s) {
  const who = s.username || s.email || 'Utente';
  const scr = AIC_SCREEN[s.context_key] || '—';
  const open = aic.open === s.session_id;
  const coach = s.coach_first ? esc(s.coach_first) : 'Nessun messaggio';
  const user = s.user_first ? esc(s.user_first) : '—';
  return `<div class="aic-item${open ? ' aic-open' : ''}" data-aic-item="${esc(s.session_id)}">
    <button class="aic-row" data-aic-open="${esc(s.session_id)}" aria-expanded="${open}">
      <span class="aic-c1"><span class="aic-who">${esc(who)}</span><span class="aic-when">${aicWhen(s.started_at)}</span></span>
      <span class="aic-scr">${esc(scr)}</span>
      <span class="aic-c3">
        <span class="aic-l1${s.coach_first ? '' : ' aic-none'}">${aicIc(AIC_SPARK, 18, AIC.LB)}<span>${coach}</span></span>
        <span class="aic-l2${s.user_first ? '' : ' aic-none'}">${aicIc(AIC_ARROW, 18, AIC.TER)}<span>${user}</span></span></span>
      ${aicIc(AIC_CHD, 20, AIC.TER).replace('class="aic-ico"', 'class="aic-ico aic-rch"')}
    </button>${open ? aicChatHtml(s.session_id) : ''}</div>`;
}

function aicChatHtml(id) {
  const ch = aic.chats[id];
  let inner;
  if (!ch || ch.loading) inner = `<div class="aic-chat-msgs">${[['c', '320px', 44], ['u', '220px', 38], ['c', '380px', 44]].map(([w, wd, h]) =>
    `<div class="aic-m ${w === 'u' ? 'aic-m-u' : 'aic-m-c'}">${w === 'c' ? '<i class="aic-sk" style="width:28px;height:28px;border-radius:50%"></i>' : ''}<i class="aic-sk" style="width:${wd};max-width:80%;height:${h}px;border-radius:18px"></i></div>`).join('')}</div>`;
  else if (ch.error) inner = aicError(ch.error, 'chat:' + id);
  else if (!ch.data.length) inner = `<div class="aic-chat-msg">Nessun messaggio</div>`;
  else {
    const av = `<span class="aic-av">${aicIc(AIC_SPARK, 17, AIC.LB)}</span>`;
    inner = `<div class="aic-chat-msgs">${ch.data.map((m, i) => m.role === 'assistant'
      ? `<div class="aic-m aic-m-c" style="--d:${(i * .12).toFixed(2)}s">${av}<div class="aic-bub">${esc(m.content)}</div></div>`
      : `<div class="aic-m aic-m-u" style="--d:${(i * .12).toFixed(2)}s"><div class="aic-bub">${esc(m.content)}</div></div>`).join('')}</div>`;
  }
  return `<div class="aic-chat">${inner}</div>`;
}

function aicFeedHtml() {
  const f = aic.feed, key = aicRangeKey(aicRange());
  let inner;
  if (f.error && f.key === key) inner = `<span class="aic-feed-msg">${esc(f.error)} · <button class="aic-more" style="display:inline;height:auto;padding:0;color:${AIC.LB}" data-aic-retry="feed">Riprova</button></span>`;
  else if (!f.data || f.key !== key) inner = AIC_FEED.map((x, i) => `<div class="aic-fi"><i class="aic-sk" style="display:block;width:60px;height:24px;border-radius:7px"></i><i class="aic-sk" style="display:block;width:70px;height:12px;margin-top:6px;border-radius:6px"></i></div>`).join('');
  else inner = AIC_FEED.map(([lb, ev]) => `<div class="aic-fi"><div class="aic-fn">${aicFi(f.data[ev] || 0)}</div><div class="aic-fl">${lb}</div></div>`).join('');
  return `<div class="aic-feed">${inner}</div>`;
}

// L'elenco da solo, perché la ricerca lo ridisegna a ogni tasto senza toccare il campo.
function aicListHtml() {
  const c = aic.conv[aic.tab];
  if (!c || (c.loading && !c.data)) {
    return `<div class="aic-list">${[0, 1, 2, 3].map(i => `<div class="aic-item"><div class="aic-row" style="cursor:default">
      <span class="aic-rw">${aicSk('110px', '14px', 'border-radius:7px')}<span style="display:block;height:8px"></span>${aicSk('76px', '12px', 'border-radius:6px')}</span>
      <span class="aic-rw aic-scr">${aicSk('70px', '12px', 'border-radius:6px')}</span>
      <span class="aic-rw" style="grid-column:3">${aicSk(`${380 - (i % 2) * 40}px`, '12px', 'border-radius:6px;max-width:100%')}<span style="display:block;height:10px"></span>${aicSk(`${300 + (i % 3) * 30}px`, '12px', 'border-radius:6px;max-width:100%')}</span></div></div>`).join('')}</div>`;
  }
  if (c.error) return `<div class="aic-list">${aicError(c.error, 'conv')}</div>`;
  const q = aic.query.trim().toLowerCase();
  const all = (c.data || []).filter(s => !q || `${s.username || ''} ${s.email || ''}`.toLowerCase().includes(q));
  if (!all.length) return `<div class="aic-list"><div class="aic-empty">${q ? 'Nessun risultato' : 'Nessuna conversazione'}</div></div>`;
  const shown = c.more || q ? all : all.slice(0, AIC_ROWS);
  let rest = all.length - shown.length;
  // la chat aperta resta visibile anche se cade oltre le prime righe
  return `<div class="aic-list">${shown.map(aicRowHtml).join('')}${rest > 0 ? `<button class="aic-more" data-aic-more>Altre ${rest}${aicIc(AIC_CHD, 18, AIC.SEC)}</button>` : ''}</div>`;
}

function aicConvHtml() {
  const tabs = `<div class="aic-tabs" role="tablist">${AIC_TABS.map(([k, l]) => `<button class="aic-tab${aic.tab === k ? ' aic-on' : ''}" role="tab" aria-selected="${aic.tab === k}" data-aic-tab="${k}">${l}</button>`).join('')}</div>`;
  const search = `<label class="aic-search">${aicIc(AIC_SEARCH, 18, AIC.TER)}<input id="aic-search" type="text" placeholder="Cerca utente" value="${esc(aic.query)}" autocomplete="off" spellcheck="false"></label>`;
  return `<div class="aic-card aic-conv"><div class="aic-ch0"><h2 class="aic-h2">Conversazioni</h2>${search}${tabs}</div>
    <div id="aic-feed">${aic.tab === 'feedback' ? aicFeedHtml() : ''}</div><div id="aic-list">${aicListHtml()}</div></div>`;
}

// ── pagina, blocchi, eventi ───────────────────────────────────────────
function pageAICoach() {
  aic.narrow = aicNarrow();
  aicEnsure();
  return `<div class="st-page aic" id="aic-page">
    <div class="st-head"><button class="nav-toggle nav-toggle-desk" data-nav-toggle title="Mostra il menu" aria-label="Mostra il menu">${NAV_PANEL_ICON}</button><h1 class="st-h1">AI Coach</h1></div>
    <div id="aic-bench">${aicBenchHtml()}</div>
    <div id="aic-lista">${aicListaHtml()}</div>
    <div id="aic-uso">${aicUsoHtml()}</div>
    <div id="aic-conv">${aicConvHtml()}</div>
    <div class="aic-tip" id="aic-tip"></div>
  </div>`;
}

const AIC_BLOCKS = { bench: () => aicBenchHtml(), lista: () => aicListaHtml(), uso: () => aicUsoHtml(), conv: () => aicConvHtml() };
function aicRefresh(name) {
  const host = document.getElementById('aic-' + name);
  if (!host || state.page !== 'ai-coach') return;
  host.innerHTML = AIC_BLOCKS[name]();
}

function aicTip(el, ev) {
  const tip = document.getElementById('aic-tip');
  if (!tip) return;
  if (!el) { tip.style.display = 'none'; return; }
  const kind = el.dataset.tipk === 'b' ? 'b' : 'c';
  const lines = el.dataset.tip.split('|');
  tip.className = 'aic-tip aic-tip-' + kind;
  tip.innerHTML = lines.map(esc).join('<br>');
  tip.style.display = 'block';
  const w = tip.offsetWidth, h = tip.offsetHeight;
  let x, y;
  if (kind === 'b') { x = ev.clientX + 16; y = ev.clientY + 14; if (x + w > innerWidth - 8) x = ev.clientX - w - 16; if (y + h > innerHeight - 8) y = ev.clientY - h - 14; }
  else { x = ev.clientX - w / 2; y = ev.clientY - h - 14; if (y < 8) y = ev.clientY + 18; }
  tip.style.left = Math.max(8, Math.min(x, innerWidth - w - 8)) + 'px';
  tip.style.top = y + 'px';
}

function aicOnClick(ev) {
  if (aiclOnClick(ev)) return;
  const t = ev.target;
  const q = sel => t.closest && t.closest(sel);
  const retry = q('[data-aic-retry]');
  if (retry) {
    const w = retry.dataset.aicRetry;
    if (w === 'bench') { aic.bench.error = null; aicLoadBench(); aicRefresh('bench'); }
    else if (w === 'uso') { aic.usage.error = null; aicLoadUsage(); aicRefresh('uso'); }
    else if (w === 'users') aicLoadUsers();
    else if (w === 'feed') { aicLoadFeed(); const fe = document.getElementById('aic-feed'); if (fe) fe.innerHTML = aicFeedHtml(); }
    else if (w === 'conv') { aicLoadConv(aic.tab); aicUpdateList(); }
    else if (w.startsWith('chat:')) { const id = w.slice(5); aicLoadChat(id); aicUpdateList(); }
    return;
  }
  const per = q('[data-aic-period]');
  if (per) {
    if (aic.period === per.dataset.aicPeriod) return;
    aic.period = per.dataset.aicPeriod;
    aic.usage.error = null; aic.users.data = null; aic.feed.key = null; aic.feed.data = null;
    aicLoadUsage(); aicRefresh('uso');
    if (aic.usersOpen) aicLoadUsers();
    if (aic.tab === 'feedback') { aicLoadFeed(); const fe = document.getElementById('aic-feed'); if (fe) fe.innerHTML = aicFeedHtml(); }
    return;
  }
  if (q('[data-aic-users]')) {
    aic.usersOpen = !aic.usersOpen;
    if (aic.usersOpen && (aic.users.key !== aicRangeKey(aicRange()) || !aic.users.data)) aicLoadUsers(); else aicRefresh('uso');
    return;
  }
  const tab = q('[data-aic-tab]');
  if (tab) {
    const k = tab.dataset.aicTab;
    if (aic.tab === k) return;
    aic.tab = k; aic.open = null;
    if (!aic.conv[k]) aicLoadConv(k);
    if (k === 'feedback' && aic.feed.key !== aicRangeKey(aicRange())) aicLoadFeed();
    aicRefresh('conv');
    return;
  }
  const row = q('[data-aic-open]');
  if (row) {
    const id = row.dataset.aicOpen;
    if (aic.open === id) aic.open = null;
    else { aic.open = id; if (!aic.chats[id] || aic.chats[id].error) aicLoadChat(id); }
    aicUpdateList();
    return;
  }
  if (q('[data-aic-more]')) {
    const c = aic.conv[aic.tab]; if (c) c.more = true;
    aicUpdateList();
  }
}

function aicUpdateList() {
  const el = document.getElementById('aic-list');
  if (el) el.innerHTML = aicListHtml();
}

function aicAttach() {
  const page = document.getElementById('aic-page');
  if (!page) return;
  page.addEventListener('click', aicOnClick);
  page.addEventListener('input', ev => {
    if (aiclOnInput(ev)) return;
    if (ev.target && ev.target.id === 'aic-search') { aic.query = ev.target.value; aicUpdateList(); }
  });
  page.addEventListener('mousemove', ev => {
    const el = ev.target.closest && ev.target.closest('[data-tip]');
    aicTip(el, ev);
  });
  page.addEventListener('mouseleave', () => aicTip(null));
  if (!aic.wired) {
    aic.wired = true;
    let tm = 0;
    window.addEventListener('resize', () => {
      clearTimeout(tm);
      tm = setTimeout(() => {
        if (state.page !== 'ai-coach' || !document.getElementById('aic-page')) return;
        const nw = aicNarrow();
        if (nw !== aic.narrow) { aic.narrow = nw; aicRefresh('uso'); aicRefresh('conv'); }
      }, 120);
    });
  }
}
