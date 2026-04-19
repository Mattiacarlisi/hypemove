import React from "react";
import { ArrowRight, CheckCircle2, Download, MinusCircle, Timer } from "lucide-react";

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=pt.app&hl=it";

const effectiveWhen = [
  "Quando parti da zero",
  "Quando sei sedentario",
  "Quando hai poco tempo",
  "Quando fai fatica a essere costante",
  "Quando vuoi riprendere movimento gradualmente",
  "Quando vuoi creare una routine sostenibile",
];

const notEnoughWhen = [
  "Obiettivi sportivi avanzati",
  "Alti livelli di performance",
  "Preparazioni specifiche agonistiche",
  "Allenamento di forza strutturato avanzato",
  "Se il resto dello stile di vita è completamente fermo",
];

const faqs = [
  {
    q: "5 minuti servono davvero?",
    a: "Meglio di zero minuti, e spesso abbastanza per creare continuità.",
  },
  {
    q: "10 minuti bastano per stare meglio?",
    a: "Per molte persone possono essere un ottimo inizio, soprattutto se fatti con regolarità.",
  },
  {
    q: "Mini workout o palestra?",
    a: "Dipende dall'obiettivo e dalla persona. Molti iniziano meglio con qualcosa di più semplice.",
  },
  {
    q: "È meglio poco spesso o tanto raramente?",
    a: "Nella pratica quotidiana, la costanza conta moltissimo.",
  },
];

function LogoMark() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
      <span className="text-lg font-black tracking-[-0.06em]">H</span>
    </div>
  );
}

function CtaButton({ children = "Prova Hypemove gratis" }) {
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
    { href: "/workout-10-minuti-casa", label: "Workout 10 minuti a casa" },
    { href: "/app-fitness-principianti", label: "App fitness per principianti" },
    { href: "/", label: "Homepage Hypemove" },
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

export default function MiniWorkoutEfficaci() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-black">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#FDFDFD]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center gap-3">
            <LogoMark />
            <div>
              <div className="text-base font-black tracking-[-0.03em]">Hypemove</div>
              <div className="text-xs text-black/45">Mini workout efficaci</div>
            </div>
          </a>
          <a
            href={PLAY_STORE_URL}
            className="hidden rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 sm:inline-flex"
          >
            Prova gratis
          </a>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(0,0,0,0.9)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.9)_1px,transparent_1px)] [background-size:48px_48px]" />
          <div className="pointer-events-none absolute right-[-12%] top-10 h-72 w-72 rounded-full bg-[#FB8B04]/12 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.55fr)]">
            <div>
              <Kicker>5 o 10 minuti</Kicker>
              <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[0.95] tracking-[-0.06em] text-black sm:text-6xl lg:text-7xl">
                I mini workout sono davvero efficaci?
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-black/65 sm:text-xl sm:leading-9">
                Dipende da cosa intendi per efficaci. Se cerchi il piano perfetto in teoria, la risposta è una.
                Se cerchi qualcosa che una persona reale riesce davvero a fare con continuità, la risposta cambia molto.
              </p>
              <InternalLinks />
            </div>

            <div className="rounded-[32px] border border-black/10 bg-white p-6 shadow-[0_30px_90px_rgba(0,0,0,0.08)]">
              <Timer className="h-10 w-10 text-[#FB8B04]" />
              <div className="mt-5 text-5xl font-black tracking-[-0.06em]">5-10 min</div>
              <p className="mt-4 text-base leading-8 text-black/62">
                Brevi abbastanza da iniziare. Concreti abbastanza da farti muovere. Utili se diventano ripetibili.
              </p>
              <div className="mt-6">
                <CtaButton />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#FCFBF8] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <TextSection eyebrow="Risposta onesta breve" title="Risposta breve: sì, spesso lo sono">
              <p>
                Un mini workout può essere efficace per migliorare il livello di attività fisica,
                muovere il corpo, aumentare energia, creare abitudine e generare progressi nel tempo.
              </p>
              <p>
                Non sempre sostituisce un programma più completo, ma spesso è immensamente più utile di un piano ideale che non fai mai.
              </p>
            </TextSection>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
            <div>
              <Kicker>Quando funzionano</Kicker>
              <h2 className="mt-5 text-3xl font-black tracking-[-0.05em] text-black sm:text-5xl">
                Quando i mini workout funzionano molto bene
              </h2>
              <ul className="mt-8 grid gap-4">
                {effectiveWhen.map((item) => (
                  <li key={item} className="flex gap-3 text-base leading-7 text-black/68">
                    <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#FB8B04]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[30px] border border-black/10 bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.06)] sm:p-8">
              <Kicker>Quando non bastano</Kicker>
              <h2 className="mt-5 text-3xl font-black tracking-[-0.05em] text-black sm:text-5xl">
                Quando da soli potrebbero non bastare
              </h2>
              <ul className="mt-8 grid gap-4">
                {notEnoughWhen.map((item) => (
                  <li key={item} className="flex gap-3 text-base leading-7 text-black/62">
                    <MinusCircle className="mt-1 h-5 w-5 shrink-0 text-black/32" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-black px-4 py-20 text-white sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <TextSection dark eyebrow="Il punto chiave" title="Il problema non è la durata. È la continuità.">
              <p>
                Molte persone valutano un workout solo in base ai minuti.
                Ma nella vita reale conta anche quante volte riesci a rifarlo.
              </p>
              <p>
                Un allenamento di 45 minuti fatto due volte al mese spesso incide meno di 10 minuti fatti quattro volte a settimana.
              </p>
            </TextSection>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
            <TextSection eyebrow="Per dimagrimento" title="E per dimagrire?">
              <p>
                Il dimagrimento dipende da molti fattori, soprattutto alimentazione, bilancio energetico e continuità.
                I mini workout possono essere molto utili perché aumentano movimento e aiutano a mantenere una routine attiva.
              </p>
              <p>
                Da soli non sono una magia. Ma possono essere una base concreta.
              </p>
            </TextSection>

            <TextSection eyebrow="Perché Hypemove" title="Perché Hypemove crede nei mini workout">
              <p>
                Perché molte persone non hanno bisogno di un piano più duro.
                Hanno bisogno di un piano più realistico.
              </p>
              <p>
                Allenamenti brevi, guidati e facili da iniziare possono trasformare il movimento da peso mentale a cosa sostenibile.
              </p>
            </TextSection>
          </div>
        </section>

        <section className="bg-[#FCFBF8] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
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

        <section className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[32px] bg-[#FB8B04] p-6 text-black shadow-[0_35px_100px_rgba(251,139,4,0.22)] sm:p-10 lg:p-14">
            <h2 className="max-w-4xl text-3xl font-black leading-[0.98] tracking-[-0.05em] sm:text-5xl">
              Non chiederti solo se è abbastanza.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-black/70 sm:text-lg">
              Chiediti anche se è qualcosa che riuscirai davvero a rifare settimana prossima.
            </p>
            <div className="mt-8">
              <CtaButton />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
