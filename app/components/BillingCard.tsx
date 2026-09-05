"use client";
import { useState } from "react";
import Link from "next/link";
import { CreditCard, ExternalLink, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

/**
 * Dashboard billing card. For paid users it opens the Stripe Customer Portal
 * (cancel / change plan / update card / invoices). For free users it points to
 * pricing. Degrades quietly when Stripe isn't configured yet.
 */
export default function BillingCard() {
  const { isAuthed, plan } = useAuth();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (!isAuthed) return null;

  const isPaid = plan === "premium" || plan === "family";
  const planLabel = plan === "family" ? "Family" : plan === "premium" ? "Premium" : "Free";

  async function openPortal() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.configured === false) setMsg("Billing isn't live yet — please check back soon.");
      else if (data.noSubscription) setMsg("No active subscription found on your account.");
      else setMsg(data.error || "Couldn't open billing. Please try again.");
    } catch {
      setMsg("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white/5 border border-white/8 rounded-2xl p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-[#57d996]/15 flex items-center justify-center">
          <CreditCard size={14} className="text-[#57d996]" />
        </div>
        <div>
          <p className="text-white font-bold text-sm">Subscription</p>
          <p className="text-white/35 text-xs">Manage your plan and billing</p>
        </div>
        <span
          className={`ml-auto text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
            isPaid ? "text-[#57d996] bg-[#57d996]/10" : "text-white/50 bg-white/8"
          }`}
        >
          {planLabel}
        </span>
      </div>

      {isPaid ? (
        <>
          <p className="text-white/50 text-xs leading-relaxed mb-4">
            You&apos;re on the <span className="text-white font-semibold">{planLabel}</span> plan. Cancel, change plan,
            update your card, or download invoices in the secure billing portal.
          </p>
          <button
            onClick={openPortal}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-white/8 border border-white/10 text-white font-bold px-5 py-2.5 rounded-full text-sm hover:bg-white/12 transition-all disabled:opacity-60"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <ExternalLink size={15} />}
            Manage subscription
          </button>
        </>
      ) : (
        <>
          <p className="text-white/50 text-xs leading-relaxed mb-4">
            You&apos;re on the <span className="text-white font-semibold">Free</span> plan. Upgrade for unlimited AI
            recitation feedback and premium content — with a 14-day money-back guarantee.
          </p>
          <Link
            href="/#pricing"
            className="inline-flex items-center gap-2 bg-[#57d996] text-black font-black px-5 py-2.5 rounded-full text-sm hover:bg-[#6ff2a8] transition-all"
          >
            View plans <ArrowRight size={15} />
          </Link>
        </>
      )}

      {msg && <p className="text-yellow-400/80 text-xs mt-3">{msg}</p>}
    </div>
  );
}
