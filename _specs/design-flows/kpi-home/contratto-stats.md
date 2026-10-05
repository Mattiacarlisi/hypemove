# Contratto dati della pagina «Stats»

Corsia SQL → corsia pagina. Fixture di riferimento: `stats-fixture-sprint15.json` (stessa forma, numeri di `gen5.py` per lo Sprint 15, 06/10/2026). Migrazione: `app/supabase/migrations/20261006120000_kpi_stats_series.sql` (da applicare dopo il via di Danilo).

MODIFICA: nessuna finora. Se la forma cambia, questa riga dice cosa.

## Funzioni (tutte `rpc`, solo operatori interni: stessa protezione di `kpi_sprint_scoreboard`)

| Funzione | Cosa dà |
|---|---|
| `kpi_stats_sprints()` | jsonb array per il selettore, dal più recente al più vecchio |
| `kpi_stats_series(p_sprint_id uuid default null)` | jsonb con tutte le serie. `null` = sprint in corso (se non c'è, l'ultimo con spesa). Id sconosciuto o dello «Sprint 12 - Test…» → `null` (la pagina mostra la scheda di errore) |
| `kpi_stats_config()` | costanti di design (resa netta, 16 giorni, sprint di confronto). La pagina non ne ha bisogno |

Chiamata: `supabase.rpc('kpi_stats_series', { p_sprint_id: id })`. Con `p_sprint_id` omesso si manda `{}`.

### `kpi_stats_sprints()` → `[ {…} ]`
`id` uuid · `numero` int (il numero dentro il nome: «Spint 14» → 14) · `nome` · `inizio`, `fine` (`YYYY-MM-DD`) · `in_corso` bool · `giorno` int o `null` (solo se in corso: 3 per «giorno 3 di 16») · `durata` int (16) · `spesa` EUR totale · `predefinito` bool (lo sprint che `kpi_stats_series(null)` restituisce). Contiene solo gli sprint con spesa Meta e quello in corso. La pillola scrive «Sprint {numero} · giorno {giorno} di {durata}»; per uno sprint chiuso, «Sprint {numero} · chiuso».

## `kpi_stats_series` → oggetto

Convenzioni valide ovunque:
- Date `YYYY-MM-DD` (giorno di calendario di Roma). `day` è il giorno dello sprint, da **1** (day 3 = 06/10 per lo Sprint 15; «oggi» = `meta.zone.today_from_day`).
- Numeri con al massimo 4 decimali. **`v: null` = non definito** (nessuna spesa ancora, nessuna prova finita): non si disegna e non interrompe la curva a meno che la pagina non preferisca; non è zero.
- **Valori fuori scala vengono restituiti veri** (es. 42,37 al giorno 2 del grafico 3): la pagina decide di non disegnarli e li tiene come numero. Massimi di asse della tavola in tabella sotto.
- **Reale/stimato**: ogni punto delle serie a giorni dello sprint ha `est` (bool). `false` = dato reale, `true` = stima (tratteggio blu o tratteggio grigio per uno sprint di confronto con prove aperte). Nelle serie a calendario il reale e la stima sono due array distinti (`real` / `est`). Un `est:true` isolato in mezzo a punti `false` non succede: la pagina può spezzare la curva dove `est` cambia, ripetendo l'ultimo punto come in `gen5.py`.

### Assi usati dalla tavola `dir-A-tre-numeri`
| Chiave | Grafico | Asse Y (max) | Altro |
|---|---|---|---|
| `sprint_day` | 1 Lo sprint, giorno per giorno | 1,50 € (tick 0,5 / 1 / 1,5), pareggio 1 € | X: giorni 1..16, zona «da oggi» da `zone.today_from_day`, zona «pubblicità finita» da `zone.ads_end_day` |
| `trial_rate` | 2 Prove che poi pagano | 100 % | X calendario |
| `trials_per_100` | 3 Prove avviate ogni 100 € | 12 (tick 0/4/8/12), pareggio = `breakeven` (7,7) | X: giorni 1..16 |
| `expected_payers` | 4 Paganti attesi | 16 (tick 0/4/8/12/16) | X calendario |
| `sprint_by_sprint` | 5 Sprint dopo sprint | 1,50 €, pareggio 1 € | X: uno per sprint |
| `trials_not_cancelled` | 6 Prove non disdette | 100 % | X calendario |
| `trials_per_100_first_opens` | 7 Prove ogni 100 primi accessi | 1 (tick 0/0,25/0,5/0,75/1) | X calendario |

Calendario: da `trials_per_100_first_opens.from` (= inizio dello Sprint 12, 07/09/2026; `cal_from` = il minore fra quello e l'inizio dello sprint scelto) alla `fine` dello sprint scelto, 36 giorni per lo Sprint 15 (07/09 → 12/10). Le serie reali arrivano a `meta.ultimo_giorno_intero` (ieri, o la `fine` se lo sprint è chiuso); «oggi» non è mai un punto reale.

### `meta`
- `sprint`: `id`, `numero`, `nome`, `inizio`, `fine`, `in_corso` bool, `giorno` (int o null), `durata` (16), `open_trials` (prove aperte non disdette dello sprint: la pillola «2 prove aperte»), `paid_eur` (pagato dello sprint, EUR: «0 € pagati finora»).
- `oggi`, `ultimo_giorno_intero`.
- `net`: `{ year: 20.9, month: 6.9 }`.
- `rate`: `pct` (62,5), `paid` (5), `ended` (8), `open` (7), `open_cancelled` (1), `started` (15). È il tasso di fine prova di oggi, dai dati.
- `breakeven_trials_per_100`: 100 / (20,90 × tasso) = 7,6555.
- `zone`: solo se lo sprint scelto è quello in corso, altrimenti `null`. `{ today_from_day: 3, ads_end_day: 9 }`: dal giorno `today_from_day` la curva è stimata; dal giorno `ads_end_day` il fondo è più chiaro («pubblicità finita»).
- `expected_trials_per_euro`: prove attese per euro di spesa (0,0314 = 3,1 ogni 100 €), solo sprint in corso, altrimenti `null`.

### 1. `sprint_day`
`{ breakeven: 1, selected: { numero, nome, points: [{day, v, est}] }, compare: [{ numero, nome, points }], final_estimate }`
- `v` = (pagato + prove aperte non disdette × tasso × resa) / spesa cumulata, EUR per EUR.
- **Sprint in corso**: `selected.points` ha 16 punti: giorni 1..2 reali (`est:false`, solo pagato), dal giorno 3 stimati (`est:true`). `final_estimate` = valore al giorno 16 (0,5615), `null` se lo sprint è chiuso. In alto a sinistra la tavola mostra `final_estimate`.
- **Sprint chiuso scelto dal selettore**: `selected.points` è il dato reale giorno per giorno (nessuna stima futura, `zone: null`, `final_estimate: null`); il punto ha `est:true` solo dove ci sono prove ancora aperte (tratteggio), come gli sprint di confronto. Giorni disponibili = fino a ieri, massimo 16 (lo Sprint 13 ne ha 15).
- `compare`: gli sprint 5, 12, 13 (lista in `kpi_stats_config()`), escluso quello scelto. Punti `{day, v, est}` reali con `est:true` dove ci sono prove aperte.

### 2. `trial_rate`
`{ now: {pct, paid, ended}, points: [{date, v, paid, ended}] }`. `v` = prove finite pagate / prove finite × 100 (%), cumulato al giorno. `real` soltanto.

### 3. `trials_per_100`
`{ breakeven, selected: {numero, nome, points: [{day, v, est}]}, compare: […], final_estimate }`. `v` = prove avviate × 100 / spesa cumulata. Per lo sprint in corso: giorni 1..2 reali (giorno 1 `v:null` perché la spesa è 0, giorno 2 = 42,37, fuori scala), dal giorno 3 stima (10,0 → 4,3). `final_estimate` = 4,2983 (fine pubblicità).

### 4. `expected_payers`
`{ real: [{date, started, paid}], est: [{date, v}], final_estimate, expected_new }`.
`real` fino a `ultimo_giorno_intero`: prove avviate (grigio) e prove finite che hanno pagato (nero). `est`: curva blu tratteggiata da `ultimo_giorno_intero` (stesso valore dei pagati) a fine sprint = pagati + tasso × prove aperte non disdette che scadono entro quel giorno. `est:[]` e `final_estimate:null` per uno sprint chiuso. `expected_new` = tasso × prove aperte non disdette (3,75).

### 5. `sprint_by_sprint`
`{ breakeven: 1, points: [{ numero, nome, v, est, paid_only, selected }] }`, dal più vecchio. `v` = valore dello sprint alla sua ultima giornata con dati (max 16 giorni): reale dove `est:false`, stima (prove aperte × tasso) dove `est:true`; lo sprint in corso usa la stima a fine pubblicità (0,5615). `paid_only` = solo il pagato. `selected` evidenzia lo sprint scelto. Contiene tutti gli sprint con spesa (oggi Sprint 4–15).

### 6. `trials_not_cancelled`
`{ points: [{date, v, kept, started}] }`: `v` = prove non disdette / prove avviate × 100. Vedi la contraddizione sotto: il grafico è nella tavola ma una frase del 06/10 dice che è stato tolto.

### 7. `trials_per_100_first_opens`
`{ from, points: [{date, v, trials, first_opens}] }`: prove avviate dal giorno `from` × 100 / primi accessi dal giorno `from`. `v:null` se i primi accessi sono 0.

## Regole di calcolo (già decise)
Resa netta 20,90 € annuale, 6,90 € mensile. Tasso di fine prova = prove finite pagate / prove finite, dai dati; stima del passato con il tasso di oggi. Prova disdetta (ultima riga di `play_purchases` con rinnovo automatico spento) vale zero; se scaduta ma ancora attiva in `play_token_facts` conta come finita senza pagamento. La prova vale dal giorno in cui parte. Esclusi: `kpi_excluded_users`, test, interni, bot, `first_open` futuri, «Sprint 12 - Test Rate + Mascotte». Utente → sprint del suo primo `first_open`; se due sprint si sovrappongono (14 e 15 il 04/10) vale il più recente.
Traccia dello sprint in corso: spesa futura al ritmo medio dello sprint precedente per lo stesso numero di giorni con spesa che ha avuto (7); prove future per euro = (prove dello sprint precedente + prove dell'attuale) / (spesa precedente + spesa attuale fino a ieri).

## Note per la pagina
- Per le etichette usa `numero` («Sprint {numero}»), non `nome`: nel database ci sono «Spint 7», «Spint 14» e «sprint 4».
- `selected` e `compare` hanno lo stesso formato: lo sprint scelto è sempre in `selected`, mai dentro `compare`.
- Con uno sprint vecchio (es. Sprint 5) le serie a calendario partono dal suo inizio; i tassi sono `null` finché nessuna prova è finita: la pagina trattiene la curva.

## Differenze note fra la fixture (numeri di gen5.py) e la funzione (dati vivi)
- Grafico 5, Sprint 12: la fixture ha 0 (valore scritto a mano in `REAL2`), la funzione dà 0,089 con `est:true` (a 16 giorni ha 2 prove aperte, stessa formula della curva del grafico 1, dove il giorno 16 vale già 0,089). Il pagato puro è in `paid_only` (0).
- Grafico 7: la fixture conta 1879 primi accessi al 05/10 (solo `kpi_excluded_users` esclusi), la funzione 1612 perché esclude anche le sessioni anonime virtuali o bot, come `kpi_sprint_scoreboard`. Risultato: 0,81 al posto di 0,69 («0,7» nella tavola). Se Danilo preferisce il numero della tavola basta togliere la riga `ex_s` dalla CTE `fo`.
