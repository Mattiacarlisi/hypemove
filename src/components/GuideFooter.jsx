import React from "react";
import { ArrowRight, Download } from "lucide-react";
import { guideFooterLinks, guides } from "../data/guides.js";
import { PLAY_STORE_URL, handleAndroidDownloadClick } from "../lib/analytics.js";

const PRIVACY_URL = "/legal/privacy.html";
const MARKETING_URL = "/legal/marketing.html";

function LogoMark() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-black text-white shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
      <span className="text-lg font-black tracking-[-0.06em]">H</span>
    </div>
  );
}

export default function GuideFooter({ currentHref }) {
  const relatedGuides = guides
    .filter((guide) => guide.href !== currentHref)
    .slice(0, 3);

  return (
    <footer className="border-t border-black/10 bg-[#F7F7F7]">
      <div className="mx-auto max-w-7xl border-b border-black/10 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-2xl font-black tracking-[-0.05em] text-black sm:text-3xl">
              Forse potrebbe interessarti anche:
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-black/55">
              Tre articoli utili per continuare a muoverti in modo semplice e realistico.
            </p>
          </div>
          <a
            href="/guide"
            className="inline-flex min-h-[44px] w-fit items-center justify-center rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:border-black/20"
          >
            Tutte le guide
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {relatedGuides.map((guide) => (
            <a
              key={guide.href}
              href={guide.href}
              className="group flex min-h-[178px] flex-col justify-between rounded-[20px] border border-black/10 bg-white p-5 shadow-[0_14px_42px_rgba(0,0,0,0.04)] transition hover:-translate-y-1 hover:border-black/20 hover:shadow-[0_22px_58px_rgba(0,0,0,0.07)]"
            >
              <span>
                <span className="flex items-center justify-between gap-4">
                  <span className="rounded-full bg-[#FCFBF8] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-black/52">
                    {guide.category}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-black/42">
                    {guide.readTime}
                  </span>
                </span>
                <span className="mt-4 block text-xl font-black leading-[1.08] tracking-[-0.04em] text-black">
                  {guide.title}
                </span>
                <span className="mt-3 block text-sm leading-6 text-black/58">{guide.description}</span>
              </span>
              <span className="mt-5 inline-flex items-center text-sm font-bold text-black">
                Leggi l'articolo
                <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </a>
          ))}
        </div>

      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-5 lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <LogoMark />
            <div>
              <div className="text-base font-black text-black">Hypemove</div>
              <div className="text-sm text-black/45">Muoviti. Continua. Stai meglio.</div>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-7 text-black/55">
            L'app fitness pensata per aiutare le persone poco costanti a rendere il movimento più semplice, più desiderabile e più sostenibile.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.22em] text-black">Scopri</h3>
          <div className="mt-4 space-y-3 text-sm text-black/55">
            <a href="/" className="block transition hover:text-black">Home</a>
            <a href="/guide" className="block transition hover:text-black">Guide</a>
            <a href="/#goals" className="block transition hover:text-black">Obiettivi</a>
            <a href="/#faq" className="block transition hover:text-black">FAQ</a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.22em] text-black">Guide utili</h3>
          <div className="mt-4 space-y-3 text-sm text-black/55">
            {guideFooterLinks.map((guide) => (
              <a key={guide.href} href={guide.href} className="block transition hover:text-black">
                {guide.title}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.22em] text-black">Legale</h3>
          <div className="mt-4 space-y-3 text-sm text-black/55">
            <a href={PRIVACY_URL} className="block transition hover:text-black">Privacy e Termini d'uso</a>
            <a href={MARKETING_URL} className="block transition hover:text-black">Informativa Marketing</a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.22em] text-black">Download</h3>
          <div className="mt-4 space-y-4 text-sm text-black/55">
            <a
              href={PLAY_STORE_URL}
              onClick={(event) => handleAndroidDownloadClick(event, {
                buttonText: "Scarica gratis",
                location: "guide_footer",
              })}
              className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5"
            >
              <Download className="h-4 w-4" />
              Scarica gratis
            </a>
            <p className="leading-6 text-black/50">Android disponibile ora. iPhone in arrivo.</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-8 text-center text-xs text-black/40 sm:px-6 lg:px-8">
        © {new Date().getFullYear()} Hypemove. Tutti i diritti riservati.
      </div>
    </footer>
  );
}
