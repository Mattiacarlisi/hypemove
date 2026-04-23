import React from "react";
import { ArrowRight, CheckCircle2, Download, Home, Timer, XCircle } from "lucide-react";
import GuideFooter from "../components/GuideFooter.jsx";
import { PLAY_STORE_URL, handleAndroidDownloadClick } from "../lib/analytics.js";

const idealFor = [
  "Hai poco tempo durante la giornata",
  "Lavori molto e arrivi scarico",
  "Vuoi ricominciare dopo un periodo fermo",
  "Le routine lunghe ti fanno mollare",
  "Vuoi allenarti a casa senza palestra",
  "Cerchi qualcosa di realistico e semplice",
];

const workoutExample = [
  "1 minuto squat",
  "1 minuto pausa attiva / camminata sul posto",
  "1 minuto push-up semplificati o al muro",
  "1 minuto plank",
  "1 minuto affondi alternati",
  "1 minuto recupero",
  "Ripeti il circuito",
];

const hypemoveHelps = [
  "Workout già pronti e guidati",
  "Percorso in base al tuo obiettivo",
  "Allenamenti a casa facili da iniziare",
  "Progressi e motivazione per continuare",
  "Esperienza pensata per chi non è costante",
];

const faqs = [
  {
    q: "10 minuti al giorno bastano?",
    a: "Per iniziare e creare continuità, spesso sì. Meglio 10 minuti costanti che un'ora ogni tanto.",
  },
  {
    q: "Si dimagrisce con workout da 10 minuti?",
    a: "Il dimagrimento dipende da più fattori, ma muoversi con regolarità aiuta molto più di restare fermi aspettando il momento perfetto.",
  },
  {
    q: "Serve attrezzatura?",
    a: "No, puoi iniziare anche senza attrezzi.",
  },
  {
    q: "Meglio 10 minuti o niente?",
    a: "Quasi sempre sì.",
  },
];

function LogoMark() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
      <span className="text-lg font-black tracking-[-0.06em]">H</span>
    </div>
  );
}

function CtaButton({ children = "Prova Hypemove gratis", location }) {
  return (
    <a
      href={PLAY_STORE_URL}
      onClick={(event) => handleAndroidDownloadClick(event, {
        buttonText: children,
        location,
      })}
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

function TextSection({ eyebrow, title, children }) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? <Kicker>{eyebrow}</Kicker> : null}
      <h2 className="mt-5 text-3xl font-black tracking-[-0.05em] text-black sm:text-5xl">{title}</h2>
      <div className="mt-5 space-y-5 text-base leading-8 text-black/65 sm:text-lg">{children}</div>
    </div>
  );
}

export default function Workout10MinutiCasa() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-black">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#FDFDFD]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center gap-3">
            <LogoMark />
            <div>
              <div className="text-base font-black tracking-[-0.03em]">Hypemove</div>
              <div className="text-xs text-black/45">Workout 10 minuti a casa</div>
            </div>
          </a>
          <a
            href={PLAY_STORE_URL}
            onClick={(event) => handleAndroidDownloadClick(event, {
              buttonText: "Prova gratis",
              location: "guide_workout_10_minuti_navbar",
            })}
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

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(320px,0.58fr)]">
            <div>
              <Kicker>Allenamento breve</Kicker>
              <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[0.95] tracking-[-0.06em] text-black sm:text-6xl lg:text-7xl">
                Workout di 10 minuti a casa: semplice, utile e fattibile davvero
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-black/65 sm:text-xl sm:leading-9">
                Se hai poco tempo, poca energia o fai fatica a essere costante, 10 minuti possono essere il punto giusto da cui ripartire.
                Non servono sessioni infinite per iniziare a stare meglio.
              </p>
              <div className="mt-8">
                <CtaButton location="guide_workout_10_minuti_hero" />
              </div>
            </div>

            <div className="grid gap-5">
              <img
                src="/images/WorkoutDetails.png"
                alt="workout di 10 minuti nell'app Hypemove"
                className="mx-auto max-h-[560px] w-full max-w-[320px] rounded-[32px] object-cover shadow-[0_30px_90px_rgba(0,0,0,0.12)]"
              />
            </div>
          </div>
        </section>

        <section className="bg-[#FCFBF8] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <TextSection eyebrow="Perché 10 minuti funzionano" title="Perché un workout di 10 minuti può funzionare davvero">
              <p>
                Molte persone pensano che allenarsi serva solo se hai un'ora libera.
                In realtà il problema principale non è la durata. È la continuità.
              </p>
              <p>
                Dieci minuti sono abbastanza brevi da entrare nella giornata, ma abbastanza lunghi da farti muovere davvero.
                Ed è proprio questo che spesso manca: qualcosa di sostenibile.
              </p>
            </TextSection>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.7fr)]">
            <div>
              <Kicker>A chi è utile</Kicker>
              <h2 className="mt-5 text-3xl font-black tracking-[-0.05em] text-black sm:text-5xl">
                Questo tipo di allenamento è ideale se...
              </h2>
              <ul className="mt-8 grid gap-4">
                {idealFor.map((item) => (
                  <li key={item} className="flex gap-3 text-base leading-7 text-black/68">
                    <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#FB8B04]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <img
              src="/images/home-workout-10-minuti.svg"
              alt="allenamento di 10 minuti a casa senza attrezzi"
              className="w-full rounded-[32px] border border-black/10 bg-white object-cover shadow-[0_30px_90px_rgba(0,0,0,0.08)]"
            />
          </div>
        </section>

        <section className="bg-black px-4 py-20 text-white sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(320px,0.7fr)]">
            <div>
              <Kicker dark>Esempio pratico</Kicker>
              <h2 className="mt-5 text-3xl font-black tracking-[-0.05em] sm:text-5xl">
                Esempio di workout da 10 minuti a casa
              </h2>
              <p className="mt-5 text-base leading-8 text-white/70 sm:text-lg">Allenamento base senza attrezzatura:</p>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
                È solo un esempio. La cosa importante non è fare il workout perfetto, ma iniziare con qualcosa che riesci a mantenere.
              </p>
            </div>
            <ol className="grid gap-3">
              {workoutExample.map((item, index) => (
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
          <div className="mx-auto max-w-7xl">
            <TextSection eyebrow="Il blocco vero" title="Perché tanti mollano anche con workout brevi">
              <p>
                Perché non basta che il workout sia corto.
                Serve anche sapere cosa fare, sentirlo adatto a te e avere voglia di tornare domani.
              </p>
              <p>
                Quando ogni giorno devi decidere tutto da zero, anche 10 minuti diventano pesanti.
              </p>
            </TextSection>
          </div>
        </section>

        <section className="bg-[#FCFBF8] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(320px,0.7fr)]">
            <div>
              <Kicker>Dove entra Hypemove</Kicker>
              <h2 className="mt-5 text-3xl font-black tracking-[-0.05em] text-black sm:text-5xl">
                Come Hypemove ti aiuta con workout da 10 minuti
              </h2>
            </div>
            <ul className="grid gap-3">
              {hypemoveHelps.map((item) => (
                <li key={item} className="flex gap-3 rounded-[22px] border border-black/10 bg-white p-4 text-base leading-7 text-black/68 shadow-[0_16px_50px_rgba(0,0,0,0.04)]">
                  <Home className="mt-1 h-5 w-5 shrink-0 text-[#FB8B04]" />
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
            <Timer className="h-10 w-10" />
            <h2 className="mt-5 max-w-4xl text-3xl font-black leading-[0.98] tracking-[-0.05em] sm:text-5xl">
              Se aspetti il momento perfetto, spesso non inizi mai.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-black/70 sm:text-lg">
              Dieci minuti possono essere abbastanza per rimetterti in moto oggi.
            </p>
            <div className="mt-8">
              <CtaButton location="guide_workout_10_minuti_final">Scarica Hypemove gratis</CtaButton>
            </div>
          </div>
        </section>
      </main>
      <GuideFooter currentHref="/workout-10-minuti-casa" />
    </div>
  );
}
