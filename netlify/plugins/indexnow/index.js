// Plugin Netlify locale: dopo ogni pubblicazione riuscita avvisa Bing via IndexNow
// delle sole pagine nuove o modificate (confronta la sitemap appena pubblicata con quella
// che era online prima della build). Niente chiavi segrete: la chiave IndexNow è pubblica.
const fs = require("node:fs/promises");
const path = require("node:path");

const SITE_URL = "https://hypemove.app";
const HOST = "hypemove.app";

function parse(xml) {
  const out = new Map();
  for (const m of xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)) out.set(m[1], m[2]);
  return out;
}

module.exports = {
  async onPreBuild({ utils }) {
    // Sitemap attualmente online: serve per capire cosa cambia con questa pubblicazione.
    try {
      const response = await fetch(`${SITE_URL}/sitemap.xml`, { headers: { "cache-control": "no-cache" } });
      const xml = response.ok ? await response.text() : "";
      await fs.writeFile(path.join(process.cwd(), ".sitemap-before.xml"), xml, "utf8");
    } catch (error) {
      console.log(`IndexNow: sitemap precedente non letta (${error.message}), invierò tutto.`);
    }
  },
  async onSuccess({ constants }) {
    if (process.env.CONTEXT && process.env.CONTEXT !== "production") {
      console.log(`IndexNow: contesto ${process.env.CONTEXT}, non invio.`);
      return;
    }
    try {
      const key = (await fs.readFile(path.join(process.cwd(), ".indexnow-key"), "utf8")).trim();
      const after = parse(await fs.readFile(path.join(constants.PUBLISH_DIR, "sitemap.xml"), "utf8"));
      let before = new Map();
      try { before = parse(await fs.readFile(path.join(process.cwd(), ".sitemap-before.xml"), "utf8")); } catch {}
      const changed = [...after.entries()].filter(([url, lastmod]) => before.get(url) !== lastmod).map(([url]) => url);
      if (!changed.length) {
        console.log("IndexNow: nessuna pagina nuova o modificata.");
        return;
      }
      const response = await fetch("https://api.indexnow.org/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ host: HOST, key, keyLocation: `${SITE_URL}/${key}.txt`, urlList: changed }),
      });
      console.log(`IndexNow: inviate ${changed.length} pagine, risposta ${response.status}.`);
      changed.forEach((url) => console.log(`  ${url}`));
    } catch (error) {
      console.log(`IndexNow: invio saltato (${error.message}).`);
    }
  },
};
