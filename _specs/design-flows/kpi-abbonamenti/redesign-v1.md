# Redesign sezione «Abbonamenti» della dashboard KPI — decisioni

Documento: https://claude.ai/artifact/QqSrdGRVwXpap7oN1bCQRG («KPI Abbonamenti — prove gratuite», 13 tavole: 4 «Oggi», 5 «Redesign», 4 «Proposte»).
Le tavole si rigenerano con `gen.py` (scrive in `project/`), copia in `design-proposte/`.
Codice di oggi: `public/internal/js/kpi.js`, `premiumTimelineCard` e `premiumTimelineModel`.

## Brief di Danilo (08/10/2026)
- «Non si capisce niente… facciamo un redesign completo.»
- «Il grafico non deve mostrare n x tempo, non ha senso.»
- «Qui la cosa interessante è solo la distinzione tra le prove iniziate e chi pagherà e chi la disdice, il resto fa caos.»
- «C'è 5 persa e 4 disdetta ma che cazzo ci significa, una disdetta è disdetta basta.»
- «Usare il termine "Scadono" è proprio sbagliato.» Una prova non scade: finisce con un pagamento o con una disdetta.

## Risposte all'intervista
- Perimetro: restano solo le prove. Spariscono paganti totali, MRR, elenco delle scadute, calendario delle scadenze, «Confronta» e il grafico.
- Gruppi: tre. «Ha pagato» (dato vero), «Pagherà» (prova aperta con il rinnovo attivo), «Disdetta» (le vecchie «persa» e «già disdetta» insieme).
- Periodo: per sprint, con il selettore della pagina «Stats». Spariscono le due date.

## Numeri veri (Supabase, 08/10/2026)
17 prove da sempre: 5 hanno pagato, 3 pagheranno, 9 disdette.
Sprint 15 (06/10): 2 pagheranno. Sprint 15 (04/10): 1 pagherà, 2 disdette. Sprint 14: 6 disdette. Sprint 13: 2 pagate. Sprint 12: 1 pagata, 1 disdetta. Sprint 6: 2 pagate.

## Scelte mie, da confermare
- Una prova appartiene allo sprint in corso il giorno in cui parte (dall'inizio di uno sprint al giorno prima del successivo). «Stats» usa invece il primo avvio dell'app: va allineato nel codice.
- Colori di «Stats»: bianco per il dato vero, blu per l'atteso, grigio per le disdette.
- Titolo della sezione «Prove gratuite» al posto di «Abbonamenti».
- Una prova finita senza esito da Google (oggi «in attesa di esito») resta in «Pagherà» finché Google non risponde.

## Proposte
- 1A Tre colonne: il totale a sinistra, tre numeri grandi con una casella per prova.
- 1B Una riga per prova: ogni prova è una riga con il giorno di avvio e l'esito.
- 1C Sprint a confronto: una riga per sprint, tutti insieme, senza selettore; totale da sempre in fondo.
- 1D Calendario delle prove: ogni prova è un tratto sui giorni, dal giorno di avvio al pagamento o alla fine.

Scelta di Danilo (08/10/2026): «Io farei 1A + grafico sotto, dove il grafico mostra nello sprint il comportamento interno dell'utente: il giorno in cui inizia la prova, che continua nello sprint, e infine il giorno in cui paga o il giorno in cui disdice. Con una sorta di linea per ogni utente. Qualcosa di carino.» Poi: «Anche 1D è bello», «1D forse è quello che preferisco».

## Fila «Redesign» (08/10/2026)
- 1 Prove gratuite: i tre numeri di 1A sopra, sotto una linea per prova sui giorni dello sprint. Bianca fino al giorno del pagamento, grigia fino al giorno della disdetta, blu piena fino a oggi e a puntini fino al giorno in cui pagherà.
- 2 Caricamento, 3 Errore (con «Riprova»), 4 Nessuna prova, 5 Finestra stretta.
- Giorno della disdetta: evento `SUBSCRIPTION_CANCELED` di `play_purchases`, come in «Stats». Una prova dello Sprint 14 (29/09) non ha l'evento: la linea arriva alla fine della prova, 06/10.
- 1D è stata aggiornata con gli stessi giorni veri, per confrontarla con la tavola unita.
- BOCCIATE l'08/10 le linee orizzontali per prova (anche 1D): «Queste righe non dicono niente… facciamo un grafico con un senso, con x e y sensati».
- Grafico nuovo nella fila «Redesign»: X = giorno della prova (avvio … pagamento al giorno 7), Y = prove ancora attive. La linea scende a ogni disdetta; bianca fin dove tutte le prove sono arrivate, blu a tratti da lì al pagamento.
- Superato: tavola unita (numeri sopra, grafico largo sotto) oppure 1D (numeri a sinistra, grafico a destra).

## Non disegnato
- Fila «Oggi»: stato «Confronta» attivo (non ho i dati del periodo precedente) e finestra stretta.

- BOCCIATO l'08/10 anche il grafico «prove ancora attive per giorno di prova»: «è solo un grafico lineare del totale delle prove».
- Scelta di Danilo, a voce: grafico sul calendario dello sprint dove «ogni utente diventa una linea orizzontale» e si vedono chiaramente il giorno di partenza e quello di chiusura. Disegnato e pubblicato (tavole `red-1`, `red-2`, `red-4`, `red-5`): X = giorni dello sprint, Y = numero della prova (1, 2, 3…), una linea per prova dal cerchio vuoto dell'avvio al punto pieno della chiusura. Bianco = ha pagato, arancione = ha disdetto, blu pieno fino a oggi e a tratti fino al giorno in cui pagherà. In attesa del suo giudizio.
- Scelta mia: le disdette passano da grigio ad arancione `#fb8b04`, anche nel quadratino in alto, per staccarle dalle altre linee.

- Correzione di Danilo (08/10): pagare e disdire sono eventi, non colori della linea. Ogni linea è uguale per tutti («in prova», blu) e «finisce dove finisce»: il giorno del pagamento con un punto verde, il giorno della disdetta con un punto rosso. Una prova ancora aperta arriva a oggi e non ha punto finale; niente tratto atteso oltre oggi. Verde `#4ade80` e rosso `#f87171` sono quelli già nella dashboard. Pubblicato nelle tavole `red-1`, `red-2`, `red-4`, `red-5`, in attesa del suo giudizio.

- Aggiunta di Danilo (08/10): oltre al punto, il giorno che chiude la prova è un tratto orizzontale lungo un giorno, verde se ha pagato e rosso se ha disdetto, subito dopo la linea blu.

- Richiesta di Danilo (08/10), dopo «meglio meglio» sul grafico: oltre allo sprint, scelta del periodo «Oggi», «Settimana», «Mese». Disegnato come quattro pulsanti in alto a destra; il selettore dello sprint compare solo con «Sprint». Scelta mia da confermare: settimana = ultimi 7 giorni, mese = ultimi 30 giorni, contando le prove partite in quei giorni. Numeri veri: settimana 6 prove (0 pagate, 3 pagheranno, 3 disdette), mese 15 (3, 3, 9), oggi 0.
- Prossimo passo: approvazione di Danilo del documento, poi il codice in `public/internal/js/kpi.js` (`premiumTimelineCard`): la funzione `kpi_premium_timeline` non restituisce il giorno della disdetta, va aggiunto.

- Correzione di Danilo (08/10): troppo testo ovunque. Ogni etichetta al massimo due parole, niente frasi di spiegazione, in hover solo il dato (le due date). Tolti titolo lungo del grafico, nota della legenda, sottotitolo dell'errore.

- Richiesta di Danilo (08/10): numeri a sinistra del grafico, come in 1D. Fatto: colonna con totale, «Ha pagato», «Pagherà», «Disdette»; grafico a destra; sezione alta 480 px invece di 696. Sul telefono i numeri restano sopra il grafico. Tolte le caselle sotto i numeri.

- Richiesta di Danilo (08/10): sotto i numeri un contatore a quadratini, uno per prova, colorato per esito (verde, blu, rosso), senza legenda sotto perché i nomi sono già accanto ai numeri.

- APPROVATO da Danilo l'08/10: «Ha molto molto senso ora… possiamo tranquillamente svilupparlo così». Fonte di verità: tavole `red-1`…`red-5` in `_specs/design-flows/kpi-abbonamenti/design-proposte/`. Implementazione affidata a un agente nella stessa sessione; a fine lavoro vanno controllati `git status`, la migrazione di `kpi_premium_timeline` (campo `cancelled_at`) e la pagina vera.
