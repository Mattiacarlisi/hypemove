import React from "react";
import { renderToString } from "react-dom/server";
import App from "./App.jsx";
import AppFitnessPrincipianti from "./pages/AppFitnessPrincipianti.jsx";
import Guide from "./pages/Guide.jsx";
import MiniWorkoutEfficaci from "./pages/MiniWorkoutEfficaci.jsx";
import Workout10MinutiCasa from "./pages/Workout10MinutiCasa.jsx";

export function render(pathname = "/") {
  const pages = {
    "/app-fitness-principianti": AppFitnessPrincipianti,
    "/guide": Guide,
    "/mini-workout-efficaci": MiniWorkoutEfficaci,
    "/workout-10-minuti-casa": Workout10MinutiCasa,
  };
  const Page = pages[pathname] ?? App;
  return renderToString(<Page />);
}
