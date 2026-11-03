(function(){
const P = new URLSearchParams(location.search).get('p');
if (!P) return;
const V = window.__V2;
const S12 = '117f7936-4149-4ce9-9fac-265835b40530', S16 = '2f1c3280-246d-4460-b281-fa466d7c11d5', S18 = 'f56ceabe-1aa3-44c0-b592-a3210dc56715', S19 = '766f4019-7e88-41ab-8cc1-b105ca86dbc2';
const STATO = new URLSearchParams(location.search).get('stato') || 'dati';
const pct = (a, n) => n ? a / n * 100 : null;
const f1 = v => v === null || v === undefined ? '—' : v.toFixed(1).replace('.', ',') + '%';
const GREEN = '#4ade80', GREY = '#7070a0', BLUE = '#60a5fa';

const css = `
.r2-bar{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:18px}
.r2-note{font-size:12px;color:var(--muted);line-height:1.6}
.r2-note b{color:var(--text);font-weight:600}
.r2-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px}
.r2-k{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:16px 18px}
.r2-k .l{font-size:12px;color:var(--muted);margin-bottom:6px}
.r2-k .v{font-family:var(--mono);font-size:30px;color:var(--text);line-height:1.1}
.r2-k .s{font-family:var(--mono);font-size:11px;color:var(--muted);margin-top:6px}
.r2-k .s i{font-style:normal;color:var(--text)}
.r2-grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:18px}
.r2-c{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:16px 18px}
.r2-c h3{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:600;margin:0 0 4px}
.r2-c .big{font-family:var(--mono);font-size:26px;color:var(--text);margin:2px 0 10px}
.r2-c .big small{font-size:12px;color:var(--muted);margin-left:8px}
.r2-leg{display:flex;gap:16px;flex-wrap:wrap;font-size:11px;color:var(--muted);margin-top:8px}
.r2-leg span{display:inline-flex;align-items:center;gap:6px}
.r2-leg i{display:inline-block;width:16px;height:0;border-top:2px solid}
.r2-tab{width:100%;border-collapse:collapse;font-family:var(--mono);font-size:12px}
.r2-tab th{font-weight:500;color:var(--muted);text-align:right;padding:6px 10px;border-bottom:1px solid var(--border)}
.r2-tab th:first-child,.r2-tab td:first-child{text-align:left;font-family:Inter,system-ui,sans-serif}
.r2-tab td{padding:7px 10px;text-align:right;border-bottom:1px solid var(--border);color:var(--text)}
.r2-tab td.m{color:var(--muted)}
.r2-tab tr.sub td{color:var(--muted)}
.r2-skel{background:var(--surface2);border-radius:var(--radius);animation:r2p 1.2s ease-in-out infinite alternate}
@keyframes r2p{from{opacity:.45}to{opacity:1}}
.r2-side{display:grid;grid-template-columns:200px 1fr;gap:18px}
.r2-side .n{font-family:var(--mono);font-size:22px;color:var(--text)}
.r2-side .t{font-size:11px;color:var(--muted);margin-bottom:14px}
.r2-pick{display:flex;gap:6px;flex-wrap:wrap}
.r2-pick button{background:var(--surface2);border:1px solid var(--border);color:var(--muted);border-radius:8px;padding:5px 12px;font-size:12px;cursor:pointer}
.r2-pick button.on{border-color:var(--purple);color:var(--text);background:var(--accent-lo)}
.r2-pick button:active{transform:translateY(1px)}
`;
const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

function chart(o) {
  const W = o.w || 520, H = o.h || 220, L = 40, R = 10, T = 10, B = 26;
  const x0 = o.x0 ?? 1, x1 = o.x1 ?? 30, yMax = o.yMax;
  const xOf = d => L + (d - x0) / (x1 - x0) * (W - L - R);
  const yOf = v => T + (1 - v / yMax) * (H - T - B);
  let g = '';
  const steps = o.ySteps || 4;
  for (let i = 0; i <= steps; i++) {
    const v = yMax / steps * i, y = yOf(v);
    g += `<line x1="${L}" x2="${W - R}" y1="${y}" y2="${y}" stroke="#252535"/><text x="${L - 6}" y="${y + 3}" text-anchor="end" font-size="10" fill="#7070a0" font-family="JetBrains Mono,monospace">${(+v.toFixed(1)).toString().replace('.', ',')}%</text>`;
  }
  for (let d = x0; d <= x1; d++) {
    const x = xOf(d), lab = d === x0 || d % 5 === 0;
    g += `<line x1="${x}" x2="${x}" y1="${H - B}" y2="${H - B + (lab ? 5 : 3)}" stroke="#333345"/>`;
    if (lab) g += `<text x="${x}" y="${H - 6}" text-anchor="middle" font-size="10" fill="#7070a0" font-family="JetBrains Mono,monospace">D${d}</text>`;
  }
  for (const s of o.series) {
    const pts = [];
    s.values.forEach((v, d) => { if (d >= x0 && d <= x1 && v !== null && v !== undefined && v <= yMax) pts.push([d, v]); });
    if (pts.length < 2) continue;
    const path = pts.map(([d, v], i) => (i ? 'L' : 'M') + xOf(d).toFixed(1) + ' ' + yOf(v).toFixed(1)).join(' ');
    g += `<path d="${path}" fill="none" stroke="${s.color}" stroke-width="${s.width || 2}" ${s.dash ? `stroke-dasharray="${s.dash}"` : ''} stroke-linejoin="round"/>`;
    if (!s.noDots) g += pts.map(([d, v]) => `<circle cx="${xOf(d)}" cy="${yOf(v)}" r="2.4" fill="${s.color}"><title>${s.name} · D${d}: ${f1(v)}${s.counts ? ' (' + s.counts[d] + ' persone)' : ''}</title></circle>`).join('');
  }
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block">${g}</svg>`;
}
const leg = items => `<div class="r2-leg">${items.map(i => `<span><i style="border-color:${i.c};${i.dash ? 'border-top-style:dashed' : ''}"></i>${i.t}</span>`).join('')}</div>`;
const benchLine = () => { const b = V.bench, v = []; for (let d = 0; d <= 30; d++) v[d] = d < 1 ? null : d <= 7 ? b[1] + (b[7] - b[1]) * (d - 1) / 6 : b[7] + (b[30] - b[7]) * (d - 7) / 23; return v; };

function sel() {
  const ids = (state.retDSprintSel || []).filter(id => V.sprints[id]);
  return ids.map((id, i) => ({ id, s: V.sprints[id], color: SPRINT_COLORS[(state.retDSprintSel.indexOf(id)) % SPRINT_COLORS.length] }));
}
const ratio = (s, key, d) => d <= s.md ? pct(s[key][d], s.n) : null;
const series = (s, key) => s[key].map((v, d) => d <= s.md ? pct(v, s.n) : null);

function bar(extra) {
  return `<div class="r2-bar"><span class="filter-label">Sprint</span>${retDailySprintMenu()}${extra || ''}</div>`;
}
function skeleton() {
  return `<div class="r2-kpis">${'<div class="r2-skel" style="height:96px"></div>'.repeat(4)}</div><div class="r2-grid2"><div class="r2-skel" style="height:280px"></div><div class="r2-skel" style="height:280px"></div></div>`;
}
function errorBox() {
  return `<div class="r2-c" style="border-color:#2b0d0d"><h3 style="color:var(--red)">Non riesco a calcolare la retention</h3><div class="r2-note" style="margin:6px 0 12px">Il database ha impiegato troppo. I numeri non sono cambiati, è solo il calcolo che non è arrivato.</div><button class="btn btn-primary" id="retd-apply" style="padding:6px 16px;font-size:12px">Riprova</button></div>`;
}
function young(list) {
  const s = list[0] && list[0].s;
  return `<div class="r2-c"><h3>Sprint troppo giovane</h3><div class="r2-note" style="margin-top:6px">${s ? `<b>${s.nome}</b> ha ${s.n} persone, ma nessuna ha ancora vissuto il giorno 1.` : 'Scegli uno sprint dal menu.'} Le curve partono da D1: tornano domani. Intanto scegli uno sprint già maturo per confrontarlo.</div></div>`;
}
function guard(list) {
  if (state.retDLoading || STATO === 'carica') return skeleton();
  if (state.retDError || STATO === 'errore') return errorBox();
  if (!list.length || list[0].s.md < 1) return young(list);
  return null;
}

// ── 22A — Due curve: chi apre e chi si allena, giorno per giorno ──
function bodyA() {
  const list = sel(); const g = guard(list); if (g) return bar() + g;
  const m = list[0], s = m.s, c = list.slice(1);
  const k = (lab, key, d, bench) => {
    const v = ratio(s, key, d), cmp = c.map(x => ratio(x.s, key, d)).filter(v => v !== null);
    return `<div class="r2-k"><div class="l">${lab}</div><div class="v">${f1(v)}</div><div class="s">${d <= s.md ? s[key][d] + ' di ' + s.n : 'non ancora'}${bench ? ` · settore <i>~${bench}%</i>` : ''}${cmp.length ? ` · ${c[0].s.nome.split(' -')[0]} <i>${f1(cmp[0])}</i>` : ''}</div></div>`;
  };
  const sOpen = list.map(x => ({ name: x.s.nome, color: x.color, values: series(x.s, 'opens'), counts: x.s.opens }));
  const sWork = list.map(x => ({ name: x.s.nome, color: x.color, values: series(x.s, 'works'), counts: x.s.works }));
  const cols = [1, 2, 3, 7, 14, 21, 30];
  const rows = list.map(x => `
    <tr><td><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${x.color};margin-right:8px"></span>${x.s.nome} <span style="color:var(--muted)">· ${x.s.n}</span></td><td class="m">apre</td>${cols.map(d => `<td>${f1(ratio(x.s, 'opens', d))}</td>`).join('')}</tr>
    <tr class="sub"><td></td><td class="m">si allena</td>${cols.map(d => `<td>${f1(ratio(x.s, 'works', d))}</td>`).join('')}</tr>`).join('');
  return bar() + `
    <div class="r2-note" style="margin-bottom:16px">Persone che il giorno <b>N</b> dopo il primo avvio <b>aprono l'app</b> o <b>completano un workout</b>. Conta solo chi c'è quel giorno, non chi è passato dopo.</div>
    <div class="r2-kpis">
      ${k('Riaprono il giorno dopo', 'opens', 1, 20)}
      ${k('Riaprono al giorno 7', 'opens', 7, 8)}
      ${k('Si allenano al giorno 7', 'works', 7)}
      ${k('Si allenano al giorno 30', 'works', 30)}
    </div>
    <div class="r2-grid2">
      <div class="r2-c"><h3>Aprono l'app</h3><div class="big">${f1(ratio(s, 'opens', 7))}<small>al giorno 7</small></div>
        ${chart({ yMax: 20, series: [...sOpen, { name: 'Media app fitness', color: '#7070a0', dash: '4 4', values: benchLine(), noDots: true, width: 1.5 }].reverse() })}
        ${leg([...list.map(x => ({ c: x.color, t: x.s.nome })), { c: '#7070a0', t: 'media app fitness', dash: 1 }])}</div>
      <div class="r2-c"><h3>Si allenano</h3><div class="big">${f1(ratio(s, 'works', 7))}<small>al giorno 7</small></div>
        ${chart({ yMax: 10, ySteps: 5, series: sWork.reverse() })}
        ${leg(list.map(x => ({ c: x.color, t: x.s.nome })))}</div>
    </div>
    <div class="r2-c"><h3>Giorno per giorno</h3>
      <table class="r2-tab" style="margin-top:8px"><tr><th>Sprint</th><th></th>${cols.map(d => `<th>D${d}</th>`).join('')}</tr>${rows}</table></div>`;
}

// ── 22B — Una riga per persona ──
function bodyB() {
  const list = sel(); const g = guard(list); if (g) return bar() + g;
  const m = list.find(x => x.s.rows) || null;
  if (!m) return bar() + `<div class="r2-c"><h3>Dettaglio per persona</h3><div class="r2-note" style="margin-top:6px">Nel prototipo le righe per persona ci sono solo per <b>Sprint 16</b>. Sceglilo dal menu.</div></div>`;
  const s = m.s, md = s.md;
  const rows = s.rows.map(([o, w]) => ({ o: o.filter(d => d >= 1 && d <= md), w: [...new Set(w)].filter(d => d <= md), w0: w.includes(0) }))
    .filter(r => r.o.length || r.w.length)
    .sort((a, b) => (b.w.length - a.w.length) || (b.o.length - a.o.length) || (Math.max(-1, ...b.o) - Math.max(-1, ...a.o)));
  const back = rows.filter(r => r.o.length).length, trained = rows.filter(r => r.w.length).length, again = rows.filter(r => r.w.some(d => d >= 1)).length;
  const W = 900, RH = 6, L = 36, R = 10, T = 8, B = 26, H = T + rows.length * RH + B;
  const xOf = d => L + d / md * (W - L - R);
  let gx = '';
  for (let d = 0; d <= md; d++) { const x = xOf(d); gx += `<line x1="${x}" x2="${x}" y1="${T}" y2="${H - B}" stroke="#1a1a24"/><text x="${x}" y="${H - 8}" text-anchor="middle" font-size="10" fill="#7070a0" font-family="JetBrains Mono,monospace">D${d}</text>`; }
  for (let i = 0; i <= rows.length; i += 25) { const y = T + i * RH; gx += `<line x1="${L}" x2="${W - R}" y1="${y}" y2="${y}" stroke="#252535"/><text x="${L - 6}" y="${y + 3}" text-anchor="end" font-size="10" fill="#7070a0" font-family="JetBrains Mono,monospace">${i}</text>`; }
  rows.forEach((r, i) => {
    const y = T + i * RH + RH / 2, last = Math.max(...r.o, ...r.w, 0);
    gx += `<line x1="${xOf(0)}" x2="${xOf(last)}" y1="${y}" y2="${y}" stroke="#333345" stroke-width="1"/>`;
    gx += `<circle cx="${xOf(0)}" cy="${y}" r="2" fill="none" stroke="#7070a0"/>`;
    r.o.forEach(d => { if (!r.w.includes(d)) gx += `<circle cx="${xOf(d)}" cy="${y}" r="2" fill="#7070a0"><title>Persona ${i + 1} · D${d}: ha aperto</title></circle>`; });
    r.w.forEach(d => { gx += `<rect x="${xOf(d) - 3}" y="${y - 2.5}" width="6" height="5" rx="1" fill="${GREEN}"><title>Persona ${i + 1} · D${d}: workout</title></rect>`; });
  });
  const box = (n, t, c) => `<div class="n" style="${c ? 'color:' + c : ''}">${n}</div><div class="t">${t}</div>`;
  return bar() + `
    <div class="r2-note" style="margin-bottom:16px">Una riga per ogni persona di <b>${s.nome}</b> tornata almeno una volta dopo il primo giorno. Le altre ${s.n - rows.length} hanno aperto solo il giorno 0.</div>
    <div class="r2-c"><div class="r2-side">
      <div>
        ${box(s.n, 'persone nello sprint')}
        ${box(back + ' · ' + f1(pct(back, s.n)), 'riaprono almeno una volta')}
        ${box(trained + ' · ' + f1(pct(trained, s.n)), 'si allenano almeno una volta', GREEN)}
        ${box(again + ' · ' + f1(pct(again, s.n)), 'si allenano dopo il giorno 0', GREEN)}
        ${box(f1(ratio(s, 'opens', 7)), 'riaprono proprio al giorno 7')}
      </div>
      <div><h3 style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:600;margin:0 0 8px">Chi torna, giorno per giorno</h3>
        <svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block">${gx}</svg>
        ${`<div class="r2-leg"><span><svg width="10" height="10"><circle cx="5" cy="5" r="3" fill="none" stroke="#7070a0"/></svg>primo avvio</span><span><svg width="10" height="10"><circle cx="5" cy="5" r="3" fill="#7070a0"/></svg>ha aperto l'app</span><span><svg width="10" height="10"><rect x="1" y="2" width="8" height="6" rx="1" fill="${GREEN}"/></svg>ha completato un workout</span></div>`}
      </div></div></div>`;
}

// ── 22C — Il primo workout decide chi resta ──
function bodyC() {
  const list = sel(); const g = guard(list); if (g) return bar() + g;
  const s = list[0].s;
  const w0 = s.openW0.map((v, d) => d >= 1 && d <= s.md ? pct(v, s.nW0) : null);
  const nw0 = s.openNw0.map((v, d) => d >= 1 && d <= s.md ? pct(v, s.nNw0) : null);
  const d7 = Math.min(7, s.md);
  const mult = nw0[d7] ? w0[d7] / nw0[d7] : null;
  const cum = k => s.cum.map((r, d) => pct(r[k], s.n));
  const lastD = s.md > 30 ? 30 : s.md;
  return bar() + `
    <div class="r2-note" style="margin-bottom:16px">Chi completa un workout il giorno del primo avvio torna molto di più. Qui si confrontano i due gruppi di <b>${s.nome}</b>, e si vede quanti arrivano a 1, 3 e 7 workout.</div>
    <div class="r2-kpis">
      <div class="r2-k"><div class="l">Si allenano il primo giorno</div><div class="v">${f1(pct(s.nW0, s.n))}</div><div class="s">${s.nW0} di ${s.n}</div></div>
      <div class="r2-k"><div class="l">Riaprono al giorno ${d7}, se allenati</div><div class="v" style="color:${GREEN}">${f1(w0[d7])}</div><div class="s">${s.openW0[d7]} di ${s.nW0}</div></div>
      <div class="r2-k"><div class="l">Riaprono al giorno ${d7}, se no</div><div class="v">${f1(nw0[d7])}</div><div class="s">${s.openNw0[d7]} di ${s.nNw0}${mult ? ` · <i>${mult.toFixed(1).replace('.', ',')} volte</i> meno` : ''}</div></div>
      <div class="r2-k"><div class="l">Arrivano a 7 workout entro D${lastD}</div><div class="v">${f1(pct(s.cum[lastD][2], s.n))}</div><div class="s">${s.cum[lastD][2]} di ${s.n}</div></div>
    </div>
    <div class="r2-grid2">
      <div class="r2-c"><h3>Aprono l'app, per gruppo</h3><div class="big">${f1(w0[d7])}<small>contro ${f1(nw0[d7])} al giorno ${d7}</small></div>
        ${chart({ yMax: 60, ySteps: 6, x1: Math.min(30, s.md), series: [{ name: 'Senza workout il giorno 0', color: GREY, values: nw0, counts: s.openNw0 }, { name: 'Workout il giorno 0', color: GREEN, values: w0, counts: s.openW0 }] })}
        ${leg([{ c: GREEN, t: `workout il giorno 0 · ${s.nW0}` }, { c: GREY, t: `nessun workout il giorno 0 · ${s.nNw0}` }])}</div>
      <div class="r2-c"><h3>Workout fatti finora</h3><div class="big">${f1(pct(s.cum[lastD][0], s.n))}<small>almeno uno entro D${lastD}</small></div>
        ${chart({ yMax: 25, ySteps: 5, x0: 0, x1: Math.min(30, s.md), series: [{ name: 'Almeno 7', color: BLUE, values: cum(2), dash: '2 3', counts: s.cum.map(r => r[2]) }, { name: 'Almeno 3', color: BLUE, values: cum(1), dash: '6 3', counts: s.cum.map(r => r[1]) }, { name: 'Almeno 1', color: BLUE, values: cum(0), counts: s.cum.map(r => r[0]) }] })}
        ${leg([{ c: BLUE, t: 'almeno 1 workout' }, { c: BLUE, t: 'almeno 3', dash: 1 }, { c: BLUE, t: 'almeno 7 (quasi due settimane di Flow)', dash: 1 }])}</div>
    </div>`;
}

const BODY = { '22a': bodyA, '22b': bodyB, '22c': bodyC }[P];
window.pageRetentionDaily = () => BODY();
const origBoot = window.__boot;
window.__boot = () => {
  state.page = 'retention'; state.retView = 'day';
  fetchRetentionDailySprints().then(() => {
    state.retDSprintSel = STATO === 'vuoto' ? [S19] : P === '22b' ? [S16] : P === '22c' ? [S12] : [S12, S16, S18];
    if (STATO === 'carica') state.retDLoading = true;
    render();
  });
};
})();
