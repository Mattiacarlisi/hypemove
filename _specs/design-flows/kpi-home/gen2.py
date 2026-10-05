import json
exec(open('gen.py').read().split('\nW,H=1440,900')[0])
W,H=1440,900
INK='#ffffff'; MUT='#9ca3af'; TER='#6f7683'; BLU='#4361ee'; ORA='#fb8b04'; ORD='#fb8b04'; GRID='#2a2e37'; CARD='#1a1d24'; BOR='#2a2e37'
GAIN='rgba(251,139,4,0.12)'; FZ='rgba(255,255,255,0.04)'; BAND='rgba(67,97,238,0.20)'; RNG='rgba(67,97,238,0.32)'
HM=dict(bg='#0f1115',ink=INK,mut=MUT,or_=BLU,mono="Nunito, system-ui, sans-serif",font="Nunito, system-ui, sans-serif",line=BOR,
  link='https://fonts.googleapis.com/css2?family=Nunito:wght@500;600;700;800&amp;display=swap')
MT,MB=14,30
def fr(W,H,ymax,ticks,minor,nx,xl,par,fz=None,today=None,step=1,pad=0,ML=50,MR=70,bold=None):
    PW=W-ML-MR; PH=H-MT-MB
    X=lambda i: ML+pad+(PW-2*pad)*i/(nx-1)
    Y=lambda v: MT+PH*(1-v/ymax)
    s=[]
    if fz is not None: s.append('<rect x="%s" y="%d" width="%s" height="%d" fill="%s"></rect>'%(n(X(fz)),MT,n(ML+PW-X(fz)),PH,FZ))
    s.append('<rect x="%d" y="%d" width="%d" height="%s" fill="%s"></rect>'%(ML,MT,PW,n(Y(par)-MT),GAIN))
    for v in minor: s.append('<line x1="%d" y1="%s" x2="%d" y2="%s" stroke="%s" stroke-width="1"></line>'%(ML,n(Y(v)),ML+PW,n(Y(v)),GRID))
    for v,l in ticks:
        y=Y(v)
        s.append('<line x1="%d" y1="%s" x2="%d" y2="%s" stroke="%s" stroke-width="%s"></line>'%(ML,n(y),ML+PW,n(y),INK if v==0 else '#2a2e37','1.5' if v==0 else '1'))
        s.append('<text x="%d" y="%s" font-size="12" font-weight="600" fill="%s" text-anchor="end">%s</text>'%(ML-8,n(y+4),MUT,l))
    for i,l in enumerate(xl):
        show=(i%step==(1 if (bold is not None and step>1) else 0)) or i==today
        if show:
            b=(i==today) or (bold is not None and i==bold)
            s.append('<text x="%s" y="%s" font-size="12" font-weight="%s" fill="%s" text-anchor="middle">%s</text>'%(n(X(i)),n(Y(0)+18),'800' if b else '600','#ffffff' if b else MUT,l))
    s.append('<line x1="%d" y1="%s" x2="%d" y2="%s" stroke="%s" stroke-width="3" stroke-linecap="round"></line>'%(ML,n(Y(par)),ML+PW,n(Y(par)),ORA))
    s.append('<text x="%d" y="%s" font-size="12" font-weight="800" fill="%s">pareggio</text>'%(ML+PW+8,n(Y(par)-5),ORD))
    return s,X,Y
def sv(W,H,parts,label=None): return svg(W,H,HM,parts,label)
def ring(x,y,r=7): return '<circle cx="%s" cy="%s" r="%s" fill="#1a1d24" stroke="%s" stroke-width="3"></circle>'%(n(x),n(y),r,BLU)
ET=[(0,'0'),(0.5,'0,50 €'),(1,'1 €')]
def g1(W,H,step=1):
    b,X,Y=fr(W,H,1.25,ET,[0.25,0.75,1.25],16,[str(i) for i in range(1,17)],1,fz=8.5,today=1,step=step)
    d=[]
    for S in (S5,S12,S13):
        pts=[(X(i),Y(v)) for i,v in enumerate(S)]
        d.append(pl(pts,TER,2)); d+=[dot(x,y,2.5,TER) for x,y in pts]
    up=[(X(k-1),Y(v)) for k,v in case(0.98)]; lo=[(X(k-1),Y(v)) for k,v in case(0)]; me=[(X(k-1),Y(v)) for k,v in case(0.335)]
    d.append('<polygon points="%s" fill="%s"></polygon>'%(' '.join('%s,%s'%(n(x),n(y)) for x,y in up+lo[::-1]),BAND))
    d.append(pl(up,BLU,1.5,'4 5')); d.append(pl(me,BLU,3,'8 7')); d.append(ring(X(1),Y(0)))
    xr=X(15)+8
    d.append('<text x="%s" y="%s" font-size="12" font-weight="700" fill="%s">ottimo</text>'%(n(xr),n(Y(0.98)+16),MUT))
    d.append('<text x="%s" y="%s" font-size="12" font-weight="800" fill="%s">medio</text>'%(n(xr),n(Y(0.335)+4),'#ffffff'))
    d.append('<text x="%s" y="%s" font-size="12" font-weight="700" fill="%s">pessimo</text>'%(n(xr),n(Y(0)-5),MUT))
    return sv(W,H,b,'Rientro per euro, lo sprint giorno per giorno'),sv(W,H,d),(X(1),Y(0)),Y(1)
def g2(W,H,step=1):
    b,X,Y=fr(W,H,1.25,ET,[0.25,0.75,1.25],14,['S%d'%i for i in range(4,18)],1,fz=9.5,step=step,pad=18,bold=11)
    d=[]
    for i,(a,z) in [(10,(0,0.41)),(11,(0,0.98)),(12,(0,0.98)),(13,(0,0.98))]:
        d.append('<line x1="%s" y1="%s" x2="%s" y2="%s" stroke="%s" stroke-width="12" stroke-linecap="round"></line>'%(n(X(i)),n(Y(z)),n(X(i)),n(Y(a)),RNG))
    real=[(X(i),Y(v)) for i,v in enumerate(REAL2)]
    fc=[(X(9),Y(0.335)),(X(10),Y(0.135)),(X(11),Y(0.335)),(X(12),Y(0.335)),(X(13),Y(0.335))]
    d.append(pl(real,INK,3)); d.append(pl(fc,BLU,3,'8 7'))
    d+=[dot(x,y,5,INK) for x,y in real]; d+=[ring(x,y,6) for x,y in fc[1:]]
    return sv(W,H,b,'Rientro per euro, sprint dopo sprint'),sv(W,H,d),(X(11),Y(0.335)),Y(1)
def g3(W,H,step=1):
    b,X,Y=fr(W,H,16,[(0,'0'),(4,'4'),(8,'8'),(12,'12'),(16,'16')],[],9,[str(i) for i in range(1,10)],12.7,today=1,step=step)
    d=[]
    for S in (P12,P13,P14):
        pts=[(X(i),Y(v)) for i,v in enumerate(S)]
        d.append(pl(pts,TER,2)); d+=[dot(x,y,2.5,TER) for x,y in pts]
    x=X(1)
    d.append('<line x1="%s" y1="%s" x2="%s" y2="%s" stroke="%s" stroke-width="2" stroke-dasharray="3 4"></line>'%(n(x),n(Y(0)),n(x),n(MT+12),BLU))
    d.append('<polygon points="%s,%d %s,%d %s,%d" fill="%s"></polygon>'%(n(x-7),MT+12,n(x+7),MT+12,n(x),MT,BLU))
    d.append('<text x="%s" y="%d" font-size="12" font-weight="800" fill="%s">42,4 fuori scala</text>'%(n(x+12),MT+12,'#ffffff'))
    return sv(W,H,b,'Prove avviate ogni 100 euro'),sv(W,H,d),(x,MT+8),Y(12.7)
G={1:g1,2:g2,3:g3}
TX={1:('Lo sprint, giorno per giorno','giorno 2 di 16','0 €','rientrati finora per ogni euro speso'),
    2:('Sprint dopo sprint','10 sprint chiusi','0,34 €','rientrati per ogni euro, ultimo sprint chiuso'),
    3:('Prove avviate ogni 100 €','giorno 2 di 9','42,4','prove ogni 100 €, con 4,72 € spesi finora')}
CS='background: %s; border: 1.500px solid %s; border-radius: 14px; box-shadow: 0 3px 0 #050608; box-sizing: border-box'%(CARD,BOR)
def blk(k,x,y,w,h,step=1,big=34,chrome=True):
    pad=24 if chrome else 0; head=96 if big>=30 else 84
    cw=w-2*pad; ch=h-2*pad-head
    b,d,pt,py=G[k](cw,ch,step)
    t,m,v,c=TX[k]
    s='<div style="position: absolute; left: %dpx; top: %dpx; width: %dpx; height: %dpx; %s; opacity: «e%d.o»; transform: «e%d.tf»">'%(x,y,w,h,CS if chrome else 'box-sizing: border-box',k,k)
    s+='<div style="position: absolute; left: %dpx; top: %dpx; width: %dpx; display: flex; justify-content: space-between; align-items: baseline"><div style="font-size: 15px; font-weight: 800; line-height: 20px">%s</div><div style="font-size: 13px; font-weight: 600; color: %s">%s</div></div>'%(pad,pad,cw,t,MUT,m)
    s+='<div style="position: absolute; left: %dpx; top: %dpx; width: %dpx; display: flex; align-items: baseline; gap: 10px"><div style="font-size: %dpx; font-weight: 800; line-height: %dpx; color: %s">%s</div><div style="font-size: 14px; font-weight: 600; color: %s">%s</div></div>'%(pad,pad+26,cw,big,big+8,INK,v,MUT,c)
    s+='<div style="position: absolute; left: %dpx; top: %dpx; width: %dpx; height: %dpx">%s<div style="position: absolute; left: 0; top: 0; height: %dpx; width: «r%d»; overflow: hidden"><div style="position: relative; width: %dpx; height: %dpx">%s</div></div></div></div>'%(pad,pad+head,cw,ch,b,ch,k,cw,ch,d)
    return s,(x+pad+pt[0],y+pad+head+pt[1]),pad+head+py
def lg(kind,c,txt):
    if kind=='line': g='<svg width="24" height="12" aria-hidden="true"><line x1="2" y1="6" x2="22" y2="6" stroke="%s" stroke-width="3" stroke-linecap="round"></line></svg>'%c
    elif kind=='ring': g='<svg width="16" height="12" aria-hidden="true"><circle cx="8" cy="6" r="4" fill="#1a1d24" stroke="%s" stroke-width="2.500"></circle></svg>'%c
    elif kind=='dot': g='<svg width="16" height="12" aria-hidden="true"><circle cx="8" cy="6" r="5" fill="%s"></circle></svg>'%c
    else: g='<svg width="20" height="12" aria-hidden="true"><rect x="1" y="1" width="18" height="10" rx="3" fill="%s" stroke="#2a2e37" stroke-width="1"></rect></svg>'%c
    return '<div style="display: flex; align-items: center; gap: 6px">%s<span>%s</span></div>'%(g,txt)
LEGI=[lg('dot',INK,'reale'),lg('ring',BLU,'stima'),lg('line',TER,'sprint passati'),lg('rect','rgba(67,97,238,0.32)','previsione'),lg('rect',FZ,'prove in scadenza'),lg('rect','rgba(251,139,4,0.22)','qui guadagniamo')]
def legrow(x,y,col=False):
    return '<div style="position: absolute; %s; top: %dpx; display: flex; flex-direction: %s; gap: %s; font-size: 13px; font-weight: 600; color: %s; opacity: «em.o»">%s</div>'%(x,y,'column' if col else 'row','10px' if col else '18px',MUT,''.join(LEGI))
def rail2():
    s='<div style="position: absolute; left: 0; top: 0; width: 64px; height: 900px; background: #1a1d24; border-right: 1.500px solid %s; box-sizing: border-box">'%BOR
    for i,(k,p) in enumerate(ICON.items()):
        bg='#262d45' if i==0 else 'transparent'
        ov='<div style="position: absolute; inset: 0; border-radius: 12px; background: #2a2e37; opacity: «eco.o»"></div>' if k=='Economy' else ''
        s+='<div style="position: absolute; left: 10px; top: %dpx; width: 44px; height: 44px; border-radius: 12px; background: %s">%s<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="%s" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; left: 11px; top: 11px; display: block" aria-label="%s">%s</svg></div>'%(20+52*i,bg,ov,'#ffffff' if i==0 else MUT,k,p)
    s+='</div><div style="position: absolute; left: 72px; top: %dpx; padding: 6px 12px; border-radius: 50px; background: #ffffff; color: #0f1115; font-size: 13px; font-weight: 700; opacity: «eco.o»">Economy</div>'%(ECO[1]-15)
    return s
def head2():
    return '<div style="position: absolute; left: 96px; top: 28px; display: flex; align-items: center; gap: 14px"><div style="font-size: 28px; font-weight: 800; line-height: 36px">Home</div><div style="font-size: 13px; font-weight: 700; padding: 6px 12px; border-radius: 50px; background: #1a1d24; border: 1.500px solid %s; box-shadow: 0 2px 0 #050608">Sprint 15 · giorno 2 di 16 · 04/10–12/10</div></div>'%BOR
def ov2(): return overlay(HM,W,H).replace('border-radius: 10px','border-radius: 14px').replace('fill="#15171c" stroke="#ffffff"','fill="#ffffff" stroke="#0f1115"').replace('· stima</div>','· stima</div>')
def strip():
    return ''.join('<div style="flex: 1; height: 28px; border-radius: 6px; box-sizing: border-box; background: %s; border: %s; font-size: 12px; font-weight: 700; line-height: %s; text-align: center; color: %s">%d</div>'%(BLU if d==2 else ('#262d45' if d<=9 else 'transparent'),'0' if d<=9 else '1.500px dashed #3a3f4a','28px' if d<=9 else '25px','#ffffff' if d==2 else MUT,d) for d in range(1,17))
NOTE=['Modifiche grafiche onboarding','Mascotte animata','Mostra piano fine onboarding','Redesign details e exercise page','Jev come routing e rivisitazione coach']
lab=lambda t: '<div style="font-size: 13px; font-weight: 800; color: %s; margin: 0 0 10px">%s</div>'%(MUT,t)
notes=lambda fs: '<div style="display: flex; flex-direction: column; gap: 6px; font-size: %dpx; font-weight: 600; line-height: 22px">%s</div>'%(fs,''.join('<div style="display: flex; gap: 10px"><span style="color: %s">•</span><span>%s</span></div>'%(MUT,x) for x in NOTE))
# ---- A: uno grande, due sotto
c1,t1,_=blk(1,96,92,1312,448)
c2,_,_=blk(2,96,564,644,312,big=28)
c3,_,_=blk(3,764,564,644,312,big=28)
board('prop-A-grande-sopra.dc.html','A - Uno grande',HM,W,H,rail2()+head2()+legrow('right: 32px',38)+c1+c2+c3+ov2(),
  dict(W=[1264,596,596],A=[0.3,0.9,1.1],S=[900,720],T1=[round(t1[0]),round(t1[1])],T2=list(ECO),TO=[24,-124],SC=0))
# ---- B: colonna che scorre, scheda dello sprint fissa
cw=864
c1,t1,_=blk(1,0,4,cw,408); c2,_,_=blk(2,0,436,cw,408); c3,_,_=blk(3,0,868,cw,408)
col='<div style="position: absolute; left: 92px; top: 88px; width: %dpx; height: 812px; overflow: hidden"><div style="position: absolute; left: 4px; top: 0; width: %dpx; height: 1284px; transform: «sc»">%s</div></div>'%(cw+8,cw,c1+c2+c3)
mar='<div style="position: absolute; left: 992px; top: 92px; width: 416px; padding: 24px; display: flex; flex-direction: column; gap: 24px; %s; opacity: «em.o»">'%CS
mar+='<div><div style="font-size: 22px; font-weight: 800; line-height: 28px; margin: 0 0 12px">Sprint 15</div><div style="display: flex; gap: 3px">%s</div><div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; color: %s; margin: 8px 0 0"><span>9 giorni di spesa</span><span>7 giorni di prove in scadenza</span></div></div>'%(strip(),MUT)
mar+='<div>%s%s</div><div>%s<div style="display: flex; flex-direction: column; gap: 10px; font-size: 13px; font-weight: 600; color: %s">%s%s</div></div></div>'%(lab("Cosa c'è di diverso"),notes(15),lab('Come si legge'),MUT,''.join(LEGI),lg('line',ORA,'pareggio'))
board('prop-B-colonna-margine.dc.html','B - Colonna e margine',HM,W,H,rail2()+head2()+col+mar+ov2(),
  dict(W=[816,816,816],A=[0.3,0.6,0.9],S=[700,760],T1=[round(96+t1[0]),round(88+t1[1])],T2=[round(96+t1[0])+280,round(88+t1[1])-150],TO=[24,-124],SC=432))
# ---- C: la linea del pareggio unisce storia e sprint
big='<div style="position: absolute; left: 96px; top: 92px; width: 1312px; height: 452px; %s; opacity: «em.o»"></div>'%CS
c2,_,py=blk(2,120,116,500,404,chrome=False)
c1,t1,py1=blk(1,668,116,716,404,chrome=False)
assert abs(py-py1)<0.1
dv='<div style="position: absolute; left: 644px; top: 116px; width: 1.500px; height: 404px; background: %s"></div><div style="position: absolute; left: 550px; top: %spx; width: 168px; height: 3px; background: %s; opacity: 0.35"></div>'%(GRID,n(116+py-1.5),ORA)
c3,_,_=blk(3,96,568,700,308,big=28)
nt='<div style="position: absolute; left: 820px; top: 568px; width: 588px; height: 308px; padding: 24px; %s; opacity: «em.o»"><div style="font-size: 15px; font-weight: 800; line-height: 20px; margin: 0 0 12px">Sprint 15, cosa c\'è di diverso</div><div style="display: flex; gap: 3px; margin: 0 0 16px">%s</div>%s</div>'%(CS,strip(),notes(15))
board('prop-C-linea-pareggio.dc.html','C - Linea del pareggio',HM,W,H,rail2()+head2()+legrow('right: 32px',38)+big+dv+c2+c1+c3+nt+ov2(),
  dict(W=[716,500,652],A=[0.8,0.3,1.2],S=[1100,780],T1=[round(t1[0]),round(t1[1])],T2=list(ECO),TO=[24,-124],SC=0))
cv=json.load(open('project/canvas.json'))
for k in [k for k in cv['boards'] if k.startswith('prop-')]: del cv['boards'][k]
for i,(f,t) in enumerate([('prop-A-grande-sopra.dc.html','1A - Uno grande'),('prop-B-colonna-margine.dc.html','1B - Colonna e margine'),('prop-C-linea-pareggio.dc.html','1C - Linea del pareggio')]):
    cv['boards'][f]={"w":W,"h":H,"x":1520*i,"y":1300,"title":t}
cv['order']=list(cv['boards'].keys())
json.dump(cv,open('project/canvas.json','w'),ensure_ascii=False,indent=1)
print('ok')
