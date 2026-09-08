// Controllo pre-pubblicazione del sito generato in dist/. Blocca la build se trova gli errori
// che ci hanno già fregato una volta: caratteri rotti nei titoli, indirizzi con www,
// canonical sbagliati, pagine senza H1, immagini mancanti, JSON-LD non valido.
// Uso: node scripts/check-site.mjs   (parte da solo alla fine di `npm run build`)
import fs from "node:fs/promises";
import path from "node:path";

const dist = path.resolve("dist");
const SITE_URL = "https://hypemove.app";
const errors = [];
const warnings = [];

async function walk(dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "internal" || entry.name === "legal" || entry.name === "auth" || entry.name === "assets") continue;
      out.push(...(await walk(full)));
    } else if (entry.name === "index.html" || entry.name === "404.html") out.push(full);
  }
  return out;
}

const files = await walk(dist);
for (const file of files) {
  const rel = path.relative(dist, file).replace(/\\/g, "/");
  const html = await fs.readFile(file, "utf8");
  const routePath = rel === "index.html" ? "/" : rel === "404.html" ? "/404" : `/${rel.replace(/\/index\.html$/, "")}`;

  const title = html.match(/<title>(.*?)<\/title>/)?.[1] ?? "";
  const description = html.match(/<meta name="description" content="(.*?)"/)?.[1] ?? "";
  const canonical = html.match(/<link rel="canonical" href="(.*?)"/)?.[1] ?? "";

  if (!title) errors.push(`${rel}: manca <title>`);
  if (/\w\?\w|\s\?\s/.test(title) || /\w\?\w|\s\?\s/.test(description)) errors.push(`${rel}: punto interrogativo sospetto (codifica rotta) in title/description`);
  if (html.includes("www.hypemove.app")) errors.push(`${rel}: contiene www.hypemove.app`);
  if (html.includes("—")) warnings.push(`${rel}: contiene un trattino lungo (—), vietato nei copy`);
  if (title.length > 70) warnings.push(`${rel}: title lungo (${title.length} caratteri)`);
  if (description && (description.length < 50 || description.length > 170)) warnings.push(`${rel}: description di ${description.length} caratteri`);

  const isPrivate = /name="robots" content="noindex/.test(html);
  if (!isPrivate && routePath !== "/404") {
    const expected = `${SITE_URL}${routePath === "/" ? "/" : routePath}`;
    if (canonical !== expected) errors.push(`${rel}: canonical "${canonical}" invece di "${expected}"`);
  }

  const h1s = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1s !== 1 && !isPrivate) errors.push(`${rel}: ${h1s} H1 (ne serve esattamente uno)`);

  for (const block of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(block[1]); } catch (error) { errors.push(`${rel}: JSON-LD non valido (${error.message})`); }
  }

  for (const match of html.matchAll(/(?:src|href)="(\/images\/[^"]+)"/g)) {
    const asset = decodeURIComponent(match[1].split(" ")[0]);
    try {
      const stat = await fs.stat(path.join(dist, asset));
      if (stat.size > 300 * 1024 && !asset.startsWith("/images/app/") && !asset.startsWith("/images/play/")) warnings.push(`${rel}: ${asset} pesa ${(stat.size / 1024).toFixed(0)} KB`);
    } catch {
      errors.push(`${rel}: immagine mancante ${asset}`);
    }
  }
  for (const match of html.matchAll(/srcset="([^"]+)"/g)) {
    for (const candidate of match[1].split(",")) {
      const asset = candidate.trim().split(" ")[0];
      try { await fs.stat(path.join(dist, asset)); } catch { errors.push(`${rel}: immagine mancante nel srcset ${asset}`); }
    }
  }
}

for (const required of ["sitemap.xml", "llms.txt", "robots.txt", "404.html", "_redirects"]) {
  try { await fs.stat(path.join(dist, required)); } catch { errors.push(`manca dist/${required}`); }
}

for (const line of warnings) console.warn(`avviso  ${line}`);
for (const line of errors) console.error(`ERRORE  ${line}`);
console.log(`Controllate ${files.length} pagine: ${errors.length} errori, ${warnings.length} avvisi.`);
if (errors.length) process.exit(1);
