# Contratto dati della pagina «Stats»

Corsia SQL → corsia pagina. Fixture di riferimento: `stats-fixture-sprint15.json` (stessa forma, numeri di `gen5.py` per lo Sprint 15, 06/10/2026). Migrazione: `app/supabase/migrations/20261006120000_kpi_stats_series.sql` (da applicare dopo il via di Danilo).

MODIFICA 07/10/2026: il grafico 1 legge la nuova chiave `sprint_curves` (sezione in fondo); `sprint_day` resta nella risposta ma la pagina non lo usa più. Migrazione: `app/supabase/migrations/20261007120000_kpi_stats_sprint_curves.sql`.

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
`{ now: {pct, paid, ended}, min_ended, points: [{date, v, paid, ended}] }`. `v` = prove pagate / prove finite × 100 (%), cumulato al giorno. `real` soltanto.
- `ended` = pagate + scadute senza pagare + aperte già disdette (dal 07/10/2026). Una prova disdetta entra il giorno della disdetta: evento `SUBSCRIPTION_CANCELED` se c'è, altrimenti l'ultimo aggiornamento della riga di `play_purchases`, mai oltre la scadenza. Finché la prova è aperta quel giorno può spostarsi in avanti di qualche giorno, perché l'app riaggiorna la riga.
- `min_ended` (5, in `kpi_stats_config()`): la pagina disegna la curva solo dai punti con `ended` ≥ questo valore. Il conto resta su tutte le prove.
- Lo stesso tasso (`meta.rate`) entra nei grafici 1, 3, 4 e 5.

### 3. Prove avviate ogni 100 € (dal 07/10/2026 letto da `sprint_curves`)
La pagina non usa più `trials_per_100.selected`, `compare` e `final_estimate` (restano nella risposta, calcolati con i vecchi 16 giorni e la spesa futura stimata). Usa:
- `sprint_curves.sprints[].points[].st` = prove avviate entro quel giorno (l'ultimo giorno raccoglie anche quelle partite dopo) e `cs` = spesa entro quel giorno. Valore del punto: `100 × st / cs`.
- Solo dati veri: per uno sprint con `today_day` i punti si fermano a `today_day`. Nessuna stima.
- Sprint scelto e sprint di confronto sono quelli del grafico 1 (menu «Confronta»); asse dei giorni uguale al grafico 1.
- `trials_per_100.breakeven` = 100 / (netto annuale × tasso): la riga del pareggio. Scala 0–12, più alta solo se un valore finale la supera.

### 4. `expected_payers`
`{ real: [{date, started, paid}], est: [{date, v}], final_estimate, expected_new, est_full: [{date, v}], total_estimate }`. Tutta la storia delle prove, non lo sprint scelto.
- `real` fino a `ultimo_giorno_intero`: la pagina disegna solo `paid` (bianco). `started` resta nella risposta ma non si disegna più (dal 07/10/2026).
- `est_full` (dal 07/10/2026): curva blu tratteggiata da `ultimo_giorno_intero` alla scadenza dell'ultima prova aperta non disdetta, anche oltre la `fine` dello sprint scelto. `v` = paganti entro quel giorno + tasso × prove aperte non disdette che scadono entro quel giorno. Vuota se lo sprint scelto non arriva a ieri o se non ci sono prove aperte. L'asse del grafico si allunga fino all'ultima data di `est_full`.
- `total_estimate` = paganti di oggi + tasso × prove aperte non disdette: il numero grande. `expected_new` = solo la parte attesa.
- `est` e `final_estimate` (fermi alla `fine` dello sprint) restano per la pagina vecchia; la nuova li usa solo se `est_full` manca.
- Scala: da 0 al valore più alto, a passi di 2 (di 4 sopra 8).

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

## `sprint_curves` (grafico 1, dal 07/10/2026)
`{ breakeven: 1, rate, value: { net_year, gross_year, net_month, gross_month }, sprints: [ {…} ] }`; `rate` è il tasso di fine prova dei dati (0..1), tutti gli sprint con spesa, dal più vecchio.

Ogni sprint: `id`, `numero`, `nome`, `inizio`, `fine` (ultimo giorno di pubblicità: il giorno prima dello sprint successivo se le date si sovrappongono), `matura` (ultimo giorno dell'asse), `ads_days`, `days`, `today_day` (giorno di oggi, `null` se lo sprint è maturato), `selected`, `spend`, `paid_net`, `paid_gross`, `open_trials`, `points: [{ day, cs, pn, pg, on, og, est }]`.

- `days` = giorni di pubblicità + 7 di prova, allungati fino all'ultima prova avviata in ritardo, al massimo 14 in più.
- `cs` = spesa entro il giorno. `pn` / `pg` = pagato entro il giorno, con la resa netta (20,90 € annuale, 6,90 € mensile) o a prezzo pieno (29,99 € e 9,90 €). `on` / `og` = valore delle prove aperte non disdette che scadono entro il giorno, zero prima di `today_day`.
- La pagina calcola il valore: `(p + tasso × o) / cs`, `null` se `cs` è 0. Il tasso è `rate`, oppure quello scritto a mano nel campo «Tasso» (vale solo per il grafico 1 e non si ricorda).
- Da `today_day` in poi `est:true`: la spesa resta quella già fatta. Nessuna spesa futura stimata.
- L'ultimo giorno raccoglie anche ciò che arriva dopo `matura`.
- La spesa di un giorno va a un solo sprint.
- Scelte che vivono solo nella pagina (`localStorage`): vista «Con tasse» (`pn`/`on`, 20,90 €, predefinita) o «Senza tasse» (`pg`/`og`, 29,99 €) e sprint di confronto (al massimo 3; senza scelta, i due precedenti).
