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
import { guideFooterLinks, homeGuideCards } from "./data/guides.js";
import {
  DEFAULT_ANDROID_BUTTON_TEXT,
  DEFAULT_IPHONE_BUTTON_TEXT,
  PLAY_STORE_URL,
  handleAndroidDownloadClick,
  handleIphoneDownloadClick,
} from "./lib/analytics.js";

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
  { label: "Guide", href: "/guide" },
];

// Card della sezione obiettivi.
const goals = [
  {
    title: "Dimagrimento",
    desc: "Per chi vuole perdere peso e sentirsi più leggero, con un metodo che riesci davvero a portare avanti.",
    icon: Flame,
    eyebrow: "Perdere peso",
    shell:
      "border-[#F6C27A]/50 bg-[linear-gradient(180deg,#fff8ef_0%,#fff4e3_100%)] shadow-[0_28px_80px_rgba(251,139,4,0.16)]",
    accent: "from-[#FB8B04]/28 via-[#FFD29A]/16 to-transparent",
    badge: "bg-white/78 text-[#A85A00] border-[#F1B86A]/60",
    iconWrap: "bg-[#111111] text-white shadow-[0_16px_34px_rgba(17,17,17,0.2)]",
    titleClass: "text-black",
  },
  {
    title: "Tonificazione",
    desc: "Per chi vuole sentirsi più tonico e vedersi cambiare senza ricominciare da zero ogni volta.",
    icon: Trophy,
    eyebrow: "Definire il corpo",
    shell:
      "border-[#E7D7B6]/70 bg-[linear-gradient(145deg,#FFFDF8_0%,#F6EEDB_52%,#F0E2BF_100%)] shadow-[0_30px_90px_rgba(185,148,79,0.18)]",
    accent: "from-[#E9C46A]/24 via-[#FFF6DA]/16 to-transparent",
    badge: "bg-white/78 text-[#8A6424] border-[#E7D7B6]/80",
    iconWrap: "bg-[#1C1C1C] text-[#F6D77A] shadow-[0_16px_34px_rgba(28,28,28,0.16)]",
    titleClass: "text-[#1F1405]",
    bodyClass: "text-[#3C3020]/80",
  },
  {
    title: "Mobility & Stretching",
    desc: "Per chi vuole sentirsi meno rigido e muoversi meglio dopo lunghe giornate passate alla scrivania.",
    icon: Waves,
    eyebrow: "Muoversi meglio",
    shell:
      "border-[#C7E6DD]/70 bg-[linear-gradient(180deg,#F1FBF8_0%,#E4F5F0_100%)] shadow-[0_28px_80px_rgba(61,144,119,0.14)]",
    accent: "from-[#79C7AF]/24 via-[#D8F3EA]/16 to-transparent",
    badge: "bg-white/82 text-[#216A58] border-[#9FD6C7]/70",
    iconWrap: "bg-[#0F3D34] text-white shadow-[0_16px_34px_rgba(15,61,52,0.18)]",
    titleClass: "text-[#0C1F1A]",
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
    title: "Raggiungi il tuo obiettivo",
    desc: "Dimagrire, tonificarti o sentirti meno rigido diventa più semplice da portare avanti.",
    icon: Trophy,
  },
  {
    title: "Ottieni più energia",
    desc: "Muoversi con più continuità ti aiuta a sentirti meno spento durante la giornata.",
    icon: Sparkles,
  },
  {
    title: "Ti senti meglio nel tuo corpo",
    desc: "Non si tratta solo di allenarti, ma di iniziare a percepire un cambiamento reale.",
    icon: Waves,
  },
  {
    title: "Diventa più costante",
    desc: "Workout brevi e già pronti ti aiutano a continuare senza mollare dopo pochi giorni.",
    icon: Timer,
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

// Pulsanti CTA riutilizzati in più punti della pagina.
function CTAButtons({ center = false, location }) {
  return (
    <div className={`flex flex-col gap-3 sm:flex-row ${center ? "justify-center" : ""}`}>
      <a
        href={PLAY_STORE_URL}
        onClick={(event) => handleAndroidDownloadClick(event, {
          buttonText: DEFAULT_ANDROID_BUTTON_TEXT,
          location,
        })}
        className="group inline-flex min-h-[56px] items-center justify-center rounded-full bg-black px-6 py-4 text-base font-semibold text-white transition hover:-translate-y-0.5 sm:px-7"
      >
        <Download className="mr-2 h-4 w-4" />
        Scarica gratis per Android
        <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
      </a>
      <a
        href={IOS_WAITLIST_URL}
        onClick={(event) => handleIphoneDownloadClick(event, {
          buttonText: DEFAULT_IPHONE_BUTTON_TEXT,
          href: IOS_WAITLIST_URL,
          location,
        })}
        className="group inline-flex min-h-[56px] items-center justify-center rounded-full border border-black/10 bg-white px-6 py-4 text-base font-semibold text-black transition hover:-translate-y-0.5 hover:border-black/20 sm:px-7"
      >
        <Apple className="mr-2 h-4 w-4" />
        {DEFAULT_IPHONE_BUTTON_TEXT}
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
    }, 3000);

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
    <section ref={heroRef} className="relative overflow-hidden px-4 pb-8 pt-5 sm:px-6 sm:pb-10 sm:pt-7 md:px-8 lg:px-8 lg:pb-6 lg:pt-4">
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
              <div className="max-w-[820px] text-[2.35rem] font-black leading-[0.9] tracking-[-0.07em] text-black sm:text-[3.35rem] md:text-[4rem] lg:text-[2.75rem] xl:text-[3.15rem]">
                Raggiungi il tuo obiettivo
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="overflow-hidden"
            >
              <div className="max-w-[820px] text-[2.35rem] font-black leading-[0.9] tracking-[-0.07em] text-black sm:text-[3.35rem] md:text-[4rem] lg:text-[2.75rem] xl:text-[3.15rem]">
                con allenamenti
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="overflow-hidden"
            >
              <div className="max-w-[760px] text-[2.35rem] font-black leading-[0.92] tracking-[-0.07em] text-[#FB8B04] sm:text-[3.35rem] md:text-[4rem] lg:text-[3.2rem] xl:text-[3.55rem]">
                semplici ed efficaci
              </div>
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18 }}
            className="mt-2 max-w-[620px] text-base leading-7 text-black/65 sm:mt-3 sm:text-lg sm:leading-8 xl:text-[1rem]"
          >
            Hypemove ti dà il percorso più adatto al tuo obiettivo e, workout dopo workout, trasforma il movimento in un'abitudine quotidiana.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.24 }}
            className="mt-4"
          >
            <CTAButtons location="hero" />
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
    <section id="goals" ref={ref} className="relative overflow-hidden bg-[radial-gradient(circle_at_top,#fff7eb_0%,#fdfdfd_42%,#f8f6f1_100%)] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(251,139,4,0.10),rgba(251,139,4,0))]" />
      <div className="pointer-events-none absolute left-[-10%] top-32 h-64 w-64 rounded-full bg-[#FB8B04]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-[-8%] h-72 w-72 rounded-full bg-black/[0.04] blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <SectionTitle
          eyebrow="Obiettivi"
          title="Scegli il tuo obiettivo. Pensiamo noi al resto."
          subtitle="Ogni persona ha un obiettivo diverso. Hypemove parte dal tuo."
        />

        <div className="mt-8 sm:mt-10">
          <div className="mx-auto max-w-3xl text-center text-sm leading-7 text-black/60 sm:text-base sm:leading-8">
            Dimagrisci, tonificati o sciogliti: non un programma generico, ma un percorso costruito sulle tue esigenze e sul tuo obiettivo.
          </div>

          <div className="mt-6 flex items-center justify-center gap-3 md:hidden">
            <button
              type="button"
              onClick={() => scrollByAmount("left")}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white/90 text-black shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur transition hover:-translate-y-0.5 hover:border-black/20 hover:bg-black hover:text-white"
              aria-label="Scorri obiettivi a sinistra"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => scrollByAmount("right")}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white/90 text-black shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur transition hover:-translate-y-0.5 hover:border-black/20 hover:bg-black hover:text-white"
              aria-label="Scorri obiettivi a destra"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative mt-10 md:hidden">
        <div
          ref={carouselRef}
          className="no-scrollbar overflow-x-auto overflow-y-hidden bg-transparent scroll-smooth pb-4 touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none]"
        >
          <motion.div
            style={{ x: smoothX }}
            className="flex w-max items-stretch gap-4 bg-transparent px-4 sm:gap-5 sm:px-6"
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
                  className={`group relative min-h-[348px] w-[260px] shrink-0 snap-start overflow-hidden rounded-[30px] border p-5 sm:w-[300px] sm:rounded-[34px] sm:p-6 ${item.shell}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.accent} opacity-90 transition duration-300 group-hover:opacity-100`} />
                  <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                  <div className="absolute right-5 top-5 h-20 w-20 rounded-full bg-white/20 blur-3xl" />
                  <div className="absolute bottom-[-32px] right-[-12px] h-24 w-24 rounded-full border border-white/20 bg-white/10" />
                  <div className="relative">
                    <div className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.26em] ${item.badge}`}>
                      {item.eyebrow}
                    </div>
                    <div className={`mt-5 flex h-12 w-12 items-center justify-center rounded-[18px] sm:h-14 sm:w-14 ${item.iconWrap}`}>
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <h3 className={`mt-5 max-w-[10ch] text-xl font-black tracking-[-0.05em] sm:text-[2rem] sm:leading-[0.98] ${item.titleClass}`}>{item.title}</h3>
                    <p className={`mt-4 max-w-[24ch] text-sm leading-7 sm:text-base sm:leading-8 ${item.bodyClass ?? "text-black/68"}`}>{item.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      <div className="relative mx-auto mt-12 hidden max-w-7xl md:block">
        <div className="grid gap-5 md:grid-cols-3 lg:gap-6">
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
                className={`group relative min-h-[420px] overflow-hidden rounded-[30px] border p-6 lg:rounded-[36px] ${item.shell}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.accent} opacity-90 transition duration-300 group-hover:opacity-100`} />
                <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                <div className="absolute right-5 top-5 h-20 w-20 rounded-full bg-white/20 blur-3xl" />
                <div className="absolute bottom-[-32px] right-[-12px] h-24 w-24 rounded-full border border-white/20 bg-white/10" />
                <div className="relative">
                  <div className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.26em] ${item.badge}`}>
                    {item.eyebrow}
                  </div>
                  <div className={`mt-5 flex h-14 w-14 items-center justify-center rounded-[18px] ${item.iconWrap}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className={`mt-6 max-w-[10ch] text-[2rem] font-black leading-[0.98] tracking-[-0.05em] ${item.titleClass}`}>
                    {item.title}
                  </h3>
                  <p className={`mt-5 max-w-[24ch] text-base leading-8 ${item.bodyClass ?? "text-black/68"}`}>{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
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
      className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:rounded-[36px] sm:p-7"
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-black shadow-[0_14px_34px_rgba(255,255,255,0.12)] sm:h-14 sm:w-14">
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <h4 className="text-2xl font-black tracking-[-0.04em] text-white sm:text-[2rem]">{step.title}</h4>
          </div>
        </div>
        <p className="relative max-w-[42ch] text-sm leading-7 text-white/68 sm:text-base sm:leading-8">{step.text}</p>
        <div className="relative flex items-center justify-between border-t border-white/10 pt-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/38">Hypemove system</div>
          <div className="h-2 w-2 rounded-full bg-[#FB8B04]" />
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
          title={
            <>
              Un sistema pensato per
              <span className="block text-[#FB8B04]">NON farti mollare</span>
            </>
          }
          subtitle="Niente programma pesante da interpretare. Hai un percorso più guidato, più breve e più coinvolgente."
        />

        <div className="mt-14 grid gap-5 sm:mt-16 lg:grid-cols-3 lg:gap-6">
          {[
            {
              number: "01",
              title: "Personalizzazione",
              text: "Scegli il tuo obiettivo e Hypemove ti propone un percorso più adatto a te.",
              icon: Sparkles,
            },
            {
              number: "02",
              title: "Snack workout",
              text: "Allenamenti brevi e semplici, pensati per aiutarti a iniziare senza rimandare.",
              icon: Timer,
            },
            {
              number: "03",
              title: "Gamification",
              text: "Punti, streak e reward ti danno un motivo in più per tornare anche domani.",
              icon: PlayCircle,
            },
          ].map((step, index) => (
            <StoryCard key={step.title} step={step} index={index} />
          ))}
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
          title="Come Hypemove ti aiuta davvero"
        />

        <div className="mt-12 divide-y divide-black/10 border-y border-black/10 sm:mt-14">
          {benefits.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.55, delay: index * 0.06 }}
              className={`grid items-center gap-5 py-6 sm:gap-8 sm:py-8 lg:grid-cols-[88px_minmax(0,1fr)] ${
                index % 2 === 1 ? "lg:grid-cols-[minmax(0,1fr)_88px]" : ""
              }`}
            >
              <div
                className={`flex ${
                  index % 2 === 1 ? "lg:order-2 lg:justify-end" : "lg:order-1"
                }`}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white shadow-[0_14px_34px_rgba(17,17,17,0.14)] sm:h-16 sm:w-16">
                  <item.icon className="h-6 w-6" />
                </div>
              </div>
              <div className={index % 2 === 1 ? "lg:order-1 lg:text-right" : "lg:order-2"}>
                <h3 className="text-xl font-black tracking-[-0.04em] text-black sm:text-[2rem] sm:leading-[1.05]">
                  {item.title}
                </h3>
                <p className={`mt-3 text-sm leading-7 text-black/60 sm:text-base sm:leading-8 ${
                  index % 2 === 1 ? "lg:ml-auto lg:max-w-[40ch]" : "max-w-[40ch]"
                }`}>
                  {item.desc}
                </p>
              </div>
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
          title={
            <>
              Persone normali. Storie vere. Un punto in comune:
              <span className="text-[#FB8B04]"> volevano finalmente riuscirci davvero.</span>
            </>
          }
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
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[32px] border border-black/10 bg-[#FCFBF8] p-6 shadow-[0_35px_100px_rgba(0,0,0,0.08)] sm:rounded-[42px] sm:p-10 lg:p-14">
        <div className="grid items-center gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12">
          <div>
            <Kicker>Scarica gratis</Kicker>
            <h2 className="mt-6 text-3xl font-black leading-[0.95] tracking-[-0.05em] text-black sm:text-5xl xl:text-6xl">
              Smetti di ricominciare da capo.
              <span className="mt-2 block text-[#FB8B04]">Inizia con un percorso che ti aiuta a continuare.</span>
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-7 text-black/65 sm:text-lg sm:leading-8">
              Workout brevi, guidati e già pronti per aiutarti a rimetterti in forma con più costanza, anche nelle settimane più piene.
            </p>
            <div className="mt-6">
              <CTAButtons location="final_cta" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <motion.div whileHover={{ y: -6 }} className="relative overflow-hidden rounded-[24px] bg-black p-5 text-white sm:rounded-[30px] sm:p-6">
              <div className="absolute right-[-44px] top-[-44px] h-32 w-32 rounded-full bg-[#FB8B04]/25 blur-2xl" />
              <div className="relative">
                <div className="text-xs font-bold uppercase tracking-[0.24em] text-white/45 sm:text-sm">Per chi è fatta</div>
                <div className="mt-4 text-2xl font-black leading-tight tracking-[-0.04em] sm:text-3xl">
                  Per chi vuole un modo più semplice e realistico per allenarsi davvero.
                </div>
              </div>
            </motion.div>
            <motion.div whileHover={{ y: -6 }} className="relative overflow-hidden rounded-[24px] border border-black/10 bg-[#FB8B04] p-5 text-black shadow-[0_24px_70px_rgba(251,139,4,0.22)] sm:rounded-[30px] sm:p-6">
              <div className="absolute bottom-[-52px] right-[-36px] h-36 w-36 rounded-full bg-white/25 blur-2xl" />
              <div className="relative">
                <div className="text-xs font-bold uppercase tracking-[0.24em] text-black/45 sm:text-sm">Perché funziona meglio</div>
                <div className="mt-4 text-2xl font-black leading-tight tracking-[-0.04em] sm:text-3xl">
                  Meno decisioni, meno attrito, più continuità.
                </div>
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
  const [showAll, setShowAll] = useState(false);
  const faqs = [
    {
      q: "Hypemove è gratis?",
      a: "Sì. Puoi scaricarla e iniziare subito senza pagare nulla. Gratuitamente hai accesso ai workout e ai percorsi base. Se vuoi qualcosa di ancora più personalizzato e su misura per il tuo obiettivo, puoi passare al piano Premium — ma il primo passo è sempre gratis e senza pressione.",
    },
    {
      q: "Posso trovare un piano adatto al mio obiettivo?",
      a: "Sì. Hypemove non ti dà un programma generico uguale per tutti. Scegli il tuo obiettivo — dimagrimento, tonificazione o mobility — e costruisce un percorso pensato per te. Così sai sempre cosa fare e perché.",
    },
    {
      q: "Serve essere già allenati?",
      a: "No, anzi. Hypemove è pensata proprio per chi parte da zero, ha smesso da tempo o non riesce mai a restare costante. Non devi avere esperienza, non devi essere in forma. Devi solo aprire l'app e seguire.",
    },
    {
      q: "Serve attrezzatura?",
      a: "No. Puoi fare tutto a casa, in camera, in salotto. Niente pesi. L'unica cosa che ti serve è lo smartphone che hai già in mano.",
    },
    {
      q: "Quanto tempo serve?",
      a: "Bastano 5 minuti al giorno per iniziare. I workout sono brevi, guidati e pensati per entrare in qualsiasi giornata — anche in quella in cui pensavi di non avere tempo. Perché la costanza vera non viene da sessioni lunghissime, viene dalla regolarità.",
    },
    {
      q: "I workout brevi servono davvero?",
      a: "Sì, se riesci a farli con costanza. Hypemove non ti promette risultati assurdi in pochi giorni, ma un modo più realistico per muoverti con regolarità e avvicinarti davvero al tuo obiettivo. Per molte persone, un workout breve che riesci a seguire vale molto di più di un programma perfetto che molli dopo tre giorni.",
    },
    {
      q: "E se ho già mollato tante volte?",
      a: "È proprio da lì che nasce Hypemove. Non per chi è già super disciplinato, ma per chi ogni volta riparte e poi si blocca. Per questo trovi workout brevi, un percorso guidato e meno decisioni da prendere: così iniziare è più semplice e continuare diventa molto più naturale.",
    },
    {
      q: "Posso allenarmi davvero a casa senza organizzarmi troppo?",
      a: "Sì. Hypemove è pensata per aiutarti a partire senza trasformare l'allenamento in un'altra cosa da organizzare. Ti basta aprire l'app, seguire il workout e iniziare: niente palestra, niente attrezzatura obbligatoria, niente preparazioni infinite.",
    },
    {
      q: "È troppo intenso per chi parte da zero o ha poca energia?",
      a: "No. Hypemove parte dal tuo livello e dal tuo obiettivo, così il percorso risulta più adatto a te fin dall'inizio. Non ogni giornata richiede un allenamento pesante: ci sono anche sessioni più leggere, pensate per aiutarti a muoverti un po' senza sentirti distrutto.",
    },
  ];
  const visibleFaqs = showAll ? faqs : faqs.slice(0, 5);

  return (
    <section id="faq" className="px-4 pb-24 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <SectionTitle
          eyebrow="FAQ"
          title="Le domande che contano davvero prima di iniziare"
          subtitle="Tutto quello che ti serve sapere per capire se Hypemove fa davvero per te."
        />

        <div className="mt-10 space-y-4 sm:mt-12">
          {visibleFaqs.map((faq, index) => (
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

        {faqs.length > 5 ? (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAll((current) => !current)}
              className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:border-black/20 hover:bg-black hover:text-white"
              aria-expanded={showAll}
            >
              {showAll ? "Mostra meno FAQ" : `Mostra tutte le FAQ (${faqs.length})`}
              <ArrowRight className={`ml-2 h-4 w-4 transition ${showAll ? "-rotate-90" : "rotate-90"}`} />
            </button>
          </div>
        ) : null}

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
                  text: faq.a.replaceAll(" — ", ", "),
                },
              })),
            }),
          }}
        />
      </div>
    </section>
  );
}

// Sezione home con link interni verso le guide SEO principali.
function GuidePreview() {
  return (
    <section className="bg-[#FCFBF8] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionTitle
            eyebrow="Guide"
            title="Guide utili per iniziare"
            subtitle="Contenuti semplici e realistici per allenarti a casa con più costanza."
          />
          <a
            href="/guide"
            className="mx-auto inline-flex min-h-[52px] items-center justify-center rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:border-black/20 lg:mx-0"
          >
            Tutte le guide
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {homeGuideCards.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group flex min-h-[190px] flex-col justify-between rounded-[22px] border border-black/10 bg-white p-5 shadow-[0_18px_52px_rgba(0,0,0,0.045)] transition hover:-translate-y-1 hover:border-black/20"
            >
              <span>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black text-white">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="mt-4 text-xl font-black tracking-[-0.04em] text-black">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-black/60">{item.description}</p>
              </span>
              <span className="mt-5 inline-flex items-center text-sm font-bold text-black">
                Leggi la guida
                <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// Footer con link utili, legali e download.
function Footer() {
  return (
    <footer className="border-t border-black/10 bg-[#F7F7F7]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-5 lg:px-8">
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
            <a href="/guide" className="block transition hover:text-black">Guide</a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.22em] text-black">Guide utili</h3>
          <div className="mt-4 space-y-3 text-sm text-black/55">
            {guideFooterLinks.map((guide) => (
              <a key={guide.href} href={guide.href} className="block transition hover:text-black">
                {guide.title}
              </a>
            ))}
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
              onClick={(event) => handleAndroidDownloadClick(event, {
                buttonText: "Scarica gratis",
                location: "footer",
              })}
              className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5"
            >
              <Download className="h-4 w-4" />
              Scarica gratis
            </a>
            <p className="leading-6 text-black/50">Android disponibile ora. iPhone in arrivo.</p>
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
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 md:px-8 lg:px-8">
          <a href="#top" className="flex items-center gap-3">
            <LogoMark className="h-12 w-12 shrink-0" />
            <div>
              <div className="text-base font-black tracking-[-0.03em]">Hypemove</div>
              <h1 className="text-xs font-normal leading-4 text-black/45">
                App fitness per allenarti a casa, dimagrire, tonificare e stare meglio
              </h1>
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
            <a
              href={PLAY_STORE_URL}
              onClick={(event) => handleAndroidDownloadClick(event, {
                buttonText: "Scarica gratis",
                location: "navbar",
              })}
              className="inline-flex items-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            >
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
            <a
              href={PLAY_STORE_URL}
              onClick={(event) => handleAndroidDownloadClick(event, {
                buttonText: DEFAULT_ANDROID_BUTTON_TEXT,
                location: "mobile_menu",
              })}
              className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-black px-5 py-3 text-base font-semibold text-white"
            >
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
        {/* Guide SEO e contenuti consigliati */}
        <GuidePreview />
      </main>

      {/* Footer finale */}
      <Footer />
    </div>
  );
}
