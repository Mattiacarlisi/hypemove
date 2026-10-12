#!/usr/bin/env python3
# Tavola «intera-1-pagina»: la pagina KPI «AI Coach» intera sulla composizione della 2A (gen_pagina.py),
# con la riga «Il ciclo intero» nel benchmark e UNA scheda «Chat da correggere» (la riga si apre sul posto).
# Dati: dati.json (2A), chat vere di gen_lista.py, chat segnalate al giorno lette da coach_broken_chats il 12/10/2026.
import gen_pagina as P
import gen_lista as L
from gen_red import Reg, ab, txt, ic, esc, CHD, RAISED, NEST
from gen_pagina import TX, BG, CARD, BRD, SH, INK, SEC, TER, BLU, LB, ORG, GRN, RED, SEL, INN

# chat segnalate per giorno del messaggio (ora italiana), 29/09 - 12/10: 120 righe, tutte aperte. Il 12 è parziale.
GIORNI = [('29/09', 2), ('30/09', 8), ('01/10', 2), ('02/10', 2), ('03/10', 0), ('04/10', 10), ('05/10', 7), ('06/10', 11),
          ('07/10', 15), ('08/10', 13), ('09/10', 18), ('10/10', 8), ('11/10', 19), ('12/10', 5)]
APERTE = sum(n for _, n in GIORNI); assert APERTE == 120 and len(GIORNI) == 14

# K: canali a fotogrammi chiave (come gen_red), innestati nel motore della 2A
KJS = '''const pop = (x) => x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.exp(-6 * x) * Math.cos(9 * x);
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
    return {
      K, veil:'''
assert '    return {\n      veil:' in P.JS
P.JS = P.JS.replace('    return {\n      veil:', '    ' + KJS)

X0, CWD = 32, 1216
ROW_H, ROW0, PH, WIN = 72, 92, 336, 300
C_CHAT, C_REP, C_WHY, C_ST = (32, 300), (356, 400), (790, 220), (1040, 150)
UP = 'letter-spacing: 0.06em; text-transform: uppercase'

def daychart(cfg, w, h, tdraw):
    n = len(GIORNI); top, bot = 16, 18; ph = h - top - bot; slot = w / float(n); bw = slot * 0.56; ym = max(v for _, v in GIORNI)
    y = lambda v: top + ph - v / float(ym) * ph; cx = lambda i: i * slot + slot / 2.0
    s = '<line x1="0" x2="%d" y1="%.1f" y2="%.1f" stroke="%s" stroke-width="1.500"></line>' % (w, y(0), y(0), TER)
    for i, (d, v) in enumerate(GIORNI):
        x0 = cx(i) - bw / 2.0
        if v == 0: s += '<rect x="%.1f" y="%.1f" width="%.1f" height="3" rx="1.500" fill="%s"></rect>' % (x0, y(0) - 3, bw, TER)
        elif i == n - 1: s += '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="2" fill="%s" fill-opacity="0.22" stroke="%s" stroke-width="1.500" stroke-dasharray="3 3"></rect>' % (x0 + .75, y(v) + .75, bw - 1.5, y(0) - y(v) - .75, RED, RED)
        else: s += '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="2" fill="%s"></rect>' % (x0, y(v), bw, y(0) - y(v), RED)
    vals = [v for _, v in GIORNI]
    for i in {vals.index(ym), n - 1}:
        s += '<text x="%.1f" y="%.1f" font-size="12" font-weight="800" text-anchor="middle" fill="#ffffff">%d</text>' % (cx(i), y(vals[i]) - 5, vals[i])
    for i in (0, 7):
        s += '<text x="%.1f" y="%d" font-size="12" font-weight="700" text-anchor="middle" fill="%s">%s</text>' % (cx(i), h - 3, TER, GIORNI[i][0])
    s += '<text x="%.1f" y="%d" font-size="12" font-weight="800" text-anchor="middle" fill="#ffffff">oggi</text>' % (cx(n - 1), h - 3)
    return P.clip(0, 0, w, h, cfg.rv('ciclo', tdraw, 1.3, w), s)

def benchcard(cfg, x, y, w, e, tdraw):
    """La scheda della 2A: tre passaggi misurati, tre spenti, e in fondo «Il ciclo intero» che porta alle chat."""
    pad = 24; rowh = 80; inner = TX(pad, 18, 'Benchmark', 22, 800, INK)
    inner += '<svg width="30" height="12" style="position: absolute; left: %dpx; top: 26px" aria-hidden="true"><line x1="2" y1="6" x2="28" y2="6" stroke="%s" stroke-width="2.500" stroke-linecap="round"></line></svg>' % (w - pad - 114, ORG) + TX(w - pad - 76, 22, 'Soglia 99%', 14, 800, ORG)
    namew, scw = 300, 190; dx = pad + namew + scw; dw = w - dx - pad; yy = 64
    rowbox = lambda yy, h, brd: '<div style="position: absolute; left: %dpx; top: %dpx; width: %dpx; height: %dpx; box-sizing: border-box; border-radius: 12px; background: %s; border: 1.500px solid %s"></div>' % (pad - 8, yy, w - 2 * pad + 16, h, INN, brd)
    for i in range(3):
        p = P.BM[i]; gi, ca = P.bmstate(p); ok = 100.0 * gi / ca >= 99
        inner += rowbox(yy, rowh - 8, BRD)
        inner += TX(pad + 8, yy + (rowh - 8) / 2.0 - 24, p['nome'], 18, 800, INK) + TX(pad + 8, yy + (rowh - 8) / 2.0 + 2, p['modello'], 14, 700, SEC)
        inner += '<div style="position: absolute; left: %dpx; top: %dpx; white-space: nowrap"><span style="font-size: 44px; font-weight: 800; line-height: 48px; color: %s">%d</span><span style="font-size: 16px; font-weight: 700; color: %s"> su %d</span></div>' % (pad + namew, yy + (rowh - 8) / 2.0 - 26, GRN if ok else INK, gi, SEC, ca)
        inner += '<div style="position: absolute; left: %dpx; top: %dpx">%s</div>' % (dx, yy + 8, P.dots(cfg, i, dw - 8, rowh - 24, tdraw))
        yy += rowh
    yy += 4; gw = (w - 2 * pad - 24) / 3.0; dh = 56
    for j in range(3):
        p = P.BM[3 + j]; cxp = pad + j * (gw + 12)
        inner += '<div style="position: absolute; left: %.1fpx; top: %dpx; width: %.1fpx; height: %dpx; box-sizing: border-box; border-radius: 12px; border: 1.500px dashed %s"></div>' % (cxp, yy, gw, dh, BRD)
        inner += TX(round(cxp + 16, 1), yy + 8, p['nome'], 15, 800, TER) + TX(round(cxp + 16, 1), yy + 30, 'Nessun giro', 13, 700, TER)
    yy += dh + 12; ch = 96; mid = yy + ch / 2.0
    assert P.BM[6]['nome'] == 'Il ciclo intero'
    inner += rowbox(yy, ch, BLU)
    inner += TX(pad + 8, mid - 24, 'Il ciclo intero', 18, 800, INK) + TX(pad + 8, mid + 2, 'chat segnalate al giorno, 14 giorni', 14, 700, SEC)
    inner += '<div style="position: absolute; left: %dpx; top: %dpx; white-space: nowrap"><span style="font-size: 44px; font-weight: 800; line-height: 48px; color: %s">%d</span><span style="font-size: 16px; font-weight: 700; color: %s"> da commentare</span></div>' % (pad + namew, mid - 26, INK, APERTE, SEC)
    gx = dx + 44; lw = 196; gwd = w - pad - 8 - lw - gx
    inner += '<div style="position: absolute; left: %dpx; top: %dpx">%s</div>' % (gx, yy + 10, daychart(cfg, gwd, ch - 20, tdraw + .45))
    inner += '<div style="position: absolute; left: %dpx; top: %dpx; width: %dpx; height: 24px; display: flex; align-items: center; justify-content: flex-end; gap: 6px"><div style="font-size: 14px; font-weight: 800; line-height: 24px; color: %s; white-space: nowrap">Chat da correggere</div>%s</div>' % (w - pad - 8 - lw, mid - 12, lw, LB, ic(CHD, 20, LB, 2.5))
    hh = yy + ch + 16
    return P.ewrap(x, y, w, hh, '<div style="position: absolute; left: 0; top: 0; width: %dpx; height: %dpx; box-sizing: border-box; background: %s; border: 1.500px solid %s; border-radius: 14px; box-shadow: 0 3px 0 %s"></div>%s' % (w, hh, CARD, BRD, SH, inner), e), hh

def cell(col, y, h, st, inner, op=''):
    return ab(col[0], y, col[1], h, op, '<div style="%s">%s</div>' % (st, inner))

def row(R, i, r, opened=None, hov=None, stat=None):
    """opened: canale 0..1, la prima cella diventa il titolo della chat aperta. stat: (canale prima, canale dopo)."""
    cid, rep, why, st, msg = r; s = ''
    if hov: s += ab(8, 2, CWD - 16, ROW_H - 4, 'border-radius: 12px; background: %s; opacity: «K.%s»' % (RAISED, hov))
    c1 = cell(C_CHAT, 10, 20, L.ELL + ' font-size: 15px; font-weight: 800; line-height: 20px; color: %s' % INK, esc(msg)) + txt(C_CHAT[0], 36, '%s · %s' % (cid, L.QUANDO[cid]), 13, 700, SEC)
    if opened:
        ch = L.CHATS[cid]
        c2 = cell(C_CHAT, 6, 28, L.ELL + ' font-size: 20px; font-weight: 800; line-height: 28px; color: %s' % INK, '&laquo;%s&raquo;' % esc(msg)) + txt(C_CHAT[0], 40, 'Utente %s · %s · %s' % (cid, ch['schermata'], ch['quando']), 13, 700, SEC)
        s += ab(0, 0, CWD, ROW_H, 'opacity: calc(1 - «K.%s»)' % opened, c1) + ab(0, 0, CWD, ROW_H, 'opacity: «K.%s»' % opened, c2)
    else: s += c1
    s += cell(C_REP, 10, 40, L.CLAMP + ' font-size: 14px; font-weight: 700; line-height: 19px; color: %s' % SEC, esc(rep))
    s += cell(C_WHY, 10, 40, L.CLAMP + ' font-size: 14px; font-weight: 700; line-height: 19px; color: %s' % INK, esc(why))
    if stat: s += L.status_word(C_ST[0], 10, st, 'opacity: «K.%s»' % stat[0]) + L.status_word(C_ST[0], 10, 'commentata', 'opacity: «K.%s»' % stat[1])
    else: s += L.status_word(C_ST[0], 10, st)
    s += ab(24, ROW_H - 2, CWD - 48, 1.5, 'background: %s' % BRD)
    return s

def panel(R, cid, t_open, t_scroll=None, t_type=None, tb=None):
    """Il corpo della riga aperta: chat che scorre a sinistra, «Doveva fare così» e tasto a destra."""
    ch = L.CHATS[cid]; cx, cw = 32, 640; rx, rw = 720, 464; d = ''
    bub, tot, fy = L.bubbles(R, ch, t_open + .5, 0.1, 460)
    tgt = max(0, min(tot - WIN, fy - 40)) if t_scroll else 0
    sc = R.ch([[t_scroll, 0], [t_scroll + .9, -tgt]]) if tgt else R.ch([[0, 0], [1, 0]])
    d += ab(cx, 12, cw, WIN, 'overflow: hidden', '<div style="transform: translateY(«K.%s»px)">%s</div>' % (sc, bub))
    if tot > WIN:
        thh = max(40, WIN * WIN / tot); trv = WIN - thh
        thc = R.ch([[t_scroll, 0], [t_scroll + .9, trv * (tgt / max(1, tot - WIN))]]) if tgt else R.ch([[0, 0], [1, 0]])
        d += ab(cx, 12 + WIN - 36, cw, 36, 'background: linear-gradient(to bottom, rgba(26,29,36,0), %s); pointer-events: none' % CARD)
        d += ab(cx + cw + 8, 12, 4, WIN, 'border-radius: 2px; background: %s' % BRD, ab(0, 0, 4, thh, 'border-radius: 2px; background: %s; transform: translateY(«K.%s»px)' % (SEC, thc)))
    d += txt(rx, 12, 'Perché è segnalata', 12, 800, TER, UP)
    d += ab(rx, 34, rw, 40, '', '<div style="font-size: 14px; font-weight: 700; line-height: 20px; color: %s">%s</div>' % (INK, esc(ch['nota'])))
    d += txt(rx, 94, 'Doveva fare così', 12, 800, TER, UP)
    FH = 138
    fld = ''
    if t_type:
        fld += txt(14, 14, 'Scrivi cosa doveva fare', 14, 700, TER, 'opacity: «K.%s»' % R.ch([[t_type - .2, 1], [t_type, 0]], 'l'), 22)
        for j, ln in enumerate(ch['scrivi']):
            wc = R.ch([[t_type + .8 * j, 0], [t_type + .8 * j + .7, 300]], 'o')
            fld += '<div style="position: absolute; left: 14px; top: %dpx; width: «K.%s»px; height: 22px; overflow: hidden"><div style="font-size: 14px; font-weight: 700; line-height: 22px; color: %s; white-space: nowrap">%s</div></div>' % (14 + 22 * j, wc, INK, esc(ln))
    else: fld += txt(14, 14, 'Scrivi cosa doveva fare', 14, 700, TER, '', 22)
    d += ab(rx, 118, rw, FH, 'box-sizing: border-box; border-radius: 12px; background: %s; border: 1.500px solid %s' % (NEST, BRD), fld)
    BTN = 'box-sizing: border-box; border-radius: 22px; text-align: center; font-size: 15px; font-weight: 800; color: #ffffff; '
    if tb:
        bst = R.ch([[tb, 0], [tb + .25, 1]], 'l'); bn = R.ch([[tb, 1], [tb + .25, 0]], 'l')
        d += ab(rx, 268, 176, 44, BTN + 'background: %s; box-shadow: 0 3px 0 %s; line-height: 44px; opacity: «K.%s»' % (BLU, SH, bn), 'Salva commento')
        d += ab(rx, 268, 176, 44, BTN + 'background: %s; border: 1.500px solid %s; line-height: 41px; opacity: «K.%s»' % (SEL, BLU, bst), 'Salvato')
    else:
        d += ab(rx, 268, 176, 44, BTN + 'background: %s; box-shadow: 0 3px 0 %s; line-height: 44px' % (BLU, SH), 'Salva commento')
    d += ab(24, PH - 2, CWD - 48, 1.5, 'background: %s' % BRD)
    return d

def build():
    R = Reg(); cfg = P.Cfg(17.0, 9.7); c = cfg.d
    ei = [cfg.en(0.1 + 0.12 * k) for k in range(8)]
    body = TX(32, 26, 'AI Coach', 28, 800, INK, 'opacity: «E.%s.o»' % ei[0])
    bc, bh = benchcard(cfg, X0, 84, CWD, ei[1], 1.0)
    body += bc
    # ---------------- tempi
    tA = 3.8; t_scroll = tA + 2.4; t_type = tA + 4.0; n = len(L.CHATS['81a1c1c3']['scrivi']); t_end = t_type + .8 * n; tb = t_end + 1.0; tC = tb + 2.4
    h1 = R.ch([[tA, 0], [tA + .6, PH], [tC, PH], [tC + .6, 0]]); h2 = R.ch([[tC, 0], [tC + .6, PH]])
    hs = R.ch([[tA, 0], [tA + .6, PH]])
    o1 = R.ch([[tA, 0], [tA + .3, 1], [tC, 1], [tC + .3, 0]], 'l'); o2 = R.ch([[tC, 0], [tC + .3, 1]], 'l')
    hv1 = R.ch([[tA - .3, 0], [tA - .1, 1], [tC, 1], [tC + .3, 0]], 'l'); hv2 = R.ch([[tC - .3, 0], [tC - .1, 1]], 'l')
    stat = (R.ch([[tb + .2, 1], [tb + .5, 0]], 'l'), R.ch([[tb + .2, 0], [tb + .5, 1]], 'l'))
    # ---------------- la scheda unica
    YL = 84 + bh + 28; rows = L.ROWS; BASE = ROW0 + ROW_H * len(rows) + 44 + 8
    s = TX(24, 18, 'Chat da correggere', 22, 800, INK)
    for col, lb in ((C_CHAT, 'Chat'), (C_REP, 'Il coach ha fatto'), (C_WHY, 'Perché'), (C_ST, 'Stato')):
        s += txt(col[0], 62, lb, 12, 800, TER, UP)
    s += ab(24, 84, CWD - 48, 1.5, 'background: %s' % BRD)
    s += ab(0, ROW0, CWD, ROW_H, '', row(R, 0, rows[0], o1, hv1, stat))
    s += ab(0, ROW0 + ROW_H, CWD, None, 'height: «K.%s»px; overflow: hidden' % h1, ab(0, 0, CWD, PH, '', panel(R, rows[0][0], tA, t_scroll, t_type, tb)))
    low = ab(0, ROW0 + ROW_H, CWD, ROW_H, '', row(R, 1, rows[1])) + ab(0, ROW0 + 2 * ROW_H, CWD, ROW_H, '', row(R, 2, rows[2]))
    low += ab(0, ROW0 + 3 * ROW_H, CWD, ROW_H, '', row(R, 3, rows[3], o2, hv2))
    low += ab(0, ROW0 + 4 * ROW_H, CWD, None, 'height: «K.%s»px; overflow: hidden' % h2, ab(0, 0, CWD, PH, '', panel(R, rows[3][0], tC)))
    s += ab(0, 0, CWD, 0, 'transform: translateY(«K.%s»px)' % h1, low)
    s += ab(0, ROW0 + 4 * ROW_H, CWD, 44, 'transform: translateY(«K.%s»px)' % hs, txt(32, 12, 'Altre %d' % (APERTE - len(rows)), 14, 800, SEC) + ab(32 + 72, 14, 20, 20, '', ic(CHD, 18, SEC)))
    shell = '<div style="position: absolute; left: 0; top: 0; width: %dpx; height: calc(%dpx + «K.%s»px); box-sizing: border-box; background: %s; border: 1.500px solid %s; border-radius: 14px; box-shadow: 0 3px 0 %s"></div>' % (CWD, BASE, hs, CARD, BRD, SH)
    body += ab(X0, YL, CWD, BASE, 'opacity: «E.%s.o»; transform: «E.%s.tf»' % (ei[2], ei[2]), shell + s)
    # ---------------- il resto della 2A, spinto giù dalla riga aperta
    uy = YL + BASE + 28; rest = P.HEAD(32, uy + 6, 'Uso') + P.selector(cfg, 1248 - P.SELW, uy)
    cy = uy + 56; cw3 = 392; chh = 288
    for k, key in enumerate('pce'):
        m, g = P.timecard(cfg, key, 32 + k * (cw3 + 20), cy, cw3, chh, 'top', ei[3 + k], 1.3 + 0.15 * k, 99)
        rest += m
    py_ = cy + chh + 16
    rest += P.percard(cfg, 32, py_, 1216, 272, 'wide', ei[6], 1.8)
    cy2 = py_ + 272 + 28
    conv, chh2 = P.convcard(cfg, 32, cy2, 1216, [2, 4, 13, 17, 16, 18], ei[7], 56)
    rest += conv
    H = cy2 + chh2 + 32 + PH
    body += ab(0, 0, 1280, 0, 'transform: translateY(«K.%s»px)' % hs, rest)
    # ---------------- puntatore
    c['S'] = [1150, 330]; c['K'] = R.k
    r0y = YL + ROW0 + ROW_H / 2.0; yp = YL + ROW0 + ROW_H
    cfg.way(X0 + 560, r0y + 8, tA); cfg.tap(X0 + 560, r0y + 8, tA)
    cfg.way(X0 + 1150, yp + 118 + 112, t_type - .5)
    bx, by = X0 + 720 + 152, yp + 268 + 28
    cfg.way(bx, by, tb); cfg.tap(bx, by, tb)
    r3y = YL + ROW0 + 3 * ROW_H + PH + ROW_H / 2.0
    cfg.way(X0 + 560, r3y + 8, tC); cfg.tap(X0 + 560, r3y + 8, tC)
    cfg.way(X0 + 1184, YL + ROW0 + 4 * ROW_H + 14, tC + 1.6)
    P.save('intera-1-pagina.dc.html', 'Intera 1 - Pagina', 1280, int(H), body, cfg)

if __name__ == '__main__':
    build()
