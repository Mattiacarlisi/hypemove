// Pagina «Comportamento»: gruppi come filtro, poi una persona, le sue tappe in fila e cosa ha fatto
// come una chat. Dati da kpi_behavior_groups (persone e date delle tappe) e kpi_behavior_user (eventi).
const BEH = {
  steps: [
    { k: 'onb', ev: 'onboarding_complete', label: 'Onboarding finito', color: '#a0a0c8' },
    { k: 'tap', ev: 'paywall_cta_tap', label: 'Tap acquista', color: '#fbbf24' },
    { k: 'trial', ev: 'trial_started', label: 'Prova iniziata', color: '#a78bfa' },
    { k: 'buy', ev: 'paywall_purchase_success', label: 'Acquisto riuscito', color: '#4ade80' },
    { k: 'wk', ev: 'workout_complete', label: 'Primo allenamento', color: '#60a5fa' }
  ],
  PAGE: 300,
  data: null, error: null, loading: false,
  ui: { group: null, user: null },
  events: {}, // uid -> { rows, loading, error, done }
};

BEH.groups = () => {
  const sp = (BEH.data && BEH.data.sprints) || [];
  const fmt = d => new Date(d + 'T00:00:00').toLocaleDateString('it-IT', { day: 'numeric', month: 'long' });
  const today = new Date().toISOString().slice(0, 10);
  return [
    ...sp.map(s => ({ id: 'sprint:' + s.id, label: s.nome, sub: s.fine >= today ? 'arrivati dal ' + fmt(s.inizio) + ', sprint in corso' : 'arrivati dal ' + fmt(s.inizio) + ' al ' + fmt(s.fine) })),
    { id: 'abbonati', label: 'Abbonati', sub: 'pagano e non hanno disdetto' },
    { id: 'prova', label: 'In prova', sub: 'hanno una prova gratuita aperta' },
    { id: 'disdetti', label: 'Disdetti', sub: 'hanno disdetto la prova o l\'abbonamento' },
    { id: 'tap', label: 'Tap acquista', sub: 'hanno toccato Acquista e non hanno comprato' },
    { id: 'allenati', label: 'Allenati', sub: 'hanno finito almeno un allenamento' },
    { id: 'fermi_onb', label: 'Fermi nell\'onboarding', sub: 'non hanno finito l\'onboarding' }
  ];
};
BEH.users = () => (BEH.data && BEH.data.users) || [];
BEH.inGroup = g => BEH.users().filter(u => u.g.includes(g));
BEH.byId = id => BEH.users().find(u => u.uid === id);
BEH.ts = s => s ? new Date(s).getTime() : null;
BEH.dur = ms => {
  if (ms == null) return '';
  const m = Math.round(ms / 60000);
  if (m < 1) return 'meno di un minuto';
  if (m < 60) return m + ' min';
  const h = Math.round(m / 60);
  return h < 48 ? h + ' h' : Math.round(h / 24) + ' giorni';
};
BEH.after = (u, k) => BEH.dur(BEH.ts(u.m[k]) - BEH.ts(u.first));
BEH.day = s => new Date(s).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
BEH.hm = s => new Date(s).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
BEH.when = s => BEH.day(s) + ', ' + BEH.hm(s);
BEH.name = u => (u.anon ? 'Anonimo ' : 'Utente ') + u.uid.replace('anon:', '').replace(/-/g, '').slice(-6);
BEH.screen = s => {
  if (!s) return '—';
  const l = EVENT_LABELS['view_' + s] || s;
  return l.replace(/^Onboarding(?=[A-Z])/, 'Onboarding · ').replace(/([a-z])([A-Z])/g, '$1 $2');
};
BEH.evLabel = n => EVENT_LABELS[n] || n.replace(/_/g, ' ');
BEH.dot = (s, on, size) => `<span title="${s.label}" style="display:inline-block;width:${size}px;height:${size}px;border-radius:50%;${on ? 'background:' + s.color : 'border:1.5px solid #333345'}"></span>`;
BEH.label = t => `<div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.8px;margin:0 0 8px">${t}</div>`;
BEH.go = patch => { Object.assign(BEH.ui, patch); if (patch.user) fetchBehaviorUser(patch.user); render(); };

async function fetchBehavior() {
  BEH.loading = true; BEH.error = null; render();
  try {
    const { data, error } = await sb.rpc('kpi_behavior_groups');
    if (error) throw error;
    BEH.data = data;
    if (!BEH.ui.group || !BEH.groups().some(g => g.id === BEH.ui.group)) BEH.ui.group = BEH.groups()[0].id;
  } catch (e) { console.error('fetchBehavior', e); BEH.error = e.message || String(e); }
  BEH.loading = false; render();
}

async function fetchBehaviorUser(uid, more) {
  const cur = BEH.events[uid];
  if (cur && (cur.loading || (!more && cur.rows))) return;
  const rows = (cur && cur.rows) || [];
  BEH.events[uid] = { rows, loading: true };
  render();
  try {
    const { data, error } = await sb.rpc('kpi_behavior_user', { p_uid: uid, p_offset: rows.length, p_limit: BEH.PAGE });
    if (error) throw error;
    BEH.events[uid] = { rows: rows.concat(data || []), done: (data || []).length < BEH.PAGE };
  } catch (e) { console.error('fetchBehaviorUser', e); BEH.events[uid] = { rows, error: e.message || String(e) }; }
  render();
}

// Eventi → righe della chat: una per schermata (con i secondi e le azioni fatte lì), le tappe a parte.
BEH.timeline = evs => {
  const rows = [], seen = new Set();
  let cur = null;
  for (const e of evs) {
    const n = e.event_name;
    if (n.startsWith('view_')) { cur = { kind: 'screen', at: e.created_at, name: n.slice(5), sec: null, acts: [], exit: false }; rows.push(cur); continue; }
    if (n === 'screen_dwell') {
      const t = [...rows].reverse().find(r => r.kind === 'screen' && r.name === e.screen);
      if (t) { t.sec = Math.max(t.sec || 0, e.active_s || 0); if (e.exit_reason === 'background') t.exit = true; }
      continue;
    }
    if (n === 'exit') { if (cur) cur.exit = true; continue; }
    const st = BEH.steps.find(s => s.ev === n);
    if (st && !seen.has(st.k)) { seen.add(st.k); rows.push({ kind: 'step', at: e.created_at, step: st }); continue; }
    if (n === 'paywall_purchase_cancelled') { rows.push({ kind: 'cancel', at: e.created_at }); continue; }
    if (cur) cur.acts.push(BEH.evLabel(n));
  }
  // Esce davvero solo se dopo l'uscita in background passano più di 30 minuti, o se non torna più.
  rows.forEach((r, i) => {
    if (!r.exit) return;
    const nx = rows[i + 1];
    const gap = nx ? BEH.ts(nx.at) - BEH.ts(r.at) - (r.sec || 0) * 1000 : Infinity;
    r.exit = gap > 30 * 60000 ? (nx ? 'esce e torna dopo ' + BEH.dur(gap) : 'esce e non torna') : false;
  });
  return rows;
};

BEH.flow = u => {
  const stop = BEH.steps.findIndex(s => !u.m[s.k]);
  const box = (s, i) => {
    const done = !!u.m[s.k], here = i === stop;
    return `<div style="flex:1;min-width:0;padding:10px;border-radius:10px;${done ? `background:${s.color}22;border:1.5px solid ${s.color}` : `border:1.5px dashed ${here ? 'var(--red)' : '#333345'}`}">
      <div style="font-size:12px;font-weight:700;color:${done ? s.color : here ? 'var(--red)' : '#4a4a6a'}">${s.label}</div>
      <div style="font-size:11px;color:${done ? 'var(--text)' : 'var(--muted)'};margin-top:3px">${done ? 'dopo ' + BEH.after(u, s.k) + ' · ' + BEH.hm(u.m[s.k]) : here ? 'si ferma prima di qui' : 'non arrivato'}</div></div>`;
  };
  const arrow = '<div style="flex:none;align-self:center;color:#4a4a6a;font-size:16px;padding:0 4px">→</div>';
  return `<div style="display:flex;align-items:stretch">${BEH.steps.map((s, i) => (i ? arrow : '') + box(s, i)).join('')}</div>`;
};

BEH.chat = u => {
  const st = BEH.events[u.uid];
  if (!st || (st.loading && !st.rows.length)) return '<div style="color:var(--muted);font-size:12px;padding:12px 0">Carico gli eventi…</div>';
  if (st.error && !st.rows.length) return `<div style="color:var(--red);font-size:12px;padding:12px 0">Non riesco a caricare gli eventi: ${esc(st.error)}</div>`;
  const rows = BEH.timeline(st.rows);
  const isOnb = r => r.kind === 'screen' && /^(Onboarding|Welcome|SecondOnboarding)/.test(r.name) && !r.exit;
  const t = at => `<span style="font-family:var(--mono);font-size:10.5px;color:var(--muted);margin-left:auto;padding-left:12px">${BEH.hm(at)}</span>`;
  const bubble = r => `<div style="display:flex;align-items:baseline;gap:8px;padding:8px 12px;margin:4px 0;border-radius:10px;background:var(--surface2);border:1px solid var(--border);max-width:620px">
      <div style="min-width:0"><div style="font-size:13px;color:var(--text)">${esc(BEH.screen(r.name))}${r.sec != null ? `<span style="color:var(--muted);font-size:11.5px"> · resta ${r.sec} s</span>` : ''}</div>
      ${r.acts.length ? `<div style="font-size:11.5px;color:var(--muted);margin-top:2px">${r.acts.map(esc).join(' · ')}</div>` : ''}
      ${r.exit ? `<div style="font-size:11.5px;color:var(--red);margin-top:2px">${r.exit}</div>` : ''}</div>${t(r.at)}</div>`;
  const out = []; let day = '';
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i], d = BEH.day(r.at);
    if (d !== day) { out.push(`<div style="font-size:11px;color:var(--muted);margin:14px 0 4px;font-weight:600">${d}</div>`); day = d; }
    if (isOnb(r)) {
      let j = i; while (j < rows.length && isOnb(rows[j])) j++;
      if (j - i >= 3) {
        const blk = rows.slice(i, j), secs = blk.reduce((s, x) => s + (x.sec || 0), 0);
        out.push(`<details style="max-width:620px;margin:4px 0"><summary style="cursor:pointer;padding:8px 12px;border-radius:10px;background:var(--surface2);border:1px solid var(--border);font-size:13px;color:var(--text)">Onboarding: ${blk.length} schermate in ${BEH.dur(secs * 1000)} <span style="color:var(--muted);font-size:11.5px">· tocca per vederle</span></summary><div style="padding-left:14px">${blk.map(bubble).join('')}</div></details>`);
        i = j - 1; continue;
      }
    }
    if (r.kind === 'step') out.push(`<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;margin:6px 0;border-radius:10px;background:${r.step.color}22;border:1.5px solid ${r.step.color};max-width:620px"><b style="color:${r.step.color};font-size:13px">${r.step.label}</b>${t(r.at)}</div>`);
    else if (r.kind === 'cancel') out.push(`<div style="padding:6px 12px;margin:4px 0;font-size:12.5px;color:var(--red);max-width:620px;display:flex">Ha annullato l'acquisto${t(r.at)}</div>`);
    else out.push(bubble(r));
  }
  if (!rows.length) out.push('<div style="color:var(--muted);font-size:12px">Nessun evento registrato.</div>');
  if (!st.done) out.push(`<button class="filter-btn" ${st.loading ? 'disabled' : ''} onclick="fetchBehaviorUser('${u.uid}', true)" style="margin-top:10px">${st.loading ? 'Carico…' : 'Carica gli eventi successivi'}</button>`);
  return out.join('');
};

function pageBehavior() {
  const intro = `<div style="margin-bottom:18px"><div style="font-size:20px;font-weight:700">Comportamento</div>
    <div style="font-size:13px;color:var(--muted);margin-top:2px">Scegli un gruppo, poi una persona: vedi fin dove è arrivata e cosa ha fatto nell'app, schermata per schermata.</div></div>`;
  if (BEH.loading || (!BEH.data && !BEH.error)) return intro + `<div class="empty" style="padding:60px"><div class="empty-text" style="color:var(--muted)">Caricamento…</div></div>`;
  if (BEH.error) return intro + `<div class="card" style="border-color:var(--red);color:var(--red);padding:20px">Non riesco a caricare i gruppi: ${esc(BEH.error)} <button class="filter-btn" onclick="fetchBehavior()" style="margin-left:8px">Riprova</button></div>`;
  const ui = BEH.ui, groups = BEH.groups(), g = groups.find(x => x.id === ui.group) || groups[0];
  const list = BEH.inGroup(g.id);
  const chips = groups.map(x => { const on = x.id === g.id; return `<button onclick="BEH.go({group:'${x.id}',user:null})" style="padding:6px 11px;border-radius:8px;cursor:pointer;font-family:inherit;font-size:12.5px;border:1px solid ${on ? '#7c3aed' : 'var(--border)'};background:${on ? '#1e1030' : 'transparent'};color:var(--text)">${esc(x.label)} <span style="font-family:var(--mono);color:var(--muted)">${BEH.inGroup(x.id).length}</span></button>`; }).join('');
  const nums = `<div style="display:flex;gap:22px;flex-wrap:wrap;margin-top:12px;font-size:12.5px;color:var(--muted)"><span><b style="font-family:var(--mono);font-size:16px;color:var(--text)">${list.length}</b> persone</span>
    ${BEH.steps.map(s => `<span><b style="font-family:var(--mono);font-size:16px;color:${s.color}">${list.filter(p => p.m[s.k]).length}</b> ${s.label.toLowerCase()}</span>`).join('')}</div>`;
  const step1 = `<div class="card" style="margin-bottom:16px">${BEH.label('1 · Gruppo')}<div style="display:flex;gap:6px;flex-wrap:wrap">${chips}</div>
    <div style="font-size:12px;color:var(--muted);margin-top:8px">${esc(g.label)}: ${g.sub}. Esclusi tester, emulatori e sessioni con al massimo 2 eventi.</div>${nums}</div>`;
  if (!list.length) return intro + step1 + '<div class="card" style="color:var(--muted);font-size:12px">Nessuna persona in questo gruppo, per ora.</div>';
  const u = BEH.byId(ui.user) && list.some(p => p.uid === ui.user) ? BEH.byId(ui.user) : list[0];
  if (!BEH.events[u.uid]) setTimeout(() => fetchBehaviorUser(u.uid), 0);
  const people = list.slice(0, 300).map(p => {
    const on = u.uid === p.uid, stop = BEH.steps.find(s => !p.m[s.k]);
    return `<div onclick="BEH.go({user:'${p.uid}'})" style="padding:10px 14px;cursor:pointer;border-bottom:1px solid #1a1a2e;border-left:3px solid ${on ? '#7c3aed' : 'transparent'};background:${on ? '#1e1030' : 'transparent'}">
      <div style="display:flex;align-items:center;gap:8px"><span style="font-size:13px;flex:1">${esc(BEH.name(p))}</span><span style="display:flex;gap:3px">${BEH.steps.map(s => BEH.dot(s, !!p.m[s.k], 8)).join('')}</span></div>
      <div style="font-size:11.5px;color:var(--muted);margin-top:2px">${stop ? 'si ferma prima di: ' + stop.label.toLowerCase() : 'tutte le tappe'} · ${BEH.day(p.first)}</div></div>`;
  }).join('');
  const step2 = `<div class="card" style="padding:14px 0 0"><div style="padding:0 14px">${BEH.label('2 · Persona')}</div><div style="max-height:620px;overflow:auto">${people}</div>${list.length > 300 ? `<div style="padding:10px 14px;font-size:11px;color:var(--muted)">Le prime 300 di ${list.length}</div>` : ''}</div>`;
  const step3 = `<div class="card">${BEH.label('3 · Fin dove è arrivata')}
      <div style="font-size:17px;font-weight:700">${esc(BEH.name(u))}</div>
      <div style="font-size:12px;color:var(--muted);margin:2px 0 12px">Arrivata il ${BEH.when(u.first)} · ultima volta nell'app il ${BEH.when(u.last)}, su ${esc(BEH.screen(u.last_screen))} · ${u.nwk} allenamenti finiti</div>
      ${BEH.flow(u)}
      <div style="border-top:1px solid var(--border);margin:18px 0 12px"></div>
      ${BEH.label('4 · Cosa ha fatto, in ordine')}
      <div style="max-height:560px;overflow:auto">${BEH.chat(u)}</div></div>`;
  return intro + step1 + `<div style="display:grid;grid-template-columns:300px minmax(0,1fr);gap:16px;align-items:start">${step2}${step3}</div>`;
}
