// Genera il sito statico: per ogni pagina in src/entry-server.jsx scrive l'HTML completo
// (testa SEO + dati strutturati + corpo), e in più sitemap.xml e llms.txt.
// Le pagine senza `hydrate` non includono JavaScript: sono HTML puro.
// Uso: parte da `npm run build`, dopo vite build (client) e vite build --ssr (server).
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = process.cwd();
const dist = path.join(projectRoot, "dist");
const templatePath = path.join(dist, "index.html");
const serverEntry = path.join(projectRoot, "dist-server", "entry-server.js");

const SITE_URL = "https://hypemove.app";
const SITE_NAME = "Hypemove";
const INDEXABLE = "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1";

const { render, routes, baseGraph, DEFINITION, PRICES, PLAY_STORE_URL, TESTFLIGHT_URL } = await import(pathToFileURL(serverEntry).href);

const template = await fs.readFile(templatePath, "utf8");
if (!template.includes("<!--SEO-->") || !template.includes('<div id="root"></div>')) {
  throw new Error("index.html deve contenere <!--SEO--> e <div id=\"root\"></div>");
}

const esc = (value = "") => String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function headFor(route) {
  const { meta } = route;
  const url = `${SITE_URL}${route.path === "/" ? "/" : route.path}`;
  const title = meta.title.includes(SITE_NAME) ? meta.title : `${meta.title} | ${SITE_NAME}`;
  const robots = meta.robots ?? INDEXABLE;
  const image = meta.ogImage ?? `${SITE_URL}/images/og/home.jpg`;
  const graph = [...(baseGraph ? baseGraph() : []), ...(meta.jsonld ?? [])];
  const lines = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    `<meta name="robots" content="${esc(robots)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="${meta.type ?? "website"}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:locale" content="it_IT" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(meta.ogImageAlt ?? meta.title)}" />`,
    meta.published ? `<meta property="article:published_time" content="${meta.published}" />` : "",
    meta.modified ? `<meta property="article:modified_time" content="${meta.modified}" />` : "",
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(meta.title)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    graph.length ? `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph })}</script>` : "",
  ];
  return lines.filter(Boolean).join("\n    ");
}

function outputPathFor(route) {
  if (route.output) return path.join(dist, route.output);
  if (route.path === "/") return path.join(dist, "index.html");
  return path.join(dist, route.path.replace(/^\//, ""), "index.html");
}

const written = [];
for (const route of routes) {
  const body = render(route.path);
  let html = template
    .replace("<!--SEO-->", headFor(route))
    .replace(/\n\s*<title>Hypemove<\/title>/, "")
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`)
    .replace("<body>", `<body data-page="${esc(route.path)}">`);
  if (!route.hydrate) {
    // Pagina statica: via il bundle e i preload, resta solo il CSS.
    html = html.replace(/\s*<script type="module"[^>]*><\/script>/g, "").replace(/\s*<link rel="modulepreload"[^>]*>/g, "");
  }
  const out = outputPathFor(route);
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.writeFile(out, html, "utf8");
  // Copia gemella "prezzi.html" accanto a "prezzi/index.html": Netlify serve /prezzi da
  // prezzi.html con 200, senza il 301 verso /prezzi/ che scatta sulle sole cartelle.
  if (route.path !== "/" && !route.output) {
    await fs.writeFile(path.join(dist, `${route.path.replace(/^\//, "")}.html`), html, "utf8");
  }
  written.push(route.path);
}
console.log(`Pagine generate: ${written.length}`);

// Sitemap: solo le pagine indicizzabili, con la data vera dell'ultima modifica.
const indexable = routes.filter((route) => !route.output && !(route.meta.robots ?? "").includes("noindex"));
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexable
  .map((route) => `  <url>\n    <loc>${SITE_URL}${route.path === "/" ? "/" : route.path}</loc>\n    <lastmod>${route.meta.modified ?? "2026-09-08"}</lastmod>\n  </url>`)
  .join("\n")}\n</urlset>\n`;
await fs.writeFile(path.join(dist, "sitemap.xml"), sitemap, "utf8");

// llms.txt: la scheda di Hypemove per i crawler delle AI.
const guides = indexable.filter((route) => route.meta.type === "article" && !route.path.startsWith("/confronti"));
const comparisons = indexable.filter((route) => route.path.startsWith("/confronti/"));
const llms = `# Hypemove

> ${DEFINITION ?? "Hypemove è un'app di fitness per Android con allenamenti guidati brevi da fare a casa."}
> Premium facoltativo: ${PRICES?.monthly ?? "6,99"} €/mese o ${PRICES?.yearly ?? "29,99"} €/anno, si disdice da Google Play.

Lingua: italiano. Sviluppata in Italia da Mattia Carlisi (chinesiologo e founder, scrive gli allenamenti) e Danilo (sviluppatore).
Non è per atleti, bodybuilder o chi cerca schede avanzate.

## Pagine principali
- [Home](${SITE_URL}/): cos'è, come funziona, prezzi, domande frequenti
- [Coach AI](${SITE_URL}/coach-ai): cosa fa il coach in chat, esempi, limiti del gratuito
- [Calorie da una foto](${SITE_URL}/calorie): il contacalorie dentro il coach, come funziona e quanto è preciso
- [Prezzi](${SITE_URL}/prezzi): gratis vs Premium, come si disdice
- [Chi siamo](${SITE_URL}/chi-siamo): chi la fa e perché
- [iPhone](${SITE_URL}/iphone): come si installa la versione di prova su iPhone
- [Google Play](${PLAY_STORE_URL ?? "https://play.google.com/store/apps/details?id=pt.app"}): scheda ufficiale dell'app, Android
- [TestFlight](${TESTFLIGHT_URL ?? "https://testflight.apple.com/join/S6ZexeTD"}): versione di prova per iPhone, non è ancora sull'App Store

## Confronti con altre app
${comparisons.map((route) => `- [${route.meta.title}](${SITE_URL}${route.path})`).join("\n")}

## Guide
${guides.map((route) => `- [${route.meta.title.replace(/ \| Hypemove$/, "")}](${SITE_URL}${route.path})`).join("\n")}
`;
await fs.writeFile(path.join(dist, "llms.txt"), llms, "utf8");

// llms-full.txt: tutto il testo delle pagine pubbliche, in un file solo, per i crawler delle AI.
const textOf = (html) => {
  const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? html;
  return main
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<(h1|h2|h3)[^>]*>/g, "\n\n## ")
    .replace(/<\/(p|li|h1|h2|h3|dd|summary)>/g, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
};
const fullParts = [];
for (const route of indexable) {
  const file = await fs.readFile(outputPathFor(route), "utf8");
  fullParts.push(`# ${route.meta.title}\nURL: ${SITE_URL}${route.path === "/" ? "/" : route.path}\n\n${textOf(file)}\n`);
}
await fs.writeFile(path.join(dist, "llms-full.txt"), `${llms}\n\n---\n\n${fullParts.join("\n\n---\n\n")}`, "utf8");

// feed.xml: le guide come feed RSS (aggregatori, lettori, e un segnale in più per i motori).
const escXml = (v) => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const feedItems = indexable
  .filter((route) => route.meta.type === "article")
  .sort((a, b) => (b.meta.published ?? "").localeCompare(a.meta.published ?? ""))
  .map((route) => `  <item>\n    <title>${escXml(route.meta.title)}</title>\n    <link>${SITE_URL}${route.path}</link>\n    <guid>${SITE_URL}${route.path}</guid>\n    <pubDate>${new Date(route.meta.published ?? route.meta.modified).toUTCString()}</pubDate>\n    <description>${escXml(route.meta.description)}</description>\n  </item>`);
const feed = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel>\n  <title>Hypemove, guide</title>\n  <link>${SITE_URL}/guide</link>\n  <description>Guide per allenarsi a casa, essere costanti e ricominciare da zero.</description>\n  <language>it-it</language>\n${feedItems.join("\n")}\n</channel></rss>\n`;
await fs.writeFile(path.join(dist, "feed.xml"), feed, "utf8");

// _redirects: una riga per ogni pagina, così Netlify serve /prezzi con 200 invece di
// rimandare a /prezzi/ con un 301 (che rompe canonical e link interni). In coda la 404 vera.
const rewrites = routes
  .filter((route) => route.path !== "/" && !route.output)
  .map((route) => `${route.path.padEnd(44)} ${route.path}/index.html   200!`);
const redirects = `# Generato da scripts/prerender.mjs: non modificare a mano.
/auth/callback                               /auth/callback.html   200
${rewrites.join("\n")}

# Tutto il resto: pagina 404 vera, con codice 404.
/*                                           /404.html             404
`;
await fs.writeFile(path.join(dist, "_redirects"), redirects, "utf8");

// Pulizia della build server
await fs.rm(path.join(projectRoot, "dist-server"), { recursive: true, force: true }).catch(() => {});
console.log("Sitemap e llms.txt scritti.");
