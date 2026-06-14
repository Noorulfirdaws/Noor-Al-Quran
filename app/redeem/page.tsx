"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Gift, Check, ArrowRight, Ticket } from "lucide-react";
import Navbar from "../components/Navbar";
import { redeemCode } from "../services/promoService";

export default function RedeemPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050907]" />}>
      <RedeemInner />
    </Suspense>
  );
}

function RedeemInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ label: string; until: number } | null>(null);

  // Allow pre-filling via /redeem?code=XXXX (shareable promo links)
  useEffect(() => {
    const c = params.get("code");
    if (c) setCode(c);
  }, [params]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = redeemCode(code);
    if (!res.ok) { setError(res.error); return; }
    setSuccess({ label: res.promo.label, until: res.promo.until });
  };

  return (
    <div className="min-h-screen bg-[#050907] text-white flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-md">
          {success ? (
            <div className="bg-white/5 border border-[#57d996]/30 rounded-3xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[#57d996]/15 border-2 border-[#57d996] flex items-center justify-center mx-auto mb-4">
                <Check size={28} className="text-[#57d996]" />
              </div>
              <h1 className="text-2xl font-black mb-1">Code redeemed! 🎉</h1>
              <p className="text-white/55 text-sm mb-1">
                <span className="text-[#57d996] font-bold">{success.label}</span> — premium unlocked.
              </p>
              <p className="text-white/35 text-xs mb-6">
                Access valid until {new Date(success.until).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}.
              </p>
              <button onClick={() => router.push("/quran")}
                className="inline-flex items-center gap-2 bg-[#57d996] hover:bg-[#6ff2a8] text-black font-black px-6 py-3 rounded-full text-sm transition-all active:scale-95">
                Open the Quran <ArrowRight size={15} />
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-7">
                <div className="w-14 h-14 rounded-2xl bg-[#57d996]/15 flex items-center justify-center mx-auto mb-3">
                  <Gift size={26} className="text-[#57d996]" />
                </div>
                <h1 className="text-3xl font-black">Redeem a promo code</h1>
                <p className="text-white/45 text-sm mt-2">Got a code from a promotion or gift? Unlock free premium access.</p>
              </div>

              <form onSubmit={submit} className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 focus-within:border-[#57d996]/50 transition-colors">
                  <Ticket size={16} className="text-white/30" />
                  <input
                    type="text"
                    placeholder="Enter your code (e.g. WELCOME7)"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="flex-1 bg-transparent py-3 text-sm text-white placeholder:text-white/25 focus:outline-none tracking-wide uppercase"
                  />
                </div>
                {error && <p className="text-red-400 text-xs">{error}</p>}
                <button type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-[#57d996] hover:bg-[#6ff2a8] text-black font-black py-3 rounded-full text-sm transition-all active:scale-[0.98]">
                  Redeem <ArrowRight size={15} />
                </button>
              </form>

              <p className="text-center text-white/40 text-sm mt-5">
                No code?{" "}
                <Link href="/signup" className="text-[#57d996] font-bold hover:underline">Start free</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
