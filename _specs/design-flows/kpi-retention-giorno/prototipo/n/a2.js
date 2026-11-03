(function(){
const META = {
 '117f7936-4149-4ce9-9fac-265835b40530': ['11/09', '17/09'], '157651b5-acf1-416f-9793-8587f724e2cd': ['26/09', '04/10'],
 '2f1c3280-246d-4460-b281-fa466d7c11d5': ['13/10', '18/10'], 'f56ceabe-1aa3-44c0-b592-a3210dc56715': ['21/10', '23/10'],
 '766f4019-7e88-41ab-8cc1-b105ca86dbc2': ['27/10', '02/11'] };
const ORDER = Object.keys(META).reverse();
const css = document.createElement('style'); css.textContent = `
.ctl{display:flex;align-items:stretch;gap:12px;margin-bottom:16px}
.dd{position:relative}
.ddb{display:flex;align-items:center;gap:12px;background:var(--card);border:1.5px solid var(--line);box-shadow:0 4px 0 var(--step);border-radius:16px;padding:10px 16px;color:#fff;min-width:280px;text-align:left;transition:transform .08s,box-shadow .08s}
.ddb:active{transform:translateY(2px);box-shadow:0 2px 0 var(--step)}
.ddb .k{font-size:11px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.08em}
.ddb .v{font-size:16px;font-weight:900}
.ddb .d{font-size:12px;font-weight:700;color:var(--muted)}
.dot{width:12px;height:12px;border-radius:50%;flex:none}
.chev{margin-left:auto;color:var(--muted)}
.ddp{position:absolute;top:calc(100% + 8px);left:0;z-index:5;background:var(--card2);border:1.5px solid var(--line);border-radius:16px;padding:6px;min-width:340px;box-shadow:0 12px 30px rgba(0,0,0,.5)}
.ddp button{display:flex;align-items:center;gap:12px;width:100%;background:none;border:0;color:#fff;border-radius:10px;padding:10px 12px;text-align:left}
.ddp button:hover{background:#2c313c}
.ddp button.on{background:rgba(67,97,238,.18)}
.ddp .nm{font-weight:800;font-size:14px;flex:1}
.ddp .meta{font-size:12px;color:var(--muted);font-weight:700}
.ddp .sep{height:1px;background:var(--line);margin:6px 4px}
.tag{font-size:11px;font-weight:800;border-radius:999px;padding:3px 8px;background:#2c313c;color:var(--muted)}
.tag.y{background:rgba(255,138,0,.15);color:var(--orange)}
.vs{align-self:center;color:var(--dim);font-weight:900;font-size:13px}
.cmpline{font-size:13px;font-weight:700;color:var(--muted);margin-top:10px;padding-top:10px;border-top:1px solid var(--line);display:flex;align-items:center;gap:8px}
.up{color:var(--green)}.dn{color:var(--red)}
.strip{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:16px}
.sc{background:var(--card);border:1.5px solid var(--line);box-shadow:0 4px 0 var(--step);border-radius:16px;padding:14px 16px;text-align:left;color:#fff;position:relative;transition:transform .08s,box-shadow .08s}
.sc:active{transform:translateY(2px);box-shadow:0 2px 0 var(--step)}
.sc.on{border-color:var(--blue);box-shadow:0 4px 0 #2a3fae}
.sc.vs2{border-color:#fff;border-style:dashed}
.sc .nm{font-weight:900;font-size:15px}
.sc .meta{font-size:12px;color:var(--muted);font-weight:700;margin-top:2px}
.sc .pv{font-size:26px;font-weight:900;margin-top:10px}
.sc .pl{font-size:11px;color:var(--muted);font-weight:700}
.sc .role{position:absolute;top:12px;right:12px}
.sc .mk{font-size:11px;font-weight:800;color:var(--muted);background:none;border:1px solid var(--line);border-radius:999px;padding:3px 9px;margin-top:10px}
.sc .mk.on{color:#111;background:#fff;border-color:#fff}
.hint{font-size:12px;color:var(--muted);font-weight:700;margin:-6px 0 14px}
`; document.head.appendChild(css);

const VV = window.__V2.sprints;
const band = (id, d) => { const b = window.__BANDS[id]; if (b && b[d]) return [b[d][1], b[d][2]]; const s = VV[id]; if (d > s.md) return null; return [s.works[d], Math.max(0, s.opens[d] - s.works[d])]; };
const tot = (id, d) => { const b = band(id, d); return b ? b[0] + b[1] : null; };
const rate = (id, d) => { const t = tot(id, d); return t === null ? null : t / VV[id].n * 100; };
const F = v => v.toFixed(1).replace('.', ',');
const nm = id => VV[id].nome.replace(' - Test Rate +  Mascotte', '').replace(' - Test Rate + Mascotte', '').replace('Spint', 'Sprint').replace('sprint', 'Sprint');
const mature = id => VV[id].md >= 7;
const bestAt = d => ORDER.filter(id => VV[id].md >= d).sort((a, b) => rate(b, d) - rate(a, d))[0];
const prevOf = id => { const i = ORDER.indexOf(id); return ORDER.slice(i + 1).find(mature) || null; };
const A = window.__A2 = { sp: ORDER.find(id => id === '117f7936-4149-4ce9-9fac-265835b40530'), vsMode: 'best', vsId: null, open: null };
const vsId = () => A.vsMode === 'none' ? null : A.vsMode === 'best' ? (bestAt(7) === A.sp ? ORDER.filter(x => x !== A.sp && VV[x].md >= 7).sort((a, b) => rate(b, 7) - rate(a, 7))[0] : bestAt(7)) : A.vsMode === 'prev' ? prevOf(A.sp) : A.vsId;

function cmpLine(d) {
  const v = vsId(); if (!v) return '';
  const a = rate(A.sp, d), b = rate(v, d);
  if (a === null || b === null) return `<div class="cmpline"><i class="ln" style="border-color:#fff;border-top-style:dashed"></i>${nm(v)} non ci è ancora arrivato</div>`;
  const diff = a - b;
  return `<div class="cmpline"><i class="ln" style="border-color:#fff;border-top-style:dashed"></i>${nm(v)} ${F(b)}% · <span class="${diff >= 0 ? 'up' : 'dn'}">${diff >= 0 ? '+' : '−'}${F(Math.abs(diff))} punti</span></div>`;
}
function cards() {
  const id = A.sp, s = VV[id], md = Math.min(30, s.md);
  const c = (d, lab) => { const b = band(id, d) || [0, 0]; return `<div class="card"><div class="lab">${lab}</div><div style="display:flex;align-items:baseline;gap:14px;margin-top:12px"><div class="huge">${b[0] + b[1]}</div><div class="sub" style="margin:0">su ${s.n} tornano · <b>${F((b[0] + b[1]) / s.n * 100)}%</b></div></div><div class="sub"><b style="color:var(--orange)">${b[0]}</b> si allenano · <b style="color:var(--blue2)">${b[1]}</b> aprono e basta</div>${cmpLine(d)}</div>`; };
  return `<div class="row" style="grid-template-columns:repeat(3,1fr);margin-bottom:16px">${c(1, 'Il giorno dopo')}${c(7, 'Dopo una settimana')}${md >= 30 ? c(30, 'Dopo un mese') : c(md, 'Al giorno ' + md + ', l\'ultimo visto')}</div>`;
}
function chartCard() {
  const id = A.sp, s = VV[id], md = Math.min(30, s.md), n = s.n, v = vsId();
  const W = 1160, H = 380, L = 54, R = 16, T = 16, B = 40, yMax = 20;
  const X = axes({ W, H, L, R, T, B, xN: md, xLab: i => (i === 0 || (i + 1) % 5 === 0) ? 'G' + (i + 1) : '', yMax, ySteps: 4, yFmt: x => x + '%' });
  const wv = [], ov = []; for (let d = 1; d <= md; d++) { const b = band(id, d); wv.push([d - 1, b[0] / n * 100]); ov.push([d - 1, (b[0] + b[1]) / n * 100]); }
  const area = (up, lo, c, op) => `<path d="${pathOf(up, X.xOf, X.yOf)} L ${lo.slice().reverse().map(([i, y]) => X.xOf(i).toFixed(1) + ' ' + X.yOf(y).toFixed(1)).join(' L ')} Z" fill="${c}" fill-opacity="${op}"/>`;
  let g = X.g + area(ov, wv, '#4361EE', .55) + area(wv, wv.map(([i]) => [i, 0]), '#FF8A00', .9) + `<path d="${pathOf(ov, X.xOf, X.yOf)}" fill="none" stroke="#7b8ff5" stroke-width="2"/>`;
  if (v) { const cp = []; for (let d = 1; d <= Math.min(md, VV[v].md); d++) { const r = rate(v, d); if (r <= yMax) cp.push([d - 1, r]); } if (cp.length > 1) g += `<path d="${pathOf(cp, X.xOf, X.yOf)}" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="6 5"/>`; }
  for (let d = 1; d <= md; d++) { const b = band(id, d); g += hot(X.xOf(d - 1), X.yOf(ov[d - 1][1]), `Giorno ${d}: ${b[0] + b[1]} tornati · ${b[0]} si allenano${v && rate(v, d) !== null ? ' · ' + nm(v) + ' ' + F(rate(v, d)) + '%' : ''}`); }
  return `<div class="card"><div class="lab">Chi c'è, giorno per giorno</div><svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block;margin-top:14px">${g}</svg>
    <div class="leg"><span><i class="sw" style="background:#FF8A00"></i>si allena</span><span><i class="sw" style="background:#4361EE;opacity:.7"></i>apre l'app e basta</span>${v ? `<span><i class="ln" style="border-color:#fff;border-top-style:dashed"></i>tornati in ${nm(v)}</span>` : ''}<span>in percentuale sulle persone di ogni sprint</span></div></div>`;
}
const youngCard = id => `<div class="card" style="max-width:640px"><div class="lab">${nm(id)} · ${VV[id].n} persone</div><div class="big" style="font-size:28px;margin:12px 0 8px">Nessuno ha ancora vissuto il giorno 1.</div><div class="sub">Il primo ritorno si misura domani. Intanto guarda uno sprint già maturo.</div></div>`;
const ageTag = id => VV[id].md < 1 ? '<span class="tag y">appena iniziato</span>' : VV[id].md < 30 ? `<span class="tag">${VV[id].md} giorni visti</span>` : '<span class="tag">maturo</span>';

// Variante 1 — due menu: «Sprint» e «Confronta con»
function v1() {
  const v = vsId();
  const list = ORDER.map(id => `<button class="${id === A.sp ? 'on' : ''}" data-a2sp="${id}"><span class="dot" style="background:${id === A.sp ? 'var(--blue)' : '#3a4050'}"></span><span class="nm">${nm(id)}<div class="meta">${META[id][0]} → ${META[id][1]} · ${VV[id].n} persone</div></span>${ageTag(id)}</button>`).join('');
  const opt = (mode, label, sub) => `<button class="${A.vsMode === mode ? 'on' : ''}" data-a2vs="${mode}"><span class="nm">${label}<div class="meta">${sub}</div></span></button>`;
  const others = ORDER.filter(id => id !== A.sp && VV[id].md >= 1).map(id => `<button class="${A.vsMode === 'pick' && A.vsId === id ? 'on' : ''}" data-a2vs="pick" data-id="${id}"><span class="dot" style="border:2px dashed #fff"></span><span class="nm">${nm(id)}<div class="meta">${META[id][0]} → ${META[id][1]} · ${VV[id].n} persone</div></span>${ageTag(id)}</button>`).join('');
  const pv = prevOf(A.sp), bs = A.vsMode === 'best' ? v : null;
  const top = `<div class="ctl">
    <div class="dd"><button class="ddb" data-a2open="sp"><span class="dot" style="background:var(--blue)"></span><span><div class="k">Sprint</div><div class="v">${nm(A.sp)}</div><div class="d">${META[A.sp][0]} → ${META[A.sp][1]} · ${VV[A.sp].n} persone</div></span><span class="chev">▾</span></button>${A.open === 'sp' ? `<div class="ddp">${list}</div>` : ''}</div>
    <span class="vs">contro</span>
    <div class="dd"><button class="ddb" data-a2open="vs"><span class="dot" style="border:2px dashed ${v ? '#fff' : '#3a4050'}"></span><span><div class="k">Confronta con</div><div class="v">${v ? nm(v) : 'Nessun confronto'}</div><div class="d">${A.vsMode === 'prev' ? 'lo sprint maturo precedente' : A.vsMode === 'best' ? 'il migliore al giorno 7' : A.vsMode === 'none' ? 'solo lo sprint scelto' : META[v] ? META[v][0] + ' → ' + META[v][1] : ''}</div></span><span class="chev">▾</span></button>
      ${A.open === 'vs' ? `<div class="ddp">${opt('prev', 'Sprint precedente', pv ? nm(pv) : 'nessuno prima')}${opt('best', 'Il migliore al giorno 7', (A.vsMode === 'best' && bs ? nm(bs) : nm(bestAt(7))) + ' · ' + F(rate(bestAt(7), 7)) + '%')}${opt('none', 'Nessun confronto', 'solo lo sprint scelto')}<div class="sep"></div>${others}</div>` : ''}</div></div>`;
  return top;
}
// Variante 2 — striscia degli sprint: tocchi per scegliere, «confronta» su un altro
function v2() {
  const v = vsId();
  const cards = ORDER.map(id => { const r = rate(id, 7), on = id === A.sp, vs = id === v;
    return `<div class="sc ${on ? 'on' : ''} ${vs ? 'vs2' : ''}" data-a2sp="${id}" role="button">
      <span class="role">${on ? '<span class="tag" style="background:var(--blue);color:#fff">scelto</span>' : vs ? '<span class="tag" style="background:#fff;color:#111">confronto</span>' : ageTag(id)}</span>
      <div class="nm">${nm(id)}</div><div class="meta">${META[id][0]} → ${META[id][1]} · ${VV[id].n}</div>
      <div class="pv">${r === null ? '—' : F(r) + '%'}</div><div class="pl">${r === null ? 'giorno 7 non ancora visto' : 'tornano al giorno 7'}</div>
      ${!on && VV[id].md >= 1 ? `<button class="mk ${vs ? 'on' : ''}" data-a2vs="pick" data-id="${id}">${vs ? 'Togli confronto' : 'Confronta'}</button>` : ''}</div>`; }).join('');
  return `<div class="strip">${cards}</div><div class="hint">Tocca uno sprint per sceglierlo. «Confronta» lo mette tratteggiato nel grafico e accanto a ogni numero.</div>`;
}

window.r23aV = (variant) => {
  const g = guard(); const head = header('Chi torna', 'Di tutte le persone arrivate nello sprint, quante ci sono ogni giorno e quante si allenano.', '');
  if (g) return head + (variant === 1 ? v1() : v2()) + g;
  if (STATO === 'vuoto') A.sp = '766f4019-7e88-41ab-8cc1-b105ca86dbc2';
  const ctl = variant === 1 ? v1() : v2();
  if (VV[A.sp].md < 1) return head + ctl + youngCard(A.sp);
  return head + ctl + cards() + chartCard();
};
document.addEventListener('click', e => {
  const t = e.target.closest('[data-a2sp],[data-a2vs],[data-a2open]');
  if (!t) { if (A.open) { A.open = null; draw(); } return; }
  e.stopPropagation();
  if (t.dataset.a2open) { A.open = A.open === t.dataset.a2open ? null : t.dataset.a2open; return draw(); }
  if (t.dataset.a2vs) { const m = t.dataset.a2vs; if (m === 'pick') { if (A.vsMode === 'pick' && A.vsId === t.dataset.id && P === '23a2') A.vsMode = 'none'; else { A.vsMode = 'pick'; A.vsId = t.dataset.id; } } else A.vsMode = m; A.open = null; return draw(); }
  if (t.dataset.a2sp) { A.sp = t.dataset.a2sp; if (A.vsMode === 'pick' && A.vsId === A.sp) A.vsMode = 'best'; A.open = null; return draw(); }
}, true);
})();
(function(){
const VV = window.__V2.sprints, A3 = { sp: 'f56ceabe-1aa3-44c0-b592-a3210dc56715', vs: ['2f1c3280-246d-4460-b281-fa466d7c11d5', '117f7936-4149-4ce9-9fac-265835b40530'] };
const ORDER = ['766f4019-7e88-41ab-8cc1-b105ca86dbc2','f56ceabe-1aa3-44c0-b592-a3210dc56715','2f1c3280-246d-4460-b281-fa466d7c11d5','157651b5-acf1-416f-9793-8587f724e2cd','117f7936-4149-4ce9-9fac-265835b40530'];
const COL = ['#ffffff', '#22c55e', '#e879f9', '#94a3b8'];
const nm = id => VV[id].nome.replace(/ - Test Rate.*/, '').replace('Spint', 'Sprint').replace('sprint', 'Sprint');
const band = (id, d) => { const b = window.__BANDS[id]; if (b && b[d]) return [b[d][1], b[d][2]]; const s = VV[id]; if (d > s.md) return null; return [s.works[d], Math.max(0, s.opens[d] - s.works[d])]; };
const rate = (id, d) => { const b = band(id, d); return b ? (b[0] + b[1]) / VV[id].n * 100 : null; };
const F = v => v.toFixed(1).replace('.', ',');
const colOf = id => COL[A3.vs.indexOf(id) % COL.length];
const st3 = document.createElement('style'); st3.textContent = `
.s3{display:flex;flex-direction:column;gap:14px;margin-bottom:18px}
.s3r{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.s3l{width:150px;font-size:13px;font-weight:800;color:var(--muted)}
.s3c{display:inline-flex;align-items:center;gap:8px;background:var(--card);border:1.5px solid var(--line);box-shadow:0 3px 0 var(--step);border-radius:999px;padding:8px 16px;color:var(--muted);font-weight:800;font-size:14px}
.s3c:active{transform:translateY(2px);box-shadow:0 1px 0 var(--step)}
.s3c.act{background:var(--blue);border-color:var(--blue);color:#fff;box-shadow:0 3px 0 #2a3fae}
.s3c.cmp{color:#fff;border-color:currentColor}
.s3c .i{width:18px;height:0;border-top:3px dashed currentColor}
.s3c small{font-weight:700;opacity:.7}
.s3c[disabled]{opacity:.35;cursor:default}
.s3x{font-size:13px;font-weight:700;color:var(--muted);margin-top:6px;display:flex;gap:8px;align-items:center}
`; document.head.appendChild(st3);
function ctl() {
  const act = ORDER.map(id => `<button class="s3c ${id === A3.sp ? 'act' : ''}" data-s3a="${id}">${nm(id)} <small>${VV[id].n}</small></button>`).join('');
  const cmp = ORDER.filter(id => id !== A3.sp).map(id => { const on = A3.vs.includes(id), dis = VV[id].md < 1;
    return `<button class="s3c ${on ? 'cmp' : ''}" ${dis ? 'disabled' : ''} data-s3v="${id}" style="${on ? 'color:' + colOf(id) : ''}">${on ? '<span class="i"></span>' : ''}${nm(id)}${dis ? ' <small>nessun dato</small>' : ''}</button>`; }).join('');
  return `<div class="s3"><div class="s3r"><span class="s3l">Sprint attivo</span>${act}</div><div class="s3r"><span class="s3l">Confrontalo con</span>${cmp}</div></div>`;
}
function cards() {
  const id = A3.sp, s = VV[id], md = Math.min(30, s.md);
  const c = (d, lab) => { const b = band(id, d) || [0, 0];
    const rows = A3.vs.map(v => { const r = rate(v, d), a = rate(id, d); return `<div class="s3x" style="color:${colOf(v)}"><span style="width:16px;border-top:2px dashed currentColor;display:inline-block"></span>${nm(v)}: ${r === null ? 'non ancora' : F(r) + '%'}${r !== null ? ` <span class="${a - r >= 0 ? 'up' : 'dn'}">(${a - r >= 0 ? '+' : '−'}${F(Math.abs(a - r))})</span>` : ''}</div>`; }).join('');
    return `<div class="card"><div class="lab">${lab}</div><div style="display:flex;align-items:baseline;gap:14px;margin-top:12px"><div class="huge">${F((b[0] + b[1]) / s.n * 100)}%</div><div class="sub" style="margin:0">${b[0] + b[1]} su ${s.n}</div></div><div class="sub"><b style="color:var(--orange)">${b[0]}</b> si allenano · <b style="color:var(--blue2)">${b[1]}</b> aprono e basta</div>${rows ? `<div style="margin-top:10px;padding-top:6px;border-top:1px solid var(--line)">${rows}</div>` : ''}</div>`; };
  return `<div class="row" style="grid-template-columns:repeat(3,1fr);margin-bottom:16px">${c(1, 'Il giorno dopo')}${c(Math.min(7, md), md >= 7 ? 'Dopo una settimana' : 'Al giorno ' + md)}${md >= 30 ? c(30, 'Dopo un mese') : c(md, 'Al giorno ' + md + ', l\'ultimo visto')}</div>`;
}
function chartC() {
  const id = A3.sp, s = VV[id], md = Math.min(30, Math.max(s.md, ...A3.vs.map(v => Math.min(30, VV[v].md)))), n = s.n;
  const W = 1160, H = 380, L = 54, R = 16, T = 16, B = 40, yMax = 20;
  const X = axes({ W, H, L, R, T, B, xN: md, xLab: i => (i === 0 || (i + 1) % 5 === 0) ? 'G' + (i + 1) : '', yMax, ySteps: 4, yFmt: x => x + '%' });
  const wv = [], ov = []; for (let d = 1; d <= Math.min(30, s.md); d++) { const b = band(id, d); wv.push([d - 1, b[0] / n * 100]); ov.push([d - 1, (b[0] + b[1]) / n * 100]); }
  const area = (up, lo, c, op) => `<path d="${pathOf(up, X.xOf, X.yOf)} L ${lo.slice().reverse().map(([i, y]) => X.xOf(i).toFixed(1) + ' ' + X.yOf(y).toFixed(1)).join(' L ')} Z" fill="${c}" fill-opacity="${op}"/>`;
  let g = X.g + area(ov, wv, '#4361EE', .55) + area(wv, wv.map(([i]) => [i, 0]), '#FF8A00', .9) + `<path d="${pathOf(ov, X.xOf, X.yOf)}" fill="none" stroke="#7b8ff5" stroke-width="2"/>`;
  A3.vs.forEach(v => { const cp = []; for (let d = 1; d <= Math.min(md, VV[v].md); d++) { const r = rate(v, d); if (r <= yMax) cp.push([d - 1, r]); } if (cp.length > 1) g += `<path d="${pathOf(cp, X.xOf, X.yOf)}" fill="none" stroke="${colOf(v)}" stroke-width="2" stroke-dasharray="6 5"/>`; });
  for (let d = 1; d <= Math.min(30, s.md); d++) g += hot(X.xOf(d - 1), X.yOf(ov[d - 1][1]), `Giorno ${d}: ${F(ov[d - 1][1])}% tornati in ${nm(id)}` + A3.vs.map(v => rate(v, d) !== null ? ` · ${nm(v)} ${F(rate(v, d))}%` : '').join(''));
  return `<div class="card"><div class="lab">Chi c'è, giorno per giorno</div><svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block;margin-top:14px">${g}</svg>
    <div class="leg"><span><i class="sw" style="background:#FF8A00"></i>${nm(id)}: si allena</span><span><i class="sw" style="background:#4361EE;opacity:.7"></i>${nm(id)}: apre e basta</span>${A3.vs.map(v => `<span style="color:${colOf(v)}"><i class="ln" style="border-color:currentColor;border-top-style:dashed"></i>${nm(v)}: tornati</span>`).join('')}</div></div>`;
}
window.r23a3 = () => {
  if (STATO === 'vuoto') A3.sp = ORDER[0];
  const head = header('Chi torna', 'Lo sprint attivo in colore, gli sprint di confronto tratteggiati.', '');
  const g = guard(); if (g) return head + ctl() + g;
  if (VV[A3.sp].md < 1) return head + ctl() + `<div class="card" style="max-width:640px"><div class="lab">${nm(A3.sp)} · ${VV[A3.sp].n} persone</div><div class="big" style="font-size:28px;margin:12px 0 8px">Nessuno ha ancora vissuto il giorno 1.</div><div class="sub">Il primo ritorno si misura domani.</div></div>`;
  return head + ctl() + cards() + chartC();
};
document.addEventListener('click', e => { const t = e.target.closest('[data-s3a],[data-s3v]'); if (!t || t.disabled) return; e.stopPropagation();
  if (t.dataset.s3a) { A3.sp = t.dataset.s3a; A3.vs = A3.vs.filter(v => v !== A3.sp); }
  else { const v = t.dataset.s3v; A3.vs = A3.vs.includes(v) ? A3.vs.filter(x => x !== v) : [...A3.vs, v]; }
  draw(); }, true);
})();
