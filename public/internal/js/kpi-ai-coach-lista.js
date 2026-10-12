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
  ambiguous: ['amb',  'ambigua'],
  failed:    ['amb',  'ambigua'],
  commented: ['done', 'commentata'],
  fixing:    ['done', 'commentata'],
};
const AICL_TO_COMMENT = ['open', 'ambiguous', 'failed'];   // gli stati che pesano nel conteggio «da commentare»
const AICL_HIDDEN = ['closed'];
const AICL_LOCKED = ['fixing', 'closed'];                   // gli stati che la RPC di commento rifiuta

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

const AICL_ROWS = 4;      // righe mostrate prima di «Altre N»
const AICL_DAYS = 14;

const aicl = {
  data: null, error: null, loading: false,     // l'elenco intero (tutti gli stati)
  show: true, open: null, more: false,
  detail: {},                                  // id → { data, error, loading }
  draft: {},                                   // id → testo del commento, anche non salvato
  save: {},                                    // id → { st: 'saving'|'saved'|'error', msg }
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
const aiclRows = () => (aicl.data || []).filter(r => !AICL_HIDDEN.includes(r.status));
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
    <span class="aicl-c3">${esc(why)}</span>
    <span class="aicl-c4">${aiclStatus(r.status)}</span></button>`;
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
      const a = { name, label: AICL_ACTIONS[name] || name, extra: '', detail: '', fail: false, why: '' };
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
  const text = aicl.draft[id] != null ? aicl.draft[id] : (r.expected || '');
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
  const text = aicl.draft[id] != null ? aicl.draft[id] : (r && r.expected) || '';
  const dis = locked || st === 'saving' || !String(text).trim();
  return `data-st="${st}"${dis ? ' disabled' : ''}`;
}
function aiclSaveMsg(id, locked, r) {
  const s = aicl.save[id];
  if (s && s.st === 'error') return esc(s.msg || 'Errore');
  if (locked) return 'In correzione o chiusa: non si commenta.';
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
  return `<div class="aic-chat-msgs">${ms.map(m => {
    const flag = m.flagged ? ' aicl-flag' : '';
    const body = esc(m.content);
    return m.role === 'assistant'
      ? `<div class="aic-m aic-m-c">${av}<div class="aic-bub">${body}</div></div>`
      : `<div class="aic-m aic-m-u${flag}" ${m.flagged ? 'data-aicl-flagged' : ''}>${m.flagged ? '<span class="aicl-tag">Segnalato</span>' : ''}<div class="aic-bub">${body}</div></div>`;
  }).join('')}</div>`;
}

// Disegna solo il riquadro della chat (il campo del commento non si tocca) e scorre fino al messaggio segnalato.
function aiclPaintChat(id) {
  const box = document.getElementById('aicl-chat-' + id);
  if (!box) return;
  box.innerHTML = aiclChatInner(id);
  const ac = document.getElementById('aicl-acts-' + id);
  if (ac) ac.innerHTML = aiclActionsInner(id);
  const f = box.querySelector('[data-aicl-flagged]');
  if (f) box.scrollTop = Math.max(0, f.offsetTop - (box.clientHeight - f.offsetHeight) / 2);
}

function aiclListInner() {
  if (aicl.error) return aicError(aicl.error, 'aicl');
  if (!aicl.data) {
    return [0, 1, 2, 3].map(() => `<div class="aicl-item"><div class="aicl-lr" style="cursor:default"><span class="aicl-c1"><i class="aic-sk" style="display:block;width:90px;height:16px"></i><i class="aic-sk" style="display:block;width:150px;height:12px;margin-top:8px"></i></span>
      <span class="aicl-c2"><i class="aic-sk" style="display:block;width:80%;height:12px"></i></span><span class="aicl-c3"><i class="aic-sk" style="display:block;width:70%;height:12px"></i></span><span class="aicl-c4"><i class="aic-sk" style="display:block;width:90px;height:12px"></i></span></div></div>`).join('');
  }
  const all = aiclRows();
  if (!all.length) return `<div class="aic-empty">Nessuna chat da correggere</div>`;
  // la riga aperta resta visibile anche se cade oltre le prime
  let shown = aicl.more ? all : all.slice(0, AICL_ROWS);
  const op = all.find(r => String(r.id) === String(aicl.open));
  if (op && !shown.includes(op)) shown = [...shown, op];
  const rest = all.length - shown.length;
  return shown.map(aiclRowHtml).join('') + (rest > 0 ? `<button class="aic-more" data-aicl-more>Altre ${rest}${aicIc(AIC_CHD, 18, AIC.SEC)}</button>` : '');
}

function aicListaHtml() {
  if (!aicl.show) return '';
  return `<div class="aic-card aicl-lista" id="aicl-card"><div class="aicl-lh"><h2 class="aic-h2">Chat da correggere</h2></div>
    <div class="aicl-th" aria-hidden="true"><span>Chat</span><span>Il coach ha fatto</span><span>Perché</span><span>Stato</span></div>
    <div class="aicl-body">${aiclListInner()}</div></div>`;
}

// ── eventi ────────────────────────────────────────────────────────────
function aiclRepaintList() {
  const el = document.querySelector('#aic-lista .aicl-body');
  if (el) el.innerHTML = aiclListInner();
  const f = document.querySelector('#aic-lista [data-aicl-flagged]');
  const box = f && f.closest('.aicl-chat');
  if (f && box) box.scrollTop = Math.max(0, f.offsetTop - (box.clientHeight - f.offsetHeight) / 2);
}

async function aiclSaveNow(id) {
  const r = aiclRow(id);
  if (!r || aiclSaveState(id) === 'saving') return;
  const text = String(aicl.draft[id] != null ? aicl.draft[id] : r.expected || '').trim();
  if (!text) return;
  aicl.save[id] = { st: 'saving' };
  aiclPaintSave(id);
  try {
    const row = await aicRpc('kpi_coach_broken_chat_comment', { p_id: Number(id), p_expected: text });
    // aggiorna la riga solo con ciò che il database ha risposto
    if (row && typeof row === 'object') Object.assign(r, { status: row.status, expected: row.expected, commented_at: row.commented_at });
    // chi ha commentato: il nome dell'operatore non torna dalla RPC; si ricarica l'elenco in sordina per averlo
    delete aicl.draft[id];
    aicl.save[id] = { st: 'saved' };
    aiclRepaintRow(id);
    aiclPaintSave(id);
    aiclReloadQuiet();
  } catch (e) {
    console.error('aiclSave', e);
    aicl.draft[id] = text;   // il commento non si perde
    aicl.save[id] = { st: 'error', msg: aicErrMsg(e) };
    aiclPaintSave(id);
  }
}

// Ricarica l'elenco senza sagome e senza toccare la riga aperta (il campo di testo resta com'è).
async function aiclReloadQuiet() {
  try {
    const data = await aicRpc('kpi_coach_broken_chats');
    if (Array.isArray(data)) {
      aicl.data = data;
      aicRefresh('bench');
      const ids = aicl.open != null ? aicl.open : null;
      document.querySelectorAll('#aic-lista .aicl-lr').forEach(b => {
        const r = aiclRow(b.dataset.aiclOpen); if (!r) return;
        const st = b.querySelector('.aicl-c4'); if (st) st.innerHTML = aiclStatus(r.status);
      });
      if (ids != null) aiclPaintSave(ids);
    }
  } catch (e) { console.error('aiclReloadQuiet', e); }
}

// Aggiorna la sola colonna Stato della riga e il conteggio nella riga del ciclo.
function aiclRepaintRow(id) {
  const r = aiclRow(id); if (!r) return;
  const b = document.querySelector(`#aic-lista [data-aicl-open="${CSS.escape(String(id))}"]`);
  const st = b && b.querySelector('.aicl-c4'); if (st) st.innerHTML = aiclStatus(r.status);
  aicRefresh('bench');
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
  if (q('[data-aicl-more]')) { aicl.more = true; aiclRepaintList(); if (aicl.open != null) aiclPaintChat(aicl.open); return true; }
  const sv = q('[data-aicl-save]');
  if (sv) { aiclSaveNow(sv.dataset.aiclSave); return true; }
  const rt = q('[data-aic-retry]');
  if (rt && rt.dataset.aicRetry === 'aicl') { aicl.error = null; aiclLoad(); aicRefresh('lista'); return true; }
  if (rt && rt.dataset.aicRetry.startsWith('aicl:')) { aiclLoadDetail(rt.dataset.aicRetry.slice(5)); return true; }
  return false;
}

function aiclOnInput(ev) {
  const ta = ev.target;
  if (!ta || !ta.dataset || ta.dataset.aiclDraft == null) return false;
  const id = ta.dataset.aiclDraft;
  aicl.draft[id] = ta.value;
  if (aiclSaveState(id) !== 'rest' && aiclSaveState(id) !== 'saving') delete aicl.save[id];
  aiclPaintSave(id);
  return true;
}
