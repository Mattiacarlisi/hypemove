# Redesign sezione «Sprint vs record» della dashboard KPI — decisioni

Documento: https://claude.ai/artifact/XMEyw2XBK1aMcmZmGTnibA («KPI Home — Sprint vs record», 9 tavole: 5 «Oggi», 4 «Proposte»; fila «Redesign» da fare dopo la scelta).
Le tavole si rigenerano con `gen.py` (scrive in `project/`, riusa la linea del tempo di `../kpi-abbonamenti/gen.py`), copia in `design-proposte/`.
Codice di oggi: `public/internal/js/kpi.js`, `sprintScoreboardCard`; classi `sb-*` in `public/internal/css/kpi.css`.

## Brief di Danilo (08/10/2026)
- «Si può fare qualche /redesign su questo? È illeggibile.»

## Risposte all'intervista
- Il problema, tutte e quattro le voci: troppi numeri uguali, sette riquadri slegati, colori senza senso, nomi tagliati e testo fitto.
- Quanto si cambia: «Entrambe a confronto», cioè direzioni a grafico e una versione a riquadri ripulita, e sceglie guardando.
- Il confronto: «In teoria, come ogni schermata noi vorremmo uno studio per sprint, quindi come Stats che ti fa scegliere lo sprint dall'inizio».

## Numeri veri (Supabase, `kpi_sprint_scoreboard()`, 08/10/2026)
Sprint «sprint 15 - Post onboarding Dettaglio» (06/10–13/10), 222 persone: Home 55,4% (record 73,8%, Sprint 13), dettaglio 50,5% (62,5%, Sprint 12), 1 workout 9,0% (29,5%, Sprint 8), 2 workout 0,5% (16,2%, Spint 7), 3 workout 0,0% (11,4%, Sprint 12), prova 0,9% (0,9%, Sprint 5), pagante 0,0% (0,9%, Sprint 5).

## Scelte mie, da confermare
- Lo sprint si sceglie dalla pillola blu, come in «Prove gratuite» e in Stats. Resta un secondo menu «vs» con «Il migliore» predefinito.
- Tre esiti al posto di quattro: sotto (rosso), in linea (grigio o bianco), sopra (verde). Sparisce la distinzione giallo/rosso fra «vicino» e «lontano» dal record; i calcoli non cambiano.
- Il nome dello sprint del record si vede solo al passaggio del mouse.
- Nomi corti dei passi: Home, Dettaglio, 1/2/3 workout, Prova, Pagante.

## Proposte
- 1A Il percorso: un grafico solo, i sette passi in fila, lo sprint in percentuale del record (record = linea a 100%). A sinistra quanti passi sono sotto il record.
- 1B Nel tempo: un grafico piccolo per passo, sprint dopo sprint, con il record cerchiato e lo sprint scelto colorato.
- 1C Una riga per passo: record e sprint sulla stessa scala, uniti da un tratto rosso quando lo sprint è sotto.
- 1D Riquadri puliti: sette riquadri in una riga, un numero solo ciascuno, lo scarto dal record sotto.

## Non disegnato
- Fila «Oggi»: sprint futuro senza nessuno dentro («—») e caso senza nessuno sprint confrontabile.

## Giudizio di Danilo sulle proposte (08/10/2026)
- BOCCIATA 1A: «mette su asse x cose non correlate tra loro». I passi non sono un asse.
- 1C «l'unico sensato», ma bocciato anche lui: «metti su due assi cose che non sembrano tra assi… è praticamente un istogramma».
- 1B e 1D non commentate.

## Fila «Redesign»: 1 - Giorno per giorno
- Un riquadro per passo. X = giorni dal primo avvio dell'app (0–14, 0–21 per il pagante), Y = % di persone arrivate al passo entro quel giorno.
- Linea bianca = sprint scelto, fin dove ha dati (almeno 30 persone con quei giorni di vita). Linea a tratti = lo sprint che detiene il record di quel passo.
- Numero grande = valore dello sprint al suo ultimo giorno; scarto e verdetto contro il record **allo stesso giorno**, non contro il record a 14 giorni.
- Sprint in corso: la curva si calcola giorno per giorno solo su chi è ancora osservabile (dati in `KM` dentro `gen.py`), così non scende mai.
- Numeri veri: lo sprint «Post onboarding Dettaglio» al giorno 1 è a 0,8% sui 2 workout contro il 7,3% del record allo stesso giorno (la sezione di oggi dice 0,5% contro 16,2%).
- Da fare nel codice se approvato: `kpi_sprint_scoreboard` restituisce solo i totali, serve una funzione che dia le curve giorno per giorno.

- APPROVATO da Danilo l'08/10: «Mi piace questo redesign applicalo a sprint vs record». Fonte di verità: tavola `red-1-giorno-per-giorno.dc.html`. Implementazione descritta in `HANDOFF.md` alla radice.
