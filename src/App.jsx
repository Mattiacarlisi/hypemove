import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Star, Download, HeartHandshake, Shield, Zap, Sparkles, Trophy, Users } from "lucide-react";

const PRIMARY = "#335DFF";
const ACCENT = "#FFFF33";


export default function HypemoveLanding() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
<header className="sticky top-0 z-50 backdrop-blur bg-white/80 border-b border-gray-100">
  <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
    {/* Logo */}
    <a href="#top" className="flex items-center gap-3">
      <img 
        src="/images/logo1.png" 
        alt="Hypemove logo con mascotte" 
        className="h-[100px] w-[100px] rounded-xl object-contain"
      />
      
    </a>

{/* Menu Desktop (AGGIORNATO) */}
<nav className="hidden lg:flex items-center gap-8 text-base font-medium">
  <a href="#hypemover" className="hover:text-gray-800">Per chi è</a>
  <a href="#metodo" className="hover:text-gray-800">Metodo</a>
  <a href="#benefici" className="hover:text-gray-800">Benefici</a>
  <a href="#social" className="hover:text-gray-800">Testimonianze</a>
  <a href="#faq" className="hover:text-gray-800">FAQ</a>
  <a href="#cta-finale" className="hover:text-gray-800">Diventa Hypemover</a>
</nav>


    {/* CTA Desktop */}
    <a 
      href="https://play.google.com/store/apps/details?id=pt.app&hl=it" 
      className="hidden lg:inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-base font-semibold shadow-sm" 
      style={{ backgroundColor: PRIMARY, color: "white" }}
    >
      <Download className="h-5 w-5" /> Scarica gratis
    </a>


    {/* Menu Mobile (hamburger) */}
    <button 
      className="lg:hidden p-2 rounded-md hover:bg-gray-100"
      onClick={() => document.getElementById('mobile-menu').classList.toggle('hidden')}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  </div>

  {/* Mobile Menu (stesso stile, voci aggiornate) */}
{/* Mobile Menu ottimizzato */}
<div 
  id="mobile-menu" 
  className="lg:hidden hidden border-t border-gray-100 bg-white px-5 py-5 space-y-5"
>
  {/* Mobile Menu (AGGIORNATO) */}
<nav className="space-y-4">
  <a href="#hypemover" className="block text-lg font-medium text-gray-800 hover:text-[#335DFF] transition-colors">Per chi è</a>
  <a href="#metodo" className="block text-lg font-medium text-gray-800 hover:text-[#335DFF] transition-colors">Metodo</a>
  <a href="#benefici" className="block text-lg font-medium text-gray-800 hover:text-[#335DFF] transition-colors">Benefici</a>
  <a href="#social" className="block text-lg font-medium text-gray-800 hover:text-[#335DFF] transition-colors">Testimonianze</a>
  <a href="#faq" className="block text-lg font-medium text-gray-800 hover:text-[#335DFF] transition-colors">FAQ</a>
  <a href="#cta-finale" className="block text-lg font-medium text-gray-800 hover:text-[#335DFF] transition-colors">Diventa Hypemover</a>
</nav>

  <div className="pt-4 border-t border-gray-200">
    <a
      href="https://play.google.com/store/apps/details?id=pt.app&hl=it"
      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3 text-lg font-semibold shadow-md transition-transform hover:scale-105 active:scale-95"
      style={{ backgroundColor: "#335DFF", color: "white" }}
    >
      <Download className="h-5 w-5" /> Scarica gratis
    </a>
  </div>
</div>


</header>


      {/* Hero */}
<section id="top" className="relative bg-gradient-to-b from-white to-gray-50">
  <div className="mx-auto max-w-7xl px-4 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
    
    {/* Testo */}
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.6 }} 
      className="space-y-6 text-center lg:text-left"
    >
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
        L’allenamento progettato per diventare un’abitudine.{" "}

      </h1>
      <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto lg:mx-0">
        Se hai iniziato mille volte e hai sempre mollato, il problema non sei tu, è il <strong>metodo.</strong>
      </p>
      <p className="text-base sm:text-lg">
        Hypemove è l'app {" "}
        <strong>gratuita</strong>{" "}
        che usa la scienza delle abitudini per rendere il movimento <strong>semplice, veloce e gratificante.</strong>
      </p>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
        <a 
          href="https://play.google.com/store/apps/details?id=pt.app&hl=it" 
          className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-base font-semibold shadow-lg transition-transform hover:scale-105"
          style={{ backgroundColor: PRIMARY, color: "white" }}
        >
          Scarica gratis!
          <ArrowRight className="h-5 w-5" />
        </a>

      </div>
    </motion.div>

    {/* Immagine */}
   <motion.div  
  initial={{ opacity: 0, y: 10 }} 
  animate={{ opacity: 1, y: 0 }} 
  transition={{ duration: 0.6, delay: 0.1 }} 
  className="flex justify-center px-10 "
>
  <img 
    src="/images/1.2.png" 
    alt="Schermata iniziale dell’app Hypemove con la mascotte che guida l’utente nel percorso di mini allenamenti personalizzati" 
    className="w-full max-w-[160px] sm:max-w-[200px] md:max-w-[240px] rounded-xl shadow-lg border border-gray-100 object-contain"
    loading="lazy"
  />
</motion.div>

  </div>
</section>



{/* Sezione 2 – Chi è davvero un Hypemover */}
<section id="hypemover" className="relative py-20 bg-white overflow-hidden">
  {/* Punto luce blu */}
  <div
    className="absolute top-0 left-0 w-full h-[520px] sm:h-[620px] pointer-events-none"
    style={{
      background: "linear-gradient(to bottom, rgba(51, 93, 255, 0.08) 0%, white 100%)",
    }}
  />

  <div className="mx-auto max-w-6xl px-4 relative z-10">
    {/* Titolo */}
    <div className="mb-16 text-center">
      <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
        Chi è davvero un <span className="text-[#335DFF]">Hypemover</span>
      </h2>
      <p className="mt-4 text-gray-600 text-lg sm:text-xl leading-relaxed max-w-3xl mx-auto">
        Non è una questione di disciplina. È una questione di <strong>metodo</strong>.
      </p>
      <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-[#335DFF]" />
    </div>

    <div className="grid lg:grid-cols-2 gap-10 items-start">
      {/* Card principale */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-white/90 backdrop-blur-md shadow-lg rounded-2xl p-7 sm:p-8 border border-gray-100"
      >
        <p className="text-gray-800 text-base sm:text-lg leading-relaxed">
          Un Hypemover è <strong>qualcuno che non ha mai smesso di provarci</strong>.{" "}
          Ha iniziato tante volte con le migliori intenzioni. Ha seguito programmi seri,
          scaricato app, fatto buoni propositi.
        </p>

        {/* Mini “timeline” visuale (solo impaginazione del testo già scritto) */}
        <div className="mt-7 rounded-2xl border border-[#335DFF]/10 bg-[#335DFF]/5 p-6">
          <p className="text-gray-900 font-semibold mb-4">
            E ogni volta è successa la stessa cosa:
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[#335DFF] flex-shrink-0" />
              <p className="text-gray-800 text-sm sm:text-base leading-relaxed">
                all’inizio funziona.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[#335DFF] flex-shrink-0" />
              <p className="text-gray-800 text-sm sm:text-base leading-relaxed">
                poi arriva un imprevisto.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[#335DFF] flex-shrink-0" />
              <p className="text-gray-800 text-sm sm:text-base leading-relaxed">
                salti un giorno. Ne salti due.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[#335DFF] flex-shrink-0" />
              <p className="text-gray-800 text-sm sm:text-base leading-relaxed">
                e ricominciare diventa <strong>più faticoso che mollare</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Chiusura forte */}
        <div className="mt-7 rounded-2xl border border-gray-100 bg-white p-6">
          <p className="text-gray-800 text-base sm:text-lg leading-relaxed">
            Questo non succede perché manca forza di volontà. Succede perché{" "}
            <strong>la maggior parte dei metodi funziona solo in una vita senza imprevisti</strong>.
          </p>
        </div>
      </motion.div>

      {/* Colonna destra: “callout” grafici (NESSUN contenuto nuovo, solo le stesse idee rese visive) */}
    
    </div>
  </div>
</section>





{/* Sezione 3 – Il Metodo Hypemove */}
<section
  id="metodo"
  className="relative py-20 overflow-hidden"
  style={{
    background: "linear-gradient(to bottom, rgba(51, 93, 255, 0.06) 0%, white 70%)",
  }}
>
  {/* Decorazioni soft */}
  <div className="absolute top-10 right-10 w-24 h-24 rounded-full bg-[#335DFF]/10 blur-xl pointer-events-none" />
  <div className="absolute bottom-10 left-10 w-28 h-28 rounded-full bg-[#FFFF33]/20 blur-xl pointer-events-none" />

  <div className="mx-auto max-w-6xl px-4 relative z-10">
    {/* Titolo */}
    <div className="mb-16 text-center">
      <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
        Il metodo <span className="text-[#335DFF]">anti-fallimento</span>, basato sulla scienza
      </h2>
      <p className="mt-4 text-gray-600 text-lg sm:text-xl leading-relaxed max-w-3xl mx-auto">
        Non contiamo sulla tua <strong>forza di volontà</strong> (che è limitata).{" "}
        Usiamo la psicologia comportamentale per rendere il movimento <strong>automatico</strong>.
      </p>
      <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-[#335DFF]" />
    </div>

    {/* Intro */}
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mx-auto max-w-4xl"
    >
      <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-2xl p-7 sm:p-8 border border-gray-100">
        <p className="text-gray-800 text-base sm:text-lg leading-relaxed">
          La parte più difficile dell’allenamento non è farlo bene. È <strong>iniziare</strong>.
        </p>
        <p className="mt-4 text-gray-700 text-base sm:text-lg leading-relaxed">
          Il cervello percepisce l’allenamento come qualcosa di faticoso, lungo e incompatibile con una vita piena di
          imprevisti. Hypemove nasce per <strong>aggirare questo blocco</strong>, non per combatterlo.
        </p>
      </div>
    </motion.div>

    {/* 3 Pilastri */}
    <div className="mt-10 grid gap-8 lg:grid-cols-3">
      {/* 1 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="h-full rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition p-7"
      >
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-[#335DFF]/10 text-[#335DFF]">
          1 — Facile da iniziare
        </div>
        <h3 className="mt-4 text-xl font-bold text-gray-900 leading-snug">
          Parti da pochi minuti
        </h3>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Iniziare deve richiedere <strong>pochissimo sforzo mentale</strong>.
        </p>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Per questo Hypemove propone <strong>snack workout da 5–10 minuti</strong>: brevi, accessibili, realistici.
          Così la barriera d’ingresso si abbassa al minimo.
        </p>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Niente palestra, niente attrezzi, niente organizzazione extra. Crediamo che{" "}
          <strong>il miglior allenamento sia quello che si adatta alla tua vita</strong>, non il contrario.
        </p>
      </motion.div>

      {/* 2 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.05 }}
        className="h-full rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition p-7"
      >
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-[#335DFF]/10 text-[#335DFF]">
          2 — Naturale da ripetere
        </div>
        <h3 className="mt-4 text-xl font-bold text-gray-900 leading-snug">
          Meno decisioni, più continuità
        </h3>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Uno dei motivi principali per cui si molla è dover decidere ogni volta cosa fare.
        </p>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Con Hypemove segui un <strong>percorso guidato e personalizzato</strong> in base al tuo obiettivo. Quando pensi
          “mi alleno”, sai già cosa fare.
        </p>
        <p className="mt-3 text-gray-700 leading-relaxed">
          <strong>Meno decisioni.</strong> <br />
          <strong>Meno attrito.</strong> <br />
          <strong>Più continuità.</strong>
        </p>
      </motion.div>

      {/* 3 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="h-full rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition p-7"
      >
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-[#335DFF]/10 text-[#335DFF]">
          3 — Gratificante da mantenere
        </div>
        <h3 className="mt-4 text-xl font-bold text-gray-900 leading-snug">
          Ricompensa immediata
        </h3>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Un’abitudine funziona solo se restituisce qualcosa <strong>subito</strong>.
        </p>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Ogni workout su Hypemove ti premia: vedi i progressi, sblocchi ricompense e puoi trasformare l’allenamento in
          una sfida con i tuoi amici. La sensazione di “ho fatto qualcosa” è ciò che ti fa tornare domani.
        </p>
      </motion.div>
    </div>

    {/* Chiusura */}
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mt-12"
    >
      <div className="mx-auto max-w-4xl text-center rounded-2xl border border-gray-100 bg-white/90 backdrop-blur-md shadow-lg p-7 sm:p-8">
        <p className="text-gray-800 text-base sm:text-lg leading-relaxed">
          Hypemove non ti trasforma in una persona diversa. Ti aiuta a{" "}
          <strong>costruire un’abitudine che funziona anche nei giorni normali</strong>.
        </p>
      </div>
    </motion.div>
  </div>
</section>


{/* BENEFICI – Piccole azioni, risultati reali */}
<section id="benefici" className="py-20 bg-gradient-to-b from-[#FFFF33]/10 via-white to-[#335DFF]/5">
  <div className="mx-auto max-w-7xl px-4">
    {/* Titolo */}
    <div className="mb-12 text-center relative">
      <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
        Piccole azioni, <span className="text-[#335DFF]">risultati reali</span>.
      </h2>
      <div className="w-20 h-1 bg-[#335DFF] mx-auto mt-3 rounded-full relative overflow-hidden">
        <span className="absolute inset-y-0 left-0 w-3 h-3 bg-[#FFFF33] rounded-full animate-ping"></span>
      </div>
      <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-lg">
        Benefici concreti che senti nella vita di tutti i giorni.
      </p>
    </div>

    {/* Griglia benefici */}
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {[
        {
          icon: "⚡",
          color: "#335DFF",
          title: "Più Energia",
          desc: "Trasforma la stanchezza in azione con ricariche naturali da 5 minuti."
        },
        {
          icon: "🧠",
          color: "#FFFF33",
          title: "Meno Stress",
          desc: "Stacca la spina e resetta la mente tra un impegno e l'altro."
        },
        {
          icon: "✅",
          color: "#335DFF",
          title: "Zero Sensi di Colpa",
          desc: "Smetti di rimandare. Ogni mini-workout è una promessa mantenuta."
        },
        {
          icon: "💪",
          color: "#FFFF33",
          title: "Più Forte e Mobile",
          desc: "Addio fastidi da scrivania. Sentiti più agile e scattante ogni giorno."
        },
        {
          icon: "❤️",
          color: "#335DFF",
          title: "Più in Salute",
          desc: "Investi nel tuo futuro con la costanza, non con il sacrificio."
        }
      ].map(({ icon, color, title, desc }) => (
        <article
          key={title}
          className="group h-full rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:shadow-[#335DFF]/20 transition-all duration-300 flex flex-col"
        >
          <div className="flex-1 p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center text-lg"
                style={{ backgroundColor: `${color}20` }}
              >
                <span>{icon}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed flex-1">{desc}</p>
          </div>
        </article>
      ))}
    </div>

    {/* CTA sotto benefici */}
    <div className="mt-12 flex justify-center">
      <a
        href="https://play.google.com/store/apps/details?id=pt.app&hl=it"
        className="inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-lg font-semibold shadow-lg transition-transform hover:scale-105"
        style={{ backgroundColor: "#335DFF", color: "white" }}
      >
        Scarica l’app gratis
        <ArrowRight className="h-5 w-5" />
      </a>
    </div>
  </div>
</section>

{/* PROVA SOCIALE – Target: chi ha sempre mollato */}
<section id="social" className="py-20 bg-white">
  <div className="mx-auto max-w-7xl px-4">
    {/* Titolo */}
    <div className="mb-12 text-center">
      <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
        Cosa dicono di <span className="text-[#335DFF]">Hypemove</span>
      </h2>
      <p className="mt-3 text-gray-600 max-w-2xl mx-auto text-lg">
        Persone normali. Storie reali.  
        Tutti con una cosa in comune: <strong>avevano già mollato tante volte</strong>.
      </p>
    </div>

    {/* Griglia testimonianze */}
    <div className="grid gap-8 md:grid-cols-3">
      {[
        {
  name: "Giulia, 34",
  role: "Impiegata",
  text:
    "Ogni volta che saltavo un giorno mi sentivo in colpa e mollavo tutto. Con Hypemove ho smesso di vivere l’allenamento come un fallimento continuo.",
  color: "#335DFF",
},

        {
          name: "Marco, 29",
          role: "Developer",
          text:
            "Il problema non era la voglia, era il metodo. Qui apro l’app, faccio quello che c’è da fare e basta. È la prima volta che riesco a essere costante senza stress.",
          color: "#FFFF33",
        },
        {
          name: "Elena, 41",
          role: "Freelance",
          text:
            "Non amo allenarmi e non credo che lo amerò mai. Ma Hypemove è entrato nella mia giornata senza forzature. Pochi minuti, zero sensi di colpa.",
          color: "#335DFF",
        },
      ].map(({ name, role, text, color }, i) => (
        <article
          key={i}
          className="relative rounded-3xl shadow-md hover:shadow-lg transition-shadow bg-white p-6"
          style={{ borderTop: `4px solid ${color}` }}
        >
          {/* Header */}
          <div className="mb-4">
            <p className="font-semibold text-gray-900 leading-tight">{name}</p>
            <p className="text-xs text-gray-500">{role}</p>
          </div>

          {/* Testo */}
          <p className="text-gray-800 leading-relaxed italic">
            “{text}”
          </p>
        </article>
      ))}
    </div>
  </div>
</section>



{/* CTA finale – Diventa un Hypemover */}
<section
  id="cta-finale"
  className="relative py-20 bg-gradient-to-b from-[#335DFF] to-[#1E3ACC] text-white overflow-hidden"
>
  {/* Effetto decorativo */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,51,0.25),transparent_60%)] pointer-events-none"></div>

  <div className="mx-auto max-w-5xl px-6 relative z-10 text-center">
    {/* Titolo */}
    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
      🚀 Diventa un <span className="text-[#FFFF33]">Hypemover</span>
    </h2>

    {/* Sottotitolo */}
    <p className="mt-4 text-lg sm:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
      Entra nella community che trasforma il movimento in un’abitudine leggera e divertente.
      Bastano pochi minuti al giorno per sentirti più energico, motivato e fiero di te.
    </p>

    {/* Bottone */}
    <div className="mt-8 flex justify-center">
      <a
        href="https://play.google.com/store/apps/details?id=pt.app&hl=it"
        className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-lg shadow-xl transition-all duration-300 ease-out 
        bg-[#FFFF33] text-[#1E3ACC] hover:bg-[#FFEB3B] hover:scale-105"
      >
        <span>📲 Inizia gratis oggi</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 transition-transform group-hover:translate-x-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </a>
    </div>

    
  </div>
</section>


{/* FAQ */}
<section
  id="faq"
  className="py-20 bg-gradient-to-b from-white via-[#FFFF33]/10 to-white"
>
  <div className="mx-auto max-w-5xl px-4">
    {/* Header */}
    <div className="text-center mb-10">
      <span className="inline-block px-4 py-1 rounded-full text-xs font-semibold bg-[#335DFF]/10 text-[#335DFF]">
        Domande frequenti
      </span>
      <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-gray-900">
        Tutto quello che ti chiedi su <span className="text-[#335DFF]">Hypemove</span>
      </h2>
      <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
        Se non trovi una risposta, scrivici: aggiorniamo le FAQ in base ai feedback della community.
      </p>
    </div>

    {/* Lista FAQ */}
    <div className="space-y-3">
      {[
        {
          q: "Come funziona Hypemove?",
          a:
            "Hypemove è un’app che ti aiuta a muoverti ogni giorno con allenamenti brevi, da 30 secondi a 10 minuti. Segui una roadmap guidata, pensata per aiutarti a creare l’abitudine passo dopo passo — senza stress e senza perdere tempo a scegliere. Ogni giorno sblocchi sfide, guadagni punti e porti a termine piccole missioni… dove vuoi, quando vuoi."
        },
        {
          q: "Serve attrezzatura?",
          a:
            "No. Tutto è pensato a corpo libero. "
        },
        {
          q: "È adatta ai principianti?",
          a:
            "Sì. Intensità e durata partono in modo graduale. Puoi aumentare passo dopo passo, secondo il tuo ritmo."
        },
        {
          q: "Quanto tempo mi serve al giorno?",
          a:
            "Bastano pochi minuti: gli allenamenti durano da 30 secondi a 10 minuti e si inseriscono facilmente nella tua giornata, anche quando sei pieno di impegni. Muoversi ogni giorno, anche solo per poco, migliora l’energia, l’umore, la forza e fa bene alla salute — con costanza, i benefici si sentono davvero."
        },
        {
          q: "Devo fare un abbonamento?",
          a:
           "No: puoi iniziare a usare Hypemove gratis, senza abbonamento. I contenuti base sono subito accessibili, senza impegno. Se vorrai, più avanti potrai attivare un piano premium per sbloccare servizi aggiuntivi e funzioni extra."
        },
        {
          q: "Quando sarà disponibile l’app su iOS e Android?",
          a:
            "Stiamo lavorando a pieno ritmo per lanciare l’app il prima possibile! 🚀 Nel frattempo, puoi iscriverti alla lista d’attesa per ricevere l’accesso appena sarà pronta. Ti basta cliccare su uno dei pulsanti “Scarica gratis” o “Inizia gratis” che trovi nella pagina."
        }
      ].map(({ q, a }, idx) => (
        <details
          key={idx}
          className="group border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all p-5"
        >
          <summary className="cursor-pointer list-none flex items-start justify-between gap-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">{q}</h3>
            <span
              aria-hidden="true"
              className="select-none text-xl leading-none transition-transform group-open:rotate-45"
              style={{ color: "#335DFF" }}
            >
              +
            </span>
          </summary>
          <div className="mt-3 text-gray-700 leading-relaxed">
            {a}
          </div>
        </details>
      ))}
    </div>

    {/* CTA sotto FAQ */}
    <div className="mt-10 flex justify-center">
      <a
        href="https://play.google.com/store/apps/details?id=pt.app&hl=it"
        className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-base font-semibold shadow-lg transition-transform hover:scale-105"
        style={{ backgroundColor: "#335DFF", color: "white" }}
      >
        Prova hypemove gratis
        <ArrowRight className="h-5 w-5" />
      </a>
    </div>
  </div>

  {/* Micro-styles inline per accessibilità */}
  <style jsx>{`
    details[open] {
      border-color: #335DFF;
      box-shadow: 0 8px 28px rgba(51, 93, 255, 0.12);
    }
    details:focus-within {
      outline: 2px solid #FFFF33;
      outline-offset: 2px;
      border-radius: 1rem;
    }
  `}</style>

  {/* JSON-LD SEO markup */}
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Come funziona Hypemove?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Scegli un micro‑workout da 30 secondi a 10 minuti per ricaricare energia e focus. Sfide e ricompense ti aiutano a restare costante senza stress."
            }
          },
          {
            "@type": "Question",
            "name": "Serve attrezzatura?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No, gli esercizi sono a corpo libero. Se vuoi, puoi abilitare elastici o manubri e l’app adatta i contenuti."
            }
          },
          {
            "@type": "Question",
            "name": "È adatta ai principianti?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Sì. Durata e intensità sono graduali e personalizzabili, ideali per chi ricomincia."
            }
          },
          {
            "@type": "Question",
            "name": "Quanto tempo mi serve al giorno?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Bastano anche 1–3 minuti. L’obiettivo è ridurre la frizione e creare una routine sostenibile."
            }
          },
          {
            "@type": "Question",
            "name": "Devo fare un abbonamento?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Durante l’MVP l’accesso è gratuito. In futuro potrebbero esserci opzioni premium; la base resterà accessibile."
            }
          },
          {
            "@type": "Question",
            "name": "Quando sarà disponibile su iOS e Android?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Stiamo lavorando a pieno ritmo per lanciare l’app il prima possibile! 🚀 Nel frattempo, puoi iscriverti alla lista d’attesa per ricevere l’accesso appena sarà pronta. Ti basta cliccare su uno dei pulsanti “Scarica gratis” o “Inizia gratis” che trovi nella pagina."
            }
          },
         
        ]
      })
    }}
  />
</section>







    

<footer id="footer" className="border-t bg-gray-900 text-gray-300">
  <div className="mx-auto max-w-6xl px-4 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 text-sm">
    
    {/* Brand */}
    <div>
      <div className="flex items-center gap-3 mb-3">
        <img src="/images/logo1.png" alt="Hypemove logo" className="h-8 w-8 rounded-xl" />
        <span className="font-semibold text-white">Hypemove</span>
      </div>
      <p className="text-gray-400 leading-relaxed">
        Micro-allenamenti per energia e focus, anche nei giorni più pieni.
      </p>
    </div>

    {/* Navigazione */}
    <nav>
      <h4 className="font-semibold text-white mb-3">Scopri</h4>
      <ul className="space-y-2">
        <li><a href="#top" className="hover:text-white transition">Inizio</a></li>
        <li><a href="#problema" className="hover:text-white transition">Problema & Soluzione</a></li>
        <li><a href="#benefici" className="hover:text-white transition">Benefici</a></li>
        <li><a href="#social" className="hover:text-white transition">Testimonianze</a></li>
      </ul>
    </nav>

    {/* Supporto */}
    <div>
      <h4 className="font-semibold text-white mb-3">Supporto</h4>
      <ul className="space-y-2">
        <li><a href="#" className="hover:text-white transition">Contattaci</a></li>
        <li><a href="#faq" className="hover:text-white transition">FAQ</a></li>
        <li><a href="/legal/privacy.html" className="hover:text-white transition">Privacy e Termini d’Uso</a></li>
        <li><a href="/legal/marketing.html" className="hover:text-white transition">Informativa Marketing</a></li>
      </ul>
    </div>

    {/* Call to action */}
    <div>
      <h4 className="font-semibold text-white mb-3">Scarica l’app</h4>
      <a
        href="https://play.google.com/store/apps/details?id=pt.app&hl=it"
        className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-medium shadow-md hover:shadow-lg transition bg-white text-gray-900"
      >
        <Download className="h-5 w-5" /> Inizia gratis
      </a>
      <p className="text-xs text-gray-500 mt-3">
        Disponibile presto su iOS e Android.
      </p>
    </div>
  </div>

  <div className="mx-auto max-w-6xl px-4 pb-8 text-xs text-gray-500 text-center">
    © {new Date().getFullYear()} Hypemove. Tutti i diritti riservati.
  </div>
</footer>
    </div>
  );
}

