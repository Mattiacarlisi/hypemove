import React, { Suspense, lazy } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
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
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>
);

const shouldHydrate =
  rootElement.hasChildNodes() &&
  (window.location.pathname === "/" || window.location.pathname === "/index.html");

if (shouldHydrate) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
