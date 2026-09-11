// Guide scritte con il modello "Articolo" (src/pages/Articolo.jsx): basta aggiungere una voce qui
// e la pagina compare da sola in /guide, nel footer, nella sitemap, nel feed e in llms.txt.
// Regole di scrittura: tono da amico che capisce il problema, niente promesse di trasformazione,
// niente trattini lunghi, niente "senza attrezzi" come vanto, numeri coerenti con src/site.js.
// image: nome base in /images/opt. imageKind "photo" (480/800/1200) o "app" (screenshot 360/720).

export const articoli = [
  {
    slug: "tornare-ad-allenarsi-dopo-tanto-tempo",
    category: "Ripartire",
    title: "Tornare ad allenarsi dopo tanto tempo: da dove si comincia",
    seoTitle: "Tornare ad allenarsi dopo tanto tempo: da dove cominciare",
    description: "Sono passati mesi o anni? Da dove ripartire senza farsi male e senza mollare dopo una settimana: durata, frequenza, cosa aspettarsi i primi giorni.",
    lead: "Sono passati mesi, forse anni. Il problema non è la voglia: è che ogni volta che ci pensi ti sembra una montagna. Ecco come si riparte in modo realistico, e cosa aspettarsi la prima settimana.",
    readTime: "5 min",
    published: "2026-09-09",
    modified: "2026-09-09",
    image: "app-percorso",
    imageKind: "app",
    imageAlt: "Il percorso a tappe di Hypemove: una tappa al giorno per ripartire",
    sections: [
      {
        h2: "Prima regola: non ripartire da dove eri",
        p: [
          "L'errore più comune di chi ricomincia è pensare al livello di prima. Quello che facevi due anni fa non conta più: il corpo si adatta in fretta, in tutte e due le direzioni. Chi riparte come se non si fosse mai fermato dura tre giorni, poi i dolori e la frustrazione fanno il resto.",
          "Il punto di partenza giusto è più basso di quello che ti sembra ragionevole. Se pensi che 10 minuti siano pochi, sono probabilmente giusti.",
        ],
      },
      {
        h2: "La prima settimana: corta, facile, tutti i giorni",
        p: [
          "Nei primi giorni l'obiettivo non è allenarsi bene. È allenarsi e basta, e ritrovarsi il giorno dopo con la voglia di rifarlo. Vuol dire sessioni da 5 a 10 minuti, esercizi che conosci, nessun finale da stremati.",
          "Meglio 5 minuti sei giorni su sette che 40 minuti il lunedì e poi silenzio. La frequenza costruisce l'abitudine; l'intensità arriva dopo, da sola.",
        ],
        ul: [
          "Giorni 1-3: 5 minuti, movimenti semplici (squat al muro, ponte glutei, camminata sul posto, allungamenti).",
          "Giorni 4-7: 8-10 minuti, aggiungi un esercizio per la parte alta (piegamenti al muro o su un tavolo) e uno per l'addome.",
          "Settimana 2: 10-15 minuti, tre o quattro esercizi a giro, due giri.",
        ],
      },
      {
        h2: "Cosa aspettarsi (così non ti spaventi)",
        p: [
          "Il secondo e il terzo giorno avrai i muscoli indolenziti. È normale e passa: si chiama indolenzimento a insorgenza ritardata, e non è un segno che hai fatto qualcosa di sbagliato. Muoverti un po', anche solo camminare, aiuta più che stare fermi.",
          "Se invece senti un dolore acuto, localizzato, che peggiora col movimento, quello non è indolenzimento: fermati e chiedi a un professionista.",
        ],
      },
      {
        h2: "Il trucco vero: togliere le decisioni",
        p: [
          "Chi riparte da solo deve decidere ogni giorno cosa fare, quanto, quando. Ogni decisione è un'occasione per rimandare. Per questo funzionano i percorsi a tappe: apri, trovi la tappa di oggi, la fai. Niente da scegliere, niente da pianificare.",
          "Hypemove è costruita così: dici il tuo obiettivo e quanto tempo hai, e ogni giorno trovi una tappa da 5 a 15 minuti, con il video di ogni esercizio. Gli allenamenti li scrive un chinesiologo, e il percorso sale poco alla volta.",
        ],
      },
      {
        h2: "Se salti un giorno",
        p: [
          "Succederà. La differenza tra chi continua e chi molla non è quante volte salta, ma cosa fa il giorno dopo. Chi pensa \"ormai ho rotto la serie\" riparte lunedì, cioè mai. Chi pensa \"oggi faccio la tappa\" è già a posto.",
          "Per questo in Hypemove conta la settimana, non il giorno perfetto: quattro allenamenti in sette giorni tengono viva la costanza anche se uno lo salti.",
        ],
      },
    ],
    faq: [
      { q: "Dopo quanto tempo fermi si perde la forma?", a: "Le prime differenze si sentono dopo due o tre settimane di stop; dopo qualche mese il corpo è tornato vicino al punto di partenza. La buona notizia è che si riadatta con la stessa velocità: le prime settimane di ripresa portano progressi rapidi." },
      { q: "Devo fare un controllo medico prima di ricominciare?", a: "Se hai più di 40 anni, una patologia, un dolore che dura o non ti alleni da anni, una visita è una buona idea. Per allenamenti brevi a corpo libero il rischio è basso, ma il parere di un medico toglie ogni dubbio." },
      { q: "Meglio camminare o fare esercizi?", a: "Tutte e due. Camminare è il modo più facile per muoversi ogni giorno; qualche esercizio di forza, anche 5 minuti, mantiene muscoli e articolazioni in salute. Alternarli è la scelta più sostenibile." },
    ],
  },
  {
    slug: "quanti-minuti-di-esercizio-al-giorno",
    category: "Poco tempo",
    title: "Quanti minuti di esercizio al giorno servono davvero",
    seoTitle: "Quanti minuti di esercizio al giorno servono davvero (e quanti bastano per iniziare)",
    description: "Le linee guida dicono 150 minuti a settimana. Cosa vuol dire al giorno, perché anche 5 minuti contano, e come arrivarci senza stravolgere la giornata.",
    lead: "Le linee guida parlano di 150 minuti a settimana. Sembrano tanti, ma divisi per sette fanno poco più di 20 minuti al giorno. E per iniziare ne bastano molti meno.",
    readTime: "4 min",
    published: "2026-09-09",
    modified: "2026-09-09",
    image: "app-esercizio",
    imageKind: "app",
    imageAlt: "Un esercizio guidato di Hypemove con il conto alla rovescia",
    sections: [
      {
        h2: "Cosa dicono le linee guida",
        p: [
          "L'Organizzazione Mondiale della Sanità consiglia agli adulti da 150 a 300 minuti a settimana di attività moderata (camminata veloce, bici tranquilla, allenamenti leggeri), oppure da 75 a 150 di attività intensa, più due giorni di esercizi di forza. Dal 2020 è sparita la vecchia regola dei blocchi minimi da 10 minuti: conta tutto il movimento, anche a pezzi piccoli.",
          "Tradotto: 20-25 minuti al giorno di movimento moderato, in qualsiasi forma, raggiungono la soglia. E non devono essere tutti insieme.",
        ],
      },
      {
        h2: "Perché 5 minuti non sono \"niente\"",
        p: [
          "Il ragionamento \"se non ho mezz'ora non vale la pena\" è quello che tiene ferme più persone di qualsiasi altra cosa. Cinque minuti di esercizi a corpo libero alzano il battito, muovono le articolazioni e, soprattutto, mantengono viva l'abitudine. Il valore dei cinque minuti non è nei cinque minuti: è nel fatto che domani ne fai altri cinque.",
          "C'è anche un effetto pratico che chi si allena conosce bene: si entra \"per 5 minuti\" e spesso si continua. Il primo minuto è quello difficile, non l'ultimo.",
        ],
      },
      {
        h2: "Quanto serve in base a dove sei",
        ul: [
          "Parti da zero o riprendi dopo tanto: 5-10 minuti al giorno per due settimane. L'obiettivo è la regolarità, non la fatica.",
          "Ti muovi un po' ma senza costanza: 10-15 minuti al giorno, con due o tre giorni in cui aggiungi una camminata veloce.",
          "Sei già regolare e vuoi risultati: 20-30 minuti, con almeno due sessioni di forza a settimana e il resto di attività che ti piace.",
        ],
      },
      {
        h2: "Come arrivare a 150 minuti senza stravolgere la giornata",
        p: [
          "Una tappa da 10 minuti al giorno fa 70 minuti a settimana. Aggiungi tre camminate veloci da 20 minuti (per andare al lavoro, in pausa pranzo, dopo cena) e sei a 130. Con una tappa da 15 minuti al posto di una da 10, ci sei.",
          "Il modo più semplice per non doverci pensare è avere ogni giorno la tappa già decisa. Hypemove funziona così: scegli tra 5, 10 e 15 minuti, e ogni giorno trovi l'allenamento pronto, con il video degli esercizi e una voce che ti guida. Nei giorni pieni fai la versione corta: conta lo stesso.",
        ],
      },
    ],
    faq: [
      { q: "Bastano 10 minuti al giorno per dimagrire?", a: "Da soli no, ma contano. Il peso dipende soprattutto da quanto mangi rispetto a quanto consumi; 10 minuti di esercizio al giorno alzano un po' il consumo e, cosa più importante, ti mantengono in movimento e ti fanno scegliere meglio anche a tavola." },
      { q: "È meglio un allenamento lungo a settimana o tanti brevi?", a: "Per la salute e per l'abitudine, tanti brevi. Una sessione lunga ogni tanto va bene se ti piace, ma il corpo risponde meglio a stimoli frequenti, e la costanza si costruisce con la ripetizione." },
      { q: "Camminare conta come esercizio?", a: "Sì, se il passo è abbastanza veloce da farti respirare più forte. È attività moderata a tutti gli effetti e rientra nei 150 minuti." },
    ],
  },
  {
    slug: "perche-smetto-sempre-di-allenarmi",
    category: "Costanza",
    title: "Perché smetti sempre di allenarti (e come uscire dal giro)",
    seoTitle: "Perché smetti sempre di allenarti e come uscire dal giro inizio-mollo",
    description: "Inizi carica, dopo due settimane hai mollato. Non è mancanza di volontà: sono quattro meccanismi precisi. Come riconoscerli e cosa cambiare.",
    lead: "Inizi il lunedì, carica. Dopo dieci giorni hai saltato due volte, poi tre, poi basta. Non è mancanza di volontà: sono meccanismi precisi, e si possono smontare uno per uno.",
    readTime: "5 min",
    published: "2026-09-09",
    modified: "2026-09-09",
    image: "workout",
    imageKind: "photo",
    imageAlt: "Persona che si allena in salotto con calma",
    sections: [
      {
        h2: "1. Parti troppo in alto",
        p: [
          "Il primo giorno hai energia e ambizione, e scegli un programma da 40 minuti quattro volte a settimana. Il programma è pensato per la persona che eri il primo giorno, non per quella che torna a casa stanca il giovedì. Quando il programma chiede più di quello che hai, salta il programma.",
          "Cosa cambiare: scegli un piano che regga nella tua settimana peggiore, non in quella migliore. Se nella settimana peggiore hai 5 minuti, il piano deve funzionare con 5 minuti.",
        ],
      },
      {
        h2: "2. Devi decidere ogni volta",
        p: [
          "Cosa faccio oggi? Gambe o addome? Quanto? Con cosa? Ogni domanda è una piccola porta da cui si esce. Le persone che intervistiamo lo dicono tutte allo stesso modo: la mattina l'intenzione c'è, la sera è morta. Non per un dramma, per stanchezza mentale.",
          "Cosa cambiare: togli le decisioni. Un percorso a tappe, dove ogni giorno c'è una cosa sola da fare, elimina il momento in cui rimandi.",
        ],
      },
      {
        h2: "3. Il giorno saltato diventa la fine",
        p: [
          "Salti un giorno, e la testa dice \"ormai\". La serie è rotta, tanto vale ricominciare lunedì. Il lunedì diventa il mese prossimo. È il pensiero tutto-o-niente, ed è il killer numero uno della costanza.",
          "Cosa cambiare: misura la settimana, non il giorno. Quattro allenamenti su sette sono un'ottima settimana anche se non sono consecutivi. Chi guarda la settimana non ha mai la serie rotta.",
        ],
      },
      {
        h2: "4. Non vedi niente cambiare",
        p: [
          "I risultati sul corpo arrivano dopo settimane. Se l'unica ricompensa è lo specchio, per un mese non ne hai nessuna, e senza ricompensa l'abitudine non si forma.",
          "Cosa cambiare: rendi visibile il progresso subito. Contare i giorni di fila, gli allenamenti fatti, gli esercizi nuovi imparati. Sembra un dettaglio, ed è invece il motivo per cui certe app riescono a farti tornare: il progresso si vede prima del risultato.",
        ],
      },
      {
        h2: "Come è fatta Hypemove, visto che ne parliamo",
        p: [
          "Hypemove è nata esattamente da questi quattro punti: tappe da 5 a 15 minuti che stanno anche nella settimana peggiore, una tappa al giorno senza niente da decidere, la costanza misurata sulla settimana, e punti, giorni di fila e premi che rendono visibile ogni passo. Gli allenamenti li scrive un chinesiologo. Si usa gratis.",
        ],
      },
    ],
    faq: [
      { q: "Quanto ci vuole perché allenarsi diventi un'abitudine?", a: "Gli studi parlano di una media intorno ai due mesi, con grandi differenze tra persone: da tre settimane a diversi mesi. Più l'azione è piccola e ripetuta ogni giorno, più il tempo si accorcia." },
      { q: "Ha senso allenarsi se non ho voglia?", a: "Sì, ed è proprio lì che si costruisce la costanza. Il trucco è abbassare l'asticella: nei giorni senza voglia fai la versione da 5 minuti. Contare conta più di quanto fai." },
    ],
  },
  {
    slug: "motivazione-o-abitudine",
    category: "Costanza",
    title: "Motivazione o abitudine: cosa ti fa continuare davvero",
    seoTitle: "Motivazione o abitudine nel fitness: cosa ti fa continuare davvero",
    description: "La motivazione va e viene, l'abitudine resta. Come si costruisce un'abitudine di movimento che regge anche nelle settimane storte, con esempi concreti.",
    lead: "Chi si allena da anni non è più motivato di te. Ha solo smesso di avere bisogno della motivazione. La differenza tra le due cose è tutto quello che serve sapere.",
    readTime: "4 min",
    published: "2026-09-09",
    modified: "2026-09-09",
    image: "homeworkout",
    imageKind: "photo",
    imageAlt: "Donna che si allena in casa la mattina",
    sections: [
      {
        h2: "La motivazione è un'emozione, e le emozioni passano",
        p: [
          "La motivazione è quella spinta che senti dopo un video, una foto, una frase giusta. È vera, ma è un'emozione: sale, scende, e non si comanda. Costruire un'abitudine sulla motivazione è come costruire una casa sul meteo.",
          "L'abitudine è il contrario: è un'azione che fai senza doverla decidere. Ti lavi i denti anche nei giorni in cui non hai voglia, perché non passa dalla voglia. L'obiettivo è portare il movimento lì.",
        ],
      },
      {
        h2: "Come si forma un'abitudine (davvero)",
        ul: [
          "Un segnale sempre uguale: dopo il caffè, appena rientri, prima della doccia. Il momento conta più dell'orario.",
          "Un'azione piccola: così piccola che non ha senso rifiutarla. Cinque minuti, non quaranta.",
          "Una ricompensa immediata: spuntare il giorno, vedere i giorni di fila salire, sentire che la tappa è fatta. Il corpo cambia dopo, la testa ha bisogno di qualcosa oggi.",
          "Ripetizione: sempre la stessa sequenza, finché il segnale da solo fa partire l'azione.",
        ],
      },
      {
        h2: "Il momento in cui si rompe",
        p: [
          "Le abitudini si rompono nei periodi eccezionali: la settimana di consegne, le vacanze, un'influenza. Non si rompono perché sei debole, si rompono perché il segnale sparisce. Rientri, e la sequenza non c'è più.",
          "La soluzione non è avere più forza di volontà al rientro: è avere una versione minima dell'abitudine, da 5 minuti, che riattacchi la sequenza senza chiedere niente. Il primo giorno dopo la pausa non deve essere un buon allenamento. Deve solo esistere.",
        ],
      },
      {
        h2: "Dove entra un'app, e dove no",
        p: [
          "Un'app non ti dà la motivazione, e se te la promette, diffida. Quello che può fare è togliere le decisioni (la tappa di oggi è già lì), dare la ricompensa immediata (punti, giorni di fila, un baule che si apre) e reggere i rientri senza farti sentire in colpa. Hypemove è costruita su questo, ed è il motivo per cui la costanza si misura sulla settimana e non sul giorno perfetto.",
        ],
      },
    ],
    faq: [
      { q: "Devo allenarmi ogni giorno per creare l'abitudine?", a: "Nelle prime settimane aiuta molto: la ripetizione quotidiana forma l'automatismo più in fretta. Non deve essere un allenamento vero ogni giorno: anche 5 minuti di movimento mantengono la sequenza." },
      { q: "E se la motivazione torna? La uso?", a: "Certo. Quando c'è, fai di più: una tappa da 15 minuti invece di 5, una camminata in più. Ma il minimo quotidiano non deve dipendere da lei." },
    ],
  },
  {
    slug: "allenamento-e-alimentazione-da-dove-iniziare",
    category: "Alimentazione",
    title: "Allenamento e alimentazione: da dove iniziare se parti da zero",
    seoTitle: "Allenamento e alimentazione insieme: da dove iniziare se parti da zero",
    description: "Muoversi di più e mangiare meglio insieme, senza diete rigide e senza contare tutto: tre cambiamenti piccoli che reggono nel tempo, e come tenerli d'occhio.",
    lead: "Vuoi rimetterti in forma e ti sembra di dover cambiare tutto insieme: allenarti, mangiare diverso, dormire meglio. Il modo per non mollare dopo due settimane è fare meno cose, ma tutte tenibili.",
    readTime: "5 min",
    published: "2026-09-09",
    modified: "2026-09-09",
    image: "app-coach-calorie",
    imageKind: "app",
    imageAlt: "Il Coach AI di Hypemove riconosce un piatto da una foto e segna le calorie",
    sections: [
      {
        h2: "Perché le due cose vanno insieme",
        p: [
          "Il movimento e il cibo lavorano sullo stesso conto: quanta energia entra e quanta ne esce. Ma non è solo aritmetica. Chi si allena tende a mangiare meglio senza sforzo, perché ha appena fatto qualcosa di buono per sé e non vuole \"sprecarlo\". E chi mangia in modo regolare ha l'energia per allenarsi. Le due abitudini si sostengono a vicenda.",
          "Il contrario è vero: una dieta rigida senza movimento fa perdere anche muscolo, e l'allenamento senza attenzione al cibo produce risultati lenti che scoraggiano.",
        ],
      },
      {
        h2: "Da dove iniziare: tre cambiamenti, non trenta",
        ul: [
          "Muoviti ogni giorno, anche poco: una tappa da 5 a 15 minuti. È il cambiamento che rende più facili gli altri due.",
          "Guarda cosa mangi prima di cambiarlo: per una settimana osserva soltanto, senza giudicare. La maggior parte delle persone scopre due o tre abitudini che pesano più di tutto il resto (il dolce serale, le bevande zuccherate, le porzioni doppie).",
          "Cambia una cosa sola alla volta: una porzione più piccola di pasta, acqua al posto della bibita, verdura in più a cena. Quando è diventata normale, passa alla successiva.",
        ],
      },
      {
        h2: "Contare le calorie sì o no",
        p: [
          "Contare tutto, sempre, per la maggior parte delle persone dura due settimane e poi diventa un peso. Avere però un'idea di quanto vale un piatto è utilissimo, soprattutto all'inizio, quando le porzioni si stimano male. Il compromesso che funziona: qualche giorno di osservazione, con uno strumento veloce, per tarare l'occhio. Poi si va a memoria.",
          "In Hypemove il Coach AI fa proprio questo: fotografi il piatto e lui segna proteine, carboidrati, grassi e calorie. È una stima, non una bilancia, ma bastano pochi giorni per capire dove finisce l'energia in più.",
        ],
      },
      {
        h2: "Cosa mangiare intorno all'allenamento",
        p: [
          "Per una tappa da 10 minuti non serve niente di speciale: non devi mangiare prima, non devi \"integrare\" dopo. Vale la regola generale: un pasto normale ogni tre o quattro ore, con una fonte di proteine (uova, legumi, pesce, carne, latticini) a ogni pasto, che aiuta i muscoli a riprendersi e tiene lontana la fame.",
          "Se ti alleni la mattina a stomaco vuoto e ti gira la testa, un frutto prima basta. Se ti alleni la sera, la cena normale dopo va benissimo.",
        ],
      },
      {
        h2: "Quando chiedere a un professionista",
        p: [
          "Se hai una patologia, prendi farmaci, sei in gravidanza, hai avuto disturbi alimentari o devi perdere molto peso, un dietista o un medico è la strada giusta. Un'app aiuta a tenere d'occhio le abitudini, non sostituisce chi ti conosce.",
        ],
      },
    ],
    faq: [
      { q: "Devo fare una dieta per vedere risultati dall'allenamento?", a: "No. Con l'allenamento regolare il corpo cambia anche mangiando come prima, solo più lentamente. Piccole correzioni all'alimentazione accelerano le cose; una dieta rigida di solito le interrompe, perché non regge." },
      { q: "Quante calorie brucia un allenamento da 10 minuti?", a: "Dipende da peso, intensità ed esercizi: per un allenamento a corpo libero moderato si va indicativamente da 50 a 100 calorie. Il valore vero non è nel consumo di quei 10 minuti, ma nell'abitudine che costruiscono." },
      { q: "Le proteine servono anche se non voglio i muscoli?", a: "Sì. Servono a mantenere la massa muscolare che hai, a riprenderti dagli allenamenti e a sentirti sazia più a lungo. Non fanno diventare \"grossi\": per quello servono anni di allenamento specifico." },
    ],
  },
  {
    slug: "contare-le-calorie-con-una-foto",
    category: "Alimentazione",
    title: "Contare le calorie con una foto: come funziona e quanto è preciso",
    seoTitle: "Contare le calorie con una foto: come funziona e quanto è preciso",
    description: "Le app che stimano le calorie da una foto del piatto: cosa fanno davvero, dove sbagliano, quando sono utili e come usarle senza ossessionarsi.",
    lead: "Fotografi il piatto e l'app ti dice quante calorie ci sono. Sembra magia, e in parte lo è: ecco cosa succede davvero, quanto ci si può fidare e a cosa serve.",
    readTime: "4 min",
    published: "2026-09-09",
    modified: "2026-09-09",
    image: "app-coach-calorie",
    imageKind: "app",
    imageAlt: "Foto di un piatto con proteine, carboidrati, grassi e calorie stimate dal Coach AI",
    sections: [
      {
        h2: "Cosa fa l'app quando fotografi il piatto",
        p: [
          "Un modello di intelligenza artificiale guarda la foto e riconosce gli alimenti: riso, pollo, avocado, verdure. Poi stima la quantità di ciascuno dalle proporzioni nel piatto e la converte in valori nutrizionali usando tabelle standard. Il risultato è una stima di proteine, carboidrati, grassi e calorie totali.",
          "Il passaggio difficile è il secondo: capire quanto riso c'è da una foto. Un piatto fondo, una porzione ammucchiata, un condimento invisibile cambiano il risultato.",
        ],
      },
      {
        h2: "Quanto è preciso",
        p: [
          "Abbastanza per farsi un'idea, non abbastanza per una dieta al grammo. Su piatti semplici e ben visibili l'errore è di solito contenuto; su piatti complessi, salse, fritti e porzioni nascoste può essere maggiore. La stessa cosa vale per il conteggio manuale, dove l'errore più grande lo fa la persona quando stima la porzione a occhio.",
          "Il modo giusto di leggerla: \"questo piatto vale circa 500-600 calorie\", non \"552\". Per capire dove finisce l'energia in più nella giornata è più che sufficiente.",
        ],
      },
      {
        h2: "A cosa serve davvero",
        ul: [
          "Tarare l'occhio: dopo qualche giorno sai quanto vale il tuo piatto di pasta abituale, e non hai più bisogno di fotografarlo.",
          "Scoprire le sorprese: il condimento, la seconda porzione, la merenda \"leggera\" che pesa come un pasto.",
          "Non abbandonare: con un gesto di tre secondi la gente continua a tenere d'occhio le abitudini; con le tabelle da compilare molla dopo una settimana.",
        ],
      },
      {
        h2: "Come lo usa Hypemove",
        p: [
          "Nell'app il conteggio da foto è dentro il Coach AI, lo stesso a cui chiedi di cambiare l'allenamento. Fotografi il piatto, lui segna proteine, carboidrati, grassi e calorie. Non c'è un diario da compilare né obiettivi da impostare: serve a chi vuole avere un'idea, senza trasformare ogni pasto in un compito. L'idea è tenere movimento e cibo nello stesso posto, perché nella vita vera stanno insieme.",
        ],
      },
      {
        h2: "Per chi non è adatto",
        p: [
          "Se hai avuto un rapporto difficile con il cibo, contare le calorie in qualsiasi forma può fare più male che bene: parlane con chi ti segue. E se devi seguire una dieta precisa per motivi medici, la stima da foto non basta: servono pesata e un professionista.",
        ],
      },
    ],
    faq: [
      { q: "Devo fotografare tutto quello che mangio?", a: "No. Fotografa i pasti principali per qualche giorno, finché non hai capito quanto valgono i tuoi piatti abituali. Poi usalo solo quando hai un dubbio." },
      { q: "Riconosce anche i piatti italiani?", a: "Sì, i piatti comuni (pasta, risotti, secondi con contorno, panini) vengono riconosciuti bene. Le ricette molto elaborate o le porzioni coperte da salse sono più difficili da stimare, per qualsiasi app." },
      { q: "Le calorie da foto sono gratis in Hypemove?", a: "Il Coach AI, e quindi anche il conteggio da foto, è disponibile nel piano gratuito con un numero limitato di messaggi a settimana. Con Premium non ci sono limiti." },
    ],
  },
  {
    slug: "esercizi-con-elastico-a-casa",
    category: "Allenamento a casa",
    title: "Allenarsi a casa con l'elastico: 8 esercizi guidati",
    seoTitle: "Allenarsi a casa con l'elastico: 8 esercizi per tutto il corpo",
    description: "Un elastico costa poco, sta in un cassetto e allena tutto il corpo. Otto esercizi per gambe, glutei, schiena, braccia e spalle, con le indicazioni per farli bene.",
    lead: "Un elastico costa meno di una pizza, sta in un cassetto e allena tutto il corpo. Se ne hai uno in casa e non sai da dove partire, questi otto esercizi bastano per settimane.",
    readTime: "5 min",
    published: "2026-09-09",
    modified: "2026-09-09",
    image: "app-esercizio",
    imageKind: "app",
    imageAlt: "Esercizio con l'elastico guidato dal video in Hypemove",
    sections: [
      {
        h2: "Quale elastico",
        p: [
          "Ce ne sono due tipi. Il mini band (l'anello corto) va sopra le ginocchia o alle caviglie: perfetto per gambe e glutei. L'elastico lungo, con o senza maniglie, serve per braccia, spalle e schiena. Se ne devi comprare uno solo, prendi un set di mini band a resistenza diversa: costa poco e copre gran parte degli esercizi qui sotto.",
        ],
      },
      {
        h2: "Gli 8 esercizi",
        ul: [
          "Squat con mini band sopra le ginocchia: piedi larghi come le spalle, spingi le ginocchia verso l'esterno contro l'elastico mentre scendi. 10-15 ripetizioni.",
          "Camminata laterale: mini band alle caviglie, ginocchia leggermente piegate, dieci passi a destra e dieci a sinistra senza far toccare i piedi.",
          "Ponte glutei con mini band: sdraiata, piedi a terra, elastico sopra le ginocchia; solleva il bacino spingendo le ginocchia verso fuori. 12-15 ripetizioni.",
          "Affondo indietro con elastico sotto il piede davanti: le mani tengono i capi all'altezza delle spalle. 8-10 per gamba.",
          "Remata in piedi: elastico lungo ancorato a una maniglia della porta, tira i gomiti indietro tenendo le spalle basse. 12-15 ripetizioni.",
          "Apertura a braccia tese: elastico lungo tenuto davanti al petto, apri le braccia fino a portare l'elastico al petto, spalle giù. 12-15 ripetizioni.",
          "Kickback per i tricipiti: elastico sotto un piede, busto inclinato in avanti, gomiti fermi lungo i fianchi, stendi le braccia indietro. 12 ripetizioni.",
          "Curl per i bicipiti: elastico sotto i piedi, gomiti fermi, piega le braccia. 12-15 ripetizioni.",
        ],
      },
      {
        h2: "Come metterli insieme",
        p: [
          "Per iniziare: quattro esercizi a scelta (due per le gambe, due per la parte alta), un giro, 8-10 minuti. Quando è facile: tutti e otto, un giro, circa 15 minuti. Poi due giri. La resistenza dell'elastico si sceglie così: le ultime due ripetizioni devono costare fatica, ma con la tecnica ancora pulita.",
          "In Hypemove basta dire al coach che hai un elastico: gli allenamenti del percorso lo usano, e ogni esercizio ha il video con l'esecuzione corretta. Il kickback per i tricipiti dello screenshot qui sopra è uno di quelli.",
        ],
      },
      {
        h2: "Tre errori da evitare",
        ul: [
          "Elastico troppo forte: la tecnica salta e lavorano i muscoli sbagliati. Meglio più ripetizioni con una resistenza più leggera.",
          "Movimenti veloci: l'elastico premia il controllo, soprattutto nella fase di ritorno. Conta due secondi mentre torni.",
          "Ancoraggi improvvisati: l'elastico agganciato a una maniglia che si apre o a un mobile leggero torna indietro in faccia. Usa un ancoraggio fisso o il tuo piede.",
        ],
      },
    ],
    faq: [
      { q: "L'elastico sostituisce i pesi?", a: "Per chi parte da zero o vuole tonificare sì, per mesi. Per costruire molta forza a un certo punto servono carichi maggiori, ma non è il caso di chi legge questa guida." },
      { q: "Ogni quanto cambiare elastico?", a: "Controllalo prima di ogni uso: se vedi crepe o punti più sottili, sostituiscilo. Un elastico che si rompe sotto tensione fa male." },
    ],
  },
  {
    slug: "migliori-app-fitness-gratuite-italiano",
    category: "Scegliere un'app",
    title: "Le migliori app fitness gratuite in italiano, e per chi è ognuna",
    seoTitle: "Migliori app fitness gratuite in italiano: per chi è ognuna (2026)",
    description: "Nike Training Club, FitOn, Seven, Freeletics, Adidas Training e Hypemove: cosa offrono gratis, per chi sono e per chi no. Una guida onesta, senza classifiche finte.",
    lead: "Le classifiche \"le 10 migliori app\" mettono tutto insieme. Ma un'app per chi corre le maratone e una per chi non si allena da tre anni non vanno confrontate: vanno assegnate. Ecco le più diffuse in Italia, e per chi è ognuna.",
    readTime: "6 min",
    published: "2026-09-09",
    modified: "2026-09-09",
    image: "wod1",
    imageKind: "photo",
    imageAlt: "Persona che si allena a casa seguendo un'app",
    sections: [
      {
        h2: "Come leggere questa guida",
        p: [
          "Per ogni app diciamo cosa si usa gratis, per chi è fatta e per chi no. Non mettiamo i prezzi degli abbonamenti perché cambiano spesso: li trovi sulle loro schede. Hypemove è la nostra app, ed è nell'elenco: diciamo anche per chi non è adatta.",
        ],
      },
      {
        h2: "Nike Training Club",
        p: [
          "Gratis: tutto, da anni. Centinaia di allenamenti da 5 a 60 minuti, video con trainer, programmi di più settimane, in italiano. È la libreria più ricca che esista senza pagare.",
          "Per chi: ti alleni già e vuoi varietà, ti piace scegliere. Per chi no: se hai bisogno che qualcuno decida per te, la libreria diventa un ostacolo; e i programmi partono da un livello che per chi riparte da zero è alto.",
        ],
      },
      {
        h2: "FitOn",
        p: [
          "Gratis: molte lezioni video con trainer, dalle brevi alle lunghe, HIIT, tonificazione, stretching, con una versione a pagamento per contenuti extra e piani alimentari.",
          "Per chi: ti piacciono le lezioni \"come in palestra\", con qualcuno che parla e ti spinge. Per chi no: se cerchi un percorso che sale poco alla volta senza che tu debba scegliere la lezione ogni giorno.",
        ],
      },
      {
        h2: "Seven",
        p: [
          "Gratis: il workout da 7 minuti base con timer ed esercizi illustrati; il resto è a pagamento. Semplicissima.",
          "Per chi: vuoi esattamente sette minuti, sempre gli stessi, con un timer. Per chi no: se vuoi vedere come si fa un esercizio (sono disegni) o vuoi che l'allenamento cambi nel tempo.",
        ],
      },
      {
        h2: "Freeletics",
        p: [
          "Gratis: alcuni allenamenti; il coach digitale che costruisce i piani è a pagamento. Allenamenti intensi a corpo libero, community di atleti.",
          "Per chi: ti alleni già e vuoi spingere, ti motivano le sfide. Per chi no: se l'idea di un allenamento intenso è proprio quello che ti fa rimandare.",
        ],
      },
      {
        h2: "Adidas Training",
        p: [
          "Gratis: una selezione di allenamenti a corpo libero e programmi base, con piani completi a pagamento. Integrata con Adidas Running.",
          "Per chi: fai già sport e vuoi un'app unica per corsa e allenamento. Per chi no: se cerchi un'app con meno cose e un solo percorso da seguire.",
        ],
      },
      {
        h2: "Hypemove",
        p: [
          "Gratis: il percorso a tappe, tutti gli allenamenti da 5 a 15 minuti con i video degli esercizi, punti, giorni di fila e premi, e il Coach AI con un numero limitato di messaggi a settimana. Premium facoltativo per il percorso che si adatta e il coach senza limiti. Oggi su Android, e su iPhone nella versione di prova con TestFlight.",
          "Per chi: parti da zero o riparti dopo tanto, hai poco tempo, hai già mollato altre app e non vuoi decidere niente. Per chi no: atleti, chi cerca schede avanzate, chi ama le sessioni da un'ora. Gli allenamenti li scrive un chinesiologo.",
        ],
      },
      {
        h2: "In una riga",
        ul: [
          "Vuoi varietà e ti alleni già: Nike Training Club.",
          "Vuoi lezioni con un trainer che parla: FitOn.",
          "Vuoi sette minuti e basta: Seven.",
          "Vuoi intensità e sfide: Freeletics.",
          "Fai anche corsa: Adidas Training.",
          "Parti da zero e vuoi solo sapere cosa fare oggi: Hypemove.",
        ],
      },
    ],
    faq: [
      { q: "Le app fitness gratuite funzionano davvero?", a: "Sì, se le apri. La differenza tra gratis e a pagamento raramente sta nella qualità degli esercizi: sta nel percorso, nella personalizzazione e in quanto l'app riesce a farti tornare. Scegli quella che ti fa aprire l'app più spesso." },
      { q: "Meglio un'app o YouTube?", a: "YouTube ha tutto, ma devi cercare, scegliere e ricordarti dove eri. Un'app con un percorso toglie queste tre decisioni. Per chi fatica a essere costante, sono proprio quelle tre decisioni il problema." },
    ],
  },
];
