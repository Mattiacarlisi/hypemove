import React from "react";
import { Faq, IphoneButton, Layout, Section, SectionHead } from "../components/Layout.jsx";
import { SITE_URL, SUPPORT_EMAIL, breadcrumb, faqSchema } from "../site.js";

// Pagina iPhone. Su iPhone Hypemove non è ancora sull'App Store: si installa dalla
// versione di prova con TestFlight (il link sta in site.js). La lista d'attesa resta,
// ma ora serve solo a chi preferisce aspettare la pubblicazione sull'App Store:
// usa Netlify Forms, le iscrizioni si leggono nel pannello Netlify (Forms).
export const iphoneFaqs = [
  {
    q: "Hypemove si può usare su iPhone?",
    a: "Sì, nella versione di prova. Non è ancora sull'App Store: si installa gratis con TestFlight, l'app con cui Apple distribuisce le versioni di prova.",
  },
  {
    q: "Cos'è TestFlight e perché serve",
    a: "È l'app ufficiale di Apple per provare un'app prima che arrivi sull'App Store. Si scarica gratis dall'App Store, poi si apre il nostro invito e si tocca Installa. Hypemove compare sulla schermata come tutte le altre app.",
  },
  {
    q: "La versione di prova è limitata?",
    a: "No, è l'app completa: il percorso a tappe, gli allenamenti con i video degli esercizi, i punti e il Coach AI. L'unica differenza è che ogni tanto TestFlight ti chiede di installare la versione aggiornata.",
  },
  {
    q: "Quando arriva sull'App Store?",
    a: "Ci stiamo lavorando. Se preferisci aspettare, lascia la mail in questa pagina: ti scriviamo il giorno in cui è pubblicata, una sola email e niente altro.",
  },
];

export const meta = {
  title: "Hypemove su iPhone: installa la versione di prova",
  description: "Su iPhone Hypemove si installa gratis con TestFlight, ed è la stessa app di Android. Qui trovi i tre passaggi, oppure lascia la mail per l'arrivo sull'App Store.",
  ogImage: `${SITE_URL}/images/og/home.jpg`,
  ogImageAlt: "Hypemove per iPhone, la versione di prova con TestFlight",
  type: "website",
  modified: "2026-09-11",
  jsonld: [
    { "@type": "WebPage", "@id": `${SITE_URL}/iphone#webpage`, url: `${SITE_URL}/iphone`, name: "Hypemove per iPhone", isPartOf: { "@id": `${SITE_URL}/#website` }, inLanguage: "it-IT" },
    faqSchema(iphoneFaqs),
    breadcrumb([{ name: "Home", path: "/" }, { name: "iPhone", path: "/iphone" }]),
  ],
};

export const grazieMeta = {
  title: "Grazie, ti avvisiamo noi",
  description: "Iscrizione alla lista d'attesa di Hypemove per l'App Store completata.",
  robots: "noindex, follow",
  type: "website",
  modified: "2026-09-11",
  jsonld: [],
};

const steps = [
  {
    n: "1",
    title: "Tocca il bottone qui sopra",
    text: "Si apre TestFlight. Se non ce l'hai, l'iPhone ti porta a scaricarlo dall'App Store: è gratis e serve solo a installare la prova.",
  },
  {
    n: "2",
    title: "Accetta l'invito e installa",
    text: "Dentro TestFlight trovi Hypemove: tocca Installa e l'app compare sulla schermata come tutte le altre.",
  },
  {
    n: "3",
    title: "Apri e fai la prima tappa",
    text: "Dici il tuo obiettivo e quanto tempo hai. La prima tappa è lì, come su Android.",
  },
];

export default function Iphone() {
  return (
    <Layout mobileBar={false}>
      <Section>
        <div className="mx-auto max-w-[640px]">
          <SectionHead
            variant="stack"
            as="h1"
            kicker="iPhone"
            title="Su iPhone c'è. È la versione di prova."
            sub="Hypemove non è ancora sull'App Store: si installa con TestFlight, l'app con cui Apple distribuisce le versioni di prova. È gratis e ci vogliono due minuti."
          />
          <div className="mt-7">
            <IphoneButton className="btn-primary w-full sm:w-auto" location="iphone_page">Installa Hypemove su iPhone</IphoneButton>
          </div>
          <ol className="mt-10 grid gap-5">
            {steps.map((step) => (
              <li key={step.n} className="flex gap-4">
                <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full bg-orange font-display text-lg font-extrabold text-white" aria-hidden="true">{step.n}</span>
                <span>
                  <span className="block font-extrabold">{step.title}</span>
                  <span className="mt-1 block text-ink-2">{step.text}</span>
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-10 rounded-2xl bg-surface p-6 ring-1 ring-rule">
            <h2 className="font-sans text-xl font-extrabold">Versione di prova non vuol dire versione ridotta</h2>
            <p className="mt-2 text-ink-2">
              È l'app vera: il percorso a tappe, gli allenamenti con i video, i punti e il Coach AI. La teniamo su TestFlight per raccogliere i primi riscontri da chi usa l'iPhone, prima di pubblicarla sull'App Store. Se qualcosa non funziona scrivici a <a href={`mailto:${SUPPORT_EMAIL}`} className="font-bold underline underline-offset-2">{SUPPORT_EMAIL}</a>: leggiamo tutto.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="peach">
        <div className="mx-auto max-w-[560px]">
          <SectionHead variant="stack" kicker="App Store" title="Preferisci aspettare l'App Store?" sub="Lascia la mail: ti scriviamo il giorno in cui Hypemove è pubblicata. Una sola email, niente altro." />
          <form name="iphone-waitlist" method="POST" action="/iphone/grazie" data-netlify="true" netlify-honeypot="sito-web" className="mt-8 grid gap-4">
            <input type="hidden" name="form-name" value="iphone-waitlist" />
            <p className="hidden" aria-hidden="true">
              <label>Non compilare: <input name="sito-web" tabIndex="-1" autoComplete="off" /></label>
            </p>
            <label className="grid gap-1.5">
              <span className="text-sm font-extrabold">La tua email</span>
              <input type="email" name="email" required autoComplete="email" inputMode="email" placeholder="nome@esempio.it" className="h-14 rounded-xl border-[1.5px] border-rule bg-white px-4 text-base text-ink placeholder:text-ink-3 focus:border-orange" />
            </label>
            <label className="flex items-start gap-3 text-sm text-ink-2">
              <input type="checkbox" name="consenso" required className="mt-1 h-5 w-5 accent-orange" />
              <span>Accetto di ricevere una sola email quando Hypemove arriva sull'App Store. Dati trattati come da <a href="/legal/privacy.html" className="font-bold underline underline-offset-2">Privacy Policy</a>.</span>
            </label>
            <button type="submit" className="btn-primary">Avvisami quando arriva</button>
          </form>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-[760px]">
          <SectionHead variant="stack" kicker="Domande" title="Quello che chiedono in tanti." />
          <Faq items={iphoneFaqs} className="mt-6 max-w-none" />
        </div>
      </Section>
    </Layout>
  );
}

export function IphoneGrazie() {
  return (
    <Layout mobileBar={false}>
      <Section>
        <div className="mx-auto max-w-[560px] text-center">
          <div className="kicker">Fatto</div>
          <h1 className="mt-3 text-5xl sm:text-6xl">Grazie. Ti scriviamo noi.</h1>
          <p className="mt-4 text-lg text-ink-2">Una sola email, il giorno in cui Hypemove arriva sull'App Store. Se nel frattempo vuoi già provarla, la versione di prova si installa subito con TestFlight.</p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <IphoneButton className="btn-primary" location="iphone_grazie">Installa la prova su iPhone</IphoneButton>
            <a href="/" className="btn-ghost">Torna alla home</a>
          </div>
        </div>
      </Section>
    </Layout>
  );
}
