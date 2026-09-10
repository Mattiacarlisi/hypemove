import React from "react";
import { Layout, PlayButton, Section, SectionHead } from "../components/Layout.jsx";
import { MATTIA_LINKEDIN_URL, SITE_URL, SUPPORT_EMAIL, breadcrumb } from "../site.js";

export const meta = {
  title: "Chi siamo: le due persone dietro Hypemove",
  description:
    "Hypemove è fatta da Mattia Carlisi, chinesiologo, e Danilo, sviluppatore. Nasce in Italia per chi vuole muoversi di più e non riesce a essere costante.",
  ogImage: `${SITE_URL}/images/og/chi-siamo.jpg`,
  ogImageAlt: "Chi siamo, Hypemove",
  type: "website",
  modified: "2026-09-08",
  jsonld: [
    { "@type": "AboutPage", "@id": `${SITE_URL}/chi-siamo#webpage`, url: `${SITE_URL}/chi-siamo`, name: "Chi siamo", isPartOf: { "@id": `${SITE_URL}/#website` }, about: { "@id": `${SITE_URL}/#organization` }, inLanguage: "it-IT" },
    breadcrumb([{ name: "Home", path: "/" }, { name: "Chi siamo", path: "/chi-siamo" }]),
  ],
};

export default function ChiSiamo() {
  return (
    <Layout current="chi-siamo">
      <Section>
        <SectionHead as="h1" kicker="Chi siamo" title="Due persone, un'app che stiamo costruendo in pubblico." sub="Hypemove non è fatta da una palestra né da un'azienda di fitness. È fatta da due persone in Italia che hanno visto lo stesso problema da vicino: la voglia di muoversi c'è, la costanza no." />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {[
            ["M", "Mattia Carlisi", "Chinesiologo. Ha creato Hypemove per chi vuole muoversi e non riesce a essere costante: gli allenamenti e il percorso a tappe li scrive lui. Racconta il progetto su LinkedIn, numeri compresi.", MATTIA_LINKEDIN_URL, "Mattia su LinkedIn"],
            ["D", "Danilo", "Sviluppatore. Costruisce l'app: il percorso, il coach, i premi, tutto quello che tocchi sullo schermo.", null, null],
          ].map(([initial, name, text, link, linkLabel]) => (
            <div key={name} className="rounded-2xl border-[1.5px] border-rule p-6">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-surface font-display text-3xl font-extrabold text-orange" aria-hidden="true">{initial}</span>
              <h2 className="mt-4 font-sans text-2xl font-extrabold">{name}</h2>
              <p className="mt-3 text-ink-2">{text}</p>
              {link ? <a href={link} rel="noopener" className="mt-3 inline-block font-bold underline decoration-orange decoration-2 underline-offset-4">{linkLabel}</a> : null}
            </div>
          ))}
        </div>
      </Section>

      <Section className="border-t border-rule">
        <div className="prose-site mx-auto max-w-prose">
          <h2 className="!mt-0">Perché esiste</h2>
          <p>Quasi tutte le app di fitness sono fatte per chi è già motivato. Funzionano benissimo per due settimane, poi arriva la settimana pesante e salta tutto. Non perché manchi la volontà: perché chiedono troppo rispetto a quello che una persona riesce a dare in una giornata normale.</p>
          <p>Hypemove parte dal lato opposto. Allenamenti così brevi da starci dentro anche nelle giornate peggiori, un percorso a tappe che ti dice cosa fare oggi senza farti scegliere, e un coach che si adatta invece di spingere. Gli allenamenti li scrive un chinesiologo, non un generatore casuale. L'obiettivo non è il workout perfetto: è che tu ci sia anche domani.</p>
          <h2>Per chi la facciamo</h2>
          <p>Per chi ha una vita piena e imprevedibile. Per chi ha già pagato palestre e abbonamenti mai usati. Per chi non si è mai sentito una persona da palestra e non ha nessuna voglia di diventarlo. Non per atleti, non per chi cerca schede avanzate: per quelli ci sono già ottime app, e nei nostri <a href="/confronti">confronti</a> lo diciamo.</p>
          <h2>Come lavoriamo</h2>
          <p>Piccoli, con budget limitato, con le persone che usano l'app come prima fonte di verità. Facciamo interviste, leggiamo ogni messaggio che arriva a <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>, e cambiamo l'app in base a quello che vediamo, non a quello che ci piacerebbe vedere. Se qualcosa non funziona lo diciamo, anche in pubblico.</p>
          <h2>Dove siamo</h2>
          <p>Hypemove è sviluppata in Italia ed è disponibile su Google Play. La versione per iPhone è in lavorazione: se ne hai uno, <a href="/iphone">lasciaci la mail</a> e ti avvisiamo.</p>
        </div>
      </Section>

      <Section>
        <div className="rounded-3xl bg-deep px-6 py-12 text-center text-white sm:px-10">
          <h2 className="h-section mx-auto max-w-[22ch] text-white">Vuoi vedere com'è fatta? Il primo allenamento è gratis.</h2>
          <div className="mt-7 flex justify-center"><PlayButton location="chi_siamo_cta" /></div>
        </div>
      </Section>
    </Layout>
  );
}
