import React from "react";
import { ArrowRight, CheckCircle2, Download, XCircle } from "lucide-react";
import GuideFooter from "../components/GuideFooter.jsx";

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=pt.app&hl=it";

const beginnerBenefits = [
  {
    title: "Workout semplici da iniziare",
    text: "Sessioni brevi e guidate, così non perdi energie a capire cosa fare. Apri l'app e inizi.",
  },
  {
    title: "Percorso più adatto al tuo obiettivo",
    text: "Vuoi dimagrire, tonificarti o muoverti meglio? Parti da una direzione chiara invece di fare esercizi a caso.",
  },
  {
    title: "Un sistema che ti aiuta a continuare",
    text: "Progressi visibili, coinvolgimento e piccoli reward rendono più facile tornare anche domani.",
  },
];

const idealFor = [
  "Non ti alleni da mesi o anni",
  "Ti senti fuori forma e vuoi ripartire senza stress",
  "Hai poco tempo durante la giornata",
  "Hai già mollato tante volte",
  "Vuoi allenarti a casa senza palestra",
  "Cerchi qualcosa di semplice e sostenibile",
];

const notIdealFor = [
  "Vuoi programmi da bodybuilder",
  "Cerchi allenamenti estremi ogni giorno",
  "Sei già molto avanzato e super costante",
  "Vuoi risultati magici in una settimana",
];

const faqs = [
  {
    q: "Serve essere già in forma?",
    a: "No. Hypemove nasce proprio per chi parte da zero.",
  },
  {
    q: "Serve attrezzatura?",
    a: "No, puoi allenarti a casa senza palestra.",
  },
  {
    q: "Quanto durano gli allenamenti?",
    a: "Da 5, 10, 15 minuti o più, in base al percorso.",
  },
  {
    q: "È gratis?",
    a: "Sì, puoi iniziare gratis.",
  },
];

function LogoMark() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
      <span className="text-lg font-black tracking-[-0.06em]">H</span>
    </div>
  );
}

function CtaButton({ children = "Provala gratis" }) {
  return (
    <a
      href={PLAY_STORE_URL}
      className="group inline-flex min-h-[56px] items-center justify-center rounded-full bg-black px-6 py-4 text-base font-semibold text-white transition hover:-translate-y-0.5 sm:px-7"
    >
      <Download className="mr-2 h-4 w-4" />
      {children}
      <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
    </a>
  );
}

function SectionHeader({ eyebrow, title, children }) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <div className="inline-flex rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black/60">
          {eyebrow}
        </div>
      ) : null}
      <h2 className="mt-5 text-3xl font-black tracking-[-0.05em] text-black sm:text-5xl">
        {title}
      </h2>
      {children ? <div className="mt-5 space-y-5 text-base leading-8 text-black/65 sm:text-lg">{children}</div> : null}
    </div>
  );
}

export default function AppFitnessPrincipianti() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-black">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#FDFDFD]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center gap-3">
            <LogoMark />
            <div>
              <div className="text-base font-black tracking-[-0.03em]">Hypemove</div>
              <div className="text-xs text-black/45">App fitness per principianti</div>
            </div>
          </a>
          <a
            href={PLAY_STORE_URL}
            className="hidden rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 sm:inline-flex"
          >
            Provala gratis
          </a>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(0,0,0,0.9)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.9)_1px,transparent_1px)] [background-size:48px_48px]" />
          <div className="pointer-events-none absolute right-[-12%] top-10 h-72 w-72 rounded-full bg-[#FB8B04]/12 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.55fr)]">
            <div>
              <div className="inline-flex rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black/60">
                Per chi parte da zero
              </div>
              <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[0.95] tracking-[-0.06em] text-black sm:text-6xl lg:text-7xl">
                Un'app fitness pensata davvero per chi parte da zero
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-black/65 sm:text-xl sm:leading-9">
                Molte app sembrano fatte per persone già motivate, già allenate o già costanti.
                Hypemove nasce per l'opposto: chi vuole stare meglio, ma fa fatica a iniziare e continuare.
              </p>
              <div className="mt-8">
                <CtaButton />
              </div>
            </div>

            <div className="rounded-[30px] border border-black/10 bg-white p-6 shadow-[0_30px_90px_rgba(0,0,0,0.08)]">
              <div className="text-sm font-bold uppercase tracking-[0.22em] text-[#FB8B04]">
                Hypemove beginner system
              </div>
              <div className="mt-5 space-y-4">
                {["Parti piano", "Segui un percorso", "Torna domani"].map((item, index) => (
                  <div key={item} className="flex items-center gap-4 border-t border-black/10 pt-4 first:border-t-0 first:pt-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-black text-sm font-black text-white">
                      {index + 1}
                    </div>
                    <div className="text-xl font-black tracking-[-0.04em]">{item}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#FCFBF8] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeader eyebrow="Il problema vero dei principianti" title="Il problema non è la volontà. È il punto di partenza.">
              <p>
                Quando inizi da zero spesso succede sempre la stessa cosa: scarichi un'app, parti motivato,
                dopo pochi giorni salti una volta, poi due, poi smetti. Non perché sei pigro.
                Perché il sistema non era adatto a te.
              </p>
              <p>
                Routine troppo lunghe, livelli troppo avanzati, troppe decisioni da prendere,
                pressione inutile. Tutte cose che fanno mollare chi sta iniziando.
              </p>
            </SectionHeader>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeader eyebrow="Come Hypemove aiuta" title="Come funziona Hypemove" />
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {beginnerBenefits.map((item) => (
                <article key={item.title} className="rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_18px_60px_rgba(0,0,0,0.05)]">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <h3 className="text-2xl font-black tracking-[-0.04em] text-black">{item.title}</h3>
                  <p className="mt-4 text-base leading-8 text-black/65">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-black px-4 py-20 text-white sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
            <div>
              <div className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/65">
                Per chi è perfetta
              </div>
              <h2 className="mt-5 text-3xl font-black tracking-[-0.05em] sm:text-5xl">Hypemove è ideale se...</h2>
              <ul className="mt-8 grid gap-4">
                {idealFor.map((item) => (
                  <li key={item} className="flex gap-3 text-base leading-7 text-white/75">
                    <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#FB8B04]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl sm:p-8">
              <div className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/65">
                Onestà prima di tutto
              </div>
              <h2 className="mt-5 text-3xl font-black tracking-[-0.05em] sm:text-5xl">Forse non fa per te se...</h2>
              <ul className="mt-8 grid gap-4">
                {notIdealFor.map((item) => (
                  <li key={item} className="flex gap-3 text-base leading-7 text-white/72">
                    <XCircle className="mt-1 h-5 w-5 shrink-0 text-white/38" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <div className="inline-flex rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black/60">
                FAQ
              </div>
              <h2 className="mt-5 text-3xl font-black tracking-[-0.05em] text-black sm:text-5xl">Domande frequenti</h2>
            </div>

            <div className="mt-10 space-y-4">
              {faqs.map((faq) => (
                <article key={faq.q} className="rounded-[24px] border border-black/10 bg-white p-5 shadow-[0_18px_50px_rgba(0,0,0,0.04)] sm:p-6">
                  <h3 className="text-xl font-black tracking-[-0.03em] text-black">{faq.q}</h3>
                  <p className="mt-3 text-base leading-7 text-black/65">{faq.a}</p>
                </article>
              ))}
            </div>

            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: faqs.map((faq) => ({
                    "@type": "Question",
                    name: faq.q,
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: faq.a,
                    },
                  })),
                }),
              }}
            />
          </div>
        </section>

        <section className="px-4 pb-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[32px] bg-[#FB8B04] p-6 text-black shadow-[0_35px_100px_rgba(251,139,4,0.22)] sm:p-10 lg:p-14">
            <h2 className="max-w-4xl text-3xl font-black leading-[0.98] tracking-[-0.05em] sm:text-5xl">
              Se hai sempre pensato “non riesco a essere costante”, parti da qui.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-black/70 sm:text-lg">
              Forse non ti serviva più motivazione. Ti serviva un sistema più adatto a come vivi davvero.
            </p>
            <div className="mt-8">
              <CtaButton>Scarica gratis</CtaButton>
            </div>
          </div>
        </section>
      </main>
      <GuideFooter />
    </div>
  );
}
