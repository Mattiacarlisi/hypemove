import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, Clock3, Home, Repeat2, Search, Sparkles } from "lucide-react";
import GuideFooter from "../components/GuideFooter.jsx";
import { guideCategories, guides } from "../data/guides.js";

const PAGE_URL = "https://www.hypemove.app/guide";
const PAGE_SEO_TITLE = "Guide fitness per principianti, workout a casa e costanza | Hypemove";
const PAGE_DESCRIPTION =
  "Scopri le guide Hypemove per iniziare ad allenarti, essere più costante, fare workout brevi a casa e rimetterti in forma con un approccio semplice e sostenibile.";

const filters = ["Tutte", ...guideCategories];

const categoryIcons = {
  Principianti: Sparkles,
  "Poco tempo": Clock3,
  Costanza: Repeat2,
  "Allenamento a casa": Home,
};

const guideImagesByHref = {
  "/app-fitness-principianti": {
    src: "/images/homeworkout.png",
    alt: "Donna che si allena a casa con workout per principianti",
  },
  "/mini-workout-efficaci": {
    src: "/images/WOD3.png",
    alt: "Persona che si allena a casa con un mini workout breve e guidato",
  },
  "/workout-10-minuti-casa": {
    src: "/images/WOD2.png",
    alt: "Workout di 10 minuti a casa nell'app Hypemove",
  },
  "/benefici-camminata-tempo": {
    src: "/images/immagine donna che cammina ne bosco.png",
    alt: "Donna che cammina su un sentiero nel bosco durante una passeggiata all'aperto",
  },
  "/allenamento-a-casa": {
    src: "/images/WOD1.png",
    alt: "Persona che si allena a casa",
  },
  "/come-essere-costanti-nell-allenamento": {
    src: "/images/workout.png",
    alt: "Persona che si allena a casa con costanza",
  },
};

function useSeoMeta() {
  useEffect(() => {
    document.title = PAGE_SEO_TITLE;
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

    upsertMeta("meta[name='description']", { name: "description" }, PAGE_DESCRIPTION);

    upsertMeta(
      "meta[name='robots']",
      { name: "robots" },
      "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
    );

    upsertMeta("meta[property='og:type']", { property: "og:type" }, "website");
    upsertMeta("meta[property='og:site_name']", { property: "og:site_name" }, "Hypemove");
    upsertMeta("meta[property='og:locale']", { property: "og:locale" }, "it_IT");
    upsertMeta("meta[property='og:title']", { property: "og:title" }, PAGE_SEO_TITLE);
    upsertMeta("meta[property='og:description']", { property: "og:description" }, PAGE_DESCRIPTION);
    upsertMeta("meta[property='og:url']", { property: "og:url" }, PAGE_URL);

    upsertMeta("meta[name='twitter:card']", { name: "twitter:card" }, "summary_large_image");
    upsertMeta("meta[name='twitter:title']", { name: "twitter:title" }, PAGE_SEO_TITLE);
    upsertMeta("meta[name='twitter:description']", { name: "twitter:description" }, PAGE_DESCRIPTION);

    upsertLink("link[rel='canonical']", {
      rel: "canonical",
      href: PAGE_URL,
    });
  }, []);
}

function SeoJsonLd() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: PAGE_SEO_TITLE,
        description: PAGE_DESCRIPTION,
        inLanguage: "it-IT",
        isPartOf: {
          "@id": "https://www.hypemove.app/#website",
        },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: guides.map((guide, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: guide.title,
            description: guide.description,
            url: `https://www.hypemove.app${guide.href}`,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${PAGE_URL}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://www.hypemove.app/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Guide",
            item: PAGE_URL,
          },
        ],
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

function GuideCard({ guide }) {
  const Icon = categoryIcons[guide.category] ?? Sparkles;
  const image = guide.image
    ? {
        src: guide.image,
        alt: guide.imageAlt ?? guide.title,
      }
    : guideImagesByHref[guide.href];

  return (
    <a
      href={guide.href}
      className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_18px_54px_rgba(0,0,0,0.045)] transition hover:-translate-y-1 hover:border-black/20 hover:shadow-[0_28px_80px_rgba(0,0,0,0.08)]"
      aria-label={`Leggi la guida: ${guide.title}`}
    >
      <span className="relative block overflow-hidden bg-[#FCFBF8]">
        {image?.src ? (
          <img
            src={image.src}
            alt={image.alt}
            loading="lazy"
            decoding="async"
            className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <span className="flex aspect-[4/3] w-full items-center justify-center bg-[#FCFBF8]">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white">
              <Icon className="h-5 w-5" />
            </span>
          </span>
        )}

        <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/78 px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-md">
          <Icon className="h-3.5 w-3.5 text-[#FB8B04]" />
          {guide.category}
        </span>

        <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
          <Clock3 className="h-3.5 w-3.5 text-white" />
          {guide.readTime}
        </span>
      </span>

      <span className="flex flex-1 flex-col p-5 sm:p-6">
        <span className="inline-flex w-fit rounded-full bg-[#FCFBF8] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-black/52">
          {guide.tags?.[0] ?? guide.category}
        </span>

        <h2 className="mt-4 text-2xl font-black leading-[1.02] tracking-[-0.05em] text-black">
          {guide.title}
        </h2>

        <p className="mt-4 line-clamp-3 text-sm leading-7 text-black/60">
          {guide.description}
        </p>

        <span className="mt-6 inline-flex items-center text-sm font-black text-black">
          Leggi
          <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
        </span>
      </span>
    </a>
  );
}

export default function Guide() {
  useSeoMeta();

  const [activeFilter, setActiveFilter] = useState("Tutte");
  const [query, setQuery] = useState("");

  const filteredGuides = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return guides.filter((guide) => {
      const matchesFilter = activeFilter === "Tutte" || guide.category === activeFilter;
      const searchableText = [guide.title, guide.description, guide.category, ...(guide.tags ?? [])]
        .join(" ")
        .toLowerCase();
      const matchesQuery = !normalizedQuery || searchableText.includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, query]);

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-black">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#FDFDFD]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center gap-3" aria-label="Vai alla home di Hypemove">
            <LogoMark />
            <div>
              <div className="text-base font-black tracking-[-0.03em]">Hypemove</div>
              <div className="text-xs text-black/45">Guide utili</div>
            </div>
          </a>

          <a
            href="/"
            className="hidden items-center rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-black/70 transition hover:-translate-y-0.5 hover:border-black/20 hover:text-black sm:inline-flex"
          >
            Torna alla home
          </a>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(0,0,0,0.9)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.9)_1px,transparent_1px)] [background-size:48px_48px]" />
          <div className="pointer-events-none absolute right-[-12%] top-10 h-72 w-72 rounded-full bg-[#FB8B04]/12 blur-3xl" />

          <div className="relative mx-auto max-w-7xl">
            <div className="max-w-4xl">
              <div className="inline-flex rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black/60">
                Guide Hypemove
              </div>

              <h1 className="mt-6 text-4xl font-black leading-[0.95] tracking-[-0.06em] text-black sm:text-6xl lg:text-7xl">
                Trova la guida giusta per allenarti e rimetterti in forma
              </h1>

              <p className="mt-6 max-w-3xl text-base leading-8 text-black/65 sm:text-xl sm:leading-9">
                Qui trovi contenuti pensati per chi parte da zero, ha poco tempo,
                fatica a essere costante o vuole capire come allenarsi a casa in modo
                più semplice e sostenibile.
              </p>
            </div>
          </div>
        </section>

        <section className="px-4 pb-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_18px_54px_rgba(0,0,0,0.045)] sm:p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-3xl font-black tracking-[-0.05em] text-black sm:text-4xl">
                    Tutte le guide
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-black/58">
                    Cerca per argomento oppure filtra in base a quello che ti serve:
                    principianti, poco tempo, costanza o allenamento a casa.
                  </p>
                </div>

                <div className="w-full max-w-md">
                  <label htmlFor="guide-search" className="sr-only">
                    Cerca una guida
                  </label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-black/35" />
                    <input
                      id="guide-search"
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Cerca: principianti, 10 minuti, costanza..."
                      className="h-[52px] w-full rounded-full border border-black/10 bg-[#FCFBF8] pl-12 pr-5 text-sm text-black outline-none transition placeholder:text-black/35 focus:border-black/20"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {filters.map((filter) => {
                  const isActive = activeFilter === filter;

                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setActiveFilter(filter)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        isActive
                          ? "bg-black text-white"
                          : "border border-black/10 bg-white text-black/65 hover:border-black/20 hover:text-black"
                      }`}
                    >
                      {filter}
                    </button>
                  );
                })}
              </div>

              {filteredGuides.length > 0 ? (
                <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredGuides.map((guide) => (
                    <GuideCard key={guide.href} guide={guide} />
                  ))}
                </div>
              ) : (
                <div className="mt-7 rounded-[20px] border border-dashed border-black/12 bg-[#FCFBF8] p-6">
                  <div className="text-lg font-black tracking-[-0.03em] text-black">
                    Nessuna guida trovata
                  </div>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-black/60">
                    Prova con una parola più semplice oppure rimuovi il filtro attivo.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <SeoJsonLd />
      </main>

      <GuideFooter />
    </div>
  );
}