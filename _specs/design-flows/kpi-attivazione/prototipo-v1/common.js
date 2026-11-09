// Dati veri: query Q1 di HANDOFF-attivazione.md, 09/11/2026. Ordine dei valori = PASSI.
const PASSI = ['Primo avvio', 'Workout details', 'Tocca «Avvia»', 'Finisce un esercizio', '1° workout',
  '2° avvio', '2° workout', '3° avvio', '3° workout', '4° avvio', '4° workout'];
const EVENTI = ['first_open', 'view_WorkoutDetail', 'workout_start', 'exercise_complete', 'workout_complete',
  'app_open dopo 30 min fermo', 'workout_complete ×2', 'app_open ×2 dopo 30 min', 'workout_complete ×3', 'app_open ×3 dopo 30 min', 'workout_complete ×4'];
const RAW = [["S3",'25/03','05/04',448,144,106,83,55,227,32,133,17,95,11],["S4",'12/06','18/06',433,247,202,155,101,265,54,180,40,122,33],["S5",'29/06','30/06',224,107,91,73,61,133,29,81,21,52,17],["S6",'01/07','02/07',100,35,24,21,17,45,9,27,5,20,4],["S7",'11/07','12/07',188,99,80,121,60,129,37,91,27,61,22],["S8",'14/07','17/07',333,195,146,128,102,206,50,151,37,100,27],["S9",'22/07','25/07',209,117,82,70,61,127,38,89,26,65,21],["S10",'03/08','11/08',873,440,321,276,199,481,121,330,88,223,61],["S11",'30/08','05/09',202,122,72,57,47,107,22,66,20,40,14],["S12",'07/09','17/09',971,626,413,328,263,537,148,312,116,222,92],["S13",'21/09','23/09',260,86,55,46,34,115,18,53,11,26,9],["S14",'26/09','04/10',258,98,59,51,42,105,15,50,7,30,5],["S15",'04/10','12/10',403,214,118,88,58,185,25,104,19,58,17],["S16",'13/10','18/10',325,152,81,65,52,161,21,88,11,55,9],["S17",'19/10','20/10',93,43,19,13,12,38,3,22,0,13,0],["S18",'21/10','23/10',196,94,50,35,24,93,9,55,6,36,4],["S19",'27/10','02/11',435,228,84,71,52,196,27,98,11,60,7],["S20",'02/11','03/11',55,21,8,7,4,30,2,15,1,7,1],["S21",'04/11','11/11',351,201,109,77,56,161,14,81,6,42,1]];
const OGGI = new Date(2026, 10, 9);
const dmy = s => { const [d, m] = s.split('/').map(Number); return new Date(2026, m - 1, d); };
const SPRINTS = RAW.map(r => {
  const fine = dmy(r[2]);
  const giorni = Math.floor((OGGI - fine) / 864e5);
  return { k: r[0], dal: r[1], al: r[2], v: r.slice(3), coorte: r[3],
    inCorso: giorni < 0, recente: giorni >= 0 && giorni < 14 };
});
const pct = (n, b) => b ? n * 100 / b : 0;
const fp = (n, b) => { const p = pct(n, b); return (p < 10 && p > 0 ? p.toFixed(1).replace('.', ',') : Math.round(p)) + '%'; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const STATO = new URLSearchParams(location.search).get('stato') || 'dati';
const COL = { blue: '#4361ee', orange: '#fb8b04', white: '#ffffff', grey: '#9ca3af', line: '#2a2e37', card: '#1a1d24', bg: '#0f1115' };

function sidebar() {
  const nav = (id, icon, label) => `<button class="nav-item ${id === 'attivazione' ? 'active' : ''}" data-fuori><span class="icon">${icon}</span>${label}</button>`;
  return `<div class="sidebar"><a class="sidebar-logo"><div class="logo-mark">Hype<span>move</span></div><div class="logo-sub">KPI</div></a>
    <nav class="nav"><div class="nav-section">KPI</div>
    ${nav('stats', '📈', 'Stats')}${nav('goal', '🏁', 'Goal')}${nav('overview', '📊', 'Overview')}${nav('funnel', '🎯', 'Funnel')}
    ${nav('attivazione', '🌱', 'Attivazione')}
    ${nav('retention', '🔄', 'Retention')}${nav('sprint', '🏃', 'Sprint')}${nav('premium', '💎', 'Premium')}${nav('ai-coach', '🤖', 'AI Coach')}${nav('behavior', '🖱️', 'Comportamento')}
    <div class="nav-section" style="margin-top:8px">Marketing</div>${nav('meta-ads', '📣', 'Meta ADS')}</nav>
    <div style="padding:14px 20px;border-top:1px solid var(--border);font-size:11px;color:var(--muted)">Mattia &amp; Danilo · 50/50</div></div>`;
}

// Intestazione e stati comuni; body(SPRINTS) disegna il contenuto della proposta.
function mount(sub, body, after) {
  const pending = STATO === 'ricalcolo';
  const mark = STATO === 'primo' || STATO === 'errore' ? '' :
    `<span class="kc-mark${pending ? ' kc-pulse' : ''}">calcolato oggi alle 11:04${pending ? ' · aggiorno…' : ''}</span>`;
  const head = `<div class="st-head"><h1 class="st-h1">Attivazione per sprint</h1><span class="st-grow"></span>
    <span class="st-meta">${mark}</span><button class="st-refresh" data-act="aggiorna" ${pending || STATO === 'primo' ? 'disabled' : ''}>Aggiorna</button></div>
    <p class="ac-sub">${sub}</p>`;
  let content;
  if (STATO === 'primo') content = `<section class="sa-card ac-busy"><div class="pt-err"><div class="fun-empty-ring spin"></div>
      <div class="pt-err-t">Primo calcolo in corso</div><div class="ac-mut">Conta tutti gli eventi di ogni persona dal primo avvio a oggi: ci vuole circa un minuto.</div></div></section>`;
  else if (STATO === 'errore') content = `<section class="sa-card"><div class="pt-err">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/></svg>
      <div class="pt-err-t">Errore nel caricamento</div><button class="pt-retry" data-act="aggiorna">Riprova</button></div></section>`;
  else content = body(SPRINTS);
  document.getElementById('app').innerHTML = sidebar() +
    `<div class="main main-stats"><div class="st-page${pending ? ' ac-pending' : ''}">${head}${content}</div></div>`;
  document.querySelectorAll('[data-fuori]:not(.active)').forEach(b => b.onclick = () => toast('Fuori dal prototipo'));
  document.querySelectorAll('[data-act="aggiorna"]').forEach(b => b.onclick = () => { location.search = '?stato=ricalcolo'; });
  if (after && STATO !== 'primo' && STATO !== 'errore') after(SPRINTS);
}

function toast(t) {
  let el = document.getElementById('ac-toast');
  if (!el) { el = document.createElement('div'); el.id = 'ac-toast'; document.body.appendChild(el); }
  el.textContent = t; el.classList.add('on'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('on'), 1600);
}

// Etichetta dello sprint sull'asse: nome e data d'inizio; grigio se i numeri possono ancora salire.
function sprintTick(s, x, y, anchor, noDate) {
  const c = s.inCorso || s.recente ? COL.grey : COL.white;
  return `<text x="${x}" y="${y}" text-anchor="${anchor || 'middle'}" class="ac-tk" fill="${c}">${s.k}</text>`
    + (noDate ? '' : `<text x="${x}" y="${y + 14}" text-anchor="${anchor || 'middle'}" class="ac-tk2">${s.inCorso ? 'in corso' : s.dal}</text>`);
}
