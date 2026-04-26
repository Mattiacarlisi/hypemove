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
      "Hypemove ? l'app fitness per allenarti a casa con workout guidati da 5, 10 e 15 minuti. Ideale per dimagrire, tonificare e restare costante.",
    canonical: "https://www.hypemove.app/",
    ogType: "website",
    ogImage: "https://www.hypemove.app/images/logo1.png",
    ogImageAlt: "Hypemove - app per allenamento a casa guidato",
  },
  {
    path: "/app-fitness-principianti",
    outputPath: path.join(projectRoot, "dist", "app-fitness-principianti", "index.html"),
    title: "App fitness per principianti: una guida semplice per chi parte da zero | Hypemove",
    description:
      "Scopri perché Hypemove è un’app fitness adatta ai principianti: percorso guidato, workout brevi, progressione graduale e meno attrito per iniziare davvero.",
    canonical: "https://www.hypemove.app/app-fitness-principianti",
    ogType: "article",
    ogImage: "https://www.hypemove.app/images/logo1.png",
    ogImageAlt: "Hypemove - app fitness per principianti",
  },
  {
    path: "/allenamento-a-casa",
    outputPath: path.join(projectRoot, "dist", "allenamento-a-casa", "index.html"),
    title: "Allenamento a casa: guida semplice per iniziare davvero | Hypemove",
    description:
      "Vuoi iniziare ad allenarti a casa? Scopri come farlo in modo semplice, realistico e sostenibile, anche se hai poco tempo o parti da zero.",
    canonical: "https://www.hypemove.app/allenamento-a-casa",
    ogType: "article",
    ogImage: "https://www.hypemove.app/images/logo1.png",
    ogImageAlt: "Hypemove - guida allenamento a casa",
  },
  {
    path: "/benefici-camminata-tempo",
    outputPath: path.join(projectRoot, "dist", "benefici-camminata-tempo", "index.html"),
    title: "Benefici della camminata: cosa succede al corpo dopo 10, 20, 30 e 60 minuti | Hypemove",
    description:
      "Scopri i benefici della camminata e cosa succede al corpo dopo 10, 20, 30 e 60 minuti. Una guida pratica per capire come camminare meglio e rendere la passeggiata più efficace.",
    canonical: "https://www.hypemove.app/benefici-camminata-tempo",
    ogType: "article",
    ogImage: "https://www.hypemove.app/images/benefici-camminata-bosco.png",
    ogImageAlt: "Donna che cammina nel bosco durante una passeggiata",
  },
  {
    path: "/come-essere-costanti-nell-allenamento",
    outputPath: path.join(projectRoot, "dist", "come-essere-costanti-nell-allenamento", "index.html"),
    title: "Come essere costanti nell?allenamento (senza vivere di motivazione) | Hypemove",
    description:
      "Fai fatica a essere costante con l?allenamento? Scopri strategie realistiche per smettere di iniziare e mollare dopo pochi giorni.",
    canonical: "https://www.hypemove.app/come-essere-costanti-nell-allenamento",
    ogType: "article",
    ogImage: "https://www.hypemove.app/images/logo1.png",
    ogImageAlt: "Hypemove - costanza nell'allenamento",
  },
  {
    path: "/guide",
    outputPath: path.join(projectRoot, "dist", "guide", "index.html"),
    title: "Guide utili per allenarti a casa | Hypemove",
    description:
      "Guide semplici e realistiche per iniziare ad allenarti a casa, creare costanza e scegliere workout brevi adatti al tuo obiettivo.",
    canonical: "https://www.hypemove.app/guide",
    ogType: "website",
    ogImage: "https://www.hypemove.app/images/logo1.png",
    ogImageAlt: "Hypemove - guide utili per allenarti a casa",
  },
  {
    path: "/workout-10-minuti-casa",
    outputPath: path.join(projectRoot, "dist", "workout-10-minuti-casa", "index.html"),
    title: "Workout 10 minuti a casa | Allenamento semplice per chi ha poco tempo | Hypemove",
    description:
      "Cerchi un workout di 10 minuti a casa? Scopri un allenamento semplice, guidato e realistico per chi ha poco tempo e vuole rimettersi in moto.",
    canonical: "https://www.hypemove.app/workout-10-minuti-casa",
    ogType: "article",
    ogImage: "https://www.hypemove.app/images/logo1.png",
    ogImageAlt: "Hypemove - workout 10 minuti a casa",
  },
  {
    path: "/mini-workout-efficaci",
    outputPath: path.join(projectRoot, "dist", "mini-workout-efficaci", "index.html"),
    title: "I mini workout sono efficaci? Cosa dice davvero la realt? | Hypemove",
    description:
      "I mini workout da 5 o 10 minuti funzionano davvero? Scopri quando sono efficaci, per chi lo sono e perch? spesso battono i programmi perfetti mai iniziati.",
    canonical: "https://www.hypemove.app/mini-workout-efficaci",
    ogType: "article",
    ogImage: "https://www.hypemove.app/images/logo1.png",
    ogImageAlt: "Hypemove - mini workout efficaci",
  },
  {
    path: "/unsubscribe",
    outputPath: path.join(projectRoot, "dist", "unsubscribe", "index.html"),
    title: "Disiscrizione email | Hypemove",
    description:
      "Gestisci la disiscrizione dalle email automatiche di promemoria e recupero abitudine di Hypemove.",
    canonical: "https://www.hypemove.app/unsubscribe",
    ogType: "website",
    ogImage: "https://www.hypemove.app/images/logo1.png",
    ogImageAlt: "Hypemove - disiscrizione email",
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
      /<meta\s+property="og:type"\s+content="[^"]*"\s*\/>/,
      `<meta property="og:type" content="${route.ogType ?? "website"}" />`
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
      /<meta\s+property="og:image"\s+content="[^"]*"\s*\/>/,
      `<meta property="og:image" content="${route.ogImage}" />`
    )
    .replace(
      /<meta\s+property="og:image:secure_url"\s+content="[^"]*"\s*\/>/,
      `<meta property="og:image:secure_url" content="${route.ogImage}" />`
    )
    .replace(
      /<meta\s+property="og:image:alt"[\s\S]*?content="[^"]*"[\s\S]*?\/>/,
      `<meta\n      property="og:image:alt"\n      content="${route.ogImageAlt}"\n    />`
    )
    .replace(
      /<meta\s+name="twitter:title"[\s\S]*?content="[^"]*"[\s\S]*?\/>/,
      `<meta\n      name="twitter:title"\n      content="${route.title}"\n    />`
    )
    .replace(
      /<meta\s+name="twitter:description"[\s\S]*?content="[^"]*"[\s\S]*?\/>/,
      `<meta\n      name="twitter:description"\n      content="${route.description}"\n    />`
    )
    .replace(
      /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/>/,
      `<meta name="twitter:image" content="${route.ogImage}" />`
    )
    .replace(
      /<meta\s+name="twitter:image:alt"[\s\S]*?content="[^"]*"[\s\S]*?\/>/,
      `<meta\n      name="twitter:image:alt"\n      content="${route.ogImageAlt}"\n    />`
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
