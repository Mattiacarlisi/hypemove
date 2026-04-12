import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls, useScroll, useSpring, useTransform } from "framer-motion";
import {
  Apple,
  ArrowRight,
  Download,
  Flame,
  Menu,
  PlayCircle,
  Sparkles,
  Star,
  Timer,
  Trophy,
  Waves,
  X,
} from "lucide-react";

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=pt.app&hl=it";
const PRIVACY_URL = "/legal/privacy.html";
const MARKETING_URL = "/legal/marketing.html";
const IOS_WAITLIST_URL = "#download";

// Link del menu in alto.
const navLinks = [
  { label: "Obiettivi", href: "#goals" },
  { label: "Metodo", href: "#story" },
  { label: "Benefici", href: "#benefits" },
  { label: "Recensioni", href: "#proof" },
  { label: "FAQ", href: "#faq" },
];

// Card della sezione obiettivi.
const goals = [
  {
    title: "Dimagrimento",
    desc: "Per chi vuole rimettersi in moto con qualcosa di sostenibile, concreto e più facile da mantenere nel tempo.",
    icon: Flame,
  },
  {
    title: "Tonificazione",
    desc: "Per chi vuole sentirsi più tonico, vedere un cambiamento sul corpo e non perdere settimane a ricominciare da zero.",
    icon: Trophy,
  },
  {
    title: "Mobility & Stretching",
    desc: "Per chi vuole sentirsi meno rigido, muoversi meglio e stare meglio anche dopo giornate sedentarie.",
    icon: Waves,
  },
];

// Step della sezione "Metodo".
const storySteps = [
  {
    number: "01",
    title: "Parti da un piano che senti più tuo",
    text: "Non apri l'app e ti senti perso. Parti da un obiettivo chiaro, con una direzione più coerente con quello che vuoi davvero ottenere.",
    icon: Sparkles,
  },
  {
    number: "02",
    title: "Riduci il blocco mentale prima di iniziare",
    text: "Workout brevi, struttura guidata, meno decisioni inutili. Così è molto più facile smettere di rimandare e iniziare davvero oggi.",
    icon: Timer,
  },
  {
    number: "03",
    title: "Hai più voglia di tornare domani",
    text: "Progressi, reward e coinvolgimento rendono il percorso più vivo e più gratificante. Non solo inizi. Ti viene più naturale continuare.",
    icon: PlayCircle,
  },
];

// Card della sezione benefici.
const benefits = [
  {
    title: "Più facile iniziare",
    desc: "Anche nelle giornate storte la soglia mentale è più bassa. E quando partire è più facile, rimandare diventa meno automatico.",
  },
  {
    title: "Più costanza reale",
    desc: "Non punta sulla perfezione. Punta a farti restare in movimento più spesso, con qualcosa che riesci davvero a ripetere.",
  },
  {
    title: "Meno sensi di colpa",
    desc: "Ti fa sentire capace e in controllo, invece di ricordarti tutto quello che non hai fatto nelle settimane passate.",
  },
  {
    title: "Più compatibile con la vita vera",
    desc: "Da casa, senza caos e senza organizzazioni infinite. Così il movimento entra meglio nella tua giornata reale.",
  },
];

// Testimonianze della sezione recensioni.
const testimonials = [
  {
    quote:
      "La differenza è che qui non mi sento già in ritardo prima ancora di iniziare. Mi sembra finalmente una cosa fattibile, non l'ennesima promessa che durerà due giorni.",
    name: "Giulia, 34",
    role: "Giornate piene, poca energia mentale",
  },
  {
    quote:
      "Apro l'app e non devo pensare. Questo da solo cambia tantissimo. È molto più facile restare costante quando non devi ogni volta convincerti da capo.",
    name: "Marco, 29",
    role: "Ha già mollato tante volte",
  },
  {
    quote:
      "Non mi serve il workout perfetto. Mi serve un sistema che entri davvero nella mia vita. Hypemove mi dà questa sensazione in modo molto più naturale.",
    name: "Elena, 41",
    role: "Vuole stare meglio senza rigidità",
  },
];

// Pulsanti CTA riutilizzati in piu punti della pagina.
function CTAButtons({ center = false }) {
  return (
    <div className={`flex flex-col gap-3 sm:flex-row ${center ? "justify-center" : ""}`}>
      <a
        href={PLAY_STORE_URL}
        className="group inline-flex min-h-[56px] items-center justify-center rounded-full bg-black px-6 py-4 text-base font-semibold text-white transition hover:-translate-y-0.5 sm:px-7"
      >
        <Download className="mr-2 h-4 w-4" />
        Scarica gratis per Android
        <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
      </a>
      <a
        href={IOS_WAITLIST_URL}
        className="group inline-flex min-h-[56px] items-center justify-center rounded-full border border-black/10 bg-white px-6 py-4 text-base font-semibold text-black transition hover:-translate-y-0.5 hover:border-black/20 sm:px-7"
      >
        <Apple className="mr-2 h-4 w-4" />
        iPhone in arrivo
      </a>
    </div>
  );
}

// Etichetta piccola sopra i titoli di sezione.
function Kicker({ children, dark = false }) {
  return (
    <div
      className={`inline-flex items-center rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm ${
        dark ? "border-white/10 bg-white/10 text-white/70" : "border-black/10 bg-white text-black/70"
      }`}
    >
      {children}
    </div>
  );
}

// Titolo standard delle sezioni.
function SectionTitle({
  eyebrow,
  title,
  subtitle,
  dark = false,
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <Kicker dark={dark}>{eyebrow}</Kicker>
      <h2 className={`mt-5 text-3xl font-black tracking-[-0.05em] sm:text-5xl xl:text-6xl ${dark ? "text-white" : "text-black"}`}>
        {title}
      </h2>
      {subtitle ? (
        <p className={`mt-5 text-base leading-7 sm:text-lg sm:leading-8 ${dark ? "text-white/70" : "text-black/60"}`}>{subtitle}</p>
      ) : null}
    </div>
  );
}

// Mini logo usato in header, hero e footer.
function LogoMark({ className = "" }) {
  return (
    <div className={`flex items-center justify-center rounded-2xl bg-black text-white shadow-[0_12px_30px_rgba(0,0,0,0.12)] ${className}`}>
      <span className="text-lg font-black tracking-[-0.06em]">H</span>
    </div>
  );
}

function HeroPreview() {
  const previewImages = [
    "/images/roadmap.png",
    "/images/WorkoutDetails.png",
    "/images/Search.png",
  ];
  const [activePreview, setActivePreview] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [rotationBase, setRotationBase] = useState(0);
  const controls = useAnimationControls();

  useEffect(() => {
    controls.set({
      opacity: 1,
      y: 0,
      scale: 1,
      rotateY: rotationBase,
      rotateZ: 0,
    });
  }, [controls, rotationBase]);

  useEffect(() => {
    if (isFlipping) return undefined;

    const timer = window.setTimeout(async () => {
      const targetPreview = (activePreview + 1) % previewImages.length;
      setIsFlipping(true);

      await controls.start({
        opacity: 1,
        y: 0,
        scale: 1,
        rotateY: rotationBase + 180,
        rotateZ: -4,
        transition: { duration: 1.35, ease: [0.22, 1, 0.36, 1] },
      });

      setActivePreview(targetPreview);
      await new Promise((resolve) => window.requestAnimationFrame(resolve));

      await controls.start({
        opacity: 1,
        y: 0,
        scale: 1,
        rotateY: rotationBase + 360,
        rotateZ: 0,
        transition: { duration: 1.35, ease: [0.22, 1, 0.36, 1] },
      });

      setRotationBase((current) => current + 360);
      setIsFlipping(false);
    }, 4000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [activePreview, controls, isFlipping, previewImages.length, rotationBase]);

  return (
    <div
      className="relative mx-auto w-full max-w-[176px] sm:max-w-[204px] lg:max-w-[216px] xl:max-w-[232px]"
      style={{ perspective: "1400px" }}
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FB8B04]/12 blur-3xl sm:block sm:h-[280px] sm:w-[280px]" />

      {/* La preview ruota come una card: dietro c'e il logo Hypemove, poi torna sul fronte con una nuova schermata */}
      <motion.div
        initial={false}
        animate={controls}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="hero-flip relative z-10 aspect-[9/19]"
        style={{ transformOrigin: "center center", transformStyle: "preserve-3d" }}
      >
        <div className="hero-flip-face hero-flip-front absolute inset-0">
          <img
            src={previewImages[activePreview]}
            alt="Anteprima dell'app Hypemove"
            className="mx-auto h-full w-full object-contain drop-shadow-[0_14px_28px_rgba(15,23,42,0.10)]"
          />
        </div>

        <div
          className="hero-flip-face hero-flip-back absolute inset-0 flex items-center justify-center rounded-[28px] bg-black text-white shadow-[0_30px_60px_rgba(0,0,0,0.18)] sm:rounded-[32px]"
        >
          <div className="text-center">
            <div className="text-2xl font-black tracking-[-0.08em] sm:text-3xl">H</div>
            <div className="mt-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/70 sm:text-sm">
              Hypemove
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
}

// Hero principale della landing page.
function DynamicHero() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const titleY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const smoothTitleY = useSpring(titleY, { stiffness: 90, damping: 20 });

  return (
    <section ref={heroRef} className="relative overflow-hidden px-4 pb-8 pt-5 sm:px-6 sm:pb-10 sm:pt-7 lg:px-8 lg:pb-6 lg:pt-4">
      <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(0,0,0,0.9)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.9)_1px,transparent_1px)] [background-size:42px_42px] sm:[background-size:56px_56px]" />
      <div className="pointer-events-none absolute right-[-14%] top-[4%] h-[220px] w-[220px] rounded-full bg-[#FB8B04]/10 blur-3xl sm:right-[-8%] sm:h-[300px] sm:w-[300px] lg:h-[360px] lg:w-[360px]" />

      <div className="mx-auto grid max-w-7xl items-center gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)] lg:gap-6">
        <motion.div style={{ y: smoothTitleY }} className="relative z-10">
          <div className="space-y-1">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="overflow-hidden"
            >
              <div className="max-w-[820px] text-[2.35rem] font-black leading-[0.9] tracking-[-0.07em] text-black sm:text-6xl lg:text-[2.75rem] xl:text-[3.15rem]">
                Allenarti non deve più
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="overflow-hidden"
            >
              <div className="max-w-[820px] text-[2.35rem] font-black leading-[0.9] tracking-[-0.07em] text-black sm:text-6xl lg:text-[2.75rem] xl:text-[3.15rem]">
                sembrare una cosa troppo grande
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="overflow-hidden"
            >
              <div className="max-w-[760px] text-[2.35rem] font-black leading-[0.92] tracking-[-0.07em] text-[#FB8B04] sm:text-6xl lg:text-[3.2rem] xl:text-[3.55rem]">
                per la tua vita.
              </div>
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18 }}
            className="mt-2 max-w-[620px] text-base leading-7 text-black/65 sm:mt-3 sm:text-lg sm:leading-8 xl:text-[1rem]"
          >
            Hypemove ti aiuta a trovare un percorso più adatto al tuo obiettivo e trasforma il movimento in qualcosa che riesci davvero a iniziare, ripetere e mantenere senza sentirti ogni volta in ritardo.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.24 }}
            className="mt-4"
          >
            <CTAButtons />
          </motion.div>
        </motion.div>

        <div className="relative z-10">
          <HeroPreview />
        </div>
      </div>
    </section>
  );
}


// Fascia testuale che scorre in automatico.
function AutoScrollStatement() {
  const items = [
    "Programmi personalizzati",
    "Allenati dove vuoi",
    "Raggiungi il tuo obiettivo con più semplicità",
    "Sfida i tuoi amici",
    "Workout brevi ma efficaci",
  ];
  const loopItems = [...items, ...items];

  return (
    <section className="overflow-hidden border-y border-black/10 bg-white py-4 sm:py-5">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 32, ease: "linear", repeat: Infinity }}
        className="flex w-max whitespace-nowrap"
      >
        {loopItems.map((item, index) => (
          <React.Fragment key={`${item}-${index}`}>
            <span className="px-3 text-sm font-black uppercase tracking-[0.22em] text-black/75 sm:px-4 sm:text-xl lg:text-2xl">
              {item}
            </span>
            <span className="px-3 text-sm font-black uppercase tracking-[0.22em] text-[#FB8B04] sm:px-4 sm:text-xl lg:text-2xl">
              •
            </span>
          </React.Fragment>
        ))}
      </motion.div>
    </section>
  );
}

// Sezione con i percorsi/obiettivi scorrevli orizzontalmente.
function HorizontalGoals() {
  const ref = useRef(null);
  const carouselRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["6%", "-10%"]);
  const smoothX = useSpring(x, { stiffness: 90, damping: 20 });

  const scrollByAmount = (direction) => {
    const el = carouselRef.current;
    if (!el) return;
    const amount = Math.min(340, el.clientWidth * 0.9);
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section id="goals" ref={ref} className="overflow-hidden px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          eyebrow="Obiettivi"
          title="Trova il percorso più adatto a quello che vuoi davvero ottenere"
          subtitle="Scorri tra gli obiettivi e guarda quale senti più vicino a te. Hypemove parte da qui: da un piano che abbia più senso per la tua vita reale."
        />

        <div className="mt-8 flex flex-col gap-4 sm:mt-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl text-sm leading-6 text-black/55 sm:text-base sm:leading-7">
            Dimagrimento, tonificazione o mobility: qui non parti da qualcosa di generico. Parti da una direzione che senti più tua.
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-black/35">Scorri</div>
            <button
              type="button"
              onClick={() => scrollByAmount("left")}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-black transition hover:-translate-y-0.5 hover:border-black/20"
              aria-label="Scorri obiettivi a sinistra"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => scrollByAmount("right")}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-black transition hover:-translate-y-0.5 hover:border-black/20"
              aria-label="Scorri obiettivi a destra"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative mt-10 sm:mt-12">
        <motion.div
          style={{ x: smoothX }}
          className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-24 bg-gradient-to-r from-[#FDFDFD] to-transparent lg:block"
        />
        <motion.div
          style={{ x: smoothX }}
          className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-24 bg-gradient-to-l from-[#FDFDFD] to-transparent lg:block"
        />

        <div
          ref={carouselRef}
          className="no-scrollbar overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [-ms-overflow-style:none]"
        >
          <motion.div
            style={{ x: smoothX }}
            className="flex w-max gap-4 pr-4 sm:gap-5 lg:pr-8 lg:pl-[max(2rem,calc((100vw-80rem)/2))]"
          >
            {goals.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                  whileHover={{ y: -8, rotate: index % 2 === 0 ? -1 : 1 }}
                  className="group relative w-[260px] shrink-0 snap-start overflow-hidden rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_24px_60px_rgba(0,0,0,0.06)] sm:w-[300px] sm:rounded-[32px] sm:p-6 lg:w-[320px] lg:rounded-[34px]"
                >
                  <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#FB8B04]/10 blur-2xl transition group-hover:bg-[#FB8B04]/18" />
                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white sm:h-14 sm:w-14">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <h3 className="mt-4 text-xl font-black tracking-[-0.03em] text-black sm:mt-5 sm:text-2xl">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-black/65 sm:text-base sm:leading-7">{item.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        
      </div>
    </section>
  );
}

// Singola card dentro la sezione "Metodo".
function StoryCard({ step, index }) {
  const Icon = step.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      whileHover={{ y: -6 }}
      className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:rounded-[36px] sm:p-7"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-black sm:h-14 sm:w-14">
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <div className="text-xs font-bold tracking-[0.24em] text-[#FB8B04] sm:text-sm">{step.number}</div>
            <h4 className="mt-2 text-xl font-black tracking-[-0.03em] text-white sm:text-2xl">{step.title}</h4>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/65 sm:text-base sm:leading-7">{step.text}</p>
          </div>
        </div>
        <div className="w-fit rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-white/45 sm:text-sm">
          Hypemove system
        </div>
      </div>
    </motion.div>
  );
}

// Sezione che spiega il metodo Hypemove.
function StickyStory() {
  return (
    <section id="story" className="bg-black px-4 py-20 text-white sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          dark
          eyebrow="Metodo"
          title="Un modo più semplice per iniziare. Un motivo in più per continuare."
          subtitle="Hypemove ti accompagna con un percorso chiaro, più leggero da seguire e più facile da portare avanti nella vita reale."
        />

        <div className="mt-14 grid gap-8 lg:mt-16 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <Kicker dark>Hypemove system</Kicker>
            <h3 className="mt-5 text-3xl font-black tracking-[-0.05em] text-white sm:text-4xl lg:text-5xl">
              Il problema non sei tu.
              <span className="block text-[#FB8B04]">È il metodo sbagliato.</span>
            </h3>
            <p className="mt-5 max-w-md text-base leading-7 text-white/65 sm:text-lg sm:leading-8">
              Hypemove non si appoggia alla tua forza di volontà. Costruisce un'esperienza che abbassa la frizione, aumenta il desiderio e rende il movimento più ripetibile nella tua vita vera.
            </p>
          </div>

          <div className="space-y-5 sm:space-y-8">
            {storySteps.map((step, index) => (
              <StoryCard key={step.title} step={step} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Sezione con i benefici principali.
function BenefitsPanels() {
  return (
    <section id="benefits" className="bg-[#FCFBF8] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          eyebrow="Benefici"
          title="Piccole azioni. Effetti reali nella tua giornata."
          subtitle="Il vero obiettivo non è impressionarti con promesse assurde. È farti percepire un beneficio credibile e desiderabile già da subito."
        />

        <div className="mt-14 grid gap-5 sm:mt-16 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
          {benefits.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.55, delay: index * 0.06 }}
              whileHover={{ y: -6 }}
              className="flex min-h-[300px] flex-col rounded-[28px] border border-black/10 bg-white p-7 shadow-[0_20px_50px_rgba(0,0,0,0.04)] sm:min-h-[320px] sm:rounded-[34px]"
            >
              <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#FB8B04]">Benefit</div>
              <h3 className="mt-6 text-xl font-black tracking-[-0.04em] text-black sm:text-[2rem] sm:leading-[1.05]">{item.title}</h3>
              <p className="mt-5 text-base leading-8 text-black/60">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Sezione recensioni/testimonianze.
function SocialProof() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [30, -20]);
  const smoothY = useSpring(y, { stiffness: 90, damping: 20 });

  return (
    <section id="proof" ref={ref} className="bg-black px-4 py-20 text-white sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          dark
          eyebrow="Recensioni"
          title="Persone normali. Storie vere. Un punto in comune: volevano finalmente riuscirci davvero."
          subtitle="Chi usa Hypemove non cerca il workout perfetto. Cerca un modo più realistico per restare costante."
        />

        <motion.div style={{ y: smoothY }} className="mt-12 grid gap-4 sm:mt-14 md:grid-cols-3 md:gap-6">
          {testimonials.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              whileHover={{ y: -8, scale: 1.01 }}
              className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:rounded-[34px] sm:p-6"
            >
              <div className="mb-5 flex items-center gap-2 text-[#FB8B04]">
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
              </div>
              <p className="text-sm leading-7 text-white/85 sm:text-base sm:leading-8">“{item.quote}”</p>
              <div className="mt-6 border-t border-white/10 pt-5">
                <p className="text-sm font-bold text-white">{item.name}</p>
                <p className="text-sm text-white/55">{item.role}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Call to action finale per il download.
function FinalCta() {
  return (
    <section id="download" className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[32px] border border-black/10 bg-white p-6 shadow-[0_35px_100px_rgba(0,0,0,0.08)] sm:rounded-[42px] sm:p-10 lg:p-14">
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div>
            <Kicker>Scarica gratis</Kicker>
            <h2 className="mt-6 text-3xl font-black leading-[0.95] tracking-[-0.05em] text-black sm:text-5xl xl:text-6xl">
              Inizia con un piano più adatto a te.
              <span className="mt-2 block text-[#FB8B04]">E vedi se questa volta cambia davvero qualcosa.</span>
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-7 text-black/65 sm:text-lg sm:leading-8">
              Che tu voglia dimagrire, tonificare o sentirti meno rigido, Hypemove ti aiuta a partire da una direzione più giusta per te. Senza pressione. Senza caos. Gratis.
            </p>
            <div className="mt-6">
              <CTAButtons />
            </div>
          </div>

          <div className="grid gap-4">
            <motion.div whileHover={{ y: -6 }} className="rounded-[24px] bg-black p-5 text-white sm:rounded-[30px] sm:p-6">
              <div className="text-xs font-bold uppercase tracking-[0.24em] text-white/45 sm:text-sm">Per chi vuole iniziare davvero</div>
              <div className="mt-4 text-2xl font-black leading-tight tracking-[-0.04em] sm:text-3xl">
                Un'app pensata per chi ha poco tempo, poca voglia e non vuole mollare dopo due giorni.
              </div>
            </motion.div>
            <motion.div whileHover={{ y: -6 }} className="rounded-[24px] border border-black/10 bg-[#FB8B04] p-5 text-black sm:rounded-[30px] sm:p-6">
              <div className="text-xs font-bold uppercase tracking-[0.24em] text-black/45 sm:text-sm">Perché piace</div>
              <div className="mt-4 text-xl font-black leading-tight tracking-[-0.03em] sm:text-2xl">
                Perché ti aiuta a muoverti davvero, senza complicarti la vita.
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Domande frequenti.
function Faq() {
  return (
    <section id="faq" className="px-4 pb-24 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <SectionTitle
          eyebrow="FAQ"
          title="Le domande che contano davvero prima di iniziare"
          subtitle="Tutto quello che ti serve sapere per capire se Hypemove fa davvero per te."
        />

        <div className="mt-10 space-y-4 sm:mt-12">
          {[
            {
              q: "Hypemove è gratis?",
              a: "Sì. Puoi iniziare gratis, così il primo passo è molto più facile e senza pressione.",
            },
            {
              q: "Posso trovare un piano adatto al mio obiettivo?",
              a: "Sì. Hypemove nasce per offrire percorsi più adatti a obiettivi diversi, come dimagrimento, tonificazione e mobility.",
            },
            {
              q: "Serve essere già allenati?",
              a: "No. È pensata soprattutto per chi parte da zero, ricomincia o non riesce a essere costante con il fitness tradizionale.",
            },
            {
              q: "Serve attrezzatura?",
              a: "L'idea base è rendere il movimento semplice e facilmente accessibile anche da casa, senza complicazioni inutili.",
            },
            {
              q: "Quanto tempo serve?",
              a: "L'obiettivo è aiutarti con workout più brevi e più facili da iniziare, così il movimento entra meglio nella tua vita reale.",
            },
          ].map((faq, index) => (
            <motion.details
              key={faq.q}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.4, delay: index * 0.04 }}
              className="group rounded-[24px] border border-black/10 bg-white p-5 shadow-[0_18px_50px_rgba(0,0,0,0.04)] sm:rounded-[28px] sm:p-6"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left">
                <span className="text-lg font-black tracking-[-0.03em] text-black sm:text-xl">{faq.q}</span>
                <span className="text-2xl leading-none text-[#FB8B04] transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-4 text-sm leading-6 text-black/65 sm:text-base sm:leading-7">{faq.a}</p>
            </motion.details>
          ))}
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'Hypemove è gratis?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Sì. Puoi iniziare gratis.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Posso trovare un piano adatto al mio obiettivo?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Sì. Hypemove nasce per offrire percorsi più adatti a obiettivi diversi.',
                  },
                },
              ],
            }),
          }}
        />
      </div>
    </section>
  );
}

// Footer con link utili, legali e download.
function Footer() {
  return (
    <footer className="border-t border-black/10 bg-[#F7F7F7]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <LogoMark className="h-8 w-8 shrink-0" />
            <div>
              <div className="text-base font-black text-black">Hypemove</div>
              <div className="text-sm text-black/45">Muoviti. Continua. Stai meglio.</div>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-7 text-black/55">
            L'app fitness pensata per aiutare le persone poco costanti a rendere il movimento più semplice, più desiderabile e più sostenibile.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.22em] text-black">Scopri</h3>
          <div className="mt-4 space-y-3 text-sm text-black/55">
            <a href="#top" className="block transition hover:text-black">Inizio</a>
            <a href="#goals" className="block transition hover:text-black">Obiettivi</a>
            <a href="#story" className="block transition hover:text-black">Metodo</a>
            <a href="#proof" className="block transition hover:text-black">Recensioni</a>
            <a href="#faq" className="block transition hover:text-black">FAQ</a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.22em] text-black">Legale</h3>
          <div className="mt-4 space-y-3 text-sm text-black/55">
            <a href={PRIVACY_URL} className="block transition hover:text-black">Privacy e Termini d'uso</a>
            <a href={MARKETING_URL} className="block transition hover:text-black">Informativa Marketing</a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.22em] text-black">Download</h3>
          <div className="mt-4 space-y-4 text-sm text-black/55">
            <a
              href={PLAY_STORE_URL}
              className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5"
            >
              <Download className="h-4 w-4" />
              Scarica gratis
            </a>
            <p className="leading-6 text-black/50">
              Android disponibile ora. iPhone in arrivo: sostituisci il link placeholder quando avrai la pagina App Store.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-8 text-center text-xs text-black/40 sm:px-6 lg:px-8">
        © {new Date().getFullYear()} Hypemove. Tutti i diritti riservati.
      </div>
    </footer>
  );
}

// Pagina principale della landing.
export default function HypemoveLandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-black">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#FDFDFD]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="#top" className="flex items-center gap-3">
            <LogoMark className="h-12 w-12 shrink-0" />
            <div>
              <div className="text-base font-black tracking-[-0.03em]">Hypemove</div>
              <div className="text-xs text-black/45">Il fitness che riesci davvero a continuare</div>
            </div>
          </a>

          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((item) => (
              <a key={item.label} href={item.href} className="text-sm font-semibold text-black/65 transition hover:text-black">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex">
            <a href={PLAY_STORE_URL} className="inline-flex items-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5">
              Scarica gratis
            </a>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white p-3 text-black lg:hidden"
            aria-expanded={menuOpen}
            aria-label="Apri menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen ? (
          <div className="border-t border-black/10 bg-[#FDFDFD] px-4 py-5 lg:hidden">
            <nav className="space-y-4">
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block text-base font-semibold text-black/70"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <a href={PLAY_STORE_URL} className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-black px-5 py-3 text-base font-semibold text-white">
              Scarica gratis per Android
            </a>
          </div>
        ) : null}
      </header>

      <main id="top">
        {/* Hero iniziale con messaggio principale e preview app */}
        <DynamicHero />
        {/* Fascia in movimento stile ticker */}
        <AutoScrollStatement />
        {/* Obiettivi/percorsi disponibili */}
        <HorizontalGoals />
        {/* Spiegazione del metodo */}
        <StickyStory />
        {/* Benefici concreti del prodotto */}
        <BenefitsPanels />
        {/* Prova sociale e testimonianze */}
        <SocialProof />
        {/* CTA finale di download */}
        <FinalCta />
        {/* FAQ */}
        <Faq />
      </main>

      {/* Footer finale */}
      <Footer />
    </div>
  );
}
