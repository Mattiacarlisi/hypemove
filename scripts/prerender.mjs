import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = process.cwd();
const distIndexPath = path.join(projectRoot, "dist", "index.html");
const distServerEntryPath = path.join(projectRoot, "dist-server", "entry-server.js");

const routes = [
  {
    path: "/",
    outputPath: distIndexPath,
    title: "Hypemove | App per allenamento a casa da 5, 10 e 15 minuti",
    description:
      "Hypemove è l'app fitness per allenarti a casa con workout guidati da 5, 10 e 15 minuti. Ideale per dimagrire, tonificare e restare costante.",
    canonical: "https://www.hypemove.app/",
  },
  {
    path: "/app-fitness-principianti",
    outputPath: path.join(projectRoot, "dist", "app-fitness-principianti", "index.html"),
    title: "App fitness per principianti | Hypemove",
    description:
      "Cerchi un'app fitness per principianti? Hypemove ti aiuta a iniziare con workout semplici, guidati e sostenibili, pensati per chi parte da zero.",
    canonical: "https://www.hypemove.app/app-fitness-principianti",
  },
  {
    path: "/workout-10-minuti-casa",
    outputPath: path.join(projectRoot, "dist", "workout-10-minuti-casa", "index.html"),
    title: "Workout 10 minuti a casa | Allenamento semplice per chi ha poco tempo | Hypemove",
    description:
      "Cerchi un workout di 10 minuti a casa? Scopri un allenamento semplice, guidato e realistico per chi ha poco tempo e vuole rimettersi in moto.",
    canonical: "https://www.hypemove.app/workout-10-minuti-casa",
  },
  {
    path: "/mini-workout-efficaci",
    outputPath: path.join(projectRoot, "dist", "mini-workout-efficaci", "index.html"),
    title: "I mini workout sono efficaci? Cosa dice davvero la realtà | Hypemove",
    description:
      "I mini workout da 5 o 10 minuti funzionano davvero? Scopri quando sono efficaci, per chi lo sono e perché spesso battono i programmi perfetti mai iniziati.",
    canonical: "https://www.hypemove.app/mini-workout-efficaci",
  },
];

const { render } = await import(pathToFileURL(distServerEntryPath).href);

const templateHtml = await fs.readFile(distIndexPath, "utf8");

if (!templateHtml.includes('<div id="root"></div>')) {
  throw new Error('Impossibile trovare <div id="root"></div> in dist/index.html');
}

function applySeo(html, route) {
  const htmlWithMeta = html
    .replace(/<title>.*?<\/title>/, `<title>${route.title}</title>`)
    .replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${route.canonical}" />`)
    .replace(
      /<meta\s+name="description"[\s\S]*?content="[^"]*"[\s\S]*?\/>/,
      `<meta\n      name="description"\n      content="${route.description}"\n    />`
    )
    .replace(
      /<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/,
      `<meta property="og:url" content="${route.canonical}" />`
    )
    .replace(
      /<meta\s+property="og:title"[\s\S]*?content="[^"]*"[\s\S]*?\/>/,
      `<meta\n      property="og:title"\n      content="${route.title}"\n    />`
    )
    .replace(
      /<meta\s+property="og:description"[\s\S]*?content="[^"]*"[\s\S]*?\/>/,
      `<meta\n      property="og:description"\n      content="${route.description}"\n    />`
    )
    .replace(
      /<meta\s+name="twitter:title"[\s\S]*?content="[^"]*"[\s\S]*?\/>/,
      `<meta\n      name="twitter:title"\n      content="${route.title}"\n    />`
    )
    .replace(
      /<meta\s+name="twitter:description"[\s\S]*?content="[^"]*"[\s\S]*?\/>/,
      `<meta\n      name="twitter:description"\n      content="${route.description}"\n    />`
    );

  return htmlWithMeta.replace(
    /<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/,
    (match, jsonText) => {
      const data = JSON.parse(jsonText);
      const webPage = data["@graph"]?.find((item) => item["@type"] === "WebPage");

      if (!webPage) return match;

      webPage["@id"] = `${route.canonical}#webpage`;
      webPage.url = route.canonical;
      webPage.name = route.title;
      webPage.description = route.description;

      return `<script type="application/ld+json">\n      ${JSON.stringify(data, null, 8)}\n    </script>`;
    }
  );
}

for (const route of routes) {
  const appHtml = render(route.path);
  const rootMarkup = `<div id="root">${appHtml}</div>`;
  const prerenderedHtml = applySeo(templateHtml.replace('<div id="root"></div>', rootMarkup), route);

  await fs.mkdir(path.dirname(route.outputPath), { recursive: true });
  await fs.writeFile(route.outputPath, prerenderedHtml, "utf8");
  console.log(`Prerender completato per ${route.path}`);
}
await fs.rm(path.join(projectRoot, "dist-server"), { recursive: true, force: true });
