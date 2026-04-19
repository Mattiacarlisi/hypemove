import React from "react";
import { ArrowRight, BookOpen, Clock, Home, Sparkles, Target } from "lucide-react";
import GuideFooter from "../components/GuideFooter.jsx";

const guideClusters = [
  {
    title: "Principianti",
    icon: Sparkles,
    description: "Per chi parte da zero, ha mollato altre volte o vuole ricominciare senza pressione.",
    links: [
      {
        title: "App fitness per principianti",
        desc: "Come iniziare con workout semplici, guidati e sostenibili.",
        href: "/app-fitness-principianti",
      },
      {
        title: "Come iniziare ad allenarsi",
        desc: "Una guida in arrivo per ripartire senza strafare.",
        href: "/app-fitness-principianti",
      },
      {
        title: "Tornare in forma da zero",
        desc: "Percorsi realistici per ricostruire continuità.",
        href: "/app-fitness-principianti",
      },
    ],
  },
  {
    title: "Poco tempo",
    icon: Clock,
    description: "Per chi vuole muoversi anche nelle giornate piene, senza aspettare il momento perfetto.",
    links: [
      {
        title: "Mini workout efficaci",
        desc: "Quando 5 o 10 minuti funzionano davvero.",
        href: "/mini-workout-efficaci",
      },
      {
        title: "Workout 10 minuti a casa",
        desc: "Un allenamento semplice per chi ha poco tempo.",
        href: "/workout-10-minuti-casa",
      },
      {
        title: "Allenamento casa poco tempo",
        desc: "Strategie pratiche per allenarti senza palestra.",
        href: "/workout-10-minuti-casa",
      },
    ],
  },
  {
    title: "Obiettivi",
    icon: Target,
    description: "Per scegliere una direzione chiara: dimagrire, tonificare o muoverti meglio.",
    links: [
      {
        title: "Allenamento a casa",
        desc: "La pagina pilastro per iniziare ad allenarti dove sei.",
        href: "/allenamento-a-casa",
      },
      {
        title: "Dimagrire a casa",
        desc: "Guida in arrivo per perdere peso con un approccio realistico.",
        href: "/allenamento-a-casa",
      },
      {
        title: "Tonificazione a casa",
        desc: "Guida in arrivo per sentirti più tonico senza complicarti la vita.",
        href: "/allenamento-a-casa",
      },
    ],
  },
];

function LogoMark() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
      <span className="text-lg font-black tracking-[-0.06em]">H</span>
    </div>
  );
}

export default function Guide() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-black">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#FDFDFD]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center gap-3">
            <LogoMark />
            <div>
              <div className="text-base font-black tracking-[-0.03em]">Hypemove</div>
              <div className="text-xs text-black/45">Guide utili</div>
            </div>
          </a>
          <a
            href="/"
            className="hidden rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-black/70 transition hover:-translate-y-0.5 hover:border-black/20 hover:text-black sm:inline-flex"
          >
            Torna alla home
          </a>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(0,0,0,0.9)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.9)_1px,transparent_1px)] [background-size:48px_48px]" />
          <div className="pointer-events-none absolute right-[-12%] top-10 h-72 w-72 rounded-full bg-[#FB8B04]/12 blur-3xl" />
          <div className="relative mx-auto max-w-7xl">
            <div className="max-w-4xl">
              <div className="inline-flex rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black/60">
                Risorse Hypemove
              </div>
              <h1 className="mt-6 text-4xl font-black leading-[0.95] tracking-[-0.06em] text-black sm:text-6xl lg:text-7xl">
                Guide utili per chi vuole iniziare davvero
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-black/65 sm:text-xl sm:leading-9">
                Contenuti semplici e realistici per allenarti a casa con più costanza. Niente caos, niente consigli estremi: solo percorsi utili per partire e continuare.
              </p>
            </div>
          </div>
        </section>

        <section className="px-4 pb-24 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-6">
            {guideClusters.map((cluster) => {
              const Icon = cluster.icon;
              return (
                <section key={cluster.title} className="rounded-[32px] border border-black/10 bg-white p-5 shadow-[0_24px_80px_rgba(0,0,0,0.05)] sm:p-7">
                  <div className="grid gap-6 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)]">
                    <div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h2 className="mt-5 text-3xl font-black tracking-[-0.05em] text-black sm:text-4xl">{cluster.title}</h2>
                      <p className="mt-4 text-base leading-8 text-black/62">{cluster.description}</p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      {cluster.links.map((link) => (
                        <a
                          key={`${cluster.title}-${link.title}`}
                          href={link.href}
                          className="group flex min-h-[210px] flex-col justify-between rounded-[26px] border border-black/10 bg-[#FCFBF8] p-5 transition hover:-translate-y-1 hover:border-black/20 hover:bg-white"
                        >
                          <span>
                            <BookOpen className="h-5 w-5 text-[#FB8B04]" />
                            <h3 className="mt-4 text-xl font-black tracking-[-0.04em] text-black">{link.title}</h3>
                            <p className="mt-3 text-sm leading-7 text-black/60">{link.desc}</p>
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
            })}
          </div>
        </section>

        <section className="px-4 pb-24 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 rounded-[32px] bg-black p-6 text-white sm:p-10 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Home className="h-8 w-8 text-[#FB8B04]" />
              <h2 className="mt-4 text-3xl font-black tracking-[-0.05em] sm:text-4xl">Vuoi partire dalla pagina principale?</h2>
              <p className="mt-3 max-w-2xl text-base leading-8 text-white/65">Scopri Hypemove, scegli il tuo obiettivo e scarica l'app gratis.</p>
            </div>
            <a href="/" className="inline-flex min-h-[54px] items-center justify-center rounded-full bg-white px-6 py-3 font-semibold text-black transition hover:-translate-y-0.5">
              Vai alla home
            </a>
          </div>
        </section>
      </main>
      <GuideFooter />
    </div>
  );
}
