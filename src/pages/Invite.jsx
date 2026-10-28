import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { handleAndroidDownloadClick } from "../lib/analytics.js";
import { buildInviteStoreUrl, codeFromPathname, inviteCampaign, inviteDare, inviteTitle, inviteTodayLine } from "../lib/invite.js";
import { logInvitePage } from "../lib/invitePageEvents.js";

// Pagina d'invito /invite/<codice>. Chi ha l'app Android la apre direttamente (App Link):
// qui arriva solo chi non ce l'ha. Android -> Play Store subito, con il codice nel referrer.
// iPhone e computer -> anteprima di chi invita (RPC get_invite_preview) e tasto di download; se chi
// invita ha fatto la sfida oggi, «Rosa ti sfida» col numero da battere e il tasto «Batti Rosa».
// Ogni apertura e ogni tocco su «Scarica» / «Scopri come» finiscono in link_page_events col codice.

const BUTTON = "Scarica HypeMove";

function usePrivateSeo() {
  useEffect(() => {
    document.title = "Invito su HypeMove";
    let robots = document.head.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }
    robots.setAttribute("content", "noindex, nofollow");
  }, []);
}

function Shell({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FDFDFD] px-4 py-8 text-black">
      <main className="w-full max-w-md rounded-[28px] border border-black/10 bg-white p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.06)] sm:p-8">
        <div className="mx-auto mb-6 h-1.5 w-16 rounded-full bg-[#FB8B04]" />
        {children}
      </main>
    </div>
  );
}

function DownloadButton({ href, code, label = BUTTON }) {
  return (
    <a
      href={href}
      onClick={(event) => {
        void logInvitePage("click", code, "store");
        handleAndroidDownloadClick(event, { buttonText: label, href, location: "invite" });
      }}
      className="mt-7 inline-flex min-h-[54px] w-full items-center justify-center rounded-full bg-[#FB8B04] px-6 py-3 text-base font-bold text-black"
    >
      {label}
    </a>
  );
}

function Avatar({ picture, name }) {
  const initial = (name || "?").trim().charAt(0).toUpperCase() || "?";
  const [broken, setBroken] = useState(false);
  if (picture && !broken) {
    return (
      <img
        src={picture}
        alt=""
        width={96}
        height={96}
        referrerPolicy="no-referrer"
        onError={() => setBroken(true)}
        className="mx-auto mb-5 h-24 w-24 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-[#FB8B04] text-4xl font-black text-black" aria-hidden="true">
      {initial}
    </div>
  );
}

export default function Invite() {
  usePrivateSeo();

  // "init" = prima del primo effetto (identico all'HTML prerenderizzato): attesa sobria.
  const [state, setState] = useState({ status: "init", code: "", isIphone: false, preview: null });

  useEffect(() => {
    const code = codeFromPathname(window.location.pathname);
    const ua = navigator.userAgent || "";
    const isAndroid = /Android/i.test(ua);
    const isIphone = /iPhone|iPad|iPod/i.test(ua);

    if (isAndroid) {
      // Su Android aprire il link È arrivare sul Play Store: la visita si registra prima di partire.
      setState({ status: "redirect", code, isIphone: false, preview: null });
      void logInvitePage("view", code).then(() => window.location.replace(buildInviteStoreUrl(code)));
      return undefined;
    }
    void logInvitePage("view", code);
    if (!inviteCampaign(code)) {
      setState({ status: "invalid", code, isIphone, preview: null });
      return undefined;
    }

    setState({ status: "loading", code, isIphone, preview: null });
    let cancelled = false;
    Promise.resolve(supabase.rpc("get_invite_preview", { p_code: code }))
      .then(({ data, error }) => {
        if (cancelled) return;
        const ok = !error && data && data.ok === true && data.inviter_username;
        setState({ status: ok ? "ok" : "invalid", code, isIphone, preview: ok ? data : null });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "invalid", code, isIphone, preview: null });
      });
    return () => { cancelled = true; };
  }, []);

  const { status, code, isIphone, preview } = state;

  if (status === "init" || status === "loading" || status === "redirect") {
    return (
      <Shell>
        <p className="text-lg text-black/65" role="status">
          {status === "redirect" ? "Ti stiamo portando su HypeMove…" : "Un attimo…"}
        </p>
      </Shell>
    );
  }

  const iphoneNote = isIphone ? (
    <p className="mt-5 text-sm text-black/65">
      Su iPhone stiamo arrivando.{" "}
      <a href="/iphone" onClick={() => void logInvitePage("click", code, "iphone")} className="font-semibold text-black underline">Scopri come</a>
    </p>
  ) : null;

  if (status === "invalid") {
    return (
      <Shell>
        <h1 className="text-2xl font-black leading-tight tracking-[-0.03em] sm:text-3xl">Questo invito non è più valido</h1>
        <DownloadButton href={buildInviteStoreUrl("")} code={code} />
        {iphoneNote}
      </Shell>
    );
  }

  // Chi invita ha fatto la sfida oggi: il numero da battere, e il download diventa «Batti Rosa».
  const dare = inviteDare(preview);
  if (dare) {
    return (
      <Shell>
        <Avatar picture={preview.inviter_picture} name={preview.inviter_username} />
        <h1 className="text-2xl font-black leading-tight tracking-[-0.03em] sm:text-3xl">{dare.title}</h1>
        <p className="mt-3 text-[72px] font-black leading-none tracking-[-0.04em] text-[#FB8B04]" data-testid="invite-dare-score">{dare.score}</p>
        <p className="mt-2 text-lg font-bold text-black">{dare.unitLine}</p>
        <DownloadButton href={buildInviteStoreUrl(code)} code={code} label={dare.button} />
        {iphoneNote}
      </Shell>
    );
  }

  const today = inviteTodayLine(preview);
  return (
    <Shell>
      <Avatar picture={preview.inviter_picture} name={preview.inviter_username} />
      <h1 className="text-2xl font-black leading-tight tracking-[-0.03em] sm:text-3xl">{inviteTitle(preview)}</h1>
      <p className="mt-4 text-base leading-7 text-black/65 sm:text-lg">Ogni giorno una sfida da 1 minuto.</p>
      {today ? <p className="mt-1 text-base leading-7 text-black/65 sm:text-lg">{today}</p> : null}
      <DownloadButton href={buildInviteStoreUrl(code)} code={code} />
      {iphoneNote}
    </Shell>
  );
}
