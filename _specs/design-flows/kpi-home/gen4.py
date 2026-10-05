import json
exec(open('gen3.py').read().split('\nCHIPS=')[0])
# Fila «Redesign» della Home: la variante G1A portata sui tre grafici, con tutti gli stati.
# Si lancia dopo gen.py, gen2.py e gen3.py, nella stessa cartella.
W,H=1440,900
# le prove aperte contano: pagato = reale, stima = pagato + prove aperte x 62,5% x 20,90 EUR, diviso la spesa
TX[1]=(TX[1][0],TX[1][1],'0 €','pagato per ogni euro speso')
TX[3]=(TX[3][0],TX[3][1],'42,4','2 prove avviate con 4,72 € spesi')
TX[5]=('Prove che poi pagano','5 prove su 8','62,5%','delle prove finite ha pagato')
TX[7]=('Prove in scadenza','prossimi 7 giorni','3,8','paganti attesi da 6 prove aperte, 1 disdetta')
PILL='<div style="font-size: 13px; font-weight: 800; padding: 6px 12px; border-radius: 50px; background: #262d45; border: 1.500px solid %s; box-shadow: 0 2px 0 #050608; white-space: nowrap">2 prove aperte · 0 paganti</div>'%BLU
EXTRA1='<div style="margin-left: 8px; font-size: 14px; font-weight: 800; line-height: 20px; padding: 3px 12px; border-radius: 50px; background: #262d45; border: 1.500px solid %s; white-space: nowrap">+ 2 prove aperte</div><div style="font-size: 14px; font-weight: 600; color: %s; white-space: nowrap">stima 5,54 € per euro</div>'%(BLU,MUT)
_head2=head2
def head2(prove=True):
    h=_head2(); return h.replace('04/10–12/10</div></div>','04/10–12/10</div>'+PILL+'</div>') if prove else h
_rail2=rail2
def rail2(): return _rail2().replace('padding: 6px 12px; border-radius: 50px; background: #ffffff','z-index: 5; padding: 6px 12px; border-radius: 50px; background: #ffffff')
def g1(W,H,hov=False,empty=False):
    ML,MR=50,176; PW=W-ML-MR; PH,Y=mk(H); X=lambda i: ML+PW*i/15.0; x1=ML+PW
    b=zones(ML,x1,X(8.5),Y,PH)+hgrid(ML,x1,Y)+ylab(ML,Y)+xlab(X,H,range(1,17),None if empty else 2)+par(ML,x1,Y)[:1]+[T(x1-10,Y(1)-9,'pareggio',ORA,800,'end')]
    wrap=lambda k,parts: ['<g style="opacity: «h%d.o»">%s</g>'%(k,''.join(parts))] if hov else parts
    d=wrap(12,past(X,Y,S12)+[T(X(12.5),Y(0)-10,'Sprint 12',PAST,800,'middle')])
    d+=wrap(13,past(X,Y,S13)+[T(X(12),Y(0.335)-10,'Sprint 13',PAST,800,'middle')])
    d+=wrap(5,past(X,Y,S5)+[T(X(12.5),Y(0.98)+19,'Sprint 5',PAST,800,'middle')])
    xa=x1+38
    d+=[L(X(15)+7,Y(0.98),xa-9,Y(0.98),TER,1.5,'2 4'),L(X(14)+7,Y(0.335),xa-10,Y(0.335),TER,1.5,'2 4'),L(X(15)+7,Y(0),xa-9,Y(0),TER,1.5,'2 4')]
    d+=[L(xa,Y(0),xa,Y(0.98),BLU,2,'3 5'),ring(xa,Y(0.98),6),ring(xa,Y(0),6),ring(xa,Y(0.335),8),T(xa-8,MT+10,'dove può finire',BLU,800)]
    for v,l,c in ((0.98,'0,98 €','ottimo'),(0.335,'0,34 €','medio'),(0,'0 €','pessimo')):
        d.append('<text x="%s" y="%s" font-size="12" font-weight="700" fill="%s"><tspan fill="#ffffff" font-weight="800">%s</tspan> %s</text>'%(n(xa+15),n(Y(v)+4),MUT,l,c))
    if not empty:
        x=X(1)
        d+=[L(x,Y(0),x,MT+16,BLU,2,'3 4'),'<circle cx="%s" cy="%d" r="13" fill="rgba(67,97,238,0.30)"></circle>'%(n(x),MT+9),'<polygon points="%s,%d %s,%d %s,%d" fill="%s"></polygon>'%(n(x-7),MT+14,n(x+7),MT+14,n(x),MT+2,BLU)]
        d+=[T(x+20,MT+13,'con le 2 prove · 5,54 € fuori scala','#ffffff',800,'start',13),dot(x,Y(0),7,INK),T(x+14,Y(0)-13,'pagato · 0 €','#ffffff',800,'start',13)]
    return sv(W,H,b,'Rientro per euro, lo sprint giorno per giorno'),sv(W,H,d),((X(11),Y(0.335)) if hov else (X(1),Y(0)))
def g2(W,H,**k):
    ML,MR=50,22; PW=W-ML-MR; PH,Y=mk(H); X=lambda i: ML+18+(PW-36)*i/13.0; x1=ML+PW
    b=zones(ML,x1,X(9.5),Y,PH)+hgrid(ML,x1,Y)+ylab(ML,Y)+par(ML,x1,Y)
    b+=[T(X(i),H-MB+18,'S%d'%(i+4),'#ffffff' if i==11 else MUT,800 if i==11 else 600,'middle') for i in range(14)]
    b+=[T(x1-8,MT+15,'previsioni',BLU,800,'end')]
    real=[(X(i),Y(v)) for i,v in enumerate(REAL2)]
    d=[pl(real,PAST,2.5)]+[dot(x,y,3.5,PAST) for x,y in real[:-1]]+[dot(real[-1][0],real[-1][1],4.5,PAST)]
    d+=[T(X(1)+11,Y(0.98)+18,'0,98 €','#ffffff',800),T(X(9)-12,Y(0.335)-3,'0,34 €','#ffffff',800,'end')]
    for i,lo,hi,me in ((10,0,0.27,0.17),(12,0,0.98,0.335),(13,0,0.98,0.335)):
        d+=[L(X(i),Y(lo),X(i),Y(hi),BLU,2,'3 5'),dot(X(i),Y(lo),3,BLU),dot(X(i),Y(hi),3,BLU),ring(X(i),Y(me),6)]
    x=X(11); d+=[L(x,Y(0),x,MT+16,BLU,2,'3 4'),dot(x,Y(0),3,BLU),'<circle cx="%s" cy="%d" r="13" fill="rgba(67,97,238,0.30)"></circle>'%(n(x),MT+9),'<polygon points="%s,%d %s,%d %s,%d" fill="%s"></polygon>'%(n(x-7),MT+14,n(x+7),MT+14,n(x),MT+2,BLU)]
    for i,v,t in ((10,0.46,'2 prove'),(11,0.62,'2 prove')): d+=[R(X(i)-25,Y(v)-9,50,18,'#262d45',' rx="9" stroke="%s" stroke-width="1"'%BLU),T(X(i),Y(v)+4,t,'#ffffff',800,'middle',11)]
    return sv(W,H,b,'Rientro per euro, sprint dopo sprint'),sv(W,H,d),(X(11),Y(0.335))
def g3(W,H,empty=False,**k):
    ML,MR=50,22; PW=W-ML-MR; PH=H-MT-MB; y0,y1=-3.0,16.0; Y=lambda v: MT+PH*(1-(v-y0)/(y1-y0)); X=lambda i: ML+PW*i/8.0; x1=ML+PW
    b=[R(ML,MT,PW,Y(7.7)-MT,GAIN)]+[L(ML,Y(v),x1,Y(v),GRID) for v in (4,8,12,16)]+[L(ML,Y(0),x1,Y(0),INK,1.5)]
    b+=[T(ML-8,Y(v)+4,str(v),MUT,600,'end') for v in (0,4,8,12,16)]+xlab(X,H,range(1,10),None if empty else 2)
    b+=['<line x1="%s" y1="%s" x2="%s" y2="%s" stroke="%s" stroke-width="3" stroke-linecap="round"></line>'%(n(ML),n(Y(7.7)),n(x1),n(Y(7.7)),ORA),T(x1-10,Y(7.7)-8,'pareggio',ORA,800,'end')]
    d=past(X,Y,P14)+past(X,Y,P12)+past(X,Y,P13)
    d+=[T(X(4.5),Y(2.8)-10,'Sprint 14',PAST,800,'middle'),T(X(7.35),Y(0.44)-10,'Sprint 12',PAST,800,'middle'),T(X(2),Y(0)+16,'Sprint 13',PAST,800,'middle')]
    x=X(1)
    if not empty:
        d+=[L(x,Y(0),x,MT+16,BLU,2,'3 4'),'<circle cx="%s" cy="%d" r="13" fill="rgba(67,97,238,0.30)"></circle>'%(n(x),MT+9),'<polygon points="%s,%d %s,%d %s,%d" fill="%s"></polygon>'%(n(x-7),MT+14,n(x+7),MT+14,n(x),MT+2,BLU),T(x+20,MT+13,'oggi · 42,4 fuori scala','#ffffff',800,'start',13)]
    return sv(W,H,b,'Prove avviate ogni 100 euro'),sv(W,H,d),(x,MT+9)
def g5(W,H,**k):
    ML,MR=50,22; PW=W-ML-MR; PH=H-MT-MB; y0,y1=-12.0,112.0; Y=lambda v: MT+PH*(1-(v-y0)/(y1-y0)); X=lambda i: ML+18+(PW-36)*i/13.0; x1=ML+PW
    b=[R(X(9.5),MT,x1-X(9.5),PH,FZ)]+[L(ML,Y(v),x1,Y(v),GRID) for v in (25,50,75,100)]+[L(ML,Y(0),x1,Y(0),INK,1.5)]
    b+=[T(ML-8,Y(v)+4,l,MUT,600,'end') for v,l in ((0,'0'),(50,'50%'),(100,'100%'))]
    b+=[T(X(i),H-MB+18,'S%d'%(i+4),'#ffffff' if i==11 else MUT,800 if i==11 else 600,'middle') for i in range(14)]
    b+=[L(ML,Y(62.5),x1,Y(62.5),BLU,1.5,'6 5'),T(ML+10,Y(62.5)-7,'nostro tasso 62,5%',BLU,800),L(ML,Y(37.7),x1,Y(37.7),TER,1.5,'2 4'),T(ML+10,Y(37.7)+15,'settore 37,7%',MUT,700)]
    d=[]
    for i,v,t in ((1,100,'2 su 2'),(7,0,'0 su 1'),(9,100,'1 su 1')): d+=[dot(X(i),Y(v),5,PAST),T(X(i),Y(v)+(19 if v else -10),t,'#ffffff',800,'middle',11)]
    for i,v,t in ((8,100,'2 su 2'),(10,0,'0 su 1')): d+=[ring(X(i),Y(v),6),T(X(i),Y(v)+(19 if v else -11),t,'#ffffff',800,'middle',11)]
    d+=['<circle cx="%s" cy="%s" r="15" fill="rgba(67,97,238,0.30)"></circle>'%(n(X(11)),n(Y(62.5))),ring(X(11),Y(62.5),8),T(X(11),Y(62.5)-16,'2 aperte','#ffffff',800,'middle',11)]
    return sv(W,H,b,'Prove che poi pagano, sprint dopo sprint'),sv(W,H,d),(X(11),Y(62.5))
def g7(W,H,**k):
    ML,MR=50,22; PW=W-ML-MR; PH=H-MT-MB; y0,y1=-0.5,4.4; Y=lambda v: MT+PH*(1-(v-y0)/(y1-y0)); X=lambda i: ML+24+(PW-48)*i/6.0; x1=ML+PW
    b=[L(ML,Y(v),x1,Y(v),GRID) for v in (1,2,3,4)]+[L(ML,Y(0),x1,Y(0),INK,1.5)]+[T(ML-8,Y(v)+4,str(v),MUT,600,'end') for v in range(5)]
    b+=[T(X(i),H-MB+18,'%02d/10'%(6+i),'#ffffff' if i==0 else MUT,800 if i==0 else 600,'middle') for i in range(7)]
    cnt=[1,1,0,1,0,0,3]; cum=[0.625*sum(cnt[:i+1]) for i in range(7)]; pts=[(X(i),Y(v)) for i,v in enumerate(cum)]
    d=[pl(pts,BLU,3,'8 7')]
    for i,(x,y) in enumerate(pts):
        if cnt[i]: d+=[ring(x,y,6),T(x+(0 if i<6 else 8),y-12,'%d prov%s'%(cnt[i],'a' if cnt[i]==1 else 'e'),'#ffffff',800,'middle' if i<6 else 'end',11)]
        else: d.append(dot(x,y,3,BLU))
    d+=[dot(X(2),Y(0),4,TER),T(X(2),Y(0)-9,'1 disdetta',MUT,700,'middle',11)]
    return sv(W,H,b,'Paganti attesi dalle prove in scadenza'),sv(W,H,d),(X(6),Y(cum[6]))
G4={1:g1,2:g2,3:g3,5:g5,7:g7}
def blkN(k,x,y,w,h,big=34,tx=None,extra='',slot=None,**kw):
    q=slot or k
    pad=24; head=96 if big>=30 else 84; cw=w-2*pad; ch=h-2*pad-head
    b,d,pt=G4[k](cw,ch,**kw); t,m,v,c=tx or TX[k]
    s='<div style="position: absolute; left: %dpx; top: %dpx; width: %dpx; height: %dpx; %s; opacity: «e%d.o»; transform: «e%d.tf»">'%(x,y,w,h,CS,q,q)
    s+='<div style="position: absolute; left: %dpx; top: %dpx; width: %dpx; display: flex; justify-content: space-between; align-items: baseline"><div style="font-size: 15px; font-weight: 800; line-height: 20px">%s</div><div style="font-size: 13px; font-weight: 600; color: %s">%s</div></div>'%(pad,pad,cw,t,MUT,m)
    s+='<div style="position: absolute; left: %dpx; top: %dpx; display: flex; align-items: baseline; gap: 10px"><div style="font-size: %dpx; font-weight: 800; line-height: %dpx">%s</div><div style="font-size: 14px; font-weight: 600; color: %s; white-space: nowrap">%s</div>%s</div>'%(pad,pad+26,big,big+8,v,MUT,c,extra)
    s+='<div style="position: absolute; left: %dpx; top: %dpx; width: %dpx; height: %dpx">%s<div style="position: absolute; left: 0; top: 0; height: %dpx; width: «r%d»; overflow: hidden"><div style="position: relative; width: %dpx; height: %dpx">%s</div></div></div></div>'%(pad,pad+head,cw,ch,b,ch,q,cw,ch,d)
    return s,(x+pad+pt[0],y+pad+head+pt[1])
def skel(k,x,y,w,h,big=34,slot=None):
    q=slot or k
    pad=24; head=96 if big>=30 else 84; cw=w-2*pad; ch=h-2*pad-head
    s='<div style="position: absolute; left: %dpx; top: %dpx; width: %dpx; height: %dpx; %s; opacity: «e%d.o»; transform: «e%d.tf»">'%(x,y,w,h,CS,q,q)
    s+='<div style="position: absolute; left: %dpx; top: %dpx; font-size: 15px; font-weight: 800; line-height: 20px">%s</div>'%(pad,pad,TX[k][0])
    s+='<div style="position: absolute; left: %dpx; top: %dpx; width: 96px; height: %dpx; border-radius: 8px; background: #2a2e37; opacity: «sk.o»"></div>'%(pad,pad+32,big-6)
    s+='<div style="position: absolute; left: %dpx; top: %dpx; width: 220px; height: 14px; border-radius: 7px; background: #2a2e37; opacity: «sk.o»"></div>'%(pad+108,pad+32+big-22)
    s+='<div style="position: absolute; left: %dpx; top: %dpx; width: %dpx; height: %dpx; border-radius: 10px; background: #2a2e37; opacity: «sk.o»"></div></div>'%(pad,pad+head+MT,cw,ch-MT-MB)
    return s
LEG4=[lg('dot',INK,'pagato'),lg('ring',BLU,'stima con le prove'),lg('line',PAST,'sprint passati, reale'),lg('rect',FZ,'prove in scadenza'),lg('rect','rgba(251,139,4,0.22)','qui guadagniamo')]
def leg4(pos,top,wrap=False): return '<div style="position: absolute; %s; top: %dpx; display: flex; %s gap: 8px 18px; font-size: 13px; font-weight: 600; color: %s; opacity: «em.o»">%s</div>'%(pos,top,'flex-wrap: wrap;' if wrap else '',MUT,''.join(LEG4))
def ovl(tip=True,ptr=True):
    o=ov2(); i=o.index('<div style="position: absolute; left: «tp.x»'); j=o.index('<div style="position: absolute; left: 0; top: 0; width: %dpx'%W)
    return (o[:i] if tip else '')+(o[i:j] if ptr else '')+o[j:]
HK='Math.min(p(3.2, 0.3), 1 - p(5.3, 0.3))'
JS=JS.replace('eco: { o: f(eco) },','eco: { o: f(eco) }, sk: { o: f(0.72 + 0.28 * Math.sin(t * 4.2)) }, bh: { o: f(p(3.3, 0.2)) }, h5: { o: f(1 - 0.82 * %s) }, h12: { o: f(1 - 0.82 * %s) }, h13: { o: 1 },'%(HK,HK))
CW=dict(W=[1264,596,596],A=[0.3,0.9,1.1],S=[900,720],T2=list(ECO),TO=[24,-128],SC=0)
LOW=[(5,96,564,2),(7,764,564,3),(3,96,900,2),(2,764,900,3)]
TXE={1:(TX[1][0],'giorno 1 di 16','–','nessuna spesa ancora in questo sprint'),3:(TX[3][0],'giorno 1 di 9','–','nessuna spesa ancora in questo sprint')}
def cards(empty=False,hov=False):
    c1,t1=blkN(1,96,92,1312,448,tx=TXE[1] if empty else None,extra='' if empty else EXTRA1,empty=empty,hov=hov); s=c1
    for k,x,y,q in LOW: s+=blkN(k,x,y,644,312,big=28,slot=q,tx=TXE[3] if (empty and k==3) else None,empty=empty)[0]
    return s,[round(t1[0]),round(t1[1])]
def page(h):
    global H
    H=h; return rail2().replace('height: 900px','height: %dpx'%h)
LEGR=leg4('right: 32px',38)
r_=page(1236); c,t1=cards()
board('home-1-home.dc.html','1 - Home',HM,W,H,r_+head2()+LEGR+c+ovl(),dict(CW,T1=t1))
load='<div style="position: absolute; left: 468px; top: 36px; font-size: 13px; font-weight: 600; color: %s; opacity: «sk.o»">Caricamento…</div>'%MUT
sk=skel(1,96,92,1312,448)+''.join(skel(k,x,y,644,312,28,slot=q) for k,x,y,q in LOW)
board('home-2-caricamento.dc.html','2 - Caricamento',HM,W,H,r_+head2(False)+load+sk+ovl(False,False),dict(CW,T1=[0,0],SC=1))
r_=page(900)
err='<div style="position: absolute; left: 404px; top: 250px; width: 696px; height: 300px; %s; opacity: «e1.o»; transform: «e1.tf»">'%CS
err+='<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="%s" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; left: 328px; top: 32px; display: block" aria-hidden="true"><path d="M12 3l10 18H2z"></path><path d="M12 10v5"></path><path d="M12 18v.500"></path></svg>'%MUT
err+='<div style="position: absolute; left: 0; top: 86px; width: 693px; text-align: center; font-size: 20px; font-weight: 800; line-height: 28px">Errore nel caricamento</div>'
err+='<div style="position: absolute; left: 96px; top: 124px; width: 501px; text-align: center; font-size: 14px; font-weight: 600; line-height: 22px; color: %s">Il database ci ha messo troppo e ha annullato la query. Capita a cache fredda: riprova fra qualche secondo.</div>'%MUT
err+='<button style="position: absolute; left: 266px; top: 200px; width: 160px; height: 48px; padding: 0; border: 0; border-radius: 50px; background: %s; box-shadow: 0 3px 0 #050608; color: #ffffff; font-family: inherit; font-size: 15px; font-weight: 800; overflow: hidden"><span style="position: absolute; inset: 0; background: rgba(255,255,255,0.18); opacity: «bh.o»"></span><span style="position: relative">Aggiorna</span></button></div>'%BLU
board('home-3-errore.dc.html','3 - Errore',HM,W,H,r_.replace('«eco.o»','0')+head2(False)+err+ovl(False),dict(CW,T1=[750,474],T2=[750,474]))
r_=page(1236); c,_=cards(empty=True)
board('home-4-vuoto.dc.html','4 - Sprint vuoto',HM,W,H,r_+head2(False).replace('giorno 2 di 16','giorno 1 di 16')+LEGR+c+ovl(False,False),dict(CW,T1=[0,0],SC=1))
c,t1=cards(hov=True)
tipo=ovl().replace('Sprint 15 · giorno 2 · stima','Sprint 13 · giorno 12 · reale').replace('0 € rientrati per ogni euro','0,34 € rientrati per ogni euro').replace('4,72 € spesi · 2 prove aperte · 0 paganti','sprint chiuso, dato reale')
board('home-5-passaggio-mouse.dc.html','5 - Passaggio mouse',HM,W,H,r_+head2()+LEGR+c+tipo,dict(CW,T1=t1,TO=[-144,-120]))
W=820; r_=page(1924)
c1,t1=blkN(1,88,128,708,420,extra=EXTRA1); c=c1+''.join(blkN(k,88,572+336*i,708,312,big=28,slot=2+i%2)[0] for i,k in enumerate((5,7,3,2)))
board('home-6-finestra-stretta.dc.html','6 - Finestra stretta',HM,W,H,r_+head2().replace('left: 96px','left: 88px')+leg4('left: 88px',88,True)+c+ovl(),dict(W=[660,660,660],A=[0.3,0.6,0.9],S=[600,760],T1=[round(t1[0]),round(t1[1])],T2=list(ECO),TO=[24,-128],SC=0))
# canvas: «Redesign» sotto «Oggi», poi «Proposte», poi «Grafico 1»
cv=json.load(open('project/canvas.json'))
for k,b in cv['boards'].items():
    if k.startswith('prop-'): b['y']=3700
    if k.startswith('g1-'): b['y']=5000
cv['notes']['prop']['y']=3400; cv['notes']['g1']['y']=4700
cv['notes']['red']={"kind":"title1","maxW":4000,"text":"Redesign","w":240,"x":0,"y":1000}
for i,(fn,t,w,h) in enumerate([('home-1-home','1 - Home',1440,1236),('home-2-caricamento','2 - Caricamento',1440,1236),('home-3-errore','3 - Errore',1440,900),('home-4-vuoto','4 - Sprint vuoto',1440,1236),('home-5-passaggio-mouse','5 - Passaggio mouse',1440,1236),('home-6-finestra-stretta','6 - Finestra stretta',820,1924)]):
    cv['boards'][fn+'.dc.html']={"w":w,"h":h,"x":1520*i,"y":1300,"title":t}
cv['order']=list(cv['boards'].keys())
json.dump(cv,open('project/canvas.json','w'),ensure_ascii=False,indent=1)
print('ok')
