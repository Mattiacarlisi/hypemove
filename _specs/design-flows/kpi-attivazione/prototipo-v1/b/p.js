// B — Due viste collegate: a sinistra il funnel di uno sprint, a destra il passo scelto sprint per sprint.
let SEL = SPRINTS.length - 1, STEP = 4;

function funnel(S) {
  const sp = S[SEL];
  const rows = sp.v.map((n, j) => {
    const p = pct(n, sp.coorte);
    return `<button class="bb-row${j === STEP ? ' on' : ''}" data-step="${j}">
      <span class="bb-name"><b>${esc(PASSI[j])}</b></span>
      <span class="bb-track"><span class="bb-bar${sp.recente || sp.inCorso ? ' prov' : ''}" style="width:${p}%"></span></span>
      <span class="bb-num"><b>${n}</b> <i>${j ? fp(n, sp.coorte) : 'su ' + sp.coorte}</i></span></button>`;
  }).join('');
  const prev = SEL > 0, next = SEL < S.length - 1;
  return `<section class="sa-card bb-left"><div class="sa-head bb-head">
      <button class="bb-arr" data-mv="-1" ${prev ? '' : 'disabled'} aria-label="Sprint precedente"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="m15 18-6-6 6-6"/></svg></button>
      <h2 class="bb-t"><span class="bb-dot"></span>${sp.k}</h2>
      <button class="bb-arr" data-mv="1" ${next ? '' : 'disabled'} aria-label="Sprint successivo"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="m9 18 6-6-6-6"/></svg></button>
      <span class="bb-when">${sp.dal} → ${sp.al} · ${sp.coorte} persone${sp.inCorso ? ' · <b>in corso</b>' : sp.recente ? ' · <b>chiuso da meno di 14 giorni</b>' : ''}</span></div>
    <p class="bb-sub">Su ${sp.coorte} persone al primo avvio, quante arrivano a ogni passo, fino a oggi. Tocca un passo per vederlo in tutti gli sprint.</p>
    ${rows}</section>`;
}

function trend(S, w) {
  const H = 340, top = 30, bot = 48, x0 = 44, x1 = w - 16;
  const step = (x1 - x0) / S.length, X = i => x0 + step * (i + .5);
  const vals = S.map(s => pct(s.v[STEP], s.coorte));
  const max = STEP === 0 ? 100 : Math.max(10, Math.ceil(Math.max(...vals) / 10) * 10);
  const Y = v => top + (H - top - bot) * (1 - v / max);
  let s = `<svg width="${w}" height="${H}">`;
  const tk = max <= 20 ? 5 : 10;
  for (let v = 0; v <= max; v += tk) s += `<line class="ac-gh" x1="${x0}" x2="${x1}" y1="${Y(v)}" y2="${Y(v)}"/><text class="ac-axis" x="${x0 - 8}" y="${Y(v) + 4}" text-anchor="end">${Math.round(v)}%</text>`;
  s += `<rect x="${X(SEL) - step / 2}" y="${top - 18}" width="${step}" height="${H - top - bot + 18}" fill="rgba(251,139,4,.10)" rx="6"/>`;
  let solid = '', dash = '';
  vals.forEach((v, i) => { if (!i) return; const seg = `M${X(i - 1)},${Y(vals[i - 1])}L${X(i)},${Y(v)}`; if (S[i].recente || S[i].inCorso) dash += seg; else solid += seg; });
  s += `<path d="${solid}" stroke="${COL.blue}" stroke-width="2.5" fill="none"/><path d="${dash}" stroke="${COL.blue}" stroke-width="2.5" fill="none" stroke-dasharray="4 4"/>`;
  vals.forEach((v, i) => {
    const prov = S[i].recente || S[i].inCorso, on = i === SEL;
    s += `<circle cx="${X(i)}" cy="${Y(v)}" r="${on ? 6 : 4}" fill="${on ? COL.orange : prov ? COL.bg : COL.blue}" stroke="${on ? COL.orange : COL.blue}" stroke-width="2"/>`;
    s += `<text class="ac-val" x="${X(i)}" y="${Y(v) - 11}" text-anchor="middle"${on ? ` style="font-size:13px;font-weight:800;fill:${COL.orange}"` : prov ? ' fill-opacity=".6"' : ''}>${Math.round(v)}</text>`;
    s += sprintTick(S[i], X(i), H - bot + 20, null, step < 44);
    s += `<rect class="bb-hit" data-sp="${i}" x="${X(i) - step / 2}" y="0" width="${step}" height="${H}"/>`;
  });
  return s + '</svg>';
}

function body(S) {
  return `<div class="bb-grid">${funnel(S)}<section class="sa-card bb-right">
      <h2 class="sa-title">${esc(PASSI[STEP])}, sprint per sprint</h2>
      <p class="bb-sub">Su 100 persone al primo avvio, quante arrivano a «${esc(PASSI[STEP])}». Tocca uno sprint per vederne il funnel a sinistra.</p>
      <div class="bb-plot"></div>
      <div class="ac-legend"><span><svg width="14" height="14"><circle cx="7" cy="7" r="5" fill="${COL.orange}"/></svg>Sprint aperto a sinistra</span>
      <span><svg width="26" height="10"><line x1="0" x2="26" y1="5" y2="5" stroke="${COL.blue}" stroke-width="2.5" stroke-dasharray="4 4"/><circle cx="13" cy="5" r="3.5" fill="${COL.bg}" stroke="${COL.blue}" stroke-width="2"/></svg>Numeri che possono ancora salire</span></div>
    </section></div>`;
}

function after(S) {
  const plot = document.querySelector('.bb-plot');
  plot.innerHTML = trend(S, Math.round(plot.clientWidth));
  const tip = document.querySelector('.ac-tip') || document.body.appendChild(Object.assign(document.createElement('div'), { className: 'ac-tip' }));
  document.querySelectorAll('.bb-hit').forEach(r => {
    const sp = S[+r.dataset.sp];
    r.onclick = () => { SEL = +r.dataset.sp; tip.style.display = 'none'; render(); };
    r.onmouseenter = () => { tip.innerHTML = `<b>${sp.k}</b> <span class="m">${sp.dal} → ${sp.al}</span><br>${esc(PASSI[STEP])}: <b>${sp.v[STEP]}</b> su ${sp.coorte} · <b>${fp(sp.v[STEP], sp.coorte)}</b>`; tip.style.display = 'block'; };
    r.onmousemove = e => { tip.style.left = Math.min(e.clientX + 14, innerWidth - 240) + 'px'; tip.style.top = (e.clientY + 14) + 'px'; };
    r.onmouseleave = () => tip.style.display = 'none';
  });
  document.querySelectorAll('[data-step]').forEach(b => b.onclick = () => { STEP = +b.dataset.step; render(); });
  document.querySelectorAll('[data-mv]').forEach(b => b.onclick = () => { SEL = Math.max(0, Math.min(S.length - 1, SEL + +b.dataset.mv)); render(); });
}

function render() {
  mount('A sinistra il funnel di uno sprint: <b>dove si perde la gente</b>. A destra un passo in tutti gli sprint: <b>come cambia nel tempo</b>. Si conta fino a oggi, e i passi non sono in cascata.', body, after);
}
render();
addEventListener('resize', () => after(SPRINTS));
