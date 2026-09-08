// Fatti e costanti di tutto il sito. UNICO posto dove vivono numeri e testi che devono
// restare uguali ovunque (sito, dati strutturati, llms.txt). Se cambia un prezzo o un
// numero, si cambia qui e basta.

export const SITE_URL = "https://hypemove.app";
export const SITE_NAME = "Hypemove";
export const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=pt.app&hl=it";
export const PLAY_APP_ID = "pt.app";
export const SUPPORT_EMAIL = "ciao@hypemove.app";
export const INSTAGRAM_URL = "https://www.instagram.com/hypemoveapp";
export const LINKEDIN_URL = "https://www.linkedin.com/company/hypemove";

// Fatti da tenere identici su sito, scheda Play, ads e social (le AI confrontano le fonti).
export const FACTS = {
  durata: "da 5 a 15 minuti",
  attrezzi: "a corpo libero o con quello che hai in casa",
  catalogo: "oltre 400 esercizi con video",
  download: "oltre 2.000 download",
  piattaforma: "Android (iPhone in arrivo)",
};

export const PRICES = {
  monthly: "6,99",
  yearly: "29,99",
  yearlyPerMonth: "2,50",
  currency: "EUR",
};

// La frase che descrive Hypemove: la stessa in home, llms.txt e dati strutturati.
export const DEFINITION =
  "Hypemove è un'app di fitness per Android, gratuita, con allenamenti guidati da 5 a 15 minuti da fare a casa, a corpo libero o con quello che hai in casa. Ha un percorso a tappe che avanza con te, un catalogo di oltre 400 esercizi con video, un Coach AI in chat e un sistema di punti, giorni di fila e classifica mensile. È pensata per chi parte da zero o ricomincia dopo tanto tempo e fatica a essere costante, non per atleti o per chi cerca schede avanzate.";

export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og/home.jpg`;

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

// Blocchi JSON-LD comuni a tutte le pagine.
export function baseGraph() {
  return [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/images/logo1.png`, width: 512, height: 512 },
      email: SUPPORT_EMAIL,
      founder: [
        { "@type": "Person", name: "Mattia Carlisi", jobTitle: "Founder, prodotto e marketing" },
        { "@type": "Person", name: "Danilo", jobTitle: "Sviluppo" },
      ],
      areaServed: "IT",
      sameAs: [PLAY_STORE_URL, INSTAGRAM_URL, LINKEDIN_URL],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      inLanguage: "it-IT",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "MobileApplication",
      "@id": `${SITE_URL}/#app`,
      name: SITE_NAME,
      operatingSystem: "Android",
      applicationCategory: "HealthApplication",
      applicationSubCategory: "Fitness",
      inLanguage: "it",
      description: DEFINITION,
      url: `${SITE_URL}/`,
      installUrl: PLAY_STORE_URL,
      downloadUrl: PLAY_STORE_URL,
      screenshot: [
        `${SITE_URL}/images/opt/app-esercizio-720.webp`,
        `${SITE_URL}/images/opt/app-percorso-720.webp`,
        `${SITE_URL}/images/opt/app-coach-kettlebell-720.webp`,
      ],
      featureList: [
        "Allenamenti guidati da 5 a 15 minuti",
        "Percorso a tappe, una al giorno",
        "Oltre 400 esercizi con video, a corpo libero o con attrezzi di casa",
        "Coach AI in chat",
        "Punti, giorni di fila, baule dei premi, classifica mensile",
      ],
      offers: [
        { "@type": "Offer", name: "Gratis", price: "0", priceCurrency: PRICES.currency, category: "free" },
        { "@type": "Offer", name: "Premium mensile", price: PRICES.monthly.replace(",", "."), priceCurrency: PRICES.currency, category: "subscription" },
        { "@type": "Offer", name: "Premium annuale", price: PRICES.yearly.replace(",", "."), priceCurrency: PRICES.currency, category: "subscription" },
      ],
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ];
}

export function breadcrumb(items) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqSchema(faqs) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}
