# Redesign vista «Retention · Per giorno» della dashboard KPI — decisioni

## Brief di Danilo (03/11/2026)
- «Mi fai un /redesign-v2 di questa schermata in maniera tale da tracciare bene la retention?»
- «Vorrei gli utenti attivi, cioè che entrano in app, e gli utenti che si allenano magari. Fai tu... studiatela.»

## Intervista
- Scopo: salute del prodotto (D1/D7/D30, chi apre e chi si allena, confronto fra sprint), non la durata della prova.
- Ritmo: solo giorni.
- Cosa resta: niente, rifai tutto.

## Cosa ho trovato
- La vista di oggi conta «ancora attivo al giorno N» chi ha un evento qualsiasi al giorno N o dopo (sopravvivenza sull'ultimo accesso). Gonfia i numeri: sprint 12, D7 = 35,1%.
- La pratica di settore (Amplitude) è la retention N-day: attivo esattamente il giorno N, misurata sull'azione di valore (per noi il workout). Sprint 12: riapre al D7 il 4,8%, si allena al D7 il 2,0%.
- Benchmark Health & Fitness, aperture: circa 20% D1, 8% D7, 3–4% D30 (Phiture, Braze). Fonti discordanti, indicativi.
- Sprint 12: chi completa un workout il giorno 0 (13,1%) riapre al D7 nel 17,6% dei casi, gli altri nel 2,9%.

## Scelte mie
- «Apre l'app» = evento app_open nel giorno N (finestre di 24 ore dal primo avvio). D0 = 100% per definizione.
- «Si allena» = una riga di workout_sessions con status completed nel giorno N.
- Coorte = primi avvii dello sprint, una persona per identità. Il conteggio (954 nello sprint 12) non coincide con quello della funzione di oggi (803): da allineare in implementazione.
- Tolti Oggi/Settimana/Mese e le date libere: la retention ha senso solo su coorti chiuse, quindi si sceglie lo sprint.

## Proposte
- 22A Due curve: aperture e workout il giorno N, sprint sovrapposti, media di settore tratteggiata, tabella D1–D30.
- 22B Una riga per persona (forma di «Durata prove»): solo Sprint 16 nel prototipo.
- 22C Il primo workout: aperture per gruppo (workout il giorno 0 sì/no) e quanti arrivano a 1, 3, 7 workout.

## Copia
- Prototipo in `prototipo/` accanto a questo file.

## Giudizio di Danilo sulle 22 (03/11/2026)
- BOCCIATE tutte: «mi fa un po' schifo, ti ispiri troppo a ciò che avevamo già».

## Seconda tornata: 23, tema Notte HypeMove, pagine autonome
- 23A Chi torna: tre numeri grandi (giorno dopo, settimana, mese) e area a due fasce, si allena (arancione) e apre e basta (blu), confronto tratteggiato con Sprint 16.
- 23B Chi c'è ogni giorno: persone attive sul calendario (aprono, tornati non nuovi, si allenano), sprint come fasce sullo sfondo, media 7 giorni con scarto sulla settimana prima. Esclusi i giorni dopo il 02/11: ci sono eventi con date future (orologi dei telefoni sbagliati).
- 23C Sprint per sprint: una curva per sprint, quello scelto in arancione e gli altri in grigio, interruttore Aprono/Si allenano, «il migliore» per G1, G7, G30.

## Giudizio sulle 23 (03/11/2026)
- 23A «molto molto bello». Da migliorare: «la sezione confronti e selezione sprint».
- Due varianti: 23A·1 Due menu («Sprint» e «Confronta con»: il migliore al giorno 7 come predefinito, precedente, nessuno, uno a scelta), 23A·2 Striscia (tutti gli sprint in fila con il ritorno al giorno 7, tocco per scegliere, «Confronta» per il tratteggio). In entrambe sotto ogni numero c'è lo scarto in punti dallo sprint di confronto.

## Giudizio su 23A·1 e 23A·2 (03/11/2026)
- BOCCIATE: «non mi piacciono, non si capisce niente. Dammi lo sprint attivo e quelli a cui confrontarlo».
- Fatta 23A (scheda «23A — Attivo e confronti», `n/index.html?p=23a3`, codice in `n/a2.js`, ultima funzione): riga «Sprint attivo» (una scelta, blu), riga «Confrontalo con» (più scelte, ognuna col suo colore tratteggiato). Numeri grandi in percentuale, sotto ogni numero una riga per sprint di confronto con lo scarto in punti. Predefinito: attivo Sprint 18, confronto Sprint 16 e Sprint 12.

## Richiesta del 03/11/2026: un evento alla volta
- «Rendimi chiaro il poter vedere se sono attivi o si allenano e basta. Tracciamo come cambia nel tempo un determinato dato ed evento: io seleziono l'evento e mi fai i grafici di quello.»
- Fatta 23E (`n/index.html?p=23e`, codice in `n/ev.js`, dati in `n/evdata.js`): in cima cinque schede evento (Entra in app, Si allena, Inizia un workout, Vede il paywall, Apre il coach), sotto «Sprint attivo» e «Confrontalo con». Numeri grandi e grafico seguono l'evento scelto; la scala si stringe sul dato. Gli eventi diversi da apertura e workout contano dal giorno 1 in poi.
- «Fammelo selezionare l'evento non così» (le cinque schede grandi in cima): sostituite da un menu a tendina dentro il titolo, «Quante persone [entrano in app ▾] ogni giorno». Asse Y a passi tondi (1, 2, 5 o 10 punti).
- «Vorrei selezionare tra moltissimi eventi, devo poter selezionare dalla lista eventi»: il menu nel titolo ora ha un campo di ricerca, i cinque «più usati» e sotto tutti i 121 eventi veri degli ultimi 30 giorni (nome tecnico). Nel prototipo solo i cinque hanno dati; nell'implementazione la curva va calcolata per qualsiasi evento scelto (RPC con parametro evento).
- «Fallo partire da D0»: grafico e riquadri partono dal giorno del primo avvio (G0); quattro riquadri (G0, G1, G7, ultimo giorno visto).
- «Fammi selezionare tra tutti gli sprint, così è un casino»: pillole sostituite da due tendine con ricerca su tutti i 23 sprint (Sprint attivo; Confrontalo con = chip togliibili con × più «+ Aggiungi sprint»). Nel prototipo solo 5 sprint hanno dati.
