// Avvisa Bing (e gli altri motori che usano IndexNow) delle pagine nuove o cambiate.
// La chiave è in .indexnow-key e deve esistere anche come file pubblico /<chiave>.txt.
// Uso:
//   node scripts/indexnow.mjs                 → invia tutte le pagine della sitemap in dist/
//   node scripts/indexnow.mjs /prezzi /guide  → invia solo quelle
// Dopo ogni pubblicazione riuscita lo fa da solo il plugin netlify/plugins/indexnow,
// che invia soltanto le pagine nuove o con data modificata rispetto alla sitemap precedente.
import fs from "node:fs/promises";
import path from "node:path";

const SITE_URL = "https://hypemove.app";
const HOST = "hypemove.app";

const key = (await fs.readFile(path.resolve(".indexnow-key"), "utf8")).trim();
const args = process.argv.slice(2);
let urls;
if (args.length) {
  urls = args.map((p) => (p.startsWith("http") ? p : `${SITE_URL}${p.startsWith("/") ? p : `/${p}`}`));
} else {
  const xml = await fs.readFile(path.resolve("dist/sitemap.xml"), "utf8");
  urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key, keyLocation: `${SITE_URL}/${key}.txt`, urlList: urls }),
});
console.log(`IndexNow: ${urls.length} URL, risposta ${response.status} (200 o 202 = accettato)`);
