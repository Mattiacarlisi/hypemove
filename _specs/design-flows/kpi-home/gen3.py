import json
exec(open('gen2.py').read().split('\n# ---- A:')[0])
# Tre varianti del solo grafico 1. Si lancia dopo gen.py e gen2.py, nella stessa cartella.
W,H=1440,600
YMIN,YMAX=-0.16,1.25
PAST=MUT
T=lambda x,y,txt,fill=MUT,w=700,a='start',fs=12: '<text x="%s" y="%s" font-size="%d" font-weight="%d" fill="%s" text-anchor="%s">%s</text>'%(n(x),n(y),fs,w,fill,a,txt)
L=lambda x1,y1,x2,y2,c,w=1,dash=None: '<line x1="%s" y1="%s" x2="%s" y2="%s" stroke="%s" stroke-width="%s"%s></line>'%(n(x1),n(y1),n(x2),n(y2),c,w,' stroke-dasharray="%s"'%dash if dash else '')
R=lambda x,y,w,h,fill,extra='': '<rect x="%s" y="%s" width="%s" height="%s" fill="%s"%s></rect>'%(n(x),n(y),n(w),n(h),fill,extra)
def mk(H):
    PH=H-MT-MB
    return PH,(lambda v: MT+PH*(1-(v-YMIN)/(YMAX-YMIN)))
def zones(x0,x1,xfz,Y,PH): return [R(xfz,MT,x1-xfz,PH,FZ),R(x0,MT,x1-x0,Y(1)-MT,GAIN)]
def hgrid(x0,x1,Y):
    s=[L(x0,Y(v),x1,Y(v),GRID) for v in (0.25,0.5,0.75,1.25)]
    s.append(L(x0,Y(0),x1,Y(0),INK,1.5)); return s
def ylab(ML,Y): return [T(ML-8,Y(v)+4,l,MUT,600,'end') for v,l in ET]
def par(x0,x1,Y): return ['<line x1="%s" y1="%s" x2="%s" y2="%s" stroke="%s" stroke-width="3" stroke-linecap="round"></line>'%(n(x0),n(Y(1)),n(x1),n(Y(1)),ORA),T(x0+10,Y(1)-9,'pareggio',ORA,800)]
def xlab(X,H,days,today=None): return [T(X(d-1),H-MB+18,str(d),'#ffffff' if d==today else MUT,800 if d==today else 600,'middle') for d in days]
def past(X,Y,S,end=True):
    pts=[(X(i),Y(v)) for i,v in enumerate(S)]
    return [pl(pts,PAST,2.5)]+[dot(x,y,2.5,PAST) for x,y in pts[:-1]]+[dot(pts[-1][0],pts[-1][1],4.5 if end else 2.5,PAST)]
def today(X,Y):
    x,y=X(1),Y(0)
    return ['<circle cx="%s" cy="%s" r="16" fill="rgba(67,97,238,0.30)"></circle>'%(n(x),n(y)),ring(x,y,8),T(x,y-26,'oggi · 0 €','#ffffff',800,'middle',13)]
def fan(X,Y):
    up=[(X(k-1),Y(v)) for k,v in case(0.98)]; lo=[(X(k-1),Y(v)) for k,v in case(0)]; me=[(X(k-1),Y(v)) for k,v in case(0.335)]
    return ['<polygon points="%s" fill="%s"></polygon>'%(' '.join('%s,%s'%(n(x),n(y)) for x,y in up+lo[::-1]),BAND),pl(up,BLU,1.5,'4 5'),pl(me,BLU,3,'8 7')]
def cases(x,Y): return [T(x,Y(0.98)+4,'ottimo'),T(x,Y(0.335)+4,'medio','#ffffff',800),T(x,Y(0)+4,'pessimo')]
# ---- A: nomi sulle linee, previsione come tre arrivi in una colonna a destra
def gA(W,H):
    ML,MR=50,176; PW=W-ML-MR; PH,Y=mk(H); X=lambda i: ML+PW*i/15.0; x1=ML+PW
    b=zones(ML,x1,X(8.5),Y,PH)+hgrid(ML,x1,Y)+ylab(ML,Y)+xlab(X,H,range(1,17),2)+par(ML,x1,Y)
    d=past(X,Y,S12)+past(X,Y,S13)+past(X,Y,S5)
    d+=[T(X(12.5),Y(0.98)+19,'Sprint 5',PAST,800,'middle'),T(X(12),Y(0.335)-10,'Sprint 13',PAST,800,'middle'),T(X(12.5),Y(0)-10,'Sprint 12',PAST,800,'middle')]
    xa=x1+38
    d+=[L(X(15)+7,Y(0.98),xa-9,Y(0.98),TER,1.5,'2 4'),L(X(14)+7,Y(0.335),xa-10,Y(0.335),TER,1.5,'2 4'),L(X(15)+7,Y(0),xa-9,Y(0),TER,1.5,'2 4')]
    d+=[L(xa,Y(0),xa,Y(0.98),BLU,2,'3 5'),ring(xa,Y(0.98),6),ring(xa,Y(0),6),ring(xa,Y(0.335),8)]
    d+=[T(xa-8,MT+10,'dove può finire',BLU,800)]
    for v,l,c in ((0.98,'0,98 €','ottimo'),(0.335,'0,34 €','medio'),(0,'0 €','pessimo')):
        d.append('<text x="%s" y="%s" font-size="12" font-weight="700" fill="%s"><tspan fill="#ffffff" font-weight="800">%s</tspan> %s</text>'%(n(xa+15),n(Y(v)+4),MUT,l,c))
    d+=today(X,Y)
    return sv(W,H,b,'Rientro per euro, lo sprint giorno per giorno'),sv(W,H,d),(X(1),Y(0))
# ---- B: un riquadro per sprint sulla stessa scala, lo Sprint 15 in un riquadro largo
def gB(W,H):
    ML,MR=50,76; PW=W-ML-MR; PH,Y=mk(H); sw,gap,ip=196,18,14
    b=ylab(ML,Y); d=[]
    def panel(x0,w,name,val,blue=False):
        X=lambda i: x0+ip+(w-2*ip)*i/15.0
        s=[R(x0,MT,w,PH,'rgba(255,255,255,0.025)')]+zones(x0,x0+w,X(8.5),Y,PH)+hgrid(x0,x0+w,Y)
        s+=[T(x0+w-12,MT+22,name,'#ffffff' if blue else MUT,800,'end',13)]
        if val: s+=[T(x0+w-12,MT+40,val,'#ffffff',800,'end',13)]
        return s,X
    for i,(S,nm,v) in enumerate(((S5,'Sprint 5','0,98 €'),(S12,'Sprint 12','0 €'),(S13,'Sprint 13','0,34 €'))):
        s,X=panel(ML+i*(sw+gap),sw,nm,v); b+=s+xlab(X,H,(1,8,16)); d+=past(X,Y,S)
    x0=ML+3*(sw+gap); s,X=panel(x0,PW-3*(sw+gap),'Sprint 15',None,True)
    b+=s+xlab(X,H,range(1,17),2)+par(ML,ML+PW,Y)
    d+=fan(X,Y)+cases(ML+PW+8,Y)+today(X,Y)
    return sv(W,H,b,'Rientro per euro, lo sprint giorno per giorno'),sv(W,H,d),(X(1),Y(0))
# ---- C: ventaglio blu, sprint passati uno alla volta
def gC(W,H):
    ML,MR=50,70; PW=W-ML-MR; PH,Y=mk(H); X=lambda i: ML+PW*i/15.0; x1=ML+PW
    b=zones(ML,x1,X(8.5),Y,PH)+hgrid(ML,x1,Y)+ylab(ML,Y)+xlab(X,H,range(1,17),2)+par(ML,x1,Y)
    g=lambda k,parts: ['<g style="opacity: «h%d.o»">%s</g>'%(k,''.join(parts))]
    lb=lambda k,x,y,nm,v: ['<g style="opacity: «c%d.o»"><text x="%s" y="%s" font-size="13" font-weight="800" fill="%s" text-anchor="middle">%s · <tspan fill="#ffffff">%s</tspan></text></g>'%(k,n(x),n(y),PAST,nm,v)]
    d=fan(X,Y)+cases(x1+8,Y)
    d+=g(12,past(X,Y,S12))+g(13,past(X,Y,S13))+g(5,past(X,Y,S5))
    d+=lb(5,X(12.5),Y(0.98)+21,'Sprint 5','0,98 €')+lb(13,X(12),Y(0.335)-12,'Sprint 13','0,34 €')+lb(12,X(12.5),Y(0)-12,'Sprint 12','0 €')
    d+=today(X,Y)
    return sv(W,H,b,'Rientro per euro, lo sprint giorno per giorno'),sv(W,H,d),(X(1),Y(0))
CHIPS='<div style="display: flex; gap: 8px">%s</div>'%''.join('<div style="position: relative; width: 88px; height: 28px; border-radius: 50px; border: 1.500px solid %s; box-sizing: border-box; font-size: 13px; font-weight: 700; line-height: 25px; text-align: center; color: %s"><div style="position: absolute; inset: 0; border-radius: 50px; background: #262d45; opacity: «c%d.o»"></div><span style="position: relative; color: #ffffff; opacity: «t%d.o»">Sprint %d</span></div>'%(BOR,MUT,k,k,k) for k in (5,12,13))
def blk3(fn,x,y,w,h,right=None):
    pad,head=24,96; cw=w-2*pad; ch=h-2*pad-head
    b,d,pt=fn(cw,ch); t,m,v,c=TX[1]
    s='<div style="position: absolute; left: %dpx; top: %dpx; width: %dpx; height: %dpx; %s; opacity: «e1.o»; transform: «e1.tf»">'%(x,y,w,h,CS)
    s+='<div style="position: absolute; left: %dpx; top: %dpx; width: %dpx; display: flex; justify-content: space-between; align-items: flex-start"><div style="font-size: 15px; font-weight: 800; line-height: 20px">%s</div>%s</div>'%(pad,pad,cw,t,right or '<div style="font-size: 13px; font-weight: 600; color: %s">%s</div>'%(MUT,m))
    s+='<div style="position: absolute; left: %dpx; top: %dpx; display: flex; align-items: baseline; gap: 10px"><div style="font-size: 34px; font-weight: 800; line-height: 42px">%s</div><div style="font-size: 14px; font-weight: 600; color: %s">%s</div></div>'%(pad,pad+26,v,MUT,c)
    s+='<div style="position: absolute; left: %dpx; top: %dpx; width: %dpx; height: %dpx">%s<div style="position: absolute; left: 0; top: 0; height: %dpx; width: «r1»; overflow: hidden"><div style="position: relative; width: %dpx; height: %dpx">%s</div></div></div></div>'%(pad,pad+head,cw,ch,b,ch,cw,ch,d)
    return s,(x+pad+pt[0],y+pad+head+pt[1])
def leg(items): return '<div style="position: absolute; left: 64px; top: 30px; display: flex; gap: 18px; font-size: 13px; font-weight: 600; color: %s; opacity: «em.o»">%s</div>'%(MUT,''.join(items))
ZON=[lg('rect',FZ,'prove in scadenza'),lg('rect','rgba(251,139,4,0.22)','qui guadagniamo')]
hk=lambda a,b: 'Math.min(p(%s, 0.3), 1 - p(%s, 0.3))'%(a,b)
SEQ={5:hk(1.2,3.6),12:hk(3.6,6.0),13:hk(6.0,8.5)}
JS=JS.replace('eco: { o: f(eco) },','eco: { o: f(eco) }, '+' '.join('h%d: { o: f(0.12 + 0.88 * %s) }, c%d: { o: f(%s) }, t%d: { o: f(0.55 + 0.45 * %s) },'%(k,e,k,e,k,e) for k,e in SEQ.items()))
VAR=[('g1-A-arrivi-destra.dc.html','G1A - Arrivi a destra',gA,None,[lg('ring',BLU,'Sprint 15, stima'),lg('line',PAST,'sprint passati, reale'),lg('ring',BLU,'previsione: dove può finire')]+ZON),
     ('g1-B-quattro-riquadri.dc.html','G1B - Quattro riquadri',gB,None,[lg('ring',BLU,'Sprint 15, stima'),lg('line',PAST,'sprint passati, reale'),lg('rect','rgba(67,97,238,0.32)','previsione')]+ZON),
     ('g1-C-una-alla-volta.dc.html','G1C - Una alla volta',gC,CHIPS,[lg('ring',BLU,'Sprint 15, stima'),lg('line',PAST,'sprint passato scelto, reale'),lg('rect','rgba(67,97,238,0.32)','previsione')]+ZON)]
for fn,title,g,right,items in VAR:
    c,t1=blk3(g,64,72,1312,480,right)
    t2=[1307,110] if right else [round(t1[0])+320,round(t1[1])-150]
    board(fn,title,HM,W,H,leg(items)+c+ov2(),dict(W=[1264,0,0],A=[0.3,0,0],S=[900,520],T1=[round(t1[0]),round(t1[1])],T2=t2,TO=[24,-128],SC=1))
cv=json.load(open('project/canvas.json'))
for i,(fn,title,_,_,_) in enumerate(VAR): cv['boards'][fn]={"w":W,"h":H,"x":1520*i,"y":2600,"title":title}
cv['notes']['g1']={"kind":"title1","maxW":4000,"text":"Grafico 1","w":240,"x":0,"y":2300}
cv['order']=list(cv['boards'].keys())
json.dump(cv,open('project/canvas.json','w'),ensure_ascii=False,indent=1)
print('ok')
