# Tavole «Sprint vs record»: fila «Oggi» (fedele a kpi.js, sprintScoreboardCard) e fila «Proposte» (quattro direzioni).
# Dati veri: kpi_sprint_scoreboard() letta da Supabase l'08/10/2026. Si lancia nella cartella che contiene project/.
import json, re, math, os
SRC='/home/d4nd0n/Dev/HypeMove/www/_specs/design-flows/kpi-abbonamenti/gen.py'
JS=re.search(r"JS='''(.*?)'''",open(SRC).read(),re.S).group(1).replace('n < 8','n < 16')
KEYS=['home','detail','w1','w2','w3','trial','paid']
NAMES=['Arrivo in Home','Dettaglio workout','1 workout','2 workout','3 workout','Prova gratuita','Premium pagante']
SHORT=['Home','Dettaglio','1 workout','2 workout','3 workout','Prova','Pagante']
RAW=[('Sprint 1','2026-02-01','2026-02-13',0,0,0,0,0,0,0,0,236),('Sprint 2','2026-02-26','2026-03-07',0,0,0,0,0,0,0,0,214),
('Sprint 3','2026-03-25','2026-04-05',448,43,126,41,19,12,0,0,185),('sprint 4','2026-06-12','2026-06-18',436,61,238,82,39,25,0,0,111),
('Sprint 5','2026-06-29','2026-06-30',226,125,98,53,27,18,2,2,99),('Sprint 6','2026-07-01','2026-07-02',99,53,32,16,8,4,0,0,97),
('Spint 7','2026-07-11','2026-07-12',191,122,90,54,31,20,0,0,87),('Sprint 8','2026-07-14','2026-07-17',336,226,189,99,47,36,0,0,83),
('Sprint 9','2026-07-22','2026-07-25',210,135,105,53,28,18,0,0,74),('Sprint 10','2026-08-03','2026-08-11',882,543,411,187,111,82,0,0,57),
('Sprint 11','2026-08-30','2026-09-05',207,113,125,47,22,20,1,0,32),('Sprint 12','2026-09-07','2026-09-17',989,591,618,257,150,113,2,3,20),
('Sprint 12 - Test Rate +  Mascotte','2026-09-11','2026-09-17',747,453,469,188,106,80,2,2,20),('Sprint 13','2026-09-21','2026-09-23',260,192,74,32,17,10,1,1,14),
('Spint 14','2026-09-26','2026-10-04',258,181,86,40,13,7,3,0,3),('Sprint 15','2026-10-04','2026-10-12',377,218,163,33,5,3,3,1,-5),
('sprint 15 - Post onboarding Dettaglio','2026-10-06','2026-10-13',222,123,112,20,1,0,2,0,-6)]
SP=[dict(zip(['nome','inizio','fine','base']+KEYS+['age'],r),id=i) for i,r in enumerate(RAW)]
day=lambda d: d[8:]+'/'+d[5:7]
lab=lambda s: '%s · %s–%s'%(s['nome'],day(s['inizio']),day(s['fine']))
rate=lambda s,k: s[k]/s['base'] if s['base'] else 0.0
pct=lambda v: ('%.1f'%(v*100)).replace('.',',')
def same(k1,n1,k2,n2):
    if not n1 or not n2: return True
    p=(k1+k2)/(n1+n2); se=math.sqrt(p*(1-p)*(1/n1+1/n2))
    return se==0 or abs(k1/n1-k2/n2)/se<1.96
issub=lambda s: any(o['id']!=s['id'] and o['inizio']<=s['inizio'] and o['fine']>=s['fine'] and (o['inizio']<s['inizio'] or o['fine']>s['fine']) for o in SP)
def score(now,fixed=None):
    out=[]
    for i,k in enumerate(KEYS):
        pool=[s for s in SP if s['base']>=100 and s['age']>=(21 if k=='paid' else 14) and not issub(s)]
        ref=fixed or max(pool,key=lambda s: rate(s,k))
        v,b=rate(now,k),rate(ref,k); noise=same(now[k],now['base'],ref[k],ref['base'])
        if ref['id']==now['id']: st,badge='good','≈ stesso sprint' if fixed else '▲ record'
        elif v>b and not noise: st,badge='good',('▲ +%s pt'%pct(v-b)) if fixed else '▲ nuovo record'
        elif noise: st,badge='even','≈ in linea'
        else: st,badge=('mid' if v/b>=.75 else 'bad'),'▼ %s pt'%pct(b-v)
        out.append(dict(k=k,name=NAMES[i],short=SHORT[i],ref=ref,v=v,b=b,st=st,badge=badge,n=now[k],base=now['base'],
                        sim={'good':'up','even':'eq'}.get(st,'dn'),d=v-b))
    return out
POST,S14,S12=SP[16],SP[14],SP[11]

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

# ================================================================ FILA «OGGI»
OF=('family=Inter:wght@400;500;600;700&amp;family=JetBrains+Mono:wght@500;600;700','Inter, sans-serif')
BG,SUR,SUR2,BRD,BRD2,TXT,MUT='#0a0a0f','#111118','#1a1a24','#252535','#333345','#e8e8f0','#7070a0'
COL=dict(good=('#4ade80','#0d2b1a'),even=('#60a5fa','#0d1e35'),mid=('#fbbf24','#2b1f00'),bad=('#f87171','#2b0d0d'))
PUR,MONO='#a78bfa',"'JetBrains Mono', monospace"
def oside(who,val,col,n,border=False):
    return ('<div style="display:grid;gap:5px;min-width:0;%s"><span style="font-size:11px;color:%s;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">%s</span><span style="font:700 26px/1 %s;letter-spacing:-1px;color:%s">%s</span><span style="font:500 11px/1 %s;color:%s">%s</span></div>'
            %('border-left:1px solid %s;padding-left:12px'%BRD2 if border else '',MUT,who,MONO,col,val,MONO,MUT,n))
def obox(r,now,fixed):
    b=lambda t: '<b style="color:%s;font-weight:500">%s</b>'%(TXT,t)
    refl='Confronto' if fixed else 'Record'
    return ('<div style="background:%s;border:1px solid %s;border-radius:10px;padding:14px 14px 12px;display:grid;gap:12px;min-width:0;box-sizing:border-box"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.7px;color:%s;white-space:nowrap">%s</span><span style="font:600 11px/1 %s;padding:4px 8px;border-radius:20px;white-space:nowrap;color:%s;background:%s">%s</span></div><div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px">%s%s</div></div>'
            %(SUR2,BRD,MUT,r['name'],MONO,COL[r['st']][0],COL[r['st']][1],r['badge'],
              oside('%s · %s'%(refl,b(r['ref']['nome'])),pct(r['b'])+'%',PUR,'%d/%d'%(r['ref'][r['k']],r['ref']['base'])),
              oside(b(now['nome']),pct(r['v'])+'%',COL[r['st']][0],'%d/%d'%(r['n'],r['base']),True)))
def osel(t,ref=False,w=358):
    return ('<div style="width:%dpx;box-sizing:border-box;font-size:12px;padding:6px 10px;border-radius:6px;border:1px solid %s;background:%s;color:%s;display:flex;justify-content:space-between;align-items:center;gap:6px;white-space:nowrap;overflow:hidden"><span style="overflow:hidden;text-overflow:ellipsis">%s</span><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="%s" stroke-width="3" aria-hidden="true"><path d="M6 9l6 6 6-6"></path></svg></div>'
            %(w,'#3b2a66' if ref else BRD,'#1e1030' if ref else SUR2,PUR if ref else TXT,t,PUR if ref else TXT))
def ocard(now,fixed,cols,w=1248,stack=False):
    rs=score(now,fixed)
    prov=' · sprint in corso o chiuso da meno di 14 giorni, valori provvisori' if now['age']<14 else ''
    sw=(w-42) if stack else 358
    pick='<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">%s<span style="font:600 10px/1 %s;color:%s;text-transform:uppercase;letter-spacing:.8px">vs</span>%s</div>'%(osel(lab(now),w=sw),MONO,MUT,osel(lab(fixed) if fixed else 'Il migliore',True,sw))
    return ('<div style="display:flex;flex-direction:column;gap:12px;margin-bottom:16px"><div><div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;color:%s;margin-bottom:3px">%s</div><div style="font-size:12px;color:%s">%% su chi ha aperto l\'app · %d persone%s</div></div>%s</div><div style="display:grid;grid-template-columns:repeat(%d,minmax(0,1fr));gap:12px">%s</div>'
            %(MUT,'Sprint a confronto' if fixed else 'Sprint vs record',MUT,now['base'],prov,pick,cols,''.join(obox(r,now,fixed) for r in rs)))
def oshell(inner,w=1248,extra=''):
    return '<div style="position:absolute;left:16px;top:16px;width:%dpx;box-sizing:border-box;background:%s;border:1px solid %s;border-radius:10px;padding:20px;%s">%s</div>'%(w,SUR,BRD,extra,inner)
otitle='<div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;color:%s;margin-bottom:12px">Sprint vs record</div>'%MUT
# 1 — dati, poi il secondo menu passa da «Il migliore» a «Sprint 12»
opts=['Il migliore']+[lab(s) for s in SP]
menu='<div style="position:absolute;left:428px;top:118px;width:358px;box-sizing:border-box;background:#1a1a24;border:1px solid %s;border-radius:4px;padding:2px 0;box-shadow:0 8px 24px rgba(0,0,0,.6);opacity:«m1»">%s</div>'%(BRD2,''.join('<div style="height:22px;line-height:22px;padding:0 10px;font-size:12px;white-space:nowrap;overflow:hidden;color:%s;background:%s">%s</div>'%(TXT,'#2563eb' if i==0 else 'transparent',o) for i,o in enumerate(opts)))
my=118+2+22*12+11
b=oshell('<div style="opacity:«L.k0»">%s</div>'%ocard(POST,None,4),extra='opacity:«e1.o»')+oshell('<div style="opacity:«L.k1»">%s</div>'%ocard(POST,S12,4),extra='background:transparent;border-color:transparent')+menu
save('Main.dc.html','1 - Sprint vs record',1280,560,page('1 - Sprint vs record',1280,560,OF,BG,TXT,b,dict(P=11,TS=2.5,N=2,SW=[5.2],S=[1050,470],W=[[600,101,3.2],[560,my,5.0]],T=[[600,101,3.2],[560,my,5.0]],M=[[3.35,5.2],[99,99]])),0,0)
b=oshell(otitle+'<div style="font-size:12px;color:%s;opacity:«sk»">Calcolo del confronto fra sprint…</div>'%MUT)
save('oggi-2-caricamento.dc.html','2 - Caricamento',1280,160,page('2 - Caricamento',1280,160,OF,BG,TXT,b,dict(P=6),False),1360,0)
b=oshell(otitle+'<div style="font-size:12px;color:#f87171;display:flex;align-items:center">Failed to fetch<span style="font-size:11px;padding:4px 10px;margin-left:8px;border:1px solid %s;border-radius:6px;color:%s">↻ Riprova</span></div>'%(BRD2,MUT))
save('oggi-3-errore.dc.html','3 - Errore',1280,160,page('3 - Errore',1280,160,OF,BG,TXT,b,dict(P=6,S=[700,130],W=[[168,78,2.6]],T=[[168,78,2.6]])),2720,0)
b=oshell(otitle+'<div style="font-size:12px;color:%s">Nessuno sprint: creane uno dalla pagina Sprint.</div>'%MUT)
save('oggi-4-nessuno-sprint.dc.html','4 - Nessuno sprint',1280,160,page('4 - Nessuno sprint',1280,160,OF,BG,TXT,b,dict(P=6),False),4080,0)
b=oshell(ocard(POST,None,1,358,True),358,'opacity:«e1.o»')
save('oggi-5-finestra-stretta.dc.html','5 - Finestra stretta',390,1130,page('5 - Finestra stretta',390,1130,OF,BG,TXT,b,dict(P=6),False),5440,0)

# ================================================================ FILA «PROPOSTE» (tema Notte, Nunito)
NF=('family=Nunito:wght@500;600;700;800','Nunito, system-ui, sans-serif')
NB,CARD,NBR,INK,NM,DIM,BLU,GRN,RED,SUB='#0f1115','#1a1d24','#2a2e37','#ffffff','#9ca3af','#6b7280','#4361ee','#4ade80','#f87171','#20242d'
SC=dict(up=GRN,eq=NM,dn=RED)
def T(x,y,t,size,wt,col,extra='',anchor='left',w=0):
    pos='left: %dpx'%x if anchor=='left' else ('left: %dpx; width: %dpx; text-align: %s'%(x,w,anchor))
    return '<div style="position: absolute; %s; top: %dpx; font-size: %dpx; font-weight: %d; line-height: %dpx; color: %s; white-space: nowrap; %s">%s</div>'%(pos,y,size,wt,round(size*1.25),col,extra,t)
def card(h): return '<div style="position: absolute; left: 32px; top: 32px; width: 1216px; height: %dpx; background: %s; border: 1.500px solid %s; border-radius: 14px; box-shadow: 0 3px 0 #050608; box-sizing: border-box; opacity: «e1.o»; transform: «e1.tf»"></div>'%(h,CARD,NBR)
CHEV='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; right: 16px; top: 12px" aria-hidden="true"><path d="M6 9l6 6 6-6"></path></svg>'
PX,PW=300,430
def pill(x,w,t,blue,extra): return '<div style="position: absolute; left: %dpx; top: 50px; width: %dpx; height: 40px; box-sizing: border-box; border-radius: 50px; background: %s; border: 1.500px solid %s; box-shadow: 0 2px 0 #050608; font-size: 14px; font-weight: 700; line-height: 37px; padding-left: 18px; white-space: nowrap; %s">%s%s</div>'%(x,w,'#262d45' if blue else '#14171d',BLU if blue else NBR,extra,t,CHEV)
MENU=[SP[16],SP[15],SP[14],SP[13],SP[11]]
def head(states):
    h=T(64,56,'Sprint vs record',22,800,INK,'opacity: «e1.o»')
    for j,s in enumerate(states):
        h+=pill(PX,PW,lab(s),True,'opacity: «L.k%d»'%j)
        h+=T(940,60,'%d persone%s'%(s['base'],' · provvisorio' if s['age']<14 else ''),14,700,NM,'opacity: «L.k%d»'%j,'right',276)
    h+=T(PX+PW+14,60,'vs',13,800,DIM,'opacity: «e1.o»')+pill(PX+PW+46,150,'Il migliore',False,'opacity: «e1.o»')
    return h
def menu():
    return '<div style="position: absolute; left: %dpx; top: 98px; width: %dpx; box-sizing: border-box; padding: 6px; border-radius: 14px; background: %s; border: 1.500px solid %s; box-shadow: 0 6px 0 #050608; opacity: «m1»">%s</div>'%(PX,PW,SUB,NBR,''.join('<div style="height: 40px; line-height: 40px; padding: 0 12px; border-radius: 8px; font-size: 14px; font-weight: 700; white-space: nowrap; color: #ffffff">%s</div>'%lab(s) for s in MENU))
def tip(x,y,l1,l2,key='h1'):
    return '<div style="position: absolute; left: %dpx; top: %dpx; padding: 8px 12px; border-radius: 10px; background: #0f1115; border: 1.500px solid %s; box-shadow: 0 3px 0 #050608; white-space: nowrap; opacity: «%s»"><div style="font-size: 14px; font-weight: 800; line-height: 18px">%s</div><div style="font-size: 12px; font-weight: 700; line-height: 16px; color: %s">%s</div></div>'%(x,y,NBR,key,l1,NM,l2)
def layers(states,fn): return ''.join('<div style="position: absolute; left: 0; top: 0; opacity: «L.k%d»">%s</div>'%(j,fn(j,s)) for j,s in enumerate(states))
def reveal(j,h,svg): return '<div style="position: absolute; left: 0; top: 0; height: %dpx; overflow: hidden; width: «R.k%d»"><svg width="1280" height="%d" style="display: block" aria-hidden="true">%s</svg></div>'%(h,j,h,svg)
def leg(x,y,items):
    h=''
    for kind,col,t in items:
        if kind=='dot': g='<circle cx="9" cy="9" r="6" fill="%s"></circle>'%col
        elif kind=='ring': g='<circle cx="9" cy="9" r="5" fill="none" stroke="%s" stroke-width="2.500"></circle>'%col
        elif kind=='dash': g='<line x1="0" x2="18" y1="9" y2="9" stroke="%s" stroke-width="2.500" stroke-dasharray="5 4"></line>'%col
        else: g='<line x1="0" x2="18" y1="9" y2="9" stroke="%s" stroke-width="3" stroke-linecap="round"></line>'%col
        h+='<svg width="18" height="18" style="position: absolute; left: %dpx; top: %dpx" aria-hidden="true">%s</svg>'%(x,y,g)+T(x+26,y,t,13,700,NM)
        x+=26+len(t)*7.4+28
    return '<div style="opacity: «e2.o»">%s</div>'%h
def summary(j,rs):
    n=dict(dn=0,eq=0,up=0)
    for r in rs: n[r['sim']]+=1
    h=T(64,124,str(n['dn']),112,800,INK if n['dn'] else DIM)+T(68,268,'sotto il record',18,700,NM)
    h+=''.join('<i style="position: absolute; left: %dpx; top: 312px; display: block; width: 24px; height: 24px; border-radius: 6px; background: %s; transform: «U.k%dn%d»"></i>'%(64+i*32,SC[r['sim']],j,i) for i,r in enumerate(rs))
    y=356
    for k,t in (('eq','in linea'),('up','sopra')):
        h+='<i style="position: absolute; left: 64px; top: %dpx; display: block; width: 12px; height: 12px; border-radius: 3px; background: %s"></i>'%(y+4,SC[k])+T(86,y,'%d %s'%(n[k],t),15,700,NM); y+=26
    return h
DIV=lambda h: '<div style="position: absolute; left: 352px; top: 124px; width: 1.500px; height: %dpx; background: %s; opacity: «e2.o»"></div>'%(h,NBR)
ST=[POST,S14]
def cfg(hx,hy,hw,**kw):
    c=dict(P=13,TS=3.6,N=2,SW=[7.0],CW=1280,S=[1120,300],W=[[hx,hy,2.8],[PX+150,70,5.4],[PX+150,204,6.8]],T=[[PX+150,70,5.4],[PX+150,204,6.8]],M=[[5.55,7.0],[99,99]],H=[hw,[99,99]])
    c.update(kw); return c
PROP_Y=2900
# ---------------------------------------------------------------- 1A Il percorso: lo sprint in % del record, passo per passo
def bodyA(j,s):
    rs=score(s); X0,X1,YT,YB=440,1184,160,400
    rat=[min(r['v']/r['b'],9) if r['b'] else 0 for r in rs]; top=max(100,math.ceil(max(rat)*100/50.0)*50)
    x=lambda i: X0+i*(X1-X0)/6.0; y=lambda v: YB-v*100/top*(YB-YT)
    g=''.join('<line x1="%d" x2="%d" y1="%.1f" y2="%.1f" stroke="%s" stroke-width="1"></line>'%(X0-12,X1+12,y(v/100.0),y(v/100.0),NBR) for v in range(0,top+1,25 if top==100 else 50))
    g+=''.join('<line x1="%.1f" x2="%.1f" y1="%d" y2="%d" stroke="%s" stroke-width="1.500"></line>'%(x(i),x(i),YB,YB+6,DIM) for i in range(7))
    g+='<line x1="%d" x2="%d" y1="%.1f" y2="%.1f" stroke="%s" stroke-width="2.500" stroke-dasharray="7 6"></line>'%(X0-12,X1+12,y(1),y(1),NM)
    g+='<polyline points="%s" fill="none" stroke="#ffffff" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"></polyline>'%' '.join('%.1f,%.1f'%(x(i),y(v)) for i,v in enumerate(rat))
    g+=''.join('<circle cx="%.1f" cy="%.1f" r="7" fill="%s" stroke="%s" stroke-width="3"></circle>'%(x(i),y(v),{'dn':RED,'eq':'#ffffff','up':GRN}[rs[i]['sim']],CARD) for i,v in enumerate(rat))
    h=summary(j,rs)+reveal(j,440,g)
    h+=''.join(T(360,round(y(v/100.0))-9,'%d%%'%v,13,700,DIM,'','right',60) for v in range(0,top+1,25 if top==100 else 50))
    for i,r in enumerate(rs):
        h+=T(round(x(i))-60,412,r['short'],13,700,NM,'','center',120)+T(round(x(i))-60,432,pct(r['v'])+'%',16,800,{'dn':RED,'eq':INK,'up':GRN}[r['sim']],'','center',120)
    if j==0: h+=tip(round(x(2))+18,round(y(rat[2]))-64,'20 su 222','Record 29,5% · Sprint 8')
    return h
HA=536
b=card(HA-64)+head(ST)+DIV(HA-64-124)+T(376,128,'% del record',12,700,DIM,'opacity: «e2.o»')+'<div style="opacity: «e2.o»">%s</div>'%layers(ST,bodyA)+leg(440,468,[('line','#ffffff','Sprint'),('dash',NM,'Record'),('dot',RED,'Sotto'),('dot','#ffffff','In linea'),('dot',GRN,'Sopra')])+menu()
save('prop-A-percorso.dc.html','1A - Il percorso',1280,HA,page('1A - Il percorso',1280,HA,NF,NB,INK,b,cfg(440+2*124,326,[3.0,4.6])),0,PROP_Y)
# ---------------------------------------------------------------- 1B Nel tempo: un grafico per passo, sprint dopo sprint
TREND=[s for s in SP if s['base']>=100 and not issub(s)]
def bodyB(j,s):
    rs=score(s); CW=(1152-6*16)/7.0; g=''; h=''
    for i,r in enumerate(rs):
        cx=64+i*(CW+16); col={'dn':RED,'eq':INK,'up':GRN}[r['sim']]
        h+=T(round(cx),124,r['short'],14,800,NM)+T(round(cx),144,pct(r['v'])+'%',30,800,INK)
        h+=T(round(cx),186,('in linea' if r['sim']=='eq' else '%s%s pt'%('+' if r['d']>0 else '−',pct(abs(r['d'])))),13,800,col if r['sim']!='eq' else NM)
        vals=[rate(t,r['k'])*100 for t in TREND]; mx=max(vals); step=next(q for q in (0.5,1,2,5,10,20,25,50) if mx/q<=3); top=step*math.ceil(mx/step)
        x0,x1,yt,yb=cx+34,cx+CW-8,226,330
        x=lambda n: x0+n*(x1-x0)/(len(TREND)-1.0); y=lambda v: yb-v/top*(yb-yt)
        for q in range(0,int(round(top/step))+1):
            v=q*step; g+='<line x1="%.1f" x2="%.1f" y1="%.1f" y2="%.1f" stroke="%s" stroke-width="1"></line>'%(x0-4,x1+4,y(v),y(v),NBR)
            h+=T(round(cx),round(y(v))-8,('%g'%v).replace('.',','),11,700,DIM,'','right',26)
        g+=''.join('<line x1="%.1f" x2="%.1f" y1="%d" y2="%d" stroke="%s" stroke-width="1.500"></line>'%(x(n),x(n),yb,yb+5,DIM) for n in range(len(TREND)))
        g+='<polyline points="%s" fill="none" stroke="%s" stroke-width="2.500" stroke-linejoin="round" stroke-linecap="round"></polyline>'%(' '.join('%.1f,%.1f'%(x(n),y(v)) for n,v in enumerate(vals)),NM)
        ri=TREND.index(r['ref']); si=TREND.index(s)
        if ri!=si: g+='<circle cx="%.1f" cy="%.1f" r="5" fill="%s" stroke="#ffffff" stroke-width="2.500"></circle>'%(x(ri),y(vals[ri]),CARD)
        g+='<circle cx="%.1f" cy="%.1f" r="6" fill="%s" stroke="%s" stroke-width="2.500"></circle>'%(x(si),y(vals[si]),{'dn':RED,'eq':'#ffffff','up':GRN}[r['sim']],CARD)
        h+=T(round(x0)-10,340,'S3',11,700,DIM)+T(round(x1)-20,340,'S15',11,700,DIM,'','right',30)
        if j==0 and i==2: h+=tip(round(x(ri))-50,round(y(vals[ri]))-58,'29,5% · record','Sprint 8 · 99 su 336')
    return h+reveal(j,400,g)
HB=448
b=card(HB-64)+head(ST)+'<div style="opacity: «e2.o»">%s</div>'%layers(ST,bodyB)+leg(64,376,[('line',NM,'Tutti gli sprint'),('ring','#ffffff','Record'),('dot',RED,'Sotto'),('dot','#ffffff','In linea'),('dot',GRN,'Sopra')])+menu()
_cw=(1152-6*16)/7.0; _x0=64+2*(_cw+16)+34; _hx=_x0+5*((_cw-42)/(len(TREND)-1.0))
save('prop-B-nel-tempo.dc.html','1B - Nel tempo',1280,HB,page('1B - Nel tempo',1280,HB,NF,NB,INK,b,cfg(round(_hx),232,[3.0,4.6])),1360,PROP_Y)
# ---------------------------------------------------------------- 1C Una riga per passo: record e sprint sulla stessa scala
def bodyC(j,s):
    rs=score(s); X0,X1,Y0,RH=540,1020,150,44
    top=int(math.ceil(max(max(r['v'],r['b']) for r in rs)*10)*10); x=lambda v: X0+v*100/top*(X1-X0)
    g=''.join('<line x1="%.1f" x2="%.1f" y1="%d" y2="%d" stroke="%s" stroke-width="1"></line>'%(x(v/100.0),x(v/100.0),Y0,Y0+7*RH+6,NBR) for v in range(0,top+1,10))
    h=summary(j,rs)+''.join(T(round(x(v/100.0))-30,Y0+7*RH+12,'%d%%'%v,12,700,DIM,'','center',60) for v in range(0,top+1,10))
    for i,r in enumerate(rs):
        cy=Y0+i*RH+RH/2.0; col={'dn':RED,'eq':'#ffffff','up':GRN}[r['sim']]
        g+='<line x1="%d" x2="%d" y1="%.1f" y2="%.1f" stroke="%s" stroke-width="1"></line>'%(X0,X1,cy,cy,NBR)
        if r['sim']!='eq': g+='<line x1="%.1f" x2="%.1f" y1="%.1f" y2="%.1f" stroke="%s" stroke-width="5" stroke-linecap="round" opacity="0.55"></line>'%(x(r['v']),x(r['b']),cy,cy,col)
        g+='<circle cx="%.1f" cy="%.1f" r="6" fill="%s" stroke="#ffffff" stroke-width="2.500"></circle>'%(x(r['b']),cy,CARD)
        g+='<circle cx="%.1f" cy="%.1f" r="7" fill="%s" stroke="%s" stroke-width="2.500"></circle>'%(x(r['v']),cy,col,CARD)
        h+=T(376,round(cy)-10,r['name'],15,700,INK)
        h+=T(1048,round(cy)-11,pct(r['v'])+'%',17,800,INK,'','right',70)+T(1130,round(cy)-9,('in linea' if r['sim']=='eq' else '%s%s'%('+' if r['d']>0 else '−',pct(abs(r['d'])))),14,800,NM if r['sim']=='eq' else col)
        if j==0 and i==2: h+=tip(round(x(r['b']))+16,round(cy)-56,'Record 29,5%','Sprint 8 · 99 su 336')
    return h+reveal(j,560,g)
HC=568
_rs=score(POST); _top=80
b=card(HC-64)+head(ST)+DIV(HC-64-124)+'<div style="opacity: «e2.o»">%s</div>'%layers(ST,bodyC)+leg(540,500,[('dot','#ffffff','Sprint'),('ring','#ffffff','Record')])+menu()
save('prop-C-riga-per-passo.dc.html','1C - Una riga per passo',1280,HC,page('1C - Una riga per passo',1280,HC,NF,NB,INK,b,cfg(round(540+_rs[2]['b']*100/_top*480)+2,150+2*44+24,[3.0,4.6])),2720,PROP_Y)
# ---------------------------------------------------------------- 1D Riquadri puliti: un numero per passo
def bodyD(j,s):
    rs=score(s); CW=(1152-6*12)/7.0; h=''
    for i,r in enumerate(rs):
        cx=round(64+i*(CW+12)); col=SC[r['sim']]
        h+='<div style="position: absolute; left: %dpx; top: 124px; width: %dpx; height: 152px; box-sizing: border-box; border-radius: 12px; background: %s; border: 1.500px solid %s; transform: «U.k%dn%d»"></div>'%(cx,round(CW),SUB,NBR,j,i)
        h+=T(cx+16,140,r['short'],14,800,NM)+T(cx+16,164,pct(r['v'])+'%',34,800,INK)
        h+=T(cx+16,214,('in linea' if r['sim']=='eq' else '%s%s pt'%('+' if r['d']>0 else '−',pct(abs(r['d'])))),14,800,col)+T(cx+16,240,'record %s%%'%pct(r['b']),13,700,DIM)
        if j==0 and i==2: h+=tip(cx+20,284,'Record · Sprint 8','99 su 336')
    return h
HD=372
b=card(HD-64)+head(ST)+'<div style="opacity: «e2.o»">%s</div>'%layers(ST,bodyD)+menu()
_cw=(1152-6*12)/7.0
save('prop-D-riquadri-puliti.dc.html','1D - Riquadri puliti',1280,HD,page('1D - Riquadri puliti',1280,HD,NF,NB,INK,b,cfg(round(64+2*(_cw+12)+90),236,[3.0,4.6])),4080,PROP_Y)

# ---------------------------------------------------------------- 1 Giorno per giorno: X = giorni dal primo avvio, Y = % arrivata al passo
# Per ogni sprint: quante persone hanno almeno d giorni di vita (elig) e quante sono arrivate al passo entro d giorni.
DAILY={
'Sprint 5':dict(elig=[226]*22,w1=[0,36,43,45,45,46,48,49,49,51,51,52,53,53,53,53,53,53,53,53,53,53],w2=[0,9,17,19,21,22,22,23,25,27,27,27,27,27,27,27,27,27,27,27,27,27],w3=[0,6,11,12,13,16,16,17,17,17,18,18,18,18,18,18,18,18,18,18,18,18],home=[0,122,123,124]+[125]*18,paid=[0]*9+[1]+[2]*12,trial=[0,0,1]+[2]*19,detail=[0,88,92,94,94,94,95,95,95]+[98]*13),
'Spint 7':dict(elig=[191]*22,w1=[0,42,47,49,49,51,51,51,53]+[54]*13,w2=[0,14,24,25,25,25,26,27,29]+[31]*13,w3=[0,7,13,15,16,17,17,17,17]+[20]*13,home=[0,113,115,117,117,118,119,120,121,121]+[122]*12,detail=[0,74,82,85,85,86,86,87,89,89]+[90]*12),
'Sprint 8':dict(elig=[336]*22,w1=[0,79,87,90,92,93,95,98,98,98,98]+[99]*11,w2=[0,23,31,34,39,43,43,44]+[47]*14,w3=[0,9,16,22,28,30,32,32,33,34,35,35,35]+[36]*9,home=[0,216,218,219,219,220,222,223,223,223,223,224,224,225]+[226]*8,detail=[0,179,181,183,183,184,186,188,188,188,188]+[189]*11),
'Sprint 12':dict(elig=[989]*21+[979],w1=[0,175,204,219,231,237,240,248,251,252,253,254,255]+[257]*8+[256],w2=[0,46,94,110,123,129,134,140,143,144,147,147,147]+[150]*8+[149],w3=[0,23,48,74,81,92,101,102,103,106,108,111,112,112]+[113]*7+[112],home=[0,506,534,550,562,565,572,574,579,583,584,585,587,590]+[591]*7+[587],paid=[0]*12+[1,1,2,2,2,3,3,3,3,3],trial=[0,0,1,1,1]+[2]*17,detail=[0,593,604,609,611,612,613,615,616,616,617,617,617]+[618]*8+[612]),
'Sprint 13':dict(elig=[260]*15+[245,154,70,0,0,0,0],w1=[0,28,29,30,30,31,31,31]+[32]*8+[17,7,0,0,0,0],w2=[0,1,15,15,16,16]+[17]*10+[10,5,0,0,0,0],w3=[0,0,1,9]+[10]*12+[6,3,0,0,0,0],home=[0,183,185,188,189,191,191,191,191,191,191,192,192,192,192,187,117,51,0,0,0,0],paid=[0]*9+[1]*8+[0]*5,trial=[0,0]+[1]*15+[0]*5,detail=[0,67,70,71,71,72,72,72,73,73,73,73,73,74,74,73,48,18,0,0,0,0]),
'Spint 14':dict(elig=[258,258,258,258,254,250,234,184,138,77,43,32,7]+[0]*9,w1=[0,30,35,37,38,37,34,28,19,5,5,4,2]+[0]*9,w2=[0,1,3,8,10,10,9,9,6,2,2,1,1]+[0]*9,w3=[0,0,0,0,2,2,3,3,2,1,1,1,1]+[0]*9,home=[0,173,177,178,178,176,165,124,87,44,21,14,4]+[0]*9,trial=[0,3,3,3,3,3,3,3,3,1,1,1,0]+[0]*9,detail=[0,72,79,81,81,80,72,57,35,10,7,6,3]+[0]*9),
'sprint 15 - Post onboarding Dettaglio':dict(elig=[222,133,4]+[0]*19,w1=[0,14]+[0]*20,w2=[0,1]+[0]*20,home=[0,75,3]+[0]*19,trial=[0,2]+[0]*20,detail=[0,67,1]+[0]*19)}
# Sprint ancora in corso: non tutti hanno gli stessi giorni di vita. Per ogni giorno [nuovi arrivati al passo, persone
# ancora osservabili che non c'erano arrivate]; la curva somma le probabilità giorno per giorno e non può scendere.
KM={'Spint 14':dict(detail=[[72,258],[7,186],[2,179],[1,174],[0,170],[1,163],[2,129],[0,103],[0,67],[0,36],[1,27],[0,4]],home=[[173,258],[4,85],[1,81],[2,78],[0,74],[0,69],[1,61],[0,51],[0,33],[0,22],[0,18],[0,3]],trial=[[3,258],[0,255],[0,255],[0,251],[0,247],[0,231],[0,181],[0,135],[0,76],[0,42],[0,31],[0,7]],w1=[[30,258],[5,228],[2,223],[1,217],[0,213],[2,202],[0,156],[0,119],[0,72],[0,38],[0,28],[0,5]],w2=[[1,258],[2,257],[5,255],[2,246],[1,241],[0,225],[1,176],[0,132],[1,76],[0,41],[0,31],[0,6]],w3=[[0,258],[0,258],[0,258],[2,254],[1,249],[2,233],[1,182],[1,137],[0,76],[0,42],[0,31],[0,6]]),
'sprint 15 - Post onboarding Dettaglio':dict(detail=[[67,133],[0,3]],home=[[75,133],[0,1]],trial=[[2,133],[0,4]],w1=[[14,133],[0,4]],w2=[[1,133],[0,4]],w3=[[0,133],[0,4]])}
def curve(s,k,xmax):
    d=DAILY[s['nome']]; ks=d.get(k,[0]*22); km=KM.get(s['nome']); out=[]; surv=1.0
    for i in range(xmax+1):
        if d['elig'][i]<30: break
        if km:
            if i:
                neu,risk=(km.get(k) or [[0,1]]*22)[i-1] if i-1<len(km.get(k) or [[0,1]]*22) else (0,1)
                if risk: surv*=1-neu/float(risk)
            out.append(((1-surv)*d['elig'][i],d['elig'][i]))
        else: out.append((ks[i],d['elig'][i]))
    return out
def bodyE(j,s):
    rs=score(s); PWD,GAP=270,24; g=''; h=''; n=dict(dn=0,eq=0,up=0)
    for i,r in enumerate(rs):
        px=64+(i%4)*(PWD+GAP); py=124+(i//4)*214; xmax=21 if r['k']=='paid' else 14
        rc=curve(r['ref'],r['k'],xmax); sc=curve(s,r['k'],xmax); D=len(sc)-1
        ks,ns=sc[D]; kr,nr=rc[min(D,len(rc)-1)]; v,b=ks/ns,kr/nr
        n1=DAILY[s['nome']]['elig'][min(1,D)]; ks,ns=v*n1,n1  # il verdetto pesa lo sprint su chi ha almeno un giorno di vita
        sim='eq' if same(ks,ns,kr,nr) else ('up' if v>b else 'dn'); n[sim]+=1; col={'dn':RED,'eq':'#ffffff','up':GRN}[sim]
        h+=T(px,py,r['short'],14,800,NM)+T(px,py+20,pct(v)+'%',28,800,INK)
        h+=T(px,py+2,'giorno %d'%D,13,700,DIM,'','right',PWD)+T(px,py+28,('in linea' if sim=='eq' else '%s%s pt'%('+' if v>b else '−',pct(abs(v-b)))),15,800,NM if sim=='eq' else col,'','right',PWD)
        vals=[a*100.0/c for a,c in rc]+[a*100.0/c for a,c in sc]; mx=max(max(vals),0.5); step=next(q for q in (0.25,0.5,1,2,5,10,20,25,50) if mx/q<=4); top=step*math.ceil(mx/step)
        x0,x1,yt,yb=px+34,px+PWD-6,py+72,py+160
        x=lambda q: x0+q*(x1-x0)/float(xmax); y=lambda q: yb-q/top*(yb-yt)
        for q in range(0,int(round(top/step))+1):
            g+='<line x1="%d" x2="%d" y1="%.1f" y2="%.1f" stroke="%s" stroke-width="1"></line>'%(x0-4,x1+4,y(q*step),y(q*step),NBR)
            h+=T(px,round(y(q*step))-8,('%g'%(q*step)).replace('.',','),11,700,DIM,'','right',26)
        for q in range(xmax+1):
            g+='<line x1="%.1f" x2="%.1f" y1="%d" y2="%d" stroke="%s" stroke-width="1.500"></line>'%(x(q),x(q),yb,yb+(7 if q%7==0 else 4),DIM)
            if q%7==0: h+=T(round(x(q))-15,yb+10,str(q),11,700,DIM,'','center',30)
        pts=lambda cc: ' '.join('%.1f,%.1f'%(x(q),y(a*100.0/c)) for q,(a,c) in enumerate(cc))
        g+='<polyline points="%s" fill="none" stroke="%s" stroke-width="2.500" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="6 5"></polyline>'%(pts(rc),NM)
        g+='<polyline points="%s" fill="none" stroke="#ffffff" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"></polyline>'%pts(sc)
        g+='<circle cx="%.1f" cy="%.1f" r="6" fill="%s" stroke="%s" stroke-width="2.500"></circle>'%(x(D),y(v*100),col,CARD)
        if j==0 and i==2: h+=tip(round(x(3))+14,round(y(rc[3][0]*100.0/rc[3][1]))-62,'Giorno 3 · %s%%'%pct(rc[3][0]/rc[3][1]),'Record · %s'%r['ref']['nome']); bodyE.hv=(round(x(3)),round(y(rc[3][0]*100.0/rc[3][1])))
    lx,ly=64+3*(PWD+GAP),338
    h+=T(lx,ly-4,str(n['dn']),72,800,INK if n['dn'] else DIM)+T(lx+4,ly+86,'sotto il record',16,700,NM)
    h+=''.join('<i style="position: absolute; left: %dpx; top: %dpx; display: block; width: 12px; height: 12px; border-radius: 3px; background: %s"></i>'%(lx+4+kx*110,ly+122,SC[kk])+T(lx+24+kx*110,ly+117,'%d %s'%(n[kk],tt),14,700,NM) for kx,(kk,tt) in enumerate((('eq','in linea'),('up','sopra'))))
    return h+reveal(j,600,g)
HE=592
lay=layers(ST,bodyE)
b=card(HE-64)+head(ST)+'<div style="opacity: «e2.o»">%s</div>'%lay+leg(64+3*294,496,[('line','#ffffff','Sprint'),('dash',NM,'Record')])+T(64+3*294,522,'Asse X: giorni dal primo avvio',13,700,DIM,'opacity: «e2.o»')+menu()
save('red-1-giorno-per-giorno.dc.html','1 - Giorno per giorno',1280,HE,page('1 - Giorno per giorno',1280,HE,NF,NB,INK,b,cfg(bodyE.hv[0],bodyE.hv[1],[3.0,4.6])),0,1700)

note=lambda y,t: {'x':0,'y':y,'text':t,'kind':'title1','maxW':5360}
json.dump({'v':3,'createdOnFiles':{'v':1,'at':'2026-10-08T16:00:00Z'},'title':'KPI Home — Sprint vs record','launch':{'view':'canvas'},'pages':[],'boards':BOARDS,'order':list(BOARDS),'notes':{'oggi':note(-300,'Oggi'),'redesign':note(1400,'Redesign'),'proposte':note(PROP_Y-300,'Proposte')},'designSystems':[]},open('project/canvas.json','w'),indent=1,ensure_ascii=False)
print(len(BOARDS),'tavole')
