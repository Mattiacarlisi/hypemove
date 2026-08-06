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

const state = {
  page: 'overview',
  loading: true,
  stats: null,
  segments: [],
  automations: [],
  campaigns: [],
  log: null,
  contact: null,
  contactQuery: '',
  draft: null,          // campagna in editing {id?, name, subject, segment_key, html}
  sending: null,        // { campaignId } durante l'invio
  editingTemplate: null,
  toast: null,
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

async function loadLog() {
  const res = await adminCall('recent_log');
  if (res.ok) { state.log = res; render(); }
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
        ${nav('broadcast', '📣', 'Broadcast')}
        ${nav('automations', '🤖', 'Automazioni')}
        ${nav('segments', '👥', 'Segmenti')}
        ${nav('log', '📜', 'Log invii')}
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
      <td>
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
          <button class="btn btn-ghost" data-act="edit-template" data-key="${esc(a.key)}">Modifica testi</button>
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
  return `
    <div class="page-header">
      <div>
        <div class="page-title">Testi: ${esc(a.name)}</div>
        <div class="page-sub">{{firstName}} nell'oggetto diventa il nome dell'utente · le modifiche valgono dal prossimo invio</div>
      </div>
      <button class="btn btn-ghost" data-act="close-template">← Annulla</button>
    </div>
    <div class="card">
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
        <button class="btn btn-primary" data-act="save-template" data-key="${esc(a.key)}">Salva</button>
      </div>
    </div>`;
}

// ---------- pagina: Segmenti ----------

function pageSegments() {
  const cards = state.segments.map((s) => {
    const lbl = SEGMENT_LABELS[s.segment] || { name: s.segment, desc: '' };
    return `<div class="stat-card">
      <div class="stat-label">${esc(lbl.name)}</div>
      <div class="stat-value">${s.recipients}</div>
      <div class="stat-sub">${esc(lbl.desc)}</div>
    </div>`;
  }).join('');

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
        <div class="page-title">Segmenti</div>
        <div class="page-sub">Query live sul database: si aggiornano da soli, nessuna lista da mantenere</div>
      </div>
    </div>
    <div class="stats-grid">${cards}</div>
    <div class="card">
      <div class="card-title">Cerca contatto</div>
      <div class="filter-bar" style="gap:10px;">
        <input class="form-input" id="contact-q" placeholder="email dell'utente..." value="${esc(state.contactQuery)}" style="max-width:320px;">
        <button class="btn btn-primary" data-act="contact-lookup">Cerca</button>
      </div>
    </div>
    ${contactHtml}`;
}

// ---------- pagina: Log ----------

function pageLog() {
  if (!getSecret()) return '<div class="empty">Il log contiene indirizzi email: serve il secret admin (banner in alto).</div>';
  if (!state.log) { loadLog(); return '<div class="empty">Caricamento log…</div>'; }
  const deliveryByEmailId = {};
  (state.log.delivery || []).forEach((d) => {
    (deliveryByEmailId[d.resend_email_id] ??= new Set()).add(d.event_type);
  });
  const flow = (resendId) => {
    const ev = deliveryByEmailId[resendId] || new Set();
    const dot = (on, label) => `<span class="step ${on ? 'on' : ''}" title="${label}"></span>`;
    return `<span class="em-flow">
      ${dot(true, 'inviata')}${dot(ev.has('delivered'), 'consegnata')}${dot(ev.has('opened'), 'aperta')}${dot(ev.has('clicked'), 'cliccata')}
    </span>`;
  };
  const lifecycleRows = (state.log.lifecycle || []).map((r) => {
    const email = Array.isArray(r.users) ? r.users[0]?.email : r.users?.email;
    return `<tr><td>${esc(email ?? '?')}</td><td><span class="tag">${esc(r.email_type)}</span></td>
      <td>${flow(r.metadata?.resend_email_id)}</td><td>${fmtDate(r.sent_at)}</td></tr>`;
  }).join('');
  const campaignRows = (state.log.campaigns || []).map((r) => `
    <tr><td>${esc(r.email)}</td><td><span class="tag">broadcast</span></td>
      <td>${r.status === 'sent' ? flow(r.resend_email_id) : `<span class="em-status ${esc(r.status)}">${esc(r.status)}</span>`}</td>
      <td>${fmtDate(r.sent_at)}</td></tr>`).join('');
  return `
    <div class="page-header">
      <div>
        <div class="page-title">Log invii</div>
        <div class="page-sub">Timeline per messaggio: inviata → consegnata → aperta → cliccata</div>
      </div>
      <button class="btn btn-ghost" data-act="reload-log">↻ Aggiorna</button>
    </div>
    <div class="card">
      <div class="card-title">Automazioni (ultime 40)</div>
      <div class="table-wrap"><table>
        <thead><tr><th>Destinatario</th><th>Tipo</th><th>Percorso</th><th>Quando</th></tr></thead>
        <tbody>${lifecycleRows || '<tr><td colspan="4" class="empty">Nessun invio.</td></tr>'}</tbody>
      </table></div>
      <div class="card-title" style="margin-top:20px;">Broadcast (ultimi 40)</div>
      <div class="table-wrap"><table>
        <thead><tr><th>Destinatario</th><th>Tipo</th><th>Percorso</th><th>Quando</th></tr></thead>
        <tbody>${campaignRows || '<tr><td colspan="4" class="empty">Nessun broadcast ancora.</td></tr>'}</tbody>
      </table></div>
    </div>`;
}

// ---------- render ----------

function renderPage() {
  switch (state.page) {
    case 'overview': return pageOverview();
    case 'broadcast': return pageBroadcast();
    case 'automations': return pageAutomations();
    case 'segments': return pageSegments();
    case 'log': return pageLog();
    default: return pageOverview();
  }
}

function layout() {
  return `${sidebar()}
    <main class="main">
      ${secretBanner()}
      ${state.loading ? '<div class="empty">Caricamento…</div>' : renderPage()}
    </main>
    ${toastHtml()}`;
}

function render() {
  document.getElementById('app').innerHTML = layout();
  attachEvents();
  refreshPreviewFrame();
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
      if (state.page === 'log') state.log = null;
      render();
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

  if (act === 'edit-template') { state.editingTemplate = el.dataset.key; render(); return; }
  if (act === 'close-template') { state.editingTemplate = null; render(); return; }

  if (act === 'save-template') {
    const key = el.dataset.key;
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
    const res = await adminCall('update_template', { key, subject: v('t-subject'), content });
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

  if (act === 'reload-log') { state.log = null; render(); loadLog(); return; }
}

// ---------- boot ----------
// Il pannello apre senza login: le RPC email_panel_* rispondono alla sola anon
// key (aggregati, zero PII) — stesso modello delle kpi_*. Tutto ciò che scrive
// o mostra indirizzi pretende il secret admin, verificato server-side da
// email-admin: chi trova l'URL vede i numeri, ma non può toccare niente.
(function boot() {
  render();
  loadCore();
  setInterval(loadCore, REFRESH_MS);
})();
