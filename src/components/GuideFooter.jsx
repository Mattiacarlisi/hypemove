import React from "react";
import { guides } from "../data/guides.js";
import { GuideCard } from "../pages/Guide.jsx";
import { IphoneButton, PlayButton, SiteFooter } from "./Layout.jsx";

// Chiusura delle guide: CTA, tre guide collegate, footer del sito.
export default function GuideFooter({ currentHref }) {
  const related = guides.filter((guide) => guide.href !== currentHref).slice(0, 3);
  return (
    <>
      <section className="bg-deep px-5 py-12 text-white sm:px-7">
        <div className="mx-auto grid max-w-site gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="font-sans text-2xl font-extrabold sm:text-3xl">Se vuoi provare, il primo allenamento è gratis.</h2>
            <p className="mt-2 text-white/70">Un percorso a tappe da 5 a 15 minuti, a casa, a corpo libero o con quello che hai. Su Android, e su iPhone con TestFlight.</p>
          </div>
          <div className="grid gap-3">
            <PlayButton location="guide_cta" />
            <IphoneButton className="btn border-[1.5px] border-white/25 text-white hover:border-white" location="guide_cta" />
          </div>
        </div>
      </section>
      <section className="px-5 py-12 sm:px-7">
        <div className="mx-auto max-w-site">
          <h2 className="font-sans text-2xl font-extrabold">Potrebbe interessarti anche</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {related.map((guide) => (
              <GuideCard key={guide.href} guide={guide} heading="h3" />
            ))}
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
