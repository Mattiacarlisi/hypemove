// Avvisa Bing (e gli altri motori che usano IndexNow) delle pagine nuove o cambiate.
// La chiave è in .indexnow-key e deve esistere anche come file pubblico /<chiave>.txt.
// Uso:
//   node scripts/indexnow.mjs                 → invia tutte le pagine della sitemap in dist/
//   node scripts/indexnow.mjs /prezzi /guide  → invia solo quelle
// Parte in automatico dopo ogni pubblicazione riuscita (netlify/plugins/indexnow), che invia
// soltanto le pagine nuove o con data modificata rispetto alla sitemap pubblicata prima.
import fs from "node:fs/promises";
import path from "node:path";

const SITE_URL = "https://hypemove.app";
const HOST = "hypemove.app";

export async function readKey(root = process.cwd()) {
  return (await fs.readFile(path.join(root, ".indexnow-key"), "utf8")).trim();
}

export function urlsFromSitemap(xml) {
  return [...xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)].map((m) => ({ url: m[1], lastmod: m[2] }));
}

export async function submit(urls, key) {
  if (!urls.length) return { status: "niente da inviare" };
  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key, keyLocation: `${SITE_URL}/${key}.txt`, urlList: urls }),
  });
  return { status: response.status, count: urls.length };
}

// Esecuzione diretta da riga di comando
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"))) {
  const key = await readKey();
  const args = process.argv.slice(2);
  let urls;
  if (args.length) {
    urls = args.map((p) => (p.startsWith("http") ? p : `${SITE_URL}${p.startsWith("/") ? p : `/${p}`}`));
  } else {
    const xml = await fs.readFile(path.resolve("dist/sitemap.xml"), "utf8");
    urls = urlsFromSitemap(xml).map((item) => item.url);
  }
  const result = await submit(urls, key);
  console.log(`IndexNow: ${result.count ?? 0} URL, risposta ${result.status} (200/202 = accettato)`);
}
