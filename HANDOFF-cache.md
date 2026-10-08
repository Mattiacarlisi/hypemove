# HANDOFF — cache della dashboard KPI calcolata all'entrata (08/10/2026, sera)

`HANDOFF.md` è stato modificato da un'altra sessione mentre scrivevo: questo passaggio sta in un file a parte per non sovrascriverlo.

## 1. Richiesta e vincoli di Danilo
- «Facciamo per ora che le cache vengono calcolate una volta… andiamo a salvare solo ciò che è stato calcolato. E poi quando scade lo ricalcoliamo una volta entrati, ma rimane comunque la cache e viene aggiornata in automatico all'entrata.»
- Sul prezzo da pagare (il primo che entra dopo la scadenza vede per qualche secondo il dato vecchio; limite di tempo sui calcoli pesanti; se il ricalcolo fallisce resta il valore vecchio con l'ora del calcolo): «ci sta per me».
- In più: «se facciamo anche una animazione di aggiornamento è top».

## 2. Decisioni
- Niente job a orario: restano spenti. La cache si aggiorna solo quando qualcuno apre la dashboard.
- All'entrata la scheda mostra subito il valore salvato, anche scaduto. Se è scaduto parte il ricalcolo e la scheda si aggiorna quando arriva, con un'animazione di aggiornamento.
- Ogni ricalcolo ha un limite di tempo. Se fallisce o scade, resta il valore vecchio con l'ora del calcolo scritta accanto. Mai una scheda vuota al posto di un dato che c'era.
- Non ancora deciso: durata della scadenza per ciascuna query e forma dell'animazione (è una scelta di gusto: mostrare due o tre varianti a Danilo).

## 3. Stato reale, verificato l'08/10 alle 20:11 UTC
- Tutti gli otto job `kpi-cache-*` di `cron.job` hanno `active = false` dalle 13:51 UTC circa. Non so chi li ha disattivati: non riaccenderli.
- Oggi `kpi_cache_get(p_query, p_scope, p_force)` mette la richiesta in coda (`requested_at`) e aspetta il job `kpi-cache-drain` (`call kpi_cache_work()`), che non gira più. In coda ci sono richieste dalle 13:07 UTC per `funnel`, `funnel_event`, `stats_series`, `premium`.
- `kpi_cache_store(p_query, p_scope, p_tier)` calcola e salva una voce in modo sincrono: usata a mano per `sprint_curves` (scope `all`, tier `hourly`), 350 ms, risultato corretto. Può essere il mattone del ricalcolo all'entrata.
- Calcoli pesanti noti: `stats_series` (interrotto tre volte dopo 90 secondi l'08/10, secondo un agente; non verificato da me), `kpi_sprint_scoreboard()` (oltre 15 secondi nel pomeriggio dell'08/10, quando il database era sotto carico).
- La scheda «Sprint vs record» nuova è online (commit `21a34f8`) e legge `sprint_curves` dalla cache con ripolling ogni 5 secondi; con i job spenti le sue curve restano ferme a stasera. Danilo non ha ancora confermato di vederla con i grafici.
- Il commit `f9333a1` su `main` ha il messaggio di «Sprint vs record» ma contiene il lavoro di un'altra sessione sul redesign «AI Coach»: non correggerlo con un force push.
- Una sessione separata («Studia la lentezza del database KPI di oggi») ha indagato in sola lettura cause e difetti del database: il suo rapporto va letto prima di toccare la cache.
- Questo file non è committato.

## 4. Regole per chi continua (è produzione)
- Ogni query pesante di prova porta `set statement_timeout = '20s';` nella stessa chiamata; mai due di seguito; se va in timeout non ripeterla uguale.
- L'08/10 due prove senza limite hanno reso il database irraggiungibile per alcuni minuti.

## 5. Prossimo passo, alla lettera
1. Leggere le definizioni di `kpi_cache_get`, `kpi_cache_store`, `kpi_cache_compute`, `kpi_cache_targets`, `kpi_cache_work` (`pg_get_functiondef`) e il punto del client che le chiama (`public/internal/js/kpi.js` circa riga 777, più `kpi-stats.js`).
2. Proporre a Danilo, in poche righe, come cambia `kpi_cache_get`: restituisce sempre il valore salvato con `computed_at` e un indicatore «scaduto»; il client, se è scaduto, chiede il ricalcolo con una seconda chiamata che ha il suo limite di tempo e poi ridisegna la scheda.
3. Mostrargli due o tre varianti dell'animazione di aggiornamento e fargli scegliere.
4. Dopo la sua scelta: migrazione, client, prova nel browser, commit e push su `main`.
