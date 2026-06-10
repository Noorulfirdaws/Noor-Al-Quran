"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle, Mic, BarChart2, Calendar, Target, ShieldCheck, ExternalLink, ChevronRight } from "lucide-react";

const BYPASS_KEY = "noor_admin_premium";

const PREMIUM_FEATURES = [
  { icon: <Mic size={20} />, title: "Mistake Detection", desc: "AI listens word-by-word and flags incorrect, missed, or skipped words in real time.", status: "live", href: "/demo" },
  { icon: <Calendar size={20} />, title: "Memorization Planning", desc: "Custom daily schedules built around your pace and Quran goals.", status: "live", href: null },
  { icon: <Target size={20} />, title: "Goal Tracking", desc: "Set hifz goals and visualize progress day by day.", status: "live", href: null },
  { icon: <BarChart2 size={20} />, title: "Advanced Analytics", desc: "Session history, streak calendar, accuracy trends.", status: "live", href: null },
];

function CheckoutPreview() {
  const [step, setStep] = useState<"idle" | "form" | "success">("idle");
  const [plan, setPlan] = useState("Premium — $7/mo");
  const [bypassActive, setBypassActive] = useState(false);

  useEffect(() => {
    setBypassActive(localStorage.getItem(BYPASS_KEY) === "1");
  }, [step]);

  const grantBypass = () => {
    localStorage.setItem(BYPASS_KEY, "1");
    setBypassActive(true);
    setStep("success");
  };

  if (step === "success") {
    return (
      <div className="bg-[#0d2b1a] border border-[#57d996]/30 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-[#57d996]/20 border-2 border-[#57d996] flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={28} className="text-[#57d996]" />
        </div>
        <h3 className="text-white font-black text-xl mb-2">Premium Access Granted</h3>
        <p className="text-white/50 text-sm mb-1">Plan: <span className="text-white font-semibold">{plan}</span></p>
        <p className="text-white/30 text-xs mb-2">Admin bypass active — no real charge. Persisted in browser storage.</p>
        <div className="flex gap-3 justify-center mt-6">
          <Link
            href="/demo"
            className="bg-[#57d996] hover:bg-[#6ff2a8] text-black font-black px-6 py-2.5 rounded-full text-sm transition-all flex items-center gap-2"
          >
            <Mic size={14} /> Test Demo Now
          </Link>
          <button
            onClick={() => { localStorage.removeItem(BYPASS_KEY); setStep("idle"); setBypassActive(false); }}
            className="bg-white/10 hover:bg-white/20 text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all"
          >
            Revoke Access
          </button>
        </div>
      </div>
    );
  }

  if (step === "form") {
    return (
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-4">
        <h3 className="text-white font-black">Checkout Preview — <span className="text-[#57d996]">{plan}</span></h3>
        <p className="text-white/40 text-xs">Admin bypass — no real payment processed</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Full name", placeholder: "Noor Admin", type: "text" },
            { label: "Email", placeholder: "admin@noor-ul-quran.com", type: "email" },
            { label: "Card number", placeholder: "4242 4242 4242 4242", type: "text" },
            { label: "Expiry / CVV", placeholder: "12/28  •  123", type: "text" },
          ].map((f) => (
            <div key={f.label} className="col-span-2 sm:col-span-1">
              <label className="text-white/50 text-xs block mb-1">{f.label}</label>
              <input
                type={f.type}
                placeholder={f.placeholder}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#57d996]/50"
              />
            </div>
          ))}
        </div>
        <button
          onClick={grantBypass}
          className="w-full bg-[#57d996] hover:bg-[#6ff2a8] text-black font-black py-3 rounded-xl text-sm transition-all active:scale-[0.98]"
        >
          Complete Purchase (Admin Bypass)
        </button>
        <button onClick={() => setStep("idle")} className="w-full text-white/30 text-xs hover:text-white/60 transition-colors">
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {["Premium — $7/mo", "Premium — $5/mo (annual)", "Family Plan — $14/mo"].map((p) => (
        <div key={p} className="flex items-center justify-between bg-white/5 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 cursor-pointer transition-all group"
          onClick={() => { setPlan(p); setStep("form"); }}>
          <span className="text-white text-sm font-semibold">{p}</span>
          <ChevronRight size={14} className="text-white/30 group-hover:text-white/60 transition-colors" />
        </div>
      ))}
    </div>
  );
}

export default function AdminPage() {
  const [bypassActive, setBypassActive] = useState(false);

  useEffect(() => {
    setBypassActive(localStorage.getItem(BYPASS_KEY) === "1");
  }, []);

  return (
    <div className="min-h-screen bg-[#050907] text-white">

      {/* Admin banner */}
      <div className="bg-[#f7ca45] text-black px-4 py-2 flex items-center justify-center gap-2 text-xs font-black tracking-wider">
        <ShieldCheck size={14} />
        ADMIN PREVIEW MODE — Internal use only. Not visible to users.
        {bypassActive && (
          <span className="ml-3 bg-black/20 px-2 py-0.5 rounded-full text-[10px]">● PREMIUM BYPASS ACTIVE</span>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-black mb-2">Noor-ul-Quran Admin</h1>
          <p className="text-white/40 text-sm">Internal preview dashboard · All premium features unlocked</p>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Live Demo", href: "/demo", accent: "#57d996" },
            { label: "Homepage", href: "/", accent: "#18c8d8" },
            { label: "Blog", href: "/blog", accent: "#a78bfa" },
            { label: "Pricing", href: "/#pricing", accent: "#f97316" },
          ].map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="flex items-center justify-between bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl px-4 py-3 transition-all group"
            >
              <span className="text-white font-bold text-sm">{l.label}</span>
              <ExternalLink size={13} className="text-white/30 group-hover:text-white/60 transition-colors" />
            </Link>
          ))}
        </div>

        {/* AI Demo section */}
        <div>
          <h2 className="text-xl font-black mb-1 text-[#57d996]">AI Recitation Demo</h2>
          <p className="text-white/40 text-sm mb-4">
            The demo at <code className="bg-white/10 px-1.5 py-0.5 rounded text-white/70 text-xs">/demo</code> is fully free — no payment needed.
            When you click the green mic button, your <strong className="text-white">browser will ask for microphone permission</strong> — this is normal.
            Click <strong className="text-white">Allow</strong> to start the AI detection.
          </p>
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 bg-[#57d996] hover:bg-[#6ff2a8] text-black font-black px-6 py-3 rounded-full text-sm transition-all active:scale-95"
          >
            <Mic size={16} /> Open Live AI Demo
          </Link>
        </div>

        {/* Premium features status */}
        <div>
          <h2 className="text-xl font-black mb-4">Premium Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PREMIUM_FEATURES.map((f) => (
              <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#57d996]/15 flex items-center justify-center text-[#57d996] flex-shrink-0">
                  {f.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-black text-sm">{f.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#57d996]/20 text-[#57d996] font-bold uppercase tracking-wide">{f.status}</span>
                  </div>
                  <p className="text-white/40 text-xs leading-relaxed">{f.desc}</p>
                  {f.href && (
                    <Link href={f.href} className="text-[#57d996] text-xs font-bold mt-2 inline-flex items-center gap-1 hover:underline">
                      Test it <ExternalLink size={10} />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Checkout bypass */}
        <div>
          <h2 className="text-xl font-black mb-1">Checkout Flow Test</h2>
          <p className="text-white/40 text-sm mb-4">Test the full payment form and success screen without a real charge.</p>
          <CheckoutPreview />
        </div>

      </div>
    </div>
  );
}
