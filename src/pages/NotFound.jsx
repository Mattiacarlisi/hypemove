import React from "react";
import { Layout, PlayButton, Section } from "../components/Layout.jsx";
import { guides } from "../data/guides.js";

export const meta = {
  title: "Pagina non trovata",
  description: "Questa pagina non esiste o è stata spostata.",
  robots: "noindex, follow",
  type: "website",
  modified: "2026-09-08",
  jsonld: [],
};

export default function NotFound() {
  return (
    <Layout mobileBar={false}>
      <Section>
        <div className="mx-auto max-w-[640px]">
          <div className="kicker">Errore 404</div>
          <h1 className="mt-3 text-5xl sm:text-6xl">Questa pagina non c'è.</h1>
          <p className="mt-4 text-lg text-ink-2">Forse il link era vecchio, o c'è un errore nell'indirizzo. Le cose utili sono qui sotto.</p>
          <ul className="mt-8 grid gap-2">
            {[["Home", "/"], ["Come funziona", "/#come-funziona"], ["Coach AI", "/coach-ai"], ["Prezzi", "/prezzi"], ...guides.slice(0, 3).map((guide) => [guide.title, guide.href])].map(([label, href]) => (
              <li key={href}><a href={href} className="font-bold underline decoration-orange decoration-2 underline-offset-4">{label}</a></li>
            ))}
          </ul>
          <div className="mt-8"><PlayButton location="404" /></div>
        </div>
      </Section>
    </Layout>
  );
}
