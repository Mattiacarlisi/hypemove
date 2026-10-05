import json
exec(open('gen3.py').read().split('\nCHIPS=')[0])
# Fila «Direzioni»: tre impaginazioni della Home intera, pensate per pochi dati.
# Regole: area del grafico senza scritte, legenda fuori, ogni grafico è una curva nel tempo, niente fuori scala.
# Si lancia nella cartella con gen.py, gen2.py, gen3.py e project/canvas.json letto dal documento.
W,H=1440,900
N=36            # giorni dal 07/09 al 12/10
LAST=28         # 05/10, ultimo giorno intero
TODAY=29        # 06/10
RATE=0.625; YEAR=20.90
it=lambda v,d=2: ('%.*f'%(d,v)).replace('.',',')
day=lambda i: '%02d/%02d'%((7+i,9) if i<24 else (i-23,10))
# ---- dati veri (Supabase, 06/10/2026)
SPEND={0:20.37,1:19.28,2:25.39,3:31.57,4:31.53,5:36.24,6:37.71,7:25.40,8:21.97,9:21.66,10:22.43,14:21.75,15:20.79,16:19.80,19:15.17,20:18.49,21:15.03,22:32.90,23:25.50,24:24.64,25:22.96,28:4.72}
PAID={18:20.90+6.90*2,21:20.90,24:20.90}
# prove: (giorno di avvio, giorno di fine o None, esito 'p' pagata / 'n' non pagata / None aperta, disdetta)
TR=[(6,18,'p',False),(7,14,'n',True),(14,21,'p',False),(17,24,'p',False),(19,26,'n',True),(19,26,'n',True),
    (22,29,None,False),(23,30,None,False),(24,31,None,True),(25,32,None,False),(28,35,None,False),(28,35,None,False),(28,35,None,False)]
BASE_START,BASE_PAID,BASE_END=2,2,2     # le due prove di luglio, tutte e due pagate
started=[BASE_START+sum(1 for t in TR if t[0]<=i) for i in range(LAST+1)]
paid=[BASE_PAID+sum(1 for t in TR if t[2]=='p' and t[1]<=i) for i in range(LAST+1)]
ended=[BASE_END+sum(1 for t in TR if t[2] and t[1]<=i) for i in range(LAST+1)]
rate=[100.0*paid[i]/ended[i] for i in range(LAST+1)]
est=[paid[LAST]+RATE*sum(1 for t in TR if t[2] is None and not t[3] and t[1]<=i) for i in range(LAST,N)]
cs=[sum(v for k,v in SPEND.items() if k<=i) for i in range(LAST+1)]
cp=[sum(v for k,v in PAID.items() if k<=i) for i in range(LAST+1)]
opn=[sum(1 for t in TR if not t[3] and t[0]<=i and (t[1] is None or t[1]>i or t[2] is None)) for i in range(LAST+1)]
roi=[cp[i]/cs[i] for i in range(LAST+1)]
roie=[(cp[i]+opn[i]*RATE*YEAR)/cs[i] for i in range(LAST+1)]
assert paid[LAST]==5 and ended[LAST]==8 and started[LAST]==15 and abs(est[-1]-8.75)<1e-9
chg=lambda s: [i for i in range(1,len(s)) if abs(s[i]-s[i-1])>1e-9]
# ---- Sprint 15, giorno per giorno: pagato reale, poi la traccia stimata
# spesa futura al ritmo dello Sprint 14 (154,69 EUR in 7 giorni = 22,10 al giorno) fino al giorno 9; le 2 prove finiscono al giorno 9
S14DAY=154.69/7; SP15=[0,4.72]+[4.72+S14DAY*(d-2) for d in range(3,10)]+[4.72+S14DAY*7]*7
# la prova vale dal giorno in cui parte; al giorno 2 la stima (5,54) non sta nella scala e non si disegna
# prove future: quelle già avviate più le attese dalla spesa che manca, al ritmo di Sprint 14 e Sprint 15 insieme (5 prove su 159,41 EUR)
TPE=(3+2)/(154.69+4.72)
E15=[(i,(2+TPE*(SP15[i]-4.72))*RATE*YEAR/SP15[i]) for i in range(2,16)]
assert max(v for _,v in E15)<=1.5
S15EST=it(E15[-1][1])
# ---- un grafico: base (assi, griglia) e dati (curve), senza nessuna scritta dentro l'area
XL=[(1,day(1)),(8,day(8)),(15,day(15)),(22,day(22)),(TODAY,'oggi'),(35,day(35))]
XS=[(i,'oggi' if i==2 else str(i+1)) for i in range(16)]
def plot(w,h,ymax,ticks,series,par=None,xl=True,ML=52,MR=14,mt=10,nx=N,fz=LAST+0.5,labs=XL,fz2=None):
    mb=30 if xl else 12; PW=w-ML-MR; PH=h-mt-mb; y0=-0.07*ymax; y1=ymax*1.04
    X=lambda i: ML+PW*i/(nx-1.0); Y=lambda v: mt+PH*(1-(v-y0)/(y1-y0)); x1=ML+PW; lab=dict(labs)
    b=[R(X(fz),mt,x1-X(fz),PH,FZ)]
    if fz2 is not None: b.append(R(X(fz2),mt,x1-X(fz2),PH,FZ2))
    b+=[L(ML,Y(v),x1,Y(v),GRID) for v,_ in ticks if v]+[L(ML,Y(0),x1,Y(0),INK,1.5)]
    b+=[T(ML-8,Y(v)+4,l,MUT,600,'end') for v,l in ticks]
    b+=[L(X(i),mt+PH,X(i),mt+PH+(6 if i in lab else 3),TER) for i in range(nx)]
    if xl: b+=[T(X(i)+(MR-2 if i==nx-1 else 0),h-8,t,'#ffffff' if t=='oggi' else MUT,800 if t=='oggi' else 600,'end' if i==nx-1 else 'middle') for i,t in labs]
    if par is not None: b.append('<line x1="%s" y1="%s" x2="%s" y2="%s" stroke="%s" stroke-width="3" stroke-linecap="round"></line>'%(n(ML),n(Y(par)),n(x1),n(Y(par)),ORA))
    d=[]
    for pts,c,sw,dash,dots,kind in series:
        P=[(X(i),Y(v)) for i,v in pts]; d.append(pl(P,c,sw,dash)); dv=dict(pts)
        for i in dots: d.append(ring(X(i),Y(dv[i]),5) if kind=='ring' else dot(X(i),Y(dv[i]),4,c))
    return sv(w,h,b),sv(w,h,d),X,Y
PCT=[(0,'0'),(25,'25%'),(50,'50%'),(75,'75%'),(100,'100%')]
CNT=[(0,'0'),(4,'4'),(8,'8'),(12,'12'),(16,'16')]
EU=[(0,'0'),(0.25,'0,25 €'),(0.5,'0,50 €'),(0.75,'0,75 €'),(1,'1 €')]
EU15=[(0,'0'),(0.5,'0,50 €'),(1,'1 €'),(1.5,'1,50 €')]
E=list(range(LAST+1))
def fTrials(w,h,**k):
    s=[(list(zip(E,started)),MUT,2.5,None,chg(started),'dot'),(list(zip(E,paid)),INK,3,None,chg(paid)+[LAST],'dot'),
       (list(zip(range(LAST,N),est)),BLU,3,'7 6',[29,30,32,35],'ring')]
    return plot(w,h,16,CNT,s,**k)
def fRate(w,h,**k): return plot(w,h,100,PCT,[(list(zip(E,rate)),INK,3,None,chg(rate)+[LAST],'dot')],**k)
# sprint passati come quello di oggi: (pagato + prove aperte x tasso x 20,90) / spesa, giorno per giorno
# per sprint: spesa per giorno dello sprint, prove (giorno di avvio, giorno di pagamento o None), giorni disegnati
def sprint_curve(spend,trials,nd):
    v=[]; est=[]
    for i in range(nd):
        sp=sum(x for k,x in spend.items() if k<=i)
        pd=sum(YEAR for a,z in trials if z is not None and z<=i); op=sum(1 for a,z in trials if a<=i and (z is None or z>i))
        v.append((pd+op*RATE*YEAR)/sp); est.append(op>0)
    return v,est
PASTS=[(sprint_curve({k:SPEND[k] for k in range(11)},[(6,18),(14,21)],16),'#d1d5db'),
       (sprint_curve({0:21.75,1:20.79,2:19.80},[(3,10)],15),TER),
       (sprint_curve({0:21.52,1:21.12},[(2,9),(3,10)],16),MUT)]
def fSprint(w,h,**k):
    s=[]
    for (v,est),c in PASTS:
        # tratti: tratteggiato dove ci sono prove aperte, pieno dove il dato è reale
        i=0
        while i<len(v)-1:
            j=i; e=est[i+1] or est[i]
            while j<len(v)-1 and (est[j+1] or est[j])==e: j+=1
            s.append(([(q,v[q]) for q in range(i,j+1)],c,2.5,'7 6' if e else None,[j] if j==len(v)-1 or not e else [],'dot')); i=j
    s+=[(E15,BLU,3,'7 6',[2,15],'ring'),([(0,0),(1,0)],INK,3,None,[1],'dot')]
    return plot(w,h,1.5,EU15,s,par=1,nx=16,fz=1.5,fz2=8,labs=XS if w>600 else XS[::2],**k)
# ---- grafici 3, 5, 6, 7 (dati Supabase 06/10/2026)
S12SP={k:SPEND[k] for k in range(11)}; S13SP={0:21.75,1:20.79,2:19.80}; S5SP={0:21.52,1:21.12}
def t100(spend,starts,nd): return [100.0*sum(1 for a in starts if a<=i)/sum(x for k,x in spend.items() if k<=i) for i in range(nd)]
T15=[(i,100*(2+TPE*(SP15[i]-4.72))/SP15[i]) for i in range(2,16)]
def fT100(w,h,**k):
    s=[(list(enumerate(t100(sp,st,nd))),c,2.5,None,[nd-1],'dot') for sp,st,nd,c in ((S12SP,[6,14],16,'#d1d5db'),(S13SP,[3],15,TER),(S5SP,[2,3],16,MUT))]
    s+=[(T15,BLU,3,'7 6',[2,15],'ring'),([(0,0),(1,0)],INK,3,None,[],'dot')]
    return plot(w,h,12,[(0,'0'),(4,'4'),(8,'8'),(12,'12')],s,par=100/(YEAR*RATE),nx=16,fz=1.5,fz2=8,labs=XS if w>700 else XS[::2],**k)
assert max(v for _,v in T15)<=12
SS=[(i,'S%d'%(i+4)) for i in range(12)]
def fSprints(w,h,**k):
    s=[(list(enumerate(REAL2)),INK,3,None,list(range(10)),'dot'),([(9,REAL2[9]),(10,2*RATE*YEAR/154.69),(11,E15[-1][1])],BLU,3,'7 6',[10,11],'ring')]
    return plot(w,h,1.5,EU15,s,par=1,nx=12,fz=9.5,labs=SS,**k)
# prove non disdette: quota sulle prove avviate fino a quel giorno (la data della disdetta non c'è, conta il giorno di avvio)
keep=[100.0*(BASE_START+sum(1 for t in TR if t[0]<=i and not t[3]))/started[i] for i in range(LAST+1)]
def fKeep(w,h,**k): return plot(w,h,100,PCT,[(list(zip(E,keep)),INK,3,None,chg(keep)+[LAST],'dot')],**k)
FO=[13,30,100,137,160,152,173,107,78,80,66,23,6,25,80,98,107,5,5,35,31,14,44,46,54,71,14,21,104]
fo100=[(i,100.0*sum(1 for t in TR if t[0]<=i)/sum(FO[:i+1])) for i in range(LAST+1)]
def fFo(w,h,**k): return plot(w,h,1,[(0,'0'),(0.25,'0,25'),(0.5,'0,50'),(0.75,'0,75'),(1,'1')],[(fo100,INK,3,None,[LAST],'dot')],**k)
HOV=21   # 28/09, il giorno su cui passa il mouse
RD={'t':'%s · %d avviate · %d hanno pagato'%(day(HOV),started[HOV],paid[HOV]),'r':'%s · %s%% delle prove finite'%(day(HOV),it(rate[HOV],0)),'s':'giorno 9 · stima %s € per euro'%S15EST}
# ---- pezzi di pagina
def lgd(c,txt,dash=None,sw=3): return '<div style="display: flex; align-items: center; gap: 6px"><svg width="26" height="12" aria-hidden="true"><line x1="2" y1="6" x2="24" y2="6" stroke="%s" stroke-width="%s" stroke-linecap="round"%s></line></svg><span>%s</span></div>'%(c,sw,' stroke-dasharray="%s"'%dash if dash else '',txt)
L_REAL=lgd(INK,'reale'); L_EST=lgd(BLU,'stima','6 5'); L_START=lgd(MUT,'prove avviate'); L_PAR=lgd(ORA,'pareggio'); L_FUT=lg('rect',FZ,'da oggi')
FZ2='rgba(255,255,255,0.05)'; L_END=lg('rect','rgba(255,255,255,0.09)','pubblicità finita')
L_PAST=[lgd(MUT,'Sprint 5'),lgd('#d1d5db','Sprint 12'),lgd(TER,'Sprint 13'),lgd(MUT,'con prove aperte','6 5')]
def legend(items,pos='right: 32px',top=38): return '<div style="position: absolute; %s; top: %dpx; display: flex; gap: 14px; font-size: 13px; font-weight: 600; color: %s; white-space: nowrap; opacity: «em.o»">%s</div>'%(pos,top,MUT,''.join(items))
def head5(show=True):
    h=head2().replace('giorno 2 di 16','giorno 3 di 16')
    pill='<div style="font-size: 13px; font-weight: 700; padding: 6px 12px; border-radius: 50px; background: #262d45; border: 1.500px solid %s; box-shadow: 0 2px 0 #050608; white-space: nowrap">2 prove aperte</div>'%BLU
    return h[:-6]+pill+'</div>' if show else h
def box(x,y,w,h,slot,inner): return '<div style="position: absolute; left: %dpx; top: %dpx; width: %dpx; height: %dpx; %s; opacity: «e%d.o»; transform: «e%d.tf»">%s</div>'%(x,y,w,h,CS,slot,slot,inner)
def num(x,y,title,big,cap,size=44,extra='',col=INK):
    s='<div style="position: absolute; left: %dpx; top: %dpx; font-size: 15px; font-weight: 800; line-height: 20px; white-space: nowrap">%s</div>'%(x,y,title)
    s+='<div style="position: absolute; left: %dpx; top: %dpx; font-size: %dpx; font-weight: 800; line-height: %dpx; white-space: nowrap; color: %s">%s</div>'%(x,y+26,size,size+4,col,big)
    s+='<div style="position: absolute; left: %dpx; top: %dpx; font-size: 14px; font-weight: 600; line-height: 20px; color: %s; white-space: nowrap">%s</div>%s'%(x,y+34+size,MUT,cap,extra)
    return s
def chart(x,y,w,h,fn,slot,**k):
    b,d,X,Y=fn(w,h,**k)
    return '<div style="position: absolute; left: %dpx; top: %dpx; width: %dpx; height: %dpx">%s<div style="position: absolute; left: 0; top: 0; height: %dpx; width: «r%d»; overflow: hidden"><div style="position: relative; width: %dpx; height: %dpx">%s</div></div></div>'%(x,y,w,h,b,h,slot,w,h,d),X,Y
def readout(pos,top,txt): return '<div style="position: absolute; %s; top: %dpx; font-size: 13px; font-weight: 700; padding: 4px 12px; border-radius: 50px; background: #ffffff; color: #0f1115; white-space: nowrap; opacity: «tip.o»">%s</div>'%(pos,top,txt)
def guide(x,y,h): return '<div style="position: absolute; left: %spx; top: %dpx; width: 1.500px; height: %dpx; background: #ffffff; opacity: «gd.o»"></div>'%(n(x-0.75),y,h)
def ovl5(extra=''):
    s=extra+'<div style="position: absolute; left: «hp.x»; top: «hp.y»; width: 28px; height: 28px; border-radius: 14px; border: 2px solid #ffffff; box-sizing: border-box; opacity: «tip.o»"></div>'
    s+='<div style="position: absolute; left: «tp.x»; top: «tp.y»; width: 80px; height: 80px; border-radius: 40px; background: #ffffff; opacity: «tp.o»; transform: «tp.tf»"></div>'
    s+='<svg width="22" height="26" viewBox="0 0 22 26" style="position: absolute; left: «pt.x»; top: «pt.y»; display: block" aria-hidden="true"><path d="M2 2l16 12-7 1.500 4 8-3 1.500-4-8-6 4z" fill="#ffffff" stroke="#0f1115" stroke-width="1.500" stroke-linejoin="round"></path></svg>'
    s+='<div style="position: absolute; left: 0; top: 0; width: %dpx; height: %dpx; background: #0f1115; opacity: «veil»; pointer-events: none"></div>'%(W,H)
    return s
JS=JS.replace('em: ent(0.3),','em: ent(0.3), e4: ent(C.A[3] || 0.3), gd: { o: f(0.45 * tipo) },')
SUB='<div style="position: absolute; left: %dpx; top: %dpx; font-size: 14px; font-weight: 600; line-height: 20px; color: %s; white-space: nowrap"><span style="color: #ffffff; font-weight: 800">0 €</span> pagati finora</div>'
T_SP='Sprint 15, rientro per euro'
# ---- 2A «Sprint in alto»: sette grafici in ordine di importanza
def dirA():
    global H
    H=1596
    ch,X,Y=chart(24,100,1264,324,fSprint,1)
    inner=num(24,20,'Lo sprint, giorno per giorno',S15EST+' €','stima a fine prove · 0 € pagati finora',28,col=BLU)
    inner+='<div style="position: absolute; right: 24px; top: 22px; display: flex; gap: 14px; font-size: 13px; font-weight: 600; color: %s; white-space: nowrap">%s</div>'%(MUT,''.join([lgd(INK,'pagato'),lgd(BLU,'stima','6 5')]+L_PAST+[L_PAR,L_FUT,L_END]))+ch
    s=box(96,92,1312,448,1,inner)
    low=[(fRate,'Prove che poi pagano','62,5%','5 prove finite su 8 hanno pagato',INK,''),
         (fT100,'Prove avviate ogni 100 €','%s'%it(T15[-1][1],1),'stima a fine pubblicità · pareggio a 7,7',BLU,''),
         (fTrials,'Paganti attesi','3,8','da 6 prove aperte, 1 disdetta vale zero',BLU,''.join([L_START,lgd(INK,'hanno pagato'),lgd(BLU,'stima','6 5')])),
         (fSprints,'Sprint dopo sprint',S15EST+' €','stima Sprint 15 · ultimo chiuso 0,34 €',BLU,''),
         (fKeep,'Prove non disdette','%s%%'%it(keep[LAST],0),'11 prove su 15 con il rinnovo attivo',INK,''),
         (fFo,'Prove ogni 100 primi accessi',it(fo100[LAST][1],1),'dal 07/09',INK,'')]
    for j,(fn,t,b,c,col,lg_) in enumerate(low):
        x=96+668*(j%2); y=564+336*(j//2); slot=2+j%2
        cj,_,_=chart(20,112,604,180,fn,slot)
        ex='<div style="position: absolute; right: 24px; top: 24px; display: flex; gap: 14px; font-size: 13px; font-weight: 600; color: %s; white-space: nowrap">%s</div>'%(MUT,lg_) if lg_ else ''
        s+=box(x,y,644,312,slot,num(24,20,t,b,c,28,col=col)+ex+cj)
    t1=[round(96+24+X(8)),round(92+100+Y(dict(E15)[8]))]
    ov=ovl5(guide(t1[0],92+100+10,284)+readout('left: 520px',92+53,RD['s']))
    board('dir-A-tre-numeri.dc.html','2A - Sprint in alto',HM,W,H,rail2().replace('height: 900px','height: %dpx'%H)+head5()+s+ov,dict(W=[1264,604,604],A=[0.3,0.7,0.9],S=[900,760],T1=t1,T2=list(ECO),TO=[0,0],SC=0))
    H=900
LEGALL=[L_REAL,L_EST,L_START]+L_PAST+[L_PAR,L_FUT,L_END]
# ---- 2B «Tasso al centro»: il tasso di fine prova domina, due grafici piccoli sotto
def dirB():
    hero=num(32,32,'Prove che poi pagano','62,5%','5 prove finite su 8 hanno pagato',104)
    rows=[('6','prove aperte'),('1','disdetta, vale zero'),('3,8','paganti attesi entro il 12/10'),(S15EST+' €','rientro stimato dello Sprint 15')]
    hero+='<div style="position: absolute; left: 32px; top: 256px; width: 360px; height: 1.500px; background: %s"></div>'%BOR
    for i,(v,c) in enumerate(rows):
        hero+='<div style="position: absolute; left: 32px; top: %dpx; display: flex; align-items: baseline; gap: 12px; white-space: nowrap"><div style="width: 96px; font-size: 32px; font-weight: 800; line-height: 40px; color: %s">%s</div><div style="font-size: 15px; font-weight: 600; color: %s">%s</div></div>'%(288+64*i,BLU if i>=2 else INK,v,MUT,c)
    s=box(96,92,424,784,1,hero)
    c1,X,Y=chart(24,60,816,364,fRate,1)
    s+=box(544,92,864,448,2,'<div style="position: absolute; left: 24px; top: 24px; font-size: 15px; font-weight: 800; line-height: 20px">Tasso di fine prova, giorno per giorno</div>'+c1)
    c2,_,_=chart(20,112,380,180,fTrials,2)
    s+=box(544,564,420,312,3,num(24,20,'Paganti attesi','3,8','da 6 prove aperte',28,col=BLU)+c2)
    c3,_,_=chart(20,112,380,180,fSprint,3)
    s+=box(988,564,420,312,3,num(24,20,T_SP,S15EST+' €','stima a fine prove · 0 € pagati finora',28,col=BLU)+c3)
    t1=[round(544+24+X(HOV)),round(92+60+Y(rate[HOV]))]
    ov=ovl5(guide(t1[0],92+60+10,324)+readout('right: 56px',113,RD['r']))
    board('dir-B-tasso-centro.dc.html','2B - Tasso al centro',HM,W,H,rail2()+head5(False)+legend(LEGALL)+s+ov,dict(W=[816,380,380],A=[0.3,0.5,0.8],S=[1000,800],T1=t1,T2=list(ECO),TO=[0,0],SC=0))
# ---- 2C «Curve in colonna»: tre curve una sopra l'altra, le prime due sullo stesso asse dei giorni
def dirC():
    PX,PW,BH=328,960,224; inner=''
    bands=[('Prove che poi pagano','62,5%','5 prove finite su 8',fRate,rate,'',INK),('Paganti attesi','3,8','da 6 prove aperte',fTrials,paid,'',BLU),(T_SP,S15EST+' €','stima a fine prove',fSprint,None,SUB%(32,0,MUT),BLU)]
    t1=None
    for i,(t,b,c,fn,ser,ex,col) in enumerate(bands):
        y=28+240*i+(18 if i==2 else 0)
        inner+=num(32,y,t,b,c,44,ex.replace('top: 0px','top: %dpx'%(y+102)),col)
        ch,X,Y=chart(PX,y,PW,BH+(18 if i else 0),fn,1+i,xl=i>0)
        inner+=ch
        if i<2: inner+='<div style="position: absolute; left: 32px; top: %dpx; width: 1248px; height: 1.500px; background: %s"></div>'%(y+BH+(7 if i==0 else 25),BOR)
        if i==1: t1=[round(96+PX+X(HOV)),round(92+y+Y(ser[HOV]))]
    s=box(96,92,1312,784,4,inner)
    rds=''.join(readout('left: 128px',92+28+240*i+128,RD[k]) for i,k in enumerate('rt'))
    ov=ovl5(guide(t1[0],92+38,440)+rds)
    board('dir-C-curve-colonna.dc.html','2C - Curve in colonna',HM,W,H,rail2()+head5(False)+legend(LEGALL)+s+ov,dict(W=[PW,PW,PW],A=[0.3,0.3,0.3,0.3],S=[1000,820],T1=t1,T2=list(ECO),TO=[0,0],SC=0))
dirA(); dirB(); dirC()
# canvas: «Direzioni» subito sotto «Oggi», le altre file scendono
cv=json.load(open('project/canvas.json'))
if 'dir' not in cv['notes']:
    for k,b in cv['boards'].items():
        if k!='Main.dc.html': b['y']+=1500
    for k,nt in cv['notes'].items():
        if k!='oggi': nt['y']+=1500
    cv['notes']['dir']={"kind":"title1","maxW":4000,"text":"Direzioni","w":240,"x":0,"y":1000}
cv['boards'].pop('dir-C-un-solo-tempo.dc.html',None)
if cv['notes']['red']['y']==2500:
    for k,b in cv['boards'].items():
        if k!='Main.dc.html' and not k.startswith('dir-'): b['y']+=800
    for k,nt in cv['notes'].items():
        if k not in ('oggi','dir'): nt['y']+=800
for i,(fn,t) in enumerate([('dir-A-tre-numeri','2A - Sprint in alto'),('dir-B-tasso-centro','2B - Tasso al centro'),('dir-C-curve-colonna','2C - Curve in colonna')]):
    cv['boards'][fn+'.dc.html']={"w":1440,"h":1596 if 'dir-A' in fn else 900,"x":1520*i,"y":1300,"title":t}
cv['order']=list(cv['boards'].keys())
json.dump(cv,open('project/canvas.json','w'),ensure_ascii=False,indent=1)
print('ok',RD,S15EST)
