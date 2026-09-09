import React from "react";
import { AppShot, Layout, Picture, Section, SectionHead } from "../components/Layout.jsx";
import { guideCategories, guides } from "../data/guides.js";
import { SITE_URL, breadcrumb } from "../site.js";

export const meta = {
  title: "Guide per allenarsi a casa, essere costanti e ricominciare da zero",
  description:
    "Le guide di Hypemove: come essere costanti nell'allenamento, se i mini workout funzionano, come tornare a muoversi dopo un lungo stop, allenamento a casa per chi parte da zero.",
  ogImage: `${SITE_URL}/images/og/guide.jpg`,
  ogImageAlt: "Le guide di Hypemove",
  type: "website",
  modified: "2026-09-08",
  jsonld: [
    {
      "@type": "CollectionPage",
      "@id": `${SITE_URL}/guide#webpage`,
      url: `${SITE_URL}/guide`,
      name: "Guide Hypemove",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      inLanguage: "it-IT",
      mainEntity: {
        "@type": "ItemList",
        itemListElement: guides.map((guide, index) => ({ "@type": "ListItem", position: index + 1, name: guide.title, description: guide.description, url: `${SITE_URL}${guide.href}` })),
      },
    },
    breadcrumb([{ name: "Home", path: "/" }, { name: "Guide", path: "/guide" }]),
  ],
};

export function GuideCard({ guide, heading = "h2" }) {
  const Heading = heading;
  return (
    <a href={guide.href} className="group block overflow-hidden rounded-2xl border-[1.5px] border-rule bg-paper transition hover:border-ink">
      <div className="aspect-[3/2] overflow-hidden bg-surface">
        {guide.imageKind === "app" ? (
          <div className="flex h-full items-start justify-center px-6 pt-5"><AppShot name={guide.image.replace(/^app-/, "")} alt={guide.imageAlt} className="w-[120px] drop-shadow-[0_14px_20px_rgba(0,0,0,0.14)]" sizes="120px" /></div>
        ) : (
          <Picture name={guide.image} widths={[480, 800]} alt={guide.imageAlt} sizes="(min-width: 768px) 360px, 92vw" className="h-full w-full object-cover" width={800} height={533} />
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between">
          <span className="kicker">{guide.category}</span>
          <span className="text-xs font-bold text-ink-3">{guide.readTime}</span>
        </div>
        <Heading className="mt-2 font-sans text-xl font-extrabold leading-snug">{guide.title}</Heading>
        <p className="mt-2 text-[0.95rem] text-ink-2">{guide.description}</p>
        <span className="mt-4 inline-block text-sm font-extrabold">Leggi →</span>
      </div>
    </a>
  );
}

export default function Guide() {
  return (
    <Layout current="guide">
      <Section>
        <SectionHead as="h1" kicker="Guide" title="Per chi vuole capire prima di iniziare." sub="Testi brevi e concreti per chi parte da zero, ha poco tempo o fatica a essere costante. Scritti da chi fa l'app, non da una rivista di fitness." />
        <p className="mt-4 text-sm text-ink-2">Argomenti: {guideCategories.join(" · ")}</p>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <GuideCard key={guide.href} guide={guide} />
          ))}
        </div>
      </Section>
      <Section tone="deep" className="!py-14">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="font-sans text-2xl font-extrabold text-white">Vuoi sapere com'è Hypemove rispetto alle app che conosci?</h2>
            <p className="mt-2 text-white/70">Nike Training Club, Seven, Freeletics: per chi è meglio l'una e per chi l'altra.</p>
          </div>
          <a href="/confronti" className="btn-primary">Leggi i confronti</a>
        </div>
      </Section>
    </Layout>
  );
}
