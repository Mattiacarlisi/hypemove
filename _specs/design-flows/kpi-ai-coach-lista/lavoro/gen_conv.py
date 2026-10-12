# Tavole «Conversazioni» (pagina AI Coach, dashboard KPI, tema Notte): tre direzioni + telefono.
# Dati veri: dati.json -> chat_vere_senza_nomi. Si lancia dalla cartella che contiene project/ e dati.json.
import json, math, re, html as H

NB, CARD, NBR, INK, NM, TER, BLU, LBL, SH = '#0f1115', '#1a1d24', '#2a2e37', '#ffffff', '#9ca3af', '#6f7683', '#4361ee', '#8da2ff', '#050608'
SEL, SEGBG, RAISED = '#262d45', '#14171d', '#20242d'
FONT = ('family=Nunito:wght@500;600;700;800', 'Nunito, system-ui, sans-serif')

# ------------------------------------------------------------------ dati
CH = {c['id']: c for c in json.load(open('dati.json'))['chat_vere_senza_nomi']}
EMO = re.compile('[\U0001F300-\U0001FAFF☀-➿]️?')
for c in CH.values():
    for t in c['chat']:
        t['testo'] = re.sub(r'\s+', ' ', EMO.sub('', t['testo'])).strip()
SCR = {'workout-feedback': 'Fine workout', 'home': 'Home', 'workout-details': 'Dettaglio workout', None: '—'}
# id: (utente, data, ora) — sere fra il 02/10 e l'08/10/2026
META = {18: ('Utente 1873', '08/10', '21:42'), 13: ('Utente 0412', '08/10', '20:15'), 6: ('Utente 2290', '07/10', '22:08'),
        2: ('Utente 0731', '06/10', '21:30'), 1: ('Utente 3056', '04/10', '20:47'), 15: ('Utente 1124', '02/10', '22:20'),
        14: ('Utente 0958', '08/10', '21:05'), 17: ('Utente 2417', '07/10', '20:36'), 11: ('Utente 1530', '06/10', '22:12'),
        12: ('Utente 3342', '05/10', '21:19'), 3: ('Utente 0617', '04/10', '20:58'), 4: ('Utente 2873', '03/10', '21:44'),
        5: ('Utente 1409', '02/10', '22:03'), 16: ('Utente 0845', '05/10', '21:51')}
TABS = [('Spontanee', [18, 13, 6, 2, 1, 15]), ('Post-workout', [14, 17, 11, 12, 3, 4, 5]), ('Primo workout', [16])]
who = lambda i: META[i][0]
when = lambda i: META[i][1] + ' · ' + META[i][2]
scr = lambda i: SCR[CH[i]['schermata']]
def first(i, chi):
    for t in CH[i]['chat']:
        if t['chi'] == chi: return t['testo']
    return None
esc = lambda s: H.escape(s, quote=False)

# ------------------------------------------------------------------ canali di animazione (funzioni pure di t)
class Reg:
    def __init__(s): s.k = {}; s.n = 0
    def ch(s, kf, m='i'):
        n = 'c%d' % s.n; s.n += 1; s.k[n] = {'m': m, 'k': kf}; return n
    def v(s, kf, m='i'): return '«K.%s»' % s.ch(kf, m)
    def ent(s, a, dy=12):
        return 'opacity: %s; transform: translateY(%spx);' % (s.v([[a, 0], [a + .5, 1]], 'o'), s.v([[a, dy], [a + .5, 0]], 'o'))
    def pop(s, a, org):
        return 'opacity: %s; transform: scale(%s); transform-origin: %s;' % (s.v([[a, 0], [a + .22, 1]], 'l'), s.v([[a, .6], [a + .5, 1]], 'p'), org)

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

def page(R, title, w, h, body, C, pointer=True):
    base = dict(P=10, TS=5, S=[w - 140, h - 80], W=[], T=[])
    base.update(C); base['T'] = (base['T'] + [None] * 4)[:4]; base['K'] = R.k
    ov = ''.join('<div style="position: absolute; left: «tp%d.x»; top: «tp%d.y»; width: 80px; height: 80px; border-radius: 40px; background: #ffffff; opacity: «tp%d.o»; transform: «tp%d.tf»; pointer-events: none"></div>' % (i, i, i, i) for i in (1, 2, 3, 4))
    if pointer:
        ov += '<svg width="22" height="26" viewBox="0 0 22 26" style="position: absolute; left: «pt.x»; top: «pt.y»; display: block; pointer-events: none" aria-hidden="true"><path d="M2 2l16 12-7 1.500 4 8-3 1.500-4-8-6 4z" fill="#ffffff" stroke="#0f1115" stroke-width="1.500" stroke-linejoin="round"></path></svg>'
    ov += '<div style="position: absolute; left: 0; top: 0; width: %dpx; height: %dpx; background: %s; opacity: «veil»; pointer-events: none"></div>' % (w, h, NB)
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
''' % (title, FONT[0], NB, w, h, NB, INK, FONT[1], body, ov, w, h, JS.replace('__C__', json.dumps(base)))
    return s.replace('«', '{{').replace('»', '}}')

# ------------------------------------------------------------------ mattoncini
def ab(x, y, w, h, st, inner='', extra=''):
    g = 'position: absolute; left: %spx; top: %spx; ' % (x, y)
    if w is not None: g += 'width: %spx; ' % w
    if h is not None: g += 'height: %spx; ' % h
    return '<div style="%s%s"%s>%s</div>' % (g, st, extra, inner)
def txt(x, y, t, fs=14, fw=700, col=INK, w=None, st=''):
    return ab(x, y, w, None, 'font-size: %dpx; font-weight: %d; line-height: %dpx; color: %s; white-space: nowrap; %s' % (fs, fw, round(fs * 1.4), col, st), esc(t))
def ic(d, sz=20, col=NM, sw=2, st=''):
    return '<svg width="%s" height="%s" viewBox="0 0 24 24" fill="none" stroke="%s" stroke-width="%s" stroke-linecap="round" stroke-linejoin="round" style="display: block; flex: none; %s" aria-hidden="true">%s</svg>' % (sz, sz, col, sw, st, d)
SPARK = '<path d="M11 3l1.900 5.100L18 10l-5.100 1.900L11 17l-1.900-5.100L4 10l5.100-1.900z"></path><path d="M19 15v5M16.500 17.500h5"></path>'
ARROW = '<path d="M5 5v6a3 3 0 0 0 3 3h11"></path><path d="M15 10l4 4-4 4"></path>'
ARROWR = '<path d="M4 12h15"></path><path d="M14 7l5 5-5 5"></path>'
CHD = '<path d="M6 9l6 6 6-6"></path>'
CHR = '<path d="M9 6l6 6-6 6"></path>'
SEARCH = '<circle cx="11" cy="11" r="7"></circle><path d="M20 20l-4-4"></path>'
XX = '<path d="M6 6l12 12M18 6L6 18"></path>'
RAIL = ['<path d="M4 11l8-7 8 7v9H4z"></path>', '<path d="M5 20V10M12 20V4M19 20v-7"></path>', '<circle cx="9" cy="8" r="3.500"></circle><path d="M3 20c0-3.500 3-6 6-6s6 2.500 6 6"></path>', SPARK, '<circle cx="12" cy="12" r="3"></circle><path d="M12 3v3M12 18v3M3 12h3M18 12h3"></path>']
MENU = '<path d="M4 7h16M4 12h16M4 17h16"></path>'
def av(sz): return '<div style="width: %dpx; height: %dpx; border-radius: 50%%; background: %s; display: flex; align-items: center; justify-content: center; flex: none">%s</div>' % (sz, sz, SEL, ic(SPARK, round(sz * .62), LBL, 2))
ELL = 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0;'

def card(x, y, w, h, inner, R=None, hch=None, ent=''):
    hs = ('«K.%s»px' % hch) if hch else '%spx' % h
    return '<div style="position: absolute; left: %spx; top: %spx; width: %spx; height: %s; background: %s; border: 1.500px solid %s; border-radius: 14px; box-shadow: 0 3px 0 %s; box-sizing: border-box; overflow: hidden; %s">%s</div>' % (x, y, w, hs, CARD, NBR, SH, ent, inner)

def shell(R, with_rail=True):
    s = ''
    if with_rail:
        s += ab(16, 16, 48, 688, 'background: %s; border: 1.500px solid %s; border-radius: 14px; box-shadow: 0 3px 0 %s; box-sizing: border-box; %s' % (CARD, NBR, SH, R.ent(0.1)))
        for i, d in enumerate(RAIL):
            on = i == 3
            s += ab(20, 28 + i * 52, 40, 40, 'border-radius: 12px; display: flex; align-items: center; justify-content: center; background: %s; %s' % (SEL if on else 'transparent', R.ent(0.15 + .04 * i, 6)), ic(d, 20, INK if on else TER))
    s += txt(88, 20, 'AI Coach', 22, 800, INK, None, R.ent(0.1, 6))
    return s

def ghost(R, y_ref, a=.6):
    bars = ab(24, 24, 160, 16, 'border-radius: 8px; background: %s' % NBR) + ab(24, 64, 520, 12, 'border-radius: 6px; background: %s; opacity: .6' % NBR) + ab(24, 88, 380, 12, 'border-radius: 6px; background: %s; opacity: .6' % NBR)
    return '<div style="position: absolute; left: 88px; top: «K.%s»px; width: 1160px; height: 160px; background: %s; border: 1.500px solid %s; border-radius: 14px; box-sizing: border-box; opacity: .55">%s</div>' % (y_ref, CARD, NBR, bars)

def seg(R, x, y, bw, pillch, labels=('Spontanee', 'Post-workout', 'Primo workout'), fs=14):
    w = bw * 3 + 8 + 3
    s = ab(0, 0, w, 43, 'box-sizing: border-box; border-radius: 50px; background: %s; border: 1.500px solid %s' % (SEGBG, NBR))
    s += '<div style="position: absolute; left: «K.%s»px; top: 5.5px; width: %spx; height: 32px; box-sizing: border-box; border-radius: 50px; background: %s; border: 1.500px solid %s"></div>' % (pillch, bw, SEL, BLU)
    for i, l in enumerate(labels):
        s += ab(5.5 + bw * i, 5.5, bw, 32, 'font-size: %dpx; font-weight: 800; line-height: 32px; text-align: center; color: %s' % (fs, INK), esc(l))
    return ab(x, y, w, 43, '', s), w
def search(x, y, w):
    return ab(x, y, w, 40, 'box-sizing: border-box; border-radius: 50px; background: %s; border: 1.500px solid %s; display: flex; align-items: center; gap: 10px; padding: 0 16px; font-size: 14px; font-weight: 700; color: %s' % (SEGBG, NBR, TER), ic(SEARCH, 18, TER) + 'Cerca utente')

# ------------------------------------------------------------------ fumetti
def est_lines(t, maxw, fs):
    cpl = max(8, int((maxw - 34) / (fs * 0.5)))
    return max(1, math.ceil(len(t) / cpl))
def stack(R, cid, t0, step, maxw, fs, lh, avs=28, gap=12):
    """Colonna di fumetti, si legge SEMPRE dal coach. Restituisce (html, altezza stimata)."""
    items = list(CH[cid]['chat'])
    if items[0]['chi'] != 'coach': items = [{'chi': 'coach', 'testo': None}] + items
    out, tot = [], 0
    for i, it in enumerate(items):
        a = t0 + i * step
        if it['chi'] == 'coach':
            if it['testo'] is None:
                b = '<div style="box-sizing: border-box; max-width: %dpx; padding: 9px 16px; border-radius: 18px 18px 18px 6px; border: 1.500px dashed %s; color: %s; font-size: %dpx; font-weight: 700; line-height: %dpx">Nessun messaggio</div>' % (maxw, NBR, TER, fs, lh); n = 1
            else:
                n = est_lines(it['testo'], maxw, fs)
                b = '<div style="box-sizing: border-box; max-width: %dpx; padding: 9px 16px; border-radius: 18px 18px 18px 6px; background: %s; border: 1.500px solid %s; font-size: %dpx; font-weight: 700; line-height: %dpx; color: %s">%s</div>' % (maxw, RAISED, NBR, fs, lh, INK, esc(it['testo']))
            row = '<div style="display: flex; align-items: flex-end; gap: 10px; %s">%s%s</div>' % (R.pop(a, 'left bottom'), av(avs), b)
        else:
            n = est_lines(it['testo'], maxw, fs)
            b = '<div style="box-sizing: border-box; max-width: %dpx; padding: 9px 16px; border-radius: 18px 18px 6px 18px; background: %s; border: 1.500px solid %s; font-size: %dpx; font-weight: 700; line-height: %dpx; color: %s">%s</div>' % (maxw, BLU, BLU, fs, lh, INK, esc(it['testo']))
            row = '<div style="display: flex; justify-content: flex-end; %s">%s</div>' % (R.pop(a, 'right bottom'), b)
        out.append(row); tot += n * lh + 21 + (gap if i else 0)
    return '<div style="display: flex; flex-direction: column; gap: %dpx">%s</div>' % (gap, ''.join(out)), tot

def mini_stack(cid):
    """Fumetti piccoli, già leggibili, senza animazione (scheda del nastro)."""
    items = list(CH[cid]['chat'])
    if items[0]['chi'] != 'coach': items = [{'chi': 'coach', 'testo': None}] + items
    clamp = lambda n: 'display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: %d; overflow: hidden;' % n
    out = []
    for it in items:
        if it['chi'] == 'coach':
            if it['testo'] is None: b = '<div style="padding: 6px 12px; border-radius: 14px 14px 14px 5px; border: 1.500px dashed %s; color: %s; font-size: 13px; font-weight: 700; line-height: 18px">Nessun messaggio</div>' % (NBR, TER)
            else: b = '<div style="min-width: 0; padding: 6px 12px; border-radius: 14px 14px 14px 5px; background: %s; border: 1.500px solid %s; font-size: 13px; font-weight: 700; line-height: 18px; %s">%s</div>' % (RAISED, NBR, clamp(4), esc(it['testo']))
            out.append('<div style="display: flex; align-items: flex-end; gap: 8px">%s%s</div>' % (av(20), b))
        else:
            out.append('<div style="display: flex; justify-content: flex-end"><div style="max-width: 196px; padding: 6px 12px; border-radius: 14px 14px 5px 14px; background: %s; font-size: 13px; font-weight: 700; line-height: 18px; %s">%s</div></div>' % (BLU, clamp(3), esc(it['testo'])))
    return '<div style="display: flex; flex-direction: column; gap: 8px">%s</div>' % ''.join(out)

def coach_user_lines(cid, x, y, w, fs1, fs2, dy2, op=''):
    c, u = first(cid, 'coach'), first(cid, 'utente')
    c1 = esc(c) if c else 'Nessun messaggio'; cc = NM if c else TER
    l1 = '<div style="display: flex; align-items: center; gap: 8px; width: %dpx">%s<div style="%s font-size: %dpx; font-weight: 700; color: %s">%s</div></div>' % (w, ic(SPARK, 18, LBL), ELL, fs1, cc, c1)
    l2 = '<div style="display: flex; align-items: center; gap: 8px; width: %dpx">%s<div style="%s font-size: %dpx; font-weight: 800; color: %s">%s</div></div>' % (w, ic(ARROW, 18, TER), ELL, fs2, INK, esc(u))
    return ab(x, y, w, 20, op, l1) + ab(x, y + dy2, w, 20, op, l2)

PTR = lambda xy: xy

# ================================================================== 3A  Elenco che si apre
BOARDS = {}
def save(name, title, w, h, s):
    open('project/' + name, 'w').write(s); BOARDS[name] = (w, h, title)

def build_3a():
    R = Reg(); CX, CY, CW = 88, 72, 1160
    h0 = 364; OPEN = 1; t_hov, t_clk, t_pop = 1.9, 2.7, 3.2
    chat_html, chat_h = stack(R, 13, t_pop + .1, .6, 480, 15, 22)
    ph = chat_h + 44
    # canali
    kh = [[2.7, h0], [3.4, h0 + ph], [6.8, h0 + ph], [7.5, h0]]
    hc = R.ch(kh)
    dy = R.ch([[2.7, 0], [3.4, ph + 8], [6.8, ph + 8], [7.5, 0]])
    gy = R.ch([[t, v + CY + 16] for t, v in kh])
    pill = R.ch([[6.9, 5.5], [7.5, 5.5 + 128]])
    l1 = R.ch([[6.9, 1], [7.3, 0]]); l2 = R.ch([[7.0, 0], [7.5, 1]])
    hov = R.ch([[t_hov, 0], [t_hov + .3, 1], [6.8, 1], [7.1, 0]])
    pv = R.ch([[t_clk, 1], [t_clk + .4, 0], [6.8, 0], [7.1, 1]])
    rot = R.ch([[t_clk, 0], [t_clk + .5, 180], [6.8, 180], [7.2, 0]])
    pan = R.ch([[3.0, 0], [3.4, 1]], 'l')
    def row(cid, r, k, hov_ch=None, pv_ch=None, rot_ch=None):
        y = r * 60
        s = ''
        if hov_ch: s += '<div style="position: absolute; left: 8px; top: 2px; width: 1144px; height: 56px; border-radius: 12px; background: %s; opacity: «K.%s»"></div>' % (RAISED, hov_ch)
        s += txt(24, 9, who(cid), 15, 800, INK) + txt(24, 31, when(cid), 13, 700, NM) + txt(208, 20, scr(cid), 13, 700, TER)
        s += coach_user_lines(cid, 368, 9, 700, 14, 15, 22, ('opacity: «K.%s»;' % pv_ch) if pv_ch else '')
        s += ab(1112, 20, 20, 20, ('transform: rotate(«K.%s»deg);' % rot_ch) if rot_ch else '', ic(CHD, 20, TER))
        if k < 3: s += ab(24, 58, 1112, 1.5, 'background: %s' % NBR)
        return ab(0, 80 + y, CW, 60, R.ent(.5 + .08 * r), s)
    def footer(n): return ab(0, 320, CW, 44, '', txt(24, 8, 'Altre %d' % n, 14, 800, NM) + ab(86, 12, 20, 20, '', ic(CHD, 18, NM)))
    panel = ab(192, 140 + 60 + 4, 760, ph - 8 - 8, 'box-sizing: border-box; border-radius: 14px; background: %s; border: 1.500px solid %s; padding: 24px; opacity: «K.%s»' % (SEGBG, NBR, pan), chat_html)
    ids1, ids2 = TABS[0][1], TABS[1][1]
    L1 = ''.join(row(ids1[r], r, r, hov if r == OPEN else None, pv if r == OPEN else None, rot if r == OPEN else None) for r in range(2))
    L1 = L1.replace('top: 140px', 'top: 140px')
    below1 = ''.join(row(ids1[r], r, r) for r in (2, 3)) + footer(len(ids1) - 4)
    L1 = ab(0, 0, CW, h0, 'opacity: «K.%s»' % l1, L1 + panel + ab(0, 0, CW, h0, 'transform: translateY(«K.%s»px)' % dy, '<div style="position: absolute; left:0; top:0; width:1160px; height:1px"></div>' + below1))
    L2 = ab(0, 0, CW, h0, 'opacity: «K.%s»' % l2, ''.join(row(ids2[r], r, r) for r in range(4)) + footer(len(ids2) - 4))
    sg, sw = seg(R, CW - 24 - 395, 16, 128, pill)
    hdr = txt(24, 24, 'Conversazioni', 22, 800, INK) + search(CW - 24 - 395 - 16 - 192, 17, 192) + sg + ab(24, 71, 1112, 1.5, 'background: %s' % NBR)
    sec = card(CX, CY, CW, h0, hdr + L1 + L2, R, hc, R.ent(.2, 14))
    rowc = lambda r: CY + 80 + r * 60 + 30
    segx = CX + CW - 24 - 395 + 5.5 + 128 + 64
    C = dict(P=10, TS=5.2, S=[1140, 600], W=[[700, rowc(OPEN), 2.1], [segx, CY + 38, 6.5]], T=[[700, rowc(OPEN), t_clk], [segx, CY + 38, 6.9]])
    body = shell(R) + ghost(R, gy) + sec
    save('prop-3A-elenco-si-apre.dc.html', '3A - Elenco aperto', 1280, 720, page(R, '3A - Elenco aperto', 1280, 720, body, C))

# ================================================================== 3B  Fumetti in colonna
def build_3b():
    R = Reg(); CX, CY, CW = 88, 72, 1160
    h0, hop = 432, 624
    CWD, CHT, GAP = 264, 328, 280
    kh = [[3.0, h0], [3.7, hop], [6.8, hop], [7.5, h0]]
    hc = R.ch(kh); gy = R.ch([[t, v + CY + 16] for t, v in kh])
    pill = R.ch([[6.9, 5.5], [7.5, 5.5 + 128]])
    l1 = R.ch([[6.9, 1], [7.3, 0]]); l2 = R.ch([[7.0, 0], [7.5, 1]])
    scroll = R.ch([[1.0, 0], [1.9, -280]])
    cw = R.ch([[3.0, CWD], [3.7, 456], [6.8, 456], [7.5, CWD]]); chh = R.ch([[3.0, CHT], [3.7, 520], [6.8, 520], [7.5, CHT]])
    dx = R.ch([[3.0, 0], [3.7, 192], [6.8, 192], [7.5, 0]])
    hov = R.ch([[2.4, 0], [2.7, 1], [6.8, 1], [7.2, 0]])
    fade_c = R.ch([[3.0, 1], [3.3, 0], [6.9, 0], [7.3, 1]], 'l')
    fade_o = R.ch([[3.2, 0], [3.5, 1]], 'l')
    chat_html, _ = stack(R, 13, 3.6, .6, 372, 15, 22)
    def mcard(cid, i, opened=False):
        head = txt(16, 13, who(cid), 15, 800, INK) + txt(16, 35, when(cid), 12, 700, NM) + ab(120, 14, None, None, 'left: auto; right: 16px; text-align: right; font-size: 12px; font-weight: 700; line-height: 17px; color: %s' % TER, esc(scr(cid))) + ab(0, 62, None, 1.5, 'left: 0; right: 0; background: %s' % NBR)
        if opened:
            body = ab(0, 62, None, 266, 'right: 0; overflow: hidden; opacity: «K.%s»' % fade_c, '<div style="padding: 12px 16px">%s</div>' % mini_stack(cid))
            body += ab(0, 63.5, None, 440, 'right: 0; overflow: hidden; opacity: «K.%s»' % fade_o, '<div style="padding: 16px">%s</div>' % chat_html)
            wst = 'width: «K.%s»px; height: «K.%s»px;' % (cw, chh)
            sel = '<div style="position: absolute; left: 0; top: 0; right: 0; bottom: 0; box-sizing: border-box; border-radius: 14px; border: 1.500px solid %s; opacity: «K.%s»"></div>' % (BLU, hov)
        else:
            fade = '<div style="position: absolute; left: 0; right: 0; bottom: 0; height: 48px; background: linear-gradient(to bottom, rgba(20,23,29,0), %s)"></div>' % SEGBG
            body = ab(0, 62, None, 266, 'right: 0; overflow: hidden', '<div style="padding: 12px 16px">%s</div>' % mini_stack(cid)) + fade
            wst = 'width: %dpx; height: %dpx;' % (CWD, CHT); sel = ''
        return '<div style="position: absolute; left: %dpx; top: 0px; %s box-sizing: border-box; border-radius: 14px; background: %s; border: 1.500px solid %s; overflow: hidden; %s">%s%s%s</div>' % (24 + GAP * i, wst, SEGBG, NBR, ('transform: translateX(«K.%s»px);' % dx) if (i > 1 and not opened) else '', head, body, sel)
    def ribbon(ids, openat, a):
        cs = ''
        for i, cid in enumerate(ids):
            e = R.ent(a + .09 * i, 18)
            cs += '<div style="position: absolute; left: 0; top: 0; width: 100px; height: 1px; %s">%s</div>' % ('', '') if False else ab(0, 0, None, None, e + ' left: 0; top: 0;', mcard(cid, i, opened=(i == openat)))
        return cs
    def layer(ids, openat, a, op):
        return ab(0, 80, CW, 540, 'opacity: «K.%s»' % op + ('; transform: translateX(«K.%s»px)' % scroll if openat is not None else ''), ribbon(ids, openat, a))
    ids1, ids2 = TABS[0][1], TABS[1][1]
    sg, sw = seg(R, CW - 24 - 395, 16, 128, pill)
    hdr = txt(24, 24, 'Conversazioni', 22, 800, INK) + search(CW - 24 - 395 - 16 - 192, 17, 192) + sg
    sec = card(CX, CY, CW, h0, layer(ids1, 1, .55, l1) + layer(ids2, None, .55, l2) + hdr, R, hc, R.ent(.2, 14))
    segx = CX + CW - 24 - 395 + 5.5 + 128 + 64
    tx, ty = CX + 24 + 132, CY + 80 + 150
    C = dict(P=10, TS=5.2, S=[1140, 620], W=[[tx, ty, 2.7], [segx, CY + 38, 6.5]], T=[[tx, ty, 3.0], [segx, CY + 38, 6.9]])
    save('prop-3B-fumetti-in-colonna.dc.html', '3B - Fumetti in colonna', 1280, 720, page(R, '3B - Fumetti in colonna', 1280, 720, shell(R) + ghost(R, gy) + sec, C))

# ================================================================== 3C  Chat a pannello
def build_3c():
    R = Reg(); CX, CY, CW = 88, 72, 1160
    h0 = 80 + 5 * 40 + 44
    PW = 520
    pill = R.ch([[7.9, 5.5], [8.4, 5.5 + 128]])
    l1 = R.ch([[7.9, 1], [8.2, 0]]); l2 = R.ch([[8.0, 0], [8.4, 1]])
    hov = R.ch([[1.9, 0], [2.2, 1], [6.9, 1], [7.2, 0]])
    px = R.ch([[2.7, 1280], [3.4, 1280 - PW], [6.3, 1280 - PW], [6.9, 1280]], 'i')
    scrim = R.ch([[2.7, 0], [3.4, .6], [6.3, .6], [6.9, 0]], 'l')
    chat_html, _ = stack(R, 13, 3.6, .6, 400, 16, 24)
    def row(cid, r, k, hov_ch=None):
        s = ''
        if hov_ch: s += '<div style="position: absolute; left: 8px; top: 2px; width: 1144px; height: 36px; border-radius: 10px; background: %s; opacity: «K.%s»"></div>' % (RAISED, hov_ch)
        s += txt(24, 9, when(cid), 13, 700, NM) + txt(160, 8, who(cid), 15, 800, INK)
        c, u = first(cid, 'coach'), first(cid, 'utente')
        c1 = esc(c) if c else 'Nessun messaggio'; cc = NM if c else TER
        pv = '<div style="display: flex; align-items: center; gap: 8px; width: 800px">%s<div style="flex: 1; %s font-size: 13px; font-weight: 700; color: %s">%s</div>%s<div style="flex: 1; %s font-size: 14px; font-weight: 800; color: %s">%s</div></div>' % (ic(SPARK, 18, LBL), ELL, cc, c1, ic(ARROWR, 18, TER), ELL, INK, esc(u))
        s += ab(290, 10, 800, 20, '', pv) + ab(1116, 10, 20, 20, '', ic(CHR, 20, TER))
        if k < 4: s += ab(24, 38.5, 1112, 1.5, 'background: %s' % NBR)
        return ab(0, 80 + r * 40, CW, 40, R.ent(.5 + .07 * r), s)
    def footer(n): return ab(0, 80 + 200, CW, 44, '', txt(24, 8, 'Altre %d' % n, 14, 800, NM) + ab(86, 12, 20, 20, '', ic(CHD, 18, NM)))
    ids1, ids2 = TABS[0][1], TABS[1][1]
    L1 = ab(0, 0, CW, h0, 'opacity: «K.%s»' % l1, ''.join(row(ids1[r], r, r, hov if r == 1 else None) for r in range(5)) + footer(len(ids1) - 5))
    L2 = ab(0, 0, CW, h0, 'opacity: «K.%s»' % l2, ''.join(row(ids2[r], r, r) for r in range(5)) + footer(len(ids2) - 5))
    pill_ch = pill
    sg, sw = seg(R, CW - 24 - 395, 16, 128, pill_ch)
    hdr = txt(24, 24, 'Conversazioni', 22, 800, INK) + search(CW - 24 - 395 - 16 - 192, 17, 192) + sg + ab(24, 71, 1112, 1.5, 'background: %s' % NBR)
    sec = card(CX, CY, CW, h0, hdr + L1 + L2, R, None, R.ent(.2, 14))
    sec = sec.replace('height: %spx;' % h0, 'height: %spx;' % h0)
    ghost_ = '<div style="position: absolute; left: 88px; top: %dpx; width: 1160px; height: 160px; background: %s; border: 1.500px solid %s; border-radius: 14px; box-sizing: border-box; opacity: .55">%s</div>' % (CY + h0 + 16, CARD, NBR, ab(24, 24, 160, 16, 'border-radius: 8px; background: %s' % NBR) + ab(24, 64, 520, 12, 'border-radius: 6px; background: %s; opacity: .6' % NBR))
    # pannello
    cid = 13
    close = ab(PW - 24 - 44, 20, 44, 44, 'box-sizing: border-box; border-radius: 50%%; background: %s; border: 1.500px solid %s; display: flex; align-items: center; justify-content: center' % (SEGBG, NBR), ic(XX, 20, INK))
    panel = '<div style="position: absolute; left: «K.%s»px; top: 0px; width: %dpx; height: 720px; box-sizing: border-box; background: %s; border-left: 1.500px solid %s; box-shadow: -8px 0 32px rgba(5,6,8,.6)">%s</div>' % (
        px, PW, CARD, NBR,
        txt(24, 20, who(cid), 22, 800, INK) + txt(24, 50, when(cid) + ' · ' + scr(cid), 14, 700, NM) + close + ab(0, 84, None, 1.5, 'left: 0; right: 0; background: %s' % NBR) +
        ab(0, 85.5, None, 600, 'left: 0; right: 0; overflow: hidden', '<div style="padding: 24px">%s</div>' % chat_html))
    scr_ = '<div style="position: absolute; left: 0; top: 0; width: 1280px; height: 720px; background: %s; opacity: «K.%s»; pointer-events: none"></div>' % (SH, scrim)
    segx = CX + CW - 24 - 395 + 5.5 + 128 + 64
    rc = CY + 80 + 40 + 20
    C = dict(P=10, TS=5.2, S=[1140, 600], W=[[700, rc, 2.0], [1280 - 24 - 22, 42, 5.9], [segx, CY + 38, 7.4]], T=[[700, rc, 2.6], [1280 - 24 - 22, 42, 6.3], [segx, CY + 38, 7.8]])
    save('prop-3C-chat-a-pannello.dc.html', '3C - Chat a pannello', 1280, 720, page(R, '3C - Chat a pannello', 1280, 720, shell(R) + ghost_ + sec + scr_ + panel, C))

# ================================================================== telefono (direzione 3A)
def build_phone():
    R = Reg(); W_, H_ = 390, 844
    CX, CY, CW = 16, 64, 358
    RH = 88; r0 = 164
    h0 = r0 + 3 * RH + 52
    chat_html, chat_h = stack(R, 13, 3.4, .6, 270, 14, 20, 24)
    ph = chat_h + 40
    kh = [[2.6, h0], [3.2, h0 + ph], [6.6, h0 + ph], [7.3, h0]]
    hc = R.ch(kh); dy = R.ch([[t, v - h0 + 8 * (1 if v > h0 else 0)] for t, v in kh]); gy = R.ch([[t, v + CY + 16] for t, v in kh])
    pill = R.ch([[6.8, 5.5], [7.4, 5.5 + 106]])
    l1 = R.ch([[6.8, 1], [7.2, 0]]); l2 = R.ch([[6.9, 0], [7.4, 1]])
    hov = R.ch([[1.8, 0], [2.1, 1], [6.7, 1], [7.0, 0]])
    pv = R.ch([[2.6, 1], [3.0, 0], [6.7, 0], [7.0, 1]]); rot = R.ch([[2.6, 0], [3.1, 180], [6.7, 180], [7.1, 0]])
    pan = R.ch([[2.9, 0], [3.3, 1]], 'l')
    def row(cid, r, k, hov_ch=None, pv_ch=None, rot_ch=None):
        s = ''
        if hov_ch: s += '<div style="position: absolute; left: 6px; top: 2px; width: 334px; height: 84px; border-radius: 12px; background: %s; opacity: «K.%s»"></div>' % (RAISED, hov_ch)
        s += txt(16, 10, who(cid), 15, 800, INK) + '<div style="position: absolute; left: 130px; top: 11px; font-size: 13px; font-weight: 700; line-height: 18px; color: %s; white-space: nowrap">%s</div>' % (TER, esc(scr(cid)))
        s += ab(16, 10, 300, 20, 'text-align: right; font-size: 13px; font-weight: 700; line-height: 20px; color: %s; white-space: nowrap' % NM, esc(when(cid)))
        s += coach_user_lines(cid, 16, 36, 300, 13, 14, 24, ('opacity: «K.%s»;' % pv_ch) if pv_ch else '')
        s += ab(320, 38, 20, 20, ('transform: rotate(«K.%s»deg);' % rot_ch) if rot_ch else '', ic(CHD, 20, TER))
        if k < 2: s += ab(16, 86, 326, 1.5, 'background: %s' % NBR)
        return ab(0, r0 + r * RH, CW, RH, R.ent(.5 + .08 * r), s)
    def footer(n): return ab(0, r0 + 3 * RH, CW, 44, '', txt(16, 10, 'Altre %d' % n, 14, 800, NM) + ab(78, 14, 20, 20, '', ic(CHD, 18, NM)))
    ids1, ids2 = TABS[0][1], TABS[1][1]
    panel = ab(8, r0 + 2 * RH + 4, 342, ph - 8, 'box-sizing: border-box; border-radius: 14px; background: %s; border: 1.500px solid %s; padding: 16px; opacity: «K.%s»' % (SEGBG, NBR, pan), chat_html)
    below = row(ids1[2], 2, 2) + footer(len(ids1) - 3)
    L1 = ab(0, 0, CW, h0, 'opacity: «K.%s»' % l1, row(ids1[0], 0, 0) + row(ids1[1], 1, 1, hov, pv, rot) + panel + ab(0, 0, CW, h0, 'transform: translateY(«K.%s»px)' % dy, below))
    L2 = ab(0, 0, CW, h0, 'opacity: «K.%s»' % l2, ''.join(row(ids2[r], r, r) for r in range(3)) + footer(len(ids2) - 3))
    sg, sw = seg(R, 16, 60, 106, pill, fs=13)
    hdr = txt(16, 16, 'Conversazioni', 22, 800, INK) + sg + search(16, 112, 326)
    sec = card(CX, CY, CW, h0, hdr + L1 + L2, R, hc, R.ent(.2, 14))
    top = txt(16, 20, 'AI Coach', 22, 800, INK, None, R.ent(.1, 6)) + ab(338, 18, 36, 28, '', ic(MENU, 24, NM))
    ghost_ = '<div style="position: absolute; left: 16px; top: «K.%s»px; width: 358px; height: 160px; background: %s; border: 1.500px solid %s; border-radius: 14px; box-sizing: border-box; opacity: .55">%s</div>' % (gy, CARD, NBR, ab(16, 24, 140, 16, 'border-radius: 8px; background: %s' % NBR) + ab(16, 64, 240, 12, 'border-radius: 6px; background: %s; opacity: .6' % NBR))
    rowc = CY + r0 + RH + 44
    C = dict(P=10, TS=5.0, S=[300, 700], W=[], T=[[200, rowc, 2.5], [CX + 16 + 5.5 + 106 + 53, CY + 60 + 22, 6.9]])
    save('prop-3-telefono.dc.html', '3 - Telefono', W_, H_, page(R, '3 - Telefono', W_, H_, top + ghost_ + sec, C, pointer=False))

build_3a(); build_3b(); build_3c(); build_phone()
print(len(BOARDS), 'tavole')
