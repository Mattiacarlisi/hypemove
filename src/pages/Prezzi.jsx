import React from "react";
import { Faq, Layout, PlayButton, Section, SectionHead } from "../components/Layout.jsx";
import { PRICES, SITE_URL, breadcrumb, faqSchema } from "../site.js";

const faqs = [
  {
    q: "Quanto costa Hypemove?",
    a: `Hypemove è gratuita. Il Premium è facoltativo e costa ${PRICES.monthly} € al mese oppure ${PRICES.yearly} € all'anno (circa ${PRICES.yearlyPerMonth} € al mese).`,
  },
  {
    q: "Cosa cambia tra gratis e Premium?",
    a: "Con il piano gratuito hai il percorso a tappe, tutti gli allenamenti con i video, i punti e i premi, e il Coach AI con un numero limitato di messaggi a settimana. Con Premium il percorso si adatta mentre avanzi, il coach non ha limiti e non c'è pubblicità.",
  },
  {
    q: "Come si disdice il Premium?",
    a: "Da Google Play: apri l'app Play Store, tocca il tuo profilo, poi Pagamenti e abbonamenti, Abbonamenti, scegli Hypemove e tocca Annulla. Resti Premium fino alla fine del periodo già pagato.",
  },
  {
    q: "Devo mettere la carta per iniziare?",
    a: "No. Scarichi l'app e usi tutto il piano gratuito senza inserire nessun metodo di pagamento. La carta serve solo se scegli il Premium, e la gestisce Google Play.",
  },
  {
    q: "Se non pago, il percorso si blocca?",
    a: "No. Il percorso a tappe, gli allenamenti e i premi restano gratuiti per sempre. Il Premium aggiunge, non toglie.",
  },
];

export const meta = {
  title: "Prezzi di Hypemove: gratis, con Premium facoltativo",
  description: `Hypemove si usa gratis. Il Premium costa ${PRICES.monthly} € al mese o ${PRICES.yearly} € all'anno: percorso che si adatta, Coach AI senza limiti, niente pubblicità. Si disdice da Google Play.`,
  ogImage: `${SITE_URL}/images/og/prezzi.jpg`,
  ogImageAlt: "Prezzi di Hypemove",
  type: "website",
  modified: "2026-09-08",
  jsonld: [
    { "@type": "WebPage", "@id": `${SITE_URL}/prezzi#webpage`, url: `${SITE_URL}/prezzi`, name: "Prezzi di Hypemove", isPartOf: { "@id": `${SITE_URL}/#website` }, about: { "@id": `${SITE_URL}/#app` }, inLanguage: "it-IT" },
    faqSchema(faqs),
    breadcrumb([{ name: "Home", path: "/" }, { name: "Prezzi", path: "/prezzi" }]),
  ],
};

const free = [
  "Il percorso a tappe, una al giorno",
  "Tutti gli allenamenti da 5, 10 e 15 minuti",
  "Oltre 400 esercizi con video e voce guida",
  "Punti, giorni di fila, baule dei premi, classifica mensile",
  "Coach AI con un numero limitato di messaggi a settimana",
  "Con pubblicità",
];

const premium = [
  "Tutto quello che c'è nel gratuito",
  "Un percorso che si adatta mentre avanzi: esercizi che ami, esercizi che eviti, come ti senti",
  "Coach AI senza limiti di messaggi",
  "Niente pubblicità",
];

export default function Prezzi() {
  return (
    <Layout current="prezzi">
      <Section>
        <SectionHead as="h1" kicker="Prezzi" title="Gratis per iniziare. Premium se vuoi di più." sub="Nessuna carta per scaricare. Nessuna prova che si trasforma in abbonamento a tua insaputa. Il Premium lo scegli tu, e lo disdici da Google Play quando vuoi." />
        <div className="mt-10 grid max-w-[900px] gap-4 md:grid-cols-2">
          <div className="rounded-2xl border-[1.5px] border-rule p-6 sm:p-8">
            <div className="font-display text-4xl font-extrabold leading-none">Gratis</div>
            <div className="mt-4"><span className="font-display text-5xl font-extrabold">0 €</span> <span className="text-ink-2">per sempre</span></div>
            <ul className="mt-6 grid gap-2 text-ink-2">
              {free.map((item) => (
                <li key={item} className="flex gap-2.5"><span className="mt-1.5 h-2 w-2 flex-none rounded-full bg-ink-3" aria-hidden="true" />{item}</li>
              ))}
            </ul>
            <div className="mt-8"><PlayButton className="btn-dark w-full" location="prezzi_free" /></div>
          </div>
          <div className="rounded-2xl border-[1.5px] border-orange bg-peach p-6 sm:p-8">
            <div className="font-display text-4xl font-extrabold leading-none">Premium</div>
            <div className="mt-4 grid gap-1">
              <div><span className="font-display text-5xl font-extrabold">{PRICES.monthly} €</span> <span className="text-ink-2">al mese</span></div>
              <div><span className="font-display text-3xl font-extrabold">{PRICES.yearly} €</span> <span className="text-ink-2">all'anno, circa {PRICES.yearlyPerMonth} € al mese</span></div>
            </div>
            <ul className="mt-6 grid gap-2 text-ink-2">
              {premium.map((item) => (
                <li key={item} className="flex gap-2.5"><span className="mt-1.5 h-2 w-2 flex-none rounded-full bg-orange" aria-hidden="true" />{item}</li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-ink-2">Si attiva dentro l'app, si paga con Google Play, si disdice in due tocchi. Resti Premium fino alla fine del periodo pagato.</p>
          </div>
        </div>
        <p className="mt-6 max-w-prose text-sm text-ink-2">I prezzi sono in euro, IVA inclusa, e sono quelli mostrati dentro l'app su Google Play in Italia. Se cambiano, cambiano prima lì.</p>
      </Section>

      <Section tone="peach" className="!py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            ["Perché il Premium esiste", "Il piano gratuito ha già tutto quello che serve per iniziare e continuare. Il Premium serve a chi vuole che il percorso cambi con lei: un esercizio che non sopporti sparisce, uno che ami torna più spesso, la settimana pesante viene alleggerita."],
            ["Cosa NON compri", "Non compri workout in più. Non compri la possibilità di allenarti: quella è gratis. Compri un percorso che ti conosce, e un coach a cui puoi scrivere quanto vuoi."],
            ["Se non ti convince", "Disdici da Google Play. Nessuna mail da scrivere, nessuna domanda. Il percorso gratuito continua da dove eri."],
          ].map(([title, text]) => (
            <div key={title}>
              <h2 className="font-sans text-xl font-extrabold">{title}</h2>
              <p className="mt-2 text-ink-2">{text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHead kicker="Domande sui prezzi" title="Chiaro, prima di scaricare." />
        <Faq items={faqs} />
      </Section>
    </Layout>
  );
}
