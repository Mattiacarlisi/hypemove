// Ritaglia gli screenshot della scheda Play (didascalia in alto + telefono) tenendo solo il telefono,
// e produce le versioni WebP usate dal sito.
// Sorgenti: assets-src/play/s1.png … s6.png (1080x1920, scaricati dalla scheda Play).
// Uscita:   assets-src/app/<nome>.png (master ritagliato, non pubblicato) + public/images/opt/app-<nome>-<w>.webp
// Uso:      node scripts/crop-play-screenshots.mjs
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = path.resolve("assets-src/play");
const MASTER = path.resolve("assets-src/app");
const OUT = path.resolve("public/images/opt");

// Ordine della scheda Play all'8/9/2026.
const NAMES = {
  "s1.png": "classifica",
  "s2.png": "coach-kettlebell",
  "s3.png": "coach-calorie",
  "s4.png": "esercizio",
  "s5.png": "progressi",
  "s6.png": "percorso",
};

await fs.mkdir(MASTER, { recursive: true });
await fs.mkdir(OUT, { recursive: true });

for (const [file, name] of Object.entries(NAMES)) {
  const input = path.join(SRC, file);
  // La didascalia occupa i primi ~380 px: si taglia e poi si rifila il bianco residuo.
  const master = path.join(MASTER, `${name}.png`);
  const cut = await sharp(input).extract({ left: 0, top: 380, width: 1080, height: 1540 }).png().toBuffer();
  await sharp(cut).trim({ threshold: 60 }).png().toFile(master);
  const { width, height } = await sharp(master).metadata();
  for (const w of [360, 720]) {
    const out = path.join(OUT, `app-${name}-${w}.webp`);
    await sharp(master).resize({ width: w }).webp({ quality: 84 }).toFile(out);
    console.log(`${path.basename(out)} ${((await fs.stat(out)).size / 1024).toFixed(0)} KB (master ${width}x${height})`);
  }
}
