"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { PremiumFeature } from "../types/quran";

const BYPASS_KEY = "noor_admin_premium";

// In production this would check a real subscription API.
// For now: localStorage bypass set by /admin page.

interface PremiumCtx {
  isPremium: boolean;
  isFeatureAllowed: (feature: PremiumFeature, surahNumber: number) => boolean;
  refreshPremium: () => void;
}

const PremiumContext = createContext<PremiumCtx>({
  isPremium: false,
  isFeatureAllowed: () => false,
  refreshPremium: () => {},
});

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);

  const check = () => {
    try {
      setIsPremium(localStorage.getItem(BYPASS_KEY) === "1");
    } catch {
      setIsPremium(false);
    }
  };

  useEffect(() => {
    check();
    // Re-check when tab regains focus (user may have unlocked in another tab)
    window.addEventListener("focus", check);
    return () => window.removeEventListener("focus", check);
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
    <PremiumContext.Provider value={{ isPremium, isFeatureAllowed, refreshPremium: check }}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  return useContext(PremiumContext);
}
