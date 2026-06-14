"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";

/**
 * Shared shell for static informational pages (legal, support, "coming soon").
 * Keeps Navbar + Footer consistent and gives every page a real destination so
 * footer links no longer dead-end at "#".
 */
export default function InfoPage({
  eyebrow,
  title,
  subtitle,
  updated,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#050907] text-white flex flex-col">
      <Navbar />

      {/* Hero */}
      <div className="pt-24 pb-8 px-4 sm:px-6 border-b border-white/10">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white text-xs mb-5 transition-colors"
          >
            <ArrowLeft size={13} /> Back to home
          </Link>
          {eyebrow && (
            <p className="text-[#57d996] text-[10px] font-bold tracking-widest uppercase mb-2">{eyebrow}</p>
          )}
          <h1 className="text-3xl sm:text-4xl font-black leading-tight">{title}</h1>
          {subtitle && <p className="text-white/50 text-base mt-3 max-w-2xl leading-relaxed">{subtitle}</p>}
          {updated && <p className="text-white/25 text-xs mt-4">Last updated: {updated}</p>}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-4 sm:px-6 py-10">
        <div className="max-w-3xl mx-auto prose-invert space-y-5 text-white/70 text-[15px] leading-relaxed">
          {children}
        </div>
      </div>

      <Footer />
    </div>
  );
}

/** Section heading used inside InfoPage bodies. */
export function InfoH2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-white font-black text-xl mt-8 mb-2">{children}</h2>;
}
