"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log to error monitoring service in production
    console.error("[Noor-ul-Quran Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#050907] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-14 h-14 mb-8">
        <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
          <circle cx="18" cy="18" r="16" stroke="#57d996" strokeWidth="1.5" opacity="0.4" />
          <path d="M18 6 C11.4 6 6 11.4 6 18 C6 24.6 11.4 30 18 30 C14 27 11 22.8 11 18 C11 13.2 14 9 18 6Z" fill="#57d996" opacity="0.9" />
          <circle cx="24" cy="11" r="2" fill="#f7ca45" opacity="0.95" />
        </svg>
      </div>

      <p className="text-red-400 text-sm font-bold tracking-widest uppercase mb-3">Something went wrong</p>
      <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
        Unexpected error
      </h1>
      <p className="text-gray-400 text-base max-w-sm mb-8">
        We caught an error and our team has been notified. Please try again or return home.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center bg-[#57d996] hover:bg-[#6ff2a8] text-black font-black px-8 py-4 rounded-full text-sm transition-all active:scale-95"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center border border-white/20 text-white hover:bg-white/5 font-semibold px-8 py-4 rounded-full text-sm transition-all"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
