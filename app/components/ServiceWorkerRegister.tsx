"use client";

import { useEffect } from "react";

/**
 * Enregistre le Service Worker pour le mode hors-ligne (PWA).
 * Sans réseau, l'app et le Coran restent accessibles (cache local).
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // enregistrement impossible (ex. mode privé) — sans incidence
      });
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
