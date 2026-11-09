# Pagina «Attivazione» della dashboard KPI — redesign v1 (09/11/2026)

Documento: https://claude.ai/artifact/GCMB3Ci2D4Godvfn7K8rVT · copia in `prototipo-v1/`.

## Decisioni di Danilo (prima del redesign)
- Posto: pagina nuova «Attivazione» nel menu a sinistra; la scheda «Attivazione per sprint» dell'Overview resta com'è.
- Sprint: tutti i principali da S3, letti in automatico dalla tabella sprints; sotto-sprint fuori.
- Contenuto: grafici per passo + tabella, niente tessere di confronto S3-S12 / S15-S21.
- Dopo: «Vorrei visualizzarli bene questi dati, con i grafici giusti… La tabella non so, vediamo».

## Prototipi
- Oggi: la pagina Artifact della sessione del 09/11 (nel sito non c'è niente).
- A — Strisce allineate: un grafico a linea per passo, colonne allineate, tre riquadri con scala comune; tabella chiusa.
- B — Funnel e andamento: funnel di uno sprint a sinistra, un passo in tutti gli sprint a destra, collegati; niente tabella.
- C — Tabella colorata: passi × sprint, percentuale e persone in cella, colore relativo alla riga.

## Scelte mie da confermare
- Icona del menu 🌱: il menu usa già emoji per ogni voce.
- «Possono ancora salire» = sprint in corso o chiuso da meno di 14 giorni (stessa regola della scheda in Overview).
- Stati: con i dati, aggiornamento in corso (cache scaduta), primo calcolo, errore.

## Scelta
(in attesa)
