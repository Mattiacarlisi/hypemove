// C — Tabella colorata: passi per riga, sprint per colonna; il colore confronta gli sprint dentro la stessa riga.
const BLOCCHI = [[1, 2, 3, 4], [5, 7, 9], [6, 8, 10]];
const NOMI = ['La prima volta', 'Tornano ad aprire l\'app', 'Rifanno l\'allenamento'];

function body(S) {
  const head = `<tr><th class="cc-corner">Passo</th>${S.map((s, i) => `<th class="cc-h${s.recente || s.inCorso ? ' prov' : ''}" data-c="${i}"><b>${s.k}</b><span>${s.inCorso ? 'in corso' : s.dal}</span></th>`).join('')}</tr>
    <tr class="cc-coh"><td class="cc-lab"><b>Primo avvio</b><span>persone nello sprint</span></td>${S.map((s, i) => `<td data-c="${i}"><b>${s.coorte}</b></td>`).join('')}</tr>`;
  const blocks = BLOCCHI.map((rows, bi) => `<tr class="cc-sep"><td colspan="${S.length + 1}">${NOMI[bi]}</td></tr>` + rows.map(p => {
    const vals = S.map(s => pct(s.v[p], s.coorte)), max = Math.max(...vals), min = Math.min(...vals);
    return `<tr><td class="cc-lab"><b>${esc(PASSI[p])}</b><span>${esc(EVENTI[p])}</span></td>` + S.map((s, i) => {
      const t = max > min ? (vals[i] - min) / (max - min) : 0;
      const a = (0.06 + t * 0.8).toFixed(2);
      return `<td class="cc-v${s.recente || s.inCorso ? ' prov' : ''}" data-c="${i}" data-p="${p}" style="background:rgba(67,97,238,${a})"><b>${fp(s.v[p], s.coorte)}</b><span>${s.v[p]}</span></td>`;
    }).join('') + '</tr>';
  }).join('')).join('');
  return `<section class="sa-card cc-card"><div class="cc-tw"><table class="cc-tab">${head}${blocks}</table></div>
    <div class="ac-legend"><span><span class="cc-sw"><i style="background:rgba(67,97,238,.06)"></i><i style="background:rgba(67,97,238,.46)"></i><i style="background:rgba(67,97,238,.86)"></i></span>Il colore confronta gli sprint dentro la stessa riga: quasi nero = il più basso, blu pieno = il più alto</span>
    <span><span class="cc-sw"><i class="cc-hatch"></i></span>Sprint in corso o chiuso da meno di 14 giorni: i numeri possono ancora salire</span></div></section>`;
}

function after(S) {
  const tip = document.querySelector('.ac-tip') || document.body.appendChild(Object.assign(document.createElement('div'), { className: 'ac-tip' }));
  document.querySelectorAll('.cc-v').forEach(td => {
    const sp = S[+td.dataset.c], p = +td.dataset.p;
    td.onmouseenter = () => {
      document.querySelectorAll(`[data-c="${td.dataset.c}"]`).forEach(e => e.classList.add('hc'));
      td.parentElement.classList.add('hr');
      tip.innerHTML = `<b>${sp.k}</b> <span class="m">${sp.dal} → ${sp.al}</span><br>${esc(PASSI[p])}: <b>${sp.v[p]}</b> su ${sp.coorte} · <b>${fp(sp.v[p], sp.coorte)}</b>`;
      tip.style.display = 'block';
    };
    td.onmousemove = e => { tip.style.left = Math.min(e.clientX + 14, innerWidth - 240) + 'px'; tip.style.top = (e.clientY + 14) + 'px'; };
    td.onmouseleave = () => { document.querySelectorAll('.hc').forEach(e => e.classList.remove('hc')); td.parentElement.classList.remove('hr'); tip.style.display = 'none'; };
  });
}

mount('Ogni riga è un passo, ogni colonna uno sprint. Nella cella: <b>su 100 persone al primo avvio, quante arrivano a quel passo</b>, e sotto quante persone sono. Si conta fino a oggi, e i passi non sono in cascata.', body, after);
