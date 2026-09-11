import React from "react";
import { PLAY_STORE_URL, TESTFLIGHT_URL, SUPPORT_EMAIL, INSTAGRAM_URL, LINKEDIN_URL } from "../site.js";
import { guides } from "../data/guides.js";

// Componenti condivisi da tutte le pagine pubbliche. Nessuno stato React: le pagine
// vengono generate come HTML statico e i pochi comportamenti (menu, tracking) sono
// nello script inline di index.html.

export function LogoMark({ size = "h-9 w-9 text-xl" }) {
  return (
    <span className={`inline-flex items-center justify-center rounded-[10px] bg-orange font-display font-extrabold text-white ${size}`} aria-hidden="true">
      H
    </span>
  );
}

export function PlayButton({ className = "btn-primary", location, children = "Scarica gratis su Google Play" }) {
  return (
    <a href={PLAY_STORE_URL} className={className} data-track="android" data-location={location} rel="noopener">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M3.6 2.4 13.3 12 3.6 21.6c-.4-.2-.6-.7-.6-1.2V3.6c0-.5.2-1 .6-1.2zm11.1 11 2.6 2.6-9.9 5.7c-.5.3-1 .3-1.5.1l8.8-8.4zm0-2.8L5.9 2.2c.5-.2 1-.2 1.5.1l9.9 5.7-2.6 2.6zm4.1 1.4c.6.3 1 .8 1 1.4 0 .6-.4 1.1-1 1.4l-2.3 1.3-2.9-2.7 2.9-2.7 2.3 1.3z" />
      </svg>
      {children}
    </a>
  );
}

// iPhone: porta alla versione di prova su TestFlight. Niente logo Apple, solo la sagoma
// di un telefono: il marchio non è nostro e non serve a far capire il bottone.
export function IphoneButton({ className = "btn-ghost", location, children = "Installa su iPhone con TestFlight" }) {
  return (
    <a href={TESTFLIGHT_URL} className={className} data-track="iphone" data-location={location} rel="noopener">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="6.5" y="2" width="11" height="20" rx="3" />
        <path d="M10.5 18.6h3" strokeLinecap="round" />
      </svg>
      {children}
    </a>
  );
}

const NAV = [
  { label: "Come funziona", href: "/#come-funziona", key: "home" },
  { label: "Coach AI", href: "/coach-ai", key: "coach" },
  { label: "Prezzi", href: "/prezzi", key: "prezzi" },
  { label: "Guide", href: "/guide", key: "guide" },
  { label: "Chi siamo", href: "/chi-siamo", key: "chi-siamo" },
];

export function SiteHeader({ current }) {
  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-site items-center justify-between px-5 sm:px-7">
        <a href="/" className="flex items-center gap-2.5 font-display text-2xl font-extrabold tracking-wide text-ink" aria-label="Hypemove, home">
          <LogoMark />
          Hypemove
        </a>
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Principale">
          {NAV.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className={`text-[0.95rem] font-bold transition hover:text-ink ${current === item.key ? "text-ink" : "text-ink-2"}`}
              aria-current={current === item.key ? "page" : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="hidden lg:block">
          <PlayButton className="btn-dark !min-h-[44px] !py-2.5 text-sm" location="navbar">Scarica gratis</PlayButton>
        </div>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-rule bg-white text-ink lg:hidden"
          aria-label="Apri il menu"
          aria-expanded="false"
          aria-controls="menu-mobile"
          data-menu-toggle
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </div>
      <div id="menu-mobile" className="border-t border-rule bg-paper px-5 py-4 lg:hidden" hidden>
        <nav className="grid gap-1" aria-label="Menu">
          {NAV.map((item) => (
            <a key={item.key} href={item.href} className="rounded-lg px-2 py-3 text-lg font-bold text-ink">
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

// Barra fissa in basso, solo su telefono: la CTA resta sempre a portata di pollice.
export function MobileBar() {
  return (
    <div className="mobile-bar fixed inset-x-0 bottom-0 z-30 border-t border-rule bg-paper/95 px-4 pt-3 backdrop-blur md:hidden">
      <PlayButton className="btn-primary w-full" location="mobile_bar" />
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-rule bg-paper">
      <div className="mx-auto grid max-w-site gap-10 px-5 py-12 sm:px-7 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div>
          <a href="/" className="flex items-center gap-2.5 font-display text-2xl font-extrabold tracking-wide text-ink">
            <LogoMark size="h-8 w-8 text-lg" />
            Hypemove
          </a>
          <p className="mt-3 max-w-[36ch] text-[0.95rem] text-ink-2">
            L'app che aiuta le persone poco costanti a muoversi ogni giorno, con allenamenti brevi e un percorso guidato.
          </p>
          <p className="mt-4 text-[0.95rem] text-ink-2">
            Scrivici: <a href={`mailto:${SUPPORT_EMAIL}`} className="font-bold text-ink">{SUPPORT_EMAIL}</a>
          </p>
          <div className="mt-3 flex gap-4 text-[0.9rem] font-bold">
            <a href={INSTAGRAM_URL} rel="noopener" className="text-ink-2 hover:text-ink">Instagram</a>
            <a href={LINKEDIN_URL} rel="noopener" className="text-ink-2 hover:text-ink">LinkedIn</a>
          </div>
        </div>
        <FooterCol title="Prodotto" links={[["Come funziona", "/#come-funziona"], ["Coach AI", "/coach-ai"], ["Calorie da una foto", "/calorie"], ["Prezzi", "/prezzi"], ["Chi siamo", "/chi-siamo"], ["Hypemove per iPhone", "/iphone"]]} />
        <FooterCol
          title="Guide e confronti"
          links={[
            ["Tutte le guide", "/guide"],
            ...guides.slice(0, 3).map((guide) => [guide.title, guide.href]),
            ["Hypemove e le altre app", "/confronti"],
          ]}
        />
        <FooterCol title="Legale" links={[["Privacy", "/legal/privacy.html"], ["Termini", "/legal/termini.html"], ["Cookie", "/legal/cookie.html"]]} />
      </div>
      <div className="mx-auto flex max-w-site flex-col gap-2 px-5 pb-8 text-xs text-ink-3 sm:flex-row sm:justify-between sm:px-7">
        <span>© {new Date().getFullYear()} Hypemove. Tutti i diritti riservati.</span>
        <span>Google Play e il logo di Google Play sono marchi di Google LLC. TestFlight e App Store sono marchi di Apple Inc.</span>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink">{title}</div>
      <ul className="mt-3 grid gap-2 text-[0.95rem]">
        {links.map(([label, href]) => (
          <li key={href + label}>
            <a href={href} className="text-ink-2 hover:text-ink">{label}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Immagine con versioni WebP: `name` è il nome base in /images/opt, `widths` le misure generate.
export function Picture({ name, widths, alt, sizes = "100vw", className = "", width, height, priority = false }) {
  const srcSet = widths.map((w) => `/images/opt/${name}-${w}.webp ${w}w`).join(", ");
  const largest = widths[widths.length - 1];
  return (
    <img
      src={`/images/opt/${name}-${largest}.webp`}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      fetchpriority={priority ? "high" : undefined}
      decoding="async"
      className={className}
    />
  );
}

// Screenshot dell'app (ritagliati dalla scheda Play, vedi scripts/crop-play-screenshots.mjs).
// Dimensioni dei master, servono a evitare salti di layout durante il caricamento.
const APP_SHOT_DIMS = {
  classifica: [727, 1429],
  "coach-kettlebell": [737, 1451],
  "coach-calorie": [768, 1442],
  esercizio: [701, 1442],
  progressi: [728, 1507],
  percorso: [729, 1466],
};
// `radius` taglia gli angoli bianchi residui intorno alla cornice del telefono: va in proporzione
// alla larghezza a cui viene mostrato (circa il 14% della larghezza).
export function AppShot({ name, alt, className = "", sizes = "(min-width: 768px) 320px, 70vw", priority = false, radius = "" }) {
  const [w, h] = APP_SHOT_DIMS[name] ?? [750, 1480];
  return (
    <span className={`block ${radius} ${className}`}>
      <Picture name={`app-${name}`} widths={[360, 720]} alt={alt} sizes={sizes} className="block h-auto w-full" width={w} height={h} priority={priority} />
    </span>
  );
}

export function Section({ id, className = "", children, tone = "paper" }) {
  const bg = tone === "peach" ? "bg-peach" : tone === "deep" ? "bg-deep text-white" : "bg-paper";
  return (
    <section id={id} className={`${bg} scroll-mt-16 px-5 py-14 sm:px-7 sm:py-20 ${className}`}>
      <div className="mx-auto max-w-site">{children}</div>
    </section>
  );
}

// Testa di sezione. variant: "split" (titolo a sinistra, sottotitolo a destra, su desktop),
// "center" (tutto centrato) o "stack" (impilato, per colonne strette).
export function SectionHead({ kicker, title, sub, variant = "split", center = false, light = false, as = "h2" }) {
  const Heading = as;
  const mode = center ? "center" : variant;
  const titleClass = `h-section ${light ? "text-white" : "text-ink"}`;
  const subClass = `text-lg ${light ? "text-white/75" : "text-ink-2"}`;
  if (mode === "center") {
    return (
      <div className="mx-auto max-w-3xl text-center">
        {kicker ? <div className="kicker mb-3">{kicker}</div> : null}
        <Heading className={`${titleClass} mx-auto max-w-[22ch]`}>{title}</Heading>
        {sub ? <p className={`${subClass} mx-auto mt-4 max-w-[52ch]`}>{sub}</p> : null}
      </div>
    );
  }
  if (mode === "stack") {
    return (
      <div>
        {kicker ? <div className="kicker mb-3">{kicker}</div> : null}
        <Heading className={`${titleClass} max-w-[20ch]`}>{title}</Heading>
        {sub ? <p className={`${subClass} mt-4 max-w-[48ch]`}>{sub}</p> : null}
      </div>
    );
  }
  return (
    <div className="grid gap-4 lg:grid-cols-12 lg:items-start lg:gap-10">
      <div className="lg:col-span-7">
        {kicker ? <div className="kicker mb-3">{kicker}</div> : null}
        <Heading className={`${titleClass} max-w-[22ch]`}>{title}</Heading>
      </div>
      {sub ? <p className={`${subClass} max-w-[44ch] lg:col-span-5 ${kicker ? "lg:mt-9" : "lg:mt-2"}`}>{sub}</p> : null}
    </div>
  );
}

export function Faq({ items, id = "faq", className = "mt-8 max-w-[760px]" }) {
  return (
    <div id={id} className={`border-t border-rule ${className}`}>
      {items.map((item) => (
        <details key={item.q} className="faq border-b border-rule py-4">
          <summary className="flex items-start justify-between text-lg font-extrabold text-ink">{item.q}</summary>
          <p className="mt-3 max-w-prose text-[1.02rem] leading-relaxed text-ink-2">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

export function Layout({ current, children, mobileBar = true }) {
  return (
    <>
      <SiteHeader current={current} />
      <main id="contenuto">{children}</main>
      <SiteFooter />
      {mobileBar ? <MobileBar /> : null}
    </>
  );
}
