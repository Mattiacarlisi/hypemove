import React from "react";
import { ArrowRight, CheckCircle2, Compass, Download, Map, Sparkles, TimerReset } from "lucide-react";
import GuideFooter from "../components/GuideFooter.jsx";
import { PLAY_STORE_URL, handleAndroidDownloadClick } from "../lib/analytics.js";

const ARTICLE_URL = "https://www.hypemove.app/app-fitness-principianti";
const ARTICLE_SEO_TITLE = "App fitness per principianti: una guida semplice per chi parte da zero | Hypemove";
const ARTICLE_DESCRIPTION = "Scopri perché Hypemove è un’app fitness adatta ai principianti: percorso guidato, workout brevi, progressione graduale e meno attrito per iniziare davvero.";
const ARTICLE_IMAGE_PATH = "/images/homeworkout.png";
const ARTICLE_IMAGE_URL = "https://www.hypemove.app/images/homeworkout.png";
const ARTICLE_IMAGE_ALT = "Donna che si allena a casa con workout per principianti";
const ARTICLE_PUBLISHED_DATE = "2026-04-19";
const ARTICLE_MODIFIED_DATE = "2026-04-23";

const beginnerCards = [
  {
    title: "Sai cosa fare",
    text: "Non ti lascia davanti a una libreria dispersiva di workout. Hypemove ti dà una direzione chiara attraverso un percorso guidato, così inizi più facilmente e perdi meno energie a decidere.",
    icon: Compass,
  },
  {
    title: "Workout brevi, ma strutturati",
    text: "Hypemove lavora soprattutto con workout da 5, 7 e 10 minuti. Sono più facili da iniziare, ma non casuali: fanno parte di una logica di percorso pensata per aiutarti a costruire continuità.",
    icon: TimerReset,
  },
  {
    title: "Progressione graduale",
    text: "Partire da zero non significa restare fermo sempre allo stesso punto. Il percorso è progressivo: ti accompagna nel tempo senza farti sentire travolto troppo presto.",
    icon: Map,
  },
  {
    title: "Ti aiuta a essere costante",
    text: "Hypemove non punta sulla perfezione. Punta ad aiutarti a tornare, allenarti con più regolarità e costruire una routine che abbia senso nella vita reale.",
    icon: CheckCircle2,
  },
];

const appFeatures = [
  {
    title: "Parti dal tuo livello",
    text: "Quando entri nell’app, Hypemove raccoglie le informazioni essenziali per costruire il tuo punto di partenza, come livello fitness e obiettivo.",
    icon: Sparkles,
  },
  {
    title: "Roadmap guidata",
    text: "Dopo l’onboarding ricevi un percorso lineare, guidato e progressivo. Non devi saltare tra contenuti casuali: hai una direzione chiara da seguire.",
    icon: Map,
  },
  {
    title: "Workout facili da avviare",
    text: "La logica del prodotto è aiutarti a partire in fretta, senza troppe decisioni inutili. Il workout deve restare semplice da iniziare anche nelle giornate storte.",
    icon: TimerReset,
  },
  {
    title: "Progressi visibili",
    text: "Dopo il workout non finisce tutto lì. Hypemove rende più visibile il tuo avanzamento con reward, progressione e sistemi che supportano il ritorno nel tempo.",
    icon: CheckCircle2,
  },
];

function LogoMark() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
      <span className="text-lg font-black tracking-[-0.06em]">H</span>
    </div>
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

function TextBlock({ eyebrow, title, children, dark = false }) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? <Kicker dark={dark}>{eyebrow}</Kicker> : null}
      <h2 className={`mt-5 text-3xl font-black tracking-[-0.05em] sm:text-5xl ${dark ? "text-white" : "text-black"}`}>
        {title}
      </h2>
      <div className={`mt-5 space-y-5 text-base leading-8 sm:text-lg ${dark ? "text-white/72" : "text-black/65"}`}>
        {children}
      </div>
    </div>
  );
}

function CtaButton({ children = "Scarica Hypemove", location }) {
  return (
    <a
      href={PLAY_STORE_URL}
      onClick={(event) => handleAndroidDownloadClick(event, {
        buttonText: children,
        location,
      })}
      className="group inline-flex min-h-[56px] items-center justify-center rounded-full bg-black px-6 py-4 text-base font-semibold text-white transition hover:-translate-y-0.5 sm:px-7"
    >
      <Download className="mr-2 h-4 w-4" />
      {children}
      <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
    </a>
  );
}

function SeoJsonLd() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${ARTICLE_URL}#webpage`,
        url: ARTICLE_URL,
        name: ARTICLE_SEO_TITLE,
        description: ARTICLE_DESCRIPTION,
        inLanguage: "it-IT",
        isPartOf: {
          "@id": "https://www.hypemove.app/#website",
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
            item: "https://www.hypemove.app/",
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
            name: "App fitness per principianti",
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
            width: 750,
            height: 1334,
          },
        ],
        datePublished: ARTICLE_PUBLISHED_DATE,
        dateModified: ARTICLE_MODIFIED_DATE,
        author: {
          "@type": "Organization",
          "@id": "https://www.hypemove.app/#organization",
          name: "Hypemove",
          url: "https://www.hypemove.app/",
        },
        publisher: {
          "@type": "Organization",
          "@id": "https://www.hypemove.app/#organization",
          name: "Hypemove",
          logo: {
            "@type": "ImageObject",
            url: "https://www.hypemove.app/images/logo1.png",
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${ARTICLE_URL}#webpage`,
        },
        articleSection: "Fitness e benessere",
        keywords: [
          "app fitness per principianti",
          "app allenamento principianti",
          "allenamento a casa per principianti",
          "workout per principianti",
          "app fitness per iniziare",
          "hypemove",
        ],
        inLanguage: "it-IT",
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

export default function AppFitnessPrincipianti() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-black">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#FDFDFD]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center gap-3">
            <LogoMark />
            <div>
              <div className="text-base font-black tracking-[-0.03em]">Hypemove</div>
              <div className="text-xs text-black/45">App fitness per principianti</div>
            </div>
          </a>
          <a
            href="/guide"
            className="hidden rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-black/70 transition hover:-translate-y-0.5 hover:border-black/20 hover:text-black sm:inline-flex"
          >
            Guide
          </a>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(0,0,0,0.9)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.9)_1px,transparent_1px)] [background-size:48px_48px]" />
          <div className="pointer-events-none absolute right-[-10%] top-10 h-72 w-72 rounded-full bg-[#FB8B04]/12 blur-3xl" />

          <div className="relative mx-auto max-w-7xl">
            <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.88fr)_minmax(360px,0.8fr)] lg:gap-12">
              <div className="max-w-[42rem]">
                <Kicker>Per chi parte da zero</Kicker>
                <h1 className="mt-5 max-w-[36rem] text-4xl font-black leading-[0.98] tracking-[-0.06em] text-black sm:text-5xl lg:text-[4rem]">
                  Un’app fitness pensata davvero per chi parte da zero
                </h1>
                <div className="mt-6 hidden max-w-[40rem] space-y-4 text-base leading-8 text-black/65 lg:block lg:text-[1.12rem] lg:leading-9">
                  <p>Iniziare ad allenarsi non è difficile solo a livello fisico.</p>
                  <p>
                    Spesso è difficile soprattutto nella vita reale: poco tempo, poca energia mentale, troppe decisioni, poca costanza.
                  </p>
                  <p>
                    Hypemove nasce proprio per questo: aiutarti a iniziare in modo più semplice e a essere più costante nel tempo.
                  </p>
                </div>
              </div>

              <figure className="relative mx-auto w-full max-w-[40rem] self-center overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_24px_70px_rgba(0,0,0,0.08)] lg:justify-self-end">
                <img
                  src={ARTICLE_IMAGE_PATH}
                  alt={ARTICLE_IMAGE_ALT}
                  width="1024"
                  height="1536"
                  loading="eager"
                  fetchpriority="high"
                  className="aspect-[4/3] h-full w-full object-cover object-top"
                />
              </figure>
            </div>

            <div className="mt-6 max-w-[40rem] space-y-4 text-base leading-8 text-black/65 lg:hidden">
              <p>Iniziare ad allenarsi non è difficile solo a livello fisico.</p>
              <p>
                Spesso è difficile soprattutto nella vita reale: poco tempo, poca energia mentale, troppe decisioni, poca costanza.
              </p>
              <p>
                Hypemove nasce proprio per questo: aiutarti a iniziare in modo più semplice e continuare con più continuità.
              </p>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <TextBlock title="Perché Hypemove è adatta ai principianti" />

            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              {beginnerCards.map((item) => {
                const Icon = item.icon;

                return (
                  <article key={item.title} className="rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_18px_54px_rgba(0,0,0,0.045)]">
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-2xl font-black tracking-[-0.04em] text-black sm:text-3xl">
                        {item.title}
                      </div>
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-black text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="mt-5 text-base leading-8 text-black/65">{item.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-black px-4 py-20 text-white sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <TextBlock eyebrow="Il punto importante" title="Breve non vuol dire casuale" dark>
              <p>
                Essere adatta a chi parte da zero non significa essere fatta “a caso”.
              </p>
              <p>
                Hypemove non ti propone semplicemente workout brevi perché così sembrano più facili.
              </p>
              <p>
                Li inserisce dentro una struttura guidata, con una roadmap lineare, una progressione chiara e un’esperienza costruita per ridurre l’attrito mentale.
              </p>
              <p>
                In altre parole: non semplifica togliendo valore.
                <br />
                Semplifica per aiutarti a partire davvero.
              </p>
              <p>
                È una differenza enorme, soprattutto per chi tende a mollare dopo pochi giorni o si sente subito perso quando deve costruirsi tutto da solo.
              </p>
            </TextBlock>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <TextBlock title="Cosa trovi dentro Hypemove" />

            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {appFeatures.map((item) => {
                const Icon = item.icon;

                return (
                  <article key={item.title} className="rounded-[26px] border border-black/10 bg-[#FCFBF8] p-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-2xl font-black tracking-[-0.04em] text-black">{item.title}</h3>
                    <p className="mt-4 text-base leading-8 text-black/62">{item.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 pb-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[32px] border border-black/10 bg-white p-6 shadow-[0_30px_90px_rgba(0,0,0,0.07)] sm:p-10 lg:p-12">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(280px,0.58fr)] lg:items-center">
              <TextBlock eyebrow="Scarica gratis" title="Inizia con un percorso più semplice da seguire">
                <p>
                  Se stai cercando un’app fitness pensata davvero per chi parte da zero, Hypemove ti aiuta a iniziare con più chiarezza e a essere più costante nel tempo.
                </p>
              </TextBlock>

              <div className="flex lg:justify-end">
                <CtaButton location="guide_app_fitness_principianti_final" />
              </div>
            </div>
          </div>
        </section>

        <SeoJsonLd />
      </main>

      <GuideFooter currentHref="/app-fitness-principianti" />
    </div>
  );
}
