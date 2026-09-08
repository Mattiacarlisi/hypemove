import React from "react";
import { AppShot, Faq, Layout, PlayButton, Section, SectionHead } from "../components/Layout.jsx";
import { SITE_URL, breadcrumb, faqSchema } from "../site.js";

const faqs = [
  {
    q: "Il Coach AI è una persona?",
    a: "No, è un'intelligenza artificiale dentro l'app. Conosce il tuo percorso, il tuo obiettivo, gli attrezzi che hai detto di avere e quello che gli hai scritto nelle chat precedenti.",
  },
  {
    q: "Cosa posso chiedergli?",
    a: "Come si fa un esercizio, con cosa sostituirlo se ti dà fastidio, di accorciare o allungare l'allenamento di oggi, di concentrarsi su gambe, addome o schiena, di usare l'elastico o il kettlebell che hai in casa. Puoi anche fotografare un piatto e farti segnare le calorie.",
  },
  {
    q: "È gratis?",
    a: "Nel piano gratuito puoi scrivergli un numero limitato di messaggi a settimana. Con Premium non ci sono limiti.",
  },
  {
    q: "Si ricorda quello che gli dico?",
    a: "Sì. Se gli dici che hai un ginocchio delicato o che ti alleni solo la sera, non devi ripeterglielo: ne tiene conto nelle proposte successive.",
  },
  {
    q: "Può sbagliare?",
    a: "Come ogni assistente automatico, a volte sì. Non sostituisce un medico o un fisioterapista: se hai un dolore o una patologia, chiedi prima a chi ti segue.",
  },
];

export const meta = {
  title: "Coach AI di Hypemove: un coach in chat che adatta l'allenamento a te",
  description:
    "Il Coach AI di Hypemove risponde in chat: spiega gli esercizi, li sostituisce, cambia l'allenamento di oggi in base a tempo, attrezzi e come ti senti. Senza limiti in Premium.",
  ogImage: `${SITE_URL}/images/og/coach-ai.jpg`,
  ogImageAlt: "Il Coach AI di Hypemove",
  type: "website",
  modified: "2026-09-08",
  jsonld: [
    { "@type": "WebPage", "@id": `${SITE_URL}/coach-ai#webpage`, url: `${SITE_URL}/coach-ai`, name: "Coach AI di Hypemove", isPartOf: { "@id": `${SITE_URL}/#website` }, about: { "@id": `${SITE_URL}/#app` }, inLanguage: "it-IT" },
    faqSchema(faqs),
    breadcrumb([{ name: "Home", path: "/" }, { name: "Coach AI", path: "/coach-ai" }]),
  ],
};

const examples = [
  {
    you: "Ho 10 minuti e un elastico. Voglio lavorare sulle gambe.",
    coach: "Ti ho messo 10 minuti di gambe con l'elastico: squat con elastico sopra le ginocchia, affondi indietro, ponte glutei, camminata laterale. Lo trovi nel programma di oggi.",
  },
  {
    you: "Il plank mi fa male ai polsi.",
    coach: "Capito, lo tolgo dai prossimi allenamenti. Al suo posto: plank sugli avambracci e dead bug, stessi muscoli, zero peso sui polsi.",
  },
  {
    you: "Oggi sono stanca, mi va solo allungamento.",
    coach: "Perfetto, 8 minuti di allungamento per schiena e gambe, da fare anche sul tappeto del salotto. Domani riprendiamo la tappa dove l'hai lasciata.",
  },
];

export default function CoachAI() {
  return (
    <Layout current="coach">
      <section className="px-5 pb-10 pt-8 sm:px-7 sm:pt-12 lg:pb-8 lg:pt-10">
        <div className="mx-auto grid max-w-site items-center gap-8 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="kicker">Coach AI</div>
            <h1 className="mt-3 max-w-[16ch] text-5xl sm:text-6xl lg:text-[4.5rem]">Un coach che ti ascolta e cambia il programma.</h1>
            <p className="mt-5 max-w-[52ch] text-lg text-ink-2 sm:text-xl">Gli scrivi come stai, quanto tempo hai, cosa hai in casa. Lui sistema l'allenamento di oggi, ti spiega gli esercizi che non conosci, e si ricorda quello che gli hai detto.</p>
            <div className="mt-7"><PlayButton location="coach_hero" /></div>
          </div>
          <div className="mx-auto w-[min(260px,70vw)]">
            <div className="drop-shadow-[0_24px_32px_rgba(60,35,10,0.16)]"><AppShot name="coach-kettlebell" alt="Chat con il Coach AI: un allenamento di 5 minuti con il kettlebell creato su richiesta" priority /></div>
          </div>
        </div>
      </section>

      <Section tone="deep">
        <SectionHead light kicker="Cosa gli scrivi" title="Chiedi una cosa precisa. Lui la fa." sub="Non è un motivatore. È uno che sistema l'allenamento. Tre conversazioni vere di come si usa." />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {examples.map((item) => (
            <div key={item.you} className="flex flex-col gap-3 rounded-2xl bg-white/[0.06] p-4 text-[0.95rem] ring-1 ring-white/10">
              <div className="max-w-[92%] self-end rounded-2xl rounded-br-md bg-orange px-3.5 py-2.5 text-white">
                <div className="mb-1 text-[0.65rem] font-extrabold uppercase tracking-[0.1em] opacity-80">Tu</div>
                {item.you}
              </div>
              <div className="max-w-[92%] rounded-2xl rounded-bl-md bg-[#3A352D] px-3.5 py-2.5 text-[#F4EFE6]">
                <div className="mb-1 text-[0.65rem] font-extrabold uppercase tracking-[0.1em] opacity-70">Coach</div>
                {item.coach}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="mx-auto w-[min(280px,70vw)] md:order-2">
            <AppShot name="coach-calorie" alt="Il Coach AI riconosce un piatto da una foto e segna proteine, carboidrati, grassi e calorie" className="drop-shadow-[0_24px_32px_rgba(0,0,0,0.16)]" />
          </div>
          <div>
            <div className="kicker">Anche a tavola</div>
            <h2 className="h-section mt-3">Fotografi il piatto, lui segna le calorie.</h2>
            <p className="mt-4 text-lg text-ink-2">Nessuna tabella da compilare. Scatti una foto, il coach riconosce cosa c'è nel piatto e ti dice proteine, carboidrati, grassi e calorie. Serve a chi vuole avere un'idea, senza trasformare ogni pasto in un compito.</p>
          </div>
        </div>
      </Section>

      <Section tone="deep">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            ["Conosce il tuo percorso", "Sa a che tappa sei, quale obiettivo hai scelto, quanto tempo hai detto di avere e quali attrezzi hai in casa. Non parte mai da zero."],
            ["Nel gratuito è limitato, non finto", "Con il piano gratuito puoi scrivergli un numero limitato di messaggi a settimana, e fanno tutto quello che leggi qui. Con Premium scrivi quanto vuoi."],
            ["Non è un medico", "Se hai un dolore che dura, una patologia o una gravidanza, chiedi prima a chi ti segue. Il coach adatta un allenamento, non fa diagnosi."],
          ].map(([title, text]) => (
            <div key={title}>
              <h2 className="font-sans text-xl font-extrabold text-white">{title}</h2>
              <p className="mt-2 text-white/70">{text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4"><SectionHead variant="stack" kicker="Domande sul coach" title="Quello che chiedono tutti." /></div>
          <div className="lg:col-span-8"><Faq items={faqs} className="max-w-none" /></div>
        </div>
      </Section>
    </Layout>
  );
}
