# HANDOFF — redesign schermata «Funnel» della dashboard KPI (07/10/2026)

## 1. Richiesta e vincoli di Danilo
- Redesign completo della schermata Funnel di `public/internal/kpi.html` (codice in `public/internal/js/kpi.js`, stili in `public/internal/css/kpi.css`).
- Via titolo «KPI Dashboard» e sottotitolo; via la scheda «funnel onboarding»; periodi rapidi «Oggi», «Ieri», sprint in corso, sprint precedente; via «Settimana» e «Mese»; via «Parametri» dal fondo; più spazio al contenuto.
- Non cambiare `fetchFunnel`, `kpi_cache_get`, il riquadro «calcolato alle…» (`funnelCacheBadge`): un'altra sessione sta estendendo la cache. Se serve toccarli, DOMANDA al master.
- Niente AskUserQuestion: le domande vanno al master `local_fc4e84f7-5a82-4e3c-83e0-b1bd5ff2e2cf` («DOMANDA — … — opzioni: … — blocca: sì/no»). Niente push, niente migrazioni: commit locale e sha al master.

## 2. Decisioni
- Danilo ha scelto la direzione **1A «Una riga sola»** («1A è il migliore»). 1B (elenco a sinistra) e 1C (confronto dentro) scartate.
- Documento: https://claude.ai/artifact/K3hWB2LPkagAsWt9eq1q6W. Copia e generatore in `_specs/design-flows/kpi-funnel/` (`gen.py`, `design-v1/`, `redesign-v1.md`). Fonte di verità per misure, colori e testi: `prop-1A-una-riga.dc.html`, `prop-2A-una-riga-telefono.dc.html`, `prop-3-chi-escluso.dc.html` (i valori sono leggibili in `gen.py`).
- Scelte mie comunicate al master, non ancora confermate né smentite:
  - sprint distinti per data di inizio («Sprint 15 · dal 06/10» con pallino arancione su quello in corso, «Sprint 15 · dal 04/10»); in corso e precedente presi per data (`state.sprints` è già in ordine dal più recente); il numero si legge dal primo numero nel nome (esistono «Spint 14» e «sprint 15 ottimizzazione post onboarding»);
  - date libere e altri sprint sotto «Altro periodo»; «+ Salva» e «Modifica» dentro il menu del funnel;
  - «Parametri» diventa la pillola «N esclusi» accanto al titolo, che apre un pannello laterale con i quattro interruttori, il periodo con gli orari e l'elenco;
  - titolo del riquadro = nome della scheda aperta; tema Notte e Nunito come `kpi-stats.css`;
  - «Install Google Play» tolto dalla riga in fondo;
  - su telefono la barra sta sotto il nome del passo, a tutta larghezza.

## 3. Stato reale
- Codice dell'interfaccia NON toccato.
- Commit locale sul ramo `claude/angry-shannon-3cf11b` con `_specs/design-flows/kpi-funnel/` e questo file. Non pushato.
- Le tavole sono state controllate solo con le foto locali di `shoot.py`, non nella pagina pubblicata.
- Manca nel documento la fila «Redesign» (la 1A va copiata sotto «Oggi») e mancano le tavole degli stati: caricamento, errore, vuoto, scheda «Default» (funnel a catalogo, `pageFunnel`), scheda «Attivazione» (`pageActivation`), «Altro periodo» aperto, costruttore aperto.

## 4. Mappa del codice (kpi.js)
- `layout()` ~2402: intestazione «KPI Dashboard» e `headerActions()` (comune a tutte le pagine tranne Stats: toglierla solo per Funnel o per tutte è da decidere, opzione prudente solo Funnel).
- `savedFunnelBar()` ~4717: schede; `onboardingChip` è il doppione da togliere (attenzione: `funnelMode === 'event'` con `activeFunnelPreset === null` è lo stato di quella scheda, e `funnelToolbarTokens()` la semina).
- `periodStrip()` ~4860 e `eventFunnelPresetRange()` ~2154: periodi rapidi; gestori ~12257.
- `pageFunnel()` ~4914, `pageFunnelEvent()` ~4976 (titolo fisso «Funnel onboarding» a 5018), `eventFunnelViz()` ~5592, `installContextChips()` ~5544, `sprintEventFunnelSection()` ~5901, `funnelParamsSection()` ~5957 (gestore ~12490).
- Stili: `kpi.css` righe 183–445 e i blocchi `@media` 700–770.

## 5. Per provare
- La porta 5173 è occupata dal server di un'altra sessione (`python3 -m http.server` su un altro worktree): non fermarlo. La sessione del browser è legata a `localhost:5173`; le sessioni precedenti hanno provato iniettando il codice nuovo nella scheda già autenticata.
- Dati veri usati: «Workout 1», sprint 06/10: 133, 9, 0…; sprint 04/10: 288, 21, 3, 3, 2, 0, 0, 0.

## 6. Prossimo passo, alla lettera
1. Dire al master in poche righe cosa cambia e cosa si toglie nel codice, poi implementare la 1A in `kpi.js` e `kpi.css` copiando misure e colori da `gen.py`.
2. Provare su schermo grande e telefono con i dati veri, su tutte le schede (eventi, Default, Attivazione), console senza errori.
3. Commit locale, sha ed elenco delle prove al master.

## 10. Redesign sezione «Abbonamenti» della dashboard KPI — in corso (08/10/2026)
- Richiesta di Danilo: redesign completo con `/redesign`. «Non si capisce niente». Via il grafico dei paganti nel tempo («n x tempo non ha senso»). Interessa solo: prove iniziate, chi pagherà, chi disdice. «Una disdetta è disdetta basta». La parola «scadono» è sbagliata.
- Intervista chiusa: restano solo le prove; tre gruppi «Ha pagato», «Pagherà», «Disdetta»; periodo per sprint con il selettore di «Stats».
- Documento: https://claude.ai/artifact/QqSrdGRVwXpap7oN1bCQRG, 13 tavole (4 «Oggi», 5 «Redesign», 4 «Proposte»). Copia, generatore `gen.py` e decisioni in `_specs/design-flows/kpi-abbonamenti/` (NON committati). Cartella di lavoro con `project/` nella scratchpad della sessione: per rigenerare basta lanciare `gen.py` in una cartella con `project/`.
- Scelte di Danilo: i tre numeri di 1A piacciono; voleva sotto un grafico del comportamento dell'utente nello sprint (avvio prova, poi giorno del pagamento o della disdetta). Gli piaceva anche 1D.
- BOCCIATO l'08/10: il grafico a una linea orizzontale per prova (tavola `red-1-prove` e 1D). «Queste righe non dicono niente… facciamo un grafico con un senso, con x e y sensati». Non riproporre linee per utente senza asse Y con valori.
- Disegnato e pubblicato l'08/10 nelle tavole `red-1`, `red-2`, `red-4`, `red-5`, in attesa del giudizio di Danilo: X = giorno della prova da 0 a 7, Y = prove ancora attive; la curva scende a ogni disdetta, quello che resta al giorno 7 paga (o pagherà, in blu). Regole dei grafici in memoria: `feedback_grafici_veri.md`.
- Dati veri dei giorni di disdetta (evento `SUBSCRIPTION_CANCELED` di `play_purchases`) sono in `gen.py`, lista `RS`.
- Codice della dashboard (`public/internal/js/kpi.js`, `premiumTimelineCard`) NON toccato: serve l'approvazione del documento.
- Prossimo passo, alla lettera: sentire da Danilo se il grafico proposto va bene, ridisegnare la tavola `red-1-prove` (e stati 2–5) con quel grafico al posto delle linee, fotografarla con `shoot.py`, ripubblicare.

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

- PUBBLICATO l'08/10 su `main`: sezione «Prove gratuite» in `kpi.js` (`premiumTimelineCard`) e classi `pt-*` in `kpi.css`; «Crescita utenti totali» e «Workout settimanali» affiancate su una riga. Migrazione `kpi_premium_timeline_cancelled_at` APPLICATA al database; il file SQL è in `app/supabase/migrations/20261008120000_kpi_premium_timeline_cancelled_at.sql`, SOLO LOCALE e non committato.
- Provato solo con dati di prova in una pagina fuori dalla dashboard (foto a 1280 e 390 px, console pulita). NON provati sulla pagina vera: la funzione reale, il menu degli sprint, «Riprova», il font Nunito, le due schede affiancate.
