// A — Strisce allineate: un grafico a linea per passo, impilati, colonne degli sprint allineate fra le strisce.
const GRUPPI = [
  { t: 'La prima volta', d: 'Su 100 persone che aprono l\'app per la prima volta, quante arrivano a ogni passo del primo allenamento.', passi: [1, 2, 3, 4] },
  { t: 'Tornano ad aprire l\'app', d: 'Quante aprono di nuovo l\'app dopo almeno 30 minuti senza usarla.', passi: [5, 7, 9] },
  { t: 'Rifanno l\'allenamento', d: 'Quante finiscono un secondo, un terzo, un quarto allenamento.', passi: [6, 8, 10] },
];
const LAB = 190, H = 118, PADT = 22, PADB = 10;
let tableOpen = false;

function geo(S, w) { const step = (w - 16) / S.length; return { step, X: i => 8 + step * (i + .5) }; }
function niceMax(v) { return Math.max(10, Math.ceil(v / 10) * 10); }

function strip(S, p, max, w) {
  const { step, X } = geo(S, w);
  const Y = v => PADT + (H - PADT - PADB) * (1 - v / max);
  const vals = S.map(s => pct(s.v[p], s.coorte));
  let s = `<svg width="${w}" height="${H}" class="aa-svg">`;
  [0, max / 2, max].forEach(v => s += `<line class="ac-gh" x1="0" x2="${w}" y1="${Y(v)}" y2="${Y(v)}"${v ? ' stroke-dasharray="2 4"' : ''}/>`);
  S.forEach((sp, i) => s += `<rect class="aa-col" data-i="${i}" x="${X(i) - step / 2}" y="0" width="${step}" height="${H}"/>`);
  let solid = '', dash = '';
  vals.forEach((v, i) => {
    if (!i) return;
    const seg = `M${X(i - 1)},${Y(vals[i - 1])}L${X(i)},${Y(v)}`;
    if (S[i].recente || S[i].inCorso) dash += seg; else solid += seg;
  });
  s += `<path d="${solid}" stroke="${COL.blue}" stroke-width="2.5" fill="none"/><path d="${dash}" stroke="${COL.blue}" stroke-width="2.5" fill="none" stroke-dasharray="4 4"/>`;
  vals.forEach((v, i) => {
    const prov = S[i].recente || S[i].inCorso;
    s += `<circle cx="${X(i)}" cy="${Y(v)}" r="4" fill="${prov ? COL.bg : COL.blue}" stroke="${COL.blue}" stroke-width="2"/>`;
    s += `<text class="ac-val" x="${X(i)}" y="${Y(v) - 9}" text-anchor="middle"${prov ? ' fill-opacity=".6"' : ''}>${Math.round(v)}</text>`;
  });
  s += `<text class="ac-axis" x="${w - 2}" y="${Y(max) - 6}" text-anchor="end">${max}%</text>`;
  return s + '</svg>';
}

function ticks(S, w) {
  const { X } = geo(S, w);
  let s = `<svg width="${w}" height="44">`;
  S.forEach((sp, i) => {
    s += sprintTick(sp, X(i), 15);
    s += `<text x="${X(i)}" y="40" text-anchor="middle" class="ac-tk2" style="fill:#9ca3af">${sp.coorte}</text>`;
  });
  return s + '</svg>';
}

function table(S) {
  const head = '<tr><th>Sprint</th>' + PASSI.map(p => `<th>${esc(p)}</th>`).join('') + '</tr>';
  const rows = S.map(s => `<tr${s.recente || s.inCorso ? ' class="aa-prov"' : ''}><td><b>${s.k}</b><span>${s.inCorso ? 'in corso' : 'dal ' + s.dal}</span></td>`
    + s.v.map((n, j) => `<td><b>${n}</b>${j ? `<span>${fp(n, s.coorte)}</span>` : ''}</td>`).join('') + '</tr>').join('');
  return `<div class="aa-tw"><table class="aa-tab">${head}${rows}</table></div>`;
}

function body(S) {
  const groups = GRUPPI.map(g => {
    const max = niceMax(Math.max(...g.passi.flatMap(p => S.map(s => pct(s.v[p], s.coorte)))));
    return `<section class="sa-card aa-g"><h2 class="sa-title">${g.t}</h2><p class="aa-gd">${g.d} Le strisce di questo riquadro hanno la stessa scala, da 0 a ${max}%.</p>`
      + g.passi.map(p => `<div class="aa-row"><div class="aa-lab"><b>${esc(PASSI[p])}</b><span>${esc(EVENTI[p])}</span></div><div class="aa-plot" data-p="${p}" data-max="${max}"></div></div>`).join('')
      + '</section>';
  }).join('');
  return `<div class="aa-sticky"><div class="aa-row aa-trow"><div class="aa-lab"><span>Sprint · persone al primo avvio</span></div><div class="aa-plot aa-ticks"></div></div></div>
    ${groups}
    <div class="ac-legend aa-leg"><span><svg width="26" height="8"><line x1="0" x2="26" y1="4" y2="4" stroke="${COL.blue}" stroke-width="2.5"/></svg>Sprint chiuso da più di 14 giorni</span>
    <span><svg width="26" height="10"><line x1="0" x2="26" y1="5" y2="5" stroke="${COL.blue}" stroke-width="2.5" stroke-dasharray="4 4"/><circle cx="13" cy="5" r="3.5" fill="${COL.bg}" stroke="${COL.blue}" stroke-width="2"/></svg>Sprint in corso o chiuso da meno di 14 giorni: i numeri possono ancora salire</span></div>
    <section class="sa-card aa-tcard"><button class="sa-phases${tableOpen ? ' pt-on' : ''}" data-tab>${tableOpen ? 'Nascondi i numeri' : 'Mostra i numeri'}</button>${tableOpen ? table(S) : ''}</section>`;
}

function draw(S) {
  const plot = document.querySelector('.aa-plot');
  if (!plot) return;
  const w = Math.round(plot.clientWidth);
  document.querySelector('.aa-ticks').innerHTML = ticks(S, w);
  document.querySelectorAll('.aa-plot[data-p]').forEach(el => el.innerHTML = strip(S, +el.dataset.p, +el.dataset.max, w));
  const tip = document.querySelector('.ac-tip') || document.body.appendChild(Object.assign(document.createElement('div'), { className: 'ac-tip' }));
  document.querySelectorAll('.aa-col').forEach(r => {
    r.onmouseenter = e => {
      const i = +r.dataset.i, sp = S[i], p = +r.closest('.aa-plot').dataset.p;
      document.querySelectorAll(`.aa-col[data-i="${i}"]`).forEach(c => c.classList.add('on'));
      tip.innerHTML = `<b>${sp.k}</b> <span class="m">${sp.dal} → ${sp.al}${sp.inCorso ? ', in corso' : ''}</span><br>${esc(PASSI[p])}: <b>${sp.v[p]}</b> su ${sp.coorte} · <b>${fp(sp.v[p], sp.coorte)}</b>`;
      tip.style.display = 'block';
    };
    r.onmousemove = e => { tip.style.left = Math.min(e.clientX + 14, innerWidth - 240) + 'px'; tip.style.top = (e.clientY + 14) + 'px'; };
    r.onmouseleave = () => { document.querySelectorAll('.aa-col.on').forEach(c => c.classList.remove('on')); tip.style.display = 'none'; };
  });
  const tb = document.querySelector('[data-tab]');
  if (tb) tb.onclick = () => { tableOpen = !tableOpen; render(); };
}

function render() {
  mount('Ogni striscia è un passo, ogni colonna uno sprint: <b>su 100 persone al primo avvio, quante arrivano a quel passo</b>, contando fino a oggi. I passi non sono in cascata: il secondo avvio non richiede il primo allenamento.', body, draw);
}
render();
addEventListener('resize', () => draw(SPRINTS));
