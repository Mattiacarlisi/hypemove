import React, { useEffect } from "react";

// Destinazione delle CTA email ("Allenati ora!"): redirect immediato al Play Store.
// Il parametro ?source= dell'email viene propagato come referrer per l'attribuzione.
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=pt.app&hl=it";

function buildStoreUrl() {
  const source = new URLSearchParams(window.location.search).get("source")?.trim();
  if (!source) return PLAY_STORE_URL;
  return `${PLAY_STORE_URL}&referrer=${encodeURIComponent(`utm_source=email&utm_campaign=${source}`)}`;
}

export default function Open() {
  useEffect(() => {
    document.title = "Apri Hypemove";

    let robots = document.head.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }
    robots.setAttribute("content", "noindex, nofollow");

    window.location.replace(buildStoreUrl());
  }, []);

  // Fallback visibile solo se il redirect viene bloccato dal browser
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FDFDFD] px-4 text-black">
      <div className="text-center">
        <p className="mb-6 text-lg text-black/65">Ti stiamo portando su Hypemove…</p>
        <a
          href={PLAY_STORE_URL}
          className="inline-flex min-h-[54px] items-center justify-center rounded-full bg-[#FB8B04] px-6 py-3 text-base font-bold text-black"
        >
          Apri Hypemove sul Play Store
        </a>
      </div>
    </div>
  );
}
