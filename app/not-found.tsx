import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050907] flex flex-col items-center justify-center px-4 text-center">
      {/* Logo */}
      <div className="w-14 h-14 mb-8">
        <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
          <circle cx="18" cy="18" r="16" stroke="#57d996" strokeWidth="1.5" opacity="0.4" />
          <path d="M18 6 C11.4 6 6 11.4 6 18 C6 24.6 11.4 30 18 30 C14 27 11 22.8 11 18 C11 13.2 14 9 18 6Z" fill="#57d996" opacity="0.9" />
          <circle cx="24" cy="11" r="2" fill="#f7ca45" opacity="0.95" />
        </svg>
      </div>

      <p className="text-[#57d996] text-sm font-bold tracking-widest uppercase mb-3">404</p>
      <h1 className="text-5xl sm:text-7xl font-black text-white leading-none mb-4">
        Page not found
      </h1>
      <p className="text-gray-400 text-lg max-w-md mb-10">
        This page doesn't exist or has been moved. Let's get you back on track.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center bg-[#57d996] hover:bg-[#6ff2a8] text-black font-black px-8 py-4 rounded-full text-sm transition-all active:scale-95"
        >
          ← Back to Home
        </Link>
        <Link
          href="/blog"
          className="inline-flex items-center justify-center border border-white/20 text-white hover:bg-white/5 font-semibold px-8 py-4 rounded-full text-sm transition-all"
        >
          Browse the Blog
        </Link>
      </div>

      {/* Decorative Arabic numeral */}
      <div className="mt-16 text-[120px] font-black leading-none select-none opacity-5 text-white">
        ٤٠٤
      </div>
    </div>
  );
}
