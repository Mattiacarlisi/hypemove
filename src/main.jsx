import React from "react";
import { hydrateRoot, createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ResetPassword from "./pages/ResetPassword.jsx";
import Unsubscribe from "./pages/Unsubscribe.jsx";
import Open from "./pages/Open.jsx";
import "./index.css";

// Questo bundle viene caricato SOLO dalle pagine che hanno bisogno di JavaScript
// (reset password, disiscrizione, redirect /open). Le pagine pubbliche sono HTML statico
// generato da scripts/prerender.mjs e non lo includono.
// Niente lazy(): un componente che "sospende" durante l'idratazione fa buttare via
// l'HTML pre-generato (errori React 418/423) e la pagina lampeggia.
const rootElement = document.getElementById("root");
const app = (
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/unsubscribe" element={<Unsubscribe />} />
        <Route path="/open" element={<Open />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
