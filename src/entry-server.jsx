import React from "react";
import { renderToString } from "react-dom/server";
import App from "./App.jsx";
import AppFitnessPrincipianti from "./pages/AppFitnessPrincipianti.jsx";

export function render(pathname = "/") {
  const Page = pathname === "/app-fitness-principianti" ? AppFitnessPrincipianti : App;
  return renderToString(<Page />);
}
