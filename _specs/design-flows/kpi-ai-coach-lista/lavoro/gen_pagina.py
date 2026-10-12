#!/usr/bin/env python3
# Tavole «AI Coach» (pagina intera): 2A tutto in colonna, 2B due colonne, 2C una alla volta, 2 telefono.
# Dati veri: dati.json (uso del coach, benchmark, chat vere senza nomi). Si lancia ovunque: lavora nella sua cartella.
import json, os
from decimal import Decimal, ROUND_HALF_UP
WD = os.path.dirname(os.path.abspath(__file__)); os.chdir(WD); os.makedirs('project', exist_ok=True)
DATI = json.load(open('dati.json'))
G = DATI['uso']['giorni']                      # [giorno, chiamate, utenti, costo, errori]
assert len(G) == 31 and sum(g[1] for g in G) == 17464 and sum(g[4] for g in G) == 480
# ---------------------------------------------------------------- palette Notte
BG, CARD, BRD, SH, INK, SEC, TER = '#0f1115', '#1a1d24', '#2a2e37', '#050608', '#ffffff', '#9ca3af', '#6f7683'
BLU, LB, ORG, GRN, RED, SEL, INN = '#4361ee', '#8da2ff', '#fb8b04', '#4ade80', '#f87171', '#262d45', '#20242d'
NF = ('family=Nunito:wght@500;600;700;800', 'Nunito, system-ui, sans-serif')
fi = lambda n: format(int(n), ',').replace(',', '.')
def fd(x, d=2): return str(Decimal(str(round(x, 4))).quantize(Decimal(1).scaleb(-d), rounding=ROUND_HALF_UP)).replace('.', ',')
# ---------------------------------------------------------------- dati derivati
PER = {'M': G, 'W': G[-7:]}
def total(per, i): return sum(g[i] for g in PER[per])
BIG = {
    'p': {'M': fi(round(total('M', 2) / 31.0)), 'W': fi(round(total('W', 2) / 7.0))},
    'c': {'M': fd(total('M', 3)) + ' $', 'W': fd(total('W', 3)) + ' $'},
    'e': {'M': fi(total('M', 4)), 'W': fi(total('W', 4))}}
SUB = {'p': {'M': 'al giorno', 'W': 'al giorno'}, 'c': {'M': 'ultimo mese', 'W': 'ultima settimana'}, 'e': {'M': 'ultimo mese', 'W': 'ultima settimana'}}
SP = {  # forma di ogni grafico del tempo
    'p': dict(title='Persone', i=2, color=LB, ymax={'M': 200, 'W': 200}, ticks={'M': [(100, '100'), (200, '200')], 'W': [(100, '100'), (200, '200')]},
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
BARS.sort(key=lambda b: -b[1])                  # ordinate per valore; «Altro» resta in fondo
BARS = [b for b in BARS if b[0] != 'Altro'] + [b for b in BARS if b[0] == 'Altro']
# ---------------------------------------------------------------- impalcatura (JS)
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
    const live = !!this.t0;
    const P = C.P;
    const t = live ? ((performance.now() - this.t0) / 1000) % P : C.TS;
    const cl = (x) => Math.max(0, Math.min(1, x));
    const p = (a, d) => live ? cl((t - a) / d) : 1;
    const out = (x) => 1 - Math.pow(1 - x, 3);
    const inout = (x) => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    const f = (x, d) => x.toFixed(d === undefined ? 3 : d);
    const ent = (a) => { const k = out(p(a, 0.5)); return { o: f(k), tf: 'translateY(' + f(14 * (1 - k), 1) + 'px)' }; };
    const E = {};
    C.EN.forEach((a, i) => { E['e' + i] = ent(a); });
    const O = {};
    Object.keys(C.WIN).forEach((k) => {
      let m = 0;
      if (!live && C.ST && C.ST[k]) m = 1;
      else C.WIN[k].forEach((w) => { m = Math.max(m, Math.min(p(w[0], 0.18), 1 - p(w[1], 0.18))); });
      O[k] = { o: f(m), tf: 'translateY(' + f(10 * (1 - m), 1) + 'px)' };
    });
    const R = {};
    Object.keys(C.RV).forEach((k) => { const r = C.RV[k]; R[k] = f(r[2] * out(p(r[0], r[1])), 1) + 'px'; });
    let px = C.S[0], py = C.S[1], lx = px, ly = py;
    C.W.forEach((w) => { const g = live ? inout(p(w[2] - 0.8, 0.8)) : 0; px += (w[0] - lx) * g; py += (w[1] - ly) * g; lx = w[0]; ly = w[1]; });
    const TP = {};
    C.T.forEach((a, i) => { const k = p(a[2], 0.45); TP['k' + i] = { x: (a[0] - 40) + 'px', y: (a[1] - 40) + 'px', o: k > 0 && k < 1 ? f(0.25 * (1 - k)) : '0', tf: 'scale(' + f(0.3 + 0.6 * out(k)) + ')' }; });
    const sw = C.SG && live ? inout(p(C.SG[0], 0.35)) : 0;
    const SG = { x: f(C.SGX[0] + (C.SGX[1] - C.SGX[0]) * sw, 1) + 'px', m: f(1 - sw), w: f(sw) };
    let cur = 0, prev = 0;
    (C.SY || []).forEach((s) => { if (live && t >= s[0]) cur = prev + (s[2] - prev) * inout(p(s[0], s[1])); prev = s[2]; });
    return {
      veil: f(Math.max(1 - p(0, 0.2), live ? p(P - 0.3, 0.3) : 0)), E, O, R, TP, SG,
      pt: { x: f(px, 1) + 'px', y: f(py, 1) + 'px' }, sy: f(cur, 1), stk: f(Math.max(C.STK || 0, cur + 16), 1)
    };
  }
}'''
class Cfg:
    def __init__(s, P, TS=4.0):
        s.d = dict(P=P, TS=TS, S=[1180, 700], W=[], T=[], EN=[], WIN={}, RV={}, SG=None, SGX=[0, 0], SY=[], ST={}, STK=0); s.nen = 0; s.nwin = 0
    def en(s, a): s.d['EN'].append(a); s.nen += 1; return 'e%d' % (s.nen - 1)
    def win(s, name, *ws): s.d['WIN'][name] = [list(w) for w in ws]; return name
    def rv(s, name, a, d, w): s.d['RV'][name] = [a, d, w]; return name
    def way(s, x, y, t): s.d['W'].append([round(x, 1), round(y, 1), t])
    def tap(s, x, y, t): s.d['T'].append([round(x, 1), round(y, 1), t])
def page(title, w, h, body, cfg, extra=''):
    c = cfg.d
    ov = ''.join('<div style="position: absolute; left: «TP.k%d.x»; top: «TP.k%d.y»; width: 80px; height: 80px; border-radius: 40px; background: #ffffff; opacity: «TP.k%d.o»; transform: «TP.k%d.tf»; pointer-events: none"></div>' % (i, i, i, i) for i in range(len(c['T'])))
    ov += '<svg width="22" height="26" viewBox="0 0 22 26" style="position: absolute; left: «pt.x»; top: «pt.y»; display: block; pointer-events: none" aria-hidden="true"><path d="M2 2l16 12-7 1.500 4 8-3 1.500-4-8-6 4z" fill="#ffffff" stroke="#0f1115" stroke-width="1.500" stroke-linejoin="round"></path></svg>'
    ov += '<div style="position: absolute; left: 0; top: 0; width: %dpx; height: %dpx; background: %s; opacity: «veil»; pointer-events: none"></div>' % (w, h, BG)
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
%s%s%s
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":%d,"height":%d}}'>
%s
</script>
</body>
</html>
''' % (title, NF[0], BG, w, h, BG, INK, NF[1], body, extra, ov, w, h, JS.replace('__C__', json.dumps(c)))
    return s.replace('«', '{{').replace('»', '}}')
def save(name, title, w, h, body, cfg, extra=''):
    open('project/' + name, 'w').write(page(title, w, h, body, cfg, extra)); print('scritto', name, w, h)
# ---------------------------------------------------------------- mattoni
def TX(x, y, t, fs=14, fw=700, c=SEC, ex=''):
    return '<div style="position: absolute; left: %spx; top: %spx; font-size: %spx; font-weight: %d; line-height: %dpx; color: %s; white-space: nowrap; %s">%s</div>' % (x, y, fs, fw, int(fs * 1.25), c, ex, t)
def TW(x, y, w, t, fs=14, fw=700, c=SEC, lh=18, ex=''):
    return '<div style="position: absolute; left: %spx; top: %spx; width: %spx; font-size: %spx; font-weight: %d; line-height: %dpx; color: %s; %s">%s</div>' % (x, y, w, fs, fw, lh, c, ex, t)
def box(x, y, w, h, inner, e=None, bg=CARD, ex=''):
    en = (' opacity: «%s.o»; transform: «%s.tf»;' % (('E.' + e,) * 2)) if e else ''
    return '<div style="position: absolute; left: %spx; top: %spx; width: %spx; height: %spx; box-sizing: border-box; background: %s; border: 1.500px solid %s; border-radius: 14px; box-shadow: 0 3px 0 %s;%s %s">%s</div>' % (x, y, w, h, bg, BRD, SH, en, ex, inner)
def ewrap(x, y, w, h, inner, e):
    return '<div style="position: absolute; left: %spx; top: %spx; width: %spx; height: %spx; opacity: «E.%s.o»; transform: «E.%s.tf»">%s</div>' % (x, y, w, h, e, e, inner)
def lay(inner, key, attr='o'):   # strato con opacità da una finestra O
    return '<div style="position: absolute; left: 0; top: 0; opacity: «O.%s.o»">%s</div>' % (key, inner)
def clip(x, y, w, h, rname, svg):
    return '<div style="position: absolute; left: %spx; top: %spx; width: «R.%s»; height: %spx; overflow: hidden"><svg width="%s" height="%s" style="display: block" aria-hidden="true">%s</svg></div>' % (x, y, rname, h, w, h, svg)
def perlayer(inner, per):        # strato Mese / Settimana: dissolvenza dal selettore
    return '<div style="position: absolute; left: 0; top: 0; opacity: «SG.%s»">%s</div>' % ('m' if per == 'M' else 'w', inner)
def tip(cfg, name, x, y, text, anchor='c'):
    wd = int(len(text) * 7.6 + 30)
    left = x - wd / 2 if anchor == 'c' else x
    return '<div style="position: absolute; left: %dpx; top: %dpx; height: 30px; line-height: 30px; padding: 0 14px; border-radius: 50px; background: #ffffff; color: #0f1115; font-size: 13px; font-weight: 800; white-space: nowrap; opacity: «O.%s.o»; pointer-events: none">%s</div>' % (left, y, name, text)
def hl(name, x, y, w, h):
    return '<div style="position: absolute; left: %spx; top: %spx; width: %spx; height: %spx; border-radius: 3px; background: #ffffff; opacity: calc(«O.%s.o» * 0.28); pointer-events: none"></div>' % (round(x, 1), round(y, 1), round(w, 1), round(h, 1), name)
ARROW = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="%s" stroke-width="2.500" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; left: %spx; top: %spx; display: block" aria-hidden="true"><path d="M4 12h16"></path><path d="M14 6l6 6-6 6"></path></svg>'
# ---------------------------------------------------------------- selettore a segmenti (come «Prove gratuite»)
SEGN = ['Oggi', 'Settimana', 'Mese', 'Sprint']; SEGW = 92
def selector(cfg, x, y):
    cfg.d['SGX'] = [3 + SEGW * 2, 3 + SEGW * 1]
    s = '<div style="position: absolute; left: «SG.x»; top: 3px; width: %dpx; height: 31px; border-radius: 50px; background: %s; box-shadow: 0 2px 0 %s"></div>' % (SEGW, BLU, SH)
    for i, n in enumerate(SEGN):
        base = 'position: absolute; left: %dpx; top: 3px; width: %dpx; height: 31px; line-height: 31px; text-align: center; font-size: 14px; font-weight: 700; white-space: nowrap;' % (3 + SEGW * i, SEGW)
        if i == 2: s += '<div style="%s color: %s; opacity: «SG.w»">%s</div><div style="%s color: #ffffff; opacity: «SG.m»">%s</div>' % (base, SEC, n, base, n)
        elif i == 1: s += '<div style="%s color: %s; opacity: «SG.m»">%s</div><div style="%s color: #ffffff; opacity: «SG.w»">%s</div>' % (base, SEC, n, base, n)
        else: s += '<div style="%s color: %s">%s</div>' % (base, SEC, n)
    return '<div style="position: absolute; left: %spx; top: %spx; width: %dpx; height: 40px; box-sizing: border-box; border-radius: 50px; background: %s; border: 1.500px solid %s">%s</div>' % (x, y, SEGW * 4 + 6 + 3, BG, BRD, s)
def seg_center(x, y, i): return (x + 1.5 + 3 + SEGW * i + SEGW / 2.0, y + 20)
SELW = SEGW * 4 + 9
# ---------------------------------------------------------------- grafico a colonne dei 30 (o 7) giorni
def colchart(key, per, w, h):
    sp = SP[key]; rows = PER[per]; vals = [r[sp['i']] for r in rows]; n = len(vals); ym = sp['ymax'][per]
    gut = 38; top, bot = 18, 24; ph = h - top - bot; slot = (w - gut) / float(n)
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
        if i == n - 1: anc = 'end'; tx = w
        s += '<text x="%.1f" y="%.1f" font-size="12" font-weight="800" text-anchor="%s" fill="#ffffff">%s</text>' % (tx, y(vals[i]) - 6, anc, sp['lab'](vals[i]))
    idx = [0, 7, 14, 21] if n > 10 else list(range(n - 1))
    for i in idx: s += '<text x="%.1f" y="%d" font-size="12" font-weight="700" text-anchor="%s" fill="%s">%s</text>' % (cx(i), h - 6, 'middle', TER, rows[i][0])
    s += '<text x="%d" y="%d" font-size="12" font-weight="800" text-anchor="end" fill="#ffffff">oggi</text>' % (w, h - 6)
    return s, cx, y, vals, bw
# ---------------------------------------------------------------- scheda di un grafico del tempo (numero grande + grafico)
def timecard(cfg, key, x, y, w, h, layout, e, tdraw, tc, hov=None):
    """hov: lista di (periodo, indice, nome finestra). Restituisce (markup, geometria assoluta per periodo)."""
    sp = SP[key]; inner = ''; geo = {}; extra = ''
    if layout == 'top': cx0, cy0, cw, ch = 16, 142, w - 32, h - 142 - 8
    else: cx0, cy0, cw, ch = 244, 20, w - 244 - 18, h - 36
    inner += TX(24, 18, sp['title'], 18, 800, INK)
    ncol = RED if key == 'e' else INK
    ny = 44 if layout == 'top' else 56
    for per in 'MW':
        inner += perlayer(TX(24, ny, BIG[key][per], 56 if layout == 'top' else 50, 800, ncol, 'letter-spacing: -0.5px') + TX(26, ny + 66, SUB[key][per], 15, 700, SEC), per)
    for per in 'MW':
        svg, cxf, yf, vals, bw = colchart(key, per, cw, ch)
        nm = cfg.rv('%s%s' % (key, per), tdraw if per == 'M' else tc, 1.4 if per == 'M' else 1.1, cw)
        inner += perlayer(clip(cx0, cy0, cw, ch, nm, svg), per)
        geo[per] = dict(cx=lambda i, cxf=cxf: x + cx0 + cxf(i), top=lambda i, yf=yf, vals=vals: y + cy0 + yf(vals[i]), base=y + cy0 + yf(0), bw=bw, vals=vals)
    return ewrap(x, y, w, h, '<div style="position: absolute; left: 0; top: 0; width: %dpx; height: %dpx; box-sizing: border-box; background: %s; border: 1.500px solid %s; border-radius: 14px; box-shadow: 0 3px 0 %s"></div>%s' % (w, h, CARD, BRD, SH, inner), e), geo
def hover_markup(cfg, key, per, geo, i, name, side='up'):
    g = geo[per]; sp = SP[key]; rows = PER[per]; v = g['vals'][i]; d = rows[i][0] if i < len(rows) - 1 else rows[i][0]
    x = g['cx'](i); yt = g['top'](i)
    bwid = max(g['bw'] + 6, 8)
    m = hl(name, x - bwid / 2.0, yt - 2, bwid, g['base'] - yt + 2)
    txt = sp['tip'](d, v)
    wd = len(txt) * 7.6 + 30
    tx = min(max(x - wd / 2.0, 8), 1272 - wd)
    ty = max(yt - 44, 8)
    if side == 'side': tx = x - wd - 14; ty = yt + 4
    return perlayer(m, per) + perlayer(tip(cfg, name, tx, ty, txt, 'l'), per)
# ---------------------------------------------------------------- «Per cosa»: barre orizzontali ordinate
def percard(cfg, x, y, w, h, layout, e, tdraw):
    inner = TX(24, 18, 'Per cosa', 18, 800, INK)
    if layout == 'wide':
        inner += TX(24, 56, fi(CT), 56, 800, INK, 'letter-spacing: -0.5px') + TX(26, 122, 'chiamate', 15, 700, SEC)
        bx, by, bw_, rh = 290, 20, w - 290 - 24, int((h - 36) / 7.0)
    else:
        inner += TX(24, 44, fi(CT), 40, 800, INK, 'letter-spacing: -0.5px') + TX(172, 62, 'chiamate', 15, 700, SEC)
        bx, by, bw_, rh = 24, 100, w - 48, int((h - 100 - 8) / 7.0)
    lw = 166; mx = (bw_ - 56) if layout != 'wide' else bw_ - lw - 64
    tight = layout != 'wide' and rh < 30   # riga bassa: etichetta e barra sulla stessa riga
    if tight: lw = 150; mx = bw_ - lw - 56
    for i, (nm, v) in enumerate(BARS):
        wpx = max(4, mx * v / float(BARS[0][1])); rn = cfg.rv('b%d' % i, tdraw + 0.08 * i, 0.9, wpx)
        if layout == 'wide' or tight:
            inner += '<div style="position: absolute; left: %dpx; top: %dpx; width: %dpx; height: %dpx; display: flex; align-items: center; gap: 10px"><div style="width: %dpx; font-size: 13px; font-weight: 700; color: %s; white-space: nowrap">%s</div><div style="width: «R.%s»; height: 14px; border-radius: 4px; background: %s; flex: none"></div><div style="font-size: 13px; font-weight: 800; color: #ffffff; white-space: nowrap">%s</div></div>' % (bx, by + i * rh, bw_, rh, lw - 10, SEC, nm, rn, LB, fi(v))
        else:
            inner += '<div style="position: absolute; left: %dpx; top: %dpx; width: %dpx"><div style="font-size: 12px; font-weight: 700; line-height: 14px; color: %s; white-space: nowrap">%s</div><div style="display: flex; align-items: center; gap: 8px; height: 8px; margin-top: 2px"><div style="width: «R.%s»; height: 8px; border-radius: 3px; background: %s; flex: none"></div><div style="font-size: 12px; font-weight: 800; color: #ffffff; white-space: nowrap">%s</div></div></div>' % (bx, by + i * rh, bw_, SEC, nm, rn, LB, fi(v))
    return ewrap(x, y, w, h, '<div style="position: absolute; left: 0; top: 0; width: %dpx; height: %dpx; box-sizing: border-box; background: %s; border: 1.500px solid %s; border-radius: 14px; box-shadow: 0 3px 0 %s"></div>%s' % (w, h, CARD, BRD, SH, inner), e)
# ---------------------------------------------------------------- benchmark
BM = DATI['benchmark']['passaggi']
def bmstate(p):
    g = p['giri'][-1]; return g['giusti'], g['casi']
def dots(cfg, pi, w, h, tdraw):
    p = BM[pi]; giri = p['giri']; n = len(giri); lo = 50.0
    y = lambda v: 8 + (h - 16) * (1 - (v - lo) / (100.0 - lo)); slot = (w - 64) / 13.0
    s = '<line x1="0" x2="%d" y1="%.1f" y2="%.1f" stroke="%s" stroke-width="1.500"></line><text x="%d" y="%.1f" font-size="12" font-weight="800" text-anchor="end" fill="%s">99%%</text>' % (w - 44, y(99), y(99), ORG, w, y(99) + 4, ORG)
    s += '<line x1="0" x2="%d" y1="%.1f" y2="%.1f" stroke="%s" stroke-width="1"></line>' % (w - 44, y(lo), y(lo), BRD)
    pts = [(10 + i * slot, y(100.0 * g['giusti'] / g['casi'])) for i, g in enumerate(giri)]
    if n > 1: s += '<polyline points="%s" fill="none" stroke="%s" stroke-width="1.500" stroke-linejoin="round"></polyline>' % (' '.join('%.1f,%.1f' % q for q in pts), TER)
    for i, (g, q) in enumerate(zip(giri, pts)):
        ok = 100.0 * g['giusti'] / g['casi'] >= 99; last = i == n - 1
        s += '<circle cx="%.1f" cy="%.1f" r="%d" fill="%s" stroke="%s" stroke-width="2"></circle>' % (q[0], q[1], 7 if last else 5, GRN if ok else LB, CARD)
    nm = cfg.rv('d%d' % pi, tdraw + 0.15 * pi, 1.3, w)
    return clip(0, 0, w, h, nm, s)
def benchcard(cfg, x, y, w, rowh, e, tdraw, dimcols, dimw=None, compact=False):
    """Tre passaggi misurati con andamento a punti e linea del 99%, quattro spenti."""
    pad = 24; inner = TX(pad, 18, 'Benchmark', 22, 800, INK)
    inner += '<svg width="30" height="12" style="position: absolute; left: %dpx; top: 26px" aria-hidden="true"><line x1="2" y1="6" x2="28" y2="6" stroke="%s" stroke-width="2.500" stroke-linecap="round"></line></svg>' % (w - pad - 114, ORG) + TX(w - pad - 76, 22, 'Soglia 99%', 14, 800, ORG)
    namew = 232 if w < 900 else 300; scw = 150 if w < 900 else 190
    dx = pad + namew + scw; dw = w - dx - pad
    yy = 64
    for i in range(3):
        p = BM[i]; gi, ca = bmstate(p); ok = 100.0 * gi / ca >= 99
        inner += '<div style="position: absolute; left: %dpx; top: %dpx; width: %dpx; height: %dpx; box-sizing: border-box; border-radius: 12px; background: %s; border: 1.500px solid %s"></div>' % (pad - 8, yy, w - 2 * pad + 16, rowh - 8, INN, BRD)
        inner += TX(pad + 8, yy + (rowh - 8) / 2.0 - 24, p['nome'], 18, 800, INK) + TX(pad + 8, yy + (rowh - 8) / 2.0 + 2, p['modello'], 14, 700, SEC)
        inner += '<div style="position: absolute; left: %dpx; top: %dpx; white-space: nowrap"><span style="font-size: 44px; font-weight: 800; line-height: 48px; color: %s">%d</span><span style="font-size: 16px; font-weight: 700; color: %s"> su %d</span></div>' % (pad + namew, yy + (rowh - 8) / 2.0 - 26, GRN if ok else INK, gi, SEC, ca)
        inner += '<div style="position: absolute; left: %dpx; top: %dpx">%s</div>' % (dx, yy + 8, dots(cfg, i, dw - 8, rowh - 24, tdraw))
        yy += rowh
    yy += 4; cols = dimcols; gw = (w - 2 * pad - 12 * (cols - 1)) / float(cols); dh = 56
    for j in range(4):
        p = BM[3 + j]; cxp = pad + (j % cols) * (gw + 12); cyp = yy + (j // cols) * (dh + 8)
        inner += '<div style="position: absolute; left: %.1fpx; top: %dpx; width: %.1fpx; height: %dpx; box-sizing: border-box; border-radius: 12px; border: 1.500px dashed %s"></div>' % (cxp, cyp, gw, dh, BRD)
        inner += TX(round(cxp + 16, 1), cyp + 8, p['nome'], 15, 800, TER) + TX(round(cxp + 16, 1), cyp + 30, 'Nessun giro', 13, 700, TER)
    hh = yy + ((4 + cols - 1) // cols) * (dh + 8) + 12 - 8
    return ewrap(x, y, w, hh, '<div style="position: absolute; left: 0; top: 0; width: %dpx; height: %dpx; box-sizing: border-box; background: %s; border: 1.500px solid %s; border-radius: 14px; box-shadow: 0 3px 0 %s"></div>%s' % (w, hh, CARD, BRD, SH, inner), e), hh
# ---------------------------------------------------------------- conversazioni (sempre il turno del coach prima)
CH = {c['id']: c for c in DATI['chat_vere_senza_nomi']}
def pair(i):
    c = CH[i]['chat']; a = c[0]['testo'].replace(' 💪', '.').replace('  ', ' ').strip(); b = c[1]['testo']
    assert c[0]['chi'] == 'coach' and c[1]['chi'] == 'utente'; return a, b
def convcard(cfg, x, y, w, ids, e, rowh, hlname=None, hlrow=None, narrow=False, ch_total=None, title=True):
    inner = ''
    if title: inner += TX(24, 18, 'Conversazioni', 22, 800, INK)
    y0 = 64 if title else 16; rows = ''
    for r, i in enumerate(ids):
        a, b = pair(i); ry = y0 + r * rowh
        if r: rows += '<div style="position: absolute; left: 24px; top: %dpx; width: %dpx; height: 1.500px; background: %s"></div>' % (ry, w - 48, BRD)
        if narrow:
            rows += TW(24, ry + 10, w - 48, a, 13, 700, SEC, 17) + ARROW % (INK, 24, ry + 49) + TW(52, ry + 46, w - 76, b, 14, 800, INK, 18)
        else:
            cw = int((w - 48 - 56) * 0.5); uw = w - 48 - 56 - cw
            rows += TW(24, ry, cw, a, 14, 700, SEC, 18, 'height: %dpx; display: flex; align-items: center' % rowh) + ARROW % (INK, 24 + cw + 18, ry + rowh / 2.0 - 10) + TW(24 + cw + 56, ry, uw, b, 14, 800, INK, 18, 'height: %dpx; display: flex; align-items: center' % rowh)
    if hlname is not None and hlrow is not None:
        rows = '<div style="position: absolute; left: 8px; top: %dpx; width: %dpx; height: %dpx; border-radius: 10px; background: %s; opacity: «O.%s.o»"></div>' % (y0 + hlrow * rowh + 2, w - 16, rowh - 4, SEL, hlname) + rows
    hh = ch_total or (y0 + len(ids) * rowh + 16)
    return ewrap(x, y, w, hh, '<div style="position: absolute; left: 0; top: 0; width: %dpx; height: %dpx; box-sizing: border-box; background: %s; border: 1.500px solid %s; border-radius: 14px; box-shadow: 0 3px 0 %s"></div>%s%s' % (w, hh, CARD, BRD, SH, inner, rows), e), hh
HEAD = lambda x, y, t: TX(x, y, t, 22, 800, INK)
FRAME = lambda w, H, vh: ('<div style="position: absolute; left: 0; top: 0; width: %dpx; height: «sy»px; background: #050608; opacity: 0.38; pointer-events: none"></div>'
                          '<div style="position: absolute; left: 0; top: calc(«sy»px + %dpx); width: %dpx; height: %dpx; background: #050608; opacity: 0.38; pointer-events: none"></div>'
                          '<div style="position: absolute; left: 0; top: «sy»px; width: %dpx; height: %dpx; box-sizing: border-box; border: 2px dashed %s; opacity: 0.8; pointer-events: none"></div>') % (w, vh, w, H, w, vh, BLU)
# ================================================================ 2A - TUTTO IN COLONNA
def build_2A():
    H = 1600; cfg = Cfg(14.0, 5.0); c = cfg.d
    ei = [cfg.en(0.1 + 0.12 * k) for k in range(8)]
    body = TX(32, 26, 'AI Coach', 28, 800, INK, 'opacity: «E.%s.o»' % ei[0])
    bc, bh = benchcard(cfg, 32, 84, 1216, 80, ei[1], 1.2, 4)
    body += bc
    uy = 84 + bh + 28; TC = 7.4
    body += HEAD(32, uy + 6, 'Uso') + selector(cfg, 1248 - SELW, uy)
    cy = uy + 56; cw3 = 392; chh = 288; geos = {}
    for k, key in enumerate('pce'):
        m, g = timecard(cfg, key, 32 + k * (cw3 + 20), cy, cw3, chh, 'top', ei[2 + k], 3.4 + 0.18 * k, TC + 0.4 + 0.15 * k)
        body += m; geos[key] = g
    py_ = cy + chh + 16
    body += percard(cfg, 32, py_, 1216, 272, 'wide', ei[5], 4.2)
    cy2 = py_ + 272 + 28
    conv, chh2 = convcard(cfg, 32, cy2, 1216, [2, 4, 13, 17, 16, 18], ei[6], 56, 'hrow', 2)
    body += conv
    assert cy2 + chh2 + 32 <= H, (cy2 + chh2)
    sx, sy_ = seg_center(1248 - SELW, uy, 1)
    c['SY'] = [[2.4, 1.0, 440], [9.6, 1.1, 880]]; c['SG'] = [TC]
    gp, ge, gw = geos['p']['M'], geos['e']['M'], geos['e']['W']
    cfg.win('hp', (5.0, 6.0)); cfg.win('he', (6.0, 6.9)); cfg.win('hw', (8.7, 9.5)); cfg.win('hrow', (11.3, 12.4))
    body += hover_markup(cfg, 'p', 'M', geos['p'], 14, 'hp') + hover_markup(cfg, 'e', 'M', geos['e'], 22, 'he', 'side') + hover_markup(cfg, 'e', 'W', geos['e'], 6, 'hw')
    cfg.way(gp['cx'](14) + 3, gp['top'](14) + 8, 5.0); cfg.way(ge['cx'](22) + 3, ge['top'](22) + 14, 6.0)
    cfg.way(sx, sy_, TC); cfg.tap(sx, sy_, TC)
    cfg.way(gw['cx'](6) + 3, gw['top'](6) + 10, 8.7); cfg.way(700, cy2 + 64 + 2 * 56 + 28, 11.3)
    save('prop-2A-tutto-in-colonna.dc.html', '2A - Tutto in colonna', 1280, H, body, cfg, FRAME(1280, H, 720))
# ================================================================ 2B - DUE COLONNE
def build_2B():
    H = 1260; cfg = Cfg(14.0, 5.0); c = cfg.d
    ei = [cfg.en(0.1 + 0.12 * k) for k in range(8)]
    LW, RX, RW = 797, 32 + 797 + 24, 395
    body = TX(32, 26, 'AI Coach', 28, 800, INK, 'opacity: «E.%s.o»' % ei[0])
    bc, bh = benchcard(cfg, 32, 84, LW, 80, ei[1], 1.2, 2)
    body += bc
    uy = 84 + bh + 28; TC = 6.9
    body += HEAD(32, uy + 6, 'Uso') + selector(cfg, 32 + LW - SELW, uy)
    cy = uy + 56; cw2 = 388; chh = 288; geos = {}
    pos = {'p': (32, cy), 'c': (32 + cw2 + 21, cy), 'e': (32, cy + chh + 20)}
    for k, key in enumerate('pce'):
        m, g = timecard(cfg, key, pos[key][0], pos[key][1], cw2, chh, 'top', ei[2 + k], 3.4 + 0.18 * k, TC + 0.4 + 0.15 * k)
        body += m; geos[key] = g
    body += percard(cfg, 32 + cw2 + 21, cy + chh + 20, cw2, chh, 'narrow', ei[5], 4.4)
    conv, chh2 = convcard(cfg, 0, 0, RW, [2, 4, 13, 17, 16, 18], ei[6], 92, 'hrow', 3, narrow=True, ch_total=628)
    body += '<div style="position: absolute; left: %dpx; top: «stk»px; width: %dpx; height: 628px">%s</div>' % (RX, RW, conv)
    assert cy + 2 * chh + 20 + 32 <= H
    c['STK'] = 84; c['SY'] = [[2.4, 1.0, 380], [9.0, 1.0, H - 720]]; c['SG'] = [TC]
    sx, sy_ = seg_center(32 + LW - SELW, uy, 1)
    gp, gc, gw = geos['p']['M'], geos['c']['M'], geos['e']['W']
    cfg.win('hp', (4.9, 5.7)); cfg.win('hc', (5.8, 6.6)); cfg.win('hw', (8.5, 9.2)); cfg.win('hrow', (10.8, 12.0))
    body += hover_markup(cfg, 'p', 'M', geos['p'], 14, 'hp') + hover_markup(cfg, 'c', 'M', geos['c'], 20, 'hc') + hover_markup(cfg, 'e', 'W', geos['e'], 6, 'hw')
    cfg.way(gp['cx'](14) + 3, gp['top'](14) + 8, 4.9); cfg.way(gc['cx'](20) + 3, gc['top'](20) + 8, 5.8)
    cfg.way(sx, sy_, TC); cfg.tap(sx, sy_, TC)
    cfg.way(gw['cx'](6) + 3, gw['top'](6) + 10, 8.5); cfg.way(RX + 200, H - 720 + 16 + 64 + 3 * 92 + 46, 10.8)
    save('prop-2B-due-colonne.dc.html', '2B - Due colonne', 1280, H, body, cfg, FRAME(1280, H, 720))
# ================================================================ 2C - UNA ALLA VOLTA
def build_2C():
    H = 800; cfg = Cfg(15.0, 5.0); c = cfg.d
    tabs = [('Benchmark', '3 su 7', 'misurati'), ('Uso', '126', 'persone oggi'), ('Conversazioni', fi(sum(DATI['uso']['sessioni_chat_prima_voce'].values())), 'chat')]
    ei = [cfg.en(0.1), cfg.en(0.2), cfg.en(0.3)]
    cfg.win('sec0', (-9, 4.0)); cfg.win('sec1', (4.3, 9.6)); cfg.win('sec2', (10.0, 99))
    cfg.win('tab0', (-9, 4.0)); cfg.win('tab1', (4.0, 9.6)); cfg.win('tab2', (9.6, 99))
    c['ST'] = {'sec0': 1, 'tab0': 1}
    tw = 392; body = ''
    for i, (lab, big, sub) in enumerate(tabs):
        x = 32 + i * (tw + 20)
        inner = TX(24, 16, lab, 16, 800, SEC) + '<div style="position: absolute; left: 24px; top: 40px; display: flex; align-items: baseline; gap: 10px; white-space: nowrap"><span style="font-size: 44px; font-weight: 800; line-height: 48px; color: #ffffff">%s</span><span style="font-size: 16px; font-weight: 700; color: %s">%s</span></div>' % (big, SEC, sub)
        sel = '<div style="position: absolute; left: 0; top: 0; width: %dpx; height: 96px; box-sizing: border-box; border-radius: 14px; background: %s; border: 1.500px solid %s; opacity: «O.tab%d.o»"></div>' % (tw, SEL, BLU, i)
        body += ewrap(x, 28, tw, 96, '<div style="position: absolute; left: 0; top: 0; width: %dpx; height: 96px; box-sizing: border-box; border-radius: 14px; background: %s; border: 1.500px solid %s; box-shadow: 0 3px 0 %s"></div>%s%s' % (tw, CARD, BRD, SH, sel, inner), ei[i])
    top = 148; TC = 7.6
    sec = lambda k, inner: '<div style="position: absolute; left: 0; top: 0; width: 1280px; height: %dpx; opacity: «O.sec%d.o»; transform: «O.sec%d.tf»">%s</div>' % (H, k, k, inner)
    bc, bh = benchcard(cfg, 32, top, 1216, 112, cfg.en(0.5), 0.9, 4)
    uw, uh = 598, 280
    sec1 = HEAD(32, top + 2, 'Uso') + selector(cfg, 1248 - SELW, top - 4)
    pos = {'p': (32, top + 52), 'c': (32 + uw + 20, top + 52), 'e': (32, top + 52 + uh + 16)}
    geos = {}
    for k, key in enumerate('pce'):
        m, g = timecard(cfg, key, pos[key][0], pos[key][1], uw, uh, 'left', cfg.en(4.4 + 0.1 * k), 5.0 + 0.15 * k, TC + 0.4 + 0.15 * k)
        sec1 += m; geos[key] = g
    sec1 += percard(cfg, 32 + uw + 20, top + 52 + uh + 16, uw, uh, 'wide', cfg.en(4.7), 5.3)
    conv, ch2 = convcard(cfg, 32, top, 1216, [2, 4, 13, 17, 16, 18, 5, 12], cfg.en(10.2), 64, 'hrow', 3)
    body += sec(0, bc) + sec(1, sec1) + sec(2, conv)
    sx, sy_ = 1248 - SELW, top - 4; tx, ty = seg_center(sx, sy_, 1)
    c['SG'] = [TC]
    gp, gw = geos['p']['M'], geos['e']['W']
    cfg.win('hp', (6.0, 6.9)); cfg.win('hw', (9.0, 9.5)); cfg.win('hrow', (12.4, 13.6))
    body += hover_markup(cfg, 'p', 'M', geos['p'], 14, 'hp') + hover_markup(cfg, 'e', 'W', geos['e'], 6, 'hw')
    t1 = (32 + 412 + 196, 76); t2 = (32 + 824 + 196, 76)
    cfg.way(t1[0], t1[1], 3.6); cfg.tap(t1[0], t1[1], 4.0)
    cfg.way(gp['cx'](14) + 3, gp['top'](14) + 8, 6.0)
    cfg.way(tx, ty, TC); cfg.tap(tx, ty, TC)
    cfg.way(gw['cx'](6) + 3, gw['top'](6) + 10, 9.0)
    cfg.way(t2[0], t2[1], 9.6); cfg.tap(t2[0], t2[1], 9.6)
    cfg.way(700, top + 64 + 3 * 64 + 32, 12.4)
    save('prop-2C-una-alla-volta.dc.html', '2C - Una alla volta', 1280, H, body, cfg)
# ================================================================ 2 - TELEFONO (la direzione A)
def build_2():
    W_, H_ = 390, 844; cfg = Cfg(16.0, 5.0); c = cfg.d
    ei = [cfg.en(0.1 + 0.12 * k) for k in range(8)]
    cw = 358; body = ''; y = 20
    body += TX(16, y, 'AI Coach', 28, 800, INK, 'opacity: «E.%s.o»' % ei[0]); y += 52
    inner = TX(20, 16, 'Benchmark', 20, 800, INK)
    inner += '<svg width="24" height="12" style="position: absolute; left: %dpx; top: 24px" aria-hidden="true"><line x1="2" y1="6" x2="22" y2="6" stroke="%s" stroke-width="2.500" stroke-linecap="round"></line></svg>' % (cw - 20 - 86, ORG) + TX(cw - 20 - 60, 20, '99%', 14, 800, ORG)
    yy = 60
    for i in range(3):
        p = BM[i]; gi, ca = bmstate(p); ok = 100.0 * gi / ca >= 99
        inner += TX(20, yy, p['nome'], 17, 800, INK) + TX(20, yy + 24, p['modello'], 13, 700, SEC)
        inner += '<div style="position: absolute; right: 20px; top: %dpx; white-space: nowrap"><span style="font-size: 32px; font-weight: 800; line-height: 36px; color: %s">%d</span><span style="font-size: 14px; font-weight: 700; color: %s"> su %d</span></div>' % (yy - 2, GRN if ok else INK, gi, SEC, ca)
        inner += '<div style="position: absolute; left: 20px; top: %dpx">%s</div>' % (yy + 50, dots(cfg, i, cw - 40, 44, 1.2))
        yy += 112
        if i < 2: inner += '<div style="position: absolute; left: 20px; top: %dpx; width: %dpx; height: 1.500px; background: %s"></div>' % (yy - 12, cw - 40, BRD)
    inner += TX(20, yy + 2, '4 passaggi senza giri', 14, 800, TER)
    bh = yy + 38
    body += ewrap(16, y, cw, bh, '<div style="position: absolute; left: 0; top: 0; width: %dpx; height: %dpx; box-sizing: border-box; background: %s; border: 1.500px solid %s; border-radius: 14px; box-shadow: 0 3px 0 %s"></div>%s' % (cw, bh, CARD, BRD, SH, inner), ei[1]); y += bh + 28
    uy = y; TC = 5.6
    body += HEAD(16, y + 6, 'Uso') + selector(cfg, 390 - 16 - SELW, y); y += 56
    geos = {}; ths = 284; draw = {'p': 3.0, 'c': 3.2, 'e': 7.4}; yy0 = y
    for key in 'pce':
        m, g = timecard(cfg, key, 16, y, cw, ths, 'top', ei[2 + 'pce'.index(key)], draw[key], (TC + 0.4) if key != 'e' else 7.4)
        body += m; geos[key] = g; y += ths + 16
    pch = 336
    body += percard(cfg, 16, y, cw, pch, 'narrow', ei[5], 10.3); y += pch + 28
    body += HEAD(16, y, 'Conversazioni'); y += 40
    conv, chh = convcard(cfg, 16, y, cw, [2, 4, 13, 17, 16], ei[6], 92, 'hrow', 2, narrow=True, title=False)
    body += conv; cvy = y; y += chh + 32
    TOTAL = y
    s1, s2, s3 = uy - 40, yy0 + 300 - 20, TOTAL - 844
    c['SY'] = [[2.2, 1.0, s1], [7.0, 1.0, s2], [9.6, 1.2, s3]]; c['SG'] = [TC]
    cfg.win('hp', (3.9, 4.9)); cfg.win('hw', (8.6, 9.5)); cfg.win('hrow', (12.0, 13.4))
    gp, gw = geos['p']['M'], geos['e']['W']
    tipi = hover_markup(cfg, 'p', 'M', geos['p'], 14, 'hp') + hover_markup(cfg, 'e', 'W', geos['e'], 6, 'hw')
    hdr = '<div style="position: absolute; left: 0; top: 0; width: 390px; height: %dpx; transform: translateY(-«sy»px)">%s%s</div>' % (TOTAL, body, tipi)
    sx, sy_ = seg_center(390 - 16 - SELW, uy, 1)
    cfg.way(gp['cx'](14) + 3, gp['top'](14) - s1 + 8, 3.9)
    cfg.way(sx, sy_ - s1, TC); cfg.tap(sx, sy_ - s1, TC)
    cfg.way(gw['cx'](6) + 3, gw['top'](6) - s2 + 10, 8.6)
    cfg.way(220, cvy + 64 + 46 - s3, 12.0)
    c['S'] = [330, 760]
    save('prop-2-telefono.dc.html', '2 - Telefono', 390, 844, hdr, cfg)
if __name__ == '__main__':
    build_2A(); build_2B(); build_2C(); build_2()
