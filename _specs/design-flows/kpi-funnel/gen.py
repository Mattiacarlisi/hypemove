#!/usr/bin/env python3
"""Genera le tavole del redesign «Funnel» della dashboard KPI. Scrive in project/.
Dati veri letti dalla dashboard il 07/10/2026: funnel «Workout 1», sprint dal 06/10 e sprint dal 04/10."""
import json, os, sys

OUT = 'project'
os.makedirs(OUT, exist_ok=True)
H = lambda n: '{{' + n + '}}'

# ── dati veri ────────────────────────────────────────────────────────────────
STEPS = ['Download / primo avvio', '1º allenamento finito', '2º allenamento finito', '3º allenamento finito',
         'Vede un paywall', 'Tocca «paga»', 'Il pagamento parte', 'Ha pagato']
EVT = ['first_open', 'workout_complete', 'workout_complete · 2ª volta', 'workout_complete · 3ª volta',
       'paywall_step_view', 'paywall_cta_tap', 'paywall_purchase_attempt', 'paywall_purchase_success']
VAR = {5: '1 variante', 6: '1 variante'}
CUR = dict(n=[133, 9, 0, 0, 0, 0, 0, 0], pas=['—', '19m 6s', '—', '—', '—', '—', '—', '—'],
           cum=['0s', '19m 6s', '—', '—', '—', '—', '—', '—'], meta=86, win='06/10 13:30 → 13/10',
           stats=[('Coorte', '133', ''), ('Arriva in fondo', '0,0%', '0 su 133'),
                  ('Drop peggiore', '−93,2%', '124 persone · 1º allenamento finito'),
                  ('Passaggio più lungo', '19m 6s', 'verso 1º allenamento finito')])
PRV = dict(n=[288, 21, 3, 3, 2, 0, 0, 0], pas=['—', '25m 52s', '20h 39m', '16h 43m', '8s', '—', '—', '—'],
           cum=['0s', '25m 52s', '20h 47m', '45h 28m', '2g 13h', '—', '—', '—'], meta=156, win='04/10 → 12/10',
           stats=[('Coorte', '288', ''), ('Arriva in fondo', '0,0%', '0 su 288'),
                  ('Drop peggiore', '−92,7%', '267 persone · 1º allenamento finito'),
                  ('Passaggio più lungo', '20h 39m', 'verso 2º allenamento finito')])
FUNNELS = [('Default', '#9ca3af'), ('Attivazione', '#a78bfa'), ('Day 0', '#fb8b04'), ('Onboarding', '#f87171'),
           ('Premium', '#fbbf24'), ('Coach AI', '#22d3ee'), ('Workout 1', '#4361ee'), ('Workout 2', '#a78bfa'),
           ('Sprint', '#a78bfa'), ('Contacalorie', '#4ade80')]
PERIODS = ['Oggi', 'Ieri', 'Sprint 15 · dal 06/10', 'Sprint 15 · dal 04/10']


def pc(n, d, dec=1, sign=False):
    if not d: return '—'
    v = n / d * 100
    s = f'{v:.{dec}f}'.replace('.', ',')
    return ('−' if sign else '') + s + '%'


def share(D, i): return D['n'][i] / D['n'][0] * 100


def loss(D, i):
    """(perdita % sulla coorte, persone perse, % sul passo prima oppure None)"""
    if i == 0: return None
    lost = D['n'][i - 1] - D['n'][i]
    if lost <= 0: return None
    rel = None if i == 1 else pc(lost, D['n'][i - 1], sign=True) + f" di {D['n'][i-1]}"
    return pc(lost, D['n'][0], sign=True), f'−{lost}', rel


# ── tema Notte (pagina Stats) ────────────────────────────────────────────────
BG, CARD, BD, HAIR, SH = '#0f1115', '#1a1d24', '#2a2e37', '#23262e', '0 3px 0 #050608'
TX, MU, BLUE, BLUEBG, ORANGE, RED = '#ffffff', '#9ca3af', '#4361ee', '#262d45', '#fb8b04', '#f87171'
FN = 'Nunito, system-ui, sans-serif'
HATCH = 'repeating-linear-gradient(-55deg, transparent 0 5px, rgba(248,113,113,.34) 5px 7px)'
PILL = f'font-size: 13px; font-weight: 700; padding: 6px 12px; border-radius: 50px; background: {CARD}; border: 1.5px solid {BD}; box-shadow: 0 2px 0 #050608; white-space: nowrap; color: {TX}; box-sizing: border-box; height: 34px; line-height: 19px'
CARDS = f'background: {CARD}; border: 1.5px solid {BD}; border-radius: 14px; box-shadow: {SH}; box-sizing: border-box'
CHEV = '<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5 L5 6.5 L8 3.5" fill="none" stroke="#9ca3af" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>'
GEAR = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h8M16 18h4"></path><circle cx="16" cy="6" r="2"></circle><circle cx="8" cy="12" r="2"></circle><circle cx="14" cy="18" r="2"></circle></svg>'
PTR = '<svg width="22" height="26" viewBox="0 0 22 26" aria-hidden="true"><path d="M2 2 L2 20 L7 15.5 L10.5 23.5 L13.8 22 L10.4 14.2 L17 14 Z" fill="#ffffff" stroke="#050608" stroke-width="1.6" stroke-linejoin="round"></path></svg>'


def dot(c, s=8): return f'<span style="width: {s}px; height: {s}px; border-radius: 50%; background: {c}; flex-shrink: 0; display: inline-block"></span>'


def sw(a, b, morph, align='right'):
    if not morph or a == b: return a
    return (f'<span style="display: inline-grid"><span style="grid-area: 1 / 1; text-align: {align}; opacity: {H("sa.o")}">{a}</span>'
            f'<span style="grid-area: 1 / 1; text-align: {align}; opacity: {H("sb.o")}">{b}</span></span>')


def sidebar(h):
    items = ['Stats', 'Overview', 'Funnel', 'Retention', 'Sprint', 'Premium', 'AI Coach', 'Comportamento']
    nav = ''.join(
        f'<div style="display: flex; align-items: center; gap: 10px; height: 34px; padding: 0 12px; border-radius: 8px; font-size: 13px; '
        f'font-family: Inter, sans-serif; color: {"#a78bfa" if x == "Funnel" else "#7070a0"}; background: {"#1e1030" if x == "Funnel" else "transparent"}; font-weight: {600 if x == "Funnel" else 500}">'
        f'<span style="width: 14px; height: 14px; border-radius: 4px; border: 1.5px solid currentColor; box-sizing: border-box; opacity: .7"></span>{x}</div>' for x in items)
    return (f'<div style="position: absolute; left: 0; top: 0; width: 220px; height: {h}px; background: #111118; border-right: 1px solid #252535; box-sizing: border-box; padding: 22px 12px; font-family: Inter, sans-serif">'
            f'<div style="padding: 0 8px; font-family: JetBrains Mono, monospace; font-size: 17px; font-weight: 600; color: #e8e8f0">Hype<span style="color: #a78bfa">move</span></div>'
            f'<div style="padding: 2px 8px 0; font-size: 10px; letter-spacing: 1px; color: #7070a0">KPI</div>'
            f'<div style="padding: 26px 8px 8px; font-size: 10px; letter-spacing: 1px; color: #4a4a68">KPI</div><div style="display: flex; flex-direction: column; gap: 4px">{nav}</div>'
            f'<div style="padding: 18px 8px 8px; font-size: 10px; letter-spacing: 1px; color: #4a4a68">MARKETING</div>'
            f'<div style="display: flex; align-items: center; gap: 10px; height: 34px; padding: 0 12px; font-size: 13px; color: #7070a0"><span style="width: 14px; height: 14px; border-radius: 4px; border: 1.5px solid currentColor; box-sizing: border-box; opacity: .7"></span>Meta ADS</div></div>')


def mtop():
    return (f'<div style="position: absolute; left: 0; top: 0; width: 390px; height: 56px; box-sizing: border-box; background: #0a0a0f; border-bottom: 1px solid #252535; display: flex; align-items: center; gap: 12px; padding: 0 14px; z-index: 5">'
            f'<div style="width: 34px; height: 34px; border-radius: 8px; border: 1px solid #333345; box-sizing: border-box; display: flex; align-items: center; justify-content: center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e8e8f0" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"></path></svg></div>'
            f'<div style="font-family: JetBrains Mono, monospace; font-size: 16px; font-weight: 600; color: #e8e8f0; flex: 1">Hype<span style="color: #a78bfa">move</span></div>'
            f'<div style="font-family: Inter, sans-serif; font-size: 12px; color: #7070a0">Funnel</div></div>')


def seg(opts, on, on2=None, morph=False, h=34):
    """Gruppo di pillole: on = attiva, on2 = attiva dopo il tocco (solo morph)."""
    out = ''
    for i, o in enumerate(opts):
        live = '' if o != PERIODS[2] else dot(ORANGE, 7)
        bgA = f'<span style="position: absolute; inset: 0; border-radius: 50px; background: {BLUEBG}; border: 1.5px solid {BLUE}; box-sizing: border-box; opacity: {H("sa.o") if morph else 1}"></span>' if i == on else ''
        bgB = f'<span style="position: absolute; inset: 0; border-radius: 50px; background: {BLUEBG}; border: 1.5px solid {BLUE}; box-sizing: border-box; opacity: {H("sb.o")}"></span>' if (morph and i == on2) else ''
        col = TX if i in (on, on2) else MU
        out += (f'<div style="position: relative; height: {h - 6}px; padding: 0 12px; display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; color: {col}; white-space: nowrap; flex-shrink: 0">'
                f'{bgA}{bgB}<span style="position: relative; display: flex; align-items: center; gap: 6px">{live}{o}</span></div>')
    return f'<div style="display: flex; padding: 3px; border-radius: 50px; background: {BG}; border: 1.5px solid {BD}; box-sizing: border-box; height: {h}px; flex-shrink: 0">{out}</div>'


def meta_refresh(short=False):
    return (f'<div style="font-size: 13px; font-weight: 600; color: {MU}; white-space: nowrap">{"14:07" if short else "calcolato alle 14:07"}</div>'
            f'<div style="{PILL}">Aggiorna</div>')


def modeseg():
    return (f'<div style="display: flex; padding: 3px; border-radius: 50px; background: {BG}; border: 1.5px solid {BD}; height: 32px; box-sizing: border-box; flex-shrink: 0">'
            f'<div style="padding: 0 12px; border-radius: 50px; background: {BLUE}; color: #fff; font-size: 13px; font-weight: 700; line-height: 23px">Coorte</div>'
            f'<div style="padding: 0 12px; color: {MU}; font-size: 13px; font-weight: 700; line-height: 23px">Volumi</div></div>')


def excl_pill():
    return f'<span style="display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 50px; border: 1.5px solid {BD}; font-size: 12.5px; font-weight: 700; color: {TX}; box-sizing: border-box">{GEAR}89 esclusi</span>'


def stat_inline(D, morph=False, cmp=False, gap=48):
    out = ''
    for k, (l, v, s) in enumerate(D['stats']):
        col = RED if k == 2 else ORANGE if k == 3 else TX
        pv, ps = PRV['stats'][k][1], PRV['stats'][k][2]
        sub = sw(s, ps, morph, 'left') if s else ''
        prima = f'<div style="font-size: 12.5px; font-weight: 700; color: {ORANGE}; margin-top: 2px">prima {pv}</div>' if cmp else ''
        out += (f'<div style="min-width: 0"><div style="font-size: 13px; font-weight: 700; color: {MU}">{l}</div>'
                f'<div style="font-size: 28px; font-weight: 800; line-height: 34px; color: {col}; white-space: nowrap">{sw(v, pv, morph, "left")}</div>'
                f'<div style="font-size: 13px; font-weight: 600; color: {MU}; white-space: nowrap; min-height: 18px">{sub}</div>{prima}</div>')
    return f'<div style="display: flex; gap: {gap}px">{out}</div>'


def stat_cards(D, morph, cols=4, w=None, hh=112, small=False):
    out = ''
    for k, (l, v, s) in enumerate(D['stats']):
        col = RED if k == 2 else ORANGE if k == 3 else TX
        pv, ps = PRV['stats'][k][1], PRV['stats'][k][2]
        if small: s, ps = s.replace(' · 1º allenamento finito', '').replace('verso 1º allenamento finito', 'verso il 1º'), ps.replace(' · 1º allenamento finito', '').replace('verso 2º allenamento finito', 'verso il 2º')
        out += (f'<div style="{CARDS}; height: {hh}px; padding: {"14px 18px" if small else "16px 20px"}; min-width: 0">'
                f'<div style="font-size: 13px; font-weight: 700; color: {MU}; white-space: nowrap">{l}</div>'
                f'<div style="font-size: {26 if small else 28}px; font-weight: 800; line-height: 36px; color: {col}; white-space: nowrap">{sw(v, pv, morph, "left")}</div>'
                f'<div style="font-size: 12.5px; font-weight: 600; color: {MU}; white-space: nowrap; overflow: hidden">{sw(s, ps, morph, "left") if s else ""}</div></div>')
    return f'<div style="display: grid; grid-template-columns: repeat({cols}, minmax(0, 1fr)); gap: {12 if small else 16}px">{out}</div>'


def losstag(L, o=None):
    if not L: return ''
    op = f'; opacity: {H(o)}' if o else ''
    rel = f'<span style="color: {MU}; font-weight: 600; padding-left: 8px; border-left: 1px solid {BD}">{L[2]}</span>' if L[2] else ''
    return (f'<div style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); display: flex; align-items: center; gap: 8px; height: 24px; padding: 0 10px; border-radius: 50px; background: {CARD}; border: 1px solid rgba(248,113,113,.45); font-size: 12.5px; font-weight: 800; color: {RED}; white-space: nowrap{op}">'
            f'{L[0]}<span style="color: {MU}; font-weight: 700">{L[1]}</span>{rel}</div>')


def track(i, morph, cmp, hgt=36):
    ghost = f'<div style="position: absolute; left: 0; top: 0; bottom: 0; width: {H("w.g%d" % i)}; background: {HATCH}"></div>' if i else ''
    lt = (losstag(loss(CUR, i), 'sa.o') + losstag(loss(PRV, i), 'sb.o')) if morph else losstag(loss(CUR, i))
    mark = ''
    if cmp and i:
        mark = (f'<div style="position: absolute; left: {share(PRV, i):.2f}%; top: -3px; bottom: -3px; width: 3px; margin-left: -1.5px; border-radius: 2px; background: {ORANGE}; opacity: {H("mk.o")}; transform: {H("mk.tf")}"></div>')
    return (f'<div style="position: relative; height: {hgt}px"><div style="position: absolute; inset: 0; background: {BG}; border-radius: 8px; overflow: hidden">{ghost}'
            f'<div style="position: absolute; left: 0; top: 0; bottom: 0; width: {H("w.b%d" % i)}; background: {BLUE}; border-radius: 8px"></div>{lt}</div>{mark}</div>')


def rows_d(morph=False, cmp=False, lab=250):
    cols = f'{lab}px minmax(0, 1fr) 76px 76px' + (' 118px' if cmp else '') + ' 92px 92px'
    hd = lambda t, a='right': f'<div style="text-align: {a}">{t}</div>'
    head = (f'<div style="display: grid; grid-template-columns: {cols}; column-gap: 20px; align-items: end; height: 30px; padding-bottom: 8px; box-sizing: border-box; font-size: 12.5px; font-weight: 700; color: {MU}">'
            + hd('Passo', 'left') + '<div></div>' + hd('persone') + hd('del totale') + (hd(f'<span style="color: {ORANGE}">sprint prima</span>') if cmp else '') + hd('passaggio') + hd('da inizio') + '</div>')
    out = ''
    for i, s in enumerate(STEPS):
        z = CUR['n'][i] == 0 and not morph
        c1 = MU if z else TX
        var = f'<span style="color: {MU}; font-weight: 600; font-size: 12.5px"> · {VAR[i]}</span>' if i in VAR else ''
        dcell = ''
        if cmp:
            d = share(CUR, i) - share(PRV, i)
            ds = '' if (i == 0 or abs(d) < 0.05) else f'<span style="color: {MU}; font-weight: 600; font-size: 12px"> {"+" if d > 0 else "−"}{abs(d):.1f} pt</span>'.replace('.', ',')
            dcell = f'<div style="text-align: right; font-size: 14px; font-weight: 800; color: {ORANGE}; white-space: nowrap">{pc(PRV["n"][i], PRV["n"][0])}{ds}</div>'
        out += (f'<div style="display: grid; grid-template-columns: {cols}; column-gap: 20px; align-items: center; height: 54px; border-top: 1px solid {HAIR}; opacity: {H("r%d.o" % i)}; transform: {H("r%d.tf" % i)}">'
                f'<div style="font-size: 15px; font-weight: 700; color: {c1}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{s}{var}</div>'
                f'{track(i, morph, cmp)}'
                f'<div style="text-align: right; font-size: 17px; font-weight: 800; color: {c1}">{sw(str(CUR["n"][i]), str(PRV["n"][i]), morph)}</div>'
                f'<div style="text-align: right; font-size: 15px; font-weight: 700; color: {c1}">{sw(pc(CUR["n"][i], CUR["n"][0]), pc(PRV["n"][i], PRV["n"][0]), morph)}</div>{dcell}'
                f'<div style="text-align: right; font-size: 14px; font-weight: 700; color: {TX if CUR["pas"][i] != "—" or morph else MU}; white-space: nowrap">{sw(CUR["pas"][i], PRV["pas"][i], morph)}</div>'
                f'<div style="text-align: right; font-size: 14px; font-weight: 600; color: {MU}; white-space: nowrap">{sw(CUR["cum"][i], PRV["cum"][i], morph)}</div></div>')
    return head + out


def rows_m(morph=False, cmp=False):
    out = ''
    for i, s in enumerate(STEPS):
        z = CUR['n'][i] == 0 and not morph
        c1 = MU if z else TX
        var = f'<span style="color: {MU}; font-weight: 600; font-size: 12px"> · {VAR[i]}</span>' if i in VAR else ''
        t = ''
        if CUR['pas'][i] != '—' or (morph and PRV['pas'][i] != '—'):
            a = f'passaggio {CUR["pas"][i]} · da inizio {CUR["cum"][i]}' if CUR['pas'][i] != '—' else ''
            b = f'passaggio {PRV["pas"][i]} · da inizio {PRV["cum"][i]}'
            t = f'<div style="font-size: 12.5px; font-weight: 600; color: {MU}; margin-top: 6px; white-space: nowrap">{sw(a, b, morph, "left")}</div>'
        pr = f'<span style="color: {ORANGE}; font-weight: 800; font-size: 13px; margin-left: 8px">prima {pc(PRV["n"][i], PRV["n"][0])}</span>' if cmp and i else ''
        out += (f'<div style="padding: 12px 0; border-top: 1px solid {HAIR}; opacity: {H("r%d.o" % i)}; transform: {H("r%d.tf" % i)}">'
                f'<div style="display: flex; align-items: baseline; justify-content: space-between; gap: 8px; margin-bottom: 8px"><div style="font-size: 15px; font-weight: 700; color: {c1}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0">{s}{var}</div>'
                f'<div style="white-space: nowrap; flex-shrink: 0"><span style="font-size: 17px; font-weight: 800; color: {c1}">{sw(str(CUR["n"][i]), str(PRV["n"][i]), morph)}</span>'
                f'<span style="font-size: 14px; font-weight: 700; color: {MU}; margin-left: 8px">{sw(pc(CUR["n"][i], CUR["n"][0]), pc(PRV["n"][i], PRV["n"][0]), morph)}</span>{pr}</div></div>'
                f'{track(i, morph, cmp, 30)}{t}</div>')
    return out


def card_head(caption_extra='', morph=False, m=False):
    cap = sw(f'{CUR["win"]} · 133 persone', f'{PRV["win"]} · 288 persone', morph, 'left')
    return (f'<div style="display: flex; align-items: {"flex-start" if m else "center"}; justify-content: space-between; gap: 12px">'
            f'<div style="min-width: 0"><div style="font-size: {17 if m else 20}px; font-weight: 800; line-height: 26px">Workout 1</div>'
            f'<div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 4px; font-size: 13px; font-weight: 600; color: {MU}; white-space: nowrap">{cap}{excl_pill()}{caption_extra}</div></div>'
            f'{modeseg()}</div>')


def ctx_line(morph=False):
    return (f'<div style="margin-top: 14px; padding-top: 14px; border-top: 1px solid {HAIR}; font-size: 13px; font-weight: 600; color: {MU}">Installazioni da Meta Ads '
            f'<span style="color: {TX}; font-weight: 800">{sw("86", "156", morph, "left")}</span></div>')


def collapsed(title, w=None):
    return (f'<div style="{CARDS}; height: 56px; padding: 0 24px; display: flex; align-items: center; justify-content: space-between">'
            f'<div style="font-size: 15px; font-weight: 800">{title}</div>{CHEV}</div>')


def menu(x, y, w=250, anchor='left'):
    its = ''.join(
        f'<div style="display: flex; align-items: center; gap: 10px; height: 36px; padding: 0 10px; border-radius: 10px; font-size: 13px; font-weight: 700; background: {BLUEBG if n == "Workout 1" else "transparent"}">{dot(c)}{n}</div>'
        for n, c in FUNNELS)
    return (f'<div style="position: absolute; left: {x}px; top: {y}px; width: {w}px; padding: 6px; background: {CARD}; border: 1.5px solid {BD}; border-radius: 14px; box-shadow: 0 3px 0 #050608, 0 12px 32px rgba(0,0,0,.5); box-sizing: border-box; z-index: 8; opacity: {H("mn.o")}; transform: {H("mn.tf")}; transform-origin: top {anchor}">'
            f'{its}<div style="height: 1px; background: {HAIR}; margin: 6px 4px"></div>'
            f'<div style="height: 36px; padding: 0 10px; display: flex; align-items: center; font-size: 13px; font-weight: 700; color: {MU}">Modifica i passi</div>'
            f'<div style="height: 36px; padding: 0 10px; display: flex; align-items: center; font-size: 13px; font-weight: 700; color: {MU}">Salva come nuovo</div></div>')


def funnel_pill():
    return f'<div style="{PILL}; display: flex; align-items: center; gap: 8px">{dot(BLUE)}Workout 1{CHEV}</div>'


def other_pill(): return f'<div style="{PILL}; display: flex; align-items: center; gap: 8px; color: {MU}">Altro periodo{CHEV}</div>'


# ── runtime dell'animazione ──────────────────────────────────────────────────
JS = r"""
class Component extends DCLogic {
  componentDidMount() {
    if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.t0 = performance.now();
    const loop = () => { this.forceUpdate(); this.raf = requestAnimationFrame(loop); };
    this.raf = requestAnimationFrame(loop);
  }
  componentWillUnmount() { cancelAnimationFrame(this.raf); }
  renderVals() {
    const K = __K__;
    const P = K.P;
    const t = this.t0 ? ((performance.now() - this.t0) / 1000) % P : K.rm;
    const cl = (x) => Math.max(0, Math.min(1, x));
    const p = (a, d) => cl((t - a) / d);
    const out = (x) => 1 - Math.pow(1 - x, 3);
    const inout = (x) => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    const pop = (x) => x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.exp(-6 * x) * Math.cos(9 * x);
    const f = (x, d) => x.toFixed(d === undefined ? 3 : d);
    const ent = (a) => { const k = out(p(a, 0.5)); return { o: f(k), tf: 'translateY(' + f(12 * (1 - k), 1) + 'px)' }; };
    const path = (kf) => { let v = kf[0].slice(1); for (let i = 1; i < kf.length; i++) { const k = inout(p(kf[i - 1][0], kf[i][0] - kf[i - 1][0])); v = v.map((a, j) => kf[i - 1][j + 1] + (kf[i][j + 1] - kf[i - 1][j + 1]) * (t >= kf[i - 1][0] ? k : 0)); if (t < kf[i][0]) break; } return v; };
    const win = (w) => Math.min(pop(p(w[0], 0.45)), 1 - p(w[1], 0.2));
    const V = { veil: f(Math.max(1 - p(0, 0.2), p(P - 0.3, 0.3))) };
    Object.keys(K.ents).forEach((n) => { V[n] = ent(K.ents[n]); });
    const m = K.morph == null ? 0 : inout(p(K.morph, 0.7));
    V.sa = { o: f(1 - cl(m * 2)) }; V.sb = { o: f(cl(m * 2 - 1)) };
    V.w = {};
    K.bars.forEach((b, i) => {
      const g = out(p(K.barT + i * 0.07, 0.9));
      const cur = (b[0] + (b[1] - b[0]) * m) * g;
      V.w['b' + i] = f(cur, 2) + '%';
      if (i) { const pb = K.bars[i - 1]; V.w['g' + i] = f((pb[0] + (pb[1] - pb[0]) * m) * out(p(K.barT + (i - 1) * 0.07, 0.9)), 2) + '%'; }
      V['r' + i] = ent(K.rowT + i * 0.05);
    });
    const mk = pop(p(K.mark == null ? 99 : K.mark, 0.6));
    V.mk = { o: f(cl(mk)), tf: 'scaleY(' + f(mk) + ')' };
    Object.keys(K.wins).forEach((n) => { const k = win(K.wins[n]); V[n] = { o: f(cl(k)), tf: (K.slide && K.slide[n]) ? 'translateX(' + f(K.slide[n] * (1 - cl(k)), 1) + 'px)' : 'scale(' + f(0.96 + 0.04 * k) + ')' }; });
    const pt = K.ptr ? path(K.ptr) : [0, 0];
    V.pt = { x: f(pt[0], 1) + 'px', y: f(pt[1], 1) + 'px', o: K.ptr ? 1 : 0 };
    (K.taps || []).forEach((tp, i) => { const k = p(tp[0], 0.45); V['tp' + i] = { x: (tp[1] - 40) + 'px', y: (tp[2] - 40) + 'px', o: k > 0 && k < 1 ? f(0.3 * (1 - k)) : 0, tf: 'scale(' + f(0.4 + 0.8 * out(k)) + ')' }; });
    const sc = K.scroll ? path(K.scroll) : [0];
    V.sc = 'translate(' + f(K.scrollX ? sc[0] : 0, 1) + 'px, ' + f(K.scrollX ? 0 : sc[0], 1) + 'px)';
    if (K.sw) { const k = inout(p(K.sw, 0.3)); V.ta = { o: f(1 - k) }; V.tb = { o: f(k) }; }
    return V;
  }
}
"""


def board(name, title, w, h, body, K, bg=BG, font=FN, fonts='n', tapc='#ffffff'):
    K.setdefault('ents', {}); K.setdefault('wins', {}); K.setdefault('bars', [[0, 0]] * 8)
    K.setdefault('barT', 0.8); K.setdefault('rowT', 0.5); K.setdefault('morph', None); K.setdefault('mark', None); K.setdefault('rm', K['P'] * 0.6)
    links = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@500;600;700;800&amp;display=swap">'
    if fonts == 'o' or True:
        links += '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=JetBrains+Mono:wght@400;600&amp;display=swap">'
    taps = ''.join(
        f'<div style="position: absolute; left: {H("tp%d.x" % i)}; top: {H("tp%d.y" % i)}; width: 80px; height: 80px; border-radius: 50%; background: {tapc}; opacity: {H("tp%d.o" % i)}; transform: {H("tp%d.tf" % i)}; pointer-events: none; z-index: 20"></div>'
        for i in range(len(K.get('taps', []))))
    ptr = f'<div style="position: absolute; left: {H("pt.x")}; top: {H("pt.y")}; opacity: {H("pt.o")}; pointer-events: none; z-index: 21">{PTR}</div>' if K.get('ptr') else ''
    html = f"""<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<title>{title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
{links}
<style>
body{{margin:0;background:{bg}}}
</style>
</helmet>
<div style="width: {w}px; height: {h}px; position: relative; overflow: hidden; box-sizing: border-box; background: {bg}; color: {TX}; font-family: {font}; line-height: 1.3">
{body}
{taps}{ptr}
<div style="position: absolute; inset: 0; background: {bg}; opacity: {H('veil')}; pointer-events: none; z-index: 30"></div>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":{w},"height":{h}}}}}'>{JS.replace('__K__', json.dumps(K))}</script>
</body>
</html>
"""
    open(f'{OUT}/{name}', 'w').write(html)
    return name, title, w, h


BARS_CUR = [[share(CUR, i)] * 2 for i in range(8)]
BARS_MORPH = [[share(CUR, i), share(PRV, i)] for i in range(8)]
DW, DH = 1440, 920
CX, CW = 252, 1156   # colonna del contenuto accanto alla barra laterale


# ── FILA «OGGI» ──────────────────────────────────────────────────────────────
def oggi_rows(m=False):
    MONO = 'JetBrains Mono, monospace'
    out = ''
    for i, s in enumerate(STEPS):
        n = CUR['n'][i]
        L = loss(CUR, i)
        tag = ''
        if L:
            rel = f'<span style="font-size: 10px; color: rgba(252,165,165,.7); padding-left: 8px; border-left: 1px solid rgba(248,113,113,.3)">{L[2].replace(",", ".")}</span>' if L[2] else ''
            tag = (f'<div style="position: absolute; right: {6 if m else 10}px; top: 50%; transform: translateY(-50%); display: flex; align-items: center; gap: 8px; padding: 4px 9px; border-radius: 5px; background: rgba(10,10,15,.82); border: 1px solid rgba(248,113,113,.42); font-family: {MONO}; font-size: 11px; font-weight: 600; color: #f87171; white-space: nowrap">{L[0].replace(",", ".")}<span style="color: rgba(252,165,165,.66)">{L[1]}</span>{rel}</div>')
        ghost = f'<div style="position: absolute; left: 0; top: 0; bottom: 0; width: {H("w.g%d" % i)}; background: repeating-linear-gradient(-55deg, transparent 0 5px, rgba(248,113,113,.38) 5px 7px)"></div>' if i else ''
        chev = '<span style="color: #7070a0; font-size: 10px; margin-right: 6px">▸</span>' if i in VAR else ''
        var = f'<span style="color: #7070a0; font-size: 11px"> · {VAR[i]}</span>' if i in VAR else ''
        cols = '118px 24px 1fr 62px' if m else '250px 1fr 96px 96px'
        out += (f'<div style="display: grid; grid-template-columns: {cols}; column-gap: {12 if m else 18}px; align-items: start; padding: {"14px 0" if m else "10px 0"}; min-height: {54 if m else 55}px; box-sizing: border-box; border-bottom: 1px solid #1c1c2a">'
                f'<div style="font-size: 12.5px; color: #e8e8f0; line-height: 1.35; padding-top: 2px">{chev}{s}{var}</div>'
                f'<div style="position: relative; height: 34px; background: #1a1a24; border-radius: 6px; overflow: hidden">{ghost}<div style="position: absolute; left: 0; top: 0; bottom: 0; width: {H("w.b%d" % i)}; background: linear-gradient(90deg, #7c3aed, #a78bfa); border-radius: 6px"></div>{tag}</div>'
                f'<div style="text-align: right; font-family: {MONO}"><div style="font-size: 13px; font-weight: 600; color: #e8e8f0">{n}</div><div style="font-size: 10.5px; color: #7070a0">{pc(n, CUR["n"][0]).replace(",", ".")}</div></div>'
                f'<div style="text-align: right; font-family: {MONO}"><div style="font-size: 12px; font-weight: 600; color: {"#e8e8f0" if CUR["pas"][i] != "—" else "#4a4a68"}">{CUR["pas"][i]}</div><div style="font-size: 10.5px; color: #7070a0">{CUR["cum"][i]}</div></div></div>')
    return out


def oggi_stats(m=False):
    MONO = 'JetBrains Mono, monospace'
    S = [('COORTE', '133', '', '#e8e8f0'), ('ARRIVA IN FONDO', '0.0%', '0 su 133', '#e8e8f0'),
         ('DROP PEGGIORE', '−93.2%', '124 persone · 1º allenamento finito', '#f87171'),
         ('PASSAGGIO PIÙ LUNGO', '19m 6s', 'verso 1º allenamento finito', '#fbbf24')]
    out = ''.join(
        f'<div><div style="font-size: 9.5px; font-weight: 600; letter-spacing: .8px; color: #7070a0">{l}</div>'
        f'<div style="font-family: {MONO}; font-size: 19px; font-weight: 600; color: {c}; white-space: nowrap">{v}<span style="font-family: Inter, sans-serif; font-size: 11.5px; font-weight: 400; color: #7070a0; margin-left: 8px">{s}</span></div></div>'
        for l, v, s, c in S)
    return f'<div style="display: flex; gap: {24 if m else 40}px; flex-wrap: wrap; margin: 16px 0 20px">{out}</div>'


OTABS = ['Default', 'funnel onboarding', 'Attivazione', 'Day 0', 'Onboarding', 'Premium', 'Coach AI', 'Workout 1', 'Workout 2', 'Sprint', 'Contacalorie']


def oggi_tabs(wrap=False):
    out = ''
    for t in OTABS:
        on = t == 'Workout 1'
        ic = '' if t == 'Default' else '<span style="width: 13px; height: 13px; border-radius: 3px; border: 1.5px solid currentColor; box-sizing: border-box; opacity: .8"></span>'
        out += (f'<div style="display: flex; align-items: center; gap: 7px; padding: {"9px 12px" if wrap else "10px 14px"}; font-size: 12.5px; color: {"#60a5fa" if on else "#7070a0"}; font-weight: {600 if on else 500}; white-space: nowrap; '
                f'border-bottom: 2px solid {"#60a5fa" if on else "transparent"}; flex-shrink: 0">{ic}{t}</div>')
    act = ('<div style="display: flex; gap: 6px; margin-left: 12px; flex-shrink: 0"><div style="padding: 7px 11px; border: 1px solid #252535; border-radius: 7px; font-size: 11px; color: #7070a0; white-space: nowrap">+ Salva</div>'
           '<div style="padding: 7px 11px; border: 1px solid #252535; border-radius: 7px; font-size: 11px; color: #7070a0; white-space: nowrap">Modifica</div></div>')
    return out + act


def oggi_strip(m=False):
    sg = ''.join(f'<div style="padding: 5px 13px; font-size: 12px; color: #7070a0">{x}</div>' for x in ['Oggi', 'Settimana', 'Mese'])
    date = lambda d: f'<div style="padding: 6px 10px; border: 1px solid #333345; border-radius: 7px; font-family: JetBrains Mono, monospace; font-size: 11.5px; color: #e8e8f0; white-space: nowrap">{d}</div>'
    return (f'<div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap; padding: 10px 14px; background: #111118; border: 1px solid #252535; border-top: 0; border-radius: 0 0 10px 10px">'
            f'<div style="display: flex; border: 1px solid #333345; border-radius: 7px">{sg}</div>'
            f'<div style="padding: 6px 10px; border: 1px solid #a78bfa; border-radius: 7px; font-size: 12px; color: #e8e8f0; white-space: nowrap">sprint 15 ottimizzazione post onboarding ▾</div>'
            f'<div style="display: flex; align-items: center; gap: 8px">{date("06/10/2026")}<span style="color: #4a4a68">→</span>{date("13/10/2026")}</div>'
            f'<div style="margin-left: auto; padding: 7px 18px; border-radius: 7px; background: #7c3aed; color: #fff; font-size: 12px; font-weight: 600">Calcola</div></div>')


def oggi_card(m=False):
    return (f'<div style="background: #111118; border: 1px solid #252535; border-radius: 10px; padding: {"16px" if m else "20px"}; margin-top: 16px">'
            f'<div style="display: flex; align-items: center; justify-content: space-between"><div style="font-size: 11px; font-weight: 600; letter-spacing: .8px; color: #7070a0">FUNNEL ONBOARDING</div>'
            f'<div style="display: flex; border: 1px solid #333345; border-radius: 7px; overflow: hidden"><div style="padding: 5px 14px; background: #7c3aed; color: #fff; font-size: 12px; font-weight: 600">Coorte</div><div style="padding: 5px 14px; color: #7070a0; font-size: 12px">Volumi</div></div></div>'
            f'{oggi_stats(m)}'
            f'<div style="display: grid; grid-template-columns: {"118px 24px 1fr 62px" if m else "250px 1fr 96px 96px"}; column-gap: {12 if m else 18}px; padding-bottom: 8px; border-bottom: 1px solid #252535; font-size: 9.5px; font-weight: 600; letter-spacing: .6px; color: #7070a0"><div>STEP</div><div></div><div style="text-align: right">UTENTI<br>DEL TOTALE</div><div style="text-align: right">PASSAGGIO<br>DA INIZIO</div></div>'
            f'{oggi_rows(m)}'
            f'<div style="display: flex; gap: 18px; flex-wrap: wrap; padding-top: 14px; font-size: 11px; color: #7070a0"><span>Install Google Play <b style="color: #e8e8f0; font-family: JetBrains Mono, monospace">0</b></span><span>Install Meta Ads <b style="color: #e8e8f0; font-family: JetBrains Mono, monospace">86</b></span><span style="font-size: 10px; color: #4a4a68">aggregati esterni senza identità</span></div></div>')


def oggi_closed(t):
    return (f'<div style="background: #111118; border: 1px solid #252535; border-radius: 10px; padding: 18px 20px; margin-top: 16px; display: flex; justify-content: space-between; align-items: center">'
            f'<div style="font-size: 14px; font-weight: 700; color: #e8e8f0">{t}</div><div style="font-size: 12px; color: #7070a0">▼ Apri</div></div>')


def b_oggi_desktop():
    body = (sidebar(DH) +
            f'<div style="position: absolute; left: {CX}px; top: 0; width: {CW}px; font-family: Inter, sans-serif; transform: {H("sc")}">'
            f'<div style="display: flex; align-items: flex-end; justify-content: space-between; padding-top: 28px; margin-bottom: 26px; opacity: {H("e0.o")}">'
            f'<div style="display: flex; gap: 14px; align-items: flex-start"><div style="width: 34px; height: 34px; border: 1px solid #333345; border-radius: 8px; box-sizing: border-box"></div><div><div style="font-size: 22px; font-weight: 700; color: #e8e8f0; line-height: 30px">KPI Dashboard</div><div style="font-size: 12px; color: #7070a0; margin-top: 6px">Metriche prodotto HypeMove · live da Supabase</div></div></div>'
            f'<div style="display: flex; align-items: center; gap: 10px; font-size: 11px; color: #4a4a68"><span>agg. tra 4:49</span><span>ultimo 13:53</span><div style="padding: 7px 12px; border: 1px solid #333345; border-radius: 7px; color: #7070a0; font-size: 12px">Aggiorna</div></div></div>'
            f'<div style="overflow: hidden; border-bottom: 1px solid #252535; opacity: {H("e1.o")}"><div style="display: flex; align-items: center; width: max-content; transform: {H("tabs.tf")}">{oggi_tabs()}</div></div>'
            f'<div style="opacity: {H("e1.o")}">{oggi_strip()}</div>'
            f'<div style="opacity: {H("e2.o")}; transform: {H("e2.tf")}">{oggi_card()}{oggi_closed("Confronto Sprint")}{oggi_closed("Parametri")}</div></div>')
    K = dict(P=9, ents=dict(e0=0.2, e1=0.35, e2=0.5), bars=BARS_CUR, wins={},
             ptr=[[0, 900, 520], [2.2, 900, 520], [3.0, 1300, 152], [4.6, 1010, 152], [5.4, 1010, 152], [6.6, 1330, 860], [8.7, 1330, 860]],
             scroll=[[0, 0], [5.6, 0], [6.6, -150], [8.2, -150], [8.7, 0]], tabsx=[[0, 0], [3.0, 0], [4.6, -190], [8.2, -190], [8.7, 0]])
    return K, body


def b_oggi_phone():
    body = (f'<div style="position: absolute; left: 0; top: 56px; width: 390px; padding: 14px 14px 40px; box-sizing: border-box; font-family: Inter, sans-serif; transform: {H("sc")}">'
            f'<div style="display: flex; align-items: center; gap: 10px; font-size: 11px; color: #4a4a68; margin-bottom: 12px"><span>ultimo 13:53</span><div style="padding: 9px 12px; border: 1px solid #333345; border-radius: 7px; color: #7070a0; font-size: 12px">Aggiorna</div></div>'
            f'<div style="display: flex; flex-wrap: wrap; row-gap: 2px; align-items: center">{oggi_tabs(True)}</div>'
            f'<div style="margin-top: 8px">{oggi_strip(True)}</div>{oggi_card(True)}{oggi_closed("Confronto Sprint")}{oggi_closed("Parametri")}</div>' + mtop())
    K = dict(P=9, bars=BARS_CUR, barT=3.4, scroll=[[0, 0], [1.6, 0], [3.4, -600], [5.2, -600], [6.6, -1010], [8.2, -1010], [8.7, 0]])
    return K, body


# ── DIREZIONE A — una riga sola ──────────────────────────────────────────────
def b_a_desktop():
    body = (sidebar(DH) +
            f'<div style="position: absolute; left: {CX}px; top: 28px; width: {CW}px">'
            f'<div style="display: flex; align-items: center; gap: 14px; height: 36px; opacity: {H("e0.o")}">'
            f'<div style="font-size: 28px; font-weight: 800; line-height: 36px">Funnel</div>{funnel_pill()}{seg(PERIODS, 2)}{other_pill()}<div style="flex: 1"></div>{meta_refresh()}</div>'
            f'<div style="{CARDS}; margin-top: 24px; padding: 24px; opacity: {H("e1.o")}; transform: {H("e1.tf")}">'
            f'{card_head()}<div style="margin: 22px 0 20px">{stat_inline(CUR)}</div>{rows_d()}{ctx_line()}</div>'
            f'<div style="margin-top: 16px; opacity: {H("e2.o")}">{collapsed("Confronto fra sprint")}</div></div>'
            + menu(CX + 104, 72))
    K = dict(P=8.5, ents=dict(e0=0.2, e1=0.35, e2=0.6), bars=BARS_CUR, wins=dict(mn=[3.0, 6.6]),
             ptr=[[0, 980, 600], [1.9, 980, 600], [2.8, 430, 40], [3.6, 430, 40], [4.4, 430, 360], [5.4, 430, 396], [6.4, 430, 396], [7.4, 700, 500], [8.5, 700, 500]])
    return K, body


def phone_head_a():
    return (f'<div style="display: flex; align-items: center; gap: 10px; opacity: {H("e0.o")}">{funnel_pill()}<div style="flex: 1"></div>{meta_refresh(True)}</div>'
            f'<div style="margin: 12px -16px 0; padding: 0 16px; overflow: hidden; opacity: {H("e0.o")}"><div style="display: flex; gap: 8px; width: max-content">{seg(PERIODS, 2)}{other_pill()}</div></div>')


def phone_card(morph=False, cmp=False, stats=True):
    st = f'<div style="margin: 16px 0 6px">{stat_cards(CUR, morph, 2, hh=98, small=True)}</div>' if stats else ''
    cap = sw(f'{CUR["win"]} · 133 persone', f'{PRV["win"]} · 288 persone', morph, 'left')
    return (f'<div style="margin-top: 16px; opacity: {H("e1.o")}; transform: {H("e1.tf")}">'
            f'<div style="display: flex; align-items: center; justify-content: space-between; gap: 8px"><div style="font-size: 20px; font-weight: 800; line-height: 26px">Workout 1</div>{modeseg()}</div>'
            f'<div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 6px; font-size: 13px; font-weight: 600; color: {MU}; white-space: nowrap">{cap}{excl_pill()}</div>'
            f'{st}<div style="{CARDS}; margin-top: 12px; padding: 4px 16px 14px">{rows_m(morph, cmp)}{ctx_line(morph)}</div>'
            f'<div style="margin-top: 12px">{collapsed("Confronto fra sprint")}</div></div>')


def b_a_phone():
    body = (f'<div style="position: absolute; left: 0; top: 56px; width: 390px; padding: 16px 16px 40px; box-sizing: border-box; transform: {H("sc")}">{phone_head_a()}{phone_card()}</div>'
            + mtop() + menu(16, 114, 250))
    K = dict(P=9, ents=dict(e0=0.2, e1=0.35), bars=BARS_CUR, wins=dict(mn=[2.2, 4.2]), taps=[[2.0, 86, 89], [4.0, 300, 600]],
             scroll=[[0, 0], [4.6, 0], [6.4, -560], [8.2, -560], [8.7, 0]])
    return K, body


# ── DIREZIONE B — elenco a sinistra ──────────────────────────────────────────
def rail():
    its = ''.join(
        f'<div style="display: flex; align-items: center; gap: 10px; height: 40px; padding: 0 12px; border-radius: 10px; font-size: 14px; font-weight: 700; color: {TX if n == "Workout 1" else MU}; background: {BLUEBG if n == "Workout 1" else "transparent"}; border: 1.5px solid {BLUE if n == "Workout 1" else "transparent"}; box-sizing: border-box">{dot(c)}{n}</div>'
        for n, c in FUNNELS)
    return (f'<div style="{CARDS}; padding: 8px; display: flex; flex-direction: column; gap: 2px">{its}'
            f'<div style="height: 1px; background: {HAIR}; margin: 8px 4px"></div>'
            f'<div style="height: 40px; padding: 0 12px; display: flex; align-items: center; font-size: 14px; font-weight: 700; color: {MU}">Modifica i passi</div>'
            f'<div style="height: 40px; padding: 0 12px; display: flex; align-items: center; font-size: 14px; font-weight: 700; color: {MU}">Nuovo funnel</div></div>')


def b_b_desktop():
    RW = 208
    body = (sidebar(DH) +
            f'<div style="position: absolute; left: {CX}px; top: 28px; width: {RW}px; opacity: {H("e0.o")}"><div style="font-size: 28px; font-weight: 800; line-height: 36px; height: 36px">Funnel</div><div style="margin-top: 24px">{rail()}</div></div>'
            f'<div style="position: absolute; left: {CX + RW + 24}px; top: 28px; width: {CW - RW - 24}px">'
            f'<div style="display: flex; align-items: center; gap: 12px; height: 36px; opacity: {H("e0.o")}">{seg(PERIODS, 2, 3, True)}{other_pill()}<div style="flex: 1"></div>{meta_refresh()}</div>'
            f'<div style="margin-top: 24px; opacity: {H("e1.o")}; transform: {H("e1.tf")}">{stat_cards(CUR, True, small=True, hh=104)}</div>'
            f'<div style="{CARDS}; margin-top: 16px; padding: 24px; opacity: {H("e2.o")}; transform: {H("e2.tf")}">{card_head(morph=True)}<div style="height: 14px"></div>{rows_d(True, lab=232)}{ctx_line(True)}</div></div>')
    K = dict(P=9, ents=dict(e0=0.2, e1=0.35, e2=0.5), bars=BARS_MORPH, morph=4.0, wins={},
             ptr=[[0, 1000, 640], [2.6, 1000, 640], [3.6, 800, 50], [6.0, 800, 50], [7.2, 1000, 560], [9, 1000, 560]])
    return K, body


def b_b_phone():
    chips = ''.join(
        f'<div style="display: flex; align-items: center; gap: 8px; height: 36px; padding: 0 14px; border-radius: 50px; font-size: 13px; font-weight: 700; white-space: nowrap; color: {TX if n == "Workout 1" else MU}; background: {BLUEBG if n == "Workout 1" else CARD}; border: 1.5px solid {BLUE if n == "Workout 1" else BD}; box-sizing: border-box">{dot(c)}{n}</div>'
        for n, c in FUNNELS[4:] + FUNNELS[:4])
    body = (f'<div style="position: absolute; left: 0; top: 56px; width: 390px; padding: 16px 16px 40px; box-sizing: border-box; transform: {H("sc")}">'
            f'<div style="margin: 0 -16px; padding: 0 16px; overflow: hidden; opacity: {H("e0.o")}"><div style="display: flex; gap: 8px; width: max-content; transform: {H("tabs.tf")}">{chips}</div></div>'
            f'<div style="margin: 12px -16px 0; padding: 0 16px; overflow: hidden; opacity: {H("e0.o")}"><div style="display: flex; gap: 8px; width: max-content; transform: {H("per.tf")}">{seg(PERIODS, 2, 3, True)}{other_pill()}</div></div>'
            f'{phone_card(True)}</div>' + mtop())
    K = dict(P=9.5, ents=dict(e0=0.2, e1=0.35), bars=BARS_MORPH, morph=4.4, wins={}, taps=[[4.2, 250, 141]],
             perx=[[0, 0], [2.4, 0], [3.6, -210], [9.0, -210], [9.4, 0]], tabsx=[[0, -150], [1.2, -150], [2.2, -40], [9.0, -40], [9.4, -150]],
             scroll=[[0, 0], [5.6, 0], [7.2, -470], [9.0, -470], [9.4, 0]])
    return K, body


# ── DIREZIONE C — confronto dentro ───────────────────────────────────────────
def chips_row(wrap=True):
    return ''.join(
        f'<div style="display: flex; align-items: center; gap: 8px; height: 34px; padding: 0 12px; border-radius: 50px; font-size: 13px; font-weight: 700; white-space: nowrap; color: {TX if n == "Workout 1" else MU}; background: {BLUEBG if n == "Workout 1" else CARD}; border: 1.5px solid {BLUE if n == "Workout 1" else BD}; box-sizing: border-box; box-shadow: 0 2px 0 #050608">{dot(c)}{n}</div>'
        for n, c in FUNNELS)


def legend_c():
    return (f'<div style="display: flex; align-items: center; gap: 16px; font-size: 13px; font-weight: 600; color: {MU}; white-space: nowrap">'
            f'<span style="display: flex; align-items: center; gap: 6px"><span style="width: 18px; height: 10px; border-radius: 3px; background: {BLUE}"></span>Sprint 15 · dal 06/10</span>'
            f'<span style="display: flex; align-items: center; gap: 6px"><span style="width: 3px; height: 14px; border-radius: 2px; background: {ORANGE}"></span>Sprint 15 · dal 04/10</span></div>')


def b_c_desktop():
    DH = 940
    tip = (f'<div style="position: absolute; left: 560px; top: 520px; padding: 10px 14px; background: {CARD}; border: 1.5px solid {BD}; border-radius: 12px; box-shadow: 0 3px 0 #050608, 0 12px 32px rgba(0,0,0,.5); font-size: 13px; font-weight: 600; color: {MU}; white-space: nowrap; z-index: 8; opacity: {H("tip.o")}; transform: {H("tip.tf")}">'
           f'<div style="color: {TX}; font-weight: 800; margin-bottom: 4px">1º allenamento finito</div>'
           f'<div><span style="color: {TX}; font-weight: 800">9 su 133</span> · 6,8% · Sprint 15 dal 06/10</div><div><span style="color: {ORANGE}; font-weight: 800">21 su 288</span> · 7,3% · Sprint 15 dal 04/10</div></div>')
    body = (sidebar(DH) +
            f'<div style="position: absolute; left: {CX}px; top: 28px; width: {CW}px">'
            f'<div style="display: flex; align-items: center; gap: 14px; height: 36px; opacity: {H("e0.o")}"><div style="font-size: 28px; font-weight: 800; line-height: 36px">Funnel</div><div style="flex: 1"></div>{meta_refresh()}</div>'
            f'<div style="display: flex; gap: 6px; margin-top: 16px; opacity: {H("e0.o")}">{chips_row()}<div style="flex: 1"></div><div style="{PILL}; color: {MU}; display: flex; align-items: center; padding: 6px 9px">{GEAR}</div></div>'
            f'<div style="display: flex; align-items: center; gap: 12px; margin-top: 12px; opacity: {H("e0.o")}">{seg(PERIODS, 2)}{other_pill()}<div style="flex: 1"></div>'
            f'<div style="font-size: 13px; font-weight: 600; color: {MU}">a confronto con</div><div style="{PILL}; display: flex; align-items: center; gap: 8px">{dot(ORANGE)}Sprint 15 · dal 04/10{CHEV}</div></div>'
            f'<div style="{CARDS}; margin-top: 20px; padding: 24px; opacity: {H("e1.o")}; transform: {H("e1.tf")}">'
            f'{card_head()}<div style="margin: 20px 0 18px; display: flex; align-items: flex-end; justify-content: space-between">{stat_inline(CUR, cmp=True)}</div>{rows_d(cmp=True, lab=220)}'
            f'<div style="display: flex; justify-content: space-between; align-items: center; margin-top: 14px; padding-top: 14px; border-top: 1px solid {HAIR}"><div style="font-size: 13px; font-weight: 600; color: {MU}">Installazioni da Meta Ads <span style="color: {TX}; font-weight: 800">86</span> <span style="color: {ORANGE}; font-weight: 800">· prima 156</span></div>{legend_c()}</div></div></div>' + tip)
    K = dict(P=9, ents=dict(e0=0.2, e1=0.4), bars=BARS_CUR, mark=2.2, wins=dict(tip=[4.6, 7.4]),
             ptr=[[0, 1000, 700], [3.4, 1000, 700], [4.4, 530, 492], [7.4, 530, 492], [8.4, 900, 640], [9, 900, 640]])
    return K, body


def b_c_phone():
    body = (f'<div style="position: absolute; left: 0; top: 56px; width: 390px; padding: 16px 16px 40px; box-sizing: border-box; transform: {H("sc")}">'
            f'<div style="margin: 0 -16px; padding: 0 16px; overflow: hidden; opacity: {H("e0.o")}"><div style="display: flex; gap: 8px; width: max-content; transform: {H("tabs.tf")}">{chips_row()}</div></div>'
            f'<div style="margin: 12px -16px 0; padding: 0 16px; overflow: hidden; opacity: {H("e0.o")}"><div style="display: flex; gap: 8px; width: max-content">{seg(PERIODS, 2)}{other_pill()}</div></div>'
            f'<div style="display: flex; align-items: center; gap: 8px; margin-top: 12px; opacity: {H("e0.o")}"><div style="font-size: 13px; font-weight: 600; color: {MU}">a confronto con</div><div style="{PILL}; display: flex; align-items: center; gap: 8px">{dot(ORANGE)}Sprint 15 · dal 04/10{CHEV}</div></div>'
            f'{phone_card(False, True, stats=False)}</div>' + mtop())
    K = dict(P=9, ents=dict(e0=0.2, e1=0.35), bars=BARS_CUR, mark=2.4, wins={}, tabsx=[[0, 0], [1.0, 0], [2.2, -560], [8.4, -560], [8.8, 0]],
             scroll=[[0, 0], [4.4, 0], [6.2, -420], [8.2, -420], [8.7, 0]])
    return K, body


# ── «Chi è escluso»: dove finisce il riquadro Parametri ──────────────────────
def b_esclusi():
    base_K, base = b_a_desktop()
    tg = lambda l, n, hole=None: (
        f'<div style="display: flex; align-items: center; justify-content: space-between; height: 48px; border-top: 1px solid {HAIR}"><div style="font-size: 15px; font-weight: 700">{l} <span style="color: {MU}; font-weight: 600">{n}</span></div>'
        + (f'<div style="position: relative; width: 96px; height: 30px"><div style="position: absolute; inset: 0; border-radius: 50px; border: 1.5px solid {BD}; box-sizing: border-box; font-size: 13px; font-weight: 700; color: {MU}; text-align: center; line-height: 27px; opacity: {H("ta.o")}">esclusi</div>'
           f'<div style="position: absolute; inset: 0; border-radius: 50px; border: 1.5px solid {BLUE}; background: {BLUEBG}; box-sizing: border-box; font-size: 13px; font-weight: 700; color: {TX}; text-align: center; line-height: 27px; opacity: {H("tb.o")}">inclusi</div></div>' if hole else
           f'<div style="width: 96px; height: 30px; border-radius: 50px; border: 1.5px solid {BD}; box-sizing: border-box; font-size: 13px; font-weight: 700; color: {MU}; text-align: center; line-height: 27px">esclusi</div>') + '</div>')
    ph = lambda r: f'<div style="display: flex; align-items: center; justify-content: space-between; height: 40px; border-top: 1px solid {HAIR}; font-size: 13px; font-weight: 600; color: {MU}"><span style="color: {TX}; font-weight: 700">[nome · email]</span><span>{r}</span></div>'
    drawer = (f'<div style="position: absolute; right: 0; top: 0; width: 440px; height: {DH}px; background: {CARD}; border-left: 1.5px solid {BD}; box-shadow: -12px 0 32px rgba(0,0,0,.5); box-sizing: border-box; padding: 28px 24px; z-index: 9; opacity: {H("dr.o")}; transform: {H("dr.tf")}">'
              f'<div style="display: flex; justify-content: space-between; align-items: center"><div style="font-size: 20px; font-weight: 800">Chi è escluso</div><div style="{PILL}">Chiudi</div></div>'
              f'<div style="font-size: 13px; font-weight: 600; color: {MU}; margin: 6px 0 18px">Periodo calcolato: 06/10 13:30 → 13/10 24:00 · 133 persone contate</div>'
              f'{tg("Bot", 34, True)}{tg("Account di prova", 19)}{tg("Emulatori", 19)}{tg("Bloccati", 17)}'
              f'<div style="font-size: 13px; font-weight: 700; color: {MU}; margin: 22px 0 8px">Elenco</div>{ph("bot")}{ph("bot")}{ph("prova")}{ph("emulatore")}{ph("bloccato")}{ph("bot")}</div>')
    body = base.replace(menu(CX + 104, 72), '') + drawer
    K = dict(P=8.5, ents=dict(e0=0.2, e1=0.35, e2=0.6), bars=BARS_CUR, wins=dict(dr=[2.6, 7.6]), slide=dict(dr=440), sw=5.0,
             ptr=[[0, 900, 600], [1.6, 900, 600], [2.4, 545, 152], [3.2, 545, 152], [4.6, 1365, 148], [6.6, 1365, 148], [7.6, 900, 500], [8.5, 900, 500]])
    return K, body


# tabsx / perx: scorrimenti orizzontali aggiunti al runtime
JS = JS.replace("    if (K.sw) {", "    if (K.tabsx) V.tabs = { tf: 'translateX(' + f(path(K.tabsx)[0], 1) + 'px)' }; else V.tabs = { tf: 'none' };\n    if (K.perx) V.per = { tf: 'translateX(' + f(path(K.perx)[0], 1) + 'px)' }; else V.per = { tf: 'none' };\n    if (K.sw) {")

GAP = 80
BOARDS = [
    # (file, titolo, w, h, builder, riga, colonna, kwargs)
    ('Main.dc.html', '1 - Funnel oggi', DW, DH, b_oggi_desktop, 0, 0, dict(bg='#0a0a0f', font='Inter, sans-serif')),
    ('oggi-2-telefono.dc.html', '2 - Telefono oggi', 390, 844, b_oggi_phone, 0, 1, dict(bg='#0a0a0f', font='Inter, sans-serif')),
    ('prop-1A-una-riga.dc.html', '1A - Una riga sola', DW, DH, b_a_desktop, 1, 0, {}),
    ('prop-2A-una-riga-telefono.dc.html', '2A - Una riga, telefono', 390, 844, b_a_phone, 1, 1, {}),
    ('prop-1B-elenco-sinistra.dc.html', '1B - Elenco a sinistra', DW, DH, b_b_desktop, 2, 0, {}),
    ('prop-2B-elenco-telefono.dc.html', '2B - Elenco, telefono', 390, 844, b_b_phone, 2, 1, {}),
    ('prop-1C-confronto-dentro.dc.html', '1C - Confronto dentro', DW, 940, b_c_desktop, 3, 0, {}),
    ('prop-2C-confronto-telefono.dc.html', '2C - Confronto, telefono', 390, 844, b_c_phone, 3, 1, {}),
    ('prop-3-chi-escluso.dc.html', '3 - Chi è escluso', DW, DH, b_esclusi, 4, 0, {}),
]
ROWY = [0, 1300, 2340, 3380, 4420]
canvas = {"v": 3, "createdOnFiles": {"v": 1, "at": "2026-10-07T15:00:00Z"}, "title": "KPI Funnel — redesign", "launch": {"view": "canvas"}, "pages": [],
          "boards": {}, "order": [], "designSystems": [],
          "notes": {"n-oggi": {"x": 0, "y": -260, "text": "Oggi", "kind": "title1", "maxW": 1910},
                    "n-prop": {"x": 0, "y": 1040, "text": "Proposte", "kind": "title1", "maxW": 1910}}}
only = sys.argv[1:]
for fn, title, w, h, fnb, r, c, kw in BOARDS:
    K, body = fnb()
    board(fn, title, w, h, body, K, **kw)
    canvas['boards'][fn] = dict(x=c * (DW + GAP), y=ROWY[r], w=w, h=h, title=title)
    canvas['order'].append(fn)
json.dump(canvas, open(f'{OUT}/canvas.json', 'w'), ensure_ascii=False, indent=1)
print(len(BOARDS), 'tavole')
