# Redesign schermata «Funnel» della dashboard KPI — decisioni

Documento: https://claude.ai/artifact/K3hWB2LPkagAsWt9eq1q6W («KPI Funnel — redesign», 9 tavole: 2 «Oggi», 7 «Proposte»).
Le tavole si rigenerano con `gen.py` (scrive in `project/`), copia in `design-v1/`.

## Brief di Danilo (07/10/2026)
«Sarebbe necessario un /redesign di questa schermata anche… spaziature, elementi, un redesign completo, anche fargli prendere più spazio, dire cose utili. Togliere Parametri dal fondo e soprattutto migliorare la parte alta: che senso ha scrivere "KPI Dashboard — Metriche prodotto HypeMove · live da Supabase"? Nessuno proprio. Togli "funnel onboarding" che è una copia di Onboarding; alle date metti "Oggi", "Ieri", "Sprint n" (sprint attuale) e "Sprint n" (sprint precedente a questo). Togli Settimana e Mese, non hanno nessun senso.»

## Dati delle tavole (letti dalla dashboard il 07/10/2026, funnel «Workout 1»)
- Sprint in corso, «sprint 15 ottimizzazione post onboarding» (06/10 13:30 → 13/10): 133 persone, 9 finiscono il 1º allenamento, poi zero. Meta Ads 86.
- Sprint precedente, «Sprint 15» (04/10 → 12/10): 288, 21, 3, 3, 2, 0, 0, 0. Meta Ads 156.
- Esclusi: 34 bot, 19 account di prova, 19 emulatori, 17 bloccati.

## Difetti trovati nella schermata di oggi
- Il riquadro si intitola «Funnel onboarding» su ogni scheda.
- Su telefono le schede vanno a capo su cinque righe e la barra di ogni passo è larga 24 px.

## Direzioni
- 1A Una riga sola: funnel in una pillola-menu, periodi accanto, un riquadro largo.
- 1B Elenco a sinistra: i funnel in colonna sempre visibile, quattro schede di numeri.
- 1C Confronto dentro: tacca e colonna dello sprint precedente in ogni passo (chiede una query in più).
- 3 Chi è escluso: il vecchio «Parametri» diventa una pillola che apre un pannello laterale.

## Scelte mie, da confermare
- Sprint distinti per data di inizio («Sprint 15 · dal 06/10»), in corso e precedente scelti per data.
- Date libere e altri sprint sotto «Altro periodo»; «+ Salva» e «Modifica» nel menu del funnel.
- «Install Google Play» tolto dalla riga in fondo.

Scelta di Danilo (07/10/2026): «1A è il migliore». Si implementa la 1A su schermo grande (`prop-1A-una-riga.dc.html`) e telefono (`prop-2A-una-riga-telefono.dc.html`), con il pannello «Chi è escluso» (`prop-3-chi-escluso.dc.html`). 1B e 1C scartate: non riproporle.
