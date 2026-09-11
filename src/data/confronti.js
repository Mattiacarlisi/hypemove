// Pagine di confronto: Hypemove messa accanto alle app che la gente conosce.
// Regola: oneste. Per ogni app si dice per chi è meglio lei e per chi è meglio Hypemove.
// Niente prezzi delle altre app (cambiano e non li controlliamo): solo "gratuita" o "a pagamento".
export const confronti = [
  {
    slug: "hypemove-vs-nike-training-club",
    competitor: "Nike Training Club",
    title: "Hypemove o Nike Training Club? Per chi è meglio l'una e per chi l'altra",
    description:
      "Nike Training Club: libreria enorme e trainer famosi. Hypemove: un percorso a tappe da 5 a 15 minuti per chi parte da zero e fatica a essere costante. Confronto onesto.",
    summary:
      "Nike Training Club è una libreria: centinaia di allenamenti, da 5 minuti a un'ora, con trainer Nike, tutta gratuita. Hypemove è un percorso: una tappa al giorno, breve, con un coach che si adatta a te. La differenza vera è quante decisioni ti chiedono.",
    rows: [
      ["Com'è fatta", "Libreria di allenamenti da scegliere, con programmi multi-settimana", "Percorso a tappe: una al giorno, già scelta"],
      ["Durata", "Da 5 a 60 minuti, moltissime opzioni", "Da 5 a 15 minuti, scegli tu la fascia"],
      ["Per chi parte da zero", "Ci sono allenamenti facili, ma li devi trovare e organizzare tu", "Parte dal tuo livello e sale poco alla volta"],
      ["Coach", "Video con trainer, nessun dialogo", "Coach AI in chat: cambia gli esercizi e la durata su richiesta"],
      ["Motivazione", "Traguardi e badge", "Punti, giorni di fila, baule dei premi, classifica mensile"],
      ["Prezzo", "Gratuita", "Gratuita, Premium facoltativo"],
      ["Piattaforme", "Android e iPhone", "Android e iPhone, su iPhone la versione di prova con TestFlight"],
    ],
    them: [
      "Ti alleni già e vuoi varietà: yoga, forza, mobilità, cardio, lunghi e corti.",
      "Ti piace scegliere tu cosa fare ogni giorno.",
      "Preferisci scaricare dall'App Store invece che da una versione di prova.",
    ],
    us: [
      "Hai già scaricato app piene di allenamenti e non le hai mai aperte una seconda volta.",
      "Vuoi aprire l'app e sapere cosa fare, senza cercare.",
      "Hai poco tempo e poca energia mentale la sera: 5 minuti guidati valgono più di un'ora mai iniziata.",
    ],
    faq: [
      { q: "Nike Training Club è davvero gratis?", a: "Sì, da anni tutti i contenuti sono gratuiti. Anche Hypemove si usa gratis; il Premium è facoltativo." },
      { q: "Posso usare tutte e due?", a: "Certo. Molte persone usano Hypemove per la tappa quotidiana e un'altra app quando vogliono una sessione lunga nel weekend." },
    ],
  },
  {
    slug: "hypemove-vs-seven",
    competitor: "Seven",
    title: "Hypemove o Seven? Allenamenti brevi a confronto",
    description:
      "Seven: il workout da 7 minuti con timer, esercizi illustrati e sfide. Hypemove: allenamenti da 5 a 15 minuti in un percorso che cresce con te, con video e coach.",
    summary:
      "Seven e Hypemove partono dalla stessa idea: pochi minuti al giorno battono un'ora mai fatta. Seven la porta all'estremo, sette minuti fissi con un timer. Hypemove la mette dentro un percorso che sale poco alla volta e si adatta a te.",
    rows: [
      ["Com'è fatta", "Workout da 7 minuti basati sul metodo 7-minute workout, con sfide", "Percorso a tappe da 5 a 15 minuti, una al giorno"],
      ["Esercizi", "Illustrazioni animate e timer", "Oltre 400 esercizi con video e una voce che guida"],
      ["Progressione", "Livelli e sfide a giorni consecutivi", "Il percorso sale con te; se salti un giorno conta la settimana"],
      ["Attrezzi", "A corpo libero", "A corpo libero o con quello che hai in casa"],
      ["Coach", "Nessuno", "Coach AI in chat"],
      ["Prezzo", "Base gratuita, abbonamento a pagamento per tutto il resto", "Gratuita, Premium facoltativo"],
      ["Piattaforme", "Android e iPhone", "Android e iPhone, su iPhone la versione di prova con TestFlight"],
    ],
    them: [
      "Vuoi esattamente sette minuti, sempre gli stessi, con un timer e basta.",
      "Ti motivano le sfide a giorni consecutivi senza eccezioni.",
      "Vuoi un'app già pubblicata sull'App Store, senza passare da TestFlight.",
    ],
    us: [
      "Vuoi vedere come si fa un esercizio, non solo un disegno.",
      "Vuoi che l'allenamento cambi nel tempo, non lo stesso giro per mesi.",
      "Hai in casa un elastico o due manubri e vuoi che vengano usati.",
    ],
    faq: [
      { q: "Sette minuti bastano?", a: "Per iniziare sì, e Hypemove parte proprio da lì. Quello che conta è farli ogni giorno; poi il percorso ti porta a 10 e 15 quando sei pronta." },
      { q: "Hypemove ha un timer come Seven?", a: "Sì: ogni esercizio ha il suo tempo, il video e una voce che ti dice quando cambiare. Non devi guardare l'orologio." },
    ],
  },
  {
    slug: "hypemove-vs-freeletics",
    competitor: "Freeletics",
    title: "Hypemove o Freeletics? Due idee diverse di allenamento a casa",
    description:
      "Freeletics è intensità: HIIT, coach digitale, community di atleti. Hypemove è continuità: allenamenti da 5 a 15 minuti per chi parte da zero e ha sempre mollato.",
    summary:
      "Freeletics è fatta per chi vuole sudare e vedere risultati atletici: sessioni intense, un coach digitale che alza l'asticella, una community che ti sprona. Hypemove è fatta per chi da quel mondo si sente lontano: tappe brevi, un coach che ascolta, nessuna pressione.",
    rows: [
      ["Com'è fatta", "Percorsi di allenamento intensi (HIIT, forza a corpo libero, corsa)", "Percorso a tappe da 5 a 15 minuti, una al giorno"],
      ["Intensità", "Alta: è il punto di forza", "Bassa e progressiva: parte dal tuo livello"],
      ["Coach", "Coach digitale che adatta i piani; feedback dopo ogni sessione", "Coach AI in chat: gli scrivi come stai e cambia l'allenamento di oggi"],
      ["Per chi parte da zero", "Si può, ma il tono è da atleta", "È il pubblico per cui è nata"],
      ["Motivazione", "Community e classifiche competitive", "Punti, giorni di fila, baule dei premi, classifica mensile leggera"],
      ["Prezzo", "Funzioni base gratuite, il coach è a pagamento", "Gratuita, Premium facoltativo"],
      ["Piattaforme", "Android e iPhone", "Android e iPhone, su iPhone la versione di prova con TestFlight"],
    ],
    them: [
      "Ti alleni già e vuoi spingere: sudore, risultati misurabili, sfide.",
      "Ti motiva una community competitiva.",
      "Vuoi anche piani di corsa.",
    ],
    us: [
      "L'idea di un allenamento intenso è esattamente quello che ti fa rimandare.",
      "Vuoi qualcosa che regga anche nelle settimane peggiori, non solo in quelle buone.",
      "Non ti senti una persona da palestra e non hai voglia di diventarlo.",
    ],
    faq: [
      { q: "Hypemove è troppo facile?", a: "Per un atleta sì, e lo diciamo chiaramente. Per chi non si allena da mesi il problema non è la difficoltà: è cominciare e continuare. Il percorso sale quando sei pronta." },
      { q: "Anche Hypemove ha un coach che adatta il piano?", a: "Sì, in chat: gli dici quanto tempo hai, cosa hai in casa, su cosa vuoi lavorare, e sistema l'allenamento di oggi. Nel gratuito con messaggi limitati, in Premium senza limiti." },
    ],
  },
];
