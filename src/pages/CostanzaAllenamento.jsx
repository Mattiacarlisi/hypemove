import React, { useEffect } from "react";
import { ArrowRight, CheckCircle2, Download, ListChecks } from "lucide-react";
import GuideFooter from "../components/GuideFooter.jsx";
import { PLAY_STORE_URL, handleAndroidDownloadClick } from "../lib/analytics.js";

const ARTICLE_URL = "https://www.hypemove.app/come-essere-costanti-nell-allenamento";
const ARTICLE_SEO_TITLE =
  "Come essere costanti nell’allenamento senza dipendere dalla motivazione | Hypemove";
const ARTICLE_DESCRIPTION =
  "Scopri come essere costanti nell’allenamento senza dipendere dalla motivazione: strategie realistiche, workout guidati e un metodo più semplice da mantenere nel tempo.";
const ARTICLE_IMAGE_PATH = "/images/workout.png";
const ARTICLE_IMAGE_URL =
  "https://www.hypemove.app/images/costanza-allenamento-casa.png";
const ARTICLE_IMAGE_ALT =
  "Persona che si allena a casa con un workout semplice e guidato";
const ARTICLE_PUBLISHED_DATE = "2026-04-24";
const ARTICLE_MODIFIED_DATE = "2026-04-24";
const ORGANIZATION_URL = "https://www.hypemove.app/";
const ORGANIZATION_LOGO_URL = "https://www.hypemove.app/images/logo1.png";

const reasons = [
  "Obiettivi troppo aggressivi all'inizio",
  "Routine lunghe e pesanti",
  "Troppa dipendenza dalla motivazione del momento",
  "Giornate piene e poco tempo",
  "Saltare un giorno e pensare di aver fallito",
  "Nessuna struttura chiara da seguire",
];

const strategies = [
  "Spezza l’obiettivo in passi semplici",
  "Scegli giorni e orari facili da rispettare",
  "Segui workout guidati, senza dover decidere ogni volta",
  "Se ti fermi, riprendi senza esagerare",
  "La costanza vale più dell’intensità",
];

const hypemoveHelps = [
  "Workout brevi e più facili da iniziare",
  "Percorso guidato, meno decisioni inutili",
  "Progressi visibili nel tempo",
  "Esperienza coinvolgente che invoglia a tornare",
  "Approccio più realistico per persone normali",
];

const faqs = [
  {
    q: "Se non sono costante significa che mi manca disciplina?",
    a: "Non necessariamente. Spesso significa che il sistema attuale non è sostenibile.",
  },
  {
    q: "Meglio allenarsi poco ma spesso?",
    a: "Per molte persone sì, perché aumenta la probabilità di continuità.",
  },
  {
    q: "Come riprendo dopo uno stop?",
    a: "Riparti con qualcosa di semplice invece di voler recuperare tutto subito.",
  },
];

function useSeoMeta() {
  useEffect(() => {
    document.title = ARTICLE_SEO_TITLE;
    document.documentElement.setAttribute("lang", "it-IT");

    const upsertMeta = (selector, attrs, content) => {
      let tag = document.head.querySelector(selector);

      if (!tag) {
        tag = document.createElement("meta");
        Object.entries(attrs).forEach(([key, value]) => {
          tag.setAttribute(key, value);
        });
        document.head.appendChild(tag);
      }

      tag.setAttribute("content", content);
    };

    const upsertLink = (selector, attrs) => {
      let tag = document.head.querySelector(selector);

      if (!tag) {
        tag = document.createElement("link");
        document.head.appendChild(tag);
      }

      Object.entries(attrs).forEach(([key, value]) => {
        tag.setAttribute(key, value);
      });
    };

    upsertMeta(
      'meta[name="description"]',
      { name: "description" },
      ARTICLE_DESCRIPTION
    );

    upsertMeta(
      'meta[name="robots"]',
      { name: "robots" },
      "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
    );

    upsertMeta(
      'meta[name="googlebot"]',
      { name: "googlebot" },
      "index, follow, max-image-preview:large"
    );

    upsertMeta('meta[name="author"]', { name: "author" }, "Hypemove");

    upsertMeta(
      'meta[property="og:type"]',
      { property: "og:type" },
      "article"
    );

    upsertMeta(
      'meta[property="og:site_name"]',
      { property: "og:site_name" },
      "Hypemove"
    );

    upsertMeta(
      'meta[property="og:locale"]',
      { property: "og:locale" },
      "it_IT"
    );

    upsertMeta(
      'meta[property="og:title"]',
      { property: "og:title" },
      ARTICLE_SEO_TITLE
    );

    upsertMeta(
      'meta[property="og:description"]',
      { property: "og:description" },
      ARTICLE_DESCRIPTION
    );

    upsertMeta(
      'meta[property="og:url"]',
      { property: "og:url" },
      ARTICLE_URL
    );

    upsertMeta(
      'meta[property="og:image"]',
      { property: "og:image" },
      ARTICLE_IMAGE_URL
    );

    upsertMeta(
      'meta[property="og:image:alt"]',
      { property: "og:image:alt" },
      ARTICLE_IMAGE_ALT
    );

    upsertMeta(
      'meta[property="og:image:width"]',
      { property: "og:image:width" },
      "1536"
    );

    upsertMeta(
      'meta[property="og:image:height"]',
      { property: "og:image:height" },
      "1024"
    );

    upsertMeta(
      'meta[property="article:published_time"]',
      { property: "article:published_time" },
      ARTICLE_PUBLISHED_DATE
    );

    upsertMeta(
      'meta[property="article:modified_time"]',
      { property: "article:modified_time" },
      ARTICLE_MODIFIED_DATE
    );

    upsertMeta(
      'meta[name="twitter:card"]',
      { name: "twitter:card" },
      "summary_large_image"
    );

    upsertMeta(
      'meta[name="twitter:title"]',
      { name: "twitter:title" },
      ARTICLE_SEO_TITLE
    );

    upsertMeta(
      'meta[name="twitter:description"]',
      { name: "twitter:description" },
      ARTICLE_DESCRIPTION
    );

    upsertMeta(
      'meta[name="twitter:image"]',
      { name: "twitter:image" },
      ARTICLE_IMAGE_URL
    );

    upsertMeta(
      'meta[name="twitter:image:alt"]',
      { name: "twitter:image:alt" },
      ARTICLE_IMAGE_ALT
    );

    upsertLink('link[rel="canonical"]', {
      rel: "canonical",
      href: ARTICLE_URL,
    });
  }, []);
}

function SeoJsonLd() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${ORGANIZATION_URL}#organization`,
        name: "Hypemove",
        url: ORGANIZATION_URL,
        logo: {
          "@type": "ImageObject",
          url: ORGANIZATION_LOGO_URL,
        },
      },
      {
        "@type": "WebSite",
        "@id": `${ORGANIZATION_URL}#website`,
        url: ORGANIZATION_URL,
        name: "Hypemove",
        inLanguage: "it-IT",
        publisher: {
          "@id": `${ORGANIZATION_URL}#organization`,
        },
      },
      {
        "@type": "WebPage",
        "@id": `${ARTICLE_URL}#webpage`,
        url: ARTICLE_URL,
        name: ARTICLE_SEO_TITLE,
        description: ARTICLE_DESCRIPTION,
        inLanguage: "it-IT",
        isPartOf: {
          "@id": `${ORGANIZATION_URL}#website`,
        },
        about: {
          "@id": `${ARTICLE_URL}#article`,
        },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: ARTICLE_IMAGE_URL,
        },
        breadcrumb: {
          "@id": `${ARTICLE_URL}#breadcrumb`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${ARTICLE_URL}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: ORGANIZATION_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Guide",
            item: "https://www.hypemove.app/guide",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Costanza nell’allenamento",
            item: ARTICLE_URL,
          },
        ],
      },
      {
        "@type": "Article",
        "@id": `${ARTICLE_URL}#article`,
        headline: ARTICLE_SEO_TITLE,
        name: ARTICLE_SEO_TITLE,
        description: ARTICLE_DESCRIPTION,
        image: [
          {
            "@type": "ImageObject",
            url: ARTICLE_IMAGE_URL,
            width: 1536,
            height: 1024,
          },
        ],
        datePublished: ARTICLE_PUBLISHED_DATE,
        dateModified: ARTICLE_MODIFIED_DATE,
        author: {
          "@id": `${ORGANIZATION_URL}#organization`,
        },
        publisher: {
          "@id": `${ORGANIZATION_URL}#organization`,
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${ARTICLE_URL}#webpage`,
        },
        articleSection: "Fitness e benessere",
        keywords: [
          "come essere costanti nell’allenamento",
          "costanza allenamento",
          "motivazione allenamento",
          "allenarsi con costanza",
          "come non mollare palestra",
          "allenamento a casa",
          "workout guidati",
          "Hypemove",
        ],
        inLanguage: "it-IT",
      },
      {
        "@type": "FAQPage",
        "@id": `${ARTICLE_URL}#faq`,
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.a,
          },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}

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
      onClick={
        isAndroidDownload
          ? (event) =>
              handleAndroidDownloadClick(event, {
                buttonText: children,
                href,
                location,
              })
          : undefined
      }
      className="group inline-flex min-h-[56px] items-center justify-center rounded-full bg-black px-6 py-4 text-base font-semibold text-white transition hover:-translate-y-0.5 sm:px-7"
      aria-label={typeof children === "string" ? children : "Scopri Hypemove"}
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

export default function CostanzaAllenamento() {
  useSeoMeta();

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-black">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#FDFDFD]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center gap-3" aria-label="Vai alla home di Hypemove">
            <LogoMark />
            <div>
              <div className="text-base font-black tracking-[-0.03em]">Hypemove</div>
              <div className="text-xs text-black/45">Costanza</div>
            </div>
          </a>
          <a
            href="/guide"
            className="hidden rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-black/70 transition hover:-translate-y-0.5 hover:border-black/20 hover:text-black sm:inline-flex"
            aria-label="Vai alla sezione guide"
          >
            Guide
          </a>
        </div>
      </header>

      <main>
        <article>
          <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
            <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(0,0,0,0.9)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.9)_1px,transparent_1px)] [background-size:48px_48px]" />
            <div className="pointer-events-none absolute right-[-12%] top-10 h-72 w-72 rounded-full bg-[#FB8B04]/12 blur-3xl" />

            <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.55fr)]">
              <div>
                <Kicker>Guida pratica</Kicker>
                <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[0.95] tracking-[-0.06em] text-black sm:text-6xl lg:text-7xl">
                  Come essere costanti nell’allenamento, senza dipendere dalla motivazione
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-black/65 sm:text-xl sm:leading-9">
                  Molte persone pensano di avere un problema di forza di volontà. Spesso invece hanno solo un sistema troppo difficile da mantenere.
                </p>
                <div className="mt-8">
                  <CtaButton location="guide_costanza_allenamento_hero" />
                </div>
              </div>

              <figure className="relative mx-auto w-full max-w-[40rem] self-center overflow-hidden rounded-[32px] border border-black/10 bg-white shadow-[0_30px_90px_rgba(0,0,0,0.08)] lg:justify-self-end">
                <img
                  src={ARTICLE_IMAGE_PATH}
                  alt={ARTICLE_IMAGE_ALT}
                  width="1536"
                  height="1024"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className="aspect-[4/3] h-full w-full object-cover object-center"
                />
              </figure>
            </div>
          </section>

          <section className="bg-[#FCFBF8] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <Kicker>Perché molliamo</Kicker>
              <h2 className="mt-5 max-w-3xl text-3xl font-black tracking-[-0.05em] text-black sm:text-5xl">
                Perché tante persone iniziano e poi mollano
              </h2>
              <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {reasons.map((item) => (
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
              <TextSection eyebrow="Motivazione" title="La costanza non nasce dall'entusiasmo iniziale">
                <p>
                  La motivazione è utile per partire, ma cambia spesso. La costanza nasce più facilmente da qualcosa di semplice, accessibile e ripetibile.
                </p>
                <p>
                  Se ogni allenamento sembra una montagna, è normale rimandare.
                </p>
              </TextSection>
            </div>
          </section>

          <section className="bg-black px-4 py-20 text-white sm:px-6 sm:py-24 lg:px-8">
            <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(320px,0.75fr)]">
              <TextSection dark eyebrow="Strategie realistiche" title="5 modi realistici per essere più costante">
                <p>
                  Non serve cambiare personalità. Serve abbassare l’attrito tra te e il prossimo allenamento.
                </p>
              </TextSection>

              <ol className="grid gap-3">
                {strategies.map((item, index) => (
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
            <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(320px,0.55fr)]">
              <TextSection eyebrow="Dopo uno stop" title="Hai saltato qualche giorno? Riprendi e basta">
                <p>
                  Una pausa non annulla quello che hai fatto.
                  Il modo migliore per ripartire è tornare da qualcosa di semplice, senza esagerare.
                </p>
              </TextSection>
            </div>
          </section>

          <section className="bg-[#FCFBF8] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
            <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(320px,0.7fr)]">
              <div>
                <Kicker>Hypemove</Kicker>
                <h2 className="mt-5 text-3xl font-black tracking-[-0.05em] text-black sm:text-5xl">
                  Perché Hypemove è pensata per la costanza
                </h2>
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
            </div>
          </section>

          <section className="px-4 pb-24 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl rounded-[32px] bg-[#FB8B04] p-6 text-black shadow-[0_35px_100px_rgba(251,139,4,0.22)] sm:p-10 lg:p-14">
              <h2 className="max-w-4xl text-3xl font-black leading-[0.98] tracking-[-0.05em] sm:text-5xl">
                Forse non ti serve più motivazione.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-black/70 sm:text-lg">
                Forse ti serve un modo più realistico di allenarti.
              </p>
              <div className="mt-8">
                <CtaButton location="guide_allenamento_a_casa_final">Scarica Hypemove</CtaButton>
              </div>
            </div>
          </section>
        </article>

        <SeoJsonLd />
      </main>

      <GuideFooter currentHref="/come-essere-costanti-nell-allenamento" />
    </div>
  );
}