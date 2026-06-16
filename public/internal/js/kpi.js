// KPI Dashboard — HypeMove
const SUPABASE_URL = 'https://fiwskdxntgcredypplub.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpd3NrZHhudGdjcmVkeXBwbHViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMzIxNzAsImV4cCI6MjA2NDYwODE3MH0.W5b8A2zfm0Oeo746SXcANdeRhd2HsAMk5ND9Uc-q7Uo';

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const REFRESH_MS  = 5 * 60 * 1000;
const BETA_START  = '2026-06-11';
const TODAY       = new Date().toISOString().slice(0, 10);
const MONTH_START = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);

// ── CATALOGO METRICHE ────────────────────────────────────────────────

const METRICS = {
  'users.total':       { label: 'Utenti Totali',   color: 'purple', get: d => d.users.total },
  'users.new_7d':      { label: 'Nuovi (7g)',       color: 'green',  get: d => d.users.new_7d },
  'users.new_30d':     { label: 'Nuovi (30g)',      color: 'green',  get: d => d.users.new_30d },
  'users.premium':     { label: 'Premium Paganti',  color: 'amber',  get: d => d.users.premium },
  'users.trial':       { label: 'Free Trial Attivi',color: 'amber',  get: d => d.users.trial },
  'users.conv':        { label: 'Conv. Rate',       color: 'amber',  get: d => d.users.premium_pct + '%' },
  'users.onboarded':   { label: 'Onboardati',       color: 'green',  get: d => d.users.onboarded },
  'sessions.total':    { label: 'Workout Totali',   color: '',       get: d => d.sessions.total },
  'sessions.s7d':      { label: 'Workout (7g)',     color: '',       get: d => d.sessions.sessions_7d },
  'sessions.s30d':     { label: 'Workout (30g)',    color: '',       get: d => d.sessions.sessions_30d },
  'sessions.duration': { label: 'Durata Media',     color: 'green',  get: d => d.sessions.avg_duration_min + ' min' },
  'sessions.compl':    { label: 'Completamento',    color: 'green',  get: d => d.sessions.completion_pct + '%' },
  'eng.dau':           { label: 'DAU',              color: 'amber',  get: d => d.engagement.dau },
  'eng.wau':           { label: 'WAU',              color: 'amber',  get: d => d.engagement.wau },
  'eng.mau':           { label: 'MAU',              color: 'amber',  get: d => d.engagement.mau },
  'eng.streaks':       { label: 'Streak Attive',    color: 'purple', get: d => d.engagement.active_streaks },
};

const FUNNEL_LABELS = [
  'Installazioni (Google Play)',
  'First Open (primo avvio)',
  'Onboarding iniziato',
  'Onboarding completato',
  'Almeno 1 workout',
  'Primo workout entro 24h',
  '≥2 workout prima settimana',
  '≥3 workout prima settimana',
  '≥5 workout prima settimana',
  '3-day streak',
  'Premium pagante',
];

const LS_OV           = 'hm_overview_keys';
const LS_FUN          = 'hm_funnel_cfg_v2';
const LS_FUNNEL_DATES = 'hm_funnel_dates';
const LS_META_TOKEN   = 'hm_meta_token';
const META_AD_ACCOUNT = 'act_1993609947865496';
const META_API = 'https://graph.facebook.com/v20.0';

const SPRINT_COLORS = ['#a78bfa', '#f97316', '#4ade80', '#22d3ee', '#f43f5e', '#fbbf24'];
const SPRINT_DASHES = ['none', '8,4', '3,5', '10,3,3,3', '6,2'];

const DEF_OV_KEYS = [
  'users.total','users.new_7d','eng.dau','eng.wau','eng.mau',
  'sessions.total','sessions.s7d','eng.streaks','users.premium','users.trial',
];

// vsIdx = indice nell'array funnelConfig (non il stepIdx). null = nessuna %
const DEF_FUN_CFG = [
  { stepIdx: 0,  vsIdx: null },  // Installazioni (Google Play)
  { stepIdx: 2,  vsIdx: 0 },    // Onboarding iniziato vs First Open
  { stepIdx: 3,  vsIdx: 1 },    // Onboarding completato vs Onboarding iniziato
  { stepIdx: 4,  vsIdx: 2 },    // Almeno 1 workout vs Onboarding completato
  { stepIdx: 5,  vsIdx: 3 },    // Primo workout 24h vs Almeno 1 workout
  { stepIdx: 6,  vsIdx: 3 },    // ≥2 workout prima settimana vs Almeno 1 workout
  { stepIdx: 7,  vsIdx: 3 },    // ≥3 workout prima settimana vs Almeno 1 workout
  { stepIdx: 9,  vsIdx: 3 },    // 3-day streak vs Almeno 1 workout
  { stepIdx: 10, vsIdx: 2 },    // Premium pagante vs Onboarding completato
];

function loadLS(key, def) {
  try { return JSON.parse(localStorage.getItem(key)) || def; } catch { return def; }
}

async function loadSettings() {
  try {
    const { data, error } = await sb.from('kpi_settings').select('key, value');
    if (error) throw error;
    for (const row of data || []) {
      if (row.key === 'overview_keys' && Array.isArray(row.value))    state.overviewKeys = row.value;
      if (row.key === 'funnel_cfg'   && Array.isArray(row.value))     state.funnelConfig  = row.value;
      if (row.key === 'funnel_dates' && row.value?.from)              { state.funnelFrom = row.value.from; state.funnelTo = row.value.to || TODAY; }
      if (row.key === 'meta_token'   && typeof row.value === 'string') {
        state.metaToken = row.value;
        localStorage.setItem(LS_META_TOKEN, row.value);
      }
    }
  } catch (e) { console.warn('loadSettings fallback to localStorage', e); }
}

function saveSetting(key, value) {
  if (key === 'overview_keys')   localStorage.setItem(LS_OV,           JSON.stringify(value));
  else if (key === 'funnel_cfg')   localStorage.setItem(LS_FUN,          JSON.stringify(value));
  else if (key === 'funnel_dates') localStorage.setItem(LS_FUNNEL_DATES, JSON.stringify(value));
  else if (key === 'meta_token')   localStorage.setItem(LS_META_TOKEN,   value);
  sb.from('kpi_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    .then(({ error }) => { if (error) console.warn('saveSetting', error); });
}

// ── STATE ─────────────────────────────────────────────────────────────

let state = {
  page: 'overview',
  data: null, chart: null, loading: true, lastUpdated: null, error: null,
  funnel: null, funnelFrom: loadLS(LS_FUNNEL_DATES, {}).from || BETA_START, funnelTo: loadLS(LS_FUNNEL_DATES, {}).to || TODAY,
  funnelLoading: false, funnelError: null,
  retention: null, retFrom: MONTH_START, retTo: TODAY, retMin: 1, retChart: 'bar',
  retWeeks: 6, retMinW0: 1,
  retLoading: false, retError: null,
  overviewKeys: loadLS(LS_OV, DEF_OV_KEYS),
  funnelConfig: loadLS(LS_FUN, DEF_FUN_CFG),
  editingOverview: false,
  editingFunnel: false,
  extraCharts: null,
  growthRange: 0, weeklyRange: 16, streakRange: 60,
  sprints: [], sprintsLoading: false,
  sprintFormOpen: false, sprintEditingId: null,
  sprintForm: { nome: '', inizio: BETA_START, fine: TODAY, note: '' },
  sprintFunnelOpen: false, sprintFunnelSel: [], sprintFunnelData: {}, sprintFunnelLoading: false, sprintFunnelError: null,
  sprintRetOpen: false, sprintRetSel: [], sprintRetData: {}, sprintRetLoading: false, sprintRetError: null,
  sprintRetCustom: false, sprintRetMin: 1, sprintRetWeeks: 6, sprintRetMinW0: 1,
  deleteConfirm: null, // { id, nome } when modal is open
  premiumData: null, premiumLoading: false, premiumError: null,
  premiumFrom: BETA_START, premiumTo: TODAY,
  premiumFunnelSteps: new Set(['trial_shown_total','trial_shown','paywall_views','purchase_attempts','premium_activated']),
  behaviorData: null, behaviorLoading: false,
  behaviorFrom: BETA_START, behaviorTo: TODAY, behaviorTypeFilter: 'all',
  userActivityOpen: false, userActivityUser: null, userActivityData: null, userActivityLoading: false,
  recentFeedback: null,
  feedbackModalOpen: false,
  allFeedbacks: null,
  allFeedbacksLoading: false,
  selectedFeedback: null,
  feedbackSearchQuery: '',
  recentAISessions: null,
  aiConvOpen: false,
  aiSessions: null,
  aiSessionsLoading: false,
  aiSelectedSession: null,
  aiSessionMessages: null,
  aiSessionMessagesLoading: false,
  aiSearchQuery: '',
  aiStatsOpen: false,
  aiStatsData: null,
  aiStatsLoading: false,
  aiStatsUsers: null,
  aiStatsUsersLoading: false,
  aiStatsUsersOpen: false,
  aiStatsFrom: new Date(Date.now()-30*864e5).toISOString().slice(0,10),
  aiStatsTo: TODAY,
  metaToken: localStorage.getItem(LS_META_TOKEN) || '',
  metaAds: null,
  metaAdsLoading: false,
  metaAdsError: null,
  metaDatePreset: 'last_30d',
  metaCustomFrom: '',
  metaCustomTo: '',
  metaUseCustom: false,
  metaCampaigns: null,
  metaSprintSel: [],
  metaSprintData: {},
  metaSprintLoading: false,
  metaFunnelData: null,
  metaFunnelLoading: false,
  metaFunnelError: null,
  metaFunnelPeriod: null,
  blockedUsers: [],
  recentlyUnblocked: [],
  blockSearchOpen: false,
  blockSearchQuery: '',
  blockSearchResults: [],
};

let refreshTimer = null, countdownTimer = null, secondsLeft = 300;

// ── DATA ──────────────────────────────────────────────────────────────

async function fetchData() {
  state.loading = true;
  state.error = null;
  updateHeaderActions();
  try {
    const [ov, ch, ec] = await Promise.all([
      sb.rpc('kpi_overview'),
      sb.rpc('kpi_chart_daily', { days_back: 14 }),
      sb.rpc('kpi_extra_charts'),
    ]);
    if (ov.error) throw ov.error;
    if (ch.error) throw ch.error;
    state.data  = ov.data;
    state.chart = ch.data || [];
    if (!ec.error) state.extraCharts = ec.data;
    state.lastUpdated = new Date();
    await Promise.all([fetchRecentFeedback(), fetchRecentAISessions()]);
  } catch (e) { state.error = e.message || 'Errore sconosciuto'; }
  state.loading = false;
  render();
  startCountdown();
}

async function fetchRetention() {
  state.retLoading = true;
  state.retError = null;
  render();
  try {
    const res = await sb.rpc('kpi_retention', {
      inizio:       state.retFrom,
      fine:         state.retTo,
      min_workouts: state.retMin,
      max_weeks:    state.retWeeks,
      min_w0:       state.retMinW0,
    });
    if (res.error) throw res.error;
    state.retention = res.data;
  } catch (e) { state.retError = e.message || 'Errore sconosciuto'; }
  state.retLoading = false;
  render();
}

async function fetchFunnel() {
  state.funnelLoading = true;
  state.funnelError = null;
  render();
  try {
    const res = await sb.rpc('kpi_funnel', { inizio: state.funnelFrom, fine: state.funnelTo });
    if (res.error) throw res.error;
    state.funnel = res.data;
  } catch (e) { state.funnelError = e.message || 'Errore sconosciuto'; }
  state.funnelLoading = false;
  render();
  if (state.metaToken && state.funnel) fetchMetaFunnel();
}

async function fetchPremium() {
  state.premiumLoading = true; state.premiumError = null;
  render();
  try {
    const { data, error } = await sb.rpc('kpi_premium', {
      inizio: state.premiumFrom,
      fine:   state.premiumTo,
    });
    if (error) throw error;
    state.premiumData = data;
  } catch (e) { state.premiumError = e.message || 'Errore caricamento dati premium'; }
  state.premiumLoading = false;
  render();
}

async function fetchSprints() {
  state.sprintsLoading = true;
  try {
    const res = await sb.from('sprints').select('*').order('inizio', { ascending: false });
    if (res.error) throw res.error;
    state.sprints = res.data || [];
  } catch (e) { console.error('fetchSprints', e); }
  state.sprintsLoading = false;
  render();
}

async function fetchBlockedUsers() {
  try {
    const { data, error } = await sb.from('blocked_users')
      .select('id, user_id, username, email, nome, motivo')
      .is('removed_at', null)
      .order('created_at');
    if (error) throw error;
    state.blockedUsers = data || [];
  } catch (e) { console.error('fetchBlockedUsers', e); }
}

async function fetchRecentlyUnblocked() {
  try {
    const { data, error } = await sb.from('blocked_users')
      .select('id, user_id, username, email, nome, motivo')
      .not('removed_at', 'is', null)
      .order('removed_at', { ascending: false })
      .limit(10);
    if (error) throw error;
    state.recentlyUnblocked = data || [];
  } catch (e) { console.error('fetchRecentlyUnblocked', e); }
}

let _blockSearchTimer = null;
function renderBlockedSearchResults() {
  const container = document.getElementById('blocked-search-results');
  if (!container) return;
  const results = state.blockSearchResults;
  const query   = state.blockSearchQuery;
  if (results.length) {
    container.innerHTML = `
      <div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;overflow:hidden;margin-top:8px">
        ${results.map((u, i) => `
          <div class="blocked-add-result" data-idx="${i}"
            style="padding:10px 14px;cursor:pointer;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:12px">
            <div style="min-width:0">
              <div style="font-size:12px;font-weight:600;color:var(--text)">${esc(u.name || u.username || '—')} <span style="color:var(--muted);font-weight:400">@${esc(u.username || '')}</span></div>
              <div style="font-size:11px;color:var(--muted);font-family:var(--mono);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(u.email || '')}</div>
            </div>
            <button class="btn btn-ghost" style="font-size:11px;padding:3px 10px;flex-shrink:0">+ Blocca</button>
          </div>`).join('')}
      </div>`;
    container.querySelectorAll('.blocked-add-result').forEach(el =>
      el.addEventListener('click', () => {
        const u = state.blockSearchResults[+el.dataset.idx];
        if (u) addBlockedUser(u);
      }));
  } else {
    container.innerHTML = query.length >= 2
      ? `<div style="font-size:12px;color:var(--muted);padding:6px 0">Nessun utente trovato.</div>`
      : '';
  }
}

async function searchUsersForBlock(query) {
  state.blockSearchQuery = query;
  clearTimeout(_blockSearchTimer);
  if (!query || query.length < 2) {
    state.blockSearchResults = [];
    renderBlockedSearchResults();
    return;
  }
  _blockSearchTimer = setTimeout(async () => {
    try {
      const { data, error } = await sb.rpc('kpi_search_users', { p_query: query });
      if (error) throw error;
      state.blockSearchResults = data || [];
    } catch (e) { console.error('searchUsersForBlock', e); state.blockSearchResults = []; }
    renderBlockedSearchResults();
  }, 300);
}

async function addBlockedUser(user) {
  try {
    const { error } = await sb.from('blocked_users').upsert({
      user_id:    user.id,
      username:   user.username || null,
      email:      user.email    || null,
      nome:       user.name || user.username || '',
      motivo:     'account interno',
      removed_at: null,
    }, { onConflict: 'user_id' });
    if (error) throw error;
    state.blockSearchOpen    = false;
    state.blockSearchQuery   = '';
    state.blockSearchResults = [];
    await Promise.all([fetchBlockedUsers(), fetchRecentlyUnblocked()]);
    render();
  } catch (e) { console.error('addBlockedUser', e); alert('Errore aggiunta: ' + e.message); }
}

async function removeBlockedUser(id) {
  try {
    const { error } = await sb.from('blocked_users').update({ removed_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
    await Promise.all([fetchBlockedUsers(), fetchRecentlyUnblocked()]);
    render();
  } catch (e) { console.error('removeBlockedUser', e); }
}

async function fetchRecentFeedback() {
  try {
    const { data, error } = await sb.rpc('kpi_recent_feedback', { lim: 5 });
    if (error) throw error;
    state.recentFeedback = data || [];
  } catch (e) { console.error('fetchRecentFeedback', e); }
}

async function fetchBehavior() {
  state.behaviorLoading = true;
  render();
  try {
    const { data, error } = await sb.rpc('kpi_events_summary', {
      p_from: state.behaviorFrom || null,
      p_to:   state.behaviorTo   || null,
    });
    if (error) throw error;
    state.behaviorData = data || [];
  } catch (e) { console.error('fetchBehavior', e); }
  state.behaviorLoading = false;
  render();
}

function metaDateParams() {
  if (state.metaUseCustom && state.metaCustomFrom && state.metaCustomTo) {
    return 'time_range=' + encodeURIComponent(JSON.stringify({ since: state.metaCustomFrom, until: state.metaCustomTo }));
  }
  return 'date_preset=' + state.metaDatePreset;
}

async function fetchMetaInsights(dateParam, token) {
  const fields = 'spend,impressions,reach,clicks,ctr,cpm,cpc,frequency,actions,cost_per_action_type';
  const res = await fetch(META_API + '/' + META_AD_ACCOUNT + '/insights?fields=' + fields + '&' + dateParam + '&access_token=' + token).then(r => r.json());
  if (res.error) throw new Error(res.error.message);
  return res.data?.[0] || null;
}

async function fetchMetaAds() {
  if (!state.metaToken) { render(); return; }
  state.metaAdsLoading = true;
  state.metaAdsError = null;
  render();
  try {
    const dp = metaDateParams();
    const useCustom = state.metaUseCustom && state.metaCustomFrom && state.metaCustomTo;
    const campDp = useCustom
      ? 'time_range({"since":"' + state.metaCustomFrom + '","until":"' + state.metaCustomTo + '"})'
      : 'date_preset(' + state.metaDatePreset + ')';
    const fields = 'spend,impressions,reach,clicks,ctr,cpm,cpc,frequency,actions,cost_per_action_type';
    const [insRes, campRes] = await Promise.all([
      fetch(META_API + '/' + META_AD_ACCOUNT + '/insights?fields=' + fields + '&' + dp + '&access_token=' + state.metaToken).then(r => r.json()),
      fetch(META_API + '/' + META_AD_ACCOUNT + '/campaigns?fields=name,status,insights.' + campDp + '{spend,impressions,clicks,ctr,reach,cpc,actions,cost_per_action_type}&access_token=' + state.metaToken).then(r => r.json()),
    ]);
    if (insRes.error) throw new Error(insRes.error.message);
    state.metaAds = insRes.data?.[0] || null;
    state.metaCampaigns = campRes.error ? [] : (campRes.data || []);
  } catch (e) { state.metaAdsError = e.message || 'Errore API Meta'; }
  state.metaAdsLoading = false;
  render();
}

async function fetchMetaFunnel() {
  if (!state.metaToken) return;
  state.metaFunnelLoading = true;
  state.metaFunnelError = null;
  state.metaFunnelPeriod = state.funnelFrom + ' → ' + state.funnelTo;
  render();
  try {
    const dp = 'time_range=' + encodeURIComponent(JSON.stringify({ since: state.funnelFrom, until: state.funnelTo }));
    state.metaFunnelData = await fetchMetaInsights(dp, state.metaToken);
  } catch (e) { state.metaFunnelError = e.message || 'Errore API Meta'; }
  state.metaFunnelLoading = false;
  render();
}

async function fetchMetaSprintData() {
  if (!state.metaToken || state.metaSprintSel.length === 0) { render(); return; }
  state.metaSprintLoading = true;
  render();
  try {
    await Promise.all(state.metaSprintSel.map(async id => {
      const sprint = state.sprints.find(s => String(s.id) === String(id));
      if (!sprint) return;
      const dp = 'time_range=' + encodeURIComponent(JSON.stringify({ since: sprint.inizio, until: sprint.fine }));
      const data = await fetchMetaInsights(dp, state.metaToken);
      state.metaSprintData[id] = data;
    }));
  } catch (e) { console.error('fetchMetaSprintData', e); }
  state.metaSprintLoading = false;
  render();
}

async function fetchUserActivity(user) {
  state.userActivityOpen    = true;
  state.userActivityUser    = user;
  state.userActivityData    = null;
  state.userActivityLoading = true;
  render();
  try {
    const { data, error } = await sb.rpc('kpi_user_activity', { p_user_id: user.user_id, lim: 150 });
    if (error) throw error;
    state.userActivityData = data || [];
  } catch (e) { console.error('fetchUserActivity', e); }
  state.userActivityLoading = false;
  render();
}

async function fetchAllFeedbacks() {
  state.allFeedbacksLoading = true;
  render();
  try {
    const { data, error } = await sb.rpc('kpi_all_feedback');
    if (error) throw error;
    state.allFeedbacks = data || [];
    if (!state.selectedFeedback && state.allFeedbacks.length)
      state.selectedFeedback = state.allFeedbacks[0];
  } catch (e) { console.error('fetchAllFeedbacks', e); }
  state.allFeedbacksLoading = false;
  render();
}

async function fetchRecentAISessions() {
  try {
    const { data, error } = await sb.rpc('kpi_ai_sessions', { lim: 5 });
    if (error) throw error;
    state.recentAISessions = data || [];
  } catch (e) { console.error('fetchRecentAISessions', e); }
}

async function fetchAISessionsFull() {
  state.aiSessionsLoading = true;
  render();
  try {
    const { data, error } = await sb.rpc('kpi_ai_sessions', { lim: 50 });
    if (error) throw error;
    state.aiSessions = data || [];
    if (!state.aiSelectedSession && state.aiSessions.length) {
      state.aiSelectedSession = state.aiSessions[0];
      fetchAISessionMessages(state.aiSelectedSession);
      return;
    }
  } catch (e) { console.error('fetchAISessionsFull', e); }
  state.aiSessionsLoading = false;
  render();
}

async function fetchAIStats() {
  state.aiStatsLoading = true;
  render();
  try {
    const from = state.aiStatsFrom ? new Date(state.aiStatsFrom).toISOString() : null;
    const to   = state.aiStatsTo   ? new Date(state.aiStatsTo).toISOString()   : null;
    const { data, error } = await sb.rpc('kpi_ai_stats', { p_from: from, p_to: to });
    if (error) throw error;
    state.aiStatsData = Array.isArray(data) ? (data[0]?.kpi_ai_stats ?? data[0]) : data;
  } catch (e) { console.error('fetchAIStats', e); }
  state.aiStatsLoading = false;
  render();
}

async function fetchAIStatsUsers() {
  state.aiStatsUsersLoading = true;
  render();
  try {
    const from = state.aiStatsFrom ? new Date(state.aiStatsFrom).toISOString() : null;
    const to   = state.aiStatsTo   ? new Date(state.aiStatsTo).toISOString()   : null;
    const { data, error } = await sb.rpc('kpi_ai_users', { p_from: from, p_to: to });
    if (error) throw error;
    state.aiStatsUsers = data || [];
  } catch (e) { console.error('fetchAIStatsUsers', e); state.aiStatsUsers = []; }
  state.aiStatsUsersLoading = false;
  render();
}

async function fetchAISessionMessages(session) {
  state.aiSelectedSession    = session;
  state.aiSessionMessages    = null;
  state.aiSessionMessagesLoading = true;
  render();
  try {
    const { data, error } = await sb.rpc('kpi_ai_session_detail', {
      p_user_id: session.user_id,
      p_from:    session.session_start,
      p_to:      session.session_end,
    });
    if (error) throw error;
    state.aiSessionMessages = data || [];
  } catch (e) { console.error('fetchAISessionMessages', e); }
  state.aiSessionMessagesLoading = false;
  state.aiSessionsLoading        = false;
  render();
}

async function fetchSprintFunnel() {
  if (!state.sprintFunnelSel.length) return;
  state.sprintFunnelLoading = true;
  state.sprintFunnelError   = null;
  state.sprintFunnelData    = {};
  render();
  try {
    const selected = state.sprints.filter(s => state.sprintFunnelSel.includes(s.id));
    const results  = await Promise.all(selected.map(s =>
      sb.rpc('kpi_funnel', { inizio: s.inizio, fine: s.fine })
        .then(r => ({ id: s.id, data: r.data, error: r.error }))
    ));
    const map = {};
    for (const r of results) {
      if (r.error) throw r.error;
      map[r.id] = r.data;
    }
    state.sprintFunnelData = map;
  } catch (e) { state.sprintFunnelError = e.message || 'Errore'; }
  state.sprintFunnelLoading = false;
  render();
  if (state.metaToken && Object.keys(state.sprintFunnelData).length) {
    state.metaSprintSel = state.sprintFunnelSel.map(String);
    fetchMetaSprintData();
  }
}

async function fetchSprintRetention() {
  if (!state.sprintRetSel.length) return;
  state.sprintRetLoading = true;
  state.sprintRetError   = null;
  state.sprintRetData    = {};
  render();
  try {
    const selected = state.sprints.filter(s => state.sprintRetSel.includes(s.id));
    const min      = state.sprintRetCustom ? state.sprintRetMin   : state.retMin;
    const weeks    = state.sprintRetCustom ? state.sprintRetWeeks : state.retWeeks;
    const minW0    = state.sprintRetCustom ? state.sprintRetMinW0 : state.retMinW0;
    const results  = await Promise.all(selected.map(s =>
      sb.rpc('kpi_retention', { inizio: s.inizio, fine: s.fine, min_workouts: min, max_weeks: weeks, min_w0: minW0 })
        .then(r => ({ id: s.id, data: r.data, error: r.error }))
    ));
    const map = {};
    for (const r of results) {
      if (r.error) throw r.error;
      map[r.id] = r.data;
    }
    state.sprintRetData = map;
  } catch (e) { state.sprintRetError = e.message || 'Errore'; }
  state.sprintRetLoading = false;
  render();
}

function startAutoRefresh() {
  clearInterval(refreshTimer);
  refreshTimer = setInterval(fetchData, REFRESH_MS);
}

function startCountdown() {
  clearInterval(countdownTimer);
  secondsLeft = 300;
  countdownTimer = setInterval(() => {
    secondsLeft = Math.max(0, secondsLeft - 1);
    const el = document.getElementById('kpi-countdown');
    if (el) el.textContent = `Aggiornamento tra ${fmt(secondsLeft)}`;
  }, 1000);
}

function fmt(s) { return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }

// ── LAYOUT ────────────────────────────────────────────────────────────

function render() {
  document.getElementById('app').innerHTML = layout();
  attachEvents();
}

function updateHeaderActions() {
  const el = document.getElementById('kpi-header-actions');
  if (el) el.innerHTML = headerActions();
  document.getElementById('refresh-btn')?.addEventListener('click', manualRefresh);
}

function manualRefresh() {
  clearInterval(countdownTimer);
  fetchData();
  if (state.page === 'funnel') fetchFunnel();
}

function layout() {
  return `
    ${sidebar()}
    <div class="main">
      <div class="page-header" style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap">
        <div>
          <div class="page-title">KPI Dashboard</div>
          <div class="page-sub">Metriche prodotto HypeMove · live da Supabase</div>
        </div>
        <div id="kpi-header-actions" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
          ${headerActions()}
        </div>
      </div>
      ${state.error ? pageError() : !state.data ? pageSkeleton() : page()}
    </div>
    ${deleteConfirmModal()}
    ${feedbackModal()}
    ${aiConversationsModal()}
    ${userActivityModal()}`;
}

function deleteConfirmModal() {
  if (!state.deleteConfirm) return '';
  const { nome } = state.deleteConfirm;
  return `
    <div id="delete-overlay" style="
      position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);
      display:flex;align-items:center;justify-content:center;z-index:1000">
      <div style="
        background:#13131f;border:1px solid #2a2a3d;border-radius:16px;
        padding:32px;width:360px;box-shadow:0 24px 64px rgba(0,0,0,0.6)">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
          <div style="width:36px;height:36px;border-radius:50%;background:rgba(239,68,68,0.15);
            display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">⚠</div>
          <div style="font-size:16px;font-weight:700;color:var(--fg)">Elimina sprint</div>
        </div>
        <div style="color:var(--muted);font-size:13px;margin-bottom:20px;margin-left:48px">
          Stai per eliminare <strong style="color:var(--fg)">${nome}</strong>.
          Questa azione è irreversibile.
        </div>
        <div style="background:#0d0d19;border:1px solid #2a2a3d;border-radius:10px;padding:16px;margin-bottom:20px">
          <div style="font-size:11px;color:var(--muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:.06em">
            Scrivi <span style="color:#ef4444;font-weight:700">DELETE</span> per confermare
          </div>
          <input id="delete-confirm-input" type="text" autocomplete="off" spellcheck="false"
            placeholder="DELETE"
            style="width:100%;background:none;border:none;outline:none;color:#ef4444;
              font-size:16px;font-weight:700;font-family:monospace;letter-spacing:.08em;
              caret-color:#ef4444"/>
        </div>
        <div style="display:flex;gap:8px">
          <button id="delete-cancel-btn" class="btn btn-ghost" style="flex:1">Annulla</button>
          <button id="delete-confirm-btn" class="btn" style="
            flex:1;background:#ef4444;color:#fff;border:none;opacity:0.4;cursor:not-allowed;
            transition:opacity .15s">Elimina</button>
        </div>
      </div>
    </div>`;
}

function headerActions() {
  const t = state.lastUpdated
    ? state.lastUpdated.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
    : '—';
  return `
    <span id="kpi-countdown" style="font-size:11px;color:var(--muted)">
      ${state.loading ? 'Caricamento...' : state.lastUpdated ? `Aggiornamento tra ${fmt(secondsLeft)}` : ''}
    </span>
    <span style="font-size:11px;color:var(--muted)">Ultimo: ${t}</span>
    <button id="refresh-btn" class="btn btn-ghost" style="padding:6px 14px;font-size:12px;display:flex;align-items:center;gap:6px" ${state.loading ? 'disabled' : ''}>
      <span class="${state.loading ? 'spin' : ''}">↻</span> Aggiorna
    </button>`;
}

function sidebar() {
  const nav = (id, icon, label) => `
    <button class="nav-item ${state.page === id ? 'active' : ''}" data-nav="${id}">
      <span class="icon">${icon}</span>${label}
    </button>`;
  return `
    <div class="sidebar">
      <a href="index.html" class="sidebar-logo">
        <div class="logo-mark">Hype<span>move</span></div>
        <div class="logo-sub">KPI</div>
      </a>
      <nav class="nav">
        <div class="nav-section">KPI</div>
        ${nav('overview',  '📊', 'Overview')}
        ${nav('funnel',    '🎯', 'Funnel')}
        ${nav('retention', '🔄', 'Retention')}
        ${nav('sprint',    '🏃', 'Sprint')}
        ${nav('premium',    '💎', 'Premium')}
        ${nav('behavior',   '🖱️', 'Comportamento')}
        <div class="nav-section" style="margin-top:8px">Marketing</div>
        ${nav('meta-ads',   '📣', 'Meta ADS')}
      </nav>
      <div style="padding:14px 20px;border-top:1px solid var(--border);font-size:11px;color:var(--muted)">
        Mattia & Danilo · 50/50
      </div>
    </div>`;
}

function pageError() {
  return `<div class="empty" style="padding:80px 20px">
    <div class="empty-icon">⚠️</div>
    <div class="empty-text" style="font-size:16px;font-weight:600;margin-bottom:8px">Errore nel caricamento</div>
    <div style="font-size:12px;color:var(--red);margin-top:6px">${state.error}</div>
  </div>`;
}

function pageSkeleton() {
  return `<div class="empty" style="padding:80px 20px">
    <div class="empty-icon pulse">📊</div>
    <div class="empty-text" style="color:var(--muted)">Caricamento dati da Supabase...</div>
  </div>`;
}

function page() {
  switch (state.page) {
    case 'overview':   return pageOverview();
    case 'funnel':     return pageFunnel();
    case 'retention':  return pageRetention();
    case 'metriche':   return pageMetriche();
    case 'sprint':      return pageSprint();
    case 'premium':     return pagePremium();
    case 'behavior':    return pageBehavior();
    case 'meta-ads':    return pageMetaAds();
    default:            return pageOverview();
  }
}

// ── OVERVIEW — customizable ───────────────────────────────────────────

function pageOverview() {
  const keys = state.overviewKeys.filter(k => METRICS[k]);
  const colCount = Math.min(Math.max(keys.length, 1), 5);

  const editPanel = state.editingOverview ? `
    <div class="card" style="margin-bottom:20px;border-color:var(--accent)">
      <div class="card-title" style="margin-bottom:14px">Scegli le metriche da mostrare</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:18px">
        ${Object.entries(METRICS).map(([k, m]) => {
          const on = keys.includes(k);
          return `<button class="tag" data-toggle-metric="${k}"
            style="cursor:pointer;${on ? 'background:var(--accent-lo);border-color:var(--accent);color:var(--purple)' : ''}">
            ${on ? '✓ ' : ''}${m.label}
          </button>`;
        }).join('')}
      </div>
      <button id="done-overview" class="btn btn-primary" style="font-size:12px;padding:6px 14px">Fatto</button>
    </div>` : '';

  return `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <div style="font-size:11px;color:var(--muted)">${keys.length} metriche</div>
      <button id="edit-overview" class="btn btn-ghost" style="font-size:12px;padding:5px 12px">
        ${state.editingOverview ? '← Chiudi' : '⚙ Personalizza'}
      </button>
    </div>

    ${editPanel}

    <div style="display:grid;grid-template-columns:repeat(${colCount},1fr);gap:14px;margin-bottom:24px">
      ${keys.map(k => {
        const m = METRICS[k];
        return stat(m.label, m.get(state.data), '', m.color);
      }).join('')}
    </div>

    <div class="card" style="margin-bottom:16px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
        <div class="card-title" style="margin-bottom:0">Crescita utenti totali</div>
        <div style="display:flex;gap:4px">
          ${[30,60,90,0].map(r => `<button class="filter-btn ${state.growthRange===r?'active':''}" data-growth-range="${r}">${r||'Tutto'}</button>`).join('')}
        </div>
      </div>
      <div style="font-size:11px;color:var(--muted);margin-bottom:14px">cumulativo · esclusi account interni</div>
      ${state.extraCharts?.growth?.length ? growthChart(state.extraCharts.growth, state.growthRange) : chartPlaceholder()}
    </div>

    <div class="grid-2">
      <div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
          <div class="card-title" style="margin-bottom:0">Workout settimanali</div>
          <div style="display:flex;gap:4px">
            ${[4,8,12,16].map(w => `<button class="filter-btn ${state.weeklyRange===w?'active':''}" data-weekly-range="${w}">${w}sett</button>`).join('')}
          </div>
        </div>
        <div style="font-size:11px;color:var(--muted);margin-bottom:14px">workout totali per settimana</div>
        ${state.extraCharts?.weekly_workouts?.length ? weeklyWorkoutsChart(state.extraCharts.weekly_workouts, state.weeklyRange) : chartPlaceholder()}
      </div>
      <div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
          <div class="card-title" style="margin-bottom:0">Streak giornaliere</div>
          <div style="display:flex;gap:4px">
            ${[7,14,30,60].map(r => `<button class="filter-btn ${state.streakRange===r?'active':''}" data-streak-range="${r}">${r}g</button>`).join('')}
          </div>
        </div>
        <div style="font-size:11px;color:var(--muted);margin-bottom:14px">utenti con streak attiva (stessa logica overview)</div>
        ${state.extraCharts?.daily_streaks?.length ? dailyStreaksChart(state.extraCharts.daily_streaks, state.streakRange) : chartPlaceholder()}
      </div>
    </div>

    <div class="grid-2" style="margin-top:16px">
      ${feedbackCard()}
      ${aiChatsCard()}
    </div>`;
}

const GOAL_LABEL = {
  lose_fat: 'Perdere grasso', tone_lower: 'Tonificare gambe/glutei',
  tone_upper: 'Tonificare parte superiore', build_muscle: 'Costruire muscoli',
  mobility: 'Migliorare mobilità', endurance: 'Resistenza',
  general_fitness: 'Fitness generale', posture: 'Postura',
};
const GENDER_LABEL = { m: 'Uomo', f: 'Donna', male: 'Uomo', female: 'Donna', other: 'Altro' };

function calcAge(birthDate) {
  if (!birthDate) return null;
  const bd = new Date(birthDate), now = new Date();
  let age = now.getFullYear() - bd.getFullYear();
  if (now.getMonth() < bd.getMonth() || (now.getMonth() === bd.getMonth() && now.getDate() < bd.getDate())) age--;
  return age;
}

// ── COMPORTAMENTO ─────────────────────────────────────────────────────

const EVENT_LABELS = {
  exercise_complete: 'Esercizio completato', workout_complete: 'Workout completato',
  workout_start: 'Workout avviato', workout_abandon: 'Workout abbandonato',
  app_open: 'App aperta', exit: 'App chiusa', sign_in: 'Login',
  settings_open: 'Impostazioni aperte', roadmap_node_select: 'Nodo roadmap selezionato',
  roadmap_select: 'Roadmap selezionata', league_tab_switch: 'Tab lega cambiato',
  workout_gen_start: 'Generazione workout AI avviata', chest_open: 'Baule aperto',
  view_Home: 'Home', view_WorkoutDetail: 'Dettaglio workout',
  view_WorkoutComplete: 'Riepilogo workout', view_User: 'Profilo',
  view_League: 'Classifica', view_ExerciseSearch: 'Ricerca esercizi',
  view_Dev: 'Schermata Dev', view_PremiumActivated: 'Premium attivato',
  view_RoadmapDetail: 'Dettaglio roadmap', view_Settings: 'Impostazioni',
  paywall_product_updated: 'Paywall — prodotto aggiornato',
  paywall_validator_step: 'Paywall — step validazione',
  paywall_billing_error: 'Paywall — errore fatturazione',
  paywall_plugin_event: 'Paywall — evento plugin',
  paywall_fallback_opened: 'Paywall — fallback aperto',
  paywall_purchase_attempt: 'Tentativo acquisto', trial_offer_shown: 'Offerta trial mostrata',
};

const TYPE_COLOR  = { action: '#4ade80', navigation: '#60a5fa', click: '#fbbf24', error: '#f87171' };
const TYPE_LABEL  = { action: 'Azione', navigation: 'Nav', click: 'Click', error: 'Errore' };

// SDK/system events che non riflettono azioni utente reali
const SYSTEM_EVENTS = new Set([
  'paywall_product_updated',
  'paywall_validator_step',
  'paywall_validator_called',
  'paywall_plugin_event',
]);

function pageBehavior() {
  const QUICK = [
    { label: '7g',    from: new Date(Date.now()-7*864e5).toISOString().slice(0,10),  to: TODAY },
    { label: '30g',   from: new Date(Date.now()-30*864e5).toISOString().slice(0,10), to: TODAY },
    { label: 'Beta',  from: BETA_START, to: TODAY },
    { label: 'Tutto', from: '', to: '' },
  ];

  const allRows = state.behaviorData || [];
  const totalEvents  = allRows.reduce((s, r) => s + (+r.total || 0), 0);
  const totalUsers   = allRows.length ? Math.max(...allRows.map(r => +r.unique_users || 0)) : 0;

  const raw    = allRows.filter(r => !SYSTEM_EVENTS.has(r.event_name));
  const tf     = state.behaviorTypeFilter;
  const data   = tf === 'all' ? raw : raw.filter(r => r.event_type === tf);

  const topEvents  = data.filter(r => r.event_type !== 'navigation');
  const topScreens = raw.filter(r => r.event_type === 'navigation');
  const maxE = Math.max(...topEvents.map(r => +r.total),  1);
  const maxS = Math.max(...topScreens.map(r => +r.total), 1);

  const eventRow = (r, max) => {
    const pct   = Math.round((+r.total / max) * 100);
    const color = TYPE_COLOR[r.event_type] || '#a78bfa';
    const label = EVENT_LABELS[r.event_name] || r.event_name;
    return `<div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid #1a1a2e">
      <div style="flex:1;min-width:0">
        <div style="font-size:12px;color:var(--fg);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(label)}</div>
        <div style="display:flex;align-items:center;gap:6px;margin-top:4px">
          <div style="flex:1;background:#1e1e30;height:3px;border-radius:2px">
            <div style="width:${pct}%;background:${color};height:100%;border-radius:2px;transition:width .3s"></div>
          </div>
        </div>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <div style="font-size:12px;font-weight:600;color:var(--fg)">${(+r.total).toLocaleString('it-IT')}</div>
        <div style="font-size:10px;color:var(--muted)">${r.unique_users} utenti</div>
      </div>
      <span style="font-size:9px;background:${color}22;color:${color};padding:2px 6px;border-radius:4px;flex-shrink:0;min-width:42px;text-align:center">${TYPE_LABEL[r.event_type] || r.event_type}</span>
    </div>`;
  };

  const body = state.behaviorLoading
    ? `<div class="empty" style="padding:60px"><div class="empty-icon pulse">🖱️</div><div class="empty-text" style="color:var(--muted)">Caricamento…</div></div>`
    : !raw.length
    ? `<div class="empty" style="padding:60px"><div class="empty-icon">🖱️</div><div class="empty-text" style="color:var(--muted)">Nessun dato nel periodo selezionato.</div></div>`
    : `<div class="grid-2" style="gap:16px;align-items:start">
        <div class="card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
            <div class="card-title" style="margin-bottom:0">Top azioni</div>
            <div style="display:flex;gap:4px">
              ${['all','action','click'].map(t => {
                const lbl = { all:'Tutti', action:'Azioni', click:'Click' }[t];
                return `<button class="filter-btn beh-type-btn ${tf===t?'active':''}" data-beh-type="${t}" style="font-size:10px;padding:3px 8px">${lbl}</button>`;
              }).join('')}
            </div>
          </div>
          <div>${topEvents.length ? topEvents.map(r => eventRow(r, maxE)).join('') : '<div style="color:var(--muted);font-size:12px;padding:12px 0">Nessun evento per questo filtro</div>'}</div>
        </div>
        <div class="card">
          <div class="card-title" style="margin-bottom:14px">Schermate più visitate</div>
          <div>${topScreens.length ? topScreens.map(r => eventRow(r, maxS)).join('') : '<div style="color:var(--muted);font-size:12px;padding:12px 0">Nessuna schermata</div>'}</div>
        </div>
      </div>`;

  const totalBanner = state.behaviorLoading ? '' : `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;padding:10px 16px;background:#12121e;border:1px solid var(--border);border-radius:10px;width:fit-content">
      <span style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.7px">Totale eventi nel periodo</span>
      <span style="font-size:18px;font-weight:700;color:var(--fg);font-family:var(--mono)">${totalEvents.toLocaleString('it-IT')}</span>
    </div>`;

  return `
    <div class="filter-bar" style="margin-bottom:20px;flex-wrap:wrap;gap:6px">
      <span class="filter-label">Periodo rapido</span>
      ${QUICK.map(q => {
        const active = state.behaviorFrom === q.from && state.behaviorTo === q.to;
        return `<button class="filter-btn beh-quick ${active?'active':''}" data-beh-from="${q.from}" data-beh-to="${q.to}">${q.label}</button>`;
      }).join('')}
      <div class="filter-sep"></div>
      <span class="filter-label">Da</span>
      <input type="date" id="beh-from" class="form-input" value="${state.behaviorFrom}"
        style="width:145px;padding:5px 10px;font-size:12px">
      <span style="color:var(--muted)">→</span>
      <input type="date" id="beh-to" class="form-input" value="${state.behaviorTo}"
        style="width:145px;padding:5px 10px;font-size:12px">
      <button id="beh-apply" class="btn btn-primary" style="padding:6px 16px;font-size:12px">Applica</button>
    </div>
    ${totalBanner}
    ${body}`;
}

function feedbackCard() {
  const rows = state.recentFeedback;
  const body = !rows
    ? `<div style="color:var(--muted);font-size:12px;padding:12px 0" class="pulse">Caricamento…</div>`
    : !rows.length
    ? `<div style="color:var(--muted);font-size:12px;padding:12px 0">Nessun feedback</div>`
    : rows.map(r => {
        const date = new Date(r.created_at).toLocaleDateString('it-IT', { day:'2-digit', month:'short', year:'numeric' });
        const user = esc(r.username || r.email || '—');
        const txt  = esc((r.feedback_text || '—').slice(0, 110) + ((r.feedback_text || '').length > 110 ? '…' : ''));
        return `<div class="fb-mini-row" data-fb-id="${esc(r.id)}"
          style="padding:10px 0;border-bottom:1px solid #1e1e30;cursor:pointer;transition:background .15s"
          onmouseenter="this.style.background='#12121e'" onmouseleave="this.style.background=''">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
            <span style="font-size:11px;font-weight:600;color:var(--purple)">${user}</span>
            <span style="font-size:10px;color:var(--muted)">${date}</span>
          </div>
          <div style="font-size:12px;color:var(--fg);line-height:1.5">${txt}</div>
        </div>`;
      }).join('');
  return `<div class="card">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <div class="card-title" style="margin-bottom:0">Ultimi feedback utenti</div>
      <button id="open-feedback-modal" class="btn btn-ghost" style="font-size:11px;padding:4px 10px">Tutti i feedback →</button>
    </div>
    ${body}
  </div>`;
}

function feedbackModal() {
  if (!state.feedbackModalOpen) return '';

  const feedbacks = state.allFeedbacks || [];
  const q = (state.feedbackSearchQuery || '').toLowerCase();
  const filtered = q
    ? feedbacks.filter(f =>
        (f.username || f.email || '').toLowerCase().includes(q) ||
        (f.feedback_text || '').toLowerCase().includes(q))
    : feedbacks;

  const listHtml = state.allFeedbacksLoading
    ? `<div style="padding:20px;color:var(--muted);font-size:12px" class="pulse">Caricamento…</div>`
    : !filtered.length
    ? `<div style="padding:20px;color:var(--muted);font-size:12px">Nessun feedback trovato</div>`
    : filtered.map(f => {
        const sel  = state.selectedFeedback?.id === f.id;
        const date = new Date(f.created_at).toLocaleDateString('it-IT', { day:'2-digit', month:'short', year:'2-digit' });
        const time = new Date(f.created_at).toLocaleTimeString('it-IT', { hour:'2-digit', minute:'2-digit' });
        const user = esc(f.username || f.email || '—');
        const prev = esc((f.feedback_text || '').slice(0, 55) + ((f.feedback_text || '').length > 55 ? '…' : ''));
        return `<div class="fb-list-item" data-fb-id="${esc(f.id)}"
          style="padding:12px 14px;border-bottom:1px solid #1a1a2e;cursor:pointer;
          background:${sel ? '#1e1a3d' : 'transparent'};
          border-left:3px solid ${sel ? 'var(--accent)' : 'transparent'}">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3px">
            <span style="font-size:12px;font-weight:600;color:${sel ? 'var(--purple)' : 'var(--fg)'}">${user}</span>
            <span style="font-size:10px;color:var(--muted);white-space:nowrap;margin-left:6px">${date} ${time}</span>
          </div>
          <div style="font-size:11px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${prev}</div>
        </div>`;
      }).join('');

  const detailHtml = feedbackDetailPanel();

  return `
    <div id="fb-modal-overlay" style="
      position:fixed;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(4px);
      display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px">
      <div style="
        background:#0f0f1a;border:1px solid #2a2a3d;border-radius:16px;
        width:100%;max-width:960px;height:min(88vh,700px);
        display:flex;flex-direction:column;box-shadow:0 24px 80px rgba(0,0,0,0.7);overflow:hidden">

        <div style="display:flex;align-items:center;gap:12px;padding:16px 20px;border-bottom:1px solid #1e1e30;flex-shrink:0">
          <div style="font-size:15px;font-weight:700;color:var(--fg);flex:1">
            Feedback utenti <span style="font-size:12px;font-weight:400;color:var(--muted)">(${feedbacks.length})</span>
          </div>
          <input id="fb-search" type="text" placeholder="Cerca utente o testo…"
            value="${esc(state.feedbackSearchQuery)}"
            class="form-input" style="width:220px;font-size:12px;padding:5px 10px">
          <button id="fb-modal-close" style="
            background:none;border:1px solid #2a2a3d;color:var(--muted);border-radius:8px;
            padding:5px 12px;cursor:pointer;font-size:13px;font-family:inherit">✕ Chiudi</button>
        </div>

        <div style="display:flex;flex:1;min-height:0">
          <div style="width:300px;flex-shrink:0;border-right:1px solid #1e1e30;overflow-y:auto">
            ${listHtml}
          </div>
          <div style="flex:1;overflow-y:auto;min-width:0">
            ${detailHtml}
          </div>
        </div>
      </div>
    </div>`;
}

function feedbackDetailPanel() {
  if (!state.selectedFeedback) {
    return `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--muted);font-size:13px">
      Seleziona un feedback
    </div>`;
  }
  const f    = state.selectedFeedback;
  const date = new Date(f.created_at).toLocaleDateString('it-IT', { weekday:'long', day:'2-digit', month:'long', year:'numeric' });
  const time = new Date(f.created_at).toLocaleTimeString('it-IT', { hour:'2-digit', minute:'2-digit' });
  const age  = calcAge(f.birth_date);
  const gender = GENDER_LABEL[f.gender?.toLowerCase()] || f.gender || null;
  const goal   = GOAL_LABEL[f.primary_goal] || f.primary_goal || null;
  const goal2  = GOAL_LABEL[f.secondary_goal] || f.secondary_goal || null;

  const profileRows = [
    f.email          && `<div style="display:flex;gap:8px;align-items:baseline"><span style="color:var(--muted);font-size:11px;width:110px;flex-shrink:0">Email</span><span style="font-size:12px;color:var(--fg)">${esc(f.email)}</span></div>`,
    (age || gender)  && `<div style="display:flex;gap:8px;align-items:baseline"><span style="color:var(--muted);font-size:11px;width:110px;flex-shrink:0">Anagrafica</span><span style="font-size:12px;color:var(--fg)">${[age ? age + ' anni' : null, gender].filter(Boolean).map(esc).join(' · ')}</span></div>`,
    (f.height_cm || f.weight_kg) && `<div style="display:flex;gap:8px;align-items:baseline"><span style="color:var(--muted);font-size:11px;width:110px;flex-shrink:0">Fisico</span><span style="font-size:12px;color:var(--fg)">${[f.height_cm ? f.height_cm + ' cm' : null, f.weight_kg ? f.weight_kg + ' kg' : null].filter(Boolean).join(' · ')}</span></div>`,
    goal             && `<div style="display:flex;gap:8px;align-items:baseline"><span style="color:var(--muted);font-size:11px;width:110px;flex-shrink:0">Obiettivo</span><span style="font-size:12px;color:var(--fg)">${esc(goal)}${goal2 ? ` <span style="color:var(--muted)">· ${esc(goal2)}</span>` : ''}</span></div>`,
    (f.weekly_frequency_target || f.session_duration_min) && `<div style="display:flex;gap:8px;align-items:baseline"><span style="color:var(--muted);font-size:11px;width:110px;flex-shrink:0">Allenamento</span><span style="font-size:12px;color:var(--fg)">${[f.weekly_frequency_target ? f.weekly_frequency_target + 'x/sett' : null, f.session_duration_min ? f.session_duration_min + ' min/sessione' : null].filter(Boolean).join(' · ')}</span></div>`,
    f.location       && `<div style="display:flex;gap:8px;align-items:baseline"><span style="color:var(--muted);font-size:11px;width:110px;flex-shrink:0">Luogo</span><span style="font-size:12px;color:var(--fg)">${esc(f.location)}</span></div>`,
    f.app_version    && `<div style="display:flex;gap:8px;align-items:baseline"><span style="color:var(--muted);font-size:11px;width:110px;flex-shrink:0">App</span><span style="font-size:12px;color:var(--fg)">${esc(f.app_version)}${f.device_info ? ` · ${esc(f.device_info)}` : ''}</span></div>`,
    f.source         && `<div style="display:flex;gap:8px;align-items:baseline"><span style="color:var(--muted);font-size:11px;width:110px;flex-shrink:0">Sorgente</span><span style="font-size:12px;color:var(--fg)">${esc(f.source)}</span></div>`,
  ].filter(Boolean).join('');

  return `<div style="padding:24px">
    <div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px">${date} · ${time}</div>
    <div style="font-size:15px;color:var(--fg);line-height:1.65;margin-bottom:24px;padding:16px;background:#12121e;border-radius:10px;border-left:3px solid var(--accent)">
      ${esc(f.feedback_text || '—')}
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.08em">
        Profilo utente · ${esc(f.username || f.email || '—')}
      </div>
      ${f.user_id ? `<button class="btn btn-ghost open-user-activity"
        data-user-id="${esc(f.user_id)}"
        data-username="${esc(f.username || f.email || '—')}"
        data-email="${esc(f.email || '')}"
        style="font-size:11px;padding:4px 10px">🕐 Vedi attività →</button>` : ''}
    </div>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${profileRows || `<div style="color:var(--muted);font-size:12px">Nessun dato profilo disponibile</div>`}
    </div>
  </div>`;
}

function userActivityModal() {
  if (!state.userActivityOpen) return '';
  const u = state.userActivityUser || {};
  const events = state.userActivityData || [];

  // Group by day
  let bodyHtml;
  if (state.userActivityLoading) {
    bodyHtml = `<div style="padding:32px;color:var(--muted);font-size:12px" class="pulse">Caricamento attività…</div>`;
  } else if (!events.length) {
    bodyHtml = `<div style="padding:32px;color:var(--muted);font-size:12px">Nessuna attività trovata.</div>`;
  } else {
    const byDay = {};
    events.forEach(e => {
      const day = new Date(e.created_at).toLocaleDateString('it-IT', { weekday:'long', day:'2-digit', month:'long', year:'numeric' });
      if (!byDay[day]) byDay[day] = [];
      byDay[day].push(e);
    });
    bodyHtml = Object.entries(byDay).map(([day, evs]) => {
      const rows = evs.map(e => {
        const t     = new Date(e.created_at).toLocaleTimeString('it-IT', { hour:'2-digit', minute:'2-digit' });
        const color = TYPE_COLOR[e.event_type] || '#a78bfa';
        const label = EVENT_LABELS[e.event_name] || e.event_name;
        const desc  = e.description || label;
        return `<div style="display:flex;align-items:flex-start;gap:10px;padding:7px 0;border-bottom:1px solid #12121e">
          <span style="font-size:10px;color:var(--muted);width:36px;flex-shrink:0;margin-top:2px">${t}</span>
          <span style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0;margin-top:5px"></span>
          <div style="flex:1;min-width:0">
            <div style="font-size:12px;color:var(--fg);line-height:1.45">${esc(desc)}</div>
            ${e.screen && e.screen !== e.event_name ? `<span style="font-size:10px;color:var(--muted)">${esc(e.screen)}</span>` : ''}
          </div>
          <span style="font-size:9px;color:${color};flex-shrink:0;margin-top:2px">${TYPE_LABEL[e.event_type] || e.event_type}</span>
        </div>`;
      }).join('');
      return `<div style="margin-bottom:4px">
        <div style="font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;
          letter-spacing:.08em;padding:10px 0 6px;border-bottom:1px solid #2a2a3d;margin-bottom:4px">${day}</div>
        ${rows}
      </div>`;
    }).join('');
  }

  const totalEvents = events.length;
  return `
    <div id="ua-overlay" style="
      position:fixed;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(4px);
      display:flex;align-items:center;justify-content:center;z-index:1010;padding:20px">
      <div style="
        background:#0f0f1a;border:1px solid #2a2a3d;border-radius:16px;
        width:100%;max-width:640px;height:min(88vh,720px);
        display:flex;flex-direction:column;box-shadow:0 24px 80px rgba(0,0,0,0.8);overflow:hidden">
        <div style="display:flex;align-items:center;gap:12px;padding:16px 20px;border-bottom:1px solid #1e1e30;flex-shrink:0">
          <div style="flex:1">
            <div style="font-size:14px;font-weight:700;color:var(--fg)">${esc(u.username || '—')}</div>
            <div style="font-size:11px;color:var(--muted)">${esc(u.email || '')} · ultimi ${totalEvents} eventi</div>
          </div>
          <button id="ua-close" style="background:none;border:1px solid #2a2a3d;color:var(--muted);
            border-radius:8px;padding:5px 12px;cursor:pointer;font-size:13px;font-family:inherit">✕ Chiudi</button>
        </div>
        <div style="flex:1;overflow-y:auto;padding:16px 20px">
          ${bodyHtml}
        </div>
      </div>
    </div>`;
}

function esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function aiChatsCard() {
  const sessions = state.recentAISessions;
  const body = !sessions
    ? `<div style="color:var(--muted);font-size:12px;padding:12px 0" class="pulse">Caricamento…</div>`
    : !sessions.length
    ? `<div style="color:var(--muted);font-size:12px;padding:12px 0">Nessun messaggio AI</div>`
    : sessions.map(s => {
        const date = new Date(s.session_start).toLocaleDateString('it-IT', { day:'2-digit', month:'short' });
        const time = new Date(s.session_start).toLocaleTimeString('it-IT', { hour:'2-digit', minute:'2-digit' });
        const user = esc(s.username || s.email || '—');
        const preview = esc((s.first_msg || '—').slice(0, 90) + ((s.first_msg || '').length > 90 ? '…' : ''));
        const count = s.msg_count > 1 ? `<span style="font-size:9px;background:#2a2a3d;color:var(--muted);padding:1px 7px;border-radius:10px;margin-left:4px">${s.msg_count} msg</span>` : '';
        const age   = calcAge(s.birth_date);
        const goal  = GOAL_LABEL[s.primary_goal] || s.primary_goal || null;
        const meta  = [s.email, goal, age ? age + ' anni' : null].filter(Boolean).map(esc).join(' · ');
        return `<div class="ai-session-row" data-session-id="${esc(s.session_id)}"
          style="padding:10px 0;border-bottom:1px solid #1e1e30;cursor:pointer;transition:background .15s"
          onmouseenter="this.style.background='#12121e'" onmouseleave="this.style.background=''"
          title="Apri conversazione">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px">
            <div style="display:flex;align-items:center;gap:4px">
              <span style="font-size:11px;font-weight:600;color:var(--purple)">${user}</span>
              ${count}
            </div>
            <span style="font-size:10px;color:var(--muted)">${date} ${time}</span>
          </div>
          ${meta ? `<div style="font-size:10px;color:var(--muted);margin-bottom:4px">${meta}</div>` : ''}
          <div style="font-size:12px;color:var(--fg);line-height:1.5">${preview}</div>
        </div>`;
      }).join('');
  return `<div class="card">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <div class="card-title" style="margin-bottom:0">Ultimi messaggi all'AI</div>
      <button id="open-ai-conv" class="btn btn-ghost" style="font-size:11px;padding:4px 10px">Tutte le conv. →</button>
    </div>
    ${body}
  </div>`;
}

function aiStatsPanel() {
  if (state.aiStatsLoading) {
    return `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--muted);font-size:13px" class="pulse">Caricamento statistiche…</div>`;
  }
  const d = state.aiStatsData;
  if (!d) {
    return `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--muted);font-size:13px">Seleziona un periodo e premi Aggiorna</div>`;
  }

  const fmt = n => Number(n).toLocaleString('it-IT');
  const fmtK = n => n >= 1000 ? (n/1000).toFixed(1) + 'K' : String(n);
  const errPct = d.total_calls > 0 ? ((d.errors / d.total_calls) * 100).toFixed(1) : '0.0';

  const kpis = [
    { label: 'Chiamate AI',    value: fmt(d.total_calls),   sub: 'totale' },
    { label: 'Token totali',   value: fmtK(d.total_tokens), sub: `${fmtK(d.tokens_in)} in · ${fmtK(d.tokens_out)} out` },
    { label: 'Costo totale',   value: '$' + Number(d.cost_usd).toFixed(3), sub: `~$${Number(d.avg_cost_per_user).toFixed(3)} / utente` },
    { label: 'Utenti unici',   value: fmt(d.unique_users),  sub: 'distinti', id: 'ai-stats-users-toggle', clickable: true },
    { label: 'Sessioni',       value: fmt(d.sessions),       sub: 'context univoci' },
    { label: 'Errori',         value: fmt(d.errors),         sub: errPct + '% delle chiamate', accent: d.errors > 0 ? '#e05555' : null },
  ];

  const usersOpen = state.aiStatsUsersOpen;
  const kpiHtml = kpis.map(k => {
    const active = k.clickable && usersOpen;
    return `<div ${k.id ? `id="${k.id}"` : ''} style="background:#12121e;border:1px solid ${active ? 'var(--accent)' : '#1e1e30'};border-radius:12px;padding:16px 18px;flex:1;min-width:130px;${k.clickable ? 'cursor:pointer;user-select:none' : ''}">
      <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px">${k.label}${k.clickable ? ` <span style="font-size:10px;color:${active ? 'var(--accent)' : 'var(--muted)'}">${active ? '▲' : '▼'}</span>` : ''}</div>
      <div style="font-size:22px;font-weight:700;color:${active ? 'var(--accent)' : (k.accent || 'var(--fg)')};">${k.value}</div>
      <div style="font-size:11px;color:var(--muted);margin-top:3px">${k.sub}</div>
    </div>`;
  }).join('');

  let usersHtml = '';
  if (usersOpen) {
    if (state.aiStatsUsersLoading) {
      usersHtml = `<div style="padding:12px 0;color:var(--muted);font-size:12px" class="pulse">Caricamento utenti…</div>`;
    } else {
      const users = state.aiStatsUsers || [];
      usersHtml = `
        <div style="margin-bottom:24px;background:#12121e;border:1px solid var(--accent);border-radius:12px;overflow:hidden">
          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr style="background:#1e1a3d">
                <th style="text-align:left;padding:10px 16px;font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;font-weight:600">#</th>
                <th style="text-align:left;padding:10px 16px;font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;font-weight:600">Nome</th>
                <th style="text-align:left;padding:10px 16px;font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;font-weight:600">Email</th>
              </tr>
            </thead>
            <tbody>
              ${users.map((u, i) => `
                <tr style="border-top:1px solid #1e1e30">
                  <td style="padding:9px 16px;font-size:11px;color:var(--muted)">${i + 1}</td>
                  <td style="padding:9px 16px;font-size:13px;color:var(--fg);font-weight:500">${esc(u.name || '—')}</td>
                  <td style="padding:9px 16px;font-size:12px;color:var(--muted);font-family:monospace">${esc(u.email || '—')}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`;
    }
  }

  const tools = d.top_tools || [];
  const maxCnt = d.max_tool_cnt || 1;
  const TOOL_NICE = {
    get_exercises: 'Cerca esercizi', get_user_profile: 'Legge profilo',
    get_user_workouts: 'Guarda allenamenti', create_workout: 'Crea workout',
    save_coach_note: 'Salva nota', propose_workout: 'Propone workout',
    get_roadmap: 'Legge roadmap', get_user_state: 'Stato utente',
  };
  const toolsHtml = !tools.length
    ? `<div style="color:var(--muted);font-size:12px">Nessun tool usato nel periodo</div>`
    : tools.map(t => {
        const pct = Math.round((t.cnt / maxCnt) * 100);
        const label = TOOL_NICE[t.tool] || t.tool;
        return `<div style="margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
            <span style="color:var(--fg)">${esc(label)}</span>
            <span style="color:var(--muted)">${t.cnt}</span>
          </div>
          <div style="background:#1e1e30;border-radius:4px;height:6px;overflow:hidden">
            <div style="width:${pct}%;height:100%;background:var(--accent);border-radius:4px;transition:width .4s ease"></div>
          </div>
        </div>`;
      }).join('');

  return `<div style="padding:24px;overflow-y:auto;height:100%">
    <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:${usersOpen ? '14px' : '24px'}">${kpiHtml}</div>
    ${usersHtml}
    <div style="font-size:12px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:14px">Tool più usati</div>
    <div style="max-width:480px">${toolsHtml}</div>
  </div>`;
}

function aiConversationsModal() {
  if (!state.aiConvOpen) return '';

  const sessions = state.aiSessions || [];
  const q = (state.aiSearchQuery || '').toLowerCase();
  const filtered = q
    ? sessions.filter(s => (s.username || s.email || '').toLowerCase().includes(q))
    : sessions;

  const sessionList = state.aiSessionsLoading
    ? `<div style="padding:20px;color:var(--muted);font-size:12px" class="pulse">Caricamento sessioni…</div>`
    : !filtered.length
    ? `<div style="padding:20px;color:var(--muted);font-size:12px">Nessuna sessione trovata</div>`
    : filtered.map(s => {
        const sel = state.aiSelectedSession?.session_id === s.session_id;
        const date = new Date(s.session_start).toLocaleDateString('it-IT', { day:'2-digit', month:'short', year:'2-digit' });
        const time = new Date(s.session_start).toLocaleTimeString('it-IT', { hour:'2-digit', minute:'2-digit' });
        const user = esc(s.username || s.email || '—');
        const preview = esc((s.first_msg || '—').slice(0, 60) + ((s.first_msg || '').length > 60 ? '…' : ''));
        const age2  = calcAge(s.birth_date);
        const goal2 = GOAL_LABEL[s.primary_goal] || s.primary_goal || null;
        const meta2 = [goal2, age2 ? age2 + ' anni' : null].filter(Boolean).map(esc).join(' · ');
        return `<div class="ai-session-list-item" data-session-id="${esc(s.session_id)}"
          style="padding:12px 14px;border-bottom:1px solid #1a1a2e;cursor:pointer;
          background:${sel ? '#1e1a3d' : 'transparent'};border-left:3px solid ${sel ? 'var(--accent)' : 'transparent'};
          transition:background .15s"
          onmouseenter="if(!this.classList.contains('selected'))this.style.background='#14141f'"
          onmouseleave="if(!this.classList.contains('selected'))this.style.background='${sel ? '#1e1a3d' : 'transparent'}'">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px">
            <span style="font-size:12px;font-weight:600;color:${sel ? 'var(--purple)' : 'var(--fg)'}">${user}</span>
            <span style="font-size:10px;color:var(--muted)">${date} ${time}</span>
          </div>
          ${meta2 ? `<div style="font-size:10px;color:var(--muted);margin-bottom:3px">${meta2}</div>` : ''}
          <div style="display:flex;align-items:center;gap:6px">
            <span style="font-size:11px;color:var(--muted);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${preview}</span>
            ${s.msg_count > 1 ? `<span style="font-size:9px;background:#2a2a3d;color:var(--muted);padding:1px 6px;border-radius:10px;flex-shrink:0">${s.msg_count}</span>` : ''}
          </div>
        </div>`;
      }).join('');

  const chatPanel = aiChatPanel();

  return `
    <div id="ai-conv-overlay" style="
      position:fixed;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(4px);
      display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px">
      <div style="
        background:#0f0f1a;border:1px solid #2a2a3d;border-radius:16px;
        width:100%;max-width:960px;height:min(88vh,700px);
        display:flex;flex-direction:column;box-shadow:0 24px 80px rgba(0,0,0,0.7);overflow:hidden">

        <!-- Header -->
        <div style="display:flex;align-items:center;gap:10px;padding:16px 20px;border-bottom:1px solid #1e1e30;flex-shrink:0;flex-wrap:wrap">
          <div style="font-size:15px;font-weight:700;color:var(--fg);flex:1;min-width:120px">Conversazioni AI</div>

          ${state.aiStatsOpen ? `
            <span style="font-size:11px;color:var(--muted)">Da</span>
            <input id="ai-stats-from" type="date" class="form-input" value="${esc(state.aiStatsFrom)}"
              style="width:140px;font-size:12px;padding:5px 10px">
            <span style="color:var(--muted);font-size:11px">→</span>
            <input id="ai-stats-to" type="date" class="form-input" value="${esc(state.aiStatsTo)}"
              style="width:140px;font-size:12px;padding:5px 10px">
            <button id="ai-stats-apply" class="btn btn-primary" style="font-size:12px;padding:5px 14px">Aggiorna</button>
          ` : `
            <input id="ai-conv-search" type="text" placeholder="Cerca utente…"
              value="${esc(state.aiSearchQuery)}"
              class="form-input" style="width:200px;font-size:12px;padding:5px 10px">
          `}

          <button id="ai-stats-toggle" style="
            background:${state.aiStatsOpen ? 'var(--accent)' : 'none'};
            border:1px solid ${state.aiStatsOpen ? 'var(--accent)' : '#2a2a3d'};
            color:${state.aiStatsOpen ? '#fff' : 'var(--muted)'};
            border-radius:8px;padding:5px 12px;cursor:pointer;font-size:12px;font-family:inherit;white-space:nowrap">
            📊 Statistiche
          </button>
          <button id="ai-conv-close" style="
            background:none;border:1px solid #2a2a3d;color:var(--muted);border-radius:8px;
            padding:5px 12px;cursor:pointer;font-size:13px;font-family:inherit">✕ Chiudi</button>
        </div>

        <!-- Body -->
        <div style="display:flex;flex:1;min-height:0">
          ${state.aiStatsOpen ? `
            <div style="flex:1;min-width:0;overflow-y:auto">
              ${aiStatsPanel()}
            </div>
          ` : `
            <!-- Session list -->
            <div style="width:280px;flex-shrink:0;border-right:1px solid #1e1e30;overflow-y:auto">
              ${sessionList}
            </div>
            <!-- Chat panel -->
            <div style="flex:1;display:flex;flex-direction:column;min-width:0">
              ${chatPanel}
            </div>
          `}
        </div>
      </div>
    </div>`;
}

function aiChatPanel() {
  if (!state.aiSelectedSession) {
    return `<div style="flex:1;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:13px">
      Seleziona una conversazione
    </div>`;
  }
  const s = state.aiSelectedSession;
  const dateRange = new Date(s.session_start).toLocaleDateString('it-IT', { day:'2-digit', month:'long', year:'numeric' });

  const messages = state.aiSessionMessages;
  const loading  = state.aiSessionMessagesLoading;

  let msgHtml;
  if (loading) {
    msgHtml = `<div style="padding:24px;color:var(--muted);font-size:12px" class="pulse">Caricamento messaggi…</div>`;
  } else if (!messages || !messages.length) {
    msgHtml = `<div style="padding:24px;color:var(--muted);font-size:12px">Nessun messaggio trovato</div>`;
  } else {
    const TOOL_NICE = {
      get_exercises: 'cerca esercizi',
      get_user_profile: 'legge profilo',
      get_user_workouts: 'guarda allenamenti',
      create_workout: 'crea workout',
      save_coach_note: 'salva nota',
      propose_workout: 'propone workout',
    };
    const ICON_MAP = { dumbbell:'💪', coffee:'☕', fire:'🔥', star:'⭐', heart:'❤️', lightning:'⚡', run:'🏃' };
    const LEVEL_DOT = { Easy:'🟢', Medium:'🟡', Hard:'🔴' };

    msgHtml = messages.map(m => {
      const t = new Date(m.ts).toLocaleTimeString('it-IT', { hour:'2-digit', minute:'2-digit' });

      if (m.event === 'start' && m.user_msg) {
        return `<div style="margin-bottom:14px">
          <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:4px">
            <span style="font-size:10px;font-weight:700;color:var(--purple);text-transform:uppercase;letter-spacing:.06em">${esc(s.username || s.email || '?')}</span>
            <span style="font-size:10px;color:var(--muted)">${t}</span>
          </div>
          <div style="background:#1a1a2e;border-radius:10px 10px 10px 2px;padding:10px 14px;font-size:13px;color:var(--fg);line-height:1.55;max-width:85%;word-break:break-word">${esc(m.user_msg)}</div>
        </div>`;
      }

      if (m.event === 'ai_response' && m.tool_names) {
        let tools = [];
        try { tools = JSON.parse(m.tool_names); } catch { tools = [m.tool_names]; }
        const toolStr = tools.map(n => TOOL_NICE[n] || n).join(' · ');
        return `<div style="margin:4px 0 8px 8px;font-size:10px;color:#555;display:flex;align-items:center;gap:5px">
          <span style="color:#3a3a5a">⚙</span> ${esc(toolStr)}
        </div>`;
      }

      if (m.event === 'ai_response' && m.ai_text) {
        return `<div style="margin-bottom:18px;display:flex;justify-content:flex-end">
          <div>
            <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:4px;justify-content:flex-end">
              <span style="font-size:10px;color:var(--muted)">${t}</span>
              <span style="font-size:10px;font-weight:700;color:#4ade80;text-transform:uppercase;letter-spacing:.06em">Coach AI</span>
            </div>
            <div style="background:#0d2218;border:1px solid #1a3a28;border-radius:10px 10px 2px 10px;padding:10px 14px;font-size:13px;color:#d1fae5;line-height:1.55;max-width:85%;word-break:break-word;text-align:left">${esc(m.ai_text)}</div>
          </div>
        </div>`;
      }

      if (m.event === 'tool_result' && m.tool_name === 'propose_workout' && m.tool_result_data) {
        let w;
        try { w = JSON.parse(m.tool_result_data); } catch { return ''; }
        const icon  = ICON_MAP[w.icon] || '🏋️';
        const dot   = LEVEL_DOT[w.level] || '';
        const exs   = (w.exercises_resolved || []).map(ex =>
          `<div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid #1a2530">
            <span style="flex:1;font-size:12px;color:var(--fg)">${esc(ex.name)}</span>
            <span style="font-size:11px;color:var(--muted);width:38px;text-align:right">${ex.time_seconds}s</span>
            <span style="font-size:10px;color:#4a6a8a;width:60px;text-align:right">${esc(ex.muscle)}</span>
          </div>`
        ).join('');
        return `<div style="margin:6px 0 18px 0;background:#0a1a28;border:1px solid #1a3a50;border-radius:12px;padding:14px 16px;max-width:90%">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <span style="font-size:18px">${icon}</span>
            <div>
              <div style="font-size:13px;font-weight:700;color:#7dd3fc">${esc(w.name)}</div>
              <div style="font-size:11px;color:var(--muted)">${dot} ${esc(w.level)} · ${w.time_minutes} min · ${w.exp_preview} XP</div>
            </div>
          </div>
          <div style="margin-bottom:10px">${exs}</div>
          ${w.reasoning ? `<div style="font-size:11px;color:#4a6a8a;line-height:1.5;font-style:italic;border-top:1px solid #1a2530;padding-top:8px">${esc(w.reasoning)}</div>` : ''}
        </div>`;
      }

      return '';
    }).join('');
  }

  const panelAge  = calcAge(s.birth_date);
  const panelGoal = GOAL_LABEL[s.primary_goal] || s.primary_goal || null;
  const panelGender = GENDER_LABEL[s.gender?.toLowerCase()] || null;
  const profileChips = [
    s.email     && `<span style="font-size:10px;color:var(--muted)">${esc(s.email)}</span>`,
    panelGoal   && `<span style="font-size:10px;background:#1e1a3d;color:var(--purple);padding:1px 8px;border-radius:10px">${esc(panelGoal)}</span>`,
    (panelAge || panelGender) && `<span style="font-size:10px;color:var(--muted)">${[panelAge ? panelAge + ' anni' : null, panelGender].filter(Boolean).map(esc).join(' · ')}</span>`,
  ].filter(Boolean).join('');

  return `
    <div style="padding:14px 20px;border-bottom:1px solid #1e1e30;flex-shrink:0">
      <div style="font-size:12px;font-weight:600;color:var(--fg);margin-bottom:4px">${esc(s.username || s.email || '—')}</div>
      ${profileChips ? `<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px">${profileChips}</div>` : ''}
      <div style="font-size:11px;color:var(--muted)">${dateRange} · ${s.msg_count} messaggio${s.msg_count !== 1 ? 'i' : ''}</div>
    </div>
    <div style="flex:1;overflow-y:auto;padding:20px">
      ${msgHtml}
    </div>`;
}

// ── FUNNEL — custom builder ───────────────────────────────────────────

function pageFunnel() {
  const editPanel = state.editingFunnel ? `
    <div class="card" style="margin-bottom:20px;border-color:var(--accent)">
      <div class="card-title" style="margin-bottom:16px">Costruttore Funnel</div>
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:18px">
        ${state.funnelConfig.map((row, i) => funnelEditRow(row, i)).join('')}
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <button id="funnel-add" class="btn btn-ghost" style="font-size:12px;padding:5px 12px">+ Aggiungi step</button>
        <button id="funnel-reset" class="btn btn-ghost" style="font-size:12px;padding:5px 12px;color:var(--muted)">↺ Default</button>
        <button id="close-funnel-edit" class="btn btn-primary" style="font-size:12px;padding:6px 14px;margin-left:auto">Chiudi</button>
      </div>
    </div>` : '';

  const body = state.funnelLoading
    ? `<div class="empty" style="padding:48px"><div class="empty-icon pulse">🎯</div><div class="empty-text" style="color:var(--muted)">Calcolo funnel...</div></div>`
    : state.funnelError
    ? `<div style="padding:20px;color:var(--red);font-size:13px">⚠️ ${state.funnelError}</div>`
    : !state.funnel
    ? `<div class="empty" style="padding:48px"><div class="empty-icon">🎯</div><div class="empty-text" style="color:var(--muted)">Seleziona un periodo e clicca Calcola.</div></div>`
    : funnelViz();

  return `
    <div class="filter-bar" style="margin-bottom:20px">
      ${state.sprints.length ? `
        <span class="filter-label">Sprint</span>
        <select id="funnel-sprint-sel" class="form-select" style="font-size:12px;padding:5px 10px;min-width:160px">
          <option value="">— Periodo libero —</option>
          ${state.sprints.map(s => `<option value="${s.id}">${s.nome}</option>`).join('')}
        </select>
        <div class="filter-sep"></div>
      ` : ''}
      <span class="filter-label">Periodo</span>
      <input type="date" id="funnel-from" class="form-input" value="${state.funnelFrom}"
        style="width:145px;padding:5px 10px;font-size:12px">
      <span style="color:var(--muted)">→</span>
      <input type="date" id="funnel-to" class="form-input" value="${state.funnelTo}"
        style="width:145px;padding:5px 10px;font-size:12px">
      <button id="funnel-apply" class="btn btn-primary" style="padding:6px 16px;font-size:12px">Calcola</button>
      ${!state.editingFunnel ? `<button id="edit-funnel" class="btn btn-ghost" style="padding:5px 12px;font-size:12px;margin-left:auto">⚙ Modifica funnel</button>` : ''}
    </div>

    ${editPanel}

    <div class="card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
        <div class="card-title" style="margin-bottom:0">Funnel di conversione</div>
      </div>
      <div style="font-size:11px;color:var(--muted);margin-bottom:20px">
        ${state.funnelFrom} → ${state.funnelTo} · esclusi account interni (Napo, Dan, Carlito…)
      </div>
      ${body}
    ${metaFunnelSection()}
    </div>
    ${sprintFunnelSection()}`;
}

function metaFunnelSection() {
  if (!state.funnel || !state.metaToken) return '';
  const fmt2 = n => parseFloat(n).toFixed(2);
  const onboardingCount = Number(state.funnel[3]?.numero ?? 0);
  const workoutCount    = Number(state.funnel[4]?.numero ?? 0);
  const periodMatch = state.metaFunnelData && state.metaFunnelPeriod === (state.funnelFrom + ' → ' + state.funnelTo);

  const sep = 'margin-top:20px;padding-top:16px;border-top:1px solid rgba(167,139,250,0.25)';
  const header = '<div style="margin-bottom:14px">' +
    '<div style="font-size:10px;font-weight:700;letter-spacing:.8px;color:var(--muted);text-transform:uppercase">Meta ADS</div>' +
    '</div>';

  if (state.metaFunnelLoading) return '<div style="' + sep + '">' + header + '<div style="font-size:12px;color:var(--muted)">Caricamento dati Meta…</div></div>';
  if (state.metaFunnelError) return '<div style="' + sep + '">' + header + '<div style="font-size:12px;color:var(--red)">⚠ ' + state.metaFunnelError + '</div></div>';
  if (!periodMatch) return '';

  const md = state.metaFunnelData;
  const spend = parseFloat(md.spend || 0);
  const cac   = onboardingCount > 0 ? spend / onboardingCount : null;
  const cpau  = workoutCount    > 0 ? spend / workoutCount    : null;
  const kpi = (label, value, sub, color) =>
    '<div style="flex:1;min-width:140px">' +
    '<div style="font-size:11px;color:var(--muted);margin-bottom:4px">' + label + '</div>' +
    '<div style="font-size:22px;font-weight:700;color:' + color + '">€ ' + value + '</div>' +
    (sub ? '<div style="font-size:11px;color:var(--muted);margin-top:3px">' + sub + '</div>' : '') +
    '</div>';

  const kpis = '<div style="display:flex;gap:32px;flex-wrap:wrap">' +
    kpi('Costi Meta ADS', fmt2(spend), null, 'var(--red)') +
    kpi('CAC', cac != null ? fmt2(cac) : '—', cac != null ? onboardingCount + ' onboarding completati' : null, 'var(--amber)') +
    kpi('CPAU', cpau != null ? fmt2(cpau) : '—', cpau != null ? workoutCount + ' utenti con ≥1 workout' : null, 'var(--purple)') +
    '</div>';

  return '<div style="' + sep + '">' + header + kpis + '</div>';
}

function funnelEditRow(row, i) {
  const stepOpts = FUNNEL_LABELS.map((l, idx) =>
    `<option value="${idx}" ${row.stepIdx === idx ? 'selected' : ''}>${l}</option>`
  ).join('');

  const vsOpts = `<option value="">—</option>` +
    state.funnelConfig.slice(0, i).map((r, j) =>
      `<option value="${j}" ${row.vsIdx === j ? 'selected' : ''}>% vs ${FUNNEL_LABELS[r.stepIdx]}</option>`
    ).join('');

  return `
    <div style="display:flex;align-items:center;gap:8px">
      <span style="font-size:11px;color:var(--muted);width:20px;text-align:right;flex-shrink:0">${i + 1}.</span>
      <select class="form-select funnel-step-sel" data-row="${i}" style="flex:1;font-size:12px;padding:5px 8px">${stepOpts}</select>
      <select class="form-select funnel-vs-sel"   data-row="${i}" style="width:200px;font-size:12px;padding:5px 8px">${vsOpts}</select>
      <button class="btn btn-ghost funnel-remove" data-row="${i}"
        style="padding:4px 10px;font-size:15px;line-height:1;color:var(--red);flex-shrink:0">×</button>
    </div>`;
}

function funnelViz() {
  const cfg    = state.funnelConfig;
  const funnel = state.funnel;
  if (!funnel || !cfg.length) return `<div style="color:var(--muted);font-size:13px">Nessuno step configurato.</div>`;

  const numbers = cfg.map(r => Number(funnel[r.stepIdx]?.numero ?? 0));
  const maxN    = Math.max(...numbers, 1);

  return cfg.map((row, i) => {
    const n        = numbers[i];
    const vsN      = (row.vsIdx !== null && row.vsIdx >= 0 && row.vsIdx < i) ? numbers[row.vsIdx] : null;
    const convPct  = vsN !== null && vsN > 0 ? (n / vsN * 100) : null;
    const conv     = convPct !== null ? convPct.toFixed(1) + '%' : '—';
    const label    = FUNNEL_LABELS[row.stepIdx];
    const pct      = (n / maxN) * 100;
    const isLow    = convPct !== null && convPct < 20;
    const isGood   = convPct !== null && convPct >= 50;
    const barColor  = i === 0 ? '#7070a0' : isLow ? '#f87171' : isGood ? '#4ade80' : '#a78bfa';
    const convColor = conv === '—' ? 'var(--muted)' : isLow ? 'var(--red)' : isGood ? 'var(--mattia)' : 'var(--purple)';

    return `
      <div style="display:flex;align-items:center;gap:14px;padding:9px 0;border-bottom:1px solid var(--border)">
        <div style="width:210px;font-size:12px;color:var(--muted);flex-shrink:0;line-height:1.4">${label}</div>
        <div style="flex:1;background:var(--surface2);border-radius:3px;height:22px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:${barColor};opacity:.75;border-radius:3px"></div>
        </div>
        <div style="width:44px;text-align:right;font-family:var(--mono);font-weight:600;font-size:15px;flex-shrink:0">${n}</div>
        <div style="width:56px;text-align:right;font-size:12px;font-weight:600;color:${convColor};flex-shrink:0">${conv}</div>
      </div>`;
  }).join('');
}

// ── RETENTION ────────────────────────────────────────────────────────

function pageRetention() {
  const retainedOpts = Array.from({ length: 10 }, (_, i) => i + 1).map(n =>
    `<option value="${n}" ${state.retMin === n ? 'selected' : ''}>≥${n} workout / sett.</option>`
  ).join('');

  const eligibleOpts = [1,2,3,4,5].map(n =>
    `<option value="${n}" ${state.retMinW0 === n ? 'selected' : ''}>≥${n} workout in W0</option>`
  ).join('');

  const weeksOpts = [2,4,6,8,12,26,52].map(w =>
    `<option value="${w}" ${state.retWeeks === w ? 'selected' : ''}>${w} settimane</option>`
  ).join('');

  const body = state.retLoading
    ? `<div class="empty" style="padding:48px"><div class="empty-icon pulse">🔄</div><div class="empty-text" style="color:var(--muted)">Calcolo retention...</div></div>`
    : state.retError
    ? `<div style="padding:20px;color:var(--red);font-size:13px">⚠️ ${state.retError}</div>`
    : !state.retention
    ? `<div class="empty" style="padding:48px"><div class="empty-icon">🔄</div><div class="empty-text" style="color:var(--muted)">Seleziona le opzioni e clicca Calcola.</div></div>`
    : retentionBody();

  return `
    <div class="filter-bar" style="margin-bottom:20px;flex-wrap:wrap;gap:10px">
      <span class="filter-label">Iscrizione</span>
      <input type="date" id="ret-from" class="form-input" value="${state.retFrom}"
        style="width:145px;padding:5px 10px;font-size:12px">
      <span style="color:var(--muted)">→</span>
      <input type="date" id="ret-to" class="form-input" value="${state.retTo}"
        style="width:145px;padding:5px 10px;font-size:12px">
      <div class="filter-sep"></div>
      <span class="filter-label">Analizza</span>
      <select id="ret-weeks" class="form-select" style="font-size:12px;padding:5px 10px;width:130px">${weeksOpts}</select>
      <div class="filter-sep"></div>
      <span class="filter-label">Eligible</span>
      <select id="ret-min-w0" class="form-select" style="font-size:12px;padding:5px 10px;width:180px">${eligibleOpts}</select>
      <div class="filter-sep"></div>
      <span class="filter-label">Retained se</span>
      <select id="ret-min" class="form-select" style="font-size:12px;padding:5px 10px;width:170px">${retainedOpts}</select>
      <button id="ret-apply" class="btn btn-primary" style="padding:6px 16px;font-size:12px">Calcola</button>
    </div>
    ${body}
    ${sprintRetSection()}`;
}

function retentionBody() {
  const rows = state.retention;
  if (!rows || !rows.length) return `<div style="color:var(--muted);font-size:13px">Nessun dato.</div>`;

  const cohortSize   = rows[0]?.eligible ?? 0;
  const eligibleDesc = `≥${state.retMinW0} workout in W0`;

  return `
    <div style="font-size:12px;color:var(--muted);margin-bottom:20px;line-height:1.8">
      <strong style="color:var(--text)">${cohortSize} utenti</strong> ·
      iscritti tra ${state.retFrom} e ${state.retTo} ·
      eligible: ${eligibleDesc} ·
      retained: ≥${state.retMin} workout/sett. ·
      esclusi account interni
    </div>

    <div class="card" style="margin-bottom:18px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px">
        <div class="card-title" style="margin-bottom:0">Curva di retention</div>
        <div style="display:flex;gap:6px">
          <button class="filter-btn ${state.retChart==='bar'?'active':''}" data-ret-chart="bar">Barre</button>
          <button class="filter-btn ${state.retChart==='line'?'active':''}" data-ret-chart="line">Linea</button>
        </div>
      </div>
      ${retentionCurve(rows)}
    </div>

    <div class="card">
      <div class="card-title">Retention settimanale</div>
      ${retentionTable(rows)}
    </div>`;
}

function retentionTable(rows) {
  const w0eligible = rows[0]?.eligible ?? 1;
  return `
    <table class="data-table" style="margin-top:10px">
      <thead>
        <tr>
          <th>Settimana</th>
          <th>Eligible</th>
          <th>Retained</th>
          <th>Tasso</th>
          <th>vs W0</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(r => {
          const pct   = Number(r.retention_pct);
          const vsW0  = w0eligible > 0 ? Math.round(r.retained / w0eligible * 100) : 0;
          const color = pct >= 40 ? 'var(--mattia)' : pct >= 20 ? 'var(--amber)' : pct > 0 ? 'var(--red)' : 'var(--muted)';
          const label = r.week === 0 ? 'W0 (base)' : `W${r.week}`;
          return `<tr>
            <td style="color:var(--muted);font-size:12px">${label}</td>
            <td class="metric-val" style="font-size:13px">${r.eligible}</td>
            <td class="metric-val" style="font-size:13px">${r.retained}</td>
            <td style="font-weight:700;color:${color}">${pct}%</td>
            <td style="font-size:12px;color:var(--muted)">${vsW0}%</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
}

function retentionCurve(rows) {
  return state.retChart === 'line' ? retentionLine(rows) : retentionBars(rows);
}

function retentionBars(rows) {
  const n     = rows.length;
  const dense = n > 16;
  const gap   = dense ? 3 : 6;
  const bars  = rows.map((r, i) => {
    const pct    = Number(r.retention_pct);
    const h      = Math.max((pct / 100) * 100, pct > 0 ? 2 : 0);
    const color  = pct >= 40 ? '#4ade80' : pct >= 20 ? '#fbbf24' : pct > 0 ? '#f87171' : '#2a2a3a';
    const showLbl = !dense || i === 0 || i === n - 1 || i % 4 === 0;
    const label  = r.week === 0 ? 'W0' : `W${r.week}`;
    return `
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;min-width:0">
        <div style="font-size:9px;color:var(--muted);font-family:var(--mono);white-space:nowrap">${showLbl ? pct+'%' : ''}</div>
        <div style="flex:1;width:100%;display:flex;align-items:flex-end">
          <div style="width:100%;height:${h}%;background:${color};border-radius:2px 2px 0 0;opacity:.85;min-height:${pct>0?'3px':'0'}"></div>
        </div>
        <div style="font-size:9px;color:var(--muted);white-space:nowrap">${showLbl ? label : ''}</div>
      </div>`;
  }).join('');
  return `<div style="display:flex;align-items:stretch;gap:${gap}px;height:180px;padding-top:4px">${bars}</div>`;
}

function retentionLine(rows) {
  const W = 800, H = 160, PAD_T = 24, PAD_B = 26, PAD_L = 28, PAD_R = 10;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;
  const n      = rows.length;
  const dense  = n > 16;

  const pts = rows.map((r, i) => ({
    x:   PAD_L + (n === 1 ? chartW / 2 : i / (n - 1) * chartW),
    y:   PAD_T + chartH - (Number(r.retention_pct) / 100 * chartH),
    pct: Number(r.retention_pct),
    lbl: r.week === 0 ? 'W0' : `W${r.week}`,
    show: !dense || i === 0 || i === n - 1 || i % 4 === 0,
  }));

  const refs = [25, 50, 75, 100].map(p => {
    const y = PAD_T + chartH - (p / 100 * chartH);
    return `<line x1="${PAD_L}" y1="${y}" x2="${W - PAD_R}" y2="${y}" stroke="#252535" stroke-width="1"/>
            <text x="${PAD_L - 4}" y="${y + 3}" text-anchor="end" font-size="8" fill="#5a5a80">${p}%</text>`;
  }).join('');

  const area = `${pts[0].x},${PAD_T + chartH} ` +
    pts.map(p => `${p.x},${p.y}`).join(' ') +
    ` ${pts[pts.length - 1].x},${PAD_T + chartH}`;
  const line = pts.map(p => `${p.x},${p.y}`).join(' ');
  const color = '#a78bfa';

  const dots = pts.map(p => {
    const c = p.pct >= 40 ? '#4ade80' : p.pct >= 20 ? '#fbbf24' : p.pct > 0 ? '#f87171' : '#3a3a52';
    const r = dense ? 3 : 4;
    return `
      <circle cx="${p.x}" cy="${p.y}" r="${r}" fill="${c}" stroke="#111118" stroke-width="1.5"/>
      ${p.show ? `<text x="${p.x}" y="${p.y - r - 4}" text-anchor="middle" font-size="8" fill="${c}">${p.pct}%</text>` : ''}
      ${p.show ? `<text x="${p.x}" y="${H - 4}" text-anchor="middle" font-size="8" fill="#5a5a80">${p.lbl}</text>` : ''}`;
  }).join('');

  return `
    <svg viewBox="0 0 ${W} ${H}" style="width:100%;height:170px" xmlns="http://www.w3.org/2000/svg">
      ${refs}
      <polygon points="${area}" fill="${color}" opacity="0.07"/>
      <polyline points="${line}" stroke="${color}" stroke-width="2" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
      ${dots}
    </svg>`;
}

// ── METRICHE ──────────────────────────────────────────────────────────

function pageMetriche() {
  const { users, sessions, engagement } = state.data;
  const d = state.chart;

  const funnelSection = state.funnel
    ? state.funnel.map(s => mRow(s.step, s.numero, s.conv !== '—' ? `conv. ${s.conv}` : '')).join('')
    : `<tr><td colspan="3" style="font-size:12px;color:var(--muted);padding:12px 14px;font-style:italic">
        Vai su Funnel → Calcola per caricare i dati del funnel
      </td></tr>`;

  return `
    <div class="grid-2" style="margin-bottom:24px">
      <div class="card">
        <div class="card-title">Utenti Attivi — 14 giorni</div>
        ${barChart(d, 'active_users', '#60a5fa')}
      </div>
      <div class="card">
        <div class="card-title">Nuovi Utenti — 14 giorni</div>
        ${barChart(d, 'new_users', '#a78bfa')}
      </div>
    </div>

    <div class="card">
      <div class="card-title">Tutte le metriche</div>
      <div class="table-wrap" style="margin-top:12px">
        <table class="data-table">
          <thead><tr><th>Metrica</th><th>Valore</th><th>Note</th></tr></thead>
          <tbody>
            ${section('Utenti')}
            ${mRow('Registrati',          users.total,                    '')}
            ${mRow('Nuovi (7 giorni)',     users.new_7d,                   'beta test in corso')}
            ${mRow('Nuovi (30 giorni)',    users.new_30d,                  '')}
            ${mRow('Onboardati',          users.onboarded,                `${Math.round(users.onboarded/users.total*100)}% del totale`)}
            ${mRow('Premium paganti',      users.premium,                  `${users.premium_pct}% conversion rate · esclusi account interni`)}
            ${mRow('Free trial attivi',   users.trial,                    'abbonamento trial in corso')}
            ${section('Engagement')}
            ${mRow('DAU (oggi)',          engagement.dau,                 'utenti unici con workout oggi')}
            ${mRow('WAU (7g)',           engagement.wau,                 '')}
            ${mRow('MAU (30g)',          engagement.mau,                 '')}
            ${mRow('Streak attive',       engagement.active_streaks,      'ieri o oggi')}
            ${section('Workout')}
            ${mRow('Totali',              sessions.total,                 '')}
            ${mRow('Ultimi 7 giorni',     sessions.sessions_7d,           '')}
            ${mRow('Ultimi 30 giorni',    sessions.sessions_30d,          '')}
            ${mRow('Durata media',        sessions.avg_duration_min + ' min', 'workout completati')}
            ${mRow('Completion rate',     sessions.completion_pct + '%',  '')}
            ${section(`Funnel (${state.funnelFrom} → ${state.funnelTo})`)}
            ${funnelSection}
          </tbody>
        </table>
      </div>
    </div>`;
}

function section(title) {
  return `<tr><td colspan="3" style="font-size:10px;text-transform:uppercase;letter-spacing:.8px;color:var(--muted);padding:16px 14px 6px;font-weight:600">${title}</td></tr>`;
}

// ── PREMIUM ───────────────────────────────────────────────────────────

const PREMIUM_SOURCE_LABELS = {
  'shop_ai_coach':          'AI Coach (Shop)',
  'ai_chat_quota_exhausted':'AI Coach (quota)',
  'roadmap_premium_locked': 'Roadmap bloccato',
  'post_workout':           'Post allenamento',
  'onboarding_premium_step':'Onboarding',
  'keys_popup_premium':     'Popup chiavi',
  'unknown':                'Sconosciuto',
};

function pagePremium() {
  if (state.premiumLoading) return `<div class="card" style="padding:60px;text-align:center;color:var(--muted)">Caricamento dati premium...</div>`;
  if (state.premiumError)   return `<div class="card" style="color:var(--red);padding:24px">${state.premiumError}</div>`;
  if (!state.premiumData)   return `<div class="card" style="padding:60px;text-align:center;color:var(--muted)">Nessun dato</div>`;

  const d = state.premiumData;
  const f = d.funnel;
  const trialToPaywall = f.trial_shown  > 0 ? (f.paywall_views   / f.trial_shown   * 100).toFixed(1) : '0.0';
  const paywallToBuy   = f.paywall_views > 0 ? (f.purchase_attempts / f.paywall_views * 100).toFixed(1) : '0.0';
  const totalBillingErr   = (d.billing_errors  || []).reduce((s, e) => s + e.n, 0);
  const totalPurchaseErr  = (d.purchase_errors || []).reduce((s, e) => s + e.n, 0);
  const hasRealErrors = totalBillingErr > 0 || totalPurchaseErr > 0;

  return `
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:20px;flex-wrap:wrap">
      <div>
        <div class="card-title" style="font-size:20px;margin-bottom:2px">Premium</div>
        <div style="font-size:11px;color:var(--muted)">Account interni esclusi · dati reali utenti</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <span class="filter-label">Periodo</span>
        <input type="date" id="premium-from" class="form-input" value="${state.premiumFrom}"
          style="width:145px;padding:5px 10px;font-size:12px">
        <span style="color:var(--muted);font-size:13px">→</span>
        <input type="date" id="premium-to" class="form-input" value="${state.premiumTo}"
          style="width:145px;padding:5px 10px;font-size:12px">
        <button id="premium-apply" class="btn btn-primary" style="padding:6px 16px;font-size:12px">Calcola</button>
        <button class="btn btn-ghost" id="premium-refresh" style="font-size:11px;padding:6px 12px">↻</button>
      </div>
    </div>
    <div style="font-size:11px;color:var(--muted);margin-bottom:16px">
      ${state.premiumFrom} → ${state.premiumTo}
    </div>

    <!-- KPI row -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:16px">
      ${premiumKpi('Abbonati attivi', d.active_premium, null, d.active_premium > 0 ? '#4ade80' : 'var(--muted)', d.active_premium > 0 ? '✓ live' : '⏳ in arrivo')}
      ${premiumKpi('Trial mostrati', f.trial_shown, 'utenti unici', '#22d3ee', 'offerta mostrata (es. post-workout)')}
      ${premiumKpi('Paywall aperto', f.paywall_views, 'utenti unici', '#a78bfa', f.trial_shown > 0 ? trialToPaywall + '% ha cliccato' : 'da paywall_open')}
      ${premiumKpi('Tentato acquisto', f.purchase_attempts, null, f.purchase_attempts > 0 ? '#f59e0b' : 'var(--muted)', f.paywall_views > 0 ? paywallToBuy + '% CTR sul paywall' : null)}
    </div>

    <!-- Conversion funnel -->
    <div class="card" style="margin-bottom:16px">
      <div class="card-title" style="margin-bottom:18px">Funnel di conversione</div>
      ${premiumFunnelViz(f)}
    </div>

    <!-- Trial sources + Purchase sources side by side -->
    <div class="grid-2" style="margin-bottom:16px">
      <div class="card">
        <div class="card-title" style="margin-bottom:14px">Da dove viene mostrato il trial</div>
        <div style="font-size:11px;color:var(--muted);margin-bottom:12px">trigger dell'offerta · top of funnel</div>
        ${premiumSourcesChart(d.trial_sources, 'utenti', 'eventi')}
      </div>
      <div class="card">
        <div class="card-title" style="margin-bottom:14px">Da dove si tenta l'acquisto</div>
        <div style="font-size:11px;color:var(--muted);margin-bottom:12px">sorgente al tentativo di acquisto</div>
        ${premiumSourcesChart(d.sources, 'utenti', 'tentativi')}
      </div>
    </div>

    <!-- Purchasers list -->
    ${premiumPurchasersCard(d.purchasers)}

    <!-- Behavior panel -->
    <div class="card" style="margin-bottom:16px">
      <div class="card-title" style="margin-bottom:14px">Comportamento post-paywall</div>
      <div style="font-size:11px;color:var(--muted);margin-bottom:12px">fallback aperto · onboarding saltato</div>
      ${premiumBehaviorPanel(f, d.fallback_sources)}
    </div>

    <!-- Errors panel -->
    ${hasRealErrors ? premiumErrorsCard(d.billing_errors, d.purchase_errors) : `
    <div class="card" style="margin-bottom:16px;border-color:#1a3a1a">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:18px">✓</span>
        <div>
          <div style="font-size:13px;font-weight:600;color:#4ade80">Nessun errore rilevato (utenti reali)</div>
          <div style="font-size:11px;color:var(--muted);margin-top:2px">Gli errori BILLING_UNAVAILABLE erano tutti da sessioni di test interne</div>
        </div>
      </div>
    </div>`}

    <!-- Subscriptions timeline -->
    ${premiumPurchasesCard(d.recent_purchases)}

    <!-- Excluded accounts -->
    ${premiumExcludedCard(d.excluded_accounts)}
  `;
}

function premiumKpi(label, value, sub, color, note) {
  return `
    <div class="card" style="padding:16px 18px">
      <div style="font-size:11px;color:var(--muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:.05em">${label}</div>
      <div style="font-size:30px;font-weight:800;color:${color};line-height:1">${value}</div>
      ${sub  ? `<div style="font-size:11px;color:var(--muted);margin-top:4px">${sub}</div>` : ''}
      ${note ? `<div style="font-size:11px;color:var(--muted);margin-top:6px;padding-top:6px;border-top:1px solid #2a2a3d">${note}</div>` : ''}
    </div>`;
}

const FUNNEL_ALL_STEPS = [
  { key: 'trial_shown_total', label: 'Offerta mostrata',  color: '#0891b2', field: 'trial_shown_total', sub: 'volte totali' },
  { key: 'trial_shown',       label: 'Utenti raggiunti',  color: '#22d3ee', field: 'trial_shown',       sub: 'utenti unici' },
  { key: 'paywall_views',     label: 'Paywall aperto',    color: '#a78bfa', field: 'paywall_views',      sub: null },
  { key: 'purchase_attempts', label: 'Tentato acquisto',  color: '#f59e0b', field: 'purchase_attempts',  sub: null },
  { key: 'premium_activated', label: 'Premium attivato',  color: '#4ade80', field: 'premium_activated',  sub: null },
];

function premiumFunnelViz(f) {
  const active = FUNNEL_ALL_STEPS.filter(s => state.premiumFunnelSteps.has(s.key));

  const toggles = FUNNEL_ALL_STEPS.map(s => {
    const on = state.premiumFunnelSteps.has(s.key);
    return `<button class="filter-btn ${on ? 'active' : ''}" data-funnel-step="${s.key}"
      style="border-color:${on ? s.color : ''};color:${on ? s.color : ''}">${s.label}</button>`;
  }).join('');

  const html = active.map((s, i) => {
    const n    = f[s.field] ?? 0;
    const prev = i > 0 ? (f[active[i-1].field] ?? 0) : null;
    const top  = f[active[0].field] ?? 0;
    const drop = prev > 0 ? ((1 - n / prev) * 100).toFixed(0) : null;
    const pct  = i === 0 ? null : (top > 0 ? (n / top * 100).toFixed(1) + '% del totale' : '—');
    const note = s.sub ?? (pct || null);
    return `
      ${i > 0 ? `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 6px;min-width:48px">
        ${drop !== null ? `<div style="font-size:10px;color:#ef4444;font-weight:700;white-space:nowrap">-${drop}%</div>` : ''}
        <div style="font-size:20px;color:#2a2a3d;margin-top:-2px">→</div>
      </div>` : ''}
      <div style="flex:1;background:#111120;border:1px solid ${s.color}33;border-radius:10px;padding:14px 10px;text-align:center;min-width:0">
        <div style="font-size:26px;font-weight:800;color:${s.color};line-height:1">${n}</div>
        <div style="font-size:11px;color:var(--fg);margin-top:5px;font-weight:500">${s.label}</div>
        ${note ? `<div style="font-size:10px;color:var(--muted);margin-top:3px">${note}</div>` : ''}
      </div>`;
  }).join('');

  return `
    <div style="display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap">${toggles}</div>
    <div style="display:flex;align-items:center">${html || '<div style="color:var(--muted);font-size:12px">Seleziona almeno uno step</div>'}</div>`;
}

function premiumSourcesChart(sources, userCol = 'utenti', countCol = 'tentativi') {
  if (!sources?.length) return `<div style="color:var(--muted);font-size:12px">Nessun dato registrato</div>`;
  const maxT = Math.max(...sources.map(s => s[countCol] ?? 0), 1);
  return sources.map(s => {
    const label    = PREMIUM_SOURCE_LABELS[s.source] || s.source;
    const count    = s[countCol] ?? 0;
    const users    = s[userCol]  ?? 0;
    const pct      = Math.round(count / maxT * 100);
    const barColor = s.source.includes('ai') || s.source.includes('coach') ? '#a78bfa'
                   : s.source.includes('roadmap') ? '#f59e0b'
                   : s.source.includes('workout') ? '#4ade80'
                   : '#60a5fa';
    return `
      <div style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px">
          <div style="font-size:12px;color:var(--fg)">${label}</div>
          <div style="font-size:11px;color:var(--muted)">${count} eventi · ${users} utenti</div>
        </div>
        <div style="background:#1a1a2e;border-radius:3px;height:6px">
          <div style="background:${barColor};border-radius:3px;height:6px;width:${pct}%;transition:width .3s"></div>
        </div>
      </div>`;
  }).join('');
}

function premiumBehaviorPanel(f, fallbackSources) {
  const items = [
    { icon: '⚠', label: 'Utenti con paywall fallback', value: f.fallback_users, color: '#f59e0b',
      note: 'offer_token assente — il billing non carica correttamente' },
    { icon: '✕', label: 'Chiusura X (onboarding paywall)', value: f.onboarding_skip, color: 'var(--muted)', note: null },
    ...(f.paywall_close > 0 ? [{ icon: '✕', label: 'Chiusura X (paywall principale)', value: f.paywall_close, color: '#ef4444', note: null }] : []),
  ];
  return `
    ${items.map(item => `
      <div style="display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid #1a1a2e">
        <div style="font-size:18px;width:24px;text-align:center;flex-shrink:0;margin-top:1px">${item.icon}</div>
        <div style="flex:1">
          <div style="display:flex;justify-content:space-between">
            <div style="font-size:12px;color:var(--fg)">${item.label}</div>
            <div style="font-size:16px;font-weight:700;color:${item.color}">${item.value}</div>
          </div>
          ${item.note ? `<div style="font-size:11px;color:var(--muted);margin-top:2px">${item.note}</div>` : ''}
        </div>
      </div>`).join('')}
    ${fallbackSources?.length ? `
      <div style="margin-top:12px">
        <div style="font-size:11px;color:var(--muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:.05em">Fallback per sorgente</div>
        ${fallbackSources.map(s => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;font-size:11px">
            <span style="color:var(--muted)">${PREMIUM_SOURCE_LABELS[s.source] || s.source}</span>
            <span style="color:#f59e0b;font-weight:600">${s.n}×</span>
          </div>`).join('')}
      </div>` : ''}`;
}

function premiumErrorsCard(billingErrors, purchaseErrors) {
  const errorLevelColor = (errore) => {
    if (errore.includes('non disponibile') || errore.includes('inizializzato')) return '#ef4444';
    if (errore.includes('annullato') || errore.includes('acquistato')) return '#f59e0b';
    return '#60a5fa';
  };
  const phaseColor = (fase) => {
    if (fase === 'not_initialized' || fase === 'unverified') return '#ef4444';
    if (fase === 'pending_timeout' || fase === 'verify_rpc_failed') return '#f59e0b';
    return '#60a5fa';
  };

  return `
    <div class="card" style="margin-bottom:16px;border-color:#3a1a1a">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
        <span style="font-size:16px">⚠</span>
        <div class="card-title" style="margin-bottom:0;color:#ef4444">Errori rilevati (utenti reali)</div>
      </div>
      <div class="grid-2">
        <div>
          <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px">Billing errors</div>
          ${(billingErrors || []).map(e => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:7px 10px;background:#111120;border-radius:6px;margin-bottom:6px;border-left:3px solid ${errorLevelColor(e.errore)}">
              <div style="font-size:11px;color:var(--fg)">${e.errore}</div>
              <div style="font-size:14px;font-weight:700;color:${errorLevelColor(e.errore)};margin-left:12px;flex-shrink:0">${e.n}×</div>
            </div>`).join('') || '<div style="font-size:11px;color:var(--muted)">Nessuno</div>'}
        </div>
        <div>
          <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px">Purchase errors</div>
          ${(purchaseErrors || []).map(e => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:7px 10px;background:#111120;border-radius:6px;margin-bottom:6px;border-left:3px solid ${phaseColor(e.fase)}">
              <div>
                <div style="font-size:11px;color:var(--fg)">${e.fase}</div>
                ${e.msg ? `<div style="font-size:10px;color:var(--muted);margin-top:1px">${e.msg.slice(0,60)}</div>` : ''}
              </div>
              <div style="font-size:14px;font-weight:700;color:${phaseColor(e.fase)};margin-left:12px;flex-shrink:0">${e.n}×</div>
            </div>`).join('') || '<div style="font-size:11px;color:var(--muted)">Nessuno</div>'}
        </div>
      </div>
    </div>`;
}

function premiumPurchasersCard(purchasers) {
  if (!purchasers?.length) return `
    <div class="card" style="margin-bottom:16px">
      <div class="card-title" style="margin-bottom:10px">Chi ha tentato l'acquisto</div>
      <div style="color:var(--muted);font-size:12px;padding:16px 0">Nessun tentativo di acquisto nel periodo selezionato</div>
    </div>`;

  const SOURCE_SHORT = {
    'shop_ai_coach':          'AI Coach',
    'ai_chat_quota_exhausted':'AI quota',
    'roadmap_premium_locked': 'Roadmap',
    'post_workout':           'Post workout',
    'onboarding_premium_step':'Onboarding',
    'keys_popup_premium':     'Chiavi',
    'unknown':                '—',
  };

  return `
    <div class="card" style="margin-bottom:16px">
      <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:14px">
        <div class="card-title" style="margin-bottom:0">Chi ha tentato l'acquisto</div>
        <div style="font-size:11px;color:var(--muted)">${purchasers.length} utent${purchasers.length === 1 ? 'e' : 'i'} · esclusi account interni</div>
      </div>
      <div style="overflow-x:auto">
        <table style="width:100%;font-size:12px;border-collapse:collapse">
          <thead>
            <tr style="color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.05em">
              <th style="text-align:left;padding:6px 10px;border-bottom:1px solid #1a1a2e">Utente</th>
              <th style="text-align:left;padding:6px 10px;border-bottom:1px solid #1a1a2e">Email</th>
              <th style="text-align:center;padding:6px 10px;border-bottom:1px solid #1a1a2e">Tentativi</th>
              <th style="text-align:center;padding:6px 10px;border-bottom:1px solid #1a1a2e">Errori</th>
              <th style="text-align:center;padding:6px 10px;border-bottom:1px solid #1a1a2e">Attivato</th>
              <th style="text-align:left;padding:6px 10px;border-bottom:1px solid #1a1a2e">Prodotto</th>
              <th style="text-align:left;padding:6px 10px;border-bottom:1px solid #1a1a2e">Via</th>
              <th style="text-align:left;padding:6px 10px;border-bottom:1px solid #1a1a2e">Primo tentativo</th>
            </tr>
          </thead>
          <tbody>
            ${purchasers.map(p => {
              const hasErr   = (p.billing_err + p.purchase_err) > 0;
              const attivato = p.attivazioni > 0;
              const prodotto = p.prodotto === 'premium_yearly' ? 'Annuale' : p.prodotto === 'premium_monthly' ? 'Mensile' : p.prodotto || '—';
              const prodColor = p.prodotto === 'premium_yearly' ? '#a78bfa' : '#4ade80';
              return `
                <tr style="border-bottom:1px solid #111120">
                  <td style="padding:10px 10px">
                    <div style="font-weight:600;color:var(--fg)">${p.nome || '—'}</div>
                  </td>
                  <td style="padding:10px 10px;color:var(--muted);font-family:monospace;font-size:11px">${p.email}</td>
                  <td style="padding:10px 10px;text-align:center">
                    <span style="font-weight:700;color:${p.tentativi > 3 ? '#f59e0b' : 'var(--fg)'}">${p.tentativi}</span>
                  </td>
                  <td style="padding:10px 10px;text-align:center">
                    ${hasErr
                      ? `<span style="font-weight:700;color:#ef4444">${p.billing_err + p.purchase_err}</span>`
                      : `<span style="color:var(--muted)">—</span>`}
                  </td>
                  <td style="padding:10px 10px;text-align:center">
                    ${attivato
                      ? `<span style="color:#4ade80;font-size:15px">✓</span>`
                      : `<span style="color:#2a2a3d;font-size:13px">✗</span>`}
                  </td>
                  <td style="padding:10px 10px">
                    ${p.prodotto
                      ? `<span style="font-size:10px;padding:2px 7px;border-radius:4px;background:${prodColor}22;color:${prodColor}">${prodotto}</span>`
                      : '<span style="color:var(--muted)">—</span>'}
                  </td>
                  <td style="padding:10px 10px;color:var(--muted);font-size:11px">${SOURCE_SHORT[p.sorgente] || p.sorgente || '—'}</td>
                  <td style="padding:10px 10px;color:var(--muted);font-size:11px;white-space:nowrap">${p.primo_tentativo || '—'}</td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

function premiumPurchasesCard(purchases) {
  const ET_LABEL = {
    'SUBSCRIPTION_PURCHASED': 'Acquistato',
    'SUBSCRIPTION_RENEWED':   'Rinnovato',
    'SUBSCRIPTION_CANCELED':  'Annullato',
    'SUBSCRIPTION_EXPIRED':   'Scaduto',
    'SUBSCRIPTION_REVOKED':   'Revocato',
    'CLIENT_VERIFIED':        'Verificato (app)',
  };
  const ET_COLOR = {
    'SUBSCRIPTION_PURCHASED': '#4ade80',
    'SUBSCRIPTION_RENEWED':   '#60a5fa',
    'SUBSCRIPTION_CANCELED':  '#f59e0b',
    'SUBSCRIPTION_EXPIRED':   '#ef4444',
    'SUBSCRIPTION_REVOKED':   '#ef4444',
    'CLIENT_VERIFIED':        '#a78bfa',
  };
  const CANCEL_REASON = { 0: 'utente', 1: 'sviluppatore', 2: 'pagamento' };

  return `
    <div class="card" style="margin-bottom:16px">
      <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:14px">
        <div class="card-title" style="margin-bottom:0">Abbonamenti reali</div>
        <div style="font-size:11px;color:var(--muted)">Esclusi sandbox &lt; 2h · esclusi account interni</div>
      </div>
      ${!purchases?.length ? `
        <div style="text-align:center;padding:32px 20px">
          <div style="font-size:32px;margin-bottom:10px">🚀</div>
          <div style="color:var(--fg);font-size:14px;font-weight:600;margin-bottom:6px">Nessun abbonamento esterno ancora</div>
          <div style="color:var(--muted);font-size:12px">Il primo abbonato reale comparirà qui automaticamente</div>
        </div>` : `
        <div style="overflow-x:auto">
          <table style="width:100%;font-size:12px;border-collapse:collapse">
            <thead>
              <tr style="color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.05em">
                <th style="text-align:left;padding:6px 10px;border-bottom:1px solid #1a1a2e">Data</th>
                <th style="text-align:left;padding:6px 10px;border-bottom:1px solid #1a1a2e">Prodotto</th>
                <th style="text-align:left;padding:6px 10px;border-bottom:1px solid #1a1a2e">Evento</th>
                <th style="text-align:left;padding:6px 10px;border-bottom:1px solid #1a1a2e">Valido fino</th>
                <th style="text-align:left;padding:6px 10px;border-bottom:1px solid #1a1a2e">Note</th>
              </tr>
            </thead>
            <tbody>
              ${purchases.map(p => `
                <tr style="border-bottom:1px solid #111120">
                  <td style="padding:8px 10px;color:var(--muted);white-space:nowrap">${p.created_fmt}</td>
                  <td style="padding:8px 10px">
                    <span style="font-size:10px;padding:2px 7px;border-radius:4px;
                      background:${p.product_id==='premium_yearly'?'#1a1a40':'#1a2a1a'};
                      color:${p.product_id==='premium_yearly'?'#a78bfa':'#4ade80'}">
                      ${p.product_id === 'premium_yearly' ? 'Annuale' : 'Mensile'}
                    </span>
                  </td>
                  <td style="padding:8px 10px;white-space:nowrap">
                    <span style="color:${ET_COLOR[p.event_type]||'var(--muted)'};font-weight:600">
                      ${ET_LABEL[p.event_type] || p.event_type}
                    </span>
                  </td>
                  <td style="padding:8px 10px;color:var(--muted)">${p.expires_date || '—'}</td>
                  <td style="padding:8px 10px;color:var(--muted);font-size:11px">
                    ${p.cancel_reason !== null ? 'Annullato da: ' + (CANCEL_REASON[p.cancel_reason] ?? p.cancel_reason) : ''}
                    ${p.is_trial ? '🧪 trial' : ''}
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`}
    </div>`;
}

function premiumExcludedCard(accounts) {
  if (!accounts?.length) return '';
  return `
    <details style="margin-bottom:16px">
      <summary style="cursor:pointer;padding:12px 16px;background:#0d0d19;border:1px solid #2a2a3d;border-radius:10px;
        font-size:12px;color:var(--muted);list-style:none;display:flex;align-items:center;gap:8px;user-select:none">
        <span style="font-size:14px">🔒</span>
        <span><strong style="color:var(--fg)">${accounts.length} account interni esclusi</strong> da tutti i conteggi — clicca per vedere</span>
      </summary>
      <div style="border:1px solid #2a2a3d;border-top:none;border-radius:0 0 10px 10px;overflow:hidden">
        <table style="width:100%;font-size:12px;border-collapse:collapse">
          <thead>
            <tr style="background:#111120;color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.05em">
              <th style="text-align:left;padding:8px 14px">Nome</th>
              <th style="text-align:left;padding:8px 14px">Email</th>
              <th style="text-align:left;padding:8px 14px">Registrato</th>
              <th style="text-align:left;padding:8px 14px">Motivo esclusione</th>
            </tr>
          </thead>
          <tbody>
            ${accounts.map(a => {
              const motivo = a.email.includes('hypemove') ? 'dominio @hypemove'
                           : a.email.includes('test')    ? 'email con "test"'
                           : 'email con "carlisi"';
              return `
                <tr style="border-top:1px solid #1a1a2e">
                  <td style="padding:8px 14px;color:var(--fg)">${a.nome || '—'}</td>
                  <td style="padding:8px 14px;color:var(--muted);font-family:monospace;font-size:11px">${a.email}</td>
                  <td style="padding:8px 14px;color:var(--muted)">${a.registrato}</td>
                  <td style="padding:8px 14px">
                    <span style="font-size:10px;padding:2px 8px;border-radius:4px;background:#1a1a30;color:#60a5fa">${motivo}</span>
                  </td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </details>`;
}

// ── SPRINT ────────────────────────────────────────────────────────────

function pageSprint() {
  const sprints = state.sprints;

  const formHtml = state.sprintFormOpen ? `
    <div style="background:var(--surface2);border-radius:10px;padding:16px;margin-bottom:20px">
      <div style="font-size:12px;font-weight:700;color:var(--text);margin-bottom:14px">
        ${state.sprintEditingId ? '✏ Modifica sprint' : '+ Nuovo sprint'}
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:12px">
        <div style="flex:1;min-width:180px">
          <div style="font-size:11px;color:var(--muted);margin-bottom:4px">Nome</div>
          <input id="sprint-form-nome" class="form-input" value="${state.sprintForm.nome}"
            placeholder="es. Sprint 4 — Retention" style="width:100%;font-size:12px;padding:6px 10px">
        </div>
        <div>
          <div style="font-size:11px;color:var(--muted);margin-bottom:4px">Inizio</div>
          <input id="sprint-form-inizio" type="date" class="form-input" value="${state.sprintForm.inizio}"
            style="font-size:12px;padding:6px 10px">
        </div>
        <div>
          <div style="font-size:11px;color:var(--muted);margin-bottom:4px">Fine</div>
          <input id="sprint-form-fine" type="date" class="form-input" value="${state.sprintForm.fine}"
            style="font-size:12px;padding:6px 10px">
        </div>
      </div>
      <div style="margin-bottom:14px">
        <div style="font-size:11px;color:var(--muted);margin-bottom:4px">Note</div>
        <textarea id="sprint-form-note" class="form-input"
          placeholder="Obiettivi, contesto, cosa abbiamo testato…"
          style="width:100%;font-size:12px;padding:8px 10px;resize:vertical;min-height:80px;font-family:inherit;line-height:1.5">${state.sprintForm.note || ''}</textarea>
      </div>
      <div style="display:flex;gap:8px">
        <button id="sprint-form-save" class="btn btn-primary" style="font-size:12px;padding:6px 16px">
          ${state.sprintEditingId ? '✓ Aggiorna' : 'Crea sprint'}
        </button>
        <button id="sprint-form-cancel" class="btn btn-ghost" style="font-size:12px;padding:6px 12px">Annulla</button>
      </div>
    </div>` : '';

  const listHtml = !sprints.length
    ? `<div class="empty" style="padding:40px 20px">
        <div class="empty-icon">🏃</div>
        <div class="empty-text" style="color:var(--muted)">Nessuno sprint. Creane uno!</div>
      </div>`
    : `<div>
        ${sprints.map((s, i) => {
          const days  = Math.round((new Date(s.fine) - new Date(s.inizio)) / 86400000) + 1;
          const color = SPRINT_COLORS[i % SPRINT_COLORS.length];
          return `
            <div style="padding:16px 0;border-bottom:1px solid var(--border);display:flex;flex-direction:column;gap:8px">
              <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">
                <div style="display:flex;align-items:flex-start;gap:12px">
                  <div style="width:12px;height:12px;border-radius:50%;background:${color};flex-shrink:0;margin-top:3px"></div>
                  <div>
                    <div style="font-weight:700;font-size:14px;color:var(--text);margin-bottom:3px">${s.nome}</div>
                    <div style="font-size:11px;color:var(--muted);font-family:var(--mono)">${s.inizio} → ${s.fine} · ${days} giorni</div>
                  </div>
                </div>
                <div style="display:flex;gap:6px;flex-shrink:0">
                  <button class="btn btn-ghost sprint-edit" data-id="${s.id}"
                    style="font-size:11px;padding:4px 10px">✏ Modifica</button>
                  <button class="btn btn-ghost sprint-delete" data-id="${s.id}"
                    style="font-size:11px;padding:4px 10px;color:var(--red)">✕</button>
                </div>
              </div>
              ${s.note ? `<div style="margin-left:24px;font-size:12px;color:var(--muted);line-height:1.6;white-space:pre-wrap">${s.note}</div>` : ''}
            </div>`;
        }).join('')}
      </div>`;

  // ── Blocked users section ─────────────────────────────────────────
  const blocked = state.blockedUsers;
  const searchOpen = state.blockSearchOpen;

  const blockedSearchHtml = searchOpen ? `
    <div style="margin-bottom:20px">
      <input id="blocked-search" class="form-input" placeholder="Cerca per nome, username o email…"
        value="${esc(state.blockSearchQuery)}"
        style="width:100%;font-size:12px;padding:8px 12px;box-sizing:border-box" autocomplete="off">
      <div id="blocked-search-results"></div>
    </div>` : '';

  const blockedListHtml = blocked.length
    ? `<div>${blocked.map(u => `
        <div style="padding:12px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:12px">
          <div style="display:flex;align-items:center;gap:10px;min-width:0">
            <div style="width:8px;height:8px;border-radius:50%;background:#ef4444;flex-shrink:0"></div>
            <div style="min-width:0">
              <div style="font-size:13px;font-weight:600;color:var(--text)">${esc(u.nome || u.username || '—')} <span style="font-size:11px;font-weight:400;color:var(--muted)">@${esc(u.username || '')}</span></div>
              <div style="font-size:11px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(u.email || '')} · <span style="color:#60a5fa">${esc(u.motivo || '')}</span></div>
            </div>
          </div>
          <button class="btn btn-ghost blocked-remove" data-id="${u.id}"
            style="font-size:11px;padding:4px 10px;color:var(--red);flex-shrink:0">✕</button>
        </div>`).join('')}</div>`
    : `<div style="font-size:12px;color:var(--muted);padding:20px 0;text-align:center">Nessun account escluso.</div>`;

  const recentlyRemovedHtml = state.recentlyUnblocked.length ? `
    <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border)">
      <div style="font-size:11px;color:var(--muted);font-weight:600;letter-spacing:.05em;text-transform:uppercase;margin-bottom:10px">Rimossi di recente</div>
      ${state.recentlyUnblocked.map(u => `
        <div style="padding:8px 0;display:flex;align-items:center;justify-content:space-between;gap:12px">
          <div style="display:flex;align-items:center;gap:10px;min-width:0">
            <div style="width:8px;height:8px;border-radius:50%;background:#6b7280;flex-shrink:0"></div>
            <div style="min-width:0">
              <div style="font-size:13px;font-weight:600;color:var(--muted)">${esc(u.nome || u.username || '—')} <span style="font-size:11px;font-weight:400">@${esc(u.username || '')}</span></div>
              <div style="font-size:11px;color:var(--muted);opacity:.7;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(u.email || '')}</div>
            </div>
          </div>
          <button class="btn btn-ghost blocked-readd" data-user-id="${u.user_id}" data-username="${esc(u.username||'')}" data-email="${esc(u.email||'')}" data-nome="${esc(u.nome||'')}"
            style="font-size:11px;padding:4px 10px;flex-shrink:0">+ Riaggiungi</button>
        </div>`).join('')}
    </div>` : '';

  return `
    <div class="card">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:${state.sprintFormOpen ? '20px' : '16px'}">
        <div>
          <div class="card-title" style="margin-bottom:4px">Sprint</div>
          <div style="font-size:11px;color:var(--muted);line-height:1.5">Registro sprint con date e note. Il confronto dati è disponibile in Funnel e Retention.</div>
        </div>
        ${!state.sprintFormOpen ? `<button id="sprint-new" class="btn btn-primary" style="font-size:12px;padding:6px 14px;flex-shrink:0;margin-left:16px">+ Nuovo sprint</button>` : ''}
      </div>
      ${formHtml}
      ${listHtml}
    </div>

    <div class="card" style="margin-top:16px">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:${searchOpen ? '20px' : '16px'}">
        <div>
          <div class="card-title" style="margin-bottom:4px">Account esclusi dalle metriche</div>
          <div style="font-size:11px;color:var(--muted);line-height:1.5">Modifiche qui aggiornano Overview, Funnel, Retention, Premium e Comportamento.</div>
        </div>
        <button id="blocked-add-toggle" class="btn ${searchOpen ? 'btn-ghost' : 'btn-primary'}"
          style="font-size:12px;padding:6px 14px;flex-shrink:0;margin-left:16px">
          ${searchOpen ? '✕ Chiudi' : '+ Aggiungi'}
        </button>
      </div>
      ${blockedSearchHtml}
      ${blockedListHtml}
      ${recentlyRemovedHtml}
    </div>`;
}

// ── SPRINT COMPARE — FUNNEL ───────────────────────────────────────────

function sprintFunnelSection() {
  if (!state.sprints.length) return '';
  const isOpen = state.sprintFunnelOpen;

  const badge = state.sprintFunnelSel.length
    ? `<span style="background:var(--accent-lo);border:1px solid var(--accent);color:var(--purple);border-radius:20px;font-size:10px;padding:2px 9px;font-weight:600">${state.sprintFunnelSel.length} sel.</span>`
    : '';

  const headerEl = `
    <div id="sprint-funnel-toggle" style="display:flex;align-items:center;justify-content:space-between;cursor:pointer">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:14px;font-weight:700;color:var(--text)">Confronto Sprint</span>
        ${badge}
      </div>
      <span style="font-size:12px;color:var(--muted);font-weight:500">${isOpen ? '▲ Chiudi' : '▼ Apri'}</span>
    </div>`;

  if (!isOpen) {
    return `<div class="card" style="margin-top:16px;padding:14px 20px">${headerEl}</div>`;
  }

  const chips = state.sprints.map((s, i) => {
    const on    = state.sprintFunnelSel.includes(s.id);
    const color = SPRINT_COLORS[i % SPRINT_COLORS.length];
    return `<button class="sprint-funnel-chip" data-id="${s.id}"
      style="cursor:pointer;padding:5px 14px;font-size:12px;font-weight:600;border-radius:20px;border:1.5px solid;display:inline-flex;align-items:center;gap:6px;transition:all .15s;
        ${on ? 'background:var(--accent-lo);border-color:var(--accent);color:var(--purple)' : 'background:var(--surface2);border-color:#3a3a55;color:var(--text)'}">
      <span style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0"></span>
      ${on ? '✓ ' : ''}${s.nome}
    </button>`;
  }).join('');

  const hasData = Object.keys(state.sprintFunnelData).length > 0;
  const body = state.sprintFunnelLoading
    ? `<div class="empty" style="padding:28px 0"><div class="empty-icon pulse">🎯</div><div class="empty-text" style="color:var(--muted)">Calcolo...</div></div>`
    : state.sprintFunnelError
    ? `<div style="color:var(--red);font-size:13px;margin-top:4px">⚠️ ${state.sprintFunnelError}</div>`
    : !hasData ? ''
    : sprintFunnelCompareView();

  return `
    <div class="card" style="margin-top:16px">
      ${headerEl}
      <div style="margin-top:18px">
        <div style="margin-bottom:14px">
          <div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.6px;margin-bottom:10px">Sprint da confrontare</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px">${chips}</div>
        </div>
        <div style="display:flex;align-items:center;gap:12px">
          <button id="sprint-funnel-calc" class="btn btn-primary" style="font-size:12px;padding:6px 16px"
            ${!state.sprintFunnelSel.length ? 'disabled' : ''}>Calcola confronto</button>
          ${!hasData && !state.sprintFunnelLoading ? `<span style="font-size:12px;color:var(--muted)">Seleziona sprint e calcola</span>` : ''}
        </div>
        ${body ? `<div style="border-top:1px solid var(--border);margin-top:20px;padding-top:20px">${body}</div>` : ''}
      </div>
    </div>`;
}

function sprintFunnelCompareView() {
  const selected = state.sprints.filter(s => state.sprintFunnelSel.includes(s.id));
  if (!selected.length) return '';
  const legend = `<div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:18px">
    ${selected.map((s, i) => `
      <span style="display:inline-flex;align-items:center;gap:7px;font-size:12px">
        <span style="width:22px;height:3px;border-radius:2px;background:${SPRINT_COLORS[i % SPRINT_COLORS.length]}"></span>
        <span style="font-weight:600;color:var(--text)">${s.nome}</span>
        <span style="color:var(--muted)">${s.inizio} → ${s.fine}</span>
      </span>`).join('')}
  </div>`;
  return legend + sprintFunnelTable(selected, state.sprintFunnelData);
}

// ── SPRINT COMPARE — RETENTION ────────────────────────────────────────

function sprintRetSection() {
  if (!state.sprints.length) return '';
  const isOpen = state.sprintRetOpen;

  const badge = state.sprintRetSel.length
    ? `<span style="background:var(--accent-lo);border:1px solid var(--accent);color:var(--purple);border-radius:20px;font-size:10px;padding:2px 9px;font-weight:600">${state.sprintRetSel.length} sel.</span>`
    : '';

  const headerEl = `
    <div id="sprint-ret-toggle" style="display:flex;align-items:center;justify-content:space-between;cursor:pointer">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:14px;font-weight:700;color:var(--text)">Confronto Sprint</span>
        ${badge}
      </div>
      <span style="font-size:12px;color:var(--muted);font-weight:500">${isOpen ? '▲ Chiudi' : '▼ Apri'}</span>
    </div>`;

  if (!isOpen) {
    return `<div class="card" style="margin-top:16px;padding:14px 20px">${headerEl}</div>`;
  }

  const chips = state.sprints.map((s, i) => {
    const on    = state.sprintRetSel.includes(s.id);
    const color = SPRINT_COLORS[i % SPRINT_COLORS.length];
    return `<button class="sprint-ret-chip" data-id="${s.id}"
      style="cursor:pointer;padding:5px 14px;font-size:12px;font-weight:600;border-radius:20px;border:1.5px solid;display:inline-flex;align-items:center;gap:6px;transition:all .15s;
        ${on ? 'background:var(--accent-lo);border-color:var(--accent);color:var(--purple)' : 'background:var(--surface2);border-color:#3a3a55;color:var(--text)'}">
      <span style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0"></span>
      ${on ? '✓ ' : ''}${s.nome}
    </button>`;
  }).join('');

  const effMin   = state.sprintRetCustom ? state.sprintRetMin   : state.retMin;
  const effWeeks = state.sprintRetCustom ? state.sprintRetWeeks : state.retWeeks;
  const effMinW0 = state.sprintRetCustom ? state.sprintRetMinW0 : state.retMinW0;

  const paramsEl = state.sprintRetCustom ? `
    <div style="background:var(--surface2);border-radius:8px;padding:12px 14px;margin-bottom:14px;display:flex;flex-wrap:wrap;align-items:center;gap:12px">
      <div style="display:flex;align-items:center;gap:6px">
        <span style="font-size:11px;color:var(--muted);white-space:nowrap">Retained se</span>
        <select id="sprint-ret-min" class="form-select" style="font-size:12px;padding:4px 8px">
          ${Array.from({length:10},(_,n)=>`<option value="${n+1}" ${state.sprintRetMin===n+1?'selected':''}>≥${n+1} wkt/sett.</option>`).join('')}
        </select>
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        <span style="font-size:11px;color:var(--muted);white-space:nowrap">Eligible</span>
        <select id="sprint-ret-min-w0" class="form-select" style="font-size:12px;padding:4px 8px">
          ${[1,2,3,4,5].map(n=>`<option value="${n}" ${state.sprintRetMinW0===n?'selected':''}>≥${n} in W0</option>`).join('')}
        </select>
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        <span style="font-size:11px;color:var(--muted);white-space:nowrap">Settimane</span>
        <select id="sprint-ret-weeks" class="form-select" style="font-size:12px;padding:4px 8px">
          ${[2,4,6,8,12].map(w=>`<option value="${w}" ${state.sprintRetWeeks===w?'selected':''}>W${w}</option>`).join('')}
        </select>
      </div>
      <button id="sprint-ret-reset" class="btn btn-ghost" style="font-size:11px;padding:4px 10px;color:var(--muted);white-space:nowrap">↺ Ripristina</button>
    </div>` : `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;flex-wrap:wrap">
      <span style="font-size:12px;color:var(--muted)">Parametri: <strong style="color:var(--text);font-weight:600">≥${effMin} wkt/sett · eligible ≥${effMinW0} in W0 · ${effWeeks} sett.</strong></span>
      <button id="sprint-ret-customize" class="btn btn-ghost" style="font-size:11px;padding:4px 10px;white-space:nowrap">⚙ Personalizza</button>
    </div>`;

  const hasData = Object.keys(state.sprintRetData).length > 0;
  const body = state.sprintRetLoading
    ? `<div class="empty" style="padding:28px 0"><div class="empty-icon pulse">🔄</div><div class="empty-text" style="color:var(--muted)">Calcolo...</div></div>`
    : state.sprintRetError
    ? `<div style="color:var(--red);font-size:13px;margin-top:4px">⚠️ ${state.sprintRetError}</div>`
    : !hasData ? ''
    : sprintRetCompareView();

  return `
    <div class="card" style="margin-top:16px">
      ${headerEl}
      <div style="margin-top:18px">
        <div style="margin-bottom:14px">
          <div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.6px;margin-bottom:10px">Sprint da confrontare</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px">${chips}</div>
        </div>
        ${paramsEl}
        <div style="display:flex;align-items:center;gap:12px">
          <button id="sprint-ret-calc" class="btn btn-primary" style="font-size:12px;padding:6px 16px"
            ${!state.sprintRetSel.length ? 'disabled' : ''}>Calcola confronto</button>
          ${!hasData && !state.sprintRetLoading ? `<span style="font-size:12px;color:var(--muted)">Seleziona sprint e calcola</span>` : ''}
        </div>
        ${body ? `<div style="border-top:1px solid var(--border);margin-top:20px;padding-top:20px">${body}</div>` : ''}
      </div>
    </div>`;
}

function sprintRetCompareView() {
  const selected = state.sprints.filter(s => state.sprintRetSel.includes(s.id));
  if (!selected.length) return '';
  const legend = `<div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:18px">
    ${selected.map((s, i) => `
      <span style="display:inline-flex;align-items:center;gap:7px;font-size:12px">
        <span style="width:22px;height:3px;border-radius:2px;background:${SPRINT_COLORS[i % SPRINT_COLORS.length]}"></span>
        <span style="font-weight:600;color:var(--text)">${s.nome}</span>
        <span style="color:var(--muted)">${s.inizio} → ${s.fine}</span>
      </span>`).join('')}
  </div>`;
  return legend + sprintRetentionChart(selected, state.sprintRetData) + '<div style="margin-top:16px">' + sprintRetentionTable(selected, state.sprintRetData) + '</div>';
}

function sprintRetentionChart(selected, dataMap) {
  const allData  = selected.map(s => dataMap[s.id] || []);
  const maxWeeks = Math.max(...allData.map(d => d.length), 2);
  const W = 800, H = 260, PT = 50, PB = 30, PL = 42, PR = 20;
  const cW = W - PL - PR, cH = H - PT - PB;

  const series = selected.map((s, si) => {
    const data  = dataMap[s.id] || [];
    const color = SPRINT_COLORS[si % SPRINT_COLORS.length];
    const dash  = SPRINT_DASHES[si % SPRINT_DASHES.length];
    const pts   = data.map((r, i) => ({
      x: PL + (i / Math.max(maxWeeks - 1, 1)) * cW,
      y: PT + cH - (Number(r.retention_pct) / 100) * cH,
      pct: Number(r.retention_pct),
    }));
    if (!pts.length) return '';
    const poly   = pts.map(p => `${p.x},${p.y}`).join(' ');
    const lblOff = 11 + si * 13;
    const dots   = pts.map(p =>
      `<circle cx="${p.x}" cy="${p.y}" r="5" fill="${color}" stroke="#0d0d14" stroke-width="2"/>
       <text x="${p.x}" y="${p.y - lblOff}" text-anchor="middle" font-size="9.5" fill="${color}" font-weight="700">${p.pct}%</text>`
    ).join('');
    return `<polyline points="${poly}" stroke="${color}" stroke-width="2.5" fill="none"
              stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="${dash}"/>
            ${dots}`;
  }).join('');

  const refs = [0, 25, 50, 75, 100].map(p => {
    const y = PT + cH - (p / 100) * cH;
    return `<line x1="${PL}" y1="${y}" x2="${W-PR}" y2="${y}" stroke="#1d1d2e" stroke-width="1"/>
            <text x="${PL-5}" y="${y+3}" text-anchor="end" font-size="8" fill="#5a5a80">${p}%</text>`;
  }).join('');

  const xLabels = Array.from({ length: maxWeeks }, (_, i) =>
    `<text x="${PL + (i / Math.max(maxWeeks - 1, 1)) * cW}" y="${H - 6}" text-anchor="middle" font-size="9" fill="#6b6b90">${i === 0 ? 'W0' : `W${i}`}</text>`
  ).join('');

  return `
    <div style="background:var(--surface2);border-radius:10px;padding:16px 20px;margin-bottom:4px">
      <div style="font-size:10px;color:var(--muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:.6px">
        Curva di retention comparata
      </div>
      <svg viewBox="0 0 ${W} ${H}" style="width:100%;height:${H}px" xmlns="http://www.w3.org/2000/svg">
        ${refs}${series}${xLabels}
      </svg>
    </div>`;
}

function sprintFunnelTable(selected, dataMap) {
  const cfg    = state.funnelConfig;
  const colors = selected.map((_, i) => SPRINT_COLORS[i % SPRINT_COLORS.length]);

  const headers = selected.map((s, i) => `
    <th style="text-align:right;padding:10px 16px;white-space:nowrap">
      <div style="display:inline-flex;align-items:center;gap:6px">
        <span style="width:10px;height:10px;border-radius:50%;background:${colors[i]};flex-shrink:0"></span>
        <span>${s.nome}</span>
      </div>
      <div style="font-size:10px;font-weight:400;color:var(--muted);margin-top:2px">${s.inizio} → ${s.fine}</div>
    </th>`
  ).join('');

  const rows = cfg.map((row, i) => {
    const label = FUNNEL_LABELS[row.stepIdx] || '';
    const nums  = selected.map(s => Number((dataMap[s.id] || [])[row.stepIdx]?.numero ?? -1));
    const maxN  = Math.max(...nums.filter(n => n >= 0), 0);

    const cells = selected.map((s, si) => {
      const data = dataMap[s.id] || [];
      const num  = Number(data[row.stepIdx]?.numero ?? 0);
      const vsN  = row.vsIdx !== null && row.vsIdx >= 0 && row.vsIdx < i
        ? Number(data[cfg[row.vsIdx].stepIdx]?.numero ?? 0)
        : null;
      const convPct   = vsN !== null && vsN > 0 ? (num / vsN * 100) : null;
      const convStr   = convPct !== null ? convPct.toFixed(1) + '%' : '—';
      const convColor = convPct === null ? '' : convPct >= 50 ? 'var(--mattia)' : convPct >= 25 ? 'var(--amber)' : 'var(--red)';
      const isBest    = num === maxN && maxN > 0;
      const barW      = maxN > 0 ? Math.round(num / maxN * 100) : 0;
      return `<td style="padding:6px 16px;text-align:right;${isBest ? 'background:rgba(167,139,250,0.06)' : ''}">
        <div style="display:flex;align-items:center;justify-content:flex-end;gap:8px">
          <div style="width:48px;height:3px;background:var(--surface2);border-radius:2px;overflow:hidden;flex-shrink:0">
            <div style="height:100%;width:${barW}%;background:${colors[si]};border-radius:2px"></div>
          </div>
          <span style="font-family:var(--mono);font-size:15px;font-weight:${isBest ? '700' : '500'};min-width:30px;color:${isBest ? 'var(--text)' : 'var(--muted)'}">${num}</span>
        </div>
        ${convPct !== null ? `<div style="font-size:10px;font-weight:600;color:${convColor};text-align:right;margin-top:2px">${convStr}</div>` : ''}
      </td>`;
    }).join('');

    return `<tr style="border-bottom:1px solid var(--border)">
      <td style="font-size:12px;color:var(--muted);padding:7px 16px">${label}</td>${cells}
    </tr>`;
  }).join('');

  const metaRows = (() => {
    if (!state.metaToken) return '';
    const fmt2c = n => '€ ' + parseFloat(n).toFixed(2);
    const topBorder = 'border-top:2px solid rgba(167,139,250,0.3)';
    const bg = 'background:rgba(167,139,250,0.05)';
    const lbl = 'font-size:12px;color:var(--muted);font-weight:600';
    const mkCell = (val, color, pt, pb) =>
      '<td style="padding:' + pt + ' 16px ' + pb + ' 16px;text-align:right;font-size:13px;font-weight:700;color:' + color + '">' + val + '</td>';
    const mkEmpty = (pt, pb) =>
      '<td style="padding:' + pt + ' 16px ' + pb + ' 16px;text-align:right;color:var(--muted);font-size:11px">—</td>';

    const spendCells = selected.map(s => {
      const md = state.metaSprintData[s.id];
      if (!md) return mkEmpty('12px', '6px');
      return mkCell(fmt2c(parseFloat(md.spend || 0)), 'var(--red)', '12px', '6px');
    }).join('');

    const cacCells = selected.map(s => {
      const md = state.metaSprintData[s.id];
      if (!md) return mkEmpty('6px', '6px');
      const spend = parseFloat(md.spend || 0);
      const onb = Number((dataMap[s.id] || [])[3]?.numero ?? 0);
      const cac = onb > 0 ? spend / onb : null;
      return mkCell(cac != null ? fmt2c(cac) : '—', 'var(--amber)', '6px', '6px');
    }).join('');

    const cpauCells = selected.map(s => {
      const md = state.metaSprintData[s.id];
      if (!md) return mkEmpty('6px', '12px');
      const spend = parseFloat(md.spend || 0);
      const wkt = Number((dataMap[s.id] || [])[4]?.numero ?? 0);
      const cpau = wkt > 0 ? spend / wkt : null;
      return mkCell(cpau != null ? fmt2c(cpau) : '—', 'var(--purple)', '6px', '12px');
    }).join('');

    return '<tr style="' + topBorder + ';' + bg + '"><td style="' + lbl + ';padding:12px 16px 6px 16px">Spesa Meta</td>' + spendCells + '</tr>' +
           '<tr style="' + bg + '"><td style="' + lbl + ';padding:6px 16px">CAC</td>' + cacCells + '</tr>' +
           '<tr style="' + bg + '"><td style="' + lbl + ';padding:6px 16px 12px 16px">CPAU</td>' + cpauCells + '</tr>';
  })();

  return `<table style="width:100%;border-collapse:collapse">
    <thead><tr style="border-bottom:2px solid var(--border)">
      <th style="text-align:left;padding:10px 16px;font-size:10px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.6px">Step</th>
      ${headers}
    </tr></thead>
    <tbody>${rows}${metaRows}</tbody>
  </table>`;
}

function sprintRetentionTable(selected, dataMap) {
  const colors   = selected.map((_, i) => SPRINT_COLORS[i % SPRINT_COLORS.length]);
  const allData  = selected.map(s => dataMap[s.id] || []);
  const maxWeeks = Math.max(...allData.map(d => d.length), 0);
  if (!maxWeeks) return '<div style="color:var(--muted);font-size:13px">Nessun dato.</div>';

  const headers = selected.map((s, i) => `
    <th style="text-align:right;padding:10px 16px;white-space:nowrap">
      <div style="display:inline-flex;align-items:center;gap:6px">
        <span style="width:10px;height:10px;border-radius:50%;background:${colors[i]};flex-shrink:0"></span>
        <span>${s.nome}</span>
      </div>
      <div style="font-size:10px;font-weight:400;color:var(--muted);margin-top:2px">${s.inizio} → ${s.fine}</div>
    </th>`
  ).join('');

  const rows = Array.from({ length: maxWeeks }, (_, i) => {
    const label  = i === 0 ? 'W0 (base)' : `W${i}`;
    const pcts   = selected.map(s => {
      const r = (dataMap[s.id] || []).find(r => r.week === i);
      return r ? Number(r.retention_pct) : -1;
    });
    const maxPct = Math.max(...pcts.filter(p => p >= 0), 0);

    const cells = selected.map((s, si) => {
      const row = (dataMap[s.id] || []).find(r => r.week === i);
      if (!row) return `<td style="padding:8px 16px;text-align:right;color:var(--muted)">—</td>`;
      const pct   = Number(row.retention_pct);
      const color = pct >= 40 ? 'var(--mattia)' : pct >= 20 ? 'var(--amber)' : pct > 0 ? 'var(--red)' : 'var(--muted)';
      const isBest = i > 0 && pct === maxPct && maxPct > 0;
      return `<td style="padding:7px 16px;text-align:right;${isBest ? 'background:rgba(167,139,250,0.06)' : ''}">
        <div style="font-weight:700;color:${color};font-size:16px">${pct}%</div>
        <div style="font-size:10px;color:var(--muted);margin-top:1px">${row.retained}/${row.eligible}</div>
      </td>`;
    }).join('');

    return `<tr style="border-bottom:1px solid var(--border)">
      <td style="font-size:12px;color:var(--muted);padding:7px 16px;min-width:90px">${label}</td>${cells}
    </tr>`;
  }).join('');

  return `<table style="width:100%;border-collapse:collapse">
    <thead><tr style="border-bottom:2px solid var(--border)">
      <th style="text-align:left;padding:10px 16px;font-size:10px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.6px">Settimana</th>
      ${headers}
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

// ── COMPONENTI ────────────────────────────────────────────────────────

function stat(label, value, sub, color) {
  return `<div class="stat-card">
    <div class="stat-label">${label}</div>
    <div class="stat-value ${color}">${value ?? '—'}</div>
    ${sub ? `<div class="stat-sub">${sub}</div>` : ''}
  </div>`;
}

function mRow(label, value, note) {
  return `<tr>
    <td style="color:var(--muted)">${label}</td>
    <td class="metric-val">${value ?? '—'}</td>
    <td style="font-size:12px;color:var(--muted)">${note}</td>
  </tr>`;
}

function barChart(data, key, color) {
  if (!data || !data.length) return `<div style="height:110px;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:12px">Nessun dato</div>`;
  const values = data.map(d => Number(d[key]) || 0);
  const maxVal = Math.max(...values, 1);
  const every  = data.length > 9 ? 2 : 1;
  const bars   = data.map((d, i) => {
    const val = values[i];
    const h   = Math.max((val / maxVal) * 100, val > 0 ? 3 : 0);
    return `<div style="flex:1;height:${h}%;background:${color};border-radius:2px 2px 0 0;opacity:.75;cursor:default"
      title="${d.day||''}: ${val}"
      onmouseenter="this.style.opacity='1'" onmouseleave="this.style.opacity='.75'"></div>`;
  }).join('');
  const labels = data.map((d, i) =>
    `<div style="flex:1;font-size:7.5px;color:var(--muted);text-align:center">${i % every === 0 ? (d.day||'').slice(5) : ''}</div>`
  ).join('');
  return `
    <div style="display:flex;align-items:flex-end;height:88px;gap:3px;margin-top:10px">${bars}</div>
    <div style="display:flex;gap:3px;padding-top:5px">${labels}</div>`;
}

function chartPlaceholder() {
  return `<div style="height:160px;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:12px">
    ${state.loading ? '<span class="pulse">Caricamento…</span>' : 'Nessun dato'}
  </div>`;
}

function growthChart(rawData, range) {
  // range=0 → from first growth day; range=N → last N days
  let data;
  if (range > 0) {
    data = rawData.slice(-range);
  } else {
    const firstGrowth = rawData.findIndex((d, i) =>
      i > 0 && Number(d.total_users) > Number(rawData[i - 1].total_users)
    );
    data = firstGrowth > 0 ? rawData.slice(Math.max(0, firstGrowth - 1)) : rawData;
  }
  if (!data.length) return chartPlaceholder();

  const n = data.length;
  const W = 900, H = 190, PT = 20, PB = 28, PL = 52, PR = 20;
  const cW = W - PL - PR, cH = H - PT - PB;

  const values = data.map(d => Number(d.total_users));
  const maxV   = Math.max(...values, 1);

  const pts = data.map((d, i) => ({
    x:   PL + (n === 1 ? cW / 2 : i / (n - 1) * cW),
    y:   PT + cH - (Number(d.total_users) / maxV * cH),
    val: Number(d.total_users),
    day: d.day,
  }));

  const dense = n > 14;
  const every = dense ? Math.ceil(n / 10) : 1;
  const color = '#a78bfa';

  const yTicks = [0, Math.round(maxV / 2), maxV];
  const refs   = yTicks.map(v => {
    const y = PT + cH - (v / maxV * cH);
    return `<line x1="${PL}" y1="${y}" x2="${W - PR}" y2="${y}" stroke="#1d1d2e" stroke-width="1"/>
            <text x="${PL - 6}" y="${y + 3}" text-anchor="end" font-size="9" fill="#5a5a80">${v}</text>`;
  }).join('');

  const area = `${pts[0].x},${PT + cH} ${pts.map(p => `${p.x},${p.y}`).join(' ')} ${pts[n-1].x},${PT + cH}`;
  const line = pts.map(p => `${p.x},${p.y}`).join(' ');

  const dots = pts.map((p, i) => {
    const isLast = i === n - 1;
    return `<circle cx="${p.x}" cy="${p.y}" r="${isLast ? 5 : dense ? 2.5 : 3.5}"
              fill="${color}" stroke="#111118" stroke-width="${isLast ? 2 : 1.5}"/>
            ${isLast ? `<text x="${p.x}" y="${p.y - 11}" text-anchor="middle" font-size="11" fill="${color}" font-weight="700">${p.val}</text>` : ''}`;
  }).join('');

  const xLabels = pts.filter((_, i) => i % every === 0 || i === n - 1).map(p =>
    `<text x="${p.x}" y="${H - 5}" text-anchor="middle" font-size="8" fill="#5a5a80">${p.day.slice(5)}</text>`
  ).join('');

  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:${H}px" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0.01"/>
      </linearGradient>
    </defs>
    ${refs}
    <polygon points="${area}" fill="url(#gg)"/>
    <polyline points="${line}" stroke="${color}" stroke-width="2.5" fill="none"
      stroke-linejoin="round" stroke-linecap="round"/>
    ${dots}
    ${xLabels}
  </svg>`;
}

function weeklyWorkoutsChart(rawData, weeks) {
  const data = weeks ? rawData.slice(-weeks) : rawData;
  const values = data.map(d => Number(d.workouts));
  const maxV   = Math.max(...values, 1);
  const n      = data.length;
  const W = 700, H = 180, PT = 20, PB = 28, PL = 36, PR = 12;
  const cW = W - PL - PR, cH = H - PT - PB;
  const gap  = Math.max(3, Math.floor(cW / n * 0.12));
  const barW = Math.max(6, Math.floor(cW / n) - gap);

  const refs = [0, Math.round(maxV / 2), maxV].map(v => {
    const y = PT + cH - (v / maxV * cH);
    return `<line x1="${PL}" y1="${y}" x2="${W - PR}" y2="${y}" stroke="#1d1d2e" stroke-width="1"/>
            <text x="${PL - 4}" y="${y + 3}" text-anchor="end" font-size="8" fill="#5a5a80">${v}</text>`;
  }).join('');

  const bars = data.map((d, i) => {
    const val   = Number(d.workouts);
    const h     = Math.max((val / maxV) * cH, val > 0 ? 3 : 0);
    const x     = PL + (i / n) * cW + (cW / n - barW) / 2;
    const y     = PT + cH - h;
    const ratio = val / maxV;
    const color = ratio >= 0.75 ? '#4ade80' : ratio >= 0.4 ? '#a78bfa' : '#60a5fa';
    const isLast = i === n - 1;
    const week  = d.week.slice(5);
    return `<rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="3" ry="3"
              fill="${color}" opacity="${isLast ? 1 : 0.75}"/>
            ${val > 0 ? `<text x="${x + barW/2}" y="${y - 4}" text-anchor="middle" font-size="9" fill="${color}">${val}</text>` : ''}
            <text x="${x + barW/2}" y="${H - 5}" text-anchor="middle" font-size="8" fill="#5a5a80">${week}</text>`;
  }).join('');

  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:${H}px" xmlns="http://www.w3.org/2000/svg">
    ${refs}${bars}
  </svg>`;
}

function dailyStreaksChart(rawData, range) {
  const data = range ? rawData.slice(-range) : rawData;
  const n = data.length;
  if (!n) return chartPlaceholder();
  const W = 700, H = 180, PT = 20, PB = 28, PL = 36, PR = 12;
  const cW = W - PL - PR, cH = H - PT - PB;
  const color = '#22d3ee';

  const values = data.map(d => Number(d.streak_users));
  const maxV   = Math.max(...values, 1);

  const pts = data.map((d, i) => ({
    x:   PL + (n === 1 ? cW / 2 : i / (n - 1) * cW),
    y:   PT + cH - (Number(d.streak_users) / maxV * cH),
    val: Number(d.streak_users),
    day: d.day,
  }));

  const dense = n > 20;
  const every = dense ? Math.ceil(n / 10) : 1;

  const refs = [0, Math.round(maxV / 2), maxV].map(v => {
    const y = PT + cH - (v / maxV * cH);
    return `<line x1="${PL}" y1="${y}" x2="${W - PR}" y2="${y}" stroke="#1d1d2e" stroke-width="1"/>
            <text x="${PL - 4}" y="${y + 3}" text-anchor="end" font-size="8" fill="#5a5a80">${v}</text>`;
  }).join('');

  const area = `${pts[0].x},${PT + cH} ${pts.map(p => `${p.x},${p.y}`).join(' ')} ${pts[n-1].x},${PT + cH}`;
  const line = pts.map(p => `${p.x},${p.y}`).join(' ');

  const dots = pts.map((p, i) => {
    const isLast = i === n - 1;
    const show   = !dense || isLast || i % every === 0;
    return `<circle cx="${p.x}" cy="${p.y}" r="${isLast ? 5 : dense ? 2.5 : 3.5}"
              fill="${color}" stroke="#111118" stroke-width="${isLast ? 2 : 1.5}"/>
            ${show && !dense ? `<text x="${p.x}" y="${p.y - 8}" text-anchor="middle" font-size="9" fill="${color}">${p.val}</text>` : ''}
            ${isLast ? `<text x="${p.x}" y="${p.y - 13}" text-anchor="middle" font-size="11" fill="${color}" font-weight="700">${p.val}</text>` : ''}`;
  }).join('');

  const xLabels = pts.filter((_, i) => i % every === 0 || i === n - 1).map(p =>
    `<text x="${p.x}" y="${H - 5}" text-anchor="middle" font-size="8" fill="#5a5a80">${p.day.slice(5)}</text>`
  ).join('');

  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:${H}px" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.14"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0.01"/>
      </linearGradient>
    </defs>
    ${refs}
    <polygon points="${area}" fill="url(#sg)"/>
    <polyline points="${line}" stroke="${color}" stroke-width="2.5" fill="none"
      stroke-linejoin="round" stroke-linecap="round"/>
    ${dots}
    ${xLabels}
  </svg>`;
}

function pageMetaAds() {
  const fmt2  = n => n != null ? parseFloat(n).toFixed(2) : '—';
  const fmtN  = n => n != null ? parseInt(n).toLocaleString('it-IT') : '—';
  const fmtPct = n => n != null ? (parseFloat(n) * 100).toFixed(2) + '%' : '—';
  const getInstalls = d => {
    const act = d && d.actions && d.actions.find(a => ['mobile_app_install','app_install','omni_app_install'].includes(a.action_type));
    return act ? parseInt(act.value) : null;
  };
  const getCostPerInstall = d => {
    const cp = d && d.cost_per_action_type && d.cost_per_action_type.find(a => ['mobile_app_install','app_install','omni_app_install'].includes(a.action_type));
    return cp ? parseFloat(cp.value) : null;
  };

  const presets = [
    { id: 'last_7d',    label: '7g' },
    { id: 'last_14d',   label: '14g' },
    { id: 'last_30d',   label: '30g' },
    { id: 'this_month', label: 'Mese' },
    { id: 'last_month', label: 'Mese prec.' },
  ];

  const tokenSection = '<div class="card" style="margin-bottom:16px">' +
    '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">' +
    '<span style="font-size:12px;color:var(--muted);white-space:nowrap">Token Meta API</span>' +
    '<input id="meta-token-input" type="password" value="' + state.metaToken + '" placeholder="Incolla il token da Meta Developers…" style="flex:1;min-width:200px;background:#0d0d1a;border:1px solid var(--border);color:var(--fg);border-radius:6px;padding:6px 10px;font-size:12px;font-family:monospace"/>' +
    '<button id="meta-token-save" class="btn-primary" style="font-size:12px;padding:6px 14px">Salva</button>' +
    (state.metaToken ? '<span style="font-size:11px;color:var(--green)">● Token impostato</span>' : '<span style="font-size:11px;color:var(--red)">● Nessun token</span>') +
    '</div>' +
    '<div style="margin-top:6px;font-size:11px;color:var(--muted)">Il token non scade (System User Token). Rigeneralo solo se lo hai revocato.</div>' +
    '</div>';

  if (!state.metaToken) return '<div class="page-header"><div><div class="page-title">Meta ADS</div><div class="page-sub">Dati campagne pubblicitarie</div></div></div>' +
    tokenSection + '<div class="card" style="padding:60px;text-align:center;color:var(--muted)">Inserisci il token per caricare i dati.</div>';

  const activePreset = !state.metaUseCustom ? state.metaDatePreset : null;
  const dateBar = '<div class="card" style="margin-bottom:16px;padding:14px 16px">' +
    '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">' +
    '<span style="font-size:11px;color:var(--muted);white-space:nowrap">Periodo:</span>' +
    presets.map(p => '<button class="meta-preset-btn" data-preset="' + p.id + '" style="padding:5px 12px;font-size:12px;border-radius:6px;border:1px solid var(--border);background:' + (activePreset === p.id ? 'var(--accent)' : 'transparent') + ';color:' + (activePreset === p.id ? '#fff' : 'var(--muted)') + ';cursor:pointer">' + p.label + '</button>').join('') +
    '<span style="color:var(--border);padding:0 4px">|</span>' +
    '<input type="date" id="meta-from" value="' + state.metaCustomFrom + '" style="background:#0d0d1a;border:1px solid ' + (state.metaUseCustom ? 'var(--accent)' : 'var(--border)') + ';color:var(--fg);border-radius:6px;padding:4px 8px;font-size:12px"/>' +
    '<span style="font-size:11px;color:var(--muted)">→</span>' +
    '<input type="date" id="meta-to" value="' + state.metaCustomTo + '" style="background:#0d0d1a;border:1px solid ' + (state.metaUseCustom ? 'var(--accent)' : 'var(--border)') + ';color:var(--fg);border-radius:6px;padding:4px 8px;font-size:12px"/>' +
    '<button id="meta-custom-apply" class="btn-primary" style="font-size:12px;padding:5px 12px">Applica</button>' +
    '</div></div>';

  if (state.metaAdsLoading) return '<div class="page-header"><div><div class="page-title">Meta ADS</div><div class="page-sub">Dati campagne pubblicitarie</div></div></div>' + tokenSection + dateBar + '<div class="card" style="padding:60px;text-align:center;color:var(--muted)">Caricamento dati Meta…</div>';

  if (state.metaAdsError) return '<div class="page-header"><div><div class="page-title">Meta ADS</div><div class="page-sub">Dati campagne pubblicitarie</div></div></div>' + tokenSection + dateBar +
    '<div class="card" style="padding:40px;text-align:center"><div style="color:var(--red);font-size:13px;margin-bottom:8px">⚠ ' + state.metaAdsError + '</div><div style="font-size:11px;color:var(--muted)">Il token potrebbe non avere i permessi corretti.</div></div>';

  if (!state.metaAds) return '<div class="page-header"><div><div class="page-title">Meta ADS</div><div class="page-sub">Dati campagne pubblicitarie</div></div></div>' + tokenSection + dateBar +
    '<div class="card" style="padding:60px;text-align:center;color:var(--muted)">Nessun dato per il periodo selezionato.</div>';

  const d = state.metaAds;
  const installs = getInstalls(d);
  const cpi = getCostPerInstall(d);

  const kpis = [
    { label: 'Spesa Totale',   value: '€ ' + fmt2(d.spend),   color: 'var(--red)' },
    { label: 'Impression',     value: fmtN(d.impressions),     color: 'var(--purple)' },
    { label: 'Reach',          value: fmtN(d.reach),           color: 'var(--blue)' },
    { label: 'Click',          value: fmtN(d.clicks),          color: 'var(--green)' },
    { label: 'CTR',            value: fmtPct(d.ctr),           color: 'var(--amber)' },
    { label: 'CPC',            value: '€ ' + fmt2(d.cpc),      color: 'var(--amber)' },
    { label: 'CPM',            value: '€ ' + fmt2(d.cpm),      color: 'var(--muted)' },
    { label: 'Frequenza',      value: fmt2(d.frequency),       color: 'var(--muted)' },
    { label: 'Install',        value: installs != null ? fmtN(installs) : '—', color: 'var(--green)' },
    { label: 'Costo/Install',  value: cpi != null ? '€ ' + fmt2(cpi) : '—',   color: 'var(--red)' },
  ];

  const kpiCards = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:12px;margin-bottom:16px">' +
    kpis.map(k => '<div class="card" style="padding:16px"><div style="font-size:11px;color:var(--muted);margin-bottom:6px">' + k.label + '</div><div style="font-size:22px;font-weight:700;color:' + k.color + '">' + k.value + '</div></div>').join('') +
    '</div>';

  const camps = (state.metaCampaigns || []).filter(c => c.insights && c.insights.data && c.insights.data[0]);
  const campTable = camps.length === 0 ? '' : '<div class="card" style="margin-bottom:16px"><div class="card-title" style="margin-bottom:12px">Campagne</div><div style="overflow-x:auto"><table class="data-table"><thead><tr><th>Campagna</th><th>Stato</th><th>Spesa</th><th>Impression</th><th>Click</th><th>CTR</th><th>CPC</th><th>Install</th><th>Costo/Install</th></tr></thead><tbody>' +
    camps.map(c => {
      const i = c.insights.data[0];
      const sc = c.status === 'ACTIVE' ? 'var(--green)' : 'var(--muted)';
      const ci = getInstalls(i);
      const cpi2 = getCostPerInstall(i);
      return '<tr><td style="font-weight:500">' + c.name + '</td><td><span style="color:' + sc + ';font-size:11px">' + c.status + '</span></td><td>€ ' + fmt2(i.spend) + '</td><td>' + fmtN(i.impressions) + '</td><td>' + fmtN(i.clicks) + '</td><td>' + fmtPct(i.ctr) + '</td><td>€ ' + fmt2(i.cpc) + '</td><td>' + (ci != null ? fmtN(ci) : '—') + '</td><td>' + (cpi2 != null ? '€ ' + fmt2(cpi2) : '—') + '</td></tr>';
    }).join('') +
    '</tbody></table></div></div>';

  const sprints = state.sprints || [];
  const sprintPanel = '<div class="card"><div class="card-title" style="margin-bottom:12px">Confronto Sprint</div>' +
    (sprints.length === 0
      ? '<div style="font-size:12px;color:var(--muted)">Nessuno sprint disponibile.</div>'
      : '<div style="font-size:11px;color:var(--muted);margin-bottom:10px">Seleziona gli sprint per vedere le metriche Meta ADS in quei periodi.</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">' +
        sprints.map(s => {
          const sel = state.metaSprintSel.includes(String(s.id));
          return '<button class="meta-sprint-chip" data-sprint-id="' + s.id + '" style="padding:5px 12px;font-size:12px;border-radius:20px;border:1px solid ' + (sel ? 'var(--accent)' : 'var(--border)') + ';background:' + (sel ? 'var(--accent)' : 'transparent') + ';color:' + (sel ? '#fff' : 'var(--fg)') + ';cursor:pointer">' + s.nome + ' <span style="font-size:10px;opacity:.7">' + s.inizio + ' → ' + s.fine + '</span></button>';
        }).join('') +
        '</div>' +
        (state.metaSprintSel.length > 0 ? '<button id="meta-sprint-calc" class="btn-primary" style="font-size:12px;padding:6px 14px;margin-bottom:12px">' + (state.metaSprintLoading ? 'Caricamento…' : 'Calcola') + '</button>' : '') +
        (state.metaSprintSel.length > 0 && !state.metaSprintLoading && Object.keys(state.metaSprintData).length > 0 ? (() => {
          const rows = state.metaSprintSel.map(id => {
            const sprint = sprints.find(s => String(s.id) === String(id));
            const sd = state.metaSprintData[id];
            if (!sprint) return '';
            if (!sd) return '<tr><td style="font-weight:500">' + sprint.nome + '</td><td colspan="8" style="color:var(--muted);font-size:11px">Nessun dato</td></tr>';
            const si = getInstalls(sd);
            const scpi = getCostPerInstall(sd);
            return '<tr><td style="font-weight:500">' + sprint.nome + '</td><td style="font-size:11px;color:var(--muted)">' + sprint.inizio + ' → ' + sprint.fine + '</td><td>€ ' + fmt2(sd.spend) + '</td><td>' + fmtN(sd.impressions) + '</td><td>' + fmtN(sd.reach) + '</td><td>' + fmtN(sd.clicks) + '</td><td>' + fmtPct(sd.ctr) + '</td><td>' + (si != null ? fmtN(si) : '—') + '</td><td>' + (scpi != null ? '€ ' + fmt2(scpi) : '—') + '</td></tr>';
          }).join('');
          return '<div style="overflow-x:auto"><table class="data-table"><thead><tr><th>Sprint</th><th>Periodo</th><th>Spesa</th><th>Impression</th><th>Reach</th><th>Click</th><th>CTR</th><th>Install</th><th>Costo/Install</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
        })() : '')) +
    '</div>';

  return '<div class="page-header"><div><div class="page-title">Meta ADS</div><div class="page-sub">Dati campagne pubblicitarie · ' + META_AD_ACCOUNT + '</div></div><button id="meta-refresh" class="btn-outline" style="font-size:12px;padding:6px 14px">↻ Aggiorna</button></div>' +
    tokenSection + dateBar + kpiCards + campTable + sprintPanel;
}

// ── EVENTS ────────────────────────────────────────────────────────────

function attachEvents() {
  // Navigazione
  document.querySelectorAll('[data-nav]').forEach(el =>
    el.addEventListener('click', () => {
      state.page = el.dataset.nav;
      if (state.page === 'funnel'     && !state.funnel        && !state.funnelLoading)    fetchFunnel();
      if (state.page === 'retention'  && !state.retention     && !state.retLoading)       fetchRetention();
      if (state.page === 'sprint'     && !state.sprints.length && !state.sprintsLoading)  { fetchSprints(); fetchBlockedUsers(); fetchRecentlyUnblocked(); }
      if (state.page === 'premium'    && !state.premiumData   && !state.premiumLoading)   fetchPremium();
      if (state.page === 'behavior'   && !state.behaviorData  && !state.behaviorLoading)  fetchBehavior();
      if (state.page === 'meta-ads'   && !state.metaAds       && !state.metaAdsLoading && state.metaToken)  fetchMetaAds();
      render();
    }));

  // Chart range filters
  document.querySelectorAll('[data-growth-range]').forEach(el =>
    el.addEventListener('click', () => { state.growthRange = +el.dataset.growthRange; render(); }));
  document.querySelectorAll('[data-weekly-range]').forEach(el =>
    el.addEventListener('click', () => { state.weeklyRange = +el.dataset.weeklyRange; render(); }));
  document.querySelectorAll('[data-streak-range]').forEach(el =>
    el.addEventListener('click', () => { state.streakRange = +el.dataset.streakRange; render(); }));

  // Retention
  document.getElementById('ret-apply')?.addEventListener('click', () => {
    const from = document.getElementById('ret-from')?.value;
    const to   = document.getElementById('ret-to')?.value;
    if (from) state.retFrom = from;
    if (to)   state.retTo   = to;
    state.retention = null;
    fetchRetention();
  });
  document.getElementById('ret-min')?.addEventListener('change', e => {
    state.retMin = +e.target.value;
    state.retention = null;
    fetchRetention();
  });
  document.getElementById('ret-weeks')?.addEventListener('change', e => {
    state.retWeeks = +e.target.value;
    state.retention = null;
    fetchRetention();
  });
  document.getElementById('ret-min-w0')?.addEventListener('change', e => {
    state.retMinW0 = +e.target.value;
    state.retention = null;
    fetchRetention();
  });
  document.querySelectorAll('[data-ret-chart]').forEach(el =>
    el.addEventListener('click', () => {
      state.retChart = el.dataset.retChart;
      render();
    }));

  document.getElementById('refresh-btn')?.addEventListener('click', manualRefresh);

  // Overview — personalizza
  document.getElementById('edit-overview')?.addEventListener('click', () => {
    state.editingOverview = !state.editingOverview;
    render();
  });
  document.getElementById('done-overview')?.addEventListener('click', () => {
    state.editingOverview = false;
    render();
  });
  document.querySelectorAll('[data-toggle-metric]').forEach(el =>
    el.addEventListener('click', () => {
      const k = el.dataset.toggleMetric;
      const idx = state.overviewKeys.indexOf(k);
      if (idx === -1) state.overviewKeys.push(k);
      else state.overviewKeys.splice(idx, 1);
      saveSetting('overview_keys', state.overviewKeys);
      render();
    }));

  // Funnel — calcola
  document.getElementById('funnel-apply')?.addEventListener('click', () => {
    const from = document.getElementById('funnel-from')?.value;
    const to   = document.getElementById('funnel-to')?.value;
    if (from) state.funnelFrom = from;
    if (to)   state.funnelTo   = to;
    saveSetting('funnel_dates', { from: state.funnelFrom, to: state.funnelTo });
    state.funnel = null;
    state.metaFunnelData = null;
    state.metaFunnelPeriod = null;
    fetchFunnel();
  });

  // Funnel — carica costi Meta
  document.getElementById('meta-funnel-load')?.addEventListener('click', fetchMetaFunnel);

  // Funnel — edit mode
  document.getElementById('edit-funnel')?.addEventListener('click', () => {
    state.editingFunnel = true;
    render();
  });
  document.getElementById('close-funnel-edit')?.addEventListener('click', () => {
    state.editingFunnel = false;
    render();
  });
  document.getElementById('funnel-add')?.addEventListener('click', () => {
    const lastIdx = state.funnelConfig.length > 0 ? state.funnelConfig.length - 1 : null;
    state.funnelConfig.push({ stepIdx: 0, vsIdx: lastIdx });
    saveSetting('funnel_cfg', state.funnelConfig);
    render();
  });
  document.getElementById('funnel-reset')?.addEventListener('click', () => {
    state.funnelConfig = JSON.parse(JSON.stringify(DEF_FUN_CFG));
    saveSetting('funnel_cfg', state.funnelConfig);
    render();
  });
  document.querySelectorAll('.funnel-step-sel').forEach(el =>
    el.addEventListener('change', () => {
      state.funnelConfig[+el.dataset.row].stepIdx = +el.value;
      saveSetting('funnel_cfg', state.funnelConfig);
      render();
    }));
  document.querySelectorAll('.funnel-vs-sel').forEach(el =>
    el.addEventListener('change', () => {
      state.funnelConfig[+el.dataset.row].vsIdx = el.value === '' ? null : +el.value;
      saveSetting('funnel_cfg', state.funnelConfig);
      render();
    }));
  document.querySelectorAll('.funnel-remove').forEach(el =>
    el.addEventListener('click', () => {
      const i = +el.dataset.row;
      state.funnelConfig.splice(i, 1);
      state.funnelConfig.forEach(r => {
        if (r.vsIdx === i) r.vsIdx = null;
        else if (r.vsIdx !== null && r.vsIdx > i) r.vsIdx--;
      });
      saveSetting('funnel_cfg', state.funnelConfig);
      render();
    }));

  // Funnel — sprint selector
  document.getElementById('funnel-sprint-sel')?.addEventListener('change', e => {
    const sprint = state.sprints.find(s => s.id === e.target.value);
    if (sprint) {
      state.funnelFrom = sprint.inizio;
      state.funnelTo   = sprint.fine;
      state.funnel     = null;
      fetchFunnel();
    }
  });

  // Sprint — CRUD
  document.getElementById('sprint-new')?.addEventListener('click', () => {
    state.sprintFormOpen  = true;
    state.sprintEditingId = null;
    state.sprintForm      = { nome: '', inizio: BETA_START, fine: TODAY, note: '' };
    render();
  });
  document.getElementById('sprint-form-cancel')?.addEventListener('click', () => {
    state.sprintFormOpen  = false;
    state.sprintEditingId = null;
    render();
  });
  document.getElementById('sprint-form-save')?.addEventListener('click', async () => {
    const nome   = document.getElementById('sprint-form-nome')?.value?.trim();
    const inizio = document.getElementById('sprint-form-inizio')?.value;
    const fine   = document.getElementById('sprint-form-fine')?.value;
    const note   = document.getElementById('sprint-form-note')?.value?.trim() || null;
    if (!nome || !inizio || !fine) return;
    state.sprintForm = { nome, inizio, fine, note: note || '' };
    const res = state.sprintEditingId
      ? await sb.from('sprints').update({ nome, inizio, fine, note }).eq('id', state.sprintEditingId)
      : await sb.from('sprints').insert({ nome, inizio, fine, note });
    if (res.error) { console.error(res.error); return; }
    state.sprintFormOpen  = false;
    state.sprintEditingId = null;
    state.sprintForm      = { nome: '', inizio: BETA_START, fine: TODAY, note: '' };
    await fetchSprints();
  });
  document.querySelectorAll('.sprint-edit').forEach(el =>
    el.addEventListener('click', () => {
      const s = state.sprints.find(sp => sp.id === el.dataset.id);
      if (!s) return;
      state.sprintFormOpen  = true;
      state.sprintEditingId = s.id;
      state.sprintForm      = { nome: s.nome, inizio: s.inizio, fine: s.fine, note: s.note || '' };
      render();
    }));
  document.querySelectorAll('.sprint-delete').forEach(el =>
    el.addEventListener('click', () => {
      const sprint = state.sprints.find(s => s.id === el.dataset.id);
      state.deleteConfirm = { id: el.dataset.id, nome: sprint?.nome || 'sprint' };
      render();
      document.getElementById('delete-confirm-input')?.focus();
    }));

  // Delete confirm modal
  const delInput = document.getElementById('delete-confirm-input');
  const delBtn   = document.getElementById('delete-confirm-btn');
  if (delInput && delBtn) {
    delInput.addEventListener('input', () => {
      const ok = delInput.value === 'DELETE';
      delBtn.style.opacity = ok ? '1' : '0.4';
      delBtn.style.cursor  = ok ? 'pointer' : 'not-allowed';
    });
    delBtn.addEventListener('click', async () => {
      if (delInput.value !== 'DELETE') return;
      const id = state.deleteConfirm?.id;
      state.deleteConfirm = null;
      render();
      const res = await sb.from('sprints').delete().eq('id', id);
      if (res.error) { console.error(res.error); return; }
      state.sprintFunnelSel = state.sprintFunnelSel.filter(x => x !== id);
      state.sprintRetSel    = state.sprintRetSel.filter(x => x !== id);
      delete state.sprintFunnelData[id];
      delete state.sprintRetData[id];
      await fetchSprints();
    });
    document.getElementById('delete-cancel-btn')?.addEventListener('click', () => {
      state.deleteConfirm = null;
      render();
    });
    document.getElementById('delete-overlay')?.addEventListener('click', e => {
      if (e.target === e.currentTarget) { state.deleteConfirm = null; render(); }
    });
  }

  // Blocked users
  document.getElementById('blocked-add-toggle')?.addEventListener('click', () => {
    state.blockSearchOpen    = !state.blockSearchOpen;
    state.blockSearchQuery   = '';
    state.blockSearchResults = [];
    render();
    if (state.blockSearchOpen) {
      const inp = document.getElementById('blocked-search');
      inp?.focus();
      // ripopola risultati se c'era già una query
      renderBlockedSearchResults();
    }
  });
  const blockedSearchEl = document.getElementById('blocked-search');
  if (blockedSearchEl) {
    blockedSearchEl.addEventListener('input', e => searchUsersForBlock(e.target.value.trim()));
    // ripristina risultati già presenti dopo un render
    if (state.blockSearchResults.length) renderBlockedSearchResults();
  }
  document.querySelectorAll('.blocked-remove').forEach(el =>
    el.addEventListener('click', () => removeBlockedUser(el.dataset.id)));
  document.querySelectorAll('.blocked-readd').forEach(el =>
    el.addEventListener('click', () => addBlockedUser({
      id:       el.dataset.userId,
      username: el.dataset.username,
      email:    el.dataset.email,
      name:     el.dataset.nome,
    })));

  // Sprint — confronto funnel (in pageFunnel)
  document.getElementById('sprint-funnel-toggle')?.addEventListener('click', () => {
    state.sprintFunnelOpen = !state.sprintFunnelOpen;
    render();
  });
  document.querySelectorAll('.sprint-funnel-chip').forEach(el =>
    el.addEventListener('click', () => {
      const id  = el.dataset.id;
      const idx = state.sprintFunnelSel.indexOf(id);
      if (idx === -1) state.sprintFunnelSel.push(id);
      else state.sprintFunnelSel.splice(idx, 1);
      render();
    }));
  document.getElementById('sprint-funnel-calc')?.addEventListener('click', fetchSprintFunnel);

  // Meta ADS — token save
  document.getElementById('meta-token-save')?.addEventListener('click', () => {
    const val = document.getElementById('meta-token-input')?.value?.trim();
    if (!val) return;
    state.metaToken = val;
    saveSetting('meta_token', val);
    state.metaAds = null;
    state.metaCampaigns = null;
    fetchMetaAds();
  });

  // Meta ADS — refresh
  document.getElementById('meta-refresh')?.addEventListener('click', () => {
    state.metaAds = null;
    state.metaCampaigns = null;
    fetchMetaAds();
  });

  // Meta ADS — preset buttons
  document.querySelectorAll('.meta-preset-btn').forEach(el =>
    el.addEventListener('click', () => {
      state.metaDatePreset = el.dataset.preset;
      state.metaUseCustom = false;
      state.metaAds = null;
      state.metaCampaigns = null;
      fetchMetaAds();
    }));

  // Meta ADS — custom date range
  document.getElementById('meta-custom-apply')?.addEventListener('click', () => {
    const from = document.getElementById('meta-from')?.value;
    const to   = document.getElementById('meta-to')?.value;
    if (!from || !to) return;
    state.metaCustomFrom = from;
    state.metaCustomTo   = to;
    state.metaUseCustom  = true;
    state.metaAds = null;
    state.metaCampaigns = null;
    fetchMetaAds();
  });

  // Meta ADS — sprint chip selection
  document.querySelectorAll('.meta-sprint-chip').forEach(el =>
    el.addEventListener('click', () => {
      const id  = el.dataset.sprintId;
      const idx = state.metaSprintSel.indexOf(id);
      if (idx === -1) state.metaSprintSel.push(id);
      else state.metaSprintSel.splice(idx, 1);
      render();
    }));

  // Meta ADS — sprint calcola
  document.getElementById('meta-sprint-calc')?.addEventListener('click', fetchMetaSprintData);

  // Meta ADS — carica costi Meta nel funnel
  document.getElementById('meta-funnel-load')?.addEventListener('click', fetchMetaFunnel);


  // Sprint — confronto retention (in pageRetention)
  document.getElementById('sprint-ret-toggle')?.addEventListener('click', () => {
    state.sprintRetOpen = !state.sprintRetOpen;
    render();
  });
  document.querySelectorAll('.sprint-ret-chip').forEach(el =>
    el.addEventListener('click', () => {
      const id  = el.dataset.id;
      const idx = state.sprintRetSel.indexOf(id);
      if (idx === -1) state.sprintRetSel.push(id);
      else state.sprintRetSel.splice(idx, 1);
      render();
    }));
  document.getElementById('sprint-ret-customize')?.addEventListener('click', () => {
    state.sprintRetCustom  = true;
    state.sprintRetMin     = state.retMin;
    state.sprintRetWeeks   = state.retWeeks;
    state.sprintRetMinW0   = state.retMinW0;
    render();
  });
  document.getElementById('sprint-ret-reset')?.addEventListener('click', () => {
    state.sprintRetCustom = false;
    state.sprintRetData   = {};
    render();
  });
  document.getElementById('sprint-ret-min')?.addEventListener('change', e => {
    state.sprintRetMin = +e.target.value;
  });
  document.getElementById('sprint-ret-weeks')?.addEventListener('change', e => {
    state.sprintRetWeeks = +e.target.value;
  });
  document.getElementById('sprint-ret-min-w0')?.addEventListener('change', e => {
    state.sprintRetMinW0 = +e.target.value;
  });
  document.getElementById('sprint-ret-calc')?.addEventListener('click', fetchSprintRetention);

  // Behavior page — quick range buttons
  document.querySelectorAll('.beh-quick').forEach(el =>
    el.addEventListener('click', () => {
      state.behaviorFrom = el.dataset.behFrom;
      state.behaviorTo   = el.dataset.behTo;
      const fi = document.getElementById('beh-from');
      const ti = document.getElementById('beh-to');
      if (fi) fi.value = state.behaviorFrom;
      if (ti) ti.value = state.behaviorTo;
      fetchBehavior();
    }));

  // Behavior page — custom date apply
  document.getElementById('beh-apply')?.addEventListener('click', () => {
    const f = document.getElementById('beh-from')?.value;
    const t = document.getElementById('beh-to')?.value;
    if (f) state.behaviorFrom = f;
    if (t) state.behaviorTo   = t;
    fetchBehavior();
  });

  // Behavior page — type filter
  document.querySelectorAll('.beh-type-btn').forEach(el =>
    el.addEventListener('click', () => {
      state.behaviorTypeFilter = el.dataset.behType;
      render();
    }));

  // User activity modal — open from feedback detail
  document.querySelectorAll('.open-user-activity').forEach(el =>
    el.addEventListener('click', () => {
      fetchUserActivity({
        user_id:  el.dataset.userId,
        username: el.dataset.username,
        email:    el.dataset.email,
      });
    }));

  // User activity modal — close
  document.getElementById('ua-close')?.addEventListener('click', () => {
    state.userActivityOpen = false; render();
  });
  document.getElementById('ua-overlay')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) { state.userActivityOpen = false; render(); }
  });

  // Feedback modal — open (button)
  document.getElementById('open-feedback-modal')?.addEventListener('click', () => {
    state.feedbackModalOpen  = true;
    state.allFeedbacks       = null;
    state.selectedFeedback   = null;
    state.feedbackSearchQuery = '';
    render();
    fetchAllFeedbacks();
  });

  // Feedback mini card rows — open modal pre-selezionando il feedback
  document.querySelectorAll('.fb-mini-row').forEach(el =>
    el.addEventListener('click', () => {
      const id = el.dataset.fbId;
      state.feedbackModalOpen   = true;
      state.feedbackSearchQuery = '';
      render();
      fetchAllFeedbacks().then?.(() => {});
      // pre-select after load (fetchAllFeedbacks sets selectedFeedback to first;
      // override after load by matching id once allFeedbacks is ready)
      const trySelect = () => {
        if (state.allFeedbacks) {
          const match = state.allFeedbacks.find(f => f.id === id);
          if (match) { state.selectedFeedback = match; render(); }
        } else { setTimeout(trySelect, 100); }
      };
      trySelect();
    }));

  // Feedback modal — close
  document.getElementById('fb-modal-close')?.addEventListener('click', () => {
    state.feedbackModalOpen = false; render();
  });
  document.getElementById('fb-modal-overlay')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) { state.feedbackModalOpen = false; render(); }
  });

  // Feedback modal — search
  document.getElementById('fb-search')?.addEventListener('input', e => {
    state.feedbackSearchQuery = e.target.value;
    render();
    document.getElementById('fb-search')?.focus();
  });

  // Feedback modal — select item
  document.querySelectorAll('.fb-list-item').forEach(el =>
    el.addEventListener('click', () => {
      const id = el.dataset.fbId;
      const f  = (state.allFeedbacks || []).find(x => x.id === id);
      if (f) { state.selectedFeedback = f; render(); document.getElementById('fb-search')?.focus(); }
    }));

  // AI Conversations modal — open
  document.getElementById('open-ai-conv')?.addEventListener('click', () => {
    state.aiConvOpen   = true;
    state.aiSessions   = null;
    state.aiSelectedSession   = null;
    state.aiSessionMessages   = null;
    state.aiSearchQuery = '';
    render();
    fetchAISessionsFull();
  });

  // mini card session rows
  document.querySelectorAll('.ai-session-row').forEach(el =>
    el.addEventListener('click', () => {
      const id = el.dataset.sessionId;
      const s  = (state.recentAISessions || []).find(x => x.session_id === id);
      if (!s) return;
      state.aiConvOpen        = true;
      state.aiSessions        = null;
      state.aiSelectedSession = s;
      state.aiSessionMessages = null;
      state.aiSearchQuery     = '';
      render();
      fetchAISessionsFull();
    }));

  // AI modal — close
  document.getElementById('ai-conv-close')?.addEventListener('click', () => {
    state.aiConvOpen = false;
    render();
  });
  document.getElementById('ai-conv-overlay')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) { state.aiConvOpen = false; render(); }
  });

  // AI modal — search
  document.getElementById('ai-conv-search')?.addEventListener('input', e => {
    state.aiSearchQuery = e.target.value;
    render();
    document.getElementById('ai-conv-search')?.focus();
  });

  // AI stats — toggle
  document.getElementById('ai-stats-toggle')?.addEventListener('click', () => {
    state.aiStatsOpen = !state.aiStatsOpen;
    if (state.aiStatsOpen && !state.aiStatsData) fetchAIStats();
    else render();
  });

  // AI stats — date inputs
  document.getElementById('ai-stats-from')?.addEventListener('change', e => { state.aiStatsFrom = e.target.value; });
  document.getElementById('ai-stats-to')?.addEventListener('change',   e => { state.aiStatsTo   = e.target.value; });

  // AI stats — apply button
  document.getElementById('ai-stats-apply')?.addEventListener('click', () => {
    state.aiStatsData = null;
    state.aiStatsUsers = null;
    state.aiStatsUsersOpen = false;
    fetchAIStats();
  });

  // AI stats — utenti unici card click
  document.getElementById('ai-stats-users-toggle')?.addEventListener('click', () => {
    state.aiStatsUsersOpen = !state.aiStatsUsersOpen;
    if (state.aiStatsUsersOpen && !state.aiStatsUsers) fetchAIStatsUsers();
    else render();
  });

  // AI modal — session selection
  document.querySelectorAll('.ai-session-list-item').forEach(el =>
    el.addEventListener('click', () => {
      const id = el.dataset.sessionId;
      const s  = (state.aiSessions || []).find(x => x.session_id === id);
      if (!s || state.aiSelectedSession?.session_id === id) return;
      fetchAISessionMessages(s);
    }));

  // Premium
  document.getElementById('premium-apply')?.addEventListener('click', () => {
    const from = document.getElementById('premium-from')?.value;
    const to   = document.getElementById('premium-to')?.value;
    if (from) state.premiumFrom = from;
    if (to)   state.premiumTo   = to;
    state.premiumData = null;
    fetchPremium();
  });
  document.getElementById('premium-refresh')?.addEventListener('click', () => {
    state.premiumData = null;
    fetchPremium();
  });

  document.querySelectorAll('[data-funnel-step]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.funnelStep;
      if (state.premiumFunnelSteps.has(key)) {
        if (state.premiumFunnelSteps.size > 1) state.premiumFunnelSteps.delete(key);
      } else {
        state.premiumFunnelSteps.add(key);
      }
      render();
    });
  });
}

// ── INIT ──────────────────────────────────────────────────────────────

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (state.userActivityOpen)  { state.userActivityOpen = false; render(); return; }
    if (state.aiConvOpen)        { state.aiConvOpen = false; render(); return; }
    if (state.feedbackModalOpen) { state.feedbackModalOpen = false; render(); return; }
    if (state.deleteConfirm)     { state.deleteConfirm = null; render(); }
  }
});

(async () => {
  await loadSettings();
  render();
  fetchData();
  fetchSprints();
  fetchBlockedUsers();
  fetchRecentlyUnblocked();
  startAutoRefresh();
})();
