# HANDOFF — redesign vista Retention «Per giorno» (03/11/2026)

## Richiesta
Danilo: «/redesign-v2 di questa schermata per tracciare bene la retention»: utenti che entrano in app e utenti che si allenano. Intervista: scopo salute del prodotto, solo giorni, rifai tutto.

## Stato
- Documento: https://claude.ai/artifact/NKBoUPAYw475eomgE5kgKs (versione 4). Schede: Oggi, 23A, 23A — Attivo e confronti, 23B, 23C.
- Decisioni e giudizi alla lettera: `_specs/design-flows/kpi-retention-giorno/redesign-v2.md`. Copia del prototipo in `prototipo/` (le proposte sono in `prototipo/n/`).
- Bocciate: le 22 (troppo simili alla dashboard di oggi), 23A·1 e 23A·2 (non si capisce niente).
- Piaciuta: 23A («molto molto bello»). Ultima versione: «Attivo e confronti», in attesa del giudizio di Danilo.
- Nessun codice del programma toccato, niente commit.

## Prossimo passo
Aspettare il giudizio su «23E — Per evento»: evento scelto da un menu nel titolo con ricerca su tutta la lista eventi, grafico da G0, sprint scelti da tendine con ricerca su tutti gli sprint. In implementazione serve una RPC N-day con parametro p_event (app_open, workout completato o qualsiasi evento di events_canonical).

## Nuova richiesta di Danilo (03/11/2026, sostituisce il prossimo passo sopra)
«Rendimi chiaro il poter vedere se sono attivi o si allenano e basta, sinceramente. Facciamo così: tracciamo come cambia nel tempo un determinato dato ed evento, quindi io seleziono l'evento e mi fai i grafici di quello.»

Cosa significa per il redesign:
- Tenere la base di 23A «Attivo e confronti»: riga «Sprint attivo», riga «Confrontalo con», numeri grandi in percentuale con lo scarto in punti, area sul grafico per giorno dal primo avvio.
- Togliere le due fasce mescolate (si allena / apre e basta). Al loro posto un selettore di evento ben visibile in cima: «Entra in app» (app_open), «Si allena» (workout_sessions completed), poi gli altri eventi di events_canonical (per esempio workout_start, view_Paywall, exercise_complete, roadmap_piece_view).
- Tutti i grafici e i numeri si ricalcolano sull'evento scelto: quota di persone dello sprint che fanno quell'evento il giorno N (N-day, D1..D30), una curva per lo sprint attivo e una tratteggiata per ogni confronto.
- I dati per eventi diversi da app_open e workout vanno presi con una query sola (stessa coorte del prototipo: anonymous_sessions dello sprint, una persona per identità, esclusi kpi_excluded_users ed emulatori). Per il prototipo bastano 5–6 eventi sugli sprint 12, 14, 16, 18, 19.
- Prototipo in `_specs/design-flows/kpi-retention-giorno/prototipo/n/` (funzione r23a3 in `a2.js`); ripubblicare sullo stesso Artifact passando `url`, dopo averlo letto con action read.
- Paletti: tema Notte HypeMove, grafici con il tempo sull'asse X, niente scritte dentro l'area, niente codice della dashboard prima del via.

## VIA DI DANILO (03/11/2026): «Così è perfetto, lo implementiamo»
Prototipo approvato: scheda «23E — Per evento», sorgente `_specs/design-flows/kpi-retention-giorno/prototipo/n/` (`index.html` per stile e grafico base, `ev.js` per la logica, `evdata.js` per la forma dei dati).
Da fare:
1. Migration con una RPC nuova, per esempio `kpi_retention_event_daily(p_sprint_ids uuid[], p_event text)`: per ogni sprint coorte = primi avvii in `anonymous_sessions` (stessa finestra e stesse esclusioni di `kpi_retention_daily`, una persona per identità; allineare il conteggio, oggi 803 contro 954 dello sprint 12), e per ogni giorno G0..G30 quante persone fanno l'evento in quel giorno (finestre di 24 ore dal primo avvio). `p_event` = nome di events_canonical; caso speciale `workout_completed` = `workout_sessions` con status completed; `app_open` a G0 = 100%. Restituire anche n e l'ultimo giorno osservabile. Attenzione al timeout (statement_timeout=0, ma i job cache hanno saturato il disco: niente job nuovi).
2. In `public/internal/js/kpi.js` sostituire la vista «Per giorno» (`pageRetentionDaily` e funzioni retDaily*) con la 23E: titolo-frase con tendina evento e ricerca (cinque «più usati» + tutti gli eventi dal registro eventi già caricato da `fetchEventRegistry`), tendina «Sprint attivo» e «Confrontalo con» con ricerca su tutti gli sprint (`kpi_retention_daily_cohort_sizes`), quattro riquadri G0/G1/G7/ultimo, grafico da G0 con area arancione e confronti tratteggiati, stati caricamento, errore, sprint giovane. Stile tema Notte HypeMove come nel prototipo, classi con prefisso proprio in `kpi.css`.
3. Provare nel browser con il login operatore, fotografare e confrontare con il prototipo; commit e push sulla dashboard senza chiedere (memoria «applica e pubblica senza chiedere»).
