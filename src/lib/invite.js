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
  lunge: "Affondi alternati",
  step_jack: "Jack senza salto",
  plank: "Plank",
  wall_sit: "Sedia al muro",
};
const HELD = new Set(["plank", "wall_sit"]);
// Unità accordate al numero (singolare, plurale), come nell'app (challenge.json).
const UNITS = {
  squat: ["squat", "squat"],
  pushup: ["piegamento", "piegamenti"],
  lunge: ["affondo", "affondi"],
  step_jack: ["jack", "jack"],
  plank: ["secondo", "secondi"],
  wall_sit: ["secondo", "secondi"],
};

// «Rosa ti sfida»: chi invita ha fatto la sfida oggi. Null se non l'ha fatta (o l'esercizio non si conosce).
export function inviteDare(p) {
  if (!p) return null;
  const label = EXERCISE_NAMES[p.exercise_id];
  const raw = p.inviter_best_today;
  const n = raw === null || raw === undefined ? NaN : Number(raw);
  if (!label || !Number.isFinite(n) || n <= 0) return null;
  const score = Math.round(n);
  const [one, many] = UNITS[p.exercise_id];
  const unit = score === 1 ? one : many;
  const name = p.inviter_username;
  return {
    title: `${name} ti sfida`,
    score,
    unitLine: HELD.has(p.exercise_id) ? `${unit} di ${label.toLowerCase()}, oggi` : `${unit} in un minuto, oggi`,
    button: `Batti ${name}`,
  };
}

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
