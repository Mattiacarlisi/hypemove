# Redesign Home dashboard KPI — decisioni

Documento: https://claude.ai/artifact/YJKwByuTVRmDBahDZFKpCq («KPI Home — direzioni», 5 tavole: 1 «Oggi», 4 «Proposte»).
Le tavole si rigenerano con `gen.py` (scrive in `project/`), copia in `design-direzioni/`.

## Brief di Danilo (05/10/2026)
- «I dieci grafici della bozza sono approvati come forma e le loro regole non si toccano: tempo sull'asse X, asse Y con i valori, meglio sempre in alto, legenda fuori dal grafico, stime distinte dal reale. Cambia la pagina intorno.»
- «Tre o quattro direzioni molto diverse fra loro nell'impaginazione, non solo nei colori, tutte costruite intorno ai grafici 1, 2 e 3.»
- «La Home parla dello sprint in rapporti, Economy dell'azienda in euro veri: nessun grafico compare due volte.»
- Numeri veri letti dal connettore Supabase (scelta di Danilo).

## Come sono calcolati i numeri (05/10/2026)
- Un abbonamento appartiene allo sprint in cui il suo utente ha aperto l'app la prima volta (`first_open` dentro la finestra dello sprint), come fa `kpi_sprint_scoreboard`. Fonte: `play_token_facts`, esclusi test e interni.
- Spesa: `meta_ads_insights_daily`, sommata dal primo giorno dello sprint.
- Resa netta: 20,90 € per un annuale, 6,90 € per un mensile. Il prezzo scontato a 19,90 € degli sprint 13 e 14 non è distinguibile dal prodotto.
- Rientro al giorno 16: S4 0, S5 0,98, S6–S12 0, S13 0,34. Sprint 14: 3 prove aperte, 0 paganti, al massimo 0,41.
- Sprint 15 al giorno 2: 4,72 € spesi, 2 prove, 0 paganti.
- Campione per i casi: Sprint 5 (vecchio), 12 (di mezzo), 13 (ultimo chiuso). Pessimo 0, medio 0,34, ottimo 0,98.

## Scelte mie, da confermare
- Previsione del grafico 1: piatta fino al giorno 8, poi sale in linea retta verso il valore finale dei tre casi. Il metodo non è deciso.
- Grafico 3: sprint passati mostrati 12, 13 e 14, perché il 5 ha solo due giorni di spesa.
- «Sprint 12 - Test Rate + Mascotte» si sovrappone allo Sprint 12 ed è fuori dal grafico 2.

## Direzioni
- 1A Uno grande: grafico 1 a tutta larghezza, 2 e 3 sotto.
- 1B Tre finestre: tre colonne uguali nell'ordine in cui arriva il segnale (3, 1, 2), con i colori della dashboard di oggi.
- 1C Colonna e margine: grafici in colonna che scorre, margine fisso con lo sprint, le note e una legenda sola.
- 1D Linea del pareggio: grafici 2 e 1 affiancati alla stessa scala, la linea di 1 € attraversa la pagina.

Scelta di Danilo: in attesa.

## Secondo giro (05/10/2026)
Danilo sulle prime quattro direzioni: «Madonna non si può vedere». Difetti indicati, tutti e quattro: i colori, i grafici vuoti e schiacciati, troppa roba scritta, nessuna gerarchia.
- Colori: design system HypeMove (scelta di Danilo). Schede bianche con bordo e gradino, Nunito, blu `#4361ee` per lo sprint in corso e le stime, arancione `#fb8b04` solo per il pareggio, grigio per gli sprint passati.
- Grafici: restano 1, 2 e 3 (scelta di Danilo).
- Scala in euro fino a 1,25 € invece di 2 €; grafico 3 fino a 16 con il valore di oggi (42,4) segnato «fuori scala».
- Un numero grande per grafico, titoli corti, una legenda sola per pagina, «pareggio» scritto accanto alla sua linea.
- Direzioni rimaste: 1A Uno grande, 1B Colonna e margine, 1C Linea del pareggio. La direzione scura a tre colonne è stata tolta.
- Le tavole nuove si rigenerano con `gen2.py`, che riusa `gen.py`.

## Terzo giro (05/10/2026)
Danilo: «Falli scuri mi faticano gli occhi solo a guardarlo». Le tre direzioni passano al tema Notte del design system HypeMove: pagina `#0f1115`, schede `#1a1d24`, bordo `#2a2e37`, testo bianco, stesse regole.

## Scelta (05/10/2026)
Danilo: «1A è il migliore ma i grafici sono poco chiari ti dico la verità». Poco chiari: le linee grigie degli sprint passati e tutto schiacciato a zero. Le direzioni 1B e 1C restano solo in questa copia.

## Quarto giro: il grafico 1 (05/10/2026)
Danilo: «le linee grigie degli sprint passati non si distinguono fra loro e si incrociano con la previsione, e tutto è schiacciato a zero, lo sprint di oggi quasi non si vede». Tre varianti del solo grafico 1, fila «Grafico 1» del documento, generate da `gen3.py` (si lancia dopo `gen.py` e `gen2.py`).
- In tutte: lo zero non sta più sul bordo inferiore (la scala parte da −0,16), il punto di oggi è grande con alone e scritta «oggi · 0 €», «pareggio» è scritto dentro il grafico.
- G1A Arrivi a destra: ogni linea grigia porta il nome del suo sprint; la previsione non attraversa più il grafico, diventa tre punti blu in una colonna a destra (ottimo 0,98, medio 0,34, pessimo 0).
- G1B Quattro riquadri: un riquadro per sprint (5, 12, 13) sulla stessa scala, lo Sprint 15 con il ventaglio in un riquadro largo.
- G1C Una alla volta: resta il ventaglio blu, degli sprint passati se ne vede uno per volta, scelto con tre pulsanti.

Scelta di Danilo: in attesa.

## Scelta del grafico e fila «Redesign» (06/10/2026)
Danilo: «G1A è il migliore». La variante «Arrivi a destra» passa sui tre grafici, generata da `gen4.py` (si lancia dopo `gen.py`, `gen2.py` e `gen3.py`).
- Grafico 2: zero staccato dal bordo, sprint chiusi in grigio con il valore scritto sui due diversi da zero, previsioni come punto blu su una linea tratteggiata dal pessimo all'ottimo, Sprint 15 con l'alone.
- Grafico 3: zero staccato dal bordo, nome su ogni linea grigia, valore di oggi con alone e scritta «oggi · 42,4 fuori scala».
- Fila «Redesign», sei tavole: 1 Home, 2 Caricamento, 3 Errore, 4 Sprint vuoto, 5 Passaggio mouse, 6 Finestra stretta (820 px, sotto la soglia di 900 px del CSS di oggi).
- Canvas: «Redesign» a y 1300, «Proposte» a y 2600, «Grafico 1» a y 3900.

Scelte mie, da confermare:
- Errore: titolo e messaggio sono quelli del codice di oggi; il pulsante «Aggiorna» dentro la scheda è nuovo (oggi sta solo nell'intestazione).
- Sprint vuoto: al posto del numero un trattino e «nessuna spesa ancora in questo sprint».
- Passaggio del mouse su una linea grigia: le altre due si attenuano; il riquadro dice sprint, giorno e valore, senza spesa né paganti perché quei dati non sono in `gen.py`.
- Caricamento: sagome al posto di numeri e grafici, titoli già scritti, «Caricamento…» accanto allo sprint.

Approvazione di Danilo: in attesa. `public/internal/` non è stato toccato.

## Le prove contano (06/10/2026)
Danilo: «basta che diamo peso alle prove perché sono ORO le prove, senza dove andiamo, sembra qui che non esistono». Poi: «le prove valgono per il pagato tanto quant'è il loro tasso di fine prova. Quindi se uno disdice non vale come prova. Basiamoci su quel tasso, che diventa anche uno dei grafici principali». E: «Puoi mettere più grafici nella home, non solo 3: dei 10 che hai fatto prima ne hai tenuti 3».

Dati letti da Supabase il 06/10/2026 (`play_token_facts`, `play_purchases`, `sprints`, `meta_ads_insights_daily`):
- Tasso di fine prova = prove finite che hanno pagato / prove finite = 5 su 8 = 62,5%. Il 37,7% usato prima era una media di settore, non un dato nostro.
- Per sprint (utente assegnato per primo accesso): S5 2 su 2, S11 0 su 1, S12 2 su 2 con 2 ancora aperte di cui 1 disdetta, S13 1 su 1, S14 0 su 1 con 2 aperte, S15 2 aperte. Due prove non hanno un primo accesso in nessuno sprint: una disdetta e finita, una aperta.
- Prova disdetta = rinnovo automatico spento in `play_purchases`: vale zero. Due prove disdette con scadenza già passata risultano ancora attive in `play_token_facts`: le conto come finite senza pagamento.
- Prove aperte oggi: 7, di cui 1 disdetta. Scadenze: 06/10 una, 07/10 una, 08/10 la disdetta, 09/10 una, 12/10 tre.
- Stima = (pagato + prove aperte non disdette × 62,5% × 20,90 €) / spesa. Sprint 15: 2 × 62,5% × 20,90 / 4,72 = 5,54 € per euro, fuori scala. Sprint 14: 26,13 / 154,69 = 0,17, al massimo 0,27.
- Pareggio del grafico 3: 100 / (20,90 × 62,5%) = 7,7 prove ogni 100 € (prima 12,7).

Home a cinque grafici, generata da `gen4.py`: 1 in alto a tutta larghezza; sotto «Prove che poi pagano» (il 5 della bozza) e «Prove in scadenza» (il 7); sotto ancora «Prove avviate ogni 100 €» (il 3) e «Sprint dopo sprint» (il 2). Tavole alte 1236 px, finestra stretta 1924 px. Canvas: «Proposte» a y 3700, «Grafico 1» a y 5000.

Scelte mie, da confermare:
- Alle prove aperte non disdette applico il 62,5%, che contiene già le disdette: la stima è prudente.
- Fuori dalla Home i grafici 4 (funnel), 8 (download) e 9 (ritorni), perché hanno già la loro sezione; 6 e 10 sono in euro e vanno in Economy.
- La colonna «dove può finire» del grafico 1 nasce ancora dagli sprint 5, 12 e 13.
- Nessuna spesa minima sotto cui nascondere la stima: con 4,72 € il 5,54 è rumore.
- Sprint 12: i due pagamenti sono arrivati ai giorni 19 e 22, oltre i 16 del grafico, quindi nei grafici 1 e 2 resta a zero.

## Quinto giro: tre direzioni per pochi dati (06/10/2026)
Danilo sulla Home a cinque grafici: «i grafici sono quasi vuoti e pieni di scritte, e la freccia fuori scala è bruttissima». Regola nuova: nessun valore disegnato fuori dall'asse, in nessun grafico; se la stima non sta nella scala perché la spesa è troppo bassa, non si disegna e resta solo come numero.
Poi, guardando «Prove che poi pagano»: «non rispettano le regole, cioè la legenda fuori e i grafici puliti… sono letteralmente punti in un piano, non è un grafico e non c'è nessuna funzione». Quindi: nessuna scritta dentro l'area del grafico, e ogni grafico è una curva nel tempo.
Sul grafico 1: prima ha proposto due pulsanti «Prove» e «Pagato», poi li ha tolti («con l'ultima cosa che ti ho detto non serve»). Vale questo: «nel primo grafico dovresti fare già una tracciatura stimata sulla base del completamento della prova secondo il nostro tasso di conversione applicato alle prove presenti, così siamo un grafico, mentre gli altri sprint mostrano il dato reale».

Dati nuovi letti da Supabase il 06/10/2026: date di avvio e di fine di ogni prova (`play_token_facts`) e spesa giorno per giorno (`meta_ads_insights_daily`, `breakdown_key = 'total'`). Stanno in testa a `gen5.py`.
- Tasso di fine prova nel tempo: 100% fino al 20/09, 66,7% il 21/09, 75% il 25/09, 80% il 28/09, 83,3% il 01/10, 62,5% dal 03/10.
- Prove avviate in tutto 15, pagate 5; stima a fine 12/10: 8,75 paganti.
- Rientro dal 07/09: 76,50 € pagati su 515,30 € spesi = 0,15 € per euro; 0,30 € contando le 6 prove aperte.

Spesa futura dello Sprint 15, scelta di Danilo: il ritmo dello Sprint 14 (154,69 € in 7 giorni, 22,10 € al giorno) fino al giorno 9. Le 2 prove finiscono al giorno 9: 2 × 62,5% × 20,90 € / 159,42 € = 0,16 € per euro, che sta nella scala.

Fila «Direzioni» (y 1300, le altre file scese di 1500), generata da `gen5.py`. In tutte c'è «Lo sprint, giorno per giorno»: Sprint 5, 12 e 13 reali, Sprint 15 pagato fino a oggi e poi traccia stimata tratteggiata blu.
- 2A Tre numeri: tre numeri grandi e un solo grafico, lo sprint giorno per giorno.
- 2B Tasso al centro: il 62,5% enorme a sinistra, la curva del tasso grande, sotto i paganti attesi e lo sprint.
- 2C Curve in colonna: tasso, paganti attesi e sprint una sopra l'altra, numeri a sinistra.

Scelte mie, da confermare:
- Tasso e paganti attesi hanno l'asse X sui giorni di calendario dal 07/09 al 12/10, non sui giorni dello sprint: così le 15 prove fanno una curva.
- La traccia stimata conta solo le 2 prove già avviate nello Sprint 15, non quelle che arriveranno.
- Gli sprint passati si distinguono per tratto (Sprint 5 pieno chiaro, Sprint 12 puntinato, Sprint 13 pieno scuro) e per nome solo in legenda.
- Al passaggio del mouse il valore compare in una pillola fuori dal grafico, con una riga verticale sottile dentro.

Scelta di Danilo: in attesa.

Correzione di Danilo (06/10/2026): «Perché fai partire tutto dal giorno 8? Considera pagato dal giorno 0, se lo stai considerando tale al tasso di conversione». La prova vale dal giorno in cui parte, non dal giorno in cui finisce. Traccia dello Sprint 15: giorno 3 0,97, giorno 4 0,53, poi 0,37, 0,28, 0,23, 0,19, giorno 9 0,16 e piatta. Il giorno 2 (5,54 con 4,72 € spesi) non sta nella scala e non si disegna. La curva scende perché la spesa futura cresce e le prove contate restano le 2 già avviate.

Danilo sul grafico del tasso di fine prova giorno per giorno (06/10/2026): «è un buon grafico». Resta così nella direzione scelta.

Prove future nella traccia (06/10/2026). Danilo: «servirebbe una ipotesi basata sullo sprint precedente e l'andamento dell'attuale». Scelta mia, da confermare: le prove attese per euro sono quelle dello Sprint 14 e dello Sprint 15 messe insieme, (3 + 2) / (154,69 + 4,72 €) = 3,1 prove ogni 100 €. Prove attese = 2 già avviate + 3,1 ogni 100 € di spesa che manca: 6,9 al giorno 9. Traccia: giorno 3 1,31, poi 0,90, 0,75, 0,67, 0,62, 0,59, giorno 9 0,56 e piatta. Scala del grafico dello sprint allargata a 1,50 € perché il giorno 3 ci stia. Limite: le 2 prove su 4,72 € dello Sprint 15 pesano molto; con il solo Sprint 14 (1,9 prove ogni 100 €) il giorno 9 darebbe circa 0,41.

Danilo su 2B (06/10/2026): «è palesemente una schermata di dettaglio del tasso di fine prova… mi pare di capire che ci muoveremo anche così». Quindi 2B non è la Home: diventa la schermata di dettaglio che si apre dal tasso di fine prova. Il perimetro si allarga a una Home più le schermate di dettaglio dei suoi numeri. La Home si sceglie fra 2A e 2C: in attesa.

Richiesta di Danilo sul grafico dello sprint (06/10/2026): «perché non consideri anche le passate allo stesso modo di oggi? Con la stima delle prove che poi si allineano ai grafici reali?». Da fare: anche gli sprint passati con pagato più prove aperte pesate, giorno per giorno. Non ancora nelle tavole: servono lo sprint di primo accesso di ogni prova e la spesa dello Sprint 5.

Fatto (06/10/2026): gli sprint passati usano la stessa formula di quello in corso, (pagato + prove aperte × 62,5% × 20,90 €) / spesa, giorno per giorno; tratteggiato dove ci sono prove aperte, pieno dove il dato è reale. Prove assegnate allo sprint per primo accesso (`events`, `first_open`). Sprint 5: 0,31 al giorno 3, 0,61 dal 4, 0,80 al 10, 0,98 dall'11. Sprint 13: 0,21 dal giorno 4, 0,34 dall'11. Sprint 12: 0,04–0,09, a fine dei 16 giorni ha ancora 2 prove aperte (pagate ai giorni 19 e 22). Scelte mie: tasso di oggi anche per il passato; Sprint 12 in grigio chiaro `#d1d5db`, che non è nel design system.

Danilo sul grafico dello sprint con gli sprint passati stimati (06/10/2026): «Così è davvero ottimo, questo grafico ci dice proprio l'andamento del dato più importante, cioè quanto guadagniamo e se le prove vanno bene per farci guadagnare o no». Due richieste, fatte:
- segnare con una zona la fine stimata della pubblicità: dal giorno 9 il fondo è più chiaro, voce «pubblicità finita» in legenda;
- 2A senza i tre numeri: lo sprint in alto a tutta larghezza, sotto «Prove che poi pagano» e «Paganti attesi». La tavola ora si chiama «2A - Sprint in alto» (il file resta `dir-A-tre-numeri.dc.html`; il titolo nel canvas pubblicato è ancora quello vecchio).
Scelta mia: ogni scheda tiene un numero piccolo sotto il titolo.

Sette grafici nella 2A (06/10/2026). Danilo ha chiesto l'elenco in ordine di importanza e poi: «Vai mettili tutti». Tavola alta 1596 px, file sotto scese di altri 800. Ordine: 1 lo sprint giorno per giorno (in alto, largo); 2 prove che poi pagano; 3 prove avviate ogni 100 € (pareggio 7,7; Sprint 15 stimato 10,0 al giorno 3 e 4,3 a fine pubblicità; il giorno 2 a 42,4 non si disegna); 4 paganti attesi; 5 sprint dopo sprint (reale fino a S13, stima S14 0,17 e S15 0,56); 6 prove non disdette (11 su 15 = 73%); 7 prove ogni 100 primi accessi (0,7 dal 07/09).
Dati nuovi da Supabase: primi accessi per giorno (`events`, `first_open`, esclusi `kpi_excluded_users`) e disdette (`play_purchases`).
Limiti da dire a Danilo:
- «Prove non disdette» conta per giorno di avvio della prova, perché la data della disdetta non c'è in modo affidabile (`updated_at` cambia anche per altri eventi). Le prove recenti possono ancora disdire.
- In `events` ci sono primi accessi con data futura (dal 08/10 al 26/10): non li ho contati. Da capire.
- Nel grafico 3 gli sprint passati sono 5, 12 e 13 come nel grafico 1; manca lo Sprint 14.

Danilo (06/10/2026): «Prove non disdette non ha senso». Tolto dalla 2A: restano sei grafici, «Prove ogni 100 primi accessi» chiude la pagina a tutta larghezza. Non riproporlo.

## Approvazione (06/10/2026)
Danilo sulla 2A a sette grafici: «dovremmo fermarci qui per oggi e implementare TUTTO, cioè facciamo la Home nuova, chiamala "Stats" non Home, e mettiamoci questi grafici con query vere per i dati. Posso scegliere il mio sprint da "Sprint 15 · giorno 3 di 16": da lì si sceglie lo sprint».
- La tavola approvata è `dir-A-tre-numeri.dc.html` («2A - Sprint in alto», versione 21 del documento).
- La pagina si chiama «Stats», non «Home».
- La pillola dello sprint diventa il selettore dello sprint.
- I dati vengono da query vere, non dai numeri scritti in `gen5.py`.
- Danilo ha scritto «giorno 3 di 26»: lo leggo come 16, da confermare.
`public/internal/` non è ancora stato toccato.
