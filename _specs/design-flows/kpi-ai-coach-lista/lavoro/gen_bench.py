# Tre direzioni per il grafico dei benchmark del coach: «Com'è andato ogni giro?».
# Si lancia dalla cartella che contiene project/ e dati.json:  python3 gen_bench.py
import json, math, os
HERE = os.path.dirname(os.path.abspath(__file__))
os.makedirs(HERE + '/project', exist_ok=True)
DATI = json.load(open(HERE + '/dati.json'))
PAS = DATI['benchmark']['passaggi']; ESI = DATI['benchmark_esiti_per_caso']
BG, CARD, NEST, BRD, INK, SEC, TER, GRID = '#0f1115', '#1a1d24', '#14171d', '#2a2e37', '#ffffff', '#9ca3af', '#6f7683', '#23272f'
BLU, BLU2, ORA, GRN, RED, SEL, SH = '#4361ee', '#8da2ff', '#fb8b04', '#4ade80', '#f87171', '#262d45', '#050608'
MIS = [p for p in PAS if p['giri']]; NON = [p for p in PAS if not p['giri']]
mancano = lambda g, c: max(0, math.ceil(c * 99 / 100) - g)
R1 = lambda x: round(x, 1)

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
    const D = {}, S = {}, F = {}, K = {}, N = {};
    C.dots.forEach((d) => { D[d.id] = { r: f(d.r * pop(p(d.t, 0.45)), 2) }; });
    C.segs.forEach((s) => { const k = p(s.t, 0.16); S[s.id] = { x: f(s.x1 + (s.x2 - s.x1) * k, 1), y: f(s.y1 + (s.y2 - s.y1) * k, 1), o: k > 0 ? 1 : 0 }; });
    C.fades.forEach((e) => { const k = out(p(e.t, e.d || 0.5)); F[e.id] = { o: f(k), tf: 'translateY(' + f(10 * (1 - k), 1) + 'px)' }; });
    C.clips.forEach((c) => { K[c.id] = f(c.w * out(p(c.t, c.d || 0.5)), 1) + 'px'; });
    C.cnt.forEach((c) => { let i = -1; c.ts.forEach((x, j) => { if (t >= x) i = j; }); N[c.id] = i < 0 ? c.none : c.vals[i]; });
    let hh = C.H[0], ho = 0;
    C.H.forEach((h) => { if (t >= h.t0 - 0.3) hh = h; ho = Math.max(ho, Math.min(p(h.t0, 0.15), 1 - p(h.t1, 0.15))); });
    const hv = { o: f(ho) };
    Object.keys(hh).forEach((k) => { if (typeof hh[k] === 'number' && k !== 't0' && k !== 't1') hv[k] = f(hh[k], 1); });
    const tip = { x: f(hh.tx, 1) + 'px', y: f(hh.ty, 1) + 'px', o: f(ho), t: hh.txt };
    let px = C.S[0], py = C.S[1], lx = px, ly = py;
    C.W.forEach((w) => { const g = inout(p(w[2] - 0.9, 0.9)); px += (w[0] - lx) * g; py += (w[1] - ly) * g; lx = w[0]; ly = w[1]; });
    return {
      veil: f(Math.max(1 - p(0, 0.2), p(P - 0.3, 0.3))), D, S, F, K, N, hv, tip,
      pt: { x: f(px, 1) + 'px', y: f(py, 1) + 'px' }
    };
  }
}'''

def tx(x, y, s, size=14, w=700, col=SEC, extra='', lh=None):
    lh = lh or round(size * 1.3)
    return '<div style="position: absolute; left: %spx; top: %spx; font-size: %spx; font-weight: %s; line-height: %spx; color: %s; white-space: nowrap; %s">%s</div>' % (x, y, size, w, lh, col, extra, s)
def st(x, y, s, size=12, w=700, col=SEC, anchor='start'):
    return '<text x="%s" y="%s" font-size="%s" font-weight="%s" text-anchor="%s" fill="%s">%s</text>' % (R1(x), R1(y), size, w, anchor, col, s)
def fade(i, inner):  # gruppo HTML a pagina intera che entra con F.<i>
    return '<div style="position: absolute; left: 0; top: 0; width: 1280px; height: 720px; opacity: «F.%s.o»; transform: «F.%s.tf»">%s</div>' % (i, i, inner)
def svg(inner, op=None):
    return '<svg width="1280" height="720" style="position: absolute; left: 0; top: 0%s" aria-hidden="true">%s</svg>' % ('; opacity: «F.%s.o»' % op if op else '', inner)
def hhmm(q): return q[-5:]

RAIL_ICONS = ['<rect x="3" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="3" width="7" height="7" rx="1.5"></rect><rect x="3" y="14" width="7" height="7" rx="1.5"></rect><rect x="14" y="14" width="7" height="7" rx="1.5"></rect>',
              '<path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>',
              '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>',
              '<rect x="2" y="5" width="20" height="14" rx="2"></rect><path d="M2 10h20"></path>',
              '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle>']
def rail():
    s = '<div style="position: absolute; left: 0; top: 0; width: 64px; height: 720px; background: %s; border-right: 1.5px solid %s; box-sizing: border-box"></div>' % (NEST, BRD)
    for i, ic in enumerate(RAIL_ICONS):
        y = 40 + i * 56; act = i == 2
        if act: s += '<div style="position: absolute; left: 10px; top: %dpx; width: 44px; height: 44px; border-radius: 12px; background: %s"></div>' % (y - 10, SEL)
        s += '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%s" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; left: 20px; top: %dpx" aria-hidden="true">%s</svg>' % (BLU2 if act else TER, y, ic)
    return s

def frame(title, body, C, TS):
    base = dict(P=9.5, TS=TS, S=[1150, 640], W=[], dots=[], segs=[], fades=[], clips=[], cnt=[], H=[])
    base.update(C)
    card = '<div style="position: absolute; left: 88px; top: 32px; width: 1160px; height: 656px; background: %s; border: 1.5px solid %s; border-radius: 14px; box-shadow: 0 3px 0 %s; box-sizing: border-box"></div>' % (CARD, BRD, SH)
    head = tx(120, 52, "Com'è andato ogni giro?", 22, 800, INK, lh=28)
    tip = '<div style="position: absolute; left: «tip.x»; top: «tip.y»; opacity: «tip.o»; padding: 0 12px; height: 32px; box-sizing: border-box; border-radius: 16px; background: %s; border: 1.5px solid %s; box-shadow: 0 2px 0 %s; font-size: 13px; font-weight: 800; line-height: 29px; color: %s; white-space: nowrap; pointer-events: none">«tip.t»</div>' % (SEL, BLU, SH, INK)
    ptr = '<svg width="22" height="26" viewBox="0 0 22 26" style="position: absolute; left: «pt.x»; top: «pt.y»; display: block" aria-hidden="true"><path d="M2 2l16 12-7 1.5 4 8-3 1.5-4-8-6 4z" fill="#ffffff" stroke="#0f1115" stroke-width="1.5" stroke-linejoin="round"></path></svg>'
    veil = '<div style="position: absolute; left: 0; top: 0; width: 1280px; height: 720px; background: %s; opacity: «veil»; pointer-events: none"></div>' % BG
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
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@500;600;700;800&amp;display=swap">
<style>
body{margin:0;background:%s}
</style>
</helmet>
<div style="width: 1280px; height: 720px; position: relative; overflow: hidden; box-sizing: border-box; background: %s; color: %s; font-family: Nunito, system-ui, sans-serif">
%s
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":1280,"height":720}}'>
%s
</script>
</body>
</html>
''' % (title, BG, BG, INK, rail() + card + head + body + tip + ptr + veil, JS.replace('__C__', json.dumps(base, ensure_ascii=False)))
    return s.replace('«', '{{').replace('»', '}}')

def pills(y, h, clock):
    s = ''; fs = []
    for i, p in enumerate(NON):
        x = 120 + i * 278
        fid = 'u%d' % i; fs.append(dict(id=fid, t=clock + 0.15 * i))
        s += fade(fid, '<div style="position: absolute; left: %dpx; top: %dpx; width: 262px; height: %dpx; box-sizing: border-box; border-radius: 12px; border: 1.5px dashed %s"></div>' % (x, y, h, BRD)
            + tx(x + 16, y + 8, p['nome'], 14, 800, TER, lh=18) + tx(x + 16, y + 8 + 19, p['modello'], 12, 700, TER, lh=16)
            + tx(x + 246 - 80, y + h - 22 if h < 56 else y + 8 + 19, '', 1) )
        # «non misurato» a destra, sopra il modello
        s += fade(fid + 'b', tx(x + 16, y + 8 + 19, '', 1))
    return s, fs
# --- versione pulita di pills: nome + modello a sinistra, «non misurato» in basso a destra
def pills(y, h, clock):
    s = ''; fs = []
    for i, p in enumerate(NON):
        x = 120 + i * 278; fid = 'u%d' % i
        fs.append(dict(id=fid, t=clock + 0.15 * i))
        s += fade(fid, '<div style="position: absolute; left: %dpx; top: %dpx; width: 262px; height: %dpx; box-sizing: border-box; border-radius: 12px; border: 1.5px dashed %s"></div>' % (x, y, h, BRD)
                  + tx(x + 16, y + 7, p['nome'], 14, 800, TER, lh=18) + tx(x + 16, y + 26, p['modello'], 12, 700, TER, lh=16)
                  + tx(x + 246, y + h - 20, 'non misurato', 11, 700, TER, 'transform: translateX(-100%)', lh=14))
    return s, fs

# ============================================================ 1A  Giri in fila
def build_1A():
    BX, BW, BH, BY0, GAP = 120, 1096, 148, 100, 12
    X0, PITCH, XR = 500, 52, 1176
    ya = lambda by, v: by + 22 + 96 * (100 - v) / 40
    body = ''; dots = []; segs = []; fades = []; cnt = []; H = []
    starts = [0.9, 3.2, 4.2]; steps = [0.15, 0.2, 0.25]
    targets = {}
    for b, P in enumerate(MIS):
        by = BY0 + b * (BH + GAP); g = P['giri']; n = len(g); t0 = starts[b]; sp = steps[b]
        fades.append(dict(id='b%d' % b, t=0.25 + 0.15 * b))
        # riquadro e testi a sinistra
        html = '<div style="position: absolute; left: %dpx; top: %dpx; width: %dpx; height: %dpx; box-sizing: border-box; border-radius: 14px; background: %s; border: 1.5px solid %s"></div>' % (BX, by, BW, BH, NEST, BRD)
        html += tx(BX + 24, by + 14, P['nome'], 17, 800, INK, lh=22) + tx(BX + 24 + 8 + 9 * len(P['nome']) * 0 + {0: 138, 1: 134, 2: 138}[b], by + 17, P['modello'], 13, 700, TER, lh=18)
        html += ('<div style="position: absolute; left: %dpx; top: %dpx; white-space: nowrap; font-weight: 800; color: %s"><span style="font-size: 44px; line-height: 52px">«N.c%d.sc»</span><span style="font-size: 16px; color: %s"> su «N.c%d.ca»</span></div>' % (BX + 24, by + 40, INK, b, SEC, b))
        html += ('<div style="position: absolute; left: %dpx; top: %dpx; white-space: nowrap; font-weight: 800"><span style="font-size: 22px; color: %s">«N.c%d.gi»</span><span style="font-size: 14px; color: %s"> giri</span><span style="font-size: 22px; color: «N.c%d.mc»; margin-left: 28px">«N.c%d.mn»</span><span style="font-size: 14px; color: %s"> mancano</span></div>' % (BX + 24, by + 102, INK, b, SEC, b, b, SEC))
        # grafico
        sv = ''
        for v, lab in ((60, '60%'), (80, '80%'), (100, '100%')):
            y = ya(by, v)
            if v != 100: sv += '<line x1="%d" y1="%s" x2="%d" y2="%s" stroke="%s" stroke-width="1"></line>' % (X0 - 8, R1(y), XR, R1(y), BRD if v == 60 else GRID)
            sv += st(X0 - 16, y + 4, lab, 12, 700, SEC if v == 60 else TER, 'end')
        # asse tagliato: zig-zag sopra la base 60%
        yb = ya(by, 60)
        sv += '<path d="M%d %s l5 -4 l-10 -5 l10 -5 l-5 -4" fill="none" stroke="%s" stroke-width="1.5"></path>' % (X0 - 0, R1(yb - 2), SEC) if False else ''
        sv += '<line x1="%d" y1="%s" x2="%d" y2="%s" stroke="%s" stroke-width="1.5"></line>' % (X0 - 8, R1(ya(by, 100)), X0 - 8, R1(yb - 16), BRD)
        sv += '<path d="M%d %s l4 -3 l-8 -4 l8 -4 l-4 -3" fill="none" stroke="%s" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>' % (X0 - 8, R1(yb - 1), SEC)
        # soglia
        sv += '<line x1="%d" y1="%s" x2="%d" y2="%s" stroke="%s" stroke-width="2" stroke-dasharray="6 5"></line>' % (X0 - 8, R1(ya(by, 99)), XR + 4, R1(ya(by, 99)), ORA)
        sv += st(XR + 12, ya(by, 99) + 5, '99%', 13, 800, ORA)
        # etichette casi + segno del cambio 50 -> 100
        casi = [x['casi'] for x in g]
        sv += st(X0 + 6, by + 14, '%d casi' % casi[0], 11, 700, TER)
        for i in range(1, n):
            if casi[i] != casi[i - 1]:
                xm = X0 + (i - 0.5) * PITCH
                sv += '<line x1="%s" y1="%s" x2="%s" y2="%s" stroke="%s" stroke-width="1.5" stroke-dasharray="3 4"></line>' % (R1(xm), by + 8, R1(xm), R1(yb), TER)
                sv += st(xm + 6, by + 14, '%d casi' % casi[i], 11, 700, TER)
        # giri: numeri sull'asse X
        for i in range(n):
            sv += st(X0 + i * PITCH, by + 138, str(i + 1), 12, 800 if i == n - 1 else 700, INK if i == n - 1 else SEC, 'middle')
        # linee e punti
        pts = [(X0 + i * PITCH, ya(by, 100 * x['giusti'] / x['casi'])) for i, x in enumerate(g)]
        sg = ''; dt = ''; vals = []; ts = []
        for i, (x, y) in enumerate(pts):
            ti = t0 + i * sp
            if i:
                sid = 's%d_%d' % (b, i); segs.append(dict(id=sid, t=ti - 0.12, x1=R1(pts[i - 1][0]), y1=R1(pts[i - 1][1]), x2=R1(x), y2=R1(y)))
                sg += '<line x1="%s" y1="%s" x2="«S.%s.x»" y2="«S.%s.y»" opacity="«S.%s.o»" stroke="%s" stroke-width="2.5" stroke-linecap="round"></line>' % (R1(pts[i - 1][0]), R1(pts[i - 1][1]), sid, sid, sid, BLU2)
            last = i == n - 1; ok = g[i]['giusti'] * 100 >= 99 * g[i]['casi']
            did = 'd%d_%d' % (b, i); dots.append(dict(id=did, t=ti, r=7.5 if last else 5.5))
            dt += '<circle cx="%s" cy="%s" r="«D.%s.r»" fill="%s" stroke="%s" stroke-width="%s"></circle>' % (R1(x), R1(y), did, GRN if ok else BLU, INK if last else NEST, 2 if last else 2)
            c = g[i]; m = mancano(c['giusti'], c['casi'])
            ts.append(ti); vals.append(dict(sc=c['giusti'], ca=c['casi'], gi=i + 1, mn=m, mc=GRN if m == 0 else ORA))
            targets[(b, i)] = (x, y, c, hhmm(c['quando']))
        cnt.append(dict(id='c%d' % b, ts=ts, vals=vals, none=dict(sc='–', ca='–', gi='–', mn='–', mc=SEC)))
        body += fade('b%d' % b, html) + svg(sv + sg + dt, 'b%d' % b)
    # non misurati
    prow, pf = pills(BY0 + 3 * (BH + GAP) + 8, 64, 0.9)
    fades += pf
    body += prow
    # passaggi del mouse
    def hov(b, i, t0, t1, up):
        x, y, c, hm = targets[(b, i)]
        return dict(t0=t0, t1=t1, x=R1(x), y=R1(y), tx=R1(x - 150 if up else x + 16), ty=R1(y + 20 if up else y + 14), txt='Giro %d · %s · %d su %d' % (i + 1, hm, c['giusti'], c['casi']))
    H = [hov(0, 11, 5.4, 7.0, True), hov(2, 1, 7.3, 8.6, False)]
    body += svg('<circle cx="«hv.x»" cy="«hv.y»" r="13" fill="none" stroke="%s" stroke-width="2" opacity="«hv.o»"></circle>' % BLU2)
    W = [[H[0]['x'] + 3, H[0]['y'] + 3, 5.4], [H[1]['x'] + 3, H[1]['y'] + 3, 7.3]]
    return frame('1A - Giri in fila', body, dict(dots=dots, segs=segs, fades=fades, cnt=cnt, H=H, W=W), 6.4), None

# ============================================================ 1B  Caso per caso
def build_1B():
    X0, CWD, PX, RP = 184, 7, 9, 16
    body = ''; fades = []; clips = []; cnt = []; H = []
    starts = [0.7, 3.0, 4.0]; steps = [0.15, 0.2, 0.25]
    y0s = [96, 384, 512]
    tgt = {}
    # legenda
    lg = ('<svg width="400" height="30" style="position: absolute; left: 816px; top: 54px" aria-hidden="true">'
          '<rect x="0" y="12" width="7" height="7" rx="2" fill="%s"></rect>' % GRN + st(16, 20, 'giusto', 13, 700, SEC)
          + '<rect x="100" y="6" width="7" height="13" rx="2" fill="%s"></rect>' % RED + st(116, 20, 'sbagliato', 13, 700, SEC)
          + '<rect x="224" y="12" width="7" height="7" rx="2" fill="none" stroke="%s" stroke-width="1.5"></rect>' % TER + st(240, 20, "non c'era", 13, 700, SEC) + '</svg>')
    fades.append(dict(id='lg', t=0.3)); body += fade('lg', lg)
    for b, P in enumerate(MIS):
        y0 = y0s[b]; g = P['giri']; n = len(g); es = ESI[P['id']]
        nmax = max(x['casi'] for x in g)
        fades.append(dict(id='h%d' % b, t=0.35 + 0.1 * b))
        hd = tx(120, y0, P['nome'], 17, 800, INK, lh=24) + tx(120 + {0: 140, 1: 136, 2: 140}[b], y0 + 3, P['modello'], 13, 700, TER, lh=18)
        hd += '<div style="position: absolute; left: 1216px; top: %dpx; transform: translateX(-100%%); white-space: nowrap; font-size: 20px; font-weight: 800; line-height: 24px; color: %s">«N.c%d.sc» su «N.c%d.ca»</div>' % (y0, INK, b, b)
        rl = ''
        for j, lab, an in ((1, 'caso 1', 'start'), (50, '50', 'middle'), (nmax, str(nmax), 'end')):
            xx = X0 + (j - 1) * PX + CWD / 2
            if an == 'start': xx = X0
            if an == 'end': xx = X0 + (j - 1) * PX + CWD
            rl += st(xx, y0 + 38, lab, 11, 700, TER, an)
        body += fade('h%d' % b, hd) + svg(rl, 'h%d' % b)
        # banda di evidenziazione (sotto le caselle)
        ytop = y0 + 46
        if b == 0: band_here = True
        ts = []; vals = []
        for i, x in enumerate(g):
            ry = ytop + i * RP; cy = ry + RP / 2; ti = starts[b] + i * steps[b]
            cells = ''
            for j in range(nmax):
                cx = X0 + j * PX
                if j < x['casi']:
                    if es[i]['esiti'][j] == 'g': cells += '<rect x="%d" y="%s" width="%d" height="7" rx="2" fill="%s"></rect>' % (cx - X0, R1(cy - 3.5 - ry + 0), CWD, GRN)
                    else: cells += '<rect x="%d" y="%s" width="%d" height="13" rx="2" fill="%s"></rect>' % (cx - X0, R1(cy - 6.5 - ry), CWD, RED)
                else: cells += '<rect x="%s" y="%s" width="%s" height="7" rx="2" fill="none" stroke="%s" stroke-width="1"></rect>' % (cx - X0 + 0.5, R1(cy - 3 - ry), CWD - 1, BRD)
            rid = 'r%d_%d' % (b, i); clips.append(dict(id=rid, t=ti, w=nmax * PX, d=0.55)); fades.append(dict(id=rid, t=ti, d=0.3))
            body += '<div style="position: absolute; left: %dpx; top: %dpx; width: «K.%s»; height: %dpx; overflow: hidden"><svg width="%d" height="%d" style="display: block" aria-hidden="true">%s</svg></div>' % (X0, ry, rid, RP, nmax * PX, RP, cells)
            last = i == n - 1
            body += '<div style="position: absolute; left: 0; top: 0; width: 1280px; height: 720px; opacity: «F.%s.o»">%s%s</div>' % (rid, tx(120, ry, 'Giro %d' % (i + 1), 12, 800 if last else 700, INK if last else TER, lh=RP),
                '<div style="position: absolute; left: 1216px; top: %dpx; transform: translateX(-100%%); white-space: nowrap; font-size: %dpx; font-weight: %d; line-height: %dpx; color: %s">%d su %d</div>' % (ry, 14 if last else 12, 800 if last else 700, RP, INK if last else SEC, x['giusti'], x['casi']))
            ts.append(ti + 0.4); vals.append(dict(sc=x['giusti'], ca=x['casi']))
        cnt.append(dict(id='c%d' % b, ts=ts, vals=vals, none=dict(sc='–', ca='–')))
        tgt[b] = (ytop, n)
    # banda + passaggio del mouse (la banda va sotto le caselle: la metto in un svg messo PRIMA delle righe dell'ultima sezione)
    def hov(b, j, t0, t1, i, txt):
        ytop, n = tgt[b]
        cx = X0 + j * PX + CWD / 2; cy = ytop + i * RP + RP / 2
        return dict(t0=t0, t1=t1, x=R1(cx), y=R1(cy), bx=R1(X0 + j * PX - 1), by=ytop - 2, bh=n * RP + 4, tx=R1(cx + 18), ty=R1(cy - 40 if b == 0 else cy - 40), txt=txt)
    H = [hov(0, 13, 5.4, 7.0, 13, 'caso 14'), hov(2, 0, 7.3, 8.6, 1, 'caso 1')]
    band = svg('<rect x="«hv.bx»" y="«hv.by»" width="9" height="«hv.bh»" rx="3" fill="%s" opacity="«hv.o»"></rect><rect x="«hv.bx»" y="«hv.by»" width="9" height="«hv.bh»" rx="3" fill="none" stroke="%s" stroke-width="1.5" opacity="«hv.o»"></rect>' % (SEL, BLU))
    # le righe sono già nel body: la banda va davanti con trasparenza ridotta, quindi la disegno solo come contorno
    band = svg('<rect x="«hv.bx»" y="«hv.by»" width="9" height="«hv.bh»" rx="4" fill="none" stroke="%s" stroke-width="2" opacity="«hv.o»"></rect>' % BLU2)
    body += band
    prow, pf = pills(606, 48, 5.0); fades += pf; body += prow
    W = [[H[0]['x'] + 3, H[0]['y'] + 3, 5.4], [H[1]['x'] + 3, H[1]['y'] + 3, 7.3]]
    return frame('1B - Caso per caso', body, dict(fades=fades, clips=clips, cnt=cnt, H=H, W=W), 6.4), None

# ============================================================ 1C  Lungo il flusso
def build_1C():
    PL, PR, PT, PB = 176, 1180, 176, 520
    CW = (PR - PL) / 7.0
    ya = lambda v: PT + (PB - PT) * (100 - v) / 40.0
    STEP = 7.5
    body = ''; dots = []; segs = []; fades = []; clips = []; H = []
    starts = {'categorie': 1.1, 'strumenti': 3.3, 'form': 4.3}; steps = {'categorie': 0.15, 'strumenti': 0.2, 'form': 0.25}
    tgt = {}
    cx_of = lambda k: PL + (k + 0.5) * CW
    sv = ''
    # fasce delle colonne
    for k, P in enumerate(PAS):
        x = cx_of(k) - CW / 2 + 6
        if P['giri']: sv += '<rect x="%s" y="%d" width="%s" height="%d" rx="12" fill="%s"></rect>' % (R1(x), PT - 22, R1(CW - 12), PB - PT + 44, NEST)
        else: sv += '<rect x="%s" y="%d" width="%s" height="%d" rx="12" fill="none" stroke="%s" stroke-width="1.5" stroke-dasharray="6 6"></rect>' % (R1(x), PT - 22, R1(CW - 12), PB - PT + 44, BRD)
    for v in (60, 70, 80, 90):
        sv += '<line x1="%d" y1="%s" x2="%d" y2="%s" stroke="%s" stroke-width="1"></line>' % (PL - 8, R1(ya(v)), PR, R1(ya(v)), BRD if v == 60 else GRID)
    for v in (60, 70, 80, 90, 100):
        sv += st(PL - 16, ya(v) + 4, '%d%%' % v, 12, 700, SEC if v in (60, 100) else TER, 'end')
    sv += '<line x1="%d" y1="%s" x2="%d" y2="%s" stroke="%s" stroke-width="1.5"></line>' % (PL - 8, R1(ya(100)), PL - 8, R1(ya(60) - 22), BRD)
    sv += '<path d="M%d %s l4 -3 l-8 -4 l8 -4 l-4 -3" fill="none" stroke="%s" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>' % (PL - 8, R1(ya(60) - 1), SEC)
    # rotaia del flusso
    ry = 112
    sv += '<line x1="%s" y1="%d" x2="%s" y2="%d" stroke="%s" stroke-width="1.5"></line>' % (R1(cx_of(0)), ry, R1(cx_of(6)), ry, TER)
    for k, P in enumerate(PAS):
        ok = bool(P['giri'])
        sv += '<circle cx="%s" cy="%d" r="13" fill="%s" stroke="%s" stroke-width="1.5"></circle>' % (R1(cx_of(k)), ry, SEL if ok else CARD, BLU if ok else BRD) + st(cx_of(k), ry + 4.5, str(k + 1), 13, 800, INK if ok else TER, 'middle')
    fades.append(dict(id='bg', t=0.25)); body += svg(sv, 'bg')
    # testi sotto le colonne
    for k, P in enumerate(PAS):
        cx = cx_of(k); fid = 'n%d' % k; fades.append(dict(id=fid, t=0.4 + 0.08 * k))
        w = int(CW - 16); x = R1(cx - w / 2)
        g = P['giri']; col = INK if g else TER
        h = tx(x, PB + 30, P['nome'], 14, 800, col, 'width: %dpx; text-align: center; white-space: normal' % w, lh=18)
        h += tx(x, PB + 70, P['modello'], 12, 700, TER, 'width: %dpx; text-align: center; white-space: normal' % w, lh=15)
        if g: h += '<div style="position: absolute; left: %spx; top: %dpx; width: %dpx; text-align: center; white-space: nowrap; font-size: 16px; font-weight: 800; line-height: 22px; color: %s">«N.c%d.sc» su «N.c%d.ca»</div>' % (x, PB + 104, w, INK, k, k)
        else: h += tx(x, PB + 104, 'non misurato', 13, 700, TER, 'width: %dpx; text-align: center' % w, lh=22)
        body += fade(fid, h)
    # soglia: si disegna da sinistra a destra
    clips.append(dict(id='so', t=0.5, w=PR - PL + 64, d=0.9))
    body += ('<div style="position: absolute; left: %d px; top: 0; width: «K.so»; height: 720px; overflow: hidden">'.replace(' px', 'px') % (PL - 8)) \
            + '<svg width="%d" height="720" style="display: block" aria-hidden="true"><line x1="0" y1="%s" x2="%d" y2="%s" stroke="%s" stroke-width="2" stroke-dasharray="6 5"></line>%s</svg></div>' % (PR - PL + 64, R1(ya(99)), PR - PL + 8, R1(ya(99)), ORA, st(PR - PL + 16, ya(99) + 5, '99%', 13, 800, ORA))
    # giri
    cnts = []
    for k, P in enumerate(PAS):
        g = P['giri']
        if not g: continue
        n = len(g); sx = cx_of(k) - CW / 2 + 22
        pts = [(sx + i * STEP, ya(100 * x['giusti'] / x['casi'])) for i, x in enumerate(g)]
        sg = ''; dt = ''; ts = []; vals = []
        for i, (x, y) in enumerate(pts):
            ti = starts[P['id']] + i * steps[P['id']]
            if i:
                sid = 's%d_%d' % (k, i); segs.append(dict(id=sid, t=ti - 0.12, x1=R1(pts[i - 1][0]), y1=R1(pts[i - 1][1]), x2=R1(x), y2=R1(y)))
                sg += '<line x1="%s" y1="%s" x2="«S.%s.x»" y2="«S.%s.y»" opacity="«S.%s.o»" stroke="%s" stroke-width="2" stroke-linecap="round"></line>' % (R1(pts[i - 1][0]), R1(pts[i - 1][1]), sid, sid, sid, BLU2)
            last = i == n - 1; c = g[i]; ok = c['giusti'] * 100 >= 99 * c['casi']
            did = 'd%d_%d' % (k, i); dots.append(dict(id=did, t=ti, r=8 if last else 4))
            dt += '<circle cx="%s" cy="%s" r="«D.%s.r»" fill="%s" stroke="%s" stroke-width="%s"></circle>' % (R1(x), R1(y), did, GRN if ok else BLU, INK if last else NEST, 2)
            ts.append(ti + 0.1); vals.append(dict(sc=c['giusti'], ca=c['casi']))
            tgt[(k, i)] = (x, y, c, hhmm(c['quando']))
        cnt_id = 'c%d' % k; cnts.append(dict(id=cnt_id, ts=ts, vals=vals, none=dict(sc='–', ca='–')))
        lx, ly, lc, _ = tgt[(k, n - 1)]
        fades.append(dict(id='L%d' % k, t=starts[P['id']] + (n - 1) * steps[P['id']] + 0.2, d=0.4))
        lab = st(lx + 15, ly + 6, str(lc['giusti']), 17, 800, GRN if lc['giusti'] * 100 >= 99 * lc['casi'] else INK)
        # segno del cambio 50 -> 100 casi
        mk = ''
        for i in range(1, n):
            if g[i]['casi'] != g[i - 1]['casi']:
                xm = sx + (i - 0.5) * STEP
                mk += '<line x1="%s" y1="%d" x2="%s" y2="%d" stroke="%s" stroke-width="1.5" stroke-dasharray="3 4"></line>' % (R1(xm), PT + 22, R1(xm), PB + 12, TER)
                mk += st(xm - 5, PB + 14, '%d casi' % g[i - 1]['casi'], 11, 700, TER, 'end') + st(xm + 5, PB + 14, '%d' % g[i]['casi'], 11, 700, TER)
        fades.append(dict(id='m%d' % k, t=starts[P['id']] + 0.2))
        body += svg(mk, 'm%d' % k) + svg(sg + dt) + svg(lab, 'L%d' % k)
    cnt = cnts
    def hov(k, i, t0, t1, up):
        x, y, c, hm = tgt[(k, i)]
        return dict(t0=t0, t1=t1, x=R1(x), y=R1(y), tx=R1(x - 100 if k == 1 else x + 16), ty=R1(y + 120 if k == 1 else (y - 46 if up else y + 18)), txt='Giro %d · %s · %d su %d' % (i + 1, hm, c['giusti'], c['casi']))
    H = [hov(0, 11, 5.4, 7.0, False), hov(1, 0, 7.3, 8.6, False)]
    body += svg('<circle cx="«hv.x»" cy="«hv.y»" r="13" fill="none" stroke="%s" stroke-width="2" opacity="«hv.o»"></circle>' % BLU2)
    W = [[H[0]['x'] + 3, H[0]['y'] + 3, 5.4], [H[1]['x'] + 3, H[1]['y'] + 3, 7.3]]
    return frame('1C - Lungo il flusso', body, dict(dots=dots, segs=segs, fades=fades, clips=clips, cnt=cnt, H=H, W=W, S=[1100, 640]), 6.4), None

for fn, build in (('prop-1A-giri-in-fila.dc.html', build_1A), ('prop-1B-caso-per-caso.dc.html', build_1B), ('prop-1C-lungo-il-flusso.dc.html', build_1C)):
    html, _ = build()
    open(HERE + '/project/' + fn, 'w').write(html)
    print('scritto', fn, len(html) // 1024, 'KB')
