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
