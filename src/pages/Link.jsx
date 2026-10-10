import React from "react";
import { PLAY_STORE_URL } from "../site.js";

// Pagina "link in bio" per Instagram (e per qualsiasi social: ?s=tiktok, ?s=facebook…).
// HTML statico come il resto del sito, niente bundle React: lo script in fondo conta visite e
// tocchi in public.link_page_events e mette la sorgente nel link del Play Store, così
// l'install referrer arriva all'app con utm_medium=linkinbio e il funnel la riconosce.

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

// Schermate vere dell'app: la striscia le mostra due volte di fila per girare senza scatti.
const SHOTS = [
  { name: "coach-kettlebell", alt: "Il Coach AI crea in chat un allenamento di 5 minuti" },
  { name: "coach-calorie", alt: "Il coach legge le calorie dalla foto di un piatto" },
  { name: "progressi", alt: "La tua forma da 0 a 100" },
  { name: "classifica", alt: "La classifica del mese" },
];

const CSS = `
.lk-track{animation:lk-marquee 36s linear infinite}
@keyframes lk-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.lk-strip{-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 40px,#000 calc(100% - 40px),transparent 100%);mask-image:linear-gradient(90deg,transparent 0,#000 40px,#000 calc(100% - 40px),transparent 100%)}
.lk-cta{transition:background-color .18s ease,transform .18s ease}
.lk-cta:hover{background-color:#F58A22}
.lk-cta:active,.lk-ghost:active{transform:scale(.985)}
.lk-ghost{transition:border-color .18s ease,transform .18s ease}
.lk-ghost:hover{border-color:#171512}
@media (prefers-reduced-motion: reduce){.lk-track{animation:none}}
`;

const SCRIPT = `(function(){
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
})();`;

function Shot({ name, alt, hidden }) {
  return (
    <img
      src={`/images/opt/app-${name}-360.webp`}
      srcSet={`/images/opt/app-${name}-360.webp 360w, /images/opt/app-${name}-720.webp 720w`}
      sizes="180px"
      alt={hidden ? "" : alt}
      aria-hidden={hidden ? "true" : undefined}
      width="180"
      height="356"
      loading="eager"
      decoding="async"
      className="mr-[18px] block h-full w-auto flex-none mix-blend-multiply"
    />
  );
}

export default function Link() {
  return (
    <div className="min-h-[100svh] bg-surface text-ink">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="mx-auto flex min-h-[100svh] max-w-[440px] flex-col pb-5 pt-2">
        <header className="flex h-11 items-center px-6">
          <a href="/" data-link="sito" aria-label="Hypemove, il sito" className="relative block h-[30px] w-[132px] overflow-hidden">
            <img src="/images/opt/logo1-512.webp" alt="" width="140" height="140" className="absolute left-[-4px] top-[-53px] block h-[140px] w-[140px] max-w-none mix-blend-multiply" />
          </a>
        </header>

        <section className="mt-[clamp(12px,3.5svh,32px)] flex flex-col gap-3 px-6">
          <h1 className="m-0 whitespace-nowrap font-display text-[38px] font-extrabold leading-[38px]">
            Torna a muoverti.
            <br />
            <span className="text-ink-3">Questa volta per davvero.</span>
          </h1>
          <p className="m-0 text-base leading-[22px] text-ink-2">Allenamenti a casa da 5, 10 o 15 minuti.</p>
        </section>

        <section aria-label="Schermate dell'app" className="lk-strip mt-[clamp(16px,4svh,36px)] h-[min(372px,40svh)] overflow-hidden">
          <div className="lk-track flex h-full w-max items-center py-2">
            {SHOTS.map((shot) => <Shot key={shot.name} {...shot} />)}
            {SHOTS.map((shot) => <Shot key={`${shot.name}-bis`} {...shot} hidden />)}
          </div>
        </section>

        <section className="mt-[clamp(16px,3.5svh,28px)] flex flex-col gap-2.5 px-6">
          <a href={PLAY_STORE_URL} data-link="android" rel="noopener" className="lk-cta flex h-14 items-center justify-center gap-2.5 rounded-2xl bg-orange text-[17px] font-extrabold text-ink">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" aria-hidden="true">
              <path d="M7 4.5v15l12-7.5z" />
            </svg>
            Scarica per Android
          </a>
          <a href="/iphone" data-link="iphone" className="lk-ghost flex h-14 items-center justify-center gap-2.5 rounded-2xl border-[1.5px] border-[#D9D6CF] text-base font-extrabold text-ink">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
              <path d="M10.5 18.5h3" />
            </svg>
            Su iPhone: installa la prova
          </a>
        </section>

        <nav aria-label="Altro su Hypemove" className="mt-auto flex items-center justify-center gap-3.5 px-6 pt-6">
          <a href="/coach-ai" data-link="coach" className="inline-flex min-h-11 items-center text-sm font-bold text-ink-2 hover:text-ink">Il coach</a>
          <span aria-hidden="true" className="h-[3px] w-[3px] rounded-full bg-[#B4AFA4]" />
          <a href="/guide" data-link="guide" className="inline-flex min-h-11 items-center text-sm font-bold text-ink-2 hover:text-ink">Le guide</a>
          <span aria-hidden="true" className="h-[3px] w-[3px] rounded-full bg-[#B4AFA4]" />
          <a href="/" data-link="sito" className="inline-flex min-h-11 items-center text-sm font-bold text-ink-2 hover:text-ink">Il sito</a>
        </nav>
      </div>
      <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />
    </div>
  );
}
