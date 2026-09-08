import React from "react";
import { Layout, Section, SectionHead } from "../components/Layout.jsx";
import { SITE_URL, breadcrumb } from "../site.js";

// Lista d'attesa iPhone. Il modulo usa Netlify Forms: niente backend, le iscrizioni
// si leggono nel pannello Netlify (Forms) e si può attivare la notifica via email.
export const meta = {
  title: "Hypemove per iPhone: avvisami quando arriva",
  description: "Hypemove oggi è su Android. Lascia la tua email e ti scriviamo il giorno in cui arriva su iPhone. Niente altro.",
  ogImage: `${SITE_URL}/images/og/home.jpg`,
  ogImageAlt: "Hypemove per iPhone, lista d'attesa",
  type: "website",
  modified: "2026-09-08",
  jsonld: [
    { "@type": "WebPage", "@id": `${SITE_URL}/iphone#webpage`, url: `${SITE_URL}/iphone`, name: "Hypemove per iPhone", isPartOf: { "@id": `${SITE_URL}/#website` }, inLanguage: "it-IT" },
    breadcrumb([{ name: "Home", path: "/" }, { name: "iPhone", path: "/iphone" }]),
  ],
};

export const grazieMeta = {
  title: "Grazie, ti avvisiamo noi",
  description: "Iscrizione alla lista d'attesa di Hypemove per iPhone completata.",
  robots: "noindex, follow",
  type: "website",
  modified: "2026-09-08",
  jsonld: [],
};

export default function Iphone() {
  return (
    <Layout mobileBar={false}>
      <Section>
        <div className="mx-auto max-w-[560px]">
          <SectionHead variant="stack" as="h1" kicker="iPhone" title="Non ancora. Ma ti avvisiamo noi." sub="Hypemove oggi è su Android. La versione per iPhone è in lavorazione: lascia la tua email e ti scriviamo il giorno in cui è pronta. Solo quello, niente altro." />
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
              <span>Accetto di ricevere una sola email quando Hypemove arriva su iPhone. Dati trattati come da <a href="/legal/privacy.html" className="font-bold underline underline-offset-2">Privacy Policy</a>.</span>
            </label>
            <button type="submit" className="btn-primary">Avvisami quando arriva</button>
          </form>
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
          <p className="mt-4 text-lg text-ink-2">Una sola email, il giorno in cui Hypemove arriva su iPhone. Nel frattempo, se hai un telefono Android in casa, il percorso è già lì.</p>
          <a href="/" className="btn-dark mt-7">Torna alla home</a>
        </div>
      </Section>
    </Layout>
  );
}
