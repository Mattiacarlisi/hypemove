// Ritaglia gli screenshot della scheda Play (didascalia in alto + telefono su fondo bianco):
// tiene solo il telefono e rende TRASPARENTE il bianco intorno, così sul nero non resta l'alone.
// Sorgenti: assets-src/play/s1.png … s6.png (1080x1920, scaricati dalla scheda Play).
// Uscita:   assets-src/app/<nome>.png (master ritagliato, non pubblicato)
//           public/images/opt/app-<nome>-<w>.webp (con trasparenza, usati dal sito)
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

// Riempimento a partire dai bordi: ogni pixel quasi bianco raggiungibile dall'esterno diventa
// trasparente. Lo schermo bianco dentro la cornice non viene toccato perché la cornice lo chiude.
function cutout(data, width, height, threshold = 232) {
  const visited = new Uint8Array(width * height);
  const stack = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const i = y * width + x;
    if (visited[i]) return;
    const o = i * 4;
    if (data[o] < threshold || data[o + 1] < threshold || data[o + 2] < threshold) return;
    visited[i] = 1;
    stack.push(i);
  };
  for (let x = 0; x < width; x += 1) { push(x, 0); push(x, height - 1); }
  for (let y = 0; y < height; y += 1) { push(0, y); push(width - 1, y); }
  while (stack.length) {
    const i = stack.pop();
    const x = i % width;
    const y = (i - x) / width;
    data[i * 4 + 3] = 0;
    push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
  }
  // Bordo morbido: i pixel chiari adiacenti alla zona trasparente sfumano invece di tagliare netto.
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const i = y * width + x;
      if (visited[i]) continue;
      const o = i * 4;
      const lum = (data[o] + data[o + 1] + data[o + 2]) / 3;
      if (lum < 200) continue;
      const near = visited[i - 1] || visited[i + 1] || visited[i - width] || visited[i + width];
      if (near) data[o + 3] = Math.round(255 * Math.min(1, (255 - lum) / 55));
    }
  }
  return data;
}

await fs.mkdir(MASTER, { recursive: true });
await fs.mkdir(OUT, { recursive: true });

for (const [file, name] of Object.entries(NAMES)) {
  const input = path.join(SRC, file);
  // La didascalia occupa i primi ~380 px: si taglia, poi si rifila il bianco residuo.
  const cut = await sharp(input).extract({ left: 0, top: 380, width: 1080, height: 1540 }).png().toBuffer();
  const trimmed = await sharp(cut).trim({ threshold: 60 }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = trimmed.info;
  const data = cutout(Buffer.from(trimmed.data), width, height);
  const master = path.join(MASTER, `${name}.png`);
  await sharp(data, { raw: { width, height, channels: 4 } }).png().toFile(master);
  for (const w of [360, 720]) {
    const out = path.join(OUT, `app-${name}-${w}.webp`);
    await sharp(master).resize({ width: w }).webp({ quality: 84, alphaQuality: 90 }).toFile(out);
    console.log(`${path.basename(out)} ${((await fs.stat(out)).size / 1024).toFixed(0)} KB (master ${width}x${height})`);
  }
}
