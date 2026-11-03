const ST = [{ id: 'dati', label: 'Con dati' }, { id: 'vuoto', label: 'Senza dati' }, { id: 'carica', label: 'Caricamento' }, { id: 'errore', label: 'Errore' }];
App.define({ id: 'oggi', label: 'Oggi', note: 'La vista «Per giorno» di oggi, dal codice vero con i dati dello sprint 12 e dello sprint 19.', frame: 'oggi/index.html', states: ST });
App.define({ id: '23a', label: '23A — Chi torna', note: 'Tre numeri grandi e le persone dello sprint in due fasce: chi si allena e chi apre e basta.', frame: 'n/index.html?p=23a', states: ST });
App.define({ id: '23e', label: '23E — Per evento', note: 'Scegli l\'evento in cima, poi sprint attivo e confronti: numeri e grafico seguono l\'evento.', frame: 'n/index.html?p=23e', states: ST });
App.define({ id: '23a3', label: '23A — Attivo e confronti', note: 'Una riga per lo sprint attivo, una riga di sprint da accendere per il confronto.', frame: 'n/index.html?p=23a3', states: ST });
App.define({ id: '23b', label: '23B — Chi c\'è ogni giorno', note: 'Persone attive sul calendario: aprono, tornano, si allenano, con gli sprint sullo sfondo.', frame: 'n/index.html?p=23b', states: ST });
App.define({ id: '23c', label: '23C — Sprint per sprint', note: 'Una curva per sprint, quella scelta in arancione, interruttore fra aperture e workout.', frame: 'n/index.html?p=23c', states: ST });
