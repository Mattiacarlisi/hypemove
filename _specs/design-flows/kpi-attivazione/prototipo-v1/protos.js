App.define({ id: 'oggi', label: 'Oggi — pagina Artifact', note: 'Oggi i numeri stanno solo nella pagina Artifact della sessione del 09/11: nel sito non c\'è niente.', frame: 'oggi/index.html', states: [{ id: 'dati', label: 'Con i dati' }] });
App.define({ id: 'a', label: 'A — Strisce allineate', note: 'Un grafico a linea per passo, impilati, colonne degli sprint allineate. Tabella chiusa in fondo.', frame: 'a/index.html', states: [{ id: 'dati', label: 'Con i dati' }, { id: 'ricalcolo', label: 'Aggiornamento in corso' }, { id: 'primo', label: 'Primo calcolo' }, { id: 'errore', label: 'Errore' }],
  tour: [
    { text: 'La riga in alto resta ferma mentre scorri: nome dello sprint, data d\'inizio e persone al primo avvio.', sel: '.aa-sticky', state: 'dati' },
    { text: 'Ogni striscia è un passo. Passa col mouse su un punto: la colonna dello sprint si accende in tutte le strisce del riquadro.', sel: '.aa-plot[data-p="4"]' },
    { text: 'Le strisce dello stesso riquadro hanno la stessa scala, quindi si confrontano a occhio.', sel: '.aa-g' },
    { text: 'Gli ultimi tre sprint sono tratteggiati: i loro numeri possono ancora salire.', sel: '.aa-leg' },
    { text: 'La tabella con i numeri interi è chiusa: si apre da qui.', sel: '[data-tab]' },
    { text: 'Il pannello a destra mostra gli altri stati: aggiornamento, primo calcolo, errore.' }
  ] });
App.define({ id: 'b', label: 'B — Funnel e andamento', note: 'A sinistra il funnel di uno sprint, a destra un passo in tutti gli sprint. Si toccano l\'uno con l\'altro. Niente tabella.', frame: 'b/index.html', states: [{ id: 'dati', label: 'Con i dati' }, { id: 'ricalcolo', label: 'Aggiornamento in corso' }, { id: 'primo', label: 'Primo calcolo' }, { id: 'errore', label: 'Errore' }],
  tour: [
    { text: 'A sinistra il funnel di uno sprint: le barre dicono dove si perde la gente. Le frecce cambiano sprint.', sel: '.bb-left', state: 'dati' },
    { text: 'Tocca un passo: il grafico a destra lo mostra in tutti gli sprint.', sel: '.bb-row.on' },
    { text: 'Tocca uno sprint nel grafico: il funnel a sinistra passa a quello sprint, segnato in arancio.', sel: '.bb-plot' },
    { text: 'Le barre a righe e i punti vuoti sono sprint i cui numeri possono ancora salire.', sel: '.bb-right .ac-legend' },
    { text: 'Il pannello a destra mostra gli altri stati: aggiornamento, primo calcolo, errore.' }
  ] });
App.define({ id: 'c', label: 'C — Tabella colorata', note: 'Passi per riga, sprint per colonna. In ogni cella percentuale e persone; il colore confronta gli sprint dentro la riga.', frame: 'c/index.html', states: [{ id: 'dati', label: 'Con i dati' }, { id: 'ricalcolo', label: 'Aggiornamento in corso' }, { id: 'primo', label: 'Primo calcolo' }, { id: 'errore', label: 'Errore' }],
  tour: [
    { text: 'Le colonne sono gli sprint, con la data d\'inizio e le persone al primo avvio.', sel: '.cc-coh', state: 'dati' },
    { text: 'Ogni cella: su 100 persone, quante arrivano a quel passo; sotto, quante persone sono.', sel: '.cc-v[data-p="4"][data-c="9"]' },
    { text: 'Il colore confronta solo gli sprint della stessa riga: blu pieno è il loro massimo.', sel: '.ac-legend' },
    { text: 'Le celle col bordo tratteggiato sono sprint i cui numeri possono ancora salire.', sel: '.cc-v.prov' },
    { text: 'Il pannello a destra mostra gli altri stati: aggiornamento, primo calcolo, errore.' }
  ] });
