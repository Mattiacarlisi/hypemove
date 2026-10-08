# Brief comune — redesign della pagina «AI Coach» della dashboard KPI di HypeMove

Lavoro SOLO di design. Il codice della dashboard (`/home/d4nd0n/Dev/HypeMove/www/public/internal/`) è in sola lettura: non modificarlo. Non pubblicare, non fare commit, non scrivere nel database, non toccare `app/benchmark/` né `app/supabase/`.

## Dove scrivi
Cartella di lavoro `WD` = la cartella che contiene questo file. Le tavole vanno in `WD/project/<nome>.dc.html`. Ogni agente scrive un suo generatore Python `WD/gen_<sigla>.py` che produce le sue tavole (così si rigenerano), sul modello dei generatori esistenti. NON scrivere `canvas.json` e non toccare i file degli altri agenti (prefissi diversi).

## Formato e tecnica (da leggere prima di disegnare)
1. `/home/d4nd0n/.claude/skills/redesign/reference.md` per intero: formato `.dc.html`, linea del tempo unica in requestAnimationFrame, ogni valore funzione pura di `t`, niente setTimeout, niente classi a fasi, niente DOM ricostruito.
2. Il precedente più vicino, da copiare come impalcatura: `/home/d4nd0n/Dev/HypeMove/www/_specs/design-flows/kpi-abbonamenti/gen.py` (funzione `page`, script `JS`, puntatore del mouse in SVG, velo, clic simulato) e la tavola risultante `/home/d4nd0n/Dev/HypeMove/www/_specs/design-flows/kpi-abbonamenti/design-proposte/red-1-prove.dc.html`. È il grafico «Prove gratuite», il preferito di Danilo: è il riferimento estetico.
3. Una tavola modello dell'onboarding per capire il formato: `/home/d4nd0n/Dev/HypeMove/app/_specs/design-flows/onboarding/design-v54/nuovo-10-attrezzi.dc.html` (basta scorrerla).

Misura della tavola: 1280×720 (pagina desktop). La finestra stretta è 390×844. Se una schermata è più alta, la tavola può essere 1280×N: scrivi la misura in `$preview`.
Ogni tavola si muove da sola in ciclo (6–9 s): ingresso degli elementi, il movimento proprio della schermata (il grafico che si disegna), il puntatore che si sposta e un passaggio del mouse o un clic simulato. Con `prefers-reduced-motion` resta ferma su un fotogramma leggibile.

## Dati
`WD/dati.json` contiene i dati VERI: giri dei benchmark, esito caso per caso di ogni giro, uso del coach giorno per giorno (30 giorni), chiamate per tipo, funnel del feedback, e 14 chat vere senza nomi. Usa quelli, anche dove sono scomodi (il picco di errori del 30/09, il giorno di oggi ancora in corso, i passaggi senza giri). Non inventare numeri. Persone: mai nomi o email veri; dove serve un utente scrivi «Utente 0412», «Utente 1873» ecc.

## Tema «Notte» (fila Proposte e Redesign) — palette congelata
Sono i colori già usati nella pagina Stats e in «Prove gratuite» (`kpi-stats.js` costante `ST`, `kpi.css` blocco `.pt-*` da riga 915 circa):
pagina `#0f1115`, card `#1a1d24` con bordo `1.5px #2a2e37`, raggio 14, ombra `0 3px 0 #050608`, testo `#ffffff`, secondario `#9ca3af`, terziario `#6f7683`, griglia `#2a2e37`, blu `#4361ee` (dato in corso, selezione), blu chiaro `#8da2ff`, arancione `#fb8b04` (soglia, riferimento), verde `#4ade80` (riuscito), rosso `#f87171` (fallito, errore), selezione `#262d45`. Nessun altro colore. Font Nunito (Google Fonts), pesi 700/800. Misure su multipli di 8 (4 dove serve).
Icone solo SVG a tratto, mai emoji. I pulsanti non cambiano misura fra gli stati.

## Regole di Danilo sui grafici (vincolanti)
- Ogni etichetta al massimo due parole. Niente frasi di spiegazione, niente sottotitoli lunghi, niente note. In hover solo il dato.
- Niente chip o badge decorativi, niente gergo interno (mai `context_key`, `typesafe/jev`, nomi di tabelle o di eventi a schermo).
- Un grafico risponde a una domanda sola. Niente scala logaritmica, niente due assi verticali, niente 3D. Barre e colonne partono da zero. Il colore ha un solo significato in tutta la pagina e accanto al colore c'è sempre un secondo segnale (forma, posizione o etichetta).
- Numeri grandi a sinistra del grafico, grafico a destra, come in «Prove gratuite». Italiano con gli accenti veri.
- La forma di ogni grafico nuovo si sceglie leggendo `/home/d4nd0n/.claude/skills/grafico/reference.md` (sezioni 1, 3, 5, 6): prima il dato, poi la domanda, poi la famiglia.

## Verifica obbligatoria
Dalla cartella `WD`: `python3 /home/d4nd0n/.claude/skills/redesign/shoot.py project/<file>.dc.html 0.3 1.5 3 4.5 6 7.5` scrive `out/<nome>-strip.png`. APRI la striscia con Read e guardala: niente sovrapposizioni, niente testo tagliato o fuori dalla card, gerarchia chiara, movimento continuo. Zero errori JavaScript. Correggi e rifotografa finché è pulita. Giudicare dal sorgente non vale.

## Consegna (messaggio finale, sotto 250 parole)
I file in ordine con il titolo «numero - due parole», una riga su cosa anima ciascuna, le scelte di misura principali, ciò che non hai potuto fare o che si scosta dal brief.
