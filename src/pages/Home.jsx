import React from "react";
import { AppShot, Faq, Layout, PlayButton, Section, SectionHead } from "../components/Layout.jsx";
import { homeGuideCards } from "../data/guides.js";
import { DEFINITION, FACTS, PRICES, SITE_URL, breadcrumb, faqSchema } from "../site.js";

// Le FAQ della home: risposte brevi e complete, citabili da sole (Google e AI le riprendono così).
export const homeFaqs = [
  {
    q: "Hypemove è gratis?",
    a: `Sì. Il percorso, gli allenamenti, i video degli esercizi, i punti e i premi sono gratuiti. Premium è un abbonamento facoltativo da ${PRICES.monthly} € al mese o ${PRICES.yearly} € all'anno, e si disdice quando vuoi da Google Play.`,
  },
  {
    q: "Quanto durano gli allenamenti?",
    a: "Scegli tu: 5, 10 o 15 minuti. La durata la imposti all'inizio e la cambi quando vuoi, anche dicendolo al coach.",
  },
  {
    q: "Serve attrezzatura?",
    a: "No. Puoi fare tutto a corpo libero. Se in casa hai manubri, elastici, una sedia o un kettlebell, l'app li usa: dei 400 esercizi in catalogo, più della metà prevede un attrezzo.",
  },
  {
    q: "È adatta a chi parte da zero?",
    a: "È pensata proprio per questo. Il percorso parte dal tuo livello e aumenta poco alla volta. Ogni esercizio ha il video e una voce che ti guida.",
  },
  {
    q: "Cosa fa il Coach AI?",
    a: "Risponde in chat: ti spiega come si fa un esercizio, lo sostituisce se ti dà fastidio, cambia il programma di oggi se hai meno tempo o vuoi lavorare su una parte precisa. Si ricorda quello che gli dici.",
  },
  {
    q: "C'è per iPhone?",
    a: "Non ancora. Oggi Hypemove è su Android. Lasciaci la mail nella pagina iPhone e ti avvisiamo quando arriva.",
  },
];

export const meta = {
  title: "Hypemove: app fitness per tornare a muoverti, a casa",
  description:
    "App fitness gratuita per Android: allenamenti guidati da 5 a 15 minuti a casa, percorso a tappe, 400+ esercizi con video e Coach AI. Per chi fatica a essere costante.",
  ogImage: `${SITE_URL}/images/og/home.jpg`,
  ogImageAlt: "Hypemove: torna a muoverti, questa volta per davvero",
  type: "website",
  modified: "2026-09-08",
  jsonld: [
    { "@type": "WebPage", "@id": `${SITE_URL}/#webpage`, url: `${SITE_URL}/`, name: "Hypemove", isPartOf: { "@id": `${SITE_URL}/#website` }, about: { "@id": `${SITE_URL}/#app` }, inLanguage: "it-IT" },
    faqSchema(homeFaqs),
    breadcrumb([{ name: "Home", path: "/" }]),
  ],
};

const objections = [
  {
    q: "Non ho tempo",
    title: "Una tappa dura quanto un caffè",
    text: "Scegli tu tra 5, 10 e 15 minuti. Nei giorni pieni fai la versione corta, e conta lo stesso.",
  },
  {
    q: "Ho sempre mollato",
    title: "Niente da decidere, niente da perdere",
    text: "Apri l'app e trovi la tappa di oggi. Se salti un giorno non ricominci da zero: conta la settimana, non la perfezione.",
  },
  {
    q: "Non sono da palestra",
    title: "Si fa in salotto, come sei",
    text: "A corpo libero o con quello che hai in casa. Ogni esercizio ha il video, e se hai un dubbio lo chiedi al coach.",
  },
];

const goals = ["Rimettermi in forma", "Tonificare", "Avere più energia", "Sentirmi meno rigida"];

const facts = [
  ["Allenamenti da 5, 10 o 15 minuti", "scegli tu la durata"],
  ["Oltre 400 esercizi con video", "a corpo libero o con manubri, elastici, sedia, kettlebell"],
  ["Percorso a tappe", "una al giorno, senza pianificare niente"],
  ["Coach AI in chat", "spiega gli esercizi e adatta il programma"],
  ["Punti, giorni di fila, baule dei premi, classifica", "il progresso si vede"],
  ["Android, gratis", "iPhone in arrivo"],
];

export default function Home() {
  return (
    <Layout current="home">
      {/* Hero: la promessa, il prodotto vero, la CTA. Su telefono il telefono sta sotto il testo ma entra nella prima schermata. */}
      <section className="px-5 pb-10 pt-8 sm:px-7 sm:pt-14">
        <div className="mx-auto grid max-w-site items-center gap-8 md:grid-cols-[1.15fr_0.85fr] md:gap-12">
          <div>
            <div className="kicker">App fitness per Android · Gratis</div>
            <h1 className="mt-3 text-[3.4rem] leading-[0.9] sm:text-7xl lg:text-[5.6rem]">
              Torna a muoverti.
              <br />
              <span className="text-orange">Questa volta per davvero.</span>
            </h1>
            <p className="mt-5 max-w-[52ch] text-lg text-ink-2 sm:text-xl">
              Allenamenti brevi da fare a casa, un percorso a tappe che ti dice cosa fare oggi, e un coach che si adatta a come ti alleni. Pensata per chi ha poco tempo, poca voglia, e ha già mollato altre volte.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <PlayButton location="hero" />
              <a href="/iphone" className="btn-ghost">Hai un iPhone? Avvisami</a>
            </div>
          </div>
          <div className="relative mx-auto w-[min(300px,72vw)] md:w-full md:max-w-[340px]">
            <div className="drop-shadow-[0_28px_36px_rgba(60,35,10,0.18)]"><AppShot name="esercizio" alt="Schermata di Hypemove durante un esercizio: video, cerchio del tempo e conto alla rovescia" priority /></div>
            <div className="absolute -left-2 top-[16%] rounded-xl border border-rule bg-white px-3.5 py-2.5 shadow-lg sm:-left-6">
              <div className="font-display text-2xl font-extrabold leading-none text-orange">5 min</div>
              <div className="text-xs font-extrabold text-ink">tappa di oggi</div>
            </div>
            <div className="absolute -right-2 bottom-[14%] rounded-xl border border-rule bg-white px-3.5 py-2.5 shadow-lg sm:-right-6">
              <div className="font-display text-2xl font-extrabold leading-none text-orange">12</div>
              <div className="text-xs font-extrabold text-ink">giorni di fila</div>
            </div>
          </div>
        </div>
      </section>

      {/* Numeri veri, gli stessi della scheda Play e delle ads. */}
      <div className="border-y border-rule bg-paper">
        <dl className="mx-auto grid max-w-site grid-cols-2 md:grid-cols-4">
          {[
            ["2.000+", "persone l'hanno scaricata"],
            ["5-15 min", "per allenamento, scegli tu"],
            ["400+", "esercizi con video"],
            ["0 €", "per iniziare, Premium facoltativo"],
          ].map(([n, label]) => (
            <div key={label} className="px-3 py-5 text-center">
              <dt className="sr-only">{label}</dt>
              <dd>
                <span className="block font-display text-3xl font-extrabold leading-none text-ink sm:text-4xl">{n}</span>
                <span className="mt-1 block text-sm font-bold text-ink-2">{label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <Section id="perche">
        <SectionHead kicker="Perché di solito si molla" title="Non è un problema di volontà. È che tutto chiede troppo." sub="Palestre, programmi, app: funzionano per chi è già costante. Hypemove è fatta per le giornate normali, quelle piene, quelle in cui rimandi." />
        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {objections.map((item) => (
            <article key={item.q} className="rounded-2xl bg-peach p-6">
              <div className="font-display text-3xl font-extrabold leading-none text-orange">“{item.q}”</div>
              <h3 className="mt-3 font-sans text-lg font-extrabold leading-snug">{item.title}</h3>
              <p className="mt-2 text-ink-2">{item.text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="come-funziona" className="!pt-0">
        <SectionHead kicker="Come funziona" title="Tre cose, sempre le stesse." />
        <ol className="mt-9 grid gap-6 md:grid-cols-3">
          <li>
            <div className="flex h-[300px] items-center justify-center rounded-2xl bg-peach p-6">
              <div className="w-full max-w-[260px] rounded-2xl bg-white p-5 shadow-sm">
                <div className="text-xs font-extrabold uppercase tracking-[0.1em] text-ink-3">Qual è il tuo obiettivo?</div>
                <ul className="mt-3 grid gap-2">
                  {goals.map((goal, index) => (
                    <li key={goal} className={`rounded-lg border px-3 py-2 text-sm font-bold ${index === 0 ? "border-orange bg-peach text-ink" : "border-rule text-ink-2"}`}>{goal}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-4 font-display text-lg font-extrabold uppercase tracking-wide text-orange">Prima</div>
            <h3 className="mt-1 font-sans text-xl font-extrabold">Dici il tuo obiettivo e quanto tempo hai</h3>
            <p className="mt-1 text-ink-2">Rimetterti in forma, tonificare, avere più energia. Due minuti, una volta sola.</p>
          </li>
          <li>
            <div className="flex h-[300px] items-start justify-center overflow-hidden rounded-2xl bg-peach px-6 pt-6">
              <AppShot name="percorso" alt="Il percorso a tappe di Hypemove" className="w-[170px]" sizes="170px" radius="rounded-[24px]" />
            </div>
            <div className="mt-4 font-display text-lg font-extrabold uppercase tracking-wide text-orange">Ogni giorno</div>
            <h3 className="mt-1 font-sans text-xl font-extrabold">Fai la tappa di oggi</h3>
            <p className="mt-1 text-ink-2">Un percorso a tappe, una al giorno, con il video di ogni esercizio e una voce che ti guida.</p>
          </li>
          <li>
            <div className="flex h-[300px] items-start justify-center overflow-hidden rounded-2xl bg-peach px-6 pt-6">
              <AppShot name="progressi" alt="La schermata dei progressi di Hypemove" className="w-[170px]" sizes="170px" radius="rounded-[24px]" />
            </div>
            <div className="mt-4 font-display text-lg font-extrabold uppercase tracking-wide text-orange">Dopo</div>
            <h3 className="mt-1 font-sans text-xl font-extrabold">Vedi che stai andando avanti</h3>
            <p className="mt-1 text-ink-2">Punti, giorni di fila, chiavi che aprono un baule di premi. Il progresso si vede, anche quando è piccolo.</p>
          </li>
        </ol>
      </Section>

      <Section id="coach" tone="deep">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <div className="kicker !text-orange-soft">Coach AI</div>
            <h2 className="h-section mt-3 text-white">Un coach che ti ascolta e cambia il programma.</h2>
            <p className="mt-4 text-lg text-white/75">Gli scrivi come stai, cosa hai in casa, su cosa vuoi lavorare. Lui sistema l'allenamento di oggi e se lo ricorda per domani.</p>
            <p className="mt-4 text-sm text-white/60">Nel piano gratuito il coach risponde a un numero limitato di messaggi a settimana. Con Premium, senza limiti.</p>
            <a href="/coach-ai" className="btn-primary mt-6">Scopri il coach</a>
          </div>
          <div className="mx-auto w-[min(280px,70vw)]">
            <AppShot name="coach-kettlebell" alt="Chat con il Coach AI di Hypemove: un allenamento con il kettlebell creato su richiesta" radius="rounded-[38px]" />
          </div>
        </div>
      </Section>

      <Section id="cosa-trovi">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <div className="kicker">Cos'è Hypemove</div>
            <p className="mt-3 max-w-[56ch] text-xl leading-relaxed text-ink">{DEFINITION}</p>
          </div>
          <ul className="grid">
            {facts.map(([main, detail]) => (
              <li key={main} className="flex gap-3 border-b border-rule py-3">
                <span className="mt-1 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-orange text-[11px] font-extrabold text-white" aria-hidden="true">✓</span>
                <span>
                  <span className="font-extrabold">{main}</span> <span className="text-ink-2">· {detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section id="prezzi" tone="peach">
        <SectionHead kicker="Prezzi" title="Gratis per iniziare. Premium se vuoi di più." />
        <div className="mt-8 grid max-w-[820px] gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border-[1.5px] border-rule bg-paper p-6">
            <div className="font-display text-4xl font-extrabold leading-none">Gratis</div>
            <div className="mt-3 text-ink-2"><span className="font-display text-4xl font-extrabold text-ink">0 €</span> per sempre</div>
            <ul className="mt-4 grid gap-1.5 pl-5 text-ink-2" style={{ listStyle: "disc" }}>
              <li>Il percorso a tappe e gli allenamenti</li>
              <li>Tutti gli esercizi con video</li>
              <li>Punti, premi e classifica</li>
              <li>Coach AI con messaggi limitati</li>
              <li>Con pubblicità</li>
            </ul>
          </div>
          <div className="rounded-2xl border-[1.5px] border-orange bg-paper p-6">
            <div className="font-display text-4xl font-extrabold leading-none">Premium</div>
            <div className="mt-3 text-ink-2">
              <span className="font-display text-4xl font-extrabold text-ink">{PRICES.monthly} €</span> al mese, o <span className="font-display text-4xl font-extrabold text-ink">{PRICES.yearly} €</span> l'anno
            </div>
            <ul className="mt-4 grid gap-1.5 pl-5 text-ink-2" style={{ listStyle: "disc" }}>
              <li>Un percorso che si adatta mentre avanzi</li>
              <li>Coach AI senza limiti</li>
              <li>Niente pubblicità</li>
            </ul>
            <p className="mt-4 text-sm text-ink-2">Si disdice quando vuoi da Google Play.</p>
          </div>
        </div>
        <a href="/prezzi" className="mt-6 inline-block font-bold underline decoration-orange decoration-2 underline-offset-4">Tutti i dettagli sui prezzi</a>
      </Section>

      <Section id="chi-siamo">
        <div className="grid gap-8 md:grid-cols-[1fr_1fr] md:items-center">
          <SectionHead kicker="Chi c'è dietro" title="Due persone, un'app che stiamo costruendo in pubblico." sub="Hypemove nasce in Italia da un'idea semplice: il movimento deve stare dentro la vita vera, non il contrario." />
          <div className="grid gap-3">
            {[
              ["M", "Mattia Carlisi", "Founder. Prodotto e marketing. Racconta il percorso su LinkedIn."],
              ["D", "Danilo", "Sviluppo. Tutto quello che vedi nell'app passa dalle sue mani."],
            ].map(([initial, name, role]) => (
              <div key={name} className="flex items-center gap-4 rounded-2xl border-[1.5px] border-rule p-4">
                <span className="inline-flex h-14 w-14 flex-none items-center justify-center rounded-full bg-peach font-display text-2xl font-extrabold text-orange" aria-hidden="true">{initial}</span>
                <div>
                  <div className="font-extrabold">{name}</div>
                  <div className="text-sm text-ink-2">{role}</div>
                </div>
              </div>
            ))}
            <a href="/chi-siamo" className="mt-1 font-bold underline decoration-orange decoration-2 underline-offset-4">La nostra storia</a>
          </div>
        </div>
      </Section>

      <Section id="domande" className="!pt-0">
        <SectionHead kicker="Domande" title="Le cose che chiedono tutti." />
        <Faq items={homeFaqs} />
      </Section>

      <Section id="guide" tone="peach">
        <SectionHead kicker="Guide" title="Per chi vuole capire prima di iniziare." />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {homeGuideCards.map((guide) => (
            <a key={guide.href} href={guide.href} className="block rounded-2xl border-[1.5px] border-rule bg-paper p-5 transition hover:border-ink">
              <div className="kicker">{guide.category}</div>
              <h3 className="mt-2 font-sans text-xl font-extrabold leading-snug">{guide.title}</h3>
              <p className="mt-2 text-[0.95rem] text-ink-2">{guide.description}</p>
              <span className="mt-4 inline-block text-sm font-extrabold">Leggi la guida →</span>
            </a>
          ))}
        </div>
        <a href="/guide" className="mt-6 inline-block font-bold underline decoration-orange decoration-2 underline-offset-4">Tutte le guide</a>
      </Section>

      <Section id="scarica">
        <div className="rounded-3xl bg-peach px-6 py-12 text-center sm:px-10 sm:py-16">
          <h2 className="h-section mx-auto max-w-[20ch]">Il primo allenamento lo fai oggi.</h2>
          <p className="mx-auto mt-4 max-w-[46ch] text-lg text-ink-2">Scarichi, dici il tuo obiettivo, e la prima tappa è lì. Gratis, senza carta.</p>
          <div className="mt-7 flex justify-center">
            <PlayButton location="final_cta" />
          </div>
          <p className="mt-4 text-sm text-ink-2">{FACTS.piattaforma}. <a href="/iphone" className="font-bold underline underline-offset-2">Avvisami per iPhone</a></p>
        </div>
      </Section>
    </Layout>
  );
}
