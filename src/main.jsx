import React, { Suspense, lazy } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import AllenamentoACasa from "./pages/AllenamentoACasa.jsx";
import AppFitnessPrincipianti from "./pages/AppFitnessPrincipianti.jsx";
import CostanzaAllenamento from "./pages/CostanzaAllenamento.jsx";
import Guide from "./pages/Guide.jsx";
import MiniWorkoutEfficaci from "./pages/MiniWorkoutEfficaci.jsx";
import Workout10MinutiCasa from "./pages/Workout10MinutiCasa.jsx";
import "./index.css";

const ResetPassword = lazy(() => import("./pages/ResetPassword.jsx"));

function RouteFallback() {
  return <div className="min-h-screen bg-white" aria-hidden="true" />;
}

const rootElement = document.getElementById("root");
const app = (
  <React.StrictMode>
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/app-fitness-principianti" element={<AppFitnessPrincipianti />} />
          <Route path="/come-essere-costanti-nell-allenamento" element={<CostanzaAllenamento />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/mini-workout-efficaci" element={<MiniWorkoutEfficaci />} />
          <Route path="/workout-10-minuti-casa" element={<Workout10MinutiCasa />} />
          <Route path="/allenamento-a-casa" element={<AllenamentoACasa />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>
);

const shouldHydrate =
  rootElement.hasChildNodes();

if (shouldHydrate) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
