import { PLAY_STORE_URL } from "../site.js";

// Codici d'invito: gruppo = 10 caratteri senza I/O/0/1, personale = 8 esadecimali.
const GROUP_RE = /^[A-HJ-NP-Z2-9]{10}$/;
const PERSONAL_RE = /^[0-9A-F]{8}$/;

export function normalizeInviteCode(raw) {
  let value = String(raw ?? "");
  try { value = decodeURIComponent(value); } catch { /* resta com'è */ }
  return value.trim().toUpperCase();
}

export function inviteCampaign(code) {
  if (GROUP_RE.test(code)) return "group";
  if (PERSONAL_RE.test(code)) return "personal";
  return null;
}

// Codice dal percorso /invite/<codice> (ignora slash finali e segmenti extra).
export function codeFromPathname(pathname) {
  const match = String(pathname ?? "").match(/^\/invite\/([^/?#]+)/i);
  return match ? normalizeInviteCode(match[1]) : "";
}

// Link del Play Store con l'install referrer. Senza codice valido: link semplice, senza invite=.
export function buildInviteStoreUrl(rawCode) {
  const code = normalizeInviteCode(rawCode);
  const campaign = inviteCampaign(code);
  if (!campaign) return PLAY_STORE_URL;
  const referrer = `utm_source=invite&utm_medium=link&utm_campaign=${campaign}&invite=${code}`;
  return `${PLAY_STORE_URL}&referrer=${encodeURIComponent(referrer)}`;
}

export const EXERCISE_NAMES = {
  squat: "Squat",
  pushup: "Piegamenti",
  step_jack: "Jack senza salto",
  plank: "Plank",
  wall_sit: "Sedia al muro",
};
const HELD = new Set(["plank", "wall_sit"]);

export function inviteTitle(p) {
  const name = p.inviter_username;
  if (p.kind === "group") {
    if (p.group_kind === "family") return `${name} ti invita nella sua famiglia`;
    if (p.group_kind === "friends") return `${name} ti invita nel suo gruppo di amici`;
    if (p.group_name) return `${name} ti invita in ${p.group_name}`;
  }
  return `${name} ti invita su HypeMove`;
}

export function inviteTodayLine(p) {
  const label = EXERCISE_NAMES[p.exercise_id];
  const n = p.inviter_best_today;
  if (!label || n === null || n === undefined || !Number.isFinite(Number(n))) return null;
  const verb = HELD.has(p.exercise_id) ? `ha tenuto ${n} secondi` : `ne ha fatti ${n}`;
  return `Oggi: ${label}. ${p.inviter_username} ${verb}.`;
}
