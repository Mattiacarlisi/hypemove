# Hypemove, sito pubblico (hypemove.app)

Sito statico generato con Vite + React + Tailwind. Le pagine pubbliche sono HTML puro
(niente JavaScript nel browser): React serve solo a generarle. Le uniche pagine con
JavaScript sono `/reset-password`, `/unsubscribe` e `/open`.

## Comandi
```bash
npm i
npm run dev        # sviluppo (Vite)
npm run build      # build completa: client → server → prerender → controlli
npm run preview    # anteprima locale di dist/
npm run images     # rigenera le immagini ottimizzate (WebP) da assets-src/
npm run og         # rigenera le immagini di anteprima per i social (public/images/og)
npm run check      # solo i controlli su dist/ (parte già alla fine di build)
npm run indexnow   # avvisa Bing di tutte le pagine (dopo un deploy); da solo lo fa il plugin Netlify per le pagine cambiate
```

## Dove sta cosa
- `src/site.js`: fatti e numeri del sito (prezzi, durata, catalogo, email, link). **Unico posto** da cambiare quando cambia un prezzo o un numero.
- `src/pages/`: una pagina per file. Ogni pagina esporta `meta` (titolo, descrizione, dati strutturati) che `scripts/prerender.mjs` usa per scrivere la testa HTML.
- `src/entry-server.jsx`: registro di tutte le pagine (percorso → componente → meta). Aggiungere qui una pagina nuova la fa comparire anche in sitemap e llms.txt.
- `src/data/guides.js`, `src/data/confronti.js`: contenuti delle guide e dei confronti.
- `src/components/Layout.jsx`: intestazione, footer, barra fissa su telefono, immagini responsive.
- `assets-src/`: immagini originali (non pubblicate). `public/images/opt/` contiene le versioni WebP generate.
- `scripts/check-site.mjs`: controlli pre-pubblicazione (codifica, dominio, canonical, H1, immagini, JSON-LD). Blocca la build se trova errori.
- `public/internal/`: dashboard interna (KPI, finance, email), non toccata dal prerender.

- `netlify/plugins/indexnow/`: dopo ogni pubblicazione riuscita avvisa Bing (IndexNow) delle pagine nuove o modificate. La chiave è in `.indexnow-key` e come file pubblico `/<chiave>.txt`.

## Regole
- Il dominio è `https://hypemove.app` senza www: mai scrivere `www.hypemove.app`.
- Niente trattini lunghi (—) nei testi.
- Le immagini nuove vanno in `assets-src/images/`, poi `npm run images`.
- Gli screenshot dell'app vengono dalla scheda Play (`assets-src/play/`), ritagliati da `scripts/crop-play-screenshots.mjs`.
