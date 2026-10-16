// KPI Dashboard — pagina «AI Coach»: Benchmark a righe con «Il ciclo intero» e scheda «Chat da correggere».
// Caricato DOPO kpi-ai-coach.js (usa aic, aicRpc, aicIc, aicError, aicErrMsg, aicNarrow, aicFi, AIC, AIC_SCREEN, AIC_CHD, ...).
// Misure, colori e testi copiano la tavola intera-1-pagina (_specs/design-flows/kpi-ai-coach-lista).
// Dati della lista: SOLO le RPC kpi_coach_broken_chats, kpi_coach_broken_chat_detail, kpi_coach_broken_chat_comment.
// Tutto il testo che viene dal database entra come testo (esc), mai come HTML.

// ── mappe (un punto solo) ─────────────────────────────────────────────
// Stato del database → [classe, parola]. «commented» e «fixing» sono entrambe «commentata» (il commento c'è,
// il giro di correzione ci sta lavorando); «failed» torna a Danilo e Mattia come «ambigua». «closed» è risolta:
// non sta nella lista.
const AICL_STATUS = {
  open:      ['open', 'da commentare'],
  ambiguous: ['amb',  'ambigua: riscrivi il commento'],
  failed:    ['amb',  'non riuscita'],
  commented: ['done', 'commentata'],
  queued:    ['q',    'in coda'],
  fixing:    ['fix',  'in lavorazione'],
  closed:    ['ok',   'corretta'],
  merged:    ['ok',   'unita'],
};
// Le cinque sezioni (Finito = unite in bender negli ultimi 7 giorni), nell'ordine in cui si mostrano. `queued` si può ricommentare (esce dalla coda), `fixing` e `closed` no.
const AICL_SECS = [
  { k: 'todo',   title: 'Da commentare', states: ['open', 'ambiguous', 'failed'], empty: 'Nessuna chat da commentare.', open: true },
  { k: 'done',   title: 'Commentato',    states: ['commented'],                   empty: 'Nessuna chat commentata.',    open: true },
  { k: 'queue',  title: 'Da correggere', states: ['queued', 'fixing'],            empty: 'Nessuna chat da correggere.', open: false },
  { k: 'closed', title: 'Corretto',      states: ['closed'],                      empty: 'Nessuna chat corretta.',      open: false },
  { k: 'merged', title: 'Finito',        states: ['merged'],                      empty: 'Nessuna chat finita negli ultimi 7 giorni.', open: false },
];
const AICL_LS = 'aicl-sezioni';
function aiclSecLoad() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(AICL_LS) || '{}') || {}; } catch (e) { saved = {}; }
  const o = {};
  AICL_SECS.forEach(x => { o[x.k] = { open: typeof saved[x.k] === 'boolean' ? saved[x.k] : x.open, big: false }; });
  return o;
}
function aiclSecSave() {
  try { localStorage.setItem(AICL_LS, JSON.stringify(Object.fromEntries(AICL_SECS.map(x => [x.k, !!aicl.sec[x.k].open])))); } catch (e) { /* senza memoria resta com'è */ }
}
const AICL_TO_COMMENT = ['open', 'ambiguous', 'failed'];   // gli stati che pesano nel conteggio «da commentare»
const AICL_LOCKED = ['fixing', 'closed', 'merged'];                   // gli stati che la RPC di commento rifiuta

// Codici di `reasons` → frase breve. Se manca la frase si mostra il codice.
const AICL_REASONS = {
  form_infedele: 'Il form non corrisponde a ciò che si è detto',
  lingua_sbagliata: 'Risponde nella lingua sbagliata',
  richiesta_ignorata: 'Ignora ciò che è stato chiesto',
  strumento_fuori_tema: 'Usa uno strumento che non c\'entra',
  non_fatto: 'Dice di aver fatto ma non l\'ha fatto',
  ripete: 'Ripete la stessa risposta',
  lettura: 'Legge male il messaggio',
};
const aiclReasons = r => (Array.isArray(r) ? r : []).map(c => AICL_REASONS[c] || String(c));

const AICL_DAYS = 14;

const aicl = {
  data: null, error: null, loading: false,     // l'elenco intero (tutti gli stati)
  show: true, open: null, more: false,
  detail: {},                                  // id → { data, error, loading }
  draft: {},                                   // id → testo del commento, anche non salvato
  save: {},                                    // id → { st: 'saving'|'saved'|'error', msg }
  sec: null,                                   // k → { open, big }
  send: { st: '', msg: '', err: false },
  merge: { st: '', msg: '', err: false },      // il bottone «Unisci»
  mergeReq: null,                              // l'ultima richiesta di unione (kpi_coach_merge_status)
  rep: {},                                     // id → { items: {indice messaggio: commento}, general } (dopo il caricamento del dettaglio)
  ui: {},                                      // id → { indice: { mode, draft, st, msg, confirm } }
  busy: {},
  seq: 0,
};

// ── utilità ───────────────────────────────────────────────────────────
const aiclShort = id => String(id || '').replace(/-/g, '').slice(0, 8) || '—';
const AICL_DTF = new Intl.DateTimeFormat('it-IT', { timeZone: 'Europe/Rome', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
function aiclWhen(ts) {
  const d = new Date(ts);
  if (isNaN(d)) return '—';
  const p = {}; AICL_DTF.formatToParts(d).forEach(x => { p[x.type] = x.value; });
  return `${p.day}/${p.month} ${p.hour === '24' ? '00' : p.hour}:${p.minute}`;
}
const aiclDay = ts => { const d = new Date(ts); return isNaN(d) ? null : romeDay(d); };
const aiclRows = () => aicl.data || [];
const aiclToComment = () => aiclRows().filter(r => AICL_TO_COMMENT.includes(r.status)).length;
const aiclRow = id => (aicl.data || []).find(r => String(r.id) === String(id));

// Segnalate per giorno (giorno del messaggio, ora di Roma), ultimi 14 giorni, oggi compreso. Tutti gli stati.
function aiclPerDay() {
  const today = romeDay(new Date());
  const days = []; for (let i = AICL_DAYS - 1; i >= 0; i--) days.push(addDays(today, -i));
  const cnt = {}; (aicl.data || []).forEach(r => { const d = aiclDay(r.message_at || r.found_at); if (d) cnt[d] = (cnt[d] || 0) + 1; });
  return { today, days, vals: days.map(d => cnt[d] || 0) };
}

// ── caricamento ───────────────────────────────────────────────────────
async function aiclLoad() {
  const seq = ++aicl.seq;
  aicl.loading = true; aicl.error = null;
  try {
    const data = await aicRpc('kpi_coach_broken_chats');
    if (!Array.isArray(data)) throw new Error('risposta inattesa');
    if (seq !== aicl.seq) return;
    aicl.data = data;
    aiclMergeStatus();
  } catch (e) {
    if (seq !== aicl.seq) return;
    console.error('aiclLoad', e); aicl.error = aicErrMsg(e);
  }
  aicl.loading = false;
  aicRefresh('bench'); aicRefresh('lista');
}

async function aiclLoadDetail(id) {
  const d = aicl.detail[id] = { data: null, error: null, loading: true };
  aiclPaintChat(id);
  try {
    const data = await aicRpc('kpi_coach_broken_chat_detail', { p_id: Number(id) });
    if (!data || !Array.isArray(data.messages)) throw new Error('chat non trovata');
    d.data = data;
    aiclRepInit(id);
  } catch (e) {
    console.error('aiclLoadDetail', e); d.error = aicErrMsg(e);
  }
  d.loading = false;
  aiclPaintChat(id);
}

function aiclEnsure() {
  if (!aicl.data && !aicl.loading && !aicl.error) aiclLoad();
}

// ── BENCHMARK a righe ─────────────────────────────────────────────────
const aiclPct = g => 100 * g.giusti / g.casi;
const aiclOk = (g, soglia) => g.giusti * 100 >= soglia * g.casi;
// scala 60–100 %, sotto il 60 il punto resta sul fondo
const aiclY = v => (100 - Math.max(60, Math.min(100, v))) / 40 * 100;

function aiclSpark(p, soglia) {
  const g = p.giri || [], n = g.length;
  const xs = i => (n === 1 ? 50 : i / (n - 1) * 100);
  const pts = g.map((c, i) => `${xs(i).toFixed(2)},${aiclY(aiclPct(c)).toFixed(2)}`).join(' ');
  const L = g[n - 1], ok = aiclOk(L, soglia);
  const dots = g.map((c, i) => {
    const last = i === n - 1, good = aiclOk(c, soglia);
    const tip = `Giro ${i + 1} · ${String(c.quando || '').slice(-5)}|${c.giusti} su ${c.casi}`;
    return `<i class="aicl-dot${last ? ' aicl-last' : ''}${good ? ' aicl-good' : ''}" style="left:${xs(i).toFixed(2)}%;top:${aiclY(aiclPct(c)).toFixed(2)}%" data-tip="${esc(tip)}" data-tipk="b"></i>`;
  }).join('');
  return `<div class="aicl-sp" role="img" aria-label="${esc(`${g.length} giri, l'ultimo ${L.giusti} su ${L.casi}`)}">
    <div class="aicl-spp"><i class="aicl-thr" style="top:${aiclY(soglia).toFixed(2)}%"></i>
      ${n > 1 ? `<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts}" vector-effect="non-scaling-stroke"/></svg>` : ''}${dots}</div>
    <span class="aicl-thl" style="top:${aiclY(soglia).toFixed(2)}%">${soglia}%</span></div>`;
}

function aiclCycleRow() {
  const L = aicl;
  let mid, btn;
  const off = !L.data;
  if (L.error) {
    mid = `<div class="aicl-cyerr">${esc(L.error)} · <button class="aicl-lnk" data-aicl-retry>Riprova</button></div>`;
  } else if (off) {
    mid = `<i class="aic-sk" style="display:block;height:48px;border-radius:10px"></i>`;
  } else {
    const { today, days, vals } = aiclPerDay();
    const mx = Math.max(...vals, 0), n = vals.length, last = n - 1;
    const bars = vals.map((v, i) => {
      const h = mx ? Math.max(v ? 4 : 0, v / mx * 100) : 0;
      const tip = `${days[i].slice(8, 10)}/${days[i].slice(5, 7)}|${aicFi(v)} ${v === 1 ? 'chat segnalata' : 'chat segnalate'}`;
      return `<div class="aicl-bc" data-tip="${esc(tip)}" data-tipk="b">${v === 0 ? '<i class="aicl-b0"></i>' : `<i class="aicl-bb${i === last ? ' aicl-today' : ''}" style="height:${h.toFixed(1)}%"></i>`}</div>`;
    }).join('');
    const mi = vals.indexOf(mx);
    const pk = (i, extra) => `<span class="aicl-pk" style="left:${((i + .5) / n * 100).toFixed(2)}%;bottom:calc(${(vals[i] / mx * 100).toFixed(1)}% + 4px);${extra || ''}">${aicFi(vals[i])}</span>`;
    let labs = '';
    if (mx > 0) {
      if (mi !== last) labs += pk(mi);
      if (vals[last] > 0) labs += pk(last);
    }
    const dd = i => `${days[i].slice(8, 10)}/${days[i].slice(5, 7)}`;
    mid = `<div class="aicl-bars"><div class="aicl-bcs">${bars}${labs}</div>
      <div class="aicl-bx"><span style="left:${(.5 / n * 100).toFixed(2)}%">${dd(0)}</span><span style="left:${((7 + .5) / n * 100).toFixed(2)}%">${dd(7)}</span><span class="aicl-xt" style="right:0">oggi</span></div></div>`;
  }
  const num = off || L.error ? '—' : aicFi(aiclToComment());
  btn = `<button class="aicl-go" data-aicl-toggle aria-expanded="${L.show}" aria-controls="aic-lista">Chat da correggere<svg class="aic-ico" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>`;
  return `<div class="aicl-row aicl-cy"><div class="aicl-n"><div class="aicl-nn">Il ciclo intero</div><div class="aicl-nm">chat segnalate al giorno, ${AICL_DAYS} giorni</div></div>
    <div class="aicl-v"><b>${num}</b><small>da commentare</small></div><div class="aicl-cm">${mid}</div>${btn}</div>`;
}

function aicBenchHtml() {
  const b = aic.bench, d = b.data;
  const head = soglia => `<div class="aicl-bh"><h2 class="aic-h2">Benchmark</h2><div class="aic-soglia"><svg width="30" height="12" aria-hidden="true"><line x1="2" y1="6" x2="28" y2="6" stroke="${AIC.ORG}" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="6 5"/></svg>Soglia ${soglia}%</div></div>`;
  if (b.error) return `<div class="aic-card aicl-bench">${head(99)}<div class="aicl-berr">${aicError(b.error, 'bench')}</div>${aiclCycleRow()}</div>`;
  if (!d) {
    const sk = [0, 1, 2].map(() => `<div class="aicl-row"><div class="aicl-n"><i class="aic-sk" style="display:block;width:120px;height:16px"></i><i class="aic-sk" style="display:block;width:60px;height:12px;margin-top:8px"></i></div>
      <div class="aicl-v"><i class="aic-sk" style="display:block;width:110px;height:40px;border-radius:10px"></i></div><div class="aicl-cm"><i class="aic-sk" style="display:block;height:40px;border-radius:10px"></i></div></div>`).join('');
    return `<div class="aic-card aicl-bench">${head(99)}${sk}</div>`;
  }
  const soglia = d.soglia || 99;
  const steps = d.passaggi.filter(p => p.id !== 'ciclo');
  const on = steps.filter(p => (p.giri || []).length), offs = steps.filter(p => !(p.giri || []).length);
  const rows = on.map(p => {
    const g = p.giri, L = g[g.length - 1], ok = aiclOk(L, soglia);
    return `<div class="aicl-row"><div class="aicl-n"><div class="aicl-nn">${esc(p.nome)}</div><div class="aicl-nm">${esc(p.modello || '')}</div></div>
      <div class="aicl-v${ok ? ' aicl-ok' : ''}"><b>${L.giusti}</b><small>su ${L.casi}</small></div><div class="aicl-cm">${aiclSpark(p, soglia)}</div></div>`;
  }).join('');
  const offHtml = offs.length ? `<div class="aicl-offs">${offs.map(p => `<div class="aicl-off"><div class="aicl-offn">${esc(p.nome)}</div><div class="aicl-offm">Nessun giro</div></div>`).join('')}</div>` : '';
  return `<div class="aic-card aicl-bench">${head(soglia)}${rows}${offHtml}${aiclCycleRow()}</div>`;
}

// ── CHAT DA CORREGGERE ────────────────────────────────────────────────
function aiclStatus(s) {
  const m = AICL_STATUS[s] || ['amb', String(s || '—')];
  return `<span class="aicl-st aicl-st-${m[0]}"><i></i>${esc(m[1])}</span>`;
}

function aiclRowHtml(r) {
  const open = String(aicl.open) === String(r.id);
  const scr = AIC_SCREEN[r.context_key] || r.context_key || '—';
  const why = aiclReasons(r.reasons).join(', ') || r.agent_note || '—';
  const msg = r.user_message == null || String(r.user_message).trim() === '' ? '—' : `«${esc(String(r.user_message).trim())}»`;
  const head = `<button class="aicl-lr${open ? ' aicl-lr-on' : ''}" data-aicl-open="${esc(r.id)}" aria-expanded="${open}">
    <span class="aicl-c1"><span class="aicl-who">${msg}</span><span class="aicl-sub">Utente ${esc(aiclShort(r.user_id))} · ${esc(scr)} · ${esc(aiclWhen(r.message_at || r.found_at))}</span></span>
    <span class="aicl-c2${r.coach_reply ? '' : ' aicl-none'}">${esc(r.coach_reply || 'Nessuna risposta')}</span>
    <span class="aicl-c3">${esc(why)}${(r.status === 'ambiguous' || r.status === 'failed') && r.judge_note ? `<span class="aicl-jn" title="${esc(r.judge_note)}">${esc(r.judge_note)}</span>` : ''}</span>
    <span class="aicl-c4">${aiclStatus(r.status)}${['closed', 'merged'].includes(r.status) && (r.fix_commit || r.closed_at) ? `<span class="aicl-fx">${esc([r.fix_commit ? 'commit ' + String(r.fix_commit).slice(0, 8) : '', r.merged_at ? 'unita ' + aiclWhen(r.merged_at) : r.closed_at ? aiclWhen(r.closed_at) : ''].filter(Boolean).join(' · '))}</span>` : ''}</span></button>`;
  return `<div class="aicl-item">${head}${open ? aiclPanelHtml(r) : ''}</div>`;
}

// ── COSA HA FATTO IL COACH ────────────────────────────────────────────
// Dalle `calls` della RPC di dettaglio: azioni vere (con esito), letture (attenuate), passaggi interni (ignorati).
const AICL_INTERNAL = ['router_call', 'routing_contract', 'coach_flow', 'honesty_judge_call', 'honesty_guard', 'workout_validator_rejects', 'plan_adapt', 'module_plan', 'qa', 'commit_premium_nodes_batch'];
const AICL_READS = {
  get_exercises: 'esercizi', get_workout_details: 'dettaglio allenamento', get_roadmap_progress: 'avanzamento del percorso', get_user_pt_context: 'contesto del coach',
  get_user_profile: 'profilo', get_nutrition_log: 'diario alimentare', get_user_workouts: 'allenamenti', web_search: 'ricerca web',
};
const AICL_ACTIONS = {
  save_coach_note: 'Ha salvato una nota', ricorda: 'Ha salvato una nota',
  create_workout: 'Ha creato un allenamento', crea_allenamento: 'Ha creato un allenamento',
  propose_workout: 'Ha proposto un allenamento',
  plan_change: 'Ha cambiato il piano', riscrivi_piano: 'Ha cambiato il piano', modify_plan_workout: 'Ha cambiato il piano',
  riscrivi_allenamento: 'Ha cambiato l\'allenamento', cambia_esercizi: 'Ha cambiato l\'allenamento',
  set_exercise_preference: 'Ha segnato un esercizio',
  update_daily_state: 'Ha aggiornato lo stato di oggi',
  apply_goal_change: 'Ha cambiato l\'obiettivo',
  save_equipment: 'Ha salvato l\'attrezzatura', save_training_level: 'Ha salvato il livello', save_weight: 'Ha registrato il peso',
  log_activity: 'Ha registrato un\'attività', registra_pasto: 'Ha registrato un pasto',
  propose_medical_update: 'Ha proposto un dato di salute',
  propose_bug_report: 'Ha aperto una segnalazione', send_bug_report: 'Ha aperto una segnalazione',
  propose_operator_contact: 'Ha proposto il contatto con un operatore', confirm_operator_contact: 'Ha proposto il contatto con un operatore',
};
// Card in chat: [etichetta, posto]. Il posto replica l'ordine fisso con cui l'app le disegna sotto la risposta
// (app/src/components/AIChatSheet/AIChatContent.tsx, blocco `cards`, righe ~1893-2060: piano, allenamento, peso, attività, memoria,
// obiettivo, livello, segnalazione, operatore); a pari posto vale l'ordine delle chiamate.
const AICL_CARDS = {
  plan_change: ['Piano cambiato', 1], riscrivi_piano: ['Piano cambiato', 1], modify_plan_workout: ['Piano cambiato', 1],
  propose_workout: ['Allenamento proposto', 2], create_workout: ['Allenamento creato', 2], crea_allenamento: ['Allenamento creato', 2],
  save_weight: ['Peso registrato', 3], log_activity: ['Attività registrata', 4],
  save_coach_note: ['Nota salvata', 8], ricorda: ['Nota salvata', 8],
  apply_goal_change: ['Obiettivo cambiato', 9], save_training_level: ['Livello salvato', 10],
  propose_bug_report: ['Segnalazione aperta', 13], send_bug_report: ['Segnalazione aperta', 13],
  propose_operator_contact: ['Contatto con operatore proposto', 14], confirm_operator_contact: ['Contatto con operatore proposto', 14],
  riscrivi_allenamento: ['Allenamento cambiato', 20], cambia_esercizi: ['Allenamento cambiato', 20], set_exercise_preference: ['Esercizio segnato', 20],
  update_daily_state: ['Stato di oggi aggiornato', 20], save_equipment: ['Attrezzatura salvata', 20], registra_pasto: ['Pasto registrato', 20],
  propose_medical_update: ['Dato di salute proposto', 20],
};
const aiclObj = v => {
  if (typeof v === 'string') { try { v = JSON.parse(v); } catch (e) { return {}; } }
  return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
};
const aiclTxt = v => (v == null || v === '' ? '' : typeof v === 'string' ? v : JSON.stringify(v));

// Una voce per azione vera: { label, extra, detail, fail, why, name }.
function aiclActions(calls) {
  const acts = [], reads = [], seen = new Set();
  (Array.isArray(calls) ? calls : []).forEach(c => {
    const list = Array.isArray(c && c.tool_calls) ? c.tool_calls : [];
    list.forEach(t => {
      const name = String((t && t.name) || '');
      if (!name || AICL_INTERNAL.includes(name)) return;
      const args = aiclObj(t.args), res = aiclObj(t.result);
      const key = name + '|' + JSON.stringify(t.args == null ? null : t.args);
      if (seen.has(key)) return;
      seen.add(key);
      if (AICL_READS[name]) { if (!reads.includes(AICL_READS[name])) reads.push(AICL_READS[name]); return; }
      const dati = aiclObj(res.dati);
      const cd = AICL_CARDS[name] || [name, 20];
      const a = { name, card: cd[0], rank: cd[1], label: AICL_ACTIONS[name] || name, extra: '', detail: '', fail: false, why: '' };
      if (name === 'save_coach_note' || name === 'ricorda') {
        a.detail = aiclTxt(args.note || dati.testo);
        if (args.affects_training === true || res.affects_training === true || dati.affects_training === true) a.extra = 'incide sugli allenamenti';
      } else if (name === 'create_workout' || name === 'crea_allenamento') a.detail = aiclTxt(res.name || dati.nome);
      else if (name === 'propose_workout') a.detail = aiclTxt(aiclObj(res.card_payload).name);
      else if (name === 'set_exercise_preference') a.detail = aiclTxt(res.exercise_name);
      const callErr = c && c.error != null && c.error !== '' ? aiclTxt(c.error) : '';
      if (res.error != null && res.error !== '' && res.error !== false) { a.fail = true; a.why = aiclTxt(res.error); }
      else if (res.fatto === false) { a.fail = true; a.why = aiclTxt(res.motivo || res.dettaglio); }
      else if (callErr) { a.fail = true; a.why = callErr; }
      acts.push(a);
    });
  });
  return { acts, reads };
}

// Le card del turno segnalato, nell'ordine in cui l'app le mostra: dopo il testo della risposta, per posto fisso e poi per chiamata.
function aiclCardsHtml(id) {
  const d = aicl.detail[id];
  if (!d || !d.data || !Array.isArray(d.data.calls)) return '';
  const calls = d.data.calls.map((c, i) => [c, i]).sort((x, y) => String(x[0].created_at || '').localeCompare(String(y[0].created_at || '')) || x[1] - y[1]).map(x => x[0]);
  const acts = aiclActions(calls).acts.map((a, i) => [a, i]).sort((x, y) => x[0].rank - y[0].rank || x[1] - y[1]).map(x => x[0]);
  return acts.map(a => {
    const sub = a.fail ? (a.why || 'Non riuscita') : a.detail;
    const note = a.fail ? 'non riuscita, l\'utente non ha visto niente' : (a.extra || '');
    return `<div class="aicl-card${a.fail ? ' aicl-card-bad' : ''}" title="${esc([a.card, sub, note].filter(Boolean).join(': '))}">
      <span class="aicl-card-lb">${esc(a.card)}</span>${sub ? `<span class="aicl-card-dt">${esc(sub)}</span>` : ''}${note ? `<span class="aicl-card-nt">${esc(note)}</span>` : ''}</div>`;
  }).join('');
}

function aiclActionsInner(id) {
  const d = aicl.detail[id];
  if (!d || d.loading) return `<i class="aic-sk" style="display:block;width:70%;height:14px"></i>`;
  if (d.error) return `<div class="aicl-do-none">Non disponibile.</div>`;
  const calls = d.data && d.data.calls;
  if (!Array.isArray(calls) || !calls.length) return `<div class="aicl-do-none">Nessuna chiamata registrata per questo turno.</div>`;
  const { acts, reads } = aiclActions(calls);
  const rows = acts.length ? `<ul class="aicl-do">${acts.map(a => {
    const sub = a.fail ? (a.why || 'Non riuscita') : a.detail;
    const lab = a.label + (a.extra ? ' · ' + a.extra : '') + (a.fail ? ' · non riuscita' : '');
    const full = [lab, sub].filter(Boolean).join(': ');
    return `<li class="aicl-do-r${a.fail ? ' aicl-do-bad' : ''}" title="${esc(full)}"><span class="aicl-do-mk" aria-hidden="true">${a.fail ? '✕' : '✓'}</span>
      <span class="aicl-do-bd"><span class="aicl-do-lb">${esc(lab)}</span>${sub ? `<span class="aicl-do-dt">${esc(sub)}</span>` : ''}</span></li>`;
  }).join('')}</ul>` : `<div class="aicl-do-none">Nessuna azione: ha solo risposto.</div>`;
  return rows + (reads.length ? `<div class="aicl-do-rd">Ha guardato: ${esc(reads.join(', '))}</div>` : '');
}

function aiclPanelHtml(r) {
  const id = r.id;
  const locked = AICL_LOCKED.includes(r.status);
  const why = r.agent_note || aiclReasons(r.reasons).join('. ') || '—';
  const text = aiclGeneral(id);
  return `<div class="aicl-panel"><div class="aicl-chat" id="aicl-chat-${esc(id)}">${aiclChatInner(id)}</div>
    <div class="aicl-side"><div class="aicl-lab">Perché è segnalata</div><div class="aicl-why">${esc(why)}</div>
      <div class="aicl-lab">Cosa ha fatto il coach</div><div class="aicl-acts" id="aicl-acts-${esc(id)}">${aiclActionsInner(id)}</div>
      <label class="aicl-lab" for="aicl-ta-${esc(id)}">Doveva fare così</label>
      <textarea class="aicl-ta" id="aicl-ta-${esc(id)}" data-aicl-draft="${esc(id)}" rows="4" placeholder="Cosa doveva fare il coach?" ${locked ? 'disabled' : ''}>${esc(text)}</textarea>
      <div class="aicl-act"><button class="aicl-save" id="aicl-sv-${esc(id)}" data-aicl-save="${esc(id)}" ${aiclSaveAttrs(id, locked)}>${aiclSaveLabel(id)}</button>
      <span class="aicl-msg" id="aicl-ms-${esc(id)}" role="status">${aiclSaveMsg(id, locked, r)}</span></div></div></div>`;
}

function aiclSaveState(id) { return (aicl.save[id] && aicl.save[id].st) || 'rest'; }
function aiclSaveLabel(id) { return { rest: 'Salva commento', saving: 'Salvo…', saved: 'Salvato', error: 'Non salvato' }[aiclSaveState(id)]; }
function aiclSaveAttrs(id, locked) {
  const st = aiclSaveState(id), r = aiclRow(id);
  const text = aiclFullText(id);
  const dis = locked || st === 'saving' || !String(text).trim();
  return `data-st="${st}"${dis ? ' disabled' : ''}`;
}
function aiclSaveMsg(id, locked, r) {
  const s = aicl.save[id];
  if (s && s.st === 'error') return esc(s.msg || 'Errore');
  if (locked) return 'In correzione o chiusa: non si commenta.';
  if (r && r.status === 'queued') return 'In coda: se commenti di nuovo, esce dalla coda e torna a «Commentato».';
  if (s && s.st === 'saved') return r && r.commented_by ? `Commento di ${esc(r.commented_by)}` : '';
  return r && r.commented_at && r.commented_by ? `Commentata da ${esc(r.commented_by)} il ${esc(aiclWhen(r.commented_at))}` : '';
}
function aiclPaintSave(id) {
  const b = document.getElementById('aicl-sv-' + id), m = document.getElementById('aicl-ms-' + id), r = aiclRow(id);
  if (!b || !r) return;
  const locked = AICL_LOCKED.includes(r.status);
  b.textContent = aiclSaveLabel(id);
  b.dataset.st = aiclSaveState(id);
  b.disabled = aiclSaveAttrs(id, locked).includes('disabled');
  if (m) m.innerHTML = aiclSaveMsg(id, locked, r);
}

// ── RISPOSTE AI SINGOLI MESSAGGI ──────────────────────────────────────
// Tutto sta in `expected` (testo semplice): per ogni risposta «<messaggio del coach>» a capo «→ <commento>»,
// le righe del commento dopo la prima rientrano di due spazi, blocchi separati da una riga vuota, in fondo il commento generale.
// `coach` = [{ i: indice del messaggio nella chat, c: testo }].
function aiclComposeExpected(items, general, coach) {
  const blocks = coach.filter(m => items[m.i] != null && String(items[m.i]).trim())
    .map(m => `«${m.c}»\n→ ${String(items[m.i]).replace(/\r\n/g, '\n').trim().split('\n').join('\n  ')}`);
  const g = String(general || '').replace(/\r\n/g, '\n').trim();
  if (g) blocks.push(g);
  return blocks.join('\n\n');
}

// Rilegge `expected`: ciò che non si attacca a un messaggio resta per intero nel commento generale.
// Accetta anche la forma scritta a mano: "frammento" o «frammento», poi ->, → o virgola e il commento; «…» nel frammento
// separa pezzi che devono comparire in ordine nel messaggio.
function aiclParseExpected(text, coach) {
  text = String(text == null ? '' : text).replace(/\r\n/g, '\n');
  const items = {}, rest = [], used = new Set();
  const byLen = [...coach].sort((a, b) => b.c.length - a.c.length);
  let buf = [], pos = 0;
  const flush = () => { if (buf.length) { rest.push(buf.join('\n')); buf = []; } };
  const fuzzy = frag => {
    const parts = String(frag).split(/…|\.\.\./).map(x => x.trim()).filter(Boolean);
    if (!parts.length) return null;
    const lc = c => c.c.toLowerCase();
    const ok = c => { let at = 0; return parts.every(x => { const k = lc(c).indexOf(x.toLowerCase(), at); if (k < 0) return false; at = k + x.length; return true; }); };
    return coach.find(c => !used.has(c.i) && ok(c)) || coach.find(ok) || null;
  };
  while (pos < text.length) {
    const tail = text.slice(pos);
    let hit = null;
    if (tail[0] === '«') {
      for (const c of byLen) {
        const head = `«${c.c}»\n→ `;
        if (!used.has(c.i) && tail.startsWith(head)) { hit = { c, len: head.length, canon: true }; break; }
      }
    }
    if (!hit) {
      const m = tail.match(/^(?:"([^"]*)"|«([^»]*)»)\s*(?:->|→|,)[ \t]*/);
      if (m) { const c = fuzzy(m[1] != null ? m[1] : m[2]); if (c) hit = { c, len: m[0].length, canon: false }; }
    }
    let lines = null, end = pos;
    if (hit) {
      const body = text.slice(pos + hit.len).split('\n');
      lines = [body[0]]; let k = 1;
      while (k < body.length && (hit.canon ? body[k].startsWith('  ') : (body[k].trim() !== '' && body[k][0] !== '«'))) { lines.push(hit.canon ? body[k].slice(2) : body[k]); k++; }
      if (k < body.length && body[k].trim() === '') k++;
      end = pos + hit.len + body.slice(0, k).join('\n').length + (k < body.length ? 1 : 0);
      if (!lines.join('\n').trim()) { hit = null; lines = null; }
    }
    if (hit) {
      const t = lines.join('\n').trim();
      items[hit.c.i] = items[hit.c.i] != null ? items[hit.c.i] + '\n' + t : t;
      used.add(hit.c.i); flush(); pos = end;
    } else {
      const e = text.indexOf('\n', pos);
      buf.push(text.slice(pos, e < 0 ? text.length : e));
      pos = e < 0 ? text.length : e + 1;
    }
  }
  flush();
  return { items, general: rest.join('\n\n').trim() };
}

const aiclCoachMsgs = id => {
  const d = aicl.detail[id];
  return d && d.data && Array.isArray(d.data.messages) ? d.data.messages.map((m, i) => ({ i, c: String(m.content == null ? '' : m.content), r: m.role })).filter(m => m.r === 'assistant').map(({ i, c }) => ({ i, c })) : [];
};
const aiclGeneral = id => {
  if (aicl.draft[id] != null) return aicl.draft[id];
  if (aicl.rep[id]) return aicl.rep[id].general;
  const r = aiclRow(id); return (r && r.expected) || '';
};
const aiclFullText = (id, items) => {
  const rp = aicl.rep[id];
  return rp ? aiclComposeExpected(items || rp.items, aiclGeneral(id), aiclCoachMsgs(id)) : String(aiclGeneral(id));
};
function aiclRepInit(id) {
  const r = aiclRow(id);
  const src = aicl.draft[id] != null ? aicl.draft[id] : (r && r.expected) || '';
  const pr = aiclParseExpected(src, aiclCoachMsgs(id));
  aicl.rep[id] = { items: pr.items, general: pr.general };
  if (aicl.draft[id] != null) aicl.draft[id] = pr.general;
}
const aiclUi = (id, i) => ((aicl.ui[id] = aicl.ui[id] || {})[i] = aicl.ui[id][i] || {});
const aiclRepKey = (id, i) => `${id}:${i}`;

function aiclRepInner(id, i) {
  const rp = aicl.rep[id], r = aiclRow(id);
  if (!rp || !r || AICL_LOCKED.includes(r.status)) return '';
  const ui = aiclUi(id, i), k = esc(aiclRepKey(id, i)), txt = rp.items[i];
  const flash = ui.msg ? `<span class="aicl-rp-ms${ui.err ? ' aicl-rp-err' : ''}" role="status">${esc(ui.msg)}</span>` : '';
  if (ui.mode === 'edit') {
    return `<textarea class="aicl-rp-ta" data-aicl-rp-draft="${k}" rows="3" placeholder="Cosa doveva dire?">${esc(ui.draft || '')}</textarea>
      <div class="aicl-rp-act"><button class="aicl-rp-b aicl-rp-go" data-aicl-rp-save="${k}"${ui.st === 'saving' ? ' disabled' : ''}>${ui.st === 'saving' ? 'Salvo…' : 'Salva'}</button>
      <button class="aicl-rp-b" data-aicl-rp-cancel="${k}"${ui.st === 'saving' ? ' disabled' : ''}>Annulla</button>${flash}</div>`;
  }
  if (txt != null && String(txt).trim()) {
    return `<div class="aicl-rp-c">${esc(txt)}</div><div class="aicl-rp-act"><button class="aicl-rp-lnk" data-aicl-rp-edit="${k}">Modifica</button>
      <button class="aicl-rp-lnk${ui.confirm ? ' aicl-rp-bad' : ''}" data-aicl-rp-del="${k}">${ui.confirm ? 'Sicuro?' : 'Elimina'}</button>${flash}</div>`;
  }
  return `<div class="aicl-rp-act"><button class="aicl-rp-lnk" data-aicl-rp-open="${k}">Rispondi</button>${flash}</div>`;
}
function aiclPaintRep(id, i) {
  const el = document.getElementById('aicl-rp-' + id + '-' + i);
  if (el) el.innerHTML = aiclRepInner(id, i);
}
function aiclRepNote(id, i, msg, err) {
  const ui = aiclUi(id, i);
  ui.msg = msg; ui.err = !!err; clearTimeout(ui.tm);
  if (!err) ui.tm = setTimeout(() => { ui.msg = ''; aiclPaintRep(id, i); }, 2200);
  aiclPaintRep(id, i);
}
// Scrive `expected` e, solo se il database risponde, aggiorna la memoria. Ritorna true se salvato.
async function aiclReplyPersist(id, i, items, ui) {
  if (aicl.busy[id] || aiclSaveState(id) === 'saving') return false;
  const text = aiclComposeExpected(items, aiclGeneral(id), aiclCoachMsgs(id));
  if (!text.trim()) { aiclRepNote(id, i, 'Il commento non può restare vuoto', true); return false; }
  aicl.busy[id] = true; ui.st = 'saving'; aiclPaintRep(id, i);
  try {
    await aiclCommit(id, text);
    aicl.rep[id].items = items;
    aicl.rep[id].general = aiclGeneral(id); delete aicl.draft[id];
    ui.st = ''; ui.mode = ''; ui.confirm = false;
    aicl.busy[id] = false;
    aiclRepNote(id, i, 'Salvato', false);
    aiclPaintSave(id);
    return true;
  } catch (e) {
    console.error('aiclReplySave', e);
    aicl.busy[id] = false; ui.st = '';
    aiclRepNote(id, i, 'Non salvato: ' + aicErrMsg(e), true);
    return false;
  }
}
async function aiclRepAction(kind, key) {
  const c = key.lastIndexOf(':'), id = key.slice(0, c), i = key.slice(c + 1);
  const rp = aicl.rep[id]; if (!rp) return;
  const ui = aiclUi(id, i);
  if (kind === 'open' || kind === 'edit') { ui.mode = 'edit'; ui.draft = rp.items[i] || ''; ui.msg = ''; ui.confirm = false; aiclPaintRep(id, i); const t = document.querySelector(`[data-aicl-rp-draft="${CSS.escape(key)}"]`); if (t) t.focus(); }
  else if (kind === 'cancel') { ui.mode = ''; ui.msg = ''; aiclPaintRep(id, i); }
  else if (kind === 'save') {
    const t = String(ui.draft || '').trim();
    if (!t) { aiclRepNote(id, i, 'Scrivi un commento', true); return; }
    await aiclReplyPersist(id, i, { ...rp.items, [i]: t }, ui);
  } else if (kind === 'del') {
    if (!ui.confirm) { ui.confirm = true; aiclPaintRep(id, i); clearTimeout(ui.ctm); ui.ctm = setTimeout(() => { ui.confirm = false; aiclPaintRep(id, i); }, 4000); return; }
    clearTimeout(ui.ctm);
    const next = { ...rp.items }; delete next[i];
    ui.confirm = false;
    await aiclReplyPersist(id, i, next, ui);
  }
}

function aiclChatInner(id) {
  const d = aicl.detail[id];
  if (!d || d.loading) {
    return `<div class="aic-chat-msgs">${[['c', '70%', 40], ['u', '40%', 36], ['c', '80%', 54]].map(([w, wd, h]) =>
      `<div class="aic-m ${w === 'u' ? 'aic-m-u' : 'aic-m-c'}">${w === 'c' ? '<i class="aic-sk" style="width:28px;height:28px;border-radius:50%"></i>' : ''}<i class="aic-sk" style="width:${wd};height:${h}px;border-radius:18px"></i></div>`).join('')}</div>`;
  }
  if (d.error) return aicError(d.error, 'aicl:' + id);
  const ms = d.data.messages;
  if (!ms.length) return `<div class="aic-chat-msg">Nessun messaggio</div>`;
  const av = `<span class="aic-av">${aicIc('<path d="M11 3l1.9 5.1L18 10l-5.1 1.9L11 17l-1.9-5.1L4 10l5.1-1.9z"/><path d="M19 15v5M16.5 17.5h5"/>', 17, AIC.LB)}</span>`;
  // le card del turno segnalato vanno sotto la prima risposta del coach che segue il messaggio segnalato
  const fi = ms.findIndex(m => m.flagged);
  let ci = -1;
  if (fi >= 0) { ci = ms.findIndex((m, i) => i > fi && m.role === 'assistant'); if (ci < 0) ci = fi; }
  const cards = aiclCardsHtml(id);
  return `<div class="aic-chat-msgs">${ms.map((m, i) => {
    const flag = m.flagged ? ' aicl-flag' : '';
    const body = esc(m.content);
    const tail = i === ci && cards ? `<div class="aicl-cards">${cards}</div>` : '';
    return (m.role === 'assistant'
      ? `<div class="aic-m aic-m-c">${av}<div class="aic-bub">${body}</div></div><div class="aicl-rp" id="aicl-rp-${esc(id)}-${i}">${aiclRepInner(id, i)}</div>`
      : `<div class="aic-m aic-m-u${flag}" ${m.flagged ? 'data-aicl-flagged' : ''}>${m.flagged ? '<span class="aicl-tag">Segnalato</span>' : ''}<div class="aic-bub">${body}</div></div>`) + tail;
  }).join('')}</div>`;
}

// Disegna solo il riquadro della chat (il campo del commento non si tocca) e scorre fino al messaggio segnalato.
function aiclPaintChat(id) {
  const box = document.getElementById('aicl-chat-' + id);
  if (!box) return;
  box.innerHTML = aiclChatInner(id);
  const gt = document.getElementById('aicl-ta-' + id);
  if (gt && aicl.draft[id] == null && aicl.rep[id]) gt.value = aicl.rep[id].general;
  const ac = document.getElementById('aicl-acts-' + id);
  if (ac) ac.innerHTML = aiclActionsInner(id);
  const f = box.querySelector('[data-aicl-flagged]');
  if (f) box.scrollTop = Math.max(0, f.offsetTop - (box.clientHeight - f.offsetHeight) / 2);
}

const aiclSecRows = sec => {
  const rows = aiclRows().filter(r => sec.states.includes(r.status));
  return sec.k === 'todo' ? [...rows.filter(r => r.status !== 'open'), ...rows.filter(r => r.status === 'open')] : rows;
};

function aiclSendCount() { return aiclRows().filter(r => r.status === 'commented').length; }

function aiclHeadHtml(sec) {
  const st = aicl.sec[sec.k], n = aiclSecRows(sec).length;
  let extra = '';
  if (sec.k === 'done') {
    const c = aiclSendCount(), sd = aicl.send;
    extra = `${sd.msg ? `<span class="aicl-sendm${sd.err ? ' aicl-sendm-err' : ''}" role="status">${esc(sd.msg)}</span>` : ''}
      <span class="aicl-sendn">${c} chat</span><button class="aicl-send" data-aicl-send${!c || sd.st === 'saving' ? ' disabled' : ''}>${sd.st === 'saving' ? 'Invio…' : 'Invia'}</button>`;
  }
  if (sec.k === 'closed') {
    const busy = aiclMergeBusy(), m = aiclMergeMsg();
    extra = `${m.msg ? `<span class="aicl-sendm${m.err ? ' aicl-sendm-err' : ''}" role="status">${esc(m.msg)}</span>` : ''}
      <button class="aicl-send" data-aicl-merge${!n || busy ? ' disabled' : ''}>${busy ? 'Unione…' : 'Unisci'}</button>`;
  }
  const bigIc = st.big
    ? '<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>'
    : '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>';
  return `<button class="aicl-sht" data-aicl-sec="${sec.k}" aria-expanded="${!!st.open}">${aicIc(AIC_CHD, 18, 'currentColor')}<span class="aicl-stt">${esc(sec.title)}</span><span class="aicl-cnt">${n}</span></button>
    ${extra}<button class="aicl-big" data-aicl-big="${sec.k}" aria-pressed="${!!st.big}" title="${st.big ? 'Riduci' : 'Ingrandisci'}" aria-label="${st.big ? 'Riduci' : 'Ingrandisci'} la sezione ${esc(sec.title)}">${aicIc(bigIc, 18, 'currentColor')}</button>`;
}

function aiclSecHtml(sec) {
  const st = aicl.sec[sec.k], rows = aiclSecRows(sec);
  return `<section class="aicl-sec${st.open ? ' aicl-sec-open' : ''}${st.big ? ' aicl-sec-big' : ''}" data-sec="${sec.k}">
    <div class="aicl-sh" id="aicl-sh-${sec.k}">${aiclHeadHtml(sec)}</div>
    ${rows.length ? `<div class="aicl-th" aria-hidden="true"><span>Chat</span><span>Il coach ha fatto</span><span>Perché</span><span>Stato</span></div>` : ''}
    <div class="aicl-sb" data-sec="${sec.k}">${rows.length ? rows.map(aiclRowHtml).join('') : `<div class="aicl-sec-empty">${esc(sec.empty)}</div>`}</div></section>`;
}

function aiclListInner() {
  if (aicl.error) return aicError(aicl.error, 'aicl');
  if (!aicl.data) {
    return `<div class="aicl-body">${[0, 1, 2, 3].map(() => `<div class="aicl-item"><div class="aicl-lr" style="cursor:default"><span class="aicl-c1"><i class="aic-sk" style="display:block;width:90px;height:16px"></i><i class="aic-sk" style="display:block;width:150px;height:12px;margin-top:8px"></i></span>
      <span class="aicl-c2"><i class="aic-sk" style="display:block;width:80%;height:12px"></i></span><span class="aicl-c3"><i class="aic-sk" style="display:block;width:70%;height:12px"></i></span><span class="aicl-c4"><i class="aic-sk" style="display:block;width:90px;height:12px"></i></span></div></div>`).join('')}</div>`;
  }
  if (!aicl.sec) aicl.sec = aiclSecLoad();
  return AICL_SECS.map(aiclSecHtml).join('');
}

function aicListaHtml() {
  if (!aicl.show) return '';
  if (!aicl.sec) aicl.sec = aiclSecLoad();
  return `<div class="aic-card aicl-lista" id="aicl-card"><div class="aicl-lh"><h2 class="aic-h2">Chat da correggere</h2></div>
    <div class="aicl-secs">${aiclListInner()}</div></div>`;
}

// ── eventi ────────────────────────────────────────────────────────────
// Ridisegna le sezioni senza perdere la posizione di scorrimento di ognuna né quella della chat aperta.
function aiclRepaintList() {
  const host = document.querySelector('#aic-lista .aicl-secs');
  if (!host) return;
  if (aicl.sec && aicl.open != null) {
    const r = aiclRow(aicl.open), sec = r && AICL_SECS.find(x => x.states.includes(r.status));
    if (sec && !aicl.sec[sec.k].open) { aicl.sec[sec.k].open = true; aiclSecSave(); }   // la chat aperta non sparisce in una sezione chiusa
  }
  const tops = {};
  host.querySelectorAll('.aicl-sb').forEach(b => { tops[b.dataset.sec] = b.scrollTop; });
  const old = aicl.open != null ? document.getElementById('aicl-chat-' + aicl.open) : null, ct = old ? old.scrollTop : null;
  host.innerHTML = aiclListInner();
  host.querySelectorAll('.aicl-sb').forEach(b => { if (tops[b.dataset.sec]) b.scrollTop = tops[b.dataset.sec]; });
  if (aicl.open != null && aicl.detail[aicl.open]) {
    aiclPaintChat(aicl.open);
    const box = document.getElementById('aicl-chat-' + aicl.open);
    if (box && ct != null) box.scrollTop = ct;
  }
}
function aiclPaintHeads() {
  if (!aicl.sec) return;
  AICL_SECS.forEach(sec => { const el = document.getElementById('aicl-sh-' + sec.k); if (el) el.innerHTML = aiclHeadHtml(sec); });
}

// Scrive `expected` con la RPC di commento e aggiorna la riga solo con ciò che il database ha risposto.
async function aiclCommit(id, text) {
  const r = aiclRow(id);
  const row = await aicRpc('kpi_coach_broken_chat_comment', { p_id: Number(id), p_expected: text });
  if (row && typeof row === 'object') Object.assign(r, { status: row.status, expected: row.expected, commented_at: row.commented_at });
  aiclRepaintRow(id);
  aiclReloadQuiet();
}

async function aiclSaveNow(id) {
  const r = aiclRow(id);
  if (!r || aiclSaveState(id) === 'saving' || aicl.busy[id]) return;
  const text = aiclFullText(id).trim();
  if (!text) return;
  const general = aiclGeneral(id);
  aicl.save[id] = { st: 'saving' };
  aiclPaintSave(id);
  try {
    await aiclCommit(id, text);
    if (aicl.rep[id]) aicl.rep[id].general = String(general).trim();
    delete aicl.draft[id];
    aicl.save[id] = { st: 'saved' };
    aiclPaintSave(id);
  } catch (e) {
    console.error('aiclSave', e);
    aicl.draft[id] = general;   // il commento non si perde
    aicl.save[id] = { st: 'error', msg: aicErrMsg(e) };
    aiclPaintSave(id);
  }
}

// Ricarica l'elenco senza sagome: le chat cambiano sezione, la riga aperta resta aperta.
async function aiclReloadQuiet() {
  try {
    const data = await aicRpc('kpi_coach_broken_chats');
    if (Array.isArray(data)) {
      aicl.data = data;
      aicRefresh('bench');
      aiclRepaintList();
      if (aicl.open != null) aiclPaintSave(aicl.open);
    }
  } catch (e) { console.error('aiclReloadQuiet', e); }
}

// Dopo un salvataggio la chat può cambiare sezione: si ridisegna e si aggiorna il conteggio nella riga del ciclo.
function aiclRepaintRow(id) {
  if (!aiclRow(id)) return;
  aicRefresh('bench');
  aiclRepaintList();
}

// «Invia»: porta tutte le chat commentate in coda per Hermes.
async function aiclSend() {
  if (aicl.send.st === 'saving' || !aiclSendCount()) return;
  aicl.send = { st: 'saving', msg: '', err: false };
  aiclPaintHeads();
  try {
    const n = Number(await aicRpc('kpi_coach_broken_chats_send'));
    await aiclReloadQuiet();
    aicl.send = { st: 'done', msg: `Inviate ${Number.isFinite(n) ? n : ''}`.trim(), err: false };
    aiclPaintHeads();
    clearTimeout(aicl.sendTm);
    aicl.sendTm = setTimeout(() => { aicl.send = { st: '', msg: '', err: false }; aiclPaintHeads(); }, 3500);
  } catch (e) {
    console.error('aiclSend', e);
    aicl.send = { st: 'err', msg: 'Non inviate: ' + aicErrMsg(e), err: true };
    aiclPaintHeads();
  }
}

// «Unisci»: chiede al PC di portare il ramo del giro dentro bender. Il PC la prende entro cinque minuti.
const aiclMergeBusy = () => aicl.merge.st === 'saving' || ['pending', 'running'].includes(aicl.mergeReq && aicl.mergeReq.status);
function aiclMergeMsg() {
  if (aicl.merge.msg) return aicl.merge;
  const r = aicl.mergeReq;
  if (!r) return { msg: '', err: false };
  if (r.status === 'pending') return { msg: 'In attesa del PC', err: false };
  if (r.status === 'running') return { msg: 'Unione in corso', err: false };
  if (r.status === 'failed') return { msg: 'Unione fallita: ' + (r.note || ''), err: true };
  const fresh = Date.now() - new Date(r.finished_at) < 24 * 3600 * 1000;
  return { msg: fresh ? 'Unito: ' + (r.note || '') : '', err: false };
}
async function aiclMergeStatus() {
  try { aicl.mergeReq = await aicRpc('kpi_coach_merge_status'); } catch (e) { console.error('aiclMergeStatus', e); return; }
  aiclPaintHeads();
  clearTimeout(aicl.mergeTm);
  if (['pending', 'running'].includes(aicl.mergeReq && aicl.mergeReq.status)) {
    aicl.mergeTm = setTimeout(async () => { await aiclReloadQuiet(); aiclMergeStatus(); }, 30000);
  }
}
async function aiclMerge() {
  if (aiclMergeBusy()) return;
  aicl.merge = { st: 'saving', msg: '', err: false };
  aiclPaintHeads();
  try {
    aicl.mergeReq = await aicRpc('kpi_coach_merge_request');
    aicl.merge = { st: '', msg: '', err: false };
    aiclMergeStatus();
  } catch (e) {
    console.error('aiclMerge', e);
    aicl.merge = { st: 'err', msg: 'Non partita: ' + aicErrMsg(e), err: true };
    aiclPaintHeads();
  }
}

// Ritorna true se il clic è suo.
function aiclOnClick(ev) {
  const t = ev.target, q = s => t.closest && t.closest(s);
  if (q('[data-aicl-retry]')) { aicl.error = null; aiclLoad(); aicRefresh('bench'); aicRefresh('lista'); return true; }
  if (q('[data-aicl-toggle]')) { aicl.show = !aicl.show; aicRefresh('bench'); aicRefresh('lista'); return true; }
  const op = q('[data-aicl-open]');
  if (op) {
    const id = op.dataset.aiclOpen;
    if (String(aicl.open) === id) aicl.open = null;
    else { aicl.open = id; if (!aicl.detail[id] || aicl.detail[id].error) aiclLoadDetail(id); }
    aiclRepaintList();
    if (aicl.open != null) aiclPaintChat(aicl.open);
    return true;
  }
  const sh = q('[data-aicl-sec]');
  if (sh) {
    const k = sh.dataset.aiclSec; aicl.sec[k].open = !aicl.sec[k].open; aiclSecSave();
    const el = document.querySelector(`#aic-lista .aicl-sec[data-sec="${k}"]`);
    if (el) el.classList.toggle('aicl-sec-open', aicl.sec[k].open);
    aiclPaintHeads(); return true;
  }
  const bg = q('[data-aicl-big]');
  if (bg) {
    const k = bg.dataset.aiclBig, st = aicl.sec[k];
    st.big = !st.big;
    if (st.big && !st.open) { st.open = true; aiclSecSave(); }
    const el = document.querySelector(`#aic-lista .aicl-sec[data-sec="${k}"]`);
    if (el) { el.classList.toggle('aicl-sec-big', st.big); el.classList.toggle('aicl-sec-open', st.open); if (st.big && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' }); }
    aiclPaintHeads(); return true;
  }
  if (q('[data-aicl-send]')) { aiclSend(); return true; }
  if (q('[data-aicl-merge]')) { aiclMerge(); return true; }
  for (const k of ['open', 'edit', 'cancel', 'save', 'del']) {
    const b = q(`[data-aicl-rp-${k}]`);
    if (b) { aiclRepAction(k, b.dataset['aiclRp' + k[0].toUpperCase() + k.slice(1)]); return true; }
  }
  const sv = q('[data-aicl-save]');
  if (sv) { aiclSaveNow(sv.dataset.aiclSave); return true; }
  const rt = q('[data-aic-retry]');
  if (rt && rt.dataset.aicRetry === 'aicl') { aicl.error = null; aiclLoad(); aicRefresh('lista'); return true; }
  if (rt && rt.dataset.aicRetry.startsWith('aicl:')) { aiclLoadDetail(rt.dataset.aicRetry.slice(5)); return true; }
  return false;
}

function aiclOnInput(ev) {
  const ta = ev.target;
  if (ta && ta.dataset && ta.dataset.aiclRpDraft != null) {
    const key = ta.dataset.aiclRpDraft, c = key.lastIndexOf(':');
    aiclUi(key.slice(0, c), key.slice(c + 1)).draft = ta.value;
    return true;
  }
  if (!ta || !ta.dataset || ta.dataset.aiclDraft == null) return false;
  const id = ta.dataset.aiclDraft;
  aicl.draft[id] = ta.value;
  if (aiclSaveState(id) !== 'rest' && aiclSaveState(id) !== 'saving') delete aicl.save[id];
  aiclPaintSave(id);
  return true;
}
