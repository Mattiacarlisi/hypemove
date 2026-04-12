import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = process.cwd();
const distIndexPath = path.join(projectRoot, "dist", "index.html");
const distServerEntryPath = path.join(projectRoot, "dist-server", "entry-server.js");

const { render } = await import(pathToFileURL(distServerEntryPath).href);
const appHtml = render();
const rootMarkup = `<div id="root">${appHtml}</div>`;

const indexHtml = await fs.readFile(distIndexPath, "utf8");

if (!indexHtml.includes('<div id="root"></div>')) {
  throw new Error('Impossibile trovare <div id="root"></div> in dist/index.html');
}

const prerenderedHtml = indexHtml.replace('<div id="root"></div>', rootMarkup);

await fs.writeFile(distIndexPath, prerenderedHtml, "utf8");
await fs.rm(path.join(projectRoot, "dist-server"), { recursive: true, force: true });

console.log("Prerender completato per /");
