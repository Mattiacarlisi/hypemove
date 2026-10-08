# Tavole «Abbonamenti»: fila «Oggi» (fedele a kpi.js) e fila «Proposte» (quattro direzioni).
# Dati veri letti da Supabase l'08/10/2026. Si lancia nella cartella che contiene project/.
import json, datetime as dt
D=lambda s: dt.date(2026,int(s[3:5]),int(s[:2]))
dm=lambda d: d.strftime('%d/%m')
TODAY=D('08/10')
# ---------------------------------------------------------------- impalcatura comune
JS='''class Component extends DCLogic {
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
    const ent = (a) => { const k = out(p(a, 0.5)); return { o: f(k), tf: 'translateY(' + f(12 * (1 - k), 1) + 'px)' }; };
    const win = (w) => f(Math.min(p(w[0], 0.18), 1 - p(w[1], 0.18)));
    let px = C.S[0], py = C.S[1], lx = px, ly = py;
    C.W.forEach((w) => { const g = inout(p(w[2] - 0.8, 0.8)); px += (w[0] - lx) * g; py += (w[1] - ly) * g; lx = w[0]; ly = w[1]; });
    const tap = (a) => { const k = a ? p(a[2], 0.45) : 0; return a ? { x: (a[0] - 40) + 'px', y: (a[1] - 40) + 'px', o: k > 0 && k < 1 ? f(0.25 * (1 - k)) : 0, tf: 'scale(' + f(0.3 + 0.6 * out(k)) + ')' } : { x: '0px', y: '0px', o: 0, tf: 'none' }; };
    const L = {}, U = {}, R = {};
    for (let k = 0; k < C.N; k++) {
      const a = k ? C.SW[k - 1] : -9, b = k < C.N - 1 ? C.SW[k] : 99;
      L['k' + k] = f(Math.min(k ? p(a + 0.15, 0.35) : 1, 1 - p(b, 0.3)));
      R['k' + k] = f((C.CW || 0) * out(p(k ? a + 0.3 : 0.9, 1.2)), 1) + 'px';
      for (let n = 0; n < 8; n++) U['k' + k + 'n' + n] = 'scale(' + f(pop(p((k ? a + 0.3 : 0.9) + 0.07 * n, 0.6))) + ')';
    }
    return {
      veil: f(Math.max(1 - p(0, 0.2), p(P - 0.3, 0.3))), L, U, R, bh: f(Math.min(p(C.BH || 99, 0.2), 1)),
      e1: ent(0.3), e2: ent(0.45), e3: ent(0.6), e4: ent(0.75), e5: ent(0.9),
      pt: { x: f(px, 1) + 'px', y: f(py, 1) + 'px' },
      tp1: tap(C.T[0]), tp2: tap(C.T[1]), tp3: tap(C.T[2]), tp4: tap(C.T[3]),
      m1: win(C.M[0]), m2: win(C.M[1]), h1: win(C.H[0]), h2: win(C.H[1]),
      sk: f(0.55 + 0.45 * Math.sin(t * 4.2))
    };
  }
}'''
def page(title,w,h,font,bg,ink,body,C,pointer=True):
    base=dict(P=9,TS=2.5,S=[w-140,h-90],W=[],T=[],M=[[99,99],[99,99]],H=[[99,99],[99,99]],N=1,SW=[])
    base.update(C); base['T']=(base['T']+[None]*4)[:4]
    ov=''.join('<div style="position: absolute; left: «tp%d.x»; top: «tp%d.y»; width: 80px; height: 80px; border-radius: 40px; background: #ffffff; opacity: «tp%d.o»; transform: «tp%d.tf»; pointer-events: none"></div>'%(i,i,i,i) for i in (1,2,3,4))
    if pointer: ov+='<svg width="22" height="26" viewBox="0 0 22 26" style="position: absolute; left: «pt.x»; top: «pt.y»; display: block" aria-hidden="true"><path d="M2 2l16 12-7 1.500 4 8-3 1.500-4-8-6 4z" fill="#ffffff" stroke="#0f1115" stroke-width="1.500" stroke-linejoin="round"></path></svg>'
    ov+='<div style="position: absolute; left: 0; top: 0; width: %dpx; height: %dpx; background: %s; opacity: «veil»; pointer-events: none"></div>'%(w,h,bg)
    s='''<!doctype html>
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
'''%(title,font[0],bg,w,h,bg,ink,font[1],body,ov,w,h,JS.replace('__C__',json.dumps(base)))
    return s.replace('«','{{').replace('»','}}')
BOARDS={}
def save(name,title,w,h,html,x,y):
    open('project/'+name,'w').write(html); BOARDS[name]=dict(w=w,h=h,x=x,y=y,title=title)

# ================================================================ FILA «OGGI» (kpi.js, premiumTimelineCard)
OF=('family=Inter:wght@400;500;600&amp;family=JetBrains+Mono:wght@400;600','Inter, sans-serif')
BG,SUR,SUR2,BRD,TXT,MUT,RED,GRN='#0a0a0f','#111118','#1a1a24','#252535','#e8e8f0','#7070a0','#f87171','#4ade80'
PAID,TRIAL,LOST,WARN,GRID,FAINT='#fbbf24','#a78bfa','#3c3c55','#fb923c','#1d1d2b','#4a4a68'
MONO="'JetBrains Mono', monospace"
k=lambda t: '<div style="font-size:10.5px;color:%s;letter-spacing:.07em;text-transform:uppercase">%s</div>'%(MUT,t)
big=lambda v,c: '<div style="font-family:%s;font-size:32px;font-weight:600;line-height:1;color:%s">%s</div>'%(MONO,c,v)
note=lambda t: '<div style="font-size:12px;color:%s;line-height:1.5">%s</div>'%(MUT,t)
num=lambda t: '<span style="font-family:%s;color:%s">%s</span>'%(MONO,TXT,t)
def chg(pct,col,a,b): return '<span style="font-family:%s;font-size:11.5px;color:%s">%s</span><span style="font-size:11.5px;color:%s"> · da %s a %s</span>'%(MONO,col,pct,MUT,a,b)
vs=lambda h,t: '<div>%s <span style="font-size:11px;color:%s">%s</span></div>'%(h,FAINT,t)
tile=lambda inner,st='': '<div style="background:%s;border-radius:10px;padding:16px;display:grid;gap:10px;align-content:start;box-sizing:border-box;%s">%s</div>'%(SUR2,st,inner)
def ochart(series,marks):
    n=len(series); W,L,R,T,CH=900,30,34,16,150; ay=T+CH+16
    x=lambda i: L+i/(n-1.0)*(W-L-R); mx=max(4,max(series)); step=max(1,-(-mx//3)); top=step*(-(-mx//step)); y=lambda v: T+CH-v/float(top)*CH
    g=''.join('<line x1="%d" x2="%d" y1="%.1f" y2="%.1f" stroke="%s"></line><text x="%d" y="%.1f" font-size="9.5" text-anchor="end" fill="%s">%d</text>'%(L,W-R,y(v),y(v),GRID,L-8,y(v)+3,FAINT,v) for v in range(0,top+1,step))
    path='M%.1f,%.1f'%(x(0),y(series[0]))+''.join(' H%.1f V%.1f'%(x(i),y(series[i])) for i in range(1,n))
    area=path+' V%.1f H%.1f Z'%(y(0),x(0))
    mk=''.join('<circle cx="%.1f" cy="%.1f" r="4.5" fill="%s" stroke="%s" stroke-width="2"></circle>'%(x(i),y(series[i]),PAID,SUR) for i in marks)
    ev=max(1,-(-n//6)); idx=[i for i in range(n) if i%ev==0 and n-1-i>=ev/2.0]+[n-1]
    xl=''.join('<text x="%.1f" y="%d" font-size="9.5" text-anchor="middle" fill="%s">%s</text>'%(x(i),ay,TXT if i==n-1 else FAINT,'oggi' if i==n-1 else dm(TODAY-dt.timedelta(days=n-1-i))) for i in idx)
    return ('<svg viewBox="0 0 %d %d" style="width:100%%;height:auto;display:block"><defs><linearGradient id="ptl-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="%s" stop-opacity=".22"></stop><stop offset="1" stop-color="%s" stop-opacity="0"></stop></linearGradient></defs>%s<path d="%s" fill="url(#ptl-area)"></path><path d="%s" fill="none" stroke="%s" stroke-width="2" stroke-linejoin="round"></path>%s<circle cx="%.1f" cy="%.1f" r="5" fill="%s" stroke="%s" stroke-width="2"></circle><text x="%.1f" y="%.1f" font-size="12" font-weight="600" fill="%s" font-family="%s">%d</text>%s</svg>'
            %(W,ay+6,PAID,PAID,g,area,path,PAID,mk,x(n-1),y(series[-1]),PAID,SUR,x(n-1)+10,y(series[-1])+4,TXT,MONO,series[-1],xl)), x, y
def oshell(inner,dates=True):
    inp=lambda v: '<div style="width:140px;box-sizing:border-box;padding:4px 8px;font-size:12px;background:%s;border:1px solid %s;border-radius:6px;color:%s;display:flex;justify-content:space-between;align-items:center"><span>%s</span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="%s" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M3 10h18M8 3v4M16 3v4"></path></svg></div>'%(SUR2,BRD,TXT,v,TXT)
    lab=lambda t: '<span style="font-size:10.5px;color:%s;letter-spacing:.07em;text-transform:uppercase">%s</span>'%(MUT,t)
    d=(lab('Dal')+inp('09/09/2026')+lab('al')+inp('10/08/2026')) if dates else ''
    return ('<div style="position:absolute;left:16px;top:16px;width:1248px;box-sizing:border-box;background:%s;border:1px solid %s;border-radius:10px;padding:22px"><div style="display:flex;align-items:center;justify-content:space-between;gap:12px;height:28px;margin-bottom:16px"><div style="font-size:11px;font-weight:600;color:%s;letter-spacing:.08em;text-transform:uppercase">Abbonamenti</div><div style="display:flex;gap:8px;align-items:center"><div style="border:1px solid #2a2a3d;color:%s;font-size:10px;padding:2px 8px;border-radius:4px">Confronta</div>%s</div></div>%s</div>'
            %(SUR,BRD,MUT,MUT,d,inner))
def ocal(due):
    wd=['oggi','ven','sab','dom','lun','mar','mer','gio']; c=''
    for i in range(8):
        d=due.get(i)
        b=('<span style="min-width:20px;height:20px;padding:0 5px;box-sizing:border-box;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;font:600 11px %s;color:#111118;background:%s;%s">%d</span>'%(MONO,WARN if d[1]==d[0] else TRIAL,'box-shadow:0 0 0 2px '+WARN if 0<d[1]<d[0] else '',d[0])) if d else '<span style="height:20px"></span>'
        c+='<div style="display:grid;gap:4px;justify-items:center;font-size:10px;color:%s"><span>%s</span><span style="font-family:%s">%02d</span>%s</div>'%(TXT if i==0 else MUT,wd[i],MONO,8+i,b)
    return '<div style="display:grid;grid-template-columns:repeat(8,1fr);gap:2px">%s</div>'%c
def otiles(full):
    sq=lambda c: '<i style="width:16px;height:16px;border-radius:4px;display:block;background:%s"></i>'%c
    lg=lambda c,t: '<span style="display:inline-flex;align-items:center;gap:5px"><i style="width:8px;height:8px;border-radius:2px;display:inline-block;background:%s"></i>%s</span>'%(c,t)
    prev='rispetto ai 30 giorni prima'
    if full:
        t1=tile(k('Paganti')+big(9,PAID)+vs(chg('+200%',GRN,3,9),'rispetto al 08/09')+'<div style="display:inline-flex;width:fit-content;font-size:11px;padding:3px 9px;border-radius:99px;background:#2b1a08;color:%s">1 non rinnova</div>'%WARN+note('MRR stimato %s<br>Nuovi paganti dal 09/09 a oggi: %s %s'%(num('€ 37,29'),num(6),chg('+500%',GRN,1,6))))
        a=k('Prove iniziate')+big(15,TXT)+vs(chg('nuovo',GRN,0,15),prev)+'<div style="display:flex;gap:4px;flex-wrap:wrap">%s</div>'%(sq(PAID)*3+sq(LOST)*5+sq(WARN)*4+sq(TRIAL)*3)+'<div style="display:flex;gap:10px;flex-wrap:wrap;font-size:11px;color:%s">%s</div>'%(MUT,lg(PAID,'3 pagante')+lg(LOST,'5 persa')+lg(WARN,'4 già disdetta')+lg(TRIAL,'3 in corso'))+note('Di quelle già concluse, %s sono diventate paganti.'%num('3 su 8'))
        rows=''.join('<div style="display:flex;gap:8px;font-size:12px;color:%s"><span style="font-family:%s;color:%s">%s</span><span>iniziata il %s · annuale</span></div>'%(MUT,MONO,TXT,e,s) for e,s in (('07/10','30/09'),('06/10','29/09'),('03/10','26/09'),('03/10','26/09'),('21/09','14/09')))
        b=k('Scadute senza rinnovo')+big(5,RED)+vs(chg('nuovo',RED,0,5),prev)+'<div style="display:grid;gap:4px">%s</div>'%rows+note('Su %s prove arrivate a scadenza dal 09/09 a oggi, %s senza pagamento.'%(num(8),num(5)))
        t3=tile(k('Prove che scadono')+big(7,TRIAL)+ocal({0:(1,1),1:(1,1),4:(3,2),5:(1,0),6:(1,0)})+note('Alla scadenza Google fa pagare o chiude. La prossima è gio 08/10. <span style="color:%s">4 sono già disdette.</span>'%WARN))
    else:
        t1=tile(k('Paganti')+big(0,PAID)+vs(chg('=',MUT,0,0),'rispetto al 08/09')+note('MRR stimato %s<br>Nuovi paganti dal 09/09 a oggi: %s %s'%(num('€ 0,00'),num(0),chg('=',MUT,0,0))))
        a=k('Prove iniziate')+big(0,TXT)+vs(chg('=',MUT,0,0),prev)+note('Nessuna prova nel periodo.')
        b=k('Scadute senza rinnovo')+big(0,TXT)+vs(chg('=',MUT,0,0),prev)+note('Nessuna prova arrivata a scadenza nel periodo.')
        t3=tile(k('Prove che scadono')+big(0,TRIAL)+ocal({})+note('Nessuna prova aperta.'))
    half=lambda s: '<div style="display:grid;gap:10px;align-content:start;flex:1 1 220px">%s</div>'%s
    t2=tile('<div style="display:flex;gap:16px 20px">%s<div style="width:1px;background:#26263a;align-self:stretch"></div>%s</div>'%(half(a),half(b)),'grid-column:span 2')
    return '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:22px;height:310px">%s%s%s</div>'%(t1,t2,t3)
SER=[3]*16+[6]*3+[7]*3+[8]*7+[9]
svg,ox,oy=ochart(SER,[16,19,22])
SC=1204/900.0; CX=lambda i: 38+ox(i)*SC; CY=lambda v: 16+22+44+310+22+oy(v)*SC
tipO=lambda key,x,y,t: '<div style="position:absolute;left:%dpx;top:%dpx;background:#2a2a36;border:1px solid #55556a;color:%s;font-size:11px;padding:3px 7px;border-radius:3px;white-space:nowrap;opacity:«%s»">%s</div>'%(x,y,TXT,key,t)
b=oshell(otiles(True)+svg)+tipO('h1',CX(19)+14,CY(7)+18,'28/09: 7 paganti')+tipO('h2',478,292,'già disdetta')
save('Main.dc.html','1 - Abbonamenti oggi',1280,720,page('1 - Abbonamenti oggi',1280,720,OF,BG,TXT,b,dict(P=9,TS=4,W=[[CX(19),CY(7),2.6],[466,274,5.6]],H=[[3.3,4.6],[6.3,7.8]])),0,0)
b=oshell('<div style="height:160px;display:flex;align-items:center;justify-content:center;color:%s;font-size:12px"><span style="opacity:«sk»">Caricamento…</span></div>'%MUT,False)
save('oggi-2-caricamento.dc.html','2 - Caricamento',1280,720,page('2 - Caricamento',1280,720,OF,BG,TXT,b,dict(P=6),False),1360,0)
b=oshell('<div style="color:%s;font-size:12px">Errore caricamento abbonamenti</div>'%RED,False)
save('oggi-3-errore.dc.html','3 - Errore',1280,720,page('3 - Errore',1280,720,OF,BG,TXT,b,dict(P=6),False),2720,0)
svg0,_,_=ochart([0]*30,[])
save('oggi-4-nessun-dato.dc.html','4 - Nessun dato',1280,720,page('4 - Nessun dato',1280,720,OF,BG,TXT,oshell(otiles(False)+svg0),dict(P=6),False),4080,0)

# ================================================================ FILA «PROPOSTE» (tema Notte di «Stats»)
NF=('family=Nunito:wght@500;600;700;800','Nunito, system-ui, sans-serif')
NB,CARD,NBR,INK,NM,TER,BLU,GRY,SH='#0f1115','#1a1d24','#2a2e37','#ffffff','#9ca3af','#6b7280','#4361ee','#4b5563','#050608'
COL={'p':INK,'w':BLU,'d':GRY}; NAME={'p':'Ha pagato','w':'Pagherà','d':'Disdetta'}; ORD='pwd'
# sprint: nome, date, prove (avvio, fine prova o pagamento, esito)
SPR=[('Sprint 15','06/10–13/10',[('06/10','13/10','w'),('07/10','14/10','w')]),
     ('Sprint 15','04/10–12/10',[('05/10','12/10','w'),('05/10','12/10','d'),('05/10','12/10','d')]),
     ('Sprint 14','26/09–04/10',[('26/09','03/10','d'),('26/09','03/10','d'),('29/09','06/10','d'),('30/09','07/10','d'),('01/10','08/10','d'),('02/10','09/10','d')]),
     ('Sprint 13','21/09–23/09',[('21/09','28/09','p'),('24/09','01/10','p')]),
     ('Sprint 12','07/09–17/09',[('13/09','25/09','p'),('14/09','21/09','d')]),
     ('Sprint 11','30/08–05/09',[]),('Sprint 10','03/08–11/08',[])]
cnt=lambda tr,o: sum(1 for t in tr if t[2]==o)
srt=lambda tr: sorted(tr,key=lambda t: ORD.index(t[2]))
SHOW=[1,2,4]      # stati della tavola: sprint in corso, il peggiore (sei disdette), uno con un pagamento
PILL=(300,50,264,40); MENU=(300,98,264); ITEM=lambda i: (MENU[0]+MENU[2]/2.0, MENU[1]+6+40*i+20)
PC=(PILL[0]+PILL[2]/2.0, PILL[1]+20)
def card(h,inner,w=1216): return '<div style="position: absolute; left: 32px; top: 32px; width: %dpx; height: %dpx; background: %s; border: 1.500px solid %s; border-radius: 14px; box-shadow: 0 3px 0 %s; box-sizing: border-box; opacity: «e1.o»; transform: «e1.tf»"></div>%s'%(w,h,CARD,NBR,SH,inner)
def header(pill=True):
    s='<div style="position: absolute; left: 64px; top: 56px; font-size: 22px; font-weight: 800; line-height: 28px; opacity: «e1.o»">Prove gratuite</div>'
    if not pill: return s
    for j,i in enumerate(SHOW):
        s+='<div style="position: absolute; left: %dpx; top: %dpx; width: %dpx; height: %dpx; box-sizing: border-box; border-radius: 50px; background: #262d45; border: 1.500px solid %s; box-shadow: 0 2px 0 %s; font-size: 14px; font-weight: 700; line-height: 37px; padding-left: 18px; opacity: «L.k%d»">%s · %s<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; right: 16px; top: 12px" aria-hidden="true"><path d="M6 9l6 6 6-6"></path></svg></div>'%(PILL+(BLU,SH,j,SPR[i][0],SPR[i][1]))
    return s
def menu(key):
    rows=''.join('<div style="height: 40px; line-height: 40px; padding: 0 12px; border-radius: 8px; font-size: 14px; font-weight: 700; white-space: nowrap; color: %s">%s · %s</div>'%(INK,s[0],s[1]) for s in SPR[:5])
    return '<div style="position: absolute; left: %dpx; top: %dpx; width: %dpx; box-sizing: border-box; padding: 6px; border-radius: 14px; background: #20242d; border: 1.500px solid %s; box-shadow: 0 6px 0 %s; opacity: «%s»">%s</div>'%(MENU+(NBR,SH,key,rows))
def layers(fn): return ''.join('<div style="position: absolute; left: 0; top: 0; opacity: «L.k%d»">%s</div>'%(j,fn(j,SPR[i])) for j,i in enumerate(SHOW))
TXTN=lambda x,y,t,fs=14,fw=600,c=NM,extra='': '<div style="position: absolute; left: %dpx; top: %dpx; font-size: %dpx; font-weight: %d; line-height: %dpx; color: %s; white-space: nowrap; %s">%s</div>'%(x,y,fs,fw,int(fs*1.25),c,extra,t)
SWC=dict(P=13,TS=2.5,N=3,SW=[4.5,8.7],W=[[PC[0],PC[1],3.0],[ITEM(2)[0],ITEM(2)[1],4.3],[PC[0],PC[1],7.2],[ITEM(4)[0],ITEM(4)[1],8.5]],
         T=[[PC[0],PC[1],3.0],[ITEM(2)[0],ITEM(2)[1],4.3],[PC[0],PC[1],7.2],[ITEM(4)[0],ITEM(4)[1],8.5]],M=[[3.15,4.5],[7.35,8.7]])
unit=lambda j,n,o,sz=32: '<i style="display: block; width: %dpx; height: %dpx; border-radius: %dpx; background: %s; transform: «U.k%dn%d»"></i>'%(sz,sz,sz//4,COL[o],j,n)
# ---- 1A Tre colonne
def bodyA(j,sp):
    tr=srt(sp[2]); n=len(tr)
    s=TXTN(64,132,str(n),112,800,INK)+TXTN(68,276,'prove iniziate' if n!=1 else 'prova iniziata',18,700)
    u=0
    for c,o in enumerate(ORD):
        x=392+c*276; q=[t for t in tr if t[2]==o]
        s+='<div style="position: absolute; left: %dpx; top: 142px; width: 14px; height: 14px; border-radius: 4px; background: %s"></div>'%(x,COL[o])
        s+=TXTN(x+24,138,NAME[o] if o!='d' or len(q)==1 else 'Disdette',17,800,INK)
        s+=TXTN(x,170,str(len(q)),72,800,COL[o] if q and o!='d' else (INK if q else TER))
        s+='<div style="position: absolute; left: %dpx; top: 276px; width: 244px; display: flex; flex-wrap: wrap; gap: 8px">%s</div>'%(x,''.join(unit(j,u+i,o) for i in range(len(q)))); u+=len(q)
        cap={'p':'il '+', '.join(sorted(set(t[1] for t in q))),'w':'il '+', '.join(sorted(set(t[1] for t in q))),'d':''}[o] if q else ''
        s+=TXTN(x,324,cap)
    return s
b=card(360,header()+'<div style="position: absolute; left: 352px; top: 132px; width: 1.500px; height: 216px; background: %s; opacity: «e2.o»"></div>'%NBR+'<div style="opacity: «e2.o»">%s</div>'%layers(bodyA)+menu('m1')+menu('m2'))
save('prop-A-tre-colonne.dc.html','1A - Tre colonne',1280,424,page('1A - Tre colonne',1280,424,NF,NB,INK,b,dict(SWC,S=[1100,330])),0,2300)
# ---- 1B Una riga per prova
def bodyB(j,sp):
    tr=srt(sp[2]); s=''
    x=600
    for o in ORD:
        q=cnt(tr,o); lab={'p':'ha pagato' if q==1 else 'hanno pagato','w':'pagherà' if q==1 else 'pagheranno','d':'disdetta' if q==1 else 'disdette'}[o]
        s+='<div style="position: absolute; left: %dpx; top: 62px; width: 14px; height: 14px; border-radius: 4px; background: %s"></div>'%(x,COL[o])+TXTN(x+22,56,str(q),20,800,INK if q else TER)+TXTN(x+22+16*len(str(q)),60,lab,15,700,NM); x+=206
    for r,t in enumerate(tr):
        y=116+r*68; o=t[2]
        chip={'p':('Ha pagato il '+t[1],INK,'#0f1115'),'w':('Pagherà il '+t[1],BLU,INK),'d':('Disdetta','#2a2e37',NM)}[o]
        s+='<div style="position: absolute; left: 64px; top: %dpx; width: 1152px; height: 56px; box-sizing: border-box; border-radius: 12px; background: #20242d; border: 1.500px solid %s; transform-origin: 28px 28px"></div>'%(y,NBR)
        s+='<div style="position: absolute; left: 84px; top: %dpx">%s</div>'%(y+18,unit(j,r,o,20))
        s+=TXTN(120,y+17,'Prova iniziata il '+t[0],16,700,INK)+TXTN(360,y+18,'annuale',14,600)
        s+='<div style="position: absolute; right: -1196px; top: %dpx; height: 32px; line-height: 32px; padding: 0 16px; border-radius: 50px; background: %s; color: %s; font-size: 14px; font-weight: 800; white-space: nowrap">%s</div>'%(y+12,chip[1],chip[2],chip[0])
    return s
b=card(600,header()+'<div style="opacity: «e2.o»">%s</div>'%layers(bodyB)+menu('m1')+menu('m2'))
save('prop-B-una-riga.dc.html','1B - Una riga per prova',1280,664,page('1B - Una riga per prova',1280,664,NF,NB,INK,b,dict(SWC,S=[1100,560])),1360,2300)
# ---- 1C Sprint a confronto
def bodyC():
    s=''; cx=[860,980,1100]
    for c,o in enumerate(ORD):
        s+='<div style="position: absolute; left: %dpx; top: 112px; width: 12px; height: 12px; border-radius: 3px; background: %s"></div>'%(cx[c],COL[o])+TXTN(cx[c]+20,107,NAME[o] if o!='d' else 'Disdette',14,800,INK)
    for r,sp in enumerate(SPR):
        y=144+r*56; tr=srt(sp[2])
        hk='h1' if r==2 else 'h2' if r==4 else None
        if hk: s+='<div style="position: absolute; left: 48px; top: %dpx; width: 1184px; height: 48px; border-radius: 12px; background: #262d45; opacity: «%s»"></div>'%(y,hk)
        s+='<div style="position: absolute; left: 64px; top: %dpx; width: 1152px; height: 1.500px; background: %s"></div>'%(y+51,NBR)
        s+=TXTN(64,y+13,sp[0],16,800,INK)+TXTN(152,y+15,sp[1],14,600)
        if r<2: s+='<div style="position: absolute; left: 252px; top: %dpx; height: 24px; line-height: 24px; padding: 0 10px; border-radius: 50px; background: #262d45; font-size: 12px; font-weight: 800; color: %s">in corso</div>'%(y+12,INK)
        if tr: s+='<div style="position: absolute; left: 360px; top: %dpx; display: flex; gap: 6px">%s</div>'%(y+12,''.join('<i style="display: block; width: 24px; height: 24px; border-radius: 6px; background: %s; transform: «U.k0n%d»"></i>'%(COL[t[2]],min(7,r+i)) for i,t in enumerate(tr)))
        else: s+=TXTN(360,y+15,'nessuna prova',14,600,TER)
        for c,o in enumerate(ORD):
            q=cnt(tr,o); s+=TXTN(cx[c]+20,y+11,str(q),20,800,(COL[o] if o!='d' else INK) if q else TER)
    y=144+len(SPR)*56+8
    s+=TXTN(64,y+13,'Da sempre',16,800,INK)+TXTN(360,y+15,'17 prove iniziate',14,700)
    for c,q in enumerate((5,3,9)): s+=TXTN(cx[c]+20,y+9,str(q),24,800,COL[ORD[c]] if c<2 else INK)
    return s
b=card(604,header(False)+TXTN(360,107,'Una casella per prova',14,600,NM,'opacity: «e2.o»')+'<div style="opacity: «e2.o»">%s</div>'%bodyC())
save('prop-C-sprint-confronto.dc.html','1C - Sprint a confronto',1280,668,page('1C - Sprint a confronto',1280,668,NF,NB,INK,b,dict(P=9,TS=4,S=[1100,580],W=[[700,280,2.8],[700,392,5.6]],H=[[2.6,5.0],[5.4,8.0]])),2720,2300)
# ---- 1D Calendario delle prove
def bodyD(j,sp):
    tr=srt(sp[2]); s=''
    for c,o in enumerate(ORD):
        y=124+c*84; q=cnt(tr,o)
        s+=TXTN(64,y,str(q),48,800,(COL[o] if o!='d' else INK) if q else TER)
        s+='<div style="position: absolute; left: 124px; top: %dpx; width: 14px; height: 14px; border-radius: 4px; background: %s"></div>'%(y+24,COL[o])+TXTN(146,y+19,NAME[o] if o!='d' or q==1 else 'Disdette',16,800,INK)
    d0=D(sp[1][:5]); d1=max(max(D(t[1]) for t in tr),TODAY if (TODAY-d0).days<25 else d0)+dt.timedelta(days=1); nd=(d1-d0).days+1
    X0,X1,Y0,Y1=380,1192,132,356; X=lambda d: X0+(X1-X0)*(d-d0).days/float(nd-1)
    g=''
    for i in range(nd):
        d=d0+dt.timedelta(days=i); lab=nd<=18 or i%2==0
        g+='<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" stroke="%s" stroke-width="1"></line>'%(X(d),Y0,X(d),Y1,'#23272f')
        if d==TODAY: g+='<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" stroke="%s" stroke-width="1.5"></line><text x="%.1f" y="%d" font-size="13" font-weight="800" text-anchor="middle" fill="%s">oggi</text>'%(X(d),Y0-6,X(d),Y1,INK,X(d),Y1+22,INK)
        elif lab: g+='<text x="%.1f" y="%d" font-size="13" font-weight="600" text-anchor="middle" fill="%s">%s</text>'%(X(d),Y1+22,NM,dm(d))
    g+='<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="1.5"></line>'%(X0,Y1,X1,Y1,INK)
    step=min(40,(Y1-Y0-24)/float(max(1,len(tr))))
    for r,t in enumerate(tr):
        y=Y0+24+r*step; a,z,o=X(D(t[0])),X(D(t[1])),t[2]; c=COL[o]
        g+='<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="6" stroke-linecap="round"%s></line>'%(a,y,z,y,c,' stroke-dasharray="1 11"' if o=='w' else '')
        g+='<circle cx="%.1f" cy="%.1f" r="5" fill="%s"></circle>'%(a,y,c)
        if o=='p': g+='<circle cx="%.1f" cy="%.1f" r="9" fill="%s"></circle>'%(z,y,INK)
        if o=='w': g+='<circle cx="%.1f" cy="%.1f" r="8" fill="%s" stroke="%s" stroke-width="3"></circle>'%(z,y,CARD,BLU)
        if o=='d': g+='<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="6" stroke-linecap="round"></line>'%(z,y-8,z,y+8,c)
    return s+'<svg width="1280" height="440" style="position: absolute; left: 0; top: 0" aria-hidden="true">%s</svg>'%g
lg=lambda x,o,t,svg: '<svg width="34" height="20" style="position: absolute; left: %dpx; top: 404px" aria-hidden="true">%s</svg>'%(x,svg)+TXTN(x+42,404,t,13,600)
leg=lg(380,'p','giorno del pagamento','<line x1="2" y1="10" x2="22" y2="10" stroke="#fff" stroke-width="6" stroke-linecap="round"></line><circle cx="24" cy="10" r="8" fill="#fff"></circle>')+lg(600,'w','giorno in cui pagherà','<line x1="3" y1="10" x2="20" y2="10" stroke="%s" stroke-width="6" stroke-linecap="round" stroke-dasharray="1 11"></line><circle cx="24" cy="10" r="7" fill="%s" stroke="%s" stroke-width="3"></circle>'%(BLU,CARD,BLU))+lg(820,'d','fine della prova disdetta','<line x1="3" y1="10" x2="24" y2="10" stroke="%s" stroke-width="6" stroke-linecap="round"></line><line x1="26" y1="3" x2="26" y2="17" stroke="%s" stroke-width="6" stroke-linecap="round"></line>'%(GRY,GRY))
b=card(416,header()+'<div style="opacity: «e2.o»">%s%s</div>'%(layers(bodyD),leg)+menu('m1')+menu('m2'))
save('prop-D-calendario.dc.html','1D - Calendario delle prove',1280,480,page('1D - Calendario delle prove',1280,480,NF,NB,INK,b,dict(SWC,S=[1100,330])),4080,2300)

# ================================================================ FILA «REDESIGN»: 1A sopra, una linea per utente sotto
# prove con il giorno vero di fine: pagamento, disdetta (evento SUBSCRIPTION_CANCELED) o pagamento atteso
RS=[('Sprint 15','06/10–13/10',[('06/10','13/10','w'),('07/10','14/10','w')]),
    ('Sprint 15','04/10–12/10',[('05/10','12/10','w'),('05/10','06/10','d'),('05/10','06/10','d')]),
    ('Sprint 14','26/09–04/10',[('26/09','01/10','d'),('26/09','01/10','d'),('29/09','06/10','d'),('30/09','05/10','d'),('01/10','01/10','d'),('02/10','07/10','d')]),
    ('Sprint 13','21/09–23/09',[('21/09','28/09','p'),('24/09','01/10','p')]),
    ('Sprint 12','07/09–17/09',[('13/09','25/09','p'),('14/09','15/09','d')]),
    ('Sprint 11','30/08–05/09',[]),('Sprint 10','03/08–11/08',[])]
SAY={'p':'ha pagato il ','w':'pagherà il ','d':'disdetta il '}
def lanes(sp,X0,X1,Y0,Y1,every=1,short=False,fs=13):
    tr=sp[2]; d0=D(sp[1][:5]); d1=max([D(t[1]) for t in tr]+[D(sp[1][6:])])+dt.timedelta(days=1)
    if d0<=TODAY<=d1+dt.timedelta(days=3): d1=max(d1,TODAY+dt.timedelta(days=1))
    nd=(d1-d0).days+1; X=lambda d: X0+(X1-X0)*(d-d0).days/float(nd-1)
    if every==1 and nd>18: every=2
    base=''
    for i in range(nd):
        d=d0+dt.timedelta(days=i)
        base+='<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" stroke="#23272f" stroke-width="1"></line>'%(X(d),Y0,X(d),Y1)
        if d==TODAY: base+='<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" stroke="%s" stroke-width="1.5"></line><text x="%.1f" y="%d" font-size="%d" font-weight="800" text-anchor="middle" fill="%s">oggi</text>'%(X(d),Y0-6,X(d),Y1,INK,X(d),Y1+22,fs,INK)
        elif i%every==0 and abs((d-TODAY).days)>=every: base+='<text x="%.1f" y="%d" font-size="%d" font-weight="600" text-anchor="middle" fill="%s">%s</text>'%(X(d),Y1+22,fs,NM,dm(d)[:2] if short else dm(d))
    base+='<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="1.5"></line>'%(X0,Y1,X1,Y1,INK)
    step=min(36,(Y1-Y0-20)/float(max(1,len(tr)))); g=''; pos=[]
    for r,t in enumerate(tr):
        y=Y0+24+r*step; a,z,o=X(D(t[0])),X(D(t[1])),t[2]; c=COL[o]; pos.append((a,z,y))
        if o=='w':
            m=X(min(TODAY,D(t[1])))
            g+='<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="6" stroke-linecap="round"></line><line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="6" stroke-linecap="round" stroke-dasharray="1 11"></line>'%(a,y,m,y,c,m+11,y,z,y,c)
            g+='<circle cx="%.1f" cy="%.1f" r="8" fill="%s" stroke="%s" stroke-width="3"></circle>'%(z,y,CARD,BLU)
        else: g+='<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="6" stroke-linecap="round"></line>'%(a,y,z,y,c)
        g+='<circle cx="%.1f" cy="%.1f" r="5" fill="%s"></circle>'%(a,y,c)
        if o=='p': g+='<circle cx="%.1f" cy="%.1f" r="9" fill="%s"></circle>'%(z,y,INK)
        if o=='d': g+='<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="6" stroke-linecap="round"></line>'%(z,y-8,z,y+8,c)
    return base,g,pos
def topR(j,sp,skel=False):
    tr=sp[2]; n=len(tr); s=''; u=0
    sk=lambda x,y,w,h: '<div style="position: absolute; left: %dpx; top: %dpx; width: %dpx; height: %dpx; border-radius: 10px; background: %s; opacity: «sk»"></div>'%(x,y,w,h,NBR)
    s+=sk(64,124,72,96) if skel else TXTN(64,108,str(n),96,800,INK if n else TER)
    s+=TXTN(68,236,'prove iniziate' if n!=1 else 'prova iniziata',18,700)
    for c,o in enumerate(ORD):
        x=392+c*276; q=[t for t in tr if t[2]==o]
        s+='<div style="position: absolute; left: %dpx; top: 128px; width: 14px; height: 14px; border-radius: 4px; background: %s"></div>'%(x,COL[o])
        s+=TXTN(x+24,124,NAME[o] if o!='d' or len(q)==1 else 'Disdette',17,800,INK)
        if skel: s+=sk(x,164,48,64); continue
        s+=TXTN(x,150,str(len(q)),64,800,COL[o] if q and o!='d' else (INK if q else TER))
        s+='<div style="position: absolute; left: %dpx; top: 240px; width: 244px; display: flex; flex-wrap: wrap; gap: 6px">%s</div>'%(x,''.join(unit(j,u+i,o,24) for i in range(len(q)))); u+=len(q)
    return s
CX0,CX1,CY0,CY1=96,1184,348,600
def bodyR(j,sp):
    base,g,_=lanes(sp,CX0,CX1,CY0,CY1)
    s=topR(j,sp)+'<svg width="1280" height="640" style="position: absolute; left: 0; top: 0" aria-hidden="true">%s</svg>'%base
    if sp[2]: s+='<div style="position: absolute; left: 0; top: 0; height: 640px; width: «R.k%d»; overflow: hidden"><svg width="1280" height="640" style="display: block" aria-hidden="true">%s</svg></div>'%(j,g)
    else: s+=TXTN(400,268,'Nessuna prova',16,700,NM,'width: 784px; text-align: center')
    return s
frameR=lambda: '<div style="position: absolute; left: 352px; top: 124px; width: 1.500px; height: 148px; background: %s; opacity: «e2.o»"></div><div style="position: absolute; left: 64px; top: 304px; width: 1152px; height: 1.500px; background: %s; opacity: «e2.o»"></div>'%(NBR,NBR)
lgR=lambda x,y,t,svg: '<svg width="34" height="20" style="position: absolute; left: %dpx; top: %dpx" aria-hidden="true">%s</svg>'%(x,y,svg)+TXTN(x+42,y,t,13,600)
LG=[('giorno del pagamento','<line x1="2" y1="10" x2="22" y2="10" stroke="#fff" stroke-width="6" stroke-linecap="round"></line><circle cx="24" cy="10" r="8" fill="#fff"></circle>'),
    ('giorno in cui pagherà','<line x1="3" y1="10" x2="20" y2="10" stroke="%s" stroke-width="6" stroke-linecap="round" stroke-dasharray="1 11"></line><circle cx="24" cy="10" r="7" fill="%s" stroke="%s" stroke-width="3"></circle>'%(BLU,CARD,BLU)),
    ('giorno della disdetta','<line x1="3" y1="10" x2="24" y2="10" stroke="%s" stroke-width="6" stroke-linecap="round"></line><line x1="26" y1="3" x2="26" y2="17" stroke="%s" stroke-width="6" stroke-linecap="round"></line>'%(GRY,GRY))]
legR=lambda y=652: ''.join(lgR(96+c*230,y,t,v) for c,(t,v) in enumerate(LG))+TXTN(96+3*230,y,'Una linea per ogni prova, dal giorno in cui parte',13,600,TER)
_,_,pos=lanes(RS[1],CX0,CX1,CY0,CY1); hx,hy=(pos[1][0]+pos[1][1])/2.0,pos[1][2]
read='<div style="position: absolute; left: %dpx; top: %dpx; height: 30px; line-height: 30px; padding: 0 14px; border-radius: 50px; background: #ffffff; color: #0f1115; font-size: 13px; font-weight: 800; white-space: nowrap; opacity: «h1»">Prova iniziata il 05/10 · disdetta il 06/10</div>'%(hx+20,hy+22)
SHOW=[1,2,4]
def layersR(fn): return ''.join('<div style="position: absolute; left: 0; top: 0; opacity: «L.k%d»">%s</div>'%(j,fn(j,RS[i])) for j,i in enumerate(SHOW))
RC=dict(P=14,TS=2.6,N=3,SW=[5.3,9.5],CW=1280,S=[1100,560],W=[[hx,hy,2.0],[PC[0],PC[1],3.8],[ITEM(2)[0],ITEM(2)[1],5.1],[PC[0],PC[1],8.0],[ITEM(4)[0],ITEM(4)[1],9.3]],
        T=[[PC[0],PC[1],3.8],[ITEM(2)[0],ITEM(2)[1],5.1],[PC[0],PC[1],8.0],[ITEM(4)[0],ITEM(4)[1],9.3]],M=[[3.95,5.3],[8.15,9.5]],H=[[2.0,3.1],[99,99]])
b=card(696,header()+frameR()+'<div style="opacity: «e2.o»">%s%s</div>'%(layersR(bodyR),legR())+read+menu('m1')+menu('m2'))
save('red-1-prove.dc.html','1 - Prove gratuite',1280,760,page('1 - Prove gratuite',1280,760,NF,NB,INK,b,RC),0,1100)
# caricamento
skl=''.join('<div style="position: absolute; left: %dpx; top: %dpx; width: %dpx; height: 6px; border-radius: 3px; background: %s; opacity: «sk»"></div>'%(a,372+36*r,w,NBR) for r,(a,w) in enumerate(((216,640),(216,180),(330,420))))
base0,_,_=lanes(('','04/10–12/10',[]),CX0,CX1,CY0,CY1)
SHOW=[1]
b=card(696,header()+frameR()+topR(0,RS[1],True)+'<svg width="1280" height="640" style="position: absolute; left: 0; top: 0; opacity: 0.5" aria-hidden="true">%s</svg>'%base0+skl+legR())
save('red-2-caricamento.dc.html','2 - Caricamento',1280,760,page('2 - Caricamento',1280,760,NF,NB,INK,b,dict(P=6),False),1360,1100)
# errore
b=card(480,header()+'<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; left: 620px; top: 168px; display: block" aria-hidden="true"><path d="M12 3l10 18H2z"></path><path d="M12 10v5"></path><path d="M12 18v.500"></path></svg>'+TXTN(0,224,'Errore nel caricamento',20,800,INK,'width: 1280px; text-align: center')+TXTN(0,340,'',14,600,NM,'width: 1280px; text-align: center')+'<button style="position: absolute; left: 560px; top: 280px; width: 160px; height: 48px; padding: 0; border: 0; border-radius: 50px; background: %s; box-shadow: 0 3px 0 %s; color: #ffffff; font-family: inherit; font-size: 15px; font-weight: 800; overflow: hidden"><span style="position: absolute; inset: 0; background: rgba(255,255,255,0.18); opacity: «bh»"></span><span style="position: relative">Riprova</span></button>'%(BLU,SH))
save('red-3-errore.dc.html','3 - Errore',1280,544,page('3 - Errore',1280,544,NF,NB,INK,b,dict(P=7,TS=4,S=[1000,460],W=[[640,304,2.6]],T=[[640,304,3.4]],BH=2.5)),2720,1100)
# sprint senza prove
SHOW=[5]
b=card(696,header()+frameR()+'<div style="opacity: «e2.o»">%s%s</div>'%(layersR(bodyR),legR()))
save('red-4-nessuna-prova.dc.html','4 - Nessuna prova',1280,760,page('4 - Nessuna prova',1280,760,NF,NB,INK,b,dict(P=6,CW=1280),False),4080,1100)
# finestra stretta (telefono 390)
sp=RS[1]; tr=sp[2]; base,g,pos=lanes(sp,40,350,300,440,2,True,12)
s='<div style="position: absolute; left: 16px; top: 16px; width: 358px; height: 608px; background: %s; border: 1.500px solid %s; border-radius: 14px; box-shadow: 0 3px 0 %s; box-sizing: border-box; opacity: «e1.o»"></div>'%(CARD,NBR,SH)
s+=TXTN(32,36,'Prove gratuite',20,800,INK)
s+='<div style="position: absolute; left: 32px; top: 76px; width: 326px; height: 44px; box-sizing: border-box; border-radius: 50px; background: #262d45; border: 1.500px solid %s; box-shadow: 0 2px 0 %s; font-size: 14px; font-weight: 700; line-height: 41px; padding-left: 18px">Sprint 15 · 04/10–12/10<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; right: 16px; top: 14px" aria-hidden="true"><path d="M6 9l6 6 6-6"></path></svg></div>'%(BLU,SH)
s+=TXTN(32,136,'3',56,800,INK)+TXTN(76,166,'prove iniziate',16,700)
for c,o in enumerate(ORD):
    x=32+c*112; q=cnt(tr,o)
    s+=TXTN(x,212,str(q),36,800,(COL[o] if o!='d' else INK) if q else TER)+'<div style="position: absolute; left: %dpx; top: 264px; width: 12px; height: 12px; border-radius: 3px; background: %s"></div>'%(x,COL[o])+TXTN(x+18,260,NAME[o] if o!='d' or q==1 else 'Disdette',13,800,INK)
s+='<svg width="390" height="480" style="position: absolute; left: 0; top: 0" aria-hidden="true">%s</svg><div style="position: absolute; left: 0; top: 0; height: 480px; width: «R.k0»; overflow: hidden"><svg width="390" height="480" style="display: block" aria-hidden="true">%s</svg></div>'%(base,g)
s+=''.join(lgR(40,488+c*30,t,v) for c,(t,v) in enumerate(LG))
tx,ty=(pos[0][0]+pos[0][1])/2.0,pos[0][2]
s+='<div style="position: absolute; left: 40px; top: 580px; width: 310px; text-align: center; height: 30px; line-height: 30px; border-radius: 50px; background: #ffffff; color: #0f1115; font-size: 13px; font-weight: 800; white-space: nowrap; opacity: «h1»">Iniziata il 05/10 · pagherà il 12/10</div>'
save('red-5-finestra-stretta.dc.html','5 - Finestra stretta',390,640,page('5 - Finestra stretta',390,640,NF,NB,INK,s,dict(P=8,TS=4,CW=390,T=[[tx,ty,2.6]],H=[[2.8,6.5],[99,99]]),False),5440,1100)

# 1D rifatta con i giorni veri delle disdette (stessa tavola, stessi dati della fila «Redesign»)
SPR=RS; SHOW=[1,2,4]
b=card(416,header()+'<div style="opacity: «e2.o»">%s%s</div>'%(layers(bodyD),leg.replace('fine della prova disdetta','giorno della disdetta'))+menu('m1')+menu('m2'))
save('prop-D-calendario.dc.html','1D - Calendario delle prove',1280,480,page('1D - Calendario delle prove',1280,480,NF,NB,INK,b,dict(SWC,S=[1100,330])),4080,2300)

# ================================================================ «Redesign» v2: grafico vero al posto delle linee per prova
# X = giorno della prova (0 avvio, 7 pagamento), Y = prove ancora attive. Scende a ogni disdetta; al giorno 7 resta chi paga.
def surv(sp,X0,X1,Y0,Y1,fs=13,short=False):
    tr=sp[2]; N=len(tr); off=[(D(t[1])-D(t[0])).days for t in tr if t[2]=='d']
    a=[N-sum(1 for o in off if o<d) for d in range(7)]+[N-len(off)]
    opn=[(TODAY-D(t[0])).days for t in tr if t[2]=='w']; real=min(opn) if opn else 7
    top=max(2,N); st=1 if top<=6 else 2; top=st*(-(-top//st))
    X=lambda d: X0+(X1-X0)*d/7.0; Y=lambda v: Y1-(Y1-Y0-16)*v/float(top)
    b=''
    for v in range(0,top+1,st):
        b+='<line x1="%d" y1="%.1f" x2="%d" y2="%.1f" stroke="%s" stroke-width="%s"></line><text x="%d" y="%.1f" font-size="%d" font-weight="600" text-anchor="end" fill="%s">%d</text>'%(X0,Y(v),X1,Y(v),INK if v==0 else '#2a2e37','1.5' if v==0 else '1',X0-12,Y(v)+4,fs,NM,v)
    for d in range(8):
        lab={0:'avvio',7:'7' if short else 'pagamento'}.get(d,str(d) if short else 'giorno %d'%d)
        b+='<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" stroke="%s" stroke-width="1"></line><text x="%.1f" y="%d" font-size="%d" font-weight="600" text-anchor="%s" fill="%s">%s</text>'%(X(d),Y1,X(d),Y1+6,TER,X(d),Y1+24,fs,'end' if d==7 and not short else 'middle',NM,lab)
    if not N: return b,'',X,Y,a
    P=lambda ds: ' '.join('%.1f,%.1f'%(X(d),Y(a[d])) for d in ds)
    g='<polyline points="%s" fill="none" stroke="%s" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"></polyline>'%(P(range(0,real+1)),INK)
    if real<7: g+='<polyline points="%s" fill="none" stroke="%s" stroke-width="3" stroke-dasharray="7 6" stroke-linecap="round"></polyline>'%(P(range(real,8)),BLU)
    ch=[0]+[d for d in range(1,real+1) if a[d]!=a[d-1] or (d<real and a[d]!=a[d+1])]+[real]
    g+=''.join('<circle cx="%.1f" cy="%.1f" r="5" fill="%s" stroke="%s" stroke-width="2"></circle>'%(X(d),Y(a[d]),INK,CARD) for d in sorted(set(ch)))
    g+=('<circle cx="%.1f" cy="%.1f" r="7" fill="%s" stroke="%s" stroke-width="3"></circle>'%(X(7),Y(a[7]),CARD,BLU)) if real<7 else '<circle cx="%.1f" cy="%.1f" r="8" fill="%s"></circle>'%(X(7),Y(a[7]),INK)
    return b,g,X,Y,a
SX0,SX1,SY0,SY1=112,1184,348,592
def bodyR(j,sp):
    b,g,_,_,_=surv(sp,SX0,SX1,SY0,SY1)
    s=topR(j,sp)+'<svg width="1280" height="640" style="position: absolute; left: 0; top: 0" aria-hidden="true">%s</svg>'%b
    if sp[2]: s+='<div style="position: absolute; left: 0; top: 0; height: 640px; width: «R.k%d»; overflow: hidden"><svg width="1280" height="640" style="display: block" aria-hidden="true">%s</svg></div>'%(j,g)
    else: s+=TXTN(400,268,'Nessuna prova',16,700,NM,'width: 784px; text-align: center')
    return s
ttl=TXTN(64,316,'Prove ancora attive, giorno per giorno della prova',15,800,INK,'opacity: «e2.o»')
LG2=[('prove ancora attive','<line x1="2" y1="10" x2="30" y2="10" stroke="#fff" stroke-width="3" stroke-linecap="round"></line><circle cx="16" cy="10" r="5" fill="#fff"></circle>'),
     ('atteso, se nessun altro disdice','<line x1="2" y1="10" x2="24" y2="10" stroke="%s" stroke-width="3" stroke-linecap="round" stroke-dasharray="7 6"></line><circle cx="26" cy="10" r="6" fill="%s" stroke="%s" stroke-width="3"></circle>'%(BLU,CARD,BLU))]
legR=lambda y=652: lgR(112,y,*LG2[0])+lgR(330,y,*LG2[1])+TXTN(640,y,'La linea scende a ogni disdetta. Al giorno 7 resta chi paga.',13,600,TER)
frameR=lambda: '<div style="position: absolute; left: 352px; top: 124px; width: 1.500px; height: 148px; background: %s; opacity: «e2.o»"></div><div style="position: absolute; left: 64px; top: 296px; width: 1152px; height: 1.500px; background: %s; opacity: «e2.o»"></div>'%(NBR,NBR)+ttl
_,_,X,Y,a=surv(RS[1],SX0,SX1,SY0,SY1); hx,hy=X(2),Y(a[2])
read='<div style="position: absolute; left: %dpx; top: %dpx; height: 30px; line-height: 30px; padding: 0 14px; border-radius: 50px; background: #ffffff; color: #0f1115; font-size: 13px; font-weight: 800; white-space: nowrap; opacity: «h1»">Giorno 2 · 1 prova attiva su 3</div><div style="position: absolute; left: %.1fpx; top: %dpx; width: 1.500px; height: %dpx; background: #ffffff; opacity: «h1»"></div>'%(hx+16,hy-48,hx-0.75,SY0,SY1-SY0)
SHOW=[1,2,4]
RC.update(W=[[hx,hy,2.0]]+RC['W'][1:])
b=card(696,header()+frameR()+'<div style="opacity: «e2.o»">%s%s</div>'%(layersR(bodyR),legR())+read+menu('m1')+menu('m2'))
save('red-1-prove.dc.html','1 - Prove gratuite',1280,760,page('1 - Prove gratuite',1280,760,NF,NB,INK,b,RC),0,1100)
b0,_,X,Y,_=surv(('','',[('05/10','12/10','w')]*3),SX0,SX1,SY0,SY1)
skl='<div style="position: absolute; left: %dpx; top: %dpx; width: %dpx; height: 6px; border-radius: 3px; background: %s; opacity: «sk»; transform: rotate(9deg); transform-origin: 0 0"></div>'%(SX0,SY0+40,SX1-SX0-40,NBR)
SHOW=[1]
b=card(696,header()+frameR()+topR(0,RS[1],True)+'<svg width="1280" height="640" style="position: absolute; left: 0; top: 0; opacity: 0.5" aria-hidden="true">%s</svg>'%b0+skl+legR())
save('red-2-caricamento.dc.html','2 - Caricamento',1280,760,page('2 - Caricamento',1280,760,NF,NB,INK,b,dict(P=6),False),1360,1100)
SHOW=[5]
b=card(696,header()+frameR()+'<div style="opacity: «e2.o»">%s%s</div>'%(layersR(bodyR),legR()))
save('red-4-nessuna-prova.dc.html','4 - Nessuna prova',1280,760,page('4 - Nessuna prova',1280,760,NF,NB,INK,b,dict(P=6,CW=1280),False),4080,1100)
sp=RS[1]; tr=sp[2]; b1,g1,X,Y,a=surv(sp,56,350,332,470,12,True)
s='<div style="position: absolute; left: 16px; top: 16px; width: 358px; height: 608px; background: %s; border: 1.500px solid %s; border-radius: 14px; box-shadow: 0 3px 0 %s; box-sizing: border-box; opacity: «e1.o»"></div>'%(CARD,NBR,SH)
s+=TXTN(32,36,'Prove gratuite',20,800,INK)
s+='<div style="position: absolute; left: 32px; top: 76px; width: 326px; height: 44px; box-sizing: border-box; border-radius: 50px; background: #262d45; border: 1.500px solid %s; box-shadow: 0 2px 0 %s; font-size: 14px; font-weight: 700; line-height: 41px; padding-left: 18px">Sprint 15 · 04/10–12/10<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; right: 16px; top: 14px" aria-hidden="true"><path d="M6 9l6 6 6-6"></path></svg></div>'%(BLU,SH)
s+=TXTN(32,136,'3',56,800,INK)+TXTN(76,166,'prove iniziate',16,700)
for c,o in enumerate(ORD):
    x=32+c*112; q=cnt(tr,o)
    s+=TXTN(x,212,str(q),36,800,(COL[o] if o!='d' else INK) if q else TER)+'<div style="position: absolute; left: %dpx; top: 264px; width: 12px; height: 12px; border-radius: 3px; background: %s"></div>'%(x,COL[o])+TXTN(x+18,260,NAME[o] if o!='d' or q==1 else 'Disdette',13,800,INK)
s+=TXTN(32,300,'Prove ancora attive, per giorno di prova',13,800,INK)
s+='<svg width="390" height="520" style="position: absolute; left: 0; top: 0" aria-hidden="true">%s</svg><div style="position: absolute; left: 0; top: 0; height: 520px; width: «R.k0»; overflow: hidden"><svg width="390" height="520" style="display: block" aria-hidden="true">%s</svg></div>'%(b1,g1)
s+=lgR(40,516,*LG2[0])+lgR(40,544,*LG2[1])
s+='<div style="position: absolute; left: 40px; top: 580px; width: 310px; text-align: center; height: 30px; line-height: 30px; border-radius: 50px; background: #ffffff; color: #0f1115; font-size: 13px; font-weight: 800; white-space: nowrap; opacity: «h1»">Giorno 2 · 1 prova attiva su 3</div>'
save('red-5-finestra-stretta.dc.html','5 - Finestra stretta',390,640,page('5 - Finestra stretta',390,640,NF,NB,INK,s,dict(P=8,TS=4,CW=390,T=[[X(2),Y(a[2]),2.6]],H=[[2.8,6.5],[99,99]]),False),5440,1100)

# ================================================================ «Redesign» v3: partite, disdette e pagate sul calendario dello sprint
# X = giorni dello sprint, Y = numero di prove. Ogni prova è un punto sulla curva delle partite (giorno di avvio)
# e un punto sulla curva delle pagate o delle disdette (giorno di chiusura).
ORA='#fb8b04'; GRN2='#4ade80'; RED2='#f87171'; COL=dict(p=GRN2,w=BLU,d=RED2)
def cum(sp,X0,X1,Y0,Y1,every=1,short=False,fs=13):
    # v4: X = giorni dello sprint, Y = numero della prova. Ogni prova è una linea orizzontale dal giorno di avvio a quello di chiusura.
    tr=sorted(sp[2],key=lambda t:(D(t[0]),D(t[1]))); N=len(tr); d0=D(sp[1][:5]); d1=max([D(t[1]) for t in tr]+[D(sp[1][6:])])+dt.timedelta(days=1)
    live=d0<=TODAY<=d1+dt.timedelta(days=3)
    if live: d1=max(d1,TODAY+dt.timedelta(days=1))
    nd=(d1-d0).days+1
    if every==1 and nd>18: every=2 if nd<=24 else 4
    top=max(3,N)+0.6
    X=lambda d: X0+(X1-X0)*(d-d0).days/float(nd-1); Y=lambda v: Y1-(Y1-Y0)*v/float(top)
    b='<text x="%d" y="%d" font-size="%d" font-weight="600" text-anchor="end" fill="%s">prova</text>'%(X0-12,Y0-10,fs,TER)
    for i in range(nd):
        d=d0+dt.timedelta(days=i)
        b+='<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" stroke="#23272f" stroke-width="1"></line>'%(X(d),Y0,X(d),Y1+(6 if i%every==0 else 3))
        if d==TODAY: b+='<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" stroke="%s" stroke-width="1.5"></line><text x="%.1f" y="%d" font-size="%d" font-weight="800" text-anchor="middle" fill="%s">oggi</text>'%(X(d),Y0,X(d),Y1,INK,X(d),Y1+24,fs,INK)
        elif i%every==0 and abs((d-TODAY).days)>=every: b+='<text x="%.1f" y="%d" font-size="%d" font-weight="600" text-anchor="middle" fill="%s">%s</text>'%(X(d),Y1+24,fs,NM,dm(d)[:2] if short else dm(d))
    b+='<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="1.5"></line><line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="1.5"></line>'%(X0,Y1,X1,Y1,INK,X0,Y0,X0,Y1,INK)
    for v in range(1,max(3,N)+1):
        b+='<line x1="%d" y1="%.1f" x2="%d" y2="%.1f" stroke="#2a2e37" stroke-width="1"></line><text x="%d" y="%.1f" font-size="%d" font-weight="700" text-anchor="end" fill="%s">%d</text>'%(X0,Y(v),X1,Y(v),X0-12,Y(v)+4,fs,NM if v<=N else TER,v)
    g=''; hov={}
    for r,t in enumerate(tr):
        y=Y(r+1); o=t[2]; xa=X(D(t[0])); xz=X(min(TODAY,D(t[1])) if o=='w' else D(t[1]))
        g+='<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="4" stroke-linecap="round"></line>'%(xa,y,xz,y,BLU)
        g+='<circle cx="%.1f" cy="%.1f" r="5" fill="%s" stroke="%s" stroke-width="2"></circle>'%(xa,y,CARD,BLU)
        if o!='w':
            xe=X(D(t[1])+dt.timedelta(days=1))
            g+='<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="8" stroke-linecap="round"></line>'%(xz,y,xe,y,COL[o])
            g+='<circle cx="%.1f" cy="%.1f" r="9" fill="%s" stroke="%s" stroke-width="3"></circle>'%(xz,y,COL[o],CARD)
        if o=='d' and 'd' not in hov: hov={'s':[None,(xa,y)],'d':[None,(xz,y)]}
    return b,g,hov
def topR(j,sp,skel=False):
    # numeri in colonna a sinistra del grafico, come in 1D
    tr=sp[2]; s=''
    rows=[(len(tr),None,'prove' if len(tr)!=1 else 'prova')]+[(cnt(tr,o),o,{'p':'Ha pagato','w':'Pagherà','d':'Disdette' if cnt(tr,o)!=1 else 'Disdetta'}[o]) for o in ORD]
    for r,(q,o,lab) in enumerate(rows):
        y=116+r*80
        if skel: s+='<div style="position: absolute; left: 64px; top: %dpx; width: 48px; height: 44px; border-radius: 10px; background: %s; opacity: «sk»"></div>'%(y+6,NBR)
        else: s+=TXTN(64,y,str(q),44,800,(INK if o in (None,'d') else COL[o]) if q else TER)
        if o: s+='<div style="position: absolute; left: 140px; top: %dpx; width: 14px; height: 14px; border-radius: 4px; background: %s"></div>'%(y+22,COL[o])
        s+=TXTN(162 if o else 140,y+17,lab,16,800,INK if o else NM)
    if not skel: s+='<div style="position: absolute; left: 64px; top: 432px; width: 252px; display: flex; flex-wrap: wrap; gap: 5px">%s</div>'%''.join('<i style="display: block; width: 16px; height: 16px; border-radius: 4px; background: %s; transform: «U.k%dn%d»"></i>'%(COL[t[2]],j,min(n,7)) for n,t in enumerate(srt(tr)))
    return s
SX0,SX1,SY0,SY1=400,1184,148,412
def bodyR(j,sp):
    b,g,_=cum(sp,SX0,SX1,SY0,SY1)
    s=topR(j,sp)+'<svg width="1280" height="640" style="position: absolute; left: 0; top: 0" aria-hidden="true">%s</svg>'%b
    if sp[2]: s+='<div style="position: absolute; left: 0; top: 0; height: 640px; width: «R.k%d»; overflow: hidden"><svg width="1280" height="640" style="display: block" aria-hidden="true">%s</svg></div>'%(j,g)
    else: s+=TXTN(400,268,'Nessuna prova',16,700,NM,'width: 784px; text-align: center')
    return s
ttl=TXTN(400,108,'Durata prove',15,800,INK,'opacity: «e2.o»')
ln_=lambda c,dash='': '<line x1="2" y1="10" x2="30" y2="10" stroke="%s" stroke-width="3" stroke-linecap="round"%s></line>'%(c,dash)
LG3=[('prova','<circle cx="5" cy="10" r="4" fill="%s" stroke="%s" stroke-width="2"></circle><line x1="10" y1="10" x2="30" y2="10" stroke="%s" stroke-width="4" stroke-linecap="round"></line>'%(CARD,BLU,BLU)),
     ('pagato','<line x1="10" y1="10" x2="30" y2="10" stroke="%s" stroke-width="8" stroke-linecap="round"></line><circle cx="9" cy="10" r="8" fill="%s"></circle>'%(GRN2,GRN2)),('disdetta','<line x1="10" y1="10" x2="30" y2="10" stroke="%s" stroke-width="8" stroke-linecap="round"></line><circle cx="9" cy="10" r="8" fill="%s"></circle>'%(RED2,RED2))]
legR=lambda y=468: ''.join(lgR(400+c*140,y,t,v) for c,(t,v) in enumerate(LG3))+TXTN(900,y,'',13,600,TER)
frameR=lambda: '<div style="position: absolute; left: 340px; top: 116px; width: 1.500px; height: 356px; background: %s; opacity: «e2.o»"></div>'%NBR+ttl
_,_,hv=cum(RS[1],SX0,SX1,SY0,SY1); ps,pc=hv['s'][1],hv['d'][1]
ring=lambda p: '<div style="position: absolute; left: %.1fpx; top: %.1fpx; width: 26px; height: 26px; border-radius: 13px; border: 2px solid #ffffff; box-sizing: border-box; opacity: «h1»"></div>'%(p[0]-13,p[1]-13)
read=ring(ps)+ring(pc)+'<div style="position: absolute; left: %dpx; top: %dpx; height: 30px; line-height: 30px; padding: 0 14px; border-radius: 50px; background: #ffffff; color: #0f1115; font-size: 13px; font-weight: 800; white-space: nowrap; opacity: «h1»">05/10 – 06/10</div>'%(pc[0]+24,pc[1]-15)
SHOW=[1,2,4]
RC.update(W=[[pc[0]+4,pc[1]+4,2.0]]+RC['W'][1:])
b=card(696,header()+frameR()+'<div style="opacity: «e2.o»">%s%s</div>'%(layersR(bodyR),legR())+read+menu('m1')+menu('m2'))
save('red-1-prove.dc.html','1 - Prove gratuite',1280,760,page('1 - Prove gratuite',1280,760,NF,NB,INK,b,RC),0,1100)
b0,_,_=cum(('','04/10–12/10',[]),SX0,SX1,SY0,SY1)
SHOW=[1]
b=card(696,header()+frameR()+topR(0,RS[1],True)+'<svg width="1280" height="640" style="position: absolute; left: 0; top: 0; opacity: 0.5" aria-hidden="true">%s</svg>'%b0+skl+legR())
save('red-2-caricamento.dc.html','2 - Caricamento',1280,760,page('2 - Caricamento',1280,760,NF,NB,INK,b,dict(P=6),False),1360,1100)
SHOW=[5]
b=card(696,header()+frameR()+'<div style="opacity: «e2.o»">%s%s</div>'%(layersR(bodyR),legR()))
save('red-4-nessuna-prova.dc.html','4 - Nessuna prova',1280,760,page('4 - Nessuna prova',1280,760,NF,NB,INK,b,dict(P=6,CW=1280),False),4080,1100)
sp=RS[1]; tr=sp[2]; b1,g1,hv=cum(sp,56,350,340,470,2,True,12); pc=hv['d'][1]
s='<div style="position: absolute; left: 16px; top: 16px; width: 358px; height: 608px; background: %s; border: 1.500px solid %s; border-radius: 14px; box-shadow: 0 3px 0 %s; box-sizing: border-box; opacity: «e1.o»"></div>'%(CARD,NBR,SH)
s+=TXTN(32,36,'Prove gratuite',20,800,INK)
s+='<div style="position: absolute; left: 32px; top: 76px; width: 326px; height: 44px; box-sizing: border-box; border-radius: 50px; background: #262d45; border: 1.500px solid %s; box-shadow: 0 2px 0 %s; font-size: 14px; font-weight: 700; line-height: 41px; padding-left: 18px">Sprint 15 · 04/10–12/10<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; right: 16px; top: 14px" aria-hidden="true"><path d="M6 9l6 6 6-6"></path></svg></div>'%(BLU,SH)
s+=TXTN(32,136,'3',56,800,INK)+TXTN(76,166,'prove iniziate',16,700)
for c,o in enumerate(ORD):
    x=32+c*112; q=cnt(tr,o)
    s+=TXTN(x,212,str(q),36,800,(COL[o] if o!='d' else INK) if q else TER)+'<div style="position: absolute; left: %dpx; top: 264px; width: 12px; height: 12px; border-radius: 3px; background: %s"></div>'%(x,COL[o])+TXTN(x+18,260,NAME[o] if o!='d' or q==1 else 'Disdette',13,800,INK)
s+=TXTN(32,300,'Durata prove',13,800,INK)
s+='<svg width="390" height="520" style="position: absolute; left: 0; top: 0" aria-hidden="true">%s</svg><div style="position: absolute; left: 0; top: 0; height: 520px; width: «R.k0»; overflow: hidden"><svg width="390" height="520" style="display: block" aria-hidden="true">%s</svg></div>'%(b1,g1)
s+=''.join(lgR(40+(c%2)*160,516+(c//2)*28,t,v) for c,(t,v) in enumerate(LG3))
s+='<div style="position: absolute; left: 40px; top: 580px; width: 310px; text-align: center; height: 30px; line-height: 30px; border-radius: 50px; background: #ffffff; color: #0f1115; font-size: 13px; font-weight: 800; white-space: nowrap; opacity: «h1»">05/10 – 06/10</div>'
save('red-5-finestra-stretta.dc.html','5 - Finestra stretta',390,640,page('5 - Finestra stretta',390,640,NF,NB,INK,s,dict(P=8,TS=4,CW=390,T=[[pc[0],pc[1],2.6]],H=[[2.8,6.5],[99,99]]),False),5440,1100)

# ================================================================ «Redesign» v5: periodo a scelta — Oggi, Settimana, Mese, Sprint
WEEK=('Settimana','02/10–08/10',[('02/10','07/10','d'),('05/10','12/10','w'),('05/10','06/10','d'),('05/10','06/10','d'),('06/10','13/10','w'),('07/10','14/10','w')])
MONTH=('Mese','09/09–08/10',[('13/09','25/09','p'),('14/09','15/09','d'),('21/09','28/09','p'),('24/09','01/10','p')]+RS[2][2]+RS[1][2]+RS[0][2])
DAY=('Oggi','08/10–08/10',[])
SEGS=['Oggi','Settimana','Mese','Sprint']; GX,GW,GY=800,104,50
segc=lambda i: (GX+4+GW*i+GW/2.0,GY+20)
def headP(states):   # states: [(indice del segmento, periodo)]
    h='<div style="position: absolute; left: 64px; top: 56px; font-size: 22px; font-weight: 800; line-height: 28px; opacity: «e1.o»">Prove gratuite</div>'
    h+='<div style="position: absolute; left: %dpx; top: %dpx; width: %dpx; height: 40px; box-sizing: border-box; border-radius: 50px; background: #14171d; border: 1.500px solid %s; opacity: «e1.o»"></div>'%(GX,GY,GW*4+8,NBR)
    for j,(si,sp) in enumerate(states):
        h+='<div style="position: absolute; left: %dpx; top: %dpx; width: %dpx; height: 32px; box-sizing: border-box; border-radius: 50px; background: #262d45; border: 1.500px solid %s; opacity: «L.k%d»"></div>'%(GX+4+GW*si,GY+4,GW,BLU,j)
        if si==3: h+='<div style="position: absolute; left: %dpx; top: %dpx; width: %dpx; height: %dpx; box-sizing: border-box; border-radius: 50px; background: #262d45; border: 1.500px solid %s; box-shadow: 0 2px 0 %s; font-size: 14px; font-weight: 700; line-height: 37px; padding-left: 18px; opacity: «L.k%d»">%s · %s<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; right: 16px; top: 12px" aria-hidden="true"><path d="M6 9l6 6 6-6"></path></svg></div>'%(PILL+(BLU,SH,j,sp[0],sp[1]))
        else: h+=TXTN(300,60,'08/10' if si==0 else '%s – %s'%(sp[1][:5],sp[1][6:]),15,700,NM,'opacity: «L.k%d»'%j)
    for i,t in enumerate(SEGS): h+='<div style="position: absolute; left: %dpx; top: %dpx; width: %dpx; height: 32px; line-height: 32px; text-align: center; font-size: 14px; font-weight: 800; color: %s; opacity: «e1.o»">%s</div>'%(GX+4+GW*i,GY+4,GW,INK,t)
    return h
def layP(states): return ''.join('<div style="position: absolute; left: 0; top: 0; opacity: «L.k%d»">%s</div>'%(j,bodyR(j,sp)) for j,(si,sp) in enumerate(states))
ST=[(3,RS[1]),(1,WEEK),(2,MONTH)]
c1,c2=segc(1),segc(2)
PCF=dict(P=13,TS=2.6,N=3,SW=[4.0,8.2],CW=1280,S=[1100,440],W=[RC['W'][0],[c1[0],c1[1],3.8],[c2[0],c2[1],8.0]],T=[[c1[0],c1[1],3.8],[c2[0],c2[1],8.0]],H=[[2.0,3.1],[99,99]])
b=card(480,headP(ST)+frameR()+'<div style="opacity: «e2.o»">%s%s</div>'%(layP(ST),legR())+read)
save('red-1-prove.dc.html','1 - Prove gratuite',1280,544,page('1 - Prove gratuite',1280,544,NF,NB,INK,b,PCF),0,1100)
b=card(480,headP([(3,RS[1])])+frameR()+topR(0,RS[1],True)+'<svg width="1280" height="640" style="position: absolute; left: 0; top: 0; opacity: 0.5" aria-hidden="true">%s</svg>'%b0+skl+legR())
save('red-2-caricamento.dc.html','2 - Caricamento',1280,544,page('2 - Caricamento',1280,544,NF,NB,INK,b,dict(P=6),False),1360,1100)
b=card(480,headP([(0,DAY)])+frameR()+'<div style="opacity: «e2.o»">%s%s</div>'%(layP([(0,DAY)]),legR()))
save('red-4-nessuna-prova.dc.html','4 - Nessuna prova',1280,544,page('4 - Nessuna prova',1280,544,NF,NB,INK,b,dict(P=6,CW=1280),False),4080,1100)
# finestra stretta: i quattro periodi in una riga sopra il titolo
i0=s.index('<div style="position: absolute; left: 16px; top: 16px; width: 358px; height: 608px;'); i1=s.index('</div>',i0)+6
seg='<div style="position: absolute; left: 32px; top: 32px; width: 326px; height: 44px; box-sizing: border-box; border-radius: 50px; background: #14171d; border: 1.500px solid %s"></div><div style="position: absolute; left: %dpx; top: 36px; width: 80px; height: 36px; box-sizing: border-box; border-radius: 50px; background: #262d45; border: 1.500px solid %s"></div>'%(NBR,32+3+80*3,BLU)
seg+=''.join('<div style="position: absolute; left: %dpx; top: 36px; width: 80px; height: 36px; line-height: 36px; text-align: center; font-size: 13px; font-weight: 800">%s</div>'%(32+3+80*i,t) for i,t in enumerate(SEGS))
s=s[i0:i1].replace('height: 608px','height: 664px')+seg+'<div style="position: absolute; left: 0; top: 56px">'+s[i1:]+'</div>'
save('red-5-finestra-stretta.dc.html','5 - Finestra stretta',390,696,page('5 - Finestra stretta',390,696,NF,NB,INK,s,dict(P=8,TS=4,CW=390,T=[[pc[0],pc[1]+56,2.6]],H=[[2.8,6.5],[99,99]]),False),5440,1100)
json.dump({'v':3,'createdOnFiles':{'v':1,'at':'2026-10-08T12:00:00Z'},'title':'KPI Abbonamenti — prove gratuite','launch':{'view':'canvas'},'pages':[],'boards':BOARDS,'order':list(BOARDS),'notes':{'oggi':{'x':0,'y':-300,'text':'Oggi','kind':'title1','maxW':5360},'redesign':{'x':0,'y':800,'text':'Redesign','kind':'title1','maxW':5360},'proposte':{'x':0,'y':2000,'text':'Proposte','kind':'title1','maxW':5360}},'designSystems':[]},open('project/canvas.json','w'),ensure_ascii=False,indent=1)
print(len(BOARDS),'tavole')
