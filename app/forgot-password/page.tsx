"use client";
import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, MailCheck } from "lucide-react";
import Navbar from "../components/Navbar";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setDevLink(data.devLink ?? null); // shown only in dev (no email provider yet)
      setSent(true);
    } catch { setSent(true); } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-[#050907] text-white flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-md">
          {sent ? (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#57d996]/15 border border-[#57d996]/30 flex items-center justify-center mx-auto mb-4">
                <MailCheck size={26} className="text-[#57d996]" />
              </div>
              <h1 className="text-2xl font-black mb-1">Check your email</h1>
              <p className="text-white/50 text-sm">
                If an account exists for <span className="text-white/80">{email}</span>, we&apos;ve sent a reset link. It expires in 1 hour.
              </p>
              {devLink && (
                <div className="mt-4 text-left bg-[#f7ca45]/8 border border-[#f7ca45]/20 rounded-xl p-3">
                  <p className="text-[10px] text-[#f7ca45] font-bold uppercase tracking-widest mb-1">Dev mode (no email provider yet)</p>
                  <a href={devLink} className="text-[#57d996] text-xs break-all hover:underline">{devLink}</a>
                </div>
              )}
              <Link href="/login" className="inline-block mt-6 text-white/50 hover:text-white text-sm">← Back to log in</Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-7">
                <p className="text-[#57d996] text-[10px] font-bold tracking-widest uppercase mb-1">Account recovery</p>
                <h1 className="text-3xl font-black">Forgot password</h1>
                <p className="text-white/45 text-sm mt-2">Enter your email and we&apos;ll send a link to reset it.</p>
              </div>
              <form onSubmit={submit} className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 focus-within:border-[#57d996]/50 transition-colors">
                  <Mail size={15} className="text-white/30" />
                  <input type="email" autoComplete="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    className="flex-1 bg-transparent py-3 text-sm text-white placeholder:text-white/25 focus:outline-none" />
                </div>
                <button type="submit" disabled={busy}
                  className="w-full flex items-center justify-center gap-2 bg-[#57d996] hover:bg-[#6ff2a8] text-black font-black py-3 rounded-full text-sm transition-all active:scale-[0.98] disabled:opacity-60">
                  {busy ? "Sending…" : <>Send reset link <ArrowRight size={15} /></>}
                </button>
              </form>
              <p className="text-center text-white/40 text-sm mt-5">
                Remembered it? <Link href="/login" className="text-[#57d996] font-bold hover:underline">Log in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
