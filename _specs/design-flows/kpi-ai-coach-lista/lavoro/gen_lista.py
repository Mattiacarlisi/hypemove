#!/usr/bin/env python3
# Colonna 7 «Il ciclo intero» del benchmark: la lista delle chat rotte del coach (tema Notte).
# Cinque tavole: 8-ciclo-oggi (fedele), 9-lista-vuota, 10-una-ambigua, 11-chat-lunga, 12-una-parola.
# Dati: chat vere dei segnali (id abbreviati, mai nomi). Importa gli attrezzi di gen_red.py.
import math, json
import gen_red as G
from gen_red import (Reg, ab, txt, ic, shell, SHELL, sidebar, save, R1, esc, SPARK, CHD, bench_card,
                     BG, CARD, BRD, SH, INK, SEC, TER, BLU, LB, ORG, GRN, RED, SEL, NEST, RAISED,
                     SBW, CX, CW, PL, PB, PT, CWB, BXW, Y_BENCH, BENCH_H, cxb, bxl)

Y_LIST = Y_BENCH + BENCH_H + 32
ROW_H, ROW0, LIST_HEAD = 72, 100, 100
STAT = {'da commentare': RED, 'ambigua': ORG, 'commentata': LB, 'in correzione': BLU, 'chiusa': GRN}

CHATS = {
    '81a1c1c3': dict(user='81a1c1c3', quando='12/10 04:32', schermata='Fine workout', nota='Ripete il riepilogo del feedback a ogni “Ok”, anche a conversazione chiusa.',
        msgs=[('c', 'Workout in cassaforte! Come ti senti adesso — carico o distrutto?'), ('u', 'Carico'),
              ('c', 'Ottimo: il workout ti ha attivato senza lasciarti scarico. Segno energia alta oggi.'), ('u', 'Ik'), ('c', 'Intendi “ok”?'),
              ('u*', 'Ok'), ('c', 'Perfetto. Il feedback di oggi è chiaro: ti sei sentito carico dopo l’allenamento, quindi l’intensità era ben tollerata.'),
              ('u', 'Ok'), ('c', 'Perfetto. Segno che il workout di oggi ti ha lasciato carico e ben tollerato.'), ('u', 'Si'),
              ('c', 'Perfetto, allora la sensazione post-workout è positiva: carico e senza eccessiva fatica.'),
              ('u', 'Carico si ma affaticato'), ('c', 'Capito: carico, ma con fatica residua. Lo segno così: oggi meglio recupero tranquillo.'),
              ('u', 'Ok'), ('c', 'Ricevuto: ho registrato oggi energia buona, ma con affaticamento residuo dopo il workout.')],
        scrivi=['Doveva chiudere con una riga,', 'senza rifare il riepilogo.'], prima=[]),
    '75619fdd': dict(user='75619fdd', quando='11/10 18:08', schermata='Dettaglio workout', nota='Il commento non dice se l’allenamento resta solo addominali.',
        msgs=[('u', 'Just abs'), ('c', 'I’ve redone today’s workout focusing only on abs.'), ('u', 'Solo manubri'),
              ('c', 'Ho preso nota che oggi vuoi allenarti solo per gli addominali e usare solo manubri. Ho rifatto l’allenamento di oggi in questo modo.'),
              ('u*', 'Voglio solo manubri'), ('c', 'Fatto: ho aggiornato l’allenamento di oggi in una sessione di 5 minuti con i manubri.')],
        scrivi=['Solo manubri, ma addominali', 'come prima.'], prima=['Doveva usare solo manubri', 'su tutto l’allenamento.']),
    'fdf95185': dict(user='fdf95185', quando='08/10 09:24', schermata='Dettaglio workout', nota='Chiede come procedere invece di cambiare l’esercizio scelto.',
        msgs=[('u*', 'cambia', 'Mountain Climbers'), ('c', 'Come vuoi sostituire il Mountain Climbers?'), ('u', 'fai tu'),
              ('c', 'Il cambio non si è applicato: per oggi sostituisci i Mountain Climbers con 30 secondi di marcia sul posto, senza salti.'),
              ('u', 'Cambia con altro questo esercizio'), ('c', 'Fatto: Corpo libero e warm-up, circa 17 minuti.')],
        scrivi=['Doveva cambiarlo subito con', 'uno simile, senza chiedere.'], prima=[]),
}
ROWS = [  # chat, risposta del coach, perché, stato
    ('81a1c1c3', 'Perfetto. Il feedback di oggi è chiaro: ti sei sentito carico dopo l’allenamento, quindi l’intensità era ben tollerata.', 'Riassume di nuovo il feedback', 'da commentare', 'Ok'),
    ('75619fdd', 'Fatto: ho aggiornato l’allenamento di oggi in una sessione di 5 minuti con i manubri.', 'Richiesta cambiata a metà', 'da commentare', 'Voglio solo manubri'),
    ('5d97fad1', 'Hai ragione: avevi chiesto stretching e ti è arrivata una sequenza di mobilità, per di più quasi tutta da seduta.', 'Chiesto stretching, ricevuta mobilità', 'commentata', 'Ho chiesto stretching'),
    ('fdf95185', 'Come vuoi sostituire il Mountain Climbers?', 'Chiede invece di cambiare', 'da commentare', 'cambia'),
]
QUANDO = {'81a1c1c3': '12/10 04:32', '75619fdd': '11/10 18:08', '5d97fad1': '09/10 13:00', 'fdf95185': '08/10 09:24'}
ELL = 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0;'
CLAMP = 'display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;'

def status_word(x, y, st, op='', w=150):
    return ab(x, y, w, 20, op, '<div style="display: flex; align-items: center; gap: 8px"><div style="width: 10px; height: 10px; border-radius: 5px; background: %s; flex: none"></div><div style="font-size: 14px; font-weight: 800; line-height: 20px; color: %s; white-space: nowrap">%s</div></div>' % (STAT[st], INK, st))

def list_row(i, row, st_after=None, hov=None, t_after=None, R=None, ent=''):
    cid, rep, why, st, msg = row
    y = ROW0 + i * ROW_H; s = ''
    if hov: s += ab(16, 2, CW - 32, ROW_H - 4, 'border-radius: 12px; background: %s; opacity: «K.%s»' % (RAISED, hov))
    s += ab(32, 10, 240, 20, '', '<div style="%s font-size: 15px; font-weight: 800; line-height: 20px; color: %s">%s</div>' % (ELL, INK, esc(msg)))
    s += txt(32, 36, '%s · %s' % (cid, QUANDO[cid]), 13, 700, SEC)
    s += ab(308, 10, 320, 40, '', '<div style="%s font-size: 14px; font-weight: 700; line-height: 19px; color: %s">%s</div>' % (CLAMP, SEC, esc(rep)))
    s += ab(664, 10, 168, 40, '', '<div style="%s font-size: 14px; font-weight: 700; line-height: 19px; color: %s">%s</div>' % (CLAMP, INK, esc(why)))
    if st_after:
        s += status_word(846, 10, st, 'opacity: «K.%s»' % t_after[0]) + status_word(846, 10, st_after, 'opacity: «K.%s»' % t_after[1])
    else:
        s += status_word(846, 10, st)
    if i < len(ROWS) - 1: s += ab(24, ROW_H - 2, CW - 48, 1.5, 'background: %s' % BRD)
    return ab(0, y, CW, ROW_H, ent, s)

CHATI = '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>'
def col7_overlay(R, count, a, sel_ch=None):
    """La colonna 7 del benchmark diventa un tasto: icona nel riquadro, conteggio al posto di «non misurato»."""
    x0, y0, w, h = CX + bxl(6), Y_BENCH + PT - 22, BXW, PB - PT + 44
    on = R.v([[a, 0], [a + .5, 1]], 'o'); col = LB if count else TER
    base = 'box-sizing: border-box; border-radius: 12px; border: 1.500px solid %s; ' % BLU
    s = ab(x0, y0, w, h, base + 'background: %s; opacity: %s' % (NEST, on), ab(w / 2 - 20, h / 2 - 20, 40, 40, '', ic(CHATI, 40, col, 1.8)))
    if sel_ch:
        s += ab(x0, y0, w, h, base + 'background: %s; opacity: «K.%s»; pointer-events: none' % (SEL, sel_ch), ab(w / 2 - 20, h / 2 - 20, 40, 40, '', ic(CHATI, 40, INK, 1.8)))
    cw_ = CWB - 4
    s += ab(CX + cxb(6) - cw_ / 2, Y_BENCH + PB + 108, cw_, 30, 'background: %s; opacity: %s; text-align: center; font-size: 16px; font-weight: 800; line-height: 30px; color: %s; white-space: nowrap' % (CARD, on, INK if count else TER),
            '%d da commentare' % count)
    return s

def bubbles(R, chat, t0, step, maxw=440, fs=14, lh=20, gap=12):
    out, y, fy = [], 0, 0
    cpl = max(8, int((maxw - 34) / (fs * 0.52)))
    av = '<div style="width: 28px; height: 28px; border-radius: 50%%; background: %s; display: flex; align-items: center; justify-content: center; flex: none">%s</div>' % (SEL, ic(SPARK, 17, LB, 2))
    for i, m in enumerate(chat['msgs']):
        who, text = m[0], m[1]; flag = who.endswith('*'); who = who[0]
        a = t0 + i * step; n = max(1, math.ceil(len(text) / cpl)); tag = m[2] if len(m) > 2 else None
        h = n * lh + 21 + (20 if tag else 0) + (20 if flag else 0)
        if flag: fy = y
        lab = '<div style="font-size: 13px; font-weight: 800; line-height: 16px; color: %s; margin: 0 0 4px 2px; text-align: right">Segnalato</div>' % RED if flag else ''
        tg = '<div style="margin-top: 6px; padding-top: 6px; border-top: 1.500px solid rgba(255,255,255,.35); font-size: 12px; font-weight: 700; line-height: 14px">Carta: %s</div>' % esc(tag) if tag else ''
        if who == 'c':
            b = '<div style="box-sizing: border-box; max-width: %dpx; padding: 9px 16px; border-radius: 18px 18px 18px 6px; background: %s; border: 1.500px solid %s; font-size: %dpx; font-weight: 700; line-height: %dpx; color: %s">%s</div>' % (maxw, RAISED, BRD, fs, lh, INK, esc(text))
            out.append('<div style="display: flex; align-items: flex-end; gap: 10px; %s">%s%s</div>' % (R.pop(a, 'left bottom'), av, b))
        else:
            b = '<div style="box-sizing: border-box; max-width: %dpx; padding: 9px 16px; border-radius: 18px 18px 6px 18px; background: %s; border: 1.500px solid %s; font-size: %dpx; font-weight: 700; line-height: %dpx; color: %s">%s%s</div>' % (maxw, BLU, RED if flag else BLU, fs, lh, INK, esc(text), tg)
            out.append('<div style="display: flex; flex-direction: column; align-items: flex-end; %s">%s%s</div>' % (R.pop(a, 'right bottom'), lab, b))
        y += h + gap
    return '<div style="display: flex; flex-direction: column; gap: %dpx; padding-top: 4px">%s</div>' % (gap, ''.join(out)), y, fy

def build(name, title, kind, sel=None, amb=None):
    """kind: 'oggi' | 'vuota' | 'lista'. sel: indice riga aperta. amb: indice riga ambigua (stato di partenza)."""
    R = Reg()
    rows = list(ROWS)
    if amb is not None: rows[amb] = rows[amb][:3] + ('ambigua',) + rows[amb][4:]
    n_open = sum(1 for r in rows if r[3] in ('da commentare', 'ambigua'))
    H = 720
    if kind == 'vuota': H = 808
    if kind == 'lista': H = 1584
    e = [R.ent(0.1 + 0.1 * k, 10) for k in range(4)]
    body = txt(CX, 32, 'AI Coach', 28, 800, INK, e[0])
    bc, _ = bench_card(R, Y_BENCH, e[1], 0.6)
    body += bc
    T, W = [], []
    cx7, cy7 = SBW + CX + cxb(6), Y_BENCH + (PT + PB) / 2
    if kind == 'oggi':
        C = dict(P=8, TS=5, S=[0, 0], W=[], T=[])
        save(name, title, 1280, H, R, sidebar(H) + ab(SBW, 0, 1060, H, 'overflow: hidden', body), C, pointer=False); return
    t1 = 3.0
    selc = R.ch([[t1, 0], [t1 + .3, 1]], 'l')
    body += col7_overlay(R, 0 if kind == 'vuota' else n_open, 0.9, selc)
    W.append([cx7, cy7, t1]); T.append([cx7, cy7, t1])
    if kind == 'vuota':
        body += shell(CX, Y_LIST, CW, 120, txt(24, 22, 'Chat da correggere', 22, 800, INK) +
                      ab(0, 72, CW, 28, 'text-align: center; font-size: 18px; font-weight: 800; line-height: 28px; color: %s' % SEC, 'Nessuna chat da commentare'),
                      R.ent(t1 + .2, 12))
        C = dict(P=8, TS=5, S=[1100, 600], W=W, T=T)
        save(name, title, 1280, H, R, sidebar(H) + ab(SBW, 0, 1060, H, 'overflow: hidden', body), C); return
    # lista con righe
    t2 = 5.6; ch = CHATS[rows[sel][0]]
    n_lines = len(ch['scrivi']); t_type = 9.4; t_end = t_type + 0.8 * n_lines; tb = t_end + 0.9
    hov = R.ch([[t2, 0], [t2 + .25, 1]], 'l')
    after = (R.ch([[tb + .2, 1], [tb + .5, 0]], 'l'), R.ch([[tb + .2, 0], [tb + .5, 1]], 'l'))
    lst = txt(24, 22, 'Chat da correggere', 22, 800, INK)
    for x, lb in ((32, 'Chat'), (308, 'Il coach ha fatto'), (664, 'Perché'), (846, 'Stato')):
        lst += txt(x, 74, lb, 12, 800, TER, 'letter-spacing: 0.06em; text-transform: uppercase')
    lst += ab(24, 94, CW - 48, 1.5, 'background: %s' % BRD)
    for i, row in enumerate(rows):
        ent = R.ent(t1 + .4 + .1 * i, 10)
        if i == sel:
            lst += list_row(i, row, 'commentata', hov, after, R, ent)
        else:
            lst += list_row(i, row, None, None, None, R, ent)
    LIST_H = LIST_HEAD + ROW_H * len(rows) + 16
    body += shell(CX, Y_LIST, CW, LIST_H, lst, R.ent(t1 + .2, 12))
    # dettaglio
    Y_DET = Y_LIST + LIST_H + 32; DET_H = 456
    d = txt(24, 20, 'Utente ' + ch['user'], 20, 800, INK) + txt(24, 48, '%s · %s' % (ch['schermata'], ch['quando']), 13, 700, SEC)
    st0 = rows[sel][3]
    d += status_word(CW - 24 - 150, 24, st0, 'opacity: «K.%s»' % after[0]) + status_word(CW - 24 - 150, 24, 'commentata', 'opacity: «K.%s»' % after[1])
    d += ab(24, 76, CW - 48, 1.5, 'background: %s' % BRD)
    bub, tot, fy = bubbles(R, ch, t2 + .5, 0.12)
    WIN = 328; tgt = max(0, min(tot - WIN, fy - 40))
    sc = R.ch([[7.9, 0], [8.9, -tgt]]) if tgt else R.ch([[0, 0], [1, 0]])
    d += ab(24, 92, 572, WIN, 'overflow: hidden', '<div style="transform: translateY(«K.%s»px)">%s</div>' % (sc, bub))
    thh = max(40, WIN * WIN / max(tot, WIN)); trv = WIN - thh
    thc = R.ch([[7.9, 0], [8.9, trv * (tgt / max(1, tot - WIN))]]) if tgt else R.ch([[0, 0], [1, 0]])
    d += ab(24, 92 + WIN - 36, 572, 36, 'background: linear-gradient(to bottom, rgba(26,29,36,0), %s); pointer-events: none' % CARD)
    d += ab(602, 92, 4, WIN, 'border-radius: 2px; background: %s' % BRD, ab(0, 0, 4, thh, 'border-radius: 2px; background: %s; transform: translateY(«K.%s»px)' % (SEC, thc)))
    d += txt(616, 92, 'Perché è segnalata' if st0 != 'ambigua' else 'Perché è ambigua', 12, 800, TER, 'letter-spacing: 0.06em; text-transform: uppercase')
    d += ab(616, 114, 356, 60, '', '<div style="font-size: 14px; font-weight: 700; line-height: 20px; color: %s">%s</div>' % (INK, esc(ch['nota'])))
    d += txt(616, 190, 'Doveva fare così', 12, 800, TER, 'letter-spacing: 0.06em; text-transform: uppercase')
    FH = 152
    box = ab(616, 214, 356, FH, 'box-sizing: border-box; border-radius: 12px; background: %s; border: 1.500px solid %s' % (NEST, BRD))
    fld = ''
    ph = R.ch([[t_type - .2, 1], [t_type, 0]], 'l')
    yy = 14
    if ch['prima']:
        fld += txt(14, 10, 'Commento di prima', 11, 800, TER, 'letter-spacing: 0.06em; text-transform: uppercase', 14)
        yy = 28
        for ln in ch['prima']:
            fld += txt(14, yy, esc(ln), 14, 700, SEC, '', 22); yy += 22
        fld += ab(14, yy + 4, 328, 1.5, 'background: %s' % BRD)
        fld += txt(14, yy + 12, 'Nuovo', 11, 800, LB, 'letter-spacing: 0.06em; text-transform: uppercase', 14)
        yy += 30
    else:
        fld += txt(14, 14, 'Scrivi cosa doveva fare', 14, 700, TER, 'opacity: «K.%s»' % ph, 22)
    for j, ln in enumerate(ch['scrivi']):
        wc = R.ch([[t_type + .8 * j, 0], [t_type + .8 * j + .7, 300]], 'o')
        fld += '<div style="position: absolute; left: 14px; top: %dpx; width: «K.%s»px; height: 22px; overflow: hidden"><div style="font-size: 14px; font-weight: 700; line-height: 22px; color: %s; white-space: nowrap">%s</div></div>' % (yy, wc, INK, esc(ln))
        yy += 22
    d += box + ab(616, 214, 356, FH, '', fld)
    bst = R.ch([[tb, 0], [tb + .25, 1]], 'l'); bn = R.ch([[tb, 1], [tb + .25, 0]], 'l')
    d += ab(616, 382, 176, 44, 'box-sizing: border-box; border-radius: 22px; background: %s; box-shadow: 0 3px 0 %s; opacity: «K.%s»; text-align: center; font-size: 15px; font-weight: 800; line-height: 44px; color: #ffffff' % (BLU, SH, bn), 'Salva commento')
    d += ab(616, 382, 176, 44, 'box-sizing: border-box; border-radius: 22px; background: %s; border: 1.500px solid %s; opacity: «K.%s»; text-align: center; font-size: 15px; font-weight: 800; line-height: 41px; color: #ffffff' % (SEL, BLU, bst), 'Salvato')
    body += shell(CX, Y_DET, CW, DET_H, d, R.ent(t2 + .2, 12))
    ry = Y_LIST + ROW0 + sel * ROW_H + ROW_H / 2
    W.append([SBW + CX + 420, ry, t2]); T.append([SBW + CX + 420, ry, t2])
    bx_, by_ = SBW + CX + 616 + 88, Y_DET + 404
    W.append([SBW + CX + 920, Y_DET + 340, t_type - .6]); W.append([bx_, by_, tb]); T.append([bx_, by_, tb]); W.append([bx_ + 190, by_ + 40, tb + 1.6])
    C = dict(P=tb + 3.2, TS=t_end + .3, S=[1100, 600], W=W, T=T)
    save(name, title, 1280, H, R, sidebar(H) + ab(SBW, 0, 1060, H, 'overflow: hidden', body), C)

if __name__ == '__main__':
    build('lista-8-ciclo-oggi.dc.html', '8 - Ciclo oggi', 'oggi')
    build('lista-9-lista-vuota.dc.html', '9 - Lista vuota', 'vuota')
    build('lista-10-una-ambigua.dc.html', '10 - Una ambigua', 'lista', sel=1, amb=1)
    build('lista-11-chat-lunga.dc.html', '11 - Chat lunga', 'lista', sel=0)
    build('lista-12-una-parola.dc.html', '12 - Una parola', 'lista', sel=3)
