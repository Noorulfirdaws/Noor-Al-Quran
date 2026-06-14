"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, ShieldCheck, BookOpen, Check, ArrowRight } from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuth, type Role } from "../context/AuthContext";

export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("user");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = signUp({ name, email, password, role });
    if (!res.ok) { setError(res.error); setBusy(false); return; }
    // Straight into the web app — no app download required.
    router.push("/quran");
  };

  return (
    <div className="min-h-screen bg-[#050907] text-white flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-md">
          <div className="text-center mb-7">
            <p className="text-[#57d996] text-[10px] font-bold tracking-widest uppercase mb-1">Get started — free</p>
            <h1 className="text-3xl font-black">Create your account</h1>
            <p className="text-white/45 text-sm mt-2">Use Noor-ul-Quran right here in your browser. No app download needed.</p>
          </div>

          <form onSubmit={submit} className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
            {/* Account type */}
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setRole("user")}
                className={`flex flex-col items-center gap-1 p-3 rounded-2xl border text-center transition-all ${role === "user" ? "border-[#57d996] bg-[#57d996]/10" : "border-white/10 hover:border-white/25"}`}>
                <BookOpen size={18} className={role === "user" ? "text-[#57d996]" : "text-white/50"} />
                <span className="text-xs font-bold">Free account</span>
                <span className="text-[10px] text-white/40">Read & recite</span>
              </button>
              <button type="button" onClick={() => setRole("admin")}
                className={`flex flex-col items-center gap-1 p-3 rounded-2xl border text-center transition-all ${role === "admin" ? "border-[#f7ca45] bg-[#f7ca45]/10" : "border-white/10 hover:border-white/25"}`}>
                <ShieldCheck size={18} className={role === "admin" ? "text-[#f7ca45]" : "text-white/50"} />
                <span className="text-xs font-bold">Super Admin</span>
                <span className="text-[10px] text-white/40">Everything unlocked</span>
              </button>
            </div>

            <Field icon={<User size={15} />} placeholder="Full name" value={name} onChange={setName} type="text" autoComplete="name" />
            <Field icon={<Mail size={15} />} placeholder="Email" value={email} onChange={setEmail} type="email" autoComplete="email" />
            <Field icon={<Lock size={15} />} placeholder="Password (min 6 characters)" value={password} onChange={setPassword} type="password" autoComplete="new-password" />

            {role === "admin" && (
              <p className="text-[11px] text-[#f7ca45]/80 flex items-start gap-1.5">
                <ShieldCheck size={13} className="mt-0.5 flex-shrink-0" />
                Super Admin unlocks all premium features (word-by-word, memorization, analytics, audio repeat) for free.
              </p>
            )}

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <button type="submit" disabled={busy}
              className="w-full flex items-center justify-center gap-2 bg-[#57d996] hover:bg-[#6ff2a8] text-black font-black py-3 rounded-full text-sm transition-all active:scale-[0.98] disabled:opacity-60">
              {busy ? "Creating…" : <>Start free <ArrowRight size={15} /></>}
            </button>

            <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center pt-1 text-[11px] text-white/40">
              <span className="flex items-center gap-1"><Check size={11} className="text-[#57d996]" /> No credit card</span>
              <span className="flex items-center gap-1"><Check size={11} className="text-[#57d996]" /> Works in the browser</span>
              <span className="flex items-center gap-1"><Check size={11} className="text-[#57d996]" /> Al-Fatiha free forever</span>
            </div>
          </form>

          <p className="text-center text-white/40 text-sm mt-5">
            Already have an account?{" "}
            <Link href="/login" className="text-[#57d996] font-bold hover:underline">Log in</Link>
          </p>
          <p className="text-center text-white/40 text-sm mt-2">
            Have a promo code?{" "}
            <Link href="/redeem" className="text-[#57d996] font-bold hover:underline">Redeem it</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ icon, placeholder, value, onChange, type, autoComplete }: {
  icon: React.ReactNode; placeholder: string; value: string;
  onChange: (v: string) => void; type: string; autoComplete?: string;
}) {
  return (
    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 focus-within:border-[#57d996]/50 transition-colors">
      <span className="text-white/30">{icon}</span>
      <input
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent py-3 text-sm text-white placeholder:text-white/25 focus:outline-none"
      />
    </div>
  );
}
