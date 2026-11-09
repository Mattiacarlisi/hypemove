// Pagina «Attivazione»: funnel di attivazione per sprint a 11 passi, un grafico a linea per passo con le colonne degli
// sprint allineate fra le strisce. Numeri da kpi_activation_sprint, letti solo dalla cache (voce activation_sprint/all).
// Design: www/_specs/design-flows/kpi-attivazione/ (proposta A, scelta da Danilo il 09/11/2026).
const ACT = {
  PASSI: ['Primo avvio', 'Workout details', 'Tocca «Avvia»', 'Finisce un esercizio', '1° workout',
    '2° avvio', '2° workout', '3° avvio', '3° workout', '4° avvio', '4° workout',
    'Entra in Cibo', 'Apre la fotocamera', 'Fa una foto', '1° pasto salvato', '2° pasto salvato', '3° pasto salvato',
    '4° pasto salvato', '5° pasto salvato'],
  EVENTI: ['first_open', 'view_WorkoutDetail', 'workout_start', 'exercise_complete', 'workout_complete',
    'app_open dopo 30 min fermo', 'workout_complete ×2', 'app_open ×2 dopo 30 min', 'workout_complete ×3',
    'app_open ×3 dopo 30 min', 'workout_complete ×4',
    'view_Cibo', 'meal_camera_opened', 'meal_photo_returned', 'meal_scan_saved', 'meal_scan_saved ×2',
    'meal_scan_saved ×3', 'meal_scan_saved ×4', 'meal_scan_saved ×5'],
  GRUPPI: [
    { t: 'La prima volta', d: 'Su 100 persone che aprono l\'app per la prima volta, quante arrivano a ogni passo del primo allenamento.', passi: [1, 2, 3, 4], r: 'Ogni passo su chi ha fatto il passo prima: Workout details sul primo avvio, Avvia su Workout details, Finisce su Avvia, 1° workout su Finisce. Può superare il 100% perché i passi non sono in cascata: quel punto resta sul bordo in alto, con il suo numero.' },
    { t: 'Tornano ad aprire l\'app', d: 'Quante aprono di nuovo l\'app dopo almeno 30 minuti senza usarla.', passi: [5, 7, 9], r: 'Il 2° avvio sul primo avvio, il 3° sul 2°, il 4° sul 3°.' },
    { t: 'Rifanno l\'allenamento', d: 'Quante finiscono un secondo, un terzo, un quarto allenamento.', passi: [6, 8, 10], r: 'Il 2° workout sul 1°, il 3° sul 2°, il 4° sul 3°.' },
    { t: 'Cibo', d: 'Su 100 persone che aprono l\'app per la prima volta, quante arrivano a ogni passo del cibo. Gli sprint iniziati prima che esistesse l\'evento non hanno il punto.', passi: [11, 12, 13, 14, 15, 16, 17, 18],
      r: 'Entra in Cibo sul primo avvio, la fotocamera su chi entra, la foto su chi apre la fotocamera, il 1° pasto su chi entra in Cibo (non sulla foto: quasi tutti salvano scrivendo), poi ogni pasto sul precedente.' },
  ],
  RECENT_DAYS: 14,   // come la scheda «Attivazione per sprint»: entro 14 giorni dalla fine i numeri possono ancora salire
  H: 118, PADT: 22, PADB: 10,
  // «Relativo»: ogni passo diviso per il passo prima nella catena del suo riquadro
  PREV: { 1: 0, 2: 1, 3: 2, 4: 3, 5: 0, 7: 5, 9: 7, 6: 4, 8: 6, 10: 8, 11: 0, 12: 11, 13: 12, 14: 11, 15: 14, 16: 15, 17: 16, 18: 17 },
  // giorno in cui ogni evento del cibo è nato: uno sprint iniziato prima non è misurato
  FROM: { 11: '2026-09-25', 12: '2026-10-18', 13: '2026-10-18', 14: '2026-09-10', 15: '2026-09-10', 16: '2026-09-10', 17: '2026-09-10', 18: '2026-09-10' },
  rows: null, cache: null, error: null, force: false, table: false, w: 0,
  mode: (() => { try { return localStorage.getItem('hm_asp_mode') === 'rel' ? 'rel' : 'tot'; } catch (e) { return 'tot'; } })(),
};

ACT.today = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' });
ACT.dm = d => d.slice(8, 10) + '/' + d.slice(5, 7);
ACT.pct = (n, b) => b ? n * 100 / b : 0;
// base del passo p nello sprint s: chi è entrato (Totale) o chi ha fatto il passo prima (Relativo)
ACT.base = (s, p) => ACT.mode === 'rel' && p in ACT.PREV ? s.v[ACT.PREV[p]] : s.coorte;
ACT.val = (s, p) => s.v[p] == null || ACT.base(s, p) == null ? null : ACT.pct(s.v[p], ACT.base(s, p));
ACT.fp = (n, b) => { const p = ACT.pct(n, b); return (p > 0 && p < 10 ? p.toFixed(1).replace('.', ',') : Math.round(p)) + '%'; };
ACT.sprints = () => {
  const today = ACT.today();
  return (ACT.rows || []).map(r => {
    const days = Math.floor((Date.parse(today) - Date.parse(r.fine)) / 864e5);
    return { k: 'S' + r.numero, dal: ACT.dm(r.inizio), al: ACT.dm(r.fine), v: ACT.PASSI.map((_, j) => r.v[j] == null || (ACT.FROM[j] && r.inizio < ACT.FROM[j]) ? null : r.v[j]),
      from: j => ACT.FROM[j] ? ACT.dm(ACT.FROM[j]) : '', coorte: r.v[0],
      inCorso: r.fine >= today, prov: days < ACT.RECENT_DAYS };
  });
};

async function fetchActivationSprint(force) {
  force = force || ACT.force; ACT.force = false;
  try {
    const { data, error } = await sb.rpc('kpi_cache_get', { p_query: 'activation_sprint', p_scope: 'all', p_force: false });
    if (error) throw error;
    if (data && Array.isArray(data.data)) {
      ACT.rows = data.data; ACT.error = null;
      ACT.cache = { computedAt: data.computed_at, pending: !!(force || data.stale), failed: kcFailed(data), fresh: false };
      render();
      if (!ACT.cache.pending) return;
    } else {
      ACT.cache = null;
      if (state.page === 'attivazione') render();
    }
  } catch (e) {
    console.error('fetchActivationSprint', e);
    ACT.error = e.message || 'Errore caricamento attivazione';
    render();
    return;
  }
  const r = await kpiRecompute('activation_sprint', 'all', force || !ACT.rows);
  if (r.data && Array.isArray(r.data)) {
    ACT.rows = r.data; ACT.error = null;
    ACT.cache = { computedAt: r.computed_at, pending: false, failed: r.failed, fresh: !!r.recomputed };
  } else if (ACT.rows) {
    ACT.cache = { ...ACT.cache, pending: false, failed: true, fresh: false };
  } else {
    ACT.error = 'Attivazione per sprint non disponibile';
  }
  render();
  if (ACT.cache) ACT.cache.fresh = false;
}

function actGeo(n, w) { const step = (w - 16) / n; return { step, X: i => 8 + step * (i + .5) }; }
const actNiceMax = v => Math.max(10, Math.ceil(v / 10) * 10);

function actStrip(S, p, max, w) {
  const { H, PADT, PADB } = ACT, { step, X } = actGeo(S.length, w);
  const Y = v => PADT + (H - PADT - PADB) * (1 - Math.min(v, max) / max);
  const vals = S.map(s => ACT.val(s, p)), labels = step >= 22;
  let s = `<svg width="${w}" height="${H}" role="img" aria-label="${esc(ACT.PASSI[p])} per sprint">`;
  [0, max / 2, max].forEach(v => s += `<line class="asp-gh" x1="0" x2="${w}" y1="${Y(v)}" y2="${Y(v)}"${v ? ' stroke-dasharray="2 4"' : ''}/>`);
  S.forEach((sp, i) => s += `<rect class="asp-col" data-i="${i}" x="${X(i) - step / 2}" y="0" width="${step}" height="${H}"/>`);
  let solid = '', dash = '';
  vals.forEach((v, i) => {
    if (!i || v == null || vals[i - 1] == null) return;
    const seg = `M${X(i - 1)},${Y(vals[i - 1])}L${X(i)},${Y(v)}`;
    if (S[i].prov) dash += seg; else solid += seg;
  });
  s += `<path d="${solid}" class="asp-line"/><path d="${dash}" class="asp-line" stroke-dasharray="4 4"/>`;
  vals.forEach((v, i) => {
    if (v == null) return;
    const pr = S[i].prov;
    s += `<circle cx="${X(i)}" cy="${Y(v)}" r="4" class="asp-dot${pr ? ' prov' : ''}"/>`;
    if (labels) s += `<text class="asp-val${pr ? ' prov' : ''}" x="${X(i)}" y="${Y(v) - 9}" text-anchor="middle">${Math.round(v)}</text>`;
  });
  s += `<text class="asp-axis" x="${w - 2}" y="${Y(max) - 6}" text-anchor="end">${max}%</text>`;
  return s + '</svg>';
}

function actTicks(S, w) {
  const { step, X } = actGeo(S.length, w);
  let s = `<svg width="${w}" height="44">`;
  S.forEach((sp, i) => {
    // colonne strette (telefono): uno sprint sì e uno no, senza data né persone, che restano nel riquadro al tocco
    if (step < 30 && i % 2 && i !== S.length - 1) return;
    s += `<text x="${X(i)}" y="15" text-anchor="middle" class="asp-tk${sp.prov ? ' prov' : ''}">${sp.k}</text>`;
    if (step < 30) return;
    s += `<text x="${X(i)}" y="29" text-anchor="middle" class="asp-tk2">${sp.inCorso ? 'in corso' : sp.dal}</text>`;
    s += `<text x="${X(i)}" y="41" text-anchor="middle" class="asp-tk3">${sp.coorte}</text>`;
  });
  return s + '</svg>';
}

// Nomi degli sprint in piccolo in fondo a ogni riquadro, sotto le colonne.
function actXTicks(S, w) {
  const { step, X } = actGeo(S.length, w);
  let s = `<svg width="${w}" height="18" aria-hidden="true">`;
  S.forEach((sp, i) => {
    if (step < 30 && i % 2 && i !== S.length - 1) return;
    s += `<text x="${X(i)}" y="12" text-anchor="middle" class="asp-xt${sp.prov ? ' prov' : ''}">${sp.k}</text>`;
  });
  return s + '</svg>';
}

function actTable(S) {
  const head = '<tr><th>Sprint</th>' + ACT.PASSI.map(p => `<th>${esc(p)}</th>`).join('') + '</tr>';
  const rows = S.map(s => `<tr${s.prov ? ' class="prov"' : ''}><td><b>${s.k}</b><span>${s.inCorso ? 'in corso' : 'dal ' + s.dal}</span></td>`
    + s.v.map((n, j) => n == null ? '<td><span>—</span></td>' : `<td><b>${n}</b>${j ? `<span>${ACT.val(s, j) == null ? '' : ACT.fp(n, ACT.base(s, j))}</span>` : ''}</td>`).join('') + '</tr>').join('');
  return `<div class="asp-tw"><table class="asp-tab">${head}${rows}</table></div>`;
}

function pageActivationSprint() {
  const pending = !!(ACT.cache && ACT.cache.pending);
  const head = `<div class="st-head"><button class="nav-toggle nav-toggle-desk" data-nav-toggle
      title="${state.navCollapsed ? 'Mostra il menu' : 'Nascondi il menu'}" aria-label="Mostra o nascondi il menu">${NAV_PANEL_ICON}</button>
    <h1 class="st-h1">Attivazione per sprint</h1>${ACT.rows ? `<div class="asp-mode" role="group" aria-label="Base delle percentuali"><button class="sa-phases${ACT.mode === 'tot' ? ' pt-on' : ''}" data-asp-mode="tot" aria-pressed="${ACT.mode === 'tot'}">Totale</button><button class="sa-phases${ACT.mode === 'rel' ? ' pt-on' : ''}" data-asp-mode="rel" aria-pressed="${ACT.mode === 'rel'}">Relativo</button></div>` : ''}<span class="st-grow"></span>
    ${ACT.cache ? `<span class="st-meta">${kcMark(ACT.cache)}</span>` : ''}
    <button class="st-refresh" data-asp-refresh ${pending || !ACT.rows ? 'disabled' : ''}>Aggiorna</button></div>
    <p class="asp-sub">Ogni striscia è un passo, ogni colonna uno sprint: ${ACT.mode === 'rel' ? '<b>su 100 persone che hanno fatto il passo prima, quante fanno questo</b> (Avvia su Workout details, Finisce su Avvia…)' : '<b>su 100 persone al primo avvio, quante arrivano a quel passo</b>'}, contando fino a oggi. I passi non sono in cascata: il secondo avvio non richiede il primo allenamento.</p>`;
  let body;
  if (ACT.error && !ACT.rows) {
    body = `<section class="sa-card"><div class="pt-err">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/></svg>
      <div class="pt-err-t">Errore nel caricamento</div><button class="pt-retry" data-asp-retry>Riprova</button></div></section>`;
  } else if (!ACT.rows) {
    body = `<section class="sa-card"><div class="pt-err"><div class="fun-empty-ring spin"></div>
      <div class="pt-err-t">Primo calcolo in corso</div><div class="asp-mut">Conta tutti gli eventi di ogni persona dal primo avvio a oggi: ci vuole circa un minuto.</div></div></section>`;
  } else {
    const S = ACT.sprints();
    const groups = ACT.GRUPPI.map(g => {
      // in Relativo la scala si ferma al 100%: un passo che supera quello prima resta sul bordo col suo numero
      const top = actNiceMax(Math.max(0, ...g.passi.flatMap(p => S.map(s => ACT.val(s, p))).filter(v => v != null)));
      const max = ACT.mode === 'rel' ? Math.min(100, top) : top;
      return `<section class="sa-card asp-g"><h2 class="sa-title">${g.t}</h2><p class="asp-gd">${ACT.mode === 'rel' ? g.r : g.d} Le strisce di questo riquadro hanno la stessa scala, da 0 a ${max}%.</p>`
        + g.passi.map(p => `<div class="asp-row"><div class="asp-lab"><b>${esc(ACT.PASSI[p])}</b><span>${esc(ACT.EVENTI[p])}</span></div><div class="asp-plot" data-p="${p}" data-max="${max}"></div></div>`).join('')
        + '<div class="asp-row asp-xrow"><div class="asp-lab"></div><div class="asp-plot asp-xticks"></div></div></section>';
    }).join('');
    body = `<div class="asp-sticky"><div class="asp-row asp-trow"><div class="asp-lab"><span>Sprint · persone al primo avvio</span></div><div class="asp-plot asp-ticks"></div></div></div>
      ${groups}
      <div class="asp-legend"><span><svg width="26" height="8" aria-hidden="true"><line x1="0" x2="26" y1="4" y2="4" class="asp-line"/></svg>Sprint chiuso da più di ${ACT.RECENT_DAYS} giorni</span>
      <span><svg width="26" height="10" aria-hidden="true"><line x1="0" x2="26" y1="5" y2="5" class="asp-line" stroke-dasharray="4 4"/><circle cx="13" cy="5" r="3.5" class="asp-dot prov"/></svg>Sprint in corso o chiuso da meno di ${ACT.RECENT_DAYS} giorni: i numeri possono ancora salire</span></div>
      <section class="sa-card asp-tcard"><button class="sa-phases${ACT.table ? ' pt-on' : ''}" data-asp-table aria-expanded="${ACT.table}">${ACT.table ? 'Nascondi i numeri' : 'Mostra i numeri'}</button>${ACT.table ? actTable(S) : ''}</section>`;
  }
  return `<div class="st-page asp-page">${head}${body}</div>`;
}

// I grafici si disegnano alla larghezza vera della colonna, dopo ogni render e quando cambia la finestra.
function actDraw() {
  const plot = document.querySelector('.asp-plot');
  if (!plot || !ACT.rows) return;
  const w = Math.round(plot.clientWidth);
  if (!w) return;
  ACT.w = w;
  const S = ACT.sprints();
  document.querySelector('.asp-ticks').innerHTML = actTicks(S, w);
  const xt = actXTicks(S, w);
  document.querySelectorAll('.asp-xticks').forEach(el => el.innerHTML = xt);
  document.querySelectorAll('.asp-plot[data-p]').forEach(el => el.innerHTML = actStrip(S, +el.dataset.p, +el.dataset.max, w));
  let tip = document.querySelector('.asp-tip');
  if (!tip) { tip = document.createElement('div'); tip.className = 'asp-tip'; document.body.appendChild(tip); }
  tip.style.display = 'none';
  const off = () => { document.querySelectorAll('.asp-col.on').forEach(c => c.classList.remove('on')); tip.style.display = 'none'; };
  document.querySelectorAll('.asp-col').forEach(r => {
    r.addEventListener('mouseenter', () => {
      const i = +r.dataset.i, sp = S[i], p = +r.closest('.asp-plot').dataset.p;
      off();
      document.querySelectorAll(`.asp-col[data-i="${i}"]`).forEach(c => c.classList.add('on'));
      tip.innerHTML = `<b>${sp.k}</b> <span class="m">${sp.dal} → ${sp.al}${sp.inCorso ? ', in corso' : ''}</span><br>${esc(ACT.PASSI[p])}: ${sp.v[p] == null ? `non misurato: l\'evento esiste dal ${sp.from(p)}` : `<b>${sp.v[p]}</b> su ${ACT.base(sp, p)}${ACT.mode === 'rel' ? ' (' + esc(ACT.PASSI[ACT.PREV[p]]) + ')' : ''} · <b>${ACT.fp(sp.v[p], ACT.base(sp, p))}</b>`}`;
      tip.style.display = 'block';
    });
    r.addEventListener('mousemove', e => { tip.style.left = Math.min(e.clientX + 14, innerWidth - 240) + 'px'; tip.style.top = (e.clientY + 14) + 'px'; });
    r.addEventListener('mouseleave', off);
  });
}

let actResizeBound = false;
function attachActivationSprint() {
  document.querySelector('.asp-tip')?.style.setProperty('display', 'none');
  if (state.page !== 'attivazione') return;
  document.querySelector('[data-asp-refresh]')?.addEventListener('click', () => fetchActivationSprint(true));
  document.querySelector('[data-asp-retry]')?.addEventListener('click', () => { ACT.error = null; render(); fetchActivationSprint(true); });
  document.querySelectorAll('[data-asp-mode]').forEach(b => b.addEventListener('click', () => {
    ACT.mode = b.dataset.aspMode;
    try { localStorage.setItem('hm_asp_mode', ACT.mode); } catch (e) { /* resta in memoria */ }
    render();
  }));
  document.querySelector('[data-asp-table]')?.addEventListener('click', () => { ACT.table = !ACT.table; render(); });
  actDraw();
  if (!actResizeBound) {
    actResizeBound = true;
    addEventListener('resize', () => {
      const plot = state.page === 'attivazione' && document.querySelector('.asp-plot');
      if (plot && Math.abs(Math.round(plot.clientWidth) - ACT.w) >= 6) actDraw();
    });
  }
}
