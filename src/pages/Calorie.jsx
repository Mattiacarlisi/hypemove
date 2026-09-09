import React from "react";
import { AppShot, Faq, Layout, PlayButton, Section, SectionHead } from "../components/Layout.jsx";
import { SITE_URL, breadcrumb, faqSchema } from "../site.js";

const faqs = [
  { q: "Come funziona il conteggio delle calorie da foto?", a: "Scatti una foto del piatto dentro la chat del Coach AI. Il coach riconosce gli alimenti, stima le quantità e ti risponde con proteine, carboidrati, grassi e calorie totali. Ci mette qualche secondo." },
  { q: "Quanto è preciso?", a: "È una stima, non una bilancia: sui piatti semplici e ben visibili è affidabile, su salse, fritti e porzioni nascoste può sbagliare di più. Serve a farsi un'idea e a tarare l'occhio, non a contare al grammo." },
  { q: "Devo compilare un diario alimentare?", a: "No. Non ci sono tabelle da riempire né obiettivi da impostare. Fotografi quando vuoi, e il coach ricorda quello che gli hai mostrato." },
  { q: "È gratis?", a: "Fa parte del Coach AI: nel piano gratuito hai un numero limitato di messaggi a settimana, foto comprese. Con Premium non ci sono limiti." },
  { q: "Serve per dimagrire?", a: "Aiuta a capire dove finisce l'energia in più nella giornata, che è il primo passo. Il peso poi dipende dall'insieme: quanto mangi, quanto ti muovi, quanto dormi. Per una dieta vera e propria serve un professionista." },
];

export const meta = {
  title: "Calorie da una foto: il contacalorie dentro il Coach AI di Hypemove",
  description: "Fotografi il piatto e il Coach AI di Hypemove segna proteine, carboidrati, grassi e calorie. Niente diario da compilare: movimento e cibo nella stessa app.",
  ogImage: `${SITE_URL}/images/og/coach-ai.jpg`,
  ogImageAlt: "Calorie da una foto con il Coach AI di Hypemove",
  type: "website",
  modified: "2026-09-09",
  jsonld: [
    { "@type": "WebPage", "@id": `${SITE_URL}/calorie#webpage`, url: `${SITE_URL}/calorie`, name: "Calorie da una foto", isPartOf: { "@id": `${SITE_URL}/#website` }, about: { "@id": `${SITE_URL}/#app` }, inLanguage: "it-IT" },
    faqSchema(faqs),
    breadcrumb([{ name: "Home", path: "/" }, { name: "Calorie da una foto", path: "/calorie" }]),
  ],
};

export default function Calorie() {
  return (
    <Layout current="coach">
      <section className="px-5 pb-10 pt-8 sm:px-7 sm:pt-12 lg:pb-8 lg:pt-10">
        <div className="mx-auto grid max-w-site items-center gap-8 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="kicker">Calorie da una foto</div>
            <h1 className="mt-3 max-w-[16ch] text-5xl sm:text-6xl lg:text-[4.5rem]">Fotografi il piatto, lui segna le calorie.</h1>
            <p className="mt-5 max-w-[52ch] text-lg text-ink-2 sm:text-xl">Nessuna tabella da compilare. Scatti una foto nella chat del coach e ricevi proteine, carboidrati, grassi e calorie. Movimento e cibo nella stessa app, perché nella vita vera stanno insieme.</p>
            <div className="mt-7"><PlayButton location="calorie_hero" /></div>
          </div>
          <div className="mx-auto w-[min(260px,70vw)]">
            <AppShot name="coach-calorie" alt="Il Coach AI riconosce un piatto da una foto e segna proteine, carboidrati, grassi e calorie" priority className="drop-shadow-[0_24px_32px_rgba(0,0,0,0.16)]" />
          </div>
        </div>
      </section>

      <Section tone="deep">
        <SectionHead light kicker="Perché insieme" title="Ti alleni 10 minuti e poi mangi come prima. Ecco perché insieme." sub="Il movimento e il cibo lavorano sullo stesso conto. Chi si allena tende a scegliere meglio a tavola; chi mangia in modo regolare ha l'energia per allenarsi. Tenerli nello stesso posto è il modo più semplice per non perdere di vista nessuno dei due." />
        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {[
            ["Tre secondi", "Una foto al posto di una tabella. È il motivo per cui la gente continua a farlo dopo la prima settimana."],
            ["Una stima onesta", "Il coach ti dà un ordine di grandezza, non un numero al grammo. Serve a capire quanto vale il tuo piatto abituale."],
            ["Lo stesso coach", "Quello a cui chiedi di cambiare l'allenamento. Sa quanto ti muovi e cosa gli hai mostrato: le due cose si parlano."],
          ].map(([title, text]) => (
            <article key={title} className="rounded-2xl bg-white/[0.06] p-6 ring-1 ring-white/10">
              <h3 className="font-display text-3xl font-extrabold leading-none text-orange">{title}</h3>
              <p className="mt-3 text-white/70">{text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHead kicker="Come si usa" title="Apri la chat, scatta, leggi." />
        <ol className="mt-9 grid gap-6 md:grid-cols-3">
          {[
            ["1", "Apri il Coach AI", "Dal percorso, tocca il coach. È la stessa chat in cui gli chiedi di cambiare gli esercizi."],
            ["2", "Fotografa il piatto", "Tocca l'icona della fotocamera e scatta. Meglio dall'alto, con tutto il piatto nell'inquadratura."],
            ["3", "Leggi la stima", "Proteine, carboidrati, grassi e calorie totali. Se vuoi, chiedigli come bilanciare il pasto successivo."],
          ].map(([n, title, text]) => (
            <li key={n} className="rounded-2xl bg-surface p-6 ring-1 ring-rule">
              <div className="font-display text-4xl font-extrabold leading-none text-orange">{n}</div>
              <h3 className="mt-3 font-sans text-xl font-extrabold">{title}</h3>
              <p className="mt-2 text-ink-2">{text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 max-w-prose text-ink-2">Vuoi capire come funziona sotto il cofano e quanto ci si può fidare? Lo spieghiamo nella guida <a href="/contare-le-calorie-con-una-foto" className="font-bold underline decoration-orange decoration-2 underline-offset-2">Contare le calorie con una foto</a>. E per partire con allenamento e alimentazione insieme: <a href="/allenamento-e-alimentazione-da-dove-iniziare" className="font-bold underline decoration-orange decoration-2 underline-offset-2">da dove iniziare se parti da zero</a>.</p>
      </Section>

      <Section tone="deep" className="!py-14">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            ["Non è una dieta", "Non ti dice cosa mangiare né quanto. Ti dice quanto vale quello che hai davanti, e il resto lo decidi tu."],
            ["Non è un medico", "Se hai una patologia, prendi farmaci o hai avuto un rapporto difficile con il cibo, parla con chi ti segue prima di contare qualsiasi cosa."],
            ["Non è un diario", "Niente streak da mantenere a tavola, niente promemoria ossessivi. Fotografi quando hai un dubbio."],
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
          <div className="lg:col-span-4"><SectionHead variant="stack" kicker="Domande" title="Quello che chiedono tutti." /></div>
          <div className="lg:col-span-8"><Faq items={faqs} className="max-w-none" /></div>
        </div>
      </Section>
    </Layout>
  );
}
