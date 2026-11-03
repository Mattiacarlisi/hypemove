(function(){
const VV = window.__V2.sprints, EVD = window.__EV;
const EVENTS = [
  { k: 'opens', t: 'entrano in app', d: 'apre l\'app' },
  { k: 'works', t: 'si allenano', d: 'completa un workout' },
  { k: 'workout_start', t: 'iniziano un workout', d: 'fa partire un workout, anche senza finirlo' },
  { k: 'view_Paywall', t: 'vedono il paywall', d: 'vede la schermata Premium' },
  { k: 'view_AIChat', t: 'aprono il coach', d: 'apre la chat con il coach' }];
const ALLEV = ["exit","app_open","screen_dwell","first_open","view_Welcome","paywall_product_updated","view_OnboardingGoal","view_OnboardingLevel","view_OnboardingAvoid","view_OnboardingDuration","view_OnboardingEquipment","view_OnboardingAge","view_OnboardingGender","view_OnboardingDailyActivity","paywall_step_view","paywall_open","view_Paywall","coach_chat_onboarding_skip","view_OnboardingWeightGoal","view_OnboardingCoachChat","view_OnboardingNotifications","onboarding_complete","view_OnboardingAccount","roadmap_select","sign_up","view_OnboardingMealScan","view_Home","onboarding_first_workout_resolved","notification_state","paywall_close","workout_coach_note_shown","view_WorkoutDetail","view_OnboardingWeight","notification_plan","view_OnboardingHeight","view_OnboardingWidgetOffer","widget_choice","view_OnboardingEquipmentUsage","widget_pin_requested","view_OnboardingWalkingSteps","notification_on","onboarding_end_landing","workout_start","onboarding_consistency_answered","view_OnboardingConsistency","view_OnboardingCoachChat1","view_AIChat","view_OnboardingBody","view_User","exercise_complete","walking_steps_granted","view_League","coach_checkin_shown","meal_scan_opened","view_OnboardingFuture","roadmap_node_select","push_token_registered","view_Cibo","coach_chat_onboarding_send","view_OnboardingFutureRadar","notification_off","workout_abandon","workout_feedback_shown","view_WorkoutComplete","workout_complete","workout_detail_back","workout_detail_close","onboarding_build_pact_answered","onboarding_build_ready_answered","notification_denied","exercise_skip","welcome_offer_sheet_shown","paywall_cta_tap","paywall_purchase_attempt","view_CoachAIHub","exercise_pause","workout_feedback_notification_scheduled","ai_chat_footbar_tap","notification_fatigue_cap","walking_steps_skipped","home_program_card_tap","coach_nav","paywall_billing_error","paywall_purchase_cancelled","workout_edit_open","meal_scan_saved","notification_tap","home_locked_tap","ai_chat_send","walking_steps_denied","widget_present_on_return","view_StreakLost","notification_cancelled","settings_open","cibo_text_read","notification_repair_shown","welcome_offer_sheet_opened","onboarding_bridge_line","cibo_add_open","onboarding_bridge_shown","paywall_ad_result","notification_settings_view","webview_renderer_death","workout_feedback_replied","account_link_open","onboarding_bridge_exit","roadmap_locked_node_open","streak_restart_cta_tap","meal_camera_opened","ai_chat_close","meal_camera_ready","profile_name_edit_open","chest_reward_continue","account_link_result","coins_button_tap","feedback_opened","view_CoachMore","ai_chat_memory_card_shown","notification_received_foreground","welcome_offer_sheet_dismissed"];
let E_q = '';
const SPALL = [["403779a2-7cb0-4ee0-8bb5-cd83806a01b9","Sprint 20","02/11","03/11",29],["d0135446-510b-459f-84bc-cfb6264c9495","Sprint 19 ritorno alla normalità","01/11","02/11",80],["b93b82f8-bbce-4918-9c82-180efa1b1216","Sprint 19 evento","30/10","31/10",75],["766f4019-7e88-41ab-8cc1-b105ca86dbc2","Sprint 19","27/10","02/11",549],["f56ceabe-1aa3-44c0-b592-a3210dc56715","Sprint 18","21/10","23/10",232],["35a6c1c2-7028-4b15-8129-5f050797dd39","Sprint 17","19/10","20/10",118],["a32e19ff-5ac9-41ab-9309-615181ac958d","Sprint 16 uomini","16/10","18/10",142],["2f1c3280-246d-4460-b281-fa466d7c11d5","Sprint 16","13/10","18/10",361],["e83f7c79-937d-4357-ac99-2ad1f6cd190e","Sprint 15 - Post onboarding Dettaglio","06/10","11/10",339],["72fe762a-8ec9-49b7-936f-4eaddd714d72","Sprint 15","04/10","12/10",532],["157651b5-acf1-416f-9793-8587f724e2cd","Sprint 14","26/09","04/10",369],["ff00b8ee-b95d-4d02-b3b8-84a19b9a3724","Sprint 13","21/09","23/09",285],["117f7936-4149-4ce9-9fac-265835b40530","Sprint 12 - Test Rate + Mascotte","11/09","17/09",954],["22dc8ba6-6ba6-4081-af4c-96219ca44bec","Sprint 12","07/09","17/09",1077],["7c67d762-caaf-47fa-8957-b95872585e6d","Sprint 11","30/08","05/09",282],["a7ea1848-888a-4086-8b91-5ee7300cef3e","Sprint 10","03/08","11/08",984],["fd535bc6-84a5-4090-bf04-bbfd505954a1","Sprint 9","22/07","25/07",209],["27c2c87b-07eb-4556-b27d-f5716122dd0e","Sprint 8","14/07","17/07",340],["7d8e4b72-4223-40df-af6b-af20a2bd4477","Sprint 7","11/07","12/07",201],["18841fbc-3ebd-4a38-98d6-2af4eb7144b3","Sprint 6","01/07","02/07",112],["6a052e9f-3e7f-47cb-a400-5daafa929fae","Sprint 5","29/06","30/06",234],["cfdb6623-6706-449f-9276-85ea8f79b659","Sprint 4","12/06","18/06",446],["dbf93478-7117-4920-a12c-708ca7c08b6a","Sprint 3","25/03","05/04",492]];
let S_q = '';
const ORDER = ['766f4019-7e88-41ab-8cc1-b105ca86dbc2','f56ceabe-1aa3-44c0-b592-a3210dc56715','2f1c3280-246d-4460-b281-fa466d7c11d5','157651b5-acf1-416f-9793-8587f724e2cd','117f7936-4149-4ce9-9fac-265835b40530'];
const COL = ['#ffffff', '#22c55e', '#e879f9', '#94a3b8'];
const E = { spOpen: null, open: false, ev: 'opens', sp: ORDER[1], vs: [ORDER[2], ORDER[4]] };
const nm = id => VV[id].nome.replace(/ - Test Rate.*/, '').replace('Spint', 'Sprint').replace('sprint', 'Sprint');
const F = v => v >= 99.95 ? '100' : v.toFixed(1).replace('.', ',');
const cnt = (id, d) => { const s = VV[id]; if (d > s.md || d < 0) return null; if (E.ev === 'opens' && d === 0) return s.n; if (E.ev === 'opens' || E.ev === 'works') return s[E.ev][d]; const a = EVD[id] && EVD[id][E.ev]; return a ? a[d] : null; };
const rate = (id, d) => { const c = cnt(id, d); return c === null ? null : c / VV[id].n * 100; };
const colOf = id => COL[E.vs.indexOf(id) % COL.length];
const cur = () => EVENTS.find(x => x.k === E.ev) || { k: E.ev, t: E.ev, d: 'fa «' + E.ev + '»', raw: true };
const hasData = () => !cur().raw;
const st = document.createElement('style'); st.textContent = `
.hq{font-size:34px;font-weight:900;line-height:1.25;margin-bottom:8px}
.hsel{position:relative;display:inline-block}
.hbtn{font:inherit;color:var(--orange);background:rgba(255,138,0,.12);border:0;border-bottom:3px solid var(--orange);border-radius:10px 10px 4px 4px;padding:0 12px;cursor:pointer}
.hbtn:hover{background:rgba(255,138,0,.2)}
.hbtn .c{font-size:20px;margin-left:6px}
.hmenu{position:absolute;top:calc(100% + 10px);left:0;z-index:6;background:var(--card2);border:1.5px solid var(--line);border-radius:16px;padding:6px;min-width:360px;box-shadow:0 14px 34px rgba(0,0,0,.55)}
.hmenu button{display:block;width:100%;text-align:left;background:none;border:0;color:#fff;border-radius:10px;padding:10px 14px}
.hmenu button:hover{background:#2c313c}
.hmenu button.on{background:rgba(255,138,0,.16)}
.hmenu .t{font-size:16px;font-weight:900}
.hmenu .d{font-size:12px;font-weight:700;color:var(--muted)}
.hmenu{width:440px}
.hsearch{width:100%;background:#12151b;border:1.5px solid var(--line);border-radius:10px;color:#fff;font:700 15px Nunito,sans-serif;padding:10px 12px;margin-bottom:6px;outline:none}
.hsearch:focus{border-color:var(--orange)}
.hgrp{font-size:11px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;padding:8px 14px 4px}
.hlist{max-height:300px;overflow:auto}
.hmenu .raw{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:13px;font-weight:600;padding:7px 14px}
.hbtn.raw{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:26px}
.r4 .huge{font-size:52px}.r4 .sub{white-space:nowrap}
.hsub{color:var(--muted);font-size:14px;font-weight:600;margin-bottom:24px}
.evs{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:22px}
.evb{background:var(--card);border:1.5px solid var(--line);box-shadow:0 4px 0 var(--step);border-radius:16px;padding:14px 16px;text-align:left;color:#fff;transition:transform .08s,box-shadow .08s}
.evb:active{transform:translateY(2px);box-shadow:0 2px 0 var(--step)}
.evb.on{background:var(--orange);border-color:var(--orange);color:#111;box-shadow:0 4px 0 #a85b00}
.evb .t{font-size:16px;font-weight:900}
.evb .d{font-size:12px;font-weight:700;opacity:.7;margin-top:4px}
.evk{font-size:12px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px}
`; document.head.appendChild(st);
function listHTML() {
  const q = E_q.trim().toLowerCase();
  const fav = EVENTS.filter(x => !q || x.t.includes(q) || x.k.toLowerCase().includes(q));
  const raw = ALLEV.filter(k => k !== 'app_open' && (!q || k.toLowerCase().includes(q)));
  return (fav.length ? `<div class="hgrp">Più usati</div>` + fav.map(x => `<button class="${x.k === E.ev ? 'on' : ''}" data-eev="${x.k}"><div class="t">${x.t}</div><div class="d">chi ${x.d} quel giorno</div></button>`).join('') : '')
    + (raw.length ? `<div class="hgrp">Tutti gli eventi · ${raw.length}</div>` + raw.map(k => `<button class="raw ${k === E.ev ? 'on' : ''}" data-eev="${k}">${k}</button>`).join('') : '')
    + (!fav.length && !raw.length ? `<div class="hgrp" style="text-transform:none">Nessun evento con «${q}»</div>` : '');
}
const spInfo = id => SPALL.find(r => r[0] === id);
const hasSp = id => !!VV[id];
function spList(mode) {
  const q = S_q.trim().toLowerCase();
  const rows = SPALL.filter(r => (!q || r[1].toLowerCase().includes(q)) && !(mode === 'vs' && (r[0] === E.sp || E.vs.includes(r[0]))));
  return rows.length ? rows.map(r => { const ok = hasSp(r[0]) && VV[r[0]].md >= 1; return `<button class="${mode === 'sp' && r[0] === E.sp ? 'on' : ''}" ${ok ? '' : 'disabled style="opacity:.45"'} data-${mode === 'sp' ? 'esp' : 'evs'}="${r[0]}"><div class="t">${r[1]}</div><div class="d">${r[2]} → ${r[3]} · ${r[4]} persone${ok ? '' : hasSp(r[0]) ? ' · troppo giovane' : ' · nel prototipo senza dati'}</div></button>`; }).join('') : `<div class="hgrp" style="text-transform:none">Nessuno sprint con «${q}»</div>`;
}
const spMenu = mode => E.spOpen === mode ? `<div class="hmenu"><input class="hsearch" id="ssearch" data-mode="${mode}" placeholder="Cerca fra ${SPALL.length} sprint…" value="${S_q}"><div class="hlist" id="slist">${spList(mode)}</div></div>` : '';
function ctl() {
  const menu = E.open ? `<div class="hmenu"><input class="hsearch" id="hsearch" placeholder="Cerca fra ${ALLEV.length + 1} eventi…" value="${E_q}"><div class="hlist" id="hlist">${listHTML()}</div></div>` : '';
  const chips = E.vs.map(v => `<span class="s3c cmp" style="color:${colOf(v)}"><span class="i"></span>${nm(v)}<button data-erm="${v}" style="background:none;border:0;color:inherit;font-size:16px;line-height:1;padding:0 0 0 4px" aria-label="Togli">×</button></span>`).join('');
  return `<div class="hq">Quante persone <span class="hsel"><button class="hbtn ${cur().raw ? 'raw' : ''}" data-eopen>${cur().t}<span class="c">▾</span></button>${menu}</span> ogni giorno</div><div class="hsub">Dal giorno del primo avvio (G0) in poi, sulle persone di ogni sprint.</div><div class="s3"><div class="s3r"><span class="s3l">Sprint attivo</span><span class="hsel"><button class="s3c act" data-sopen="sp">${spInfo(E.sp) ? spInfo(E.sp)[1] : nm(E.sp)} <small>${VV[E.sp].n} · ${spInfo(E.sp) ? spInfo(E.sp)[2] + ' → ' + spInfo(E.sp)[3] : ''}</small> ▾</button>${spMenu('sp')}</span></div><div class="s3r"><span class="s3l">Confrontalo con</span>${chips}<span class="hsel"><button class="s3c" data-sopen="vs">+ Aggiungi sprint</button>${spMenu('vs')}</span></div></div>`;
}
function cards() {
  const id = E.sp, s = VV[id], md = Math.min(30, s.md);
  const c = (d, lab) => { const v = cnt(id, d), r = rate(id, d);
    const rows = E.vs.map(x => { const rx = rate(x, d); return `<div class="s3x" style="color:${colOf(x)}"><span style="width:16px;border-top:2px dashed currentColor;display:inline-block"></span>${nm(x)}: ${rx === null ? 'non ancora' : F(rx) + '%'}${rx !== null && r !== null ? ` <span class="${r - rx >= 0 ? 'up' : 'dn'}">(${r - rx >= 0 ? '+' : '−'}${F(Math.abs(r - rx))})</span>` : ''}</div>`; }).join('');
    return `<div class="card"><div class="lab">${lab}</div><div style="display:flex;align-items:baseline;gap:14px;margin-top:12px"><div class="huge" style="color:var(--orange)">${r === null ? '—' : F(r) + '%'}</div><div class="sub" style="margin:0">${v ?? 0} su ${s.n}</div></div>${rows ? `<div style="margin-top:12px;padding-top:6px;border-top:1px solid var(--line)">${rows}</div>` : ''}</div>`; };
  return `<div class="row r4" style="grid-template-columns:repeat(4,1fr);margin-bottom:16px">${c(0, 'Il primo giorno')}${c(1, 'Il giorno dopo')}${c(Math.min(7, md), md >= 7 ? 'Dopo una settimana' : 'Al giorno ' + md)}${md >= 30 ? c(30, 'Dopo un mese') : c(md, 'Al giorno ' + md + ', l\'ultimo visto')}</div>`;
}
function chartE() {
  const id = E.sp, s = VV[id], all = [id, ...E.vs], md = Math.min(30, Math.max(...all.map(x => Math.min(30, VV[x].md)))) + 1, n = s.n;
  let top = 0; all.forEach(x => { for (let d = 0; d < md; d++) { const r = rate(x, d); if (r !== null && r > top) top = r; } });
  const stepv = top <= 4 ? 1 : top <= 8 ? 2 : top <= 20 ? 5 : top <= 40 ? 10 : 20; const yMax = Math.max(4 * stepv, Math.ceil(top / stepv) * stepv); const ySt = yMax / stepv;
  const W = 1160, H = 380, L = 54, R = 16, T = 16, B = 40;
  const X = axes({ W, H, L, R, T, B, xN: md, xLab: i => i % 5 === 0 ? 'G' + i : '', yMax, ySteps: ySt, yFmt: x => (+x.toFixed(1)).toString().replace('.', ',') + '%' });
  const pts = []; for (let d = 0; d <= Math.min(30, s.md); d++) pts.push([d, rate(id, d)]);
  let g = X.g + `<path d="${pathOf(pts, X.xOf, X.yOf)} L ${X.xOf(pts.length - 1)} ${X.yOf(0)} L ${X.xOf(0)} ${X.yOf(0)} Z" fill="#FF8A00" fill-opacity=".18"/><path d="${pathOf(pts, X.xOf, X.yOf)}" fill="none" stroke="#FF8A00" stroke-width="3" stroke-linejoin="round"/>`;
  E.vs.forEach(v => { const cp = []; for (let d = 0; d <= Math.min(md - 1, VV[v].md); d++) { const r = rate(v, d); if (r !== null) cp.push([d, r]); } if (cp.length > 1) g += `<path d="${pathOf(cp, X.xOf, X.yOf)}" fill="none" stroke="${colOf(v)}" stroke-width="2" stroke-dasharray="6 5"/>`; });
  pts.forEach(([i, r]) => { g += `<circle cx="${X.xOf(i)}" cy="${X.yOf(r)}" r="3.5" fill="#FF8A00"/>` + hot(X.xOf(i), X.yOf(r), `Giorno ${i}: ${cnt(id, i)} su ${n} (${F(r)}%)` + E.vs.map(v => rate(v, i) !== null ? ` · ${nm(v)} ${F(rate(v, i))}%` : '').join('')); });
  return `<div class="card"><div class="lab">Chi ${cur().d}, giorno per giorno</div><svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block;margin-top:14px">${g}</svg>
    <div class="leg"><span style="color:#FF8A00"><i class="ln" style="border-color:currentColor"></i>${nm(id)}</span>${E.vs.map(v => `<span style="color:${colOf(v)}"><i class="ln" style="border-color:currentColor;border-top-style:dashed"></i>${nm(v)}</span>`).join('')}<span>in percentuale sulle persone di ogni sprint</span></div></div>`;
}
window.r23e = () => {
  if (STATO === 'vuoto') E.sp = ORDER[0];
  const head = '';
  const g = guard(); if (g) return head + ctl() + g;
  if (VV[E.sp].md < 1) return head + ctl() + `<div class="card" style="max-width:640px"><div class="lab">${nm(E.sp)} · ${VV[E.sp].n} persone</div><div class="big" style="font-size:28px;margin:12px 0 8px">Nessuno ha ancora vissuto il giorno 1.</div><div class="sub">Il primo ritorno si misura domani.</div></div>`;
  if (!hasData()) return head + ctl() + `<div class="card" style="max-width:720px"><div class="lab">${E.ev}</div><div class="big" style="font-size:26px;margin:12px 0 8px">Qui vedresti la curva di questo evento.</div><div class="sub">Nel prototipo i dati ci sono solo per i cinque eventi «più usati». Nella dashboard vera ogni evento della lista si calcola quando lo scegli.</div></div>`;
  return head + ctl() + cards() + chartE();
};
document.addEventListener('input', e => { if (e.target.id === 'ssearch') { S_q = e.target.value; document.getElementById('slist').innerHTML = spList(e.target.dataset.mode); return; } if (e.target.id !== 'hsearch') return; E_q = e.target.value; document.getElementById('hlist').innerHTML = listHTML(); });
const refocus = () => { const i = document.getElementById('hsearch') || document.getElementById('ssearch'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } };
document.addEventListener('click', e => { if (e.target.id === 'hsearch' || e.target.id === 'ssearch') return; const t = e.target.closest('[data-eev],[data-esp],[data-evs],[data-eopen],[data-sopen],[data-erm]'); if (!t) { if ((E.open || E.spOpen) && !e.target.closest('.hmenu')) { E.open = false; E.spOpen = null; draw(); } return; } if (t.disabled) return; e.stopPropagation();
  if ('eopen' in t.dataset) { E.open = !E.open; E.spOpen = null; draw(); return refocus(); }
  if (t.dataset.sopen) { E.spOpen = E.spOpen === t.dataset.sopen ? null : t.dataset.sopen; E.open = false; S_q = ''; draw(); return refocus(); }
  if (t.dataset.erm) { E.vs = E.vs.filter(x => x !== t.dataset.erm); return draw(); }
  if (t.dataset.eev) { E.ev = t.dataset.eev; E.open = false; }
  else if (t.dataset.esp) { E.sp = t.dataset.esp; E.vs = E.vs.filter(v => v !== E.sp); E.spOpen = null; }
  else { const v = t.dataset.evs; E.vs = E.vs.includes(v) ? E.vs.filter(x => x !== v) : [...E.vs, v]; E.spOpen = null; }
  draw(); }, true);
})();
