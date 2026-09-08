import React from "react";
import { renderToString } from "react-dom/server";
import Home, { meta as homeMeta } from "./pages/Home.jsx";
import Prezzi, { meta as prezziMeta } from "./pages/Prezzi.jsx";
import CoachAI, { meta as coachMeta } from "./pages/CoachAI.jsx";
import ChiSiamo, { meta as chiSiamoMeta } from "./pages/ChiSiamo.jsx";
import Confronto, { ConfrontiIndex, confrontoMeta, indexMeta as confrontiIndexMeta } from "./pages/Confronto.jsx";
import Iphone, { IphoneGrazie, meta as iphoneMeta, grazieMeta } from "./pages/Iphone.jsx";
import NotFound, { meta as notFoundMeta } from "./pages/NotFound.jsx";
import Guide, { meta as guideMeta } from "./pages/Guide.jsx";
import AllenamentoACasa, { meta as allenamentoMeta } from "./pages/AllenamentoACasa.jsx";
import AppFitnessPrincipianti, { meta as principiantiMeta } from "./pages/AppFitnessPrincipianti.jsx";
import BeneficiCamminataTempo, { meta as camminataMeta } from "./pages/BeneficiCamminataTempo.jsx";
import CostanzaAllenamento, { meta as costanzaMeta } from "./pages/CostanzaAllenamento.jsx";
import MiniWorkoutEfficaci, { meta as miniMeta } from "./pages/MiniWorkoutEfficaci.jsx";
import Workout10MinutiCasa, { meta as dieciMeta } from "./pages/Workout10MinutiCasa.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Unsubscribe from "./pages/Unsubscribe.jsx";
import Open from "./pages/Open.jsx";
import { confronti } from "./data/confronti.js";

// Esportati per scripts/prerender.mjs (che legge solo questo modulo compilato).
export { baseGraph, DEFINITION, PRICES, PLAY_STORE_URL } from "./site.js";

// Registro di tutte le pagine del sito. `hydrate: true` solo per le pagine che hanno bisogno
// di JavaScript nel browser (reset password, disiscrizione, redirect /open): tutte le altre
// vengono pubblicate come HTML puro, senza bundle.
const PRIVATE = { robots: "noindex, nofollow", type: "website", jsonld: [], modified: "2026-09-08" };

export const routes = [
  { path: "/", Component: Home, meta: homeMeta },
  { path: "/prezzi", Component: Prezzi, meta: prezziMeta },
  { path: "/coach-ai", Component: CoachAI, meta: coachMeta },
  { path: "/chi-siamo", Component: ChiSiamo, meta: chiSiamoMeta },
  { path: "/confronti", Component: ConfrontiIndex, meta: confrontiIndexMeta },
  ...confronti.map((item) => ({ path: `/confronti/${item.slug}`, Component: Confronto, props: { item }, meta: confrontoMeta(item) })),
  { path: "/guide", Component: Guide, meta: guideMeta },
  { path: "/come-essere-costanti-nell-allenamento", Component: CostanzaAllenamento, meta: costanzaMeta },
  { path: "/mini-workout-efficaci", Component: MiniWorkoutEfficaci, meta: miniMeta },
  { path: "/app-fitness-principianti", Component: AppFitnessPrincipianti, meta: principiantiMeta },
  { path: "/workout-10-minuti-casa", Component: Workout10MinutiCasa, meta: dieciMeta },
  { path: "/allenamento-a-casa", Component: AllenamentoACasa, meta: allenamentoMeta },
  { path: "/benefici-camminata-tempo", Component: BeneficiCamminataTempo, meta: camminataMeta },
  { path: "/iphone", Component: Iphone, meta: iphoneMeta },
  { path: "/iphone/grazie", Component: IphoneGrazie, meta: grazieMeta },
  { path: "/404", Component: NotFound, meta: notFoundMeta, output: "404.html" },
  { path: "/reset-password", Component: ResetPassword, meta: { ...PRIVATE, title: "Reimposta password | Hypemove", description: "Reimposta la password del tuo account Hypemove." }, hydrate: true },
  { path: "/unsubscribe", Component: Unsubscribe, meta: { ...PRIVATE, title: "Disiscrizione email | Hypemove", description: "Gestisci la disiscrizione dalle email di Hypemove." }, hydrate: true },
  { path: "/open", Component: Open, meta: { ...PRIVATE, title: "Apri Hypemove", description: "Ti stiamo portando su Hypemove." }, hydrate: true },
];

export function render(pathname = "/") {
  const route = routes.find((item) => item.path === pathname) ?? routes.find((item) => item.path === "/404");
  const { Component, props = {} } = route;
  return renderToString(<Component {...props} />);
}
