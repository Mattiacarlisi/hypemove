import React from "react";
import { Activity, ArrowRight, CheckCircle2, Clock3, Download, Footprints, ListChecks, ShieldCheck } from "lucide-react";
import GuideFooter from "../components/GuideFooter.jsx";

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=pt.app&hl=it";

const timeline = [
  {
    time: "10 minuti",
    title: "Dopo 10 minuti: un inizio che conta davvero",
    text: [
      "Una camminata a passo svelto di 10 minuti è già un modo concreto per muoversi di più e può contare verso il totale settimanale di attività fisica.",
      "È anche un punto di ingresso realistico per chi ha poco tempo, parte da zero o fatica a mantenere routine più lunghe.",
      "Dopo i pasti, una breve camminata può aiutare la risposta glicemica post-prandiale, soprattutto se fatta poco dopo aver mangiato.",
    ],
  },
  {
    time: "20 minuti",
    title: "Dopo 20 minuti: più attivazione, più continuità possibile",
    text: [
      "Con 20 minuti aumenti il volume totale di movimento senza trasformare la camminata in un impegno enorme.",
      "Molte persone percepiscono più scioltezza, meno rigidità e un tono mentale leggermente migliore.",
      "Il punto non è inseguire il numero perfetto: è trovare una durata che riesci a ripetere nella tua settimana reale.",
    ],
  },
  {
    time: "30 minuti",
    title: "Dopo 30 minuti: entri nel territorio delle raccomandazioni classiche",
    text: [
      "Trenta minuti al giorno per 5 giorni sono l'esempio più semplice per arrivare ai 150 minuti settimanali di attività moderata raccomandati agli adulti.",
      "La camminata regolare può contribuire alla salute cardiovascolare, al tono dell'umore, al sonno e alla gestione del peso nel quadro generale dello stile di vita.",
    ],
  },
  {
    time: "60 minuti",
    title: "Dopo 60 minuti: più volume, ma non per forza più sostenibilità",
    text: [
      "Una camminata più lunga aumenta il volume totale di attività e può contribuire di più al dispendio energetico.",
      "Il consumo calorico però varia molto: peso corporeo, velocità, pendenza, durata e intensità cambiano parecchio il risultato.",
      "Non serve partire da 60 minuti per ottenere benefici. Spesso la scelta migliore è quella che riesci davvero a mantenere.",
    ],
  },
];

const notPromises = [
  "Non esiste un minuto magico che sblocca tutto.",
  "La risposta del corpo non è uguale per tutti.",
  "Camminare non sostituisce sempre tutto il resto.",
  "Per obiettivi specifici può servire anche altro, ma resta una base ottima.",
];

const practicalTips = [
  "10 minuti dopo pranzo",
  "15 minuti quando sei scarico mentalmente",
  "30 minuti nei giorni in cui vuoi muoverti di più",
  "Più blocchi brevi distribuiti nella settimana",
];

const faqs = [
  {
    q: "Camminare 10 minuti al giorno serve davvero?",
    a: "Sì, soprattutto come punto di partenza e come modo sostenibile per muoversi di più. Una camminata a passo svelto di 10 minuti ha benefici per la salute e può contare verso il totale settimanale raccomandato.",
  },
  {
    q: "Camminare dopo mangiato aiuta davvero?",
    a: "Sì, in particolare per la glicemia post-prandiale. Le evidenze mostrano che camminare poco dopo i pasti può migliorare la risposta glicemica.",
  },
  {
    q: "Meglio 10 minuti o 60 minuti?",
    a: "Dipende dal contesto. Sessanta minuti aumentano il volume totale, ma dieci minuti fatti con costanza spesso sono più realistici e quindi più utili nella pratica.",
  },
  {
    q: "La camminata basta per rimettersi in forma?",
    a: "Può essere una base molto buona, ma per alcuni obiettivi può essere utile affiancarla anche ad altro.",
  },
  {
    q: "Quanta camminata è raccomandata in generale?",
    a: "Le linee guida per gli adulti indicano 150 minuti a settimana di attività moderata, come la camminata a passo svelto.",
  },
];

const sources = [
  {
    label: "NHS - Walking for health",
    href: "https://www.nhs.uk/live-well/exercise/walking-for-health/",
  },
  {
    label: "CDC - Health Benefits of Physical Activity for Adults",
    href: "https://www.cdc.gov/physical-activity-basics/health-benefits/adults.html",
  },
  {
    label: "American Heart Association - Physical Activity Recommendations",
    href: "https://www.heart.org/en/healthy-living/fitness/fitness-basics/aha-recs-for-physical-activity-in-adults",
  },
  {
    label: "Sports Medicine meta-analysis - Post-meal exercise and glucose response",
    href: "https://pubmed.ncbi.nlm.nih.gov/36715875/",
  },
];

function LogoMark() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
      <span className="text-lg font-black tracking-[-0.06em]">H</span>
    </div>
  );
}

function CtaButton({ children = "Scopri Hypemove", href = PLAY_STORE_URL }) {
  return (
    <a
      href={href}
      className="group inline-flex min-h-[56px] items-center justify-center rounded-full bg-black px-6 py-4 text-base font-semibold text-white transition hover:-translate-y-0.5 sm:px-7"
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

function InternalLinks() {
  const links = [
    { href: "/allenamento-a-casa", label: "Allenamento a casa" },
    { href: "/mini-workout-efficaci", label: "Workout brevi efficaci" },
    { href: "/come-essere-costanti-nell-allenamento", label: "Costanza nell'allenamento" },
    { href: "/guide", label: "Tutte le guide" },
    { href: "/", label: "Home" },
  ];

  return (
    <nav aria-label="Link utili" className="mt-8 flex flex-wrap gap-3">
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="inline-flex items-center rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black/65 transition hover:-translate-y-0.5 hover:border-black/20 hover:text-black"
        >
          {link.label}
        </a>
      ))}
    </nav>
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

export default function BeneficiCamminataTempo() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-black">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#FDFDFD]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center gap-3">
            <LogoMark />
            <div>
              <div className="text-base font-black tracking-[-0.03em]">Hypemove</div>
              <div className="text-xs text-black/45">Camminata e movimento</div>
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
        <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(0,0,0,0.9)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.9)_1px,transparent_1px)] [background-size:48px_48px]" />
          <div className="pointer-events-none absolute right-[-12%] top-10 h-72 w-72 rounded-full bg-[#FB8B04]/12 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.55fr)]">
            <div>
              <Kicker>Guida pratica</Kicker>
              <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[0.95] tracking-[-0.06em] text-black sm:text-6xl lg:text-7xl">
                Benefici della camminata: cosa cambia dopo 10, 20, 30 e 60 minuti
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-black/65 sm:text-xl sm:leading-9">
                Non serve camminare ore per ottenere qualcosa. Ecco quali benefici hanno più senso aspettarsi da una camminata breve, media o più lunga.
              </p>
              <InternalLinks />
            </div>

            <div className="rounded-[32px] border border-black/10 bg-white p-6 shadow-[0_30px_90px_rgba(0,0,0,0.08)]">
              <Footprints className="h-10 w-10 text-[#FB8B04]" />
              <div className="mt-5 text-4xl font-black tracking-[-0.06em]">Poco, ma fatto davvero.</div>
              <p className="mt-4 text-base leading-8 text-black/62">
                Camminare è una forma semplice di attività fisica. Anche sessioni brevi hanno valore, ma il beneficio dipende da intensità, regolarità, contesto e persona.
              </p>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <TextBlock eyebrow="Il punto chiave" title="Non conta solo quanto cammini. Conta anche se riesci a farlo davvero.">
              <p>
                Il valore della camminata non sta solo nel numero perfetto di minuti. Sta anche nel fatto che è una delle forme di movimento più accessibili e più facili da mantenere nel tempo.
              </p>
              <p>
                Se oggi parti da zero, una camminata breve può essere molto più utile di un piano enorme che non inizi mai. Un po' di attività fisica è meglio di niente, e con la regolarità i benefici diventano più solidi.
              </p>
            </TextBlock>
          </div>
        </section>

        <section className="bg-[#FCFBF8] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <Kicker>Timeline realistica</Kicker>
              <h2 className="mt-5 text-3xl font-black tracking-[-0.05em] text-black sm:text-5xl">
                Cosa ha senso aspettarsi minuto dopo minuto
              </h2>
              <p className="mt-5 text-base leading-8 text-black/62 sm:text-lg">
                Non sono soglie magiche. Sono durate pratiche per capire come usare la camminata nella vita reale.
              </p>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              {timeline.map((item) => (
                <article key={item.time} className="rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_18px_54px_rgba(0,0,0,0.045)]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-black text-white">
                      <Clock3 className="h-5 w-5" />
                    </div>
                    <div className="text-sm font-black uppercase tracking-[0.22em] text-[#FB8B04]">{item.time}</div>
                  </div>
                  <h3 className="mt-5 text-2xl font-black tracking-[-0.04em] text-black">{item.title}</h3>
                  <div className="mt-4 space-y-4 text-base leading-8 text-black/65">
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
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(320px,0.75fr)]">
            <TextBlock dark eyebrow="Fiducia" title="Quello che questa pagina non ti promette">
              <p>
                La camminata è utile, ma non ha bisogno di essere venduta come una soluzione magica. È proprio la sua semplicità a renderla interessante.
              </p>
            </TextBlock>

            <ul className="grid gap-3">
              {notPromises.map((item) => (
                <li key={item} className="flex gap-3 rounded-[22px] border border-white/10 bg-white/[0.05] p-4 text-base leading-7 text-white/78">
                  <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-[#FB8B04]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(320px,0.7fr)]">
            <TextBlock eyebrow="Vita reale" title="Come rendere la camminata davvero utile nella vita quotidiana">
              <p>
                La strategia migliore è spesso quella che entra senza attrito nella giornata. Puoi usare la camminata come blocco singolo o spezzarla in più momenti.
              </p>
              <p>
                Non deve essere tutto perfetto. Deve essere abbastanza semplice da poterlo rifare.
              </p>
            </TextBlock>

            <ul className="grid gap-3">
              {practicalTips.map((item) => (
                <li key={item} className="flex gap-3 rounded-[22px] border border-black/10 bg-white p-4 text-base leading-7 text-black/68 shadow-[0_16px_50px_rgba(0,0,0,0.04)]">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#FB8B04]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-[#FCFBF8] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(320px,0.7fr)]">
              <div>
                <Kicker>Hypemove</Kicker>
                <h2 className="mt-5 text-3xl font-black tracking-[-0.05em] text-black sm:text-5xl">
                  Vuoi trasformare il movimento in qualcosa di più facile da mantenere?
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-black/65 sm:text-lg">
                  Hypemove ti aiuta a partire con workout brevi e guidati, pensati per entrare davvero nella tua giornata.
                </p>
                <div className="mt-8">
                  <CtaButton>Prova Hypemove gratis</CtaButton>
                </div>
              </div>

              <div className="rounded-[32px] border border-black/10 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                <Activity className="h-9 w-9 text-[#FB8B04]" />
                <p className="mt-5 text-2xl font-black tracking-[-0.04em] text-black">
                  Camminare può essere l'inizio. La costanza è il vero obiettivo.
                </p>
                <InternalLinks />
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

            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: faqs.map((faq) => ({
                    "@type": "Question",
                    name: faq.q,
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: faq.a,
                    },
                  })),
                }),
              }}
            />
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

      <GuideFooter />
    </div>
  );
}
