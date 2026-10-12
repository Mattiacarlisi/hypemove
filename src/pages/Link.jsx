import React from "react";
import { PLAY_STORE_URL } from "../site.js";

// Pagina "link in bio" per Instagram (e per qualsiasi social: ?s=tiktok, ?s=facebook…).
// HTML statico come il resto del sito, niente bundle React. Lo script in fondo fa due cose:
//   1. Conta visite e tocchi in public.link_page_events e mette la sorgente nel link del Play
//      Store, così l'install referrer arriva all'app con utm_medium=linkinbio (sorgente "bio"
//      nel funnel).
//   2. Anima Moovy come l'avvio dell'onboarding dell'app (app/src/pages/Onboarding/scenes/
//      IntroScene.tsx + stage/CoachStage.tsx): cerchio arancio, marchio, molla, cambio di posa
//      sul punto più schiacciato, testo a macchina da scrivere. Curve e tempi sono quelli,
//      copiati alla lettera, non rifatti a occhio.
// L'HTML generato è già lo stato finale: senza JavaScript la pagina si vede ferma ma completa.

// Chiave pubblica anon (la stessa delle pagine /internal): con questa si può solo INSERIRE
// in link_page_events, non leggere.
const SUPABASE_URL = "https://fiwskdxntgcredypplub.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpd3NrZHhudGdjcmVkeXBwbHViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMzIxNzAsImV4cCI6MjA2NDYwODE3MH0.W5b8A2zfm0Oeo746SXcANdeRhd2HsAMk5ND9Uc-q7Uo";

export const meta = {
  title: "Hypemove: torna a muoverti",
  description: "Allenamenti a casa da 5, 10 o 15 minuti. Scarica Hypemove gratis per Android, o installa la versione di prova su iPhone.",
  robots: "noindex, follow",
  type: "website",
  jsonld: [],
  modified: "2026-10-10",
};

// Le battute di Moovy, con le parole in grassetto fra asterischi come nell'app.
const HELLO = "Ciao! Sono *Moovy*, il tuo coach.";
const READY = "Sei pronto a *rimetterti in forma*?";

// Le pose di Moovy (le stesse PNG dell'onboarding, convertite in WebP).
const MASCOT = {
  stand: "/images/mascot/idle-stand.webp",
  wave: "/images/mascot/idle-wave.webp",
  point: "/images/mascot/idle-point.webp",
  happyB: "/images/mascot/happycalm-b.webp",
  happyC: "/images/mascot/happycalm-c.webp",
  typing: "/images/mascot/typing-a.webp",
};

// Il palco: 390×450 nello spazio della tavola, scalato per stare nello spazio libero.
// Moovy ha il riquadro base 160×240 dell'onboarding, qui in (115, 200) invece di (115, 400).
const STAGE_W = 390;
const STAGE_H = 450;

function chars(text) {
  const out = [];
  let bold = false;
  for (const ch of text) {
    if (ch === "*") { bold = !bold; continue; }
    out.push({ ch, bold });
  }
  return out;
}

function Speech({ text, name, hidden }) {
  return (
    <span data-lk={name} style={hidden ? { display: "none" } : undefined}>
      {chars(text).map((c, i) => (c.bold ? <b key={i} style={{ fontWeight: 800 }}>{c.ch}</b> : <span key={i}>{c.ch}</span>))}
    </span>
  );
}

const CSS = `
.lk-js [data-lk-anim]{opacity:0}
.lk-btn{transition:transform .12s ease,border-bottom-width .12s ease,margin-top .12s ease}
.lk-btn:active{transform:translateY(2px);border-bottom-width:2px !important;margin-top:2px}
.lk-foot:hover{color:#171512}
`;

const SCRIPT = `(function(){
  // ── 1. Conteggi ────────────────────────────────────────────────────────────
  var API = ${JSON.stringify(SUPABASE_URL)} + "/rest/v1/link_page_events";
  var KEY = ${JSON.stringify(SUPABASE_ANON_KEY)};
  var source = "instagram";
  try {
    var s = (new URLSearchParams(location.search).get("s") || "").toLowerCase();
    if (/^[a-z0-9_-]{1,32}$/.test(s)) source = s;
  } catch (e) {}
  var refHost = null;
  try { if (document.referrer) refHost = new URL(document.referrer).hostname.slice(0, 100); } catch (e) {}

  var play = document.querySelector('a[data-link="android"]');
  if (play) {
    play.href = ${JSON.stringify(PLAY_STORE_URL)} + "&referrer=" +
      encodeURIComponent("utm_source=" + source + "&utm_medium=linkinbio&utm_campaign=bio");
  }

  function send(event, link) {
    try {
      return fetch(API, {
        method: "POST",
        headers: { apikey: KEY, Authorization: "Bearer " + KEY, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ event: event, link: link || null, source: source, ref_host: refHost, user_agent: (navigator.userAgent || "").slice(0, 400) })
      }).catch(function () {});
    } catch (e) { return Promise.resolve(); }
  }

  send("view");

  // Il tocco si registra prima di uscire dalla pagina: si aspetta la risposta, al massimo 600 ms.
  document.addEventListener("click", function (event) {
    var a = event.target.closest && event.target.closest("a[data-link]");
    if (!a) return;
    var link = a.getAttribute("data-link");
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) { send("click", link); return; }
    event.preventDefault();
    var done = false;
    function go() { if (done) return; done = true; location.assign(a.href); }
    setTimeout(go, 600);
    send("click", link).then(go);
  });

  // ── 2. Moovy ───────────────────────────────────────────────────────────────
  var root = document.documentElement;
  function $(n) { return document.querySelector('[data-lk="' + n + '"]'); }
  var box = $("stagebox"), stage = $("stage"), circle = $("circle"), mark = $("mark"),
      hype = $("hype"), move = $("move"), bubble = $("bubble"), m1 = $("m1"), m2 = $("m2"),
      img = $("mascot"), logo = $("logo"), cta1 = $("cta1"), cta2 = $("cta2"), foot = $("foot");
  if (!box || !stage || !img) { root.classList.remove("lk-js"); return; }
  window.__lkOk = true;

  // Il palco si scala per stare nello spazio fra il logo e i bottoni (come l'onboarding).
  function fit() {
    var w = box.clientWidth, h = box.clientHeight;
    var k = Math.min(w / ${STAGE_W}, h / ${STAGE_H}, 1.05);
    stage.style.transform = "translateY(" + Math.max(0, (h - ${STAGE_H} * k) / 2).toFixed(1) + "px) scale(" + k.toFixed(4) + ")";
  }
  fit();
  window.addEventListener("resize", fit);

  var reduced = false;
  try { reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}

  // Curve delle tavole (app/src/pages/Onboarding/stage/stageMath.ts).
  function clamp01(x) { return Math.max(0, Math.min(1, x)); }
  function prog(t, a, d) { return reduced || d <= 0 ? (t >= a ? 1 : 0) : clamp01((t - a) / d); }
  function easeOut(x) { return 1 - Math.pow(1 - x, 3); }
  function easeInOut(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function pop(x) { return x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.exp(-6 * x) * Math.cos(9 * x); }

  // Pose (CoachStage.POSES): trasformazioni del riquadro base 160×240, origine in alto a sinistra.
  var P = {
    launchHidden: { x: 80 - 80 * 0.42, y: -10 - 120 * 0.42, s: 0.42, o: 0 },
    launch: { x: 32, y: -82, s: 0.6, o: 1 },
    center: { x: 0, y: 0, s: 1, o: 1 }
  };
  function lerp(a, b, k) { return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, s: a.s + (b.s - a.s) * k, o: a.o + (b.o - a.o) * k }; }

  // Schiacciamento al cambio di posa: giù in 0,06 s, rimbalzo e assestamento entro 0,24 s.
  var SQ = 0.06;
  function squash(dt) {
    if (dt < 0 || dt > 0.3) return 0;
    if (dt < SQ) return 0.08 * easeOut(dt / SQ);
    var k = dt - SQ;
    return 0.08 * Math.exp(-k * 18) * Math.cos(k * 26);
  }

  // I tempi (IntroScene): avvio, saluto a X, seconda battuta a Y.
  var X = 2.3, Y = X + 3.0;
  var HELLO_AT = X + 0.85, READY_AT = Y + 0.15, CPS = 0.01;
  var POSE = ${JSON.stringify(MASCOT)};
  // Espressioni: in piedi all'avvio; contento al saluto, scrive, poi saluta con la mano;
  // contento alla domanda, scrive, poi indica il fumetto.
  function expression(t) {
    if (t < X) return POSE.stand;
    if (t < X + 0.7) return POSE.happyB;
    if (t < HELLO_AT + 1.2) return POSE.typing;
    if (t < Y) return POSE.wave;
    if (t < Y + 0.6) return POSE.happyC;
    if (t < READY_AT + 1.35) return POSE.typing;
    return POSE.point;
  }
  for (var k in POSE) { var pre = new Image(); pre.src = POSE[k]; }

  var m1c = m1 ? m1.children : [], m2c = m2 ? m2.children : [];
  function typeTo(list, n) { for (var i = 0; i < list.length; i++) list[i].style.visibility = i < n ? "visible" : "hidden"; }
  if (m1) m1.style.display = "";
  if (m2) m2.style.display = "none";
  typeTo(m1c, 0);

  var src = POSE.stand, srcAt = -1, shown = "";
  var t0 = null, END = READY_AT + 2.5;
  function frame(now) {
    if (t0 === null) t0 = now;
    var t = reduced ? END : (now - t0) / 1000;

    // Cerchio arancio: si apre, poi si richiude in un punto sotto Moovy.
    var open = easeInOut(prog(t, 0, 0.9)), close = easeInOut(prog(t, X + 0.07, 0.64));
    var cs = open * (1 - close);
    circle.style.transform = "translateY(" + (98 * close).toFixed(1) + "px) scale(" + cs.toFixed(4) + ")";
    circle.style.opacity = cs < 0.001 ? "0" : "1";

    // Marchio: «Hype» e «Move» entrano da destra, poi tutto sale e sfuma.
    var out = easeOut(prog(t, X, 0.26));
    mark.style.opacity = (1 - out).toFixed(3);
    mark.style.transform = "translateY(" + (-12 * out).toFixed(1) + "px) scale(" + (1 - 0.04 * out).toFixed(3) + ")";
    var h = easeOut(prog(t, 0.9, 0.54)), mv = pop(prog(t, 1.08, 0.72));
    hype.style.opacity = h.toFixed(3);
    hype.style.transform = "translateX(" + (24 * (1 - h)).toFixed(1) + "px)";
    move.style.opacity = clamp01(prog(t, 1.08, 0.72) * 3).toFixed(3);
    move.style.transform = "translateX(" + (64 * (1 - mv)).toFixed(1) + "px)";

    // Moovy: dalla posa nascosta a quella dell'avvio (molla), poi al centro (molla).
    var pose = t < X + 0.07
      ? lerp(P.launchHidden, P.launch, pop(prog(t, 0.72, 0.78)))
      : lerp(P.launch, P.center, pop(prog(t, X + 0.07, 0.7)));
    var want = expression(t);
    if (want !== src) { src = want; srcAt = t; }
    var dt = t - srcAt;
    // Il disegno cambia nel punto più schiacciato: l'occhio vede il saltello, non il cambio.
    if (dt >= SQ && shown !== src) { img.src = src; shown = src; }
    var sq = reduced ? 0 : squash(dt), sy = 1 - sq, sx = 1 + sq * 0.5;
    var ox = 80 * pose.s * (1 - sx), oy = 240 * pose.s * (1 - sy);
    img.style.transform = "translate(" + (pose.x + ox).toFixed(2) + "px," + (pose.y + oy).toFixed(2) + "px) scale(" + (pose.s * sx).toFixed(4) + "," + (pose.s * sy).toFixed(4) + ")";
    img.style.opacity = clamp01(pose.o).toFixed(3);

    // Fumetto: molla all'arrivo e di nuovo al cambio di battuta; testo a 10 ms per lettera.
    var second = t >= Y;
    var b = pop(prog(t, second ? Y + 0.05 : X + 0.7, second ? 0.45 : 0.5));
    bubble.style.opacity = clamp01(b * 3).toFixed(3);
    bubble.style.transform = "scale(" + (0.6 + 0.4 * b).toFixed(3) + ")";
    if (second) {
      if (m1.style.display !== "none") { m1.style.display = "none"; m2.style.display = ""; }
      typeTo(m2c, Math.floor((t - READY_AT) / CPS));
    } else {
      typeTo(m1c, Math.floor((t - HELLO_AT) / CPS));
    }

    // Logo, tasti e piede: dopo il saluto, come il tasto dell'onboarding (1,45 s, 0,3 s).
    var lg = easeOut(prog(t, X + 0.85, 0.4));
    logo.style.opacity = lg.toFixed(3);
    var c1 = easeOut(prog(t, X + 1.45, 0.3)), c2 = easeOut(prog(t, X + 1.53, 0.3));
    cta1.style.opacity = c1.toFixed(3);
    cta1.style.transform = "translateY(" + (8 * (1 - c1)).toFixed(1) + "px)";
    cta2.style.opacity = c2.toFixed(3);
    cta2.style.transform = "translateY(" + (8 * (1 - c2)).toFixed(1) + "px)";
    foot.style.opacity = easeOut(prog(t, X + 1.7, 0.4)).toFixed(3);

    if (t < END) requestAnimationFrame(frame);
    else { cta1.style.transform = ""; cta2.style.transform = ""; }
  }
  requestAnimationFrame(frame);
})();`;

export default function Link() {
  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-white text-ink">
      <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('lk-js');setTimeout(function(){if(!window.__lkOk)document.documentElement.classList.remove('lk-js')},4000);" }} />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@500;900&display=swap" />
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="relative mx-auto flex min-h-[100svh] max-w-[440px] flex-col pb-3 pt-2">
        <header className="relative z-10 flex h-11 items-center px-6">
          <a href="/" data-link="sito" data-lk="logo" data-lk-anim="" aria-label="Hypemove, il sito" className="relative block h-[30px] w-[132px] overflow-hidden">
            <img src="/images/opt/logo1-512.webp" alt="" width="140" height="140" className="absolute left-[-4px] top-[-53px] block h-[140px] w-[140px] max-w-none" />
          </a>
        </header>

        <div data-lk="stagebox" className="relative min-h-[300px] flex-1">
          <div
            data-lk="stage"
            style={{ position: "absolute", left: "50%", top: 0, width: STAGE_W, height: STAGE_H, marginLeft: -STAGE_W / 2, transformOrigin: "50% 0" }}
          >
            {/* Cerchio dell'avvio: centrato su Moovy, si richiude nel suo centro. */}
            <div
              data-lk="circle"
              aria-hidden="true"
              style={{ position: "absolute", left: 195 - 600, top: 222 - 600, width: 1200, height: 1200, borderRadius: "50%", background: "#FB8B04", transform: "scale(0)", opacity: 0 }}
            />
            <div
              data-lk="mark"
              aria-hidden="true"
              style={{ position: "absolute", top: 278, left: 0, width: STAGE_W, textAlign: "center", fontSize: 44, fontWeight: 900, lineHeight: "48px", letterSpacing: "-1.5px", color: "#FFFFFF", whiteSpace: "nowrap", opacity: 0 }}
            >
              <span data-lk="hype" style={{ display: "inline-block", opacity: 0 }}>Hype</span>
              <span data-lk="move" style={{ display: "inline-block", opacity: 0 }}>Move</span>
            </div>

            {/* Fumetto: come quello del saluto nell'onboarding. */}
            <div style={{ position: "absolute", left: 24, width: 342, bottom: STAGE_H - 182, display: "flex", justifyContent: "center" }}>
              <div
                data-lk="bubble"
                data-lk-anim=""
                style={{ position: "relative", padding: "12px 16px", border: "2px solid #E5E5E5", borderRadius: 16, background: "#FFFFFF", fontSize: 20, fontWeight: 500, lineHeight: 1.35, color: "#000000", textAlign: "center", transformOrigin: "50% 100%" }}
              >
                <p className="m-0">
                  <Speech text={HELLO} name="m1" hidden />
                  <Speech text={READY} name="m2" />
                </p>
                <svg width="24" height="14" viewBox="0 0 24 14" aria-hidden="true" style={{ position: "absolute", left: "50%", bottom: -12, marginLeft: -12, display: "block" }}>
                  <polygon points="0,0 12,12 24,0" fill="#FFFFFF" />
                  <polyline points="0,1 12,12 24,1" fill="none" stroke="#E5E5E5" strokeWidth="2" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            <img
              data-lk="mascot"
              data-lk-anim=""
              src={MASCOT.point}
              alt="Moovy, il coach di Hypemove"
              width="160"
              height="240"
              draggable="false"
              style={{ position: "absolute", left: 115, top: 200, width: 160, height: 240, display: "block", objectFit: "contain", transformOrigin: "0 0", userSelect: "none" }}
            />
          </div>
        </div>

        <section className="relative z-10 mt-3 flex flex-col gap-3 px-6">
          <a
            href={PLAY_STORE_URL}
            data-link="android"
            data-lk="cta1"
            data-lk-anim=""
            rel="noopener"
            className="lk-btn flex h-14 items-center justify-center gap-2.5 rounded-2xl border-b-4 border-[#C76B00] bg-[#FB8B04] text-[17px] font-extrabold text-ink"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" aria-hidden="true">
              <path d="M7 4.5v15l12-7.5z" />
            </svg>
            Scarica per Android
          </a>
          <a
            href="/iphone"
            data-link="iphone"
            data-lk="cta2"
            data-lk-anim=""
            className="lk-btn flex h-14 items-center justify-center gap-2.5 rounded-2xl border-2 border-b-4 border-[#E5E5E5] bg-white text-base font-extrabold text-ink"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
              <path d="M10.5 18.5h3" />
            </svg>
            Su iPhone: installa la prova
          </a>
        </section>

        <nav data-lk="foot" data-lk-anim="" aria-label="Altro su Hypemove" className="relative z-10 mt-4 flex items-center justify-center gap-3.5 px-6">
          <a href="/coach-ai" data-link="coach" className="lk-foot inline-flex min-h-11 items-center text-sm font-bold text-ink-2">Il coach</a>
          <span aria-hidden="true" className="h-[3px] w-[3px] rounded-full bg-[#B4AFA4]" />
          <a href="/guide" data-link="guide" className="lk-foot inline-flex min-h-11 items-center text-sm font-bold text-ink-2">Le guide</a>
          <span aria-hidden="true" className="h-[3px] w-[3px] rounded-full bg-[#B4AFA4]" />
          <a href="/" data-link="sito" className="lk-foot inline-flex min-h-11 items-center text-sm font-bold text-ink-2">Il sito</a>
        </nav>
      </div>
      <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />
    </div>
  );
}
