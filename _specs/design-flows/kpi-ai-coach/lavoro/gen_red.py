#!/usr/bin/env python3
# Redesign «AI Coach» (dashboard KPI, tema Notte): 2A tutto in colonna + 1C lungo il flusso + 3A elenco che si apre, fusi in una pagina.
# Cinque tavole: red-1-pagina, red-2-caricamento, red-3-utenti-aperti, red-4-conversazione, red-5-feedback.
# Dati veri: dati.json. Si lancia ovunque: lavora nella sua cartella.
import json, os, re, math, html as HT
from decimal import Decimal, ROUND_HALF_UP
WD = os.path.dirname(os.path.abspath(__file__)); os.chdir(WD); os.makedirs('project', exist_ok=True)
DATI = json.load(open('dati.json'))
# ---------------------------------------------------------------- palette Notte
BG, CARD, BRD, SH, INK, SEC, TER = '#0f1115', '#1a1d24', '#2a2e37', '#050608', '#ffffff', '#9ca3af', '#6f7683'
BLU, LB, ORG, GRN, RED, SEL = '#4361ee', '#8da2ff', '#fb8b04', '#4ade80', '#f87171', '#262d45'
NEST, GRID, RAISED = '#14171d', '#23272f', '#20242d'
NF = ('family=Nunito:wght@500;600;700;800', 'Nunito, system-ui, sans-serif')
fi = lambda n: format(int(n), ',').replace(',', '.')
def fd(x, d=2): return str(Decimal(str(round(x, 4))).quantize(Decimal(1).scaleb(-d), rounding=ROUND_HALF_UP)).replace('.', ',')
R1 = lambda x: round(x, 1)
esc = lambda s: HT.escape(s, quote=False)
# ---------------------------------------------------------------- misure della cornice
SBW = 220                      # barra laterale
CX, CW = 32, 996               # contenuto: margine 32, larghezza 996 (area 1060)
# ---------------------------------------------------------------- dati
G = DATI['uso']['giorni']                      # [giorno, chiamate, utenti, costo, errori]
assert len(G) == 31 and sum(g[1] for g in G) == 17464 and sum(g[4] for g in G) == 480
PER = {'M': G, 'W': G[-7:]}
def total(per, i): return sum(g[i] for g in PER[per])
BIG = {'p': {'M': fi(round(total('M', 2) / 31.0)), 'W': fi(round(total('W', 2) / 7.0))},
       'c': {'M': fd(total('M', 3)) + ' $', 'W': fd(total('W', 3)) + ' $'},
       'e': {'M': fi(total('M', 4)), 'W': fi(total('W', 4))}}
SUB = {'p': {'M': 'al giorno', 'W': 'al giorno'}, 'c': {'M': 'ultimo mese', 'W': 'ultima settimana'}, 'e': {'M': 'ultimo mese', 'W': 'ultima settimana'}}
SP = {'p': dict(title='Persone', i=2, color=LB, ymax={'M': 200, 'W': 200}, ticks={'M': [(100, '100'), (200, '200')], 'W': [(100, '100'), (200, '200')]},
                tip=lambda d, v: '%s · %s persone' % (d, fi(v)), lab=lambda v: fi(v), zero=False),
      'c': dict(title='Costo', i=3, color=LB, ymax={'M': 5, 'W': 3}, ticks={'M': [(2.5, '2,5 $'), (5, '5 $')], 'W': [(1.5, '1,5 $'), (3, '3 $')]},
                tip=lambda d, v: '%s · %s $' % (d, fd(v)), lab=lambda v: fd(v), zero=False),
      'e': dict(title='Errori', i=4, color=RED, ymax={'M': 200, 'W': 100}, ticks={'M': [(100, '100'), (200, '200')], 'W': [(50, '50'), (100, '100')]},
                tip=lambda d, v: '%s · %s %s' % (d, fi(v), 'errore' if v == 1 else 'errori'), lab=lambda v: fi(v), zero=True)}
CALLS = DATI['uso']['chiamate_per_contesto']; CT = DATI['uso']['totali']['chiamate']
chat_n = sum(CALLS[k] for k in ('home', 'workout-details', 'paywall-giorno-zero'))
plan_n = sum(CALLS[k] for k in ('plan_fill_jev', 'plan_fill_schema', 'plan_recalibrate', 'plan-module', 'plan-outline', 'plan-module-rewrite'))
oth_n = sum(CALLS[k] for k in ('memory-review', 'coach-checkin', 'memory', 'profile'))
BARS = [('Piano premium', CALLS['roadmap-premium']), ('Nota post-allenamento', CALLS['workout-coach-note']), ('Creazione piano', plan_n),
        ('Feedback allenamento', CALLS['workout-feedback']), ('Chat', chat_n), ('Foto pasto', CALLS['meal-scan']), ('Altro', oth_n)]
assert sum(b[1] for b in BARS) == CT
BARS.sort(key=lambda b: -b[1]); BARS = [b for b in BARS if b[0] != 'Altro'] + [b for b in BARS if b[0] == 'Altro']
FF = DATI['uso']['funnel_feedback']
FEED = [('Notifiche', FF['workout_feedback_notification_scheduled']), ('Mostrati', FF['workout_feedback_shown']), ('Risposte', FF['workout_feedback_replied'])]
PAS = DATI['benchmark']['passaggi']
CH = {c['id']: c for c in DATI['chat_vere_senza_nomi']}
EMO = re.compile('[\U0001F300-\U0001FAFF☀-➿]️?')
for c in CH.values():
    for t in c['chat']: t['testo'] = re.sub(r'\s+', ' ', EMO.sub('', t['testo'])).strip()
SCR = {'workout-feedback': 'Fine workout', 'home': 'Home', 'workout-details': 'Dettaglio workout', None: '—'}
META = {18: ('Utente 1873', '08/10', '21:42'), 13: ('Utente 0412', '08/10', '20:15'), 6: ('Utente 2290', '07/10', '22:08'),
        2: ('Utente 0731', '06/10', '21:30'), 1: ('Utente 3056', '04/10', '20:47'), 15: ('Utente 1124', '02/10', '22:20'),
        14: ('Utente 0958', '08/10', '21:05'), 17: ('Utente 2417', '07/10', '20:36'), 11: ('Utente 1530', '06/10', '22:12'),
        12: ('Utente 3342', '05/10', '21:19'), 3: ('Utente 0617', '04/10', '20:58'), 4: ('Utente 2873', '03/10', '21:44'),
        5: ('Utente 1409', '02/10', '22:03'), 16: ('Utente 0845', '05/10', '21:51')}
TABS = [('Spontanee', [18, 13, 6, 2, 1, 15]), ('Post-workout', [14, 17, 11, 12, 3, 4, 5]), ('Primo workout', [16])]
who = lambda i: META[i][0]; when = lambda i: META[i][1] + ' · ' + META[i][2]; scr = lambda i: SCR[CH[i]['schermata']]
def first(i, chi):
    for t in CH[i]['chat']:
        if t['chi'] == chi: return t['testo']
    return None
USERS = ['0412', '1873', '0067', '1204', '0951', '1530', '0288', '1747', '0634', '1099', '0825', '1391', '0176', '1662']

# ---------------------------------------------------------------- canali di animazione: ogni valore è funzione pura di t
class Reg:
    def __init__(s): s.k = {}; s.n = 0
    def ch(s, kf, m='i'):
        n = 'c%d' % s.n; s.n += 1; s.k[n] = {'m': m, 'k': [[round(a, 3), round(b, 3)] for a, b in kf]}; return n
    def v(s, kf, m='i'): return '«K.%s»' % s.ch(kf, m)
    def ent(s, a, dy=14):
        return 'opacity: %s; transform: translateY(%spx);' % (s.v([[a, 0], [a + .5, 1]], 'o'), s.v([[a, dy], [a + .5, 0]], 'o'))
    def pop(s, a, org):
        return 'opacity: %s; transform: scale(%s); transform-origin: %s;' % (s.v([[a, 0], [a + .22, 1]], 'l'), s.v([[a, .6], [a + .5, 1]], 'p'), org)
    def win(s, a, b, d=.18): return s.ch([[a, 0], [a + d, 1], [b, 1], [b + d, 0]], 'l')

JS = '''class Component extends DCLogic {
  componentDidMount() {
    if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.t0 = performance.now();
    const loop = () => { this.forceUpdate(); this.raf = requestAnimationFrame(loop); };
    this.raf = requestAnimationFrame(loop);
  }
  componentWillUnmount() { cancelAnimationFrame(this.raf); }
  renderVals() {
    const C = __C__;
    const P = C.P;
    const t = this.t0 ? ((performance.now() - this.t0) / 1000) % P : C.TS;
    const cl = (x) => Math.max(0, Math.min(1, x));
    const p = (a, d) => cl((t - a) / d);
    const out = (x) => 1 - Math.pow(1 - x, 3);
    const inout = (x) => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    const pop = (x) => x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.exp(-6 * x) * Math.cos(9 * x);
    const f = (x, d) => x.toFixed(d === undefined ? 3 : d);
    const K = {};
    for (const n in C.K) {
      const c = C.K[n], k = c.k; let v = k[0][1];
      for (let i = 0; i < k.length - 1; i++) {
        if (t >= k[i][0]) {
          const g = cl((t - k[i][0]) / (k[i + 1][0] - k[i][0]));
          const e = c.m === 'p' ? pop(g) : c.m === 'o' ? out(g) : c.m === 'l' ? g : inout(g);
          v = k[i][1] + (k[i + 1][1] - k[i][1]) * e;
        }
      }
      K[n] = f(v, 3);
    }
    let px = C.S[0], py = C.S[1], lx = px, ly = py;
    C.W.forEach((w) => { const g = inout(p(w[2] - 0.8, 0.8)); px += (w[0] - lx) * g; py += (w[1] - ly) * g; lx = w[0]; ly = w[1]; });
    const tap = (a) => { const k = a ? p(a[2], 0.45) : 0; return a ? { x: (a[0] - 40) + 'px', y: (a[1] - 40) + 'px', o: k > 0 && k < 1 ? f(0.25 * (1 - k)) : 0, tf: 'scale(' + f(0.3 + 0.6 * out(k)) + ')' } : { x: '0px', y: '0px', o: 0, tf: 'none' }; };
    return {
      veil: f(Math.max(1 - p(0, 0.2), p(P - 0.3, 0.3))), K,
      pt: { x: f(px, 1) + 'px', y: f(py, 1) + 'px' },
      tp1: tap(C.T[0]), tp2: tap(C.T[1]), tp3: tap(C.T[2]), tp4: tap(C.T[3])
    };
  }
}'''

def page_html(R, title, W, H, body, C, pointer=True):
    base = dict(P=10, TS=5, S=[1100, 400], W=[], T=[]); base.update(C); base['T'] = (base['T'] + [None] * 4)[:4]; base['K'] = R.k
    ov = ''.join('<div style="position: absolute; left: «tp%d.x»; top: «tp%d.y»; width: 80px; height: 80px; border-radius: 40px; background: #ffffff; opacity: «tp%d.o»; transform: «tp%d.tf»; pointer-events: none"></div>' % (i, i, i, i) for i in (1, 2, 3, 4))
    if pointer:
        ov += '<svg width="22" height="26" viewBox="0 0 22 26" style="position: absolute; left: «pt.x»; top: «pt.y»; display: block; pointer-events: none" aria-hidden="true"><path d="M2 2l16 12-7 1.500 4 8-3 1.500-4-8-6 4z" fill="#ffffff" stroke="#0f1115" stroke-width="1.500" stroke-linejoin="round"></path></svg>'
    ov += '<div style="position: absolute; left: 0; top: 0; width: %dpx; height: %dpx; background: %s; opacity: «veil»; pointer-events: none"></div>' % (W, H, BG)
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
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?%s&amp;display=swap">
<style>
body{margin:0;background:%s}
</style>
</helmet>
<div style="width: %dpx; height: %dpx; position: relative; overflow: hidden; box-sizing: border-box; background: %s; color: %s; font-family: %s">
%s%s
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":%d,"height":%d}}'>
%s
</script>
</body>
</html>
''' % (title, NF[0], BG, W, H, BG, INK, NF[1], body, ov, W, H, JS.replace('__C__', json.dumps(base)))
    return s.replace('«', '{{').replace('»', '}}')
def save(name, title, W, H, R, body, C, pointer=True):
    open('project/' + name, 'w').write(page_html(R, title, W, H, body, C, pointer)); print('scritto', name, W, H)

# ---------------------------------------------------------------- mattoncini
def ab(x, y, w, h, st='', inner=''):
    g = 'position: absolute; left: %spx; top: %spx; ' % (R1(x), R1(y))
    if w is not None: g += 'width: %spx; ' % R1(w)
    if h is not None: g += 'height: %spx; ' % R1(h)
    return '<div style="%s%s">%s</div>' % (g, st, inner)
def txt(x, y, t, fs=14, fw=700, col=SEC, st='', lh=None):
    return ab(x, y, None, None, 'font-size: %dpx; font-weight: %d; line-height: %dpx; color: %s; white-space: nowrap; %s' % (fs, fw, lh or round(fs * 1.3), col, st), t)
def ic(d, sz=20, col=SEC, sw=2, st=''):
    return '<svg width="%s" height="%s" viewBox="0 0 24 24" fill="none" stroke="%s" stroke-width="%s" stroke-linecap="round" stroke-linejoin="round" style="display: block; flex: none; %s" aria-hidden="true">%s</svg>' % (sz, sz, col, sw, st, d)
def stx(x, y, s, size=12, w=700, col=SEC, anchor='start'):
    return '<text x="%s" y="%s" font-size="%s" font-weight="%s" text-anchor="%s" fill="%s">%s</text>' % (R1(x), R1(y), size, w, anchor, col, s)
SHELL = 'box-sizing: border-box; background: %s; border: 1.500px solid %s; border-radius: 14px; box-shadow: 0 3px 0 %s' % (CARD, BRD, SH)
def shell(x, y, w, h, inner, st=''): return ab(x, y, w, h, SHELL + '; ' + st, inner)
SPARK = '<path d="M11 3l1.900 5.100L18 10l-5.100 1.900L11 17l-1.900-5.100L4 10l5.100-1.900z"></path><path d="M19 15v5M16.500 17.500h5"></path>'
ARROW = '<path d="M5 5v6a3 3 0 0 0 3 3h11"></path><path d="M15 10l4 4-4 4"></path>'
CHD = '<path d="M6 9l6 6 6-6"></path>'
SEARCH = '<circle cx="11" cy="11" r="7"></circle><path d="M20 20l-4-4"></path>'
NAV = [('Stats', '<path d="M22 7l-8.500 8.500-5-5L2 17"></path><path d="M16 7h6v6"></path>'),
       ('Overview', '<path d="M3 3v18h18"></path><path d="M18 17V9M13 17V5M8 17v-3"></path>'),
       ('Funnel', '<path d="M22 3H2l8 9.460V19l4 2v-8.540z"></path>'),
       ('Retention', '<path d="M3 12a9 9 0 0 1 9-9 9.750 9.750 0 0 1 6.740 2.740L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.750 9.750 0 0 1-6.740-2.740L3 16"></path><path d="M8 16H3v5"></path>'),
       ('Sprint', '<path d="M4 22V3"></path><path d="M4 4h13l-2 4 2 4H4"></path>'),
       ('Premium', '<path d="M6 3h12l4 6-10 13L2 9z"></path><path d="M11 3L8 9l4 13 4-13-3-6"></path><path d="M2 9h20"></path>'),
       ('AI Coach', SPARK),
       ('Comportamento', '<path d="M4 4l7.070 17 2.510-7.390L21 11.070z"></path>'),
       ('Meta ADS', '<path d="M3 11v3a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"></path><path d="M15.500 8.500a5 5 0 0 1 0 7"></path><path d="M18.500 5.500a9 9 0 0 1 0 13"></path>')]
def sidebar(H):
    s = ab(0, 0, SBW, H, 'box-sizing: border-box; background: %s; border-right: 1.500px solid %s' % (NEST, BRD))
    s += ab(20, 20, None, None, 'font-size: 22px; font-weight: 800; line-height: 28px; white-space: nowrap; color: %s' % INK, 'Hype<span style="color: %s">move</span>' % LB)
    s += txt(20, 50, 'KPI', 11, 800, TER, 'letter-spacing: 0.1em')
    s += ab(0, 80, SBW, 1.5, 'background: %s' % BRD)
    s += txt(20, 100, 'KPI', 11, 800, TER, 'letter-spacing: 0.1em')
    y = 124
    for i, (lb, d) in enumerate(NAV):
        if i == 8:
            s += txt(20, y + 8, 'Marketing', 11, 800, TER, 'letter-spacing: 0.1em'); y += 32
        act = lb == 'AI Coach'
        s += ab(10, y, 200, 36, 'box-sizing: border-box; border-radius: 10px; %s' % (('background: %s; border: 1.500px solid %s' % (SEL, BLU)) if act else ''), '')
        s += ab(22, y + 8, 20, 20, '', ic(d, 20, LB if act else TER, 2))
        s += txt(52, y + 8, lb, 14, 800 if act else 700, INK if act else SEC, '', 20)
        y += 40
    s += ab(0, H - 56, SBW, 1.5, 'background: %s' % BRD) + txt(20, H - 36, 'Mattia &amp; Danilo · 50/50', 12, 700, TER)
    return s

# ---------------------------------------------------------------- selettore Oggi / Settimana / Mese / Sprint
SEGN = ['Oggi', 'Settimana', 'Mese', 'Sprint']; SEGW = 92; SELW = SEGW * 4 + 9
class SG:  # canali del periodo: m = Mese, w = Settimana (se non cambia, costanti)
    def __init__(s, R=None, tc=None):
        if R and tc is not None:
            s.x = R.v([[tc, 3 + SEGW * 2], [tc + .35, 3 + SEGW * 1]]); s.m = R.v([[tc, 1], [tc + .35, 0]]); s.w = R.v([[tc, 0], [tc + .35, 1]])
        else: s.x = '%d' % (3 + SEGW * 2); s.m = '1'; s.w = '0'
def selector(sg, x, y):
    s = '<div style="position: absolute; left: %spx; top: 3px; width: %dpx; height: 31px; border-radius: 50px; background: %s; box-shadow: 0 2px 0 %s"></div>' % (sg.x, SEGW, BLU, SH)
    for i, n in enumerate(SEGN):
        base = 'position: absolute; left: %dpx; top: 3px; width: %dpx; height: 31px; line-height: 31px; text-align: center; font-size: 14px; font-weight: 700; white-space: nowrap;' % (3 + SEGW * i, SEGW)
        if i == 2: s += '<div style="%s color: %s; opacity: %s">%s</div><div style="%s color: #ffffff; opacity: %s">%s</div>' % (base, SEC, sg.w, n, base, sg.m, n)
        elif i == 1: s += '<div style="%s color: %s; opacity: %s">%s</div><div style="%s color: #ffffff; opacity: %s">%s</div>' % (base, SEC, sg.m, n, base, sg.w, n)
        else: s += '<div style="%s color: %s">%s</div>' % (base, SEC, n)
    return ab(x, y, SELW, 40, 'box-sizing: border-box; border-radius: 50px; background: %s; border: 1.500px solid %s' % (BG, BRD), s)
def seg_center(x, y, i): return (x + 1.5 + 3 + SEGW * i + SEGW / 2.0, y + 20)

# ---------------------------------------------------------------- BENCHMARK (1C «lungo il flusso»)
PL, PR, PT, PB, RY = 72, 972, 128, 384, 76
CWB = (PR - PL) / 7.0; BXW = CWB - 12
STEP, OFF = 5.0, 14
ybm = lambda v: PT + (PB - PT) * (100 - v) / 40.0
cxb = lambda k: PL + (k + .5) * CWB
bxl = lambda k: cxb(k) - CWB / 2 + 6
BENCH_H = 538
def bpct(g): return 100.0 * g['giusti'] / g['casi']
def wipe(R, x0, y0, w, h, svg, a, dur):
    c = R.ch([[a, 0], [a + dur, w]], 'o')
    return '<div style="position: absolute; left: %spx; top: %spx; width: «K.%s»px; height: %spx; overflow: hidden"><svg width="%s" height="%s" viewBox="%s %s %s %s" style="display: block" aria-hidden="true">%s</svg></div>' % (R1(x0), R1(y0), c, h, R1(w), h, R1(x0), R1(y0), R1(w), h, svg)
def fadeel(R, a, inner, d=.4):
    return '<div style="position: absolute; left: 0; top: 0; opacity: %s">%s</div>' % (R.v([[a, 0], [a + d, 1]], 'o'), inner)
def bench_card(R, y, ent, t0, ro='1', so=None, sog=0.5):
    """Restituisce (markup, geometria). ro/so: opacità dello strato vero / della sagoma."""
    inner = ab(24, 20, None, None, 'font-size: 22px; font-weight: 800; line-height: 28px; color: %s; white-space: nowrap' % INK, 'Benchmark')
    inner += '<svg width="30" height="12" style="position: absolute; left: %dpx; top: 28px; display: block" aria-hidden="true"><line x1="2" y1="6" x2="28" y2="6" stroke="%s" stroke-width="2.500" stroke-linecap="round" stroke-dasharray="6 5"></line></svg>' % (CW - 24 - 110, ORG)
    inner += txt(CW - 24 - 74, 24, 'Soglia 99%', 14, 800, ORG)
    for k in range(7):
        inner += ab(bxl(k), PT - 22, BXW, PB - PT + 44, 'box-sizing: border-box; border-radius: 12px; background: %s' % NEST)
    real = ''
    for k, P in enumerate(PAS):
        if not P['giri']:
            real += ab(bxl(k), PT - 22, BXW, PB - PT + 44, 'box-sizing: border-box; border-radius: 12px; background: %s; border: 1.500px dashed %s' % (CARD, BRD))
    inner += ab(0, 0, CW, BENCH_H, 'opacity: %s' % ro, real)
    sv = ''
    for v in (60, 70, 80, 90):
        sv += '<line x1="%d" y1="%s" x2="%d" y2="%s" stroke="%s" stroke-width="1"></line>' % (PL - 8, R1(ybm(v)), PR, R1(ybm(v)), BRD if v == 60 else GRID)
    for v in (60, 70, 80, 90, 100):
        sv += stx(PL - 16, ybm(v) + 4, '%d%%' % v, 12, 700, SEC if v in (60, 100) else TER, 'end')
    sv += '<line x1="%d" y1="%s" x2="%d" y2="%s" stroke="%s" stroke-width="1.500"></line>' % (PL - 8, R1(ybm(100)), PL - 8, R1(PB - 15), BRD)
    sv += '<path d="M%d %s l4 -3 l-8 -4 l8 -4 l-4 -3" fill="none" stroke="%s" stroke-width="1.500" stroke-linecap="round" stroke-linejoin="round"></path>' % (PL - 8, R1(PB - 1), SEC)
    sv += '<line x1="%s" y1="%d" x2="%s" y2="%d" stroke="%s" stroke-width="1.500"></line>' % (R1(cxb(0)), RY, R1(cxb(6)), RY, TER)
    inner += '<svg width="%d" height="%d" style="position: absolute; left: 0; top: 0; display: block" aria-hidden="true">%s</svg>' % (CW, BENCH_H, sv)
    circ = lambda k, ok: '<circle cx="%s" cy="%d" r="13" fill="%s" stroke="%s" stroke-width="1.500"></circle>' % (R1(cxb(k)), RY, SEL if ok else CARD, BLU if ok else BRD) + stx(cxb(k), RY + 4.5, str(k + 1), 13, 800, INK if ok else TER, 'middle')
    inner += '<svg width="%d" height="%d" style="position: absolute; left: 0; top: 0; display: block; opacity: %s" aria-hidden="true">%s</svg>' % (CW, BENCH_H, ro if so else '1', ''.join(circ(k, bool(P['giri'])) for k, P in enumerate(PAS)))
    inner += wipe(R, PL - 8, ybm(99) - 4, PR - PL + 12, 8, '<line x1="%d" y1="%s" x2="%d" y2="%s" stroke="%s" stroke-width="2" stroke-dasharray="6 5"></line>' % (PL - 8, R1(ybm(99)), PR + 4, R1(ybm(99)), ORG), sog, 0.9)
    geo = None; txts = ''
    starts = {'categorie': t0, 'strumenti': t0 + 1.3, 'form': t0 + 2.0}
    for k, P in enumerate(PAS):
        g = P['giri']; w = CWB - 4; x = cxb(k) - w / 2; col = INK if g else TER
        a = t0 + 0.12 * k if not g else starts[P['id']] + 0.6
        tt = ab(x, PB + 34, w, 36, 'text-align: center; font-size: 14px; font-weight: 800; line-height: 18px; color: %s' % col, P['nome'])
        tt += ab(x, PB + 78, w, 30, 'text-align: center; font-size: 12px; font-weight: 700; line-height: 15px; color: %s' % TER, P['modello'])
        if g:
            L = g[-1]; tt += ab(x, PB + 112, w, 22, 'text-align: center; font-size: 16px; font-weight: 800; line-height: 22px; color: %s; white-space: nowrap' % INK, '%d su %d' % (L['giusti'], L['casi']))
        else: tt += ab(x, PB + 112, w, 22, 'text-align: center; font-size: 13px; font-weight: 700; line-height: 22px; color: %s; white-space: nowrap' % TER, 'non misurato')
        txts += fadeel(R, a, tt)
        if not g: continue
        n = len(g)
        # passo fra i giri: i punti devono stare dentro la colonna anche con tanti giri
        step = min(STEP, (BXW - OFF - 34) / max(1.0, n - 1))
        pts = [(bxl(k) + OFF + i * step, ybm(bpct(c))) for i, c in enumerate(g)]
        sg_ = '<polyline points="%s" fill="none" stroke="%s" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></polyline>' % (' '.join('%s,%s' % (R1(a_), R1(b_)) for a_, b_ in pts), LB)
        for i in range(1, n):
            if g[i]['casi'] != g[i - 1]['casi']:
                xm = bxl(k) + OFF + (i - .5) * step
                sg_ = '<line x1="%s" y1="%d" x2="%s" y2="%d" stroke="%s" stroke-width="1.500" stroke-dasharray="3 4"></line>' % (R1(xm), PT - 14, R1(xm), PB + 4, TER) + stx(xm - 5, PB + 16, '%d casi' % g[i - 1]['casi'], 11, 700, TER, 'end') + stx(xm + 5, PB + 16, '%d' % g[i]['casi'], 11, 700, TER) + sg_
        r = 3 if step >= 5 else 2.5
        for i, (a_, b_) in enumerate(pts):
            last = i == n - 1; ok = g[i]['giusti'] * 100 >= 99 * g[i]['casi']
            sg_ += '<circle cx="%s" cy="%s" r="%s" fill="%s" stroke="%s" stroke-width="%s"></circle>' % (R1(a_), R1(b_), 7 if last else r, GRN if ok else BLU, INK if last else NEST, 2 if last else 1.5)
        dur = 0.9 + 0.07 * n
        txts += wipe(R, bxl(k) - 2, PT - 22, BXW + 4, PB - PT + 44, sg_, starts[P['id']], dur)
        lx, ly = pts[-1]; L = g[-1]; ok = L['giusti'] * 100 >= 99 * L['casi']
        # etichetta del valore: se il punto è vicino alla soglia (linea arancione) va sotto, per non sovrapporsi
        near = abs(ly - ybm(99)) < 14
        lyy = ly + 22 if near else ly + 6
        txts += fadeel(R, starts[P['id']] + dur - 0.2, '<svg width="%d" height="%d" style="position: absolute; left: 0; top: 0; display: block" aria-hidden="true">%s</svg>' % (CW, BENCH_H, stx(lx + (11 if near else 13), lyy, str(L['giusti']), 17, 800, GRN if ok else INK)), .3)
        if P['id'] == 'categorie': geo = (lx, ly, pts[11], g[11])
    inner += ab(0, 0, CW, BENCH_H, 'opacity: %s' % ro, txts)
    if so:
        sk = ''
        for k in range(7):
            sk += ab(cxb(k) - 32, PB + 36, 64, 12, 'border-radius: 6px; background: %s' % BRD) + ab(cxb(k) - 22, PB + 56, 44, 12, 'border-radius: 6px; background: %s' % BRD)
            sk += ab(cxb(k) - 36, PB + 82, 72, 10, 'border-radius: 5px; background: %s' % BRD) + ab(cxb(k) - 30, PB + 114, 60, 14, 'border-radius: 7px; background: %s' % BRD)
            hs = [.40, .55, .30, .62, .48, .36, .58][k]
            sk += ab(bxl(k) + 14, PB - 12 - (PB - PT - 24) * hs, BXW - 28, (PB - PT - 24) * hs, 'border-radius: 10px; background: %s' % BRD)
        inner += ab(0, 0, CW, BENCH_H, 'opacity: %s' % so, sk)
    return shell(CX, y, CW, BENCH_H, inner, ent), geo

# ---------------------------------------------------------------- USO
def colchart(key, per, w, h):
    sp = SP[key]; rows = PER[per]; vals = [r[sp['i']] for r in rows]; n = len(vals); ym = sp['ymax'][per]
    gut = 38; top, bot = 18, 24; ph = h - top - bot; slot = (w - gut - 4) / float(n)
    bw = min(slot * (0.62 if n > 10 else 0.5), 34); y = lambda v: top + ph - v / float(ym) * ph
    cx = lambda i: gut + i * slot + slot / 2.0
    s = ''
    for v, lab in sp['ticks'][per]:
        s += '<line x1="%d" x2="%d" y1="%.1f" y2="%.1f" stroke="%s" stroke-width="1"></line>' % (gut, w, y(v), y(v), BRD)
        s += '<text x="0" y="%.1f" font-size="11" font-weight="700" fill="%s">%s</text>' % (y(v) + 4, TER, lab)
    s += '<line x1="%d" x2="%d" y1="%.1f" y2="%.1f" stroke="%s" stroke-width="1.500"></line>' % (gut, w, y(0), y(0), TER)
    for i, v in enumerate(vals):
        x0 = cx(i) - bw / 2.0
        if v == 0:
            if sp['zero']: s += '<rect x="%.1f" y="%.1f" width="%.1f" height="3" rx="1.500" fill="%s"></rect>' % (x0, y(0) - 3, bw, TER)
        elif i == n - 1:
            s += '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="2" fill="%s" fill-opacity="0.22" stroke="%s" stroke-width="1.500" stroke-dasharray="3 3"></rect>' % (x0 + .75, y(v) + .75, bw - 1.5, y(0) - y(v) - .75, sp['color'], sp['color'])
        else:
            s += '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="2" fill="%s"></rect>' % (x0, y(v), bw, y(0) - y(v), sp['color'])
    pk = {vals.index(max(vals)), n - 1}
    for i in pk:
        anc = 'middle'; tx = cx(i)
        if i == n - 1: anc = 'end'; tx = w - 4
        yy_ = y(vals[i])
        if i == n - 1: yy_ = min(y(vals[j]) for j in range(max(0, n - 4), n))   # sopra le barre vicine
        s += '<text x="%.1f" y="%.1f" font-size="12" font-weight="800" text-anchor="%s" fill="#ffffff">%s</text>' % (tx, yy_ - 6, anc, sp['lab'](vals[i]))
    idx = [0, 7, 14, 21] if n > 10 else list(range(n - 1))
    for i in idx: s += '<text x="%.1f" y="%d" font-size="12" font-weight="700" text-anchor="middle" fill="%s">%s</text>' % (cx(i), h - 6, TER, rows[i][0])
    s += '<text x="%d" y="%d" font-size="12" font-weight="800" text-anchor="end" fill="#ffffff">oggi</text>' % (w - 4, h - 6)
    return s, cx, y, vals, bw
def clipw(x, y, w, h, ch, svg):
    return '<div style="position: absolute; left: %spx; top: %spx; width: «K.%s»px; height: %spx; overflow: hidden"><svg width="%s" height="%s" style="display: block" aria-hidden="true">%s</svg></div>' % (x, y, ch, h, w, h, svg)
TW, TH = 320, 288
def time_card(R, key, x, y, ent, sg, rv, ro='1', so=None, sel=None, chev=None, rev_w=None):
    sp = SP[key]; w, h = TW, TH; cx0, cy0, cw, ch = 16, 142, w - 32, h - 142 - 8
    inner = ''
    if sel: inner += ab(0, 0, w, h, 'box-sizing: border-box; border-radius: 14px; background: %s; border: 1.500px solid %s; opacity: %s' % (SEL, BLU, sel))
    inner += txt(24, 18, sp['title'], 18, 800, INK)
    if chev: inner += ab(w - 24 - 20, 18, 20, 20, 'transform: rotate(%sdeg)' % chev, ic(CHD, 20, SEC))
    ncol = RED if key == 'e' else INK
    real = ''; geo = {}
    for per in 'MW':
        op = sg.m if per == 'M' else sg.w
        real += ab(0, 0, w, h, 'opacity: %s' % op, txt(24, 44, BIG[key][per], 56, 800, ncol, 'letter-spacing: -0.5px') + txt(26, 110, SUB[key][per], 15, 700, SEC))
        svg, cxf, yf, vals, bw = colchart(key, per, cw, ch)
        a = rv[0] if per == 'M' else (rev_w if rev_w is not None else 99)
        c = R.ch([[a, 0], [a + (rv[1] if per == 'M' else 1.0), cw + 8]], 'o')
        real += ab(0, 0, w, h, 'opacity: %s' % op, clipw(cx0, cy0, cw + 8, ch, c, svg))
        geo[per] = dict(cx=lambda i, cxf=cxf: x + cx0 + cxf(i), top=lambda i, yf=yf, vals=vals: y + cy0 + yf(vals[i]), base=y + cy0 + yf(0), bw=bw, vals=vals)
    inner += ab(0, 0, w, h, 'opacity: %s' % ro, real)
    if so:
        sk = ab(24, 52, 150, 44, 'border-radius: 10px; background: %s' % BRD) + ab(26, 112, 96, 14, 'border-radius: 7px; background: %s' % BRD)
        hs = [.40, .70, .55, .90, .60, .80, 1.0, .65, .85, .50, .95, .70, .60, .75, .45, .85]
        bwid = (cw - 38) / 16.0
        for i, hh in enumerate(hs):
            sk += ab(cx0 + 38 + i * bwid + 2, cy0 + 18 + (ch - 42) * (1 - hh * .8), bwid - 4, (ch - 42) * hh * .8, 'border-radius: 3px; background: %s' % BRD)
        inner += ab(0, 0, w, h, 'opacity: %s' % so, sk)
    return shell(x, y, w, h, inner, ent), geo
PCH = 272
def per_card(R, x, y, ent, t_draw, ro='1', so=None):
    w, h = CW, PCH
    inner = txt(24, 18, 'Per cosa', 18, 800, INK)
    bx, by, bw_, rh = 290, 20, w - 290 - 24, int((h - 36) / 7.0); lw = 166; mx = bw_ - lw - 64
    real = txt(24, 56, fi(CT), 56, 800, INK, 'letter-spacing: -0.5px') + txt(26, 122, 'chiamate', 15, 700, SEC)
    for i, (nm, v) in enumerate(BARS):
        wpx = max(4, mx * v / float(BARS[0][1])); c = R.ch([[t_draw + .08 * i, 0], [t_draw + .08 * i + .9, wpx]], 'o')
        real += ab(bx, by + i * rh, bw_, rh, 'display: flex; align-items: center; gap: 10px',
                   '<div style="width: %dpx; font-size: 13px; font-weight: 700; color: %s; white-space: nowrap">%s</div><div style="width: «K.%s»px; height: 14px; border-radius: 4px; background: %s; flex: none"></div><div style="font-size: 13px; font-weight: 800; color: #ffffff; white-space: nowrap">%s</div>' % (lw - 10, SEC, nm, c, LB, fi(v)))
    inner += ab(0, 0, w, h, 'opacity: %s' % ro, real)
    if so:
        sk = ab(24, 64, 180, 44, 'border-radius: 10px; background: %s' % BRD) + ab(26, 124, 84, 14, 'border-radius: 7px; background: %s' % BRD)
        for i, (nm, v) in enumerate(BARS):
            sk += ab(bx, by + i * rh + rh / 2 - 6, 130 - (i % 3) * 14, 12, 'border-radius: 6px; background: %s' % BRD) + ab(bx + lw, by + i * rh + rh / 2 - 7, max(30, mx * v / float(BARS[0][1])), 14, 'border-radius: 5px; background: %s' % BRD)
        inner += ab(0, 0, w, h, 'opacity: %s' % so, sk)
    return shell(x, y, w, h, inner, ent)
def bar_hover(R, key, per, geo, i, a, b, side=False):
    g = geo[per]; sp = SP[key]; v = g['vals'][i]; x = g['cx'](i); yt = g['top'](i); bwid = max(g['bw'] + 6, 8)
    ch = R.win(a, b)
    hl = '<div style="position: absolute; left: %spx; top: %spx; width: %spx; height: %spx; border-radius: 3px; background: #ffffff; opacity: calc(«K.%s» * 0.28); pointer-events: none"></div>' % (R1(x - bwid / 2.0), R1(yt - 2), R1(bwid), R1(g['base'] - yt + 2), ch)
    txt_ = sp['tip'](PER[per][i][0], v); wd = len(txt_) * 7.6 + 30
    tx = x - wd - 14 if side else min(max(x - wd / 2.0, CX + 8), CX + CW - wd - 8)
    ty = yt + 4 if side else max(yt - 44, 8)
    tip = '<div style="position: absolute; left: %dpx; top: %dpx; height: 30px; line-height: 30px; padding: 0 14px; border-radius: 50px; background: #ffffff; color: #0f1115; font-size: 13px; font-weight: 800; white-space: nowrap; opacity: «K.%s»; pointer-events: none">%s</div>' % (int(tx), int(ty), ch, txt_)
    return hl + tip

# ---------------------------------------------------------------- CONVERSAZIONI (3A «elenco che si apre»)
ELL = 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0;'
def lines2(cid, x, y, w, op=''):
    c, u = first(cid, 'coach'), first(cid, 'utente')
    c1 = esc(c) if c else 'Nessun messaggio'; cc = SEC if c else TER
    l1 = '<div style="display: flex; align-items: center; gap: 8px; width: %dpx">%s<div style="%s font-size: 14px; font-weight: 700; color: %s">%s</div></div>' % (w, ic(SPARK, 18, LB), ELL, cc, c1)
    l2 = '<div style="display: flex; align-items: center; gap: 8px; width: %dpx">%s<div style="%s font-size: 15px; font-weight: 800; color: %s">%s</div></div>' % (w, ic(ARROW, 18, TER), ELL, INK, esc(u))
    return ab(x, y, w, 20, op, l1) + ab(x, y + 22, w, 20, op, l2)
def conv_row(cid, y, hov=None, pv=None, rot=None, last=False, ent=''):
    s = ''
    if hov: s += ab(8, 2, CW - 16, 56, 'border-radius: 12px; background: %s; opacity: «K.%s»' % (RAISED, hov))
    s += txt(24, 9, who(cid), 15, 800, INK) + txt(24, 31, when(cid), 13, 700, SEC) + txt(200, 20, scr(cid), 13, 700, TER)
    s += lines2(cid, 330, 9, 590, ('opacity: «K.%s»;' % pv) if pv else '')
    s += ab(CW - 24 - 20, 20, 20, 20, ('transform: rotate(«K.%s»deg);' % rot) if rot else '', ic(CHD, 20, TER))
    if not last: s += ab(24, 58, CW - 48, 1.5, 'background: %s' % BRD)
    return ab(0, y, CW, 60, ent, s)
def conv_footer(y, n): return ab(0, y, CW, 44, '', txt(24, 8, 'Altre %d' % n, 14, 800, SEC) + ab(86, 12, 20, 20, '', ic(CHD, 18, SEC)))
SEGBW = 128; SEGTW = SEGBW * 3 + 11
def conv_seg(pill):
    s = ab(0, 0, SEGTW, 43, 'box-sizing: border-box; border-radius: 50px; background: %s; border: 1.500px solid %s' % (NEST, BRD))
    s += '<div style="position: absolute; left: %spx; top: 5.500px; width: %spx; height: 32px; box-sizing: border-box; border-radius: 50px; background: %s; border: 1.500px solid %s"></div>' % (pill, SEGBW, SEL, BLU)
    for i, l in enumerate(t[0] for t in TABS):
        s += ab(5.5 + SEGBW * i, 5.5, SEGBW, 32, 'font-size: 14px; font-weight: 800; line-height: 32px; text-align: center; color: %s' % INK, l)
    return ab(CW - 24 - SEGTW, 16, SEGTW, 43, '', s)
def conv_header(pill='5.5'):
    h = txt(24, 22, 'Conversazioni', 22, 800, INK)
    h += ab(CW - 24 - SEGTW - 16 - 192, 17, 192, 40, 'box-sizing: border-box; border-radius: 50px; background: %s; border: 1.500px solid %s; display: flex; align-items: center; gap: 10px; padding: 0 16px; font-size: 14px; font-weight: 700; color: %s' % (NEST, BRD, TER), ic(SEARCH, 18, TER) + 'Cerca utente')
    return h + conv_seg(pill) + ab(24, 71, CW - 48, 1.5, 'background: %s' % BRD)
def feed_strip():
    s = ''
    for i, (lb, v) in enumerate(FEED):
        x = 24 + i * 316
        if i: s += ab(x - 1, 10, 1.5, 40, 'background: %s' % BRD)
        s += txt(x + (20 if i else 0), 5, fi(v), 26, 800, INK, '', 30) + txt(x + (20 if i else 0), 35, lb, 13, 700, SEC, '', 16)
    return s + ab(24, 58, CW - 48, 1.5, 'background: %s' % BRD)
CONV_H = 364
def list1(ids=None):
    ids = ids or TABS[0][1]
    return ''.join(conv_row(ids[r], 80 + r * 60) for r in range(4)) + conv_footer(320, len(ids) - 4)
def list2():
    ids = TABS[1][1]
    return ab(0, 80, CW, 60, '', feed_strip()) + ''.join(conv_row(ids[r], 140 + r * 60) for r in range(3)) + conv_footer(320, len(ids) - 3)
def conv_skel(so):
    sk = ''
    for r in range(4):
        y = 80 + r * 60
        sk += ab(24, y + 12, 110, 14, 'border-radius: 7px; background: %s' % BRD) + ab(24, y + 34, 76, 12, 'border-radius: 6px; background: %s' % BRD) + ab(200, y + 22, 70, 12, 'border-radius: 6px; background: %s' % BRD)
        sk += ab(330, y + 12, 380 - (r % 2) * 40, 12, 'border-radius: 6px; background: %s' % BRD) + ab(330, y + 34, 300 + (r % 3) * 30, 12, 'border-radius: 6px; background: %s' % BRD)
        if r < 3: sk += ab(24, y + 58, CW - 48, 1.5, 'background: %s' % BRD)
    return ab(0, 0, CW, CONV_H, 'opacity: %s' % so, sk)
def conv_stack(R, cid, t0, step, maxw, fs, lh, gap=12):
    items = list(CH[cid]['chat']); out = []; tot = 0
    cpl = lambda t: max(1, math.ceil(len(t) / max(8, int((maxw - 34) / (fs * 0.52)))))
    av = '<div style="width: 28px; height: 28px; border-radius: 50%%; background: %s; display: flex; align-items: center; justify-content: center; flex: none">%s</div>' % (SEL, ic(SPARK, 17, LB, 2))
    for i, it in enumerate(items):
        a = t0 + i * step; n = cpl(it['testo'])
        if it['chi'] == 'coach':
            b = '<div style="box-sizing: border-box; max-width: %dpx; padding: 9px 16px; border-radius: 18px 18px 18px 6px; background: %s; border: 1.500px solid %s; font-size: %dpx; font-weight: 700; line-height: %dpx; color: %s">%s</div>' % (maxw, RAISED, BRD, fs, lh, INK, esc(it['testo']))
            out.append('<div style="display: flex; align-items: flex-end; gap: 10px; %s">%s%s</div>' % (R.pop(a, 'left bottom'), av, b))
        else:
            b = '<div style="box-sizing: border-box; max-width: %dpx; padding: 9px 16px; border-radius: 18px 18px 6px 18px; background: %s; border: 1.500px solid %s; font-size: %dpx; font-weight: 700; line-height: %dpx; color: %s">%s</div>' % (maxw, BLU, BLU, fs, lh, INK, esc(it['testo']))
            out.append('<div style="display: flex; justify-content: flex-end; %s">%s</div>' % (R.pop(a, 'right bottom'), b))
        tot += n * lh + 21 + (gap if i else 0)
    return '<div style="display: flex; flex-direction: column; gap: %dpx">%s</div>' % (gap, ''.join(out)), tot

# ---------------------------------------------------------------- impaginazione della pagina
Y_TITLE, Y_BENCH = 32, 84
Y_USO = Y_BENCH + BENCH_H + 32
Y_CARDS = Y_USO + 56
Y_PER = Y_CARDS + TH + 16
Y_CONV = Y_PER + PCH + 32
PAGE_H = (Y_CONV + CONV_H + 32 + 7) // 8 * 8
def content(inner, H, sy=None):
    st = ('transform: translateY(«K.%s»px)' % sy) if sy else ''
    return ab(SBW, 0, 1060, H, 'overflow: hidden', ab(0, 0, 1060, PAGE_H, st, inner))

# ================================================================ 1 - PAGINA
def build_1():
    R = Reg(); H = PAGE_H; TC = 7.6
    sg = SG(R, TC)
    e = [R.ent(0.1 + 0.12 * k) for k in range(8)]
    body = txt(CX, Y_TITLE, 'AI Coach', 28, 800, INK, e[0])
    bc, bgeo = bench_card(R, Y_BENCH, e[1], 0.9)
    body += bc
    body += ab(0, 0, 0, 0, e[2], txt(CX, Y_USO + 6, 'Uso', 22, 800, INK) + selector(sg, CX + CW - SELW, Y_USO))
    geos = {}
    for k, key in enumerate('pce'):
        m, g = time_card(R, key, CX + k * (TW + 18), Y_CARDS, e[3 + k], sg, (1.6 + .18 * k, 1.4), chev='0' if key == 'p' else None, rev_w=TC + .45 + .15 * k)
        body += m; geos[key] = g
    body += per_card(R, CX, Y_PER, e[6], 2.3)
    body += ab(CX, Y_CONV, CW, CONV_H, SHELL + '; ' + e[7], conv_header() + list1())
    lx, ly, p12, c12 = bgeo
    bx_, by_ = CX + p12[0], Y_BENCH + p12[1]
    hch = R.win(5.0, 6.8)
    ring = '<svg width="28" height="28" style="position: absolute; left: %spx; top: %spx; display: block; opacity: «K.%s»; pointer-events: none" aria-hidden="true"><circle cx="14" cy="14" r="11" fill="none" stroke="%s" stroke-width="2"></circle></svg>' % (R1(bx_ - 14), R1(by_ - 14), hch, LB)
    q = c12['quando'][-5:]
    tip = '<div style="position: absolute; left: %spx; top: %spx; opacity: «K.%s»; padding: 6px 14px; box-sizing: border-box; border-radius: 14px; background: %s; border: 1.500px solid %s; box-shadow: 0 2px 0 %s; font-size: 13px; font-weight: 800; line-height: 17px; color: %s; white-space: nowrap; pointer-events: none">Giro 12 · %s<br>%d su %d</div>' % (R1(bx_ + 16), R1(by_ + 14), hch, SEL, BLU, SH, INK, q, c12['giusti'], c12['casi'])
    body += ring + tip
    body += bar_hover(R, 'e', 'W', geos['e'], 6, 9.9, 11.3)
    sx, sy_ = seg_center(CX + CW - SELW, Y_USO, 1)
    gw = geos['e']['W']
    C = dict(P=13.5, TS=6.0, S=[1180, 560], W=[[SBW + bx_ + 3, by_ + 3, 5.0], [SBW + sx, sy_, TC], [SBW + gw['cx'](6) + 3, gw['top'](6) + 10, 9.9]], T=[[SBW + sx, sy_, TC]])
    save('red-1-pagina.dc.html', '1 - Pagina', 1280, H, R, sidebar(H) + content(body, H), C)

# ================================================================ 2 - CARICAMENTO
def build_2():
    R = Reg(); H = 720
    pu = R.ch([[i * .75, .55 if i % 2 == 0 else 1.0] for i in range(15)], 'i')       # impulso, periodo 1,5 s (P = 10,5 s)
    b_r = R.ch([[2.4, 0], [2.9, 1]], 'l'); b_s = R.ch([[2.4, 1], [2.9, 0]], 'l')
    u_r = R.ch([[7.0, 0], [7.5, 1]], 'l'); u_s = R.ch([[7.0, 1], [7.5, 0]], 'l')
    sy = R.ch([[0, 0], [5.6, 0], [6.4, -(Y_USO - 32)], [9.0, -(Y_USO - 32)], [9.8, 0]])
    cal = lambda c1, c2: 'calc(«K.%s» * «K.%s»)' % (c1, c2)
    sg = SG()
    e = [R.ent(0.1 + 0.1 * k, 10) for k in range(8)]
    body = txt(CX, Y_TITLE, 'AI Coach', 28, 800, INK, e[0])
    bc, _ = bench_card(R, Y_BENCH, e[1], 2.6, ro='«K.%s»' % b_r, so=cal(pu, b_s), sog=0.4)
    body += bc
    body += ab(0, 0, 0, 0, e[2], txt(CX, Y_USO + 6, 'Uso', 22, 800, INK) + selector(sg, CX + CW - SELW, Y_USO))
    for k, key in enumerate('pce'):
        m, g = time_card(R, key, CX + k * (TW + 18), Y_CARDS, e[3], sg, (7.3 + .18 * k, 1.4), ro='«K.%s»' % u_r, so=cal(pu, u_s), chev='0' if key == 'p' else None)
        body += m
    body += per_card(R, CX, Y_PER, e[5], 7.7, ro='«K.%s»' % u_r, so=cal(pu, u_s))
    rows = ab(0, 0, CW, CONV_H, 'opacity: «K.%s»' % u_r, list1()) + conv_skel(cal(pu, u_s))
    body += ab(CX, Y_CONV, CW, CONV_H, SHELL + '; ' + e[6], conv_header() + rows)
    C = dict(P=10.5, TS=4.0, S=[0, 0], W=[], T=[])
    save('red-2-caricamento.dc.html', '2 - Caricamento', 1280, H, R, sidebar(H) + content(body, H, sy), C, pointer=False)

# ================================================================ 3 - UTENTI APERTI
def build_3():
    R = Reg(); H = 720; S0 = -(Y_USO - 32); S1 = S0 - 260
    TO, TCL = 2.55, 9.7; TBH = 40 + 14 * 36
    sg = SG()
    e = [R.ent(0.1 + 0.1 * k, 10) for k in range(8)]
    thc = R.ch([[0, 0], [TO, 0], [TO + .9, TBH], [TCL, TBH], [TCL + .6, 0]])
    dyc = R.ch([[0, 0], [TO, 0], [TO + .9, TBH + 16], [TCL, TBH + 16], [TCL + .6, 0]])
    twc = R.ch([[0, 0], [TO, 0], [TO + .15, 1], [TCL + .45, 1], [TCL + .6, 0]], 'l')
    selc = R.ch([[0, 0], [2.4, 0], [2.7, 1], [9.6, 1], [9.9, 0]], 'l')
    chev = R.ch([[0, 0], [2.4, 0], [3.0, 180], [9.6, 180], [10.2, 0]])
    syc = R.ch([[0, S0], [4.9, S0], [5.9, S1], [7.9, S1], [8.8, S0]])
    body = ab(0, 0, 0, 0, e[2], txt(CX, Y_USO + 6, 'Uso', 22, 800, INK) + selector(sg, CX + CW - SELW, Y_USO))
    for k, key in enumerate('pce'):
        m, g = time_card(R, key, CX + k * (TW + 18), Y_CARDS, e[3], sg, (0.3 + .1 * k, 1.0), sel=('«K.%s»' % selc) if key == 'p' else None, chev=('«K.%s»' % chev) if key == 'p' else None)
        body += m
    th = lambda x, t_: txt(x, 12, t_, 12, 800, TER, 'letter-spacing: 0.08em; text-transform: uppercase')
    rows = ab(0, 0, CW, 40, 'background: %s' % RAISED, th(24, '#') + th(120, 'Utente') + th(520, 'Email'))
    for i, u in enumerate(USERS):
        rc = R.ch([[TO + .35 + .05 * i, 0], [TO + .75 + .05 * i, 1]], 'l')
        rows += ab(0, 40 + i * 36, CW, 36, 'opacity: «K.%s»' % rc, txt(24, 8, str(i + 1), 13, 700, TER, '', 20) + txt(120, 8, 'Utente ' + u, 14, 800, INK, '', 20) + txt(520, 8, 'u•••@•••.com', 13, 700, SEC, 'font-family: monospace', 20) + (ab(24, 34.5, CW - 48, 1.5, 'background: %s' % BRD) if i < len(USERS) - 1 else ''))
    body += ab(CX, Y_CARDS + TH + 16, CW, None, 'box-sizing: border-box; background: %s; border: 1.500px solid %s; border-radius: 14px; box-shadow: 0 3px 0 %s; overflow: hidden; height: «K.%s»px; opacity: «K.%s»' % (CARD, BRD, SH, thc, twc), rows)
    below = per_card(R, CX, Y_PER, '', 0.8) + ab(CX, Y_CONV, CW, CONV_H, SHELL, conv_header() + list1())
    body += ab(0, 0, 1060, PAGE_H, 'transform: translateY(«K.%s»px)' % dyc, below)
    cx_, cy_ = SBW + CX + TW / 2.0, Y_CARDS + 100
    C = dict(P=11.5, TS=3.8, S=[1100, 500], W=[[cx_, cy_ + S0, 2.1], [900, 420, 4.6], [cx_, cy_ + S0, 9.3]], T=[[cx_, cy_ + S0, 2.45], [cx_, cy_ + S0, 9.65]])
    save('red-3-utenti-aperti.dc.html', '3 - Utenti aperti', 1280, H, R, sidebar(H) + content(body, H, syc), C)

# ================================================================ 4 - CONVERSAZIONE
def build_4():
    R = Reg(); H = 720; S0 = -(Y_CONV - 32)
    TO, TCL = 2.4, 8.7
    chat_html, chat_h = conv_stack(R, 13, TO + .9, .65, 470, 15, 22)
    ph = chat_h + 48
    hov = R.ch([[1.6, 0], [1.9, 1], [TCL + .7, 1], [TCL + 1.0, 0]], 'l')
    pv = R.ch([[0, 1], [TO, 1], [TO + .35, 0], [TCL, 0], [TCL + .5, 1]], 'l')
    rot = R.ch([[0, 0], [TO, 0], [TO + .5, 180], [TCL, 180], [TCL + .5, 0]])
    dy = R.ch([[0, 0], [TO, 0], [TO + .7, ph + 8], [TCL, ph + 8], [TCL + .6, 0]])
    hc = R.ch([[0, CONV_H], [TO, CONV_H], [TO + .7, CONV_H + ph + 8], [TCL, CONV_H + ph + 8], [TCL + .6, CONV_H]])
    pan = R.ch([[0, 0], [TO + .5, 0], [TO + .8, 1], [TCL, 1], [TCL + .3, 0]], 'l')
    e = R.ent(0.15, 10)
    ids = TABS[0][1]
    rows = conv_row(ids[0], 80) + conv_row(ids[1], 140, hov, pv, rot)
    panel = ab(116, 204, 764, ph - 8, 'box-sizing: border-box; border-radius: 14px; background: %s; border: 1.500px solid %s; padding: 24px; opacity: «K.%s»' % (BG, BRD, pan), chat_html)
    lower = ''.join(conv_row(ids[r], 80 + r * 60) for r in (2, 3)) + conv_footer(320, len(ids) - 4)
    rows += panel + ab(0, 0, CW, CONV_H, 'transform: translateY(«K.%s»px)' % dy, lower)
    card = '<div style="position: absolute; left: %dpx; top: %dpx; width: %dpx; height: «K.%s»px; overflow: hidden; %s; %s">%s</div>' % (CX, Y_CONV, CW, hc, SHELL, e, conv_header() + rows)
    cy1 = Y_CONV + 170 + S0
    C = dict(P=11.0, TS=6.0, S=[1100, 560], W=[[SBW + 640, cy1, 1.8], [SBW + 640, cy1, TCL - .3]], T=[[SBW + 640, cy1, TO - .05], [SBW + 640, cy1, TCL]])
    save('red-4-conversazione.dc.html', '4 - Conversazione', 1280, H, R, sidebar(H) + content(card, H, R.ch([[0, S0]])), C)

# ================================================================ 5 - FEEDBACK
def build_5():
    R = Reg(); H = 720; S0 = -(Y_CONV - 32)
    TT = 2.2; TB = 7.0
    pill = R.ch([[0, 5.5], [TT, 5.5], [TT + .5, 5.5 + SEGBW], [TB, 5.5 + SEGBW], [TB + .5, 5.5]])
    l1 = R.ch([[0, 1], [TT, 1], [TT + .35, 0], [TB, 0], [TB + .4, 1]], 'l'); l2 = R.ch([[0, 0], [TT + .1, 0], [TT + .5, 1], [TB, 1], [TB + .3, 0]], 'l')
    e = R.ent(0.15, 10)
    L1 = ab(0, 0, CW, CONV_H, 'opacity: «K.%s»' % l1, list1()); L2 = ab(0, 0, CW, CONV_H, 'opacity: «K.%s»' % l2, list2())
    card = ab(CX, Y_CONV, CW, CONV_H, SHELL + '; ' + e, conv_header('«K.%s»' % pill) + L1 + L2)
    segx = CX + CW - 24 - SEGTW + 5.5 + SEGBW * 1.5; segy = Y_CONV + 16 + 21 + S0
    segx0 = CX + CW - 24 - SEGTW + 5.5 + SEGBW * .5
    C = dict(P=9.5, TS=4.5, S=[1100, 560], W=[[SBW + segx, segy, 1.6], [SBW + segx0, segy, TB - .2]], T=[[SBW + segx, segy, TT], [SBW + segx0, segy, TB]])
    save('red-5-feedback.dc.html', '5 - Feedback', 1280, H, R, sidebar(H) + content(card, H, R.ch([[0, S0]])), C)

if __name__ == '__main__':
    print('pagina', PAGE_H, 'y: uso', Y_USO, 'card', Y_CARDS, 'per', Y_PER, 'conv', Y_CONV)
    build_1(); build_2(); build_3(); build_4(); build_5()
