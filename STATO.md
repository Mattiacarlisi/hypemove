# STATO — corsia COORTE-STATS (pagina «Stats»)

## C1 — schede di Stats, prima e dopo
| Scheda | Prima | Ora |
|---|---|---|
| Spesa cumulata e incassi (`stBuildMoney`, numero in `stCards`) | calendario: `stWindow(all…)` sommava tutte le righe | coorte: `stWindow(stRowsOf(d,S)…)` |
| Prove avviate (`stBuildTrials`) | calendario, tutte le righe | coorte, righe dello scope |
| ROI (`stBuildSprintDay`) | calendario, tutte le righe; confronto idem | coorte; il confronto usa solo la riga confrontata (`[sp]`) |
| Prove che poi pagano (`stCohort`, `stBuildRate`) | SQL `coh` = prove di chiunque avviate fra inizio e maturazione | SQL `cohort_rows` per riga del gruppo, JS somma le righe dello scope; fati tardivi sull'ultimo giorno |
| Fine asse (`stAxisEnd`) | prove aperte di tutti gli sprint | solo righe dello scope |
| Spesa | invariata: giorni di pubblicità di ciascuna riga (`spa`) | |

Difetto in più trovato e corretto: `stWindow` scartava i flussi negativi (`Math.max(0,…)`), quindi un rimborso non usciva dagli incassi. L'annuale del 10/10 (Sprint 15) è stato rimborsato.

## C2 — fatto
- `public/internal/js/kpi-stats.js`: helper `stRowsOf`, tutte le chiamate a `stWindow` sullo scope, `stCohort` legge `cohort_rows`.
- `_specs/migrations-coorte/20261014120000_kpi_stats_series_coorte.sql`: NON applicata. Provata con begin/rollback: gira e restituisce `cohort_rows`.
- Senza migrazione il JS ricade su `cohort`/`cohort_points` vecchi (solo la scheda del tasso resta a calendario).

## C3 — verifica numerica (query a coorte indipendente + logica JS in Node sui dati veri)
| Scope | Spesa | Incassi netti | Prove | Offerte |
|---|---|---|---|---|
| Sprint 15 gruppo | 116,18 € | 41,80 € | 7 (3 disdette) | 2 |
| Sprint 15 dettaglio | 88,62 € | 20,90 € | 6 (2 disdette) | 1 (annuale 13/10 22:24, primo avvio 07/10) |
| Sprint 16 | 44,44 € | 6,90 € | 1 | 1 (mensile 13/10 15:45, primo avvio 13/10 15:28) |
Col codice vecchio (clamp + tutte le righe) Sprint 16 mostrava 2 offerte, 27,80 €.

## C4 — NON fatto
La pagina /internal/kpi.html chiede l'accesso operatore, che fa solo Danilo. Nessuno screenshot.
