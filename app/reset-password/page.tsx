"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ArrowRight, AlertTriangle } from "lucide-react";
import Navbar from "../components/Navbar";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050907]" />}>
      <ResetInner />
    </Suspense>
  );
}

function ResetInner() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Could not reset your password."); setBusy(false); return; }
      // Reset succeeds + logs you in — go straight into the app.
      router.push("/quran");
      router.refresh();
    } catch { setError("Network error. Please try again."); setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-[#050907] text-white flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-md">
          {!token ? (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
              <AlertTriangle size={26} className="text-yellow-400 mx-auto mb-3" />
              <h1 className="text-xl font-black mb-1">Invalid reset link</h1>
              <p className="text-white/50 text-sm mb-5">This link is missing its token. Request a new one.</p>
              <Link href="/forgot-password" className="text-[#57d996] font-bold text-sm hover:underline">Request a new link →</Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-7">
                <p className="text-[#57d996] text-[10px] font-bold tracking-widest uppercase mb-1">Account recovery</p>
                <h1 className="text-3xl font-black">Set a new password</h1>
                <p className="text-white/45 text-sm mt-2">Choose a new password for your account.</p>
              </div>
              <form onSubmit={submit} className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 focus-within:border-[#57d996]/50 transition-colors">
                  <Lock size={15} className="text-white/30" />
                  <input type="password" autoComplete="new-password" placeholder="New password (min 8 characters)" value={password} onChange={(e) => setPassword(e.target.value)}
                    className="flex-1 bg-transparent py-3 text-sm text-white placeholder:text-white/25 focus:outline-none" />
                </div>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 focus-within:border-[#57d996]/50 transition-colors">
                  <Lock size={15} className="text-white/30" />
                  <input type="password" autoComplete="new-password" placeholder="Confirm new password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                    className="flex-1 bg-transparent py-3 text-sm text-white placeholder:text-white/25 focus:outline-none" />
                </div>
                {error && <p className="text-red-400 text-xs">{error}</p>}
                <button type="submit" disabled={busy}
                  className="w-full flex items-center justify-center gap-2 bg-[#57d996] hover:bg-[#6ff2a8] text-black font-black py-3 rounded-full text-sm transition-all active:scale-[0.98] disabled:opacity-60">
                  {busy ? "Updating…" : <>Reset password <ArrowRight size={15} /></>}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
