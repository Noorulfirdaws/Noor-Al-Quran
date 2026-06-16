"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { PremiumFeature } from "../types/quran";
import { getActivePromo, promoDaysLeft } from "../services/promoService";

const BYPASS_KEY = "noor_admin_premium";

// In production this would check a real subscription API.
// For now: localStorage — admin bypass OR an unexpired promo/lead-magnet code.

interface PremiumCtx {
  isPremium: boolean;
  promoLabel: string | null;   // active promo name, if access is via a code
  promoDaysLeft: number;       // whole days left on the promo (0 if none)
  isFeatureAllowed: (feature: PremiumFeature, surahNumber: number) => boolean;
  refreshPremium: () => void;
}

const PremiumContext = createContext<PremiumCtx>({
  isPremium: false,
  promoLabel: null,
  promoDaysLeft: 0,
  isFeatureAllowed: () => false,
  refreshPremium: () => {},
});

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [promoLabel, setPromoLabel] = useState<string | null>(null);
  const [daysLeft, setDaysLeft] = useState(0);

  const check = () => {
    try {
      const admin = localStorage.getItem(BYPASS_KEY) === "1";
      const promo = getActivePromo();
      setIsPremium(admin || !!promo);
      setPromoLabel(promo ? promo.label : null);
      setDaysLeft(promo ? promoDaysLeft() : 0);
    } catch {
      setIsPremium(false);
      setPromoLabel(null);
      setDaysLeft(0);
    }
  };

  useEffect(() => {
    check();
    // Re-check on focus, hourly (promo expiry), and whenever auth changes premium
    // status (login / logout / session restore) — so admins never see an upsell.
    window.addEventListener("focus", check);
    window.addEventListener("noor-premium-changed", check);
    const id = setInterval(check, 60 * 60 * 1000);
    return () => {
      window.removeEventListener("focus", check);
      window.removeEventListener("noor-premium-changed", check);
      clearInterval(id);
    };
  }, []);

  /**
   * Surah 1 (Al-Fatiha) is always fully free.
   * For Surahs 2–114, certain features require premium.
   */
  function isFeatureAllowed(feature: PremiumFeature, surahNumber: number): boolean {
    if (surahNumber === 1) return true;   // Al-Fatiha always free
    if (isPremium) return true;
    // Basic reading is always free
    if (feature === "word-by-word") return false;
    if (feature === "memorization") return false;
    if (feature === "audio-repeat") return false;
    if (feature === "audio-range") return false;
    if (feature === "analytics") return false;
    return true;
  }

  return (
    <PremiumContext.Provider value={{ isPremium, promoLabel, promoDaysLeft: daysLeft, isFeatureAllowed, refreshPremium: check }}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  return useContext(PremiumContext);
}
