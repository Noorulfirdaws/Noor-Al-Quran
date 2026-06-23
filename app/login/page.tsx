"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight } from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setBusy(true);
    const res = await login({ email, password });
    if (!res.ok) { setError(res.error); setBusy(false); return; }
    router.push("/quran");
  };

  return (
    <div className="min-h-screen bg-[#050907] text-white flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-md">
          <div className="text-center mb-7">
            <p className="text-[#57d996] text-[10px] font-bold tracking-widest uppercase mb-1">Welcome back</p>
            <h1 className="text-3xl font-black">Log in</h1>
            <p className="text-white/45 text-sm mt-2">Pick up your memorization right where you left off.</p>
          </div>

          <form onSubmit={submit} className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 focus-within:border-[#57d996]/50 transition-colors">
              <Mail size={15} className="text-white/30" />
              <input type="email" autoComplete="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-transparent py-3 text-sm text-white placeholder:text-white/25 focus:outline-none" />
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 focus-within:border-[#57d996]/50 transition-colors">
              <Lock size={15} className="text-white/30" />
              <input type="password" autoComplete="current-password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="flex-1 bg-transparent py-3 text-sm text-white placeholder:text-white/25 focus:outline-none" />
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <button type="submit" disabled={busy}
              className="w-full flex items-center justify-center gap-2 bg-[#57d996] hover:bg-[#6ff2a8] text-black font-black py-3 rounded-full text-sm transition-all active:scale-[0.98] disabled:opacity-60">
              {busy ? "Logging in…" : <>Log in <ArrowRight size={15} /></>}
            </button>

            <div className="text-center">
              <Link href="/forgot-password" className="text-white/40 hover:text-white text-xs">Forgot your password?</Link>
            </div>
          </form>

          <p className="text-center text-white/40 text-sm mt-5">
            New here?{" "}
            <Link href="/signup" className="text-[#57d996] font-bold hover:underline">Create a free account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
