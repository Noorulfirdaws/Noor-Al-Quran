"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { PremiumFeature } from "../types/quran";
import { getActivePromo, promoDaysLeft } from "../services/promoService";

const BYPASS_KEY = "noor_admin_premium";
const FAMILY_KEY = "noor_family_plan"; // set when a Family plan is active

// ⚠️ CLIENT-SIDE GATING ONLY (demo-grade) — not a security boundary.
// Real enforcement needs a backend + auth + subscription API. This derives the
// plan from localStorage: admin/Family flag → "family", an unexpired promo →
// "premium", otherwise "free".

export type Plan = "free" | "premium" | "family";
export type ContentTier = "basic" | "premium" | "family";

interface PremiumCtx {
  isPremium: boolean;          // premium OR family
  plan: Plan;
  promoLabel: string | null;   // active promo name, if access is via a code
  promoDaysLeft: number;       // whole days left on the promo (0 if none)
  isFeatureAllowed: (feature: PremiumFeature, surahNumber: number) => boolean;
  /** Can the current plan access content of the given tier? */
  canAccess: (tier: ContentTier) => boolean;
  refreshPremium: () => void;
}

const PremiumContext = createContext<PremiumCtx>({
  isPremium: false,
  plan: "free",
  promoLabel: null,
  promoDaysLeft: 0,
  isFeatureAllowed: () => false,
  canAccess: () => false,
  refreshPremium: () => {},
});

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [plan, setPlan] = useState<Plan>("free");
  const [promoLabel, setPromoLabel] = useState<string | null>(null);
  const [daysLeft, setDaysLeft] = useState(0);

  const check = () => {
    try {
      const admin = localStorage.getItem(BYPASS_KEY) === "1";
      const family = localStorage.getItem(FAMILY_KEY) === "1";
      const promo = getActivePromo();
      const p: Plan = admin || family ? "family" : promo ? "premium" : "free";
      setPlan(p);
      setIsPremium(p !== "free");
      setPromoLabel(promo ? promo.label : null);
      setDaysLeft(promo ? promoDaysLeft() : 0);
    } catch {
      setPlan("free");
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

  // Content access matrix: basic = everyone, premium = Premium+Family, family = Family only.
  function canAccess(tier: ContentTier): boolean {
    if (tier === "basic") return true;
    if (tier === "premium") return plan === "premium" || plan === "family";
    return plan === "family"; // family-only
  }

  return (
    <PremiumContext.Provider value={{ isPremium, plan, promoLabel, promoDaysLeft: daysLeft, isFeatureAllowed, canAccess, refreshPremium: check }}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  return useContext(PremiumContext);
}
