import React, { useEffect } from "react";
import { ArrowRight, CheckCircle2, Download, Home, Timer } from "lucide-react";
import GuideFooter from "../components/GuideFooter.jsx";
import { PLAY_STORE_URL, handleAndroidDownloadClick } from "../lib/analytics.js";

const ARTICLE_URL = "https://www.hypemove.app/workout-10-minuti-casa";
const ARTICLE_SEO_TITLE =
  "Workout 10 minuti a casa: allenamento breve, semplice e utile | Hypemove";
const ARTICLE_DESCRIPTION =
  "Scopri come iniziare con un workout di 10 minuti a casa: semplice, utile e realistico per chi ha poco tempo, poca energia o fa fatica a essere costante.";
const ARTICLE_IMAGE_PATH = "/images/WOD2.png";
const ARTICLE_IMAGE_URL = "https://www.hypemove.app/images/WOD2.png";
const ARTICLE_IMAGE_ALT = "Workout di 10 minuti a casa nell'app Hypemove";
const ARTICLE_PUBLISHED_DATE = "2026-04-24";
const ARTICLE_MODIFIED_DATE = "2026-04-24";
const ORGANIZATION_URL = "https://www.hypemove.app/";
const ORGANIZATION_LOGO_URL = "https://www.hypemove.app/images/logo1.png";

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

    upsertMeta("meta[name='author']", { name: "author" }, "Hypemove");

    upsertMeta("meta[property='og:type']", { property: "og:type" }, "article");
    upsertMeta("meta[property='og:site_name']", { property: "og:site_name" }, "Hypemove");
    upsertMeta("meta[property='og:locale']", { property: "og:locale" }, "it_IT");
    upsertMeta("meta[property='og:title']", { property: "og:title" }, ARTICLE_SEO_TITLE);
    upsertMeta("meta[property='og:description']", { property: "og:description" }, ARTICLE_DESCRIPTION);
    upsertMeta("meta[property='og:url']", { property: "og:url" }, ARTICLE_URL);
    upsertMeta("meta[property='og:image']", { property: "og:image" }, ARTICLE_IMAGE_URL);
    upsertMeta("meta[property='og:image:alt']", { property: "og:image:alt" }, ARTICLE_IMAGE_ALT);

    upsertMeta(
      "meta[property='article:published_time']",
      { property: "article:published_time" },
      ARTICLE_PUBLISHED_DATE
    );

    upsertMeta(
      "meta[property='article:modified_time']",
      { property: "article:modified_time" },
      ARTICLE_MODIFIED_DATE
    );

    upsertMeta("meta[name='twitter:card']", { name: "twitter:card" }, "summary_large_image");
    upsertMeta("meta[name='twitter:title']", { name: "twitter:title" }, ARTICLE_SEO_TITLE);
    upsertMeta("meta[name='twitter:description']", { name: "twitter:description" }, ARTICLE_DESCRIPTION);
    upsertMeta("meta[name='twitter:image']", { name: "twitter:image" }, ARTICLE_IMAGE_URL);
    upsertMeta("meta[name='twitter:image:alt']", { name: "twitter:image:alt" }, ARTICLE_IMAGE_ALT);

    upsertLink("link[rel='canonical']", {
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
            name: "Workout 10 minuti a casa",
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
          "workout 10 minuti a casa",
          "allenamento 10 minuti",
          "allenamento breve a casa",
          "workout a casa",
          "allenamento a casa senza attrezzi",
          "workout per principianti",
          "mini workout",
          "app fitness per principianti",
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

function CtaButton({ children = "Prova Hypemove gratis", location }) {
  return (
    <a
      href={PLAY_STORE_URL}
      onClick={(event) => handleAndroidDownloadClick(event, {
        buttonText: children,
        location,
      })}
      className="group inline-flex min-h-[56px] items-center justify-center rounded-full bg-black px-6 py-4 text-base font-semibold text-white transition hover:-translate-y-0.5 sm:px-7"
      aria-label={typeof children === "string" ? children : "Prova Hypemove gratis"}
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
  useSeoMeta();

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-black">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#FDFDFD]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center gap-3" aria-label="Vai alla home di Hypemove">
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
            aria-label="Prova Hypemove gratis"
          >
            Prova gratis
          </a>
        </div>
      </header>

      <main>
        <article>
          <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(0,0,0,0.9)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.9)_1px,transparent_1px)] [background-size:48px_48px]" />
            <div className="pointer-events-none absolute right-[-10%] top-10 h-72 w-72 rounded-full bg-[#FB8B04]/12 blur-3xl" />

            <div className="relative mx-auto max-w-7xl">
              <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.88fr)_minmax(360px,0.8fr)] lg:gap-12">
                <div className="max-w-[42rem]">
                  <Kicker>Allenamento breve</Kicker>
                  <h1 className="mt-5 max-w-[36rem] text-4xl font-black leading-[0.98] tracking-[-0.06em] text-black sm:text-5xl lg:text-[4rem]">
                    Workout di 10 minuti a casa: semplice, utile e fattibile davvero
                  </h1>
                  <div className="mt-6 hidden max-w-[40rem] space-y-4 text-base leading-8 text-black/65 lg:block lg:text-[1.12rem] lg:leading-9">
                    <p>
                      Se hai poco tempo, poca energia o fai fatica a essere costante, 10 minuti possono essere il punto giusto da cui ripartire.
                      Non servono sessioni infinite per iniziare a stare meglio.
                    </p>
                  </div>
                  <div className="mt-8">
                    <CtaButton location="guide_workout_10_minuti_hero" />
                  </div>
                </div>

                <figure className="relative mx-auto w-full max-w-[40rem] self-center overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_24px_70px_rgba(0,0,0,0.08)] lg:justify-self-end">
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

              <div className="mt-6 max-w-[40rem] space-y-4 text-base leading-8 text-black/65 lg:hidden">
                <p>
                  Se hai poco tempo, poca energia o fai fatica a essere costante, 10 minuti possono essere il punto giusto da cui ripartire.
                  Non servono sessioni infinite per iniziare a stare meglio.
                </p>
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
            </div>
          </section>

          <section className="px-4 pb-24 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl rounded-[32px] bg-[#FB8B04] p-6 text-black shadow-[0_35px_100px_rgba(251,139,4,0.22)] sm:p-10 lg:p-14">
              <Timer className="h-10 w-10" />
              <h2 className="mt-5 max-w-4xl text-3xl font-black leading-[0.98] tracking-[-0.05em] sm:text-5xl">
                Se aspetti il momento perfetto, rischi di non iniziare mai.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-black/70 sm:text-lg">
                Dieci minuti possono essere il primo passo per tornare a sentirti più in forma.
              </p>
              <div className="mt-8">
                <CtaButton location="guide_workout_10_minuti_final">Scarica Hypemove gratis</CtaButton>
              </div>
            </div>
          </section>
        </article>

        <SeoJsonLd />
      </main>

      <GuideFooter currentHref="/workout-10-minuti-casa" />
    </div>
  );
}