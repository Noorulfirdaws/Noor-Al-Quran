"use client";
import { useEffect, useState, useRef } from "react";
import { X, Check, Shield, Smartphone, CreditCard, Lock, AlertCircle } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  features: string[];
}

interface Props {
  plan: Plan;
  onClose: () => void;
}

/* ── Sanitize: strip any HTML tags from user input ── */
function sanitize(val: string): string {
  return val.replace(/[<>"'`]/g, "");
}

/* ── Validators ── */
function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Enter a valid email address.";
}
function validateName(v: string) {
  return v.trim().length >= 2 ? "" : "Name must be at least 2 characters.";
}
function validateCard(v: string) {
  const digits = v.replace(/\s/g, "");
  return /^\d{16}$/.test(digits) ? "" : "Enter a valid 16-digit card number.";
}
function validateExpiry(v: string) {
  if (!/^\d{2}\/\d{2}$/.test(v)) return "Format: MM/YY";
  const [mm, yy] = v.split("/").map(Number);
  if (mm < 1 || mm > 12) return "Invalid month.";
  const now = new Date();
  const exp = new Date(2000 + yy, mm - 1);
  return exp > now ? "" : "Card has expired.";
}
function validateCvv(v: string) {
  return /^\d{3,4}$/.test(v) ? "" : "CVV must be 3–4 digits.";
}

/* ── Format helpers ── */
function fmtCard(v: string) {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}
function fmtExpiry(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

type Step = "details" | "success";

export default function CheckoutModal({ plan, onClose }: Props) {
  const [step, setStep] = useState<Step>("details");
  const [fields, setFields] = useState({ name: "", email: "", card: "", expiry: "", cvv: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const isFree = plan.id === "free";

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    setTimeout(() => firstInputRef.current?.focus(), 100);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  function set(field: string, raw: string) {
    let val = sanitize(raw);
    if (field === "card") val = fmtCard(val);
    if (field === "expiry") val = fmtExpiry(val);
    if (field === "cvv") val = val.replace(/\D/g, "").slice(0, 4);
    setFields((f) => ({ ...f, [field]: val }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  }

  function validate() {
    const e: Record<string, string> = {
      name: validateName(fields.name),
      email: validateEmail(fields.email),
      card: validateCard(fields.card),
      expiry: validateExpiry(fields.expiry),
      cvv: validateCvv(fields.cvv),
    };
    setErrors(e);
    return !Object.values(e).some(Boolean);
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    /* TODO: replace with real Stripe PaymentIntent call
       const res = await fetch("/api/checkout", { method: "POST", ... }) */
    await new Promise((r) => setTimeout(r, 1400));
    setLoading(false);
    setStep("success");
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

      <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in">
        {/* Header */}
        <div className="bg-[#050907] px-6 pt-6 pb-5">
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
          {/* Features list */}
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
              <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-[#050907] text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-black transition-colors">
                <Smartphone size={16} /> Download on the App Store
              </a>
              <a href="https://play.google.com" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 border-2 border-[#050907] text-[#050907] py-3.5 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-colors">
                <Smartphone size={16} /> Get it on Google Play
              </a>
            </div>
          )}

          {/* ── Paid plan — success ── */}
          {!isFree && step === "success" && (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-[#57d996] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#57d996]/30">
                <Check size={26} className="text-black" strokeWidth={3} />
              </div>
              <h3 className="text-xl font-black text-[#050505] mb-1">You're all set!</h3>
              <p className="text-gray-500 text-sm mb-5">Welcome to {plan.name}. Check your email for confirmation.</p>
              <button onClick={onClose} className="bg-[#57d996] hover:bg-[#6ff2a8] text-black font-bold px-8 py-3 rounded-full text-sm transition-all">
                Start memorizing →
              </button>
            </div>
          )}

          {/* ── Paid plan — checkout form ── */}
          {!isFree && step === "details" && (
            <form onSubmit={submit} noValidate className="flex flex-col gap-3">

              {/* Name */}
              <Field label="Full name" error={errors.name}>
                <input
                  ref={firstInputRef}
                  type="text"
                  autoComplete="name"
                  placeholder="Sarah Al-Rashid"
                  value={fields.name}
                  onChange={(e) => set("name", e.target.value)}
                  maxLength={80}
                  className={inputCls(errors.name)}
                />
              </Field>

              {/* Email */}
              <Field label="Email" error={errors.email}>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="sarah@example.com"
                  value={fields.email}
                  onChange={(e) => set("email", e.target.value)}
                  maxLength={120}
                  className={inputCls(errors.email)}
                />
              </Field>

              {/* Card number */}
              <Field label="Card number" error={errors.card} icon={<CreditCard size={15} className="text-gray-400" />}>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="1234 5678 9012 3456"
                  value={fields.card}
                  onChange={(e) => set("card", e.target.value)}
                  className={inputCls(errors.card)}
                />
              </Field>

              {/* Expiry + CVV */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Expiry" error={errors.expiry}>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    placeholder="MM/YY"
                    value={fields.expiry}
                    onChange={(e) => set("expiry", e.target.value)}
                    maxLength={5}
                    className={inputCls(errors.expiry)}
                  />
                </Field>
                <Field label="CVV" error={errors.cvv} icon={<Lock size={13} className="text-gray-400" />}>
                  <input
                    type="password"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    placeholder="•••"
                    value={fields.cvv}
                    onChange={(e) => set("cvv", e.target.value)}
                    maxLength={4}
                    className={inputCls(errors.cvv)}
                  />
                </Field>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#57d996] hover:bg-[#6ff2a8] disabled:opacity-60 text-black font-black py-3.5 rounded-2xl text-sm transition-all active:scale-[0.98] mt-1 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>
                    <Lock size={14} />
                    Pay ${plan.price} securely
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5 mt-1">
                <Shield size={11} />
                256-bit SSL · Cancel anytime · No hidden fees
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function inputCls(err?: string) {
  return `w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-[#57d996]/40 ${
    err ? "border-red-400 bg-red-50 focus:border-red-400" : "border-gray-200 bg-white focus:border-[#57d996]"
  }`;
}

function Field({ label, error, icon, children }: { label: string; error?: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 mb-1">{label}</label>
      <div className="relative">
        {children}
        {icon && <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">{icon}</span>}
      </div>
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}
