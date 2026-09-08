// Genera le immagini di anteprima (Open Graph, 1200x630) che compaiono quando si condivide
// un link del sito su WhatsApp, LinkedIn, ecc. Una per pagina principale, con i caratteri del sito.
// Uso: node scripts/og-images.mjs   (serve la rete per Google Fonts)
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const OUT = path.resolve("public/images/og");
await fs.mkdir(OUT, { recursive: true });

const cards = [
  { name: "home", kicker: "App fitness per Android · Gratis", title: "Torna a muoverti.<br><em>Questa volta per davvero.</em>", sub: "Allenamenti da 5 a 15 minuti a casa, un percorso a tappe e un coach che si adatta a te." },
  { name: "prezzi", kicker: "Prezzi", title: "Gratis per iniziare.<br><em>Premium se vuoi di più.</em>", sub: "6,99 € al mese o 29,99 € l'anno. Si disdice da Google Play quando vuoi." },
  { name: "coach-ai", kicker: "Coach AI", title: "Un coach che ti ascolta<br><em>e cambia il programma.</em>", sub: "Gli scrivi quanto tempo hai e cosa hai in casa. Lui sistema l'allenamento di oggi." },
  { name: "chi-siamo", kicker: "Chi siamo", title: "Due persone, un'app<br><em>costruita in pubblico.</em>", sub: "Mattia Carlisi e Danilo. Hypemove nasce in Italia per chi fatica a essere costante." },
  { name: "confronti", kicker: "Confronti", title: "Hypemove e le altre app.<br><em>Senza giri di parole.</em>", sub: "Nike Training Club, Seven, Freeletics: per chi è meglio l'una e per chi l'altra." },
  { name: "guide", kicker: "Guide", title: "Per chi vuole capire<br><em>prima di iniziare.</em>", sub: "Costanza, mini workout, ricominciare da zero, allenamento a casa." },
];

const page = await (await chromium.launch()).newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
for (const card of cards) {
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Alumni+Sans:wght@800&family=Nunito:wght@700;800&display=swap">
  <style>
    body{margin:0;width:1200px;height:630px;background:#FFF1E3;font-family:Nunito,sans-serif;color:#171512;position:relative;overflow:hidden}
    .wrap{position:absolute;inset:0;padding:64px 72px;display:flex;flex-direction:column;justify-content:space-between}
    .logo{display:flex;align-items:center;gap:14px;font-family:"Alumni Sans";font-weight:800;font-size:44px;letter-spacing:.02em}
    .logo i{width:56px;height:56px;border-radius:14px;background:#F27B0C;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-style:normal;font-size:40px}
    .k{font-size:22px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#F27B0C}
    h1{font-family:"Alumni Sans";font-weight:800;font-size:112px;line-height:.9;margin:14px 0 22px;letter-spacing:-.005em}
    h1 em{font-style:normal;color:#F27B0C}
    p{font-size:30px;margin:0;max-width:26ch;color:#5A554B;font-weight:700;line-height:1.3}
    .bar{position:absolute;right:0;top:0;bottom:0;width:18px;background:#F27B0C}
  </style></head><body><div class="bar"></div><div class="wrap">
    <div class="logo"><i>H</i>Hypemove</div>
    <div><div class="k">${card.kicker}</div><h1>${card.title}</h1><p>${card.sub}</p></div>
  </div></body></html>`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(OUT, `${card.name}.jpg`), type: "jpeg", quality: 82 });
  console.log(`og/${card.name}.jpg`);
}
await page.context().browser().close();
