import { inviteCampaign } from "./invite.js";

// Visite e tocchi della pagina d'invito in public.link_page_events (la stessa tabella di /link), col codice:
// l'imbuto dell'invito si segue link per link (condiviso → aperto → Scarica → installato → entrato).
// Anonimo come /link: niente cookie né id, solo cosa è successo. Anon può solo inserire.
// keepalive: la riga arriva anche se subito dopo la pagina va sul Play Store.

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Quanto si aspetta la risposta prima di lasciare la pagina (come il tocco su /link). */
export const INVITE_EVENT_WAIT_MS = 600;

/**
 * event: "view" | "click"; link (solo per click): "store" | "iphone".
 * Non lancia mai e si risolve al più tardi dopo INVITE_EVENT_WAIT_MS.
 */
export function logInvitePage(event, code, link = null) {
  if (typeof window === "undefined" || !SUPABASE_URL || !SUPABASE_ANON_KEY) return Promise.resolve();
  let refHost = null;
  try {
    if (document.referrer) refHost = new URL(document.referrer).hostname.slice(0, 100);
  } catch {
    // referrer illeggibile: si manda senza
  }
  const body = {
    event,
    link: event === "click" ? link : null,
    source: "invite",
    invite_code: inviteCampaign(code) ? code : null,
    ref_host: refHost,
    user_agent: (navigator.userAgent || "").slice(0, 400),
  };
  let sent;
  try {
    sent = fetch(`${SUPABASE_URL}/rest/v1/link_page_events`, {
      method: "POST",
      keepalive: true,
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(body),
    }).then(() => undefined, () => undefined);
  } catch {
    sent = Promise.resolve();
  }
  const timeout = new Promise((resolve) => setTimeout(resolve, INVITE_EVENT_WAIT_MS));
  return Promise.race([sent, timeout]);
}
