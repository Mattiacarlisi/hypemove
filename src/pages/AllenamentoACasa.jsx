import React from "react";
import { ArrowRight, CheckCircle2, Download, Home, ListChecks } from "lucide-react";
import GuideFooter from "../components/GuideFooter.jsx";
import { PLAY_STORE_URL, handleAndroidDownloadClick } from "../lib/analytics.js";

const homeReasons = [
  "Zero spostamenti",
  "Più flessibilità di orario",
  "Meno pressione sociale",
  "Più facile iniziare anche con poco tempo",
  "Costi ridotti rispetto a molte alternative",
];

const startSteps = [
  "Parti con sessioni brevi e realistiche",
  "Stabilisci giorni semplici da rispettare",
  "Usa workout guidati invece di improvvisare",
  "Non cercare perfezione immediata",
  "Punta prima alla continuità",
];

const hypemoveHelps = [
  "Workout guidati e già pronti",
  "Percorsi in base all'obiettivo",
  "Sessioni brevi e realistiche",
  "Più facilità nel restare costante",
  "Esperienza pensata per persone normali, non atleti professionisti",
];

const faqs = [
  {
    q: "L'allenamento a casa funziona davvero?",
    a: "Sì, se il programma è coerente e sostenibile nel tempo.",
  },
  {
    q: "Meglio casa o palestra?",
    a: "Dipende dalla persona. Per molti iniziare a casa è più realistico.",
  },
  {
    q: "Serve molto tempo?",
    a: "No, spesso si può iniziare anche con sessioni brevi.",
  },
  {
    q: "È adatto ai principianti?",
    a: "Sì, soprattutto se guidato bene.",
  },
];

function LogoMark() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
      <span className="text-lg font-black tracking-[-0.06em]">H</span>
    </div>
  );
}

function CtaButton({ children = "Scopri Hypemove", href = PLAY_STORE_URL, location }) {
  const isAndroidDownload = href === PLAY_STORE_URL;

  return (
    <a
      href={href}
      onClick={isAndroidDownload ? (event) => handleAndroidDownloadClick(event, {
        buttonText: children,
        href,
        location,
      }) : undefined}
      className="group inline-flex min-h-[56px] items-center justify-center rounded-full bg-black px-6 py-4 text-base font-semibold text-white transition hover:-translate-y-0.5 sm:px-7"
    >
      <Download className="mr-2 h-4 w-4" />
      {children}
      <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
    </a>
  );
}

function Kicker({ children, dark = false }) {
  return (
    <div
      className={`inline-flex rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
        dark ? "border-white/10 bg-white/10 text-white/65" : "border-black/10 bg-white text-black/60"
      }`}
    >
      {children}
    </div>
  );
}

function TextSection({ eyebrow, title, children, dark = false }) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? <Kicker dark={dark}>{eyebrow}</Kicker> : null}
      <h2 className={`mt-5 text-3xl font-black tracking-[-0.05em] sm:text-5xl ${dark ? "text-white" : "text-black"}`}>
        {title}
      </h2>
      <div className={`mt-5 space-y-5 text-base leading-8 sm:text-lg ${dark ? "text-white/70" : "text-black/65"}`}>
        {children}
      </div>
    </div>
  );
}

function InternalLinks() {
  const links = [
    { href: "/app-fitness-principianti", label: "App fitness per principianti" },
    { href: "/workout-10-minuti-casa", label: "Workout 10 minuti a casa" },
    { href: "/mini-workout-efficaci", label: "Mini workout efficaci" },
    { href: "/guide", label: "Tutte le guide" },
  ];

  return (
    <nav aria-label="Link utili" className="mt-8 flex flex-wrap gap-3">
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="inline-flex items-center rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black/65 transition hover:-translate-y-0.5 hover:border-black/20 hover:text-black"
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}

export default function AllenamentoACasa() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-black">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#FDFDFD]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center gap-3">
            <LogoMark />
            <div>
              <div className="text-base font-black tracking-[-0.03em]">Hypemove</div>
              <div className="text-xs text-black/45">Allenamento a casa</div>
            </div>
          </a>
          <a
            href="/guide"
            className="hidden rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-black/70 transition hover:-translate-y-0.5 hover:border-black/20 hover:text-black sm:inline-flex"
          >
            Guide
          </a>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(0,0,0,0.9)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.9)_1px,transparent_1px)] [background-size:48px_48px]" />
          <div className="pointer-events-none absolute right-[-12%] top-10 h-72 w-72 rounded-full bg-[#FB8B04]/12 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.55fr)]">
            <div>
              <Kicker>Guida pratica</Kicker>
              <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[0.95] tracking-[-0.06em] text-black sm:text-6xl lg:text-7xl">
                Allenamento a casa: come iniziare in modo semplice e sostenibile
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-black/65 sm:text-xl sm:leading-9">
                Allenarsi a casa può funzionare molto bene, ma solo se il piano è realistico.
                Non serve trasformare il salotto in una palestra. Serve un sistema che riesci davvero a seguire.
              </p>
              <div className="mt-8">
                <CtaButton location="guide_allenamento_a_casa_hero" />
              </div>
              <InternalLinks />
            </div>

            <div className="rounded-[32px] border border-black/10 bg-white p-6 shadow-[0_30px_90px_rgba(0,0,0,0.08)]">
              <Home className="h-10 w-10 text-[#FB8B04]" />
              <div className="mt-5 text-4xl font-black tracking-[-0.06em]">Casa, poco tempo, zero caos.</div>
              <p className="mt-4 text-base leading-8 text-black/62">
                Il punto non è fare tutto subito. È creare un modo semplice per muoverti oggi e tornare anche domani.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-[#FCFBF8] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Kicker>Perché casa</Kicker>
            <h2 className="mt-5 max-w-3xl text-3xl font-black tracking-[-0.05em] text-black sm:text-5xl">
              Perché sempre più persone scelgono l'allenamento a casa
            </h2>
            <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {homeReasons.map((item) => (
                <li key={item} className="rounded-[24px] border border-black/10 bg-white p-5 text-base font-semibold leading-7 text-black/70 shadow-[0_16px_50px_rgba(0,0,0,0.04)]">
                  <CheckCircle2 className="mb-4 h-5 w-5 text-[#FB8B04]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <TextSection eyebrow="Il problema reale" title="Il problema non è casa. È il metodo.">
              <p>
                Molte persone falliscono con l'allenamento a casa non perché sia inefficace,
                ma perché iniziano con programmi troppo lunghi, confusi o difficili da mantenere.
              </p>
              <p>
                Quando ogni sessione richiede troppa energia mentale, è facile rimandare.
              </p>
            </TextSection>
          </div>
        </section>

        <section className="bg-black px-4 py-20 text-white sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(320px,0.75fr)]">
            <TextSection dark eyebrow="Come iniziare bene" title="Come iniziare bene ad allenarti a casa">
              <p>
                Se parti semplice, è più facile non mollare dopo pochi giorni.
              </p>
            </TextSection>

            <ol className="grid gap-3">
              {startSteps.map((item, index) => (
                <li key={item} className="flex items-center gap-4 rounded-[22px] border border-white/10 bg-white/[0.05] p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FB8B04] text-sm font-black text-black">
                    {index + 1}
                  </div>
                  <span className="text-base font-semibold text-white/82">{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
            <TextSection eyebrow="Attrezzatura" title="Serve attrezzatura?">
              <p>
                Non necessariamente. Molte persone possono iniziare con esercizi a corpo libero.
                L'attrezzatura può essere utile in seguito, ma non è obbligatoria per partire.
              </p>
            </TextSection>

            <TextSection eyebrow="Tempo" title="Quanto tempo serve davvero?">
              <p>
                Dipende dall'obiettivo e dal livello di partenza.
                Per molte persone, iniziare con 5, 10 o 15 minuti ben fatti è molto più efficace di aspettare l'ora perfetta che non arriva mai.
              </p>
            </TextSection>
          </div>
        </section>

        <section className="bg-[#FCFBF8] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(320px,0.7fr)]">
            <div>
              <Kicker>Hypemove</Kicker>
              <h2 className="mt-5 text-3xl font-black tracking-[-0.05em] text-black sm:text-5xl">
                Come Hypemove semplifica l'allenamento a casa
              </h2>
              <InternalLinks />
            </div>
            <ul className="grid gap-3">
              {hypemoveHelps.map((item) => (
                <li key={item} className="flex gap-3 rounded-[22px] border border-black/10 bg-white p-4 text-base leading-7 text-black/68 shadow-[0_16px_50px_rgba(0,0,0,0.04)]">
                  <ListChecks className="mt-1 h-5 w-5 shrink-0 text-[#FB8B04]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <Kicker>FAQ</Kicker>
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
              Non ti serve il setup perfetto. Ti serve iniziare.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-black/70 sm:text-lg">
              Se vuoi allenarti a casa in modo più semplice e sostenibile, Hypemove può aiutarti a partire con il piede giusto.
            </p>
            <div className="mt-8">
              <CtaButton href="/">Vai alla Home</CtaButton>
            </div>
          </div>
        </section>
      </main>

      <GuideFooter />
    </div>
  );
}
