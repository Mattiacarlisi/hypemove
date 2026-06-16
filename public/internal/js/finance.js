// ── DATA STORE ─────────────────────────────────────────────────────────────────
const INITIAL_DATA = [
  {id:1,  mese:"2025-06", dataEsatta:"2025-06-08", descrizione:"Abbonamento Trae.ai",      tipo:"Spesa",  categoria:"Abbonamenti Software", importo:-10,    chi:"Danilo", note:""},
  {id:2,  mese:"2025-06", dataEsatta:"2025-06-16", descrizione:"Abbonamento Quickmagick",  tipo:"Spesa",  categoria:"Abbonamenti Software", importo:-10,    chi:"Danilo", note:""},
  {id:3,  mese:"2025-07", dataEsatta:"2025-07-09", descrizione:"Green screen",             tipo:"Spesa",  categoria:"Attrezzatura",         importo:-140,   chi:"Mattia", note:""},
  {id:4,  mese:"2025-07", dataEsatta:"2025-06-08", descrizione:"Abbonamento Trae.ai",      tipo:"Spesa",  categoria:"Abbonamenti Software", importo:-10,    chi:"Danilo", note:""},
  {id:5,  mese:"2025-08", dataEsatta:"2025-08-19", descrizione:"Google Drive",             tipo:"Spesa",  categoria:"Abbonamenti Software", importo:-0.5,   chi:"Mattia", note:""},
  {id:6,  mese:"2025-08", dataEsatta:"2025-06-08", descrizione:"Abbonamento Trae.ai",      tipo:"Spesa",  categoria:"Abbonamenti Software", importo:-10,    chi:"Danilo", note:""},
  {id:7,  mese:"2025-09", dataEsatta:"2025-09-19", descrizione:"Google Drive",             tipo:"Spesa",  categoria:"Abbonamenti Software", importo:-0.5,   chi:"Mattia", note:""},
  {id:8,  mese:"2025-10", dataEsatta:"2025-10-19", descrizione:"Google Drive",             tipo:"Spesa",  categoria:"Abbonamenti Software", importo:-0.5,   chi:"Mattia", note:""},
  {id:9,  mese:"2025-10", dataEsatta:"2025-10-01", descrizione:"Google Play abbonamento",  tipo:"Spesa",  categoria:"Abbonamenti Software", importo:-20,    chi:"Danilo", note:""},
  {id:10, mese:"2025-11", dataEsatta:"2025-11-26", descrizione:"Abbonamento iOS Developer",tipo:"Spesa",  categoria:"Abbonamenti Software", importo:-99,    chi:"Danilo", note:""},
  {id:11, mese:"2025-11", dataEsatta:"2025-11-26", descrizione:"Google Drive",             tipo:"Spesa",  categoria:"Abbonamenti Software", importo:-1.99,  chi:"Mattia", note:""},
  {id:12, mese:"2025-12", dataEsatta:"2025-12-22", descrizione:"Podcast Imprestory video", tipo:"Spesa",  categoria:"Podcast & Contenuti",  importo:-70,    chi:"Mattia", note:""},
  {id:13, mese:"2025-12", dataEsatta:"2025-12-22", descrizione:"Google Drive",             tipo:"Spesa",  categoria:"Abbonamenti Software", importo:-1.99,  chi:"Mattia", note:""},
  {id:14, mese:"2026-01", dataEsatta:"2026-01-22", descrizione:"Google Drive",             tipo:"Spesa",  categoria:"Abbonamenti Software", importo:-1.99,  chi:"Mattia", note:""},
  {id:15, mese:"2026-02", dataEsatta:"2026-02-04", descrizione:"Primo test Meta ADS",      tipo:"Spesa",  categoria:"Marketing & ADS",      importo:-141.13,chi:"Mattia", note:""},
  {id:16, mese:"2026-02", dataEsatta:"2026-02-28", descrizione:"2° test Meta ADS",         tipo:"Spesa",  categoria:"Marketing & ADS",      importo:-88.27, chi:"Mattia", note:""},
  {id:17, mese:"2026-02", dataEsatta:"2026-02-22", descrizione:"Google Drive",             tipo:"Spesa",  categoria:"Abbonamenti Software", importo:-1.99,  chi:"Mattia", note:""},
  {id:18, mese:"2026-03", dataEsatta:"2026-03-22", descrizione:"Google Drive",             tipo:"Spesa",  categoria:"Abbonamenti Software", importo:-1.99,  chi:"Mattia", note:""},
  {id:19, mese:"2026-03", dataEsatta:"2026-02-28", descrizione:"3° test Meta ADS",         tipo:"Spesa",  categoria:"Marketing & ADS",      importo:-99.95, chi:"Mattia", note:""},
];

const INITIAL_CATS = {
  spesa:   ["Abbonamenti Software","Marketing & ADS","Attrezzatura","Podcast & Contenuti","Legale & Amministrativo","Hosting & Infrastruttura","Formazione","Altro"],
  entrata: ["Abbonamenti Utenti","Sponsorizzazioni","Consulenze","Vendita Prodotti","Grant & Finanziamenti","Altro"],
};

// ── FILE BACKUP ────────────────────────────────────────────────────────────────
const FILE_BACKUP_SUPPORTED = typeof window !== "undefined" && !!window.showSaveFilePicker;
let fileHandle = null;

async function idbOpen() {
  return new Promise((res, rej) => {
    const r = indexedDB.open("hm_finance", 1);
    r.onupgradeneeded = e => e.target.result.createObjectStore("kv");
    r.onsuccess = e => res(e.target.result);
    r.onerror = rej;
  });
}
async function idbGet(key) {
  const db = await idbOpen();
  return new Promise(res => {
    const r = db.transaction("kv").objectStore("kv").get(key);
    r.onsuccess = e => res(e.target.result ?? null);
    r.onerror = () => res(null);
  });
}
async function idbSet(key, val) {
  const db = await idbOpen();
  return new Promise(res => {
    const r = db.transaction("kv", "readwrite").objectStore("kv").put(val, key);
    r.onsuccess = () => res();
    r.onerror = () => res();
  });
}

async function initFileBackup() {
  if (!FILE_BACKUP_SUPPORTED) return;
  const handle = await idbGet("fileHandle");
  if (!handle) return;
  state.fileHandleStored = true;
  try {
    const perm = await handle.queryPermission({ mode: "readwrite" });
    if (perm === "granted") {
      fileHandle = handle;
      const file = await fileHandle.getFile();
      const data = JSON.parse(await file.text());
      if (data.movimenti && data.categorie) {
        state.movimenti = data.movimenti;
        state.categorie = data.categorie;
        if (data.nextId) state.nextId = data.nextId;
        localStorage.setItem("hm_movimenti", JSON.stringify(state.movimenti));
        localStorage.setItem("hm_categorie", JSON.stringify(state.categorie));
        localStorage.setItem("hm_nextId", String(state.nextId));
      }
    }
  } catch(e) {
    console.warn("File backup init:", e);
  }
}

async function setupFileBackup() {
  if (!FILE_BACKUP_SUPPORTED) return;
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: "hypemove-finance-backup.json",
      types: [{ description: "JSON", accept: { "application/json": [".json"] } }],
    });
    fileHandle = handle;
    await idbSet("fileHandle", handle);
    state.fileHandleStored = true;
    await writeToFile();
    showToast("Backup su file attivo ✓", "success");
    render();
  } catch(e) {
    if (e.name !== "AbortError") showToast("Errore configurazione backup.", "error");
  }
}

async function reconnectFileBackup() {
  if (!FILE_BACKUP_SUPPORTED) return;
  try {
    const handle = await idbGet("fileHandle");
    if (!handle) { setupFileBackup(); return; }
    const perm = await handle.requestPermission({ mode: "readwrite" });
    if (perm === "granted") {
      fileHandle = handle;
      const file = await fileHandle.getFile();
      const data = JSON.parse(await file.text());
      if (data.movimenti && data.categorie) {
        state.movimenti = data.movimenti;
        state.categorie = data.categorie;
        if (data.nextId) state.nextId = data.nextId;
      }
      showToast("Backup riconnesso ✓", "success");
      render();
    }
  } catch(e) {
    if (e.name !== "AbortError") showToast("Errore riconnessione.", "error");
  }
}

async function writeToFile() {
  if (!fileHandle) return;
  try {
    const w = await fileHandle.createWritable();
    await w.write(JSON.stringify({ movimenti: state.movimenti, categorie: state.categorie, nextId: state.nextId }, null, 2));
    await w.close();
  } catch(e) {
    console.warn("Errore scrittura file:", e);
    fileHandle = null;
    render();
  }
}

// ── STATE ──────────────────────────────────────────────────────────────────────
let state = {
  page: "dashboard",
  movimenti: JSON.parse(localStorage.getItem("hm_movimenti") || "null") || INITIAL_DATA,
  categorie: JSON.parse(localStorage.getItem("hm_categorie") || "null") || INITIAL_CATS,
  nextId: parseInt(localStorage.getItem("hm_nextId") || "20"),
  // filtri
  periodoFilter: "tutto",
  annoFilter: "tutto",
  meseFilterStart: "",
  meseFilterEnd: "",
  tipoFilter: "tutto",
  catFilter: "tutto",
  chiFilter: "tutto",
  // tasse
  tasseModo: "percentuale",
  tassePerc: 26,
  tasseEuro: 0,
  // modal
  modal: null,
  editItem: null,
  deleteId: null,
  // form
  form: {},
  // cat editor
  newCatSpesa: "",
  newCatEntrata: "",
  // toast
  toast: null,
  // file backup
  fileHandleStored: false,
  // grafico
  chartTipo: "barre",
  chartShowSpese: true,
  chartShowEntrate: true,
};

function save() {
  localStorage.setItem("hm_movimenti", JSON.stringify(state.movimenti));
  localStorage.setItem("hm_categorie", JSON.stringify(state.categorie));
  localStorage.setItem("hm_nextId", String(state.nextId));
  writeToFile();
}

function setState(patch) {
  Object.assign(state, patch);
  render();
}

// ── COMPUTED ───────────────────────────────────────────────────────────────────
function filteredMovimenti() {
  let m = state.movimenti;

  if (state.periodoFilter === "anno" && state.annoFilter !== "tutto") {
    m = m.filter(x => x.mese.startsWith(state.annoFilter));
  } else if (state.periodoFilter === "range") {
    if (state.meseFilterStart) m = m.filter(x => x.mese >= state.meseFilterStart);
    if (state.meseFilterEnd)   m = m.filter(x => x.mese <= state.meseFilterEnd);
  }

  if (state.tipoFilter !== "tutto") m = m.filter(x => x.tipo === state.tipoFilter);
  if (state.catFilter  !== "tutto") m = m.filter(x => x.categoria === state.catFilter);
  if (state.chiFilter  !== "tutto") m = m.filter(x => x.chi === state.chiFilter);

  return m;
}

function totali(movimenti) {
  const spese    = movimenti.filter(x => x.tipo === "Spesa").reduce((s,x)  => s + x.importo, 0);
  const entrate  = movimenti.filter(x => x.tipo === "Entrata").reduce((s,x)=> s + x.importo, 0);
  const saldo    = spese + entrate;
  const pagMattia = movimenti.filter(x => x.chi === "Mattia").reduce((s,x) => s + x.importo, 0);
  const pagDanilo = movimenti.filter(x => x.chi === "Danilo").reduce((s,x) => s + x.importo, 0);
  const quota = saldo / 2;
  const saldoMattia = pagMattia - quota;
  const saldoDanilo = pagDanilo - quota;
  return { spese, entrate, saldo, pagMattia, pagDanilo, quota, saldoMattia, saldoDanilo };
}

function tasseSuEntrate(entrate) {
  if (state.tasseModo === "percentuale") {
    return entrate * (state.tassePerc / 100);
  } else {
    return state.tasseEuro;
  }
}

function mesiUnici(movimenti) {
  return [...new Set(movimenti.map(x => x.mese))].sort();
}

function anniUnici() {
  return [...new Set(state.movimenti.map(x => x.mese.slice(0,4)))].sort();
}

function meseLabelIT(mese) {
  const [y, m] = mese.split("-");
  const mesi = ["Gen","Feb","Mar","Apr","Mag","Giu","Lug","Ago","Set","Ott","Nov","Dic"];
  return `${mesi[parseInt(m)-1]} ${y}`;
}

function fmtEuro(n) {
  if (n === 0) return "€ 0,00";
  const sign = n < 0 ? "−" : "+";
  return `${sign} € ${Math.abs(n).toFixed(2).replace(".", ",")}`;
}
function fmtEuroPlain(n) {
  return `€ ${Math.abs(n).toFixed(2).replace(".", ",")}`;
}

// ── ACTIONS ───────────────────────────────────────────────────────────────────
function openAdd() {
  setState({ modal: "add", form: { mese: "", dataEsatta: "", descrizione: "", tipo: "Spesa", categoria: "", importo: "", chi: "Mattia", note: "" }});
}
function openEdit(item) {
  setState({ modal: "edit", editItem: item, form: { ...item, importo: Math.abs(item.importo) }});
}
function openDelete(id) {
  setState({ modal: "delete", deleteId: id });
}
function closeModal() { setState({ modal: null, editItem: null, deleteId: null }); }

function saveMovimento() {
  const f = state.form;
  if (!f.descrizione || !f.importo || !f.mese || !f.categoria) {
    showToast("Compila tutti i campi obbligatori.", "error"); return;
  }
  const importoNum = parseFloat(f.importo) * (f.tipo === "Spesa" ? -1 : 1);

  if (state.modal === "add") {
    const nuovoMese = f.mese;
    const nuovoItem = { ...f, id: state.nextId++, importo: importoNum, mese: nuovoMese, dataEsatta: f.dataEsatta || nuovoMese+"-01" };
    state.movimenti = [...state.movimenti, nuovoItem];
  } else {
    state.movimenti = state.movimenti.map(x => x.id === state.editItem.id
      ? { ...f, id: x.id, importo: importoNum }
      : x);
  }
  save();
  closeModal();
  showToast("Salvato ✓", "success");
}

function deleteMovimento() {
  state.movimenti = state.movimenti.filter(x => x.id !== state.deleteId);
  save();
  closeModal();
  showToast("Eliminato.", "success");
}

function showToast(msg, type="success") {
  setState({ toast: { msg, type }});
  setTimeout(() => setState({ toast: null }), 2800);
}

function updateForm(key, val) {
  state.form = { ...state.form, [key]: val };
  if (key === "tipo") {
    state.form.categoria = "";
    render();
  }
}

function addCat(tipo, nome) {
  if (!nome.trim()) return;
  const key = tipo === "Spesa" ? "spesa" : "entrata";
  if (state.categorie[key].includes(nome.trim())) return;
  state.categorie = { ...state.categorie, [key]: [...state.categorie[key], nome.trim()] };
  save();
  setState({ newCatSpesa: tipo === "Spesa" ? "" : state.newCatSpesa, newCatEntrata: tipo === "Entrata" ? "" : state.newCatEntrata });
}

function delCat(tipo, nome) {
  const key = tipo === "Spesa" ? "spesa" : "entrata";
  state.categorie = { ...state.categorie, [key]: state.categorie[key].filter(c => c !== nome) };
  save();
  render();
}

// ── RENDER ────────────────────────────────────────────────────────────────────
function render() {
  document.getElementById("app").innerHTML = html();
  attachEvents();
}

function renderFileBackupBanner() {
  if (!FILE_BACKUP_SUPPORTED) {
    return `<div style="background:var(--red-bg);border:1px solid var(--red);border-radius:var(--radius);padding:10px 16px;margin-bottom:16px;font-size:12px;color:var(--red)">
      ⚠️ Il tuo browser non supporta il backup automatico su file. Usa Chrome o Edge per questa funzione.
    </div>`;
  }
  if (fileHandle) return "";
  return `
  <div style="background:var(--amber-bg);border:1px solid var(--amber);border-radius:var(--radius);padding:11px 16px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
    <span style="font-size:13px;color:var(--amber)">⚠️ Backup su file non attivo — i dati sono solo nel browser</span>
    <div style="display:flex;gap:8px;flex-shrink:0">
      ${state.fileHandleStored
        ? `<button class="btn" style="background:var(--amber);color:#000;font-size:12px;padding:6px 14px" id="btnReconnectFile">Riconnetti file</button>`
        : `<button class="btn" style="background:var(--amber);color:#000;font-size:12px;padding:6px 14px" id="btnSetupFile">Attiva backup su file</button>`
      }
    </div>
  </div>`;
}

function html() {
  return `
    ${renderSidebar()}
    <div class="main">
      ${renderFileBackupBanner()}
      ${renderPage()}
    </div>
    ${state.modal ? renderModal() : ""}
    ${state.toast ? `<div class="toast ${state.toast.type}">${state.toast.msg}</div>` : ""}
  `;
}

function renderSidebar() {
  const nav = (id, icon, label) => `
    <button class="nav-item ${state.page===id?"active":""}" data-nav="${id}">
      <span class="icon">${icon}</span>${label}
    </button>`;
  return `
  <div class="sidebar">
    <a href="index.html" class="sidebar-logo">
      <div class="logo-mark">Hype<span>move</span></div>
      <div class="logo-sub">Finance</div>
    </a>
    <nav class="nav">
      <div class="nav-section">Overview</div>
      ${nav("dashboard","📊","Dashboard")}
      ${nav("registro","📋","Registro")}
      <div class="nav-section" style="margin-top:10px">Analisi</div>
      ${nav("riepilogo","📅","Riepilogo")}
      ${nav("categorie","🏷️","Categorie")}
      <div class="nav-section" style="margin-top:10px">Config</div>
      ${nav("impostazioni","⚙️","Impostazioni")}
    </nav>
    <div style="padding:14px 20px;border-top:1px solid var(--border);font-size:11px;color:var(--muted)">
      Mattia & Danilo · 50/50
    </div>
  </div>`;
}

function renderPage() {
  if (state.page === "dashboard")    return renderDashboard();
  if (state.page === "registro")     return renderRegistro();
  if (state.page === "riepilogo")    return renderRiepilogo();
  if (state.page === "categorie")    return renderCategorieView();
  if (state.page === "impostazioni") return renderImpostazioni();
  return "";
}

// ── GRAFICO MENSILE ───────────────────────────────────────────────────────────
function renderGraficoCard(fm) {
  const mesiNomi = ["Gen","Feb","Mar","Apr","Mag","Giu","Lug","Ago","Set","Ott","Nov","Dic"];
  const mesi = mesiUnici(fm);
  const tipo = state.chartTipo || "barre";
  const showS = state.chartShowSpese !== false;
  const showE = state.chartShowEntrate !== false;

  if (mesi.length === 0) return `
  <div class="card">
    <div class="card-title">Grafico mensile</div>
    <div class="empty"><div class="empty-icon">📊</div><div class="empty-text">Nessun dato nel periodo</div></div>
  </div>`;

  const rows = mesi.map(mese => {
    const mm = fm.filter(x => x.mese === mese);
    const t = totali(mm);
    const [yr, mo] = mese.split("-");
    return { label: mesiNomi[parseInt(mo)-1] + " '" + yr.slice(2), spese: Math.abs(t.spese), entrate: t.entrate };
  });

  const W = 520, H = 250, padL = 54, padR = 18, padT = 16, padB = 38;
  const chartW = W - padL - padR, chartH = H - padT - padB;
  const n = rows.length;
  const maxVal = Math.max(...rows.map(r => Math.max(showS ? r.spese : 0, showE ? r.entrate : 0)), 1);
  const exp = Math.pow(10, Math.floor(Math.log10(maxVal)));
  const yMax = Math.ceil(maxVal / (exp * 0.5)) * (exp * 0.5) || 50;
  const yScale = v => padT + chartH * (1 - Math.min(v, yMax) / yMax);
  const xCenter = i => padL + (i + 0.5) * (chartW / n);

  const fmtLbl = v => v >= 1000 ? (v/1000).toFixed(1).replace(/\.0$/,"")+"k" : Math.round(v).toString();

  const yGrid = Array.from({length: 5}, (_, i) => {
    const val = (yMax / 4) * i;
    const y = yScale(val);
    return `
    <line x1="${padL}" y1="${y.toFixed(1)}" x2="${W-padR}" y2="${y.toFixed(1)}" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
    <text x="${padL-7}" y="${(y+3.5).toFixed(1)}" text-anchor="end" fill="#555577" font-size="10" font-family="JetBrains Mono,monospace">€${fmtLbl(val)}</text>`;
  }).join("");

  const xLabels = rows.map((r, i) =>
    `<text x="${xCenter(i).toFixed(1)}" y="${(H-padB+15).toFixed(1)}" text-anchor="middle" fill="#555577" font-size="${n>9?8:9}" font-family="Inter,sans-serif">${r.label}</text>`
  ).join("");

  let inner = "";

  if (tipo === "barre") {
    const hasEntrate = showE && rows.some(r => r.entrate > 0);
    const bothVisible = showS && hasEntrate;
    const groupW = chartW / n;
    const barW = bothVisible ? Math.max(4, Math.min(20, groupW * 0.36)) : Math.max(8, Math.min(40, groupW * 0.62));
    const gap = bothVisible ? barW * 0.35 : 0;

    inner = `<defs>
      <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f87171" stop-opacity="1"/><stop offset="100%" stop-color="#f87171" stop-opacity="0.3"/></linearGradient>
      <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4ade80" stop-opacity="1"/><stop offset="100%" stop-color="#4ade80" stop-opacity="0.3"/></linearGradient>
    </defs>
    ${rows.map((r, i) => {
      const cx = xCenter(i);
      const xS = bothVisible ? cx - gap/2 - barW : cx - barW/2;
      const xE = bothVisible ? cx + gap/2 : cx - barW/2;
      const hS = (r.spese / yMax) * chartH;
      const hE = (r.entrate / yMax) * chartH;
      const yS = yScale(r.spese), yE = yScale(r.entrate);
      return `
      ${showS && r.spese > 0 ? `
        <rect x="${xS.toFixed(1)}" y="${yS.toFixed(1)}" width="${barW.toFixed(1)}" height="${hS.toFixed(1)}" rx="3" fill="url(#gS)"/>
        ${hS > 22 ? `<text x="${(xS+barW/2).toFixed(1)}" y="${(yS-5).toFixed(1)}" text-anchor="middle" fill="#f87171" font-size="9" font-weight="600" font-family="JetBrains Mono,monospace">€${fmtLbl(r.spese)}</text>` : ""}
      ` : ""}
      ${showE && r.entrate > 0 ? `
        <rect x="${xE.toFixed(1)}" y="${yE.toFixed(1)}" width="${barW.toFixed(1)}" height="${hE.toFixed(1)}" rx="3" fill="url(#gE)"/>
        ${hE > 22 ? `<text x="${(xE+barW/2).toFixed(1)}" y="${(yE-5).toFixed(1)}" text-anchor="middle" fill="#4ade80" font-size="9" font-weight="600" font-family="JetBrains Mono,monospace">€${fmtLbl(r.entrate)}</text>` : ""}
      ` : ""}`;
    }).join("")}`;
  } else {
    const smooth = pts => pts.map((p,i) => {
      if (i===0) return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
      const cp = ((pts[i-1].x + p.x)/2).toFixed(1);
      return `C ${cp} ${pts[i-1].y.toFixed(1)}, ${cp} ${p.y.toFixed(1)}, ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    }).join(" ");
    const area = pts => `${smooth(pts)} L ${pts[pts.length-1].x.toFixed(1)} ${H-padB} L ${pts[0].x.toFixed(1)} ${H-padB} Z`;

    const spPts = rows.map((r, i) => ({ x: xCenter(i), y: yScale(r.spese) }));
    const enPts = rows.map((r, i) => ({ x: xCenter(i), y: yScale(r.entrate) })).filter((_, i) => rows[i].entrate > 0);

    inner = `<defs>
      <linearGradient id="gSA" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f87171" stop-opacity="0.2"/><stop offset="100%" stop-color="#f87171" stop-opacity="0"/></linearGradient>
      <linearGradient id="gEA" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4ade80" stop-opacity="0.2"/><stop offset="100%" stop-color="#4ade80" stop-opacity="0"/></linearGradient>
    </defs>
    ${showS ? `
      <path d="${area(spPts)}" fill="url(#gSA)"/>
      <path d="${smooth(spPts)}" fill="none" stroke="#f87171" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      ${spPts.map(p => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.5" fill="#0a0a0f" stroke="#f87171" stroke-width="2"/>`).join("")}
    ` : ""}
    ${showE && enPts.length > 1 ? `
      <path d="${area(enPts)}" fill="url(#gEA)"/>
      <path d="${smooth(enPts)}" fill="none" stroke="#4ade80" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      ${enPts.map(p => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.5" fill="#0a0a0f" stroke="#4ade80" stroke-width="2"/>`).join("")}
    ` : ""}`;
  }

  return `
  <div class="card">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <span class="card-title" style="margin-bottom:0">Grafico mensile</span>
      <div style="display:flex;align-items:center;gap:14px">
        <span style="display:flex;gap:6px;font-size:11px">
          <button class="filter-btn ${showS?"active":""}" data-chart-series="spese" style="padding:4px 10px;font-size:11px;display:flex;align-items:center;gap:5px">
            <span style="width:8px;height:8px;border-radius:2px;background:#f87171;display:inline-block;opacity:${showS?1:0.35}"></span>Spese
          </button>
          <button class="filter-btn ${showE?"active":""}" data-chart-series="entrate" style="padding:4px 10px;font-size:11px;display:flex;align-items:center;gap:5px">
            <span style="width:8px;height:2px;background:#4ade80;display:inline-block;opacity:${showE?1:0.35}"></span>Entrate
          </button>
        </span>
        <div style="display:flex;gap:4px">
          <button class="filter-btn ${tipo==="barre"?"active":""}" data-chart-tipo="barre" style="padding:4px 10px;font-size:11px">Barre</button>
          <button class="filter-btn ${tipo==="linee"?"active":""}" data-chart-tipo="linee" style="padding:4px 10px;font-size:11px">Linee</button>
        </div>
      </div>
    </div>
    <svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block">
      ${yGrid}
      <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${H-padB}" stroke="#2a2a3a" stroke-width="1"/>
      <line x1="${padL}" y1="${H-padB}" x2="${W-padR}" y2="${H-padB}" stroke="#2a2a3a" stroke-width="1"/>
      ${inner}
      ${xLabels}
    </svg>
  </div>`;
}

// ── ANDAMENTO MENSILE CARD ────────────────────────────────────────────────────
function renderAndamentoCard(fm) {
  const mesi = mesiUnici(fm);
  if (mesi.length === 0) return `
  <div class="card">
    <div class="card-title">Andamento mensile</div>
    <div class="empty"><div class="empty-icon">📅</div><div class="empty-text">Nessun dato nel periodo</div></div>
  </div>`;

  const rows = mesi.map(mese => {
    const mm = fm.filter(x => x.mese === mese);
    return { mese, t: totali(mm) };
  });

  return `
  <div class="card">
    <div class="card-title">Andamento mensile</div>
    <div class="table-wrap">
    <table class="riepilogo-table">
      <thead><tr>
        <th style="text-align:left">Mese</th>
        <th>Entrate</th>
        <th>Spese</th>
        <th>Saldo</th>
      </tr></thead>
      <tbody>
        ${rows.map(({mese, t}) => `<tr>
          <td style="text-align:left;color:var(--text)">${meseLabelIT(mese)}</td>
          <td style="color:var(--mattia)">${fmtEuro(t.entrate)}</td>
          <td style="color:var(--red)">${fmtEuro(t.spese)}</td>
          <td style="color:${t.saldo>=0?"var(--mattia)":"var(--red)"};font-weight:700">${fmtEuro(t.saldo)}</td>
        </tr>`).join("")}
        ${rows.length > 1 ? (() => { const tt = totali(fm); return `<tr style="border-top:1px solid var(--border2)">
          <td style="text-align:left;font-weight:700">Totale</td>
          <td style="color:var(--mattia);font-weight:700">${fmtEuro(tt.entrate)}</td>
          <td style="color:var(--red);font-weight:700">${fmtEuro(tt.spese)}</td>
          <td style="color:${tt.saldo>=0?"var(--mattia)":"var(--red)"};font-weight:700">${fmtEuro(tt.saldo)}</td>
        </tr>`; })() : ""}
      </tbody>
    </table>
    </div>
  </div>`;
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function renderDashboard() {
  const fm = filteredMovimenti();
  const t  = totali(fm);
  const header = `
  <div class="page-header">
    <div class="page-title">Dashboard</div>
    <div class="page-sub">Panoramica finanziaria · ${fm.length} movimenti nel periodo selezionato</div>
  </div>
  ${renderFiltriBar()}`;

  if (state.periodoFilter === "tutto") {
    return `${header}
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-label">Totale Spese</div>
      <div class="stat-value red">${fmtEuroPlain(t.spese)}</div>
      <div class="stat-sub">${fm.filter(x=>x.tipo==="Spesa").length} voci</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Totale Entrate</div>
      <div class="stat-value green">${fmtEuroPlain(t.entrate)}</div>
      <div class="stat-sub">${fm.filter(x=>x.tipo==="Entrata").length} voci</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Saldo Netto</div>
      <div class="stat-value ${t.saldo>=0?"green":"red"}">${fmtEuro(t.saldo)}</div>
      <div class="stat-sub">Entrate − Spese</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Quota a testa (50%)</div>
      <div class="stat-value amber">${fmtEuroPlain(t.quota)}</div>
      <div class="stat-sub">Di cui spese/entrate</div>
    </div>
  </div>
  <div class="grid-2">
    ${renderSaldoCard(t)}
    ${renderTasseCard(t)}
  </div>
  ${renderSpeseCatCard(fm)}`;
  }

  const numMesi = mesiUnici(fm).length || 1;
  const burnRate = Math.abs(t.spese) / numMesi;
  const copertura = t.entrate > 0 && Math.abs(t.spese) > 0
    ? Math.min((t.entrate / Math.abs(t.spese)) * 100, 100)
    : t.entrate > 0 ? 100 : 0;

  return `${header}
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-label">Totale Spese</div>
      <div class="stat-value red">${fmtEuroPlain(t.spese)}</div>
      <div class="stat-sub">${fm.filter(x=>x.tipo==="Spesa").length} voci</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Totale Entrate</div>
      <div class="stat-value green">${fmtEuroPlain(t.entrate)}</div>
      <div class="stat-sub">${fm.filter(x=>x.tipo==="Entrata").length} voci</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Saldo Netto</div>
      <div class="stat-value ${t.saldo>=0?"green":"red"}">${fmtEuro(t.saldo)}</div>
      <div class="stat-sub">Entrate − Spese</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Burn Rate medio</div>
      <div class="stat-value red">${fmtEuroPlain(burnRate)}</div>
      <div class="stat-sub">Spese/mese · ${numMesi} mes${numMesi===1?"e":"i"}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Copertura entrate</div>
      <div class="stat-value ${copertura>=80?"green":copertura>=40?"amber":"red"}">${copertura.toFixed(0)}%</div>
      <div class="stat-sub">Entrate su spese totali</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Spese ricorrenti</div>
      ${(() => {
        const ricorrenti = fm.filter(x=>x.tipo==="Spesa"&&x.categoria==="Abbonamenti Software").reduce((s,x)=>s+Math.abs(x.importo),0);
        const perc = Math.abs(t.spese)>0 ? (ricorrenti/Math.abs(t.spese)*100).toFixed(0) : 0;
        return `<div class="stat-value purple">${fmtEuroPlain(ricorrenti)}</div>
      <div class="stat-sub">Abbonamenti · ${perc}% del totale</div>`;
      })()}
    </div>
    <div class="stat-card">
      <div class="stat-label">Spese una tantum</div>
      ${(() => {
        const cats = ["Marketing & ADS","Attrezzatura","Podcast & Contenuti","Legale & Amministrativo","Formazione"];
        const onetoff = fm.filter(x=>x.tipo==="Spesa"&&cats.includes(x.categoria)).reduce((s,x)=>s+Math.abs(x.importo),0);
        const perc = Math.abs(t.spese)>0 ? (onetoff/Math.abs(t.spese)*100).toFixed(0) : 0;
        return `<div class="stat-value amber">${fmtEuroPlain(onetoff)}</div>
      <div class="stat-sub">Investimenti · ${perc}% del totale</div>`;
      })()}
    </div>
    <div class="stat-card">
      <div class="stat-label">N° mesi attivi</div>
      <div class="stat-value purple">${numMesi}</div>
      <div class="stat-sub">Mesi con movimenti</div>
    </div>
  </div>
  <div class="grid-2">
    ${renderAndamentoCard(fm)}
    ${renderGraficoCard(fm)}
  </div>
  ${renderSpeseCatCard(fm)}`;
}

function renderFiltriBar() {
  const anni = anniUnici();
  return `
  <div class="filter-bar" style="margin-bottom:20px">
    <span class="filter-label">Periodo:</span>
    <button class="filter-btn ${state.periodoFilter==="tutto"?"active":""}" data-filter-periodo="tutto">Tutto</button>
    <button class="filter-btn ${state.periodoFilter==="anno"?"active":""}" data-filter-periodo="anno">Per anno</button>
    <button class="filter-btn ${state.periodoFilter==="range"?"active":""}" data-filter-periodo="range">Intervallo</button>

    ${state.periodoFilter==="anno" ? `
      <div class="filter-sep"></div>
      <select class="filter-select" id="annoSelect">
        <option value="tutto" ${state.annoFilter==="tutto"?"selected":""}>Tutti gli anni</option>
        ${anni.map(a=>`<option value="${a}" ${state.annoFilter===a?"selected":""}>${a}</option>`).join("")}
      </select>` : ""}

    ${state.periodoFilter==="range" ? `
      <div class="filter-sep"></div>
      <span class="filter-label">Da:</span>
      <input type="month" class="form-input" style="padding:4px 10px;font-size:12px;width:140px" id="meseStart" value="${state.meseFilterStart}">
      <span class="filter-label">A:</span>
      <input type="month" class="form-input" style="padding:4px 10px;font-size:12px;width:140px" id="meseEnd" value="${state.meseFilterEnd}">
    ` : ""}
  </div>`;
}

function renderSaldoCard(t) {
  const chi_deve = t.saldoMattia > 0 ? "Mattia" : "Danilo";
  const chi_riceve = t.saldoMattia > 0 ? "Danilo" : "Mattia";
  const diff = Math.abs(t.saldoMattia);

  return `
  <div class="card">
    <div class="card-title">Saldo tra soci</div>
    <table class="saldo-table">
      <thead><tr>
        <th>Socio</th>
        <th>Pagato/Incassato</th>
        <th>Quota 50%</th>
        <th>Saldo</th>
        <th>Stato</th>
      </tr></thead>
      <tbody>
        <tr>
          <td class="name-mattia">Mattia</td>
          <td class="mono">${fmtEuro(t.pagMattia)}</td>
          <td class="mono">${fmtEuro(t.quota)}</td>
          <td class="mono" style="color:${t.saldoMattia<=0?"var(--mattia)":"var(--red)"}">${fmtEuro(t.saldoMattia)}</td>
          <td><span class="badge ${t.saldoMattia<=0?"green":"red"}">${t.saldoMattia<=0?"✓ Creditore":"↑ Debitore"}</span></td>
        </tr>
        <tr>
          <td class="name-danilo">Danilo</td>
          <td class="mono">${fmtEuro(t.pagDanilo)}</td>
          <td class="mono">${fmtEuro(t.quota)}</td>
          <td class="mono" style="color:${t.saldoDanilo<=0?"var(--mattia)":"var(--red)"}">${fmtEuro(t.saldoDanilo)}</td>
          <td><span class="badge ${t.saldoDanilo<=0?"green":"red"}">${t.saldoDanilo<=0?"✓ Creditore":"↑ Debitore"}</span></td>
        </tr>
      </tbody>
    </table>
    <div class="verdetto ${diff===0?"":"credito"}">
      ${diff === 0
        ? "✅ Siete perfettamente in pari."
        : `<span class="name-${chi_deve.toLowerCase()}">${chi_deve}</span> deve a <span class="name-${chi_riceve.toLowerCase()}">${chi_riceve}</span>`}
      ${diff > 0 ? `<span class="verdetto-amount">${fmtEuroPlain(diff)}</span>` : ""}
    </div>
  </div>`;
}

function renderTasseCard(t) {
  const entr = Math.abs(t.entrate);
  const tasse = tasseSuEntrate(entr);
  const netto = entr - tasse;

  return `
  <div class="tasse-box">
    <div class="card-title">🧾 Stima Tasse su Entrate</div>
    <div class="tasse-toggle">
      <button class="toggle-btn ${state.tasseModo==="percentuale"?"active":""}" data-tasse-modo="percentuale">% Percentuale</button>
      <button class="toggle-btn ${state.tasseModo==="fisso"?"active":""}" data-tasse-modo="fisso">€ Importo fisso</button>
    </div>
    <div class="tasse-input-row">
      ${state.tasseModo === "percentuale"
        ? `<input class="tasse-input" type="number" min="0" max="100" step="0.5" id="tassePerc" value="${state.tassePerc}">
           <span class="tasse-input-label">% sulle entrate (modifica fino a quando non hai la cifra esatta)</span>`
        : `<input class="tasse-input" type="number" min="0" step="0.01" id="tasseEuro" value="${state.tasseEuro}">
           <span class="tasse-input-label">€ importo tasse già definitivo</span>`
      }
    </div>
    <div class="tasse-result">
      <div class="tasse-item">
        <div class="tasse-item-label">Entrate lorde</div>
        <div class="tasse-item-value" style="color:var(--mattia)">${fmtEuroPlain(entr)}</div>
      </div>
      <div class="tasse-item">
        <div class="tasse-item-label">${state.tasseModo==="percentuale"?`Tasse (${state.tassePerc}%)`:"Tasse (fisso)"}</div>
        <div class="tasse-item-value">${fmtEuroPlain(tasse)}</div>
      </div>
      <div class="tasse-item">
        <div class="tasse-item-label">Entrate nette</div>
        <div class="tasse-item-value" style="color:var(--mattia)">${fmtEuroPlain(netto)}</div>
      </div>
      <div class="tasse-item">
        <div class="tasse-item-label">Saldo finale (netto)</div>
        <div class="tasse-item-value" style="color:${(t.saldo+tasse)>=0?"var(--mattia)":"var(--red)"}">
          ${fmtEuro(t.saldo - (state.tasseModo==="percentuale" ? entr*(state.tassePerc/100) : state.tasseEuro))}
        </div>
      </div>
    </div>
    ${entr === 0 ? `<div style="font-size:11px;color:var(--muted);margin-top:10px">Nessuna entrata nel periodo selezionato.</div>` : ""}
  </div>`;
}

function renderSpeseCatCard(fm) {
  const byCat = {};
  fm.filter(x=>x.tipo==="Spesa").forEach(x => {
    byCat[x.categoria] = (byCat[x.categoria]||0) + Math.abs(x.importo);
  });
  const total = Object.values(byCat).reduce((s,v)=>s+v,0);
  const sorted = Object.entries(byCat).sort((a,b)=>b[1]-a[1]);

  if (sorted.length === 0) return `<div class="card"><div class="card-title">Spese per categoria</div><div class="empty"><div class="empty-icon">📂</div><div class="empty-text">Nessuna spesa nel periodo</div></div></div>`;

  return `
  <div class="card">
    <div class="card-title">Spese per categoria</div>
    ${sorted.map(([cat, val]) => `
      <div class="month-bar-wrap" style="margin-bottom:10px">
        <div class="month-bar-label">
          <span>${cat}</span>
          <span style="font-family:var(--mono);font-size:12px;color:var(--red)">${fmtEuroPlain(val)}</span>
        </div>
        <div class="month-bar-track">
          <div class="month-bar-fill spesa" style="width:${total>0?(val/total*100).toFixed(1):0}%"></div>
        </div>
      </div>`).join("")}
  </div>`;
}

// ── REGISTRO ──────────────────────────────────────────────────────────────────
function renderRegistro() {
  const fm = filteredMovimenti().slice().sort((a,b) => b.mese.localeCompare(a.mese) || b.dataEsatta.localeCompare(a.dataEsatta));
  const allCats = [...state.categorie.spesa, ...state.categorie.entrata];

  return `
  <div class="page-header" style="display:flex;align-items:flex-start;justify-content:space-between">
    <div>
      <div class="page-title">Registro movimenti</div>
      <div class="page-sub">${fm.length} voci · usa i filtri per restringere</div>
    </div>
    <button class="btn-add" id="btnAdd">＋ Aggiungi</button>
  </div>

  <div class="filter-bar">
    <span class="filter-label">Tipo:</span>
    <button class="filter-btn ${state.tipoFilter==="tutto"?"active":""}" data-filter-tipo="tutto">Tutto</button>
    <button class="filter-btn ${state.tipoFilter==="Spesa"?"active":""}" data-filter-tipo="Spesa">Spese</button>
    <button class="filter-btn ${state.tipoFilter==="Entrata"?"active":""}" data-filter-tipo="Entrata">Entrate</button>
    <div class="filter-sep"></div>
    <span class="filter-label">Chi:</span>
    <button class="filter-btn ${state.chiFilter==="tutto"?"active":""}" data-filter-chi="tutto">Tutti</button>
    <button class="filter-btn ${state.chiFilter==="Mattia"?"active":""}" data-filter-chi="Mattia">Mattia</button>
    <button class="filter-btn ${state.chiFilter==="Danilo"?"active":""}" data-filter-chi="Danilo">Danilo</button>
    <div class="filter-sep"></div>
    <span class="filter-label">Categoria:</span>
    <select class="filter-select" id="catFilter">
      <option value="tutto" ${state.catFilter==="tutto"?"selected":""}>Tutte</option>
      ${allCats.map(c=>`<option value="${c}" ${state.catFilter===c?"selected":""}>${c}</option>`).join("")}
    </select>
    <div class="filter-sep"></div>
    ${renderFiltriBar().replace('style="margin-bottom:20px"','')}
  </div>

  <div class="card" style="padding:0;overflow:hidden">
    <div class="table-wrap">
      <table class="data-table">
        <thead><tr>
          <th>Mese</th>
          <th>Data</th>
          <th>Descrizione</th>
          <th>Tipo</th>
          <th>Categoria</th>
          <th style="text-align:right">Importo</th>
          <th style="text-align:center">Chi</th>
          <th>Note</th>
          <th></th>
        </tr></thead>
        <tbody>
          ${fm.length === 0 ? `<tr><td colspan="9"><div class="empty"><div class="empty-icon">📭</div><div class="empty-text">Nessun movimento trovato</div></div></td></tr>` : ""}
          ${fm.map(item => `
          <tr>
            <td style="color:var(--muted);font-size:12px">${meseLabelIT(item.mese)}</td>
            <td style="font-size:12px;color:var(--muted);white-space:nowrap">${item.dataEsatta}</td>
            <td style="font-weight:500">${item.descrizione}</td>
            <td><span class="tipo-badge ${item.tipo.toLowerCase()}">${item.tipo}</span></td>
            <td style="color:var(--muted);font-size:12px">${item.categoria}</td>
            <td class="importo ${item.importo<0?"neg":"pos"}" style="text-align:right">${fmtEuro(item.importo)}</td>
            <td style="text-align:center"><span class="name-${item.chi.toLowerCase()}">${item.chi}</span></td>
            <td style="color:var(--muted);font-size:12px">${item.note||"—"}</td>
            <td style="white-space:nowrap">
              <button class="btn btn-ghost" style="padding:4px 10px;font-size:12px" data-edit="${item.id}">✏️</button>
              <button class="btn btn-red" style="padding:4px 10px;font-size:12px;margin-left:4px" data-del="${item.id}">🗑</button>
            </td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>
  </div>`;
}

// ── RIEPILOGO ─────────────────────────────────────────────────────────────────
function renderRiepilogo() {
  const anni = anniUnici();

  return `
  <div class="page-header">
    <div class="page-title">Riepilogo temporale</div>
    <div class="page-sub">Andamento mese per mese e per anno</div>
  </div>

  <div class="card" style="margin-bottom:20px">
    <div class="card-title">Vista Mensile</div>
    <div class="table-wrap">
    <table class="riepilogo-table">
      <thead><tr>
        <th>Mese</th>
        <th>Entrate</th>
        <th>Spese</th>
        <th>Saldo Mese</th>
        <th>Mattia</th>
        <th>Danilo</th>
      </tr></thead>
      <tbody>
        ${mesiUnici(state.movimenti).map(mese => {
          const mm = state.movimenti.filter(x => x.mese === mese);
          const t  = totali(mm);
          return `<tr>
            <td>${meseLabelIT(mese)}</td>
            <td style="color:var(--mattia)">${fmtEuro(t.entrate)}</td>
            <td style="color:var(--red)">${fmtEuro(t.spese)}</td>
            <td style="color:${t.saldo>=0?"var(--mattia)":"var(--red)"};font-family:var(--mono);font-weight:700">${fmtEuro(t.saldo)}</td>
            <td style="color:var(--muted)">${fmtEuro(t.pagMattia)}</td>
            <td style="color:var(--muted)">${fmtEuro(t.pagDanilo)}</td>
          </tr>`;
        }).join("")}
        ${(() => { const t=totali(state.movimenti); return `<tr class="total-row">
          <td>TOTALE</td>
          <td style="color:var(--mattia)">${fmtEuro(t.entrate)}</td>
          <td style="color:var(--red)">${fmtEuro(t.spese)}</td>
          <td style="color:${t.saldo>=0?"var(--mattia)":"var(--red)"}">${fmtEuro(t.saldo)}</td>
          <td>${fmtEuro(t.pagMattia)}</td>
          <td>${fmtEuro(t.pagDanilo)}</td>
        </tr>`;})()}
      </tbody>
    </table>
    </div>
  </div>

  <div class="card">
    <div class="card-title">Vista Annuale</div>
    <div class="table-wrap">
    <table class="riepilogo-table">
      <thead><tr>
        <th>Anno</th>
        <th>Entrate</th>
        <th>Spese</th>
        <th>Saldo Anno</th>
        <th>Mattia</th>
        <th>Danilo</th>
      </tr></thead>
      <tbody>
        ${anni.map(anno => {
          const mm = state.movimenti.filter(x => x.mese.startsWith(anno));
          const t  = totali(mm);
          return `<tr>
            <td style="font-weight:700">${anno}</td>
            <td style="color:var(--mattia)">${fmtEuro(t.entrate)}</td>
            <td style="color:var(--red)">${fmtEuro(t.spese)}</td>
            <td style="color:${t.saldo>=0?"var(--mattia)":"var(--red)"};font-weight:700">${fmtEuro(t.saldo)}</td>
            <td style="color:var(--muted)">${fmtEuro(t.pagMattia)}</td>
            <td style="color:var(--muted)">${fmtEuro(t.pagDanilo)}</td>
          </tr>`;
        }).join("")}
        ${(() => { const t=totali(state.movimenti); return `<tr class="total-row">
          <td>TOTALE</td>
          <td style="color:var(--mattia)">${fmtEuro(t.entrate)}</td>
          <td style="color:var(--red)">${fmtEuro(t.spese)}</td>
          <td style="color:${t.saldo>=0?"var(--mattia)":"var(--red)"}">${fmtEuro(t.saldo)}</td>
          <td>${fmtEuro(t.pagMattia)}</td>
          <td>${fmtEuro(t.pagDanilo)}</td>
        </tr>`;})()}
      </tbody>
    </table>
    </div>
  </div>`;
}

// ── CATEGORIE VIEW ────────────────────────────────────────────────────────────
function renderCategorieView() {
  return `
  <div class="page-header">
    <div class="page-title">Gestione Categorie</div>
    <div class="page-sub">Aggiungi o rimuovi categorie. Si aggiornano subito nei dropdown del Registro.</div>
  </div>
  <div class="grid-2">
    <div class="card">
      <div class="card-title" style="color:var(--red)">Categorie Spese</div>
      <div class="cat-list">
        ${state.categorie.spesa.map(c=>`
          <div class="cat-item">
            <span>${c}</span>
            <button class="cat-item-delete" data-delcat-spesa="${c}">×</button>
          </div>`).join("")}
      </div>
      <div class="cat-add-row">
        <input class="form-input" id="newCatSpesa" placeholder="Nuova categoria..." value="${state.newCatSpesa}">
        <button class="btn btn-primary" id="addCatSpesa">Aggiungi</button>
      </div>
    </div>
    <div class="card">
      <div class="card-title" style="color:var(--mattia)">Categorie Entrate</div>
      <div class="cat-list">
        ${state.categorie.entrata.map(c=>`
          <div class="cat-item">
            <span>${c}</span>
            <button class="cat-item-delete" data-delcat-entrata="${c}">×</button>
          </div>`).join("")}
      </div>
      <div class="cat-add-row">
        <input class="form-input" id="newCatEntrata" placeholder="Nuova categoria..." value="${state.newCatEntrata}">
        <button class="btn btn-primary" id="addCatEntrata">Aggiungi</button>
      </div>
    </div>
  </div>`;
}

// ── IMPOSTAZIONI ──────────────────────────────────────────────────────────────
function renderImpostazioni() {
  return `
  <div class="page-header">
    <div class="page-title">Impostazioni</div>
    <div class="page-sub">Configurazione generale dell'app</div>
  </div>
  <div class="card" style="max-width:500px">
    <div class="settings-section">
      <div class="settings-title">Soci</div>
      <p style="font-size:13px;color:var(--muted);margin-bottom:8px">Ogni movimento viene diviso al 50% tra i due soci. La struttura è fissa.</p>
      <div style="display:flex;gap:10px">
        <span class="badge green">Mattia</span>
        <span class="badge blue">Danilo</span>
      </div>
    </div>
    <div class="settings-section">
      <div class="settings-title">Dati</div>
      <p style="font-size:13px;color:var(--muted);margin-bottom:12px">I dati sono salvati nel browser (localStorage). Per condividerli con Danilo, esporta e invia il file JSON.</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn btn-ghost" id="btnExport">⬇ Esporta JSON</button>
        <label class="btn btn-ghost" style="cursor:pointer">⬆ Importa JSON<input type="file" accept=".json" id="btnImport" style="display:none"></label>
        <button class="btn btn-red" id="btnReset">↺ Reset dati iniziali</button>
      </div>
    </div>
    <div class="settings-section">
      <div class="settings-title">Info</div>
      <p style="font-size:12px;color:var(--muted)">Hypemove Finance v1.0 · Sviluppato con Claude</p>
    </div>
  </div>`;
}

// ── MODAL ─────────────────────────────────────────────────────────────────────
function renderModal() {
  if (state.modal === "delete") return `
    <div class="modal-overlay" id="overlay">
      <div class="modal">
        <div class="modal-title">Elimina movimento</div>
        <div class="modal-sub">Sei sicuro? L'operazione non può essere annullata.</div>
        <div class="modal-actions">
          <button class="btn btn-ghost" id="modalClose">Annulla</button>
          <button class="btn btn-red" id="modalConfirmDelete">Elimina</button>
        </div>
      </div>
    </div>`;

  const isEdit = state.modal === "edit";
  const f = state.form;
  const cats = f.tipo === "Entrata" ? state.categorie.entrata : state.categorie.spesa;

  return `
  <div class="modal-overlay" id="overlay">
    <div class="modal">
      <div class="modal-title">${isEdit?"Modifica movimento":"Nuovo movimento"}</div>
      <div class="modal-sub">${isEdit?"Aggiorna i dati del movimento selezionato.":"Compila tutti i campi per aggiungere un movimento."}</div>
      <div class="form-grid">
        <div class="form-field">
          <label class="form-label">Mese *</label>
          <input class="form-input" type="month" id="f_mese" value="${f.mese||""}">
        </div>
        <div class="form-field">
          <label class="form-label">Data esatta</label>
          <input class="form-input" type="date" id="f_data" value="${f.dataEsatta||""}">
        </div>
        <div class="form-field full">
          <label class="form-label">Descrizione *</label>
          <input class="form-input" type="text" id="f_desc" placeholder="Es. Abbonamento Figma" value="${f.descrizione||""}">
        </div>
        <div class="form-field">
          <label class="form-label">Tipo *</label>
          <select class="form-select" id="f_tipo">
            <option value="Spesa"   ${f.tipo==="Spesa"  ?"selected":""}>Spesa</option>
            <option value="Entrata" ${f.tipo==="Entrata"?"selected":""}>Entrata</option>
          </select>
        </div>
        <div class="form-field">
          <label class="form-label">Categoria *</label>
          <select class="form-select" id="f_cat">
            <option value="">— Seleziona —</option>
            ${cats.map(c=>`<option value="${c}" ${f.categoria===c?"selected":""}>${c}</option>`).join("")}
          </select>
        </div>
        <div class="form-field">
          <label class="form-label">Importo € * (positivo)</label>
          <input class="form-input" type="number" min="0" step="0.01" id="f_importo" placeholder="0,00" value="${f.importo||""}">
        </div>
        <div class="form-field">
          <label class="form-label">Chi ha pagato / incassato *</label>
          <select class="form-select" id="f_chi">
            <option value="Mattia" ${f.chi==="Mattia"?"selected":""}>Mattia</option>
            <option value="Danilo" ${f.chi==="Danilo"?"selected":""}>Danilo</option>
            <option value="Entrambi" ${f.chi==="Entrambi"?"selected":""}>Entrambi</option>
          </select>
        </div>
        <div class="form-field full">
          <label class="form-label">Note</label>
          <input class="form-input" type="text" id="f_note" placeholder="Opzionale" value="${f.note||""}">
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn btn-ghost" id="modalClose">Annulla</button>
        <button class="btn btn-primary" id="modalSave">${isEdit?"Salva modifiche":"Aggiungi"}</button>
      </div>
    </div>
  </div>`;
}

// ── EVENTS ────────────────────────────────────────────────────────────────────
function attachEvents() {
  document.querySelectorAll("[data-nav]").forEach(el =>
    el.addEventListener("click", () => setState({ page: el.dataset.nav })));

  document.querySelectorAll("[data-filter-periodo]").forEach(el =>
    el.addEventListener("click", () => setState({ periodoFilter: el.dataset.filterPeriodo })));
  const annoSel = document.getElementById("annoSelect");
  if (annoSel) annoSel.addEventListener("change", () => setState({ annoFilter: annoSel.value }));
  const meseS = document.getElementById("meseStart");
  if (meseS) meseS.addEventListener("input", () => setState({ meseFilterStart: meseS.value }));
  const meseE = document.getElementById("meseEnd");
  if (meseE) meseE.addEventListener("input", () => setState({ meseFilterEnd: meseE.value }));

  document.querySelectorAll("[data-filter-tipo]").forEach(el =>
    el.addEventListener("click", () => setState({ tipoFilter: el.dataset.filterTipo })));
  document.querySelectorAll("[data-filter-chi]").forEach(el =>
    el.addEventListener("click", () => setState({ chiFilter: el.dataset.filterChi })));
  const catF = document.getElementById("catFilter");
  if (catF) catF.addEventListener("change", () => setState({ catFilter: catF.value }));

  document.querySelectorAll("[data-tasse-modo]").forEach(el =>
    el.addEventListener("click", () => setState({ tasseModo: el.dataset.tasseModo })));
  const tp = document.getElementById("tassePerc");
  if (tp) tp.addEventListener("input", () => setState({ tassePerc: parseFloat(tp.value)||0 }));
  const te = document.getElementById("tasseEuro");
  if (te) te.addEventListener("input", () => setState({ tasseEuro: parseFloat(te.value)||0 }));

  const btnAdd = document.getElementById("btnAdd");
  if (btnAdd) btnAdd.addEventListener("click", openAdd);
  document.querySelectorAll("[data-edit]").forEach(el =>
    el.addEventListener("click", () => { const item = state.movimenti.find(x=>x.id===parseInt(el.dataset.edit)); if(item) openEdit(item); }));
  document.querySelectorAll("[data-del]").forEach(el =>
    el.addEventListener("click", () => openDelete(parseInt(el.dataset.del))));

  const mc = document.getElementById("modalClose");
  if (mc) mc.addEventListener("click", closeModal);
  const ov = document.getElementById("overlay");
  if (ov) ov.addEventListener("click", e => { if(e.target===ov) closeModal(); });
  const ms = document.getElementById("modalSave");
  if (ms) ms.addEventListener("click", saveMovimento);
  const mcd = document.getElementById("modalConfirmDelete");
  if (mcd) mcd.addEventListener("click", deleteMovimento);

  const fields = { f_mese:"mese", f_data:"dataEsatta", f_desc:"descrizione", f_tipo:"tipo", f_cat:"categoria", f_importo:"importo", f_chi:"chi", f_note:"note" };
  Object.entries(fields).forEach(([id,key]) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener(el.tagName==="SELECT"?"change":"input", () => updateForm(key, el.value));
  });

  document.querySelectorAll("[data-delcat-spesa]").forEach(el =>
    el.addEventListener("click", () => delCat("Spesa", el.dataset.delcatSpesa)));
  document.querySelectorAll("[data-delcat-entrata]").forEach(el =>
    el.addEventListener("click", () => delCat("Entrata", el.dataset.delcatEntrata)));
  const ncs = document.getElementById("newCatSpesa");
  if (ncs) { ncs.addEventListener("input", () => state.newCatSpesa = ncs.value); }
  const nce = document.getElementById("newCatEntrata");
  if (nce) { nce.addEventListener("input", () => state.newCatEntrata = nce.value); }
  const acs = document.getElementById("addCatSpesa");
  if (acs) acs.addEventListener("click", () => addCat("Spesa", state.newCatSpesa));
  const ace = document.getElementById("addCatEntrata");
  if (ace) ace.addEventListener("click", () => addCat("Entrata", state.newCatEntrata));

  document.querySelectorAll("[data-chart-tipo]").forEach(el =>
    el.addEventListener("click", () => setState({ chartTipo: el.dataset.chartTipo })));
  document.querySelectorAll("[data-chart-series]").forEach(el =>
    el.addEventListener("click", () => {
      const s = el.dataset.chartSeries;
      if (s === "spese")   setState({ chartShowSpese:   !state.chartShowSpese });
      if (s === "entrate") setState({ chartShowEntrate: !state.chartShowEntrate });
    }));

  const btnSetupFile = document.getElementById("btnSetupFile");
  if (btnSetupFile) btnSetupFile.addEventListener("click", setupFileBackup);
  const btnReconnectFile = document.getElementById("btnReconnectFile");
  if (btnReconnectFile) btnReconnectFile.addEventListener("click", reconnectFileBackup);

  const btnExport = document.getElementById("btnExport");
  if (btnExport) btnExport.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify({movimenti:state.movimenti,categorie:state.categorie}, null, 2)], {type:"application/json"});
    const a = document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="hypemove-finance.json"; a.click();
  });
  const btnImport = document.getElementById("btnImport");
  if (btnImport) btnImport.addEventListener("change", e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const d = JSON.parse(ev.target.result);
        if (d.movimenti && d.categorie) {
          state.movimenti = d.movimenti; state.categorie = d.categorie;
          state.nextId = Math.max(...d.movimenti.map(x=>x.id)) + 1;
          save(); showToast("Importato con successo ✓", "success");
        } else showToast("File non valido.", "error");
      } catch { showToast("Errore lettura file.", "error"); }
    };
    reader.readAsText(file);
  });
  const btnReset = document.getElementById("btnReset");
  if (btnReset) btnReset.addEventListener("click", () => {
    if (confirm("Vuoi davvero resettare ai dati iniziali? Perderai le modifiche.")) {
      state.movimenti = INITIAL_DATA; state.categorie = INITIAL_CATS; state.nextId = 20;
      save(); showToast("Reset completato.", "success");
    }
  });
}

// ── BOOT ──────────────────────────────────────────────────────────────────────
(async () => {
  await initFileBackup();
  render();
})();
