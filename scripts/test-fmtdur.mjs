// Test L1 di fmtDur (public/internal/js/kpi.js) — formattazione durate del funnel a eventi.
// Zero mock, zero dipendenze: la funzione viene estratta dal file reale e valutata, così il test
// non può divergere dal codice in produzione come farebbe una copia incollata qui.
//   node scripts/test-fmtdur.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import assert from 'node:assert/strict';

const here = dirname(fileURLToPath(import.meta.url));
const src  = readFileSync(join(here, '..', 'public', 'internal', 'js', 'kpi.js'), 'utf8');

const m = src.match(/^function fmtDur\(sec\) \{[\s\S]*?^\}/m);
if (!m) { console.error('✗ fmtDur non trovata in kpi.js — il test non ha nulla da verificare'); process.exit(1); }
const fmtDur = new Function(`${m[0]}; return fmtDur;`)();

// Tabella di verità: _specs/dashboard/funnel-step-time-metrics/..._requirements.md (R9)
const casi = [
  [null,       '—'],       [undefined,  '—'],
  [0,          '0s'],      // istantaneo: è un valore osservato, non un'assenza di misura
  [45,         '45s'],     [59,         '59s'],
  [60,         '1m'],      // unità inferiore omessa quando è zero: mai "1m 0s"
  [134,        '2m 14s'],  [300,        '5m'],
  [3599,       '59m 59s'], [3600,       '1h'],
  [4800,       '1h 20m'],  [8054,       '2h 14m'],
  [172799,     '47h 59m'], // sotto le 48h si resta in ore: "47h 59m" è più leggibile di "1g 23h"
  [172800,     '2g'],      [268200,     '3g 2h'],
];

let ko = 0;
for (const [input, atteso] of casi) {
  const out = fmtDur(input);
  try { assert.equal(out, atteso); console.log(`  ✓ ${String(input).padStart(7)} → ${out}`); }
  catch { ko++; console.log(`  ✗ ${String(input).padStart(7)} → ${out}   (atteso ${atteso})`); }
}

// R10: `—` e `0s` non collassano nello stesso simbolo — è la differenza fra "non misurabile"
// e "istantaneo", e confonderli renderebbe illeggibile la colonna.
try { assert.notEqual(fmtDur(0), fmtDur(null)); console.log('  ✓ 0s e — restano distinti'); }
catch { ko++; console.log('  ✗ 0s e — collassano nello stesso simbolo'); }

console.log(ko ? `\n${ko} caso/i fallito/i su ${casi.length + 1}` : `\nTutti verdi (${casi.length + 1} casi).`);
process.exit(ko ? 1 : 0);
