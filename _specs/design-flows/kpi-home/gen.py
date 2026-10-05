import json
LIGHT=dict(bg='#f3f4f6',ink='#15171c',mut='#5a606b',grid='#d3d6dc',grey='#9aa0aa',or_='#e8550a',ort='#c2410c',gain='#fbe3d3',fz='rgba(21,23,28,0.06)',band='rgba(21,23,28,0.10)',rng='rgba(21,23,28,0.15)',lband='#d9dbe0',lfz='#e6e7ea',line='#d3d6dc',act='#e2e4e9',
  font="'Space Grotesk', system-ui, sans-serif",mono="'IBM Plex Mono', monospace",
  link='https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&amp;family=IBM+Plex+Mono:wght@500;600&amp;display=swap')
DARK=dict(bg='#0a0a0f',ink='#e8e8f0',mut='#7070a0',grid='#252535',grey='#5a5a80',or_='#e8550a',ort='#fb923c',gain='#2b160c',fz='rgba(232,232,240,0.05)',band='rgba(232,232,240,0.10)',rng='rgba(232,232,240,0.16)',lband='#252535',lfz='#1a1a24',line='#252535',act='#1e1030',
  font="'Inter', system-ui, sans-serif",mono="'JetBrains Mono', monospace",
  link='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=JetBrains+Mono:wght@400;600&amp;display=swap')
MT,MB=10,46
def n(x): return ('%.1f'%x)
def frame(W,H,th,ymax,ticks,nx,xl,gain_y,axis,fz=None,today=None,step=1,pad=0,ML=52,MR=66,bold=None):
    PW=W-ML-MR; PH=H-MT-MB
    X=lambda i: ML+pad+(PW-2*pad)*i/(nx-1)
    Y=lambda v: MT+PH*(1-v/ymax)
    s=[]
    s.append('<rect x="%d" y="%d" width="%d" height="%s" fill="%s"></rect>'%(ML,MT,PW,n(Y(gain_y)-MT),th['gain']))
    if fz is not None: s.append('<rect x="%s" y="%d" width="%s" height="%d" fill="%s"></rect>'%(n(X(fz)),MT,n(ML+PW-X(fz)),PH,th['fz']))
    for v,l in ticks:
        y=Y(v)
        if v==0: s.append('<line x1="%d" y1="%s" x2="%d" y2="%s" stroke="%s" stroke-width="2"></line>'%(ML,n(y),ML+PW,n(y),th['ink']))
        else: s.append('<line x1="%d" y1="%s" x2="%d" y2="%s" stroke="%s" stroke-width="1"></line>'%(ML,n(y),ML+PW,n(y),th['grid']))
        s.append('<text x="%d" y="%s" font-size="13" fill="%s" text-anchor="end">%s</text>'%(ML-8,n(y+4.5),th['mut'],l))
    for i,l in enumerate(xl):
        x=X(i); show=(i%step==(1 if (bold is not None and step>1) else 0)) or i==today
        s.append('<line x1="%s" y1="%s" x2="%s" y2="%s" stroke="%s" stroke-width="1"></line>'%(n(x),n(Y(0)),n(x),n(Y(0)+5),th['ink']))
        if show:
            b=(bold is not None and i==bold)
            s.append('<text x="%s" y="%s" font-size="13" fill="%s" text-anchor="middle"%s>%s</text>'%(n(x),n(Y(0)+20),th['ink'] if b else th['mut'],' font-weight="700"' if b else '',l))
    if today is not None: s.append('<text x="%s" y="%s" font-size="13" fill="%s" text-anchor="middle" font-weight="700">oggi</text>'%(n(X(today)),n(Y(0)+36),th['ink']))
    s.append('<text x="%s" y="%d" font-size="13" fill="%s" text-anchor="end">%s</text>'%(n(ML+PW),H-4,th['mut'],axis))
    s.append('<line x1="%d" y1="%s" x2="%d" y2="%s" stroke="%s" stroke-width="3"></line>'%(ML,n(Y(gain_y)),ML+PW,n(Y(gain_y)),th['or_']))
    return s,X,Y
def svg(W,H,th,parts,label=None):
    a=' role="img" aria-label="%s"'%label if label else ' aria-hidden="true"'
    return '<svg width="%d" height="%d" viewBox="0 0 %d %d" style="position: absolute; left: 0; top: 0; display: block; font-family: %s"%s>%s</svg>'%(W,H,W,H,th['font'],a,''.join(parts))
def pl(pts,c,w,dash=None):
    return '<polyline points="%s" fill="none" stroke="%s" stroke-width="%s" stroke-linejoin="round" stroke-linecap="round"%s></polyline>'%(' '.join('%s,%s'%(n(x),n(y)) for x,y in pts),c,w,' stroke-dasharray="%s"'%dash if dash else '')
def dot(x,y,r,c): return '<circle cx="%s" cy="%s" r="%s" fill="%s"></circle>'%(n(x),n(y),r,c)
def hol(x,y,r,th): return '<circle cx="%s" cy="%s" r="%s" fill="%s" stroke="%s" stroke-width="3"></circle>'%(n(x),n(y),r,th['bg'],th['ink'])
EUR=[(0,'0 €'),(0.5,'0,50 €'),(1,'1 €'),(1.5,'1,50 €'),(2,'2 €')]
# dati veri (Supabase, 05/10/2026): rientro netto / spesa, giorno per giorno
S5=[0]*9+[0.49]+[0.98]*6; S12=[0]*16; S13=[0]*10+[0.335]*5
def case(v): return [(d, 0 if d<=8 else v*(d-8)/8.0) for d in range(2,17)]
def chart1(W,H,th,step=1):
    b,X,Y=frame(W,H,th,2,EUR,16,[str(i) for i in range(1,17)],1,"giorni dall'inizio dello sprint",fz=8.5,today=1,step=step)
    d=[]
    for S in (S5,S12,S13):
        pts=[(X(i),Y(v)) for i,v in enumerate(S)]
        d.append(pl(pts,th['grey'],2)); d+= [dot(x,y,2.5,th['grey']) for x,y in pts]
    up=[(X(k-1),Y(v)) for k,v in case(0.98)]; lo=[(X(k-1),Y(v)) for k,v in case(0)]; me=[(X(k-1),Y(v)) for k,v in case(0.335)]
    d.append('<polygon points="%s" fill="%s"></polygon>'%(' '.join('%s,%s'%(n(x),n(y)) for x,y in up+lo[::-1]),th['band']))
    d.append(pl(lo,th['mut'],2,'6 6')); d.append(pl(me,th['ink'],3,'8 7')); d.append(pl(up,th['or_'],3,'8 7'))
    d.append(hol(X(1),Y(0),7,th))
    xr=X(15)+10
    d.append('<text x="%s" y="%s" font-size="13" fill="%s" font-weight="700">pessimo</text>'%(n(xr),n(Y(0)-6),th['mut']))
    d.append('<text x="%s" y="%s" font-size="13" fill="%s" font-weight="700">medio</text>'%(n(xr),n(Y(0.335)+4),th['ink']))
    d.append('<text x="%s" y="%s" font-size="13" fill="%s" font-weight="700">ottimo</text>'%(n(xr),n(Y(0.98)+18),th['ort']))
    return svg(W,H,th,b,'Per ogni euro speso in pubblicità, quanto rientra'),svg(W,H,th,d),(X(1),Y(0)),Y(1)
REAL2=[0,0.98,0,0,0,0,0,0,0,0.335]
def chart2(W,H,th,step=1):
    lab=['S%d'%i for i in range(4,18)]
    b,X,Y=frame(W,H,th,2,EUR,14,lab,1,'sprint',fz=9.5,step=step,pad=20,bold=11)
    d=[]
    for i,(a,z) in [(10,(0,0.41)),(11,(0,0.98)),(12,(0,0.98)),(13,(0,0.98))]:
        d.append('<line x1="%s" y1="%s" x2="%s" y2="%s" stroke="%s" stroke-width="14" stroke-linecap="round"></line>'%(n(X(i)),n(Y(z)),n(X(i)),n(Y(a)),th['rng']))
    real=[(X(i),Y(v)) for i,v in enumerate(REAL2)]
    fc=[(X(9),Y(0.335)),(X(10),Y(0.135)),(X(11),Y(0.335)),(X(12),Y(0.335)),(X(13),Y(0.335))]
    d.append(pl(real,th['ink'],3)); d.append(pl(fc,th['ink'],3,'8 7'))
    d+=[dot(x,y,6,th['ink']) for x,y in real]; d+=[hol(x,y,7,th) for x,y in fc[1:]]
    return svg(W,H,th,b,'Per ogni euro speso, quanto rientra: sprint dopo sprint'),svg(W,H,th,d),(X(11),Y(0.335)),Y(1)
P12=[0,0,0,0,0,0,0.49,0.44,0.40]; P13=[0,0,0]; P14=[6.59,2.97,2.05,2.45,2.80,2.28,1.94]
def chart3(W,H,th,step=1):
    b,X,Y=frame(W,H,th,48,[(0,'0'),(12,'12'),(24,'24'),(36,'36'),(48,'48')],9,[str(i) for i in range(1,10)],12.7,'giorni di spesa dello sprint',today=1,step=step)
    d=[]
    for S in (P12,P13,P14):
        pts=[(X(i),Y(v)) for i,v in enumerate(S)]
        d.append(pl(pts,th['grey'],2)); d+=[dot(x,y,2.5,th['grey']) for x,y in pts]
    d.append(dot(X(1),Y(42.4),7,th['ink']))
    return svg(W,H,th,b,'Prove avviate ogni 100 € di pubblicità'),svg(W,H,th,d),(X(1),Y(42.4)),Y(12.7)
def li(kind,c,txt,th):
    if kind=='line': g='<svg width="30" height="14" aria-hidden="true"><line x1="2" y1="7" x2="28" y2="7" stroke="%s" stroke-width="4" stroke-linecap="round"></line></svg>'%c
    elif kind=='hol': g='<svg width="30" height="14" aria-hidden="true"><circle cx="15" cy="7" r="5" fill="%s" stroke="%s" stroke-width="3"></circle></svg>'%(th['bg'],th['ink'])
    elif kind=='dot': g='<svg width="30" height="14" aria-hidden="true"><circle cx="15" cy="7" r="6" fill="%s"></circle></svg>'%c
    else: g='<svg width="30" height="14" aria-hidden="true"><rect x="1" y="1" width="28" height="12" rx="2" fill="%s"></rect></svg>'%c
    return '<div style="display: flex; align-items: flex-start; gap: 8px; line-height: 18px"><span style="flex: 0 0 30px; padding-top: 2px; display: block; height: 16px">%s</span><span>%s</span></div>'%(g,txt)
def LEG(k,th):
    if k==1: return [li('hol','', 'Sprint 15, stima finché le prove sono aperte',th),li('line',th['grey'],'3 sprint a campione: 5, 12 e 13',th),li('line',th['or_'],'pareggio: rientra 1 € per ogni € speso',th),li('rect',th['gain'],'qui guadagniamo',th),li('rect',th['lband'],'previsione: pessimo, medio e ottimo dai 3 sprint a campione',th),li('rect',th['lfz'],'giorni in cui le prove scadono',th)]
    if k==2: return [li('line',th['ink'],'sprint chiusi, dato reale',th),li('hol','','Sprint 14 con le prove aperte, poi le previsioni: sprint in corso e i due successivi',th),li('rect',th['lband'],"dal caso pessimo all'ottimo",th),li('rect',th['lfz'],'zona delle previsioni',th),li('line',th['or_'],'pareggio: rientra 1 € per ogni € speso',th),li('rect',th['gain'],'qui guadagniamo',th)]
    return [li('dot',th['ink'],'Sprint 15',th),li('line',th['grey'],'sprint passati: 12, 13 e 14',th),li('line',th['or_'],'pareggio: 12,7 prove ogni 100 €, se ne paga il 37,7%',th),li('rect',th['gain'],'qui guadagniamo',th)]
def legend(items,th,col=False):
    return '<div style="display: flex; flex-wrap: wrap; flex-direction: %s; gap: 6px 22px; font-size: 13px; color: %s">%s</div>'%('column' if col else 'row',th['ink'],''.join(items))
TIT={1:('Per ogni euro speso in pubblicità, quanto rientra','euro rientrati per ogni euro speso','giorno 2 di 16'),
     2:('Per ogni euro speso, quanto rientra: sprint dopo sprint','euro rientrati per ogni euro speso','10 sprint chiusi'),
     3:('Prove avviate ogni 100 € di pubblicità','prove avviate ogni 100 € spesi','giorno 2 di 9')}
CH={1:chart1,2:chart2,3:chart3}
def card(k,x,y,w,h,th,legh=0,step=1,col=False,head=52,fs=18):
    """ritorna html, punto assoluto del bersaglio, y assoluta del pareggio"""
    ch=h-head-legh-(8 if legh else 0)
    b,d,pt,py=CH[k](w,ch,th,step)
    t,s,m=TIT[k]
    h_='<div style="position: absolute; left: %dpx; top: %dpx; width: %dpx; height: %dpx; opacity: «e%d.o»; transform: «e%d.tf»">'%(x,y,w,h,k,k)
    h_+='<div style="position: absolute; left: 0; top: 0; width: %dpx; display: flex; justify-content: space-between; align-items: baseline; gap: 12px"><div style="font-size: %dpx; font-weight: 700; line-height: 24px">%s</div><div style="font-family: %s; font-size: 12px; color: %s; white-space: nowrap">%s</div></div>'%(w,fs,t,th['mono'],th['mut'],m)
    h_+='<div style="position: absolute; left: 0; top: %dpx; font-size: 13px; font-weight: 700; color: %s">%s</div>'%(head-22,th['mut'],s)
    h_+='<div style="position: absolute; left: 0; top: %dpx; width: %dpx; height: %dpx">%s<div style="position: absolute; left: 0; top: 0; height: %dpx; width: «r%d»; overflow: hidden"><div style="position: relative; width: %dpx; height: %dpx">%s</div></div></div>'%(head,w,ch,b,ch,k,w,ch,d)
    if legh: h_+='<div style="position: absolute; left: 0; top: %dpx; width: %dpx">%s</div>'%(head+ch+8,w,legend(LEG(k,th),th,col))
    h_+='</div>'
    return h_,(x+pt[0],y+head+pt[1]),y+head+py
ICON={'Home':'<path d="M3 11l9-8 9 8"></path><path d="M5 10v10h14V10"></path>','Funnel':'<path d="M3 4h18l-7 9v6l-4 2v-8z"></path>','Retention':'<path d="M3 5c6 0 6 13 18 14"></path><path d="M3 3v18h18"></path>','Sprint':'<path d="M5 21V4h12l-2 4 2 4H5"></path>','Premium':'<path d="M6 4h12l3 5-9 11L3 9z"></path><path d="M3 9h18"></path>','AI Coach':'<path d="M4 5h16v11H10l-6 4z"></path>','Comportamento':'<path d="M5 3l14 8-6 2-2 6z"></path>','Economy':'<circle cx="12" cy="12" r="9"></circle><path d="M15 9a3 3 0 0 0-3-2c-2 0-3 1-3 2.5s1 2 3 2.5 3 1 3 2.5-1 2.5-3 2.5a3 3 0 0 1-3-2"></path><path d="M12 5v2M12 17v2"></path>','Meta ADS':'<path d="M4 10v4l11 5V5z"></path><path d="M18 9a4 4 0 0 1 0 6"></path>'}
ECO=(32,20+52*7+22)
def rail(th,H):
    s='<div style="position: absolute; left: 0; top: 0; width: 64px; height: %dpx; border-right: 1px solid %s; box-sizing: border-box">'%(H,th['line'])
    for i,(k,p) in enumerate(ICON.items()):
        bg=th['act'] if i==0 else 'transparent'
        ov='<div style="position: absolute; inset: 0; border-radius: 12px; background: %s; opacity: «eco.o»"></div>'%th['act'] if k=='Economy' else ''
        s+='<div style="position: absolute; left: 10px; top: %dpx; width: 44px; height: 44px; border-radius: 12px; background: %s">%s<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="%s" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; left: 11px; top: 11px; display: block" aria-label="%s">%s</svg></div>'%(20+52*i,bg,ov,th['ink'] if i==0 else th['mut'],k,p)
    s+='</div><div style="position: absolute; left: 72px; top: %dpx; padding: 6px 10px; border-radius: 7px; background: %s; color: %s; font-size: 13px; font-weight: 700; opacity: «eco.o»">Economy</div>'%(ECO[1]-15,th['ink'],th['bg'])
    return s
def header(th,x=96):
    return '<div style="position: absolute; left: %dpx; top: 24px; display: flex; align-items: baseline; gap: 16px"><div style="font-size: 26px; font-weight: 700; line-height: 32px">Home</div><div style="font-family: %s; font-size: 13px; color: %s">Sprint 15 · giorno 2 di 16 · 04/10–12/10</div></div>'%(x,th['mono'],th['mut'])
def overlay(th,W,H):
    s='<div style="position: absolute; left: «hp.x»; top: «hp.y»; width: 28px; height: 28px; border-radius: 14px; border: 2px solid %s; box-sizing: border-box; opacity: «tip.o»"></div>'%th['or_']
    s+='<div style="position: absolute; left: «tip.x»; top: «tip.y»; width: 288px; box-sizing: border-box; padding: 12px 14px; border-radius: 10px; background: %s; color: %s; font-size: 13px; line-height: 20px; opacity: «tip.o»; transform: «tip.tf»"><div style="font-family: %s; font-size: 12px; opacity: 0.7">Sprint 15 · giorno 2 · stima</div><div style="font-size: 16px; font-weight: 700; line-height: 24px">0 € rientrati per ogni euro</div><div>4,72 € spesi · 2 prove aperte · 0 paganti</div></div>'%(th['ink'],th['bg'],th['mono'])
    s+='<div style="position: absolute; left: «tp.x»; top: «tp.y»; width: 80px; height: 80px; border-radius: 40px; background: %s; opacity: «tp.o»; transform: «tp.tf»"></div>'%th['ink']
    s+='<svg width="22" height="26" viewBox="0 0 22 26" style="position: absolute; left: «pt.x»; top: «pt.y»; display: block" aria-hidden="true"><path d="M2 2l16 12-7 1.500 4 8-3 1.500-4-8-6 4z" fill="#15171c" stroke="#ffffff" stroke-width="1.500" stroke-linejoin="round"></path></svg>'
    s+='<div style="position: absolute; left: 0; top: 0; width: %dpx; height: %dpx; background: %s; opacity: «veil»; pointer-events: none"></div>'%(W,H,th['bg'])
    return s
JS=r"""
class Component extends DCLogic {
  componentDidMount() {
    if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.t0 = performance.now();
    const loop = () => { this.forceUpdate(); this.raf = requestAnimationFrame(loop); };
    this.raf = requestAnimationFrame(loop);
  }
  componentWillUnmount() { cancelAnimationFrame(this.raf); }
  renderVals() {
    const C = __CFG__;
    const P = 9;
    const t = this.t0 ? ((performance.now() - this.t0) / 1000) % P : 4.4;
    const cl = (x) => Math.max(0, Math.min(1, x));
    const p = (a, d) => cl((t - a) / d);
    const out = (x) => 1 - Math.pow(1 - x, 3);
    const inout = (x) => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    const f = (x, d) => x.toFixed(d === undefined ? 3 : d);
    const ent = (a) => { const k = out(p(a, 0.5)); return { o: f(k), tf: 'translateY(' + f(12 * (1 - k), 1) + 'px)' }; };
    const veil = f(Math.max(1 - p(0, 0.2), p(P - 0.3, 0.3)));
    const g1 = inout(p(2.4, 0.9)), g2 = inout(p(5.5, 0.9));
    const px = C.S[0] + (C.T1[0] - C.S[0]) * g1 + (C.T2[0] - C.T1[0]) * g2;
    const py = C.S[1] + (C.T1[1] - C.S[1]) * g1 + (C.T2[1] - C.T1[1]) * g2;
    const sc = -C.SC * inout(p(5.5, 1.6));
    const tipo = Math.min(p(3.4, 0.2), 1 - p(5.2, 0.2));
    const k = p(6.9, 0.45);
    const eco = C.SC ? 0 : Math.min(p(6.3, 0.15), 1);
    return {
      veil, sc: 'translateY(' + f(sc, 1) + 'px)',
      e1: ent(C.A[0]), e2: ent(C.A[1]), e3: ent(C.A[2]), em: ent(0.3),
      r1: f(C.W[0] * out(p(C.A[0] + 0.3, 1.2)), 1) + 'px', r2: f(C.W[1] * out(p(C.A[1] + 0.3, 1.2)), 1) + 'px', r3: f(C.W[2] * out(p(C.A[2] + 0.3, 1.2)), 1) + 'px',
      pt: { x: f(px, 1) + 'px', y: f(py, 1) + 'px' },
      hp: { x: (C.T1[0] - 14) + 'px', y: (C.T1[1] - 14) + 'px' },
      tip: { x: (C.T1[0] + C.TO[0]) + 'px', y: (C.T1[1] + C.TO[1]) + 'px', o: f(tipo), tf: 'translateY(' + f(6 * (1 - tipo), 1) + 'px)' },
      eco: { o: f(eco) },
      tp: { x: (C.T2[0] - 40) + 'px', y: (C.T2[1] - 40) + 'px', o: (!C.SC && k > 0 && k < 1) ? f(0.25 * (1 - k)) : 0, tf: 'scale(' + f(0.3 + 0.6 * out(k)) + ')' }
    };
  }
}
"""
def board(fn,title,th,W,H,body,cfg):
    body=body.replace('«','{{').replace('»','}}')
    html='<!doctype html>\n<html lang="it">\n<head>\n<meta charset="utf-8">\n<title>%s</title>\n<script src="./support.js"></script>\n</head>\n<body>\n<x-dc>\n<helmet>\n<link rel="stylesheet" href="%s">\n<style>\nbody{margin:0;background:%s}\n</style>\n</helmet>\n<div style="width: %dpx; height: %dpx; position: relative; overflow: hidden; box-sizing: border-box; background: %s; color: %s; font-family: %s">\n%s\n</div>\n</x-dc>\n<script type="text/x-dc" data-dc-script data-props=\'{"$preview":{"width":%d,"height":%d}}\'>%s</script>\n</body>\n</html>\n'%(title,th['link'],th['bg'],W,H,th['bg'],th['ink'],th['font'],body,W,H,JS.replace('__CFG__',json.dumps(cfg)))
    open('project/'+fn,'w').write(html)
W,H=1440,900
# ---------- A: uno grande, due sotto
th=LIGHT
c1,t1,_=card(1,96,84,1312,404,th,legh=44)
c2,_,_=card(2,96,512,640,372,th,legh=100,fs=16)
c3,_,_=card(3,768,512,640,372,th,legh=100,fs=16)
board('prop-A-grande-sopra.dc.html','A - Uno grande',th,W,H,rail(th,H)+header(th)+c1+c2+c3+overlay(th,W,H),
  dict(W=[1312,640,640],A=[0.3,0.9,1.1],S=[900,700],T1=[round(t1[0]),round(t1[1])],T2=list(ECO),TO=[24,-120],SC=0))
# ---------- B: tre finestre affiancate, scura, in ordine di segnale 3 -> 1 -> 2
th=DARK
cw=416; xs=[96,96+cw+32,96+2*(cw+32)]
lab=['Il primo segnale','Lo sprint','La storia']
hd=''.join('<div style="position: absolute; left: %dpx; top: 84px; width: %dpx; font-family: %s; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; color: %s; border-top: 1px solid %s; padding-top: 10px">%s</div>'%(xs[i],cw,th['mono'],th['mut'],th['line'],lab[i]) for i in range(3))
c3,_,_=card(3,xs[0],124,cw,752,th,legh=196,col=True,head=76,fs=17)
c1,t1,_=card(1,xs[1],124,cw,752,th,legh=196,col=True,head=76,fs=17,step=2)
c2,_,_=card(2,xs[2],124,cw,752,th,legh=196,col=True,head=76,fs=17,step=2)
board('prop-B-tre-finestre.dc.html','B - Tre finestre',th,W,H,rail(th,H)+header(th)+hd+c3+c1+c2+overlay(th,W,H).replace('fill="#15171c" stroke="#ffffff"','fill="#e8e8f0" stroke="#0a0a0f"'),
  dict(W=[cw,cw,cw],A=[0.7,1.1,0.3],S=[1000,760],T1=[round(t1[0]),round(t1[1])],T2=list(ECO),TO=[-12,-212],SC=0))
# ---------- C: colonna che scorre e margine fisso
th=LIGHT
cw=864
c1,t1,_=card(1,0,0,cw,500,th)
c2,_,_=card(2,0,540,cw,500,th)
c3,_,_=card(3,0,1080,cw,500,th)
col='<div style="position: absolute; left: 96px; top: 84px; width: %dpx; height: 816px; overflow: hidden"><div style="position: absolute; left: 0; top: 0; width: %dpx; height: 1580px; transform: «sc»">%s</div></div>'%(cw,cw,c1+c2+c3)
days=''.join('<div style="flex: 1; height: 28px; border-radius: 4px; box-sizing: border-box; background: %s; border: %s; font-family: %s; font-size: 11px; line-height: 28px; text-align: center; color: %s">%d</div>'%( th['ink'] if d==2 else ('#d9dbe0' if d<=9 else 'transparent'), '0' if d<=9 else '1px dashed #9aa0aa', th['mono'], th['bg'] if d==2 else th['mut'], d) for d in range(1,17))
note=['Modifiche grafiche onboarding','Mascotte animata','Mostra piano fine onboarding','Redesign details e exercise page','Jev come routing e rivisitazione coach']
allleg=[li('hol','','stima, finché le prove sono aperte',th),li('dot',th['ink'],'dato reale',th),li('line',th['grey'],'sprint passati a campione',th),li('line',th['or_'],'pareggio',th),li('rect',th['gain'],'qui guadagniamo',th),li('rect',th['lband'],'previsione: pessimo, medio, ottimo',th),li('rect',th['lfz'],'prove in scadenza e previsioni',th)]
sec=lambda t: '<div style="font-family: %s; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; color: %s; margin: 0 0 10px">%s</div>'%(th['mono'],th['mut'],t)
mar='<div style="position: absolute; left: 1008px; top: 84px; width: 400px; height: 792px; box-sizing: border-box; border-left: 1px solid %s; padding: 0 0 0 32px; display: flex; flex-direction: column; gap: 28px; opacity: «em.o»">'%th['line']
mar+='<div>%s<div style="font-size: 22px; font-weight: 700; line-height: 28px; margin: 0 0 12px">Sprint 15</div><div style="display: flex; gap: 3px">%s</div><div style="display: flex; justify-content: space-between; font-size: 13px; color: %s; margin: 8px 0 0"><span>9 giorni di spesa</span><span>7 giorni in cui le prove scadono</span></div></div>'%(sec('Lo sprint in corso'),days,th['mut'])
mar+='<div>%s<div style="display: flex; flex-direction: column; gap: 6px; font-size: 15px; line-height: 22px">%s</div></div>'%(sec("Cosa c'è di diverso"),''.join('<div style="display: flex; gap: 10px"><span style="color: %s">–</span><span>%s</span></div>'%(th['mut'],x) for x in note))
mar+='<div>%s%s</div></div>'%(sec('Come si leggono i grafici'),legend(allleg,th,True))
board('prop-C-colonna-margine.dc.html','C - Colonna e margine',th,W,H,rail(th,H)+header(th)+col+mar+overlay(th,W,H),
  dict(W=[cw,cw,cw],A=[0.3,0.6,0.9],S=[700,760],T1=[round(96+t1[0]),round(84+t1[1])],T2=[round(96+t1[0])+260,round(84+t1[1])-160],TO=[24,-120],SC=540))
# ---------- D: la linea del pareggio attraversa la pagina
th=LIGHT
c2,_,py=card(2,96,84,520,508,th,fs=16,head=76)
c1,t1,py1=card(1,648,84,760,508,th,fs=16,head=76)
assert abs(py-py1)<0.1
ln='<div style="position: absolute; left: 64px; top: %spx; width: 1376px; height: 3px; background: %s; opacity: 0.35"></div><div style="position: absolute; left: 1414px; top: %spx; font-size: 12px; font-weight: 700; color: %s; opacity: «em.o»"></div>'%(n(py-1.5),th['or_'],n(py-22),th['ort'])
c3,_,_=card(3,96,620,760,256,th,fs=16)
sh=[li('hol','','stima, finché le prove sono aperte',th),li('dot',th['ink'],'dato reale',th),li('line',th['grey'],'sprint passati a campione',th),li('line',th['or_'],'pareggio: 1 € per ogni € speso, 12,7 prove ogni 100 €',th),li('rect',th['gain'],'qui guadagniamo',th),li('rect',th['lband'],'previsione: pessimo, medio, ottimo',th),li('rect',th['lfz'],'prove in scadenza e previsioni',th)]
lg='<div style="position: absolute; left: 904px; top: 620px; width: 504px; opacity: «em.o»"><div style="font-family: %s; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; color: %s; margin: 0 0 12px">Come si leggono i grafici</div>%s</div>'%(th['mono'],th['mut'],legend(sh,th,True))
board('prop-D-linea-pareggio.dc.html','D - Linea del pareggio',th,W,H,rail(th,H)+header(th)+ln+c2+c1+c3+lg+overlay(th,W,H),
  dict(W=[760,520,760],A=[0.8,0.3,1.2],S=[1100,780],T1=[round(t1[0]),round(t1[1])],T2=list(ECO),TO=[24,-120],SC=0))
# ---------- Oggi: la Overview attuale, fedele al codice
O=dict(bg='#0a0a0f',s='#111118',s2='#1a1a24',b='#252535',t='#e8e8f0',m='#7070a0',p='#a78bfa',g='#4ade80',a='#fbbf24',lo='#1e1030')
nav=[('📊','Overview'),('🎯','Funnel'),('🔄','Retention'),('🏃','Sprint'),('💎','Premium'),('🤖','AI Coach'),('🖱️','Comportamento')]
sb='<div style="position: absolute; left: 0; top: 0; width: 220px; height: 900px; box-sizing: border-box; background: %s; border-right: 1px solid %s">'%(O['s'],O['b'])
sb+='<div style="padding: 20px 20px 16px"><div style="font-family: \'JetBrains Mono\', monospace; font-size: 18px; font-weight: 600">Hype<span style="color: %s">move</span></div><div style="font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: %s">KPI</div></div>'%(O['p'],O['m'])
sb+='<div style="padding: 0 10px"><div style="font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: %s; padding: 8px 10px 4px">KPI</div>'%O['m']
for i,(e,l) in enumerate(nav):
    st='background: %s; color: %s'%(O['lo'],O['p']) if i==0 else 'color: %s'%O['t']
    ov='<div style="position: absolute; inset: 0; border-radius: 7px; background: %s; opacity: «eco.o»"></div>'%O['s2'] if l=='Funnel' else ''
    sb+='<div style="position: relative; display: flex; align-items: center; gap: 8px; font-size: 13px; padding: 8px 10px; border-radius: 7px; %s">%s<span style="position: relative; width: 20px; font-size: 15px">%s</span><span style="position: relative">%s</span></div>'%(st,ov,e,l)
sb+='<div style="font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: %s; padding: 8px 10px 4px; margin-top: 8px">Marketing</div><div style="display: flex; align-items: center; gap: 8px; font-size: 13px; padding: 8px 10px"><span style="width: 20px; font-size: 15px">📣</span><span>Meta ADS</span></div></div>'%O['m']
sb+='<div style="position: absolute; left: 0; bottom: 0; width: 219px; box-sizing: border-box; padding: 14px 20px; border-top: 1px solid %s; font-size: 11px; color: %s">Mattia &amp; Danilo · 50/50</div></div>'%(O['b'],O['m'])
hdr='<div style="position: absolute; left: 252px; top: 28px; width: 1156px; display: flex; justify-content: space-between; align-items: flex-start"><div><div style="font-size: 22px; font-weight: 700; line-height: 30px">KPI Dashboard</div><div style="font-size: 13px; color: %s">Metriche prodotto HypeMove · live da Supabase</div></div><div style="display: flex; align-items: center; gap: 12px; font-size: 11px; color: #4a4a68"><span>agg. tra 4:52</span><span>ultimo 21:14</span><span style="font-size: 11.500px; color: %s; border: 1px solid %s; border-radius: 7px; padding: 6px 10px">Aggiorna</span></div></div>'%(O['m'],O['t'],O['b'])
cards=[('Utenti Totali','3276',O['p']),('Nuovi (7g)','290',O['g']),('DAU','50',O['t']),('WAU','119',O['t']),('MAU','441',O['a']),('Workout Totali','5912',O['t']),('Workout (7g)','418',O['t']),('Streak Attive','57',O['p']),('Premium Paganti','8',O['a']),('Free Trial Attivi','7',O['a'])]
gr='<div style="position: absolute; left: 252px; top: 100px; width: 1156px; opacity: «ld.c»"><div style="display: flex; justify-content: space-between; align-items: center; margin: 0 0 12px"><span style="font-size: 11px; color: %s">10 metriche</span><span style="font-size: 11.500px; border: 1px solid %s; border-radius: 7px; padding: 6px 10px">⚙ Personalizza</span></div><div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; margin: 0 0 24px">'%(O['m'],O['b'])
for l,v,c in cards:
    gr+='<div style="background: %s; border: 1px solid %s; border-radius: 10px; padding: 18px 20px"><div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.500px; color: %s">%s</div><div style="font-family: \'JetBrains Mono\', monospace; font-size: 22px; font-weight: 600; color: %s; line-height: 34px">%s</div></div>'%(O['s'],O['b'],O['m'],l,c,v)
gr+='</div><div style="background: %s; border: 1px solid %s; border-radius: 10px; padding: 20px"><div style="font-size: 14px; font-weight: 600; margin: 0 0 14px">Abbonamenti</div><div style="display: grid; grid-template-columns: 1fr 2fr 1fr; gap: 12px">'%(O['s'],O['b'])
gr+='<div style="background: %s; border-radius: 10px; padding: 16px; height: 120px; box-sizing: border-box"><div style="font-size: 11px; text-transform: uppercase; color: %s">Paganti</div><div style="font-family: \'JetBrains Mono\', monospace; font-size: 32px; font-weight: 600; color: %s; line-height: 44px">8</div></div>'%(O['s2'],O['m'],O['a'])
gr+='<div style="background: %s; border-radius: 10px; padding: 16px; height: 120px; box-sizing: border-box"><div style="font-size: 11px; text-transform: uppercase; color: %s">Prove iniziate</div><div style="font-size: 11px; text-transform: uppercase; color: %s; margin-top: 44px">Scadute senza rinnovo</div></div>'%(O['s2'],O['m'],O['m'])
gr+='<div style="background: %s; border-radius: 10px; padding: 16px; height: 120px; box-sizing: border-box"><div style="font-size: 11px; text-transform: uppercase; color: %s">Prove che scadono</div></div></div></div>'%(O['s2'],O['m'])
gr+='<div style="margin-top: 16px; background: %s; border: 1px solid %s; border-radius: 10px; padding: 20px; height: 260px; box-sizing: border-box"><div style="font-size: 14px; font-weight: 600">Crescita utenti totali</div><div style="font-size: 11px; color: %s">cumulativo · esclusi account interni</div></div></div>'%(O['s'],O['b'],O['m'])
ld='<div style="position: absolute; left: 252px; top: 300px; width: 1156px; text-align: center; opacity: «ld.o»"><div style="font-size: 32px">📊</div><div style="font-size: 13px; color: %s">Caricamento dati da Supabase...</div></div>'%O['m']
ptr='<svg width="22" height="26" viewBox="0 0 22 26" style="position: absolute; left: «pt.x»; top: «pt.y»; display: block" aria-hidden="true"><path d="M2 2l16 12-7 1.500 4 8-3 1.500-4-8-6 4z" fill="#e8e8f0" stroke="#0a0a0f" stroke-width="1.500" stroke-linejoin="round"></path></svg><div style="position: absolute; left: 0; top: 0; width: 1440px; height: 900px; background: #0a0a0f; opacity: «veil»"></div>'
JSO=JS.replace("eco: { o: f(eco) },","eco: { o: f(Math.min(p(3.3, 0.15), 1 - p(6.5, 0.15))) }, ld: { o: t < 1.2 ? f(0.7 + 0.3 * Math.cos(t * 5.2)) : 0, c: t < 1.2 ? 0 : 1 },")
_JS=JS; JS=JSO
thO=dict(DARK); 
board('Main.dc.html','1 - Overview',thO,W,H,sb+hdr+ld+gr+ptr,dict(W=[0,0,0],A=[0,0,0],S=[800,560],T1=[120,128],T2=[120,128],TO=[0,0],SC=0))
JS=_JS
json.dump({"v":3,"attachments":{},"boards":{
 "Main.dc.html":{"w":W,"h":H,"x":0,"y":0,"title":"1 - Overview"},
 "prop-A-grande-sopra.dc.html":{"w":W,"h":H,"x":0,"y":1300,"title":"1A - Uno grande"},
 "prop-B-tre-finestre.dc.html":{"w":W,"h":H,"x":1520,"y":1300,"title":"1B - Tre finestre"},
 "prop-C-colonna-margine.dc.html":{"w":W,"h":H,"x":3040,"y":1300,"title":"1C - Colonna e margine"},
 "prop-D-linea-pareggio.dc.html":{"w":W,"h":H,"x":4560,"y":1300,"title":"1D - Linea del pareggio"}},
 "notes":{"oggi":{"kind":"title1","maxW":4000,"text":"Oggi","w":240,"x":0,"y":-300},"prop":{"kind":"title1","maxW":4000,"text":"Proposte","w":240,"x":0,"y":1000}},
 "order":["Main.dc.html","prop-A-grande-sopra.dc.html","prop-B-tre-finestre.dc.html","prop-C-colonna-margine.dc.html","prop-D-linea-pareggio.dc.html"],
 "createdOnFiles":{"v":1,"at":"2026-10-05T21:30:00Z"},"designSystems":[],"pages":[],"launch":{"view":"canvas"},"title":"KPI Home — direzioni"},open('project/canvas.json','w'),ensure_ascii=False,indent=1)
print('ok')
