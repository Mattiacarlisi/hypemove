// Test L1 della card «Attivazione per sprint» (public/internal/js/kpi.js): scelta degli sprint di default, etichette,
// fasi, fasce e posizione dei valori. Zero mock, zero dipendenze: le funzioni vengono estratte dal file reale e
// valutate, così il test non può divergere dal codice in produzione.
//   node scripts/test-sprint-activation.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import assert from 'node:assert/strict';

const here = dirname(fileURLToPath(import.meta.url));
const src  = readFileSync(join(here, '..', 'public', 'internal', 'js', 'kpi.js'), 'utf8').replace(/\r\n/g, '\n');

const consts = src.match(/^const SA_[A-Z_]+ = .*$/gm) || [];
const names = ['saSelectable', 'saDefaultSel', 'saPct', 'saShort', 'saPhase', 'saBands', 'saLabelSides', 'saSelected', 'saBandText', 'saExample'];
const fns = names.map(n => {
  const m = src.match(new RegExp(`^function ${n}\\([^)]*\\) \\{[\\s\\S]*?^\\}`, 'm'));
  if (!m) { console.error(`✗ ${n} non trovata in kpi.js — il test non ha nulla da verificare`); process.exit(1); }
  return m[0];
});
if (consts.length < 4) { console.error('✗ costanti SA_ non trovate in kpi.js'); process.exit(1); }
const state = { saSel: null };
const lib = new Function('state', `${consts.join('\n')}\n${fns.join('\n')}\nreturn { ${names.join(', ')}, SA_MIN_BASE };`)(state);

// Sprint come li restituisce kpi_sprint_activation (solo i campi che servono qui)
const sp = (id, nome, numero, principale, coorte, extra = {}) => ({ id, nome, numero, principale, coorte, base: 100, paywall: 0, landing: { home: 0, detail: 0, cibo: 0, altro: 0 }, ...extra });
const rows = [
  sp('s1', 'Sprint 1', 1, true, 0), sp('s2', 'Sprint 2', 2, true, 0),
  sp('s3', 'Sprint 3', 3, true, 448), sp('s4', 'sprint 4', 4, true, 436), sp('s7', 'Spint 7', 7, true, 191),
  sp('s10', 'Sprint 10', 10, true, 882), sp('s11', 'Sprint 11', 11, true, 207), sp('s12', 'Sprint 12', 12, true, 989),
  sp('s12t', 'Sprint 12 - Test Rate +  Mascotte', 12, false, 747), sp('s13', 'Sprint 13', 13, true, 260),
  sp('s14', 'Spint 14', 14, true, 258), sp('s15', 'Sprint 15', 15, true, 405),
  sp('s15p', 'Sprint 15 - Post onboarding Dettaglio', 15, false, 248), sp('s16', 'Sprint 16', 16, true, 252),
  sp('s16u', 'Sprint 16 uomini', 16, false, 46),
];

let ko = 0;
const check = (name, fn) => {
  try { fn(); console.log(`  ✓ ${name}`); }
  catch (e) { ko++; console.log(`  ✗ ${name}\n      ${e.message.split('\n').join('\n      ')}`); }
};

check('default: gli ultimi 6 sprint principali, sotto-sprint esclusi', () =>
  assert.deepEqual(lib.saDefaultSel(rows), ['s11', 's12', 's13', 's14', 's15', 's16']));
check('default: con meno di 6 principali disponibili li prende tutti', () =>
  assert.deepEqual(lib.saDefaultSel(rows.slice(0, 5)), ['s3', 's4', 's7']));
check('sprint 1 e 2 senza first_open non sono sceglibili', () =>
  assert.ok(!lib.saSelectable(rows).some(r => r.id === 's1' || r.id === 's2')));
check('scelta salvata: gli id che non esistono più o senza dati spariscono', () => {
  state.saSel = ['s2', 's5-cancellato', 's12t', 's16'];
  try { assert.deepEqual(lib.saSelected(rows), ['s12t', 's16']); } finally { state.saSel = null; }
});
check('scelta salvata vuota resta vuota (non torna al default)', () => {
  state.saSel = [];
  try { assert.deepEqual(lib.saSelected(rows), []); } finally { state.saSel = null; }
});

check('percentuali intere, base zero = nessun valore', () => {
  assert.equal(lib.saPct(47, 158), 30);
  assert.equal(lib.saPct(253, 628), 40);
  assert.equal(lib.saPct(0, 0), null);
});

check('etichette brevi degli sprint', () => {
  assert.equal(lib.saShort(rows[4]), 'S7');                       // «Spint 7»
  assert.equal(lib.saShort(rows[3]), 'S4');                       // «sprint 4»
  assert.equal(lib.saShort(rows[8]), 'S12 test');
  assert.equal(lib.saShort(rows[12]), 'S15 post');
  assert.equal(lib.saShort(rows[14]), 'S16 uomini');
  assert.equal(lib.saShort(rows[8], true), 'S12');                // stretto: solo il numero
  assert.equal(lib.saShort({ nome: 'Lancio estivo', numero: null, principale: true }), 'Lancio e');
});

check('fase paywall: dalla metà in su', () => {
  assert.equal(lib.saPhase({ base: 100, paywall: 50, landing: {} }).paywall, 'Paywall');
  assert.equal(lib.saPhase({ base: 100, paywall: 49, landing: {} }).paywall, 'Senza paywall');
});
check('fase atterraggio: 70% su una schermata, altrimenti Misto', () => {
  assert.equal(lib.saPhase({ base: 100, paywall: 0, landing: { home: 70, detail: 30, cibo: 0 } }).landing, 'Home');
  assert.equal(lib.saPhase({ base: 100, paywall: 0, landing: { home: 69, detail: 31, cibo: 0 } }).landing, 'Misto');
  assert.equal(lib.saPhase({ base: 148, paywall: 0, landing: { home: 56, detail: 92, cibo: 1, altro: 27 } }).landing, 'Misto');
  assert.equal(lib.saPhase({ base: 132, paywall: 0, landing: { home: 18, detail: 114, cibo: 0 } }).landing, 'Dettaglio');
});
check(`fase: sotto ${lib.SA_MIN_BASE} persone non si calcola`, () => {
  assert.equal(lib.saPhase({ base: lib.SA_MIN_BASE - 1, paywall: 29, landing: { home: 29 } }), null);
  assert.notEqual(lib.saPhase({ base: lib.SA_MIN_BASE, paywall: 0, landing: { home: 30 } }), null);
});

check('fasce: sprint vicini con la stessa etichetta si uniscono, uno senza fase le spezza', () => {
  const ph = [{ paywall: 'Senza paywall' }, { paywall: 'Senza paywall' }, { paywall: 'Paywall' }, null, { paywall: 'Paywall' }];
  assert.deepEqual(lib.saBands(ph, 'paywall'), [
    { from: 0, to: 1, label: 'Senza paywall' }, { from: 2, to: 2, label: 'Paywall' }, { from: 4, to: 4, label: 'Paywall' },
  ]);
});
check('testo della fascia: intero, accorciato o niente', () => {
  assert.equal(lib.saBandText('Senza paywall', 200), 'Senza paywall');
  assert.equal(lib.saBandText('Senza paywall', 90), 'No paywall');
  assert.equal(lib.saBandText('Senza paywall', 30), '');
});

check('posizione dei valori: Inizia sopra, finiti sotto, attivati di lato se vicini a Inizia', () => {
  assert.deepEqual(lib.saLabelSides({ ini: 64, fin: 40, att: 40 }), { ini: 'up', fin: 'down', att: 'up' });
  assert.deepEqual(lib.saLabelSides({ ini: 30, fin: 17, att: 30 }), { ini: 'up', fin: 'down', att: 'right' });
  assert.deepEqual(lib.saLabelSides({ ini: 32, fin: 23, att: 28 }), { ini: 'up', fin: 'down', att: 'right' });
});
check('linea dal primo avvio: sotto, sopra se supera i finiti, a sinistra se troppo vicina', () => {
  assert.equal(lib.saLabelSides({ ini: 64, fin: 40, att: 40, coo: 26 }).coo, 'down');
  assert.equal(lib.saLabelSides({ ini: 64, fin: 40, att: 40, coo: 37 }).coo, 'left');
  assert.equal(lib.saLabelSides({ ini: 29, fin: 16, att: 31, coo: 22 }).coo, 'left');
  assert.equal(lib.saLabelSides({ ini: 60, fin: 10, att: 45, coo: 25 }).coo, 'up');
  assert.equal(lib.saLabelSides({ ini: 26, fin: 17, att: 17, coo: 13 }).coo, 'left');
  assert.equal(lib.saLabelSides({ ini: 30, fin: 17, att: 30 }).coo, undefined);
});
check('esempio della legenda completa: l\'ultimo sprint chiuso da 14 giorni con abbastanza persone', () => {
  const r = (id, age_days, base) => ({ id, age_days, base });
  assert.equal(lib.saExample([r('a', 40, 120), r('b', 20, 200), r('c', 13, 300)]).id, 'b');
  assert.equal(lib.saExample([r('a', 40, 120), r('b', 20, lib.SA_MIN_BASE - 1)]).id, 'a');
  assert.equal(lib.saExample([r('a', 3, 120)]), null);
});

console.log(ko ? `\n✗ ${ko} test falliti` : '\n✓ tutti i test passano');
process.exit(ko ? 1 : 0);
