import React from "react";
import { AppShot, Faq, Layout, Picture, PlayButton, Section } from "../components/Layout.jsx";
import { GuideCard } from "./Guide.jsx";
import { guides } from "../data/guides.js";
import { SITE_URL, breadcrumb, faqSchema } from "../site.js";

// Modello unico per le guide scritte come dati (src/data/articoli.js).
// Struttura: intestazione con immagine, corpo a sezioni H2, FAQ (con schema), invito a provare,
// tre guide collegate, footer. Autore: Hypemove (Organization); Mattia Carlisi compare come
// chinesiologo che cura gli allenamenti, non come firma dei testi.

function wordCount(article) {
  const text = [article.lead, ...article.sections.flatMap((s) => [s.h2, ...(s.p ?? []), ...(s.ul ?? [])]), ...article.faq.flatMap((f) => [f.q, f.a])].join(" ");
  return text.split(/\s+/).filter(Boolean).length;
}

export function articoloMeta(article) {
  const url = `${SITE_URL}/${article.slug}`;
  const image = article.imageKind === "app" ? `${SITE_URL}/images/og/guide.jpg` : `${SITE_URL}/images/opt/${article.image}-1200.webp`;
  return {
    title: article.seoTitle,
    description: article.description,
    ogImage: image,
    ogImageAlt: article.imageAlt,
    type: "article",
    published: article.published,
    modified: article.modified,
    jsonld: [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: article.title,
        description: article.description,
        url,
        image,
        datePublished: article.published,
        dateModified: article.modified,
        wordCount: wordCount(article),
        inLanguage: "it-IT",
        author: { "@id": `${SITE_URL}/#organization` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        about: { "@id": `${SITE_URL}/#app` },
        mainEntityOfPage: url,
        articleSection: article.category,
      },
      faqSchema(article.faq),
      breadcrumb([{ name: "Home", path: "/" }, { name: "Guide", path: "/guide" }, { name: article.title, path: `/${article.slug}` }]),
    ],
  };
}

function formatDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
  return `${d} ${months[m - 1]} ${y}`;
}

export default function Articolo({ article }) {
  const related = guides.filter((guide) => guide.href !== `/${article.slug}`).filter((guide) => guide.category === article.category).concat(guides.filter((guide) => guide.href !== `/${article.slug}` && guide.category !== article.category)).slice(0, 3);
  return (
    <Layout current="guide">
      <article>
        <header className="px-5 pb-8 pt-8 sm:px-7 sm:pt-12">
          <div className="mx-auto grid max-w-site items-center gap-8 md:grid-cols-[1.15fr_0.85fr] md:gap-12">
            <div>
              <nav className="text-sm text-ink-2" aria-label="Percorso">
                <a href="/" className="hover:text-ink">Home</a> › <a href="/guide" className="hover:text-ink">Guide</a> › <span>{article.category}</span>
              </nav>
              <h1 className="mt-4 max-w-[22ch] text-5xl sm:text-6xl lg:text-[4.25rem]">{article.title}</h1>
              <p className="mt-5 max-w-prose text-xl leading-relaxed text-ink">{article.lead}</p>
              <p className="mt-4 text-sm text-ink-2">
                Di Hypemove · {article.readTime} di lettura · aggiornato il {formatDate(article.modified)}. Gli allenamenti citati sono scritti da <a href="/chi-siamo" className="font-bold underline decoration-orange decoration-2 underline-offset-2">Mattia Carlisi, chinesiologo</a>.
              </p>
            </div>
            <div className={article.imageKind === "app" ? "mx-auto w-[min(260px,65vw)]" : "overflow-hidden rounded-2xl"}>
              {article.imageKind === "app" ? (
                <AppShot name={article.image.replace(/^app-/, "")} alt={article.imageAlt} priority className="drop-shadow-[0_24px_32px_rgba(0,0,0,0.16)]" />
              ) : (
                <Picture name={article.image} widths={[480, 800, 1200]} alt={article.imageAlt} sizes="(min-width: 768px) 480px, 92vw" width={1200} height={800} priority className="h-auto w-full" />
              )}
            </div>
          </div>
        </header>

        <div className="px-5 pb-6 sm:px-7">
          <div className="prose-site mx-auto max-w-prose">
            {article.sections.map((section) => (
              <section key={section.h2}>
                <h2>{section.h2}</h2>
                {(section.p ?? []).map((text) => (
                  <p key={text.slice(0, 40)}>{text}</p>
                ))}
                {section.ul ? (
                  <ul>
                    {section.ul.map((item) => (
                      <li key={item.slice(0, 40)}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        </div>

        <Section className="!pt-4">
          <div className="mx-auto max-w-prose">
            <div className="kicker">Domande</div>
            <Faq items={article.faq} className="mt-4 max-w-none" />
          </div>
        </Section>

        <section className="bg-deep px-5 py-12 text-white sm:px-7">
          <div className="mx-auto grid max-w-site gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="font-sans text-2xl font-extrabold sm:text-3xl">Se vuoi provare, il primo allenamento è gratis.</h2>
              <p className="mt-2 text-white/70">Un percorso a tappe da 5 a 15 minuti, a casa, a corpo libero o con quello che hai. Android, iPhone in arrivo.</p>
            </div>
            <PlayButton location={`articolo_${article.slug}`} />
          </div>
        </section>

        <section className="px-5 py-12 sm:px-7">
          <div className="mx-auto max-w-site">
            <h2 className="font-sans text-2xl font-extrabold">Potrebbe interessarti anche</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {related.map((guide) => (
                <GuideCard key={guide.href} guide={guide} heading="h3" />
              ))}
            </div>
          </div>
        </section>
      </article>
    </Layout>
  );
}
