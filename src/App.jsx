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

    {/* Menu Desktop */}
    <nav className="hidden lg:flex items-center gap-8 text-base font-medium">
  <a href="#target" className="hover:text-gray-800">Per chi è</a>
  <a href="#soluzione" className="hover:text-gray-800">Soluzione</a>
  <a href="#effetto-immediato" className="hover:text-gray-800">Effetto immediato</a>
  <a href="#benefici" className="hover:text-gray-800">Benefici</a>
  <a href="#social" className="hover:text-gray-800">Testimonianze</a>
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
  <nav className="space-y-4">
    <a href="#target" className="block text-lg font-medium text-gray-800 hover:text-[#335DFF] transition-colors">Per chi è</a>
    <a href="#soluzione" className="block text-lg font-medium text-gray-800 hover:text-[#335DFF] transition-colors">Soluzione</a>
    <a href="#effetto-immediato" className="block text-lg font-medium text-gray-800 hover:text-[#335DFF] transition-colors">Effetto immediato</a>
    <a href="#benefici" className="block text-lg font-medium text-gray-800 hover:text-[#335DFF] transition-colors">Benefici</a>
    <a href="#social" className="block text-lg font-medium text-gray-800 hover:text-[#335DFF] transition-colors">Testimonianze</a>
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
        Ti senti spesso{" "}
        <span 
          className="underline decoration-wavy" 
          style={{ textDecorationColor: ACCENT }}
        >
          stanco
        </span>{" "}
        e poco energico?
      </h1>
      <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto lg:mx-0">
        La giornata vola e ti ritrovi la sera senza aver fatto davvero qualcosa per te?
      </p>
      <p className="text-base sm:text-lg">
        <strong>Ora che sei qui,</strong>{" "}
        <span className="font-medium">Prova Hypemove</span> e regala al tuo corpo e alla tua mente la ricarica che merita.
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
        <a 
          href="#benefici" 
          className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-base font-semibold border transition-colors hover:bg-gray-100"
          style={{ borderColor: PRIMARY }}
        >
          Vedi i benefici
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



{/* Sezione – Per chi è Hypemove */}
<section id="target" className="relative py-20 bg-white overflow-hidden">
  {/* Punto luce blu */}
  <div className="absolute top-0 left-0 w-full h-[500px] sm:h-[600px] pointer-events-none"
  style={{
    background: "linear-gradient(to bottom, rgba(51, 93, 255, 0.08) 0%, white 100%)"}} />

  <div className="mx-auto max-w-6xl px-4 relative z-10">
    {/* Titolo */}
    <div className="mb-16 text-center">
      <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
        Hai la stoffa da <span className="text-[#335DFF]">Hypemover</span>?
      </h2>
      <p className="mt-4 text-gray-600 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto">
        Trasforma il movimento in un’abitudine naturale, in pochi minuti e senza stress.
      </p>
      <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-[#335DFF]" />
    </div>

    {/* Blocchi target */}
    <div className="space-y-14">
      {/* 1. Studente / Professionista */}
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="flex-shrink-0 bg-[#335DFF]/10 text-[#335DFF] w-20 h-20 flex items-center justify-center rounded-2xl text-4xl shadow-inner">
          🎓
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
            Sei uno studente o un professionista sotto pressione?
          </h3>
          <p className="text-gray-700 mt-3 text-base sm:text-lg leading-relaxed">
            Bastano <strong>1–10 minuti</strong> per liberare la mente e ritrovare la concentrazione.
          </p>
          <ul className="mt-5 space-y-2 text-sm sm:text-base text-gray-700">
            <li>💡 <span className="font-medium">Micro-pause guidate</span> per ricaricare le energie</li>
            <li>🎯 <span className="font-medium">Focus immediato</span></li>
            <li>⏱ <span className="font-medium">Routine flessibili</span> che si adattano al tuo tempo</li>
          </ul>
        </div>
      </div>

      {/* 2. Genitore sempre di corsa */}
      <div className="flex flex-col md:flex-row-reverse items-center gap-8">
        <div className="flex-shrink-0 bg-[#FFFF33]/20 text-[#335DFF] w-20 h-20 flex items-center justify-center rounded-2xl text-4xl shadow-inner">
          👨‍👩‍👧
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
            Sei un genitore sempre di corsa?
          </h3>
          <p className="text-gray-700 mt-3 text-base sm:text-lg leading-relaxed">
            Tra un impegno e l’altro, puoi prenderti un momento per te senza stress.
          </p>
          <ul className="mt-5 space-y-2 text-sm sm:text-base text-gray-700">
            <li>⚡ <span className="font-medium">Allenamenti rapidi</span>, zero attrezzi</li>
            <li>🌟 <span className="font-medium">Benefici immediati</span></li>
            <li>💪 <span className="font-medium">Energia extra</span> per il resto della giornata</li>
          </ul>
        </div>
      </div>

      {/* 3. Non ami allenarti */}
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="flex-shrink-0 bg-[#335DFF]/10 text-[#335DFF] w-20 h-20 flex items-center justify-center rounded-2xl text-4xl shadow-inner">
          🎮
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
            Non ami allenarti ma vuoi stare bene?
          </h3>
          <p className="text-gray-700 mt-3 text-base sm:text-lg leading-relaxed">
            Nessuna pressione, solo piccoli progressi e tanto gioco.
          </p>
          <ul className="mt-5 space-y-2 text-sm sm:text-base text-gray-700">
            <li>🏆 <span className="font-medium">Sfide e ricompense</span> che ti motivano</li>
            <li>🎯 <span className="font-medium">Obiettivi realistici</span></li>
            <li>💖 <span className="font-medium">Costanza</span> senza fatica</li>
          </ul>
        </div>
      </div>
    </div>

    {/* CTA */}
    <div className="mt-16 flex justify-center">
      <a
        href="https://play.google.com/store/apps/details?id=pt.app&hl=it"
        className="inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-lg font-semibold shadow-lg transition-transform hover:scale-105"
        style={{ backgroundColor: "#335DFF", color: "white" }}
      >
        📲 Scarica Hypemove gratis e inizia oggi stesso
      </a>
    </div>
  </div>
</section>






{/* Sezione Soluzione + Benefici brandizzati */}
<section
  id="soluzione"
  className="relative py-20 overflow-hidden"
  style={{
    background: "linear-gradient(to bottom, rgba(255, 255, 51, 0.15) 0%, white 100%)"
  }}
>
  {/* Elementi decorativi */}
  <div className="absolute top-8 left-10 w-20 h-20 rounded-full bg-[#335DFF]/10 blur-xl"></div>
  <div className="absolute bottom-8 right-10 w-24 h-24 rounded-full bg-[#FFFF33]/20 blur-xl"></div>

  <div className="mx-auto max-w-6xl px-4 grid lg:grid-cols-2 gap-12 items-start relative z-10">
    {/* SOLUZIONE */}
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-2xl p-6 border border-gray-100 relative">
        <span
          className="absolute -top-3 left-6 px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full text-white"
          style={{ backgroundColor: "#335DFF" }}
        >
          Soluzione
        </span>

        <h3 className="text-3xl sm:text-4xl font-extrabold mb-3">
          Quando l’energia crolla… <span style={{ color: "#335DFF" }}>riparti in pochi minuti</span>
        </h3>

        <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
          Succede a tutti: la testa si svuota, le energie si spengono e la giornata sembra infinita.  
          La maggior parte stringe i denti e va avanti.  
          Tu puoi fare di meglio: <span className="font-semibold">premi play su Hypemove e in pochi minuti torni in carreggiata</span>.
        </p>

        <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
          Micro-allenamenti veloci, pensati per dare al corpo e alla mente lo stimolo giusto per ripartire, con un tocco di gioco che rende tutto più leggero.
        </p>

        <ul className="mt-5 space-y-4">
          <li className="flex items-start gap-3">
            <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" style={{ color: "#335DFF" }} />
            <p className="text-gray-800">
              <strong>Ricarica immediata</strong> – 1–10 minuti per svegliare corpo e mente.
            </p>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" style={{ color: "#FFFF33" }} />
            <p className="text-gray-800">
              <strong>Su misura per te</strong> – Scegli il tuo obiettivo e segui un percorso flessibile.
            </p>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" style={{ color: "#335DFF" }} />
            <p className="text-gray-800">
              <strong>Motivazione costante</strong> – Sfide e premi che ti fanno venire voglia di continuare.
            </p>
          </li>
        </ul>

        {/* CTA */}
        <div className="mt-6">
          <a
            href="https://play.google.com/store/apps/details?id=pt.app&hl=it"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-white shadow-md hover:scale-105 transition-transform"
            style={{ backgroundColor: "#335DFF" }}
          >
            Inizia ora: è gratis
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>

      {/* Immagine soluzione */}
      <figure
        className="w-full max-w-xl mx-auto lg:mx-0 rounded-2xl border-4 border-[#335DFF]/30 shadow-xl overflow-hidden"
        style={{ aspectRatio: "4 / 3" }}
      >
        <img
          src="/images/1.1.png"
          alt="Mascotte di Hypemove in azione pronta a supportarti durante il tuo percorso: micro-allenamenti, snack workout e progressi"
          className="w-full h-full object-contain"
          loading="lazy"
          sizes="(max-width:1024px) 100vw, 48vw"
        />
      </figure>
    </motion.div>
  </div>
</section>



{/* SEZIONE EFFETTO IMMEDIATO */}
<section id="effetto-immediato" className="relative isolate py-24 bg-white">
  {/* Sfondo luminoso blu */}
  <div className="absolute inset-0 -z-10 overflow-hidden">
    <div
      className="absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full blur-3xl opacity-20"
      style={{ background: "radial-gradient(closest-side, #335DFF44, transparent)" }}
    />
  </div>

  <div className="mx-auto max-w-6xl px-4">
    {/* Titolo e descrizione */}
    <div className="text-center mb-14">
      <span className="inline-block px-4 py-1 rounded-full text-xs font-semibold bg-[#335DFF]/10 text-[#335DFF]">
        ★ Effetto immediato
      </span>
      <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-gray-900">
        Dalla stanchezza al <span className="text-[#335DFF]">“ci sono”</span> in pochi minuti
      </h2>
      <p className="mt-3 text-gray-600 max-w-2xl mx-auto text-lg">
        Bastano pochi minuti per riaccendere corpo e mente.<br />Più energia, più concentrazione, più te.
      </p>
    </div>

    {/* Grafico animato */}
<div className="relative w-full max-w-4xl mx-auto mb-14">
  <svg viewBox="0 0 500 200" className="w-full h-auto">
    <defs>
      <linearGradient id="ondaBlue" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#335DFF" />
        <stop offset="100%" stopColor="#335DFF" />
      </linearGradient>
    </defs>

    {/* Onda con lieve movimento */}
    <path
      d="M 0 150 Q 125 80, 250 120 T 500 40"
      fill="none"
      stroke="url(#ondaBlue)"
      strokeWidth="8"
      strokeLinecap="round"
    >
      <animate
        attributeName="d"
        dur="4s"
        repeatCount="indefinite"
        values="
          M 0 150 Q 125 80, 250 120 T 500 40;
          M 0 145 Q 125 85, 250 115 T 500 45;
          M 0 150 Q 125 80, 250 120 T 500 40"
      />
    </path>

    {/* Pallino che scorre lungo la curva */}
    <circle r="8" fill="#335DFF">
      <animateMotion
        dur="6s"
        repeatCount="indefinite"
        rotate="auto"
        path="M 0 150 Q 125 80, 250 120 T 500 40"
      />
    </circle>
  </svg>
</div>


    {/* Benefici */}
    <div className="grid gap-6 sm:grid-cols-3">
      <div className="p-6 rounded-2xl border border-gray-100 shadow-sm bg-white hover:shadow-md transition">
        <div className="text-4xl mb-3">🫁</div>
        <h3 className="text-lg font-semibold text-gray-900">Dopo 1 minuto</h3>
        <p className="text-gray-600 mt-1">
          Respiro più profondo, corpo che si scioglie, mente più leggera.
        </p>
      </div>
      <div className="p-6 rounded-2xl border border-gray-100 shadow-sm bg-white hover:shadow-md transition">
        <div className="text-4xl mb-3">⚡</div>
        <h3 className="text-lg font-semibold text-gray-900">Dopo 3 minuti</h3>
        <p className="text-gray-600 mt-1">
          Energia che sale, lucidità che ritorna, motivazione che cresce.
        </p>
      </div>
      <div className="p-6 rounded-2xl border border-gray-100 shadow-sm bg-white hover:shadow-md transition">
        <div className="text-4xl mb-3">🎯</div>
        <h3 className="text-lg font-semibold text-gray-900">Dopo 5–10 minuti</h3>
        <p className="text-gray-600 mt-1">
          Focus stabile, umore alto, la sensazione di “ok, adesso ci sono”.
        </p>
      </div>
    </div>
  </div>
</section>









{/* BENEFICI */}
<section id="benefici" className="py-20 bg-gradient-to-b from-[#FFFF33]/10 via-white to-[#335DFF]/5">
  <div className="mx-auto max-w-7xl px-4">
    {/* Titolo */}
    <div className="mb-12 text-center relative">
      <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
        Benefici chiave
      </h2>
      <div className="w-20 h-1 bg-[#335DFF] mx-auto mt-3 rounded-full relative overflow-hidden">
        <span className="absolute inset-y-0 left-0 w-3 h-3 bg-[#FFFF33] rounded-full animate-ping"></span>
      </div>
      <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-lg">
        Piccole azioni quotidiane per grandi risultati:  
        ecco cosa ottieni con <span className="font-semibold text-[#335DFF]">Hypemove</span>.
      </p>
    </div>

    {/* Griglia benefici */}
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {[
        { icon: Zap, color: "#335DFF", title: "Più energia in pochi minuti", desc: "Una spinta immediata quando serve. In pochi minuti ricarichi corpo e mente, e torni a fare quello che ami.", img: "/images/1.4.png" },
        { icon: Sparkles, color: "#FFFF33", title: "Focus e produttività", desc: "Niente più testa annebbiata: riaccendi la concentrazione e concludi la giornata con soddisfazione.", img: "/images/1.5.png" },
        { icon: Trophy, color: "#335DFF", title: "Costanza senza stress", desc: "Piccole azioni quotidiane per risultati concreti, senza sentirti sotto pressione.", img: "/images/1.6.png" },
      ].map(({ icon: Icon, color, title, desc, img }) => (
        <article
          key={title}
          className="group h-full rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:shadow-[#335DFF]/20 transition-all duration-300 flex flex-col"
        >
          {/* Immagine */}
          <figure className="relative overflow-hidden rounded-t-2xl border-b-4" style={{ borderColor: color }}>
            <img
              src={img}
              alt={title}
              className="w-full h-48 object-contain transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </figure>

          {/* Contenuto */}
          <div className="flex-1 p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed flex-1">{desc}</p>
          </div>
        </article>
      ))}
    </div>
  </div>
</section>



{/* Prova Sociale – variante premium minimal */}
<section id="social" className="py-20 bg-white">
  <div className="mx-auto max-w-7xl px-4">
    {/* Titolo */}
    <div className="mb-12 text-center">
      <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
        Cosa dicono di <span className="text-[#335DFF]">Hypemove</span>
      </h2>
      <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
        Storie vere di chi ha già trasformato le proprie giornate grazie a micro-allenamenti.
      </p>
    </div>

    {/* Griglia testimonianze */}
    <div className="grid gap-8 md:grid-cols-3">
      {[
        {
          img: "/images/1.1.png",
          name: "Giulia, 34",
          role: "Impiegata",
          text: "Quando mi cala l’energia, 3 minuti con Hypemove e riparto. È diventato il mio reset mentale.",
          color: "#335DFF"
        },
        {
          img: "/images/1.1.png",
          name: "Marco, 29",
          role: "Developer",
          text: "Finalmente costanza senza stress. Allenamenti veloci tra una call e l’altra: funziona davvero.",
          color: "#FFFF33"
        },
        {
          img: "/images/1.1.png",
          name: "Elena, 41",
          role: "Freelance",
          text: "In pochi minuti cambia il mio umore: più leggera, più lucida e pronta a finire la giornata bene.",
          color: "#335DFF"
        },
      ].map(({ img, name, role, text, color }, i) => (
        <article
          key={i}
          className="relative rounded-3xl shadow-md hover:shadow-lg transition-shadow bg-white p-6"
          style={{ borderTop: `4px solid ${color}` }}
        >
          {/* Header utente */}
          <div className="flex items-center gap-4 mb-4">
            <img
              src={img}
              alt={name}
              className="w-14 h-14 rounded-full object-cover ring-2"
              style={{ ringColor: color }}
            />
            <div>
              <p className="font-semibold text-gray-900 leading-tight">{name}</p>
              <p className="text-xs text-gray-500">{role}</p>
              {/* Stelle minimal */}
              <div className="flex items-center gap-0.5 mt-1">
                {[...Array(5)].map((_, idx) => (
                  <svg
                    key={idx}
                    viewBox="0 0 24 24"
                    className="w-4 h-4"
                    style={{ fill: "url(#grad-star)" }}
                  >
                    <defs>
                      <linearGradient id="grad-star" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#FFD700" }} />
                        <stop offset="100%" style={{ stopColor: "#FFC107" }} />
                      </linearGradient>
                    </defs>
                    <path d="M12 .7l3.4 6.9 7.6 1.1-5.5 5.3 1.3 7.4L12 18.8 5.2 21.4l1.3-7.4L1 8.7l7.6-1.1L12 .7z" />
                  </svg>
                ))}
              </div>
            </div>
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

