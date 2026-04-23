import React from "react";
import { Apple, ArrowRight, CheckCircle2, Clock3, Download, ListChecks } from "lucide-react";
import GuideFooter from "../components/GuideFooter.jsx";
import {
  PLAY_STORE_URL,
  handleAndroidDownloadClick,
  handleIphoneDownloadClick,
} from "../lib/analytics.js";

const IPHONE_DOWNLOAD_URL = "#download";
const ARTICLE_URL = "https://www.hypemove.app/benefici-camminata-tempo";
const ARTICLE_TITLE = "I benefici della camminata";
const ARTICLE_SUBTITLE = "Cosa succede al corpo dopo 10, 20, 30 e 60 minuti";
const ARTICLE_SEO_TITLE = "Benefici della camminata: cosa succede al corpo dopo 10, 20, 30 e 60 minuti";
const ARTICLE_DESCRIPTION = "Scopri i benefici della camminata e cosa succede al corpo dopo 10, 20, 30 e 60 minuti. Una guida pratica per capire come camminare meglio e rendere la passeggiata più efficace.";
const ARTICLE_IMAGE_PATH = "/images/benefici-camminata-bosco.png";
const ARTICLE_IMAGE_URL = "https://www.hypemove.app/images/benefici-camminata-bosco.png";
const ARTICLE_IMAGE_ALT = "Donna che cammina su un sentiero nel bosco durante una passeggiata all'aperto";
const ARTICLE_PUBLISHED_DATE = "2026-04-19";
const ARTICLE_MODIFIED_DATE = "2026-04-23";

const walkingStages = [
  {
    time: "10 minuti",
    title: "Dopo 10 minuti",
    text: [
      "Nei primi minuti il corpo esce dalla staticità: il respiro accelera un po’, il corpo si scalda e inizi davvero a entrare nel movimento. Per molte persone è anche il momento in cui la testa si alleggerisce leggermente, perché interrompi la sedentarietà e cambi ritmo.",
    ],
  },
  {
    time: "20 minuti",
    title: "Dopo 20 minuti",
    text: [
      "Dopo circa 20 minuti la camminata tende a diventare più naturale. Il passo si stabilizza, il corpo è più sciolto e il movimento risulta meno “meccanico”. È spesso il momento in cui camminare smette di essere solo un modo per muoversi e inizia a farti stare meglio davvero.",
    ],
  },
  {
    time: "30 minuti",
    title: "Dopo 30 minuti",
    text: [
      "Intorno ai 30 minuti la camminata diventa un blocco di movimento vero e proprio. A quel punto molte persone sentono di aver fatto qualcosa di concreto: il corpo è attivo, la mente è spesso più lucida e la sensazione di aver spezzato la giornata sedentaria è più netta. Per tanti, è una durata molto efficace perché resta sostenibile ma ha già un peso reale.",
    ],
  },
  {
    time: "60 minuti",
    title: "Dopo 60 minuti",
    text: [
      "Dopo un’ora il volume totale di movimento diventa importante. Non stai più facendo solo due passi: stai dedicando al corpo un tempo significativo. Una camminata così lunga può incidere in modo interessante sul benessere generale, sul dispendio energetico e su quanto riesci a compensare una giornata troppo sedentaria.",
    ],
  },
];

const workoutSlots = [
  {
    title: "A metà camminata",
    text: "È una buona opzione se vuoi spezzare il ritmo e dare al corpo uno stimolo diverso. Puoi fermarti 5 minuti, fare un mini workout semplice e poi riprendere a camminare. In questo modo la passeggiata diventa meno monotona e più completa.",
  },
  {
    title: "Alla fine della camminata",
    text: "Per molte persone è l'opzione più naturale. Hai già fatto la parte più automatica, il corpo è caldo e aggiungere 5 minuti guidati richiede meno sforzo mentale rispetto a iniziare da zero in un altro momento della giornata.",
  },
];

const comboBenefits = [
  "attivare di più la muscolatura",
  "lavorare meglio su gambe, glutei o core",
  "inserire un piccolo blocco di mobilità",
  "spezzare la monotonia del gesto sempre uguale",
  "trasformare una semplice passeggiata in un momento di movimento più ricco",
];

const faqs = [
  {
    q: "Camminare fa bene anche se non sto camminando per tantissimo tempo?",
    a: "Sì. Il punto di questa guida non è trovare il minimo indispensabile, ma capire che la camminata ha valore e che, andando avanti, il corpo continua a ricevere uno stimolo utile.",
  },
  {
    q: "Meglio fare il mini workout a metà o alla fine della camminata?",
    a: "Dipende da come vuoi vivere la passeggiata. A metà può spezzare il ritmo e darti uno stimolo diverso. Alla fine è spesso la soluzione più semplice, perché il corpo è già caldo e la parte più automatica è fatta.",
  },
  {
    q: "Posso aggiungere un workout ogni volta che vado a camminare?",
    a: "Sì. Se durante una passeggiata hai voglia di aggiungere uno o anche due mini workout brevi, ha assolutamente senso. Può essere un modo molto intelligente per rendere quel momento più completo.",
  },
  {
    q: "Perché questa combinazione è così utile?",
    a: "Perché sfrutta un momento in cui l'attrito è già basso. Sei già fuori, sei già in movimento e aggiungere 5 minuti guidati richiede molta meno energia mentale rispetto a iniziare un allenamento separato da zero.",
  },
  {
    q: "La camminata da sola resta utile?",
    a: "Assolutamente sì. Il mini workout non serve a sminuire la camminata. Serve solo a renderla ancora più completa quando vuoi ottenere qualcosa in più senza complicarti la vita.",
  },
];

const sources = [
  {
    label: "CDC - Adult Activity: An Overview",
    href: "https://www.cdc.gov/physical-activity-basics/guidelines/adults.html",
  },
  {
    label: "American Heart Association - Exercise and Physical Activity",
    href: "https://www.heart.org/en/healthy-living/fitness/exercise-and-physical-activity",
  },
  {
    label: "American Heart Association - Physical Activity Recommendations",
    href: "https://www.heart.org/en/healthy-living/fitness/fitness-basics/aha-recs-for-physical-activity-in-adults",
  },
  {
    label: "CDC - What You Can Do to Meet Recommendations",
    href: "https://www.cdc.gov/physical-activity-basics/guidelines/index.html",
  },
];

function LogoMark() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
      <span className="text-lg font-black tracking-[-0.06em]">H</span>
    </div>
  );
}

function CtaButton({ children = "Scarica Hypemove per Android", href = PLAY_STORE_URL, location }) {
  const isAndroidDownload = href === PLAY_STORE_URL;
  const isIphoneDownload = href === IPHONE_DOWNLOAD_URL;

  return (
    <a
      href={href}
      onClick={
        isAndroidDownload
          ? (event) => handleAndroidDownloadClick(event, {
            buttonText: children,
            href,
            location,
          })
          : isIphoneDownload
            ? (event) => handleIphoneDownloadClick(event, {
              buttonText: children,
              href,
              location,
            })
            : undefined
      }
      className={`group inline-flex min-h-[56px] items-center justify-center rounded-full px-6 py-4 text-base font-semibold transition hover:-translate-y-0.5 sm:px-7 ${
        isAndroidDownload
          ? "bg-black text-white"
          : "border border-black/10 bg-white text-black hover:border-black/20"
      }`}
    >
      {isIphoneDownload ? <Apple className="mr-2 h-4 w-4" /> : <Download className="mr-2 h-4 w-4" />}
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

function TextBlock({ eyebrow, title, children, dark = false }) {
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
            name: "Benefici della camminata",
            item: ARTICLE_URL,
          },
        ],
      },
      {
        "@type": "Article",
        "@id": `${ARTICLE_URL}#article`,
        headline: ARTICLE_SEO_TITLE,
        alternativeHeadline: ARTICLE_SUBTITLE,
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
          "benefici della camminata",
          "benefici camminare",
          "camminata benefici",
          "cosa succede al corpo camminando",
          "camminata 10 minuti",
          "camminata 20 minuti",
          "camminare 30 minuti",
          "camminare 60 minuti",
          "camminata veloce",
          "mini workout",
          "allenamento a casa",
        ],
        inLanguage: "it-IT",
        about: [
          "benefici della camminata",
          "camminata quotidiana",
          "movimento quotidiano",
          "mini workout",
        ],
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

export default function BeneficiCamminataTempo() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-black">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#FDFDFD]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center gap-3">
            <LogoMark />
            <div>
              <div className="text-base font-black tracking-[-0.03em]">Hypemove</div>
              <div className="text-xs text-black/45">Camminata e mini workout</div>
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
                <Kicker>Guida pratica</Kicker>
                <h1 className="mt-5 max-w-[36rem] text-4xl font-black leading-[0.98] tracking-[-0.06em] text-black sm:text-5xl lg:text-[4rem]">
                  {ARTICLE_TITLE}
                </h1>
                <p className="mt-4 max-w-[34rem] text-lg font-semibold leading-8 text-black/72 sm:text-[1.75rem] sm:leading-8">
                  {ARTICLE_SUBTITLE}
                </p>
                <div className="mt-6 hidden max-w-[40rem] space-y-4 text-base leading-8 text-black/65 lg:block lg:text-[1.12rem] lg:leading-9">
                  <p>
                    Camminare è una delle forme di movimento più semplici da inserire nella vita reale. Non richiede attrezzatura, non ti obbliga a organizzare tutta la giornata e, per molte persone, è uno dei modi più accessibili per muoversi di più.
                  </p>
                  <p>
                    Ma una domanda è normalissima: cosa succede davvero al corpo mentre cammini?
                  </p>
                </div>
              </div>

              <figure className="relative mx-auto w-full max-w-[40rem] self-center overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_24px_70px_rgba(0,0,0,0.08)] lg:justify-self-end">
                <img
                  src={ARTICLE_IMAGE_PATH}
                  alt={ARTICLE_IMAGE_ALT}
                  width="1536"
                  height="1024"
                  loading="eager"
                  fetchpriority="high"
                  className="aspect-[4/3] h-full w-full object-cover object-center"
                />
              </figure>
            </div>

            <div className="mt-6 max-w-[40rem] space-y-4 text-base leading-8 text-black/65 lg:hidden">
              <p>
                Camminare è una delle forme di movimento più semplici da inserire nella vita reale. Non richiede attrezzatura, non ti obbliga a organizzare tutta la giornata e, per molte persone, è uno dei modi più accessibili per muoversi di più.
              </p>
              <p>
                Ma una domanda è normalissima: cosa succede davvero al corpo mentre cammini?
              </p>
            </div>
          </div>
        </section>

        <section className="bg-[#FCFBF8] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <Kicker>Cosa succede al corpo mentre cammini</Kicker>
              <h2 className="mt-5 text-3xl font-black tracking-[-0.05em] text-black sm:text-5xl">
                Cosa cambia se cammini 10, 20, 30 o 60 minuti
              </h2>
              <p className="mt-5 text-base leading-8 text-black/62 sm:text-lg">
                La camminata veloce e regolare è uno dei modi più semplici per aumentare il movimento quotidiano. Qui trovi una lettura pratica, pensata per chi vuole capire meglio cosa succede al corpo senza perdersi in promesse esagerate.
              </p>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              {walkingStages.map((item) => (
                <article key={item.time} className="rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_18px_54px_rgba(0,0,0,0.045)]">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-2xl font-black tracking-[-0.04em] text-black sm:text-3xl">
                      {item.title}
                    </div>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-black text-white">
                      <Clock3 className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-5 space-y-4 text-base leading-8 text-black/65">
                    {item.text.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-black px-4 py-20 text-white sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-4xl">
              <Kicker dark>Amplificare i benefici</Kicker>
              <h2 className="mt-5 text-3xl font-black tracking-[-0.05em] text-white sm:text-5xl">
                <span className="block">E se volessi rendere la</span>
                <span className="block text-[#FB8B04]">camminata più efficace?</span>
              </h2>
            </div>

            <div className="mt-8 max-w-3xl space-y-5 text-base leading-8 text-white/70 sm:text-lg">
              <p>
                Qui arriva la parte davvero interessante. Quando sei già fuori, hai iniziato a camminare e il corpo ha preso ritmo, hai superato la parte più difficile: partire.
              </p>
              <p>
                Ed è proprio per questo che quel momento può essere perfetto anche per aggiungere qualcosa in più, senza complicarti la vita.
              </p>
              <p>
                Per esempio, puoi inserire un mini workout guidato di 5 minuti a metà camminata o alla fine. Non per trasformare la passeggiata in un allenamento pesante, ma per renderla più completa, più utile e più efficace.
              </p>
              <p>
                È una logica utile anche se vuoi iniziare ad allenarti a casa con più costanza: non aggiungi complessità, aggiungi un piccolo blocco nel momento in cui il corpo è già attivo.
              </p>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.7fr)]">
              <TextBlock eyebrow="Dove inserirli" title="Dove inserire i mini workout di Hypemove">
                <p>
                  Puoi usarli come piccolo blocco guidato dentro la passeggiata. Non serve cambiare tutta la routine: basta scegliere il punto più naturale.
                </p>
              </TextBlock>

              <div className="grid gap-4">
                {workoutSlots.map((slot) => (
                  <article key={slot.title} className="rounded-[24px] border border-black/10 bg-white p-5 shadow-[0_18px_50px_rgba(0,0,0,0.04)]">
                    <h3 className="text-xl font-black tracking-[-0.03em] text-black">{slot.title}</h3>
                    <p className="mt-3 text-base leading-7 text-black/65">{slot.text}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#FCFBF8] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(320px,0.75fr)]">
            <TextBlock eyebrow="Camminata + mini workout" title="Perché questa combinazione funziona così bene">
              <p>
                La camminata è ottima, ma resta soprattutto un gesto ripetitivo e regolare. Aggiungere un mini workout breve ti permette di rendere quel momento più completo senza stravolgerlo.
              </p>
              <p>
                Il bello è proprio questo: non devi pensare a un allenamento lungo, complicato o perfetto. Ti basta aggiungere un piccolo blocco guidato nel momento giusto.
              </p>
              <p>
                Ed è proprio qui che questa strategia diventa intelligente: fai di più, ma senza dover costruire un'altra sessione separata da zero.
              </p>
            </TextBlock>

            <ul className="grid gap-3">
              {comboBenefits.map((item) => (
                <li key={item} className="flex gap-3 rounded-[22px] border border-black/10 bg-white p-4 text-base leading-7 text-black/68 shadow-[0_16px_50px_rgba(0,0,0,0.04)]">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#FB8B04]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="download" className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[32px] border border-black/10 bg-white p-6 shadow-[0_30px_90px_rgba(0,0,0,0.07)] sm:p-10 lg:p-12">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.65fr)] lg:items-center">
              <TextBlock eyebrow="Scarica gratis" title="Rendi la tua camminata più completa senza complicarti la giornata">
                <p>
                  Se vuoi rendere la tua camminata più completa senza complicarti la giornata, puoi aggiungere un mini workout guidato nel momento giusto.
                </p>
              </TextBlock>

              <div className="grid gap-3">
                <CtaButton location="guide_benefici_camminata_android">Scarica Hypemove per Android</CtaButton>
                <CtaButton href={IPHONE_DOWNLOAD_URL} location="guide_benefici_camminata_iphone">Scarica Hypemove per iPhone</CtaButton>
              </div>
            </div>
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

            <SeoJsonLd />
          </div>
        </section>

        <section className="px-4 pb-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_18px_54px_rgba(0,0,0,0.045)]">
            <div className="flex items-start gap-3">
              <ListChecks className="mt-1 h-5 w-5 shrink-0 text-[#FB8B04]" />
              <div>
                <h2 className="text-xl font-black tracking-[-0.03em] text-black">Fonti consultate</h2>
                <div className="mt-4 flex flex-wrap gap-3">
                  {sources.map((source) => (
                    <a
                      key={source.href}
                      href={source.href}
                      className="inline-flex rounded-full border border-black/10 bg-[#FCFBF8] px-4 py-2 text-sm font-semibold text-black/62 transition hover:border-black/20 hover:text-black"
                    >
                      {source.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <GuideFooter currentHref="/benefici-camminata-tempo" />
    </div>
  );
}
