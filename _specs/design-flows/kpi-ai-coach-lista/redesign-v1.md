# Redesign pagina «AI Coach» della dashboard KPI — decisioni

Codice di oggi: `public/internal/js/kpi.js` (`pageAICoach`, `aiStatsKpiRow`, `aiConversationsCard`, `aiSessionListHtml`, `aiChatPanel`, `promptingSection`) e `public/internal/js/kpi-coach-benchmark.js`.

## Brief di Danilo (08/10/2026)
- «Fare un /redesign grafico sull'estetica dei grafici, simili a come facciamo in dashboard e il mio grafico preferito» (il preferito è «Prove gratuite»).
- «Le conversazioni fanno schifo. Dobbiamo fare tutto un redesign completo a queste conversazioni perché sono terribili.»
- «Non abbiamo mai nelle conversazioni spontanee il primo messaggio del coach. Parte sempre dalla prima domanda dell'utente, il che è sbagliato… Dovrebbe partire sempre da quello che dice il coach e poi farci vedere quello che dice l'utente.»
- «Ci sono troppe cose scritte… è sempre il solito caos.»

## Risposte all'intervista (08/10/2026)
- Perimetro: tutta la pagina AI Coach.
- Domanda del grafico dei benchmark: «Com'è andato ogni giro».
- Quanto si cambia: anche la composizione, non solo l'aspetto.
- Cosa non va: «Togli il prompting, non lo abbiamo mai usato»; i numeri in cima non dicono niente; i benchmark devono stare in testa; Conversazioni occupa troppo.

## Numeri veri (Supabase, 08/09 – 08/10/2026)
- 17.464 chiamate, 1.872 utenti, 86,83 $, 480 errori. Gli errori sono quasi tutti dal 30/09 (179) e dal 05/10 in poi (56, 69, 71, 91).
- 8.416 chiamate su 17.464 sono la generazione del piano premium, non la chat.
- Sessioni di chat salvate dal 08/09: 988 cominciano con il coach, 211 con l'utente.

## Difetti trovati nel programma di oggi
- Il riquadro «Sessioni» mostra 17: conta i tipi di chiamata, non le sessioni.
- Il funnel del feedback non scende: 495 notifiche programmate, 2.043 mostrate, 700 risposte.
- Il messaggio d'apertura del coach nel database c'è in 988 sessioni su 1.199: se la pagina non lo mostra, il difetto è nella lettura. Da verificare al momento del codice.

## Regole già date da Danilo sui grafici della dashboard
- Ogni etichetta al massimo due parole, niente frasi di spiegazione, in hover solo il dato (08/10, «Prove gratuite»).

## Documento pubblicato (08/10/2026 sera)
- «KPI AI Coach — redesign»: https://claude.ai/artifact/CJrU9H1dQ9Bb7fzNRzzr87 — 18 tavole: fila «Oggi» (7) e tre file di proposte (grafico dei benchmark 1A/1B/1C, composizione 2A/2B/2C + telefono, conversazioni 3A/3B/3C + telefono).
- Copia delle tavole e `canvas.json` in `lavoro/project/`, generatori in `lavoro/`.
- Corretto prima di pubblicare: nella 2B le etichette di «Per cosa» finivano sopra le barre; ora etichetta, barra e numero stanno sulla stessa riga.
- Le tavole dei benchmark mostrano «Compila il form» con due giri (56 su 63). Dopo è arrivato un terzo giro, 51 su 63: il dato delle tavole è quello di quando sono state disegnate.
- In attesa della scelta di Danilo fra le proposte. Nessun codice dell'interfaccia prima.

## Scelte di Danilo fra le proposte (08/10/2026, ore 22:20)
- Grafico dei benchmark: «1c migliore» → 1C, lungo il flusso.
- Composizione della pagina: «2A la scelta giusta» → 2A, tutto in colonna.
- Conversazioni: «£a pure» → letto come 3A, elenco che si apre (stava guardando 3A e 3B; la tavola del telefono è già in direzione 3A).
- Prossimo passo: fila «Redesign» con 2A come pagina, il grafico 1C al posto del blocco dei benchmark e l'elenco 3A al posto delle conversazioni, in tutti gli stati della fila «Oggi» tranne il prompting, che si toglie. Poi approvazione di Danilo, poi il codice.

## Fila «Redesign» pubblicata (08/10/2026, notte)
- Stesso documento, 24 tavole: «Oggi» a y=0, «Redesign» a y=1300, proposte spostate di 2.220 px più in basso.
- Tavole: `red-1-pagina` (1280×1720), `red-2-caricamento`, `red-3-utenti-aperti`, `red-4-conversazione`, `red-5-feedback` (1280×720), `red-7-finestra-stretta` (390×844). Il prompting non c'è più, quindi manca la 6.
- Generatori: `lavoro/gen_red.py` e `lavoro/gen_red_tel.py`. Stanno nel worktree `intelligent-archimedes-2a3f8d`, non nel checkout principale, perché un hook vieta alle sessioni in worktree di scrivere nel checkout principale. Leggono `dati.json` e importano `gen_pagina`, `gen_bench`, `gen_conv` dalla cartella `lavoro/` del checkout principale.
- Scelte prese senza chiedere, da far confermare a Danilo:
  - cornice: barra laterale vera della dashboard (220 px) ridipinta nel tema scuro, con icone a tratto al posto delle emoji;
  - niente riga dei sei riquadri, niente selettore di date: il periodo è Oggi/Settimana/Mese/Sprint dentro «Uso»;
  - «utenti aperti»: clic sulla card «Persone», l'elenco si apre sotto le tre card;
  - «feedback»: linguetta «Post-workout», con 495 / 2.043 / 700 in riga senza frecce né percentuali;
  - telefono: i sette passaggi dei benchmark diventano sette righe con la linea dei giri a destra;
  - accorpamenti di «Per cosa» (Creazione piano, Chat, Altro): ipotesi dell'agente, ancora da confermare.
- Dati: «Compila il form» ha dieci giri, ultimo 62 su 63 (i sei giri mancanti caricati in `coach_benchmark_runs`, righe 23–28; `run.py` ora scrive da solo).
- Difetti noti: «Per cosa» non cambia con il periodo (mancano i dati al giorno per tipo); «Oggi» e «Sprint» del selettore non hanno una vista disegnata.
- In attesa dell'approvazione di Danilo. Nessun codice dell'interfaccia prima.
