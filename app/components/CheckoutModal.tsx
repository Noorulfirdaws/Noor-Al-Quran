"use client";
import { useEffect, useState } from "react";
import { X, Check, Shield, Smartphone, Lock, AlertCircle } from "lucide-react";

interface Plan {
  id: string;                       // "free" | "premium" | "family"
  name: string;
  price: number;
  priceLabel: string;
  features: string[];
  interval?: "monthly" | "annual";  // which billing cadence the user picked
}

interface Props {
  plan: Plan;
  onClose: () => void;
}

/**
 * Free → sign up on the web / get the app.
 * Paid → real Stripe Checkout: we POST /api/checkout and redirect to Stripe's
 * hosted, PCI-compliant page (we never touch card data). Inert-safe: if Stripe
 * isn't configured yet the button explains that instead of erroring.
 */
export default function CheckoutModal({ plan, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isFree = plan.id === "free";

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  async function startCheckout() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: plan.id, interval: plan.interval ?? "annual" }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401 || data?.authRequired) {
        window.location.href = `/signup?next=${encodeURIComponent("/#pricing")}`;
        return;
      }
      if (data?.url) {
        window.location.href = data.url as string; // → Stripe Checkout
        return;
      }
      if (data?.configured === false) {
        setError("Online payments aren't live yet — please check back soon.");
      } else {
        setError(data?.error || "Couldn't start checkout. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={`Subscribe to ${plan.name}`}
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#050907] px-6 pt-6 pb-5 relative">
          <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
            <X size={20} />
          </button>
          <p className="text-[#57d996] text-xs font-bold tracking-widest uppercase mb-1">
            {isFree ? "Get started" : "Subscribe"}
          </p>
          <h2 className="text-white text-2xl font-black">{plan.name}</h2>
          <div className="flex items-end gap-1 mt-2">
            <span className="text-4xl font-black text-white">{isFree ? "Free" : `$${plan.price}`}</span>
            {!isFree && <span className="text-gray-400 text-sm mb-1">{plan.priceLabel}</span>}
          </div>
        </div>

        <div className="px-6 py-5">
          {/* Features */}
          <ul className="flex flex-col gap-2 mb-5">
            {plan.features.map((f, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm text-gray-700">
                <span className="w-5 h-5 rounded-full bg-[#57d996]/15 flex items-center justify-center flex-shrink-0">
                  <Check size={11} className="text-[#57d996]" strokeWidth={3} />
                </span>
                {f}
              </li>
            ))}
          </ul>

          {/* ── Free plan ── */}
          {isFree && (
            <div className="flex flex-col gap-3">
              <a href="/signup"
                className="flex items-center justify-center gap-2 bg-[#57d996] hover:bg-[#6ff2a8] text-black py-3.5 rounded-2xl font-black text-sm transition-colors active:scale-[0.98]">
                Start free on the web →
              </a>
              <p className="text-center text-gray-400 text-[11px] -mt-1">No download needed — use it right in your browser.</p>

              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-gray-400 text-[11px]">or get the app</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-[#050907] text-white py-3 rounded-2xl font-bold text-sm hover:bg-black transition-colors">
                <Smartphone size={16} /> Download on the App Store
              </a>
              <a href="https://play.google.com" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 border-2 border-[#050907] text-[#050907] py-3 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-colors">
                <Smartphone size={16} /> Get it on Google Play
              </a>
            </div>
          )}

          {/* ── Paid plan → Stripe Checkout ── */}
          {!isFree && (
            <div className="flex flex-col gap-3">
              {error && (
                <p className="flex items-start gap-1.5 text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  <AlertCircle size={14} className="mt-0.5 flex-shrink-0" /> {error}
                </p>
              )}
              <button
                onClick={startCheckout}
                disabled={loading}
                className="w-full bg-[#57d996] hover:bg-[#6ff2a8] disabled:opacity-60 text-black font-black py-3.5 rounded-2xl text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Redirecting…
                  </>
                ) : (
                  <>
                    <Lock size={14} /> Continue to secure checkout
                  </>
                )}
              </button>
              <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
                <Shield size={11} />
                Powered by Stripe · Cancel anytime · No hidden fees
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
