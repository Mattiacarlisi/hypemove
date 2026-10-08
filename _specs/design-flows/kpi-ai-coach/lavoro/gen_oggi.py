# Fila «Oggi» della pagina AI Coach (dashboard KPI interna), fedele a kpi.js / shared.css / kpi.css.
# Si lancia nella cartella WD (quella che contiene project/ e dati.json). Legge measure_oggi.json se c'è
# (posizioni misurate da measure_oggi.py); se manca usa valori di partenza e va lanciato due volte.
import json, html, math, os, re, textwrap
W = json.load(open('dati.json'))
PD = json.load(open('/home/d4nd0n/Dev/HypeMove/www/public/internal/data/ai-prompts-dashboard.json'))
M = json.load(open('measure_oggi.json')) if os.path.exists('measure_oggi.json') else {}
os.makedirs('project', exist_ok=True)
esc = lambda s: html.escape(str(s), quote=True)
it = lambda n: '{:,}'.format(int(n)).replace(',', '.')
def m(board, key, i, default):
    try: return M[board][key][i]
    except Exception: return default

# ------------------------------------------------------------------ CSS vero (shared.css + kpi.css + kpi-coach-benchmark.css), con prefisso .kb
def css(narrow):
    c = '''
.kb{--bg:#0a0a0f;--surface:#111118;--surface2:#1a1a24;--border:#252535;--border2:#333345;--text:#e8e8f0;--muted:#7070a0;--mattia:#4ade80;--red:#f87171;--amber:#fbbf24;--purple:#a78bfa;--accent:#7c3aed;--accent-lo:#1e1030;--radius:10px;--mono:'JetBrains Mono',monospace;
font-family:'Inter',sans-serif;font-size:14px;line-height:1.5;background:#0a0a0f;color:#e8e8f0;position:relative;overflow:hidden}
.kb *,.kb *::before,.kb *::after{box-sizing:border-box;margin:0;padding:0}
.kb code{font-family:monospace}
.kb .sidebar{position:absolute;top:0;left:0;bottom:0;width:220px;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;z-index:100}
.kb .sidebar-logo{padding:20px 20px 16px;border-bottom:1px solid var(--border);display:block}
.kb .logo-mark{font-family:var(--mono);font-size:18px;font-weight:600;color:var(--text);letter-spacing:-0.5px}
.kb .logo-mark span{color:var(--purple)}
.kb .logo-sub{font-size:10px;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-top:2px}
.kb .nav{padding:12px 10px;flex:1}
.kb .nav-section{font-size:10px;color:var(--muted);letter-spacing:1px;text-transform:uppercase;padding:8px 10px 6px}
.kb .nav-item{display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:7px;font-size:13px;color:var(--muted);margin-bottom:2px;border:none;background:none;width:100%;text-align:left}
.kb .nav-item.active{background:var(--accent-lo);color:var(--purple)}
.kb .nav-item .icon{font-size:15px;width:20px;text-align:center}
.kb .main{position:absolute;top:0;left:220px;width:1060px;max-width:1200px;padding:0 32px}
.kb .scr{padding-top:28px;padding-bottom:40px}
.kb .page-header{margin-bottom:28px}
.kb .page-title{font-size:22px;font-weight:700;color:var(--text)}
.kb .page-sub{color:var(--muted);font-size:13px;margin-top:4px}
.kb .page-head-l{display:flex;align-items:center;gap:12px;min-width:0}
.kb .nav-toggle{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;width:34px;height:34px;border-radius:8px;background:var(--surface);border:1px solid var(--border);color:var(--muted)}
.kb .refresh-meta{display:flex;align-items:center;gap:10px;font-size:11px;color:#4a4a68}
.kb .btn-refresh{display:inline-flex;align-items:center;gap:6px;font-family:inherit;font-size:11.5px;padding:5px 12px;background:transparent;border:1px solid var(--border);border-radius:7px;color:var(--muted)}
.kb .card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px}
.kb .card-title{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;color:var(--muted);margin-bottom:14px}
.kb .filter-bar{display:flex;align-items:center;gap:10px;margin-bottom:20px;flex-wrap:wrap}
.kb .filter-label{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.7px}
.kb .form-input{background:var(--surface2);border:1px solid var(--border2);border-radius:7px;color:var(--text);font-size:13px;padding:9px 12px;font-family:'Inter',sans-serif;display:flex;align-items:center;justify-content:space-between}
.kb .form-input.ph{color:var(--muted)}
.kb .btn{padding:9px 18px;border-radius:7px;font-size:13px;font-weight:600;border:none;font-family:'Inter',sans-serif}
.kb .btn-primary{background:var(--accent);color:#fff}
.kb .pulse{}
.kb .cb-card{margin-bottom:16px}
.kb .cb-sub{font-size:13px;color:var(--muted);line-height:1.5;margin-bottom:18px;max-width:760px}
.kb .cb-sub code{font-family:var(--mono);font-size:12px;color:var(--text)}
.kb .cb-row{display:grid;grid-template-columns:210px minmax(0,1fr) 200px;column-gap:20px;align-items:center;padding:12px 0;border-top:1px solid var(--border)}
.kb .cb-row.cb-scale{border-top:0;padding:0 0 4px}
.kb .cb-axis{position:relative;height:16px;font-size:11px;color:var(--muted)}
.kb .cb-goal-lab{position:absolute;right:calc(100% - var(--cb-goal));color:var(--amber);font-weight:700;white-space:nowrap}
.kb .cb-step{font-size:15px;font-weight:700;color:var(--text)}
.kb .cb-model{font-size:12px;color:var(--muted);margin-top:2px}
.kb .cb-track{position:relative;height:22px;border-radius:5px;background:var(--surface2)}
.kb .cb-track::after{content:'';position:absolute;left:var(--cb-goal);top:-12px;bottom:-12px;width:2px;margin-left:-1px;background:var(--amber)}
.kb .cb-fillw{height:100%;overflow:hidden;border-radius:5px 0 0 5px}
.kb .cb-fill{height:100%;border-radius:5px 0 0 5px;background:var(--accent)}
.kb .cb-done .cb-fill{background:var(--mattia);border-radius:5px}
.kb .cb-off .cb-track{background:transparent;border:1.5px dashed var(--border2)}
.kb .cb-val{display:grid;grid-template-columns:auto 1fr;column-gap:10px;align-items:baseline}
.kb .cb-num{font-size:26px;font-weight:800;line-height:1;color:var(--text)}
.kb .cb-state{font-size:12px;color:var(--muted);white-space:nowrap}
.kb .cb-gap{grid-column:1/-1;font-size:12px;font-weight:700;margin-top:4px;color:var(--purple)}
.kb .cb-done .cb-gap{color:var(--mattia)}
.kb .cb-none{grid-column:1/-1;font-size:13px;font-weight:700;color:var(--muted)}
.kb .cb-off .cb-state{grid-column:1/-1;margin-top:2px}
.kb .cb-off .cb-step{color:var(--muted)}
.kb .cb-hist{grid-column:2/-1;font-size:12px;color:var(--muted);margin-top:8px;line-height:1.5}
.kb .cb-note{color:var(--text);opacity:.8}
.kb .mtop{display:flex;align-items:center;gap:10px;position:absolute;top:0;left:0;right:0;z-index:90;padding:10px 14px;background:rgba(10,10,15,.92);backdrop-filter:blur(8px);border-bottom:1px solid var(--border)}
.kb .mtop .logo-mark{font-size:15px}
.kb .mtop-page{margin-left:auto;font-size:12px;color:var(--muted)}
.kb summary{list-style:none}
.kb .ai-conv-tab{cursor:pointer;padding:5px 14px;font-size:12px;font-weight:600;border-radius:20px;border:1.5px solid}
'''
    if narrow:
        c += '''
.kb .main{left:0;width:390px;max-width:none;padding:0 14px}
.kb .scr{padding-top:0;padding-bottom:32px}
.kb .page-head-l{display:none}
.kb .page-header{margin-bottom:14px}
.kb .refresh-meta{width:100%;justify-content:flex-start}
.kb .card{padding:16px}
.kb .btn-refresh,.kb .btn,.kb .form-input{min-height:36px}
.kb .cb-row{grid-template-columns:minmax(0,1fr);row-gap:8px}
.kb .cb-row.cb-scale>div:first-child,.kb .cb-row.cb-scale>div:last-child{display:none}
.kb .cb-hist{grid-column:1;margin-top:0}
'''
    return c

# ------------------------------------------------------------------ pezzi di pagina (copiati dai template di kpi.js)
NAV_PANEL = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M9 4v16"></path></svg>'
NAV_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"></path></svg>'
REFRESH = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36"></path><path d="M21 3v6h-6"></path></svg>'
CAL = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1f1f1f" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M3 10h18M8 3v4M16 3v4"></path></svg>'

def sidebar():
    nav = lambda i, ic, lb: '<button class="nav-item%s"><span class="icon">%s</span>%s</button>' % (' active' if i == 'ai-coach' else '', ic, lb)
    return ('<div class="sidebar"><div class="sidebar-logo"><div class="logo-mark">Hype<span>move</span></div><div class="logo-sub">KPI</div></div>'
            '<nav class="nav"><div class="nav-section">KPI</div>' +
            nav('stats', '📈', 'Stats') + nav('overview', '📊', 'Overview') + nav('funnel', '🎯', 'Funnel') + nav('retention', '🔄', 'Retention') +
            nav('sprint', '🏃', 'Sprint') + nav('premium', '💎', 'Premium') + nav('ai-coach', '🤖', 'AI Coach') + nav('behavior', '🖱️', 'Comportamento') +
            '<div class="nav-section" style="margin-top:8px">Marketing</div>' + nav('meta-ads', '📣', 'Meta ADS') +
            '</nav><div style="padding:14px 20px;border-top:1px solid var(--border);font-size:11px;color:var(--muted)">Mattia &amp; Danilo · 50/50</div></div>')

def mtop():
    return '<div class="mtop"><button class="nav-toggle" aria-label="Apri il menu">%s</button><span class="logo-mark">Hype<span>move</span></span><span class="mtop-page">AI Coach</span></div>' % NAV_ICON

def page_header(narrow):
    head = '' if narrow else ('<div class="page-head-l"><button class="nav-toggle nav-toggle-desk">%s</button><div><div class="page-title">KPI Dashboard</div><div class="page-sub">Metriche prodotto HypeMove · live da Supabase</div></div></div>' % NAV_PANEL)
    return ('<div class="page-header" style="display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap">%s'
            '<div class="refresh-meta"><span>agg. tra «cd»</span><span>ultimo 21:47</span><button class="btn-refresh">%s Aggiorna</button></div></div>') % (head, REFRESH)

def filter_bar(hover=False):
    inp = lambda v: '<div class="form-input" style="width:145px;padding:5px 10px;font-size:12px;height:29px"><span>%s</span>%s</div>' % (v, CAL)
    return ('<div class="filter-bar" style="margin-bottom:20px;flex-wrap:wrap;gap:6px;align-items:center"><span class="filter-label">Periodo</span>' + inp('08/09/2026') +
            '<span style="color:var(--muted)">→</span>' + inp('08/10/2026') +
            '<div id="agg" style="position:relative"><button class="btn btn-primary" style="padding:6px 16px;font-size:12px">Aggiorna</button>'
            '<div style="position:absolute;inset:0;border-radius:7px;background:#6d28d9;opacity:«hv»;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:600;font-family:Inter,sans-serif;pointer-events:none">Aggiorna</div></div></div>')

T = W['uso']['totali']
def kpi_tiles(users_open=False, uk=None):
    fmtK = lambda n: ('%.1fK' % (n / 1000.0)) if n >= 1000 else str(n)
    tt = T['token_in'] + T['token_out']
    avg = T['costo_usd'] / T['utenti_unici']
    errp = '%.1f' % (T['errori'] / float(T['chiamate']) * 100)
    ks = [('Chiamate AI', it(T['chiamate']), 'totale', None), ('Token totali', fmtK(tt), '%s in · %s out' % (fmtK(T['token_in']), fmtK(T['token_out'])), None),
          ('Costo totale', '$%.3f' % T['costo_usd'], '~$%.3f / utente' % avg, None), ('Utenti unici', it(T['utenti_unici']), 'distinti', 'users'),
          ('Sessioni', it(T['sessioni_mostrate']), 'context univoci', None), ('Errori', it(T['errori']), errp + '% delle chiamate', '#e05555')]
    out = ''
    for lb, v, sub, x in ks:
        click = x == 'users'
        acc = x if (x and x != 'users') else None
        bd = '1px solid #1e1e30'
        arrow = ''
        vcol = acc or 'var(--text)'
        extra = ''
        if click:
            arrow = ' <span style="font-size:10px;color:«uc»"><span style="position:relative"><span style="opacity:«ud»">▼</span><span style="position:absolute;left:0;top:0;opacity:«uu»">▲</span></span></span>'
            bd = '1px solid «ub»'; vcol = '«uc»'; extra = ';cursor:pointer;user-select:none'
        out += ('<div %sstyle="background:#12121e;border:%s;border-radius:12px;padding:16px 18px;flex:1;min-width:130px%s">'
                '<div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px">%s%s</div>'
                '<div style="font-size:22px;font-weight:700;color:%s;">%s</div><div style="font-size:11px;color:var(--muted);margin-top:3px">%s</div></div>') % (
                'id="tile_users" ' if click else '', bd, extra, lb, arrow, vcol, v, sub)
    return out

USERS = ['0412', '1873', '0067', '1204', '0951', '1530', '0288', '1747', '0634', '1099', '0825', '1391', '0176', '1662']
def users_table(n=14):
    th = lambda t: '<th style="text-align:left;padding:10px 16px;font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;font-weight:600">%s</th>' % t
    rows = ''.join('<tr style="border-top:1px solid #1e1e30"><td style="padding:9px 16px;font-size:11px;color:var(--muted)">%d</td><td style="padding:9px 16px;font-size:13px;color:var(--fg);font-weight:500">Utente %s</td><td style="padding:9px 16px;font-size:12px;color:var(--muted);font-family:monospace">u•••@•••.com</td></tr>' % (i + 1, u) for i, u in enumerate(USERS[:n]))
    return ('<div id="utbl" style="margin-bottom:24px;background:#12121e;border:1px solid var(--accent);border-radius:12px;overflow:hidden"><table style="width:100%%;border-collapse:collapse"><thead><tr style="background:#1e1a3d">%s%s%s</tr></thead><tbody>%s</tbody></table></div>' % (th('#'), th('Nome'), th('Email'), rows))

def kpi_card_tiles(wrap_id='kcard_t', style=''):
    return '<div id="%s" class="card" style="margin-bottom:16px;%s"><div style="display:flex;flex-wrap:wrap;gap:10px;">%s</div></div>' % (wrap_id, style, kpi_tiles())
def kpi_card_loading(wrap_id='kcard_l', style=''):
    return '<div id="%s" class="card" style="margin-bottom:16px;%s"><div style="padding:30px;text-align:center;color:var(--muted);font-size:12px;opacity:«pu»">Caricamento statistiche…</div></div>' % (wrap_id, style)

# --- benchmark
B = W['benchmark']
def cbDay(q):
    d, t = q.split('T'); return '/'.join(d.split('-')[::-1][:2]) + ' alle ' + t
cbPct = lambda g: int(math.floor(g['giusti'] / float(g['casi']) * 100 + 0.5))
cbCasi = lambda n: '1 caso' if n == 1 else '%d casi' % n
def cb_row(i, p, soglia, anim):
    giri = p['giri']
    name = '<div class="cb-name"><div class="cb-step">%s</div><div class="cb-model">%s</div></div>' % (esc(p['nome']), esc(p.get('modello', '')))
    if not giri:
        return '<div class="cb-row cb-off">%s<div class="cb-track"></div><div class="cb-val"><div class="cb-none">Non ancora misurato</div><div class="cb-state">%s</div></div></div>' % (name, esc(p.get('stato', 'da costruire')))
    u = giri[-1]
    mancano = int(math.ceil(soglia / 100.0 * u['casi'])) - u['giusti']
    risolto = mancano <= 0
    fila = 0
    for g in reversed(giri):
        if g['giusti'] == u['giusti'] and g['casi'] == u['casi']: fila += 1
        else: break
    st = []
    if fila > 1: st.append('Stesso risultato negli ultimi %d giri' % fila)
    if len(giri) > 1: st.append('%d giri in tutto, il primo al %d%% su %s' % (len(giri), cbPct(giri[0]), cbCasi(giri[0]['casi'])))
    st.append('ultimo giro il ' + cbDay(u['quando']))
    nota = '<div class="cb-note">%s</div>' % esc(p['nota']) if p.get('nota') else ''
    w = u['giusti'] / float(u['casi']) * 100
    return ('<div class="cb-row%s">%s<div class="cb-track"><div class="cb-fill" style="width:«bw%d»"></div></div>'
            '<div class="cb-val"><div class="cb-num">%d%%</div><div class="cb-state">%d giusti su %d</div><div class="cb-gap">%s</div></div>'
            '<div class="cb-hist">%s%s</div></div>') % (' cb-done' if risolto else '', name, i, cbPct(u), u['giusti'], u['casi'],
            'Risolto' if risolto else 'Mancano ' + cbCasi(mancano), esc(' · '.join(st)), nota)

BPCT = [(p['giri'][-1]['giusti'] / float(p['giri'][-1]['casi']) * 100) if p['giri'] else 0 for p in B['passaggi']]
def bench_card(wid='bench'):
    soglia = B['soglia']
    mis = [p for p in B['passaggi'] if p['giri']]
    ris = [p for p in mis if p['giri'][-1]['giusti'] >= math.ceil(soglia / 100.0 * p['giri'][-1]['casi'])]
    rows = ''.join(cb_row(i, p, soglia, True) for i, p in enumerate(B['passaggi']))
    return ('<div id="%s" class="card cb-card" style="--cb-goal:%d%%"><div class="card-title" style="margin-bottom:4px">Benchmark del coach a flusso unico</div>'
            '<div class="cb-sub">Casi giusti nell\'ultimo giro di ogni passaggio, nell\'ordine del flusso. Un passaggio è risolto al %d%%.\n Misurati %d su %d, risolti %d.</div>'
            '<div class="cb-rows"><div class="cb-row cb-scale"><div></div><div class="cb-axis"><span>0%%</span><span class="cb-goal-lab">%d%% · risolto</span></div><div></div></div>%s</div></div>') % (
            wid, soglia, soglia, len(mis), len(B['passaggi']), len(ris), soglia, rows)

# --- conversazioni
CH = {c['id']: c for c in W['chat_vere_senza_nomi']}
SP_ORDER = [(18, '08 ott 26', '20:41'), (13, '08 ott 26', '19:12'), (15, '08 ott 26', '18:05'), (6, '08 ott 26', '12:30'), (5, '08 ott 26', '09:48'), (4, '07 ott 26', '22:10'), (3, '07 ott 26', '18:36'), (2, '07 ott 26', '13:02'), (1, '06 ott 26', '21:15')]
FB_ORDER = [(17, '08 ott 26', '20:02'), (16, '08 ott 26', '17:44'), (14, '08 ott 26', '11:25'), (12, '07 ott 26', '19:30'), (11, '07 ott 26', '08:12')]
UNAME = {18: '1873', 13: '0412', 15: '0951', 6: '1530', 5: '0067', 4: '1204', 3: '0288', 2: '1747', 1: '0634', 17: '1099', 16: '0825', 14: '1391', 12: '0176', 11: '1662'}
def shown(c):   # difetto di oggi: la chat parte dal primo messaggio dell'utente, l'apertura del coach non c'è
    ch = list(c['chat'])
    while ch and ch[0]['chi'] == 'coach': ch.pop(0)
    return ch
def sess_item(cid, dt, tm, sel=None):
    c = CH[cid]; ch = shown(c); first = [x for x in c['chat'] if x['chi'] == 'utente'][0]['testo']
    prev = esc(first[:60] + ('…' if len(first) > 60 else ''))
    n = len(c['chat'])
    cnt = '<span style="font-size:9px;background:#2a2a3d;color:var(--muted);padding:1px 6px;border-radius:10px;flex-shrink:0">%d</span>' % n if n > 1 else ''
    if sel in ('a', 'b'):
        bg, bl, nc = '«S.%s_bg»' % sel, '«S.%s_bl»' % sel, '«S.%s_nc»' % sel
    else:
        bg, bl, nc = 'transparent', 'transparent', 'var(--text)'
    return ('<div id="si_%d" style="padding:12px 14px;border-bottom:1px solid #1a1a2e;background:%s;border-left:3px solid %s;">'
            '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px"><span style="font-size:12px;font-weight:600;color:%s">Utente %s</span><span style="font-size:10px;color:var(--muted)">%s %s</span></div>'
            '<div style="display:flex;align-items:center;gap:6px"><span style="font-size:11px;color:var(--muted);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">%s</span>%s</div></div>') % (
            cid, bg, bl, nc, UNAME[cid], dt, tm, prev, cnt)
def chat_panel(cid, dt, tm, opa):
    c = CH[cid]; ch = shown(c); n = len(c['chat'])
    h, mi = int(tm[:2]), int(tm[3:])
    msgs = ''
    for k, x in enumerate(ch):
        t = '%02d:%02d' % (h, mi + k)
        if x['chi'] == 'utente':
            msgs += ('<div style="margin-bottom:14px"><div style="display:flex;align-items:baseline;gap:8px;margin-bottom:4px"><span style="font-size:10px;font-weight:700;color:var(--purple);text-transform:uppercase;letter-spacing:.06em">Utente %s</span><span style="font-size:10px;color:var(--muted)">%s</span></div>'
                     '<div style="background:#1a1a2e;border-radius:10px 10px 10px 2px;padding:10px 14px;font-size:13px;line-height:1.55;max-width:85%%;word-break:break-word">%s</div></div>') % (UNAME[cid], t, esc(x['testo']))
        else:
            msgs += ('<div style="margin-bottom:18px;display:flex;justify-content:flex-end"><div><div style="display:flex;align-items:baseline;gap:8px;margin-bottom:4px;justify-content:flex-end"><span style="font-size:10px;color:var(--muted)">%s</span><span style="font-size:10px;font-weight:700;color:#4ade80;text-transform:uppercase;letter-spacing:.06em">Coach AI</span></div>'
                     '<div style="background:#0d2218;border:1px solid #1a3a28;border-radius:10px 10px 2px 10px;padding:10px 14px;font-size:13px;color:#d1fae5;line-height:1.55;max-width:85%%;word-break:break-word;text-align:left">%s</div></div></div>') % (t, esc(x['testo']))
    day = {'08': '08', '07': '07', '06': '06'}[dt[:2]]
    return ('<div style="position:absolute;inset:0;display:flex;flex-direction:column;opacity:%s"><div style="padding:14px 20px;border-bottom:1px solid #1e1e30;flex-shrink:0"><div style="font-size:12px;font-weight:600;margin-bottom:4px">Utente %s</div>'
            '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px"><span style="font-size:10px;color:var(--muted)">u•••@•••.com</span></div>'
            '<div style="font-size:11px;color:var(--muted)">%s ottobre 2026 · %d %s</div></div><div style="flex:1;overflow-y:auto;padding:20px">%s</div></div>') % (
            opa, UNAME[cid], day, n, 'messaggio' if n == 1 else 'messaggi', msgs)
# (qui sopra «messaggi» + «o» per n=1 diventa «messaggio»: nel codice vero `messaggio${n!==1?'i':''}`; correggo sotto)
def chat_panel_fix(s, n):
    return s.replace('messaggi%s' % ('o' if n == 1 else ''), 'messaggio' if n == 1 else 'messaggi')

def conv_card(tab, order, a, b, tabs_extra=''):
    tb = lambda key, lb, idv: ('<button id="%s" class="ai-conv-tab" style="%s">%s</button>') % (idv, ('background:var(--accent-lo);border-color:var(--accent);color:var(--purple)' if tab == key else 'background:var(--surface2);border-color:#3a3a55;color:var(--text)'), lb)
    funnel = fb_funnel() if tab == 'feedback' else ''
    items = ''.join(sess_item(cid, dt, tm, 'a' if cid == a else ('b' if cid == b else None)) for cid, dt, tm in order)
    d = {cid: (dt, tm) for cid, dt, tm in order}
    pa = chat_panel(a, d[a][0], d[a][1], '«C.a»')
    pb = chat_panel(b, d[b][0], d[b][1], '«C.b»') if b else ''
    return ('<div id="conv" class="card" style="padding:0;overflow:hidden;margin-bottom:16px"><div style="display:flex;align-items:center;gap:10px;padding:14px 18px;border-bottom:1px solid #1e1e30;flex-wrap:wrap">'
            '<div class="card-title" style="margin-bottom:0">Conversazioni</div><div style="display:flex;gap:6px">%s%s%s</div>'
            '<div class="form-input ph" style="width:220px;font-size:12px;padding:5px 10px;margin-left:auto;height:29px">Cerca utente…</div></div>%s'
            '<div style="display:flex;height:560px;min-height:0"><div style="width:300px;flex-shrink:0;border-right:1px solid #1e1e30;overflow-y:auto">%s</div>'
            '<div style="flex:1;display:flex;flex-direction:column;min-width:0;overflow:hidden"><div style="position:relative;flex:1">%s%s</div></div></div></div>') % (
            tb('spontanee', 'Spontanee', 'tab_sp'), tb('feedback', 'Feedback post-workout', 'tab_fb'), tb('paywall', 'Dopo il primo workout', 'tab_pw'), funnel, items, pa, pb)
def conv_card_loading():
    return ('<div id="conv" class="card" style="padding:0;overflow:hidden;margin-bottom:16px"><div style="display:flex;align-items:center;gap:10px;padding:14px 18px;border-bottom:1px solid #1e1e30;flex-wrap:wrap">'
            '<div class="card-title" style="margin-bottom:0">Conversazioni</div><div style="display:flex;gap:6px">'
            '<button class="ai-conv-tab" style="background:var(--accent-lo);border-color:var(--accent);color:var(--purple)">Spontanee</button><button class="ai-conv-tab" style="background:var(--surface2);border-color:#3a3a55;color:var(--text)">Feedback post-workout</button><button class="ai-conv-tab" style="background:var(--surface2);border-color:#3a3a55;color:var(--text)">Dopo il primo workout</button></div>'
            '<div class="form-input ph" style="width:220px;font-size:12px;padding:5px 10px;margin-left:auto;height:29px">Cerca utente…</div></div>'
            '<div style="display:flex;height:560px;min-height:0"><div style="width:300px;flex-shrink:0;border-right:1px solid #1e1e30;overflow-y:auto"><div style="padding:20px;color:var(--muted);font-size:12px;opacity:«pu»">Caricamento sessioni…</div></div>'
            '<div style="flex:1;display:flex;flex-direction:column;min-width:0;overflow:hidden"><div style="flex:1;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:13px">Seleziona una conversazione</div></div></div></div>')

FF = W['uso']['funnel_feedback']
FUSERS = [349, 445, 236]
def fb_funnel():
    steps = [('Notifica schedulata', 'workout_feedback_notification_scheduled', '#fbbf24'), ('Feedback mostrato', 'workout_feedback_shown', '#a78bfa'), ('Risposta utente', 'workout_feedback_replied', '#34d399')]
    boxes = ''
    prev = None
    for i, (lb, ev, col) in enumerate(steps):
        n = FF[ev]; u = FUSERS[i]
        if i > 0:
            conv = '%d%%' % int(math.floor(n / float(prev) * 100 + 0.5))
            boxes += '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 6px;min-width:36px"><div style="font-size:9px;color:var(--muted);font-weight:700;white-space:nowrap">%s</div><div style="font-size:15px;color:#2a2a3d;margin-top:-2px">→</div></div>' % conv
        boxes += ('<div style="flex:1;background:#111120;border:1px solid %s33;border-radius:8px;padding:8px 10px;text-align:center;min-width:0"><div style="font-size:17px;font-weight:800;color:%s;line-height:1">%s</div>'
                  '<div style="font-size:10px;margin-top:3px;font-weight:500">%s</div><div style="font-size:9px;color:var(--muted);margin-top:1px">%d utenti</div></div>') % (col, col, it(n), lb, u)
        prev = n
    return '<div id="funnel" style="padding:12px 18px;border-bottom:1px solid #1e1e30;background:#0d0d17"><div style="display:flex;align-items:center;gap:0">%s</div></div>' % boxes

# --- Prompting
CTX = PD['contexts']; HOME = CTX['home']; RP = CTX['roadmap-premium']
def prompting(open_master=False, loading=False):
    ops = '<button class="btn-outline" style="font-size:12px;padding:6px 12px">🔑 Login ops</button>'
    sub = 'System prompt del Coach (framework v2) · SSOT <code>app/supabase/functions/ai-chat/</code>'
    head = ('<div id="prompt_sec" style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin:26px 0 14px;flex-wrap:wrap"><div><div style="font-size:16px;font-weight:700">Prompting</div>'
            '<div style="font-size:12px;color:var(--muted);margin-top:2px">%s</div></div><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">%s</div></div>') % (sub, ops)
    if loading:
        return head + '<div class="card" style="margin-bottom:16px"><div style="padding:30px;text-align:center;color:var(--muted);font-size:12px;opacity:«pu»">Caricamento snapshot prompt…</div></div>'
    bud = PD['budget']
    meta = ('<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px;font-size:12px;color:var(--muted)"><div>Versione: <code style="color:var(--text)">%s</code></div><div>Hash: <code style="color:var(--text)">%s</code></div>'
            '<div>Generato: <span style="color:var(--text)">%s</span></div><div>Budget: <span style="color:var(--text)">warn %s · fail %s</span></div></div>') % (
            PD['promptVersion'], PD['promptsHash'][:12], PD['generatedAt'][:19].replace('T', ' '), it(bud['warnChars']), it(bud['failChars']))
    def part_items(parts, kind, master_open):
        out = ''
        for p in parts:
            lab = p.get('label') or p['id']
            summ = ('<summary id="%s" style="padding:8px 12px;display:flex;align-items:baseline;justify-content:space-between;gap:8px;font-size:12.5px"><span style="display:inline-flex;align-items:baseline;gap:6px;flex-wrap:wrap">'
                    '<span style="font-size:10px;color:var(--muted);display:inline-block;position:relative;width:9px;height:12px">%s</span><span style="font-weight:600">%s</span></span><span style="display:inline-flex;align-items:baseline;gap:8px"><span style="font-size:11px;color:var(--muted)">%s char</span></span></summary>')
            if master_open and p['id'] == 'master':
                lines = []
                for para in p['content'].split('\n'):
                    lines += textwrap.wrap(para, 100) or ['']
                lines = lines[:56]
                hpre = len(lines) * 19.375 + 24 + 1
                out += ('<div style="margin-bottom:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg);overflow:hidden">' + summ % ('pm_sum', '<span style="position:absolute;left:0;top:0;opacity:«ar0»">▸</span><span style="position:absolute;left:0;top:0;opacity:«ar1»">▾</span>', esc(lab), it(len(p['content']))) +
                        '<div style="height:«ph»px;overflow:hidden"><pre style="white-space:pre;background:var(--surface);border-top:1px solid var(--border);padding:12px 14px;margin:0;font-size:12.5px;line-height:1.55;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--text);height:%.3fpx;overflow:hidden">%s</pre></div></div>' % (hpre, esc('\n'.join(lines))))
            else:
                out += '<div style="margin-bottom:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg);overflow:hidden">' + summ % ('', '▸', esc(lab), it(len(p['content']))) + '</div>'
        return out
    def parts_html(parts, master_open):
        g = {}
        for p in parts: g.setdefault(p['kind'], []).append(p)
        o = ''
        for kind, kl in (('master', 'Master'), ('skills', 'Skills'), ('flow', 'Flow')):
            if kind not in g: continue
            arr = g[kind]; ch = sum(len(p['content']) for p in arr)
            o += ('<div class="card" style="padding:14px 16px;margin-bottom:12px"><div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px"><div style="font-size:13px;font-weight:700">%s <span style="font-weight:400;color:var(--muted);font-size:11px;margin-left:6px">%d %s</span></div>'
                  '<div style="font-size:11px;color:var(--muted)">%s char totali</div></div>%s</div>') % (kl, len(arr), 'sezione' if len(arr) == 1 else 'sezioni', it(ch), part_items(arr, kind, master_open))
        return o
    def tools_html(tools):
        o = ''
        for t in tools:
            sd = (t.get('description') or '')[:80] + ('…' if len(t.get('description') or '') > 80 else '')
            o += ('<div class="card" style="padding:0;margin-bottom:8px;border:1px solid var(--border);border-radius:8px;overflow:hidden"><div style="padding:10px 14px;display:flex;align-items:baseline;gap:8px;flex-wrap:wrap">'
                  '<span style="font-size:10px;color:var(--muted)">▸</span><code style="font-size:13px;font-weight:700">%s</code><span style="font-size:11px;color:var(--muted);font-weight:400;margin-left:6px">%s</span></div></div>') % (esc(t['name']), esc(sd))
        return o
    lab = lambda txt: '<div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">%s</div>' % txt
    det = lambda txt: '<div style="margin-top:10px;font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px">▸ %s</div>' % txt
    tot = HOME['totalChars']
    bcol = 'var(--red)' if tot >= bud['failChars'] else ('var(--amber)' if tot >= bud['warnChars'] else 'inherit')
    chat = ('<div class="card" style="padding:16px 18px;margin-bottom:16px"><div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:4px"><div><div style="font-size:15px;font-weight:700">Chat Coach · master + 16 skills</div>'
            '<div style="font-size:12px;color:var(--muted);margin-top:2px">Prompt unico — la chat AI si apre solo dalla Home. %d sezioni.</div></div><div style="text-align:right"><div style="font-size:20px;font-weight:800;color:%s">%s</div><div style="font-size:11px;color:var(--muted)">char totali</div></div></div>'
            '%s<div style="margin-top:14px">%s%s</div>%s%s'
            '<div style="font-size:11px;color:var(--muted);margin-top:12px;line-height:1.5">ℹ A runtime al prompt vengono concatenati il PT context e il contextData snippet dell\'utente corrente — dinamici, non presenti in questo snapshot.</div></div>') % (
            len(HOME['parts']), bcol, it(tot), parts_html(HOME['parts'], open_master), lab('Tool whitelist (%d)' % len(HOME['tools'])), tools_html(HOME['tools']), det('Nota contesto (contexts.ts)'), det('Tool più usati nel periodo'))
    rp = ('<div class="card" style="padding:16px 18px;margin-bottom:16px"><div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:4px"><div><div style="font-size:15px;font-weight:700">Roadmap Premium · flow server-driven</div>'
          '<div style="font-size:12px;color:var(--muted);margin-top:2px">Generazione workout real-time (non chat). Auto-contenuto: non eredita master né skills.</div></div><div style="text-align:right"><div style="font-size:20px;font-weight:800">%s</div><div style="font-size:11px;color:var(--muted)">char totali</div></div></div>'
          '%s<div style="margin-top:14px">%s%s</div>%s</div>') % (it(RP['totalChars']), parts_html(RP['parts'], False), lab('Tool whitelist (%d)' % len(RP['tools'])), tools_html(RP['tools']), det('Nota contesto (contexts.ts)'))
    src = det('File sorgente (%d)' % len(HOME['sourceFiles']))
    return head + meta + chat + rp + src

# ------------------------------------------------------------------ impalcatura animata
JS = r'''class Component extends DCLogic {
  componentDidMount() {
    if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.t0 = performance.now();
    const loop = () => { this.forceUpdate(); this.raf = requestAnimationFrame(loop); };
    this.raf = requestAnimationFrame(loop);
  }
  componentWillUnmount() { cancelAnimationFrame(this.raf); }
  renderVals() {
    const C = __C__;
    const MM = (typeof window !== 'undefined' && window.__M);
    const P = C.P;
    const t = this.t0 ? ((performance.now() - this.t0) / 1000) % P : C.TS;
    const cl = (x) => Math.max(0, Math.min(1, x));
    const p = (a, d) => cl((t - a) / d);
    const out = (x) => 1 - Math.pow(1 - x, 3);
    const inout = (x) => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    const f = (x, d) => x.toFixed(d === undefined ? 3 : d);
    const ent = (a) => { const k = MM ? 1 : out(p(a, 0.5)); return { o: f(k), tf: 'translateY(' + f(12 * (1 - k), 1) + 'px)' }; };
    const mix = (a, b, k) => 'rgba(' + [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * k)).join(',') + ',' + f(a[3] + (b[3] - a[3]) * k) + ')';
    let px = C.S[0], py = C.S[1], lx = px, ly = py;
    C.W.forEach((w) => { const g = inout(p(w[2] - 0.8, 0.8)); px += (w[0] - lx) * g; py += (w[1] - ly) * g; lx = w[0]; ly = w[1]; });
    const tap = (a) => { const k = a ? p(a[2], 0.45) : 0; return a ? { x: (a[0] - 40) + 'px', y: (a[1] - 40) + 'px', o: k > 0 && k < 1 ? f(0.3 * (1 - k)) : 0, tf: 'scale(' + f(0.3 + 0.6 * out(k)) + ')' } : { x: '0px', y: '0px', o: 0, tf: 'none' }; };
    let sy = 0; C.SC.forEach((s) => { sy += (s[1] - s[0]) * inout(p(s[2], s[3])); sy -= 0; });
    if (MM) sy = 0;
    const secs = Math.max(0, C.CD - Math.floor(t));
    const V = {
      veil: MM ? 0 : f(Math.max(1 - p(0, 0.2), p(P - 0.3, 0.3))),
      pt: { x: f(px - 2, 1) + 'px', y: f(py - 2, 1) + 'px' }, tp1: tap(C.T[0]), tp2: tap(C.T[1]),
      sy: f(sy, 1) + 'px', pu: f(0.7 + 0.3 * Math.cos(2 * Math.PI * t / 1.2)),
      cd: Math.floor(secs / 60) + ':' + ('0' + (secs % 60)).slice(-2),
      ub: 'rgb(30,30,48)', uc: 'rgb(232,232,240)', ud: '1', uu: '0', e1: ent(0.2), e2: ent(0.35), e3: ent(0.5), e4: ent(0.65), e5: ent(0.8), hv: '0'
    };
    for (let i = 0; i < 7; i++) V['bw' + i] = f(C.BP[i] * (MM ? 1 : out(p(0.9 + 0.08 * i, 0.7))), 1) + '%';
    __EXTRA__
    return V;
  }
}'''

def build(name, title, w, h, body, C, extra='', narrow=False, pointer=True):
    base = dict(BP=BPCT, P=9, TS=3, S=[w - 120, h - 80], W=[], T=[], SC=[], CD=272)
    base.update(C); base['T'] = (base['T'] + [None] * 2)[:2]
    ov = ''.join('<div style="position:absolute;left:«tp%d.x»;top:«tp%d.y»;width:80px;height:80px;border-radius:40px;background:#ffffff;opacity:«tp%d.o»;transform:«tp%d.tf»;pointer-events:none"></div>' % (i, i, i, i) for i in (1, 2))
    if pointer:
        ov += '<svg width="22" height="26" viewBox="0 0 22 26" style="position:absolute;left:«pt.x»;top:«pt.y»;display:block;z-index:300" aria-hidden="true"><path d="M2 2l16 12-7 1.500 4 8-3 1.500-4-8-6 4z" fill="#ffffff" stroke="#0a0a0f" stroke-width="1.500" stroke-linejoin="round"></path></svg>'
    ov += '<div style="position:absolute;left:0;top:0;width:%dpx;height:%dpx;background:#0a0a0f;opacity:«veil»;pointer-events:none;z-index:400"></div>' % (w, h)
    s = '''<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<title>%s</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&amp;family=JetBrains+Mono:wght@400;600&amp;display=swap">
<style>
body{margin:0;background:#0a0a0f}
%s
</style>
</helmet>
<div class="kb" style="width: %dpx; height: %dpx">
%s%s
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":%d,"height":%d}}'>
%s
</script>
</body>
</html>
''' % (title, css(narrow), w, h, body, ov, w, h, JS.replace('__C__', json.dumps(base)).replace('__EXTRA__', extra))
    s = s.replace('«', '{{').replace('»', '}}')
    open('project/' + name, 'w').write(s)

def desk(inner, with_sidebar=True):   # pagina desktop: barra laterale fissa + main che scorre
    return sidebar() + '<div class="main"><div class="scr" style="transform:translateY(-«sy»)">' + inner + '</div></div>'

EX_ENTER = '''
    V.cb = ent(0.5);'''
def blk(n, inner):  # blocco con ingresso
    return '<div style="opacity:«e%d.o»;transform:«e%d.tf»">%s</div>' % (n, n, inner)

# =========================================================== 1 - Pagina oggi
b1 = 'main'
HT = m(b1, 'kcard_t', 3, 112) + 16; HL = m(b1, 'kcard_l', 3, 88) + 16
AGG = (m(b1, 'agg', 0, 520) + m(b1, 'agg', 2, 80) / 2.0, m(b1, 'agg', 1, 150) + m(b1, 'agg', 3, 30) / 2.0)
body = desk(blk(1, page_header(False)) + blk(2, filter_bar()) +
            blk(3, '<div style="position:relative;height:«kh»;margin-bottom:0">' +
                kpi_card_tiles('kcard_t', 'position:absolute;left:0;right:0;top:0;opacity:«tl»') + kpi_card_loading('kcard_l', 'position:absolute;left:0;right:0;top:0;opacity:«ld»') + '</div>') +
            blk(4, bench_card()))
CK = 4.2
ex = '''
    const ld = MM ? 0 : p(C.CK + 0.05, 0.01) * (1 - p(C.CK + 1.5, 0.01));
    V.ld = f(ld); V.tl = f(1 - ld); V.kh = f(C.HT + (C.HL - C.HT) * ld, 1) + 'px' ;
    V.hv = f(p(C.CK - 0.9, 0.2) * (MM ? 0 : 1));
    V.kh = V.kh;'''
build('Main.dc.html', '1 - Pagina oggi', 1280, 720, body,
      dict(P=9, TS=3, HT=HT, HL=HL, CK=CK, S=[1150, 640], W=[[AGG[0] + 6, AGG[1] + 4, CK - 0.3]], T=[[AGG[0] + 6, AGG[1] + 4, CK]]), ex)
# il margine sotto la card dei riquadri è dentro .card (margin-bottom:16): con position:absolute non conta, lo rimettiamo nel contenitore
# =========================================================== 2 - Caricamento
body = desk(blk(1, page_header(False)) + blk(2, filter_bar()) + blk(3, kpi_card_loading('kcard_l')) + blk(4, bench_card()) + blk(5, conv_card_loading()))
build('oggi-2-caricamento.dc.html', '2 - Caricamento', 1280, 720, body, dict(P=6, TS=2, S=[1000, 600]), '', pointer=False)
# =========================================================== 3 - Utenti aperti
b3 = 'utenti'
UT_H = m(b3, 'utbl', 3, 600); UL_H = 56 - 14 + 14 - 14 + 42  # riga caricamento: 12+18+12
TILE = (m(b3, 'tile_users', 0, 700) + 110, m(b3, 'tile_users', 1, 160) + 100)
ut = ('<div style="height:«uh»;overflow:hidden"><div style="padding-top:14px;position:relative"><div style="opacity:«ul»;position:absolute;padding:12px 0;color:var(--muted);font-size:12px">Caricamento utenti…</div>'
      '<div style="opacity:«ut»">' + users_table() + '</div></div></div>')
kcard = '<div id="kcard_t" class="card" style="margin-bottom:16px"><div style="display:flex;flex-wrap:wrap;gap:10px;">%s</div>%s</div>' % (kpi_tiles(), ut)
body = desk(blk(1, page_header(False)) + blk(2, filter_bar()) + blk(3, kcard) + blk(4, bench_card()))
CK = 3.0
ex = '''
    const k0 = MM ? 1 : p(C.CK, 0.12), k1 = MM ? 1 : p(C.CK + 0.8, 0.12);
    V.ub = mix([30, 30, 48, 1], [124, 58, 237, 1], k0); V.uc = mix([232, 232, 240, 1], [124, 58, 237, 1], k0);
    V.ud = f(1 - k0); V.uu = f(k0);
    V.ul = f(k0 * (1 - k1)); V.ut = f(k1);
    const hl = 14 + 42, hf = 14 + C.UT + 24;
    V.uh = f(MM ? hf : (k0 * hl + (hf - hl) * k1), 1) + 'px';
    V.hv = '0';'''
build('oggi-3-utenti-aperti.dc.html', '3 - Utenti aperti', 1280, 720, body,
      dict(P=8, TS=5, UT=UT_H, CK=CK, S=[1150, 620], W=[[TILE[0], TILE[1], CK - 0.3]], T=[[TILE[0], TILE[1], CK]]), ex)
# =========================================================== 4 - Conversazioni
b4 = 'conv'
SC4 = m(b4, 'conv', 1, 520) - 28 + 0
LIST_B = (m(b4, 'si_13', 0, 240) + 230, m(b4, 'si_13', 1, 700) - SC4 + 30)
body = desk(blk(1, page_header(False)) + blk(2, filter_bar()) + blk(3, kpi_card_tiles()) + blk(4, bench_card()) + blk(5, conv_card('spontanee', SP_ORDER, 18, 13)))
CK = 4.4
ex = '''
    const k = MM ? 0 : p(C.CK, 0.1), hov = MM ? 0 : p(C.CK - 0.8, 0.15) * (1 - k);
    const un = [232, 232, 240, 1], pu = [167, 139, 250, 1];
    V.S = { a_bg: mix([30, 26, 61, 1], [30, 26, 61, 0], k), a_bl: mix([124, 58, 237, 1], [124, 58, 237, 0], k), a_nc: mix(pu, un, k),
            b_bg: k > 0 ? mix([20, 20, 31, 1], [30, 26, 61, 1], k) : mix([20, 20, 31, 0], [20, 20, 31, 1], hov), b_bl: mix([124, 58, 237, 0], [124, 58, 237, 1], k), b_nc: mix(un, pu, k) };
    V.C = { a: f(1 - k), b: f(k) };'''
build('oggi-4-conversazioni.dc.html', '4 - Conversazioni spontanee', 1280, 720, body,
      dict(P=8, TS=2, CK=CK, SC=[[0, SC4, 0.3, 1.1]], S=[1150, 620], W=[[LIST_B[0], LIST_B[1], CK - 0.3]], T=[[LIST_B[0], LIST_B[1], CK]]), ex)
# =========================================================== 5 - Feedback
b5 = 'feedback'
SC5 = m(b5, 'conv', 1, 520) - 28
LIST_F = (m(b5, 'si_16', 0, 240) + 230, m(b5, 'si_16', 1, 760) - SC5 + 30)
body = desk(blk(1, page_header(False)) + blk(2, filter_bar()) + blk(3, kpi_card_tiles()) + blk(4, bench_card()) + blk(5, conv_card('feedback', FB_ORDER, 17, 16)))
build('oggi-5-feedback.dc.html', '5 - Feedback post-workout', 1280, 720, body,
      dict(P=8, TS=2, CK=CK, SC=[[0, SC5, 0.3, 1.1]], S=[1150, 620], W=[[LIST_F[0], LIST_F[1], CK - 0.3]], T=[[LIST_F[0], LIST_F[1], CK]]), ex)
# =========================================================== 6 - Prompting
b6 = 'prompting'
SC6 = m(b6, 'prompt_sec', 1, 2000) - 28 - 20
PM = (m(b6, 'pm_sum', 0, 270) + 120, m(b6, 'pm_sum', 1, 2400) - SC6 + 12)
body = desk(blk(1, page_header(False)) + blk(2, filter_bar()) + blk(3, kpi_card_tiles()) + blk(4, bench_card()) + blk(5, conv_card('spontanee', SP_ORDER, 18, None)) + prompting(open_master=True))
CK = 4.4
ex = '''
    const k = MM ? 1 : p(C.CK, 0.15);
    V.ph = f(C.PH * k, 1); V.ar0 = f(1 - k); V.ar1 = f(k);
    V.S = { a_bg: 'rgba(30,26,61,1)', a_bl: 'rgba(124,58,237,1)', a_nc: 'rgb(167,139,250)' }; V.C = { a: '1', b: '0' };'''
PH = 56 * 19.375 + 25
build('oggi-6-prompting.dc.html', '6 - Prompting', 1280, 720, body,
      dict(P=9, TS=6, CK=CK, PH=PH, SC=[[0, SC6, 0.3, 1.6]], S=[1150, 620], W=[[PM[0], PM[1], CK - 0.3]], T=[[PM[0], PM[1], CK]]), ex)
# =========================================================== 7 - Finestra stretta (390x844, media query vere a 900/560 px)
b7 = 'stretta'
MT = 56
Y1 = m(b7, 'bench', 1, 700) - MT - 14 - 4
Y2 = m(b7, 'conv', 1, 1500) - MT - 14 - 4
body = ('<div class="main"><div class="scr" style="transform:translateY(-«sy»);padding-top:%dpx">' % (MT + 14) +
        blk(1, page_header(True)) + blk(2, filter_bar()) + blk(3, kpi_card_tiles()) + blk(4, bench_card()) + blk(5, conv_card('spontanee', SP_ORDER, 18, None)) + '</div></div>' + mtop())
ex = '''
    V.S = { a_bg: 'rgba(30,26,61,1)', a_bl: 'rgba(124,58,237,1)', a_nc: 'rgb(167,139,250)' }; V.C = { a: '1', b: '0' };'''
build('oggi-7-finestra-stretta.dc.html', '7 - Finestra stretta', 390, 844, body,
      dict(P=11, TS=1, SC=[[0, Y1, 1.2, 1.4], [0, Y2 - Y1, 3.6, 1.6], [0, -Y2, 7.4, 1.8]], S=[300, 700]), ex, narrow=True, pointer=False)
print('ok')
