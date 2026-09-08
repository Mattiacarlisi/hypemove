// Genera le versioni ottimizzate delle immagini del sito (WebP, più misure).
// Sorgenti: assets-src/images/*.png (originali: restano nel repo ma NON vengono pubblicati).
// Uscita:   public/images/opt/<nome>-<larghezza>.webp
// Uso:      node scripts/optimize-images.mjs
// Da rilanciare ogni volta che si aggiunge o cambia un'immagine in public/images.
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = path.resolve("assets-src/images");
const OUT = path.resolve("public/images/opt");

// Ogni voce: file sorgente → larghezze da produrre. Le foto delle guide sono 1536 px;
// gli screenshot dell'app sono 1080 px e vengono mostrati piccoli.
const PHOTOS = {
  "homeworkout.png": [480, 800, 1200],
  "WOD1.png": [480, 800, 1200],
  "WOD2.png": [480, 800, 1200],
  "WOD3.png": [480, 800, 1200],
  "workout.png": [480, 800, 1200],
  "benefici-camminata-bosco.png": [480, 800, 1200],
};
const SCREENS = {
  "roadmap.png": [320, 640],
  "WorkoutDetails.png": [320, 640],
  "Search.png": [320, 640],
  
};

await fs.mkdir(OUT, { recursive: true });

async function convert(file, widths, opts) {
  const input = path.join(SRC, file);
  const base = path.parse(file).name.toLowerCase().replace(/\s+/g, "-");
  for (const w of widths) {
    const out = path.join(OUT, `${base}-${w}.webp`);
    await sharp(input).resize({ width: w, withoutEnlargement: true }).webp(opts).toFile(out);
    const size = (await fs.stat(out)).size;
    console.log(`${path.basename(out)}  ${(size / 1024).toFixed(0)} KB`);
  }
}

for (const [file, widths] of Object.entries(PHOTOS)) await convert(file, widths, { quality: 78 });
for (const [file, widths] of Object.entries(SCREENS)) await convert(file, widths, { quality: 84, alphaQuality: 90 });

// apple-touch-icon dal logo
await sharp(path.resolve("public/images/logo1.png")).resize(180, 180).png().toFile(path.resolve("public/apple-touch-icon.png"));
console.log("apple-touch-icon.png ok");
