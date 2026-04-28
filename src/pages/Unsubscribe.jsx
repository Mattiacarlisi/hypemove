import React, { useEffect, useState } from "react";

const HOME_URL = "https://hypemove.app";
const FUNCTION_URL =
  "https://fiwskdxntgcredypplub.supabase.co/functions/v1/unsubscribe-lifecycle-emails";

function usePrivateSeo() {
  useEffect(() => {
    document.title = "Disiscrizione email | Hypemove";

    let robots = document.head.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }

    robots.setAttribute("content", "noindex, nofollow");
  }, []);
}

function LogoMark() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
      <span className="text-lg font-black tracking-[-0.06em]">H</span>
    </div>
  );
}

function UnsubscribeShell({ title, text, children }) {
  return (
    <div className="min-h-screen bg-[#FDFDFD] px-4 py-8 text-black sm:px-6">
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-xl flex-col justify-center">
        <a href={HOME_URL} className="mb-8 inline-flex w-fit items-center gap-3" aria-label="Vai alla home di Hypemove">
          <LogoMark />
          <span className="text-xl font-black tracking-[-0.04em]">Hypemove</span>
        </a>

        <section className="rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.06)] sm:p-8">
          <div className="mb-5 h-1.5 w-16 rounded-full bg-[#FB8B04]" />
          <h1 className="text-3xl font-black leading-tight tracking-[-0.04em] text-black sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 text-base leading-7 text-black/65 sm:text-lg sm:leading-8">{text}</p>
          {children ? <div className="mt-7 flex flex-col gap-3 sm:flex-row">{children}</div> : null}
        </section>
      </main>
    </div>
  );
}

function HomeButton({ children = "Torna su Hypemove", variant = "primary" }) {
  const classes =
    variant === "primary"
      ? "bg-black text-white hover:-translate-y-0.5"
      : "border border-black/10 bg-white text-black hover:-translate-y-0.5 hover:border-black/20";

  return (
    <a
      href={HOME_URL}
      className={`inline-flex min-h-[54px] items-center justify-center rounded-full px-6 py-3 text-center text-base font-semibold transition ${classes}`}
    >
      {children}
    </a>
  );
}

export default function Unsubscribe() {
  usePrivateSeo();

  const [token, setToken] = useState("");
  const [status, setStatus] = useState("invalid");

  useEffect(() => {
    const queryToken = new URLSearchParams(window.location.search).get("token")?.trim() ?? "";
    setToken(queryToken);
    setStatus(queryToken ? "confirm" : "invalid");
  }, []);

  const handleUnsubscribe = async () => {
    if (!token || status === "loading") return;

    setStatus("loading");

    try {
      const response = await fetch(`${FUNCTION_URL}?token=${encodeURIComponent(token)}`, {
        method: "GET",
      });

      setStatus(response.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "invalid") {
    return (
      <UnsubscribeShell
        title="Link non valido"
        text="Il link di disiscrizione non è valido o è incompleto."
      >
        <HomeButton />
      </UnsubscribeShell>
    );
  }

  if (status === "loading") {
    return (
      <UnsubscribeShell
        title="Disattivazione in corso..."
        text="Stiamo completando la richiesta. Attendi qualche secondo."
      />
    );
  }

  if (status === "success") {
    return (
      <UnsubscribeShell
        title="Email disattivate"
        text="Non riceverai più queste email automatiche da Hypemove. Puoi continuare a usare l’app normalmente."
      >
        <HomeButton />
      </UnsubscribeShell>
    );
  }

  if (status === "error") {
    return (
      <UnsubscribeShell
        title="Qualcosa non ha funzionato"
        text="Non siamo riusciti a completare la disiscrizione. Riprova tra poco oppure contattaci."
      >
        <HomeButton />
      </UnsubscribeShell>
    );
  }

  return (
    <UnsubscribeShell
      title="Vuoi disattivare queste email?"
      text="Se confermi, non riceverai più le email automatiche di promemoria e recupero abitudine da Hypemove. Potrai continuare a usare l’app normalmente."
    >
      <HomeButton variant="secondary">No, torno su Hypemove</HomeButton>
      <button
        type="button"
        onClick={handleUnsubscribe}
        className="inline-flex min-h-[54px] items-center justify-center rounded-full bg-[#FB8B04] px-6 py-3 text-center text-base font-bold text-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Sì, disattiva
      </button>
    </UnsubscribeShell>
  );
}
