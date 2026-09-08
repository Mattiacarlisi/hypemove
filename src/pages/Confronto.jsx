import React from "react";
import { Faq, Layout, PlayButton, Section, SectionHead } from "../components/Layout.jsx";
import { confronti } from "../data/confronti.js";
import { SITE_URL, breadcrumb, faqSchema } from "../site.js";

// Una pagina per ogni confronto in data/confronti.js, più l'indice /confronti.
export function confrontoMeta(item) {
  const url = `${SITE_URL}/confronti/${item.slug}`;
  return {
    title: item.title,
    description: item.description,
    ogImage: `${SITE_URL}/images/og/confronti.jpg`,
    ogImageAlt: `Hypemove a confronto con ${item.competitor}`,
    type: "article",
    published: "2026-09-08",
    modified: "2026-09-08",
    jsonld: [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: item.title,
        description: item.description,
        url,
        datePublished: "2026-09-08",
        dateModified: "2026-09-08",
        author: { "@id": `${SITE_URL}/#organization` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "it-IT",
        about: [{ "@id": `${SITE_URL}/#app` }, { "@type": "SoftwareApplication", name: item.competitor }],
        mainEntityOfPage: url,
      },
      faqSchema(item.faq),
      breadcrumb([{ name: "Home", path: "/" }, { name: "Confronti", path: "/confronti" }, { name: item.competitor, path: `/confronti/${item.slug}` }]),
    ],
  };
}

export const indexMeta = {
  title: "Hypemove e le altre app fitness: confronti onesti",
  description:
    "Hypemove messa accanto a Nike Training Club, Seven e Freeletics. Per chi è meglio l'una e per chi l'altra, senza giri di parole.",
  ogImage: `${SITE_URL}/images/og/confronti.jpg`,
  ogImageAlt: "Hypemove a confronto con le altre app",
  type: "website",
  modified: "2026-09-08",
  jsonld: [
    {
      "@type": "CollectionPage",
      "@id": `${SITE_URL}/confronti#webpage`,
      url: `${SITE_URL}/confronti`,
      name: "Hypemove e le altre app fitness",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      inLanguage: "it-IT",
      mainEntity: {
        "@type": "ItemList",
        itemListElement: confronti.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.title, url: `${SITE_URL}/confronti/${item.slug}` })),
      },
    },
    breadcrumb([{ name: "Home", path: "/" }, { name: "Confronti", path: "/confronti" }]),
  ],
};

export function ConfrontiIndex() {
  return (
    <Layout>
      <Section>
        <SectionHead as="h1" kicker="Confronti" title="Hypemove e le altre app. Senza giri di parole." sub="Ogni app fitness è fatta per qualcuno. Qui diciamo per chi è meglio l'altra e per chi è meglio Hypemove, così scegli in un minuto." />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {confronti.map((item) => (
            <a key={item.slug} href={`/confronti/${item.slug}`} className="block rounded-2xl border-[1.5px] border-rule p-6 transition hover:border-ink">
              <div className="kicker">Hypemove vs</div>
              <h2 className="mt-2 font-sans text-2xl font-extrabold">{item.competitor}</h2>
              <p className="mt-2 text-ink-2">{item.summary}</p>
              <span className="mt-4 inline-block text-sm font-extrabold">Leggi il confronto →</span>
            </a>
          ))}
        </div>
      </Section>
    </Layout>
  );
}

export default function Confronto({ item }) {
  return (
    <Layout>
      <Section>
        <nav className="text-sm text-ink-2" aria-label="Percorso">
          <a href="/" className="hover:text-ink">Home</a> › <a href="/confronti" className="hover:text-ink">Confronti</a> › <span>{item.competitor}</span>
        </nav>
        <h1 className="mt-4 max-w-[26ch] text-5xl sm:text-6xl lg:text-[4.5rem]">{item.title}</h1>
        <p className="mt-5 max-w-prose text-xl leading-relaxed text-ink">{item.summary}</p>
        <p className="mt-3 max-w-prose text-sm text-ink-2">Aggiornato l'8 settembre 2026. Le informazioni sulle altre app vengono dalle loro pagine pubbliche e possono cambiare: se trovi un errore, scrivici e correggiamo.</p>
      </Section>

      <Section className="!pt-0">
        <div className="overflow-x-auto rounded-2xl border-[1.5px] border-rule">
          <table className="w-full min-w-[640px] border-collapse text-[0.95rem]">
            <thead>
              <tr className="bg-surface text-left">
                <th className="px-4 py-3 text-xs font-extrabold uppercase tracking-[0.1em] text-ink-2"> </th>
                <th className="px-4 py-3 font-display text-2xl font-extrabold">{item.competitor}</th>
                <th className="px-4 py-3 font-display text-2xl font-extrabold text-orange">Hypemove</th>
              </tr>
            </thead>
            <tbody>
              {item.rows.map(([label, them, us]) => (
                <tr key={label} className="border-t border-rule align-top">
                  <th scope="row" className="px-4 py-3 text-left font-extrabold">{label}</th>
                  <td className="px-4 py-3 text-ink-2">{them}</td>
                  <td className="px-4 py-3">{us}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section tone="deep">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="font-sans text-2xl font-extrabold text-white">Scegli {item.competitor} se…</h2>
            <ul className="mt-4 grid gap-2 text-white/70">
              {item.them.map((line) => (
                <li key={line} className="flex gap-2.5"><span className="mt-2 h-2 w-2 flex-none rounded-full bg-white/40" aria-hidden="true" />{line}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-sans text-2xl font-extrabold text-white">Scegli Hypemove se…</h2>
            <ul className="mt-4 grid gap-2 text-white">
              {item.us.map((line) => (
                <li key={line} className="flex gap-2.5"><span className="mt-2 h-2 w-2 flex-none rounded-full bg-orange" aria-hidden="true" />{line}</li>
              ))}
            </ul>
            <div className="mt-6"><PlayButton location={`confronto_${item.slug}`} /></div>
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4"><SectionHead variant="stack" kicker="Domande" title="Le due che fanno tutti." /></div>
          <div className="lg:col-span-8"><Faq items={item.faq} className="max-w-none" /></div>
        </div>
        <p className="mt-8 text-ink-2">Altri confronti: {confronti.filter((other) => other.slug !== item.slug).map((other, index) => (
          <React.Fragment key={other.slug}>{index > 0 ? " · " : ""}<a href={`/confronti/${other.slug}`} className="font-bold underline decoration-orange decoration-2 underline-offset-4">Hypemove vs {other.competitor}</a></React.Fragment>
        ))}</p>
      </Section>
    </Layout>
  );
}
