#!/usr/bin/env python3
# Redesign «finestra stretta» (390x844) della pagina AI Coach: pagina 2A in colonna + benchmark 1C a righe + conversazioni 3A.
# Importa i mattoni di gen_pagina.py (non li modifica). Scrive in WD/project/red-7-finestra-stretta.dc.html.
import sys, math, html as _h
WD = '/home/d4nd0n/Dev/HypeMove/www/_specs/design-flows/kpi-ai-coach/lavoro'
sys.path.insert(0, WD)
import gen_pagina as gp          # al suo import fa chdir(WD)
from gen_pagina import (Cfg, TX, box, ewrap, timecard, percard, BM, bmstate, DATI,
                        BG, CARD, BRD, SH, INK, SEC, TER, BLU, LB, ORG, GRN, SEL, INN)

# ---- JS: aggiungo il canale OP (apertura della chat, 0..1) all'impalcatura di gen_pagina
gp.JS = gp.JS.replace('    return {\n      veil:', "    const OP = {}; (C.OPN || []).forEach((a, i) => { OP['k' + i] = f(live ? inout(p(a[0], a[1])) : 0); });\n    return {\n      OP,\n      veil:")
assert 'OP,' in gp.JS

W_, H_ = 390, 844
CW = 358; X0 = 16
esc = lambda s: _h.escape(s, quote=False)

# ---------------------------------------------------------------- icone a tratto
def ic(d, sz=20, col=SEC, sw=2, st=''):
    return '<svg width="%s" height="%s" viewBox="0 0 24 24" fill="none" stroke="%s" stroke-width="%s" stroke-linecap="round" stroke-linejoin="round" style="display: block; flex: none; %s" aria-hidden="true">%s</svg>' % (sz, sz, col, sw, st, d)
SPARK = '<path d="M11 3l1.900 5.100L18 10l-5.100 1.900L11 17l-1.900-5.100L4 10l5.100-1.900z"></path><path d="M19 15v5M16.500 17.500h5"></path>'
ARW = '<path d="M5 5v6a3 3 0 0 0 3 3h11"></path><path d="M15 10l4 4-4 4"></path>'
CHD = '<path d="M6 9l6 6 6-6"></path>'
MENU = '<path d="M4 7h16M4 12h16M4 17h16"></path>'
ELL = 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0;'
def ab(x, y, w, h, st, inner=''):
    g = 'position: absolute; left: %spx; top: %spx; ' % (x, y)
    if w is not None: g += 'width: %spx; ' % w
    if h is not None: g += 'height: %spx; ' % h
    return '<div style="%s%s">%s</div>' % (g, st, inner)

# ---------------------------------------------------------------- benchmark: sette righe, una per passaggio
def spark(cfg, pi, w, h, tdraw):
    """Linea dei giri, scala 60-100% con taglio dichiarato, soglia arancione 99%."""
    p = BM[pi]; giri = p['giri']; n = len(giri)
    gut = 26; pw = w - gut - 22
    y = lambda v: 6 + (h - 12) * (100.0 - v) / 40.0
    step = pw / 13.0
    s = '<line x1="%d" x2="%d" y1="%.1f" y2="%.1f" stroke="%s" stroke-width="1"></line>' % (gut, w, y(60), y(60), BRD)
    s += '<line x1="%d" x2="%d" y1="%.1f" y2="%.1f" stroke="%s" stroke-width="1.500" stroke-dasharray="4 3"></line>' % (gut, w, y(99), y(99), ORG)
    s += '<text x="0" y="%.1f" font-size="11" font-weight="700" fill="%s">100</text><text x="0" y="%.1f" font-size="11" font-weight="700" fill="%s">60</text>' % (y(100) + 8, TER, y(60) + 4, TER)
    s += '<path d="M%d %.1f l3 -3 l-6 -4 l6 -4" fill="none" stroke="%s" stroke-width="1.500" stroke-linecap="round" stroke-linejoin="round"></path>' % (gut - 1, y(60) - 1, SEC)
    pts = [(gut + 6 + i * step, y(100.0 * g['giusti'] / g['casi'])) for i, g in enumerate(giri)]
    if n > 1: s += '<polyline points="%s" fill="none" stroke="%s" stroke-width="1.500" stroke-linejoin="round" stroke-linecap="round"></polyline>' % (' '.join('%.1f,%.1f' % q for q in pts), LB)
    for i, (g, q) in enumerate(zip(giri, pts)):
        last = i == n - 1; ok = g['giusti'] * 100 >= 99 * g['casi']
        if last: s += '<circle cx="%.1f" cy="%.1f" r="5.500" fill="%s" stroke="#ffffff" stroke-width="1.500"></circle>' % (q[0], q[1], GRN if ok else BLU)
        else: s += '<circle cx="%.1f" cy="%.1f" r="2.500" fill="%s"></circle>' % (q[0], q[1], LB)
    nm = cfg.rv('s%d' % pi, tdraw, 1.1, w)
    return '<div style="position: absolute; left: 0; top: 0; width: «R.%s»; height: %dpx; overflow: hidden"><svg width="%d" height="%d" style="display: block; overflow: visible" aria-hidden="true">%s</svg></div>' % (nm, h, w, h, s)

def num_circle(x, y, k, on):
    return ab(x, y, 28, 28, 'box-sizing: border-box; border-radius: 14px; background: %s; border: 1.500px solid %s; text-align: center; line-height: 25px; font-size: 14px; font-weight: 800; color: %s' % (SEL if on else CARD, BLU if on else BRD, INK if on else TER), str(k))

def bench_card(cfg, y, e):
    inner = TX(20, 16, 'Benchmark', 20, 800, INK)
    inner += '<svg width="26" height="12" style="position: absolute; left: %dpx; top: 24px" aria-hidden="true"><line x1="2" y1="6" x2="24" y2="6" stroke="%s" stroke-width="2.500" stroke-linecap="round" stroke-dasharray="5 3"></line></svg>' % (CW - 20 - 66, ORG) + TX(CW - 20 - 36, 20, '99%', 14, 800, ORG)
    yy = 56
    for i, p in enumerate(BM):
        if p['giri']:
            gi, ca = bmstate(p); ok = gi * 100 >= 99 * ca
            inner += ab(10, yy, CW - 23, 84, 'box-sizing: border-box; border-radius: 12px; background: %s; border: 1.500px solid %s' % (INN, BRD))
            inner += num_circle(20, yy + 12, i + 1, True)
            inner += TX(58, yy + 8, p['nome'], 15, 800, INK) + TX(58, yy + 28, p['modello'], 12, 700, SEC)
            inner += '<div style="position: absolute; left: 58px; top: %dpx; white-space: nowrap"><span style="font-size: 22px; font-weight: 800; line-height: 28px; color: %s">%d</span><span style="font-size: 13px; font-weight: 700; color: %s"> su %d</span></div>' % (yy + 46, GRN if ok else INK, gi, SEC, ca)
            inner += ab(CW - 20 - 148 - 6, yy + 14, 148, 56, '', spark(cfg, i, 148, 56, 0.9 + 0.3 * i))
            yy += 92
        else:
            inner += ab(10, yy, CW - 23, 52, 'box-sizing: border-box; border-radius: 12px; border: 1.500px dashed %s' % BRD)
            inner += num_circle(20, yy + 12, i + 1, False)
            inner += TX(58, yy + 7, p['nome'], 14, 800, TER) + TX(58, yy + 27, p['modello'], 12, 700, TER)
            inner += ab(0, yy + 17, CW - 28, 18, 'text-align: right; font-size: 13px; font-weight: 700; line-height: 18px; color: %s; white-space: nowrap' % TER, 'non misurato')
            yy += 60
    hh = yy + 8
    return box(X0, y, CW, hh, inner, e), hh

# ---------------------------------------------------------------- selettore a quattro segmenti, 358 px, tocco 44
SEGN = ['Oggi', 'Settimana', 'Mese', 'Sprint']; SW = (CW - 9) / 4.0
def selector(cfg, y):
    cfg.d['SGX'] = [round(3 + SW * 2, 2), round(3 + SW * 1, 2)]
    s = '<div style="position: absolute; left: «SG.x»; top: 3px; width: %.2fpx; height: 35px; border-radius: 50px; background: %s; box-shadow: 0 2px 0 %s"></div>' % (SW, BLU, SH)
    for i, n in enumerate(SEGN):
        base = 'position: absolute; left: %.2fpx; top: 3px; width: %.2fpx; height: 35px; line-height: 35px; text-align: center; font-size: 14px; font-weight: 700; white-space: nowrap;' % (3 + SW * i, SW)
        if i == 2: s += '<div style="%s color: %s; opacity: «SG.w»">%s</div><div style="%s color: #ffffff; opacity: «SG.m»">%s</div>' % (base, SEC, n, base, n)
        elif i == 1: s += '<div style="%s color: %s; opacity: «SG.m»">%s</div><div style="%s color: #ffffff; opacity: «SG.w»">%s</div>' % (base, SEC, n, base, n)
        else: s += '<div style="%s color: %s">%s</div>' % (base, SEC, n)
    return '<div style="position: absolute; left: %dpx; top: %dpx; width: %dpx; height: 44px; box-sizing: border-box; border-radius: 50px; background: %s; border: 1.500px solid %s">%s</div>' % (X0, y, CW, BG, BRD, s)

# ---------------------------------------------------------------- conversazioni
META = {18: ('Utente 1873', '08/10 · 21:42'), 13: ('Utente 0412', '08/10 · 20:15'), 6: ('Utente 2290', '07/10 · 22:08'),
        2: ('Utente 0731', '06/10 · 21:30'), 1: ('Utente 3056', '04/10 · 20:47'), 15: ('Utente 1124', '02/10 · 22:20')}
IDS = [18, 13, 6, 2, 1, 15]
TABS = ['Spontanee', 'Post-workout', 'Primo workout']
CHAT = {c['id']: c for c in DATI['chat_vere_senza_nomi']}
def first(i, chi):
    for t in CHAT[i]['chat']:
        if t['chi'] == chi: return t['testo']
    return None
def est_lines(t, maxw, fs): return max(1, math.ceil(len(t) / max(8, int((maxw - 32) / (fs * 0.5)))))

def conv_row(cid, r, ry, hov=False, pv_style='', rot_style='', sep=True):
    s = ''
    if hov: s += '<div style="position: absolute; left: 6px; top: 2px; width: 334px; height: calc(84px - «OP.k0» * 44px); border-radius: 12px; background: %s; opacity: «O.hrow.o»"></div>' % INN
    s += TX(16, 10, META[cid][0], 15, 800, INK)
    s += ab(16, 10, 300, 20, 'text-align: right; font-size: 13px; font-weight: 700; line-height: 20px; color: %s; white-space: nowrap' % SEC, META[cid][1])
    c, u = first(cid, 'coach'), first(cid, 'utente')
    c1 = esc(c) if c else 'Nessun messaggio'; cc = SEC if c else TER
    l1 = '<div style="display: flex; align-items: center; gap: 8px; width: 300px">%s<div style="%s font-size: 13px; font-weight: 700; color: %s">%s</div></div>' % (ic(SPARK, 18, LB), ELL, cc, c1)
    l2 = '<div style="display: flex; align-items: center; gap: 8px; width: 300px">%s<div style="%s font-size: 14px; font-weight: 800; color: %s">%s</div></div>' % (ic(ARW, 18, TER), ELL, INK, esc(u))
    s += ab(16, 36, 300, 20, pv_style, l1) + ab(16, 60, 300, 20, pv_style, l2)
    s += ab(320, 10, 20, 20, rot_style, ic(CHD, 20, TER))
    if sep: s += ab(16, 86, 326, 1.5, 'background: %s' % BRD)
    return ab(0, ry, CW, 88, '', s)

def chat_panel(cfg, cid, t0, step):
    """Fumetti a tutta larghezza, parte dal coach. Restituisce (html, altezza stimata)."""
    items = list(CHAT[cid]['chat'])
    assert items[0]['chi'] == 'coach'
    out = []; tot = 0; fs, lh = 14, 20; cmax, umax = 276, 300
    for i, it in enumerate(items):
        e = cfg.en(t0 + i * step)
        en = 'opacity: «E.%s.o»; transform: «E.%s.tf»;' % (e, e)
        if it['chi'] == 'coach':
            n = est_lines(it['testo'], cmax, fs)
            b = '<div style="box-sizing: border-box; max-width: %dpx; padding: 9px 14px; border-radius: 18px 18px 18px 6px; background: %s; border: 1.500px solid %s; font-size: %dpx; font-weight: 700; line-height: %dpx; color: %s">%s</div>' % (cmax, '#20242d', BRD, fs, lh, INK, esc(it['testo']))
            av = '<div style="width: 24px; height: 24px; border-radius: 12px; background: %s; display: flex; align-items: center; justify-content: center; flex: none">%s</div>' % (SEL, ic(SPARK, 15, LB, 2))
            out.append('<div style="display: flex; align-items: flex-end; gap: 8px; %s">%s%s</div>' % (en, av, b))
        else:
            n = est_lines(it['testo'], umax, fs)
            b = '<div style="box-sizing: border-box; max-width: %dpx; padding: 9px 14px; border-radius: 18px 18px 6px 18px; background: %s; border: 1.500px solid %s; font-size: %dpx; font-weight: 700; line-height: %dpx; color: %s">%s</div>' % (umax, BLU, BLU, fs, lh, INK, esc(it['testo']))
            out.append('<div style="display: flex; justify-content: flex-end; %s">%s</div>' % (en, b))
        tot += n * lh + 21 + (10 if i else 0)
    return '<div style="display: flex; flex-direction: column; gap: 10px">%s</div>' % ''.join(out), tot

# ================================================================== la tavola
def build():
    cfg = Cfg(16.0, 5.0); c = cfg.d
    body = ''
    y = 72
    body += ewrap(X0, y, 200, 36, TX(0, 0, 'AI Coach', 28, 800, INK), cfg.en(0.1)); y += 52
    bc, bh = bench_card(cfg, y, cfg.en(0.25)); body += bc; y += bh + 28
    # Uso
    body += ewrap(X0, y, 160, 30, TX(0, 2, 'Uso', 22, 800, INK), cfg.en(2.2)); y += 40
    sel_y = y
    e_sel = cfg.en(2.3)
    body += '<div style="position: absolute; left: 0; top: 0; width: 390px; height: 0; opacity: «E.%s.o»; transform: «E.%s.tf»">%s</div>' % (e_sel, e_sel, selector(cfg, sel_y)); y += 44 + 16
    TC = 4.6
    ths = 272; geos = {}; draw = {'p': 2.9, 'c': 3.3, 'e': 3.7}; drw = {'p': TC + 0.5, 'c': TC + 0.7, 'e': 6.4}
    ent = {'p': 2.5, 'c': 2.8, 'e': 5.7}
    cardy = {}
    for key in 'pce':
        m, g = timecard(cfg, key, X0, y, CW, ths, 'top', cfg.en(ent[key]), draw[key], drw[key])
        body += m; geos[key] = g; cardy[key] = y; y += ths + 16
    pch = 336; pcy = y
    body += percard(cfg, X0, y, CW, pch, 'narrow', cfg.en(7.6), 8.2); y += pch + 28
    # Conversazioni
    cv_t = 9.0
    body += ewrap(X0, y, 260, 30, TX(0, 2, 'Conversazioni', 22, 800, INK), cfg.en(cv_t)); y += 40
    tw = (CW - 9) / 3.0
    tb = '<div style="position: absolute; left: 3px; top: 3px; width: %.2fpx; height: 35px; box-sizing: border-box; border-radius: 50px; background: %s; border: 1.500px solid %s"></div>' % (tw, SEL, BLU)
    for i, n in enumerate(TABS):
        tb += ab(3 + tw * i, 3, tw, 35, 'text-align: center; font-size: 13px; font-weight: 800; line-height: 35px; white-space: nowrap; color: %s' % (INK if i == 0 else SEC), n)
    body += ewrap(X0, y, CW, 44, '<div style="position: absolute; left: 0; top: 0; width: %dpx; height: 44px; box-sizing: border-box; border-radius: 50px; background: %s; border: 1.500px solid %s">%s</div>' % (CW, BG, BRD, tb), cfg.en(cv_t + 0.1)); y += 44 + 12
    list_y = y; RH = 88; r0 = 8
    chat_html, chat_h = chat_panel(cfg, 13, 11.5, 0.45)
    PH = chat_h + 32 + 4
    c['OPN'] = [[10.9, 0.7]]
    OPK = '«OP.k0»'
    cfg.win('hrow', (10.0, 99))
    inner = ''
    for r, cid in enumerate(IDS[:5]):
        ry = r0 + r * RH
        if r == 1:
            inner += conv_row(cid, r, ry, True, 'opacity: calc(1 - %s);' % OPK, 'transform: rotate(calc(%s * 180deg));' % OPK, sep=False)
        elif r == 0:
            inner += conv_row(cid, r, ry)
        else:
            inner += '<div style="position: absolute; left: 0; top: 0; width: %dpx; height: 1px; transform: translateY(calc(%s * %dpx))">%s</div>' % (CW, OPK, PH + 8 - 44, conv_row(cid, r, ry, sep=r < 4))
    inner += '<div style="position: absolute; left: 8px; top: %s; width: %dpx; height: calc(%s * %dpx); overflow: hidden; opacity: %s">%s</div>' % (
        'calc(%dpx - %s * 44px)' % (r0 + 2 * RH + 2, OPK), CW - 19, OPK, PH, OPK,
        '<div style="position: absolute; left: 0; top: 0; width: %dpx; height: %dpx; box-sizing: border-box; border-radius: 14px; background: #14171d; border: 1.500px solid %s; padding: 16px">%s</div>' % (CW - 19, PH - 4, BRD, chat_html))
    foot_y = r0 + 5 * RH
    foot = ab(0, foot_y, CW, 44, 'transform: translateY(calc(%s * %dpx))' % (OPK, PH + 8 - 44), TX(16, 10, 'Altre 1', 14, 800, SEC) + ab(70, 14, 20, 20, '', ic(CHD, 18, SEC)))
    inner += '<div style="position: absolute; left: 0; top: 0; width: %dpx; height: 1px">%s</div>' % (CW, foot)
    lh0 = foot_y + 44 + 8
    e_list = cfg.en(cv_t + 0.25)
    body += ('<div style="position: absolute; left: %dpx; top: %dpx; width: %dpx; height: calc(%dpx + %s * %dpx); box-sizing: border-box; background: %s; border: 1.500px solid %s; border-radius: 14px; box-shadow: 0 3px 0 %s; overflow: hidden; opacity: «E.%s.o»; transform: «E.%s.tf»">%s</div>'
             % (X0, list_y, CW, lh0, OPK, PH + 8 - 44, CARD, BRD, SH, e_list, e_list, inner))
    TOTAL = list_y + lh0 + PH + 32
    # --- scorrimento (funzione pura di t, inout)
    s1 = 560
    s2 = cardy['e'] - 330
    s3 = pcy - 84
    s4 = list_y - 176
    c['SY'] = [[1.9, 1.7, s1], [5.9, 2.0, s2], [8.0, 1.9, s3], [9.9, 0.9, s4]]
    c['SG'] = [TC]
    sx = X0 + 1.5 + 3 + SW * 1.5; sy_ = sel_y + 22 - s1
    rx = 190; ry_ = list_y + r0 + RH + 44 - s4
    c['S'] = [320, 780]
    cfg.way(sx, sy_, TC - 0.2); cfg.tap(sx, sy_, TC)
    cfg.way(rx, ry_, 10.7); cfg.tap(rx, ry_, 10.9)
    # --- barra alta del telefono (fissa, non scorre)
    bar = ('<div style="position: absolute; left: 0; top: 0; width: 390px; height: 56px; box-sizing: border-box; background: rgba(15,17,21,0.94); border-bottom: 1.500px solid %s"></div>' % BRD +
           ab(8, 6, 44, 44, 'box-sizing: border-box; border-radius: 12px; background: %s; border: 1.500px solid %s; display: flex; align-items: center; justify-content: center' % (CARD, BRD), ic(MENU, 22, INK, 2)) +
           ab(64, 14, None, None, 'font-size: 20px; font-weight: 800; line-height: 28px; letter-spacing: -0.3px; color: #ffffff; white-space: nowrap', 'Hype<span style="color: %s">move</span>' % LB))
    scroller = '<div style="position: absolute; left: 0; top: 0; width: 390px; height: %dpx; transform: translateY(-«sy»px)">%s</div>' % (TOTAL, body)
    gp.save('red-7-finestra-stretta.dc.html', '7 - Finestra stretta', W_, H_, scroller + bar, cfg)
    return dict(total=TOTAL, scroll=[s1, s2, s3, s4], PH=PH, bench_h=bh)

if __name__ == '__main__':
    print(build())
