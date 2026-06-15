"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { loadGamification, levelFromXp } from "../services/gamificationService";
import { getGoal, goalProgress } from "../services/goalService";
import {
  buildCertificate, decodeCertificate, certificateUrl, type Certificate,
} from "../services/certificateService";
import { Printer, Share2, Check, Mic, ArrowLeft, Award } from "lucide-react";

export default function CertificatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050907]" />}>
      <CertificateInner />
    </Suspense>
  );
}

function CertificateInner() {
  const params = useSearchParams();
  const { user } = useAuth();
  const [cert, setCert] = useState<Certificate | null>(null);
  const [shared, setShared] = useState(false);
  const [name, setName] = useState("");
  const [eligible, setEligible] = useState<{ title: string; detail: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const d = params.get("d");
    if (d) {
      const c = decodeCertificate(d);
      if (c) { setCert(c); setShared(true); return; }
    }
    setName(user?.name ?? "");
    // Determine what the user is eligible to certify.
    const goal = getGoal();
    if (goal) {
      const gp = goalProgress(goal);
      if (gp.percent >= 100) {
        setEligible({ title: `Memorized ${goal.title}`, detail: `${goal.totalAyahs} ayahs completed` });
        return;
      }
    }
    const g = loadGamification();
    if (g.totalSessions > 0) {
      setEligible({ title: "Hifz Journey Progress", detail: `${g.totalSessions} sessions · ${g.longestStreak}-day best streak` });
    }
  }, [params, user]);

  const generate = () => {
    if (!eligible) return;
    const g = loadGamification();
    setCert(buildCertificate({
      name: name || user?.name || "Student",
      title: eligible.title,
      detail: eligible.detail,
      date: Date.now(),
      level: levelFromXp(g.totalXp),
    }));
  };

  const copyLink = async () => {
    if (!cert) return;
    try { await navigator.clipboard.writeText(certificateUrl(cert)); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };

  return (
    <div className="min-h-screen bg-[#050907] text-white print:bg-white">
      <div className="print:hidden"><Navbar /></div>
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-20 print:pt-4">

        {shared && (
          <div className="print:hidden mb-4">
            <Link href="/" className="inline-flex items-center gap-1.5 text-white/40 hover:text-white text-sm"><ArrowLeft size={14} /> Noor-ul-Quran</Link>
          </div>
        )}

        {!cert && !shared && (
          <div className="print:hidden">
            <p className="text-[#f7ca45] text-[11px] font-bold tracking-widest uppercase mb-1">Certificate</p>
            <h1 className="text-3xl font-black">Your Certificate</h1>
            {eligible ? (
              <>
                <p className="text-white/40 text-sm mt-1">You&apos;ve earned a certificate for: <span className="text-[#57d996] font-bold">{eligible.title}</span></p>
                <div className="mt-5 bg-white/5 border border-white/8 rounded-2xl p-5">
                  <label className="text-white/50 text-xs">Name on certificate</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
                    className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#f7ca45]/50" />
                  <button onClick={generate} className="mt-3 w-full bg-[#f7ca45] text-black font-black py-3 rounded-full text-sm hover:bg-[#ffd95e] transition-all">
                    Generate certificate
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-5 bg-white/5 border border-white/8 rounded-2xl p-6 text-center">
                <Award size={36} className="text-white/20 mx-auto mb-3" />
                <p className="text-white/50 text-sm">Complete a recitation or finish a goal to earn your first certificate.</p>
                <Link href="/quran/1" className="inline-flex items-center gap-2 mt-4 bg-[#57d996] text-black font-black px-5 py-2.5 rounded-full text-sm hover:bg-[#6ff2a8] transition-all">
                  <Mic size={14} /> Start reciting
                </Link>
              </div>
            )}
          </div>
        )}

        {cert && (
          <>
            {!shared && (
              <div className="print:hidden flex gap-2 mb-5">
                <button onClick={copyLink} className="flex items-center gap-2 bg-white/8 border border-white/10 hover:bg-white/12 px-4 py-2.5 rounded-full text-sm font-bold transition-all">
                  {copied ? <><Check size={14} className="text-[#57d996]" /> Copied</> : <><Share2 size={14} /> Copy share link</>}
                </button>
                <button onClick={() => window.print()} className="flex items-center gap-2 bg-white/8 border border-white/10 hover:bg-white/12 px-4 py-2.5 rounded-full text-sm font-bold transition-all">
                  <Printer size={14} /> Print / PDF
                </button>
              </div>
            )}
            <CertificateArt cert={cert} />
            {shared && (
              <div className="print:hidden mt-6 text-center">
                <p className="text-white/40 text-sm mb-3">Begin your own Hifz journey with a personal AI teacher.</p>
                <Link href="/signup" className="inline-flex items-center gap-2 bg-[#57d996] text-black font-black px-6 py-3 rounded-full text-sm hover:bg-[#6ff2a8] transition-all">
                  <Mic size={15} /> Start free
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function CertificateArt({ cert }: { cert: Certificate }) {
  return (
    <div className="relative bg-gradient-to-br from-[#0a1510] to-[#0d1a12] print:bg-white border-2 border-[#f7ca45]/40 print:border-[#bfa030] rounded-2xl p-1 print:rounded-none">
      {/* Inner gold frame */}
      <div className="border border-[#f7ca45]/25 print:border-[#bfa030] rounded-xl px-8 py-12 text-center relative overflow-hidden">

        {/* Decorative corner pattern (SVG) */}
        <svg className="absolute top-0 left-0 w-24 h-24 opacity-20 print:opacity-30" viewBox="0 0 100 100" fill="none">
          <path d="M0 0 L100 0 L0 100 Z" fill="#f7ca45" opacity="0.15" />
          <circle cx="20" cy="20" r="12" stroke="#f7ca45" strokeWidth="1" fill="none" />
        </svg>
        <svg className="absolute bottom-0 right-0 w-24 h-24 opacity-20 print:opacity-30 rotate-180" viewBox="0 0 100 100" fill="none">
          <path d="M0 0 L100 0 L0 100 Z" fill="#f7ca45" opacity="0.15" />
          <circle cx="20" cy="20" r="12" stroke="#f7ca45" strokeWidth="1" fill="none" />
        </svg>

        {/* Crescent emblem */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full border-2 border-[#f7ca45]/50 flex items-center justify-center">
            <Award size={30} className="text-[#f7ca45]" />
          </div>
        </div>

        <p className="text-[#57d996] print:text-green-700 text-[11px] font-bold tracking-[0.3em] uppercase">Noor-ul-Quran</p>
        <p className="text-white/40 print:text-gray-500 text-xs tracking-widest uppercase mt-1">Certificate of Achievement</p>

        <p className="text-white/50 print:text-gray-600 text-sm mt-8">This certifies that</p>
        <h2 className="text-3xl sm:text-4xl font-black text-white print:text-black mt-2 mb-2"
          style={{ fontFamily: "var(--font-amiri), serif" }}>{cert.name}</h2>

        <p className="text-white/50 print:text-gray-600 text-sm">has successfully achieved</p>
        <p className="text-xl font-black text-[#f7ca45] print:text-[#bfa030] mt-2">{cert.title}</p>
        <p className="text-white/45 print:text-gray-500 text-sm mt-1">{cert.detail}</p>

        {/* Arabic blessing */}
        <p className="text-2xl text-white/70 print:text-gray-700 mt-6" dir="rtl" style={{ fontFamily: "var(--font-quran), var(--font-amiri), serif" }}>
          بَارَكَ ٱللَّٰهُ فِيكَ
        </p>
        <p className="text-white/30 print:text-gray-400 text-[10px] italic mt-0.5">May Allah bless you</p>

        {/* Footer: date + verification */}
        <div className="flex items-center justify-between mt-10 pt-4 border-t border-white/10 print:border-gray-200 text-left">
          <div>
            <p className="text-white/30 print:text-gray-400 text-[9px] uppercase tracking-wider">Issued</p>
            <p className="text-white/60 print:text-gray-700 text-xs font-bold">{new Date(cert.date).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
          <div className="text-center">
            <p className="text-white/30 print:text-gray-400 text-[9px] uppercase tracking-wider">Level</p>
            <p className="text-[#57d996] print:text-green-700 text-lg font-black">{cert.level}</p>
          </div>
          <div className="text-right">
            <p className="text-white/30 print:text-gray-400 text-[9px] uppercase tracking-wider">Verify ID</p>
            <p className="text-white/60 print:text-gray-700 text-xs font-mono">{cert.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
