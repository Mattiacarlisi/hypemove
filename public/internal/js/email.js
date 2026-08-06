// ============================================================
// HYPEMOVE · EMAIL — pannello broadcast, automazioni, segmenti, log.
// Stesso pattern di kpi.js/finance.js: vanilla JS, state + render()
// + attachEvents(), template literal, zero build.
//
// Modello di fiducia:
//   - letture aggregate (stats, automazioni, campagne, contatori segmenti)
//     → RPC email_panel_* con anon key, come le kpi_*;
//   - scritture e letture con PII (broadcast, toggle, template, log, lookup)
//     → edge function email-admin con header x-email-admin-secret.
//     Il secret si incolla UNA volta (banner) e vive in localStorage;
//     la verifica vera è server-side: senza secret il pannello si vede
//     ma non spara.
// ============================================================

const SUPABASE_URL = 'https://fiwskdxntgcredypplub.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpd3NrZHhudGdjcmVkeXBwbHViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMzIxNzAsImV4cCI6MjA2NDYwODE3MH0.W5b8A2zfm0Oeo746SXcANdeRhd2HsAMk5ND9Uc-q7Uo';
const ADMIN_FN = `${SUPABASE_URL}/functions/v1/email-admin`;
const SECRET_LS_KEY = 'hm_email_admin_secret';
const REFRESH_MS = 5 * 60 * 1000;

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const SEGMENT_LABELS = {
  marketing: { name: 'Marketing', desc: 'Consenso marketing esplicito — unico segmento per broadcast commerciali' },
  all_service: { name: 'Tutti (servizio)', desc: 'Solo comunicazioni di servizio (es. cambio termini) — niente marketing' },
  premium: { name: 'Premium', desc: 'Utenti premium con consenso marketing' },
  inactive_14: { name: 'Inattivi 14+', desc: 'Con consenso marketing, nessun workout da 14 giorni' },
};

// Etichette umane per i tipi di email (mai slug tecnici in UI).
const TYPE_META = {
  no_first_workout_24h: { label: 'Primo workout (24h)', color: '#fb923c' },
  no_workout_3_days: { label: 'Inattivo 3 giorni', color: '#60a5fa' },
  no_workout_7_days: { label: 'Inattivo 7 giorni', color: '#c084fc' },
  onboarding_recovery: { label: 'Recupero onboarding', color: '#4ade80' },
  campaign_test: { label: 'Test broadcast', color: '#7070a0' },
};
function kindMeta(kind) {
  if (kind && kind.startsWith('broadcast')) {
    return { label: kind.replace('broadcast: ', 'Broadcast · '), color: '#a78bfa' };
  }
  return TYPE_META[kind] ?? { label: kind ?? '?', color: '#7070a0' };
}
function kindTag(kind) {
  const m = kindMeta(kind);
  return `<span class="em-kind"><span class="dot" style="background:${m.color}"></span>${esc(m.label)}</span>`;
}
function initialOf(nameOrEmail) {
  return esc(String(nameOrEmail ?? '?').trim().charAt(0).toUpperCase() || '?');
}

const state = {
  page: 'overview',
  loading: true,
  stats: null,
  segments: [],
  automations: [],
  campaigns: [],
  contact: null,
  contactQuery: '',
  draft: null,          // campagna in editing {id?, name, subject, segment_key, html}
  sending: null,        // { campaignId } durante l'invio
  editingTemplate: null,
  toast: null,
  // casella email inviate
  mailbox: { items: null, delivery: [], q: '', limit: 60, loading: false },
  // audience explorer
  audience: { tab: 'marketing', members: null, total: 0, unsub: null, loading: false },
  // anteprima email {subject, html}
  preview: null,
  // modale metriche {kind, key, label, from, to, data, loading}
  metrics: null,
  // modalità editor template: 'simple' | 'html'
  editorMode: 'simple',
};

// ---------- helpers ----------

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}
function fmtDay(d) {
  return new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
}
function pct(part, total) {
  if (!total) return '—';
  return `${Math.round((part / total) * 100)}%`;
}
function getSecret() { return localStorage.getItem(SECRET_LS_KEY) || ''; }

function toast(msg, isError) {
  state.toast = { msg, isError: Boolean(isError) };
  render();
  setTimeout(() => { state.toast = null; render(); }, 3500);
}

async function adminCall(action, payload = {}) {
  const secret = getSecret();
  if (!secret) {
    toast('Serve il secret admin: incollalo nel banner in alto.', true);
    return { ok: false, error: 'missing_secret' };
  }
  try {
    const res = await fetch(ADMIN_FN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-email-admin-secret': secret },
      body: JSON.stringify({ action, ...payload }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.status === 401) {
      localStorage.removeItem(SECRET_LS_KEY);
      toast('Secret non valido: reincollalo.', true);
      render();
    }
    return json;
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ---------- data loading ----------

async function loadCore() {
  const [stats, segments, automations, campaigns] = await Promise.all([
    sb.rpc('email_panel_stats'),
    sb.rpc('email_segment_counts'),
    sb.rpc('email_panel_automations'),
    sb.rpc('email_panel_campaigns'),
  ]);
  if (!stats.error) state.stats = stats.data;
  if (!segments.error) state.segments = segments.data || [];
  if (!automations.error) state.automations = automations.data || [];
  if (!campaigns.error) state.campaigns = campaigns.data || [];
  state.loading = false;
  render();
}

async function loadMailbox() {
  state.mailbox.loading = true; render();
  const res = await adminCall('emails_log', { limit: state.mailbox.limit, q: state.mailbox.q });
  state.mailbox.loading = false;
  if (res.ok) {
    state.mailbox.items = res.items;
    state.mailbox.delivery = res.delivery;
    state.mailbox.at = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  }
  render();
}

async function loadAudience() {
  const a = state.audience;
  a.loading = true; render();
  if (a.tab === 'unsub') {
    const res = await adminCall('unsubscribed_list');
    if (res.ok) a.unsub = res;
  } else {
    const res = await adminCall('segment_members', { segment_key: a.tab, limit: 150 });
    if (res.ok) { a.members = res.members; a.total = res.total; }
  }
  a.loading = false; render();
}

// Stato "migliore" di un messaggio dai suoi eventi webhook → pill con icona.
function deliveryStatus(resendId, sendStatus) {
  if (sendStatus === 'failed') return { label: 'Errore', cls: 'failed', icon: '✕' };
  if (sendStatus === 'skipped_suppressed') return { label: 'Soppressa', cls: 'suppressed', icon: '⛔' };
  const ev = new Set(
    (state.mailbox.delivery || [])
      .filter((d) => d.resend_email_id === resendId)
      .map((d) => d.event_type),
  );
  if (ev.has('complained')) return { label: 'Spam report', cls: 'spam', icon: '🚫' };
  if (ev.has('bounced')) return { label: 'Bounce', cls: 'bounced', icon: '↩' };
  if (ev.has('clicked')) return { label: 'Cliccata', cls: 'clicked', icon: '🖱' };
  if (ev.has('opened')) return { label: 'Aperta', cls: 'opened', icon: '👁' };
  if (ev.has('delivered')) return { label: 'Consegnata', cls: 'delivered', icon: '✓' };
  return { label: 'Inviata', cls: 'sent', icon: '·' };
}
function statusPill(st) {
  return `<span class="em-pill ${st.cls}"><span>${st.icon}</span>${st.label}</span>`;
}

// ---------- layout ----------

function sidebar() {
  const nav = (id, icon, label) => `
    <button class="nav-item ${state.page === id ? 'active' : ''}" data-nav="${id}">
      <span class="icon">${icon}</span>${label}
    </button>`;
  return `<div class="sidebar">
      <a href="index.html" class="sidebar-logo">
        <div class="logo-mark">Hype<span>move</span></div>
        <div class="logo-sub">EMAIL</div>
      </a>
      <nav class="nav">
        <div class="nav-section">Email</div>
        ${nav('overview', '📊', 'Overview')}
        ${nav('emails', '📥', 'Email inviate')}
        ${nav('broadcast', '📣', 'Broadcast')}
        ${nav('automations', '🤖', 'Automazioni')}
        ${nav('audience', '👥', 'Audience')}
      </nav>
      <div class="sidebar-footer">Mattia &amp; Danilo · 50/50</div>
    </div>`;
}

function secretBanner() {
  if (getSecret()) return '';
  return `<div class="em-secret-banner">
    <span>🔐 Per inviare broadcast e vedere il log serve il <b>secret admin</b> (una volta sola):</span>
    <input type="password" class="form-input" id="secret-input" placeholder="incolla il secret...">
    <button class="btn btn-primary" data-act="save-secret">Attiva</button>
  </div>`;
}

function toastHtml() {
  if (!state.toast) return '';
  return `<div class="toast" style="${state.toast.isError ? 'border-color:#f87171;color:#f87171;' : ''}">${esc(state.toast.msg)}</div>`;
}

// ---------- pagina: Overview ----------

function pageOverview() {
  const s = state.stats;
  if (!s) return '<div class="empty">Caricamento…</div>';
  const daily = s.daily || [];
  const max = Math.max(1, ...daily.map((d) => d.sent));
  const bars = daily.map((d) => `
    <div class="bar-wrap">
      <div class="bar-tip">${fmtDay(d.day)} · inviate ${d.sent} · consegnate ${d.delivered} · aperte ${d.opened}</div>
      <div class="bar" style="height:${Math.round((d.sent / max) * 100)}%"></div>
    </div>`).join('');

  return `
    <div class="page-header">
      <div>
        <div class="page-title">Overview</div>
        <div class="page-sub">Ultimi 30 giorni · webhook attivo dal 06/08 (consegne/aperture/click si accumulano da lì)</div>
      </div>
      <button class="btn btn-ghost" data-act="metrics-open" data-kind="all" data-key="all" data-label="Tutte le email">📈 Analisi periodo</button>
    </div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-label">Inviate</div><div class="stat-value">${s.sent_30d}</div></div>
      <div class="stat-card"><div class="stat-label">Consegnate</div><div class="stat-value green">${s.delivered_30d}</div><div class="stat-sub">${pct(s.delivered_30d, s.sent_30d)} delle inviate</div></div>
      <div class="stat-card"><div class="stat-label">Aperte</div><div class="stat-value purple">${s.opened_30d}</div><div class="stat-sub">${pct(s.opened_30d, s.delivered_30d)} delle consegnate</div></div>
      <div class="stat-card"><div class="stat-label">Click</div><div class="stat-value purple">${s.clicked_30d}</div></div>
      <div class="stat-card"><div class="stat-label">Bounce</div><div class="stat-value ${s.bounced_30d > 0 ? 'amber' : ''}">${s.bounced_30d}</div></div>
      <div class="stat-card"><div class="stat-label">Spam report</div><div class="stat-value ${s.complained_30d > 0 ? 'red' : ''}">${s.complained_30d}</div><div class="stat-sub">tenere sotto lo 0,1%</div></div>
      <div class="stat-card"><div class="stat-label">Disiscritti (30g)</div><div class="stat-value">${s.unsub_30d}</div></div>
      <div class="stat-card"><div class="stat-label">Suppression list</div><div class="stat-value">${s.suppressions_total}</div><div class="stat-sub">bounce/complaint/manuali</div></div>
    </div>
    <div class="card">
      <div class="card-title">Invii per giorno</div>
      <div class="em-chart">${bars}</div>
    </div>`;
}

// ---------- pagina: Broadcast ----------

function pageBroadcast() {
  if (state.draft) return composerView();
  const rows = state.campaigns.map((c) => `
    <tr>
      <td>${esc(c.name)}</td>
      <td>${esc(SEGMENT_LABELS[c.segment_key]?.name ?? c.segment_key)}</td>
      <td><span class="em-status ${esc(c.status)}">${esc(c.status)}</span></td>
      <td>${c.recipients_total ?? '—'}</td>
      <td>${c.sent_count ?? 0}${c.failed_count ? ` <span style="color:#f87171">(${c.failed_count} err)</span>` : ''}</td>
      <td>${fmtDate(c.finished_at || c.started_at || c.created_at)}</td>
      <td style="white-space:nowrap;">
        ${c.status === 'sent' ? `<button class="btn btn-ghost" data-act="metrics-open" data-kind="campaign" data-key="${c.id}" data-label="${esc(c.name)}" title="Metriche">📊</button>` : ''}
        <button class="btn btn-ghost" data-act="preview-campaign" data-id="${c.id}" title="Anteprima">👁</button>
        ${c.status === 'draft' ? `<button class="btn btn-ghost" data-act="edit-campaign" data-id="${c.id}">Apri</button>` : ''}
      </td>
    </tr>`).join('');

  return `
    <div class="page-header">
      <div>
        <div class="page-title">Broadcast</div>
        <div class="page-sub">Campagne una tantum verso un segmento · HTML libero, footer e disiscrizione automatici</div>
      </div>
      <button class="btn btn-primary btn-add" data-act="new-campaign">+ Nuova campagna</button>
    </div>
    <div class="card">
      ${state.campaigns.length === 0 ? '<div class="empty">Nessuna campagna ancora. Crea la prima!</div>' : `
      <div class="table-wrap"><table>
        <thead><tr><th>Nome</th><th>Segmento</th><th>Stato</th><th>Destinatari</th><th>Inviate</th><th>Data</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>`}
    </div>`;
}

function composerView() {
  const d = state.draft;
  const seg = (key) => {
    const count = state.segments.find((s) => s.segment === key)?.recipients ?? '?';
    const lbl = SEGMENT_LABELS[key];
    return `<option value="${key}" ${d.segment_key === key ? 'selected' : ''}>${lbl.name} (${count})</option>`;
  };
  const sendingNow = state.sending != null;
  return `
    <div class="page-header">
      <div>
        <div class="page-title">${d.id ? 'Modifica campagna' : 'Nuova campagna'}</div>
        <div class="page-sub">Il footer con il link di disiscrizione viene aggiunto in automatico a ogni invio</div>
      </div>
      <button class="btn btn-ghost" data-act="close-composer">← Torna alla lista</button>
    </div>
    <div class="card">
      <div class="form-grid" style="grid-template-columns: 2fr 2fr 1fr;">
        <div class="form-field">
          <label class="form-label">Nome interno</label>
          <input class="form-input" id="c-name" value="${esc(d.name)}" placeholder="es. Novità di agosto">
        </div>
        <div class="form-field">
          <label class="form-label">Oggetto</label>
          <input class="form-input" id="c-subject" value="${esc(d.subject)}" placeholder="Oggetto dell'email">
        </div>
        <div class="form-field">
          <label class="form-label">Segmento</label>
          <select class="form-input" id="c-segment">
            ${seg('marketing')}${seg('premium')}${seg('inactive_14')}${seg('all_service')}
          </select>
        </div>
      </div>
      <div class="em-composer-grid" style="margin-top:16px;">
        <div class="form-field">
          <label class="form-label">HTML della mail (senza footer)</label>
          <textarea class="em-html-input" id="c-html" placeholder="<div>...il tuo HTML...</div>">${esc(d.html)}</textarea>
        </div>
        <div class="form-field">
          <label class="form-label">Anteprima</label>
          <iframe class="em-preview" id="c-preview" sandbox=""></iframe>
        </div>
      </div>
      <div class="filter-bar" style="margin-top:18px; gap:10px; flex-wrap:wrap;">
        <button class="btn btn-ghost" data-act="refresh-preview">Aggiorna anteprima</button>
        <span style="flex:1"></span>
        <input class="form-input" id="c-test-to" placeholder="email di prova" style="max-width:220px;" value="carlisimattia@gmail.com">
        <button class="btn" data-act="test-send" ${sendingNow ? 'disabled' : ''}>Invia test</button>
        <button class="btn" data-act="save-campaign" ${sendingNow ? 'disabled' : ''}>Salva bozza</button>
        <button class="btn btn-primary" data-act="send-campaign" ${sendingNow ? 'disabled' : ''}>
          ${sendingNow ? 'Invio in corso…' : 'Invia campagna'}
        </button>
      </div>
      ${d.segment_key === 'all_service' ? `<p class="em-muted-line">⚠️ "Tutti (servizio)" è solo per comunicazioni di servizio (es. cambio termini) — mai contenuto commerciale: include chi NON ha dato il consenso marketing.</p>` : ''}
    </div>`;
}

// ---------- pagina: Automazioni ----------

function pageAutomations() {
  if (state.editingTemplate) return templateEditor();
  const cards = state.automations.map((a) => `
    <div class="card">
      <div class="em-automation-head">
        <div>
          <div class="card-title" style="margin-bottom:2px;">${esc(a.name)}</div>
          <div class="em-muted-line">Oggetto: ${esc(a.subject ?? '—')}</div>
          <div class="em-muted-line">30 giorni: <b>${a.sent_30d}</b> inviate · ultima: ${fmtDate(a.last_sent_at)}</div>
        </div>
        <div style="display:flex; gap:10px; align-items:center;">
          <button class="btn btn-ghost" data-act="metrics-open" data-kind="automation" data-key="${esc(a.key)}" data-label="${esc(a.name)}">📊 Metriche</button>
          <button class="btn btn-ghost" data-act="preview-automation" data-key="${esc(a.key)}">👁 Anteprima</button>
          <button class="btn btn-ghost" data-act="edit-template" data-key="${esc(a.key)}">✏️ Modifica</button>
          <button class="em-toggle ${a.enabled ? 'on' : ''}" data-act="toggle-automation" data-key="${esc(a.key)}" data-enabled="${a.enabled}" title="${a.enabled ? 'Attiva' : 'Spenta'}"></button>
        </div>
      </div>
    </div>`).join('');
  return `
    <div class="page-header">
      <div>
        <div class="page-title">Automazioni</div>
        <div class="page-sub">Email automatiche su eventi in-app · on/off e testi senza deploy</div>
      </div>
    </div>
    ${cards || '<div class="empty">Nessuna automazione.</div>'}`;
}

function templateEditor() {
  const a = state.automations.find((x) => x.key === state.editingTemplate);
  if (!a) { state.editingTemplate = null; return pageAutomations(); }
  const c = a.content || {};
  const mode = state.editorMode;

  const header = `
    <div class="page-header">
      <div>
        <div class="page-title">${esc(a.name)}</div>
        <div class="page-sub">{{firstName}} diventa il nome dell'utente · le modifiche valgono dal prossimo invio</div>
      </div>
      <div style="display:flex; gap:10px; align-items:center;">
        <div class="em-mode-switch">
          <button class="${mode === 'simple' ? 'active' : ''}" data-act="editor-mode" data-mode="simple">Editor guidato</button>
          <button class="${mode === 'html' ? 'active' : ''}" data-act="editor-mode" data-mode="html">HTML libero</button>
        </div>
        <button class="btn btn-ghost" data-act="close-template">← Annulla</button>
      </div>
    </div>`;

  if (mode === 'html') {
    return `${header}
    <div class="card">
      <div class="form-field">
        <label class="form-label">Oggetto</label>
        <input class="form-input" id="t-subject" value="${esc(a.subject)}">
      </div>
      <div class="form-field" style="margin-top:12px;">
        <label class="form-label">HTML della mail (senza footer — viene aggiunto a ogni invio con il link di disiscrizione)</label>
        <textarea class="em-html-input" id="t-html" style="min-height:340px;" placeholder="<div>...incolla qui il tuo HTML...</div>">${esc(a.html ?? '')}</textarea>
      </div>
      <p class="em-muted-line">Puoi usare {{firstName}} anche nell'HTML. Salvando in questa modalità la mail usa SOLO questo HTML; per tornare al layout guidato, passa a "Editor guidato" e salva da lì.</p>
      <div class="modal-actions" style="margin-top:16px;">
        <button class="btn" data-act="preview-editing-template">👁 Anteprima con questo HTML</button>
        <button class="btn btn-primary" data-act="save-template" data-key="${esc(a.key)}">Salva</button>
      </div>
    </div>`;
  }

  return `${header}
    <div class="card">
      ${a.html ? '<p class="em-muted-line" style="margin-bottom:12px;">⚠️ Questa automazione sta usando un HTML libero: salvando da qui tornerà al layout guidato qui sotto.</p>' : ''}
      <div class="form-grid" style="grid-template-columns: 1fr 1fr;">
        <div class="form-field"><label class="form-label">Oggetto</label>
          <input class="form-input" id="t-subject" value="${esc(a.subject)}"></div>
        <div class="form-field"><label class="form-label">Titolo</label>
          <input class="form-input" id="t-title" value="${esc(c.title ?? '')}"></div>
        <div class="form-field"><label class="form-label">Badge (opzionale)</label>
          <input class="form-input" id="t-badge" value="${esc(c.badge ?? '')}"></div>
        <div class="form-field"><label class="form-label">Emoji grande (opzionale)</label>
          <input class="form-input" id="t-emoji" value="${esc(c.emoji ?? '')}"></div>
        <div class="form-field"><label class="form-label">Bottone — testo</label>
          <input class="form-input" id="t-cta-label" value="${esc(c.ctaLabel ?? '')}"></div>
        <div class="form-field"><label class="form-label">Bottone — link</label>
          <input class="form-input" id="t-cta-url" value="${esc(c.ctaUrl ?? '')}"></div>
      </div>
      <div class="form-field" style="margin-top:12px;"><label class="form-label">Paragrafi (uno per riga)</label>
        <textarea class="em-html-input" id="t-paragraphs" style="min-height:100px;">${esc((c.paragraphs ?? []).join('\n'))}</textarea></div>
      <div class="form-field" style="margin-top:12px;"><label class="form-label">Box finale evidenziato (opzionale)</label>
        <input class="form-input" id="t-note" value="${esc(c.note ?? '')}"></div>
      <div class="modal-actions" style="margin-top:16px;">
        <button class="btn" data-act="preview-editing-template">👁 Anteprima con questi testi</button>
        <button class="btn btn-primary" data-act="save-template" data-key="${esc(a.key)}">Salva</button>
      </div>
    </div>`;
}

// ---------- pagina: Audience ----------

function pageAudience() {
  const a = state.audience;
  const cards = state.segments.map((s) => {
    const lbl = SEGMENT_LABELS[s.segment] || { name: s.segment, desc: '' };
    return `<div class="stat-card" style="cursor:pointer;${a.tab === s.segment ? 'border-color:var(--accent);' : ''}" data-act="audience-tab" data-tab="${esc(s.segment)}">
      <div class="stat-label">${esc(lbl.name)}</div>
      <div class="stat-value">${s.recipients}</div>
      <div class="stat-sub">${esc(lbl.desc)}</div>
    </div>`;
  }).join('');

  let bodyHtml = '';
  if (!getSecret()) {
    bodyHtml = '<div class="empty">La lista dei membri contiene email: serve il secret admin (banner in alto).</div>';
  } else if (a.loading) {
    bodyHtml = '<div class="empty">Caricamento…</div>';
  } else if (a.tab === 'unsub') {
    const reasonPill = (r) => r === 'complaint'
      ? '<span class="em-pill spam">🚫 spam report</span>'
      : r === 'bounce'
      ? '<span class="em-pill bounced">↩ bounce</span>'
      : '<span class="em-pill suppressed">⛔ opt-out</span>';
    const lifecycleRows = (a.unsub?.lifecycle_disabled || []).map((u) => `
      <tr><td><span class="em-mail-to">${esc(u.email)}</span></td><td>${esc(u.name ?? '—')}</td><td><span class="em-mail-when">${fmtDate(u.created_at)}</span></td></tr>`).join('');
    const suppRows = (a.unsub?.suppressions || []).map((s) => `
      <tr><td><span class="em-mail-to">${esc(s.email)}</span></td><td>${reasonPill(s.reason)}</td><td><span class="em-kind">${esc(s.source ?? '—')}</span></td><td><span class="em-mail-when">${fmtDate(s.created_at)}</span></td></tr>`).join('');
    bodyHtml = `<div class="card">
      <div class="card-title">Promemoria disattivati <span class="em-chip" style="margin-left:8px;"><b>${(a.unsub?.lifecycle_disabled || []).length}</b></span></div>
      <div class="table-wrap"><table class="em-mail-table">
        <thead><tr><th>Email</th><th>Nome</th><th style="text-align:right;">Registrato</th></tr></thead>
        <tbody>${lifecycleRows || '<tr><td colspan="3" class="empty">Nessuno 🎉</td></tr>'}</tbody>
      </table></div>
      <div class="card-title" style="margin-top:22px;">Suppression list <span class="em-chip" style="margin-left:8px;"><b>${(a.unsub?.suppressions || []).length}</b></span></div>
      <div class="em-muted-line" style="margin-bottom:8px;">Bounce, segnalazioni spam e opt-out permanenti: non ricevono mai più nulla, da nessun flusso.</div>
      <div class="table-wrap"><table class="em-mail-table">
        <thead><tr><th>Email</th><th>Motivo</th><th>Origine</th><th style="text-align:right;">Quando</th></tr></thead>
        <tbody>${suppRows || '<tr><td colspan="4" class="empty">Vuota 🎉</td></tr>'}</tbody>
      </table></div>
    </div>`;
  } else {
    const filter = (a.filter || '').toLowerCase();
    const members = (a.members || []).filter((u) =>
      !filter ||
      (u.email || '').toLowerCase().includes(filter) ||
      (u.name || '').toLowerCase().includes(filter));
    const rows = members.map((u) => `
      <tr>
        <td>
          <div style="display:flex; align-items:center; gap:11px;">
            <div style="width:32px;height:32px;border-radius:50%;background:var(--accent-lo);border:1px solid var(--border2);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:var(--text);flex:none;">${initialOf(u.name || u.email)}</div>
            <div style="min-width:0;">
              <div style="font-size:13px;color:var(--text);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(u.name || '—')}</div>
              <div class="em-mail-to" style="color:var(--muted);">${esc(u.email)}</div>
            </div>
          </div>
        </td>
        <td>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            ${u.marketing_consent ? '<span class="em-pill delivered">✓ Marketing</span>' : '<span class="em-pill sent">solo servizio</span>'}
            ${u.lifecycle_emails_enabled === false ? '<span class="em-pill bounced">promemoria off</span>' : ''}
            ${u.is_premium ? '<span class="em-pill clicked">⭐ Premium</span>' : ''}
          </div>
        </td>
        <td><span class="em-mail-when">${fmtDate(u.created_at)}</span></td>
      </tr>`).join('');
    const lbl = SEGMENT_LABELS[a.tab]?.name ?? a.tab;
    bodyHtml = `<div class="card">
      <div class="filter-bar" style="gap:10px; margin-bottom:6px; align-items:center;">
        <div class="card-title" style="margin:0;">${esc(lbl)}</div>
        <span class="em-chip"><b>${a.total}</b> membri${a.total > 150 ? ' · primi 150 mostrati' : ''}</span>
        <span style="flex:1"></span>
        <input class="form-input" id="audience-filter" placeholder="cerca tra i caricati..." value="${esc(a.filter || '')}" style="max-width:240px;">
      </div>
      <div class="table-wrap"><table class="em-mail-table">
        <thead><tr><th>Utente</th><th>Stato</th><th style="text-align:right;">Registrato</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="3" class="empty">Nessun risultato.</td></tr>'}</tbody>
      </table></div>
    </div>`;
  }

  let contactHtml = '';
  if (state.contact) {
    const c = state.contact;
    if (!c.user && !c.suppression) {
      contactHtml = '<div class="empty">Nessun utente con questa email.</div>';
    } else {
      const u = c.user;
      const hist = (c.history || []).map((h) => `<tr><td>${esc(h.email_type)}</td><td>${fmtDate(h.sent_at)}</td></tr>`).join('');
      const del = (c.delivery || []).map((d) => `<tr><td>${esc(d.event_type)}</td><td>${fmtDate(d.created_at)}</td></tr>`).join('');
      contactHtml = `<div class="card">
        ${u ? `
          <div class="card-title">${esc(u.name ?? u.email)}</div>
          <div class="em-muted-line">Registrato: ${fmtDate(u.created_at)} · Premium: ${u.is_premium ? 'sì' : 'no'} · Onboarding: ${u.onboarding_completed ? 'completo' : 'incompleto'}</div>
          <div style="margin-top:10px; display:flex; gap:8px; flex-wrap:wrap;">
            <span class="badge">${u.marketing_consent ? '✅ consenso marketing' : '✕ niente marketing'}</span>
            <span class="badge">${u.lifecycle_emails_enabled ? '✅ promemoria attivi' : '✕ promemoria disattivati'}</span>
            ${c.suppression ? `<span class="badge" style="color:#f87171;">⛔ SUPPRESSED (${esc(c.suppression.reason)})</span>` : ''}
          </div>` : `
          <div class="card-title">${esc(state.contactQuery)}</div>
          ${c.suppression ? `<span class="badge" style="color:#f87171;">⛔ SUPPRESSED (${esc(c.suppression.reason)})</span>` : ''}`}
        ${hist ? `<div class="card-title" style="margin-top:16px;">Email ricevute</div>
          <div class="table-wrap"><table><thead><tr><th>Tipo</th><th>Quando</th></tr></thead><tbody>${hist}</tbody></table></div>` : ''}
        ${del ? `<div class="card-title" style="margin-top:16px;">Eventi di consegna</div>
          <div class="table-wrap"><table><thead><tr><th>Evento</th><th>Quando</th></tr></thead><tbody>${del}</tbody></table></div>` : ''}
      </div>`;
    }
  }

  return `
    <div class="page-header">
      <div>
        <div class="page-title">Audience</div>
        <div class="page-sub">Segmenti live sul database — clicca una card per vedere chi c'è dentro</div>
      </div>
      <button class="btn ${a.tab === 'unsub' ? 'btn-primary' : 'btn-ghost'}" data-act="audience-tab" data-tab="unsub">Disiscritti &amp; soppressi</button>
    </div>
    <div class="stats-grid">${cards}</div>
    ${bodyHtml}
    <div class="card">
      <div class="card-title">Cerca contatto</div>
      <div class="filter-bar" style="gap:10px;">
        <input class="form-input" id="contact-q" placeholder="email dell'utente..." value="${esc(state.contactQuery)}" style="max-width:320px;">
        <button class="btn btn-primary" data-act="contact-lookup">Cerca</button>
      </div>
    </div>
    ${contactHtml}`;
}

// ---------- pagina: Email inviate (la "casella") ----------

function pageEmails() {
  if (!getSecret()) return '<div class="empty">La casella contiene indirizzi email: serve il secret admin (banner in alto).</div>';
  const m = state.mailbox;
  if (m.items === null && !m.loading) { loadMailbox(); return '<div class="empty">Caricamento…</div>'; }

  const items = m.items || [];
  const rows = items.map((it) => {
    const st = deliveryStatus(it.resend_email_id, it.send_status);
    return `<tr>
      <td><span class="em-mail-to">${esc(it.to)}</span></td>
      <td><span class="em-mail-subject">${esc(it.subject)}</span></td>
      <td>${kindTag(it.kind)}</td>
      <td>${statusPill(st)}</td>
      <td><span class="em-mail-when">${fmtDate(it.sent_at)}</span></td>
    </tr>`;
  }).join('');

  // Chip riassuntivi degli stati sulla lista corrente.
  const counts = {};
  items.forEach((it) => {
    const st = deliveryStatus(it.resend_email_id, it.send_status);
    counts[st.label] = (counts[st.label] || 0) + 1;
  });
  const chips = Object.entries(counts)
    .map(([label, n]) => `<span class="em-chip"><b>${n}</b> ${esc(label.toLowerCase())}</span>`)
    .join('');

  return `
    <div class="page-header">
      <div>
        <div class="page-title">Email inviate</div>
        <div class="page-sub">Ogni email uscita dal sistema con l'esito reale dai webhook${m.at ? ` · aggiornato alle ${m.at}` : ''}</div>
      </div>
      <div style="display:flex; gap:8px;">
        <button class="btn btn-ghost" data-act="metrics-open" data-kind="all" data-key="all" data-label="Tutte le email">📈 Analisi periodo</button>
        <button class="btn btn-ghost" data-act="mailbox-reload">↻ Aggiorna</button>
      </div>
    </div>
    <div class="card">
      <div class="filter-bar" style="gap:10px; margin-bottom:14px; align-items:center;">
        <input class="form-input" id="mailbox-q" placeholder="filtra per indirizzo..." value="${esc(m.q)}" style="max-width:280px;">
        <button class="btn" data-act="mailbox-search">Filtra</button>
        ${m.q ? '<button class="btn btn-ghost" data-act="mailbox-clear">Pulisci</button>' : ''}
        <span style="flex:1"></span>
        <div class="em-chips">${chips}</div>
      </div>
      ${m.loading ? '<div class="empty">Caricamento…</div>' : `
      <div class="table-wrap"><table class="em-mail-table">
        <thead><tr><th>Destinatario</th><th>Oggetto</th><th>Tipo</th><th>Stato</th><th style="text-align:right;">Quando</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="5" class="empty">Nessuna email trovata.</td></tr>'}</tbody>
      </table></div>
      ${items.length >= m.limit ? '<div style="text-align:center;margin-top:14px;"><button class="btn btn-ghost" data-act="mailbox-more">Carica altre</button></div>' : ''}`}
      <p class="em-muted-line" style="margin-top:12px;">ℹ️ Gli invii precedenti alle 11:41 del 06/08 restano "Inviata": il webhook che traccia consegne e aperture è nato in quel momento. Le mail di verifica registrazione ("Confirm Your Signup") partono da Supabase Auth e si vedono solo su Resend.</p>
    </div>`;
}

// ---------- metriche (funziona per tutto: automazioni, broadcast, totale) ----------

async function loadMetrics() {
  const m = state.metrics;
  if (!m) return;
  m.loading = true; render();
  const { data, error } = await sb.rpc('email_metrics', {
    p_kind: m.kind, p_key: m.key, p_from: m.from, p_to: m.to,
  });
  m.loading = false;
  if (!error) m.data = data;
  render();
}

function metricsModal() {
  const m = state.metrics;
  if (!m) return '';
  const d = m.data;
  const tile = (v, l, cls, sub) => `<div class="em-metric ${cls || ''}">
    <div class="v">${v}</div><div class="l">${l}</div>${sub ? `<div class="s">${sub}</div>` : ''}
  </div>`;
  let grid = '<div class="empty">Caricamento…</div>';
  if (!m.loading && d) {
    grid = `<div class="em-metrics-grid">
      ${tile(d.sent, 'Inviate')}
      ${tile(d.delivered, 'Consegnate', 'good', `${pct(d.delivered, d.sent)} delle inviate`)}
      ${tile(d.opened, 'Aperte', 'good', `${pct(d.opened, d.delivered)} delle consegnate`)}
      ${tile(d.clicked, 'Click sul bottone', 'good', pct(d.clicked, d.delivered))}
      ${tile(d.bounced, 'Bounce', d.bounced > 0 ? 'warn' : '')}
      ${tile(d.complained, 'Spam report', d.complained > 0 ? 'bad' : '')}
      ${tile(d.unsubscribed, 'Disiscritti', d.unsubscribed > 0 ? 'warn' : '')}
      ${tile(d.delivered ? pct(d.opened, d.delivered) : '—', 'Open rate')}
    </div>`;
  }
  return `<div class="modal-overlay" data-act="metrics-close">
    <div class="modal" style="max-width:720px;width:94%;" onclick="event.stopPropagation()">
      <div class="modal-title">📈 ${esc(m.label)}</div>
      <div class="em-daterange">
        <span class="em-muted-line" style="margin:0;">Dal</span>
        <input type="date" id="metrics-from" value="${m.from}">
        <span class="em-muted-line" style="margin:0;">al</span>
        <input type="date" id="metrics-to" value="${m.to}">
        <button class="btn btn-primary" data-act="metrics-apply">Applica</button>
        <span style="flex:1"></span>
        <button class="btn btn-ghost" data-act="metrics-range" data-days="7">7g</button>
        <button class="btn btn-ghost" data-act="metrics-range" data-days="30">30g</button>
        <button class="btn btn-ghost" data-act="metrics-range" data-days="90">90g</button>
      </div>
      ${grid}
      <p class="em-muted-line">Consegne, aperture e click sono tracciati dal 06/08/2026 (nascita del webhook): gli invii precedenti contano solo come "inviate". Le disiscrizioni sono attribuite alla singola email per gli invii dal 06/08 in poi.</p>
      <div class="modal-actions"><button class="btn btn-ghost" data-act="metrics-close">Chiudi</button></div>
    </div>
  </div>`;
}

// ---------- modale anteprima email ----------

function previewModal() {
  if (!state.preview) return '';
  return `<div class="modal-overlay" data-act="close-preview">
    <div class="modal" style="max-width:640px;width:92%;" onclick="event.stopPropagation()">
      <div class="modal-title">${esc(state.preview.subject ?? 'Anteprima')}</div>
      <iframe class="em-preview" style="min-height:480px;background:#FDFDFD;" id="preview-frame" sandbox=""></iframe>
      <div class="modal-actions"><button class="btn btn-ghost" data-act="close-preview">Chiudi</button></div>
    </div>
  </div>`;
}

// ---------- render ----------

function renderPage() {
  switch (state.page) {
    case 'overview': return pageOverview();
    case 'emails': return pageEmails();
    case 'broadcast': return pageBroadcast();
    case 'automations': return pageAutomations();
    case 'audience': return pageAudience();
    default: return pageOverview();
  }
}

function layout() {
  return `${sidebar()}
    <main class="main">
      ${secretBanner()}
      ${state.loading ? '<div class="empty">Caricamento…</div>' : renderPage()}
    </main>
    ${metricsModal()}
    ${previewModal()}
    ${toastHtml()}`;
}

function render() {
  document.getElementById('app').innerHTML = layout();
  attachEvents();
  refreshPreviewFrame();
  const pf = document.getElementById('preview-frame');
  if (pf && state.preview) pf.srcdoc = state.preview.html;
}

function refreshPreviewFrame() {
  const frame = document.getElementById('c-preview');
  const html = document.getElementById('c-html');
  if (frame && state.draft) {
    frame.srcdoc = `<!doctype html><body style="margin:0;background:#FDFDFD;">${(html?.value ?? state.draft.html) || '<p style="font-family:Arial;color:#999;padding:30px;">Scrivi l\'HTML a sinistra…</p>'}<div style="max-width:560px;margin:0 auto;text-align:center;padding:22px 12px;font-family:Arial;"><p style="font-size:12px;color:#777;">[footer disiscrizione automatico]</p></div></body>`;
  }
}

// mantiene i valori del composer nello state prima di un re-render
function captureDraft() {
  if (!state.draft) return;
  const v = (id) => document.getElementById(id)?.value;
  state.draft.name = v('c-name') ?? state.draft.name;
  state.draft.subject = v('c-subject') ?? state.draft.subject;
  state.draft.segment_key = v('c-segment') ?? state.draft.segment_key;
  state.draft.html = v('c-html') ?? state.draft.html;
}

// ---------- events ----------

function attachEvents() {
  document.querySelectorAll('[data-nav]').forEach((el) => {
    el.addEventListener('click', () => {
      captureDraft();
      state.page = el.dataset.nav;
      render();
      if (state.page === 'audience' && state.audience.members === null && getSecret()) loadAudience();
    });
  });

  document.querySelectorAll('[data-act]').forEach((el) => {
    el.addEventListener('click', () => handleAction(el));
  });

  const htmlInput = document.getElementById('c-html');
  if (htmlInput) {
    let t;
    htmlInput.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(refreshPreviewFrame, 600);
    });
  }
  const segSelect = document.getElementById('c-segment');
  if (segSelect) {
    segSelect.addEventListener('change', () => { captureDraft(); render(); });
  }

  // Filtro live sui membri audience caricati (mantiene il focus dopo il re-render).
  const audFilter = document.getElementById('audience-filter');
  if (audFilter) {
    let t;
    audFilter.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => {
        state.audience.filter = audFilter.value;
        render();
        const el2 = document.getElementById('audience-filter');
        if (el2) { el2.focus(); el2.setSelectionRange(el2.value.length, el2.value.length); }
      }, 250);
    });
  }

  // Enter nel filtro casella = Filtra.
  const mq = document.getElementById('mailbox-q');
  if (mq) {
    mq.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        state.mailbox.q = mq.value.trim();
        state.mailbox.limit = 60;
        loadMailbox();
      }
    });
  }
}

async function handleAction(el) {
  const act = el.dataset.act;

  if (act === 'save-secret') {
    const val = document.getElementById('secret-input')?.value?.trim();
    if (!val) return;
    localStorage.setItem(SECRET_LS_KEY, val);
    const res = await adminCall('ping');
    if (res.ok) { toast('Secret attivato ✅'); render(); }
    return;
  }

  if (act === 'new-campaign') {
    state.draft = { id: null, name: '', subject: '', segment_key: 'marketing', html: '' };
    render();
    return;
  }
  if (act === 'edit-campaign') {
    const c = state.campaigns.find((x) => x.id === el.dataset.id);
    if (c) {
      state.draft = { id: c.id, name: c.name, subject: c.subject, segment_key: c.segment_key, html: c.html };
      render();
    }
    return;
  }
  if (act === 'close-composer') { state.draft = null; render(); return; }
  if (act === 'refresh-preview') { refreshPreviewFrame(); return; }

  if (act === 'test-send') {
    captureDraft();
    const to = document.getElementById('c-test-to')?.value?.trim();
    if (!to || !state.draft.subject || !state.draft.html) {
      toast('Servono oggetto, HTML e un indirizzo di prova.', true);
      return;
    }
    const res = await adminCall('test_send', { to, subject: state.draft.subject, html: state.draft.html });
    toast(res.ok ? `Test inviato a ${to} ✅` : `Errore test: ${res.error ?? 'sconosciuto'}`, !res.ok);
    return;
  }

  if (act === 'save-campaign') {
    captureDraft();
    const res = await adminCall('save_campaign', { campaign: state.draft });
    if (res.ok) {
      state.draft.id = res.campaign.id;
      toast(`Bozza salvata · ${res.recipients_count} destinatari nel segmento`);
      loadCore();
    } else {
      toast(`Errore salvataggio: ${res.error ?? '?'}`, true);
    }
    return;
  }

  if (act === 'send-campaign') {
    captureDraft();
    // 1. salva (o aggiorna) la bozza, così il conteggio è fresco
    const saved = await adminCall('save_campaign', { campaign: state.draft });
    if (!saved.ok) { toast(`Errore: ${saved.error ?? '?'}`, true); return; }
    state.draft.id = saved.campaign.id;
    const n = saved.recipients_count;
    const segName = SEGMENT_LABELS[state.draft.segment_key]?.name ?? state.draft.segment_key;
    // 2. conferma esplicita col numero reale
    const typed = prompt(`Stai per inviare "${state.draft.subject}" a ${n} utenti del segmento ${segName}.\n\nPer confermare scrivi: INVIA`);
    if (typed !== 'INVIA') { toast('Invio annullato.'); return; }
    // 3. spara (la chiamata resta appesa finché il motore non finisce)
    state.sending = { campaignId: state.draft.id };
    render();
    const res = await adminCall('send_campaign', { campaign_id: state.draft.id });
    state.sending = null;
    if (res.ok) {
      toast(`Campagna inviata: ${res.sent} ok, ${res.failed} errori, ${res.skipped_suppressed} soppressi ✅`);
      state.draft = null;
      loadCore();
    } else {
      toast(`Errore invio: ${res.error ?? '?'} — riapri e riprova: gli invii già fatti non si duplicano.`, true);
      loadCore();
    }
    return;
  }

  if (act === 'toggle-automation') {
    const key = el.dataset.key;
    const next = el.dataset.enabled !== 'true';
    const res = await adminCall('toggle_automation', { key, enabled: next });
    if (res.ok) {
      const a = state.automations.find((x) => x.key === key);
      if (a) a.enabled = next;
      toast(`${key} → ${next ? 'ATTIVA' : 'SPENTA'}`);
      render();
    }
    return;
  }

  if (act === 'edit-template') {
    state.editingTemplate = el.dataset.key;
    const a = state.automations.find((x) => x.key === el.dataset.key);
    state.editorMode = a?.html ? 'html' : 'simple';
    render();
    return;
  }
  if (act === 'editor-mode') { state.editorMode = el.dataset.mode; render(); return; }
  if (act === 'close-template') { state.editingTemplate = null; render(); return; }

  if (act === 'save-template') {
    const key = el.dataset.key;
    const subject = document.getElementById('t-subject')?.value ?? '';
    const payload = state.editorMode === 'html'
      // HTML libero: salva l'html; se svuotato, torna al layout guidato.
      ? { key, subject, html: document.getElementById('t-html')?.value ?? '' }
      // Editor guidato: salva il content e azzera l'eventuale html libero.
      : { key, subject, content: collectTemplateEditorContent(), html: '' };
    const res = await adminCall('update_template', payload);
    if (res.ok) {
      toast('Testi salvati: valgono dal prossimo invio ✅');
      state.editingTemplate = null;
      loadCore();
    } else {
      toast(`Errore salvataggio: ${res.error ?? '?'}`, true);
    }
    return;
  }

  if (act === 'contact-lookup') {
    const q = document.getElementById('contact-q')?.value?.trim();
    if (!q) return;
    state.contactQuery = q;
    const res = await adminCall('contact_lookup', { email: q });
    if (res.ok) { state.contact = res; render(); }
    return;
  }

  if (act === 'mailbox-reload') { loadMailbox(); return; }
  if (act === 'mailbox-search') {
    state.mailbox.q = document.getElementById('mailbox-q')?.value?.trim() ?? '';
    state.mailbox.limit = 60;
    loadMailbox();
    return;
  }
  if (act === 'mailbox-clear') { state.mailbox.q = ''; state.mailbox.limit = 60; loadMailbox(); return; }
  if (act === 'mailbox-more') { state.mailbox.limit = Math.min(state.mailbox.limit + 60, 200); loadMailbox(); return; }

  if (act === 'audience-tab') {
    state.audience.tab = el.dataset.tab;
    state.audience.members = null;
    state.audience.unsub = null;
    render();
    if (getSecret()) loadAudience();
    return;
  }

  if (act === 'preview-automation') {
    const a = state.automations.find((x) => x.key === el.dataset.key);
    if (!a) return;
    const payload = a.html
      ? { subject: a.subject, html: a.html }
      : { subject: a.subject, content: a.content };
    const res = await adminCall('render_template', payload);
    if (res.ok) { state.preview = res; render(); }
    return;
  }

  if (act === 'preview-editing-template') {
    const subject = document.getElementById('t-subject')?.value ?? '';
    const payload = state.editorMode === 'html'
      ? { subject, html: document.getElementById('t-html')?.value ?? '' }
      : { subject, content: collectTemplateEditorContent() };
    const res = await adminCall('render_template', payload);
    if (res.ok) { state.preview = res; render(); }
    return;
  }

  if (act === 'preview-campaign') {
    const c = state.campaigns.find((x) => x.id === el.dataset.id);
    if (!c) return;
    state.preview = {
      subject: c.subject,
      html: `<!doctype html><body style="margin:0;background:#FDFDFD;">${c.html}<div style="max-width:560px;margin:0 auto;text-align:center;padding:22px 12px;font-family:Arial;"><p style="font-size:12px;color:#777;">[footer disiscrizione automatico]</p></div></body>`,
    };
    render();
    return;
  }

  if (act === 'close-preview') { state.preview = null; render(); return; }

  if (act === 'metrics-open') {
    const iso = (d) => d.toISOString().slice(0, 10);
    const today = new Date();
    state.metrics = {
      kind: el.dataset.kind,
      key: el.dataset.key,
      label: el.dataset.label,
      from: iso(new Date(today.getTime() - 29 * 864e5)),
      to: iso(today),
      data: null,
      loading: true,
    };
    render();
    loadMetrics();
    return;
  }
  if (act === 'metrics-apply') {
    state.metrics.from = document.getElementById('metrics-from')?.value || state.metrics.from;
    state.metrics.to = document.getElementById('metrics-to')?.value || state.metrics.to;
    loadMetrics();
    return;
  }
  if (act === 'metrics-range') {
    const days = Number(el.dataset.days) || 30;
    const iso = (d) => d.toISOString().slice(0, 10);
    const today = new Date();
    state.metrics.from = iso(new Date(today.getTime() - (days - 1) * 864e5));
    state.metrics.to = iso(today);
    loadMetrics();
    return;
  }
  if (act === 'metrics-close') { state.metrics = null; render(); return; }
}

function collectTemplateEditorContent() {
  const v = (id) => document.getElementById(id)?.value ?? '';
  const content = {
    title: v('t-title'),
    paragraphs: v('t-paragraphs').split('\n').map((s) => s.trim()).filter(Boolean),
    ctaLabel: v('t-cta-label'),
    ctaUrl: v('t-cta-url'),
  };
  if (v('t-badge')) content.badge = v('t-badge');
  if (v('t-emoji')) content.emoji = v('t-emoji');
  if (v('t-note')) content.note = v('t-note');
  return content;
}

// ---------- boot ----------
// Il pannello apre senza login: le RPC email_panel_* rispondono alla sola anon
// key (aggregati, zero PII) — stesso modello delle kpi_*. Tutto ciò che scrive
// o mostra indirizzi pretende il secret admin, verificato server-side da
// email-admin: chi trova l'URL vede i numeri, ma non può toccare niente.
(function boot() {
  render();
  loadCore();
  setInterval(() => {
    loadCore();
    if (state.page === 'emails' && getSecret()) loadMailbox();
  }, REFRESH_MS);
})();
