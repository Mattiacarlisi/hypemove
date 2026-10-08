# HANDOFF — «Sprint vs record» giorno per giorno, da portare nel codice (08/10/2026)

Il passaggio precedente (redesign «Funnel», 07/10) è nella storia git di questo file.

## 1. Richiesta e vincoli di Danilo
- «Si può fare qualche /redesign su questo? È illeggibile» sulla scheda «Sprint vs record» dell'Overview della dashboard KPI.
- Intervista: danno fastidio troppi numeri uguali, sette riquadri slegati, colori senza senso, nomi tagliati e testo fitto. «Come ogni schermata noi vorremmo uno studio per sprint, quindi come Stats che ti fa scegliere lo sprint dall'inizio.»
- APPROVATO l'08/10: «Mi piace questo redesign applicalo a sprint vs record», guardando la tavola «1 - Giorno per giorno».
- Regole sue sui grafici: tempo sull'asse X sempre, curve continue, asse Y con valori e righe, legenda fuori dall'area, poco testo, tema Notte.

## 2. Decisioni e strade scartate
- BOCCIATA 1A (i sette passi sull'asse X uniti da una curva): «mette su asse x cose non correlate tra loro». Non riproporla.
- BOCCIATA 1C (una riga per passo con pallini): «è praticamente un istogramma». Non riproporla.
- 1B e 1D mai commentate: non implementarle.
- Scelta: un riquadro per passo (Home, Dettaglio, 1/2/3 workout, Prova, Pagante). X = giorni dal primo avvio dell'app (0–14, 0–21 per il pagante), Y = % di persone arrivate al passo entro quel giorno. Linea bianca = sprint scelto fin dove ha dati, linea grigia a tratti = sprint che detiene il record di quel passo. Numero grande = valore dello sprint al suo ultimo giorno; scarto e verdetto contro il record allo stesso giorno.
- Scelte mie, non ancora confermate da Danilo: pillola blu per lo sprint più secondo menu «vs» con «Il migliore»; tre esiti (sotto rosso, in linea bianco/grigio, sopra verde) al posto dei quattro colori; nome dello sprint del record solo al passaggio del mouse; quarto riquadro della seconda riga con il conteggio «N sotto il record» e la legenda.

## 3. Correzioni ricevute in questa sessione
- Una curva cumulata non può scendere: per gli sprint in corso il calcolo va fatto giorno per giorno solo su chi è ancora osservabile (vedi `KM` e `curve()` in `gen.py`).
- Il verdetto pesa lo sprint su chi ha almeno un giorno di vita, non sulle poche persone dell'ultimo giorno.

## 4. File e stato reale
- Documento: https://claude.ai/artifact/XMEyw2XBK1aMcmZmGTnibA (10 tavole). Fonte di verità per l'implementazione: `red-1-giorno-per-giorno.dc.html`.
- `_specs/design-flows/kpi-sprint-record/` (`gen.py`, `design-proposte/`, `redesign-v1.md`): NON committato.
- Codice di oggi, non toccato: `sprintScoreboardCard` in `public/internal/js/kpi.js` (riga ~3004), classi `sb-*` in `public/internal/css/kpi.css` (riga ~637), dati caricati con `sb.rpc('kpi_sprint_scoreboard')` (riga ~2130).
- Fatto a parte e pubblicato su `main` (commit `3385989`): linea di soglia al 30% sul grafico «Prove che poi pagano» di Stats (`public/internal/js/kpi-stats.js`, `ST_RATE_SOGLIA`). Non visto nel browser; Danilo deve ancora dire se vuole 30%, 38% o entrambe.
- Stati non disegnati nella fila «Redesign»: caricamento, errore, nessuno sprint, sprint senza persone, finestra stretta. Il modello è `red-2`…`red-5` in `_specs/design-flows/kpi-abbonamenti/design-proposte/`.

## 5. Prossimo passo, alla lettera
1. Scrivere la funzione Postgres `kpi_sprint_curves()` copiando coorte ed esclusioni da `kpi_sprint_scoreboard` (`assert_internal_operator`, `ev`, `c`, `play_token_facts`). Per ogni sprint e passo deve restituire, per ogni giorno 1…14 (1…21 per `paid`), la coppia [nuovi arrivati al passo in quel giorno fra chi ha almeno quel giorno di vita, persone osservabili non ancora arrivate], più `elig` (persone con almeno d giorni di vita). Le due query di prova usate l'08/10 sono descritte in `redesign-v1.md`; il calcolo sul client è `curve()` in `gen.py`.
2. Riscrivere `sprintScoreboardCard` sulla tavola `red-1`: misure, colori e testi copiati dalla tavola; stile delle schede Notte già usato da `premiumTimelineCard` (classi `pt-*`). Lo sprint del record di ogni passo resta scelto come oggi (miglior valore finale fra gli sprint maturi con almeno 100 persone). La curva dello sprint si ferma dove `elig` scende sotto 30.
3. Collegare la funzione nuova alla cache della dashboard, come le altre schede dell'Overview.
4. Applicare la migrazione, provare nel browser, committare anche `_specs/design-flows/kpi-sprint-record/` e fare push su `main` senza richiedere conferma (indicazione permanente di Danilo sulla dashboard KPI).

## 6. Aggiornamento dell'08/10, dopo «Applica»
- La funzione `kpi_sprint_curves()` ESISTE già sul database (migrazione `kpi_sprint_curves_fast`): restituisce per ogni sprint `id`, `elig` (22 valori, giorni 0…21) e `steps` (per passo, 21 coppie [nuovi, osservabili non ancora arrivati]). Permessi: `authenticated` e `service_role`.
- NON è verificata: chiamata a mano va in timeout. Anche `kpi_sprint_scoreboard()` oggi supera i 15 secondi, quindi il costo sta nella parte comune (lettura di `events` e incrocio con la coorte), non nella parte nuova.
- Le mie prove hanno tenuto occupato il database di produzione per alcuni minuti (anche `select 1` non rispondeva). Le chiamate sono state fermate, il database risponde.
- Regola per chi continua: mai chiamare `kpi_sprint_curves()` o `kpi_sprint_scoreboard()` a mano senza `set statement_timeout = '20s'` nella stessa chiamata, e mai due volte di seguito. La scheda deve leggere dalla cache della dashboard, non dalla funzione in diretta.
- Il passo 1 del punto 5 è fatto a metà: resta da misurare il tempo, eventualmente alleggerire la funzione (per esempio limitandola agli sprint degli ultimi mesi più quelli che detengono un record), e agganciarla alla cache.

## 7. Stato alla chiusura della sessione (08/10, pomeriggio)
- Codice della scheda SCRITTO e NON committato: `public/internal/js/kpi.js` (`sprintScoreboardCard` riscritta, più `scoreCurve`, `scoreTile`, `attachSprintRecord`, lettura dalla cache con ripolling ogni 5 secondi) e `public/internal/css/kpi.css` (classi `sbr-*` al posto di `sb-*`). Provato solo `node --check` e una pagina di prova locale con i dati di `gen.py`; mai sulla dashboard vera.
- Migrazione APPLICATA `kpi_sprint_curves_cached`: `kpi_sprint_curves()` riscritta (restituisce anche nome, date, `age_days`; solo sprint dalla beta), `kpi_cache_compute` e `kpi_cache_targets` con la voce `sprint_curves` (scope `all`, tier `hourly`), riga di richiesta inserita in `kpi_cache`.
- La funzione NON HA MAI GIRATO: la riga `sprint_curves` di `kpi_cache` ha `computed_at` nullo, richiesta dalle 13:48 UTC. I numeri veri e il tempo di calcolo non sono verificati.
- Il worker della cache risulta fermo su `stats_series` (tre esecuzioni interrotte dopo 90 secondi e una in corso, secondo l'agente): è un candidato per la lentezza del database di oggi, da verificare.
- NON pubblicare finché `sprint_curves` non è calcolata: il codice nuovo non chiama più `kpi_sprint_scoreboard`, quindi senza cache la scheda resterebbe in caricamento.
- Scostamenti dalla tavola: il menu elenca solo gli sprint dalla beta (11/06); il tooltip mostra il punto più vicino al cursore fra sprint e record.
- Prossimo passo, alla lettera: quando il database è tornato normale, controllare `select query, computed_at, compute_ms, error from kpi_cache where query = 'sprint_curves'`; se è calcolata, aprire la dashboard, confrontare la scheda con la tavola `red-1`, poi committare `kpi.js`, `kpi.css`, `HANDOFF.md` e `_specs/design-flows/kpi-sprint-record/` e fare push su `main`.
