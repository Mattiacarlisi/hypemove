// KPI Dashboard — blocco «Benchmark del coach» della pagina AI Coach.
// Caricato DOPO kpi.js: usa `state`, `render` ed `esc` di quel file.
// I dati sono un file statico (data/coach-benchmark.json) scritto da
// `npm run embed:coach-benchmarks` in app/: i risultati dei benchmark non passano dal database.
// Passaggi e giri nuovi arrivano dal file: qui non c'è nessun elenco.

const coachBench = { data: null, error: null };

async function fetchCoachBenchmark() {
  try {
    const res = await fetch('data/coach-benchmark.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (!data || !Array.isArray(data.passaggi)) throw new Error('forma inattesa');
    coachBench.data = data;
  } catch (e) {
    console.error('fetchCoachBenchmark', e);
    coachBench.error = e.message || String(e);
  }
  if (typeof state !== 'undefined' && state.opsSession && state.page === 'ai-coach') render();
}

const cbDay = q => { const [d, t] = String(q).split('T'); return d.split('-').reverse().slice(0, 2).join('/') + ' alle ' + t; };
const cbPct = g => Math.round(g.giusti / g.casi * 100);
const cbCasi = n => n === 1 ? '1 caso' : n + ' casi';

function cbRow(p, soglia) {
  const giri = p.giri || [];
  const u = giri[giri.length - 1];
  const name = `<div class="cb-name"><div class="cb-step">${esc(p.nome)}</div><div class="cb-model">${esc(p.modello || '')}</div></div>`;
  if (!u) {
    return `<div class="cb-row cb-off">${name}
      <div class="cb-track"></div>
      <div class="cb-val"><div class="cb-none">Non ancora misurato</div><div class="cb-state">${esc(p.stato || 'da costruire')}</div></div>
    </div>`;
  }
  const mancano = Math.ceil(soglia / 100 * u.casi) - u.giusti;
  const risolto = mancano <= 0;
  let fila = 0;
  for (let i = giri.length - 1; i >= 0 && giri[i].giusti === u.giusti && giri[i].casi === u.casi; i--) fila++;
  const storia = [];
  if (fila > 1) storia.push(`Stesso risultato negli ultimi ${fila} giri`);
  if (giri.length > 1) storia.push(`${giri.length} giri in tutto, il primo al ${cbPct(giri[0])}% su ${cbCasi(giri[0].casi)}`);
  storia.push(`ultimo giro il ${cbDay(u.quando)}`);
  const nota = p.nota ? `<div class="cb-note">${esc(p.nota)}</div>` : '';
  return `<div class="cb-row${risolto ? ' cb-done' : ''}">${name}
    <div class="cb-track"><div class="cb-fill" style="width:${(u.giusti / u.casi * 100).toFixed(1)}%"></div></div>
    <div class="cb-val"><div class="cb-num">${cbPct(u)}%</div><div class="cb-state">${u.giusti} giusti su ${u.casi}</div>
      <div class="cb-gap">${risolto ? 'Risolto' : `Mancano ${cbCasi(mancano)}`}</div></div>
    <div class="cb-hist">${esc(storia.join(' · '))}${nota}</div>
  </div>`;
}

function coachBenchmarkCard() {
  const head = '<div class="card-title" style="margin-bottom:4px">Benchmark del coach a flusso unico</div>';
  if (coachBench.error) {
    return `<div class="card cb-card">${head}<div class="cb-sub">Manca il file <code>data/coach-benchmark.json</code>. Si rigenera con <code>npm run embed:coach-benchmarks</code> in <code>app/</code>.</div></div>`;
  }
  const d = coachBench.data;
  if (!d) return `<div class="card cb-card">${head}<div class="cb-sub pulse">Caricamento…</div></div>`;
  const soglia = d.soglia || 99;
  const misurati = d.passaggi.filter(p => (p.giri || []).length);
  const risolti = misurati.filter(p => { const u = p.giri[p.giri.length - 1]; return u.giusti >= Math.ceil(soglia / 100 * u.casi); });
  return `<div class="card cb-card" style="--cb-goal:${soglia}%">${head}
    <div class="cb-sub">Casi giusti nell'ultimo giro di ogni passaggio, nell'ordine del flusso. Un passaggio è risolto al ${soglia}%.
      Misurati ${misurati.length} su ${d.passaggi.length}, risolti ${risolti.length}.</div>
    <div class="cb-rows">
      <div class="cb-row cb-scale"><div></div><div class="cb-axis"><span>0%</span><span class="cb-goal-lab">${soglia}% · risolto</span></div><div></div></div>
      ${d.passaggi.map(p => cbRow(p, soglia)).join('')}
    </div>
  </div>`;
}

fetchCoachBenchmark();
